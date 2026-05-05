const KCAL_PER_KJ = 1 / 4.184;
const DATE_INDEX_KEY = "calorie-diary:dates";

const mealNames = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐",
};

const foodLibrary = [
  { name: "牛奶", unit: "ml", kcalPer100: 64, category: "早餐/饮品" },
  { name: "无糖豆浆", unit: "ml", kcalPer100: 31, category: "早餐/饮品" },
  { name: "鸡蛋", unit: "piece", kcalPerPiece: 70, defaultAmount: 1, category: "早餐/蛋白" },
  { name: "酸奶", unit: "g", kcalPer100: 72, category: "早餐/蛋白" },
  { name: "希腊酸奶", unit: "g", kcalPer100: 59, category: "早餐/蛋白" },
  { name: "低脂奶酪", unit: "g", kcalPer100: 98, category: "早餐/蛋白" },
  { name: "豆腐", unit: "g", kcalPer100: 76, category: "优质蛋白" },
  { name: "虾仁", unit: "g", kcalPer100: 99, category: "优质蛋白" },
  { name: "鱼肉", unit: "g", kcalPer100: 120, category: "优质蛋白" },
  { name: "鸡胸肉", unit: "g", kcalPer100: 165, category: "优质蛋白" },
  { name: "鸡腿", unit: "piece", kcalPerPiece: 260, defaultAmount: 1, category: "优质蛋白" },
  { name: "鸭腿", unit: "piece", kcalPerPiece: 330, defaultAmount: 1, category: "优质蛋白" },
  { name: "牛肉", unit: "g", kcalPer100: 250, category: "优质蛋白" },
  { name: "米饭", unit: "g", kcalPer100: 116, category: "主食/米面" },
  { name: "面条", unit: "g", kcalPer100: 137, category: "主食/米面" },
  { name: "全麦面包", unit: "g", kcalPer100: 247, category: "主食/米面" },
  { name: "燕麦", unit: "g", kcalPer100: 379, category: "主食/粗粮" },
  { name: "土豆", unit: "g", kcalPer100: 77, category: "主食/粗粮" },
  { name: "红薯", unit: "g", kcalPer100: 86, category: "主食/粗粮" },
  { name: "紫薯", unit: "g", kcalPer100: 82, category: "主食/粗粮" },
  { name: "玉米", unit: "piece", kcalPerPiece: 175, defaultAmount: 1, category: "主食/粗粮" },
  { name: "南瓜", unit: "g", kcalPer100: 23, category: "主食/粗粮" },
  { name: "西红柿", unit: "g", kcalPer100: 18, category: "低卡蔬菜" },
  { name: "四季豆", unit: "g", kcalPer100: 20, category: "低卡蔬菜" },
  { name: "菠菜", unit: "g", kcalPer100: 23, category: "低卡蔬菜" },
  { name: "豆芽", unit: "g", kcalPer100: 30, category: "低卡蔬菜" },
  { name: "黄瓜", unit: "g", kcalPer100: 16, category: "低卡蔬菜" },
  { name: "生菜", unit: "g", kcalPer100: 15, category: "低卡蔬菜" },
  { name: "西兰花", unit: "g", kcalPer100: 34, category: "减脂推荐" },
  { name: "芦笋", unit: "g", kcalPer100: 20, category: "减脂推荐" },
  { name: "蘑菇", unit: "g", kcalPer100: 22, category: "减脂推荐" },
  { name: "魔芋", unit: "g", kcalPer100: 7, category: "减脂推荐" },
  { name: "胡萝卜", unit: "g", kcalPer100: 41, category: "低卡蔬菜" },
  { name: "白菜", unit: "g", kcalPer100: 17, category: "低卡蔬菜" },
  { name: "冬瓜", unit: "g", kcalPer100: 10, category: "低卡蔬菜" },
  { name: "香蕉", unit: "piece", kcalPerPiece: 105, defaultAmount: 1, category: "水果" },
  { name: "苹果", unit: "piece", kcalPerPiece: 95, defaultAmount: 1, category: "水果" },
  { name: "蓝莓", unit: "g", kcalPer100: 57, category: "水果" },
  { name: "橙子", unit: "piece", kcalPerPiece: 80, defaultAmount: 1, category: "水果" },
  { name: "火龙果", unit: "piece", kcalPerPiece: 120, defaultAmount: 1, category: "水果" },
  { name: "草莓", unit: "g", kcalPer100: 32, category: "水果" },
  { name: "葡萄", unit: "g", kcalPer100: 69, category: "水果" },
  { name: "梨", unit: "g", kcalPer100: 57, category: "水果" },
  { name: "花生", unit: "g", kcalPer100: 567, category: "零食/其他" },
  { name: "薯片", unit: "g", kcalPer100: 536, category: "零食/其他" },
];

const state = {
  mode: "food",
  date: "",
  records: {},
};

const elements = {
  date: document.querySelector("#log-date"),
  summaryDateLabel: document.querySelector("#summary-date-label"),
  dailyKcal: document.querySelector("#daily-kcal"),
  preview: document.querySelector("#preview-kcal"),
  form: document.querySelector("#entry-form"),
  tabs: document.querySelectorAll(".tab"),
  pageViews: document.querySelectorAll(".page-view"),
  pageTabs: document.querySelectorAll(".page-tab"),
  foodFields: document.querySelector("#food-fields"),
  kjFields: document.querySelector("#kj-fields"),
  photoFields: document.querySelector("#photo-fields"),
  meal: document.querySelector("#meal-select"),
  foodName: document.querySelector("#food-name"),
  foodAmount: document.querySelector("#food-amount"),
  foodUnit: document.querySelector("#food-unit"),
  density: document.querySelector("#density"),
  estimateFood: document.querySelector("#estimate-food"),
  estimateStatus: document.querySelector("#estimate-status"),
  kjName: document.querySelector("#kj-name"),
  kjValue: document.querySelector("#kj-value"),
  kjGrams: document.querySelector("#kj-grams"),
  energyTabs: document.querySelectorAll(".energy-tab"),
  photoFile: document.querySelector("#photo-file"),
  photoPreview: document.querySelector("#photo-preview"),
  photoStatus: document.querySelector("#photo-status"),
  identifyPhoto: document.querySelector("#identify-photo"),
  photoFoodName: document.querySelector("#photo-food-name"),
  photoGrams: document.querySelector("#photo-grams"),
  photoDensity: document.querySelector("#photo-density"),
  photoNote: document.querySelector("#photo-note"),
  datalist: document.querySelector("#food-options"),
  quickFoods: document.querySelector("#quick-foods"),
  clearDay: document.querySelector("#clear-day"),
  mealClearButtons: document.querySelectorAll("[data-clear-meal]"),
  historyList: document.querySelector("#history-list"),
};

let photoDataUrl = "";
let energyMode = "kj";

function todayKey() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function storageKey(date) {
  return `calorie-diary:${date}`;
}

function loadDateIndex() {
  try {
    return JSON.parse(localStorage.getItem(DATE_INDEX_KEY)) || [];
  } catch {
    return [];
  }
}

function saveDateIndex(dates) {
  const uniqueDates = [...new Set(dates)].sort().reverse();
  localStorage.setItem(DATE_INDEX_KEY, JSON.stringify(uniqueDates));
}

function rebuildDateIndex() {
  const dates = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith("calorie-diary:") || key === DATE_INDEX_KEY) continue;
    const date = key.replace("calorie-diary:", "");
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && loadRecords(date).length) {
      dates.push(date);
    }
  }
  saveDateIndex(dates);
  return loadDateIndex();
}

function updateDateIndex(date, records) {
  const dates = loadDateIndex();
  const nextDates = records.length ? [...dates, date] : dates.filter((item) => item !== date);
  saveDateIndex(nextDates);
}

function loadRecords(date) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(date))) || [];
  } catch {
    return [];
  }
}

function saveRecords() {
  const records = state.records[state.date] || [];
  localStorage.setItem(storageKey(state.date), JSON.stringify(records));
  updateDateIndex(state.date, records);
}

function roundKcal(value) {
  return Math.round(Number(value) || 0);
}

function normalizeName(value) {
  return value.trim().toLowerCase();
}

function formatDate(date) {
  const [year, month, day] = date.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

function findFood(name) {
  const normalized = normalizeName(name);
  return foodLibrary.find((food) => normalizeName(food.name) === normalized);
}

function estimateFoodKcal() {
  const amount = Number(elements.foodAmount.value);
  const density = Number(elements.density.value);
  if (!amount || !density) return 0;
  if (elements.foodUnit.value === "piece") return roundKcal(amount * density);
  return roundKcal((amount * density) / 100);
}

function estimateKjKcal() {
  const valuePer100 = Number(elements.kjValue.value);
  const grams = Number(elements.kjGrams.value);
  if (!valuePer100 || !grams) return 0;
  const kcalPer100 = energyMode === "kj" ? valuePer100 * KCAL_PER_KJ : valuePer100;
  return roundKcal((grams * kcalPer100) / 100);
}

function estimatePhotoKcal() {
  const grams = Number(elements.photoGrams.value);
  const density = Number(elements.photoDensity.value);
  if (!grams || !density) return 0;
  return roundKcal((grams * density) / 100);
}

function currentPreview() {
  if (state.mode === "food") return estimateFoodKcal();
  if (state.mode === "kj") return estimateKjKcal();
  return estimatePhotoKcal();
}

function updatePreview() {
  elements.preview.textContent = currentPreview();
}

function switchPage(page) {
  elements.pageViews.forEach((view) => view.classList.toggle("active", view.dataset.page === page));
  elements.pageTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.targetPage === page));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function switchDate(date, page = "details") {
  state.date = date;
  state.records[state.date] = loadRecords(state.date);
  elements.date.value = state.date;
  render();
  switchPage(page);
}

function totalsForRecords(records) {
  const totals = Object.fromEntries(Object.keys(mealNames).map((meal) => [meal, 0]));
  records.forEach((record) => {
    totals[record.meal] += record.kcal;
  });
  totals.daily = Object.values(totals).reduce((sum, value) => sum + value, 0);
  return totals;
}

function totalsForDate() {
  return totalsForRecords(state.records[state.date] || []);
}

function renderTotals() {
  const totals = totalsForDate();
  elements.summaryDateLabel.textContent = state.date === todayKey() ? "今日摄入" : `${formatDate(state.date)} 摄入`;
  elements.dailyKcal.textContent = totals.daily;
  Object.keys(mealNames).forEach((meal) => {
    document.querySelector(`#${meal}-kcal`).textContent = totals[meal];
    document.querySelector(`[data-meal-total="${meal}"]`).textContent = totals[meal];
  });
}

function renderMealLists() {
  const records = state.records[state.date] || [];
  Object.keys(mealNames).forEach((meal) => {
    const list = document.querySelector(`[data-meal-list="${meal}"]`);
    const mealRecords = records.filter((record) => record.meal === meal);
    list.innerHTML = "";

    if (!mealRecords.length) {
      const empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "还没有记录";
      list.append(empty);
      return;
    }

    mealRecords.forEach((record) => {
      const item = document.createElement("li");
      item.className = "food-row";
      item.innerHTML = `
        <div class="food-main">
          <strong></strong>
          <span></span>
        </div>
        <div class="food-kcal">
          <span>${record.kcal} kcal</span>
          <button class="delete-button" type="button" aria-label="删除">×</button>
        </div>
      `;
      item.querySelector("strong").textContent = record.name;
      item.querySelector("span").textContent = record.detail;
      item.querySelector("button").addEventListener("click", () => deleteRecord(record.id));
      list.append(item);
    });
  });
}

function renderHistory() {
  const dates = loadDateIndex().length ? loadDateIndex() : rebuildDateIndex();
  elements.historyList.innerHTML = "";

  if (!dates.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "还没有历史记录";
    elements.historyList.append(empty);
    return;
  }

  dates.forEach((date) => {
    const records = loadRecords(date);
    const totals = totalsForRecords(records);
    const item = document.createElement("button");
    item.type = "button";
    item.className = "history-item";
    item.innerHTML = `
      <span class="history-date"></span>
      <strong>${totals.daily} kcal</strong>
      <small>早餐 ${totals.breakfast} · 午餐 ${totals.lunch} · 晚餐 ${totals.dinner} · 加餐 ${totals.snack}</small>
    `;
    item.querySelector(".history-date").textContent = date === todayKey() ? "今天" : formatDate(date);
    item.addEventListener("click", () => switchDate(date, "details"));
    elements.historyList.append(item);
  });
}

function render() {
  renderTotals();
  renderMealLists();
  renderHistory();
  updatePreview();
}

function addRecord(record) {
  state.records[state.date] = state.records[state.date] || [];
  state.records[state.date].push({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...record,
  });
  saveRecords();
  render();
}

function deleteRecord(id) {
  state.records[state.date] = (state.records[state.date] || []).filter((record) => record.id !== id);
  saveRecords();
  render();
}

function clearMeal(meal) {
  const hasRecords = (state.records[state.date] || []).some((record) => record.meal === meal);
  if (!hasRecords) return;
  if (!confirm(`清空${mealNames[meal]}的所有记录？`)) return;
  state.records[state.date] = (state.records[state.date] || []).filter((record) => record.meal !== meal);
  saveRecords();
  render();
}

function switchMode(mode) {
  state.mode = mode;
  elements.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === mode));
  elements.foodFields.classList.toggle("hidden", mode !== "food");
  elements.kjFields.classList.toggle("hidden", mode !== "kj");
  elements.photoFields.classList.toggle("hidden", mode !== "photo");
  updatePreview();
}

function switchEnergyMode(mode) {
  energyMode = mode;
  elements.energyTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.energyMode === mode));
  elements.kjValue.placeholder = mode === "kj" ? "例如 840 kJ" : "例如 200 kcal";
  updatePreview();
}

function syncFoodDensity() {
  const food = findFood(elements.foodName.value);
  if (!food) return;
  elements.density.value = food.kcalPerPiece || food.kcalPer100;
  elements.foodUnit.value = food.unit;
  if (food.defaultAmount && !elements.foodAmount.value) {
    elements.foodAmount.value = food.defaultAmount;
  }
  updatePreview();
}

function syncPhotoDensity() {
  const food = findFood(elements.photoFoodName.value);
  if (!food) return;
  elements.photoDensity.value = food.kcalPer100;
  updatePreview();
}

function addFoodRecord() {
  const name = elements.foodName.value.trim();
  const amount = Number(elements.foodAmount.value);
  const density = Number(elements.density.value);
  const kcal = estimateFoodKcal();

  if (!name || !amount || !density || !kcal) return;

  addRecord({
    meal: elements.meal.value,
    type: "food",
    name,
    kcal,
    detail:
      elements.foodUnit.value === "piece"
        ? `${amount}个 · ${density} kcal/个`
        : `${amount}${elements.foodUnit.value} · ${density} kcal/100${elements.foodUnit.value}`,
  });

  elements.foodAmount.value = "";
  elements.foodName.focus();
}

function addKjRecord() {
  const name = elements.kjName.value.trim() || "包装食品";
  const valuePer100 = Number(elements.kjValue.value);
  const grams = Number(elements.kjGrams.value);
  const kcal = estimateKjKcal();

  if (!valuePer100 || !grams || !kcal) return;

  addRecord({
    meal: elements.meal.value,
    type: "kj",
    name,
    kcal,
    detail:
      energyMode === "kj"
        ? `${grams}g · ${valuePer100} kJ/100g · 按 1 kcal = 4.184 kJ`
        : `${grams}g · ${valuePer100} kcal/100g`,
  });

  elements.kjName.value = "";
  elements.kjValue.value = "";
  elements.kjGrams.value = "";
  elements.kjName.focus();
}

function addPhotoRecord() {
  const name = elements.photoFoodName.value.trim();
  const grams = Number(elements.photoGrams.value);
  const density = Number(elements.photoDensity.value);
  const kcal = estimatePhotoKcal();

  if (!name || !grams || !density || !kcal) return;

  addRecord({
    meal: elements.meal.value,
    type: "photo",
    name,
    kcal,
    detail: `${grams}g · ${density} kcal/100g · ${elements.photoNote.value.trim() || "照片估算"}`,
  });

  elements.photoGrams.value = "";
  elements.photoFoodName.focus();
}

function setPhotoStatus(message, type = "") {
  elements.photoStatus.textContent = message;
  elements.photoStatus.classList.toggle("warning", type === "warning");
  elements.photoStatus.classList.toggle("success", type === "success");
}

function setEstimateStatus(message, type = "") {
  elements.estimateStatus.textContent = message;
  elements.estimateStatus.classList.toggle("warning", type === "warning");
  elements.estimateStatus.classList.toggle("success", type === "success");
}

async function estimateFoodByName() {
  const name = elements.foodName.value.trim();
  if (!name) {
    setEstimateStatus("先输入一个食物名。", "warning");
    return;
  }

  const localFood = findFood(name);
  if (localFood) {
    syncFoodDensity();
    setEstimateStatus("已用内置常见热量填入。", "success");
    return;
  }

  if (location.protocol === "file:") {
    setEstimateStatus("本地文件预览不能查询 AI，请用部署后的 HTTPS 地址打开。", "warning");
    return;
  }

  elements.estimateFood.disabled = true;
  setEstimateStatus("正在查询常见热量...");

  try {
    const response = await fetch("/api/estimate-food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "查询失败");
    }

    elements.foodName.value = data.name || name;
    elements.foodUnit.value = data.unit === "piece" ? "piece" : data.unit === "ml" ? "ml" : "g";
    elements.density.value = data.unit === "piece" ? data.kcalPerPiece : data.kcalPer100;
    if (!elements.foodAmount.value) {
      elements.foodAmount.value = data.defaultAmount || 1;
    }
    updatePreview();
    setEstimateStatus(data.note || "已填入估算热量，请按实际情况调整。", "success");
  } catch (error) {
    setEstimateStatus(error.message, "warning");
  } finally {
    elements.estimateFood.disabled = false;
  }
}

function resizePhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("读取照片失败"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("照片格式不支持"));
      image.onload = () => {
        const maxSide = 1200;
        const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * ratio);
        canvas.height = Math.round(image.height * ratio);
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handlePhotoSelected() {
  const file = elements.photoFile.files?.[0];
  if (!file) return;

  try {
    setPhotoStatus("正在压缩照片...");
    photoDataUrl = await resizePhoto(file);
    elements.photoPreview.src = photoDataUrl;
    elements.photoPreview.classList.remove("hidden");
    setPhotoStatus("照片已准备好，可以点击识别。");
  } catch (error) {
    photoDataUrl = "";
    setPhotoStatus(error.message, "warning");
  }
}

async function identifyPhoto() {
  if (!photoDataUrl) {
    setPhotoStatus("请先从相册选择一张照片。", "warning");
    return;
  }

  if (location.protocol === "file:") {
    setPhotoStatus("本地文件预览不能调用识别接口，请用已部署的 HTTPS 地址打开。", "warning");
    return;
  }

  elements.identifyPhoto.disabled = true;
  setPhotoStatus("正在识别照片，请稍等...");

  try {
    const response = await fetch("/api/recognize-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: photoDataUrl }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "识别失败");
    }

    elements.photoFoodName.value = data.foodName || "";
    elements.photoGrams.value = data.estimatedGrams || "";
    elements.photoDensity.value = data.kcalPer100 || "";
    elements.photoNote.value = data.note || `可信度 ${Math.round((data.confidence || 0) * 100)}%`;
    updatePreview();
    setPhotoStatus("已识别，请确认重量和热量密度后添加。", "success");
  } catch (error) {
    setPhotoStatus(error.message, "warning");
  } finally {
    elements.identifyPhoto.disabled = false;
  }
}

function renderFoodOptions() {
  elements.datalist.innerHTML = "";
  foodLibrary.forEach((food) => {
    const option = document.createElement("option");
    option.value = food.name;
    option.label =
      food.unit === "piece" ? `${food.kcalPerPiece} kcal/个` : `${food.kcalPer100} kcal/100${food.unit}`;
    elements.datalist.append(option);
  });

  elements.quickFoods.innerHTML = "";
  const groups = foodLibrary.reduce((result, food) => {
    result[food.category] = result[food.category] || [];
    result[food.category].push(food);
    return result;
  }, {});

  Object.entries(groups).forEach(([category, foods]) => {
    const group = document.createElement("div");
    group.className = "quick-group";
    group.innerHTML = `
      <div class="quick-group-title"></div>
      <div class="quick-group-items"></div>
    `;
    group.querySelector(".quick-group-title").textContent = category;
    const items = group.querySelector(".quick-group-items");

    foods.forEach((food) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "quick-chip";
      chip.textContent = food.name;
      chip.addEventListener("click", () => {
        switchMode("food");
        switchPage("record");
        elements.foodName.value = food.name;
        elements.foodUnit.value = food.unit;
        elements.density.value = food.kcalPerPiece || food.kcalPer100;
        elements.foodAmount.value = food.defaultAmount || "";
        elements.foodAmount.focus();
        updatePreview();
      });
      items.append(chip);
    });

    elements.quickFoods.append(group);
  });
}

function bindEvents() {
  elements.pageTabs.forEach((tab) => {
    tab.addEventListener("click", () => switchPage(tab.dataset.targetPage));
  });

  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchMode(tab.dataset.mode));
  });

  elements.energyTabs.forEach((tab) => {
    tab.addEventListener("click", () => switchEnergyMode(tab.dataset.energyMode));
  });

  elements.date.addEventListener("change", () => {
    switchDate(elements.date.value, "details");
  });

  elements.foodName.addEventListener("input", syncFoodDensity);
  elements.photoFoodName.addEventListener("input", syncPhotoDensity);
  [elements.foodAmount, elements.density, elements.kjValue, elements.kjGrams, elements.photoGrams, elements.photoDensity].forEach((input) => {
    input.addEventListener("input", updatePreview);
  });
  elements.photoFile.addEventListener("change", handlePhotoSelected);
  elements.identifyPhoto.addEventListener("click", identifyPhoto);
  elements.estimateFood.addEventListener("click", estimateFoodByName);

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.mode === "food") {
      addFoodRecord();
    } else if (state.mode === "kj") {
      addKjRecord();
    } else {
      addPhotoRecord();
    }
  });

  elements.clearDay.addEventListener("click", () => {
    if (!confirm("清空当天所有记录？")) return;
    state.records[state.date] = [];
    saveRecords();
    render();
  });

  elements.mealClearButtons.forEach((button) => {
    button.addEventListener("click", () => clearMeal(button.dataset.clearMeal));
  });
}

function init() {
  state.date = todayKey();
  state.records[state.date] = loadRecords(state.date);
  elements.date.value = state.date;
  rebuildDateIndex();
  renderFoodOptions();
  bindEvents();
  render();

  const isFilePreview = location.protocol === "file:";
  if ("serviceWorker" in navigator && !isFilePreview) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
}

init();
