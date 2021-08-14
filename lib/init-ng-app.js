import angular from 'angular';


let $injector;
let $rootElement;
/**
 * Initialize or re-initialize the ng dashboard app
 * @param {HTMLElement} rootElement - The DOM element to be the root of the ng app
 * @param {string} moduleName - the name of the previously-registered angular module
 */
export default function initNgApp(rootElement, moduleName) {
  $rootElement = angular.element(rootElement);

  if ($injector) {
    // This matches the non-initialization part of what happens inside of `angular.bootstrap`
    // https://github.com/angular/angular.js/blob/4032655100dfb085e20e07d364f6292d64cfc15c/src/Angular.js#L1825-L1832
    $injector.invoke(['$rootScope', '$compile',
                      function bootstrapApplyAgain($rootScope, $compile) {
                        // Attach the injector to the element then compile its template
                        $rootScope.$apply(() => {
                          $rootElement.data('$injector', $injector);
                          $compile($rootElement)($rootScope);
                        });
                      }]);
  } else {
    $injector = angular.bootstrap(rootElement, [moduleName], {
      strictDi: true,
    });
  }
}

// This is mostly just here as a simple example of how to manually control HMR (hot module replacement)
if (module.hot) {
  // Opt into HMRing this file
  module.hot.accept();

  // This runs right before the previous version of this file is swapped out.
  // Preserve the values across HMR
  module.hot.dispose((data) => {
    Object.assign(data, { $injector, $rootElement });
  });

  // Get the values that were preserved when the previous version of the file ran `module.hot.dispose`
  if (module.hot.data) {
    const preHMRData = module.hot.data;
    $injector = preHMRData.$injector;
    $rootElement = preHMRData.$rootElement;

    // Re-run initNgApp in case it changed
    if ($injector && $rootElement) {
      initNgApp($rootElement);
    }
  }
}
