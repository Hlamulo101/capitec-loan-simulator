import type { LoanEligibilityRequest } from './Calculator.js';
import { validationRules } from './validationRules.js';

export type FormErrors = Record<string, string>;

/** Validate the simulator form before passing its values to the estimate model. */
export function validateEligibilityRequest(
  request: LoanEligibilityRequest,
  emptyFields: string[] = [],
): FormErrors {
  const errors: FormErrors = {};
  const { personalInfo, financialInfo, loanDetails } = request;
  const isEmpty = (field: string) => emptyFields.includes(field);

  if (isEmpty('age') || personalInfo.age < validationRules.personalInfo.age.min || personalInfo.age > (validationRules.personalInfo.age.max ?? Infinity)) {
    errors.age = validationRules.personalInfo.age.errorMessage;
  }
  if (!validationRules.personalInfo.employmentStatus.options.includes(personalInfo.employmentStatus)) {
    errors.employment = validationRules.personalInfo.employmentStatus.errorMessage;
  }
  if (isEmpty('employmentDuration') || personalInfo.employmentDuration < validationRules.personalInfo.employmentDuration.min) {
    errors.tenure = validationRules.personalInfo.employmentDuration.errorMessage;
  }
  if (isEmpty('monthlyIncome') || financialInfo.monthlyIncome < validationRules.financialInfo.monthlyIncome.min) {
    errors.income = validationRules.financialInfo.monthlyIncome.errorMessage;
  }
  if (isEmpty('monthlyExpenses') || financialInfo.monthlyExpenses < validationRules.financialInfo.monthlyExpenses.min) {
    errors.expenses = 'Expenses cannot be below zero.';
  }
  if (isEmpty('existingDebt') || financialInfo.existingDebt < 0) {
    errors.debt = 'Existing debt cannot be below zero.';
  }
  if (financialInfo.creditScore < validationRules.financialInfo.creditScore.min || financialInfo.creditScore > (validationRules.financialInfo.creditScore.max ?? Infinity)) {
    errors.credit = validationRules.financialInfo.creditScore.errorMessage;
  }
  if (isEmpty('requestedAmount') || loanDetails.requestedAmount < validationRules.loanDetails.requestedAmount.min || loanDetails.requestedAmount > (validationRules.loanDetails.requestedAmount.max ?? Infinity)) {
    errors.amount = validationRules.loanDetails.requestedAmount.errorMessage;
  }
  if (loanDetails.loanTerm < validationRules.loanDetails.loanTerm.min || loanDetails.loanTerm > (validationRules.loanDetails.loanTerm.max ?? Infinity)) {
    errors.term = validationRules.loanDetails.loanTerm.errorMessage;
  }

  return errors;
}
