import angular from 'angular';
import '@uirouter/angularjs';

// Import your app stylesheets
import './style.css';

import './_vue-components';

import homeModule from './home/home.module';

// Create and bootstrap application
window.app = homeModule;

angular.bootstrap(document.getElementById('app'), ['home']);
