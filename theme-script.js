const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Theme text colors
  content = content.replace(/text-white/g, 'text-slate-800');
  content = content.replace(/text-gray-400/g, 'text-slate-500');
  content = content.replace(/text-gray-500/g, 'text-slate-400');
  content = content.replace(/text-gray-300/g, 'text-slate-600');
  
  // Specific border/bg adjustments for light theme
  content = content.replace(/border-white\/5/g, 'border-slate-200');
  content = content.replace(/border-white\/10/g, 'border-slate-300');
  content = content.replace(/bg-white\/5/g, 'bg-slate-200');
  content = content.replace(/bg-black\/80/g, 'bg-slate-900\/50');
  
  // Fix button text contrast
  content = content.replace(/bg-white text-black/g, 'bg-slate-800 text-white');
  
  fs.writeFileSync(filePath, content);
}

const filesToProcess = [
  'src/app/page.tsx',
  'src/app/admin/page.tsx',
  'src/components/Survey.tsx'
];

filesToProcess.forEach(f => {
  const fullPath = path.join(__dirname, f);
  if (fs.existsSync(fullPath)) {
    processFile(fullPath);
    console.log('Processed', f);
  }
});
