const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, '../public/sofa-hero.png');
const outputPath = path.join(__dirname, '../public/sofa-hero-cropped.png');

async function cropSofa() {
  try {
    // Obtener metadatos de la imagen
    const metadata = await sharp(inputPath).metadata();
    console.log('Tamaño original:', metadata.width, 'x', metadata.height);

    // Calcular el recorte (eliminar espacio transparente alrededor)
    // La imagen es 6000x3375, el sofá está en el centro
    
    const width = metadata.width;
    const height = metadata.height;
    
    // Recortar al 75% del ancho y 65% del alto, centrado
    const cropWidth = Math.round(width * 0.75);
    const cropHeight = Math.round(height * 0.65);
    const left = Math.round((width - cropWidth) / 2);
    const top = Math.round((height - cropHeight) / 2) - 50;

    await sharp(inputPath)
      .extract({
        left: left,
        top: top,
        width: cropWidth,
        height: cropHeight
      })
      .png()
      .toFile(outputPath);

    console.log('Imagen recortada guardada en:', outputPath);
    console.log('Nuevo tamaño:', cropWidth, 'x', cropHeight);
  } catch (error) {
    console.error('Error:', error);
  }
}

cropSofa();
