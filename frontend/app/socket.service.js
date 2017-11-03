'use strict';

angular.module('MathRace')
.factory('socket', function ($rootScope,socketFactory) {
  
  var ioSocket = io('', {
    path: '/socket.io-client'
  });
    
  var socket = socketFactory({
    ioSocket: ioSocket
  });
  
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if(callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
});
