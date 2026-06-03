// const ProductCard = ({ product, onAddToCart }) => {
//   return (
//     <div className="bg-white border rounded-xl p-4 hover:shadow-md transition">
//       <div className="h-32 bg-blue-50 rounded-lg mb-3"></div>

//       <h3 className="font-semibold text-gray-800">
//         {product.name}
//       </h3>

//       <p className="text-blue-600 font-bold">
//         Rs. {product.price}
//       </p>

//       <p className="text-sm text-gray-500">
//         Stock : {product.stock}
//       </p>

//       <button
//         onClick={() => onAddToCart(product)}
//         className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
//       >
//         Add To Cart
//       </button>
//     </div>
//   );
// };

// export default ProductCard;


const ProductCard = ({ product, onAddToCart }) => {
  const price = product.price ?? product.sellingPrice ?? 0;
  const stock = product.stock ?? product.quantity ?? null;
  const lowStock = stock !== null && stock < 10;

  return (
    <div
      onClick={() => onAddToCart(product)}
      className="bg-white border rounded-xl p-3 cursor-pointer hover:shadow-md hover:border-blue-400 transition group select-none"
    >
      {/* Image / Placeholder */}
      <div className="h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover rounded-lg"
          />
        ) : (
          <span className="text-2xl">🛍️</span>
        )}
      </div>

      {/* Barcode */}
      {(product.barcode || product.sku) && (
        <p className="text-[10px] text-gray-400 font-mono truncate">
          {product.barcode || product.sku}
        </p>
      )}

      {/* Name */}
      <h3 className="font-semibold text-xs mt-0.5 leading-tight line-clamp-2 text-gray-800">
        {product.name}
      </h3>

      {/* Price + Stock */}
      <div className="flex justify-between items-center mt-1.5">
        <span className="text-blue-600 font-bold text-sm">
          Rs.{price.toLocaleString()}
        </span>
        {stock !== null && (
          <span className={`text-[10px] font-medium ${lowStock ? "text-red-500" : "text-gray-400"}`}>
            {lowStock ? `⚠ ${stock}` : stock}
          </span>
        )}
      </div>

      {/* Add Button */}
      <button className="w-full mt-2 bg-blue-600 text-white py-1 rounded-lg text-[11px] font-medium group-hover:bg-blue-700 transition">
        + Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
