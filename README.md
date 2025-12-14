# 格挡反击游戏

一款以格挡反击为核心玩法的动作游戏。

## 如何运行

### 方法 1: 使用 Python（推荐）

1. 确保已安装 Python 3
2. 双击运行 `start.bat`
3. 在浏览器中访问 `http://localhost:8000`

### 方法 2: 使用 Node.js

如果你安装了 Node.js，可以使用 npx：

```bash
npx http-server -p 8000
```

然后在浏览器中访问 `http://localhost:8000`

### 方法 3: 使用其他 Web 服务器

使用任何本地 Web 服务器都可以，例如：
- VS Code 的 Live Server 扩展
- XAMPP
- WAMP
- 等等

## 游戏操作

- **WASD** - 移动
- **空格** - 格挡（消耗能量）
- **格挡成功** - 自动瞬移反击最近的敌人

## 配置文件

游戏的所有参数都在 `config.json` 中，你可以修改这个文件来调整：

- 玩家速度、大小
- 能量消耗和恢复速度
- 敌人的各项属性
- 粒子效果
- 生成规则
- 等等

修改后刷新浏览器即可看到效果。

## 文件说明

- `index.html` - 游戏主页面
- `game.js` - 游戏逻辑代码
- `config.json` - 游戏配置参数
- `requirement.md` - 详细的游戏需求文档
- `start.bat` - Windows 启动脚本

## 注意事项

⚠️ **不能直接双击打开 index.html**，必须通过 Web 服务器运行，否则配置文件无法加载。
