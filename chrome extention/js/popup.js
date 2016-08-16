var port = chrome.extension.connect();
var watching = false;
(function() {
    var watching = false;
    if (typeof(localStorage.watching) != 'undefined' && localStorage.watching != '') {
        watching = JSON.parse(localStorage.watching);
    }
    if (watching === true) {
        $('#watch').text('Stop Watch');
    } else if (watching === false) {
        $('#watch').text('Watch');
    } else {
        $('#watch').text('Watch');
        $('#msg').text(watching);
    }
})();

$('#watch').on('click', function(event) {
    if (watching == true) {
    	$('#watch').text('Stop Watch');
        chrome.extension.getBackgroundPage().stopWatch();
    } else {
    	$('#watch').text('Watch');
        chrome.extension.getBackgroundPage().startWatch();
    }
    event.stopPropagation();
    event.preventDefault();
});
