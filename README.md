# Disable Copy Paste

An Obsidian plugin that disables copy, cut, and paste operations in your vault to encourage intentional writing.

## Why?

Copy-paste is a productivity killer for writers. This plugin adds friction to help you:

- **Write from scratch** - Force yourself to articulate thoughts in your own words
- **Avoid content hoarding** - Stop mindlessly collecting text you'll never read again
- **Build memory** - Typing things out helps retention better than copy-pasting
- **Stay focused** - Reduce context-switching between sources and your notes

## What It Does

- Blocks `Cmd/Ctrl+C` (copy)
- Blocks `Cmd/Ctrl+X` (cut)
- Blocks `Cmd/Ctrl+V` (paste)
- Shows a notice when a blocked operation is attempted

## Settings

All behaviors are configurable via Settings → Community Plugins → Disable Copy Paste:

| Setting | Description |
|---------|-------------|
| Disable copy | Block copying text from the vault |
| Disable cut | Block cutting text from the vault |
| Disable paste | Block pasting text into the vault |
| Allow copying URLs | Allow copying URLs even when copy is disabled |
| Allow images | Allow pasting images and screenshots |
| Allow emojis | Allow pasting emoji-only content |
| Allow pasting URLs | Allow pasting URLs even when paste is disabled |

## Installation

### From Community Plugins

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Disable Copy Paste"
4. Install and enable the plugin

### Manual Installation

1. Download `main.js` and `manifest.json` from the latest release
2. Create a folder `disable-copy-paste` in your vault's `.obsidian/plugins/` directory
3. Copy the downloaded files into that folder
4. Enable the plugin in Obsidian's Community Plugins settings

## Build from Source

```bash
npm install
npm run build
```

## License

MIT - See [LICENSE](LICENSE) for details.
