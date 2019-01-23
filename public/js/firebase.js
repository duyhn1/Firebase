window.include = function(src)
{
    document.write('<script src="'+src+'"></script>');
},
include('./js/firebase/main.js');
include('./js/firebase/message.js');
include('./js/firebase/user.js');
include('./js/firebase/game.js');
include('./js/firebase/loginMethod.js');
