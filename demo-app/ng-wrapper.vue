<script>
import { initNgApp } from '@blueshift/ng-interop';


export default {
  name: 'ng-wrapper',
  props: {
    moduleName: {
      type: String,
      required: true,
    },
  },
  emits: [
    'ng-ready',
  ],
  mounted() {
    // NOTE: `AngularJsInjections` won't work until after this has run
    initNgApp(this.$refs.ngAppBody, this.moduleName);
    this.$emit('ng-ready');
  },
};
</script>

<!--
 NOTE: If you change this template, you should manually reload.
       HMR doesn't break, but it won't do anything visible because
       once the ng app has initialized, Angular.js takes over the rendering
-->
<template>
  <div id="ng-app-body" ref="ngAppBody">
    <slot><ui-view /></slot>
  </div>
</template>
