# fronty.js

A simple library for building Component-based Web user interfaces.

**Note: This is an educational project (around 500 lines of code). There are
many libraries doing this for professional projects (e.g:
[Ember](http://emberjs.com), [AngularJS](http://angularjs.org),
[Vue.js](https://vuejs.org), [React](https://facebook.github.io/react/), etc.)**

## Main concepts

### Models
Models are [Observable](http://www.oodesign.com/observer-pattern.html) objects,
that extends the class `Model`. In models you save your application's "logic
state" (e.g.: list of todo items, current editing employee, current logged user,
etc.).

```javascript
var myModel = new Model('mymodel');
myModel.counter = 0;

// update the model later
myModel.set( () => myModel.counter++ );
```

### Renderers
Renderers allows you to maintain your HTML separated from your JavaScript code.
A renderer is a function that takes a model and converts it into HTML. A very
powerful library to create this function is
[Handlebars](http://handlebarsjs.com/), sinde a Handlebars template is a valid
renderer function for fronty.js. For example:

```html
<span>Current counter: {{counter}}</span>
```

This renderer would be able to render the previous model, where `counter` is
a property of the model.

### Components
Components are responsible of rendering your models into HTML by using a
renderer function and, more important, to update your HTML when your model
changes (implementing "one-way binding"), by making as less changes as possible
in the HTML document in order to increase performance.

Components receive a renderer function (e.g: a Handlebars template) as a
parameter and are placed inside a node of your HTML document, so everything
inside that node is responsibility of the component.

```javascript
var myModel = new Model('mymodel');
myModel.counter = 0;
var aTemplate = Handlebars.compile('<span>Current counter: {{counter}}</span><button id="increase">Increase</button>');
var myComponent = new Component(aTemplate, myModel, 'myapp');
```

In the example, the component will be placed inside the element with
`id="myapp"`.

In addition, you add event listeners to components (not directly to HTML nodes):

```javascript
myComponent.addEventListener('click', '#increase', () => {
  //update the model
  myModel.set( () => myModel.counter++ );
});
```

Components can also be composed one inside other, for better modularity and
reusability `component.addChildComponent(childComponent)`.

Finally, components do not render until you call `start()`.

```javascript
myComponent.start();
```

A special component is the `RouterComponent`, a class that is able to simulate
"multiple-pages" inside a single-page application by using the hash part of the
current url.

## Hello World!
Here you have a single page with a minimal code to see fronty.js working.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.6/handlebars.min.js"></script>
    <script src="js/fronty.js"></script>
  </head>
  <body>
    <div id ="myapp">Loading</div>
    <script>
      $( ()=> { //wait for document ready

        // Model
        var myModel = new Model('mymodel');
        myModel.counter = 0;
        
        // Template
        var aTemplate = Handlebars.compile('<span>Current counter: {{counter}}</span><button id="increase">Increase</button>');
        
        // Component
        var myComponent = new Component(aTemplate, myModel, 'myapp');
        myComponent.addEventListener('click', '#increase', () => {
          //update the model
          myModel.set( () => myModel.counter++ );
        });
        
        // Start rendering
        myComponent.start();
      });
    </script>
  </body>
</html>
```

This is a minimal example. The next thing should separate the templates from the
JavaScript. You can:

1. [Precompile](http://handlebarsjs.com/precompilation.html) your templates
(best performance).

2. Retrieve this template from an external file
(`templates/counter-template.hbs`) by using AJAX, compile it, and then pass it
to the component. The following code is an example:

```javascript

// a helper function to load an external text file
function loadTextFile(url) {
  return new Promise((resolve, reject) => {
    $.get({
      url: url,
      cache: true,
      dataType: 'text'
    }).then((source) => {
      resolve(source);
    }).fail(() => reject());
  });
}

Handlebars.templates = {};
Promise.all([
    // here we retrieve our template files, you can put here all the templates
    loadTextFile('templates/counter-template.hbs').then((source) => Handlebars.templates.counter = Handlebars.compile(source))
  ])
  .then(() => { 
    $(() => {
      // once templates are loaded and the document is ready, it is safe to start
      var myModel = new Model('mymodel');
      myModel.counter = 0;
      
      var myComponent = new Component(Handlebars.templates.counter, myModel, 'myapp');
      myComponent.addEventListener('click', '#increase', () => {
        //update the model
        myModel.set( () => myModel.counter++ );
      });
      
      myComponent.start();
    });
  }).catch((err) => {
    alert('FATAL: could not start app ' + err);
  });
```

The `template/counter-template.hbs` would be:

```html
<span>Current counter: {{counter}}</span><button id="increase">Increase</button>
```

## Object oriented
Models and Components are
[classes](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes)
(ECMAScript 2015). It is recommended that you build your own Models and
Components by extending this clases.

For example:

```javascript
class Counter extends Model {
  constructor() {
    super('counter');
    this.counter = 0;
  }
  
  increase() {
    this.set( () => { this.counter++ });
  }
}

class CounterComponent extends Component {
  constructor(counterModel, node) {
    super(Handlebars.templates.counter, counterModel, node);
    this.counterModel = counterModel;
    
    this.addEventListener('click', '#increase', () => {
      //update the model
      this.counterModel.increase();
    });
  }
}
```
