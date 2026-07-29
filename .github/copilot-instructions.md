# MMO FES PDF Service - AI Coding Agent Instructions

## Project Overview
This is a Node.js service for the UK Marine Management Organisation (MMO) that generates, parses, and manages PDF documents for fisheries export certificates. It handles three document types: Catch/Export Certificates, Processing Statements, and Storage Documents.

## Architecture

### Core Components
- **`src/pdfService.js`**: Main service orchestrator that coordinates PDF generation, parsing, and Azure Blob Storage operations
- **`src/pdf/pdfRenderer.js`**: Routes document type to appropriate renderer (6 types: blank/filled versions of 3 document types)
- **`src/pdf/pdfParser.js`**: Extracts and identifies document data from PDF buffers using text extraction and digital form parsing
- **`src/storage/blobManager.js`**: Azure Blob Storage interface using `@azure/storage-blob` SDK
- **`src/index.js`**: Public API surface - only modify exports here when adding new public methods

### Document Type Patterns
Documents follow a strict naming convention: `GBR-YYYY-{CC|PS|SD|CM|PM|SM}-IDENTIFIER`
- `CC`/`CM` = Catch Certificate → `CatchCertificate` journey
- `PS`/`PM` = Processing Statement → `ProcessingStatement` journey  
- `SD`/`SM` = Storage Document → `StorageDocument` journey

The `getJourneyName()` function in `pdfService.js` maps these codes to journey names used in blob paths.

### PDF Generation Flow
1. `generatePdfAndUpload()` creates Azure container and blob
2. Calls `renderPdf()` which dispatches to type-specific renderer (e.g., `renderExportCert.js`)
3. Renderers use `mmoPdfUtils.js` (drawing utilities) and `mmoPdfStyles.js` (constants) with PDFKit
4. QR codes generated via `qr-image` library and embedded for validation
5. Stream-based uploads to Azure Blob Storage using Node.js PassThrough streams

### PDF Parsing Flow
1. `parsePdfBuffer()` extracts text using custom `pdf-text-extraction/` utilities built on `muhammara`
2. `identifyPdf()` detects document type by analyzing text placement arrays and document number
3. Type-specific parsers (e.g., `parseExportCert.js`) use `PDFDigitalForm` class to extract form field key-value pairs
4. Field keys are defined as constants (e.g., `EXPORTER_ADDRESS_KEY`, `VESSEL_REP_KEY`) for maintainability

## Development Workflows

### Testing
```bash
npm test                 # Unit tests with coverage (requires 90%+ coverage)
npm run test:integration # Integration tests (requires Azure connection string)
npm run test-vstack      # Silent test run used in build.sh
```

**Test Structure**: 
- Unit tests in `tests/unit/` follow `.spec.js` convention
- Mock Azure storage in `__mocks__/azure-storage.js` and setup in `tests/mocks/setup.js`
- Use Jest spies extensively (see `pdfService.spec.js` for mocking `blobManager` methods)
- Output PDFs written to `tests/unit/{type}/output/` for visual verification

### Environment Variables
Required configuration (see `src/config.js`):
- `AZURE_STORAGE_CONNECTION_STRING` or `BLOB_STORAGE_CONNECTION` - Azure Blob Storage connection
- `SERVICE_URL` - Base URL for QR code generation (points to certificate validation endpoint)
- `AZURE_STORAGE_PROXY_URL`, `BASE_URL` - Proxy/base URLs for different environments

### GitFlow Branching Strategy
**CRITICAL**: Branch names must match patterns or Azure Pipeline fails:
- `main` (production)
- `develop` (integration)
- `feature/*`, `epic/*` (development)
- `release/*`, `hotfix/*` (deployment)

See `azure-pipelines.yml` trigger section and GitFlow diagram in README.

## Code Conventions

### Module Exports Pattern
Use explicit named exports at module bottom:
```javascript
module.exports.functionName = functionName;
module.exports.anotherFunction = anotherFunction;
```
Never export inline or use shorthand object syntax - maintain consistency with existing codebase.

### PDF Styling
- All dimensions/colors defined in `src/pdf/mmoPdfStyles.js` (margins, fonts, colors)
- Use `mmoPdfUtils.js` helper functions: `label()`, `labelBold()`, `tableHeaderCell()`, `qrCode()`, etc.
- Never hardcode positions - calculate from `PdfStyle.MARGIN` constants
- Accessibility: Use `doc.struct('Figure', {alt: '...'})` for images, set `Tabs: 'S'` for tab order

### Stream-Based Architecture
All Azure Blob uploads use Node.js streams (see `blobManager.writeStreamForBlob()`):
- PDFKit docs pipe directly to Azure upload streams (no disk I/O)
- `PassThrough` streams enable async upload while rendering continues
- Always call `stream.end()` after writing buffer data (zip uploads, overwrites)

### Resource Management
- Fonts loaded from `src/resources/fonts/`
- Template PDFs and images in `src/resources/`
- Use `path.join(__dirname, '../resources/...')` for cross-platform compatibility

## Common Tasks

### Adding a New PDF Document Type
1. Create renderer in `src/pdf/render{TypeName}.js` following existing patterns
2. Add `pdfType` constant to `pdfRenderer.js` and new case in `renderPdf()` switch
3. Create parser in `src/pdf/parse{TypeName}.js` if document needs parsing
4. Add case to `pdfParser.js` `parsePdfBuffer()` switch and update `identifyPdf()`
5. Write unit tests in `tests/unit/{type}/` with sample output directory
6. Update journey mapping in `getJourneyName()` if new document code introduced

### Modifying Table Structures
Multi-row data (fishing vessels, catch products) use dynamic table generation:
- Blank templates iterate with fixed `pageSize` (e.g., 14 rows in `processBlankTemplate()`)
- Data-driven templates iterate actual data arrays (see `processMultiData()` in renderers)
- Always maintain page structure with `endOfPage()` call and page numbering

### Debugging PDF Issues
1. Check `tests/unit/{type}/output/` for rendered PDF samples
2. Use `npm run test:integration` with real Azure storage to verify uploads
3. For parsing issues, examine `pdf-text-extraction/placements-extraction.js` text positioning
4. QR codes require valid `SERVICE_URL` - check mock setup in tests

## Key Files Reference
- **Public API**: `src/index.js`
- **Orchestration**: `src/pdfService.js`
- **Rendering**: `src/pdf/render*.js` (6 renderers)
- **Parsing**: `src/pdf/parse*.js` (3 parsers), `src/utils/pdf-digital-form.js`
- **Utilities**: `src/pdf/mmoPdfUtils.js`, `src/pdf/mmoPdfStyles.js`, `src/utils/common-utils.js`
- **Storage**: `src/storage/blobManager.js`, `src/storage/sas/tokenGenerator.js`
- **Config**: `src/config.js`, `tests/mocks/setup.js` (test env vars)

## Dependencies Notes
- **PDFKit 0.15.1**: PDF generation (locked version - do not upgrade without testing)
- **muhammara**: PDF reading/manipulation (successor to HummusJS)
- **@azure/storage-blob**: Azure SDK v12+ (uses connection strings, not account keys)
- **qr-image**: QR code generation (synchronous, returns streams)
- **Jest 29**: Testing framework with strict coverage thresholds (see `package.json`)

## Standards precedence (highest wins)

When guidance conflicts, follow this order:

1. **DEFRA Software Development Standards** (mandatory) — https://defra.github.io/software-development-standards/
2. **DEFRA Digital Service Manual** — https://digital.defra.gov.uk/service-manual
3. **GOV.UK Service Standard & Service Manual (GDS)** — https://www.gov.uk/service-manual
4. **Community best practice** — [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/), [12-factor](https://12factor.net/), widely-adopted Node.js/JavaScript patterns

> **DEFRA takes precedence over GDS. GDS takes precedence over community guidance.** Any deviation from a DEFRA standard MUST be raised as a formal exception through DEFRA's architectural governance (Delivery Architecture team: `delivery.architecture@defra.gov.uk`).

## The working framework (Triage → Read → Research → Plan Handoff → Plan Validation Research → Approval → Implement → Test → Iterate → Summarise)

This section is the **single source of truth** for the working loop. The custom agents ([Orchestrator](.github/agents/pdf-orchestrator.agent.md), [Planner](.github/agents/pdf-planner.agent.md), [Developer](.github/agents/pdf-developer.agent.md) and [Reviewer](.github/agents/pdf-reviewer.agent.md)) reference it and **must not restate or fork it**.

**Triage first — pick the right path by size and risk:**

- **Trivial / low-risk** (typo, comment/doc tweak, a small localised change with no impact on architecture, PDF generation/parsing correctness, the locked PDFKit 0.15.1 version, Azure Blob stream uploads, QR/`SERVICE_URL` handling, the `src/index.js` public API, security or data correctness): skip the planner and heavy research. Do a light **Read → Implement → Test → Summarise**, and research only the specific point that is genuinely uncertain.
- **Non-trivial** (new feature, a rendering/parsing change, a new document type, changes to the `src/index.js` public API, Azure Blob stream handling, QR/`SERVICE_URL` behaviour, dependency changes, security, or anything affecting PDF output/parse correctness or risky): run the full loop below.

Non-trivial loop:

1. **Read** — Read the relevant files/config in the repo for context before acting. Never assume; verify.
2. **Research** — Do thorough, risk-scoped research in the open and validate findings against DEFRA/GDS and framework/library guidance so advice reflects current APIs and policy. Cite sources.
3. **Clarify** — Ask the user targeted questions whenever requirements are ambiguous or missing. Surface requirement gaps explicitly with suggested fixes. Do not guess at intent.
4. **Plan handoff** — Delegate planning to the [Planner - PDF Service](.github/agents/pdf-planner.agent.md) agent when one exists. The planning agent returns the complete implementation plan.
5. **Plan validation research** — Perform thorough research in the open to validate the plan against DEFRA/GDS and framework guidance, **focusing on the steps the planner flagged as risky or version-sensitive** (unfamiliar APIs, security, policy). Send targeted revisions back to the planner.
6. **Approval** — Present the complete validated plan to the user and obtain explicit approval before implementation. If changes are requested, update the plan, re-validate, and re-approve. **Cap the plan → validate → approve → implement replanning cycle at 3 iterations**; if it is still unresolved, stop and surface the blocker to the user.
7. **Implement** — Deliver one task at a time (or parallel independent tasks) from the approved plan. Stay focused on the requested outcome; do not scope-creep or refactor unrelated code. When a change introduces or alters architecture, capture the decision as an ADR and update the relevant docs and ADRs **where the repo already keeps them** (e.g. `docs/`).
8. **Test / Validate** — Run the test suite (`npm test`, and `npm run test:integration` where Azure Blob integration is affected — this requires an Azure connection string), check errors, and confirm each task works before moving on.
9. **Iterate** — Refine until the user is satisfied with each task.
10. **Summarise** — End with a detailed **executive summary** of what changed, why, how it was validated, and any follow-ups or risks.

## Workflow agents

Non-trivial work is coordinated through four custom agents that all run the framework above:

| Agent | Role |
|-------|------|
| [Orchestrator - PDF Service](.github/agents/pdf-orchestrator.agent.md) | Plans, delegates, verifies and reports; owns the Yes/No user-approval gate. Does **not** implement. |
| [Planner - PDF Service](.github/agents/pdf-planner.agent.md) | Internal planning subagent; produces the approval-ready plan and the research behind it. |
| [Developer - PDF Service](.github/agents/pdf-developer.agent.md) | Implements an already-approved plan end-to-end with tests. |
| [Reviewer - PDF Service](.github/agents/pdf-reviewer.agent.md) | Read-only review against DEFRA standards; reports findings by severity. |

Research (§4.2) and plan-validation research (§4.5) use the [deep-research-defra-alignment](.github/skills/deep-research-defra-alignment/SKILL.md) skill. The [Speckit](.github/agents) agents (`speckit.*`) are a separate spec-driven toolset and are **not** part of this workflow.

## Skills

Use `/develop` for implementation, coding, and research tasks. Use `/unit-tests` for writing tests, coverage, and SonarQube issues.

## Defra standards and governance

This service must comply with [Defra software development standards](https://github.com/DEFRA/software-development-standards) — the single source of truth. The rules below encode those standards; they do not replace them. When a standard changes, update this file.

### Quality gates

All code must pass these checks before merging:

- All tests pass (`npm test`)
- Coverage ≥90% global (Statements/Branches/Functions/Lines), ≥95% core business logic, 100% error-handling and security-critical paths — no decrease from the SonarCloud baseline
- SonarQube/SonarCloud quality gate passes; security hotspots reviewed and resolved
- At least one approving review from another developer
- No unresolved security vulnerabilities in dependencies

### Security and PII

- Follow [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- Never commit secrets — load all configuration and credentials from environment variables (`src/config.js`), never `process.env` scattered through code
- **Never log PII**: names, addresses, emails, phone numbers, NI numbers, bank details, usernames, passwords, API keys, tokens
- Validate and sanitise all external input; validate and normalise file paths
- Avoid `eval`, dynamic `Function()`, or executing user-supplied data

### Dependencies

- New dependencies must be widely used, actively maintained, and compatible with the current Node.js LTS
- Do not upgrade PDFKit (locked at 0.15.1) without full regression testing
- Do not introduce a second PDF library, storage SDK, or date library without an approved exception

### Logging

- Structured logging with bracketed context tags and correlation IDs
- Levels: `error` (failures), `warn` (handled but unexpected), `info` (business events), `debug` (development only)

### How Copilot should respond

- Follow conventions already in the codebase — check existing patterns first
- Prefer modifying existing files over creating new ones when the change fits naturally
- Provide minimal diffs touching only the necessary files; do not refactor unrelated code
- Always include or update tests for changed behaviour
- Only modify the public API surface (`src/index.js`) when adding new public methods
- If a request conflicts with these instructions — a discouraged library, a skipped test, a hard-coded secret, or a broken quality gate — flag it explicitly and do not proceed silently

### Licence

All code is published under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/) unless an approved exception exists.

<!-- STANDARDS NOTE: These instructions reflect Defra software development standards (https://github.com/DEFRA/software-development-standards). Review this file periodically or after any Defra standards update. -->
