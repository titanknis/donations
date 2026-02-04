import { supabase } from "./supabase_client.js";

// ========================================
// CONFIGURATION
// ========================================
const CHANNELS = {
  DONOR_COUNT: "realtime:donor_count",
  DONATION_COUNT: "realtime:donation_count",
  DONATION_STATS: "realtime:donation_stats",
  MONEY_AMOUNT: "realtime:money_amount",
};

const EVENTS = {
  DONOR_COUNT: "donor_count_updated",
  DONATION_COUNT: "donation_count_updated",
  DONATION_STATS: "donation_stats_updated",
  MONEY_AMOUNT: "money_amount_updated",
};

// ========================================
// UTILITY FUNCTIONS
// ========================================
function log(message, data = null) {
  if (data) {
    console.log(message, data);
  } else {
    console.log(message);
  }
}

function handleError(category, error, element) {
  console.error(`${category} failed:`, error);
  if (element) {
    element.textContent = "Error";
  }
}

// ========================================
// DONOR COUNT
// ========================================
export async function loadDonorCount() {
  const element = document.getElementById("donor-count");
  if (!element) return;

  try {
    // Load initial data
    const { data, error } = await supabase.rpc("get_donor_count");
    if (error) throw error;

    const count = data?.donor_count || 0;
    element.textContent = count;
    log("Donor count initialized:", count);

    // Subscribe to updates
    supabase
      .channel(CHANNELS.DONOR_COUNT)
      .on("broadcast", { event: EVENTS.DONOR_COUNT }, (payload) => {
        const data = payload.payload;

        if (data?.donor_count !== undefined) {
          element.textContent = data.donor_count;
          log("Donor count updated:", data.donor_count);
        } else {
          console.error("Invalid donor count payload:", payload);
        }
      })
      .subscribe((status) => {
        log("Donor count subscription:", status);
      });
  } catch (error) {
    handleError("Donor count", error, element);
  }
}

// ========================================
// DONATION COUNT
// ========================================
export async function loadDonationCount() {
  const element = document.getElementById("donation-count");
  if (!element) return;

  try {
    // Load initial data
    const { data, error } = await supabase.rpc("get_donation_count");
    if (error) throw error;

    const count = data || 0;
    element.textContent = count;
    log("Donation count initialized:", count);

    // Subscribe to updates
    supabase
      .channel(CHANNELS.DONATION_COUNT)
      .on("broadcast", { event: EVENTS.DONATION_COUNT }, (payload) => {
        const data = payload.payload;

        if (data?.donation_count !== undefined) {
          element.textContent = data.donation_count;
          log("Donation count updated:", data.donation_count);
        } else {
          console.error("Invalid donation count payload:", payload);
        }
      })
      .subscribe((status) => {
        log("Donation count subscription:", status);
      });
  } catch (error) {
    handleError("Donation count", error, element);
  }
}

// ========================================
// DONATION STATS (Items)
// ========================================
function renderDonationStats(statsData) {
  if (!statsData?.length) {
    return '<div class="p-4 text-gray-500 text-center col-span-3">لا توجد بيانات</div>';
  }

  return statsData
    .map((row) => {
      const isShortage = row.is_in_shortage;
      const shortageBadge = isShortage
        ? '<span class="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">نقص</span>'
        : "";
      const borderColor = isShortage ? "border-red-500" : "border-green-500";

      return `
        <div class="bg-white p-6 rounded-xl shadow text-center border-l-4 ${borderColor}">
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

export async function loadDonationStats() {
  const element = document.getElementById("donation-stats");
  if (!element) return;

  try {
    // Load initial data
    const { data, error } = await supabase.rpc("get_donation_stats");
    if (error) throw error;

    element.innerHTML = renderDonationStats(data);
    log("Donation stats initialized:", `${data?.length || 0} items`);

    // Subscribe to updates
    supabase
      .channel(CHANNELS.DONATION_STATS)
      .on("broadcast", { event: EVENTS.DONATION_STATS }, (payload) => {
        const data = payload.payload;
        const statsArray = data?.items || data;

        if (Array.isArray(statsArray)) {
          element.innerHTML = renderDonationStats(statsArray);
          log("Donation stats updated:", `${statsArray.length} items`);
        } else {
          console.error("Invalid donation stats payload:", payload);
        }
      })
      .subscribe((status) => {
        log("Donation stats subscription:", status);
      });
  } catch (error) {
    handleError("Donation stats", error);
    element.innerHTML = `<div class="p-4 text-red-500 text-center col-span-3">خطأ: ${error.message}</div>`;
  }
}

// ========================================
// MONEY AMOUNT
// ========================================
export async function loadMoneyAmount() {
  const element = document.getElementById("money-amount");
  if (!element) return;

  try {
    // Load initial data
    const { data, error } = await supabase.rpc("get_money_amount");
    if (error) throw error;

    const amount = data || 0;
    element.textContent = `${amount}`;
    log("Money amount initialized:", amount);

    // Subscribe to updates
    supabase
      .channel(CHANNELS.MONEY_AMOUNT)
      .on("broadcast", { event: EVENTS.MONEY_AMOUNT }, (payload) => {
        const data = payload.payload;

        if (data?.amount !== undefined) {
          const currency = data.currency_ar || "د.ت";
          element.textContent = `${data.amount}`;
          log("Money amount updated:", `${data.amount} ${currency}`);
        } else {
          console.error("Invalid money amount payload:", payload);
        }
      })
      .subscribe((status) => {
        log("Money amount subscription:", status);
      });
  } catch (error) {
    handleError("Money amount", error, element);
  }
}

// ========================================
// INITIALIZATION
// ========================================
export function initializeDashboard() {
  loadDonorCount();
  loadDonationCount();
  loadMoneyAmount();
  loadDonationStats();
}
