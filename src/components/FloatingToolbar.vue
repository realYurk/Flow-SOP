<template>
  <Transition name="tb">
    <div v-if="store.activeSop"
      style="position:fixed;bottom:20px;right:20px;z-index:40;display:flex;align-items:center;gap:2px;padding:4px 6px;background:var(--bg-panel);border:1px solid var(--border-def);border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,.5);">

      <!-- Export ALL -->
      <button class="tb-btn" title="导出全部数据（选择文件夹）" @click="showExportPicker=true">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
      </button>

      <!-- Export current SOP as Markdown -->
      <button class="tb-btn" title="导出当前 SOP 为 Markdown" @click="showSopSave=true">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      </button>

      <!-- Import -->
      <button class="tb-btn" title="导入数据" @click="showImportPicker=true">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12"/>
        </svg>
      </button>

      <div style="width:1px;height:18px;background:var(--border-def);margin:0 2px;"/>

      <!-- Progress -->
      <div v-if="store.completionStats" style="display:flex;align-items:center;gap:6px;padding:0 6px;">
        <div style="width:52px;height:3px;background:var(--bg-hover);border-radius:99px;overflow:hidden;">
          <div style="height:100%;background:#22c55e;border-radius:99px;transition:width .4s;"
            :style="`width:${store.completionStats.pct}%`"/>
        </div>
        <span style="font-size:10px;color:var(--text-mut);font-family:monospace;">{{ store.completionStats.pct }}%</span>
      </div>
    </div>
  </Transition>

  <!-- Export ALL: pick dest folder -->
  <FilePickerModal
    v-if="showExportPicker"
    title="选择导出到哪个文件夹"
    @confirm="doExportAll"
    @cancel="showExportPicker=false"
  />

  <!-- Export SOP: pick save path -->
  <SaveFileModal
    v-if="showSopSave"
    title="导出 SOP 为 Markdown"
    :default-name="sopDefaultName"
    @confirm="doExportSop"
    @cancel="showSopSave=false"
  />

  <!-- Import: pick JSON file -->
  <ImportFilePicker
    v-if="showImportPicker"
    @confirm="doImport"
    @cancel="showImportPicker=false"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSopStore } from '@/stores/sop'
import FilePickerModal  from '@/components/modals/FilePickerModal.vue'
import SaveFileModal    from '@/components/modals/SaveFileModal.vue'
import ImportFilePicker from '@/components/modals/ImportFilePicker.vue'

const store = useSopStore()
const showExportPicker = ref(false)
const showSopSave      = ref(false)
const showImportPicker = ref(false)

const sopDefaultName = computed(() => {
  const t = store.activeSop?.title || 'sop'
  return t.replace(/[/\\?%*:|"<>]/g,'-').replace(/\s+/g,'_').slice(0,60) + '.md'
})

async function doExportAll(dir: string) {
  showExportPicker.value = false
  if (!window.electronAPI) return
  const r = await window.electronAPI.exportData(store.data, dir)
  if (r.status === 'ok') store.toast(`✓ 已导出: ${r.path}`)
  else store.toast('导出失败: ' + (r.message||''), 'error')
}

async function doExportSop(savePath: string) {
  showSopSave.value = false
  if (!window.electronAPI || !store.activeSop) return
  const r = await window.electronAPI.exportSop(store.activeSop, savePath)
  if (r.status === 'ok') store.toast(`✓ 已保存: ${r.path?.split(/[/\\]/).pop()}`)
  else store.toast('导出失败: ' + (r.message||''), 'error')
}

async function doImport(filePath: string) {
  showImportPicker.value = false
  if (!window.electronAPI) return
  const d = await window.electronAPI.importData(filePath)
  if (d) { store.data = d; await store.saveData(); store.toast('✓ 数据已导入') }
  else store.toast('导入失败', 'error')
}
</script>

<style scoped>
.tb-btn {
  width:32px;height:32px;display:flex;align-items:center;justify-content:center;
  border-radius:7px;background:transparent;border:none;color:var(--text-mut);cursor:pointer;transition:all .15s;
}
.tb-btn:hover { background:var(--bg-hover);color:var(--text-pri); }
.tb-enter-active,.tb-leave-active { transition:all .2s cubic-bezier(.34,1.56,.64,1); }
.tb-enter-from,.tb-leave-to       { opacity:0;transform:translateY(8px) scale(.94); }
</style>
