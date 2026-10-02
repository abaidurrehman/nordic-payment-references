import {
  calculateMod10CheckDigit,
  calculateNorwayMod11CheckCharacter,
  normalizeNumericReference,
  validateMod10Reference
} from './check-digits.js';

export const NORWAY_KID_METHOD = Object.freeze({
  MOD10: 'mod10',
  MOD11: 'mod11'
});

export const NORWAY_KID_LIMITS = Object.freeze({
  minTotalLength: 4,
  maxTotalLength: 25
});

function methodValue(method) {
  const normalized = String(method || '');
  if (!Object.values(NORWAY_KID_METHOD).includes(normalized)) {
    throw new TypeError('Choose KID control method Mod10 or Mod11.');
  }
  return normalized;
}

export function calculateNorwayKidCheckCharacter(stem, { method } = {}) {
  const mode = methodValue(method);
  const normalizedStem = normalizeNumericReference(stem, {
    field: 'KID stem',
    minLength: NORWAY_KID_LIMITS.minTotalLength - 1,
    maxLength: NORWAY_KID_LIMITS.maxTotalLength - 1
  });
  return mode === NORWAY_KID_METHOD.MOD10
    ? calculateMod10CheckDigit(normalizedStem)
    : calculateNorwayMod11CheckCharacter(normalizedStem);
}

export function generateNorwayKid(stem, { method, length } = {}) {
  const mode = methodValue(method);
  let normalizedStem;
  if (length !== undefined) {
    const targetLength = Number(length);
    if (!Number.isInteger(targetLength) || targetLength < NORWAY_KID_LIMITS.minTotalLength || targetLength > NORWAY_KID_LIMITS.maxTotalLength) {
      throw new RangeError(`KID length must be ${NORWAY_KID_LIMITS.minTotalLength}–${NORWAY_KID_LIMITS.maxTotalLength} digits.`);
    }
    const rawStem = normalizeNumericReference(stem, { field: 'KID stem', minLength: 1, maxLength: targetLength - 1 });
    normalizedStem = rawStem.padStart(targetLength - 1, '0');
  } else {
    normalizedStem = normalizeNumericReference(stem, {
      field: 'KID stem',
      minLength: NORWAY_KID_LIMITS.minTotalLength - 1,
      maxLength: NORWAY_KID_LIMITS.maxTotalLength - 1
    });
  }
  const checkCharacter = calculateNorwayKidCheckCharacter(normalizedStem, { method: mode });
  if (checkCharacter === '-') {
    return Object.freeze({
      valid: false,
      supported: false,
      method: mode,
      stem: normalizedStem,
      checkCharacter,
      value: '',
      reason: 'mod11-remainder-one',
      message: 'This Mod11 stem produces the documented dash control result. InvoiceCraftly will not invent a numeric KID digit; change the base number (customer/invoice number combination) or review the KID structure configured in your bank/ERP agreement.'
    });
  }
  return Object.freeze({
    valid: true,
    supported: true,
    method: mode,
    stem: normalizedStem,
    checkCharacter,
    value: `${normalizedStem}${checkCharacter}`,
    reason: '',
    message: ''
  });
}

export function validateNorwayKid(reference, { method } = {}) {
  const mode = methodValue(method);
  const value = normalizeNumericReference(reference, {
    field: 'KID',
    minLength: NORWAY_KID_LIMITS.minTotalLength,
    maxLength: NORWAY_KID_LIMITS.maxTotalLength
  });

  if (mode === NORWAY_KID_METHOD.MOD10) {
    const result = validateMod10Reference(value, {
      field: 'KID',
      minLength: NORWAY_KID_LIMITS.minTotalLength,
      maxLength: NORWAY_KID_LIMITS.maxTotalLength
    });
    return Object.freeze({ ...result, method: mode, supported: true, reason: result.valid ? '' : 'check-digit-mismatch' });
  }

  const stem = value.slice(0, -1);
  const actualCheckDigit = value.at(-1);
  const expectedCheckCharacter = calculateNorwayMod11CheckCharacter(stem);
  if (expectedCheckCharacter === '-') {
    return Object.freeze({
      value,
      stem,
      method: mode,
      actualCheckDigit,
      expectedCheckDigit: '',
      expectedCheckCharacter,
      valid: false,
      supported: false,
      reason: 'mod11-remainder-one'
    });
  }
  return Object.freeze({
    value,
    stem,
    method: mode,
    actualCheckDigit,
    expectedCheckDigit: expectedCheckCharacter,
    expectedCheckCharacter,
    valid: actualCheckDigit === expectedCheckCharacter,
    supported: true,
    reason: actualCheckDigit === expectedCheckCharacter ? '' : 'check-digit-mismatch'
  });
}
