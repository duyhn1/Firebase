class LoginMethod {
    constructor(firebase) {
        this.firebase = firebase;
    }
    GoogleLogin() {
        this.firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(function(result) {
            var token = result.credential.idToken;
            var user = result.user;
        }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            var email = error.email;
            var credential = error.credential;
        });
    }
    FacebookLogin() {
        this.firebase.auth().signInWithPopup(new firebase.auth.FacebookAuthProvider()).then(function(result) {
            var token = result.credential.idToken;
            var user = result.user;
        }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            var email = error.email;
            var credential = error.credential;
        });
    }
    EmailLogin(email, pass) {
        this.firebase.auth().signInWithEmailAndPassword(email, pass).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            $('.errMsg').text(errorMessage).show();
            // ...
          });
    }
    Register(email, pass) {
        this.firebase.auth().createUserWithEmailAndPassword(email, pass).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            $('.errMsg').text(errorMessage).show();
            // ...
          });
    }
    Logout() {
        this.firebase.database().goOffline();
        this.firebase.auth().signOut().then(function() {
        }).catch(function(error) {

        });
    }
}