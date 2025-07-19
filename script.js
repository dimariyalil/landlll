// Modern Fortune Wheel for LilBet
class LilBetWheel {
    constructor() {
        // DOM Elements
        this.wheel = document.getElementById('wheel');
        this.spinBtn = document.getElementById('spinBtn');
        this.playBtn = document.getElementById('playBtn');
        this.winModal = document.getElementById('winModal');
        this.claimBtn = document.getElementById('claimBtn');
        this.winAmount = document.getElementById('winAmount');
        this.confettiContainer = document.getElementById('confetti');
        
        // Timer Elements
        this.hoursEl = document.getElementById('hours');
        this.minutesEl = document.getElementById('minutes');
        this.secondsEl = document.getElementById('seconds');
        
        // Game State
        this.isSpinning = false;
        this.currentRotation = 0;
        
        // Wheel Configuration
        this.segments = [
            { prize: 50, text: '50₽' },
            { prize: 100, text: '100₽' },
            { prize: 500, text: '500₽' },
            { prize: 1000, text: '1000₽' },
            { prize: 2000, text: '2000₽' },
            { prize: 5000, text: '5000₽' },
            { prize: 0, text: 'НЕУДАЧА' },
            { prize: 'bonus', text: 'БОНУС' }
        ];
        
        this.segmentAngle = 360 / this.segments.length;
        
        // Always win 1000₽ for demo (segment index 3)
        this.winningSegment = 3;
        
        // Timer Configuration (23:45:12)
        this.timeLeft = {
            hours: 23,
            minutes: 45,
            seconds: 12
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.startTimer();
        this.createFloatingShapes();
        this.preloadSounds();
        
        // Add initial animations
        setTimeout(() => {
            this.addInitialAnimations();
        }, 500);
    }
    
    bindEvents() {
        this.spinBtn.addEventListener('click', () => this.spin());
        this.playBtn.addEventListener('click', () => this.redirectToLilBet());
        this.claimBtn.addEventListener('click', () => this.redirectToLilBet());
        
        // Close modal on overlay click
        this.winModal.addEventListener('click', (e) => {
            if (e.target === this.winModal) {
                this.closeModal();
            }
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isSpinning) {
                e.preventDefault();
                this.spin();
            }
            if (e.code === 'Escape') {
                this.closeModal();
            }
        });
    }
    
    // Timer Logic
    startTimer() {
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeLeft.seconds--;
            
            if (this.timeLeft.seconds < 0) {
                this.timeLeft.seconds = 59;
                this.timeLeft.minutes--;
                
                if (this.timeLeft.minutes < 0) {
                    this.timeLeft.minutes = 59;
                    this.timeLeft.hours--;
                    
                    if (this.timeLeft.hours < 0) {
                        // Reset timer when it reaches 0
                        this.timeLeft = { hours: 23, minutes: 45, seconds: 12 };
                    }
                }
            }
            
            this.updateTimerDisplay();
        }, 1000);
    }
    
    updateTimerDisplay() {
        this.hoursEl.textContent = this.timeLeft.hours.toString().padStart(2, '0');
        this.minutesEl.textContent = this.timeLeft.minutes.toString().padStart(2, '0');
        this.secondsEl.textContent = this.timeLeft.seconds.toString().padStart(2, '0');
    }
    
    // Wheel Spinning Logic
    spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.spinBtn.disabled = true;
        this.spinBtn.querySelector('.btn-text').textContent = 'КРУТИТСЯ...';
        
        // Play spin sound
        this.playSpinSound();
        
        // Calculate winning rotation
        const targetSegmentAngle = this.winningSegment * this.segmentAngle;
        const extraRotations = 4 + Math.random() * 2; // 4-6 full rotations
        const finalRotation = this.currentRotation + (extraRotations * 360) + (360 - targetSegmentAngle) + (this.segmentAngle / 2);
        
        // Apply rotation
        this.wheel.style.transform = `rotate(${finalRotation}deg)`;
        this.currentRotation = finalRotation % 360;
        
        // Add visual effects during spin
        this.addSpinEffects();
        
        // Show result after animation
        setTimeout(() => {
            this.showWinResult();
            this.isSpinning = false;
            this.spinBtn.disabled = false;
            this.spinBtn.querySelector('.btn-text').textContent = 'КРУТИТЬ';
        }, 4000);
    }
    
    showWinResult() {
        const prize = this.segments[this.winningSegment].prize;
        
        // Update win amount in modal
        if (prize === 'bonus') {
            this.winAmount.textContent = 'БОНУС';
        } else {
            this.winAmount.textContent = `${prize}₽`;
        }
        
        // Show modal with animation
        this.showModal();
        
        // Create confetti
        this.createConfetti();
        
        // Play win sound
        this.playWinSound();
        
        // Add screen flash effect
        this.addWinFlash();
    }
    
    // Modal Management
    showModal() {
        this.winModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        this.winModal.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    // Effects and Animations
    addSpinEffects() {
        // Add glow effect to wheel
        this.wheel.style.boxShadow = `
            0 0 0 8px rgba(52, 204, 103, 0.4),
            0 0 80px rgba(52, 204, 103, 0.6),
            inset 0 0 30px rgba(0, 0, 0, 0.3)
        `;
        
        // Remove glow after spin
        setTimeout(() => {
            this.wheel.style.boxShadow = `
                0 0 0 8px rgba(52, 204, 103, 0.2),
                0 0 50px rgba(52, 204, 103, 0.3),
                inset 0 0 30px rgba(0, 0, 0, 0.3)
            `;
        }, 4000);
    }
    
    addWinFlash() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(52, 204, 103, 0.4) 0%, transparent 70%);
            pointer-events: none;
            z-index: 999;
            animation: flashWin 0.8s ease-out;
        `;
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 800);
        
        // Add flash animation if not exists
        if (!document.querySelector('#flash-animation-style')) {
            const style = document.createElement('style');
            style.id = 'flash-animation-style';
            style.textContent = `
                @keyframes flashWin {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Confetti System
    createConfetti() {
        const confettiCount = 50;
        const colors = ['#34cc67', '#ff00ff', '#ffffff', '#2fb557'];
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                this.createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
            }, i * 50);
        }
    }
    
    createConfettiPiece(color) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.cssText = `
            position: fixed;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: ${color};
            top: -10px;
            left: ${Math.random() * 100}vw;
            z-index: 1001;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            animation: confettiFall ${3 + Math.random() * 2}s ease-out forwards;
            transform: rotate(${Math.random() * 360}deg);
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 5000);
    }
    
    // Sound Effects
    preloadSounds() {
        // Create audio context for better browser support
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    playSpinSound() {
        // Visual feedback for spin (since we can't guarantee audio)
        document.body.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
        
        // Add shake animation if not exists
        if (!document.querySelector('#shake-animation-style')) {
            const style = document.createElement('style');
            style.id = 'shake-animation-style';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-2px); }
                    75% { transform: translateX(2px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Try to play beep sound if possible
        this.playBeep(220, 200); // Low beep for spin
    }
    
    playWinSound() {
        // Play celebration beeps
        this.playBeep(523, 200); // High C
        setTimeout(() => this.playBeep(659, 200), 150); // E
        setTimeout(() => this.playBeep(784, 300), 300); // G
    }
    
    playBeep(frequency, duration) {
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        } catch (e) {
            console.log('Audio playback failed:', e);
        }
    }
    
    // Background Animations
    createFloatingShapes() {
        setInterval(() => {
            if (document.querySelectorAll('.floating-particle').length < 5) {
                this.createFloatingParticle();
            }
        }, 3000);
    }
    
    createFloatingParticle() {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
            position: fixed;
            width: ${Math.random() * 6 + 4}px;
            height: ${Math.random() * 6 + 4}px;
            background: #34cc67;
            border-radius: 50%;
            bottom: -10px;
            left: ${Math.random() * 100}vw;
            z-index: 0;
            opacity: ${Math.random() * 0.5 + 0.3};
            animation: floatUp ${8 + Math.random() * 4}s linear forwards;
            pointer-events: none;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 12000);
        
        // Add float animation if not exists
        if (!document.querySelector('#float-animation-style')) {
            const style = document.createElement('style');
            style.id = 'float-animation-style';
            style.textContent = `
                @keyframes floatUp {
                    to {
                        transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    addInitialAnimations() {
        // Animate wheel on load
        this.wheel.style.transform = 'rotate(0deg) scale(0.8)';
        this.wheel.style.opacity = '0';
        this.wheel.style.transition = 'all 1s ease-out';
        
        setTimeout(() => {
            this.wheel.style.transform = 'rotate(0deg) scale(1)';
            this.wheel.style.opacity = '1';
        }, 100);
        
        // Animate elements on scroll
        this.addScrollAnimations();
    }
    
    addScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'slideInUp 0.8s ease-out forwards';
                }
            });
        }, observerOptions);
        
        // Observe feature items
        document.querySelectorAll('.feature-item').forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            observer.observe(item);
        });
        
        // Add slide in animation
        if (!document.querySelector('#slide-animation-style')) {
            const style = document.createElement('style');
            style.id = 'slide-animation-style';
            style.textContent = `
                @keyframes slideInUp {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Navigation
    redirectToLilBet() {
        // Add loading animation to button
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'ПЕРЕХОД...';
        btn.disabled = true;
        
        // Add visual feedback
        this.createRedirectEffect();
        
        // Redirect after short delay
        setTimeout(() => {
            window.open('https://lil.bet', '_blank');
            
            // Reset button after redirect
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 1000);
        }, 500);
    }
    
    createRedirectEffect() {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #34cc67, #2fb557);
            opacity: 0;
            z-index: 10000;
            pointer-events: none;
            animation: redirectFlash 1s ease-out;
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 1000);
        
        // Add redirect animation
        if (!document.querySelector('#redirect-animation-style')) {
            const style = document.createElement('style');
            style.id = 'redirect-animation-style';
            style.textContent = `
                @keyframes redirectFlash {
                    0% { opacity: 0; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Cleanup
    destroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Page Enhancement Class
class PageEnhancer {
    constructor() {
        this.init();
    }
    
    init() {
        this.addInteractiveEffects();
        this.optimizePerformance();
        this.addAccessibility();
    }
    
    addInteractiveEffects() {
        // Add hover effects to interactive elements
        document.querySelectorAll('.cta-btn, .wheel-center-btn, .modal-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform += ' scale(1.05)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = btn.style.transform.replace(' scale(1.05)', '');
            });
        });
        
        // Add parallax effect to background shapes
        window.addEventListener('mousemove', (e) => {
            const shapes = document.querySelectorAll('.floating-shape');
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 0.02;
                const x = (mouseX - 0.5) * speed * 100;
                const y = (mouseY - 0.5) * speed * 100;
                
                shape.style.transform += ` translate(${x}px, ${y}px)`;
            });
        });
    }
    
    optimizePerformance() {
        // Lazy load animations
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (reduceMotion.matches) {
            // Disable animations for users who prefer reduced motion
            document.body.style.setProperty('--animation-duration', '0s');
        }
        
        // Optimize scroll performance
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    
    handleScroll() {
        const scrollY = window.pageYOffset;
        const header = document.querySelector('.header');
        
        // Add header background on scroll
        if (scrollY > 100) {
            header.style.background = 'rgba(8, 43, 83, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
            header.style.borderBottom = '1px solid rgba(52, 204, 103, 0.2)';
        } else {
            header.style.background = 'transparent';
            header.style.backdropFilter = 'none';
            header.style.borderBottom = 'none';
        }
    }
    
    addAccessibility() {
        // Add focus indicators
        const style = document.createElement('style');
        style.textContent = `
            *:focus {
                outline: 2px solid #34cc67;
                outline-offset: 2px;
            }
            
            .wheel-center-btn:focus {
                outline: 3px solid #ff00ff;
            }
        `;
        document.head.appendChild(style);
        
        // Add ARIA labels
        document.getElementById('spinBtn').setAttribute('aria-label', 'Крутить колесо фортуны');
        document.getElementById('playBtn').setAttribute('aria-label', 'Перейти к игре');
        document.getElementById('claimBtn').setAttribute('aria-label', 'Забрать выигрыш');
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const lilBetWheel = new LilBetWheel();
    const pageEnhancer = new PageEnhancer();
    
    // Add console message
    console.log('🎰 LilBet Casino - Современное колесо фортуны загружено! 🎰');
    console.log('💚 Дизайн: Синий #082b53 + Зеленый #34cc67 + Маджента #ff00ff');
    console.log('🎯 Демо режим: Всегда выигрыш 1000₽');
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        lilBetWheel.destroy();
    });
});