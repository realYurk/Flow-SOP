import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppData, Collection, Folder, SopItem, ActionCard, Toast } from '@/types'

function uid() { return Math.random().toString(36).slice(2,9) + Date.now().toString(36) }

export const useSopStore = defineStore('sop', () => {
  const data        = ref<AppData>({ collections: [] })
  const activeSopId = ref<string | null>(null)
  const theme       = ref<'dark' | 'light'>('dark')
  const toasts      = ref<Toast[]>([])
  const isSaving    = ref(false)
  const searchQuery = ref('')
  const dataPath    = ref('')
  const showSettings = ref(false)

  const activeSop = computed<SopItem | null>(() => {
    if (!activeSopId.value) return null
    for (const col of data.value.collections)
      for (const folder of col.folders) {
        const f = folder.sopItems.find(s => s.id === activeSopId.value)
        if (f) return f
      }
    return null
  })

  const searchResults = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return []
    const out: { sop: SopItem; path: string }[] = []
    for (const col of data.value.collections)
      for (const folder of col.folders)
        for (const sop of folder.sopItems)
          if (sop.title.toLowerCase().includes(q))
            out.push({ sop, path: `${col.name} / ${folder.name}` })
    return out
  })

  const completionStats = computed(() => {
    const s = activeSop.value
    if (!s || !s.actionCards.length) return null
    const done = s.actionCards.filter(c => c.completed).length
    return { done, total: s.actionCards.length, pct: Math.round(done / s.actionCards.length * 100) }
  })

  async function loadData() {
    if (window.electronAPI) {
      data.value = await window.electronAPI.loadData()
      try { dataPath.value = await window.electronAPI.getDataPath() } catch(e) {}
    } else {
      const raw = localStorage.getItem('flowsop-data')
      if (raw) data.value = JSON.parse(raw)
      else data.value = { collections: [] }
    }
  }

  async function saveData() {
    isSaving.value = true
    try {
      if (window.electronAPI) await window.electronAPI.saveData(data.value)
      else localStorage.setItem('flowsop-data', JSON.stringify(data.value))
    } finally { isSaving.value = false }
  }

  function applyExternalData(d: AppData) { data.value = d; toast('文件已变更，已自动刷新', 'info') }

  function initTheme() {
    const saved = localStorage.getItem('flowsop-theme') as 'dark'|'light'|null
    theme.value = saved ?? 'dark'
    applyTheme(theme.value)
  }

  function applyTheme(t: 'dark'|'light') {
    document.documentElement.classList.toggle('dark', t === 'dark')
    document.documentElement.classList.toggle('light', t === 'light')
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    applyTheme(theme.value)
    localStorage.setItem('flowsop-theme', theme.value)
  }

  function toast(message: string, type: Toast['type'] = 'success') {
    const id = uid()
    toasts.value.push({ id, message, type })
    setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 3000)
  }

  // ── Collections ──────────────────────────────────────────────────────────
  function createCollection(name: string, icon = '📁', color = '#6366f1'): Collection {
    const col: Collection = { id: uid(), name, icon, color, sortOrder: data.value.collections.length, folders: [] }
    data.value.collections.push(col)
    saveData()
    return col
  }
  function updateCollection(id: string, patch: Partial<Pick<Collection,'name'|'icon'|'color'>>) {
    const c = data.value.collections.find(c => c.id === id)
    if (c) { Object.assign(c, patch); saveData() }
  }
  function deleteCollection(id: string) {
    data.value.collections = data.value.collections.filter(c => c.id !== id)
    if (activeSopId.value) {
      const ok = data.value.collections.some(c => c.folders.some(f => f.sopItems.some(s => s.id === activeSopId.value)))
      if (!ok) activeSopId.value = null
    }
    saveData()
  }

  // ── Folders ───────────────────────────────────────────────────────────────
  function createFolder(collectionId: string, name: string): Folder {
    const col = data.value.collections.find(c => c.id === collectionId)!
    const f: Folder = { id: uid(), name, sortOrder: col.folders.length, sopItems: [] }
    col.folders.push(f); saveData(); return f
  }
  function renameFolder(collectionId: string, folderId: string, name: string) {
    const f = data.value.collections.find(c=>c.id===collectionId)?.folders.find(f=>f.id===folderId)
    if (f) { f.name = name; saveData() }
  }
  function deleteFolder(collectionId: string, folderId: string) {
    const col = data.value.collections.find(c=>c.id===collectionId)
    if (col) { col.folders = col.folders.filter(f=>f.id!==folderId); saveData() }
  }

  // ── SOP Items ─────────────────────────────────────────────────────────────
  function findSop(id: string): SopItem | undefined {
    for (const col of data.value.collections)
      for (const folder of col.folders) { const s = folder.sopItems.find(s=>s.id===id); if (s) return s }
  }
  function createSopItem(folderId: string, title: string): SopItem {
    let target: Folder|undefined
    for (const col of data.value.collections) { target = col.folders.find(f=>f.id===folderId); if (target) break }
    if (!target) throw new Error('Folder not found')
    const sop: SopItem = {
      id: uid(), title,
      mermaidSource: 'graph LR\n  A[开始] --> B[步骤一]\n  B --> C[完成]',
      variables: {}, actionCards: [], sortOrder: target.sopItems.length, pinnedCardIds: []
    }
    target.sopItems.push(sop); saveData(); return sop
  }
  function updateSopItem(id: string, patch: Partial<Pick<SopItem,'title'|'mermaidSource'|'variables'|'pinnedCardIds'>>) {
    const s = findSop(id); if (s) { Object.assign(s, patch); saveData() }
  }
  function deleteSopItem(id: string) {
    for (const col of data.value.collections)
      for (const folder of col.folders) {
        const i = folder.sopItems.findIndex(s=>s.id===id)
        if (i !== -1) { folder.sopItems.splice(i,1); if (activeSopId.value===id) activeSopId.value=null; saveData(); return }
      }
  }

  // ── Action Cards ──────────────────────────────────────────────────────────
  function createCard(sopId: string, patch: Partial<ActionCard> = {}): ActionCard {
    const sop = findSop(sopId)!
    const card: ActionCard = {
      id: uid(), title: patch.title ?? '新卡片', language: patch.language ?? 'bash',
      code: patch.code ?? '', notes: patch.notes ?? '',
      completed: false, sortOrder: sop.actionCards.length
    }
    sop.actionCards.push(card); saveData(); return card
  }
  function updateCard(sopId: string, cardId: string, patch: Partial<ActionCard>) {
    const card = findSop(sopId)?.actionCards.find(c=>c.id===cardId)
    if (card) { Object.assign(card, patch); saveData() }
  }
  function toggleCard(sopId: string, cardId: string) {
    const card = findSop(sopId)?.actionCards.find(c=>c.id===cardId)
    if (card) { card.completed = !card.completed; saveData() }
  }
  function deleteCard(sopId: string, cardId: string) {
    const sop = findSop(sopId)
    if (sop) {
      sop.actionCards = sop.actionCards.filter(c=>c.id!==cardId)
      sop.pinnedCardIds = (sop.pinnedCardIds??[]).filter(id=>id!==cardId)
      saveData()
    }
  }
  function togglePinCard(sopId: string, cardId: string) {
    const sop = findSop(sopId)
    if (!sop) return
    const pins = sop.pinnedCardIds ?? []
    if (pins.includes(cardId)) sop.pinnedCardIds = pins.filter(id=>id!==cardId)
    else sop.pinnedCardIds = [...pins, cardId]
    saveData()
  }

  function resolveCode(code: string, variables: Record<string,string>): string {
    return code.replace(/\{\{(\w+)\}\}/g, (_, k) => variables[k] ?? `{{${k}}}`)
  }

  function setDataPath(p: string) { dataPath.value = p }

  return {
    data, activeSopId, activeSop, theme, toasts, isSaving,
    searchQuery, searchResults, completionStats, dataPath, showSettings,
    loadData, saveData, applyExternalData, initTheme, toggleTheme, toast,
    createCollection, updateCollection, deleteCollection,
    createFolder, renameFolder, deleteFolder,
    findSop, createSopItem, updateSopItem, deleteSopItem,
    createCard, updateCard, toggleCard, deleteCard, togglePinCard,
    resolveCode, setDataPath,
  }
})
