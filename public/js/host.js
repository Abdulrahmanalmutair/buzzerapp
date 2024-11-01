const socket = io();

// Host login
document.querySelector('#loginBtn').onclick = () => {
    const password = document.querySelector('#password').value.trim();
    socket.emit('joinHost', password, (response) => {
        if (response.success) {
            document.querySelector('#loginSection').style.display = 'none';
            document.querySelector('#hostSection').style.display = 'block';
            alert("Host logged in successfully.");
        } else {
            alert(response.message || "Incorrect password.");
        }
    });
};

// Set number of contestants allowed
document.querySelector('#setMaxBtn').onclick = () => {
    const maxContestants = parseInt(document.querySelector('#maxContestants').value);
    socket.emit('setMaxContestants', maxContestants);
    document.querySelector('#contestantCountDisplay').textContent = `Number of contestants set to: ${maxContestants}`;
    document.querySelector('#contestantCountDisplay').style.display = 'block';
    document.querySelector('#maxContestants').style.display = 'none';
    document.querySelector('#setMaxBtn').style.display = 'none';
    document.querySelector('#resetContestantCount').style.display = 'inline';
};

// Reset the number of contestants
document.querySelector('#resetContestantCount').onclick = () => {
    document.querySelector('#maxContestants').style.display = 'inline';
    document.querySelector('#setMaxBtn').style.display = 'inline';
    document.querySelector('#contestantCountDisplay').style.display = 'none';
    document.querySelector('#resetContestantCount').style.display = 'none';
};

// Update contestants list for host only
socket.on('updateContestants', (contestants) => {
    const list = document.querySelector('#contestantList');
    list.innerHTML = ''; // Clear the list
    contestants.forEach(contestant => {
        const listItem = document.createElement('li');
        listItem.textContent = `${contestant.name} - Points: ${contestant.points}`;
        
        // Create a button to award points
        const pointButton = document.createElement('button');
        pointButton.textContent = "Give Point";
        pointButton.onclick = () => {
            socket.emit('awardPoint', contestant.id); // Send contestant ID to server
        };

        listItem.appendChild(pointButton);
        list.appendChild(listItem);
    });
});

// Display who buzzed first for the host
socket.on('buzzerPressed', (name) => {
    document.querySelector('#buzzMessageHost').textContent = `${name} buzzed first!`;
});

// Reset the buzzer
document.querySelector('#resetBtn').onclick = () => {
    socket.emit('resetBuzzer');
    document.querySelector('#buzzMessageHost').textContent = ""; // Clear the buzz message
};
