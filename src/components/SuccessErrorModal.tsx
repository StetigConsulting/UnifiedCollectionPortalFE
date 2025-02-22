'use client';

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
    type: 'success' | 'error';
}

const SuccessErrorModal: React.FC<ModalProps> = ({ isOpen, onClose, message, type }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="flex flex-col items-center justify-center p-6">
                {type === 'success' ? (
                    <CheckCircle2 className="h-14 w-14 text-green-500 mb-4" />
                ) : (
                    <AlertCircle className="h-14 w-14 text-red-500 mb-4" />
                )}
                <p className="text-lg font-medium text-gray-700">{message}</p>
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
                    <X className="h-5 w-5" />
                </button>
            </DialogContent>
        </Dialog>
    );
};

export default SuccessErrorModal;
