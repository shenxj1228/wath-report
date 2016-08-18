var port = chrome.extension.connect();

chrome.extension.sendRequest({ do: "check" }, function(response) {
    setWatchDom(response);
});
if (typeof(localStorage.server) != 'undefined') {
    $('#server').val(localStorage.getItem('server'));
}
$('#watch').on('click', function(event) {
    event.stopPropagation();
    event.preventDefault();
    if ($.trim($('#server').val()) === '') {
        $('#msg').removeClass().addClass('error');
        $('#msg').text('请输入监听服务地址');
        return;
    }
    localStorage.setItem('server', $.trim($('#server').val()).toLowerCase());
    $('#msg').removeClass().addClass('process');
    $('#msg').text('请求发送中');
    $('#watch').attr('disabled', 'disabled');
    chrome.extension.sendRequest({ do: "watch" }, function(response) {
        setWatchDom(response);
        $('#watch').removeAttr('disabled');
    });
});

$('#toFileList').on('click', function(event) {
    event.stopPropagation();
    event.preventDefault();
    chrome.tabs.create({ url: 'fileinfo.html' }, function() {});
});

function setWatchDom(response) {
    if (response.status === "watching") {
        $('#watch').text('Stop Watch');
        $('#msg').removeClass().addClass('success');
        $('#msg').text('监听服务连接中');
    } else if (response.status === "not watching") {
        $('#watch').text('Watch');
    } else {

    }
}
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.error === '1000') {
        $('#msg').removeClass().addClass('error');
    } else if (request.error === '0000') {
        $('#msg').removeClass().addClass('success');
    } else if (request.error === '9999') {
        $('#msg').removeClass().addClass('process');
    }
    if (request.error != undefined)
        $('#msg').text(request.errormsg);
});
