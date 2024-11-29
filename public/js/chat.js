var sessionId = '_' + Math.random().toString(36).substr(2, 9);

function displayMessage(msg, type) {
    var messageContainer = document.createElement('div');
    messageContainer.classList.add('message', type);

    var messageContent = document.createElement('div');
    messageContent.classList.add('messageContent');
    messageContent.innerHTML = msg.content;

    messageContainer.appendChild(messageContent);

    var chatMessages = document.getElementById('chatMessages');
    chatMessages.appendChild(messageContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.getElementById('sendButton').addEventListener('click', sendMessage);
document.getElementById('messageInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    var input = document.getElementById('messageInput');
    var messageText = input.value.trim();
    if (messageText !== '') {
        var userMessage = {
            sessionId: sessionId,
            content: messageText
        };
        displayMessage(userMessage, 'user');

        input.value = '';
        input.focus();

        fetch('/messages/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userMessage)
        })
            .then(response => response.json())
            .then(data => {
                displayMessage(data, 'server');
            });
    }
}