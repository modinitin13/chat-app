const path=require('path');
const http=require('http');
const express=require('express');
const socketio=require('socket.io');
const Filter=require('bad-words');
const {getMessage,getLocationMessage}=require('./utils/message.js');
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/user');


const app=express();
const server=http.createServer(app);
//socketio expects the raw http server so passing the raw server in it,where as express do automatically inside it so we do not get raw server so thats why changed this config 
const io=socketio(server);

const port=process.env.PORT||3000;
const publicDirectoryPath=path.join(__dirname,'../public');

app.use(express.static(publicDirectoryPath));


io.on('connection',(socket)=>{
    console.log('New Websocket connection');
    
    socket.on('join',(options,callback)=>{
        const {error,user}=addUser({id:socket.id,...options});
        if(error){
            return callback(error);
        }
        socket.join(user.room);
        const users=getUsersInRoom(user.room);
        io.to(user.room).emit('roomData',{room:user.room,users});
        socket.emit('message',getMessage('Admin','Welcome!'));
        socket.broadcast.to(user.room).emit('message',getMessage('Admin',`${user.username} has joined the room`));
        callback();
    })

    socket.on('sendMessage',(message,callback)=>{
        const filter=new Filter();
        if(filter.isProfane(message))
            return callback('The message contains profane language');
        const {user}=getUser(socket.id);
        io.to(user.room).emit('message',getMessage(user.username,message));
        callback();
    })
    
    socket.on('sendLocation',(coords,callback)=>{
        const {user}=getUser(socket.id);
        io.to(user.room).emit('locationMessage',getLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    })

    socket.on('disconnect',()=>{
        const {user}=removeUser(socket.id);
        if(user){
            const users=getUsersInRoom(user.room);
            io.to(user.room).emit('roomData',{room:user.room,users});
            io.to(user.room).emit('message',getMessage('Admin',`${user.username} has left the room`));
        }
    })
})

server.listen(port,()=>{
    console.log('Serving at port 3000');
})