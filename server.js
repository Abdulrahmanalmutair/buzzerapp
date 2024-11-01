const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3001   ;
const hostPassword = bcrypt.hashSync("1", 10); // Replace with the host's password

let contestants = []; // Array to store contestant details
let isBuzzerActive = true; // Boolean to control the buzzer state
let maxContestants = 0; // Max number of contestants allowed
let hostSocketId = null;

app.use(express.static('public'));

// Socket.io event handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle host joining with password authentication
    socket.on('joinHost', (password, callback) => {
        if (bcrypt.compareSync(password, hostPassword)) {
            hostSocketId = socket.id; // Save host socket ID
            callback({ success: true });
            console.log('Host connected');
        } else {
            callback({ success: false, message: 'Incorrect password' });
        }
    });

    // Host sets max contestants allowed
    socket.on('setMaxContestants', (max) => {
        maxContestants = max;
        io.to(hostSocketId).emit('maxContestantsSet', max); // Notify host
    });

    // Contestant joins
    socket.on('joinContestant', (name) => {
        if (maxContestants === 0) {
            socket.emit('contestNotStarted', "The host did not start the contest.");
        } else if (contestants.length < maxContestants) {
            const contestant = { id: socket.id, name, points: 0 };
            contestants.push(contestant);
            if (hostSocketId) {
                io.to(hostSocketId).emit('updateContestants', contestants); // Notify the host with names
            }
            socket.emit('joinAllowed');
        } else {
            socket.emit('joinDenied', "Contest is full.");
        }
    });

    // Contestant presses the buzzer
    socket.on('buzz', () => {
        if (isBuzzerActive) {
            isBuzzerActive = false; // Lock the buzzer
            const contestant = contestants.find(c => c.id === socket.id);
            if (contestant) {
                io.emit('buzzerPressed', contestant.name); // Notify all clients with the name of who buzzed first
                if (hostSocketId) {
                    io.to(hostSocketId).emit('buzzerPressed', contestant.name); // Notify the host of who buzzed first
                }
            }
        }
    });

    // Host awards a point to a specific contestant
    socket.on('awardPoint', (contestantId) => {
        const contestant = contestants.find(c => c.id === contestantId);
        if (contestant) {
            contestant.points += 1;
            io.to(contestantId).emit('updatePoints', contestant.points); // Send updated points to contestant
            io.to(hostSocketId).emit('updateContestants', contestants); // Update host's view of points
        }
    });

    // Host resets the buzzer and notifies only joined contestants
    socket.on('resetBuzzer', () => {
        isBuzzerActive = true;
        contestants.forEach(contestant => {
            io.to(contestant.id).emit('buzzerReset');
        });
        io.to(hostSocketId).emit('buzzerReset'); // Notify host as well
    });

    // Contestant disconnects
    socket.on('disconnect', () => {
        if (socket.id === hostSocketId) {
            hostSocketId = null; // Clear host ID if host disconnects
        } else {
            contestants = contestants.filter(c => c.id !== socket.id);
            if (hostSocketId) {
                io.to(hostSocketId).emit('updateContestants', contestants); // Update host view on contestant disconnect
            }
        }
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
