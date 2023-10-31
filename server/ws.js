import { Server } from 'socket.io';
const init = async (server) => {
    const io = new Server(server)

    io.on('connection', (socket) => {
        socket.on('echo2', (message) => {
            console.log(`${socket.id} ${message}`)
        })
    });
}

export default init