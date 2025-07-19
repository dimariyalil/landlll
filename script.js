/* 
LilBet Fortune Wheel - Version 2.0
FIXED: Wheel center button positioning + Casino-style design
*/

// LilBet Fortune Wheel - ИСПРАВЛЕННАЯ ВЕРСИЯ
class LilBetFortuneWheel {
    constructor() {
        // DOM Elements
        this.wheel = document.getElementById('wheel');
        this.spinBtn = document.getElementById('spinBtn');
        this.btnText = document.getElementById('btnText');
        this.playBtn = document.getElementById('playBtn');
        this.winModal = document.getElementById('winModal');
        this.claimBtn = document.getElementById('claimBtn');
        this.winAmount = document.getElementById('winAmount');
        this.winnerHighlight = document.getElementById('winnerHighlight');
        
        // Timer Elements
        this.hoursEl = document.getElementById('hours');
        this.minutesEl = document.getElementById('minutes');
        this.secondsEl = document.getElementById('seconds');
        this.timerEl = document.getElementById('countdown');
        
        // Game State
        this.isSpinning = false;
        this.currentRotation = 0;
        
        // Wheel Configuration (исправленные призы)
        this.segments = [
            { prize: 500, text: '500₽', weight: 15 },    // segment-1
            { prize: 100, text: '100₽', weight: 5 },     // segment-2 
            { prize: 1000, text: '1000₽', weight: 80 },  // segment-3 (основной выигрыш)
            { prize: 'bonus', text: 'БОНУС', weight: 5 }, // segment-4
            { prize: 2000, text: '2000₽', weight: 3 },   // segment-5
            { prize: 500, text: '500₽', weight: 15 },    // segment-6
            { prize: 1000, text: '1000₽', weight: 80 },  // segment-7 (основной выигрыш) 
            { prize: 5000, text: '5000₽', weight: 2 }    // segment-8
        ];
        
        this.segmentAngle = 360 / this.segments.length;
        
        // Timer Configuration
        this.timeLeft = { hours: 0, minutes: 0, seconds: 45 }; // Старт с 45 секунд для демо
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.startTimer();
        this.createFloatingShapes();
        this.preloadSounds();
        this.addInitialAnimations();
        
        console.log('🎰 LilBet Fortune Wheel загружен!');
        console.log('🎯 Логика: 80% = 1000₽, 15% = 500₽, 5% = БОНУС');
    }
    
    bindEvents() {
        // ИСПРАВЛЕНО: Кнопка "КРУТИТЬ" только крутит колесо
        this.spinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.spin();
        });
        
        // Кнопка "ИГРАТЬ СЕЙЧАС" редиректит
        this.playBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.redirectToLilBet();
        });
        
        // Кнопка "ЗАБРАТЬ ВЫИГРЫШ" в модалке редиректит
        this.claimBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.redirectToLilBet();
        });
        
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
    
    // Timer Logic с красным цветом для срочности
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
                        // Reset timer
                        this.timeLeft = { hours: 0, minutes: 0, seconds: 45 };
                    }
                }
            }
            
            this.updateTimerDisplay();
            this.checkUrgentTime();
        }, 1000);
    }
    
    updateTimerDisplay() {
        this.hoursEl.textContent = this.timeLeft.hours.toString().padStart(2, '0');
        this.minutesEl.textContent = this.timeLeft.minutes.toString().padStart(2, '0');
        this.secondsEl.textContent = this.timeLeft.seconds.toString().padStart(2, '0');
    }
    
    checkUrgentTime() {
        const totalSeconds = this.timeLeft.hours * 3600 + this.timeLeft.minutes * 60 + this.timeLeft.seconds;
        
        if (totalSeconds < 60) { // Меньше 1 минуты
            this.timerEl.classList.add('urgent');
        } else {
            this.timerEl.classList.remove('urgent');
        }
    }
    
    // ГЛАВНАЯ ФУНКЦИЯ ВРАЩЕНИЯ КОЛЕСА
    spin() {
        if (this.isSpinning) return;
        
        console.log('🎰 Начинаем вращение колеса...');
        
        this.isSpinning = true;
        this.spinBtn.disabled = true;
        this.btnText.textContent = 'КРУТИТСЯ...';
        
        // Выбираем выигрышный сегмент на основе весов
        const winningSegmentIndex = this.selectWinningSegment();
        const winningSegment = this.segments[winningSegmentIndex];
        
        console.log(`🎯 Выбран сегмент ${winningSegmentIndex}: ${winningSegment.text}`);
        
        // Играем звук вращения
        this.playSpinSound();
        
        // Добавляем визуальные эффекты
        this.wheel.classList.add('spinning');
        this.addSpinEffects();
        
        // Рассчитываем финальный угол поворота
        const targetAngle = this.calculateTargetAngle(winningSegmentIndex);
        const extraRotations = 4 + Math.random() * 2; // 4-6 полных оборотов
        const finalRotation = this.currentRotation + (extraRotations * 360) + targetAngle;
        
        console.log(`🔄 Поворот на ${finalRotation}°`);
        
        // Применяем вращение
        this.wheel.style.transform = `rotate(${finalRotation}deg)`;
        this.currentRotation = finalRotation % 360;
        
        // Показываем результат через 3.5 секунды
        setTimeout(() => {
            this.stopSpin(winningSegmentIndex, winningSegment);
        }, 3500);
    }
    
    selectWinningSegment() {
        // Продвинутая логика выбора на основе весов
        const totalWeight = this.segments.reduce((sum, segment) => sum + segment.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < this.segments.length; i++) {
            random -= this.segments[i].weight;
            if (random <= 0) {
                return i;
            }
        }
        
        return 2; // Fallback to 1000₽ segment
    }
    
    calculateTargetAngle(segmentIndex) {
        // Рассчитываем угол для точного попадания указателя на сегмент
        const segmentCenter = segmentIndex * this.segmentAngle + (this.segmentAngle / 2);
        // Указатель находится сверху (0°), поэтому нужно развернуть на нужный угол
        return 360 - segmentCenter;
    }
    
    stopSpin(segmentIndex, segment) {
        console.log(`✨ Колесо остановилось! Выигрыш: ${segment.text}`);
        
        this.isSpinning = false;
        this.wheel.classList.remove('spinning');
        this.spinBtn.disabled = false;
        this.btnText.textContent = 'КРУТИТЬ';
        
        // Тряска экрана при остановке
        this.shakeScreen();
        
        // Подсветка выигрышного сектора
        this.highlightWinnerSegment(segmentIndex);
        
        // Показываем результат через небольшую задержку
        setTimeout(() => {
            this.showWinResult(segment);
        }, 500);
    }
    
    showWinResult(segment) {
        // Обновляем сумму выигрыша в модалке
        if (segment.prize === 'bonus') {
            this.winAmount.textContent = 'ФРИСПИНЫ';
        } else {
            this.winAmount.textContent = `${segment.prize}₽`;
        }
        
        // Показываем модалку
        this.showModal();
        
        // Запускаем конфетти
        this.createConfetti();
        
        // Играем звук выигрыша
        this.playWinSound();
        
        // Вспышка экрана
        this.addWinFlash();
    }
    
    // Тряска экрана при остановке колеса
    shakeScreen() {
        document.body.style.animation = 'screenShake 0.6s ease-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 600);
        
        if (!document.querySelector('#screen-shake-style')) {
            const style = document.createElement('style');
            style.id = 'screen-shake-style';
            style.textContent = `
                @keyframes screenShake {
                    0%, 100% { transform: translateX(0); }
                    10% { transform: translateX(-3px) translateY(-1px); }
                    20% { transform: translateX(3px) translateY(1px); }
                    30% { transform: translateX(-2px) translateY(-1px); }
                    40% { transform: translateX(2px) translateY(1px); }
                    50% { transform: translateX(-1px) translateY(-1px); }
                    60% { transform: translateX(1px) translateY(1px); }
                    70% { transform: translateX(-1px) translateY(-1px); }
                    80% { transform: translateX(1px) translateY(1px); }
                    90% { transform: translateX(0); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Подсветка выигрышного сектора
    highlightWinnerSegment(segmentIndex) {
        // Поворачиваем подсветку на нужный сегмент
        const angle = segmentIndex * this.segmentAngle;
        this.winnerHighlight.style.background = `conic-gradient(
            from ${angle}deg,
            transparent 0deg ${angle}deg,
            rgba(255, 0, 255, 0.4) ${angle}deg ${angle + this.segmentAngle}deg,
            transparent ${angle + this.segmentAngle}deg 360deg
        )`;
        
        this.winnerHighlight.classList.add('show');
        
        // Убираем подсветку через 3 секунды
        setTimeout(() => {
            this.winnerHighlight.classList.remove('show');
        }, 3000);
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
    
    // Visual Effects
    addSpinEffects() {
        // Усиливаем свечение во время вращения (уже в CSS .wheel.spinning)
        setTimeout(() => {
            if (!this.isSpinning) {
                this.wheel.classList.remove('spinning');
            }
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
            animation: flashWin 1s ease-out;
        `;
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 1000);
        
        if (!document.querySelector('#flash-win-style')) {
            const style = document.createElement('style');
            style.id = 'flash-win-style';
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
    
    // Confetti System с цветами бренда
    createConfetti() {
        const confettiCount = 60;
        const colors = ['#34cc67', '#ff00ff', '#ffffff', '#2fb557', '#082b53'];
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                this.createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
            }, i * 30);
        }
    }
    
    createConfettiPiece(color) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.cssText = `
            position: fixed;
            width: ${Math.random() * 12 + 6}px;
            height: ${Math.random() * 12 + 6}px;
            background: ${color};
            top: -20px;
            left: ${Math.random() * 100}vw;
            z-index: 1001;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            animation: confettiFall ${2 + Math.random() * 3}s ease-out forwards;
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
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API не поддерживается');
        }
    }
    
    playSpinSound() {
        // Звук тик-тик при вращении
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.playBeep(200, 50); // Короткий тик
            }, i * 400);
        }
        
        // Визуальная обратная связь
        document.body.style.animation = 'spinVibration 0.5s ease-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
        
        if (!document.querySelector('#spin-vibration-style')) {
            const style = document.createElement('style');
            style.id = 'spin-vibration-style';
            style.textContent = `
                @keyframes spinVibration {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-1px); }
                    75% { transform: translateX(1px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    playWinSound() {
        // Звон при выигрыше - мелодичная последовательность
        const melody = [523, 659, 784, 1047]; // C, E, G, C
        melody.forEach((freq, index) => {
            setTimeout(() => {
                this.playBeep(freq, 300);
            }, index * 150);
        });
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
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        } catch (e) {
            console.log('Ошибка воспроизведения звука:', e);
        }
    }
    
    // Background Animations
    createFloatingShapes() {
        setInterval(() => {
            if (document.querySelectorAll('.floating-particle').length < 6) {
                this.createFloatingParticle();
            }
        }, 4000);
    }
    
    createFloatingParticle() {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
            position: fixed;
            width: ${Math.random() * 8 + 4}px;
            height: ${Math.random() * 8 + 4}px;
            background: #34cc67;
            border-radius: 50%;
            bottom: -15px;
            left: ${Math.random() * 100}vw;
            z-index: 0;
            opacity: ${Math.random() * 0.4 + 0.2};
            animation: floatUp ${10 + Math.random() * 6}s linear forwards;
            pointer-events: none;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 16000);
        
        if (!document.querySelector('#float-up-style')) {
            const style = document.createElement('style');
            style.id = 'float-up-style';
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
        // Анимация появления колеса
        this.wheel.style.transform = 'rotate(0deg) scale(0.8)';
        this.wheel.style.opacity = '0';
        this.wheel.style.transition = 'all 1.2s ease-out';
        
        setTimeout(() => {
            this.wheel.style.transform = 'rotate(0deg) scale(1)';
            this.wheel.style.opacity = '1';
        }, 300);
        
        // Параллакс эффект для фоновых фигур
        this.addParallaxEffect();
    }
    
    addParallaxEffect() {
        window.addEventListener('mousemove', (e) => {
            const shapes = document.querySelectorAll('.floating-shape');
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 0.03;
                const x = (mouseX - 0.5) * speed * 50;
                const y = (mouseY - 0.5) * speed * 50;
                
                shape.style.transform += ` translate(${x}px, ${y}px)`;
            });
        });
    }
    
    // Navigation
    redirectToLilBet() {
        const btn = event.target;
        const originalText = btn.textContent;
        
        // Анимация кнопки
        btn.textContent = 'ПЕРЕХОД...';
        btn.disabled = true;
        
        // Эффект перехода
        this.createRedirectEffect();
        
        // Открываем сайт
        setTimeout(() => {
            window.open('https://lil.bet', '_blank');
            
            // Возвращаем кнопку в исходное состояние
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 1500);
        }, 800);
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
            animation: redirectPulse 1.5s ease-out;
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 1500);
        
        if (!document.querySelector('#redirect-pulse-style')) {
            const style = document.createElement('style');
            style.id = 'redirect-pulse-style';
            style.textContent = `
                @keyframes redirectPulse {
                    0% { opacity: 0; }
                    30% { opacity: 0.3; }
                    60% { opacity: 0.1; }
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
class LilBetPageEnhancer {
    constructor() {
        this.init();
    }
    
    init() {
        this.addInteractiveEffects();
        this.addScrollEffects();
        this.addAccessibility();
        this.optimizePerformance();
    }
    
    addInteractiveEffects() {
        // Hover эффекты для всех кнопок
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform += ' scale(1.02)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = btn.style.transform.replace(' scale(1.02)', '');
            });
            
            // Звук клика кнопки
            btn.addEventListener('click', () => {
                this.playClickSound();
            });
        });
    }
    
    addScrollEffects() {
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
        
        if (scrollY > 100) {
            header.style.background = 'rgba(8, 43, 83, 0.95)';
            header.style.backdropFilter = 'blur(15px)';
            header.style.borderBottom = '1px solid rgba(52, 204, 103, 0.3)';
        } else {
            header.style.background = 'transparent';
            header.style.backdropFilter = 'none';
            header.style.borderBottom = 'none';
        }
    }
    
    playClickSound() {
        // Простой звук клика
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Тихий fallback
        }
    }
    
    addAccessibility() {
        // ARIA labels и focus indicators
        const spinBtn = document.getElementById('spinBtn');
        const playBtn = document.getElementById('playBtn');
        const claimBtn = document.getElementById('claimBtn');
        
        if (spinBtn) spinBtn.setAttribute('aria-label', 'Крутить колесо фортуны');
        if (playBtn) playBtn.setAttribute('aria-label', 'Перейти к игре на LilBet');
        if (claimBtn) claimBtn.setAttribute('aria-label', 'Забрать выигрыш');
        
        // Focus indicators
        const style = document.createElement('style');
        style.textContent = `
            button:focus {
                outline: 3px solid #34cc67;
                outline-offset: 2px;
            }
            
            .wheel-center-btn:focus {
                outline: 4px solid #ff00ff;
            }
        `;
        document.head.appendChild(style);
    }
    
    optimizePerformance() {
        // Проверка предпочтений пользователя по анимациям
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.documentElement.style.setProperty('--animation-duration', '0.1s');
        }
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const fortuneWheel = new LilBetFortuneWheel();
    const pageEnhancer = new LilBetPageEnhancer();
    
    console.log('🎰 LilBet Casino - Полностью исправленная версия загружена!');
    console.log('✅ Кнопка "КРУТИТЬ" теперь крутит колесо');
    console.log('✅ Добавлены звуки, тряска, подсветка победителя');
    console.log('✅ Таймер с красным цветом при <1 минуты');
    console.log('✅ Продвинутая логика выигрышей');
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        fortuneWheel.destroy();
    });
});