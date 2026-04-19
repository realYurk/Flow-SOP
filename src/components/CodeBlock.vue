<template>
  <div style="position:relative;">
    <!-- Toolbar -->
    <div style="display:flex;align-items:center;gap:8px;padding:5px 10px;background:var(--code-bg);border-bottom:1px solid var(--border-sub);">
      <span class="lang-badge">{{ language || 'text' }}</span>
      <div style="flex:1"/>
      <button
        style="display:flex;align-items:center;gap:4px;padding:2px 8px;border-radius:4px;border:1px solid;font-size:10px;cursor:pointer;transition:all .15s;"
        :style="copied
          ? 'border-color:#22c55e40;background:#22c55e15;color:#22c55e'
          : 'border-color:var(--border-sub);background:transparent;color:var(--text-mut)'"
        @click="doCopy"
      >
        <svg v-if="!copied" width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
        <svg v-else width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        {{ copied ? '已复制' : '复制' }}
      </button>
    </div>

    <!-- Highlighted code -->
    <div
      style="margin:0;overflow-x:auto;background:var(--code-bg);font-family:'JetBrains Mono','Fira Code',monospace;font-size:11.5px;line-height:1.7;"
    >
      <pre
        style="margin:0;padding:12px 14px;"
        v-html="highlighted"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import hljs from 'highlight.js'

const props = defineProps<{
  code: string
  language: string
  compact?: boolean
}>()

const emit = defineEmits<{ copy: [] }>()
const copied = ref(false)

// Truncate for compact mode
const displayCode = computed(() =>
  props.compact && props.code.length > 300
    ? props.code.slice(0, 300) + '\n…'
    : props.code
)

// Syntax highlight
const highlighted = computed(() => {
  const code = displayCode.value || ''
  const lang = (props.language || '').toLowerCase().trim()

  // Language alias map
  const aliases: Record<string, string> = {
    'js':         'javascript',
    'ts':         'typescript',
    'jsx':        'javascript',
    'tsx':        'typescript',
    'py':         'python',
    'rb':         'ruby',
    'sh':         'bash',
    'shell':      'bash',
    'zsh':        'bash',
    'fish':       'bash',
    'ps1':        'powershell',
    'ps':         'powershell',
    'cmd':        'dos',
    'bat':        'dos',
    'cs':         'csharp',
    'c#':         'csharp',
    'cpp':        'cpp',
    'c++':        'cpp',
    'md':         'markdown',
    'dockerfile': 'dockerfile',
    'docker':     'dockerfile',
    'tf':         'hcl',
    'hcl':        'hcl',
    'kt':         'kotlin',
    'rs':         'rust',
    'go':         'go',
    'hs':         'haskell',
    'ex':         'elixir',
    'exs':        'elixir',
    'erl':        'erlang',
    'ml':         'ocaml',
    'r':          'r',
    'scala':      'scala',
    'swift':      'swift',
    'php':        'php',
    'pl':         'perl',
    'lua':        'lua',
    'vim':        'vim',
    'nginx':      'nginx',
    'apache':     'apache',
    'http':       'http',
    'graphql':    'graphql',
    'gql':        'graphql',
    'proto':      'protobuf',
    'groovy':     'groovy',
    'gradle':     'groovy',
  }

  const resolved = aliases[lang] || lang

  try {
    if (resolved && hljs.getLanguage(resolved)) {
      const result = hljs.highlight(code, { language: resolved, ignoreIllegals: true })
      return result.value
    }
    // Auto-detect
    const auto = hljs.highlightAuto(code, [
      'javascript','typescript','python','java','bash','sql','xml','yaml',
      'json','css','html','rust','go','kotlin','swift','cpp','csharp',
      'ruby','php','shell','dockerfile','nginx','markdown'
    ])
    return auto.value
  } catch (e) {
    // Fallback: escape HTML only
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }
})

function doCopy() {
  navigator.clipboard.writeText(props.code ?? '')
  copied.value = true
  emit('copy')
  setTimeout(() => { copied.value = false }, 1800)
}
</script>

<style>
/* ── highlight.js GitHub Dark theme (inlined, no CDN needed) ── */
.hljs { background: var(--code-bg); color: #adbac7; }
.hljs-doctag, .hljs-keyword, .hljs-meta .hljs-keyword,
.hljs-template-tag, .hljs-template-variable, .hljs-type,
.hljs-variable.language_ { color: #f47067; }
.hljs-title, .hljs-title.class_, .hljs-title.class_.inherited__,
.hljs-title.function_ { color: #dcbdfb; }
.hljs-attr, .hljs-attribute, .hljs-literal, .hljs-meta,
.hljs-number, .hljs-operator, .hljs-selector-attr,
.hljs-selector-class, .hljs-selector-id, .hljs-variable { color: #6cb6ff; }
.hljs-meta .hljs-string, .hljs-regexp, .hljs-string { color: #96d0ff; }
.hljs-built_in, .hljs-symbol { color: #f69d50; }
.hljs-code, .hljs-comment, .hljs-formula { color: #768390; font-style: italic; }
.hljs-name, .hljs-quote, .hljs-selector-pseudo,
.hljs-selector-tag { color: #8ddb8c; }
.hljs-subst { color: #adbac7; }
.hljs-section { color: #316dca; font-weight: bold; }
.hljs-bullet { color: #eac55f; }
.hljs-emphasis { color: #adbac7; font-style: italic; }
.hljs-strong { color: #adbac7; font-weight: bold; }
.hljs-addition { color: #b4f1b4; background: #1b4721; }
.hljs-deletion { color: #ffd8d3; background: #78191b; }
.hljs-char.escape_, .hljs-link, .hljs-params,
.hljs-property, .hljs-punctuation, .hljs-tag { color: #adbac7; }

/* Light mode overrides */
.light .hljs { background: var(--code-bg); color: #24292f; }
.light .hljs-keyword, .light .hljs-type,
.light .hljs-variable.language_ { color: #cf222e; }
.light .hljs-title, .light .hljs-title.function_ { color: #8250df; }
.light .hljs-attr, .light .hljs-number, .light .hljs-literal { color: #0550ae; }
.light .hljs-string, .light .hljs-regexp { color: #0a3069; }
.light .hljs-built_in { color: #953800; }
.light .hljs-comment { color: #6e7781; font-style: italic; }
.light .hljs-name, .light .hljs-selector-tag { color: #116329; }
.light .hljs-section { color: #0550ae; }
</style>
