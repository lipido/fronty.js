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

  it('should add simple click listeners', () => {
    var component = new Fronty.Component(() => '<div><button id="greetings">Click Me</button></div>', 'componentId');

    var clicked = false;
    component.addEventListener('click', '#greetings', () => {
      clicked = true;
    });
    
    component.start();
    document.getElementById('greetings').click();
    expect(clicked).toBe(true);

  });
  
  it('should add simple click listeners on children', () => {
    var component = new Fronty.Component( () => '<div><div id="child"></div></div>', 'componentId');
    var child = new Fronty.Component(() => '<div><button id="greetings">Click Me</button></div>', 'child');
    component.addChildComponent(child);

    var clicked = false;
    child.addEventListener('click', '#greetings', () => {
      clicked = true;
    });
    
    component.start();
    
    document.getElementById('greetings').click();
    expect(clicked).toBe(true);

  });

  it('should add simple click listeners on no-leaf nodes', () => {
    var component = new Fronty.Component( () => '<div><div id="child"></div></div>', 'componentId');
    var child = new Fronty.Component(() => '<div><a id="greetings"><img id="leafNode" src=""></img></a></div>', 'child');
    component.addChildComponent(child);

    var clicked = false;
    child.addEventListener('click', '#greetings', () => {
      clicked = true;
    });
    
    component.start();
    
    document.getElementById('leafNode').click();
    expect(clicked).toBe(true);
  });

});
