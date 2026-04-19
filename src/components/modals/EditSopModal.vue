<template>
  <Teleport to="body">
    <div class="modal-backdrop" @mousedown.self="$emit('close')">
      <div class="modal-box animate-scale-in" style="max-width:900px;max-height:88vh;">
        <div class="modal-header">
          <span style="color:#6366f1;">⚡</span>
          <span style="font-size:13px;font-weight:600;color:var(--text-pri);">编辑 SOP</span>
          <div style="flex:1"/>
          <button class="btn-icon" @click="$emit('close')">✕</button>
        </div>

        <div style="flex:1;overflow:hidden;display:flex;flex-direction:column;gap:12px;padding:16px;">
          <!-- Title -->
          <div>
            <label class="field-label">SOP 标题 *</label>
            <input v-model="form.title" class="sop-input" style="margin-top:5px;" placeholder="例：快速构建 JWT 登录模块" />
          </div>

          <!-- Editor + Preview side by side -->
          <div style="flex:1;display:flex;gap:12px;min-height:0;overflow:hidden;">
            <div style="flex:1;display:flex;flex-direction:column;min-width:0;">
              <label class="field-label">Mermaid 代码</label>
              <textarea
                v-model="form.mermaid"
                class="code-textarea"
                style="flex:1;margin-top:5px;min-height:220px;resize:none;"
                placeholder="graph LR&#10;  A[开始] --> B[步骤] --> C[完成]"
                spellcheck="false"
              />
            </div>
            <div style="flex:1;display:flex;flex-direction:column;min-width:0;">
              <label class="field-label">实时预览</label>
              <div style="flex:1;background:var(--bg-raised);border:1px solid var(--border-def);border-radius:6px;overflow:hidden;display:flex;align-items:center;justify-content:center;margin-top:5px;min-height:220px;">
                <div v-if="isLoading" style="width:20px;height:20px;border:2px solid #6366f130;border-top-color:#6366f1;border-radius:50%;animation:spin .7s linear infinite;" />
                <pre v-else-if="previewErr" style="font-size:10px;color:#ef4444;padding:8px;max-width:100%;overflow:auto;margin:0;">{{ previewErr }}</pre>
                <div v-else class="mermaid-wrap" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:8px;overflow:auto;" v-html="previewSvg" />
              </div>
            </div>
          </div>

          <!-- Variables -->
          <div>
            <label class="field-label" style="margin-bottom:6px;display:block;">变量 Variables</label>
            <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
              <div
                v-for="(val, key) in form.variables" :key="key"
                style="display:flex;align-items:center;gap:4px;background:var(--bg-raised);border:1px solid var(--border-def);border-radius:5px;padding:3px 8px;"
              >
                <span style="font-size:11px;font-family:monospace;color:#d97706;">{{ key }}</span>
                <span style="color:var(--text-mut);font-size:11px;">=</span>
                <input
                  :value="val"
                  style="font-size:11px;font-family:monospace;background:transparent;border:none;outline:none;color:var(--text-pri);width:100px;"
                  @input="form.variables[key] = ($event.target as HTMLInputElement).value"
                />
                <button style="color:var(--text-mut);background:transparent;border:none;cursor:pointer;font-size:11px;padding:0 2px;line-height:1;" @click="removeVar(key)">✕</button>
              </div>

              <!-- Inline add variable -->
              <div v-if="addingVar" style="display:flex;align-items:center;gap:4px;background:var(--bg-raised);border:1px solid #6366f1;border-radius:5px;padding:3px 8px;">
                <input
                  ref="newVarKeyEl"
                  v-model="newVarKey"
                  style="font-size:11px;font-family:monospace;background:transparent;border:none;outline:none;color:#d97706;width:80px;"
                  placeholder="VAR_NAME"
                  @keydown.enter="confirmAddVar"
                  @keydown.esc="cancelAddVar"
                />
                <span style="color:var(--text-mut);font-size:11px;">=</span>
                <input
                  v-model="newVarVal"
                  style="font-size:11px;font-family:monospace;background:transparent;border:none;outline:none;color:var(--text-pri);width:80px;"
                  placeholder="默认值"
                  @keydown.enter="confirmAddVar"
                  @keydown.esc="cancelAddVar"
                />
                <button style="color:#22c55e;background:transparent;border:none;cursor:pointer;font-size:12px;padding:0 2px;" @click="confirmAddVar">✓</button>
                <button style="color:var(--text-mut);background:transparent;border:none;cursor:pointer;font-size:11px;padding:0 2px;" @click="cancelAddVar">✕</button>
              </div>

              <button
                v-if="!addingVar"
                style="display:flex;align-items:center;gap:3px;font-size:11px;color:#818cf8;background:#6366f115;border:1px dashed #6366f150;border-radius:5px;padding:3px 9px;cursor:pointer;transition:all .15s;"
                @mouseenter="e=>(e.currentTarget as HTMLElement).style.background='#6366f125'"
                @mouseleave="e=>(e.currentTarget as HTMLElement).style.background='#6366f115'"
                @click="startAddVar"
              >＋ 添加变量</button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div style="flex:1"/>
          <button class="btn-ghost" @click="$emit('close')">取消</button>
          <button class="btn-primary" :disabled="!form.title.trim()" @click="save">保存</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, computed, ref, nextTick } from 'vue'
import { useSopStore } from '@/stores/sop'
import { useMermaid } from '@/composables/useMermaid'

const emit  = defineEmits<{ close: [] }>()
const store = useSopStore()
const sop   = store.activeSop!

const form = reactive({
  title:     sop.title ?? '',
  mermaid:   sop.mermaidSource ?? '',
  variables: { ...(sop.variables ?? {}) } as Record<string, string>,
})

// Inline add-variable state
const addingVar  = ref(false)
const newVarKey  = ref('')
const newVarVal  = ref('')
const newVarKeyEl = ref<HTMLInputElement>()

function startAddVar() {
  addingVar.value = true
  newVarKey.value = ''
  newVarVal.value = ''
  nextTick(() => newVarKeyEl.value?.focus())
}

function confirmAddVar() {
  const k = newVarKey.value.trim().toUpperCase().replace(/\s+/g, '_')
  if (k) form.variables[k] = newVarVal.value
  addingVar.value = false
}

function cancelAddVar() {
  addingVar.value = false
}

function removeVar(key: string) {
  delete form.variables[key]
}

// Mermaid preview
const src   = computed(() => form.mermaid)
const theme = computed(() => store.theme)
const { svgHtml: previewSvg, error: previewErr, isLoading } = useMermaid(src, theme)

function save() {
  if (!form.title.trim()) return
  store.updateSopItem(sop.id, {
    title: form.title.trim(),
    mermaidSource: form.mermaid,
    variables: { ...form.variables }
  })
  store.toast('SOP 已更新')
  emit('close')
}
</script>
