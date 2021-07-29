import angular from 'angular';


// Look for angular apps with this preference order
const NG_APP_SELECTORS = [
  '#ng-app-body',
  '[ng-app]',
  '.ng-scope',
];

const AngularJsInjections = {
  /**
   * The root element of an angularjs app
   * @return {null|HTMLElement}
   */
  get ngRootEl() {

    // Return the first matching element
    for (const selector of NG_APP_SELECTORS) {
      const el = document.querySelector(selector);
      if (el) {
        return el;
      }
    }
    return null;
  },

  get injector() {
    const ngEl = angular.element(AngularJsInjections.ngRootEl);
    return ngEl.injector() ?? null;
  },
  /**
   * Get an instance from angularjs DI
   * @param {string} name
   * @return {*|null} the fetched injection, if it was resolved
   */
  get(name) {
    const injector = AngularJsInjections.injector;

    if (injector) {
      return injector.get(name);
    }
    console.error('ng injector not found');
    return null;
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
