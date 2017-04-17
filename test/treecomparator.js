describe('Fronty.TreeComparator', () => {

  it('it should do basic compararisons', () => {
    var node1 = document.createElement('div');
    var node2 = document.createElement('div');
    node1.innerHTML = '<p>Foo</p>';
    node2.innerHTML = '<p>Bar</p>';

    var diff = Fronty.TreeComparator.diff(node1, node2);

    expect(diff).toEqual(
      [{
        mode: Fronty.TreeComparator.PATCH_SET_NODE_VALUE,
        toReplace: node1.childNodes[0].childNodes[0], //#text: Foo
        replacement: node2.childNodes[0].childNodes[0] //#text: Bar
      }]);

    Fronty.TreeComparator.applyPatches(diff);
    expect(node1.innerHTML).toBe('<p>Bar</p>');

  });

  it('it should do basic insertions', () => {
    var node1 = document.createElement('div');
    var node2 = document.createElement('div');
    node1.innerHTML = '<p>Foo</p>';
    node2.innerHTML = '<p>Foo</p><p>Bar</p>';

    var diff = Fronty.TreeComparator.diff(node1, node2);

    expect(diff).toEqual(
      [{
        mode: Fronty.TreeComparator.PATCH_APPEND_CHILD,
        toReplace: node1,
        replacement: node2.childNodes[1] // <p>Bar</p>
      }]);

    Fronty.TreeComparator.applyPatches(diff);
    expect(node1.innerHTML).toBe('<p>Foo</p><p>Bar</p>');
  });
  
  it('it should do basic insertions on empty parents', () => {
    var node1 = document.createElement('div');
    var node2 = document.createElement('div');
    node1.innerHTML = '';
    node2.innerHTML = '<p>Foo</p>';

    var diff = Fronty.TreeComparator.diff(node1, node2);

    expect(diff).toEqual(
      [{
        mode: Fronty.TreeComparator.PATCH_APPEND_CHILD,
        toReplace: node1,
        replacement: node2.childNodes[0] // <p>Bar</p>
      }]);

    Fronty.TreeComparator.applyPatches(diff);
    expect(node1.innerHTML).toBe('<p>Foo</p>');
  });

  it('it should do basic removals', () => {
    var node1 = document.createElement('div');
    var node2 = document.createElement('div');
    node1.innerHTML = '<p>Foo</p>';
    node2.innerHTML = '';

    var diff = Fronty.TreeComparator.diff(node1, node2);

    expect(diff).toEqual(
      [{
        mode: Fronty.TreeComparator.PATCH_REMOVE_NODE,
        toReplace: node1.childNodes[0], // <p>Foo</p>
      }]);
  });

  it('it should do basic reordering', () => {
    var node1 = document.createElement('div');
    var node2 = document.createElement('div');
    node1.innerHTML = '<p>Foo</p><p>Bar</p>';
    node2.innerHTML = '<p>Bar</p><p>Foo</p>';

    var diff = Fronty.TreeComparator.diff(node1, node2);
    expect(diff).toEqual(
      [{
          mode: Fronty.TreeComparator.PATCH_SET_NODE_VALUE,
          toReplace: node1.childNodes[0].childNodes[0], // #text: Foo
          replacement: node2.childNodes[0].childNodes[0] // #text: Bar
        },
        {
          mode: Fronty.TreeComparator.PATCH_SET_NODE_VALUE,
          toReplace: node1.childNodes[1].childNodes[0], // #text: Bar
          replacement: node2.childNodes[1].childNodes[0] // #text: Foo
        }
      ]);

    Fronty.TreeComparator.applyPatches(diff);
    expect(node1.innerHTML).toBe('<p>Bar</p><p>Foo</p>');

  });

  it('it should do basic optimized reordering if keys are used', () => {
    var node1 = document.createElement('div');
    var node2 = document.createElement('div');
    node1.innerHTML = '<p key="1">Foo</p> <p key="2">Bar</p>';
    node2.innerHTML = '<p key="2">Bar2</p> <p key="1">Foo2</p>';

    var diff = Fronty.TreeComparator.diff(node1, node2);

    expect(diff).toEqual(
      [{
        mode: Fronty.TreeComparator.PATCH_SWAP_NODES,
        toReplace: node1.childNodes[0], // <p key="1">Foo</p>
        replacement: node1.childNodes[2] // <p key="2">Bar</p>
      },
      {
        mode: Fronty.TreeComparator.PATCH_SET_NODE_VALUE,
        toReplace: node1.childNodes[2].childNodes[0], // #text: Bar
        replacement: node2.childNodes[0].childNodes[0] // #text: Bar2
      },
      {
        mode: Fronty.TreeComparator.PATCH_SET_NODE_VALUE,
        toReplace: node1.childNodes[0].childNodes[0], // #text: Foo
        replacement: node2.childNodes[2].childNodes[0] // #text: Foo2
      }]);

    Fronty.TreeComparator.applyPatches(diff);
    expect(node1.innerHTML).toBe('<p key="2">Bar2</p> <p key="1">Foo2</p>');

  });
  
  it('it should do basic optimized removal if keys are used', () => {
    var node1 = document.createElement('div');
    var node2 = document.createElement('div');
    node1.innerHTML = '<p key="1">Foo</p> <p key="2">Bar</p> <p key="3">Mee</p>';
    node2.innerHTML = '<p key="2">Bar</p> <p key="3">Mee</p>';

    var diff = Fronty.TreeComparator.diff(node1, node2);

    expect(diff).toEqual(
      [{
        mode: Fronty.TreeComparator.PATCH_REMOVE_NODE,
        toReplace: node1.childNodes[0], // <p key="1">Foo</p>
      },
      {
        mode: Fronty.TreeComparator.PATCH_REMOVE_NODE,
        toReplace: node1.childNodes[1], // #text: <space>
      }
      ]);

    Fronty.TreeComparator.applyPatches(diff);
    expect(node1.innerHTML).toBe('<p key="2">Bar</p> <p key="3">Mee</p>');

  });
  
  it('it should do complex patches when keys/non-keys are used', () => {
    var node1 = document.createElement('div');
    var node2 = document.createElement('div');
    node1.innerHTML = '<p key="1">1</p><p>Px</p><p>Py</p><p key="3">3</p>';
    node2.innerHTML = '<p>Pn</p><p key="2">2</p><p key="3">3</p><p>Pxbis</p>';

    var diff = Fronty.TreeComparator.diff(node1, node2);
    expect(diff).toEqual(
      [{
        mode: Fronty.TreeComparator.PATCH_INSERT_NODE,
        toReplace: node1,
        replacement: node2.childNodes[0], // <p>Pn</p>
        beforePos: 0
      },
      {
        mode: Fronty.TreeComparator.PATCH_REMOVE_NODE,
        toReplace: node1.childNodes[0] // <p key="1">1</p>
      },
      {
        mode: Fronty.TreeComparator.PATCH_INSERT_NODE,
        toReplace: node1,
        replacement: node2.childNodes[1], // <p key="2">2</p>
        beforePos: 1
      },
      {
        mode: Fronty.TreeComparator.PATCH_REMOVE_NODE,
        toReplace: node1.childNodes[1] // <p>Px</p>
      },
      {
        mode: Fronty.TreeComparator.PATCH_REMOVE_NODE,
        toReplace: node1.childNodes[2] // <p>Py</p>
      },
      {
        mode: Fronty.TreeComparator.PATCH_APPEND_CHILD,
        toReplace: node1,
        replacement: node2.childNodes[3] // <p>Pxbis</p>
      }
    
      ]);

    Fronty.TreeComparator.applyPatches(diff);
    expect(node1.innerHTML).toBe('<p>Pn</p><p key="2">2</p><p key="3">3</p><p>Pxbis</p>');

  });
  
  it('it should do complex optimized patches when keys are used', () => {
    var node1 = document.createElement('div');
    var node2 = document.createElement('div');
    node1.innerHTML = '<p key="1">1</p><p key="x">Px</p><p key="y">Py</p><p key="3">3</p>';
    node2.innerHTML = '<p key="n">Pn</p><p key="2">2</p><p key="3">3</p><p key="x">Pxbis</p>';
    
    var diff = Fronty.TreeComparator.diff(node1, node2);
    
    expect(diff).toEqual(
      [{
        mode: Fronty.TreeComparator.PATCH_INSERT_NODE,
        toReplace: node1,
        replacement: node2.childNodes[0], // <p>Pn</p>
        beforePos: 0
      },
      {
        mode: Fronty.TreeComparator.PATCH_REMOVE_NODE,
        toReplace: node1.childNodes[0] // <p key="1">1</p>
      },
      {
        mode: Fronty.TreeComparator.PATCH_INSERT_NODE,
        toReplace: node1,
        replacement: node2.childNodes[1], // <p key="x">Px</p>
        beforePos: 1
      },
      {
        mode: Fronty.TreeComparator.PATCH_SWAP_NODES,
        toReplace: node1.childNodes[1], // <p key="x">Px</p>
        replacement: node1.childNodes[3] //<p key="3">3</p>
      },
      {
        mode: Fronty.TreeComparator.PATCH_REMOVE_NODE,
        toReplace: node1.childNodes[2] //<p key="y">Py</p>
      },
      {
        mode: Fronty.TreeComparator.PATCH_SET_NODE_VALUE,
        toReplace: node1.childNodes[1].childNodes[0], // #text: Px
        replacement: node2.childNodes[3].childNodes[0] // #text: Pxbis
      },
      ]);

    Fronty.TreeComparator.applyPatches(diff);
    expect(node1.innerHTML).toBe('<p key="n">Pn</p><p key="2">2</p><p key="3">3</p><p key="x">Pxbis</p>');

  });
});
