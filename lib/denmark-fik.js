import {
  calculateMod10CheckDigit,
  normalizeNumericReference,
  validateMod10Reference
} from './check-digits.js';

export const DENMARK_FIK_71 = Object.freeze({
  cardType: '71',
  paymentIdStemLength: 14,
  paymentIdLength: 15,
  creditorNumberLength: 8
});

function normalizePaymentIdStem(value) {
  const normalized = normalizeNumericReference(value, {
    field: 'Betalings-ID-grundlag',
    minLength: 1,
    maxLength: DENMARK_FIK_71.paymentIdStemLength
  });
  return normalized.padStart(DENMARK_FIK_71.paymentIdStemLength, '0');
}

export function generateDenmarkFik71PaymentId(stem) {
  const normalizedStem = normalizePaymentIdStem(stem);
  const checkDigit = calculateMod10CheckDigit(normalizedStem);
  return Object.freeze({
    cardType: DENMARK_FIK_71.cardType,
    stem: normalizedStem,
    checkDigit,
    value: `${normalizedStem}${checkDigit}`
  });
}

export function validateDenmarkFik71PaymentId(paymentId) {
  const check = validateMod10Reference(paymentId, {
    field: 'FIK 71 betalings-ID',
    minLength: DENMARK_FIK_71.paymentIdLength,
    maxLength: DENMARK_FIK_71.paymentIdLength
  });
  return Object.freeze({
    cardType: DENMARK_FIK_71.cardType,
    ...check,
    reason: check.valid ? '' : 'check-digit-mismatch'
  });
}

export function normalizeDenmarkFikCreditorNumber(creditorNumber) {
  return normalizeNumericReference(creditorNumber, {
    field: 'Kreditornummer',
    minLength: DENMARK_FIK_71.creditorNumberLength,
    maxLength: DENMARK_FIK_71.creditorNumberLength
  });
}

export function formatDenmarkFik71Line({ paymentId, creditorNumber }) {
  const paymentCheck = validateDenmarkFik71PaymentId(paymentId);
  if (!paymentCheck.valid) {
    throw new RangeError(`FIK 71 betalings-ID har forkert Mod10-kontrolciffer. Forventet ${paymentCheck.expectedCheckDigit}.`);
  }
  const creditor = normalizeDenmarkFikCreditorNumber(creditorNumber);
  return Object.freeze({
    cardType: DENMARK_FIK_71.cardType,
    paymentId: paymentCheck.value,
    creditorNumber: creditor,
    peppolPaymentId: `${DENMARK_FIK_71.cardType}#${paymentCheck.value}`,
    ocrLine: `+${DENMARK_FIK_71.cardType}<${paymentCheck.value}+${creditor}<`
  });
}
