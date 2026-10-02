export function calculateMod10CheckDigit(stem: string): string;
export function calculateNorwayMod11CheckCharacter(stem: string): string;
export function calculateFinnishReferenceCheckDigit(stem: string): string;
export function validateMod10Reference(reference: string, options?: { minLength?: number; maxLength?: number; field?: string }): {
  value: string; stem: string; actualCheckDigit: string; expectedCheckDigit: string; valid: boolean;
};

export const NORWAY_KID_METHOD: { readonly MOD10: 'mod10'; readonly MOD11: 'mod11' };
export const NORWAY_KID_LIMITS: { readonly minTotalLength: 4; readonly maxTotalLength: 25 };
export type KidMethod = 'mod10' | 'mod11';
export function calculateNorwayKidCheckCharacter(stem: string, options: { method: KidMethod }): string;
export function generateNorwayKid(stem: string, options: { method: KidMethod; length?: number }): {
  valid: boolean; supported: boolean; method: KidMethod; stem: string; checkCharacter: string; value: string; reason: string; message: string;
};
export function validateNorwayKid(reference: string, options: { method: KidMethod }): {
  value: string; stem: string; method: KidMethod; actualCheckDigit: string; expectedCheckDigit: string;
  expectedCheckCharacter?: string; valid: boolean; supported: boolean; reason: string;
};

export const SWEDEN_OCR_MODE: {
  readonly SOFT: 'soft'; readonly CHECK_DIGIT: 'check-digit'; readonly VARIABLE_LENGTH: 'variable-length'; readonly FIXED_LENGTH: 'fixed-length';
};
export const SWEDEN_OCR_LIMITS: { readonly minTotalLength: 2; readonly maxTotalLength: 25 };
export type OcrMode = 'soft' | 'check-digit' | 'variable-length' | 'fixed-length';
export interface OcrOptions { mode: OcrMode; agreedLength?: number; lengths?: number[] }
export function generateSwedenOcrReference(base: string, options: OcrOptions): {
  mode: OcrMode; base: string; value: string; checkDigit: string; lengthDigit: string | null; agreedLength: number | null;
};
export function validateSwedenOcrReference(reference: string, options: OcrOptions): {
  mode: OcrMode; value: string; valid: boolean; checkDigitValid: boolean; actualCheckDigit: string; expectedCheckDigit: string;
  lengthValid: boolean; actualLength: number; actualLengthDigit: string | null; expectedLengthDigit: string | null;
  agreedLength: number | null; agreedLengths: number[] | null; bankBehaviour: 'accept' | 'warn' | 'reject'; reason: string;
};

export const DENMARK_FIK_71: { readonly cardType: '71'; readonly paymentIdStemLength: 14; readonly paymentIdLength: 15; readonly creditorNumberLength: 8 };
export function generateDenmarkFik71PaymentId(stem: string): { cardType: '71'; stem: string; checkDigit: string; value: string };
export function validateDenmarkFik71PaymentId(paymentId: string): {
  cardType: '71'; value: string; stem: string; actualCheckDigit: string; expectedCheckDigit: string; valid: boolean; reason: string;
};
export function normalizeDenmarkFikCreditorNumber(creditorNumber: string): string;
export function formatDenmarkFik71Line(input: { paymentId: string; creditorNumber: string }): {
  cardType: '71'; paymentId: string; creditorNumber: string; peppolPaymentId: string; ocrLine: string;
};

export const FINNISH_REFERENCE_LIMITS: { readonly minStemLength: 3; readonly maxStemLength: 19; readonly minTotalLength: 4; readonly maxTotalLength: 20 };
export function formatFinnishReference(reference: string): string;
export function generateFinnishReference(stem: string): { valid: true; stem: string; checkDigit: string; value: string; formatted: string };
export function validateFinnishReference(reference: string): {
  value: string; formatted: string; stem: string; actualCheckDigit: string; expectedCheckDigit: string; valid: boolean;
};

export function generateRfReference(body: string): { reference: string; formatted: string; checkDigits: string; body: string };
export function validateRfReference(reference: string): { valid: boolean; reference: string; formatted: string; checkDigits: string; body: string };
