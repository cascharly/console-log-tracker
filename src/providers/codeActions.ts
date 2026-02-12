import * as vscode from 'vscode';
import { getConfiguration } from '../configuration';

/**
 * Code Action Provider for log-specific quick fixes
 */
export class ConsoleActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range
    ): vscode.CodeAction[] {
        const config = getConfiguration();
        const methods = config.methods.join('|');
        const line = document.lineAt(range.start.line).text;

        if (!line.includes(`console.`)) {
            return [];
        }

        const actions: vscode.CodeAction[] = [];
        const logRegex = new RegExp(`console\\.(${methods})\\(`);

        // Check if the current line has an active console log
        if (logRegex.test(line)) {
            const commentAction = new vscode.CodeAction(
                'Comment out this log',
                vscode.CodeActionKind.QuickFix
            );
            // We pass the document uri to the command if needed, but for now we reuse the existing batch commands
            commentAction.command = {
                command: 'extension.commentAllLogs',
                title: 'Comment'
            };
            actions.push(commentAction);

            const deleteAction = new vscode.CodeAction(
                'Delete this log',
                vscode.CodeActionKind.QuickFix
            );
            deleteAction.command = {
                command: 'extension.deleteAllLogs',
                title: 'Delete'
            };
            actions.push(deleteAction);
        }

        return actions;
    }
}
