var files = [];

//获取参数
(function($) {
    $.getUrlParam = function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null)
            return unescape(r[2]);
        return null;
    };
})(jQuery);

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
    $('.search-result').empty();
    files.forEach(function(element, index) {
        var listDom = '<div class="row"><div class="col-xs-3 col-md-3 file-name"><a target="_blank" href="' + localStorage.server + '/' + element.name + '">' + element.name + '</a></div><div class="col-xs-3 col-md-3 file-size">' + toEasySize(element.size) + '</div><div class="col-xs-3 col-md-3 "><span class="badge change-count">' + element.count + '</span></div><div class="col-xs-3 col-md-3 change-time">' + toLocalTime(element.time) + '</div></div>';
        $('.content').append(listDom);

    });
    var searchTxt = $.getUrlParam('searchTxt');
    if (typeof(searchTxt) != 'undefined' && searchTxt != null) {
        $('#searchTxt').val(decodeURIComponent(searchTxt));
        $('.text-clear').addClass('available');
        showSearchResult(searchFile(decodeURIComponent(searchTxt), files));
    }
}

$('#searchTxt').on('input', function(event) {
    showSearchList();
});

$('#searchTxt').on('focus', function(event) {
    showSearchList();
});

$('#searchTxt').on('blur', function(event) {
    $('.search-out').removeClass('available');
});
$('.text-clear').on('click', function(event) {
    $('#searchTxt').val('');
    initPage(files);
    $(this).removeClass('available');
});

$('.search-result').on('mousedown', ' li', function(event) {
    $('#searchTxt').val($(this).text());
    $('.search-out').removeClass('available');
    var array = searchFile($(this).text(), files);
    showSearchResult(searchFile($(this).text(), files));
})

$('#searchBtn').on('click', function(event) {
    event.stopPropagation();
    event.preventDefault();
    var searchText = $.trim($('#searchTxt').val());
    if (searchText != '') {
        showSearchResult(searchFile(searchText, files));
    } else {
        $('.content>.row').css('display', 'block');
    }
});

function searchFile(strSearch, fileArray) {
    var pattern = strSearch.toLowerCase().split('').join('.*?');
    var regexp = new RegExp(pattern);
    var result = [];
    fileArray.forEach(function(element, index) {
        var match = element.name.toLowerCase().search(regexp);
        if (match > -1) {
            result.push({ 'sortInx': match, 'file': element, 'index': index });
        }
    });
    return result.sort(sortByIndex);
}

function showSearchResult(fileArray) {
    $('.content>.row').css('display', 'none');
    if (fileArray.length > 0) {
        fileArray.forEach(function(element, index) {
            $('.content').children().eq(element.index).css('display', 'block');
        });
    }
}

function showSearchList() {
    var searchResultDom = $('.search-result');
    var searchTxtDom = $('#searchTxt');
    if (searchTxtDom.val() != '') {
        searchResultDom.empty();
        searchResultDom.parent().removeClass('available').addClass('available');
        var array = searchFile($.trim(searchTxtDom.val()), files);
        array.forEach(function(element, index) {
            if (index < 10) {
                var searchDom = '<li>' + element.file.name + '</div>';
                searchResultDom.append(searchDom);
            }
        });
        if (array.length > 10) {
            searchResultDom.append('<small><i>最多显示10条查询结果</i></small>');
        }
        if (searchTxtDom.val() != '') {
            $('.text-clear').removeClass('available').addClass('available');
        }
    }
}

function sortByIndex(a, b) {
    return a.sortInx - b.sortInx;
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
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.status = 'new file') {
        files=JSON.parse(localStorage.files);
        initPage(files);
    }
});
