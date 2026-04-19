<template>
  <Teleport to="body">
    <div style="position:fixed;inset:0;z-index:50;" @mousedown.self="$emit('close')" @contextmenu.prevent>
      <div
        class="animate-scale-in"
        style="position:absolute;background:var(--bg-panel);border:1px solid var(--border-def);border-radius:7px;box-shadow:0 8px 30px rgba(0,0,0,.5);padding:4px;min-width:150px;"
        :style="{ left: sx + 'px', top: sy + 'px' }"
      >
        <template v-for="(item, i) in items" :key="i">
          <div v-if="item.divider" style="height:1px;background:var(--border-sub);margin:3px 0;" />
          <button
            v-else
            style="width:100%;display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:5px;border:none;background:transparent;font-size:12px;cursor:pointer;text-align:left;transition:background .1s;"
            :style="item.danger ? 'color:#ef4444' : 'color:var(--text-sec)'"
            @mouseenter="e=>(e.currentTarget as HTMLElement).style.background = item.danger ? '#ef444415' : 'var(--bg-hover)'"
            @mouseleave="e=>(e.currentTarget as HTMLElement).style.background = 'transparent'"
            @click="run(item)"
          >{{ item.label }}</button>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
interface MenuItem { label?: string; action?: () => void; danger?: boolean; divider?: boolean }
const props = defineProps<{ x: number; y: number; items: MenuItem[] }>()
const emit  = defineEmits<{ close: [] }>()
const sx = computed(() => Math.min(props.x, window.innerWidth  - 170))
const sy = computed(() => Math.min(props.y, window.innerHeight - props.items.length * 34 - 20))
function run(item: MenuItem) { item.action?.(); emit('close') }
</script>
