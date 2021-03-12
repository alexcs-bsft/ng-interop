import defineVueCustomElement from '../../lib/components';

import UserItem from './user-item';
import UserList from './user-list';


[
  UserItem,
  UserList,
].forEach((component) => {
  defineVueCustomElement(component);
});
