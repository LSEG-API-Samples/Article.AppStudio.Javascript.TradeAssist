angular.module('TradeAssistApp.utils', [])
  .directive('selectOnClick', function () {
   'use strict';
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.on('click', function () {
          this.select();
        });
      }
    };
  })
  .directive('eventFocus', ['focus', function(focus) {
   'use strict';
    return function(scope, elem, attr) {
      elem.on(attr.eventFocus, function() {
        focus(attr.eventFocusId);
      });

      // Removes bound events in the element itself
      // when the scope is destroyed
      scope.$on('$destroy', function() {
        elem.off(attr.eventFocus);
      });
    };
  }])
  .directive('ngEnter', function () {
   'use strict';
    return function (scope, element, attrs) {
      element.bind("keydown keypress", function (event) {
        if(event.which === 13) {
          scope.$eval(attrs.ngEnter);
          event.preventDefault();
        }
      });
    };
  })
  .filter('rawHtml', ['$sce', function($sce) {
    'use strict';
      return function(val) {
        return $sce.trustAsHtml(val);
      };
  }])
  .filter("i18nCurrency", ['numberFilter', function (numberFilter) {
    'use strict';
    function isNumeric(value) {
      return (!isNaN(parseFloat(value)) && isFinite(value));
    }

    return function (inputNumber, currencySymbol, position) {
      if (isNumeric(inputNumber)) {
        var formattedNumber = numberFilter(inputNumber, 0);
        currencySymbol = (typeof currencySymbol === "undefined") ? " " : currencySymbol;
        if (position =='left')
            return currencySymbol + formattedNumber;

        if (position =='right')
          return formattedNumber + ' ' + currencySymbol;

        return formattedNumber;
      } else {
        return inputNumber;
      }
    };
  }])
  .filter("aozCurrency", ['numberFilter', function (numberFilter) {
    'use strict';
    function isNumeric(value)  {
      return (!isNaN(parseFloat(value)) && isFinite(value));
    }

    return function (inputNumber, currencySymbol, decimalSeparator, thousandsSeparator, decimalplaces, position ) {
      if (isNumeric(inputNumber)) {
        // Default values for the optional arguments
        currencySymbol = (typeof currencySymbol === "undefined") ? " " : currencySymbol;
        decimalSeparator = (typeof decimalSeparator === "undefined") ? "." : decimalSeparator;
        thousandsSeparator = (typeof thousandsSeparator === "undefined") ? " " : thousandsSeparator;
        decimalplaces = (typeof decimalplaces === "undefined" || !isNumeric(decimalplaces)) ? 2 : decimalplaces;

        if (decimalplaces < 0) decimalplaces = 0;

        // Format the input number through the number filter
        // The resulting number will have "," as a thousands separator
        // and "." as a decimal separator.
        var formattedNumber = numberFilter(inputNumber, decimalplaces);

        // Extract the integral and the decimal parts
        var numberParts = formattedNumber.split(".");

        // Replace the "," symbol in the integral part
        // with the specified thousands separator.
        numberParts[0] = numberParts[0].split(",").join(thousandsSeparator);

        // Compose the final result

        var result = numberParts[0];

        if (numberParts.length == 2)
          result += decimalSeparator + numberParts[1];

        if (position === 'left')
          result = currencySymbol + result;

        if (position === 'right')
          result = result + ' ' + currencySymbol;

        return result;
      } else {
        return inputNumber;
      }
    };
  }])
  .factory('focus', ['$timeout', '$window', function($timeout, $window) {
    'use strict';
    return function(id) {
      // timeout makes sure that it is invoked after any other event has been triggered.
      // e.g. click events that need to run before the focus or
      // inputs elements that are in a disabled state but are enabled when those events
      // are triggered.
      $timeout(function() {
        var element = $window.document.getElementById(id);

        if(element) {
          element.select();
          element.focus();
        }
      });
    };
  }]);