# 音频配置快速参考

## 快速开始

### 1. 使用自定义音效

在 `config.json` 中修改：

```json
"sounds": {
  "parry": {
    "enabled": true,
    "file": "assets/sounds/parry.mp3"  // 添加你的音频文件路径
  }
}
```

### 2. 使用自定义背景音乐

```json
"music": {
  "enabled": true,
  "files": {
    "battle": "assets/music/your_music.mp3"  // 替换为你的音乐文件
  }
}
```

---

## 所有可配置音效

| 音效名称 | 触发时机 | 配置键 | 默认频率 |
|---------|---------|--------|---------|
| 格挡 | 成功格挡攻击 | `parry` | 800 Hz |
| 完美格挡 | 完美时机格挡 | `perfectParry` | 1200 Hz |
| 反击 | 开始反击 | `counter` | 600 Hz |
| 斩击 | 击中敌人 | `slash` | 400 Hz |
| 击杀 | 击杀敌人 | `kill` | 1000 Hz |
| 死亡 | 玩家死亡 | `death` | 200 Hz |
| 生成 | 敌人生成 | `spawn` | 1200 Hz |

---

## 配置示例

### 只替换部分音效

```json
"sounds": {
  "parry": {
    "enabled": true,
    "file": "assets/sounds/parry.mp3"  // 使用文件
  },
  "perfectParry": {
    "enabled": true,
    "frequency": 1200,
    "duration": 0.15,
    "file": null  // 使用程序化音效
  }
}
```

### 禁用某个音效

```json
"sounds": {
  "spawn": {
    "enabled": false  // 禁用生成音效
  }
}
```

### 调整音量

```json
"audio": {
  "enabled": true,
  "volume": 0.5,  // 音效音量（0.0 - 1.0）
  "music": {
    "volume": 0.3  // 音乐音量（0.0 - 1.0）
  }
}
```

---

## 文件路径规则

- **相对路径**：相对于 `index.html` 的位置
- **推荐结构**：
  ```
  assets/
  ├── sounds/  (音效)
  └── music/   (音乐)
  ```

---

## 支持的音频格式

- ✅ **MP3** - 推荐，兼容性最好
- ✅ **OGG** - 文件更小
- ✅ **WAV** - 质量最高，文件大
- ⚠️ **M4A** - 部分浏览器支持

---

## 常见问题

**Q: 音频不播放？**  
A: 检查文件路径、格式，确保用户已与页面交互

**Q: 如何恢复默认音效？**  
A: 设置 `"file": null`

**Q: 可以同时使用文件和程序化音效吗？**  
A: 可以！每个音效独立配置

---

## 完整配置模板

```json
"audio": {
  "enabled": true,
  "volume": 0.5,
  "sounds": {
    "parry": { "enabled": true, "file": "assets/sounds/parry.mp3" },
    "perfectParry": { "enabled": true, "file": "assets/sounds/perfect_parry.mp3" },
    "counter": { "enabled": true, "file": "assets/sounds/counter.mp3" },
    "slash": { "enabled": true, "file": "assets/sounds/slash.mp3" },
    "kill": { "enabled": true, "file": "assets/sounds/kill.mp3" },
    "death": { "enabled": true, "file": "assets/sounds/death.mp3" },
    "spawn": { "enabled": true, "file": "assets/sounds/spawn.mp3" }
  },
  "music": {
    "enabled": true,
    "volume": 0.3,
    "files": {
      "battle": "assets/music/bgm_battle.mp3"
    }
  }
}
```

---

详细文档请查看 [AUDIO_CONFIGURATION_GUIDE.md](AUDIO_CONFIGURATION_GUIDE.md)
