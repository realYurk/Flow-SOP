<template>
  <div style="margin-bottom:1px;">
    <!-- Folder row -->
    <div
      style="display:flex;align-items:center;gap:5px;padding:4px 6px;border-radius:5px;cursor:pointer;user-select:none;transition:background .1s;"
      @mouseenter="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-hover)'"
      @mouseleave="e=>(e.currentTarget as HTMLElement).style.background=''"
      @click="open=!open"
      @contextmenu.prevent="folderCtx.show($event)"
    >
      <svg
        :style="`transform:rotate(${open?90:0}deg);transition:transform .15s;flex-shrink:0;color:var(--text-mut)`"
        width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
      ><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
      <svg style="flex-shrink:0;color:var(--text-mut)" width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
      </svg>
      <span style="flex:1;font-size:12px;color:var(--text-sec);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        {{ folder.name }}
      </span>
    </div>

    <!-- SOP items (no inline "+ 新建 SOP" - all via right-click) -->
    <div v-if="open" style="margin-left:10px;">
      <div
        v-for="sop in folder.sopItems" :key="sop.id"
        style="display:flex;align-items:center;gap:5px;padding:4px 6px;border-radius:5px;cursor:pointer;user-select:none;transition:all .1s;"
        :style="store.activeSopId===sop.id ? 'background:var(--bg-active);' : ''"
        @mouseenter="e=>{ if(store.activeSopId!==sop.id)(e.currentTarget as HTMLElement).style.background='var(--bg-hover)' }"
        @mouseleave="e=>{ if(store.activeSopId!==sop.id)(e.currentTarget as HTMLElement).style.background='' }"
        @click="store.activeSopId=sop.id"
        @contextmenu.prevent="sopCtx.show($event, sop.id, sop.title)"
      >
        <span
          style="width:5px;height:5px;border-radius:50%;flex-shrink:0;transition:background .15s;"
          :style="store.activeSopId===sop.id ? 'background:#6366f1' : 'background:var(--border-str)'"
        />
        <span
          style="flex:1;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
          :style="store.activeSopId===sop.id ? 'color:var(--text-acc)' : 'color:var(--text-sec)'"
        >{{ sop.title }}</span>
        <span v-if="doneCount(sop)" style="font-size:10px;color:#22c55e;flex-shrink:0;">
          {{ doneCount(sop) }}/{{ sop.actionCards.length }}
        </span>
      </div>
    </div>

    <!-- Context menus -->
    <ContextMenu
      v-if="folderCtx.visible"
      :x="folderCtx.x" :y="folderCtx.y"
      :items="folderMenuItems"
      @close="folderCtx.visible=false"
    />
    <ContextMenu
      v-if="sopCtx.visible"
      :x="sopCtx.x" :y="sopCtx.y"
      :items="sopMenuItems"
      @close="sopCtx.visible=false"
    />

    <!-- Inline input modals -->
    <InlineInputModal
      v-if="modal.type==='newSop'"
      title="新建 SOP"
      label="SOP 标题"
      placeholder="例：快速构建 JWT 登录模块"
      @confirm="v=>{ const s=store.createSopItem(folder.id,v); store.activeSopId=s.id; open=true; closeModal() }"
      @cancel="closeModal"
    />
    <InlineInputModal
      v-if="modal.type==='renameFolder'"
      title="重命名 Folder"
      label="新名称"
      :initial="folder.name"
      @confirm="v=>{ store.renameFolder(collectionId, folder.id, v); closeModal() }"
      @cancel="closeModal"
    />
    <InlineInputModal
      v-if="modal.type==='renameSop'"
      title="重命名 SOP"
      label="新标题"
      :initial="sopCtx.sopTitle"
      @confirm="v=>{ store.updateSopItem(sopCtx.sopId, { title: v }); closeModal() }"
      @cancel="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useSopStore } from '@/stores/sop'
import type { Folder, SopItem } from '@/types'
import ContextMenu      from '@/components/ContextMenu.vue'
import InlineInputModal from '@/components/modals/InlineInputModal.vue'

const props = defineProps<{ folder: Folder; collectionId: string }>()
const store = useSopStore()
const open  = ref(true)

const folderCtx = reactive({
  visible: false, x: 0, y: 0,
  show(e: MouseEvent) { folderCtx.x = e.clientX; folderCtx.y = e.clientY; folderCtx.visible = true }
})
const sopCtx = reactive({
  visible: false, x: 0, y: 0, sopId: '', sopTitle: '',
  show(e: MouseEvent, id: string, title: string) {
    sopCtx.sopId = id; sopCtx.sopTitle = title
    sopCtx.x = e.clientX; sopCtx.y = e.clientY; sopCtx.visible = true
  }
})
const modal = reactive({ type: '' as '' | 'newSop' | 'renameFolder' | 'renameSop' })
function closeModal() { modal.type = '' }

function doneCount(sop: SopItem) { return sop.actionCards.filter(c => c.completed).length }

const folderMenuItems = [
  { label: '📄  新建 SOP',  action: () => { modal.type = 'newSop' } },
  { label: '✏  重命名',    action: () => { modal.type = 'renameFolder' } },
  { divider: true },
  {
    label: '🗑  删除', danger: true,
    action: () => {
      if (window.confirm(`确定删除 Folder "${props.folder.name}"？`))
        store.deleteFolder(props.collectionId, props.folder.id)
    }
  },
]

const sopMenuItems = [
  { label: '✏  重命名', action: () => { modal.type = 'renameSop' } },
  { divider: true },
  {
    label: '🗑  删除', danger: true,
    action: () => {
      const s = store.findSop(sopCtx.sopId)
      if (window.confirm(`确定删除 "${s?.title}"？`))
        store.deleteSopItem(sopCtx.sopId)
    }
  },
]
</script>
