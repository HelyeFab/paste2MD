# Paste2MD - Text to Markdown Converter

A sleek, minimalist Next.js application for converting raw text into clean, formatted Markdown.

## Features

### Core Functionality
- **Smart Text Parsing**: Automatically detects and converts:
  - Headers (ALL CAPS text or underlined headers)
  - Bullet points and numbered lists
  - URLs to markdown links
  - Bold and italic text
  - Code blocks (indented text)
  - Inline code

- **Live Preview**: Real-time markdown preview as you type
- **Dark/Light Theme**: Toggle between themes with smooth transitions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **File Upload**: Drag and drop .txt files for quick conversion
- **Export Options**:
  - Copy markdown to clipboard
  - Download as .md file

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone [your-repo-url]
cd paste2md

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: TailwindCSS with Typography plugin
- **UI Components**: Custom shadcn/ui components
- **Theme**: next-themes for dark/light mode
- **Markdown**: react-markdown with remark-gfm
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Usage

1. **Paste Text**: Simply paste your raw text into the input area
2. **Automatic Conversion**: Text is automatically converted to markdown
3. **Preview**: See the formatted result in real-time
4. **Export**: Copy to clipboard or download as .md file

### Supported Conversions

- `ALL CAPS TEXT` → `# All Caps Text` (H1 header)
- `Text\n===` → `# Text` (H1 header)
- `Text\n---` → `## Text` (H2 header)
- `• Item` → `- Item` (bullet point)
- `1. Item` → `1. Item` (numbered list)
- `http://example.com` → `[example.com](http://example.com)`
- `**bold**` → **bold**
- `*italic*` → *italic*
- Indented text → Code blocks

## Project Structure

```
paste2md/
├── app/
│   ├── layout.tsx      # Root layout with theme provider
│   ├── page.tsx        # Main converter page
│   └── globals.css     # Global styles
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── theme-toggle.tsx # Theme switcher
│   └── theme-provider.tsx
├── lib/
│   ├── utils.ts        # Utility functions
│   └── markdown-converter.ts # Conversion logic
└── public/
```

## Future Enhancements

- Smart formatting detection for complex documents
- Custom conversion rules
- Markdown templates (blog, README, notes)
- Integration with Obsidian/Notion
- AI-powered cleanup and suggestions
- Rich text paste support

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.