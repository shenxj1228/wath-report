chrome.browserAction.setPopup({ popup: 'popup.html' });
var socket;
localStorage.watching = false;

function startWatch() {
    if (typeof(localStorage.server) != 'undefined' && localStorage.server != '') {
        socket = io.connect(localStorage.server);
        socket.on('connect', function(msg) {
            localStorage.watching = true;
        });
        socket.on('connect_error', function(err) {
            localStorage.watching = 'connect_error';
        });
        //页面初始化获取文件
        socket.on('files', function(files) {
            var array = new Array(files.length);
            for (var i = 0; i < array.length; i++) {
                array[i] = 0;
            }
            localStorage.setItem('changeCount', JSON.stringify(array));
        });
        //新文件推送信息装载
        socket.on('new file', function(newFile) {
            var array = JSON.parse(localStorage.getItem('changeCount'));
            array[newFile.index] = array[newFile.index] + 1;
            localStorage.setItem('changeCount', JSON.stringify(array));
            var notification = chrome.notifications.create('11', { type: 'basic', iconUrl: 'images/48.png', 'title': '123', 'message': '443433' }, function() {});
        });
    }
}

function stopWatch() {
    socket.disconnect();
    localStorage.watching = false;
}

function sendSocketStatus(sendResponse) {
    if (socket === undefined || !socket.connected) {
        sendResponse({ status: 'not watching' });
    } else {
        sendResponse({ status: 'watching' });
    }
}

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if (request.do === 'watch') {
            if (socket != undefined && socket.connected) {
                stopWatch();
            } else {
                startWatch();
            }
        } else if (request.do === 'check') {

        }
        sendSocketStatus(sendResponse);
    });
