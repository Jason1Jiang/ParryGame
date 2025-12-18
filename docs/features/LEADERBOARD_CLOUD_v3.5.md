# 云端排行榜系统 v3.5 - 详细需求文档

## 更新日期
2025-12-18

## 方案选择
**方案B：云端排行榜（完整功能）**

---

## 技术选型对比

### 选项1：Firebase Realtime Database ⭐⭐⭐⭐⭐（推荐）

#### 优点
- ✅ **免费额度充足**：每天 10GB 下载，1GB 存储，100 并发连接
- ✅ **实时同步**：数据变化自动推送到所有客户端
- ✅ **简单易用**：SDK 简单，文档完善
- ✅ **自动扩展**：无需担心服务器容量
- ✅ **安全规则**：内置权限控制
- ✅ **无需后端**：纯前端即可实现

#### 缺点
- ⚠️ 需要 Google 账号
- ⚠️ 国内访问可能需要特殊网络
- ⚠️ 数据结构相对简单（NoSQL）

#### 成本估算
```
免费额度：
- 存储：1GB（足够存储数百万条记录）
- 下载：10GB/天（约 50万次查询/天）
- 连接：100 并发

预计使用：
- 存储：< 10MB（10万条记录）
- 下载：< 100MB/天（5000次查询/天）
- 连接：< 20 并发

结论：完全在免费额度内 ✅
```

---

### 选项2：Supabase ⭐⭐⭐⭐

#### 优点
- ✅ **开源**：可自托管
- ✅ **PostgreSQL**：强大的关系型数据库
- ✅ **功能丰富**：认证、存储、实时订阅
- ✅ **免费额度**：500MB 数据库，2GB 文件存储

#### 缺点
- ⚠️ 学习曲线较陡
- ⚠️ 需要编写 SQL
- ⚠️ 实时功能需要额外配置

#### 成本估算
```
免费额度：
- 数据库：500MB
- API 请求：无限制
- 实时连接：200 并发

结论：也在免费额度内 ✅
```

---

### 选项3：自建后端（Node.js + MongoDB）⭐⭐⭐

#### 优点
- ✅ 完全控制
- ✅ 无第三方依赖
- ✅ 可定制化

#### 缺点
- ⚠️ 开发成本高（需要 1-2 周）
- ⚠️ 需要服务器（每月 $5-20）
- ⚠️ 需要维护和监控
- ⚠️ 需要处理安全问题

---

## 推荐方案：Firebase Realtime Database

### 理由
1. ✅ **零成本**：完全在免费额度内
2. ✅ **快速实现**：1-2 天即可完成
3. ✅ **实时更新**：排行榜自动刷新
4. ✅ **无需维护**：Google 负责运维
5. ✅ **可靠性高**：99.95% 可用性
6. ✅ **易于扩展**：后续可升级到付费版

---

## 详细设计（基于 Firebase）

### 1. 数据库结构

#### Firebase 数据结构
```json
{
  "leaderboard": {
    "records": {
      "record_id_1": {
        "id": "uuid-string",
        "playerName": "玩家1",
        "kills": 50,
        "survivalTime": 180,
        "score": 5180,
        "difficulty": "balanced",
        "timestamp": 1702900000000,
        "combo": 20,
        "perfectParries": 10,
        "multiCounters": 5,
        "version": "3.5"
      },
      "record_id_2": {
        // 另一条记录
      }
    },
    "stats": {
      "totalGames": 1000,
      "totalPlayers": 500,
      "lastUpdate": 1702900000000
    }
  }
}
```

#### 索引设计
```json
// Firebase 规则中定义索引
{
  "rules": {
    "leaderboard": {
      "records": {
        ".indexOn": ["score", "difficulty", "timestamp"]
      }
    }
  }
}
```

---

### 2. 安全规则

#### Firebase Security Rules
```json
{
  "rules": {
    "leaderboard": {
      "records": {
        // 所有人可读
        ".read": true,
        
        // 只能添加新记录，不能修改或删除
        "$recordId": {
          ".write": "!data.exists() && newData.exists()",
          
          // 数据验证
          ".validate": "newData.hasChildren(['playerName', 'kills', 'survivalTime', 'score', 'difficulty', 'timestamp'])",
          
          "playerName": {
            ".validate": "newData.isString() && newData.val().length >= 1 && newData.val().length <= 20"
          },
          "kills": {
            ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 10000"
          },
          "survivalTime": {
            ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 36000"
          },
          "score": {
            ".validate": "newData.isNumber() && newData.val() == newData.parent().child('kills').val() * 100 + newData.parent().child('survivalTime').val()"
          },
          "difficulty": {
            ".validate": "newData.isString() && (newData.val() == 'hardcore' || newData.val() == 'balanced' || newData.val() == 'casual')"
          },
          "timestamp": {
            ".validate": "newData.isNumber() && newData.val() <= now"
          }
        }
      },
      "stats": {
        ".read": true,
        ".write": false
      }
    }
  }
}
```

---

### 3. 防作弊机制

#### 客户端验证
```javascript
// 1. 数据合理性检查
function validateScore(kills, survivalTime) {
    // 击杀率检查（每秒最多 2 个击杀）
    const killsPerSecond = kills / survivalTime;
    if (killsPerSecond > 2) {
        console.warn('Suspicious kill rate:', killsPerSecond);
        return false;
    }
    
    // 最小存活时间（至少 10 秒）
    if (survivalTime < 10) {
        console.warn('Survival time too short:', survivalTime);
        return false;
    }
    
    // 最大击杀数（根据游戏时间）
    const maxPossibleKills = Math.floor(survivalTime / 2);
    if (kills > maxPossibleKills) {
        console.warn('Kills exceed maximum possible:', kills, maxPossibleKills);
        return false;
    }
    
    return true;
}

// 2. 游戏会话验证
let gameSessionId = null;
let gameStartTime = null;

function startGame() {
    gameSessionId = generateUUID();
    gameStartTime = Date.now();
}

function endGame(kills, survivalTime) {
    const actualTime = (Date.now() - gameStartTime) / 1000;
    
    // 检查时间是否匹配
    if (Math.abs(actualTime - survivalTime) > 5) {
        console.warn('Time mismatch:', actualTime, survivalTime);
        return false;
    }
    
    return true;
}
```

#### 服务器端验证（Firebase Functions）
```javascript
// Cloud Functions for Firebase
exports.validateScore = functions.database
    .ref('/leaderboard/records/{recordId}')
    .onCreate((snapshot, context) => {
        const record = snapshot.val();
        
        // 1. 检查分数计算
        const expectedScore = record.kills * 100 + record.survivalTime;
        if (record.score !== expectedScore) {
            console.warn('Invalid score calculation');
            return snapshot.ref.remove();
        }
        
        // 2. 检查击杀率
        const killsPerSecond = record.kills / record.survivalTime;
        if (killsPerSecond > 2) {
            console.warn('Suspicious kill rate');
            return snapshot.ref.remove();
        }
        
        // 3. 检查时间戳
        const now = Date.now();
        if (record.timestamp > now || record.timestamp < now - 3600000) {
            console.warn('Invalid timestamp');
            return snapshot.ref.remove();
        }
        
        return null;
    });
```

#### IP 限制（可选）
```javascript
// 限制每个 IP 每小时最多提交 10 次
const submissionLimits = new Map();

function checkRateLimit(ip) {
    const now = Date.now();
    const key = `${ip}_${Math.floor(now / 3600000)}`;
    
    const count = submissionLimits.get(key) || 0;
    if (count >= 10) {
        return false;
    }
    
    submissionLimits.set(key, count + 1);
    return true;
}
```

---

### 4. 排行榜类型

#### 全球排行榜
```javascript
// 查询全球前 100 名
firebase.database()
    .ref('leaderboard/records')
    .orderByChild('score')
    .limitToLast(100)
    .once('value')
    .then(snapshot => {
        const records = [];
        snapshot.forEach(child => {
            records.unshift(child.val());
        });
        displayLeaderboard(records);
    });
```

#### 难度排行榜
```javascript
// 查询特定难度的前 100 名
firebase.database()
    .ref('leaderboard/records')
    .orderByChild('difficulty')
    .equalTo('balanced')
    .limitToLast(100)
    .once('value')
    .then(snapshot => {
        const records = [];
        snapshot.forEach(child => {
            records.unshift(child.val());
        });
        // 客户端按分数排序
        records.sort((a, b) => b.score - a.score);
        displayLeaderboard(records);
    });
```

#### 今日排行榜
```javascript
// 查询今天的记录
const todayStart = new Date().setHours(0, 0, 0, 0);

firebase.database()
    .ref('leaderboard/records')
    .orderByChild('timestamp')
    .startAt(todayStart)
    .once('value')
    .then(snapshot => {
        const records = [];
        snapshot.forEach(child => {
            records.push(child.val());
        });
        records.sort((a, b) => b.score - a.score);
        displayLeaderboard(records.slice(0, 100));
    });
```

#### 本周排行榜
```javascript
// 查询本周的记录
const weekStart = new Date();
weekStart.setDate(weekStart.getDate() - weekStart.getDay());
weekStart.setHours(0, 0, 0, 0);

firebase.database()
    .ref('leaderboard/records')
    .orderByChild('timestamp')
    .startAt(weekStart.getTime())
    .once('value')
    .then(snapshot => {
        const records = [];
        snapshot.forEach(child => {
            records.push(child.val());
        });
        records.sort((a, b) => b.score - a.score);
        displayLeaderboard(records.slice(0, 100));
    });
```

---

### 5. UI 设计

#### 排行榜界面（增强版）
```
┌─────────────────────────────────┐
│      LEADERBOARD                │
│        排行榜                    │
│                                 │
│  [全球] [今日] [本周]           │  ← 时间范围切换
│  难度: [ALL ▼]                  │  ← 难度筛选
│                                 │
│  在线玩家: 42 人                │  ← 实时在线人数
│  总记录: 1,234 条               │
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                 │
│  #  NAME      KILLS  TIME  DIFF │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  🥇 Player1    50    180s  ⚡⚡⚡│  ← 第一名（金色+动画）
│  🥈 Player2    45    165s  ⚡⚡ │  ← 第二名（银色）
│  🥉 Player3    42    150s  ⚡⚡ │  ← 第三名（铜色）
│  4  Player4    40    140s  ⚡⚡ │
│  5  Player5    38    135s  ⚡⚡ │
│  6  You        35    120s  ⚡⚡ │  ← 你的记录（高亮+闪烁）
│  7  Player7    32    110s  ⚡⚡ │
│  8  Player8    30    105s  ⚡   │
│  9  Player9    28    100s  ⚡   │
│  10 Player10   25     95s  ⚡   │
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                 │
│  你的全球排名: #6 / 1,234       │  ← 排名信息
│  你的最佳: 35击杀 120秒         │
│  超越: 89.5% 的玩家             │  ← 百分比排名
│                                 │
│  🔄 自动刷新中...              │  ← 实时更新提示
│                                 │
│  ┌──────────┐  ┌──────────┐    │
│  │   BACK   │  │  REFRESH │    │  ← 返回/刷新按钮
│  └──────────┘  └──────────┘    │
│                                 │
└─────────────────────────────────┘
```

#### 游戏结束界面（增强版）
```
┌─────────────────────────────────┐
│        GAME OVER                │
│         游戏结束                 │
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                 │
│     KILLS        TIME           │
│       42          120s          │
│                                 │
│     COMBO      PERFECT          │
│       15           8            │
│                                 │
│     SCORE: 4,320                │  ← 总分
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                 │
│  🏆 全球排名: #15 / 1,234 🏆   │  ← 实时排名
│  📈 超越 98.8% 的玩家！         │
│                                 │
│  输入你的名字:                   │
│  ┌─────────────────────┐        │
│  │ [Player Name]       │        │  ← 输入框
│  └─────────────────────┘        │
│                                 │
│  ┌───────────┐  ┌──────────┐   │
│  │  SUBMIT   │  │  SKIP    │   │  ← 提交/跳过
│  └───────────┘  └──────────┘   │
│                                 │
│  ⏳ 正在上传到云端...          │  ← 上传状态
│                                 │
│  ┌───────────┐  ┌──────────┐   │
│  │  RESTART  │  │  RANKS   │   │  ← 重新开始/查看排行榜
│  └───────────┘  └──────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

### 6. 实时功能

#### 实时排名更新
```javascript
// 监听排行榜变化
firebase.database()
    .ref('leaderboard/records')
    .orderByChild('score')
    .limitToLast(100)
    .on('value', snapshot => {
        const records = [];
        snapshot.forEach(child => {
            records.unshift(child.val());
        });
        updateLeaderboardDisplay(records);
        showUpdateNotification('排行榜已更新');
    });
```

#### 在线玩家统计
```javascript
// 使用 Firebase Presence
const presenceRef = firebase.database().ref('.info/connected');
const userPresenceRef = firebase.database().ref('presence/' + userId);

presenceRef.on('value', snapshot => {
    if (snapshot.val()) {
        // 用户在线
        userPresenceRef.set(true);
        userPresenceRef.onDisconnect().remove();
    }
});

// 统计在线人数
firebase.database()
    .ref('presence')
    .on('value', snapshot => {
        const onlineCount = snapshot.numChildren();
        updateOnlineCount(onlineCount);
    });
```

#### 新纪录通知
```javascript
// 监听新的高分记录
firebase.database()
    .ref('leaderboard/records')
    .orderByChild('timestamp')
    .startAt(Date.now())
    .on('child_added', snapshot => {
        const record = snapshot.val();
        if (record.score > 5000) {
            showNotification(`🎉 ${record.playerName} 创造了新纪录：${record.score}分！`);
        }
    });
```

---

### 7. 离线支持

#### 本地缓存
```javascript
// 启用离线持久化
firebase.database().enablePersistence()
    .catch(err => {
        console.warn('Persistence failed:', err);
    });

// 离线时使用缓存数据
firebase.database()
    .ref('leaderboard/records')
    .orderByChild('score')
    .limitToLast(100)
    .once('value')
    .then(snapshot => {
        // 即使离线也能显示缓存的数据
        displayLeaderboard(snapshot.val());
    });
```

#### 离线提示
```javascript
// 监听网络状态
firebase.database()
    .ref('.info/connected')
    .on('value', snapshot => {
        if (snapshot.val()) {
            showOnlineIndicator();
            syncPendingScores();
        } else {
            showOfflineIndicator();
        }
    });
```

---

### 8. 配置参数

#### config.json 新增
```json
"leaderboard": {
  "enabled": true,
  "type": "cloud",
  "firebase": {
    "apiKey": "YOUR_API_KEY",
    "authDomain": "your-app.firebaseapp.com",
    "databaseURL": "https://your-app.firebaseio.com",
    "projectId": "your-app",
    "storageBucket": "your-app.appspot.com",
    "messagingSenderId": "123456789",
    "appId": "1:123456789:web:abcdef"
  },
  "display": {
    "maxRecords": 100,
    "autoRefresh": true,
    "refreshInterval": 30000,
    "showOnlineCount": true,
    "showPercentile": true,
    "showDifficulty": true,
    "showCombo": true,
    "showPerfectParries": true,
    "showMultiCounters": true
  },
  "filters": {
    "timeRanges": ["all", "today", "week"],
    "difficulties": ["all", "hardcore", "balanced", "casual"]
  },
  "validation": {
    "maxKillsPerSecond": 2,
    "minSurvivalTime": 10,
    "maxSurvivalTime": 36000,
    "maxKills": 10000
  },
  "rateLimit": {
    "enabled": true,
    "maxSubmissionsPerHour": 10
  }
}
```

---

### 9. 实现步骤

#### 第一阶段：Firebase 设置（1天）
1. [ ] 创建 Firebase 项目
2. [ ] 配置 Realtime Database
3. [ ] 设置安全规则
4. [ ] 获取配置信息
5. [ ] 测试连接

#### 第二阶段：基础功能（2天）
1. [ ] 集成 Firebase SDK
2. [ ] 实现数据提交
3. [ ] 实现数据查询
4. [ ] 实现排名计算
5. [ ] 添加数据验证

#### 第三阶段：UI 实现（2天）
1. [ ] 设计排行榜界面
2. [ ] 实现名称输入
3. [ ] 实现排行榜显示
4. [ ] 添加筛选功能
5. [ ] 添加实时更新

#### 第四阶段：高级功能（2天）
1. [ ] 实现在线统计
2. [ ] 添加离线支持
3. [ ] 实现防作弊
4. [ ] 添加通知系统
5. [ ] 性能优化

#### 第五阶段：测试和部署（1天）
1. [ ] 功能测试
2. [ ] 性能测试
3. [ ] 安全测试
4. [ ] 文档完善
5. [ ] 正式部署

**总计：约 8 天工作量**

---

### 10. 成本分析

#### Firebase 免费额度
```
Spark Plan (免费):
- 存储: 1 GB
- 下载: 10 GB/月
- 连接: 100 并发

预计使用（10万玩家）:
- 存储: ~20 MB（10万条记录）
- 下载: ~2 GB/月（每天1万次查询）
- 连接: ~20 并发（高峰期）

结论: 完全免费 ✅
```

#### 升级方案（如果需要）
```
Blaze Plan (按量付费):
- 存储: $5/GB/月
- 下载: $1/GB
- 连接: 免费

预计成本（100万玩家）:
- 存储: $1/月（200MB）
- 下载: $20/月（20GB）
- 总计: ~$21/月

结论: 成本可控 ✅
```

---

### 11. 安全考虑

#### 数据安全
- ✅ Firebase 安全规则限制写入
- ✅ 数据验证防止无效数据
- ✅ 只能添加，不能修改或删除
- ✅ 敏感信息不存储（如 IP）

#### 防作弊
- ✅ 客户端数据验证
- ✅ 服务器端二次验证（Cloud Functions）
- ✅ 击杀率检查
- ✅ 时间戳验证
- ✅ 提交频率限制

#### 隐私保护
- ✅ 只存储玩家昵称，不存储个人信息
- ✅ 不强制登录
- ✅ 可选择匿名提交
- ✅ 符合 GDPR 要求

---

### 12. 备选方案

#### 如果 Firebase 访问受限
```
方案1: 使用 Supabase
- 国内访问更稳定
- 功能类似
- 实现方式相似

方案2: 使用国内云服务
- 腾讯云数据库
- 阿里云数据库
- 需要备案

方案3: 自建代理
- 搭建 Firebase 代理服务器
- 解决访问问题
```

---

### 13. 测试计划

#### 功能测试
```
1. 提交成绩测试
   - 正常提交
   - 异常数据提交
   - 网络中断提交

2. 查询测试
   - 全球排行榜
   - 难度筛选
   - 时间范围筛选

3. 实时更新测试
   - 多客户端同时查看
   - 新记录自动更新
   - 在线人数统计

4. 离线测试
   - 离线查看缓存
   - 离线提交队列
   - 重新上线同步
```

#### 性能测试
```
1. 并发测试
   - 100 人同时提交
   - 1000 人同时查询

2. 数据量测试
   - 10万条记录查询速度
   - 100万条记录查询速度

3. 网络测试
   - 慢速网络
   - 不稳定网络
```

#### 安全测试
```
1. 作弊测试
   - 修改客户端数据
   - 伪造时间戳
   - 重复提交

2. 攻击测试
   - SQL 注入（不适用）
   - XSS 攻击
   - DDoS 攻击
```

---

### 14. 用户体验优化

#### 加载优化
```javascript
// 1. 预加载排行榜
preloadLeaderboard();

// 2. 分页加载
loadLeaderboardPage(1, 20);

// 3. 虚拟滚动
useVirtualScroll(records);
```

#### 动画效果
```css
/* 新记录闪烁 */
@keyframes newRecord {
    0%, 100% { background: transparent; }
    50% { background: rgba(255, 215, 0, 0.3); }
}

/* 排名上升动画 */
@keyframes rankUp {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}

/* 加载动画 */
@keyframes loading {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

#### 错误处理
```javascript
// 友好的错误提示
function handleError(error) {
    switch (error.code) {
        case 'PERMISSION_DENIED':
            showError('无法访问排行榜，请检查网络连接');
            break;
        case 'NETWORK_ERROR':
            showError('网络连接失败，将使用离线模式');
            break;
        default:
            showError('发生未知错误，请稍后重试');
    }
}
```

---

### 15. 扩展功能（可选）

#### 社交功能
```
- 好友系统
- 好友排行榜
- 挑战好友
- 分享成绩到社交媒体
```

#### 成就系统
```
- 首次进入前100
- 首次进入前10
- 连续7天上榜
- 单日最高分
```

#### 赛季系统
```
- 每月重置排行榜
- 赛季奖励
- 历史赛季查询
```

---

## 下一步确认

请确认以下内容：

### 必须确认
1. **技术选型**：Firebase / Supabase / 自建？
2. **排行榜类型**：全球 / 今日 / 本周 / 全部？
3. **防作弊级别**：基础 / 中等 / 严格？
4. **实时功能**：需要 / 不需要？
5. **离线支持**：需要 / 不需要？

### 可选确认
6. **扩展功能**：社交 / 成就 / 赛季？
7. **UI 风格**：简约 / 华丽？
8. **实现时间**：立即 / 后续？

### Firebase 配置
9. **是否已有 Firebase 账号**？
10. **是否需要帮助创建 Firebase 项目**？

---

**文档版本**: v3.5  
**最后更新**: 2025-12-18  
**状态**: 待确认 ⏳

确认后我将开始实现代码！🚀
