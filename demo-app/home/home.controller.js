class HomeCtrl {
  static $inject = [
    '$scope',
    'UserService',
  ];

  name = 'AngularJS inside ng-wrapper vue component';
  users = [];
  selectedId = null;
  testProps = {
    title: '1string',
    likes: 4,
    is_published: true,
    comment_ids: ['a1', '2b', 'c3'],
    author: {
      name: 'Alex',
      published: true,
      post_count: 10,
    },
    callback: function testCb() {},
    promise: Promise.resolve(10),
  };


  constructor($scope, UserService) {
    this.UserService = UserService;
    this.$scope = $scope;
  }

  get selectedUser() {
    return this.users.find((u) => u.id === this.selectedId) ?? null;
  }

  onSelect($event) {
    console.log('onSelect', $event);
    const payload = Array.isArray($event?.detail)
      ? $event?.detail?.[0]
      : $event?.detail;
    this.selectedId = payload?.id ?? null;
    this.users.forEach((u) => {
      u.selected = (u.id === this.selectedId);
    });
  }

  async getUsers() {
    this.users = await this.UserService.getUsers().then((res) => res.data.slice(0));
    this.$scope.$applyAsync();
  }

  $onInit() {
    this.getUsers();
  }
}

export default HomeCtrl;
