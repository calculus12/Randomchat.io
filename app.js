var express = require('express');
app = express();
var server = require('http').createServer(app);
// upgrade http server to socket.io server.
var io = require('socket.io')(server);


let PORT = process.env.PORT || 3000;
app.use(express.static('static'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
    
});

var numUser = 0;

io.on('connection', function(socket) {
    // 클라이언트와 연결되면
    var clientIP = socket.request.connection.remoteAddress;
    socket.on('login', function(data) {
        numUser++;
        console.log(data.name + '님이 입장하셨습니다.\n' +
        'Client IP'+ ' : ' + clientIP);
        socket.name = data.name;
        io.emit('login', {name: data.name, numUser: numUser});
    });

    // 클라이언트로부터 메세지를 받으면
    socket.on('chat', function(data) {
        if (data.msg.length > 100) {
        data.msg = data.msg.slice(0,100);
        }
        console.log('Message from %s : %s', socket.name, data.msg);
        
        var msg = {
            from : {
                name : socket.name,
                address : clientIP
            },
            msg : data.msg
        };

        socket.broadcast.emit('chat', msg);
    });

    // 클라이언트로부터 이미지를 받으면
    socket.on('imgChat', function(data) {
        console.log('Image received from %s', socket.name);

        var msg = {
            from : {
                name : socket.name,
                address : clientIP
            },
            img : data
        };

        socket.broadcast.emit('imgChat', msg);
    })

    socket.on('forceDisconnect', function() {
        numUser--;
        socket.disconnect();
    });

    socket.on('disconnect', function() {
        numUser--;
        console.log('user disconnect: ' + socket.name);
        socket.broadcast.emit('disconnectUser', {name: socket.name, numUser: numUser});
    });
})

server.listen(PORT, function() {
    console.log('Socket IO server listening on port 3000');
})