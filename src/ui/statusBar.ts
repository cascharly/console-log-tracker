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

export function updateStatusBar(count: number) {
    if (!statusBarItem) {
        return;
    }

    if (count > 0) {
        statusBarItem.text = `$(list-unordered) ${count} logs found`;
        statusBarItem.show();
    } else {
        statusBarItem.hide();
    }
}

export function disposeStatusBar() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}
