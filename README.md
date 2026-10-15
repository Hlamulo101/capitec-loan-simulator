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

The demo sign-up creates an account in `src/auth/mockAuth.ts` memory, and sign-in checks against that account while the page remains open. Passwords are not written to a local file or browser storage. Reloading the app clears demo accounts.

The form captures personal, employment, income, expense, debt, credit-score, requested-amount, term, and purpose details. Its client-side validation follows the provided validation rules, and its result uses the local calculation in `src/Calculator.ts` to display an illustrative repayment and affordability summary.

For a production integration, replace the local simulation with the documented API endpoints and connect the authentication screens to an approved identity service. Do not send real banking or identity details to this demo.
