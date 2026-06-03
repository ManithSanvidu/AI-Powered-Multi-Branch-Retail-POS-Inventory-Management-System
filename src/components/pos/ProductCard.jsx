const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white border rounded-xl p-4 hover:shadow-md transition">
      <div className="h-32 bg-blue-50 rounded-lg mb-3"></div>

      <h3 className="font-semibold text-gray-800">
        {product.name}
      </h3>

      <p className="text-blue-600 font-bold">
        Rs. {product.price}
      </p>

      <p className="text-sm text-gray-500">
        Stock : {product.stock}
      </p>

      <button
        onClick={() => onAddToCart(product)}
        className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Add To Cart
      </button>
    </div>
  );
};

export default ProductCard;