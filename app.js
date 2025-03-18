const express = require('express');
const app = express();
const path = require('path');
const pubDir = path.join(__dirname, "/public");

const socketio = require('socket.io');
const http = require('http');

var server = http.createServer(app);
var io = socketio(server);

app.use(express.static(pubDir));
app.use(express.json());
app.set("view engine", "ejs");

const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: "mysql-2995aa4e-unarvai.h.aivencloud.com",
    port:"19419",
    user: "avnadmin",
    password: "AVNS_zxUi3ZpdIaOazlxLtS8",
    database: "comment"
});

connection.connect((err) => {
    if (err) {
        console.log('An error occured', err);

    } else {
        console.log('db connected');

    }
})

io.on("connection", (socket) => {
    console.log('socket connected');
    connection.query("select count(*) as length from comments", (err, data) => {

        if (err) {
            console.log('An error occured', err);
        } else {
            if (data[0].length > 0) {
                connection.query(" select * from comments order by cast(SUBSTRING(comment_id, 8) as unsigned)", (err, data) => {

                    if (err) {
                        console.log('An error occured', err);
                    } else {
                        console.log('wait');

                        data.forEach((commentObj) => {
                        socket.emit('msgAdd', commentObj.comment_content, commentObj.replied_to, commentObj.user_id, commentObj.comment_id, commentObj.likes_count, commentObj.time_of_comment)
                        })
                    }
                });
            }
        }
    });



    socket.on("upVote", (id) => {
        io.emit("increaseVote", id);
        var oldCount;
        var crtId = id.split('mes')[1];
        connection.query("select likes_count from comments where comment_id = 'comment" + crtId + "'", (err, data) => {
            if (err) {
                console.log('An error occured', err);
            } else {
                oldCount = data[0].likes_count;
                connection.query("update comments set likes_count = " + ((+oldCount) + 1) + " where comment_id= 'comment" + crtId + "'", (err, data) => {
                    if (err) {
                        console.log('An error occured', err);
                    } else {
                        console.log('increased');
                    }
                });
            }
        });

    })

    socket.on("downVote", (id) => {
        io.emit("decreaseVote", id);
        var oldCount;
        var crtId = id.split('mes')[1];
        connection.query("select likes_count from comments where comment_id = 'comment" + crtId + "'", (err, data) => {
            if (err) {
                console.log('An error occured', err);
            } else {
                oldCount = data[0].likes_count;
                connection.query("update comments set likes_count = " + ((+oldCount) - 1) + " where comment_id= 'comment" + crtId + "'", (err, data) => {
                    if (err) {
                        console.log('An error occured', err);
                    } else {
                        console.log('decreased');
                    }
                });
            }
        });
    })

    socket.on('addReplyBox', (id) => {
        socket.emit('addASendReplyOption', id)
    });

    socket.on('addMessage', (msg, boxId, usrName, commentId, likesCount, date) => {

        io.emit('msgAdd', msg, boxId, usrName, commentId, likesCount, date);
        connection.query('insert into comments values(?,?,?,?,?,?)', [commentId, msg.trim(), usrName, 0, new Date().toISOString().split('T')[0].split('-').join("/"), boxId], (err, data) => {
            if (err) {
                console.log('An error occured', err);
            } else {
                console.log('Account successfully added to db');
            }
        });

    });

    socket.on('removeEle', (commentId) => {
        io.emit('deleteEle', commentId);
        console.log(commentId);

        connection.query("delete from comments where comment_id= ?", [commentId], (err, data) => {
            if (err) {
                console.log('An error occured', err);
            } else {
                console.log('decreased');
            }
        });
    });

    socket.on('editEle', (commentId, msg) => {
        io.emit('editElement', commentId, msg);
        connection.query("update comments set comment_content = '" + msg.trim() + "' where comment_id= '" + commentId + "'", (err, data) => {
            if (err) {
                console.log('An error occured', err);
            } else {
                console.log('deleted');
            }
        });

    });

});


app.get('/', (req, res) => {
    res.render('orginal')
})

server.listen('3006', () => {
    console.log('Port 3006 connected');
})