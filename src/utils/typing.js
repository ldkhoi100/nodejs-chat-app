const usersTyping = []

const listUsersTyping = () => {
    return usersTyping
}

const addUsersTyping = (username) => {
    usersTyping.push(username)

    return {username}
}

const removeUsersTyping = (username) => {
    const index = usersTyping.indexOf(username)
    if (index !== -1) {
        usersTyping.splice(index, 1)
    }

    return {username}
}

module.exports = {
    listUsersTyping, addUsersTyping, removeUsersTyping
}
