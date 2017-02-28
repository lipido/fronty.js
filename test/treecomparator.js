describe('TreeComparator', () => {

  it('it should do basic compararisons', () => {
    var node1 = document.createElement('div');
    var node2 = document.createElement('div');
    node1.innerHTML = '<p>Foo</p>';
    node2.innerHTML = '<p>Bar</p>';

    var diff = TreeComparator.diff(node1, node2);

    expect(diff).toEqual(
      [{
        toReplace: node1.childNodes[0].childNodes[0], //#text: Foo
        replacement: node2.childNodes[0].childNodes[0] //#text: Bar
      }]);

    TreeComparator.applyPatches(diff);
    expect(node1.innerHTML).toBe('<p>Bar</p>');

  });

  it('it should do basic insertions', () => {
    var node1 = document.createElement('div');
    var node2 = document.createElement('div');
    node1.innerHTML = '<p>Foo</p>';
    node2.innerHTML = '<p>Foo</p><p>Bar</p>';

    var diff = TreeComparator.diff(node1, node2);

    expect(diff).toEqual(
      [{
        mode: 'append-child',
        toReplace: node1,
        replacement: node2.childNodes[1] // <p>Bar</p>
      }]);

    TreeComparator.applyPatches(diff);
    expect(node1.innerHTML).toBe('<p>Foo</p><p>Bar</p>');
  });
  
  it('it should do basic insertions on empty parents', () => {
    var node1 = document.createElement('div');
    var node2 = document.createElement('div');
    node1.innerHTML = '';
    node2.innerHTML = '<p>Foo</p>';

    var diff = TreeComparator.diff(node1, node2);

    expect(diff).toEqual(
      [{
        mode: 'append-child',
        toReplace: node1,
        replacement: node2.childNodes[0] // <p>Bar</p>
      }]);

    TreeComparator.applyPatches(diff);
    expect(node1.innerHTML).toBe('<p>Foo</p>');
  });

  it('it should do basic removals', () => {
    var node1 = document.createElement('div');
    var node2 = document.createElement('div');
    node1.innerHTML = '<p>Foo</p>';
    node2.innerHTML = '';

    var diff = TreeComparator.diff(node1, node2);

    expect(diff).toEqual(
      [{
        mode: 'remove-node',
        toReplace: node1.childNodes[0], // <p>Foo</p>
      }]);
  });

  it('it should do basic reordering', () => {
    var node1 = document.createElement('div');
    var node2 = document.createElement('div');
    node1.innerHTML = '<p>Foo</p><p>Bar</p>';
    node2.innerHTML = '<p>Bar</p><p>Foo</p>';

    var diff = TreeComparator.diff(node1, node2);
    expect(diff).toEqual(
      [{
          toReplace: node1.childNodes[0].childNodes[0], // #text: Foo
          replacement: node2.childNodes[0].childNodes[0] // #text: Bar
        },
        {
          toReplace: node1.childNodes[1].childNodes[0], // #text: Bar
          replacement: node2.childNodes[1].childNodes[0] // #text: Foo
        }
      ]);

    TreeComparator.applyPatches(diff);
    expect(node1.innerHTML).toBe('<p>Bar</p><p>Foo</p>');

  });

  it('it should do basic optimized reordering if keys are used', () => {
    var node1 = document.createElement('div');
    var node2 = document.createElement('div');
    node1.innerHTML = '<p key="1">Foo</p><p key="2">Bar</p>';
    node2.innerHTML = '<p key="2">Bar2</p><p key="1">Foo2</p>';

    var diff = TreeComparator.diff(node1, node2);
    expect(diff).toEqual(
      [{
        mode: 'swap-nodes',
        toReplace: node1.childNodes[0], // #text: Foo
        replacement: node1.childNodes[1] // #text: Bar
      },
      {
        toReplace: node1.childNodes[1].childNodes[0], // #text: Bar
        replacement: node2.childNodes[0].childNodes[0] // #text: Bar2
      },
      {
        toReplace: node1.childNodes[0].childNodes[0], // #text: Foo
        replacement: node2.childNodes[1].childNodes[0] // #text: Foo2
      }]);

    TreeComparator.applyPatches(diff);
    expect(node1.innerHTML).toBe('<p key="2">Bar2</p><p key="1">Foo2</p>');

  });
  
  it('it should do complex patches when keys/non-keys are used', () => {
    var node1 = document.createElement('div');
    var node2 = document.createElement('div');
    node1.innerHTML = '<p key="1">1</p><p>Px</p><p>Py</p><p key="3">3</p>';
    node2.innerHTML = '<p>Pn</p><p key="2">2</p><p key="3">3</p><p>Pxbis</p>';

    var diff = TreeComparator.diff(node1, node2);
    expect(diff).toEqual(
      [{
        mode: 'insert-node',
        toReplace: node1,
        replacement: node2.childNodes[0], // <p>Pn</p>
        beforePos: 0
      },
      {
        mode: 'remove-node',
        toReplace: node1.childNodes[0] // <p key="1">1</p>
      },
      {
        mode: 'insert-node',
        toReplace: node1,
        replacement: node2.childNodes[1], // <p key="2">2</p>
        beforePos: 1
      },
      {
        mode: 'remove-node',
        toReplace: node1.childNodes[1] // <p>Px</p>
      },
      {
        mode: 'remove-node',
        toReplace: node1.childNodes[2] // <p>Py</p>
      },
      {
        mode: 'append-child',
        toReplace: node1,
        replacement: node2.childNodes[3] // <p>Pxbis</p>
      }
    
      ]);

    TreeComparator.applyPatches(diff);
    expect(node1.innerHTML).toBe('<p>Pn</p><p key="2">2</p><p key="3">3</p><p>Pxbis</p>');

  });
  
  it('it should do complex optimized patches when keys are used', () => {
    var node1 = document.createElement('div');
    var node2 = document.createElement('div');
    node1.innerHTML = '<p key="1">1</p><p key="x">Px</p><p key="y">Py</p><p key="3">3</p>';
    node2.innerHTML = '<p key="n">Pn</p><p key="2">2</p><p key="3">3</p><p key="x">Pxbis</p>';
    
    var diff = TreeComparator.diff(node1, node2);
    
    expect(diff).toEqual(
      [{
        mode: 'insert-node',
        toReplace: node1,
        replacement: node2.childNodes[0], // <p>Pn</p>
        beforePos: 0
      },
      {
        mode: 'remove-node',
        toReplace: node1.childNodes[0] // <p key="1">1</p>
      },
      {
        mode: 'insert-node',
        toReplace: node1,
        replacement: node2.childNodes[1], // <p key="x">Px</p>
        beforePos: 1
      },
      {
        mode: 'swap-nodes',
        toReplace: node1.childNodes[1], // <p key="x">Px</p>
        replacement: node1.childNodes[3] //<p key="3">3</p>
      },
      {
        mode: 'remove-node',
        toReplace: node1.childNodes[2] //<p key="y">Py</p>
      },
      {
        toReplace: node1.childNodes[1].childNodes[0], // #text: Px
        replacement: node2.childNodes[3].childNodes[0] // #text: Pxbis
      },
      ]);

    TreeComparator.applyPatches(diff);
    expect(node1.innerHTML).toBe('<p key="n">Pn</p><p key="2">2</p><p key="3">3</p><p key="x">Pxbis</p>');

  });
});
