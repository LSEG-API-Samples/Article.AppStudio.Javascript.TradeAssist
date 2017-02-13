angular.module('TradeAssistApp.clients', ['xeditable'])

  .factory('clientService', ['$q', function ($q) {
    'use strict';

    var _settingName = "RubQuoteAssist_ClientList";
    var _providerName = "Configuration";

    var _saveClients = function (clients) {
      JET.Settings.write({providerName: _providerName, settingName: _settingName, settingValue: JSON.stringify(clients)});
    };
    
    var _loadClients = function() {
      var defer = $q.defer();
      
      JET.Settings.read(
        function(value) { defer.resolve(value); }, 
        {providerName: _providerName, settingName: _settingName},
        function (error) { defer.reject(error); }
      ); 
      
      return defer.promise;
    };

    var _searchClient = function (item, filter) {
      if (typeof filter == "undefined" || filter === '') return true;
      
      if (typeof item.name != "undefined" && item.name.toLowerCase().indexOf(filter.toLowerCase())!=-1)
        return true;
        
      if (typeof item.ric != "undefined" && item.ric.toLowerCase().indexOf(filter.toLowerCase())!=-1)
        return true;

      return false;
    };

    return {
      loadClients: _loadClients,
      saveClients: _saveClients,
      searchClient: _searchClient
    };
  }])

  .controller('ClientsCtrl', ['$scope', 'clientService', function($scope, clientService) {
    'use strict';

    $scope.clientService = clientService;
    $scope.clientFilter = '';

    function getRandomArbitrary(min, max) {
      return Math.random() * (max - min) + min;
    }
    
    $scope.sortField = 'name';
    $scope.reverse = false;

    $scope.searchClient = function (item) {
      return $scope.clientService.searchClient(item,$scope.clientFilter);
    };

    $scope.sort = function (fieldName) {
      if ($scope.sortField === fieldName) {
        $scope.reverse = !$scope.reverse;
      } else {
        $scope.sortField = fieldName;
        $scope.reverse = false;
      }
    };
    
    $scope.isSortUp = function (fieldName) {
      return $scope.sortField === fieldName && !$scope.reverse;
    };
    
    $scope.isSortDown = function (fieldName) {
      return $scope.sortField === fieldName && $scope.reverse;
    };
      
    $scope.addClient = function() {
      if($scope.inserted === null || typeof($scope.inserted) === 'undefined') {
        $scope.inserted = {
          name: '',
          phones: '+7',
          contacts: null,
          email: '',
          ric: '',
          points: {bid: 10, ask: -10},
          id: getRandomArbitrary(0, 9999999)
        };

        clientService.clients.push($scope.inserted);
        $scope.clientFilter = '';
      }
    };
    
    $scope.cancelEdit = function(client, rowform) {
      if($scope.inserted === client) {
        $scope.removeClient(client);
        $scope.inserted = null;
      }
      rowform.$cancel();
    };
    
    $scope.removeClient = function(item) {
      var index = clientService.clients.indexOf(item);
      clientService.clients.splice(index, 1);
      clientService.saveClients(clientService.clients);
      JET.publish("/counterparties","update");
    };
    
    $scope.saveClient = function(data, id) {
      angular.extend(data, {id: id});
      angular.extend(data, {id: getRandomArbitrary(0, 9999999)} );
      clientService.saveClients(clientService.clients);
      $scope.inserted = null;
      JET.publish("/counterparties","update");
    };
    
    $scope.isCollapsed = function () {
      return Collapsed;
    };
    
    $scope.isNotCollapsed = function () {
      return !(Collapsed);
    };

  }])
  
  .directive('keepAskNegative', function () {
    'use strict';

    return {
      restrict: 'A',
      link: function (scope, elm, attrs) {
        elm.bind('keyup', function() {
          var v = elm.val();
          if(v > 0) {
            scope.$apply(function() {
              scope.$parent.client.points.ask = -v;
            });
          }
        });
      }
    };
  });
