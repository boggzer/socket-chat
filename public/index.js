const socket = io()

class Room {
    constructor(id, usersOnline, isOpen, password) {
        this.id = id;
        this.usersOnline = [usersOnline];
        this.isOpen = this.translateToBoolean(isOpen);
        this.password = password;
    }

    translateToBoolean(isOpen) {
        if (isOpen === 'open') {
            return true;
        } else {
            return false;
        }
    }
}

let roomChosen = "";

window.addEventListener('load', () => {
    setupEventListeners()

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
    createRoomForm.addEventListener('submit', onJoinCreatedRoom)

    // Socket io events
    socket.on('join successful', loadChatUI)
    socket.on('update chat', updateChat)
}

/**
 * Join existing room
 * @param {Event} event 
 */
function onJoinRoom(event) {
    event.preventDefault()

    const username = document.querySelector(".username-input").value
    const room = new Room(roomChosen, username, 'open');

    if (room == "" || room == null) {
        alert("Please choose a room")
    }
    else {
        
        socket.emit('join room', { username, room })
    }
}

/**
 * Sends message to server
 * @param {*} event 
 */
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

/**
 * Updates chat box in DOM with new message
 * @param {username} username message author
 * @param {message} message recieved message
 */
function updateChat({ username, message }) {
    const ul = document.getElementById("theMessageBoard")
    const li = document.createElement('li')
    li.innerText = `${username}: ${message}`
    ul.append(li)
}

/**
 * Renders create room form
 * @param {Event} event 
 */
function onCreateRoom(event) {
    event.preventDefault()
    document.querySelector('form.create-room').classList.remove('hidden')
    document.querySelectorAll('.join-existing-room, button.create-room').forEach(element => element.classList.add('hidden'))
}

/**
 * Toggle add/remove of the class 'hidden' to hide/display html-element
 * @param {HTMLElement} htmlElement 
 */
function toggleDisplay(htmlElement) {
    if (htmlElement.classList.contains('hidden')) {
        htmlElement.classList.remove('hidden')
    } else {
        htmlElement.classList.add('hidden')
    }
}

/**
 * Join new created room
 * @param {Event} event 
 */
function onJoinCreatedRoom(event) {
    event.preventDefault()
    
    const username = document.querySelector(".username-input").value
    const roomName = document.querySelector('.room-name-input').value
    
    const passwordCheck = document.querySelector('.add-password').checked
    const passwordField = document.querySelector('.password-field')

    let room;

    // If locked is checked and event is submit
    if (passwordCheck && event.type !== 'change') {
        room = new Room(roomName, username, 'locked')
        socket.emit('join room', { username, room })
    } else if (event.type == 'change') {
        toggleDisplay(passwordField)
        return;
    } else {
        // Default room
        room = new Room(roomName, username, 'open')
        socket.emit('join room', { username, room })
    }
}

function loadChatUI() {
    document.querySelector(".chat.ui").classList.remove("hidden")
    document.querySelector(".join.ui").classList.add("hidden")
}