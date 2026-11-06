/**
 * Schema Migration for Catalogue Import:
 * Extends product documents with per-size pricing, color variants, original names, importSource, and filter fields.
 * Safe and idempotent: can be executed repeatedly without data loss or unintended mutations.
 */

import { connectDB, disconnectDB } from '../config/db';
import { Product } from '../models/Product';

export const runCatalogueSchemaMigration = async () => {
  console.log('🔄 Starting catalogue schema migration (idempotent)...');
  await connectDB();

  const products = await Product.find({});
  console.log(`📦 Found ${products.length} existing products in database.`);

  let updatedCount = 0;
  let alreadyUpToDate = 0;

  for (const product of products as any[]) {
    let modified = false;

    // 1. Ensure sizes have originalLabel and price
    if (product.sizes && Array.isArray(product.sizes)) {
      for (const sz of product.sizes) {
        if (!sz.originalLabel) {
          sz.originalLabel = sz.label;
          modified = true;
        }
        if (sz.price === undefined || sz.price === null) {
          sz.price = product.price; // Fall back to product base price
          modified = true;
        }
      }
    }

    // 2. Ensure variants array exists
    if (!product.variants) {
      product.variants = [];
      modified = true;
    }

    // 3. Ensure originalName exists
    if (!product.originalName) {
      product.originalName = product.name;
      modified = true;
    }

    // 4. Ensure importSource structure exists for existing products
    if (!product.importSource) {
      product.importSource = {
        file: 'seed.ts',
        productNo: 0,
        importedAt: product.createdAt || new Date(),
      };
      modified = true;
    }

    if (modified) {
      await product.save();
      updatedCount++;
      console.log(`[MIGRATED] "${product.name}" (${product.slug})`);
    } else {
      alreadyUpToDate++;
    }
  }

  console.log(
    `✅ Migration complete! Updated: ${updatedCount}, Already modern schema: ${alreadyUpToDate}, Total: ${products.length}`
  );

  // Verify indexes
  console.log('🔍 Checking and ensuring Product indexes...');
  await Product.syncIndexes();
  console.log('✅ Product indexes synchronized.');

  await disconnectDB();
};

if (require.main === module) {
  runCatalogueSchemaMigration().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
}
