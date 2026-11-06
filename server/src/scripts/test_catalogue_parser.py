"""
Unit tests for Indraprasth Uniforms Catalogue Parser.
"""

import unittest
import os
import sys

# Ensure script directory is on path
sys.path.insert(0, os.path.dirname(__file__))

from catalogue_parser import (
    parse_price,
    parse_stock,
    normalize_size,
    clean_product_name,
    clean_school_name,
    infer_schema_fields,
    slugify,
    CatalogueParser,
    PDF_PATH
)

class TestCatalogueParser(unittest.TestCase):

    def test_parse_price(self):
        # Normal numeric
        self.assertEqual(parse_price("945"), 945.0)
        self.assertEqual(parse_price("100"), 100.0)
        
        # Thousands comma
        self.assertEqual(parse_price("1,045"), 1045.0)
        self.assertEqual(parse_price("1,645"), 1645.0)
        
        # Currency prefix
        self.assertEqual(parse_price("INR 945"), 945.0)
        self.assertEqual(parse_price("INR 1,295"), 1295.0)
        
        # Not provided
        self.assertIsNone(parse_price("Not provided"))
        self.assertIsNone(parse_price("not provided"))
        self.assertIsNone(parse_price(""))

    def test_parse_stock(self):
        self.assertEqual(parse_stock("20"), 20)
        self.assertEqual(parse_stock("19"), 19)
        self.assertEqual(parse_stock("200"), 200)
        self.assertEqual(parse_stock("220"), 220)
        self.assertIsNone(parse_stock("Not provided"))
        self.assertIsNone(parse_stock(""))

    def test_normalize_size(self):
        # Pure number
        s = normalize_size("32")
        self.assertEqual(s['label'], "32")
        self.assertEqual(s['originalLabel'], "32")
        self.assertEqual(s['unit'], "size")
        self.assertIsNone(s['gradeRange'])
        
        # Free size
        s_free = normalize_size("free size")
        self.assertEqual(s_free['label'], "Free Size")
        self.assertEqual(s_free['originalLabel'], "free size")
        
        s_free_upper = normalize_size("FREE SIZE")
        self.assertEqual(s_free_upper['label'], "Free Size")
        
        # Inch
        s_inch = normalize_size("16 inch")
        self.assertEqual(s_inch['label'], "16")
        self.assertEqual(s_inch['unit'], "inch")
        
        # Length
        s_len = normalize_size("L, 18")
        self.assertEqual(s_len['label'], "L 18")
        self.assertEqual(s_len['unit'], "length_inch")
        
        # Size prefix
        s_sz = normalize_size("Size 14")
        self.assertEqual(s_sz['label'], "14")
        self.assertEqual(s_sz['unit'], "size")
        
        # Parenthesized grade range
        s_gr1 = normalize_size("30 (1st to 4th)")
        self.assertEqual(s_gr1['label'], "30")
        self.assertEqual(s_gr1['gradeRange'], "1st to 4th")
        
        s_gr2 = normalize_size("4 (3th - 4th)")
        self.assertEqual(s_gr2['label'], "4")
        self.assertEqual(s_gr2['gradeRange'], "3rd - 4th")

    def test_clean_product_name(self):
        self.assertEqual(clean_product_name("Dps Kolar Blazzer"), "DPS Kolar Blazer")
        self.assertEqual(clean_product_name("Sanskaar Winter Swater"), "Sanskaar Winter Sweater")
        self.assertEqual(clean_product_name("st joseph Tuniq"), "St. Joseph's Tunic")
        self.assertEqual(clean_product_name("st joseph 1st class Knecker"), "St. Joseph's 1st class Knicker")
        self.assertEqual(clean_product_name("St Josiph Q ( Kg 1 - Kg2 ) Skirt"), "St. Joseph's Q (KG 1 - KG 2) Skirt")
        self.assertEqual(clean_product_name("st joseph house Strip"), "St. Joseph's House Stripe")
        self.assertEqual(clean_product_name("Dps Winter full Shirt Bhopal"), "DPS Winter Full Shirt")

    def test_clean_school_name(self):
        self.assertEqual(
            clean_school_name("Delhi Public School Kolar Road,"),
            "Delhi Public School Kolar Road"
        )
        self.assertEqual(
            clean_school_name("The Sanskaar Valley School"),
            "The Sanskaar Valley School"
        )

    def test_infer_schema_fields(self):
        # Winter blazer
        f1 = infer_schema_fields("DPS Bhopal Blazer", "winter-ware", "unisex")
        self.assertEqual(f1['season'], "winter")
        self.assertEqual(f1['typeGroup'], "outerwear")
        self.assertEqual(f1['itemType'], "Blazer")
        
        # Tie
        f2 = infer_schema_fields("DPS Winter Tie", "winter-ware", "unisex")
        self.assertEqual(f2['season'], "winter")
        self.assertEqual(f2['typeGroup'], "accessories")
        self.assertEqual(f2['itemType'], "Tie")
        
        # T-Shirt
        f3 = infer_schema_fields("Sagar Public School Saket Nagar Blue House T-Shirt", "t-shirt", "unisex")
        self.assertEqual(f3['season'], "all")
        self.assertEqual(f3['typeGroup'], "tops")
        self.assertEqual(f3['itemType'], "T-shirt")
        
        # Socks
        f4 = infer_schema_fields("Billabong High School Socks Boys & Girls", "socks", "unisex")
        self.assertEqual(f4['typeGroup'], "footwear")
        self.assertEqual(f4['itemType'], "Socks")

    def test_full_catalogue_counts(self):
        if not os.path.exists(PDF_PATH):
            self.skipTest("PDF not available")
            
        parser = CatalogueParser(PDF_PATH)
        products = parser.parse_all()
        
        # Invariants from prompt
        self.assertEqual(len(products), 108, "Must extract exactly 108 products")
        self.assertEqual(len(parser.images_map), 210, "Must extract exactly 210 images")
        self.assertEqual(len(parser.ambiguous_images), 0, "No ambiguous images allowed")
        
        # Seed products count
        seed_count = sum(1 for p in products if p['isExistingSeed'])
        self.assertEqual(seed_count, 8, "Must flag exactly 8 existing seed products")
        
        # Missing price rows
        self.assertEqual(len(parser.not_provided_prices), 35, "Exactly 35 missing price rows expected")
        
        # Stock outliers
        self.assertEqual(len(parser.stock_outliers), 7, "Exactly 7 stock outlier rows expected")

if __name__ == '__main__':
    unittest.main()
