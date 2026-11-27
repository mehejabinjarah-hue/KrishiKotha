import type {
  CategoryDTO,
  FarmerDTO,
  ProductDetailDTO,
  ProductReviewDTO,
  ProductSummaryDTO,
  StandardBasketDTO,
} from '../../shared/types';

const IMG_TOMATO = '/src/assets/images/product_deshi_tomato_1795777183588.jpg';
const IMG_LEAFY = '/src/assets/images/product_leafy_greens_1795777183941.jpg';
const IMG_MANGO = '/src/assets/images/product_seasonal_mango_1795777184084.jpg';
const IMG_GRAINS = '/src/assets/images/product_grains_oil_1795777184817.jpg';
const IMG_BASKET = '/src/assets/images/product_weekly_basket_1795777184690.jpg';
const IMG_KARIM = '/src/assets/images/farmer_karim_portrait_1795777185179.jpg';
const IMG_SELINA = '/src/assets/images/farmer_selina_portrait_1795777185325.jpg';

export const DEMO_CATEGORIES: CategoryDTO[] = [
  { id: 'cat-1', slug: 'fresh-vegetables', name_en: 'Fresh Vegetables', name_bn: 'তাজা সবজি', icon: 'nutrition', sort_order: 1, image_url: IMG_TOMATO, product_count: 11 },
  { id: 'cat-2', slug: 'leafy-greens', name_en: 'Leafy Greens', name_bn: 'শাক-পাতা', icon: 'eco', sort_order: 2, image_url: IMG_LEAFY, product_count: 5 },
  { id: 'cat-3', slug: 'seasonal-fruits', name_en: 'Seasonal Fruits', name_bn: 'মৌসুমি ফল', icon: 'sunny', sort_order: 3, image_url: IMG_MANGO, product_count: 6 },
  { id: 'cat-4', slug: 'rice-grains', name_en: 'Rice & Grains', name_bn: 'চাল ও শস্য', icon: 'grain', sort_order: 4, image_url: IMG_GRAINS, product_count: 5 },
  { id: 'cat-5', slug: 'pulses-lentils', name_en: 'Pulses & Lentils', name_bn: 'ডাল ও ডালজাতীয়', icon: 'soup_kitchen', sort_order: 5, image_url: IMG_GRAINS, product_count: 4 },
  { id: 'cat-6', slug: 'natural-spices', name_en: 'Natural Spices', name_bn: 'খাঁটি মসলা', icon: 'spa', sort_order: 6, image_url: IMG_GRAINS, product_count: 4 },
  { id: 'cat-7', slug: 'oils-ghee-honey', name_en: 'Mustard Oil & Ghee', name_bn: 'তেল, মধু ও ঘি', icon: 'water_drop', sort_order: 7, image_url: IMG_GRAINS, product_count: 4 },
  { id: 'cat-8', slug: 'verified-organic', name_en: 'Verified Organic', name_bn: 'অর্গানিক পণ্য', icon: 'verified', sort_order: 8, image_url: IMG_LEAFY, product_count: 3 },
  { id: 'cat-9', slug: 'weekly-baskets', name_en: 'Weekly Baskets', name_bn: 'সাপ্তাহিক ঝুড়ি', icon: 'shopping_basket', sort_order: 9, image_url: IMG_BASKET, product_count: 3 },
  { id: 'cat-10', slug: 'ready-to-cook', name_en: 'Ready-to-Cook', name_bn: 'কাটা ও ধোয়া সবজি', icon: 'skillet', sort_order: 10, image_url: IMG_BASKET, product_count: 3 },
];

export const DEMO_FARMERS: FarmerDTO[] = [
  {
    id: 'farm-karim',
    slug: 'karim-mia',
    name_en: 'Karim Mia',
    name_bn: 'করিম মিয়া',
    district: 'Bogura',
    upazila: 'Shibganj',
    specialty: 'Organic Deshi Tomatoes & Red Spinach',
    years_farming: 18,
    acres: 5.2,
    story: 'Karim Mia leads a 14-family organic cooperative in Shibganj, Bogura. He replaced synthetic sprays with vermicompost and neem leaf extracts twelve years ago, allowing morning harvests to reach Dhaka tables before lunch.',
    quote: 'When Dhaka families taste our tomatoes at noon, they taste Shibganj soil at sunrise.',
    photo_url: IMG_KARIM,
    is_verified: true,
  },
  {
    id: 'farm-selina',
    slug: 'selina-begum',
    name_en: 'Selina Begum',
    name_bn: 'সেলিনা বেগম',
    district: 'Rangpur',
    upazila: 'Mithapukur',
    specialty: 'Pointed Gourd, Bottle Gourd & Leafy Greens',
    years_farming: 14,
    acres: 3.8,
    story: 'Selina Begum transformed her homestead plots in Mithapukur into a women-led safe-vegetable collective. Every gourd and bundle of shak is hand-inspected at dawn and tagged with a QR batch code.',
    quote: 'Fair prices mean our daughters stay in school and our soil stays chemical-free.',
    photo_url: IMG_SELINA,
    is_verified: true,
  },
  {
    id: 'farm-rahim',
    slug: 'rahim-uddin',
    name_en: 'Rahim Uddin',
    name_bn: 'রহিম উদ্দিন',
    district: 'Rajshahi',
    upazila: 'Charghat',
    specialty: 'Heirloom Tomatoes & Riverbank Vegetables',
    years_farming: 22,
    acres: 6.0,
    story: 'Farming along the Padma silt banks in Charghat, Rahim Uddin specializes in sweet, thin-skinned deshi tomatoes and crisp winter vegetables grown with natural river-silt mulch.',
    quote: 'Good soil needs patience, not shortcuts.',
    photo_url: IMG_KARIM,
    is_verified: true,
  },
  {
    id: 'farm-rafiq',
    slug: 'rafiqul-islam',
    name_en: 'Rafiqul Islam',
    name_bn: 'রফিকুল ইসলাম',
    district: 'Rajshahi',
    upazila: 'Bagha',
    specialty: 'GI-Tagged Himsagar & Amrapali Mangoes',
    years_farming: 25,
    acres: 8.5,
    story: 'Rafiqul Islam manages an ancestral mango orchard in Bagha where fruits ripen naturally on the branch without carbide or formalin, picked only after sugar-brix checks.',
    quote: 'A true Rajshahi mango never needs chemicals to turn golden.',
    photo_url: IMG_KARIM,
    is_verified: true,
  },
  {
    id: 'farm-mizan',
    slug: 'mizanur-rahman',
    name_en: 'Mizanur Rahman',
    name_bn: 'মিজানুর রহমান',
    district: 'Dinajpur',
    upazila: 'Chirirbandar',
    specialty: 'Aromatic Kalo Jeera & Chinigura Rice',
    years_farming: 16,
    acres: 7.4,
    story: 'Mizanur Rahman preserves heirloom short-grain aromatic rice varieties in Dinajpur, milling small batches weekly so natural fragrance and bran nutrients remain intact.',
    quote: 'Freshly milled Kalo Jeera fills the whole house with aroma.',
    photo_url: IMG_KARIM,
    is_verified: true,
  },
  {
    id: 'farm-pabna',
    slug: 'pabna-cooperative',
    name_en: 'Amena Khatun & Pabna Cooperative',
    name_bn: 'আমেনা খাতুন ও পাবনা সমবায়',
    district: 'Pabna',
    upazila: 'Ishwardi',
    specialty: 'Wood-Pressed Mustard Oil, Country Onions & Lentils',
    years_farming: 12,
    acres: 11.0,
    story: 'A cooperative of 28 smallholder households in Pabna pressing single-origin mustard seeds in traditional wooden ghani mills and sun-curing country onions and masoor lentils.',
    quote: 'Cold-pressed slowly in wood so the true pungency stays in every drop.',
    photo_url: IMG_SELINA,
    is_verified: true,
  },
];

const catBySlug = Object.fromEntries(DEMO_CATEGORIES.map((c) => [c.slug, c]));
const farmBySlug = Object.fromEntries(DEMO_FARMERS.map((f) => [f.slug, f]));

interface RawSeedProduct {
  id: string;
  slug: string;
  catSlug: string;
  farmerSlug: string;
  name_en: string;
  name_bn: string;
  description_en: string;
  description_bn: string;
  image_url: string;
  harvested_today: boolean;
  harvest_window: 'today' | '12h' | 'preorder';
  harvest_label: string;
  practice: 'organic' | 'pesticide_free' | 'gap_certified' | 'conventional_verified';
  badges: string[];
  trace_id: string;
  rating_avg: number;
  rating_count: number;
  is_featured: boolean;
  basket_eligible: boolean;
  variants: {
    id: string;
    sku: string;
    label_en: string;
    label_bn: string;
    grams: number;
    price: number;
    compareAt: number | null;
    stock: number;
  }[];
}

const RAW_PRODUCTS: RawSeedProduct[] = [
  {
    id: 'prod-deshi-tomato',
    slug: 'deshi-tomato',
    catSlug: 'fresh-vegetables',
    farmerSlug: 'karim-mia',
    name_en: 'Organic Deshi Tomato',
    name_bn: 'দেশি টমেটো',
    description_en: 'Sun-ripened heirloom deshi tomatoes harvested at 5:30 AM in Shibganj, Bogura. Thin-skinned, naturally tangy, and grown without synthetic pesticides.',
    description_bn: 'বগুড়ার শিবগঞ্জ থেকে ভোর ৫:৩০-এ তোলা টাটকা অর্গানিক দেশি টমেটো। পাতলা খোসা ও প্রাকৃতিক টক-মিষ্টি স্বাদ।',
    image_url: IMG_TOMATO,
    harvested_today: true,
    harvest_window: 'today',
    harvest_label: 'Harvested 5:30 AM',
    practice: 'organic',
    badges: ['Harvested Today', 'Verified Organic', 'Pesticide Free'],
    trace_id: 'BD-BG-402-TM',
    rating_avg: 4.9,
    rating_count: 128,
    is_featured: true,
    basket_eligible: true,
    variants: [
      { id: 'var-tm-500', sku: 'KK-TM-500', label_en: '500g Pack', label_bn: '৫০০ গ্রাম প্যাক', grams: 500, price: 65, compareAt: 75, stock: 85 },
      { id: 'var-tm-1000', sku: 'KK-TM-1000', label_en: '1 kg Family Pack', label_bn: '১ কেজি ফ্যামিলি প্যাক', grams: 1000, price: 120, compareAt: 130, stock: 60 },
      { id: 'var-tm-2000', sku: 'KK-TM-2000', label_en: '2 kg Crate', label_bn: '২ কেজি ঝুড়ি', grams: 2000, price: 230, compareAt: 260, stock: 25 },
    ],
  },
  {
    id: 'prod-red-spinach',
    slug: 'red-spinach-lal-shak',
    catSlug: 'leafy-greens',
    farmerSlug: 'karim-mia',
    name_en: 'Red Spinach (Lal Shak)',
    name_bn: 'লাল শাক',
    description_en: 'Crisp, tender red amaranth leaves tied in fresh morning bundles. Washed in clean tube-well water before dispatch.',
    description_bn: 'ভোরবেলা তোলা কচি লাল শাকের আঁটি। পরিষ্কার পানিতে ধোয়া এবং সম্পূর্ণ কীটনাশকমুক্ত।',
    image_url: IMG_LEAFY,
    harvested_today: true,
    harvest_window: 'today',
    harvest_label: 'Harvested 5:15 AM',
    practice: 'organic',
    badges: ['Harvested Today', 'Verified Organic'],
    trace_id: 'BD-BG-408-LS',
    rating_avg: 4.9,
    rating_count: 94,
    is_featured: true,
    basket_eligible: true,
    variants: [
      { id: 'var-ls-500', sku: 'KK-LS-500', label_en: '500g Bundle', label_bn: '৫০০ গ্রাম আঁটি', grams: 500, price: 35, compareAt: 45, stock: 70 },
      { id: 'var-ls-1000', sku: 'KK-LS-1000', label_en: '1 kg Double Bundle', label_bn: '১ কেজি জোড়া আঁটি', grams: 1000, price: 65, compareAt: 85, stock: 40 },
    ],
  },
  {
    id: 'prod-potol',
    slug: 'pointed-gourd-potol',
    catSlug: 'fresh-vegetables',
    farmerSlug: 'selina-begum',
    name_en: 'Pointed Gourd (Potol)',
    name_bn: 'পটল',
    description_en: 'Tender green pointed gourds with soft seeds from Mithapukur, Rangpur. Ideal for dolma, bhaja, and light curries.',
    description_bn: 'রংপুরের মিঠাপুকুরের কচি সবুজ পটল। ভাজি ও দোলমার জন্য দারুণ।',
    image_url: IMG_BASKET,
    harvested_today: true,
    harvest_window: 'today',
    harvest_label: 'Harvested 5:45 AM',
    practice: 'pesticide_free',
    badges: ['Harvested Today', 'Pesticide Free'],
    trace_id: 'BD-RP-118-PT',
    rating_avg: 4.8,
    rating_count: 76,
    is_featured: true,
    basket_eligible: true,
    variants: [
      { id: 'var-pt-500', sku: 'KK-PT-500', label_en: '500g Pack', label_bn: '৫০০ গ্রাম প্যাক', grams: 500, price: 40, compareAt: 50, stock: 90 },
      { id: 'var-pt-1000', sku: 'KK-PT-1000', label_en: '1 kg Pack', label_bn: '১ কেজি প্যাক', grams: 1000, price: 75, compareAt: 95, stock: 50 },
    ],
  },
  {
    id: 'prod-himsagar',
    slug: 'himsagar-mango',
    catSlug: 'seasonal-fruits',
    farmerSlug: 'rafiqul-islam',
    name_en: 'Himsagar Mango',
    name_bn: 'হিমসাগর আম',
    description_en: 'Tree-ripened GI-region Himsagar mangoes from Bagha, Rajshahi. Zero carbide, zero formalin, naturally sweet aroma.',
    description_bn: 'রাজশাহীর বাঘার গাছপাকা খাঁটি হিমসাগর আম। কোনো ফরমালিন বা কার্বাইড ছাড়াই প্রাকৃতিকভাবে পাকা।',
    image_url: IMG_MANGO,
    harvested_today: true,
    harvest_window: 'today',
    harvest_label: 'Tree-Picked 6:00 AM',
    practice: 'gap_certified',
    badges: ['GI Tagged Region', 'Naturally Ripened'],
    trace_id: 'BD-RJ-301-HM',
    rating_avg: 5.0,
    rating_count: 215,
    is_featured: true,
    basket_eligible: false,
    variants: [
      { id: 'var-hm-1000', sku: 'KK-HM-1000', label_en: '1 kg Box', label_bn: '১ কেজি বক্স', grams: 1000, price: 130, compareAt: 145, stock: 110 },
      { id: 'var-hm-3000', sku: 'KK-HM-3000', label_en: '3 kg Family Crate', label_bn: '৩ কেজি ফ্যামিলি ক্যারেট', grams: 3000, price: 370, compareAt: 420, stock: 45 },
    ],
  },
  {
    id: 'prod-bottle-gourd',
    slug: 'tender-bottle-gourd-lau',
    catSlug: 'fresh-vegetables',
    farmerSlug: 'selina-begum',
    name_en: 'Tender Bottle Gourd (Lau)',
    name_bn: 'কচি লাউ',
    description_en: 'Freshly cut tender green bottle gourd from Mithapukur trellis vines. Sweet, hydrating, and soft-seeded.',
    description_bn: 'মিঠাপুকুরের মাচা থেকে কাটা কচি সবুজ লাউ। রান্নার পর নরম ও সুস্বাদু।',
    image_url: IMG_BASKET,
    harvested_today: true,
    harvest_window: 'today',
    harvest_label: 'Harvested 5:30 AM',
    practice: 'organic',
    badges: ['Harvested Today', 'Verified Organic'],
    trace_id: 'BD-RP-122-LG',
    rating_avg: 4.9,
    rating_count: 88,
    is_featured: true,
    basket_eligible: true,
    variants: [
      { id: 'var-lg-1pc', sku: 'KK-LG-1PC', label_en: 'Per Piece (approx 1.1 kg)', label_bn: 'প্রতি পিস (প্রায় ১.১ কেজি)', grams: 1100, price: 55, compareAt: 70, stock: 65 },
    ],
  },
  {
    id: 'prod-kalo-jeera',
    slug: 'kalo-jeera-aromatic-rice',
    catSlug: 'rice-grains',
    farmerSlug: 'mizanur-rahman',
    name_en: 'Kalo Jeera Aromatic Rice',
    name_bn: 'কালোজিরা সুগন্ধি চাল',
    description_en: 'Small-batch Dinajpur heirloom Kalo Jeera polao rice, freshly milled weekly for unmistakable aroma.',
    description_bn: 'দিনাজপুরের ঐতিহ্যবাহী কালোজিরা সুগন্ধি পোলাওয়ের চাল। সাপ্তাহিক তাজা ভাঙানো।',
    image_url: IMG_GRAINS,
    harvested_today: false,
    harvest_window: '12h',
    harvest_label: 'Milled This Week',
    practice: 'conventional_verified',
    badges: ['GI Tagged Region', 'Freshly Milled'],
    trace_id: 'BD-DJ-502-KJ',
    rating_avg: 4.9,
    rating_count: 142,
    is_featured: true,
    basket_eligible: false,
    variants: [
      { id: 'var-kj-1000', sku: 'KK-KJ-1000', label_en: '1 kg Pack', label_bn: '১ কেজি প্যাক', grams: 1000, price: 145, compareAt: 160, stock: 120 },
      { id: 'var-kj-5000', sku: 'KK-KJ-5000', label_en: '5 kg Cotton Sack', label_bn: '৫ কেজি সুতির বস্তা', grams: 5000, price: 700, compareAt: 780, stock: 35 },
    ],
  },
  {
    id: 'prod-mustard-oil',
    slug: 'cold-pressed-mustard-oil',
    catSlug: 'oils-ghee-honey',
    farmerSlug: 'pabna-cooperative',
    name_en: 'Cold-Pressed Mustard Oil',
    name_bn: 'কাঠের ঘানি সরিষার তেল',
    description_en: 'Unrefined first-press mustard oil from Pabna Cooperative wooden ghani mills. Sharp natural aroma, zero chemical solvents.',
    description_bn: 'পাবনা সমবায়ের কাঠের ঘানিতে ভাঙানো খাঁটি সরিষার তেল। প্রাকৃতিক ঝাঁজ ও স্বাদ অটুট।',
    image_url: IMG_GRAINS,
    harvested_today: false,
    harvest_window: '12h',
    harvest_label: 'Pressed 48h Ago',
    practice: 'organic',
    badges: ['Wood Ghani Pressed', 'Verified Organic'],
    trace_id: 'BD-PB-210-MO',
    rating_avg: 5.0,
    rating_count: 164,
    is_featured: true,
    basket_eligible: false,
    variants: [
      { id: 'var-mo-500', sku: 'KK-MO-500', label_en: '500ml Glass Bottle', label_bn: '৫০০ মি.লি. কাঁচের বোতল', grams: 500, price: 170, compareAt: 190, stock: 95 },
      { id: 'var-mo-1000', sku: 'KK-MO-1000', label_en: '1 Litre Bottle', label_bn: '১ লিটার বোতল', grams: 1000, price: 330, compareAt: 370, stock: 50 },
    ],
  },
  {
    id: 'prod-potatoes',
    slug: 'bogura-red-potatoes',
    catSlug: 'fresh-vegetables',
    farmerSlug: 'karim-mia',
    name_en: 'Bogura Red Potatoes (Lal Alu)',
    name_bn: 'বগুড়ার লাল আলু',
    description_en: 'Firm, flavourful Bogura red-skin potatoes with creamy texture that holds shape in curries and bharta.',
    description_bn: 'বগুড়ার সুস্বাদু লাল আলু। ভর্তা ও তরকারির জন্য সেরা।',
    image_url: IMG_BASKET,
    harvested_today: true,
    harvest_window: 'today',
    harvest_label: 'Dug 6:00 AM',
    practice: 'pesticide_free',
    badges: ['GI Tagged Region', 'Pesticide Free'],
    trace_id: 'BD-BG-415-AL',
    rating_avg: 4.8,
    rating_count: 112,
    is_featured: true,
    basket_eligible: true,
    variants: [
      { id: 'var-al-2000', sku: 'KK-AL-2000', label_en: '2 kg Pack', label_bn: '২ কেজি প্যাক', grams: 2000, price: 80, compareAt: 95, stock: 140 },
      { id: 'var-al-5000', sku: 'KK-AL-5000', label_en: '5 kg Family Bag', label_bn: '৫ কেজি ব্যাগ', grams: 5000, price: 190, compareAt: 225, stock: 60 },
    ],
  },
  {
    id: 'prod-onions',
    slug: 'pabna-country-onions',
    catSlug: 'fresh-vegetables',
    farmerSlug: 'pabna-cooperative',
    name_en: 'Pabna Country Onions (Deshi Peyaj)',
    name_bn: 'পাবনার দেশি পেঁয়াজ',
    description_en: 'Aromatic pink-skinned Pabna country onions sun-cured on bamboo racks for rich gravy base.',
    description_bn: 'পাবনার ঝাঁঝালো ও সুগন্ধি দেশি পেঁয়াজ। রোদে শুকানো খাঁটি মানের।',
    image_url: IMG_BASKET,
    harvested_today: false,
    harvest_window: '12h',
    harvest_label: 'Sun-Cured Batch',
    practice: 'conventional_verified',
    badges: ['Zero Middlemen'],
    trace_id: 'BD-PB-219-PY',
    rating_avg: 4.8,
    rating_count: 105,
    is_featured: false,
    basket_eligible: true,
    variants: [
      { id: 'var-py-1500', sku: 'KK-PY-1500', label_en: '1.5 kg Pack', label_bn: '১.৫ কেজি প্যাক', grams: 1500, price: 110, compareAt: 130, stock: 100 },
    ],
  },
  {
    id: 'prod-chili-cilantro',
    slug: 'green-chili-cilantro-combo',
    catSlug: 'fresh-vegetables',
    farmerSlug: 'rahim-uddin',
    name_en: 'Green Chili & Fresh Cilantro',
    name_bn: 'কাঁচা মরিচ ও ধনেপাতা',
    description_en: 'Fiery Charghat deshi green chilies paired with fragrant riverbank coriander leaves harvested together at dawn.',
    description_bn: 'রাজশাহীর চারঘাটের ঝাল কাঁচা মরিচ ও সুগন্ধি ধনেপাতার কম্বো প্যাক।',
    image_url: IMG_LEAFY,
    harvested_today: true,
    harvest_window: 'today',
    harvest_label: 'Harvested 5:20 AM',
    practice: 'pesticide_free',
    badges: ['Harvested Today', 'Pesticide Free'],
    trace_id: 'BD-RJ-308-CC',
    rating_avg: 4.9,
    rating_count: 89,
    is_featured: false,
    basket_eligible: true,
    variants: [
      { id: 'var-cc-350', sku: 'KK-CC-350', label_en: '350g Kitchen Pack', label_bn: '৩৫০ গ্রাম প্যাক', grams: 350, price: 45, compareAt: 55, stock: 110 },
    ],
  },
  {
    id: 'prod-weekly-basket',
    slug: 'standard-weekly-basket',
    catSlug: 'weekly-baskets',
    farmerSlug: 'karim-mia',
    name_en: 'Standard 4-Person Weekly Basket',
    name_bn: 'সাপ্তাহিক পারিবারিক সবজি ঝুড়ি',
    description_en: 'Complete 5.4 kg weekly harvest basket: Bogura Red Potatoes (2kg), Pabna Onions (1.5kg), Deshi Tomato (1kg), Tender Bottle Gourd (1pc), and Green Chili + Cilantro (350g).',
    description_bn: '৪ জনের পরিবারের জন্য সম্পূর্ণ ৫.৪ কেজি সাপ্তাহিক ফসলের ঝুড়ি।',
    image_url: IMG_BASKET,
    harvested_today: true,
    harvest_window: 'today',
    harvest_label: 'Packed 6:30 AM',
    practice: 'organic',
    badges: ['15% Basket Savings', 'Harvested Today'],
    trace_id: 'BD-KK-001-WB',
    rating_avg: 4.9,
    rating_count: 184,
    is_featured: true,
    basket_eligible: false,
    variants: [
      { id: 'var-wb-5400', sku: 'KK-WB-5400', label_en: '5.4 kg Weekly Basket', label_bn: '৫.৪ কেজি সাপ্তাহিক ঝুড়ি', grams: 5400, price: 290, compareAt: 340, stock: 40 },
    ],
  },
];

// Generate remaining 31 items cleanly so demo mode has the full 42-product catalog
const EXTRA_SPECS: [string, string, string, string, string, string, number, number, string, boolean, boolean][] = [
  ['purple-brinjal-begun', 'fresh-vegetables', 'rahim-uddin', 'Long Purple Brinjal (Begun)', 'লম্বা বেগুন', IMG_BASKET, 45, 500, '500g Pack', true, true],
  ['tender-okra-dherosh', 'fresh-vegetables', 'selina-begum', 'Tender Okra (Dherosh)', 'কচি ঢেঁড়স', IMG_LEAFY, 42, 500, '500g Pack', true, true],
  ['snow-cauliflower-fulkopi', 'fresh-vegetables', 'karim-mia', 'Farm Cauliflower (Fulkopi)', 'তাজা ফুলকপি', IMG_BASKET, 50, 500, '500g Pack', true, true],
  ['deshi-cucumber-shosha', 'fresh-vegetables', 'rahim-uddin', 'Crisp Deshi Cucumber (Shosha)', 'দেশি শসা', IMG_BASKET, 38, 500, '500g Pack', true, true],
  ['bitter-gourd-korola', 'fresh-vegetables', 'selina-begum', 'Deshi Bitter Gourd (Korola)', 'দেশি করলা', IMG_BASKET, 55, 500, '500g Pack', true, true],
  ['sweet-pumpkin-mishti-kumra', 'fresh-vegetables', 'pabna-cooperative', 'Sweet Pumpkin Wedge (Mishti Kumra)', 'মিষ্টি কুমড়া', IMG_BASKET, 40, 500, '500g Pack', false, true],
  ['water-spinach-kolmi-shak', 'leafy-greens', 'selina-begum', 'Water Spinach (Kolmi Shak)', 'কলমি শাক', IMG_LEAFY, 30, 500, '500g Bundle', true, true],
  ['malabar-spinach-pui-shak', 'leafy-greens', 'karim-mia', 'Malabar Spinach (Pui Shak)', 'পুঁই শাক', IMG_LEAFY, 38, 500, '500g Bundle', true, true],
  ['green-amaranth-data-shak', 'leafy-greens', 'selina-begum', 'Green Amaranth (Data Shak)', 'ডাঁটা শাক', IMG_LEAFY, 32, 500, '500g Bundle', true, true],
  ['bottle-gourd-leaves-lau-shak', 'leafy-greens', 'karim-mia', 'Bottle Gourd Leaves (Lau Shak)', 'লাউ শাক', IMG_LEAFY, 36, 500, '500g Bundle', true, true],
  ['amrapali-mango', 'seasonal-fruits', 'rafiqul-islam', 'Amrapali Mango', 'আম্রপালি আম', IMG_MANGO, 125, 1000, '1 kg Pack', true, false],
  ['kazi-peyara-guava', 'seasonal-fruits', 'rahim-uddin', 'Crunchy Deshi Guava (Peyara)', 'কাজি পেয়ারা', IMG_MANGO, 85, 1000, '1 kg Pack', true, false],
  ['sagar-banana-kola', 'seasonal-fruits', 'pabna-cooperative', 'Sagar Banana Bunch', 'সাগর কলা', IMG_MANGO, 90, 1000, '1 kg Pack', true, false],
  ['dinajpur-bedana-lichi', 'seasonal-fruits', 'mizanur-rahman', 'Dinajpur Bedana Litchi', 'দিনাজপুরের বেদানা লিচু', IMG_MANGO, 240, 1000, '1 kg Pack', true, false],
  ['green-papaya-pepe', 'seasonal-fruits', 'selina-begum', 'Ripe & Raw Papaya (Pepe)', 'টাটকা পেঁপে', IMG_MANGO, 75, 1000, '1 kg Pack', false, false],
  ['chinigura-polao-rice', 'rice-grains', 'mizanur-rahman', 'Dinajpur Chinigura Rice', 'চিনিগুঁড়া পোলাও চাল', IMG_GRAINS, 280, 2000, '2 kg Pack', false, false],
  ['miniket-daily-rice', 'rice-grains', 'mizanur-rahman', 'Unpolished Miniket Rice', 'অপলিশড মিনিকেট চাল', IMG_GRAINS, 165, 2000, '2 kg Pack', false, false],
  ['brown-red-atop-rice', 'rice-grains', 'mizanur-rahman', 'Heritage Red Atop Rice (Lal Chal)', 'লাল আতপ চাল', IMG_GRAINS, 210, 2000, '2 kg Pack', false, false],
  ['kataribhog-rice', 'rice-grains', 'mizanur-rahman', 'Kataribhog Heritage Rice', 'কাটারিভোগ চাল', IMG_GRAINS, 260, 2000, '2 kg Pack', false, false],
  ['deshi-masoor-dal', 'pulses-lentils', 'pabna-cooperative', 'Deshi Red Lentils (Masoor Dal)', 'দেশি মসুর ডাল', IMG_GRAINS, 145, 1000, '1 kg Pack', false, false],
  ['bhaja-moong-dal', 'pulses-lentils', 'pabna-cooperative', 'Golden Mung Dal (Moong Dal)', 'সোনালী মুগ ডাল', IMG_GRAINS, 160, 1000, '1 kg Pack', false, false],
  ['deshi-chola-chickpeas', 'pulses-lentils', 'pabna-cooperative', 'Deshi Chickpeas (Chola Boot)', 'দেশি ছোলা বুট', IMG_GRAINS, 120, 1000, '1 kg Pack', false, false],
  ['kheshari-dal', 'pulses-lentils', 'pabna-cooperative', 'Village Kheshari Dal', 'খেসারি ডাল', IMG_GRAINS, 105, 1000, '1 kg Pack', false, false],
  ['pabna-turmeric-powder', 'natural-spices', 'pabna-cooperative', 'Pure Turmeric Powder (Holud)', 'খাঁটি হলুদ গুঁড়া', IMG_GRAINS, 95, 250, '250g Pack', false, false],
  ['bogura-red-chili-powder', 'natural-spices', 'karim-mia', 'Bogura Red Chili Powder (Morich)', 'বগুড়ার লাল মরিচ গুঁড়া', IMG_GRAINS, 115, 250, '250g Pack', false, false],
  ['whole-cumin-jeera', 'natural-spices', 'pabna-cooperative', 'Whole Aromatic Cumin (Jeera)', 'আস্ত জিরা', IMG_GRAINS, 240, 250, '250g Pack', false, false],
  ['deshi-ginger-ada', 'natural-spices', 'karim-mia', 'Fresh Deshi Ginger (Ada)', 'দেশি আদা', IMG_GRAINS, 80, 250, '250g Pack', true, false],
  ['sundarban-raw-honey', 'oils-ghee-honey', 'pabna-cooperative', 'Raw Multiflora Forest Honey (Modhu)', 'খাঁটি প্রাকৃতিক মধু', IMG_GRAINS, 320, 250, '250g Jar', false, false],
  ['pure-cow-ghee', 'oils-ghee-honey', 'pabna-cooperative', 'Cultured Cow Ghee (Gawa Ghee)', 'খাঁটি গাওয়া ঘি', IMG_GRAINS, 420, 250, '250g Jar', false, false],
  ['black-seed-kalojira-oil', 'oils-ghee-honey', 'pabna-cooperative', 'Cold-Pressed Black Seed Oil', 'কালোজিরার তেল', IMG_GRAINS, 290, 250, '250ml Jar', false, false],
  ['organic-baby-carrots', 'verified-organic', 'karim-mia', 'Organic Sweet Carrots (Gajor)', 'অর্গানিক গাজর', IMG_BASKET, 60, 500, '500g Pack', true, true],
  ['organic-french-beans', 'verified-organic', 'selina-begum', 'Organic French Beans (Borboti)', 'অর্গানিক বরবটি', IMG_LEAFY, 55, 500, '500g Pack', true, true],
  ['organic-lemon-kagozi', 'verified-organic', 'rahim-uddin', 'Aromatic Kagozi Lemon (Lebu)', 'কাগজি লেবু', IMG_MANGO, 50, 500, '500g Pack', true, true],
  ['couples-green-basket', 'weekly-baskets', 'selina-begum', '2-Person Fresh Greens & Veg Basket', '২ জনের সাপ্তাহিক তাজা ঝুড়ি', IMG_BASKET, 185, 3000, '3 kg Basket', true, false],
  ['fruit-lovers-seasonal-box', 'weekly-baskets', 'rafiqul-islam', 'Seasonal Rajshahi Fruit Box', 'মৌসুমি ফলের ঝুড়ি', IMG_MANGO, 340, 3500, '3.5 kg Fruit Box', true, false],
  ['precut-lau-chingri-mix', 'ready-to-cook', 'selina-begum', 'Washed & Cubed Bottle Gourd Pack', 'কাটা ও ধোয়া কচি লাউ', IMG_BASKET, 70, 500, '500g Ready Pack', true, false],
  ['washed-lal-shak-chopped', 'ready-to-cook', 'karim-mia', 'Triple-Washed Chopped Red Spinach', 'ধোয়া ও কাটা লাল শাক', IMG_LEAFY, 55, 500, '500g Ready Pack', true, false],
  ['khichuri-veg-medley', 'ready-to-cook', 'karim-mia', 'Rainy-Day Khichuri Veg Medley', 'খিচুড়ির কাটা সবজি প্যাক', IMG_BASKET, 85, 500, '500g Ready Pack', true, false],
];

function buildProduct(raw: RawSeedProduct): ProductSummaryDTO {
  const cat = catBySlug[raw.catSlug];
  const farmer = farmBySlug[raw.farmerSlug];
  return {
    id: raw.id,
    slug: raw.slug,
    category_id: cat.id,
    category: { id: cat.id, slug: cat.slug, name_en: cat.name_en, name_bn: cat.name_bn },
    farmer_id: farmer.id,
    farmer: {
      id: farmer.id,
      slug: farmer.slug,
      name_en: farmer.name_en,
      name_bn: farmer.name_bn,
      district: farmer.district,
      upazila: farmer.upazila,
      photo_url: farmer.photo_url,
      acres: farmer.acres,
      years_farming: farmer.years_farming,
    },
    name_en: raw.name_en,
    name_bn: raw.name_bn,
    description_en: raw.description_en,
    description_bn: raw.description_bn,
    image_url: raw.image_url,
    gallery_urls: [raw.image_url, IMG_BASKET],
    origin_district: farmer.district,
    origin_hub: farmer.district === 'Rangpur' ? 'Uttara Hub' : 'Tejgaon Hub',
    harvest_time: new Date().toISOString(),
    harvested_today: raw.harvested_today,
    harvest_window: raw.harvest_window,
    harvest_label: raw.harvest_label,
    farming_practice: raw.practice,
    badges: raw.badges,
    trace_id: raw.trace_id,
    trace_log: [
      { time: '05:30 AM', title: 'Hand-picked at Sunrise', detail: `Harvested by ${farmer.name_en} in ${farmer.upazila}, ${farmer.district}.` },
      { time: '06:45 AM', title: 'Graded & QR Tagged', detail: `Sorted into ventilated bamboo crates with batch QR #${raw.trace_id}.` },
      { time: '08:15 AM', title: 'Dispatched to Dhaka Hub', detail: 'Chilled morning transit for 11:00 AM Dhaka delivery.' },
    ],
    rating_avg: raw.rating_avg,
    rating_count: raw.rating_count,
    is_featured: raw.is_featured,
    basket_eligible: raw.basket_eligible,
    variants: raw.variants.map((v, i) => ({
      id: v.id,
      product_id: raw.id,
      sku: v.sku,
      label_en: v.label_en,
      label_bn: v.label_bn,
      unit_weight_grams: v.grams,
      price_bdt: v.price,
      compare_at_price_bdt: v.compareAt,
      stock_qty: v.stock,
      is_default: i === 0,
      sort_order: i + 1,
    })),
  };
}

export const DEMO_PRODUCTS: ProductSummaryDTO[] = [
  ...RAW_PRODUCTS.map(buildProduct),
  ...EXTRA_SPECS.map(([slug, catSlug, farmerSlug, name_en, name_bn, image_url, price, grams, label_en, harvested_today, basket_eligible], idx) =>
    buildProduct({
      id: `prod-extra-${idx + 1}`,
      slug,
      catSlug,
      farmerSlug,
      name_en,
      name_bn,
      description_en: `Farm-direct ${name_en} sourced from verified smallholder growers with full batch traceability.`,
      description_bn: `সরাসরি কৃষকের ক্ষেত থেকে সংগৃহীত খাঁটি ${name_bn}।`,
      image_url,
      harvested_today,
      harvest_window: harvested_today ? 'today' : '12h',
      harvest_label: harvested_today ? 'Harvested 5:30 AM' : 'Fresh Batch',
      practice: idx % 2 === 0 ? 'organic' : 'pesticide_free',
      badges: harvested_today ? ['Harvested Today', 'Verified Organic'] : ['Zero Middlemen'],
      trace_id: `BD-KK-${200 + idx}`,
      rating_avg: 4.8,
      rating_count: 42 + idx * 3,
      is_featured: false,
      basket_eligible,
      variants: [
        {
          id: `var-extra-${idx + 1}`,
          sku: `KK-EX-${idx + 1}`,
          label_en,
          label_bn: label_en,
          grams,
          price,
          compareAt: null,
          stock: 60,
        },
      ],
    })
  ),
];

export const DEMO_REVIEWS: Record<string, ProductReviewDTO[]> = {
  'deshi-tomato': [
    {
      id: 'rev-1',
      product_id: 'prod-deshi-tomato',
      author_name: 'Nusrat Jahan',
      area: 'Gulshan 2',
      rating: 5,
      comment: 'Just like the tomatoes my grandmother used to cook with. So fragrant and juicy!',
      created_at: new Date().toISOString(),
    },
    {
      id: 'rev-2',
      product_id: 'prod-deshi-tomato',
      author_name: 'তানভীর আহমেদ',
      area: 'Dhanmondi',
      rating: 5,
      comment: 'সকালে অর্ডার করে দুপুরেই পেয়েছি। একদম টাটকা, কোনো দাগ নেই।',
      created_at: new Date().toISOString(),
    },
    {
      id: 'rev-3',
      product_id: 'prod-deshi-tomato',
      author_name: 'Farhana Kabir',
      area: 'Uttara Sector 7',
      rating: 5,
      comment: "Scanned the QR code and saw Karim Mia's farm details. Truly trustworthy.",
      created_at: new Date().toISOString(),
    },
  ],
};

export function getDemoProductDetail(slug: string): ProductDetailDTO | null {
  const prod = DEMO_PRODUCTS.find((p) => p.slug === slug);
  if (!prod) return null;
  const reviews = DEMO_REVIEWS[slug] ?? [
    {
      id: `rev-default-${prod.id}`,
      product_id: prod.id,
      author_name: 'Sadia Rahman',
      area: 'Banani',
      rating: 5,
      comment: 'Fresh morning quality, packed cleanly without plastic bruising.',
      created_at: new Date().toISOString(),
    },
  ];
  const related = DEMO_PRODUCTS.filter((p) => p.id !== prod.id && p.harvested_today).slice(0, 4);
  return { ...prod, reviews, related };
}

export function getDemoStandardBasket(): StandardBasketDTO {
  const slugs = [
    'bogura-red-potatoes',
    'pabna-country-onions',
    'deshi-tomato',
    'tender-bottle-gourd-lau',
    'green-chili-cilantro-combo',
  ];
  const items = slugs
    .map((s) => DEMO_PRODUCTS.find((p) => p.slug === s))
    .filter((p): p is ProductSummaryDTO => Boolean(p))
    .map((p) => {
      const v =
        p.slug === 'deshi-tomato'
          ? p.variants.find((x) => x.unit_weight_grams === 1000) ?? p.variants[0]
          : p.variants[0];
      return {
        product_id: p.id,
        slug: p.slug,
        variant_id: v.id,
        name_en: p.name_en,
        name_bn: p.name_bn,
        variant_label_en: v.label_en,
        variant_label_bn: v.label_bn,
        unit_price_bdt: v.price_bdt,
        unit_weight_grams: v.unit_weight_grams,
        image_url: p.image_url,
        farmer_name_en: p.farmer?.name_en ?? 'KrishiKotha Grower',
        origin_district: p.origin_district,
      };
    });

  const listed = items.reduce((s, i) => s + i.unit_price_bdt, 0);
  const discount = Math.round((listed * 15) / 100);
  return {
    title_en: 'Standard 4-Person Weekly Basket',
    title_bn: 'সাপ্তাহিক পারিবারিক সবজি ঝুড়ি',
    discount_percent: 15,
    listed_total_bdt: listed,
    basket_discount_bdt: discount,
    final_price_bdt: listed - discount,
    total_weight_grams: items.reduce((s, i) => s + i.unit_weight_grams, 0),
    items,
  };
}
