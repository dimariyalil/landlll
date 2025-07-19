// Fortune Wheel Game Logic
class FortuneWheel {
    constructor() {
        this.wheel = document.getElementById('fortuneWheel');
        this.spinButton = document.getElementById('spinButton');
        this.playButton = document.getElementById('playButton');
        this.isSpinning = false;
        this.currentRotation = 0;
        
        // Prize values corresponding to wheel sectors
        this.prizes = [100, 500, 1000, 50, 2000, 250, 5000, 75];
        this.sectors = 8;
        this.sectorAngle = 360 / this.sectors;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.createParticles();
    }
    
    bindEvents() {
        this.spinButton.addEventListener('click', () => this.spin());
        this.playButton.addEventListener('click', () => this.redirectToGame());
        
        // Add hover effects
        this.spinButton.addEventListener('mouseenter', () => this.addGlow());
        this.spinButton.addEventListener('mouseleave', () => this.removeGlow());
    }
    
    spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.spinButton.style.pointerEvents = 'none';
        this.spinButton.innerHTML = '<span>КРУТИТСЯ...</span>';
        
        // Generate random rotation (3-5 full rotations + random sector)
        const randomSector = Math.floor(Math.random() * this.sectors);
        const extraRotations = 3 + Math.random() * 2; // 3-5 rotations
        const finalRotation = this.currentRotation + (extraRotations * 360) + (randomSector * this.sectorAngle);
        
        // Apply rotation with smooth animation
        this.wheel.style.transform = `rotate(${finalRotation}deg)`;
        this.currentRotation = finalRotation % 360;
        
        // Play spin sound (simulated)
        this.playSpinSound();
        
        // Show result after animation
        setTimeout(() => {
            this.showResult(randomSector);
            this.isSpinning = false;
            this.spinButton.style.pointerEvents = 'auto';
            this.spinButton.innerHTML = '<span>ВРАЩАТЬ</span>';
        }, 3000);
    }
    
    showResult(sectorIndex) {
        const prize = this.prizes[sectorIndex];
        this.createWinPopup(prize);
        this.triggerConfetti();
        this.playWinSound();
    }
    
    createWinPopup(prize) {
        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.className = 'win-popup-overlay';
        overlay.innerHTML = `
            <div class="win-popup">
                <div class="win-content">
                    <div class="win-icon">🎉</div>
                    <h2 class="win-title">ПОЗДРАВЛЯЕМ!</h2>
                    <div class="win-amount">${prize}₽</div>
                    <p class="win-text">Вы выиграли бонус!</p>
                    <button class="win-button" onclick="this.parentElement.parentElement.parentElement.remove()">
                        ЗАБРАТЬ ВЫИГРЫШ
                    </button>
                </div>
            </div>
        `;
        
        // Add styles for popup
        const style = document.createElement('style');
        style.textContent = `
            .win-popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                animation: fadeIn 0.3s ease;
            }
            
            .win-popup {
                background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
                border: 3px solid #ffd700;
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                animation: popIn 0.5s ease;
                max-width: 400px;
                margin: 20px;
            }
            
            .win-icon {
                font-size: 4rem;
                margin-bottom: 20px;
                animation: bounce 1s ease infinite;
            }
            
            .win-title {
                font-family: 'Cinzel', serif;
                font-size: 2rem;
                color: #ffd700;
                margin-bottom: 20px;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            
            .win-amount {
                font-size: 3rem;
                font-weight: bold;
                color: #ffd700;
                margin-bottom: 15px;
                text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
            }
            
            .win-text {
                font-size: 1.2rem;
                color: #e0e0e0;
                margin-bottom: 30px;
            }
            
            .win-button {
                background: linear-gradient(45deg, #ff6b35 0%, #f7931e 50%, #ff6b35 100%);
                border: none;
                border-radius: 25px;
                padding: 15px 30px;
                font-size: 1.1rem;
                font-weight: bold;
                color: white;
                cursor: pointer;
                text-transform: uppercase;
                letter-spacing: 1px;
                transition: all 0.3s ease;
                box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
            }
            
            .win-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 35px rgba(255, 107, 53, 0.6);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes popIn {
                from { transform: scale(0.5); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(overlay);
    }
    
    triggerConfetti() {
        // Create confetti animation
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                this.createConfettiPiece();
            }, i * 100);
        }
    }
    
    createConfettiPiece() {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${this.getRandomColor()};
            top: -10px;
            left: ${Math.random() * 100}vw;
            z-index: 999;
            border-radius: 50%;
            animation: confettiFall 3s ease-out forwards;
        `;
        
        document.body.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 3000);
        
        // Add confetti animation if not exists
        if (!document.querySelector('#confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confettiFall {
                    to {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    getRandomColor() {
        const colors = ['#ffd700', '#ff6b35', '#f7931e', '#ff4757', '#5352ed', '#70a1ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    addGlow() {
        this.spinButton.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.8)';
    }
    
    removeGlow() {
        this.spinButton.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.3)';
    }
    
    playSpinSound() {
        // Simulate sound with visual feedback
        document.body.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
        
        // Add shake animation if not exists
        if (!document.querySelector('#shake-style')) {
            const style = document.createElement('style');
            style.id = 'shake-style';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-2px); }
                    75% { transform: translateX(2px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    playWinSound() {
        // Visual feedback for win
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
            pointer-events: none;
            z-index: 998;
            animation: flashWin 0.5s ease-out;
        `;
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 500);
        
        // Add flash animation if not exists
        if (!document.querySelector('#flash-style')) {
            const style = document.createElement('style');
            style.id = 'flash-style';
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
    
    redirectToGame() {
        // Simulate redirect to game
        this.showGameModal();
    }
    
    showGameModal() {
        const modal = document.createElement('div');
        modal.className = 'game-modal-overlay';
        modal.innerHTML = `
            <div class="game-modal">
                <div class="game-content">
                    <h2>Добро пожаловать в LilBet!</h2>
                    <p>Зарегистрируйтесь сейчас и получите:</p>
                    <ul>
                        <li>✨ Бонус +200% к первому депозиту</li>
                        <li>🎰 Доступ к 1000+ играм</li>
                        <li>⚡ Мгновенные выплаты</li>
                        <li>🎁 Ежедневные бонусы</li>
                    </ul>
                    <div class="game-buttons">
                        <button class="register-btn">РЕГИСТРАЦИЯ</button>
                        <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">Закрыть</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .game-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1001;
                animation: fadeIn 0.3s ease;
            }
            
            .game-modal {
                background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #ffd700;
                border-radius: 15px;
                padding: 40px;
                max-width: 500px;
                margin: 20px;
                text-align: center;
            }
            
            .game-content h2 {
                font-family: 'Cinzel', serif;
                color: #ffd700;
                margin-bottom: 20px;
                font-size: 1.8rem;
            }
            
            .game-content p {
                color: #e0e0e0;
                margin-bottom: 20px;
                font-size: 1.1rem;
            }
            
            .game-content ul {
                text-align: left;
                margin: 20px 0;
                color: #e0e0e0;
            }
            
            .game-content li {
                margin: 10px 0;
                font-size: 1rem;
            }
            
            .game-buttons {
                margin-top: 30px;
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .register-btn {
                background: linear-gradient(45deg, #ff6b35 0%, #f7931e 50%, #ff6b35 100%);
                border: none;
                border-radius: 25px;
                padding: 15px 30px;
                font-size: 1.1rem;
                font-weight: bold;
                color: white;
                cursor: pointer;
                text-transform: uppercase;
                transition: all 0.3s ease;
            }
            
            .register-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(255, 107, 53, 0.6);
            }
            
            .close-btn {
                background: transparent;
                border: 2px solid #666;
                border-radius: 25px;
                padding: 15px 30px;
                color: #e0e0e0;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .close-btn:hover {
                border-color: #ffd700;
                color: #ffd700;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
    }
    
    createParticles() {
        // Create floating particles for atmosphere
        setInterval(() => {
            if (document.querySelectorAll('.floating-particle').length < 10) {
                this.createFloatingParticle();
            }
        }, 2000);
    }
    
    createFloatingParticle() {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: #ffd700;
            border-radius: 50%;
            bottom: -10px;
            left: ${Math.random() * 100}vw;
            z-index: 1;
            opacity: 0.6;
            animation: floatUp 8s linear forwards;
            pointer-events: none;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 8000);
        
        // Add float animation if not exists
        if (!document.querySelector('#float-style')) {
            const style = document.createElement('style');
            style.id = 'float-style';
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
}

// Enhanced Page Interactions
class PageEnhancer {
    constructor() {
        this.init();
    }
    
    init() {
        this.addScrollEffects();
        this.addHoverEffects();
        this.addLoadingAnimation();
    }
    
    addScrollEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const header = document.querySelector('.header');
            
            if (scrolled > 100) {
                header.style.background = 'rgba(26, 26, 46, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.background = 'transparent';
                header.style.backdropFilter = 'none';
            }
        });
    }
    
    addHoverEffects() {
        const features = document.querySelectorAll('.feature-item');
        features.forEach(feature => {
            feature.addEventListener('mouseenter', () => {
                feature.style.transform = 'translateY(-10px)';
                feature.style.transition = 'transform 0.3s ease';
            });
            
            feature.addEventListener('mouseleave', () => {
                feature.style.transform = 'translateY(0)';
            });
        });
    }
    
    addLoadingAnimation() {
        window.addEventListener('load', () => {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 1s ease';
            
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 100);
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const fortuneWheel = new FortuneWheel();
    const pageEnhancer = new PageEnhancer();
    
    // Add some extra visual flair
    setTimeout(() => {
        console.log('🎰 LilBet Casino - Gate of Olympus загружен! 🎰');
    }, 1000);
});