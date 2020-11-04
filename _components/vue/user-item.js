export default {
  name: 'user-item',
  template: `
    <div v-if="user" class="user" :class="{ selected: selected }">
    <span>Id: {{ user.id }}</span> - <span>{{ user.name }}</span>
    <button @click="$emit('selectMe', user)" :disabled="selected">select
    </button>
    </div>
  `,
  props: {
    selected: Boolean,
    user: Object,
  },
};
