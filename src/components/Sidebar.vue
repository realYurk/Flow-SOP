<template>
  <aside style="width:240px;min-width:200px;flex-shrink:0;background:var(--bg-base);border-right:1px solid var(--border-sub);display:flex;flex-direction:column;overflow:hidden;">

    <!-- Search box -->
    <div style="padding:8px 8px 6px;border-bottom:1px solid var(--border-sub);">
      <div style="position:relative;">
        <svg style="position:absolute;left:8px;top:50%;transform:translateY(-50%);color:var(--text-mut);pointer-events:none;" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          v-model="store.searchQuery"
          type="text"
          class="sop-input"
          style="padding-left:28px;font-size:12px;"
          placeholder="搜索 SOP..."
        />
      </div>

      <!-- Search results -->
      <div
        v-if="store.searchQuery && store.searchResults.length"
        style="margin-top:4px;background:var(--bg-panel);border:1px solid var(--border-def);border-radius:6px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.4);max-height:200px;overflow-y:auto;"
      >
        <div
          v-for="r in store.searchResults" :key="r.sop.id"
          style="padding:8px 10px;cursor:pointer;transition:background .1s;border-bottom:1px solid var(--border-sub);"
          @mouseenter="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-hover)'"
          @mouseleave="e=>(e.currentTarget as HTMLElement).style.background=''"
          @click="select(r.sop.id)"
        >
          <div style="font-size:12px;color:var(--text-pri);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ r.sop.title }}</div>
          <div style="font-size:10px;color:var(--text-mut);margin-top:2px;">{{ r.path }}</div>
        </div>
      </div>
      <div v-else-if="store.searchQuery && !store.searchResults.length"
        style="text-align:center;font-size:11px;color:var(--text-mut);padding:6px 0;">
        无结果
      </div>
    </div>

    <!-- Nav tree - right-click Collection header for options -->
    <nav style="flex:1;overflow-y:auto;padding:6px;">
      <CollectionGroup
        v-for="col in store.data.collections"
        :key="col.id"
        :collection="col"
      />
      <div v-if="!store.data.collections.length"
        style="text-align:center;padding:32px 8px;color:var(--text-mut);">
        <div style="font-size:28px;margin-bottom:8px;opacity:.4;">📁</div>
        <div style="font-size:12px;">右键可新建条目</div>
        <div style="font-size:11px;margin-top:4px;opacity:.6;">或点击下方新建 Collection</div>
      </div>
    </nav>

    <!-- Footer: new collection -->
    <div style="padding:8px;border-top:1px solid var(--border-sub);">
      <button
        style="width:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:7px;border-radius:6px;border:1px dashed var(--border-def);background:transparent;color:var(--text-mut);font-size:12px;cursor:pointer;transition:all .15s;"
        @mouseenter="e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor='#6366f1'; el.style.color='#818cf8' }"
        @mouseleave="e=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor='var(--border-def)'; el.style.color='var(--text-mut)' }"
        @click="showNewCol=true"
      >
        <span style="font-size:15px;line-height:1;">+</span>
        <span>新建 Collection</span>
      </button>
    </div>

    <NewCollectionModal v-if="showNewCol" @close="showNewCol=false" />
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSopStore } from '@/stores/sop'
import CollectionGroup    from '@/components/CollectionGroup.vue'
import NewCollectionModal from '@/components/modals/NewCollectionModal.vue'

const store      = useSopStore()
const showNewCol = ref(false)

function select(id: string) {
  store.activeSopId = id
  store.searchQuery = ''
}
</script>
