<template>
  <Teleport to="body">
    <div style="position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.65);" @mousedown.self="$emit('cancel')">
      <div class="animate-scale-in" style="background:var(--bg-panel);border:1px solid var(--border-def);border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.7);width:100%;max-width:500px;">

        <div style="display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border-sub);">
          <span style="font-size:16px;">💾</span>
          <span style="font-size:13px;font-weight:600;color:var(--text-pri);">{{ title }}</span>
          <div style="flex:1"/>
          <button @click="$emit('cancel')" style="background:none;border:none;color:var(--text-mut);cursor:pointer;font-size:14px;">✕</button>
        </div>

        <div style="padding:16px 18px;display:flex;flex-direction:column;gap:12px;">
          <div>
            <label style="display:block;font-size:11px;font-weight:600;color:var(--text-mut);margin-bottom:5px;text-transform:uppercase;letter-spacing:.05em;">保存目录</label>
            <div style="display:flex;gap:6px;">
              <div style="flex:1;background:var(--bg-raised);border:1px solid var(--border-def);border-radius:6px;padding:7px 10px;font-size:12px;font-family:monospace;color:var(--text-sec);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                {{ saveDir || homedir }}
              </div>
              <button
                style="padding:6px 12px;border-radius:6px;border:1px solid var(--border-def);background:var(--bg-raised);color:var(--text-sec);font-size:12px;cursor:pointer;white-space:nowrap;"
                @mouseenter="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-hover)'"
                @mouseleave="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-raised)'"
                @click="showPicker=true"
              >浏览…</button>
            </div>
          </div>
          <div>
            <label style="display:block;font-size:11px;font-weight:600;color:var(--text-mut);margin-bottom:5px;text-transform:uppercase;letter-spacing:.05em;">文件名</label>
            <input
              v-model="fileName"
              style="width:100%;background:var(--bg-raised);border:1px solid var(--border-def);border-radius:6px;color:var(--text-pri);font-size:13px;padding:7px 10px;outline:none;"
              :placeholder="defaultName"
              @focus="e=>(e.target as HTMLElement).style.borderColor='#6366f180'"
              @blur="e=>(e.target as HTMLElement).style.borderColor='var(--border-def)'"
            />
          </div>
          <div style="font-size:11px;color:var(--text-mut);background:var(--bg-raised);padding:8px 10px;border-radius:6px;border:1px solid var(--border-sub);font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            完整路径: {{ fullPath }}
          </div>
        </div>

        <div style="display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--border-sub);">
          <button @click="$emit('cancel')" style="padding:6px 14px;border-radius:6px;border:1px solid var(--border-def);background:transparent;color:var(--text-sec);font-size:12px;cursor:pointer;">取消</button>
          <div style="flex:1"/>
          <button
            style="padding:6px 18px;border-radius:6px;background:#6366f1;color:#fff;border:1px solid #6366f1;font-size:12px;font-weight:500;cursor:pointer;"
            @click="confirm"
          >保存</button>
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

const saveDir   = ref('')
const fileName  = ref(props.defaultName)
const showPicker = ref(false)
const homedir   = ref('')
const sep       = ref('/')

const fullPath = computed(() => {
  const dir  = saveDir.value || homedir.value
  const name = (fileName.value || props.defaultName).trim()
  return dir ? dir.replace(/[/\\]$/, '') + sep.value + name : name
})

onMounted(async () => {
  if (window.electronAPI) {
    homedir.value = await window.electronAPI.fsHomedir()
    sep.value     = await window.electronAPI.fsPathsep()
    saveDir.value = homedir.value
  }
})

function confirm() {
  emit('confirm', fullPath.value)
}
</script>
