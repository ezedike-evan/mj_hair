import { Mail, MapPin, Phone } from "lucide-react";
import imgJennyLogo from "../assets/logo.svg";
import { Link } from "react-router-dom";
import { siInstagram, siWhatsapp } from 'simple-icons/icons';
import { useState } from "react";
import OrderPolicyModal from "./OrderPolicyModal";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";


export default function Footer() {
    const [isOrderPolicyOpen, setIsOrderPolicyOpen] = useState(false);

    const subscribeToNewsletter = useMutation(api.newsletter.subscribe);
    const [email, setEmail] = useState("");
    const [isSubscribing, setIsSubscribing] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubscribing(true);
        try {
            const result = await subscribeToNewsletter({ email });
            if (result.success) {
                setEmail("");
                alert(result.message); // Replace with professional toast if available
            }
        } catch (error) {
            console.error("Subscription error:", error);
            alert("Failed to subscribe. Please try again.");
        } finally {
            setIsSubscribing(false);
        }
    };

    return (
        <footer className="relative mt-0 bg-[#6A3E1D] text-white pt-20 pb-10 overflow-hidden font-['Manrope']">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#A55416] rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#A55416] rounded-full blur-[100px]" />
            </div>

            <div className="max-w-[1200px] mx-auto px-6 relative z-10">
                {/* Newsletter Section */}
                <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 mb-16 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 shadow-xl">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold font-['Comfortaa'] mb-2">Join the VIP List</h3>
                        <p className="text-pink-100/80">Get exclusive offers, early access, and beauty tips.</p>
                    </div>
                    <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubscribing}
                            required
                            className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#6A3E1D] transition w-full md:w-[300px] disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={isSubscribing}
                            className="bg-[#BD713E] text-white px-6 py-3 rounded-xl font-bold transition shadow-lg whitespace-nowrap disabled:opacity-50 hover:bg-[#A55416]"
                        >
                            {isSubscribing ? "Subscribing..." : "Sign Up"}
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-12 mb-12">
                    {/* Brand Column */}
                    <div className="md:col-span-1 space-y-6">
                        <Link to="/">
                            <img src={imgJennyLogo} alt="Jenny's Hair" className="h-10 opacity-90" />
                        </Link>
                        <p className="text-white/70 leading-relaxed text-sm">
                            Discover the best wigs and human hair with MJ HAIR PALACE
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.instagram.com/mjhairpalace" target="_blank" className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#BD713E] flex items-center justify-center transition-all duration-300 border border-white/10 group">
                                <svg role="img" viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-white group-hover:fill-white transition-colors" xmlns="http://www.w3.org/2000/svg">
                                    <title>{siInstagram.title}</title>
                                    <path d={siInstagram.path} />
                                </svg>
                            </a>
                            <a href="https://wa.me/447407106707" target="_blank" className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#BD713E] flex items-center justify-center transition-all duration-300 border border-white/10 group">
                                <svg role="img" viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-white group-hover:fill-white transition-colors" xmlns="http://www.w3.org/2000/svg">
                                    <title>{siWhatsapp.title}</title>
                                    <path d={siWhatsapp.path} />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="font-['Comfortaa'] text-lg font-bold mb-6">Shop</h4>
                        <ul className="space-y-4 text-white/70 text-sm">
                            <li><Link to="/shop" className="hover:text-[#BD713E] transition">All Products</Link></li>
                            <li><Link to="/shop?category=wigs" className="hover:text-[#BD713E] transition">Wigs</Link></li>
                            <li><Link to="/shop?category=bundles" className="hover:text-[#BD713E] transition">Bundles</Link></li>
                            <li><Link to="/shop?category=accessories" className="hover:text-[#BD713E] transition">Accessories</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-['Comfortaa'] text-lg font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-white/70 text-sm">
                            <li><Link to="/about" className="hover:text-[#BD713E] transition">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-[#BD713E] transition">Contact</Link></li>
                            <li>
                                <button
                                    onClick={() => setIsOrderPolicyOpen(true)}
                                    className="hover:text-[#BD713E] transition text-left"
                                >
                                    Our Policy
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-['Comfortaa'] text-lg font-bold mb-6">Contact</h4>
                        <ul className="space-y-6 text-white/70 text-sm">
                            <li className="flex flex-col">
                                <Phone size={16} className="text-[#BD713E]" />
                                <span>+447407106707</span>
                            </li>
                            <li className="flex flex-col">
                                <Mail size={16} className="text-[#BD713E]" />
                                <a href="mailto:mjhairpalace@gmail.com" className="hover:text-[#BD713E] transition">mjhairpalace@gmail.com</a>
                            </li>
                            <li className="flex flex-col">
                                <MapPin size={16} className="text-[#BD713E]" />
                                <span>9 Mortimer street, Leominster, Hr68pg, Herefordshire</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50">
                    <a href="https://wa.me/2349120014546" target="_blank" rel="noopener noreferrer" className="hover:text-[#BD713E] transition"><p>© Designed by corewave media</p></a>
                    <div className="flex gap-6 items-center">
                        <div className="flex gap-2">
                            <span className="bg-white/10 px-2 py-1 rounded text-xs text-white/80">Visa</span>
                            <span className="bg-white/10 px-2 py-1 rounded text-xs text-white/80">Mastercard</span>
                            <span className="bg-white/10 px-2 py-1 rounded text-xs text-white/80">PayPal</span>
                            <span className="bg-white/10 px-2 py-1 rounded text-xs text-white/80">Clearpay</span>
                        </div>
                    </div>
                </div>
            </div>

            <OrderPolicyModal isOpen={isOrderPolicyOpen} onClose={() => setIsOrderPolicyOpen(false)} />
        </footer>
    );
}