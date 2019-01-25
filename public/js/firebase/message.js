class Message {
    constructor(firebase, channel) {
        var isFirstLoad = true;
        var blockNumber = 20;
        var offset;
        var isProgress = false;
        var isOldestMessage = false;
        this.messages = firebase.database().ref('public/'+channel+'/messages/');
        var currentUser = this.currentUser = firebase.auth().currentUser;
        this.messages.limitToLast(1).on('child_added', function (data) {
            if (!isFirstLoad) {
                RenderChat(data.toJSON(), true);
                $('#chat-container').animate( {scrollTop: $('#chat-container').get(0).scrollHeight}, 500 )
            } else {
                isFirstLoad = false;
            }
        });
        
        this.messages.orderByKey().limitToLast(blockNumber).once('value', function (data) {
            var firstId;
            data.forEach(e => {
                if (!firstId) firstId = e.key; 
                RenderChat(e.val());
            });
            $('#chat-container').animate( {scrollTop: $('#chat-container').get(0).scrollHeight}, 500 )
            offset = firstId;
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
                $('#chat-container').append(html);
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
        $('#chat-container').scroll(function() {
            if(!isOldestMessage && !isProgress && $(this).scrollTop() == 0) {
                isProgress = true;
                firebase.database().ref('public/'+channel+'/messages')
                .orderByKey().limitToLast(blockNumber + 1).endAt(offset).once('value', function (data) {
                    if (Object.keys(data.val()).length < blockNumber + 1) {
                        isOldestMessage = true;
                    }
                    var firstId;
                    data.forEach(e => {
                        if (e.key !== offset) {
                            if (!firstId) firstId = e.key; 
                            RenderChat(e.val(), false, true);
                        }
                    });
                    offset = firstId;
                    isProgress = false;
                });
            }
        })
    }
    SendChat(msg) {
        this.messages.push({ 
            uid: this.currentUser.uid, 
            user: this.currentUser.displayName || this.currentUser.email,
            message: msg,
            timestamp: Date.now()
        });
    }
}
