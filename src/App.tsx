import { useState } from 'react';
// 1. Explicitly import types using the 'type' flag to satisfy your strict compiler rules
import type { LoanEligibilityRequest, LoanEligibilityResponse } from './Calculator';
import { simulateEligibilityCheck } from './Calculator';
import { validationRules } from './validationRules';
import { Shield, Wallet, Landmark, TrendingUp, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Centralized Form Payload State Object matching Capitec JSON schema
  const [formData, setFormData] = useState<LoanEligibilityRequest>({
    personalInfo: { age: 25, employmentStatus: 'employed', employmentDuration: 12 },
    financialInfo: { monthlyIncome: 15000, monthlyExpenses: 7000, existingDebt: 2000, creditScore: 650 },
    loanDetails: { requestedAmount: 50000, loanTerm: 24, loanPurpose: 'home_improvement' }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<LoanEligibilityResponse | null>(null);

  // Client-Side Real-Time Form Rules Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const rules = validationRules; 

    if (formData.personalInfo.age < rules.personalInfo.age.min || formData.personalInfo.age > rules.personalInfo.age.max) {
      newErrors.age = rules.personalInfo.age.errorMessage;
    }
    if (formData.personalInfo.employmentDuration < rules.personalInfo.employmentDuration.min) {
      newErrors.employmentDuration = rules.personalInfo.employmentDuration.errorMessage;
    }
    if (formData.financialInfo.monthlyIncome < rules.financialInfo.monthlyIncome.min) {
      newErrors.monthlyIncome = rules.financialInfo.monthlyIncome.errorMessage;
    }
    if (formData.financialInfo.creditScore < rules.financialInfo.creditScore.min || formData.financialInfo.creditScore > rules.financialInfo.creditScore.max) {
      newErrors.creditScore = rules.financialInfo.creditScore.errorMessage;
    }
    if (formData.loanDetails.requestedAmount < rules.loanDetails.requestedAmount.min || formData.loanDetails.requestedAmount > rules.loanDetails.requestedAmount.max) {
      newErrors.requestedAmount = rules.loanDetails.requestedAmount.errorMessage;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate real-world retail banking async network latency
    setTimeout(() => {
      const evaluation = simulateEligibilityCheck(formData);
      setResult(evaluation);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Production-Grade Capitec Corporate Branded Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#005ea6] rounded-lg flex items-center justify-center font-bold text-white text-lg">C</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Capitec <span className="text-slate-500 font-light text-base">Credit Labs</span></span>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 font-medium">Production-Grade</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* User Interactive Financial Input Panel */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Personal Parameters */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <Shield className="w-5 h-5 text-[#005ea6]" />
              <h2 className="text-lg font-semibold text-slate-900">Personal Demographics</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Applicant Age</label>
                <input type="number" value={formData.personalInfo.age} onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, age: parseInt(e.target.value) || 0}})} className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#005ea6] outline-none transition-all" />
                {errors.age && <p className="text-xs text-rose-600 mt-1">{errors.age}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Employment Profile</label>
                <select value={formData.personalInfo.employmentStatus} onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, employmentStatus: e.target.value as any}})} className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#005ea6] outline-none transition-all">
                  <option value="employed">Permanently Employed</option>
                  <option value="self_employed">Self Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Current Job Tenure (Months)</label>
                <input type="number" value={formData.personalInfo.employmentDuration} onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, employmentDuration: parseInt(e.target.value) || 0}})} className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#005ea6] outline-none transition-all" />
                {errors.employmentDuration && <p className="text-xs text-rose-600 mt-1">{errors.employmentDuration}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Financial Metrics */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <Wallet className="w-5 h-5 text-[#005ea6]" />
              <h2 className="text-lg font-semibold text-slate-900">Financial Position Metrics</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Net Monthly Income (ZAR)</label>
                <input type="number" value={formData.financialInfo.monthlyIncome} onChange={e => setFormData({...formData, financialInfo: {...formData.financialInfo, monthlyIncome: parseInt(e.target.value) || 0}})} className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#005ea6] outline-none transition-all" />
                {errors.monthlyIncome && <p className="text-xs text-rose-600 mt-1">{errors.monthlyIncome}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Declared Monthly Expenses (ZAR)</label>
                <input type="number" value={formData.financialInfo.monthlyExpenses} onChange={e => setFormData({...formData, financialInfo: {...formData.financialInfo, monthlyExpenses: parseInt(e.target.value) || 0}})} className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#005ea6] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Existing Debt Installments (ZAR)</label>
                <input type="number" value={formData.financialInfo.existingDebt} onChange={e => setFormData({...formData, financialInfo: {...formData.financialInfo, existingDebt: parseInt(e.target.value) || 0}})} className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#005ea6] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Credit Score Check ({formData.financialInfo.creditScore})</label>
                <input type="range" min="300" max="850" value={formData.financialInfo.creditScore} onChange={e => setFormData({...formData, financialInfo: {...formData.financialInfo, creditScore: parseInt(e.target.value)}})} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#005ea6] mt-3" />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1 mt-1"><span>300 (Poor)</span><span>850 (Excellent)</span></div>
              </div>
            </div>
          </div>

          {/* Section 3: Facility Parameters */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <Landmark className="w-5 h-5 text-[#005ea6]" />
              <h2 className="text-lg font-semibold text-slate-900">Facility Terms Specified</h2>
            </div>
            <div className="space-y-4">
              </div>
            </div>
          </form>
          </main>
          </div>
  )  }
            