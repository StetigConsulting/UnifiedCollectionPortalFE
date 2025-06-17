'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, CheckCircle2, AlertCircle, CircleX } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
    type: 'success' | 'error' | any;
    errorTable?: any;
}

const SuccessErrorModal: React.FC<ModalProps> = ({ isOpen, onClose, message, type, errorTable = null }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="flex flex-col items-center justify-center p-6 w-auto min-w-1/2 max-w-2/3">
                <DialogHeader>
                    <VisuallyHidden>
                        <DialogTitle>Title</DialogTitle>
                    </VisuallyHidden>
                </DialogHeader>
                {type === 'success' ? (
                    <CheckCircle2 className="h-14 w-14 text-green-500 mb-4" />
                ) : (
                    <CircleX className="h-14 w-14 text-red-500 mb-4" />
                )}
                <p className="text-lg font-medium text-gray-700">{message}</p>
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
                    <X className="h-5 w-5" />
                </button>

                {
                    errorTable && <div className='mt-4 w-full max-h-[300px] overflow-y-auto'>
                        {errorTable}
                    </div>
                }
            </DialogContent>
        </Dialog>
    );
};

export default SuccessErrorModal;
