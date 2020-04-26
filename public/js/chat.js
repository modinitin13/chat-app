const socket=io();

//Templates
const messageTemplate=document.querySelector('#message-template').innerHTML;
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML;

//Options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true});

const $messages=document.querySelector('#messages');

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild
    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    // Visible height
    const visibleHeight = $messages.offsetHeight
    // Height of messages container
    const containerHeight = $messages.scrollHeight
    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html;    
})

socket.on('message',(message)=>{
    console.log(message.text);
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm A')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('locationMessage',(message)=>{
    console.log(message);
    const html=Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm A')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})
    

const $messageInput=document.querySelector('#message-form');
const $messageInputForm=$messageInput.querySelector('input');
const $messageInputButton=$messageInput.querySelector('button');
const $locationInputButton=document.querySelector('#send-location');



$messageInput.addEventListener('submit',(e)=>{
    e.preventDefault();
    $messageInputButton.setAttribute('disabled','disabled');
    const message = e.target.elements.message.value;
    socket.emit('sendMessage',message,(error)=>{
        $messageInputButton.removeAttribute('disabled');
        $messageInputForm.value='';
        $messageInputForm.focus();
        if(error){
            return console.log(error);
        }
        console.log('Delivered');
    });
})

$locationInputButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser');
    }
    $locationInputButton.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $locationInputButton.removeAttribute('disabled');
            console.log('Location Shared');
        });
    })
})


socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error);
        location.href='/';
    }
});