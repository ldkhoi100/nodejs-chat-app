const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

socket.on('message', (message) => {
    console.log(message.text)
    const messageTemplate = $("#message-template").html()
    Mustache.parse(messageTemplate)

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('YYYY-MM-DD hh:mm:ss A'),
    })
    $("#messages").append(html)
    autoscroll()
})

socket.on('scrollToBottom', (boolean) => {
    scrollToBottom("messages")
})

socket.on('locationMessage', (url) => {
    console.log(url)
    const locationTemplate = $("#location-message-template").html()
    Mustache.parse(locationTemplate)
    const html = Mustache.render(locationTemplate, {
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('YYYY-MM-DD hh:mm:ss A'),
    })
    $("#messages").append(html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const sidebarTemplate = $("#sidebar-template").html()
    Mustache.parse(sidebarTemplate)

    const html = Mustache.render(sidebarTemplate, {
        room, users
    })
    $("#chat__sidebar").html(html)
    console.log(room, users)
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

$("#send-location").click(() => {
    if (!navigator.geolocation) return alert('Geolocation is not supported on this browser')

    $messageFormButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation',
            `https://google.com/maps?q=${position.coords.longitude},${position.coords.latitude}`,
            () => {
                $messageFormButton.removeAttribute('disabled')
                console.log('Location shared')
            })
        socket.emit('scrollToBottom', true)
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
