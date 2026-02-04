import { supabase } from "../supabase_client.js";
import {
  loadDonorCount,
  loadDonationCount,
  loadMoneyAmount,
} from "../supabase_functions.js";

// ═══════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════

let donors = [];
let items = [];
let units = [];
let currentMemberId = null;

// ═══════════════════════════════════════════
// AUTHENTICATION & INITIALIZATION
// ═══════════════════════════════════════════

async function checkAuthAndLoadData() {
  try {
    // Check if user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;

    if (!session) {
      // Not logged in, redirect to login
      window.location.href = "./../login";
      return;
    }

    // Check if user is a staff member
    const { data: isStaff, error: staffError } =
      await supabase.rpc("is_staff_member");

    if (staffError) throw staffError;

    if (!isStaff) {
      alert("غير مصرح لك بالوصول / Unauthorized: Staff access only");
      await supabase.auth.signOut();
      window.location.href = "./../login";
      return;
    }

    // Get current member ID
    const { data: memberId, error: memberError } = await supabase.rpc(
      "get_member_id_from_auth",
    );

    if (memberError) throw memberError;

    if (!memberId) {
      alert("لا يوجد حساب موظف مرتبط بهذا المستخدم / No staff account found");
      await supabase.auth.signOut();
      window.location.href = "./../login";
      return;
    }

    currentMemberId = memberId;

    // Load initial data
    await Promise.all([loadDonors(), loadItems(), loadUnits()]);

    // Initialize form handlers
    initializeFormHandlers();
  } catch (error) {
    console.error("Initialization error:", error);
    showError(
      "خطأ في التحميل / Loading error: " + (error.message || "Unknown error"),
    );
  }
}

// ═══════════════════════════════════════════
// DATA LOADING FUNCTIONS
// ═══════════════════════════════════════════

async function loadDonors() {
  try {
    const { data, error } = await supabase.rpc("get_donors");

    if (error) throw error;

    donors = data || [];

    // Populate donor dropdown
    const select = document.getElementById("existingDonor");
    select.innerHTML =
      '<option value="">اختر متبرع / Select Donor</option>' +
      donors
        .map(
          (donor) =>
            `<option value="${donor.id}">${donor.full_name}${donor.email ? " (" + donor.email + ")" : ""}${donor.phone ? " - " + donor.phone : ""}</option>`,
        )
        .join("");
  } catch (error) {
    console.error("Error loading donors:", error);
    showError("خطأ في تحميل المتبرعين / Error loading donors");
  }
}

async function loadItems() {
  try {
    const { data, error } = await supabase.rpc("get_items");

    if (error) throw error;

    items = data || [];

    // Populate item dropdown
    const select = document.getElementById("item");
    select.innerHTML =
      '<option value="">اختر صنف / Select Item</option>' +
      items
        .map(
          (item) =>
            `<option value="${item.item}">${item.display_name}${item.item_shortage ? " ⚠️ نقص" : ""}</option>`,
        )
        .join("");
  } catch (error) {
    console.error("Error loading items:", error);
    showError("خطأ في تحميل الأصناف / Error loading items");
  }
}

async function loadUnits() {
  try {
    const { data, error } = await supabase.rpc("get_units");

    if (error) throw error;

    units = data || [];

    // Populate unit dropdown
    const select = document.getElementById("unit");
    select.innerHTML =
      '<option value="">اختر وحدة / Select Unit</option>' +
      units
        .map(
          (unit) =>
            `<option value="${unit.unit}">${unit.display_name}</option>`,
        )
        .join("");
  } catch (error) {
    console.error("Error loading units:", error);
    showError("خطأ في تحميل الوحدات / Error loading units");
  }
}

// ═══════════════════════════════════════════
// FORM HANDLERS
// ═══════════════════════════════════════════

function initializeFormHandlers() {
  // Donor type radio buttons
  const donorTypeRadios = document.querySelectorAll('input[name="donorType"]');
  donorTypeRadios.forEach((radio) => {
    radio.addEventListener("change", handleDonorTypeChange);
  });

  // Form submission
  const form = document.getElementById("donationForm");
  form.addEventListener("submit", handleFormSubmit);

  // Initialize donor type display
  handleDonorTypeChange();
}

function handleDonorTypeChange() {
  const donorType = document.querySelector(
    'input[name="donorType"]:checked',
  ).value;

  const existingField = document.getElementById("existingDonorField");
  const newFields = document.getElementById("newDonorFields");

  if (donorType === "existing") {
    existingField.style.display = "block";
    newFields.classList.remove("show");
    document.getElementById("existingDonor").required = true;
    clearNewDonorFields();
  } else if (donorType === "new") {
    existingField.style.display = "none";
    newFields.classList.add("show");
    document.getElementById("existingDonor").required = false;
    document.getElementById("donorName").required = true;
    document.getElementById("donorFamilyName").required = true;
  } else if (donorType === "anonymous") {
    existingField.style.display = "none";
    newFields.classList.remove("show");
    document.getElementById("existingDonor").required = false;
    clearNewDonorFields();
  }
}

function clearNewDonorFields() {
  document.getElementById("donorName").value = "";
  document.getElementById("donorFamilyName").value = "";
  document.getElementById("donorEmail").value = "";
  document.getElementById("donorPhone").value = "";
  document.getElementById("donorName").required = false;
  document.getElementById("donorFamilyName").required = false;
}

// ═══════════════════════════════════════════
// ADD NEW ITEM/UNIT FUNCTIONS
// ═══════════════════════════════════════════

window.toggleNewItem = function () {
  const checkbox = document.getElementById("addNewItem");
  const field = document.getElementById("newItemField");

  if (checkbox.checked) {
    field.style.display = "block";
    document.getElementById("item").disabled = true;
  } else {
    field.style.display = "none";
    document.getElementById("item").disabled = false;
    document.getElementById("newItemEn").value = "";
    document.getElementById("newItemAr").value = "";
  }
};

window.toggleNewUnit = function () {
  const checkbox = document.getElementById("addNewUnit");
  const field = document.getElementById("newUnitField");

  if (checkbox.checked) {
    field.style.display = "block";
    document.getElementById("unit").disabled = true;
  } else {
    field.style.display = "none";
    document.getElementById("unit").disabled = false;
    document.getElementById("newUnitEn").value = "";
    document.getElementById("newUnitAr").value = "";
  }
};

window.addNewItem = async function () {
  const itemEn = document.getElementById("newItemEn").value.trim();
  const itemAr = document.getElementById("newItemAr").value.trim();

  if (!itemEn || !itemAr) {
    showError(
      "الرجاء إدخال اسم الصنف بالعربية والإنجليزية / Please enter item name in both languages",
    );
    return;
  }

  try {
    const { data, error } = await supabase.rpc("insert_item", {
      p_item: itemEn,
      p_item_ar: itemAr,
      p_item_importance_priority: 100,
      p_item_shortage: false,
    });

    if (error) throw error;

    // Reload items and select the new one
    await loadItems();
    document.getElementById("item").value = data;
    document.getElementById("addNewItem").checked = false;
    toggleNewItem();

    showSuccess("تم إضافة الصنف بنجاح / Item added successfully");
  } catch (error) {
    console.error("Error adding item:", error);
    if (error.message.includes("duplicate key")) {
      showError("هذا الصنف موجود بالفعل / This item already exists");
    } else {
      showError("خطأ في إضافة الصنف / Error adding item: " + error.message);
    }
  }
};

window.addNewUnit = async function () {
  const unitEn = document.getElementById("newUnitEn").value.trim();
  const unitAr = document.getElementById("newUnitAr").value.trim();

  if (!unitEn || !unitAr) {
    showError(
      "الرجاء إدخال اسم الوحدة بالعربية والإنجليزية / Please enter unit name in both languages",
    );
    return;
  }

  try {
    const { data, error } = await supabase.rpc("insert_unit", {
      p_unit: unitEn,
      p_unit_ar: unitAr,
    });

    if (error) throw error;

    // Reload units and select the new one
    await loadUnits();
    document.getElementById("unit").value = data;
    document.getElementById("addNewUnit").checked = false;
    toggleNewUnit();

    showSuccess("تم إضافة الوحدة بنجاح / Unit added successfully");
  } catch (error) {
    console.error("Error adding unit:", error);
    if (error.message.includes("duplicate key")) {
      showError("هذه الوحدة موجودة بالفعل / This unit already exists");
    } else {
      showError("خطأ في إضافة الوحدة / Error adding unit: " + error.message);
    }
  }
};

// ═══════════════════════════════════════════
// FORM SUBMISSION
// ═══════════════════════════════════════════

async function handleFormSubmit(event) {
  event.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  const btnText = document.getElementById("btnText");
  const originalText = btnText.textContent;

  try {
    // Disable submit button
    submitBtn.disabled = true;
    btnText.textContent = "جاري الحفظ... / Saving...";

    // Hide any previous messages
    hideMessages();

    // Get donor ID
    const donorId = await getDonorId();
    if (!donorId) {
      throw new Error("Failed to get donor ID");
    }

    // Get item
    const item = await getItemValue();
    if (!item) {
      throw new Error("Please select or add an item");
    }

    // Get unit
    const unit = await getUnitValue();
    if (!unit) {
      throw new Error("Please select or add a unit");
    }

    // Get quantity
    const quantity = parseFloat(document.getElementById("quantity").value);
    if (!quantity || quantity <= 0) {
      throw new Error("Please enter a valid quantity");
    }

    // Get notes
    const notes = document.getElementById("notes").value.trim() || null;

    // Insert donation
    const { data: donationId, error } = await supabase.rpc("insert_donation", {
      p_item: item,
      p_quantity: quantity,
      p_unit: unit,
      p_donor_id: donorId,
      p_notes: notes,
    });

    if (error) throw error;

    // Success!
    showSuccess(
      `تم حفظ التبرع بنجاح! رقم التبرع: ${donationId} / Donation saved successfully! ID: ${donationId}`,
    );

    // Reset form after short delay
    setTimeout(() => {
      resetForm();
    }, 1500);
  } catch (error) {
    console.error("Error submitting donation:", error);
    showError("خطأ في حفظ التبرع / Error saving donation: " + error.message);
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    btnText.textContent = originalText;
  }
}

async function getDonorId() {
  const donorType = document.querySelector(
    'input[name="donorType"]:checked',
  ).value;

  if (donorType === "existing") {
    const donorId = document.getElementById("existingDonor").value;
    if (!donorId) {
      throw new Error("الرجاء اختيار متبرع / Please select a donor");
    }
    return parseInt(donorId);
  } else if (donorType === "new") {
    // Create new donor
    const name = document.getElementById("donorName").value.trim();
    const familyName = document.getElementById("donorFamilyName").value.trim();
    const email = document.getElementById("donorEmail").value.trim() || null;
    const phone = document.getElementById("donorPhone").value.trim() || null;

    if (!name || !familyName) {
      throw new Error(
        "الرجاء إدخال الاسم واسم العائلة / Please enter name and family name",
      );
    }

    const { data: newDonorId, error } = await supabase.rpc("insert_donor", {
      p_name: name,
      p_family_name: familyName,
      p_email: email,
      p_phone: phone,
      p_is_anonymous: false,
    });

    if (error) throw error;

    // Reload donors list
    await loadDonors();

    return newDonorId;
  } else if (donorType === "anonymous") {
    // Create anonymous donor
    const { data: newDonorId, error } = await supabase.rpc("insert_donor", {
      p_name: null,
      p_family_name: null,
      p_email: null,
      p_phone: null,
      p_is_anonymous: true,
    });

    if (error) throw error;

    return newDonorId;
  }

  throw new Error("Invalid donor type");
}

async function getItemValue() {
  const addNewItemChecked = document.getElementById("addNewItem").checked;

  if (addNewItemChecked) {
    const itemEn = document.getElementById("newItemEn").value.trim();
    if (!itemEn) {
      throw new Error("الرجاء إدخال اسم الصنف / Please enter item name");
    }
    return itemEn.toLowerCase();
  } else {
    const item = document.getElementById("item").value;
    if (!item) {
      throw new Error("الرجاء اختيار صنف / Please select an item");
    }
    return item;
  }
}

async function getUnitValue() {
  const addNewUnitChecked = document.getElementById("addNewUnit").checked;

  if (addNewUnitChecked) {
    const unitEn = document.getElementById("newUnitEn").value.trim();
    if (!unitEn) {
      throw new Error("الرجاء إدخال اسم الوحدة / Please enter unit name");
    }
    return unitEn.toLowerCase();
  } else {
    const unit = document.getElementById("unit").value;
    if (!unit) {
      throw new Error("الرجاء اختيار وحدة / Please select a unit");
    }
    return unit;
  }
}

// ═══════════════════════════════════════════
// RESET FORM
// ═══════════════════════════════════════════

window.resetForm = function () {
  // Reset form
  document.getElementById("donationForm").reset();

  // Reset donor type to existing
  document.querySelector('input[name="donorType"][value="existing"]').checked =
    true;
  handleDonorTypeChange();

  // Reset new item/unit checkboxes
  document.getElementById("addNewItem").checked = false;
  toggleNewItem();
  document.getElementById("addNewUnit").checked = false;
  toggleNewUnit();

  // Hide messages
  hideMessages();
};

// ═══════════════════════════════════════════
// MESSAGE HANDLING
// ═══════════════════════════════════════════

function showSuccess(message) {
  hideMessages();
  const successMsg = document.getElementById("successMessage");
  successMsg.textContent = message;
  successMsg.classList.add("show");

  // Auto-hide after 5 seconds
  setTimeout(() => {
    successMsg.classList.remove("show");
  }, 5000);
}

function showError(message) {
  hideMessages();
  const errorMsg = document.getElementById("errorMessage");
  errorMsg.textContent = message;
  errorMsg.classList.add("show");

  // Auto-hide after 8 seconds
  setTimeout(() => {
    errorMsg.classList.remove("show");
  }, 8000);
}

function hideMessages() {
  document.getElementById("successMessage").classList.remove("show");
  document.getElementById("errorMessage").classList.remove("show");
}

// ═══════════════════════════════════════════
// INITIALIZE ON PAGE LOAD
// ═══════════════════════════════════════════

checkAuthAndLoadData();

loadDonorCount();
loadDonationCount();
loadMoneyAmount();
