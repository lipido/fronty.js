describe('RouterComponent', () => {
  beforeEach(() => {
    var fixture = '<div id="fixture"><div id="router"></div></div>';

    document.body.insertAdjacentHTML(
      'afterbegin',
      fixture);
  });

  var routerHashChangeCallback;
  beforeEach(() => {
    // the hashchange event is not working in tests, so we mock the addEventListener of window
    var currentAddEventListener = window.addEventListener;
    window.addEventListener = function(event, fn, boolean) {
      if (event === 'hashchange') {
        routerHashChangeCallback = fn;
      }
      return currentAddEventListener(event, fn, boolean);
    };
    window.location.href = '#';

  });

  // remove the html fixture from the DOM
  afterEach(function() {
    document.body.removeChild(document.getElementById('fixture'));
  });

  it('should render a default route', () => {
    var router = new Fronty.RouterComponent('router', () => '<div id="router"><div id="currentpage"></div></div>', 'currentpage');

    var page = new Fronty.ModelComponent(() => '<div id="currentpage">Page1</div>', null, null);

    router.setRouterConfig({
      page: {
        component: page
      },
      defaultRoute: 'page'
    });

    router.start();

    expect(document.getElementById('currentpage').textContent).toBe('Page1');
  });

  it('should change the route', () => {


    var router = new Fronty.RouterComponent('router', () => '<div id="router"><div id="currentpage"></div></div>', 'currentpage');

    var page = new Fronty.ModelComponent(() => '<div>Page1</div>', null, null);
    var page2 = new Fronty.ModelComponent(() => '<div>Page2</div>', null, null);

    router.setRouterConfig({
      page: {
        component: page
      },
      page2: {
        component: page2
      },
      defaultRoute: 'page'
    });
    //
    router.start();

    expect(document.getElementById('currentpage').textContent).toBe('Page1');

    window.location.href = '#page2';
    routerHashChangeCallback();

    expect(document.getElementById('currentpage').textContent).toBe('Page2');

    window.location.href = '#page';
    routerHashChangeCallback();

    expect(document.getElementById('currentpage').textContent).toBe('Page1');

  });

  it('should give the correct current page', () => {

    var router = new Fronty.RouterComponent('router', () => '<div id="currentpage"></div>', 'currentpage');

    var page = new Fronty.ModelComponent(() => '<div>Page1</div>', null, null);
    var page2 = new Fronty.ModelComponent(() => '<div>Page2</div>', null, null);

    router.setRouterConfig({
      page: {
        component: page
      },
      page2: {
        component: page2
      },
      defaultRoute: 'page'
    });

    router.start();

    expect(router.getCurrentPage()).toBe('page');

    window.location.href = '#page2';
    routerHashChangeCallback();

    expect(router.getCurrentPage()).toBe('page2');

  });

});
