const socket = io()

class Room {
    constructor(id, usersOnline, isOpen) {
        this.id = id;
        this.usersOnline = [usersOnline];
        this.isOpen = isOpen;
    }
}

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
    const joinForm = document.querySelector('form.join-existing-room')
    joinForm.addEventListener('submit', onJoinRoom)

    // Send message when enter is pressed in input field
    const messageInput = document.querySelector('input.message-input')
    messageInput.addEventListener('keyup', onSendMessage)

    // Send message when send button is clicked or enter is pressed when button in focus
    const sendMessageButton = document.querySelector('button.message-input')
    sendMessageButton.addEventListener('click', onSendMessage)
    sendMessageButton.addEventListener('keyup', onSendMessage)

    // Show create room form when create room button on front page is clicked
    const createRoom = document.querySelector('button.create-room')
    createRoom.addEventListener('click', onCreateRoom)

    // Create and add room when create room form is submitted
    const createRoomForm = document.querySelector('.join-room>.create-room')
    createRoomForm.addEventListener('submit', onJoinNewRoom)

    // Socket io events
    socket.on('join successful', loadChatUI)
    socket.on('update chat', updateChat)
}

function onJoinRoom(event) {
    event.preventDefault()

    const username = document.querySelector(".username-input").value
    const room = roomChosen;

    if (room == "" || room == null) {
        alert("Please choose a room")
    }
    else {
        socket.emit('join room', { username, room })
    }

}

function onSendMessage(event) {
    event.preventDefault()
    const messageInput = document.querySelector('input.message-input')
    const message = messageInput.value
    if (event.type === 'keyup' && event.keyCode === 13 || event.type === 'click') {
        if (message === "") {
            return;
            // TODO: add error message if message is empty
        } else {
            socket.emit('message', message)
            messageInput.value = ''
        }
    }
}

function createLockedRoom() {
    
}

function updateChat({ username, message }) {
    const ul = document.getElementById("theMessageBoard")
    const li = document.createElement('li')
    li.innerText = `${username}: ${message}`
    ul.append(li)
}

function onCreateRoom(event) {
    event.preventDefault()
    document.querySelector('form.create-room').classList.remove('hidden')
    document.querySelectorAll('.join-existing-room, button.create-room').forEach(element => element.classList.add('hidden'))
}

function onJoinNewRoom(event) {
    event.preventDefault()
    const username = document.querySelector(".username-input").value
    const roomName = document.querySelector('.room-name-input').value
    const room = new Room(roomName, username)

    socket.emit('join room', { username, room })

}

function loadChatUI(data) {
    document.querySelector(".chat.ui").classList.remove("hidden")
    document.querySelector(".join.ui").classList.add("hidden")
}

const onMessageReceived = ({ username, message }) => {
    console.log("onmessagerecieved", "name:", username, "msg:", message)

}