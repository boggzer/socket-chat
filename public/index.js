// Rerenders lists of existing rooms every second in case it has changed

    fetch("http://localhost:3000/rooms").then((response) => {
        return response.json()
    }).then((rooms) => {
        printRooms(rooms)
    })

const socket = io()
class Room {
    constructor(id, usersOnline, isOpen, password) {
        this.id = id;
        this.usersOnline = 0;
        this.isOpen = this.translateToBoolean(isOpen);
        this.password = password;
    }

    translateToBoolean(isOpen) {
        if (isOpen === 'open' || isOpen === 'true' || isOpen === true || isOpen === 'unlocked') {
            return true;
        } else {
            return false;
        }
    }
}

let roomChosen = "";

window.addEventListener('load', () => {
    setupEventListeners()

})


function addClickToRooms() {
    let unlockedRoomTable = document.getElementsByClassName("allRoomsUnlocked");
    let lockedRoomTable = document.getElementsByClassName("allRoomsLocked");
    const passwordField = document.querySelector('.password-field-locked-room')

    for (let i = 0; i < unlockedRoomTable.length; i++) {
        unlockedRoomTable[i].addEventListener("click", () => {

            passwordField.classList.add('hidden')

            for (let y = 0; y < unlockedRoomTable.length; y++) {
                unlockedRoomTable[y].style.border = "none"
            }
            for (let o = 0; o < lockedRoomTable.length; o++) {
                lockedRoomTable[o].style.border = "none"
            }

            roomChosen = unlockedRoomTable[i].innerHTML;
            unlockedRoomTable[i].style.border = "2px solid red"

        })
    }

    for (let i = 0; i < lockedRoomTable.length; i++) {
        lockedRoomTable[i].addEventListener("click", () => {

            passwordField.classList.remove('hidden')

            for (let y = 0; y < lockedRoomTable.length; y++) {
                lockedRoomTable[y].style.border = "none"
            }
            for (let o = 0; o < unlockedRoomTable.length; o++) {
                unlockedRoomTable[o].style.border = "none"
            }

            roomChosen = lockedRoomTable[i].innerHTML;
            lockedRoomTable[i].style.border = "2px solid red"

        })
    }


}

function setupEventListeners() {
    // Join submit handler
    const joinForm = document.querySelector('form.join-existing-room')
    joinForm.addEventListener('submit', onJoinRoom)

    // Handles checking if room exists on input
    const roomInput = document.querySelector('.room-name-input')
    roomInput.addEventListener('input', checkIfRoomExists)
    roomInput.addEventListener('blur', checkIfRoomExists)

    // Back to menu buttons
    const backToMenuButton = document.querySelectorAll('button.back, .back-img')
    backToMenuButton.forEach((button) => {
        button.addEventListener('click', loadMenu)
    })

    // Send message when enter is pressed in input field
    const messageInput = document.querySelector('input.message-input')
    messageInput.addEventListener('keyup', onSendMessage)
    // messageInput.addEventListener('keypress', onIsTyping)

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

    const passwordCheck = document.querySelector('.add-password')
    passwordCheck.addEventListener('change', onJoinCreatedRoom)

    // Socket io events
    socket.on('join successful', loadChatUI)
    socket.on('update chat', updateChat)
    socket.on('on error', onError)
}

/**
 * Join existing room
 * @param {Event} event 
 */
function onJoinRoom(event) {
    event.preventDefault()

    let unlockedRoomTable = document.getElementsByClassName("allRoomsUnlocked");
    let lockedRoomTable = document.getElementsByClassName("allRoomsLocked");
    let roomLocked = "false";

    for (let i = 0; i < unlockedRoomTable.length; i++) {
        if (unlockedRoomTable[i].innerHTML == roomChosen) {
            console.log("open")
            roomLocked = "open"
        }
    }
    for (let y = 0; y < lockedRoomTable.length; y++) {
        if (lockedRoomTable[y].innerHTML == roomChosen) {
            console.log("closed")
            roomLocked = "closed"
        }
    }

    const username = document.querySelector(".username-input").value
    const room = new Room(roomChosen, username, roomLocked);

    if (room.id == "" || room.id == null) {
        alert("Please choose a room")
    }
    else {
        if (username !== '') {
            if (room.isOpen === true) {
                socket.emit('join room', { username, room })
            } else {
                const passwordInput = document.querySelector('.type-password-locked-room')
                const password = passwordInput.value
                const room = new Room(roomChosen, username, roomLocked, password);
                socket.emit('verify locked room', { username, room })
            }
        } else { alert('Please enter a username') }
    }
}

function printRooms(rooms) {


    let unlockedRoomTable = document.querySelector(".unlockedRoomTable")
    let lockedRoomTable = document.querySelector(".lockedRoomTable")
    unlockedRoomTable.innerHTML = '<tr class="roomTag"><th>Unlocked Rooms</th></tr>'
    lockedRoomTable.innerHTML = '<tr class="roomTag"><th>Locked Rooms</th></tr>'

    rooms.forEach(rooms => {
        if (rooms.isOpen) {
            let roomBox = document.createElement("th")
            let room = document.createElement("th")
            room.innerText = rooms.id
            room.className = "allRoomsUnlocked"

            roomBox.appendChild(room)
            unlockedRoomTable.appendChild(roomBox)
        }
        else {
            let roomBox = document.createElement("th")
            let room = document.createElement("th")
            room.innerText = rooms.id
            room.className = "allRoomsLocked"

            roomBox.appendChild(room)
            lockedRoomTable.appendChild(roomBox)
        }

        addClickToRooms()

    })
}

function onIsTyping(event) {
    let isTyping = false
    let typingTimeout = () => { isTyping = false; console.log('not typing timeout') }
    let timeout;

    const message = `is typing...`

    if (isTyping === false || event.keyCode !== 13) {
        isTyping = true
        socket.emit('is typing', { message, isTyping })
        timeout = setTimeout(typingTimeout, 3000);
        console.log('typing')
    } else {
        clearTimeout(timeout);
        timeout = setTimeout(typingTimeout, 3000);
        console.log('not typing')
    }
}

/**
 * Sends message to server
 * @param {Event} event 
 */
function onSendMessage() {
    event.preventDefault()
    const messageInput = document.querySelector('input.message-input')
    let message = messageInput.value

    if (event.type === 'keyup' && event.keyCode === 13 || event.type === 'click') {
        if (message === "") {
            return;
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
    li.innerHTML = '<span class="user">' + username + ':</span> <span class="user-message">' + message + '</span>'
    ul.append(li)
}


/**
 * Renders create room form
 * @param {Event} event 
 */
function onCreateRoom(event) {
    event.preventDefault()
    document.querySelector('h2').innerHTML = 'Create chat room'
    document.querySelector('form.create-room').classList.remove('hidden')
    document.querySelectorAll('.join-existing-room, button.create-room')
        .forEach(element => element.classList.add('hidden'))
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
        const passwordInput = document.querySelector('.type-password')
        const password = passwordInput.value
        if (username !== '' && roomName !== '') {
            room = new Room(roomName, username, 'locked', password)
            // Verify locked room (if exists or not)
            socket.emit('verify locked room', { username, room })
        } else { alert(`Looks like you forgot to enter your ${roomName === '' ? 'room name.' : 'username.'}`) }
    } else if (event.type == 'change') {
        toggleDisplay(passwordField)
        return;
    } else {
        // Default (open) room
        if (username !== '' && roomName !== '') {
            room = new Room(roomName, username, 'open')
            socket.emit('join room', { username, room })
            console.log(room)
        } else { alert(`Looks like you forgot to enter your ${roomName === '' ? 'room name.' : 'username.'}`) }

    }
}

function loadChatUI(socket) {
    let ul = document.getElementById("theMessageBoard")
    ul.innerHTML = ''
    const li = document.createElement('li')
    li.classList.add('typing', 'hidden')
    ul.append(li)
    document.querySelectorAll('.join, form.create-room, .join.ui, .join-room').forEach(element => element.classList.add('hidden'))
    document.querySelector(".chat.ui").classList.remove("hidden")
    document.querySelector('.chat>span>h3').innerHTML = socket
}

function loadMenu() {
    if (document.querySelector('.chat').classList.contains('hidden') === false) {
        socket.emit('leave room', socket.username)
    }
    document.querySelector('.add-password').checked = false
    document.querySelectorAll('.room-name-input, .type-password-locked-room, .type-password').forEach(element => element.value = '')
    document.querySelector('h2').innerHTML = 'Hi there!<br /><span>Welcome to Socket Chat</span>'
    document.querySelectorAll('.join-room, button.create-room, .join-existing-room, .join.ui, .join').forEach(element => element.classList.remove('hidden'))
    document.querySelectorAll('form.create-room, .chat.ui, .password-field, .password-field-locked-room').forEach(element => element.classList.add('hidden'))
    document.querySelector('.chat>span>h3').innerHTML = ''
}

/*
* TODO: Fixa denna!
* Handles and sends error messages
* @param {string} errorType
*/
function onError(errorType) {
    switch (errorType) {
        case 'WRONG_PASSWORD':
            alert(errorType)
            // TODO: lägg till error-meddelande som visas vid fel angivet lösenord
            break;
        case 'SHORT_PASSWORD':
            alert(errorType)
            // TODO: lägg till error-meddelande som visas
            break;
        case 'ROOM_EXISTS':
            alert(errorType)
            // TODO: lägg till error-meddelande som visas
            break;
        default:
            break;
    }
}

/**
 * Checks whether room already exists or not from room input field
 * @param {Event} event 
 */
function checkIfRoomExists(event) {
    let found = ''
    const errorMessage = document.querySelector('span.error-message')
    socket.emit('check if exists', event.target.value, (data) => {
        found = data;
        if (found === true) {
            errorMessage.classList.replace('hidden', 'fadeAnimation')
            errorMessage.innerHTML = `The room "${event.target.value}" already exists. Please choose another room name.
            (Unless you'd like to join the room...)`
            event.target.classList.add('found')
        } else {
            errorMessage.classList.replace('fadeAnimation', 'hidden')
            errorMessage.innerHTML = ''
            event.target.classList.remove('found')
        }
    })
}
