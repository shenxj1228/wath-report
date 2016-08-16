var port = chrome.extension.connect();

chrome.extension.sendRequest({ do: "check" }, function(response) {
    setWatchDom(response);
});

$('#watch').on('click', function(event) {
    event.stopPropagation();
    event.preventDefault();
    $('#watch').attr('disabled', 'disabled');
    chrome.extension.sendRequest({ do: "watch" }, function(response) {
        setWatchDom(response);
        $('#watch').removeAttr('disabled');
    });
});

function setWatchDom(response) {
    if (response.status === "watching") {
        $('#watch').text('Stop Watch');
    } else if (response.status === "not watching") {
        $('#watch').text('Watch');
    } else if (response.error != null) {
        $('#msg').text(response.error);
    } else {

    }
}
