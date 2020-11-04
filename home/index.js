import angular from 'angular';

// Create the module where our functionality can attach to
let homeModule = angular.module('home', []);

// Include our UI-Router config settings
import HomeConfig from './home.config';
homeModule.config(HomeConfig);

// Controllers
import HomeCtrl from './home.controller';
homeModule.controller('HomeCtrl', HomeCtrl);

// Components
import userItem from './ng1-user-item.component';
homeModule.component('userItem', userItem);

// Services
import UserService from './user.service';

homeModule.service('UserService', UserService);

export default homeModule;