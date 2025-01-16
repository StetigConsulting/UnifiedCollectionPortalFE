import { z, object } from 'zod';

export const signinSchema = object({
	mobileNumber: z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
	otp: z.string().optional()
});

export const dashboardSchema = object({
	fromDate: z.string().nonempty({ message: "From date is required" })
		.refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
	toDate: z.string().nonempty({ message: "To date is required" })
		.refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
})

export const addAgencySchema = z.object({
	userType: z.string().nonempty("User Type is required"),
	agencyName: z.string().nonempty("Agency Name is required"),
	vendorId: z.string().nonempty("Vendor ID is required"),
	registeredAddress: z.string().nonempty("Registered Address is required"),
	woNumber: z.string().optional(),
	email: z.string().email("Invalid email address").optional(),
	contactPerson: z.string().nonempty("Contact Person is required"),
	phoneNumber: z
		.string()
		.regex(/^[0-9]+$/, "Phone Number must contain only digits")
		.min(10, "Phone Number must be at least 10 digits")
		.optional(),
	maximumLimit: z
		.number()
		.positive("Maximum Limit must be a positive number")
		.optional(),
	maximumAgent: z
		.number()
		.positive("Maximum Agent must be a positive number")
		.optional(),
	validityDate: z.string().nonempty("Validity Date is required"),
	paymentDate: z.string().nonempty("Payment Date is required"),
	transactionId: z.string().nonempty("Transaction ID is required"),
	initialBalance: z
		.number()
		.positive("Initial Balance must be a positive number")
		.optional(),
	paymentMode: z.string().nonempty("Payment Mode is required"),
	paymentRemark: z.string().optional(),
	circle: z.string().nonempty("Circle is required"),
	division: z.string().nonempty("Division is required"),
	subDivision: z.string().optional(),
	permission: z.array(z.string()).nonempty("At least one Permission is required"),
	collectionType: z.string().nonempty("Collection Type is required"),
	nonEnergy: z.string().optional(),
});

export const rechargeSchema = z.object({
	agency: z.string().nonempty("Agency is required"),
	transactionType: z.string().optional(),
	amount: z
		.string()
		.nonempty("Amount is required")
		.refine((value) => !isNaN(parseFloat(value)) && parseFloat(value) > 0, {
			message: "Amount must be a positive number",
		}),
	currentBalance: z.string().optional(),
	remark: z.string().optional(),
});

export const editAgencySchema = z.object({
	circle: z.string().nonempty("Circle type is required"),
	division: z.string().nonempty("Division is required"),
	agencyName: z.string().nonempty("Agency name is required"),
	agencyId: z.string().nonempty("Agency ID is required"),
	newAgencyName: z.string().nonempty("New agency name is required"),
	maximumAmount: z
		.string()
		.nonempty("Maximum amount is required")
		.refine((value) => !isNaN(parseFloat(value)) && parseFloat(value) > 0, {
			message: "Maximum amount must be a positive number",
		}),
	maximumAgent: z
		.string()
		.nonempty("Maximum agent is required")
		.refine((value) => !isNaN(parseFloat(value)) && parseFloat(value) > 0, {
			message: "Maximum agent must be a positive number",
		}),
	address: z.string().nonempty("Address is required"),
	woNumber: z.string().optional(),
	contactPerson: z.string().nonempty("Contact person is required"),
	phoneNumber: z
		.string()
		.regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
});

export const extendValiditySchema = z.object({
	circle: z.string().nonempty("Circle type is required"),
	division: z.string().nonempty("Division is required"),
	agencyName: z.string().nonempty("Agency name is required"),
	agencyId: z.string().nonempty("Agency ID is required"),
	currentValidity: z.string().nonempty("Current validity is required"),
	validityDate: z
		.string()
		.nonempty("Validity date is required")
		.refine((value) => !isNaN(Date.parse(value)), {
			message: "Validity date must be a valid date",
		}),
});

export const resetDeviceSchema = z.object({
	mobileNumber: z
		.string()
		.nonempty("Mobile Number is required")
		.regex(/^\d{10}$/, "Mobile Number must be 10 digits"),
	collectorName: z.string().optional(),
	currentDevice: z.string().optional(),
	agencyName: z.string().optional(),
	collectorType: z.string().nonempty("Collector Type is required"),
	reason: z.string().nonempty("Reason is required").max(200, "Reason must be less than 200 characters"),
});

export const changeCollectorRoleSchema = z.object({
	collectorMobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
	collectorName: z.string().nonempty("Collector name is required"),
	currentType: z.string().nonempty("Current type is required"),
	division: z.string().nonempty("Division is required"),
	collectionType: z.string().nonempty("Collection type is required"),
	nonEnergy: z.string().optional(),
	allowRecovery: z.enum(["Yes", "No"]),
	energy: z.boolean().optional(),
	nonEnergyCheckbox: z.boolean().optional()
});

export const changeSectionSchema = z.object({
	collectorMobileNumber: z
		.string()
		.min(10, { message: 'Mobile number must be at least 10 digits' })
		.max(10, { message: 'Mobile number cannot exceed 10 digits' }),
	collectorName: z.string().min(1, { message: 'Collector name is required' }),
	currentType: z.string().min(1, { message: 'Current type is required' }),
	division: z.string().min(1, { message: 'Division is required' }),
	subDivision: z.string().min(1, { message: 'Sub Division is required' }),
	section: z.string().min(1, { message: 'Section is required' }),
});

export const newsNoticeSchema = z.object({
	category: z.string().min(1, { message: 'Category is required' }),
	title: z.string().min(1, { message: 'Title is required' }),
	description: z.string().min(1, { message: 'Description is required' }),
});

export const departmentUserSchema = z.object({
	name: z.string().nonempty({ message: 'Name is required' }),
	phoneNumber: z
		.string()
		.regex(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' }),
	email: z.string().email({ message: 'Invalid email address' }),
});

export const createNewLevelSchema = z.object({
	levelName: z.string().nonempty({ message: 'Level name is required' }),
	levelType: z.string().nonempty({ message: 'Level type is required' }),
});

export const fileUploadSchema = z.object({
	file: z
		.instanceof(File)
		.refine((file) => file.type === 'text/csv', { message: 'Only CSV files are allowed' })
		.refine((file) => file.size <= 5 * 1024 * 1024, { message: 'File size must be under 5MB' }),
});