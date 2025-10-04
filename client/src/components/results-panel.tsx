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
            <p className="text-medical-gray">Calculating percentile and generating results...</p>
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
          <p className="text-medical-gray">Complete the patient assessment form to view detailed results.</p>
        </div>
      </div>
    </div>
  );
}

