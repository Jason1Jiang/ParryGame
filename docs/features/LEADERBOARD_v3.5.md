# 排行榜系统 v3.5 - 设计文档

## 更新日期
2025-12-18

## 功能概述

添加排行榜功能，让玩家可以将自己的击杀数和存活时间与其他玩家进行排名对比，增强游戏的竞技性和可玩性。

### 核心目标
1. **记录成绩** - 保存玩家的最佳成绩
2. **排名对比** - 与其他玩家进行排名
3. **激励机制** - 鼓励玩家挑战更高分数
4. **社交互动** - 增加玩家之间的竞争和交流

---

## 方案对比

### 方案A：本地排行榜（推荐）⭐⭐⭐⭐⭐

#### 特点
- 使用 localStorage 存储
- 仅显示本机的历史最佳成绩
- 无需服务器
- 实现简单

#### 优点
- ✅ 实现简单，无需后端
- ✅ 无需网络连接
- ✅ 隐私保护好
- ✅ 零成本
- ✅ 响应速度快

#### 缺点
- ⚠️ 只能看到自己的成绩
- ⚠️ 无法与其他玩家对比
- ⚠️ 清除浏览器数据会丢失

#### 适合场景
- 单机游戏
- 个人练习
- 快速实现

---

### 方案B：云端排行榜（完整功能）⭐⭐⭐⭐

#### 特点
- 使用云端数据库（Firebase/Supabase）
- 全球玩家排名
- 实时更新

#### 优点
- ✅ 全球排名对比
- ✅ 真实竞技感
- ✅ 数据永久保存
- ✅ 支持多设备同步

#### 缺点
- ⚠️ 需要后端服务
- ⚠️ 需要网络连接
- ⚠️ 可能有成本
- ⚠️ 实现复杂
- ⚠️ 需要防作弊机制

#### 适合场景
- 正式发布的游戏
- 需要社交功能
- 有运营预算

---

### 方案C：混合方案（平衡）⭐⭐⭐⭐⭐

#### 特点
- 本地排行榜 + 可选的云端排行榜
- 优先显示本地成绩
- 可选择上传到云端

#### 优点
- ✅ 兼顾两者优点
- ✅ 离线也能玩
- ✅ 在线时可对比
- ✅ 灵活性高

#### 缺点
- ⚠️ 实现较复杂
- ⚠️ 需要维护两套系统

#### 适合场景
- 长期运营的游戏
- 需要兼顾离线和在线

---

## 推荐方案：方案A（本地排行榜）

考虑到当前游戏的特点和实现成本，推荐先实现**方案A（本地排行榜）**，后续可以升级到方案C。

### 理由
1. ✅ 实现简单，可快速上线
2. ✅ 无需后端，零成本
3. ✅ 满足基本需求
4. ✅ 可作为云端排行榜的基础
5. ✅ 适合当前游戏规模

---

## 详细设计（方案A：本地排行榜）

### 1. 数据结构

#### 成绩记录
```javascript
{
  id: "uuid-string",           // 唯一标识
  playerName: "玩家名称",       // 玩家昵称
  kills: 42,                    // 击杀数
  survivalTime: 120,            // 存活时间（秒）
  difficulty: "balanced",       // 难度
  timestamp: 1702900000000,     // 时间戳
  combo: 15,                    // 最高连击
  perfectParries: 8,            // 完美格挡次数
  multiCounters: 3              // 多重反击次数
}
```

#### 排行榜数据
```javascript
{
  version: "1.0",
  records: [
    // 成绩记录数组，按分数排序
  ],
  maxRecords: 100  // 最多保存100条记录
}
```

---

### 2. 排名规则

#### 主要排名依据
```
优先级1：击杀数（越高越好）
优先级2：存活时间（越长越好）
优先级3：时间戳（越早越好，同分时）
```

#### 计算公式
```javascript
// 综合分数 = 击杀数 * 100 + 存活时间
score = kills * 100 + survivalTime

// 示例：
// 42击杀 + 120秒 = 4200 + 120 = 4320分
```

#### 难度系数（可选）
```javascript
// 不同难度的分数倍率
hardcore: 1.5x
balanced: 1.0x
casual: 0.7x
```

---

### 3. UI 设计

#### 游戏结束界面
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
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                 │
│  🏆 NEW RECORD! 🏆             │  ← 新纪录提示
│                                 │
│  输入你的名字:                   │
│  ┌─────────────────────┐        │
│  │ [Player Name]       │        │  ← 输入框
│  └─────────────────────┘        │
│                                 │
│  ┌───────────┐  ┌──────────┐   │
│  │  SUBMIT   │  │  SKIP    │   │  ← 提交/跳过按钮
│  └───────────┘  └──────────┘   │
│                                 │
│  ┌───────────┐  ┌──────────┐   │
│  │  RESTART  │  │  MENU    │   │  ← 重新开始/菜单
│  └───────────┘  └──────────┘   │
│                                 │
└─────────────────────────────────┘
```

#### 排行榜界面
```
┌─────────────────────────────────┐
│      LEADERBOARD                │
│        排行榜                    │
│                                 │
│  难度: [BALANCED ▼]             │  ← 难度筛选
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                 │
│  #  NAME      KILLS  TIME  DATE │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  1  Player1    50    180s  今天  │  ← 第一名（金色）
│  2  Player2    45    165s  昨天  │  ← 第二名（银色）
│  3  Player3    42    150s  2天前 │  ← 第三名（铜色）
│  4  Player4    40    140s  3天前 │
│  5  Player5    38    135s  4天前 │
│  6  You        35    120s  今天  │  ← 当前玩家（高亮）
│  7  Player7    32    110s  5天前 │
│  8  Player8    30    105s  6天前 │
│  9  Player9    28    100s  7天前 │
│  10 Player10   25     95s  8天前 │
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                 │
│  你的排名: #6 / 100             │  ← 排名信息
│  你的最佳: 35击杀 120秒         │
│                                 │
│         ┌──────────┐            │
│         │   BACK   │            │  ← 返回按钮
│         └──────────┘            │
│                                 │
└─────────────────────────────────┘
```

#### 主菜单添加入口
```
┌─────────────────────────────────┐
│        BLADE ECHO               │
│          刀光剑影                │
│                                 │
│         ┌─────────┐             │
│         │  START  │             │
│         └─────────┘             │
│                                 │
│         ┌─────────┐             │
│         │  RANKS  │             │  ← 新增排行榜按钮
│         └─────────┘             │
│                                 │
│       点击开始游戏               │
│                                 │
└─────────────────────────────────┘
```

---

### 4. 功能流程

#### 游戏结束流程
```
1. 玩家死亡
2. 显示死亡动画
3. 计算最终分数
4. 检查是否进入排行榜
   ├─ 是 → 显示"NEW RECORD"提示
   │       └─ 请求输入玩家名称
   │           ├─ 输入名称 → 保存记录
   │           └─ 跳过 → 使用默认名称
   └─ 否 → 直接显示结算界面
5. 显示排行榜按钮
6. 玩家选择：重新开始 / 查看排行榜 / 返回菜单
```

#### 查看排行榜流程
```
1. 点击"RANKS"按钮
2. 加载本地排行榜数据
3. 按难度筛选（可选）
4. 显示排名列表
5. 高亮当前玩家的记录
6. 显示统计信息
7. 返回主菜单
```

---

### 5. 数据存储

#### localStorage 结构
```javascript
// 键名
const LEADERBOARD_KEY = 'parryGame_leaderboard';

// 存储
localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboardData));

// 读取
const data = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '{"version":"1.0","records":[]}');
```

#### 数据管理
```javascript
// 添加记录
function addRecord(record) {
    // 1. 读取现有数据
    // 2. 添加新记录
    // 3. 按分数排序
    // 4. 限制最大数量（100条）
    // 5. 保存到 localStorage
}

// 获取排行榜
function getLeaderboard(difficulty = null) {
    // 1. 读取数据
    // 2. 按难度筛选（可选）
    // 3. 返回排序后的列表
}

// 获取玩家排名
function getPlayerRank(playerId) {
    // 1. 读取数据
    // 2. 查找玩家记录
    // 3. 返回排名
}

// 清除数据
function clearLeaderboard() {
    localStorage.removeItem(LEADERBOARD_KEY);
}
```

---

### 6. 防作弊机制（基础）

#### 数据验证
```javascript
// 检查数据合理性
function validateRecord(record) {
    // 击杀数不能为负
    if (record.kills < 0) return false;
    
    // 存活时间不能为负
    if (record.survivalTime < 0) return false;
    
    // 击杀数与时间的比例检查
    const killsPerSecond = record.kills / record.survivalTime;
    if (killsPerSecond > 2) return false; // 每秒最多2个击杀
    
    return true;
}
```

#### 数据加密（可选）
```javascript
// 简单的混淆，防止直接修改 localStorage
function encodeData(data) {
    return btoa(JSON.stringify(data));
}

function decodeData(encoded) {
    return JSON.parse(atob(encoded));
}
```

---

### 7. 样式设计

#### 排行榜样式
```css
/* 排行榜容器 */
.leaderboard {
    background: rgba(255, 255, 255, 0.95);
    border: 2px solid #000;
    border-radius: 10px;
    padding: 30px;
    max-width: 600px;
    margin: 0 auto;
}

/* 排名列表 */
.rank-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 15px;
    margin: 5px 0;
    border-bottom: 1px solid #ddd;
    transition: all 0.3s;
}

/* 排名颜色 */
.rank-1 { color: #FFD700; } /* 金色 */
.rank-2 { color: #C0C0C0; } /* 银色 */
.rank-3 { color: #CD7F32; } /* 铜色 */

/* 当前玩家高亮 */
.rank-item.current {
    background: rgba(0, 204, 255, 0.1);
    border: 2px solid #0CF;
    font-weight: bold;
}

/* 新纪录动画 */
@keyframes newRecord {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

.new-record {
    animation: newRecord 0.5s ease infinite;
    color: #FFD700;
    font-size: 24px;
    font-weight: bold;
}
```

---

### 8. 配置参数

#### config.json 新增
```json
"leaderboard": {
  "enabled": true,
  "maxRecords": 100,
  "defaultPlayerName": "Player",
  "showInGameOver": true,
  "requireName": false,
  "difficulties": {
    "hardcore": {
      "multiplier": 1.5,
      "enabled": true
    },
    "balanced": {
      "multiplier": 1.0,
      "enabled": true
    },
    "casual": {
      "multiplier": 0.7,
      "enabled": true
    }
  },
  "display": {
    "showCombo": true,
    "showPerfectParries": true,
    "showMultiCounters": true,
    "showDifficulty": true,
    "showDate": true,
    "itemsPerPage": 10
  }
}
```

---

### 9. 实现步骤

#### 第一阶段：基础功能
1. [ ] 创建数据结构
2. [ ] 实现 localStorage 存储
3. [ ] 添加记录保存功能
4. [ ] 实现排名计算

#### 第二阶段：UI 实现
1. [ ] 设计排行榜界面
2. [ ] 添加名称输入框
3. [ ] 实现排行榜显示
4. [ ] 添加主菜单入口

#### 第三阶段：交互优化
1. [ ] 新纪录提示动画
2. [ ] 当前玩家高亮
3. [ ] 难度筛选功能
4. [ ] 数据导出/导入

#### 第四阶段：完善
1. [ ] 数据验证
2. [ ] 错误处理
3. [ ] 测试和调试
4. [ ] 文档完善

---

### 10. 扩展功能（可选）

#### 统计信息
```
- 总游戏次数
- 总击杀数
- 总存活时间
- 平均击杀数
- 最高连击
- 完美格挡率
```

#### 成就系统
```
- 首次击杀10个敌人
- 存活超过60秒
- 达到10连击
- 完成5次完美格挡
- 触发多重反击
```

#### 数据导出
```javascript
// 导出为 JSON
function exportLeaderboard() {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    // 下载文件
}

// 导入 JSON
function importLeaderboard(file) {
    // 读取文件
    // 验证数据
    // 合并到现有排行榜
}
```

---

## 云端排行榜方案（可选）

### 技术选型

#### 方案1：Firebase Realtime Database
```javascript
// 优点
- ✅ 免费额度充足
- ✅ 实时同步
- ✅ 简单易用
- ✅ 自动扩展

// 缺点
- ⚠️ 需要 Google 账号
- ⚠️ 国内访问可能受限
```

#### 方案2：Supabase
```javascript
// 优点
- ✅ 开源
- ✅ PostgreSQL 数据库
- ✅ 免费额度充足
- ✅ 功能强大

// 缺点
- ⚠️ 学习曲线稍陡
```

#### 方案3：自建后端
```javascript
// 优点
- ✅ 完全控制
- ✅ 无第三方依赖

// 缺点
- ⚠️ 开发成本高
- ⚠️ 需要服务器
- ⚠️ 需要维护
```

### 推荐：Firebase（如果需要云端）

---

## 测试场景

### 测试1：基本功能
```
步骤：
1. 完成一局游戏
2. 输入玩家名称
3. 提交成绩
4. 查看排行榜

预期结果：
✅ 成绩正确保存
✅ 排名正确显示
✅ 玩家名称正确
```

### 测试2：排名逻辑
```
步骤：
1. 提交多个不同分数
2. 检查排名顺序

预期结果：
✅ 按击杀数排序
✅ 击杀数相同时按时间排序
✅ 最多显示100条
```

### 测试3：数据持久化
```
步骤：
1. 提交成绩
2. 刷新页面
3. 查看排行榜

预期结果：
✅ 数据仍然存在
✅ 排名没有变化
```

### 测试4：边界情况
```
步骤：
1. 提交0击杀的成绩
2. 提交极高的成绩
3. 清除浏览器数据

预期结果：
✅ 正确处理异常数据
✅ 清除数据后排行榜为空
```

---

## 性能影响

### 存储空间
```
单条记录：约 200 字节
100条记录：约 20 KB
影响：可忽略
```

### 性能开销
```
读取：< 1ms
写入：< 5ms
排序：< 10ms（100条）
影响：可忽略
```

---

## 用户体验

### 预期反馈
- "终于可以看到自己的进步了！"
- "想要挑战更高的排名！"
- "看到自己进入前10很有成就感！"
- "希望能和朋友对比成绩"

### 激励效果
- 🎯 增加重玩动力
- 🏆 提供明确目标
- 📈 可视化进步
- 🎮 增强竞技感

---

## 相关文档

- [requirement.md](../requirements/requirement.md) - 游戏需求文档
- [config.json](../../config.json) - 游戏配置
- [game.js](../../game.js) - 游戏代码

---

## 下一步

请确认以下内容：

1. **方案选择**：A（本地）/ B（云端）/ C（混合）？
2. **排名规则**：是否使用难度系数？
3. **UI 设计**：是否满意上述设计？
4. **扩展功能**：是否需要统计信息和成就系统？
5. **实现优先级**：立即实现 / 后续优化？

确认后我将立即实现代码！ 🚀

---

**文档版本**: v3.5  
**最后更新**: 2025-12-18  
**状态**: 待确认 ⏳
