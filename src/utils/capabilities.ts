import * as vscode from 'vscode';

/**
 * VS Code version information
 */
interface VSCodeVersion {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
}

/**
 * Capabilities supported by the current VS Code version
 */
export interface Capabilities {
    readonly hasQuickPickIcons: boolean;
    readonly hasOverviewRuler: boolean;
    readonly hasStatusBarTooltip: boolean;
    readonly hasOptionalChaining: boolean;
    readonly hasCodeActionsProvider: boolean;
    readonly hasConfigurationDefaults: boolean;
}

let cachedCapabilities: Capabilities | undefined;

/**
 * Parses VS Code version string
 */
function parseVersion(versionString: string): VSCodeVersion {
    const parts = versionString.split('.');
    return {
        major: parseInt(parts[0] || '0', 10),
        minor: parseInt(parts[1] || '0', 10),
        patch: parseInt(parts[2] || '0', 10)
    };
}

/**
 * Detects available capabilities based on VS Code version and feature detection
 */
export function detectCapabilities(): Capabilities {
    if (cachedCapabilities) {
        return cachedCapabilities;
    }

    const version = parseVersion(vscode.version);

    // Feature detection for capabilities
    const capabilities: Capabilities = {
        // Quick Pick icons (1.44.0+)
        hasQuickPickIcons: version.major > 1 || (version.major === 1 && version.minor >= 44),

        // Overview ruler (1.0.0+) - available in all modern versions
        hasOverviewRuler: true,

        // Status bar tooltip (1.30.0+)
        hasStatusBarTooltip: version.major > 1 || (version.major === 1 && version.minor >= 30),

        // Optional chaining support in extension host (1.50.0+)
        hasOptionalChaining: version.major > 1 || (version.major === 1 && version.minor >= 50),

        // Code actions provider V2 (1.40.0+)
        hasCodeActionsProvider: version.major > 1 || (version.major === 1 && version.minor >= 40),

        // Configuration defaults (1.0.0+)
        hasConfigurationDefaults: true
    };

    cachedCapabilities = capabilities;
    return capabilities;
}

/**
 * Gets current capabilities (cached)
 */
export function getCapabilities(): Capabilities {
    return cachedCapabilities || detectCapabilities();
}

/**
 * Clears capability cache (useful for testing)
 */
export function clearCapabilitiesCache(): void {
    cachedCapabilities = undefined;
}
