// Define global objects
const achievements = {
    badges: {
        explorer: { progress: 0, max: 7, unlocked: false },
        coder: { progress: 0, max: 1, unlocked: false },
        gamer: { progress: 0, max: 2, unlocked: false },
        secret: { progress: 0, max: 3, unlocked: false }
    },
    
    init() {
        this.loadProgress();
        this.setupSectionTracking();
        this.updateBadgeDisplay();
    },
    
    loadProgress() {
        const saved = localStorage.getItem('achievements');
        if (saved) {
            this.badges = JSON.parse(saved);
        }
    },
    
    saveProgress() {
        localStorage.setItem('achievements', JSON.stringify(this.badges));
    },
    
    updateProgress(badge, amount = 1) {
        if (!this.badges[badge].unlocked) {
            this.badges[badge].progress += amount;
            if (this.badges[badge].progress >= this.badges[badge].max) {
                this.badges[badge].unlocked = true;
                this.showUnlockNotification(badge);
            }
            this.updateBadgeDisplay();
            this.saveProgress();
        }
    },
    
    updateBadgeDisplay() {
        Object.entries(this.badges).forEach(([badge, data]) => {
            const card = document.querySelector(`[data-badge="${badge}"]`);
            if (card) {
                const progress = (data.progress / data.max) * 100;
                const progressBar = card.querySelector('.progress-bar');
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                    
                    if (data.unlocked) {
                        card.classList.add('unlocked');
                        progressBar.style.width = '100%';
                    }
                }
            }
        });
    },
    
    showUnlockNotification(badge) {
        const badgeNames = {
            explorer: 'Explorer',
            coder: 'Code Master',
            gamer: 'Gamer',
            secret: 'Secret Finder'
        };
        
        showNotification(`Achievement Unlocked: ${badgeNames[badge]}!`, 'success');
    },
    
    setupSectionTracking() {
        const sections = document.querySelectorAll('section');
        const visited = new Set();
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    if (!visited.has(sectionId)) {
                        visited.add(sectionId);
                        this.updateProgress('explorer');
                    }
                }
            });
        }, { threshold: 0.5 });
        
        sections.forEach(section => observer.observe(section));
    }
};

const snakeGame = {
    canvas: null,
    ctx: null,
    snake: [],
    food: null,
    direction: 'right',
    score: 0,
    gameLoop: null,
    gridSize: 20,
    
    init() {
        this.canvas = document.getElementById('snakeCanvas');
        if (!this.canvas) {
            console.error('Snake canvas not found');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp': if (this.direction !== 'down') this.direction = 'up'; break;
                case 'ArrowDown': if (this.direction !== 'up') this.direction = 'down'; break;
                case 'ArrowLeft': if (this.direction !== 'right') this.direction = 'left'; break;
                case 'ArrowRight': if (this.direction !== 'left') this.direction = 'right'; break;
            }
        });
    },
    
    start() {
        if (!this.ctx) return;
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.score = 0;
        this.generateFood();
        
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), 150);
    },
    
    update() {
        const head = {...this.snake[0]};
        
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.generateFood();
            if (typeof achievements !== 'undefined') {
                achievements.updateProgress('gamer');
            }
        } else {
            this.snake.pop();
        }
        
        this.draw();
    },
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw snake
        this.ctx.fillStyle = '#00f2fe';
        this.snake.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
        
        // Draw food
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );
    },
    
    generateFood() {
        this.food = {
            x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
            y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
        };
    },
    
    checkCollision(head) {
        return (
            head.x < 0 ||
            head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 ||
            head.y >= this.canvas.height / this.gridSize ||
            this.snake.some(segment => segment.x === head.x && segment.y === head.y)
        );
    },
    
    gameOver() {
        clearInterval(this.gameLoop);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px JetBrains Mono';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Game Over! Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
    }
};

const typingTest = {
    texts: [
        "const greeting = 'Hello, World!';",
        "function calculateSum(a, b) { return a + b; }",
        "class Developer { constructor(name) { this.name = name; } }",
        "async function fetchData() { const response = await fetch(url); }"
    ],
    currentText: '',
    startTime: null,
    isActive: false,
    
    init() {
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        const input = document.querySelector('.typing-input');
        const startBtn = document.querySelector('[data-game="typing"] .play-btn');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }
        if (input) {
            input.addEventListener('input', () => this.checkProgress());
        }
    },
    
    start() {
        this.currentText = this.texts[Math.floor(Math.random() * this.texts.length)];
        const textElement = document.querySelector('.typing-text');
        const input = document.querySelector('.typing-input');
        
        if (textElement && input) {
            textElement.textContent = this.currentText;
            input.value = '';
            this.startTime = Date.now();
            this.isActive = true;
            input.focus();
        }
    },
    
    checkProgress() {
        if (!this.isActive) return;
        
        const input = document.querySelector('.typing-input');
        const text = document.querySelector('.typing-text');
        const stats = document.querySelector('.typing-stats');
        
        if (!input || !text || !stats) return;
        
        const inputText = input.value;
        const correctChars = this.currentText.split('').filter((char, i) => char === inputText[i]).length;
        const accuracy = (correctChars / inputText.length) * 100 || 0;
        
        const timeElapsed = (Date.now() - this.startTime) / 1000 / 60; // in minutes
        const words = inputText.length / 5;
        const wpm = Math.round(words / timeElapsed) || 0;
        
        stats.querySelector('.wpm').textContent = `WPM: ${wpm}`;
        stats.querySelector('.accuracy').textContent = `Accuracy: ${Math.round(accuracy)}%`;
        
        if (inputText === this.currentText) {
            this.complete();
        }
    },
    
    complete() {
        this.isActive = false;
        if (typeof achievements !== 'undefined') {
            achievements.updateProgress('coder');
        }
        showNotification('Typing test completed!', 'success');
    }
};

const easterEggs = {
    konamiCode: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
    konamiIndex: 0,
    
    init() {
        this.setupKonamiCode();
        this.setupSecretCommands();
    },
    
    setupKonamiCode() {
        document.addEventListener('keydown', (e) => {
            if (e.key === this.konamiCode[this.konamiIndex]) {
                this.konamiIndex++;
                if (this.konamiIndex === this.konamiCode.length) {
                    this.activateKonamiCode();
                    this.konamiIndex = 0;
                }
            } else {
                this.konamiIndex = 0;
            }
        });
    },
    
    activateKonamiCode() {
        document.body.classList.add('konami-mode');
        if (typeof achievements !== 'undefined') {
            achievements.updateProgress('secret');
        }
        showNotification('Secret theme unlocked!', 'success');
        
        setTimeout(() => {
            document.body.classList.remove('konami-mode');
        }, 10000);
    },
    
    setupSecretCommands() {
        const secretCommands = {
            'matrix': () => {
                document.body.classList.add('matrix-mode');
                if (typeof achievements !== 'undefined') {
                    achievements.updateProgress('secret');
                }
                showNotification('Matrix mode activated!', 'success');
            },
            'hack': () => {
                const elements = document.querySelectorAll('*');
                elements.forEach(el => {
                    el.style.transform = `rotate(${Math.random() * 360}deg)`;
                    setTimeout(() => {
                        el.style.transform = '';
                    }, 1000);
                });
                if (typeof achievements !== 'undefined') {
                    achievements.updateProgress('secret');
                }
                showNotification('System hacked!', 'success');
            }
        };
        
        let currentInput = '';
        document.addEventListener('keydown', (e) => {
            currentInput += e.key;
            Object.keys(secretCommands).forEach(cmd => {
                if (currentInput.endsWith(cmd)) {
                    secretCommands[cmd]();
                    currentInput = '';
                }
            });
            
            if (currentInput.length > 10) {
                currentInput = currentInput.slice(-10);
            }
        });
    }
};

// Initialize particles.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    try {
        // Initialize particles.js
        if (typeof particlesJS !== 'undefined') {
            console.log('Initializing particles.js');
            particlesJS('particles-js', {
                particles: {
                    number: { value: 80, density: { enable: true, value_area: 800 } },
                    color: { value: '#00fff7' },
                    shape: { type: 'circle' },
                    opacity: { value: 0.5, random: false },
                    size: { value: 3, random: true },
                    line_linked: { enable: true, distance: 150, color: '#00fff7', opacity: 0.4, width: 1 },
                    move: { enable: true, speed: 2, direction: 'none', random: false, straight: false, out_mode: 'out' }
                },
                interactivity: {
                    detect_on: 'canvas',
                    events: {
                        onhover: { enable: true, mode: 'grab' },
                        onclick: { enable: true, mode: 'push' },
                        resize: true
                    }
                },
                retina_detect: true
            });
        } else {
            console.error('particles.js is not loaded');
        }

        // Initialize all other features
        console.log('Initializing features');
        initializeFeatures();
        
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

function initializeFeatures() {
    // Custom cursor
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');

    if (cursor && cursorFollower) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            setTimeout(() => {
                cursorFollower.style.left = e.clientX + 'px';
                cursorFollower.style.top = e.clientY + 'px';
            }, 100);
        });
    }

    // Initialize Nexus AI
    if (typeof NexusAI !== 'undefined') {
        window.nexusAI = new NexusAI();
    }

    // Initialize achievements system
    if (typeof achievements !== 'undefined') {
        achievements.init();
    }

    // Initialize games
    if (typeof snakeGame !== 'undefined') {
        snakeGame.init();
    }
    
    if (typeof typingTest !== 'undefined') {
        typingTest.init();
    }

    // Initialize easter eggs
    if (typeof easterEggs !== 'undefined') {
        easterEggs.init();
    }

    // Initialize badge modal
    const badgeModal = document.getElementById('badgeModal');
    if (badgeModal) {
        const badgeModalIcon = badgeModal.querySelector('.badge-modal-icon');
        const badgeModalTitle = badgeModal.querySelector('.badge-modal-title');
        const badgeModalDesc = badgeModal.querySelector('.badge-modal-desc');
        const badgeModalProgress = badgeModal.querySelector('.badge-modal-progress');
        const badgeModalClose = badgeModal.querySelector('.badge-modal-close');

        // Open modal on badge click
        const achievementCards = document.querySelectorAll('.achievement-card');
        achievementCards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                const badge = card.getAttribute('data-badge');
                const data = achievements.badges[badge];
                const desc = badgeDescriptions[badge];
                if (badgeModalIcon && desc) {
                    badgeModalIcon.innerHTML = desc.icon;
                }
                if (badgeModalTitle && desc) {
                    badgeModalTitle.textContent = desc.name;
                }
                if (badgeModalDesc && desc) {
                    badgeModalDesc.textContent = desc.desc;
                }
                if (badgeModalProgress && data) {
                    badgeModalProgress.innerHTML = `<div class='badge-modal-progress-bar' style='width: ${(data.progress / data.max) * 100}%'></div>`;
                }
                badgeModal.style.display = 'flex';
            });
        });

        // Close modal
        if (badgeModalClose) {
            badgeModalClose.addEventListener('click', () => {
                badgeModal.style.display = 'none';
            });
        }
        
        badgeModal.addEventListener('click', (e) => {
            if (e.target === badgeModal) {
                badgeModal.style.display = 'none';
            }
        });
    }

    // Initialize smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Initialize intersection observer for animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.timeline-item, .project-card, .skill-category, .stat-item').forEach(el => {
        observer.observe(el);
    });

    // Force all .scroll-animate elements to be visible on page load
    document.querySelectorAll('.scroll-animate').forEach(el => {
        el.classList.add('scrolled');
    });
}

// Custom cursor
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    setTimeout(() => {
        cursorFollower.style.left = e.clientX + 'px';
        cursorFollower.style.top = e.clientY + 'px';
    }, 100);
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.timeline-item, .project-card, .skill-category, .stat-item').forEach(el => {
    observer.observe(el);
});

// Form submission handling with validation
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    const inputs = contactForm.querySelectorAll('input, textarea');
    
    // Add input validation
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            validateInput(input);
        });
    });

    function validateInput(input) {
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch(input.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
                errorMessage = 'Please enter a valid email address';
                break;
            case 'text':
                isValid = value.length >= 2;
                errorMessage = 'Please enter at least 2 characters';
                break;
            case 'textarea':
                isValid = value.length >= 10;
                errorMessage = 'Please enter at least 10 characters';
                break;
        }

        // Remove existing error message if any
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error message if invalid
        if (!isValid && value !== '') {
            const error = document.createElement('div');
            error.className = 'error-message';
            error.textContent = errorMessage;
            error.style.color = '#ff4444';
            error.style.fontSize = '0.8rem';
            error.style.marginTop = '0.25rem';
            input.parentElement.appendChild(error);
        }

        return isValid;
    }

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate all inputs
        let isValid = true;
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            return;
        }

        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            // Here you would typically send the data to a server
            // For now, we'll simulate a successful submission
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success message
            submitBtn.textContent = 'Message Sent!';
            submitBtn.style.background = 'linear-gradient(45deg, #00ff00, #00cc00)';
            
            // Reset form
            contactForm.reset();
            
            // Show success notification
            showNotification('Message sent successfully!', 'success');
        } catch (error) {
            // Show error message
            submitBtn.textContent = 'Error!';
            submitBtn.style.background = 'linear-gradient(45deg, #ff4444, #cc0000)';
            showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '1rem 2rem';
    notification.style.borderRadius = '5px';
    notification.style.color = 'white';
    notification.style.fontWeight = '500';
    notification.style.zIndex = '9999';
    notification.style.animation = 'slideIn 0.3s ease-out';
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(45deg, #00ff00, #00cc00)';
    } else {
        notification.style.background = 'linear-gradient(45deg, #ff4444, #cc0000)';
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Skill bars animation
const skillBars = document.querySelectorAll('.skill-progress');

const animateSkillBars = () => {
    skillBars.forEach(bar => {
        const rect = bar.getBoundingClientRect();
        const isVisible = (rect.top <= window.innerHeight && rect.bottom >= 0);
        
        if (isVisible) {
            bar.classList.add('animate');
        }
    });
};

window.addEventListener('scroll', animateSkillBars);
window.addEventListener('load', animateSkillBars);

// Add parallax effect to hero section
const hero = document.querySelector('#hero');
if (hero) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    });
}

// Add typing effect to subtitle
const subtitle = document.querySelector('.subtitle');
if (subtitle) {
    const text = subtitle.textContent;
    subtitle.textContent = '';
    let i = 0;
    
    function typeWriter() {
        if (i < text.length) {
            subtitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    }
    
    // Start typing effect when page loads
    window.addEventListener('load', typeWriter);
}

// Add scroll progress indicator
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = `${scrolled}%`;
});

// Add styles for scroll progress bar
const style = document.createElement('style');
style.textContent = `
    .scroll-progress {
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
        z-index: 9999;
        transition: width 0.1s ease;
    }
    
    .animate {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('nav ul');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('nav')) {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Close menu when clicking a link
document.querySelectorAll('nav ul li a').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Enhanced scroll animations
const scrollElements = document.querySelectorAll('.scroll-animate');

const elementInView = (el, percentageScroll = 100) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
        elementTop <= 
        ((window.innerHeight || document.documentElement.clientHeight) * (percentageScroll/100))
    );
};

const displayScrollElement = (element) => {
    element.classList.add('scrolled');
};

const hideScrollElement = (element) => {
    element.classList.remove('scrolled');
};

const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
        if (elementInView(el, 100)) {
            displayScrollElement(el);
        } else {
            hideScrollElement(el);
        }
    });
};

// Add scroll animation class to elements
document.querySelectorAll('section').forEach(section => {
    section.classList.add('scroll-animate');
});
handleScrollAnimation(); // Trigger scroll animation on page load

// Throttle scroll event
let throttleTimer;
const throttle = (callback, time) => {
    if (throttleTimer) return;
    throttleTimer = setTimeout(() => {
        callback();
        throttleTimer = null;
    }, time);
};

window.addEventListener('scroll', () => {
    throttle(handleScrollAnimation, 250);
});

// Add parallax effect to background
const createParallaxBackground = () => {
    const background = document.createElement('div');
    background.className = 'parallax-background';
    document.body.appendChild(background);

    window.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 20;
        const y = (clientY / window.innerHeight - 0.5) * 20;
        
        background.style.transform = `translate(${x}px, ${y}px)`;
    });
};

createParallaxBackground();

// Add styles for new elements
const newStyles = document.createElement('style');
newStyles.textContent = `
    .menu-toggle {
        display: none;
        flex-direction: column;
        justify-content: space-between;
        width: 30px;
        height: 21px;
        cursor: pointer;
        z-index: 1001;
    }

    .menu-toggle span {
        display: block;
        height: 3px;
        width: 100%;
        background: var(--primary-color);
        border-radius: 3px;
        transition: var(--transition);
    }

    .menu-toggle.active span:nth-child(1) {
        transform: translateY(9px) rotate(45deg);
    }

    .menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }

    .menu-toggle.active span:nth-child(3) {
        transform: translateY(-9px) rotate(-45deg);
    }

    .scroll-animate {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease-out;
    }

    .scroll-animate.scrolled {
        opacity: 1;
        transform: translateY(0);
    }

    .parallax-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at center, 
            rgba(0, 242, 254, 0.1) 0%,
            rgba(79, 172, 254, 0.05) 50%,
            transparent 100%);
        pointer-events: none;
        z-index: -1;
        transition: transform 0.1s ease-out;
    }

    @media (max-width: 768px) {
        .menu-toggle {
            display: flex;
        }
    }
`;
document.head.appendChild(newStyles);

// Custom Cursor
const customCursor = document.querySelector('.custom-cursor');

document.addEventListener('mousemove', (e) => {
    customCursor.style.left = e.clientX + 'px';
    customCursor.style.top = e.clientY + 'px';
});

document.addEventListener('mousedown', () => {
    customCursor.style.transform = 'scale(0.8)';
});

document.addEventListener('mouseup', () => {
    customCursor.style.transform = 'scale(1)';
});

// Terminal Functionality
const terminal = {
    input: document.querySelector('.terminal-input'),
    output: document.querySelector('.terminal-output'),
    commands: {
        help: () => `
Available commands:
- about: Learn about me
- skills: View my technical skills
- projects: See my projects
- contact: Get my contact information
- clear: Clear the terminal
- help: Show this help message
        `,
        about: () => `
I'm a passionate software developer with expertise in web development and AI.
I love creating innovative solutions and learning new technologies.
Currently focused on building modern web applications and exploring AI/ML.
        `,
        skills: () => `
Technical Skills:
- Frontend: React, Vue.js, TypeScript, HTML5, CSS3
- Backend: Node.js, Python, Django, Express
- Database: MongoDB, PostgreSQL, MySQL
- DevOps: Docker, AWS, CI/CD
- AI/ML: TensorFlow, PyTorch, Scikit-learn
        `,
        projects: () => `
Featured Projects:
1. AI-Powered Portfolio (This website!)
2. E-commerce Platform
3. Real-time Chat Application
4. Machine Learning Dashboard
5. Task Management System

Visit my GitHub for more: https://github.com/yourusername
        `,
        contact: () => `
Contact Information:
- Email: your.email@example.com
- LinkedIn: https://linkedin.com/in/yourusername
- GitHub: https://github.com/yourusername
- Twitter: https://twitter.com/yourusername
        `,
        clear: () => {
            terminal.output.innerHTML = '';
            return '';
        }
    },
    
    init() {
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleCommand();
            }
        });
    },
    
    handleCommand() {
        const command = this.input.value.trim().toLowerCase();
        this.addLine(`$ ${command}`);
        
        if (this.commands[command]) {
            const output = this.commands[command]();
            if (output) {
                this.addLine(output);
            }
        } else {
            this.addLine(`Command not found: ${command}. Type 'help' for available commands.`);
        }
        
        this.input.value = '';
        this.scrollToBottom();
    },
    
    addLine(text) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        
        if (text.startsWith('$')) {
            line.innerHTML = `
                <span class="terminal-prompt">$</span>
                <span class="terminal-text">${text.substring(2)}</span>
            `;
        } else {
            line.innerHTML = `<span class="terminal-text">${text}</span>`;
        }
        
        this.output.appendChild(line);
    },
    
    scrollToBottom() {
        this.output.scrollTop = this.output.scrollHeight;
    }
};

// Initialize terminal
terminal.init();

// Badge Modal Logic
const badgeDescriptions = {
    explorer: {
        icon: '<i class="fas fa-compass"></i>',
        name: 'Explorer',
        desc: 'Unlock by visiting all sections of the portfolio. Explore every corner!'
    },
    coder: {
        icon: '<i class="fas fa-code"></i>',
        name: 'Code Master',
        desc: 'Unlock by completing the typing test challenge. Show off your coding speed!'
    },
    gamer: {
        icon: '<i class="fas fa-gamepad"></i>',
        name: 'Gamer',
        desc: 'Unlock by playing all mini-games. Have fun and beat your high score!'
    },
    secret: {
        icon: '<i class="fas fa-key"></i>',
        name: 'Secret Finder',
        desc: 'Unlock by discovering all easter eggs. Can you find them all?'
    }
};

const badgeModal = document.getElementById('badgeModal');
const badgeModalIcon = badgeModal.querySelector('.badge-modal-icon');
const badgeModalTitle = badgeModal.querySelector('.badge-modal-title');
const badgeModalDesc = badgeModal.querySelector('.badge-modal-desc');
const badgeModalProgress = badgeModal.querySelector('.badge-modal-progress');
const badgeModalClose = badgeModal.querySelector('.badge-modal-close');

// Open modal on badge click
const achievementCards = document.querySelectorAll('.achievement-card');
achievementCards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
        const badge = card.getAttribute('data-badge');
        const data = achievements.badges[badge];
        const desc = badgeDescriptions[badge];
        badgeModalIcon.innerHTML = desc.icon;
        badgeModalTitle.textContent = desc.name;
        badgeModalDesc.textContent = desc.desc;
        badgeModalProgress.innerHTML = `<div class='badge-modal-progress-bar' style='width: ${(data.progress / data.max) * 100}%'></div>`;
        badgeModal.style.display = 'flex';
    });
});

// Close modal
badgeModalClose.addEventListener('click', () => {
    badgeModal.style.display = 'none';
});
badgeModal.addEventListener('click', (e) => {
    if (e.target === badgeModal) {
        badgeModal.style.display = 'none';
    }
});

function showBadgeDetails(badge) {
    const badgeModal = document.getElementById('badgeModal');
    const badgeModalIcon = badgeModal.querySelector('.badge-modal-icon');
    const badgeModalTitle = badgeModal.querySelector('.badge-modal-title');
    const badgeModalDesc = badgeModal.querySelector('.badge-modal-desc');
    const badgeModalProgress = badgeModal.querySelector('.badge-modal-progress');
    
    const data = achievements.badges[badge];
    const desc = badgeDescriptions[badge];
    
    if (badgeModalIcon && desc) {
        badgeModalIcon.innerHTML = desc.icon;
    }
    if (badgeModalTitle && desc) {
        badgeModalTitle.textContent = desc.name;
    }
    if (badgeModalDesc && desc) {
        badgeModalDesc.textContent = desc.desc;
    }
    if (badgeModalProgress && data) {
        badgeModalProgress.innerHTML = `<div class='badge-modal-progress-bar' style='width: ${(data.progress / data.max) * 100}%'></div>`;
    }
    
    badgeModal.style.display = 'flex';
}
