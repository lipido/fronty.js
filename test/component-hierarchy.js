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
    var parent = new Component(() => '<div id="componentId"><p id="childId"></p></div>', 'componentId');
    var child = new Component( () => '<div id="childId">child!</div>', 'childId');
    
    parent.addChildComponent(child);
    
    parent.start();
    
    expect(document.getElementById('childId').textContent).toBe('child!');
  });
  
  it('should allow to not indicate the id in the root elem of the template', () => {
    var realRenderer = () => '<div><p id="greetings">foo</p></div>';
    var renderer = () => realRenderer();
    
    var component = new Component( renderer, 'componentId');

    component.start();
    realRenderer = () => '<div><p id="greetings">bar</p></div>';
    
    component.render();

    expect(document.getElementById('greetings').textContent).toBe('bar');
    expect(document.getElementById('componentId')).not.toBe(null);
  });
  
  it('should render child components without adding id in the template', () => {
    var parent = new Component(() => '<div id="componentId"><p id="childId"></p></div>', 'componentId');
    var child = new Component(() => '<div>child!</div>','childId');
    
    parent.addChildComponent(child);
    
    parent.start();
    //
    expect(document.getElementById('childId').textContent).toBe('child!');
  });

  
  it('should not touch child components on parent update', () => {
    var realRenderer = () => '<div id="componentId"><p id="modelvalue">foo</p><div id="childId"></div></div>';
    var renderer = () => realRenderer();
    
    var parent = new Component(renderer, 'componentId');
    var child = new Component(() => '<div id="childId">child!</div>', 'childId');
    
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
    
    var parent = new Component(renderer, 'componentId');
    var child = new Component(() => '<div id="childId">child!</div>', 'childId');
    
    parent.addChildComponent(child);
    
    parent.start();
    
    expect(document.getElementById('modelvalue').textContent).toBe('foo');
    expect(document.getElementById('childId').textContent).toBe('child!');
    
    realRenderer = () => '<div id="componentId"><div id="childId"></div></div>';
    
    parent.render();
    
    expect(document.getElementById('childId').textContent).toBe('child!');
    
  });  
});
