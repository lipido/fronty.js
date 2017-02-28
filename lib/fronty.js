/*
  fronty.js: simple fron-end MVC
  author: lipido
*/

/* 
  Component class
  
  A Component is an object whose responsibilities are:
    - render the HTML results of a provided renderer function in the current
      showing document, making a less changes as possible.
    - manage nested child components.
    - manage event listeners and keep them attached to the elements after each
      re-rendering.
    
  Components render when you call the render() function.
*/
class Component {
  constructor(renderer, htmlNodeId, childTags) {
    this.htmlNodeId = htmlNodeId;
    if (!childTags) {
      childTags = [];
    }
    this.childTags = childTags;
    this.renderer = renderer;
    this.stopped = true;

    // requested event listeners by HTML query
    this.eventListeners = {};
    // installed event listeners by real DOM nodes
    this._listeners = [];

    this.childComponents = [];
    this.childComponentIds = {};
  }

  getHtmlNodeId() {
    return this.htmlNodeId;
  }

  setHtmlNodeId(htmlNodeId) {
    this.htmlNodeId = htmlNodeId;
  }

  // child management
  addChildComponent(component) {
    this.childComponents.push(component);
    this.childComponentIds[component.getHtmlNodeId()] = component;

    this.stopped ? component.stop() : component.start();

    component.render();
  }

  removeChildComponent(component) {
    var index = this.childComponents.indexOf(component);

    if (index != -1) {
      this.childComponents[index].stop();
      this.childComponents.splice(index, 1);
      delete this.childComponentIds[component.getHtmlNodeId()];
    }
    this.render();
  }

  getChildComponents() {
    return this.childComponents;
  }

  getChildComponentsById() {
    return this.childComponentIds;
  }

  getChildComponent(id) {
    return this.childComponentIds[id];
  }
  // rendering
  renderModelChanges() {
    this._doRender((htmlContents) => {

      // save child component subtrees
      var savedChildNodes = {};
      this.childComponents.forEach((childComponent) => {
        var childId = childComponent.getHtmlNodeId();
        if (this._getChildNode(childId) != null) {
          savedChildNodes[childId] = this._getChildNode(childId);
        }
      });

      // compare
      var currentTree = this._getComponentNode();


      var newTree = document.createElement('div'); //dummy element
      newTree.innerHTML = htmlContents;
      if (newTree.childNodes.length > 1) {
        throw 'Rendering function MUST return a tree with a single root element';
      }
      newTree = newTree.childNodes[0]; //move down to the root node of the new tree

      if (newTree.nodeType === Node.ELEMENT_NODE && newTree.getAttribute('id') == null) {
        newTree.setAttribute('id', this.getHtmlNodeId());
      }

      var patches = TreeComparator.diff(currentTree, newTree, (node1, node2) => {
        // skip comparisons on our child's Component slots (child components are the responsible ones) 
        // the parent component, once re-rendered, will see its child slots empty again, but
        // we don't want to replace those slot with the empty one, so we skip those patches
        if (node1.id && node2.id && node1.id == node2.id && (node1.id in this.childComponentIds)) {
          // do not replace a component slot with a node with the same id, skip this operation
          console.log('Component [#' + this.htmlNodeId + ']: skipping child inspection: ' + node1.id);
          return 'SKIP';
        } else if (node1.id && (node1.id in this.childComponentIds)) {
          // we want to replace a component slot with another stuff, do complete replacement (maybe the slot is removed)
          return 'REPLACE';
        }
        return 'DIFF';
      });

      TreeComparator.applyPatches(patches);

      // restore child component subtrees
      this.childComponents.forEach((childComponent) => {
        var childId = childComponent.getHtmlNodeId();
        if (this._getChildNode(childId) != null && savedChildNodes[childId] != null) {
          var currentComponentNode = this._getChildNode(childId);
          if (savedChildNodes[childId] != currentComponentNode) {
            currentComponentNode.parentNode.replaceChild(savedChildNodes[childId], currentComponentNode);
          }
        }
      });
    });
  }

  render() {
    this.renderModelChanges();
  }

  // lifecycle management
  stop() {
    if (this.stopped == false) {
      this.stopped = true;

      this.childComponents.forEach((child) => {
        child.stop();
      });
    }
  }

  start() {
    if (this.stopped) {
      this.stopped = false;

      this.render();

      this.childComponents.forEach((child) => {
        child.start();
      });
    }
    this.onStart();
  }

  // event-listener management

  addEventListener(eventType, nodesQuery, callback) {
    if (!(nodesQuery in this.eventListeners)) {
      this.eventListeners[nodesQuery] = [];
    }

    this.eventListeners[nodesQuery].push({
      callback: callback,
      eventType: eventType
    });

    this._addEventListener(nodesQuery, eventType, callback);
  }

  // Hooks

  beforeRender() { //hook
  }
  afterRender() { //hook
  }
  onStart() { //hook
  }

  // "private" methods
  _getComponentNode() {
    return document.getElementById(this.getHtmlNodeId());
  }

  _getChildNode(childId) {
    return this._getComponentNode().querySelector('#' + childId);
  }

  _doRender(callback) {
    if (this.rendering === true) {
      //avoid recursion
      return;
    }

    this.rendering = true;
    if (this.stopped || !this.htmlNodeId || this._getComponentNode() === null) {
      this.rendering = false;
      return;
    }

    this.beforeRender();

    var htmlContents = this.renderer().trim();

    callback(htmlContents);

    this._updateEventListeners();

    this._createTagChildComponents();

    this.afterRender();

    this.rendering = false;
  }

  _createTagChildComponents() {

    if (!this.childComponentsByTag) {
      this.childComponentsByTag = {};
    }

    this.childTags.forEach((childTag) => {
      if (!this.childComponentsByTag[childTag]) {
        this.childComponentsByTag[childTag] = [];
      }
      var childTagElements = Array.from(this._getComponentNode().getElementsByTagName(childTag));

      var childIds = [];
      for (var i = 0; i < childTagElements.length; i++) {
        var childTagElement = childTagElements[i];
        var itemId = childTagElement.getAttribute('id');
        childIds.push(itemId);

        if (!this.getChildComponent(itemId)) {
          var component = this.createChildComponent(childTag, childTagElement, itemId);
          if (component) {
            component.setHtmlNodeId(itemId);
            this.addChildComponent(component);
            this.childComponentsByTag[childTag].push(component);
          }
        }
      }

      for (var i = this.childComponentsByTag[childTag].length - 1; i >= 0; i--) {
        var childComponent = this.childComponentsByTag[childTag][i];
        if (childIds.indexOf(childComponent.getHtmlNodeId()) === -1 &&
          this._getComponentNode().querySelector('#' + childComponent.getHtmlNodeId()) === null) {

          this.removeChildComponent(childComponent);
          this.childComponentsByTag[childTag].splice(i, 1);
        }
      }
    });
  }

  createChildComponent(tagName, childTagElement, id) {
    var constructorFunction = eval('' + tagName);

    if (constructorFunction instanceof Function) {
      return new constructorFunction(id);
    }
  }




  _updateEventListeners() {
    this._clearAllEventListeners();
    for (var nodesQuery in this.eventListeners) {
      this.eventListeners[nodesQuery].forEach((listenerSpec) => {
        console.log('Component [#' + this.htmlNodeId + ']: adding listener ' + nodesQuery);
        this._addEventListener(
          nodesQuery, listenerSpec.eventType, listenerSpec.callback);
      });
    }
  }

  _clearAllEventListeners() {
    this._listeners.forEach((listenerSpec) => {
      console.log('Component [#' + this.htmlNodeId + ']: removing listener');
      listenerSpec.node.removeEventListener(
        listenerSpec.eventType, listenerSpec.callback);
    });
    this._listeners = [];
  }

  _addEventListener(nodesQuery, eventType, callback) {
    if (this.htmlNodeId && this._getComponentNode()) {
      this._getComponentNode().querySelectorAll(nodesQuery).forEach((element) => {
        element.addEventListener(eventType, callback);
        this._listeners.push({
          node: element,
          eventType: eventType,
          callback: callback
        });
      })
    }
  }


}

/*********** DOM TREE DIFF & PATCH *******/
class TreeComparator {
  static diff(node1, node2, comparePolicy) {
    if (comparePolicy) {
      var actionToDo = comparePolicy(node1, node2);
      if (actionToDo === 'SKIP') {
        return [];
      } else if (actionToDo === 'REPLACE') {
        return [{
          toReplace: node1,
          replacement: node2
        }];
      } //otherwise, i.e.: 'DIFF', do nothing
    }

    var result = [];

    if (node1 == null ||
      node1.tagName !== node2.tagName ||
      node1.nodeType !== node2.nodeType ||
      (
        node1.nodeValue !== null &&
        node2.nodeValue !== null &&
        node1.nodeValue !== node2.nodeValue
      )) {
      return [{
        toReplace: node1,
        replacement: node2
      }];

    } else if (node1.childNodes.length > 0 || node2.childNodes.length > 0) { //lets look at children
      TreeComparator._compareChildren(node1, node2, comparePolicy, result);
    }

    if (!TreeComparator.equalAttributes(node1, node2)) {
      result.push({
        mode: 'attributes',
        toReplace: node1,
        replacement: node2
      });
    }
    return result;
  }

  static _compareChildren(node1, node2, comparePolicy, result) {
    var keyElementIndexNode1 = {};
    var keyElementIndexNode2 = {};
    TreeComparator._buildChildrenKeyIndex(node1, node2, keyElementIndexNode1, keyElementIndexNode2);
    var child1pos = 0;
    var child2pos = 0;
    var insertions = 0;
    var deletions = 0;
    var child1Array = Array.from(node1.childNodes); //copy node1 childs to an array, sinde we will do some swaps here, but we do not want to do them in DOM now
    node1.childNodes.forEach((node) => {})
    while (child1pos < node1.childNodes.length && child2pos < node2.childNodes.length) {
      var child1 = child1Array[child1pos];
      var child2 = node2.childNodes[child2pos];

      if (child1.nodeType !== Node.ELEMENT_NODE && child2.nodeType === Node.ELEMENT_NODE) {
        result.push({
          mode: 'remove-node',
          toReplace: child1
        });
        child1pos++;
        deletions++;
        continue;
      }

      if (child1.nodeType === Node.ELEMENT_NODE && child2.nodeType !== Node.ELEMENT_NODE) {
        result.push({
          mode: 'insert-node',
          toReplace: node1,
          replacement: child2,
          beforePos: child1pos + insertions - deletions
        });
        insertions++;
        child2pos++;
        continue;
      }

      if (child1.nodeType !== Node.ELEMENT_NODE && child2.nodeType !== Node.ELEMENT_NODE) {
        var partial =
          TreeComparator.diff(
            child1,
            child2,
            comparePolicy);
        result.push.apply(result, partial);

        child1pos++;
        child2pos++;
        continue;
      }

      // both ar key-based element nodes

      // do we have to swap them?
      var key1 = child1.getAttribute('key');
      var key2 = child2.getAttribute('key');

      if (key1 !== key2) {
        if ((key1 in keyElementIndexNode2) && (key2 in keyElementIndexNode1)) {
          //both nodes are in the initial and final result, so we only need to swap them
          result.push({
            mode: 'swap-nodes',
            toReplace: child1,
            replacement: node1.childNodes[keyElementIndexNode1[key2].pos]
          });
          TreeComparator._swapArrayElements(child1Array, child1pos, keyElementIndexNode1[key2].pos);

        } else {
          //both nodes are NOT in the initial and final result
          if (!(key2 in keyElementIndexNode1)) {
            // if a key element in the new result is missing in the current tree, we should insert it
            result.push({
              mode: 'insert-node',
              toReplace: node1,
              replacement: child2,
              beforePos: child1pos + insertions - deletions
            });
            insertions++;
            child2pos++;

          }
          // and if a key element in the current result is missing in the new result, we should remove it
          if (!(key1 in keyElementIndexNode2)) {
            result.push({
              mode: 'remove-node',
              toReplace: child1
            });
            child1pos++;
            deletions++;

          }
        }

      } else {
        var partial =
          TreeComparator.diff(
            child1,
            child2,
            comparePolicy);
        result.push.apply(result, partial);

        child1pos++;
        child2pos++;
      }
    }

    if (child1pos < node1.childNodes.length) {
      for (var i = child1pos; i < node1.childNodes.length; i++) {
        result.push({
          mode: 'remove-node',
          toReplace: node1.childNodes[i]
        });
      }
    } else if (child2pos < node2.childNodes.length) {
      for (var i = child2pos; i < node2.childNodes.length; i++) {
        result.push({
          mode: 'append-child',
          toReplace: node1,
          replacement: node2.childNodes[i]
        });
      }
    }
  }

  static _swapArrayElements(arr, indexA, indexB) {
    var temp = arr[indexA];
    arr[indexA] = arr[indexB];
    arr[indexB] = temp;
  }

  static _buildChildrenKeyIndex(node1, node2, keyElementIndexNode1, keyElementIndexNode2) {

    //check if node2 children are all key-based 
    var child1pos = -1;
    node2.childNodes.forEach((node) => {
      child1pos++;
      if (node.nodeType === Node.ELEMENT_NODE) {
        var key = node.getAttribute('key');
        if (key) {
          keyElementIndexNode2[key] = {
            node: node,
            pos: child1pos
          };
        }
      }
    });

    var child2pos = -1;
    node1.childNodes.forEach((node) => {
      child2pos++;
      if (node.nodeType === Node.ELEMENT_NODE) {
        var key = node.getAttribute('key');
        if (key) {
          keyElementIndexNode1[key] = {
            node: node,
            pos: child2pos
          };
        }
      }
    });
    //  return check;
    return true;
  }

  static equalAttributes(node1, node2) {
    if (!node1.attributes && node2.attributes ||
      node1.attributes && !node2.attributes) {
      return false;
    } else if (
      node1.attributes &&
      node1.attributes.length != node2.attributes.length) {
      return false;
    } else if (node1.attributes) {
      for (var i = 0; i < node1.attributes.length; i++) {
        if (node1.attributes[i].name != node2.attributes[i].name ||
          node1.attributes[i].value != node2.attributes[i].value) {
          return false;
        }
      }
    }
    return true;
  }

  static _swapElements(obj1, obj2) {
    var temp = document.createElement("div");
    obj1.parentNode.insertBefore(temp, obj1);
    obj2.parentNode.insertBefore(obj1, obj2);
    temp.parentNode.insertBefore(obj2, temp);
    temp.parentNode.removeChild(temp);
  }

  static applyPatches(patches) {
    patches.forEach((patch) => {
      // HTML nodes
      var toReplace = patch.toReplace;
      var replacement = patch.replacement;
      if (patch.mode === 'attributes') {
        for (var i = 0; i < replacement.attributes.length; i++) {
          var attribute = replacement.attributes[i];
          if (attribute.name === 'value' &&
            toReplace.value != attribute.value) {
            toReplace.value = attribute.value;
          }
          if (attribute.name === 'checked') {
            toReplace.checked =
              (attribute.checked != false) ? true : false;
          }
          toReplace.setAttribute(attribute.name, attribute.value);
        }

        for (var i = toReplace.attributes.length - 1; i >= 0; i--) {
          var attribute = patch.toReplace.attributes[i];
          if (!replacement.hasAttribute(attribute.name)) {
            if (attribute.name === 'checked') {
              toReplace.checked = false;
            }
            toReplace.removeAttribute(attribute.name);
          }
        }
      } else if (patch.mode === 'remove-node') {
        patch.toReplace.parentNode.removeChild(patch.toReplace);
      } else if (patch.mode === 'append-child') {
        patch.toReplace.appendChild(patch.replacement);
      } else if (patch.mode === 'insert-node') {
        if (patch.toReplace.childNodes.length === 0) {
          patch.toReplace.appendChild(patch.replacement);
        } else {
          patch.toReplace.insertBefore(patch.replacement, patch.toReplace.childNodes[patch.beforePos]);
        }
      } else if (patch.mode === 'swap-nodes') {
        TreeComparator._swapElements(patch.toReplace, patch.replacement);
      } else {
        toReplace.parentNode.replaceChild(replacement, toReplace);
      }
    });
  }
}

/**
  A Model is an Observable object.
  
  The object can receive observers (via addObserver), which will be notified
  when the set( callback ) method of this object is called.
    
*/
class Model {
  constructor(name) {
    this.observers = [];
    this.name = name ? name : '--unnamed model--';
  }

  set(update, hint) {
    update(this);
    this.notifyObservers(hint);
  }

  notifyObservers(hint) {
    this.observers.forEach((observer) => {
      observer.update(this, hint);
    });
  }
  addObserver(observer) {
    this.observers.push(observer);
    console.log('Model [' + this.name + ']: added observer, total: ' + this.observers.length);
  }

  removeObserver(observer) {
    if (this.observers.indexOf(observer) != -1) {
      this.observers.splice(this.observers.indexOf(observer), 1);
      console.log('Model [' + this.name + ']: removed observer, total: ' + this.observers.length);
    }
  }
}


/* 
  ModelComponent class
  
  A ModelComponent is a Component whose responsibilities are:
    - Render into HTML a given Model object by using a renderer function which takes
      as argument the Model instance
    - Listen for changes in Model object, updating the HTML
*/
class ModelComponent extends Component {

  constructor(modelRenderer, model, htmlNodeId, childTags) {
    super(() => {
      return modelRenderer(this._mergeModelInOneObject());
    }, htmlNodeId, childTags);



    if (!model) {
      this.models = [];
    } else if (model instanceof Model) {
      this.models = [model];
    } else if (model instanceof Array) {
      model.forEach((model) => {
        if (!model instanceof Model) {
          throw 'Component [' + this.htmlNodeId + ']: the model must inherit Model';
        }
      });
      this.models = model;
    } else {
      throw 'Component [' + this.htmlNodeId + ']: the model must inherit Model';
    }




  }

  update(model) {
    console.log('Component [#' + this.htmlNodeId + ']: received update from Model [' + model.name + ']');
    this.render();
  }

  // lifecycle management
  stop() {

    if (this.stopped == false) {
      this.models.forEach((model) => {
        model.removeObserver(this);
      });
    }
    super.stop();
  }

  start() {
    if (this.stopped) {
      this.models.forEach((model) => {
        model.addObserver(this);
      });
    }
    super.start();
  }


  _mergeModelInOneObject() {
    var context = {};
    this.models.forEach((model) => {
      context = Object.assign(context, model);
    });
    return context;
  }
  
  createChildComponent(tagName, childTagElement, id) {
    var oneModelObject = this._mergeModelInOneObject();
    if (childTagElement.getAttribute('model')) {
      var modelItem = eval('oneModelObject.' + childTagElement.getAttribute('model'));
    }
    return this.createChildModelComponent(tagName, childTagElement, id, modelItem);
  }
  
  createChildModelComponent(tagName, childTagElement, id, modelItem) {
    var constructorFunction = eval('' + tagName);

    if (constructorFunction instanceof Function) {
      return new constructorFunction(id, modelItem);
    }
  }
}

/*
  Router component
  
  This class is responsible of parsing the current browser location 
  mapping its current hash to "pages". Each time the location is
  changed, the router tries to replace the inner HTML in a given html node id
  element.
  
  Pages are:
    1. A Component, which will render the page contents.
    2. Some other options, such as title.
    
  You have to define your pages by setting the pages attribute of the Router,
  in the following form:
    
  {    
    login: { //rendered on http://<host>/<page>.html#login
      component: new LoginComponent(userModel),
      title: 'Login'
    },
    // more pages
    defaultRoute: 'posts'
  }

  Calling start() will try to go to the page indicated by the hash, rendering
  its contents.
*/
class RouterComponent extends ModelComponent {
  constructor(rootHtmlId, modelRenderer, routeContentsHtmlId, model) {

    // add a routerModel to the given model(s), creating an array
    var routerModel = new Model('RouterModel');

    if (model instanceof Array) {
      model.push(routerModel)
    } else if (model != null) {
      model = [routerModel, model];
    } else {
      model = routerModel;
    }

    super(modelRenderer, model, rootHtmlId);

    this.routerModel = routerModel;
    this.routes = {};

    this.routerModel.currentPage = this._calculateCurrentPage();

    this.pageHtmlId = routeContentsHtmlId;

    window.addEventListener('hashchange', () => {
      console.log("Router: page changed");
      this.routerModel.set(() => {
        this.routerModel.currentPage = this._calculateCurrentPage();
      });
    });
  }

  update(model) {
    super.update(model);
    if (model == this.routerModel) {
      this._goToCurrentPage();
    }
  }
  setRouterConfig(routerConfig) {
    this.routes = routerConfig;
    this.routerModel.currentPage = this._calculateCurrentPage();
  }

  onStart() {
    this._goToCurrentPage();
  }

  goToPage(route) {
    window.location.hash = '#' + route;
  }

  getCurrentPage() {
    return this.routerModel.currentPage;
  }

  getRouterModel() {
    return this.routerModel;
  }

  getRouteQueryParam(name) {
    var queryString = window.location.hash.replace(/#[^\?]*(\?.*)/, "$1");
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(queryString);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  _calculateCurrentPage() {
    var currentPage = window.location.hash.replace(/#([^\\?]*).*/, "$1");
    if (currentPage.length == 0 && this.routes.defaultRoute) {
      currentPage = this.routes.defaultRoute;
    }
    return currentPage;

  }
  _goToCurrentPage() {
    var currentPage = this.getCurrentPage();

    if (currentPage) {

      // get page component and update the main body element
      if (currentPage in this.routes) {
        if (this.routes[currentPage].title) {
          document.title = this.routes[currentPage].title;
        }

        // stop the previous component
        if (this.currentComponent) {
          this.currentComponent.stop();
        }
        this.removeChildComponent(this.currentComponent);

        // start the new page's component
        this.currentComponent = this.routes[currentPage].component;
        this.currentComponent.setHtmlNodeId(this.pageHtmlId);

        this.addChildComponent(this.currentComponent);
        this.routes[currentPage].component.start();

      } else {
        console.log('Router undefined page ' + currentPage);
      }
    } else {
      console.log('Router: no default page defined');
    }
  }
}
