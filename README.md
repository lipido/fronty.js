# fronty.js

A simple library for building Component-based Web user interfaces.

**Note: This is an educational project (<1000 lines of code). There are
many libraries doing this for professional projects (e.g:
[Ember](http://emberjs.com), [AngularJS](http://angularjs.org),
[Vue.js](https://vuejs.org), [React](https://facebook.github.io/react/), etc.)**

This readme and documentation can be also viewed in
[https://lipido.github.io/fronty.js](https://lipido.github.io/fronty.js).

## Main concepts

### Models
Models are [Observable](http://www.oodesign.com/observer-pattern.html) objects,
that extends the class `Model`. In models you save your application's "logic
state" (e.g.: list of todo items, current editing employee, current logged user,
etc.).

In order to make changes in a model, you have to use the `set` method, which 
will notify all observers that a change has been made.

```javascript
var myModel = new Fronty.Model('mymodel');
myModel.counter = 0;

// update the model later
myModel.set( () => myModel.counter++ );
```

### Renderers
Renderers allows you to maintain your HTML separated from your JavaScript code.
A renderer is any function that returns an HTML string.

A special type of renderers are those that takes a model and converts it into
HTML (see `ModelComponent`, afterwards). A very powerful library to create this
function is [Handlebars](http://handlebarsjs.com/), since a Handlebars template
is a valid renderer function for fronty.js (you can [find many
more](https://www.google.es/search?q=javascript+template+engines)). For example:

```html
<div>
  <span>Current counter: {{counter}}</span>
  <button id="increase">Increase</button>
</div>
```

If you compile this template with Handlebars, you get a valid renderer function
that would be able to render the previous model, where `counter` is a property
of the model.

Note: renderers **MUST** return a piece of HTML with a single root element.

### Components
Components take a renderer function and puts its resulting HTML in the actual
and visible document by making *as less changes as possible* in the document
tree in order to increase performance and preserve interactive element's
status (such as form input elements). A component is rendered in place of a
given HTML element identified by its `id`, so everything inside that node is
responsibility of the component. Components can be re-rendered at any time so,
if the renderer function returns a different content, the component will make
the necessary changes in the current HTML.

The most typical `Component` is `ModelComponent`, which receive a `Model`, and
a renderer function able to take a model and generate HTML (e.g: a compiled
Handlebars template). The component *observes* the model. If any change is made
in the model, the component will re-render.

```javascript
var myModel = new Fronty.Model('mymodel');
myModel.counter = 0;
var aTemplate = Handlebars.compile(
  '<div><span>Current counter: {{counter}}</span><button id="increase">Increase</button></div>'
);
var myComponent = new Fronty.ModelComponent(aTemplate, myModel, 'myapp');
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

Finally, components do not render until you call `start()`.

```javascript
myComponent.start();
```

Another special component is the `RouterComponent`, a class that is able to
simulate "multiple-pages" inside a single-page application by using the hash
part of the current url.

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
        var myModel = new Fronty.Model('mymodel');
        myModel.counter = 0;
        
        // Template
        var aTemplate = Handlebars.compile(
          '<div><span>Current counter: {{counter}}</span><button id="increase">Increase</button></div>'
        );
        
        // Component
        var myComponent = new Fronty.ModelComponent(aTemplate, myModel, 'myapp');
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
      var myModel = new Fronty.Model('mymodel');
      myModel.counter = 0;
      
      var myComponent = new Fronty.ModelComponent(Handlebars.templates.counter, myModel, 'myapp');
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
Components by extending these classes.

For example:

```javascript
class Counter extends Fronty.Model {
  constructor() {
    super('counter');
    this.counter = 0;
  }
  
  increase() {
    this.set( () => { this.counter++ });
  }
}

class CounterComponent extends Fronty.ModelComponent {
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

## Nesting Components
Components can also be composed one inside other for better modularity,
reusability and performance by using
`component.addChildComponent(childComponent)`. You can also place a special attribute
in parent components to create child components dynamically. For example:

```html
<!-- parent template -->
<ul>
  {{#each items}}
  <li fronty-component="TodoItemComponent" id="item-{{id}}" key="item-{{id}}" model="items[{{@index}}]"></li>
  {{/each}}
</ul>
```

```html
<!-- child template -->
<li key="item-{{id}}">
  {{description}}
</li>
```

```javascript

// parent component
class TodoListComponent extends Fronty.ModelComponent {
  constructor(id, items) {
    super(
      Handlebars.compile(document.getElementById('todo-list-template').innerHTML),
      items, id);
  
  }
}

// child items component
class TodoItemComponent extends Fronty.ModelComponent {
  constructor(id, item) { // <--- a component class with this constructor must be available
  }
}
```

In the parent component, you have to indicate the `fronty-component` attribute
to create child components dynamically, and pass the
model that the expression found in the attribute `model` evaluates to.

If you want to instantiate the child components by hand, you can override the
`createChildComponent(childTag, modelItem, itemId)` function in the parent
component. For example:

**Note:** If you use a module system for JavaScript, Fronty will not be able to locate your class,
so it is mandatory to override the method like in this example.

```javascript
class TodoListComponent extends Fronty.Component {
  constructor(id, items) {
    super(
      Handlebars.compile(document.getElementById('todo-list-template').innerHTML),
      items, id);
  
  }
  createModelChildModelComponent(childTag, childTagElement, itemId, modelItem) {
    if (childTag === 'TodoItemComponent') {
      return new TodoItemComponent(itemId, modelItem);
    }
  }
}
```

See an example in [here](examples/todo-list.html).

## Technical details
- One-way binding. Changes in models are reflected in HTML, but changes in 
  HTML interactive elements are not reflected in models automatically.
- Component-based. Each part of the DOM is rendered by a component. Components
  are nestable.
- No third-party libraries required.
- Template engine agnostic. Tested with [Handlebars](http://handlebarsjs.com/).
- Updates the DOM by diff+patch (similar to "Reconciliation" in
  [React](https://facebook.github.io/react/)).
- Models are mutable and observed by components. Only those ModelComponent
  objects that observe a changing model are re-rendered, so you can control
  which part of the DOM is re-evaluated for changes.
- What about performance? I have [benchmarked Fronty](https://github.com/lipido/fronty-benchmark/)
  using a well-known benchmark. Results can be seen [here](http://htmlpreview.github.io/?https://github.com/lipido/fronty-benchmark/blob/master/webdriver-ts/table.html).
