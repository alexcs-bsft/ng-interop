class AboutCtrl {
  constructor($scope, $location) {
    'ngInject';

    this.name = "AngularJS";
    this.token = $location.search().token;
  }
}

export default AboutCtrl;