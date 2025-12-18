// 游戏配置
let CONFIG = null;
let selectedDifficulty = 'balanced'; // 默认平衡模式
let debugMode = false; // 调试模式
let isMobile = false; // 移动设备标识

// 难度预设配置
const DIFFICULTY_PRESETS = {
    hardcore: {
        name: '硬核',
        spawn: {
            initialInterval: 1000,
            minInterval: 300,
            maxInterval: 2000,
            dynamicSpawn: {
                killTracking: {
                    adjustFactor: 0.6,
                    trackCount: 5
                },
                comboBoost: {
                    thresholds: [3, 5, 10],
                    multipliers: [0.85, 0.6, 0.4]
                },
                enemyCountControl: {
                    baseTarget: 5,
                    maxTarget: 15
                }
            }
        }
    },
    balanced: {
        name: '平衡',
        spawn: {
            initialInterval: 1500,
            minInterval: 400,
            maxInterval: 2500,
            dynamicSpawn: {
                killTracking: {
                    adjustFactor: 0.75,
                    trackCount: 5
                },
                comboBoost: {
                    thresholds: [3, 5, 10, 15],
                    multipliers: [0.9, 0.75, 0.6, 0.5]
                },
                enemyCountControl: {
                    baseTarget: 4,
                    maxTarget: 12
                }
            }
        }
    },
    casual: {
        name: '休闲',
        spawn: {
            initialInterval: 2500,
            minInterval: 1000,
            maxInterval: 3500,
            dynamicSpawn: {
                killTracking: {
                    adjustFactor: 0.9,
                    trackCount: 3
                },
                comboBoost: {
                    enabled: false
                },
                enemyCountControl: {
                    baseTarget: 3,
                    maxTarget: 8
                }
            }
        }
    }
};

// 游戏状态
let canvas, ctx;
let gameState = 'start'; // start, playing, gameOver
let player, particles, enemies, bullets;
let keys = {};
let isMobile = false; // 移动端标识
let energy, kills, gameTime, startTime;
let lastEnemySpawn = 0;
let enemySpawnInterval = 2000;

// 动态刷怪系统
let recentKillTimes = [];        // 最近击杀的时间戳
let recentKillIntervals = [];    // 最近击杀的间隔
let avgKillInterval = 2000;      // 平均击杀间隔
let dynamicSpawnInterval = 1500; // 动态计算的刷怪间隔
let targetEnemyCount = 4;        // 目标敌人数量

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

// 玩家死亡动画状态
let playerDying = false;
let deathAnimationStartTime = 0;
let deathParticles = [];
let playerDeathAlpha = 1.0;
let playerDeathScale = 1.0;
let playerDeathRotation = 0;
let deathFadeAlpha = 0;
let slashTrails = []; // 刀光残留
let lastParryTime = 0; // 上次格挡时间
let perfectParryCombo = 0; // 完美格挡连击数
let perfectParryComboTimer = 0; // 完美格挡连击计时器
let audioContext = null; // 音频上下文
let blockKeyPressTime = 0; // 格挡键按下时间
let multiCounterQueue = []; // 多重反击队列
let multiCounterActive = false; // 多重反击是否激活
let wasPressingBlockKeyLastFrame = false; // 上一帧是否按着格挡键
let spawnWarnings = []; // 生成预警

// 无敌状态系统
let playerInvincible = false;
let invincibleEndTime = 0;
let invincibleReason = null;

// 边缘发光状态
let comboGlowActive = false;
let comboGlowProgress = 0;
let comboGlowDuration = 0;
let comboGlowStartTime = 0;

// 加载配置
async function loadConfig() {
    try {
        // 添加时间戳防止缓存
        const response = await fetch('config.json?t=' + Date.now());
        CONFIG = await response.json();
        console.log('配置加载成功:', CONFIG);
        console.log('spawn配置:', CONFIG.spawn);
    } catch (error) {
        console.error('配置加载失败:', error);
        alert('无法加载游戏配置文件！');
    }
}

// 应用难度预设
function applyDifficultyPreset(difficulty) {
    const preset = DIFFICULTY_PRESETS[difficulty];
    if (!preset || !CONFIG) return;
    
    // 深度合并配置
    if (preset.spawn) {
        CONFIG.spawn.initialInterval = preset.spawn.initialInterval;
        CONFIG.spawn.minInterval = preset.spawn.minInterval;
        CONFIG.spawn.maxInterval = preset.spawn.maxInterval;
        
        if (preset.spawn.dynamicSpawn) {
            const ds = preset.spawn.dynamicSpawn;
            
            if (ds.killTracking) {
                CONFIG.spawn.dynamicSpawn.killTracking.adjustFactor = ds.killTracking.adjustFactor;
                CONFIG.spawn.dynamicSpawn.killTracking.trackCount = ds.killTracking.trackCount;
            }
            
            if (ds.comboBoost) {
                if (ds.comboBoost.enabled === false) {
                    CONFIG.spawn.dynamicSpawn.comboBoost.enabled = false;
                } else {
                    CONFIG.spawn.dynamicSpawn.comboBoost.enabled = true;
                    if (ds.comboBoost.thresholds) {
                        CONFIG.spawn.dynamicSpawn.comboBoost.thresholds = ds.comboBoost.thresholds;
                    }
                    if (ds.comboBoost.multipliers) {
                        CONFIG.spawn.dynamicSpawn.comboBoost.multipliers = ds.comboBoost.multipliers;
                    }
                }
            }
            
            if (ds.enemyCountControl) {
                CONFIG.spawn.dynamicSpawn.enemyCountControl.baseTarget = ds.enemyCountControl.baseTarget;
                CONFIG.spawn.dynamicSpawn.enemyCountControl.maxTarget = ds.enemyCountControl.maxTarget;
            }
        }
    }
    
    console.log(`已应用难度预设: ${preset.name}`, CONFIG.spawn);
}

// 选择难度
function selectDifficulty(difficulty) {
    selectedDifficulty = difficulty;
    applyDifficultyPreset(difficulty);
    document.getElementById('difficultySelect').style.display = 'none';
    startGame();
}

// 显示难度选择
function showDifficultySelect() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('difficultySelect').style.display = 'block';
}

// 返回开始界面
function backToStart() {
    document.getElementById('difficultySelect').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
}

// 切换调试模式
function toggleDebug() {
    debugMode = !debugMode;
    const panel = document.getElementById('debugPanel');
    panel.style.display = debugMode ? 'block' : 'none';
}

// 更新调试信息
function updateDebugInfo() {
    if (!debugMode) return;
    
    const spawnInterval = Math.round(enemySpawnInterval);
    const avgKill = Math.round(avgKillInterval);
    const comboMult = getComboMultiplier(comboCount);
    const countMult = getEnemyCountMultiplier();
    const targetCount = Math.round(targetEnemyCount);
    
    // 刷怪间隔（根据速度显示不同颜色）
    const intervalEl = document.getElementById('debugSpawnInterval');
    intervalEl.textContent = spawnInterval + 'ms';
    if (spawnInterval < 600) {
        intervalEl.className = 'debug-value danger';
    } else if (spawnInterval < 1200) {
        intervalEl.className = 'debug-value warning';
    } else {
        intervalEl.className = 'debug-value good';
    }
    
    // 平均击杀间隔
    document.getElementById('debugAvgKill').textContent = avgKill + 'ms';
    
    // 连击
    const comboEl = document.getElementById('debugCombo');
    comboEl.textContent = comboCount + 'x';
    if (comboCount >= 10) {
        comboEl.className = 'debug-value danger';
    } else if (comboCount >= 5) {
        comboEl.className = 'debug-value warning';
    } else {
        comboEl.className = 'debug-value';
    }
    
    // 连击倍率
    document.getElementById('debugComboMult').textContent = comboMult.toFixed(2) + 'x';
    
    // 敌人数量
    const enemyCountEl = document.getElementById('debugEnemyCount');
    enemyCountEl.textContent = enemies.length;
    if (enemies.length > targetCount + 3) {
        enemyCountEl.className = 'debug-value danger';
    } else if (enemies.length < targetCount - 2) {
        enemyCountEl.className = 'debug-value warning';
    } else {
        enemyCountEl.className = 'debug-value good';
    }
    
    // 目标数量
    document.getElementById('debugTargetCount').textContent = targetCount;
    
    // 数量倍率
    const countMultEl = document.getElementById('debugCountMult');
    countMultEl.textContent = countMult.toFixed(2) + 'x';
    if (countMult < 1.0) {
        countMultEl.className = 'debug-value danger';
    } else if (countMult > 1.0) {
        countMultEl.className = 'debug-value warning';
    } else {
        countMultEl.className = 'debug-value';
    }
    
    // 难度模式
    const difficultyName = DIFFICULTY_PRESETS[selectedDifficulty]?.name || '未知';
    document.getElementById('debugDifficulty').textContent = difficultyName;
}

// 设备检测
function isMobileDevice() {
    // 方法1：检测触摸支持
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // 方法2：检测屏幕尺寸
    const isSmallScreen = window.innerWidth <= 768;
    
    // 方法3：检测 User Agent
    const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    return hasTouch && (isSmallScreen || mobileUA);
}

// 设置触屏事件
function setupTouchEvents() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    // 触摸开始 = 格挡开始
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys[' '] = true;
        
        // 触摸反馈
        if (CONFIG.mobile?.touch?.feedbackEnabled) {
            showTouchFeedback(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false });
    
    // 触摸结束 = 格挡结束
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys[' '] = false;
    }, { passive: false });
    
    // 触摸移动时保持格挡
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
    
    // 防止双击缩放
    if (CONFIG.mobile?.touch?.preventZoom) {
        document.addEventListener('dblclick', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
    
    // 防止长按菜单
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    }, { passive: false });
    
    console.log('触屏事件已设置');
}

// 显示触摸反馈
function showTouchFeedback(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'touch-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    document.body.appendChild(ripple);
    
    const duration = CONFIG.mobile?.touch?.feedbackDuration || 600;
    setTimeout(() => ripple.remove(), duration);
}

// 设备检测
function isMobileDevice() {
    // 方法1：检测触摸支持
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // 方法2：检测屏幕尺寸
    const isSmallScreen = window.innerWidth <= 768;
    
    // 方法3：检测 User Agent
    const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    return hasTouch && (isSmallScreen || mobileUA);
}

// 设置触屏控制
function setupTouchControls() {
    if (!canvas) return;
    
    // 触摸开始 = 格挡开始
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys[' '] = true;  // 模拟空格键
        
        // 视觉反馈
        if (CONFIG.mobile?.touch?.feedbackEnabled) {
            showTouchFeedback(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false });
    
    // 触摸结束 = 格挡结束
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys[' '] = false;
    }, { passive: false });
    
    // 触摸移动时保持格挡
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        // 保持格挡状态
    }, { passive: false });
}

// 显示触摸反馈
function showTouchFeedback(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'touch-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'fixed';
    ripple.style.width = '100px';
    ripple.style.height = '100px';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'radial-gradient(circle, rgba(0, 204, 255, 0.5), transparent)';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '9999';
    ripple.style.animation = 'ripple 0.6s ease-out';
    document.body.appendChild(ripple);
    
    // 动画结束后移除
    setTimeout(() => ripple.remove(), 600);
}

// 防止默认触摸行为
function preventDefaultTouchBehaviors() {
    // 防止双击缩放
    document.addEventListener('dblclick', (e) => {
        e.preventDefault();
    }, { passive: false });
    
    // 防止长按菜单
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    }, { passive: false });
    
    // 防止拖拽
    document.addEventListener('touchmove', (e) => {
        if (e.target === canvas) {
            e.preventDefault();
        }
    }, { passive: false });
}

// 画布自适应
function resizeCanvas() {
    if (!canvas || !CONFIG) return;
    
    if (isMobile && CONFIG.mobile?.canvas?.autoResize) {
        // 移动端：全屏显示
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;
        
        CONFIG.canvas.width = containerWidth;
        CONFIG.canvas.height = containerHeight;
        
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        canvas.style.width = containerWidth + 'px';
        canvas.style.height = containerHeight + 'px';
        
        console.log(`Canvas resized to: ${containerWidth}x${containerHeight}`);
    } else {
        // 桌面端：固定尺寸
        canvas.width = CONFIG.canvas.width;
        canvas.height = CONFIG.canvas.height;
        canvas.style.width = CONFIG.canvas.width + 'px';
        canvas.style.height = CONFIG.canvas.height + 'px';
    }
}

// 初始化
async function init() {
    try {
        canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error('无法找到 gameCanvas 元素');
            return;
        }
        ctx = canvas.getContext('2d');
        
        // 加载配置
        await loadConfig();
        
        // 检查配置是否加载成功
        if (!CONFIG) {
            console.error('配置加载失败，无法初始化游戏');
            alert('游戏配置加载失败，请刷新页面重试');
            return;
        }
        
        // 检测设备类型
        isMobile = isMobileDevice();
        console.log('设备类型:', isMobile ? '移动端' : '桌面端');
        
        // 移动端初始化
        if (isMobile) {
            // 设置 viewport
            let viewport = document.querySelector('meta[name="viewport"]');
            if (!viewport) {
                viewport = document.createElement('meta');
                viewport.name = 'viewport';
                document.head.appendChild(viewport);
            }
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            
            // 添加移动端样式类
            document.body.classList.add('mobile-mode');
            
            // 设置触屏控制
            setupTouchControls();
            
            // 防止默认触摸行为
            preventDefaultTouchBehaviors();
            
            // 调整画布大小
            resizeCanvas();
            
            // 监听窗口大小变化
            window.addEventListener('resize', resizeCanvas);
            
            // 监听屏幕方向变化
            window.addEventListener('orientationchange', () => {
                setTimeout(resizeCanvas, 100);
            });
        }
        
        // 初始化音频（包括BGM）
        initAudio();
        
        // 初始化菜单粒子
        particles = [];
        for (let i = 0; i < CONFIG.particles.count; i++) {
            particles.push(createParticle());
        }
        
        // 启动菜单粒子循环
        menuParticleLoop();
    } catch (error) {
        console.error('初始化失败:', error);
        alert('游戏初始化失败: ' + error.message);
        return;
    }
    
    // 移动端触屏事件
    if (isMobile && CONFIG.mobile?.touch?.enabled) {
        setupTouchEvents();
    }
    
    // 键盘事件
    document.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        if (e.key === ' ') e.preventDefault();
        
        // F3 切换调试模式
        if (e.key === 'F3') {
            e.preventDefault();
            toggleDebug();
        }
    });
    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });
    
    // 鼠标事件 - 左键作为格挡
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // 左键
            keys[' '] = true;
            e.preventDefault();
        }
    });
    canvas.addEventListener('mouseup', (e) => {
        if (e.button === 0) { // 左键
            keys[' '] = false;
            e.preventDefault();
        }
    });
    // 防止鼠标移出canvas时格挡状态卡住
    canvas.addEventListener('mouseleave', () => {
        keys[' '] = false;
    });
}

// 菜单粒子循环（在主界面显示粒子）
function menuParticleLoop() {
    // 如果游戏正在进行，不渲染菜单粒子
    if (gameState === 'playing') {
        requestAnimationFrame(menuParticleLoop);
        return;
    }
    
    // 清空画布
    ctx.fillStyle = CONFIG.visual.background.backgroundColor;
    ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
    
    // 更新和渲染粒子
    updateParticles();
    renderParticles();
    
    requestAnimationFrame(menuParticleLoop);
}

// 开始游戏
function startGame() {
    if (!CONFIG) {
        alert('配置未加载，请刷新页面重试！');
        return;
    }
    
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('ui').style.display = 'block';
    document.getElementById('controls').style.display = 'block';
    document.getElementById('debugToggle').style.display = 'block';
    
    // 播放战斗音乐
    playBattleBGM();
    
    gameState = 'playing';
    energy = CONFIG.energy.max;
    kills = 0;
    gameTime = 0;
    startTime = Date.now();
    lastEnemySpawn = 0;
    enemySpawnInterval = CONFIG.spawn.initialInterval;
    
    // 重置动态刷怪系统
    recentKillTimes = [];
    recentKillIntervals = [];
    avgKillInterval = CONFIG.spawn.initialInterval;
    dynamicSpawnInterval = CONFIG.spawn.initialInterval;
    targetEnemyCount = CONFIG.spawn.dynamicSpawn?.enemyCountControl?.baseTarget || 4;
    
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
    
    // 重置无敌状态
    playerInvincible = false;
    invincibleEndTime = 0;
    invincibleReason = null;
    
    // 重置边缘发光
    comboGlowActive = false;
    comboGlowProgress = 0;
    comboGlowDuration = 0;
    comboGlowStartTime = 0;
    
    // 移动端：显示操作提示
    if (isMobile && CONFIG.mobile?.ui?.showHint) {
        showMobileHint();
    }
    
    gameLoop();
}

// 显示移动端提示
function showMobileHint() {
    const hint = document.getElementById('mobileHint');
    if (!hint) return;
    
    hint.style.display = 'block';
    
    // 3秒后淡出
    const duration = CONFIG.mobile?.ui?.hintDuration || 3000;
    setTimeout(() => {
        hint.style.transition = 'opacity 0.5s ease-out';
        hint.style.opacity = '0';
        setTimeout(() => {
            hint.style.display = 'none';
            hint.style.opacity = '1';
        }, 500);
    }, duration);
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
    
    // 移动端：强制在屏幕内刷新
    if (isMobile && CONFIG.mobile?.spawn?.forceInScreen) {
        const margin = CONFIG.mobile.spawn.screenMargin || 80;
        const spawnWidth = CONFIG.canvas.width - margin * 2;
        const spawnHeight = CONFIG.canvas.height - margin * 2;
        const minDistFromPlayer = CONFIG.mobile.spawn.minDistanceFromPlayer || 150;
        const minDistBetweenEnemies = CONFIG.spawn.minDistanceBetweenEnemies || 100;
        
        // 尝试找到合适的位置（最多尝试30次）
        let attempts = 0;
        let validPosition = false;
        
        while (attempts < 30 && !validPosition) {
            x = margin + Math.random() * spawnWidth;
            y = margin + Math.random() * spawnHeight;
            
            // 检查与玩家的距离
            const dxPlayer = x - player.x;
            const dyPlayer = y - player.y;
            const distToPlayer = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer);
            
            if (distToPlayer < minDistFromPlayer) {
                attempts++;
                continue;
            }
            
            // 检查与其他敌人的距离
            let tooClose = false;
            for (const enemy of enemies) {
                const dxEnemy = x - enemy.x;
                const dyEnemy = y - enemy.y;
                const distToEnemy = Math.sqrt(dxEnemy * dxEnemy + dyEnemy * dyEnemy);
                
                if (distToEnemy < minDistBetweenEnemies) {
                    tooClose = true;
                    break;
                }
            }
            
            if (!tooClose) {
                validPosition = true;
            }
            attempts++;
        }
        
        // 如果30次都没找到合适位置，使用最后一次的位置
        if (!validPosition) {
            x = margin + Math.random() * spawnWidth;
            y = margin + Math.random() * spawnHeight;
        }
    }
    // 桌面端：使用原有逻辑
    else if (CONFIG.spawn.spawnInField) {
        // 在场内随机位置生成，保持一定边距，并避开玩家和其他敌人
        const margin = Math.min(CONFIG.spawn.spawnMargin, CONFIG.canvas.width / 4, CONFIG.canvas.height / 4);
        const spawnWidth = CONFIG.canvas.width - margin * 2;
        const spawnHeight = CONFIG.canvas.height - margin * 2;
        const minDistFromPlayer = CONFIG.spawn.minDistanceFromPlayer;
        const minDistBetweenEnemies = CONFIG.spawn.minDistanceBetweenEnemies || 100;
        
        // 尝试找到合适的位置（最多尝试20次）
        let attempts = 0;
        let validPosition = false;
        
        while (attempts < 20 && !validPosition) {
            x = margin + Math.random() * spawnWidth;
            y = margin + Math.random() * spawnHeight;
            
            // 检查与玩家的距离
            const dxPlayer = x - player.x;
            const dyPlayer = y - player.y;
            const distToPlayer = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer);
            
            if (distToPlayer < minDistFromPlayer) {
                attempts++;
                continue;
            }
            
            // 检查与其他敌人的距离（避免扎堆）
            let tooClose = false;
            for (const enemy of enemies) {
                const dxEnemy = x - enemy.x;
                const dyEnemy = y - enemy.y;
                const distToEnemy = Math.sqrt(dxEnemy * dxEnemy + dyEnemy * dyEnemy);
                
                if (distToEnemy < minDistBetweenEnemies) {
                    tooClose = true;
                    break;
                }
            }
            
            if (!tooClose) {
                validPosition = true;
            }
            attempts++;
        }
        
        // 如果20次都没找到合适位置，使用最后一次的位置
        if (!validPosition) {
            x = margin + Math.random() * spawnWidth;
            y = margin + Math.random() * spawnHeight;
        }
    } else {
        // 从边缘生成（原逻辑）
        const side = Math.floor(Math.random() * 4);
        switch(side) {
            case 0: x = Math.random() * CONFIG.canvas.width; y = -20; break;
            case 1: x = CONFIG.canvas.width + 20; y = Math.random() * CONFIG.canvas.height; break;
            case 2: x = Math.random() * CONFIG.canvas.width; y = CONFIG.canvas.height + 20; break;
            case 3: x = -20; y = Math.random() * CONFIG.canvas.height; break;
        }
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

// 创建生成特效（根据敌人类型）
function createSpawnEffect(x, y, type) {
    const typeEffects = CONFIG.spawn.typeSpecificEffects;
    const effectCfg = typeEffects && typeEffects[type] ? typeEffects[type] : null;
    
    // 粒子爆发
    const particleCount = CONFIG.spawn.spawnParticles;
    const speed = CONFIG.spawn.spawnParticleSpeed;
    const particleColor = effectCfg ? effectCfg.particleColor : '#0ff';
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const particle = {
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 2 + 1,
            alpha: 1,
            color: particleColor,
            life: 30
        };
        
        // 添加到粒子数组（需要标记为临时粒子）
        particle.isSpawnParticle = true;
        particles.push(particle);
    }
    
    // 冲击波
    const shockwaveColor = effectCfg ? effectCfg.shockwaveColor : '#0ff';
    createShockwave(x, y, 80, shockwaveColor);
    
    // 音效
    if (CONFIG.spawn.spawnSound) {
        playSpawnSound(type);
    }
}

// 播放生成音效
function playSpawnSound() {
    if (!audioContext || !CONFIG.visual?.audio?.enabled) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 从高频到低频的下降音效
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2);
        oscillator.type = 'sine';
        
        const volume = CONFIG.visual.audio.volume * 0.3; // 生成音效音量较小
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
        console.warn('Error playing spawn sound:', e);
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

// 动态刷怪系统函数

// 记录击杀
function recordKill() {
    const now = Date.now();
    recentKillTimes.push(now);
    
    // 计算间隔
    if (recentKillTimes.length >= 2) {
        const interval = now - recentKillTimes[recentKillTimes.length - 2];
        recentKillIntervals.push(interval);
    }
    
    // 只保留最近N次
    const cfg = CONFIG.spawn.dynamicSpawn;
    if (cfg && cfg.killTracking) {
        const trackCount = cfg.killTracking.trackCount;
        if (recentKillTimes.length > trackCount) {
            recentKillTimes.shift();
        }
        if (recentKillIntervals.length > trackCount) {
            recentKillIntervals.shift();
        }
    }
    
    // 更新平均值
    updateAvgKillInterval();
}

// 更新平均击杀间隔
function updateAvgKillInterval() {
    if (recentKillIntervals.length === 0) return;
    
    const sum = recentKillIntervals.reduce((a, b) => a + b, 0);
    avgKillInterval = sum / recentKillIntervals.length;
}

// 获取连击倍率
function getComboMultiplier(combo) {
    const cfg = CONFIG.spawn.dynamicSpawn?.comboBoost;
    if (!cfg || !cfg.enabled) return 1.0;
    
    const thresholds = cfg.thresholds;
    const multipliers = cfg.multipliers;
    
    for (let i = thresholds.length - 1; i >= 0; i--) {
        if (combo >= thresholds[i]) {
            return multipliers[i];
        }
    }
    
    return 1.0;
}

// 获取敌人数量倍率
function getEnemyCountMultiplier() {
    const cfg = CONFIG.spawn.dynamicSpawn?.enemyCountControl;
    if (!cfg || !cfg.enabled) return 1.0;
    
    // 更新目标敌人数量
    targetEnemyCount = Math.min(
        cfg.maxTarget,
        cfg.baseTarget + gameTime * cfg.increasePerSecond
    );
    
    const currentCount = enemies.length;
    const diff = currentCount - targetEnemyCount;
    
    if (diff < -2) {
        // 敌人太少，加快刷怪
        return cfg.underflowMultiplier;
    } else if (diff > 3) {
        // 敌人太多，减缓刷怪
        return cfg.overflowMultiplier;
    }
    
    return 1.0;
}

// 计算动态刷怪间隔
function calculateDynamicSpawnInterval() {
    const cfg = CONFIG.spawn.dynamicSpawn;
    
    // 检查是否启用
    if (!cfg || !cfg.enabled) {
        return CONFIG.spawn.initialInterval;
    }
    
    // 检查是否达到启动条件
    if (cfg.killTracking && kills < cfg.killTracking.kickInKills) {
        return CONFIG.spawn.initialInterval;
    }
    
    let interval = CONFIG.spawn.initialInterval;
    
    // 1. 基于击杀速度
    if (cfg.killTracking?.enabled && recentKillIntervals.length > 0) {
        interval = avgKillInterval * cfg.killTracking.adjustFactor;
    }
    
    // 2. 连击加成
    if (cfg.comboBoost?.enabled) {
        const multiplier = getComboMultiplier(comboCount);
        interval *= multiplier;
    }
    
    // 3. 敌人数量修正
    if (cfg.enemyCountControl?.enabled) {
        const countMultiplier = getEnemyCountMultiplier();
        interval *= countMultiplier;
    }
    
    // 4. 平滑过渡
    if (cfg.killTracking?.smoothing) {
        const smoothing = cfg.killTracking.smoothing;
        dynamicSpawnInterval += (interval - dynamicSpawnInterval) * smoothing;
        interval = dynamicSpawnInterval;
    }
    
    // 5. 移动端：延长刷怪间隔
    if (isMobile && CONFIG.mobile?.gameplay?.spawnIntervalMultiplier) {
        interval *= CONFIG.mobile.gameplay.spawnIntervalMultiplier;
    }
    
    // 6. 限制范围
    const minInterval = CONFIG.spawn.minInterval || 400;
    const maxInterval = CONFIG.spawn.maxInterval || 2500;
    return Math.max(minInterval, Math.min(maxInterval, interval));
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
        // 获取粒子颜色（优先使用配置，否则使用默认值）
        const particleColors = cfg.particleColors || { ranged: '#f55', melee: '#fa0' };
        const particleColor = enemy.type === 'ranged' ? particleColors.ranged : particleColors.melee;
        
        lastAnim.particles.push({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 3 + 1,
            color: particleColor,
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

// 触发连击边缘发光
function triggerComboGlow() {
    const cfg = CONFIG.visual?.edgeGlow?.combo;
    if (!cfg || !cfg.enabled) return;
    
    comboGlowActive = true;
    comboGlowProgress = 0;
    comboGlowStartTime = Date.now();
    
    // 根据连击数设置持续时间
    const intensity = getComboGlowIntensity(comboCount);
    comboGlowDuration = intensity.duration;
}

// 更新连击边缘发光
function updateComboGlow() {
    if (!comboGlowActive) return;
    
    const elapsed = Date.now() - comboGlowStartTime;
    comboGlowProgress = elapsed / comboGlowDuration;
    
    if (comboGlowProgress >= 1) {
        comboGlowActive = false;
        comboGlowProgress = 0;
    }
}

// 获取连击颜色
function getComboColor(combo) {
    const cfg = CONFIG.visual?.edgeGlow?.combo;
    if (!cfg || !cfg.colors) return '#FFFFFF';
    
    const colors = cfg.colors;
    if (combo >= 15) return colors['15'];
    if (combo >= 10) return colors['10'];
    if (combo >= 5) return colors['5'];
    if (combo >= 3) return colors['3'];
    return colors['1'];
}

// 获取连击发光强度
function getComboGlowIntensity(combo) {
    const cfg = CONFIG.visual?.edgeGlow?.combo;
    if (!cfg || !cfg.intensity) {
        return { alpha: 0.3, width: 40, duration: 300 };
    }
    
    const intensity = cfg.intensity;
    if (combo >= 15) return intensity['15'];
    if (combo >= 10) return intensity['10'];
    if (combo >= 5) return intensity['5'];
    if (combo >= 3) return intensity['3'];
    return intensity['1'];
}

// 获取格挡发光参数
function getBlockGlowParams() {
    const cfg = CONFIG.visual?.edgeGlow?.blocking;
    if (!cfg || !cfg.enabled) return null;
    
    const energyPercent = energy / CONFIG.energy.max;
    const time = Date.now() / 1000;
    
    // 脉冲效果
    let pulseSpeed = cfg.pulseSpeed?.high || 2.0;
    if (energyPercent < 0.3) pulseSpeed = cfg.pulseSpeed?.low || 1.0;
    else if (energyPercent < 0.6) pulseSpeed = cfg.pulseSpeed?.medium || 1.5;
    
    const pulse = (Math.sin(time * Math.PI * pulseSpeed) + 1) / 2;
    
    // 基础透明度
    let baseAlpha = cfg.maxAlpha || 0.4;
    if (energyPercent < 0.3) baseAlpha = cfg.minAlpha || 0.15;
    else if (energyPercent < 0.6) baseAlpha = (cfg.minAlpha + cfg.maxAlpha) / 2 || 0.25;
    
    const alpha = baseAlpha * (0.7 + pulse * 0.3);
    
    // 宽度
    const minWidth = cfg.minWidth || 30;
    const maxWidth = cfg.maxWidth || 50;
    const width = minWidth + energyPercent * (maxWidth - minWidth);
    
    // 颜色
    const baseColor = cfg.baseColor || '#0CF';
    
    return {
        width: width,
        alpha: alpha,
        color: baseColor
    };
}

// 获取连击发光参数
function getComboGlowParams() {
    const cfg = CONFIG.visual?.edgeGlow?.combo;
    if (!cfg || !cfg.enabled) return null;
    
    const comboColor = getComboColor(comboCount);
    const intensity = getComboGlowIntensity(comboCount);
    const progress = comboGlowProgress;
    
    // 淡入淡出
    let alpha = intensity.alpha;
    const fadeIn = cfg.fadeIn || 0.1;
    const fadeOut = cfg.fadeOut || 0.2;
    
    if (progress < fadeIn) {
        alpha *= progress / fadeIn; // 快速淡入
    } else if (progress > (1 - fadeOut)) {
        alpha *= (1 - progress) / fadeOut; // 缓慢淡出
    }
    
    return {
        width: intensity.width,
        alpha: alpha,
        color: comboColor
    };
}

// 获取边缘发光参数
function getEdgeGlowParams() {
    // 连击发光优先
    if (comboGlowActive) {
        return getComboGlowParams();
    }
    
    // 格挡发光
    if (player.blocking && !player.counterAttacking) {
        return getBlockGlowParams();
    }
    
    // 无发光
    return null;
}

// 渲染边缘发光
function renderEdgeGlow() {
    const cfg = CONFIG.visual?.edgeGlow;
    if (!cfg || !cfg.enabled) return;
    
    const params = getEdgeGlowParams();
    if (!params) return;
    
    const canvas = CONFIG.canvas;
    
    // 解析颜色并添加透明度
    const hexToRgba = (hex, alpha) => {
        // 移除 # 号
        hex = hex.replace('#', '');
        
        // 处理3位hex颜色（如 #0CF）
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    const colorOuter = hexToRgba(params.color, params.alpha);
    const colorMid = hexToRgba(params.color, params.alpha * 0.5);
    const colorInner = hexToRgba(params.color, 0);
    
    // 顶部边缘
    const topGradient = ctx.createLinearGradient(0, 0, 0, params.width);
    topGradient.addColorStop(0, colorOuter);
    topGradient.addColorStop(0.5, colorMid);
    topGradient.addColorStop(1, colorInner);
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, 0, canvas.width, params.width);
    
    // 底部边缘
    const bottomGradient = ctx.createLinearGradient(0, canvas.height - params.width, 0, canvas.height);
    bottomGradient.addColorStop(0, colorInner);
    bottomGradient.addColorStop(0.5, colorMid);
    bottomGradient.addColorStop(1, colorOuter);
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, canvas.height - params.width, canvas.width, params.width);
    
    // 左侧边缘
    const leftGradient = ctx.createLinearGradient(0, 0, params.width, 0);
    leftGradient.addColorStop(0, colorOuter);
    leftGradient.addColorStop(0.5, colorMid);
    leftGradient.addColorStop(1, colorInner);
    ctx.fillStyle = leftGradient;
    ctx.fillRect(0, 0, params.width, canvas.height);
    
    // 右侧边缘
    const rightGradient = ctx.createLinearGradient(canvas.width - params.width, 0, canvas.width, 0);
    rightGradient.addColorStop(0, colorInner);
    rightGradient.addColorStop(0.5, colorMid);
    rightGradient.addColorStop(1, colorOuter);
    ctx.fillStyle = rightGradient;
    ctx.fillRect(canvas.width - params.width, 0, params.width, canvas.height);
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

// 获取当前连击对应的多重反击次数上限
function getMultiCounterLimit() {
    const cfg = CONFIG.visual?.multiCounter;
    if (!cfg || !cfg.enabled) return 3;
    
    const scaling = cfg.comboScaling;
    if (!scaling || !scaling.enabled) {
        return cfg.maxTargets; // 如果未启用连击缩放，返回默认值
    }
    
    // 根据连击数查找对应的次数
    for (let i = scaling.thresholds.length - 1; i >= 0; i--) {
        if (comboCount >= scaling.thresholds[i]) {
            return scaling.counts[i];
        }
    }
    
    return scaling.counts[0]; // 默认返回第一个值
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

// 检查玩家是否无敌
function isPlayerInvincible() {
    if (!playerInvincible) return false;
    
    const now = Date.now();
    if (now >= invincibleEndTime) {
        playerInvincible = false;
        invincibleReason = null;
        return false;
    }
    
    return true;
}

// 设置玩家无敌状态
function setPlayerInvincible(duration, reason = 'unknown') {
    playerInvincible = true;
    invincibleEndTime = Date.now() + duration;
    invincibleReason = reason;
    
    const invCfg = CONFIG.invincibility;
    if (invCfg?.debug?.enabled && invCfg?.debug?.showInConsole) {
        console.log(`Player invincible: ${reason}, duration: ${duration}ms`);
    }
}

// 清除玩家无敌状态
function clearPlayerInvincible() {
    playerInvincible = false;
    invincibleEndTime = 0;
    invincibleReason = null;
}

// 触发多重反击
function triggerMultiCounter() {
    const cfg = CONFIG.visual?.multiCounter;
    if (!cfg || !cfg.enabled || multiCounterActive) return;
    
    // 获取当前连击对应的多重反击次数上限
    const maxTargets = getMultiCounterLimit();
    
    // 找到最近的多个敌人（排除无敌的敌人）
    const targets = [];
    const validEnemies = enemies.filter(e => !isEnemyInvincible(e));
    const sortedEnemies = validEnemies.slice().sort((a, b) => {
        const distA = Math.hypot(a.x - player.x, a.y - player.y);
        const distB = Math.hypot(b.x - player.x, b.y - player.y);
        return distA - distB;
    });
    
    for (let i = 0; i < Math.min(maxTargets, sortedEnemies.length); i++) {
        targets.push(sortedEnemies[i]);
    }
    
    if (targets.length === 0) return;
    
    // 激活多重反击
    multiCounterActive = true;
    multiCounterQueue = targets.slice();
    
    // 设置多重反击无敌状态
    const invCfg = CONFIG.invincibility;
    if (invCfg?.enabled && invCfg?.multiCounter?.enabled) {
        const perCounterDuration = invCfg.multiCounter.perCounterDuration;
        const delayBetween = invCfg.multiCounter.delayBetweenCounters;
        const bufferTime = invCfg.multiCounter.bufferTime;
        const totalDuration = targets.length * (perCounterDuration + delayBetween) + bufferTime;
        setPlayerInvincible(totalDuration, 'multi-counter');
    }
    
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

// BGM 音乐系统（仅战斗音乐）
let bgmBattle = null;
let bgmFadeInterval = null;

// 初始化BGM
function initBGM() {
    const musicCfg = CONFIG.visual?.audio?.music;
    if (!musicCfg || !musicCfg.enabled) return;
    
    try {
        // 创建战斗音乐对象
        bgmBattle = new Audio(musicCfg.files.battle);
        bgmBattle.loop = true;
        bgmBattle.volume = 0;
        
        console.log('BGM initialized');
    } catch (e) {
        console.warn('BGM initialization failed:', e);
    }
}

// 播放战斗BGM（带淡入）
function playBattleBGM() {
    const musicCfg = CONFIG.visual?.audio?.music;
    if (!musicCfg || !musicCfg.enabled || !bgmBattle) return;
    
    // 如果已经在播放，不重复播放
    if (!bgmBattle.paused) return;
    
    // 清除淡入淡出定时器
    if (bgmFadeInterval) {
        clearInterval(bgmFadeInterval);
        bgmFadeInterval = null;
    }
    
    // 播放音乐
    bgmBattle.currentTime = 0;
    bgmBattle.volume = 0;
    bgmBattle.play().then(() => {
        fadeInBGM(musicCfg.fadeInDuration, musicCfg.volume);
    }).catch(e => {
        console.warn('BGM play failed:', e);
    });
}

// 停止BGM（带淡出）
function stopBattleBGM() {
    const musicCfg = CONFIG.visual?.audio?.music;
    if (!musicCfg || !bgmBattle) return;
    
    // 清除淡入淡出定时器
    if (bgmFadeInterval) {
        clearInterval(bgmFadeInterval);
        bgmFadeInterval = null;
    }
    
    // 淡出并停止
    fadeOutBGM(musicCfg.fadeOutDuration);
}

// 淡入BGM
function fadeInBGM(duration, targetVolume) {
    if (!bgmBattle) return;
    
    const step = targetVolume / (duration / 50);
    
    bgmFadeInterval = setInterval(() => {
        if (bgmBattle.volume < targetVolume) {
            bgmBattle.volume = Math.min(targetVolume, bgmBattle.volume + step);
        } else {
            clearInterval(bgmFadeInterval);
            bgmFadeInterval = null;
        }
    }, 50);
}

// 淡出BGM
function fadeOutBGM(duration) {
    if (!bgmBattle) return;
    
    const startVolume = bgmBattle.volume;
    const step = startVolume / (duration / 50);
    
    bgmFadeInterval = setInterval(() => {
        if (bgmBattle.volume > 0) {
            bgmBattle.volume = Math.max(0, bgmBattle.volume - step);
        } else {
            bgmBattle.pause();
            clearInterval(bgmFadeInterval);
            bgmFadeInterval = null;
        }
    }, 50);
}

// 音频系统
function initAudio() {
    if (!CONFIG.visual?.audio?.enabled) return;
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('Web Audio API not supported:', e);
    }
    
    // 初始化BGM
    initBGM();
}

function playSound(soundType) {
    if (!CONFIG.visual?.audio?.enabled) return;
    
    const soundCfg = CONFIG.visual.audio.sounds[soundType];
    if (!soundCfg || !soundCfg.enabled) return;
    
    try {
        // 如果配置了音频文件，使用音频文件
        if (soundCfg.file) {
            const audio = new Audio(soundCfg.file);
            audio.volume = CONFIG.visual.audio.volume;
            audio.play().catch(e => console.warn('Error playing audio file:', e));
        } 
        // 否则使用程序化音效（Web Audio API）
        else if (audioContext) {
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
        }
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
    
    // 如果玩家正在死亡，只更新死亡动画
    if (playerDying) {
        updatePlayerDeathAnimation();
        updateVisualEffects();
        updateParticles();
        updateShockwaves();
        // 敌人和子弹继续移动（慢动作）
        updateEnemies();
        updateBullets();
        return;
    }
    
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
        const newEnemy = createEnemy(type);
        enemies.push(newEnemy);
        
        // 生成特效
        createSpawnEffect(newEnemy.x, newEnemy.y, type);
        
        lastEnemySpawn = now;
        
        // 使用动态刷怪间隔
        enemySpawnInterval = calculateDynamicSpawnInterval();
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
    
    // 更新边缘发光
    updateComboGlow();
    
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
    
    // 更新调试信息
    updateDebugInfo();
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
                
                // 记录击杀（动态刷怪系统）
                recordKill();
                
                // 连击系统
                comboCount++;
                comboTimer = CONFIG.visual.combo.timeout;
                
                // 触发连击边缘发光
                triggerComboGlow();
                
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
    
    // 移动（移动端禁用）
    if (!isMobile || !CONFIG.mobile?.disableMovement) {
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
    
    // 移动端：增加保持距离
    let keepDistance = enemy.keepDistance;
    if (isMobile && CONFIG.mobile?.gameplay?.rangedDistanceMultiplier) {
        keepDistance *= CONFIG.mobile.gameplay.rangedDistanceMultiplier;
    }
    
    switch(enemy.state) {
        case 'idle':
            enemy.movePattern += 0.02;
            const targetDist = keepDistance + Math.sin(enemy.movePattern) * 50;
            
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
            
            // 移动端：延长警告时间
            let warningTime = enemy.warningTime;
            if (isMobile && CONFIG.mobile?.gameplay?.meleeWarningMultiplier) {
                warningTime *= CONFIG.mobile.gameplay.meleeWarningMultiplier;
            }
            
            if (warningElapsed > warningTime) {
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
                } else if (!player.counterAttacking && !playerDying) {
                    // 检查玩家是否无敌
                    if (isPlayerInvincible()) {
                        // 无敌期间不受伤害
                        break;
                    }
                    
                    startPlayerDeathAnimation();
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
            } else if (!player.counterAttacking && !playerDying) {
                // 检查玩家是否无敌
                if (isPlayerInvincible()) {
                    // 无敌期间不受伤害，子弹直接穿过
                    continue;
                }
                
                // 玩家被击中
                startPlayerDeathAnimation();
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
        
        // 设置单次反击无敌状态（仅在非多重反击时）
        if (!multiCounterActive) {
            const invCfg = CONFIG.invincibility;
            if (invCfg?.enabled && invCfg?.counter?.enabled) {
                const duration = invCfg.counter.duration + invCfg.counter.bufferTime;
                setPlayerInvincible(duration, 'counter');
            }
        }
        
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
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        
        // 生成粒子特殊处理
        if (p.isSpawnParticle) {
            p.life--;
            p.alpha = p.life / 30;
            p.vx *= 0.95;
            p.vy *= 0.95;
            
            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
        } else {
            // 普通粒子
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

// 开始玩家死亡动画
function startPlayerDeathAnimation() {
    if (!CONFIG.visual.playerDeath || !CONFIG.visual.playerDeath.enabled) {
        // 如果禁用死亡动画，直接结算
        gameOver();
        return;
    }
    
    const cfg = CONFIG.visual.playerDeath;
    
    playerDying = true;
    deathAnimationStartTime = Date.now();
    playerDeathAlpha = 1.0;
    playerDeathScale = 1.0;
    playerDeathRotation = 0;
    deathFadeAlpha = 0;
    deathParticles = [];
    
    // 播放死亡音效
    playSound('death');
    
    // 触发强烈视觉效果
    triggerScreenShake(cfg.screenShakeIntensity);
    triggerTimeScale(cfg.timeSlowScale, cfg.timeSlowDuration);
    triggerFlash(1.5); // 超强闪光
    
    // 创建大型冲击波
    createShockwave(player.x, player.y, cfg.shockwaveRadius, cfg.shockwaveColor);
    
    // 强烈扰动背景粒子
    disturbParticles(player.x, player.y, cfg.shockwaveRadius, 20);
    
    // 生成死亡粒子
    generateDeathParticles();
}

// 生成死亡粒子
function generateDeathParticles() {
    const cfg = CONFIG.visual.playerDeath;
    const particleCount = cfg.particleCount;
    
    for (let i = 0; i < particleCount; i++) {
        const ratio = i / particleCount;
        
        // 根据比例分配颜色
        let color;
        if (ratio < cfg.particleRatios.core) {
            color = cfg.particleColors.core; // 核心粒子（白色）
        } else if (ratio < cfg.particleRatios.core + cfg.particleRatios.main) {
            color = cfg.particleColors.main; // 主体粒子（玩家颜色）
        } else {
            color = cfg.particleColors.ember; // 余烬粒子（青色）
        }
        
        // 360度均匀分布 + 随机偏移
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3;
        const speed = cfg.particleSpeedMin + Math.random() * (cfg.particleSpeedMax - cfg.particleSpeedMin);
        const size = cfg.particleSizeMin + Math.random() * (cfg.particleSizeMax - cfg.particleSizeMin);
        const life = cfg.particleLifeMin + Math.random() * (cfg.particleLifeMax - cfg.particleLifeMin);
        
        deathParticles.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: size,
            color: color,
            alpha: 1.0,
            life: life,
            maxLife: life,
            gravity: cfg.particleGravity,
            friction: cfg.particleFriction
        });
    }
}

// 更新玩家死亡动画
function updatePlayerDeathAnimation() {
    if (!playerDying) return;
    
    const cfg = CONFIG.visual.playerDeath;
    const elapsed = Date.now() - deathAnimationStartTime;
    
    // 阶段1: 玩家缩小旋转（0-shrinkDuration）
    if (elapsed < cfg.shrinkDuration) {
        const progress = elapsed / cfg.shrinkDuration;
        playerDeathScale = 1.0 - progress * (1.0 - cfg.shrinkScale);
        playerDeathRotation = progress * cfg.rotationSpeed;
        playerDeathAlpha = 1.0 - progress * 0.5; // 透明度降到0.5
    }
    // 阶段2: 玩家完全消失（shrinkDuration - animationDuration/2）
    else if (elapsed < cfg.animationDuration / 2) {
        const progress = (elapsed - cfg.shrinkDuration) / (cfg.animationDuration / 2 - cfg.shrinkDuration);
        playerDeathScale = cfg.shrinkScale;
        playerDeathRotation = cfg.rotationSpeed + progress * cfg.rotationSpeed;
        playerDeathAlpha = 0.5 - progress * 0.5; // 透明度从0.5降到0
    }
    // 阶段3: 只有粒子（animationDuration/2 - fadeOutDelay）
    else if (elapsed < cfg.fadeOutDelay) {
        playerDeathAlpha = 0;
    }
    // 阶段4: 淡入黑色遮罩（fadeOutDelay - fadeOutDelay+fadeOutDuration）
    else if (elapsed < cfg.fadeOutDelay + cfg.fadeOutDuration) {
        playerDeathAlpha = 0;
        const fadeProgress = (elapsed - cfg.fadeOutDelay) / cfg.fadeOutDuration;
        deathFadeAlpha = fadeProgress * 0.8;
    }
    // 阶段5: 显示结算界面
    else {
        playerDying = false;
        gameOver();
        return;
    }
    
    // 更新死亡粒子
    updateDeathParticles();
}

// 更新死亡粒子
function updateDeathParticles() {
    for (let i = deathParticles.length - 1; i >= 0; i--) {
        const p = deathParticles[i];
        
        // 位置更新
        p.x += p.vx;
        p.y += p.vy;
        
        // 重力影响
        p.vy += p.gravity;
        
        // 空气阻力
        p.vx *= p.friction;
        p.vy *= p.friction;
        
        // 生命周期
        p.life -= 16.67; // 假设60fps，约16.67ms每帧
        p.alpha = Math.max(0, p.life / p.maxLife);
        
        // 移除死亡粒子
        if (p.life <= 0) {
            deathParticles.splice(i, 1);
        }
    }
}

// 渲染玩家死亡动画
function renderPlayerDeathAnimation() {
    if (!playerDying) return;
    
    // 渲染玩家本体（如果还可见）
    if (playerDeathAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = playerDeathAlpha;
        ctx.translate(player.x, player.y);
        ctx.rotate((playerDeathRotation * Math.PI) / 180);
        ctx.scale(playerDeathScale, playerDeathScale);
        
        // 绘制玩家（使用原始颜色）
        ctx.fillStyle = '#8B7355';
        ctx.beginPath();
        ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    // 渲染死亡粒子
    renderDeathParticles();
    
    // 渲染淡入遮罩
    if (deathFadeAlpha > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${deathFadeAlpha})`;
        ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
        ctx.restore();
    }
}

// 渲染死亡粒子
function renderDeathParticles() {
    deathParticles.forEach(p => {
        ctx.save();
        
        // 发光效果
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        
        // 绘制粒子
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 拖尾效果（仅余烬粒子）
        if (p.color === CONFIG.visual.playerDeath.particleColors.ember) {
            ctx.globalAlpha = p.alpha * 0.3;
            ctx.beginPath();
            ctx.arc(p.x - p.vx * 2, p.y - p.vy * 2, p.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    });
}

// 游戏结束
function gameOver() {
    gameState = 'gameOver';
    document.getElementById('finalKills').textContent = kills;
    document.getElementById('finalTime').textContent = gameTime;
    document.getElementById('gameOver').style.display = 'block';
    
    // 淡出战斗音乐
    stopBattleBGM();
}

// 显示名字输入界面
function showNameInput() {
    // 隐藏游戏结束界面
    document.getElementById('gameOver').style.display = 'none';
    // 显示名字输入界面
    document.getElementById('nameInputScreen').style.display = 'block';
    document.getElementById('playerNameInput').value = '';
    document.getElementById('playerNameInput').focus();
}

// 提交分数
async function submitScore() {
    const playerName = document.getElementById('playerNameInput').value.trim();
    
    if (!playerName) {
        alert('请输入你的名字！');
        return;
    }
    
    // 隐藏名字输入界面
    document.getElementById('nameInputScreen').style.display = 'none';
    
    try {
        // 提交到排行榜（参数顺序：playerName, kills, survivalTime, difficulty）
        const result = await leaderboard.submitScore(playerName, kills, gameTime, selectedDifficulty);
        
        if (result.success) {
            console.log('分数提交成功！');
            
            // 提交成功后显示排行榜，并传递排名信息
            await showLeaderboard(selectedDifficulty, {
                rank: result.rank,
                kills: kills,
                time: gameTime
            });
        } else {
            throw new Error('提交失败');
        }
    } catch (error) {
        console.error('分数提交失败:', error);
        alert('分数提交失败，请检查网络连接！');
    }
}

// 跳过提交
function skipSubmit() {
    document.getElementById('nameInputScreen').style.display = 'none';
    document.getElementById('gameOver').style.display = 'block';
}

// 显示排行榜
async function showLeaderboard(difficulty = 'hardcore', yourRankData = null) {
    // 隐藏其他界面
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('difficultySelect').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('nameInputScreen').style.display = 'none';
    
    // 显示排行榜界面（使用 flex 以支持居中）
    const leaderboardScreen = document.getElementById('leaderboardScreen');
    leaderboardScreen.style.display = 'flex';
    
    // 显示或隐藏"你的排名"区域
    const yourRankDisplay = document.getElementById('yourRankDisplay');
    if (yourRankData) {
        yourRankDisplay.style.display = 'block';
        document.getElementById('yourRank').textContent = `第 ${yourRankData.rank} 名`;
        document.getElementById('yourKills').textContent = yourRankData.kills;
        document.getElementById('yourTime').textContent = yourRankData.time;
    } else {
        yourRankDisplay.style.display = 'none';
    }
    
    // 滚动到排行榜顶部
    setTimeout(() => {
        leaderboardScreen.scrollTop = 0;
        // 如果排行榜有滚动条，确保滚动到最顶部
        const leaderboardBody = document.getElementById('leaderboardBody');
        if (leaderboardBody) {
            leaderboardBody.scrollTop = 0;
        }
    }, 0);
    
    // 切换到指定难度
    switchDifficulty(difficulty);
}

// 切换难度标签
async function switchDifficulty(difficulty) {
    // 更新标签样式
    const tabs = document.querySelectorAll('.difficulty-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const difficultyMap = {
        'hardcore': 0,
        'balanced': 1,
        'casual': 2
    };
    tabs[difficultyMap[difficulty]].classList.add('active');
    
    // 加载排行榜数据
    try {
        const records = await leaderboard.getLeaderboard(difficulty);
        displayLeaderboard(records);
    } catch (error) {
        console.error('加载排行榜失败:', error);
        document.getElementById('leaderboardBody').innerHTML = '<tr><td colspan="4">加载失败</td></tr>';
    }
}

// 显示排行榜数据
function displayLeaderboard(records) {
    const tbody = document.getElementById('leaderboardBody');
    
    if (!records || records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">暂无记录</td></tr>';
        return;
    }
    
    let html = '';
    records.forEach((record, index) => {
        const rank = index + 1;
        let medal = '';
        
        if (rank === 1) medal = '🥇';
        else if (rank === 2) medal = '🥈';
        else if (rank === 3) medal = '🥉';
        
        html += `
            <tr>
                <td><span class="rank-medal">${medal}</span> ${rank}</td>
                <td>${record.playerName}</td>
                <td>${record.kills}</td>
                <td>${record.survivalTime}s</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// 返回主菜单
function backToMenu() {
    document.getElementById('leaderboardScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
}

// 处理排行榜点击事件（点击外部关闭）
function handleLeaderboardClick(event) {
    const leaderboardContent = document.getElementById('leaderboardContent');
    const leaderboardScreen = document.getElementById('leaderboardScreen');
    
    // 如果点击的是背景层（不是内容区域），则关闭排行榜
    if (event.target === leaderboardScreen) {
        backToMenu();
    }
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
    
    // 如果玩家正在死亡，渲染死亡动画
    if (playerDying) {
        renderPlayerDeathAnimation();
    } else {
        // 渲染玩家
        renderPlayer();
        
        // 渲染反击效果
        if (player.counterAttacking) {
            renderCounterEffect();
        }
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
    
    // 渲染边缘发光（在所有内容之后，不受震动影响）
    renderEdgeGlow();
    
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
    
    // 玩家本体 - 深棕色圆形带柔和阴影
    // 外层柔和阴影
    const shadowGradient = ctx.createRadialGradient(
        player.x, player.y, player.radius * 0.7,
        player.x, player.y, player.radius * 2
    );
    shadowGradient.addColorStop(0, 'rgba(80, 70, 60, 0)');
    shadowGradient.addColorStop(0.5, 'rgba(80, 70, 60, 0.3)');
    shadowGradient.addColorStop(1, 'rgba(80, 70, 60, 0)');
    ctx.fillStyle = shadowGradient;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 主体 - 深棕/灰褐色
    ctx.fillStyle = '#8B7355';
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

// 教程管理器
class TutorialManager {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 4;
        this.steps = [
            {
                title: '🎮 移动',
                description: '使用 WASD 键移动角色',
                animation: 'move'
            },
            {
                title: '🛡️ 格挡反击',
                description: '格挡敌人攻击后自动瞬移反击',
                animation: 'blockCounter'
            },
            {
                title: '⚡ 完美格挡',
                description: '在敌人攻击瞬间格挡可触发多次反击',
                animation: 'perfectParry'
            },
            {
                title: '🎯 目标',
                description: '击杀尽可能多的敌人\n存活尽可能长的时间',
                animation: 'goal'
            }
        ];
    }
    
    show() {
        document.getElementById('tutorialScreen').style.display = 'flex';
        this.showStep(0);
    }
    
    showStep(step) {
        this.currentStep = step;
        const stepData = this.steps[step];
        
        // 更新标题
        document.getElementById('tutorialTitle').textContent = stepData.title;
        
        // 更新说明
        document.getElementById('tutorialDescription').textContent = stepData.description;
        
        // 更新进度指示器
        this.updateStepIndicator();
        
        // 显示对应动画
        this.showAnimation(stepData.animation);
        
        // 更新按钮状态
        this.updateButtons();
    }
    
    nextStep() {
        if (this.currentStep < this.totalSteps - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.complete();
        }
    }
    
    prevStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }
    
    skip() {
        this.complete();
    }
    
    complete() {
        
        // 标记已看过教程
        localStorage.setItem('hasSeenTutorial', 'true');
        
        // 隐藏教程
        document.getElementById('tutorialScreen').style.display = 'none';
        
        // 显示主菜单
        document.getElementById('startScreen').style.display = 'block';
    }
    
    updateStepIndicator() {
        const dots = document.querySelectorAll('.step-dot');
        dots.forEach((dot, index) => {
            if (index === this.currentStep) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    updateButtons() {
        const prevBtn = document.getElementById('tutorialPrevBtn');
        const nextBtn = document.getElementById('tutorialNextBtn');
        
        // 第一步隐藏"上一步"
        prevBtn.style.visibility = this.currentStep === 0 ? 'hidden' : 'visible';
        
        // 最后一步改为"开始游戏"
        nextBtn.textContent = this.currentStep === this.totalSteps - 1 ? '开始游戏 →' : '下一步 →';
    }
    
    showAnimation(type) {
        // 隐藏所有动画
        document.querySelectorAll('.anim-container').forEach(el => {
            el.style.display = 'none';
        });
        
        // 显示对应动画
        const animEl = document.getElementById(`animation-${type}`);
        if (animEl) {
            animEl.style.display = 'flex';
            
            // 步骤5特殊处理：数字动画
            if (type === 'goal') {
                this.animateStats();
            }
        }
    }
    
    animateStats() {
        // 重置数字
        document.getElementById('demoKills').textContent = '0';
        document.getElementById('demoTime').textContent = '0s';
        document.getElementById('demoCombo').textContent = '0x';
        
        // 延迟后开始动画
        setTimeout(() => {
            this.countUpNumber('demoKills', 0, 50, 1500);
            this.countUpNumber('demoTime', 0, 120, 1500, 's');
            this.countUpNumber('demoCombo', 0, 15, 1500, 'x');
        }, 300);
    }
    
    countUpNumber(elementId, start, end, duration, suffix = '') {
        const element = document.getElementById(elementId);
        const startTime = Date.now();
        
        const update = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const current = Math.floor(start + (end - start) * progress);
            element.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        update();
    }
}

// 创建全局教程实例
const tutorial = new TutorialManager();

// 检查是否首次访问
function checkFirstVisit() {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    
    if (!hasSeenTutorial) {
        // 首次访问，显示教程
        tutorial.show();
    } else {
        // 已看过教程，显示主菜单
        document.getElementById('startScreen').style.display = 'block';
    }
}

// 启动
window.addEventListener('load', async () => {
    await init();
    checkFirstVisit();
});
