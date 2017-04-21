describe('Component', () => {
  beforeEach(() => {
    var fixture = '<div id="fixture"><div id="componentId"></div></div>';

    document.body.insertAdjacentHTML(
      'afterbegin',
      fixture);
  });

  // remove the html fixture from the DOM
  afterEach(function() {
    document.body.removeChild(document.getElementById('fixture'));
  });

  it('should render child components', () => {
    var parent = new Fronty.Component( () => '<div id="componentId"><p id="childId"></p></div>', 'componentId');
    var child = new Fronty.Component( () => '<div id="childId">child!</div>', 'childId');
    
    parent.addChildComponent(child);
    
    parent.start();
    
    expect(document.getElementById('childId').textContent).toBe('child!');
  });
  
  it('should allow child components of TR, TD, TH type', () => {
    var parent = new Fronty.Component( () => '<div id="componentId"><table><tr id="childId"></tr><tr><th id="childId2"></th></tr><tr><td id="childId3"></td></tr></table></div>', 'componentId');
    var child2 = new Fronty.Component( () => '<tr id="childId"><td>Hello!</td></tr>', 'childId');
    var child = new Fronty.Component( () => '<td id="childId2">Hello2!</td>', 'childId2');    
    var child3 = new Fronty.Component( () => '<td id="childId3"></td>', 'childId3');
    
    
    parent.addChildComponent(child);
    parent.addChildComponent(child2);
    parent.addChildComponent(child3);
    
    parent.start();

    expect(document.getElementById('childId').textContent).toBe('Hello!');
    expect(document.getElementById('childId2').textContent).toBe('Hello2!');
    expect(document.getElementById('childId3').textContent).toBe('');
  });
  
  it('should allow to not indicate the id in the root elem of the template', () => {
    var realRenderer = () => '<div><p id="greetings">foo</p></div>';
    var renderer = () => realRenderer();
    
    var component = new Fronty.Component( renderer, 'componentId');

    component.start();
    realRenderer = () => '<div><p id="greetings">bar</p></div>';
    
    component.render();

    expect(document.getElementById('greetings').textContent).toBe('bar');
    expect(document.getElementById('componentId')).not.toBe(null);
  });
  
  it('should render child components without adding id in the template', () => {
    var parent = new Fronty.Component(() => '<div id="componentId"><p id="childId"></p></div>', 'componentId');
    var child = new Fronty.Component(() => '<div>child!</div>','childId');
    
    parent.addChildComponent(child);
    
    parent.start();
    //
    expect(document.getElementById('childId').textContent).toBe('child!');
  });

  
  it('should not touch child components on parent update', () => {
    var realRenderer = () => '<div id="componentId"><p id="modelvalue">foo</p><div id="childId"></div></div>';
    var renderer = () => realRenderer();
    
    var parent = new Fronty.Component(renderer, 'componentId');
    var child = new Fronty.Component(() => '<div id="childId">child!</div>', 'childId');
    
    parent.addChildComponent(child);
    
    parent.start();
    
    expect(document.getElementById('modelvalue').textContent).toBe('foo');
    expect(document.getElementById('childId').textContent).toBe('child!');
    
    var childRoot = document.getElementById('childId');
    
    realRenderer = () => '<div id="componentId"><p id="modelvalue">bar</p><div id="childId"></div></div>';
    
    parent.render();
    
    expect(childRoot).toBe(document.getElementById('childId'));
    expect(document.getElementById('modelvalue').textContent).toBe('bar');

  });
  //
  it('should allow to move child components on parent', () => {
    var realRenderer = () => '<div id="componentId"><p id="modelvalue">foo</p><div id="childId"></div></div>';
    var renderer = () => realRenderer();
    
    var parent = new Fronty.Component(renderer, 'componentId');
    var child = new Fronty.Component(() => '<div id="childId">child!</div>', 'childId');
    
    parent.addChildComponent(child);
    
    parent.start();
    
    expect(document.getElementById('modelvalue').textContent).toBe('foo');
    expect(document.getElementById('childId').textContent).toBe('child!');
    
    realRenderer = () => '<div id="componentId"><div id="childId"></div></div>';
    
    parent.render();
    
    expect(document.getElementById('childId').textContent).toBe('child!');
    
  });
  
  it('should allow to swap child components on parent', () => {
    var realRenderer = () => '<div id="componentId"><div id="childId1"></div><div id="childId2"></div></div>';
    var renderer = () => realRenderer();
    
    var parent = new Fronty.Component(renderer, 'componentId');
    var child = new Fronty.Component(() => '<div id="childId">child!</div>', 'childId1');
    var child2 = new Fronty.Component(() => '<div id="childId2">child 2!</div>', 'childId2');
    
    parent.addChildComponent(child);
    parent.addChildComponent(child2);
    
    parent.start();
    
    expect(document.getElementById('childId1').textContent).toBe('child!');
    expect(document.getElementById('childId2').textContent).toBe('child 2!');
    
    realRenderer = () => '<div id="componentId"><div id="childId2"></div><div id="childId1"></div></div></div>';
    
    parent.render();
    
    expect(document.getElementById('childId1').textContent).toBe('child!');
    expect(document.getElementById('childId2').textContent).toBe('child 2!');
    
  });
  
  
  it('should not touch child nodes or parent re-render', () => {
    var realRenderer = () => '<div id="componentId"><div id="childId1"></div></div>';
    var renderer = () => realRenderer();
    
    var parent = new Fronty.Component(renderer, 'componentId');
    var child = new Fronty.Component(() => '<div id="childId">child!</div>', 'childId1');
    
    parent.addChildComponent(child);
    
    parent.start();
    
    expect(document.getElementById('childId1').textContent).toBe('child!');
    
    
    realRenderer = () => '<div id="componentId"><div id="childId1" class="dummy"></div></div>';
    
    parent.render();
    
    expect(document.getElementById('childId1').textContent).toBe('child!');
    expect(document.getElementById('childId1').classList.length).toBe(0);
    
  });
});
