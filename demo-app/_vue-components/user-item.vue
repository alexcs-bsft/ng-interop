<template>
  <div
    v-if="user"
    class="user"
    :class="{ selected: selected }"
  >
    <span>Id: {{ user.id }}</span> - <span>{{ user.name }}</span>
    <button v-if="!unselectable" @click="$emit('selectMe', user)" :disabled="selected">
      {{ btnText }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'user-item',
  emits: [
    'selectMe',
  ],
  props: {
    unselectable: Boolean,
    selected: Boolean,
    user: {
      type: Object,
      required: true,
    },
    btnText: {
      type: String,
      default: 'select',
    },
  },
};
</script>

<style scoped>
.user {
  color: deeppink;
}
</style>
