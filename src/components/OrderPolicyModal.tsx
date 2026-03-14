
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface OrderPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function OrderPolicyModal({ isOpen, onClose }: OrderPolicyModalProps) {
    const policies = [
        "PLEASE TAKE TIME TO READ AS PROCEEDING TO MAKE PAYMENT MEANS YOU AGREE TO OUR TERMS",
        "ORDERS PAYED FOR CANNOT BE CANCELLED PLS BE SURE YOU REALLY WANT TO A PARTICULAR HAIR BEFORE MAKING PAYMENT",
        "PROCESSING TIME FOR ORDERS IS 2 TO 3 WORKING DAYS AND 6 TO 7 WORKING DAYS FOR CUSTOMIZED ORDERS",
        "WE ACCEPT EXCHANGE IF UNIT IS IN GOOD CONDITION AND RETURNED WITHIN 48HRS ( IF YOU STAY IN UK AND 7 WORKING DAYS (IF ITS INTERNATIONAL)",
        "COST OF EXCHANGE WILL BE INCURRED BY SENDER",
        "WE OPERATE A NO REFUND POLICY ON HAIRS THAT MATCH ALL DESCRIPTION ADVERTISED",
        "KINDLY NOTE THAT ALL RETURNED ORDERS MUST BE RETURNED EXACTLY HOW THE PRODUCT WAS SENT, DAMAGE FREE WITH CLOSURE AND FRONTAL LACES STILL INTACT. HAIR PURCHASED BY A WALK- IN IS FINAL",
        "WE ARE DEDICATED TO PROVIDING YOU WITH THE HIGHEST QUALITY SERVICE, ALWAYS GROUNDED IN TRUTH AND TRANSPARENCY."
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                    >
                        <motion.div
                            className="bg-white w-full max-w-lg rounded-3xl pb-4 overflow-hidden shadow-2xl pointer-events-auto flex flex-col h-max max-h-[95vh]"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <div className="relative pt-8 pb-4 text-center bg-white shrink-0">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-1.5 hover:bg-black/10 rounded-lg hover:text-black text-black transition"
                                >
                                    <X size={24} />
                                </button>
                                <h2 className="font-['Poppins'] font-extrabold text-3xl text-[#6A3E1D] uppercase tracking-wide">
                                    Order Policy
                                </h2>
                            </div>
                            <div className="px-8 pb-6 space-y-6 h-max overflow-y-auto">
                                {policies.map((policy, index) => (
                                    <p key={index} className="text-black text-md font-['Poppins'] font-semibold leading-tight py-2">
                                        {policy}
                                    </p>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
