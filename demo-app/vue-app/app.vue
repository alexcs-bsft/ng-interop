<script>
import DemoForm from './demo-form.vue';
import { replayPastEvents } from './form-schemas';


export default {
  name: 'app',
  components: {
    DemoForm,
  },
  data() {
    return {
      schema: replayPastEvents,
      data: {},
    };
  },
  watch: {
    schema() {
      this.data = {};
    },
  },
};
</script>

<template>
  <section>
    <h1>SchemaForm</h1>
    <demo-form :schema="schema" :data="data" />
  </section>
</template>

<style>
</style>