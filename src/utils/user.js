const users=[]

// addUser,removeUser,getUser,getUsersInRoom

const addUser=({id,username,room})=>{
    username=username.trim().toLowerCase();
    room=room.trim().toLowerCase();
    if(!username || !room){
        return {error:'The username and id are required fields'};
    }
    const existinguser=users.find((user)=>{
        return user.username===username && user.room===room;
    })
    if(existinguser){
        return {error:'Username already taken'};
    }
    const user={
        id,
        username,
        room
    };
    users.push(user);
    return {user};
}


const removeUser=(id)=>{
    const index=users.findIndex((user)=>user.id===id);
    if(index==-1){
        return {error:'User not found'};
    }
    const user=users.splice(index,1)[0];
    return {user};
}


const getUser=(id)=>{
    const user=users.find((user)=>user.id===id);
    if(!user){
        return {error:'User not found'};
    }
    return {user};
}

const getUsersInRoom=(room)=>{
    return users.filter((user)=>user.room===room);
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}