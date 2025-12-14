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
    
    gameLoop();
}

// 重新开始
function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    startGame();
}

// 创建粒子
function createParticle() {
    const colors = CONFIG.particles.colors;
    return {
        x: Math.random() * CONFIG.canvas.width,
        y: Math.random() * CONFIG.canvas.height,
        vx: (Math.random() - 0.5) * CONFIG.particles.baseSpeed,
        vy: (Math.random() - 0.5) * CONFIG.particles.baseSpeed,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
    };
}

// 创建敌人
function createEnemy(type) {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch(side) {
        case 0: x = Math.random() * CONFIG.canvas.width; y = -20; break;
        case 1: x = CONFIG.canvas.width + 20; y = Math.random() * CONFIG.canvas.height; break;
        case 2: x = Math.random() * CONFIG.canvas.width; y = CONFIG.canvas.height + 20; break;
        case 3: x = -20; y = Math.random() * CONFIG.canvas.height; break;
    }
    
    if (type === 'ranged') {
        const cfg = CONFIG.enemies.ranged;
        const shootInterval = cfg.shootInterval + (Math.random() - 0.5) * cfg.shootIntervalVariance;
        const moveSpeed = cfg.speed * (cfg.speedVarianceMin + Math.random() * (cfg.speedVarianceMax - cfg.speedVarianceMin));
        
        return {
            type: 'ranged',
            x, y,
            size: cfg.size,
            lastShot: Date.now(),
            angle: 0,
            shootInterval: shootInterval,
            state: 'idle',
            aimStartTime: 0,
            movePattern: Math.random() * Math.PI * 2,
            moveSpeed: moveSpeed,
            keepDistance: cfg.keepDistance + (Math.random() - 0.5) * cfg.keepDistanceVariance
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
            zigzagOffset: Math.random() * Math.PI * 2
        };
    }
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
                enemies.splice(index, 1);
                kills++;
                energy = Math.min(CONFIG.energy.max, energy + CONFIG.energy.killRestore);
                
                createParticleBurst(player.x, player.y, CONFIG.effects.killBurstCount);
            }
            
            player.counterAttacking = false;
            player.counterTarget = null;
            player.counterProgress = 0;
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
    
    // 格挡
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
                    triggerCounter(enemy);
                    enemy.state = 'cooldown';
                    enemy.stateTime = now;
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
                createParticleBurst(bullet.x, bullet.y, CONFIG.effects.blockBurstCount);
                triggerCounter();
            } else if (!player.counterAttacking) {
                // 玩家被击中
                gameOver();
            }
        }
    }
}

// 触发反击
function triggerCounter(meleeEnemy = null) {
    // 找到最近的敌人
    let nearest = null;
    let minDist = Infinity;
    
    for (const enemy of enemies) {
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
        
        createParticleBurst(player.x, player.y, CONFIG.counter.particleBurstCount);
    }
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
    // 清空画布
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
    
    // 渲染粒子
    renderParticles();
    
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
    if (player.blocking) {
        ctx.strokeStyle = CONFIG.player.blockingRingColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.strokeStyle = CONFIG.player.blockingRingColor2;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius + 12, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.fillStyle = CONFIG.player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
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
    
    ctx.restore();
}

// 渲染近战敌人
function renderMeleeEnemy(enemy) {
    const cfg = CONFIG.enemies.melee;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    
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
    const cfg = CONFIG.counter;
    const startX = player.counterStartX;
    const startY = player.counterStartY;
    
    ctx.strokeStyle = cfg.trailColor.replace('1)', (1 - player.counterProgress) + ')');
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(player.x, player.y);
    ctx.stroke();
    
    if (player.counterProgress > cfg.slashThreshold) {
        ctx.strokeStyle = cfg.slashColor.replace('1)', ((1 - player.counterProgress) * 3) + ')');
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(player.x - 20, player.y - 20);
        ctx.lineTo(player.x + 20, player.y + 20);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(player.x + 20, player.y - 20);
        ctx.lineTo(player.x - 20, player.y + 20);
        ctx.stroke();
    }
}

// 启动
window.addEventListener('load', init);
