// Nexus AI Assistant
class NexusAI {
    constructor() {
        this.widget = document.getElementById('nexusWidget');
        this.messages = document.getElementById('nexusMessages');
        this.input = document.getElementById('nexusInput');
        this.sendButton = document.getElementById('nexusSend');
        this.minimizeButton = document.querySelector('.nexus-minimize');
        
        this.setupEventListeners();
        this.setupKnowledgeBase();
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

        // Add user message
        this.addMessage(userInput, 'user');
        this.input.value = '';

        // Process and respond
        setTimeout(() => {
            const response = this.generateResponse(userInput.toLowerCase());
            this.addMessage(response, 'nexus');
        }, 500);
    }

    generateResponse(input) {
        // Check for specific keywords
        for (const [key, value] of Object.entries(this.knowledgeBase)) {
            if (input.includes(key)) {
                return value;
            }
        }

        // Default responses
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

    toggleMinimize() {
        this.widget.classList.toggle('minimized');
        const icon = this.minimizeButton.querySelector('i');
        icon.className = this.widget.classList.contains('minimized') ? 
            'fas fa-plus' : 'fas fa-minus';
    }
}

// Initialize Nexus AI when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NexusAI();
}); 