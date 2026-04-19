<template>
  <Teleport to="body">
    <div
      style="position:fixed;inset:0;z-index:61;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.7);"
      @mousedown.self="$emit('cancel')"
    >
      <div
        class="animate-scale-in"
        style="background:var(--bg-panel);border:1px solid var(--border-def);border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.8);width:600px;max-width:100%;height:540px;display:flex;flex-direction:column;overflow:hidden;"
      >
        <!-- Header -->
        <div style="display:flex;align-items:center;gap:10px;padding:13px 16px;border-bottom:1px solid var(--border-sub);flex-shrink:0;">
          <span style="font-size:18px;">📥</span>
          <span style="font-size:13px;font-weight:600;color:var(--text-pri);">选择要导入的数据文件</span>
          <div style="flex:1"/>
          <button @click="$emit('cancel')" style="background:none;border:none;color:var(--text-mut);cursor:pointer;font-size:16px;padding:2px 5px;">✕</button>
        </div>

        <!-- Toolbar -->
        <div style="display:flex;align-items:center;gap:6px;padding:8px 12px;background:var(--bg-raised);border-bottom:1px solid var(--border-sub);flex-shrink:0;">
          <button
            :disabled="!canGoUp"
            style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:5px;border:1px solid var(--border-def);background:var(--bg-raised);cursor:pointer;flex-shrink:0;font-size:13px;"
            :style="canGoUp ? 'color:var(--text-sec)' : 'color:var(--border-str);cursor:not-allowed'"
            @click="goUp"
          >←</button>

          <input
            v-model="pathInput"
            style="flex:1;background:var(--bg-panel);border:1px solid var(--border-def);border-radius:5px;color:var(--text-pri);font-size:11px;font-family:monospace;padding:5px 8px;outline:none;min-width:0;"
            placeholder="输入目录路径后按 Enter"
            @keydown.enter="navigateToInput"
            @focus="e=>(e.target as HTMLElement).style.borderColor='#6366f180'"
            @blur="e=>(e.target as HTMLElement).style.borderColor='var(--border-def)'"
          />

          <div v-if="drives.length > 1" style="display:flex;gap:3px;flex-shrink:0;">
            <button
              v-for="d in drives" :key="d.path"
              style="padding:3px 7px;border-radius:4px;border:1px solid var(--border-def);font-size:11px;font-family:monospace;cursor:pointer;transition:all .1s;background:var(--bg-raised);white-space:nowrap;"
              :style="currentDrive===d.path ? 'background:#6366f120;border-color:#6366f1;color:#818cf8' : 'color:var(--text-sec)'"
              @click="navTo(d.path)"
            >{{ d.name.replace(':\\','') }}</button>
          </div>
        </div>

        <!-- File listing -->
        <div style="flex:1;overflow-y:auto;padding:4px 6px;">
          <div v-if="loading" style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-mut);font-size:13px;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
              <div style="width:24px;height:24px;border:2px solid #6366f130;border-top-color:#6366f1;border-radius:50%;animation:spin .7s linear infinite;"/>
              <span>读取中…</span>
            </div>
          </div>
          <div v-else-if="err" style="padding:16px;color:#ef4444;font-size:12px;background:#ef444410;border-radius:6px;margin:6px;">
            ⚠️ {{ err }}
          </div>
          <div v-else>
            <div
              v-for="entry in sortedEntries" :key="entry.path"
              style="display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:6px;cursor:pointer;user-select:none;transition:background .08s;"
              :style="selectedFile===entry.path ? 'background:#6366f120;' : ''"
              @mouseenter="e=>{ if(selectedFile!==entry.path)(e.currentTarget as HTMLElement).style.background='var(--bg-hover)' }"
              @mouseleave="e=>{ if(selectedFile!==entry.path)(e.currentTarget as HTMLElement).style.background='transparent' }"
              @click="entry.isDir ? null : selectedFile=entry.path"
              @dblclick="entry.isDir ? navTo(entry.path) : confirmSelect(entry.path)"
            >
              <span style="font-size:16px;flex-shrink:0;line-height:1;">{{ entry.isDir ? '📁' : '📄' }}</span>
              <span
                style="flex:1;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
                :style="entry.isDir ? 'color:var(--text-pri)' : entry.name.endsWith('.json') ? 'color:#22c55e;font-weight:500' : 'color:var(--text-mut)'"
              >{{ entry.name }}</span>
              <span v-if="!entry.isDir && entry.name.endsWith('.json')" style="font-size:10px;color:#22c55e;font-family:monospace;flex-shrink:0;background:#22c55e15;padding:1px 5px;border-radius:3px;">JSON</span>
              <span v-if="entry.isDir" style="font-size:10px;color:var(--text-mut);flex-shrink:0;">双击进入</span>
            </div>
            <div v-if="sortedEntries.length === 0" style="text-align:center;padding:32px;color:var(--text-mut);font-size:12px;">
              <div style="font-size:28px;opacity:.3;margin-bottom:8px;">📂</div>
              <div>当前目录为空</div>
            </div>
          </div>
        </div>

        <!-- Selected file display -->
        <div style="padding:8px 12px;background:var(--bg-raised);border-top:1px solid var(--border-sub);flex-shrink:0;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:10px;color:var(--text-mut);flex-shrink:0;">选中文件：</span>
            <div style="flex:1;font-size:11px;font-family:monospace;background:var(--bg-panel);padding:4px 8px;border-radius:4px;border:1px solid var(--border-sub);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
              :style="selectedFile ? 'color:#22c55e' : 'color:var(--text-mut)'"
            >{{ selectedFile || '（点击 JSON 文件选中）' }}</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-top:1px solid var(--border-sub);flex-shrink:0;">
          <button @click="$emit('cancel')" style="padding:6px 14px;border-radius:6px;border:1px solid var(--border-def);background:transparent;color:var(--text-sec);font-size:12px;cursor:pointer;">取消</button>
          <div style="flex:1"/>
          <button
            style="padding:6px 20px;border-radius:6px;background:#6366f1;color:#fff;border:1px solid #6366f1;font-size:12px;font-weight:600;cursor:pointer;"
            :style="!selectedFile ? 'opacity:.4;cursor:not-allowed' : ''"
            :disabled="!selectedFile"
            @click="confirmSelect(selectedFile)"
          >✓ 导入此文件</button>
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
const selectedFile = ref('')
const pathInput    = ref('')
const allEntries   = ref<FsEntry[]>([])
const drives       = ref<FsEntry[]>([])
const loading      = ref(false)
const err          = ref('')
const sep          = ref('\\')

// Show dirs + json files only
const sortedEntries = computed(() => [
  ...allEntries.value.filter(e => e.isDir).sort((a,b) => a.name.localeCompare(b.name, 'zh')),
  ...allEntries.value.filter(e => !e.isDir && e.name.endsWith('.json')).sort((a,b) => a.name.localeCompare(b.name)),
])

const canGoUp = computed(() => {
  const p = currentPath.value
  if (!p) return false
  if (sep.value === '\\') return p.replace(/\\/g,'').length > 1
  return p !== '/'
})

const currentDrive = computed(() => {
  if (sep.value !== '\\') return ''
  const m = currentPath.value.match(/^([A-Z]:\\)/i)
  return m ? m[1] : ''
})

async function navTo(p: string) {
  if (!p) return
  loading.value = true
  err.value = ''
  currentPath.value = p
  pathInput.value   = p
  try {
    allEntries.value = await window.electronAPI!.fsReaddir(p)
  } catch (e) {
    err.value = `无法读取：${String(e)}`
    allEntries.value = []
  } finally {
    loading.value = false
  }
}

function goUp() {
  const p = currentPath.value
  const s = sep.value
  if (!p) return
  if (s === '\\') {
    const trimmed = p.endsWith('\\') ? p.slice(0,-1) : p
    const idx = trimmed.lastIndexOf('\\')
    navTo(idx <= 1 ? p.slice(0,3) : trimmed.slice(0, idx+1))
  } else {
    const trimmed = p.endsWith('/') && p.length > 1 ? p.slice(0,-1) : p
    const idx = trimmed.lastIndexOf('/')
    navTo(idx <= 0 ? '/' : trimmed.slice(0, idx))
  }
}

function navigateToInput() {
  const p = pathInput.value.trim()
  if (p) navTo(p)
}

function confirmSelect(p: string) {
  if (p) emit('confirm', p)
}

onMounted(async () => {
  if (!window.electronAPI) return
  sep.value    = await window.electronAPI.fsPathsep()
  drives.value = await window.electronAPI.fsRoots()
  const home   = await window.electronAPI.fsHomedir()
  await navTo(home)
})
</script>
