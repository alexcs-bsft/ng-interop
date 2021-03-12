import defineVueCustomElement from '../../lib/components';

import UserItem from './user-item.vue';
import UserList from './user-list.vue';


[
  UserItem,
  UserList,
].forEach((component) => {
  defineVueCustomElement(component);
});
