class HomeCtrl {
  constructor($scope, UserService, $location) {
    "ngInject";

    this.name = "AngularJS";
    this.$Uservice = UserService;
    this.users = [];
    this.selectedId = null;
    this.$scope = $scope;
  }

  onSelect($event) {
    console.log("onSelect", $event);
    this.selectedId = $event?.detail?.[0]?.id ?? null;
  }

  async getUsers() {
    this.users = await this.$Uservice.getUsers().then(res => res.data);
    this.$scope.$applyAsync();
  }

  $onInit() {
    this.getUsers();
  }
}

export default HomeCtrl;
