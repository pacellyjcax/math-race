'use strict';

angular.module('MathRace')
.controller('MainCtrl', function($scope, $rootScope, socket,$window,$timeout, moment) {

  $scope.racers=[];
  $scope.me=null;
  $scope.guessNumber='';
  $scope.ranking = null;
  $scope.winner = null;
  $scope.hasWinner = null;
  $scope.iwon = false;
  $scope.winnerName = '';
  $scope.countDown = -1.0;    
  $scope.winnerNameBlock = false;
  
  $scope.checkNumber = function() {
    socket.emit('racer:guessNumber',$scope.guessNumber,function(data) {
      //TODO - animações para o retorno da tentativa Correta ou Não
    })          
    $scope.guessNumber=null;
  };
  
  $scope.saveScore = function() {
    if ($scope.winnerName != '') {
      socket.emit('racer:HighScore',$scope.winnerName,function(data) {
      });          
      $scope.winnerNameBlock = true;
      $scope.countDown = 10.0;
      count();
    }
    $scope.winnerName = '';
  };
  
  socket.on('racer:save',function(data) {
    $scope.racers = data;
  });
  
  socket.on('racer:me',function(data) {
    $scope.me = data;
  });
  
  socket.on('ranking:save',function(data) {
    if (data) {
      $scope.ranking = data.map(function(ranked) {
        var timeTotal = moment.duration(ranked.time_total);
        ranked.time_total = moment.utc(timeTotal.asMilliseconds()).format("HH:mm:ss");
        return ranked;
      });      
    }
  });
  
  socket.on('racer:haveWinner',function(winner) {
    $scope.hasWinner = true;    
    $scope.winner = winner;
    if ($scope.me === winner.id) {
      $scope.iwon = true;    
    }else{
      $scope.countDown = 10.0;
      count();
    }    
  });
  
  function count() {
    $timeout(function(){
      if ($scope.countDown < 0) {
        countStop();            
      }
      $scope.countDown-=0.1;
      count();   
    },100);
  };

  function countStop() {
    $window.location.reload();            
  }   
});