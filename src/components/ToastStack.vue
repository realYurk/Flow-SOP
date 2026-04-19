<template>
  <Teleport to="body">
    <div style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:60;display:flex;flex-direction:column;gap:6px;align-items:center;pointer-events:none;">
      <TransitionGroup name="toast">
        <div
          v-for="t in store.toasts" :key="t.id"
          style="display:flex;align-items:center;gap:8px;padding:9px 16px;border-radius:8px;border:1px solid;font-size:13px;font-weight:500;pointer-events:auto;box-shadow:0 8px 24px rgba(0,0,0,.4);"
          :style="t.type==='success'
            ? 'background:var(--bg-panel);border-color:#22c55e40;color:#22c55e'
            : t.type==='error'
            ? 'background:var(--bg-panel);border-color:#ef444440;color:#ef4444'
            : 'background:var(--bg-panel);border-color:var(--border-def);color:var(--text-pri)'"
        >
          <span>{{ t.type==='success' ? '✓' : t.type==='error' ? '✕' : 'ℹ' }}</span>
          <span>{{ t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useSopStore } from '@/stores/sop'
const store = useSopStore()
</script>

<style scoped>
.toast-enter-active { animation: toastIn .22s cubic-bezier(.34,1.56,.64,1); }
.toast-leave-active { transition: all .18s ease; }
.toast-leave-to     { opacity:0; transform: translateY(6px) scale(.95); }
@keyframes toastIn  { from { opacity:0; transform: translateY(14px) scale(.9); } to { opacity:1; transform: none; } }
</style>
