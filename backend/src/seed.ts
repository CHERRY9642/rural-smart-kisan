import { hashPassword } from "./auth.js";
import { initDb, pool, query } from "./db.js";

type SeedUser = {
  name: string;
  email: string;
  password: string;
  phone: string;
  state: string;
  district: string;
  language: string;
  plan: string;
  role: string;
  farmSize?: string;
  mainCrops?: string;
};

const users: SeedUser[] = [
  {
    name: "Farmer One",
    email: "farmer1@example.com",
    password: "Charan@9642",
    phone: "9876543210",
    state: "Karnataka",
    district: "Bangalore",
    language: "en",
    plan: "premium",
    role: "farmer",
    farmSize: "5 acres",
    mainCrops: "Tomato, Rice, Onion"
  },
  {
    name: "Ramesh Kumar",
    email: "ramesh.farm@example.com",
    password: "Charan@9642",
    phone: "9876500001",
    state: "Karnataka",
    district: "Mysore",
    language: "kn",
    plan: "free",
    role: "farmer",
    farmSize: "3 acres",
    mainCrops: "Tomato, Spinach"
  },
  {
    name: "Sunita Devi",
    email: "sunita.farm@example.com",
    password: "Charan@9642",
    phone: "9876500002",
    state: "Karnataka",
    district: "Hassan",
    language: "hi",
    plan: "free",
    role: "artifact_seller",
    farmSize: "2 acres",
    mainCrops: "Onion, Potato"
  }
];

const sampleProducts = [
  {
    name: "Fresh Tomatoes",
    price: 45,
    unit: "kg",
    quantity: 50,
    seller: "Ramesh Kumar",
    location: "Bangalore, Karnataka",
    description: "Farm fresh red tomatoes, perfect for cooking and salads. Harvested yesterday.",
    category: "vegetables",
    freshness: "Very Fresh",
    isOrganic: true,
    productType: "grocery",
    images: [{ id: "tomato-1", url: "🍅", alt: "Fresh Tomatoes" }],
    rating: 4.5,
    likesCount: 12,
    savesCount: 8
  },
  {
    name: "Organic Onions",
    price: 32,
    unit: "kg",
    quantity: 30,
    seller: "Sunita Devi",
    location: "Mysore, Karnataka",
    description: "Certified organic onions with no pesticides. Great for daily cooking.",
    category: "vegetables",
    freshness: "Fresh",
    isOrganic: true,
    productType: "grocery",
    images: [{ id: "onion-1", url: "🧅", alt: "Organic Onions" }],
    rating: 4.8,
    likesCount: 18,
    savesCount: 14
  },
  {
    name: "Basmati Rice",
    price: 85,
    unit: "kg",
    quantity: 100,
    seller: "Krishnan Farms",
    location: "Hassan, Karnataka",
    description: "Premium quality basmati rice with authentic aroma and taste.",
    category: "grains",
    freshness: "Excellent",
    isOrganic: false,
    productType: "grocery",
    images: [{ id: "rice-1", url: "🌾", alt: "Basmati Rice" }],
    rating: 4.7,
    likesCount: 25,
    savesCount: 20
  },
  {
    name: "Vintage Brass Plow",
    price: 15000,
    unit: "item",
    quantity: 1,
    seller: "Heritage Farm Tools",
    location: "Mysore, Karnataka",
    description: "Authentic vintage brass plow from the 1950s. Well-maintained and functional.",
    category: "tools",
    freshness: "Heritage",
    isOrganic: false,
    productType: "artifact",
    condition: "excellent",
    images: [{ id: "plow-1", url: "🪓", alt: "Vintage Brass Plow" }],
    rating: 4.8,
    likesCount: 23,
    savesCount: 6
  },
  {
    name: "Traditional Clay Pottery Set",
    price: 2500,
    unit: "set",
    quantity: 4,
    seller: "Kumar Pottery Works",
    location: "Bangalore, Karnataka",
    description: "Handmade clay pots and vessels, perfect for traditional cooking and storage.",
    category: "pottery",
    freshness: "Handmade",
    isOrganic: false,
    productType: "artifact",
    condition: "good",
    images: [{ id: "pottery-1", url: "🏺", alt: "Traditional Clay Pottery Set" }],
    rating: 4.6,
    likesCount: 18,
    savesCount: 5
  },
  {
    name: "Fresh Mangoes",
    price: 120,
    unit: "kg",
    quantity: 25,
    seller: "Mango Valley Farm",
    location: "Belgaum, Karnataka",
    description: "Sweet Alphonso mangoes directly from our orchard. Limited seasonal stock.",
    category: "fruits",
    freshness: "Very Fresh",
    isOrganic: true,
    productType: "grocery",
    images: [{ id: "mango-1", url: "🥭", alt: "Fresh Mangoes" }],
    rating: 4.9,
    likesCount: 32,
    savesCount: 28
  },
  {
    name: "Solar Sprayer Kit",
    price: 6200,
    unit: "item",
    quantity: 3,
    seller: "Smart Farm Tools",
    location: "Hubli, Karnataka",
    description: "Rechargeable solar sprayer for pesticide and nutrient application.",
    category: "tools",
    freshness: "New",
    isOrganic: false,
    productType: "artifact",
    condition: "excellent",
    images: [{ id: "sprayer-1", url: "📦", alt: "Solar Sprayer Kit" }],
    rating: 4.4,
    likesCount: 11,
    savesCount: 4
  }
];

const upsertUser = async (user: SeedUser) => {
  const passwordHash = await hashPassword(user.password);
  const { rows } = await query(
    `insert into users
      (name, email, password_hash, phone, state, district, language, plan, role, farm_size, main_crops)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     on conflict (email) do update set
      name = excluded.name,
      password_hash = excluded.password_hash,
      phone = excluded.phone,
      state = excluded.state,
      district = excluded.district,
      language = excluded.language,
      plan = excluded.plan,
      role = excluded.role,
      farm_size = excluded.farm_size,
      main_crops = excluded.main_crops,
      updated_at = now()
     returning id, name, email`,
    [
      user.name,
      user.email,
      passwordHash,
      user.phone,
      user.state,
      user.district,
      user.language,
      user.plan,
      user.role,
      user.farmSize,
      user.mainCrops
    ]
  );

  return rows[0];
};

const seed = async () => {
  await initDb();
  await query("create unique index if not exists products_seed_identity on products (name, seller, product_type)");
  await query("create unique index if not exists orders_tracking_identity on orders (tracking_number)");
  await query("create unique index if not exists cold_storage_seed_identity on cold_storage_requests (user_id, farmer_name, produce_type, estimated_quantity, preferred_duration)");
  await query(
    `update users
     set email = 'farmer1@example.com', updated_at = now()
     where email in ('former1@eample.com', 'former1@example.com')
       and not exists (select 1 from users where email = 'farmer1@example.com')`
  );

  const seededUsers = await Promise.all(users.map(upsertUser));
  const demoUser = seededUsers[0];

  for (const product of sampleProducts) {
    const { rows } = await query(
      `insert into products
        (owner_id, name, price, unit, quantity, seller, location, description, category, freshness,
         is_organic, product_type, condition, images, rating, likes_count, saves_count)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       on conflict (name, seller, product_type) do update set
        price = excluded.price,
        unit = excluded.unit,
        quantity = excluded.quantity,
        location = excluded.location,
        description = excluded.description,
        category = excluded.category,
        freshness = excluded.freshness,
        is_organic = excluded.is_organic,
        condition = excluded.condition,
        images = excluded.images,
        rating = excluded.rating,
        likes_count = excluded.likes_count,
        saves_count = excluded.saves_count,
        updated_at = now()
       returning id`,
      [
        demoUser.id,
        product.name,
        product.price,
        product.unit,
        product.quantity,
        product.seller,
        product.location,
        product.description,
        product.category,
        product.freshness,
        product.isOrganic,
        product.productType,
        product.condition ?? null,
        JSON.stringify(product.images),
        product.rating,
        product.likesCount,
        product.savesCount
      ]
    );

    await query(
      `delete from product_feedback
       where product_id = $1 and user_id = $2 and comment like 'Great quality % sample listing.'`,
      [rows[0].id, demoUser.id]
    );
    await query(
      `insert into product_feedback (product_id, user_id, rating, comment)
       values ($1, $2, $3, $4)`,
      [rows[0].id, demoUser.id, 5, `Great quality ${product.name.toLowerCase()} sample listing.`]
    );
  }

  const orderItems = [
    {
      id: "seed-tomato",
      name: "Fresh Tomatoes",
      price: 45,
      cartQuantity: 2,
      type: "product",
      seller: "Ramesh Kumar",
      location: "Bangalore, Karnataka",
      images: [{ id: "tomato-1", url: "🍅", alt: "Fresh Tomatoes" }],
      description: "Farm fresh red tomatoes",
      category: "vegetables",
      unit: "kg"
    },
    {
      id: "seed-onion",
      name: "Organic Onions",
      price: 32,
      cartQuantity: 1,
      type: "product",
      seller: "Sunita Devi",
      location: "Mysore, Karnataka",
      images: [{ id: "onion-1", url: "🧅", alt: "Organic Onions" }],
      description: "Certified organic onions",
      category: "vegetables",
      unit: "kg"
    }
  ];

  await query(
    `insert into orders (user_id, items, total_amount, status, delivery_address, payment_method, order_type, tracking_number)
     values ($1, $2, $3, 'out-for-delivery', $4, 'Cash on Delivery', 'grocery', 'TRKSEED001')
     on conflict (tracking_number) do update set
      items = excluded.items,
      total_amount = excluded.total_amount,
      status = excluded.status,
      delivery_address = excluded.delivery_address,
      updated_at = now()`,
    [demoUser.id, JSON.stringify(orderItems), 122, "HSR Layout, Bangalore, Karnataka"]
  );

  const artifactOrderItems = [
    {
      id: "seed-plow",
      name: "Vintage Brass Plow",
      price: 15000,
      cartQuantity: 1,
      type: "artifact",
      seller: "Heritage Farm Tools",
      location: "Mysore, Karnataka",
      images: [{ id: "plow-1", url: "🪓", alt: "Vintage Brass Plow" }],
      description: "Authentic vintage brass plow",
      category: "tools",
      condition: "excellent"
    }
  ];

  await query(
    `insert into orders (user_id, items, total_amount, status, delivery_address, payment_method, order_type, tracking_number)
     values ($1, $2, $3, 'delivered', $4, 'UPI', 'artifact', 'TRKSEED002')
     on conflict (tracking_number) do update set
      items = excluded.items,
      total_amount = excluded.total_amount,
      status = excluded.status,
      delivery_address = excluded.delivery_address,
      payment_method = excluded.payment_method,
      order_type = excluded.order_type,
      updated_at = now()`,
    [demoUser.id, JSON.stringify(artifactOrderItems), 15000, "Jayanagar, Bangalore, Karnataka"]
  );

  await query(
    `insert into cold_storage_requests
      (user_id, farmer_name, farm_location, phone_number, email, farm_size, produce_type, estimated_quantity,
       preferred_duration, nearest_facility, special_requirements, status)
     values ($1, $2, $3, $4, $5, $6, 'vegetables', '500 kg', '1-month', 'bangalore',
       'Keep tomatoes at stable temperature before market transport.', 'submitted')
     on conflict (user_id, farmer_name, produce_type, estimated_quantity, preferred_duration)
     do update set
      farm_location = excluded.farm_location,
      phone_number = excluded.phone_number,
      email = excluded.email,
      farm_size = excluded.farm_size,
      nearest_facility = excluded.nearest_facility,
      special_requirements = excluded.special_requirements,
      status = excluded.status`,
    [demoUser.id, "Farmer One", "Bangalore Rural, Karnataka", "9876543210", "farmer1@example.com", "5 acres"]
  );

  await query(
    `insert into cold_storage_requests
      (user_id, farmer_name, farm_location, phone_number, email, farm_size, produce_type, estimated_quantity,
       preferred_duration, nearest_facility, special_requirements, status)
     values ($1, $2, $3, $4, $5, $6, 'fruits', '250 kg', '2-weeks', 'mysore',
       'Mangoes need gentle handling and rapid cooling after harvest.', 'approved')
     on conflict (user_id, farmer_name, produce_type, estimated_quantity, preferred_duration)
     do update set
      farm_location = excluded.farm_location,
      phone_number = excluded.phone_number,
      email = excluded.email,
      farm_size = excluded.farm_size,
      nearest_facility = excluded.nearest_facility,
      special_requirements = excluded.special_requirements,
      status = excluded.status`,
    [demoUser.id, "Farmer One", "Bangalore Rural, Karnataka", "9876543210", "farmer1@example.com", "5 acres"]
  );

  console.log("Seed completed");
  console.table(seededUsers);
  console.log("Demo login: farmer1@example.com / Charan@9642");
};

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
