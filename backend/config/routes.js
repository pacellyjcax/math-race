var path = require('path');

module.exports = function(app) {

    // Redirecionando rotas inexistentes para raiz
    app.route('/*').get(function(req, res) {
        res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });

};
