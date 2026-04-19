<div align="center">

# Flow SOP

**别让你的 SOP 停留在纸面。画出逻辑，即刻执行。**
*(Don't just document it. Draw it, track it, execute it.)*

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Vue 3](https://img.shields.io/badge/Vue-3.4-4FC08D.svg?logo=vue.js)](https://vuejs.org/)
[![Electron](https://img.shields.io/badge/Electron-29.0-47848F.svg?logo=electron)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Win%20%7C%20Mac%20%7C%20Linux-lightgrey.svg)]()

</div>

---

## 💡 创作背景

传统笔记软件（Notion、Obsidian 等）偏重静态“记录”。在进行系统重构或运维排障时，工程师不仅需要查阅逻辑，更需要一步步执行代码。查阅与执行的割裂，会导致标准操作流程（SOP）难以严格落地。

**Flow SOP** 是一个面向工程师的行动导向型本地知识库。它将工作台逻辑化：通过编写 Mermaid 流程图，自动驱动底层对应的动作卡片。执行完毕一步，确认一步，实现复杂操作的闭环追踪。

## ✨ 核心特性

* **图表驱动执行**：实时渲染 Mermaid（Flowchart/Sequence 等），流程节点与具体执行代码解耦又统一。
* **动作卡片体系**：集成 Highlight.js 支持 70+ 语言高亮。提供代码一键复制、避坑备注、进度勾选与常用步骤置顶（Pin）功能。
* **全局变量替换**：支持在 SOP 顶部定义 `{{VAR_NAME}}`（如 DB 凭证、项目名称），所有动作卡片自动映射替换，降低跨环境执行的容错成本。
* **数据完全本地化**：无任何外部网络请求（除首次拉取 Mermaid CDN）。数据持久化为本地 JSON 文件，支持修改数据目录（配合 OneDrive/iCloud 可实现端到端同步）。
* **Markdown 无损导出**：支持将整套 SOP 导出为标准 Markdown 目录树，便于归档与 Git 沉淀。

## 🚀 快速开始

### 方式一：下载预编译版本（推荐）

访问 [Releases](../../releases) 页面获取最新版本。

| 平台 | 文件 | 说明 |
| :--- | :--- | :--- |
| **Windows x64** | `Flow.SOP.Setup.1.x.x.exe` | 图形化安装向导，自动配置快捷方式 |
| **macOS** | `Flow.SOP-1.x.x.dmg` | 拖拽至 Applications 即可 |
| **Linux** | `Flow.SOP-1.x.x.AppImage` | 赋权 `chmod +x` 后直接运行 |

*注：Windows 环境下若触发 SmartScreen 拦截，点击「更多信息」→「仍要运行」即可（因未购买数字签名）。*

### 方式二：本地源码构建

Node.js 推荐版本：18+。

```bash
git clone [https://github.com/realYurk/Flow-SOP.git](https://github.com/realYurk/Flow-SOP.git)
cd Flow-SOP
npm install

# 启动 Electron 本地开发模式
npm run electron:dev

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

| 工具     | 版本 | 说明                                 |
| -------- | ---- | ------------------------------------ |
| Node.js  | 18+  | https://nodejs.org                   |
| npm      | 9+   | 随 Node.js 安装                      |
| Python   | 3.x  | 部分 native 模块编译需要（通常已有） |
| 磁盘空间 | 3GB+ | node_modules + Electron 下载缓存     |

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

## 📄 License
[Apache License 2.0](./LICENSE) © 2026 realYurk.
