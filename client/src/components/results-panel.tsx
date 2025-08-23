import { TestosteroneAssessment } from "@shared/schema";
import { convertTestosteroneUnits, getTestosteroneInterpretation } from "@/lib/medical-utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ResultsPanelProps {
  assessment: TestosteroneAssessment | null;
  isLoading: boolean;
}

export default function ResultsPanel({ assessment, isLoading }: ResultsPanelProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!assessment) {
    return <EmptyState />;
  }

  const testosteroneNgDl = assessment.testosteroneUnit === "nmol/l" 
    ? convertTestosteroneUnits(Number(assessment.testosteroneLevel), "nmol/l", "ng/dl")
    : Number(assessment.testosteroneLevel);

  const testosteroneNmolL = assessment.testosteroneUnit === "ng/dl" 
    ? convertTestosteroneUnits(Number(assessment.testosteroneLevel), "ng/dl", "nmol/l")
    : Number(assessment.testosteroneLevel);

  const percentile = assessment.percentile ? Number(assessment.percentile) : 0;
  const interpretation = getTestosteroneInterpretation(percentile, Number(assessment.testosteroneLevel), assessment.testosteroneUnit);

  let aiAssessment = null;
  try {
    aiAssessment = assessment.aiAssessment ? JSON.parse(assessment.aiAssessment) : null;
  } catch (e) {
    console.error("Failed to parse AI assessment:", e);
  }

  return (
    <div className="space-y-6">
      {/* Unit Conversion Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          <i className="fas fa-exchange-alt text-medical-blue mr-3"></i>Unit Conversion
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4" data-testid="conversion-conventional">
            <div className="text-center">
              <div className="text-sm text-medical-gray mb-1">Conventional Units</div>
              <div className="text-2xl font-bold text-gray-900">{testosteroneNgDl} ng/dL</div>
              <div className="text-xs text-medical-gray mt-1">Nanograms per deciliter</div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4" data-testid="conversion-si">
            <div className="text-center">
              <div className="text-sm text-medical-gray mb-1">SI Units</div>
              <div className="text-2xl font-bold text-gray-900">{testosteroneNmolL} nmol/L</div>
              <div className="text-xs text-medical-gray mt-1">Nanomoles per liter</div>
            </div>
          </div>
        </div>
      </div>

      {/* Percentile Visualization */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          <i className="fas fa-chart-line text-medical-blue mr-3"></i>Age-Adjusted Percentile
        </h2>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-medical-gray">Patient Position</span>
            <span className="text-sm font-medium text-gray-900" data-testid="text-percentile">
              {percentile}th Percentile
            </span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 h-4 rounded-full relative">
                <div 
                  className="absolute top-0 w-1 h-4 bg-medical-blue rounded-full transform -translate-x-1/2" 
                  style={{ left: `${percentile}%` }}
                  data-testid="percentile-marker"
                ></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-medical-gray mt-2">
              <span>Low (0%)</span>
              <span>Average (50%)</span>
              <span>High (100%)</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-900" data-testid="text-interpretation">
            <strong>Interpretation:</strong> This patient's testosterone level is{' '}
            <span className="font-semibold">{interpretation}</span>{' '}
            ({percentile}th percentile).
          </div>
        </div>
      </div>

      {/* AI Assessment Results */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          <i className="fas fa-brain text-medical-blue mr-3"></i>AI-Powered Hypogonadism Assessment
        </h2>

        {assessment.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-red-400 mr-3"></i>
              <div className="text-sm text-red-700">
                <strong>Assessment Unavailable:</strong> {assessment.error}
              </div>
            </div>
          </div>
        )}

        {aiAssessment ? (
          <AIAssessmentResults assessment={aiAssessment} confidence={Number(assessment.confidence || 0)} />
        ) : (
          <div className="text-center py-8 text-medical-gray">
            <i className="fas fa-exclamation-triangle text-2xl mb-4"></i>
            <p>AI assessment not available for this analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <i className="fas fa-cog fa-spin text-medical-blue text-2xl mb-4"></i>
            <p className="text-medical-gray">Analyzing patient data with AI...</p>
            <div className="mt-4 bg-gray-200 rounded-full h-2 w-48 mx-auto">
              <div className="bg-medical-blue h-2 rounded-full animate-pulse w-3/5"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="space-y-6">
      {/* Unit Conversion Display - Empty */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          <i className="fas fa-exchange-alt text-medical-blue mr-3"></i>Unit Conversion
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-sm text-medical-gray mb-1">Conventional Units</div>
              <div className="text-2xl font-bold text-gray-400">-- ng/dL</div>
              <div className="text-xs text-medical-gray mt-1">Nanograms per deciliter</div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-sm text-medical-gray mb-1">SI Units</div>
              <div className="text-2xl font-bold text-gray-400">-- nmol/L</div>
              <div className="text-xs text-medical-gray mt-1">Nanomoles per liter</div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty Results Message */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <i className="fas fa-chart-line text-gray-300 text-4xl mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assessment Available</h3>
          <p className="text-medical-gray">Complete the patient assessment form to view detailed results and AI analysis.</p>
        </div>
      </div>
    </div>
  );
}

interface AIAssessmentResultsProps {
  assessment: any;
  confidence: number;
}

function AIAssessmentResults({ assessment, confidence }: AIAssessmentResultsProps) {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return "bg-green-100 text-green-800";
    if (conf >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getAssessmentColor = (assess: string) => {
    if (assess.toLowerCase().includes("normal") || assess.toLowerCase().includes("no")) return "bg-green-400";
    if (assess.toLowerCase().includes("borderline")) return "bg-yellow-400";
    return "bg-red-400";
  };

  return (
    <div className="space-y-4" data-testid="ai-results">
      {/* Primary Assessment Card */}
      <div className="border rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${getAssessmentColor(assessment.assessment || "")}`}></div>
            <h3 className="font-semibold text-gray-900">Primary Assessment</h3>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(confidence)}`}>
            {confidence}% Confidence
          </div>
        </div>
        <p className="text-gray-700 mb-3" data-testid="text-ai-assessment">
          {assessment.assessment}
        </p>
        <div className="bg-blue-50 rounded-lg p-3 mt-3">
          <div className="text-blue-800 text-sm" data-testid="text-ai-interpretation">
            {assessment.interpretation}
          </div>
        </div>
      </div>

      {/* Risk Factors Analysis */}
      {assessment.riskFactors && assessment.riskFactors.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Risk Factor Analysis</h3>
          <div className="space-y-3">
            {assessment.riskFactors.map((factor: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{factor.factor}</span>
                <div className={`px-2 py-1 rounded text-xs ${
                  factor.risk === "low" ? "bg-green-100 text-green-800" :
                  factor.risk === "moderate" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {factor.risk === "low" ? "Low Risk" :
                   factor.risk === "moderate" ? "Moderate" : "High Risk"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Recommendations */}
      {assessment.recommendations && assessment.recommendations.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Clinical Recommendations</h3>
          <ul className="space-y-2 text-sm text-gray-700" data-testid="recommendations-list">
            {assessment.recommendations.map((rec: string, index: number) => (
              <li key={index} className="flex items-start">
                <i className="fas fa-chevron-right text-medical-blue mr-2 mt-1 text-xs"></i>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start">
          <i className="fas fa-exclamation-triangle text-medical-orange mr-3 mt-0.5"></i>
          <div className="text-xs text-gray-600">
            <strong>Clinical Decision Support Disclaimer:</strong> This AI-powered assessment is intended 
            to support clinical decision-making and should not replace professional medical judgment. 
            All treatment decisions should consider the complete clinical picture and patient history.
          </div>
        </div>
      </div>
    </div>
  );
}
