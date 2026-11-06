/**
 * Verification of per-size prices in MongoDB against PDF import data.
 * Verifies all 8 seed products + 15 random sample products across schools.
 */

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SAMPLE_PRODUCT_NUMBERS = [
  // 8 Seed Originals
  1, 2, 3, 4, 5, 6, 7, 8,
  // 15 Random Samples across schools
  10, 16, 20, 24, 35, 45, 56, 62, 70, 77, 86, 90, 95, 100, 107,
];

async function verifySample() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/indraprasth';
  await mongoose.connect(mongoUri);

  const importFile = path.resolve(__dirname, '../../../import/products.import.json');
  const catalogueData = JSON.parse(fs.readFileSync(importFile, 'utf-8'));
  const catByNo = new Map<number, any>(catalogueData.map((p: any) => [p.productNo, p]));

  console.log('='.repeat(65));
  console.log('PDF PER-SIZE PRICE ACCURACY VERIFICATION (SAMPLE CHECK)');
  console.log('='.repeat(65));

  let allPassed = true;

  for (const pno of SAMPLE_PRODUCT_NUMBERS) {
    const catProd = catByNo.get(pno)!;
    let dbProd = await Product.findOne({ 'importSource.productNo': pno }).lean();
    if (!dbProd) {
      dbProd = await Product.findOne({ slug: catProd.slug }).lean();
    }

    if (!dbProd) {
      console.log(`❌ P${String(pno).padStart(3, '0')} not found in MongoDB!`);
      allPassed = false;
      continue;
    }

    const mismatches: string[] = [];
    if (catProd.hasVariants) {
      for (const vCat of catProd.variants) {
        const vName = vCat.colorName;
        const dbV = (dbProd.variants || []).find((v: any) => v.colorName.toLowerCase() === vName.toLowerCase());
        if (!dbV) {
          mismatches.push(`Variant "${vName}" missing`);
          continue;
        }
        for (const szCat of vCat.sizes) {
          const szLabel = szCat.label;
          const dbSz = (dbV.sizes || []).find((s: any) => s.label === szLabel);
          if (!dbSz) {
            mismatches.push(`Size "${szLabel}" missing in variant "${vName}"`);
            continue;
          }
          const expectedPrice = szCat.price !== null ? szCat.price : catProd.startingPrice;
          if (dbSz.price !== expectedPrice) {
            mismatches.push(`Size "${szLabel}" price mismatch: expected ${expectedPrice}, got ${dbSz.price}`);
          }
        }
      }
    } else {
      for (const szCat of catProd.sizes) {
        const szLabel = szCat.label;
        const dbSz = (dbProd.sizes || []).find((s: any) => s.label === szLabel);
        if (!dbSz) {
          mismatches.push(`Size "${szLabel}" missing`);
          continue;
        }
        const expectedPrice = szCat.price !== null ? szCat.price : catProd.startingPrice;
        if (dbSz.price !== expectedPrice) {
          mismatches.push(`Size "${szLabel}" price mismatch: expected ${expectedPrice}, got ${dbSz.price}`);
        }
      }
    }

    if (mismatches.length > 0) {
      console.log(`❌ P${String(pno).padStart(3, '0')} (${dbProd.slug}): ${mismatches.length} mismatches -> ${mismatches.slice(0, 3).join(', ')}`);
      allPassed = false;
    } else {
      const statusNote = pno <= 8 ? 'Seed Original' : 'Sample Product';
      console.log(`✅ P${String(pno).padStart(3, '0')} [${statusNote.padEnd(14)}] ${dbProd.name.padEnd(45)}: All per-size prices match PDF`);
    }
  }

  console.log('='.repeat(65));
  console.log(`VERIFICATION RESULT: ${allPassed ? '✅ 100% PASS (All 23 products verified against PDF)' : '❌ SOME MISMATCHES'}`);
  console.log('='.repeat(65));

  await mongoose.disconnect();
}

verifySample().catch((err) => {
  console.error('❌ Sample verification error:', err);
  process.exit(1);
});
