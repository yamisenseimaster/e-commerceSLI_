const categoryNames = {
  Foods: 'Comidas',
  Drinks: 'Bebidas',
  Fruits: 'Frutas',
  Lunch: 'Almuerzo',
  Salad: 'Ensaladas',
  Breakfast: 'Desayuno',
  Dinner: 'Cena',
  Juices: 'Jugos',
  Soda: 'Gaseosas',
  Cocktailes: 'Cócteles',
  Beers: 'Cervezas',
  Apple: 'Manzana',
  Pineapple: 'Piña',
  Watermelon: 'Sandía',
  Strawberries: 'Frutillas',
  Snacks: 'Aperitivos',
  Oils: 'Aceites',
};

function traducirCategoria(valor) {
  return categoryNames[valor] || valor;
}
export { traducirCategoria };

const demoProductNames = {
  'Beans with noddles': 'Fideos con frijoles',
  'Rice, meat and Carrot': 'Arroz con carne y zanahoria',
  'Pork and potatoes': 'Cerdo con papas',
  'KFC chickens': 'Pollo KFC',
  'Pilau with Meat': 'Arroz pilau con carne',
  'Chinese Salady': 'Ensalada china',
  'Spanish Salad with overcado': 'Ensalada española con aguacate',
  Lettuce: 'Lechuga',
  Radicchio: 'Achicoria roja',
  Parsley: 'Perejil',
  Strawberrie: 'Frutilla',
  Cauliflower: 'Coliflor',
  'Organic Purple Cauliflower': 'Coliflor morada orgánica',
  'Ahold Acorn Squash': 'Calabaza bellota Ahold',
  'Bok Choy Cabbage': 'Col bok choy',
  'Strawberries Package': 'Paquete de frutillas',
  'Aloe Vera Leaf': 'Hoja de aloe vera',
  'Pineapple Imported': 'Piña importada',
  'Organic Broccoli': 'Brócoli orgánico',
  'Organic Pinkerton Avocado': 'Aguacate Pinkerton orgánico',
  'Organic Kale': 'Col rizada orgánica',
  'Yellow Sweet Corn': 'Maíz dulce amarillo',
  'Green Cauliflower': 'Coliflor verde',
  'Organic Greens Red Kale': 'Col rizada roja orgánica',
  'Organic Green Cauliflower': 'Coliflor verde orgánica',
  'Organic Ginger Root': 'Raíz de jengibre orgánico',
  'Organic Baby Carrot': 'Zanahorias pequeñas orgánicas',
  'Organic Cherry Tomato': 'Tomates cherry orgánicos',
  'Organic Bell Pepper': 'Pimiento orgánico',
  Potatoes: 'Papas',
  Mint: 'Menta',
  'Mini Pumpkin': 'Calabaza pequeña',
  'Organic White Radish': 'Rábano blanco orgánico',
  'Lacinato Dinosaur Kale': 'Col rizada lacinato',
  'Iglotex Cauliflower': 'Coliflor Iglotex',
  'French Green Beans': 'Chauchas francesas',
  'Fennel Bulb': 'Bulbo de hinojo',
  Escarole: 'Escarola',
  'Chinese Broccoli': 'Brócoli chino',
  'Bicolor Sweet Corn': 'Maíz dulce bicolor',
  Asparagus: 'Espárragos',
  'Haitian Mangoe': 'Mango haitiano',
  'Fresh Dates': 'Dátiles frescos',
  Cranberries: 'Arándanos rojos',
  'Mandarin Clementine': 'Mandarinas clementinas',
  'Avocado Juice Fruit': 'Jugo de aguacate',
  'Golden Garden Love Plum': 'Ciruela Love de Golden Garden',
  'Golden Garden Blueberry Plum': 'Ciruela Blueberry de Golden Garden',
  'Dry Fig Loose': 'Higos secos a granel',
  'Dates Loose': 'Dátiles a granel',
  'Dates Iranian Loose': 'Dátiles iraníes a granel',
  'Paka Pape': 'Paka Pape',
  'Orange Imported': 'Naranjas importadas',
  'China Fuji Apple': 'Manzana Fuji china',
  'Gerber-Organic': 'Gerber orgánico',
  'Sugar Free Orange Jelly': 'Gelatina de naranja sin azúcar',
  Pomelo: 'Pomelo',
  Pineapple: 'Piña',
  'Sugar Free Guava Jelly': 'Gelatina de guayaba sin azúcar',
};

const tagNames = {
  fresh: 'fresco',
  demo: 'demostración',
  lunch: 'almuerzo',
  salad: 'ensaladas',
  breakfast: 'desayuno',
  dinner: 'cena',
  juices: 'jugos',
  soda: 'gaseosas',
  cocktailes: 'cócteles',
  lettuce: 'lechuga',
  'fresh vegetable': 'verdura fresca',
  'fresh fruits': 'frutas frescas',
  fruits: 'frutas',
  vegetable: 'verdura',
};

const demoDescription =
  'Producto de inventario para el e-commerce. Disponible para venta, carrito, ordenes y administracion desde el dashboard.';
const vegetableDescription =
  'Verduras frescas seleccionadas para tu mesa. Ideales para preparar comidas variadas y nutritivas.';
const fruitDescription =
  'Frutas frescas seleccionadas para disfrutar solas o en tus recetas favoritas.';

function translateDescription(valor) {
  if (valor === demoDescription)
    return 'Producto disponible para comprar en la tienda.';
  if (valor?.startsWith('Most fresh vegetables are low in calories'))
    return vegetableDescription;
  if (valor?.startsWith('In a botanical sense, a fruit'))
    return fruitDescription;
  return valor;
}

function traducirCatalogo(valor) {
  if (Array.isArray(valor)) return valor.map(traducirCatalogo);
  if (!valor || typeof valor !== 'object') return valor;

  return Object.fromEntries(
    Object.entries(valor).map(([clave, entry]) => {
      if (clave === 'title' && typeof entry === 'string')
        return [clave, demoProductNames[entry] || entry];
      if (clave === 'description' && typeof entry === 'string')
        return [clave, translateDescription(entry)];
      if ((clave === 'tag' || clave === 'tags') && Array.isArray(entry)) {
        return [clave, entry.map((tag) => tagNames[tag] || tag)];
      }
      return [clave, traducirCatalogo(entry)];
    }),
  );
}
export { traducirCatalogo };
