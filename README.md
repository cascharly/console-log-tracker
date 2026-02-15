**Console Log Tracker** is a productivity extension for Visual Studio Code that helps you manage `console.log`, `warn`, `error`, and other console methods in your projects. Easily count, navigate, highlight, or bulk-process logs directly from the status bar or with keyboard shortcuts.

![Demo](example_2.png)

## 🚀 Key Features

- **Real-time Counter**: Instantly see the number of console statements in your active file via the status bar. Supports `log`, `warn`, `error`, `info`, and more.
- **Smart Highlighting**: Automatically outlines console statements with customizable colors per method (log, warn, error, info).
  - **Persistent or Temporary**: Choose to keep highlights visible or have them disappear when you move the cursor.
- **Modern Command Menu**: A QuickPick menu (`Ctrl+Shift+P` > "Console Log Tracker: Show Menu") for lightning-fast access to all features.
- **Quick Navigation**: 
  - `Ctrl+Shift+L` (Cmd+Shift+L): Jump to **Next** log.
  - `Ctrl+Shift+Alt+L` (Cmd+Shift+Alt+L): Jump to **Previous** log.
- **Bulk Operations**:
  - **Comment All**: Prefix console logs with `//` to silence output without deleting code.
  - **Uncomment All**: Restore logs instantly.
  - **Delete All**: Clean up production code by removing every console statement.
- **Code Actions**: Click the lightbulb icon next to a console statement for quick context-sensitive actions.
- **Wide Compatibility**: Works on VS Code 1.30.0+ with progressive enhancement for newer features.

## 📦 Installation

1. Open **Visual Studio Code**.
2. Go to the **Extensions** view (`Ctrl+Shift+X`).
3. Search for `Console Log Tracker`.
4. Click **Install**.

## 🛠 Configuration

Customize the extension to fit your workflow:

| Setting | Description | Default |
|---------|-------------|---------|
| `consoleLogTracker.enabled` | Enable/Disable tracking features | `true` |
| `consoleLogTracker.methods` | Methods to track (log, warn, error, etc.) | `["log", "warn", "error", "info"]` |
| `consoleLogTracker.highlightColor` | Default border color for log highlights | `"#FFB471"` |
| `consoleLogTracker.colors` | Custom colors per method (`log`, `warn`, `error`, `info`) | `{ log: "#FFB471", warn: "#FFD700", error: "#FF4D4D", info: "#4DA6FF" }` |
| `consoleLogTracker.keepHighlights` | Keep highlights persistent (true) or temporary (false) | `false` |
| `consoleLogTracker.debounceTimeout` | Delay (ms) before rescanning after typing | `1000` |

## 💻 Supported Languages

- JavaScript (`.js`, `.jsx`)
- TypeScript (`.ts`, `.tsx`)

## 🔄 Compatibility & Progressive Enhancement

Console Log Tracker is designed to work across a wide range of VS Code versions:

- **Minimum Version**: VS Code 1.30.0
- **Recommended**: VS Code 1.50.0+ for the best experience

The extension uses **progressive enhancement** to provide the best experience on your VS Code version:

| Feature | VS Code Version | Behavior |
|---------|----------------|----------|
| Core functionality | 1.30.0+ | ✅ Full support |
| Status bar tooltips | 1.30.0+ | ✅ Enabled |
| Quick Pick icons | 1.44.0+ | ✅ Enabled / ⚠️ Text-only on older versions |
| Enhanced code actions | 1.40.0+ | ✅ Enabled |

On older VS Code versions, features gracefully degrade (e.g., icons become text labels) while maintaining full functionality.

📖 See [Progressive Enhancement Documentation](docs/PROGRESSIVE_ENHANCEMENT.md) for details.

## 🤝 Contributing

Found a bug or have a feature request? Please open an issue on the [GitHub Repository](https://github.com/cascharly/console-log-tracker).

## 📄 License

This project is licensed under the MIT License.
