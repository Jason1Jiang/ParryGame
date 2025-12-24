# Bug 修复：JSON 注释问题

## 问题描述
```
game.js:121 配置加载失败: SyntaxError: 
Expected double-quoted property name in JSON at position 1795 (line 74 column 37)
```

## 原因分析
config.json 中包含 `//` 注释，但标准 JSON 格式不支持注释。

虽然编辑器（VS Code）支持 JSONC（JSON with Comments），但浏览器的 `JSON.parse()` 只支持标准 JSON。

## 修复内容

### 移除的注释
```json
// 修复前（有注释，会报错）
{
  "initialInterval": 1500,  // 【基础刷怪速度】初始刷怪间隔(毫秒)
  "minInterval": 400,       // 【最快速度】最小刷怪间隔(毫秒)
  "enabled": true,          // 【动态刷怪总开关】true=启用动态
  "trackCount": 5,          // 追踪最近几次击杀 (推荐: 3-7)
}

// 修复后（无注释，正常工作）
{
  "initialInterval": 1500,
  "minInterval": 400,
  "enabled": true,
  "trackCount": 5
}
```

### 修改的行数
- 移除约 15 行注释
- 保持所有配置值不变

## 验证结果
```bash
$ node -e "JSON.parse(require('fs').readFileSync('config.json', 'utf8')); console.log('JSON is valid!')"
JSON is valid!
```

✅ JSON 格式验证通过

## 配置说明文档

所有配置参数的说明已移至：
- `docs/reference/CONFIG_NOTES.md` - 配置参数详细说明

## 注意事项

### ❌ 不要这样做
```json
{
  "value": 123  // 添加注释
}
```

### ✅ 应该这样做
1. 在 config.json 中只写纯 JSON
2. 在 CONFIG_NOTES.md 中写说明文档
3. 使用调试界面查看实时数据

## 相关文档
- [CONFIG_NOTES.md](docs/reference/CONFIG_NOTES.md) - 配置说明
- [DEBUG_GUIDE.md](docs/gameplay/DEBUG_GUIDE.md) - 调试指南

---

**修复完成！现在游戏可以正常加载配置了。** ✅
