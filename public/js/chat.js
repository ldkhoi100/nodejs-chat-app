const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

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
    autoscroll()
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
        isUsersTyping = false

        if (err) alert(err)
    })
})

// Người dùng đang gõ
let isUsersTyping = false
$('#position').on('input', function () {
    const input = $(this).val()

    if (input.length > 0 && !isUsersTyping) {
        isUsersTyping = true
        socket.emit('addUsersTyping')
    } else if (input.length < 1) {
        isUsersTyping = false
        socket.emit('removeUsersTyping')
    }
})

socket.on('listUsersTyping', (listUsersTyping) => {
    const data = dataUsersTyping(listUsersTyping)
    if (!data) $(".message_typing").html("No typing").css('visibility', 'hidden')
    else $(".message_typing").html(data).css('visibility', 'visible')
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

const dataUsersTyping = (list) => {
    if (list && list.length > 0) {
        let data = ""
        list.forEach((user, index) => {
            if (index < 3) {
                let orther_username = user.split(" ").splice(-1)[0];
                data += orther_username
                if (index !== list.length - 1) data += ", "
            } else {
                data += " and orther"
            }
        })
        data += " typing..."

        return data
    }
    return false
}
