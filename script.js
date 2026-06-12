// ========== 获取所有元素 ==========
const cakeSection = document.getElementById('cakeSection');
const gobangSection = document.getElementById('gobangSection');
const cake = document.getElementById('cake');
const candle = document.getElementById('candle');
const flame = document.querySelector('.flame');
const message = document.getElementById('message');

const winModal = document.getElementById('winModal');
const rewardMessageModal = document.getElementById('rewardMessageModal');
const passwordModal = document.getElementById('passwordModal');
const blindboxModal = document.getElementById('blindboxModal');
const eggModal = document.getElementById('eggModal');
const hatchingModal = document.getElementById('hatchingModal');
const ballModal = document.getElementById('ballModal');
const contractModal = document.getElementById('contractModal');
const contractImg = document.getElementById('contractImg');
const finalScreen = document.getElementById('finalScreen');
const closeFinalBtn = document.getElementById('closeFinalBtn');
const catLetterModal = document.getElementById('catLetterModal');
const openLetterBtn = document.getElementById('openLetterBtn');
const letterScreen = document.getElementById('letterScreen');
const closeLetterBtn = document.getElementById('closeLetterBtn');

let step = 1;
let gameOver = false;
let currentPlayer = 1;
let myScore = 0;
let hisScore = 0;

// ========== 蛋糕 + 录音 ==========
let voice = null;
try { voice = new Audio('images/voice.mp3'); voice.load(); } catch(e) {}
function playVoice() { if (voice) voice.play().catch(e => console.log('录音失败')); }

if (cake) {
    cake.addEventListener('click', () => {
        if (step === 1) { cake.src = 'images/cake-with-candle.png'; step = 2; playVoice(); }
        else if (step === 2 && candle) { candle.classList.remove('hidden'); step = 3; }
    });
}

if (candle) {
    candle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (step === 3 && flame && !flame.classList.contains('blow-out')) {
            flame.classList.add('blow-out');
            setTimeout(() => {
                flame.style.display = 'none';
                message.classList.remove('hidden');
                const prompt = document.createElement('div');
                prompt.textContent = '✨ 点击任意位置，开始下棋 ✨';
                prompt.style.cssText = 'position:fixed;bottom:30%;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);color:#ffd700;padding:12px 24px;border-radius:50px;z-index:1000;font-family:华文楷书;';
                document.body.appendChild(prompt);
                const start = () => {
                    prompt.remove();
                    cakeSection.style.display = 'none';
                    gobangSection.classList.remove('hidden');
                    initGobang();
                    document.removeEventListener('click', start);
                };
                document.addEventListener('click', start);
            }, 300);
            step = 4;
        }
    });
}

// ========== 五子棋 ==========
const canvas = document.getElementById('gobangCanvas');
const ctx = canvas?.getContext('2d');
const resetGameBtn = document.getElementById('resetGameBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const myScoreSpan = document.getElementById('myScore');
const hisScoreSpan = document.getElementById('hisScore');

const boardSize = 15;
let board = [];
const cellSize = canvas ? canvas.width / boardSize : 0;

function initBoard() {
    board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
    gameOver = false;
    currentPlayer = 1;
    drawBoard();
}

function drawBoard() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#5a3e2b';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < boardSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === 0) continue;
            ctx.beginPath();
            ctx.arc(i * cellSize, j * cellSize, cellSize * 0.4, 0, 2 * Math.PI);
            ctx.fillStyle = board[i][j] === 1 ? '#2b2b2b' : '#f9f9fc';
            ctx.fill();
        }
    }
}

function checkWin(x, y, player) {
    const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
    for (let [dx, dy] of dirs) {
        let count = 1;
        for (let s = 1; s <= 5; s++) {
            let nx = x + dx * s, ny = y + dy * s;
            if (nx < 0 || ny < 0 || nx >= boardSize || ny >= boardSize) break;
            if (board[nx][ny] === player) count++;
            else break;
        }
        for (let s = 1; s <= 5; s++) {
            let nx = x - dx * s, ny = y - dy * s;
            if (nx < 0 || ny < 0 || nx >= boardSize || ny >= boardSize) break;
            if (board[nx][ny] === player) count++;
            else break;
        }
        if (count >= 5) return true;
    }
    return false;
}

function computerMove() {
    if (gameOver || currentPlayer !== 2) return;
    let empty = [];
    for (let i = 0; i < boardSize; i++)
        for (let j = 0; j < boardSize; j++)
            if (board[i][j] === 0) empty.push([i, j]);
    if (empty.length === 0) return;
    let [row, col] = empty[Math.floor(Math.random() * empty.length)];
    board[row][col] = 2;
    drawBoard();
    if (checkWin(row, col, 2)) {
        hisScore++;
        hisScoreSpan.innerText = hisScore;
        gameOver = true;
        return;
    }
    currentPlayer = 1;
}

function placePiece(row, col) {
    if (gameOver || currentPlayer !== 1 || board[row][col] !== 0) return;
    board[row][col] = 1;
    drawBoard();
    if (checkWin(row, col, 1)) {
        gameOver = true;
        myScore++;
        myScoreSpan.innerText = myScore;
        winModal.classList.remove('hidden');
        return;
    }
    currentPlayer = 2;
    setTimeout(computerMove, 200);
}

if (canvas) {
    canvas.addEventListener('click', (e) => {
        if (gameOver) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        const row = Math.round(mouseX / cellSize);
        const col = Math.round(mouseY / cellSize);
        if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
            placePiece(row, col);
        }
    });
}

function resetGame() { initBoard(); gameOver = false; currentPlayer = 1; }
function resetScore() { myScore = 0; hisScore = 0; myScoreSpan.innerText = '0'; hisScoreSpan.innerText = '0'; resetGame(); }

if (resetGameBtn) resetGameBtn.addEventListener('click', resetGame);
if (resetScoreBtn) resetScoreBtn.addEventListener('click', resetScore);

function initGobang() {
    initBoard();
    myScore = 0;
    hisScore = 0;
    myScoreSpan.innerText = '0';
    hisScoreSpan.innerText = '0';
    gameOver = false;
    currentPlayer = 1;
}

// ========== 赢棋按钮 ==========
document.getElementById('continueBtn')?.addEventListener('click', () => {
    winModal.classList.add('hidden');
    resetGame();
});
document.getElementById('rewardBtn')?.addEventListener('click', () => {
    winModal.classList.add('hidden');
    rewardMessageModal.classList.remove('hidden');
});

// ========== 密码锁 ==========
let currentPassword = [0, 0, 0];
const correctPassword = [5, 2, 1];

function updateDisplay() {
    document.getElementById('digit1').textContent = currentPassword[0];
    document.getElementById('digit2').textContent = currentPassword[1];
    document.getElementById('digit3').textContent = currentPassword[2];
}

document.querySelectorAll('.digit-up').forEach(btn => {
    btn.addEventListener('click', () => {
        let idx = parseInt(btn.dataset.digit);
        currentPassword[idx] = (currentPassword[idx] + 1) % 10;
        updateDisplay();
    });
});
document.querySelectorAll('.digit-down').forEach(btn => {
    btn.addEventListener('click', () => {
        let idx = parseInt(btn.dataset.digit);
        currentPassword[idx] = (currentPassword[idx] - 1 + 10) % 10;
        updateDisplay();
    });
});

document.getElementById('hintBtn')?.addEventListener('click', () => {
    document.getElementById('hintText').classList.toggle('hidden');
});
document.getElementById('closeRewardBtn')?.addEventListener('click', () => {
    rewardMessageModal.classList.add('hidden');
    passwordModal.classList.remove('hidden');
});
document.getElementById('unlockBtn')?.addEventListener('click', () => {
    if (currentPassword[0] === 5 && currentPassword[1] === 2 && currentPassword[2] === 1) {
        passwordModal.classList.add('hidden');
        blindboxModal.classList.remove('hidden');
    } else {
        let err = document.getElementById('passwordError');
        err.classList.remove('hidden');
        setTimeout(() => err.classList.add('hidden'), 2000);
    }
});

// ========== 盲盒 ==========
const boxes = ['blindbox1', 'blindbox2', 'blindbox3'];
const chars = ['character1', 'character2', 'character3'];
boxes.forEach((boxId, i) => {
    document.getElementById(boxId)?.addEventListener('click', () => {
        chars.forEach(c => document.getElementById(c)?.classList.add('hidden'));
        document.getElementById(chars[i])?.classList.remove('hidden');
    });
});

document.getElementById('closeBlindboxBtn')?.addEventListener('click', () => {
    blindboxModal.classList.add('hidden');
    eggModal.classList.remove('hidden');
});

// ========== 精灵蛋 ==========
document.querySelectorAll('.accept-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        eggModal.classList.add('hidden');
        hatchingModal.classList.remove('hidden');
        setTimeout(() => {
            hatchingModal.classList.add('hidden');
            ballModal.classList.remove('hidden');
        }, 2000);
    });
});

// ========== 契约球 ==========
document.querySelectorAll('.ball-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        let type = btn.dataset.ball;
        let src = '';
        if (type === 'prism') {
            src = 'images/prism-ball.png';
            ballModal.classList.add('hidden');
            contractImg.src = src;
            contractModal.classList.remove('hidden');
            
            // 棱镜球：显示最终结局的监听
            const closeContractBtn = document.getElementById('closeContractBtn');
            if (closeContractBtn) {
                // 移除之前的监听，避免重复
                const newCloseBtn = closeContractBtn.cloneNode(true);
                closeContractBtn.parentNode.replaceChild(newCloseBtn, closeContractBtn);
                
                newCloseBtn.addEventListener('click', () => {
                    if (contractModal) contractModal.classList.add('hidden');
                    
                    // 显示最终结局
                    setTimeout(() => {
                        const finalScreen = document.getElementById('finalScreen');
                        if (finalScreen) finalScreen.classList.remove('hidden');
                    }, 100);
                });
            }
        } else if (type === 'king') {
            src = 'images/king-ball.png';
            ballModal.classList.add('hidden');
            contractImg.src = src;
            contractModal.classList.remove('hidden');
            
            // 国王球：只显示图片，不继续下一步
            const tempCloseBtn = document.getElementById('closeContractBtn');
            if (tempCloseBtn) {
                const newBtn = tempCloseBtn.cloneNode(true);
                tempCloseBtn.parentNode.replaceChild(newBtn, tempCloseBtn);
                newBtn.addEventListener('click', () => {
                    if (contractModal) contractModal.classList.add('hidden');
                    // 没有下一步，直接关闭
                });
            }
        } else if (type === 'magic') {
            src = 'images/magic-ball.png';
            ballModal.classList.add('hidden');
            contractImg.src = src;
            contractModal.classList.remove('hidden');
            
            // 美妙球：只显示图片，不继续下一步
            const tempCloseBtn = document.getElementById('closeContractBtn');
            if (tempCloseBtn) {
                const newBtn = tempCloseBtn.cloneNode(true);
                tempCloseBtn.parentNode.replaceChild(newBtn, tempCloseBtn);
                newBtn.addEventListener('click', () => {
                    if (contractModal) contractModal.classList.add('hidden');
                    // 没有下一步，直接关闭
                });
            }
        }
    });
});


// ========== 最终结局关闭后，显示小猫送信 ==========
if (closeFinalBtn) {
    closeFinalBtn.addEventListener('click', () => {
        console.log('最终结局关闭按钮被点击'); // 调试输出
        if (finalScreen) finalScreen.classList.add('hidden');
        
        // 延迟后显示小猫送信
        setTimeout(() => {
            if (catLetterModal) {
                console.log('显示小猫送信弹窗'); // 调试输出
                catLetterModal.classList.remove('hidden');
            } else {
                console.log('catLetterModal 元素不存在');
            }
        }, 100);
    });
} else {
    console.log('closeFinalBtn 不存在');
}

// ========== 小猫送信 + 信件 ==========
if (openLetterBtn) {
    openLetterBtn.addEventListener('click', () => {
        if (catLetterModal) catLetterModal.classList.add('hidden');
        if (letterScreen) letterScreen.classList.remove('hidden');
    });
}

if (closeLetterBtn) {
    closeLetterBtn.addEventListener('click', () => {
        if (letterScreen) letterScreen.classList.add('hidden');
    });
}

if (letterScreen) {
    letterScreen.addEventListener('click', (e) => {
        if (e.target === letterScreen) {
            letterScreen.classList.add('hidden');
        }
    });
}

console.log('🎂 所有模块已加载！');
// ========== 星星收集逻辑 ==========
let starsCollected = 0;
let starsArray = [];
const totalStars = 5;

// 星星图片文件名数组
const starImages = ['1.png', '2.png', '3.png', '4.png', '5.png'];

// 生成随机位置
function getRandomPosition(container) {
    const containerRect = container.getBoundingClientRect();
    const padding = 50;
    const maxX = containerRect.width - 80;
    const maxY = containerRect.height - 80;
    
    let x = Math.random() * maxX + padding;
    let y = Math.random() * maxY + padding;
    
    // 确保在可视区域内
    x = Math.min(Math.max(x, 30), containerRect.width - 60);
    y = Math.min(Math.max(y, 30), containerRect.height - 60);
    
    return { x, y };
}

// 创建星星
function createStars() {
    const container = document.getElementById('starContainer');
    if (!container) return;
    
    container.innerHTML = '';
    starsArray = [];
    starsCollected = 0;
    
    for (let i = 0; i < totalStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        // 使用图片文件
        star.innerHTML = `<img src="images/${i+1}.png" class="star-img" style="width:50px;height:50px;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22%3E%3Cpolygon points=%2225,5 30,20 45,20 33,30 38,45 25,35 12,45 17,30 5,20 20,20%22 fill=%22%23ffd700%22/%3E%3C/svg%3E'">`;
        star.setAttribute('data-id', i);
        star.setAttribute('data-collected', 'false');
        
        const pos = getRandomPosition(container);
        star.style.left = pos.x + 'px';
        star.style.top = pos.y + 'px';
        star.style.position = 'absolute';
        
        star.addEventListener('click', (e) => {
            e.stopPropagation();
            collectStar(star);
        });
        
        container.appendChild(star);
        starsArray.push(star);
    }
}

// 播放星星音效
function playStarSound() {
    try {
        const beep = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
        beep.volume = 0.3;
        beep.play();
    } catch(e) {}
}

// 收集星星
function collectStar(starElement) {
    if (starElement.getAttribute('data-collected') === 'true') return;
    
    playStarSound();
    starElement.setAttribute('data-collected', 'true');
    starElement.classList.add('collected');
    
    starsCollected++;
    
    // 动画结束后移除星星
    setTimeout(() => {
        if (starElement.parentNode) starElement.remove();
    }, 400);
    
    // 检查是否集满5颗
    if (starsCollected === totalStars) {
        setTimeout(() => {
            showStarSurprise();
        }, 500);
    }
}

// 显示惊喜弹窗
function showStarSurprise() {
    const surpriseModal = document.getElementById('starSurpriseModal');
    if (surpriseModal) {
        surpriseModal.classList.remove('hidden');
    }
}

// 关闭惊喜弹窗
const closeSurpriseBtn = document.getElementById('closeSurpriseBtn');
if (closeSurpriseBtn) {
    closeSurpriseBtn.addEventListener('click', () => {
        document.getElementById('starSurpriseModal').classList.add('hidden');
    });
}

// 当信件页面打开时，初始化星星
if (openLetterBtn) {
    const originalOpenLetter = openLetterBtn.onclick;
    openLetterBtn.addEventListener('click', () => {
        // 延迟一点等待信件页面动画完成
        setTimeout(() => {
            createStars();
        }, 300);
    });
}

// 如果通过其他方式打开信件页面，也需要初始化星星
if (letterScreen) {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (!letterScreen.classList.contains('hidden')) {
                setTimeout(() => createStars(), 300);
            }
        });
    });
    observer.observe(letterScreen, { attributes: true });
}