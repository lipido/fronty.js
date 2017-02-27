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

  it('should be add simple click listeners', () => {
    var component = new Component(Handlebars.compile('<div><button id="greetings">Click Me</button></div>'), [], 'componentId');

    var clicked = false;
    component.addEventListener('click', '#greetings', () => {
      clicked = true;
    });
    
    component.start();
    document.getElementById('greetings').click();
    expect(clicked).toBe(true);

  });
  
  it('should be add simple click listeners on children', () => {
    var component = new Component(Handlebars.compile('<div><div id="child"></div></div>'), [], 'componentId');
    var child = new Component(Handlebars.compile('<div><button id="greetings">Click Me</button></div>'), [], 'child');
    component.addChildComponent(child);

    var clicked = false;
    child.addEventListener('click', '#greetings', () => {
      clicked = true;
    });
    
    component.start();
    
    document.getElementById('greetings').click();
    expect(clicked).toBe(true);

  });
});
