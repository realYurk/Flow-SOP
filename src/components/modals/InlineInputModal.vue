<template>
  <Teleport to="body">
    <div class="modal-backdrop" @mousedown.self="cancel">
      <div class="modal-box animate-scale-in" style="max-width:360px;">
        <div class="modal-header">
          <span style="font-size:13px;font-weight:600;color:var(--text-pri);">{{ title }}</span>
          <div style="flex:1"/>
          <button class="btn-icon" @click="cancel">✕</button>
        </div>
        <div style="padding:16px 18px;">
          <label v-if="label" class="field-label">{{ label }}</label>
          <input
            ref="inputEl"
            v-model="value"
            class="sop-input"
            :style="label ? 'margin-top:6px;' : ''"
            :placeholder="placeholder"
            @keydown.enter="confirm"
            @keydown.esc="cancel"
          />
        </div>
        <div class="modal-footer">
          <div style="flex:1"/>
          <button class="btn-ghost" @click="cancel">取消</button>
          <button class="btn-primary" :disabled="!value.trim()" @click="confirm">确定</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  title: string
  label?: string
  placeholder?: string
  initial?: string
}>()
const emit = defineEmits<{
  confirm: [value: string]
  cancel:  []
}>()

const value   = ref(props.initial ?? '')
const inputEl = ref<HTMLInputElement>()

onMounted(() => {
  inputEl.value?.focus()
  inputEl.value?.select()
})

function confirm() {
  if (value.value.trim()) emit('confirm', value.value.trim())
}
function cancel() { emit('cancel') }
</script>
