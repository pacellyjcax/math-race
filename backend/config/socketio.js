'use strict';

var DB = require('./db');

module.exports = function (socketio) {
  
  DB.register(socketio);

  socketio.on('connection', function (socket) {

    // Criação do Jogador
    _createRacer(function(racer){
      socket.racer = racer;
      socket.emit('racer:me', socket.racer.id);
      console.info('[%s] CONNECTED', socket.racer.id);
    });

    // Carregar o ranking
    _loadRanking(function(ranking){
      socket.emit('ranking:save', ranking);   
    });
    
    // Remoção do Jogador ao Desconectar
    socket.on('disconnect', function () {
      _removeRacer(socket.racer.id, function() {
        console.info('[%s] DISCONNECTED', socket.racer.id);        
      });
    });   
    
    // Checagem do numero do Jogador
    socket.on('racer:guessNumber', function (number) {
      _updateRacer(socket.racer.id,number,function() {
        console.info('[%s] guessNumber - [%s]', socket.racer.id, number);        
      });
    });
    
    // Salvar High Score
    socket.on('racer:HighScore', function (name) {
      _saveHighScore(socket.racer.id,name,function() {
        _loadRanking(function(ranking){
          socket.emit('ranking:save', ranking);   
        });        
      });              
    });   
  });

};

function _createRacer(cb) {
  DB.createRacer(cb);
}
function _removeRacer(racerId,cb) {
  DB.removeRacer(racerId,cb);
}
function _updateRacer(racerId,number,cb) {
  DB.updateRacer(racerId,number,cb);
}
function _loadRanking(cb) {
  DB.loadRanking(cb);
}
function _saveHighScore(racerId,name,cb) {
  DB.saveHighScore(racerId,name,cb);
}
