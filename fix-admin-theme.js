const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'admin', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Global text and border replacements for light theme
content = content.replace(/text-white/g, 'text-slate-800');
content = content.replace(/text-gray-400/g, 'text-slate-500');
content = content.replace(/text-gray-500/g, 'text-slate-400');
content = content.replace(/text-gray-300/g, 'text-slate-600');
content = content.replace(/border-white\/5/g, 'border-slate-300');
content = content.replace(/border-white\/10/g, 'border-slate-300');
content = content.replace(/border-white\/20/g, 'border-slate-300');
content = content.replace(/bg-black\/80/g, 'bg-slate-900\/50'); // Modal backdrop

// Restore text-white where a dark background is explicitly used
content = content.replace(/bg-brand-primary text-slate-800/g, 'bg-brand-primary text-white');
content = content.replace(/bg-red-500\/10 text-slate-800/g, 'bg-red-50 text-red-600'); 
content = content.replace(/bg-red-500 text-slate-800/g, 'bg-red-500 text-white');

// Specific button hover fixes
content = content.replace(/hover:text-slate-800/g, 'hover:text-brand-primary'); // (tab buttons were hover:text-white originally)

// Write back
fs.writeFileSync(filePath, content);
console.log('Admin page theme fixed');

