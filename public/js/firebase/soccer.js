class Soccer {
    constructor(firebase, channel) {
        var threaId = '-LWyhPmYE4UYYrFCKuc3';
        this.channel = channel;
        var $scope = this.$scope = $('body').scope();
        this.firebase = firebase;
        this.currentUser = firebase.auth().currentUser;
        this.list = firebase.database().ref('public/'+channel+'/matches/'+threaId+'/bets');
        this.options = firebase.database().ref('public/'+channel+'/matches/'+threaId+'/info/options');
        this.info = firebase.database().ref('public/'+channel+'/matches/'+threaId+'/info');
        this.bet = firebase.database().ref('public/'+channel+'/matches/'+threaId+'/bets/' + this.currentUser.uid);

        this.info.once('value', (data) => {
            $scope.match = data.val() || {};
            $scope.match.options.forEach(o => {
                o.users = [];
            })
            $scope.deadline = new Date($scope.match.deadline).toString();
            $scope.isBet = false;
            if(!$scope.$$phase) $scope.$apply();
            
            this.list.once('value', data => {
                if (new Date($scope.match.deadline) < new Date()) {
                    data.forEach(b => {
                        var bet = b.val();
                        $scope.match.options.find(o => o.team == bet.team).users.push(bet.name);
                        $scope.maxRow = Math.max.apply(Math, $scope.match.options.map(e => e.users.length));
                    })
                } else {
                    this.options.on('value', (data) => {
                        data = data.toJSON();
                        data = Object.keys(data).map(function(key) {
                            return data[key];
                        });
                        $scope.match.options = data;
                        if(!$scope.$$phase) $scope.$apply();
                    });
                }
                $scope.isBet = true;
                if(!$scope.$$phase) $scope.$apply();
            });
        });
    }
    Bet(team, callback) {
        this.bet.set({
            uid: this.currentUser.uid,
            name: this.currentUser.displayName || this.currentUser.email,
            team: team,
            bet_date: new Date().toLocaleString()
        }, err => {
            callback(err);
        });
        if (!this.$scope.isBet) {
            var $scope = this.$scope;
            this.options.off();
            this.options.on('value', (data) => {
                data = data.toJSON();
                data = Object.keys(data).map(function(key) {
                    return data[key];
                });
                $scope.isBet = true;
                $scope.match.options = data;
                if(!$scope.$$phase) $scope.$apply();
            });
        }
    }
}