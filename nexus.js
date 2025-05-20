// Nexus AI Assistant
class NexusAI {
    constructor() {
        this.widget = document.getElementById('nexusWidget');
        this.messages = document.getElementById('nexusMessages');
        this.input = document.getElementById('nexusInput');
        this.sendButton = document.getElementById('nexusSend');
        this.minimizeButton = document.querySelector('.nexus-minimize');
        this.typingIndicator = document.getElementById('nexusTyping');
        this.moodDisplay = document.getElementById('nexusMood');
        this.avatar = this.widget.querySelector('.animated-avatar img');
        this.avatarPulse = this.widget.querySelector('.avatar-pulse');
        this.isMinimized = false;
        this.dragOffset = { x: 0, y: 0 };
        this.isDragging = false;
        this.moods = [
            {emoji: '🤖', text: 'Logical'},
            {emoji: '😎', text: 'Cool'},
            {emoji: '🤓', text: 'Nerdy'},
            {emoji: '😴', text: 'Sleepy'},
            {emoji: '😂', text: 'Jokester'},
            {emoji: '😇', text: 'Helpful'},
            {emoji: '🧐', text: 'Curious'},
            {emoji: '🥳', text: 'Party'},
            {emoji: '👾', text: 'Glitchy'}
        ];
        this.currentMood = this.randomMood();
        this.setupEventListeners();
        this.setupKnowledgeBase();
        this.setupDraggable();
        this.restoreChat();
        this.setMood(this.currentMood);
        this.setupIdleAnimation();
    }

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleUserInput());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserInput();
        });
        this.minimizeButton.addEventListener('click', () => this.toggleMinimize());
        // Theme switcher
        const themeSwitcher = document.getElementById('themeSwitcher');
        if (themeSwitcher) {
            themeSwitcher.addEventListener('click', () => this.toggleTheme());
        }
    }

    setupKnowledgeBase() {
        this.knowledgeBase = {
            'about': 'I am a Software Engineering student at the University of Huddersfield with over 5 years of experience in database management and software development.',
            'experience': 'I have worked as a Software Developer Intern at Radical AI and as a Database Intern at Ultimate Academy. I also have experience as a Freelance Web Developer.',
            'skills': 'My technical skills include C/C++, Python, JavaScript, Java, HTML/CSS, MySQL/PostgreSQL, Django/Flask, and Firebase.',
            'education': 'I am currently pursuing a BSc in Software Engineering at the University of Huddersfield. I also have a Foundation degree in Aerospace Engineering from the University of Liverpool.',
            'languages': 'I am fluent in English and Arabic, have professional working proficiency in German, and limited working proficiency in Turkish.',
            'contact': 'You can reach me at zeyadmaeen1@gmail.com or connect with me on LinkedIn at linkedin.com/in/zezomaeen',
            'projects': 'Some of my notable projects include a Hospital Management System, Database Optimization Project, and various Web Applications using modern technologies.',
            'certifications': 'I hold certifications in Accelerating Deep Learning with GPUs, Google UX Design Specialization, and am an Academic Associate at BCS, The Chartered Institute for IT.'
        };
        this.easterEggs = [
            { trigger: 'joke', response: () => this.randomJoke() },
            { trigger: 'mood', response: () => this.moodResponse() },
            { trigger: 'party', response: () => '🎉 Party mode activated! Nexus is ready to celebrate your achievements.' },
            { trigger: 'glitch', response: () => '👾 Glitch detected! Just kidding, all systems nominal.' },
            { trigger: 'konami', response: () => '🕹️ You found the Konami code! Up, Up, Down, Down, Left, Right, Left, Right, B, A.' },
            { trigger: 'sing', response: () => '🎤 La la la... Nexus can code, but singing is still in beta.' },
            { trigger: 'dance', response: () => '💃🕺 Initiating dance protocol... *robotic dance moves*' }
        ];
        this.jokes = [
            "Why do programmers prefer dark mode? Because light attracts bugs!",
            "Why did the computer show up at work late? It had a hard drive!",
            "Why do Java developers wear glasses? Because they don't see sharp!",
            "How many programmers does it take to change a light bulb? None, that's a hardware problem!",
            "Why was the cell phone wearing glasses? Because it lost its contacts!"
        ];
    }

    handleUserInput() {
        const userInput = this.input.value.trim();
        if (!userInput) return;
        this.addMessage(userInput, 'user');
        this.input.value = '';
        this.saveChat();
        this.showTypingIndicator();
        setTimeout(() => {
            const response = this.generateResponse(userInput.toLowerCase());
            this.hideTypingIndicator();
            this.addMessage(response, 'nexus');
            this.saveChat();
            // Randomly change mood after a response
            if (Math.random() < 0.25) this.setMood(this.randomMood());
        }, 900 + Math.random() * 600);
    }

    generateResponse(input) {
        // Easter eggs
        for (const egg of this.easterEggs) {
            if (input.includes(egg.trigger)) {
                return egg.response();
            }
        }
        for (const [key, value] of Object.entries(this.knowledgeBase)) {
            if (input.includes(key)) {
                return value;
            }
        }
        if (input.includes('hello') || input.includes('hi')) {
            return this.greetResponse();
        }
        if (input.includes('help')) {
            return "I can tell you about Zeyad's experience, skills, education, projects, or contact information. Just ask me anything!";
        }
        return "I'm not sure about that. You can ask me about Zeyad's experience, skills, education, projects, or contact information. Or try asking for a joke!";
    }

    greetResponse() {
        const greetings = [
            `Hello! I'm Nexus, Zeyad's AI assistant. How can I help you today?`,
            `Hey there! Need info about Zeyad or want to hear a joke?`,
            `Hi! Ask me anything about Zeyad, or type 'joke' for a laugh.`
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    randomJoke() {
        return this.jokes[Math.floor(Math.random() * this.jokes.length)];
    }

    moodResponse() {
        return `My current mood is: ${this.currentMood.emoji} <b>${this.currentMood.text}</b>.`;
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.innerHTML = `<p>${text}</p>`;
        this.messages.appendChild(messageDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.setAvatarListening(true);
    }
    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
        this.setAvatarListening(false);
    }

    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.widget.classList.toggle('minimized');
        const icon = this.minimizeButton.querySelector('i');
        icon.className = this.isMinimized ? 'fas fa-plus' : 'fas fa-minus';
        if (!this.isMinimized) {
            setTimeout(() => this.input.focus(), 350);
        }
    }

    setupDraggable() {
        const header = this.widget.querySelector('.nexus-header');
        header.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.onDrag(e));
        document.addEventListener('mouseup', () => this.endDrag());
        // Touch support
        header.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]));
        document.addEventListener('touchmove', (e) => this.onDrag(e.touches[0]));
        document.addEventListener('touchend', () => this.endDrag());
    }
    startDrag(e) {
        if (this.isMinimized) return;
        this.isDragging = true;
        const rect = this.widget.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        this.widget.style.transition = 'none';
        this.widget.style.opacity = '0.95';
    }
    onDrag(e) {
        if (!this.isDragging) return;
        let x = e.clientX - this.dragOffset.x;
        let y = e.clientY - this.dragOffset.y;
        // Keep within viewport
        x = Math.max(0, Math.min(window.innerWidth - this.widget.offsetWidth, x));
        y = Math.max(0, Math.min(window.innerHeight - this.widget.offsetHeight, y));
        this.widget.style.left = x + 'px';
        this.widget.style.top = y + 'px';
        this.widget.style.right = 'auto';
        this.widget.style.bottom = 'auto';
        this.widget.style.position = 'fixed';
    }
    endDrag() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.widget.style.transition = '';
        this.widget.style.opacity = '';
    }

    // --- Theme Switcher ---
    toggleTheme() {
        const body = document.body;
        let current = body.classList.contains('cyberpunk-theme') ? 'cyberpunk' : body.classList.contains('light-theme') ? 'light' : 'dark';
        let next;
        if (current === 'dark') next = 'light';
        else if (current === 'light') next = 'cyberpunk';
        else next = 'dark';
        body.classList.remove('light-theme', 'cyberpunk-theme');
        if (next === 'light') body.classList.add('light-theme');
        if (next === 'cyberpunk') body.classList.add('cyberpunk-theme');
        localStorage.setItem('theme', next);
        this.setMood(this.randomMood());
    }

    // --- Persistent Chat ---
    saveChat() {
        const chat = Array.from(this.messages.children).map(msg => ({
            sender: msg.classList.contains('user') ? 'user' : 'nexus',
            html: msg.innerHTML
        }));
        localStorage.setItem('nexusChat', JSON.stringify(chat));
    }
    restoreChat() {
        const chat = JSON.parse(localStorage.getItem('nexusChat') || '[]');
        if (chat.length) {
            this.messages.innerHTML = '';
            chat.forEach(msg => {
                const div = document.createElement('div');
                div.className = `message ${msg.sender}`;
                div.innerHTML = msg.html;
                this.messages.appendChild(div);
            });
            this.messages.scrollTop = this.messages.scrollHeight;
        }
    }

    // --- Nexus Mood ---
    randomMood() {
        return this.moods[Math.floor(Math.random() * this.moods.length)];
    }
    setMood(mood) {
        this.currentMood = mood;
        if (this.moodDisplay) {
            this.moodDisplay.textContent = `${mood.emoji} ${mood.text}`;
        }
    }

    // --- Avatar Idle/Listening Animation ---
    setupIdleAnimation() {
        setInterval(() => {
            if (!this.typingIndicator || this.typingIndicator.style.display === 'flex') return;
            // Blink effect
            this.avatar.style.filter = 'brightness(0.7)';
            setTimeout(() => {
                this.avatar.style.filter = '';
            }, 180);
        }, 5000 + Math.random() * 3000);
    }
    setAvatarListening(listening) {
        if (listening) {
            this.avatarPulse.style.animationDuration = '0.7s';
            this.avatar.style.transform = 'scale(1.08)';
        } else {
            this.avatarPulse.style.animationDuration = '';
            this.avatar.style.transform = '';
        }
    }
}

// Theme on load
(function() {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') document.body.classList.add('light-theme');
    if (theme === 'cyberpunk') document.body.classList.add('cyberpunk-theme');
})();

document.addEventListener('DOMContentLoaded', () => {
    new NexusAI();
}); 