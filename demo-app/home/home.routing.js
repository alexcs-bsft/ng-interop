function addHomeRoutes($stateProvider) {
  $stateProvider
    .state('home', {
      url: '',
      controller: 'HomeCtrl',
      controllerAs: '$ctrl',
      templateUrl: 'home/home.html',
    });
}

export default addHomeRoutes;
