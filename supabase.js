import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ========================================
// CONFIGURATION
// ========================================
const SUPABASE_URL = "https://hxwbbymzinxmtmfhyxdt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cUkHi6YR7FyK74vr1dCk4w_UojIyVYv";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// CHANNEL CONFIGURATION
// ========================================
// Each metric has its own dedicated channel
const CHANNELS = {
  DONOR_COUNT: "realtime:donor_count",
  DONATION_COUNT: "realtime:donation_count",
  DONATION_STATS: "realtime:donation_stats",
  MONEY_AMOUNT: "realtime:money_amount",
};

// ========================================
// 1. DONOR COUNT
// ========================================
async function loadDonorCount() {
  const dc = document.getElementById("donor-count");

  try {
    // Load initial data
    const { data, error } = await supabase.rpc("get_donor_count");
    if (error) throw error;

    dc.textContent = data.donor_count || 0;
    console.log("✅ [DONOR] Initialized:", data);

    // Subscribe to dedicated channel
    supabase
      .channel(CHANNELS.DONOR_COUNT)
      .on("broadcast", { event: "donor_count_updated" }, (payload) => {
        console.log("📊 [DONOR] Update received!");
        const data = payload.payload;

        if (data && data.donor_count !== undefined) {
          dc.textContent = data.donor_count;
          console.log(`✅ [DONOR] Updated to: ${data.donor_count}`);
        } else {
          console.error("❌ [DONOR] Invalid payload:", payload);
        }
      })
      .subscribe((status) => {
        console.log(`📡 [DONOR] Subscription: ${status}`);
      });
  } catch (err) {
    console.error("❌ [DONOR] Failed to load:", err);
    dc.textContent = "Error";
  }
}

// ========================================
// 2. DONATION COUNT
// ========================================
async function loadDonationCount() {
  const dc = document.getElementById("donation-count");

  try {
    // Load initial data
    const { data, error } = await supabase.rpc("get_donation_count");
    if (error) throw error;

    dc.textContent = data || 0;
    console.log("✅ [DONATION COUNT] Initialized:", data);

    // Subscribe to dedicated channel
    supabase
      .channel(CHANNELS.DONATION_COUNT)
      .on("broadcast", { event: "donation_count_updated" }, (payload) => {
        console.log("📊 [DONATION COUNT] Update received!");
        const data = payload.payload;

        if (data && data.donation_count !== undefined) {
          dc.textContent = data.donation_count;
          console.log(`✅ [DONATION COUNT] Updated to: ${data.donation_count}`);
        } else {
          console.error("❌ [DONATION COUNT] Invalid payload:", payload);
        }
      })
      .subscribe((status) => {
        console.log(`📡 [DONATION COUNT] Subscription: ${status}`);
      });
  } catch (err) {
    console.error("❌ [DONATION COUNT] Failed to load:", err);
    dc.textContent = "Error";
  }
}

// ========================================
// 3. DONATION STATS (Items)
// ========================================
async function loadDonationStats() {
  const ds = document.getElementById("donation-stats");
  if (!ds) return;

  // Helper function to render stats
  function renderStats(statsData) {
    if (!statsData?.length) {
      ds.innerHTML =
        '<div class="p-4 text-gray-500 text-center col-span-3">لا توجد بيانات</div>';
      return;
    }

    ds.innerHTML = statsData
      .map((row) => {
        const shortageBadge = row.is_in_shortage
          ? `<span class="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">⚠️ نقص</span>`
          : "";

        return `
                <div class="bg-white p-6 rounded-xl shadow text-center border-l-4 ${
                  row.is_in_shortage ? "border-red-500" : "border-green-500"
                }">
                  <div class="flex justify-between items-start mb-3">
                    <h4 class="font-bold text-xl text-gray-800">${row.item_ar}</h4>
                    ${shortageBadge}
                  </div>
                  <p class="text-green-700 font-bold text-4xl">${row.exact_quantity}</p>
                  <p class="text-gray-600 mt-1 text-lg">${row.unit_ar || ""}</p>
                </div>
              `;
      })
      .join("");
  }

  try {
    // Load initial data
    const { data, error } = await supabase.rpc("get_donation_stats");
    if (error) throw error;

    renderStats(data);
    console.log(
      "✅ [DONATION STATS] Initialized with",
      data?.length || 0,
      "items",
    );

    // Subscribe to dedicated channel
    supabase
      .channel(CHANNELS.DONATION_STATS)
      .on("broadcast", { event: "donation_stats_updated" }, (payload) => {
        console.log("📊 [DONATION STATS] Update received!");
        const data = payload.payload;

        // The SQL now wraps items in an object: { items: [...], timestamp: ... }
        const statsArray = data?.items || data;

        if (Array.isArray(statsArray)) {
          renderStats(statsArray);
          console.log(
            `✅ [DONATION STATS] Updated with ${statsArray.length} items`,
          );
        } else {
          console.error("❌ [DONATION STATS] Invalid payload:", payload);
        }
      })
      .subscribe((status) => {
        console.log(`📡 [DONATION STATS] Subscription: ${status}`);
      });
  } catch (err) {
    console.error("❌ [DONATION STATS] Failed to load:", err);
    ds.innerHTML = `<div class="p-4 text-red-500 text-center col-span-3">خطأ: ${err.message}</div>`;
  }
}

// ========================================
// 4. MONEY AMOUNT
// ========================================
async function loadMoneyAmount() {
  const ma = document.getElementById("money-amount");

  try {
    // Load initial data
    const { data, error } = await supabase.rpc("get_money_amount");
    if (error) throw error;

    ma.textContent = `${data || 0} د.ت`;
    console.log("✅ [MONEY] Initialized:", data);

    // Subscribe to dedicated channel
    supabase
      .channel(CHANNELS.MONEY_AMOUNT)
      .on("broadcast", { event: "money_amount_updated" }, (payload) => {
        console.log("📊 [MONEY] Update received!");
        const data = payload.payload;

        if (data && data.amount !== undefined) {
          ma.textContent = `${data.amount} ${data.currency_ar}`;
          console.log(`✅ [MONEY] Updated to: ${data.amount} ${data.currency}`);
        } else {
          console.error("❌ [MONEY] Invalid payload:", payload);
        }
      })
      .subscribe((status) => {
        console.log(`📡 [MONEY] Subscription: ${status}`);
      });
  } catch (err) {
    console.error("❌ [MONEY] Failed to load:", err);
    ma.textContent = "Error";
  }
}

// ========================================
// DEBUG HELPER
// ========================================
window.debugRealtime = () => {
  console.log("🔍 ===== REALTIME DEBUG INFO =====");
  console.log("Supabase Client:", supabase);
  console.log("Active Channels:", supabase.getChannels());
  console.log("Channel Configuration:", CHANNELS);
  console.log("=================================");
};

// ========================================
// INITIALIZE ALL
// ========================================
console.log("🚀 Initializing UGTE Donations Dashboard...");
console.log("📡 Channel Configuration:", CHANNELS);

loadDonorCount();
loadDonationCount();
loadDonationStats();
loadMoneyAmount();

console.log("✅ All loaders initialized!");
console.log("💡 Type debugRealtime() in console for debug info");
