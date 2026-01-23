/**
 * NutriPlan - Main Entry Point
 *
 * This is the main entry point for the application.
 * Import your modules and initialize the app here.
 */

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

document.querySelector("#header-menu-btn").addEventListener("click", () => {
  document.querySelector("#sidebar").style.transform = "translate(0)";
});

document
  .querySelector("#sidebar-close-btn")
  .addEventListener("click", closeSidebar);
// document.querySelector("#main-content").addEventListener("click", closeSidebar);

function closeSidebar() {
  document.querySelector("#sidebar").style.transform = "translate(-100%)";
}

getAllAreas().then((data) => {
  displayDataAreas(data);
});

function displayDataAreas(data) {
  let newData = data
    .map((data) => {
      return `
    <button
        data-value='${data.name}'
        class="btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all"
    >
        ${data.name}
    </button>
    `;
    })
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

getAllCategories().then((data) => {
  displayDataCat(data);
});

function displayDataCat(data) {
  let newData = data
    .map(
      (data, index) => `
        <div
              class="category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group"
              data-category="${data.name}"
            >
              <div class="flex items-center gap-2.5">
                <div
                  class="text-white w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"
                >
                  <i class="${iconArr[index % iconArr.length]}"></i>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-900">${data.name}</h3>
                </div>
              </div>
            </div>
        `,
    )
    .join(" ");
  document.querySelector("#categories-grid").innerHTML = newData;
}

let allMeals = [];
document.querySelector("#app-loading-overlay").classList.remove("loading");
getAllMeals()
  .then((data) => {
    allMeals = data;
    displayDataMeals(data);
  })
  .catch((error) => {
    console.log(error);
  })
  .finally(() => {
    document.querySelector("#app-loading-overlay").classList.add("loading");
    console.log("finally");
  });

function displayDataMeals(data) {
  let newData = data
    .map(
      (data) => `
          <div
                class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                data-meal-id="${data.id}"
              >
                <div class="relative h-48 overflow-hidden">
                  <img
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src="${data.thumbnail}"
                    alt="Teriyaki Chicken Casserole"
                    loading="lazy"
                  />
                  <div class="absolute bottom-3 left-3 flex gap-2">
                    <span
                      class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700"
                    >
                      ${data.category}
                    </span>
                    <span
                      class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white"
                    >
                      ${data.area}
                    </span>
                  </div>
                </div>
                <div class="p-4">
                  <h3
                    class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1"
                  >
                    ${data.name}
                  </h3>
                  <p class="text-xs text-gray-600 mb-3 line-clamp-2">
                    ${data.instructions}
                  </p>
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-semibold text-gray-900">
                      <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
                      ${data.category}
                    </span>
                    <span class="font-semibold text-gray-500">
                      <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
                      ${data.area}
                    </span>
                  </div>
                </div>
              </div>
          `,
    )
    .join(" ");
  document.querySelector("#recipes-grid").innerHTML = newData;
  document.querySelector("#recipes-count").innerHTML =
    `Showing ${data.length} recipes`;
}

let recipes = document.querySelector("#recipes-grid");

recipes.addEventListener("click", function (e) {
  const card = e.target.closest(".recipe-card");
  if (!card) return;
  const details = card.dataset.mealId;
  detailsItem(details);
  console.log(details);

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
          <!-- Back Button -->
          <button
            id="back-to-meals-btn"
            class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors"
          >
            <i class="fa-solid fa-arrow-left"></i>
            <span>Back to Recipes</span>
          </button>

          <!-- Hero Section -->
          <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div class="relative h-80 md:h-96">
              <img
                src="${data.thumbnail}"
                alt="Teriyaki Chicken Casserole"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
              ></div>
              <div class="absolute bottom-0 left-0 right-0 p-8">
                <div class="flex items-center gap-3 mb-3">
                  <span
                    class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full"
                    >${data.category}</span
                  >
                  <span
                    class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full"
                    >${data.area}</span
                  >
                  ${
                    data.tags
                      ? `<span
                    class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full"
                    >${data.tags}</span
                  >`
                      : ""
                  }
                  
                </div>
                <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
                  ${data.name}
                </h1>
                <div class="flex items-center gap-6 text-white/90">
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-clock"></i>
                    <span>30 min</span>
                  </span>
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-utensils"></i>
                    <span id="hero-servings">4 servings</span>
                  </span>
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-fire"></i>
                    <span id="hero-calories"></span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-3 mb-8">
            <button
              id="log-meal-btn"
              class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
              data-meal-id="${data.id}"
            >
              <i class="fa-solid fa-clipboard-list"></i>
              <span>Log This Meal</span>
            </button>
          </div>
          

          
          
          <!-- Main Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Column - Ingredients & Instructions -->
            <div class="lg:col-span-2 space-y-8">
              <!-- Ingredients -->
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <h2
                  class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
                >
                  <i class="fa-solid fa-list-check text-emerald-600"></i>
                  Ingredients
                  <span class="text-sm font-normal text-gray-500 ml-auto"
                    >${data.ingredients.length} items</span
                  >
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${data.ingredients
                  .map(
                    (ing) => `
                <div
                  class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300"
                  />
                  <span class="text-gray-700">
                    <span class="font-medium text-gray-900">${ing.measure}</span> ${ing.ingredient}
                  </span>
                </div>
                `,
                  )
                  .join(" ")}
                </div>
              </div>

              <!-- Instructions -->
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <h2
                  class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
                >
                  <i class="fa-solid fa-shoe-prints text-emerald-600"></i>
                  Instructions
                </h2>
                <div class="space-y-4">
                ${data.instructions
                  .map(
                    (ins) => `
                <div
                  class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div
                    class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0"
                  >
                    ${data.instructions.length}
                  </div>
                  <p class="text-gray-700 leading-relaxed pt-2">
                    ${ins}
                  </p>
                </div>
                
                `,
                  )
                  .join(" ")}
                </div>
              </div>

              <!-- Video Section -->
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <h2
                  class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
                >
                  <i class="fa-solid fa-video text-red-500"></i>
                  Video Tutorial
                </h2>
                <div
                  class="relative aspect-video rounded-xl overflow-hidden bg-gray-100"
                >
                  <iframe
                    src="${data.youtube}"
                    class="absolute inset-0 w-full h-full"
                    frameborder="0"
                    allow="
                      accelerometer;
                      autoplay;
                      clipboard-write;
                      encrypted-media;
                      gyroscope;
                      picture-in-picture;
                    "
                    allowfullscreen
                  >
                  </iframe>
                </div>
              </div>
            </div>

            <!-- Right Column - Nutrition -->
            <div class="space-y-6" id="rightColumn"></div>
  `;

  document.querySelector("#meal-details").innerHTML = detailsResp;
  // document.querySelector("#spinner").classList.remove("hidden");
  getCalories(data.ingredients)
    .then((mergedData) => {
      window.currentMeal = mergedData;
    })
    .finally(() => {
      // document.querySelector("#spinner").classList.add("hidden");
    });
  document.querySelector("#back-to-meals-btn").addEventListener("click", back);
  document.querySelector("#log-meal-btn").addEventListener("click", () => {
    logMeals(window.currentMeal);
  });
}

// back to section one
function back() {
  document.querySelector("#meal-details").style.display = "none";
  document.querySelector("#search-filters-section").style.display = "block";
  document.querySelector("#meal-categories-section").style.display = "block";
  document.querySelector("#all-recipes-section").style.display = "block";
  console.log("im back 😉");
}

// get calories right column
async function getCalories(data) {
  let rightData = data.map((ing) => `${ing.measure} ${ing.ingredient}`);
  const result = await analyzeRecipe(rightData);

  displayRightColumn(result);

  return { ...arrDetails[0], ...result };
}

function logMeals(data) {
  document.querySelector("#log-meal-modal").classList.remove("hidden");
  const { calories, protein, carbs, fat } = data.perServing;
  const { name, id, category, thumbnail } = data;
  const objData = {
    name: name,
    meal_id: id,
    category: category,
    thumbnail: thumbnail,
    dataType: "Recipe",
    type: {
      calories,
      protein,
      carbs,
      fat,
    },
    data: getTodayDate(),
  };
  console.log(new Date());
  const storedMeals = JSON.parse(localStorage.getItem("calories")) || [];
  storedMeals.push(objData);
  localStorage.setItem("calories", JSON.stringify(storedMeals));
  displayModel(data);
}

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function displayModel(data) {
  let modelMarkup = `
  <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div class="flex items-center gap-4 mb-6">
          <img
            src="${data.thumbnail}"
            alt="Sticky Chicken"
            class="w-16 h-16 rounded-xl object-cover"
          />
          <div>
            <h3 class="text-xl font-bold text-gray-900">Log This Meal</h3>
            <p class="text-gray-500 text-sm">${data.name}</p>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-2"
            >Number of Servings</label
          >
          <div class="flex items-center gap-3">
            <button
              id="decrease-servings"
              class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <i class="text-gray-600" data-fa-i2svg=""
                ><svg
                  class="svg-inline--fa fa-minus"
                  data-prefix="fas"
                  data-icon="minus"
                  role="img"
                  viewBox="0 0 448 512"
                  aria-hidden="true"
                  data-fa-i2svg=""
                >
                  <path
                    fill="currentColor"
                    d="M0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32z"
                  ></path></svg
              ></i>
            </button>
            <input
              type="number"
              id="meal-servings"
              value="1"
              min="0.5"
              max="10"
              step="0.5"
              class="w-20 text-center text-xl font-bold border-2 border-gray-200 rounded-lg py-2"
            />
            <button
              id="increase-servings"
              class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <i class="text-gray-600" data-fa-i2svg=""
                ><svg
                  class="svg-inline--fa fa-plus"
                  data-prefix="fas"
                  data-icon="plus"
                  role="img"
                  viewBox="0 0 448 512"
                  aria-hidden="true"
                  data-fa-i2svg=""
                >
                  <path
                    fill="currentColor"
                    d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"
                  ></path></svg
              ></i>
            </button>
          </div>
        </div>

        <div class="bg-emerald-50 rounded-xl p-4 mb-6">
          <p class="text-sm text-gray-600 mb-2">
            Estimated nutrition per serving:
          </p>
          <div class="grid grid-cols-4 gap-2 text-center">
            <div>
              <p class="text-lg font-bold text-emerald-600" id="modal-calories">
                ${data.perServing.calories}g
              </p>
              <p class="text-xs text-gray-500">Calories</p>
            </div>
            <div>
              <p class="text-lg font-bold text-blue-600" id="modal-protein">
                ${data.perServing.protein}g
              </p>
              <p class="text-xs text-gray-500">Protein</p>
            </div>
            <div>
              <p class="text-lg font-bold text-amber-600" id="modal-carbs">
                ${data.perServing.carbs}g
              </p>
              <p class="text-xs text-gray-500">Carbs</p>
            </div>
            <div>
              <p class="text-lg font-bold text-purple-600" id="modal-fat">
                ${data.perServing.fat}g
              </p>
              <p class="text-xs text-gray-500">Fat</p>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            id="cancel-log-meal"
            class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            id="confirm-log-meal"
            class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            <i class="mr-2" data-fa-i2svg=""
              ><svg
                class="svg-inline--fa fa-clipboard-list"
                data-prefix="fas"
                data-icon="clipboard-list"
                role="img"
                viewBox="0 0 384 512"
                aria-hidden="true"
                data-fa-i2svg=""
              >
                <path
                  fill="currentColor"
                  d="M311.4 32l8.6 0c35.3 0 64 28.7 64 64l0 352c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l8.6 0C83.6 12.9 104.3 0 128 0L256 0c23.7 0 44.4 12.9 55.4 32zM248 112c13.3 0 24-10.7 24-24s-10.7-24-24-24L136 64c-13.3 0-24 10.7-24 24s10.7 24 24 24l112 0zM128 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm32 0c0 13.3 10.7 24 24 24l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-112 0c-13.3 0-24 10.7-24 24zm0 128c0 13.3 10.7 24 24 24l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-112 0c-13.3 0-24 10.7-24 24zM96 416a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"
                ></path></svg
            ></i>
            Log Meal
          </button>
        </div>
      </div>
  `;
  document.querySelector("#log-meal-modal").innerHTML = modelMarkup;
  document
    .querySelector("#cancel-log-meal")
    .addEventListener("click", function () {
      document.querySelector("#log-meal-modal").classList.add("hidden");
    });
  document.querySelector("#confirm-log-meal").addEventListener("click", () => {
    let inputValue = document.querySelector("#meal-servings").value;
    confirm(inputValue, data.perServing.calories);
  });
}

function confirm(data, calories) {
  Swal.fire({
    position: "center",
    icon: "success",
    title: `servings ${data} and calories ${calories}`,
    showConfirmButton: false,
    timer: 1500,
  });
  document.querySelector("#log-meal-modal").classList.add("hidden");
}

// display calories right column
function displayRightColumn(result) {
  let el = result.perServing;
  const total = el.protein + el.carbs + el.fat + el.fiber + el.sugar;
  document.querySelector("#hero-calories").innerHTML =
    `${el.calories} cal/serving`;
  let rightData = `
  <!-- Nutrition Facts -->
  <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
    <h2
      class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
    >
      <i class="fa-solid fa-chart-pie text-emerald-600"></i>
      Nutrition Facts
    </h2>
    <div id="nutrition-facts-container">
      <p class="text-sm text-gray-500 mb-4">Per serving</p>

      <div
        class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl"
      >
        <p class="text-sm text-gray-600">
          Calories per serving
        </p>
        <p class="text-4xl font-bold text-emerald-600">${el.calories}</p>
        <p class="text-xs text-gray-500 mt-1">
          Total: ${result.totals.calories} cal
        </p>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div
              class="w-3 h-3 rounded-full bg-emerald-500"
            ></div>
            <span class="text-gray-700">Protein</span>
          </div>
          <span class="font-bold text-gray-900">${el.protein}g</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div
            class="bg-emerald-500 h-2 rounded-full"
            style="width: ${(el.protein / total) * 100}%"
          ></div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
            <span class="text-gray-700">Carbs</span>
          </div>
          <span class="font-bold text-gray-900">${el.carbs}g</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div
            class="bg-blue-500 h-2 rounded-full"
            style="width: ${(el.carbs / total) * 100}%"
          ></div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div
              class="w-3 h-3 rounded-full bg-purple-500"
            ></div>
            <span class="text-gray-700">Fat</span>
          </div>
          <span class="font-bold text-gray-900">${el.fat}g</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div
            class="bg-purple-500 h-2 rounded-full"
            style="width: ${(el.fat / total) * 100}%"
          ></div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div
              class="w-3 h-3 rounded-full bg-orange-500"
            ></div>
            <span class="text-gray-700">Fiber</span>
          </div>
          <span class="font-bold text-gray-900">${el.fiber}g</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div
            class="bg-orange-500 h-2 rounded-full"
            style="width: ${(el.fiber / total) * 100}%"
          ></div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-pink-500"></div>
            <span class="text-gray-700">Sugar</span>
          </div>
          <span class="font-bold text-gray-900">${el.sugar}g</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div
            class="bg-pink-500 h-2 rounded-full"
            style="width: ${(el.sugar / total) * 100}%"
          ></div>
        </div>
      </div>
      </div>
    </div>
  </div>
  `;
  document.querySelector("#rightColumn").innerHTML = rightData;
}

// nav links
var allBtn = document.querySelectorAll("nav li a");
var containerAllSection = Array.from(
  document.querySelectorAll(".min-h-screen"),
);

allBtn.forEach(function (btn) {
  btn.addEventListener("click", function () {
    var getAttr = btn.getAttribute("data-name");
    console.log(getAttr);

    containerAllSection.filter(function (section) {
      var getAttrSection = section.getAttribute("data-section");
      console.log(getAttrSection);

      if (getAttrSection == getAttr) {
        section.classList.remove("hidden");
      } else {
        section.classList.add("hidden");
      }
    });
  });
});

// get dataset category عشان filter بيه
document
  .querySelector("#categories-grid")
  .addEventListener("click", function (e) {
    const card = e.target.closest(".category-card");
    if (!card) return;
    const category = card.dataset.category;
    filterByCategory(category);
  });

// filter category
function filterByCategory(category) {
  getAllMeals(category).then((data) => {
    allMeals = data;
    displayDataMeals(data);
  });
}

// get dataset areas عشان filter بيه
document.querySelector("#btnAreas").addEventListener("click", function (e) {
  const btn = e.target.closest(".btn");
  if (!btn) return;
  const areaValue = btn.dataset.value;

  filterByAreas(areaValue);
});

// filter areas
function filterByAreas(areas) {
  console.log("Filter by:", areas);
  getDataArea(areas).then((data) => {
    allMeals = data;
    displayDataMeals(data);
  });
}

let inputValue = document.querySelector("#search-input");
inputValue.addEventListener("keyup", () => {
  search(allMeals);
});

function search(data) {
  const value = inputValue.value.toLowerCase();

  const result = data.filter((item) => item.name.toLowerCase().includes(value));

  displayDataMeals(result);
}
/*------------------------Section product scanner------------------------------*/
let scannerData = [];
document
  .querySelector("#search-product-btn")
  .addEventListener("click", function () {
    let input = document.querySelector("#product-search-input").value;
    getProductSearch(input).then((data) => {
      scannerData = data;
      displayDataScanner(data);
    });
  });

document
  .querySelector("#lookup-barcode-btn")
  .addEventListener("click", function () {
    let barcodeInput = document.querySelector("#barcode-input").value;
    console.log(barcodeInput);

    getProductByBarcode(barcodeInput).then((data) => {
      displayDataScanner([data]);
    });
  });

getCategory().then((data) => {
  displayCategoryButton(data);
});

function displayCategoryButton(data) {
  let category = data
    .map(
      (el) => `
      <button
          class="product-category-btn px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-emerald-200 transition-all"
          data-btn-category="${el.name}"
        >
          <i class="fa-solid fa-cookie mr-1.5"></i>${el.name}
        </button>
    `,
    )
    .join(" ");
  document.querySelector("#product-categories").innerHTML = category;

  document.querySelectorAll(".product-category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      let attr = btn.getAttribute("data-btn-category");
      console.log(attr);
      categoryMeals(attr).then((data) => {
        displayDataScanner(data);
      });
    });
  });
}

function displayDataScanner(data) {
  let dataSearch = data
    .map(
      (el) => `
    <div
                  class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                  data-barcode="${el.barcode}"
                >
                  <div
                    class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden"
                  >
                    <img
                      class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      src="${el.image}"
                      alt="Product Name"
                      loading="lazy"
                    />

                    <!-- Nutri-Score Badge -->
                    <div
                      class="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded uppercase"
                    >
                      Nutri-Score ${el.nutritionGrade || "a"}
                    </div>

                    <!-- NOVA Badge -->
                    <div
                      class="absolute top-2 right-2 bg-lime-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                      title="NOVA 2"
                    >
                      ${el.novaGroup}
                    </div>
                  </div>

                  <div class="p-4">
                    <p
                      class="text-xs text-emerald-600 font-semibold mb-1 truncate"
                    >
                      ${el.brand}
                    </p>
                    <h3
                      class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors"
                    >
                      ${el.name}
                    </h3>

                    <div
                      class="flex items-center gap-3 text-xs text-gray-500 mb-3"
                    >
                      <span
                        ><i class="fa-solid fa-weight-scale mr-1"></i>250g</span
                      >
                      <span
                        ><i class="fa-solid fa-fire mr-1"></i>350
                        kcal/100g</span
                      >
                    </div>

                    <!-- Mini Nutrition -->
                    <div class="grid grid-cols-4 gap-1 text-center">
                      <div class="bg-emerald-50 rounded p-1.5">
                        <p class="text-xs font-bold text-emerald-700">${el.nutrients.protein}g</p>
                        <p class="text-[10px] text-gray-500">Protein</p>
                      </div>
                      <div class="bg-blue-50 rounded p-1.5">
                        <p class="text-xs font-bold text-blue-700">${el.nutrients.carbs}g</p>
                        <p class="text-[10px] text-gray-500">Carbs</p>
                      </div>
                      <div class="bg-purple-50 rounded p-1.5">
                        <p class="text-xs font-bold text-purple-700">${el.nutrients.fat}g</p>
                        <p class="text-[10px] text-gray-500">Fat</p>
                      </div>
                      <div class="bg-orange-50 rounded p-1.5">
                        <p class="text-xs font-bold text-orange-700">${el.nutrients.sugar}g</p>
                        <p class="text-[10px] text-gray-500">Sugar</p>
                      </div>
                    </div>
                  </div>
                </div>
    `,
    )
    .join(" ");
  document.querySelector("#products-grid").innerHTML = dataSearch;
  getDataDetails(data);
}

function getDataDetails(data) {
  document
    .querySelector("#products-grid")
    .addEventListener("click", function (e) {
      const card = e.target.closest(".product-card");
      if (!card) return;

      const barcode = card.dataset.barcode;

      const product = data.find((item) => item.barcode === barcode);

      displayDetailsScanner(product);
      document
        .querySelector("#product-detail-modal")
        .classList.remove("hidden");
    });
}

function displayDetailsScanner(data) {
  let detailsMarkup = `
  <div
        class="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div class="p-6">
          <!-- Header -->
          <div class="flex items-start gap-6 mb-6">
            <div
              class="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
            >
              <img
                src="${data.image}"
                alt="${data.name}"
                class="w-full h-full object-contain"
              />
            </div>
            <div class="flex-1">
              <p class="text-sm text-emerald-600 font-semibold mb-1">
                ${data.brand}
              </p>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">${data.name}</h2>
              <p class="text-sm text-gray-500 mb-3">430 g</p>

              <div class="flex items-center gap-3">
                <div
                  class="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style="background-color: #03814120"
                >
                  <span
                    class="w-8 h-8 rounded flex items-center justify-center text-white font-bold"
                    style="background-color: #038141"
                  >
                    ${data.nutritionGrade || "a"}
                  </span>
                  <div>
                    <p class="text-xs font-bold" style="color: #038141">
                      Nutri-Score
                    </p>
                    <p class="text-[10px] text-gray-600">Excellent</p>
                  </div>
                </div>

                <div
                  class="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style="background-color: #ee810020"
                >
                  <span
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                    style="background-color: #ee8100"
                  >
                    ${data.novaGroup || 4}
                  </span>
                  <div>
                    <p class="text-xs font-bold" style="color: #ee8100">NOVA</p>
                    <p class="text-[10px] text-gray-600">Processed</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              class="close-product-modal text-gray-400 hover:text-gray-600"
            >
              <i class="text-2xl" data-fa-i2svg=""
                ><svg
                  class="svg-inline--fa fa-xmark"
                  data-prefix="fas"
                  data-icon="xmark"
                  role="img"
                  viewBox="0 0 384 512"
                  aria-hidden="true"
                  data-fa-i2svg=""
                >
                  <path
                    fill="currentColor"
                    d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"
                  ></path></svg
              ></i>
            </button>
          </div>

          <!-- Nutrition Facts -->
          <div
            class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 mb-6 border border-emerald-200"
          >
            <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="text-emerald-600" data-fa-i2svg=""
                ><svg
                  class="svg-inline--fa fa-chart-pie"
                  data-prefix="fas"
                  data-icon="chart-pie"
                  role="img"
                  viewBox="0 0 576 512"
                  aria-hidden="true"
                  data-fa-i2svg=""
                >
                  <path
                    fill="currentColor"
                    d="M512.4 240l-176 0c-17.7 0-32-14.3-32-32l0-176c0-17.7 14.4-32.2 31.9-29.9 107 14.2 191.8 99 206 206 2.3 17.5-12.2 31.9-29.9 31.9zM222.6 37.2c18.1-3.8 33.8 11 33.8 29.5l0 197.3c0 5.6 2 11 5.5 15.3L394 438.7c11.7 14.1 9.2 35.4-6.9 44.1-34.1 18.6-73.2 29.2-114.7 29.2-132.5 0-240-107.5-240-240 0-115.5 81.5-211.9 190.2-234.8zM477.8 288l64 0c18.5 0 33.3 15.7 29.5 33.8-10.2 48.4-35 91.4-69.6 124.2-12.3 11.7-31.6 9.2-42.4-3.9L374.9 340.4c-17.3-20.9-2.4-52.4 24.6-52.4l78.2 0z"
                  ></path></svg
              ></i>
              Nutrition Facts
              <span class="text-sm font-normal text-gray-500">(per 100g)</span>
            </h3>

            <div class="text-center mb-4 pb-4 border-b border-emerald-200">
              <p class="text-4xl font-bold text-gray-900">${data.nutrients.calories}</p>
              <p class="text-sm text-gray-500">Calories</p>
            </div>

            <div class="grid grid-cols-4 gap-4">
              <div class="text-center">
                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    class="bg-emerald-500 h-2 rounded-full"
                    style="width: 23.6%"
                  ></div>
                </div>
                <p class="text-lg font-bold text-emerald-600">${data.nutrients.protein}g</p>
                <p class="text-xs text-gray-500">Protein</p>
              </div>
              <div class="text-center">
                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    class="bg-blue-500 h-2 rounded-full"
                    style="width: 68.4%"
                  ></div>
                </div>
                <p class="text-lg font-bold text-blue-600">${data.nutrients.carbs}g</p>
                <p class="text-xs text-gray-500">Carbs</p>
              </div>
              <div class="text-center">
                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    class="bg-purple-500 h-2 rounded-full"
                    style="width: 3.2461538461538457%"
                  ></div>
                </div>
                <p class="text-lg font-bold text-purple-600">${data.nutrients.fat}g</p>
                <p class="text-xs text-gray-500">Fat</p>
              </div>
              <div class="text-center">
                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    class="bg-orange-500 h-2 rounded-full"
                    style="width: 8.42%"
                  ></div>
                </div>
                <p class="text-lg font-bold text-orange-600">${data.nutrients.sugar}g</p>
                <p class="text-xs text-gray-500">Sugar</p>
              </div>
            </div>

            <div
              class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-emerald-200"
            >
              <div class="text-center">
                <p class="text-sm font-semibold text-gray-900">0.5g</p>
                <p class="text-xs text-gray-500">Saturated Fat</p>
              </div>
              <div class="text-center">
                <p class="text-sm font-semibold text-gray-900">10.0g</p>
                <p class="text-xs text-gray-500">Fiber</p>
              </div>
              <div class="text-center">
                <p class="text-sm font-semibold text-gray-900">0.26g</p>
                <p class="text-xs text-gray-500">Salt</p>
              </div>
            </div>
          </div>

          <!-- Additional Info -->

          <div class="bg-gray-50 rounded-xl p-5 mb-6">
            <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <i class="text-gray-600" data-fa-i2svg=""
                ><svg
                  class="svg-inline--fa fa-list"
                  data-prefix="fas"
                  data-icon="list"
                  role="img"
                  viewBox="0 0 512 512"
                  aria-hidden="true"
                  data-fa-i2svg=""
                >
                  <path
                    fill="currentColor"
                    d="M40 48C26.7 48 16 58.7 16 72l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24L40 48zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L192 64zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zM16 232l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0z"
                  ></path></svg
              ></i>
              Ingredients
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              Wholegrain Wheat (95%), Malted Barley Extract, Sugar, Salt,
              Niacin, Iron, Riboflavin (B2), Thiamin (B1), Folic Acid.
            </p>
          </div>

          <div class="bg-red-50 rounded-xl p-5 mb-6 border border-red-200">
            <h3 class="font-bold text-red-700 mb-2 flex items-center gap-2">
              <i data-fa-i2svg=""
                ><svg
                  class="svg-inline--fa fa-triangle-exclamation"
                  data-prefix="fas"
                  data-icon="triangle-exclamation"
                  role="img"
                  viewBox="0 0 512 512"
                  aria-hidden="true"
                  data-fa-i2svg=""
                >
                  <path
                    fill="currentColor"
                    d="M256 0c14.7 0 28.2 8.1 35.2 21l216 400c6.7 12.4 6.4 27.4-.8 39.5S486.1 480 472 480L40 480c-14.1 0-27.2-7.4-34.4-19.5s-7.5-27.1-.8-39.5l216-400c7-12.9 20.5-21 35.2-21zm0 352a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm0-192c-18.2 0-32.7 15.5-31.4 33.7l7.4 104c.9 12.5 11.4 22.3 23.9 22.3 12.6 0 23-9.7 23.9-22.3l7.4-104c1.3-18.2-13.1-33.7-31.4-33.7z"
                  ></path></svg
              ></i>
              Allergens
            </h3>
            <p class="text-sm text-red-600">en:gluten</p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              class="add-product-to-log flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
              data-barcode="${data.barcode}"
            >
              <i class="mr-2" data-fa-i2svg=""
                ><svg
                  class="svg-inline--fa fa-plus"
                  data-prefix="fas"
                  data-icon="plus"
                  role="img"
                  viewBox="0 0 448 512"
                  aria-hidden="true"
                  data-fa-i2svg=""
                >
                  <path
                    fill="currentColor"
                    d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"
                  ></path></svg></i
              >Log This Food
            </button>
            <button
              class="close-product-modal flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
  `;
  document.querySelector("#product-detail-modal").innerHTML = detailsMarkup;

  // filterByNutritionGrade(data);
  document
    .querySelector(".close-product-modal")
    .addEventListener("click", closeModelScanner);

  document
    .querySelector(".add-product-to-log")
    .addEventListener("click", () => {
      logMealsScanner(data);
    });
}

function logMealsScanner(data) {
  const { calories, protein, carbs, fat } = data.nutrients;
  const { name, barcode, brand, image } = data;
  const objData = {
    name: name,
    barcode: barcode,
    brand: brand,
    dataType: "Scanner",
    thumbnail: image,
    type: {
      calories,
      protein,
      carbs,
      fat,
    },
    data: getTodayDate(),
  };
  const storedMeals = JSON.parse(localStorage.getItem("calories")) || [];
  storedMeals.push(objData);
  localStorage.setItem("calories", JSON.stringify(storedMeals));
  document.querySelector("#product-detail-modal").classList.add("hidden");
}

document.querySelector("#grade").addEventListener("click", (e) => {
  const gradeEl = e.target.closest(".nutri-score-filter");
  if (!gradeEl) return;

  if (!scannerData.length) {
    console.warn("No data yet");
    return;
  }

  const grade = gradeEl.dataset.grade.toLowerCase();

  const result = !grade
    ? scannerData
    : scannerData.filter(
        (el) => (el.nutritionGrade || "a").toLowerCase() === grade,
      );

  displayDataScanner(result);
  console.log(result);
});

function closeModelScanner() {
  document.querySelector("#product-detail-modal").classList.add("hidden");
}

/*----------------------------------------Food log-------------------------------------------------*/
let getLocal = JSON.parse(localStorage.getItem("calories"));
console.log(getLocal);

getLocal.map((el) => {
  let one = Math.min((el.type.protein / 50) * 100, 100);
  let two = Math.min((el.type.calories / 2000) * 100, 100);
  let three = Math.min((el.type.carbs / 250) * 100, 100);
  let four = Math.min((el.type.fat / 65) * 100, 100);
  document.querySelector(".one").style.width = `${two}%`;
  document.querySelector(".two").style.width = `${one}%`;
  document.querySelector(".three").style.width = `${three}%`;
  document.querySelector(".four").style.width = `${four}%`;
  document.querySelector(".count-one").innerHTML =
    `${el.type.calories} / 2000 kcal`;
  document.querySelector(".count-two").innerHTML = `${el.type.protein} / 50 g`;
  document.querySelector(".count-three").innerHTML = `${el.type.carbs} / 250 g`;
  document.querySelector(".count-four").innerHTML = `${el.type.fat} / 65 g`;
});

function displayFoodLog() {
  let dataFoodLog = getLocal
    .map(
      (el) => `

  <div class="border-t border-gray-200 pt-4">
    <div class="space-y-3 max-h-96 overflow-y-auto">

    <div class="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all">
    <div class="flex items-center gap-4">
        <img src="${el.thumbnail}" alt="${el.name}" class="w-14 h-14 rounded-xl object-cover">
        <div>
            <p class="font-semibold text-gray-900">${el.name}</p>
            <p class="text-sm text-gray-500">
                1 serving
                <span class="mx-1">•</span>
                <span class="text-emerald-600"></span>
            </p>
            <p class="text-xs text-gray-400 mt-1">${new Date().getTime()}</p>
        </div>
    </div>
    <div class="flex items-center gap-4">
        <div class="text-right">
            <p class="text-lg font-bold text-emerald-600">${el.type.calories}g</p>
            <p class="text-xs text-gray-500">kcal</p>
        </div>
        <div class="hidden md:flex gap-2 text-xs text-gray-500">
            <span class="px-2 py-1 bg-blue-50 rounded">${el.type.protein}g P</span>
            <span class="px-2 py-1 bg-amber-50 rounded">${el.type.calories}g C</span>
            <span class="px-2 py-1 bg-purple-50 rounded">${el.type.fat}g F</span>
        </div>
        <button class="remove-foodlog-item text-gray-400 hover:text-red-500 transition-all p-2" data-index="0">
            <i data-fa-i2svg=""><svg class="svg-inline--fa fa-trash-can" data-prefix="fas" data-icon="trash-can" role="img" viewBox="0 0 448 512" aria-hidden="true" data-fa-i2svg=""><path fill="currentColor" d="M136.7 5.9C141.1-7.2 153.3-16 167.1-16l113.9 0c13.8 0 26 8.8 30.4 21.9L320 32 416 32c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 8.7-26.1zM32 144l384 0 0 304c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-304zm88 64c-13.3 0-24 10.7-24 24l0 192c0 13.3 10.7 24 24 24s24-10.7 24-24l0-192c0-13.3-10.7-24-24-24zm104 0c-13.3 0-24 10.7-24 24l0 192c0 13.3 10.7 24 24 24s24-10.7 24-24l0-192c0-13.3-10.7-24-24-24zm104 0c-13.3 0-24 10.7-24 24l0 192c0 13.3 10.7 24 24 24s24-10.7 24-24l0-192c0-13.3-10.7-24-24-24z"></path></svg></i>
        </button>
    </div>
    </div>

    </div>

    </div>
  `,
    )
    .join(" ");
  document.querySelector("#logged-items-list").innerHTML = dataFoodLog;
}

displayFoodLog();

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function formatDayName(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
  });
}

function formatDayNumber(dateStr) {
  return new Date(dateStr).getDate();
}

function getWeeklyData() {
  const meals = JSON.parse(localStorage.getItem("calories")) || [];
  const today = new Date();

  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayMeals = meals.filter((meal) => meal.data === dateStr);

    const calories = dayMeals.reduce(
      (sum, meal) => sum + Number(meal.type.calories || 0),
      0,
    );

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

  container.innerHTML += days
    .map(
      (day) => `
      <div class="grid grid-cols-7 gap-2 day ${
        day.date === todayDate() ? "active" : ""
      }">
        <div class="text-center">
          <p class="text-xs text-gray-500 mb-1">${day.dayName}</p>
          <p class="text-sm font-medium text-gray-900">${day.dayNumber}</p>

          <div class="mt-2 text-emerald-600">
            <p class="text-lg font-bold">${day.calories}</p>
            <p class="text-xs">kcal</p>
          </div>

          <p class="text-xs text-gray-400 mt-1">${day.items} items</p>
        </div>
      </div>
    `,
    )
    .join("");
}

renderWeeklyOverview();
