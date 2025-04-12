document.addEventListener('DOMContentLoaded', function() {
    const ghostAI = document.getElementById('ghost-ai');
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const conversation = document.getElementById('conversation');
    const closeAI = document.getElementById('close-ai');
    const reloadBtn = document.querySelector('.reload-btn');
    
    let isAIVisible = false;
    
    // Toggle AI visibility with backtick key
    document.addEventListener('keydown', function(event) {
        if (event.key === '`') {
            event.preventDefault();
            toggleAI();
        }
    });
    
    // Close with X button
    closeAI.addEventListener('click', function() {
        hideAI();
    });
    
    // Also close when clicking reload button (for realism)
    reloadBtn.addEventListener('click', function() {
        location.reload();
    });
    
    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);
    
    // Send message on Enter key (but Shift+Enter for new line)
    userInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
    
    function toggleAI() {
        if (isAIVisible) {
            hideAI();
        } else {
            showAI();
        }
    }
    
    function showAI() {
        ghostAI.classList.remove('hidden');
        isAIVisible = true;
        userInput.focus();
    }
    
    function hideAI() {
        ghostAI.classList.add('hidden');
        isAIVisible = false;
    }
    
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message to conversation
        addMessage(message, 'user');
        userInput.value = '';
        
        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        conversation.appendChild(typingIndicator);
        conversation.scrollTop = conversation.scrollHeight;
        
        // Call Gemini API
        fetchFromGemini(message)
            .then(response => {
                // Remove typing indicator
                conversation.removeChild(typingIndicator);
                // Add AI response to conversation
                addMessage(response, 'ai');
            })
            .catch(error => {
                // Remove typing indicator
                conversation.removeChild(typingIndicator);
                // Add error message
                addMessage("Sorry, I'm having trouble connecting. Please try again.", 'ai');
                console.error('Error:', error);
            });
    }
    
    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = sender === 'user' ? 'user-message' : 'ai-message';
        messageElement.textContent = text;
        conversation.appendChild(messageElement);
        
        // Auto scroll to bottom
        conversation.scrollTop = conversation.scrollHeight;
    }
    
    async function fetchFromGemini(prompt) {
        const API_KEY = 'AIzaSyCvw6MeCQ-Vd8TZavJQZZJu0NDBLkhWdK0';
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
        
        const requestBody = {
            contents: [{
                parts: [{ text: prompt }]
            }]
        };
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error('API request failed');
            }
            
            const data = await response.json();
            
            // Extract text from response
            if (data.candidates && 
                data.candidates[0] && 
                data.candidates[0].content && 
                data.candidates[0].content.parts && 
                data.candidates[0].content.parts[0].text) {
                
                return data.candidates[0].content.parts[0].text;
            } else {
                return "I couldn't process that request. Please try again.";
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            return "Sorry, I encountered an error. Please try again later.";
        }
    }
});
