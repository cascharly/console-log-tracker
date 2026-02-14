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
let currentLogLocations: { range: vscode.Range; method: string }[] = [];

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
    vscode.commands.registerCommand('extension.nextLog', () => navigateLogs(currentLogLocations.map(l => l.range), 1)),
    vscode.commands.registerCommand('extension.previousLog', () => navigateLogs(currentLogLocations.map(l => l.range), -1)),
    vscode.commands.registerCommand('extension.highlightLogs', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const config = getConfiguration();
        applyDecorations(editor, currentLogLocations);

        // Only clear highlights on selection change if keepHighlights is disabled
        if (!config.keepHighlights) {
          const startLine = editor.selection.active.line;
          const disposable = vscode.window.onDidChangeTextEditorSelection((e) => {
            if (e.textEditor === editor) {
              const currentConfig = getConfiguration();
              // Only clear if we moved to a DIFFERENT line than where we started the highlight
              if (!currentConfig.keepHighlights && e.selections[0].active.line !== startLine) {
                applyDecorations(editor, []);
                disposable.dispose();
              }
            }
          });
          // Also clear on typing
          const docDisposable = vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document === editor.document) {
              applyDecorations(editor, []);
              docDisposable.dispose();
            }
          });
        }
      }
    }),
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
  // Only scan supported languages
  const supportedLanguages = ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'];
  if (!supportedLanguages.includes(document.languageId)) {
    return;
  }

  const config = getConfiguration();
  const result = scanDocument(document);
  currentLogLocations = result.locations;

  updateStatusBar(result.count);

  const editor = vscode.window.activeTextEditor;
  if (editor && editor.document === document) {
    if (config.keepHighlights) {
      applyDecorations(editor, currentLogLocations);
    } else {
      // If keepHighlights is disabled, clear any existing highlights 
      // unless they are temporary (but since this is called on change/refresh, 
      // it's generally safe to clear them or leave them alone).
      // Clearing them here handles the case where the user toggles the setting off.
      applyDecorations(editor, []);
    }
  }
}

export function deactivate() {
  disposeStatusBar();
  disposeDecorations();
  if (timeout) {
    clearTimeout(timeout);
  }
}