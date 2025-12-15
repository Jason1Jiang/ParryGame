# 格挡反击游戏 - 文档索引

本目录包含游戏的所有文档，按类型分类整理。

## 📋 需求文档 (`requirements/`)

游戏的核心需求和设计文档。

- **[requirement.md](requirements/requirement.md)** - 完整的游戏需求文档
  - 核心玩法机制
  - 敌人系统设计
  - 视觉效果规划
  - 能量系统设计

## 🎨 视觉更新文档 (`visual-updates/`)

按版本记录的视觉效果优化和新功能实现。

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
  
- **[VISUAL_UPDATE_v2.5.md](visual-updates/VISUAL_UPDATE_v2.5.md)** - v2.5 多重反击系统（最新）
  - 极短时间窗口触发多重反击
  - 连续瞬移斩击多个敌人
  - 紫色刀光特效

- **[QUICK_GUIDE_v2.5.md](visual-updates/QUICK_GUIDE_v2.5.md)** - v2.5 快速上手指南 ⭐
  - 多重反击系统简明教程
  - 新手/进阶/高手技巧
  - 配置调整和常见问题

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
│   └── QUICK_GUIDE_v2.5.md           # 快速上手指南 ⭐
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

**最后更新**: 2025-12-15  
**当前版本**: v2.5
