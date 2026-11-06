"""
Indraprasth Uniforms Product Catalogue Parser
Deterministic extraction and normalization of 108 products and 210 images from PDF.
Phase 1: Parse + Dry Run (ZERO database writes, ZERO Cloudinary uploads).
"""

import os
import sys
import re
import json
import csv
import hashlib
from typing import Dict, List, Any, Optional, Tuple
from collections import defaultdict, Counter

import pymupdf
from PIL import Image, ImageDraw, ImageFont

# Path configuration
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
PDF_PATH = os.path.join(BASE_DIR, 'data/Indraprasth_Uniforms_Product_Catalogue.pdf')
IMPORT_DIR = os.path.join(BASE_DIR, 'import')
REVIEW_DIR = os.path.join(IMPORT_DIR, 'review')
PAGES_REVIEW_DIR = os.path.join(REVIEW_DIR, 'pages')
EXTRACTED_IMAGES_DIR = os.path.join(IMPORT_DIR, 'extracted_images')

# Target outputs
REPORT_JSON_PATH = os.path.join(IMPORT_DIR, 'import-report.json')
REPORT_CSV_PATH = os.path.join(IMPORT_DIR, 'import-report.csv')
PRODUCTS_IMPORT_JSON_PATH = os.path.join(IMPORT_DIR, 'products.import.json')

# 8 Existing Seed Product Slugs in MongoDB
EXISTING_SEED_SLUGS = {
    1: 'dps-winter-tie',
    2: 'dps-winter-socks',
    3: 'dps-winter-divider',
    4: 'dps-winter-pant',
    5: 'dps-winter-full-shirt',
    6: 'dps-kolar-upper',
    7: 'dps-kolar-blazer',
    8: 'dps-bhopal-blazer',
}

# Canonical Schools Configuration
SCHOOL_CONFIG = {
    'The Sanskaar Valley School': {
        'name': 'The Sanskaar Valley School',
        'code': 'TSVS',
        'slug': 'the-sanskaar-valley-school',
        'branchLabel': 'Bhopal',
        'action': 'create'
    },
    'St Joseph Higher Secondary School': {
        'name': 'St Joseph Higher Secondary School',
        'code': 'JSS',
        'slug': 'st-joseph-higher-secondary-school',
        'branchLabel': 'Idgah Hills',
        'action': 'create'
    },
    'Delhi Public School Bhopal': {
        'name': 'Delhi Public School Bhopal',
        'code': 'DPS',
        'slug': 'dps-bhopal',
        'branchLabel': 'Bhadbhada Road',
        'action': 'existing'
    },
    'Delhi Public School Kolar Road,': {
        'name': 'Delhi Public School Kolar Road',
        'code': 'DPS KOLAR',
        'slug': 'dps-kolar',
        'branchLabel': 'Kolar Road',
        'action': 'existing'
    },
    'Delhi Public School Kolar Road': {
        'name': 'Delhi Public School Kolar Road',
        'code': 'DPS KOLAR',
        'slug': 'dps-kolar',
        'branchLabel': 'Kolar Road',
        'action': 'existing'
    },
    'IES Public School': {
        'name': 'IES Public School',
        'code': 'IES',
        'slug': 'ies-public-school',
        'branchLabel': 'Bhopal',
        'action': 'create'
    },
    'Sagar Public School': {
        'name': 'Sagar Public School',
        'code': 'SPS',
        'slug': 'sps-bhopal',
        'branchLabel': 'Saket Nagar',
        'action': 'existing'
    },
    'Billabong High International School': {
        'name': 'Billabong High International School',
        'code': 'BHIS',
        'slug': 'billabong-high-international-school',
        'branchLabel': 'Bhopal',
        'action': 'create'
    }
}

# Category Aliases & Normalization
CATEGORY_CONFIG = {
    'winter-ware': {'name': 'Winter-ware', 'slug': 'winter-ware', 'typeGroup': 'outerwear', 'aliases': ['winter', 'winter wear']},
    't-shirt': {'name': 'T-Shirt', 'slug': 't-shirt', 'typeGroup': 'tops', 'aliases': ['tshirt', 'tee']},
    'house-uniform': {'name': 'House Uniform', 'slug': 'house-uniform', 'typeGroup': 'tops', 'aliases': ['house']},
    'knecker': {'name': 'Knicker', 'slug': 'knicker', 'typeGroup': 'bottoms', 'aliases': ['knecker', 'shorts', 'half pant']},
    'trouser': {'name': 'Trouser', 'slug': 'trouser', 'typeGroup': 'bottoms', 'aliases': ['pant', 'pants']},
    'socks': {'name': 'Socks', 'slug': 'socks', 'typeGroup': 'footwear', 'aliases': ['stockings']},
    'shirt': {'name': 'Shirt', 'slug': 'shirt', 'typeGroup': 'tops', 'aliases': ['formal shirt']},
    'belt': {'name': 'Belt', 'slug': 'belt', 'typeGroup': 'accessories', 'aliases': []},
    'skirt': {'name': 'Skirt', 'slug': 'skirt', 'typeGroup': 'bottoms', 'aliases': []},
    'divider': {'name': 'Divider', 'slug': 'divider', 'typeGroup': 'bottoms', 'aliases': ['divider skirt']},
    'other': {'name': 'Other', 'slug': 'other', 'typeGroup': 'bottoms', 'aliases': []},
    'tie': {'name': 'Tie', 'slug': 'tie', 'typeGroup': 'accessories', 'aliases': []},
    'bag': {'name': 'Bag', 'slug': 'bag', 'typeGroup': 'accessories', 'aliases': ['school bag', 'backpack']},
    'shoes': {'name': 'Shoes', 'slug': 'shoes', 'typeGroup': 'footwear', 'aliases': ['campus shoes', 'black shoes']},
    'pinoo-frock': {'name': 'Pinafore Frock', 'slug': 'pinafore-frock', 'typeGroup': 'bottoms', 'aliases': ['pinoo-frock', 'pinafore']},
    'jacket': {'name': 'Jacket', 'slug': 'jacket', 'typeGroup': 'outerwear', 'aliases': []},
    'salwar-suit': {'name': 'Salwar Suit', 'slug': 'salwar-suit', 'typeGroup': 'tops', 'aliases': ['salwar']},
    'accessories': {'name': 'Accessories', 'slug': 'accessories', 'typeGroup': 'accessories', 'aliases': []},
    'tuniq': {'name': 'Tunic', 'slug': 'tunic', 'typeGroup': 'bottoms', 'aliases': ['tuniq']},
    'cycling-tides': {'name': 'Cycling Tights', 'slug': 'cycling-tights', 'typeGroup': 'bottoms', 'aliases': ['cycling-tides', 'tides']},
    'track-suit': {'name': 'Track Suit', 'slug': 'track-suit', 'typeGroup': 'bottoms', 'aliases': ['tracksuit']}
}

def clean_school_name(raw: str) -> str:
    s = raw.strip()
    if s.endswith(','):
        s = s[:-1].strip()
    return s

def clean_product_name(raw: str) -> str:
    s = raw.strip()
    # Normalize common typos
    s = re.sub(r'\bBlazzer\b', 'Blazer', s, flags=re.I)
    s = re.sub(r'\bSwater\b', 'Sweater', s, flags=re.I)
    s = re.sub(r'\bTuniq\b', 'Tunic', s, flags=re.I)
    s = re.sub(r'\bKnecker\b', 'Knicker', s, flags=re.I)
    s = re.sub(r'\bknecker\b', 'Knicker', s)
    s = re.sub(r'\bSt Josiph\b', "St. Joseph's", s, flags=re.I)
    s = re.sub(r'\bst joseph\b', "St. Joseph's", s, flags=re.I)
    s = re.sub(r'\bHouse Strip\b', 'House Stripe', s, flags=re.I)
    s = re.sub(r'\bREGULER\b', 'Regular', s, flags=re.I)
    s = re.sub(r'\bTSHIRT\b', 'T-Shirt', s, flags=re.I)
    s = re.sub(r'\bPinoo Frock\b', 'Pinafore Frock', s, flags=re.I)
    s = re.sub(r'\(Tides\)', '(Tights)', s, flags=re.I)
    s = re.sub(r'\bStrips\b', 'Stripes', s, flags=re.I)
    s = re.sub(r'\bDps\b', 'DPS', s)
    s = re.sub(r'\bKg\s*(\d+)\b', r'KG \1', s, flags=re.I)
    
    # Specific known name corrections
    if s.lower() == 'dps winter full shirt bhopal':
        s = 'DPS Winter Full Shirt'
    
    # Fix spacing around parentheses
    s = re.sub(r'\(\s+', '(', s)
    s = re.sub(r'\s+\)', ')', s)
    s = re.sub(r'\s{2,}', ' ', s)
    return s.strip()

def slugify(text: str) -> str:
    s = text.lower().strip()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'[\s_-]+', '-', s)
    return s.strip('-')

def parse_price(val: str) -> Optional[float]:
    if not val or val.lower() == 'not provided':
        return None
    cleaned = val.replace('INR', '').replace(',', '').strip()
    try:
        return float(cleaned)
    except ValueError:
        return None

def parse_stock(val: str) -> Optional[int]:
    if not val or val.lower() == 'not provided':
        return None
    try:
        return int(val.strip())
    except ValueError:
        return None

def normalize_size(raw_size: str) -> Dict[str, Any]:
    raw = raw_size.strip()
    
    # 1. Free size
    if raw.lower() == 'free size':
        return {'label': 'Free Size', 'originalLabel': raw, 'unit': 'free_size', 'gradeRange': None}
    
    # 2. Inch formats: "16 inch", "60 inch"
    m_inch = re.match(r'^(\d+)\s*inch$', raw, re.I)
    if m_inch:
        return {'label': m_inch.group(1), 'originalLabel': raw, 'unit': 'inch', 'gradeRange': None}
    
    # 3. "L, 18", "L, 20"
    m_length = re.match(r'^L,\s*(\d+)$', raw, re.I)
    if m_length:
        return {'label': f"L {m_length.group(1)}", 'originalLabel': raw, 'unit': 'length_inch', 'gradeRange': None}
        
    # 4. "Size 14", "Size 16"
    m_size_word = re.match(r'^Size\s+(\d+)$', raw, re.I)
    if m_size_word:
        return {'label': m_size_word.group(1), 'originalLabel': raw, 'unit': 'size', 'gradeRange': None}
        
    # 5. Parenthesized grade range: "30 (1st to 4th)", "3 (1st - 2nd)", "60 ( 6th to 12th)"
    m_grade = re.match(r'^(\d+)\s*\(\s*([^)]+)\s*\)$', raw)
    if m_grade:
        size_num = m_grade.group(1).strip()
        grade = m_grade.group(2).strip()
        grade = re.sub(r'\b3th\b', '3rd', grade, flags=re.I)
        return {'label': size_num, 'originalLabel': raw, 'unit': 'size', 'gradeRange': grade}
        
    # 6. "6th TO 12th"
    if re.match(r'^\d+[a-z]{2}\s+(to|-)\s+\d+[a-z]{2}$', raw, re.I):
        return {'label': raw.lower(), 'originalLabel': raw, 'unit': 'grade_range', 'gradeRange': raw.lower()}
        
    # 7. Pure number
    if re.match(r'^\d+$', raw):
        return {'label': raw, 'originalLabel': raw, 'unit': 'size', 'gradeRange': None}
        
    # Default fallback
    return {'label': raw, 'originalLabel': raw, 'unit': 'custom', 'gradeRange': None}

def infer_schema_fields(name: str, category_slug: str, gender_raw: str) -> Dict[str, str]:
    name_lower = name.lower()
    
    # 1. Season
    if 'winter' in name_lower or category_slug == 'winter-ware' or any(k in name_lower for k in ['sweater', 'swater', 'blazer', 'blazzer', 'jacket']):
        season = 'winter'
    elif 'summer' in name_lower:
        season = 'summer'
    else:
        season = 'all'
        
    # 2. Gender
    g = gender_raw.lower().strip()
    if g in ['boys', 'girls', 'unisex']:
        gender = g
    else:
        if 'boys & girls' in name_lower or 'boys and girls' in name_lower or '(boys & girls)' in name_lower:
            gender = 'unisex'
        elif 'boys' in name_lower:
            gender = 'boys'
        elif 'girls' in name_lower:
            gender = 'girls'
        else:
            gender = 'unisex'
            
    # 3. ItemType & TypeGroup
    item_type = 'Shirt'
    type_group = 'tops'
    
    if any(k in name_lower for k in ['t-shirt', 'tshirt', 'tee']):
        item_type = 'T-shirt'
        type_group = 'tops'
    elif any(k in name_lower for k in ['full shirt', 'white shirt', 'formal shirt', 'half white school shirt', 'shirt']):
        item_type = 'Shirt'
        type_group = 'tops'
    elif 'upper' in name_lower:
        item_type = 'Upper'
        type_group = 'tops'
    elif 'blazer' in name_lower or 'blazzer' in name_lower:
        item_type = 'Blazer'
        type_group = 'outerwear'
    elif 'sweater' in name_lower or 'swater' in name_lower:
        item_type = 'Sweater'
        type_group = 'outerwear'
    elif 'jacket' in name_lower:
        item_type = 'Jacket'
        type_group = 'outerwear'
    elif 'salwar suit' in name_lower:
        item_type = 'Salwar Suit'
        type_group = 'tops'
    elif 'tie' in name_lower or category_slug == 'tie':
        item_type = 'Tie'
        type_group = 'accessories'
    elif 'belt' in name_lower or category_slug == 'belt':
        item_type = 'Belt'
        type_group = 'accessories'
    elif 'socks' in name_lower or category_slug == 'socks':
        item_type = 'Socks'
        type_group = 'footwear'
    elif 'shoes' in name_lower or category_slug == 'shoes':
        item_type = 'Shoes'
        type_group = 'footwear'
    elif 'bag' in name_lower or category_slug == 'bag':
        item_type = 'Bag'
        type_group = 'accessories'
    elif 'stripe' in name_lower or 'strip' in name_lower or category_slug == 'accessories':
        item_type = 'Stripe'
        type_group = 'accessories'
    elif 'divider' in name_lower or category_slug == 'divider':
        item_type = 'Divider'
        type_group = 'bottoms'
    elif 'skirt' in name_lower or category_slug == 'skirt':
        item_type = 'Skirt'
        type_group = 'bottoms'
    elif any(k in name_lower for k in ['shorts', 'half pant', 'knecker', 'knicker', 'capri']):
        item_type = 'Shorts'
        type_group = 'bottoms'
    elif 'tunic' in name_lower or 'tuniq' in name_lower:
        item_type = 'Tunic'
        type_group = 'bottoms'
    elif 'frock' in name_lower or 'pinafore' in name_lower or category_slug == 'pinoo-frock':
        item_type = 'Pinafore'
        type_group = 'bottoms'
    elif 'tights' in name_lower or 'tides' in name_lower or category_slug == 'cycling-tides':
        item_type = 'Tights'
        type_group = 'bottoms'
    elif 'track suit' in name_lower or category_slug == 'track-suit':
        item_type = 'Track Suit'
        type_group = 'bottoms'
    elif any(k in name_lower for k in ['lower', 'pant', 'trouser', 'cargo']):
        item_type = 'Pant'
        type_group = 'bottoms'
    else:
        # Fallback to category config
        cat_conf = CATEGORY_CONFIG.get(category_slug, {})
        type_group = cat_conf.get('typeGroup', 'tops')
        item_type = cat_conf.get('name', 'Shirt')

    return {
        'season': season,
        'gender': gender,
        'itemType': item_type,
        'typeGroup': type_group
    }

class CatalogueParser:
    def __init__(self, pdf_path: str = PDF_PATH):
        self.pdf_path = pdf_path
        self.doc = pymupdf.open(pdf_path)
        self.products: List[Dict[str, Any]] = []
        self.images_map: List[Dict[str, Any]] = []
        self.not_provided_prices: List[Dict[str, Any]] = []
        self.stock_outliers: List[Dict[str, Any]] = []
        self.ambiguous_images: List[Dict[str, Any]] = []
        
    def find_product_boundaries(self) -> List[Dict[str, Any]]:
        boundaries = []
        for pidx in range(1, len(self.doc)):
            page_num = pidx + 1
            text = self.doc[pidx].get_text()
            for line in text.split('\n'):
                m = re.match(r'^Product\s+(\d+)$', line.strip(), re.I)
                if m:
                    boundaries.append({
                        'productNo': int(m.group(1)),
                        'startPage': page_num
                    })
                    break
                    
        for i in range(len(boundaries)):
            start = boundaries[i]['startPage']
            end = boundaries[i+1]['startPage'] - 1 if i + 1 < len(boundaries) else len(self.doc)
            boundaries[i]['endPage'] = end
            boundaries[i]['pages'] = list(range(start, end + 1))
            
        return boundaries

    def parse_all(self):
        boundaries = self.find_product_boundaries()
        if len(boundaries) != 108:
            raise ValueError(f"Expected 108 products, found {len(boundaries)}")
            
        total_images_extracted = 0
        
        for pmeta in boundaries:
            pno = pmeta['productNo']
            pages = pmeta['pages']
            
            prod_data = {
                'productNo': pno,
                'pages': pages,
                'originalName': '',
                'name': '',
                'slug': '',
                'schoolRaw': '',
                'school': '',
                'schoolCode': '',
                'schoolSlug': '',
                'shortName': '',
                'categoryRaw': '',
                'category': '',
                'categorySlug': '',
                'gender': '',
                'startingPriceRaw': '',
                'startingPrice': 0.0,
                'tags': 'None',
                'hasVariants': False,
                'variants': [],
                'sizes': [],
                'images': [],
                'minPrice': None,
                'isExistingSeed': pno in EXISTING_SEED_SLUGS
            }
            
            # Temporary storage for variants and sizes
            variants_dict = defaultdict(list)
            standard_sizes = []
            cur_variant = None
            in_images = False
            
            for pidx in [p - 1 for p in pages]:
                page = self.doc[pidx]
                blocks = sorted(page.get_text('blocks'), key=lambda b: b[1])
                
                for b in blocks:
                    t = b[4].strip()
                    if not t or t.startswith('Indraprasth Uniforms Product Catalogue  |') or re.match(r'^Product\s+\d+$', t, re.I):
                        continue
                        
                    # Product Name is right after Product NNN on the start page
                    if pidx == pages[0] - 1 and not prod_data['originalName']:
                        prod_data['originalName'] = t
                        continue
                        
                    if t.startswith('Product detail\nValue'):
                        continue
                    if t.startswith('School\n'):
                        prod_data['schoolRaw'] = t.split('\n', 1)[1].strip()
                        continue
                    if t.startswith('Short name\n'):
                        prod_data['shortName'] = t.split('\n', 1)[1].strip()
                        continue
                    if t.startswith('Category\n'):
                        prod_data['categoryRaw'] = t.split('\n', 1)[1].strip()
                        continue
                    if t.startswith('Gender\n'):
                        prod_data['gender'] = t.split('\n', 1)[1].strip().lower()
                        continue
                    if t.startswith('Starting price\n'):
                        prod_data['startingPriceRaw'] = t.split('\n', 1)[1].strip()
                        continue
                    if t.startswith('Tags\n'):
                        prod_data['tags'] = t.split('\n', 1)[1].strip()
                        continue
                        
                    if t == 'Standard size options':
                        cur_variant = None
                        in_images = False
                        continue
                        
                    m_var = re.match(r'^(.*)\s+variant size options$', t, re.I)
                    if m_var:
                        prod_data['hasVariants'] = True
                        cur_variant = m_var.group(1).strip()
                        if cur_variant not in variants_dict:
                            variants_dict[cur_variant] = []
                        in_images = False
                        continue
                        
                    if t == 'Size\nPrice INR\nStock':
                        continue
                        
                    if t == 'Product images':
                        in_images = True
                        continue
                        
                    if not in_images:
                        lines = t.split('\n')
                        if len(lines) == 3:
                            raw_size = lines[0].strip()
                            raw_price = lines[1].strip()
                            raw_stock = lines[2].strip()
                            
                            p_val = parse_price(raw_price)
                            s_val = parse_stock(raw_stock)
                            norm_size = normalize_size(raw_size)
                            
                            row = {
                                'label': norm_size['label'],
                                'originalLabel': norm_size['originalLabel'],
                                'price': p_val,
                                'stock': s_val,
                                'gradeRange': norm_size['gradeRange'],
                                'unit': norm_size['unit']
                            }
                            
                            if p_val is None:
                                self.not_provided_prices.append({
                                    'productNo': pno,
                                    'productName': prod_data['originalName'],
                                    'variant': cur_variant,
                                    'size': raw_size,
                                    'rawPrice': raw_price,
                                    'startingPriceRaw': prod_data['startingPriceRaw']
                                })
                                
                            if s_val is None or s_val != 20:
                                self.stock_outliers.append({
                                    'productNo': pno,
                                    'productName': prod_data['originalName'],
                                    'variant': cur_variant,
                                    'size': raw_size,
                                    'stock': raw_stock
                                })
                                
                            if cur_variant:
                                variants_dict[cur_variant].append(row)
                            else:
                                standard_sizes.append(row)

            # Metadata normalization
            prod_data['name'] = clean_product_name(prod_data['originalName'])
            prod_data['school'] = clean_school_name(prod_data['schoolRaw'])
            
            s_conf = SCHOOL_CONFIG.get(prod_data['schoolRaw'], SCHOOL_CONFIG.get(prod_data['school'], {}))
            prod_data['schoolCode'] = s_conf.get('code', prod_data['shortName'])
            prod_data['schoolSlug'] = s_conf.get('slug', slugify(prod_data['school']))
            
            cat_norm = prod_data['categoryRaw'].lower().strip()
            cat_info = CATEGORY_CONFIG.get(cat_norm, {})
            prod_data['category'] = cat_info.get('name', prod_data['categoryRaw'].capitalize())
            prod_data['categorySlug'] = cat_info.get('slug', slugify(prod_data['categoryRaw']))
            
            prod_data['startingPrice'] = parse_price(prod_data['startingPriceRaw']) or 0.0
            
            # Slug assignment
            if pno in EXISTING_SEED_SLUGS:
                prod_data['slug'] = EXISTING_SEED_SLUGS[pno]
            else:
                base_slug = slugify(prod_data['name'])
                if pno == 101 and base_slug == 'dps-neelbad-white-school-shorts-boys':
                    prod_data['slug'] = f"{base_slug}-alt"
                else:
                    prod_data['slug'] = base_slug

            # Inferred fields
            inferred = infer_schema_fields(prod_data['name'], prod_data['categorySlug'], prod_data['gender'])
            prod_data.update(inferred)
            
            # Organize sizes and variants
            if prod_data['hasVariants']:
                prod_data['variants'] = []
                all_prices = []
                for vname, vsizes in variants_dict.items():
                    prod_data['variants'].append({
                        'colorName': vname,
                        'images': [],
                        'sizes': vsizes
                    })
                    for sz in vsizes:
                        if sz['price'] is not None:
                            all_prices.append(sz['price'])
                prod_data['sizes'] = []
                prod_data['minPrice'] = min(all_prices) if all_prices else prod_data['startingPrice']
            else:
                prod_data['sizes'] = standard_sizes
                prod_data['variants'] = []
                all_prices = [sz['price'] for sz in standard_sizes if sz['price'] is not None]
                prod_data['minPrice'] = min(all_prices) if all_prices else prod_data['startingPrice']

            # -------------------------------------------------------------
            # Extract images & map to variants
            # -------------------------------------------------------------
            prod_images = []
            for pidx in [p - 1 for p in pages]:
                page = self.doc[pidx]
                imgs = page.get_images(full=True)
                words = page.get_text('words')
                
                # Group words into lines by (block_no, line_no)
                line_dict = defaultdict(list)
                for w in words:
                    line_dict[(w[5], w[6])].append(w)
                    
                captions = []
                for (bno, lno), lwords in line_dict.items():
                    lwords.sort(key=lambda w: w[0])
                    # chunk horizontal text
                    chunks = []
                    cur_c = []
                    for w in lwords:
                        if not cur_c:
                            cur_c.append(w)
                        else:
                            if w[0] - cur_c[-1][2] > 25:
                                chunks.append(cur_c)
                                cur_c = [w]
                            else:
                                cur_c.append(w)
                    if cur_c:
                        chunks.append(cur_c)
                        
                    for c in chunks:
                        ctext = ' '.join(w[4] for w in c).strip()
                        if 'variant' in ctext.lower() or 'product image' in ctext.lower() or 'image' in ctext.lower():
                            x0 = c[0][0]
                            y0 = c[0][1]
                            x1 = c[-1][2]
                            y1 = c[-1][3]
                            captions.append({
                                'text': ctext,
                                'bbox': (x0, y0, x1, y1),
                                'cx': (x0 + x1) / 2
                            })
                            
                for img in imgs:
                    total_images_extracted += 1
                    xref = img[0]
                    rect = page.get_image_rects(xref)[0]
                    cx = (rect.x0 + rect.x1) / 2
                    
                    # Match caption directly below
                    candidates = []
                    for cp in captions:
                        dy = cp['bbox'][1] - rect.y1
                        dx = abs(cp['cx'] - cx)
                        if -10 <= dy <= 55 and dx <= (rect.width / 2 + 50):
                            candidates.append((abs(dy), dx, cp['text']))
                            
                    best_caption = 'Product image'
                    if candidates:
                        candidates.sort(key=lambda c: (c[0], c[1]))
                        best_caption = candidates[0][2]
                    else:
                        self.ambiguous_images.append({
                            'productNo': pno,
                            'page': pidx + 1,
                            'xref': xref,
                            'reason': 'No caption found near image rect'
                        })
                        
                    # Extract raw image bytes and hash
                    img_data = self.doc.extract_image(xref)
                    img_bytes = img_data['image']
                    img_ext = img_data['ext']
                    img_hash = hashlib.sha256(img_bytes).hexdigest()
                    
                    # Match to variant
                    assigned_variant = None
                    m_cap_var = re.match(r'^(.*)\s+variant$', best_caption, re.I)
                    if m_cap_var:
                        cap_color = m_cap_var.group(1).strip()
                        for v in prod_data['variants']:
                            vname = v['colorName']
                            if vname.lower() == cap_color.lower() or cap_color.lower() in vname.lower() or vname.lower() in cap_color.lower():
                                assigned_variant = vname
                                break
                                
                    img_entry = {
                        'xref': xref,
                        'page': pidx + 1,
                        'caption': best_caption,
                        'variant': assigned_variant,
                        'width': img_data['width'],
                        'height': img_data['height'],
                        'format': img_ext,
                        'byteSize': len(img_bytes),
                        'sha256': img_hash
                    }
                    prod_images.append(img_entry)
                    self.images_map.append({
                        'productNo': pno,
                        'productSlug': prod_data['slug'],
                        **img_entry
                    })
                    
                    # Assign to product or variant
                    if assigned_variant:
                        for v in prod_data['variants']:
                            if v['colorName'] == assigned_variant:
                                v['images'].append(img_entry)
                    else:
                        prod_data['images'].append(img_entry)
                        
            # If variant product has top-level images, also attach to prod_data['images']
            if prod_data['hasVariants'] and not prod_data['images']:
                # Flatten variant images into prod_data['images'] for fallback
                for v in prod_data['variants']:
                    prod_data['images'].extend(v['images'])

            self.products.append(prod_data)

        if total_images_extracted != 210:
            raise ValueError(f"Expected 210 images, found {total_images_extracted}")

        return self.products

    def extract_image_files(self):
        os.makedirs(EXTRACTED_IMAGES_DIR, exist_ok=True)
        for item in self.images_map:
            xref = item['xref']
            img_data = self.doc.extract_image(xref)
            img_bytes = img_data['image']
            ext = img_data['ext']
            pno = item['productNo']
            slug = item['productSlug']
            var_part = f"_{slugify(item['variant'])}" if item['variant'] else ""
            filename = f"p{pno:03d}{var_part}_xref{xref}.{ext}"
            filepath = os.path.join(EXTRACTED_IMAGES_DIR, filename)
            if not os.path.exists(filepath):
                with open(filepath, 'wb') as f:
                    f.write(img_bytes)

    def generate_contact_sheets(self):
        os.makedirs(REVIEW_DIR, exist_ok=True)
        
        # Default font
        font = ImageFont.load_default()
        
        for p in self.products:
            pno = p['productNo']
            slug = p['slug']
            p_images = [img for img in self.images_map if img['productNo'] == pno]
            num_imgs = len(p_images)
            if num_imgs == 0:
                continue
                
            cols = min(num_imgs, 4)
            rows = (num_imgs + cols - 1) // cols
            
            thumb_w = 200
            thumb_h = 240
            pad = 20
            header_h = 100
            
            sheet_w = cols * thumb_w + (cols + 1) * pad
            sheet_h = header_h + rows * thumb_h + (rows + 1) * pad
            
            sheet = Image.new('RGB', (sheet_w, sheet_h), color=(248, 246, 240)) # Warm cream
            draw = ImageDraw.Draw(sheet)
            
            # Header
            header_text = f"Product {pno:03d}: {p['name']}\nSchool: {p['school']} ({p['schoolCode']})  |  Category: {p['category']}\nGender: {p['gender']}  |  Starting Price: INR {p['startingPrice']:.0f}  |  Sizes: {len(p['sizes'])} / Variants: {len(p['variants'])}"
            draw.text((pad, pad), header_text, fill=(10, 31, 58), font=font)
            
            # Draw thumbnails
            for idx, img_info in enumerate(p_images):
                r = idx // cols
                c = idx % cols
                x = pad + c * (thumb_w + pad)
                y = header_h + pad + r * (thumb_h + pad)
                
                # Load image from PDF
                img_data = self.doc.extract_image(img_info['xref'])
                from io import BytesIO
                thumb = Image.open(BytesIO(img_data['image'])).convert('RGB')
                thumb.thumbnail((thumb_w - 10, thumb_h - 60))
                
                # Paste centered
                tx = x + (thumb_w - thumb.width) // 2
                ty = y + 5
                sheet.paste(thumb, (tx, ty))
                
                # Caption & metadata text
                cap_text = f"{img_info['caption']}\n(xref {img_info['xref']}, p.{img_info['page']})\n{img_info['width']}x{img_info['height']} {img_info['format']}"
                draw.text((x + 5, y + thumb_h - 45), cap_text, fill=(30, 40, 50), font=font)
                
                # Border
                draw.rectangle([x, y, x + thumb_w, y + thumb_h], outline=(200, 195, 185), width=1)
                
            sheet_path = os.path.join(REVIEW_DIR, f"P{pno:03d}_{slug}.png")
            sheet.save(sheet_path, 'PNG')

    def rasterize_sample_pages(self, page_numbers: List[int] = [8, 9, 16, 22, 41, 70, 73, 109, 112, 126, 148]):
        os.makedirs(PAGES_REVIEW_DIR, exist_ok=True)
        for pno in page_numbers:
            if 1 <= pno <= len(self.doc):
                page = self.doc[pno - 1]
                pix = page.get_pixmap(dpi=150)
                out_path = os.path.join(PAGES_REVIEW_DIR, f"page_{pno:03d}.png")
                pix.save(out_path)

    def generate_reports(self) -> Dict[str, Any]:
        os.makedirs(IMPORT_DIR, exist_ok=True)
        
        # 1. products.import.json
        with open(PRODUCTS_IMPORT_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(self.products, f, indent=2, ensure_ascii=False)
            
        # 2. import-report.json
        # Categorize products
        products_to_create = []
        products_to_update = []
        
        for p in self.products:
            if p['isExistingSeed']:
                products_to_update.append({
                    'productNo': p['productNo'],
                    'slug': p['slug'],
                    'name': p['name'],
                    'originalName': p['originalName'],
                    'school': p['school'],
                    'category': p['category'],
                    'startingPrice': p['startingPrice'],
                    'minPrice': p['minPrice'],
                    'sizesCount': len(p['sizes']),
                    'variantsCount': len(p['variants']),
                    'action': 'UPDATE (preserve existing Cloudinary images, update sizes, prices, stock, metadata)'
                })
            else:
                products_to_create.append({
                    'productNo': p['productNo'],
                    'slug': p['slug'],
                    'name': p['name'],
                    'originalName': p['originalName'],
                    'school': p['school'],
                    'category': p['category'],
                    'startingPrice': p['startingPrice'],
                    'minPrice': p['minPrice'],
                    'sizesCount': len(p['sizes']),
                    'variantsCount': len(p['variants']),
                    'imagesCount': len([img for img in self.images_map if img['productNo'] == p['productNo']]),
                    'action': 'CREATE'
                })

        # Schools to create vs existing
        schools_summary = {
            'create': [s for s, c in SCHOOL_CONFIG.items() if c['action'] == 'create' and not s.endswith(',')],
            'existing': [s for s, c in SCHOOL_CONFIG.items() if c['action'] == 'existing' and not s.endswith(',')]
        }

        # Categories summary
        categories_summary = list(CATEGORY_CONFIG.values())

        report = {
            'generatedAt': '2026-11-07T02:00:00Z',
            'summary': {
                'totalProductsExtracted': len(self.products),
                'totalImagesExtracted': len(self.images_map),
                'productsToCreate': len(products_to_create),
                'productsToUpdate': len(products_to_update),
                'variantProductsCount': sum(1 for p in self.products if p['hasVariants']),
                'standardProductsCount': sum(1 for p in self.products if not p['hasVariants']),
                'missingPriceRowsCount': len(self.not_provided_prices),
                'stockOutlierRowsCount': len(self.stock_outliers),
                'ambiguousImagesCount': len(self.ambiguous_images)
            },
            'schools': schools_summary,
            'categories': categories_summary,
            'productsToUpdate': products_to_update,
            'productsToCreate': products_to_create,
            'notProvidedPrices': self.not_provided_prices,
            'stockOutliers': self.stock_outliers,
            'ambiguousImages': self.ambiguous_images,
            'duplicateAnalysis': {
                'product86': {
                    'productNo': 86,
                    'name': 'DPS Neelbad White School Shorts Boys',
                    'page': 123,
                    'sizesCount': 7,
                    'prices': [520, 530, 540, 550, 560, 580, 600],
                    'stock': [20, 20, 20, 20, 20, 20, 20],
                    'imagesCount': 1,
                    'imageXrefs': [276]
                },
                'product101': {
                    'productNo': 101,
                    'name': 'DPS Neelbad White School Shorts Boys',
                    'page': 149,
                    'sizesCount': 7,
                    'prices': [520, 530, 540, 550, 560, 580, 600],
                    'stock': [20, 20, 20, 20, 'Not provided', 20, 20],
                    'imagesCount': 3,
                    'imageXrefs': [342, 343, 344]
                },
                'conclusion': 'Identical product metadata and price scale; P101 contains 3 distinct photos and missing stock for size 17, while P86 has 1 photo and full stock 20. Recommend merging all 4 images into a single product or importing P101 with slug dps-neelbad-white-school-shorts-boys-alt.'
            }
        }
        
        with open(REPORT_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
            
        # 3. import-report.csv
        with open(REPORT_CSV_PATH, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                'ProductNo', 'Name', 'OriginalName', 'Slug', 'School', 'SchoolCode',
                'Category', 'Gender', 'Season', 'TypeGroup', 'ItemType',
                'StartingPrice', 'MinPrice', 'HasVariants', 'SizesCount', 'VariantsCount',
                'ImagesCount', 'IsExistingSeed', 'Action'
            ])
            for p in self.products:
                imgs_count = len([img for img in self.images_map if img['productNo'] == p['productNo']])
                writer.writerow([
                    p['productNo'], p['name'], p['originalName'], p['slug'], p['school'], p['schoolCode'],
                    p['category'], p['gender'], p['season'], p['typeGroup'], p['itemType'],
                    p['startingPrice'], p['minPrice'], p['hasVariants'], len(p['sizes']), len(p['variants']),
                    imgs_count, p['isExistingSeed'], 'UPDATE' if p['isExistingSeed'] else 'CREATE'
                ])

        return report

def main():
    print("Starting Indraprasth Uniforms Catalogue Parser...")
    parser = CatalogueParser()
    print("Parsing products...")
    parser.parse_all()
    print(f"Parsed {len(parser.products)} products and {len(parser.images_map)} images.")
    
    print("Extracting image files...")
    parser.extract_image_files()
    
    print("Generating contact sheets...")
    parser.generate_contact_sheets()
    
    print("Rasterizing sample pages for review...")
    parser.rasterize_sample_pages()
    
    print("Generating import reports (JSON & CSV)...")
    report = parser.generate_reports()
    
    print("\n" + "="*60)
    print("PARSE & DRY RUN COMPLETE!")
    print(f"Total Products: {report['summary']['totalProductsExtracted']} (108 expected)")
    print(f"Total Images: {report['summary']['totalImagesExtracted']} (210 expected)")
    print(f"Products to Update (Existing Seed): {report['summary']['productsToUpdate']}")
    print(f"Products to Create: {report['summary']['productsToCreate']}")
    print(f"Variant Products: {report['summary']['variantProductsCount']}")
    print(f"Standard Products: {report['summary']['standardProductsCount']}")
    print(f"Missing Price Rows: {report['summary']['missingPriceRowsCount']}")
    print(f"Stock Outlier Rows: {report['summary']['stockOutlierRowsCount']}")
    print(f"Ambiguous Images: {report['summary']['ambiguousImagesCount']}")
    print("="*60)

if __name__ == '__main__':
    main()
