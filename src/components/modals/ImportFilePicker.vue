<template>
  <Teleport to="body">
    <div style="position:fixed;inset:0;z-index:61;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.65);" @mousedown.self="$emit('cancel')">
      <div class="animate-scale-in" style="background:var(--bg-panel);border:1px solid var(--border-def);border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.7);width:100%;max-width:560px;display:flex;flex-direction:column;max-height:80vh;overflow:hidden;">

        <div style="display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border-sub);flex-shrink:0;">
          <span style="font-size:16px;">📥</span>
          <span style="font-size:13px;font-weight:600;color:var(--text-pri);">选择导入文件</span>
          <div style="flex:1"/>
          <button @click="$emit('cancel')" style="background:none;border:none;color:var(--text-mut);cursor:pointer;font-size:14px;">✕</button>
        </div>

        <!-- Path bar -->
        <div style="display:flex;align-items:center;gap:6px;padding:8px 14px;background:var(--bg-raised);border-bottom:1px solid var(--border-sub);flex-shrink:0;flex-wrap:wrap;">
          <button
            v-for="(seg,i) in breadcrumbs" :key="i"
            style="font-size:11px;font-family:monospace;color:var(--text-acc);background:none;border:none;cursor:pointer;padding:2px 4px;border-radius:4px;white-space:nowrap;"
            @click="navTo(seg.path)"
          >{{ seg.label }}</button>
        </div>

        <!-- File listing -->
        <div style="flex:1;overflow-y:auto;padding:6px;">
          <div v-if="loading" style="padding:32px;text-align:center;color:var(--text-mut);font-size:13px;animation:pulse 1s infinite;">读取中…</div>
          <div v-else>
            <div v-if="canGoUp"
              style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:6px;cursor:pointer;"
              @mouseenter="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-hover)'"
              @mouseleave="e=>(e.currentTarget as HTMLElement).style.background='transparent'"
              @click="goUp"
            ><span style="font-size:15px;">⬆</span><span style="font-size:12px;color:var(--text-sec);">上级目录</span></div>

            <div v-for="entry in entries" :key="entry.path"
              style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:6px;cursor:pointer;transition:background .1s;"
              :style="selectedFile===entry.path ? 'background:var(--bg-active)' : ''"
              @mouseenter="e=>{ if(selectedFile!==entry.path)(e.currentTarget as HTMLElement).style.background='var(--bg-hover)' }"
              @mouseleave="e=>{ if(selectedFile!==entry.path)(e.currentTarget as HTMLElement).style.background='transparent' }"
              @click="entry.isDir ? navTo(entry.path) : selectedFile=entry.path"
              @dblclick="entry.isDir ? navTo(entry.path) : confirmSelect(entry.path)"
            >
              <span style="font-size:15px;flex-shrink:0;">{{ entry.isDir ? '📁' : '📄' }}</span>
              <span style="font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;"
                :style="entry.isDir ? 'color:var(--text-pri)' : entry.name.endsWith('.json') ? 'color:#22c55e' : 'color:var(--text-mut)'"
              >{{ entry.name }}</span>
              <span v-if="!entry.isDir && entry.name.endsWith('.json')" style="font-size:10px;color:#22c55e;flex-shrink:0;">JSON</span>
            </div>
          </div>
        </div>

        <!-- Selected -->
        <div style="padding:10px 14px;background:var(--bg-raised);border-top:1px solid var(--border-sub);flex-shrink:0;">
          <div style="font-size:10px;color:var(--text-mut);margin-bottom:4px;">选中文件：</div>
          <div style="font-size:11px;font-family:monospace;color:var(--text-pri);background:var(--bg-panel);padding:6px 8px;border-radius:5px;border:1px solid var(--border-sub);word-break:break-all;">
            {{ selectedFile || '（未选择）' }}
          </div>
        </div>

        <div style="display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--border-sub);flex-shrink:0;">
          <button @click="$emit('cancel')" style="padding:6px 14px;border-radius:6px;border:1px solid var(--border-def);background:transparent;color:var(--text-sec);font-size:12px;cursor:pointer;">取消</button>
          <div style="flex:1"/>
          <button
            style="padding:6px 18px;border-radius:6px;background:#6366f1;color:#fff;border:1px solid #6366f1;font-size:12px;font-weight:500;cursor:pointer;"
            :style="!selectedFile ? 'opacity:.4;cursor:not-allowed' : ''"
            :disabled="!selectedFile"
            @click="confirmSelect(selectedFile)"
          >导入此文件</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits<{ confirm: [path: string]; cancel: [] }>()

interface FsEntry { name: string; isDir: boolean; path: string }

const currentPath  = ref('')
const entries      = ref<FsEntry[]>([])
const selectedFile = ref('')
const loading      = ref(false)
const sep          = ref('/')

const canGoUp = computed(() => {
  const p = currentPath.value
  if (!p) return false
  return sep.value === '\\' ? p.length > 3 : p !== '/'
})

const breadcrumbs = computed(() => {
  const p = currentPath.value
  const s = sep.value
  if (!p) return []
  const parts = p.split(s).filter(Boolean)
  const crumbs: { label: string; path: string }[] = []
  if (s === '\\') {
    let acc = ''
    for (const part of parts) { acc = acc ? acc+s+part : part+s; crumbs.push({label:part||acc,path:acc}) }
  } else {
    crumbs.push({label:'/',path:'/'})
    let acc = ''
    for (const part of parts) { acc=acc+'/'+part; crumbs.push({label:part,path:acc}) }
  }
  return crumbs
})

async function navTo(p: string) {
  loading.value = true
  currentPath.value = p
  try {
    const list = await window.electronAPI!.fsReaddir(p)
    // Show dirs first, then .json files only for import
    entries.value = [
      ...list.filter(e => e.isDir),
      ...list.filter(e => !e.isDir && e.name.endsWith('.json')),
    ]
  } finally { loading.value = false }
}

function goUp() {
  const p = currentPath.value, s = sep.value
  if (s==='\\') { const i=p.lastIndexOf('\\',p.length-2); navTo(i<=2?p.slice(0,3):p.slice(0,i)) }
  else { const i=p.lastIndexOf('/'); navTo(i<=0?'/':p.slice(0,i)) }
}

function confirmSelect(p: string) { if (p) emit('confirm', p) }

onMounted(async () => {
  if (!window.electronAPI) return
  sep.value = await window.electronAPI.fsPathsep()
  const home = await window.electronAPI.fsHomedir()
  await navTo(home)
})
</script>
