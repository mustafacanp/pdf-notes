# PDF Notes

A web application for viewing PDFs, taking persistent notes linked to specific pages/selections, and managing annotations.

## Features

- **PDF Viewer**
  - Upload and display PDF files
  - Page navigation (Previous/Next buttons)
  - Zoom controls
  - Text selection with note creation popup
- **Note Management**
  - Notes automatically saved to localStorage
  - Add notes per page with text context
  - Edit/Save existing notes
  - Delete notes
  - Separate notes overview page

## Technologies

- React.js + Vite
- `react-pdf` (PDF rendering)
- Browser localStorage (note persistence)

## Installation

1. Clone repository
2. Install dependencies:
```bash
npm install
```
3. Start development server:
```bash
npm run dev
```

## Available Scripts

- `dev`: Start development server
- `build`: Create production build
- `preview`: Preview production build
- `lint`: Run ESLint

## Roadmap

**High Priority**
- 🚀 PDF rendering optimizations
- 🛡️ Content sanitization security

**Planned Features**
- 🔍 PDF text search
- 🎨 Annotation tools
- ☁️ Cloud sync capabilities

For detailed technical tasks or to contribute, see our [Development Roadmap](ROADMAP.md).
