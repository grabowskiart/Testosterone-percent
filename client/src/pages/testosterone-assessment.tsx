import { useState } from "react";
import AssessmentForm from "@/components/assessment-form";
import ResultsPanel from "@/components/results-panel";
import { TestosteroneAssessment } from "@shared/schema";

export default function TestosteroneAssessmentPage() {
  const [currentAssessment, setCurrentAssessment] = useState<TestosteroneAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAssessmentComplete = (assessment: TestosteroneAssessment) => {
    setCurrentAssessment(assessment);
    setIsLoading(false);
  };

  const handleAssessmentStart = () => {
    setIsLoading(true);
    setCurrentAssessment(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-medical-blue text-white p-2 rounded-lg">
                <i className="fas fa-flask text-xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Testosterone Assessment Tool</h1>
                <p className="text-sm text-medical-gray">Clinical Decision Support System</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-medical-gray">Version 2.1</span>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                <i className="fas fa-shield-alt mr-1"></i>HIPAA Compliant
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <AssessmentForm 
              onAssessmentComplete={handleAssessmentComplete}
              onAssessmentStart={handleAssessmentStart}
            />

            {/* Reference Information Card */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mt-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">
                <i className="fas fa-info-circle mr-2"></i>Reference Information
              </h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div>
                  <strong>Normal Testosterone:</strong>
                  <br />300-1000 ng/dL (10.4-34.7 nmol/L)
                </div>
                <div>
                  <strong>Low Testosterone:</strong>
                  <br />&lt;300 ng/dL (&lt;10.4 nmol/L)
                </div>
                <div>
                  <strong>ADAM Score:</strong>
                  <br />≥3 indicates possible symptoms
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <ResultsPanel 
              assessment={currentAssessment} 
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Additional Clinical Context */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <i className="fas fa-stethoscope text-medical-blue mr-3"></i>Clinical Context & Guidelines
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Diagnostic Criteria</h3>
              <p className="text-sm text-blue-800">
                Hypogonadism diagnosis requires both low testosterone (&lt;300 ng/dL) 
                and clinical symptoms consistent with androgen deficiency.
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Treatment Threshold</h3>
              <p className="text-sm text-green-800">
                Consider testosterone replacement therapy when levels are consistently 
                below 300 ng/dL with symptomatic hypogonadism.
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">Follow-up Protocol</h3>
              <p className="text-sm text-orange-800">
                Monitor patients on treatment every 3-6 months initially, 
                then annually once stable therapeutic levels are achieved.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-medical-gray mb-4 md:mb-0">
              © 2024 Medical Assessment Tools. For healthcare professionals only.
            </div>
            <div className="flex items-center space-x-6 text-sm text-medical-gray">
              <a href="#" className="hover:text-medical-blue transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-medical-blue transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-medical-blue transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
