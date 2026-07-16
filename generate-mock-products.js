const fs = require('fs');
const path = require('path');

// Paletas de nombres para generar productos de mueblería realistas
const adjectives = ['Moderno', 'Nórdico', 'Vintage', 'Minimalista', 'Industrial', 'Rústico', 'Premium', 'Clásico', 'Elegante', 'Eco'];
const materials = ['de Madera de Paraíso', 'de Roble', 'de Hierro y Madera', 'Laminado', 'Tapizado en Lino', 'de Pino Macizo', 'con Detalles de Vidrio', 'de Melamina'];

// Items con categorías, ambientes, precios base e IDs de imágenes reales de Unsplash para muebles
const items = [
  { 
    name: 'Silla Comedor', 
    category: 'Sillas', 
    room: 'Comedor', 
    basePrice: 45000,
    imageIds: ['1592078615290-033ee584e267', '1567538096630-e0c55bd6374c', '1506439773649-6e0eb8cfb237', '1598300042247-d088f8ab3a91']
  },
  { 
    name: 'Mesa de Luz', 
    category: 'Mesas de Luz', 
    room: 'Dormitorio', 
    basePrice: 65000,
    imageIds: ['1532372320978-9b4d6a3a854c', '1616486338812-3dadae4b4ace']
  },
  { 
    name: 'Mesa Comedor', 
    category: 'Mesas', 
    room: 'Comedor', 
    basePrice: 180000,
    imageIds: ['1577140917170-285929fb55b7', '1533090161767-e6ffed986c88']
  },
  { 
    name: 'Sofá de 3 Cuerpos', 
    category: 'Sofás', 
    room: 'Living', 
    basePrice: 350000,
    imageIds: ['1555041469-a586c61ea9bc', '1493663284031-b7e3aefcae8e', '1586023492125-27b2c045efd7']
  },
  { 
    name: 'Sillón Individual', 
    category: 'Sofás', 
    room: 'Living', 
    basePrice: 120000,
    imageIds: ['1524758631624-e2822e304c36', '1598300042247-d088f8ab3a91']
  },
  { 
    name: 'Escritorio de Trabajo', 
    category: 'Escritorios', 
    room: 'Oficina', 
    basePrice: 95000,
    imageIds: ['1518455027359-f3f8164ba6bd', '1595515106969-1ce29566ff1c']
  },
  { 
    name: 'Biblioteca Biblioteca', 
    category: 'Estanterías', 
    room: 'Oficina', 
    basePrice: 110000,
    imageIds: ['1594620302200-9a762244a156', '1544644181-1484b3fdfc62']
  },
  { 
    name: 'Placard de 2 Puertas', 
    category: 'Placards', 
    room: 'Dormitorio', 
    basePrice: 280000,
    imageIds: ['1558882224-cca166733365', '1600585154526-990dced4db0d']
  },
  { 
    name: 'Cama Queen Size', 
    category: 'Camas', 
    room: 'Dormitorio', 
    basePrice: 220000,
    imageIds: ['1505693416388-ac5ce068fe85', '1540518614846-7eded433c457', '1566665797739-1674de7a421a']
  },
  { 
    name: 'Mesa Ratona', 
    category: 'Mesas', 
    room: 'Living', 
    basePrice: 55000,
    imageIds: ['1615066390971-03e4e1c36ddf']
  },
  { 
    name: 'Cómoda de 4 Cajones', 
    category: 'Cómodas', 
    room: 'Dormitorio', 
    basePrice: 140000,
    imageIds: ['1595428774223-ef52624120d2']
  },
  { 
    name: 'Banqueta Alta', 
    category: 'Bancos', 
    room: 'Cocina', 
    basePrice: 38000,
    imageIds: ['1503602642458-232111445657', '1581428982868-e410dd047a90']
  }
];

// Helper para generar slug a partir del nombre
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Quitar acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-') // Reemplazar espacios por guiones
    .replace(/[^\w\-]+/g, '') // Quitar caracteres especiales
    .replace(/\-\-+/g, '-') // Reemplazar guiones múltiples
    .replace(/^-+/, '') // Quitar guiones al inicio
    .replace(/-+$/, ''); // Quitar guiones al final
}

function generateRandomProducts(count = 30) {
  const products = [];
  
  for (let i = 0; i < count; i++) {
    const item = items[Math.floor(Math.random() * items.length)];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const mat = materials[Math.floor(Math.random() * materials.length)];
    
    const name = `${item.name} ${adj} ${mat}`;
    const slug = `${slugify(item.name)}-${slugify(adj)}-${slugify(mat.substring(0, 15))}-${Math.floor(Math.random() * 1000)}`;
    
    // Variación de precio +/- 20%
    const priceVariance = (Math.random() * 0.4) - 0.2; 
    const price = Math.round(item.basePrice * (1 + priceVariance));
    
    const inStock = Math.random() > 0.15; // 85% de probabilidad de tener stock
    const stockQty = inStock ? Math.floor(Math.random() * 15) + 1 : 0;
    
    // Seleccionar una imagen al azar de las disponibles para este mueble
    const imageId = item.imageIds[Math.floor(Math.random() * item.imageIds.length)];
    const imageUrl = `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=600&q=80`;
    
    const product = {
      id: '', // Se deja vacío para que se autogenere al importar
      storeId: '', // Se deja vacío para que use la tienda por defecto del usuario
      name: name,
      slug: slug,
      price: price,
      category: item.category,
      room: item.room,
      style: adj,
      arUrl: '',
      glbUrl: '',
      usdzUrl: '',
      imageUrl: imageUrl,
      inStock: inStock ? 'true' : 'false',
      stockQty: stockQty
    };
    
    products.push(product);
  }
  
  return products;
}

function main() {
  const fields = ['id', 'storeId', 'name', 'slug', 'price', 'category', 'room', 'style', 'arUrl', 'glbUrl', 'usdzUrl', 'imageUrl', 'inStock', 'stockQty'];
  const count = 30; // Cantidad de productos a generar
  const products = generateRandomProducts(count);
  
  const csvRows = [];
  // Agregar encabezados
  csvRows.push(fields.join(','));
  
  // Agregar filas
  for (const product of products) {
    const values = fields.map(field => {
      const val = product[field];
      // Si el valor contiene comas, comillas o saltos de línea, lo envolvemos en comillas y escapamos las comillas
      const escaped = String(val ?? '').replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvContent = csvRows.join('\n');
  const outputPath = path.join(__dirname, 'productos_importar.csv');
  
  fs.writeFileSync(outputPath, csvContent, 'utf8');
  
  console.log('================================================================');
  console.log('✅ ¡Archivo CSV generado con éxito!');
  console.log(`📍 Ruta: ${outputPath}`);
  console.log(`📦 Cantidad de productos con imágenes reales de Unsplash: ${count}`);
  console.log('================================================================');
  console.log('\n💡 Instrucciones de uso:');
  console.log('1. Asegurate de que el servidor backend esté corriendo.');
  console.log('2. Abrí la plataforma de administración en la sección de Inventario.');
  console.log('3. Presioná el botón "Importar" o "Subir CSV".');
  console.log('4. Seleccioná el archivo generado: "productos_importar.csv".');
  console.log('5. ¡Confirmá la importación y listo!');
  console.log('================================================================');
}

main();
