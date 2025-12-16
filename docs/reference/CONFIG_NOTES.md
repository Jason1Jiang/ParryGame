# config.json 配置说明

## 重要提示 ⚠️

**config.json 必须是标准 JSON 格式，不支持注释！**

浏览器的 `JSON.parse()` 不支持 `//` 或 `/* */` 注释。

---

## 配置参数说明

### spawn（刷怪系统）

#### 基础参数
```json
{
  "initialInterval": 1500,  // 初始刷怪间隔(毫秒) - 越小越快 (推荐: 1000-2000)
  "minInterval": 400,       // 最小刷怪间隔(毫秒) - 刷怪速度上限 (推荐: 300-600)
  "maxInterval": 2500,      // 最大刷怪间隔(毫秒) - 刷怪速度下限 (推荐: 2000-3500)
  "intervalDecreasePerSecond": 0,  // 固定递减(已禁用) - 设为0使用动态系统
  "meleeStartTime": 20,     // 多少秒后开始出现近战敌人 (推荐: 15-30)
  "meleeSpawnChance": 0.35  // 近战敌人生成概率 0-1 (推荐: 0.3-0.5)
}
```

#### dynamicSpawn（动态刷怪）
```json
{
  "enabled": true,  // 动态刷怪总开关 true=启用动态 false=使用固定速度
  "mode": "hybrid",
  
  "killTracking": {
    "enabled": true,        // 击杀追踪开关 - 根据击杀速度调整刷怪
    "trackCount": 5,        // 追踪最近几次击杀 (推荐: 3-7)
    "adjustFactor": 0.75,   // 刷怪速度系数 - 刷怪间隔=击杀间隔×此值 (越小越快, 推荐: 0.6-0.9)
    "smoothing": 0.25,      // 平滑过渡 0-1 (越大变化越慢, 推荐: 0.2-0.4)
    "kickInKills": 3        // 击杀几次后启用 (推荐: 2-5)
  },
  
  "comboBoost": {
    "enabled": true,                    // 连击加速开关 - 连击越高刷怪越快
    "thresholds": [3, 5, 10, 15],       // 连击阈值 - 达到这些连击数时触发加速
    "multipliers": [0.9, 0.85, 0.8, 0.75]  // 加速倍率 - 对应的刷怪间隔倍率 (越小越快)
    // 示例: 10连击时 刷怪间隔×0.8 = 刷怪速度提升25%
  },
  
  "enemyCountControl": {
    "enabled": true,              // 敌人数量控制开关 - 维持场上敌人数量
    "baseTarget": 4,              // 初始目标数量 - 游戏开始时的目标敌人数 (推荐: 3-6)
    "increasePerSecond": 0.1,     // 数量增长速度 - 每秒增加多少个 (推荐: 0.05-0.15)
    "maxTarget": 10,              // 最大目标数量 - 场上敌人数量上限 (推荐: 10-15)
    "underflowMultiplier": 0.7,   // 敌人不足时加速倍率 (越小越快)
    "overflowMultiplier": 1.3     // 敌人过多时减速倍率 (越大越慢)
  }
}
```

---

## 难度预设参考

### 硬核模式 ⚡⚡⚡
```json
{
  "initialInterval": 1000,
  "minInterval": 300,
  "maxInterval": 2000,
  "dynamicSpawn": {
    "killTracking": {
      "adjustFactor": 0.6,
      "trackCount": 5
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

### 平衡模式 ⚡⚡（推荐）
```json
{
  "initialInterval": 1500,
  "minInterval": 400,
  "maxInterval": 2500,
  "dynamicSpawn": {
    "killTracking": {
      "adjustFactor": 0.75,
      "trackCount": 5
    },
    "comboBoost": {
      "thresholds": [3, 5, 10, 15],
      "multipliers": [0.9, 0.85, 0.8, 0.75]
    },
    "enemyCountControl": {
      "baseTarget": 4,
      "maxTarget": 10
    }
  }
}
```

### 休闲模式 🌙
```json
{
  "initialInterval": 2500,
  "minInterval": 1000,
  "maxInterval": 3500,
  "dynamicSpawn": {
    "killTracking": {
      "adjustFactor": 0.9,
      "trackCount": 3
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

---

## 修改配置的正确方法

### ❌ 错误（会导致 JSON 解析失败）
```json
{
  "initialInterval": 1500,  // 这是注释
  "minInterval": 400        // 不支持注释！
}
```

### ✅ 正确
```json
{
  "initialInterval": 1500,
  "minInterval": 400
}
```

如果需要注释，请在单独的文档中说明，或使用本文档作为参考。

---

## 相关文档

- [SPAWN_SYSTEM_v2.9.md](../gameplay/SPAWN_SYSTEM_v2.9.md) - 完整系统文档
- [DEBUG_GUIDE.md](../gameplay/DEBUG_GUIDE.md) - 调试界面使用指南
- [SPAWN_SYSTEM_v2.8.md](../gameplay/SPAWN_SYSTEM_v2.8.md) - 动态刷怪系统

---

**注意**: 修改 config.json 后需要刷新浏览器才能生效！
