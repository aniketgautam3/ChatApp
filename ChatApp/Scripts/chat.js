var currentUserKey;
var chatKey;

function startChat(key, name, image) {
    var friend_list = { friendId: key, userId: currentUserKey };
    var db = firebase.database().ref('friendList');
    var flag = false;
    db.on('value', function (friends) {
        friends.forEach(function (data) {
            var user = data.val();
            if ((user.friendId === friend_list.friendId && user.userId === friend_list.userId) || (user.friendId === friend_list.userId && user.userId === friend_list.friendId)) {
                flag = true;
                chatKey = data.key;
            }
        });
        if (flag === false) {
            chatKey = firebase.database().ref('friendList').push(friend_list, function (error) {
                if (error) alert(error);
                else {
                    document.getElementById('chatPanel').removeAttribute('style');
                    document.getElementById('start').setAttribute('style', 'display:none');
                    hideChatList();
                }
            }).getKey();
        }
        else {
            document.getElementById('chatPanel').removeAttribute('style');
            document.getElementById('start').setAttribute('style', 'display:none');
            hideChatList();
        }
        document.getElementById('friendPic').src = image;
        document.getElementById('friendName').innerHTML = name;
        document.getElementById('messages').innerHTML = '';

        onKeyDown();
        document.getElementById('txtMessage').value = '';
        document.getElementById('txtMessage').focus();
        LoadChatMessages(chatKey,image);
    });
    // console.log(chatKey);

}

function LoadChatMessages(chatKey , image) {
    var db = firebase.database().ref('chatMessage').child(chatKey);
    db.on('value', function (chats) {
        var messageDisplay = '';
        chats.forEach(function (data) {
            var chat = data.val();
            var datetime = chat.dateTime.split(',');


            if (chat.userId !== currentUserKey) {
                messageDisplay += ` <div class="row">
                            <div class="col-2 col-sm-1 col-md-1">
                                <img src="${image}" alt="" class="chat-pic rounded-circle">
                            </div>
                            <div class="col-7 col-sm-7 col-md-7">
                                <p class="receive">${chat.msg}
                                <span class="time" title="${datetime[0]}">${datetime[1]}</span>
                                    
                                </p>
                            </div>
                        </div> `;
            }
            else {
                messageDisplay += `<div class="row justify-content-end">
                <div class="col-7 col-sm-7 col-md-7">
                    <p class="sent float-right" >
                    ${chat.msg}
                    <span class="time" title="${datetime[0]}">${datetime[1]}</span> 
                    </p>
                </div>
                <div class="col-2 col-sm-1 col-md-1">
                    <img  src="${user_data.photoURL}" alt="" class="chat-pic rounded-circle">
                </div>
            </div>`;
            }
        });
        document.getElementById('messages').innerHTML = messageDisplay;
    document.getElementById('messages').scrollTo(0, document.getElementById('messages').scrollHeight);


    });

}



function chatList() {
    document.getElementById('contacts').classList.remove('d-none', 'd-md-block');
    document.getElementById('chatArea').classList.add('d-none');
}

function hideChatList() {
    document.getElementById('contacts').classList.add('d-none', 'd-md-block');
    document.getElementById('chatArea').classList.remove('d-none');
}

function sendMessage() {
    var chatMessage = {
        userId: currentUserKey,
        msg: document.getElementById('txtMessage').value,
        dateTime: new Date().toLocaleString()
    };

    firebase.database().ref('chatMessage').child(chatKey).push(chatMessage, function (error) {
        if (error) alert(error);
        else {
            //     var message = `<div class="row justify-content-end">
            //     <div class="col-7 col-sm-7 col-md-7">
            //         <p class="sent float-right" >
            //         ${document.getElementById('txtMessage').value}
            //         <span class="time">1:pm</span>
            //         </p>
            //     </div>
            //     <div class="col-2 col-sm-1 col-md-1">
            //         <img  src="${user_data.photoURL}" alt="" class="chat-pic rounded-circle">
            //     </div>
            // </div>`;
            //     console.log(message);
            //     document.getElementById('messages').innerHTML += message;
            document.getElementById('txtMessage').value = '';
            document.getElementById('txtMessage').focus();
            //  document.getElementById('messages').scrollTo(0, document.getElementById('messages').clientHeight);

        }
    });
}

function onKeyDown() {
    document.addEventListener('keydown', function (key) {
        if (key.which == 13) {
            sendMessage();
        }
    });
}




function signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);

}

function signout() {
    firebase.auth().signOut();
}

function onFirebaseStateChanged() {
    firebase.auth().onAuthStateChanged(onStateChanged);
}

var user_data;
function onStateChanged(user) {
    if (user) {
        user_data = user;
        var userProfile = { email: '', name: '', photoURL: '' };
        userProfile.email = user.email;
        userProfile.name = user.displayName;
        userProfile.photoURL = user.photoURL;

        var db = firebase.database().ref('users');
        var temp = false;
        db.on('value', function (users) {
            users.forEach(function (data) {
                var user = data.val();
                if (user.email === userProfile.email) {
                    temp = true;
                    currentUserKey = data.key;
                }
            });
            if (temp === false) {
                firebase.database().ref('users').push(userProfile, callback);
            }
            else {
                document.getElementById('profile').src = user.photoURL;
                document.getElementById('profile').title = user.displayName;
                document.getElementById('main').style = 'display:none';
                document.getElementById('chat').style = '';
            }
            loadChatlist();
        });
    }
    else {
        document.getElementById('profile').src = '/Images/User.png';
        document.getElementById('profile').title = '';

        document.getElementById('chat').style = 'display:none';
        document.getElementById('main').style = '';

    }
}
onFirebaseStateChanged();

function callback(error) {
    if (error) {
        alert(error);
    }
    else {
        document.getElementById('profile').src = user_data.photoURL;
        document.getElementById('profile').title = user_data.displayName;
        document.getElementById('main').style = 'display:none';
        document.getElementById('chat').style = '';
    }
}

function showFriendList() {
    document.getElementById('listFriend').innerHTML = `<div class="text-center">
                                                        <span class="spinner-border text-success mt-5" style="width:5rem ; height:5rem"></span>
                                                    </div>`;

    var db = firebase.database().ref('users');
    var list = '';
    db.on('value', function (users) {
        if (users.hasChildren()) {
            list = `<li class="list-group-item" style="background-color : rgb(235, 230, 230)">
                <input type="text" placeholder= "Search or New Chat" class="form-control search">
                </li>`;
        }

        users.forEach(function (data) {
            var user = data.val();
            if (user.email !== user_data.email) {
                list += `<li style="cursor : pointer" class="list-group-item list-group-item-action" data-dismiss="modal" onclick="startChat('${data.key}','${user.name}','${user.photoURL}')">
                        <div class="row">
                            <div class="col-md-2">
                                <img src="${user.photoURL}"  alt="" class="friend-pic rounded-circle"> 
                            </div>
                            <div class="col-md-10" style="cursor: pointer;">
                                <div class="name">${user.name}</div>
                            </div>
                        </div>
                    </li>`;
            }

        });
        document.getElementById('listFriend').innerHTML = list;
    });

}

function loadChatlist() {
    var db = firebase.database().ref('friendList');
    db.on('value', function (lists) {
        document.getElementById('listChat').innerHTML = ` <li class="list-group-item" style="background-color : rgb(235, 230, 230)">
        <input type="text" placeholder="Search or New Chat" class="form-control search">
     </li>
        `;
        lists.forEach(function (data) {
            var list = data.val();
            var friendKey = '';
            if (list.friendId === currentUserKey) {
                friendKey = list.userId;
            }
            else if (list.userId === currentUserKey) {
                friendKey = list.friendId;
            }

            if (friendKey !== "") {

                firebase.database().ref('users').child(friendKey).on('value', function (data) {
                    var user = data.val();
                    document.getElementById('listChat').innerHTML += `<li class="list-group-item list-group-item-action" onclick="startChat('${data.key}','${user.name}','${user.photoURL}')">
                <div class="row">
                    <div class="col-md-2">
                        <img src="${user.photoURL}" alt="" class="friend-pic rounded-circle">
                    </div>
                    <div class="col-md-10" style="cursor: pointer;">
                        <div class="name">${user.name}</div>
                        <div class="recentChat">Recent Chat</div>
                    </div>
                </div>
            </li>`;
                });
            }
        });
    });
}