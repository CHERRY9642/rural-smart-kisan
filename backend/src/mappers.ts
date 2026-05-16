export const userFromRow = (row: any) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  state: row.state,
  district: row.district,
  language: row.language,
  plan: row.plan,
  role: row.role,
  farmSize: row.farm_size,
  mainCrops: row.main_crops,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const productFromRow = (row: any) => ({
  id: row.id,
  name: row.name,
  price: Number(row.price),
  unit: row.unit,
  quantity: row.quantity,
  seller: row.seller,
  location: row.location,
  rating: Number(row.rating),
  images: row.images ?? [],
  description: row.description,
  category: row.category,
  freshness: row.freshness,
  postedAt: row.created_at,
  isOrganic: row.is_organic,
  productType: row.product_type,
  condition: row.condition,
  likesCount: row.likes_count,
  savesCount: row.saves_count,
  feedback: row.feedback ?? []
});
