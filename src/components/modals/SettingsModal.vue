<template>
  <Teleport to="body">
    <div
      style="position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.6);"
      @mousedown.self="$emit('close')"
    >
      <div
        class="animate-scale-in"
        style="background:var(--bg-panel);border:1px solid var(--border-def);border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.6);width:100%;max-width:520px;display:flex;flex-direction:column;max-height:90vh;overflow:hidden;"
      >
        <!-- Header -->
        <div style="display:flex;align-items:center;gap:8px;padding:14px 18px;border-bottom:1px solid var(--border-sub);flex-shrink:0;">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#6366f1" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span style="font-size:13px;font-weight:600;color:var(--text-pri);">设置</span>
          <div style="flex:1"/>
          <button @click="$emit('close')" style="background:none;border:none;color:var(--text-mut);cursor:pointer;font-size:16px;line-height:1;padding:2px 5px;">✕</button>
        </div>

        <div style="overflow-y:auto;flex:1;">

          <!-- Theme -->
          <div class="srow">
            <div><div class="stitle">外观主题</div><div class="sdesc">深色 / 浅色模式</div></div>
            <div style="display:flex;gap:6px;">
              <button v-for="t in [{v:'dark',l:'🌙 深色'},{v:'light',l:'☀️ 浅色'}]" :key="t.v"
                style="padding:5px 12px;border-radius:6px;border:1px solid var(--border-def);font-size:12px;cursor:pointer;transition:all .15s;"
                :style="store.theme===t.v ? 'background:#6366f120;border-color:#6366f1;color:#818cf8' : 'background:var(--bg-raised);color:var(--text-sec)'"
                @click="store.theme!==t.v && store.toggleTheme()"
              >{{ t.l }}</button>
            </div>
          </div>

          <!-- Data location -->
          <div class="srow">
            <div style="flex:1;min-width:0;">
              <div class="stitle">数据文件位置</div>
              <!-- Use localDataPath for immediate UI update -->
              <div style="font-size:11px;font-family:monospace;color:var(--text-sec);margin-top:3px;word-break:break-all;">
                {{ localDataPath || store.dataPath || '~/.flowsop/data.json' }}
              </div>
            </div>
            <div style="display:flex;gap:5px;flex-shrink:0;margin-left:12px;">
              <button
                style="padding:5px 10px;border-radius:6px;border:1px solid var(--border-def);background:var(--bg-raised);color:var(--text-sec);font-size:11px;cursor:pointer;white-space:nowrap;"
                :style="changingDir ? 'opacity:.5' : ''"
                @mouseenter="e=>!changingDir && ((e.currentTarget as HTMLElement).style.background='var(--bg-hover)')"
                @mouseleave="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-raised)'"
                @click="showDirPicker=true"
                :disabled="changingDir"
              >{{ changingDir ? '更改中…' : '📂 更改位置' }}</button>
              <button
                style="padding:5px 10px;border-radius:6px;border:1px solid var(--border-def);background:var(--bg-raised);color:var(--text-sec);font-size:11px;cursor:pointer;white-space:nowrap;"
                @mouseenter="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-hover)'"
                @mouseleave="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-raised)'"
                @click="openDir"
              >打开</button>
            </div>
          </div>

          <!-- Export all -->
          <div class="srow">
            <div>
              <div class="stitle">导出全部数据</div>
              <div class="sdesc">选择文件夹，导出 Markdown 结构 + manifest.json</div>
            </div>
            <button
              style="padding:5px 12px;border-radius:6px;border:1px solid var(--border-def);background:var(--bg-raised);color:var(--text-sec);font-size:11px;cursor:pointer;white-space:nowrap;"
              :style="exporting ? 'opacity:.5' : ''"
              @mouseenter="e=>!exporting && ((e.currentTarget as HTMLElement).style.background='var(--bg-hover)')"
              @mouseleave="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-raised)'"
              @click="showExportPicker=true"
              :disabled="exporting"
            >{{ exporting ? '导出中…' : '⬇ 导出' }}</button>
          </div>

          <!-- Import -->
          <div class="srow">
            <div>
              <div class="stitle">导入数据</div>
              <div class="sdesc">从备份 JSON 文件导入（覆盖当前全部数据）</div>
            </div>
            <button
              style="padding:5px 12px;border-radius:6px;border:1px solid var(--border-def);background:var(--bg-raised);color:var(--text-sec);font-size:11px;cursor:pointer;white-space:nowrap;"
              @mouseenter="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-hover)'"
              @mouseleave="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-raised)'"
              @click="showImportPicker=true"
            >⬆ 导入</button>
          </div>

          <!-- Export structure info -->
          <div style="margin:4px 18px;padding:10px 12px;background:var(--bg-raised);border:1px solid var(--border-sub);border-radius:6px;">
            <div style="font-size:11px;font-weight:600;color:var(--text-sec);margin-bottom:6px;">导出目录结构（项目介绍文档）</div>
            <pre style="margin:0;font-size:10px;color:var(--text-mut);font-family:monospace;line-height:1.9;">你选择的目录/
└── flow-sop-export/
    ├── manifest.json    ← 完整数据（用于重新导入还原）
    ├── README.md        ← 项目介绍与 SOP 索引（含导出时间/目录）
    └── VFB_Project/
        └── Auth_Module/
            └── JWT登录.md  ← 含流程图 + 所有 Step 代码</pre>
          </div>

          <!-- Stats -->
          <div class="srow" style="border-bottom:none;">
            <div class="stitle">数据统计</div>
            <div style="font-size:12px;color:var(--text-sec);text-align:right;line-height:2.2;">
              <div>Collections <b style="color:var(--text-pri);">{{ store.data.collections.length }}</b></div>
              <div>SOP 总数 <b style="color:var(--text-pri);">{{ totalSops }}</b></div>
              <div>卡片总数 <b style="color:var(--text-pri);">{{ totalCards }}</b></div>
            </div>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:8px;padding:12px 18px;border-top:1px solid var(--border-sub);flex-shrink:0;">
          <span style="font-size:11px;color:var(--text-mut);">Flow SOP v1.0.0</span>
          <div style="flex:1"/>
          <button
            style="padding:6px 20px;border-radius:6px;background:#6366f1;color:#fff;border:1px solid #6366f1;font-size:12px;font-weight:500;cursor:pointer;"
            @click="$emit('close')"
          >关闭</button>
        </div>
      </div>
    </div>

    <!-- File pickers -->
    <FilePickerModal  v-if="showDirPicker"    title="选择新的数据存储目录"   @confirm="changeDataDir" @cancel="showDirPicker=false" />
    <FilePickerModal  v-if="showExportPicker" title="选择导出到哪个文件夹"   @confirm="doExport"     @cancel="showExportPicker=false" />
    <ImportFilePicker v-if="showImportPicker"                                @confirm="doImport"     @cancel="showImportPicker=false" />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSopStore } from '@/stores/sop'
import FilePickerModal  from '@/components/modals/FilePickerModal.vue'
import ImportFilePicker from '@/components/modals/ImportFilePicker.vue'

const emit  = defineEmits<{ close: [] }>()
const store = useSopStore()

const showDirPicker    = ref(false)
const showExportPicker = ref(false)
const showImportPicker = ref(false)
const exporting        = ref(false)
const changingDir      = ref(false)

// Local copy for immediate UI feedback (don't wait for store reactivity)
const localDataPath = ref('')

const totalSops  = computed(() => store.data.collections.reduce((n,c)=>n+c.folders.reduce((m,f)=>m+f.sopItems.length,0),0))
const totalCards = computed(() => store.data.collections.reduce((n,c)=>n+c.folders.reduce((m,f)=>m+f.sopItems.reduce((k,s)=>k+s.actionCards.length,0),0),0))

function openDir() { window.electronAPI?.openDataDir() }

async function changeDataDir(dir: string) {
  showDirPicker.value = false
  if (!window.electronAPI || !dir) return
  changingDir.value = true
  try {
    const result = await window.electronAPI.setDataDir(dir, JSON.parse(JSON.stringify(store.data)))
    if (result && result.ok) {
      // Update local display immediately
      localDataPath.value = result.path || dir
      // Also update store
      store.setDataPath(result.path || dir)
      store.toast(`✓ 数据目录已更改为: ${dir}`)
    } else {
      store.toast('❌ 更改失败: ' + (result?.msg || '未知错误'), 'error')
    }
  } catch (e) {
    store.toast('❌ 更改失败: ' + String(e), 'error')
  } finally {
    changingDir.value = false
  }
}

async function doExport(dir: string) {
  showExportPicker.value = false
  if (!window.electronAPI || !dir) return
  exporting.value = true
  store.toast('正在导出，请稍候…', 'info')
  try {
    const result = await window.electronAPI.exportData(JSON.parse(JSON.stringify(store.data)), dir)
    if (result && result.status === 'ok') {
      store.toast(`✓ 导出成功！已保存到: ${result.path}`)
      emit('close')
    } else {
      store.toast('❌ 导出失败: ' + (result?.message || '未知错误'), 'error')
    }
  } catch (e) {
    store.toast('❌ 导出出错: ' + String(e), 'error')
  } finally {
    exporting.value = false
  }
}

async function doImport(filePath: string) {
  showImportPicker.value = false
  if (!window.electronAPI || !filePath) return
  store.toast('正在导入…', 'info')
  try {
    const d = await window.electronAPI.importData(filePath)
    if (d) {
      store.data = d
      await store.saveData()
      store.toast('✓ 数据导入成功！')
      emit('close')
    } else {
      store.toast('❌ 导入失败，文件格式有误', 'error')
    }
  } catch (e) {
    store.toast('❌ 导入出错: ' + String(e), 'error')
  }
}
</script>

<style scoped>
.srow  { display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 18px;border-bottom:1px solid var(--border-sub); }
.stitle { font-size:13px;color:var(--text-pri);font-weight:500; }
.sdesc  { font-size:11px;color:var(--text-mut);margin-top:2px; }
</style>
