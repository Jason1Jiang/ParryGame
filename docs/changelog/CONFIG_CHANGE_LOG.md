# 配置文件修改日志

本文档记录 `config.json` 的重要修改历史。

---

## [2025-12-18 23:58] - 玩家死亡动画时长优化 ⚡

### 修改类型
**参数优化** - 采用"快速死亡"预设方案

### 修改文件
- `config.json` (playerDeath 配置节)

### 修改原因
1. **减少等待时间**: 原2.2秒动画对于快节奏游戏略长
2. **提升游戏节奏**: 玩家多次死亡时不会感到厌烦
3. **保持视觉效果**: 在缩短时长的同时保持视觉冲击力
4. **采用推荐预设**: 使用设计文档中的"快速死亡"预设方案

### 具体修改

#### 参数对比表

| 参数 | 修改前 | 修改后 | 变化 |
|------|--------|--------|------|
| `animationDuration` | 2000ms | **1000ms** | -50% ⚡ |
| `shrinkDuration` | 400ms | **200ms** | -50% ⚡ |
| `particleLifeMin` | 500ms | **300ms** | -40% ⚡ |
| `particleLifeMax` | 800ms | **500ms** | -37.5% ⚡ |
| `timeSlowDuration` | 1000ms | **500ms** | -50% ⚡ |
| `fadeOutDelay` | 2000ms | **1000ms** | -50% ⚡ |
| `fadeOutDuration` | 200ms | 200ms | 无变化 |

**总动画时长**: 2200ms → **1200ms** (减少 **45%**)

#### 完整的修改代码

```json
"playerDeath": {
  "enabled": true,
  "animationDuration": 1000,        // 从 2000 减少到 1000
  "shrinkDuration": 200,            // 从 400 减少到 200
  "shrinkScale": 0.3,
  "rotationSpeed": 360,
  "particleCount": 100,
  "particleSpeedMin": 8,
  "particleSpeedMax": 15,
  "particleSizeMin": 2,
  "particleSizeMax": 6,
  "particleLifeMin": 300,           // 从 500 减少到 300
  "particleLifeMax": 500,           // 从 800 减少到 500
  "particleGravity": 0.1,
  "particleFriction": 0.98,
  "particleColors": {
    "core": "#FFFFFF",
    "main": "#8B7355",
    "ember": "#0CF"
  },
  "particleRatios": {
    "core": 0.3,
    "main": 0.5,
    "ember": 0.2
  },
  "screenShakeIntensity": 30,
  "timeSlowScale": 0.05,
  "timeSlowDuration": 500,          // 从 1000 减少到 500
  "shockwaveRadius": 200,
  "shockwaveColor": "#F55",
  "fadeOutDelay": 1000,             // 从 2000 减少到 1000
  "fadeOutDuration": 200
}
```

### 动画时间线变化

#### 修改前（2.2秒）
```
0ms     - 触发死亡
0-400ms - 玩家缩小旋转
400-1000ms - 玩家完全消失
1000-2000ms - 只有粒子
2000-2200ms - 淡入遮罩
2200ms - 显示结算 ❌ 较慢
```

#### 修改后（1.2秒）⚡
```
0ms     - 触发死亡
0-200ms - 玩家缩小旋转 ⚡ 加快
200-500ms - 粒子爆散 ⚡ 缩短
500-1000ms - 粒子消散 ⚡ 缩短
1000-1200ms - 淡入遮罩 ⚡ 提前
1200ms - 显示结算 ✅ 更快
```

### 影响分析

#### 优势 ✅
1. **更快的节奏**: 减少45%等待时间
2. **保持冲击力**: 视觉效果仍然震撼
3. **减少厌烦**: 多次死亡时不会感到拖沓
4. **符合设计**: 采用推荐的"快速死亡"预设

#### 保持不变 ✅
1. **粒子数量**: 仍然是100个粒子
2. **震动强度**: 仍然是强度30（超强）
3. **慢动作倍率**: 仍然是0.05x（极慢）
4. **冲击波半径**: 仍然是200px（大型）
5. **粒子颜色**: 仍然是3种颜色分层

#### 性能影响 ⚡
- **CPU**: 无变化（粒子数量相同）
- **GPU**: 无变化（渲染逻辑相同）
- **内存**: 无变化（数据结构相同）
- **总体**: 动画时长缩短，实际上减少了总体性能消耗

### 用户体验提升

**修改前的问题**:
- ⚠️ 2.2秒等待时间略长
- ⚠️ 多次死亡后可能感到厌烦
- ⚠️ 节奏略慢，不够紧凑

**修改后的改进**:
- ✅ 1.2秒快速反馈
- ✅ 保持视觉冲击力
- ✅ 节奏更紧凑
- ✅ 适合快节奏游戏

### 测试建议

1. **基础测试**: 触发死亡，观察1.2秒后是否显示结算
2. **视觉测试**: 确认粒子效果仍然清晰震撼
3. **多次测试**: 连续死亡3-5次，确认不会感到拖沓
4. **对比测试**: 与之前的2.2秒版本对比，确认改进效果

### 回滚方案

如果需要恢复到原来的2.2秒版本，修改以下参数：

```json
{
  "animationDuration": 2000,
  "shrinkDuration": 400,
  "particleLifeMin": 500,
  "particleLifeMax": 800,
  "timeSlowDuration": 1000,
  "fadeOutDelay": 2000
}
```

### 相关文档

- [PLAYER_DEATH_v3.3.md](docs/visual-updates/PLAYER_DEATH_v3.3.md) - 设计文档（包含多种预设方案）
- [CHANGELOG_v3.3.md](CHANGELOG_v3.3.md) - 版本更新日志
- [README.md](README.md) - 版本历史
- [TEST_PLAYER_DEATH.md](TEST_PLAYER_DEATH.md) - 测试指南

### 设计参考

这次修改采用了设计文档中的"快速死亡"预设方案：

> **快速死亡（减少等待时间）**
> ```json
> {
>   "animationDuration": 600,
>   "shrinkDuration": 150,
>   "particleLifeMin": 300,
>   "particleLifeMax": 500,
>   "fadeOutDelay": 600
> }
> ```

实际采用的是介于"快速"和"标准"之间的平衡方案（1.2秒），既保证了节奏，又保留了足够的视觉效果。

---

## 修改历史

### 2025-12-18
- ✅ 玩家死亡动画时长优化（2.2秒 → 1.2秒）

---

**最后更新**: 2025-12-18 23:58  
**修改者**: 用户  
**状态**: ✅ 已应用
