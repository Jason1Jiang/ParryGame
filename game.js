// 游戏配置
const CONFIG = {
    canvas: { width: 800, height: 600 },
    player: {
        radius: 15,
        speed: 4,
        color: '#fff'
    },
    energy: {
        max: 100,
        drainRate: 25, // 每秒消耗
        regenRate: 25, // 每秒恢复
        killRestore: 18
    },
    particles: {
        count: 800,
        baseSpeed: 0.3
    },
    enemies: {
        ranged: {
            size: 18,
            speed: 1.5,
            shootInterval: 1500,
            color: '#f33'
        },
        melee: {
            size: 12,
            speed: 5,
            attackRange: 70,
            warningTime: 400,
            attackTime: 150,
            cooldownTime: 1200,
            dashDistance: 90,
            color: '#fa0'
        }
    },
    bullet: {
        radius: 4,
        speed: 5,
        color: '#f55'
    }
};

// 游戏状态
let canvas, ctx;
let gameState = 'start'; // start, playing, gameOver
let player, particles, enemies, bullets;
let keys = {};
let energy, kills, gameTime, startTime;
let lastEnemySpawn = 0;
let enemySpawnInterval = 2000;

// 初始化
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
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
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('ui').style.display = 'block';
    
    gameState = 'playing';
    energy = CONFIG.energy.max;
    kills = 0;
    gameTime = 0;
    startTime = Date.now();
    lastEnemySpawn = 0;
    
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
    return {
        x: Math.random() * CONFIG.canvas.width,
        y: Math.random() * CONFIG.canvas.height,
        vx: (Math.random() - 0.5) * CONFIG.particles.baseSpeed,
        vy: (Math.random() - 0.5) * CONFIG.particles.baseSpeed,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
        color: Math.random() > 0.5 ? '#aaf' : '#faf'
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
        return {
            type: 'ranged',
            x, y,
            size: CONFIG.enemies.ranged.size,
            lastShot: Date.now(),
            angle: 0
        };
    } else {
        return {
            type: 'melee',
            x, y,
            size: CONFIG.enemies.melee.size,
            state: 'chase', // chase, warning, attack, cooldown
            stateTime: 0,
            angle: 0,
            attackStartX: 0,
            attackStartY: 0,
            warningScale: 1
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
        const type = (gameTime > 30 && Math.random() < 0.3) ? 'melee' : 'ranged';
        enemies.push(createEnemy(type));
        lastEnemySpawn = now;
        enemySpawnInterval = Math.max(800, 2000 - gameTime * 20);
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
        player.counterProgress += 0.15;
        if (player.counterProgress >= 1) {
            player.x = player.counterTarget.x;
            player.y = player.counterTarget.y;
            
            // 击杀敌人
            const index = enemies.indexOf(player.counterTarget);
            if (index > -1) {
                enemies.splice(index, 1);
                kills++;
                energy = Math.min(CONFIG.energy.max, energy + CONFIG.energy.killRestore);
                
                // 粒子爆发
                createParticleBurst(player.x, player.y, 30);
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
            
            // 粒子扰动
            disturbParticles(player.x, player.y, 50, 8);
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
        
        // 轻微粒子扰动
        disturbParticles(player.x, player.y, 30, 2);
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
    // 计算角度
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    enemy.angle = Math.atan2(dy, dx);
    
    // 缓慢移动
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 200) {
        enemy.x += Math.cos(enemy.angle) * CONFIG.enemies.ranged.speed;
        enemy.y += Math.sin(enemy.angle) * CONFIG.enemies.ranged.speed;
    }
    
    // 射击
    if (now - enemy.lastShot > CONFIG.enemies.ranged.shootInterval) {
        bullets.push({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(enemy.angle) * CONFIG.bullet.speed,
            vy: Math.sin(enemy.angle) * CONFIG.bullet.speed,
            radius: CONFIG.bullet.radius
        });
        enemy.lastShot = now;
    }
}

// 更新近战敌人
function updateMeleeEnemy(enemy, now) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    enemy.angle = Math.atan2(dy, dx);
    
    switch(enemy.state) {
        case 'chase':
            // 追击玩家
            enemy.x += Math.cos(enemy.angle) * CONFIG.enemies.melee.speed;
            enemy.y += Math.sin(enemy.angle) * CONFIG.enemies.melee.speed;
            
            // 进入攻击范围
            if (dist < CONFIG.enemies.melee.attackRange) {
                enemy.state = 'warning';
                enemy.stateTime = now;
                enemy.warningScale = 1;
            }
            break;
            
        case 'warning':
            // 警告阶段
            const warningElapsed = now - enemy.stateTime;
            enemy.warningScale = 1 + Math.sin(warningElapsed / 50) * 0.3;
            
            if (warningElapsed > CONFIG.enemies.melee.warningTime) {
                enemy.state = 'attack';
                enemy.stateTime = now;
                enemy.attackStartX = enemy.x;
                enemy.attackStartY = enemy.y;
            }
            break;
            
        case 'attack':
            // 攻击阶段
            const attackElapsed = now - enemy.stateTime;
            const attackProgress = Math.min(1, attackElapsed / CONFIG.enemies.melee.attackTime);
            
            enemy.x = enemy.attackStartX + Math.cos(enemy.angle) * CONFIG.enemies.melee.dashDistance * attackProgress;
            enemy.y = enemy.attackStartY + Math.sin(enemy.angle) * CONFIG.enemies.melee.dashDistance * attackProgress;
            
            // 粒子扰动
            disturbParticles(enemy.x, enemy.y, 40, 5);
            
            // 检测碰撞
            if (checkMeleeHit(enemy)) {
                if (player.blocking && !player.counterAttacking) {
                    // 格挡成功，触发反击
                    triggerCounter(enemy);
                    enemy.state = 'cooldown';
                    enemy.stateTime = now;
                } else if (!player.counterAttacking) {
                    // 玩家被击中
                    gameOver();
                    return;
                }
            }
            
            if (attackElapsed > CONFIG.enemies.melee.attackTime) {
                enemy.state = 'cooldown';
                enemy.stateTime = now;
            }
            break;
            
        case 'cooldown':
            // 冷却阶段
            if (now - enemy.stateTime > CONFIG.enemies.melee.cooldownTime) {
                enemy.state = 'chase';
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
                createParticleBurst(bullet.x, bullet.y, 15);
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
        
        // 粒子爆发
        createParticleBurst(player.x, player.y, 25);
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
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 5 + Math.random() * 3;
        
        for (const p of particles) {
            const dx = p.x - x;
            const dy = p.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 100) {
                p.vx += Math.cos(angle) * speed * (1 - dist / 100);
                p.vy += Math.sin(angle) * speed * (1 - dist / 100);
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
    // 格挡光环
    if (player.blocking) {
        ctx.strokeStyle = '#0cf';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.strokeStyle = '#0af';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius + 12, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // 玩家本体
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
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(enemy.angle + Math.PI / 2);
    
    ctx.fillStyle = CONFIG.enemies.ranged.color;
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
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    
    // 警告光圈
    if (enemy.state === 'warning') {
        const progress = (Date.now() - enemy.stateTime) / CONFIG.enemies.melee.warningTime;
        ctx.strokeStyle = `rgba(255, 50, 50, ${1 - progress})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size * 2 * (1 + progress), 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // 攻击残影
    if (enemy.state === 'attack') {
        const progress = (Date.now() - enemy.stateTime) / CONFIG.enemies.melee.attackTime;
        for (let i = 0; i < 3; i++) {
            const trailProgress = Math.max(0, progress - i * 0.15);
            if (trailProgress > 0) {
                const trailX = enemy.attackStartX + Math.cos(enemy.angle) * CONFIG.enemies.melee.dashDistance * trailProgress - enemy.x;
                const trailY = enemy.attackStartY + Math.sin(enemy.angle) * CONFIG.enemies.melee.dashDistance * trailProgress - enemy.y;
                
                ctx.fillStyle = `rgba(255, 170, 0, ${0.3 * (1 - i * 0.3)})`;
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
    
    // 敌人本体
    const size = enemy.size * (enemy.state === 'warning' ? enemy.warningScale : 1);
    const flash = enemy.state === 'warning' && Math.floor(Date.now() / 100) % 2 === 0;
    ctx.fillStyle = flash ? '#fff' : CONFIG.enemies.melee.color;
    
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
    const startX = player.counterStartX;
    const startY = player.counterStartY;
    const endX = player.counterTarget.x;
    const endY = player.counterTarget.y;
    
    // 轨迹线
    ctx.strokeStyle = `rgba(0, 200, 255, ${1 - player.counterProgress})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(player.x, player.y);
    ctx.stroke();
    
    // 斩击光效
    if (player.counterProgress > 0.7) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - player.counterProgress) * 3})`;
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
init();
