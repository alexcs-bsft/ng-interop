<script>
import NgWrapper from './ng-wrapper.vue';


export default {
  name: 'vue-root',
  components: {
    NgWrapper,
  },
  props: {
    ngModuleName: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      isNgAppMounted: false,
    };
  },
};
</script>

<template>
  <div id="vue-app-comp">
    <div class="ng-wrapper">
      <ng-wrapper
        v-show="isNgAppMounted"
        :module-name="ngModuleName"
        @ng-ready="isNgAppMounted = true"
      >
        <ui-view />
        <div ui-view="fullscreen" />
      </ng-wrapper>
    </div>
  </div>
</template>
