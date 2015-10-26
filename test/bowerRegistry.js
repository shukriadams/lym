// fake a bower server response on all calls
var http = require('http'),
    server = null;

server = http.createServer(function (req, res) {
    var route = req.url;

    if(route.indexOf('/packages/') === 0){
        var pkg = route.substr(10);
        res.setHeader('Content-Type', 'application/json');

        console.log('Bower registry package request : ' + pkg);

        res.end(JSON.stringify({ url : 'https://shukriadams@bitbucket.org/shukriadams/'+ pkg + '.git' , name : pkg }));

    } else if (route.indexOf('/exit') === 0) {
        console.log('Bower registry shutting down');
        require('process').exit();
    } else {
        res.end('');
        server.kill();
    }
});

server.listen(9543, '127.0.0.1');