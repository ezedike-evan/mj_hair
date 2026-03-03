import { motion } from "framer-motion";
import { IconArrowRight } from "./Icons";
import ProductCard from "./ProductCard";
import { useShop } from "../context/ShopContext";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function ShopSection() {
    const { products, categories, isLoading } = useShop();
    const [activeCategory, setActiveCategory] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Set default category to the first one when categories load
    useEffect(() => {
        if (categories.length > 0 && !activeCategory) {
            setActiveCategory(categories[0].name);
        }
    }, [categories, activeCategory]);

    const filteredProducts = products.filter((p: any) => {
        const matchesCategory = activeCategory ? p.selectedCategory === activeCategory : true;
        const matchesSearch = searchQuery
            ? p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.selectedTags && p.selectedTags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
            : true;
        return matchesCategory && matchesSearch;
    });

    return (
        <section id="shop" className="mx-auto px-6 py-32">
            <div className="flex flex-col lg:flex-row gap-20">
                {/* Sidebar - Hidden on Mobile */}
                <motion.div
                    className="hidden lg:block w-full lg:w-1/4 space-y-12"
                    initial={{ x: -60, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h2 className="font-['Cambay'] font-bold text-5xl text-[#5E4431]">
                        Categories
                    </h2>
                    <div className="flex flex-col gap-4 font-['Comfortaa'] font-bold text-xl text-gray-400">
                        <div className="relative pl-6">
                            <motion.div
                                className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 rounded-full"
                                initial={{ height: 0 }}
                                whileInView={{ height: "100%" }}
                                transition={{ duration: 1 }}
                            ></motion.div>
                            <div className="flex flex-col gap-6 pl-2">
                                {categories.map((category: any, idx: number) => {
                                    const isActive = activeCategory === category.name;
                                    return (
                                        <div key={idx} className="relative">
                                            {isActive && (
                                                <motion.div
                                                    className="absolute -left-[26px] top-0 bottom-0 w-1 bg-[#C9834E] rounded-full shadow-[0_0_10px_#C9834E]"
                                                    layoutId="activeCategoryIndicator"
                                                />
                                            )}
                                            <motion.button
                                                className={`text-left transition-all ${isActive ? "text-white" : "hover:text-[#C9834E]"}`}
                                                whileHover={{ x: 10 }}
                                                onClick={() => setActiveCategory(category.name)}
                                            >
                                                {category.name}
                                            </motion.button>
                                        </div>
                                    );
                                })}
                                {categories.length === 0 && (
                                    <div className="text-sm">Loading categories...</div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Product Grid */}
                <div className="w-full lg:w-3/4">
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="font-['Poppins'] text-center font-semibold text-4xl text-[#C9834E] mb-4 lg:mb-0">
                            Start Shopping
                        </h2>
                    </motion.div>

                    {/* Mobile Category Dropdown and Search */}
                    <motion.div
                        className="lg:hidden mb-8 space-y-4 z-20 relative"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {/* Custom Animated Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full px-6 py-4 flex justify-between items-center rounded-2xl bg-white border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6A3E1D]/20 transition-all active:scale-[0.99]"
                            >
                                <span className="font-['Comfortaa'] font-bold text-gray-700 capitalize">
                                    {activeCategory || "Select Category"}
                                </span>
                                <motion.div
                                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <svg className="w-5 h-5 text-[#C9834E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </motion.div>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <motion.div
                                    className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-30"
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: "auto" }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                >
                                    <div className="py-2 max-h-[300px] overflow-y-auto">
                                        {categories.map((category: any, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setActiveCategory(category.name);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-6 py-3 font-['Manrope'] font-semibold transition-colors
                                                ${activeCategory === category.name
                                                        ? 'bg-[#6A3E1D]/5 text-[#6A3E1D]'
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {category.name}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Search Bar */}
                        <div className="relative group">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for hair products..."
                                className="w-full px-6 py-4 pr-12 rounded-2xl bg-white border border-gray-100 focus:border-[#6A3E1D] focus:ring-2 focus:ring-[#6A3E1D]/10 focus:outline-none font-['Manrope'] text-gray-700 placeholder-gray-400 shadow-sm transition-all"
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#C9834E] text-white p-2.5 rounded-xl hover:bg-[#C91A4B] transition shadow-md group-focus-within:scale-110">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64 w-full col-span-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6A3E1D]"></div>
                        </div>
                    ) : (
                        <motion.div
                            key={activeCategory}
                            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                            }}
                        >
                            {filteredProducts.map((product: any) => (
                                <ProductCard
                                    key={product._id}
                                    id={product._id}
                                    image={product.mainImage}
                                    title={product.productName}
                                    subtitle={product.selectedTags ? product.selectedTags.join(" • ") : "High Quality"}
                                    price={parseFloat(product.productPrice)}
                                    displayPrice={`£${product.productPrice}`}
                                    description={product.productDescription}
                                    images={product.images}
                                    stockQuantity={product.stockQuantity}
                                />
                            ))}
                            {filteredProducts.length === 0 && (
                                <div className="col-span-full text-center text-gray-500 py-10">
                                    No products found in this category.
                                </div>
                            )}
                        </motion.div>
                    )}
                    <Link to="/shop" className="flex float-right font-['Cambay'] font-bold text-[#C9834E] text-xl hover:text-[#8C1434] transition items-center gap-2 group">
                        See All{" "}
                        <span className="group-hover:translate-x-1 transition-transform">
                            <IconArrowRight />
                        </span>
                    </Link>
                </div>
            </div>
        </section>
    );
}