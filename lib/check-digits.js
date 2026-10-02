function requireDigits(value, { field = 'Reference', minLength = 1, maxLength = 100 } = {}) {
  const normalized = String(value ?? '').replace(/\s+/g, '');
  if (!normalized) throw new TypeError(`${field} is required.`);
  if (!/^\d+$/.test(normalized)) throw new TypeError(`${field} must contain digits only.`);
  if (normalized.length < minLength || normalized.length > maxLength) {
    throw new RangeError(`${field} must contain ${minLength === maxLength ? minLength : `${minLength}–${maxLength}`} digits.`);
  }
  return normalized;
}

export function normalizeNumericReference(value, options = {}) {
  return requireDigits(value, options);
}

export function calculateMod10CheckDigit(stem) {
  const value = requireDigits(stem, { field: 'Reference stem', minLength: 1, maxLength: 100 });
  let sum = 0;
  let weight = 2;
  for (let index = value.length - 1; index >= 0; index -= 1) {
    const product = Number(value[index]) * weight;
    sum += product > 9 ? product - 9 : product;
    weight = weight === 2 ? 1 : 2;
  }
  return String((10 - (sum % 10)) % 10);
}

export function validateMod10Reference(reference, { minLength = 2, maxLength = 100, field = 'Reference' } = {}) {
  const value = requireDigits(reference, { field, minLength, maxLength });
  const stem = value.slice(0, -1);
  const actualCheckDigit = value.at(-1);
  const expectedCheckDigit = calculateMod10CheckDigit(stem);
  return Object.freeze({
    value,
    stem,
    actualCheckDigit,
    expectedCheckDigit,
    valid: actualCheckDigit === expectedCheckDigit
  });
}

export function calculateNorwayMod11CheckCharacter(stem) {
  const value = requireDigits(stem, { field: 'KID stem', minLength: 1, maxLength: 100 });
  const weights = [2, 3, 4, 5, 6, 7];
  let sum = 0;
  for (let index = value.length - 1, weightIndex = 0; index >= 0; index -= 1, weightIndex += 1) {
    sum += Number(value[index]) * weights[weightIndex % weights.length];
  }
  const remainder = sum % 11;
  if (remainder === 0) return '0';
  if (remainder === 1) return '-';
  return String(11 - remainder);
}

export function calculateFinnishReferenceCheckDigit(stem) {
  const value = requireDigits(stem, { field: 'Reference stem', minLength: 1, maxLength: 100 });
  const weights = [7, 3, 1];
  let sum = 0;
  for (let index = value.length - 1, weightIndex = 0; index >= 0; index -= 1, weightIndex += 1) {
    sum += Number(value[index]) * weights[weightIndex % weights.length];
  }
  return String((10 - (sum % 10)) % 10);
}
