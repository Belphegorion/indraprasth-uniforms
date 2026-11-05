import { connectDB, disconnectDB } from '../config/db';
import { Product } from '../models/Product';
import { ProductSeason, ProductTypeGroup } from '@indraprasth/shared';

export function inferProductFilters(name: string, description = ''): {
  season: ProductSeason;
  typeGroup: ProductTypeGroup;
  itemType: string;
} {
  const text = `${name} ${description}`.toLowerCase();

  // 1. Season inference
  let season: ProductSeason = 'all';
  if (
    text.includes('winter') ||
    text.includes('woollen') ||
    text.includes('warm') ||
    text.includes('thermal') ||
    text.includes('blazer') ||
    text.includes('blazzer')
  ) {
    season = 'winter';
  } else if (
    text.includes('summer') ||
    text.includes('half sleeve') ||
    text.includes('cotton-rich') ||
    text.includes('lightweight')
  ) {
    season = 'summer';
  }

  // 2. TypeGroup & ItemType inference
  let typeGroup: ProductTypeGroup = 'tops';
  let itemType = 'Shirt';

  if (text.includes('tie') || text.includes('necktie')) {
    typeGroup = 'accessories';
    itemType = 'Tie';
  } else if (text.includes('sock') || text.includes('socks')) {
    typeGroup = 'accessories';
    itemType = 'Socks';
  } else if (text.includes('shoe') || text.includes('shoes') || text.includes('boot')) {
    typeGroup = 'footwear';
    itemType = 'Shoes';
  } else if (text.includes('belt')) {
    typeGroup = 'accessories';
    itemType = 'Belt';
  } else if (text.includes('cap') || text.includes('hat')) {
    typeGroup = 'accessories';
    itemType = 'Cap';
  } else if (text.includes('bag') || text.includes('backpack')) {
    typeGroup = 'accessories';
    itemType = 'Bag';
  } else if (text.includes('apron')) {
    typeGroup = 'accessories';
    itemType = 'Apron';
  } else if (text.includes('blazer') || text.includes('blazzer')) {
    typeGroup = 'outerwear';
    itemType = 'Blazer';
  } else if (text.includes('upper') || text.includes('jacket') || text.includes('track upper')) {
    typeGroup = 'outerwear';
    itemType = 'Upper';
  } else if (text.includes('sweater') || text.includes('cardigan') || text.includes('pullover')) {
    typeGroup = 'outerwear';
    itemType = 'Sweater';
  } else if (text.includes('divider')) {
    typeGroup = 'bottoms';
    itemType = 'Divider';
  } else if (text.includes('pant') || text.includes('trouser') || text.includes('trousers')) {
    typeGroup = 'bottoms';
    itemType = 'Pant';
  } else if (text.includes('skirt')) {
    typeGroup = 'bottoms';
    itemType = 'Skirt';
  } else if (text.includes('pinafore')) {
    typeGroup = 'bottoms';
    itemType = 'Pinafore';
  } else if (text.includes('shorts') || text.includes('short')) {
    typeGroup = 'bottoms';
    itemType = 'Shorts';
  } else if (text.includes('t-shirt') || text.includes('tshirt') || text.includes('tee')) {
    typeGroup = 'tops';
    itemType = 'T-shirt';
  } else if (text.includes('kurta')) {
    typeGroup = 'tops';
    itemType = 'Kurta';
  } else if (text.includes('shirt')) {
    typeGroup = 'tops';
    itemType = 'Shirt';
  }

  return { season, typeGroup, itemType };
}

export const runFilterMigration = async () => {
  console.log('🔄 Starting product filters migration (idempotent)...');
  await connectDB();

  const products = await Product.find({});
  console.log(`📦 Found ${products.length} products to evaluate.`);

  let updatedCount = 0;
  let alreadyUpToDate = 0;

  for (const product of products) {
    const inferred = inferProductFilters(product.name, product.description);

    const needsUpdate =
      !product.season ||
      !product.typeGroup ||
      !product.itemType ||
      product.season !== inferred.season ||
      product.typeGroup !== inferred.typeGroup ||
      product.itemType !== inferred.itemType;

    if (needsUpdate) {
      product.season = inferred.season;
      product.typeGroup = inferred.typeGroup;
      product.itemType = inferred.itemType;
      await product.save();
      updatedCount++;
      console.log(
        `[MIGRATE] Updated "${product.name}" (${product.slug}): season=${inferred.season}, typeGroup=${inferred.typeGroup}, itemType=${inferred.itemType}`
      );
    } else {
      alreadyUpToDate++;
      console.log(
        `[MIGRATE] Kept current "${product.name}": season=${product.season}, typeGroup=${product.typeGroup}, itemType=${product.itemType}`
      );
    }
  }

  console.log(
    `✅ Migration complete! Updated: ${updatedCount}, Already set: ${alreadyUpToDate}, Total: ${products.length}`
  );
  await disconnectDB();
};

if (require.main === module) {
  runFilterMigration().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
}
