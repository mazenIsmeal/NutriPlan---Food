// section scanner api
// Get Product search
export async function getProductSearch(search) {
  const req = await fetch(
    `https://nutriplan-api.vercel.app/api/products/search?q=${search}&page=1&limit=24`,
    {
      headers: { "x-api-key": "OVFLuEwQ8HypUmNzKKvxbXqwE64XiZ3zMuA3KO1m" },
    },
  );
  const res = await req.json();
  return res.results;
}

// Get Product by barcode
export async function getProductByBarcode(bar) {
  const req = await fetch(
    `https://nutriplan-api.vercel.app/api/products/barcode/${bar}`,
    {
      headers: { "x-api-key": "OVFLuEwQ8HypUmNzKKvxbXqwE64XiZ3zMuA3KO1m" },
    },
  );
  const res = await req.json();
  console.log(res);
  
  return res.result;
}

// Get Category button
export async function getCategory() {
  const req = await fetch(
    "https://nutriplan-api.vercel.app/api/products/categories",
    {
      headers: { "x-api-key": "OVFLuEwQ8HypUmNzKKvxbXqwE64XiZ3zMuA3KO1m" },
    },
  );
  const res = await req.json();
  console.log(res);
  
  return res.results;
}

// get all meals by category
export async function categoryMeals(cate) {
  const req = await fetch(
    `https://nutriplan-api.vercel.app/api/products/category/${cate}`,
  );
  const res = await req.json();
  return res.results;
}
