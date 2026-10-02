import {
  calculateMod10CheckDigit,
  normalizeNumericReference,
  validateMod10Reference
} from './check-digits.js';

export const SWEDEN_OCR_MODE = Object.freeze({
  SOFT: 'soft',
  CHECK_DIGIT: 'check-digit',
  VARIABLE_LENGTH: 'variable-length',
  FIXED_LENGTH: 'fixed-length'
});

export const SWEDEN_OCR_LIMITS = Object.freeze({
  minTotalLength: 2,
  maxTotalLength: 25
});

function normalizeMode(mode) {
  const value = String(mode || '');
  if (!Object.values(SWEDEN_OCR_MODE).includes(value)) {
    throw new TypeError('Choose an OCR control mode.');
  }
  return value;
}

function normalizeReference(reference, minLength = SWEDEN_OCR_LIMITS.minTotalLength) {
  return normalizeNumericReference(reference, {
    field: 'OCR reference',
    minLength,
    maxLength: SWEDEN_OCR_LIMITS.maxTotalLength
  });
}

function expectedVariableLengthDigit(totalLength) {
  return String(totalLength % 10);
}

function normalizeAgreedLengths({ agreedLength, lengths } = {}) {
  const raw = lengths !== undefined ? lengths : (agreedLength !== undefined ? [agreedLength] : undefined);
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 2) {
    throw new RangeError('Fixed-length OCR control requires one or two agreed lengths from the bank agreement.');
  }
  return raw.map((entry) => {
    const numericLength = Number(entry);
    if (!Number.isInteger(numericLength)
      || numericLength < SWEDEN_OCR_LIMITS.minTotalLength
      || numericLength > SWEDEN_OCR_LIMITS.maxTotalLength) {
      throw new RangeError(`Agreed OCR length must be ${SWEDEN_OCR_LIMITS.minTotalLength}–${SWEDEN_OCR_LIMITS.maxTotalLength} digits.`);
    }
    return numericLength;
  });
}

export function validateSwedenOcrReference(reference, { mode, agreedLength, lengths } = {}) {
  const controlMode = normalizeMode(mode);
  const value = normalizeReference(reference, controlMode === SWEDEN_OCR_MODE.VARIABLE_LENGTH ? 3 : 2);
  const check = validateMod10Reference(value, {
    field: 'OCR reference',
    minLength: controlMode === SWEDEN_OCR_MODE.VARIABLE_LENGTH ? 3 : 2,
    maxLength: SWEDEN_OCR_LIMITS.maxTotalLength
  });

  let lengthValid = true;
  let actualLengthDigit = null;
  let expectedLengthDigit = null;
  let normalizedAgreedLengths = null;

  if (controlMode === SWEDEN_OCR_MODE.VARIABLE_LENGTH) {
    actualLengthDigit = value.at(-2);
    expectedLengthDigit = expectedVariableLengthDigit(value.length);
    lengthValid = actualLengthDigit === expectedLengthDigit;
  } else if (controlMode === SWEDEN_OCR_MODE.FIXED_LENGTH) {
    normalizedAgreedLengths = normalizeAgreedLengths({ agreedLength, lengths });
    lengthValid = normalizedAgreedLengths.includes(value.length);
  }

  const bankBehaviour = !check.valid
    ? (controlMode === SWEDEN_OCR_MODE.SOFT ? 'warn' : 'reject')
    : lengthValid ? 'accept' : 'reject';

  return Object.freeze({
    mode: controlMode,
    value,
    valid: check.valid && lengthValid,
    checkDigitValid: check.valid,
    actualCheckDigit: check.actualCheckDigit,
    expectedCheckDigit: check.expectedCheckDigit,
    lengthValid,
    actualLength: value.length,
    actualLengthDigit,
    expectedLengthDigit,
    agreedLength: normalizedAgreedLengths ? normalizedAgreedLengths[0] : null,
    agreedLengths: normalizedAgreedLengths,
    bankBehaviour,
    reason: !check.valid
      ? (controlMode === SWEDEN_OCR_MODE.SOFT ? 'check-digit-warning' : 'check-digit-mismatch')
      : !lengthValid
        ? controlMode === SWEDEN_OCR_MODE.VARIABLE_LENGTH ? 'length-digit-mismatch' : 'fixed-length-mismatch'
        : ''
  });
}

export function generateSwedenOcrReference(base, { mode, agreedLength, lengths } = {}) {
  const controlMode = normalizeMode(mode);
  const clean = normalizeNumericReference(base, {
    field: 'OCR base',
    minLength: 1,
    maxLength: SWEDEN_OCR_LIMITS.maxTotalLength - 1
  });

  let body = clean;
  let lengthDigit = null;
  let agreedLengthUsed = null;

  if (controlMode === SWEDEN_OCR_MODE.VARIABLE_LENGTH) {
    const total = body.length + 2;
    if (total > SWEDEN_OCR_LIMITS.maxTotalLength) {
      throw new RangeError('OCR base is too long for variable-length control.');
    }
    lengthDigit = expectedVariableLengthDigit(total);
    body += lengthDigit;
  } else if (controlMode === SWEDEN_OCR_MODE.FIXED_LENGTH) {
    const normalizedAgreedLengths = normalizeAgreedLengths({ agreedLength, lengths });
    const target = [...normalizedAgreedLengths].sort((a, b) => a - b).find((candidate) => candidate - 1 >= body.length);
    if (target === undefined) {
      throw new RangeError('OCR base is too long for the agreed fixed length(s).');
    }
    agreedLengthUsed = target;
    body = body.padStart(target - 1, '0');
  }

  const checkDigit = calculateMod10CheckDigit(body);
  return Object.freeze({
    mode: controlMode,
    base: clean,
    value: body + checkDigit,
    checkDigit,
    lengthDigit,
    agreedLength: agreedLengthUsed
  });
}
