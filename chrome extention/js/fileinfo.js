var files = [];
(function() {
    chrome.extension.sendRequest({ do: "check" }, function(response) {
        if (response.status === 'watching' && typeof(localStorage.files) != 'undefined' && localStorage.files != '') {
            files = JSON.parse(localStorage.files);
            initPage(files);
        }
    });

})();

function initPage(files) {
    $('.content').empty();
    files.sort(sortByIndex);
    files.forEach(function(element, index) {
        var Dom = '<div class="row"><div class="col-xs-3 col-md-3 file-name"><a target="_blank" href="' + localStorage.server + '/' + element.name + '">' + element.name + '</a></div><div class="col-xs-3 col-md-3 file-size">' + toEasySize(element.size) + '</div><div class="col-xs-3 col-md-3 "><span class="badge change-count">' + element.count + '</span></div><div class="col-xs-3 col-md-3 change-time">' + toLocalTime(element.time) + '</div></div>';
        $('.content').append(Dom);
    });
}


$('#searchBtn').on('click', function(event) {
    event.stopPropagation();
    event.preventDefault();
    var searchText = $.trim($('#searchTxt').val());
    if (searchText != '') {
        $('.content>.row').css('display', 'none');
        var array = searchFile(searchText, files);
        if (array.length > 0) {
            array.forEach(function(element, index) {
                $('.content').children().eq(element.index).css('display', 'block');
            });
        }

    } else {
        $('.content>.row').css('display', 'block');
    }
});

function searchFile(strSearch, fileArray) {
    var pattern = strSearch.split('').join('.*?');
    var regexp = new RegExp(pattern);
    var result = [];
    fileArray.forEach(function(element, index) {
        var match = element.name.search(regexp);
        if (match > -1) {
            result.push({ 'index': match, 'file': element });
        }
    });
    return result.sort(sortByIndex);
}

function sortByIndex(a, b) {
    return a.index - b.index;
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
