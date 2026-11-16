export const MOBILE_PHONE_REGEX = /^[0-9]{9,12}$/;

/**
 * Validates mobile number according to TT-10:
 * - Optional: empty, null, undefined is valid.
 * - When provided: 9 to 12 English digits only (0-9).
 * - Preserves leading zeroes.
 */
export function isValidMobilePhone(value) {
    if (value === null || value === undefined) return true;
    const str = String(value).trim();
    if (str === "") return true;
    return MOBILE_PHONE_REGEX.test(str);
}

export const isValidMobile = isValidMobilePhone;
