# Firebase 数据库配置指南

## 🔧 问题修复

### 问题1: 参数顺序错误 ✅ 已修复
**症状**: 提交分数后排行榜显示 0 条记录

**原因**: `game.js` 中调用 `submitScore` 的参数顺序错误

**修复**: 已更正参数顺序为 `submitScore(playerName, kills, gameTime, selectedDifficulty)`

### 问题2: Firebase 索引警告
**症状**: 控制台显示 "Using an unspecified index" 警告

**原因**: Firebase 数据库规则中缺少索引配置

**解决方案**: 需要在 Firebase 控制台配置数据库规则

## 📋 Firebase 控制台配置步骤

### 1. 访问 Firebase 控制台
```
https://console.firebase.google.com/
```

### 2. 选择项目
- 项目名称: `bladeecho-d4cd3`
- 项目ID: `bladeecho-d4cd3`

### 3. 配置 Realtime Database 规则

#### 步骤：
1. 在左侧菜单选择 **Realtime Database**
2. 点击 **规则 (Rules)** 标签
3. 将以下规则复制粘贴到编辑器中：

```json
{
  "rules": {
    "leaderboard": {
      "$difficulty": {
        ".read": true,
        ".write": true,
        ".indexOn": ["score", "kills", "survivalTime"],
        "$recordId": {
          ".validate": "newData.hasChildren(['playerName', 'kills', 'survivalTime', 'score', 'difficulty', 'timestamp'])"
        }
      }
    }
  }
}
```

4. 点击 **发布 (Publish)** 按钮

### 4. 验证配置

#### 检查数据库结构：
1. 点击 **数据 (Data)** 标签
2. 应该看到以下结构：
```
leaderboard/
  ├── hardcore/
  ├── balanced/
  └── casual/
```

#### 测试写入：
1. 玩一局游戏
2. 提交分数
3. 在 Firebase 控制台查看数据是否写入成功

## 🔍 规则说明

### 读写权限
```json
".read": true,
".write": true
```
- 允许所有人读取和写入排行榜
- **注意**: 这是简化配置，生产环境建议添加更严格的验证

### 索引配置
```json
".indexOn": ["score", "kills", "survivalTime"]
```
- 为 `score` 字段添加索引（主要排序字段）
- 为 `kills` 和 `survivalTime` 添加索引（备用排序）
- 提升查询性能，消除警告

### 数据验证
```json
".validate": "newData.hasChildren(['playerName', 'kills', 'survivalTime', 'score', 'difficulty', 'timestamp'])"
```
- 确保每条记录包含所有必需字段
- 防止写入不完整的数据

## 🧪 测试步骤

### 1. 清除浏览器缓存
```
1. 按 F12 打开开发者工具
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"
```

### 2. 测试提交分数
```
1. 开始游戏
2. 游戏结束后输入名字
3. 点击"提交"
4. 检查控制台是否有错误
```

### 3. 验证数据写入
```
1. 打开 Firebase 控制台
2. 进入 Realtime Database > 数据
3. 查看 leaderboard/{difficulty} 下是否有新记录
```

### 4. 测试排行榜显示
```
1. 主菜单点击 "RANKS"
2. 应该能看到刚才提交的分数
3. 切换不同难度标签测试
```

## 🐛 常见问题排查

### 问题: 控制台显示 "Permission denied"
**原因**: 数据库规则未正确配置

**解决**:
1. 检查 Firebase 控制台的规则配置
2. 确保 `.read` 和 `.write` 都设置为 `true`
3. 点击"发布"保存规则

### 问题: 仍然显示索引警告
**原因**: 规则未生效或浏览器缓存

**解决**:
1. 等待几分钟让规则生效
2. 清除浏览器缓存
3. 刷新页面重试

### 问题: 提交成功但排行榜不显示
**原因**: 参数顺序错误（已修复）

**解决**:
1. 确保使用最新的 game.js
2. 清除浏览器缓存
3. 重新测试

### 问题: 数据库中有数据但排行榜显示 0 条
**原因**: 查询路径或排序字段错误

**解决**:
1. 检查 Firebase 控制台中的数据结构
2. 确认路径是 `leaderboard/{difficulty}`
3. 确认每条记录都有 `score` 字段

## 📊 数据结构示例

### 正确的数据结构
```json
{
  "leaderboard": {
    "hardcore": {
      "abc123xyz": {
        "playerName": "玩家1",
        "kills": 50,
        "survivalTime": 120,
        "score": 5120,
        "difficulty": "hardcore",
        "timestamp": 1702999999999
      }
    },
    "balanced": {
      "def456uvw": {
        "playerName": "玩家2",
        "kills": 30,
        "survivalTime": 90,
        "score": 3090,
        "difficulty": "balanced",
        "timestamp": 1702999999999
      }
    }
  }
}
```

### 分数计算公式
```javascript
score = kills * 100 + survivalTime
```

例如：
- 50 击杀 + 120 秒 = 5120 分
- 30 击杀 + 90 秒 = 3090 分

## 🔒 安全建议（可选）

### 生产环境规则（更严格）
```json
{
  "rules": {
    "leaderboard": {
      "$difficulty": {
        ".read": true,
        ".write": "newData.child('timestamp').val() <= now + 60000",
        ".indexOn": ["score", "kills", "survivalTime"],
        "$recordId": {
          ".validate": "newData.hasChildren(['playerName', 'kills', 'survivalTime', 'score', 'difficulty', 'timestamp']) && newData.child('playerName').isString() && newData.child('playerName').val().length <= 20 && newData.child('kills').isNumber() && newData.child('kills').val() >= 0 && newData.child('survivalTime').isNumber() && newData.child('survivalTime').val() >= 0"
        }
      }
    }
  }
}
```

这个规则添加了：
- 时间戳验证（防止伪造旧记录）
- 名字长度限制（最多20字符）
- 数值类型验证
- 非负数验证

## 📝 配置文件

项目中已包含 `firebase-database-rules.json` 文件，可以直接复制到 Firebase 控制台使用。

## ✅ 配置完成检查清单

- [ ] Firebase 控制台规则已配置
- [ ] 规则已发布生效
- [ ] 索引已添加（score, kills, survivalTime）
- [ ] 浏览器缓存已清除
- [ ] 测试提交分数成功
- [ ] Firebase 控制台能看到数据
- [ ] 排行榜能正常显示
- [ ] 控制台无错误和警告

## 🎉 完成

配置完成后，排行榜系统应该能正常工作了！

如有问题，请检查：
1. Firebase 控制台的规则配置
2. 浏览器控制台的错误信息
3. 网络连接状态
