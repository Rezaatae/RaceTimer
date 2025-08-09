const timeDiv = document.getElementById('time');

// Connect to WebSocket server
const socket = new WebSocket("ws://localhost:5281/ws");

// log once when socket openned
socket.onopen = () => {
    console.log("Connected to server");
};

// Update the displayed time on every message recieved from server
socket.onmessage = (event) => {
    timeDiv.textContent = event.data; 
};

// log once when socket closed
socket.onclose = () => {
    timeDiv.textContent = "Connection closed";
};

// log any erros from socket
socket.onerror = (error) => {
    console.error("WebSocket Error: ", error);
};