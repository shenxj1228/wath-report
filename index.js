var path = require('path'),
    fs = require('fs'),
    cfg = require('./cfg/cfg.js'),
    express = require('express'),
    app = express(),
    http = require('http').Server(app),
    url = require('url'),
    io = require('socket.io')(http);



/**
文件对象的属性
name：文件名称
changeCount：修改次数，初始化0
time：最初修改时间
size：大小
**/
var checkedCfg = [];
var initFilesState = [];
(function getFilesState() {
    cfg.files.forEach(function(element, index) {
        var filepath = path.normalize(element);
        if (!fs.existsSync(filepath)) {
            return;
        }
        var state = fs.statSync(filepath);
        var filePty = {
            "name": path.basename(element),
            "count": 0,
            "time": state.mtime,
            "size": state.size
        };

        if (!fs.existsSync('./new')) {
            fs.mkdirSync('./new');
        }

        if (state.isFile()) {
            checkedCfg.push(element);
            initFilesState.push(filePty);
            fs.createReadStream(filepath).pipe(fs.createWriteStream('./new/' + path.basename(element), {
                'flags': 'w',
                'encoding': 'utf8',
                'defaultEncoding': 'utf8',
                'fd': null,
                'mode': 0o666,
                'autoClose': true
            }));
        }
    });
})();

function urlEncodeChinese(req, res, next) {
    var decodeurlchinese = url.parse(req.url);
    var tmpdecodepath = decodeurlchinese.pathname;
    decodeurlchinese.pathname = decodeURIComponent(decodeurlchinese.pathname);
    decodeurlchinese.path = decodeurlchinese.path.replace(tmpdecodepath, decodeurlchinese.pathname); // 不需要正则全局替换，这样有可能把参数也给替换了  
    // decodeurlchinese.href = decodeurlchinese.href.replace(tmpdecodepath,decodeurlchinese.pathname); // 同上(只用转换一个即可)  

    // 因为for ...in 虽然可以全部便利object 名称但有时输出一些内容时显不会，所以暂时先替换req里的url、originalUrl(path暂时不替换)，路由能正确识别中文了。  
    //暂时先这样，下次把req里面全都遍历完。  

    //  console.log(decodeurlchinese.path);  
    req.url = req.originalUrl = decodeurlchinese.path;

    next();
}


io.on('connection', function(socket) {
    socket.emit('files', initFilesState);
});

app.use(express.static('public'));
app.use(express.static('new'), function(req, res, next) {
    urlEncodeChinese(req, res, next);
});


app.get('/', function(req, res) {
    res.render('index.html', { title: '文件监听' });
});



http.listen(cfg.port, function() {
    console.log('listening on *:' + cfg.port);
});


checkedCfg.forEach(function(element, index) {
    var filepath = path.normalize(element);
    var filename = path.basename(element);
    fs.watchFile(filepath, function(curr, prev) {
        fs.createReadStream(filepath).pipe(fs.createWriteStream('./new/' + filename, {
            'flags': 'w',
            'encoding': 'utf8',
            'defaultEncoding': 'utf8',
            'fd': null,
            'mode': 0o666,
            'autoClose': true
        }));
        initFilesState[index] = {
            "name": filename,
            "count": 0,
            "time": curr.mtime,
            "size": curr.size
        };
        io.emit('new file', { 'index': index, 'name': filename, 'time': curr.mtime, "size": curr.size });
    });
});
