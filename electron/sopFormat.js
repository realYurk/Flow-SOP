/**
 * .sop file format handler
 * A .sop file is a ZIP archive containing:
 *   manifest.json     → full data.json (for lossless round-trip)
 *   README.md         → human-readable index
 *   {Col}/{Folder}/{SopTitle}.md  → each SOP as readable markdown
 */

const fs   = require('fs')
const path = require('path')
const os   = require('os')

// ── Markdown export of a single SOP ─────────────────────────────────────────
function sopToMarkdown(sop) {
  const lines = []
  lines.push(`# ${sop.title}`)
  lines.push('')

  if (sop.mermaidSource) {
    lines.push('## 流程图')
    lines.push('')
    lines.push('```mermaid')
    lines.push(sop.mermaidSource)
    lines.push('```')
    lines.push('')
  }

  if (sop.variables && Object.keys(sop.variables).length) {
    lines.push('## 变量')
    lines.push('')
    for (const [k, v] of Object.entries(sop.variables)) {
      lines.push(`- \`${k}\` = \`${v}\``)
    }
    lines.push('')
  }

  if (sop.actionCards && sop.actionCards.length) {
    lines.push('## 动作卡片')
    lines.push('')
    for (const card of sop.actionCards) {
      const check = card.completed ? '[x]' : '[ ]'
      lines.push(`### ${check} ${card.title}`)
      lines.push('')
      if (card.code) {
        lines.push('```' + (card.language || ''))
        lines.push(card.code)
        lines.push('```')
        lines.push('')
      }
      if (card.notes) {
        lines.push(`> 💡 ${card.notes}`)
        lines.push('')
      }
    }
  }

  return lines.join('\n')
}

// ── Sanitize filename ────────────────────────────────────────────────────────
function safeName(str) {
  return str.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '_').slice(0, 60)
}

// ── Export to folder structure (readable markdown files + manifest) ──────────
function exportToFolder(data, destDir) {
  fs.mkdirSync(destDir, { recursive: true })

  // Write manifest (full data for lossless import)
  fs.writeFileSync(
    path.join(destDir, 'manifest.json'),
    JSON.stringify(data, null, 2),
    'utf-8'
  )

  // Write README index
  const indexLines = ['# Flow SOP — 项目介绍文档', '', '## 目录', '']
  for (const col of data.collections) {
    indexLines.push(`### ${col.icon} ${col.name}`)
    for (const folder of col.folders) {
      indexLines.push(`- **${folder.name}**`)
      for (const sop of folder.sopItems) {
        const colDir    = safeName(col.name)
        const folderDir = safeName(folder.name)
        const sopFile   = safeName(sop.title) + '.md'
        indexLines.push(`  - [${sop.title}](./${colDir}/${folderDir}/${sopFile})`)
      }
    }
    indexLines.push('')
  }
  fs.writeFileSync(path.join(destDir, 'README.md'), indexLines.join('\n'), 'utf-8')

  // Write each SOP as markdown
  for (const col of data.collections) {
    for (const folder of col.folders) {
      const dir = path.join(destDir, safeName(col.name), safeName(folder.name))
      fs.mkdirSync(dir, { recursive: true })
      for (const sop of folder.sopItems) {
        const filePath = path.join(dir, safeName(sop.title) + '.md')
        fs.writeFileSync(filePath, sopToMarkdown(sop), 'utf-8')
      }
    }
  }
}

// ── Import from folder (reads manifest.json for lossless restore) ────────────
function importFromFolder(srcDir) {
  const manifestPath = path.join(srcDir, 'manifest.json')
  if (fs.existsSync(manifestPath)) {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  }
  throw new Error('未找到 manifest.json，无法导入')
}

module.exports = { exportToFolder, importFromFolder, sopToMarkdown }
