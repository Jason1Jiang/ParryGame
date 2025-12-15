# 视觉效果系统文档

> 本文档记录游戏的所有视觉效果实现细节，作为后续优化和扩展的参考基础。

## 目录
- [核心系统](#核心系统)
- [格挡系统](#格挡系统)
- [反击系统](#反击系统)
- [敌人系统](#敌人系统)
- [粒子系统](#粒子系统)
- [UI系统](#ui系统)
- [配置参数](#配置参数)
- [待优化项](#待优化项)

---

## 核心系统

### 1. 屏幕震动系统

**实现位置**: `game.js` - `updateVisualEffects()`, `triggerScreenShake()`

**功能描述**:
- 根据不同事件触发不同强度的屏幕震动
- 震动随时间衰减
- 通过 `ctx.translate()` 实现画布偏移

**触发时机**:
- 格挡成功: 强度 8
- 反击命中: 强度 15
- 敌人死亡: 强度 5

**配置参数** (`config.json`):
```json
"screenShake": {
  "enabled": true,
  "blockSuccess": 8,
  "counterHit": 15,
  "enemyDeath": 5,
  "duration": 200
}
```

**优化建议**:
- [ ] 添加震动方向控制（横向/纵向/径向）
- [ ] 支持震动曲线（线性/缓入缓出）
- [ ] 添加震动频率参数

---

### 2. 时间缩放系统（子弹时间）

**实现位置**: `game.js` - `updateVisualEffects()`, `triggerTimeScale()`

**功能描述**:
- 减慢游戏时间流速
- 平滑过渡到目标时间缩放
- 影响敌人和子弹更新频率

**触发时机**:
- 格挡成功: 0.3x 速度，持续 150ms
- 反击开始: 0.5x 速度
- 反击命中: 0.1x 速度，持续 150ms

**配置参数**:
```json
"timeScale": {
  "enabled": true,
  "blockSuccess": 0.3,
  "counterStart": 0.5,
  "counterHit": 0.1,
  "duration": 150
}
```

**优化建议**:
- [ ] 添加时间缩放曲线
- [ ] 支持多个时间缩放效果叠加
- [ ] 添加音效变调效果

---

### 3. 玩家闪光效果系统

**实现位置**: `game.js` - `updateVisualEffects()`, `triggerFlash()`, `renderPlayer()`

**功能描述**:
- 玩家本体发出强烈白光
- 径向渐变光晕
- 自动淡出
- 不影响其他游戏元素

**触发时机**:
- 格挡成功: 80% 强度
- 反击命中: 100% 强度

**配置参数**:
```json
"flash": {
  "enabled": true,
  "blockSuccess": 0.8,
  "counterHit": 1.0,
  "duration": 100,
  "radius": 50
}
```

**实现细节**:
```javascript
// 玩家闪光光晕
const flashGradient = ctx.createRadialGradient(
  player.x, player.y, player.radius,
  player.x, player.y, flashRadius
);
flashGradient.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
flashGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
```

**优化建议**:
- [ ] 支持不同颜色的闪光（蓝色/金色）
- [ ] 闪光脉冲效果
- [ ] 闪光时的粒子爆发

---

## 格挡系统

### 4. 多层旋转护盾

**实现位置**: `game.js` - `renderPlayer()`

**功能描述**:
- 3层六边形护盾
- 每层独立旋转（交替方向）
- 根据能量值动态变色
- 护盾呼吸效果

**视觉特点**:
- 高能量（>60%）: 青蓝色 `#0cf`
- 中等能量（30-60%）: 橙色 `#fa0`
- 低能量（<30%）: 红色 `#f33`

**配置参数**:
```json
"blockingShield": {
  "layers": 3,
  "rotationSpeed": 2,
  "pulseSpeed": 3,
  "particleCount": 20
}
```

**实现细节**:
```javascript
// 六边形绘制
for (let j = 0; j < 6; j++) {
  const angle = (Math.PI / 3) * j;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
}
```

**优化建议**:
- [ ] 添加护盾破裂效果（能量耗尽时）
- [ ] 支持不同形状（圆形/八边形/星形）
- [ ] 添加护盾充能动画
- [ ] 护盾受击时的波纹效果

---

### 5. 护盾粒子环绕

**实现位置**: `game.js` - `renderPlayer()`

**功能描述**:
- 20个粒子环绕玩家
- 粒子随护盾旋转
- 呼吸脉冲效果

**实现细节**:
```javascript
const angle = (Math.PI * 2 * i) / particleCount + time * rotationSpeed;
const radius = player.radius + 10 + Math.sin(time * pulseSpeed + i) * 3;
```

**优化建议**:
- [ ] 粒子轨迹变化（螺旋/波浪）
- [ ] 粒子颜色渐变
- [ ] 粒子大小变化

---

### 6. 格挡成功效果

**实现位置**: `game.js` - `updateBullets()`, `updateMeleeEnemy()`

**功能描述**:
- 冲击波扩散（50像素）
- 粒子爆发（15个）
- 屏幕震动 + 时间减速 + 闪光

**触发条件**:
- 子弹命中格挡状态的玩家
- 近战敌人攻击命中格挡状态的玩家

**优化建议**:
- [ ] 添加格挡音效
- [ ] 格挡点产生火花特效
- [ ] 完美格挡判定（时机更精准）

---

## 反击系统

### 7. 刀光瞬移效果

**实现位置**: `game.js` - `renderCounterEffect()`

**功能描述**:
- 瞬移路径上绘制刀光轨迹
- 刀光从起点延伸到终点
- 带有光晕和能量流动效果
- 刀光边缘有锯齿/波纹效果
- 多层刀光叠加（主刀光 + 副刀光）

**视觉特点**:
- 主刀光: 青白色，宽度渐变
- 副刀光: 青蓝色，半透明
- 刀光边缘: 粒子飞散效果
- 刀光中心: 高亮白色核心

**配置参数**:
```json
"counterEffect": {
  "chargeTime": 100,
  "slashTrailWidth": 30,
  "slashTrailSegments": 20,
  "slashGlowLayers": 3,
  "lightningSegments": 5,
  "freezeDuration": 150,
  "slashSize": 40,
  "slashColor": "#0ff",
  "slashGlowColor": "#fff"
}
```

**实现细节**:
```javascript
// 绘制刀光轨迹
// 1. 外层光晕（最宽，最透明）
// 2. 中层刀光（中等宽度）
// 3. 内层核心（最窄，最亮）
// 4. 边缘粒子效果
for (let layer = 0; layer < glowLayers; layer++) {
  const width = slashTrailWidth * (1 - layer * 0.3);
  const alpha = 0.6 - layer * 0.2;
  // 绘制刀光路径
}
```

**刀光形态**:
- 起始段: 刀光逐渐展开
- 中间段: 刀光保持最大宽度
- 结束段: 刀光收束聚焦

**优化建议**:
- [x] 刀光轨迹效果（已实现）
- [ ] 刀光颜色渐变（青→白→金）
- [ ] 刀光扭曲效果
- [ ] 刀光分裂效果（多重斩击）
- [ ] 刀光残留效果（短暂停留）

---

### 8. 闪电链特效

**实现位置**: `game.js` - `renderCounterEffect()`

**功能描述**:
- 5段闪电连接起点和终点
- 随机偏移产生闪电效果
- 随瞬移进度淡出

**实现细节**:
```javascript
for (let i = 1; i < lightningSegments; i++) {
  const offset = (Math.random() - 0.5) * 20 * (1 - progress);
  ctx.lineTo(x + offset, y + offset);
}
```

**优化建议**:
- [ ] 多条闪电链
- [ ] 闪电分支效果
- [ ] 闪电颜色变化

---

### 9. 十字斩击效果

**实现位置**: `game.js` - `renderCounterEffect()`

**功能描述**:
- 十字形光刃（40像素）
- 斩击光晕扩散
- 在反击进度 >70% 时显示

**视觉层次**:
1. 十字斩击线（白色，粗线）
2. 斩击光晕（径向渐变）

**优化建议**:
- [ ] 斩击轨迹动画
- [ ] 多段斩击连击
- [ ] 斩击方向随机化
- [ ] 添加刀光拖尾

---

### 10. 击杀反馈系统

**实现位置**: `game.js` - `createDeathAnimation()`, `renderDeathAnimations()`

**功能描述**:
- 敌人旋转缩小
- 40个爆炸粒子
- 冲击波扩散（80像素）
- 飘字显示

**死亡动画阶段**:
1. 缩小阶段（200ms）: 旋转 + 缩放
2. 淡出阶段（300ms）: 透明度降低

**配置参数**:
```json
"enemyDeath": {
  "explosionParticles": 40,
  "explosionSpeed": 8,
  "shrinkDuration": 200,
  "fadeOutDuration": 300
}
```

**优化建议**:
- [ ] 不同敌人类型的死亡效果
- [ ] 爆炸粒子颜色渐变
- [ ] 添加爆炸冲击波
- [ ] 死亡慢动作效果

---

## 敌人系统

### 11. 敌人发光效果

**实现位置**: `game.js` - `renderRangedEnemy()`, `renderMeleeEnemy()`

**功能描述**:
- 径向渐变光晕
- 远程敌人: 红色光晕
- 近战敌人: 橙色光晕

**配置参数**:
```json
"glow": {
  "enabled": true,
  "playerGlow": 10,
  "enemyGlow": 5,
  "bulletGlow": 3
}
```

**优化建议**:
- [ ] 光晕脉冲效果
- [ ] 根据状态改变光晕颜色
- [ ] 光晕强度随距离变化

---

### 12. 远程敌人视觉

**当前实现**:
- 红色三角形
- 瞄准时的充能光圈
- 瞄准线显示
- 闪烁效果

**优化建议**:
- [ ] 射击后坐力动画
- [ ] 枪口闪光效果
- [ ] 身体脉冲动画
- [ ] 移动时的倾斜效果

---

### 13. 近战敌人视觉

**当前实现**:
- 橙色菱形
- 警告阶段: 双层光圈 + 方向指示线
- 攻击阶段: 3段残影拖尾
- 闪烁效果

**优化建议**:
- [ ] 蓄力时的能量聚集效果
- [ ] 冲刺时的地面拖痕
- [ ] 攻击轨迹刀光
- [ ] 被格挡时的弹开动画

---

## 粒子系统

### 14. 背景粒子

**实现位置**: `game.js` - `createParticle()`, `updateParticles()`, `renderParticles()`

**功能描述**:
- 800个背景粒子
- 缓慢漂浮
- 受到扰动时加速

**粒子属性**:
- 位置、速度、大小、透明度、颜色
- 边界循环
- 速度衰减和恢复

**配置参数**:
```json
"particles": {
  "count": 800,
  "baseSpeed": 0.3,
  "colors": ["#aaf", "#faf"]
}
```

**优化建议**:
- [ ] 多层粒子（前景/中景/背景）
- [ ] 粒子颜色渐变和闪烁
- [ ] 大型光斑粒子
- [ ] 战斗激烈时粒子密度增加

---

### 15. 粒子扰动系统

**实现位置**: `game.js` - `disturbParticles()`

**功能描述**:
- 指定位置和半径内的粒子被推开
- 力度可调节
- 用于移动、格挡、反击等效果

**使用场景**:
- 玩家移动: 半径30，力度2
- 格挡成功: 半径50，力度8
- 近战冲刺: 半径40，力度5
- 反击瞬移: 半径50，力度8

**优化建议**:
- [ ] 粒子吸引效果
- [ ] 粒子旋涡效果
- [ ] 粒子爆炸方向性

---

### 16. 粒子爆发系统

**实现位置**: `game.js` - `createParticleBurst()`

**功能描述**:
- 从指定点向四周推开粒子
- 力度随距离衰减
- 用于格挡、击杀等效果

**配置参数**:
```json
"counter": {
  "particleBurstCount": 25,
  "particleBurstRadius": 100,
  "particleBurstForce": 5,
  "particleBurstForceVariance": 3
}
```

**优化建议**:
- [ ] 爆发方向控制
- [ ] 爆发形状（圆形/扇形/定向）
- [ ] 爆发波次（多次爆发）

---

### 17. 冲击波系统

**实现位置**: `game.js` - `createShockwave()`, `updateShockwaves()`, `renderShockwaves()`

**功能描述**:
- 圆形扩散波纹
- 双层光圈
- 自动淡出

**使用场景**:
- 格挡成功: 50像素，青色
- 反击命中: 80像素，青色

**优化建议**:
- [ ] 多层冲击波
- [ ] 冲击波形状变化
- [ ] 冲击波颜色渐变
- [ ] 冲击波扭曲效果

---

## UI系统

### 18. 飘字系统

**实现位置**: `game.js` - `addFloatingText()`, `updateFloatingTexts()`, `renderFloatingTexts()`

**功能描述**:
- 文字向上飘动
- 自动淡出
- 描边 + 填充

**使用场景**:
- 击杀提示: "KILL!"
- 连击提示: "X COMBO!"

**配置参数**:
```javascript
{
  x, y,           // 位置
  text,           // 文字内容
  color,          // 颜色
  size,           // 字体大小
  alpha,          // 透明度
  vy,             // 垂直速度
  life            // 生命周期
}
```

**优化建议**:
- [ ] 飘字动画曲线
- [ ] 飘字缩放效果
- [ ] 飘字旋转效果
- [ ] 伤害数字显示

---

### 19. 连击显示系统

**实现位置**: `game.js` - `renderCombo()`

**功能描述**:
- 屏幕中上方显示连击数
- 连击数越高颜色越鲜艳
- 3秒未击杀则重置

**连击颜色**:
- 2x: 白色 `#fff`
- 3x: 黄色 `#ff0`
- 4x: 橙色 `#f80`
- 5x: 紫色 `#f0f`
- 6x+: 青色 `#0ff`

**配置参数**:
```json
"combo": {
  "enabled": true,
  "timeout": 3000,
  "colors": ["#fff", "#ff0", "#f80", "#f0f", "#0ff"]
}
```

**优化建议**:
- [ ] 连击特效强化（高连击时）
- [ ] 连击音效变化
- [ ] 连击奖励系统
- [ ] 连击进度条

---

### 20. 能量条优化

**当前实现**:
- 横向进度条
- 根据能量值变色
- 平滑过渡

**优化建议**:
- [ ] 能量条发光效果
- [ ] 能量流动动画
- [ ] 能量不足闪烁警告
- [ ] 能量条周围粒子效果
- [ ] 能量恢复时的闪光

---

## 背景系统

### 21. 渐变背景

**实现位置**: `game.js` - `renderBackground()`

**功能描述**:
- 径向渐变
- 深蓝到黑色过渡

**配置参数**:
```json
"background": {
  "gradient": true,
  "gradientColors": ["#000428", "#004e92", "#000000"],
  "vignette": true,
  "vignetteStrength": 0.3
}
```

**优化建议**:
- [ ] 背景动态变化（根据战斗强度）
- [ ] 背景网格线（赛博朋克风格）
- [ ] 背景脉冲效果
- [ ] 背景粒子层

---

### 22. 暗角效果

**实现位置**: `game.js` - `renderVignette()`

**功能描述**:
- 边缘暗化
- 增强聚焦感
- 径向渐变实现

**优化建议**:
- [ ] 动态暗角强度
- [ ] 暗角颜色可配置
- [ ] 暗角形状变化

---

## 子弹系统

### 23. 子弹视觉

**实现位置**: `game.js` - `renderBullets()`

**功能描述**:
- 红色圆形
- 发光效果
- 3段拖尾残影

**优化建议**:
- [ ] 子弹旋转效果
- [ ] 子弹轨迹粒子
- [ ] 不同类型子弹
- [ ] 子弹充能效果

---

## 配置参数总览

### 配置文件结构 (`config.json`)

```json
{
  "canvas": { ... },
  "player": { ... },
  "energy": { ... },
  "particles": { ... },
  "enemies": {
    "ranged": { ... },
    "melee": { ... }
  },
  "bullet": { ... },
  "spawn": { ... },
  "counter": { ... },
  "effects": { ... },
  "visual": {
    "screenShake": { ... },
    "timeScale": { ... },
    "flash": { ... },
    "blockingShield": { ... },
    "counterEffect": { ... },
    "enemyDeath": { ... },
    "combo": { ... },
    "background": { ... },
    "glow": { ... }
  }
}
```

### 参数调整指南

**增强打击感**:
- 增加 `screenShake` 强度
- 降低 `timeScale` 值（更慢）
- 增加 `flash` 强度

**优化性能**:
- 减少 `particles.count`
- 减少 `enemyDeath.explosionParticles`
- 减少 `blockingShield.particleCount`

**调整难度**:
- 修改 `spawn` 参数
- 修改 `enemies` 速度和攻击参数
- 修改 `energy` 消耗和恢复速度

---

## 待优化项

### 高优先级
- [ ] 音效系统集成
- [ ] 完美格挡判定
- [ ] 连击奖励机制
- [ ] 能量条视觉强化

### 中优先级
- [ ] 相机跟随和缩放
- [ ] 更多粒子类型
- [ ] 背景动态效果
- [ ] 敌人动画强化

### 低优先级
- [ ] 后处理效果（色差、径向模糊）
- [ ] 天气效果
- [ ] 场景切换动画
- [ ] 成就系统视觉

---

## 性能优化记录

### 已实现
- ✅ 对象池复用（粒子）
- ✅ 自动清理（死亡动画、飘字、冲击波）
- ✅ requestAnimationFrame 动画循环
- ✅ 离屏对象剔除（子弹）

### 待实现
- [ ] 粒子对象池
- [ ] 空间分区（碰撞检测）
- [ ] LOD 系统（远处敌人简化渲染）
- [ ] Canvas 分层渲染

---

## 版本历史

### v1.0 - 初始版本
- 基础游戏玩法
- 简单视觉效果

### v2.0 - 视觉效果大更新（当前版本）
- 完整的打击感系统
- 格挡护盾强化
- 反击特效强化
- 连击系统
- 死亡动画
- 发光和拖尾效果
- 背景优化

### v2.1 - 计划中
- 音效系统
- 更多敌人类型
- 技能系统

---

## 开发者注意事项

### 添加新视觉效果的步骤

1. **在 `config.json` 中添加配置**
   ```json
   "visual": {
     "newEffect": {
       "enabled": true,
       "parameter1": value1,
       "parameter2": value2
     }
   }
   ```

2. **在 `game.js` 中添加状态变量**
   ```javascript
   let newEffectState = { ... };
   ```

3. **创建更新函数**
   ```javascript
   function updateNewEffect() { ... }
   ```

4. **创建渲染函数**
   ```javascript
   function renderNewEffect() { ... }
   ```

5. **在主循环中调用**
   ```javascript
   function update() {
     updateNewEffect();
   }
   
   function render() {
     renderNewEffect();
   }
   ```

6. **更新本文档**

### 调试技巧

- 使用 `console.log()` 输出关键参数
- 在浏览器开发者工具中实时修改 CONFIG 对象
- 使用 `ctx.strokeRect()` 绘制调试边界
- 降低 `particles.count` 提高调试性能

---

**文档维护**: 每次添加或修改视觉效果时，请同步更新本文档。

**最后更新**: 2025-12-15
