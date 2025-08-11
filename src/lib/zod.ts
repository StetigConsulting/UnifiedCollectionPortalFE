import { z, object, optional } from "zod";
import { addIncentiveOnKeyValue, cancelTransactionTypePicklist } from "./utils";

export const signinSchema = object({
  mobileNumber: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  otp: z.string().optional(),
});

export const dashboardSchema = object({
  fromDate: z
    .string()
    .nonempty({ message: "Date is required" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
  comparisionFromDate: z
    .string()
    .nonempty({ message: "Date is required" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
  comparisionToDate: z
    .string()
    .nonempty({ message: "Date is required" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
  currentYear: z.string().optional(),
  currentMonth: z.string().optional(),
  previousYear: z.string().optional(),
  previousMonth: z.string().optional(),
});

export const addAgencySchema = z
  .object({
    agencyName: z.string().nonempty("Agency Name is required"),
    inheritVendorId: z.boolean().optional(),
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
    workingLevel: z.number({
      required_error: "Working Level is required",
      invalid_type_error: "Working Level must be a number",
    }),
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
    levelWithIdMap: z.any(),
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
    if (
      data.workingLevel &&
      data.workingLevel === data.levelWithIdMap.SECTION
    ) {
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
    if (
      data.workingLevel &&
      data.workingLevel === data.levelWithIdMap.SUB_DIVISION
    ) {
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
    if (
      data.workingLevel &&
      data.workingLevel === data.levelWithIdMap.DIVISION
    ) {
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
    if (data.workingLevel && data.workingLevel === data.levelWithIdMap.CIRCLE) {
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
  agency: z
    .union([z.string(), z.number()])
    .refine((val) => val !== "" && val !== null && val !== undefined, {
      message: "Agency is required",
    })
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), {
      message: "Agency must be a valid number",
    }),
  balanceAvailableForRecharge: z.any(),
  maxRecharge: z.any(),
  agencyName: z.string().optional(),
  agencyId: z.any().optional(),
  phoneNumber: z.string().optional(),
  transactionType: z.string().optional(),
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount is required",
    })
    .positive("Amount must be greater than 0"),
  currentBalance: z.any().optional(),
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
    .refine((val) => val !== null && val !== undefined, {
      message: "Agency is required",
    }),
  agencyName: z.string().nonempty("Agency name is required"),
  agencyId: z.number({
    required_error: "Agency ID is required",
    invalid_type_error: "Agency ID is required",
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
  vendorCode: z.string().optional(),
  collectionType: z
    .array(z.string())
    .refine(
      (collectionType) => collectionType.length > 0,
      "At least one Collection Type is required"
    ),
  nonEnergy: z.array(z.number()).optional().default([]),
  permission: z
    .array(z.number())
    .refine(
      (permission) => permission.length > 0,
      "At least one Permissions is required"
    ),
});

export const editAgencyAreaSchema = z
  .object({
    agency: z.string().min(1, { message: "Agency is required" }),
    agencyName: z.string().min(1, { message: "Agency Name is required" }),
    agencyId: z.number({
      required_error: "Agency ID is required",
      invalid_type_error: "Agency ID is required",
    }),
    workingLevel: z.number({
      required_error: "Working Level is required",
      invalid_type_error: "Working Level is required",
    }),
    circle: z.array(z.number()).optional(),
    division: z.array(z.number()).optional(),
    subDivision: z.array(z.number()).optional(),
    section: z.array(z.number()).optional(),
    levelsData: z.any(),
  })
  .superRefine((data, ctx) => {
    if (data.workingLevel && data.workingLevel === data?.levelsData?.SECTION) {
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
    if (
      data.workingLevel &&
      data.workingLevel === data?.levelsData?.SUB_DIVISION
    ) {
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
    if (data.workingLevel && data.workingLevel === data?.levelsData?.DIVISION) {
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
    if (data.workingLevel && data.workingLevel === data?.levelsData?.CIRCLE) {
      if (data.circle.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Atleast one circle is required",
          path: ["circle"],
        });
      }
    }
  });

export type EditAgencyAreaFormData = z.infer<typeof editAgencyAreaSchema>;

export const extendValiditySchema = z
  .object({
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
        message: "Agency is required",
      }),
    agencyId: z.number({
      required_error: "Agency Id is required",
      invalid_type_error: "Agency Id is required",
    }),
    currentFromValidity: z
      .string()
      .nonempty("Current from validity is required"),
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
    amendmentDocumentNumber: z
      .string()
      .nonempty("Amendment Document Number is required"),
    amendmentDocumentDate: z
      .string()
      .nonempty("Amendment Document Date is required")
      .refine((value) => !isNaN(Date.parse(value)), {
        message: "Amendment Document Date must be a valid date",
      }),
  })
  .superRefine((data, ctx) => {
    const currentFrom = new Date(data.currentFromValidity);
    const currentTo = new Date(data.currentToValidity);
    const newFrom = new Date(data.newFromValidity);
    const newTo = new Date(data.newToValidity);

    if (
      [currentFrom, currentTo, newFrom, newTo].some((d) => isNaN(d.getTime()))
    )
      return;

    if (newTo < newFrom) {
      ctx.addIssue({
        path: ["newToValidity"],
        message: "New To Validity cannot be earlier than New From Validity",
        code: z.ZodIssueCode.custom,
      });
    }

    if (newTo <= currentTo) {
      ctx.addIssue({
        path: ["newToValidity"],
        message: "New To Validity cannot be less than Current To Validity",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const extendValidityFilterSchema = z
  .object({
    fromDate: z.string().min(1, "From Date is required"),
    toDate: z.string().min(1, "To Date is required"),
    dateType: z.string().min(1, "Date Type is required"),
    agencyId: z.string().min(1, "Agency is required"),
    amendmentDocumentNo: z.string().optional(),
    pageSize: z
      .number({
        invalid_type_error: "Page size is required",
      })
      .min(1, "Page size is required"),
  })
  .superRefine((data, ctx) => {
    if (data.fromDate && data.toDate) {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      if (from > to) {
        ctx.addIssue({
          path: ["toDate"],
          code: z.ZodIssueCode.custom,
          message: "\'From Date\' should be before or the same as \'To Date\'",
        });
      }
    }
  });

export const resetDeviceSchema = z.object({
  agency: z.any().optional(),
  mobileNumber: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .optional(),
  collectorName: z.string().optional(),
  agencyName: z.string().optional(),
  collectorType: z.any().optional(),
});

export const changeCollectorRoleSchema = z.object({
  collectorMobileNumber: z.string(),
  // .min(10, "Mobile number must be at least 10 digits"),
  collectorName: z.string().nonempty("Collector name is required"),
  currentType: z.string().optional(),
  division: z.string().nonempty("Division is required"),
  collectionType: z
    .array(z.string())
    .refine(
      (collectionType) => collectionType.length > 0,
      "At least one Collection Type is required"
    ),
  nonEnergy: z.array(z.number()).optional().default([]),
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

export const editCollectorSchema = z.object({
  tempAgencyId: z.any().optional(),
  agencyId: z.number().optional(),
  agencyName: z.string().optional(),
  collectorMobile: z
    .string()
    .min(10, "Mobile number must be at least 10 digits"),
  name: z.string().min(1, "Name is required"),
  agentId: z.number(),
  phoneNumber: z.string().optional(),
  collectorType: z.number().min(1, { message: "Collector type is required" }),
  workingType: z.string().min(1, { message: "Working type is required" }),
  permission: z
    .array(z.number(), { message: "Permission must be an array of numbers" })
    .min(1, { message: "At least one permission is required" }),
  collectionType: z
    .array(z.string())
    .min(1, "At least one collection type is required"),
  nonEnergy: z.array(z.number()).optional(),
  maximumLimit: z.number().min(1, { message: "Maximum limit is required" }),
  supervisor: z.array(z.number()).optional(),
  aadhaarNumber: z
    .any()
    .optional()
    .refine((value) => !value || value.toString().length === 12, {
      message: "Aadhaar number must be exactly 12 digits",
    }),
  vendorId: z.any().optional(),
});

export type EditCollectorFormData = z.infer<typeof editCollectorSchema>;

export const addCounterCollectorSchema = z
  .object({
    agencyId: z.number({
      invalid_type_error: "Agency ID is required",
      required_error: "Agency ID is required",
    }).optional(),
    name: z.string().min(1, { message: "Name is required" }),
    isPersonalNumberSameAsOffice: z.boolean().optional(),
    officePhoneNumber: z
      .string()
      .min(1, { message: "Office phone number is required" })
      .regex(/^\d{10}$/, {
        message: "Office phone number must be exactly 10 digits",
      }),
    personalPhoneNumber: z
      .string()
      .optional()
      .refine((value) => !value || /^\d{10}$/.test(value), {
        message: "Personal phone number must be exactly 10 digits",
      }),
    collectorType: z.string().min(1, { message: "Collector type is required" }),
    collectorRole: z.string().min(1, { message: "Collector role is required" }),
    workingType: z.string().min(1, { message: "Working type is required" }),
    workingLevel: z.number(),

    maximumLimit: z
      .number({ invalid_type_error: "Maximum limit must be a number" })
      .min(1, { message: "Maximum limit must be at least 1" }),

    initialBalance: z
      .number({ invalid_type_error: "Initial balance must be a number" })
      .min(0, { message: "Initial balance cannot be negative" }),

    circle: z.array(z.number()).optional(),
    division: z.array(z.number()).optional(),
    subDivision: z.array(z.number()).optional(),
    section: z.array(z.number()).optional(),

    fromValidity: z
      .string()
      .min(1, { message: "From validity date is required" }),
    toValidity: z.string().min(1, { message: "To validity date is required" }),

    permission: z
      .array(z.number(), { message: "Permission must be an array of numbers" })
      .min(1, { message: "At least one permission is required" })
      .optional(),

    collectionType: z
      .array(z.string(), { message: "Collection type is required" })
      .min(1, { message: "At least one collection type is required" }),

    nonEnergy: z.array(z.number()).optional(),
    supervisor: z.array(z.number()).optional(),
    aadhaarNumber: z
      .any()
      .optional()
      .refine((value) => !value || value.toString().length === 12, {
        message: "Aadhaar number must be exactly 12 digits",
      }),
    vendorId: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.collectionType.includes("Non Energy") &&
      data?.nonEnergy?.length == 0
    ) {
      ctx.addIssue({
        path: [`nonEnergy`],
        message: "Non Energy is required",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export type AddCounterCollectorFormData = z.infer<
  typeof addCounterCollectorSchema
>;

export const binderMappingSchema = z.object({
  tempAgencyId: z.any().optional(),
  collectorMobile: z
    .string()
    .min(10, "Mobile number must be at least 10 digits"),
  agentId: z.number(),
  agentMobileNumber: z
    .string()
    .min(1, { message: "Agent Mobile Number is required" }),
  agencyName: z.string().min(1, { message: "Agency Name is required" }),

  division: z.number(),
  binder: z
    .array(z.number())
    .min(1, { message: "At least one binder must be selected" }),

  allocatedBinder: z.array(z.string()).optional(),
});

export type BinderMappingFormData = z.infer<typeof binderMappingSchema>;

export const rechargeSchemaCollector = z.object({
  tempAgencyId: z.any().optional(),
  collectorMobile: z.string().optional(),
  agencyId: z.number(),
  agencyName: z.string().min(1, "Agency Name is required"),
  agentId: z.number(),
  agentName: z.string().min(1, "Agent Name is required"),
  phoneNumber: z.string().min(10, "Phone Number should be 10 digits"),
  maximumRecharge: z
    .number()
    .positive("Maximum recharge must be greater than 0"),
  amount: z.number().positive("Amount must be greater than 0"),
  transactionType: z.string(),
  currentBalance: z.number(),
  remark: z.string().optional(),
});

export type RechargeCollectorFormData = z.infer<typeof rechargeSchemaCollector>;

export const extendValiditySchemaCollector = z.object({
  collectorName: z.string().min(1, "Collector Name is required"),
  collectorId: z.number(),
  currentValidityFrom: z.string().min(1, "Current Validity is required"),
  currentValidityTo: z.string().min(1, "Current Validity is required"),
  validityDateFrom: z
    .string()
    .min(1, "Validity Date is required")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
  validityDateTo: z
    .string()
    .min(1, "Validity Date is required")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
});

export type ExtendValidityCollectorFormData = z.infer<
  typeof extendValiditySchemaCollector
>;

export const resetCollectorBalanceSchema = z.object({
  collectorMobile: z.string().min(1, "Agent mobile is required"),
  agencyName: z.string().min(1, "Agency name is required"),
  agencyId: z.string().min(1, "Agency ID is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  transactionType: z
    .string()
    .min(1, "Transaction type is required")
    .default("Reset"),
  currentBalance: z
    .number()
    .min(0, "Current balance must be a positive number"),
  remark: z.string().optional(),
});

export type ResetCollectorFormData = z.infer<
  typeof resetCollectorBalanceSchema
>;

export const paymentModeSchema = z.object({
  selectedPaymentModes: z.array(z.number()).min(1, {
    message: "At least one payment mode must be selected.",
  }),
});

export const deniedToPaySchema = z.object({
  deniedReason: z
    .array(z.string())
    .min(1, { message: "Please select at least one denied reason" }),
  paidReason: z
    .array(z.string())
    .min(1, { message: "Please select at least one paid" }),
  maxCountPerDay: z
    .number({ invalid_type_error: "Max Count is required" })
    .min(1, { message: "Max count must be greater than or equal to 1" }),
});

export const nonEnergyTypeSchema = z.object({
  nonEnergyType: z
    .array(z.number())
    .min(1, "At least one option must be selected"),
});

export const addCollectorTypeSchema = z.object({
  collectorType: z
    .array(z.number())
    .min(1, "At least one collector type must be selected"),
});

export const colorCodingLogicSchema = z.object({
  colorCodings: z
    .array(
      z.object({
        value1Type: z.string().nonempty("Value 1 Type is required"),
        value1: z.union([
          z.string().nonempty("Value 1 is required"),
          z.number(),
        ]),
        value2Type: z.string().nonempty("Value 2 Type is required"),
        value2: z.union([
          z.string().nonempty("Value 2 is required"),
          z.number(),
        ]),
        colorCode: z
          .string()
          .nonempty("Color code is required")
          .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color code format"),
      })
    )
    .nonempty("At least one color coding rule is required"),
});

export const colorCodingBillBasisSchema = z.object({
  fonts: z.array(
    z.object({
      fontType: z.string().nonempty("Font type is required"),
      fontColor: z.string().nonempty("Font color is required"),
    })
  ),
});

export const colorCodingEclSchema = z.object({
  id: z.any().optional(),
  backgroundColor: z
    .string()
    .min(1, { message: "Please select a background color." })
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: "Invalid color format." }),
});

export const addIncentiveSchema = z
  .object({
    incentives: z
      .array(
        z.object({
          collectorType: z.number(),
          applicableLevel: z
            .number({
              invalid_type_error: "Applicable level is required",
            })
            .min(1, "Applicable level is required"),
          circle: z.array(z.number()).optional(),
          division: z.array(z.number()).optional(),
          subDivision: z.array(z.number()).optional(),
          section: z.array(z.number()).optional(),
          addIncentiveOn: z
            .array(z.string())
            .min(1, "At least one incentive type must be selected"),
          currentPercentage: z.any().optional(),
          arrearPercentage: z.any().optional(),
          levelMapWithId: z.any(),
        })
      )
      .nonempty("At least one receipt entry must be added"),
  })
  .superRefine((data, ctx) => {
    data.incentives.forEach((receipt, index) => {
      if (!receipt.applicableLevel) {
        ctx.addIssue({
          path: [`incentives`, index, "applicableLevel"],
          message: "Applicable Level is required",
          code: z.ZodIssueCode.custom,
        });
      } else {
        if (receipt.applicableLevel === receipt.levelMapWithId.SECTION) {
          if (!receipt.circle?.length) {
            ctx.addIssue({
              path: [`incentives`, index, "circle"],
              message: "Circle is required",
              code: z.ZodIssueCode.custom,
            });
          }
          if (!receipt.division?.length) {
            ctx.addIssue({
              path: [`incentives`, index, "division"],
              message: "Division is required",
              code: z.ZodIssueCode.custom,
            });
          }
          if (!receipt.subDivision?.length) {
            ctx.addIssue({
              path: [`incentives`, index, "subDivision"],
              message: "Sub Division is required",
              code: z.ZodIssueCode.custom,
            });
          }
          if (!receipt.section?.length) {
            ctx.addIssue({
              path: [`incentives`, index, "section"],
              message: "Section is required",
              code: z.ZodIssueCode.custom,
            });
          }
        } else if (
          receipt.applicableLevel === receipt.levelMapWithId.SUB_DIVISION
        ) {
          if (!receipt.circle?.length) {
            ctx.addIssue({
              path: [`incentives`, index, "circle"],
              message: "Circle is required",
              code: z.ZodIssueCode.custom,
            });
          }
          if (!receipt.division?.length) {
            ctx.addIssue({
              path: [`incentives`, index, "division"],
              message: "Division is required",
              code: z.ZodIssueCode.custom,
            });
          }
          if (!receipt.subDivision?.length) {
            ctx.addIssue({
              path: [`incentives`, index, "subDivision"],
              message: "Sub Division is required",
              code: z.ZodIssueCode.custom,
            });
          }
        } else if (
          receipt.applicableLevel === receipt.levelMapWithId.DIVISION
        ) {
          if (!receipt.circle?.length) {
            ctx.addIssue({
              path: [`incentives`, index, "circle"],
              message: "Circle is required",
              code: z.ZodIssueCode.custom,
            });
          }
          if (!receipt.division?.length) {
            ctx.addIssue({
              path: [`incentives`, index, "division"],
              message: "Division is required",
              code: z.ZodIssueCode.custom,
            });
          }
        } else if (receipt.applicableLevel === receipt.levelMapWithId.CIRCLE) {
          if (!receipt.circle?.length) {
            ctx.addIssue({
              path: [`incentives`, index, "circle"],
              message: "Circle is required",
              code: z.ZodIssueCode.custom,
            });
          }
        }
      }
      if (
        receipt.addIncentiveOn.includes(addIncentiveOnKeyValue.currentAmount) &&
        !receipt.currentPercentage
      ) {
        ctx.addIssue({
          path: [`incentives`, index, "currentPercentage"],
          message: "Current Amount must be greater than 0",
          code: z.ZodIssueCode.custom,
        });
      }
      if (
        receipt.addIncentiveOn.includes(addIncentiveOnKeyValue.arrearAmount) &&
        !receipt.arrearPercentage
      ) {
        ctx.addIssue({
          path: [`incentives`, index, "arrearPercentage"],
          message: "Arrear Amount must be greater than 0",
          code: z.ZodIssueCode.custom,
        });
      }
    });
  });

export const editIncentiveSchema = z
  .object({
    collectorType: z.number().min(1, "Collector type is required"),
    applicableLevel: z
      .number({
        invalid_type_error: "Applicable level is required",
      })
      .min(1, "Applicable level is required"),
    circle: z.array(z.number()).optional(),
    division: z.array(z.number()).optional(),
    subDivision: z.array(z.number()).optional(),
    section: z.array(z.number()).optional(),
    addIncentiveOn: z
      .array(z.string())
      .min(1, "At least one incentive type must be selected"),
    currentPercentage: z.any().optional(),
    arrearPercentage: z.any().optional(),
    levelMapWithId: z.any(),
  })
  .superRefine((data, ctx) => {
    if (
      data.addIncentiveOn.includes(addIncentiveOnKeyValue.currentAmount) &&
      !data.currentPercentage
    ) {
      ctx.addIssue({
        path: ["currentPercentage"],
        message: "Current Amount must be greater than 0",
        code: z.ZodIssueCode.custom,
      });
    }
    if (
      data.addIncentiveOn.includes(addIncentiveOnKeyValue.arrearAmount) &&
      !data.arrearPercentage
    ) {
      ctx.addIssue({
        path: ["arrearPercentage"],
        message: "Arrear Amount must be greater than 0",
        code: z.ZodIssueCode.custom,
      });
    }
  });

// export const addReceiptsSchema = z.object({
//   configRule: z.string().min(1, 'Config rule is required'),
//   receipts: z.array(
//     z.object({
//       applicableLevel: z.string().min(1, 'Applicable Level is required'),
//       circle: z.array(z.number()).optional(),
//       division: z.array(z.number()).optional(),
//       subDivision: z.array(z.number()).optional(),
//       section: z.array(z.number()).optional(),
//       receiptsPerMonth: z.number().min(1, 'Must be at least 1 receipt per month'),
//       receiptsPerDay: z.number().min(1, 'Must be at least 1 receipt per day'),
//       allowSecondReceipt: z.boolean(),
//     })
//   ).nonempty('At least one receipt entry must be added'),
// });

export const addReceiptsSchema = z
  .object({
    configRule: z.string().min(1, "Config rule is required"),
    receipts: z
      .array(
        z.object({
          applicableLevel: z.any().optional(),
          circle: z.array(z.number()).optional(),
          division: z.array(z.number()).optional(),
          subDivision: z.array(z.number()).optional(),
          section: z.array(z.number()).optional(),
          receiptsPerMonth: z.number().optional(),
          receiptsPerDay: z.number().optional(),
          allowSecondReceipt: z.boolean(),
          levelMapWithId: z.any(),
        })
      )
      .nonempty("At least one receipt entry must be added"),
  })
  .superRefine((data, ctx) => {
    const configRule = data.configRule;
    data.receipts.forEach((receipt, index) => {
      if (configRule === "Levelwise") {
        if (!receipt.applicableLevel) {
          ctx.addIssue({
            path: [`receipts`, index, "applicableLevel"],
            message: "Applicable Level is required",
            code: z.ZodIssueCode.custom,
          });
        } else {
          if (receipt.applicableLevel === receipt.levelMapWithId.SECTION) {
            if (!receipt.circle?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "circle"],
                message: "Circle is required",
                code: z.ZodIssueCode.custom,
              });
            }
            if (!receipt.division?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "division"],
                message: "Division is required",
                code: z.ZodIssueCode.custom,
              });
            }
            if (!receipt.subDivision?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "subDivision"],
                message: "Sub Division is required",
                code: z.ZodIssueCode.custom,
              });
            }
            if (!receipt.section?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "section"],
                message: "Section is required",
                code: z.ZodIssueCode.custom,
              });
            }
          } else if (
            receipt.applicableLevel === receipt.levelMapWithId.SUB_DIVISION
          ) {
            if (!receipt.circle?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "circle"],
                message: "Circle is required",
                code: z.ZodIssueCode.custom,
              });
            }
            if (!receipt.division?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "division"],
                message: "Division is required",
                code: z.ZodIssueCode.custom,
              });
            }
            if (!receipt.subDivision?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "subDivision"],
                message: "Sub Division is required",
                code: z.ZodIssueCode.custom,
              });
            }
          } else if (
            receipt.applicableLevel === receipt.levelMapWithId.DIVISION
          ) {
            if (!receipt.circle?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "circle"],
                message: "Circle is required",
                code: z.ZodIssueCode.custom,
              });
            }
            if (!receipt.division?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "division"],
                message: "Division is required",
                code: z.ZodIssueCode.custom,
              });
            }
          } else if (
            receipt.applicableLevel === receipt.levelMapWithId.CIRCLE
          ) {
            if (!receipt.circle?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "circle"],
                message: "Circle is required",
                code: z.ZodIssueCode.custom,
              });
            }
          }
        }
      }
      if (receipt.receiptsPerMonth <= 0) {
        ctx.addIssue({
          path: [`receipts`, index, "receiptsPerMonth"],
          message: "Receipts per month must be greater than 0",
          code: z.ZodIssueCode.custom,
        });
      }
      if (receipt.receiptsPerDay <= 0) {
        ctx.addIssue({
          path: [`receipts`, index, "receiptsPerDay"],
          message: "Receipts per day must be greater than 0",
          code: z.ZodIssueCode.custom,
        });
      }
    });
  });

export const editReceiptsSchema = z
  .object({
    configRule: z.string().min(1, "Config rule is required"),
    receipts: z
      .array(
        z.object({
          applicableLevel: z.any().optional(),
          circle: z.array(z.number()).optional(),
          division: z.array(z.number()).optional(),
          subDivision: z.array(z.number()).optional(),
          section: z.array(z.number()).optional(),
          receiptsPerMonth: z.number().optional(),
          receiptsPerDay: z.number().optional(),
          allowSecondReceipt: z.boolean(),
          levelMapWithId: z.any(),
        })
      )
      .nonempty("At least one receipt entry must be added"),
  })
  .superRefine((data, ctx) => {
    const configRule = data.configRule;

    data.receipts.forEach((receipt, index) => {
      if (configRule === "Levelwise") {
        if (!receipt.applicableLevel) {
          ctx.addIssue({
            path: [`receipts`, index, "applicableLevel"],
            message: "Applicable Level is required",
            code: z.ZodIssueCode.custom,
          });
        } else {
          if (receipt.applicableLevel === receipt?.levelMapWithId?.SECTION) {
            if (!receipt.circle?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "circle"],
                message: "Circle is required",
                code: z.ZodIssueCode.custom,
              });
            }
            if (!receipt.division?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "division"],
                message: "Division is required",
                code: z.ZodIssueCode.custom,
              });
            }
            if (!receipt.subDivision?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "subDivision"],
                message: "Sub Division is required",
                code: z.ZodIssueCode.custom,
              });
            }
            if (!receipt.section?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "section"],
                message: "Section is required",
                code: z.ZodIssueCode.custom,
              });
            }
          } else if (
            receipt.applicableLevel === receipt?.levelMapWithId?.SUB_DIVISION
          ) {
            if (!receipt.circle?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "circle"],
                message: "Circle is required",
                code: z.ZodIssueCode.custom,
              });
            }
            if (!receipt.division?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "division"],
                message: "Division is required",
                code: z.ZodIssueCode.custom,
              });
            }
            if (!receipt.subDivision?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "subDivision"],
                message: "Sub Division is required",
                code: z.ZodIssueCode.custom,
              });
            }
          } else if (
            receipt.applicableLevel === receipt?.levelMapWithId?.DIVISION
          ) {
            if (!receipt.circle?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "circle"],
                message: "Circle is required",
                code: z.ZodIssueCode.custom,
              });
            }
            if (!receipt.division?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "division"],
                message: "Division is required",
                code: z.ZodIssueCode.custom,
              });
            }
          } else if (
            receipt.applicableLevel === receipt?.levelMapWithId?.CIRCLE
          ) {
            if (!receipt.circle?.length) {
              ctx.addIssue({
                path: [`receipts`, index, "circle"],
                message: "Circle is required",
                code: z.ZodIssueCode.custom,
              });
            }
          }
        }
      }
      if (receipt.receiptsPerMonth <= 0) {
        ctx.addIssue({
          path: [`receipts`, index, "receiptsPerMonth"],
          message: "Receipts per month must be greater than 0",
          code: z.ZodIssueCode.custom,
        });
      }
      if (receipt.receiptsPerDay <= 0) {
        ctx.addIssue({
          path: [`receipts`, index, "receiptsPerDay"],
          message: "Receipts per day must be greater than 0",
          code: z.ZodIssueCode.custom,
        });
      }
    });
  });

export const editAgentAreaSchema = z.object({
  agencyId: z.any().optional(),
  agentId: z.number(),
  agentMobileNumber: z
    .string()
    .min(10, "Mobile number must be at least 10 digits"),
  agentName: z.string().optional(),
  agencyName: z.string().optional(),
  agentRole: z.string().nonempty("Agent Role is required"),
  workingLevel: z.number().min(1, "Working Level is required"),
  circle: z.array(z.number()).optional(),
  division: z.array(z.number()).optional(),
  subDivision: z.array(z.number()).optional(),
  section: z.array(z.number()).optional(),
});

export type editAgentAreaFormData = z.infer<typeof editAgentAreaSchema>;

export const editAgentAreaViaAgencySchema = z.object({
  agentId: z.number(),
  agentMobileNumber: z
    .string()
    .min(10, "Mobile number must be at least 10 digits"),
  agentName: z.string().optional(),
  agencyName: z.string().optional(),
  agentRole: z.string().nonempty("Agent Role is required"),
  workingLevel: z.number().min(1, "Working Level is required"),
  circle: z.array(z.number()).optional(),
  division: z.array(z.number()).optional(),
  subDivision: z.array(z.number()).optional(),
  section: z.array(z.number()).optional(),
});

export type editAgentAreaViaAgencyFormData = z.infer<
  typeof editAgentAreaViaAgencySchema
>;

export const agentBankDepositSchema = z.object({
  collectorMobile: z
    .number()
    .min(10, "Mobile number must be at least 10 digits"),
  agentName: z.string().optional(),
  phoneNumber: z.string().optional(),
  agentId: z.number().optional(),
  depositAmount: z
    .number()
    .min(1, "Deposit amount must be at least 1")
    .positive("Deposit amount must be a positive number"),
  depositDate: z.string().nonempty("Deposit Date is required"),
  txnRefNo: z
    .string()
    .nonempty("Transaction Ref No is required")
    .min(1, "Transaction Ref No cannot be empty"),
  depositSlip: z
    .any()
    .refine((val) => val && val.length > 0, {
      message: "Deposit slip is required",
    })
    .refine(
      (val) => {
        if (!val || val.length === 0) return false;
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
        return allowedTypes.includes(val[0].type);
      },
      {
        message: "Only PDF, JPG, or PNG files are allowed.",
      }
    ),
  bank: z.string().nonempty("Bank is required"),
});

export type AgentBankDepositFormData = z.infer<typeof agentBankDepositSchema>;

export const supervisorDepositSchema = z.object({
  depositAmount: z
    .number()
    .min(1, "Deposit amount must be at least 1")
    .positive("Deposit amount must be a positive number"),
  depositDate: z.string().nonempty("Deposit Date is required"),
  txnRefNo: z.string().optional(),
  depositSlip: z
    .any()
    .refine((val) => val && val.length > 0, {
      message: "Deposit slip is required",
    })
    .refine(
      (val) => {
        if (!val || val.length === 0) return false;
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
        return allowedTypes.includes(val[0].type);
      },
      {
        message: "Only PDF, JPG, or PNG files are allowed.",
      }
    ),
  bank: z.string().optional(),
});

export type SupervisorDepositFormData = z.infer<typeof supervisorDepositSchema>;

export const agencyBankDepositSchema = z.object({
  agencyId: z
    .number({
      invalid_type_error: "Please select Agency",
    })
    .optional(),
  depositAmount: z
    .number({
      invalid_type_error: "Deposit amount is required",
    })
    .min(1, "Deposit amount must be at least 1")
    .positive("Deposit amount must be a positive number"),
  depositDate: z.string().nonempty("Deposit Date is required"),
  txnRefNo: z.string().optional(),
  bank: z.string().nonempty("Bank is required"),
});

export type AgencyBankDepositFormData = z.infer<typeof agencyBankDepositSchema>;

export const addModeOfPaymentSchema = z.object({
  paymentModes: z.array(z.number()),
});

export type AddModeOfPaymentFormData = z.infer<typeof addModeOfPaymentSchema>;

export const createUserSchema = z.object({
  userRole: z
    .number({ invalid_type_error: "User Role is required" })
    .int("User Role must be an integer")
    .min(1, "User Role is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().length(10, "Phone number must be exactly 10 digits"),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export const createNewUserSchema = z
  .object({
    userRole: z
      .number({ invalid_type_error: "User Role is required" })
      .int("User Role must be an integer")
      .min(1, "User Role is required"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    phoneNumber: z
      .string()
      .length(10, "Phone number must be exactly 10 digits"),
    needOfficeStructure: z.boolean().optional(),
    levelWithIdMap: z.any(),
    workingLevel: z.any().optional(),
    circle: z.array(z.number()).optional(),
    division: z.array(z.number()).optional(),
    subDivision: z.array(z.number()).optional(),
    section: z.array(z.number()).optional(),
  })
  .superRefine((data, ctx) => {
    const { workingLevel, levelWithIdMap, needOfficeStructure } = data;
    let levelMapWithId = levelWithIdMap;

    if (needOfficeStructure && workingLevel == null) {
      ctx.addIssue({
        path: ["workingLevel"],
        code: z.ZodIssueCode.custom,
        message: "Working Level is required",
      });
    }

    // Circle level
    if (workingLevel === levelMapWithId?.CIRCLE) {
      if (!data.circle || data.circle.length === 0) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
    }

    // Division level
    if (workingLevel === levelMapWithId?.DIVISION) {
      if (!data.circle || data.circle.length === 0) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
      if (!data.division || data.division.length === 0) {
        ctx.addIssue({
          path: ["division"],
          code: z.ZodIssueCode.custom,
          message: "Division is required",
        });
      }
    }

    // SubDivision level
    if (workingLevel === levelMapWithId?.SUB_DIVISION) {
      if (!data.circle || data.circle.length === 0) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
      if (!data.division || data.division.length === 0) {
        ctx.addIssue({
          path: ["division"],
          code: z.ZodIssueCode.custom,
          message: "Division is required",
        });
      }
      if (!data.subDivision || data.subDivision.length === 0) {
        ctx.addIssue({
          path: ["subDivision"],
          code: z.ZodIssueCode.custom,
          message: "Sub Division is required",
        });
      }
    }

    // Section level
    if (workingLevel === levelMapWithId?.SECTION) {
      if (!data.circle || data.circle.length === 0) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
      if (!data.division || data.division.length === 0) {
        ctx.addIssue({
          path: ["division"],
          code: z.ZodIssueCode.custom,
          message: "Division is required",
        });
      }
      if (!data.subDivision || data.subDivision.length === 0) {
        ctx.addIssue({
          path: ["subDivision"],
          code: z.ZodIssueCode.custom,
          message: "Sub Division is required",
        });
      }
      if (!data.section || data.section.length === 0) {
        ctx.addIssue({
          path: ["section"],
          code: z.ZodIssueCode.custom,
          message: "Section is required",
        });
      }
    }
  });

export type CreateNewUserFormData = z.infer<typeof createNewUserSchema>;

export const addSupervisorSchema = z.object({
  supervisorName: z.string().min(1, { message: "Supervisor Name is required" }),

  mobileNumber: z
    .string()
    .length(10, { message: "Mobile Number must be exactly 10 digits" })
    .regex(/^[0-9]{10}$/, { message: "Mobile Number must be numeric" }),
});

export type AddSupervisorFormData = z.infer<typeof addSupervisorSchema>;

export const dailyCollectionEnergySheet = z.object({
  fromDate: z.string().min(1, "From Date is required"),
  toDate: z.string().min(1, "To Date is required"),
  dateType: z.string().min(1, "Date Type is required"),
  agentRole: z.any().optional(),
  agentMode: z.any().optional(),
  collectionMode: z.any().optional(),
  workingLevel: z.any().optional(),
  circle: z.array(z.number()).optional(),
  division: z.array(z.number()).optional(),
  subDivision: z.array(z.number()).optional(),
  section: z.array(z.number()).optional(),
  agencyName: z.string().optional(),
  levelMapWithId: z.any(),
  pageSize: z
    .number({ invalid_type_error: "Page size is required" })
    .min(1, "Page size is required"),
})
  .superRefine((data, ctx) => {
    const { workingLevel, levelMapWithId } = data;

    if (data.fromDate && data.toDate) {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      if (from > to) {
        ctx.addIssue({
          path: ["toDate"],
          code: z.ZodIssueCode.custom,
          message: "\'From Date\' should be before or the same as \'To Date\'",
        });
      }
    }

    // Circle level
    if (workingLevel === levelMapWithId?.CIRCLE) {
      if (!data.circle || data.circle.length === 0) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
    }

    // Division level
    if (workingLevel === levelMapWithId?.DIVISION) {
      if (!data.circle || data.circle.length === 0) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
      if (!data.division || data.division.length === 0) {
        ctx.addIssue({
          path: ["division"],
          code: z.ZodIssueCode.custom,
          message: "Division is required",
        });
      }
    }

    // SubDivision level
    if (workingLevel === levelMapWithId?.SUB_DIVISION) {
      if (!data.circle || data.circle.length === 0) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
      if (!data.division || data.division.length === 0) {
        ctx.addIssue({
          path: ["division"],
          code: z.ZodIssueCode.custom,
          message: "Division is required",
        });
      }
      if (!data.subDivision || data.subDivision.length === 0) {
        ctx.addIssue({
          path: ["subDivision"],
          code: z.ZodIssueCode.custom,
          message: "Sub Division is required",
        });
      }
    }

    // Section level
    if (workingLevel === levelMapWithId?.SECTION) {
      if (!data.circle || data.circle.length === 0) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
      if (!data.division || data.division.length === 0) {
        ctx.addIssue({
          path: ["division"],
          code: z.ZodIssueCode.custom,
          message: "Division is required",
        });
      }
      if (!data.subDivision || data.subDivision.length === 0) {
        ctx.addIssue({
          path: ["subDivision"],
          code: z.ZodIssueCode.custom,
          message: "Sub Division is required",
        });
      }
      if (!data.section || data.section.length === 0) {
        ctx.addIssue({
          path: ["section"],
          code: z.ZodIssueCode.custom,
          message: "Section is required",
        });
      }
    }
  })

export type DailyCollectionEnergyFormData = z.infer<
  typeof dailyCollectionEnergySheet
>;

export const dailyCollectionNonEnergySheet = z.object({
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  dateType: z.string().optional(),
  agentRole: z.string().optional(),
  workingLevel: z.any().optional(),
  circle: z.array(z.number()).optional(),
  division: z.array(z.number()).optional(),
  subDivision: z.array(z.number()).optional(),
  section: z.array(z.number()).optional(),
  agencyName: z.string().optional(),
}).superRefine((data, ctx) => {
  const from = new Date(data.fromDate);
  const to = new Date(data.toDate);
  if (from > to) {
    ctx.addIssue({
      path: ["toDate"],
      code: z.ZodIssueCode.custom,
      message: "\'From Date\' should be before or the same as \'To Date\'",
    });
  }
});

export type DailyCollectionNonEnergyFormData = z.infer<
  typeof dailyCollectionNonEnergySheet
>;

export const deniedEnergyConsumerReport = z
  .object({
    fromDate: z.string().min(1, "From Date is required"),
    toDate: z.string().min(1, "To Date is required"),
    deniedToPay: z.any().optional(),
    workingLevel: z.any().nullable(),
    circle: z.array(z.number()).optional(),
    division: z.array(z.number()).optional(),
    subDivision: z.array(z.number()).optional(),
    section: z.array(z.number()).optional(),
    pageSize: z
      .number({
        invalid_type_error: "Page size is required",
      })
      .min(1, "Page size is required"),
    levelWithIdMap: z.any(),
  })
  .superRefine((data, ctx) => {
    const level = data.workingLevel;
    const map = data.levelWithIdMap;

    if (data.fromDate && data.toDate) {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      if (from > to) {
        ctx.addIssue({
          path: ["toDate"],
          code: z.ZodIssueCode.custom,
          message: "\'From Date\' should be before or the same as \'To Date\'",
        });
      }
    }

    if (level === map?.SECTION) {
      if (!data.circle.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
      if (!data.division.length) {
        ctx.addIssue({ path: ["division"], code: z.ZodIssueCode.custom, message: "Division is required" });
      }
      if (!data.subDivision.length) {
        ctx.addIssue({ path: ["subDivision"], code: z.ZodIssueCode.custom, message: "Sub Division is required" });
      }
      if (!data.section.length) {
        ctx.addIssue({ path: ["section"], code: z.ZodIssueCode.custom, message: "Section is required" });
      }
    } else if (level === map?.SUB_DIVISION) {
      if (!data.circle.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
      if (!data.division.length) {
        ctx.addIssue({ path: ["division"], code: z.ZodIssueCode.custom, message: "Division is required" });
      }
      if (!data.subDivision.length) {
        ctx.addIssue({ path: ["subDivision"], code: z.ZodIssueCode.custom, message: "Sub Division is required" });
      }
    } else if (level === map?.DIVISION) {
      if (!data.circle.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
      if (!data.division.length) {
        ctx.addIssue({ path: ["division"], code: z.ZodIssueCode.custom, message: "Division is required" });
      }
    } else if (level === map?.CIRCLE) {
      if (!data.circle.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
    }
  });

export type DeniedEnergyConsumerReportFormData = z.infer<
  typeof deniedEnergyConsumerReport
>;

// export const dailyCollectionNonEnergySheet = z.object({
//   fromDate: z.string().optional(),
//   toDate: z.string().optional(),
//   dateType: z.string().optional(),
//   agentRole: z.string().optional(),
//   workingLevel: z.number().optional(),
//   circle: z.array(z.number()).optional(),
//   division: z.array(z.number()).optional(),
//   subDivision: z.array(z.number()).optional(),
//   section: z.array(z.number()).optional(),
//   agencyName: z.string().optional(),
// });

// export type DailyCollectionNonEnergyFormData = z.infer<typeof dailyCollectionNonEnergySheet>;

export const viewHistorySchema = z
  .object({
    fromDate: z.string().min(1, "From date is required"),
    toDate: z.string().min(1, "To date is required"),
  })
  .refine((data) => new Date(data.fromDate) <= new Date(data.toDate), {
    message: "\'From Date\' should be before or the same as \'To Date\'",
    path: ["toDate"],
  });

export type ViewHistorySchemaData = z.infer<typeof viewHistorySchema>;

export const agentDepositReportSchema = z
  .object({
    dateFrom: z.string().min(1, "From date is required"),
    dateTo: z.string().min(1, "To date is required"),
    acknowledgementType: z.string().optional(),
    pageSize: z
      .number({ invalid_type_error: "Page size is required" })
      .min(1, "Page size is required"),
  })
  .refine((data) => new Date(data.dateFrom) <= new Date(data.dateTo), {
    message: "\'From Date\' should be before or the same as \'To Date\'",
    path: ["dateTo"],
  });

export type AgentDepositReportSchemaData = z.infer<
  typeof agentDepositReportSchema
>;

export const agentWalletSchema = z
  .object({
    fromDate: z.string().min(1, "From date is required"),
    toDate: z.string().min(1, "To date is required"),
    agencyName: z.string().optional(),
    agentName: z.string().optional(),
    // agentMobile: z.string().optional(),
    transactionType: z.string().optional(),
    transactionId: z.string().optional(),
    pageSize: z
      .number({ invalid_type_error: "Page size is required" })
      .min(1, "Page size is required"),
  })
  .refine((data) => new Date(data.fromDate) <= new Date(data.toDate), {
    message: "\'From Date\' should be before or the same as \'To Date\'",
    path: ["toDate"],
  });

export type AgentWalletSchemaData = z.infer<typeof agentWalletSchema>;

export const agencyWalletSchema = z
  .object({
    fromDate: z.string().min(1, "From date is required"),
    toDate: z.string().min(1, "To date is required"),
    agencyName: z.string().optional(),
    // agencyMobile: z.any().optional(),
    transactionType: z.string().optional(),
    transactionId: z.any().optional(),
    pageSize: z
      .number({ invalid_type_error: "Page size is required" })
      .min(1, "Page size is required"),
  })
  .refine((data) => new Date(data.fromDate) <= new Date(data.toDate), {
    message: "\'From Date\' should be before or the same as \'To Date\'",
    path: ["toDate"],
  });

export type AgencyWalletSchemaData = z.infer<typeof agencyWalletSchema>;

export const agentBankDepositTableSchema = z
  .object({
    dateFrom: z.string().min(1, "From date is required"),
    dateTo: z.string().min(1, "To date is required"),
    agencyName: z.string().optional(),
    pageSize: z
      .number({
        invalid_type_error: "Page size is required",
      })
      .min(1, "Page size is required"),
  })
  .refine((data) => new Date(data.dateFrom) <= new Date(data.dateTo), {
    message: "\'From Date\' should be before or the same as \'To Date\'",
    path: ["dateTo"],
  });

export type AgentBankDepositTableSchemaData = z.infer<
  typeof agentBankDepositTableSchema
>;

export const mmiReportSchema = z
  .object({
    fromDate: z.string().min(1, "From Date is required"),
    toDate: z.string().min(1, "To Date is required"),
    workingLevel: z.any().optional(),
    circle: z.array(z.number()).optional(),
    division: z.array(z.number()).optional(),
    subDivision: z.array(z.number()).optional(),
    section: z.array(z.number()).optional(),
    agencyName: z.string().min(1, "Agency Name is required"),
    agentMobile: z.string().min(1, "Agency Mobile is required"),
    levelMapWithId: z.any(),
  })
  .superRefine((data, ctx) => {
    const { workingLevel, levelMapWithId } = data;

    // Add fromDate/toDate validation
    if (data.fromDate && data.toDate) {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      if (from > to) {
        ctx.addIssue({
          path: ["toDate"],
          code: z.ZodIssueCode.custom,
          message: "'From Date' should be before or the same as 'To Date'",
        });
      }
    }

    // Circle level
    if (workingLevel === levelMapWithId?.CIRCLE) {
      if (!data.circle || data.circle.length === 0) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
    }

    // Division level
    if (workingLevel === levelMapWithId?.DIVISION) {
      if (!data.circle || data.circle.length === 0) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
      if (!data.division || data.division.length === 0) {
        ctx.addIssue({
          path: ["division"],
          code: z.ZodIssueCode.custom,
          message: "Division is required",
        });
      }
    }

    // SubDivision level
    if (workingLevel === levelMapWithId?.SUB_DIVISION) {
      if (!data.circle || data.circle.length === 0) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
      if (!data.division || data.division.length === 0) {
        ctx.addIssue({
          path: ["division"],
          code: z.ZodIssueCode.custom,
          message: "Division is required",
        });
      }
      if (!data.subDivision || data.subDivision.length === 0) {
        ctx.addIssue({
          path: ["subDivision"],
          code: z.ZodIssueCode.custom,
          message: "Sub Division is required",
        });
      }
    }

    // Section level
    if (workingLevel === levelMapWithId?.SECTION) {
      if (!data.circle || data.circle.length === 0) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
      if (!data.division || data.division.length === 0) {
        ctx.addIssue({
          path: ["division"],
          code: z.ZodIssueCode.custom,
          message: "Division is required",
        });
      }
      if (!data.subDivision || data.subDivision.length === 0) {
        ctx.addIssue({
          path: ["subDivision"],
          code: z.ZodIssueCode.custom,
          message: "Sub Division is required",
        });
      }
      if (!data.section || data.section.length === 0) {
        ctx.addIssue({
          path: ["section"],
          code: z.ZodIssueCode.custom,
          message: "Section is required",
        });
      }
    }
  });

export type MmiReportSchemaData = z.infer<typeof mmiReportSchema>;

export const viewCollectionSummarySchema = z
  .object({
    fromDate: z.string().min(1, "From Date is required"),
    toDate: z.string().min(1, "To Date is required"),
    dateType: z.string().min(1, "Date Type is required"),
    viewType: z.string().min(1, "View Type is required"),
    workingLevel: z.any().optional(),
    circle: z.array(z.number()).optional(),
    division: z.array(z.number()).optional(),
    subDivision: z.array(z.number()).optional(),
    section: z.array(z.number()).optional(),
    agencyName: z.string().optional(),
    levelMapWithId: z.any(),
    pageSize: z
      .number({ invalid_type_error: "Page size is required" })
      .min(1, "Page size is required"),
  })
  .superRefine((data, ctx) => {
    const { workingLevel, levelMapWithId } = data;

    // Add fromDate/toDate validation
    if (data.fromDate && data.toDate) {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      if (from > to) {
        ctx.addIssue({
          path: ["toDate"],
          code: z.ZodIssueCode.custom,
          message: "'From Date' should be before or the same as 'To Date'",
        });
      }
    }

    // Circle level
    if (workingLevel === levelMapWithId?.CIRCLE) {
      if (!data.circle || data.circle.length === 0) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
    }

    // Division level
    if (workingLevel === levelMapWithId?.DIVISION) {
      if (!data.circle || data.circle.length === 0) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
      if (!data.division || data.division.length === 0) {
        ctx.addIssue({
          path: ["division"],
          code: z.ZodIssueCode.custom,
          message: "Division is required",
        });
      }
    }

    // SubDivision level
    if (workingLevel === levelMapWithId?.SUB_DIVISION) {
      if (!data.circle || data.circle.length === 0) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
      if (!data.division || data.division.length === 0) {
        ctx.addIssue({
          path: ["division"],
          code: z.ZodIssueCode.custom,
          message: "Division is required",
        });
      }
      if (!data.subDivision || data.subDivision.length === 0) {
        ctx.addIssue({
          path: ["subDivision"],
          code: z.ZodIssueCode.custom,
          message: "Sub Division is required",
        });
      }
    }

    // Section level
    if (workingLevel === levelMapWithId?.SECTION) {
      if (!data.circle || data.circle.length === 0) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
      if (!data.division || data.division.length === 0) {
        ctx.addIssue({
          path: ["division"],
          code: z.ZodIssueCode.custom,
          message: "Division is required",
        });
      }
      if (!data.subDivision || data.subDivision.length === 0) {
        ctx.addIssue({
          path: ["subDivision"],
          code: z.ZodIssueCode.custom,
          message: "Sub Division is required",
        });
      }
      if (!data.section || data.section.length === 0) {
        ctx.addIssue({
          path: ["section"],
          code: z.ZodIssueCode.custom,
          message: "Section is required",
        });
      }
    }
  });

export type ViewCollectionSummarySchemaData = z.infer<
  typeof viewCollectionSummarySchema
>;

export const reverseAgentBalanceSchema = z.object({
  collectorMobile: z
    .number()
    .min(10, "Mobile number must be at least 10 digits"),
  agencyId: z.number(),
  agencyName: z.string().min(1, "Agency Name is required"),
  phoneNumber: z.string().min(10, "Phone Number should be 10 digits"),
  maximumRecharge: z
    .number()
    .positive("Maximum recharge must be greater than 0"),
  amount: z
    .number({
      invalid_type_error: "Amount is required",
    })
    .min(1, {
      message: "Amount must be greater than 0",
    })
    .positive("Amount must be greater than 0"),
  transactionType: z.string(),
  currentBalance: z.number(),
  remark: z.string().optional(),
});

export type ReverseAgentBalanceFormData = z.infer<
  typeof reverseAgentBalanceSchema
>;

const DiscriminatedUnion = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(cancelTransactionTypePicklist[0]?.value),
    recordId: z.string().nonempty("Record ID is required"),
  }),
  z.object({
    type: z.literal(cancelTransactionTypePicklist[1]?.value),
    recordId: z.string().nonempty("Record ID is required"),
  }),
  z.object({
    type: z.literal(cancelTransactionTypePicklist[2]?.value),
    recordId: z.string().nonempty("Record ID is required"),
    transactionDate: z.string().nonempty("Transaction Date is required"),
  }),
]);

export const CancelTransactionSchema = z
  .object({
    type: z.string().nonempty("Type is required"),
  })
  .and(DiscriminatedUnion);

export type CancelTransactionFormData = z.infer<typeof CancelTransactionSchema>;

export const agentWiseSummaryReportSchema = z
  .object({
    fromDate: z.string().min(1, "From Date is required"),
    toDate: z.string().min(1, "To Date is required"),
    dateType: z.string().min(1, "Date Type is required"),
    reportType: z.string().nonempty("Report Type is required"),
    workingLevel: z.any().optional(),
    circle: z.array(z.number()).optional(),
    division: z.array(z.number()).optional(),
    subDivision: z.array(z.number()).optional(),
    section: z.array(z.number()).optional(),
    agencyName: z.string().optional(),
    pageSize: z
      .number({ invalid_type_error: "Page size is required" })
      .min(1, "Page size is required"),
    levelWithIdMap: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fromDate && data.toDate) {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      if (from > to) {
        ctx.addIssue({
          path: ["toDate"],
          code: z.ZodIssueCode.custom,
          message: "\'From Date\' should be before or the same as \'To Date\'",
        });
      }
    }
    const level = data.workingLevel;
    const map = data.levelWithIdMap;
    if (level === map?.SECTION) {
      if (!data.circle?.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
      if (!data.division?.length) {
        ctx.addIssue({ path: ["division"], code: z.ZodIssueCode.custom, message: "Division is required" });
      }
      if (!data.subDivision?.length) {
        ctx.addIssue({ path: ["subDivision"], code: z.ZodIssueCode.custom, message: "Sub Division is required" });
      }
      if (!data.section?.length) {
        ctx.addIssue({ path: ["section"], code: z.ZodIssueCode.custom, message: "Section is required" });
      }
    } else if (level === map?.SUB_DIVISION) {
      if (!data.circle?.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
      if (!data.division?.length) {
        ctx.addIssue({ path: ["division"], code: z.ZodIssueCode.custom, message: "Division is required" });
      }
      if (!data.subDivision?.length) {
        ctx.addIssue({ path: ["subDivision"], code: z.ZodIssueCode.custom, message: "Sub Division is required" });
      }
    } else if (level === map?.DIVISION) {
      if (!data.circle?.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
      if (!data.division?.length) {
        ctx.addIssue({ path: ["division"], code: z.ZodIssueCode.custom, message: "Division is required" });
      }
    } else if (level === map?.CIRCLE) {
      if (!data.circle?.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
    }
  });

export type AgentWiseSummaryReportData = z.infer<
  typeof agentWiseSummaryReportSchema
>;

export const agentAttendanceReport = z
  .object({
    fromDate: z.string().min(1, "From Date is required"),
    toDate: z.string().min(1, "To Date is required"),
    agentType: z.number({
      invalid_type_error: "Agent type is required",
      required_error: "Agent type is required",
    }),
    workingLevel: z.any().nullable(),
    circle: z.array(z.number()).optional(),
    division: z.array(z.number()).optional(),
    subDivision: z.array(z.number()).optional(),
    section: z.array(z.number()).optional(),
    pageSize: z
      .number({
        invalid_type_error: "Page size is required",
      })
      .min(1, "Page size is required"),
    levelWithIdMap: z.any(),
  })
  .superRefine((data, ctx) => {
    const level = data.workingLevel;
    const map = data.levelWithIdMap;

    if (data.fromDate && data.toDate) {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      if (from > to) {
        ctx.addIssue({
          path: ["toDate"],
          code: z.ZodIssueCode.custom,
          message: "\'From Date\' should be before or the same as \'To Date\'",
        });
      }
    }

    if (level === map?.SECTION) {
      if (!data.circle?.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
      if (!data.division?.length) {
        ctx.addIssue({ path: ["division"], code: z.ZodIssueCode.custom, message: "Division is required" });
      }
      if (!data.subDivision?.length) {
        ctx.addIssue({ path: ["subDivision"], code: z.ZodIssueCode.custom, message: "Sub Division is required" });
      }
      if (!data.section?.length) {
        ctx.addIssue({ path: ["section"], code: z.ZodIssueCode.custom, message: "Section is required" });
      }
    } else if (level === map?.SUB_DIVISION) {
      if (!data.circle?.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
      if (!data.division?.length) {
        ctx.addIssue({ path: ["division"], code: z.ZodIssueCode.custom, message: "Division is required" });
      }
      if (!data.subDivision?.length) {
        ctx.addIssue({ path: ["subDivision"], code: z.ZodIssueCode.custom, message: "Sub Division is required" });
      }
    } else if (level === map?.DIVISION) {
      if (!data.circle?.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
      if (!data.division?.length) {
        ctx.addIssue({ path: ["division"], code: z.ZodIssueCode.custom, message: "Division is required" });
      }
    } else if (level === map?.CIRCLE) {
      if (!data.circle?.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
    }
  });

export type AgentAttendanceReportFormData = z.infer<
  typeof agentAttendanceReport
>;

export const cancelledTransactionReport = z
  .object({
    fromDate: z.string().min(1, "From Date is required"),
    toDate: z.string().min(1, "To Date is required"),
    workingLevel: z.any().optional(),
    circle: z.array(z.number()).optional(),
    division: z.array(z.number()).optional(),
    subDivision: z.array(z.number()).optional(),
    section: z.array(z.number()).optional(),
    pageSize: z
      .number({ invalid_type_error: "Page size is required" })
      .min(1, "Page size is required"),
    levelWithIdMap: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fromDate && data.toDate) {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      if (from > to) {
        ctx.addIssue({
          path: ["toDate"],
          code: z.ZodIssueCode.custom,
          message: "\'From Date\' should be before or the same as \'To Date\'",
        });
      }
    }
    const level = data.workingLevel;
    const map = data.levelWithIdMap;
    if (level === map?.SECTION) {
      if (!data.circle?.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
      if (!data.division?.length) {
        ctx.addIssue({ path: ["division"], code: z.ZodIssueCode.custom, message: "Division is required" });
      }
      if (!data.subDivision?.length) {
        ctx.addIssue({ path: ["subDivision"], code: z.ZodIssueCode.custom, message: "Sub Division is required" });
      }
      if (!data.section?.length) {
        ctx.addIssue({ path: ["section"], code: z.ZodIssueCode.custom, message: "Section is required" });
      }
    } else if (level === map?.SUB_DIVISION) {
      if (!data.circle?.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
      if (!data.division?.length) {
        ctx.addIssue({ path: ["division"], code: z.ZodIssueCode.custom, message: "Division is required" });
      }
      if (!data.subDivision?.length) {
        ctx.addIssue({ path: ["subDivision"], code: z.ZodIssueCode.custom, message: "Sub Division is required" });
      }
    } else if (level === map?.DIVISION) {
      if (!data.circle?.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
      if (!data.division?.length) {
        ctx.addIssue({ path: ["division"], code: z.ZodIssueCode.custom, message: "Division is required" });
      }
    } else if (level === map?.CIRCLE) {
      if (!data.circle?.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
    }
  });

export type CancelledTransactionReportFormData = z.infer<
  typeof cancelledTransactionReport
>;

export const billingReportSchema = z
  .object({
    fromDate: z.string().min(1, "From Date is required"),
    toDate: z.string().min(1, "To Date is required"),
    workingLevel: z.any().optional(),
    circle: z.array(z.number()).optional(),
    division: z.array(z.number()).optional(),
    subDivision: z.array(z.number()).optional(),
    section: z.array(z.number()).optional(),
    pageSize: z
      .number({ invalid_type_error: "Page size is required" })
      .min(1, "Page size is required"),
  })
  .superRefine((data, ctx) => {
    if (data.fromDate && data.toDate) {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      if (from > to) {
        ctx.addIssue({
          path: ["toDate"],
          code: z.ZodIssueCode.custom,
          message: "\'From Date\' should be before or the same as \'To Date\'",
        });
      }
    }
  });

export type BillingReportFormData = z.infer<typeof billingReportSchema>;

export const updatePosSchema = z.object({
  deviceSerialNo: z.string().min(1, "Device serial no is required"),
  deviceName: z.any(),
  mid: z.any(),
  tid: z.any(),
  deviceSerial: z.any(),
  deviceStatus: z.any(),
});

export type UpdatePosFormData = z.infer<typeof updatePosSchema>;

export const agentDetailsReportSchema = z.object({
  agency: z.string(),
  agencyStatus: z.string().optional(),
  pageSize: z
    .number({ invalid_type_error: "Page size is required" })
    .min(1, "Page size is required"),
});

export type AgentDetailsReportFormData = z.infer<
  typeof agentDetailsReportSchema
>;

export const agentLoginReportSchema = z
  .object({
    fromDate: z.string().min(1, "From Date is required"),
    toDate: z.string().min(1, "To Date is required"),
    agent: z.string().optional(),
    agency: z.string().optional(),
    agencyName: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fromDate && data.toDate) {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      if (from > to) {
        ctx.addIssue({
          path: ["toDate"],
          code: z.ZodIssueCode.custom,
          message: "\'From Date\' should be before or the same as \'To Date\'",
        });
      }
    }
  });

export type AgentLoginReportFormData = z.infer<typeof agentLoginReportSchema>;

export const totalCollectionReportSchema = z
  .object({
    fromDate: z.string().min(1, "From Date is required"),
    toDate: z.string().min(1, "To Date is required"),
    workingLevel: z.any().optional(),
    circle: z.array(z.number()).optional(),
    division: z.array(z.number()).optional(),
    subDivision: z.array(z.number()).optional(),
    section: z.array(z.number()).optional(),
    agent: z.string().optional(),
    agency: z.string().optional(),
    agencyName: z.any().optional(),
    levelWithIdMap: z.any().optional(),
    pageSize: z
      .number({ invalid_type_error: "Page size is required" })
      .min(1, "Page size is required"),
  })
  .superRefine((data, ctx) => {
    if (data.fromDate && data.toDate) {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      if (from > to) {
        ctx.addIssue({
          path: ["toDate"],
          code: z.ZodIssueCode.custom,
          message: "\'From Date\' should be before or the same as \'To Date\'",
        });
      }
    }

    const level = data.workingLevel;
    const map = data.levelWithIdMap;

    if (level === map?.SECTION) {
      if (!data.circle.length) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
      if (!data.division.length) {
        ctx.addIssue({
          path: ["division"],
          code: z.ZodIssueCode.custom,
          message: "Division is required",
        });
      }
      if (!data.subDivision.length) {
        ctx.addIssue({
          path: ["subDivision"],
          code: z.ZodIssueCode.custom,
          message: "Sub Division is required",
        });
      }
      if (!data.section.length) {
        ctx.addIssue({
          path: ["section"],
          code: z.ZodIssueCode.custom,
          message: "Section is required",
        });
      }
    } else if (level === map?.SUB_DIVISION) {
      if (!data.circle.length) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
      if (!data.division.length) {
        ctx.addIssue({
          path: ["division"],
          code: z.ZodIssueCode.custom,
          message: "Division is required",
        });
      }
      if (!data.subDivision.length) {
        ctx.addIssue({
          path: ["subDivision"],
          code: z.ZodIssueCode.custom,
          message: "Sub Division is required",
        });
      }
    } else if (level === map?.DIVISION) {
      if (!data.circle.length) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
      if (!data.division.length) {
        ctx.addIssue({
          path: ["division"],
          code: z.ZodIssueCode.custom,
          message: "Division is required",
        });
      }
    } else if (level === map?.CIRCLE) {
      if (!data.circle.length) {
        ctx.addIssue({
          path: ["circle"],
          code: z.ZodIssueCode.custom,
          message: "Circle is required",
        });
      }
    }
  });

export type TotalCollectionReportFormData = z.infer<
  typeof totalCollectionReportSchema
>;

export const viewAgentSchema = z.object({
  agencyId: z.number({
    invalid_type_error: "Agency ID is required",
    required_error: "Agency ID is required",
  }),
});

export type ViewAgentFormData = z.infer<typeof viewAgentSchema>;

export const collectionPostingReportSchema = z
  .object({
    fromDate: z.string().min(1, "From Date is required"),
    toDate: z.string().min(1, "To Date is required"),
    collectionType: z.string().optional(),
    status: z.string().optional(),
    pageSize: z
      .number({ invalid_type_error: "Page size is required" })
      .min(1, "Page size is required"),
  })
  .superRefine((data, ctx) => {
    if (data.fromDate && data.toDate) {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      if (from > to) {
        ctx.addIssue({
          path: ["toDate"],
          code: z.ZodIssueCode.custom,
          message: "\'From Date\' should be before or the same as \'To Date\'",
        });
      }
    }
  });

export type CollectionPostingReportFormData = z.infer<
  typeof collectionPostingReportSchema
>;

export const reconciliationReportSchema = z
  .object({
    fromDate: z.string().min(1, "From Date is required"),
    toDate: z.string().min(1, "To Date is required"),
    supervisor: z.string().min(1, "Supervisor is required"),
    agency: z.string().min(1, "Agency is required"),
    agencyName: z.any().optional(),
    pageSize: z
      .number({ invalid_type_error: "Page size is required" })
      .min(1, "Page size is required"),
  })
  .superRefine((data, ctx) => {
    if (data.fromDate && data.toDate) {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      if (from > to) {
        ctx.addIssue({
          path: ["toDate"],
          code: z.ZodIssueCode.custom,
          message: "\'From Date\' should be before or the same as \'To Date\'",
        });
      }
    }
  });

export type ReconciliationReportFormData = z.infer<
  typeof reconciliationReportSchema
>;

export const supervisorBankDepositTableSchema = z
  .object({
    dateFrom: z.string().min(1, "From date is required"),
    dateTo: z.string().min(1, "To date is required"),
    agencyName: z.string().optional(),
    agencyId: z.string().optional(),
    pageSize: z
      .number({
        invalid_type_error: "Page size is required",
      })
      .min(1, "Page size is required"),
  })
  .refine((data) => new Date(data.dateFrom) <= new Date(data.dateTo), {
    message: "\'From Date\' should be before or the same as \'To Date\'",
    path: ["dateTo"],
  });

export type SupervisorBankDepositTableSchemaData = z.infer<
  typeof supervisorBankDepositTableSchema
>;

export const transactionDetailsReportSchema = z
  .object({
    fromDate: z.string().min(1, "From Date is required"),
    toDate: z.string().min(1, "To Date is required"),
    workingLevel: z.any().optional(),
    circle: z.array(z.number()).optional(),
    division: z.array(z.number()).optional(),
    subDivision: z.array(z.number()).optional(),
    section: z.array(z.number()).optional(),
    agent: z.string().optional(),
    agency: z.string().optional(),
    agencyName: z.any().optional(),
    pageSize: z
      .number({ invalid_type_error: "Page size is required" })
      .min(1, "Page size is required"),
    levelWithIdMap: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fromDate && data.toDate) {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      if (from > to) {
        ctx.addIssue({
          path: ["toDate"],
          code: z.ZodIssueCode.custom,
          message: "\'From Date\' should be before or the same as \'To Date\'",
        });
      }
    }
    const level = data.workingLevel;
    const map = data.levelWithIdMap;
    if (level === map?.SECTION) {
      if (!data.circle?.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
      if (!data.division?.length) {
        ctx.addIssue({ path: ["division"], code: z.ZodIssueCode.custom, message: "Division is required" });
      }
      if (!data.subDivision?.length) {
        ctx.addIssue({ path: ["subDivision"], code: z.ZodIssueCode.custom, message: "Sub Division is required" });
      }
      if (!data.section?.length) {
        ctx.addIssue({ path: ["section"], code: z.ZodIssueCode.custom, message: "Section is required" });
      }
    } else if (level === map?.SUB_DIVISION) {
      if (!data.circle?.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
      if (!data.division?.length) {
        ctx.addIssue({ path: ["division"], code: z.ZodIssueCode.custom, message: "Division is required" });
      }
      if (!data.subDivision?.length) {
        ctx.addIssue({ path: ["subDivision"], code: z.ZodIssueCode.custom, message: "Sub Division is required" });
      }
    } else if (level === map?.DIVISION) {
      if (!data.circle?.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
      if (!data.division?.length) {
        ctx.addIssue({ path: ["division"], code: z.ZodIssueCode.custom, message: "Division is required" });
      }
    } else if (level === map?.CIRCLE) {
      if (!data.circle?.length) {
        ctx.addIssue({ path: ["circle"], code: z.ZodIssueCode.custom, message: "Circle is required" });
      }
    }
  });

export type TransactionDetailsReportFormData = z.infer<
  typeof transactionDetailsReportSchema
>;

export const agencySecurityDepositSchema = z.object({
  agencyId: z.number({ invalid_type_error: "Please select Agency" }),
  bgAmount: z
    .number({ invalid_type_error: "BG Amount is required" })
    .min(1, "BG Amount must be at least 1"),
  paymentDate: z.string().nonempty("Payment Date is required"),
  paymentMode: z.number({ invalid_type_error: "Payment Mode is required" }),
  transactionId: z.string().optional(),
  chequeDdNo: z.string().optional(),
  chequeDdDate: z.string().optional(),
  chequeDdBankName: z.string().optional(),
  bgValidityFrom: z.string().nonempty("BG Validity From is required"),
  bgValidityTo: z.string().nonempty("BG Validity To is required"),
  claimPeriod: z.string().optional(),
  remarks: z.string().optional(),
  upload: z.union([
    z
      .any()
      .optional()
      .refine(
        (val) => {
          if (!val || val.length === 0) return true;
          const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
          return allowedTypes.includes(val[0].type);
        },
        {
          message: "Only PDF, JPG, or PNG files are allowed.",
        }
      ),
    z.string(),
  ]),
});

export type AgencySecurityDepositFormData = z.infer<
  typeof agencySecurityDepositSchema
>;

export const agencySecurityDepositHistoryFilterSchema = z.object({
  agencyId: z.number({ invalid_type_error: "Agency is required" }),
  transactionId: z.string().optional(),
  createdOnFrom: z.string().optional(),
  createdOnTo: z.string().optional(),
  paymentFrom: z.string().optional(),
  paymentTo: z.string().optional(),
  pageSize: z
    .number({ invalid_type_error: "Page size is required" })
    .min(1, "Page size is required"),
});

export type AgencySecurityDepositHistoryFilterFormData = z.infer<
  typeof agencySecurityDepositHistoryFilterSchema
>;

export const posDeviceReportFilterSchema = z.object({
  pageSize: z
    .number({ invalid_type_error: "Page size is required" })
    .min(1, "Page size is required"),
});

export type PosDeviceReportFilterFormData = z.infer<
  typeof posDeviceReportFilterSchema
>;

export const agentTransferSchema = z.object({
  fromAgencyId: z.number({ required_error: 'From Agency is required' }).refine(val => !!val, 'From Agency is required'),
  toAgencyId: z.number({ required_error: 'To Agency is required' }).refine(val => !!val, 'To Agency is required'),
  agents: z.array(z.number()).min(1, 'Select at least one agent to transfer'),
}).refine(data => data.fromAgencyId !== data.toAgencyId, {
  message: 'From and To Agency must be different',
  path: ['toAgencyId'],
});

export type AgentTransferFormData = z.infer<typeof agentTransferSchema>;

export const agencyMidNightSchema = z
  .object({
    fromDate: z.string().min(1, 'From Date is Required'),
    toDate: z.string().min(1, 'To Date is Required'),
    agency: z.string().optional(),
    pageSize: z
      .number({ invalid_type_error: "Page size is required" })
      .min(1, "Page size is required"),
  })
  .superRefine((data, ctx) => {
    if (data.fromDate && data.toDate) {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      if (from > to) {
        ctx.addIssue({
          path: ["toDate"],
          code: z.ZodIssueCode.custom,
          message: "\'From Date\' should be before or the same as \'To Date\'",
        });
      }
    }
  });

export type AgencyMidNightFormData = z.infer<typeof agencyMidNightSchema>;

export const digitalPaymentCollectionSchema = z
  .object({
    fromDate: z.string().nonempty({ message: 'From Date is required' }),
    toDate: z.string().nonempty({ message: 'To Date is required' }),
    agency: z.string().optional(),
    pageSize: z.number().min(1, { message: 'Page size must be at least 1' }),
  })
  .superRefine((data, ctx) => {
    if (data.fromDate && data.toDate) {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      if (from > to) {
        ctx.addIssue({
          path: ["toDate"],
          code: z.ZodIssueCode.custom,
          message: "\'From Date\' should be before or the same as \'To Date\'",
        });
      }
    }
  });

export type DigitalPaymentCollectionFormData = z.infer<typeof digitalPaymentCollectionSchema>;

export const agencyPaymentModewiseSummarySchema = z
  .object({
    fromDate: z.string().nonempty({ message: 'From Date is required' }),
    toDate: z.string().nonempty({ message: 'To Date is required' }),
    agency: z.string().optional(),
    pageSize: z.number({ invalid_type_error: "Page size is required" }).min(1, { message: 'Page size must be at least 1' }),
  })
  .superRefine((data, ctx) => {
    if (data.fromDate && data.toDate) {
      const from = new Date(data.fromDate);
      const to = new Date(data.toDate);
      if (from > to) {
        ctx.addIssue({
          path: ["toDate"],
          code: z.ZodIssueCode.custom,
          message: "\'From Date\' should be before or the same as \'To Date\'",
        });
      }
    }
  });

export type AgencyPaymentModewiseSummaryFormData = z.infer<typeof agencyPaymentModewiseSummarySchema>;
