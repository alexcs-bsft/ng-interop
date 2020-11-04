import _kebabCase from 'lodash/kebabCase';
import Vue from 'vue'; // TODO: figure out how this should work for vue 3
import wrap from '@vue/web-component-wrapper/dist/vue-wc-wrapper';

import UserItem from './user-item';


[
  UserItem,
].forEach(function defineCustomElement(vueComponent) {
  const CustomElement = wrap(Vue, vueComponent);
  const name = _kebabCase(vueComponent.name);

  console.log('Registering', `v-${name}`, vueComponent);
  // if (!window.customElements.get(name)) {
    window.customElements.define(`v-${name}`, CustomElement);
  // }
});
