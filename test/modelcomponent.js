class ChildModelComponent extends ModelComponent {
  constructor(id, model) {
    super(()=>'<div id="' + id + '">'+model.value+'</div>', model, id);
  }
}

describe('ModelComponent', () => {
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

  it('should render a single model value', () => {
    var model = new Model();
    model.value = 'foo';

    var component = new ModelComponent((m) =>'<p id="greetings">'+m.value+'</p>', model, 'componentId');

    component.start();

    expect(document.getElementById('greetings').innerHTML).toBe('foo');

  });

  it('should remove nodes after update', () => {
    var model = new Model();
    model.value = 'true';

    var component = new ModelComponent((m) =>'<div id="componentId">'+(m.value? 'hi!':'')+'</div>', model, 'componentId');

    component.start();

    expect(document.getElementById('componentId').childNodes.length).toBe(1);

    model.set(() => model.value = false);

    expect(document.getElementById('componentId').childNodes.length).toBe(0);
  });

  it('should update a simple list', () => {
    
    var renderer = (m) => {
      var res = '<div id="componentId">';
      m.items.forEach((item)=>{
        res+=' <p key="'+item.item+'" class="item">'+item.item+'</p> ';
      });
      res += '</div>';
      return res;
    };
    
    var model = new Model();
    model.items = [{
      item: 'item-1'
    }, {
      item: 'item-2'
    }, {
      item: 'item-4'
    }];
    
    var component = new ModelComponent(renderer, model, 'componentId');

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
      '<div id="componentId">' +
      ' <p key="item-1" class="item">item-1</p> ' +
      ' <p key="item-2" class="item">item-2</p> ' +
      ' <p key="item-3" class="item">item-3</p> ' +
      ' <p key="item-4" class="item">item-4</p> ' +
      '</div>');
  });

  it('should not touch subtrees if siblings are added', () => {
    var renderer = (m) => {
      var res = '<div id="componentId"><p id="donottouch">Do not touch</p>';
      m.items.forEach((item)=>{
        res+='<p key="'+item.item+'" class="item">'+item.item+'</p>';
      });
      res += '</div>';
      return res;
    };
    
    var model = new Model();
    model.items = [{
      item: 'foo'
    }];
    var component = new ModelComponent(renderer, model, 'componentId');

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
  });



  it('should allow child tags', () => {
    var renderer = (m) => {
      var res = '<div id="componentId">';
      for (var index = 0; index < m.items.length; index ++) {
        var item = m.items[index];
        res+='<ChildModelComponent id="child-'+index+'" model="items['+index+']"></ChildModelComponent>';
      }
      res += '</div>';
      console.log(res);
      return res;
    };
    
    var model = new Model();

    var childModel = new Model();
    childModel.value = 'foo';
    model.items = [childModel];

    var parent = new ModelComponent(
      renderer,
      model,
      'componentId', ['ChildModelComponent'] //tags that generate childs
    );

    parent.createChildModelComponent = (tagName, childTagElement, id, modelItem) => {
      if (tagName === 'ChildModelComponent') {
        return new ModelComponent((m) => '<div id="' + id + '">'+m.value+'</div>', modelItem, id);
      }
    };

    parent.start();
    expect(document.getElementById('child-0').innerHTML).toBe('foo');
    expect(parent.getChildComponents().length).toBe(1);

    model.set(() => {
      model.items.length = 0;
    });

    expect(parent.getChildComponents().length).toBe(0);


    model.set(() => {
      var childModel = new Model();
      childModel.value = 'foo';
      model.items.push(childModel);
    });


    expect(parent.getChildComponents().length).toBe(1);
    model.set(() => {
      var childModel = new Model();
      childModel.value = 'foo';
      model.items.push(childModel);
    });
    expect(parent.getChildComponents().length).toBe(2);
  });



  it('should autodetect child component classes on child tags', () => {
    var renderer = (m) => {
      var res = '<div id="componentId">';
      for (var index = 0; index < m.items.length; index ++) {
        var item = m.items[index];
        res+='<ChildModelComponent id="child-'+index+'" model="items['+index+']"></ChildModelComponent>';
      }
      res += '</div>';
      console.log(res);
      return res;
    };
    
    var model = new Model();

    var childModel = new Model();
    childModel.value = 'foo';
    var childModel2 = new Model();
    childModel2.value = 'bar';
    model.items = [childModel, childModel2];


    //ChildComponent class is defined in global scope (see start of this file)
    var parent = new ModelComponent(
      renderer,
      model,
      'componentId', ['ChildModelComponent'] //tags that generate childs
    );

    parent.start();
    expect(document.getElementById('child-0').innerHTML).toBe('foo');
    expect(document.getElementById('child-1').innerHTML).toBe('bar');
    expect(parent.getChildComponents().length).toBe(2);

    model.set(() => {
      model.items.length = 0;
    });

    expect(parent.getChildComponents().length).toBe(0);
  });


});
