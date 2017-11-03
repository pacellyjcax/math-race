var express = require('express');
var http = require('http');
var Promise = require("bluebird");
var sqlDb = require("sqlite");

var app = express();
var server = http.createServer(app);
var socketio = require('socket.io')(server, {
  path: '/socket.io-client'
});


require('./config/socketio')(socketio);
require('./config/express')(app);
require('./config/routes')(app);

// Criação Servidor
function startServer() {
  server.listen(app.get('port'), function() {
    console.log('Server listening on %d', app.get('port'));
  });
}

// Iniciar o SQLite
Promise.resolve()
.then(function() {
  // Abrir o BD
  sqlDb.open('./ranking.sqlite', { Promise });
}) 
.then(function() {
  // Carregar o Schema
  sqlDb.migrate({ force:true });
}) 
.catch(function(err) {
  console.error(err.stack);
})
.finally(function() {
  
  // Criação Servidor
  setImmediate(startServer);
});

// EXPOSE APP
exports = module.exports = app;