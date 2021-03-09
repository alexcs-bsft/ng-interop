import {
  defineReactCustomElement,
  defineVueCustomElement,
} from '../@interop/components';

import reactComponents from './react';
import vueComponents from './vue';

Object.values(reactComponents).forEach((component) => {
  defineReactCustomElement(component);
});


// FIXME: need to keep them from rendering before the ng app does
Object.values(vueComponents).forEach((component) => {
  defineVueCustomElement(component);
});
