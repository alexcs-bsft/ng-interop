import wrap from "@vue/web-component-wrapper/dist/vue-wc-wrapper";

console.log(wrap);

import UserItem from "./user-item";

const UserElement = wrap(Vue, UserItem);

window.customElements.define(UserItem.name, UserElement);
