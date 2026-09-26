// Currency Formatter (INR)
export function formatINR(num) {
  const val = Number(num) || 0;
  return "Rs. " + val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Date Formatter (DD-MMM-YYYY)
export function formatDateDisplay(dateStr) {
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

// Generate Invoice Number
export function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `KHC-INV-${year}-${rand}`;
}

// Convert Number to Words in Indian Numbering Standard (Crores, Lakhs, Thousands)
export function convertNumberToIndianWords(amount) {
  const num = Math.floor(Math.abs(Number(amount) || 0));
  if (num === 0) return "Zero Rupees Only";

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '');
    return '';
  }

  let words = '';
  const crore = Math.floor(num / 10000000);
  let remainder = num % 10000000;
  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  const thousand = Math.floor(remainder / 1000);
  const hundred = remainder % 1000;

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
