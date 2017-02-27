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
    var parent = new Component(Handlebars.compile('<div id="componentId"><p id="childId"></p></div>'), [], 'componentId');
    var child = new Component(Handlebars.compile('<div id="childId">child!</div>'), [], 'childId');
    
    parent.addChildComponent(child);
    
    parent.start();
    
    expect(document.getElementById('childId').innerHTML).toBe('child!');

  });
  
  it('should render child components without adding id in the template', () => {
    var parent = new Component(Handlebars.compile('<div id="componentId"><p id="childId"></p></div>'), [], 'componentId');
    var child = new Component(Handlebars.compile('<div>child!</div>'), [], 'childId');
    
    parent.addChildComponent(child);
    
    parent.start();
    
    expect(document.getElementById('childId').innerHTML).toBe('child!');

  });

  
  it('should not touch child components on parent update', () => {
    var modelForParent = new Model('parentModel');
    modelForParent.value = 'foo';
    var parent = new Component(Handlebars.compile('<div id="componentId"><p id="modelvalue">{{value}}</p><div id="childId"></div></div>'), modelForParent, 'componentId');
    var child = new Component(Handlebars.compile('<div id="childId">child!</div>'), [], 'childId');
    
    parent.addChildComponent(child);
    
    parent.start();
    
    expect(document.getElementById('modelvalue').innerHTML).toBe('foo');
    expect(document.getElementById('childId').innerHTML).toBe('child!');
    
    var childRoot = document.getElementById('childId');
    modelForParent.set(() => { modelForParent.value = 'bar'});
    
    expect(childRoot).toBe(document.getElementById('childId'));
    expect(document.getElementById('modelvalue').innerHTML).toBe('bar');

  });
});
