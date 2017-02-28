class ChildComponent extends Component {
  constructor(id) {
    super(() => '<div id="'+id+'">'+id+'</div>', id);
  }
}

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

  

  it('should allow child tags', () => {
    

    var realRenderer = () => '<div id="componentId"><ChildComponent id="child-0"></ChildComponent></div>'
    var renderer = () => realRenderer()
    
    var parent = new Component(
      renderer,
      'componentId', ['ChildComponent'] //tags that generate childs
    );

    parent.createChildComponent = (tagName, childTagElement, id) => {
      if (tagName === 'ChildComponent') {
        return new Component(() =>'<div id="'+id+'">foo</div>', id);
      }
    };

    parent.start();
    expect(document.getElementById('child-0').innerHTML).toBe('foo');
    expect(parent.getChildComponents().length).toBe(1);

    var realRenderer = () => '<div id="componentId"></div>'
    parent.render();
    
    expect(parent.getChildComponents().length).toBe(0);
    
    
    var realRenderer = () => '<div id="componentId"><ChildComponent id="child-0"></ChildComponent></div>'
    parent.render();
    
    expect(parent.getChildComponents().length).toBe(1);

    var realRenderer = () => '<div id="componentId"><ChildComponent id="child-0"></ChildComponent><ChildComponent id="child-1"></ChildComponent></div>'
    parent.render();

    expect(parent.getChildComponents().length).toBe(2);
  });
  
  

  it('should autodetect child component classes on child tags', () => {
    var realRenderer = () => '<div id="componentId"><ChildComponent id="child-0"></ChildComponent><ChildComponent id="child-1"></ChildComponent></div>'
    var renderer = () => realRenderer()

    //ChildComponent class is defined in global scope (see start of this file)
    var parent = new Component(
      renderer,
      'componentId', ['ChildComponent'] //tags that generate childs
    );

    parent.start();
    
    expect(document.getElementById('child-0').innerHTML).toBe('child-0');
    expect(document.getElementById('child-1').innerHTML).toBe('child-1');
    expect(parent.getChildComponents().length).toBe(2);

    realRenderer = () => '<div id="componentId"></div>'

    parent.render();
    
    expect(parent.getChildComponents().length).toBe(0);
  });

});
