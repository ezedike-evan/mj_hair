import { Link, useLocation, useNavigate } from "react-router-dom";
import { SignedOut } from "@clerk/clerk-react";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import cart from "../assets/icons/cart.svg"
import { motion, AnimatePresence } from "framer-motion";
import { CircleUserRound } from 'lucide-react';
import mjLogo from "../assets/logo.svg";
import UserProfile from "./UserProfile";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { totalItems, totalAmount } = useCart();
    const location = useLocation();
    const navigate = useNavigate();

    const scrollToSection = (id: string) => {
        setIsMenuOpen(false);
        if (location.pathname !== "/") {
            navigate("/");
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }, 100);
        } else {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    const isScrollablePage = location.pathname === "/dashboard" || location.pathname === "/shop";

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`${isScrollablePage ? "relative mb-8 mx-auto" : "fixed top-6 left-1/2 -translate-x-1/2 "} z-50 w-[85%] max-w-[1000px] bg-gradient-to-t from-[#E08D5A] to-[#753803] pl-[15px] lg:pl-[35px] pr-[10px] lg:pr-[20px] py-[10px] md:py-[15px] flex items-center justify-between rounded-full`}
            >
                <Link to="/">
                    <img
                        src={mjLogo}
                        alt="MJ Hair Palace"
                        className="h-6 lg:h-10 cursor-pointer"
                    />
                </Link>

                <ul className="hidden lg:flex items-center gap-8 font-['Comfortaa',sans-serif] text-sm font-bold text-white">
                    <li>
                        <Link
                            to="/shop"
                            className="hover:text-pink-100 transition cursor-pointer"
                        >
                            Shop Now
                        </Link>
                    </li>
                    <li
                        onClick={() => scrollToSection("about")}
                        className="hover:text-pink-100 transition cursor-pointer"
                    >
                        About Us
                    </li>
                    <li
                        onClick={() => scrollToSection("contact")}
                        className="hover:text-pink-100 transition cursor-pointer"
                    >
                        Contact Us
                    </li>
                </ul>


                <div className="relative p-[2px] md:p-[3px] rounded-full bg-white">
                    <div className="flex items-center gap-1 md:gap-3 bg-[#FAA75F] backdrop-blur-md px-2 py-1 rounded-full shadow-sm">

                        <div className="relative">
                            <UserProfile />
                            <SignedOut>
                                <Link to="/login" className="block p-1 bg-[#841232]/58 rounded-full shadow-sm transition hover:bg-[#841232]">
                                    <CircleUserRound size={24} color="white" />
                                </Link>
                            </SignedOut>
                        </div>
                        <Link to="/cart" className="relative flex items-center gap-3 bg-gradient-to-r from-[#C67945] to-[#D4AF37] text-white pl-4 pr-5 py-2 rounded-full shadow-md ml-1 hover:scale-105 transition">
                            <div className="relative">
                                <img src={cart} alt="" className="w-4 md:w-5 h-4 md:h-5" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-[#6A3E1D] text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                        {totalItems}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-[8px] opacity-80 font-bold font-sans">
                                    Your Cart
                                </span>
                                <span className="text-[16px] mt-1 font-bold">£{totalAmount.toLocaleString()}</span>
                            </div>
                        </Link>
                        {/* Hamburger Menu Button - Mobile Only */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden flex flex-col gap-1.5 p-2 z-50 relative"
                            aria-label="Toggle menu"
                        >
                            <motion.span
                                animate={isMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                                className="w-6 h-0.5 bg-white rounded-full"
                            />
                            <motion.span
                                animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                                className="w-6 h-0.5 bg-white rounded-full"
                            />
                            <motion.span
                                animate={isMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                                className="w-6 h-0.5 bg-white rounded-full"
                            />
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute right-0 top-0 h-full w-[280px] bg-[#6A3E1D] shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col h-full justify-center items-center px-8">
                                <ul className="flex flex-col gap-8 font-['Comfortaa',sans-serif] text-lg font-bold text-white">
                                    <li>
                                        <Link
                                            to="/shop"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="hover:text-pink-100 transition cursor-pointer"
                                        >
                                            Shop Now
                                        </Link>
                                    </li>
                                    <li
                                        onClick={() => scrollToSection("about")}
                                        className="hover:text-pink-100 transition cursor-pointer"
                                    >
                                        About Us
                                    </li>
                                    <li
                                        onClick={() => scrollToSection("contact")}
                                        className="hover:text-pink-100 transition cursor-pointer"
                                    >
                                        Contact Us
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
