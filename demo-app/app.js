import angular from 'angular';
import {
  createApp,
} from 'vue';

// Import your app stylesheets
import './style.css';

import './_vue-components';

import homeModule from './home/home.module';
import VueRoot from './vue-root.vue';

const vueApp = createApp(VueRoot, { ngModuleName: 'home' });
vueApp
  .mount('#app');

// Create and bootstrap application
window.ngApp = homeModule;
window.vueApp = vueApp;
