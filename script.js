// Canvas and Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Variables
let gameRunning = false;
let playerScore = 0;
let computerScore = 0;
const WINNING_SCORE = 10;

// Paddle Object
const paddleWidth = 10;
const paddleHeight = 80;

const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6,
    mouseY: 0
};

const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5
};

// Ball Object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: 5,
    dy: 5,
    speed: 5,
    maxSpeed: 8
};

// Keyboard Input
const keys = {
    ArrowUp: false,
    ArrowDown: false
};

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        keys[e.key] = false;
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    player.mouseY = e.clientY - rect.top;
});

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Start Game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        document.getElementById('startBtn').disabled = true;
        gameLoop();
    }
}

// Reset Game
function resetGame() {
    gameRunning = false;
    playerScore = 0;
    computerScore = 0;
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('gameOverMessage').style.display = 'none';
    resetBall();
}

// Reset Ball
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed;
    player.y = canvas.height / 2 - paddleHeight / 2;
    computer.y = canvas.height / 2 - paddleHeight / 2;
}

// Update Player Paddle
function updatePlayer() {
    // Mouse control
    if (player.mouseY > 0) {
        player.y = player.mouseY - player.height / 2;
    }
    
    // Arrow key control
    if (keys['ArrowUp']) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown']) {
        player.y += player.speed;
    }

    // Boundary detection
    if (player.y < 0) {
        player.y = 0;
    }
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

// Update Computer Paddle (AI)
function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    
    // AI difficulty - tracks ball with slight delay
    if (computerCenter < ballCenter - 35) {
        computer.y += computer.speed;
    } else if (computerCenter > ballCenter + 35) {
        computer.y -= computer.speed;
    }

    // Boundary detection
    if (computer.y < 0) {
        computer.y = 0;
    }
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

// Update Ball
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Left wall - computer scores
    if (ball.x - ball.radius < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        checkGameOver();
        resetBall();
        return;
    }

    // Right wall - player scores
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        checkGameOver();
        resetBall();
        return;
    }

    // Player paddle collision
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const deltaY = ball.y - (player.y + player.height / 2);
        ball.dy += deltaY * 0.1;
        
        // Increase speed slightly
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (speed < ball.maxSpeed) {
            ball.dx *= 1.05;
            ball.dy *= 1.05;
        }
    }

    // Computer paddle collision
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        const deltaY = ball.y - (computer.y + computer.height / 2);
        ball.dy += deltaY * 0.1;
        
        // Increase speed slightly
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (speed < ball.maxSpeed) {
            ball.dx *= 1.05;
            ball.dy *= 1.05;
        }
    }
}

// Draw Functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff88';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function drawBall() {
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff00ff';
}

function drawCenter() {
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.setLineDash([5, 15]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw center line
    drawCenter();

    // Draw paddles
    drawPaddle(player);
    drawPaddle(computer);

    // Draw ball
    drawBall();

    // Reset shadow
    ctx.shadowBlur = 0;
}

// Check Game Over
function checkGameOver() {
    if (playerScore >= WINNING_SCORE) {
        endGame('🎉 YOU WIN! 🎉');
    } else if (computerScore >= WINNING_SCORE) {
        endGame('💻 COMPUTER WINS! 💻');
    }
}

// End Game
function endGame(message) {
    gameRunning = false;
    document.getElementById('winnerMessage').textContent = message;
    document.getElementById('gameOverMessage').style.display = 'flex';
    document.getElementById('gameOverMessage').style.justifyContent = 'center';
    document.getElementById('gameOverMessage').style.alignItems = 'center';
    document.getElementById('gameOverMessage').style.flexDirection = 'column';
}

// Game Loop
function gameLoop() {
    if (!gameRunning) return;

    updatePlayer();
    updateComputer();
    updateBall();
    draw();

    requestAnimationFrame(gameLoop);
}

// Initial setup
resetBall();
draw();
