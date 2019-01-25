window.include = function(src)
{
    document.write('<script src="'+src+'"></script>');
}
window.getParameterByName = function(name) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
include('./js/firebase/main.js');
include('./js/firebase/message.js');
include('./js/firebase/user.js');
include('./js/firebase/game.js');
include('./js/firebase/soccer.js');
include('./js/firebase/loginMethod.js');
