const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $sendLocation = document.querySelector('#send-location')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $message = document.querySelector('#messages')

// Templates

socket.on('message', (message) => {
    console.log(message.text)
    const messageTemplate = $("#message-template").html()
    Mustache.parse(messageTemplate)

    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('YYYY-MM-DD hh:mm:ss A'),
    })
    $("#messages").append(html)
})

socket.on('locationMessage', (url) => {
    console.log(url)
    const locationTemplate = $("#location-message-template").html()
    Mustache.parse(locationTemplate)
    const html = Mustache.render(locationTemplate, {
        url: url.url,
        createdAt: moment(url.createdAt).format('YYYY-MM-DD hh:mm:ss A'),
    })
    $("#messages").append(html)
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = $("#position").val()
    socket.emit('sendMessage', message, (err) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ""
        $messageFormInput.focus()

        if (err) console.log(err)
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
    })
})
