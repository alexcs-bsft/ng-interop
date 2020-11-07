import {
  defineReactCustomElement,
  defineVueCustomElement,
} from '../@interop/components';

import reactComponents from './react';
import vueComponents from './vue';

Object.values(reactComponents).forEach((component) => {
  defineReactCustomElement(component);
});

Object.values(vueComponents).forEach((component) => {
  defineVueCustomElement(component);
});
