/* Simple SPA behavior + mocked analysis + localStorage log/weight */

const navBtns = Array.from(document.querySelectorAll('.nav-btn'));
const screens = Array.from(document.querySelectorAll('.screen'));
const toast = document.getElementById('toast');

function showScreen(id){
  screens.forEach(s => s.id === id ? s.classList.add('active') : s.classList.remove('active'));
  navBtns.forEach(b => b.dataset.nav === id ? b.classList.add('active') : b.classList.remove('active'));
}
document.querySelectorAll('[data-nav]').forEach(btn=>{
  btn.addEventListener('click', e=>{
    const id = btn.dataset.nav;
    showScreen(id);
  });
});
navBtns.forEach(b => b.addEventListener('click', ()=> showScreen(b.dataset.nav)));

// Toast helper
function showToast(msg, t=2200){
  toast.textContent = msg; toast.classList.remove('hidden');
  setTimeout(()=> toast.classList.add('hidden'), t);
}

/* Upload + analysis simulation */
const fileInput = document.getElementById('fileInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultImg = document.getElementById('resultImg');
const rCalories = document.getElementById('rCalories');
const rCarb = document.getElementById('rCarb');
const rProtein = document.getElementById('rProtein');
const rFat = document.getElementById('rFat');
const suggestionPopup = document.getElementById('suggestionPopup');
const popupSuggestion = document.getElementById('popupSuggestion');
const ignoreBtn = document.getElementById('ignoreBtn');
const applySuggestion = document.getElementById('applySuggestion');
const uploadText = document.querySelector('.upload-text');

let currentFile = null;

fileInput.addEventListener('change', e=>{
  currentFile = e.target.files[0];
  if(currentFile){
    const url = URL.createObjectURL(currentFile);
    resultImg.style.backgroundImage = `url(${url})`;
    resultImg.style.backgroundSize = 'cover';
    resultImg.textContent = '';
    
    // Tambah visual feedback
    uploadText.textContent = `Sedia untuk analisis: ${currentFile.name}`; 
  } else {
    uploadText.textContent = 'Tambah Gambar (maks 5MB)'; 
  }
});

/* === FUNGSI MOCK AI UNTUK PENGESANAN MAKANAN === */
function mockAIAnalysis(fileName) {
  // Simulasi panggilan ke Gemini API atau API khusus pengesanan makanan
  // Di sini anda akan meletakkan logik pemprosesan I/O sebenar.
  
  // Data respons simulasi berdasarkan nama fail (untuk kepelbagaian demo)
  const isHealthy = fileName.toLowerCase().includes('salad') || fileName.toLowerCase().includes('ikan') || fileName.toLowerCase().includes('buah');
  const foodName = guessFoodName(fileName);
  
  const baseCalories = isHealthy ? 200 : 550;
  const baseCarb = isHealthy ? 25 : 70;
  const baseProtein = isHealthy ? 30 : 15;
  const baseFat = isHealthy ? 10 : 35;

  const unhealthy = !isHealthy;
  
  return {
    name: foodName,
    calories: Math.floor(baseCalories + Math.random() * 100),
    carb: Math.round(baseCarb + Math.random() * 10),
    protein: Math.round(baseProtein + Math.random() * 10),
    fat: Math.round(baseFat + Math.random() * 10),
    isUnhealthy: unhealthy
  };
}

/* simple name guess - untuk demo hanya */
function guessFoodName(fileName){
  if (fileName.toLowerCase().includes('salad')) return 'Salad Ayam & Sayur';
  if (fileName.toLowerCase().includes('roti')) return 'Roti Canai Kuah Kari';
  if (fileName.toLowerCase().includes('nasi')) return 'Nasi Lemak Ayam';
  if (fileName.toLowerCase().includes('burger')) return 'Burger Daging Keju';
  
  const foods = ['Nasi Goreng Kampung', 'Salad Buah', 'Spaghetti Bolognese', 'Ikan Panggang Sambal'];
  return foods[Math.floor(Math.random()*foods.length)];
}


analyzeBtn.addEventListener('click', ()=>{
  if(!currentFile){
    showToast('Sila pilih gambar dahulu.');
    return;
  }
  
  const fileName = currentFile.name; 
  
  showScreen('analysis');
  showToast('Menganalisis gambar menggunakan AI...');
  
  // simulate analysis time
  setTimeout(()=>{
    
    const analysisResult = mockAIAnalysis(fileName);

    rCalories.textContent = analysisResult.calories + ' kcal';
    rCarb.textContent = analysisResult.carb + ' g';
    rProtein.textContent = analysisResult.protein + ' g';
    rFat.textContent = analysisResult.fat + ' g';

    // push to log
    addLog({
      id: Date.now(),
      name: analysisResult.name,
      calories: analysisResult.calories, 
      carb: analysisResult.carb, 
      protein: analysisResult.protein, 
      fat: analysisResult.fat,
      dateISO: new Date().toISOString()
    });

    if(analysisResult.isUnhealthy){
      popupSuggestion.textContent = `Makanan ${analysisResult.name} dikesan tinggi kalori/lemak. Cadangan: cuba salad sayur segar, ikan panggang atau substitusi rendah lemak.`;
      suggestionPopup.classList.remove('hidden');
    } else {
      suggestionPopup.classList.add('hidden');
      showToast(`Analisis ${analysisResult.name} selesai — log dikemas kini.`);
    }

    // reset file
    currentFile = null;
    fileInput.value = '';
    uploadText.textContent = 'Tambah Gambar (maks 5MB)';
  }, 900 + Math.random()*800);
});

ignoreBtn.addEventListener('click', ()=> suggestionPopup.classList.add('hidden'));
applySuggestion.addEventListener('click', ()=>{
  suggestionPopup.classList.add('hidden');
  showToast('Tunjuk alternatif sihat (di halaman cadangan).');
});


/* Log management using localStorage */
const STORAGE_KEY = 'nutrisnap_logs';

function getLogs(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')}catch(e){return []}}
function saveLogs(arr){localStorage.setItem(STORAGE_KEY, JSON.stringify(arr))}
function addLog(item){
  const logs = getLogs();
  logs.unshift(item);
  saveLogs(logs);
  renderMeals();
  showToast('Log Dikemas Kini');
}


/* Weight management */
const inpStart = document.getElementById('inpStart'),
      inpCurrent = document.getElementById('inpCurrent'),
      inpGoal = document.getElementById('inpGoal'),
      saveWeightBtn = document.getElementById('saveWeight'),
      
      // Elemen lama (untuk skrin 'user')
      startWeightEl = document.getElementById('startWeight'),
      currentWeightEl = document.getElementById('currentWeight'),
      goalWeightEl = document.getElementById('goalWeight'),
      
      // Elemen baru (untuk skrin 'weight')
      startWeightShortEl = document.getElementById('startWeightShort'),
      goalWeightShortEl = document.getElementById('goalWeightShort'),
      currentWeightLargeEl = document.getElementById('currentWeightLarge'),
      lostSoFarNewEl = document.getElementById('lostSoFarNew'),
      toGoNewEl = document.getElementById('toGoNew'),

      weightHistoryEl = document.getElementById('weightHistory');


const WKEY = 'nutrisnap_weights';
function getWeights(){ try{return JSON.parse(localStorage.getItem(WKEY) || '[]')}catch(e){return []} }
function saveWeights(arr){ localStorage.setItem(WKEY, JSON.stringify(arr)) }

function renderWeightSummary(){
  const weights = getWeights();
  const goal = localStorage.getItem('nutrisnap_goal');
  
  // Reset semua elemen ringkasan (Lama & Baru)
  startWeightEl.textContent = '- kg';
  currentWeightEl.textContent = '- kg';
  goalWeightEl.textContent = '- kg';

  startWeightShortEl.textContent = '- kg';
  currentWeightLargeEl.textContent = '- kg';
  goalWeightShortEl.textContent = '- kg';
  lostSoFarNewEl.textContent = 'Telah Hilang : - kg';
  toGoNewEl.textContent = 'Baki Matlamat : - kg';
  
  if(weights.length){
    const latest = weights[weights.length-1];
    
    // Kiraan (Lost so far & To go)
    const start = parseFloat(weights[0].value);
    const current = parseFloat(latest.value);
    const goalVal = parseFloat(goal || '0');
    
    const lost = +(start - current).toFixed(1);
    const togo = goalVal ? +(current - goalVal).toFixed(1) : undefined;
    
    // Update Skrin User (Lama)
    startWeightEl.textContent = weights[0].value + ' kg';
    currentWeightEl.textContent = latest.value + ' kg';
    goalWeightEl.textContent = (goal || '-') + (goal ? ' kg': '');

    // Update Skrin Berat (Baru)
    startWeightShortEl.textContent = weights[0].value + ' kg';
    currentWeightLargeEl.textContent = latest.value + ' kg';
    goalWeightShortEl.textContent = (goal || '-') + (goal ? ' kg': '');

    // Teks Ringkasan Kalkulasi (Baru)
    const lostText = (isNaN(lost) ? '-' : (lost>0? lost + ' kg' : (lost===0? '0 kg' : '↑ '+Math.abs(lost)+' kg')));
    lostSoFarNewEl.textContent = `Telah Hilang : ${lostText}`;
    
    if(togo !== undefined){
      toGoNewEl.textContent = `Baki Matlamat : ${togo>0 ? togo + ' kg' : '✓ Matlamat Dicapai'}`;
    } else {
      toGoNewEl.textContent = 'Baki Matlamat : -';
    }
  }

  // Sejarah
  weightHistoryEl.innerHTML = '';
  const reversed = getWeights().slice().reverse(); 
  
  if(!reversed.length) weightHistoryEl.innerHTML = '<div class="history-row">Tiada sejarah.</div>';
  else{
    reversed.forEach((w, index, arr)=>{
      const row = document.createElement('div'); row.className='history-row';
      let deltaIcon = '•';
      let deltaClass = 'icon-nochange';
      
      if(index < arr.length - 1){
        const previous = arr[index + 1].value;
        const currentVal = w.value;
        if(currentVal > previous){
          deltaIcon = '↑';
          deltaClass = 'icon-up';
        } else if (currentVal < previous){
          deltaIcon = '↓';
          deltaClass = 'icon-down';
        } else {
          deltaIcon = '•';
          deltaClass = 'icon-nochange';
        }
      } else {
          deltaIcon = '—';
          deltaClass = 'icon-nochange';
      }

      const dateString = new Date(w.ts).toLocaleDateString('ms-MY', {
        day: '2-digit', 
        month: 'short'
      });
      const yearString = new Date(w.ts).getFullYear();
      
      row.innerHTML = `<div>${dateString} ${yearString}</div><div class="weight-delta-icon ${deltaClass}">${deltaIcon} ${w.value} kg</div>`;
      weightHistoryEl.appendChild(row);
    });
  }
}

saveWeightBtn.addEventListener('click', ()=>{
  const s = parseFloat(inpStart.value),
        c = parseFloat(inpCurrent.value),
        g = parseFloat(inpGoal.value);
  if(isNaN(s) || isNaN(c) || isNaN(g)){ showToast('Sila isi nilai berat dengan betul'); return; }
  let weights = getWeights();
  
  if(!weights.length){
    weights.push({ ts: Date.now()-1000*60*60*24, value: s, delta: 0 }); // Satu hari sebelum
  }
  
  const last = weights[weights.length-1];
  const delta = +(c - last.value).toFixed(1);
  
  if(last.value === c && (Date.now() - last.ts < 1000*60*5)){
     showToast('Berat Semasa belum berubah atau terlalu cepat dikemas kini.');
     return;
  }
  
  weights.push({ ts: Date.now(), value: c, delta });
  
  saveWeights(weights);
  localStorage.setItem('nutrisnap_goal', g);
  renderWeightSummary();
  showToast('Berat disimpan');
  
  inpStart.value = ''; inpCurrent.value=''; inpGoal.value='';
  showScreen('weight');
});

/* Meals view rendering (Baru - Mengikut rujukan kedua) */
const mealsContainer = document.getElementById('mealsContainer');
const tabMetricsBtns = Array.from(document.querySelectorAll('.tabs-metrics .tab-btn')); 
let activeMealMetric = 'calories';
const todayCaloriesEl = document.getElementById('todayCalories');
const dailyAverageEl = document.getElementById('dailyAverage');


// Mocked goal values - Untuk demo
document.getElementById('maintainCals').textContent = '2000';
document.getElementById('bulkCals').textContent = '2300';
document.getElementById('cutCals').textContent = '1700';


tabMetricsBtns.forEach(b=>{
  b.addEventListener('click', ()=>{
    tabMetricsBtns.forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    activeMealMetric = b.dataset.tab;
    renderMeals();
  });
});

function getMealTime(hour){
    if (hour >= 5 && hour < 11) return 'Sarapan';
    if (hour >= 11 && hour < 14) return 'Makan Tengah Hari';
    if (hour >= 14 && hour < 18) return 'Snek/Lain-lain';
    if (hour >= 18 && hour <= 23) return 'Makan Malam';
    return 'Lain-lain';
}

function groupLogsByDate(){
  const logs = getLogs();
  const grouped = {};
  logs.forEach(l=>{
    const d = new Date(l.dateISO || l.id);
    const key = d.toLocaleDateString('ms-MY', {day: 'numeric', month: 'short', year: 'numeric'});
    if(!grouped[key]) grouped[key] = [];
    
    l.mealTime = getMealTime(d.getHours());
    l.timeString = d.toLocaleTimeString('ms-MY', {hour: '2-digit', minute:'2-digit'});
    grouped[key].push(l);
  });
  const orderedKeys = Object.keys(grouped).sort((a,b)=>{
    return new Date(b) - new Date(a);
  });
  return {grouped, orderedKeys};
}

function calculateDailyStats(logs){
    const today = new Date().toLocaleDateString('ms-MY', {day: 'numeric', month: 'short', year: 'numeric'});
    let todayTotal = 0;
    
    const dailyTotals = {};
    
    logs.forEach(l => {
        const dKey = new Date(l.dateISO || l.id).toLocaleDateString('ms-MY', {day: 'numeric', month: 'short', year: 'numeric'});
        const cals = l.calories || 0;
        
        if (dKey === today) {
            todayTotal += cals;
        }
        
        if (!dailyTotals[dKey]) dailyTotals[dKey] = 0;
        dailyTotals[dKey] += cals;
    });

    const dayCount = Object.keys(dailyTotals).length;
    const overallTotal = Object.values(dailyTotals).reduce((sum, current) => sum + current, 0);

    const average = dayCount > 0 ? Math.round(overallTotal / dayCount) : 0;
    
    return { todayTotal, average };
}

function renderMeals(){
  if(!mealsContainer) return;
  const logs = getLogs();
  const {grouped, orderedKeys} = groupLogsByDate();
  const { todayTotal, average } = calculateDailyStats(logs);

  // Update Header Stats (Hanya Kalori - metrik utama)
  todayCaloriesEl.textContent = todayTotal;
  dailyAverageEl.textContent = `Purata Harian: ${average}`;
  
  
  if(!orderedKeys.length){
    mealsContainer.innerHTML = '<div class="meal-row">Tiada rekod makanan.</div>';
    return;
  }
  
  mealsContainer.innerHTML = '';
  
  // Hanya tunjukkan rekod hari ini
  const todayKey = new Date().toLocaleDateString('ms-MY', {day: 'numeric', month: 'short', year: 'numeric'});
  const todayItems = grouped[todayKey] || [];
  
  if(todayItems.length){
      // Kumpulan mengikut waktu makan untuk paparan yang lebih mudah
      const groupedByTime = {};
      todayItems.forEach(item => {
          if(!groupedByTime[item.mealTime]) groupedByTime[item.mealTime] = [];
          groupedByTime[item.mealTime].push(item);
      });

      const mealTimeOrder = ['Sarapan', 'Makan Tengah Hari', 'Makan Malam', 'Snek/Lain-lain', 'Lain-lain'];
      
      mealTimeOrder.forEach(mealTime => {
          if (groupedByTime[mealTime]) {
              const items = groupedByTime[mealTime];
              let mealTotal = 0;
              items.forEach(it => {
                  // Kirakan jumlah berdasarkan metrik aktif (Kalori/Karbohidrat/Protein)
                  if(activeMealMetric === 'calories') mealTotal += (it.calories||0);
                  if(activeMealMetric === 'carbs') mealTotal += (it.carb||0);
                  if(activeMealMetric === 'protein') mealTotal += (it.protein||0);
              });
              
              const metricUnit = activeMealMetric === 'calories' ? ' kcal' : ' g';
              
              // Paparkan Baris Jumlah Waktu Makan
              const totalRow = document.createElement('div'); totalRow.className='meal-row';
              totalRow.innerHTML = `<div class="meal-time">${mealTime}</div><div>${mealTotal}${metricUnit}</div>`;
              mealsContainer.appendChild(totalRow);
              
              // Tambah item makanan individu di bawahnya (optional, tetapi lebih terperinci)
              items.forEach(it => {
                   const val = activeMealMetric === 'calories' ? (it.calories||0) : (activeMealMetric === 'carbs' ? (it.carb||0) : (it.protein||0));
                   const detailRow = document.createElement('div'); detailRow.className='meal-row meal-detail';
                   detailRow.style.fontSize = '14px';
                   detailRow.style.padding = '5px 15px 5px 30px';
                   detailRow.style.borderBottom = '1px dotted var(--muted)';
                   
                   detailRow.innerHTML = `<div>${it.timeString} - ${it.name}</div><div class="meal-cals">${val}${metricUnit}</div>`;
                   mealsContainer.appendChild(detailRow);
              });
          }
      });
  } else {
    mealsContainer.innerHTML = '<div class="meal-row">Tiada log makanan untuk hari ini.</div>';
  }
}

/* initial render */
renderWeightSummary();
renderMeals();

document.getElementById('userIcon').addEventListener('click', ()=> showScreen('user'));

showScreen('home');

/* Gaya untuk Floating Action Button (FAB) Kamera */
.fab-camera {
    position: fixed; 
    bottom: 96px; 
    left: 50%;
    transform: translateX(-50%);
    width: 68px; 
    height: 68px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    font-size: 28px;
    border: none;
    box-shadow: 0 8px 24px rgba(47, 128, 237, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100; 
    cursor: pointer;
    transition: transform 0.2s;
}

.fab-camera:active {
    transform: translateX(-50%) scale(0.95);
}

/* Sembunyikan FAB apabila berada di skrin selain 'home' */
.screen:not(#home) .fab-camera {
    display: none;
}
