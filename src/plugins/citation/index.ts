// src/plugins/citation/index.ts
// -----------------------------------------------------------------------------
// Live citations + auto‑bibliography plugin for CanavsEditor
// -----------------------------------------------------------------------------
// * Adds a new mark type: `citation`
// * Command `insertCitation` inserts an inline citation and stores the CSL entry
// * Maintains a bibliography zone rendered below the main document that updates
//   automatically when the document changes or the citation style toggles.
// -----------------------------------------------------------------------------

import Cite from 'citation-js'
import type { Editor, Mark } from '../../editor' // relative path matches other plugins

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface CSLData {
  id: string
  title?: string
  author?: { given?: string; family?: string }[]
  issued?: { 'date-parts': number[][] }
  DOI?: string
  // ... other CSL‑JSON fields
}

export interface CitationPluginOptions {
  /** Citation style slug recognised by citation-js (default: 'apa') */
  style?: string
}

// -----------------------------------------------------------------------------
// Debounce helper (simple, no lodash)
// -----------------------------------------------------------------------------
function debounce<T extends (...args: any[]) => void>(fn: T, ms = 100): T {
  let h: ReturnType<typeof setTimeout> | undefined
  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(h)
    h = setTimeout(() => fn.apply(this, args), ms)
  } as T
}

// -----------------------------------------------------------------------------
// Main plugin factory (named export to match repo conventions)
// -----------------------------------------------------------------------------
export function citationPlugin(
  editor: Editor,
  opts: CitationPluginOptions = {}
): void {
  // ---------------------------------------------------------------------------
  // 1. Boot‑strap editor meta for citations & style
  // ---------------------------------------------------------------------------
  const meta = editor.meta as {
    citations: Record<string, CSLData>
    style: string
  }
  if (!meta.citations) meta.citations = {}
  if (!meta.style) meta.style = opts.style || 'apa'

  // ---------------------------------------------------------------------------
  // 2. Register bibliography zone once
  // ---------------------------------------------------------------------------
  if (editor.zone?.exists && !editor.zone.exists('bibliography')) {
    editor.zone.register({
      name: 'bibliography',
      position: 'after-document',
      height: 120
    })
  }

  // ---------------------------------------------------------------------------
  // 3. Command: insertCitation
  // ---------------------------------------------------------------------------
  editor.command.register(
    'insertCitation',
    (payload: { citeKey: string; entry: CSLData }) => {
      const { citeKey, entry } = payload

      editor.history.startBatch()

      // store CSL entry if first time
      if (!meta.citations[citeKey]) {
        meta.citations[citeKey] = entry
      }

      // insert inline mark at current selection
      const mark: Mark = { type: 'citation', id: citeKey }
      editor.range.insertMark(mark)

      editor.history.endBatch()

      updateBibliography()
    }
  )

  // ---------------------------------------------------------------------------
  // 4. Renderer override: how the mark shows inline
  // ---------------------------------------------------------------------------
  if (editor.renderer?.overrideMark) {
    editor.renderer.overrideMark('citation', (mark: Mark) => {
      const entry = meta.citations[mark.id]
      if (!entry) return '(?)'

      const author = entry.author?.[0]
      const surname = author?.family || 'Anon.'
      const year = entry.issued?.['date-parts']?.[0]?.[0] || 'n.d.'

      return `(${surname} ${year})`
    })
  }

  // ---------------------------------------------------------------------------
  // 5. UI integration – context menu & shortcut
  // ---------------------------------------------------------------------------
  if (editor.register?.contextMenuList) {
    editor.register.contextMenuList([
      {
        name: 'Insert citation…',
        shortcut: 'Ctrl-Shift-K',
        exec: () => editor.emit('ui:open-citation-dialog')
      }
    ])
  }

  if (editor.shortcut?.register) {
    editor.shortcut.register('Ctrl-Shift-K', () => {
      editor.emit('ui:open-citation-dialog')
    })
  }

  // ---------------------------------------------------------------------------
  // 6. Observe document changes to keep bibliography in sync
  // ---------------------------------------------------------------------------
  const updateBibliography = debounce(() => {
    const orderedKeys = collectCitationsInOrder(editor)

    if (orderedKeys.length === 0) {
      editor.zone?.toggle && editor.zone.toggle('bibliography', false)
      return
    }

    const entries = orderedKeys.map((k) => meta.citations[k]).filter(Boolean)
    const html = new Cite(entries).format('bibliography', {
      template: meta.style,
      lang: 'en-US'
    })

    editor.zone?.setContent &&
      editor.zone.setContent('bibliography', `<div class="bibliography">${html}</div>`)
    editor.zone?.toggle && editor.zone.toggle('bibliography', true)
  }, 100)

  // initial render
  updateBibliography()

  editor.observer.on('doc:change', updateBibliography)

  // ---------------------------------------------------------------------------
  // 7. Helper: switch style at runtime
  // ---------------------------------------------------------------------------
  editor.on('citation:style', (newStyle: string) => {
    meta.style = newStyle
    updateBibliography()
  })
}

// -----------------------------------------------------------------------------
// Helper: traverse document to collect citation keys in order
// -----------------------------------------------------------------------------
function collectCitationsInOrder(editor: Editor): string[] {
  const keys: string[] = []
  editor.doc.walkMarks?.('citation', (mark: Mark) => {
    if (!keys.includes(mark.id)) keys.push(mark.id)
  })
  return keys
}
