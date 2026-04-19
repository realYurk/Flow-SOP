<template>
  <Teleport to="body">
    <div
      style="position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);"
      @mousedown.self="close"
    >
      <div
        class="animate-scale-in"
        style="background:var(--bg-panel);border:1px solid var(--border-def);border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.6);width:100%;max-width:660px;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;"
      >
        <!-- Header -->
        <div style="display:flex;align-items:center;gap:8px;padding:14px 18px;border-bottom:1px solid var(--border-sub);flex-shrink:0;">
          <span style="color:#6366f1;">📋</span>
          <span style="font-size:13px;font-weight:600;color:var(--text-pri);">{{ isNew ? '新增动作卡片' : '编辑动作卡片' }}</span>
          <div style="flex:1"/>
          <button
            style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:6px;background:transparent;border:none;color:var(--text-mut);cursor:pointer;"
            @mouseenter="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-hover)'"
            @mouseleave="e=>(e.currentTarget as HTMLElement).style.background='transparent'"
            @click="close"
          >✕</button>
        </div>

        <!-- Body -->
        <div style="flex:1;overflow-y:auto;padding:16px 18px;display:flex;flex-direction:column;gap:14px;">

          <!-- Title -->
          <div>
            <label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--text-mut);margin-bottom:5px;">卡片标题 *</label>
            <input
              ref="titleEl"
              v-model="form.title"
              style="width:100%;background:var(--bg-raised);border:1px solid var(--border-def);border-radius:6px;color:var(--text-pri);font-size:13px;padding:7px 10px;outline:none;transition:border-color .15s;"
              placeholder="例：Step 1 · 添加 Maven 依赖"
              @focus="e=>(e.target as HTMLElement).style.borderColor='#6366f180'"
              @blur="e=>(e.target as HTMLElement).style.borderColor='var(--border-def)'"
              @keydown.esc="close"
            />
          </div>

          <!-- Language picker: flat A-Z + search -->
          <div>
            <label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--text-mut);margin-bottom:5px;">代码语言</label>
            <input
              v-model="langFilter"
              style="width:100%;background:var(--bg-raised);border:1px solid var(--border-def);border-radius:5px;color:var(--text-pri);font-size:12px;padding:5px 10px;outline:none;margin-bottom:8px;transition:border-color .15s;"
              placeholder="🔍 筛选语言..."
              @focus="e=>(e.target as HTMLElement).style.borderColor='#6366f180'"
              @blur="e=>(e.target as HTMLElement).style.borderColor='var(--border-def)'"
            />
            <div style="display:flex;flex-wrap:wrap;gap:4px;max-height:130px;overflow-y:auto;padding:2px;">
              <button
                v-for="l in filteredLangs" :key="l"
                style="padding:3px 10px;border-radius:5px;border:1px solid var(--border-def);font-size:11px;font-family:'JetBrains Mono',monospace;cursor:pointer;transition:all .12s;background:var(--bg-raised);color:var(--text-sec);"
                :style="form.language===l ? 'background:#6366f120;border-color:#6366f1;color:#818cf8' : ''"
                @click="form.language = l; langFilter = ''"
              >{{ l }}</button>
              <span v-if="filteredLangs.length===0" style="font-size:12px;color:var(--text-mut);padding:4px 8px;">无匹配语言</span>
            </div>
            <div style="margin-top:5px;font-size:11px;color:var(--text-mut);">
              当前：<span style="font-family:monospace;color:#818cf8;">{{ form.language }}</span>
            </div>
          </div>

          <!-- Code editor -->
          <div>
            <label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--text-mut);margin-bottom:5px;">代码块</label>
            <textarea
              v-model="form.code"
              style="width:100%;background:var(--bg-raised);border:1px solid var(--border-def);border-radius:6px;color:var(--text-pri);font-family:'JetBrains Mono','Fira Code',monospace;font-size:12px;padding:10px 12px;outline:none;resize:vertical;min-height:200px;max-height:340px;line-height:1.6;tab-size:2;transition:border-color .15s;"
              placeholder="# 在这里输入代码..."
              spellcheck="false"
              @focus="e=>(e.target as HTMLElement).style.borderColor='#6366f160'"
              @blur="e=>(e.target as HTMLElement).style.borderColor='var(--border-def)'"
            />
          </div>

          <!-- Notes -->
          <div>
            <label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--text-mut);margin-bottom:5px;">备注提示（避坑指南）</label>
            <input
              v-model="form.notes"
              style="width:100%;background:var(--bg-raised);border:1px solid var(--border-def);border-radius:6px;color:var(--text-pri);font-size:13px;padding:7px 10px;outline:none;transition:border-color .15s;"
              placeholder="⚠️ 关键注意事项..."
              @focus="e=>(e.target as HTMLElement).style.borderColor='#6366f180'"
              @blur="e=>(e.target as HTMLElement).style.borderColor='var(--border-def)'"
            />
          </div>
        </div>

        <!-- Footer -->
        <div style="display:flex;align-items:center;gap:8px;padding:12px 18px;border-top:1px solid var(--border-sub);flex-shrink:0;">
          <div style="flex:1"/>
          <button
            style="display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:6px;font-size:12px;background:transparent;color:var(--text-sec);border:1px solid transparent;cursor:pointer;transition:all .15s;"
            @mouseenter="e=>(e.currentTarget as HTMLElement).style.background='var(--bg-hover)'"
            @mouseleave="e=>(e.currentTarget as HTMLElement).style.background='transparent'"
            @click="close"
          >取消</button>
          <button
            style="display:inline-flex;align-items:center;gap:5px;padding:6px 16px;border-radius:6px;font-size:12px;font-weight:500;background:#6366f1;color:#fff;border:1px solid #6366f1;cursor:pointer;transition:background .15s;"
            :style="!form.title.trim() ? 'opacity:.4;cursor:not-allowed' : ''"
            :disabled="!form.title.trim()"
            @click="save"
          >{{ isNew ? '创建' : '保存' }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useSopStore } from '@/stores/sop'
import type { ActionCard } from '@/types'

// ─── Props ────────────────────────────────────────────────────────────────────
// sopId is passed explicitly - NEVER rely on store.activeSopId inside a modal
// because Teleport moves the modal outside the component tree
const props = defineProps<{
  card?: ActionCard | null
  sopId: string           // ← explicit, always required
}>()
const emit = defineEmits<{ close: [] }>()
const store = useSopStore()

const titleEl   = ref<HTMLInputElement>()
const langFilter = ref('')
const isNew = computed(() => !props.card?.id)

// All languages A-Z
const ALL_LANGUAGES = [
  'ansible','apache','asm','bash','bat','c','clojure','cmake','coffeescript',
  'cpp','csharp','css','dart','diff','dockerfile','elixir','erlang','fish',
  'go','gradle','graphql','groovy','haskell','hcl','helm','html','http',
  'ini','java','javascript','json','jsx','julia','kotlin','less','lua',
  'makefile','markdown','matlab','mysql','nginx','objective-c','ocaml',
  'perl','php','plsql','postgresql','powershell','proto','python',
  'r','redis','regex','ruby','rust','sass','scala','shell','sql',
  'swift','terraform','text','toml','tsx','typescript','vim',
  'vue','xml','yaml','zig',
].sort()

const filteredLangs = computed(() => {
  const q = langFilter.value.trim().toLowerCase()
  return q ? ALL_LANGUAGES.filter(l => l.includes(q)) : ALL_LANGUAGES
})

const form = reactive({
  title:    props.card?.title    ?? '',
  language: props.card?.language ?? 'bash',
  code:     props.card?.code     ?? '',
  notes:    props.card?.notes    ?? '',
})

onMounted(() => {
  // Small delay to let Teleport mount complete before focusing
  setTimeout(() => titleEl.value?.focus(), 50)
})

function close() { emit('close') }

function save() {
  if (!form.title.trim()) return
  // Use explicitly passed sopId — never store.activeSopId
  const sid = props.sopId
  if (!sid) {
    store.toast('错误：找不到所属 SOP', 'error')
    return
  }
  if (isNew.value) {
    const c = store.createCard(sid, { ...form, title: form.title.trim() })
    store.toast(`已添加: ${c.title}`)
  } else {
    store.updateCard(sid, props.card!.id, { ...form, title: form.title.trim() })
    store.toast('卡片已更新')
  }
  close()
}
</script>
