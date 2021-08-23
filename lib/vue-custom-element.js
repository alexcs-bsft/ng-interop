import {
  defineGuardedCustomElement,
} from './vue-wrapper';
import { hyphenate } from './vue-wrapper/utils';

/** @typedef {import('vue').ComponentOptions} VueComponent */


/**
 * Make a given name safe to use as an html tag
 * @param {string} originalName - The original name.
 *        Can be any multi-word identifier case that isn't flat.
 *        https://en.wikipedia.org/wiki/Naming_convention_(programming)#Examples_of_multiple-word_identifier_formats
 * @param {string|boolean} [prefix] - optional prefix. If not provided,
 *        `originalName` *must* contain multiple recognizable words to avoid clashing with the html namespace.
 * @return {string}
 */
function makeTagName(originalName, prefix) {
  const kebabName = hyphenate(originalName);
  return prefix ? `${prefix}-${kebabName}` : kebabName;
}

/**
 * Define a given custom element on the window
 * @param {CustomElementConstructor} elementClass - The constructor/class to define
 * @param {string} name - The tag name to define it with
 */
function registerCustomElement(elementClass, name) {
  if (window.customElements.get(name)) {
    // TODO: There's no way to re-register a custom element
    //   and I haven't messed with HMR yet
    window.location.reload();
  } else {
    console.debug('Registering', name);
    window.customElements.define(name, elementClass);
  }
}

/**
 * Wrap a given component in a native "custom element" class and register it for use.
 * @param {VueComponent|VueComponent[]} vueDefinition - A Vue component options object.
 * @param {string|boolean} [prefix='v'] - A string to prefix the component name with.
 *        Override the default with anything falsy to skip prefixing.
 */
export default function defineNatively(vueDefinition, prefix = 'v') {
  if (Array.isArray(vueDefinition)) {
    vueDefinition.forEach((def) => {
      defineNatively(def, prefix);
    });
  } else {
    registerCustomElement(
      defineGuardedCustomElement(vueDefinition),
      makeTagName(vueDefinition.name, prefix),
    );
  }
}
