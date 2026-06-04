// import ProductCard from "./ProductCard";

// const ProductList = ({ products, onAddToCart }) => {
//   return (
//     <div className="grid grid-cols-3 gap-4">
//       {products.map((product) => (
//         <ProductCard
//           key={product._id}
//           product={product}
//           onAddToCart={onAddToCart}
//         />
//       ))}
//     </div>
//   );
// };

// export default ProductList;

import { useState } from "react";
import { Search } from "lucide-react";
import ProductCard from "./ProductCard";

/**
 * ProductList
 * Props: products, onAddToCart
 */
const ProductList = ({ products = [], onAddToCart }) => {
  const [search, setSearch]           = useState("");
  const [activeCategory, setCategory] = useState("All");

  const categories = [
    "All",
    ...new Set(
      products
        .map((p) => p.category?.name || p.category || "Other")
        .filter(Boolean)
    ),
  ];

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.name?.toLowerCase().includes(q) ||
      p.barcode?.toString().includes(q) ||
      p.sku?.toLowerCase().includes(q);
    const pCat = p.category?.name || p.category || "Other";
    const matchCat = activeCategory === "All" || pCat === activeCategory;
    return matchSearch && matchCat && p.isActive !== false;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="flex items-center border rounded-xl px-3 bg-white mb-3">
        <Search size={15} className="text-gray-400 mr-2 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, barcode or SKU..."
          className="w-full py-2.5 outline-none text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-gray-400 hover:text-gray-600 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 shrink-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition ${
              activeCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border hover:bg-blue-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 mt-16 text-sm">
            {search ? `No products match "${search}"` : "No products available"}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
