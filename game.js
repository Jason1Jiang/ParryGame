// 游戏配置
let CONFIG = null;

// 游戏状态
let canvas, ctx;
let gameState = 'start'; // start, playing, gameOver
let player, particles, enemies, bullets;
let keys = {};
let energy, kills, gameTime, startTime;
let lastEnemySpawn = 0;
let enemySpawnInterval = 2000;

// 视觉效果状态
let screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
let timeScale = 1;
let timeScaleTarget = 1;
let flashAlpha = 0;
let comboCount = 0;
let comboTimer = 0;
let deathAnimations = [];
let floatingTexts = [];
let shockwaves = [];
let slashTrails = []; // 刀光残留
let lastParryTime = 0; // 上次格挡时间
let perfectParryCombo = 0; // 完美格挡连击数
let perfectParryComboTimer = 0; // 完美格挡连击计时器
let audioContext = null; // 音频上下文
let blockKeyPressTime = 0; // 格挡键按下时间
let multiCounterQueue = []; // 多重反击队列
let multiCounterActive = false; // 多重反击是否激活
let wasPressingBlockKeyLastFrame = false; // 上一帧是否按着格挡键

// 加载配置
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        CONFIG = await response.json();
        console.log('配置加载成功:', CONFIG);
    } catch (error) {
        console.error('配置加载失败:', error);
        alert('无法加载游戏配置文件！');
    }
}

// 初始化
async function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // 加载配置
    await loadConfig();
    
    // 键盘事件
    document.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        if (e.key === ' ') e.preventDefault();
    });
    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });
}

// 开始游戏
function startGame() {
    if (!CONFIG) {
        alert('配置未加载，请刷新页面重试！');
        return;
    }
    
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('ui').style.display = 'block';
    
    gameState = 'playing';
    energy = CONFIG.energy.max;
    kills = 0;
    gameTime = 0;
    startTime = Date.now();
    lastEnemySpawn = 0;
    enemySpawnInterval = CONFIG.spawn.initialInterval;
    
    // 初始化玩家
    player = {
        x: CONFIG.canvas.width / 2,
        y: CONFIG.canvas.height / 2,
        radius: CONFIG.player.radius,
        blocking: false,
        counterAttacking: false,
        counterTarget: null,
        counterProgress: 0
    };
    
    // 初始化粒子
    particles = [];
    for (let i = 0; i < CONFIG.particles.count; i++) {
        particles.push(createParticle());
    }
    
    enemies = [];
    bullets = [];
    
    // 重置视觉效果
    screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
    timeScale = 1;
    timeScaleTarget = 1;
    flashAlpha = 0;
    comboCount = 0;
    comboTimer = 0;
    deathAnimations = [];
    floatingTexts = [];
    shockwaves = [];
    slashTrails = [];
    lastParryTime = 0;
    perfectParryCombo = 0;
    perfectParryComboTimer = 0;
    blockKeyPressTime = 0;
    multiCounterQueue = [];
    multiCounterActive = false;
    wasPressingBlockKeyLastFrame = false;
    
    // 初始化音频
    initAudio();
    
    gameLoop();
}

// 重新开始
function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    startGame();
}

// 创建粒子
function createParticle() {
    const cfg = CONFIG.particles;
    const colors = cfg.colors;
    const minAlpha = cfg.minAlpha || 0.1;
    const maxAlpha = cfg.maxAlpha || 0.3;
    const minSize = cfg.minSize || 0.5;
    const maxSize = cfg.maxSize || 1.5;
    
    return {
        x: Math.random() * CONFIG.canvas.width,
        y: Math.random() * CONFIG.canvas.height,
        vx: (Math.random() - 0.5) * cfg.baseSpeed,
        vy: (Math.random() - 0.5) * cfg.baseSpeed,
        size: Math.random() * (maxSize - minSize) + minSize,
        alpha: Math.random() * (maxAlpha - minAlpha) + minAlpha,
        color: colors[Math.floor(Math.random() * colors.length)]
    };
}

// 创建敌人
function createEnemy(type) {
    let x, y;
    
    console.log('[createEnemy] spawnInField:', CONFIG.spawn.spawnInField);
    
    // 检查是否在场内生成
    if (CONFIG.spawn.spawnInField) {
        // 在场内随机位置生成，保持一定边距
        const margin = Math.min(CONFIG.spawn.spawnMargin, CONFIG.canvas.width / 4, CONFIG.canvas.height / 4);
        const spawnWidth = CONFIG.canvas.width - margin * 2;
        const spawnHeight = CONFIG.canvas.height - margin * 2;
        
        x = margin + Math.random() * spawnWidth;
        y = margin + Math.random() * spawnHeight;
        
        console.log('[createEnemy] Spawning in field at:', x, y, 'margin:', margin);
    } else {
        // 从边缘生成（原逻辑）
        const side = Math.floor(Math.random() * 4);
        switch(side) {
            case 0: x = Math.random() * CONFIG.canvas.width; y = -20; break;
            case 1: x = CONFIG.canvas.width + 20; y = Math.random() * CONFIG.canvas.height; break;
            case 2: x = Math.random() * CONFIG.canvas.width; y = CONFIG.canvas.height + 20; break;
            case 3: x = -20; y = Math.random() * CONFIG.canvas.height; break;
        }
        console.log('[createEnemy] Spawning from edge at:', x, y, 'side:', side);
    }
    
    const now = Date.now();
    const spawnTime = now;
    
    if (type === 'ranged') {
        const cfg = CONFIG.enemies.ranged;
        const shootInterval = cfg.shootInterval + (Math.random() - 0.5) * cfg.shootIntervalVariance;
        const moveSpeed = cfg.speed * (cfg.speedVarianceMin + Math.random() * (cfg.speedVarianceMax - cfg.speedVarianceMin));
        
        return {
            type: 'ranged',
            x, y,
            size: cfg.size,
            lastShot: now,
            angle: 0,
            shootInterval: shootInterval,
            state: 'idle',
            aimStartTime: 0,
            movePattern: Math.random() * Math.PI * 2,
            moveSpeed: moveSpeed,
            keepDistance: cfg.keepDistance + (Math.random() - 0.5) * cfg.keepDistanceVariance,
            spawnTime: spawnTime,
            alpha: 0
        };
    } else {
        const cfg = CONFIG.enemies.melee;
        const attackRange = cfg.attackRange + (Math.random() - 0.5) * cfg.attackRangeVariance;
        const warningTime = cfg.warningTime + (Math.random() - 0.5) * cfg.warningTimeVariance;
        const cooldownTime = cfg.cooldownTime + (Math.random() - 0.5) * cfg.cooldownVariance;
        const dashDistance = cfg.dashDistance + (Math.random() - 0.5) * cfg.dashVariance;
        const speed = cfg.speed + (Math.random() - 0.5) * cfg.speedVariance;
        
        return {
            type: 'melee',
            x, y,
            size: cfg.size,
            state: 'chase',
            stateTime: 0,
            angle: 0,
            attackStartX: 0,
            attackStartY: 0,
            warningScale: 1,
            attackRange: attackRange,
            warningTime: warningTime,
            cooldownTime: cooldownTime,
            dashDistance: dashDistance,
            speed: speed,
            zigzagOffset: Math.random() * Math.PI * 2,
            spawnTime: spawnTime,
            alpha: 0
        };
    }
}

// 检查敌人是否无敌（刚生成时）
function isEnemyInvincible(enemy) {
    const now = Date.now();
    const timeSinceSpawn = now - enemy.spawnTime;
    return timeSinceSpawn < CONFIG.spawn.invincibleDuration;
}

// 更新敌人透明度（淡入效果）
function updateEnemyAlpha(enemy) {
    const now = Date.now();
    const timeSinceSpawn = now - enemy.spawnTime;
    
    if (timeSinceSpawn < CONFIG.spawn.fadeInDuration) {
        enemy.alpha = timeSinceSpawn / CONFIG.spawn.fadeInDuration;
    } else {
        enemy.alpha = 1;
    }
}

// 视觉效果辅助函数
function updateVisualEffects() {
    // 屏幕震动
    if (screenShake.duration > 0) {
        screenShake.duration -= 16;
        const progress = screenShake.duration / (CONFIG.visual?.screenShake?.duration || 200);
        screenShake.x = (Math.random() - 0.5) * screenShake.intensity * progress;
        screenShake.y = (Math.random() - 0.5) * screenShake.intensity * progress;
    } else {
        screenShake.x = 0;
        screenShake.y = 0;
    }
    
    // 时间缩放平滑过渡
    timeScale += (timeScaleTarget - timeScale) * 0.1;
    if (Math.abs(timeScale - timeScaleTarget) < 0.01) {
        timeScale = timeScaleTarget;
    }
    
    // 闪光淡出
    if (flashAlpha > 0) {
        flashAlpha -= 0.05;
        if (flashAlpha < 0) flashAlpha = 0;
    }
}

function triggerScreenShake(intensity) {
    if (!CONFIG.visual?.screenShake?.enabled) return;
    screenShake.intensity = intensity;
    screenShake.duration = CONFIG.visual.screenShake.duration;
}

function triggerTimeScale(scale, duration) {
    if (!CONFIG.visual?.timeScale?.enabled) return;
    timeScaleTarget = scale;
    setTimeout(() => {
        timeScaleTarget = 1;
    }, duration);
}

function triggerFlash(intensity) {
    if (!CONFIG.visual?.flash?.enabled) return;
    flashAlpha = Math.min(1, intensity);
}

function addFloatingText(x, y, text, color = '#fff', size = 24) {
    floatingTexts.push({
        x, y, text, color, size,
        alpha: 1,
        vy: -2,
        life: 60
    });
}

function updateFloatingTexts() {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const text = floatingTexts[i];
        text.y += text.vy;
        text.vy *= 0.95;
        text.alpha -= 1 / text.life;
        text.life--;
        
        if (text.life <= 0) {
            floatingTexts.splice(i, 1);
        }
    }
}

function createShockwave(x, y, maxRadius, color) {
    shockwaves.push({
        x, y, radius: 0, maxRadius, color,
        alpha: 1, life: 30
    });
}

function updateShockwaves() {
    for (let i = shockwaves.length - 1; i >= 0; i--) {
        const wave = shockwaves[i];
        wave.life--;
        wave.radius += (wave.maxRadius - wave.radius) * 0.2;
        wave.alpha = wave.life / 30;
        
        if (wave.life <= 0) {
            shockwaves.splice(i, 1);
        }
    }
}

function renderShockwaves() {
    for (const wave of shockwaves) {
        ctx.strokeStyle = wave.color;
        ctx.globalAlpha = wave.alpha;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function createDeathAnimation(enemy) {
    const cfg = CONFIG.visual?.enemyDeath || {
        explosionParticles: 40,
        explosionSpeed: 8,
        shrinkDuration: 200,
        fadeOutDuration: 300
    };
    
    deathAnimations.push({
        x: enemy.x,
        y: enemy.y,
        size: enemy.size,
        type: enemy.type,
        rotation: 0,
        scale: 1,
        alpha: 1,
        particles: [],
        life: cfg.shrinkDuration + cfg.fadeOutDuration
    });
    
    // 创建爆炸粒子
    const lastAnim = deathAnimations[deathAnimations.length - 1];
    for (let i = 0; i < cfg.explosionParticles; i++) {
        const angle = (Math.PI * 2 * i) / cfg.explosionParticles + Math.random() * 0.5;
        const speed = cfg.explosionSpeed + Math.random() * 3;
        lastAnim.particles.push({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 3 + 1,
            color: enemy.type === 'ranged' ? '#f55' : '#fa0',
            alpha: 1
        });
    }
}

function updateDeathAnimations() {
    const cfg = CONFIG.visual?.enemyDeath || {
        shrinkDuration: 200,
        fadeOutDuration: 300
    };
    
    for (let i = deathAnimations.length - 1; i >= 0; i--) {
        const anim = deathAnimations[i];
        anim.life--;
        
        const totalLife = cfg.shrinkDuration + cfg.fadeOutDuration;
        const progress = 1 - anim.life / totalLife;
        
        anim.rotation += 0.2;
        if (anim.life > cfg.fadeOutDuration) {
            anim.scale = 1 - (progress * 2);
        } else {
            anim.alpha = anim.life / cfg.fadeOutDuration;
        }
        
        for (const p of anim.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.95;
            p.vy *= 0.95;
            p.alpha = anim.alpha;
        }
        
        if (anim.life <= 0) {
            deathAnimations.splice(i, 1);
        }
    }
}

function renderDeathAnimations() {
    for (const anim of deathAnimations) {
        // 渲染爆炸粒子
        for (const p of anim.particles) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 渲染敌人本体
        ctx.save();
        ctx.translate(anim.x, anim.y);
        ctx.rotate(anim.rotation);
        ctx.scale(anim.scale, anim.scale);
        ctx.globalAlpha = anim.alpha;
        
        if (anim.type === 'ranged') {
            ctx.fillStyle = CONFIG.enemies.ranged.color;
            ctx.beginPath();
            ctx.moveTo(0, -anim.size);
            ctx.lineTo(anim.size * 0.866, anim.size * 0.5);
            ctx.lineTo(-anim.size * 0.866, anim.size * 0.5);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillStyle = CONFIG.enemies.melee.color;
            ctx.beginPath();
            ctx.moveTo(0, -anim.size);
            ctx.lineTo(anim.size, 0);
            ctx.lineTo(0, anim.size);
            ctx.lineTo(-anim.size, 0);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    }
    ctx.globalAlpha = 1;
}

function renderFloatingTexts() {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (const text of floatingTexts) {
        ctx.font = `bold ${text.size}px Arial`;
        ctx.globalAlpha = text.alpha;
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeText(text.text, text.x, text.y);
        
        ctx.fillStyle = text.color;
        ctx.fillText(text.text, text.x, text.y);
    }
    
    ctx.restore();
    ctx.globalAlpha = 1;
}

function renderCombo() {
    if (comboCount > 1 && comboTimer > 0 && CONFIG.visual?.combo) {
        const x = CONFIG.canvas.width / 2;
        const y = 80;
        const progress = comboTimer / CONFIG.visual.combo.timeout;
        const scale = 1 + (1 - progress) * 0.3;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 36px Arial';
        ctx.globalAlpha = Math.min(1, progress * 2);
        
        const comboColor = CONFIG.visual.combo.colors[Math.min(comboCount - 1, CONFIG.visual.combo.colors.length - 1)];
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.strokeText(`${comboCount}x COMBO`, 0, 0);
        
        ctx.fillStyle = comboColor;
        ctx.fillText(`${comboCount}x COMBO`, 0, 0);
        
        ctx.restore();
        ctx.globalAlpha = 1;
    }
}

// 创建刀光残留
function createSlashTrail(startX, startY, endX, endY) {
    const cfg = CONFIG.visual?.counterEffect?.trailPersistence;
    if (!cfg || !cfg.enabled) return;
    
    slashTrails.push({
        startX, startY, endX, endY,
        alpha: 1,
        life: cfg.duration,
        maxLife: cfg.duration,
        enhanced: false
    });
}

// 创建强化刀光残留
function createEnhancedSlashTrail(startX, startY, endX, endY, duration) {
    const cfg = CONFIG.visual?.counterEffect?.trailPersistence;
    if (!cfg || !cfg.enabled) return;
    
    const isEnhanced = comboCount >= (CONFIG.visual?.combo?.slashEnhancement?.threshold || 3);
    
    slashTrails.push({
        startX, startY, endX, endY,
        alpha: 1,
        life: duration || cfg.duration,
        maxLife: duration || cfg.duration,
        enhanced: isEnhanced,
        comboLevel: comboCount,
        isMultiCounter: player.isMultiCounter || false
    });
}

// 获取强化后的残留时长
function getEnhancedTrailDuration() {
    const cfg = CONFIG.visual?.combo?.slashEnhancement;
    const baseDuration = CONFIG.visual?.counterEffect?.trailPersistence?.duration || 300;
    
    if (!cfg || !cfg.enabled || comboCount < cfg.threshold) {
        return baseDuration;
    }
    
    return cfg.trailDuration || baseDuration;
}

// 更新刀光残留
function updateSlashTrails() {
    const cfg = CONFIG.visual?.counterEffect?.trailPersistence;
    if (!cfg || !cfg.enabled) return;
    
    for (let i = slashTrails.length - 1; i >= 0; i--) {
        const trail = slashTrails[i];
        trail.life -= 16;
        trail.alpha = trail.life / trail.maxLife;
        
        if (trail.life <= 0) {
            slashTrails.splice(i, 1);
        }
    }
}

// 渲染刀光残留
function renderSlashTrails() {
    const cfg = CONFIG.visual?.counterEffect;
    if (!cfg?.trailPersistence?.enabled) return;
    
    for (const trail of slashTrails) {
        const dx = trail.endX - trail.startX;
        const dy = trail.endY - trail.startY;
        
        ctx.save();
        
        // 强化效果
        if (trail.enhanced) {
            const enhanceCfg = CONFIG.visual?.combo?.slashEnhancement;
            const widthMultiplier = enhanceCfg?.widthMultiplier || 1.5;
            const glowIntensity = enhanceCfg?.glowIntensity || 1.5;
            
            // 多层刀光（强化版）
            for (let layer = 2; layer >= 0; layer--) {
                const alpha = trail.alpha * (0.5 - layer * 0.15);
                const width = cfg.slashTrailWidth * widthMultiplier * (1 - layer * 0.3);
                
                ctx.globalAlpha = alpha;
                
                // 多重反击刀光（紫色）
                let color;
                if (trail.isMultiCounter) {
                    const multiCfg = CONFIG.visual?.multiCounter;
                    if (layer === 0) {
                        color = '#fff'; // 白色核心
                    } else if (layer === 1) {
                        color = '#ff00ff'; // 紫色中层
                    } else {
                        color = multiCfg?.trailColor || '#ff00ff'; // 紫色外层
                    }
                } else if (trail.comboLevel >= 5 && CONFIG.visual?.perfectParryCombo?.specialEffects?.rainbowSlash) {
                    // 彩虹刀光（高连击）
                    const hue = (Date.now() / 10 + layer * 60) % 360;
                    color = `hsl(${hue}, 100%, 60%)`;
                } else if (layer === 0) {
                    color = '#ffd700'; // 金色核心
                } else if (layer === 1) {
                    color = '#fff'; // 白色中层
                } else {
                    color = cfg.slashColor; // 青色外层
                }
                
                ctx.strokeStyle = color;
                ctx.lineWidth = width;
                ctx.lineCap = 'round';
                
                // 发光效果
                if (layer === 2) {
                    ctx.shadowBlur = 15 * glowIntensity;
                    ctx.shadowColor = color;
                }
                
                ctx.beginPath();
                ctx.moveTo(trail.startX, trail.startY);
                ctx.lineTo(trail.endX, trail.endY);
                ctx.stroke();
                
                ctx.shadowBlur = 0;
            }
        } else {
            // 普通刀光残留
            ctx.globalAlpha = trail.alpha * 0.4;
            ctx.strokeStyle = cfg.slashColor;
            ctx.lineWidth = cfg.slashTrailWidth * 0.5;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(trail.startX, trail.startY);
            ctx.lineTo(trail.endX, trail.endY);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// 检查是否为完美格挡
function isPerfectParry() {
    const cfg = CONFIG.visual?.perfectParry;
    if (!cfg || !cfg.enabled) return false;
    
    const now = Date.now();
    const timeSinceLastParry = now - lastParryTime;
    
    // 如果是第一次格挡或距离上次格挡很久，不算完美格挡
    if (lastParryTime === 0 || timeSinceLastParry > 1000) {
        return false;
    }
    
    // 在时间窗口内格挡算完美格挡
    return timeSinceLastParry <= cfg.timeWindow;
}

// 检查是否触发多重反击
function checkMultiCounter() {
    const cfg = CONFIG.visual?.multiCounter;
    if (!cfg || !cfg.enabled) return false;
    
    const now = Date.now();
    const timeSinceKeyPress = now - blockKeyPressTime;
    
    // 如果在按下格挡键的极短时间内成功格挡，触发多重反击
    return timeSinceKeyPress < cfg.timeWindow && timeSinceKeyPress > 0;
}

// 触发多重反击
function triggerMultiCounter() {
    const cfg = CONFIG.visual?.multiCounter;
    if (!cfg || !cfg.enabled || multiCounterActive) return;
    
    // 找到最近的多个敌人（排除无敌的敌人）
    const targets = [];
    const validEnemies = enemies.filter(e => !isEnemyInvincible(e));
    const sortedEnemies = validEnemies.slice().sort((a, b) => {
        const distA = Math.hypot(a.x - player.x, a.y - player.y);
        const distB = Math.hypot(b.x - player.x, b.y - player.y);
        return distA - distB;
    });
    
    for (let i = 0; i < Math.min(cfg.maxTargets, sortedEnemies.length); i++) {
        targets.push(sortedEnemies[i]);
    }
    
    if (targets.length === 0) return;
    
    // 激活多重反击
    multiCounterActive = true;
    multiCounterQueue = targets.slice();
    
    // 超强视觉效果
    triggerFlash(2.0);
    triggerScreenShake(cfg.screenShakeIntensity);
    triggerTimeScale(cfg.timeSlowScale, cfg.timeSlowDuration);
    
    // 额外能量恢复
    energy = Math.min(CONFIG.energy.max, energy + cfg.bonusEnergy);
    
    // 飘字提示
    addFloatingText(player.x, player.y - 40, `MULTI COUNTER x${targets.length}!`, cfg.flashColor, 36);
    
    // 创建紫色冲击波
    createShockwave(player.x, player.y, 150, cfg.flashColor);
    
    // 音效
    playSound('perfectParry');
    
    // 开始第一次反击
    executeNextMultiCounter();
}

// 执行下一次多重反击
function executeNextMultiCounter() {
    if (multiCounterQueue.length === 0) {
        multiCounterActive = false;
        player.isMultiCounter = false;
        return;
    }
    
    const target = multiCounterQueue.shift();
    
    // 检查目标是否还存在
    if (!enemies.includes(target)) {
        executeNextMultiCounter();
        return;
    }
    
    // 开始反击
    player.counterAttacking = true;
    player.counterTarget = target;
    player.counterProgress = 0;
    player.counterStartX = player.x;
    player.counterStartY = player.y;
    player.isMultiCounter = true;
    
    // 紫色粒子爆发
    const cfg = CONFIG.visual?.multiCounter;
    createParticleBurst(player.x, player.y, CONFIG.counter.particleBurstCount * 2);
    
    // 音效
    playSound('counter');
}

// 触发完美格挡效果
function triggerPerfectParry() {
    const cfg = CONFIG.visual?.perfectParry;
    if (!cfg || !cfg.enabled) return;
    
    // 更强的闪光
    triggerFlash(cfg.flashIntensity);
    
    // 更强的震动
    triggerScreenShake(CONFIG.visual.screenShake.blockSuccess * 1.5);
    
    // 更慢的时间
    triggerTimeScale(cfg.timeSlowScale, cfg.timeSlowDuration);
    
    // 额外能量恢复
    energy = Math.min(CONFIG.energy.max, energy + cfg.bonusEnergy);
    
    // 完美格挡连击
    updatePerfectParryCombo();
    
    // 飘字提示
    const comboText = perfectParryCombo > 1 ? `PERFECT x${perfectParryCombo}!` : 'PERFECT!';
    addFloatingText(player.x, player.y - 40, comboText, cfg.flashColor, 32);
    
    // 音效
    playSound('perfectParry');
}

// 更新完美格挡连击
function updatePerfectParryCombo() {
    const cfg = CONFIG.visual?.perfectParryCombo;
    if (!cfg || !cfg.enabled) return;
    
    perfectParryCombo++;
    perfectParryComboTimer = cfg.comboTimeout;
    
    // 连击奖励
    if (perfectParryCombo > 1) {
        const bonus = Math.min(perfectParryCombo, cfg.maxCombo) * cfg.bonusPerCombo;
        energy = Math.min(CONFIG.energy.max, energy + bonus);
        
        // 特殊效果
        if (cfg.specialEffects?.enabled && perfectParryCombo >= 3) {
            // 更强的时间减速
            const extraSlow = cfg.specialEffects.timeSlowBonus * (perfectParryCombo - 2);
            triggerTimeScale(Math.max(0.05, CONFIG.visual.perfectParry.timeSlowScale - extraSlow), 
                           CONFIG.visual.perfectParry.timeSlowDuration);
            
            // 爆炸效果
            if (perfectParryCombo >= 5) {
                createShockwave(player.x, player.y, cfg.specialEffects.explosionRadius, '#ff00ff');
            }
        }
    }
}

// 音频系统
function initAudio() {
    if (!CONFIG.visual?.audio?.enabled) return;
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('Web Audio API not supported:', e);
    }
}

function playSound(soundType) {
    if (!audioContext || !CONFIG.visual?.audio?.enabled) return;
    
    const soundCfg = CONFIG.visual.audio.sounds[soundType];
    if (!soundCfg || !soundCfg.enabled) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = soundCfg.frequency;
        oscillator.type = 'sine';
        
        const volume = CONFIG.visual.audio.volume;
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + soundCfg.duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + soundCfg.duration);
    } catch (e) {
        console.warn('Error playing sound:', e);
    }
}

// 更新格挡键状态
function updateBlockKeyState() {
    // 检测格挡键是否被按下（无论玩家是否在反击中）
    const isPressingBlockKey = keys[' '];
    
    // 记录格挡键按下时间
    if (isPressingBlockKey && !wasPressingBlockKeyLastFrame) {
        // 刚按下格挡键
        blockKeyPressTime = Date.now();
    } else if (!isPressingBlockKey && wasPressingBlockKeyLastFrame) {
        // 刚松开格挡键
        blockKeyPressTime = 0;
    }
    
    // 更新上一帧状态
    wasPressingBlockKeyLastFrame = isPressingBlockKey;
}

// 游戏循环
function gameLoop() {
    if (gameState !== 'playing') return;
    
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// 更新
function update() {
    const now = Date.now();
    gameTime = Math.floor((now - startTime) / 1000);
    
    // 更新格挡键状态（在所有逻辑之前，确保能记录按键时间）
    updateBlockKeyState();
    
    // 更新视觉效果
    updateVisualEffects();
    
    // 更新玩家
    updatePlayer();
    
    // 更新能量
    updateEnergy();
    
    // 生成敌人
    if (now - lastEnemySpawn > enemySpawnInterval) {
        const type = (gameTime > CONFIG.spawn.meleeStartTime && Math.random() < CONFIG.spawn.meleeSpawnChance) ? 'melee' : 'ranged';
        enemies.push(createEnemy(type));
        lastEnemySpawn = now;
        enemySpawnInterval = Math.max(
            CONFIG.spawn.minInterval, 
            CONFIG.spawn.initialInterval - gameTime * CONFIG.spawn.intervalDecreasePerSecond
        );
    }
    
    // 更新敌人
    updateEnemies();
    
    // 更新子弹
    updateBullets();
    
    // 更新粒子
    updateParticles();
    
    // 更新死亡动画
    updateDeathAnimations();
    
    // 更新飘字
    updateFloatingTexts();
    
    // 更新冲击波
    updateShockwaves();
    
    // 更新刀光残留
    updateSlashTrails();
    
    // 更新连击计时
    if (comboTimer > 0) {
        comboTimer -= 16;
        if (comboTimer <= 0) {
            comboCount = 0;
        }
    }
    
    // 更新完美格挡连击计时
    if (perfectParryComboTimer > 0) {
        perfectParryComboTimer -= 16;
        if (perfectParryComboTimer <= 0) {
            perfectParryCombo = 0;
        }
    }
    
    // 更新UI
    updateUI();
}

// 更新玩家
function updatePlayer() {
    // 反击动画
    if (player.counterAttacking) {
        player.counterProgress += CONFIG.counter.speed;
        if (player.counterProgress >= 1) {
            player.x = player.counterTarget.x;
            player.y = player.counterTarget.y;
            
            // 击杀敌人
            const index = enemies.indexOf(player.counterTarget);
            if (index > -1) {
                const enemy = enemies[index];
                enemies.splice(index, 1);
                kills++;
                energy = Math.min(CONFIG.energy.max, energy + CONFIG.energy.killRestore);
                
                // 连击系统
                comboCount++;
                comboTimer = CONFIG.visual.combo.timeout;
                
                // 视觉效果
                triggerScreenShake(CONFIG.visual.screenShake.counterHit);
                triggerTimeScale(CONFIG.visual.timeScale.counterHit, CONFIG.visual.timeScale.duration);
                triggerFlash(CONFIG.visual.flash.counterHit);
                
                createParticleBurst(player.x, player.y, CONFIG.effects.killBurstCount);
                
                // 死亡动画
                createDeathAnimation(enemy);
                
                // 冲击波
                createShockwave(player.x, player.y, 80, '#0ff');
                
                // 飘字
                if (comboCount > 1) {
                    const comboColor = CONFIG.visual.combo.colors[Math.min(comboCount - 1, CONFIG.visual.combo.colors.length - 1)];
                    addFloatingText(player.x, player.y - 30, `${comboCount} COMBO!`, comboColor, 28);
                } else {
                    addFloatingText(player.x, player.y - 30, 'KILL!', '#fff', 24);
                }
                
                // 音效
                playSound('kill');
                playSound('slash');
            }
            
            // 创建刀光残留（强化版）
            const trailDuration = getEnhancedTrailDuration();
            createEnhancedSlashTrail(player.counterStartX, player.counterStartY, player.x, player.y, trailDuration);
            
            player.counterAttacking = false;
            player.counterTarget = null;
            player.counterProgress = 0;
            
            // 如果是多重反击，继续下一个目标（或结束多重反击）
            if (player.isMultiCounter) {
                const cfg = CONFIG.visual?.multiCounter;
                setTimeout(() => {
                    executeNextMultiCounter();
                }, cfg.delayBetweenCounters);
            }
        } else {
            // 插值移动
            const startX = player.counterStartX;
            const startY = player.counterStartY;
            const targetX = player.counterTarget.x;
            const targetY = player.counterTarget.y;
            player.x = startX + (targetX - startX) * player.counterProgress;
            player.y = startY + (targetY - startY) * player.counterProgress;
            
            disturbParticles(player.x, player.y, CONFIG.effects.counterDisturbRadius, CONFIG.effects.counterDisturbForce);
        }
        return;
    }
    
    // 移动
    let dx = 0, dy = 0;
    if (keys['w']) dy -= 1;
    if (keys['s']) dy += 1;
    if (keys['a']) dx -= 1;
    if (keys['d']) dx += 1;
    
    if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;
        player.x += dx * CONFIG.player.speed;
        player.y += dy * CONFIG.player.speed;
        
        // 边界限制
        player.x = Math.max(player.radius, Math.min(CONFIG.canvas.width - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(CONFIG.canvas.height - player.radius, player.y));
        
        disturbParticles(player.x, player.y, CONFIG.effects.movementDisturbRadius, CONFIG.effects.movementDisturbForce);
    }
    
    // 格挡（格挡键状态已在 updateBlockKeyState 中更新）
    player.blocking = keys[' '] && energy > 0;
}

// 更新能量
function updateEnergy() {
    if (player.counterAttacking) return;
    
    if (player.blocking) {
        energy -= CONFIG.energy.drainRate / 60;
        if (energy <= 0) {
            energy = 0;
            player.blocking = false;
        }
    } else {
        energy += CONFIG.energy.regenRate / 60;
        energy = Math.min(CONFIG.energy.max, energy);
    }
}

// 更新敌人
function updateEnemies() {
    const now = Date.now();
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // 更新透明度（淡入效果）
        updateEnemyAlpha(enemy);
        
        if (enemy.type === 'ranged') {
            updateRangedEnemy(enemy, now);
        } else {
            updateMeleeEnemy(enemy, now);
        }
    }
}

// 更新远程敌人
function updateRangedEnemy(enemy, now) {
    const cfg = CONFIG.enemies.ranged;
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    enemy.angle = Math.atan2(dy, dx);
    
    switch(enemy.state) {
        case 'idle':
            enemy.movePattern += 0.02;
            const targetDist = enemy.keepDistance + Math.sin(enemy.movePattern) * 50;
            
            if (dist > targetDist + 30) {
                enemy.x += Math.cos(enemy.angle) * enemy.moveSpeed;
                enemy.y += Math.sin(enemy.angle) * enemy.moveSpeed;
            } else if (dist < targetDist - 30) {
                enemy.x -= Math.cos(enemy.angle) * enemy.moveSpeed * 0.7;
                enemy.y -= Math.sin(enemy.angle) * enemy.moveSpeed * 0.7;
            } else {
                const perpAngle = enemy.angle + Math.PI / 2;
                enemy.x += Math.cos(perpAngle) * enemy.moveSpeed * 0.8;
                enemy.y += Math.sin(perpAngle) * enemy.moveSpeed * 0.8;
            }
            
            if (now - enemy.lastShot > enemy.shootInterval) {
                enemy.state = 'aiming';
                enemy.aimStartTime = now;
                enemy.aimAngle = enemy.angle;
            }
            break;
            
        case 'aiming':
            const aimElapsed = now - enemy.aimStartTime;
            
            if (aimElapsed > cfg.aimTime) {
                bullets.push({
                    x: enemy.x,
                    y: enemy.y,
                    vx: Math.cos(enemy.aimAngle) * CONFIG.bullet.speed,
                    vy: Math.sin(enemy.aimAngle) * CONFIG.bullet.speed,
                    radius: CONFIG.bullet.radius
                });
                enemy.lastShot = now;
                enemy.state = 'cooldown';
                enemy.cooldownStart = now;
            }
            break;
            
        case 'cooldown':
            enemy.x -= Math.cos(enemy.angle) * enemy.moveSpeed * 0.5;
            enemy.y -= Math.sin(enemy.angle) * enemy.moveSpeed * 0.5;
            
            if (now - enemy.cooldownStart > cfg.cooldownTime) {
                enemy.state = 'idle';
            }
            break;
    }
}

// 更新近战敌人
function updateMeleeEnemy(enemy, now) {
    const cfg = CONFIG.enemies.melee;
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    enemy.angle = Math.atan2(dy, dx);
    
    switch(enemy.state) {
        case 'chase':
            enemy.zigzagOffset += 0.1;
            const zigzagAngle = enemy.angle + Math.sin(enemy.zigzagOffset) * cfg.zigzagIntensity;
            
            enemy.x += Math.cos(zigzagAngle) * enemy.speed;
            enemy.y += Math.sin(zigzagAngle) * enemy.speed;
            
            if (dist < enemy.attackRange) {
                enemy.state = 'warning';
                enemy.stateTime = now;
                enemy.warningScale = 1;
                
                const predictTime = cfg.predictTime;
                let predictX = player.x;
                let predictY = player.y;
                if (keys['w']) predictY -= CONFIG.player.speed * predictTime * 60;
                if (keys['s']) predictY += CONFIG.player.speed * predictTime * 60;
                if (keys['a']) predictX -= CONFIG.player.speed * predictTime * 60;
                if (keys['d']) predictX += CONFIG.player.speed * predictTime * 60;
                
                const pdx = predictX - enemy.x;
                const pdy = predictY - enemy.y;
                enemy.attackAngle = Math.atan2(pdy, pdx);
            }
            break;
            
        case 'warning':
            const warningElapsed = now - enemy.stateTime;
            enemy.warningScale = 1 + Math.sin(warningElapsed / 50) * 0.3;
            
            const shake = Math.sin(warningElapsed / 30) * 2;
            enemy.x += Math.cos(enemy.attackAngle + Math.PI / 2) * shake * 0.1;
            enemy.y += Math.sin(enemy.attackAngle + Math.PI / 2) * shake * 0.1;
            
            if (warningElapsed > enemy.warningTime) {
                enemy.state = 'attack';
                enemy.stateTime = now;
                enemy.attackStartX = enemy.x;
                enemy.attackStartY = enemy.y;
            }
            break;
            
        case 'attack':
            const attackElapsed = now - enemy.stateTime;
            const attackProgress = Math.min(1, attackElapsed / cfg.attackTime);
            
            enemy.x = enemy.attackStartX + Math.cos(enemy.attackAngle) * enemy.dashDistance * attackProgress;
            enemy.y = enemy.attackStartY + Math.sin(enemy.attackAngle) * enemy.dashDistance * attackProgress;
            
            disturbParticles(enemy.x, enemy.y, CONFIG.effects.dashDisturbRadius, CONFIG.effects.dashDisturbForce);
            
            if (checkMeleeHit(enemy)) {
                if (player.blocking && !player.counterAttacking) {
                    // 检查是否触发多重反击（只有在没有进行多重反击时才检查）
                    const isMulti = !multiCounterActive && checkMultiCounter();
                    
                    if (isMulti) {
                        // 多重反击效果
                        triggerMultiCounter();
                        enemy.state = 'cooldown';
                        enemy.stateTime = now;
                    } else {
                        // 检查是否为完美格挡
                        const perfect = isPerfectParry();
                        
                        if (perfect) {
                            // 完美格挡效果
                            triggerPerfectParry();
                            createParticleBurst(player.x, player.y, CONFIG.effects.blockBurstCount * 1.5);
                            createShockwave(player.x, player.y, 70, '#ffd700');
                        } else {
                            // 普通格挡效果
                            triggerScreenShake(CONFIG.visual.screenShake.blockSuccess);
                            triggerTimeScale(CONFIG.visual.timeScale.blockSuccess, CONFIG.visual.timeScale.duration);
                            triggerFlash(CONFIG.visual.flash.blockSuccess);
                            createParticleBurst(player.x, player.y, CONFIG.effects.blockBurstCount);
                            createShockwave(player.x, player.y, 50, '#0cf');
                        }
                        
                        // 更新格挡时间
                        lastParryTime = Date.now();
                        
                        triggerCounter(enemy);
                        enemy.state = 'cooldown';
                        enemy.stateTime = now;
                    }
                } else if (!player.counterAttacking) {
                    gameOver();
                    return;
                }
            }
            
            if (attackElapsed > cfg.attackTime) {
                enemy.state = 'cooldown';
                enemy.stateTime = now;
            }
            break;
            
        case 'cooldown':
            enemy.x -= Math.cos(enemy.attackAngle) * 1;
            enemy.y -= Math.sin(enemy.attackAngle) * 1;
            
            if (now - enemy.stateTime > enemy.cooldownTime) {
                enemy.state = 'chase';
                enemy.zigzagOffset = Math.random() * Math.PI * 2;
            }
            break;
    }
}

// 检测近战攻击命中
function checkMeleeHit(enemy) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < player.radius + enemy.size;
}

// 更新子弹
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        
        // 移除出界子弹
        if (bullet.x < -50 || bullet.x > CONFIG.canvas.width + 50 ||
            bullet.y < -50 || bullet.y > CONFIG.canvas.height + 50) {
            bullets.splice(i, 1);
            continue;
        }
        
        // 碰撞检测
        const dx = player.x - bullet.x;
        const dy = player.y - bullet.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < player.radius + bullet.radius) {
            if (player.blocking && !player.counterAttacking) {
                // 格挡成功
                bullets.splice(i, 1);
                
                // 检查是否触发多重反击（只有在没有进行多重反击时才检查）
                const isMulti = !multiCounterActive && checkMultiCounter();
                
                if (isMulti) {
                    // 多重反击效果
                    triggerMultiCounter();
                } else {
                    // 检查是否为完美格挡
                    const perfect = isPerfectParry();
                    
                    if (perfect) {
                        // 完美格挡效果
                        triggerPerfectParry();
                        createParticleBurst(bullet.x, bullet.y, CONFIG.effects.blockBurstCount * 1.5);
                        createShockwave(bullet.x, bullet.y, 70, '#ffd700');
                    } else {
                        // 普通格挡效果
                        triggerScreenShake(CONFIG.visual.screenShake.blockSuccess);
                        triggerTimeScale(CONFIG.visual.timeScale.blockSuccess, CONFIG.visual.timeScale.duration);
                        triggerFlash(CONFIG.visual.flash.blockSuccess);
                        createParticleBurst(bullet.x, bullet.y, CONFIG.effects.blockBurstCount);
                        createShockwave(bullet.x, bullet.y, 50, '#0cf');
                        
                        // 音效
                        playSound('parry');
                    }
                    
                    // 更新格挡时间
                    lastParryTime = Date.now();
                    
                    triggerCounter();
                }
            } else if (!player.counterAttacking) {
                // 玩家被击中
                gameOver();
            }
        }
    }
}

// 触发反击
function triggerCounter(meleeEnemy = null) {
    // 找到最近的敌人（排除无敌的敌人）
    let nearest = null;
    let minDist = Infinity;
    
    for (const enemy of enemies) {
        // 跳过无敌的敌人
        if (isEnemyInvincible(enemy)) continue;
        
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
            minDist = dist;
            nearest = enemy;
        }
    }
    
    if (nearest) {
        player.counterAttacking = true;
        player.counterTarget = nearest;
        player.counterProgress = 0;
        player.counterStartX = player.x;
        player.counterStartY = player.y;
        
        // 连击强化粒子
        const burstCount = getEnhancedParticleCount();
        createParticleBurst(player.x, player.y, burstCount);
        
        // 音效
        playSound('counter');
    }
}

// 获取强化后的粒子数量
function getEnhancedParticleCount() {
    const cfg = CONFIG.visual?.combo?.slashEnhancement;
    if (!cfg || !cfg.enabled || comboCount < cfg.threshold) {
        return CONFIG.counter.particleBurstCount;
    }
    
    return Math.floor(CONFIG.counter.particleBurstCount * cfg.particleMultiplier);
}

// 更新粒子
function updateParticles() {
    for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        
        // 边界循环
        if (p.x < 0) p.x = CONFIG.canvas.width;
        if (p.x > CONFIG.canvas.width) p.x = 0;
        if (p.y < 0) p.y = CONFIG.canvas.height;
        if (p.y > CONFIG.canvas.height) p.y = 0;
        
        // 速度衰减
        p.vx *= 0.99;
        p.vy *= 0.99;
        
        // 恢复基础速度
        if (Math.abs(p.vx) < CONFIG.particles.baseSpeed && Math.abs(p.vy) < CONFIG.particles.baseSpeed) {
            p.vx += (Math.random() - 0.5) * 0.05;
            p.vy += (Math.random() - 0.5) * 0.05;
        }
    }
}

// 粒子扰动
function disturbParticles(x, y, radius, force) {
    for (const p of particles) {
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < radius && dist > 0) {
            const angle = Math.atan2(dy, dx);
            const power = (1 - dist / radius) * force;
            p.vx += Math.cos(angle) * power;
            p.vy += Math.sin(angle) * power;
        }
    }
}

// 粒子爆发
function createParticleBurst(x, y, count) {
    const cfg = CONFIG.counter;
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = cfg.particleBurstForce + Math.random() * cfg.particleBurstForceVariance;
        
        for (const p of particles) {
            const dx = p.x - x;
            const dy = p.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < cfg.particleBurstRadius) {
                p.vx += Math.cos(angle) * speed * (1 - dist / cfg.particleBurstRadius);
                p.vy += Math.sin(angle) * speed * (1 - dist / cfg.particleBurstRadius);
            }
        }
    }
}

// 更新UI
function updateUI() {
    document.getElementById('kills').textContent = kills;
    document.getElementById('time').textContent = gameTime;
    
    const energyPercent = (energy / CONFIG.energy.max) * 100;
    const energyFill = document.getElementById('energyFill');
    energyFill.style.width = energyPercent + '%';
    
    if (energyPercent < 30) {
        energyFill.className = 'low';
    } else if (energyPercent < 60) {
        energyFill.className = 'medium';
    } else {
        energyFill.className = '';
    }
}

// 游戏结束
function gameOver() {
    gameState = 'gameOver';
    document.getElementById('finalKills').textContent = kills;
    document.getElementById('finalTime').textContent = gameTime;
    document.getElementById('gameOver').style.display = 'block';
}

// 渲染
function render() {
    ctx.save();
    
    // 应用屏幕震动
    if (screenShake && screenShake.x !== undefined) {
        ctx.translate(screenShake.x, screenShake.y);
    }
    
    // 渲染背景
    renderBackground();
    
    // 渲染粒子
    renderParticles();
    
    // 渲染刀光残留
    if (typeof renderSlashTrails === 'function') {
        renderSlashTrails();
    }
    
    // 渲染冲击波
    if (typeof renderShockwaves === 'function') {
        renderShockwaves();
    }
    
    // 渲染死亡动画
    if (typeof renderDeathAnimations === 'function') {
        renderDeathAnimations();
    }
    
    // 渲染子弹
    renderBullets();
    
    // 渲染敌人
    renderEnemies();
    
    // 渲染玩家
    renderPlayer();
    
    // 渲染反击效果
    if (player.counterAttacking) {
        renderCounterEffect();
    }
    
    ctx.restore();
    
    // 渲染飘字（不受震动影响）
    if (typeof renderFloatingTexts === 'function') {
        renderFloatingTexts();
    }
    
    // 渲染连击显示
    if (typeof renderCombo === 'function') {
        renderCombo();
    }
    
    // 渲染暗角
    if (CONFIG.visual && CONFIG.visual.background && CONFIG.visual.background.vignette) {
        renderVignette();
    }
}

// 渲染背景
function renderBackground() {
    const bg = CONFIG.visual?.background;
    
    if (bg && bg.gradient) {
        const gradient = ctx.createRadialGradient(
            CONFIG.canvas.width / 2, CONFIG.canvas.height / 2, 0,
            CONFIG.canvas.width / 2, CONFIG.canvas.height / 2, CONFIG.canvas.width / 2
        );
        gradient.addColorStop(0, bg.gradientColors[0]);
        gradient.addColorStop(0.5, bg.gradientColors[1]);
        gradient.addColorStop(1, bg.gradientColors[2]);
        ctx.fillStyle = gradient;
    } else if (bg && bg.backgroundColor) {
        ctx.fillStyle = bg.backgroundColor;
    } else {
        ctx.fillStyle = '#000000';
    }
    ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
}

// 渲染暗角
function renderVignette() {
    const gradient = ctx.createRadialGradient(
        CONFIG.canvas.width / 2, CONFIG.canvas.height / 2, CONFIG.canvas.width * 0.3,
        CONFIG.canvas.width / 2, CONFIG.canvas.height / 2, CONFIG.canvas.width * 0.7
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, `rgba(0, 0, 0, ${CONFIG.visual.background.vignetteStrength})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
}

// 渲染粒子
function renderParticles() {
    for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
}

// 渲染玩家
function renderPlayer() {
    const time = Date.now() / 1000;
    
    // 发光效果
    if (CONFIG.visual && CONFIG.visual.glow && CONFIG.visual.glow.enabled) {
        const glowGradient = ctx.createRadialGradient(
            player.x, player.y, player.radius,
            player.x, player.y, player.radius + CONFIG.visual.glow.playerGlow
        );
        glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius + CONFIG.visual.glow.playerGlow, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 格挡护盾
    if (player.blocking && CONFIG.visual && CONFIG.visual.blockingShield) {
        const cfg = CONFIG.visual.blockingShield;
        const energyPercent = energy / CONFIG.energy.max;
        
        // 多层旋转光圈
        for (let i = 0; i < cfg.layers; i++) {
            const radius = player.radius + 8 + i * 5;
            const rotation = time * cfg.rotationSpeed * (i % 2 === 0 ? 1 : -1);
            const alpha = 0.6 - i * 0.15;
            
            ctx.save();
            ctx.translate(player.x, player.y);
            ctx.rotate(rotation);
            
            // 根据能量改变颜色
            let color;
            if (energyPercent > 0.6) {
                color = CONFIG.player.blockingRingColor;
            } else if (energyPercent > 0.3) {
                color = '#fa0';
            } else {
                color = '#f33';
            }
            
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 3 - i;
            ctx.beginPath();
            
            // 绘制六边形护盾
            for (let j = 0; j < 6; j++) {
                const angle = (Math.PI / 3) * j;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (j === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.stroke();
            
            ctx.restore();
        }
        
        ctx.globalAlpha = 1;
    }
    
    // 玩家本体
    ctx.fillStyle = CONFIG.player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 玩家闪光效果
    if (flashAlpha > 0 && CONFIG.visual && CONFIG.visual.flash && CONFIG.visual.flash.enabled) {
        const flashRadius = player.radius + CONFIG.visual.flash.radius;
        const flashGradient = ctx.createRadialGradient(
            player.x, player.y, player.radius,
            player.x, player.y, flashRadius
        );
        flashGradient.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
        flashGradient.addColorStop(0.5, `rgba(200, 230, 255, ${flashAlpha * 0.6})`);
        flashGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = flashGradient;
        ctx.beginPath();
        ctx.arc(player.x, player.y, flashRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 渲染敌人
function renderEnemies() {
    for (const enemy of enemies) {
        if (enemy.type === 'ranged') {
            renderRangedEnemy(enemy);
        } else {
            renderMeleeEnemy(enemy);
        }
    }
}

// 渲染远程敌人
function renderRangedEnemy(enemy) {
    const cfg = CONFIG.enemies.ranged;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    
    // 应用透明度
    ctx.globalAlpha = enemy.alpha;
    
    if (enemy.state === 'aiming') {
        const aimProgress = (Date.now() - enemy.aimStartTime) / cfg.aimTime;
        
        ctx.strokeStyle = cfg.warningLineColor.replace('0.6', (aimProgress * 0.6).toString());
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(enemy.aimAngle) * 1000, Math.sin(enemy.aimAngle) * 1000);
        ctx.stroke();
        
        ctx.strokeStyle = cfg.warningRingColor.replace('1)', aimProgress + ')');
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size * (1 + aimProgress * 0.5), 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = Math.floor(Date.now() / 100) % 2 === 0 ? cfg.aimColor : cfg.color;
    } else {
        ctx.fillStyle = cfg.color;
    }
    
    ctx.rotate(enemy.angle + Math.PI / 2);
    
    ctx.beginPath();
    ctx.moveTo(0, -enemy.size);
    ctx.lineTo(enemy.size * 0.866, enemy.size * 0.5);
    ctx.lineTo(-enemy.size * 0.866, enemy.size * 0.5);
    ctx.closePath();
    ctx.fill();
    
    // 生成特效（淡入时显示光圈）
    if (isEnemyInvincible(enemy)) {
        ctx.globalAlpha = enemy.alpha * 0.5;
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size * 1.5, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.restore();
}

// 渲染近战敌人
function renderMeleeEnemy(enemy) {
    const cfg = CONFIG.enemies.melee;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    
    // 应用透明度
    ctx.globalAlpha = enemy.alpha;
    
    if (enemy.state === 'warning') {
        const progress = (Date.now() - enemy.stateTime) / enemy.warningTime;
        
        ctx.strokeStyle = cfg.warningRingColor.replace('1)', (1 - progress) + ')');
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size * 2 * (1 + progress * 2), 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.strokeStyle = cfg.warningRing2Color.replace('0.8)', (0.8 - progress * 0.5) + ')');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size * 1.5 * (1 + Math.sin(progress * Math.PI * 4) * 0.3), 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.strokeStyle = cfg.directionLineColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(enemy.attackAngle) * enemy.dashDistance * 0.8, 
                   Math.sin(enemy.attackAngle) * enemy.dashDistance * 0.8);
        ctx.stroke();
    }
    
    if (enemy.state === 'attack') {
        const progress = (Date.now() - enemy.stateTime) / cfg.attackTime;
        for (let i = 0; i < 3; i++) {
            const trailProgress = Math.max(0, progress - i * 0.15);
            if (trailProgress > 0) {
                const trailX = enemy.attackStartX + Math.cos(enemy.attackAngle) * enemy.dashDistance * trailProgress - enemy.x;
                const trailY = enemy.attackStartY + Math.sin(enemy.attackAngle) * enemy.dashDistance * trailProgress - enemy.y;
                
                ctx.fillStyle = cfg.trailColor.replace('0.3)', (0.3 * (1 - i * 0.3)) + ')');
                ctx.beginPath();
                ctx.moveTo(trailX, trailY - enemy.size);
                ctx.lineTo(trailX + enemy.size, trailY);
                ctx.lineTo(trailX, trailY + enemy.size);
                ctx.lineTo(trailX - enemy.size, trailY);
                ctx.closePath();
                ctx.fill();
            }
        }
    }
    
    const size = enemy.size * (enemy.state === 'warning' ? enemy.warningScale : 1);
    const flash = enemy.state === 'warning' && Math.floor(Date.now() / 100) % 2 === 0;
    ctx.fillStyle = flash ? cfg.warningColor : cfg.color;
    
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(-size, 0);
    ctx.closePath();
    ctx.fill();
    
    // 生成特效（淡入时显示光圈）
    if (isEnemyInvincible(enemy)) {
        ctx.globalAlpha = enemy.alpha * 0.5;
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.restore();
}

// 渲染子弹
function renderBullets() {
    ctx.fillStyle = CONFIG.bullet.color;
    for (const bullet of bullets) {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 渲染反击效果
function renderCounterEffect() {
    const cfg = CONFIG.visual && CONFIG.visual.counterEffect ? CONFIG.visual.counterEffect : {
        slashTrailWidth: 30,
        slashGlowLayers: 3,
        slashColor: '#0ff',
        slashGlowColor: '#fff',
        slashSize: 40
    };
    const startX = player.counterStartX;
    const startY = player.counterStartY;
    const endX = player.counterTarget.x;
    const endY = player.counterTarget.y;
    const currentX = player.x;
    const currentY = player.y;
    
    // 计算刀光路径
    const dx = currentX - startX;
    const dy = currentY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    // 连击强化
    const enhanceCfg = CONFIG.visual?.combo?.slashEnhancement;
    const isEnhanced = enhanceCfg?.enabled && comboCount >= (enhanceCfg.threshold || 3);
    const widthBonus = isEnhanced ? (enhanceCfg.widthMultiplier || 1.5) : 1;
    const glowBonus = isEnhanced ? (enhanceCfg.glowIntensity || 1.5) : 1;
    
    // 绘制刀光轨迹（多层）
    for (let layer = cfg.slashGlowLayers - 1; layer >= 0; layer--) {
        const widthMultiplier = 1 - layer * 0.3;
        const width = cfg.slashTrailWidth * widthMultiplier * widthBonus;
        const alpha = (0.6 - layer * 0.15) * (1 - player.counterProgress) * glowBonus;
        
        // 刀光颜色渐变：青→白→金
        let color;
        const gradient = cfg.colorGradient;
        
        if (gradient && gradient.enabled) {
            // 根据进度改变颜色
            const progress = player.counterProgress;
            
            if (layer === 0) {
                // 核心层：白→金渐变
                if (progress < 0.5) {
                    color = cfg.slashGlowColor; // 白色
                } else {
                    color = gradient.endColor; // 金色
                }
            } else if (layer === 1) {
                // 中层：青→白渐变
                if (progress < 0.5) {
                    color = gradient.startColor; // 青色
                } else {
                    color = gradient.midColor; // 白色
                }
            } else {
                // 外层：蓝→青渐变
                color = progress < 0.5 ? '#08f' : gradient.startColor;
            }
        } else {
            // 默认颜色
            if (layer === 0) {
                color = cfg.slashGlowColor;
            } else if (layer === 1) {
                color = cfg.slashColor;
            } else {
                color = '#08f';
            }
        }
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // 绘制刀光路径（带宽度的线条）
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // 主刀光路径
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        // 添加轻微波动效果
        const segments = 10;
        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const x = startX + dx * t;
            const y = startY + dy * t;
            
            // 添加轻微的波动
            const wave = Math.sin(t * Math.PI * 2) * 3 * (1 - player.counterProgress);
            const offsetX = x + Math.cos(angle + Math.PI / 2) * wave;
            const offsetY = y + Math.sin(angle + Math.PI / 2) * wave;
            
            ctx.lineTo(offsetX, offsetY);
        }
        
        ctx.stroke();
        
        // 刀光边缘光晕
        if (layer === cfg.slashGlowLayers - 1) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = cfg.slashColor;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        ctx.restore();
    }
    
    // 刀光粒子效果
    const particleCount = 15;
    for (let i = 0; i < particleCount; i++) {
        const t = i / particleCount;
        const x = startX + dx * t;
        const y = startY + dy * t;
        
        // 粒子向两侧飞散
        const perpAngle = angle + Math.PI / 2;
        const offset = (Math.random() - 0.5) * 20;
        const px = x + Math.cos(perpAngle) * offset;
        const py = y + Math.sin(perpAngle) * offset;
        
        ctx.fillStyle = cfg.slashColor;
        ctx.globalAlpha = (1 - player.counterProgress) * 0.6;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // 闪电链效果
    if (CONFIG.visual && CONFIG.visual.counterEffect && CONFIG.visual.counterEffect.lightningSegments) {
        const segments = CONFIG.visual.counterEffect.lightningSegments;
        ctx.strokeStyle = `rgba(100, 200, 255, ${(1 - player.counterProgress) * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const x = startX + dx * t;
            const y = startY + dy * t;
            const offset = (Math.random() - 0.5) * 15 * (1 - player.counterProgress);
            ctx.lineTo(x + offset, y + offset);
        }
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
    }
    
    // 终点斩击效果
    if (player.counterProgress > CONFIG.counter.slashThreshold) {
        const slashAlpha = (1 - player.counterProgress) * 3;
        const slashSize = cfg.slashSize;
        
        // 十字斩击
        ctx.strokeStyle = cfg.slashGlowColor;
        ctx.globalAlpha = slashAlpha;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(currentX - slashSize, currentY - slashSize);
        ctx.lineTo(currentX + slashSize, currentY + slashSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(currentX + slashSize, currentY - slashSize);
        ctx.lineTo(currentX - slashSize, currentY + slashSize);
        ctx.stroke();
        
        // 斩击光晕
        const glowGradient = ctx.createRadialGradient(
            currentX, currentY, 0,
            currentX, currentY, slashSize * 1.5
        );
        glowGradient.addColorStop(0, `rgba(255, 255, 255, ${slashAlpha * 0.5})`);
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(currentX, currentY, slashSize * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
    }
}

// 启动
window.addEventListener('load', init);
