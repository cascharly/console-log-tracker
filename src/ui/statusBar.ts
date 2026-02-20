import * as vscode from 'vscode';
import { getCapabilities } from '../utils/capabilities';

let statusBarItem: vscode.StatusBarItem;

export function initStatusBar(context: vscode.ExtensionContext): vscode.StatusBarItem {
    statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    statusBarItem.command = 'extension.showMenu';
    context.subscriptions.push(statusBarItem);
    return statusBarItem;
}

export function updateStatusBar(totalCount: number): void {
    if (!statusBarItem) {
        return;
    }

    if (totalCount === 0) {
        const showOnZero = vscode.workspace.getConfiguration('consoleLogTracker').get('showStatusOnZeroLogs', false);
        if (!showOnZero) {
            statusBarItem.hide();
            return;
        }
    }

    const capabilities = getCapabilities();
    statusBarItem.text = `$(list-unordered) ${totalCount} Logs`;

    // Only set tooltip if supported (VS Code 1.30.0+)
    if (capabilities.hasStatusBarTooltip) {
        statusBarItem.tooltip = `${totalCount} console logs found in file. Click for actions.`;
    }

    statusBarItem.show();
}

export function hideStatusBar(): void {
    if (statusBarItem) {
        statusBarItem.hide();
    }
}

export function disposeStatusBar(): void {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}
