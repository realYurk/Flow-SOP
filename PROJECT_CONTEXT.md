# Life SOP — AI 交接文档 v3（最终版）

> 将本文档完整粘贴给 AI，即可理解整个项目并继续开发。
> 版本：v3 | 最后更新：2026-04

---

## 一、项目定位

**Life SOP** 是一个面向工程师的**本地桌面知识库工具**，核心理念是"打开即干活"——把复杂标准流程拆解为可逐步执行的卡片，支持代码高亮、一键复制、变量自动替换、Mermaid 流程图。

---

## 二、技术栈

| 层 | 技术 | 版本 |
|----|------|------|
| UI 框架 | Vue 3 + TypeScript + Composition API | 3.4 |
| 状态管理 | Pinia | 2.1 |
| 流程图 | Mermaid.js | 10.x |
| 代码高亮 | highlight.js | 11.9 |
| 桌面壳 | Electron | 29 |
| 打包 | Vite + electron-builder | 5 / 24 |

### 核心样式约定（必读）

**所有组件使用 `inline style + CSS 变量`，绝不使用 Tailwind 自定义 token 类名**（如 `text-text-primary`、`bg-bg-raised` 这类不在 Tailwind 标准库的类会导致构建失败）。Tailwind 在本项目只用于布局工具类（`flex`、`gap-*`、`p-*` 等）。

主题切换：给 `<html>` 切换 `.dark` / `.light` class → CSS 变量自动生效。

---

## 三、完整目录结构

```
life-sop-vue/
├── electron/
│   ├── main.js          # 主进程：窗口、IPC、File Watcher
│   ├── preload.js       # contextBridge → window.electronAPI
│   ├── seed.js          # 首次启动演示数据
│   └── sopFormat.js     # 导出格式工具（Markdown 文件夹 + manifest.json）
│
├── public/
│   ├── icon.svg         # 应用图标（需替换为 .ico 用于 Windows 打包）
│   └── installer.nsh    # NSIS 安装脚本占位（可自定义安装行为）
│
├── src/
│   ├── main.ts
│   ├── App.vue          # 根组件：TitleBar + Sidebar + WorkspaceView + SettingsModal
│   ├── assets/main.css  # CSS 变量定义（:root 深色，.light 浅色）+ 工具类
│   │
│   ├── types/index.ts   # 全部 TypeScript 类型
│   ├── stores/sop.ts    # Pinia store（唯一状态中心）
│   │
│   ├── composables/
│   │   ├── useMermaid.ts   # Mermaid 渲染 hook
│   │   └── useEmojis.ts    # 150+ emoji 分组 + 颜色色板（Collection 图标用）
│   │
│   └── components/
│       ├── TitleBar.vue          # 标题栏：Logo + 主题 + 设置 + 窗口控制
│       ├── Sidebar.vue           # 左侧：搜索框 + 导航树 + 新建Collection
│       ├── CollectionGroup.vue   # 导航 L1：右键菜单（新建/编辑名称+图标/删除）
│       ├── FolderGroup.vue       # 导航 L2+L3：右键菜单（新建/重命名/删除）
│       ├── ContextMenu.vue       # 通用右键菜单（Teleport）
│       ├── WorkspaceView.vue     # 右侧主工作区（双栏布局 + 固定卡片面板）
│       ├── MermaidPanel.vue      # 流程图面板（缩放/平移/方向/可拖拽调高）
│       ├── VariablesBar.vue      # {{VAR}} 变量替换栏
│       ├── ActionCard.vue        # 动作卡片（使用 CodeBlock 渲染代码）
│       ├── CodeBlock.vue         # 代码高亮组件（highlight.js，50+ 语言）
│       ├── FloatingToolbar.vue   # 右下角浮动：导出全部/导出当前SOP/导入/进度
│       ├── ToastStack.vue        # Toast 通知
│       └── modals/
│           ├── InlineInputModal.vue     # 通用单行输入弹窗（替代 window.prompt）
│           ├── NewCollectionModal.vue   # 新建Collection（分组emoji选择器+颜色）
│           ├── EditCollectionModal.vue  # 编辑Collection名称+图标+颜色
│           ├── EditSopModal.vue         # 编辑SOP（标题+Mermaid+内嵌变量管理）
│           ├── EditCardModal.vue        # 新增/编辑卡片（分组语言选择器）
│           ├── SettingsModal.vue        # 设置（主题/数据路径/导出/导入/统计）
│           └── RenameModal.vue          # 备用通用重命名
│
├── BUILD_GUIDE.md       # Windows exe 打包详细指南
├── package.json
├── vite.config.ts
├── tailwind.config.js   # 极简（仅 fontFamily 扩展，不用自定义颜色 token）
└── tsconfig.json
```

---

## 四、数据模型（types/index.ts）

```typescript
AppData       { collections: Collection[] }

Collection    { id, name, icon(emoji), color(hex), sortOrder, folders[] }

Folder        { id, name, sortOrder, sopItems[] }

SopItem       {
  id, title, mermaidSource, sortOrder
  variables: Record<string,string>   // {{KEY}} 占位符映射
  actionCards: ActionCard[]
  pinnedCardIds?: string[]           // 固定到右侧面板的卡片 ID 列表
}

ActionCard    {
  id, title
  language: string    // 代码语言，如 "java"、"python"、"yaml"
  code: string        // 支持 {{VAR}} 占位符
  notes: string       // 备注/避坑提示
  completed: boolean
  sortOrder
}

ElectronAPI   {
  loadData, saveData
  exportData(data)    // 弹出目录选择器，导出 Markdown 文件夹
  exportSop(sop)      // 弹出文件另存为，导出单个 .md
  importData()        // 弹出文件选择器，支持 manifest.json / data.json
  openDataDir()       // 打开 ~/.lifesop/ 目录
  getDataPath()       // 返回 data.json 完整路径
  minimize/maximize/close()
  onExternalChange(cb)
  removeExternalChangeListener()
}
```

数据文件：`~/.lifesop/data.json`（Windows: `%USERPROFILE%\.lifesop\data.json`）

---

## 五、Pinia Store（stores/sop.ts）

所有数据操作必须通过 store 方法，**不直接修改 `store.data`**（导入时例外）。每个写操作方法末尾自动调用 `saveData()`。

### State
```typescript
data           // ref<AppData>
activeSopId    // ref<string|null>
theme          // ref<'dark'|'light'>
toasts         // ref<Toast[]>
isSaving       // ref<boolean>
searchQuery    // ref<string>
dataPath       // ref<string>
showSettings   // ref<boolean>
```

### Computed
```typescript
activeSop        // 当前 SopItem（从 data 遍历查找）
searchResults    // { sop, path }[]（按 searchQuery 过滤）
completionStats  // { done, total, pct } | null
```

### 全部方法
```typescript
// 生命周期
loadData() / saveData() / applyExternalData(d)
initTheme() / toggleTheme()
toast(msg, type?)

// Collection CRUD
createCollection(name, icon?, color?)
updateCollection(id, { name?, icon?, color? })
deleteCollection(id)

// Folder CRUD
createFolder(collectionId, name)
renameFolder(collectionId, folderId, name)
deleteFolder(collectionId, folderId)

// SopItem CRUD
findSop(id): SopItem | undefined
createSopItem(folderId, title)
updateSopItem(id, { title?, mermaidSource?, variables?, pinnedCardIds? })
deleteSopItem(id)

// ActionCard CRUD
createCard(sopId, patch?)          // patch: Partial<ActionCard>
updateCard(sopId, cardId, patch)
toggleCard(sopId, cardId)          // 切换 completed
deleteCard(sopId, cardId)          // 同时从 pinnedCardIds 移除
togglePinCard(sopId, cardId)       // 固定/取消固定

// 工具
resolveCode(code, variables)       // {{KEY}} → variables[KEY]
```

---

## 六、CodeBlock.vue — 代码高亮

```typescript
// Props
interface Props {
  code: string
  language: string   // 语言标识，支持别名（如 'py'→'python', 'ts'→'typescript'）
  compact?: boolean  // 紧凑模式：截断超过 200 字符的代码
}

// Emits
'copy'  // 用户点击复制按钮时触发
```

**支持语言（含别名）：**
`javascript/js`, `typescript/ts`, `jsx`, `tsx`, `python/py`, `java`, `kotlin`, `scala`, `groovy`, `bash/shell/sh/zsh`, `powershell/ps1`, `sql`, `mysql`, `postgresql`, `xml`, `yaml`, `json`, `html`, `css`, `rust/rs`, `go`, `c`, `cpp/c++`, `csharp/cs/c#`, `swift`, `php`, `ruby/rb`, `lua`, `r`, `dockerfile/docker`, `nginx`, `apache`, `http`, `graphql/gql`, `markdown/md`, `vim`, `terraform/hcl`, `proto`, `groovy/gradle`, `elixir`, `haskell`, `ocaml`, `perl`, `dart`, `diff` 等。

**主题：** 深色 = GitHub Dark，浅色 = GitHub Light（通过 `html.light` class 自动切换）。

---

## 七、useEmojis.ts — 图标配置

```typescript
// 导出内容
EMOJI_GROUPS: EmojiGroup[]   // 10 个分组，每组 15-23 个 emoji，共 150+
UNIQUE_COLORS: string[]      // 14 种颜色（十六进制）

// 分组标签
'技术开发' | '项目管理' | '财务投资' | '学习成长' | '健康生活' |
'职场人际' | '创意设计' | '运维部署' | '家庭生活' | '其他符号'
```

使用场景：`NewCollectionModal` 和 `EditCollectionModal` 均引用此文件，展示分组 emoji 选择器。

---

## 八、electron/sopFormat.js — 导出格式

```javascript
// 导出整个 AppData 为文件夹结构
exportToFolder(data, destDir)
// 导出单个 SopItem 为 Markdown 字符串
sopToMarkdown(sop): string
// 从导出目录导入（读 manifest.json）
importFromFolder(srcDir): AppData
```

导出文件夹结构：
```
dest/
├── manifest.json      ← 完整 JSON，用于无损导入
├── README.md          ← 人类可读的 SOP 目录索引
└── {Collection名}/
    └── {Folder名}/
        └── {SOP标题}.md  ← 含 mermaid + 变量 + 卡片代码的标准 Markdown
```

---

## 九、Electron IPC 完整清单（window.electronAPI）

| 方法 | 说明 |
|------|------|
| `loadData()` | 读 `~/.lifesop/data.json`，首次运行写入 seed 数据 |
| `saveData(data)` | 写回文件 |
| `exportData(data)` | 弹出「另存为目录」对话框，写 Markdown 文件夹结构，自动打开目录 |
| `exportSop(sop)` | 弹出「另存为文件」对话框，写单个 `.md`，自动在资源管理器定位 |
| `importData()` | 弹出「打开文件」对话框，支持 `manifest.json` 或 `data.json` |
| `openDataDir()` | 用系统资源管理器打开 `~/.lifesop/` |
| `getDataPath()` | 返回 `data.json` 完整路径 |
| `minimize()` | 最小化窗口 |
| `maximize()` | 最大化/还原窗口 |
| `close()` | 关闭窗口 |
| `onExternalChange(cb)` | 注册 File Watcher 回调（data.json 被外部修改时触发） |
| `removeExternalChangeListener()` | 清除 File Watcher 回调 |

---

## 十、主题系统（assets/main.css）

```css
:root {            /* 深色（默认，html.dark 或无 class） */
  --bg-base:    #0f0f17;    --bg-raised:  #16161f;
  --bg-panel:   #1a1a25;    --bg-hover:   #1e1e2e;
  --bg-active:  #22223a;    --border-sub: #1e1e2e;
  --border-def: #2a2a3d;    --border-str: #3a3a55;
  --text-pri:   #e8e8f0;    --text-sec:   #8888aa;
  --text-mut:   #55556a;    --text-acc:   #818cf8;
  --code-bg:    #0d0d14;    --code-text:  #adbac7;
}
.light {           /* 浅色：覆盖全部变量 */
  --bg-base:    #f5f5fb;    --bg-raised:  #ffffff;
  --code-bg:    #f0f0f8;    --code-text:  #24292f;
  /* ... */
}
```

---

## 十一、组件通信模式

### provide / inject（WorkspaceView → ActionCard）
```typescript
// WorkspaceView.vue
provide('openEditCard', (card: AC) => openAddCard(card))

// ActionCard.vue
const openEditCard = inject<...>('openEditCard', undefined)
function doEdit() { openEditCard?.(props.card) }
```

### 右键菜单触发流程
1. 用户右键 → 组件内 `reactive({ visible, x, y })` 记录位置
2. 渲染 `<ContextMenu>` 组件（Teleport to body）
3. 点击菜单项 → 设置 `modal.value` 触发对应弹窗
4. 弹窗（InlineInputModal / EditCollectionModal 等）完成操作 → `modal.value = ''` 关闭

### Modal 持有位置
- **WorkspaceView** 持有：`EditSopModal`、`EditCardModal`
- **CollectionGroup** 持有：`InlineInputModal`（新建Folder）、`EditCollectionModal`
- **FolderGroup** 持有：`InlineInputModal`（新建SOP / 重命名）
- **App.vue** 持有：`SettingsModal`

---

## 十二、CSS 工具类（main.css）

```css
/* 输入 / 按钮 */
.sop-input       /* 标准输入框 */
.btn-primary     /* 紫色主按钮 */
.btn-ghost       /* 透明次按钮 */
.btn-icon        /* 28×28 图标按钮 */
.lang-badge      /* 代码语言标签（等宽字体） */
.code-textarea   /* 代码编辑 textarea */

/* Modal 共享结构 */
.modal-backdrop  /* 全屏遮罩，点击外部关闭 */
.modal-box       /* 白/深色面板容器 */
.modal-header    /* 标题栏行 */
.modal-footer    /* 底部按钮行 */
.field-label     /* 表单字段标签 */

/* Electron */
.drag-region     /* -webkit-app-region: drag（标题栏拖拽区） */
.no-drag         /* -webkit-app-region: no-drag（拖拽区内的按钮） */
```

---

## 十三、打包命令

```bash
npm install          # 首次安装依赖

npm run dev          # 浏览器预览（数据存 localStorage）
npm run electron:dev # Electron 桌面开发模式（推荐）

npm run build:win    # 打包 Windows x64 安装程序 → dist-electron/*.exe
npm run build:mac    # 打包 macOS dmg
npm run build:linux  # 打包 Linux AppImage
npm run build:all    # 打包全平台
```

打包输出：`dist-electron/Life SOP Setup 1.0.0.exe`（安装向导、可选目录、桌面快捷方式、支持卸载）。详见 `BUILD_GUIDE.md`。

---

## 十四、已知问题 / 待完善

| 问题 | 建议方案 |
|------|---------|
| 卡片不可拖拽排序 | 集成 `@vueuse/integrations/useSortable` 或 `Sortable.js` |
| 删除确认用系统 `window.confirm()` | 替换为自定义 `ConfirmModal.vue`，与整体设计风格一致 |
| 无快捷键 | `App.vue` onMounted 绑定 `keydown`（⌘N 新增卡片，⌘E 编辑 SOP 等） |
| Windows 安装包无代码签名 | 首次运行触发 SmartScreen 警告，用户需点"仍要运行"。生产发布建议购买 EV 证书 |
| Mermaid 需联网（jsDelivr CDN） | highlight.js 已本地化；Mermaid 可通过 `npm install mermaid` 完全本地化（已在 dependencies） |
| `BUILD_GUIDE.md` 中需替换真实 .ico 图标 | 准备 256×256 PNG，用 convertio.co 转为 .ico，放 `public/icon.ico` |

---

## 十五、v3 相对 v2 的变更清单

| # | 变更 | 详情 |
|---|------|------|
| 1 | **代码高亮** | 新增 `CodeBlock.vue`，集成 highlight.js，支持 50+ 语言，深/浅主题自动切换 |
| 2 | **ActionCard 重构** | 代码块部分替换为 `CodeBlock` 组件，移除原有纯文本 `<pre>` |
| 3 | **导出位置可选** | `exportData` 改为弹出系统目录选择器；`exportSop` 弹出文件另存为对话框 |
| 4 | **图标库扩展** | 新增 `useEmojis.ts`，150+ emoji 按 10 个生活领域分组 |
| 5 | **EditCollectionModal** | 新建右键菜单「编辑」项，可同时修改名称 + 图标 + 颜色 |
| 6 | **EditCardModal 语言分组** | 语言选择器改为 8 个分组（JVM/Web/脚本/系统/数据库/配置/运维/其他），覆盖 50+ 语言 |
| 7 | **Windows exe 打包配置** | `package.json` 新增 NSIS 配置，`build:win` 命令输出可安装的 .exe |
| 8 | **BUILD_GUIDE.md** | 完整的打包说明文档，含镜像加速、常见问题、代码签名、CI/CD 示例 |

