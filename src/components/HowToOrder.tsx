import binocularIcon from "../assets/icons/binocular.svg";
import bagIcon from "../assets/icons/bag.svg";
import cardIcon from "../assets/icons/card.svg";
import fastDeliveryIcon from "../assets/icons/fastDelivery.svg";
import { motion, type Variants } from "framer-motion";

export default function HowToOrder() {
    const steps = [
        {
            title: "Peruse",
            desc: "Peruse Our collection and Choose one or ten or hundred.",
            icon: binocularIcon,
        },
        {
            title: "Add\nto Bag",
            desc: "Add your favourites to your cart/bag",
            icon: bagIcon,
        },
        {
            title: "Make\nPayment",
            desc: "Using your card or clearpay, you simply make payment and enter your address.",
            icon: cardIcon,
        },
        {
            title: "Have\nit Delivered",
            desc: "Have your hair delivered and enjoy your premium hair or hair products.",
            icon: fastDeliveryIcon,
        },
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const cardVariants: Variants = {
        hidden: {
            opacity: 0,
            rotateX: -90,
            y: 50,
            scale: 0.8
        },
        visible: {
            opacity: 1,
            rotateX: 0,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 70,
                damping: 15,
                mass: 1.2
            }
        },
    };

    return (
        <section className="bg-gradient-to-r from-[#C77C44] to-[#D3AB38] overflow-hidden flex flex-col justify-center">
            <div className="w-full h-full bg-black/50 py-16 px-6 ">
                <div className="max-w-[1400px] mx-auto w-full">
                    <motion.h2
                        initial={{ opacity: 0, y: -50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, margin: "-100px" }} // Re-animates on scroll
                        transition={{ duration: 0.8, type: "spring" }}
                        className="text-center text-5xl font-['Cambay'] mb-24"
                    >
                        <span className="text-white font-normal">How to </span>
                        <span className="text-[#C9834E] font-bold">Order</span>
                    </motion.h2>

                    <motion.div
                        className="flex flex-wrap justify-center gap-10 perspective-1000"
                        style={{ perspective: "1200px" }}
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.2, margin: "-50px" }} // Triggers entrance/exit
                    >
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                className="relative w-[280px] h-[320px] group cursor-pointer"
                                variants={cardVariants}
                                whileHover={{
                                    y: -20,
                                    scale: 1.05,
                                    rotateX: 5, // Subtle tilt on hover
                                    zIndex: 10,
                                    transition: { type: "spring", stiffness: 300 }
                                }}
                            >
                                {/* Static SVG Background with animated Drop Shadow via CSS/Group */}
                                <div className="absolute inset-0 transition-all duration-500 group-hover:drop-shadow-[0_30px_30px_rgba(239,36,96,0.5)]">
                                    <svg width="100%" height="100%" viewBox="0 0 215 239" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                        <defs>
                                            <filter id={`filter0_d_${idx}`} x="0" y="0" width="214.8" height="238.8" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                                <feMorphology radius="3" operator="erode" in="SourceAlpha" result={`effect1_dropShadow_${idx}`} />
                                                <feOffset dy="9" />
                                                <feGaussianBlur stdDeviation="7.2" />
                                                <feComposite in2="hardAlpha" operator="out" />
                                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                                                <feBlend mode="normal" in2="BackgroundImageFix" result={`effect1_dropShadow_${idx}`} />
                                                <feBlend mode="normal" in="SourceGraphic" in2={`effect1_dropShadow_${idx}`} result="shape" />
                                            </filter>

                                            <linearGradient id={`paint0_linear_${idx}`} x1="126.051" y1="218.4" x2="56.409" y2="46.5155" gradientUnits="userSpaceOnUse">
                                                <stop stopColor="#E08D5A" />
                                                <stop offset="1" stopColor="#753803" />
                                            </linearGradient>
                                        </defs>

                                        <g filter={`url(#filter0_d_${idx})`}>
                                            <path
                                                d="M89.3304 2.3999C97.437 2.3999 103.218 10.3462 102.606 18.4297C102.47 20.2352 102.4 22.0594 102.4 23.8999C102.4 63.3883 134.412 95.3999 173.9 95.3999C177.897 95.3999 181.817 95.0718 185.635 94.4411C194.241 93.0196 203.4 98.9441 203.4 107.667V209.4C203.4 214.37 199.371 218.4 194.4 218.4H20.4C15.4295 218.4 11.4 214.37 11.4 209.4V11.3999C11.4 6.42934 15.4295 2.3999 20.4 2.3999H89.3304Z"
                                                fill={`url(#paint0_linear_${idx})`}
                                            />
                                        </g>
                                    </svg>
                                </div>

                                {/* Shine Effect Overlay */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 z-5 opacity-0 pointer-events-none"
                                    animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ backgroundSize: "200% 200%", clipPath: "path('M89.3304 2.3999C97.437 2.3999 103.218 10.3462 102.606 18.4297C102.47 20.2352 102.4 22.0594 102.4 23.8999C102.4 63.3883 134.412 95.3999 173.9 95.3999C177.897 95.3999 181.817 95.0718 185.635 94.4411C194.241 93.0196 203.4 98.9441 203.4 107.667V209.4C203.4 214.37 199.371 218.4 194.4 218.4H20.4C15.4295 218.4 11.4 214.37 11.4 209.4V11.3999C11.4 6.42934 15.4295 2.3999 20.4 2.3999H89.3304Z')" }}
                                    whileHover={{ opacity: 1 }}
                                />

                                {/* Content overlay */}
                                <div className="absolute inset-0 flex flex-col items-start justify-center pt-12 pb-8 px-8 z-10">
                                    <motion.h3
                                        className="text-white text-3xl font-bold mb-3 whitespace-pre-line"
                                        initial={{ opacity: 0, x: -30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (idx * 0.1), type: "spring" }}
                                    >
                                        {step.title}
                                    </motion.h3>
                                    <motion.p
                                        className="text-white text-sm leading-relaxed"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        transition={{ delay: 0.5 + (idx * 0.1) }}
                                    >
                                        {step.desc}
                                    </motion.p>
                                </div>

                                {/* Icon overlay */}
                                <motion.div
                                    className="absolute z-1 -top-[19px] -right-[5px] w-[130px] h-[130px] rounded-full bg-[#C55200] flex items-center justify-center shadow-lg"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: idx * 0.5
                                    }}
                                    whileHover={{ scale: 1.2, rotate: 15 }}
                                >
                                    <img src={step.icon} alt={step.title} className="w-16 h-16 drop-shadow-md" />
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}