angular
  .module('TradeAssistApp.calculator', ['ngLocale', 'TradeAssistApp.quotes', 'TradeAssistApp.clients', 'TradeAssistApp.utils', 'ngynSelect2'])

  .config(['ngynSelect2ConfigProvider', function(ngynSelect2ConfigProvider) {
      ngynSelect2ConfigProvider.allowClear = false;
      ngynSelect2ConfigProvider.noSearch = true;
    }])

  .controller('CalculatorCtrl', ['$scope', '$locale', '$location', 'quoteService', 'clientService',
    function($scope, $locale, $location, quoteService, clientService) {
    'use strict';

    $scope.clientService = clientService;

    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    $scope.setPoints = function (client) {
      if(client.ric == $scope.quote.ric) {
        $scope.quote.clientbid = Number(client.points.ask);
        $scope.quote.clientask = Number(client.points.bid);
      } else {
        $scope.quote.clientbid = 0;
        $scope.quote.clientask = 0;
      }
      $scope.selectedClient = client;
    };

    $scope.quote = {
      ric: 'RUBUTSTN=MCX',
      ask: 0,
      bid: 0,
      clientbid: -10,
      clientask: 10,
      askclass: "",
      bidclass: "",
      base_currency: '',
      currency: '',
      name: '',
      myask: function() {
        if (!isNumber(this.clientask) || this.ask === 0) return this.ask;
        return (this.ask + this.clientask/Math.pow(10, this.decimalplaces - 1)).toFixed(this.decimalplaces);
      },
      mybid: function() {
        if (!isNumber(this.clientbid) || this.bid === 0) return this.bid;
        return (this.bid + this.clientbid/Math.pow(10, this.decimalplaces - 1)).toFixed(this.decimalplaces);
      },
      volume: 100000,
      init: function() {
        this.ask = 0;
        this.bid = 0;
        this.base_currency = '';
        this.currency = '';
        this.name = '';
        this.decimalplaces = 0;
      }
    };

    $scope.onUpdate = function(subscription, ric, updatedValues) {
      $scope.$apply(function() {
        var _quote = $scope.quote;

        if (updatedValues.ASK !== undefined) {
          var newAsk = Number(updatedValues.ASK.formatted.replace(/[^0-9\.]+/g,""));
          if (newAsk != _quote.ask) {
            _quote.askclass = (newAsk < _quote.ask)? "dnchange" : "upchange";
            _quote.ask = newAsk;
          }
        }

        if (updatedValues.BID !== undefined) {
          var newBid = Number(updatedValues.BID.formatted.replace(/[^0-9\.]+/g,""));
          if (newBid != _quote.bid)  {
            _quote.bidclass = (newBid < _quote.bid) ? "dnchange": "upchange";
            _quote.bid = newBid;
          }
        }

        if (updatedValues.CURRENCY !== undefined) {
          _quote.currency = updatedValues.CURRENCY.formatted;
        }

        if (updatedValues.BASE_CCY !== undefined) {
          _quote.base_currency = updatedValues.BASE_CCY.formatted;
        }

        if (updatedValues.TRD_UNITS !== undefined) {
          _quote.decimalplaces = Number(updatedValues.TRD_UNITS.formatted.replace(/['D','P',' ']+$/, ''));
        }

        if (updatedValues.DSPLY_NAME !== undefined) {
          _quote.name = updatedValues.DSPLY_NAME.formatted;
        }
      });
    };

    $scope.subscribe = function() {
      quoteService.subscribe($scope.quote, $scope.onUpdate);
    };

    $scope.openchart = function() {
      JET.navigate({
        name: "Graph",
        entities: [{
          RIC: $scope.quote.ric
        }]
      });
    };

    $scope.searchClient = function (filter) {
      var matchingClients = [];
      for (var i = 0; i < clientService.clients.length; i++) {
        if (clientService.searchClient(clientService.clients[i], filter))
          matchingClients.push(clientService.clients[i]);
      }
      return matchingClients;
    };

    $scope.getMatchingStuffs = function($viewValue) {
      var matchingStuffs = [];
      var vValue = $viewValue.toLowerCase();

      for (var i=0; i < $scope.stuffs.length; i++) {
        var stuff = $scope.stuffs[i];
        if (stuff.name.toLowerCase().indexOf(vValue) != -1 || stuff.desc.toLowerCase().indexOf(vValue) != -1) {
          matchingStuffs.push(stuff);
        }
      }

      return matchingStuffs;
    };

    $scope.opencounterparties = function() {
      JET.navigate({
        url:  $location.absUrl() + "?counterparties=1",
        location: {
          width: 980,
          height: 400
        }
      });
    };

    $scope.subscribe();
  }])

  .directive('aozScoreboard', ['focus', function(focus) {
    return {
      restrict: 'E',
      templateUrl: 'web/components/calculator/aoz-scoreboard.html',
      scope: {
        quote: '=',
        bidclass: '@',
        askclass: '@',
        currency: '='
      },

      controller: ['$scope', 'focus', function($scope, focus) {
        $scope.total = function (num, volume) { return num*volume; };

        $scope.ask_profit = function (source, dest, volume) {
          return (dest - source)*volume;
        };

        $scope.bid_profit = function (source, dest, volume) {
          return (source - dest)*volume;
        };

        $scope.changefocusbid = function() {
          focus('bidinput');
        };

        $scope.changefocusask = function() {
          focus('askinput');
        };
      }]
    };
  }])

  .directive('aozQuote', function() {
    return {
      restrict: 'E',
      templateUrl: 'web/components/calculator/aoz-quote.html',
      scope: {
        value: '@',
        decimalplaces: '@',
        quoteclass: '@'
      },
      controller: ['$scope', function($scope) {
        $scope.int = function (num, dp) {
          if (num!==0) {
            return (dp > 2) ? String(num).slice(-10,-3) : String(num).slice(-10,-4);
          }
        };

        $scope.fractional = function(num, dp) {
          if (num!==0) {
            return (dp > 2) ? String(num).slice(-3,-1) : String(num).slice(-4,-1);
          }
          return 0;
        };

        $scope.latter = function(num) {
          if (num!==0) return num.slice(-1);
        };
      }]
    };
  })

  .directive('separatedInput', ['$filter', function ($filter) {
    return {
      restrict: "A",
      require: "?ngModel",
      link: function($scope, elem, attrs, ngModel) {
        elem.on('focus focusin', function () {
          elem.val(ngModel.$modelValue);
        });
        elem.on('focusout', function () {
          elem.val($filter('number')(ngModel.$modelValue.replace(/\s+/g,''), 0));
        });
      }
    };
  }])

  .directive('keepNegative', function () {
    return {
      restrict: 'A',
      link: function (scope, elm, attrs) {
        elm.bind('keyup', function() {
          var v = elm.val();
          if (v>0) elm.val(-v);
        });
      }
    };
  });