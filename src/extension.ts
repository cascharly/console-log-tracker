import * as vscode from 'vscode';
import type { Config } from './configuration';
import { getConfiguration } from './configuration';
import type { ScanLocation } from './core/scanner';
import { scanDocument } from './core/scanner';
import { commentAllConsoleLogs, uncommentAllConsoleLogs, deleteAllConsoleLogs } from './core/actions';
import { initStatusBar, updateStatusBar, disposeStatusBar } from './ui/statusBar';
import { updateDecorationType, applyDecorations, disposeDecorations } from './ui/decorations';
import { navigateLogs } from './ui/navigation';
import { showQuickPickMenu } from './ui/menu';
import { ConsoleActionProvider } from './providers/codeActions';

/**
 * Supported languages for console log tracking
 */
const SUPPORTED_LANGUAGES = ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'] as const;

/**
 * Extension state
 */
let debounceTimeout: NodeJS.Timeout | undefined;
let currentLogLocations: ReadonlyArray<ScanLocation> = [];

/**
 * Activates the extension
 */
export function activate(context: vscode.ExtensionContext): void {
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
      handleDocumentChange(e.document);
    }),
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        performScan(editor.document);
      }
    }),
    vscode.workspace.onWillSaveTextDocument((e) => {
      const config = getConfiguration();
      if (config.autoCleanupOnSave) {
        void commentAllConsoleLogs(e.document);
      }
    })
  );

  // --- Commands ---
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.showMenu', showQuickPickMenu),
    vscode.commands.registerCommand('extension.nextLog', () => {
      const ranges = currentLogLocations.map(l => l.range);
      return navigateLogs(ranges, 1);
    }),
    vscode.commands.registerCommand('extension.previousLog', () => {
      const ranges = currentLogLocations.map(l => l.range);
      return navigateLogs(ranges, -1);
    }),
    vscode.commands.registerCommand('extension.highlightLogs', handleHighlightCommand),
    vscode.commands.registerCommand('extension.commentAllLogs', (range?: vscode.Range) => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        void commentAllConsoleLogs(editor.document, range);
      }
    }),
    vscode.commands.registerCommand('extension.uncommentAllLogs', (range?: vscode.Range) => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        void uncommentAllConsoleLogs(editor.document, range);
      }
    }),
    vscode.commands.registerCommand('extension.deleteAllLogs', (range?: vscode.Range) => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        void deleteAllConsoleLogs(editor.document, range);
      }
    })
  );

  // --- Code Actions ---
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      [...SUPPORTED_LANGUAGES],
      new ConsoleActionProvider(),
      {
        providedCodeActionKinds: ConsoleActionProvider.providedCodeActionKinds
      }
    )
  );

  // Initial scan
  refresh();
}

/**
 * Handles the highlight logs command
 */
function handleHighlightCommand(): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const config = getConfiguration();
  applyDecorations(editor, currentLogLocations);

  // Only setup temporary highlight clearing if keepHighlights is disabled
  if (!config.keepHighlights) {
    setupTemporaryHighlightClearing(editor);
  }
}

/**
 * Sets up listeners to clear temporary highlights
 */
function setupTemporaryHighlightClearing(editor: vscode.TextEditor): void {
  const startLine = editor.selection.active.line;
  const disposables: vscode.Disposable[] = [];

  // Clear on line change
  const selectionDisposable = vscode.window.onDidChangeTextEditorSelection((e) => {
    if (e.textEditor === editor) {
      const config = getConfiguration();
      const movedToNewLine = e.selections[0]?.active.line !== startLine;

      if (!config.keepHighlights && movedToNewLine) {
        applyDecorations(editor, []);
        disposeAll(disposables);
      }
    }
  });

  // Clear on typing
  const documentDisposable = vscode.workspace.onDidChangeTextDocument((e) => {
    if (e.document === editor.document) {
      applyDecorations(editor, []);
      disposeAll(disposables);
    }
  });

  disposables.push(selectionDisposable, documentDisposable);
}

/**
 * Disposes all disposables in the array
 */
function disposeAll(disposables: vscode.Disposable[]): void {
  for (const disposable of disposables) {
    disposable.dispose();
  }
  disposables.length = 0;
}

/**
 * Refreshes the scan for the active editor
 */
function refresh(): void {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    performScan(editor.document);
  }
}

/**
 * Handles document changes with debouncing
 */
function handleDocumentChange(document: vscode.TextDocument): void {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }

  const config = getConfiguration();
  debounceTimeout = setTimeout(() => {
    performScan(document);
  }, config.debounceTimeout);
}

/**
 * Scans a document for console logs and updates UI
 */
function performScan(document: vscode.TextDocument): void {
  // Only scan supported languages
  if (!isSupportedLanguage(document.languageId)) {
    return;
  }

  const config = getConfiguration();
  const result = scanDocument(document);
  currentLogLocations = result.locations;

  updateStatusBar(result.count);

  const editor = vscode.window.activeTextEditor;
  if (editor?.document === document) {
    if (config.keepHighlights) {
      applyDecorations(editor, currentLogLocations);
    } else {
      // Clear highlights when setting is disabled
      applyDecorations(editor, []);
    }
  }
}

/**
 * Type guard to check if a language is supported
 */
function isSupportedLanguage(languageId: string): languageId is typeof SUPPORTED_LANGUAGES[number] {
  return SUPPORTED_LANGUAGES.includes(languageId as typeof SUPPORTED_LANGUAGES[number]);
}

/**
 * Deactivates the extension
 */
export function deactivate(): void {
  disposeStatusBar();
  disposeDecorations();

  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
}
