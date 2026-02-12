import * as vscode from 'vscode';
import { getConfiguration } from './configuration';
import { scanDocument } from './core/scanner';
import { commentAllConsoleLogs, uncommentAllConsoleLogs, deleteAllConsoleLogs } from './core/actions';
import { initStatusBar, updateStatusBar, disposeStatusBar } from './ui/statusBar';
import { updateDecorationType, applyDecorations, disposeDecorations } from './ui/decorations';
import { navigateLogs } from './ui/navigation';
import { showQuickPickMenu } from './ui/menu';
import { ConsoleActionProvider } from './providers/codeActions';

let timeout: NodeJS.Timeout | undefined;
let currentLogLocations: vscode.Range[] = [];

export function activate(context: vscode.ExtensionContext) {
  // Initialize UI
  initStatusBar(context);
  updateDecorationType();

  // --- Configuration Watcher ---
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('consoleLogTracker')) {
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
        performScan(editor.document);
      }
    }),
    vscode.workspace.onWillSaveTextDocument((e) => {
      const config = getConfiguration();
      if (config.autoCleanupOnSave) {
        commentAllConsoleLogs(e.document);
      }
    })
  );

  // --- Commands ---
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.showMenu', showQuickPickMenu),
    vscode.commands.registerCommand('extension.nextLog', () => navigateLogs(currentLogLocations, 1)),
    vscode.commands.registerCommand('extension.previousLog', () => navigateLogs(currentLogLocations, -1)),
    vscode.commands.registerCommand('extension.commentAllLogs', (range?: vscode.Range) => {
      const editor = vscode.window.activeTextEditor;
      if (editor) { commentAllConsoleLogs(editor.document, range); }
    }),
    vscode.commands.registerCommand('extension.uncommentAllLogs', (range?: vscode.Range) => {
      const editor = vscode.window.activeTextEditor;
      if (editor) { uncommentAllConsoleLogs(editor.document, range); }
    }),
    vscode.commands.registerCommand('extension.deleteAllLogs', (range?: vscode.Range) => {
      const editor = vscode.window.activeTextEditor;
      if (editor) { deleteAllConsoleLogs(editor.document, range); }
    })
  );

  // --- Code Actions ---
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
      new ConsoleActionProvider(),
      {
        providedCodeActionKinds: ConsoleActionProvider.providedCodeActionKinds
      }
    )
  );

  // Initial scan
  refresh();
}

function refresh() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    performScan(editor.document);
  }
  console.log('refresh');
}

console.log('refresh');

function debouncedScan(document: vscode.TextDocument) {
  if (timeout) {
    clearTimeout(timeout);
  }
  const config = getConfiguration();

  timeout = setTimeout(() => {
    performScan(document);
  }, config.debounceTimeout);
}

function performScan(document: vscode.TextDocument) {
  const result = scanDocument(document);
  currentLogLocations = result.locations;

  updateStatusBar(result.count);

  const editor = vscode.window.activeTextEditor;
  if (editor && editor.document === document) {
    applyDecorations(editor, currentLogLocations);
  }
}

export function deactivate() {
  disposeStatusBar();
  disposeDecorations();
  if (timeout) {
    clearTimeout(timeout);
  }
}