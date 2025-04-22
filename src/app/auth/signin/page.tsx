'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCcw } from 'lucide-react';
import { signinSchema } from '@/lib/zod';
import OTPPopup from '@/components/OTPPopup';
import Image from 'next/image';
import { generateCaptcha } from '@/lib/utils';
import { toast } from 'sonner';

type SigninSchema = z.infer<typeof signinSchema>;

const SignUpForm = () => {
	const [isOTPPopup, setIsOTPPopup] = useState(false);
	const [isValidating, setIsValidating] = useState(false);
	const [mobileNumber, setMobileNumber] = useState('');
	const [captcha, setCaptcha] = useState('');
	const [enteredCaptcha, setEnteredCaptcha] = useState('');
	const [status, setStatus] = useState('')
	const [disabled, setDisabled] = useState(true)

	useEffect(() => {
		generateNewCaptcha()
	}, [])

	const generateNewCaptcha = () => {
		let generatedCaptcha = generateCaptcha()

		setCaptcha(generatedCaptcha);
		setEnteredCaptcha('');
		setStatus('');
	}

	const handleCaptchaChange = (e: any) => {
		setEnteredCaptcha(e.target.value)
		setStatus('')
		setDisabled(true)
		if (e.target.value.length == 6 && e.target.value == captcha) {
			setStatus('success');
			setDisabled(false)
		} else {
			setStatus('failure');
		}
	}

	const [resendTimer, setResendTimer] = useState(0);

	const { register, handleSubmit, watch, formState: { errors }, getValues } = useForm<SigninSchema>({
		resolver: zodResolver(signinSchema),
	});
	const formData = watch()

	const onSubmit = async (data: SigninSchema) => {
		setIsValidating(true);
		await sendOTP()
	};

	const sendOTP = async () => {
		try {
			const response = await fetch('/api/otp/generate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ mobileNumber: formData.mobileNumber }),
			});

			const result = await response.json();
			if (response.ok) {
				toast.success(result.message || 'OTP sent successfully!');
				setResendTimer(120);
				setIsOTPPopup(true);
			} else {
				toast.error(result.message || 'Failed to send OTP.');
				setIsValidating(false);
				generateNewCaptcha()
			}
		} catch (error) {
			console.error('Error sending OTP:', error);
			toast.error('Error sending OTP.');
			setIsOTPPopup(false);
		}
	}

	return (
		<>
			<div className="grid grid-cols-2 gap-4 min-h-[100vh]">
				<div>
					<Image alt="" width={1000} height={1000} src="/images/power.jpg" className='w-full h-full object-cover' />
				</div>
				<div className="ps-16 p-4 flex flex-col justify-center min-h-[80vh]">

					<form onSubmit={handleSubmit(onSubmit)} className="w-[400px] max-w-md relative min-h-[250px] m-auto">
						{/* Mobile Number Field */}
						<img alt="" src="/images/logo.png" width={200} className='m-auto mb-4' />
						<h3 className="title mb-8">Login</h3>
						<div className="mb-4">
							<label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">Mobile Number</label>
							<input
								{...register('mobileNumber')}
								id="mobileNumber"
								type="text"
								className="mt-1 block w-full border border-gray-300 p-2 rounded-md"
								onChange={(e) => setMobileNumber(e.target.value)} // Update the state directly
							/>
							{errors.mobileNumber && <p className="text-red-500 text-sm">{errors.mobileNumber?.message?.toString()}</p>}
						</div>
						{/* Captcha Field */}
						<div className="mb-4">
							<label htmlFor="captcha" className="block text-sm font-medium text-gray-700">Captcha</label>
							<div className="flex items-center space-x-2">
								<div className="flex space-x-2 w-1/2 flex-1">
									<p className="text-lg font-semibold text-gray-700 whitespace-nowrap select-none pointer-events-none"
									>{captcha}</p>
									<RefreshCcw className='cursor-pointer' onClick={generateNewCaptcha} />
								</div>
								<input
									id="captcha"
									type="text"
									className="mt-1 block w-full border border-gray-300 p-2 rounded-md w-1/2"
									value={enteredCaptcha}
									onChange={(e) => handleCaptchaChange(e)}
									onPaste={(e) => e.preventDefault()}
									placeholder="Enter the Captcha"
								/>
							</div>
							{/* Captcha validation feedback */}
							{status === 'failure' && (
								<p className="text-red-500 text-sm">Incorrect Captcha</p>
							)}
							{status === 'success' && (
								<p className="text-green-500 text-sm">Captcha Verified </p>
							)}
						</div>

						{/* Submit Button */}
						<Button disabled={isValidating || disabled} type="submit" className="w-full">
							{isValidating ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Please wait
								</>
							) : 'Login'}
						</Button>
						{isOTPPopup && <OTPPopup
							sendOTP={sendOTP}
							resendTimer={resendTimer}
							setResendTimer={setResendTimer}
							isOpen={isOTPPopup}
							setIsValidatingNumberScreen={setIsValidating}
							setIsOpen={setIsOTPPopup}
							formData={getValues('mobileNumber') || ''}
						/>}

					</form>
				</div>
			</div>
		</>
	);
};

export default SignUpForm;