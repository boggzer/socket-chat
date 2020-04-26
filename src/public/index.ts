import { Socket } from "socket.io";
// import * as io from ;
// @ts-ignore: This expression is not callable. Type 'Server' has no call signatures.
const socket = io();

function setupEventListeners() {
    // Join submit handler
    const joinForm = document.querySelector('form.join.ui')
    joinForm?.addEventListener('submit', onJoinRoom)
    
    // Send message submit hander
    const messageForm = document.querySelector('.chat.ui form')
    messageForm?.addEventListener('submit', onSendMessage)

    // Socket io events
    socket.on('join successful', loadChatUI)
    socket.on('message', onMessageReceived) 
}

function onJoinRoom(event: any) {
    event.preventDefault()
    const inputs = document.getElementsByTagName('.join.ui input')
    const nameInput = inputs[0];
    const roomInput = inputs[1];

    const name = nameInput.nodeValue
    const room = roomInput.nodeValue

    socket.emit('join room', { name, room })
}

function onSendMessage(event: any) {
    event.preventDefault()
    const input = document.querySelector('.chat.ui form input')
    socket.emit('message', input?.nodeValue)
    if (input !== null) {
        input.nodeValue = ""
    }
}

function loadChatUI(data: any) {
    console.log(data)
    document.querySelector('.join.ui')?.classList.add('hidden')
    document.querySelector('.chat.ui')?.classList.remove('hidden')
}

function onMessageReceived({ name, message }: any) {
    const ul = document.querySelector('ul')
    const li = document.createElement('li')
    li.innerText = `${name}: ${message}`
    ul?.append(li)
}
window.addEventListener('load', () => {
    setupEventListeners()
})

console.log('Hello from index.ts')
