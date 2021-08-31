import {
  capitalize,
  extend,
  isArray,
  isFunction,
  isPlainObject,
  toHandlerKey,
} from '@vue/shared';
import {
  createVNode,
  defineComponent,
  defineCustomElement,
  nextTick,
  render,
  VueElement,
} from 'vue';
import { createApp, h as createElement } from 'vue';

import getRequiredValidator from './prop-validation';
import {
  toVNodes,
  camelize,
  hyphenate,
  callHooks,
  getInitialProps,
  createCustomEvent,
  convertAttributeValue,
} from './utils.js';


/**
 *
 * @template Value
 * @param {Object} obj
 * @param {{
 *   key?: function(key: string, value?: *, index?: number): string,
 *   value?: function(value: *, key?: string, index?: number): Value
 * }} transforms
 *
 * @return {{[p: string]: Value}}
 */
function mapObj(obj, transforms) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value], index) => [
      isFunction(transforms.key)
        ? transforms.key(key, value, index)
        : key,
      isFunction(transforms.value)
        ? transforms.value(value, key, index)
        : value,
    ]),
  );
}

/**
 * Standardize props to their { type: Whatever } form
 * @see https://github.com/vuejs/vue-next/blob/540e26f49c09edf09b6a60ac2a978fdec52686bf/packages/runtime-core/src/componentProps.ts#L349
 * @param propsObj
 *
 * @return {Object<string, { type: Array|Function }>}
 */
function normalizeProps(propsObj) {
  if (isArray(propsObj) || !propsObj) {
    return {};
  }
  return mapObj(propsObj, {
    value: (opt) => (
      // Lifted straight from the function in @vue/runtime-core
      // https://github.com/vuejs/vue-next/blob/540e26f49c09edf09b6a60ac2a978fdec52686bf/packages/runtime-core/src/componentProps.ts#L405
      (isArray(opt) || isFunction(opt)) ? { type: opt } : opt
    ),
  });
}

export default function wrap(Component) {
  const options = typeof Component === 'function'
    ? Component.options
    : Component;

  let isInitialized = false;

  let hyphenatedPropsList;
  let camelizedPropsList;
  let camelizedPropsMap;
  let requiredPropsList;

  function initialize() {
    if (isInitialized) {
      return;
    }

    // extract props info
    const propsList = Array.isArray(options.props)
      ? options.props
      : Object.keys(options.props || {});
    hyphenatedPropsList = propsList.map(hyphenate);
    camelizedPropsList = propsList.map(camelize);
    const originalPropsAsObject = normalizeProps(options.props);
    camelizedPropsMap = mapObj(originalPropsAsObject, {
      key: camelize,
    });
    requiredPropsList = camelizedPropsList.filter((prop) => camelizedPropsMap[prop]?.required);

    // proxy props as Element properties
    // This is also necessary to make those properties assignable on the custom element instance
    camelizedPropsList.forEach(key => {
      Object.defineProperty(customElementClass.prototype, key, {
        get() {
          return this._props[key];
        },
        set(newVal) {
          let value;
          switch (camelizedPropsMap[key]?.type) {
            case Boolean: {
              value = (newVal === Boolean(newVal)) ? newVal : [
                '',
                'true',
                key,
              ].includes(newVal);
              if (value) {
                this.setAttribute(hyphenate(key), '');
              } else {
                this.removeAttribute(hyphenate(key));
              }
              break;
            }
            case Number:
              value = parseFloat(newVal);
              this._props[key] = value;
              if (newVal || newVal === 0) {
                this.setAttribute(hyphenate(key), newVal);
              } else {
                this.removeAttribute(hyphenate(key));
              }
              break;
            case String:
              if (newVal || newVal === '') {
                this.setAttribute(hyphenate(key), newVal);
              } else {
                this.removeAttribute(hyphenate(key));
              }
              break;
            default:
              value = newVal;
              this._props[key] = value;
          }
        },
        enumerable: true,
        configurable: true,
      });
    });

    isInitialized = true;
  }

  const customElementClassName = `${capitalize(camelize(options?.name))}VueCustomElement`;

  const customElementClass = class extends HTMLElement {
    static _vueComponentName = options.name; // For debugging
    _wrapper; // The mini Vue app
    _appComponent; // The mounted app component

    _props = {}; // The proxied properties
    _slotChildren = [];
    _mounted;

    constructor() {
      super();

      const eventProxies = this.createEventProxies(options.emits);

      const self = this;
      this._wrapper = createApp({
        name: `${options.name}-wrapper-app`,
        render() {
          const { dataVApp, ...props } = { // Discard dataVApp
            ...self._props,
            ...eventProxies,
          };

          // Don't render if missing required props
          const missingRequiredProp = requiredPropsList.find((propName) => (
            props[propName] === undefined
          ));
          if (missingRequiredProp) {
            console.debug(`Cannot render <${customElementClass._vueComponentName}> without required "${missingRequiredProp}" prop`);
            return;
          }
          return createElement(Component, props, () => self._slotChildren);
        },
        mounted() {
          self._mounted = true;
        },
        unmounted() {
          self._mounted = false;
        },
      });

      // Use MutationObserver to react to future attribute & slot content change
      // const observer = new MutationObserver(mutations => {
      //   let hasChildrenChange = false;
      //
      //   for (let i = 0; i < mutations.length; i++) {
      //     const m = mutations[i];
      //
      //     if (isInitialized && m.type === 'attributes' && m.target === this) {
      //       if (m.attributeName) {
      //         this.syncAttribute(m.attributeName);
      //       }
      //     } else {
      //       hasChildrenChange = true;
      //     }
      //   }
      //   if (hasChildrenChange) {
      //     // this.syncSlots();
      //   }
      // });
      // observer.observe(this, {
      //   childList: true,
      //   subtree: true,
      //   characterData: true,
      // });
    }

    createEventProxies(eventNames) {
      if (!eventNames) return {};

      const entries = eventNames.map((name) => [
        toHandlerKey(camelize(name)),
        (...args) => this.dispatchEvent(createCustomEvent(name, args)),
      ]);

      return Object.fromEntries(entries);
    }

    syncAttribute(key) {
      const camelized = camelize(key);
      let value;

      if (this.hasOwnProperty(key)) {
        value = this[key];
      } else if (this.hasAttribute(key)) {
        value = this.getAttribute(key);
      }
      const convertedValue = convertAttributeValue(value, key, camelizedPropsMap[camelized]);
      if (convertedValue !== this._props[camelized]) {
        this._props[camelized] = convertedValue;
      }
    }

    syncSlots() {
      this._slotChildren = toVNodes(
        this.childNodes,
        createElement,
      );
      this._appComponent?.$forceUpdate();
    }

    syncInitialAttributes() {
      const self = this;
      this._props = new Proxy(getInitialProps(camelizedPropsList), {
        set(...args) {
          const ret = Reflect.set(...args);
          self._appComponent?.$forceUpdate();
          return ret;
        },
      });
      hyphenatedPropsList.forEach(key => {
        this.syncAttribute(key);
      });
    }

    // WebComponent API methods ----------------------------------------------

    static get observedAttributes() {
      return hyphenatedPropsList;
    }

    attributeChangedCallback(name) { // `oldValue`, `newValue` params are also available
      this.syncAttribute(name);
    }

    connectedCallback() {
      if (!this._appComponent || !this._mounted) {
        if (isInitialized) {
          // initialize attributes
          this.syncInitialAttributes();
        }
        // initialize children
        this.syncSlots();

        // Mount the component
        this._appComponent = this._wrapper.mount(this);
      } else {
        // Call mounted on re-insert
        callHooks(this._appComponent, 'mounted');
      }
    }

    disconnectedCallback() {
      callHooks(this._appComponent, 'unmounted');
    }
  };

  // Attempt to rename the class for debuggability
  try {
    Object.defineProperty(customElementClass, 'name', {
      value: customElementClassName,
    });
  } catch (e) {
    console.debug(`Unable to rename custom element for ${options?.name}`, e);
  }

  initialize();

  return customElementClass;
}

/**
 * @param options
 * @todo SSR support w/ hydrate
 * @return {ReturnType<import('vue').defineCustomElement>}
 */
export function defineGuardedCustomElement(options) {
  const Comp = defineComponent(options);
  const {
    requiredProps,
    validateRequiredProps,
  } = getRequiredValidator(Comp.props);

  const customElementClassName = `${capitalize(camelize(Comp?.name))}VueCustomElement`;

  function getPropType(propName) {
    if (!Comp.props || Array.isArray(Comp.props)) {
      return null;
    }
    if (isPlainObject(Comp.props[propName])) {
      return Comp.props[propName].type;
    }
    return Comp.props[propName];
  }

  // The class ----------------------------------------------------------------
  const customElementClass = class extends VueElement {
    static def = Comp;
    static _requiredProps = requiredProps;

    _awaitingRequiredProps = false;

    constructor(initialProps) {
      super(Comp, initialProps);

      // Use a slot to allow styling by basically bypassing the shadowRoot
      this._shadowSlot = document.createElement('slot');
      this.shadowRoot.appendChild(this._shadowSlot);
    }

    /**
     * @param {import('vue').VNode|null} vnode
     * @private
     */
    _render(vnode) {
      if (vnode == null || validateRequiredProps(this._props)) {
        this._awaitingRequiredProps = false;
        const action = (vnode == null)
          ? 'Removing an existing'
          : (this._instance
            ? 'Re-rendering an existing'
            : 'Rendering a new'
          );
        render(vnode, this);
        console.debug(action, customElementClassName);
        return;
      }
      this._awaitingRequiredProps = true;
      render(null, this);
      console.debug(`Skipping rendering ${customElementClassName} due to one or more missing/invalid required props (${requiredProps})`);
    }

    connectedCallback() {
      this._connected = true;
      if (!this._instance) {
        this._resolveDef();
        this._render(this._createVNode());
      }
    }

    disconnectedCallback() {
      this._connected = false
      nextTick(() => {
        if (!this._connected) {
          this._render(null);
          this._instance = null;
        }
      })
    }

    _setAttr(key) {
      this._setProp(camelize(key), parseNumber(this.getAttribute(key)), false);
    }

    _setProp(key, val, shouldReflect = true) {
      if (key?.startsWith('ng')) {
        // Skip any attributes that start with `ng-`
        return;
      }

      if (val !== this._props[key]) {
        this._props[key] = val;
        if (val == null && getPropType(key) === Boolean) { // Let Vue set the default value
          delete this._props[key];
        }
        if (this._instance || (this._connected && this._awaitingRequiredProps)) {
          this._render(this._createVNode());
        }
        // reflect
        if (shouldReflect) {
          const attrName = hyphenate(key);
          if (val === true) {
            this.setAttribute(attrName, '');
          } else if (typeof val === 'string' || typeof val === 'number') {
            this.setAttribute(attrName, val + '');
          } else if (!val) {
            this.removeAttribute(attrName);
          }
        }
      }
    }

    _createVNode() {
      const vnode = createVNode(this._def, extend({}, this._props));
      if (!this._instance) {
        /**
         * Called by `createComponentInstance` as a way for custom element `VNode` to extend/override the behavior of its instance
         * @see {@link https://github.com/vuejs/vue-next/blob/7ffa225aa334f0fd7da6ba30bee9109de3597643/packages/runtime-core/src/component.ts#L439-L537|createComponentInstance()}
         * @param {import('vue').ComponentInternalInstance} instance
         */
        vnode.ce = (instance) => {
          this._instance = instance;
          instance.isCE = true;

          // HMR
          if (process.env.NODE_ENV !== 'production') {
            // FIXME: In the source, ^this condition^ used some fancy replacement that allows
            //        the build tool (rollup/vite?) to completely remove this block from the prod bundle.
            //        I still need to figure that out
            instance.ceReload = (newStyles) => {
              // always reset styles
              if (this._styles) {
                this._styles.forEach(s => this.removeChild(s));
                this._styles.length = 0;
              }
              this._applyStyles(newStyles);
              // if this is an async component, ceReload is called from the inner
              // component so no need to reload the async wrapper
              if (!(this._def).__asyncLoader) {
                // reload
                this._instance = null;
                this._render(this._createVNode());
              }
            };
          }

          instance.emit = this._emitCustomEvent;

          instance.parent = this.getParentInstance();
        };
      }
      return vnode;
    }

    // intercept emit
    _emitCustomEvent = (event, ...args) => {
      // If only one argument is passed, unwrap it for ergonomics
      let detail = args.length <= 1 ? args[0] : args;
      this.dispatchEvent(
        new CustomEvent(event, {
          detail,
        }),
      );
    };

    // locate nearest Vue custom element parent for provide/inject
    // TODO: get this to work with even normal vue components
    getParentInstance() {
      let parent = this;
      while ((parent = parent && (parent.parentNode || parent.host))) {
        if (parent instanceof VueElement) {
          return parent._instance;
        }
      }
      return null;
    }
  }

  // Attempt to rename the class for debuggability
  try {
    Object.defineProperty(customElementClass, 'name', {
      value: customElementClassName,
    });
  } catch (e) {
    console.debug(`Unable to rename custom element for ${options?.name}`, e);
  }

  return customElementClass;
}

/**
 * @TODO: this can just be imported from the library once https://github.com/vuejs/vue-next/pull/4393 is merged
 * @param {string|null} value
 * @return {string|number}
 */
export function parseNumber(value) {
  // for Number('') and Number(null) as they both become 0
  if (!value) return value;
  const casted = Number(value);
  return value === 'NaN' || !Number.isNaN(casted) ? casted : value;
}
