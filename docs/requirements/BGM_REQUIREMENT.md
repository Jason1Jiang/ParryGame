# BGM 音乐系统需求文档

## 更新日期
2025-12-17

## 设计理念

为《BLADE ECHO / 剑刃回响》添加背景音乐系统，增强游戏的沉浸感和节奏感，同时保持简约风格。

### 核心设计原则
1. **氛围营造** - 音乐烘托武侠意境和紧张氛围
2. **节奏匹配** - 音乐节奏与游戏节奏同步
3. **不干扰游戏** - 音量适中，不影响音效反馈
4. **可控性** - 玩家可以自由开关和调节音量

---

## 音乐风格建议

### 方案A：电子武侠融合 ⭐⭐⭐⭐⭐（推荐）

**风格描述**：
- 现代电子音乐 + 传统武侠元素
- 快节奏、有力量感
- 适合格挡反击的战斗节奏

**参考音乐**：
- Cyberpunk 2077 战斗音乐
- Furi 游戏原声
- Katana ZERO 原声

**特点**：
- ✅ 节奏感强，适合快节奏战斗
- ✅ 电子音色与简约风格契合
- ✅ 现代感强，国际化
- ✅ 容易找到免费/付费素材

**适合场景**：
- 主菜单：舒缓版本（80-100 BPM）
- 战斗：激烈版本（120-140 BPM）
- 游戏结束：淡出或停止

---

### 方案B：极简氛围音乐 ⭐⭐⭐⭐

**风格描述**：
- 极简主义电子音乐
- 重复的旋律循环
- 营造专注和冥想感

**参考音乐**：
- Superhot 原声
- Downwell 原声
- Minit 原声

**特点**：
- ✅ 极简风格与游戏视觉统一
- ✅ 不干扰玩家专注
- ✅ 循环播放不会腻
- ✅ 文件小，加载快

**适合场景**：
- 全程使用同一首循环音乐
- 根据游戏状态调整音量/速度

---

### 方案C：传统武侠音乐 ⭐⭐⭐

**风格描述**：
- 传统中国乐器（古筝、笛子、琵琶）
- 武侠电影配乐风格
- 意境悠远

**参考音乐**：
- 《卧虎藏龙》配乐
- 《英雄》配乐
- 武侠游戏原声

**特点**：
- ✅ 武侠氛围浓厚
- ✅ 文化特色鲜明
- ⚠️ 可能与简约风格不太搭配
- ⚠️ 节奏较慢，不适合快节奏战斗

**适合场景**：
- 主菜单：传统音乐
- 战斗：快节奏改编版

---

### 方案D：无音乐（纯音效）⭐⭐⭐

**风格描述**：
- 不使用背景音乐
- 只保留音效反馈
- 极简主义

**参考游戏**：
- 一些极简独立游戏

**特点**：
- ✅ 最简约
- ✅ 玩家更专注
- ✅ 音效反馈更突出
- ⚠️ 可能缺少氛围感
- ⚠️ 长时间游玩可能单调

---

## 音乐实现方案

### 技术方案1：HTML5 Audio（推荐）

**优点**：
- ✅ 简单易用
- ✅ 浏览器原生支持
- ✅ 支持循环播放
- ✅ 支持音量控制

**缺点**：
- ⚠️ 需要用户交互才能播放（浏览器限制）
- ⚠️ 文件较大（MP3/OGG）

**实现代码**：
```javascript
// 创建音频对象
const bgm = new Audio('assets/music/bgm_menu.mp3');
bgm.loop = true;
bgm.volume = 0.3;

// 播放音乐
function playBGM() {
    bgm.play().catch(e => console.log('音乐播放失败:', e));
}

// 停止音乐
function stopBGM() {
    bgm.pause();
    bgm.currentTime = 0;
}

// 淡入淡出
function fadeIn(duration = 1000) {
    bgm.volume = 0;
    bgm.play();
    const step = 0.3 / (duration / 50);
    const interval = setInterval(() => {
        if (bgm.volume < 0.3) {
            bgm.volume = Math.min(0.3, bgm.volume + step);
        } else {
            clearInterval(interval);
        }
    }, 50);
}
```

---

### 技术方案2：Web Audio API

**优点**：
- ✅ 更强大的音频控制
- ✅ 可以实时调整音高、速度
- ✅ 可以添加音效处理

**缺点**：
- ⚠️ 实现复杂
- ⚠️ 对于简单BGM可能过度设计

**适合场景**：
- 需要动态调整音乐节奏
- 需要音乐与游戏状态同步

---

### 技术方案3：外部音乐库（Howler.js）

**优点**：
- ✅ 功能强大
- ✅ 跨浏览器兼容性好
- ✅ 支持音频精灵（多个音效合并）

**缺点**：
- ⚠️ 需要引入外部库
- ⚠️ 增加项目复杂度

---

## 音乐文件建议

### 文件格式
```
推荐格式：MP3（兼容性最好）
备选格式：OGG（文件更小）
不推荐：WAV（文件太大）
```

### 文件大小
```
主菜单音乐：1-2MB（1-2分钟循环）
战斗音乐：2-3MB（2-3分钟循环）
总大小：< 5MB
```

### 音质参数
```
比特率：128 kbps（足够）
采样率：44.1 kHz
声道：立体声
```

---

## 音乐获取途径

### 免费资源

#### 1. Freesound.org
- 网址：https://freesound.org
- 许可：CC0 / CC BY
- 特点：大量免费音效和音乐

#### 2. OpenGameArt.org
- 网址：https://opengameart.org
- 许可：CC0 / CC BY / GPL
- 特点：专门的游戏音乐资源

#### 3. Incompetech.com
- 网址：https://incompetech.com
- 许可：CC BY（需署名）
- 特点：Kevin MacLeod 的免费音乐库

#### 4. YouTube Audio Library
- 网址：https://studio.youtube.com
- 许可：免费使用
- 特点：高质量，无需署名

#### 5. Pixabay Music
- 网址：https://pixabay.com/music
- 许可：免费商用
- 特点：无需署名

---

### 付费资源（高质量）

#### 1. AudioJungle
- 网址：https://audiojungle.net
- 价格：$5-$50/首
- 特点：专业质量，种类丰富

#### 2. Epidemic Sound
- 网址：https://www.epidemicsound.com
- 价格：订阅制
- 特点：无限下载，商用授权

#### 3. Artlist
- 网址：https://artlist.io
- 价格：订阅制
- 特点：高质量，适合独立游戏

---

### AI 生成音乐（新兴）

#### 1. Suno AI
- 网址：https://suno.ai
- 特点：AI 生成音乐，可定制风格

#### 2. AIVA
- 网址：https://www.aiva.ai
- 特点：AI 作曲，适合游戏配乐

---

## 音乐播放逻辑

### 场景切换

```javascript
// 主菜单
function showStartScreen() {
    playBGM('menu');  // 播放菜单音乐
}

// 开始游戏
function startGame() {
    fadeOut(bgmMenu, 500);  // 淡出菜单音乐
    setTimeout(() => {
        fadeIn(bgmBattle, 500);  // 淡入战斗音乐
    }, 500);
}

// 游戏结束
function gameOver() {
    fadeOut(bgmBattle, 1000);  // 淡出战斗音乐
}
```

---

### 动态音量调整

```javascript
// 根据游戏状态调整音量
function updateBGMVolume() {
    if (player.blocking) {
        // 格挡时降低音乐音量，突出音效
        bgm.volume = 0.15;
    } else if (comboCount >= 10) {
        // 高连击时提高音量，增强氛围
        bgm.volume = 0.4;
    } else {
        // 正常音量
        bgm.volume = 0.3;
    }
}
```

---

### 循环播放

```javascript
// 无缝循环
bgm.loop = true;

// 或手动控制循环点
bgm.addEventListener('timeupdate', () => {
    if (bgm.currentTime >= bgm.duration - 0.1) {
        bgm.currentTime = 0;  // 回到开头
    }
});
```

---

## UI 控制

### 音乐开关

```html
<!-- 音乐开关按钮 -->
<button id="musicToggle" onclick="toggleMusic()">
    🔊 音乐
</button>
```

```javascript
let musicEnabled = true;

function toggleMusic() {
    musicEnabled = !musicEnabled;
    if (musicEnabled) {
        bgm.play();
        document.getElementById('musicToggle').textContent = '🔊 音乐';
    } else {
        bgm.pause();
        document.getElementById('musicToggle').textContent = '🔇 音乐';
    }
}
```

---

### 音量滑块

```html
<!-- 音量控制 -->
<div id="volumeControl">
    <label>音乐音量:</label>
    <input type="range" min="0" max="100" value="30" 
           oninput="setVolume(this.value)">
</div>
```

```javascript
function setVolume(value) {
    bgm.volume = value / 100;
}
```

---

## 配置参数

### config.json 新增配置

```json
"audio": {
  "enabled": true,
  "volume": 0.5,
  "sounds": {
    "parry": { "enabled": true, "frequency": 800, "duration": 0.1 },
    "perfectParry": { "enabled": true, "frequency": 1200, "duration": 0.15 },
    "counter": { "enabled": true, "frequency": 600, "duration": 0.2 },
    "slash": { "enabled": true, "frequency": 400, "duration": 0.3 },
    "kill": { "enabled": true, "frequency": 1000, "duration": 0.2 }
  },
  "music": {
    "enabled": true,
    "volume": 0.3,
    "fadeInDuration": 1000,
    "fadeOutDuration": 1000,
    "files": {
      "menu": "assets/music/bgm_menu.mp3",
      "battle": "assets/music/bgm_battle.mp3"
    }
  }
}
```

---

## 文件结构

```
ParryGame/
├── assets/
│   └── music/
│       ├── bgm_menu.mp3      # 主菜单音乐
│       ├── bgm_battle.mp3    # 战斗音乐
│       └── LICENSE.txt       # 音乐授权信息
├── game.js
├── config.json
└── index.html
```

---

## 实现步骤

### 第一阶段：基础实现
1. [ ] 选择音乐风格和文件
2. [ ] 创建 assets/music 文件夹
3. [ ] 下载/购买音乐文件
4. [ ] 实现基础播放功能
5. [ ] 添加循环播放

### 第二阶段：场景切换
1. [ ] 实现菜单音乐
2. [ ] 实现战斗音乐
3. [ ] 实现淡入淡出
4. [ ] 实现场景切换逻辑

### 第三阶段：UI 控制
1. [ ] 添加音乐开关按钮
2. [ ] 添加音量控制滑块
3. [ ] 保存用户设置（localStorage）
4. [ ] 优化 UI 样式

### 第四阶段：优化
1. [ ] 动态音量调整
2. [ ] 性能优化
3. [ ] 浏览器兼容性测试
4. [ ] 移动端适配

---

## 注意事项

### 浏览器限制
```
⚠️ 现代浏览器要求用户交互后才能播放音频
解决方案：
1. 在用户点击"开始游戏"后播放
2. 显示"点击任意位置开始"提示
3. 使用 AudioContext.resume()
```

### 性能影响
```
✅ 音乐播放对性能影响很小
✅ 使用 HTML5 Audio 不会影响帧率
⚠️ 注意文件大小，避免加载时间过长
```

### 版权问题
```
⚠️ 必须使用有授权的音乐
⚠️ 注意许可证要求（如 CC BY 需要署名）
⚠️ 商用需要商用授权
```

---

## 推荐方案总结

### 我的推荐：方案A + HTML5 Audio

**理由**：
1. ✅ 电子武侠融合风格与游戏完美契合
2. ✅ HTML5 Audio 简单可靠
3. ✅ 容易找到免费/付费素材
4. ✅ 实现成本低，效果好

**具体建议**：
- **主菜单音乐**：舒缓的电子音乐，80-100 BPM
- **战斗音乐**：激烈的电子音乐，120-140 BPM
- **音量设置**：默认 30%，可调节
- **淡入淡出**：1秒过渡，流畅自然

---

## 音乐搜索关键词

### 免费资源搜索
```
英文关键词：
- "cyberpunk battle music"
- "electronic action music"
- "fast paced combat music"
- "synthwave game music"
- "minimal electronic loop"

中文关键词：
- "电子战斗音乐"
- "赛博朋克配乐"
- "快节奏动作音乐"
- "极简电子音乐"
```

---

## 测试清单

### 功能测试
- [ ] 音乐能正常播放
- [ ] 循环播放正常
- [ ] 淡入淡出流畅
- [ ] 场景切换正常
- [ ] 音量控制有效
- [ ] 开关按钮正常

### 兼容性测试
- [ ] Chrome 浏览器
- [ ] Firefox 浏览器
- [ ] Safari 浏览器
- [ ] Edge 浏览器
- [ ] 移动端浏览器

### 性能测试
- [ ] 不影响游戏帧率
- [ ] 加载时间可接受
- [ ] 内存占用正常

---

## 预期效果

### 游戏体验
- 🎵 增强沉浸感
- 🎮 提升游戏氛围
- ⚡ 强化节奏感
- 🎯 不干扰游戏操作

### 玩家反馈
- "音乐很带感！"
- "节奏和游戏很搭！"
- "可以关闭音乐很贴心"
- "音乐不会太吵"

---

## 下一步

请确认以下内容：

1. **音乐风格**：A（电子武侠）/ B（极简氛围）/ C（传统武侠）/ D（无音乐）？
2. **技术方案**：HTML5 Audio / Web Audio API / Howler.js？
3. **音乐来源**：免费资源 / 付费购买 / AI生成 / 自己制作？
4. **实现优先级**：立即实现 / 后续优化 / 暂不实现？

确认后我将：
1. 帮你寻找合适的音乐文件
2. 实现完整的音乐系统
3. 添加 UI 控制
4. 测试和优化

🎵 等待你的确认！

---

**文档版本**: v1.0  
**最后更新**: 2025-12-17  
**状态**: 待确认 ⏳
