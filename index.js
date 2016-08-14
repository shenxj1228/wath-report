var path = require('path'),
    fs = require('fs'),
    cfg = require('./cfg/cfg.js'),
    express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http);



/**
文件对象的属性
name：文件名称
changeCount：修改次数，初始化0
time：最初修改时间
size：大小
**/

var initFilesState=[];
(function getFilesState(){
    cfg.files.forEach(function(element, index) {
        var filepath = path.normalize(element);
        var state=fs.statSync(filepath);
        var filePty={
            "name":path.basename(element),
            "count":0,
            "time":state.mtime,
            "size":state.size
        };
        initFilesState.push(filePty);
    });
})();




io.on('connection', function(socket) {
    socket.emit('files',initFilesState);
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
        io.emit('new file', { 'index':index,'name': path.basename(filepath), 'time': curr.mtime,"size":curr.size });
    });
});
