class LoginMethod {
    constructor(firebase) {
        this.firebase = firebase;
        this.provider = new firebase.auth.GoogleAuthProvider();
        this.provider.setCustomParameters({
            'login_hint': 'user@example.com'
        });
    }
    GoogleLogin() {
        this.firebase.auth().signInWithPopup(this.provider).then(function(result) {
            var token = result.credential.idToken;
            var user = result.user;
            window.location.href = '/xuxi';
        }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            var email = error.email;
            var credential = error.credential;
        });
    }
    Logout() {
        this.firebase.auth().signOut().then(function() {
            window.location.href = '/';
        }).catch(function(error) {

        });
    }
}