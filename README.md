<div align="center">

# Flow SOP

**别让你的 SOP 停留在纸面。画出逻辑，即刻执行。**
*(Don't just document it. Draw it, track it, execute it.)*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.4-4FC08D.svg?logo=vue.js)](https://vuejs.org/)
[![Electron](https://img.shields.io/badge/Electron-29.0-47848F.svg?logo=electron)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Win%20%7C%20Mac%20%7C%20Linux-lightgrey.svg)]()

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [项目结构](#-项目结构) • [常见问题](#-faq)

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
