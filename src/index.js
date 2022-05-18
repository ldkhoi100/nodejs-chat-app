const express = require("express")
const http = require("http")
const path = require("path")
const socketio = require("socket.io")
const Filter = require("bad-words")
const {generateMessage, generateLocationMessage} = require('./utils/message')

const app = express()
const server = http.createServer(app)
const io = socketio(server) // Kết nối tất cả người dùng

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, "../public")

app.use(express.static(publicDirectoryPath))

// socket: Kết nối đơn lẻ một người dùng
io.on('connection', (socket) => {
    console.log("New WebSocket connection")

    socket.emit('message', generateMessage('Welcome')) // Khởi tạo sự kiện

    socket.broadcast.emit('message', generateMessage('A new user has joined')) // Phát hiện hoạt động bên ngoài, client sẽ không nhận được thông báo này

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profane is not allowed')
        }
        callback()
        io.emit('message', generateMessage(message))
    })

    socket.on('sendLocation', (location, callback) => {
        io.emit('locationMessage', generateLocationMessage(location))
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has disconnected'))
    })
})

server.listen(port, () => {
    console.log(`Server listening on ${port}`)
})
