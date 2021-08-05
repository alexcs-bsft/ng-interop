<script>
import { ref } from 'vue';
import { SchemaForm, useSchemaForm } from 'formvuelate';

import { replayPastEvents } from './form-schemas';


export default {
  name: 'demo-form',
  components: {
    SchemaForm,
  },
  props: {
    schema: {
      type: Object,
      required: true
    },
    data: {
      type: Object,
        required: true
    },
  },
  setup(props) {
    const schema = ref(props.schema);

    const formData = ref(props.data);
    useSchemaForm(formData);

    return {
      schema,
      formData,
    }
  },
};
</script>

<template>
  <section class="demo-form">
    <h1>SchemaForm</h1>
    <SchemaForm :schema="schema" />
  </section>
</template>

<style lang="scss">

.schema-row {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(2, max-content);
  gap: 8px;

  & + & {
    margin-top: 16px;
  }
}
.schema-col {
  display: contents;
}
</style>