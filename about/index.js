import angular from 'angular';

// Create the module where our functionality can attach to
let aboutModule = angular.module('about', []);

// Include our UI-Router config settings
import AboutConfig from './about.config';
aboutModule.config(AboutConfig);

// Controllers
import AboutCtrl from './about.controller';
aboutModule.controller('AboutCtrl', AboutCtrl);

export default aboutModule;