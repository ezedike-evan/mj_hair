import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect } from "react";

export default function SuccessPage() {
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id");

    useEffect(() => {
        if (sessionId) {
            clearCart();
        }
    }, [sessionId, clearCart]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
            <div className="w-24 h-24 bg-[#E0F7FA] rounded-full flex items-center justify-center mb-6 animate-bounce">
                <svg className="w-12 h-12 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold font-['Poppins'] text-[#1A1A1A] mb-4">
                Payment Successful!
            </h1>
            <p className="text-gray-500 font-['Manrope'] mb-10 max-w-md">
                Your order has been placed successfully. We are processing it and will ship it to your address soon.
            </p>

            <button
                onClick={() => navigate("/")}
                className="bg-[#6A3E1D] text-white px-10 py-4 rounded-2xl font-bold hover:scale-105 transition shadow-lg"
            >
                Continue Shopping
            </button>
        </div>
    );
}
