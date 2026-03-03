import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import type { Id } from "../../convex/_generated/dataModel";
import Navbar from "../components/Navbar";
import { CountrySelect } from "../components/ui/CountrySelect";

declare global {
    interface Window {
        Frames: any;
        Klarna: any;
    }
}

interface Address {
    fullName: string;
    line1: string;
    line2: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
}

function KlarnaForm({
    totalAmount,
    shippingAmount,
    cartDetails,
    customerEmail,
    formCompleteData,
    onSubmitSuccess,
    onError,
    isFormComplete
}: {
    totalAmount: number;
    shippingAmount: number;
    cartDetails: any[];
    customerEmail: string;
    formCompleteData: Address;
    onSubmitSuccess: (token: string, method: "klarna") => void;
    onError?: (msg: string) => void;
    isFormComplete: boolean;
}) {
    const [message, setMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const createPaymentContext = useAction(api.checkoutCom.createPaymentContext);
    const initRef = useRef(false);

    useEffect(() => {
        if (onError) {
            (window as any).__resetCheckoutForm = (errMsg: string) => {
                setMessage(errMsg);
                setIsProcessing(false);
            };
        }
        return () => {
            delete (window as any).__resetCheckoutForm;
        };
    }, [onError]);

    useEffect(() => {
        const initKlarna = async () => {
            if (!isFormComplete || initRef.current) return;
            try {
                setMessage(null);
                const items = cartDetails.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    unit_price: Math.round(item.price * 100),
                    total_amount: Math.round(item.price * item.quantity * 100),
                    reference: item.productId as string,
                }));

                if (shippingAmount > 0) {
                    items.push({
                        name: "Shipping Delivery",
                        quantity: 1,
                        unit_price: Math.round(shippingAmount * 100),
                        total_amount: Math.round(shippingAmount * 100),
                        reference: "shipping"
                    });
                }

                const calculatedTotalAmount = items.reduce((sum, item) => sum + item.total_amount, 0);

                const ctx = await createPaymentContext({
                    amount: calculatedTotalAmount,
                    currency: "GBP",
                    reference: `ord_${Date.now()}`,
                    items,
                    customerEmail,
                    customerName: formCompleteData.fullName,
                    billingAddress: {
                        address_line1: formCompleteData.line1,
                        address_line2: formCompleteData.line2,
                        city: formCompleteData.city,
                        zip: formCompleteData.postalCode,
                        country: formCompleteData.country
                    }
                });

                if (window.Klarna) {
                    initRef.current = true;
                    window.Klarna.Payments.init({
                        client_token: ctx.clientToken
                    });
                    window.Klarna.Payments.load({
                        container: "#klarna-container",
                        payment_method_category: "pay_later"
                    }, (response: any) => {
                        if (response.show_form) {
                            setIsReady(true);
                        } else {
                            setMessage("Klarna is not available for this purchase. (Usually due to sandbox testing limitations)");
                        }
                    });
                } else {
                    setMessage("Klarna SDK failed to load.");
                }
            } catch (e: any) {
                setMessage("Could not load Klarna: " + e.message);
            }
        };

        if (isFormComplete) {
            initKlarna();
        }
    }, [isFormComplete, cartDetails, totalAmount, shippingAmount, customerEmail, createPaymentContext, formCompleteData]);

    const handleKlarnaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormComplete || !isReady) return;
        setIsProcessing(true);
        window.Klarna.Payments.authorize({
            payment_method_category: "pay_later"
        }, {}, (res: any) => {
            if (res.approved && res.authorization_token) {
                onSubmitSuccess(res.authorization_token, "klarna");
            } else {
                setIsProcessing(false);
                setMessage(res.error ? `Klarna: ${res.error.error_message}` : "Klarna authorization dismissed.");
            }
        });
    };

    return (
        <form onSubmit={handleKlarnaSubmit} className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[150px]">
                {!isReady && !message && (
                    <div className="flex items-center justify-center h-full text-gray-500 font-medium text-sm">
                        {isFormComplete ? "Loading secure Klarna portal..." : "Please fill in all details above to securely load Klarna"}
                    </div>
                )}
                {message && !isReady && (
                    <div className="flex items-center gap-2 text-red-500 text-sm mt-2 font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                        {message}
                    </div>
                )}
                <div id="klarna-container" className={`w-full ${!isReady ? 'hidden' : 'block'}`}></div>
            </div>

            <button
                disabled={isProcessing || !isReady || !isFormComplete}
                className="w-full bg-[#FFB3C7] text-black py-4 rounded-xl font-bold text-base shadow-[0_10px_20px_rgba(255,179,199,0.3)] hover:shadow-[0_15px_30px_rgba(255,179,199,0.4)] hover:scale-[1.01] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:shadow-none mt-4 disabled:cursor-not-allowed"
            >
                {isProcessing ? "Processing..." : (!isReady ? "Loading Klarna..." : (!isFormComplete ? "Complete Details to Pay" : `Pay £${totalAmount.toLocaleString()} with Klarna`))}
            </button>
        </form>
    );
}

function CheckoutForm({
    totalAmount,
    onSubmitSuccess,
    onError,
    isFormComplete
}: {
    totalAmount: number;
    onSubmitSuccess: (token: string, method: "card") => void;
    onError?: (msg: string) => void;
    isFormComplete: boolean;
}) {
    const [message, setMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const framesInitialized = useRef(false);

    // Provide a way to manually reset processing state from parent
    useEffect(() => {
        if (onError) {
            (window as any).__resetCheckoutForm = (errMsg: string) => {
                setMessage(errMsg);
                setIsProcessing(false);
                if (window.Frames) {
                    window.Frames.enableSubmitForm();
                }
            };
        }
        return () => {
            delete (window as any).__resetCheckoutForm;
        };
    }, [onError]);

    const onSubmitSuccessRef = useRef(onSubmitSuccess);
    useEffect(() => {
        onSubmitSuccessRef.current = onSubmitSuccess;
    }, [onSubmitSuccess]);

    useEffect(() => {
        if (window.Frames && !framesInitialized.current) {
            framesInitialized.current = true;
            window.Frames.init({
                publicKey: import.meta.env.VITE_CHECKOUT_PUBLIC_KEY,
                localization: {
                    cardNumberPlaceholder: "Card number",
                    expiryMonthPlaceholder: "MM",
                    expiryYearPlaceholder: "YY",
                    cvvPlaceholder: "CVV",
                },
                style: {
                    base: {
                        color: '#1A1A1A',
                        fontSize: '16px',
                        fontFamily: 'Manrope, sans-serif',
                        lineHeight: '24px',
                    },
                    focus: { color: '#6A3E1D' },
                    valid: { color: '#1A1A1A' },
                    invalid: { color: '#6A3E1D' }
                }
            });

            window.Frames.addEventHandler(window.Frames.Events.FRAME_ACTIVATED, () => setIsReady(true));
            window.Frames.addEventHandler(window.Frames.Events.CARD_TOKENIZATION_FAILED, () => {
                setMessage("Card tokenization failed. Check details.");
                setIsProcessing(false);
            });
            window.Frames.addEventHandler(window.Frames.Events.CARD_TOKENIZED, (event: any) => {
                setMessage(null);
                onSubmitSuccessRef.current(event.token, "card");
            });
        }
        return () => {
            if (window.Frames && framesInitialized.current) {
                window.Frames.removeAllEventHandlers();
                // We DON'T set framesInitialized.current = false here because we don't want to re-init on this instance
            }
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormComplete) {
            setMessage("Please fill in all details.");
            return;
        }
        setIsProcessing(true);
        window.Frames.submitCard();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Card Number</label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <div className="card-number-frame w-full h-[24px]"></div>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Expiry Date</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                        <div className="expiry-date-frame w-full h-[24px]"></div>
                    </div>
                </div>
                <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">CVV</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                        <div className="cvv-frame w-full h-[24px]"></div>
                    </div>
                </div>
            </div>
            {message && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm font-medium leading-snug">{message}</p>
                </div>
            )}
            <button
                disabled={isProcessing || !isReady || !isFormComplete}
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
    const processPayment = useAction(api.payments.processPayment);
    const customer = useQuery(api.customers.getCurrentCustomer);


    // Address State matching the updated schema structure somewhat flattened for form
    const [form, setForm] = useState<Address>({
        fullName: "",
        line1: "",
        line2: "",
        city: "",
        postalCode: "",
        country: "",
        phone: "",
        email: ""
    });

    const [hasAutofilled, setHasAutofilled] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"card" | "klarna">("card");

    // Shipping Logic
    const shippingCost = useMemo(() => {
        if (form.country === "GB") return 5;
        if (!form.country) return 0;
        return 35;
    }, [form.country]);

    const finalTotal = totalAmount + shippingCost;

    const isFormValid = useMemo(() => {
        return Boolean(
            form.fullName &&
            form.line1 &&
            form.city &&
            form.postalCode &&
            form.country &&
            form.email &&
            form.phone
        );
    }, [form]);

    const handleOrderCreation = useCallback(async (token: string, method: "card" | "klarna") => {
        try {
            const paymentResponse = await processPayment({
                amount: Math.round(finalTotal * 100),
                currency: "GBP",
                token: token,
                paymentMethod: method,
                reference: `ord_${Date.now()}`,
                customerEmail: form.email,
                customerName: form.fullName
            });

            if (!paymentResponse || !paymentResponse.id || (paymentResponse.approved === false)) {
                if ((window as any).__resetCheckoutForm) {
                    (window as any).__resetCheckoutForm("Payment declined by bank.");
                } else {
                    alert("Payment declined or failed processing.");
                }
                return;
            }

            const orderItems = cart.map(item => ({
                productId: item.productId as Id<"products">,
                quantity: item.quantity,
                price: item.price,
                name: item.name
            }));

            await createOrder({
                items: orderItems,
                totalPrice: finalTotal,
                shippingAddress: {
                    fullName: form.fullName,
                    line1: form.line1,
                    line2: form.line2,
                    city: form.city,
                    postalCode: form.postalCode,
                    country: form.country,
                },
                checkoutPaymentId: paymentResponse.id,
                customerName: form.fullName,
                customerEmail: form.email,
                customerPhone: form.phone,
            });

            clearCart();
            navigate("/success");
        } catch (error: any) {
            console.error("Order creation failed:", error);

            // Unblock the submit button by calling the exposed reset function
            if ((window as any).__resetCheckoutForm) {
                const msg = error.message ? error.message.replace("Uncaught Error: ", "") : "Payment or order creation failed.";
                (window as any).__resetCheckoutForm(msg);
            } else {
                alert("Payment or order creation failed. Please check your details and try again.");
            }
        }
    }, [form, finalTotal, cart, processPayment, createOrder, clearCart, navigate]);


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


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCountryChange = (code: string) => {
        setForm(prev => ({ ...prev, country: code }));
    };

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

                            <div className="flex gap-4 mb-8">
                                <button
                                    onClick={() => setSelectedPaymentMethod("card")}
                                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${selectedPaymentMethod === "card" ? "border-[#6A3E1D] bg-[#6A3E1D]/5 text-[#6A3E1D]" : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"}`}
                                >
                                    Credit Card
                                </button>
                                {/* 
                                <button
                                    onClick={() => setSelectedPaymentMethod("klarna")}
                                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${selectedPaymentMethod === "klarna" ? "border-[#FFB3C7] bg-[#FFB3C7]/10 text-black" : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"}`}
                                >
                                    Klarna
                                </button>
                                */}
                            </div>

                            <div>
                                {form.country ? (
                                    selectedPaymentMethod === "card" ? (
                                        <CheckoutForm
                                            totalAmount={finalTotal}
                                            onSubmitSuccess={handleOrderCreation}
                                            onError={() => { }}
                                            isFormComplete={isFormValid}
                                        />
                                    ) : (
                                        <KlarnaForm
                                            totalAmount={finalTotal}
                                            shippingAmount={shippingCost}
                                            cartDetails={cart}
                                            customerEmail={form.email}
                                            formCompleteData={form}
                                            onSubmitSuccess={handleOrderCreation}
                                            onError={() => { }}
                                            isFormComplete={isFormValid}
                                        />
                                    )
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
                                    Your payment information is encrypted and processed securely by Checkout.com. We do not store your credit card details.
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
