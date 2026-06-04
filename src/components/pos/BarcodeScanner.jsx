// import { ScanLine } from "lucide-react";

// const BarcodeScanner = () => {
//   return (
//     <div className="flex gap-3">
//       <input
//         type="text"
//         placeholder="Scan Barcode..."
//         className="flex-1 border p-3 rounded-lg"
//       />

//       <button className="bg-blue-600 text-white px-4 rounded-lg flex items-center gap-2">
//         <ScanLine size={18} />
//         Scan
//       </button>
//     </div>
//   );
// };

// export default BarcodeScanner;

import { useRef, useState, useCallback } from "react";
import { ScanLine, X } from "lucide-react";


const BarcodeScanner = ({ products = [], onFound }) => {
  const [value, setValue]     = useState("");
  const [msg, setMsg]         = useState({ type: "", text: "" });
  const [flash, setFlash]     = useState(false);
  const inputRef              = useRef(null);

  const triggerScan = useCallback(() => {
    const code = value.trim();
    if (!code) return;

    const product = products.find(
      (p) =>
        p.barcode?.toString() === code ||
        p._id?.toString()     === code ||
        p.sku?.toString()     === code
    );

    if (product) {
      onFound?.(product);
      setValue("");
      setFlash(true);
      setMsg({ type: "success", text: `✓ ${product.name} added` });
      setTimeout(() => { setFlash(false); setMsg({ type: "", text: "" }); }, 1400);
    } else {
      setMsg({ type: "error", text: `No product for barcode "${code}"` });
      setTimeout(() => setMsg({ type: "", text: "" }), 3000);
    }
    inputRef.current?.focus();
  }, [value, products, onFound]);

  return (
    <div className={`rounded-xl border-2 transition-all duration-200 ${
      flash ? "border-green-400 bg-green-50" : "border-gray-200 bg-white"
    }`}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <ScanLine
          size={18}
          className={`shrink-0 ${flash ? "text-green-500" : "text-blue-500"}`}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          autoFocus
          onChange={(e) => { setValue(e.target.value); setMsg({ type: "", text: "" }); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); triggerScan(); } }}
          placeholder="Scan barcode or type product code → Enter"
          className="flex-1 py-1 outline-none text-sm bg-transparent placeholder:text-gray-400"
        />
        {value && (
          <>
            <button
              onClick={() => { setValue(""); inputRef.current?.focus(); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
            <button
              onClick={triggerScan}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-700"
            >
              Add
            </button>
          </>
        )}
      </div>
      {msg.text && (
        <p className={`px-4 pb-2 text-xs font-medium ${
          msg.type === "success" ? "text-green-600" : "text-red-500"
        }`}>
          {msg.text}
        </p>
      )}
    </div>
  );
};

export default BarcodeScanner;
