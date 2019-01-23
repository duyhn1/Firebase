const server = 'http://52.194.234.14:8000/'
const data = {
    a: 'Thắng',
    b: 'Thắng',
    h: 'Hòa',
    inv: 'Invalid'
};
let fbs;
var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope) {
    fbs = new FireBaseClass(true);
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            $scope.user = user.uid;
            $scope.$apply();
        } else {
            window.location.href = '/';
        }
    });
    
    $scope.country = '';
    $scope.resultTH = $scope.resultCRM = 0;

    // private function
    $scope.ChangeCountry = country => {
        // socket.emit('onChangeCountry', { country: country });
        fbs.User.ChangeCountry(country);
    }

    $scope.Join = team => {
        // socket.emit('onJoin', { team: team });
        fbs.Game.Join(team);
    }

    $scope.Remove = team => {
        // socket.emit('onRemove', { team: team });
        fbs.Game.Remove(team);
    }

    $scope.Ready = team => {
        var txt = team == 'A' ? $scope.txtA : team == 'B' ? $scope.txtB : '';
        if (txt) {
            // socket.emit('onReady', { team: team, txt: txt });
            fbs.Game.Ready({ team: team, txt: txt });
        }
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

    // Calculate
    $scope.rslt = [];
    $scope.total = {
        a: 0,
        b: 0
    };
    $scope.Calculate = (txtA, txtB) => {
        $scope.rslt = [];
        $scope.total = {
            a: 0,
            b: 0
        };
        var txtA = txtA.trim().split('\n');
        var txtB = txtB.trim().split('\n');
        if (txtA.length != txtB.length) {
            alert('Số dòng không map');
            return;
        }
        var regex = new RegExp('bua|bao|keo|búa|kéo', 'gi');
        for (var i = 0; i < txtA.length; i++) {
            var a = txtA[i].match(regex);
            var b = txtB[i].match(regex);
            var row = {};
            a.forEach((v, i) => {
                row[`a${i+1}`] = v;
            });
            b.forEach((v, i) => {
                row[`b${i+1}`] = v;
            });
            if (a.length < 6 || b.length < 6) {
                row.rslt2 = data.inv;
                row.clazz = 'invalid';
            } else {
                var r = {
                    a: 0,
                    b: 0
                };
                for (var j = 0; j < a.length && r.a < 2 && r.b < 2; j++) {
                    var c = Compare(a[j], b[j], r);
                    if (c == 1) {
                        row[`c${j + 1}`] = 'win';
                        row[`d${j + 1}`] = 'lose';
                    } else if (c == -1) {
                        row[`c${j + 1}`] = 'lose';
                        row[`d${j + 1}`] = 'win';
                    }
                }
                if (r.a >= 2) {
                    row.rslt1 = data.a;
                    row.clazz = 'win';
                    $scope.total.a++;
                } else if (r.b >= 2) {
                    row.rslt3 = data.b;
                    row.clazz = 'lose';
                    $scope.total.b++;
                } else {
                    row.rslt2 = data.h;
                    row.clazz = 'draw';
                }
            }
            $scope.rslt.push(row);
        }
        $('#rslt').removeClass('hide');
        if ($scope.teamA.uid == $scope.user) {
            fbs.Game.Submit({ team: 'A', user: $scope.user, result: $scope.total });
        }
        if ($scope.teamB.uid == $scope.user) {
            fbs.Game.Submit({ team: 'B', user: $scope.user, result: $scope.total });
        }
    }
});

var Compare = (a, b, r) => {
    a = a.toLowerCase();
    b = b.toLowerCase();
    switch (a)
    {
        case "bua":
        case "búa":
            if (b == "keo" || b == "kéo")
            {
                r.a++;
                return 1;
            }
            else if (b == "bao")
            {
                r.b++;
                return -1;
            }
            break;
        case "keo":
        case "kéo":
            if (b == "bao")
            {
                r.a++;
                return 1;
            }
            else if (b == "bua" || b == "búa")
            {
                r.b++;
                return -1;
            }
            break;
        case "bao":
            if (b == "bua" || b == "búa")
            {
                r.a++;
                return 1;
            }
            else if (b == "keo" || b == "kéo")
            {
                r.b++;
                return -1;
            }
            break;
    }
    return 0;
}
