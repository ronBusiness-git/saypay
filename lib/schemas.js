import { z } from "zod";

const amountSchema = z
    .string()
    .max(20)
    .refine((value) => {
        if (value === "") return true;

        const validFormat = /^\d+(\.\d{1,2})?$/.test(value);
        const isGreaterThanZero = /[1-9]/.test(value);

        return validFormat && isGreaterThanZero;
    }, "Amount must be greater than zero with at most 2 decimal places");

const currencySchema = z
    .string()
    .refine(
        (value) => value === "" || /^[A-Z]{3}$/.test(value),
        "Currency must be a 3-letter uppercase code"
    );

const sharedPaymentFields = {
    recipientName: z.string().trim().max(120),
    amount: amountSchema,
    currency: currencySchema,
    reference: z.string().trim().max(120),
    purpose: z.string().trim().max(200),
    needsClarification: z.boolean(),
    clarificationReason: z.string().trim().max(240),
};

const requiredFieldsSchema = z
    .object(sharedPaymentFields)
    .strict()
    .superRefine((data, ctx) => {
        const hasMissingRequiredField =
            !data.recipientName || !data.amount || !data.currency;

        if (hasMissingRequiredField && !data.needsClarification) {
            ctx.addIssue({
                code: "custom",
                message: "Missing required details must require clarification",
                path: ["needsClarification"],
            });
        }
    });

export const intentSchema = requiredFieldsSchema;

export const requestSchema = z
    .object({
        ...sharedPaymentFields,
        warningIndicators: z.array(z.string().trim().max(120)).max(10),
    })
    .strict()
    .superRefine((data, ctx) => {
        const hasMissingRequiredField =
            !data.recipientName || !data.amount || !data.currency;

        if (hasMissingRequiredField && !data.needsClarification) {
            ctx.addIssue({
                code: "custom",
                message: "Missing required details must require clarification",
                path: ["needsClarification"],
            });
        }
    });

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