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

### 核心文件
- `index.html` - 游戏主页面
- `game.js` - 游戏逻辑代码
- `config.json` - 游戏配置参数
- `start.bat` - Windows 启动脚本

### 文档目录
所有文档已整理到 `docs/` 文件夹：

#### 需求文档 (`docs/requirements/`)
- `requirement.md` - 详细的游戏需求文档

#### 视觉更新文档 (`docs/visual-updates/`)
- `VISUAL_UPDATE_v2.1.md` - v2.1 闪光和刀光优化
- `VISUAL_UPDATE_v2.3.md` - v2.3 高优先级功能实现
- `VISUAL_UPDATE_v2.4.md` - v2.4 中优先级功能实现（最新）

#### 优化指南 (`docs/optimization/`)
- `CLARITY_OPTIMIZATION.md` - 清爽度优化指南
- `VISUAL_PRESETS.md` - 视觉风格预设配置

#### 参考文档 (`docs/reference/`)
- `VISUAL_EFFECTS.md` - 视觉效果系统说明
- `CHANGELOG.md` - 完整的修改日志

## 版本历史

### v2.5 - 多重反击系统（2025-12-15）⚡
**新增功能**:
- ✅ **多重反击**: 在按下格挡键的极短时间内（150ms）成功格挡，触发连续瞬移斩击多个敌人
- ✅ **紫色刀光**: 多重反击使用独特的紫色刀光特效
- ✅ **超强视觉**: 紫色闪光、超强震动、极慢时间（0.05倍速）

**详细说明**: 查看 [VISUAL_UPDATE_v2.5.md](docs/visual-updates/VISUAL_UPDATE_v2.5.md)

### v2.4 - 中优先级功能实现（2025-12-15）
**新增功能**:
- ✅ **连击特效强化**: 3连击时刀光宽度、粒子数量、发光强度全面增强，5连击触发彩虹刀光
- ✅ **完美格挡连击**: 连续完美格挡累积连击数，提供递增的能量奖励和时间减速效果
- ✅ **刀光音效同步**: 使用 Web Audio API 实现程序化音效系统

**详细说明**: 查看 [VISUAL_UPDATE_v2.4.md](docs/visual-updates/VISUAL_UPDATE_v2.4.md)

### v2.3 - 高优先级功能实现（2025-12-15）
**新增功能**:
- ✅ **刀光颜色渐变**: 青色 → 白色 → 金色的动态渐变效果
- ✅ **刀光残留效果**: 瞬移后刀光短暂停留并逐渐淡出
- ✅ **完美格挡判定**: 连续格挡触发完美格挡，获得金色特效和额外能量

**详细说明**: 查看 [VISUAL_UPDATE_v2.3.md](docs/visual-updates/VISUAL_UPDATE_v2.3.md)

### v2.2 - 清爽度优化（2025-12-15）
**优化内容**:
- ✅ 粒子数量减少 62.5%（800 → 300）
- ✅ 粒子透明度降低 50%
- ✅ 背景改为纯黑色
- ✅ 发光效果增强 50%

**详细说明**: 查看 [CLARITY_OPTIMIZATION.md](docs/optimization/CLARITY_OPTIMIZATION.md)

### v2.1 - 闪光和刀光优化（2025-12-15）
**优化内容**:
- ✅ 玩家本体闪光（替代全屏闪光）
- ✅ 多层刀光瞬移效果

**详细说明**: 查看 [VISUAL_UPDATE_v2.1.md](docs/visual-updates/VISUAL_UPDATE_v2.1.md)

## 配置指南

### 快速切换视觉风格
查看 [VISUAL_PRESETS.md](docs/optimization/VISUAL_PRESETS.md) 获取多种预设配置：
- 清爽简约（推荐）
- 深空氛围
- 极简竞技
- 华丽特效
- 暗夜模式
- 赛博朋克

### 自定义参数
所有视觉效果都可以在 `config.json` 中调整：
- 连击强化阈值和倍率
- 完美格挡时间窗口和奖励
- 音效频率和音量
- 粒子数量和透明度
- 刀光颜色和宽度

## 注意事项

⚠️ **不能直接双击打开 index.html**，必须通过 Web 服务器运行，否则配置文件无法加载。

## 开发日志

完整的开发历史和技术细节请查看 [CHANGELOG.md](docs/reference/CHANGELOG.md)。
