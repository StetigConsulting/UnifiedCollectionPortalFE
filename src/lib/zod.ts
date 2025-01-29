import { z, object } from "zod";
import { levelWIthId } from "./utils";

export const signinSchema = object({
  mobileNumber: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  otp: z.string().optional(),
});

export const dashboardSchema = object({
  fromDate: z
    .string()
    .nonempty({ message: "From date is required" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
  toDate: z
    .string()
    .nonempty({ message: "To date is required" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
});

export const addAgencySchema = z
  .object({
    agencyName: z.string().nonempty("Agency Name is required"),
    vendorId: z.string().optional(),
    registeredAddress: z.string().nonempty("Registered Address is required"),
    woNumber: z.string().optional(),
    email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("").optional()),
    contactPerson: z.string().nonempty("Contact Person is required"),
    phoneNumber: z
      .string()
      .regex(/^\d+$/, "Phone Number must contain only digits")
      .length(10, "Phone Number must be exactly 10 digits")
      .nonempty("Phone Number is required"),
    maximumLimit: z
      .string()
      .nonempty("Maximum Limit is required")
      .transform((val) => parseFloat(val))
      .refine(
        (val) => !isNaN(val) && val >= 0,
        "Maximum Limit must be a positive number or zero"
      )
      .optional(),
    maximumAgent: z
      .string()
      .nonempty("Maximum Agent is required")
      .transform((val) => parseFloat(val))
      .refine(
        (val) => !isNaN(val) && val >= 0,
        "Maximum Agent must be a positive number or zero"
      )
      .optional(),
    validityFromDate: z.string().nonempty("Validity From Date is required"),
    validityToDate: z.string().nonempty("Validity To Date is required"),
    paymentDate: z.string().optional(),
    transactionId: z.string().optional(),
    initialBalance: z.number({
      required_error: "Initial Balance is required",
      invalid_type_error: "Initial Balance must",
    }),
    paymentMode: z.string().optional(),
    paymentRemark: z.string().optional(),
    workingLevel: z.string().nonempty("Working Level is required"),
    circle: z.array(z.number()).optional(),
    division: z.array(z.number()).optional(),
    subDivision: z.array(z.number()).optional(),
    section: z.array(z.number()).optional(),
    permission: z
      .array(z.number())
      .refine(
        (permissions) => permissions.length > 0,
        "At least one Permission is required"
      ),
    collectionType: z
      .array(z.string())
      .refine(
        (collectionType) => collectionType.length > 0,
        "At least one Collection Type is required"
      ),
    nonEnergy: z.array(z.number()).optional().default([]),
  })
  .superRefine((data, ctx) => {
    if (
      data.collectionType &&
      data.collectionType.includes("Non-Energy") &&
      data.nonEnergy &&
      data.nonEnergy.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one Non-energy type is required",
        path: ["nonEnergy"],
      });
    }
    if (data.workingLevel && data.workingLevel === levelWIthId.SECTION) {
      if (data.section.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one Section type is required",
          path: ["section"],
        });
      }
      if (data.subDivision.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sub division is required",
          path: ["subDivision"],
        });
      }
      if (data.division.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Division is required",
          path: ["division"],
        });
      }
      if (data.circle.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
          path: ["circle"],
        });
      }
    }
    if (data.workingLevel && data.workingLevel === levelWIthId.SUB_DIVISION) {
      if (data.subDivision.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Atleast one sub division is required",
          path: ["subDivision"],
        });
      }
      if (data.division.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Division is required",
          path: ["division"],
        });
      }
      if (data.circle.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
          path: ["circle"],
        });
      }
    }
    if (data.workingLevel && data.workingLevel === levelWIthId.DIVISION) {
      if (data.division.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Atleast one division is required",
          path: ["division"],
        });
      }
      if (data.circle.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
          path: ["circle"],
        });
      }
    }
    if (data.workingLevel && data.workingLevel === levelWIthId.CIRCLE) {
      if (data.circle.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Atleast one circle is required",
          path: ["circle"],
        });
      }
    }
  });

export const rechargeSchema = z.object({
  agency: z.string().nonempty("Agency is required"),
  agencyName: z.string().optional(),
  agencyId: z.number().optional(),
  phoneNumber: z.string().optional(),
  transactionType: z.string().optional(),
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be greater than 0"),
  currentBalance: z.number().optional(),
  remark: z
    .string()
    .max(255, "Remark must be less than 255 characters")
    .optional(),
});

export const editAgencySchema = z.object({
  agency: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = Number(val);
      if (isNaN(num)) {
        throw new Error("Agency must be a valid number");
      }
      return num;
    })
    .refine((val) => val > 0, {
      message: "Agency is required and must be greater than 0",
    }),
  agencyName: z.string().nonempty("Agency name is required"),
  agencyId: z.number({
    required_error: "Agency ID is required",
    invalid_type_error: "Agency ID must be a number",
  }),
  maximumAmount: z
    .number({
      required_error: "Maximum amount is required",
      invalid_type_error: "Maximum amount must be a number",
    })
    .positive("Maximum amount must be a positive number"),
  maximumAgent: z
    .number({
      required_error: "Maximum agent is required",
      invalid_type_error: "Maximum agent must be a number",
    })
    .positive("Maximum agent must be a positive number"),
  address: z.string().nonempty("Address is required"),
  woNumber: z.string().optional(),
  contactPerson: z.string().nonempty("Contact person is required"),
  phoneNumber: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
});

export const extendValiditySchema = z.object({
  // circle: z.string().nonempty("Circle type is required"),
  // division: z.string().nonempty("Division is required"),
  agencyName: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = Number(val);
      if (isNaN(num)) {
        throw new Error("Agency must be a valid number");
      }
      return num;
    })
    .refine((val) => val > 0, {
      message: "Agency is required and must be greater than 0",
    }),
  agencyId: z.number({
    required_error: "Agency Id is required",
    invalid_type_error: "Agency Id must be a number",
  }),
  currentFromValidity: z.string().nonempty("Current from validity is required"),
  currentToValidity: z.string().nonempty("Current to validity is required"),
  newFromValidity: z
    .string()
    .nonempty("New From Validity date is required")
    .refine((value) => !isNaN(Date.parse(value)), {
      message: "Validity date must be a valid date",
    }),
  newToValidity: z
    .string()
    .nonempty("New To Validity date is required")
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
  reason: z
    .string()
    .nonempty("Reason is required")
    .max(200, "Reason must be less than 200 characters"),
});

export const changeCollectorRoleSchema = z.object({
  collectorMobileNumber: z
    .string()
    .min(10, "Mobile number must be at least 10 digits"),
  collectorName: z.string().nonempty("Collector name is required"),
  currentType: z.string().nonempty("Current type is required"),
  division: z.string().nonempty("Division is required"),
  collectionType: z.string().nonempty("Collection type is required"),
  nonEnergy: z.string().optional(),
  allowRecovery: z.enum(["Yes", "No"]),
  energy: z.boolean().optional(),
  nonEnergyCheckbox: z.boolean().optional(),
});

export const changeSectionSchema = z.object({
  collectorMobileNumber: z
    .string()
    .min(10, { message: "Mobile number must be at least 10 digits" })
    .max(10, { message: "Mobile number cannot exceed 10 digits" }),
  collectorName: z.string().min(1, { message: "Collector name is required" }),
  currentType: z.string().min(1, { message: "Current type is required" }),
  division: z.string().min(1, { message: "Division is required" }),
  subDivision: z.string().min(1, { message: "Sub Division is required" }),
  section: z.string().min(1, { message: "Section is required" }),
});

export const newsNoticeSchema = z.object({
  category: z.string().min(1, { message: "Category is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
});

export const departmentUserSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/, { message: "Phone number must be 10 digits" }),
  email: z.string().email({ message: "Invalid email address" }),
});

export const createNewLevelSchema = z.object({
  levelName: z.string().nonempty({ message: "Level name is required" }),
  levelType: z.string().nonempty({ message: "Level type is required" }),
});

export const fileUploadSchema = z.object({
  file: z.any(),
  // z
  //   .instanceof(File)
  //   .refine((file) => file.type === "text/csv", {
  //     message: "Only CSV files are allowed",
  //   })
  //   .refine((file) => file.size <= 5 * 1024 * 1024, {
  //     message: "File size must be under 5MB",
  //   }),
});

export const addCollectorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().min(1, "Phone Number is required"),
  validity: z.string().min(1, "Select Validity Date"),
  maximumLimit: z
    .number()
    .min(0, "Maximum Limit must be greater than or equal to 0"),
  initialBalance: z
    .number()
    .min(0, "Initial Balance must be greater than or equal to 0"),
  binder: z.string().min(1, "Binder is required"),
  subDivision: z.string().min(1, "Select Sub Division"),
  section: z.number().min(0, "Section is required"),
  permission: z.array(z.string()).min(1, "At least one permission is required"),
  collectionType: z
    .array(z.string())
    .min(1, "At least one collection type is required"),
  nonEnergy: z.array(z.string()).optional(),
});

export type AddCollectorFormData = z.infer<typeof addCollectorSchema>;

export const addCounterCollectorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phoneNumber: z.string().min(1, 'Phone Number is required').regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  maximumLimit: z.number().min(1, 'Maximum Limit should be a positive number'),
  initialBalance: z.number().min(0, 'Initial Balance cannot be negative'),
  validity: z.string().min(1, 'Validity is required'),
  permission: z.array(z.string()).min(1, "At least one permission is required"),
  collectionType: z.array(z.string()).min(1, "At least one collection type is required"),
  nonEnergy: z.array(z.string()).optional(),
});

export type AddCounterCollectorFormData = z.infer<typeof addCounterCollectorSchema>;

export const binderMappingSchema = z.object({
  collectorMobile: z
    .string()
    .min(1, { message: 'Collector Mobile is required' })
    .regex(/^\d{10}$/, { message: 'Invalid mobile number' }),

  agentId: z
    .string()
    .min(1, { message: 'Agent ID is required' }),

  agentMobileNumber: z
    .string()
    .min(1, { message: 'Agent Mobile Number is required' })
    .regex(/^\d{10}$/, { message: 'Invalid agent mobile number' }),

  agencyName: z
    .string()
    .min(1, { message: 'Agency Name is required' }),

  division: z
    .string()
    .min(1, { message: 'Division is required' }),

  binder: z
    .array(z.string())
    .min(1, { message: 'At least one binder must be selected' }),

  allocatedBinder: z
    .array(z.string())
    .optional(),
});

export type BinderMappingFormData = z.infer<typeof binderMappingSchema>;


export const rechargeSchemaCollector = z.object({
  collectorMobile: z.string().min(1, "Collector Mobile is required"),
  agencyId: z.string().min(1, "Agency ID is required"),
  agencyName: z.string().min(1, "Agency Name is required"),
  phoneNumber: z.string().min(10, "Phone Number should be 10 digits"),
  amount: z.number().positive("Amount must be greater than 0"),
  transactionType: z.enum(["Recharge", "Refund"]),
  currentBalance: z.number().positive("Current Balance must be greater than 0"),
  remark: z.string().optional(),
});

export type RechargeCollectorFormData = z.infer<typeof rechargeSchemaCollector>;

export const extendValiditySchemaCollector = z.object({
  collectorName: z.string().min(1, "Collector Name is required"),
  collectorId: z.string().min(1, "Collector ID is required"),
  currentValidity: z.string().min(1, "Current Validity is required"),
  validityDate: z
    .string()
    .min(1, "Validity Date is required")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
});

export type ExtendValidityCollectorFormData = z.infer<typeof extendValiditySchemaCollector>;

export const resetCollectorBalanceSchema = z.object({
  collectorMobile: z.string().min(1, "Collector mobile is required"),
  agencyName: z.string().min(1, "Agency name is required"),
  agencyId: z.string().min(1, "Agency ID is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  transactionType: z.string().min(1, "Transaction type is required").default("Reset"),
  currentBalance: z.number().min(0, "Current balance must be a positive number"),
  remark: z.string().optional(),
});

export type ResetCollectorFormData = z.infer<typeof resetCollectorBalanceSchema>;

export const paymentModeSchema = z.object({
  selectedPaymentModes: z.array(z.enum(['Cash', 'Cheque', 'DD', 'Activate'])).min(1, {
    message: 'At least one payment mode must be selected.',
  }),
});