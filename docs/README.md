# 格挡反击游戏 - 文档索引

本目录包含游戏的所有文档，按类型分类整理。

## 📋 需求文档 (`requirements/`)

游戏的核心需求和设计文档。

- **[requirement.md](requirements/requirement.md)** - 完整的游戏需求文档
  - 核心玩法机制
  - 敌人系统设计
  - 视觉效果规划
  - 能量系统设计

## 🚀 战略规划

项目未来发展方向的战略规划文档。

- **[FUTURE_OPTIMIZATION.md](FUTURE_OPTIMIZATION.md)** - 项目优化方向战略规划 🆕
  - 十二大优化方向（核心玩法、游戏模式、敌人系统、进度系统等）
  - 优先级划分（高/中/低）
  - 短中长期实施计划
  - 从游戏设计、用户体验、技术架构等宏观角度思考

## 🎮 游戏玩法文档 (`gameplay/`)

刷怪系统和游戏机制的详细文档。

- **[MULTI_COUNTER_OPTIMIZATION_v3.4.md](gameplay/MULTI_COUNTER_OPTIMIZATION_v3.4.md)** - v3.4 多重反击连击关联系统 ⚡🔥 (最新)
  - 连击数与多重反击次数关联
  - 线性增长方案（2-10次）
  - 正向反馈循环设计
  - 完整的平衡性分析

- **[MULTI_COUNTER_TEST_v3.4.md](gameplay/MULTI_COUNTER_TEST_v3.4.md)** - v3.4 测试指南 🧪
  - 详细测试步骤
  - 平衡性测试方法
  - 调试技巧
  - 问题排查指南

- **[SPAWN_SYSTEM_v2.9.md](gameplay/SPAWN_SYSTEM_v2.9.md)** - v2.9 调试界面与难度预设 ⚙️
  - 实时调试界面
  - 三种难度预设（硬核/平衡/休闲）
  - 可视化数据反馈
  
- **[SPAWN_SYSTEM_v2.8.md](gameplay/SPAWN_SYSTEM_v2.8.md)** - v2.8 动态节奏调整 ⚡
  - 击杀速度追踪系统
  - 连击加速系统
  - 敌人数量控制
  - 自适应难度
  
- **[SPAWN_SYSTEM_v2.7.md](gameplay/SPAWN_SYSTEM_v2.7.md)** - v2.7 场内生成与特效 ✨
  - 场内生成系统
  - 淡入效果和无敌时间
  - 生成特效（粒子、冲击波、音效）
  
- **[SPAWN_SYSTEM_v2.6.md](gameplay/SPAWN_SYSTEM_v2.6.md)** - v2.6 场内生成基础
  - 场内随机位置生成
  - 智能避让系统
  
- **[SPAWN_RHYTHM_OPTIMIZATION.md](gameplay/SPAWN_RHYTHM_OPTIMIZATION.md)** - 刷怪节奏优化方案
  - 动态刷怪设计思路
  - 参数调整建议
  
- **[SPAWN_QUICK_GUIDE.md](gameplay/SPAWN_QUICK_GUIDE.md)** - 刷怪系统快速指南
  - 系统概览
  - 配置说明
  
- **[DEBUG_GUIDE.md](gameplay/DEBUG_GUIDE.md)** - 调试界面使用指南 🔧
  - 调试数据说明
  - 实战案例分析
  - 优化建议
  
- **[QUICK_TEST_v2.9.md](gameplay/QUICK_TEST_v2.9.md)** - v2.9 功能测试清单
  - 完整测试步骤
  - 预期结果验证

## 🎨 视觉更新文档 (`visual-updates/`)

按版本记录的视觉效果优化和新功能实现。

- **[PLAYER_DEATH_v3.3.md](visual-updates/PLAYER_DEATH_v3.3.md)** - v3.3 玩家死亡动画系统 💀✨ (最新)
  - 粒子爆散效果（100个粒子，3种颜色）
  - 延迟结算流程（2.2秒动画）
  - 强烈视觉冲击（震动、慢动作、冲击波）
  - 完整的技术实现方案
  - 配置灵活可调

- **[MENU_REFRESH_v3.1.md](visual-updates/MENU_REFRESH_v3.1.md)** - v3.1 主界面优化设计 🆕
  - 参考 DUST DUEL 简约风格
  - 现代简约高级界面设计
  - 中英双语大标题
  - 描边按钮设计
  - 完整的实现指南

- **[VISUAL_UPDATE_v2.1.md](visual-updates/VISUAL_UPDATE_v2.1.md)** - v2.1 闪光和刀光优化
  - 玩家本体闪光效果
  - 多层刀光瞬移效果
  
- **[VISUAL_UPDATE_v2.3.md](visual-updates/VISUAL_UPDATE_v2.3.md)** - v2.3 高优先级功能
  - 刀光颜色渐变（青→白→金）
  - 刀光残留效果
  - 完美格挡判定系统
  
- **[VISUAL_UPDATE_v2.4.md](visual-updates/VISUAL_UPDATE_v2.4.md)** - v2.4 中优先级功能
  - 连击特效强化系统
  - 完美格挡连击系统
  - 程序化音效系统
  
- **[VISUAL_UPDATE_v2.5.md](visual-updates/VISUAL_UPDATE_v2.5.md)** - v2.5 多重反击系统
  - 极短时间窗口触发多重反击
  - 连续瞬移斩击多个敌人
  - 紫色刀光特效

- **[VISUAL_REFRESH_v3.0.md](visual-updates/VISUAL_REFRESH_v3.0.md)** - v3.0 视觉刷新设计 🎨 (设计中)
  - 从深色赛博风格到清爽灰白风格
  - 三种配色方案（纯灰度/灰度+彩色/黑白对比）
  - 粒子系统扩展（800-1200个灰色粒子）
  - 动态粒子扰动系统
  - 完整的实现计划

- **[BUGFIX_v2.5.1.md](visual-updates/BUGFIX_v2.5.1.md)** - v2.5.1 Bug 修复 ⚠️
  - 修复格挡失效问题
  - 反击期间格挡键状态记录
  - 提升连续格挡可靠性

- **[BUGFIX_v2.5.2.md](visual-updates/BUGFIX_v2.5.2.md)** - v2.5.2 Bug 修复（最新）🔥
  - 修复连续格挡反击失效问题
  - 反击期间能量恢复机制
  - 多重反击期间允许普通反击

- **[QUICK_GUIDE_v2.5.md](visual-updates/QUICK_GUIDE_v2.5.md)** - v2.5 快速上手指南 ⭐
  - 多重反击系统简明教程
  - 新手/进阶/高手技巧
  - 配置调整和常见问题

- **[BLOCKING_SYSTEM_TEST.md](visual-updates/BLOCKING_SYSTEM_TEST.md)** - 格挡系统测试指南
  - 普通格挡/完美格挡/多重反击测试
  - 详细的测试场景和预期效果
  - 常见问题排查

## ⚙️ 优化指南 (`optimization/`)

性能优化和视觉风格配置指南。

- **[CLARITY_OPTIMIZATION.md](optimization/CLARITY_OPTIMIZATION.md)** - 清爽度优化指南
  - 粒子系统优化
  - 背景效果调整
  - 性能优化建议
  
- **[VISUAL_PRESETS.md](optimization/VISUAL_PRESETS.md)** - 视觉风格预设
  - 6种预设配置
  - 快速切换指南
  - 自定义参数说明

## 🎮 游戏机制 (`gameplay/`)

游戏玩法和系统机制的优化文档。

- **[SPAWN_SYSTEM_v2.6.md](gameplay/SPAWN_SYSTEM_v2.6.md)** - 刷怪系统优化 v2.6
  - 场内随机生成
  - 淡入动画效果
  - 无敌时间机制

- **[SPAWN_SYSTEM_v2.7.md](gameplay/SPAWN_SYSTEM_v2.7.md)** - 刷怪系统优化 v2.7
  - 生成位置避开玩家
  - 生成粒子特效
  - 生成音效

- **[SPAWN_SYSTEM_v2.8.md](gameplay/SPAWN_SYSTEM_v2.8.md)** - 刷怪系统优化 v2.8
  - 动态节奏调整（混合方案）
  - 击杀速度追踪系统
  - 连击加速系统
  - 敌人数量控制系统

- **[SPAWN_SYSTEM_v2.9.md](gameplay/SPAWN_SYSTEM_v2.9.md)** - 刷怪系统优化 v2.9 🆕
  - 实时调试界面
  - 难度选择系统
  - 配置预设管理

## 📚 参考文档 (`reference/`)

系统说明和开发日志。

- **[VISUAL_EFFECTS.md](reference/VISUAL_EFFECTS.md)** - 视觉效果系统完整说明
  - 所有视觉效果的技术实现
  - 配置参数详解
  - 效果触发条件
  
- **[CHANGELOG.md](reference/CHANGELOG.md)** - 完整的开发日志
  - 所有版本的修改记录
  - 技术细节和决策说明

## 🗂️ 文档结构

```
docs/
├── README.md                          # 本文件（文档索引）
├── requirements/                      # 需求文档
│   └── requirement.md
├── visual-updates/                    # 视觉更新文档
│   ├── VISUAL_UPDATE_v2.1.md
│   ├── VISUAL_UPDATE_v2.3.md
│   ├── VISUAL_UPDATE_v2.4.md
│   ├── VISUAL_UPDATE_v2.5.md
│   ├── BUGFIX_v2.5.1.md              # Bug 修复文档 ⚠️
│   ├── BUGFIX_v2.5.2.md              # Bug 修复文档（最新）🔥
│   ├── QUICK_GUIDE_v2.5.md           # 快速上手指南 ⭐
│   └── BLOCKING_SYSTEM_TEST.md       # 格挡系统测试指南
├── optimization/                      # 优化指南
│   ├── CLARITY_OPTIMIZATION.md
│   └── VISUAL_PRESETS.md
└── reference/                         # 参考文档
    ├── VISUAL_EFFECTS.md
    └── CHANGELOG.md
```

## 📖 阅读建议

### 新手入门
1. 先阅读 [requirement.md](requirements/requirement.md) 了解游戏设计
2. 查看 [QUICK_GUIDE_v2.5.md](visual-updates/QUICK_GUIDE_v2.5.md) 快速上手多重反击 ⭐
3. 查看 [VISUAL_EFFECTS.md](reference/VISUAL_EFFECTS.md) 了解视觉系统
4. 参考 [VISUAL_PRESETS.md](optimization/VISUAL_PRESETS.md) 快速配置

### 开发者
1. 查看 [CHANGELOG.md](reference/CHANGELOG.md) 了解开发历史
2. 阅读各版本的 VISUAL_UPDATE 文档了解功能演进
3. 参考 [CLARITY_OPTIMIZATION.md](optimization/CLARITY_OPTIMIZATION.md) 进行性能优化

### 配置调整
1. 先看 [VISUAL_PRESETS.md](optimization/VISUAL_PRESETS.md) 选择预设
2. 参考 [VISUAL_EFFECTS.md](reference/VISUAL_EFFECTS.md) 了解参数含义
3. 查看最新的 VISUAL_UPDATE 文档了解新功能配置

## 🔄 文档更新

文档会随着游戏版本更新而持续更新。最新的功能说明请查看 `visual-updates/` 目录下的最新版本文档。

---

## 📝 文档更新记录

### 最新更新
- **2025-12-18**: 新增 [MULTI_COUNTER_OPTIMIZATION_v3.4.md](gameplay/MULTI_COUNTER_OPTIMIZATION_v3.4.md) - 多重反击连击关联系统 ⚡🔥
- **2025-12-18**: 新增 [MULTI_COUNTER_TEST_v3.4.md](gameplay/MULTI_COUNTER_TEST_v3.4.md) - v3.4 测试指南
- **2025-12-18**: 新增 [FUTURE_OPTIMIZATION.md](FUTURE_OPTIMIZATION.md) - 项目优化方向战略规划
- **2025-12-18**: 新增 [PLAYER_DEATH_v3.3.md](visual-updates/PLAYER_DEATH_v3.3.md) - 玩家死亡动画系统
- **2025-12-17**: 新增 [EDGE_GLOW_v3.2.md](visual-updates/EDGE_GLOW_v3.2.md) - Canvas边缘发光效果
- **2025-12-17**: 新增 [MENU_REFRESH_v3.1.md](visual-updates/MENU_REFRESH_v3.1.md) - 主界面优化设计

---

**最后更新**: 2025-12-18  
**当前版本**: v3.4 (多重反击连击关联系统)
