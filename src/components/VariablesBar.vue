<template>
  <div style="margin:0 16px 6px;padding:10px 14px;background:var(--bg-raised);border:1px solid var(--border-def);border-radius:7px;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
      </svg>
      <span style="font-size:11px;font-weight:600;color:#d97706;">变量 Variables</span>
      <span style="font-size:11px;color:var(--text-mut);">代码中的 <code style="font-family:monospace;background:var(--bg-panel);padding:1px 5px;border-radius:3px;">{{ varExample }}</code> 会被自动替换</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;">
      <div
        v-for="(val, key) in variables" :key="key"
        style="display:flex;align-items:center;gap:4px;background:var(--bg-panel);border:1px solid var(--border-sub);border-radius:5px;padding:3px 8px;"
      >
        <span style="font-size:11px;font-family:monospace;color:#d97706;">{{ key }}</span>
        <span style="font-size:11px;color:var(--text-mut);">=</span>
        <input
          :value="val"
          style="font-size:11px;font-family:monospace;color:var(--text-pri);background:transparent;border:none;outline:none;min-width:0;width:96px;"
          @change="update(key, ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSopStore } from '@/stores/sop'
const props = defineProps<{ variables: Record<string, string>; sopId: string }>()
const store = useSopStore()
const varExample = '{{VAR}}'
function update(key: string, value: string) {
  store.updateSopItem(props.sopId, { variables: { ...props.variables, [key]: value } })
}
</script>
