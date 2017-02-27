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
    var component = new Component(Handlebars.compile('<p id="greetings">Hello World</p>'), [], 'componentId');

    component.start();

    expect(document.getElementById('greetings')).not.toBe(null);

  });
  it('should trim templates', () => {
    var component = new Component(Handlebars.compile(' <p id="greetings">Hello World</p> '), [], 'componentId');

    component.start();

    expect(document.getElementById('greetings')).not.toBe(null);

  });
  it('should render a single model value', () => {
    var model = new Model();
    model.value = 'foo';

    var component = new Component(Handlebars.compile('<p id="greetings">{{value}}</p>'), model, 'componentId');

    component.start();

    expect(document.getElementById('greetings').innerHTML).toBe('foo');

  });
  
  it('should allow to not indicate the id in the root elem of the template', () => {
    var model = new Model();
    model.value = 'foo';
    var component = new Component(Handlebars.compile('<div><p id="greetings">{{value}}</p></div>'), model, 'componentId');

    component.start();
    model.set(() => model.value = 'bar');

    expect(document.getElementById('greetings').innerHTML).toBe('bar');
    expect(document.getElementById('componentId')).not.toBe(null);

  });

  it('should update a single model value', () => {
    var model = new Model();
    model.value = 'foo';
    var component = new Component(Handlebars.compile('<div><p id="greetings">{{value}}</p></div>'), model, 'componentId');

    component.start();
    model.set(() => model.value = 'bar');

    expect(document.getElementById('greetings').innerHTML).toBe('bar');


  });

  
  it('should remove nodes after update', () => {
    var model = new Model();
    model.value = 'true';
    
    var component = new Component(Handlebars.compile('<div id="componentId">{{#if value}}hi!{{/if}}</div>'), model, 'componentId');

    component.start();
    
    expect(document.getElementById('componentId').childNodes.length).toBe(1);

    model.set(()=> model.value = false);
    
    expect(document.getElementById('componentId').childNodes.length).toBe(0);


  });

  it ('should update a simple list', () => {
    var model = new Model();
    model.items = [{
      item: 'item-1'
    }, {
      item: 'item-2'
    }, {
      item: 'item-4'
    }];
    var component = new Component(Handlebars.compile('<div id="componentId">{{#each items}} <p key="{{item}}" class="item">{{item}}</p> {{/each}}</div>'), model, 'componentId');

    component.start();

    model.set(() => model.items = [{
      item: 'item-1'
    }, {
      item: 'item-2'
    }, {
      item: 'item-3'
    }, {
      item: 'item-4'
    }]);
    expect(document.getElementsByClassName('item').length).toBe(4);
    
    expect(document.getElementById('fixture').innerHTML).toBe(
    '<div id="componentId">'+
      ' <p key="item-1" class="item">item-1</p> '+
      ' <p key="item-2" class="item">item-2</p> '+
      ' <p key="item-3" class="item">item-3</p> '+
      ' <p key="item-4" class="item">item-4</p> '+
    '</div>');
  });
  
  it('should not touch subtrees if siblings are added', () => {
    var model = new Model();
    model.items = [{
      item: 'foo'
    }];
    var component = new Component(Handlebars.compile('<div id="componentId"><p id="donottouch">Do not touch</p>{{#each items}}<p class="item">{{item}}</p>{{/each}}</div>'), model, 'componentId');

    component.start();

    var shouldNotBeTouched1 = document.getElementById('donottouch');
    var shouldNotBeTouched2 = document.getElementsByClassName('item')[0];
    expect(document.getElementsByClassName('item').length).toBe(1);

    model.set(() => model.items.push({
      item: 'bar'
    }));

    //item was added
    expect(document.getElementsByClassName('item').length).toBe(2);

    //but the previous sibling is not touched
    expect(shouldNotBeTouched1).toBe(document.getElementById('donottouch'));
    expect(shouldNotBeTouched2).toBe(document.getElementsByClassName('item')[0]);
  })

  it('should not touch unaffected childrens in a changed, but key-based, list of nodes', () => {
    var model = new Model();
    model.items = [{
      item: 'item-1'
    }, {
      item: 'item-2'
    }, {
      item: 'item-4'
    }];
    var component = new Component(Handlebars.compile('<div id="componentId">{{#each items}}<p key="{{item}}" class="item">{{item}}</p>{{/each}}</div>'), model, 'componentId');

    component.start();
    var item4Node = document.getElementsByClassName('item')[2]; //item-4
    expect(item4Node).not.toBe(undefined);

    model.set(() => model.items = [{
      item: 'item-1'
    }, {
      item: 'item-2'
    }, {
      item: 'item-3'
    }, {
      item: 'item-4'
    }]);
    
    // do not touch
    expect(document.getElementsByClassName('item')[3]).toBe(item4Node);

  });
  
  it('should not touch unaffected children when removing the first position in a key-based list of nodes', () => {
    var model = new Model();
    model.items = [{
      item: 'item-1'
    }, {
      item: 'item-2'
    }, {
      item: 'item-3'
    }, {
      item: 'item-4'
    }];
    var component = new Component(Handlebars.compile('{{#each items}}<p key="{{item}}" class="item">{{item}}</p>{{/each}}'), model, 'componentId');

    component.start();

    var item4Node = document.getElementsByClassName('item')[3]; //item-4

    model.set(() => model.items = [{
      item: 'item-1'
    }, {
      item: 'item-2'
    }, {
      item: 'item-4'
    }]);

    // do not touch
    expect(document.getElementsByClassName('item')[2]).toBe(item4Node);

  });
  
});
