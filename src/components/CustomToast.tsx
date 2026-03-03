import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Check, ShoppingBag, X } from "lucide-react";

interface ToastProps {
    message: string;
    image?: string;
    onClose: () => void;
}

const Toast = ({ message, image, onClose }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-8 right-8 z-[9999] flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] pr-12 min-w-[320px]"
            role="alert"
        >
            <div className="relative">
                {/* Glowing bag icon container */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6A3E1D] to-[#FF4D80] flex items-center justify-center shadow-lg shadow-[#6A3E1D]/30">
                    <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                {/* Success check badge */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
            </div>

            <div className="flex flex-col">
                <h4 className="font-['Comfortaa'] font-bold text-gray-800 text-sm">Added to Bag!</h4>
                <p className="text-xs text-gray-500 font-['Manrope'] truncate max-w-[180px]">{message}</p>
            </div>

            {image && (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 ml-auto">
                    <img src={image} alt="Product" className="w-full h-full object-cover" />
                </div>
            )}

            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-black/5 transition"
            >
                <X size={14} />
            </button>
        </motion.div>
    );
};

// Singleton toast manager
let toastRoot: any = null;
let container: HTMLDivElement | null = null;

export const showToast = (message: string, image?: string) => {
    if (!container) {
        container = document.createElement("div");
        document.body.appendChild(container);
        toastRoot = createRoot(container);
    }

    const render = (visible: boolean) => {
        toastRoot.render(
            <AnimatePresence>
                {visible && (
                    <Toast
                        message={message}
                        image={image}
                        onClose={() => render(false)}
                    />
                )}
            </AnimatePresence>
        );
    };

    render(true);
};