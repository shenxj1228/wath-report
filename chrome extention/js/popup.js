var port = chrome.extension.connect();
var msgDom = $('#msg'),
    watchDom = $('#watch'),
    serverDom = $('#server'),
    tofileListDom=$('#toFileList');

chrome.extension.sendRequest({ do: "check" }, function(response) {
    setWatchDom(response);
});

if (typeof(localStorage.server) != 'undefined') {
    serverDom.val(localStorage.getItem('server'));
}
watchDom.on('click', function(event) {
    event.stopPropagation();
    event.preventDefault();
    if ($.trim(serverDom.val()) === '') {
        msgDom.removeClass().addClass('error');
        msgDom.text('请输入监听服务地址');
        return;
    }
    localStorage.setItem('server', $.trim(serverDom.val()).toLowerCase());
    msgDom.removeClass().addClass('process');
    msgDom.text('请求发送中');
    watchDom.attr('disabled', 'disabled');
    chrome.extension.sendRequest({ do: "watch" }, function(response) {
        setWatchDom(response);
        watchDom.removeAttr('disabled');
    });
});

tofileListDom.on('click', function(event) {
    event.stopPropagation();
    event.preventDefault();
    chrome.tabs.create({ url: 'fileinfo.html' }, function() {});
});

function setWatchDom(response) {
    if (response.status === "watching") {
        watchDom.text('Stop Watch');
        serverDom.attr('disabled', 'disabled');
        tofileListDom.parent().removeClass('available').addClass('available');
        msgDom.text('监听中');
    } else if (response.status === "not watching") {
        watchDom.text('Watch');
        serverDom.removeAttr('disabled');
        tofileListDom.parent().removeClass('available');
    }
}
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.error === '1000') {
        msgDom.removeClass().addClass('error');
    } else if (request.error === '0000') {
        msgDom.removeClass().addClass('success');
    } else if (request.error === '9999') {
        msgDom.removeClass().addClass('process');
         watchDom.text('Watch');
        serverDom.removeAttr('disabled');
        tofileListDom.parent().removeClass('available');
    }
    if (request.error != undefined)
        msgDom.text(request.errormsg);
});
