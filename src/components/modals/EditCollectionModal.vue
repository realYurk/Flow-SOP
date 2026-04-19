<template>
  <Teleport to="body">
    <div class="modal-backdrop" @mousedown.self="$emit('close')">
      <div class="modal-box animate-scale-in" style="max-width:560px;">
        <div class="modal-header">
          <span style="font-size:20px;line-height:1;">{{ icon }}</span>
          <span style="font-size:13px;font-weight:600;color:var(--text-pri);">编辑 Collection</span>
          <div style="flex:1"/>
          <button class="btn-icon" @click="$emit('close')">✕</button>
        </div>

        <div style="padding:16px 18px;display:flex;flex-direction:column;gap:14px;overflow-y:auto;max-height:70vh;">
          <!-- Name -->
          <div>
            <label class="field-label">名称 *</label>
            <input ref="nameEl" v-model="name" class="sop-input" style="margin-top:5px;"
              @keydown.enter="save" @keydown.esc="$emit('close')" />
          </div>

          <!-- Color -->
          <div>
            <label class="field-label">颜色</label>
            <div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:7px;">
              <button
                v-for="c in UNIQUE_COLORS" :key="c"
                style="width:24px;height:24px;border-radius:50%;border:2.5px solid transparent;cursor:pointer;transition:border-color .15s;"
                :style="`background:${c};${color===c ? 'border-color:var(--text-pri)' : ''}`"
                @click="color=c"
              />
            </div>
          </div>

          <!-- Emoji picker -->
          <div>
            <label class="field-label">图标</label>
            <div style="margin-top:7px;">
              <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;">
                <button
                  v-for="g in EMOJI_GROUPS" :key="g.label"
                  style="padding:2px 8px;border-radius:4px;border:1px solid var(--border-def);font-size:10px;cursor:pointer;transition:all .15s;"
                  :style="activeGroup===g.label
                    ? 'background:#6366f120;border-color:#6366f1;color:#818cf8'
                    : 'background:var(--bg-raised);color:var(--text-mut)'"
                  @click="activeGroup=g.label"
                >{{ g.label }}</button>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:5px;max-height:120px;overflow-y:auto;padding:4px;">
                <button
                  v-for="e in currentGroupEmojis" :key="e"
                  style="width:34px;height:34px;border-radius:6px;border:1px solid var(--border-def);background:var(--bg-raised);font-size:18px;cursor:pointer;transition:all .15s;"
                  :style="icon===e ? 'border-color:#6366f1;background:var(--bg-active);transform:scale(1.1)' : ''"
                  @click="icon=e"
                >{{ e }}</button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div style="flex:1"/>
          <button class="btn-ghost" @click="$emit('close')">取消</button>
          <button class="btn-primary" :disabled="!name.trim()" @click="save">保存</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSopStore } from '@/stores/sop'
import { EMOJI_GROUPS, UNIQUE_COLORS } from '@/composables/useEmojis'
import type { Collection } from '@/types'

const props  = defineProps<{ collection: Collection }>()
const emit   = defineEmits<{ close: [] }>()
const store  = useSopStore()
const nameEl = ref<HTMLInputElement>()

const name        = ref(props.collection.name)
const icon        = ref(props.collection.icon)
const color       = ref(props.collection.color)
const activeGroup = ref('项目管理')

const currentGroupEmojis = computed(
  () => EMOJI_GROUPS.find(g => g.label === activeGroup.value)?.emojis ?? []
)

onMounted(() => { nameEl.value?.focus(); nameEl.value?.select() })

function save() {
  if (!name.value.trim()) return
  store.updateCollection(props.collection.id, {
    name: name.value.trim(),
    icon: icon.value,
    color: color.value,
  })
  store.toast('Collection 已更新')
  emit('close')
}
</script>
