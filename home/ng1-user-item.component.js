export default {
  template: `
  <div ng-if="$ctrl.user" class="user" ng-class="{ selected: $ctrl.selected }">
    <span>Id: {{ $ctrl.user.id}}</span> - <span>{{$ctrl.user.name}}</span>
    <button ng-click="$ctrl.emit('selectMe', $ctrl.user)" ng-disabled="$ctrl.selected">select</button>
  </div>
`,
  bindings: {
    selected: '<',
    user: '<',
  },
  controller($element) {
    this.emit = (eventName, payload) => {
      const event = new CustomEvent(eventName, { detail: [payload] });
      $element[0].dispatchEvent(event);
    };
  },
};
