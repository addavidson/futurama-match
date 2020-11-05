class AudioController {
    constructor() {
        this.bgMusic = new Audio('assets/audio/FuturamaEndTheme.mp3');
        this.flipSound = new Audio('assets/audio/flip.wav');
        this.matchSound = new Audio('assets/audio/match.wav');
        this.winSound = new Audio('assets/audio/victory.wav');
        this.winSound2 = new Audio('assets/audio/woo.mp3')
        this.gameOverSound = new Audio('assets/audio/gameover.wav');
        this.gameOverSound2 = new Audio('assets/audio/noo.mp3')
        // background music control
        this.bgMusic.volume = 0.3;
        this.bgMusic.loop = true;
        // other sound controls
        this.gameOverSound2.volume = 0.3;
    }

    // sound functions
    startMusic() {
        this.bgMusic.play();
    }

    stopMusic () {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }

    flip() {
        this.flipSound.play();
    }

    match() {
        this.matchSound.play();
    }

    win() {
        this.stopMusic();
        this.winSound.play();
        this.winSound2.play();
    }

    gameOver() {
        this.stopMusic();
        this.gameOverSound.play();
        this.gameOverSound2.play();
    }
}

class matchingGame {
    constructor(totalTime, cards) {
        this.cardsArray = cards;
        this.totalTime = totalTime;
        this.timeRemaining = totalTime;
        this.timer = document.getElementById('time-remaining');
        this.matches = document.getElementById('card-matches');
        this.turns = document.getElementById('turns');
        this.audioController = new AudioController();
    }

    startGame() {
        this.cardsToCheck = null;
        this.totalClicks = 0;
        this.totalMatches = 0;
        this.timeRemaining = this.totalTime;
        this.matchedCards = [];
        this.busy = true;

        setTimeout(() => {
            this.audioController.startMusic();
            this.shuffleCards();
            this.countDown = this.startCountDown();
            this.busy = false;
        }, 500);
        
        this.hideCards();
        this.timer.innerText = this.timeRemaining;
        this.turns.innerText = this.totalClicks;
        this.matches.innerText = this.totalMatches;
    }

    hideCards() {
        this.cardsArray.forEach(card => {
            card.classList.remove('visible');
            card.classList.remove('matched');
        });
    }

    flipCard(card) {
        if(this.canFlipCard(card)) {
            this.audioController.flip();
            this.totalClicks++;
            this.turns.innerText = this.totalClicks;
            card.classList.add('visible');

            if(this.cardsToCheck) {
                this.checkForCardMatch(card);
            } else {
                this.cardsToCheck = card;
            }
        }
    }

    checkForCardMatch(card) {
        if(this.getCardType(card) === this.getCardType(this.cardsToCheck)) {
            this.cardMatch(card, this.cardsToCheck);
        } else {
            this.cardNotMatched(card, this.cardsToCheck);
        }
        
        this.cardsToCheck = null;
    }

    cardMatch(card1, card2) {
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.audioController.match();

        if(this.matchedCards.length === this.cardsArray.length) {
            this.win();
        }
        this.matches.innerText = this.matchedCards.length/2
    }

    cardNotMatched(card1, card2) {
        this.busy = true;
        setTimeout(() => {
            card1.classList.remove('visible');
            card2.classList.remove('visible');
            this.busy = false;
        }, 1000);
    }

    getCardType(card) {
        return card.getElementsByClassName('card-value')[0].src;
    }

    startCountDown() {
        return setInterval(() => {
            this.timeRemaining--;
            this.timer.innerText = this.timeRemaining;
            if(this.timeRemaining === 0) {
                this.gameOver();
            }
        }, 1000);
    }

    gameOver() {
        clearInterval(this.countDown);
        this.audioController.gameOver();
        document.getElementById('game-over-text').classList.add('visible');
        this.matches.innerText = 0;
    }

    win() {
        this.matches.innerHTML = 0;
        clearInterval(this.countDown);
        this.audioController.win();
        document.getElementById('win-text').classList.add('visible');
    }

    // fisher-yates shuffle
    shuffleCards() {
        for(let i = this.cardsArray.length - 1; i > 0; i--) {
            let randIndex = Math.floor(Math.random() * (i+1));
            this.cardsArray[randIndex].style.order = i;
            this.cardsArray[i].style.order = randIndex;
        }
    }

    canFlipCard(card) {
        return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck;
    }
}

function ready() {
    let overlays = Array.from(document.getElementsByClassName('overlay-text'));
    let cards = Array.from(document.getElementsByClassName('card'));
    let endGameButton = document.getElementById('end-game-btn');
    var game = new matchingGame(60, cards);
    
    // game over button
    endGameButton.addEventListener('click', () => {
        game.gameOver();
    });

    overlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            overlay.classList.remove('visible');
            game.startGame();
        });
    });
    cards.forEach(card => {
        card.addEventListener('click', () => {
            game.flipCard(card);
        });
    });
}

// to prevent js from loading before html
if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready());
} else {
    ready();
}