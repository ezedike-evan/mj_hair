import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import imgHairs from "../assets/1f13e2d8ea5833cf356d0244eeea7ef695188dd9.jpg";
import imgMaintenance from "../assets/maintainence.png";

export default function WhatWeSell() {
    const items = [
        {
            title: "Hairs",
            img: imgHairs,
        },
        {
            title: "Hair\nMaintenance kit",
            img: imgMaintenance,
        }
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
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    return (
        <section className="max-w-[1400px] mx-auto px-6 pt-[23px] pb-24 text-center">
            <motion.h2
                className="font-['Cambay'] font-bold text-[3rem] text-[#5E4431] mb-16"
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                What we sell
            </motion.h2>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-[50px] w-fit mx-auto"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
            >
                {items.map((item, idx) => (
                    <motion.div key={idx} className="relative group w-fit mx-auto" variants={cardVariants}>
                        {/* Card Container */}
                        <div className="relative w-[222px] h-[289px] rounded-[20px] overflow-hidden shadow-xl transition-transform duration-300 group-hover:-translate-y-2">
                            {/* Background Image */}
                            <img
                                src={item.img}
                                alt={item.title}
                                className="w-full h-full object-cover object-left-top"
                            />

                            {/* Gradient Overlay for Text Readability */}
                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>

                            {/* Title Overlay */}
                            <div className="absolute bottom-12 inset-x-0 pb-4">
                                <h3 className="text-white font-['Comfortaa'] text-xl font-bold whitespace-pre-line leading-tight drop-shadow-md">
                                    {item.title}
                                </h3>
                            </div>
                        </div>

                        {/* Floating Shop Now Button */}
                        <motion.div
                            className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-10 w-4/5 max-w-[180px]"
                            whileHover={{ scale: 1.05 }}
                            animate={{ y: [0, -4, 0] }}
                            transition={{
                                y: {
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: idx * 0.2 // Stagger the bounce
                                }
                            }}
                        >
                            <div className="bg-white p-2 rounded-full shadow-lg">
                                <Link to="/shop" className="block w-full bg-gradient-to-br from-[#753803] to-[#E08D5A] text-white py-3 rounded-full font-['Comfortaa'] font-medium text-sm transition-colors duration-300 shadow-inner">
                                    Shop Now
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
