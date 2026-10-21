import assert from 'node:assert/strict';
import test from 'node:test';
import { simulateEligibilityCheck, type LoanEligibilityRequest } from '../src/Calculator.js';
import { validateEligibilityRequest } from '../src/formValidation.js';

const validRequest: LoanEligibilityRequest = {
  personalInfo: { age: 29, employmentStatus: 'employed', employmentDuration: 36 },
  financialInfo: { monthlyIncome: 32000, monthlyExpenses: 14500, existingDebt: 2500, creditScore: 680 },
  loanDetails: { requestedAmount: 85000, loanTerm: 36, loanPurpose: 'home_improvement' },
};

test('valid form values pass and zero expenses/debt are accepted', () => {
  const request = structuredClone(validRequest);
  request.financialInfo.monthlyExpenses = 0;
  request.financialInfo.existingDebt = 0;
  assert.deepEqual(validateEligibilityRequest(request), {});
});

test('empty number drafts and values outside supported ranges are rejected', () => {
  const request = structuredClone(validRequest);
  request.personalInfo.age = 17;
  request.financialInfo.monthlyIncome = 4999;
  request.loanDetails.requestedAmount = 300001;
  const errors = validateEligibilityRequest(request, ['monthlyExpenses']);
  assert.ok(errors.age);
  assert.ok(errors.income);
  assert.ok(errors.expenses);
  assert.ok(errors.amount);
});

test('calculator returns a finite estimate and explains an unaffordable request', () => {
  const result = simulateEligibilityCheck(validRequest);
  assert.ok(Number.isFinite(result.recommendedLoan.monthlyPayment));
  assert.ok(Number.isFinite(result.recommendedLoan.maxAmount));

  const unaffordable = structuredClone(validRequest);
  unaffordable.loanDetails.requestedAmount = 300000;
  const decline = simulateEligibilityCheck(unaffordable);
  assert.equal(decline.eligibilityResult.isEligible, false);
  assert.match(decline.eligibilityResult.decisionReason, /maximum loan/i);
});

