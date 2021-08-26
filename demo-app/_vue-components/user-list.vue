<template>
  <section style="display: grid; grid-template-columns: 1fr 1fr; align-content: center;">
    <h2 class="vue-heading">
      {{ headingText }}
    </h2>
    <button
      style="place-self: baseline left;"
      @click="fetchUsers"
      :disabled="loading"
    >Fetch Users</button>
    <div>
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
    </div>
    <pre>
      aNumber: {{ aNumber+1 }}
      aBoolean: {{ aBoolean }}
    </pre>
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
