console.log('hello world');

function getCurrentTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

//send text to server using chat textarea
document.getElementById('sendChatButton').addEventListener('click', function () {
    const username = document.getElementById('usernameInput').value;
    const msg = document.getElementById('chatBox').value;
    const timestamp = getCurrentTimestamp();

    //console.log(username, ' is sending msg', msg);

    fetch('http://0.0.0.0:8089', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "username": username,
            "timestamp": timestamp,
            "message": msg,
            "type": "chat"
        })
      }).then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const newMsg = document.createElement('li');
        newMsg.textContent = username + ': ' + msg;
        document.getElementById('chatHistoryList').appendChild(newMsg);
      })
})