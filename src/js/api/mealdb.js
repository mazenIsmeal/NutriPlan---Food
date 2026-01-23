// fetch data here
// Get All Areas

export async function getAllAreas() {
  const req = await fetch("https://nutriplan-api.vercel.app/api/meals/areas");
  const res = await req.json();
  const result = res.results.slice(0, 10);
  return result;
}

// Get All Categories
export async function getAllCategories() {
  const req = await fetch(
    "https://nutriplan-api.vercel.app/api/meals/categories",
  );
  const res = await req.json();
  const result = res.results.slice(0, 12);
  return result;
}

// Get all Meals
export async function getAllMeals(arr = "chicken") {
  try {
    const req = await fetch(
      `https://nutriplan-api.vercel.app/api/meals/filter?category=${arr}&page=1&limit=25`,
    );

    if (!req.ok) {
      throw new Error("Network response was not ok");
    }

    const res = await req.json();
    return res.results;
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}

// filter data with area
export async function getDataArea(area) {
  const req = await fetch(
    `https://nutriplan-api.vercel.app/api/meals/filter?area=${area}`,
  );
  const res = await req.json();
  return res.results;
}

// get data by id details
export async function getDetailsItemById(id) {
  const req = await fetch(`https://nutriplan-api.vercel.app/api/meals/${id}`);
  const res = await req.json();
  return res.result;
}

// Analyze recipe nutrition
export async function analyzeRecipe(res) {
  const req = await fetch(
    "https://nutriplan-api.vercel.app/api/nutrition/analyze",
    {
      headers: {
        "x-api-key": "OVFLuEwQ8HypUmNzKKvxbXqwE64XiZ3zMuA3KO1m",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ingredients: res }),
      method: "Post",
    },
  );
  const response = await req.json();
  return response.data;
}
