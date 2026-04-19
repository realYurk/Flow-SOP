<template>
  <div
    style="display:flex;flex-direction:column;height:100vh;overflow:hidden;"
    :style="`background:var(--bg-base);color:var(--text-pri);`"
  >
    <TitleBar />
    <div style="flex:1;display:flex;overflow:hidden;position:relative;">
      <Sidebar />
      <main style="flex:1;display:flex;overflow:hidden;">
        <WorkspaceView />
      </main>
    </div>
    <FloatingToolbar />
    <ToastStack />
    <SettingsModal v-if="store.showSettings" @close="store.showSettings=false" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useSopStore } from '@/stores/sop'
import TitleBar      from '@/components/TitleBar.vue'
import Sidebar       from '@/components/Sidebar.vue'
import WorkspaceView from '@/components/WorkspaceView.vue'
import FloatingToolbar from '@/components/FloatingToolbar.vue'
import ToastStack    from '@/components/ToastStack.vue'
import SettingsModal from '@/components/modals/SettingsModal.vue'

const store = useSopStore()

onMounted(async () => {
  store.initTheme()
  await store.loadData()
  window.electronAPI?.onExternalChange(d => store.applyExternalData(d))
})
onUnmounted(() => { window.electronAPI?.removeExternalChangeListener() })
</script>
