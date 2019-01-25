let fbs;
var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope) {
    $scope.maxRow = 0;
    fbs = new FireBaseClass({
        channel: 'soccer',
        message: true,
        soccer: true
    });
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            $scope.user = user.uid;
            $scope.$apply();
        } else {
            window.location.href = '/?url=' + window.location.href;
        }
    });
    $scope.Bet = function(team) {
        fbs.Soccer.Bet(team, err => {
            // alert(`Đã bet team ${team} thành công`)
            if (err) {
                alert(`Bet không thành công`);
            } else {
                alert(`Đã bet team ${team} thành công`);
            }
        });
    }
    // Chat
    $scope.KeyPress = event => {
        if (event.altKey && event.which === 13) {
            $scope.txtChat = ($scope.txtChat || '') + '\n';
        } else if(!event.shiftKey && event.which === 13) {
            $scope.SendChat();
        }
    }
    $scope.SendChat = () => {
        // socket.emit('chat', { message: $scope.txtChat });
        if ($scope.txtChat) {
            fbs.Message.SendChat($scope.txtChat);
            $scope.txtChat = '';
        }
    }
    $scope.range = function(min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    };
});