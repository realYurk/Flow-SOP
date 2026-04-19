<div align="center">

# ⚡ Flow SOP

**面向工程师的行动导向型本地知识库**

把脑子里的复杂流程，变成打开即能执行的 SOP 卡片。

[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-29-47848F?logo=electron&logoColor=white)](https://electronjs.org)
[![Vue 3](https://img.shields.io/badge/Vue-3.4-42b883?logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-555)](../../releases)

[功能特性](#-功能特性) · [快速开始](#-快速开始) · [使用指南](#-使用指南) · [开发](#-开发) · [打包](#-构建打包) · [FAQ](#-常见问题)

</div>

---

## 这是什么？

Flow SOP 是一个**完全本地运行**的桌面知识库工具，专为需要反复执行标准化流程的工程师设计。

**传统笔记软件的问题：** Notion、Obsidian 偏重"记录"，执行时还要翻页找步骤，太慢。

**Flow SOP 的思路：** 像 Postman 一样，打开即是可执行的工作界面。每个 SOP 是一套有序的"动作卡片"，卡片里有代码、能一键复制、能逐步勾选——执行完一步打一个勾，流程进度一目了然。

---

## ✨ 功能特性

### 🗂 三层知识库结构

```
Collection（项目 / 领域）
  └── Folder（模块 / 场景）
        └── SOP（标准操作流程）
              └── 动作卡片（具体执行步骤）
```

- 右键菜单管理所有层级：新建、重命名、删除
- 150+ Emoji 图标 + 14 种颜色标记 Collection，按 10 个生活领域分组
- 搜索框快速定位 SOP

### 🔀 Mermaid 流程图

- 写文本代码，实时渲染流程图（支持 flowchart、sequenceDiagram、gitGraph 等）
- LR / TD 方向一键切换
- 鼠标滚轮缩放（Ctrl + 滚轮）、拖拽平移
- 拖拽底边自由调整面板高度

### 📋 动作卡片

- **代码高亮**：集成 highlight.js，支持 70+ 编程语言，深色/浅色主题自动适配
- **一键复制**：点击复制按钮，1.8 秒后自动恢复状态
- **变量替换**：代码中写 `{{VAR_NAME}}`，顶部设置一次，所有卡片自动替换
- **完成追踪**：勾选卡片，顶部进度条实时更新
- **固定卡片**：点击 📌 将常用步骤固定到右侧快速参考面板
- **避坑备注**：每张卡片附带黄色提示区，记录关键注意事项

### 🏷️ 变量系统

```yaml
# 在 SOP 顶部定义
JWT_SECRET:    your-256-bit-secret
PROJECT_NAME:  my-app
DB_URL:        postgresql://user:pass@localhost:5432/db
```

```bash
# 卡片代码中使用
docker run -e DB_URL={{DB_URL}} registry/{{PROJECT_NAME}}:latest
```

复制时自动得到替换后的完整命令，换项目只需改一次变量。

### 💾 数据完全本地

- 数据保存为 JSON 文件，默认 `~/.flowsop/data.json`
- 支持在应用内浏览文件系统更改数据目录（可设为云盘路径实现多端同步）
- File Watcher：直接用文本编辑器改 JSON，应用实时刷新
- 导出为 Markdown 文件夹结构，每个 SOP 一个 `.md` 文件

### 🎨 深色 / 浅色双主题

标题栏一键切换，偏好自动持久化。

---

## 🚀 快速开始

### 方式一：下载安装包（推荐）

前往 **[Releases](../../releases/latest)** 页面下载：

| 平台 | 文件 | 说明 |
|------|------|------|
| Windows x64 | `Flow.SOP.Setup.1.0.0.exe` | 安装向导，可选安装目录 |
| macOS | `Flow.SOP-1.0.0.dmg` | 拖入 Applications 即可 |
| Linux | `Flow.SOP-1.0.0.AppImage` | 赋权后直接运行 |

**Windows 安装：**
1. 双击 `Flow.SOP.Setup.1.0.0.exe`
2. 向导中可自定义安装目录（默认 `C:\Program Files\Flow SOP`）
3. 安装完成后自动创建桌面和开始菜单快捷方式
4. 首次启动自动加载演示数据，直接上手体验

> ⚠️ **SmartScreen 提示**：Windows 会对未签名的程序弹出警告，点击「更多信息」→「仍要运行」即可。这是 Windows 的默认安全机制，不影响使用安全性。

**Linux：**
```bash
chmod +x Flow.SOP-1.0.0.AppImage
./Flow.SOP-1.0.0.AppImage
```

### 方式二：源码运行

```bash
# 克隆仓库
git clone https://github.com/your-username/flow-sop.git
cd flow-sop

# 安装依赖（首次约 3-5 分钟，会下载 Electron 二进制）
npm install

# 启动 Electron 桌面模式（推荐）
npm run electron:dev

# 或仅浏览器预览（数据存 localStorage）
npm run dev
# → http://localhost:5173
```

**国内网络加速（可选）：**
```bash
# 设置 Electron 下载镜像
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/   # Windows CMD
export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ # macOS/Linux
npm install
```

---

## 📖 使用指南

### 创建第一个 SOP

```
1. 左侧底部点击「+ 新建 Collection」→ 选择图标和颜色
2. 右键 Collection → 「新建 Folder」
3. 右键 Folder → 「新建 SOP」
4. 选中 SOP → 点击右上角「编辑 SOP」→ 编写 Mermaid 流程图
5. 点击「+ 新增卡片」→ 填写标题、选择语言、粘贴代码
```

### 操作速查

| 操作 | 方式 |
|------|------|
| 新建 / 重命名 / 删除 | 右键导航树对应条目 |
| 修改 Collection 图标颜色 | 右键 → 编辑（名称/图标） |
| 复制代码 | 卡片代码区右侧「复制」按钮 |
| 勾选完成步骤 | 卡片左侧 Checkbox |
| 固定卡片到右侧 | 卡片右上角 📌 按钮 |
| 重置所有进度 | 顶部标题旁 ↺ 按钮 |
| 切换主题 | 标题栏右侧 ☀️/🌙 |
| 导出全部数据 | 右下角浮动工具栏 ⬇ |
| 导出当前 SOP | 右下角浮动工具栏 📄 |
| 导入数据 | 右下角浮动工具栏 ⬆ |
| 更改数据目录 | 标题栏设置按钮 → 数据文件位置 → 更改 |

### 导出说明

**导出全部** → 生成如下文件夹结构：
```
flow-sop-export/
├── manifest.json          ← 完整数据，可重新导入还原
├── README.md              ← 项目介绍与 SOP 目录索引
└── VFB_Project/
    └── Auth_Module/
        ├── JWT登录模块.md
        └── Token刷新机制.md
```

**导出单个 SOP** → 生成标准 Markdown 文件，含流程图代码、变量说明、所有卡片代码及备注，可直接提交 Git 或分享给他人。

### 数据同步（多设备）

在设置面板将数据目录改到云盘路径，即可多端同步：
```
Windows: C:\Users\用户名\OneDrive\FlowSOP
macOS:   ~/Library/Mobile Documents/com~apple~CloudDocs/FlowSOP
```

---

## 🛠 开发

### 环境要求

| 工具 | 版本 |
|------|------|
| Node.js | 18+ |
| npm | 9+ |

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [Electron](https://electronjs.org) | 29 | 跨平台桌面壳 |
| [Vue 3](https://vuejs.org) | 3.4 | UI 框架（Composition API + TypeScript） |
| [Pinia](https://pinia.vuejs.org) | 2.1 | 状态管理 |
| [Mermaid.js](https://mermaid.js.org) | 10 | 流程图渲染 |
| [highlight.js](https://highlightjs.org) | 11.9 | 代码语法高亮 |
| [Vite](https://vitejs.dev) | 5 | 构建工具 |
| [electron-builder](https://www.electron.build) | 24 | 打包工具 |

### 项目结构

```
flow-sop/
├── electron/
│   ├── main.js          # 主进程：窗口、IPC、File Watcher
│   ├── preload.js       # contextBridge → window.electronAPI
│   ├── seed.js          # 演示数据（首次启动自动初始化）
│   └── sopFormat.js     # Markdown 导出格式工具
│
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── assets/main.css          # CSS 变量主题系统
│   ├── types/index.ts           # TypeScript 类型定义
│   ├── stores/sop.ts            # Pinia store（全部业务逻辑）
│   ├── composables/
│   │   ├── useMermaid.ts        # Mermaid 渲染 Hook
│   │   └── useEmojis.ts         # 图标库（150+ emoji，10 分组）
│   └── components/
│       ├── TitleBar.vue         # 自定义标题栏
│       ├── Sidebar.vue          # 左侧导航
│       ├── WorkspaceView.vue    # 主工作区
│       ├── MermaidPanel.vue     # 流程图面板
│       ├── ActionCard.vue       # 动作卡片
│       ├── CodeBlock.vue        # 代码高亮
│       └── modals/              # 所有弹窗
│           ├── FilePickerModal.vue    # 内置文件夹选择器
│           ├── ImportFilePicker.vue   # 内置 JSON 文件选择器
│           ├── SaveFileModal.vue      # 内置文件保存对话框
│           ├── EditSopModal.vue       # 编辑 SOP（含 Mermaid 预览）
│           ├── EditCardModal.vue      # 编辑动作卡片
│           ├── NewCollectionModal.vue # 新建 Collection
│           ├── EditCollectionModal.vue# 编辑 Collection
│           └── SettingsModal.vue      # 设置面板
│
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── BUILD_GUIDE.md               # 详细打包指南
└── README.md
```

### 数据模型

```typescript
AppData {
  collections: Collection[]
}

Collection {
  id: string; name: string; icon: string; color: string
  folders: Folder[]
}

Folder {
  id: string; name: string
  sopItems: SopItem[]
}

SopItem {
  id: string; title: string; mermaidSource: string
  variables: Record<string, string>   // {{VAR}} 替换映射
  actionCards: ActionCard[]
  pinnedCardIds: string[]             // 固定到右侧面板的卡片
}

ActionCard {
  id: string; title: string; language: string
  code: string; notes: string; completed: boolean
}
```

---

## 📦 构建打包

### Windows 安装包

```bash
# 国内网络建议先设置镜像
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/

npm run build:win
# 输出：dist-electron/Flow SOP Setup 1.0.0.exe
```

### 其他平台

```bash
npm run build:mac    # macOS → .dmg
npm run build:linux  # Linux → .AppImage
```

### 安装包特性（Windows NSIS）

- ✅ 图形化安装向导
- ✅ 用户可自定义安装目录
- ✅ 自动创建桌面快捷方式
- ✅ 自动创建开始菜单快捷方式
- ✅ 支持控制面板卸载

> 详细打包说明、图标替换、代码签名、CI/CD 配置，见 [BUILD_GUIDE.md](BUILD_GUIDE.md)

---

## ❓ 常见问题

**Q: 流程图加载很慢？**
A: 首次加载需从 CDN 拉取 Mermaid.js（约 1MB），之后浏览器缓存，基本秒出。如需完全离线，`mermaid` 已在 `dependencies` 中，Vite 会自动打包到本地。

**Q: 安装时 SmartScreen 提示"已保护你的电脑"？**
A: 点击「更多信息」→「仍要运行」即可。未签名程序均会触发此提示，属正常现象。

**Q: 数据会上传吗？**
A: 绝对不会。Flow SOP 完全离线运行，无任何网络请求（除首次 Mermaid CDN 加载外），数据仅存储在本地文件。

**Q: 如何备份数据？**
A: 直接复制 `~/.flowsop/data.json`，或用应用内导出功能生成带 Markdown 的完整备份包。

**Q: 卸载后数据还在吗？**
A: 卸载程序不删除用户数据。需手动删除 `~/.flowsop/` 目录（Windows 为 `%USERPROFILE%\.flowsop\`）。

**Q: 如何多台电脑同步？**
A: 设置 → 数据文件位置 → 更改，选择 OneDrive / iCloud / Dropbox 同步目录即可。

---

## 🗺️ 路线图

- [ ] 卡片拖拽排序
- [ ] 全局快捷键（⌘N 新增卡片、⌘E 编辑 SOP）
- [ ] 卡片执行计时器
- [ ] SOP 模板导入（社区共享）
- [ ] 全文搜索（搜索卡片代码内容）
- [ ] 多窗口支持

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

```bash
git clone https://github.com/your-username/flow-sop.git
cd flow-sop
git checkout -b feature/your-feature
# ... 开发 ...
git commit -m "feat: your feature description"
git push origin feature/your-feature
# 在 GitHub 上发起 Pull Request
```

---

## 📄 License

[MIT](LICENSE) © 2026

---

<div align="center">

觉得有用的话，欢迎点个 ⭐ Star

</div>
