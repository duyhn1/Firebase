class Message {
    constructor(firebase) {
        var isFirstLoad = true;
        var blockNumber = 20;
        this.messages = firebase.database().ref('public/messages');
        var currentUser = this.currentUser = firebase.auth().currentUser;
        this.messages.limitToLast(1).on('child_added', function (data) {
            if (!isFirstLoad) {
                RenderChat(data.toJSON(), true);
            } else {
                isFirstLoad = false;
            }
        });
        
        this.messages.orderByKey().limitToLast(blockNumber).once('value', function (data) {
            data.forEach(e => {
                RenderChat(e.val());
            });
        });

        function RenderChat(data, isNotify = false, isPrepend = false) {
            var html = $(`<div class="message">
                            <span class="user">
                            </span>
                            <span class="content">
                            </span>
                            <span class="time">
                            </span>
                        </div>`);
            if (data.uid == currentUser.uid) html.find('.user, .content, .time').addClass('right me');
            html.find('.user').text(data.user);
            html.find('.content').text(data.message);
            html.find('.time').text(new Date(data.timestamp).toLocaleTimeString());
            if (isPrepend) {
                $('#chat-container').prepend(html);
            } else {
                $('#chat-container').append(html).animate( {scrollTop: $('#chat-container').get(0).scrollHeight}, 500 );
            }
            if (isNotify && data.uid !== currentUser.uid) {
                Notify(data.user, data.message);
            }
        }
        function Notify(user, msg) {
            if (Notification.permission === "granted") {
                var notification = new Notification('IDOM team', {
                    icon: 'https://221616.com/connect/pc/Content/themes/common/CP1018/img/logo.png',
                    body: `${user}: ${msg}`,
                });
        
                notification.onclick = function () {
                    window.focus();
                };
            }
        }
    }
    SendChat(msg) {
        this.messages.push({ 
            uid: this.currentUser.uid, 
            user: this.currentUser.displayName,
            message: msg,
            timestamp: Date.now()
        });
    }
}
