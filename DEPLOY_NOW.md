# 🚀 立即部署到 Netlify

## ✅ 准备工作已完成

- ✅ Git 仓库已初始化
- ✅ 远程仓库已配置：https://github.com/Jason1Jiang/ParryGame.git
- ✅ 音乐文件已准备：`bgm_battle.mp3` (3.3 MB)
- ✅ Netlify 配置文件已创建：`netlify.toml`
- ✅ `.gitignore` 已配置
- ✅ 所有文件已提交（11个提交待推送）

---

## 🎯 下一步：选择部署方式

### 方式 1：Git 自动部署（推荐）⭐

**优点**：每次推送代码自动部署，最方便

#### 步骤：

1. **推送代码到 GitHub**
```bash
git push ParryGame master
```

2. **连接 Netlify**
   - 访问：https://app.netlify.com
   - 点击 "Add new site" → "Import an existing project"
   - 选择 "GitHub"
   - 授权并选择仓库：`Jason1Jiang/ParryGame`
   - 构建设置：
     - Build command: 留空
     - Publish directory: `.`
   - 点击 "Deploy site"

3. **完成！**
   - 获得一个 `xxx.netlify.app` 域名
   - 以后每次 `git push` 都会自动部署

---

### 方式 2：拖拽部署（最简单）🚀

**优点**：无需 Git 操作，立即部署

#### 步骤：

1. **访问 Netlify Drop**
   - https://app.netlify.com/drop

2. **拖拽文件夹**
   - 直接拖拽整个 `ParryGame` 文件夹到页面
   - 等待上传完成

3. **完成！**
   - 立即获得一个 `xxx.netlify.app` 域名

**注意**：每次更新需要重新拖拽

---

## 📋 部署后检查清单

访问你的 Netlify 网站后，检查：

- [ ] 页面正常加载
- [ ] 点击"开始游戏"可以进入游戏
- [ ] 战斗音乐正常播放
- [ ] 游戏功能正常（移动、格挡、反击）
- [ ] 敌人正常生成
- [ ] 边缘发光效果正常

---

## 🎵 音乐文件说明

当前音乐文件：
- `bgm_battle.mp3` - 3.3 MB（战斗音乐）
- `bgm_menu.mp3` - 4.0 MB（未使用，可删除）

**建议**：如果想减小部署大小，可以删除 `bgm_menu.mp3`

---

## 🔧 常见问题

### Q: 音乐不播放？

**原因**：浏览器自动播放策略

**解决**：
- 音乐会在点击"开始游戏"后播放
- 这是正常的浏览器行为

### Q: 推送失败？

```bash
# 如果推送失败，可能需要先拉取
git pull ParryGame master --rebase
git push ParryGame master
```

### Q: 想要自定义域名？

在 Netlify 控制台：
1. 进入 "Domain settings"
2. 点击 "Add custom domain"
3. 按照提示配置

---

## 📚 详细文档

查看 `DEPLOYMENT_GUIDE.md` 获取：
- 完整部署流程
- 音乐文件优化建议
- Netlify CLI 使用方法
- 更多配置选项

---

## 🎉 推荐流程

**最快部署**（5分钟）：
1. 使用方式2（拖拽部署）
2. 立即测试

**长期使用**（10分钟）：
1. 先推送到 GitHub：`git push ParryGame master`
2. 使用方式1（Git自动部署）
3. 以后每次更新只需 `git push`

---

**准备好了吗？选择一个方式开始部署吧！** 🚀
