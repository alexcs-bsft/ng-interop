import _kebabCase from "lodash/kebabCase";

import wrap from "./react-custom-element-wrapper";

import UserItem from "./UserItem";

[UserItem].forEach(function defineCustomElement(reactComponent) {
  const CustomElement = wrap(reactComponent);
  const name = _kebabCase(reactComponent.name);

  console.log("Registering", `r-${name}`, reactComponent);
  // if (!window.customElements.get(name)) {
  window.customElements.define(`r-${name}`, CustomElement);
  // }
});
