**Console Log Tracker** is a productivity extension for Visual Studio Code that helps you manage `console.log`, `warn`, `error`, and other console methods in your projects. Easily count, navigate, highlight, or bulk-process logs directly from the status bar or with keyboard shortcuts.

![Demo](example_1.png)

## 🚀 Key Features

- **Real-time Counter**: Instantly see the number of console statements in your active file via the status bar. Supports `log`, `warn`, `error`, `info`, and more.
- **Smart Highlighting**: Automatically outlines active console statements. Fully customizable via settings.
- **Modern Command Menu**: A QuickPick menu (`Ctrl+Shift+P` > "Console Log Tracker: Show Menu") for lightning-fast access to all features.
- **Quick Navigation**: 
  - `Ctrl+Shift+L` (Cmd+Shift+L): Jump to **Next** log.
  - `Ctrl+Shift+Alt+L` (Cmd+Shift+Alt+L): Jump to **Previous** log.
- **Bulk Operations**:
  - **Comment All**: Prefix console logs with `//` to silence output without deleting code.
  - **Uncomment All**: Restore logs instantly.
  - **Delete All**: Clean up production code by removing every console statement.
- **Auto-Cleanup**: Optional setting to automatically comment out logs when you save your file.
- **Code Actions**: Click the lightbulb icon next to a console statement for quick context-sensitive actions.

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
| `consoleLogTracker.highlightColor` | Border color for log highlights | `"#FFB471"` |
| `consoleLogTracker.autoCleanupOnSave`| Comment out logs automatically on save | `false` |
| `consoleLogTracker.debounceTimeout` | Delay (ms) before rescanning after typing | `1000` |

## 💻 Supported Languages

- JavaScript (`.js`, `.jsx`)
- TypeScript (`.ts`, `.tsx`)

## 🤝 Contributing

Found a bug or have a feature request? Please open an issue on the [GitHub Repository](https://github.com/cascharly/console-log-tracker).

## 📄 License

This project is licensed under the MIT License.
