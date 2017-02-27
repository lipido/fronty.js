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

    var parent = new ListComponent(Handlebars.compile('{{#each items}}<div id="child-{{id}}" class="achild"></div>{{/each}}'), model, model.items, (item) => {
        return 'child-' + item.id;
      },
      (item) => {
        return new Component(Handlebars.compile('{{name}}'), item, 'child-' + item.id)
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
        '{{#each items}}<div key="item-{{id}}" id="child-{{id}}" class="achild"></div>{{/each}}'), 
        model, model.items,
      (item) => { //id provider
        return 'child-' + item.id;
      },
      (item) => { // component factory
        return new Component(Handlebars.compile('{{name}}'), item, 'child-' + item.id)
      }, 'componentId');



    parent.start();
    expect(document.getElementsByClassName('achild').length).toBe(2);
    expect(parent.getChildComponents().length).toBe(2);

    model.set(() => model.items.length = 0); //empty items array

    expect(document.getElementsByClassName('achild').length).toBe(0);

    expect(parent.getChildComponents().length).toBe(0);
    
  });

});
