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
    const payload = Array.isArray($event?.detail)
      ? $event?.detail?.[0]
      : $event?.detail;
    this.selectedId = payload?.id ?? null;
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
