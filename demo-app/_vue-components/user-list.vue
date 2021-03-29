<template>
  <section>
    <h2 style="border-left: 4px solid var(--c-vue); padding-left: 8px;">
      {{ headingText }}
      <button @click="fetchUsers" :disabled="loading">Fetch Users</button>
    </h2>
    <pre>
      aNumber: {{ aNumber+1 }}
      aBoolean: {{ aBoolean }}
    </pre>
    <user-item
      v-if="selectedUser"
      :user="selectedUser"
      selected
      unselectable
    ></user-item>
    <ul>
      <li v-for="user in _users">
        <user-item
          :user="user"
          :selected="user.id === selectedId"
          @selectMe="onSelect"
        ></user-item>
      </li>
    </ul>
  </section>
</template>

<script>
import { AngularJsInjections } from '@blueshift/ng-interop';
import UserItem from './user-item.vue';


export default {
  name: 'user-list',
  props: {
    headingText: String,
    users: Array,
    aNumber: Number,
    aBoolean: Boolean,
  },
  components: {
    UserItem,
  },
  data() {
    const UserService = AngularJsInjections.get('UserService');
    return {
      UserService,
      _users: [],
      selectedId: null,
      loading: false,
    };
  },
  computed: {
    selectedUser() {
      console.debug('re-calculating vue selectedUser');
      return this._users.find(u => u.id === this.selectedId) ?? null;
    },
  },
  watch: {
    users(newV) {
      this._users = newV;
    },
    _users() {
      this.selectedId = null;
    },
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      const response = await this.UserService.getUsers();
      this.loading = false;

      this._users = response.data || [];
      // this.selectedId = null;
    },
    onSelect($event) {
      this.selectedId = $event.id;
    },
  },
};
</script>
