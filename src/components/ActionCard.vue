<template>
  <div
    :id="`card-${card.id}`"
    style="border-radius:7px;border:1px solid var(--border-def);background:var(--bg-raised);transition:border-color .15s;overflow:hidden;"
    :style="card.completed ? 'opacity:.42' : ''"
    @mouseenter="e=>(e.currentTarget as HTMLElement).style.borderColor='var(--border-str)'"
    @mouseleave="e=>(e.currentTarget as HTMLElement).style.borderColor='var(--border-def)'"
  >
    <!-- Header -->
    <div style="display:flex;align-items:center;gap:8px;padding:9px 12px;border-bottom:1px solid var(--border-sub);">
      <!-- Checkbox -->
      <button
        style="width:16px;height:16px;border-radius:4px;border:1.5px solid;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;transition:all .15s;background:transparent;"
        :style="card.completed ? 'background:#22c55e;border-color:#22c55e' : 'border-color:var(--border-str)'"
        @click="store.toggleCard(sopId, card.id)"
      >
        <svg v-if="card.completed" width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="3.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      </button>

      <!-- Title -->
      <span
        style="flex:1;font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
        :style="card.completed ? 'text-decoration:line-through;color:var(--text-mut)' : 'color:var(--text-pri)'"
      >{{ card.title }}</span>

      <!-- Action buttons (show on hover) -->
      <div class="card-actions" style="display:flex;gap:2px;opacity:0;transition:opacity .15s;">
        <button class="btn-icon" style="width:24px;height:24px;"
          :style="isPinned ? 'color:#f59e0b' : ''"
          :title="isPinned ? '取消固定' : '固定到右侧'"
          @click="store.togglePinCard(sopId, card.id)">
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24"
            :stroke="isPinned ? '#f59e0b' : 'currentColor'" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
          </svg>
        </button>
        <button class="btn-icon" style="width:24px;height:24px;" title="编辑" @click="doEdit">
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </button>
        <button class="btn-icon" style="width:24px;height:24px;" title="删除"
          @mouseenter="e=>(e.currentTarget as HTMLElement).style.color='#ef4444'"
          @mouseleave="e=>(e.currentTarget as HTMLElement).style.color=''"
          @click="doDelete">
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Code block with syntax highlighting -->
    <CodeBlock
      v-if="resolvedCode && !(compact && resolvedCode.length > 200)"
      :code="resolvedCode"
      :language="card.language"
      :compact="compact"
      @copy="store.toast('代码已复制')"
    />

    <!-- Notes -->
    <div
      v-if="card.notes && !compact"
      style="display:flex;align-items:flex-start;gap:8px;padding:8px 12px;background:#f59e0b08;border-top:1px solid #f59e0b18;"
    >
      <span style="flex-shrink:0;margin-top:1px;">💡</span>
      <p style="margin:0;font-size:11.5px;color:#d97706;line-height:1.5;">{{ card.notes }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { useSopStore } from '@/stores/sop'
import type { ActionCard } from '@/types'
import CodeBlock from '@/components/CodeBlock.vue'

const props = defineProps<{
  card: ActionCard
  sopId: string
  variables: Record<string, string>
  isPinned?: boolean
  compact?: boolean
}>()

const store = useSopStore()
const openEditCard = inject<((c: ActionCard) => void) | undefined>('openEditCard', undefined)

const resolvedCode = computed(() =>
  store.resolveCode(props.card.code ?? '', props.variables)
)

function doEdit()   { openEditCard?.(props.card) }

function doDelete() {
  if (window.confirm(`删除卡片 "${props.card.title}"？`)) {
    store.deleteCard(props.sopId, props.card.id)
    store.toast('卡片已删除', 'info')
  }
}
</script>

<style scoped>
div:hover .card-actions { opacity: 1 !important; }
</style>
