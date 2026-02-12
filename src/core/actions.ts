import * as vscode from 'vscode';
import { getConfiguration } from '../configuration';

/**
 * Comments out all console logs in the given document
 */
export async function commentAllConsoleLogs(document: vscode.TextDocument): Promise<void> {
    const edit = new vscode.WorkspaceEdit();
    const config = getConfiguration();
    const methods = config.methods.join('|');
    const regex = new RegExp(`^(\\s*)(console\\.(${methods})\\(.*\\);?)`, 'gm');

    const text = document.getText();
    let match;
    while ((match = regex.exec(text)) !== null) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        edit.replace(document.uri, new vscode.Range(startPos, endPos), `${match[1]}// ${match[2]}`);
    }
    await vscode.workspace.applyEdit(edit);
}

/**
 * Uncomments all commented out console logs in the given document
 */
export async function uncommentAllConsoleLogs(document: vscode.TextDocument): Promise<void> {
    const edit = new vscode.WorkspaceEdit();
    const config = getConfiguration();
    const methods = config.methods.join('|');
    const regex = new RegExp(`^(\\s*)\\/\\/\\s*(console\\.(${methods})\\(.*\\);?)`, 'gm');

    const text = document.getText();
    let match;
    while ((match = regex.exec(text)) !== null) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        edit.replace(document.uri, new vscode.Range(startPos, endPos), `${match[1]}${match[2]}`);
    }
    await vscode.workspace.applyEdit(edit);
}

/**
 * Deletes all console logs from the given document
 */
export async function deleteAllConsoleLogs(document: vscode.TextDocument): Promise<void> {
    const edit = new vscode.WorkspaceEdit();
    const config = getConfiguration();
    const methods = config.methods.join('|');
    const regex = new RegExp(`^.*console\\.(${methods})\\(.*\\);?\\r?\\n?`, 'gm');

    const text = document.getText();
    let match;
    while ((match = regex.exec(text)) !== null) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        edit.delete(document.uri, new vscode.Range(startPos, endPos));
    }
    await vscode.workspace.applyEdit(edit);
}
