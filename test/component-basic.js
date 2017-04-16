describe('Component', () => {
  
  function stripComments(html) {
    return html.replace(/<!--.*-->/g, '');
  }
  
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

  it('should render a static template', () => {//
    var component = new Component(() => '<table id="componentId"><tr><td>Hello World</td></tr></table>', 'componentId');

    component.start();

    expect(document.getElementById('componentId').textContent).toBe('Hello World');

  });
  
  it('should render a static template via direct-DOM rendering', () => {//
    var component = new Component(() => {
      var table = document.createElement('table');
      table.id = 'componentId';
      table.appendChild(document.createElement('tr'));
      table.firstChild.appendChild(document.createElement('td'));
      table.firstChild.firstChild.appendChild(document.createTextNode('Hello World'));
      return table;
      
    }, 'componentId');

    component.start();
    
    expect(document.getElementById('componentId').textContent).toBe('Hello World');

  });
  it('should render a static comment', () => {
    var component = new Component(() => '<p id="componentId"><!-- Hello World --></p>', 'componentId');

    component.start();

    expect(document.getElementById('componentId').innerHTML).toBe('<!-- Hello World -->');

  });
    
  it('should render on dirty content', () => {
    document.getElementById('componentId').innerHTML = '<p>dirty<!-- fronty-text-node: 1--></p>';
    var component = new Component(() => '<div><p>Hello World</p></div>', 'componentId');

    component.start();

    expect(document.getElementById('componentId').textContent).toBe('Hello World');
    
    component.stop();
    
    document.getElementById('componentId').innerHTML = '<p>New dirty content</p>';
    
    component.start();
    expect(document.getElementById('componentId').textContent).toBe('Hello World');

  });
  
  it('should trim templates', () => {
    var component = new Component(() => ' <p>Hello World</p> ', 'componentId');

    component.start();

    expect(document.getElementById('componentId')).not.toBe(null);

  });

  it('should update a single change on re-render', () => {
    
    var realRenderer = () => '<div><p id="greetings">foo</p></div>';
    var renderer = () => realRenderer();
    var component = new Component(renderer, 'componentId');
    
    component.start();
    
    realRenderer = () => '<div><p id="greetings">bar</p></div>';
    
    component.render();
    
    expect(document.getElementById('greetings').textContent).toBe('bar');
  });

  it('should update a comment change on re-render', () => {
    
    var realRenderer = () => '<div><p id="greetings"><!-- foo --></p></div>';
    var renderer = () => realRenderer();
    var component = new Component(renderer, 'componentId');
    
    component.start();

    expect(document.getElementById('greetings').innerHTML).toBe('<!-- foo -->');
    
    realRenderer = () => '<div><p id="greetings"><!-- bar --></p></div>';
    
    component.render();

    expect(document.getElementById('greetings').innerHTML).toBe('<!-- bar -->');
  });
  
  it('should remove nodes after re-render', () => {
    var realRenderer = () => '<div id="componentId">hi!</div>';
    var renderer = () => realRenderer();
    
    var component = new Component(renderer, 'componentId');

    component.start();
    
    expect(document.getElementById('componentId').textContent).toBe('hi!');

    realRenderer = () => '<div id="componentId"></div>';
    
    component.render();
    
    expect(document.getElementById('componentId').childNodes.length).toBe(0);
  });
  
  it ('should update a simple text on re-render TWICE', () => {
    var realRenderer = () => '<div id="componentId">Foo</div>';
    var renderer = () => realRenderer();
    
    var component = new Component(renderer, 'componentId');

    component.start();

    var afterHtml = '<div id="componentId">Bar</div>';
    
    realRenderer = () => afterHtml;
    
    component.render();
    
    expect(document.getElementById('componentId').textContent).toBe('Bar');
    
    afterHtml = '<div id="componentId">Foo</div>';
    
    realRenderer = () => afterHtml;
    
    component.render();
    
    expect(document.getElementById('componentId').textContent).toBe('Foo');
    
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
    
  });

  it ('should update a simple list on re-render TWICE', () => {
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
    
    afterHtml = '<div id="componentId">'+
    ' <p key="item-1" class="item">item-1</p> '+
    ' <p key="item-2" class="item">item-2</p> '+
    ' <p key="item-3" class="item">item-3</p> '+
    ' <p key="item-4" class="item">item-4</p> '+
    ' <p key="item-5" class="item">item-5</p> '+
    '</div>';
    realRenderer = () => afterHtml;
    
    component.render();
    
    expect(document.getElementsByClassName('item').length).toBe(5);
  });

  it ('should update a attributes and more than once', () => {
    var realRenderer = () => '<div id="componentId">'+
    ' <p class="enabled">item-1</p> '+
    '</div>';
    var renderer = () => realRenderer();
    
    var component = new Component(renderer, 'componentId');

    component.start();
    
    expect(document.getElementsByClassName('enabled').length).toBe(1);
    
    var afterHtml = '<div id="componentId">'+
    ' <p class="disabled">item-1</p> '+
    '</div>';
    realRenderer = () => afterHtml;
    
    component.render();
    
    expect(document.getElementsByClassName('disabled').length).toBe(1);
    
    afterHtml = '<div id="componentId">'+
    ' <p class="enabled">item-1</p> '+
    '</div>';
    
    realRenderer = () => afterHtml;
    
    component.render();
    
    expect(document.getElementsByClassName('enabled').length).toBe(1);
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

  
  it('should not touch unaffected children in a changed, but key-based, list of nodes', () => {
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
  
  it('should not touch swapped children in a key-based list of nodes', () => {
    var realRenderer = () => '<div id="componentId">'+
    ' <p key="item-1" class="item">item-1</p> '+
    ' <p key="item-2" class="item">item-2</p> '+
    '</div>';
    var renderer = () => realRenderer();
    
    var component = new Component(renderer, 'componentId');

    //
    component.start();
    
    var item1Node = document.getElementsByClassName('item')[0];
    var item2Node = document.getElementsByClassName('item')[1];
    expect(item2Node).not.toBe(undefined);
    
    var afterHtml = '<div id="componentId">'+
    ' <p key="item-2" class="item">item-2</p> '+
    ' <p key="item-1" class="item">item-1</p> '+
    '</div>';
    realRenderer = () => afterHtml;
    
    component.render();

    // do not touch
    expect(document.getElementsByClassName('item')[0]).toBe(item2Node);
    expect(document.getElementsByClassName('item')[1]).toBe(item1Node);
    
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
    expect(stripComments(document.getElementById('componentId').innerHTML)).toBe('<li key="1"></li><p>Hello</p><li key="3"></li>');  
    realRenderer = () => {
       return '<div><li key="0"></li><p>Bye</p><li key="1"></li></div>';
    };
    
    component.render();
    expect(stripComments(document.getElementById('componentId').innerHTML)).toBe('<li key="0"></li><p>Bye</p><li key="1"></li>');  
   
    realRenderer = () => {
       return '<div><li key="0"></li><p>Bar</p><li key="1"></li></div>';
    };
    
    component.render();
    expect(stripComments(document.getElementById('componentId').innerHTML)).toBe('<li key="0"></li><p>Bar</p><li key="1"></li>');  
      
  });
  
});
