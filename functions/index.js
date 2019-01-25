const functions = require('firebase-functions');
var admin = require("firebase-admin");
var serviceAccount = require("./duyhn-52055-df7a0d94d1bb.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://duyhn-52055.firebaseio.com"
});
var db = admin.database();

exports.ready = functions.https.onRequest((req, res) => {
    var ref = db.ref('private/xuxi/games/ready');
    if (req.body.team && req.body.txt) {
        ref.once('value', snap => {
            snap = snap.val() || {};
            if (!snap[req.body.team] || Object.keys(snap[req.body.team]).length === 0) {
                snap[req.body.team] = {};
                snap[req.body.team].txt = req.body.txt;
    
                if (snap.A && Object.keys(snap.A).length > 0 && snap.B && Object.keys(snap.B).length > 0) {
                    var game = db.ref('public/xuxi/games/data');
                    game.set({ data: JSON.stringify({ txtA: snap.A.txt , txtB: snap.B.txt })});
                    ref.set({});
                    game.set({});
                    res.status(200).json({ success: true });
                } else {
                    ref.update(snap);
                    var data = {};
                    data[req.body.team] = true;
                    db.ref('public/xuxi/games/ready').update(data);
                    res.status(200).json({ success: true });
                }
            }
        });
    } else {
        res.status(400);
    }

});
exports.submit = functions.https.onRequest((req, res) => {
    var ref = db.ref('private/xuxi/games/submit');
    if (req.body.team && req.body.result) {
        ref.once('value', snap => {
            snap = snap.val() || {};
            if (!snap[req.body.team] || Object.keys(snap[req.body.team]).length === 0) {
                snap[req.body.team] = {};
                snap[req.body.team].user = req.body.user;
                snap[req.body.team].result = req.body.result;
                ref.update(snap);
                res.status(200).json({ success: true });
            } else {
                res.status(400).json({ msg: `team ${req.body.team} already submited` });
            }
        });
        
    } else {
        res.status(400).json({ msg: 'missing team or result' });
    }
});

exports.onSubmit = functions.database.ref('private/xuxi/games/submit').onUpdate((change) => {
    console.log(`onsubmit data: ${JSON.stringify(change)}`);
    try {
        var snap = change.after.toJSON();
        if (snap.A && Object.keys(snap.A).length > 0 && snap.B && Object.keys(snap.B).length > 0) {
            if (snap.A.result.a === snap.B.result.a && snap.A.result.b === snap.B.result.b) {
                console.log('prepare get users');
                return db.ref('public/xuxi/users').once('value', (userRef) => {
                    var users = userRef.val() || {};
                    console.log(`users: ${JSON.stringify(users)}`);
                    var countryA = users[snap.A.user];
                    var countryB = users[snap.B.user];
                    return db.ref('public/xuxi/games/result').once('value', (data) => {
                        var result = data.val() || {};
                        console.log(result);
                        result[countryA.country] = (result[countryA.country] || 0) + snap.A.result.a - snap.A.result.b;
                        result[countryB.country] = (result[countryB.country] || 0) + snap.A.result.b - snap.A.result.a;

                        console.log(result);
                        db.ref('public/xuxi/games/result').set(result);
                        db.ref('private/xuxi/games/submit').set({});
                        db.ref('public/xuxi/games/ready').set({});
                        return 'success';
                    });
                });
            } else {
                console.log('Result not match');
                return 'Result not match';
            }
        } else {
            console.log('Not pair submit');
            return 'Not pair submit';
        }
    } catch(err) { 
        console.log('exception');
        console.log(err);
        return err;
    }
})

exports.onUserDisconnect = functions.database.ref('public/xuxi/connections/{cid}').onDelete((event) => {
    console.log(`onUserDisconnect: ${JSON.stringify(event)}`);
    var user = event.toJSON();
    // user = Object.values(user)[0];

    return db.ref('public/xuxi/connections').once('value', (data) => {
        data = data.toJSON() || {};
        console.log(JSON.stringify( Object.values(data)));
        var stillConnect = Object.values(data).some(c => c.uid === user.uid);
        console.log(stillConnect);
        if (!stillConnect) {
            return db.ref('public/xuxi/users/' + user.uid).set({}, () => {
                return db.ref('public/xuxi/games').once('value', (data) => {
                    var tasks = [];
                    data = data.toJSON();
                    var team;
                    if (data.team) {
                        Object.keys(data.team).forEach(e => {
                            if (data.team[e].uid === user.uid) {
                                team = e;
                                var o = {};
                                o[team] = {};
                                tasks.push(db.ref('public/xuxi/games/team').update(o));
                            }
                        })
                    }
                    if (team && data.ready && data.ready[team]) {
                        var o = {};
                        o[team] = {};
                        tasks.push(db.ref('public/xuxi/games/ready').update(o));
                        tasks.push(db.ref('private/xuxi/games/ready').update(o));
                    }
                    if (tasks.length > 0) return Promise.all(tasks);
                    else return 0;
                });
            });
        }
        return 0;
    });
});

exports.onUserConnect = functions.database.ref('public/xuxi/connections/{cid}').onCreate((event) => {
    console.log(`onUserConnect: ${JSON.stringify(event)}`);
    var user = event.toJSON() || {};
    // user = Object.values(user)[0];

    return db.ref('public/xuxi/users').once('value', (data) => {
        var users = data.toJSON() || {};
        if (!Object.keys(users).includes(user.uid)) {
            return db.ref('public/xuxi/users/' + user.uid).set(user);
        } else return 0;
    })
});

exports.onUserDisconnectSoccer = functions.database.ref('public/soccer/connections/{cid}').onDelete((event) => {
    console.log(`onUserDisconnect: ${JSON.stringify(event)}`);
    var user = event.toJSON();
    // user = Object.values(user)[0];

    return db.ref('public/soccer/connections').once('value', (data) => {
        data = data.toJSON() || {};
        console.log(JSON.stringify( Object.values(data)));
        var stillConnect = Object.values(data).some(c => c.uid === user.uid);
        console.log(stillConnect);
        if (!stillConnect) {
            return db.ref('public/soccer/users/' + user.uid).set({});
        }
        return 0;
    });
});

exports.onUserConnectSoccer = functions.database.ref('public/soccer/connections/{cid}').onCreate((event) => {
    console.log(`onUserConnect: ${JSON.stringify(event)}`);
    var user = event.toJSON() || {};
    // user = Object.values(user)[0];

    return db.ref('public/soccer/users').once('value', (data) => {
        var users = data.toJSON() || {};
        if (!Object.keys(users).includes(user.uid)) {
            return db.ref('public/soccer/users/' + user.uid).set(user);
        } else return 0;
    })
});

exports.onBet = functions.database.ref('public/soccer/matches/{mid}/bets/{uid}').onCreate((event, context) => {
    console.log(`onBet: ${JSON.stringify(event)}`);
    var mid = context.params.mid;
    var bet = event.toJSON() || {};

    return db.ref(`public/soccer/matches/${mid}/info/options`).once('value', (data) => {
        data = data.toJSON();
        Object.values(data).forEach(opt => {
            if (opt.team === bet.team) {
                opt.count = (opt.count || 0) + 1;
            }
        })
        return db.ref(`public/soccer/matches/${mid}/info/options`).update(data);
    })
});

exports.onUnBet = functions.database.ref('public/soccer/matches/{mid}/bets/{uid}').onDelete((event, context) => {
    console.log(`onBet: ${JSON.stringify(event)}`);
    var mid = context.params.mid;
    var bet = event.toJSON() || {};

    return db.ref(`public/soccer/matches/${mid}/info/options`).once('value', (data) => {
        data = data.toJSON();
        Object.values(data).forEach(opt => {
            if (opt.team === bet.team) {
                opt.count = (opt.count || 0) - 1;
            }
        })
        return db.ref(`public/soccer/matches/${mid}/info/options`).update(data);
    })
});