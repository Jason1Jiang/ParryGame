# Canvas边缘发光效果 v3.2 - 格挡与连击反馈

## 更新日期
2025-12-17

## 设计理念

通过 **Canvas 边缘发光效果** 增强玩家的视觉反馈，让格挡和连击的状态更加直观和沉浸。

### 核心设计原则
1. **状态可视化** - 通过边缘颜色直观显示当前状态
2. **强度分级** - 连击越高，效果越强烈
3. **颜色呼应** - 边缘颜色与游戏内元素颜色对应
4. **不干扰游戏** - 效果明显但不影响游戏视野

---

## 功能详解

### 1. 格挡边缘发光 🛡️

#### 设计说明
当玩家按住格挡键时，Canvas 边缘出现淡蓝色发光效果，与角色护盾颜色呼应。

#### 视觉效果
```
状态：按住格挡键
边缘颜色：淡蓝色 (#0CF / rgba(0, 204, 255, x))
发光强度：根据能量值动态变化
发光宽度：30-50px（从边缘向内渐变）
动画效果：轻微脉冲（呼吸感）
```

#### 强度分级
```javascript
能量充足 (>60%):
  - 颜色：亮蓝色 rgba(0, 204, 255, 0.4)
  - 宽度：50px
  - 脉冲速度：慢速（2秒周期）

能量中等 (30-60%):
  - 颜色：中蓝色 rgba(0, 204, 255, 0.25)
  - 宽度：40px
  - 脉冲速度：中速（1.5秒周期）

能量不足 (<30%):
  - 颜色：淡蓝色 rgba(0, 204, 255, 0.15)
  - 宽度：30px
  - 脉冲速度：快速（1秒周期）
  - 额外：红色警告闪烁
```

#### 渐变方式
```
从边缘到中心的径向渐变：
外层（边缘）：rgba(0, 204, 255, 0.4)
中层（25%）：rgba(0, 204, 255, 0.2)
内层（50%）：rgba(0, 204, 255, 0.05)
核心（100%）：rgba(0, 204, 255, 0)
```

---

### 2. 连击边缘发光 ⚡

#### 设计说明
击杀敌人时，根据当前连击数，Canvas 边缘出现对应颜色的强烈发光效果。

#### 连击颜色对应
```javascript
// 参考 CONFIG.visual.combo.colors
1-2 连击：白色   #FFFFFF
3-4 连击：黄色   #FFFF00
5-9 连击：橙色   #FF8800
10-14连击：紫色  #FF00FF
15+连击：青色   #00FFFF
```

#### 强度分级
```javascript
低连击 (1-2x):
  - 透明度：0.3
  - 宽度：40px
  - 持续时间：0.3秒
  - 脉冲：无

中连击 (3-4x):
  - 透明度：0.4
  - 宽度：50px
  - 持续时间：0.4秒
  - 脉冲：单次

高连击 (5-9x):
  - 透明度：0.5
  - 宽度：60px
  - 持续时间：0.5秒
  - 脉冲：双次

超高连击 (10-14x):
  - 透明度：0.6
  - 宽度：70px
  - 持续时间：0.6秒
  - 脉冲：三次
  - 额外：边缘闪烁

极限连击 (15+x):
  - 透明度：0.7
  - 宽度：80px
  - 持续时间：0.8秒
  - 脉冲：持续脉冲
  - 额外：彩虹渐变效果
```

#### 触发时机
```
击杀敌人瞬间 → 边缘爆发 → 快速淡入 → 缓慢淡出
```

---

### 3. 效果叠加规则 🎨

#### 优先级
```
1. 连击发光（最高优先级）
2. 格挡发光（中优先级）
3. 默认状态（无发光）
```

#### 叠加逻辑
```javascript
if (击杀触发连击发光) {
    显示连击发光（覆盖格挡发光）
    持续时间结束后恢复格挡发光
} else if (按住格挡键) {
    显示格挡发光
} else {
    无边缘发光
}
```

#### 过渡动画
```
格挡发光 → 连击发光：瞬间切换（0.05秒）
连击发光 → 格挡发光：淡出过渡（0.2秒）
格挡发光 → 无发光：淡出过渡（0.3秒）
```

---

## 技术实现

### 1. 渲染函数

#### renderEdgeGlow()
```javascript
function renderEdgeGlow() {
    // 检查是否需要渲染边缘发光
    if (!shouldRenderEdgeGlow()) return;
    
    // 获取当前发光参数
    const glowParams = getEdgeGlowParams();
    
    // 绘制四条边的发光
    renderTopEdge(glowParams);
    renderBottomEdge(glowParams);
    renderLeftEdge(glowParams);
    renderRightEdge(glowParams);
}
```

#### 边缘渐变绘制
```javascript
function renderTopEdge(params) {
    const gradient = ctx.createLinearGradient(
        0, 0,
        0, params.width
    );
    gradient.addColorStop(0, params.colorOuter);
    gradient.addColorStop(0.5, params.colorMid);
    gradient.addColorStop(1, params.colorInner);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, params.width);
}
```

### 2. 参数计算

#### getEdgeGlowParams()
```javascript
function getEdgeGlowParams() {
    // 连击发光优先
    if (comboGlowActive) {
        return getComboGlowParams();
    }
    
    // 格挡发光
    if (player.blocking) {
        return getBlockGlowParams();
    }
    
    // 无发光
    return null;
}
```

#### getBlockGlowParams()
```javascript
function getBlockGlowParams() {
    const energyPercent = energy / CONFIG.energy.max;
    const time = Date.now() / 1000;
    
    // 脉冲效果
    let pulseSpeed = 2.0;
    if (energyPercent < 0.3) pulseSpeed = 1.0;
    else if (energyPercent < 0.6) pulseSpeed = 1.5;
    
    const pulse = (Math.sin(time * Math.PI * pulseSpeed) + 1) / 2;
    
    // 基础透明度
    let baseAlpha = 0.4;
    if (energyPercent < 0.3) baseAlpha = 0.15;
    else if (energyPercent < 0.6) baseAlpha = 0.25;
    
    const alpha = baseAlpha * (0.7 + pulse * 0.3);
    
    return {
        width: 30 + energyPercent * 20,
        colorOuter: `rgba(0, 204, 255, ${alpha})`,
        colorMid: `rgba(0, 204, 255, ${alpha * 0.5})`,
        colorInner: `rgba(0, 204, 255, 0)`
    };
}
```

#### getComboGlowParams()
```javascript
function getComboGlowParams() {
    const comboColor = getComboColor(comboCount);
    const intensity = getComboIntensity(comboCount);
    const progress = comboGlowProgress; // 0-1
    
    // 淡入淡出
    let alpha = intensity.alpha;
    if (progress < 0.1) {
        alpha *= progress / 0.1; // 快速淡入
    } else if (progress > 0.8) {
        alpha *= (1 - progress) / 0.2; // 缓慢淡出
    }
    
    return {
        width: intensity.width,
        colorOuter: `${comboColor}${Math.floor(alpha * 255).toString(16)}`,
        colorMid: `${comboColor}${Math.floor(alpha * 0.5 * 255).toString(16)}`,
        colorInner: `${comboColor}00`
    };
}
```

### 3. 状态管理

#### 全局变量
```javascript
let comboGlowActive = false;
let comboGlowProgress = 0;
let comboGlowDuration = 0;
let comboGlowStartTime = 0;
```

#### 触发连击发光
```javascript
function triggerComboGlow() {
    comboGlowActive = true;
    comboGlowProgress = 0;
    comboGlowStartTime = Date.now();
    
    // 根据连击数设置持续时间
    if (comboCount >= 15) {
        comboGlowDuration = 800;
    } else if (comboCount >= 10) {
        comboGlowDuration = 600;
    } else if (comboCount >= 5) {
        comboGlowDuration = 500;
    } else if (comboCount >= 3) {
        comboGlowDuration = 400;
    } else {
        comboGlowDuration = 300;
    }
}
```

#### 更新连击发光
```javascript
function updateComboGlow() {
    if (!comboGlowActive) return;
    
    const elapsed = Date.now() - comboGlowStartTime;
    comboGlowProgress = elapsed / comboGlowDuration;
    
    if (comboGlowProgress >= 1) {
        comboGlowActive = false;
        comboGlowProgress = 0;
    }
}
```

---

## 配置参数

### config.json 新增配置
```json
"visual": {
  "edgeGlow": {
    "enabled": true,
    
    "blocking": {
      "enabled": true,
      "baseColor": "#0CF",
      "minWidth": 30,
      "maxWidth": 50,
      "minAlpha": 0.15,
      "maxAlpha": 0.4,
      "pulseSpeed": {
        "high": 2.0,
        "medium": 1.5,
        "low": 1.0
      },
      "warningFlash": true
    },
    
    "combo": {
      "enabled": true,
      "colors": {
        "1": "#FFFFFF",
        "3": "#FFFF00",
        "5": "#FF8800",
        "10": "#FF00FF",
        "15": "#00FFFF"
      },
      "intensity": {
        "1": { "alpha": 0.3, "width": 40, "duration": 300 },
        "3": { "alpha": 0.4, "width": 50, "duration": 400 },
        "5": { "alpha": 0.5, "width": 60, "duration": 500 },
        "10": { "alpha": 0.6, "width": 70, "duration": 600 },
        "15": { "alpha": 0.7, "width": 80, "duration": 800 }
      },
      "fadeIn": 0.1,
      "fadeOut": 0.2,
      "pulseCount": {
        "1": 0,
        "3": 1,
        "5": 2,
        "10": 3,
        "15": 999
      }
    }
  }
}
```

---

## 视觉效果示例

### 格挡状态
```
┌─────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ ← 淡蓝色发光（顶部）
│░                             ░│ ← 淡蓝色发光（左右）
│░                             ░│
│░         [游戏画面]           ░│
│░                             ░│
│░                             ░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ ← 淡蓝色发光（底部）
└─────────────────────────────────┘
```

### 高连击击杀
```
┌─────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ← 强烈橙色发光（10x连击）
│▓▓                           ▓▓│
│▓▓                           ▓▓│
│▓▓       [游戏画面]           ▓▓│
│▓▓                           ▓▓│
│▓▓                           ▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
└─────────────────────────────────┘
```

---

## 补充建议

### 1. 完美格挡特殊效果 ⭐
```
触发条件：完美格挡（格挡窗口期内）
边缘效果：金色闪光
持续时间：0.2秒
强度：最高（alpha: 0.8）
额外：四角星光爆发
```

### 2. 能量耗尽警告 ⚠️
```
触发条件：能量 < 10%
边缘效果：红色快速闪烁
闪烁频率：每秒3次
强度：中等（alpha: 0.4）
额外：配合音效警告
```

### 3. 多重反击特效 💫
```
触发条件：多重反击激活
边缘效果：紫色 + 白色交替脉冲
持续时间：整个多重反击期间
强度：高（alpha: 0.6）
额外：边缘粒子飞散
```

### 4. 连击断裂提示 💔
```
触发条件：连击 ≥ 5 且断裂
边缘效果：红色快速闪烁一次
持续时间：0.15秒
强度：中等（alpha: 0.5）
额外：配合震动效果
```

### 5. 彩虹渐变（极限连击）🌈
```
触发条件：连击 ≥ 20
边缘效果：彩虹色循环渐变
渐变速度：2秒一周期
强度：最高（alpha: 0.7）
额外：边缘流光效果
```

---

## 性能优化

### 1. 渲染优化
```javascript
// 只在需要时渲染
if (!edgeGlowEnabled) return;

// 使用离屏 Canvas 缓存渐变
const gradientCache = {};

// 降低更新频率（30fps 足够）
if (frameCount % 2 !== 0) return;
```

### 2. 内存优化
```javascript
// 复用渐变对象
let cachedGradient = null;

// 只在参数变化时重新创建
if (paramsChanged) {
    cachedGradient = createGradient(params);
}
```

---

## 测试场景

### 测试1：格挡发光
```
步骤：
1. 按住空格键格挡
2. 观察边缘蓝色发光
3. 消耗能量观察颜色变化

预期结果：
✅ 边缘出现淡蓝色发光
✅ 发光有轻微脉冲
✅ 能量低时发光变弱
✅ 能量耗尽时出现红色警告
```

### 测试2：连击发光
```
步骤：
1. 连续击杀敌人
2. 观察不同连击数的边缘颜色
3. 观察发光强度变化

预期结果：
✅ 1-2连击：白色，弱发光
✅ 3-4连击：黄色，中等发光
✅ 5-9连击：橙色，强发光
✅ 10+连击：紫色/青色，极强发光
✅ 发光有淡入淡出动画
```

### 测试3：效果叠加
```
步骤：
1. 按住格挡键（蓝色发光）
2. 击杀敌人触发连击（切换到连击颜色）
3. 连击发光结束后恢复格挡发光

预期结果：
✅ 连击发光覆盖格挡发光
✅ 过渡流畅自然
✅ 连击结束后恢复格挡状态
```

### 测试4：性能测试
```
步骤：
1. 开启边缘发光
2. 长时间游玩（10分钟）
3. 观察帧率变化

预期结果：
✅ 帧率保持 60fps
✅ 无明显卡顿
✅ CPU/GPU 占用正常
```

---

## 预期效果

### 视觉层面
- 🎨 更强的状态反馈
- 👁️ 更沉浸的游戏体验
- 🎯 更直观的连击提示
- ✨ 更华丽的视觉效果

### 游戏体验
- ✅ 格挡状态一目了然
- ✅ 连击成就感更强
- ✅ 能量状态更直观
- ✅ 战斗节奏感更强

### 情感反馈
- 💪 格挡时的安全感
- 🔥 连击时的爽快感
- ⚡ 高连击的成就感
- 🌟 极限连击的震撼感

---

## 相关文档

- [VISUAL_REFRESH_v3.0.md](VISUAL_REFRESH_v3.0.md) - 视觉刷新基础
- [MENU_REFRESH_v3.1.md](MENU_REFRESH_v3.1.md) - 主界面优化
- [VISUAL_UPDATE_v2.5.md](VISUAL_UPDATE_v2.5.md) - 多重反击系统

---

## 下一步

请确认以上设计方案，特别是：

1. **格挡发光**：淡蓝色 + 脉冲效果是否合适？
2. **连击颜色**：颜色分级是否满意？
3. **强度分级**：5个等级是否合理？
4. **补充效果**：完美格挡、能量警告等是否需要？

确认后我将立即实现代码！ 🚀

---

**文档版本**: v3.2  
**最后更新**: 2025-12-17  
**状态**: 待确认 ⏳
