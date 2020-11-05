import _kebabCase from 'lodash/kebabCase';

import wrap from './react-custom-element-wrapper';

import UserItem from './UserItem';


[
  UserItem,
].forEach(function defineCustomElement(reactComponent) {
  const CustomElement = wrap(reactComponent);
  const name = `r-${_kebabCase(reactComponent.name)}`;

  console.debug('Registering', name, reactComponent);
  if (window.customElements.get(name)) {
    // TODO: I'm too lazy to figure out HMR right now
    window.location.reload();
  } else {
    window.customElements.define(name, CustomElement);
  }
});
