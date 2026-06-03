import { ScanLine } from "lucide-react";

const BarcodeScanner = () => {
  return (
    <div className="flex gap-3">
      <input
        type="text"
        placeholder="Scan Barcode..."
        className="flex-1 border p-3 rounded-lg"
      />

      <button className="bg-blue-600 text-white px-4 rounded-lg flex items-center gap-2">
        <ScanLine size={18} />
        Scan
      </button>
    </div>
  );
};

export default BarcodeScanner;