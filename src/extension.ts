import * as vscode from "vscode";

const DEBOUNCE_MS = 2000;

let statusBarItem: vscode.StatusBarItem | undefined;
let timeout: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
  // Create a status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  context.subscriptions.push(statusBarItem);

  // Register the event listeners for text document events
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(handleTextDocumentChange),
    vscode.window.onDidChangeActiveTextEditor(handleActiveTextEditorChange),
    vscode.window.onDidChangeTextEditorSelection(handleTextEditorSelectionChange)
  );

  // Scan the active file initially
  const activeTextEditor: vscode.TextEditor | undefined =
    vscode.window.activeTextEditor;
  if (activeTextEditor) {
    scanDocument(activeTextEditor.document);
  }

  // Register the status bar item click handler
  statusBarItem.command = "extension.showNotification";
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.showNotification", () => {
      const optionHighLightAll: vscode.MessageItem = { title: "HighLight" };
      const optionLocate: vscode.MessageItem = { title: "Locate" };
      const optionCommentAll: vscode.MessageItem = { title: "Comment" };
      const optionUncommentAll: vscode.MessageItem = { title: "Uncomment" };
      const optionDeleteCommented: vscode.MessageItem = { title: "Delete" };

      vscode.window
        .showInformationMessage(
          "Action for console.log statements.",
          optionHighLightAll,
          optionLocate,
          optionCommentAll,
          optionUncommentAll,
          optionDeleteCommented
        )
        .then((selectedOption) => {
          if (selectedOption === optionCommentAll) {
            commentAllConsoleLogs();
          } else if (selectedOption === optionHighLightAll) {
            highlightAllConsoleLogs();
          } else if (selectedOption === optionDeleteCommented) {
            deleteAllConsoleLogs();
          } else if (selectedOption === optionUncommentAll) {
            uncommentAllConsoleLogs();
          } else if (selectedOption === optionLocate) {
            locateAllConsoleLogs();
          }
        });
    })
  );
}

function handleTextDocumentChange(event: vscode.TextDocumentChangeEvent) {
  // Clear the previous timeout
  if (timeout) {
    clearTimeout(timeout);
  }

  // Start a new timeout to rescan the document after 2 seconds of inactivity
  timeout = setTimeout(() => {
    scanDocument(event.document);
  }, DEBOUNCE_MS);
}

function handleActiveTextEditorChange(editor: vscode.TextEditor | undefined) {
  if (editor) {
    scanDocument(editor.document);
  }
}

function handleTextEditorSelectionChange(
  event: vscode.TextEditorSelectionChangeEvent
) {
  if (event.textEditor) {
    scanDocument(event.textEditor.document);
  }
}

function scanDocument(document: vscode.TextDocument) {
  let count: number = 0;

  for (let lineIndex: number = 0; lineIndex < document.lineCount; lineIndex++) {
    const line: vscode.TextLine = document.lineAt(lineIndex);

    if (line.text.includes("console.log(")) {
      count++;
    }
  }

  updateStatusBar(count);
}

function updateStatusBar(count: number) {
  if (statusBarItem) {
    if (count === 0) {
      statusBarItem.hide();
    } else {
      statusBarItem.text = `${count} console.log found`;
      statusBarItem.show();
    }
  }
}

async function commentAllConsoleLogs() {
  const activeTextEditor: vscode.TextEditor | undefined =
    vscode.window.activeTextEditor;
  if (activeTextEditor) {
    const document: vscode.TextDocument = activeTextEditor.document;
    const edit = new vscode.WorkspaceEdit();

    const consoleLogRegex = /(^|\s)console\.log\([^)]*\);/g;

    for (
      let lineIndex: number = 0;
      lineIndex < document.lineCount;
      lineIndex++
    ) {
      const line: vscode.TextLine = document.lineAt(lineIndex);
      const match: RegExpMatchArray | null = line.text.match(consoleLogRegex);
      if (match && !line.text.trim().startsWith("/*")) {
        const range = line.range;
        const commentedLine = `// ${line.text.replace(
          match[0],
          match[0].replace(/console\.log/, "console.log").replace(/\);$/, ");")
        )}`;
        edit.replace(document.uri, range, commentedLine);
      }
    }

    // Apply the workspace edit
    const success = await vscode.workspace.applyEdit(edit);
    if (success) {
      // Adjust the selection ranges after applying the edit
      activeTextEditor.selections = activeTextEditor.selections.map(
        (selection) => {
          const line: vscode.TextLine = document.lineAt(selection.active.line);
          const adjustedSelection = new vscode.Selection(
            new vscode.Position(line.range.end.line, line.range.end.character),
            new vscode.Position(line.range.end.line, line.range.end.character)
          );
          return adjustedSelection;
        }
      );
    }
  }
}

function highlightAllConsoleLogs() {
  const activeTextEditor: vscode.TextEditor | undefined =
    vscode.window.activeTextEditor;
  if (activeTextEditor) {
    const document: vscode.TextDocument = activeTextEditor.document;
    const decorationType: vscode.TextEditorDecorationType =
      vscode.window.createTextEditorDecorationType({
        borderColor: "#FFB471",
        borderWidth: "1px",
        borderStyle: "solid",
      });
    const decorations: any[] = [];

    for (
      let lineIndex: number = 0;
      lineIndex < document.lineCount;
      lineIndex++
    ) {
      const line: vscode.TextLine = document.lineAt(lineIndex);
      if (
        line.text.includes("console.log") &&
        !line.text.includes("'console.log'") &&
        !line.text.includes('"console.log"')
      ) {
        const startPosition: vscode.Position = line.range.start;
        const endPosition: vscode.Position = line.range.end;
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
  const activeTextEditor: vscode.TextEditor | undefined =
    vscode.window.activeTextEditor;
  if (activeTextEditor) {
    const document: vscode.TextDocument = activeTextEditor.document;
    const decorationType: vscode.TextEditorDecorationType =
      vscode.window.createTextEditorDecorationType({
        borderColor: "#FFB471",
        borderWidth: "1px",
        borderStyle: "solid",
      });

    let targetLineIndex: number | undefined = undefined;

    for (
      let lineIndex: number = 0;
      lineIndex < document.lineCount;
      lineIndex++
    ) {
      const line: vscode.TextLine = document.lineAt(lineIndex);
      if (
        line.text.includes("console.log") &&
        !line.text.includes("'console.log'") &&
        !line.text.includes('"console.log"')
      ) {
        const startPosition: vscode.Position = line.range.start;
        const endPosition: vscode.Position = line.range.end;
        const range = new vscode.Range(startPosition, endPosition);
        activeTextEditor.setDecorations(decorationType, [{ range }]);
        targetLineIndex = lineIndex;
        break; // Stop after locating the first occurrence
      }
    }

    if (typeof targetLineIndex !== "undefined") {
      const targetPosition = new vscode.Position(targetLineIndex, 0);
      activeTextEditor.selection = new vscode.Selection(
        targetPosition,
        targetPosition
      );
      activeTextEditor.revealRange(
        new vscode.Range(targetPosition, targetPosition),
        vscode.TextEditorRevealType.Default
      );
    }

    const disposable = vscode.window.onDidChangeTextEditorSelection((event) => {
      if (event.textEditor === activeTextEditor) {
        activeTextEditor.setDecorations(decorationType, []);
        disposable.dispose();
      }
    });
  }
}

async function deleteAllConsoleLogs() {
  const activeTextEditor: vscode.TextEditor | undefined =
    vscode.window.activeTextEditor;
  if (activeTextEditor) {
    const document: vscode.TextDocument = activeTextEditor.document;
    const edit = new vscode.WorkspaceEdit();

    const consoleLogRegex = /(^|\s)(\/\/\s*)?console\.log\([^)]*\);/g;

    for (
      let lineIndex: number = 0;
      lineIndex < document.lineCount;
      lineIndex++
    ) {
      const line: vscode.TextLine = document.lineAt(lineIndex);
      const match: RegExpMatchArray | null = line.text.match(consoleLogRegex);
      if (match) {
        const range = line.range;
        edit.delete(document.uri, range);
      }
    }

    // Apply the workspace edit
    await vscode.workspace.applyEdit(edit);
  }
}

async function uncommentAllConsoleLogs() {
  const activeTextEditor: vscode.TextEditor | undefined =
    vscode.window.activeTextEditor;
  if (activeTextEditor) {
    const document: vscode.TextDocument = activeTextEditor.document;
    const edit = new vscode.WorkspaceEdit();

    const commentedConsoleLogRegex = /^\s*\/\/\s*console\.log\([^)]*\);/gm;

    for (
      let lineIndex: number = 0;
      lineIndex < document.lineCount;
      lineIndex++
    ) {
      const line: vscode.TextLine = document.lineAt(lineIndex);
      const match: RegExpMatchArray | null = line.text.match(
        commentedConsoleLogRegex
      );
      if (match) {
        const range = line.range;
        const uncommentedLine: string = line.text.replace(/\/\//, "");
        edit.replace(document.uri, range, uncommentedLine);
      }
    }

    // Apply the workspace edit
    await vscode.workspace.applyEdit(edit);
  }
}

export function deactivate() {
  // Clean up resources
  if (statusBarItem) {
    statusBarItem.dispose();
  }
  if (timeout) {
    clearTimeout(timeout);
  }
}
