import {
  defineComponent,
  defineCustomElement,
  nextTick,
  render,
  VueElement,
} from 'vue';
import { createApp, h as createElement } from 'vue';
import {
  capitalize,
  isArray,
  isFunction,
  toHandlerKey,
} from '@vue/shared';

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
  const customElementClassName = `${capitalize(camelize(Comp?.name))}VueCustomElement`;

  // The class
  const customElementClass = class extends VueElement {
    static def = Comp;

    constructor(initialProps) {
      super(Comp, initialProps);

      // Use a slot to bypass the shadow
      this.shadowSlot = document.createElement('slot');
      this.shadowRoot.appendChild(this.shadowSlot);
    }

    /**
     * @param {import('vue').VNode|null} vnode
     * @private
     */
    _render(vnode) {
      // TODO: check invalid required
      render(vnode, this);
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

    _setProp(key, val, shouldReflect = true) {
      if (val !== this._props[key]) {
        this._props[key] = val;
        if (this._instance) {
          this._render(this._createVNode());
        }
        // reflect
        if (shouldReflect) {
          if (val === true) {
            this.setAttribute(hyphenate(key), '');
          } else if (typeof val === 'string' || typeof val === 'number') {
            this.setAttribute(hyphenate(key), val + '');
          } else if (!val) {
            this.removeAttribute(hyphenate(key));
          }
        }
      }
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
