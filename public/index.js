const socket = io()
let roomChosen = "";
let allRooms;

// Fetch current list of rooms from server
const fetchRooms = () => fetch("http://localhost:3000/rooms").then((response) => {
    return response.json()
}).then((rooms) => {
    renderRoomsList(rooms)

})


class Room {
    constructor(id, isOpen, password) {
        this.id = id;
        this.usersOnline = 0;
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

window.addEventListener('load', () => {
    setupEventListeners()
    fetchRooms()
})

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
            roomLocked = "open"
        }
    }
    for (let y = 0; y < lockedRoomTable.length; y++) {
        if (lockedRoomTable[y].innerHTML == roomChosen) {
            roomLocked = "closed"
        }
    }

    const username = document.querySelector(".username-input").value
    const room = new Room(roomChosen, roomLocked);

    // If no room has been chosen/clicked on
    if (room.id == "" || room.id == null) {
        alert("Please choose a room")
    }
    else {
        // If username input is filled in
        if (username !== '') {
            // Join room if open
            if (room.isOpen === true) {
                socket.emit('join room', { username, room })
            } else {
                // Show password input field
                const passwordInput = document.querySelector('.type-password-locked-room')
                const password = passwordInput.value
                const room = new Room(roomChosen, roomLocked, password);
                socket.emit('verify locked room', { username, room })
            }
        } else { alert('Please enter a username') }
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
        // If input fields are not empty
        if (username !== '' && roomName !== '') {
            room = new Room(roomName, 'locked', password)
            // Verify locked room (if exists or not)
            socket.emit('verify locked room', { username, room })
        } else { alert(`Looks like you forgot to enter your ${roomName === '' ? 'room name.' : 'username.'}`) }
    } else if (event.type == 'change') {
        // Toggles display of password field when checkbox is checked/unchecked
        toggleDisplay(passwordField)
        return;
    } else {
        // For default (open) rooms
        // If input fields are not empty
        if (username !== '' && roomName !== '') {
            room = new Room(roomName, 'open')
            socket.emit('join room', { username, room })
        } else { alert(`Looks like you forgot to enter your ${roomName === '' ? 'room name.' : 'username.'}`) }
    }
}

/** Sends message to server */
function onSendMessage() {
    event.preventDefault()
    const messageInput = document.querySelector('input.message-input')
    let message = messageInput.value

    // On enter keyup or click event
    if (event.type === 'keyup' && event.keyCode === 13 || event.type === 'click') {
        // Prevent empty messages
        if (message === "") {
            return;
        } else {
            socket.emit('message', message)
            messageInput.value = ''
        }
    }
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
 * HELPER FUNCTIONS
 */

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
 * Checks whether room already exists or not from room input field
 * Communicates with server via socket
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

/* 
 * RENDER FUNCTIONS 
 */

/**
 * Updates chat box in DOM with new message
 * @param {username} username message author
 * @param {message} message recieved message
 */
function renderMessage({ username, message }) {
    const ul = document.getElementById("theMessageBoard")
    const li = document.createElement('li')
    li.innerHTML = '<span class="user">' + username + ':</span> <span class="user-message">' + message + '</span>'
    ul.append(li)
}

/**
 * Renders chat room view
 * @param {object} socket 
 */
function renderChat(socket) {
    document.querySelector('input[type="checkbox"]').checked = false
    let ul = document.getElementById("theMessageBoard")
    ul.innerHTML = ''
    document.querySelectorAll('.join, form.create-room, .join.ui, .join-room').forEach(element => element.classList.add('hidden'))
    document.querySelector(".chat.ui").classList.remove("hidden")
    document.querySelector('.chat>span>h3').innerHTML = socket
}

/** Renders menu view/first page */
function renderMenu() {
    if (document.querySelector('.chat').classList.contains('hidden') === false) {
        location.reload()
    }

    document.querySelectorAll('.room-name-input, .type-password-locked-room, .type-password').forEach(element => element.value = '')
    document.querySelector('input[type="checkbox"]').checked = false
    document.querySelector('h2').innerHTML = 'Hi there!<br /><span>Welcome to Socket Chat</span>'
    document.querySelectorAll('.join-room, button.create-room, .join-existing-room, .join.ui, .join').forEach(element => element.classList.remove('hidden'))
    document.querySelectorAll('form.create-room, .chat.ui, .password-field, .password-field-locked-room').forEach(element => element.classList.add('hidden'))
    fetchRooms()
    document.querySelector('.chat>span>h3').innerHTML = ''

}

/**
 * Renders existing rooms in list on front page view
 * @param {Room[]} rooms 
 */
function renderRoomsList(rooms) {
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
        // Add event listener to rooms
        addClickToRooms()
    })
}

/**
 * Turns errors to alerts
 * @param {string} errorType 
 */
function onError(errorType) {
    alert(errorType)
}

/** Add event listener to main DOM elements */
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
        button.addEventListener('click', renderMenu)
    })

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

    const passwordCheck = document.querySelector('.add-password')
    passwordCheck.addEventListener('change', onJoinCreatedRoom)

    // Socket io events
    socket.on('join successful', renderChat)
    socket.on('update chat', renderMessage)
    socket.on('on error', onError)
    socket.on('update list', fetchRooms)
}

/** Add click event listener to rooms in list */
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