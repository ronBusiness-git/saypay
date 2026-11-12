import { z } from "zod";

export const amountSchema = z
    .string()
    .max(20)
    .refine((value) => {
        if (value === "") return true;

        const validFormat = /^\d+(\.\d{1,2})?$/.test(value);
        const isGreaterThanZero = /[1-9]/.test(value);

        return validFormat && isGreaterThanZero;
    }, "Amount must be greater than zero with at most 2 decimal places");

export const currencySchema = z
    .string()
    .refine(
        (value) => value === "" || /^[A-Z]{3}$/.test(value),
        "Currency must be a 3-letter uppercase code"
    );

export const sharedPaymentFields = {
    recipientName: z.string().trim().max(120),
    amount: amountSchema,
    currency: currencySchema,
    reference: z.string().trim().max(120),
    purpose: z.string().trim().max(200),
    needsClarification: z.boolean(),
    clarificationReason: z.string().trim().max(240),
};

const requiredFieldsRefinement = (data, ctx) => {
    const hasMissingRequiredField =
        !data.recipientName || !data.amount || !data.currency;

    if (hasMissingRequiredField && !data.needsClarification) {
        ctx.addIssue({
            code: "custom",
            message: "Missing required details must require clarification",
            path: ["needsClarification"],
        });
    }
};

export const intentSchema = z
    .object(sharedPaymentFields)
    .strict()
    .superRefine(requiredFieldsRefinement);

export const requestSchema = z
    .object({
        ...sharedPaymentFields,
        warningIndicators: z.array(z.string().trim().max(120)).max(10).default([]),
    })
    .strict()
    .superRefine(requiredFieldsRefinement);

export const intentInputSchema = z
    .object({
        text: z.string().trim().min(1).max(4000),
    })
    .strict();

export const requestInputSchema = z
    .object({
        requestText: z.string().trim().min(1).max(8000),
    })
    .strict();

export const explanationSchema = z
    .object({
        explanation: z.string().trim().min(1).max(500),
    })
    .strict();

export const explanationInputSchema = z
    .object({
        status: z.enum(["CLEAR", "REVIEW", "BLOCKED"]),
        reasonCodes: z.array(z.string()).default([]),
        intent: z.record(z.string(), z.any()).optional().nullable(),
        request: z.record(z.string(), z.any()).optional().nullable(),
        comparison: z.record(z.string(), z.any()).optional().nullable(),
    })
    .strict();

export const structuredErrorSchema = z
    .object({
        error: z.string(),
        retryable: z.boolean(),
        code: z.string().optional(),
    });
