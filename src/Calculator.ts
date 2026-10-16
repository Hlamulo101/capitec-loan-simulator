// --- REQUEST & RESPONSE TYPES ALIGNED WITH CAPITEC API SPEC ---

export interface PersonalInfo {
  age: number;
  employmentStatus: 'employed' | 'self_employed' | 'unemployed' | 'retired';
  employmentDuration: number;
}

export interface FinancialInfo {
  monthlyIncome: number;
  monthlyExpenses: number;
  existingDebt: number;
  creditScore: number;
}

export interface LoanDetails {
  requestedAmount: number;
  loanTerm: number;
  loanPurpose: string;
}

export interface LoanEligibilityRequest {
  personalInfo: PersonalInfo;
  financialInfo: FinancialInfo;
  loanDetails: LoanDetails;
}

export interface EligibilityResult {
  isEligible: boolean;
  approvalLikelihood: number;
  riskCategory: 'low' | 'medium' | 'high';
  decisionReason: string;
}

export interface RecommendedLoan {
  maxAmount: number;
  recommendedAmount: number;
  interestRate: number;
  monthlyPayment: number;
  totalRepayment: number;
}

export interface AffordabilityAnalysis {
  disposableIncome: number;
  debtToIncomeRatio: number;
  loanToIncomeRatio: number;
  affordabilityScore: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface LoanEligibilityResponse {
  eligibilityResult: EligibilityResult;
  recommendedLoan: RecommendedLoan;
  affordabilityAnalysis: AffordabilityAnalysis;
}

// --- TRANSPARENT, DEMONSTRATION-ONLY ELIGIBILITY MODEL ---
// These are illustrative product assumptions, not Capitec underwriting rules.
const monthlyPaymentFor = (amount: number, annualRate: number, termMonths: number): number => {
  if (amount <= 0 || termMonths <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return amount / termMonths;
  const factor = (1 + monthlyRate) ** termMonths;
  return amount * monthlyRate * factor / (factor - 1);
};

const loanAmountForPayment = (payment: number, annualRate: number, termMonths: number): number => {
  if (payment <= 0 || termMonths <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return payment * termMonths;
  return payment / monthlyRate * (1 - (1 + monthlyRate) ** -termMonths);
};

const roundMoney = (value: number) => Math.round(value * 100) / 100;

export const simulateEligibilityCheck = (req: LoanEligibilityRequest): LoanEligibilityResponse => {
  const { personalInfo, financialInfo, loanDetails } = req;
  const { monthlyIncome, monthlyExpenses, existingDebt, creditScore } = financialInfo;
  const { requestedAmount, loanTerm } = loanDetails;
  const disposableIncome = monthlyIncome - monthlyExpenses - existingDebt;

  // Better credit scores receive a lower illustrative rate, which changes the
  // repayment and the maximum amount affordable over the selected term.
  const interestRate = creditScore >= 750 ? 10.5
    : creditScore >= 650 ? 12.5
      : creditScore >= 600 ? 14.5
        : creditScore >= 550 ? 16
          : 18.5;
  const monthlyPayment = monthlyPaymentFor(requestedAmount, interestRate, loanTerm);
  const totalRepayment = monthlyPayment * loanTerm;
  const totalCommitments = existingDebt + monthlyPayment;
  const debtToIncomeRatio = monthlyIncome > 0 ? totalCommitments / monthlyIncome * 100 : 100;
  const loanToIncomeRatio = monthlyIncome > 0 ? requestedAmount / monthlyIncome * 100 : 0;

  // A new payment may use at most 40% of disposable income and must keep total
  // debt payments at or below 40% of gross monthly income in this demo model.
  const paymentCapacity = Math.max(0, Math.min(disposableIncome * 0.4, monthlyIncome * 0.4 - existingDebt));
  const rawMaxAmount = loanAmountForPayment(paymentCapacity, interestRate, loanTerm);
  const maxAmount = Math.min(300000, Math.floor(rawMaxAmount / 1000) * 1000);

  let profileScore = 0;
  profileScore += creditScore >= 750 ? 25 : creditScore >= 700 ? 22 : creditScore >= 650 ? 18 : creditScore >= 600 ? 12 : creditScore >= 550 ? 6 : 0;
  profileScore += debtToIncomeRatio <= 20 ? 25 : debtToIncomeRatio <= 30 ? 18 : debtToIncomeRatio <= 40 ? 10 : debtToIncomeRatio <= 45 ? 3 : 0;
  profileScore += personalInfo.employmentStatus === 'employed' ? 15 : personalInfo.employmentStatus === 'self_employed' ? 10 : personalInfo.employmentStatus === 'retired' ? 8 : 0;
  profileScore += personalInfo.employmentDuration >= 24 ? 15 : personalInfo.employmentDuration >= 12 ? 10 : personalInfo.employmentDuration >= 3 ? 6 : 0;
  const remainingAfterPayment = disposableIncome - monthlyPayment;
  const remainingIncomeRatio = monthlyIncome > 0 ? remainingAfterPayment / monthlyIncome : 0;
  profileScore += remainingIncomeRatio >= 0.2 ? 20 : remainingIncomeRatio >= 0.1 ? 12 : remainingAfterPayment > 0 ? 5 : 0;
  profileScore = Math.max(0, Math.min(100, profileScore));

  const profileChecks = [
    personalInfo.age >= 18 && personalInfo.age <= 65,
    personalInfo.employmentStatus !== 'unemployed',
    personalInfo.employmentDuration >= 3,
    monthlyIncome >= 5000,
    disposableIncome > 0,
  ];
  const paymentFits = monthlyPayment <= paymentCapacity && monthlyPayment > 0;
  const debtFits = debtToIncomeRatio <= 40;
  const isEligible = profileChecks.every(Boolean) && paymentFits && debtFits && profileScore >= 40;
  const riskCategory: EligibilityResult['riskCategory'] = !profileChecks.every(Boolean) || !paymentFits || !debtFits || profileScore < 45
    ? 'high'
    : profileScore < 70 ? 'medium' : 'low';

  let decisionReason: string;
  if (personalInfo.age < 18 || personalInfo.age > 65) {
    decisionReason = 'The age entered is outside this simulator’s 18 to 65 range.';
  } else if (personalInfo.employmentStatus === 'unemployed') {
    decisionReason = 'This simulator requires current employment or retirement income to estimate a loan.';
  } else if (personalInfo.employmentDuration < 3) {
    decisionReason = 'The employment duration entered is below the simulator’s 3-month minimum.';
  } else if (monthlyIncome < 5000) {
    decisionReason = 'The monthly income entered is below the simulator’s R5,000 minimum.';
  } else if (disposableIncome <= 0) {
    decisionReason = 'Your entered expenses and existing debt use all of your monthly income.';
  } else if (!paymentFits || !debtFits) {
    decisionReason = `The requested repayment is ${roundMoney(monthlyPayment).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })} per month. Based on this budget, the simulator estimates a maximum loan of ${maxAmount.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 })} over ${loanTerm} months.`;
  } else if (profileScore < 40) {
    decisionReason = 'The combined credit, debt, employment, and monthly budget indicators fall below this simulator’s estimate threshold.';
  } else if (profileScore >= 80) {
    decisionReason = 'Your entered income, expenses, debt, employment, and credit score fit within this simulator’s affordability assumptions.';
  } else {
    decisionReason = 'The requested payment fits this simulator’s budget limits, though one or more credit, debt, or employment indicators suggest a higher risk.';
  }

  const affordabilityScore: AffordabilityAnalysis['affordabilityScore'] = !paymentFits || disposableIncome <= 0 ? 'poor'
    : profileScore >= 85 && debtToIncomeRatio <= 20 ? 'excellent'
      : profileScore >= 70 ? 'good'
        : profileScore >= 50 ? 'fair' : 'poor';

  return {
    eligibilityResult: {
      isEligible,
      // This is a heuristic profile score from 0–100, not a real approval probability.
      approvalLikelihood: isEligible ? profileScore : Math.min(profileScore, 25),
      riskCategory,
      decisionReason,
    },
    recommendedLoan: {
      maxAmount,
      recommendedAmount: Math.min(requestedAmount, maxAmount),
      interestRate,
      monthlyPayment: roundMoney(monthlyPayment),
      totalRepayment: roundMoney(totalRepayment),
    },
    affordabilityAnalysis: {
      disposableIncome: roundMoney(disposableIncome),
      debtToIncomeRatio: roundMoney(debtToIncomeRatio),
      loanToIncomeRatio: roundMoney(loanToIncomeRatio),
      affordabilityScore,
    },
  };
};
