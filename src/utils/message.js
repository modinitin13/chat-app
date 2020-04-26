const getMessage=(username='Admin',text)=>{
    return {
        username,
        text,
        createdAt:new Date().getTime()
    }
}

const getLocationMessage=(username,url)=>{
    return{
        username,
        url,
        createdAt:new Date().getTime()
    }
}
module.exports={
    getMessage,
    getLocationMessage
}