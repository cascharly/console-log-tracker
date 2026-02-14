# Change Log

All notable changes to the "console-log-tracker" extension will be documented in this file.

## [0.2.0] - 2026-02-14

### Added
- **Progressive Enhancement**: Extension now supports VS Code versions from 1.30.0+ with automatic capability detection
- **Per-Method Custom Colors**: Configure different highlight colors for `log`, `warn`, `error`, `info` methods
- **Keep Highlights Toggle**: New setting to keep console log highlights persistent or temporary
- **Active/Commented Log Distinction**: Scanner now identifies and tracks both active and commented console logs
- **Quick Pick Icons**: Visual icons in menu for better UX (on VS Code 1.44.0+)
- **Capability Detection System**: Automatic feature detection based on VS Code version
- **Progressive Enhancement Documentation**: Comprehensive docs on version compatibility

### Changed
- **Major Code Refactoring**: Complete TypeScript refactor following best practices
  - Readonly interfaces and arrays for immutability
  - Type-first development with explicit types
  - Pure functions and better separation of concerns
  - Comprehensive JSDoc documentation
- **Improved Status Bar**: Now shows total console log count independently of highlight state
- **Better Type Safety**: Enhanced type checking throughout codebase
- **Optimized Scanner**: Single-pass active count calculation for better performance
- **Smarter Highlight Clearing**: Temporary highlights only clear when moving to different line or typing
- **Updated Minimum VS Code Version**: Lowered to 1.30.0 (from 1.107.0) for broader compatibility

### Fixed
- Status bar counter now accurately reflects all console logs (including commented) at all times
- Fixed status bar showing "0 logs" when toggling highlight settings
- Fixed "Locate All" not highlighting console logs
- Prevented scanning non-supported documents from resetting status bar count
- Improved temporary highlight behavior to not clear immediately on navigation

### Technical
- Added `src/utils/capabilities.ts` for version feature detection
- Extracted constants and helper functions for better maintainability
- Improved disposable management to prevent memory leaks
- Enhanced regex pattern for more reliable log detection
- Better error handling and edge case coverage

## [0.1.0] - 2026-02-11

### Added
- **Modern QuickPick UI**: Replaced the basic notification menu with a searchable QuickPick menu for faster actions.
- **Support for more console methods**: Now tracks and manages `warn`, `error`, `info`, `debug`, `table`, etc., in addition to `log`.
- **Keyboard Shortcuts**: Added `Ctrl+Shift+L` (Next log) and `Ctrl+Shift+Alt+L` (Previous log) for fast navigation.
- **Code Actions (Lightbulbs)**: Quick-access lightbulb menu for individual logs.
- **Customizable Highlighting**: Added settings to change the highlight color and style according to user preference.
- **Smarter Scanner**: Improved scanning logic to ignore console statements inside strings or existing comments.
- **Comprehensive Settings**: Complete set of configuration options to toggle features on/off.

### Changed
- Refactored core audio engine and processing pipeline (Internal cleanup).
- Standardized status bar priority to stay visible alongside other extensions.

## [0.0.10] - 2025-11-30

### Changed
- Updated README.md with better formatting and clearer instructions
- Improved documentation structure

## [0.0.9] - 2025-11-30

### Changed
- Updated extension logo with improved design
- Enhanced visual branding for better marketplace presentation

## [0.0.8] - 2023-07-22

### Changed
- Package size optimizations
- Minor improvements to extension bundling

## [0.0.7] - 2023-07-22

### Changed
- Updated version numbering
- Improved text ordering in UI elements

## [0.0.6] - 2023-07-22

### Changed
- README documentation updates
- Improved extension description

## [0.0.5] - 2023-07-20

### Changed
- VSCode engine compatibility updated to 1.25.1
- Broader compatibility with older VSCode versions

## [0.0.4] - 2023-07-17

### Changed
- Version update from 1.75.1 compatibility requirements

## [0.0.3] - 2023-07-03

### Changed
- General updates and improvements
- Repository structure refinements

## [0.0.2] - 2023-07-03

### Added
- Example screenshot (`example_1.png`) added to documentation

### Changed
- Documentation updates

## [0.0.1] - 2023-07-03

### Added
- Initial release
- Count `console.log` statements in active document
- Display count in status bar
- Highlight all `console.log` statements
- Locate first `console.log` occurrence
- Comment/uncomment all `console.log` statements
- Delete all `console.log` statements
- Support for JavaScript and TypeScript files (.js, .jsx, .ts, .tsx)
- Status bar integration with dropdown menu for quick actions
