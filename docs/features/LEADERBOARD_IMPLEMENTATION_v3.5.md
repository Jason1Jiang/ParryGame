# 云端排行榜实现方案 v3.5

## 更新日期
2025-12-18

## 确认的需求

### 核心配置
- ✅ **技术选型**：Firebase Realtime Database
- ✅ **排行榜类型**：难度排行榜（hardcore/balanced/casual）
- ✅ **防作弊**：不需要（简化实现）
- ✅ **实时功能**：仅实时排名更新
- ✅ **离线支持**：需要
- ✅ **扩展功能**：不需要
- ✅ **UI 风格**：简约
- ✅ **安全考虑**：不需要（简化安全规则）

---

## Firebase 项目创建指南

### 步骤 1：创建 Google 账号（如果没有）

1. 访问：https://accounts.google.com/signup
2. 填写信息创建账号
3. 验证邮箱

### 步骤 2：创建 Firebase 项目

1. **访问 Firebase 控制台**
   - 网址：https://console.firebase.google.com/
   - 使用 Google 账号登录

2. **创建新项目**
   ```
   点击 "添加项目" 或 "Create a project"
   
   项目名称：ParryGame（或你喜欢的名称）
   
   Google Analytics：可以关闭（不需要）
   
   点击 "创建项目"
   
   等待项目创建完成（约 30 秒）
   ```

3. **进入项目**
   ```
   项目创建完成后，点击 "继续"
   进入项目控制台
   ```

### 步骤 3：启用 Realtime Database

1. **找到 Realtime Database**
   ```
   左侧菜单 → 构建 (Build) → Realtime Database
   或直接点击 "Realtime Database"
   ```

2. **创建数据库**
   ```
   点击 "创建数据库" 按钮
   
   位置选择：
   - 推荐：us-central1（美国中部）
   - 或选择离你最近的区域
   
   安全规则：选择 "测试模式"（稍后会修改）
   
   点击 "启用"
   ```

3. **等待数据库创建**
   ```
   约 10-20 秒
   创建完成后会显示数据库界面
   ```

### 步骤 4：配置安全规则

1. **进入规则标签**
   ```
   在 Realtime Database 页面
   点击顶部的 "规则" 标签
   ```

2. **复制以下规则**
   ```json
   {
     "rules": {
       "leaderboard": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```

3. **发布规则**
   ```
   点击 "发布" 按钮
   规则会立即生效
   ```

### 步骤 5：获取配置信息

1. **进入项目设置**
   ```
   点击左上角的齿轮图标 ⚙️
   选择 "项目设置"
   ```

2. **添加 Web 应用**
   ```
   滚动到 "您的应用" 部分
   点击 Web 图标 </>
   
   应用昵称：ParryGame Web
   
   不需要勾选 "Firebase Hosting"
   
   点击 "注册应用"
   ```

3. **复制配置信息**
   ```javascript
   // 会显示类似这样的配置
    const firebaseConfig = {
        apiKey: "AIzaSyB3t0HmfYP-SgKQPuEYY4-Fp8QSWTR9Wr4",
        authDomain: "bladeecho-d4cd3.firebaseapp.com",
        databaseURL: "https://bladeecho-d4cd3-default-rtdb.firebaseio.com",
        projectId: "bladeecho-d4cd3",
        storageBucket: "bladeecho-d4cd3.firebasestorage.app",
        messagingSenderId: "695036343376",
        appId: "1:695036343376:web:6cd98206668494fa694d55",
        measurementId: "G-VEYN06K5BW"
    };
   ```

4. **保存配置**
   ```
   复制这些配置信息
   稍后会用到
   点击 "继续到控制台"
   ```

### 步骤 6：测试连接

1. **查看数据库**
   ```
   返回 Realtime Database
   点击 "数据" 标签
   应该看到空的数据库（根节点）
   ```

2. **手动添加测试数据**
   ```
   点击根节点旁边的 + 号
   
   名称：test
   值：hello
   
   点击 "添加"
   
   如果成功添加，说明数据库工作正常
   可以删除这条测试数据
   ```

---

## 简化的数据结构

### Firebase 数据结构
```json
{
  "leaderboard": {
    "hardcore": {
      "record_id_1": {
        "playerName": "Player1",
        "kills": 50,
        "survivalTime": 180,
        "score": 5180,
        "timestamp": 1702900000000
      }
    },
    "balanced": {
      "record_id_2": {
        "playerName": "Player2",
        "kills": 45,
        "survivalTime": 165,
        "score": 4665,
        "timestamp": 1702900000000
      }
    },
    "casual": {
      "record_id_3": {
        "playerName": "Player3",
        "kills": 40,
        "survivalTime": 150,
        "score": 4150,
        "timestamp": 1702900000000
      }
    }
  }
}
```

---

## 简化的实现方案

### 1. 文件结构
```
ParryGame/
├── index.html
├── game.js
├── config.json
├── firebase-config.js          ← 新增：Firebase 配置
└── leaderboard.js              ← 新增：排行榜逻辑
```

### 2. Firebase 配置文件

#### firebase-config.js
```javascript
// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyB3t0HmfYP-SgKQPuEYY4-Fp8QSWTR9Wr4",
    authDomain: "bladeecho-d4cd3.firebaseapp.com",
    databaseURL: "https://bladeecho-d4cd3-default-rtdb.firebaseio.com",
    projectId: "bladeecho-d4cd3",
    storageBucket: "bladeecho-d4cd3.firebasestorage.app",
    messagingSenderId: "695036343376",
    appId: "1:695036343376:web:6cd98206668494fa694d55",
    measurementId: "G-VEYN06K5BW"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 获取数据库引用
const database = firebase.database();
```

### 3. 排行榜逻辑

#### leaderboard.js
```javascript
// 排行榜管理器
class LeaderboardManager {
    constructor() {
        this.database = firebase.database();
        this.currentDifficulty = 'balanced';
        this.records = [];
    }
    
    // 提交成绩
    async submitScore(playerName, kills, survivalTime, difficulty) {
        const score = kills * 100 + survivalTime;
        const recordId = this.generateId();
        
        const record = {
            playerName: playerName || 'Player',
            kills: kills,
            survivalTime: survivalTime,
            score: score,
            timestamp: Date.now()
        };
        
        try {
            await this.database
                .ref(`leaderboard/${difficulty}/${recordId}`)
                .set(record);
            
            console.log('Score submitted successfully');
            return true;
        } catch (error) {
            console.error('Error submitting score:', error);
            return false;
        }
    }
    
    // 获取排行榜
    async getLeaderboard(difficulty, limit = 100) {
        try {
            const snapshot = await this.database
                .ref(`leaderboard/${difficulty}`)
                .orderByChild('score')
                .limitToLast(limit)
                .once('value');
            
            const records = [];
            snapshot.forEach(child => {
                records.unshift(child.val());
            });
            
            this.records = records;
            return records;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }
    }
    
    // 实时监听排行榜更新
    listenToLeaderboard(difficulty, callback) {
        this.database
            .ref(`leaderboard/${difficulty}`)
            .orderByChild('score')
            .limitToLast(100)
            .on('value', snapshot => {
                const records = [];
                snapshot.forEach(child => {
                    records.unshift(child.val());
                });
                this.records = records;
                callback(records);
            });
    }
    
    // 停止监听
    stopListening(difficulty) {
        this.database
            .ref(`leaderboard/${difficulty}`)
            .off();
    }
    
    // 生成唯一 ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // 获取玩家排名
    getPlayerRank(playerName) {
        const index = this.records.findIndex(r => r.playerName === playerName);
        return index >= 0 ? index + 1 : -1;
    }
}

// 创建全局实例
const leaderboard = new LeaderboardManager();
```

### 4. HTML 修改

#### index.html（添加 Firebase SDK）
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>格挡反击游戏</title>
    <style>
        /* 现有样式 */
    </style>
</head>
<body>
    <!-- 现有内容 -->
    
    <!-- 排行榜界面 -->
    <div id="leaderboardScreen" class="screen" style="display: none;">
        <h1>LEADERBOARD</h1>
        <h2>排行榜</h2>
        
        <div class="difficulty-tabs">
            <button onclick="switchDifficulty('hardcore')">硬核</button>
            <button onclick="switchDifficulty('balanced')" class="active">平衡</button>
            <button onclick="switchDifficulty('casual')">休闲</button>
        </div>
        
        <div id="leaderboardList">
            <!-- 排行榜列表 -->
        </div>
        
        <button onclick="backToMenu()">返回</button>
    </div>
    
    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
    
    <!-- Firebase 配置 -->
    <script src="firebase-config.js"></script>
    
    <!-- 排行榜逻辑 -->
    <script src="leaderboard.js"></script>
    
    <!-- 游戏逻辑 -->
    <script src="game.js"></script>
</body>
</html>
```

### 5. 游戏逻辑集成

#### game.js（添加排行榜调用）
```javascript
// 游戏结束时
function gameOver() {
    gameState = 'gameOver';
    
    // 显示结算界面
    document.getElementById('finalKills').textContent = kills;
    document.getElementById('finalTime').textContent = gameTime;
    document.getElementById('gameOverScreen').style.display = 'flex';
    
    // 提示输入名称
    showNameInput();
}

// 显示名称输入
function showNameInput() {
    const playerName = prompt('输入你的名字（可选）：') || 'Player';
    
    // 提交成绩到 Firebase
    leaderboard.submitScore(
        playerName,
        kills,
        gameTime,
        selectedDifficulty
    ).then(success => {
        if (success) {
            alert('成绩已提交到排行榜！');
        } else {
            alert('提交失败，请检查网络连接');
        }
    });
}

// 查看排行榜
function showLeaderboard() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('leaderboardScreen').style.display = 'flex';
    
    // 加载排行榜
    loadLeaderboard(selectedDifficulty);
    
    // 开始实时监听
    leaderboard.listenToLeaderboard(selectedDifficulty, records => {
        displayLeaderboard(records);
    });
}

// 加载排行榜
async function loadLeaderboard(difficulty) {
    const records = await leaderboard.getLeaderboard(difficulty);
    displayLeaderboard(records);
}

// 显示排行榜
function displayLeaderboard(records) {
    const listElement = document.getElementById('leaderboardList');
    
    if (records.length === 0) {
        listElement.innerHTML = '<p>暂无记录</p>';
        return;
    }
    
    let html = '<table><tr><th>#</th><th>名称</th><th>击杀</th><th>时间</th><th>分数</th></tr>';
    
    records.forEach((record, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
        
        html += `
            <tr>
                <td>${medal}</td>
                <td>${record.playerName}</td>
                <td>${record.kills}</td>
                <td>${record.survivalTime}s</td>
                <td>${record.score}</td>
            </tr>
        `;
    });
    
    html += '</table>';
    listElement.innerHTML = html;
}

// 切换难度
function switchDifficulty(difficulty) {
    // 停止当前监听
    leaderboard.stopListening(leaderboard.currentDifficulty);
    
    // 切换难度
    leaderboard.currentDifficulty = difficulty;
    
    // 加载新难度的排行榜
    loadLeaderboard(difficulty);
    
    // 开始新的监听
    leaderboard.listenToLeaderboard(difficulty, records => {
        displayLeaderboard(records);
    });
    
    // 更新按钮状态
    document.querySelectorAll('.difficulty-tabs button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// 返回菜单
function backToMenu() {
    // 停止监听
    leaderboard.stopListening(leaderboard.currentDifficulty);
    
    document.getElementById('leaderboardScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex';
}
```

### 6. 离线支持

#### leaderboard.js（添加离线缓存）
```javascript
class LeaderboardManager {
    constructor() {
        this.database = firebase.database();
        this.currentDifficulty = 'balanced';
        this.records = [];
        
        // 启用离线持久化
        firebase.database().enablePersistence()
            .catch(err => {
                console.warn('Persistence failed:', err);
            });
    }
    
    // ... 其他方法
}
```

---

## 样式设计（简约风格）

### CSS 添加
```css
/* 排行榜界面 */
#leaderboardScreen {
    background: rgba(255, 255, 255, 0.95);
    padding: 40px;
    border-radius: 10px;
    max-width: 800px;
    margin: 0 auto;
}

#leaderboardScreen h1 {
    font-size: 48px;
    color: #000;
    margin-bottom: 10px;
}

#leaderboardScreen h2 {
    font-size: 20px;
    color: #666;
    margin-bottom: 30px;
}

/* 难度标签 */
.difficulty-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    justify-content: center;
}

.difficulty-tabs button {
    padding: 10px 20px;
    border: 2px solid #000;
    background: transparent;
    color: #000;
    font-size: 16px;
    cursor: pointer;
    border-radius: 5px;
    transition: all 0.3s;
}

.difficulty-tabs button.active {
    background: #000;
    color: #fff;
}

.difficulty-tabs button:hover {
    background: #000;
    color: #fff;
}

/* 排行榜表格 */
#leaderboardList table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}

#leaderboardList th {
    background: #000;
    color: #fff;
    padding: 10px;
    text-align: left;
}

#leaderboardList td {
    padding: 10px;
    border-bottom: 1px solid #ddd;
}

#leaderboardList tr:hover {
    background: rgba(0, 0, 0, 0.05);
}

/* 奖牌样式 */
#leaderboardList tr:nth-child(1) td:first-child {
    font-size: 24px;
}

#leaderboardList tr:nth-child(2) td:first-child {
    font-size: 24px;
}

#leaderboardList tr:nth-child(3) td:first-child {
    font-size: 24px;
}
```

---

## 实现步骤

### 第一步：创建 Firebase 项目（30分钟）
1. [ ] 按照上面的指南创建 Firebase 项目
2. [ ] 启用 Realtime Database
3. [ ] 配置安全规则
4. [ ] 获取配置信息

### 第二步：添加 Firebase SDK（10分钟）
1. [ ] 在 index.html 中添加 Firebase SDK
2. [ ] 创建 firebase-config.js
3. [ ] 填入你的配置信息

### 第三步：实现排行榜逻辑（1小时）
1. [ ] 创建 leaderboard.js
2. [ ] 实现 LeaderboardManager 类
3. [ ] 测试数据提交和查询

### 第四步：集成到游戏（1小时）
1. [ ] 修改 game.js
2. [ ] 添加排行榜界面
3. [ ] 实现难度切换
4. [ ] 测试完整流程

### 第五步：添加样式（30分钟）
1. [ ] 添加排行榜样式
2. [ ] 优化界面布局
3. [ ] 测试响应式

### 第六步：测试（30分钟）
1. [ ] 测试提交成绩
2. [ ] 测试查看排行榜
3. [ ] 测试实时更新
4. [ ] 测试离线功能

**总计：约 3.5 小时**

---

## 测试清单

### 功能测试
- [ ] 能否成功提交成绩
- [ ] 能否查看排行榜
- [ ] 能否切换难度
- [ ] 排名是否正确
- [ ] 实时更新是否工作

### 网络测试
- [ ] 在线提交和查询
- [ ] 离线查看缓存
- [ ] 重新上线后同步

### 界面测试
- [ ] 排行榜显示正常
- [ ] 难度切换正常
- [ ] 样式符合预期

---

## 常见问题

### Q1: Firebase 访问不了怎么办？
**A**: 可能需要特殊网络环境，或者考虑使用国内的替代方案（如 Supabase）。

### Q2: 如何清空排行榜？
**A**: 在 Firebase 控制台的 Realtime Database 中，找到对应的节点，点击删除。

### Q3: 如何限制排行榜数量？
**A**: 在查询时使用 `limitToLast(100)` 限制返回的记录数。

### Q4: 如何防止恶意提交？
**A**: 当前方案不包含防作弊，如需要可以后续添加验证逻辑。

---

## 下一步

1. **创建 Firebase 项目**
   - 按照上面的指南操作
   - 获取配置信息

2. **告诉我配置信息**
   - 我会帮你创建配置文件
   - 或者你可以自己填入 firebase-config.js

3. **开始实现代码**
   - 我会创建所有需要的文件
   - 并集成到现有游戏中

准备好了吗？🚀

---

**文档版本**: v3.5  
**最后更新**: 2025-12-18  
**状态**: 待创建 Firebase 项目 ⏳
