import {
  analyzeRecipe,
  getAllAreas,
  getAllCategories,
  getAllMeals,
  getDataArea,
  getDetailsItemById,
} from "./api/mealdb.js";
import {
  categoryMeals,
  getCategory,
  getProductByBarcode,
  getProductSearch,
} from "./api/scanner.js";

// ============================================================================
// 🔄 DAILY RESET SYSTEM
// ============================================================================

function checkAndResetDaily() {
  const today = getTodayDate();
  const lastActiveDate = localStorage.getItem("lastActiveDate");

  if (lastActiveDate && lastActiveDate !== today) {
    const yesterdayData = calculateDayNutrition(lastActiveDate);
    saveToWeeklyHistory(lastActiveDate, yesterdayData);
  }

  localStorage.setItem("lastActiveDate", today);
}

function calculateDayNutrition(date) {
  const foodLog = JSON.parse(localStorage.getItem("calories")) || [];
  const dayMeals = foodLog.filter((meal) => meal.data === date);

  return dayMeals.reduce(
    (acc, meal) => {
      acc.calories += Number(meal.type.calories) || 0;
      acc.protein += Number(meal.type.protein) || 0;
      acc.carbs += Number(meal.type.carbs) || 0;
      acc.fat += Number(meal.type.fat) || 0;
      acc.mealsCount += 1;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, mealsCount: 0 }
  );
}

function saveToWeeklyHistory(date, nutrition) {
  const weeklyHistory = JSON.parse(localStorage.getItem("weeklyHistory")) || [];
  const existingIndex = weeklyHistory.findIndex((day) => day.date === date);

  if (existingIndex !== -1) {
    weeklyHistory[existingIndex] = { date, ...nutrition };
  } else {
    weeklyHistory.push({ date, ...nutrition });
  }

  if (weeklyHistory.length > 30) {
    weeklyHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    weeklyHistory.splice(30);
  }

  localStorage.setItem("weeklyHistory", JSON.stringify(weeklyHistory));
}

// ============================================================================
// 📊 PROGRESS BARS
// ============================================================================

function calculateTodayNutrition() {
  const foodLog = JSON.parse(localStorage.getItem("calories")) || [];
  const today = getTodayDate();
  const todayMeals = foodLog.filter((meal) => meal.data === today);

  const totals = todayMeals.reduce(
    (acc, meal) => {
      acc.calories += Number(meal.type.calories) || 0;
      acc.protein += Number(meal.type.protein) || 0;
      acc.carbs += Number(meal.type.carbs) || 0;
      acc.fat += Number(meal.type.fat) || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return { totals, mealsCount: todayMeals.length };
}

function updateProgressBars() {
  const { totals } = calculateTodayNutrition();

  const dailyGoals = { calories: 2000, protein: 50, carbs: 250, fat: 65 };

  const percentages = {
    calories: Math.min((totals.calories / dailyGoals.calories) * 100, 100),
    protein: Math.min((totals.protein / dailyGoals.protein) * 100, 100),
    carbs: Math.min((totals.carbs / dailyGoals.carbs) * 100, 100),
    fat: Math.min((totals.fat / dailyGoals.fat) * 100, 100),
  };

  const bars = {
    calories: document.querySelector(".one"),
    protein: document.querySelector(".two"),
    carbs: document.querySelector(".three"),
    fat: document.querySelector(".four"),
  };

  const counts = {
    calories: document.querySelector(".count-one"),
    protein: document.querySelector(".count-two"),
    carbs: document.querySelector(".count-three"),
    fat: document.querySelector(".count-four"),
  };

  Object.keys(bars).forEach((key) => {
    if (bars[key]) {
      bars[key].style.width = `${percentages[key]}%`;
      bars[key].style.backgroundColor =
        totals[key] > dailyGoals[key] ? "#ef4444" : "";
    }
    if (counts[key]) {
      const unit = key === "calories" ? "kcal" : "g";
      counts[key].textContent = `${Math.round(totals[key])} / ${dailyGoals[key]} ${unit}`;
    }
  });
}

// ============================================================================
// 🍽️ MEAL SOURCE STATS
// ============================================================================

function getMealSourceStats() {
  const foodLog = JSON.parse(localStorage.getItem("calories")) || [];
  const today = getTodayDate();
  const todayMeals = foodLog.filter((meal) => meal.data === today);

  return {
    recipe: todayMeals.filter((m) => m.dataType === "Recipe").length,
    scanner: todayMeals.filter((m) => m.dataType === "Scanner").length,
    total: todayMeals.length,
  };
}

function displayMealSourceStats() {
  const stats = getMealSourceStats();

  const statsHTML = `
    <div class="meal-source-stats bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4 border border-blue-200">
      <h4 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
        <i class="fa-solid fa-chart-pie text-blue-600"></i>
        Meal Sources Today
      </h4>
      <div class="grid grid-cols-3 gap-3">
        <div class="text-center bg-white rounded-lg p-3 shadow-sm">
          <div class="flex items-center justify-center gap-2 mb-1">
            <i class="fa-solid fa-utensils text-emerald-600"></i>
            <p class="text-2xl font-bold text-emerald-600">${stats.recipe}</p>
          </div>
          <p class="text-xs text-gray-500">From Recipes</p>
        </div>
        <div class="text-center bg-white rounded-lg p-3 shadow-sm">
          <div class="flex items-center justify-center gap-2 mb-1">
            <i class="fa-solid fa-barcode text-teal-600"></i>
            <p class="text-2xl font-bold text-teal-600">${stats.scanner}</p>
          </div>
          <p class="text-xs text-gray-500">From Scanner</p>
        </div>
        <div class="text-center bg-white rounded-lg p-3 shadow-sm">
          <div class="flex items-center justify-center gap-2 mb-1">
            <i class="fa-solid fa-clipboard-list text-blue-600"></i>
            <p class="text-2xl font-bold text-blue-600">${stats.total}</p>
          </div>
          <p class="text-xs text-gray-500">Total Meals</p>
        </div>
      </div>
    </div>
  `;

  const loggedItemsList = document.querySelector("#logged-items-list");
  const existingStats = document.querySelector(".meal-source-stats");
  if (existingStats) existingStats.remove();
  if (stats.total > 0 && loggedItemsList) {
    loggedItemsList.insertAdjacentHTML("beforebegin", statsHTML);
  }
}

// ============================================================================
// 📝 FOOD LOG DISPLAY
// ============================================================================

function displayFoodLog() {
  const foodLog = JSON.parse(localStorage.getItem("calories")) || [];
  const today = getTodayDate();
  const todayMeals = foodLog.filter((meal) => meal.data === today);

  updateProgressBars();
  displayMealSourceStats();

  // ✅ FIX 3: تحديث Weekly Overview تلقائياً مع كل تغيير
  renderWeeklyOverview();

  if (todayMeals.length === 0) {
    document.querySelector("#logged-items-list").innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
        <p class="font-medium">No meals logged today</p>
        <p class="text-sm">Add meals from the Meals page or scan products</p>
      </div>
    `;
    return;
  }

  const html = todayMeals
    .map((meal, index) => {
      const sourceIcon =
        meal.dataType === "Recipe"
          ? '<i class="fa-solid fa-utensils text-emerald-600"></i>'
          : '<i class="fa-solid fa-barcode text-teal-600"></i>';

      return `
      <div class="border-t border-gray-200 pt-4">
        <div class="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all">
          <div class="flex items-center gap-4">
            <img src="${meal.thumbnail}" class="w-14 h-14 rounded-xl object-cover">
            <div>
              <div class="flex items-center gap-2">
                ${sourceIcon}
                <p class="font-semibold text-gray-900">${meal.name}</p>
              </div>
              <div class="flex gap-3 mt-1 text-xs text-gray-400">
                <span>${meal.dataType === "Recipe" ? "From Recipe" : "From Scanner"}</span>
                <span>•</span>
                <span><i class="fa-solid fa-fire text-orange-400 mr-1"></i>${Math.round(meal.type.calories)} kcal</span>
                <span>•</span>
                <span>P: ${Math.round(meal.type.protein)}g</span>
                <span>C: ${Math.round(meal.type.carbs)}g</span>
                <span>F: ${Math.round(meal.type.fat)}g</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="text-lg font-bold text-emerald-600">${Math.round(meal.type.calories)}</p>
              <p class="text-xs text-gray-500">kcal</p>
            </div>
            <button
              class="remove-foodlog-item text-gray-400 hover:text-red-500 p-2 transition-colors"
              data-index="${index}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  document.querySelector("#logged-items-list").innerHTML = html;
}

// ============================================================================
// 🗑️ DELETE MEAL
// ✅ FIX 1: event delegation صح - listener واحد بس على الـ parent
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const loggedItemsList = document.querySelector("#logged-items-list");

  if (loggedItemsList) {
    loggedItemsList.addEventListener("click", (e) => {
      const btn = e.target.closest(".remove-foodlog-item");
      if (!btn) return;

      const today = getTodayDate();
      const foodLog = JSON.parse(localStorage.getItem("calories")) || [];
      const todayMeals = foodLog.filter((meal) => meal.data === today);
      const allOtherMeals = foodLog.filter((meal) => meal.data !== today);

      const index = parseInt(btn.dataset.index);
      todayMeals.splice(index, 1);

      const updatedLog = [...allOtherMeals, ...todayMeals];
      localStorage.setItem("calories", JSON.stringify(updatedLog));

      displayFoodLog();
    });
  }

  // Clear all button
  const clearBtn = document.querySelector("#clear-foodlog");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      const today = getTodayDate();
      const foodLog = JSON.parse(localStorage.getItem("calories")) || [];
      const filtered = foodLog.filter((meal) => meal.data !== today);
      localStorage.setItem("calories", JSON.stringify(filtered));
      displayFoodLog();
    });
  }
});

// ============================================================================
// 🚀 INITIALIZATION
// ============================================================================

window.addEventListener("DOMContentLoaded", () => {
  checkAndResetDaily();
  displayFoodLog();
});

// ============================================================================
// HELPERS
// ============================================================================

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function formatDayName(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
}

function formatDayNumber(dateStr) {
  return new Date(dateStr).getDate();
}

// ============================================================================
// SIDEBAR
// ============================================================================

document.querySelector("#header-menu-btn").addEventListener("click", () => {
  document.querySelector("#sidebar").style.transform = "translate(0)";
});

document.querySelector("#sidebar-close-btn").addEventListener("click", closeSidebar);

function closeSidebar() {
  document.querySelector("#sidebar").style.transform = "translate(-100%)";
}

// ============================================================================
// AREAS & CATEGORIES
// ============================================================================

getAllAreas().then((data) => displayDataAreas(data));

function displayDataAreas(data) {
  let newData = data
    .map(
      (data) => `
      <button data-value='${data.name}' class="btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all">
        ${data.name}
      </button>
    `
    )
    .join(" ");
  document.querySelector("#btnAreas").innerHTML += newData;
}

let iconArr = [
  "fa-solid fa-drumstick-bite",
  "fa-solid fa-cake-candles",
  "fa-solid fa-bowl-rice",
  "fa-solid fa-bowl-food",
  "fa-solid fa-bacon",
  "fa-solid fa-fish",
  "fa-solid fa-plate-wheat",
  "fa-solid fa-utensils",
  "fa-solid fa-leaf",
  "fa-solid fa-seedling",
];

getAllCategories().then((data) => displayDataCat(data));

function displayDataCat(data) {
  let newData = data
    .map(
      (data, index) => `
      <div class="category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group" data-category="${data.name}">
        <div class="flex items-center gap-2.5">
          <div class="text-white w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <i class="${iconArr[index % iconArr.length]}"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900">${data.name}</h3>
          </div>
        </div>
      </div>
    `
    )
    .join(" ");
  document.querySelector("#categories-grid").innerHTML = newData;
}

// ============================================================================
// MEALS
// ============================================================================

let allMeals = [];

// ✅ FIX 4: متغير لحالة العرض (grid أو list)
let currentView = "grid";

document.querySelector("#app-loading-overlay").classList.remove("loading");

getAllMeals()
  .then((data) => {
    allMeals = data;
    displayDataMeals(data);
  })
  .catch((error) => console.log(error))
  .finally(() => {
    document.querySelector("#app-loading-overlay").classList.add("loading");
  });

function displayDataMeals(data) {
  const grid = document.querySelector("#recipes-grid");

  if (currentView === "grid") {
    // Grid View - 4 columns
    grid.className = "grid grid-cols-4 gap-5";
    grid.innerHTML = data
      .map(
        (item) => `
        <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-meal-id="${item.id}">
          <div class="relative h-48 overflow-hidden">
            <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${item.thumbnail}" alt="${item.name}" loading="lazy" />
            <div class="absolute bottom-3 left-3 flex gap-2">
              <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">${item.category}</span>
              <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">${item.area}</span>
            </div>
          </div>
          <div class="p-4">
            <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${item.name}</h3>
            <p class="text-xs text-gray-600 mb-3 line-clamp-2">${item.instructions}</p>
            <div class="flex items-center justify-between text-xs">
              <span class="font-semibold text-gray-900"><i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${item.category}</span>
              <span class="font-semibold text-gray-500"><i class="fa-solid fa-globe text-blue-500 mr-1"></i>${item.area}</span>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  } else {
    // List View - full width rows
    grid.className = "flex flex-col gap-3";
    grid.innerHTML = data
      .map(
        (item) => `
        <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group flex items-center gap-4 p-3" data-meal-id="${item.id}">
          <div class="relative w-28 h-20 overflow-hidden rounded-lg flex-shrink-0">
            <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${item.thumbnail}" alt="${item.name}" loading="lazy" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">${item.category}</span>
              <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">${item.area}</span>
            </div>
            <h3 class="text-base font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">${item.name}</h3>
            <p class="text-xs text-gray-500 line-clamp-1 mt-0.5">${item.instructions}</p>
          </div>
          <div class="flex-shrink-0 pr-2">
            <i class="fa-solid fa-chevron-right text-gray-400 group-hover:text-emerald-600 transition-colors"></i>
          </div>
        </div>
      `
      )
      .join("");
  }

  document.querySelector("#recipes-count").innerHTML = `Showing ${data.length} recipes`;
}

// ✅ FIX 4: Grid/List Toggle - الزراير بتشتغل
const gridViewBtn = document.querySelector("#grid-view-btn");
const listViewBtn = document.querySelector("#list-view-btn");

gridViewBtn.addEventListener("click", () => {
  currentView = "grid";

  // تحديث شكل الزراير
  gridViewBtn.className = "px-3 py-1.5 bg-white rounded-md shadow-sm";
  listViewBtn.className = "px-3 py-1.5";
  gridViewBtn.querySelector("i").className = "fa-solid fa-table-cells text-gray-700";
  listViewBtn.querySelector("i").className = "fa-solid fa-list text-gray-500";

  displayDataMeals(allMeals);
});

listViewBtn.addEventListener("click", () => {
  currentView = "list";

  // تحديث شكل الزراير
  listViewBtn.className = "px-3 py-1.5 bg-white rounded-md shadow-sm";
  gridViewBtn.className = "px-3 py-1.5";
  listViewBtn.querySelector("i").className = "fa-solid fa-list text-gray-700";
  gridViewBtn.querySelector("i").className = "fa-solid fa-table-cells text-gray-500";

  displayDataMeals(allMeals);
});

// ============================================================================
// RECIPE DETAILS
// ============================================================================

let recipes = document.querySelector("#recipes-grid");
recipes.addEventListener("click", function (e) {
  const card = e.target.closest(".recipe-card");
  if (!card) return;
  const details = card.dataset.mealId;
  detailsItem(details);

  document.querySelector("#meal-details").style.display = "block";
  document.querySelector("#search-filters-section").style.display = "none";
  document.querySelector("#meal-categories-section").style.display = "none";
  document.querySelector("#all-recipes-section").style.display = "none";
});

let arrDetails = [];

function detailsItem(details) {
  getDetailsItemById(details).then((data) => {
    displayDetails(data);
    return arrDetails.push(data);
  });
}

function displayDetails(data) {
  let detailsResp = `
  <div class="max-w-7xl mx-auto">
    <button id="back-to-meals-btn" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors">
      <i class="fa-solid fa-arrow-left"></i>
      <span>Back to Recipes</span>
    </button>
    <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
      <div class="relative h-80 md:h-96">
        <img src="${data.thumbnail}" alt="${data.name}" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-8">
          <div class="flex items-center gap-3 mb-3">
            <span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${data.category}</span>
            <span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${data.area}</span>
            ${data.tags ? `<span class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full">${data.tags}</span>` : ""}
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">${data.name}</h1>
          <div class="flex items-center gap-6 text-white/90">
            <span class="flex items-center gap-2"><i class="fa-solid fa-clock"></i><span>30 min</span></span>
            <span class="flex items-center gap-2"><i class="fa-solid fa-utensils"></i><span id="hero-servings">4 servings</span></span>
            <span class="flex items-center gap-2"><i class="fa-solid fa-fire"></i><span id="hero-calories">Loading...</span></span>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-wrap gap-3 mb-8">
      <button id="log-meal-btn" class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all" data-meal-id="${data.id}">
        <i class="fa-solid fa-clipboard-list"></i><span>Log This Meal</span>
      </button>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-8">
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i class="fa-solid fa-list-check text-emerald-600"></i>Ingredients
            <span class="text-sm font-normal text-gray-500 ml-auto">${data.ingredients.length} items</span>
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${data.ingredients
              .map(
                (ing) => `
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
                <span class="text-gray-700"><span class="font-medium text-gray-900">${ing.measure}</span> ${ing.ingredient}</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i class="fa-solid fa-shoe-prints text-emerald-600"></i>Instructions
          </h2>
          <div class="space-y-4">
            ${data.instructions
              .map(
                (ins, idx) => `
              <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">${idx + 1}</div>
                <p class="text-gray-700 leading-relaxed pt-2">${ins}</p>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i class="fa-solid fa-video text-red-500"></i>Video Tutorial
          </h2>
          <div class="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
            <iframe src="${data.youtube}" class="absolute inset-0 w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;" allowfullscreen></iframe>
          </div>
        </div>
      </div>
      <div class="space-y-6" id="rightColumn">
        <div class="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center h-48">
          <div class="text-center text-gray-400">
            <i class="fa-solid fa-spinner fa-spin text-3xl mb-3 text-emerald-500"></i>
            <p class="text-sm">Analyzing nutrition...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;

  document.querySelector("#meal-details").innerHTML = detailsResp;

  getCalories(data.ingredients).then((mergedData) => {
    window.currentMeal = mergedData;
  });

  document.querySelector("#back-to-meals-btn").addEventListener("click", back);
  document.querySelector("#log-meal-btn").addEventListener("click", () => {
    if (!window.currentMeal) {
      Swal.fire({ icon: "warning", title: "Still loading nutrition data, please wait a moment.", timer: 2000, showConfirmButton: false });
      return;
    }
    logMeals(window.currentMeal);
    displayFoodLog();
  });
}

function back() {
  document.querySelector("#meal-details").style.display = "none";
  document.querySelector("#search-filters-section").style.display = "block";
  document.querySelector("#meal-categories-section").style.display = "block";
  document.querySelector("#all-recipes-section").style.display = "block";
}

async function getCalories(data) {
  let rightData = data.map((ing) => `${ing.measure} ${ing.ingredient}`);
  const result = await analyzeRecipe(rightData);
  displayRightColumn(result);
  return { ...arrDetails[arrDetails.length - 1], ...result };
}

// ============================================================================
// LOG MEAL (RECIPE)
// ✅ FIX 1: الوجبة بتتضاف مرة واحدة بس - مش بتتكرر
// ============================================================================

function logMeals(data) {
  document.querySelector("#log-meal-modal").classList.remove("hidden");
  const { calories, protein, carbs, fat } = data.perServing;
  const { name, id, category, thumbnail } = data;

  const objData = {
    name,
    meal_id: id,
    category,
    thumbnail,
    dataType: "Recipe",
    type: { calories, protein, carbs, fat },
    data: getTodayDate(),
  };

  // ✅ FIX: بنحفظ الأكل مرة واحدة بس هنا ومش بنحفظه تاني في confirm
  const storedMeals = JSON.parse(localStorage.getItem("calories")) || [];
  storedMeals.push(objData);
  localStorage.setItem("calories", JSON.stringify(storedMeals));

  displayModel(data);
}

function displayModel(data) {
  let modelMarkup = `
  <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
    <div class="flex items-center gap-4 mb-6">
      <img src="${data.thumbnail}" alt="${data.name}" class="w-16 h-16 rounded-xl object-cover" />
      <div>
        <h3 class="text-xl font-bold text-gray-900">Meal Logged!</h3>
        <p class="text-gray-500 text-sm">${data.name}</p>
      </div>
    </div>
    <div class="bg-emerald-50 rounded-xl p-4 mb-6">
      <p class="text-sm text-gray-600 mb-3">Nutrition added to your log:</p>
      <div class="grid grid-cols-4 gap-2 text-center">
        <div><p class="text-lg font-bold text-emerald-600">${Math.round(data.perServing.calories)}</p><p class="text-xs text-gray-500">Calories</p></div>
        <div><p class="text-lg font-bold text-blue-600">${Math.round(data.perServing.protein)}g</p><p class="text-xs text-gray-500">Protein</p></div>
        <div><p class="text-lg font-bold text-amber-600">${Math.round(data.perServing.carbs)}g</p><p class="text-xs text-gray-500">Carbs</p></div>
        <div><p class="text-lg font-bold text-purple-600">${Math.round(data.perServing.fat)}g</p><p class="text-xs text-gray-500">Fat</p></div>
      </div>
    </div>
    <div class="flex gap-3">
      <button id="cancel-log-meal" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
        <i class="fa-solid fa-xmark mr-2"></i>Close
      </button>
      <button id="go-to-log-btn" class="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all">
        <i class="fa-solid fa-clipboard-list mr-2"></i>View Log
      </button>
    </div>
  </div>
  `;

  document.querySelector("#log-meal-modal").innerHTML = modelMarkup;

  document.querySelector("#cancel-log-meal").addEventListener("click", () => {
    document.querySelector("#log-meal-modal").classList.add("hidden");
    displayFoodLog();
  });

  document.querySelector("#go-to-log-btn").addEventListener("click", () => {
    document.querySelector("#log-meal-modal").classList.add("hidden");
    // الانتقال لصفحة الـ food log
    const logLink = document.querySelector('nav li a[data-name="log"]');
    if (logLink) logLink.click();
  });
}

function displayRightColumn(result) {
  let el = result.perServing;
  const total = el.protein + el.carbs + el.fat + el.fiber + el.sugar || 1;

  const heroCalories = document.querySelector("#hero-calories");
  if (heroCalories) heroCalories.innerHTML = `${Math.round(el.calories)} cal/serving`;

  let rightData = `
  <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
    <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
      <i class="fa-solid fa-chart-pie text-emerald-600"></i>Nutrition Facts
    </h2>
    <div id="nutrition-facts-container">
      <p class="text-sm text-gray-500 mb-4">Per serving</p>
      <div class="text-center py-4 mb-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
        <p class="text-sm text-gray-600">Calories per serving</p>
        <p class="text-4xl font-bold text-emerald-600">${Math.round(el.calories)}</p>
        <p class="text-xs text-gray-500 mt-1">Total: ${Math.round(result.totals.calories)} cal</p>
      </div>
      <div class="space-y-4">
        ${[
          { key: "protein", label: "Protein", color: "emerald" },
          { key: "carbs", label: "Carbs", color: "blue" },
          { key: "fat", label: "Fat", color: "purple" },
          { key: "fiber", label: "Fiber", color: "orange" },
          { key: "sugar", label: "Sugar", color: "pink" },
        ]
          .map(
            ({ key, label, color }) => `
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-${color}-500"></div>
              <span class="text-gray-700">${label}</span>
            </div>
            <span class="font-bold text-gray-900">${Math.round(el[key])}g</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-${color}-500 h-2 rounded-full" style="width: ${Math.min((el[key] / total) * 100, 100)}%"></div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  </div>
  `;

  const rightColumn = document.querySelector("#rightColumn");
  if (rightColumn) rightColumn.innerHTML = rightData;
}

// ============================================================================
// NAV LINKS
// ============================================================================

var allBtn = document.querySelectorAll("nav li a");
var containerAllSection = Array.from(document.querySelectorAll(".min-h-screen"));

allBtn.forEach(function (btn) {
  btn.addEventListener("click", function () {
    var getAttr = btn.getAttribute("data-name");
    containerAllSection.forEach(function (section) {
      var getAttrSection = section.getAttribute("data-section");
      if (getAttrSection === getAttr) {
        section.classList.remove("hidden");
        if (getAttr === "log") displayFoodLog();
      } else {
        section.classList.add("hidden");
      }
    });
  });
});

// ============================================================================
// FILTER BY CATEGORY & AREA
// ============================================================================

document.querySelector("#categories-grid").addEventListener("click", function (e) {
  const card = e.target.closest(".category-card");
  if (!card) return;
  filterByCategory(card.dataset.category);
});

function filterByCategory(category) {
  getAllMeals(category).then((data) => {
    allMeals = data;
    displayDataMeals(data);
  });
}

document.querySelector("#btnAreas").addEventListener("click", function (e) {
  const btn = e.target.closest(".btn");
  if (!btn) return;
  filterByAreas(btn.dataset.value);
});

function filterByAreas(areas) {
  getDataArea(areas).then((data) => {
    allMeals = data;
    displayDataMeals(data);
  });
}

// ============================================================================
// SEARCH
// ============================================================================

let searchInput = document.querySelector("#search-input");
searchInput.addEventListener("keyup", () => {
  const value = searchInput.value.toLowerCase();
  const result = allMeals.filter((item) => item.name.toLowerCase().includes(value));
  displayDataMeals(result);
});

// ============================================================================
// SCANNER
// ✅ FIX 2: الـ scannerData بيتحفظ صح وفلتر الـ grade بيشتغل
// ============================================================================

// ✅ متغير global للـ scannerData - بيكون accessible في كل مكان
let scannerData = [];

// document.querySelector("#search-product-btn").addEventListener("click", function () {
//   let input = document.querySelector("#product-search-input").value;
//   if (!input.trim()) return;

//   getProductSearch(input).then((data) => {
//     // ✅ FIX: بنحفظ الداتا في المتغير الصح
//     scannerData = data;
//     displayDataScanner(data);
//     document.querySelector("#products-count").textContent = `${data.length} products found`;
//     document.querySelector("#products-count").classList.remove("hidden");
//   });
// });

document.querySelector("#search-product-btn").addEventListener("click", async function () {
  let input = document.querySelector("#product-search-input").value;
  if (!input.trim()) return;

  const container = document.querySelector("#products-grid");

  // ✅ Loading
  container.innerHTML = `
    <div class="flex justify-center py-6">
      <div class="animate-spin h-6 w-6 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
    </div>
  `;

  try {
    const data = await getProductSearch(input);

    // ✅ فيه بيانات
    scannerData = data;
    displayDataScanner(data);

    document.querySelector("#products-count").textContent = `${data.length} products found`;
    document.querySelector("#products-count").classList.remove("hidden");

  } catch (error) {
    console.log(error);

    // ❌ API وقع
    container.innerHTML = `
      <p class="text-center text-red-500 py-6">
        Please try again 😥
      </p>
    `;
  }
});

// Enter key في الـ search
document.querySelector("#product-search-input").addEventListener("keyup", (e) => {
  if (e.key === "Enter") document.querySelector("#search-product-btn").click();
});

document.querySelector("#lookup-barcode-btn").addEventListener("click", async function () {
  let barcodeInput = document.querySelector("#barcode-input").value;
  if (!barcodeInput.trim()) return;

  const container = document.querySelector("#products-grid");

  // Loading
  container.innerHTML = `
    <div class="flex justify-center py-6">
      <div class="animate-spin h-6 w-6 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
    </div>
  `;

  try {
    const data = await getProductByBarcode(barcodeInput);

    if (!data) {
      container.innerHTML = `
        <p class="text-center text-gray-500 py-6">
          Product not found 😥
        </p>
      `;
      return;
    }

    scannerData = [data];
    displayDataScanner([data]);

  } catch (error) {
    console.log(error);

    container.innerHTML = `
      <p class="text-center text-red-500 py-6">
        Please try again 😥
      </p>
    `;
  }
});

// Enter key في الـ barcode
document.querySelector("#barcode-input").addEventListener("keyup", (e) => {
  if (e.key === "Enter") document.querySelector("#lookup-barcode-btn").click();
});

async function init() {
  try {
    const data = await getCategory();
    displayCategoryButton(data);
  } catch (error) {
    console.log(error);

    document.querySelector("#product-categories").innerHTML = `
      <p class="text-gray-600 text-center">
       There's a problem with the server 😥 Please try again in a little while
      </p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", init);

function displayCategoryButton(data) {
  console.log(data);
  let category = data
    .map(
      (el) => `
      <button class="product-category-btn px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-emerald-200 transition-all" data-btn-category="${el.name}">
        <i class="fa-solid fa-cookie mr-1.5">${el.name}</i>
      </button>
    `
    )
    .join("");
  document.querySelector("#product-categories").innerHTML = category;

  document.querySelectorAll(".product-category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      categoryMeals(btn.getAttribute("data-btn-category")).then((data) => {
        // ✅ FIX: تحديث scannerData عند اختيار category
        scannerData = data;
        displayDataScanner(data);
      });
    });
  });
}

function displayDataScanner(data) {
  if (!data || data.length === 0) {
    document.querySelector("#products-grid").innerHTML = `
      <div class="col-span-4 flex flex-col items-center justify-center py-12 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
        </div>
        <p class="text-gray-500 text-lg">No products found</p>
        <p class="text-gray-400 text-sm mt-2">Try searching for something else</p>
      </div>
    `;
    return;
  }

  let dataSearch = data
    .map(
      (el) => `
      <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-barcode="${el.barcode}">
        <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" src="${el.image}" alt="${el.name}" loading="lazy" />
          <div class="absolute top-2 left-2 ${getNutriScoreBg(el.nutritionGrade)} text-white text-xs font-bold px-2 py-1 rounded uppercase">
            ${el.nutritionGrade ? el.nutritionGrade.toUpperCase() : "?"}
          </div>
          ${el.novaGroup ? `<div class="absolute top-2 right-2 bg-lime-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" title="NOVA ${el.novaGroup}">${el.novaGroup}</div>` : ""}
        </div>
        <div class="p-4">
          <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${el.brand || "Unknown Brand"}</p>
          <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">${el.name}</h3>
          <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span><i class="fa-solid fa-fire mr-1"></i>${el.nutrients?.calories || 0} kcal/100g</span>
          </div>
          <div class="grid grid-cols-4 gap-1 text-center">
            <div class="bg-emerald-50 rounded p-1.5"><p class="text-xs font-bold text-emerald-700">${el.nutrients?.protein || 0}g</p><p class="text-[10px] text-gray-500">Protein</p></div>
            <div class="bg-blue-50 rounded p-1.5"><p class="text-xs font-bold text-blue-700">${el.nutrients?.carbs || 0}g</p><p class="text-[10px] text-gray-500">Carbs</p></div>
            <div class="bg-purple-50 rounded p-1.5"><p class="text-xs font-bold text-purple-700">${el.nutrients?.fat || 0}g</p><p class="text-[10px] text-gray-500">Fat</p></div>
            <div class="bg-orange-50 rounded p-1.5"><p class="text-xs font-bold text-orange-700">${el.nutrients?.sugar || 0}g</p><p class="text-[10px] text-gray-500">Sugar</p></div>
          </div>
        </div>
      </div>
    `
    )
    .join("");

  document.querySelector("#products-grid").innerHTML = dataSearch;

  // ✅ FIX 1: بنستخدم event delegation بدل ما نضيف listener جديد كل مرة
  // الـ listener الأساسي موجود بره الدالة دي
}

// ✅ FIX 1: listener واحد بس على products-grid - مش بيتضاف مرة تاني
document.querySelector("#products-grid").addEventListener("click", function (e) {
  const card = e.target.closest(".product-card");
  if (!card) return;

  // ✅ FIX: بندور على المنتج في الـ scannerData الحالي
  const product = scannerData.find((item) => item.barcode === card.dataset.barcode);
  if (!product) return;

  displayDetailsScanner(product);
  document.querySelector("#product-detail-modal").classList.remove("hidden");
});

function getNutriScoreBg(grade) {
  const colors = { a: "bg-green-600", b: "bg-lime-500", c: "bg-yellow-500", d: "bg-orange-500", e: "bg-red-600" };
  return colors[(grade || "").toLowerCase()] || "bg-gray-400";
}

function displayDetailsScanner(data) {
  let detailsMarkup = `
  <div class="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
    <div class="p-6">
      <div class="flex items-start gap-6 mb-6">
        <div class="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
          <img src="${data.image}" alt="${data.name}" class="w-full h-full object-contain" />
        </div>
        <div class="flex-1">
          <p class="text-sm text-emerald-600 font-semibold mb-1">${data.brand || "Unknown Brand"}</p>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">${data.name}</h2>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: #03814120">
              <span class="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style="background-color: #038141">
                ${(data.nutritionGrade || "?").toUpperCase()}
              </span>
              <div><p class="text-xs font-bold" style="color: #038141">Nutri-Score</p></div>
            </div>
            ${data.novaGroup ? `
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: #ee810020">
              <span class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style="background-color: #ee8100">${data.novaGroup}</span>
              <div><p class="text-xs font-bold" style="color: #ee8100">NOVA</p></div>
            </div>` : ""}
          </div>
        </div>
        <button class="close-product-modal text-gray-400 hover:text-gray-600"><i class="fa-solid fa-xmark text-2xl"></i></button>
      </div>

      <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 mb-6 border border-emerald-200">
        <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <i class="fa-solid fa-chart-pie text-emerald-600"></i>Nutrition Facts
          <span class="text-sm font-normal text-gray-500">(per 100g)</span>
        </h3>
        <div class="text-center mb-4 pb-4 border-b border-emerald-200">
          <p class="text-4xl font-bold text-gray-900">${data.nutrients?.calories || 0}</p>
          <p class="text-sm text-gray-500">Calories</p>
        </div>
        <div class="grid grid-cols-4 gap-4">
          ${[
            { key: "protein", label: "Protein", color: "emerald" },
            { key: "carbs", label: "Carbs", color: "blue" },
            { key: "fat", label: "Fat", color: "purple" },
            { key: "sugar", label: "Sugar", color: "orange" },
          ]
            .map(
              ({ key, label, color }) => `
            <div class="text-center">
              <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div class="bg-${color}-500 h-2 rounded-full" style="width: 50%"></div>
              </div>
              <p class="text-lg font-bold text-${color}-600">${data.nutrients?.[key] || 0}g</p>
              <p class="text-xs text-gray-500">${label}</p>
            </div>
          `
            )
            .join("")}
        </div>
      </div>

      <div class="flex gap-3">
        <button class="add-product-to-log flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all">
          <i class="fa-solid fa-plus mr-2"></i>Log This Food
        </button>
        <button class="close-product-modal flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">Close</button>
      </div>
    </div>
  </div>
  `;

  document.querySelector("#product-detail-modal").innerHTML = detailsMarkup;

  document.querySelectorAll(".close-product-modal").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector("#product-detail-modal").classList.add("hidden");
    });
  });

  document.querySelector(".add-product-to-log").addEventListener("click", () => {
    logMealsScanner(data);
    displayFoodLog();
  });
}

function logMealsScanner(data) {
  const { calories, protein, carbs, fat } = data.nutrients;
  const { name, barcode, brand, image } = data;

  const objData = {
    name,
    barcode,
    brand,
    dataType: "Scanner",
    thumbnail: image,
    type: { calories, protein, carbs, fat },
    data: getTodayDate(),
  };

  const storedMeals = JSON.parse(localStorage.getItem("calories")) || [];
  storedMeals.push(objData);
  localStorage.setItem("calories", JSON.stringify(storedMeals));

  document.querySelector("#product-detail-modal").classList.add("hidden");

  Swal.fire({
    position: "center",
    icon: "success",
    title: "Product added to log!",
    showConfirmButton: false,
    timer: 1500,
  });
}

// ✅ FIX 2: فلتر الـ Nutri-Score - بيشتغل صح دلوقتي
document.querySelector("#grade").addEventListener("click", (e) => {
  const gradeEl = e.target.closest(".nutri-score-filter");
  if (!gradeEl) return;

  // تحديث شكل الزراير
  document.querySelectorAll(".nutri-score-filter").forEach((btn) => {
    btn.classList.remove("bg-emerald-600", "text-white");
    btn.classList.add("opacity-60");
  });
  gradeEl.classList.remove("opacity-60");
  gradeEl.classList.add("bg-emerald-600", "text-white");

  if (!scannerData.length) {
    Swal.fire({ icon: "info", title: "Search for products first!", timer: 1500, showConfirmButton: false });
    return;
  }

  const grade = gradeEl.dataset.grade.toLowerCase();

  // ✅ FIX: الفلتر بيشتغل على نفس الـ scannerData اللي اتحفظ
  const result = !grade
    ? scannerData
    : scannerData.filter((el) => (el.nutritionGrade || "").toLowerCase() === grade);

  displayDataScanner(result);
});

// ============================================================================
// WEEKLY OVERVIEW
// ✅ FIX 3: بيتحدث تلقائياً من displayFoodLog
// ============================================================================

function getWeeklyData() {
  const meals = JSON.parse(localStorage.getItem("calories")) || [];
  const today = new Date();
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayMeals = meals.filter((meal) => meal.data === dateStr);
    const calories = dayMeals.reduce((sum, meal) => sum + Number(meal.type.calories || 0), 0);

    days.push({
      date: dateStr,
      dayName: formatDayName(dateStr),
      dayNumber: formatDayNumber(dateStr),
      calories,
      items: dayMeals.length,
    });
  }

  return days;
}

function renderWeeklyOverview() {
  const container = document.getElementById("weekly-chart");
  if (!container) return;

  const days = getWeeklyData();
  const maxCalories = Math.max(...days.map((d) => d.calories), 2000);

  container.innerHTML = `
    <div class="w-full h-full flex items-end justify-around gap-2 px-4 pb-2">
      ${days
        .map((day) => {
          const isToday = day.date === todayDate();
          const heightPercent = day.calories > 0 ? Math.max((day.calories / maxCalories) * 100, 5) : 0;

          return `
          <div class="flex flex-col items-center gap-1 flex-1">
            <span class="text-xs font-semibold ${isToday ? "text-emerald-600" : "text-gray-500"}">${Math.round(day.calories) || ""}</span>
            <div class="w-full relative" style="height: 140px;">
              <div
                class="absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${isToday ? "bg-emerald-500" : "bg-emerald-200"}"
                style="height: ${heightPercent}%"
              ></div>
            </div>
            <p class="text-xs font-medium ${isToday ? "text-emerald-600 font-bold" : "text-gray-500"}">${day.dayName}</p>
            <p class="text-xs text-gray-400">${day.dayNumber}</p>
            ${day.items > 0 ? `<p class="text-[10px] text-gray-400">${day.items} meals</p>` : ""}
          </div>
        `;
        })
        .join("")}
    </div>
  `;
}

// تشغيل أول مرة
renderWeeklyOverview();
