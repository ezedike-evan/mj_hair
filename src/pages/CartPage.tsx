import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function CartPage() {
    const { cart, removeFromCart, increaseQuantity, decreaseQuantity, totalAmount, clearCart } = useCart();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F0F2F5] font-['Manrope']">
            <Navbar />
            <div className="pt-32 pb-20 px-6">
                <div className="max-w-[1200px] mx-auto">

                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-4xl font-bold text-[#1A1A1A] mb-3 font-['Poppins']">Shopping Cart</h1>
                        <p className="text-sm text-gray-500 font-medium">
                            <span className="text-[#6A3E1D] font-bold">{cart.length} items</span> in your bag
                        </p>
                    </div>

                    {cart.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-[32px] shadow-sm max-w-2xl mx-auto border border-gray-100">
                            <div className="w-24 h-24 bg-[#6A3E1D]/25 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-[#6A3E1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3 font-['Poppins']">Your cart is empty</h2>
                            <p className="text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">Looks like you haven't added anything to your cart yet. Discover our premium collection.</p>
                            <Link
                                to="/shop"
                                className="inline-flex items-center gap-2 bg-[#6A3E1D] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-[0_10px_20px_rgba(239,36,96,0.2)] hover:shadow-[0_15px_30px_rgba(239,36,96,0.3)] hover:-translate-y-0.5 transition-all"
                            >
                                Start Shopping <span className="text-lg">→</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                            {/* Left Column: Cart Items */}
                            <div className="lg:col-span-8 space-y-6">
                                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 hidden sm:grid grid-cols-12 gap-4 border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <div className="col-span-6">Product</div>
                                        <div className="col-span-3 text-center">Quantity</div>
                                        <div className="col-span-3 text-right">Total</div>
                                    </div>

                                    <div className="divide-y divide-gray-50">
                                        {cart.map((item) => (
                                            <div key={item.productId} className="p-6 flex flex-col sm:grid sm:grid-cols-12 gap-6 items-center hover:bg-gray-50/50 transition-colors">
                                                {/* Product Info */}
                                                <div className="flex items-center gap-4 col-span-6 w-full">
                                                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-bold text-[#1A1A1A] text-base mb-1 truncate font-['Poppins']">
                                                            {item.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 font-medium">£{item.price.toLocaleString()}</p>
                                                        <button
                                                            onClick={() => removeFromCart(item.productId)}
                                                            className="text-xs text-red-500 hover:text-red-700 font-bold mt-2 flex items-center gap-1 transition-colors"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Quantity Control */}
                                                <div className="col-span-3 flex justify-center w-full">
                                                    <div className="flex items-center bg-[#F9FAFB] rounded-lg p-1 border border-gray-100">
                                                        <button
                                                            onClick={() => decreaseQuantity(item.productId)}
                                                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#6A3E1D] hover:bg-white rounded-md transition-all font-bold"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-10 text-center text-sm font-bold text-[#1A1A1A]">{item.quantity}</span>
                                                        <button
                                                            onClick={() => increaseQuantity(item.productId)}
                                                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#6A3E1D] hover:bg-white rounded-md transition-all font-bold"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Total */}
                                                <div className="col-span-3 text-right w-full">
                                                    <span className="text-lg font-bold text-[#6A3E1D]">
                                                        £{(item.price * item.quantity).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center px-2">
                                    <Link to="/shop" className="text-gray-500 hover:text-[#6A3E1D] font-bold text-sm flex items-center gap-2 transition-colors">
                                        ← Continue Shopping
                                    </Link>
                                    <button
                                        onClick={clearCart}
                                        className="text-xs text-gray-400 hover:text-red-500 font-bold transition-colors uppercase tracking-wide border-b border-dashed border-gray-300 hover:border-red-500 pb-0.5"
                                    >
                                        Clear Cart
                                    </button>
                                </div>
                            </div>

                            {/* Right Column: Order Summary */}
                            <div className="lg:col-span-4">
                                <div className="sticky top-32 space-y-6">
                                    <div className="bg-white p-6 lg:p-8 rounded-[24px] shadow-sm border border-gray-100">
                                        <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 font-['Poppins']">Order Summary</h2>

                                        <div className="space-y-4 mb-6">
                                            <div className="flex justify-between items-center text-sm text-gray-600">
                                                <span>Subtotal</span>
                                                <span className="font-bold text-[#1A1A1A]">£{totalAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-gray-600">
                                                <span>Shipping estimate</span>
                                                <span className="text-gray-400 italic text-xs">Calculated at checkout</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-gray-600">
                                                <span>Tax</span>
                                                <span className="text-gray-400 italic text-xs">Calculated at checkout</span>
                                            </div>
                                        </div>

                                        <div className="border-t border-dashed border-gray-200 my-6"></div>

                                        <div className="flex justify-between items-center mb-8">
                                            <span className="text-base font-bold text-[#1A1A1A]">Total</span>
                                            <div className="text-right">
                                                <span className="block text-2xl font-bold text-[#6A3E1D]">£{totalAmount.toLocaleString()}</span>
                                                <span className="text-[10px] text-gray-400 font-medium">+ Shipping</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate("/checkout")}
                                            className="w-full bg-[#6A3E1D] text-white py-4 rounded-xl font-bold text-sm shadow-[0_10px_20px_rgba(239,36,96,0.2)] hover:shadow-[0_15px_30px_rgba(239,36,96,0.3)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                                        >
                                            Checkout Now
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </button>

                                        <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 grayscale opacity-70">
                                            <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" className="h-6" alt="Visa" />
                                            <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" className="h-6" alt="Mastercard" />
                                            <div className="h-6 w-px bg-gray-200 mx-2"></div>
                                            <span className="text-[10px] font-semibold">SECURE CHECKOUT</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}