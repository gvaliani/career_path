# Angular Style Guide

### Folder structure

```
/app
  /components
    /alert
      alert.directive.js
      alert.directive.spec.js
      alert.template.html
  /config
    main.config.js
  /constants
    api-url.constant.js
  /routes
    /customers
      /index
        customers-index.template.html
        customers-index.route.js
        customers-index.controller.js
        customers-index.e2e.js
  /helpers
    /currency
      currency-filter.js
      currency-filter.spec.js
    /unit
    /e2e
  /services
    /creditors
      creditors.js
      creditors.spec.js
  bootstrap.js
  main.js
/assets
  /fonts
  /images
  /stylesheets
404.html
index.html
```
### Single Responsibility
 
  - Define 1 component per file.

  The following example defines the `app` module and its dependencies, defines a controller, and defines a factory all in the same file.

  ```javascript
  /* avoid */
  angular
      .module('app', ['ngRoute'])
      .controller('SomeController', SomeController)
      .factory('someFactory', someFactory);

  function SomeController() { }

  function someFactory() { }
  ```

  The same components are now separated into their own files.

  ```javascript
  /* recommended */

  // app.module.js
  angular
      .module('app', ['ngRoute']);
  ```

  ```javascript
  /* recommended */

  // some.controller.js
  angular
      .module('app')
      .controller('SomeController', SomeController);

  function SomeController() { }
  ```

  ```javascript
  /* recommended */

  // someFactory.js
  angular
      .module('app')
      .factory('someFactory', someFactory);

  function someFactory() { }
  ```

### Named vs Anonymous Functions

  - Use named functions instead of passing an anonymous function in as a callback.

  *Why?*: This produces more readable code, is much easier to debug, and reduces the amount of nested callback code.

  ```javascript
  /* avoid */
  angular
      .module('app')
      .controller('DashboardController', function() { })
      .factory('logger', function() { });
  ```

  ```javascript
  /* recommended */

  // dashboard.js
  angular
      .module('app')
      .controller('DashboardController', DashboardController);

  function DashboardController() { }
  ```

  ```javascript
  // logger.js
  angular
      .module('app')
      .factory('logger', logger);

  function logger() { }
  ```

### Specs (Unit/E2E)

Keep spec files in the same folder as the code being tested.

### Components

Components are encapsulated DOM components. Each component contains all the HTML, CSS, JavaScript, and other dependencies needed to render itself.

### Routes

A view, made up of components and unique pieces of UI, that points to a URL. Like components, each route contains all the HTML, CSS, JavaScript, and other dependencies needed to render itself.

### Services

Services contain Business logic. For example, `$http` abstractions.

### Config

Configures Providers. For example, `$locationProvider.html5Mode(true);`.

### Constants

Although JavaScript does not yet support constants, we run our application through Traceur, which supports `const`.

### Helpers

[Pure functions](http://en.wikipedia.org/wiki/Pure_function). For example, a `currencyFilter` might take in a number and format it for a certain currency. Helpers take input and return output without having any side effects.


## Parts of Angular

Rules for using each of the core parts of AngularJS (routes, directives, controllers, modules, and templates).

### Routes

#### Use resolvers to inject data.

_Why_: The page is rendered only when all data is available. This means views are only rendered once all the required data is available, and you avoid the user seeing any empty views whilst the data is loading.

```js
// Recommended
$stateProvider.state('customers.show', {
  url: '/customers/:id',
  template: template,
  controller: 'CustomersShowController',
  controllerAs: 'ctrl',
  resolve: {
    customer: [
      'Customers',
      '$stateParams',
      function customerResolver(Customers, $stateParams) {
        return Customers.findOne({
          params: { id: $stateParams.id }
        });
      }
    ]
  }
});

// Avoid
// Note: Controller written inline for the example
$stateProvider.state('customers.show', {
  url: '/customers/:id',
  template: template,
  controllerAs: 'ctrl',
  controller: [
    'Customers',
    '$stateParams',
    function CustomersShowController(Customers, $stateParams) {
      const ctrl = this;
      Customers.findOne({
        params: { id: $stateParams.id }
      }).then(function(customers) {
        ctrl.customers = customers;
      });
    }
  ]
});
```
#### Use query parameters to store route state. For example, the current `offset` and `limit` when paginating.

_Why_: The current view should be accurately reflected in the URL, which means any page refresh puts the user back in the exact state they were in.

```js
// Recommended
function nextPage() {
  const currentOffset = parseInt($stateParams.offset, 10) || 0;
  const limit = parseInt($stateParams.limit, 10) || 10;
  const nextOffset = currentOffset + limit;
  Payments.findAll({
    params: { customers: $stateParams.id, limit: limit, offset: nextOffset }
  });
}

// Avoid
// Keeping route state in memory only
let currentOffset = 0;
const limit = 10;

function nextPage() {
  const nextOffset = currentOffset + limit;
  currentOffset = nextOffset;
  Payments.findAll({
    params: { customers: $stateParams.id, limit: limit, offset: nextOffset }
  });
}
```


### Directives

#### Directive names must only contain `a-z` and at least one dash (`-`).

_Why_: [Custom elements](http://www.html5rocks.com/en/tutorials/webcomponents/customelements/) must have a dash (namespace) to differentiate them from native elements and prevent future component collisions.

```html
<!-- Recommended -->
<dialog-box></dialog-box>
<button click-toggle="isActive"></button>

<!-- Avoid -->
<dialog></dialog>
<button toggle="isActive"></button>
```
#### Use element directives when content is injected, else use attribute directives.

_Why_: Separates responsibility: element directives add content; attribute directives add behaviour; class attributes add style.

```html
<!-- Recommended -->
<alert-box message="Error"></alert-box>
<!-- Replaced with: -->
<alert-box message="Error" class="ng-isolate-scope">
  <div class="alert-box">
    <span class="alert-box__message">Error</span>
  </div>
</alert-box>

<!-- Avoid -->
<p alert-box message="Error"></p>
<!-- Replaced with: -->
<p alert-box message="Error">
  <div class="alert-box">
    <span class="alert-box__message">Error</span>
  </div>
</p>
```

```html
<!-- Recommended -->
<button prevent-default="click">Submit</button>

<!-- Avoid -->
<prevent-default event="click">Submit</prevent-default>
```
#### Use an isolate scope for element directives. Share scope for attribute directives.

_Why_: Using an isolate scope forces you to expose an API by giving the component all the data it needs. This increases reusability and testability. When using a shared scope for attribute directives you should not write to it or rely on any existing data. Attribute directives should not have an isolate scope because doing so overwrites the current scope.

```js
// Recommended
angular.module('alertListComponentModule', [])
  .directive('alertList', [
    function alertListDirective() {
      return {
        restrict: 'E',
        scope: {}
      };
    }
  ]);

// Avoid
angular.module('alertListComponentModule', [])
  .directive('alertList', [
    function alertListDirective() {
      return {
        restrict: 'E'
      };
    }
  ]);
```

```js
// Recommended
angular.module('alertListComponentModule', [])
  .directive('alertList', [
    function alertListDirective() {
      return {
        restrict: 'A'
      };
    }
  ]);

// Avoid
angular.module('alertListComponentModule', [])
  .directive('alertList', [
    function alertListDirective() {
      return {
        restrict: 'A',
        scope: {}
      };
    }
  ]);

angular.module('alertListComponentModule', [])
.directive('alertList', [
  function alertListDirective() {
    return {
      restrict: 'A',
      scope: true
    };
  }
]);
```

#### When using isolate-scope properties, always use controllerAs syntax.

 - Use the [`controllerAs`](http://www.johnpapa.net/do-you-like-your-angular-controllers-with-or-without-sugar/) syntax over the `classic controller with $scope` syntax.

  *Why?*: Controllers are constructed, "newed" up, and provide a single new instance, and the `controllerAs` syntax is closer to that of a JavaScript constructor than the `classic $scope syntax`.

  *Why?*: It promotes the use of binding to a "dotted" object in the View (e.g. `customer.name` instead of `name`), which is more contextual, easier to read, and avoids any reference issues that may occur without "dotting".

```js
// Recommended
angular.module('alertListComponentModule', [])
  .directive('alertList', [
    function alertListDirective() {
      return {
        restrict: 'E',
        controller: 'AlertListController',
        controllerAs: 'ctrl',
        bindToController: true,
        template: template,
        scope: {}
      };
    }
  ]);

// Avoid
angular.module('alertListComponentModule', [])
  .directive('alertList', [
    function alertListDirective() {
      return {
        restrict: 'E',
        controller: 'AlertListController',
        template: template,
        scope: {}
      };
    }
  ]);
```

- Use a capture variable for `this` when using the `controllerAs` syntax. Choose a consistent variable name such as `vm`, which stands for ViewModel.

  *Why?*: The `this` keyword is contextual and when used within a function inside a controller may change its context. Capturing the context of `this` avoids encountering this problem.

  ```javascript
  /* avoid */
  function CustomerController() {
      this.name = {};
      this.sendMessage = function() { };
  }
  ```

  ```javascript
  /* recommended */
  function CustomerController() {
      var vm = this;
      vm.name = {};
      vm.sendMessage = function() { };
  }
  ```

  Note: You can avoid any [jshint](http://www.jshint.com/) warnings by placing the comment above the line of code. However it is not needed when the function is named using UpperCasing, as this convention means it is a constructor function, which is what a controller is in Angular.

  ```javascript
  /* jshint validthis: true */
  var vm = this;
  ```

  Note: When creating watches in a controller using `controller as`, you can watch the `vm.*` member using the following syntax. (Create watches with caution as they add more load to the digest cycle.)

  ```html
  <input ng-model="vm.title"/>
  ```

  ```javascript
  function SomeController($scope, $log) {
      var vm = this;
      vm.title = 'Some Title';

      $scope.$watch('vm.title', function(current, original) {
          $log.info('vm.title was %s', original);
          $log.info('vm.title is now %s', current);
      });
  }
  ```

### Defer Controller Logic to Services

  - Defer logic in a controller by delegating to services and factories.

    *Why?*: Logic may be reused by multiple controllers when placed within a service and exposed via a function.

    *Why?*: Logic in a service can more easily be isolated in a unit test, while the calling logic in the controller can be easily mocked.

    *Why?*: Removes dependencies and hides implementation details from the controller.

    *Why?*: Keeps the controller slim, trim, and focused.

  ```javascript

  /* avoid */
  function OrderController($http, $q, config, userInfo) {
      var vm = this;
      vm.checkCredit = checkCredit;
      vm.isCreditOk;
      vm.total = 0;

      function checkCredit() {
          var settings = {};
          // Get the credit service base URL from config
          // Set credit service required headers
          // Prepare URL query string or data object with request data
          // Add user-identifying info so service gets the right credit limit for this user.
          // Use JSONP for this browser if it doesn't support CORS
          return $http.get(settings)
              .then(function(data) {
               // Unpack JSON data in the response object
                 // to find maxRemainingAmount
                 vm.isCreditOk = vm.total <= maxRemainingAmount
              })
              .catch(function(error) {
                 // Interpret error
                 // Cope w/ timeout? retry? try alternate service?
                 // Re-reject with appropriate error for a user to see
              });
      };
  }
  ```

  ```javascript
  /* recommended */
  function OrderController(creditService) {
      var vm = this;
      vm.checkCredit = checkCredit;
      vm.isCreditOk;
      vm.total = 0;

      function checkCredit() {
         return creditService.isOrderTotalOk(vm.total)
            .then(function(isOk) { vm.isCreditOk = isOk; })
            .catch(showError);
      };
  }
  ```


#### Tear down directives, subscribe to `$scope.$on('$destroy', ...)` to get rid of any event listeners or DOM nodes created outside the directive element.

_Why_: It avoids memory leaks and duplicate event listeners being bound when the directive is re-created.

```js
// Recommended
angular.module('adminExpandComponentModule', [])
  .directive('adminExpand', [
    '$window',
    function adminExpand($window) {
      return {
        restrict: 'A',
        scope: {},
        link: function adminExpandLink(scope, element) {
          function expand() {
            element.addClass('is-expanded');
          }

          $window.document.addEventListener('click', expand);

          scope.$on('$destroy', function onAdminExpandDestroy() {
            $window.document.removeEventListener('click', expand);
          });
        }
      };
    }
  ]);

// Avoid
angular.module('adminExpandComponentModule', [])
  .directive('adminExpand', [
    '$window',
    function adminExpand($window) {
      return {
        restrict: 'A',
        scope: {},
        link: function adminExpandLink(scope, element) {
          function expand() {
            element.addClass('is-expanded');
          }

          $window.document.addEventListener('click', expand);
        }
      };
    }
  ]);
```

#### Anti-Patterns

- Don't rely on jQuery selectors. Use directives to target elements instead.
- Don't use jQuery to generate templates or DOM. Use directive templates instead.
- Don't prefix directive names with `x-`, `polymer-`, `ng-`.

### Controllers

#### Use [`controllerAs`](http://toddmotto.com/digging-into-angulars-controller-as-syntax/) syntax.

_Why_: It explicitly shows what controller a variable belongs to, by writing `{{ ctrl.foo }}` instead of `{{ foo }}`.

```js
// Recommended
$stateProvider.state('authRequired.customers.show', {
  url: '/customers/:id',
  template: template,
  controller: 'CustomersShowController',
  controllerAs: 'ctrl'
});

// Avoid
$stateProvider.state('authRequired.customers.show', {
  url: '/customers/:id',
  template: template,
  controller: 'CustomersShowController'
});
```

```js
// Recommended
angular.module('alertListComponentModule', [])
  .directive('alertList', [
    function alertListDirective() {
      return {
        restrict: 'E',
        controller: 'AlertListController',
        controllerAs: 'ctrl',
        bindToController: true,
        template: template,
        scope: {}
      };
    }
  ]);

// Avoid
angular.module('alertListComponentModule', [])
  .directive('alertList', [
    function alertListDirective() {
      return {
        restrict: 'E',
        controller: 'AlertListController',
        template: template,
        scope: {}
      };
    }
  ]);
```
#### Inject ready data instead of loading it in the controller.

_Why_:
- 2.1. Simplifies testing with mock data.
- 2.2. Separates concerns: data is resolved in the route and used in the controller.

```js
// Recommended
angular.module('customersShowControllerModule', [])
  .controller('CustomersShowController', [
    'customer', 'payments', 'mandates',
    function CustomersShowController(customer, payments, mandates){
      const ctrl = this;

      _.extend(ctrl, {
        customer: customer,
        payments: payments,
        mandates: mandates
      });
    }
  ]);

// Avoid
angular.module('customersShowControllerModule', [])
  .controller('CustomersShowController', [
    'Customers', 'Payments', 'Mandates', '$stateParams',
    function CustomersShowController(Customers, Payments, Mandates, $stateParams){
      const ctrl = this;

      Customers.findOne({
        params: { id: $stateParams.id }
      }).then(function(customers) {
        ctrl.customers = customers;
      });

      Payments.findAll().then(function(payments) {
        ctrl.payments = payments;
      });

      Mandates.findAll().then(function(mandates) {
        ctrl.mandates = mandates;
      });
    }
  ]);
```

#### Extend a controller’s properties onto the controller.

_Why_: What is being exported is clear and always done in one place, at the bottom of the file.

```js
// Recommended
angular.module('organisationRolesNewControllerModule', [])
  .controller('OrganisationRolesNewController', [
    'permissions',
    function CustomersShowController(permissions){
      const ctrl = this;

      function setAllPermissions(access) {
        ctrl.form.permissions.forEach(function(permission) {
          permission.access = access;
        });
      }

      _.extend(ctrl, {
        permissions: permissions,
        setAllPermissions: setAllPermissions
      });
    }
  ]);

// Avoid
angular.module('organisationRolesNewControllerModule', [])
  .controller('OrganisationRolesNewController', [
    'permissions',
    function CustomersShowController(permissions){
      const ctrl = this;

      ctrl.permissions = permissions;

      ctrl.setAllPermissions = function setAllPermissions(access) {
        ctrl.form.permissions.forEach(function(permission) {
          permission.access = access;
        });
      }
    }
  ]);
```

#### Only extend the controller with properties used in templates.

_Why_: Adding unused properties to the digest cycle is expensive.

```js
// Recommended
angular.module('webhooksIndexControllerModule', [])
  .controller('WebhooksIndexController', [
    'TestWebhooks', 'AlertList', 'webhooks'
    function WebhooksIndexController(TestWebhooks, AlertList, webhooks) {
      const ctrl = this;

      function success() {
        AlertList.success('Your test webhook has been created and will be sent shortly');
      }

      function error() {
        AlertList.error('Failed to send test webhook, please try again');
      }

      function sendTestWebhook(webhook) {
        TestWebhooks.create({
          data: { test_webhooks: webhook }
        }).then(success, error);
      }

      _.extend(ctrl, {
        webhooks: webhooks,
        sendTestWebhook: sendTestWebhook
      });
    }
  ]);

// Avoid
angular.module('webhooksIndexControllerModule', [])
  .controller('WebhooksIndexController', [
    'TestWebhooks', 'AlertList', 'webhooks'
    function WebhooksIndexController(TestWebhooks, AlertList, webhooks) {
      const ctrl = this;

      function success() {
        AlertList.success('Your test webhook has been created and will be sent shortly');
      }

      function error() {
        AlertList.error('Failed to send test webhook, please try again');
      }

      function sendTestWebhook(webhook) {
        TestWebhooks.create({
          data: { test_webhooks: webhook }
        }).then(success, error);
      }

      _.extend(ctrl, {
        webhooks: webhooks,
        success: success,
        error: error,
        sendTestWebhook: sendTestWebhook
      });
    }
  ]);
```
#### Store presentation logic in controllers and business logic in services.

_Why_:
  - 5.1. Simplifies testing business logic.
  - 5.2. Controllers are glue code, and therefore require integration tests, not unit tests.

```js
// Recommended
angular.module('webhooksControllerModule', [])
.controller('WebhooksController', [
  'TestWebhooks',
  function WebhooksController(TestWebhooks) {
    const ctrl = this;

    function sendTestWebhook(webhook) {
      TestWebhooks.create({
        data: { test_webhooks: webhook }
      }).then(function() {
        $state.go('authRequired.organisation.roles.index', null);
        AlertList.success('Your test webhook has been created and will be sent shortly');
      });
    }

    _.extend(ctrl, {
      sendTestWebhook: sendTestWebhook
    });
  }
]);

// Avoid
angular.module('webhooksControllerModule', [])
.controller('WebhooksController', [
  '$http',
  function WebhooksController($http) {
    const ctrl = this;

    function sendTestWebhook(webhook) {
      $http({
        method: 'POST',
        data: { test_webhooks: webhook },
        url: '/test_webhooks'
      });
    }

    _.extend(ctrl, {
      sendTestWebhook: sendTestWebhook
    });
  }
]);
```

#### Only instantiate controllers through routes or directives.

_Why_: Allows reuse of controllers and encourages component encapsulation.

```js
// Recommended
angular.module('alertListComponentModule', [])
  .directive('alertList', [
    function alertListDirective() {
      return {
        restrict: 'E',
        controller: 'AlertListController',
        controllerAs: 'ctrl',
        bindToController: true,
        template: template,
        scope: {}
      };
    }
  ]);
```

```html
<!-- Avoid -->
<div ng-controller='AlertListController as ctrl'>
  <span>{{ ctrl.message }}</span>
</div>
```

#### Anti-Patterns

- Don’t manipulate DOM in your controllers, this will make them harder to test. Use directives instead.


### Services and Factories

#### Treat Service objects like a Class with static methods; don't export services as a single function

_Why_: easier to see at the definition site and the call site exactly what function the service provides.

```js
// Recommend
angular.module('buildCSVModule', []).factory('BuildCSV', function buildCVS() {
  function build() {
    // ...
  }

  return {
    build: build,
  }
});

// Avoid
angular.module('buildCSVModule', []).factory('BuildCSV', function buildCSV() {
  function build() {
    // ...
  }

  return build;
});
```
### Templates

#### Use the one-time binding syntax when data does not change after first render.

_Why_: Avoids unnecessary expensive `$watch`ers.

```html
<!-- Recommended -->
<p>Name: {{::ctrl.name}}</p>

<!-- Avoid -->
<p>Name: {{ctrl.name}}</p>
```

#### Anti-Patterns

- Don’t use `ngInit` – use controllers instead.
- Don’t use `<div ng-controller="Controller">` syntax. Use directives instead.
## Testing

Our applications are covered by two different types of test:
- unit tests, which test individual components by asserting that they behave as expected.
- End to End, or E2E, tests, which load up the application in a browser and interact with it as if a user would, asserting the application behaves expectedly.

To write our tests we use [Jasmine BDD](http://jasmine.github.io/2.0/introduction.html) and [ngMock](https://docs.angularjs.org/api/ngMock).

### Unit Testing

Every component should have a comprehensive set of unit tests.

#### Structure of Unit Tests

Tests should be grouped into logical blocks using Jasmine's `describe` function. Tests for a function should all be contained within a `describe` block, and `describe` blocks should also be used to describe different scenarios, or _contexts_:

```js
describe('#update', function() {
  describe('when the data is valid', function() {
    it('shows the success message', function() {…});
  });

  describe('when the data is invalid', function() {
    it('shows errors', function() {…});
  });
});
```

#### Dependencies

Each component should have its dependencies stubbed in each test.

Inject the dependencies and the components being tested in a `beforeEach` function. This encapsulates each test's state, ensuring that they are independent, making them easier to reason about. Tests should never depend on being run in a specific order.

```js
let SomeService;

beforeEach(inject(function($injector) {
  SomeService = $injector.get('SomeService');
}));
```

#### Controllers

When injecting controllers for a test, use the `controller as` syntax:

```js
beforeEach(inject(function($injector, $controller) {
  $controller('OrganisationController as ctrl', {…});
}));
```

Always create a new scope to pass into the controller:

```js
let scope;
let organisation = {
  name: 'GoCardless'
};

beforeEach(inject(function($injector, $controller) {
  scope = $injector.get('$rootScope').$new();
  $controller('OrganisationController as ctrl', {
    $scope: scope,
    organisation: organisation
  });
}));
```
#### Fixtures

When stubbing an API request using `$httpBackend`, always respond with a correctly formatted object. These responses should be saved individually as `.json` files and imported using the SystemJS JSON plugin:

```js
import updateFixture from 'app/services/roles/update.fixture.json!json';

$httpBackend.expectPUT('someurl.com').respond(201, updateFixture);
```

## General Patterns and Anti-Patterns

Rules that pertain to our application at large, not a specific part of Angular.

### Patterns

#### Angular abstractions

Use:
- `$timeout` instead of `setTimeout`
- `$interval` instead of `setInterval`
- `$window` instead of `window`
- `$document` instead of `document`
- `$http` instead of `$.ajax`
- `$q` (promises) instead of callbacks

_Why_: This makes tests easier to follow and faster to run as they can be executed synchronously.

#### Dependency injection annotations

Always use array annotation for dependency injection and bootstrap with `strictDi`.

_Why_: Negates the need for additional tooling to guard against minification and `strictDi` throws an
error if the array (or `$inject`) syntax is not used.

```js
// Recommended
angular.module('creditorsShowControllerModule', [])
  .controller('CreditorsShowController', [
    'creditor', 'payments', 'payouts',
    function CreditorsShowController(creditor, payments, payouts) {
      const ctrl = this;

      _.extend(ctrl, {
        creditor: creditor,
        payments: payments,
        payouts: payouts
      });
    }
  ]);

// Avoid
angular.module('creditorsShowControllerModule', [])
  .controller('CreditorsShowController',
    function CreditorsShowController(creditor, payments, payouts) {
      const ctrl = this;

      _.extend(ctrl, {
        creditor: creditor,
        payments: payments,
        payouts: payouts
      });
    });
```

```js
// Recommended
import {mainModule} from './main';

angular.element(document).ready(function() {
  angular.bootstrap(document.querySelector('[data-main-app]'), [
    mainModule.name
  ], {
    strictDi: true
  });
});

// Avoid
import {mainModule} from './main';

angular.element(document).ready(function() {
  angular.bootstrap(document.querySelector('[data-main-app]'), [
    mainModule.name
  ]);
});
```

### Anti-patterns

#### Don’t use the `$` name space in property names (e.g. `$scope.$isActive = true`).

_Why_: Makes clear what is an Angular internal.

#### Don't use globals. Resolve all dependencies using Dependency Injection.

_Why_: Using DI makes testing and refactoring easier.

#### Don't do `if (!$scope.$$phase) $scope.$apply()`, it means your `$scope.$apply()` isn't high enough in the call stack.

_Why_: You should `$scope.$apply()` as close to the asynchronous event binding as possible.
