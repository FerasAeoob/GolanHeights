import { z } from "zod";

const PhoneNumberSchema = z
  .object({
    number: z
      .string()
      .trim()
      .min(1, "PHONE_NUMBER_REQUIRED")
      .max(50, "PHONE_NUMBER_TOO_LONG"),
    label: z.string().trim().max(50, "PHONE_LABEL_TOO_LONG").optional(),
  })
  .transform(({ number, label }) => ({
    number,
    ...(label ? { label } : {}),
  }));

export const PlaceContactSchema = z
  .object({
    phone: z.string().trim().optional(),
    phoneNumbers: z.array(PhoneNumberSchema).optional(),
    website: z.string().optional(),
    instagram: z.string().optional(),
    instagramHandle: z.string().max(50).optional(),
    bookingLink: z.string().optional(),
  })
  .transform((contact) => {
    if (contact.phoneNumbers === undefined) {
      return contact;
    }

    return {
      ...contact,
      phone: contact.phoneNumbers[0]?.number ?? "",
    };
  });
