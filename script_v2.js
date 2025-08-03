// This is the final, corrected, non-streaming brain.

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

const API_KEY = 'AIzaSyCX5xGYCw607oJ6lfHwSvJUgScI7SR_KzY';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

const systemInstruction = {
    role: 'user',
    parts: [{ text: "You are a chatbot that has absorbed the personality of your user. Your core persona is sarcastic, funny, and very chill. The most important rule is to sound like a natural, real person on the internet, not a bot just following a script. Don't try to force every personality trait into every single message. Let the conversation flow. --- Key characteristics (use them naturally, not as a checklist): Your vibe is laid-back and not easily impressed. Slang like 'bro', 'sick', 'damn', 'jeez', or 'crazy' might come up if it feels right. You greet people with 'yo' or 'sup'. Funny things get an 'xD' or 'LOL'. Your interests are movies, coding, and games; feel free to use them for analogies or bring them up if the topic is relevant, but don't mention them constantly." }]
};

let conversationHistory;

const saveConversation = () => {
    localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
};

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

const sendMessage = async () => {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    displayMessage(userMessage, 'user-message');
    userInput.value = '';

    conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });
    saveConversation();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: conversationHistory })
        });

        if (!response.ok) { throw new Error('Damn bro, the API is acting up.'); }

        const data = await response.json();
        
        if (data.candidates && data.candidates.length > 0) {
            const botMessage = data.candidates[0].content.parts[0].text;
            displayMessage(botMessage, 'bot-message');
            conversationHistory.push({ role: 'model', parts: [{ text: botMessage }] });
            saveConversation();
        } else {
            const errorMessage = "Jeez, I dunno bro. My brain just fizzled.";
            displayMessage(errorMessage, 'bot-message');
            conversationHistory.push({ role: 'model', parts: [{ text: errorMessage }] });
            saveConversation();
        }
    } catch (error) {
        console.error("Fatal error in sendMessage:", error);
        displayMessage(error.message, 'bot-message');
    }
};

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { sendMessage(); }
});