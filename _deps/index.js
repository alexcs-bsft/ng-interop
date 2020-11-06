import angular from 'angular';


export function getDependency(name) {
  return angular.element(document.getElementById('app')).injector().get(name);
}
window.getDependency = getDependency;
