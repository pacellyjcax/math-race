'use strict';

var express = require('express');
var compression = require('compression');
var path = require('path');


module.exports = function(app) {

  app.use(compression());

  app.set('port', (process.env.PORT || 2525));
  app.set('appPath', path.join(__dirname, '../../frontend'));
  app.use(express.static(path.join(__dirname, '../../frontend')));

};
