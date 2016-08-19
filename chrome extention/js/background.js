chrome.browserAction.setPopup({ popup: 'popup.html' });
var socket, count = 0;

function startWatch() {
    if (typeof(localStorage.server) != 'undefined' && localStorage.server != '') {
        socket = io.connect(localStorage.server);
        socket.on('connect', function(msg) {
            chrome.extension.sendRequest({ error: '0000', errormsg: '正在监听文件' });
        });
        socket.on('connect_error', function(err) {
            chrome.extension.sendRequest({ error: '1000', errormsg: '无法连接监听服务' });
            localStorage.setItem('files', '');
        });

        //页面初始化获取文件
        socket.on('files', function(files) {
            localStorage.setItem('files', JSON.stringify(files));
        });

        //新文件推送信息装载
        socket.on('new file', function(newFile) {
            count++;
            var files = JSON.parse(localStorage.getItem('files'));
            files[newFile.index] = {
                "name": newFile.name,
                "count": files[newFile.index].count + 1,
                "time": newFile.time,
                "size": newFile.size
            };
            localStorage.setItem('files', JSON.stringify(files));
            chrome.extension.sendRequest({ status: 'new file' }, function(response) {});
            var notificationOption = {
                type: 'basic',
                iconUrl: 'images/48.png',
                title: newFile.name + '发生变更',
                message: newFile.name + '\n大小：' + toEasySize(newFile.size) + '，\n更改时间：' + toLocalTime(newFile.time) + ' .'
            }
            chrome.notifications.clear('1228', function() {
                chrome.notifications.create('1228', notificationOption, function(notificationId) {});
            });
            chrome.notifications.onClicked.addListener(function(id) {
                if (id === '1228') {
                    var fileinfourl = 'fileinfo.html?searchTxt=' + encodeURIComponent(encodeURIComponent(newFile.name));
                    chrome.tabs.create({ url: fileinfourl }, function() {});
                }
            });
            var badgeText;
            if (count > 999) {
                badgeText = count.toString().substring(0, 1) + '...';
            } else {
                badgeText = count.toString();
            }
            chrome.browserAction.setBadgeText({ 'text': badgeText });

        });
    }
}

function stopWatch() {
    socket.disconnect();
    socket = null;
    chrome.extension.sendRequest({ error: '9999', errormsg: '断开连接' });
}
//更改成本地时间格式
function toLocalTime(time) {
    return new Date(time).toLocaleTimeString('zh-CN', {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });
}
//更改容易识别的大小 ，例如0.1G,0.2M,3.01K
function toEasySize(size) {
    var easySize;
    if (size / (1024 * 1024 * 1024) >= 0.01) {
        easySize = (size / (1024 * 1024 * 1024)).toFixed(2) + 'G';
    } else if (size / (1024 * 1024) >= 0.01) {
        easySize = (size / (1024 * 1024)).toFixed(2) + 'M';
    } else {
        easySize = (size / 1024).toFixed(2) + 'K';
    }
    return easySize;
}

function sendSocketStatus(sendResponse) {
    console.dir(socket);
    if (typeof(socket) === 'undefined' || socket === null) {
        sendResponse({ status: 'not watching' });
    } else {
        sendResponse({ status: 'watching' });
        if (socket.connected && !socket.disconnected) {
            sendResponse({ error: '0000', errormsg: '正在监听文件' });
        } else {
            sendResponse({ error: '1000', errormsg: '无法连接监听服务' });
        }
    }
}

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if (request.do === 'watch') {
            count = 0;
            chrome.browserAction.setBadgeText({ 'text': '' });
            if (typeof(socket) != 'undefined' && socket != null) {
                stopWatch();
            } else {
                startWatch();
            }
        } else if (request.do === 'check') {

        }
        sendSocketStatus(sendResponse);
    });
