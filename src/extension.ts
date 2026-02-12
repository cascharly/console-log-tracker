import * as vscode from "vscode";

let statusBarItem: vscode.StatusBarItem;
let timeout: NodeJS.Timeout | undefined;
let decorationType: vscode.TextEditorDecorationType | undefined;
let logLocations: vscode.Range[] = [];

export function activate(context: vscode.ExtensionContext) {
  // Initialize Status Bar
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = "extension.showMenu";
  context.subscriptions.push(statusBarItem);

  // Initialize Decoration Type from config
  updateDecorationType();

  // --- Configuration ---
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("consoleLogTracker")) {
        updateDecorationType();
        refresh();
      }
    })
  );

  // --- Event Listeners ---
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      debouncedScan(e.document);
    }),
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        scanDocument(editor.document);
      }
    }),
    vscode.workspace.onWillSaveTextDocument((e) => {
      const config = vscode.workspace.getConfiguration("consoleLogTracker");
      if (config.get("autoCleanupOnSave")) {
        commentAllConsoleLogs(e.document);
      }
    })
  );

  // --- Commands ---
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.showMenu", showMenu),
    vscode.commands.registerCommand("extension.nextLog", () => navigateLogs(1)),
    vscode.commands.registerCommand("extension.previousLog", () => navigateLogs(-1)),
    vscode.commands.registerCommand("extension.commentAllLogs", () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) { commentAllConsoleLogs(editor.document); }
    }),
    vscode.commands.registerCommand("extension.uncommentAllLogs", () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) { uncommentAllConsoleLogs(editor.document); }
    }),
    vscode.commands.registerCommand("extension.deleteAllLogs", () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) { deleteAllConsoleLogs(editor.document); }
    })
  );

  // --- Code Actions ---
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      ["javascript", "typescript", "javascriptreact", "typescriptreact"],
      new ConsoleActionProvider(),
      {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
      }
    )
  );

  // Initial scan
  refresh();
}

/**
 * Updates the decoration style based on user settings
 */
function updateDecorationType() {
  if (decorationType) {
    decorationType.dispose();
  }
  const config = vscode.workspace.getConfiguration("consoleLogTracker");
  const color = config.get<string>("highlightColor", "#FFB471");

  decorationType = vscode.window.createTextEditorDecorationType({
    borderColor: color,
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: "2px",
    overviewRulerColor: color,
    overviewRulerLane: vscode.OverviewRulerLane.Right
  });
}

/**
 * Triggers a scan of the current document
 */
function refresh() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    scanDocument(editor.document);
  }
}

/**
 * Debounced scan to avoid performance issues during typing
 */
function debouncedScan(document: vscode.TextDocument) {
  if (timeout) {
    clearTimeout(timeout);
  }
  const config = vscode.workspace.getConfiguration("consoleLogTracker");
  const delay = config.get<number>("debounceTimeout", 1000);

  timeout = setTimeout(() => {
    scanDocument(document);
  }, delay);
}

/**
 * Core scanning logic
 */
function scanDocument(document: vscode.TextDocument) {
  const config = vscode.workspace.getConfiguration("consoleLogTracker");
  if (!config.get("enabled")) {
    statusBarItem.hide();
    return;
  }

  const methods = config.get<string[]>("methods", ["log"]);
  const methodsRegex = methods.join("|");
  const regex = new RegExp(`(?<!\\/\\/.*|\\/\\*.*)console\\.(${methodsRegex})\\(`, "g");

  logLocations = [];
  const text = document.getText();
  let match;

  while ((match = regex.exec(text)) !== null) {
    const startPos = document.positionAt(match.index);
    const endPos = document.lineAt(startPos.line).range.end;
    logLocations.push(new vscode.Range(startPos, endPos));
  }

  updateUI(logLocations.length);
}

function updateUI(count: number) {
  if (count > 0) {
    statusBarItem.text = `$(list-unordered) ${count} logs found`;
    statusBarItem.show();
  } else {
    statusBarItem.hide();
  }

  const editor = vscode.window.activeTextEditor;
  if (editor && decorationType) {
    editor.setDecorations(decorationType, logLocations);
  }
}

/**
 * Modern QuickPick Menu
 */
async function showMenu() {
  const items: vscode.QuickPickItem[] = [
    { label: "$(search) Locate All", detail: "Highlight all logs in current file", id: "locate" } as any,
    { label: "$(arrow-down) Next Log", detail: "Jump to the next occurrence", id: "next" } as any,
    { label: "$(comment) Comment All", detail: "Prefix all logs with //", id: "comment" } as any,
    { label: "$(comment-discussion) Uncomment All", detail: "Remove // from logs", id: "uncomment" } as any,
    { label: "$(trash) Delete All", detail: "Remove all logs from file", id: "delete" } as any,
    { label: "$(settings-gear) Settings", detail: "Open extension settings", id: "settings" } as any
  ];

  const selection = await vscode.window.showQuickPick(items, {
    placeHolder: "Console Log Tracker Actions"
  });

  if (!selection) {
    return;
  }

  switch ((selection as any).id) {
    case "locate": navigateLogs(0); break;
    case "next": navigateLogs(1); break;
    case "comment": vscode.commands.executeCommand("extension.commentAllLogs"); break;
    case "uncomment": vscode.commands.executeCommand("extension.uncommentAllLogs"); break;
    case "delete": vscode.commands.executeCommand("extension.deleteAllLogs"); break;
    case "settings": vscode.commands.executeCommand("workbench.action.openSettings", "consoleLogTracker"); break;
  }
}

/**
 * Handles navigation between logs
 */
function navigateLogs(direction: number) {
  const editor = vscode.window.activeTextEditor;
  if (!editor || logLocations.length === 0) {
    return;
  }

  const currentPos = editor.selection.active;
  let targetIndex = 0;

  if (direction === 0) {
    targetIndex = 0;
  } else {
    // Find the next/previous log relative to cursor
    if (direction > 0) {
      targetIndex = logLocations.findIndex(r => r.start.isAfter(currentPos));
      if (targetIndex === -1) {
        targetIndex = 0;
      }
    } else {
      targetIndex = logLocations.slice().reverse().findIndex(r => r.start.isBefore(currentPos));
      if (targetIndex === -1) {
        targetIndex = logLocations.length - 1;
      } else {
        targetIndex = logLocations.length - 1 - targetIndex;
      }
    }
  }

  const targetRange = logLocations[targetIndex];
  editor.selection = new vscode.Selection(targetRange.start, targetRange.start);
  editor.revealRange(targetRange, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
}

/**
 * Batch Actions
 */
async function commentAllConsoleLogs(document: vscode.TextDocument) {
  const edit = new vscode.WorkspaceEdit();
  const config = vscode.workspace.getConfiguration("consoleLogTracker");
  const methods = config.get<string[]>("methods", ["log"]).join("|");
  const regex = new RegExp(`^(\\s*)(console\\.(${methods})\\(.*\\);?)`, "gm");

  const text = document.getText();
  let match;
  while ((match = regex.exec(text)) !== null) {
    const startPos = document.positionAt(match.index);
    const endPos = document.positionAt(match.index + match[0].length);
    edit.replace(document.uri, new vscode.Range(startPos, endPos), `${match[1]}// ${match[2]}`);
  }
  await vscode.workspace.applyEdit(edit);
}

async function uncommentAllConsoleLogs(document: vscode.TextDocument) {
  const edit = new vscode.WorkspaceEdit();
  const config = vscode.workspace.getConfiguration("consoleLogTracker");
  const methods = config.get<string[]>("methods", ["log"]).join("|");
  const regex = new RegExp(`^(\\s*)\\/\\/\\s*(console\\.(${methods})\\(.*\\);?)`, "gm");

  const text = document.getText();
  let match;
  while ((match = regex.exec(text)) !== null) {
    const startPos = document.positionAt(match.index);
    const endPos = document.positionAt(match.index + match[0].length);
    edit.replace(document.uri, new vscode.Range(startPos, endPos), `${match[1]}${match[2]}`);
  }
  await vscode.workspace.applyEdit(edit);
}

async function deleteAllConsoleLogs(document: vscode.TextDocument) {
  const edit = new vscode.WorkspaceEdit();
  const config = vscode.workspace.getConfiguration("consoleLogTracker");
  const methods = config.get<string[]>("methods", ["log"]).join("|");
  const regex = new RegExp(`^.*console\\.(${methods})\\(.*\\);?\\r?\\n?`, "gm");

  const text = document.getText();
  let match;
  while ((match = regex.exec(text)) !== null) {
    const startPos = document.positionAt(match.index);
    const endPos = document.positionAt(match.index + match[0].length);
    edit.delete(document.uri, new vscode.Range(startPos, endPos));
  }
  await vscode.workspace.applyEdit(edit);
}

/**
 * Code Action Provider for lightbulbs
 */
class ConsoleActionProvider implements vscode.CodeActionProvider {
  public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] {
    const config = vscode.workspace.getConfiguration("consoleLogTracker");
    const methods = config.get<string[]>("methods", ["log"]).join("|");
    const line = document.lineAt(range.start.line);

    if (!line.text.includes(`console.`)) {
      return [];
    }

    const actions: vscode.CodeAction[] = [];

    // Check for active log
    if (new RegExp(`console\\.(${methods})\\(`).test(line.text)) {
      const commentAction = new vscode.CodeAction("Comment out this log", vscode.CodeActionKind.QuickFix);
      commentAction.command = { command: "extension.commentAllLogs", title: "Comment", arguments: [document] }; // Mocking single line for now
      actions.push(commentAction);

      const deleteAction = new vscode.CodeAction("Delete this log", vscode.CodeActionKind.QuickFix);
      deleteAction.command = { command: "extension.deleteAllLogs", title: "Delete" };
      actions.push(deleteAction);
    }

    return actions;
  }
}

export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
  if (timeout) {
    clearTimeout(timeout);
  }
  if (decorationType) {
    decorationType.dispose();
  }
}
