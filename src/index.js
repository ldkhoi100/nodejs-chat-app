const express = require("express")
const http = require("http")
const path = require("path")
const socketio = require("socket.io")
const Filter = require("bad-words")
const {generateMessage} = require('./utils/message')
const {addUser, removeUser, getUser, getUserInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server) // Kết nối tất cả người dùng

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, "../public")

app.use(express.static(publicDirectoryPath))

// socket: Kết nối đơn lẻ một người dùng
io.on('connection', (socket) => {
    console.log("New WebSocket connection")

    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options}) // Thêm người dùng
        if (error) return callback(error)

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', `Welcome ${user.username}`)) // Khởi tạo ti nhắn
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined`)) // Phát hiện hoạt động bên ngoài, client sẽ không nhận được thông báo này

        // Lấy dữ liệu user trong room
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        const filter = new Filter()
        if (filter.isProfane(message)) return callback('Profane is not allowed')

        callback()
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username, message))
        socket.emit('message', generateMessage(user.username, message), true)
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
            io.to(user.room).emit('message', generateMessage('Admin', `User ${user.username} has left`))
        }
    })
})

server.listen(port, () => {
    console.log(`Server listening on ${port}`)
})
