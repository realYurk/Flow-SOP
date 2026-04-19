<template>
  <div style="margin-bottom:2px;">
    <!-- Collection header -->
    <div
      style="display:flex;align-items:center;gap:6px;padding:5px 6px;border-radius:6px;cursor:pointer;user-select:none;transition:background .1s;"
      @mouseenter="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-hover)'"
      @mouseleave="e=>(e.currentTarget as HTMLElement).style.background=''"
      @click="open=!open"
      @contextmenu.prevent="ctx.show($event)"
    >
      <svg
        :style="`transform:rotate(${open?90:0}deg);transition:transform .15s;flex-shrink:0;color:var(--text-mut)`"
        width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
      ><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>

      <!-- Colored icon -->
      <span
        style="font-size:14px;line-height:1;flex-shrink:0;"
        :style="`color:${collection.color || '#6366f1'}`"
      >{{ collection.icon }}</span>

      <span style="flex:1;font-size:12px;font-weight:600;color:var(--text-sec);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        {{ collection.name }}
      </span>
      <span v-if="totalSops"
        style="font-size:10px;color:var(--text-mut);background:var(--bg-panel);padding:1px 5px;border-radius:99px;">
        {{ totalSops }}
      </span>
    </div>

    <!-- Folders -->
    <div v-if="open" style="margin-left:8px;">
      <FolderGroup
        v-for="f in collection.folders" :key="f.id"
        :folder="f" :collection-id="collection.id"
      />
    </div>

    <!-- Context menu -->
    <ContextMenu v-if="ctx.visible" :x="ctx.x" :y="ctx.y" :items="menuItems" @close="ctx.visible=false" />

    <!-- Modals -->
    <InlineInputModal
      v-if="modal==='newFolder'"
      title="新建 Folder" label="Folder 名称" placeholder="例：Auth Module"
      @confirm="v=>{ store.createFolder(collection.id, v); open=true; modal='' }"
      @cancel="modal=''"
    />
    <EditCollectionModal
      v-if="modal==='edit'"
      :collection="collection"
      @close="modal=''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useSopStore } from '@/stores/sop'
import type { Collection } from '@/types'
import FolderGroup          from '@/components/FolderGroup.vue'
import ContextMenu          from '@/components/ContextMenu.vue'
import InlineInputModal     from '@/components/modals/InlineInputModal.vue'
import EditCollectionModal  from '@/components/modals/EditCollectionModal.vue'

const props = defineProps<{ collection: Collection }>()
const store = useSopStore()
const open  = ref(true)
const modal = ref('')

const ctx = reactive({
  visible: false, x: 0, y: 0,
  show(e: MouseEvent) { ctx.x = e.clientX; ctx.y = e.clientY; ctx.visible = true }
})

const totalSops = computed(() =>
  props.collection.folders.reduce((n, f) => n + f.sopItems.length, 0)
)

const menuItems = [
  { label: '📁  新建 Folder',      action: () => { modal.value = 'newFolder' } },
  { label: '✏  编辑（名称/图标）', action: () => { modal.value = 'edit' } },
  { divider: true },
  {
    label: '🗑  删除', danger: true,
    action: () => {
      if (window.confirm(`确定删除 "${props.collection.name}" 及其所有内容？`))
        store.deleteCollection(props.collection.id)
    }
  },
]
</script>
