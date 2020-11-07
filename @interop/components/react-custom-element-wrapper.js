import * as React from 'react';
import * as ReactDOM from 'react-dom';
import PropTypes from 'prop-types';



/**
 * Split an object into two based on whether a given predicate returns truthy.
 * @template Value
 * @param {Object<string, Value>} obj
 * @param {function(value:Value, key?:string, index?: number): boolean} predicate
 *
 * @return {string[][]} an array of two arrays of strings,
 *          where the first is the subset of the original for which the predicate evaluated to truthy,
 *          and the second is the remainder.
 */
function partitionKeys(obj, predicate) {
  const truthy = [];
  const falsy = [];

  Object.entries(obj).forEach(([key, value], index) => {
    const result = predicate(value, key, index);
    const bucket = Boolean(result) ? truthy : falsy;

    bucket.push(key);
  });

  return [truthy, falsy];
}

/***
 * lowercase the first character
 * @param {string} str
 * @return {string}
 */
function decapitalize(str) {
  if (str && str.length) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
}


const camelizeRE = /-(\w)/g;
const camelize = str => (
  str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
);

const hyphenateRE = /\B([A-Z])/g;
const hyphenate = str => (
  str.replace(hyphenateRE, '-$1').toLowerCase()
);

/**
 * Retrieve a value from an element's properties or attributes
 * @param {HTMLElement} el
 * @param {string} key
 * @param {PropTypes.Requireable} propType
 * @return {*}
 */
function getDOMValue(el, key, propType) {
  const propName = camelize(key);

  // If the element has that property, we're done
  if (el.hasOwnProperty(propName)) {
    return el[propName];
  }
  return getAttributeValue(el, key, propType);
}

/**
 * Retrieve (& parse) a value from an element's attributes
 * @param {HTMLElement} el
 * @param {string} key
 * @param {PropTypes.Requireable} propType
 * @return {*}
 */
function getAttributeValue(el, key, propType) {
  const attrName = hyphenate(key);

  const hasAttribute = el.hasAttribute(attrName);
  if (hasAttribute) {
    switch (propType) {
      // attribute is present
      case PropTypes.bool.isRequired:
      case PropTypes.bool:
        return hasAttribute;

      // value of attribute
      case PropTypes.string.isRequired:
      case PropTypes.string:
        return el.getAttribute(attrName);

      // parsed value of the attribute
      case PropTypes.number.isRequired:
      case PropTypes.number: {
        const val = Number.parseFloat(el.getAttribute(attrName));
        return Number.isNaN(val) ? val : undefined;
      }

      // Anything else probably should have been a property
    }
  }
  return undefined;

}

class ReactCustomElement extends HTMLElement {
  constructor() {
    super();
    this.observer = new MutationObserver(this.update);
    this.observer.observe(this, {
      attributes: true,
      subtree: true,
    });
  }

  connectedCallback() {
    this.mount();
  }

  disconnectedCallback() {
    this.unmount();
    this.observer.disconnect();
  }

  update = () => {
    this.unmount();
    this.mount();
  }

  mount() {
    const props = {
      ...this.getProps(this.attributes),
      ...this.getEvents(),
    };
    this.render(props);
  }

  unmount() {
    ReactDOM.unmountComponentAtNode(this);
  }

  getProps(attributes) {
    return [...attributes]
      .filter(attr => attr.name !== 'style')
      .map(attr => this.convert(attr.name, attr.value))
      .reduce((props, prop) => ({ ...props, [prop.name]: prop.value }
      ), {});
  }

  getEvents() {
    return Object.values(this.attributes)
      .filter(key => /on([a-z].*)/.exec(key.name))
      .reduce(
        (events, ev) => ({
            ...events,
            [ev.name]: this.getEventCallback(ev.name),
          }
        ),
        {},
      );
  }

  getEventCallback(eventName) {
    return payload => this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: [{ ...payload }],
      })
    );
  }

  convert(attrName, attrValue) {
    let value = attrValue;
    if (attrValue === 'true' || attrValue === 'false') {
      value = attrValue === 'true';
    } else if (!isNaN(attrValue) && attrValue !== '') {
      value = +attrValue;
    } else if (/^{.*}/.exec(attrValue)) value = JSON.parse(attrValue);
    return {
      name: attrName,
      value: value,
    };
  }
}

export default function wrap(ReactComponent) {
  return class CustomElement extends ReactCustomElement {

    getEventPropTypes(keys) {
      return Object.fromEntries(keys.map((propName) => {
        // normalize event name
        const eventName = decapitalize(propName.replace(/^on/, ''));

        return [propName, this.getEventCallback(eventName)];
      }))
    }

    getPropertyPropTypes(keys, propTypes) {
      this._props = this._props ?? {};

      const props = Object.fromEntries(keys.map((key) => {
        this._props[key] = this._props[key] ?? getDOMValue(this, key, propTypes[key]);
        // TODO: this may need to have a way of reacting to inner changes
        Object.defineProperty(CustomElement.prototype, key, {
          enumerable: false,
          configurable: true,
          get() {
            return this._props[key];
          },
          set(value) {
            this._props[key] = value;
            this.update();
          },
        });
        return [key, this._props[key]];
      }));
      return props;
    }

    getPropTypes() {
      if (!ReactComponent.hasOwnProperty('propTypes')) return [];

      const [functionPropNames, propertyPropNames] = partitionKeys(
        ReactComponent.propTypes,
        (propType) => (propType === PropTypes.func)
      );
      const functions = this.getEventPropTypes(functionPropNames);
      const properties = this.getPropertyPropTypes(propertyPropNames, ReactComponent.propTypes);

      return {
        ...functions,
        ...properties,
      };
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    getChildren() {
      // TODO: figure out how this plays with named slots
      const childSlot = this.innerHTML
        ? React.createElement('slot')
        : null
      ;
      return childSlot;
    }

    render(props) {
      const fullProps = {
        ...props,
        ...this.getPropTypes(),
      };
      this._wrapper = React.createElement(
        ReactComponent,
        fullProps,
        this.getChildren(),
      );
      ReactDOM.render(this._wrapper, this.shadowRoot);
    }
  };
}
