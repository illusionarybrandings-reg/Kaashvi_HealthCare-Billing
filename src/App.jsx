import React, { useState, useMemo } from 'react';
import { Printer, Download, X, Plus } from 'lucide-react';
import { formatINR, convertNumberToIndianWords } from './utils/formatters';
import KaashviLogo from './components/KaashviLogo';

const SERVICE_OPTIONS = [
  { name: "Home Healthcare Nursing (12-hr)", unit: "12-hr Shift", defaultDesc: "Per day, 12-hr shift", defaultRate: 1200, defaultGst: 0 },
  { name: "Home Healthcare Nursing (24-hr)", unit: "24-hr Shift", defaultDesc: "24-hr live-in qualified nurse", defaultRate: 2200, defaultGst: 0 },
  { name: "Oxygen Concentrator Rent", unit: "Day", defaultDesc: "5 litre unit", defaultRate: 400, defaultGst: 12 },
  { name: "ICU 5-Function Bed Rent", unit: "Month", defaultDesc: "Motorized electric bed with air mattress", defaultRate: 4500, defaultGst: 12 },
  { name: "Patient Attendant / Elderly Care", unit: "Day", defaultDesc: "Daily personal hygiene and mobility support", defaultRate: 900, defaultGst: 0 },
  { name: "Physiotherapy Home Session", unit: "Session", defaultDesc: "Neuro / Ortho rehab home therapy (45 mins)", defaultRate: 800, defaultGst: 0 },
  { name: "Doctor Home Visit & Assessment", unit: "Visit", defaultDesc: "Physician clinical consultation & assessment", defaultRate: 1500, defaultGst: 0 },
  { name: "Post-Surgical Dressing & Wound Care", unit: "Visit", defaultDesc: "Sterile aseptic dressing and antiseptic care", defaultRate: 600, defaultGst: 0 },
  { name: "Custom Service / Item", unit: "Unit", defaultDesc: "", defaultRate: 0, defaultGst: 0 }
];

const BILLING_UNITS = [
  "12-hr Shift",
  "24-hr Shift",
  "Day",
  "Month",
  "Visit",
  "Session",
  "Unit",
  "Hours",
  "Tests"
];

const billMoney = (value) => formatINR(value).replace('Rs. ', '₹ ');
const billNumber = (value) => (Number(value) || 0).toFixed(2);

export default function App() {
  // 1. Invoice & Patient Details
  const [invoiceNo, setInvoiceNo] = useState("KH/2026/7194");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [place, setPlace] = useState("Bangalore, Karnataka");
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("Male");
  const [contactNo, setContactNo] = useState("");
  const [address, setAddress] = useState("");
  const [referredBy, setReferredBy] = useState("");

  // 2. Service Date & Employee Details
  const [serviceDateTime, setServiceDateTime] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  // 3. Services Rendered
  const [services, setServices] = useState([
    {
      id: 1,
      service: "Home Healthcare Nursing (12-hr)",
      description: "Per day, 12-hr shift",
      billingUnit: "12-hr Shift",
      qty: 1,
      rate: 1200,
      gst: 0
    },
    {
      id: 2,
      service: "Oxygen Concentrator Rent",
      description: "5 litre unit",
      billingUnit: "Day",
      qty: 1,
      rate: 400,
      gst: 12
    }
  ]);

  // 4. Tax & Notes
  const [taxType, setTaxType] = useState("Intra-State (CGST + SGST)");
  const [notes, setNotes] = useState("Thank you for choosing Kaashvi Healthcare. Get well soon.");

  // Modal State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [qrUnavailable, setQrUnavailable] = useState(false);
  const [includeSeal, setIncludeSeal] = useState(true);

  // Real-time calculations
  const { subtotal, taxableValue, totalGst, grandTotal, amountWords } = useMemo(() => {
    let sub = 0;
    let gstSum = 0;

    services.forEach(item => {
      const q = Number(item.qty) || 0;
      const r = Number(item.rate) || 0;
      const g = Number(item.gst) || 0;

      const base = q * r;
      const gstAmt = taxType === "Tax Exempt / None" ? 0 : base * (g / 100);

      sub += base;
      gstSum += gstAmt;
    });

    const grand = Math.round(sub + gstSum);
    const words = convertNumberToIndianWords(grand);

    return {
      subtotal: sub,
      taxableValue: sub,
      totalGst: gstSum,
      grandTotal: grand,
      amountWords: words
    };
  }, [services, taxType]);

  // Services handlers
  const handleAddServiceRow = () => {
    setServices(prev => [
      ...prev,
      {
        id: Date.now(),
        service: "Home Healthcare Nursing (12-hr)",
        description: "",
        billingUnit: "Day",
        qty: 1,
        rate: 0,
        gst: 0
      }
    ]);
  };

  const handleUpdateServiceRow = (index, field, value) => {
    setServices(prev => {
      const updated = [...prev];
      if (field === 'service') {
        const matched = SERVICE_OPTIONS.find(opt => opt.name === value);
        updated[index] = {
          ...updated[index],
          service: value,
          description: matched ? matched.defaultDesc : updated[index].description,
          billingUnit: matched ? matched.unit : updated[index].billingUnit,
          rate: matched ? matched.defaultRate : updated[index].rate,
          gst: matched ? matched.defaultGst : updated[index].gst
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: field === 'qty' || field === 'rate' || field === 'gst' ? (Number(value) || 0) : value
        };
      }
      return updated;
    });
  };

  const handleRemoveServiceRow = (index) => {
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  // Clear / New Form
  const handleClearForm = () => {
    const nextInvoiceNum = `KH/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
    setInvoiceNo(nextInvoiceNum);
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setPaymentMode("Cash");
    setPlace("Bangalore, Karnataka");
    setPatientName("");
    setPatientAge("");
    setPatientGender("Male");
    setContactNo("");
    setAddress("");
    setReferredBy("");
    setServiceDateTime("");
    setEmployeeName("");
    setEmployeeId("");
    setServices([
      {
        id: Date.now(),
        service: "Home Healthcare Nursing (12-hr)",
        description: "Per day, 12-hr shift",
        billingUnit: "12-hr Shift",
        qty: 1,
        rate: 1200,
        gst: 0
      }
    ]);
    setNotes("Thank you for choosing Kaashvi Healthcare. Get well soon.");
  };

  // Use the same sharp, paginated A4 layout for paper and Save as PDF.
  const handleDownloadPDF = () => window.print();

  return (
    <div className="app-wrapper">
      
      {/* Top Banner Header with Official Kaashvi Healthcare Logo */}
      <header className="app-header">
        <div className="header-logo-box">
          <KaashviLogo height={40} />
        </div>
        <div className="header-content">
          <h1>Kaashvi Healthcare — Billing & Invoice Generator</h1>
          <p>Patient billing • Nursing services • Machine rentals • GST • Printable invoice</p>
        </div>
      </header>

      {/* 1. Invoice & Patient Details */}
      <section className="card">
        <h2>1. Invoice & Patient Details</h2>
        <div className="grid-4" style={{ marginBottom: '12px' }}>
          <div className="field-group">
            <label>Invoice No.</label>
            <input 
              type="text" 
              value={invoiceNo} 
              onChange={(e) => setInvoiceNo(e.target.value)} 
            />
          </div>

          <div className="field-group">
            <label>Invoice Date</label>
            <input 
              type="date" 
              value={invoiceDate} 
              onChange={(e) => setInvoiceDate(e.target.value)} 
            />
          </div>

          <div className="field-group">
            <label>Payment Mode</label>
            <select 
              value={paymentMode} 
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="Cash">Cash</option>
              <option value="PhonePe / UPI">PhonePe / UPI</option>
              <option value="Google Pay / Paytm">Google Pay / Paytm</option>
              <option value="Bank Transfer (NEFT/IMPS)">Bank Transfer (NEFT/IMPS)</option>
              <option value="Credit / Debit Card">Credit / Debit Card</option>
              <option value="TPA / Health Insurance">TPA / Health Insurance</option>
            </select>
          </div>

          <div className="field-group">
            <label>Place</label>
            <input 
              type="text" 
              value={place} 
              onChange={(e) => setPlace(e.target.value)} 
            />
          </div>
        </div>

        <div className="grid-4" style={{ marginBottom: '12px' }}>
          <div className="field-group">
            <label>Patient Name</label>
            <input 
              type="text" 
              value={patientName} 
              onChange={(e) => setPatientName(e.target.value)} 
              placeholder="Full Name" 
            />
          </div>

          <div className="field-group">
            <label>Age</label>
            <input 
              type="text" 
              value={patientAge} 
              onChange={(e) => setPatientAge(e.target.value)} 
              placeholder="Age" 
            />
          </div>

          <div className="field-group">
            <label>Gender</label>
            <select 
              value={patientGender} 
              onChange={(e) => setPatientGender(e.target.value)}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="field-group">
            <label>Contact No.</label>
            <input 
              type="text" 
              value={contactNo} 
              onChange={(e) => setContactNo(e.target.value)} 
              placeholder="Phone Number" 
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="field-group">
            <label>Address</label>
            <input 
              type="text" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              placeholder="Residential / Home Care Address" 
            />
          </div>

          <div className="field-group">
            <label>Referred By</label>
            <input 
              type="text" 
              value={referredBy} 
              onChange={(e) => setReferredBy(e.target.value)} 
              placeholder="Doctor / Hospital / Source" 
            />
          </div>
        </div>
      </section>

      {/* 2. Service Date & Employee Details */}
      <section className="card">
        <h2>2. Service Date & Employee Details</h2>
        <div className="grid-3">
          <div className="field-group">
            <label>Date & Time</label>
            <input 
              type="datetime-local" 
              value={serviceDateTime} 
              onChange={(e) => setServiceDateTime(e.target.value)} 
            />
          </div>

          <div className="field-group">
            <label>Employee / Nurse Name</label>
            <input 
              type="text" 
              value={employeeName} 
              onChange={(e) => setEmployeeName(e.target.value)} 
              placeholder="Staff Nurse / Attendant" 
            />
          </div>

          <div className="field-group">
            <label>Employee ID</label>
            <input 
              type="text" 
              value={employeeId} 
              onChange={(e) => setEmployeeId(e.target.value)} 
              placeholder="Staff ID" 
            />
          </div>
        </div>
      </section>

      {/* 3. Services Rendered */}
      <section className="card">
        <h2>3. Services Rendered</h2>
        
        <div className="services-wrapper">
          <table className="services-table">
            <thead>
              <tr>
                <th style={{ width: '24%' }}>Service</th>
                <th style={{ width: '22%' }}>Description</th>
                <th style={{ width: '13%' }}>Billing Unit</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Qty/Days</th>
                <th style={{ width: '11%', textAlign: 'right' }}>Rate ₹</th>
                <th style={{ width: '7%', textAlign: 'center' }}>GST %</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Amount ₹</th>
                <th style={{ width: '5%', textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {services.map((row, idx) => {
                const lineBase = (Number(row.qty) || 0) * (Number(row.rate) || 0);
                const lineGst = taxType === "Tax Exempt / None" ? 0 : lineBase * ((Number(row.gst) || 0) / 100);
                const lineTotal = lineBase + lineGst;

                return (
                  <tr key={row.id || idx}>
                    <td>
                      <select 
                        value={row.service} 
                        onChange={(e) => handleUpdateServiceRow(idx, 'service', e.target.value)}
                      >
                        {SERVICE_OPTIONS.map(opt => (
                          <option key={opt.name} value={opt.name}>{opt.name}</option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <input 
                        type="text" 
                        value={row.description} 
                        onChange={(e) => handleUpdateServiceRow(idx, 'description', e.target.value)}
                        placeholder="Description / Shift" 
                      />
                    </td>

                    <td>
                      <select 
                        value={row.billingUnit} 
                        onChange={(e) => handleUpdateServiceRow(idx, 'billingUnit', e.target.value)}
                      >
                        {BILLING_UNITS.map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <input 
                        type="number" 
                        min="0.5" 
                        step="0.5" 
                        value={row.qty} 
                        onChange={(e) => handleUpdateServiceRow(idx, 'qty', e.target.value)}
                        style={{ textAlign: 'center' }} 
                      />
                    </td>

                    <td>
                      <input 
                        type="number" 
                        min="0" 
                        value={row.rate} 
                        onChange={(e) => handleUpdateServiceRow(idx, 'rate', e.target.value)}
                        style={{ textAlign: 'right' }} 
                      />
                    </td>

                    <td>
                      <select 
                        value={row.gst} 
                        onChange={(e) => handleUpdateServiceRow(idx, 'gst', e.target.value)}
                        style={{ textAlign: 'center' }}
                      >
                        <option value="0">0</option>
                        <option value="5">5</option>
                        <option value="12">12</option>
                        <option value="18">18</option>
                      </select>
                    </td>

                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      {formatINR(lineTotal)}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <button 
                        type="button" 
                        className="btn-remove" 
                        onClick={() => handleRemoveServiceRow(idx)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button 
          type="button" 
          className="btn-add-service" 
          onClick={handleAddServiceRow}
        >
          <Plus size={14} /> Add Service
        </button>
      </section>

      {/* 4. Tax & Notes */}
      <section className="card">
        <h2>4. Tax & Notes</h2>
        
        <div className="tax-notes-layout">
          {/* Left Column */}
          <div>
            <div className="field-group" style={{ marginBottom: '12px' }}>
              <label>Tax Type</label>
              <select 
                value={taxType} 
                onChange={(e) => setTaxType(e.target.value)}
              >
                <option value="Intra-State (CGST + SGST)">Intra-State (CGST + SGST)</option>
                <option value="Inter-State (IGST)">Inter-State (IGST)</option>
                <option value="Tax Exempt / None">Tax Exempt / None</option>
              </select>
            </div>

            <div className="field-group">
              <label>Notes</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes / instructions" 
              />
            </div>

            <div className="field-group" style={{ marginTop: '10px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: 'var(--text-dark)' }}>
                <input 
                  type="checkbox" 
                  checked={includeSeal} 
                  onChange={(e) => setIncludeSeal(e.target.checked)} 
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
                Include Official Seal &amp; Signature on Invoice
              </label>
            </div>
          </div>

          {/* Right Column: Summary Box */}
          <div className="summary-card">
            <div className="sum-line">
              <span>Subtotal</span>
              <strong>{formatINR(subtotal)}</strong>
            </div>

            <div className="sum-line">
              <span>Taxable Value</span>
              <strong>{formatINR(taxableValue)}</strong>
            </div>

            <div className="sum-line">
              <span>Total GST</span>
              <strong>{formatINR(totalGst)}</strong>
            </div>

            <div className="sum-line grand">
              <span>Grand Total</span>
              <span className="val">{formatINR(grandTotal)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Action Bar */}
      <div className="bottom-action-bar">
        <button 
          type="button" 
          className="btn-clear" 
          onClick={handleClearForm}
        >
          New / Clear Form
        </button>

        <button 
          type="button" 
          className="btn-generate" 
          onClick={() => setShowPreviewModal(true)}
        >
          Preview, Print & Save Invoice
        </button>
      </div>

      {/* ========================================================= */}
      {/* A4 INVOICE PRINT MODAL                                    */}
      {/* ========================================================= */}
      {showPreviewModal && (
        <div className="invoice-modal" onClick={(e) => { if (e.target.className === 'invoice-modal') setShowPreviewModal(false); }}>
          
          {/* Toolbar */}
          <div className="modal-bar">
            <button 
              type="button" 
              className="btn-bar close" 
              onClick={() => setShowPreviewModal(false)}
            >
              <X size={14} /> Close
            </button>
            <label className="seal-toggle-bar" title="Toggle official seal on/off">
              <input 
                type="checkbox" 
                checked={includeSeal} 
                onChange={(e) => setIncludeSeal(e.target.checked)} 
              />
              Official Seal &amp; Sign
            </label>
            <button 
              type="button" 
              title="Choose Save as PDF in the print dialog" className="btn-bar pdf" 
              onClick={handleDownloadPDF}
            >
              <Download size={14} /> Save as PDF
            </button>
            <button 
              type="button" 
              className="btn-bar print" 
              onClick={() => window.print()}
            >
              <Printer size={14} /> Print Bill
            </button>
          </div>

          {/* A4 Print Sheet */}
          <div className="invoice-page" id="printableArea">
            
            {/* Header */}
            <div className="inv-header">
              <div className="inv-brand-box">
                <KaashviLogo height={26} />
                <div className="inv-brand-heading">
                  <h2>KAASHVI HEALTHCARE</h2>
                  <div>CARE | COMPASSION | TRUST</div>
                </div>
              </div>

              <div className="inv-company-meta">
                <div className="company-name">KAASHVI HEALTHCARE</div>
                <div>#3, 7th Cross, Opp. BOB, Malleshwaram,</div>
                <div>Bangalore – 560 003</div>
                <div>+91 73536 65982 | +91 63636 65982 | +91 82966 55457</div>
                <div>www.kaashvihealthcare.com | info@kaashvihealthcare.com</div>
              </div>
            </div>

            {/* Title */}
            <div className="inv-title">
              INVOICE / BILL
            </div>

            {/* Meta Grid */}
            <div className="inv-meta-grid">
              <table className="inv-meta-table">
                <tbody>
                  <tr>
                    <td>Invoice No.</td>
                    <td>{invoiceNo || 'KH/2026/001'}</td>
                  </tr>
                  <tr>
                    <td>Invoice Date</td>
                    <td>{invoiceDate || '-'}</td>
                  </tr>
                  <tr>
                    <td>Payment Mode</td>
                    <td>{paymentMode}</td>
                  </tr>
                  <tr>
                    <td>Place</td>
                    <td>{place}</td>
                  </tr>
                  <tr><td>Referred By</td><td>{referredBy || '-'}</td></tr>
                  <tr><td>Employee / Nurse</td><td>{employeeName || '-'}</td></tr>
                  <tr><td>Employee ID</td><td>{employeeId || '-'}</td></tr>
                </tbody>
              </table>

              <table className="inv-meta-table">
                <tbody>
                  <tr>
                    <td>Patient Name</td>
                    <td>{patientName || '-'}</td>
                  </tr>
                  <tr>
                    <td>Age / Gender</td>
                    <td>{patientAge || '-'} / {patientGender}</td>
                  </tr>
                  <tr>
                    <td>Contact No.</td>
                    <td>{contactNo || '-'}</td>
                  </tr>
                  <tr>
                    <td>Address</td>
                    <td>{address || '-'}</td>
                  </tr>
                  <tr><td>Date &amp; Time</td><td>{serviceDateTime.replace('T', ' ') || '-'}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Items Table */}
            <table className="inv-table">
              <thead>
                <tr>
                  <th style={{ width: '4%' }}>#</th>
                  <th style={{ width: '24%' }}>Service</th>
                  <th style={{ width: '23%' }}>Description</th>
                  <th style={{ width: '12%' }}>Unit</th>
                  <th style={{ width: '6%' }}>Qty</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>Rate</th>
                  <th style={{ width: '7%', textAlign: 'right' }}>GST</th>
                  <th style={{ width: '14%', textAlign: 'right' }}>Amount ₹</th>
                </tr>
              </thead>
              <tbody>
                {services
                  .filter(s => Number(s.qty) > 0)
                  .map((item, idx) => {
                    const lineBase = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                    const lineGst = taxType === "Tax Exempt / None" ? 0 : lineBase * ((Number(item.gst) || 0) / 100);
                    const lineTotal = lineBase + lineGst;

                    return (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{item.service}</td>
                        <td style={{ color: '#475569' }}>{item.description || '-'}</td>
                        <td>{item.billingUnit}</td>
                        <td>{item.qty}</td>
                        <td style={{ textAlign: 'right' }}>{billNumber(item.rate)}</td>
                        <td style={{ textAlign: 'right' }}>{taxType === 'Tax Exempt / None' ? 0 : item.gst}%</td>
                        <td style={{ textAlign: 'right' }}>{billNumber(lineTotal)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {/* Totals Summary */}
            <div className="inv-totals-box">
              <table className="inv-totals-table">
                <tbody>
                  <tr>
                    <td>Subtotal</td>
                    <td style={{ textAlign: 'right' }}>{billMoney(subtotal)}</td>
                  </tr>
                  <tr>
                    <td>Taxable Value</td>
                    <td style={{ textAlign: 'right' }}>{billMoney(taxableValue)}</td>
                  </tr>
                  {totalGst > 0 && (taxType.includes('CGST') ? <>
                    <tr><td>CGST</td><td style={{ textAlign: 'right' }}>{billMoney(totalGst / 2)}</td></tr>
                    <tr><td>SGST</td><td style={{ textAlign: 'right' }}>{billMoney(totalGst / 2)}</td></tr>
                  </> : <tr><td>IGST</td><td style={{ textAlign: 'right' }}>{billMoney(totalGst)}</td></tr>)}
                  <tr className="grand">
                    <td>Total Payable</td>
                    <td style={{ textAlign: 'right' }}>{billMoney(grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Amount in words */}
            <div className="inv-words">
              Amount in Words: <strong>{amountWords.replace(/^Rupees /, '').replace(/ Only$/, ' Rupees Only')}</strong>
            </div>

            {/* Notes */}
            {notes && (
              <div style={{ fontSize: '9px', color: '#475569', margin: '6px 0 10px', fontStyle: 'italic' }}>
                {notes}
              </div>
            )}

            {/* Payment Panel: Exact Union Bank of India + Prominent PhonePe UPI QR */}
            <div className="inv-payment-box">
              <div className="inv-payment-title">
                PAYMENT DETAILS — BANK / UPI
              </div>
              <div className="inv-payment-grid">
                <div className="inv-bank-info">
                  <div className="bank-section-title">Bank Account Details</div>
                  <div className="inv-bank-row">
                    <span className="lbl">Bank Name:</span>
                    <span className="val">Union Bank of India</span>
                  </div>
                  <div className="inv-bank-row">
                    <span className="lbl">Account Number:</span>
                    <span className="val highlight">014421010000258</span>
                  </div>
                  <div className="inv-bank-row">
                    <span className="lbl">Branch:</span>
                    <span className="val">Bangalore-S.C Road</span>
                  </div>
                  <div className="inv-bank-row">
                    <span className="lbl">IFSC CODE:</span>
                    <span className="val highlight">UBIN0901440</span>
                  </div>
                  <div className="inv-bank-row">
                    <span className="lbl">Beneficiary:</span>
                    <span className="val">KAASHVI HOME HEALTH CARE</span>
                  </div>
                </div>

                {/* High Visibility PhonePe QR Card */}
                <div className="inv-qr-wrap">
                  {!qrUnavailable && <img 
                    src="/assets/phonepe_qr.png" 
                    alt="PhonePe UPI QR Code" 
                    onError={() => setQrUnavailable(true)}
                  />}
                  <div className="qr-badge">SCAN &amp; PAY</div>
                  <div className="qr-txt" role={qrUnavailable ? 'alert' : undefined}>
                    {qrUnavailable ? 'QR unavailable. Please use the bank details.' : 'UPI / PhonePe QR'}
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="inv-sign-box">
              <div className="inv-sig">
                <div className="spacer"></div>
                <div className="line">Patient / Attendant Signature</div>
              </div>

              <div className="inv-sig inv-sig-authorised">
                <div className="spacer">
                  {includeSeal && (
                    <img 
                      src="/assets/signature-stamp.png" 
                      alt="For Kaashvi Healthcare — Authorised Signatory" 
                      className="inv-stamp"
                    />
                  )}
                </div>
                <div className="line">For Kaashvi Healthcare — Authorised Signatory</div>
              </div>
            </div>

            {/* Footer */}
            <div className="inv-footer">
              This is a computer-generated invoice. Please retain this bill for your records.
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

