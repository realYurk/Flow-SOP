const fs   = require('fs')
const path = require('path')

// ── Sanitize filename ──────────────────────────────────────────────────────
function safeName(str) {
  if (!str) return 'untitled'
  return str
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80) || 'untitled'
}

// ── Export single SOP as Markdown ─────────────────────────────────────────
function sopToMarkdown(sop) {
  const lines = []

  lines.push(`# ${sop.title || 'Untitled SOP'}`)
  lines.push('')

  // Mermaid flow diagram
  if (sop.mermaidSource && sop.mermaidSource.trim()) {
    lines.push('## 流程图')
    lines.push('')
    lines.push('```mermaid')
    lines.push(sop.mermaidSource.trim())
    lines.push('```')
    lines.push('')
  }

  // Variables
  if (sop.variables && Object.keys(sop.variables).length > 0) {
    lines.push('## 变量')
    lines.push('')
    lines.push('| 变量名 | 值 |')
    lines.push('|--------|-----|')
    for (const [k, v] of Object.entries(sop.variables)) {
      lines.push(`| \`${k}\` | \`${v || '(未设置)'}\` |`)
    }
    lines.push('')
  }

  // Action cards
  if (sop.actionCards && sop.actionCards.length > 0) {
    lines.push('## 动作卡片')
    lines.push('')

    sop.actionCards.forEach((card, idx) => {
      const status = card.completed ? '✅' : '⬜'
      lines.push(`### ${status} Step ${idx + 1}：${card.title || '未命名'}`)
      lines.push('')

      // Code block
      if (card.code && card.code.trim()) {
        const lang = card.language || ''
        lines.push('```' + lang)
        lines.push(card.code.trim())
        lines.push('```')
        lines.push('')
      }

      // Notes
      if (card.notes && card.notes.trim()) {
        lines.push(`> 💡 **注意：** ${card.notes.trim()}`)
        lines.push('')
      }
    })
  } else {
    lines.push('## 动作卡片')
    lines.push('')
    lines.push('*（暂无动作卡片）*')
    lines.push('')
  }

  return lines.join('\n')
}

// ── Export entire AppData as folder structure ──────────────────────────────
function exportToFolder(data, destDir) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true })

  // 1. Write full manifest (for lossless re-import)
  fs.writeFileSync(
    path.join(destDir, 'manifest.json'),
    JSON.stringify(data, null, 2),
    'utf-8'
  )

  // 2. Write README index - use relative paths, not hardcoded
  const indexLines = [
    '# Flow SOP — 项目介绍文档',
    '',
    `> 导出时间：${new Date().toLocaleString('zh-CN')}`,
    `> 导出目录：${destDir}`,
    '',
    '## 目录结构',
    '',
  ]

  const collections = data.collections || []
  for (const col of collections) {
    indexLines.push(`### ${col.icon || '📁'} ${col.name}`)
    indexLines.push('')
    const folders = col.folders || []
    for (const folder of folders) {
      indexLines.push(`**${folder.name}**`)
      indexLines.push('')
      const items = folder.sopItems || []
      for (const sop of items) {
        const colDir    = safeName(col.name)
        const folderDir = safeName(folder.name)
        const sopFile   = safeName(sop.title) + '.md'
        const cardCount = (sop.actionCards || []).length
        const doneCount = (sop.actionCards || []).filter(c => c.completed).length
        indexLines.push(`- [${sop.title}](./${colDir}/${folderDir}/${sopFile}) — ${doneCount}/${cardCount} 步骤完成`)
      }
      indexLines.push('')
    }
  }

  indexLines.push('---')
  indexLines.push('')
  indexLines.push('使用 `manifest.json` 可在 Flow SOP 应用中完整还原所有数据。')

  fs.writeFileSync(
    path.join(destDir, 'README.md'),
    indexLines.join('\n'),
    'utf-8'
  )

  // 3. Write each SOP as individual .md file
  for (const col of collections) {
    for (const folder of col.folders || []) {
      const dir = path.join(destDir, safeName(col.name), safeName(folder.name))
      fs.mkdirSync(dir, { recursive: true })
      for (const sop of folder.sopItems || []) {
        const filePath = path.join(dir, safeName(sop.title) + '.md')
        fs.writeFileSync(filePath, sopToMarkdown(sop), 'utf-8')
      }
    }
  }
}

module.exports = { exportToFolder, sopToMarkdown, safeName }
