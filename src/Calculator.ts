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

// --- ENGINE LOGIC SIMULATING THE RECONSTRUCTED ENDPOINT ---

export const simulateEligibilityCheck = (req: LoanEligibilityRequest): LoanEligibilityResponse => {
  const { personalInfo, financialInfo, loanDetails } = req;

  // 1. Core Variables
  const disposableIncome = financialInfo.monthlyIncome - financialInfo.monthlyExpenses - financialInfo.existingDebt;
  const loanToIncomeRatio = (loanDetails.requestedAmount / financialInfo.monthlyIncome) * 100;
  
  // 2. Dynamically determine interest rate base layer from credit score
  let interestRate = 14.5; // Base default
  if (financialInfo.creditScore >= 750) interestRate = 10.5;
  else if (financialInfo.creditScore >= 650) interestRate = 12.5;
  else if (financialInfo.creditScore >= 550) interestRate = 16.0;
  else interestRate = 18.5;

  // 3. Compute Standard Amortization Formula
  const monthlyRate = (interestRate / 100) / 12;
  const monthlyPayment = (loanDetails.requestedAmount * monthlyRate * Math.pow(1 + monthlyRate, loanDetails.loanTerm)) /
                         (Math.pow(1 + monthlyRate, loanDetails.loanTerm) - 1);
  
  const totalRepayment = monthlyPayment * loanDetails.loanTerm;
  
  // 4. Calculate overall Debt-To-Income (DTI) ratio including new installment
  const totalCommitments = financialInfo.existingDebt + monthlyPayment;
  const debtToIncomeRatio = (totalCommitments / financialInfo.monthlyIncome) * 100;

  // 5. Build Underwriting Scoring Engine
  let isEligible = true;
  let riskCategory: 'low' | 'medium' | 'high' = 'low';
  let approvalLikelihood = 85;
  let decisionReason = "Strong income-to-expense ratio and manageable existing debt";
  let affordabilityScore: 'poor' | 'fair' | 'good' | 'excellent' = 'good';

  // Hard Business Validation Checks
  if (personalInfo.age < 18 || personalInfo.age > 65 || personalInfo.employmentStatus === 'unemployed' || disposableIncome <= 0) {
    isEligible = false;
    riskCategory = 'high';
    approvalLikelihood = 10;
    affordabilityScore = 'poor';
    decisionReason = "Applicant profile fails minimum age, employment status, or basic cash flow thresholds.";
  } else if (debtToIncomeRatio > 45) {
    isEligible = false;
    riskCategory = 'high';
    approvalLikelihood = 25;
    affordabilityScore = 'poor';
    decisionReason = "Total projected monthly obligations exceed sustainable household ratios.";
  } else if (debtToIncomeRatio > 35 || financialInfo.creditScore < 600) {
    riskCategory = 'medium';
    approvalLikelihood = 55;
    affordabilityScore = 'fair';
    decisionReason = "Conditional approval: Moderate credit risk or tight cash margins flagged.";
  } else if (financialInfo.creditScore >= 720 && debtToIncomeRatio < 25) {
    affordabilityScore = 'excellent';
  }

  // Calculate dynamic maximum loan parameters
  const maxSafeMonthlyPayment = Math.max(0, disposableIncome * 0.4);
  const maxAmount = Math.round((maxSafeMonthlyPayment / monthlyRate) * (1 - Math.pow(1 + monthlyRate, -loanDetails.loanTerm)));

  return {
    eligibilityResult: {
      isEligible,
      approvalLikelihood: isEligible ? approvalLikelihood : 0,
      riskCategory,
      decisionReason
    },
    recommendedLoan: {
      maxAmount: Math.max(5000, maxAmount),
      recommendedAmount: loanDetails.requestedAmount,
      interestRate: Math.round(interestRate * 100) / 100,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalRepayment: Math.round(totalRepayment * 100) / 100
    },
    affordabilityAnalysis: {
      disposableIncome,
      debtToIncomeRatio: Math.round(debtToIncomeRatio * 100) / 100,
      loanToIncomeRatio: Math.round(loanToIncomeRatio * 100) / 100,
      affordabilityScore
    }
  };
};
