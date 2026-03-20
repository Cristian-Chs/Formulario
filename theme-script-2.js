const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let lines = fs.readFileSync(filePath, 'utf8').split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    // If the line contains bg-brand-primary and text-white, it's a primary button, keep text-white
    if (lines[i].includes('bg-brand-primary') && !lines[i].includes('bg-brand-primary/10')) {
      continue;
    }
    
    // For hover:text-white in tabs
    lines[i] = lines[i].replace(/hover:text-white/g, 'hover:text-slate-800');
    
    // Everything else text-white -> text-slate-800
    lines[i] = lines[i].replace(/text-white/g, 'text-slate-800');
    
    // bg-brand-primary/10 text-slate-800 -> text-brand-primary (for selected multiple choice options)
    if (lines[i].includes('border-brand-primary bg-brand-primary/10 text-slate-800')) {
      lines[i] = lines[i].replace('text-slate-800', 'text-brand-primary');
    }
  }
  
  fs.writeFileSync(filePath, lines.join('\n'));
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
