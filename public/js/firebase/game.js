class Game {
    constructor(firebase) {
        var $scope = $('body').scope();
        this.firebase = firebase;
        this.currentUser = firebase.auth().currentUser;
        this.game = firebase.database().ref('public/games/data');
        this.result = firebase.database().ref('public/games/result');
        this.ready = firebase.database().ref('public/games/ready');
        this.team = firebase.database().ref('public/games/team');
        this.connected = firebase.database().ref('.info/connected');
        this.team.on('child_added', (data) => {
            var team = data.key;
            var data = data.val();
            $scope['team' + team] = data;
            if(!$scope.$$phase) $scope.$apply();
        });
        this.team.on('child_removed', (data) => {
            var team = data.key;
            delete $scope['team' + team];
            if(!$scope.$$phase) $scope.$apply();
        });
        this.game.on('child_added', (data) => {
            data = JSON.parse(data.val());
            $scope.Calculate(data.txtA, data.txtB);
            $scope.statusA = false;
            $scope.statusB = false;
            if(!$scope.$$phase) $scope.$apply();
        });
        this.result.on('value', (data) => {
            data = data.val() || {};
            $scope.result = data;
            if(!$scope.$$phase) $scope.$apply();
        });
        this.ready.on('value', (data) => {
            data = data.val() || {};
            $scope.statusA = data.A;
            $scope.statusB = data.B;
            if(!$scope.$$phase) $scope.$apply();
        });
    }
    Join(team) {
        var data = {};
        data[team] = {};
        data[team].uid = this.currentUser.uid;
        data[team].name = this.currentUser.displayName;
        this.team.update(data);
    }
    Remove(team) {
        var data = {};
        data[team] = {};
        this.team.update(data);
    }
    Ready(data) {
        $.ajax({
            url: '/ready',
            method: 'post',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(data),
            success: function(result) { 
                console.log(result);
            }
        })
    }
    Submit(data) {
        $.ajax({
            url: '/submit',
            method: 'post',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(data),
            success: function(result) { 
                console.log(result);
            }
        })
    }
}