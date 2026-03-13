import { motion, AnimatePresence } from "framer-motion";
import IconAddToCart from "../assets/icons/addtocart.svg";
import { siInstagram, siTiktok, siWhatsapp } from "simple-icons/icons";
import { useId, useState } from "react";
import { useCart } from "../context/CartContext";
import { showToast } from "./CustomToast";
import { X, Minus, Plus, ShoppingBag, Check, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
    id: string;
    image: string;
    price: number;
    displayPrice: string;
    title: string;
    subtitle: string;
    description?: string;
    images?: string[];
    stockQuantity?: string | number;
}

export default function ProductCard({
    id,
    image,
    price,
    displayPrice,
    title,
    subtitle,
    description,
    images = [],
    stockQuantity = 0
}: ProductCardProps) {
    const uniqueId = useId();
    const clipPathId = `cardImageMask-${uniqueId}`;
    const filterId = `cardFilter-${uniqueId}`;
    const gradientId = `cardGradient-${uniqueId}`;
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(image);
    const [isCopied, setIsCopied] = useState(false);

    // Combine main image with additional images for gallery
    const allImages = [image, ...(images?.filter(img => img !== image) || [])];

    const openModal = () => {
        setIsModalOpen(true);
        setQuantity(1);
        setSelectedImage(image);
        setIsCopied(false); // Reset copy state
    };

    const closeModal = () => setIsModalOpen(false);

    const handleIncrement = () => {
        const maxStock = typeof stockQuantity === 'string' ? parseInt(stockQuantity) : stockQuantity; // Fallback to safe max
        if (maxStock && quantity >= maxStock) return;
        setQuantity(prev => prev + 1);
    };

    const handleDecrement = () => {
        if (quantity > 1) setQuantity(prev => prev - 1);
    };

    const confirmAddToCart = () => {
        addToCart({
            productId: id,
            name: title,
            price: price,
            quantity: quantity,
            image: image,
        });
        showToast(title, image);
        closeModal();
    };

    const handleBuyNow = () => {
        addToCart({
            productId: id,
            name: title,
            price: price,
            quantity: quantity,
            image: image,
        });
        closeModal();
        navigate("/checkout");
    };

    return (
        <>
            <motion.div
                className="group relative rounded-[32px] overflow-hidden transition-all duration-500 border border-transparent w-full max-w-[220px] mx-auto cursor-pointer"
                variants={{
                    hidden: { opacity: 0, scale: 0.9, y: 30 },
                    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
                }}
                whileHover={{ y: -10 }}
                onClick={openModal}
            >
                {/* Image Container with Custom Subtract Shape */}
                <div className="w-full aspect-[212/279] relative">
                    <svg
                        viewBox="0 0 212 279"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full transition-all duration-500"
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <filter id={filterId} x="0" y="0" width="212" height="279" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                <feMorphology radius="3" operator="erode" in="SourceAlpha" result="effect1_dropShadow" />
                                <feOffset dy="9" />
                                <feGaussianBlur stdDeviation="7.2" />
                                <feComposite in2="hardAlpha" operator="out" />
                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
                                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
                            </filter>

                            <clipPath id={clipPathId}>
                                <path
                                    d="M212 207.466C212 215.303 201.515 220.416 193.754 219.33C192.201 219.112 190.613 219 189 219C170.222 219 155 234.222 155 253C155 254.684 155.122 256.339 155.359 257.956C156.572 266.259 150.854 279 142.463 279H9C4.02944 279 0 274.971 0 270V9.00001C0 4.02945 4.02944 0 9 0H203C207.971 0 212 4.02944 212 9V207.466ZM212 278.705C212 278.866 211.867 279 211.706 279C211.435 279 211.305 278.66 211.508 278.48C211.698 278.313 212 278.452 212 278.705Z"
                                />
                            </clipPath>

                            <linearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
                                <stop offset="0%" stopColor="#000" stopOpacity="1" />
                                <stop offset="100%" stopColor="#000" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Group applying the filter to the clipped image */}
                        <g filter={`url(#${filterId})`}>
                            {/* Background fill */}
                            <path
                                d="M212 207.466C212 215.303 201.515 220.416 193.754 219.33C192.201 219.112 190.613 219 189 219C170.222 219 155 234.222 155 253C155 254.684 155.122 256.339 155.359 257.956C156.572 266.259 150.854 279 142.463 279H9C4.02944 279 0 274.971 0 270V9.00001C0 4.02945 4.02944 0 9 0H203C207.971 0 212 4.02944 212 9V207.466ZM212 278.705C212 278.866 211.867 279 211.706 279C211.435 279 211.305 278.66 211.508 278.48C211.698 278.313 212 278.452 212 278.705Z"
                                fill="white"
                            />

                            {/* Content Group with Clip and Scale */}
                            <g clipPath={`url(#${clipPathId})`}>
                                <g
                                    className="transition-transform duration-700 group-hover:scale-105"
                                    style={{ transformOrigin: '106px 139.5px' }}
                                >
                                    <image
                                        href={image}
                                        width="212"
                                        height="279"
                                        preserveAspectRatio="xMidYMid slice"
                                    />
                                    <rect
                                        x="0"
                                        y="167"
                                        width="212"
                                        height="112"
                                        fill={`url(#${gradientId})`}
                                        className="pointer-events-none"
                                    />
                                </g>
                            </g>
                        </g>
                    </svg>
                    {/* Quick View / Eye Button */}
                    <motion.button
                        className="absolute top-6 right-6 bg-black/15 p-2.5 rounded-full shadow-md text-gray-400 hover:text-red-500 hover:scale-110 z-20"
                        whileHover={{ scale: 1.2 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            openModal();
                        }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </motion.button>
                    <motion.button
                        className="absolute bottom-1 right-1 w-8 md:w-12 h-8 md:h-12 bg-[#6A3E1D] text-white rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(239,36,96,0.4)] z-30 pointer-events-auto"
                        whileHover={{ scale: 1.2, backgroundColor: "#C91A4B" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            openModal();
                        }}
                    >
                        <img src={IconAddToCart} alt="icon add to cart" className="w-6 md:w-8" />
                    </motion.button>
                    <p className="absolute bottom-2 left-2 text-white font-bold text-lg font-['Poppins']">
                        {displayPrice}
                    </p>
                </div>

                <div className="px-4 py-2 relative mt-[-20px] z-20">
                    <h3 className="font-['Poppins'] text-[#1A1A1A] font-semibold text-base md:text-xl mt-5 group-hover:text-[#6A3E1D] transition">
                        {title}
                    </h3>
                </div>
            </motion.div>

            {/* Product Details Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white/80 backdrop-blur-xl border border-white/50 rounded-[22px] w-full max-w-4xl max-h-[80vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row overflow-hidden ring-1 ring-white/60"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={closeModal}
                                className="fixed top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-all duration-300 z-10 shadow-sm border border-white/60 backdrop-blur-sm"
                            >
                                <X size={20} className="text-gray-600 transition-colors" />
                            </button>
                            <div className="w-full md:w-1/2 p-4 md:p-6 bg-white flex flex-col gap-6 items-center justify-center relative">
                                <div className="aspect-[3/4] w-full max-w-[320px] rounded-2xl overflow-hidden bg-white shadow-lg border border-white/60 backdrop-blur-sm relative group">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <img
                                        src={selectedImage}
                                        alt={title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                {allImages.length > 1 && (
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-2 w-full justify-center">
                                        {allImages.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedImage(img)}
                                                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-sm ${selectedImage === img ? 'border-[#6A3E1D] scale-110 ring-2 ring-[#6A3E1D]/20' : 'border-white/60 hover:border-[#6A3E1D]/50 hover:scale-105'}`}
                                            >
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Details Section */}
                            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col font-['Manrope'] bg-white/30 backdrop-blur-md">
                                <div className="mb-6">
                                    <h2 className="font-['Cambay'] text-4xl font-bold text-gray-900 mb-2 tracking-tight leading-tight">{title}</h2>
                                    <div className="flex items-center gap-3 mb-2">
                                        <p className="text-[#6A3E1D] font-bold text-3xl font-['Poppins']">{displayPrice}</p>
                                        <span className="px-3 py-1 bg-[#6A3E1D]/10 text-[#6A3E1D] text-xs font-bold rounded-full uppercase tracking-wider">
                                            {stockQuantity && quantity >= (typeof stockQuantity === 'string' ? parseInt(stockQuantity) : stockQuantity) ? "Max Stock" : "In Stock"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-2 mt-2">
                                        <p className="text-gray-500 font-medium text-sm border-l-2 border-[#6A3E1D]/30 pl-3">{subtitle}</p>

                                        {/* Share Section */}
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Share:</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        const url = `${window.location.origin}/shop/${id}`;
                                                        navigator.clipboard.writeText(url);
                                                        setIsCopied(true);
                                                        setTimeout(() => setIsCopied(false), 2000);
                                                    }}
                                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-[#6A3E1D] transition-all hover:scale-105 relative group shadow-sm"
                                                    title="Copy Link"
                                                >
                                                    {isCopied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                                                    {isCopied && (
                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded-lg opacity-0 animate-fade-in-up transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                                                            Copied!
                                                        </span>
                                                    )}
                                                </button>
                                                <a href={`https://wa.me/?text=${encodeURIComponent(`Check out ${title}: ${window.location.origin}/shop/${id}`)}`} target="_blank" rel="noopener noreferrer"
                                                    className="p-2 rounded-full bg-gray-100 hover:bg-[#25D366] hover:text-white text-gray-600 transition-all hover:scale-105 shadow-sm"
                                                    title="Share on WhatsApp"
                                                >
                                                    <svg role="img" viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current"><path d={siWhatsapp.path} /></svg>
                                                </a>
                                                <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer"
                                                    className="p-2 rounded-full bg-gray-100 hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:via-[#dc2743] hover:via-[#cc2366] hover:to-[#bc1888] hover:text-white text-gray-600 transition-all hover:scale-105 shadow-sm"
                                                    title="Share on Instagram"
                                                >
                                                    <svg role="img" viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current"><path d={siInstagram.path} /></svg>
                                                </a>
                                                <a href={`https://www.tiktok.com/`} target="_blank" rel="noopener noreferrer"
                                                    className="p-2 rounded-full bg-gray-100 hover:bg-black hover:text-white text-gray-600 transition-all hover:scale-105 shadow-sm"
                                                    title="Share on TikTok"
                                                >
                                                    <svg role="img" viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current"><path d={siTiktok.path} /></svg>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="prose prose-sm text-gray-600 mb-8 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    <p className="leading-relaxed text-base">{description || "Experience premium quality with our exclusive hair collection. Designed for elegance and durability."}</p>
                                </div>

                                <div className="mt-auto space-y-8">
                                    {/* Stock & Quantity */}
                                    <div className="flex flex-col gap-4">
                                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Quantity</label>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm">
                                                <button
                                                    onClick={handleDecrement}
                                                    className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-600 hover:bg-[#6A3E1D] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-gray-50 disabled:hover:text-gray-600"
                                                    disabled={quantity <= 1}
                                                >
                                                    <Minus size={18} />
                                                </button>
                                                <span className="font-bold w-12 text-center text-lg text-gray-800">{quantity}</span>
                                                <button
                                                    onClick={handleIncrement}
                                                    className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-600 hover:bg-[#6A3E1D] hover:text-white transition-colors"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                            <div className="text-sm font-medium text-gray-500">
                                                {stockQuantity ? (
                                                    <span className="text-gray-400">
                                                        Available: <span className="text-gray-900 font-bold">{stockQuantity}</span>
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={confirmAddToCart}
                                            className="flex-1 py-4 px-6 bg-white border-2 border-gray-900 text-gray-900 rounded-2xl font-bold hover:bg-gray-900 hover:text-white transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 shadow-sm hover:shadow-lg"
                                        >
                                            <ShoppingBag size={20} />
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={handleBuyNow}
                                            className="flex-1 py-4 px-6 bg-[#6A3E1D] text-white rounded-2xl font-bold hover:bg-[#D0184D] transition-all duration-300 active:scale-95 shadow-[0_8px_20px_rgba(239,36,96,0.3)] hover:shadow-[0_12px_24px_rgba(239,36,96,0.4)] ring-4 ring-[#6A3E1D]/10"
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}