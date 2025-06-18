/**
 * File Store Constants
 * Default configurations and predefined file types
 */

import { FileType } from './types';

export const DEFAULT_FILE_TYPES: FileType[] = [
  { extension: '.txt', mime: 'text/plain', label: 'text', aceName: 'text' },
  { extension: '.md', mime: 'text/markdown', label: 'markdown', aceName: 'markdown', editorType: 'markdown' },
  { extension: '.py', mime: 'text/x-python', label: 'python', aceName: 'python' },
  { extension: '.js', mime: 'text/javascript', label: 'javascript', aceName: 'javascript' },
  { extension: '.html', mime: 'text/html', label: 'html', aceName: 'html' },
  { extension: '.css', mime: 'text/css', label: 'css', aceName: 'css' },
  { extension: '.json', mime: 'application/json', label: 'json', aceName: 'json' },
  { extension: '.sql', mime: 'text/sql', label: 'sql', aceName: 'sql' },
  { extension: '.php', mime: 'text/x-php', label: 'php', aceName: 'php' },
  { extension: '.ts', mime: 'text/typescript', label: 'typescript', aceName: 'typescript' },
  { extension: '.vue', mime: 'text/vue', label: 'vue', aceName: 'html' },
  { extension: '.jsx', mime: 'text/jsx', label: 'jsx', aceName: 'jsx' },
  { extension: '.tsx', mime: 'text/tsx', label: 'tsx', aceName: 'tsx' },
  { extension: '.xml', mime: 'text/xml', label: 'xml', aceName: 'xml' },
  { extension: '.yaml', mime: 'text/yaml', label: 'yaml', aceName: 'yaml' },
  { extension: '.scss', mime: 'text/scss', label: 'scss', aceName: 'scss' },
  { extension: '.less', mime: 'text/less', label: 'less', aceName: 'less' }
];

export const DEFAULT_FILE_CONTENT = {
  '.md': '# New Document\n\nStart writing your markdown here...',
  '.html': '<!DOCTYPE html>\n<html>\n<head>\n    <title>Document</title>\n</head>\n<body>\n    \n</body>\n</html>',
  '.js': '// JavaScript file\nconsole.log("Hello, World!");',
  '.css': '/* CSS Stylesheet */\nbody {\n    margin: 0;\n    padding: 0;\n}',
  '.json': '{\n    "name": "example",\n    "version": "1.0.0"\n}',
  '.py': '# Python script\nprint("Hello, World!")',
  '.sql': '-- SQL Query\nSELECT * FROM table_name;',
  '.php': '<?php\n// PHP script\necho "Hello, World!";\n?>',
  '.txt': ''
};

export const FILE_STORAGE_KEY = 'quick-files';
export const CURRENT_FILE_STORAGE_KEY = 'quick-files-current';