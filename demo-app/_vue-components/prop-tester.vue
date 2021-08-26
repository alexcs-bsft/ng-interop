<script>

export default {
  name: 'prop-tester',
  props: {
    title: {
      type: String,
    },
    likes: {
      type: Number,
    },
    isPublished: {
      type: Boolean,
    },
    commentIds: {
      type: Array,
    },
    author: {
      type: Object,
    },
    callback: {
      type: Function,
    },
    promise: {
      type: Promise,
    }, // or any other constructor
  },
  computed: {
    propsJSON() {
      const props = {
        title: this.title,
        likes: this.likes,
        isPublished: this.isPublished,
        commentIds: this.commentIds,
        author: this.author,
        callback: this.callback,
        promise: this.promise,
      };
      console.debug('Props changed:', props);
      return JSON.stringify(props, null, 2);
    },
  },
};
</script>

<template>
  <section>
    <h2 class="vue-heading">Props Testing</h2>
    <pre class="props-tester" v-html="propsJSON" />
  </section>
</template>

<style scoped>
.props-tester {
  border: solid 1px #AB47bc;
  background-color: #292D3E;
  color: #A6ACCD;
  font-family: 'Fira Code Retina', 'Source Code Pro', monospace;
  font-size: 16px;
  border-radius: .25em;
  padding: .5em;
  margin: 0;
}
</style>