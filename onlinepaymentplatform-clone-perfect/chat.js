// Simple Live Chat Widget Injection
(function() {
    // Inject Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .chat-widget-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background-color: #000;
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 999999;
            transition: transform 0.3s;
        }
        .chat-widget-btn:hover {
            transform: scale(1.05);
        }
        .chat-window {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 350px;
            height: 480px;
            background-color: #fff;
            border-radius: 12px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.2);
            z-index: 999999;
            display: none;
            flex-direction: column;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .chat-header {
            background-color: #000;
            color: #fff;
            padding: 15px 20px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .close-chat {
            cursor: pointer;
            font-size: 20px;
            line-height: 20px;
        }
        .chat-body {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background-color: #fafafa;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .chat-msg {
            max-width: 80%;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.4;
        }
        .msg-agent {
            background-color: #f1f5f9;
            color: #0f172a;
            align-self: flex-start;
            border-bottom-left-radius: 2px;
        }
        .msg-user {
            background-color: #000;
            color: #fff;
            align-self: flex-end;
            border-bottom-right-radius: 2px;
            display: none;
        }
        .chat-input-area {
            display: flex;
            border-top: 1px solid #eee;
            padding: 10px;
            background: #fff;
        }
        .chat-input {
            flex: 1;
            padding: 10px 15px;
            border: 1px solid #ddd;
            border-radius: 20px;
            outline: none;
            font-size: 14px;
        }
        .chat-send {
            background: none;
            border: none;
            color: #000;
            cursor: pointer;
            padding: 0 10px;
        }
        .chat-send svg {
            width: 24px;
            height: 24px;
        }
    `;
    document.head.appendChild(style);

    // Inject HTML
    const widget = document.createElement('div');
    widget.innerHTML = `
        <div class="chat-widget-btn" id="chatBtn">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <div class="chat-window" id="chatWindow">
            <div class="chat-header">
                <span>Canlı Destek</span>
                <span class="close-chat" id="closeChat">&times;</span>
            </div>
            <div class="chat-body" id="chatBody">
                <div class="chat-msg msg-agent">Merhaba! Size nasıl yardımcı olabilirim?</div>
                <div class="chat-msg msg-user" id="userMsgText"></div>
                <div class="chat-msg msg-agent" id="agentReply" style="display:none;">Temsilcilerimiz şu anda meşgul. Lütfen daha sonra tekrar deneyin veya mail ile ulaşın.</div>
            </div>
            <div class="chat-input-area">
                <input type="text" class="chat-input" id="chatInput" placeholder="Mesajınızı yazın...">
                <button class="chat-send" id="chatSendBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(widget);

    // Logic
    const chatBtn = document.getElementById('chatBtn');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const userMsgText = document.getElementById('userMsgText');
    const agentReply = document.getElementById('agentReply');
    const chatBody = document.getElementById('chatBody');

    chatBtn.addEventListener('click', () => {
        chatWindow.style.display = 'flex';
        chatBtn.style.display = 'none';
    });

    closeChat.addEventListener('click', () => {
        chatWindow.style.display = 'none';
        chatBtn.style.display = 'flex';
    });

    const sendMessage = () => {
        const val = chatInput.value.trim();
        if(val) {
            userMsgText.innerText = val;
            userMsgText.style.display = 'block';
            chatInput.value = '';
            chatBody.scrollTop = chatBody.scrollHeight;
            
            setTimeout(() => {
                agentReply.style.display = 'block';
                chatBody.scrollTop = chatBody.scrollHeight;
            }, 1000);
        }
    };

    chatSendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') sendMessage();
    });
})();
