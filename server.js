// 1.モジュールオブジェクトの初期化
var fs = require("fs");var http = require("http");
var server = http.createServer(function(req,res) {
    res.writeHead(200, {"Content-Type":"text/html"});
    var output = fs.readFileSync("./index2.html", "utf-8");
    res.write(output);
    output = fs.readFileSync("./index.html", "utf-8");
    res.end(output);
});

var express = require('express');
var app = express();
//var server = require('http').Server(app);
var io = require('socket.io')(server);

// index.htmlから読み込まれている静的ファイルを送れるようにしておく
app.use(express.static(__dirname));

/* GETされたらindex.htmlを送信する
app.get('/', function(req, res){
  res.sendfile('index.html');
});*/

//var io = require('socket.io')(server);
 
var postArray = [];
var serverId = 0;
var serverName = "SERVER";
// クライアント接続時

var idstore = {};
function is(type, obj) {
    var clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
}

    
var chat = io.on('connection', function(socket) {
    console.log("client connected!!")
 

    // クライアント切断時
    socket.on('disconnect', function() {
        console.log("client disconnected!!")
         if (idstore[socket.id]) {
            var msg = idstore[socket.id]['name'] + "さんが退出";
            var obj = {};
            obj['id'] = serverId;
            obj['text'] = msg
            obj['name'] = serverName;
            console.log(obj["id"] + " : " + obj["text"] + " : " + obj["name"]);
            
            chat.to(idstore[socket.id]['roomid']).emit("Message", JSON.stringify(obj));
            delete idstore[socket.id];
            
        }
    });
 
    // クライアント投稿時
    socket.on("post", function(obj){
        //postArray.push(obj);
        // クライアントに最新のデータを送る
        if(typeof obj["id"] === 'undefined')
            obj = JSON.parse(obj);
        
        console.log("post event :  " + obj["id"] + " : " + obj["text"] + " : " + obj["room"])
        console.log(JSON.stringify(obj));
        console.log(obj["text"]);
        chat.to(obj['room']).emit("Message", JSON.stringify(obj));
        //io.emit("addedPost", JSON.stringify(obj));
        //console.log("push")
    });

    socket.on('join', function(req) {
        
        if(typeof req['name'] === 'undefined')
            req = JSON.parse(req);
        console.log("join event  : " + req)
        var obj = {};
        obj['id'] = serverId;
        obj['text'] = String(req['name']) + " さんが入室";
        obj['name'] = serverName;
        console.log(obj["id"] + " : " + obj["text"] + " : " + obj["name"]);
        chat.to(req['room']).emit('joinMessage', JSON.stringify(obj));
        socket.join(req['room'],function(){
            console.log("join emit");
        
        });
        // JOIN時に格納
        idstore[socket.id] = {'roomid' : req['room'] , 'name':req['name'] };
        console.log(idstore);
        // ※4 クライアントを部屋に入室させるsocket.join(req['room']);
        
    });
});
 
var port = 8080;
server.listen(port, function() {
  console.log('Server Running.');
});