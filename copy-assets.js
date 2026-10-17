import fs from 'fs';
import path from 'path';

const srcDir = './src/assets/images';
const destDir = './public/assets/images';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
  }
  console.log('Assets successfully copied to public folder!');
} else {
  console.log('Source directory not found.');
}
