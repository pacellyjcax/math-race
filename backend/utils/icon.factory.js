'use strict';


var icons = [
"account_box",
"account_circle",
"android",
"face",
"motorcycle",
"rowing",
"airplanemode_active",
"monetization_on",
"cloud",
"computer",
"directions_car",
"smoking_rooms",
"child_care",
"casino",
"person",
"public",
"sentiment_very_satisfied",
"star"
];

exports.generate = function(cb) {
    return icons[Math.floor(Math.random() * icons.length)];
}
