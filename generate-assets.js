const sharp = require('sharp');
const fs = require('fs');

const assetsDir = './assets';
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Generate a simple icon (1024x1024 with black background and "C" text)
const svgIcon = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#000000"/>
  <text x="512" y="650" font-family="Arial, sans-serif" font-size="600" fill="#00ff00" text-anchor="middle" font-weight="bold">C</text>
</svg>
`;

// Generate a simple splash icon  (400x400 with black background and "C" text)
const svgSplash = `
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#000000"/>
  <text x="200" y="280" font-family="Arial, sans-serif" font-size="250" fill="#00ff00" text-anchor="middle" font-weight="bold">C</text>
</svg>
`;

// Generate favicon (16x16 with black background and green dot)
const svgFavicon = `
<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
  <rect width="16" height="16" fill="#000000"/>
  <circle cx="8" cy="8" r="6" fill="#00ff00"/>
</svg>
`;

async function generateAssets() {
  try {
    // Generate icon.png (1024x1024)
    await sharp(Buffer.from(svgIcon))
      .resize(1024, 1024)
      .png()
      .toFile('./assets/icon.png');
    console.log('✓ Generated icon.png');

    // Generate adaptive-icon.png (1024x1024)
    await sharp(Buffer.from(svgIcon))
      .resize(1024, 1024)
      .png()
      .toFile('./assets/adaptive-icon.png');
    console.log('✓ Generated adaptive-icon.png');

    // Generate splash-icon.png (400x400)
    await sharp(Buffer.from(svgSplash))
      .resize(400, 400)
      .png()
      .toFile('./assets/splash-icon.png');
    console.log('✓ Generated splash-icon.png');

    // Generate favicon.png (16x16)
    await sharp(Buffer.from(svgFavicon))
      .resize(16, 16)
      .png()
      .toFile('./assets/favicon.png');
    console.log('✓ Generated favicon.png');

    console.log('\n✓ All assets generated successfully!');
  } catch (error) {
    console.error('Error generating assets:', error);
    process.exit(1);
  }
}

generateAssets();
