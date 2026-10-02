import {
  calculateFinnishReferenceCheckDigit,
  normalizeNumericReference
} from './check-digits.js';

export const FINNISH_REFERENCE_LIMITS = Object.freeze({
  minStemLength: 3,
  maxStemLength: 19,
  minTotalLength: 4,
  maxTotalLength: 20
});

function normalizeStem(stem) {
  const value = normalizeNumericReference(stem, {
    field: 'Finnish reference stem',
    minLength: FINNISH_REFERENCE_LIMITS.minStemLength,
    maxLength: FINNISH_REFERENCE_LIMITS.maxStemLength
  });
  if (value.startsWith('0')) throw new TypeError('Finnish reference numbers must not include leading zeros.');
  return value;
}

export function formatFinnishReference(reference) {
  const value = normalizeNumericReference(reference, {
    field: 'Finnish reference number',
    minLength: FINNISH_REFERENCE_LIMITS.minTotalLength,
    maxLength: FINNISH_REFERENCE_LIMITS.maxTotalLength
  });
  const groups = [];
  for (let end = value.length; end > 0; end -= 5) groups.unshift(value.slice(Math.max(0, end - 5), end));
  return groups.join(' ');
}

export function generateFinnishReference(stem) {
  const normalizedStem = normalizeStem(stem);
  const checkDigit = calculateFinnishReferenceCheckDigit(normalizedStem);
  const value = `${normalizedStem}${checkDigit}`;
  return Object.freeze({
    valid: true,
    stem: normalizedStem,
    checkDigit,
    value,
    formatted: formatFinnishReference(value)
  });
}

export function validateFinnishReference(reference) {
  const value = normalizeNumericReference(reference, {
    field: 'Finnish reference number',
    minLength: FINNISH_REFERENCE_LIMITS.minTotalLength,
    maxLength: FINNISH_REFERENCE_LIMITS.maxTotalLength
  });
  if (value.startsWith('0')) throw new TypeError('Finnish reference numbers must not include leading zeros.');
  const stem = value.slice(0, -1);
  const actualCheckDigit = value.at(-1);
  const expectedCheckDigit = calculateFinnishReferenceCheckDigit(stem);
  return Object.freeze({
    value,
    formatted: formatFinnishReference(value),
    stem,
    actualCheckDigit,
    expectedCheckDigit,
    valid: actualCheckDigit === expectedCheckDigit
  });
}
