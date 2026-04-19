<template>
  <Teleport to="body">
    <div
      style="position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.7);"
      @mousedown.self="$emit('cancel')"
    >
      <div
        class="animate-scale-in"
        style="background:var(--bg-panel);border:1px solid var(--border-def);border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.8);width:520px;max-width:100%;"
      >
        <!-- Header -->
        <div style="display:flex;align-items:center;gap:10px;padding:13px 16px;border-bottom:1px solid var(--border-sub);">
          <span style="font-size:18px;">💾</span>
          <span style="font-size:13px;font-weight:600;color:var(--text-pri);">{{ title }}</span>
          <div style="flex:1"/>
          <button @click="$emit('cancel')" style="background:none;border:none;color:var(--text-mut);cursor:pointer;font-size:16px;padding:2px 5px;">✕</button>
        </div>

        <div style="padding:16px 18px;display:flex;flex-direction:column;gap:14px;">

          <!-- Save directory -->
          <div>
            <label style="display:block;font-size:11px;font-weight:600;color:var(--text-mut);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">保存到目录</label>
            <div style="display:flex;gap:6px;">
              <input
                v-model="saveDir"
                style="flex:1;background:var(--bg-raised);border:1px solid var(--border-def);border-radius:6px;color:var(--text-pri);font-size:12px;font-family:monospace;padding:7px 10px;outline:none;min-width:0;"
                placeholder="输入目录路径，或点击「浏览」"
                @keydown.enter="navigateDirInput"
                @focus="e=>(e.target as HTMLElement).style.borderColor='#6366f180'"
                @blur="e=>(e.target as HTMLElement).style.borderColor='var(--border-def)'"
              />
              <button
                style="padding:6px 12px;border-radius:6px;border:1px solid var(--border-def);background:var(--bg-raised);color:var(--text-sec);font-size:12px;cursor:pointer;white-space:nowrap;flex-shrink:0;"
                @mouseenter="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-hover)'"
                @mouseleave="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-raised)'"
                @click="showPicker=true"
              >📂 浏览</button>
            </div>
          </div>

          <!-- File name -->
          <div>
            <label style="display:block;font-size:11px;font-weight:600;color:var(--text-mut);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">文件名</label>
            <input
              v-model="fileName"
              style="width:100%;background:var(--bg-raised);border:1px solid var(--border-def);border-radius:6px;color:var(--text-pri);font-size:13px;padding:7px 10px;outline:none;transition:border-color .15s;"
              :placeholder="defaultName"
              @focus="e=>(e.target as HTMLElement).style.borderColor='#6366f180'"
              @blur="e=>(e.target as HTMLElement).style.borderColor='var(--border-def)'"
            />
          </div>

          <!-- Full path preview -->
          <div style="padding:8px 10px;background:var(--bg-raised);border:1px solid var(--border-sub);border-radius:6px;">
            <div style="font-size:10px;color:var(--text-mut);margin-bottom:3px;">完整保存路径：</div>
            <div style="font-size:11px;font-family:monospace;color:var(--text-acc);word-break:break-all;">{{ fullPath }}</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--border-sub);">
          <button @click="$emit('cancel')" style="padding:6px 14px;border-radius:6px;border:1px solid var(--border-def);background:transparent;color:var(--text-sec);font-size:12px;cursor:pointer;">取消</button>
          <div style="flex:1"/>
          <button
            style="padding:6px 20px;border-radius:6px;background:#6366f1;color:#fff;border:1px solid #6366f1;font-size:12px;font-weight:600;cursor:pointer;"
            :style="!saveDir.trim() ? 'opacity:.4;cursor:not-allowed' : ''"
            :disabled="!saveDir.trim()"
            @click="confirm"
          >✓ 保存</button>
        </div>
      </div>
    </div>

    <FilePickerModal
      v-if="showPicker"
      title="选择保存目录"
      @confirm="dir => { saveDir = dir; showPicker = false }"
      @cancel="showPicker = false"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import FilePickerModal from '@/components/modals/FilePickerModal.vue'

const props = defineProps<{ title: string; defaultName: string }>()
const emit  = defineEmits<{ confirm: [path: string]; cancel: [] }>()

const saveDir    = ref('')
const fileName   = ref(props.defaultName)
const showPicker = ref(false)
const sep        = ref('\\')

const fullPath = computed(() => {
  const dir  = saveDir.value.trim().replace(/[/\\]$/, '')
  const name = (fileName.value || props.defaultName).trim()
  if (!dir) return name
  return dir + sep.value + name
})

function navigateDirInput() {
  // just update — confirmation is via the save button
}

function confirm() {
  if (!saveDir.value.trim()) return
  emit('confirm', fullPath.value)
}

onMounted(async () => {
  if (!window.electronAPI) return
  sep.value     = await window.electronAPI.fsPathsep()
  saveDir.value = await window.electronAPI.fsHomedir()
})
</script>
