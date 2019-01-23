class User {
    constructor(firebase) {
        var $scope = $('body').scope();
        this.currentUser = firebase.auth().currentUser;
        this.users = firebase.database().ref('public/users');
        this.connections = firebase.database().ref('public/connections');
        this.userRef = firebase.database().ref('public/users/' + this.currentUser.uid);
        this.connected = firebase.database().ref('.info/connected');
        
        this.users.on('child_added', (data) => {
            $scope.users = $scope.users || [];
            if ($scope.users.every(u => u.uid !== data.key)) {
                $scope.users.push(data.val());
                $scope.$apply();
                $('.container-fluid').removeClass('hide');
                if (data.key != this.currentUser.uid) {
                    var html = $(`<p class="notice"><span class="user"></span> join chat</p>`);
                    html.find('.user').text(data.val().name);
                    $('#chat-container').append(html);
                }
            }
        });
        this.users.on('child_removed', (data) => {
            // if (this.currentUser.uid === data.key) {
            //     this.userRef.set({
            //         uid: this.currentUser.uid,
            //         name: this.currentUser.displayName || this.currentUser.email,
            //         country: $scope.country
            //     });
            // } else {
                var idx = $scope.users.findIndex(u => u.uid === data.key);
                if (idx >= 0) $scope.users.splice(idx, 1);
                if(!$scope.$$phase) $scope.$apply();
                if (data.key != this.currentUser.uid) {
                    var html = $(`<p class="notice"><span class="user"></span> leave chat</p>`);
                    html.find('.user').text(data.val().name);
                    $('#chat-container').append(html);
                }
            // }
        });
        this.users.on('child_changed', (data) => {
            $scope.users = $scope.users || [];
            var user = $scope.users.find(u => u.uid === data.key);
            if (user) {
                user.country = data.val().country;
                if(!$scope.$$phase) $scope.$apply();
            }

            if (this.currentUser.uid === data.key) {
                $scope.country = data.val().country;
            }
        });
        var connection = this.connections.push({
            uid: this.currentUser.uid,
            name: this.currentUser.displayName || this.currentUser.email,
        });
        firebase.database().ref('public/connections/' + connection.key).onDisconnect().remove();
        this.userRef.once('value', (data) => {
            data = data.val() || {};
            $scope.country = data.country;
            if(!$scope.$$phase) $scope.$apply();
        })
    }
    ChangeCountry(team) {
        this.userRef.update({
            country: team
        });
    }
}