# Changelog

## Unreleased

### Added

- Token-free npm releases through GitHub Actions and npm Trusted Publishing, with tag-to-package-version validation, tests, and a package dry run before publishing.
- A maintainer release runbook covering versioning, publishing, verification, smoke testing, and failure recovery.

## 0.1.0 - 2026-10-02

### Added

- Generation and validation for Norwegian KID using Mod10 or Mod11, including explicit handling of unsupported Mod11 remainder-one results.
- Generation and validation for Swedish OCR references in soft, check-digit, variable-length, and fixed-length modes.
- Generation, validation, normalization, and OCR/Peppol formatting helpers for Danish FIK 71 payment references.
- Generation, validation, and display formatting for Finnish viitenumero references.
- Generation, validation, and display formatting for ISO 11649 RF creditor references.
- Public check-digit helpers, reference constants and limits, ESM exports, and TypeScript declarations.
- Zero-runtime-dependency support for Node.js 18+ and modern browsers.
