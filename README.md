# nordic-payment-references

Generate **and** validate Nordic invoice payment references. Zero dependencies, ESM, TypeScript types, runs in Node 18+ and the browser.

| Country | Reference | Functions |
|---|---|---|
| Norway | KID (Mod10 or Mod11) | `generateNorwayKid`, `validateNorwayKid` |
| Sweden | OCR (soft, check digit, variable length, fixed length) | `generateSwedenOcrReference`, `validateSwedenOcrReference` |
| Denmark | FIK 71 betalings-ID | `generateDenmarkFik71PaymentId`, `validateDenmarkFik71PaymentId`, `formatDenmarkFik71Line` |
| Finland | Viitenumero (7-3-1) | `generateFinnishReference`, `validateFinnishReference` |
| International | ISO 11649 RF creditor reference | `generateRfReference`, `validateRfReference` |

```js
import { generateNorwayKid, generateFinnishReference, generateRfReference, validateRfReference } from 'nordic-payment-references';

generateNorwayKid('1234', { method: 'mod10' }).value;   // "12344"
generateFinnishReference('123456').formatted;           // "12 34561"
generateRfReference('539007547034').formatted;          // "RF18 5390 0754 7034"
validateRfReference('RF18 5390 0754 7034').valid;       // true
```

## Notes
- KID Mod11 can produce a "dash" remainder. The library reports `supported: false` instead of inventing a digit.
- Swedish OCR fixed-length and Danish creditor numbers depend on your bank agreement. Check them with your bank.
- This validates structure and check digits only. It cannot confirm a reference is registered with a bank.

## Try it online
Browser-local tools using the same logic: [Norwegian KID](https://invoicecraftly.com/no/verktoy/kid-nummer/), [Swedish OCR](https://invoicecraftly.com/se/verktyg/ocr-referens/), [Danish FIK](https://invoicecraftly.com/dk/vaerktojer/fik-betalingsreference/), [Finnish viitenumero](https://invoicecraftly.com/fi/tyokalut/viitenumero/), [RF creditor reference](https://invoicecraftly.com/tools/rf-creditor-reference).

MIT licensed. Maintained by [InvoiceCraftly](https://invoicecraftly.com).

## Maintainers

See [RELEASING.md](RELEASING.md) for the npm Trusted Publishing release runbook.
