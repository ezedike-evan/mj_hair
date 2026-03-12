import { motion, type Variants } from "framer-motion";
import imgBackground from "../assets/background.svg";
import imgHero from "../assets/hero-image.png";
import { IconStar } from "./Icons";
import { Link } from "react-router-dom";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.3,
        },
    },
};

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

const fadeInScale: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
};

const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -60 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

export default function Hero() {
    return (
        <div className="relative w-full h-max">
            <motion.div
                className="absolute top-0 left-0 w-full h-full -z-0"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
            >
                <img
                    src={imgBackground}
                    alt="Background"
                    className="w-full h-full object-cover [object-position:70%_center] md:[object-position:center]"
                />
            </motion.div>

            <section className="z-10 mx-auto md:px-32 h-screen w-full flex flex-col md:flex-row items-center md:pt-24 overflow-hidden md:pb-0 md:gap-0">

                {/* Image Section - Order 1 on Mobile, Order 2 on Desktop */}
                <div className="relative w-full flex-1 md:h-full md:w-1/2 flex items-center justify-center order-1 md:order-2">
                    <motion.div
                        className="relative w-full h-full flex items-center justify-center"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                    >
                        {/* Main Hero Illustration */}
                        <img
                            src={imgHero}
                            alt="Hero Models"
                            className="w-full h-full object-cover md:object-contain drop-shadow-2xl"
                        />

                        {/* Ratings Badge - Floating Bottom Right (Desktop) */}
                        <motion.div
                            className="flex absolute bottom-[5%] left-[5%] md:bottom-[20%] md:left-[0%] bg-white/30 backdrop-blur-md p-3 md:p-4 rounded-[20px] md:rounded-[24px] shadow-xl flex-col items-start gap-1 md:gap-2 scale-90 md:scale-100 origin-right"
                            variants={fadeInUp}
                            custom={1}
                        >
                            <div className="flex -space-x-2 md:-space-x-3 mb-1">
                                {[
                                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
                                    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=100&h=100&q=80",
                                    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&h=100&q=80",
                                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80"
                                ].map((img, i) => (
                                    <img key={i} src={img} className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover ring-2 ring-white" alt="" />
                                ))}
                                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#5E4431] border-2 border-white flex items-center justify-center text-white text-[8px] md:text-[9px] font-bold">
                                    15K
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            className="flex absolute bottom-[5%] right-[5%] md:bottom-[20%] md:right-[0%] bg-white/30 backdrop-blur-md p-3 md:p-4 rounded-[20px] md:rounded-[24px] shadow-xl flex-col items-start gap-1 md:gap-2 scale-90 md:scale-100 origin-right"
                            variants={fadeInUp}
                            custom={1}
                        >
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <span key={i} className="text-[#FFD700] drop-shadow-sm"><IconStar /></span>
                                ))}
                            </div>
                            <span className="text-white text-[10px] md:text-xs font-bold font-['Manrope']">Rated 5.0/5.0 by users</span>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Text Section - Order 2 on Mobile, Order 1 on Desktop */}
                <motion.div
                    className="flex flex-col justify-center items-center text-center w-full md:w-1/2 md:text-left md:items-start md:px-0 order-2 md:order-1 md:h-auto"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h1
                        className="font-[ADLaM_Display] text-3xl sm:text-4xl lg:text-6xl leading-[1.2] text-[#5E4431] drop-shadow-lg"
                        variants={fadeInUp}
                    >
                        No. 1{" "}
                        <motion.span
                            className="inline-block bg-[#5E4431]/50 text-white px-3 py-1 md:px-4 transform -rotate-2 rounded-xl shadow-lg"
                            variants={fadeInScale}
                        >
                            Hair
                        </motion.span>
                        <br className="hidden md:block" />{" "}
                        <motion.span
                            className="inline-block bg-[#5E4431]/50 text-white px-3 py-1 md:px-4 rounded-xl shadow-lg mt-2 md:mt-4"
                            variants={fadeInScale}
                        >
                            Supplier/Plug
                        </motion.span>{" "}
                        <span className="text-[#5E4431]">in</span>
                        <br />
                        United Kingdom
                    </motion.h1>

                    <motion.div
                        className="flex z-2 flex-wrap justify-center gap-4 pt-6 md:pt-10 md:justify-start"
                        variants={slideInLeft}
                    >
                        <Link
                            to="/signup"
                            className="bg-[#BD713E] text-white px-6 py-3 md:px-8 md:py-4 rounded-2xl font-bold font-['Comfortaa'] text-xs md:text-sm hover:-translate-y-1 transition shadow-lg hover:shadow-xl"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/shop"
                            className="bg-[#BD713E] text-white px-6 py-3 md:px-8 md:py-4 rounded-2xl font-bold font-['Comfortaa'] text-xs md:text-sm hover:-translate-y-1 transition shadow-lg hover:shadow-xl inline-block"
                        >
                            Shop Hairs
                        </Link>
                    </motion.div>
                </motion.div>
            </section>
        </div>
    );
}
