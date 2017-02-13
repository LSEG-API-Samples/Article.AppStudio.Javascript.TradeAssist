var deps = ['TradeAssistApp.calculator', 'TradeAssistApp.clients', 'ui.bootstrap'];

// Declare app level module which depends on views, and components
angular.module('TradeAssistApp', deps)
  .controller('AppCtrl', ['$scope', 'clientService', function($scope, clientService) {
    $scope.getInclude = function(){
      return $scope.isCalculator ? "web/components/calculator/calculator.html" : "web/components/clients/clients.tpl.html";
    };

    $scope.updateclients = function() {
      clientService.loadClients().then(
        function (data) {
          clientService.clients = JSON.parse(data);
        },
        function (reason) {
          clientService.clients = [];
          console.log("An error occurred: " + reason);
        }
      );
    };
  }]);