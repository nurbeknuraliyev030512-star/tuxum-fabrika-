// Boshlang'ich Marketlar Bazasi (20 ta do'kon namunasi)
let markets = [
    { id: 1, name: "Iroda Market", owner: "Iroda opa", phone: "+998901234567", location: "Chorsu daxasi", debt: 450000 },
    { id: 2, name: "Baraka Do'koni", owner: "Jasur aka", phone: "+998912345678", location: "Yunusobod 4-mavze", debt: 120000 },
    { id: 3, name: "Oasis Supermarket", owner: "Mirzo aka", phone: "+998933456789", location: "Mirzo Ulug'bek k.", debt: 0 },
    { id: 4, name: "Fayz Market", owner: "Hikmat aka", phone: "+998944567890", location: "Chilanzar 10", debt: 890000 },
    { id: 5, name: "Zamin Do'koni", owner: "Anvar aka", phone: "+998955678901", location: "Sergeli 8", debt: 230000 },
    { id: 6, name: "Saxovat Market", owner: "Qodir aka", phone: "+998909876543", location: "Qo'yliq bozori", debt: 560000 },
    { id: 7, name: "Hosil Market", owner: "Sardor aka", phone: "+998918765432", location: "Olmazor tumani", debt: 0 },
    { id: 8, name: "Nuroniy Do'koni", owner: "Akmal aka", phone: "+998937654321", location: "Uchtepa mavzesi", debt: 340000 },
    { id: 9, name: "Sharq Market", owner: "Shoxruh aka", phone: "+998946543210", location: "Yashnobod", debt: 150000 },
    { id: 10, name: "Vatan Do'koni", owner: "Jamshid aka", phone: "+998955432109", location: "Mirobod", debt: 670000 }
];

let prices = { katta: 1500, ortacha: 1300, kichik: 1100 };
let stock = { katta: 2500, ortacha: 1800, kichik: 900 };
let todayOrders = [];
let activeMarketForBarter = null;

// Dastur brauzerda ochilganda avtomatik ishga tushuvchi qism
window.onload = function() {
    document.getElementById('today-date').innerText = new Date().toLocaleDateString('uz-UZ');
    populateMarketSelect();
    renderMarkets();
    updateStats();
    updateStockUI();
};

// Tablarni o'tkazish
function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    btn.classList.add('active');
}

// Zakaz bo'limidagi dropdown-ga marketlarni joylash
function populateMarketSelect() {
    let select = document.getElementById('order-market');
    select.innerHTML = '<option value="">-- Marketni tanlang --</option>';
    markets.forEach(m => {
        select.innerHTML += `<option value="${m.id}">${m.name} (${m.owner})</option>`;
    });
}

// Zakaz narxini soniyasiga avtomatik hisoblash
function calculateOrder() {
    let marketId = document.getElementById('order-market').value;
    let qKatta = parseInt(document.getElementById('qty-katta').value) || 0;
    let qOrtacha = parseInt(document.getElementById('qty-ortacha').value) || 0;
    let qKichik = parseInt(document.getElementById('qty-kichik').value) || 0;
    let paid = parseInt(document.getElementById('paid-amount').value) || 0;

    let currentSum = (qKatta * prices.katta) + (qOrtacha * prices.ortacha) + (qKichik * prices.kichik);
    let debt = 0;

    if (marketId) {
        let m = markets.find(x => x.id == marketId);
        if (m) debt = m.debt;
    }

    let total = currentSum + debt - paid;

    document.getElementById('res-current').innerText = currentSum.toLocaleString() + " so'm";
    document.getElementById('res-debt').innerText = debt.toLocaleString() + " so'm";
    document.getElementById('res-total').innerText = total.toLocaleString() + " so'm";
}

// Zakazni saqlash va hisob-kitobni yangilash
function saveOrder() {
    let marketId = document.getElementById('order-market').value;
    let qKatta = parseInt(document.getElementById('qty-katta').value) || 0;
    let qOrtacha = parseInt(document.getElementById('qty-ortacha').value) || 0;
    let qKichik = parseInt(document.getElementById('qty-kichik').value) || 0;
    let paid = parseInt(document.getElementById('paid-amount').value) || 0;

    if (!marketId) {
        alert("Iltimos, avval marketni tanlang!");
        return;
    }

    if (qKatta === 0 && qOrtacha === 0 && qKichik === 0) {
        alert("Kamida 1 turdagi tuxum sonini kiriting!");
        return;
    }

    let currentSum = (qKatta * prices.katta) + (qOrtacha * prices.ortacha) + (qKichik * prices.kichik);
    let m = markets.find(x => x.id == marketId);

    // Qolgan to'lanmagan pulni qarzga yozish
    let unpaid = currentSum - paid;
    m.debt += unpaid;

    // Ombordan ayirish
    stock.katta -= qKatta;
    stock.ortacha -= qOrtacha;
    stock.kichik -= qKichik;

    // Bugungi zakazlar ro'yxatiga qo'shish
    todayOrders.push({
        marketName: m.name,
        katta: qKatta,
        ortacha: qOrtacha,
        kichik: qKichik,
        sum: currentSum,
        paid: paid
    });

    alert("Zakaz muvaffaqiyatli topshirildi va saqlandi!");

    // Inputlarni nolga qaytarish
    document.getElementById('qty-katta').value = 0;
    document.getElementById('qty-ortacha').value = 0;
    document.getElementById('qty-kichik').value = 0;
    document.getElementById('paid-amount').value = "";
    
    calculateOrder();
    renderMarkets();
    renderTodayOrders();
    updateStats();
    updateStockUI();
}

// Marketlar ro'yxatini chiqarish
function renderMarkets() {
    let list = document.getElementById('markets-list');
    let search = document.getElementById('search-market').value.toLowerCase();
    list.innerHTML = "";

    let filtered = markets.filter(m => m.name.toLowerCase().includes(search) || m.owner.toLowerCase().includes(search));

    filtered.forEach(m => {
        let hasDebt = m.debt > 0;
        list.innerHTML += `
            <div class="card market-card ${hasDebt ? 'has-debt' : ''}">
                <div class="market-header">
                    <div>
                        <div class="market-name">${m.name}</div>
                        <div class="market-owner">👤 ${m.owner} | 📍 ${m.location}</div>
                    </div>
                    <div class="debt-badge ${!hasDebt ? 'no-debt' : ''}">
                        ${hasDebt ? 'Qarz: ' + m.debt.toLocaleString() + ' so\'m' : 'Qarzsiz'}
                    </div>
                </div>
                <div class="action-btns">
                    <a href="tel:${m.phone}" class="action-btn btn-call">📞 Telefon</a>
                    <button class="action-btn btn-sms" onclick="sendSMS('${m.phone}', '${m.name}', ${m.debt})">💬 SMS Eslatma</button>
                    <button class="action-btn btn-barter" onclick="openBarterModal(${m.id})">🔄 Barter</button>
                </div>
            </div>
        `;
    });
}

// Bugungi zakazlar ro'yxati
function renderTodayOrders() {
    let container = document.getElementById('today-orders-list');
    if (todayOrders.length === 0) {
        container.innerHTML = `<p class="empty-text">Hali bugun zakazlar kiritilmadi</p>`;
        return;
    }
    container.innerHTML = "";
    todayOrders.forEach(o => {
        container.innerHTML += `
            <div style="border-bottom: 1px solid var(--border); padding: 8px 0; font-size: 0.88rem;">
                <strong>${o.marketName}</strong>: K:${o.katta} | O':${o.ortacha} | Ki:${o.kichik} — 
                <span style="color: var(--primary-hover); font-weight: bold;">${o.sum.toLocaleString()} so'm</span> 
                (Berildi: ${o.paid.toLocaleString()} so'm)
            </div>
        `;
    });
}

// SMS Yuborish
function sendSMS(phone, name, debt) {
    if (debt <= 0) {
        alert(name + " marketining qarzi yo'q!");
        return;
    }
    let msg = `Hormang, ${name}! Sizning tuxum yetkazib berish xizmatidan joriy qarzingiz: ${debt.toLocaleString()} so'm. Iltimos, to'lovni qilishingizni so'raymiz. Rahmat!`;
    window.open(`sms:${phone}?body=${encodeURIComponent(msg)}`, '_blank');
}

// Barter Modal
function openBarterModal(marketId) {
    activeMarketForBarter = markets.find(m => m.id == marketId);
    document.getElementById('barter-market-name').innerText = activeMarketForBarter.name + " (Hozirgi qarz: " + activeMarketForBarter.debt.toLocaleString() + " so'm)";
    document.getElementById('barter-modal').classList.add('open');
}

function closeBarterModal() {
    document.getElementById('barter-modal').classList.remove('open');
}

function applyBarter() {
    let amount = parseInt(document.getElementById('barter-amount').value) || 0;
    let item = document.getElementById('barter-item').value;

    if (amount <= 0 || !item) {
        alert("Tovar nomi va summasini to'g'ri kiriting!");
        return;
    }

    activeMarketForBarter.debt -= amount;
    if (activeMarketForBarter.debt < 0) activeMarketForBarter.debt = 0;

    alert(`${activeMarketForBarter.name} marketidan ${item} (${amount.toLocaleString()} so'm) qabul qilindi va qarzidan ayirildi!`);
    
    document.getElementById('barter-amount').value = "";
    document.getElementById('barter-item').value = "";
    closeBarterModal();
    renderMarkets();
    updateStats();
}

// Yangi Market Qo'shish
function openAddMarketModal() {
    document.getElementById('add-market-modal').classList.add('open');
}

function closeAddMarketModal() {
    document.getElementById('add-market-modal').classList.remove('open');
}

function saveNewMarket() {
    let name = document.getElementById('new-market-name').value;
    let owner = document.getElementById('new-market-owner').value;
    let phone = document.getElementById('new-market-phone').value;
    let location = document.getElementById('new-market-location').value;

    if (!name || !owner) {
        alert("Market nomi va egasining ismini kiriting!");
        return;
    }

    let newId = markets.length + 1;
    markets.push({
        id: newId,
        name: name,
        owner: owner,
        phone: phone,
        location: location,
        debt: 0
    });

    alert("Yangi market bazaga qo'shildi!");
    
    document.getElementById('new-market-name').value = "";
    document.getElementById('new-market-owner').value = "";
    
    closeAddMarketModal();
    populateMarketSelect();
    renderMarkets();
}

// Narxlarni Yangilash
function updatePrices() {
    prices.katta = parseInt(document.getElementById('price-katta').value) || 0;
    prices.ortacha = parseInt(document.getElementById('price-ortacha').value) || 0;
    prices.kichik = parseInt(document.getElementById('price-kichik').value) || 0;
    calculateOrder();
}

// Ombor UI
function updateStockUI() {
    document.getElementById('stock-katta').innerText = stock.katta.toLocaleString();
    document.getElementById('stock-ortacha').innerText = stock.ortacha.toLocaleString();
    document.getElementById('stock-kichik').innerText = stock.kichik.toLocaleString();
}

// Hisobotlarni Yangilash
function updateStats() {
    let totalDebt = markets.reduce((acc, m) => acc + m.debt, 0);
    let todaySales = todayOrders.reduce((acc, o) => acc + o.sum, 0);

    document.getElementById('total-debt').innerText = totalDebt.toLocaleString() + " so'm";
    document.getElementById('today-sales').innerText = todaySales.toLocaleString() + " so'm";
}
