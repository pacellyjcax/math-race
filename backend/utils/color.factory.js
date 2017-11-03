'use strict';

exports.generate = function(cb) {
    return '#' + (0x1000000 + Math.floor(Math.random() * 0x1000000)).toString(16).substr(1);
}
