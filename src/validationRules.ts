// Strict type specification for validation fields matching Capitec API parameters
export interface RuleNumericConstraint {
  min: number;
  max?: number;
  errorMessage: string;
}

export interface RuleOptionsConstraint {
  options: string[];
  errorMessage: string;
}

export interface ValidationRulesSchema {
  personalInfo: {
    age: RuleNumericConstraint;
    employmentStatus: RuleOptionsConstraint;
    employmentDuration: RuleNumericConstraint;
  };
  financialInfo: {
    monthlyIncome: RuleNumericConstraint;
    monthlyExpenses: RuleNumericConstraint;
    creditScore: RuleNumericConstraint;
  };
  loanDetails: {
    requestedAmount: RuleNumericConstraint;
    loanTerm: RuleNumericConstraint;
  };
}

export const validationRules: ValidationRulesSchema = {
  personalInfo: {
    age: { 
      min: 18, 
      max: 65, 
      errorMessage: "Age must be between 18 and 65" 
    },
    employmentStatus: { 
      options: ["employed", "self_employed", "unemployed", "retired"], 
      errorMessage: "Please select your employment status" 
    },
    employmentDuration: { 
      min: 3, 
      errorMessage: "Minimum 3 months employment required" 
    }
  },
  financialInfo: {
    monthlyIncome: { 
      min: 5000, 
      errorMessage: "Minimum monthly income of R5,000 required" 
    },
    monthlyExpenses: { 
      min: 0, 
      errorMessage: "Please enter your monthly expenses" 
    },
    creditScore: { 
      min: 300, 
      max: 850, 
      errorMessage: "Credit score must be between 300 and 850" 
    }
  },
  loanDetails: {
    requestedAmount: { 
      min: 5000, 
      max: 300000, 
      errorMessage: "Loan amount must be between R5,000 and R300,000" 
    },
    loanTerm: { 
      min: 6, 
      max: 60, 
      errorMessage: "Loan term must be between 6 and 60 months" 
    }
  }
};