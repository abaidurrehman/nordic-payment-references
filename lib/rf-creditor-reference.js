const MAX_BODY_LENGTH = 21;
const CHECK_DIGIT_PATTERN = /^\d{2}$/;
const BODY_CHARSET_PATTERN = /^[A-Z0-9]+$/;

function expandToDigits(value) {
  return value
    .split('')
    .map((char) => (/[0-9]/.test(char) ? char : String(char.charCodeAt(0) - 55)))
    .join('');
}

function mod9710(digits) {
  let remainder = 0;
  for (const digit of digits) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder;
}

function formatGroups(reference) {
  return reference.match(/.{1,4}/g).join(' ');
}

function normalizeBody(rawBody) {
  const body = String(rawBody || '').replace(/\s+/g, '').toUpperCase();
  if (!body) {
    throw new TypeError('Enter the reference you want to add ISO 11649 check digits to.');
  }
  if (!BODY_CHARSET_PATTERN.test(body)) {
    throw new TypeError('The reference may contain letters and numbers only.');
  }
  if (body.length > MAX_BODY_LENGTH) {
    throw new RangeError(`The reference body must be at most ${MAX_BODY_LENGTH} characters.`);
  }
  return body;
}

export function generateRfReference(rawBody) {
  const body = normalizeBody(rawBody);
  const remainder = mod9710(expandToDigits(`${body}RF00`));
  const checkDigits = String(98 - remainder).padStart(2, '0');
  const reference = `RF${checkDigits}${body}`;
  return Object.freeze({
    reference,
    formatted: formatGroups(reference),
    checkDigits,
    body
  });
}

export function validateRfReference(rawReference) {
  const compact = String(rawReference || '').replace(/\s+/g, '').toUpperCase();
  if (compact.length < 5) {
    throw new TypeError('Enter a complete RF creditor reference.');
  }
  if (!compact.startsWith('RF')) {
    throw new TypeError('An RF creditor reference must start with RF.');
  }
  const checkDigits = compact.slice(2, 4);
  const body = compact.slice(4);
  if (!CHECK_DIGIT_PATTERN.test(checkDigits)) {
    throw new TypeError('The check digits must be two numbers immediately after RF.');
  }
  if (!BODY_CHARSET_PATTERN.test(body)) {
    throw new TypeError('The reference may contain letters and numbers only.');
  }
  if (body.length > MAX_BODY_LENGTH) {
    throw new RangeError(`The reference body must be at most ${MAX_BODY_LENGTH} characters.`);
  }

  const remainder = mod9710(expandToDigits(`${body}RF${checkDigits}`));
  return Object.freeze({
    valid: remainder === 1,
    reference: compact,
    formatted: formatGroups(compact),
    checkDigits,
    body
  });
}
