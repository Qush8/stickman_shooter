const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'ui.template.html');
const outputPath = path.join(__dirname, 'ui.html');
const bundlePath = path.join(__dirname, 'dist/ui.bundle.js');

let script = fs.readFileSync(bundlePath, 'utf8');

// Escape HTML-like sequences so editors don't break syntax highlighting on ui.html
script = script.replace(/\\?<svg/g, '\\x3Csvg');
script = script.replace(/<!--/g, '\\x3C!--');
script = script.replace(/<\/svg/g, '<\\/svg');

const template = fs.readFileSync(templatePath, 'utf8');
const marker = '<!-- INJECT_SCRIPT -->';

if (!template.includes(marker)) {
  console.error('Could not find <!-- INJECT_SCRIPT --> in ui.template.html');
  process.exit(1);
}

// Classic script (not module): Bordiko sandbox CSP allows inline classic scripts,
// but blocks inline module scripts even with 'unsafe-inline'.
const html = template.split(marker).join(`<script>\n${script}\n</script>`);

fs.writeFileSync(outputPath, html, 'utf8');
console.log('Successfully built ui.html from ui.template.html');
