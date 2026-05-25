/**
 * Obsidian Glass - Portfolio Core Engine
 * Dedicated to Dongari Naga Varshith
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initNavbar();
    initParticleBackground();
    initTypewriter();
    initHeroTilt();
    initSkillsFilter();
    initTimelineObserver();
    initMobileMenu();
    initScrollFAB();
});

/* ==========================================================================
   1. Navigation Bar Logic
   ========================================================================== */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    // Shrink navbar on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        highlightActiveLink();
    });

    // Highlight active link based on scroll section
    function highlightActiveLink() {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 120; // offset for nav height

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }
    
    highlightActiveLink();
}

/* ==========================================================================
   2. Interactive Starfield / Particle Background (HTML5 Canvas)
   ========================================================================== */
function initParticleBackground() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    
    const particles = [];
    const maxParticles = 60; // Balanced performance
    const connectionDistance = 115;
    
    const mouse = {
        x: null,
        y: null,
        radius: 150
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => {
        width = (canvas.width = window.innerWidth);
        height = (canvas.height = window.innerHeight);
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Slow, floaty movement
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = (Math.random() - 0.5) * 0.35;
            this.radius = Math.random() * 2 + 1.2;
            // Custom cosmic blue, purple, and bright stars colors
            const rand = Math.random();
            this.color = rand > 0.65 ? 'rgba(56, 189, 248, 0.45)' : (rand > 0.3 ? 'rgba(129, 140, 248, 0.45)' : 'rgba(255, 255, 255, 0.3)');
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Boundary collision
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse attraction (subtle drift towards mouse)
            if (mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.x += (dx / dist) * force * 0.3;
                    this.y += (dy / dist) * force * 0.3;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            p1.update();
            p1.draw();

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    const alpha = (1 - dist / connectionDistance) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/* ==========================================================================
   3. Pure JavaScript Subtitle Typewriter Effect
   ========================================================================== */
function initTypewriter() {
    const textElement = document.querySelector('.hero-subtitle-text');
    if (!textElement) return;

    const roles = [
        "Full Stack Developer",
        "Machine Learning Engineer",
        "IIIT Sri City TA & SLC Member"
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 70;
    let pauseDuration = 2200;

    function type() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            charIndex--;
            typingSpeed = 35; // faster deletion
        } else {
            charIndex++;
            typingSpeed = 70; // standard typing speed
        }

        textElement.textContent = currentRole.substring(0, charIndex);

        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            typingSpeed = pauseDuration; // pause at peak
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 400; // pause before typing next word
        }

        setTimeout(type, typingSpeed);
    }

    setTimeout(type, 1000);
}

/* ==========================================================================
   4. 3D Perspective Card Tilt Effect (Hero Graphic)
   ========================================================================== */
function initHeroTilt() {
    const card = document.querySelector('.hero-tilt-card');
    if (!card) return;

    const cardContainer = document.querySelector('.hero-image-container');

    cardContainer.addEventListener('mousemove', (e) => {
        const cardRect = card.getBoundingClientRect();
        
        // Coordinates relative to card center
        const cardWidth = cardRect.width;
        const cardHeight = cardRect.height;
        const cardCenterX = cardRect.left + cardWidth / 2;
        const cardCenterY = cardRect.top + cardHeight / 2;
        
        const mouseX = e.clientX - cardCenterX;
        const mouseY = e.clientY - cardCenterY;

        // Angle ratios (Max rotate 8 degrees for a subtler, cleaner effect)
        const rotateX = (-mouseY / (cardHeight / 2)) * 8;
        const rotateY = (mouseX / (cardWidth / 2)) * 8;

        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(5px)`;
    });

    cardContainer.addEventListener('mouseleave', () => {
        card.style.transform = `rotateX(0deg) rotateY(0deg) translateZ(0px)`;
        card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    cardContainer.addEventListener('mouseenter', () => {
        card.style.transition = 'none'; // snappy tracking
    });
}

/* ==========================================================================
   5. Technical Skills Matrix Search & Filter
   ========================================================================== */
function initSkillsFilter() {
    const searchInput = document.getElementById('skills-search');
    const filterPills = document.querySelectorAll('.pill-btn');
    const skillItems = document.querySelectorAll('.skill-item');
    
    let currentFilter = 'all';
    let searchQuery = '';

    // Filter pill click handler
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            
            currentFilter = pill.getAttribute('data-filter');
            applyFilters();
        });
    });

    // Search input handler
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            applyFilters();
        });
    }

    function applyFilters() {
        skillItems.forEach(item => {
            const skillName = item.querySelector('span').textContent.toLowerCase();
            const skillCategory = item.getAttribute('data-category');
            
            // Check matches
            const categoryMatch = (currentFilter === 'all' || skillCategory === currentFilter);
            const searchMatch = (searchQuery === '' || skillName.includes(searchQuery));
            
            if (categoryMatch && searchMatch) {
                item.classList.remove('dimmed');
                if (searchQuery !== '' && skillName.includes(searchQuery)) {
                    item.classList.add('highlighted');
                } else {
                    item.classList.remove('highlighted');
                }
            } else {
                item.classList.add('dimmed');
                item.classList.remove('highlighted');
            }
        });
    }
}

/* ==========================================================================
   6. Scroll Animations (Intersection Observer)
   ========================================================================== */
function initTimelineObserver() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .project-card, .skill-category-card, .timeline-item, .contact-detail-item, .social-dashboard-card');
    
    // Set up standard animation wrapper class for elements not explicitly wrapped
    animatedElements.forEach(el => {
        if (!el.classList.contains('animate-on-scroll')) {
            el.classList.add('animate-on-scroll');
        }
    });

    const observerOptions = {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target); // Animate once
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   7. Mobile Navigation Menu Toggle
   ========================================================================== */
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navMenu.classList.toggle('open');
    });

    // Close menu when links are clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navMenu.classList.remove('open');
        });
    });

    // Close menu on resize to desktop dimensions
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('open');
            navMenu.classList.remove('open');
        }
    });
}

/* ==========================================================================
   8. Scroll-To-Top / Download Resume FAB Action
   ========================================================================== */
function initScrollFAB() {
    const fabContainer = document.querySelector('.floating-action-container');
    const scrollUpBtn = document.createElement('button');
    
    if (!fabContainer) return;

    // Add scroll to top button next to FAB
    scrollUpBtn.className = 'fab-btn';
    scrollUpBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollUpBtn.style.background = '#ffffff';
    scrollUpBtn.style.color = 'var(--accent-cyan)';
    scrollUpBtn.style.border = '1px solid rgba(37, 99, 235, 0.2)';
    scrollUpBtn.style.display = 'none';

    fabContainer.insertBefore(scrollUpBtn, fabContainer.firstChild);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollUpBtn.style.display = 'flex';
        } else {
            scrollUpBtn.style.display = 'none';
        }
    });

    scrollUpBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
