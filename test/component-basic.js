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

  it('should render a static template', () => {
    var component = new Component(() => '<p id="greetings">Hello World</p>', 'componentId');

    component.start();

    expect(document.getElementById('greetings')).not.toBe(null);

  });
  
  it('should trim templates', () => {
    var component = new Component(() => ' <p id="greetings">Hello World</p> ', 'componentId');

    component.start();

    expect(document.getElementById('greetings')).not.toBe(null);

  });

  it('should update a single change on re-render', () => {
    
    var realRenderer = () => '<div><p id="greetings">foo</p></div>';
    var renderer = () => realRenderer();
    var component = new Component(renderer, 'componentId');
    
    component.start();
    
    realRenderer = () => '<div><p id="greetings">bar</p></div>';
    
    component.render();
    
    expect(document.getElementById('greetings').innerHTML).toBe('bar');
  });

  
  it('should remove nodes after re-render', () => {
    var realRenderer = () => '<div id="componentId">hi!</div>';
    var renderer = () => realRenderer();
    
    var component = new Component(renderer, 'componentId');

    component.start();
    
    expect(document.getElementById('componentId').childNodes.length).toBe(1);

    realRenderer = () => '<div id="componentId"></div>';
    
    component.render();
    
    expect(document.getElementById('componentId').childNodes.length).toBe(0);


  });

  it ('should update a simple list on re-render', () => {
    var realRenderer = () => '<div id="componentId">'+
    ' <p key="item-1" class="item">item-1</p> '+
    ' <p key="item-2" class="item">item-2</p> '+
    ' <p key="item-4" class="item">item-4</p> '+
    '</div>';
    var renderer = () => realRenderer();
    
    var component = new Component(renderer, 'componentId');

    component.start();

    var afterHtml = '<div id="componentId">'+
    ' <p key="item-1" class="item">item-1</p> '+
    ' <p key="item-2" class="item">item-2</p> '+
    ' <p key="item-3" class="item">item-3</p> '+
    ' <p key="item-4" class="item">item-4</p> '+
    '</div>';
    realRenderer = () => afterHtml;
    
    component.render();
    
    expect(document.getElementsByClassName('item').length).toBe(4);
    
    expect(document.getElementById('fixture').innerHTML).toBe(afterHtml);
  });
  
  it('should not touch subtrees if siblings are added', () => {

    var realRenderer = () => '<div id="componentId">'+
    '<p id="donottouch">Do not touch</p><p class="item">foo</p>'+
    '</div>';
    var renderer = () => realRenderer();
    
    var component = new Component(renderer, 'componentId');

    component.start();

    var shouldNotBeTouched1 = document.getElementById('donottouch');
    var shouldNotBeTouched2 = document.getElementsByClassName('item')[0];
    expect(document.getElementsByClassName('item').length).toBe(1);

    realRenderer = () => '<div id="componentId">'+
    '<p id="donottouch">Do not touch</p><p class="item">foo</p>'+
    '<p>Do not touch</p><p class="item">bar</p>'+
    '</div>';
    
    component.render();
    
    //item was added
    expect(document.getElementsByClassName('item').length).toBe(2);

    //but the previous sibling is not touched
    expect(shouldNotBeTouched1).toBe(document.getElementById('donottouch'));
    expect(shouldNotBeTouched2).toBe(document.getElementsByClassName('item')[0]);
  });

  it('should not touch unaffected childrens in a changed, but key-based, list of nodes', () => {
    var realRenderer = () => '<div id="componentId">'+
    ' <p key="item-1" class="item">item-1</p> '+
    ' <p key="item-2" class="item">item-2</p> '+
    ' <p key="item-4" class="item">item-4</p> '+
    '</div>';
    var renderer = () => realRenderer();
    
    var component = new Component(renderer, 'componentId');

    component.start();
    var item4Node = document.getElementsByClassName('item')[2]; //item-4
    expect(item4Node).not.toBe(undefined);
    
    var afterHtml = '<div id="componentId">'+
    ' <p key="item-1" class="item">item-1</p> '+
    ' <p key="item-2" class="item">item-2</p> '+
    ' <p key="item-3" class="item">item-3</p> '+
    ' <p key="item-4" class="item">item-4</p> '+
    '</div>';
    realRenderer = () => afterHtml;
    
    component.render();
    
    // do not touch
    expect(document.getElementsByClassName('item')[3]).toBe(item4Node);
  });
  
  it('should not touch unaffected children when removing an element in a key-based list of nodes', () => {
    var realRenderer = () => '<div id="componentId">'+
    ' <p key="item-1" class="item">item-1</p> '+
    ' <p key="item-2" class="item">item-2</p> '+
    ' <p key="item-4" class="item">item-4</p> '+
    '</div>';
    var renderer = () => realRenderer();
    
    var component = new Component(renderer, 'componentId');

    component.start();
    var item4Node = document.getElementsByClassName('item')[2]; //item-4
    
    var afterHtml = '<div id="componentId">'+
    ' <p key="item-1" class="item">item-1</p> '+
    ' <p key="item-2" class="item">item-2</p> '+
    ' <p key="item-4" class="item">item-4</p> '+
    '</div>';
    realRenderer = () => afterHtml;
    
    component.render();
    
    // do not touch
    expect(document.getElementsByClassName('item')[2]).toBe(item4Node);
  });
  
  it('should work well with mixed key and non-key elements', () => {
    var realRenderer = () => {
        return '<div><li key="1"></li><p>Hello</p><li key="3"></li></div>';
    };
    
    var renderer = () => {
      return realRenderer();
    };
    
    var component = new Component(renderer, 'componentId');
    
    component.start();
    expect(document.getElementById('componentId').innerHTML).toBe('<li key="1"></li><p>Hello</p><li key="3"></li>');  
    realRenderer = () => {
       return '<div><li key="0"></li><p>Bye</p><li key="1"></li></div>';
    };
    
    component.render();
    expect(document.getElementById('componentId').innerHTML).toBe('<li key="0"></li><p>Bye</p><li key="1"></li>');  
   
    realRenderer = () => {
       return '<div><li key="0"></li><p>Bar</p><li key="1"></li></div>';
    };
    
    component.render();
    expect(document.getElementById('componentId').innerHTML).toBe('<li key="0"></li><p>Bar</p><li key="1"></li>');  
      
  });
  
});
