class ChildComponent extends Component {
  constructor(model, id) {
    super(Handlebars.compile('<div id="'+id+'">{{value}}</div>'), model, id);
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

  // a generic component that manages childs dynamically
  class ListComponent extends Component {
    constructor(renderer, model, modelsubitems, subitemIdProvider, subitemChildComponentFactory, id) {
      super(renderer, model, id);
      this.modelsubitems = modelsubitems;
      this.subitemChildComponentFactory = subitemChildComponentFactory;
      this.subitemIdProvider = subitemIdProvider;
    }

    afterRender() {
      // add missing childs
      this.modelsubitems.forEach((item) => {
        if (!super.getChildComponent(this.subitemIdProvider(item))) {
          super.addChildComponent(this.subitemChildComponentFactory(item));
        }
      });

      // remove child components which are no longer in items
      var childIds = super.getChildComponents().map((component) => component.getHtmlNodeId());
      var itemIds = this.modelsubitems.map((item) => this.subitemIdProvider(item));
      childIds.forEach((childId) => {
        if (itemIds.indexOf(childId) === -1) {
          super.removeChildComponent(super.getChildComponent(childId));
        }
      });
    }
  };


  it('should render a nested component added dynamically', () => {
    var model = new Model('items');

    var item1 = new Model('item-1');
    item1.id = 1;

    var item2 = new Model('item-2');
    item2.id = 2;

    model.items = [item1, item2];

    var parent = new ListComponent(Handlebars.compile('<div id="componentId">{{#each items}}<div id="child-{{id}}"></div>{{/each}}</div>'), model, model.items, (item) => {
        return 'child-' + item.id;
      },
      (item) => {
        return new Component(Handlebars.compile('<div id="child-{{id}}" class="achild">{{name}}</div>'), item, 'child-' + item.id)
      }, 'componentId');


    parent.start();
    expect(document.getElementsByClassName('achild').length).toBe(2);

  });

  it('should remove nested components dynamically', () => {
    var model = new Model('items');

    var item1 = new Model('item-1');
    item1.id = 1;

    var item2 = new Model('item-2');
    item2.id = 2;

    model.items = [item1, item2];

    var parent = new ListComponent(
      Handlebars.compile(
        '<div id="componentId">{{#each items}}<div key="item-{{id}}" id="child-{{id}}"></div>{{/each}}</div>'),
      model, model.items,
      (item) => { //id provider
        return 'child-' + item.id;
      },
      (item) => { // component factory
        return new Component(Handlebars.compile('<div key="item-{{id}}" id="child-{{id}}" class="achild">{{name}}</div>'), item, 'child-' + item.id)
      }, 'componentId');



    parent.start();
    expect(document.getElementsByClassName('achild').length).toBe(2);
    expect(parent.getChildComponents().length).toBe(2);

    model.set(() => model.items.length = 0); //empty items array

    expect(document.getElementsByClassName('achild').length).toBe(0);

    expect(parent.getChildComponents().length).toBe(0);

  });

  it('should allow child tags', () => {
    var model = new Model();

    var childModel = new Model();
    childModel.value = 'foo';
    model.items = [childModel];

    var parent = new Component(
      Handlebars.compile('<div id="componentId">{{#each items}}<ChildComponent id="child-{{@index}}" model="items[{{@index}}]"></ChildComponent>{{/each}}</div>'),
      model,
      'componentId', ['ChildComponent'] //tags that generate childs
    );

    parent.createChildComponent = (tagName, model, id) => {
      if (tagName === 'ChildComponent') {
        return new Component(Handlebars.compile('<div id="'+id+'">{{value}}</div>'), model, id);
      }
    };

    parent.start();
    expect(document.getElementById('child-0').innerHTML).toBe('foo');
    expect(parent.getChildComponents().length).toBe(1);

    model.set(() => {
      model.items.length = 0
    });

    expect(parent.getChildComponents().length).toBe(0);
    
    
    model.set(() => {
      var childModel = new Model();
      childModel.value='foo';
      model.items.push(childModel);
    });
    
    
    expect(parent.getChildComponents().length).toBe(1);
    model.set(() => {
      var childModel = new Model();
      childModel.value='foo';
      model.items.push(childModel);
    });
    expect(parent.getChildComponents().length).toBe(2);
  });
  
  

  it('should autodetect child component classes on child tags', () => {
    var model = new Model();

    var childModel = new Model();
    childModel.value = 'foo';
    var childModel2 = new Model();
    childModel2.value = 'bar';
    model.items = [childModel, childModel2];


    //ChildComponent class is defined in global scope (see start of this file)
    var parent = new Component(
      Handlebars.compile('<div id="componentId">{{#each items}}<ChildComponent id="child-{{@index}}" model="items[{{@index}}]"></ChildComponent>{{/each}}</div>'),
      model,
      'componentId', ['ChildComponent'] //tags that generate childs
    );

    parent.start();
    expect(document.getElementById('child-0').innerHTML).toBe('foo');
    expect(document.getElementById('child-1').innerHTML).toBe('bar');
    expect(parent.getChildComponents().length).toBe(2);

    model.set(() => {
      model.items.length = 0
    });

    expect(parent.getChildComponents().length).toBe(0);
  });

});
