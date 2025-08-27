'use client';

import React, { useState } from 'react';
import AuthUserReusableCode from '@/components/AuthUserReusableCode';
import { Button } from '@/components/ui/button';
import CustomizedInputWithLabel from '@/components/CustomizedInputWithLabel';
import { decryptParamsForMMI, encryptParamsForMMI } from '@/lib/utils';
import { toast } from 'sonner';
import { Lock, Unlock, Copy } from 'lucide-react';

const DecryptParamsPage = () => {
    const [encryptToDecrypt, setEncryptToDecrypt] = useState('');
    const [dataToEncrypt, setDataToEncrypt] = useState('');
    const [encryptedResult, setEncryptedResult] = useState('');
    const [decryptedResult, setDecryptedResult] = useState('');

    const handleDecrypt = () => {
        try {
            if (!encryptToDecrypt.trim()) {
                toast.error('Please enter an encrypted parameter');
                return;
            }
            
            const decrypted = decryptParamsForMMI(encryptToDecrypt);
            setDecryptedResult(decrypted);
            toast.success('Parameter decrypted successfully!');
        } catch (err) {
            toast.error('Failed to decrypt parameter');
            console.error('Decryption error:', err);
        }
    };

    const handleEncrypt = () => {
        try {
            if (!dataToEncrypt.trim()) {
                toast.error('Please enter some data to encrypt');
                return;
            }
            
            const encrypted = encryptParamsForMMI(dataToEncrypt);
            setEncryptedResult(encrypted);
            toast.success('Data encrypted successfully!');
        } catch (err) {
            toast.error('Failed to encrypt data');
            console.error('Encryption error:', err);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Copied to clipboard!');
        } catch (err) {
            toast.error('Failed to copy to clipboard');
        }
    };

    return (
        <AuthUserReusableCode pageTitle="Parameter Encryption/Decryption">
            <div className="p-4 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    {/* Decrypt Section */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Encrypted Data to Decrypt</label>
                            <textarea
                                className="border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm w-full focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 transition-all ease-in-out resize-vertical min-h-[80px] break-words bg-white"
                                placeholder="Enter encrypted parameter here..."
                                value={encryptToDecrypt}
                                onChange={(e) => setEncryptToDecrypt(e.target.value)}
                            />
                        </div>
                        
                        <Button onClick={handleDecrypt} variant="default" className="w-full">
                            <Unlock className="h-4 w-4 mr-2" />
                            Decrypt
                        </Button>

                        {decryptedResult && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Decrypted Result:</label>
                                <div className="p-3 bg-green-50 border border-green-200 rounded-md overflow-hidden">
                                    <pre className="text-sm whitespace-pre-wrap break-all overflow-auto max-h-40">{decryptedResult}</pre>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(decryptedResult)}
                                    className="w-full"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Result
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Encrypt Section */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data to Encrypt</label>
                            <textarea
                                className="border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm w-full focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 transition-all ease-in-out resize-vertical min-h-[80px] break-words bg-white"
                                placeholder="Enter data you want to encrypt..."
                                value={dataToEncrypt}
                                onChange={(e) => setDataToEncrypt(e.target.value)}
                            />
                        </div>
                        
                        <Button onClick={handleEncrypt} variant="default" className="w-full">
                            <Lock className="h-4 w-4 mr-2" />
                            Encrypt
                        </Button>

                        {encryptedResult && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Encrypted Result:</label>
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md overflow-hidden">
                                    <div className="font-mono text-sm break-all overflow-auto max-h-40">{encryptedResult}</div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(encryptedResult)}
                                    className="w-full"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Result
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthUserReusableCode>
    );
};

export default DecryptParamsPage;