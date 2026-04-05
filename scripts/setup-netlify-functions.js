import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const sourceServerDir = path.join(projectRoot, 'server');
const sourceSharedDir = path.join(projectRoot, 'shared');
const targetServerDir = path.join(projectRoot, 'netlify/functions/server');
const targetSharedDir = path.join(projectRoot, 'netlify/functions/shared');

// Önceki dosyaları sil
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true });
  }
}

// Dizini kopyala ve imports'ı güncelle
function copyAndFixImports(src, dest) {
  // Kopyala, ancak esbuild.config.js gibi config dosyalarını hariç tut
  fs.cpSync(src, dest, {
    recursive: true,
    filter: (src) => {
      // esbuild.config.js gibi konfigürasyon dosyalarını hariç tut
      return !src.endsWith('esbuild.config.js');
    }
  });
  
  // Tüm .ts dosyalarını bulup @shared/* imports'ı relative paths'e çevir
  const tsFiles = findFiles(dest, /\.ts$/);
  
  tsFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');

    // @shared/packages veya @shared/api gibi imports'ları güncelle
    // Tüm netlify/functions/server/** dosyalar için shared şu şekildedir:
    // - netlify/functions/server/routes/payment.ts → ../../shared/
    // - netlify/functions/server/lib/currency-service.ts → ../../shared/
    // Yani: her zaman ../../shared/

    content = content.replace(/@shared\//g, '../../shared/');

    fs.writeFileSync(file, content, 'utf-8');
  });
}

function findFiles(dir, pattern) {
  let files = [];
  
  function traverse(currentPath) {
    const entries = fs.readdirSync(currentPath);
    
    entries.forEach(entry => {
      const fullPath = path.join(currentPath, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (pattern.test(entry)) {
        files.push(fullPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

// Sil ve kopyala
removeDir(targetServerDir);
removeDir(targetSharedDir);

// netlify/functions altındaki tüm .js config dosyalarını sil (esbuild.config.js vb.)
const netlifyFunctionsDir = path.join(projectRoot, 'netlify/functions');
if (fs.existsSync(netlifyFunctionsDir)) {
  const files = fs.readdirSync(netlifyFunctionsDir);
  files.forEach(file => {
    const fullPath = path.join(netlifyFunctionsDir, file);
    const stat = fs.statSync(fullPath);
    // Sadece .js config dosyalarını sil (functions değil)
    if (stat.isFile() && file.endsWith('.config.js')) {
      fs.unlinkSync(fullPath);
      console.log(`  - Kaldırıldı: ${file}`);
    }
  });
}

copyAndFixImports(sourceServerDir, targetServerDir);

// Shared dosyaları kopyala (düzeltmeye gerek yok)
fs.cpSync(sourceSharedDir, targetSharedDir, { recursive: true });

console.log('✅ Netlify Functions setup tamamlandı!');
console.log(`   - Server dosyaları: ${targetServerDir}`);
console.log(`   - Shared dosyaları: ${targetSharedDir}`);
console.log('   - Imports güncellendi (relative paths)');
