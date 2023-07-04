"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
let statusBarItem;
let timeout;
function activate(context) {
    // Create a status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    context.subscriptions.push(statusBarItem);
    // Register the event listeners for text document events
    vscode.workspace.onDidChangeTextDocument(handleTextDocumentChange);
    vscode.window.onDidChangeActiveTextEditor(handleActiveTextEditorChange);
    vscode.window.onDidChangeTextEditorSelection(handleTextEditorSelectionChange);
    // Scan the active file initially
    const activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor) {
        scanDocument(activeTextEditor.document);
    }
    // Register the status bar item click handler
    statusBarItem.command = "extension.showNotification";
    context.subscriptions.push(vscode.commands.registerCommand("extension.showNotification", () => {
        const optionHighLightAll = { title: "HighLight" };
        const optionLocate = { title: "Locate" };
        const optionCommentAll = { title: "Comment" };
        const optionUncommentAll = { title: "Uncomment" };
        const optionDeleteCommented = { title: "Delete" };
        vscode.window
            .showInformationMessage("Action for console.log statements.", optionHighLightAll, optionLocate, optionCommentAll, optionUncommentAll, optionDeleteCommented)
            .then((selectedOption) => {
            if (selectedOption === optionCommentAll) {
                commentAllConsoleLogs();
            }
            else if (selectedOption === optionHighLightAll) {
                highlightAllConsoleLogs();
            }
            else if (selectedOption === optionDeleteCommented) {
                deleteAllConsoleLogs();
            }
            else if (selectedOption === optionUncommentAll) {
                uncommentAllConsoleLogs();
            }
            else if (selectedOption === optionLocate) {
                locateAllConsoleLogs();
            }
        });
    }));
}
exports.activate = activate;
function handleTextDocumentChange(event) {
    // Clear the previous timeout
    if (timeout) {
        clearTimeout(timeout);
    }
    // Start a new timeout to rescan the document after 2 seconds of inactivity
    timeout = setTimeout(() => {
        scanDocument(event.document);
    }, 1000);
}
function handleActiveTextEditorChange(editor) {
    if (editor) {
        scanDocument(editor.document);
    }
}
function handleTextEditorSelectionChange(event) {
    if (event.textEditor) {
        scanDocument(event.textEditor.document);
    }
}
function scanDocument(document) {
    let count = 0;
    for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
        const line = document.lineAt(lineIndex);
        if (line.text.includes("console.log(")) {
            count++;
        }
    }
    updateStatusBar(count);
}
function updateStatusBar(count) {
    if (statusBarItem) {
        if (count === 0) {
            statusBarItem.hide();
        }
        else {
            statusBarItem.text = `${count} console.log found`;
            statusBarItem.show();
        }
    }
}
function commentAllConsoleLogs() {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor) {
        const document = activeTextEditor.document;
        const edit = new vscode.WorkspaceEdit();
        const consoleLogRegex = /(^|\s)console\.log\([^)]*\);/g;
        for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            const line = document.lineAt(lineIndex);
            const match = line.text.match(consoleLogRegex);
            if (match && !line.text.trim().startsWith("/*")) {
                const range = line.range;
                const commentedLine = `// ${line.text.replace(match[0], match[0].replace(/console\.log/, "console.log").replace(/\);$/, ");"))}`;
                edit.replace(document.uri, range, commentedLine);
            }
        }
        // Apply the workspace edit
        vscode.workspace.applyEdit(edit).then(() => {
            // Adjust the selection ranges after applying the edit
            activeTextEditor.selections = activeTextEditor.selections.map((selection) => {
                const line = document.lineAt(selection.active.line);
                const adjustedSelection = new vscode.Selection(new vscode.Position(line.range.end.line, line.range.end.character), new vscode.Position(line.range.end.line, line.range.end.character));
                return adjustedSelection;
            });
        });
    }
}
function highlightAllConsoleLogs() {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor) {
        const document = activeTextEditor.document;
        const edit = new vscode.WorkspaceEdit();
        const decorationType = vscode.window.createTextEditorDecorationType({
            borderColor: "#FFB471",
            borderWidth: "1px",
            borderStyle: "solid",
        });
        const decorations = [];
        for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            const line = document.lineAt(lineIndex);
            if (line.text.includes("console.log") &&
                !line.text.includes("'console.log'") &&
                !line.text.includes('"console.log"')) {
                const startPosition = line.range.start;
                const endPosition = line.range.end;
                const range = new vscode.Range(startPosition, endPosition);
                decorations.push({ range });
            }
        }
        activeTextEditor.setDecorations(decorationType, decorations);
        const disposable = vscode.window.onDidChangeTextEditorSelection((event) => {
            if (event.textEditor === activeTextEditor) {
                activeTextEditor.setDecorations(decorationType, []);
                disposable.dispose();
            }
        });
    }
}
function locateAllConsoleLogs() {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor) {
        const document = activeTextEditor.document;
        const decorationType = vscode.window.createTextEditorDecorationType({
            borderColor: "#FFB471",
            borderWidth: "1px",
            borderStyle: "solid",
        });
        let targetLineIndex = undefined;
        for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            const line = document.lineAt(lineIndex);
            if (line.text.includes("console.log") &&
                !line.text.includes("'console.log'") &&
                !line.text.includes('"console.log"')) {
                const startPosition = line.range.start;
                const endPosition = line.range.end;
                const range = new vscode.Range(startPosition, endPosition);
                activeTextEditor.setDecorations(decorationType, [{ range }]);
                targetLineIndex = lineIndex;
                break; // Stop after locating the first occurrence
            }
        }
        if (typeof targetLineIndex !== "undefined") {
            const targetPosition = new vscode.Position(targetLineIndex, 0);
            activeTextEditor.selection = new vscode.Selection(targetPosition, targetPosition);
            activeTextEditor.revealRange(new vscode.Range(targetPosition, targetPosition), vscode.TextEditorRevealType.Default);
        }
        const disposable = vscode.window.onDidChangeTextEditorSelection((event) => {
            if (event.textEditor === activeTextEditor) {
                activeTextEditor.setDecorations(decorationType, []);
                disposable.dispose();
            }
        });
    }
}
function deleteAllConsoleLogs() {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor) {
        const document = activeTextEditor.document;
        const edit = new vscode.WorkspaceEdit();
        const consoleLogRegex = /(^|\s)(\/\/\s*)?console\.log\([^)]*\);/g;
        for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            const line = document.lineAt(lineIndex);
            const match = line.text.match(consoleLogRegex);
            if (match) {
                const range = line.range;
                edit.delete(document.uri, range);
            }
        }
        // Apply the workspace edit
        vscode.workspace.applyEdit(edit);
    }
}
function uncommentAllConsoleLogs() {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor) {
        const document = activeTextEditor.document;
        const edit = new vscode.WorkspaceEdit();
        const commentedConsoleLogRegex = /^\s*\/\/\s*console\.log\([^)]*\);/gm;
        for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            const line = document.lineAt(lineIndex);
            const match = line.text.match(commentedConsoleLogRegex);
            if (match) {
                const range = line.range;
                const uncommentedLine = line.text.replace(/\/\//, "");
                edit.replace(document.uri, range, uncommentedLine);
            }
        }
        // Apply the workspace edit
        vscode.workspace.applyEdit(edit);
    }
}
function deactivate() {
    // Clean up resources
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    if (timeout) {
        clearTimeout(timeout);
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map