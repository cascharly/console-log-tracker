**Console Log Tracker** is a productivity extension for Visual Studio Code that helps you manage `console.log` statements in your projects. Easily count, locate, comment, or delete logs directly from the status bar.

![Demo](example_1.png)

## 🚀 Features

- **Real-time Counter**: Instantly see the number of `console.log` statements in your active file via the status bar.
- **Quick Navigation**: Jump to the first occurrence of a `console.log` with a single click.
- **Bulk Operations**:
  - **Highlight**: Visually mark all lines containing logs.
  - **Comment All**: Comment out every `console.log` statement to silence debug output.
  - **Uncomment All**: Restore commented logs when you need to debug again.
  - **Delete All**: Clean up your code by removing all `console.log` statements in one go.

## 📦 Installation

1. Open **Visual Studio Code**.
2. Go to the **Extensions** view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
3. Search for `Console Log Tracker`.
4. Click **Install**.

## 🛠 Usage

1. Open a supported file (JavaScript or TypeScript).
2. The **Status Bar** will show an item (e.g., `$(bug) 5 Console Logs`) indicating the count.
3. **Click** the status bar item to reveal the command menu.
4. Choose an action:
   - **Highlight**: Highlights all logs.
   - **Locate**: Moves cursor to the first log.
   - **Comment**: Comments out all logs.
   - **Uncomment**: Uncomments all logs.
   - **Delete**: Removes all logs.

## 💻 Supported Languages

- JavaScript (`.js`)
- JavaScript React (`.jsx`)
- TypeScript (`.ts`)
- TypeScript React (`.tsx`)

## 🤝 Contributing

Found a bug or have a feature request? Please open an issue on the [GitHub Repository](https://github.com/cascharly/console-log-tracker).

## 📄 License

This project is licensed under the MIT License.
