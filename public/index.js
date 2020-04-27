const socket = io()

window.addEventListener('load', () => {
    setupEventListeners()
    roomChosen = "";

    let roomChoice = document.getElementsByClassName("roomChoice");
    for (let i = 0; i < roomChoice.length; i++) {
       roomChoice[i].addEventListener("click", () => {

        for (let y = 0; y < roomChoice.length; y++) {
            roomChoice[y].style.backgroundColor = "rgb(55, 209, 183)"
        }

        roomChosen = roomChoice[i].innerHTML;
        roomChoice[i].style.backgroundColor = "red"

       })
    }

})

function setupEventListeners() {
    // Join submit handler
    const joinForm = document.querySelector('form.join.ui')
    joinForm.addEventListener('submit', onJoinRoom)
    
    // Send message submit hander
    const messageForm = document.querySelector('.chat.ui form')
    messageForm.addEventListener('submit', onSendMessage)

    // Socket io events
    socket.on('join successful', loadChatUI)
    socket.on('message', onMessageReceived) 
}

function onJoinRoom(event) {
    event.preventDefault()

    const nameInput = document.querySelector(".join.ui input");
    
    const name = nameInput.value
    const room = roomChosen;

    if(room == "" || room == null) {
        alert("Please choose a room")
    }
    else {
        socket.emit('join room', { name, room })
    }

}

function onSendMessage(event) {
    event.preventDefault()
    const input = document.querySelector('.chat.ui form input')
    socket.emit("message", input.value)
    input.value = ""
}


function loadChatUI(data) {
    console.log(data)
    document.querySelector(".chat.ui").classList.remove("hidden")
    document.querySelector(".join.ui").classList.add("hidden")
}

function onMessageReceived({ name, message }) {
    const ul = document.getElementById("theMessageBoard")
    const li = document.createElement('li')

    li.innerText = `${name}: ${message}`
    ul.append(li)
}