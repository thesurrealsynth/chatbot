// This is the final frontend script, now talking to your own backend server.

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// NEW: The URL of YOUR local server's chat endpoint
const API_URL = 'const API_URL = 'https://chatbotbackend-thesurrealsynth.onrender.com/chat';'; 

const systemInstruction = {
    role: 'user',
    parts: [{ text: "You are a chatbot that has absorbed the personality of your user..." }] // The personality prompt remains
};

let conversationHistory; // The memory remains

// All the setup functions (saveConversation, displayMessage, window.onload) are the same...
const saveConversation = () => { localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory)); };
const displayMessage = (message, className) => {
    const messageElement = document.createElement('div');
    messageElement.className = className;
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
};
window.onload = () => {
    const savedHistory = localStorage.getItem('conversationHistory');
    if (savedHistory) {
        conversationHistory = JSON.parse(savedHistory);
        const historyToDisplay = conversationHistory.slice(1);
        historyToDisplay.forEach(item => {
            const role = item.role === 'model' ? 'bot-message' : 'user-message';
            displayMessage(item.parts[0].text, role);
        });
    } else {
        conversationHistory = [systemInstruction];
        displayMessage("Yo.", 'bot-message');
        conversationHistory.push({ role: 'model', parts: [{ text: "Yo." }] });
        saveConversation();
    }
};

// The sendMessage function is now simpler!
const sendMessage = async () => {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    displayMessage(userMessage, 'user-message');
    userInput.value = '';

    conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });
    saveConversation();

    try {
        // It sends the whole history to YOUR server
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationHistory: conversationHistory })
        });

        if (!response.ok) { throw new Error('Damn bro, the server is acting up.'); }

        const data = await response.json();
        const botMessage = data.message; // We get the simple message back

        displayMessage(botMessage, 'bot-message');
        conversationHistory.push({ role: 'model', parts: [{ text: botMessage }] });
        saveConversation();

    } catch (error) {
        console.error("Error talking to backend:", error);
        displayMessage(error.message, 'bot-message');
    }
};

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { sendMessage(); }
});