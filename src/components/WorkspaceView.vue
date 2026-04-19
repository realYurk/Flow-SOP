<template>
  <!-- Empty state -->
  <div v-if="!store.activeSop" style="flex:1;display:flex;align-items:center;justify-content:center;background:var(--bg-base);">
    <div style="text-align:center;user-select:none;">
      <div style="font-size:52px;opacity:.1;margin-bottom:14px;">⚡</div>
      <div style="font-size:14px;color:var(--text-mut);font-weight:500;">从左侧选择一个 SOP</div>
      <div style="font-size:12px;color:var(--text-mut);margin-top:4px;opacity:.6;">或右键新建一个 Collection 开始</div>
    </div>
  </div>

  <!-- Workspace -->
  <div v-else style="flex:1;display:flex;flex-direction:column;overflow:hidden;background:var(--bg-base);">

    <!-- Top bar -->
    <div style="display:flex;align-items:center;gap:10px;padding:10px 20px;border-bottom:1px solid var(--border-sub);flex-shrink:0;">
      <div style="flex:1;min-width:0;">
        <h1 style="font-size:15px;font-weight:700;color:var(--text-pri);margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          {{ store.activeSop.title }}
        </h1>
        <div v-if="store.completionStats" style="display:flex;align-items:center;gap:8px;margin-top:4px;">
          <div style="height:3px;width:80px;background:var(--bg-panel);border-radius:99px;overflow:hidden;">
            <div style="height:100%;background:#22c55e;border-radius:99px;transition:width .4s;" :style="`width:${store.completionStats.pct}%`"/>
          </div>
          <span style="font-size:11px;color:var(--text-mut);">{{ store.completionStats.done }}/{{ store.completionStats.total }} 已完成</span>
        </div>
      </div>

      <button
        style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:6px;background:transparent;border:none;color:var(--text-mut);cursor:pointer;"
        @mouseenter="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-hover)'"
        @mouseleave="e=>(e.currentTarget as HTMLElement).style.background='transparent'"
        @click="resetDone" title="重置进度"
      >
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
      </button>

      <button
        style="display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:6px;font-size:12px;background:transparent;color:var(--text-sec);border:1px solid transparent;cursor:pointer;transition:all .15s;"
        @mouseenter="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-hover)'"
        @mouseleave="e=>(e.currentTarget as HTMLElement).style.background='transparent'"
        @click="showEditSop=true"
      >
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
        编辑 SOP
      </button>

      <button
        style="display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:6px;font-size:12px;font-weight:500;background:#6366f1;color:#fff;border:1px solid #6366f1;cursor:pointer;transition:background .15s;"
        @mouseenter="e=>(e.currentTarget as HTMLElement).style.background='#4f46e5'"
        @mouseleave="e=>(e.currentTarget as HTMLElement).style.background='#6366f1'"
        @click="openAddCard(null)"
      >
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        新增卡片
      </button>
    </div>

    <!-- Body: two columns -->
    <div style="flex:1;overflow:hidden;display:flex;position:relative;">

      <!-- Left: scrollable -->
      <div style="flex:1;overflow-y:auto;min-width:0;">

        <MermaidPanel :source="store.activeSop.mermaidSource" @node-click="scrollToCard" />

        <VariablesBar
          v-if="Object.keys(store.activeSop.variables).length"
          :variables="store.activeSop.variables"
          :sop-id="store.activeSop.id"
        />

        <!-- Cards -->
        <div style="padding:0 16px 80px;">
          <div style="display:flex;align-items:center;gap:10px;padding:12px 0 8px;">
            <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-mut);">动作卡片</span>
            <div style="flex:1;height:1px;background:var(--border-sub);"/>
            <span style="font-size:11px;color:var(--text-mut);">{{ store.activeSop.actionCards.length }} 步骤</span>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px;">
            <ActionCard
              v-for="card in store.activeSop.actionCards" :key="card.id"
              :card="card"
              :sop-id="store.activeSop.id"
              :variables="store.activeSop.variables"
              :is-pinned="(store.activeSop.pinnedCardIds ?? []).includes(card.id)"
              :ref="(el: any) => { if (el) cardRefs[card.id] = el }"
            />
            <div v-if="!store.activeSop.actionCards.length"
              style="display:flex;flex-direction:column;align-items:center;padding:40px;border:1px dashed var(--border-def);border-radius:8px;">
              <div style="font-size:28px;opacity:.3;margin-bottom:8px;">📋</div>
              <div style="font-size:13px;color:var(--text-mut);">还没有动作卡片</div>
              <button
                style="margin-top:12px;display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:6px;font-size:12px;font-weight:500;background:#6366f1;color:#fff;border:1px solid #6366f1;cursor:pointer;"
                @click="openAddCard(null)"
              >＋ 新增第一张卡片</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: pinned panel -->
      <div
        v-if="showPinPanel && pinnedCards.length"
        style="width:300px;flex-shrink:0;border-left:1px solid var(--border-sub);background:var(--bg-raised);display:flex;flex-direction:column;overflow:hidden;"
      >
        <div style="display:flex;align-items:center;gap:8px;padding:9px 12px;border-bottom:1px solid var(--border-sub);flex-shrink:0;">
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-mut);">📌 固定卡片</span>
          <div style="flex:1"/>
          <button
            style="width:22px;height:22px;display:flex;align-items:center;justify-content:center;border-radius:4px;background:transparent;border:none;color:var(--text-mut);cursor:pointer;font-size:12px;"
            @click="showPinPanel=false"
          >✕</button>
        </div>
        <div style="flex:1;overflow-y:auto;padding:8px;">
          <div style="display:flex;flex-direction:column;gap:6px;">
            <ActionCard
              v-for="card in pinnedCards" :key="card.id"
              :card="card"
              :sop-id="store.activeSop!.id"
              :variables="store.activeSop!.variables"
              :is-pinned="true"
              :compact="true"
            />
          </div>
        </div>
      </div>

      <button
        v-if="!showPinPanel && pinnedCards.length"
        style="position:absolute;right:0;top:50%;transform:translateY(-50%);width:18px;height:44px;background:var(--bg-panel);border:1px solid var(--border-def);border-right:none;border-radius:5px 0 0 5px;cursor:pointer;color:var(--text-mut);font-size:10px;display:flex;align-items:center;justify-content:center;z-index:5;"
        @click="showPinPanel=true"
      >📌</button>
    </div>
  </div>

  <!-- Modals: always pass sopId explicitly -->
  <EditSopModal  v-if="showEditSop"  @close="showEditSop=false" />
  <EditCardModal
    v-if="showAddCard"
    :card="editCardData"
    :sop-id="currentSopId"
    @close="closeCardModal"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, provide } from 'vue'
import { useSopStore } from '@/stores/sop'
import MermaidPanel  from '@/components/MermaidPanel.vue'
import VariablesBar  from '@/components/VariablesBar.vue'
import ActionCard    from '@/components/ActionCard.vue'
import EditSopModal  from '@/components/modals/EditSopModal.vue'
import EditCardModal from '@/components/modals/EditCardModal.vue'
import type { ActionCard as AC } from '@/types'

const store        = useSopStore()
const showEditSop  = ref(false)
const showAddCard  = ref(false)
const showPinPanel = ref(true)
const editCardData = ref<AC | null>(null)
const cardRefs     = ref<Record<string, any>>({})

// Snapshot the sopId at the moment the modal opens
// so it doesn't become null if user clicks elsewhere
const currentSopId = ref<string>('')

const pinnedCards = computed(() => {
  const sop = store.activeSop
  if (!sop) return []
  return (sop.pinnedCardIds ?? [])
    .map(id => sop.actionCards.find(c => c.id === id))
    .filter(Boolean) as AC[]
})

watch(() => store.activeSopId, () => { cardRefs.value = {} })

function openAddCard(card: AC | null) {
  // Capture sopId at open time - never rely on it later
  const sid = store.activeSopId
  if (!sid) return
  currentSopId.value = sid
  editCardData.value = card
  showAddCard.value  = true
}

function closeCardModal() {
  showAddCard.value  = false
  editCardData.value = null
  // Do NOT reset currentSopId here
}

// Provide to ActionCard for edit button
provide('openEditCard', (card: AC) => openAddCard(card))

function scrollToCard(nodeId: string) {
  const sop = store.activeSop
  if (!sop || !sop.actionCards.length) return
  const card = sop.actionCards[0]
  const el = cardRefs.value[card.id]?.$el ?? cardRefs.value[card.id]
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function resetDone() {
  if (!store.activeSop) return
  if (!window.confirm('重置所有卡片的完成状态？')) return
  for (const c of store.activeSop.actionCards)
    if (c.completed) store.toggleCard(store.activeSop.id, c.id)
  store.toast('进度已重置', 'info')
}
</script>
