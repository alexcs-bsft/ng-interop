function addHomeRoutes($stateProvider) {
  $stateProvider
    .state('home', {
      url: '',
      controller: 'HomeCtrl',
      controllerAs: '$ctrl',
      templateUrl: '/demo-app/home/home.html',
    });
}
addHomeRoutes.$inject = ['$stateProvider'];

export default addHomeRoutes;
