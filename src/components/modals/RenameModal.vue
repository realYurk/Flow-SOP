<template>
  <Teleport to="body">
    <div class="modal-backdrop" @mousedown.self="$emit('close')">
      <div class="modal-box animate-scale-in" style="max-width:380px;">
        <div class="modal-header">
          <span style="font-size:13px;font-weight:600;color:var(--text-pri);">重命名</span>
          <div style="flex:1"/>
          <button class="btn-icon" @click="$emit('close')">✕</button>
        </div>
        <div style="padding:16px 18px;">
          <input ref="inputEl" v-model="value" class="sop-input" @keydown.enter="confirm" @keydown.esc="$emit('close')" />
        </div>
        <div class="modal-footer">
          <div style="flex:1"/>
          <button class="btn-ghost" @click="$emit('close')">取消</button>
          <button class="btn-primary" :disabled="!value.trim()" @click="confirm">确定</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
const emit    = defineEmits<{ close: [] }>()
const value   = ref('')
const inputEl = ref<HTMLInputElement>()
onMounted(() => inputEl.value?.focus())
function confirm() { if (value.value.trim()) emit('close') }
</script>
