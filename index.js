var path = require('path'),
    fs = require('fs'),
    cfg = require('./cfg/cfg.js'),
    express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http);

io.on('connection', function(socket) {
    var basePaths = [];
    for (var i = 0;  i < cfg.files.length;i++) {
        basePaths.push(path.basename(cfg.files[i]));
    }
    socket.emit('files',basePaths);
});
app.use(express.static('public'));
app.use(express.static('new'));


app.get('/', function(req, res) {
    res.render('index.html', { title: '文件监听' });
});

 

http.listen(cfg.port, function() {
    console.log('listening on *:' + cfg.port);
});


cfg.files.forEach(function(element, index) {
    var filepath = path.normalize(element);
    fs.watchFile(filepath, function(curr, prev) {
        fs.createReadStream(filepath).pipe(fs.createWriteStream('./new/' + filepath));
        io.emit('newFile', { 'name': path.basename(filepath), 'time': curr.mtime });
    });
});
