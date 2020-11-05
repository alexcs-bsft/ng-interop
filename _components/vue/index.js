import _kebabCase from 'lodash/kebabCase';
import Vue from 'vue'; // TODO: figure out how this should work for vue 3

import wrap from './vue-custom-element-wrapper';

import UserItem from './user-item';


[
  UserItem,
].forEach(function defineCustomElement(vueComponent) {
  const CustomElement = wrap(Vue, vueComponent);
  const name = `v-${_kebabCase(vueComponent.name)}`;

  console.debug('Registering', name, vueComponent);
  if (window.customElements.get(name)) {
    // TODO: I'm too lazy to figure out HMR right now
    window.location.reload();
  } else {
    window.customElements.define(name, CustomElement);
  }
});
