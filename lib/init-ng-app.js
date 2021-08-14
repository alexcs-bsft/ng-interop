import angular from 'angular';


const $injectors = new Map();
/**
 * Initialize or re-initialize the ng dashboard app
 * @param {HTMLElement} rootElement - The DOM element to be the root of the ng app
 * @param {string} moduleName - the name of a registered angular module
 */
export default function initNgApp(rootElement, moduleName) {
  let injector = $injectors.get(moduleName);

  // If the app already exists, just re-bootstrap it on the root element
  if (injector) {
    const $rootElement = angular.element(rootElement);
    // This matches the non-initialization part of what happens inside of `angular.bootstrap`
    // https://github.com/angular/angular.js/blob/4032655100dfb085e20e07d364f6292d64cfc15c/src/Angular.js#L1825-L1832
    injector.invoke(['$rootScope', '$compile',
      function bootstrapApplyAgain($rootScope, $compile) {
        // Attach the injector to the element then compile its template
        $rootScope.$apply(() => {
          $rootElement.data('$injector', injector);
          $compile($rootElement)($rootScope);
        });
      }]);
  } else {
    injector = angular.bootstrap(rootElement, [moduleName], {
      strictDi: true,
    });
    $injectors.set(moduleName, injector);
  }
}
