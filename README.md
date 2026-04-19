# ⚡ Life SOP — Vue 3 + Electron Edition

> 行动导向型本地知识库 · Linear 风格 · 深色/浅色双主题

---

## 技术栈

| 层 | 技术 |
|----|------|
| UI 框架 | Vue 3 + TypeScript + Composition API |
| 样式 | Tailwind CSS v3 + 自定义 Design Tokens |
| 状态管理 | Pinia |
| 流程图 | Mermaid.js 10（支持 Zoom/Pan、方向切换、节点点击） |
| 桌面端 | Electron 29 |
| 持久化 | 本地 JSON 文件 (`~/.lifesop/data.json`) + File Watcher |
| 打包 | electron-builder |

---

## 快速开始

### 前置要求

- Node.js 18+
- npm 9+

### 安装依赖

```bash
npm install
```

### 开发模式（浏览器）

```bash
npm run dev
# 访问 http://localhost:5173
```

### 开发模式（Electron 桌面）

```bash
npm run electron:dev
```

### 生产打包

```bash
npm run electron:build
# 输出到 dist-electron/
```

---

## 功能特性

### 🗂 三级导航
- Collection → Folder → SOP
- 右键菜单：新建 / 重命名 / 删除
- 搜索框实时过滤 SOP

### 📊 Mermaid 流程图
- 实时渲染，深色/浅色主题自动适配
- LR / TD 方向一键切换
- 鼠标滚轮缩放（Ctrl+滚轮）、拖拽平移
- 拖拽底边调整面板高度
- 点击节点跳转对应动作卡片

### 📋 动作卡片流
- Checkbox 追踪完成状态，顶部进度条
- 代码块一键复制（支持变量自动替换）
- 语言标签（bash/java/python/sql/yaml...）
- 黄色 💡 备注区

### 🏷 变量系统
- SOP 级变量，代码中 `{{VAR_NAME}}` 自动替换
- 顶部 Variables Bar 实时编辑

### 🎨 双主题
- 深色/浅色一键切换，偏好持久化
- 完整 Design Token 系统

### 💾 本地存储
- 数据保存在 `~/.lifesop/data.json`
- File Watcher：手动编辑 JSON 后 UI 自动刷新
- 支持一键导出/导入 JSON 备份

### 🛠 浮动工具栏
- 右下角浮动，显示当前 SOP 完成进度
- 快捷访问：导出、导入、新增卡片、编辑 SOP

---

## 数据文件结构

```json
{
  "collections": [
    {
      "id": "col-1",
      "name": "VFB Project",
      "icon": "⚡",
      "color": "#6366f1",
      "folders": [
        {
          "id": "fol-1",
          "name": "Auth Module",
          "sopItems": [
            {
              "id": "sop-1",
              "title": "快速构建 JWT 登录模块",
              "mermaidSource": "graph LR\n  A --> B",
              "variables": { "JWT_SECRET": "your-secret" },
              "actionCards": [
                {
                  "id": "card-1",
                  "title": "Step 1 · 添加依赖",
                  "language": "xml",
                  "code": "<dependency>...</dependency>",
                  "notes": "注意事项",
                  "completed": false
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 目录结构

```
life-sop-vue/
├── electron/
│   ├── main.js          # Electron 主进程
│   ├── preload.js       # IPC 桥接
│   └── seed.js          # 默认演示数据
├── src/
│   ├── assets/main.css  # Tailwind 入口
│   ├── components/
│   │   ├── TitleBar.vue        # 自定义标题栏
│   │   ├── Sidebar.vue         # 左侧导航
│   │   ├── CollectionGroup.vue # Collection 折叠组
│   │   ├── FolderGroup.vue     # Folder + SOP 列表
│   │   ├── ContextMenu.vue     # 右键菜单
│   │   ├── WorkspaceView.vue   # 主工作区
│   │   ├── MermaidPanel.vue    # 流程图面板
│   │   ├── VariablesBar.vue    # 变量编辑栏
│   │   ├── ActionCard.vue      # 动作卡片
│   │   ├── FloatingToolbar.vue # 浮动工具栏
│   │   ├── ToastStack.vue      # Toast 通知
│   │   └── modals/
│   │       ├── EditSopModal.vue
│   │       ├── EditCardModal.vue
│   │       └── RenameModal.vue
│   ├── composables/
│   │   └── useMermaid.ts       # Mermaid 渲染 hook
│   ├── stores/
│   │   └── sop.ts              # Pinia store（全部业务逻辑）
│   ├── types/index.ts
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.ts
```
