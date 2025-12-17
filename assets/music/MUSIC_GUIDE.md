# BGM 音乐文件指南

## 需要的音乐文件

你需要下载1个音乐文件并放在这个文件夹中：

1. **bgm_battle.mp3** - 战斗音乐（激烈，120-140 BPM）

**注意**：已移除菜单音乐，只保留战斗音乐。

---

## 推荐的免费音乐

### 方案1：Pixabay Music（推荐，无需署名）

#### 主菜单音乐推荐
访问：https://pixabay.com/music/

搜索关键词：
- "ambient electronic"
- "chill electronic"
- "minimal techno"
- "atmospheric"

推荐曲目（示例）：
1. "Lofi Study" - 舒缓的电子音乐
2. "Ambient Relaxing" - 氛围感强
3. "Chill Electronic" - 现代感

**下载步骤**：
1. 访问 Pixabay Music
2. 搜索上述关键词
3. 试听并选择喜欢的音乐
4. 点击"Free Download"
5. 重命名为 `bgm_menu.mp3`
6. 放入此文件夹

---

#### 战斗音乐推荐
搜索关键词：
- "action electronic"
- "cyberpunk"
- "fast electronic"
- "synthwave"
- "energetic"

推荐曲目（示例）：
1. "Cyberpunk Action" - 快节奏电子音乐
2. "Synthwave Battle" - 合成器音乐
3. "Electronic Energy" - 高能量

**下载步骤**：
1. 搜索上述关键词
2. 选择节奏快（120+ BPM）的音乐
3. 下载并重命名为 `bgm_battle.mp3`
4. 放入此文件夹

---

### 方案2：Freesound.org（需要注册）

访问：https://freesound.org

**注册账号**（免费）：
1. 点击右上角 "Sign up"
2. 填写邮箱和密码
3. 验证邮箱

**搜索音乐**：
- 搜索 "electronic loop"
- 搜索 "cyberpunk music"
- 筛选：License = CC0（无需署名）

---

### 方案3：Incompetech（需要署名）

访问：https://incompetech.com/music/royalty-free/music.html

**主菜单音乐**：
- 分类：Electronic
- 风格：Ambient, Chill
- 推荐：搜索 "Cipher"、"Floating Cities"

**战斗音乐**：
- 分类：Electronic
- 风格：Action, Fast
- 推荐：搜索 "Volatile Reaction"、"Cipher"

**注意**：使用 Incompetech 的音乐需要在游戏中署名：
```
Music by Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
```

---

### 方案4：YouTube Audio Library

访问：https://studio.youtube.com/channel/UC.../music

**需要**：
- Google 账号
- 访问 YouTube Studio

**优点**：
- 高质量
- 免费商用
- 无需署名

**搜索**：
- Genre: Electronic
- Mood: Calm（菜单）/ Energetic（战斗）

---

## 具体推荐曲目（可直接搜索）

### 主菜单音乐（舒缓）

#### Pixabay 推荐
1. **"Lofi Study"** by FASSounds
   - 风格：Lofi Electronic
   - BPM：85
   - 时长：2:30
   - 链接：搜索 "lofi study pixabay"

2. **"Ambient Technology"** by Lexin_Music
   - 风格：Ambient Electronic
   - BPM：90
   - 时长：3:00
   - 链接：搜索 "ambient technology pixabay"

3. **"Chill Abstract"** by Coma-Media
   - 风格：Chill Electronic
   - BPM：95
   - 时长：2:45

---

### 战斗音乐（激烈）

#### Pixabay 推荐
1. **"Cyberpunk Moonlight"** by Lexin_Music
   - 风格：Cyberpunk Electronic
   - BPM：128
   - 时长：3:30
   - 链接：搜索 "cyberpunk moonlight pixabay"

2. **"Action Electronic"** by Grand_Project
   - 风格：Action Electronic
   - BPM：135
   - 时长：3:00
   - 链接：搜索 "action electronic pixabay"

3. **"Synthwave 80s"** by SoundGalleryBy
   - 风格：Synthwave
   - BPM：125
   - 时长：3:15
   - 链接：搜索 "synthwave 80s pixabay"

---

## 音乐文件要求

### 格式
- **必须**：MP3 格式
- **推荐比特率**：128 kbps（足够）
- **采样率**：44.1 kHz
- **声道**：立体声

### 文件大小
- 主菜单音乐：1-2 MB（1-2分钟）
- 战斗音乐：2-3 MB（2-3分钟）
- 总大小：< 5 MB

### 时长
- 主菜单：1-3分钟（循环播放）
- 战斗：2-4分钟（循环播放）

---

## 下载后的操作

### 1. 检查文件
```
assets/music/
├── bgm_menu.mp3      ✅ 主菜单音乐
├── bgm_battle.mp3    ✅ 战斗音乐
└── MUSIC_GUIDE.md    ✅ 本指南
```

### 2. 测试音乐
1. 启动游戏
2. 点击"开始游戏"
3. 应该听到菜单音乐
4. 选择难度开始游戏
5. 应该切换到战斗音乐

### 3. 调整音量
如果音乐太大声或太小声，修改 `config.json`：
```json
"music": {
  "volume": 0.3  // 调整这个值（0.0-1.0）
}
```

---

## 快速开始（最简单的方法）

### 使用 Pixabay（推荐）

1. **访问**：https://pixabay.com/music/
2. **搜索战斗音乐**：
   - 输入 "cyberpunk action" 或 "electronic action"
   - 选择一首快节奏的（120+ BPM）
   - 下载并重命名为 `bgm_battle.mp3`
3. **放入文件夹**：
   - 将文件放入 `assets/music/` 文件夹
4. **完成**！启动游戏测试

---

## 临时测试方案

如果暂时找不到合适的音乐，可以：

### 方案1：使用占位音乐
1. 随便下载两首电子音乐
2. 重命名为 `bgm_menu.mp3` 和 `bgm_battle.mp3`
3. 先测试功能是否正常
4. 之后再替换成合适的音乐

### 方案2：禁用音乐
修改 `config.json`：
```json
"music": {
  "enabled": false  // 暂时禁用
}
```

---

## 版权说明

### 免费使用（无需署名）
- Pixabay Music - CC0 许可
- YouTube Audio Library - 部分曲目

### 需要署名
- Freesound - CC BY 许可
- Incompetech - CC BY 4.0 许可

### 署名方式
如果使用需要署名的音乐，在游戏中添加：
```
Music Credits:
- Menu Music: [曲名] by [作者]
- Battle Music: [曲名] by [作者]
Licensed under CC BY 4.0
```

---

## 常见问题

### Q: 音乐不播放？
A: 
1. 检查文件名是否正确
2. 检查文件格式是否为 MP3
3. 检查浏览器控制台是否有错误
4. 确保点击了"开始游戏"（浏览器限制）

### Q: 音乐太大声？
A: 修改 `config.json` 中的 `music.volume` 值

### Q: 音乐切换不流畅？
A: 调整 `fadeInDuration` 和 `fadeOutDuration` 值

### Q: 想要更多音乐？
A: 可以添加更多场景音乐，修改代码即可

---

## 推荐搜索关键词总结

### Pixabay / Freesound
**菜单音乐**：
- lofi electronic
- ambient electronic
- chill electronic
- minimal techno
- atmospheric music

**战斗音乐**：
- cyberpunk action
- synthwave
- electronic action
- fast electronic
- energetic electronic
- battle music

### YouTube Audio Library
**菜单音乐**：
- Genre: Electronic
- Mood: Calm, Peaceful

**战斗音乐**：
- Genre: Electronic
- Mood: Energetic, Intense

---

## 联系与支持

如果你找到了特别好的音乐，或者有任何问题，欢迎反馈！

---

**最后更新**: 2025-12-17  
**状态**: 等待音乐文件 ⏳
