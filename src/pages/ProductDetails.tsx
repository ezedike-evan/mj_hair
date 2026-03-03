import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { showToast } from "../components/CustomToast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Share2, ArrowLeft, Copy, Check } from "lucide-react";
import { siFacebook, siX, siWhatsapp, siPinterest } from "simple-icons/icons";
import SEO from "../components/SEO";


// Define SocialIcon outside the component to avoid re-creation on render
const SocialIcon = ({ icon, href }: { icon: { hex: string, path: string }, href: string }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        style={{ color: `#${icon.hex}` }}
    >
        <svg role="img" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d={icon.path} />
        </svg>
    </a>
);

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const product = useQuery(api.products.getProduct, { id: id as Id<"products"> });
    const { addToCart } = useCart();

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [isSharing, setIsSharing] = useState(false);
    const [copied, setCopied] = useState(false);

    if (product === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#EFDCD5]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6A3E1D]"></div>
            </div>
        );
    }

    if (product === null) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#EFDCD5] gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
                <button onClick={() => navigate("/shop")} className="text-[#6A3E1D] font-bold hover:underline">Back to Shop</button>
            </div>
        );
    }


    // Set initial image if not set
    if (!selectedImage && product.mainImage) {
        setSelectedImage(product.mainImage);
    }

    // Prepare helper variables
    const image = product.mainImage || "";
    // images is already an array of URLs from backend
    const images = product.images || [];
    const allImages = [image, ...images.filter((img: string) => img !== image)];
    const title = product.productName;
    const price = parseFloat(product.productPrice);
    const description = product.productDescription;
    const stockQuantity = parseInt(product.stockQuantity || "0");
    const shareUrl = window.location.href; // Move this up for SEO usage

    const seoDescription = `${description ? description.substring(0, 150) : "Check out this product"}... Only £${price}`;

    const handleIncrement = () => {
        if (stockQuantity && quantity >= stockQuantity) return;
        setQuantity(prev => prev + 1);
    };

    const handleDecrement = () => {
        if (quantity > 1) setQuantity(prev => prev - 1);
    };

    const handleAddToCart = () => {
        addToCart({
            productId: id!,
            name: title,
            price: price,
            quantity: quantity,
            image: image,
        });
        showToast(title, image);
    };

    const handleBuyNow = () => {
        handleAddToCart();
        navigate("/checkout");
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#FFF5F7] font-['Manrope']">
            <SEO
                title={title}
                description={seoDescription}
                image={image}
                url={shareUrl}
                type="product"
                price={price}
                currency="GBP"
            />
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#6A3E1D] mb-8 font-semibold transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                <div className="bg-white rounded-[32px] shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
                    {/* Image Section */}
                    <div className="w-full lg:w-1/2 p-6 lg:p-10 bg-gray-50 flex flex-col items-center justify-center relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-[400px] aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-white relative mb-6"
                        >
                            <img
                                src={selectedImage || image}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                        </motion.div>

                        {allImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 w-full justify-center max-w-lg scrollbar-hide">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === img ? 'border-[#6A3E1D] ring-2 ring-[#6A3E1D]/20' : 'border-gray-200 hover:border-[#6A3E1D]/50'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="font-['Cambay'] text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                                    {title}
                                </h1>
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl font-bold text-[#6A3E1D] font-['Poppins']">
                                        £{price}
                                    </span>
                                    {stockQuantity > 0 ? (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                                            In Stock
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-wider">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Simple Share Button */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsSharing(!isSharing)}
                                    className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                                    title="Share Product"
                                >
                                    <Share2 size={24} />
                                </button>

                                {isSharing && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className="absolute right-0 top-full mt-2 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 w-72 z-20"
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="font-bold text-gray-800 text-sm">Share via</span>
                                            <button onClick={() => setIsSharing(false)} className="text-gray-400 hover:text-gray-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>

                                        <div className="flex gap-3 justify-center mb-4">
                                            <div className="flex gap-3 justify-center mb-4">
                                                <SocialIcon
                                                    icon={siWhatsapp}
                                                    href={`https://wa.me/?text=${encodeURIComponent(`Check out ${title} on MJ Hair: ${shareUrl}`)}`}
                                                />
                                                <SocialIcon
                                                    icon={siFacebook}
                                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                                />
                                                <SocialIcon
                                                    icon={siX}
                                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${title} on MJ Hair`)}&url=${encodeURIComponent(shareUrl)}`}
                                                />
                                                <SocialIcon
                                                    icon={siPinterest}
                                                    href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(title)}`}
                                                />
                                            </div>

                                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={shareUrl}
                                                    className="bg-transparent border-none text-xs text-gray-500 flex-1 focus:ring-0 truncate"
                                                />
                                                <button
                                                    onClick={copyToClipboard}
                                                    className="p-1.5 bg-white rounded-md shadow-sm hover:bg-gray-50 transition-colors text-gray-600"
                                                    title="Copy Link"
                                                >
                                                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <div className="prose prose-lg text-gray-600 mb-10 overflow-y-auto max-h-[200px] custom-scrollbar pr-4">
                            <p>{description || "No description available."}</p>
                        </div>

                        <div className="mt-auto pt-8 border-t border-gray-100">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Quantity</label>
                                    <div className="flex items-center gap-4 bg-gray-50 rounded-full p-1 border border-gray-200">
                                        <button
                                            onClick={handleDecrement}
                                            className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-gray-600 shadow-sm hover:text-[#6A3E1D] transition-colors disabled:opacity-50"
                                            disabled={quantity <= 1}
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="font-bold w-8 text-center text-lg text-gray-800">{quantity}</span>
                                        <button
                                            onClick={handleIncrement}
                                            className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-gray-600 shadow-sm hover:text-[#6A3E1D] transition-colors"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 py-4 px-8 bg-white border-2 border-gray-900 text-gray-900 rounded-2xl font-bold hover:bg-gray-900 hover:text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={stockQuantity === 0}
                                    >
                                        <ShoppingBag size={20} />
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        className="flex-1 py-4 px-8 bg-[#6A3E1D] text-white rounded-2xl font-bold hover:bg-[#D0184D] transition-all duration-300 shadow-[0_8px_20px_rgba(239,36,96,0.3)] hover:shadow-[0_12px_24px_rgba(239,36,96,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                        disabled={stockQuantity === 0}
                                    >
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
