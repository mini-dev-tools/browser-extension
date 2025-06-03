import { watch } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

console.log('🔄 Watching for changes in public directory...');

// Files to copy
const filesToCopy = [
  'manifest.json',
  'background.js',
  'offscreen.html',
  'offscreen.js',
  'content.js',
  'whatsapp-blur.js'
];

// Copy files function
function copyPublicFiles() {
  console.log('📋 Copying public files to dist...');
  
  filesToCopy.forEach(file => {
    try {
      execSync(`cp public/${file} dist/${file}`, { cwd: projectRoot });
      console.log(`✅ Copied ${file}`);
    } catch (error) {
      console.error(`❌ Error copying ${file}:`, error.message);
    }
  });
  
  console.log('✨ Done!\n');
}

// Initial copy
copyPublicFiles();

// Watch public directory
const watcher = watch(join(projectRoot, 'public'), (eventType, filename) => {
  if (filename && filesToCopy.includes(filename)) {
    console.log(`📝 Change detected in ${filename}`);
    copyPublicFiles();
  }
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n👋 Stopping watch mode...');
  watcher.close();
  process.exit();
});

console.log('👀 Watching for changes... (Press Ctrl+C to stop)\n');