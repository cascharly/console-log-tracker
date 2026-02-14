# Progressive Enhancement

This extension is designed to work across a wide range of VS Code versions (1.30.0+) using progressive enhancement. Features are enabled based on the capabilities of the installed VS Code version.

## Supported VS Code Versions

### Minimum Version: 1.30.0
The extension will run on VS Code 1.30.0 and later.

### Recommended Version: 1.50.0+
For the best experience with all features enabled.

## Feature Availability by Version

### All Versions (1.30.0+)
✅ Core functionality:
- Scan and count console logs
- Navigate between logs
- Comment/uncomment/delete logs
- Status bar counter
- Quick Pick menu
- Configuration options
- Code actions

### VS Code 1.30.0+
✅ Status bar tooltips

### VS Code 1.40.0+
✅ Enhanced code actions provider

### VS Code 1.44.0+
✅ Icons in Quick Pick menu
- Without icons: Text-only menu items (e.g., "Keep Highlights")
- With icons: Visual icons enhance the menu (e.g., "$(eye) Keep Highlights")

### VS Code 1.50.0+
✅ Optional chaining support in extension code
✅ All modern TypeScript features

## How It Works

The extension uses **capability detection** to determine what features are available:

```typescript
// capabilities.ts
export interface Capabilities {
    readonly hasQuickPickIcons: boolean;      // 1.44.0+
    readonly hasOverviewRuler: boolean;       // 1.0.0+ (always available)
    readonly hasStatusBarTooltip: boolean;    // 1.30.0+
    readonly hasOptionalChaining: boolean;    // 1.50.0+
    readonly hasCodeActionsProvider: boolean; // 1.40.0+
}
```

Features gracefully degrade on older versions:
- **Icons**: Fall back to text-only labels
- **Tooltips**: Omitted if not supported
- **Overview Ruler**: Omitted if not supported

## Testing Compatibility

To test on different VS Code versions:

1. Install the specific version you want to test
2. Install the extension
3. Verify core functionality works
4. Check that features degrade gracefully

## Updating Minimum Version

If you need to use a newer API:

1. Update `package.json` engine requirement
2. Add capability detection in `src/utils/capabilities.ts`
3. Update this documentation
4. Test on the new minimum version

## Development Notes

When adding new features:

1. **Check API availability**: Consult VS Code API documentation
2. **Add capability check**: Update `capabilities.ts` if needed
3. **Implement progressive enhancement**: Use feature detection
4. **Test degradation**: Verify behavior on older versions
5. **Document**: Update this file with feature requirements
