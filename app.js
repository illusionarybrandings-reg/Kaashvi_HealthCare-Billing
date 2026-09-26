/**
 * Kaashvi Healthcare - Bill Generator & Invoice Management System
 * Core Application Logic & Calculations
 */

// Default State & Configuration
const DEFAULT_COMPANY = {
  name: "Kaashvi Healthcare",
  subtitle: "Care & Healing at Your Doorstep",
  regName: "Kaashvi Home Health Care",
  tagline: "Professional Home Nursing, ICU & Medical Services",
  address: "#45, 2nd Cross, Healthcare Layout, Bengaluru, Karnataka - 560068",
  phone: "+91 98765 43210 / +91 80 1234 5678",
  email: "billing@kaashvihealthcare.com",
  website: "www.kaashvihealthcare.com",
  gstin: "29AAAAK1234A1Z5",
  regNo: "KHC/2026/BLR-8921",
  upiId: "kaashvihealthcare@ybl",
  signatory: "Authorized Signatory",
  designation: "Finance & Accounts Manager"
};

// Popular Home Healthcare Presets
const SERVICE_PRESETS = [
  { name: "12-Hour Nursing Care (Day/Night Shift)", rate: 1200, unit: "Days", desc: "Day Shift (8:00 AM - 8:00 PM) - Dedicated GNM Staff Nurse", tax: 0 },
  { name: "24-Hour Residential Nursing Care", rate: 2200, unit: "Days", desc: "24-Hour Live-in Qualified Bedside Nurse Care", tax: 0 },
  { name: "ICU Trained Nurse (24 Hours Critical Care)", rate: 3000, unit: "Days", desc: "Tracheostomy, Ventilator, BiPAP & Critical Vitals Monitoring", tax: 0 },
  { name: "Elderly Care Attendant / Bedridden Care", rate: 900, unit: "Days", desc: "Personal Hygiene, Feeding, Mobility Support & Medication", tax: 0 },
  { name: "Physiotherapy Session (Home Visit)", rate: 800, unit: "Sessions", desc: "Neuro / Ortho Rehabilitation & Mobility Exercise (45 mins)", tax: 0 },
  { name: "Doctor Home Visit & Comprehensive Review", rate: 1500, unit: "Visits", desc: "Senior Physician General & Geriatric Health Assessment", tax: 0 },
  { name: "Medical Equipment Rental - Oxygen Concentrator (10L)", rate: 5000, unit: "Month", desc: "High Flow 10LPM Continuous Oxygen Machine with Nasal Cannula", tax: 12 },
  { name: "Medical Equipment Rental - 5-Function ICU Bed", rate: 4500, unit: "Month", desc: "Motorized Electric Hospital Bed with Mattress & Side Rails", tax: 12 },
  { name: "Post-Surgical Dressing & Wound Management", rate: 600, unit: "Visits", desc: "Sterile Aseptic Dressing, Suture Removal & Antiseptic Care", tax: 0 },
  { name: "Diagnostic Blood Sample Collection & Lab Panel", rate: 1800, unit: "Tests", desc: "Complete Blood Count, KFT, LFT, Lipid, HbA1c & Electrolytes", tax: 0 }
];

// Sample Initial Demo Invoice Data
const SAMPLE_INVOICE = {
  invoiceNo: "KHC-INV-2026-0842",
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  patientName: "Smt. Shailaja Ramachandran",
  patientAge: "72",
  patientGender: "Female",
  patientId: "KHC-P-2026-109",
  patientPhone: "+91 98450 12345",
  patientEmail: "ramachandran.family@example.com",
  patientAddress: "Flat 402, Green Glen Heights, Bellandur, Bengaluru - 560103",
  doctorName: "Dr. Arvind K. Rao, MD (Geriatrics)",
  careManager: "Sister Mary Varghese (Nursing Supervisor)",
  serviceStartDate: "2026-09-01",
  serviceEndDate: "2026-09-15",
  paymentStatus: "Partial",
  paymentMode: "PhonePe / UPI",
  transactionId: "TXN984572834019",
  advancePaid: 10000,
  taxRate: 0,
  termsNotes: "1. Thank you for entrusting Kaashvi Healthcare with your loved one's care.\n2. Invoices are due within 7 days of issue date.\n3. Payments can be directly transferred via PhonePe / GPay / NetBanking using the QR code below.\n4. For billing inquiries, contact billing@kaashvihealthcare.com or +91 98765 43210.",
  items: [
    {
      description: "24-Hour Residential Nursing Care",
      details: "24h Dedicated Live-in GNM Nursing Care (15 Days)",
      qty: 15,
      rate: 2200,
      discount: 5,
      tax: 0
    },
    {
      description: "Medical Equipment Rental - 5-Function ICU Bed",
      details: "Motorized Electric Hospital Bed with Alpha Air Mattress",
      qty: 1,
      rate: 4500,
      discount: 0,
      tax: 12
    },
    {
      description: "Physiotherapy Session (Home Visit)",
      details: "Post-Stroke Mobility & Muscle Strengthening (10 Sessions)",
      qty: 10,
      rate: 800,
      discount: 0,
      tax: 0
    },
    {
      description: "Doctor Home Visit & Comprehensive Review",
      details: "Geriatric Specialist Bi-Weekly In-Person Assessment",
      qty: 2,
      rate: 1500,
      discount: 0,
      tax: 0
    }
  ]
};

// Global App State
let appData = {
  company: { ...DEFAULT_COMPANY },
  invoice: JSON.parse(JSON.stringify(SAMPLE_INVOICE))
};

// Initialize Application on DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  initDateDefaults();
  renderPresetPills();
  loadStoredCompany();
  populateFormFields();
  renderServiceRows();
  calculateTotals();
  initEventListeners();
  initSignature();
});

// Helper: Format Date to DD-MMM-YYYY
function formatDateDisplay(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
}

// Helper: Format Currency in Indian Format
function formatINR(num) {
  const val = Number(num) || 0;
  return "₹" + val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Set Default Today Dates
function initDateDefaults() {
  const today = new Date().toISOString().split('T')[0];
  const due = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  if (!appData.invoice.invoiceDate) appData.invoice.invoiceDate = today;
  if (!appData.invoice.dueDate) appData.invoice.dueDate = due;
  if (!appData.invoice.invoiceNo) {
    appData.invoice.invoiceNo = generateInvoiceNumber();
  }
}

// Auto-generate invoice number format: KHC-INV-YYYY-XXXX
function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `KHC-INV-${year}-${rand}`;
}

// Render Quick Service Preset Pills
function renderPresetPills() {
  const container = document.getElementById("presetPillsContainer");
  if (!container) return;
  
  container.innerHTML = "";
  SERVICE_PRESETS.forEach((preset, idx) => {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "preset-pill";
    pill.innerHTML = `<span>+ ${preset.name.split('(')[0].trim()}</span>`;
    pill.title = `Add ${preset.name} - ₹${preset.rate}/${preset.unit}`;
    pill.onclick = () => addPresetService(preset);
    container.appendChild(pill);
  });
}

// Add Preset Service as New Row
function addPresetService(preset) {
  appData.invoice.items.push({
    description: preset.name,
    details: preset.desc || "",
    qty: 1,
    rate: preset.rate,
    discount: 0,
    tax: preset.tax || 0
  });
  renderServiceRows();
  calculateTotals();
  showToast(`Added "${preset.name.split('(')[0].trim()}"`, "success");
}

// Populate UI Form Fields from State
function populateFormFields() {
  const inv = appData.invoice;
  const comp = appData.company;

  // Invoice Meta
  setVal("invoiceNo", inv.invoiceNo);
  setVal("invoiceDate", inv.invoiceDate);
  setVal("dueDate", inv.dueDate);
  setVal("paymentStatus", inv.paymentStatus || "Paid");
  setVal("paymentMode", inv.paymentMode || "PhonePe / UPI");
  setVal("transactionId", inv.transactionId || "");

  // Patient Info
  setVal("patientName", inv.patientName);
  setVal("patientAge", inv.patientAge);
  setVal("patientGender", inv.patientGender);
  setVal("patientId", inv.patientId);
  setVal("patientPhone", inv.patientPhone);
  setVal("patientEmail", inv.patientEmail);
  setVal("patientAddress", inv.patientAddress);
  setVal("doctorName", inv.doctorName);
  setVal("careManager", inv.careManager);
  setVal("serviceStartDate", inv.serviceStartDate);
  setVal("serviceEndDate", inv.serviceEndDate);
  setVal("advancePaid", inv.advancePaid || 0);
  setVal("termsNotes", inv.termsNotes || "");

  // Company Settings
  setVal("compName", comp.name);
  setVal("compRegName", comp.regName);
  setVal("compTagline", comp.tagline);
  setVal("compAddress", comp.address);
  setVal("compPhone", comp.phone);
  setVal("compEmail", comp.email);
  setVal("compWebsite", comp.website);
  setVal("compGstin", comp.gstin);
  setVal("compRegNo", comp.regNo);
  setVal("compUpiId", comp.upiId);
  setVal("compSignatory", comp.signatory);
  setVal("compDesignation", comp.designation);
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val !== undefined && val !== null ? val : "";
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

// Render Editable Services Table Rows
function renderServiceRows() {
  const tbody = document.getElementById("servicesTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!appData.invoice.items || appData.invoice.items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 24px; color: var(--text-muted);">
      No services added yet. Click <strong>+ Add Service Item</strong> or pick from quick presets above.
    </td></tr>`;
    return;
  }

  appData.invoice.items.forEach((item, index) => {
    const tr = document.createElement("tr");
    
    // Calculate line total for display
    const baseAmt = (Number(item.qty) || 0) * (Number(item.rate) || 0);
    const discAmt = baseAmt * ((Number(item.discount) || 0) / 100);
    const taxableAmt = baseAmt - discAmt;
    const taxAmt = taxableAmt * ((Number(item.tax) || 0) / 100);
    const lineTotal = taxableAmt + taxAmt;

    tr.innerHTML = `
      <td class="row-handle" data-label="#">
        <strong>${index + 1}</strong>
      </td>
      <td data-label="Service Name">
        <input type="text" class="input-control item-desc" placeholder="e.g. 24h Nursing Care" value="${escapeHtml(item.description || '')}" onchange="updateItem(${index}, 'description', this.value)" required>
      </td>
      <td data-label="Shift / Details">
        <input type="text" class="input-control item-details" placeholder="Shift / Dates / Session Notes" value="${escapeHtml(item.details || '')}" onchange="updateItem(${index}, 'details', this.value)">
      </td>
      <td data-label="Qty / Days">
        <input type="number" class="input-control item-qty" min="1" step="0.5" value="${item.qty || 1}" oninput="updateItem(${index}, 'qty', this.value)" style="text-align:center;">
      </td>
      <td data-label="Rate (₹)">
        <input type="number" class="input-control item-rate" min="0" step="10" value="${item.rate || 0}" oninput="updateItem(${index}, 'rate', this.value)" style="text-align:right;">
      </td>
      <td data-label="Disc (%)">
        <input type="number" class="input-control item-disc" min="0" max="100" step="1" value="${item.discount || 0}" oninput="updateItem(${index}, 'discount', this.value)" style="text-align:center;">
      </td>
      <td data-label="GST (%)">
        <select class="input-control item-tax" onchange="updateItem(${index}, 'tax', this.value)" style="text-align:center;">
          <option value="0" ${Number(item.tax) === 0 ? 'selected' : ''}>0% (Exempt)</option>
          <option value="5" ${Number(item.tax) === 5 ? 'selected' : ''}>5%</option>
          <option value="12" ${Number(item.tax) === 12 ? 'selected' : ''}>12%</option>
          <option value="18" ${Number(item.tax) === 18 ? 'selected' : ''}>18%</option>
        </select>
      </td>
      <td data-label="Amount (₹)" class="item-amount-display">
        ${formatINR(lineTotal)}
      </td>
      <td data-label="Action" style="text-align:center;">
        <button type="button" class="btn btn-danger-ghost" title="Delete row" onclick="deleteServiceRow(${index})">
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Add Blank Service Row
function addBlankServiceRow() {
  appData.invoice.items.push({
    description: "",
    details: "",
    qty: 1,
    rate: 0,
    discount: 0,
    tax: 0
  });
  renderServiceRows();
  calculateTotals();
  
  // Focus the newly created row's description input
  setTimeout(() => {
    const inputs = document.querySelectorAll(".item-desc");
    if (inputs.length > 0) inputs[inputs.length - 1].focus();
  }, 50);
}

// Delete Single Service Row
function deleteServiceRow(index) {
  appData.invoice.items.splice(index, 1);
  renderServiceRows();
  calculateTotals();
}

// Clear All Service Rows
function clearAllServices() {
  if (appData.invoice.items.length === 0) return;
  if (confirm("Are you sure you want to remove all service items?")) {
    appData.invoice.items = [];
    renderServiceRows();
    calculateTotals();
  }
}

// Update Item Field and Recalculate
function updateItem(index, field, value) {
  if (!appData.invoice.items[index]) return;
  
  if (field === 'qty' || field === 'rate' || field === 'discount' || field === 'tax') {
    appData.invoice.items[index][field] = Number(value) || 0;
  } else {
    appData.invoice.items[index][field] = value;
  }
  
  // Re-calculate line display without re-rendering entire table to preserve focus
  calculateTotals();
  updateTableAmountCell(index);
}

function updateTableAmountCell(index) {
  const tbody = document.getElementById("servicesTableBody");
  if (!tbody) return;
  const rows = tbody.querySelectorAll("tr");
  if (rows[index]) {
    const item = appData.invoice.items[index];
    const baseAmt = (Number(item.qty) || 0) * (Number(item.rate) || 0);
    const discAmt = baseAmt * ((Number(item.discount) || 0) / 100);
    const taxableAmt = baseAmt - discAmt;
    const taxAmt = taxableAmt * ((Number(item.tax) || 0) / 100);
    const lineTotal = taxableAmt + taxAmt;
    
    const amountCell = rows[index].querySelector(".item-amount-display");
    if (amountCell) amountCell.textContent = formatINR(lineTotal);
  }
}

// Calculate Auto Days between Start & End Date
function autoCalculateServiceDays() {
  const start = getVal("serviceStartDate");
  const end = getVal("serviceEndDate");
  
  if (!start || !end) {
    showToast("Please enter both Service Start & End dates", "info");
    return;
  }
  
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive of start day
  
  if (diffDays <= 0) {
    showToast("End date must be on or after start date", "error");
    return;
  }
  
  // Update the first nursing/daily item with calculated days if present
  let updated = false;
  appData.invoice.items.forEach(item => {
    if (item.description.toLowerCase().includes("nursing") || item.description.toLowerCase().includes("care") || item.description.toLowerCase().includes("attendant")) {
      item.qty = diffDays;
      if (!item.details) item.details = `Period: ${formatDateDisplay(start)} to ${formatDateDisplay(end)} (${diffDays} Days)`;
      updated = true;
    }
  });
  
  if (updated) {
    renderServiceRows();
    calculateTotals();
    showToast(`Updated care items to ${diffDays} days`, "success");
  } else {
    showToast(`Total Duration: ${diffDays} Days`, "info");
  }
}

// Real-time Calculations
function calculateTotals() {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  let totalItemsCount = 0;

  appData.invoice.items.forEach(item => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const discountPercent = Number(item.discount) || 0;
    const taxPercent = Number(item.tax) || 0;

    const baseAmount = qty * rate;
    const discountAmount = baseAmount * (discountPercent / 100);
    const taxableAmount = baseAmount - discountAmount;
    const taxAmount = taxableAmount * (taxPercent / 100);

    subtotal += baseAmount;
    totalDiscount += discountAmount;
    totalTax += taxAmount;
    totalItemsCount += qty;
  });

  const taxableTotal = subtotal - totalDiscount;
  const rawGrandTotal = taxableTotal + totalTax;
  const grandTotalRounded = Math.round(rawGrandTotal);
  const roundOff = (grandTotalRounded - rawGrandTotal);

  const advancePaid = Number(getVal("advancePaid")) || 0;
  const balanceDue = grandTotalRounded - advancePaid;

  // Update Summary UI
  setText("sumSubtotal", formatINR(subtotal));
  setText("sumDiscount", `- ${formatINR(totalDiscount)}`);
  setText("sumTaxable", formatINR(taxableTotal));
  setText("sumTax", `+ ${formatINR(totalTax)}`);
  setText("sumRoundOff", (roundOff >= 0 ? "+ " : "- ") + formatINR(Math.abs(roundOff)));
  setText("sumGrandTotal", formatINR(grandTotalRounded));
  setText("sumAdvance", `- ${formatINR(advancePaid)}`);
  
  const balanceEl = document.getElementById("sumBalanceDue");
  const balanceRow = document.getElementById("balanceRow");
  if (balanceEl && balanceRow) {
    balanceEl.textContent = formatINR(balanceDue);
    if (balanceDue <= 0) {
      balanceRow.className = "sum-row balance-due balance-cleared";
      balanceRow.querySelector("span:first-child").innerHTML = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style="vertical-align:middle;margin-right:4px;"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg> Fully Settled / Paid`;
    } else {
      balanceRow.className = "sum-row balance-due";
      balanceRow.querySelector("span:first-child").textContent = "Balance Due:";
    }
  }

  // Live sticky bar summary
  setText("stickyTotalDisplay", formatINR(grandTotalRounded));
  setText("stickyBalanceDisplay", formatINR(balanceDue));

  // Amount in Words
  const amountWords = convertNumberToIndianWords(grandTotalRounded);
  setText("amountInWordsDisplay", amountWords);

  // Store calculated financials in state
  appData.invoice.financials = {
    subtotal,
    totalDiscount,
    taxableTotal,
    totalTax,
    roundOff,
    grandTotal: grandTotalRounded,
    advancePaid,
    balanceDue,
    amountWords,
    totalItemsCount
  };
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// Convert Number to Words in Indian Currency Standard (Crores, Lakhs, Thousands)
function convertNumberToIndianWords(amount) {
  const num = Math.floor(Math.abs(Number(amount) || 0));
  if (num === 0) return "Zero Rupees Only";

  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
             'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '');
    return '';
  }

  let words = '';
  let crore = Math.floor(num / 10000000);
  let remainder = num % 10000000;
  let lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  let thousand = Math.floor(remainder / 1000);
  let hundred = remainder % 1000;

  if (crore > 0) {
    words += inWords(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += inWords(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += inWords(thousand) + ' Thousand ';
  }
  if (hundred > 0) {
    words += inWords(hundred) + ' ';
  }

  return `Rupees ${words.trim()} Only`;
}

// Sync Form Input Data to App State
function syncFormToState() {
  appData.invoice.invoiceNo = getVal("invoiceNo") || generateInvoiceNumber();
  appData.invoice.invoiceDate = getVal("invoiceDate");
  appData.invoice.dueDate = getVal("dueDate");
  appData.invoice.paymentStatus = getVal("paymentStatus");
  appData.invoice.paymentMode = getVal("paymentMode");
  appData.invoice.transactionId = getVal("transactionId");

  appData.invoice.patientName = getVal("patientName");
  appData.invoice.patientAge = getVal("patientAge");
  appData.invoice.patientGender = getVal("patientGender");
  appData.invoice.patientId = getVal("patientId");
  appData.invoice.patientPhone = getVal("patientPhone");
  appData.invoice.patientEmail = getVal("patientEmail");
  appData.invoice.patientAddress = getVal("patientAddress");
  appData.invoice.doctorName = getVal("doctorName");
  appData.invoice.careManager = getVal("careManager");
  appData.invoice.serviceStartDate = getVal("serviceStartDate");
  appData.invoice.serviceEndDate = getVal("serviceEndDate");
  appData.invoice.advancePaid = Number(getVal("advancePaid")) || 0;
  appData.invoice.termsNotes = getVal("termsNotes");

  // Company settings
  appData.company.name = getVal("compName") || DEFAULT_COMPANY.name;
  appData.company.regName = getVal("compRegName") || DEFAULT_COMPANY.regName;
  appData.company.tagline = getVal("compTagline") || DEFAULT_COMPANY.tagline;
  appData.company.address = getVal("compAddress") || DEFAULT_COMPANY.address;
  appData.company.phone = getVal("compPhone") || DEFAULT_COMPANY.phone;
  appData.company.email = getVal("compEmail") || DEFAULT_COMPANY.email;
  appData.company.website = getVal("compWebsite") || DEFAULT_COMPANY.website;
  appData.company.gstin = getVal("compGstin") || DEFAULT_COMPANY.gstin;
  appData.company.regNo = getVal("compRegNo") || DEFAULT_COMPANY.regNo;
  appData.company.upiId = getVal("compUpiId") || DEFAULT_COMPANY.upiId;
  appData.company.signatory = getVal("compSignatory") || DEFAULT_COMPANY.signatory;
  appData.company.designation = getVal("compDesignation") || DEFAULT_COMPANY.designation;

  // Save company config to localStorage
  localStorage.setItem("kaashvi_company_config", JSON.stringify(appData.company));
}

function loadStoredCompany() {
  try {
    const saved = localStorage.getItem("kaashvi_company_config");
    if (saved) {
      appData.company = { ...DEFAULT_COMPANY, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Error loading company config:", e);
  }
}

// Generate & Render Printable Invoice Modal
function generateInvoicePreview() {
  syncFormToState();
  calculateTotals();
  
  if (!appData.invoice.patientName) {
    showToast("Please enter Patient Name before generating bill", "error");
    const nameInput = document.getElementById("patientName");
    if (nameInput) nameInput.focus();
    return;
  }
  
  if (!appData.invoice.items || appData.invoice.items.length === 0) {
    showToast("Please add at least one medical/nursing service item", "error");
    return;
  }

  const inv = appData.invoice;
  const comp = appData.company;
  const fin = inv.financials;

  // Modal Header / Meta
  setText("invCompanyTitle", comp.name);
  setText("invCompanyTagline", comp.tagline);
  
  const compMetaHtml = `
    <strong>${escapeHtml(comp.regName || comp.name)}</strong><br>
    ${escapeHtml(comp.address)}<br>
    <strong>Ph:</strong> ${escapeHtml(comp.phone)} | <strong>Email:</strong> ${escapeHtml(comp.email)}<br>
    <strong>GSTIN:</strong> ${escapeHtml(comp.gstin)} | <strong>Reg. No:</strong> ${escapeHtml(comp.regNo)}
  `;
  const compMetaEl = document.getElementById("invCompanyMeta");
  if (compMetaEl) compMetaEl.innerHTML = compMetaHtml;

  // Patient / Invoice Info Grid
  setText("invNoDisplay", inv.invoiceNo);
  setText("invDateDisplay", formatDateDisplay(inv.invoiceDate));
  setText("invDueDateDisplay", formatDateDisplay(inv.dueDate));
  
  const statusEl = document.getElementById("invStatusBadge");
  if (statusEl) {
    const st = (inv.paymentStatus || 'Paid').toLowerCase();
    statusEl.className = `status-pill status-${st}`;
    statusEl.textContent = inv.paymentStatus || 'PAID';
  }
  
  setText("invPaymentMode", `${inv.paymentMode || 'PhonePe / UPI'}${inv.transactionId ? ' (Ref: ' + inv.transactionId + ')' : ''}`);
  setText("invPatientName", inv.patientName);
  setText("invPatientAgeGender", `${inv.patientAge ? inv.patientAge + ' Yrs / ' : ''}${inv.patientGender || 'Unspecified'}`);
  setText("invPatientId", inv.patientId || 'KHC-P-' + new Date().getFullYear());
  setText("invPatientPhone", inv.patientPhone || '-');
  setText("invPatientAddress", inv.patientAddress || '-');
  setText("invDoctorName", inv.doctorName || 'Dr. Consultant / Care Specialist');
  
  // Billing Period
  const startStr = inv.serviceStartDate ? formatDateDisplay(inv.serviceStartDate) : '';
  const endStr = inv.serviceEndDate ? formatDateDisplay(inv.serviceEndDate) : '';
  const periodStr = startStr && endStr ? `${startStr} to ${endStr}` : (startStr || 'As per care schedule');
  setText("invBillingPeriod", periodStr);

  // Render Invoice Items Table
  const invTbody = document.getElementById("invItemsTbody");
  if (invTbody) {
    invTbody.innerHTML = "";
    inv.items.forEach((item, idx) => {
      const baseAmt = (Number(item.qty) || 0) * (Number(item.rate) || 0);
      const discAmt = baseAmt * ((Number(item.discount) || 0) / 100);
      const taxableAmt = baseAmt - discAmt;
      const taxAmt = taxableAmt * ((Number(item.tax) || 0) / 100);
      const lineTotal = taxableAmt + taxAmt;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td style="text-align:center;">${idx + 1}</td>
        <td>
          <strong style="color: #073b67;">${escapeHtml(item.description)}</strong>
        </td>
        <td style="color: #475569;">
          ${escapeHtml(item.details || '-')}
        </td>
        <td style="text-align:center;">${item.qty}</td>
        <td style="text-align:right;">${formatINR(item.rate)}</td>
        <td style="text-align:right;">${item.tax ? item.tax + '%' : '0%'}</td>
        <td style="text-align:right; font-weight:700;">${formatINR(lineTotal)}</td>
      `;
      invTbody.appendChild(row);
    });
  }

  // Invoice Financials Table
  setText("invSubtotal", formatINR(fin.subtotal));
  setText("invDiscount", fin.totalDiscount > 0 ? `- ${formatINR(fin.totalDiscount)}` : '₹0.00');
  setText("invTax", fin.totalTax > 0 ? `+ ${formatINR(fin.totalTax)}` : '₹0.00');
  setText("invRoundOff", (fin.roundOff >= 0 ? "+ " : "- ") + formatINR(Math.abs(fin.roundOff)));
  setText("invGrandTotal", formatINR(fin.grandTotal));
  setText("invAdvance", fin.advancePaid > 0 ? `- ${formatINR(fin.advancePaid)}` : '₹0.00');
  
  const invBalEl = document.getElementById("invBalanceDue");
  const invBalRow = document.getElementById("invBalanceRow");
  if (invBalEl && invBalRow) {
    invBalEl.textContent = formatINR(fin.balanceDue);
    if (fin.balanceDue <= 0) {
      invBalRow.style.color = "#15803d";
      invBalRow.querySelector("td:first-child").textContent = "Payment Status:";
      invBalEl.textContent = "PAID IN FULL";
    } else {
      invBalRow.style.color = "#dc2626";
      invBalRow.querySelector("td:first-child").textContent = "Balance Due:";
    }
  }

  // Amount in words
  setText("invAmountWords", fin.amountWords);
  
  // Terms & Notes
  setText("invNotesDisplay", inv.termsNotes || DEFAULT_COMPANY.termsNotes);

  // Signatory & Stamp
  setText("invSignatoryName", comp.signatory || DEFAULT_COMPANY.signatory);
  setText("invSignatoryDesignation", comp.designation || DEFAULT_COMPANY.designation);

  // UPI QR Code update
  setText("invUpiIdText", comp.upiId || DEFAULT_COMPANY.upiId);

  // Open Modal
  const modal = document.getElementById("invoiceModal");
  if (modal) {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  // Auto save to history
  saveCurrentInvoiceToStorage();
}

// Close Invoice Modal
function closeInvoiceModal() {
  const modal = document.getElementById("invoiceModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Print Action
function printInvoice() {
  generateInvoicePreview();
  setTimeout(() => {
    window.print();
  }, 250);
}

// Download PDF directly
function downloadInvoicePDF() {
  generateInvoicePreview();
  const element = document.querySelector(".invoice");
  if (!element) return;

  showToast("Preparing PDF download...", "info");

  // Check if html2pdf is available
  if (typeof html2pdf !== "undefined") {
    const invNo = appData.invoice.invoiceNo || "Invoice";
    const patient = (appData.invoice.patientName || "Patient").replace(/[^a-zA-Z0-9]/g, "_");
    const opt = {
      margin: [6, 6, 6, 6],
      filename: `Kaashvi_Healthcare_Bill_${invNo}_${patient}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2.5, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      showToast("PDF downloaded successfully!", "success");
    }).catch(err => {
      console.error(err);
      window.print();
    });
  } else {
    // Native print fallback
    window.print();
  }
}

// Share on WhatsApp
function shareOnWhatsApp() {
  syncFormToState();
  calculateTotals();
  
  const inv = appData.invoice;
  const fin = inv.financials;
  const comp = appData.company;

  const phone = (inv.patientPhone || '').replace(/[^0-9]/g, '');
  
  const message = 
`🏥 *${comp.name}*
_${comp.tagline}_

📄 *TAX INVOICE / BILL DETAILS*
--------------------------------
*Invoice No:* ${inv.invoiceNo}
*Date:* ${formatDateDisplay(inv.invoiceDate)}
*Patient Name:* ${inv.patientName} (${inv.patientGender || ''}, ${inv.patientAge || ''} Yrs)
*UHID / Patient ID:* ${inv.patientId || '-'}
*Doctor:* ${inv.doctorName || '-'}
*Period:* ${formatDateDisplay(inv.serviceStartDate)} to ${formatDateDisplay(inv.serviceEndDate)}

💰 *BILL SUMMARY:*
*Grand Total:* ₹${fin.grandTotal.toLocaleString('en-IN')}
*Advance Paid:* ₹${fin.advancePaid.toLocaleString('en-IN')}
*Balance Due:* ₹${fin.balanceDue.toLocaleString('en-IN')}
*Status:* ${inv.paymentStatus || 'Pending'}

💳 *UPI PAYMENT:*
Scan the PhonePe QR code on the bill or pay directly to UPI ID:
👉 *${comp.upiId}*

_Thank you for choosing Kaashvi Healthcare!_`;

  const encodedMsg = encodeURIComponent(message);
  let whatsappUrl = `https://wa.me/?text=${encodedMsg}`;
  if (phone && phone.length >= 10) {
    const formattedPhone = phone.length === 10 ? '91' + phone : phone;
    whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;
  }

  window.open(whatsappUrl, '_blank');
}

// Save Invoice to LocalStorage History
function saveCurrentInvoiceToStorage() {
  try {
    syncFormToState();
    let history = JSON.parse(localStorage.getItem("kaashvi_invoice_history") || "[]");
    
    // Check if invoice already exists
    const existingIdx = history.findIndex(item => item.invoiceNo === appData.invoice.invoiceNo);
    const invoiceRecord = {
      ...appData.invoice,
      savedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      history[existingIdx] = invoiceRecord;
    } else {
      history.unshift(invoiceRecord);
    }

    // Keep max 50 records
    if (history.length > 50) history = history.slice(0, 50);
    localStorage.setItem("kaashvi_invoice_history", JSON.stringify(history));
    renderHistoryDrawer();
  } catch (e) {
    console.error("Error saving invoice:", e);
  }
}

// Render History Drawer
function renderHistoryDrawer() {
  const container = document.getElementById("historyListContainer");
  if (!container) return;

  const history = JSON.parse(localStorage.getItem("kaashvi_invoice_history") || "[]");
  if (history.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 30px; color: var(--text-muted); font-size: 13px;">
      No saved bills found. Invoices you generate will appear here automatically.
    </div>`;
    return;
  }

  container.innerHTML = "";
  history.forEach((rec, idx) => {
    const item = document.createElement("div");
    item.className = "history-item";
    
    const grand = rec.financials ? rec.financials.grandTotal : 0;
    const balance = rec.financials ? rec.financials.balanceDue : 0;

    item.innerHTML = `
      <div class="history-item-top">
        <strong>${escapeHtml(rec.invoiceNo)}</strong>
        <span class="status-pill status-${(rec.paymentStatus || 'paid').toLowerCase()}">${rec.paymentStatus || 'Paid'}</span>
      </div>
      <div style="font-size: 13px; font-weight: 600; color: #1e293b; margin-top: 2px;">
        ${escapeHtml(rec.patientName)}
      </div>
      <div class="history-item-meta">
        <span>📅 ${formatDateDisplay(rec.invoiceDate)}</span>
        <strong style="color: var(--navy-primary);">${formatINR(grand)}</strong>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:6px; margin-top:8px;">
        <button type="button" class="btn btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="loadInvoiceFromHistory(${idx})">Load</button>
        <button type="button" class="btn btn-danger-ghost" style="padding:4px 8px; font-size:11px;" onclick="deleteInvoiceFromHistory(${idx})">Delete</button>
      </div>
    `;
    container.appendChild(item);
  });
}

function loadInvoiceFromHistory(index) {
  const history = JSON.parse(localStorage.getItem("kaashvi_invoice_history") || "[]");
  if (history[index]) {
    appData.invoice = JSON.parse(JSON.stringify(history[index]));
    populateFormFields();
    renderServiceRows();
    calculateTotals();
    toggleHistoryDrawer(false);
    showToast(`Loaded invoice ${appData.invoice.invoiceNo}`, "success");
  }
}

function deleteInvoiceFromHistory(index) {
  let history = JSON.parse(localStorage.getItem("kaashvi_invoice_history") || "[]");
  history.splice(index, 1);
  localStorage.setItem("kaashvi_invoice_history", JSON.stringify(history));
  renderHistoryDrawer();
  showToast("Record deleted", "info");
}

function toggleHistoryDrawer(open) {
  const drawer = document.getElementById("historyDrawer");
  const backdrop = document.getElementById("drawerBackdrop");
  if (!drawer || !backdrop) return;

  if (open) {
    renderHistoryDrawer();
    drawer.classList.add("open");
    backdrop.style.display = "block";
  } else {
    drawer.classList.remove("open");
    backdrop.style.display = "none";
  }
}

// Reset Form to New Blank Bill
function resetForm() {
  if (confirm("Start a new fresh invoice? Current unsaved entries will be reset.")) {
    appData.invoice = {
      invoiceNo: generateInvoiceNumber(),
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      patientName: "",
      patientAge: "",
      patientGender: "Female",
      patientId: `KHC-P-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      patientPhone: "",
      patientEmail: "",
      patientAddress: "",
      doctorName: "",
      careManager: "",
      serviceStartDate: new Date().toISOString().split('T')[0],
      serviceEndDate: "",
      paymentStatus: "Paid",
      paymentMode: "PhonePe / UPI",
      transactionId: "",
      advancePaid: 0,
      termsNotes: DEFAULT_COMPANY.termsNotes,
      items: [
        {
          description: "24-Hour Residential Nursing Care",
          details: "24-Hour Live-in Qualified Bedside Nurse Care",
          qty: 7,
          rate: 2200,
          discount: 0,
          tax: 0
        }
      ]
    };
    populateFormFields();
    renderServiceRows();
    calculateTotals();
    showToast("New invoice initialized", "success");
  }
}

// Load Demo Sample Data
function loadSampleData() {
  appData.invoice = JSON.parse(JSON.stringify(SAMPLE_INVOICE));
  appData.invoice.invoiceNo = generateInvoiceNumber();
  populateFormFields();
  renderServiceRows();
  calculateTotals();
  showToast("Loaded sample healthcare bill data", "success");
}

// Digital Signature Canvas
let sigCanvas, sigCtx, isDrawing = false;

function initSignature() {
  sigCanvas = document.getElementById("signatureCanvas");
  if (!sigCanvas) return;
  sigCtx = sigCanvas.getContext("2d");
  
  sigCtx.lineWidth = 2;
  sigCtx.lineCap = "round";
  sigCtx.strokeStyle = "#073b67";

  function startPosition(e) {
    isDrawing = true;
    draw(e);
  }

  function finishedPosition() {
    isDrawing = false;
    sigCtx.beginPath();
  }

  function draw(e) {
    if (!isDrawing) return;
    const rect = sigCanvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    sigCtx.lineTo(x, y);
    sigCtx.stroke();
    sigCtx.beginPath();
    sigCtx.moveTo(x, y);
  }

  sigCanvas.addEventListener("mousedown", startPosition);
  sigCanvas.addEventListener("mouseup", finishedPosition);
  sigCanvas.addEventListener("mousemove", draw);

  sigCanvas.addEventListener("touchstart", (e) => { e.preventDefault(); startPosition(e); });
  sigCanvas.addEventListener("touchend", (e) => { e.preventDefault(); finishedPosition(); });
  sigCanvas.addEventListener("touchmove", (e) => { e.preventDefault(); draw(e); });
}

function clearSignature() {
  if (sigCtx && sigCanvas) {
    sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
  }
}

// Toast Notification Utility
function showToast(message, type = "info") {
  let toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "toast-msg";
    document.body.appendChild(toast);
  }

  toast.className = `toast-msg ${type} show`;
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
  `;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

// Event Listeners Registration
function initEventListeners() {
  // Input changes auto-calculation
  const advanceInput = document.getElementById("advancePaid");
  if (advanceInput) {
    advanceInput.addEventListener("input", calculateTotals);
  }

  // Close modal with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeInvoiceModal();
      toggleHistoryDrawer(false);
    }
  });

  // Modal backdrop click
  const modal = document.getElementById("invoiceModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeInvoiceModal();
    });
  }
}
