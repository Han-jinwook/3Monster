
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
    maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    className,
    maxWidth = "max-w-[460px]"
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        className={cn("relative w-full z-50 my-auto max-h-[90vh] flex flex-col", maxWidth)}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={cn("overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh]", className)}>
                            <div className="flex items-center justify-between border-b border-slate-150 px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50/90 shrink-0">
                                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate pr-2" title={title}>{title}</h2>
                                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 btn-ghost-premium shrink-0">
                                    <X className="h-4 w-4 text-slate-400" />
                                </Button>
                            </div>
                            <div className="p-3 sm:p-4 text-left bg-white overflow-y-auto flex-1 overscroll-contain">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
