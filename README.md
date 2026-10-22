# Capitec Credit Loan Simulator

A responsive personal loan eligibility simulator built with React, TypeScript, and Vite. It includes a landing page, a demonstration sign-in/sign-up flow, a validated loan affordability form, and an illustrative estimate based on the supplied endpoint brief.

> This frontend is a portfolio demonstration. Sign-up and sign-in use an in-memory mock and reset when the page reloads. Eligibility is simulated in the browser. The app does not call a live lending API, run a credit bureau check, create a real account, or provide a loan offer. Do not enter real credentials or financial details.

## Requirements

- Node.js 20 or newer
- Docker with Docker Compose (optional)

## Run locally

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite.

## End-to-end walkthrough

After starting the development server as described in [Run locally](#run-locally), follow the user flow in the browser:

1. Select **Get started** and create a demo profile with an email address and a password of at least 8 characters. The account exists only in memory for the current page session; do not use a real password.
2. Enter the simulator. The form is prefilled with sample values, which you can change.
3. Select **See my estimate**. Valid inputs open the separate result screen with the estimated payment, maximum amount for the selected term, decision reason, risk band, and affordability profile.
4. Select **Edit my details** to return to the form with your values preserved. Change a value and submit again to see the estimate recalculate.
5. To see an affordability decline, try age 29, employed for 36 months, monthly income R20,000, monthly expenses R12,000, existing debt R4,000, credit score 650, requested amount R200,000, and a 12-month term. The requested payment exceeds this demo's calculated capacity; the result explains the limit and displays the estimated maximum for that term.
6. Select **Sign out** from the form or estimate screen to return to the landing page. The demo profile remains available in memory until the page reloads, so you can sign in again.

To check code quality and create a production bundle, run:

```bash
npm test
npm run lint
npm run build
```

The tests use Node's built-in test runner and TypeScript compiler; no test framework or browser is required.

The Docker Compose steps are in [Run with Docker](#run-with-docker) below.

## Production build

```bash
npm run build
npm run preview
```

`npm run lint` checks the source with ESLint.

## Run with Docker

Build and start the production Nginx image:

```bash
docker compose up --build
```

Then open [http://localhost:8080](http://localhost:8080). To stop the container, run `docker compose down`.

The Dockerfile uses a Node build stage and serves the compiled static site with Nginx.

## Simulator behavior

The demo sign-up creates an account in `src/auth/mockAuth.ts` memory, and sign-in checks against that account while the page remains open. Sign out returns to the landing page but keeps the mock account in memory so the user can sign in again. Passwords are not written to a local file or browser storage. Reloading the app clears demo accounts.

The form captures personal, employment, income, expense, debt, credit-score, requested-amount, term, and purpose details. Its client-side validation follows the supplied validation rules. `src/Calculator.ts` then calculates an illustrative rate, monthly repayment, estimated maximum loan amount, debt-to-income ratio, risk band, and affordability profile from the submitted values.

### Architecture and decisions

- `src/App.tsx` owns screen navigation and simulator form state. Inputs are controlled so the displayed values and submitted request stay in sync. Numeric fields keep a short-lived string draft alongside the numeric request model; this lets a user clear a value while editing without converting the empty string back to zero.
- `src/formValidation.ts` is the single form-validation entry point. It uses the shared constraints in `src/validationRules.ts` and accepts empty numeric drafts separately, because an empty field cannot be represented by the API-shaped numeric request type.
- `src/Calculator.ts` is a pure calculation module. It has no React or browser dependencies, which makes the assumptions and edge cases straightforward to test.
- The estimate is calculated synchronously in the browser. There is no fake network delay or API abstraction because the assessment is frontend-focused and provides no endpoint.
- The demo authentication map is intentionally held in memory. This avoids implying that this portfolio demo provides secure account storage or real authentication.

The simulator is small enough that it does not add memoization or state-management libraries. If the form or estimate became expensive, profile it first, then isolate components or calculations that show measurable re-render or compute cost.

### Test coverage

`npm test` covers valid and invalid form input, zero-valued expenses and debt, and estimate outputs for an unaffordable request. It does not replace browser-level tests for keyboard navigation, screen-reader behavior, or the complete signup-to-estimate flow.

### Known tradeoffs to discuss

- Eligibility thresholds and rates are invented demo assumptions, fully described below; they must never be treated as Capitec policy or a lending decision.
- Authentication and estimates are client-side only. A production service would need server-side validation, secure identity and session handling, auditability, and authoritative lending rules.
- Loan purpose is collected for a realistic form but currently does not change the estimate.
- Validation is client-side for immediate feedback. A real API must repeat and own all security-sensitive validation.
- A future API integration would need loading, error, timeout, retry, and stale-response handling. These are intentionally not simulated in the current frontend-only version.

### Illustrative assumptions

The rules below are invented for this assessment demo. They are not Capitec policy, actual lending criteria, financial advice, or a real approval probability.

**Interest rate by credit score** (annual nominal rate used in the monthly repayment calculation):

| Credit score | Illustrative annual rate |
| --- | ---: |
| 750–850 | 10.5% |
| 650–749 | 12.5% |
| 600–649 | 14.5% |
| 550–599 | 16.0% |
| 300–549 | 18.5% |

The payment is calculated using the standard fixed-payment amortization formula for the requested amount and term. A lower credit score therefore raises the rate and payment, which can reduce the estimated maximum amount.

**Disposable income and payment capacity:**

- Disposable income = take-home monthly income − monthly expenses − existing monthly debt payments.
- Maximum new monthly payment = the lower of 40% of disposable income or (40% of take-home income − existing monthly debt payments), with a floor of R0.
- The maximum loan amount is the principal that fits this payment capacity at the selected rate and term. It is rounded down to the nearest R1,000 and capped at R300,000.
- Debt-to-income ratio = (existing debt payments + estimated new loan payment) ÷ take-home monthly income × 100.

**Eligibility conditions:** all of these must pass for the request to be marked eligible:

- Applicant age is 18–65 inclusive.
- Employment status is not unemployed. Employed, self-employed, and retired are accepted by this demo rule.
- Employment duration is at least 3 months.
- Take-home monthly income is at least R5,000.
- Disposable income is greater than R0.
- The requested monthly payment is above R0 and does not exceed the calculated payment capacity.
- Debt-to-income ratio after the new payment is no more than 40%.
- The illustrative profile score is at least 40 out of 100.

Inputs outside the form's allowed ranges (including age, income, credit score, requested amount, term, and employment duration) are stopped by client-side validation before an eligibility result is calculated.

**Illustrative profile score (0–100):** the calculator adds points for five factors, then clamps the result to 0–100.

| Factor | Points |
| --- | --- |
| Credit score: 750+, 700–749, 650–699, 600–649, 550–599, below 550 | 25, 22, 18, 12, 6, 0 |
| Debt-to-income: ≤20%, ≤30%, ≤40%, ≤45%, above 45% | 25, 18, 10, 3, 0 |
| Employment status: employed, self-employed, retired, unemployed | 15, 10, 8, 0 |
| Employment duration: 24+ months, 12–23 months, 3–11 months, under 3 months | 15, 10, 6, 0 |
| Disposable income remaining after the new payment as a share of take-home income: ≥20%, ≥10%, above 0%, otherwise | 20, 12, 5, 0 |

**Risk and affordability labels:** risk is high if a profile condition fails, the payment or debt ratio exceeds its limit, or the score is below 45; otherwise it is medium below 70 and low at 70 or above. The affordability label is poor if the payment does not fit or disposable income is non-positive; otherwise it is excellent at a score of 85+ with debt-to-income ≤20%, good at 70+, fair at 50+, and poor below 50.

**When the requested amount is above the estimate:** the simulator marks the request ineligible, explains that its repayment exceeds the budget limit, and displays the maximum amount estimated for the selected term. The applicant can return to the form, change the amount or term, and recalculate. It does not silently replace the requested amount with the maximum.

