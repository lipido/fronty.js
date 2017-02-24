describe('Component', () => {
  beforeEach( () => {
    var fixture = '<div id="fixture"><div id="componentId"></div></div>';

    document.body.insertAdjacentHTML(
      'afterbegin',
      fixture);
  });

  // remove the html fixture from the DOM
  afterEach(function() {
    document.body.removeChild(document.getElementById('fixture'));
  });

  it('should render a nested component', () => {
    var parent = new Component(Handlebars.compile('<div id="childId"></div>'), [], 'componentId');
    var child = new Component(Handlebars.compile('childContent'), [], 'childId');

    parent.start();

    expect(document.getElementById('childId').innerHTML).toBe('');
    
    parent.addChildComponent(child); // child renders when added to the parent
    
    expect(document.getElementById('childId').innerHTML).toBe('childContent');
    
  });
  
  it('should not replace its childs when it is updating', () => {
    var parentModel = new Model('parent model');
    
    var parent = new Component(Handlebars.compile('<div id="childId"></div>'), parentModel, 'componentId');
    var child = new Component(Handlebars.compile('childContent'), [], 'childId');
    
    parent.addChildComponent(child);
    
    parent.start();
    
    var childRootNode = document.getElementById('childId');
    
    parentModel.set(() => {}); // this will fire an update
    
    expect(document.getElementById('childId').innerHTML).toBe('childContent');
    expect(document.getElementById('childId')).toBe(childRootNode);
    
  });
  
  it('should not touch child contents when parent contents change', () => {
    var parentModel = new Model('parent model');
    parentModel.items = [{value:'foo'}];
    var parent = new Component(Handlebars.compile('{{#each items}}<li class="item">value</li>{{/each}}<div id="childId"></div>'), parentModel, 'componentId');
    var child = new Component(Handlebars.compile('childContent'), [], 'childId');
    
    parent.addChildComponent(child);
    parent.start();
    
    expect(document.getElementsByClassName('item').length).toBe(1);
    expect(document.getElementById('childId').innerHTML).toBe('childContent');
    
    var childRootNode = document.getElementById('childId');
    
    parentModel.set(() => { parentModel.items.push({value:'bar'})});
    expect(document.getElementsByClassName('item').length).toBe(2);
    expect(document.getElementById('childId').innerHTML).toBe('childContent');
    expect(document.getElementById('childId')).toBe(childRootNode);
    
  });
});
