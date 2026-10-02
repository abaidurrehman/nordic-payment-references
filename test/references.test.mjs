import assert from 'node:assert/strict';
import test from 'node:test';
import * as lib from '../index.js';

test('KID Mod10 and Mod11', () => {
  assert.equal(lib.generateNorwayKid('1234', { method: 'mod10' }).value, '12344');
  assert.equal(lib.generateNorwayKid('1234', { method: 'mod11' }).value, '12343');
  assert.equal(lib.generateNorwayKid('12345670112345', { method: 'mod11' }).value, '123456701123458');
  assert.equal(lib.validateNorwayKid('123456701123453', { method: 'mod10' }).valid, true);
  assert.equal(lib.validateNorwayKid('12344', { method: 'mod11' }).valid, false);
});

test('KID Mod11 dash result is reported, never invented', () => {
  let found;
  for (let n = 100; n < 400 && !found; n += 1) {
    const r = lib.generateNorwayKid(String(n), { method: 'mod11' });
    if (!r.supported) found = r;
  }
  assert.ok(found);
  assert.equal(found.value, '');
  assert.equal(found.reason, 'mod11-remainder-one');
});

test('Swedish OCR modes', () => {
  const generated = lib.generateSwedenOcrReference('12345', { mode: lib.SWEDEN_OCR_MODE.CHECK_DIGIT });
  assert.equal(lib.validateSwedenOcrReference(generated.value, { mode: 'check-digit' }).valid, true);
  const variable = lib.generateSwedenOcrReference('12345', { mode: 'variable-length' });
  assert.equal(variable.value.length, 7);
  assert.equal(lib.validateSwedenOcrReference(variable.value, { mode: 'variable-length' }).valid, true);
  const fixed = lib.generateSwedenOcrReference('12', { mode: 'fixed-length', agreedLength: 8 });
  assert.equal(fixed.value.length, 8);
  assert.equal(lib.validateSwedenOcrReference(fixed.value, { mode: 'fixed-length', agreedLength: 8 }).valid, true);
  assert.equal(lib.validateSwedenOcrReference(fixed.value, { mode: 'fixed-length', agreedLength: 9 }).valid, false);
});

test('Danish FIK 71', () => {
  const generated = lib.generateDenmarkFik71PaymentId('02684014996532');
  assert.equal(generated.value, '026840149965328');
  assert.equal(lib.generateDenmarkFik71PaymentId('123').value, '000000000001230');
  const checked = lib.validateDenmarkFik71PaymentId('026840149965329');
  assert.equal(checked.valid, false);
  assert.equal(checked.expectedCheckDigit, '8');
  const line = lib.formatDenmarkFik71Line({ paymentId: generated.value, creditorNumber: '80882939' });
  assert.equal(line.ocrLine, '+71<026840149965328+80882939<');
  assert.equal(line.peppolPaymentId, '71#026840149965328');
});

test('Finnish viitenumero (Finance Finland worked example)', () => {
  const result = lib.generateFinnishReference('123456');
  assert.equal(result.value, '1234561');
  assert.equal(result.formatted, '12 34561');
  assert.equal(lib.validateFinnishReference('12 34561').valid, true);
  assert.equal(lib.validateFinnishReference('1234562').valid, false);
  assert.throws(() => lib.generateFinnishReference('0123'), /leading zeros/);
});

test('ISO 11649 RF reference (standard example RF18 5390 0754 7034)', () => {
  const result = lib.generateRfReference('539007547034');
  assert.equal(result.reference, 'RF18539007547034');
  assert.equal(result.formatted, 'RF18 5390 0754 7034');
  assert.equal(lib.validateRfReference('RF18 5390 0754 7034').valid, true);
  assert.equal(lib.validateRfReference('RF19 5390 0754 7034').valid, false);
  assert.equal(lib.validateRfReference(lib.generateRfReference('INV2026A').reference).valid, true);
});

test('invalid input throws typed errors', () => {
  assert.throws(() => lib.generateDenmarkFik71PaymentId('ABC'), TypeError);
  assert.throws(() => lib.validateRfReference('XX12'), TypeError);
});

test('package lib stays identical to the InvoiceCraftly site source', async (t) => {
  const { readFile } = await import('node:fs/promises');
  const pairs = [
    ['check-digits.js', '../../src/features/payment-references/check-digits.js'],
    ['norway-kid.js', '../../src/features/payment-references/norway-kid.js'],
    ['sweden-ocr.js', '../../src/features/payment-references/sweden-ocr.js'],
    ['denmark-fik.js', '../../src/features/payment-references/denmark-fik.js'],
    ['finland-reference.js', '../../src/features/payment-references/finland-reference.js'],
    ['rf-creditor-reference.js', '../../src/features/invoice-utilities/rf-creditor-reference.js']
  ];
  for (const [name, rel] of pairs) {
    let site;
    try { site = await readFile(new URL(`../${rel.replace('../../', '../../')}`, import.meta.url), 'utf8'); } catch { return t.skip('site source not present (standalone checkout)'); }
    assert.equal(await readFile(new URL(`../lib/${name}`, import.meta.url), 'utf8'), site, `${name} drifted from site source`);
  }
});
