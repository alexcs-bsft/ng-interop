import { defineNatively } from '@blueshift/ng-interop';

import PropTester from './prop-tester.vue';
import UserItem from './user-item.vue';
import UserList from './user-list.vue';


defineNatively([
  PropTester,
  UserItem,
  UserList,
]);
