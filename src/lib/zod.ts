import { z, object } from 'zod';

export const signinSchema = object({
	mobileNumber: z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
	otp: z.string().optional()
});

export const dashboardSchema = object({
	start: z.string()
})