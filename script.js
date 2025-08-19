document.getElementById('fileInput').addEventListener('change', async (event) => {
  // Get files
  const files = event.target.files;
  if (!files.length) return;
  const images = await Promise.all([...files].map(loadImage));
  const { canvas, metadata } = packImages(images);

  // Clear output
  const output = document.getElementById('output');
  output.innerHTML = '';

  // Show canvas
  document.getElementById('output').innerHTML = '';
  document.getElementById('output').appendChild(canvas);

  // Create download links container
  const linkContainer = document.createElement('div');
  linkContainer.id = 'downloadLinks';
  output.appendChild(linkContainer); 

  // Download canvas as PNG
  const link = document.createElement('a');
  link.download = 'spritesheet.png';
  link.href = canvas.toDataURL();
  link.textContent = 'Download Spritesheet';
  link.style.display = 'block';
  linkContainer.appendChild(link); // Append to links container

  // Format metadata
  const jsonData = { frames: {} };
  metadata.forEach(({ name, x, y, width, height }) => {
    jsonData.frames[name] = {
      frame: { x, y, w: width, h: height }
    };
  });

  // Download metadata as JSON
  const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  const jsonLink = document.createElement('a');
  jsonLink.download = 'spritesheet.json';
  jsonLink.href = URL.createObjectURL(jsonBlob);
  jsonLink.textContent = 'Download JSON Metadata';
  jsonLink.style.display = 'block';
  linkContainer.appendChild(jsonLink); // Append to links container

  // Show canvas below links
  output.appendChild(canvas);
});

// Function to get the details of image
function loadImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ img, name: file.name, width: img.width, height: img.height });
    img.src = URL.createObjectURL(file);
  });
}

// Function to combine the images into a spritesheet/atlas
function packImages(images, canvasSize = 4096) {
  const canvas = document.createElement('canvas');
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext('2d');

  let x = 0, y = 0, rowHeight = 0;
  const metadata = [];

  for (const { img, name, width, height } of images) {
    if (x + width > canvasSize) {
      x = 0;
      y += rowHeight;
      rowHeight = 0;
    }
    if (y + height > canvasSize) {
      alert('Canvas size too big! Try fewer or smaller images.');
      break;
    }
    ctx.drawImage(img, x, y, width, height);
    metadata.push({ name, x, y, width, height });
    x += width;
    rowHeight = Math.max(rowHeight, height);
  }
  return { canvas, metadata };
}