// SAHAY-V Chat Interface Controller

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const chatStream = document.getElementById('chatStream');
    const emptyState = document.getElementById('emptyState');
    const sendBtn = document.getElementById('sendBtn');
    
    // Quick mood rating controls
    const postChatMoodContainer = document.getElementById('postChatMoodContainer');
    const chatMoodSlider = document.getElementById('chatMoodSlider');
    const chatMoodEmoji = document.getElementById('chatMoodEmoji');
    const chatMoodLabel = document.getElementById('chatMoodLabel');
    const saveMoodBtn = document.getElementById('saveMoodBtn');
    const moodSavedToast = document.getElementById('moodSavedToast');

    // Generate or retrieve persistent Session ID
    let sessionId = localStorage.getItem('sahay_v_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sahay_v_session_id', sessionId);
    }

    // Exact Emoji Mapping Scale
    function getEmojiAndLabel(level) {
        level = parseInt(level, 10);
        if (level <= 2) return { emoji: "😌", label: "Calm" };
        if (level <= 4) return { emoji: "🙂", label: "Mild" };
        if (level <= 6) return { emoji: "😟", label: "Moderate" };
        if (level <= 8) return { emoji: "😰", label: "High" };
        return { emoji: "🥵", label: "Severe" };
    }

    // Update live emoji preview on slider drag
    if (chatMoodSlider) {
        chatMoodSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            const { emoji, label } = getEmojiAndLabel(val);
            if (chatMoodEmoji) chatMoodEmoji.textContent = emoji;
            if (chatMoodLabel) chatMoodLabel.textContent = `${val}/10 - ${label}`;
        });
    }

    // Save post-chat mood entry
    if (saveMoodBtn) {
        saveMoodBtn.addEventListener('click', async () => {
            const level = chatMoodSlider ? chatMoodSlider.value : 5;
            saveMoodBtn.disabled = true;
            saveMoodBtn.textContent = 'Saving... 💭';

            try {
                const res = await fetch('/api/journey/entry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        anxiety_level: level,
                        short_thought: 'Logged after companion chat session'
                    })
                });
                const data = await res.json();
                if (data.status === 'success') {
                    if (moodSavedToast) {
                        moodSavedToast.classList.remove('hidden');
                        setTimeout(() => moodSavedToast.classList.add('hidden'), 4000);
                    }
                }
            } catch (err) {
                console.error('Mood save error:', err);
            } finally {
                saveMoodBtn.disabled = false;
                saveMoodBtn.textContent = 'Save Mood Entry ✅';
            }
        });
    }

    // Scroll chat stream to bottom
    function scrollToBottom() {
        chatStream.scrollTop = chatStream.scrollHeight;
    }

    // Add User Message Bubble
    function addUserMessage(text) {
        if (emptyState) emptyState.remove();

        const msgDiv = document.createElement('div');
        msgDiv.className = 'flex justify-end mb-4 animate-fade-in';
        msgDiv.innerHTML = `
            <div class="max-w-[80%] md:max-w-[70%] bg-gradient-sahay text-white p-4 rounded-2xl rounded-tr-none shadow-md text-sm md:text-base leading-relaxed">
                ${escapeHtml(text)}
            </div>
        `;
        chatStream.appendChild(msgDiv);
        scrollToBottom();
    }

    // Add Agent Message Bubble
    function addAgentMessage(text, isAutoLogged = false, emoji = null) {
        if (emptyState) emptyState.remove();

        const msgDiv = document.createElement('div');
        msgDiv.className = 'flex items-start gap-3 mb-6 animate-fade-in';

        let badgeHtml = '';
        if (isAutoLogged && emoji) {
            badgeHtml = `<div class="mt-2 text-xs text-purple-700 bg-purple-100 px-3 py-1 rounded-full inline-block">
                Assessment recorded: ${emoji} logged to Journey ✅
            </div>`;
        }

        msgDiv.innerHTML = `
            <div class="w-10 h-10 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0 text-xl shadow-sm">
                🤍
            </div>
            <div class="max-w-[85%] md:max-w-[75%] bg-white border border-purple-100 text-slate-800 p-4 rounded-2xl rounded-tl-none shadow-sm text-sm md:text-base leading-relaxed">
                ${formatAgentText(text)}
                ${badgeHtml}
            </div>
        `;
        chatStream.appendChild(msgDiv);
        scrollToBottom();

        // Reveal quick mood rating slider after reply
        if (postChatMoodContainer) {
            postChatMoodContainer.classList.remove('hidden');
        }
    }

    // Add Typing Indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'flex items-center gap-3 mb-4';
        typingDiv.innerHTML = `
            <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0 text-xl shadow-sm">
                🤍
            </div>
            <div class="bg-white border border-purple-100 text-slate-500 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm text-sm flex items-center gap-2">
                <span>SAHAY-V is thinking...</span>
                <span class="inline-flex gap-1">
                    <span class="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                    <span class="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span class="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
            </div>
        `;
        chatStream.appendChild(typingDiv);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    // Helper functions for safe formatting
    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function formatAgentText(text) {
        return escapeHtml(text).replace(/\n/g, '<br>');
    }

    // Handle Form Submit
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = messageInput.value.trim();
            if (!message) return;

            // Clear input & disable send button during request
            messageInput.value = '';
            sendBtn.disabled = true;

            // Render user message bubble
            addUserMessage(message);

            // Render typing indicator
            showTypingIndicator();

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: message,
                        session_id: sessionId
                    })
                });

                const data = await response.json();
                removeTypingIndicator();

                if (data.reply) {
                    addAgentMessage(data.reply, data.auto_logged, data.emoji);
                } else {
                    addAgentMessage("I am here with you 🤍. Let's take a peaceful breath together.");
                }
            } catch (err) {
                console.error('Chat API Error:', err);
                removeTypingIndicator();
                addAgentMessage("I am right here with you 🤍. Take a deep, gentle breath. How are you feeling right now?");
            } finally {
                sendBtn.disabled = false;
                messageInput.focus();
            }
        });
    }
});
