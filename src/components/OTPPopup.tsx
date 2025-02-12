"use client";

import { useEffect, useState, useRef } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from './ui/button';

import { toast } from "sonner";
import Spinner from './Spinner';
import { handleCredentialsSignin } from '@/app/actions/authActions';
import { getSession } from 'next-auth/react';
import { UserData, useUserStore } from '@/store/store';
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation';
import { signIn } from '@/app/auth';

interface OTPPopupProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    setIsValidatingNumberScreen: (isValidating: boolean) => void;
    formData: string;
    resendTimer: number;
    setResendTimer: (resendTimer: number) => void;
    sendOTP: () => Promise<void>;
}

const OTPPopup: React.FC<OTPPopupProps> = ({ sendOTP, setResendTimer, isOpen, setIsOpen, setIsValidatingNumberScreen, formData, resendTimer }) => {
    const router = useRouter();
    const [resendAttempts, setResendAttempts] = useState(0);
    const [otp, setOtp] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const initialOTPSent = useRef(false);

    const userDataStore = useUserStore((store) => store);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    useEffect(() => {
        initialOTPSent.current = true;
    }, [isOpen, formData]);

    useEffect(() => {
        if (otp.length === 6) {
            handleOTPSubmit();
        }
    }, [otp]);

    const handleResendOTP = async () => {
        if (resendAttempts < 3) {
            setResendAttempts(resendAttempts + 1);
            setResendTimer(30);
            await sendOTP();
        } else {
            toast.error('Maximum resend attempts reached.');
        }
    };
    const handleOTPSubmit = async () => {
        setIsValidating(true)
        try {
            const response = await fetch('/api/otp/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mobileNumber: formData, otp }),
            });

            const result = await response.json();
            console.log(result);
            if (response.ok) {
                toast.success(result.message || 'OTP sent successfully!');
                const user: UserData = {
                    id: result?.data?.data?.userId,
                    name: result?.data?.data?.name,
                    userId: result?.data?.data?.userId,
                    accessToken: result?.data?.data?.accessToken,
                    refreshToken: result?.data?.data?.refreshToken,
                    discomId: result?.data?.data?.discomId,
                    roleId: result?.data?.data?.roleId,
                    userRole: "UNKNOWN",
                    userScopes: [],
                };

                Cookies.set('accessToken', result?.data?.data?.accessToken, {
                    expires: Infinity,
                })

                try {
                    const userRoleResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL_V2}/v1/user-role-scopes/${user.roleId}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${user.accessToken}`,
                            "Content-Type": "application/json"
                        }
                    });

                    if (userRoleResponse.ok) {
                        const roleData = await userRoleResponse.json();
                        console.log("User Role Response:", roleData);
                        user.userRole = roleData?.data?.user_role?.role_name || "UNKNOWN";
                        user.userScopes = roleData?.data?.user_scopes?.map((scope: { action: string }) => scope.action) || [];
                    } else {
                        console.error("Failed to fetch user role", userRoleResponse.statusText);
                    }

                } catch (error) {
                    console.error("Error fetching user role", error);
                }
                Cookies.set('userRole', user?.userRole, {
                    expires: Infinity,
                })
                useUserStore.getState().setUserData(user);
                await signIn("credentials", {
                    userData: JSON.stringify(user),
                    redirect: false,
                });
                router.push('/dashboard')
                console.log("User Data:", user);
            } else {
                toast.error(result.message || 'Failed to send OTP.');

            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            toast.error('Error sending OTP.');

        }
        setIsValidating(false);
    };

    const handleChange = (value: string) => {
        setOtp(value);
    };

    return (
        <div className='absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center shadow-sm bg-gray-100'>
            <div className="mb-3 text-center">
                <h3 className='fw-bold'>OTP Verification</h3>
                <span className='block text-gray-400 font-thin text-sm'>
                    Please check your mobile for OTP
                </span>
            </div>
            <div className="mb-3">
                <InputOTP maxLength={6} onChange={handleChange} disabled={isValidating}>
                    <InputOTPGroup className='mx-auto gap-2'>
                        {[...Array(6)].map((_, index) => (
                            <InputOTPSlot key={index} index={index} className='bg-white ' />
                        ))}
                    </InputOTPGroup>
                </InputOTP>
            </div>

            {isValidating && (
                <div className="flex justify-center">
                    <Spinner />
                </div>
            )}

            <Button
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || resendAttempts >= 3 || isValidating}
                className={`p-2 px-4 border border-transparent rounded-md shadow-sm text-white ${resendTimer > 0 || isValidating ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-400 hover:bg-orange-500'
                    }`}
            >
                {resendTimer > 0 ? `Request OTP in ${resendTimer}s` : 'Request OTP'}
            </Button>
        </div>
    );
};

export default OTPPopup;