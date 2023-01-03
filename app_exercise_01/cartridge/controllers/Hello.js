var server = require('server');


server.get('Show', function (req, res, next) {
    res.render('hello/hello',{
        render: 'render',
        render2: 'pinkbike'
    });
    next();
});

module.exports = server.exports();
