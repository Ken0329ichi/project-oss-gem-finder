import fs from 'fs';
import path from 'path';

// 公開用ファイルをまとめたサブディレクトリ
const srcDir = 'deploy-assets';
const filesToCopy = ['LICENSE', 'README.md'];
const targetDir = 'dist';

filesToCopy.forEach(file => {
  const src = path.resolve(srcDir, file);
  const dest = path.resolve(targetDir, file);
  
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`[Asset Copier] Copied ${srcDir}/${file} -> ${targetDir}/${file}`);
  } else {
    console.warn(`[Asset Copier] Warning: ${srcDir}/${file} not found.`);
  }
});
