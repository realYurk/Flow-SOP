<template>
  <Teleport to="body">
    <div style="position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.65);" @mousedown.self="$emit('cancel')">
      <div class="animate-scale-in" style="background:var(--bg-panel);border:1px solid var(--border-def);border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.7);width:100%;max-width:560px;display:flex;flex-direction:column;overflow:hidden;max-height:80vh;">

        <!-- Header -->
        <div style="display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border-sub);flex-shrink:0;">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#6366f1" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
          <span style="font-size:13px;font-weight:600;color:var(--text-pri);">{{ title }}</span>
          <div style="flex:1"/>
          <button @click="$emit('cancel')" style="background:none;border:none;color:var(--text-mut);cursor:pointer;font-size:14px;padding:4px;">✕</button>
        </div>

        <!-- Current path bar -->
        <div style="display:flex;align-items:center;gap:6px;padding:8px 14px;background:var(--bg-raised);border-bottom:1px solid var(--border-sub);flex-shrink:0;flex-wrap:wrap;">
          <button
            v-for="(seg, i) in breadcrumbs" :key="i"
            style="font-size:11px;font-family:monospace;color:var(--text-acc);background:none;border:none;cursor:pointer;padding:2px 4px;border-radius:4px;white-space:nowrap;"
            @mouseenter="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-hover)'"
            @mouseleave="e=>(e.currentTarget as HTMLElement).style.background='none'"
            @click="navTo(seg.path)"
          >{{ seg.label }}</button>
        </div>

        <!-- Directory listing -->
        <div style="flex:1;overflow-y:auto;padding:6px;">
          <!-- Loading -->
          <div v-if="loading" style="display:flex;align-items:center;justify-content:center;padding:32px;color:var(--text-mut);font-size:13px;">
            <span style="animation:pulse 1s infinite;">读取中…</span>
          </div>
          <!-- Error -->
          <div v-else-if="err" style="padding:16px;color:#ef4444;font-size:12px;">{{ err }}</div>
          <!-- Entries -->
          <div v-else>
            <!-- Up button -->
            <div
              v-if="canGoUp"
              style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:6px;cursor:pointer;user-select:none;"
              @mouseenter="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-hover)'"
              @mouseleave="e=>(e.currentTarget as HTMLElement).style.background='transparent'"
              @click="goUp"
            >
              <span style="font-size:15px;">⬆</span>
              <span style="font-size:12px;color:var(--text-sec);">上级目录</span>
            </div>
            <!-- Directory entries (dirs only) -->
            <div
              v-for="entry in dirs" :key="entry.path"
              style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:6px;cursor:pointer;user-select:none;transition:background .1s;"
              :style="selectedPath===entry.path ? 'background:var(--bg-active);' : ''"
              @mouseenter="e=>{ if(selectedPath!==entry.path)(e.currentTarget as HTMLElement).style.background='var(--bg-hover)' }"
              @mouseleave="e=>{ if(selectedPath!==entry.path)(e.currentTarget as HTMLElement).style.background='transparent' }"
              @click="selectedPath=entry.path"
              @dblclick="navTo(entry.path)"
            >
              <span style="font-size:15px;flex-shrink:0;">📁</span>
              <span style="font-size:12px;color:var(--text-pri);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">{{ entry.name }}</span>
              <span style="font-size:10px;color:var(--text-mut);flex-shrink:0;">双击进入</span>
            </div>
            <div v-if="dirs.length===0 && !loading" style="padding:12px 10px;font-size:12px;color:var(--text-mut);">当前目录为空</div>
          </div>
        </div>

        <!-- Selected path display -->
        <div style="padding:10px 14px;background:var(--bg-raised);border-top:1px solid var(--border-sub);flex-shrink:0;">
          <div style="font-size:10px;color:var(--text-mut);margin-bottom:4px;">选择的目录：</div>
          <div style="font-size:11px;font-family:monospace;color:var(--text-pri);word-break:break-all;background:var(--bg-panel);padding:6px 8px;border-radius:5px;border:1px solid var(--border-sub);">
            {{ selectedPath || currentPath }}
          </div>
        </div>

        <!-- Footer -->
        <div style="display:flex;align-items:center;gap:8px;padding:12px 16px;border-top:1px solid var(--border-sub);flex-shrink:0;">
          <button @click="$emit('cancel')" style="padding:6px 14px;border-radius:6px;border:1px solid var(--border-def);background:transparent;color:var(--text-sec);font-size:12px;cursor:pointer;">取消</button>
          <div style="flex:1"/>
          <button
            style="padding:6px 18px;border-radius:6px;border:1px solid #6366f1;background:#6366f1;color:#fff;font-size:12px;font-weight:500;cursor:pointer;transition:background .15s;"
            @mouseenter="e=>(e.currentTarget as HTMLElement).style.background='#4f46e5'"
            @mouseleave="e=>(e.currentTarget as HTMLElement).style.background='#6366f1'"
            @click="confirm"
          >选择此目录</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps<{ title: string }>()
const emit  = defineEmits<{ confirm: [path: string]; cancel: [] }>()

interface FsEntry { name: string; isDir: boolean; path: string }

const currentPath  = ref('')
const selectedPath = ref('')
const entries      = ref<FsEntry[]>([])
const loading      = ref(false)
const err          = ref('')
const sep          = ref('/')

const dirs     = computed(() => entries.value.filter(e => e.isDir))
const canGoUp  = computed(() => {
  const p = currentPath.value
  if (!p) return false
  if (sep.value === '\\') return p.length > 3  // Windows: C:\ is root
  return p !== '/'
})

const breadcrumbs = computed(() => {
  const p = currentPath.value
  if (!p) return []
  const s = sep.value
  const parts = p.split(s).filter(Boolean)
  const crumbs: { label: string; path: string }[] = []
  if (s === '\\') {
    // Windows: C:\foo\bar
    let acc = ''
    for (const part of parts) {
      acc = acc ? acc + s + part : part + s
      crumbs.push({ label: part || acc, path: acc })
    }
  } else {
    crumbs.push({ label: '/', path: '/' })
    let acc = ''
    for (const part of parts) {
      acc = acc + '/' + part
      crumbs.push({ label: part, path: acc })
    }
  }
  return crumbs
})

async function navTo(p: string) {
  loading.value  = true
  err.value      = ''
  currentPath.value = p
  selectedPath.value = p
  try {
    const list = await window.electronAPI!.fsReaddir(p)
    entries.value = list
  } catch(e) {
    err.value = String(e)
  } finally {
    loading.value = false
  }
}

function goUp() {
  const p = currentPath.value
  const s = sep.value
  if (s === '\\') {
    const idx = p.lastIndexOf('\\', p.length - 2)
    if (idx <= 2) navTo(p.slice(0, 3))   // back to C:\
    else          navTo(p.slice(0, idx))
  } else {
    const idx = p.lastIndexOf('/')
    navTo(idx <= 0 ? '/' : p.slice(0, idx))
  }
}

function confirm() {
  emit('confirm', selectedPath.value || currentPath.value)
}

onMounted(async () => {
  if (!window.electronAPI) { err.value = '仅在 Electron 中可用'; return }
  sep.value = await window.electronAPI.fsPathsep()
  const home = await window.electronAPI.fsHomedir()
  await navTo(home)
  selectedPath.value = home
})
</script>
