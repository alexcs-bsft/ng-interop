class UserService {
  static $inject = [
    '$http',
  ];

  constructor($http) {
    this.$http = $http;
  }

  getUsers() {
    return this.$http.get('https://jsonplaceholder.typicode.com/users');
  }
}

export default UserService;
