import React from 'react';

const FontTest = () => {
  return (
    <div className="p-8 bg-white">
      <h1 className="text-3xl font-bold mb-6 text-center">Hanuman Font Test</h1>
      
      {/* ASCII Characters Test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">ASCII Characters</h2>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-2">Basic Text:</h3>
            <p className="ascii-text">
              Welcome to Money App - Your Complete Accounting Solution
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-2">Numbers & Currency:</h3>
            <p className="ascii-text">
              $1,234.56 | €987.65 | £543.21 | ¥12,345 | ₹9,876.54
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-2">Special Characters:</h3>
            <p className="ascii-text">
              Invoice #2024-001 | Customer@email.com | 100% Complete | A-Z & 0-9
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-2">Accounting Terms:</h3>
            <p className="ascii-text font-bold">
              Assets | Liabilities | Equity | Revenue | Expenses
            </p>
          </div>
        </div>
      </div>

      {/* Unicode Characters Test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-green-600">Unicode Characters</h2>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-2">Extended Latin:</h3>
            <p className="unicode-text">
              Café • Résumé • Naïve • Façade • Piñata • Über • Mañana
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-2">Mathematical Symbols:</h3>
            <p className="unicode-text">
              ∑ (Sum) • π (Pi) • ∞ (Infinity) • ≠ (Not Equal) • ≤ ≥ (Less/Greater Equal)
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-2">Currency Symbols:</h3>
            <p className="unicode-text">
              $ € £ ¥ ₹ ₽ ₩ ₪ ₡ ₦ ₵ ₴ ₸ ₼ ₨ ₭ ₮ ₱ ₲ ₳ ₶ ₷ ₹ ₺ ₻ ₽ ₾ ₿
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-2">Arrows & Symbols:</h3>
            <p className="unicode-text">
              → ← ↑ ↓ ↔ ↕ ↖ ↗ ↘ ↙ ⇒ ⇐ ⇑ ⇓ ⇔ ⇕ • ◆ ◇ ★ ☆ ♠ ♣ ♥ ♦
            </p>
          </div>
          
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-2">Khmer Script Sample:</h3>
            <p className="unicode-text text-lg">
              ក្រុមហ៊ុន គណនេយ្យ ការគ្រប់គ្រង ហិរញ្ញវត្ថុ
            </p>
          </div>
        </div>
      </div>

      {/* Font Weights Test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-purple-600">Font Weights</h2>
        <div className="space-y-2">
          <p className="font-thin">Thin (100): Money App Dashboard</p>
          <p className="font-light">Light (300): Money App Dashboard</p>
          <p className="font-normal">Normal (400): Money App Dashboard</p>
          <p className="font-bold">Bold (700): Money App Dashboard</p>
          <p className="font-black">Black (900): Money App Dashboard</p>
        </div>
      </div>

      {/* Real Application Context */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Application Context</h2>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-blue-50">
            <h3 className="font-bold mb-2">Invoice Header</h3>
            <p>Invoice #INV-2024-001</p>
            <p>Date: 2024-01-15</p>
            <p>Due Date: 2024-02-15</p>
            <p>Amount: $1,234.56</p>
          </div>
          
          <div className="p-4 border rounded-lg bg-green-50">
            <h3 className="font-bold mb-2">Chart of Accounts</h3>
            <p>1000 - Assets</p>
            <p>1100 - Current Assets</p>
            <p>1120 - Accounts Receivable</p>
            <p>2000 - Liabilities</p>
            <p>4000 - Revenue</p>
          </div>
          
          <div className="p-4 border rounded-lg bg-yellow-50">
            <h3 className="font-bold mb-2">Customer Information</h3>
            <p>Company: ABC Manufacturing Ltd</p>
            <p>Contact: John Anderson</p>
            <p>Email: john@abcmanufacturing.com</p>
            <p>Phone: +1-555-1001</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontTest;