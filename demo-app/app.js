import angular from 'angular';

// Import your app stylesheets
import './style.css';

import './_vue-components';

import homeModule from './home/home.module';

if (window.location.pathname.startsWith('/vue')) {
  const app = import('./vue-app/main');
  window.app = app;
} else {

// Create and bootstrap application
window.app = homeModule;

angular.bootstrap(document.getElementById('app'), ['home']);
}
