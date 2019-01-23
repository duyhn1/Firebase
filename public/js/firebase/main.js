class FireBaseClass {
    constructor(scope) {
        var Config = {
            apiKey: "AIzaSyAq4qE0-8VpFBOtDz3tkOkAQdhkZu7eWNo",
            authDomain: "duyhn-52055.firebaseapp.com",
            databaseURL: "https://duyhn-52055.firebaseio.com",
            projectId: "duyhn-52055",
        };
        firebase.initializeApp(Config);
        firebase.auth().useDeviceLanguage();
        this.firebase = firebase;
        this.LoginMethod = new LoginMethod(firebase);

        if (scope) {
            // Init properties
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    this.User = new User(firebase);
                    this.Message = new Message(firebase);
                    this.Game = new Game(firebase);
                }
            });
        }
    };
}
