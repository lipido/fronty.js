/**
 * A Model is a general-purpose, observable object, holding user specific data.
 *
 *  The object can receive <em>observer functions</em> (via
 * {@link Model#addObserver|addObserver()} function), which will be notified
 *  when the {@link Model#set|set( callback )} method of this object is called.
 *
 */
export class Model {
    /**
     * Creates an instance of a Model.
     *
     * @param {String} [name=--unnamed model--] A name for the model
     */
    constructor(name?: string);
    /**
     * The set of observer functions to be called when this Model is changed
     * via {@link Model#set|set()} method.
     */
    observers: any[];
    /**
     * The name of the model.
     * @type {String}
     */
    name: string;
    /**
     * Method to update the this Model.<br>
     * A callback function is passed which is, typically, in charge to make changes
     * in this object. When this callback returns, observers of this Model are
     * notified.
     * @example
     *  Model m = new Model('mymodel');
     *  m.set( () => { m.itemName='Tablet'; m.price=1200});
     *
     * @param {Function} updater The callback function in charge of changing this
     *        Model. The function will receive the reference to this Model as
     *        parameter.
     * @param {Object} [hint] Any additional object to be passed to
     *         {@link Model#observers|observers} during notification.
     */
    set(updater: Function, hint?: any): void;
    /**
     * Invokes all {@link Model#observers|observers}.
     *
     * @param {Object} [hint] An optional object to pass as argument to observers.
     */
    notifyObservers(hint?: any): void;
    /**
     * Adds an observer function to this Model.<br>
     *
     * @param {Function} observer The observer to add.
     * @see {@link Model#observers}
     */
    addObserver(observer: Function): void;
    /**
     * Removes an observer function from this Model.<br>
     *
     * The function will no longer be notified of changes in this Model.
     *
     * @param {Function} observer The observer to be removed.
     */
    removeObserver(observer: Function): void;
}
/**
 * Class representing a model-based Component.<br>
 *
 * A ModelComponent is a Component which <em>auto-renders</em> itself when a
 * given {@link Model|model} object changes. This model object is also passed to this
 * Component's {@link Component#renderer|renderer function} each time this
 * Component is rendered.
 *
 * @example
 * <!-- html page -->
 * <body>
 *  <div id="mycomponent"></div>
 * </body>
 *
 * @example
 * // Javascript
 * // Model
 * var model = new Model();
 * model.counter = 0;
 *
 * // The ModelComponent to render the Model
 * var component = new ModelComponent(
 *  (m) => '<div>Counter: <span>'+m.counter+'</span></div>', // renderer function
 *  model, //the model
 *  'mycomponent' // HTML element id
 *  );
 *
 * component.start(); // first render
 *
 * // Make changes in Model to fire re-renders
 * setInterval(() => {
 *    model.set( () => model.counter++); // model update -> automatic re-render!
 * }, 1000);
 * @extends Component
 */
export class ModelComponent extends Component {
    /**
     * Creates a new ModelComponent.
     *
     * @param {Function} modelRenderer A renderer function which accepts a
     * {@link Model} as argument.
     * @param {Model} model The default model. You can add more models with {@link ModelComponent#addModel}.
     * @param {String} htmlNodeId The id of the HTML element where this Component should
     *                              render to.
     * @param {Array.<String>} [childTags] An optional Array of strings of custom-tags for dynamically created child Components.
     */
    constructor(modelRenderer: Function, model: Model, htmlNodeId: string, childTags?: Array<string>);
    models: {};
    updater: any;
    /**
     * Adds a secondary model to this model component.
     *
     * <p>ModelComponents can have more than one model. The model passed in the
     * constructor is the 'default' model. Additional models must have a name.
     * When the modelRenderer function is called, the passed object to the function
     * will contain the 'default' model itself and all the additional models under
     * their respective names. For example, a code like:</p>
     * <pre><code>
     * var myModel = new Fronty.Model();
     * myModel.value = 'foo';
     * var mySecondaryModel = new Fronty.Model();
     * mySecondaryModel.value = 'bar';
     * var myModelComponent = new Fronty.ModelComponent(..., myModel, ...);
     * myModelComponent.addModel('secondary', mySecondaryModel);
     * </code></pre>
     * will pass the following object to the model renderer function:
     * <pre>
     * <code>
     * {
     *    value: 'foo',
     *    secondary: {
     *        value: 'bar'
     *    }
     * }
     * </code></pre>
     * @param {String} modelName The name for the additional model
     * @param {Model} model The additonal model
     */
    addModel(modelName: string, model: Model): void;
    /**
     * The observer function added to all models this ModelComponent manages.<br>
     * This function simply calls {@link ModelComponent#render|render}, but
     * you can override it.
     *
     * @param {Model} model The model that has been updated.
     */
    update(model: Model): void;
    /**
     * Sets the model for this ModelComponent.
     *
     * <p>The component will be re-rendered</p>
     *
     * @param {Model|Array<Model>} model The model(s) to be set.
     */
    setModel(model: Model | Array<Model>, modelName?: string): void;
    _mergeModelInOneObject(): any;
    /**
     * Overrides the child Component creation by also considering a "model"
     * attribute in the tag.<br>
     * The model attribute is used as a path inside the model object and calls
     * {@link ModelComponent#createChildModelComponent}.
     * @example
     * <!-- How to add a model attribute in the HTML child tag -->
     * <childcomponent id="child-0" model="items[0]">
     *
     * @param {String} tagName The HTML tag name used to place the new child Component
     * in the parent HTML
     * @param {Node} childTagElement The HTML element where the new Child will be placed
     * @param {String} id The HTML id found in the tag.
     * @return {Component} The new created child Component.
     * @see {@link Component#childTags}
     */
    createChildComponent(className: any, element: any, id: string): Component;
    /**
     * This method searches for a class with the name of the className parameter
     * with a constructor taking two attributes: id and model.<br>
     * If you have components with different constructors or this policy does not
     * adapt to your needs, you can override this method.
     *
     * @param {String} className The class name found in the element
     * @param {Node} element The HTML element where the new child will be placed
     * @param {String} id The HTML id found in the element.
     * @param {Object} modelItem a model object for the new Component.
     * @return {Component} The new created child component.
     */
    createChildModelComponent(className: string, element: Node, id: string, modelItem: any): Component;
    _evaluateModelAttribute(modelAtt: any): any;
}
/**
 *  Class representing a component, which is an object whose responsibilities
 *  are:
 *  <ul>
 *    <li>Render the HTML results of a provided
 *    {@link Component#renderer|renderer function} inside a specified element of
 *   the showing document, making as less DOM changes as possible.</li>
 *    <li>Manage nested child components. Child components are components which
 *      render in an element inside this component. When <em>this</em> Component
 *      re-renders, it restores its child's subtrees on their places. Child Components
 *      can be added manually (See {@link Component#addChildComponent}) or created
 *      dynamically by <em>this</em> Component via
 *      "fronty-component" attribute or via custom tag elements
 *      (See {@link Component#createChildComponent} and {@link Component#childTags}).</li>
 *    <li>Manage event listeners, by placing a global listener at the root of
 *    <em>this</em> component's root element, which redirects events on inner
 *    targets to the proper listener.</li>
 *  </ul>
 *  <p>Components render when you call {@link Component#start|start()},
 * and update each time you call the {@link Component#render|render()}
 * function.</p>
 *
 * @example
 * <!-- html page -->
 * <body>
 *  <div id="mycomponent"></div>
 * </body>
 *
 * @example
 * //Javascript
 * var counter = 1;
 * var component = new Component(
 *  () => '<div>Counter: <span>'+counter+'</span></div>', // renderer function
 *  'mycomponent' // HTML element id
 *  );
 * component.start(); // first render
 * setInterval(() => {
 *    counter++;
 *    component.render(); // component re-render
 * }, 1000);
 */
export class Component {
    /**
     * Creates a new Component.
     *
     * @constructor
     * @param {Function} renderer A non-parameter function that returns HTML.
     * @param {String} htmlNodeId The id of the HTML element where this Component should
     *                              render to.
     * @param {Array.<String>} [childTags] An optional Array of strings of custom-tags for
     *                         dynamically created child Components
     *                        (See {@link Component#createChildComponent}).
     */
    constructor(renderer: Function, htmlNodeId: string, childTags?: Array<string>);
    /**
     * The renderer function.
     *
     * @name Component#renderer
     * @type Function
     * @callback
     * @return {String} HTML content. It <strong>must</strong> return a single root element.
     * @default null
     */
    renderer: Function;
    /**
     * The HTML element id where it renders into.
     * @name Component#htmlNodeId
     * @type String
     * @default null
     */
    htmlNodeId: string;
    /**
     * The optional name of custom element tags where child Components will
     * be created dynamically.<br>
     *
     * During render, if in the HTML provided by the {@link Component#renderer|renderer function}
     * one of these tags is found, the {@link Component#createChildComponent|createChildComponent()}
     * function is called.
     *
     * @name Component#childTags
     * @type Array.<String>
     * @default empty array
     */
    childTags: Array<string>;
    _childTagsCanonical: string[];
    /**
     * Whether this Component is stopped.<br>
     *
     * Stopped Components do not render.
     *
     * @name Component#stopped
     * @type Boolean
     * @default true
     */
    stopped: boolean;
    /**
     * The event listeners that this Component is managing.
     * See {@link Component#addEventListener|addEventListener()}.
     *
     * @name Component#eventListeners
     * @type {Object.<string, {callback: Function, eventType: String}>}
     */
    eventListeners: {
        [x: string]: {
            callback: Function;
            eventType: string;
        };
    };
    /**
     * The array of child components.
     *
     * @name Component#childComponents
     * @type Array.<Component>
     */
    childComponents: Array<Component>;
    /**
     * The child components, arranged by their HTML element id.
     *
     * @name Component#childComponentIds
     * @type Object.<string, Component>
     */
    childComponentIds: {
        [x: string]: Component;
    };
    _boundEventsListener: any;
    _previousVirtualDOM: HTMLDivElement;
    _nodesWithFrontyComponentAttribute: any[];
    _nodesWithCustomTag: any[];
    _parsingService: {
        parse(htmlContents: any, callback: any): void;
    };
    /**
     * Gets the HTML element's id where this Component should render.
     *
     * <p>This element will be replaced with the contents of this component
     * renderer function.</p>
     *
     * @returns {String} The HTML node id where this Component is rendered.
     */
    getHtmlNodeId(): string;
    /**
     * Sets the HTML element id where this Component should render in the next
     * rendering.
     *
     * <p>The element will be replaced with the contents of this component
     * renderer function.</p>
     *
     * @param {String} htmlNodeId The HTML node id where this Component will
     *                            be rendered.
     */
    setHtmlNodeId(htmlNodeId: string): void;
    /**
     * Adds a child Component to this Component.
     *
     * <p>The HTML element where the child Component will render will not be re-rendered
     * when <em>this</em> Component (the parent) is re-rendered.</p>
     *
     * <p>The child component will be started (and thus immediately rendered) or stopped
     * if this Component is currently started or stopped, respectively.</p>
     *
     * @param {Component} component The child Component.
     */
    addChildComponent(component: Component): void;
    /**
     * Creates a new child Component for a specified class name to be placed in a
     * given HTML element. This method is intended to be overrided
     * by subclasses.
     *
     * <p>Parent components define where to create new children via their rendered
     * HTML in two ways:
     * <ul>
     * <li>Via <code>fronty-component</code> attribute. An element like
     * <code>&lt;div fronty-component="ChildComponent"&gt;&lt;/div&gt;</code>
     * indicates that <code>ChildComponent</code> instances should be created and rendered
     * on that element.</li>
     *
     * <li>Via custom HTML tag. These tags
     * must be indicated in the constructor of the component. For example:
     * <code>new Component(renderer, 'parentId', ['ChildComponent'])</code>,
     * indicates that <code>ChildComponent</code> should be created
     * and rendered into when elements with this tag name are found.
     * <b>Note:</b> Remember that custom HTML tags do not work at any
     * place. For example, as child of a <code>&lt;table&gt;</code> element.</li>
     * </ul></p>
     * <p>Everytime a new element indicating that a child should be created, this
     * method is called to create the real instance.</p>
     *
     * <p><b>Note:</b> By default, this function uses <code>eval(''+className)</code>
     * to create the instance. If you are packing your application and this library
     * in different modules, eval may fail in finding the className. You must
     * override the method to create the child.</p>
     *
     * @param {String} className The class name found in the HTML element
     * @param {Node} element The HTML element where the new child will be placed
     * @param {String} id The HTML id found in the tag.
     * @return {Component} The new created child component.
     * @see {@link Component#childTags}
     */
    createChildComponent(className: string, element: Node, id: string): Component;
    /**
     * Removes a child Component from this Component.
     *
     * <p>After the child removal, <em>this</em> component will re-render.</p>
     *
     * @param {Component} component The child Component.
     */
    removeChildComponent(component: Component): void;
    /**
     * Gets the child Components of this Component.
     *
     * @returns {Array.<Component>} The child Components.
     */
    getChildComponents(): Array<Component>;
    /**
     * Gets the child Components arranged by id.
     *
     * @returns {Array.<String, Component>} The child Components arranged by id.
     */
    getChildComponentsById(): Array<string, Component>;
    /**
     * Gets a child Component given its HTML element id.
     *
     * @param {String} id The HTML element id.
     * @returns {Component} The child Component.
     */
    getChildComponent(id: string): Component;
    /**
     * Render this Component, which consists in:
     * <ol>
     * <li>Call the {@link Component#renderer|renderer function}.</li>
     * <li>Calculate the differences between the previous "virtual" DOM of this Component
     * and the new "virtual" DOM provided by the renderer function, skipping those
     * elements where child nodes are rendering.</li>
     * <li>Patch the previous "virtual" DOM with the previously computed differences,
     * and save it as the next previous "virtual" DOM.</li>
     * <li>Patch the real DOM with the previously computed differences.</li>
     * <li>Restore the child Components in their new places if they where moved to another
     * part in the DOM.</li>
     * <li>Create child nodes if new elements with tag name in
     * {@link Component#childTags} or with <code>fronty-component</code> attribute
     * are found in the HTML.</li>
     * </ol>
     */
    render(): void;
    rendering: boolean;
    buildFirstRenderTree(callback: any): void;
    computePatches(currentTree: any, callback: any): void;
    /**
     * Stops this Component and all of its children.<br>
     *
     * Stopped Components do not render. Once this Component
     */
    stop(): void;
    /**
     * Starts this Component and all of its children.<br>
     *
     * A Component need to be started in order to render. If this Component
     * was stopped, it will render. Once this Component has been started and
     * rendered, the {@link Component#onStart|onStart()} hook is called.
     */
    start(): void;
    /**
     * Adds an event listener to HTML element(s) inside this Component.<br>
     *
     * Listeners added to elements controlled by this Component should be added
     * via this method, not directly to the HTML elements, because they can be
     * removed during re-render. Listeners added with this method are always
     * restored to the elements matching the selector query after rendering.
     *
     * @param {String} eventType The event type to be added to the elements.
     * @param {String} nodesQuery A HTML selector query to find elements to
     * attach the listener to.
     * @param {Function} callback The callback function to dispatch the event.
     */
    addEventListener(eventType: string, nodesQuery: string, callback: Function): void;
    /**
     * Hook function called by this Component before rendering. As a hook, it is
     * intended to be overriden by subclasses.
     */
    beforeRender(): void;
    /**
     * Hook function called by this Component after rendering. As a hook, it is
     * intended to be overriden by subclasses.
     */
    afterRender(): void;
    /**
     * Hook function called by this Component just after start. As a hook, it is
     * intended to be overriden by subclasses.
     */
    onStart(): void;
    /**
     * Hook function called by this Component just after stop. As a hook, it is
     * intended to be overriden by subclasses.
     */
    onStop(): void;
    renderNewDOM(callback: any): void;
    _resolveRealNode(node: any): any;
    _resetVirtualDOM(): void;
    _restoreChildNodes(): void;
    _getPreviousRealRootNode(): any;
    _getComponentNode(): HTMLElement;
    _getChildNode(childId: any): HTMLElement;
    _cloneAndIndex(root: any): any;
    _createChildComponents(): void;
    _createDynamicChildComponents(nodes: any): void;
    _createOrUpdateChildComponent(className: any, node: any, nodeId: any, bufferedParsingService: any): void;
    /**
     * Called when the parent ir rendered. This method does nothing. It is
     * intended to be overriden
     *
     */
    updateChildComponent(className: any, node: any, nodeId: any): void;
    _createAndAddChildComponent(className: any, element: any, id: any, parsingService: any): void;
    _eventsListener(event: any): void;
    _updateEventListeners(): void;
}
export namespace Component {
    export { ParsingService };
    export { BufferedParsingService };
    export let _defaultParsingService: {
        parse(htmlContents: any, callback: any): void;
    };
}
/**
 *  Class representing a router component.<br>
 *
 *  A router is reponsible of parsing the current browser location
 *  mapping its current hash to "pages". Each time the location is
 *  changed, the router tries to replace the inner HTML in a given html node id
 *  element.Pages are:
 * <ol>
 *    <li>A Component, which will render the page contents.</li>
 *    <li>Some other options, such as title.</li>
 *  </ol>
 *  You have to define your by calling {@link RouterComponent#setRouterConfig}.<br>
 *  Finally, calling start() will try to go to the page indicated by the hash, rendering
 *  its contents.<br>
 *  The RouterComponent is a {@link ModelComponent} because it has an own Model
 *  containing the "currentPage" property.
 *
 * @example
 * var router = new RouterComponent(
 *      // id of the HTML element where router renders.
 *      'router',
 *      //HTML of the router.
 *      () => "<div id='router'><div id='maincontent'></div></div>",
 *      // id inside the router where the current page component renders.
 *      'maincontent');
 * router.setRouterConfig(
 * {
 *    login: { //rendered on http://<host>/<page>.html#login
 *      component: new LoginComponent(), // LoginComponent is a Component
 *      title: 'Login'
 *    },
 *    // more pages
 *    defaultRoute: 'login'
 * });
 * router.start();
 *
 * @extends ModelComponent
 */
export class RouterComponent extends ModelComponent {
    /**
     * Creates a new router.<br>
     *
     * @param {String} rootHtmlId The HTML element id where the router renders.
     * @param {Function} modelRenderer the model renderer function
     * @param {String} routeContentsHtmlId The HTML element id where the different views of the router are placed
     * @param {Model} model The model
     */
    constructor(rootHtmlId: string, modelRenderer: Function, routeContentsHtmlId: string, model: Model);
    _routerModel: Model;
    routes: {};
    pageHtmlId: string;
    /**
     * Sets the router configuration. This configuration basically maps
     * URL hashes to Components that should be showed.
     *
     * @param {Object.<String, {component: Component, title: String}>}
     * routerConfig Mapping of URL hashes to pages.
     *
     * @example
     * router.setRouterConfig(
     * {
     *    login: { //rendered on http://<host>/<page>.html#login
     *      component: new LoginComponent(), // LoginComponent is a Component
     *      title: 'Login'
     *    },
     *    // more pages
     *    defaultRoute: 'login'
     * });
     */
    setRouterConfig(routerConfig: any): void;
    /**
     * Displays to an specified page. Pages are defined in
     * {@link RouterComponent#setRouterConfig}
     *
     * @param {String} route The route to go. Example: 'login'
     */
    goToPage(route: string): void;
    /**
     * Gets the current page being shown.
     * @return {String} The current page.
     */
    getCurrentPage(): string;
    /**
     * Gets this the model of this router.<br>
     *
     * The router contains an internal model where the current page is stored
     * (among those models provided in the constructor). You can obtain this
     * internal model by calling this function.
     *
     * @return {Model} The model of this router.
     */
    getRouterModel(): Model;
    /**
     * Gets a query parameter of the current route.<br>
     *
     * Note: <em>route query parameters</em> are NOT the standard URL query
     * parameters, which are specified BEFORE the hash.<br>
     *
     * For example, if the current URL is 'index.html#login?q=1',
     * a call to getRouteQueryParam('q') returns 1.
     *
     * @param {String} name The name of the route query parameter.
     * @return The value of the router query parameter.
     */
    getRouteQueryParam(name: string): string;
    _calculateCurrentPage(): string;
    _goToCurrentPage(): void;
    currentComponent: any;
}
/*********** DOM TREE DIFF & PATCH *******/
/**
 * A class to do discover differences between two DOM trees, calculating a
 * <em>patch</em>, as well as to reconcile those differences by applying the
 * <em>patch</em>
 */
export class TreeComparator {
    /**
     * Compute the difference between two DOM trees, giving their root nodes.<br>
     *
     * The resulting object is a <em>patch</em> object that can be used to
     * keep the first given tree equivalent to the second given tree.<br>
     *
     * An optional function can be provided to control how different subtrees are
     * compared. This function receives two nodes (node1, node2) and can return:
     * <ul>
     * <li>TreeComparator.COMPARE_POLICY_DIFF: The comparison should be done as normal.</li>
     * <li>TreeComparator.COMPARE_POLICY_SKIP: The comparison should not go deeper.</li>
     * <li>TreeComparator.COMPARE_POLICY_REPLACE: The node1 should be totally replaced by the node2,
     * without going deeper</li>
     * </ul>
     * @param {Node} node1 The root element of the first tree to compare.
     * @param {Node} node2 The root element of the second tree to compare.
     * @param {Function} [comparePolicy] An (optional) callback function to be called
     * before comparing subnodes.
     */
    static diff(node1: Node, node2: Node, comparePolicy?: Function): {
        mode: number;
        toReplace: Node;
        replacement: Node;
    }[];
    static _compareChildren(node1: any, node2: any, comparePolicy: any, result: any): void;
    static _swapArrayElements(arr: any, indexA: any, indexB: any): void;
    static _buildChildrenKeyIndex(currentIndex: any, node: any, start: any, untilFind: any): void;
    static _equalAttributes(node1: any, node2: any): any;
    static _swapElements(obj1: any, obj2: any): void;
    /**
     * Applies the patches to the current DOM.
     *
     * @param patches Patches previously computed with {@link TreeComparator.diff}
     */
    static applyPatches(patches: any, patchMapping: any): void;
}
export namespace TreeComparator {
    let PATCH_INSERT_NODE: number;
    let PATCH_REMOVE_NODE: number;
    let PATCH_SWAP_NODES: number;
    let PATCH_APPEND_CHILD: number;
    let PATCH_REPLACE_NODE: number;
    let PATCH_SET_NODE_VALUE: number;
    let PATCH_SET_ATTRIBUTES: number;
    let COMPARE_POLICY_SKIP: number;
    let COMPARE_POLICY_REPLACE: number;
    let COMPARE_POLICY_DIFF: number;
    let COMPARE_POLICY_ATTRIBUTES: number;
}
declare class ParsingService {
    parse(htmlContents: any, callback: any): void;
}
declare const BufferedParsingService_base: {
    new (): {
        parse(htmlContents: any, callback: any): void;
    };
};
declare class BufferedParsingService extends BufferedParsingService_base {
    currentHTML: string;
    counter: number;
    callbacks: any[];
    start(): void;
    finish(): void;
    parsedTree: HTMLDivElement;
}
export {};
//# sourceMappingURL=fronty.d.ts.map