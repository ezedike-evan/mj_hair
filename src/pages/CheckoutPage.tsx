import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import type { Id } from "../../convex/_generated/dataModel";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Navbar from "../components/Navbar";
import { CountrySelect } from "../components/ui/CountrySelect";
import { usStates } from "../data/us-states";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Address {
    fullName: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
}

function CheckoutForm({
    totalAmount,
    paymentIntentId,
    onBeforeConfirm,
    onPaymentSuccess,
    isFormComplete
}: {
    totalAmount: number;
    paymentIntentId: string;
    onBeforeConfirm: (paymentIntentId: string) => Promise<boolean>;
    onPaymentSuccess: () => void;
    isFormComplete: boolean;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        if (!isFormComplete) {
            setMessage("Please fill in all required contact and shipping details first.");
            return;
        }

        setIsProcessing(true);

        try {
            const orderCreated = await onBeforeConfirm(paymentIntentId);
            if (!orderCreated) {
                setMessage("Failed to initialize order.");
                setIsProcessing(false);
                return;
            }

            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.origin + "/success",
                },
                redirect: "if_required",
            });

            if (error) {
                setMessage(error.message ?? "An unexpected error occurred.");
                setIsProcessing(false);
            } else if (paymentIntent && paymentIntent.status === "succeeded") {
                setIsProcessing(false);
                onPaymentSuccess();
            } else {
                setMessage("Payment processing...");
                setIsProcessing(false);
            }
        } catch (err) {
            setMessage("An unexpected error occurred.");
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" onReady={() => setIsReady(true)} />
            {message && <div className="text-red-500 text-sm mt-2 font-medium bg-red-50 p-3 rounded-lg border border-red-100">{message}</div>}
            <button
                disabled={isProcessing || !stripe || !elements || !isReady || !isFormComplete}
                id="submit"
                className="w-full bg-[#6A3E1D] text-white py-4 rounded-xl font-bold text-base shadow-[0_10px_20px_rgba(239,36,96,0.2)] hover:shadow-[0_15px_30px_rgba(239,36,96,0.3)] hover:scale-[1.01] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:shadow-none mt-4 disabled:cursor-not-allowed"
            >
                {isProcessing ? "Processing..." : (!isReady ? "Loading Secure Payment..." : (!isFormComplete ? "Complete Details to Pay" : `Pay £${totalAmount.toLocaleString()}`))}
            </button>
        </form>
    );
}



export default function CheckoutPage() {
    const { cart, totalAmount, clearCart } = useCart();
    const navigate = useNavigate();
    const { user, isLoaded, isSignedIn } = useUser();

    // Convex
    const createOrder = useMutation(api.orders.createOrder);
    const createPaymentIntent = useAction(api.payments.createPaymentIntent);
    const customer = useQuery(api.customers.getCurrentCustomer);

    const [clientSecret, setClientSecret] = useState("");
    const [paymentIntentId, setPaymentIntentId] = useState("");

    // Address State matching the updated schema structure somewhat flattened for form
    const [form, setForm] = useState<Address>({
        fullName: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phone: "",
        email: ""
    });

    const [hasAutofilled, setHasAutofilled] = useState(false);

    useEffect(() => {
        // Wait for customer query to resolve (undefined = loading)
        if (customer === undefined) return;

        if (isLoaded && isSignedIn && customer && !hasAutofilled) {
            setForm(prev => ({
                ...prev,
                fullName: customer.firstName && customer.lastName ? `${customer.firstName} ${customer.lastName}` : (user?.fullName || prev.fullName),
                email: customer.email || user?.primaryEmailAddress?.emailAddress || prev.email,
                phone: customer.phone || prev.phone,
                line1: (customer.address as any)?.line1 || (customer.address as any)?.street || prev.line1,
                line2: (customer.address as any)?.line2 || prev.line2,
                city: customer.address?.city || prev.city,
                state: (customer.address as any)?.state || prev.state,
                postalCode: (customer.address as any)?.postalCode || (customer.address as any)?.zipCode || prev.postalCode,
                country: customer.address?.country || prev.country
            }));
            setHasAutofilled(true);
        } else if (isLoaded && isSignedIn && user && !hasAutofilled && customer === null) {
            // Fallback to user data only if customer record is confirmed missing
            setForm(prev => ({
                ...prev,
                fullName: user.fullName || prev.fullName,
                email: user.primaryEmailAddress?.emailAddress || prev.email,
            }));
            setHasAutofilled(true);
        }
    }, [isLoaded, isSignedIn, user, customer, hasAutofilled]);




    const handleBeforeConfirm = async (piId: string) => {
        try {
            const orderItems = cart.map(item => ({
                productId: item.productId as Id<"products">,
                quantity: item.quantity,
                price: item.price,
                name: item.name
            }));

            // Final calculated values on order creation based on country
            const shippingCost = form.country === "GB" ? 5 : 35;
            const finalTotal = totalAmount + shippingCost;

            await createOrder({
                items: orderItems,
                totalPrice: finalTotal,
                shippingAddress: {
                    fullName: form.fullName,
                    line1: form.line1,
                    line2: form.line2,
                    city: form.city,
                    state: form.state,
                    postalCode: form.postalCode,
                    country: form.country,
                },
                paymentIntentId: piId,
                customerName: form.fullName,
                customerEmail: form.email,
                customerPhone: form.phone,
            });

            return true;
        } catch (error) {
            console.error("Order creation failed:", error);
            alert("Order creation failed. Please contact support.");
            return false;
        }
    };

    const handlePaymentSuccess = () => {
        clearCart();
        navigate("/success");
    };

    const shippingCost = useMemo(() => {
        if (form.country === "GB") return 5;
        if (!form.country) return 0;
        return 35;
    }, [form.country]);

    const finalTotal = totalAmount + shippingCost;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCountryChange = (code: string) => {
        setForm(prev => ({ ...prev, country: code }));
    };

    const paymentElementOptions = useMemo(() => ({
        clientSecret,
        appearance: {
            theme: 'stripe' as const,
            variables: {
                colorPrimary: '#EF2460',
                colorBackground: '#ffffff',
                colorText: '#1A1A1A',
                borderRadius: '12px',
                fontFamily: 'Manrope, sans-serif',
            }
        },
    }), [clientSecret]);

    useEffect(() => {
        if (finalTotal > 0) {
            // We want to update the payment intent if the amount has changed significantly
            createPaymentIntent({
                amount: Math.round(finalTotal * 100),
                email: form.email || undefined
            })
                .then((res) => {
                    setClientSecret(res.clientSecret ?? "");
                    setPaymentIntentId(res.paymentIntentId ?? "");
                })
                .catch(console.error);
        }
    }, [finalTotal, createPaymentIntent, form.email]); // Added form.email to dependency

    const isFormValid = useMemo(() => {
        return Boolean(
            form.fullName &&
            form.line1 &&
            form.city &&
            (form.country === "US" ? form.state : true) &&
            form.postalCode &&
            form.country &&
            form.email &&
            form.phone
        );
    }, [form]);

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFF5F7]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
                    <p className="text-gray-500 mb-6">Looks like checkout was accessed without items.</p>
                    <button onClick={() => navigate("/shop")} className="text-[#6A3E1D] font-bold hover:underline">Return to Shop</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-['Manrope']">
            <Navbar />

            <div className="max-w-[1200px] mx-auto pt-32 pb-20 px-6">
                {/* Breadcrumbs */}
                <div className="mb-10 text-center lg:text-left">
                    <h1 className="text-4xl font-bold text-[#1A1A1A] mb-3 font-['Poppins']">Checkout</h1>
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-gray-500 font-medium">
                        <span className="hover:text-[#6A3E1D] cursor-pointer" onClick={() => navigate('/cart')}>Cart</span>
                        <span className="text-gray-300">›</span>
                        <span className="text-[#6A3E1D] font-bold">Secure Checkout</span>
                        <span className="text-gray-300">›</span>
                        <span>Confirmation</span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column: Form Section */}
                    <div className="flex-1 space-y-8">

                        {/* Customer Information */}
                        <div className="bg-white p-8 lg:p-10 rounded-[24px] shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-[#6A3E1D]/10 text-[#6A3E1D] flex items-center justify-center text-sm font-bold">1</span>
                                Contact Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-[#6A3E1D] focus:ring-4 focus:ring-[#6A3E1D]/10 outline-none transition-all placeholder-gray-400 text-sm font-medium"
                                        placeholder="Jane Doe"
                                        value={form.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-[#6A3E1D] focus:ring-4 focus:ring-[#6A3E1D]/10 outline-none transition-all placeholder-gray-400 text-sm font-medium"
                                        placeholder="jane@example.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-[#6A3E1D] focus:ring-4 focus:ring-[#6A3E1D]/10 outline-none transition-all placeholder-gray-400 text-sm font-medium"
                                        placeholder="+1 (555) 000-0000"
                                        value={form.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white p-8 lg:p-10 rounded-[24px] shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-[#6A3E1D]/10 text-[#6A3E1D] flex items-center justify-center text-sm font-bold">2</span>
                                Shipping Address
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Address Line 1</label>
                                    <input
                                        type="text"
                                        name="line1"
                                        className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-[#6A3E1D] focus:ring-4 focus:ring-[#6A3E1D]/10 outline-none transition-all placeholder-gray-400 text-sm font-medium"
                                        placeholder="123 Main St"
                                        value={form.line1}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Address Line 2 (Optional)</label>
                                    <input
                                        type="text"
                                        name="line2"
                                        className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-[#6A3E1D] focus:ring-4 focus:ring-[#6A3E1D]/10 outline-none transition-all placeholder-gray-400 text-sm font-medium"
                                        placeholder="Apt 4B"
                                        value={form.line2}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-[#6A3E1D] focus:ring-4 focus:ring-[#6A3E1D]/10 outline-none transition-all placeholder-gray-400 text-sm font-medium"
                                        placeholder="New York"
                                        value={form.city}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                {form.country === "US" && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                                        <select
                                            name="state"
                                            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-[#EF2460] focus:ring-4 focus:ring-[#EF2460]/10 outline-none transition-all text-sm font-medium"
                                            value={form.state}
                                            onChange={(e) => setForm({ ...form, state: e.target.value })}
                                            required
                                        >
                                            <option value="">Select a State</option>
                                            {usStates.map((state) => (
                                                <option key={state.code} value={state.code}>
                                                    {state.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Zip / Postal Code</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-[#6A3E1D] focus:ring-4 focus:ring-[#6A3E1D]/10 outline-none transition-all placeholder-gray-400 text-sm font-medium"
                                        placeholder="10001"
                                        value={form.postalCode}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <CountrySelect value={form.country} onChange={handleCountryChange} />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Section */}
                        <div className="bg-white p-8 lg:p-10 rounded-[24px] shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-[#6A3E1D]/10 text-[#6A3E1D] flex items-center justify-center text-sm font-bold">3</span>
                                Payment Method
                            </h2>
                            <div>
                                {clientSecret && form.country ? (
                                    <Elements key={clientSecret} options={paymentElementOptions} stripe={stripePromise}>
                                        <CheckoutForm
                                            totalAmount={finalTotal}
                                            paymentIntentId={paymentIntentId}
                                            onBeforeConfirm={handleBeforeConfirm}
                                            onPaymentSuccess={handlePaymentSuccess}
                                            isFormComplete={isFormValid}
                                        />
                                    </Elements>
                                ) : (
                                    <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl">
                                        {!form.country ? "Please select a shipping country to proceed." : "Loading secure payment gateway..."}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Details Summary */}
                    <div className="w-full lg:w-[380px]">
                        <div className="sticky top-28 space-y-6">
                            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                                <h2 className="text-lg font-bold text-[#1A1A1A] mb-4 font-['Poppins']">Order Summary</h2>

                                {/* Cart Items Preview */}
                                <div className="space-y-4 mb-6">
                                    {cart.slice(0, 3).map((item) => (
                                        <div key={item.productId} className="flex gap-4 items-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">£{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                    {cart.length > 3 && (
                                        <p className="text-xs text-gray-500 text-center pt-2 italic">+ {cart.length - 3} more items</p>
                                    )}
                                </div>

                                <div className="border-t border-gray-100 pt-4 space-y-3">
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-gray-900">£{totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <span>Shipping</span>
                                        <span className="font-bold text-gray-900">
                                            {form.country ? `£${shippingCost.toFixed(2)}` : '--'}
                                        </span>
                                    </div>
                                    {form.country === "GB" && (
                                        <div className="flex justify-end text-xs text-green-600 font-medium">
                                            United Kingdom Shipping
                                        </div>
                                    )}
                                    {form.country && form.country !== "GB" && (
                                        <div className="flex justify-end text-xs text-blue-600 font-medium">
                                            International Shipping
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-dashed border-gray-200 my-4"></div>

                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span className="text-[#1A1A1A]">Total</span>
                                    <span className="text-[#6A3E1D]">
                                        {form.country ? `£${finalTotal.toLocaleString()}` : 'Calculated at next step'}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-[#6A3E1D]/5 p-6 rounded-[24px] border border-[#6A3E1D]/10">
                                <h3 className="text-sm font-bold text-[#6A3E1D] mb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    Secure Checkout
                                </h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Your payment information is encrypted and processed securely by Stripe. We do not store your credit card details.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
