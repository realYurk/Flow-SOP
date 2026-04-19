import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue'
import mermaid from 'mermaid'

let initialized = false

function initMermaid(theme: 'dark' | 'light') {
  mermaid.initialize({
    startOnLoad: false,
    theme: theme === 'dark' ? 'dark' : 'default',
    themeVariables: theme === 'dark' ? {
      background:       '#0f0f17',
      primaryColor:     '#1a1a30',
      primaryTextColor: '#e8e8f0',
      primaryBorderColor: '#6366f1',
      lineColor:        '#6366f1',
      secondaryColor:   '#0d0d14',
      tertiaryColor:    '#16161f',
      edgeLabelBackground: '#0f0f17',
      fontFamily:       'JetBrains Mono, Consolas, monospace',
      fontSize:         '13px',
      nodeBorder:       '#6366f1',
      clusterBkg:       '#16161f',
      titleColor:       '#818cf8',
      labelBackground:  '#0f0f17',
    } : {
      background:       '#ffffff',
      primaryColor:     '#ede9fe',
      primaryTextColor: '#1e1b4b',
      primaryBorderColor: '#6366f1',
      lineColor:        '#6366f1',
      fontFamily:       'Inter, sans-serif',
      fontSize:         '13px',
    },
    securityLevel: 'loose',
    flowchart:  { curve: 'basis', padding: 20 },
    sequence:   { actorMargin: 80, messageMargin: 40 },
  })
  initialized = true
}

let idCounter = 0

export function useMermaid(
  source: Ref<string>,
  theme: Ref<'dark' | 'light'>,
  onNodeClick?: (nodeId: string) => void
) {
  const svgHtml   = ref('')
  const error     = ref('')
  const isLoading = ref(false)
  const elementId = `mermaid-${++idCounter}`

  async function render() {
    const src = source.value?.trim()
    if (!src) { svgHtml.value = ''; return }
    if (!initialized || theme.value) initMermaid(theme.value)
    isLoading.value = true
    error.value = ''
    try {
      const { svg } = await mermaid.render(elementId, src)
      // Inject click handlers on nodes
      let processed = svg
      if (onNodeClick) {
        processed = svg.replace(
          /(<g[^>]*class="[^"]*node[^"]*"[^>]*id="([^"]+)"[^>]*>)/g,
          (match, tag, id) => tag.replace('>', ` style="cursor:pointer" data-node-id="${id}">`)
        )
      }
      svgHtml.value = processed
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Render error'
      svgHtml.value = ''
    } finally {
      isLoading.value = false
    }
  }

  watch([source, theme], render, { immediate: true })

  function handleClick(event: MouseEvent) {
    if (!onNodeClick) return
    const target = (event.target as Element).closest('[data-node-id]') as HTMLElement | null
    if (target?.dataset.nodeId) onNodeClick(target.dataset.nodeId)
  }

  return { svgHtml, error, isLoading, elementId, handleClick }
}
