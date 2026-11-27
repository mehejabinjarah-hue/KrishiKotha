-- KrishiKotha (কৃষিকথা) - 03_seed.sql
-- Idempotent seed data: 10 categories, 6 farmers, 42 products, variants in integer BDT, reviews, and coupon KRISHI100.
-- Run this third in Supabase SQL Editor.

-- 1. Categories (exact 10 from specification)
insert into public.categories (slug, name_en, name_bn, icon, sort_order, image_url) values
  ('fresh-vegetables', 'Fresh Vegetables', 'তাজা সবজি', 'nutrition', 1, '/src/assets/images/product_deshi_tomato_1795777183588.jpg'),
  ('leafy-greens', 'Leafy Greens', 'শাক-পাতা', 'eco', 2, '/src/assets/images/product_leafy_greens_1795777183941.jpg'),
  ('seasonal-fruits', 'Seasonal Fruits', 'মৌসুমি ফল', 'sunny', 3, '/src/assets/images/product_seasonal_mango_1795777184084.jpg'),
  ('rice-grains', 'Rice & Grains', 'চাল ও শস্য', 'grain', 4, '/src/assets/images/product_grains_oil_1795777184817.jpg'),
  ('pulses-lentils', 'Pulses & Lentils', 'ডাল ও ডালজাতীয়', 'soup_kitchen', 5, '/src/assets/images/product_grains_oil_1795777184817.jpg'),
  ('natural-spices', 'Natural Spices', 'খাঁটি মসলা', 'spa', 6, '/src/assets/images/product_grains_oil_1795777184817.jpg'),
  ('oils-ghee-honey', 'Mustard Oil & Ghee', 'তেল, মধু ও ঘি', 'water_drop', 7, '/src/assets/images/product_grains_oil_1795777184817.jpg'),
  ('verified-organic', 'Verified Organic', 'অর্গানিক পণ্য', 'verified', 8, '/src/assets/images/product_leafy_greens_1795777183941.jpg'),
  ('weekly-baskets', 'Weekly Baskets', 'সাপ্তাহিক ঝুড়ি', 'shopping_basket', 9, '/src/assets/images/product_weekly_basket_1795777184690.jpg'),
  ('ready-to-cook', 'Ready-to-Cook', 'কাটা ও ধোয়া সবজি', 'skillet', 10, '/src/assets/images/product_weekly_basket_1795777184690.jpg')
on conflict (slug) do update set
  name_en = excluded.name_en,
  name_bn = excluded.name_bn,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  image_url = excluded.image_url;

-- 2. Farmers (6 smallholder growers across Bangladesh)
insert into public.farmers (slug, name_en, name_bn, district, upazila, specialty, years_farming, acres, story, quote, photo_url, is_verified) values
  ('karim-mia', 'Karim Mia', 'করিম মিয়া', 'Bogura', 'Shibganj', 'Organic Deshi Tomatoes & Red Spinach', 18, 5.2,
   'Karim Mia leads a 14-family organic cooperative in Shibganj, Bogura. He replaced synthetic sprays with vermicompost and neem leaf extracts twelve years ago, allowing morning harvests to reach Dhaka tables before lunch.',
   'When Dhaka families taste our tomatoes at noon, they taste Shibganj soil at sunrise.',
   '/src/assets/images/farmer_karim_portrait_1795777185179.jpg', true),
  ('selina-begum', 'Selina Begum', 'সেলিনা বেগম', 'Rangpur', 'Mithapukur', 'Pointed Gourd, Bottle Gourd & Leafy Greens', 14, 3.8,
   'Selina Begum transformed her homestead plots in Mithapukur into a women-led safe-vegetable collective. Every gourd and bundle of shak is hand-inspected at dawn and tagged with a QR batch code.',
   'Fair prices mean our daughters stay in school and our soil stays chemical-free.',
   '/src/assets/images/farmer_selina_portrait_1795777185325.jpg', true),
  ('rahim-uddin', 'Rahim Uddin', 'রহিম উদ্দিন', 'Rajshahi', 'Charghat', 'Heirloom Tomatoes & Riverbank Vegetables', 22, 6.0,
   'Farming along the Padma silt banks in Charghat, Rahim Uddin specializes in sweet, thin-skinned deshi tomatoes and crisp winter vegetables grown with natural river-silt mulch.',
   'Good soil needs patience, not shortcuts.',
   '/src/assets/images/farmer_karim_portrait_1795777185179.jpg', true),
  ('rafiqul-islam', 'Rafiqul Islam', 'রফিকুল ইসলাম', 'Rajshahi', 'Bagha', 'GI-Tagged Himsagar & Amrapali Mangoes', 25, 8.5,
   'Rafiqul Islam manages an ancestral mango orchard in Bagha where fruits ripen naturally on the branch without carbide or formalin, picked only after sugar-brix checks.',
   'A true Rajshahi mango never needs chemicals to turn golden.',
   '/src/assets/images/farmer_karim_portrait_1795777185179.jpg', true),
  ('mizanur-rahman', 'Mizanur Rahman', 'মিজানুর রহমান', 'Dinajpur', 'Chirirbandar', 'Aromatic Kalo Jeera & Chinigura Rice', 16, 7.4,
   'Mizanur Rahman preserves heirloom short-grain aromatic rice varieties in Dinajpur, milling small batches weekly so natural fragrance and bran nutrients remain intact.',
   'Freshly milled Kalo Jeera fills the whole house with aroma.',
   '/src/assets/images/farmer_karim_portrait_1795777185179.jpg', true),
  ('pabna-cooperative', 'Amena Khatun & Pabna Cooperative', 'আমেনা খাতুন ও পাবনা সমবায়', 'Pabna', 'Ishwardi', 'Wood-Pressed Mustard Oil, Country Onions & Lentils', 12, 11.0,
   'A cooperative of 28 smallholder households in Pabna pressing single-origin mustard seeds in traditional wooden ghani mills and sun-curing country onions and masoor lentils.',
   'Cold-pressed slowly in wood so the true pungency stays in every drop.',
   '/src/assets/images/farmer_selina_portrait_1795777185325.jpg', true)
on conflict (slug) do update set
  name_en = excluded.name_en,
  name_bn = excluded.name_bn,
  district = excluded.district,
  upazila = excluded.upazila,
  specialty = excluded.specialty,
  story = excluded.story,
  quote = excluded.quote,
  photo_url = excluded.photo_url;

-- 3. Coupon KRISHI100
insert into public.coupons (code, description, discount_type, discount_value, min_subtotal_bdt, is_active, expires_at) values
  ('KRISHI100', 'Flat ৳100 off orders of ৳799 or more', 'flat', 100, 799, true, '2028-12-31T23:59:59Z')
on conflict (code) do update set
  description = excluded.description,
  discount_type = excluded.discount_type,
  discount_value = excluded.discount_value,
  min_subtotal_bdt = excluded.min_subtotal_bdt,
  is_active = excluded.is_active;

-- 4. Products (42 realistic products across all 10 categories) + Variants
do $$
declare
  c_veg uuid; c_leafy uuid; c_fruit uuid; c_rice uuid; c_pulse uuid;
  c_spice uuid; c_oil uuid; c_org uuid; c_basket uuid; c_rtc uuid;
  f_karim uuid; f_selina uuid; f_rahim uuid; f_rafiq uuid; f_mizan uuid; f_pabna uuid;
  v_prod_id uuid;

  v_tomato_img text := '/src/assets/images/product_deshi_tomato_1795777183588.jpg';
  v_leafy_img text := '/src/assets/images/product_leafy_greens_1795777183941.jpg';
  v_mango_img text := '/src/assets/images/product_seasonal_mango_1795777184084.jpg';
  v_grains_img text := '/src/assets/images/product_grains_oil_1795777184817.jpg';
  v_basket_img text := '/src/assets/images/product_weekly_basket_1795777184690.jpg';
begin
  select id into c_veg from public.categories where slug = 'fresh-vegetables';
  select id into c_leafy from public.categories where slug = 'leafy-greens';
  select id into c_fruit from public.categories where slug = 'seasonal-fruits';
  select id into c_rice from public.categories where slug = 'rice-grains';
  select id into c_pulse from public.categories where slug = 'pulses-lentils';
  select id into c_spice from public.categories where slug = 'natural-spices';
  select id into c_oil from public.categories where slug = 'oils-ghee-honey';
  select id into c_org from public.categories where slug = 'verified-organic';
  select id into c_basket from public.categories where slug = 'weekly-baskets';
  select id into c_rtc from public.categories where slug = 'ready-to-cook';

  select id into f_karim from public.farmers where slug = 'karim-mia';
  select id into f_selina from public.farmers where slug = 'selina-begum';
  select id into f_rahim from public.farmers where slug = 'rahim-uddin';
  select id into f_rafiq from public.farmers where slug = 'rafiqul-islam';
  select id into f_mizan from public.farmers where slug = 'mizanur-rahman';
  select id into f_pabna from public.farmers where slug = 'pabna-cooperative';

  -- Anchor 1: Organic Deshi Tomato (Featured Product)
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, gallery_urls, origin_district, origin_hub, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, trace_log, rating_avg, rating_count, is_featured, basket_eligible)
  values (
    'deshi-tomato', c_veg, f_karim,
    'Organic Deshi Tomato', 'দেশি টমেটো',
    'Sun-ripened heirloom deshi tomatoes harvested at 5:30 AM in Shibganj, Bogura. Thin-skinned, naturally tangy, and grown without synthetic pesticides.',
    'বগুড়ার শিবগঞ্জ থেকে ভোর ৫:৩০-এ তোলা টাটকা অর্গানিক দেশি টমেটো। পাতলা খোসা ও প্রাকৃতিক টক-মিষ্টি স্বাদ।',
    v_tomato_img, array[v_tomato_img, v_basket_img], 'Bogura', 'Tejgaon Hub', true, 'today', 'Harvested 5:30 AM', 'organic',
    array['Harvested Today', 'Verified Organic', 'Pesticide Free'], 'BD-BG-402-TM',
    '[{"time":"05:30 AM","title":"Hand-picked at Sunrise","detail":"Harvested by Karim Mia at Shibganj Plot #4 (5.2 acres organic)."},{"time":"06:45 AM","title":"Graded & QR Tagged","detail":"Sorted into ventilated bamboo crates with batch QR #BD-BG-402-TM."},{"time":"08:15 AM","title":"Dispatched to Tejgaon Hub","detail":"Loaded onto morning chilled transport for 11:00 AM Dhaka delivery."}]'::jsonb,
    4.9, 128, true, true
  )
  on conflict (slug) do update set name_en = excluded.name_en, farmer_id = excluded.farmer_id, trace_id = excluded.trace_id, trace_log = excluded.trace_log, image_url = excluded.image_url
  returning id into v_prod_id;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, compare_at_price_bdt, stock_qty, is_default, sort_order) values
    (v_prod_id, 'KK-TM-500', '500g Pack', '৫০০ গ্রাম প্যাক', 500, 65, 75, 85, true, 1),
    (v_prod_id, 'KK-TM-1000', '1 kg Family Pack', '১ কেজি ফ্যামিলি প্যাক', 1000, 120, 130, 60, false, 2),
    (v_prod_id, 'KK-TM-2000', '2 kg Crate', '২ কেজি ঝুড়ি', 2000, 230, 260, 25, false, 3)
  on conflict (sku) do update set price_bdt = excluded.price_bdt, compare_at_price_bdt = excluded.compare_at_price_bdt, stock_qty = excluded.stock_qty;

  -- Seed reviews for Deshi Tomato
  if not exists (select 1 from public.product_reviews where product_id = v_prod_id) then
    insert into public.product_reviews (product_id, author_name, area, rating, comment) values
      (v_prod_id, 'Nusrat Jahan', 'Gulshan 2', 5, 'Just like the tomatoes my grandmother used to cook with. So fragrant and juicy!'),
      (v_prod_id, 'তানভীর আহমেদ', 'Dhanmondi', 5, 'সকালে অর্ডার করে দুপুরেই পেয়েছি। একদম টাটকা, কোনো দাগ নেই।'),
      (v_prod_id, 'Farhana Kabir', 'Uttara Sector 7', 5, 'Scanned the QR code and saw Karim Mia''s farm details. Truly trustworthy.');
  end if;

  -- Anchor 2: Red Spinach (Lal Shak)
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, gallery_urls, origin_district, origin_hub, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, trace_log, rating_avg, rating_count, is_featured, basket_eligible)
  values (
    'red-spinach-lal-shak', c_leafy, f_karim,
    'Red Spinach (Lal Shak)', 'লাল শাক',
    'Crisp, tender red amaranth leaves tied in fresh morning bundles. Washed in clean tube-well water before dispatch.',
    'ভোরবেলা তোলা কচি লাল শাকের আঁটি। পরিষ্কার পানিতে ধোয়া এবং সম্পূর্ণ কীটনাশকমুক্ত।',
    v_leafy_img, array[v_leafy_img], 'Bogura', 'Tejgaon Hub', true, 'today', 'Harvested 5:15 AM', 'organic',
    array['Harvested Today', 'Verified Organic'], 'BD-BG-408-LS',
    '[{"time":"05:15 AM","title":"Picked with Morning Dew","detail":"Root-trimmed and tied with jute twine in Shibganj."},{"time":"07:30 AM","title":"Cool-Box Dispatch","detail":"Packed upright in ventilated crates for Tejgaon Hub."}]'::jsonb,
    4.9, 94, true, true
  ) on conflict (slug) do update set image_url = excluded.image_url returning id into v_prod_id;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, compare_at_price_bdt, stock_qty, is_default, sort_order) values
    (v_prod_id, 'KK-LS-500', '500g Bundle', '৫০০ গ্রাম আঁটি', 500, 35, 45, 70, true, 1),
    (v_prod_id, 'KK-LS-1000', '1 kg Double Bundle', '১ কেজি জোড়া আঁটি', 1000, 65, 85, 40, false, 2)
  on conflict (sku) do update set price_bdt = excluded.price_bdt;

  -- Anchor 3: Pointed Gourd (Potol)
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, gallery_urls, origin_district, origin_hub, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, trace_log, rating_avg, rating_count, is_featured, basket_eligible)
  values (
    'pointed-gourd-potol', c_veg, f_selina,
    'Pointed Gourd (Potol)', 'পটল',
    'Tender green pointed gourds with soft seeds from Mithapukur, Rangpur. Ideal for dolma, bhaja, and light curries.',
    'রংপুরের মিঠাপুকুরের কচি সবুজ পটল। ভাজি ও দোলমার জন্য দারুণ।',
    v_basket_img, array[v_basket_img], 'Rangpur', 'Uttara Hub', true, 'today', 'Harvested 5:45 AM', 'pesticide_free',
    array['Harvested Today', 'Pesticide Free'], 'BD-RP-118-PT',
    '[{"time":"05:45 AM","title":"Hand-Picked by Selina Begum","detail":"Selected for tender skin and small seeds in Mithapukur."},{"time":"08:00 AM","title":"Dispatched to Uttara Hub","detail":"Batch QR tagged and dispatched."}]'::jsonb,
    4.8, 76, true, true
  ) on conflict (slug) do update set image_url = excluded.image_url returning id into v_prod_id;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, compare_at_price_bdt, stock_qty, is_default, sort_order) values
    (v_prod_id, 'KK-PT-500', '500g Pack', '৫০০ গ্রাম প্যাক', 500, 40, 50, 90, true, 1),
    (v_prod_id, 'KK-PT-1000', '1 kg Pack', '১ কেজি প্যাক', 1000, 75, 95, 50, false, 2)
  on conflict (sku) do update set price_bdt = excluded.price_bdt;

  -- Anchor 4: Himsagar Mango
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, gallery_urls, origin_district, origin_hub, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, trace_log, rating_avg, rating_count, is_featured, basket_eligible)
  values (
    'himsagar-mango', c_fruit, f_rafiq,
    'Himsagar Mango', 'হিমসাগর আম',
    'Tree-ripened GI-region Himsagar mangoes from Bagha, Rajshahi. Zero carbide, zero formalin, naturally sweet aroma.',
    'রাজশাহীর বাঘার গাছপাকা খাঁটি হিমসাগর আম। কোনো ফরমালিন বা কার্বাইড ছাড়াই প্রাকৃতিকভাবে পাকা।',
    v_mango_img, array[v_mango_img], 'Rajshahi', 'Tejgaon Hub', true, 'today', 'Tree-Picked 6:00 AM', 'gap_certified',
    array['GI Tagged Region', 'Naturally Ripened'], 'BD-RJ-301-HM',
    '[{"time":"06:00 AM","title":"Orchard Picked","detail":"Brix-tested at 19% sweetness in Bagha Orchard."},{"time":"08:30 AM","title":"Straw-Cushioned Crates","detail":"Packed in breathable mango crates for Dhaka."}]'::jsonb,
    5.0, 215, true, false
  ) on conflict (slug) do update set image_url = excluded.image_url returning id into v_prod_id;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, compare_at_price_bdt, stock_qty, is_default, sort_order) values
    (v_prod_id, 'KK-HM-1000', '1 kg Box', '১ কেজি বক্স', 1000, 130, 145, 110, true, 1),
    (v_prod_id, 'KK-HM-3000', '3 kg Family Crate', '৩ কেজি ফ্যামিলি ক্যারেট', 3000, 370, 420, 45, false, 2)
  on conflict (sku) do update set price_bdt = excluded.price_bdt;

  -- Anchor 5: Tender Bottle Gourd (Lau)
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, gallery_urls, origin_district, origin_hub, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, trace_log, rating_avg, rating_count, is_featured, basket_eligible)
  values (
    'tender-bottle-gourd-lau', c_veg, f_selina,
    'Tender Bottle Gourd (Lau)', 'কচি লাউ',
    'Freshly cut tender green bottle gourd from Mithapukur trellis vines. Sweet, hydrating, and soft-seeded.',
    'মিঠাপুকুরের মাচা থেকে কাটা কচি সবুজ লাউ। রান্নার পর নরম ও সুস্বাদু।',
    v_basket_img, array[v_basket_img], 'Rangpur', 'Uttara Hub', true, 'today', 'Harvested 5:30 AM', 'organic',
    array['Harvested Today', 'Verified Organic'], 'BD-RP-122-LG',
    '[{"time":"05:30 AM","title":"Vine Harvest","detail":"Nail-tested for tenderness before cutting."}]'::jsonb,
    4.9, 88, true, true
  ) on conflict (slug) do update set image_url = excluded.image_url returning id into v_prod_id;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, compare_at_price_bdt, stock_qty, is_default, sort_order) values
    (v_prod_id, 'KK-LG-1PC', 'Per Piece (approx 1.1 kg)', 'প্রতি পিস (প্রায় ১.১ কেজি)', 1100, 55, 70, 65, true, 1)
  on conflict (sku) do update set price_bdt = excluded.price_bdt;

  -- Anchor 6: Kalo Jeera Aromatic Rice
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, gallery_urls, origin_district, origin_hub, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, trace_log, rating_avg, rating_count, is_featured, basket_eligible)
  values (
    'kalo-jeera-aromatic-rice', c_rice, f_mizan,
    'Kalo Jeera Aromatic Rice', 'কালোজিরা সুগন্ধি চাল',
    'Small-batch Dinajpur heirloom Kalo Jeera polao rice, freshly milled weekly for unmistakable aroma.',
    'দিনাজপুরের ঐতিহ্যবাহী কালোজিরা সুগন্ধি পোলাওয়ের চাল। সাপ্তাহিক তাজা ভাঙানো।',
    v_grains_img, array[v_grains_img], 'Dinajpur', 'Tejgaon Hub', false, '12h', 'Milled This Week', 'conventional_verified',
    array['GI Tagged Region', 'Freshly Milled'], 'BD-DJ-502-KJ',
    '[{"time":"Yesterday","title":"Stone-Milled in Chirirbandar","detail":"Single-origin paddy milled without polishing wax."}]'::jsonb,
    4.9, 142, true, false
  ) on conflict (slug) do update set image_url = excluded.image_url returning id into v_prod_id;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, compare_at_price_bdt, stock_qty, is_default, sort_order) values
    (v_prod_id, 'KK-KJ-1000', '1 kg Pack', '১ কেজি প্যাক', 1000, 145, 160, 120, true, 1),
    (v_prod_id, 'KK-KJ-5000', '5 kg Cotton Sack', '৫ কেজি সুতির বস্তা', 5000, 700, 780, 35, false, 2)
  on conflict (sku) do update set price_bdt = excluded.price_bdt;

  -- Anchor 7: Cold-Pressed Mustard Oil
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, gallery_urls, origin_district, origin_hub, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, trace_log, rating_avg, rating_count, is_featured, basket_eligible)
  values (
    'cold-pressed-mustard-oil', c_oil, f_pabna,
    'Cold-Pressed Mustard Oil', 'কাঠের ঘানি সরিষার তেল',
    'Unrefined first-press mustard oil from Pabna Cooperative wooden ghani mills. Sharp natural aroma, zero chemical solvents.',
    'পাবনা সমবায়ের কাঠের ঘানিতে ভাঙানো খাঁটি সরিষার তেল। প্রাকৃতিক ঝাঁজ ও স্বাদ অটুট।',
    v_grains_img, array[v_grains_img], 'Pabna', 'Tejgaon Hub', false, '12h', 'Pressed 48h Ago', 'organic',
    array['Wood Ghani Pressed', 'Verified Organic'], 'BD-PB-210-MO',
    '[{"time":"48h Ago","title":"Wooden Ghani Cold Press","detail":"Slow-pressed below 40°C in Ishwardi."}]'::jsonb,
    5.0, 164, true, false
  ) on conflict (slug) do update set image_url = excluded.image_url returning id into v_prod_id;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, compare_at_price_bdt, stock_qty, is_default, sort_order) values
    (v_prod_id, 'KK-MO-500', '500ml Glass Bottle', '৫০০ মি.লি. কাঁচের বোতল', 500, 170, 190, 95, true, 1),
    (v_prod_id, 'KK-MO-1000', '1 Litre Bottle', '১ লিটার বোতল', 1000, 330, 370, 50, false, 2)
  on conflict (sku) do update set price_bdt = excluded.price_bdt;

  -- Anchor 8: Bogura Red Potatoes
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, gallery_urls, origin_district, origin_hub, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, trace_log, rating_avg, rating_count, is_featured, basket_eligible)
  values (
    'bogura-red-potatoes', c_veg, f_karim,
    'Bogura Red Potatoes (Lal Alu)', 'বগুড়ার লাল আলু',
    'Firm, flavourful Bogura red-skin potatoes with creamy texture that holds shape in curries and bharta.',
    'বগুড়ার সুস্বাদু লাল আলু। ভর্তা ও তরকারির জন্য সেরা।',
    v_basket_img, array[v_basket_img], 'Bogura', 'Tejgaon Hub', true, 'today', 'Dug 6:00 AM', 'pesticide_free',
    array['GI Tagged Region', 'Pesticide Free'], 'BD-BG-415-AL',
    '[{"time":"06:00 AM","title":"Freshly Dug & Brushed","detail":"Cleaned of dry soil without harsh washing."}]'::jsonb,
    4.8, 112, true, true
  ) on conflict (slug) do update set image_url = excluded.image_url returning id into v_prod_id;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, compare_at_price_bdt, stock_qty, is_default, sort_order) values
    (v_prod_id, 'KK-AL-2000', '2 kg Pack', '২ কেজি প্যাক', 2000, 80, 95, 140, true, 1),
    (v_prod_id, 'KK-AL-5000', '5 kg Family Bag', '৫ কেজি ব্যাগ', 5000, 190, 225, 60, false, 2)
  on conflict (sku) do update set price_bdt = excluded.price_bdt;

  -- Anchor 9: Pabna Country Onions
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, gallery_urls, origin_district, origin_hub, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, trace_log, rating_avg, rating_count, is_featured, basket_eligible)
  values (
    'pabna-country-onions', c_veg, f_pabna,
    'Pabna Country Onions (Deshi Peyaj)', 'পাবনার দেশি পেঁয়াজ',
    'Aromatic pink-skinned Pabna country onions sun-cured on bamboo racks for rich gravy base.',
    'পাবনার ঝাঁঝালো ও সুগন্ধি দেশি পেঁয়াজ। রোদে শুকানো খাঁটি মানের।',
    v_basket_img, array[v_basket_img], 'Pabna', 'Tejgaon Hub', false, '12h', 'Sun-Cured Batch', 'conventional_verified',
    array['Zero Middlemen'], 'BD-PB-219-PY',
    '[{"time":"Yesterday","title":"Graded at Pabna Hub","detail":"Sorted into dry mesh sacks."}]'::jsonb,
    4.8, 105, false, true
  ) on conflict (slug) do update set image_url = excluded.image_url returning id into v_prod_id;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, compare_at_price_bdt, stock_qty, is_default, sort_order) values
    (v_prod_id, 'KK-PY-1500', '1.5 kg Pack', '১.৫ কেজি প্যাক', 1500, 110, 130, 100, true, 1),
    (v_prod_id, 'KK-PY-3000', '3 kg Pack', '৩ কেজি প্যাক', 3000, 210, 250, 55, false, 2)
  on conflict (sku) do update set price_bdt = excluded.price_bdt;

  -- Anchor 10: Green Chili & Cilantro Combo
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, gallery_urls, origin_district, origin_hub, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, trace_log, rating_avg, rating_count, is_featured, basket_eligible)
  values (
    'green-chili-cilantro-combo', c_veg, f_rahim,
    'Green Chili & Fresh Cilantro', 'কাঁচা মরিচ ও ধনেপাতা',
    'Fiery Charghat deshi green chilies paired with fragrant riverbank coriander leaves harvested together at dawn.',
    'রাজশাহীর চারঘাটের ঝাল কাঁচা মরিচ ও সুগন্ধি ধনেপাতার কম্বো প্যাক।',
    v_leafy_img, array[v_leafy_img], 'Rajshahi', 'Tejgaon Hub', true, 'today', 'Harvested 5:20 AM', 'pesticide_free',
    array['Harvested Today', 'Pesticide Free'], 'BD-RJ-308-CC',
    '[{"time":"05:20 AM","title":"Morning Harvest","detail":"Picked and bundled with chilled moisture wrap."}]'::jsonb,
    4.9, 89, false, true
  ) on conflict (slug) do update set image_url = excluded.image_url returning id into v_prod_id;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, compare_at_price_bdt, stock_qty, is_default, sort_order) values
    (v_prod_id, 'KK-CC-350', '350g Kitchen Pack', '৩৫০ গ্রাম প্যাক', 350, 45, 55, 110, true, 1)
  on conflict (sku) do update set price_bdt = excluded.price_bdt;

  -- Anchor 11: Standard 4-Person Weekly Basket
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, gallery_urls, origin_district, origin_hub, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, trace_log, rating_avg, rating_count, is_featured, basket_eligible)
  values (
    'standard-weekly-basket', c_basket, f_karim,
    'Standard 4-Person Weekly Basket', 'সাপ্তাহিক পারিবারিক সবজি ঝুড়ি',
    'Complete 5.4 kg weekly harvest basket: Bogura Red Potatoes (2kg), Pabna Onions (1.5kg), Deshi Tomato (1kg), Tender Bottle Gourd (1pc), and Green Chili + Cilantro (350g).',
    '৪ জনের পরিবারের জন্য সম্পূর্ণ ৫.৪ কেজি সাপ্তাহিক ফসলের ঝুড়ি: লাল আলু, দেশি পেঁয়াজ, টমেটো, কচি লাউ এবং কাঁচা মরিচ ও ধনেপাতা।',
    v_basket_img, array[v_basket_img, v_tomato_img], 'Bogura', 'Tejgaon Hub', true, 'today', 'Packed 6:30 AM', 'organic',
    array['15% Basket Savings', 'Harvested Today'], 'BD-KK-001-WB',
    '[{"time":"06:30 AM","title":"Multi-Farm Consolidation","detail":"Assembled from Bogura, Pabna, Rangpur, and Rajshahi morning dispatches."}]'::jsonb,
    4.9, 184, true, false
  ) on conflict (slug) do update set image_url = excluded.image_url returning id into v_prod_id;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, compare_at_price_bdt, stock_qty, is_default, sort_order) values
    (v_prod_id, 'KK-WB-5400', '5.4 kg Weekly Basket', '৫.৪ কেজি সাপ্তাহিক ঝুড়ি', 5400, 290, 340, 40, true, 1)
  on conflict (sku) do update set price_bdt = excluded.price_bdt;

  -- Additional 31 products to exceed 40 across all 10 categories
  -- Fresh Vegetables
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, origin_district, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, rating_avg, rating_count, is_featured, basket_eligible)
  values
    ('purple-brinjal-begun', c_veg, f_rahim, 'Long Purple Brinjal (Begun)', 'লম্বা বেগুন', 'Glossy, tender deshi brinjals perfect for begun bhaja or bhorta.', 'ভাজি ও ভর্তার জন্য তাজা চকচকে লম্বা বেগুন।', v_basket_img, 'Rajshahi', true, 'today', 'Harvested 5:40 AM', 'pesticide_free', array['Harvested Today'], 'BD-RJ-312-BG', 4.7, 52, false, true),
    ('tender-okra-dherosh', c_veg, f_selina, 'Tender Okra (Dherosh)', 'কচি ঢেঁড়স', 'Snap-fresh organic okra pods picked young before fiber develops.', 'নরম ও কচি ঢেঁড়স, আঁশ ছাড়াই ভোরের তোলা।', v_leafy_img, 'Rangpur', true, 'today', 'Harvested 5:10 AM', 'organic', array['Harvested Today', 'Verified Organic'], 'BD-RP-129-OK', 4.8, 63, false, true),
    ('snow-cauliflower-fulkopi', c_veg, f_karim, 'Farm Cauliflower (Fulkopi)', 'তাজা ফুলকপি', 'Tight ivory florets grown with composted cow-dung manure.', 'জৈব সারে চাষ করা সাদা ও আঁটসাঁট ফুলকপি।', v_basket_img, 'Bogura', true, 'today', 'Harvested 5:50 AM', 'pesticide_free', array['Harvested Today'], 'BD-BG-421-FK', 4.8, 71, false, true),
    ('deshi-cucumber-shosha', c_veg, f_rahim, 'Crisp Deshi Cucumber (Shosha)', 'দেশি শসা', 'Cool, crisp riverbank cucumbers with delicate green skin.', 'পদ্মা চরের কচি ও রসালো দেশি শসা।', v_basket_img, 'Rajshahi', true, 'today', 'Harvested 6:00 AM', 'organic', array['Harvested Today'], 'BD-RJ-319-SH', 4.7, 44, false, true),
    ('bitter-gourd-korola', c_veg, f_selina, 'Deshi Bitter Gourd (Korola)', 'দেশি করলা', 'Small ridged deshi korola rich in flavor, crisp when pan-fried.', 'দেশি ছোট করলা, ভাজির জন্য দারুণ।', v_basket_img, 'Rangpur', true, 'today', 'Harvested 5:35 AM', 'pesticide_free', array['Pesticide Free'], 'BD-RP-133-KR', 4.6, 38, false, true),
    ('sweet-pumpkin-mishti-kumra', c_veg, f_pabna, 'Sweet Pumpkin Wedge (Mishti Kumra)', 'মিষ্টি কুমড়া', 'Deep-orange flesh sweet pumpkin harvested ripe on the vine.', 'গাছে পাকা মিষ্টি ও কমলা রঙের মিষ্টি কুমড়া।', v_basket_img, 'Pabna', false, '12h', 'Harvested Yesterday', 'conventional_verified', array['Zero Middlemen'], 'BD-PB-224-MK', 4.8, 47, false, true)
  on conflict (slug) do nothing;

  -- Variants for the 6 vegetables above
  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, compare_at_price_bdt, stock_qty, is_default, sort_order)
  select id, 'KK-VEG-' || upper(left(slug, 4)), '500g Pack', '৫০০ গ্রাম প্যাক', 500,
    case slug
      when 'purple-brinjal-begun' then 45
      when 'tender-okra-dherosh' then 42
      when 'snow-cauliflower-fulkopi' then 50
      when 'deshi-cucumber-shosha' then 38
      when 'bitter-gourd-korola' then 55
      else 40
    end,
    null, 65, true, 1
  from public.products
  where slug in ('purple-brinjal-begun','tender-okra-dherosh','snow-cauliflower-fulkopi','deshi-cucumber-shosha','bitter-gourd-korola','sweet-pumpkin-mishti-kumra')
  on conflict (sku) do nothing;

  -- Leafy Greens
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, origin_district, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, rating_avg, rating_count, basket_eligible)
  values
    ('water-spinach-kolmi-shak', c_leafy, f_selina, 'Water Spinach (Kolmi Shak)', 'কলমি শাক', 'Crisp hollow-stemmed kolmi shak grown in clean irrigated beds.', 'পরিষ্কার সেচের জমিতে চাষ করা টাটকা কলমি শাক।', v_leafy_img, 'Rangpur', true, 'today', 'Harvested 5:05 AM', 'organic', array['Harvested Today', 'Verified Organic'], 'BD-RP-140-KS', 4.9, 66, true),
    ('malabar-spinach-pui-shak', c_leafy, f_karim, 'Malabar Spinach (Pui Shak)', 'পুঁই শাক', 'Thick succulent stems and broad green leaves harvested at sunrise.', 'কচি ডগা ও সবুজ পাতার টাটকা পুঁই শাক।', v_leafy_img, 'Bogura', true, 'today', 'Harvested 5:20 AM', 'organic', array['Harvested Today'], 'BD-BG-428-PS', 4.8, 54, true),
    ('green-amaranth-data-shak', c_leafy, f_selina, 'Green Amaranth (Data Shak)', 'ডাঁটা শাক', 'Tender green amaranth bundles with edible soft stems.', 'নরম ডাঁটা ও পাতার তাজা ডাঁটা শাক।', v_leafy_img, 'Rangpur', true, 'today', 'Harvested 5:15 AM', 'pesticide_free', array['Pesticide Free'], 'BD-RP-145-DS', 4.7, 39, true),
    ('bottle-gourd-leaves-lau-shak', c_leafy, f_karim, 'Bottle Gourd Leaves (Lau Shak)', 'লাউ শাক', 'Velvety young gourd vine tips ideal for shutki or lentil stir-fry.', 'কচি ডগাসহ সতেজ লাউ শাকের আঁটি।', v_leafy_img, 'Bogura', true, 'today', 'Harvested 5:30 AM', 'organic', array['Harvested Today'], 'BD-BG-430-LS', 4.9, 48, true)
  on conflict (slug) do nothing;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, stock_qty, is_default, sort_order)
  select id, 'KK-LF-' || upper(left(slug, 4)), '500g Bundle', '৫০০ গ্রাম আঁটি', 500,
    case slug when 'water-spinach-kolmi-shak' then 30 when 'malabar-spinach-pui-shak' then 38 when 'green-amaranth-data-shak' then 32 else 36 end,
    55, true, 1
  from public.products
  where slug in ('water-spinach-kolmi-shak','malabar-spinach-pui-shak','green-amaranth-data-shak','bottle-gourd-leaves-lau-shak')
  on conflict (sku) do nothing;

  -- Seasonal Fruits
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, origin_district, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, rating_avg, rating_count)
  values
    ('amrapali-mango', c_fruit, f_rafiq, 'Amrapali Mango', 'আম্রপালি আম', 'Deep-orange sweet Amrapali mangoes with rich honeyed flesh.', 'বাঘার মিষ্টি ও রসালো আম্রপালি আম।', v_mango_img, 'Rajshahi', true, 'today', 'Tree-Picked 6:15 AM', 'gap_certified', array['Naturally Ripened'], 'BD-RJ-321-AM', 4.9, 134),
    ('kazi-peyara-guava', c_fruit, f_rahim, 'Crunchy Deshi Guava (Peyara)', 'কাজি পেয়ারা', 'Crisp, aromatic green guavas picked fresh from Charghat orchards.', 'চারঘাটের কচকচে ও সুগন্ধি দেশি পেয়ারা।', v_mango_img, 'Rajshahi', true, 'today', 'Harvested 6:00 AM', 'pesticide_free', array['Harvested Today'], 'BD-RJ-326-PY', 4.8, 67),
    ('sagar-banana-kola', c_fruit, f_pabna, 'Sagar Banana Bunch', 'সাগর কলা', 'Naturally ripened yellow Sagar bananas without chemical ripening.', 'কার্বাইড ছাড়া স্বাভাবিকভাবে পাকা সাগর কলা।', v_mango_img, 'Pabna', true, 'today', 'Cut 6:20 AM', 'organic', array['Naturally Ripened'], 'BD-PB-231-KL', 4.7, 79),
    ('dinajpur-bedana-lichi', c_fruit, f_mizan, 'Dinajpur Bedana Litchi', 'দিনাজপুরের বেদানা লিচু', 'Plump, juicy Bedana litchis with tiny seeds and floral sweetness.', 'দিনাজপুরের বিখ্যাত ছোট বীজ ও রসালো বেদানা লিচু।', v_mango_img, 'Dinajpur', true, 'today', 'Picked 5:00 AM', 'gap_certified', array['GI Tagged Region'], 'BD-DJ-510-LC', 5.0, 152),
    ('green-papaya-pepe', c_fruit, f_selina, 'Ripe & Raw Papaya (Pepe)', 'টাটকা পেঁপে', 'Versatile sweet papaya from Rangpur homestead gardens.', 'রংপুরের বাগানের টাটকা ও মিষ্টি পেঁপে।', v_mango_img, 'Rangpur', false, '12h', 'Harvested Yesterday', 'organic', array['Verified Organic'], 'BD-RP-152-PP', 4.7, 41)
  on conflict (slug) do nothing;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, stock_qty, is_default, sort_order)
  select id, 'KK-FR-' || upper(left(slug, 4)), '1 kg Pack', '১ কেজি প্যাক', 1000,
    case slug when 'amrapali-mango' then 125 when 'kazi-peyara-guava' then 85 when 'sagar-banana-kola' then 90 when 'dinajpur-bedana-lichi' then 240 else 75 end,
    70, true, 1
  from public.products
  where slug in ('amrapali-mango','kazi-peyara-guava','sagar-banana-kola','dinajpur-bedana-lichi','green-papaya-pepe')
  on conflict (sku) do nothing;

  -- Rice & Grains
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, origin_district, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, rating_avg, rating_count)
  values
    ('chinigura-polao-rice', c_rice, f_mizan, 'Dinajpur Chinigura Rice', 'চিনিগুঁড়া পোলাও চাল', 'Pearl-tiny fragrant Chinigura rice ideal for biryani and payesh.', 'বিরিয়ানি ও পায়েসের জন্য সুগন্ধি চিনিগুঁড়া চাল।', v_grains_img, 'Dinajpur', false, '12h', 'Milled This Week', 'conventional_verified', array['GI Tagged Region'], 'BD-DJ-514-CG', 4.9, 98),
    ('miniket-daily-rice', c_rice, f_mizan, 'Unpolished Miniket Rice', 'অপলিশড মিনিকেট চাল', 'Natural slender daily table rice without chemical whitening.', 'কোনো কেমিক্যাল পালিশ ছাড়াই প্রাকৃতিক মিনিকেট চাল।', v_grains_img, 'Dinajpur', false, '12h', 'Milled This Week', 'pesticide_free', array['Unpolished'], 'BD-DJ-518-MK', 4.8, 115),
    ('brown-red-atop-rice', c_rice, f_mizan, 'Heritage Red Atop Rice (Lal Chal)', 'লাল আতপ চাল', 'Nutrient-dense unmilled bran red rice rich in fiber and iron.', 'আঁশ ও খনিজ সমৃদ্ধ ঐতিহ্যবাহী লাল আতপ চাল।', v_grains_img, 'Dinajpur', false, '12h', 'Small Batch Mill', 'organic', array['Verified Organic'], 'BD-DJ-522-LC', 4.9, 62),
    ('kataribhog-rice', c_rice, f_mizan, 'Kataribhog Heritage Rice', 'কাটারিভোগ চাল', 'Long-grain GI heritage aromatic rice from Dinajpur.', 'দিনাজপুরের বিখ্যাত সুগন্ধি কাটারিভোগ চাল।', v_grains_img, 'Dinajpur', false, '12h', 'Milled This Week', 'gap_certified', array['GI Tagged Region'], 'BD-DJ-525-KB', 4.9, 77)
  on conflict (slug) do nothing;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, stock_qty, is_default, sort_order)
  select id, 'KK-RC-' || upper(left(slug, 4)), '2 kg Pack', '২ কেজি প্যাক', 2000,
    case slug when 'chinigura-polao-rice' then 280 when 'miniket-daily-rice' then 165 when 'brown-red-atop-rice' then 210 else 260 end,
    80, true, 1
  from public.products
  where slug in ('chinigura-polao-rice','miniket-daily-rice','brown-red-atop-rice','kataribhog-rice')
  on conflict (sku) do nothing;

  -- Pulses & Lentils
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, origin_district, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, rating_avg, rating_count)
  values
    ('deshi-masoor-dal', c_pulse, f_pabna, 'Deshi Red Lentils (Masoor Dal)', 'দেশি মসুর ডাল', 'Small-seeded Pabna red lentils that cook creamy and fast.', 'পাবনার ছোট দানার দেশি মসুর ডাল, দ্রুত সিদ্ধ হয়।', v_grains_img, 'Pabna', false, '12h', 'Sun-Dried Batch', 'pesticide_free', array['Zero Polish'], 'BD-PB-240-MD', 4.9, 108),
    ('bhaja-moong-dal', c_pulse, f_pabna, 'Golden Mung Dal (Moong Dal)', 'সোনালী মুগ ডাল', 'Aromatic golden mung lentils ideal for khichuri and dal.', 'খিচুড়ি ও ভুনা ডালের জন্য সুগন্ধি সোনালী মুগ ডাল।', v_grains_img, 'Pabna', false, '12h', 'Sun-Dried Batch', 'conventional_verified', array['Single Origin'], 'BD-PB-244-MG', 4.8, 74),
    ('deshi-chola-chickpeas', c_pulse, f_pabna, 'Deshi Chickpeas (Chola Boot)', 'দেশি ছোলা বুট', 'Whole brown deshi chickpeas grown in Pabna char lands.', 'চরের জমিতে চাষ করা পুষ্টিকর দেশি ছোলা।', v_grains_img, 'Pabna', false, '12h', 'Cleaned & Sorted', 'pesticide_free', array['Pesticide Free'], 'BD-PB-248-CB', 4.8, 49),
    ('kheshari-dal', c_pulse, f_pabna, 'Village Kheshari Dal', 'খেসারি ডাল', 'Traditional village kheshari dal for crispy piaju and daily dal.', 'পেঁয়াজু ও দৈনন্দিন ডালের জন্য খাঁটি খেসারি ডাল।', v_grains_img, 'Pabna', false, '12h', 'Cleaned & Sorted', 'conventional_verified', array['Zero Middlemen'], 'BD-PB-252-KD', 4.7, 36)
  on conflict (slug) do nothing;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, stock_qty, is_default, sort_order)
  select id, 'KK-PL-' || upper(left(slug, 4)), '1 kg Pack', '১ কেজি প্যাক', 1000,
    case slug when 'deshi-masoor-dal' then 145 when 'bhaja-moong-dal' then 160 when 'deshi-chola-chickpeas' then 120 else 105 end,
    90, true, 1
  from public.products
  where slug in ('deshi-masoor-dal','bhaja-moong-dal','deshi-chola-chickpeas','kheshari-dal')
  on conflict (sku) do nothing;

  -- Natural Spices
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, origin_district, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, rating_avg, rating_count)
  values
    ('pabna-turmeric-powder', c_spice, f_pabna, 'Pure Turmeric Powder (Holud)', 'খাঁটি হলুদ গুঁড়া', 'High-curcumin sun-dried turmeric roots stone-ground with zero added starch.', 'কোনো ভেজাল বা রং ছাড়াই রোদে শুকানো হলুদের গুঁড়া।', v_grains_img, 'Pabna', false, '12h', 'Stone Ground', 'organic', array['Lab Tested', 'Verified Organic'], 'BD-PB-260-HL', 5.0, 118),
    ('bogura-red-chili-powder', c_spice, f_karim, 'Bogura Red Chili Powder (Morich)', 'বগুড়ার লাল মরিচ গুঁড়া', 'Vibrant sun-dried Bogura chilies ground without artificial color.', 'কৃত্রিম রং ছাড়া বগুড়ার ঝাল লাল মরিচ গুঁড়া।', v_grains_img, 'Bogura', false, '12h', 'Stone Ground', 'pesticide_free', array['Zero Artificial Color'], 'BD-BG-442-MR', 4.9, 93),
    ('whole-cumin-jeera', c_spice, f_pabna, 'Whole Aromatic Cumin (Jeera)', 'আস্ত জিরা', 'Clean, oil-rich whole cumin seeds sealed fresh.', 'পরিষ্কার ও সুগন্ধি আস্ত জিরা।', v_grains_img, 'Pabna', false, '12h', 'Cleaned Batch', 'conventional_verified', array['High Aroma'], 'BD-PB-265-JR', 4.8, 61),
    ('deshi-ginger-ada', c_spice, f_karim, 'Fresh Deshi Ginger (Ada)', 'দেশি আদা', 'Fibrous, intensely aromatic hill-slope deshi ginger.', 'তীব্র ঝাঁজ ও সুগন্ধযুক্ত দেশি আদা।', v_grains_img, 'Bogura', true, 'today', 'Dug 6:10 AM', 'organic', array['Harvested Today'], 'BD-BG-448-AD', 4.8, 72)
  on conflict (slug) do nothing;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, stock_qty, is_default, sort_order)
  select id, 'KK-SP-' || upper(left(slug, 4)), '250g Pack', '২৫০ গ্রাম প্যাক', 250,
    case slug when 'pabna-turmeric-powder' then 95 when 'bogura-red-chili-powder' then 115 when 'whole-cumin-jeera' then 240 else 80 end,
    85, true, 1
  from public.products
  where slug in ('pabna-turmeric-powder','bogura-red-chili-powder','whole-cumin-jeera','deshi-ginger-ada')
  on conflict (sku) do nothing;

  -- Mustard Oil, Honey & Ghee
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, origin_district, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, rating_avg, rating_count)
  values
    ('sundarban-raw-honey', c_oil, f_pabna, 'Raw Multiflora Forest Honey (Modhu)', 'খাঁটি প্রাকৃতিক মধু', 'Unheated, unfiltered raw honey bottled in glass jars.', 'অপরিশোধিত ও খাঁটি প্রাকৃতিক মধু।', v_grains_img, 'Pabna', false, '12h', 'Raw Harvest', 'organic', array['Lab Tested Purity'], 'BD-PB-270-MH', 5.0, 146),
    ('pure-cow-ghee', c_oil, f_pabna, 'Cultured Cow Ghee (Gawa Ghee)', 'খাঁটি গাওয়া ঘি', 'Slow-simmered bilona cultured butter ghee from grass-fed Sirajganj-Pabna cattle.', 'সিরাজগঞ্জ-পাবনার খামারের খাঁটি দানাদার গাওয়া ঘি।', v_grains_img, 'Pabna', false, '12h', 'Slow Simmered', 'organic', array['100% Pure Dairy'], 'BD-PB-275-GH', 4.9, 131),
    ('black-seed-kalojira-oil', c_oil, f_pabna, 'Cold-Pressed Black Seed Oil', 'কালোজিরার তেল', 'First-press kalojira oil pressed in small batches.', 'প্রথম চাপে ভাঙানো খাঁটি কালোজিরার তেল।', v_grains_img, 'Pabna', false, '12h', 'Cold Pressed', 'organic', array['Verified Organic'], 'BD-PB-279-KO', 4.9, 58)
  on conflict (slug) do nothing;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, stock_qty, is_default, sort_order)
  select id, 'KK-OL-' || upper(left(slug, 4)), '250g / 250ml Jar', '২৫০ গ্রাম/মি.লি. জার', 250,
    case slug when 'sundarban-raw-honey' then 320 when 'pure-cow-ghee' then 420 else 290 end,
    50, true, 1
  from public.products
  where slug in ('sundarban-raw-honey','pure-cow-ghee','black-seed-kalojira-oil')
  on conflict (sku) do nothing;

  -- Verified Organic
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, origin_district, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, rating_avg, rating_count, basket_eligible)
  values
    ('organic-baby-carrots', c_org, f_karim, 'Organic Sweet Carrots (Gajor)', 'অর্গানিক গাজর', 'Crisp compost-grown carrots pulled fresh at dawn.', 'জৈব সারে চাষ করা মিষ্টি ও কচকচে গাজর।', v_basket_img, 'Bogura', true, 'today', 'Pulled 5:45 AM', 'organic', array['Verified Organic', 'Harvested Today'], 'BD-BG-460-GJ', 4.9, 64, true),
    ('organic-french-beans', c_org, f_selina, 'Organic French Beans (Borboti)', 'অর্গানিক বরবটি', 'Slender stringless green beans grown without synthetic sprays.', 'কীটনাশকমুক্ত কচি সবুজ বরবটি।', v_leafy_img, 'Rangpur', true, 'today', 'Picked 5:25 AM', 'organic', array['Verified Organic'], 'BD-RP-164-FB', 4.8, 53, true),
    ('organic-lemon-kagozi', c_org, f_rahim, 'Aromatic Kagozi Lemon (Lebu)', 'কাগজি লেবু', 'Thin-skinned, ultra-juicy Kagozi lemons packed with citrus fragrance.', 'পাতলা খোসার রসালো ও সুগন্ধি কাগজি লেবু।', v_mango_img, 'Rajshahi', true, 'today', 'Picked 6:00 AM', 'organic', array['Verified Organic'], 'BD-RJ-338-LB', 4.9, 97, true)
  on conflict (slug) do nothing;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, stock_qty, is_default, sort_order)
  select id, 'KK-OR-' || upper(left(slug, 8)), '500g Pack', '৫০০ গ্রাম প্যাক', 500,
    case slug when 'organic-baby-carrots' then 60 when 'organic-french-beans' then 55 else 50 end,
    75, true, 1
  from public.products
  where slug in ('organic-baby-carrots','organic-french-beans','organic-lemon-kagozi')
  on conflict (sku) do nothing;

  -- Weekly Baskets (additional curated basket)
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, origin_district, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, rating_avg, rating_count)
  values
    ('couples-green-basket', c_basket, f_selina, '2-Person Fresh Greens & Veg Basket', '২ জনের সাপ্তাহিক তাজা ঝুড়ি', 'Curated 3 kg weekly box of leafy greens, deshi tomatoes, bottle gourd, and potatoes for smaller households.', 'ছোট পরিবারের জন্য ৩ কেজির সাপ্তাহিক শাক-সবজির ঝুড়ি।', v_basket_img, 'Rangpur', true, 'today', 'Packed 6:40 AM', 'organic', array['Value Basket', 'Harvested Today'], 'BD-KK-002-CB', 4.9, 68),
    ('fruit-lovers-seasonal-box', c_basket, f_rafiq, 'Seasonal Rajshahi Fruit Box', 'মৌসুমি ফলের ঝুড়ি', 'Tree-ripened Himsagar mangoes, crunchy guavas, and Sagar bananas packed in one giftable crate.', 'গাছপাকা হিমসাগর আম, পেয়ারা ও সাগর কলার বিশেষ ফলের ঝুড়ি।', v_mango_img, 'Rajshahi', true, 'today', 'Packed 6:30 AM', 'gap_certified', array['Naturally Ripened'], 'BD-KK-003-FB', 5.0, 82)
  on conflict (slug) do nothing;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, compare_at_price_bdt, stock_qty, is_default, sort_order)
  select id, 'KK-BK-' || upper(left(slug, 4)),
    case slug when 'couples-green-basket' then '3 kg Basket' else '3.5 kg Fruit Box' end,
    case slug when 'couples-green-basket' then '৩ কেজি ঝুড়ি' else '৩.৫ কেজি ফলের বক্স' end,
    3000,
    case slug when 'couples-green-basket' then 185 else 340 end,
    case slug when 'couples-green-basket' then 215 else 390 end,
    35, true, 1
  from public.products
  where slug in ('couples-green-basket','fruit-lovers-seasonal-box')
  on conflict (sku) do nothing;

  -- Ready-to-Cook
  insert into public.products (slug, category_id, farmer_id, name_en, name_bn, description_en, description_bn, image_url, origin_district, harvested_today, harvest_window, harvest_label, farming_practice, badges, trace_id, rating_avg, rating_count)
  values
    ('precut-lau-chingri-mix', c_rtc, f_selina, 'Washed & Cubed Bottle Gourd Pack', 'কাটা ও ধোয়া কচি লাউ', 'Hygienically peeled, cubed tender bottle gourd ready for the pot.', 'পরিষ্কার পানিতে ধোয়া ও কুচানো কচি লাউ, সরাসরি রান্নার জন্য প্রস্তুত।', v_basket_img, 'Rangpur', true, 'today', 'Prepped 7:00 AM', 'organic', array['Washed & Ready', 'Harvested Today'], 'BD-KK-010-RL', 4.8, 57),
    ('washed-lal-shak-chopped', c_rtc, f_karim, 'Triple-Washed Chopped Red Spinach', 'ধোয়া ও কাটা লাল শাক', 'Sorted, triple-washed, and roughly chopped Bogura red spinach.', 'বাছাই ও তিনবার ধোয়া কাটা লাল শাক।', v_leafy_img, 'Bogura', true, 'today', 'Prepped 7:15 AM', 'organic', array['Washed & Ready'], 'BD-KK-011-RS', 4.9, 64),
    ('khichuri-veg-medley', c_rtc, f_karim, 'Rainy-Day Khichuri Veg Medley', 'খিচুড়ির কাটা সবজি প্যাক', 'Freshly cubed potatoes, sweet pumpkin, carrots, and cauliflower ready for khichuri.', 'আলু, মিষ্টি কুমড়া, গাজর ও ফুলকপির প্রস্তুত খিচুড়ি সবজি প্যাক।', v_basket_img, 'Bogura', true, 'today', 'Prepped 7:20 AM', 'pesticide_free', array['Washed & Ready'], 'BD-KK-012-KV', 4.9, 73)
  on conflict (slug) do nothing;

  insert into public.product_variants (product_id, sku, label_en, label_bn, unit_weight_grams, price_bdt, stock_qty, is_default, sort_order)
  select id, 'KK-RT-' || upper(left(slug, 6)), '500g Ready Pack', '৫০০ গ্রাম রেডি প্যাক', 500,
    case slug when 'precut-lau-chingri-mix' then 70 when 'washed-lal-shak-chopped' then 55 else 85 end,
    45, true, 1
  from public.products
  where slug in ('precut-lau-chingri-mix','washed-lal-shak-chopped','khichuri-veg-medley')
  on conflict (sku) do nothing;
end $$;
