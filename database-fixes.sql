-- ============================================
-- AK Production System — Database Fixes
-- Run in Supabase SQL Editor
-- ============================================

-- 1. Fix production_orders purpose constraint
ALTER TABLE production_orders DROP CONSTRAINT IF EXISTS production_orders_purpose_check;
ALTER TABLE production_orders ADD CONSTRAINT production_orders_purpose_check
  CHECK (purpose IN ('Stock', 'Sample', 'Online Order', 'Mixed', 'Custom Order', 'Restock'));

-- 2. Fix worker roles
UPDATE workers SET role = 'Computer Embroidery Operator' WHERE name = 'Sikandar';
UPDATE workers SET role = 'Night Machine Operator' WHERE name = 'Shafeeq';

-- 3. Sync product data from backup
UPDATE products SET production_path = ARRAY['Fabric Cut','Hand Embroidery','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Organza']::text[], stitch_rate = 400
  WHERE label = 'Eid Vol 1 - Black Dupatta - Dupatta';
UPDATE products SET production_path = ARRAY['Fabric Cut','Hand Embroidery','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Organza']::text[], stitch_rate = 400
  WHERE label = 'Eid Vol 1 - Red Dupatta - Dupatta';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Viscose']::text[], stitch_rate = 700
  WHERE label = 'Passion Black - Culottes';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Computer Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Swiss Lawn']::text[], stitch_rate = 1400
  WHERE label = 'Passion Black - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Raw Silk']::text[], stitch_rate = 700
  WHERE label = 'White Raw Silk Culottes - Culottes';
UPDATE products SET production_path = ARRAY['Fabric Cut','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Viscose']::text[], stitch_rate = 700
  WHERE label = 'Viscose Culottes - White';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Rosa - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'BTR - #10 - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Viscose']::text[], stitch_rate = 700
  WHERE label = 'Daisy Grey - Culottes';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Daisy Grey - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Viscose']::text[], stitch_rate = 700
  WHERE label = 'Hosta Blue - Culottes';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Organza']::text[], stitch_rate = 400
  WHERE label = 'Hosta Blue - Dupatta';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Hosta Blue - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Raw Silk']::text[], stitch_rate = 700
  WHERE label = 'Raw Silk Culottes - Culottes';
UPDATE products SET production_path = ARRAY['Fabric Cut','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Raw Silk']::text[], stitch_rate = 700
  WHERE label = 'Raw Silk Culottes - Culottes';
UPDATE products SET production_path = ARRAY['Fabric Cut','Computer Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Swiss Lawn']::text[], stitch_rate = 800
  WHERE label = 'Lunar Blue - Dupatta';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Viscose']::text[], stitch_rate = 700
  WHERE label = 'Lunar Blue - Shalwar';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Computer Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Swiss Lawn']::text[], stitch_rate = 1400
  WHERE label = 'Lunar Blue - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Raw Silk']::text[], stitch_rate = 700
  WHERE label = 'Raw Silk Culottes - Culottes';
UPDATE products SET production_path = ARRAY['Fabric Cut','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Viscose']::text[], stitch_rate = 700
  WHERE label = 'Viscose Culottes - Culottes';
UPDATE products SET production_path = ARRAY['Fabric Cut','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Raw Silk']::text[], stitch_rate = 700
  WHERE label = 'Raw Silk Culottes - Culottes';
UPDATE products SET production_path = ARRAY['Fabric Cut','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Raw Silk']::text[], stitch_rate = 700
  WHERE label = 'Raw Silk Shalwar - Culottes';
UPDATE products SET production_path = ARRAY['Fabric Cut','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Raw Silk']::text[], stitch_rate = 700
  WHERE label = 'Raw Silk Shalwar - Shalwar';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Computer Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Btr - #9 - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Celadon - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Computer Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 400
  WHERE label = 'Aliya - Dupatta';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Computer Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Aliya - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Computer Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Organza']::text[], stitch_rate = 800
  WHERE label = 'Anaya - Dupatta';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Computer Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Anaya - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Raw Silk']::text[], stitch_rate = 700
  WHERE label = 'Aqua Crystal - Shalwar';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Aqua Crystal - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Viscose']::text[], stitch_rate = 700
  WHERE label = 'Ayla - Culottes';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Organza']::text[], stitch_rate = 400
  WHERE label = 'Ayla - Dupatta';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Ayla - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Hand Embroidery','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Organza']::text[], stitch_rate = 400
  WHERE label = 'Bahaar - Dupatta';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Computer Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Bahaar - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Viscose']::text[], stitch_rate = 700
  WHERE label = 'Acacia Beige - Shalwar';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Acacia Beige - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Dana - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Organza']::text[], stitch_rate = 400
  WHERE label = 'Gulbaar - Dupatta';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Computer Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Gulbaar - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Viscose']::text[], stitch_rate = 700
  WHERE label = 'Gulnaar - Culottes';
UPDATE products SET production_path = ARRAY['Fabric Cut','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Organza']::text[], stitch_rate = 400
  WHERE label = 'Gulnaar - Dupatta';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Gulnaar - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Viscose']::text[], stitch_rate = 700
  WHERE label = 'Ilaya - Culottes';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Ilaya - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Raw Silk']::text[], stitch_rate = 700
  WHERE label = 'Imaan - Culottes';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Imaan - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Btr - #5 - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 1400
  WHERE label = 'Mia - Shirt & Matching Culottes';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Alia - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 1400
  WHERE label = 'Talia - Shirt & Matching Culottes';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Ria - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Organza']::text[], stitch_rate = 200
  WHERE label = 'Leia - Dupatta';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Leia - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Organza']::text[], stitch_rate = 400
  WHERE label = 'Mehar - Dupatta';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Mehar - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Safa - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Viscose']::text[], stitch_rate = 700
  WHERE label = 'Sahar - Culottes';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Sahar - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Viscose']::text[], stitch_rate = 700
  WHERE label = 'Sasha - Culottes';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Sasha - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Organza']::text[], stitch_rate = 400
  WHERE label = 'Sifaat - Dupatta';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Computer Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Sifaat - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Computer Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Swiss Lawn']::text[], stitch_rate = 400
  WHERE label = 'Syra - Dupatta';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Computer Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Swiss Lawn']::text[], stitch_rate = 1400
  WHERE label = 'Syra - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Viscose']::text[], stitch_rate = 700
  WHERE label = 'Terre - Shalwar';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Terre - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Tresse - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Tissue']::text[], stitch_rate = 700
  WHERE label = 'Tresse - Tulip Shalwar';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Rania - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Computer Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Organza']::text[], stitch_rate = 400
  WHERE label = 'Zoya - Dupatta';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Computer Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Zoya - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Moonlight Black - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Computer Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Tissue']::text[], stitch_rate = 1400
  WHERE label = 'Amaya - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Computer Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Organza']::text[], stitch_rate = 400
  WHERE label = 'Ana - Dupatta';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Ana - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Computer Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Organza']::text[], stitch_rate = 400
  WHERE label = 'Ananya - Dupatta';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Computer Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Ananya - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Viscose']::text[], stitch_rate = 700
  WHERE label = 'Liya - Culottes';
UPDATE products SET production_path = ARRAY['Fabric Cut','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Organza']::text[], stitch_rate = 400
  WHERE label = 'Liya - Dupatta';
UPDATE products SET production_path = ARRAY['Fabric Cut','Dyeing','Adda','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Cotton Net']::text[], stitch_rate = 700
  WHERE label = 'Liya - Shirt';
UPDATE products SET production_path = ARRAY['Fabric Cut','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Raw Silk','Organza']::text[], stitch_rate = 700
  WHERE label = 'Raw Silk Straight Pant - Pant';
UPDATE products SET production_path = ARRAY['Fabric Cut','Hand Embroidery','Stitching','QC','Packed','Dispatched']::text[], fabrics = ARRAY['Viscose','Organza']::text[], stitch_rate = 700
  WHERE label = 'Viscose Straight Pant - Pant';

-- 4. Import gross costs as BOM lines for products without detailed BOM
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 7500, 7500, 99
  FROM products WHERE label = 'Passion Black - Culottes'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 7500, 7500, 99
  FROM products WHERE label = 'Passion Black - Shirt'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 2100, 2100, 99
  FROM products WHERE label = 'White Raw Silk Culottes - Culottes'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 2.5, 280, 700, 1
  FROM products WHERE label = 'Viscose Culottes - White'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Viscose Culottes - White'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'thread', 'Thread', 1, 50, 50, 3
  FROM products WHERE label = 'Viscose Culottes - White'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'thread')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'embroidery', 'Embroidery', 1, 700, 700, 4
  FROM products WHERE label = 'Viscose Culottes - White'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'embroidery')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 200, 200, 5
  FROM products WHERE label = 'Viscose Culottes - White'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4, 520, 2080, 1
  FROM products WHERE label = 'Rosa - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Rosa - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'thread', 'Thread', 2, 50, 100, 3
  FROM products WHERE label = 'Rosa - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'thread')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'embroidery', 'Embroidery', 1, 800, 800, 4
  FROM products WHERE label = 'Rosa - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'embroidery')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 4980, 4980, 99
  FROM products WHERE label = 'BTR - #10 - Shirt'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 4428, 4428, 99
  FROM products WHERE label = 'Daisy Grey - Culottes'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4.4, 520, 2288, 1
  FROM products WHERE label = 'Daisy Grey - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4.4, 100, 440, 2
  FROM products WHERE label = 'Daisy Grey - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_work', 'Adda Work', 4, 290, 1160, 3
  FROM products WHERE label = 'Daisy Grey - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_work')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 4
  FROM products WHERE label = 'Daisy Grey - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 2.75, 280, 770, 1
  FROM products WHERE label = 'Hosta Blue - Culottes'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 2.75, 100, 275, 2
  FROM products WHERE label = 'Hosta Blue - Culottes'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'embroidery', 'Embroidery', 1, 400, 400, 3
  FROM products WHERE label = 'Hosta Blue - Culottes'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'embroidery')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 4
  FROM products WHERE label = 'Hosta Blue - Culottes'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 3, 950, 2850, 1
  FROM products WHERE label = 'Hosta Blue - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 3, 100, 300, 2
  FROM products WHERE label = 'Hosta Blue - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 400, 400, 3
  FROM products WHERE label = 'Hosta Blue - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4.4, 520, 2288, 1
  FROM products WHERE label = 'Hosta Blue - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4.4, 100, 440, 2
  FROM products WHERE label = 'Hosta Blue - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'embroidery', 'Embroidery', 1, 1000, 1000, 3
  FROM products WHERE label = 'Hosta Blue - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'embroidery')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 4
  FROM products WHERE label = 'Hosta Blue - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 2100, 2100, 99
  FROM products WHERE label = 'Raw Silk Culottes - Culottes'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 2100, 2100, 99
  FROM products WHERE label = 'Raw Silk Culottes - Culottes'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 3, 400, 1200, 1
  FROM products WHERE label = 'Lunar Blue - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 3, 100, 300, 2
  FROM products WHERE label = 'Lunar Blue - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'comp_emb', 'Comp Emb', 2.25, 450, 1013, 3
  FROM products WHERE label = 'Lunar Blue - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'comp_emb')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 4
  FROM products WHERE label = 'Lunar Blue - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 2.75, 280, 770, 1
  FROM products WHERE label = 'Lunar Blue - Shalwar'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 2.75, 100, 275, 2
  FROM products WHERE label = 'Lunar Blue - Shalwar'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 3
  FROM products WHERE label = 'Lunar Blue - Shalwar'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4.4, 400, 1760, 1
  FROM products WHERE label = 'Lunar Blue - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4.4, 100, 440, 2
  FROM products WHERE label = 'Lunar Blue - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'comp_emb', 'Comp Emb', 3.5, 700, 2450, 3
  FROM products WHERE label = 'Lunar Blue - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'comp_emb')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 1400, 1400, 4
  FROM products WHERE label = 'Lunar Blue - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 2100, 2100, 99
  FROM products WHERE label = 'Raw Silk Culottes - Culottes'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 1400, 1400, 99
  FROM products WHERE label = 'Viscose Culottes - Culottes'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 2100, 2100, 99
  FROM products WHERE label = 'Raw Silk Culottes - Culottes'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 4980, 4980, 99
  FROM products WHERE label = 'Btr - #9 - Shirt'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4, 520, 2080, 1
  FROM products WHERE label = 'Celadon - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Celadon - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'thread', 'Thread', 2, 50, 100, 3
  FROM products WHERE label = 'Celadon - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'thread')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'embroidery', 'Embroidery', 1, 800, 800, 4
  FROM products WHERE label = 'Celadon - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'embroidery')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 200, 200, 5
  FROM products WHERE label = 'Celadon - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 3, 950, 2850, 1
  FROM products WHERE label = 'Aliya - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 400, 400, 2
  FROM products WHERE label = 'Aliya - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 3, 100, 300, 3
  FROM products WHERE label = 'Aliya - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'lace', 'Lace', 8, 50, 400, 4
  FROM products WHERE label = 'Aliya - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'lace')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'comp_emb', 'Comp Emb', 2.5, 250, 625, 5
  FROM products WHERE label = 'Aliya - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'comp_emb')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4, 520, 2080, 1
  FROM products WHERE label = 'Aliya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Aliya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4, 200, 800, 3
  FROM products WHERE label = 'Aliya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'thread', 'Thread', 1, 250, 250, 4
  FROM products WHERE label = 'Aliya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'thread')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'comp_emb', 'Comp Emb', 1, 1100, 1100, 5
  FROM products WHERE label = 'Aliya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'comp_emb')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'design_punch', 'Design Punch', 1, 500, 500, 6
  FROM products WHERE label = 'Aliya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'design_punch')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 200, 200, 7
  FROM products WHERE label = 'Aliya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 3, 950, 2850, 1
  FROM products WHERE label = 'Anaya - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 800, 800, 2
  FROM products WHERE label = 'Anaya - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'applique', 'Applique', 1, 280, 280, 3
  FROM products WHERE label = 'Anaya - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'applique')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 3, 100, 300, 4
  FROM products WHERE label = 'Anaya - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'comp_emb', 'Comp Emb', 5, 250, 1250, 5
  FROM products WHERE label = 'Anaya - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'comp_emb')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4.25, 520, 2210, 1
  FROM products WHERE label = 'Anaya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Anaya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4, 200, 800, 3
  FROM products WHERE label = 'Anaya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'thread', 'Thread', 1, 250, 250, 4
  FROM products WHERE label = 'Anaya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'thread')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'comp_emb', 'Comp Emb', 7.65, 250, 1912.5, 5
  FROM products WHERE label = 'Anaya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'comp_emb')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'design_punch', 'Design Punch', 1, 500, 500, 6
  FROM products WHERE label = 'Anaya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'design_punch')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 200, 200, 7
  FROM products WHERE label = 'Anaya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 4500, 4500, 99
  FROM products WHERE label = 'Aqua Crystal - Shalwar'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 4500, 4500, 99
  FROM products WHERE label = 'Aqua Crystal - Shirt'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 2.75, 280, 770, 1
  FROM products WHERE label = 'Ayla - Culottes'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Ayla - Culottes'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 2.8, 100, 280, 3
  FROM products WHERE label = 'Ayla - Culottes'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 3, 950, 2850, 1
  FROM products WHERE label = 'Ayla - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 400, 400, 2
  FROM products WHERE label = 'Ayla - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 3, 100, 300, 3
  FROM products WHERE label = 'Ayla - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'lace', 'Lace', 8, 50, 400, 4
  FROM products WHERE label = 'Ayla - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'lace')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4, 520, 2080, 1
  FROM products WHERE label = 'Ayla - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Ayla - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4, 100, 400, 3
  FROM products WHERE label = 'Ayla - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 500, 500, 4
  FROM products WHERE label = 'Ayla - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_work', 'Adda Work', 20, 270, 5400, 5
  FROM products WHERE label = 'Ayla - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_work')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 3, 950, 2850, 1
  FROM products WHERE label = 'Bahaar - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 0, 0, 2
  FROM products WHERE label = 'Bahaar - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 3, 100, 300, 3
  FROM products WHERE label = 'Bahaar - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'lace', 'Lace', 8, 50, 400, 4
  FROM products WHERE label = 'Bahaar - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'lace')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'comp_emb', 'Comp Emb', 1.5, 250, 375, 5
  FROM products WHERE label = 'Bahaar - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'comp_emb')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4, 520, 2080, 1
  FROM products WHERE label = 'Bahaar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Bahaar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4, 200, 800, 3
  FROM products WHERE label = 'Bahaar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'thread', 'Thread', 1, 250, 250, 4
  FROM products WHERE label = 'Bahaar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'thread')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'comp_emb', 'Comp Emb', 7, 250, 1750, 5
  FROM products WHERE label = 'Bahaar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'comp_emb')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'design_punch', 'Design Punch', 1, 500, 500, 6
  FROM products WHERE label = 'Bahaar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'design_punch')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 200, 200, 7
  FROM products WHERE label = 'Bahaar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 4500, 4500, 99
  FROM products WHERE label = 'Acacia Beige - Shalwar'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 4500, 4500, 99
  FROM products WHERE label = 'Acacia Beige - Shirt'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4, 520, 2080, 1
  FROM products WHERE label = 'Dana - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Dana - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'applique', 'Applique', 0.5, 1000, 500, 3
  FROM products WHERE label = 'Dana - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'applique')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4, 150, 600, 4
  FROM products WHERE label = 'Dana - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'thread', 'Thread', 1, 50, 50, 5
  FROM products WHERE label = 'Dana - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'thread')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'embroidery', 'Embroidery', 1, 800, 800, 6
  FROM products WHERE label = 'Dana - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'embroidery')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'buttons', 'Buttons', 20, 10, 200, 7
  FROM products WHERE label = 'Dana - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'buttons')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 200, 200, 8
  FROM products WHERE label = 'Dana - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 3, 950, 2850, 1
  FROM products WHERE label = 'Gulbaar - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 400, 400, 2
  FROM products WHERE label = 'Gulbaar - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 3, 100, 300, 3
  FROM products WHERE label = 'Gulbaar - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'lace', 'Lace', 8, 50, 400, 4
  FROM products WHERE label = 'Gulbaar - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'lace')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'comp_emb', 'Comp Emb', 3, 250, 750, 5
  FROM products WHERE label = 'Gulbaar - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'comp_emb')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4, 520, 2080, 1
  FROM products WHERE label = 'Gulbaar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Gulbaar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4, 200, 800, 3
  FROM products WHERE label = 'Gulbaar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'thread', 'Thread', 1, 250, 250, 4
  FROM products WHERE label = 'Gulbaar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'thread')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'comp_emb', 'Comp Emb', 6.75, 250, 1687.5, 5
  FROM products WHERE label = 'Gulbaar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'comp_emb')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'design_punch', 'Design Punch', 1, 500, 500, 6
  FROM products WHERE label = 'Gulbaar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'design_punch')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 200, 200, 7
  FROM products WHERE label = 'Gulbaar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 2.75, 280, 770, 1
  FROM products WHERE label = 'Gulnaar - Culottes'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Gulnaar - Culottes'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 2.8, 100, 280, 3
  FROM products WHERE label = 'Gulnaar - Culottes'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 3, 950, 2850, 1
  FROM products WHERE label = 'Gulnaar - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 200, 200, 2
  FROM products WHERE label = 'Gulnaar - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 3, 100, 300, 3
  FROM products WHERE label = 'Gulnaar - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'lace', 'Lace', 8, 50, 400, 4
  FROM products WHERE label = 'Gulnaar - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'lace')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4, 520, 2080, 1
  FROM products WHERE label = 'Gulnaar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Gulnaar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4, 100, 400, 3
  FROM products WHERE label = 'Gulnaar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 500, 500, 4
  FROM products WHERE label = 'Gulnaar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_work', 'Adda Work', 16, 270, 4320, 5
  FROM products WHERE label = 'Gulnaar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_work')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 3, 300, 900, 1
  FROM products WHERE label = 'Ilaya - Culottes'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Ilaya - Culottes'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 3, 100, 300, 3
  FROM products WHERE label = 'Ilaya - Culottes'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4, 520, 2080, 1
  FROM products WHERE label = 'Ilaya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Ilaya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4, 100, 400, 3
  FROM products WHERE label = 'Ilaya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 300, 300, 4
  FROM products WHERE label = 'Ilaya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 4500, 4500, 99
  FROM products WHERE label = 'Imaan - Culottes'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4, 520, 2080, 1
  FROM products WHERE label = 'Imaan - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Imaan - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'applique', 'Applique', 0.5, 1000, 500, 3
  FROM products WHERE label = 'Imaan - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'applique')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4, 100, 400, 4
  FROM products WHERE label = 'Imaan - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'thread', 'Thread', 2, 50, 100, 5
  FROM products WHERE label = 'Imaan - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'thread')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'embroidery', 'Embroidery', 1, 1500, 1500, 6
  FROM products WHERE label = 'Imaan - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'embroidery')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 200, 200, 7
  FROM products WHERE label = 'Imaan - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 4980, 4980, 99
  FROM products WHERE label = 'Btr - #5 - Shirt'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 3500, 3500, 99
  FROM products WHERE label = 'Mia - Shirt & Matching Culottes'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 3500, 3500, 99
  FROM products WHERE label = 'Alia - Shirt'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 3500, 3500, 99
  FROM products WHERE label = 'Talia - Shirt & Matching Culottes'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 3500, 3500, 99
  FROM products WHERE label = 'Ria - Shirt'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 3, 750, 2250, 1
  FROM products WHERE label = 'Leia - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 200, 200, 2
  FROM products WHERE label = 'Leia - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 3, 100, 300, 3
  FROM products WHERE label = 'Leia - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4, 520, 2080, 1
  FROM products WHERE label = 'Leia - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Leia - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4, 200, 800, 3
  FROM products WHERE label = 'Leia - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 1250, 1250, 4
  FROM products WHERE label = 'Leia - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_work', 'Adda Work', 11, 270, 2970, 5
  FROM products WHERE label = 'Leia - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_work')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 3, 950, 2850, 1
  FROM products WHERE label = 'Mehar - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 400, 400, 2
  FROM products WHERE label = 'Mehar - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 3, 100, 300, 3
  FROM products WHERE label = 'Mehar - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'lace', 'Lace', 8, 50, 400, 4
  FROM products WHERE label = 'Mehar - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'lace')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4, 520, 2080, 1
  FROM products WHERE label = 'Mehar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Mehar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4, 100, 400, 3
  FROM products WHERE label = 'Mehar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 1000, 1000, 4
  FROM products WHERE label = 'Mehar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_work', 'Adda Work', 44, 270, 11880, 5
  FROM products WHERE label = 'Mehar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_work')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4, 520, 2080, 1
  FROM products WHERE label = 'Safa - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Safa - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'applique', 'Applique', 0.75, 1000, 750, 3
  FROM products WHERE label = 'Safa - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'applique')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4, 100, 400, 4
  FROM products WHERE label = 'Safa - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'thread', 'Thread', 2, 50, 100, 5
  FROM products WHERE label = 'Safa - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'thread')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'embroidery', 'Embroidery', 1, 2000, 2000, 6
  FROM products WHERE label = 'Safa - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'embroidery')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 200, 200, 7
  FROM products WHERE label = 'Safa - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 4500, 4500, 99
  FROM products WHERE label = 'Sahar - Culottes'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4, 520, 2080, 1
  FROM products WHERE label = 'Sahar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Sahar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4, 150, 600, 3
  FROM products WHERE label = 'Sahar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'embroidery', 'Embroidery', 1, 700, 700, 4
  FROM products WHERE label = 'Sahar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'embroidery')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 200, 200, 5
  FROM products WHERE label = 'Sahar - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 4500, 4500, 99
  FROM products WHERE label = 'Sasha - Culottes'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4, 520, 2080, 1
  FROM products WHERE label = 'Sasha - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Sasha - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'applique', 'Applique', 0.75, 1000, 750, 3
  FROM products WHERE label = 'Sasha - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'applique')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4, 150, 600, 4
  FROM products WHERE label = 'Sasha - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'thread', 'Thread', 1, 50, 50, 5
  FROM products WHERE label = 'Sasha - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'thread')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'embroidery', 'Embroidery', 1, 1500, 1500, 6
  FROM products WHERE label = 'Sasha - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'embroidery')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 2350, 2350, 7
  FROM products WHERE label = 'Sasha - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 3, 1100, 3300, 1
  FROM products WHERE label = 'Sifaat - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 400, 400, 2
  FROM products WHERE label = 'Sifaat - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 3, 100, 300, 3
  FROM products WHERE label = 'Sifaat - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'lace', 'Lace', 8, 50, 400, 4
  FROM products WHERE label = 'Sifaat - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'lace')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 5, 520, 2600, 1
  FROM products WHERE label = 'Sifaat - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Sifaat - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4, 100, 400, 3
  FROM products WHERE label = 'Sifaat - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'thread', 'Thread', 1, 250, 250, 4
  FROM products WHERE label = 'Sifaat - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'thread')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'lace', 'Lace', 6, 35, 210, 5
  FROM products WHERE label = 'Sifaat - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'lace')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'comp_emb', 'Comp Emb', 1, 3000, 3000, 6
  FROM products WHERE label = 'Sifaat - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'comp_emb')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 200, 200, 7
  FROM products WHERE label = 'Sifaat - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 3, 450, 1350, 1
  FROM products WHERE label = 'Syra - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 400, 400, 2
  FROM products WHERE label = 'Syra - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 3, 100, 300, 3
  FROM products WHERE label = 'Syra - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'lace', 'Lace', 8, 50, 400, 4
  FROM products WHERE label = 'Syra - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'lace')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'comp_emb', 'Comp Emb', 3.5, 250, 875, 5
  FROM products WHERE label = 'Syra - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'comp_emb')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4, 450, 1800, 1
  FROM products WHERE label = 'Syra - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Syra - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4, 200, 800, 3
  FROM products WHERE label = 'Syra - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'thread', 'Thread', 1, 250, 250, 4
  FROM products WHERE label = 'Syra - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'thread')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'comp_emb', 'Comp Emb', 5.5, 250, 1375, 5
  FROM products WHERE label = 'Syra - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'comp_emb')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'design_punch', 'Design Punch', 1, 500, 500, 6
  FROM products WHERE label = 'Syra - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'design_punch')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 200, 200, 7
  FROM products WHERE label = 'Syra - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 3, 300, 900, 1
  FROM products WHERE label = 'Terre - Shalwar'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Terre - Shalwar'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 3, 100, 300, 3
  FROM products WHERE label = 'Terre - Shalwar'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4, 520, 2080, 1
  FROM products WHERE label = 'Terre - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Terre - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'applique', 'Applique', 0.5, 1500, 750, 3
  FROM products WHERE label = 'Terre - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'applique')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4, 100, 400, 4
  FROM products WHERE label = 'Terre - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'thread', 'Thread', 1, 200, 200, 5
  FROM products WHERE label = 'Terre - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'thread')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'embroidery', 'Embroidery', 1, 900, 900, 6
  FROM products WHERE label = 'Terre - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'embroidery')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 200, 200, 7
  FROM products WHERE label = 'Terre - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4, 520, 2080, 1
  FROM products WHERE label = 'Tresse - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Tresse - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'applique', 'Applique', 0.35, 1500, 525, 3
  FROM products WHERE label = 'Tresse - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'applique')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'thread', 'Thread', 1, 200, 200, 4
  FROM products WHERE label = 'Tresse - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'thread')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'embroidery', 'Embroidery', 1, 700, 700, 5
  FROM products WHERE label = 'Tresse - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'embroidery')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 200, 200, 6
  FROM products WHERE label = 'Tresse - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 3, 300, 900, 1
  FROM products WHERE label = 'Tresse - Tulip Shalwar'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Tresse - Tulip Shalwar'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 3, 100, 300, 3
  FROM products WHERE label = 'Tresse - Tulip Shalwar'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 4200, 4200, 99
  FROM products WHERE label = 'Rania - Shirt'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 3, 950, 2850, 1
  FROM products WHERE label = 'Zoya - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 400, 400, 2
  FROM products WHERE label = 'Zoya - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 3, 100, 300, 3
  FROM products WHERE label = 'Zoya - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'lace', 'Lace', 8, 50, 400, 4
  FROM products WHERE label = 'Zoya - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'lace')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'comp_emb', 'Comp Emb', 2.5, 250, 625, 5
  FROM products WHERE label = 'Zoya - Dupatta'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'comp_emb')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'fabric', 'Fabric', 4, 520, 2080, 1
  FROM products WHERE label = 'Zoya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'fabric')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'stitching', 'Stitching', 1, 700, 700, 2
  FROM products WHERE label = 'Zoya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'stitching')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'dyeing', 'Dyeing', 4, 200, 800, 3
  FROM products WHERE label = 'Zoya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'dyeing')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'thread', 'Thread', 1, 250, 250, 4
  FROM products WHERE label = 'Zoya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'thread')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'comp_emb', 'Comp Emb', 2.5, 250, 625, 5
  FROM products WHERE label = 'Zoya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'comp_emb')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'design_punch', 'Design Punch', 1, 500, 500, 6
  FROM products WHERE label = 'Zoya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'design_punch')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'adda_material', 'Adda Material', 1, 200, 200, 7
  FROM products WHERE label = 'Zoya - Shirt'
  AND NOT EXISTS (SELECT 1 FROM product_bom pb WHERE pb.product_id = products.id AND pb.line_key = 'adda_material')
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 4500, 4500, 99
  FROM products WHERE label = 'Moonlight Black - Shirt'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 6800, 6800, 99
  FROM products WHERE label = 'Amaya - Shirt'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 6310, 6310, 99
  FROM products WHERE label = 'Ana - Dupatta'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 6310, 6310, 99
  FROM products WHERE label = 'Ana - Shirt'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 6310, 6310, 99
  FROM products WHERE label = 'Ananya - Dupatta'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 6310, 6310, 99
  FROM products WHERE label = 'Ananya - Shirt'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 4200, 4200, 99
  FROM products WHERE label = 'Liya - Culottes'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 4200, 4200, 99
  FROM products WHERE label = 'Liya - Dupatta'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 4200, 4200, 99
  FROM products WHERE label = 'Liya - Shirt'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 6200, 6200, 99
  FROM products WHERE label = 'Raw Silk Straight Pant - Pant'
  ON CONFLICT DO NOTHING;
INSERT INTO product_bom (product_id, line_key, line_label, qty, rate, total, sort_order)
  SELECT id, 'gross_total', 'Gross Cost (Unitemized)', 1, 1400, 1400, 99
  FROM products WHERE label = 'Viscose Straight Pant - Pant'
  ON CONFLICT DO NOTHING;

-- ============================================
-- DONE
-- ============================================