import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;

export function initStatusBar(context: vscode.ExtensionContext) {
    statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    statusBarItem.command = 'extension.showMenu';
    context.subscriptions.push(statusBarItem);
    return statusBarItem;
}

export function updateStatusBar(totalCount: number) {
    if (!statusBarItem) {
        return;
    }

    statusBarItem.text = `$(terminal) ${totalCount} Logs`;
    statusBarItem.tooltip = `${totalCount} console logs found in file. Click for actions.`;
    statusBarItem.show();
}

export function disposeStatusBar() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}
