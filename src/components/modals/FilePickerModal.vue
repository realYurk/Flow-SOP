<template>
  <Teleport to="body">
    <div
      style="position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.7);"
      @mousedown.self="$emit('cancel')"
    >
      <div
        class="animate-scale-in"
        style="background:var(--bg-panel);border:1px solid var(--border-def);border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.8);width:600px;max-width:100%;height:540px;display:flex;flex-direction:column;overflow:hidden;"
      >
        <!-- ── Header ── -->
        <div style="display:flex;align-items:center;gap:10px;padding:13px 16px;border-bottom:1px solid var(--border-sub);flex-shrink:0;">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#6366f1" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
          <span style="font-size:13px;font-weight:600;color:var(--text-pri);">{{ title }}</span>
          <div style="flex:1"/>
          <button @click="$emit('cancel')" style="background:none;border:none;color:var(--text-mut);cursor:pointer;font-size:16px;line-height:1;padding:2px 5px;">✕</button>
        </div>

        <!-- ── Toolbar: back + path input + drives ── -->
        <div style="display:flex;align-items:center;gap:6px;padding:8px 12px;background:var(--bg-raised);border-bottom:1px solid var(--border-sub);flex-shrink:0;">
          <!-- Back button -->
          <button
            :disabled="!canGoUp"
            style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:5px;border:1px solid var(--border-def);background:var(--bg-raised);cursor:pointer;flex-shrink:0;font-size:13px;"
            :style="canGoUp ? 'color:var(--text-sec)' : 'color:var(--border-str);cursor:not-allowed'"
            @click="goUp"
            title="返回上级"
          >←</button>

          <!-- Editable path input -->
          <input
            v-model="pathInput"
            style="flex:1;background:var(--bg-panel);border:1px solid var(--border-def);border-radius:5px;color:var(--text-pri);font-size:11px;font-family:monospace;padding:5px 8px;outline:none;min-width:0;"
            placeholder="输入路径后按 Enter，例如 D:\Projects"
            @keydown.enter="navigateToInput"
            @focus="e=>(e.target as HTMLElement).style.borderColor='#6366f180'"
            @blur="e=>(e.target as HTMLElement).style.borderColor='var(--border-def)'"
          />

          <!-- Drive buttons (Windows) -->
          <div v-if="drives.length > 1" style="display:flex;gap:3px;flex-shrink:0;">
            <button
              v-for="d in drives" :key="d.path"
              style="padding:3px 7px;border-radius:4px;border:1px solid var(--border-def);font-size:11px;font-family:monospace;cursor:pointer;transition:all .1s;background:var(--bg-raised);white-space:nowrap;"
              :style="currentDrive===d.path ? 'background:#6366f120;border-color:#6366f1;color:#818cf8' : 'color:var(--text-sec)'"
              @click="navTo(d.path)"
              :title="'切换到 ' + d.name"
            >{{ d.name.replace(':\\','') }}</button>
          </div>
        </div>

        <!-- ── File listing ── -->
        <div style="flex:1;overflow-y:auto;padding:4px 6px;">
          <!-- Loading -->
          <div v-if="loading" style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-mut);font-size:13px;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
              <div style="width:24px;height:24px;border:2px solid #6366f130;border-top-color:#6366f1;border-radius:50%;animation:spin .7s linear infinite;"/>
              <span>读取中…</span>
            </div>
          </div>

          <!-- Error -->
          <div v-else-if="err" style="padding:20px;color:#ef4444;font-size:12px;background:#ef444410;border-radius:6px;margin:6px;">
            ⚠️ {{ err }}
            <br/><span style="color:var(--text-mut);font-size:11px;margin-top:4px;display:block;">请在上方路径框手动输入目录路径</span>
          </div>

          <!-- Entries -->
          <div v-else>
            <div
              v-for="entry in sortedDirs" :key="entry.path"
              style="display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:6px;cursor:pointer;user-select:none;transition:background .08s;"
              :style="selectedPath===entry.path
                ? 'background:#6366f120;'
                : ''"
              @mouseenter="e=>{ if(selectedPath!==entry.path)(e.currentTarget as HTMLElement).style.background='var(--bg-hover)' }"
              @mouseleave="e=>{ if(selectedPath!==entry.path)(e.currentTarget as HTMLElement).style.background='transparent' }"
              @click="selectedPath = entry.path"
              @dblclick="navTo(entry.path)"
            >
              <span style="font-size:16px;flex-shrink:0;line-height:1;">📁</span>
              <span style="flex:1;font-size:12px;color:var(--text-pri);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ entry.name }}</span>
              <span style="font-size:10px;color:var(--text-mut);flex-shrink:0;">双击进入 →</span>
            </div>
            <div v-if="sortedDirs.length === 0" style="text-align:center;padding:32px;color:var(--text-mut);font-size:12px;">
              <div style="font-size:28px;margin-bottom:8px;opacity:.3;">📂</div>
              <div>该目录下没有子文件夹</div>
              <div style="margin-top:4px;opacity:.7;">可直接点击「选择此目录」使用当前目录</div>
            </div>
          </div>
        </div>

        <!-- ── Selected path display ── -->
        <div style="padding:8px 12px;background:var(--bg-raised);border-top:1px solid var(--border-sub);flex-shrink:0;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:10px;color:var(--text-mut);flex-shrink:0;">当前选择：</span>
            <div style="flex:1;font-size:11px;font-family:monospace;color:var(--text-pri);background:var(--bg-panel);padding:4px 8px;border-radius:4px;border:1px solid var(--border-sub);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              {{ selectedPath || currentPath || '未选择' }}
            </div>
          </div>
        </div>

        <!-- ── Footer ── -->
        <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-top:1px solid var(--border-sub);flex-shrink:0;">
          <button
            @click="$emit('cancel')"
            style="padding:6px 14px;border-radius:6px;border:1px solid var(--border-def);background:transparent;color:var(--text-sec);font-size:12px;cursor:pointer;"
          >取消</button>
          <div style="flex:1"/>
          <button
            style="padding:6px 20px;border-radius:6px;background:#6366f1;color:#fff;border:1px solid #6366f1;font-size:12px;font-weight:600;cursor:pointer;transition:background .15s;"
            @mouseenter="e=>(e.currentTarget as HTMLElement).style.background='#4f46e5'"
            @mouseleave="e=>(e.currentTarget as HTMLElement).style.background='#6366f1'"
            @click="confirm"
          >✓ 选择此目录</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{ title: string }>()
const emit  = defineEmits<{ confirm: [path: string]; cancel: [] }>()

interface FsEntry { name: string; isDir: boolean; path: string }

const currentPath  = ref('')
const selectedPath = ref('')
const pathInput    = ref('')
const allEntries   = ref<FsEntry[]>([])
const drives       = ref<FsEntry[]>([])
const loading      = ref(false)
const err          = ref('')
const sep          = ref('\\')

const sortedDirs = computed(() =>
  allEntries.value
    .filter(e => e.isDir)
    .sort((a, b) => a.name.localeCompare(b.name, 'zh'))
)

const canGoUp = computed(() => {
  const p = currentPath.value
  if (!p) return false
  if (sep.value === '\\') return p.replace(/\\/g,'').length > 1  // more than "C:"
  return p !== '/'
})

// Which drive letter is currently active (Windows)
const currentDrive = computed(() => {
  if (sep.value !== '\\') return ''
  const m = currentPath.value.match(/^([A-Z]:\\)/i)
  return m ? m[1] : ''
})

async function navTo(p: string) {
  if (!p) return
  loading.value = true
  err.value     = ''
  currentPath.value  = p
  selectedPath.value = p
  pathInput.value    = p
  try {
    const list = await window.electronAPI!.fsReaddir(p)
    allEntries.value = list
  } catch (e) {
    err.value = `无法读取目录：${String(e)}`
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
    // Windows: C:\foo\bar → C:\foo,  C:\foo → C:\,  C:\ → stay (show drives)
    const trimmed = p.endsWith('\\') ? p.slice(0, -1) : p
    const idx = trimmed.lastIndexOf('\\')
    if (idx < 0 || idx <= 1) {
      // At root like C:\ — navigate to drive root
      navTo(p.slice(0, 3))
    } else {
      navTo(trimmed.slice(0, idx + 1))
    }
  } else {
    const trimmed = p.endsWith('/') && p.length > 1 ? p.slice(0, -1) : p
    const idx = trimmed.lastIndexOf('/')
    navTo(idx <= 0 ? '/' : trimmed.slice(0, idx))
  }
}

function navigateToInput() {
  const p = pathInput.value.trim()
  if (p) navTo(p)
}

function confirm() {
  const p = (selectedPath.value || currentPath.value || pathInput.value).trim()
  if (p) emit('confirm', p)
}

onMounted(async () => {
  if (!window.electronAPI) {
    err.value = '仅在 Electron 桌面版中可用'
    return
  }
  sep.value = await window.electronAPI.fsPathsep()
  // Load drives list
  drives.value = await window.electronAPI.fsRoots()
  // Start at home directory
  const home = await window.electronAPI.fsHomedir()
  await navTo(home)
})
</script>

<style>
@keyframes spin { to { transform: rotate(360deg); } }
</style>
