export function convertToMarkdown(text: string): string {
  let markdown = text.trim()
  const lines = markdown.split('\n')
  const processedLines: string[] = []

  // Track state
  let inCodeBlock = false
  let codeBlockLines: string[] = []
  let inTable = false
  let tableLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const nextLine = lines[i + 1] || ''
    const prevLine = lines[i - 1] || ''
    const trimmedLine = line.trim()

    // Check for code blocks (4+ spaces or tab indented)
    const isIndented = /^(    |\t)/.test(line)

    if (isIndented && !inCodeBlock && !inTable) {
      inCodeBlock = true
      codeBlockLines = [line.replace(/^(    |\t)/, '')]
    } else if (isIndented && inCodeBlock) {
      codeBlockLines.push(line.replace(/^(    |\t)/, ''))
    } else if (!isIndented && inCodeBlock) {
      // End code block
      processedLines.push('```')
      processedLines.push(...codeBlockLines)
      processedLines.push('```')
      inCodeBlock = false
      codeBlockLines = []
      // Process current line normally
      i-- // Reprocess this line
    } else if (!inCodeBlock) {
      // Table detection - look for lines with multiple segments separated by consistent spacing
      // Also detect pipe-separated values
      const segments = line.includes('|')
        ? line.split('|').map(s => s.trim()).filter(s => s)
        : line.split(/\s{2,}|\t+/).filter(s => s.trim())

      const hasMultipleSegments = segments.length > 1

      // Improved heuristic: detect tables with various patterns
      const nextSegments = nextLine.includes('|')
        ? nextLine.split('|').map(s => s.trim()).filter(s => s)
        : nextLine.split(/\s{2,}|\t+/).filter(s => s.trim())
      const prevSegments = prevLine.includes('|')
        ? prevLine.split('|').map(s => s.trim()).filter(s => s)
        : prevLine.split(/\s{2,}|\t+/).filter(s => s.trim())

      // Check if this looks like tabular data
      const looksLikeTableRow = hasMultipleSegments && (
        segments.length === nextSegments.length ||
        segments.length === prevSegments.length ||
        (prevSegments.length > 1 && nextSegments.length > 1)
      )

      if (looksLikeTableRow && !inTable) {
        // Start table
        inTable = true
        tableLines = []

        // Convert to markdown table
        const cells = segments.map(s => s.trim())
        tableLines.push('| ' + cells.join(' | ') + ' |')

        // Add separator after header (if this looks like a header)
        if (i === 0 || (prevLine.trim() === '' && cells.some(c => /^[A-Z]/.test(c)))) {
          tableLines.push('|' + cells.map(() => '---').join('|') + '|')
        }
      } else if (hasMultipleSegments && inTable) {
        // Continue table
        const cells = segments.map(s => s.trim())
        tableLines.push('| ' + cells.join(' | ') + ' |')
      } else if (inTable && (!hasMultipleSegments || trimmedLine === '')) {
        // End table
        processedLines.push(...tableLines)
        if (trimmedLine !== '') {
          processedLines.push('')
        }
        inTable = false
        tableLines = []
        if (trimmedLine !== '') {
          i-- // Reprocess this line
        }
      } else {
        // Process line normally
        let processedLine = line

        // Header detection - improved heuristics
        // 1. Lines that look like titles (short, no punctuation at end, followed by content)
        const looksLikeTitle =
          trimmedLine.length > 0 &&
          trimmedLine.length < 80 &&
          !/[.!?,;]$/.test(trimmedLine) &&
          nextLine.trim() !== '' &&
          (i === 0 || prevLine.trim() === '')

        // 2. Lines that end with ":" and are followed by content
        const isIntroductory = /^[^:]+:$/.test(trimmedLine) && nextLine.trim() !== ''

        // 3. Numbered sections like "1. Title" where title doesn't end in punctuation
        const isNumberedSection = /^\d+\.\s+[A-Z][^.!?]*$/.test(trimmedLine)

        // 4. Lines in Title Case or ALL CAPS
        const isTitleCase = /^[A-Z][a-zA-Z\s]+$/.test(trimmedLine) && trimmedLine.split(' ').every(
          word => word.length <= 3 || /^[A-Z]/.test(word)
        )
        const isAllCaps = /^[A-Z][A-Z\s]+[A-Z]$/.test(trimmedLine)

        // Apply headers based on context
        if (isAllCaps || (looksLikeTitle && isTitleCase && i === 0)) {
          // Main title - H1
          processedLine = `# ${trimmedLine}`
        } else if ((looksLikeTitle && isTitleCase) || isIntroductory) {
          // Section headers - H2
          processedLine = `## ${trimmedLine}`
        } else if (isNumberedSection) {
          // Numbered sections - H3
          processedLine = `### ${trimmedLine}`
        } else {
          // Other formatting

          // Convert numbered lists (but not numbered headers)
          processedLine = processedLine.replace(/^(\s*)(\d+)[.)]\s+(.+)$/gm, (match, indent, num, content) => {
            // Only convert if the content looks like a list item (ends with punctuation or is long)
            if (content.length > 80 || /[.!?,;]$/.test(content)) {
              return `${indent}${num}. ${content}`
            }
            return match
          })

          // Convert bullet points
          processedLine = processedLine.replace(/^\s*[•·▪▫◦‣⁃]\s+(.+)$/gm, '- $1')
          processedLine = processedLine.replace(/^\s*\*\s+(.+)$/gm, '- $1')

          // Convert indented bullets to nested lists
          processedLine = processedLine.replace(/^(\s+)[•·▪▫◦‣⁃]\s+(.+)$/gm, (match, indent, content) => {
            const level = Math.floor(indent.length / 2)
            return '  '.repeat(level) + '- ' + content
          })

          // Convert URLs to markdown links (but not if already in markdown link format)
          processedLine = processedLine.replace(
            /(?<!\[)(?<!\()https?:\/\/[^\s<>"{}|\\^\[\]`()]+(?!\))/g,
            (url) => {
              try {
                const urlObj = new URL(url)
                const domain = urlObj.hostname.replace('www.', '')
                return `[${domain}](${url})`
              } catch {
                return url
              }
            }
          )

          // Convert bold text patterns
          processedLine = processedLine.replace(/\*\*(.+?)\*\*/g, '**$1**')
          processedLine = processedLine.replace(/__(.+?)__/g, '**$1**')

          // Convert italic text patterns (careful not to interfere with bold)
          processedLine = processedLine.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '_$1_')
          processedLine = processedLine.replace(/(?<!_)_([^_]+)_(?!_)/g, '_$1_')

          // Convert inline code (text between backticks)
          processedLine = processedLine.replace(/`([^`]+)`/g, '`$1`')

          // Detect and format quoted text
          if (/^["']/.test(trimmedLine)) {
            processedLine = '> ' + processedLine.trim()
          }
        }

        processedLines.push(processedLine)
      }
    }
  }

  // Handle any remaining code block
  if (inCodeBlock && codeBlockLines.length > 0) {
    processedLines.push('```')
    processedLines.push(...codeBlockLines)
    processedLines.push('```')
  }

  // Handle any remaining table
  if (inTable && tableLines.length > 0) {
    processedLines.push(...tableLines)
  }

  markdown = processedLines.join('\n')

  // Clean up excessive blank lines
  markdown = markdown.replace(/\n{3,}/g, '\n\n')

  return markdown
}