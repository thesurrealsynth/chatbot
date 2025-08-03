document.addEventListener('DOMContentLoaded', function() {
    // --- 1. Get all the HTML elements ---
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // --- 2. Define constants and settings ---
    const API_URL = 'https://chatbotbackend-thesurrealsynth.onrender.com/chat';
    const systemInstruction = {
        role: 'user',
        parts: [{ text: "You are a chatbot that has absorbed the personality of your user. Your core persona is sarcastic, funny, and very chill. The most important rule is to sound like a natural, real person on the internet, not a bot just following a script. Don't try to force every personality trait into every single message. Let the conversation flow. --- Key characteristics (use them naturally, not as a checklist): Your vibe is laid-back and not easily impressed. Slang like 'bro', 'sick', 'damn', 'jeez', or 'crazy' might come up if it feels right. You greet people with 'yo' or 'sup'. Funny things get an 'xD' or 'LOL'. Your interests are movies, coding, and games; feel free to use them for analogies or bring them up if the topic is relevant, but don't mention them constantly." }]
    };

    // --- 3. Initialize the chat's memory ---
    let conversationHistory = [];

    // --- 4. Define all the functions we will need ---
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
                body: JSON.stringify({ conversationHistory: conversationHistory })
            });

            if (!response.ok) { throw new Error('Damn bro, the server is acting up.'); }

            const data = await response.json();
            const botMessage = data.message;

            displayMessage(botMessage, 'bot-message');
            conversationHistory.push({ role: 'model', parts: [{ text: botMessage }] });
            saveConversation();

        } catch (error) {
            console.error("Error talking to backend:", error);
            displayMessage(error.message, 'bot-message');
        }
    };

    // --- 5. Attach the buttons AFTER defining the functions ---
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') { sendMessage(); }
    });

    // --- 6. Load saved history and initialize the chat ---
    // This runs last, ensuring everything else is ready.
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
});