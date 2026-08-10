export interface PlacePhoneNumber {
  number: string;
  label?: string;
}

export function normalizePhoneNumbers(
  phoneNumbers: readonly PlacePhoneNumber[] | null | undefined,
): PlacePhoneNumber[] {
  return (phoneNumbers ?? []).flatMap(({ number, label }) => {
    const trimmedNumber = number.trim();
    if (!trimmedNumber) return [];

    const trimmedLabel = label?.trim();
    return [
      {
        number: trimmedNumber,
        ...(trimmedLabel ? { label: trimmedLabel } : {}),
      },
    ];
  });
}

export function getEffectivePhoneNumbers(
  phoneNumbers: readonly PlacePhoneNumber[] | null | undefined,
  legacyPhone?: string | null,
): PlacePhoneNumber[] {
  const normalizedPhoneNumbers = normalizePhoneNumbers(phoneNumbers);
  if (normalizedPhoneNumbers.length > 0) {
    return normalizedPhoneNumbers;
  }

  const fallbackPhone = legacyPhone?.trim();
  return fallbackPhone ? [{ number: fallbackPhone }] : [];
}

export function buildPlacePhoneContact<
  T extends {
    phone?: string;
    phoneNumbers?: readonly PlacePhoneNumber[];
  },
>(contact: T): T & { phone: string; phoneNumbers: PlacePhoneNumber[] } {
  const phoneNumbers = normalizePhoneNumbers(contact.phoneNumbers);

  return {
    ...contact,
    phoneNumbers,
    phone: phoneNumbers[0]?.number ?? "",
  };
}
