<template>
  <div
    class="drag-region"
    style="display:flex;align-items:center;height:38px;padding:0 8px 0 14px;flex-shrink:0;background:var(--bg-base);border-bottom:1px solid var(--border-sub);"
    :style="isMac ? 'padding-left:80px' : ''"
  >
    <!-- Flow SOP Logo: flowing arrows icon -->
    <div class="no-drag" style="display:flex;align-items:center;gap:8px;margin-right:auto;">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Flow arrows representing SOP steps -->
        <rect x="1" y="4" width="5" height="5" rx="1.5" fill="#6366f1"/>
        <path d="M6 6.5H9.5" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M8.5 5L10 6.5L8.5 8" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="10" y="4" width="5" height="5" rx="1.5" fill="#818cf8"/>
        <path d="M15 6.5H18.5" stroke="#818cf8" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M17.5 5L19 6.5L17.5 8" stroke="#818cf8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Second row, shifted -->
        <path d="M3.5 9V12" stroke="#6366f180" stroke-width="1.5" stroke-linecap="round"/>
        <rect x="1" y="12" width="5" height="5" rx="1.5" fill="#4f46e5"/>
        <path d="M6 14.5H9.5" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M8.5 13L10 14.5L8.5 16" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="10" y="12" width="5" height="5" rx="1.5" fill="#a5b4fc"/>
        <path d="M12.5 9V12" stroke="#818cf880" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <span style="font-size:13px;font-weight:700;color:var(--text-pri);letter-spacing:-.3px;">Flow SOP</span>
    </div>

    <!-- Right controls -->
    <div class="no-drag" style="display:flex;align-items:center;gap:2px;">
      <span v-if="store.isSaving" style="font-size:10px;color:var(--text-mut);margin-right:6px;animation:pulse 1s infinite;">保存中…</span>

      <!-- Theme toggle -->
      <button class="tb-ctrl" :title="store.theme==='dark'?'切换浅色模式':'切换深色模式'" @click="store.toggleTheme()">
        <svg v-if="store.theme==='dark'" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
        <svg v-else width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
        </svg>
      </button>

      <!-- Settings -->
      <button class="tb-ctrl" title="设置" @click="store.showSettings=true">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </button>

      <!-- Window controls (non-Mac Electron) -->
      <template v-if="isElectron && !isMac">
        <div style="width:1px;height:16px;background:var(--border-sub);margin:0 4px;" />
        <button class="win-btn" title="最小化" @click="doMinimize">
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor"><rect width="10" height="1"/></svg>
        </button>
        <button class="win-btn" title="最大化 / 还原" @click="doMaximize">
          <svg v-if="!isMaximized" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2">
            <rect x="0.6" y="0.6" width="8.8" height="8.8"/>
          </svg>
          <svg v-else width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2">
            <rect x="2" y="0.6" width="7.4" height="7.4"/>
            <polyline points="0.6,2.6 0.6,9.4 7.4,9.4"/>
          </svg>
        </button>
        <button class="win-btn win-close" title="关闭" @click="doClose">
          <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" stroke-width="1.4">
            <line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/>
          </svg>
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSopStore } from '@/stores/sop'

const store      = useSopStore()
const isMac      = computed(() => navigator.platform.toUpperCase().includes('MAC'))
const isElectron = computed(() => !!window.electronAPI)
const isMaximized = ref(false)

async function doMinimize() { await window.electronAPI?.minimize() }
async function doMaximize() { await window.electronAPI?.maximize(); isMaximized.value = !isMaximized.value }
async function doClose()    { await window.electronAPI?.close() }
</script>

<style scoped>
.tb-ctrl {
  width:30px;height:30px;display:flex;align-items:center;justify-content:center;
  border-radius:6px;background:transparent;border:none;
  color:var(--text-mut);cursor:pointer;transition:all .15s;
}
.tb-ctrl:hover { background:var(--bg-hover);color:var(--text-pri); }
.win-btn {
  width:34px;height:38px;display:flex;align-items:center;justify-content:center;
  background:transparent;border:none;color:var(--text-mut);cursor:pointer;transition:background .12s;
}
.win-btn:hover        { background:var(--bg-hover);color:var(--text-pri); }
.win-close:hover      { background:#ef4444 !important;color:#fff !important; }
</style>
