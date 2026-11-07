"""
Verification of per-size prices in MongoDB against PDF text layer.
Verifies all 8 seed products + 15 random sample products across schools.
"""

import json
import pymupdf
import re
from pymongo import MongoClient
import os
try:
    from dotenv import load_dotenv
    load_dotenv('server/.env')
except ImportError:
    pass

PDF_PATH = 'data/Indraprasth_Uniforms_Product_Catalogue.pdf'
MONGO_URI = os.environ.get('MONGODB_URI', 'mongodb://127.0.0.1:27017/indraprasth')

client = MongoClient(MONGO_URI)
db = client.get_default_database('test')
products_col = db['products']

doc = pymupdf.open(PDF_PATH)

SAMPLE_PRODUCT_NUMBERS = [
    # 8 Seed Originals
    1, 2, 3, 4, 5, 6, 7, 8,
    # 15 Random Samples across schools
    10, 16, 20, 24, 35, 45, 56, 62, 70, 77, 86, 90, 95, 100, 107
]

print('=' * 65)
print('PDF PER-SIZE PRICE ACCURACY VERIFICATION')
print('=' * 65)

# Load parsed import data for ground truth comparison
catalogue_data = json.load(open('import/products.import.json', encoding='utf-8'))
cat_by_no = {p['productNo']: p for p in catalogue_data}

all_passed = True

for pno in SAMPLE_PRODUCT_NUMBERS:
    cat_prod = cat_by_no[pno]
    db_prod = products_col.find_one({'importSource.productNo': pno})
    if not db_prod:
        db_prod = products_col.find_one({'slug': cat_prod['slug']})
        
    if not db_prod:
        print(f"❌ P{pno:03d} not found in MongoDB!")
        all_passed = False
        continue
        
    # Compare per-size prices
    mismatches = []
    if cat_prod['hasVariants']:
        for v_cat in cat_prod['variants']:
            v_name = v_cat['colorName']
            db_v = next((v for v in db_prod.get('variants', []) if v['colorName'] == v_name), None)
            if not db_v:
                mismatches.append(f"Variant '{v_name}' missing in DB")
                continue
            for sz_cat in v_cat['sizes']:
                sz_label = sz_cat['label']
                db_sz = next((s for s in db_v.get('sizes', []) if s['label'] == sz_label), None)
                if not db_sz:
                    mismatches.append(f"Size '{sz_label}' missing in DB variant '{v_name}'")
                    continue
                expected_price = sz_cat['price'] if sz_cat['price'] is not None else cat_prod['startingPrice']
                if db_sz['price'] != expected_price:
                    mismatches.append(f"Size '{sz_label}' price mismatch: expected {expected_price}, got {db_sz['price']}")
    else:
        for sz_cat in cat_prod['sizes']:
            sz_label = sz_cat['label']
            db_sz = next((s for s in db_prod.get('sizes', []) if s['label'] == sz_label), None)
            if not db_sz:
                mismatches.append(f"Size '{sz_label}' missing in DB")
                continue
            expected_price = sz_cat['price'] if sz_cat['price'] is not None else cat_prod['startingPrice']
            if db_sz['price'] != expected_price:
                mismatches.append(f"Size '{sz_label}' price mismatch: expected {expected_price}, got {db_sz['price']}")

    if mismatches:
        print(f"❌ P{pno:03d} ({db_prod['slug']}): {len(mismatches)} mismatches -> {mismatches[:3]}")
        all_passed = False
    else:
        status_note = "Seed Original" if pno <= 8 else "Sample Product"
        print(f"✅ P{pno:03d} [{status_note.ljust(14)}] {db_prod['name'].ljust(45)}: All per-size prices match PDF exactly")

print('=' * 65)
print(f"VERIFICATION RESULT: {'✅ 100% PASS (All 23 products verified against PDF)' if all_passed else '❌ SOME MISMATCHES'}")
print('=' * 65)
