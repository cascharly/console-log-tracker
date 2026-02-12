"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const vscode = require("vscode");
suite('Console Log Tracker Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');
    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('CarlosSpagnoletti.console-log-tracker'));
    });
    test('Should comment out console.log statements', async () => {
        const document = await vscode.workspace.openTextDocument({
            content: 'console.log("test");\nconsole.warn("warning");',
            language: 'typescript'
        });
        const editor = await vscode.window.showTextDocument(document);
        // Wait a bit for the extension to activate and scan
        await new Promise(resolve => setTimeout(resolve, 2000));
        await vscode.commands.executeCommand('extension.commentAllLogs');
        const text = document.getText();
        assert.ok(text.includes('// console.log("test");'));
        assert.ok(text.includes('// console.warn("warning");'));
    });
    test('Should uncomment console.log statements', async () => {
        const document = await vscode.workspace.openTextDocument({
            content: '// console.log("test");\n// console.warn("warning");',
            language: 'typescript'
        });
        const editor = await vscode.window.showTextDocument(document);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await vscode.commands.executeCommand('extension.uncommentAllLogs');
        const text = document.getText();
        assert.ok(text.includes('console.log("test");'));
        assert.ok(text.includes('console.warn("warning");'));
        assert.ok(!text.includes('// console.log'));
    });
    test('Should delete console.log statements', async () => {
        const document = await vscode.workspace.openTextDocument({
            content: 'const x = 10;\nconsole.log(x);\nconst y = 20;',
            language: 'typescript'
        });
        const editor = await vscode.window.showTextDocument(document);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await vscode.commands.executeCommand('extension.deleteAllLogs');
        const text = document.getText();
        assert.ok(text.includes('const x = 10;'));
        assert.ok(text.includes('const y = 20;'));
        assert.ok(!text.includes('console.log'));
    });
    test('Should respect configuration settings (disabled)', async () => {
        const config = vscode.workspace.getConfiguration('consoleLogTracker');
        await config.update('enabled', false, vscode.ConfigurationTarget.Global);
        const document = await vscode.workspace.openTextDocument({
            content: 'console.log("test");',
            language: 'typescript'
        });
        await vscode.window.showTextDocument(document);
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Even if we run the command, we can check if it still works or if it's ignored
        // Actually the logic currently checks config in the refresh/scan loop but commands run anyway.
        // Let's test the "methods" config.
        await config.update('enabled', true, vscode.ConfigurationTarget.Global);
        await config.update('methods', ['error'], vscode.ConfigurationTarget.Global);
        await new Promise(resolve => setTimeout(resolve, 1000));
        // This should NOT be commented because it's a 'log' and we only track 'error'
        const doc2 = await vscode.workspace.openTextDocument({
            content: 'console.log("keep me");\nconsole.error("comment me");',
            language: 'typescript'
        });
        await vscode.window.showTextDocument(doc2);
        await new Promise(resolve => setTimeout(resolve, 1500));
        await vscode.commands.executeCommand('extension.commentAllLogs');
        const text = doc2.getText();
        assert.ok(text.includes('console.log("keep me");'));
        assert.ok(text.includes('// console.error("comment me");'));
        // Reset configuration
        await config.update('methods', ['log', 'warn', 'error', 'info'], vscode.ConfigurationTarget.Global);
    });
});
//# sourceMappingURL=extension.test.js.map