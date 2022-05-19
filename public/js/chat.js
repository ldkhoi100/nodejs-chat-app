const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

/*$('#messages').on('scroll', function () {
    if ($('#messages').scrollTop() + $('#messages').innerHeight() >= $('#messages')[0].scrollHeight) {

    }
})*/

socket.on('message', (message, myself = false) => {
    const messageTemplate = $("#message-template").html()
    let scrollUser = false
    Mustache.parse(messageTemplate)

    const data_message = {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm:ss A'),
        detailTime: moment(message.createdAt).format('YYYY-MM-DD hh:mm:ss A'),
        yourself: myself
    }

    const html = Mustache.render(messageTemplate, data_message)
    if ($('#messages').scrollTop() + $('#messages').innerHeight() >= $('#messages')[0].scrollHeight) scrollUser = true

    $("#messages").append(html)

    if (scrollUser || myself) scrollToBottom("messages")
})

socket.on('roomData', ({room, users}) => {
    const sidebarTemplate = $("#sidebar-template").html()
    Mustache.parse(sidebarTemplate)

    const html = Mustache.render(sidebarTemplate, {
        room, users
    })
    $("#chat__sidebar").html(html)
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = $("#position").val()
    socket.emit('sendMessage', message, (err) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ""
        $messageFormInput.focus()

        if (err) alert(err)
    })
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = 'http://localhost:3000/'
    }
})

const scrollToBottom = (id) => {
    const element = document.getElementById(id);
    element.scrollTop = element.scrollHeight;
}
