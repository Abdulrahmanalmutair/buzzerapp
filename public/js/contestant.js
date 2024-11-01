const socket = io();

// Join the contest
document.querySelector('#joinBtn').onclick = () => {
    const name = document.querySelector('#name').value.trim();
    if (name) {
        socket.emit('joinContestant', name);
    } else {
        alert("Please enter your name to join.");
    }
};

// Handle join responses
socket.on('joinAllowed', () => {
    document.querySelector('#joinSection').style.display = 'none';
    document.querySelector('#buzzerSection').style.display = 'block';
});

socket.on('joinDenied', (message) => {
    alert(message);
});

// Alert contestant if the host hasn't started the contest
socket.on('contestNotStarted', (message) => {
    alert(message);
});

// Handle buzzing
document.querySelector('#buzzerBtn').onclick = () => {
    socket.emit('buzz');
    document.querySelector('#buzzerBtn').disabled = true; // Lock the buzzer
    document.querySelector('#buzzerBtn').style.backgroundColor = 'gray'; // Change color to gray
    document.querySelector('#buzzerBtn').style.cursor = 'default'; // Remove pointer cursor
};

// Display who buzzed first and lock buzzer for everyone
socket.on('buzzerPressed', (name) => {
    const buzzMessage = document.querySelector('#buzzMessage');
    buzzMessage.textContent = `${name} buzzed first!`; // Show message above the buzzer button
    document.querySelector('#buzzerBtn').disabled = true; // Lock buzzer for everyone
    document.querySelector('#buzzerBtn').style.backgroundColor = 'gray'; // Change color to gray
    document.querySelector('#buzzerBtn').style.cursor = 'default'; // Remove pointer cursor
});

// Receive point updates from the host
socket.on('updatePoints', (points) => {
    document.querySelector('#pointsDisplay').textContent = `Points: ${points}`;
});

// Buzzer reset notification with auto-close
socket.on('buzzerReset', () => {
    const buzzerBtn = document.querySelector('#buzzerBtn');
    buzzerBtn.disabled = false; // Unlock the buzzer
    buzzerBtn.style.backgroundColor = ''; // Restore original color
    buzzerBtn.style.cursor = 'pointer'; // Restore pointer cursor
    document.querySelector('#buzzMessage').textContent = ""; // Clear the buzz message

    const resetAlert = document.createElement("div");
    resetAlert.textContent = "The buzzer has been reset! Get ready for the next question.";
    document.body.appendChild(resetAlert);
    setTimeout(() => {
        resetAlert.remove();
    }, 3000); // Auto-close after 3 seconds
});
