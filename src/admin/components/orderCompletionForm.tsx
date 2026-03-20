import React, { useRef, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Upload, X, CheckCircle2, Loader2 } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

interface OrderCompletionFormProps {
    orderId: string;
    onCancel: () => void;
    onSuccess: () => void;
}

export const OrderCompletionForm: React.FC<OrderCompletionFormProps> = ({
    orderId,
    onCancel,
    onSuccess,
}) => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingUrl, setTrackingUrl] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const markOrderComplete = useMutation(api.orders.markOrderComplete);
    const generateUploadUrl = useMutation(api.orders.generateDispatchImageUploadUrl);

    const addFiles = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        const newPreviews = newFiles.map(f => URL.createObjectURL(f));
        setImages(prev => [...prev, ...newFiles]);
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index: number) => {
        URL.revokeObjectURL(previews[index]);
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const handleSubmit = async () => {
        if (!trackingNumber.trim() || !trackingUrl.trim()) return;
        setIsSubmitting(true);

        try {
            // Upload each image to Convex storage and collect storage IDs
            const dispatchImageIds: string[] = [];
            for (const file of images) {
                const uploadUrl = await generateUploadUrl();
                const result = await fetch(uploadUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': file.type },
                    body: file,
                });
                const { storageId } = await result.json();
                dispatchImageIds.push(storageId);
            }

            await markOrderComplete({
                orderId: orderId as Id<'orders'>,
                trackingNumber: trackingNumber.trim(),
                trackingUrl: trackingUrl.trim(),
                dispatchImageIds,
            });

            setSubmitted(true);
            setTimeout(onSuccess, 1800);
        } catch (err) {
            console.error('Failed to mark order complete:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValid = trackingNumber.trim() && trackingUrl.trim();

    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 24 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const, staggerChildren: 0.07 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center justify-center py-4 gap-3 text-center"
            >
                <CheckCircle2 size={52} className="text-green-500" />
                <h3 className="text-lg font-bold text-text-primary">Order Marked as Complete</h3>
                <p className="text-sm text-text-secondary">
                    A dispatch email has been sent to the customer.
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5 pt-2"
        >
            {/* Divider with label */}
            <motion.div variants={itemVariants} className="flex items-center gap-3">
                <div className="flex-1 h-px bg-text-primary/10" />
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
                    Completion Details
                </span>
                <div className="flex-1 h-px bg-text-primary/10" />
            </motion.div>

            {/* Tracking Number */}
            <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">
                    Tracking Number <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    placeholder="e.g. JD014600003767"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-text-primary/5 border border-text-primary/10 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none transition-all"
                />
            </motion.div>

            {/* Tracking URL */}
            <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">
                    Tracking Site <span className="text-red-400">*</span>
                </label>
                <input
                    type="url"
                    value={trackingUrl}
                    onChange={e => setTrackingUrl(e.target.value)}
                    placeholder="e.g. https://www.royalmail.com/track-your-item"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-text-primary/5 border border-text-primary/10 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none transition-all"
                />
            </motion.div>

            {/* Image Upload */}
            <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-sm font-medium text-text-primary">
                    Proof of Dispatch <span className="text-text-secondary/50 font-normal">(optional)</span>
                </label>

                {/* Drop Zone */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all
                        ${isDragging
                            ? 'border-green-500 bg-green-500/5 scale-[1.01]'
                            : 'border-text-primary/15 bg-text-primary/5 hover:border-text-primary/25 hover:bg-text-primary/8'
                        }`}
                >
                    <Upload size={22} className={`transition-colors ${isDragging ? 'text-green-500' : 'text-text-secondary'}`} />
                    <p className="text-sm text-text-secondary text-center">
                        <span className="font-medium text-text-primary">Click to upload</span> or drag & drop
                    </p>
                    <p className="text-xs text-text-secondary/60">PNG, JPG, WEBP</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={e => addFiles(e.target.files)}
                    />
                </div>

                {/* Image Previews */}
                {previews.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-4 gap-2 pt-1"
                    >
                        {previews.map((src, i) => (
                            <motion.div
                                key={src}
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="relative group aspect-square rounded-lg overflow-hidden border border-text-primary/10"
                            >
                                <img src={src} alt={`upload-${i}`} className="w-full h-full object-cover" />
                                <button
                                    onClick={e => { e.stopPropagation(); removeImage(i); }}
                                    className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} className="text-white" />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </motion.div>

            {/* Actions */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 pt-1">
                <button
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary
                               bg-text-primary/5 hover:bg-text-primary/10 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!isValid || isSubmitting}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                        ${isValid && !isSubmitting
                            ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/20 hover:shadow-green-500/30'
                            : 'bg-text-primary/10 text-text-secondary cursor-not-allowed'
                        }`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={15} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            Confirm & Complete
                        </>
                    )}
                </button>
            </motion.div>
        </motion.div>
    );
};