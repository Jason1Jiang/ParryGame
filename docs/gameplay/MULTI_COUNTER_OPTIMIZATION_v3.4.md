# 多重反击优化 v3.4 - 连击数关联系统

## 更新日期
2025-12-18

## 设计理念

将**多重反击次数**与**当前连击数**关联，让玩家的连击成就直接转化为更强大的反击能力，形成正向反馈循环。

### 核心设计原则
1. **连击奖励** - 连击越高，多重反击越强
2. **正向循环** - 强力反击帮助维持连击
3. **成就感** - 高连击带来视觉和数值的双重爽快感
4. **平衡性** - 避免过于强大导致游戏失衡

---

## 当前系统分析

### 现有多重反击机制
```javascript
// 当前逻辑（game.js）
function checkMultiCounter() {
    const now = Date.now();
    const timeSinceLastParry = now - lastParryTime;
    
    // 固定时间窗口：200ms
    if (timeSinceLastParry < 200) {
        multiCounterCount++;
        
        // 固定最大次数：3次
        if (multiCounterCount >= 3) {
            return true;
        }
    } else {
        multiCounterCount = 1;
    }
    
    lastParryTime = now;
    return false;
}
```

### 当前问题
- ❌ 多重反击次数固定为 3 次
- ❌ 与连击数无关联
- ❌ 缺少连击奖励机制
- ❌ 高连击时没有额外优势

---

## 优化方案

### 方案A：线性增长（推荐）⭐⭐⭐⭐⭐

#### 设计思路
连击数越高，多重反击次数线性增加，简单直观。

#### 次数对应表
```
连击数 (Combo)  →  多重反击次数 (Multi-Counter)
─────────────────────────────────────────
0-2 连击        →  2 次（基础）
3-4 连击        →  3 次
5-9 连击        →  4 次
10-14 连击      →  5 次
15-19 连击      →  6 次
20-29 连击      →  7 次
30-39 连击      →  8 次
40-49 连击      →  9 次
50+ 连击        →  10 次（上限）
```

#### 实现逻辑
```javascript
function getMultiCounterLimit() {
    if (comboCount < 3) return 2;
    if (comboCount < 5) return 3;
    if (comboCount < 10) return 4;
    if (comboCount < 15) return 5;
    if (comboCount < 20) return 6;
    if (comboCount < 30) return 7;
    if (comboCount < 40) return 8;
    if (comboCount < 50) return 9;
    return 10; // 最大上限
}
```

#### 优点
- ✅ 简单易懂
- ✅ 连击奖励明显
- ✅ 平滑增长
- ✅ 有上限避免失衡

#### 缺点
- ⚠️ 高连击时可能过强

---

### 方案B：阶梯增长（平衡）⭐⭐⭐⭐

#### 设计思路
连击数达到特定阈值时，多重反击次数跳跃式增加。

#### 次数对应表
```
连击数 (Combo)  →  多重反击次数 (Multi-Counter)
─────────────────────────────────────────
0-4 连击        →  2 次（基础）
5-9 连击        →  3 次（+1）
10-19 连击      →  4 次（+1）
20-29 连击      →  5 次（+1）
30-49 连击      →  6 次（+1）
50+ 连击        →  7 次（上限）
```

#### 实现逻辑
```javascript
function getMultiCounterLimit() {
    if (comboCount < 5) return 2;
    if (comboCount < 10) return 3;
    if (comboCount < 20) return 4;
    if (comboCount < 30) return 5;
    if (comboCount < 50) return 6;
    return 7; // 最大上限
}
```

#### 优点
- ✅ 更平衡
- ✅ 上限更低（7次）
- ✅ 阈值更高
- ✅ 不易失衡

#### 缺点
- ⚠️ 增长较慢
- ⚠️ 奖励感较弱

---

### 方案C：动态公式（灵活）⭐⭐⭐

#### 设计思路
使用数学公式动态计算，可灵活调整参数。

#### 计算公式
```javascript
多重反击次数 = 基础次数 + floor(连击数 / 增长系数)
限制在：最小次数 ~ 最大次数
```

#### 实现逻辑
```javascript
function getMultiCounterLimit() {
    const baseCount = 2;           // 基础次数
    const growthFactor = 5;        // 每5连击+1次
    const minCount = 2;            // 最小次数
    const maxCount = 8;            // 最大次数
    
    const calculated = baseCount + Math.floor(comboCount / growthFactor);
    return Math.max(minCount, Math.min(maxCount, calculated));
}
```

#### 次数对应表（growthFactor = 5）
```
连击数 (Combo)  →  多重反击次数 (Multi-Counter)
─────────────────────────────────────────
0-4 连击        →  2 次
5-9 连击        →  3 次
10-14 连击      →  4 次
15-19 连击      →  5 次
20-24 连击      →  6 次
25-29 连击      →  7 次
30+ 连击        →  8 次（上限）
```

#### 优点
- ✅ 灵活可调
- ✅ 易于平衡
- ✅ 可配置化

#### 缺点
- ⚠️ 需要调参
- ⚠️ 不够直观

---

### 方案D：指数增长（激进）⭐⭐

#### 设计思路
高连击时多重反击次数快速增长，极致爽快感。

#### 次数对应表
```
连击数 (Combo)  →  多重反击次数 (Multi-Counter)
─────────────────────────────────────────
0-2 连击        →  2 次
3-4 连击        →  3 次
5-7 连击        →  4 次
8-11 连击       →  5 次
12-15 连击      →  6 次
16-20 连击      →  8 次
21-25 连击      →  10 次
26-30 连击      →  12 次
31+ 连击        →  15 次（上限）
```

#### 实现逻辑
```javascript
function getMultiCounterLimit() {
    if (comboCount < 3) return 2;
    if (comboCount < 5) return 3;
    if (comboCount < 8) return 4;
    if (comboCount < 12) return 5;
    if (comboCount < 16) return 6;
    if (comboCount < 21) return 8;
    if (comboCount < 26) return 10;
    if (comboCount < 31) return 12;
    return 15; // 最大上限
}
```

#### 优点
- ✅ 极致爽快感
- ✅ 高连击奖励丰厚
- ✅ 视觉震撼

#### 缺点
- ⚠️ 容易失衡
- ⚠️ 可能过于强大
- ⚠️ 性能压力大

---

## 推荐方案对比

### 综合评分

| 方案 | 爽快感 | 平衡性 | 实现难度 | 推荐度 |
|------|--------|--------|----------|--------|
| A - 线性增长 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| B - 阶梯增长 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| C - 动态公式 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| D - 指数增长 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |

### 个人推荐：方案A（线性增长）

**理由**：
1. ✅ 平衡性好：上限10次不会过于失衡
2. ✅ 奖励明显：每个连击阶段都有提升
3. ✅ 实现简单：代码清晰易懂
4. ✅ 爽快感强：高连击时能明显感受到威力
5. ✅ 可调整：如果太强可以降低上限

---

## 配置参数设计

### config.json 新增配置
```json
"multiCounter": {
  "enabled": true,
  "timeWindow": 200,
  
  "comboScaling": {
    "enabled": true,
    "thresholds": [0, 3, 5, 10, 15, 20, 30, 40, 50],
    "counts": [2, 3, 4, 5, 6, 7, 8, 9, 10]
  }
}
```

---

## 游戏平衡性分析

### 方案A（线性增长）平衡性

#### 低连击阶段（0-9连击）
```
多重反击：2-4次
威胁等级：低-中
平衡性：✅ 良好
说明：玩家仍需谨慎操作
```

#### 中连击阶段（10-29连击）
```
多重反击：5-7次
威胁等级：中-高
平衡性：✅ 良好
说明：玩家有明显优势但不无敌
```

#### 高连击阶段（30-49连击）
```
多重反击：8-9次
威胁等级：高
平衡性：⚠️ 需要测试
说明：玩家优势明显，但仍可能失误
```

#### 极限连击阶段（50+连击）
```
多重反击：10次（上限）
威胁等级：极高
平衡性：⚠️ 可能过强
说明：玩家几乎无敌，但达到此阶段本身就是成就
```

---

### 平衡性调整建议

#### 如果太强
```json
// 降低上限
"linear": {
  "thresholds": [0, 3, 5, 10, 15, 20, 30, 40, 50],
  "counts": [2, 3, 4, 5, 5, 6, 6, 7, 7]  // 上限降为7
}

// 或提高阈值
"linear": {
  "thresholds": [0, 5, 10, 15, 25, 35, 50, 70, 100],
  "counts": [2, 3, 4, 5, 6, 7, 8, 9, 10]
}
```

#### 如果太弱
```json
// 提高上限
"linear": {
  "thresholds": [0, 3, 5, 10, 15, 20, 30, 40, 50],
  "counts": [3, 4, 5, 6, 7, 8, 10, 12, 15]  // 上限提升到15
}

// 或降低阈值
"linear": {
  "thresholds": [0, 2, 4, 7, 10, 15, 20, 30, 40],
  "counts": [2, 3, 4, 5, 6, 7, 8, 9, 10]
}
```

---

## 实现步骤

### 第一阶段：核心逻辑
1. [ ] 在 config.json 添加配置
2. [ ] 修改 `checkMultiCounter()` 函数
3. [ ] 添加 `getMultiCounterLimit()` 函数
4. [ ] 关联连击数与多重反击次数
5. [ ] 测试基本功能

### 第二阶段：平衡调整
1. [ ] 收集测试数据
2. [ ] 调整参数（如需要）
3. [ ] 最终测试

---

## 代码实现示例

### 修改后的 checkMultiCounter()
```javascript
function checkMultiCounter() {
    const now = Date.now();
    const timeSinceLastParry = now - lastParryTime;
    
    // 获取当前连击对应的多重反击上限
    const limit = getMultiCounterLimit();
    
    if (timeSinceLastParry < CONFIG.multiCounter.timeWindow) {
        multiCounterCount++;
        
        // 使用动态上限
        if (multiCounterCount >= limit) {
            return true;
        }
    } else {
        multiCounterCount = 1;
    }
    
    lastParryTime = now;
    return false;
}
```

### 新增 getMultiCounterLimit()
```javascript
function getMultiCounterLimit() {
    const config = CONFIG.multiCounter.comboScaling;
    
    if (!config.enabled) {
        return 3; // 默认固定3次
    }
    
    // 查找对应的次数
    for (let i = config.thresholds.length - 1; i >= 0; i--) {
        if (comboCount >= config.thresholds[i]) {
            return config.counts[i];
        }
    }
    
    return config.counts[0]; // 默认返回第一个值
}
```

---

## 测试场景

### 测试1：低连击（0-9）
```
步骤：
1. 开始游戏
2. 击杀1-9个敌人
3. 触发多重反击
4. 观察反击次数

预期结果：
✅ 0-2连击：2次反击
✅ 3-4连击：3次反击
✅ 5-9连击：4次反击
```

### 测试2：中连击（10-29）
```
步骤：
1. 维持10-29连击
2. 触发多重反击
3. 观察反击次数和视觉效果

预期结果：
✅ 10-14连击：5次反击
✅ 15-19连击：6次反击
✅ 20-29连击：7次反击
✅ 粒子效果增强
✅ 震动效果增强
```

### 测试3：高连击（30+）
```
步骤：
1. 维持30+连击
2. 触发多重反击
3. 观察反击次数和平衡性

预期结果：
✅ 30-39连击：8次反击
✅ 40-49连击：9次反击
✅ 50+连击：10次反击
✅ 视觉效果震撼
✅ 游戏仍有挑战性
```

### 测试4：平衡性测试
```
步骤：
1. 长时间游玩
2. 测试不同连击阶段的难度
3. 评估是否需要调整参数

预期结果：
✅ 低连击：仍有挑战性
✅ 中连击：有优势但不无敌
✅ 高连击：强大但仍可能失误
✅ 游戏整体平衡
```

---

## 预期效果

### 游戏体验
- 🎮 连击奖励更明显
- 🔥 高连击更有成就感
- ⚡ 多重反击更震撼
- 🎯 正向反馈循环更强

### 玩家反馈（预期）
- "连击越高越爽！"
- "10连击后的多重反击太震撼了！"
- "终于有理由维持高连击了！"
- "看到反击次数增加很有成就感！"

### 平衡性
- ✅ 低连击：仍需谨慎操作
- ✅ 中连击：有明显优势
- ✅ 高连击：强大但不无敌
- ✅ 极限连击：奖励玩家的高超技术

---

## 相关文档

- [VISUAL_UPDATE_v2.5.md](../visual-updates/VISUAL_UPDATE_v2.5.md) - 多重反击系统基础
- [BUGFIX_v2.5.2.md](../visual-updates/BUGFIX_v2.5.2.md) - 多重反击修复
- [requirement.md](../requirements/requirement.md) - 游戏需求文档

---

## 实现总结

### 确认的方案
- ✅ **方案**：A（线性增长）
- ✅ **上限**：10次
- ✅ **视觉反馈**：无额外反馈（保持简洁）

### 核心改动
1. 在 config.json 添加 `comboScaling` 配置
2. 修改 `checkMultiCounter()` 使用动态上限
3. 新增 `getMultiCounterLimit()` 函数
4. 连击数与多重反击次数关联

### 连击对应表（最终版）
```
0-2 连击   → 2次反击
3-4 连击   → 3次反击
5-9 连击   → 4次反击
10-14连击  → 5次反击
15-19连击  → 6次反击
20-29连击  → 7次反击
30-39连击  → 8次反击
40-49连击  → 9次反击
50+连击    → 10次反击（上限）
```

---

**文档版本**: v3.4  
**最后更新**: 2025-12-18  
**状态**: 待实现 ⏳
