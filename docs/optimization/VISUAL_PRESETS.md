# 视觉风格预设配置

本文档提供多种视觉风格的配置预设，可以直接复制到 `config.json` 中使用。

---

## 🎯 预设 1: 清爽简约（推荐）

**特点**: 纯黑背景 + 少量粒子 + 高对比度 + 强发光

**适合**: 长时间游玩，视觉不疲劳，元素清晰

### 配置参数

```json
"particles": {
  "count": 300,
  "baseSpeed": 0.2,
  "colors": ["#4488ff", "#8844ff"],
  "minAlpha": 0.1,
  "maxAlpha": 0.3,
  "minSize": 0.5,
  "maxSize": 1.5
},

"visual": {
  "background": {
    "gradient": false,
    "backgroundColor": "#000000",
    "vignette": false
  },
  "glow": {
    "enabled": true,
    "playerGlow": 15,
    "enemyGlow": 8,
    "bulletGlow": 5
  }
}
```

**效果预览**:
- ✅ 背景纯黑，不干扰视线
- ✅ 粒子数量减少 62.5%（800→300）
- ✅ 粒子更暗淡（透明度降低）
- ✅ 主体发光增强，更突出
- ✅ 移除暗角效果

---

## 🌌 预设 2: 深空氛围（原版增强）

**特点**: 渐变背景 + 中等粒子 + 暗角效果

**适合**: 喜欢氛围感，视觉丰富

### 配置参数

```json
"particles": {
  "count": 500,
  "baseSpeed": 0.25,
  "colors": ["#6699ff", "#9966ff"],
  "minAlpha": 0.15,
  "maxAlpha": 0.4,
  "minSize": 0.8,
  "maxSize": 2
},

"visual": {
  "background": {
    "gradient": true,
    "gradientColors": ["#001133", "#003366", "#000000"],
    "vignette": true,
    "vignetteStrength": 0.25
  },
  "glow": {
    "enabled": true,
    "playerGlow": 12,
    "enemyGlow": 6,
    "bulletGlow": 4
  }
}
```

**效果预览**:
- ✅ 深蓝色渐变背景
- ✅ 适中的粒子数量
- ✅ 轻微暗角增强聚焦
- ✅ 平衡的发光效果

---

## ⚡ 预设 3: 极简竞技

**特点**: 最少粒子 + 纯黑背景 + 最强对比

**适合**: 竞技向玩家，追求极致清晰

### 配置参数

```json
"particles": {
  "count": 150,
  "baseSpeed": 0.15,
  "colors": ["#3366ff"],
  "minAlpha": 0.05,
  "maxAlpha": 0.2,
  "minSize": 0.3,
  "maxSize": 1
},

"visual": {
  "background": {
    "gradient": false,
    "backgroundColor": "#000000",
    "vignette": false
  },
  "glow": {
    "enabled": true,
    "playerGlow": 20,
    "enemyGlow": 10,
    "bulletGlow": 6
  }
}
```

**效果预览**:
- ✅ 粒子数量最少（150个）
- ✅ 粒子几乎不可见
- ✅ 纯黑背景
- ✅ 最强发光效果
- ✅ 极致清晰度

---

## 🌟 预设 4: 华丽特效

**特点**: 大量粒子 + 渐变背景 + 强烈效果

**适合**: 追求视觉冲击，不在意性能

### 配置参数

```json
"particles": {
  "count": 1200,
  "baseSpeed": 0.4,
  "colors": ["#aaf", "#faf", "#faa", "#afa"],
  "minAlpha": 0.2,
  "maxAlpha": 0.6,
  "minSize": 1,
  "maxSize": 3
},

"visual": {
  "background": {
    "gradient": true,
    "gradientColors": ["#000428", "#004e92", "#000000"],
    "vignette": true,
    "vignetteStrength": 0.4
  },
  "glow": {
    "enabled": true,
    "playerGlow": 15,
    "enemyGlow": 10,
    "bulletGlow": 8
  }
}
```

**效果预览**:
- ✅ 粒子数量最多（1200个）
- ✅ 多彩粒子颜色
- ✅ 强烈的背景渐变
- ✅ 明显的暗角效果
- ⚠️ 可能影响性能

---

## 🌙 预设 5: 暗夜模式

**特点**: 深灰背景 + 冷色粒子 + 柔和发光

**适合**: 夜间游玩，护眼

### 配置参数

```json
"particles": {
  "count": 400,
  "baseSpeed": 0.2,
  "colors": ["#334466", "#445577"],
  "minAlpha": 0.1,
  "maxAlpha": 0.25,
  "minSize": 0.5,
  "maxSize": 1.5
},

"visual": {
  "background": {
    "gradient": false,
    "backgroundColor": "#0a0a0a",
    "vignette": true,
    "vignetteStrength": 0.2
  },
  "glow": {
    "enabled": true,
    "playerGlow": 12,
    "enemyGlow": 7,
    "bulletGlow": 4
  }
}
```

**效果预览**:
- ✅ 深灰色背景（不是纯黑）
- ✅ 冷色调粒子
- ✅ 柔和的发光
- ✅ 轻微暗角
- ✅ 护眼舒适

---

## 🎨 预设 6: 赛博朋克

**特点**: 青紫色调 + 强烈对比 + 霓虹效果

**适合**: 喜欢赛博朋克风格

### 配置参数

```json
"particles": {
  "count": 600,
  "baseSpeed": 0.3,
  "colors": ["#0ff", "#f0f", "#ff0"],
  "minAlpha": 0.2,
  "maxAlpha": 0.5,
  "minSize": 0.8,
  "maxSize": 2.5
},

"visual": {
  "background": {
    "gradient": true,
    "gradientColors": ["#0a0020", "#200a40", "#000000"],
    "vignette": true,
    "vignetteStrength": 0.35
  },
  "glow": {
    "enabled": true,
    "playerGlow": 18,
    "enemyGlow": 12,
    "bulletGlow": 8
  }
}
```

**效果预览**:
- ✅ 青色、紫色、黄色粒子
- ✅ 紫色调背景
- ✅ 强烈的霓虹发光
- ✅ 赛博朋克氛围

---

## 📊 预设对比表

| 预设 | 粒子数 | 背景 | 发光 | 性能 | 清晰度 | 氛围感 |
|------|--------|------|------|------|--------|--------|
| 清爽简约 | 300 | 纯黑 | 强 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 深空氛围 | 500 | 渐变 | 中 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 极简竞技 | 150 | 纯黑 | 最强 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ |
| 华丽特效 | 1200 | 渐变 | 强 | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 暗夜模式 | 400 | 深灰 | 柔和 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 赛博朋克 | 600 | 渐变 | 强 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🔧 如何切换预设

### 方法 1: 手动替换（推荐）

1. 打开 `config.json`
2. 找到 `particles` 和 `visual` 部分
3. 复制上面预设的配置
4. 替换对应部分
5. 保存文件
6. 刷新浏览器

### 方法 2: 完整配置文件

如果想要完整的配置文件，可以：
1. 备份当前的 `config.json`
2. 创建新的配置文件
3. 复制预设的完整配置

---

## 💡 自定义建议

### 调整粒子数量
```json
"count": 300  // 减少数量 = 更清爽
```

### 调整粒子透明度
```json
"minAlpha": 0.05,  // 降低 = 更淡
"maxAlpha": 0.2
```

### 调整发光强度
```json
"playerGlow": 15,  // 增加 = 更突出
"enemyGlow": 8,
"bulletGlow": 5
```

### 开关背景渐变
```json
"gradient": false  // false = 纯色背景
```

### 开关暗角效果
```json
"vignette": false  // false = 无暗角
```

---

## 🎯 推荐配置

### 新手推荐
- **清爽简约** - 视觉清晰，容易上手

### 竞技玩家推荐
- **极简竞技** - 最高清晰度，无干扰

### 休闲玩家推荐
- **深空氛围** - 平衡的视觉体验

### 视觉党推荐
- **华丽特效** 或 **赛博朋克** - 最强视觉冲击

### 夜间游玩推荐
- **暗夜模式** - 护眼舒适

---

## 📝 当前配置

当前游戏使用的是 **清爽简约** 预设。

如需切换，请按照上述方法修改 `config.json` 文件。

---

**最后更新**: 2025-12-15
