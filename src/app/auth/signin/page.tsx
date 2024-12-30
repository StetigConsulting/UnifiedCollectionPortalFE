'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { signinSchema } from '@/lib/zod';
import OTPPopup from '@/components/OTPPopup';
import Image from 'next/image';

type SigninSchema = z.infer<typeof signinSchema>;

const SignUpForm = () => {
	const [isOTPPopup, setIsOTPPopup] = useState(false);
	const [isValidating, setIsValidating] = useState(false);
	const [mobileNumber, setMobileNumber] = useState('');

	const { register, handleSubmit, formState: { errors }, getValues } = useForm<SigninSchema>({
		resolver: zodResolver(signinSchema),
	});

	const onSubmit = async (data: SigninSchema) => {
		setIsValidating(true);
		setIsOTPPopup(true);
	};

	return (
		<>
			<div className="grid grid-cols-2 gap-4 min-h-[100vh]">
				<div>
					<Image alt="" width={1000} height={1000} src="/images/power.jpg" className='w-full h-full object-cover'/>
				</div>
				<div className="ps-16 p-4 flex flex-col justify-center min-h-[80vh]">
					<h3 className="title mb-8">Login</h3>
					<form onSubmit={handleSubmit(onSubmit)} className="w-[400px] max-w-md relative min-h-[250px]">
						{/* Mobile Number Field */}
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

						{/* Submit Button */}
						<Button disabled={isValidating} type="submit" className="w-full">
							{isValidating ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Please wait
								</>
							) : 'Login'}
						</Button>
						{isOTPPopup && <OTPPopup
							isOpen={isOTPPopup}
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