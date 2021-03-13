import angular from 'angular';


const AngularJsInjections = {
  /**
   * Get an instance from angularjs DI
   * @param {string} name
   * @return the fetched injection if it was resolved
   */
  get(name) {
    const mountPoint = document.querySelector('.ng-scope');
    const injector = angular.element(mountPoint).injector();
    return injector.get(name);
  },

  /**
   * Expose a class to angularjs DI.
   * TODO: there's some weird caveats about how you can use these, it may not make sense to implement
   * https://angular.io/api/upgrade/static/downgradeInjectable
   * @param name
   * @param factoryFn
   */
  // downgrade(name, factoryFn) {
  // },
};

export default AngularJsInjections;
