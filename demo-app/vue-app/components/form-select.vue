<script>
export default {
  name: 'form-select',
  props: {
    modelValue: { required: true },
    uuid: {
      type: Number,
      default: 0,
    },
    required: {
      type: Boolean,
      default: false,
    },
    label: { type: String, required: true },
    options: { type: Array, required: true },
    disableNoSelection: { type: Boolean, default: false },
  },
  emits: [
    'update:modelValue',
  ],
  computed: {},
  methods: {
    update(value) {
      this.$emit('update:modelValue', value);
    },
  },
};
</script>

<template>
  <div>
    <label :for="uuid">{{ label }}</label>
    <select
      :value="modelValue"
      :required="required"
      :id="uuid"
      @input="update($event.target.value)"
    >
      <option :disabled="disableNoSelection">-</option>
      <option
        v-for="option in options"
        :key="option"
        :value="option"
        :selected="option === modelValue"
      >
        {{ option }}
      </option>
    </select>
  </div>
</template>
