'use strict';

var shortid = require('shortid');
var moment = require('moment');
var _ = require('lodash/array');
var sqlDb = require("sqlite");

var passwordFactory = require('../utils/password.factory');
var colorFactory = require('../utils/color.factory');
var iconFactory = require('../utils/icon.factory');

var Racers = [];
var socket = null;
var winner = null;

var TIMEOUT_LIMIT = 10000; // O tempo apartir da segunda posicao em milisegundos 

exports.register = function(socketio) {
  socket = socketio;
}

exports.listRacers = function(cb) {
  cb(Racers); 
}

exports.createRacer = function(cb) {
  var racer = {
    id:shortid.generate(),
    color:colorFactory.generate(),
    icon:iconFactory.generate(),
    password:passwordFactory.generate(),
    start:new Date(),
    position:1
  };
  Racers.push(racer);
  _updateSocket('racer', _formatRacersOutput())
  cb(racer); 
}

exports.updateRacer = function(racerId,number,cb) {
  Racers.map(function(racer,i) {
    if (racer.id === racerId) {
      if (racer.position === 1 && racer.password===number) {
        _moveRacerPositionUp(i);
      }else if (racer.position > 1 && racer.position < 9){
        if (new Date() - Racers[i].timeout < TIMEOUT_LIMIT) {
          if (racer.password===number) {
            _moveRacerPositionUp(i);            
          }
        } else {
          _moveRacerPositionDown(i);
        }
      }else if (racer.position === 9){
        if (new Date() - Racers[i].timeout < TIMEOUT_LIMIT) {
            if (racer.password===number) {
              _moveRacerPositionUp(i);            
              _winTheGame(i);
            }
          } else {
            _moveRacerPositionDown(i);
          }        
      }      
    }
  });
  _updateSocket('racer', _formatRacersOutput());
  cb(); 
}

exports.removeRacer = function(racerId,cb) {
  _.remove(Racers, {id: racerId});
  _updateSocket('racer', _formatRacersOutput());
  cb();
}

exports.loadRanking = function(cb) {
  sqlDb.all(`
    SELECT *
    FROM Ranking 
    ORDER BY time_total ASC
  `).then(
    function onSuccess(data) {
      cb(data);      
    }
  );
}

exports.saveHighScore = function(racerId,name,cb) {
  if (winner.id === racerId) {
    winner.name = name;
    sqlDb.run(`
      INSERT INTO Ranking (
        id, 
        jogador, 
        time_total, 
        data
      ) VALUES (
          ?,
          ?,
          ?,
          ?
      )
    `,null,
      winner.name,
      winner.time_total,
      winner.date
    ).then(
      function onSuccess(data) {
        cb(data);      
      }
    );
  } 
}

function _updateSocket(socketType, doc) {
  socket.emit(socketType+':save', doc);
}

function _formatRacersOutput() {
  return Racers.map(function(racer) {
    return {
      id:racer.id,
      color:racer.color,
      icon:racer.icon,
      position:racer.position
    }
  }
)
}

function _moveRacerPositionUp(index) {
  Racers[index].password = passwordFactory.generate();
  Racers[index].position++;
  Racers[index].timeout = new Date();
}

function _moveRacerPositionDown(index) {
  Racers[index].password = passwordFactory.generate();
  Racers[index].position -= Math.floor((new Date() - Racers[index].timeout) / TIMEOUT_LIMIT);
  if (Racers[index].position < 1) {
    Racers[index].position = 1;
  }        
  Racers[index].timeout = new Date();
}

function _winTheGame(index) {
  var date = new Date();
  var timeTotal = moment.duration(date - Racers[index].start);
  var timeTotalFormated = moment.utc(timeTotal.asMilliseconds()).format("HH:mm:ss");
  winner = {
    id: Racers[index].id,
    color:Racers[index].color,
    icon:Racers[index].icon,
    time_total: date - Racers[index].start,
    date: date.toISOString()
  };
  socket.emit('racer:haveWinner', winner);

  console.info(`
  ___-----_______________--------------------_______________-----___
                            CONGRATULATIONS
                              
                              [%s]
                            
                             WON THE GAME
                          Time: [%s]
  ___-----_______________--------------------_______________-----___
  `,Racers[index].id,timeTotalFormated);
}

