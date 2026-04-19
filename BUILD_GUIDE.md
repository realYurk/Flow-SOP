# Flow SOP — 打包为 Windows 安装程序 (.exe) 指南

## 打包原理

Flow SOP 使用 **electron-builder** 将 Electron 应用打包为可安装的 Windows 程序。
打包后生成的安装包：

- 包含所有运行时依赖（Node.js、Electron、Chromium）
- 用户只需双击 `.exe` 即可安装，无需安装任何环境
- 安装后在开始菜单和桌面创建快捷方式
- 支持卸载（通过控制面板）
- 安装目录可由用户自定义

---

## 环境要求

| 工具 | 版本 | 说明 |
|------|------|------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | 随 Node.js 安装 |
| Python | 3.x | 部分 native 模块编译需要（通常已有） |
| 磁盘空间 | 3GB+ | node_modules + Electron 下载缓存 |

---

## 快速打包步骤（Windows x64 安装包）

```bash
# 1. 安装依赖（首次，约 5-10 分钟，会自动下载 Electron 二进制）
npm install

# 2. 打包 Windows 安装包
npm run build:win
```

打包完成后，在 `dist-electron/` 目录生成：
```
dist-electron/
├── Flow SOP Setup 1.0.0.exe    ← 安装程序（分发给用户）
├── Flow SOP Setup 1.0.0.exe.blockmap
└── builder-debug.yml
```

---

## 完整打包命令

```bash
# 仅 Windows x64 安装包（.exe）
npm run build:win

# 仅 macOS 磁盘映像（.dmg）
npm run build:mac

# 仅 Linux AppImage
npm run build:linux

# 所有平台（需要在对应平台上运行，或使用 CI）
npm run build:all
```

---

## 安装包特性（NSIS 配置）

已配置的安装程序行为：
- ✅ **非一键安装**：显示安装向导，用户可看到每一步
- ✅ **可自选安装目录**：默认 `C:\Program Files\Flow SOP`，用户可修改
- ✅ **创建桌面快捷方式**
- ✅ **创建开始菜单快捷方式**（`Flow SOP` 文件夹）
- ✅ **支持卸载**：通过控制面板 → 程序和功能
- ✅ **中文界面**：安装向导显示中文

---

## 添加应用图标

打包时需要 `.ico` 格式图标（Windows）：

1. 准备一张 256×256 或更大的 PNG 图片
2. 转换为 `.ico`（推荐工具：https://convertio.co/png-ico/）
3. 将 `icon.ico` 放入 `public/` 目录
4. `package.json` 中已配置 `"icon": "public/icon.ico"`

如果没有 `.ico` 文件，electron-builder 会使用默认图标，打包不会失败。

---

## 首次下载 Electron 慢怎么办

electron-builder 需要下载 Electron 二进制（约 100MB）。
国内网络可设置镜像：

**方法一：设置环境变量（推荐）**
```bash
# Windows CMD
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
npm install

# Windows PowerShell
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
npm install
```

**方法二：`.npmrc` 文件**（在项目根目录创建）
```
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
registry=https://registry.npmmirror.com
```

---

## 常见问题

### Q: 打包时报 `error: spawn ENOENT`
A: 通常是缺少 Python 或 Visual Studio Build Tools。
在 Windows 上安装：
```bash
npm install --global windows-build-tools
```

### Q: 安装包太大（>150MB）
A: 这是正常的，因为包含了完整的 Chromium 引擎。
可通过 `asar: true`（已开启）压缩代码资源。

### Q: 打包后应用启动闪白屏
A: `package.json` 中 `backgroundColor: '#0f0f17'` 已设置，可消除白屏。

### Q: 用户安装后数据存在哪里？
A: 用户数据存储在 `%USERPROFILE%\.Flowsop\data.json`（即 `C:\Users\用户名\.Flowsop\`）
卸载应用**不会**删除用户数据，需要用户手动删除此目录。

---

## 自动化发布（GitHub Actions 示例）

如果代码托管在 GitHub，可用以下 workflow 自动构建：

```yaml
# .github/workflows/build.yml
name: Build
on:
  push:
    tags: ['v*']
jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 18 }
      - run: npm ci
      - run: npm run build:win
        env:
          ELECTRON_MIRROR: https://npmmirror.com/mirrors/electron/
      - uses: actions/upload-artifact@v4
        with:
          name: windows-installer
          path: dist-electron/*.exe
```
