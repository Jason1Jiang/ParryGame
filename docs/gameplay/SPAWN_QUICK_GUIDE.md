# 刷怪速度快速调整指南

## 📍 配置文件位置
`e:\ParryGame\config.json`

---

## 🎯 快速调整（只改这几个参数）

### 想要更快的节奏 ⚡
```json
"spawn": {
  "initialInterval": 1000,        // 改小 (原值: 1500)
  "minInterval": 300,             // 改小 (原值: 400)
  "killTracking": {
    "adjustFactor": 0.6           // 改小 (原值: 0.75)
  }
}
```

### 想要更慢的节奏 🌙
```json
"spawn": {
  "initialInterval": 2000,        // 改大 (原值: 1500)
  "minInterval": 600,             // 改大 (原值: 400)
  "killTracking": {
    "adjustFactor": 0.9           // 改大 (原值: 0.75)
  }
}
```

### 想要更多敌人 👾👾👾
```json
"enemyCountControl": {
  "baseTarget": 6,                // 改大 (原值: 4)
  "maxTarget": 15                 // 改大 (原值: 12)
}
```

### 想要更少敌人 👾
```json
"enemyCountControl": {
  "baseTarget": 3,                // 改小 (原值: 4)
  "maxTarget": 8                  // 改小 (原值: 12)
}
```

---

## 📊 核心参数详解

### 1. initialInterval（初始刷怪间隔）
**位置**: `spawn.initialInterval`  
**当前值**: 1500（毫秒）  
**作用**: 游戏开始时的刷怪速度

| 值 | 效果 | 适合 |
|---|---|---|
| 1000 | 每1秒1个敌人 | 硬核玩家 |
| 1500 | 每1.5秒1个敌人 | 当前设置 |
| 2000 | 每2秒1个敌人 | 新手玩家 |

---

### 2. minInterval（最小刷怪间隔）
**位置**: `spawn.minInterval`  
**当前值**: 400（毫秒）  
**作用**: 刷怪速度的上限（最快能多快）

| 值 | 效果 | 适合 |
|---|---|---|
| 300 | 每0.3秒1个敌人（极快） | 硬核玩家 |
| 400 | 每0.4秒1个敌人（快） | 当前设置 |
| 600 | 每0.6秒1个敌人（中等） | 新手玩家 |

---

### 3. adjustFactor（刷怪速度系数）
**位置**: `spawn.dynamicSpawn.killTracking.adjustFactor`  
**当前值**: 0.75  
**作用**: 刷怪间隔 = 击杀间隔 × 此值

**计算示例**:
```
玩家平均1秒击杀1个敌人
adjustFactor = 0.75
→ 刷怪间隔 = 1000ms × 0.75 = 750ms
→ 每0.75秒生成1个敌人
```

| 值 | 效果 | 说明 |
|---|---|---|
| 0.5 | 刷怪速度 = 击杀速度 × 2 | 敌人越来越多 |
| 0.75 | 刷怪速度 = 击杀速度 × 1.33 | 当前设置 |
| 1.0 | 刷怪速度 = 击杀速度 | 保持平衡 |
| 1.5 | 刷怪速度 = 击杀速度 × 0.67 | 敌人越来越少 |

---

### 4. comboBoost（连击加速）
**位置**: `spawn.dynamicSpawn.comboBoost`  
**当前值**: 
- 3连击 → 0.9倍（加速11%）
- 5连击 → 0.75倍（加速33%）
- 10连击 → 0.6倍（加速67%）
- 15连击 → 0.5倍（加速100%，翻倍）

**修改示例**:
```json
// 更激进的连击加速
"thresholds": [3, 5, 10],
"multipliers": [0.85, 0.6, 0.4]

// 更保守的连击加速
"thresholds": [5, 10, 15],
"multipliers": [0.9, 0.8, 0.7]

// 禁用连击加速
"enabled": false
```

---

### 5. enemyCountControl（敌人数量控制）
**位置**: `spawn.dynamicSpawn.enemyCountControl`

#### baseTarget（初始目标数量）
**当前值**: 4  
**作用**: 游戏开始时场上应该有几个敌人

| 值 | 效果 |
|---|---|
| 3 | 较少敌人，轻松 |
| 4 | 当前设置 |
| 6 | 较多敌人，激烈 |

#### maxTarget（最大目标数量）
**当前值**: 12  
**作用**: 场上最多有几个敌人

| 值 | 效果 |
|---|---|
| 8 | 较少敌人 |
| 12 | 当前设置 |
| 15 | 较多敌人 |

#### increasePerSecond（增长速度）
**当前值**: 0.1（每10秒+1个）  
**作用**: 目标敌人数量增长速度

| 值 | 效果 |
|---|---|
| 0.05 | 每20秒+1个（慢） |
| 0.1 | 每10秒+1个（当前） |
| 0.15 | 每6.7秒+1个（快） |

---

## 🎮 预设配置

### 预设1：极快节奏（硬核）⚡⚡⚡
```json
"spawn": {
  "initialInterval": 1000,
  "minInterval": 300,
  "maxInterval": 2000,
  "meleeStartTime": 15,
  "meleeSpawnChance": 0.4,
  "dynamicSpawn": {
    "enabled": true,
    "killTracking": {
      "adjustFactor": 0.6
    },
    "comboBoost": {
      "thresholds": [3, 5, 10],
      "multipliers": [0.85, 0.6, 0.4]
    },
    "enemyCountControl": {
      "baseTarget": 5,
      "maxTarget": 15
    }
  }
}
```

### 预设2：快节奏（推荐）⚡⚡
```json
"spawn": {
  "initialInterval": 1500,
  "minInterval": 400,
  "maxInterval": 2500,
  "meleeStartTime": 20,
  "meleeSpawnChance": 0.35,
  "dynamicSpawn": {
    "enabled": true,
    "killTracking": {
      "adjustFactor": 0.75
    },
    "comboBoost": {
      "thresholds": [3, 5, 10, 15],
      "multipliers": [0.9, 0.75, 0.6, 0.5]
    },
    "enemyCountControl": {
      "baseTarget": 4,
      "maxTarget": 12
    }
  }
}
```
**这是当前配置**

### 预设3：中等节奏（平衡）⚖️
```json
"spawn": {
  "initialInterval": 2000,
  "minInterval": 600,
  "maxInterval": 3000,
  "meleeStartTime": 25,
  "meleeSpawnChance": 0.3,
  "dynamicSpawn": {
    "enabled": true,
    "killTracking": {
      "adjustFactor": 0.85
    },
    "comboBoost": {
      "thresholds": [5, 10, 15],
      "multipliers": [0.9, 0.75, 0.6]
    },
    "enemyCountControl": {
      "baseTarget": 3,
      "maxTarget": 10
    }
  }
}
```

### 预设4：慢节奏（休闲）🌙
```json
"spawn": {
  "initialInterval": 2500,
  "minInterval": 1000,
  "maxInterval": 3500,
  "meleeStartTime": 30,
  "meleeSpawnChance": 0.25,
  "dynamicSpawn": {
    "enabled": true,
    "killTracking": {
      "adjustFactor": 0.9
    },
    "comboBoost": {
      "enabled": false
    },
    "enemyCountControl": {
      "baseTarget": 3,
      "maxTarget": 8
    }
  }
}
```

### 预设5：固定速度（禁用动态）
```json
"spawn": {
  "initialInterval": 2000,
  "minInterval": 800,
  "intervalDecreasePerSecond": 20,
  "dynamicSpawn": {
    "enabled": false
  }
}
```
**回到v2.7的固定递减模式**

---

## 🔧 常见调整场景

### 场景1：感觉敌人太少，想要更多战斗
```json
// 方案A：加快刷怪速度
"initialInterval": 1200,  // 从1500改到1200
"minInterval": 350,       // 从400改到350

// 方案B：增加敌人数量
"baseTarget": 5,          // 从4改到5
"maxTarget": 14,          // 从12改到14

// 方案C：两者都改（推荐）
```

### 场景2：感觉敌人太多，压力太大
```json
// 方案A：减慢刷怪速度
"initialInterval": 1800,  // 从1500改到1800
"minInterval": 500,       // 从400改到500

// 方案B：减少敌人数量
"baseTarget": 3,          // 从4改到3
"maxTarget": 10,          // 从12改到10

// 方案C：两者都改（推荐）
```

### 场景3：高手玩家，想要极限挑战
```json
"initialInterval": 800,
"minInterval": 250,
"adjustFactor": 0.5,
"comboBoost": {
  "thresholds": [3, 5, 10],
  "multipliers": [0.8, 0.5, 0.3]
},
"baseTarget": 6,
"maxTarget": 18
```

### 场景4：新手玩家，想要轻松体验
```json
"initialInterval": 2500,
"minInterval": 1000,
"adjustFactor": 1.0,
"comboBoost": {
  "enabled": false
},
"baseTarget": 2,
"maxTarget": 6
```

### 场景5：不喜欢动态系统，想要固定速度
```json
"dynamicSpawn": {
  "enabled": false
},
"intervalDecreasePerSecond": 20
```

---

## ⚠️ 注意事项

### 1. 修改后需要刷新浏览器
修改 config.json 后，必须**刷新浏览器**（F5）才能生效

### 2. 参数范围建议
- `initialInterval`: 800-3000（太小会太难，太大会太无聊）
- `minInterval`: 250-1000（太小可能卡顿，太大失去挑战）
- `adjustFactor`: 0.5-1.2（太小敌人堆积，太大敌人太少）
- `baseTarget`: 2-8（太少无聊，太多混乱）
- `maxTarget`: 6-20（太少后期无聊，太多可能卡顿）

### 3. 性能考虑
如果场上敌人太多（>15个）可能导致：
- 帧率下降
- 粒子效果卡顿
- 建议降低 `maxTarget`

### 4. 平衡性建议
- `adjustFactor` 建议在 0.7-0.85 之间
- 太小（<0.6）：敌人会越来越多
- 太大（>1.0）：敌人会越来越少

---

## 🎯 推荐调整流程

### 第一步：确定基础节奏
```
想要快节奏 → initialInterval = 1000-1500
想要中等节奏 → initialInterval = 1500-2000
想要慢节奏 → initialInterval = 2000-2500
```

### 第二步：设置速度上限
```
想要极限挑战 → minInterval = 300-400
想要适中挑战 → minInterval = 400-600
想要轻松体验 → minInterval = 600-1000
```

### 第三步：调整动态系数
```
想要敌人多 → adjustFactor = 0.6-0.7
想要平衡 → adjustFactor = 0.75-0.85
想要敌人少 → adjustFactor = 0.9-1.0
```

### 第四步：测试并微调
1. 启动游戏测试
2. 观察敌人数量和节奏
3. 根据感觉微调参数
4. 重复测试直到满意

---

## 📝 修改示例

### 示例1：我想要更快的节奏
**打开**: `e:\ParryGame\config.json`

**找到**:
```json
"initialInterval": 1500,
"minInterval": 400,
```

**改成**:
```json
"initialInterval": 1200,
"minInterval": 350,
```

**保存** → **刷新浏览器** → **完成**

---

### 示例2：我想要更多敌人
**打开**: `e:\ParryGame\config.json`

**找到**:
```json
"baseTarget": 4,
"maxTarget": 12,
```

**改成**:
```json
"baseTarget": 5,
"maxTarget": 15,
```

**保存** → **刷新浏览器** → **完成**

---

### 示例3：我想禁用连击加速
**打开**: `e:\ParryGame\config.json`

**找到**:
```json
"comboBoost": {
  "enabled": true,
```

**改成**:
```json
"comboBoost": {
  "enabled": false,
```

**保存** → **刷新浏览器** → **完成**

---

## 🆘 遇到问题？

### 问题1：改了没效果
**解决**: 确保刷新了浏览器（F5 或 Ctrl+F5）

### 问题2：游戏报错
**解决**: 检查 JSON 格式是否正确（逗号、引号、括号）

### 问题3：敌人太多卡顿
**解决**: 降低 `maxTarget` 到 10 以下

### 问题4：敌人太少无聊
**解决**: 
- 降低 `initialInterval`
- 降低 `minInterval`
- 降低 `adjustFactor`
- 增加 `baseTarget`

### 问题5：想恢复默认设置
**解决**: 使用预设2（快节奏推荐）的配置

---

**祝游戏愉快！** 🎮✨
