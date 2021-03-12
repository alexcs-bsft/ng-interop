import angular from 'angular';
import '@uirouter/angularjs';

import HomeCtrl from './home.controller';
import addHomeRoutes from './home.routing';
import userItem from './ng1-user-item.component';
import UserService from '../services/user.service';


// Create the module where our functionality can attach to
const homeModule = angular.module('home', ['ui.router']);

homeModule.controller('HomeCtrl', HomeCtrl);
homeModule.component('userItem', userItem);
homeModule.service('UserService', UserService);

homeModule.config(addHomeRoutes);

export default homeModule;
