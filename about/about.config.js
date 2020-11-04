function AboutConfig($stateProvider) {
  'ngInject';

  $stateProvider
  .state('about', {
    url: 'about?token',
    controller: 'AboutCtrl',
    controllerAs: '$ctrl',
    templateUrl: 'about/about.html'
  });

};

export default AboutConfig;