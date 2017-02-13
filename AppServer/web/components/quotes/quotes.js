angular.module('TradeAssistApp.quotes', [])
  .factory('quoteService', function () {
    'use strict';
    var _currentRic, _quoteSubscription, _quote;
    
    var _subscribe = function(quote, onUpdate) {
      if (quote.ric == _currentRic) return;

      _currentRic = quote.ric;
      if (_quoteSubscription !== null && typeof _quoteSubscription !== 'undefined')
        _quoteSubscription.stop();        
      
      _quote = quote;
      _quote.init();
      _quoteSubscription = JET.Quotes.create()
        .rics([_currentRic]) //requested symbols
        .formattedFields(['BID', 'ASK', 'CURRENCY', 'TRD_UNITS', 'BASE_CCY', 'DSPLY_NAME'])
        .onUpdate(onUpdate)
        .start();
    };
    
    return {
      subscribe: _subscribe
    };
  }
);