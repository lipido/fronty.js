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
    window.location.href='#';
    
  });
  
  // remove the html fixture from the DOM
  afterEach(function() {
    document.body.removeChild(document.getElementById('fixture'));
  });

  it('should render a default route', () => {
    var router = new RouterComponent('router', Handlebars.compile('<div id="currentpage"></div>'), 'currentpage', []);
    
    var page = new Component(Handlebars.compile('Page1'), null, null);
    
    router.setRouterConfig({
      page: {
        component: page
      },
      defaultRoute: 'page'
    });
    
    router.start();
    
    expect(document.getElementById('currentpage').innerHTML).toBe('Page1');
  });
  
  it('should change the route', () => {

    
    var router = new RouterComponent('router', Handlebars.compile('<div id="currentpage"></div>'), 'currentpage', []);
    
    var page = new Component(Handlebars.compile('Page1'), null, null);
    var page2 = new Component(Handlebars.compile('Page2'), null, null);
    
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
    
    expect(document.getElementById('currentpage').innerHTML).toBe('Page1');
    
    window.location.href='#page2';    
    routerHashChangeCallback();
    
    expect(document.getElementById('currentpage').innerHTML).toBe('Page2');
    
  });
  
  it('should give the correct current page', () => {
    
    var router = new RouterComponent('router', Handlebars.compile('<div id="currentpage"></div>'), 'currentpage', []);
    
    var page = new Component(Handlebars.compile('Page1'), null, null);
    var page2 = new Component(Handlebars.compile('Page2'), null, null);
    
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
    
    window.location.href='#page2';    
    routerHashChangeCallback();
    
    expect(router.getCurrentPage()).toBe('page2');
    
  });
  
});
