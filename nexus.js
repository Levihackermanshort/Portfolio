// Nexus AI Assistant
class NexusAI {
    constructor() {
        this.widget = document.getElementById('nexusWidget');
        this.messages = document.getElementById('nexusMessages');
        this.input = document.getElementById('nexusInput');
        this.sendButton = document.getElementById('nexusSend');
        this.minimizeButton = document.querySelector('.nexus-minimize');
        this.typingIndicator = document.getElementById('nexusTyping');
        this.isMinimized = false;
        this.dragOffset = { x: 0, y: 0 };
        this.isDragging = false;
        this.setupEventListeners();
        this.setupKnowledgeBase();
        this.setupDraggable();
    }

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleUserInput());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserInput();
        });
        this.minimizeButton.addEventListener('click', () => this.toggleMinimize());
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
    }

    handleUserInput() {
        const userInput = this.input.value.trim();
        if (!userInput) return;
        this.addMessage(userInput, 'user');
        this.input.value = '';
        this.showTypingIndicator();
        setTimeout(() => {
            const response = this.generateResponse(userInput.toLowerCase());
            this.hideTypingIndicator();
            this.addMessage(response, 'nexus');
        }, 900 + Math.random() * 600);
    }

    generateResponse(input) {
        for (const [key, value] of Object.entries(this.knowledgeBase)) {
            if (input.includes(key)) {
                return value;
            }
        }
        if (input.includes('hello') || input.includes('hi')) {
            return "Hello! I'm Nexus, Zeyad's AI assistant. How can I help you today?";
        }
        if (input.includes('help')) {
            return "I can tell you about Zeyad's experience, skills, education, projects, or contact information. Just ask me anything!";
        }
        return "I'm not sure about that. You can ask me about Zeyad's experience, skills, education, projects, or contact information.";
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
    }
    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
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
}

// Initialize Nexus AI when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NexusAI();
}); 