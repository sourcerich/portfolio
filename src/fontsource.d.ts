// Fontsource packages ship CSS with no bundled type declarations, so
// side-effect imports like `import '@fontsource-variable/inter'` raise
// TS2882 in the editor. These ambient declarations type them as module
// stubs so the imports type-check. (Vite handles the actual CSS at build.)
declare module '@fontsource/*';
declare module '@fontsource-variable/*';
