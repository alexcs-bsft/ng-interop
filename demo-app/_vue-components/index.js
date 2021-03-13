import { defineNatively } from '@blueshift/ng-interop';

import UserItem from './user-item.vue';
import UserList from './user-list.vue';


[
  UserItem,
  UserList,
].forEach((component) => {
  defineNatively(component);
});
