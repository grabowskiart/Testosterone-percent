import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertTestosteroneAssessmentSchema, type InsertTestosteroneAssessment, type TestosteroneAssessment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { convertTestosteroneUnits } from "@/lib/medical-utils";

// ADAM Questionnaire Questions
const ADAM_QUESTIONS = [
  "Do you have a decrease in libido (sex drive)?",
  "Do you have a lack of energy?",
  "Do you have a decrease in strength and/or endurance?",
  "Have you lost height?",
  "Have you noticed a decreased \"enjoyment of life\"?",
  "Are you sad and/or grumpy?",
  "Are your erections less strong?",
  "Have you noticed a recent deterioration in your ability to play sports?",
  "Are you falling asleep after dinner?",
  "Has there been a recent deterioration in your work performance?"
];

interface AssessmentFormProps {
  onAssessmentComplete: (assessment: TestosteroneAssessment) => void;
  onAssessmentStart: () => void;
}

export default function AssessmentForm({ onAssessmentComplete, onAssessmentStart }: AssessmentFormProps) {
  const { toast } = useToast();
  const [currentUnit, setCurrentUnit] = useState<"ng/dl" | "nmol/l">("ng/dl");
  const [adamResponses, setAdamResponses] = useState<boolean[]>(new Array(10).fill(false));

  const form = useForm<InsertTestosteroneAssessment>({
    resolver: zodResolver(insertTestosteroneAssessmentSchema),
    defaultValues: {
      testosteroneLevel: undefined as any,
      testosteroneUnit: "ng/dl",
      age: undefined as any,
      adamScore: 0,
      adamResponses: new Array(10).fill(false),
    },
  });

  // Calculate ADAM score from individual responses
  const calculateAdamScore = (responses: boolean[]) => {
    return responses.filter(response => response === true).length;
  };

  // Update ADAM score when responses change
  const handleAdamResponseChange = (index: number, checked: boolean) => {
    const newResponses = [...adamResponses];
    newResponses[index] = checked;
    setAdamResponses(newResponses);
    
    const score = calculateAdamScore(newResponses);
    form.setValue("adamScore", score);
    form.setValue("adamResponses", newResponses);
  };

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: InsertTestosteroneAssessment) => {
      const response = await apiRequest("POST", "/api/assessments", data);
      return response.json();
    },
    onSuccess: (assessment) => {
      onAssessmentComplete(assessment);
      toast({
        title: "Assessment Complete",
        description: "Your testosterone analysis has been completed successfully.",
      });
    },
    onError: (error) => {
      console.error("Assessment error:", error);
      toast({
        title: "Assessment Failed",
        description: "Unable to complete assessment. Please check your inputs and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTestosteroneAssessment) => {
    onAssessmentStart();
    createAssessmentMutation.mutate(data);
  };

  const testosteroneValue = form.watch("testosteroneLevel");
  
  // Real-time unit conversion display
  const convertedValue = testosteroneValue && testosteroneValue > 0 
    ? convertTestosteroneUnits(testosteroneValue, currentUnit, currentUnit === "ng/dl" ? "nmol/l" : "ng/dl")
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <i className="fas fa-user-md text-medical-blue mr-3"></i>
        <h2 className="text-lg font-semibold text-gray-900">Patient Assessment</h2>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="assessment-form">
          {/* Testosterone Level Input */}
          <FormField
            control={form.control}
            name="testosteroneLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serum Testosterone Level</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter value..."
                      {...field}
                      value={field.value || ""}
                      onFocus={(e) => {
                        if (field.value === 0) {
                          field.onChange("");
                        }
                      }}
                      onChange={(e) => {
                        const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      className="pr-20"
                      data-testid="input-testosterone"
                    />
                  </FormControl>
                  <div className="absolute right-3 top-3">
                    <Select 
                      value={currentUnit} 
                      onValueChange={(value: "ng/dl" | "nmol/l") => {
                        setCurrentUnit(value);
                        form.setValue("testosteroneUnit", value);
                      }}
                    >
                      <SelectTrigger className="w-20 h-6 text-xs border-none bg-transparent p-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ng/dl">ng/dL</SelectItem>
                        <SelectItem value="nmol/l">nmol/L</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <FormDescription>
                  Normal range: 300-1000 ng/dL (10.4-34.7 nmol/L)
                  {testosteroneValue && testosteroneValue > 0 && (
                    <div className="mt-1 text-medical-blue">
                      Converts to: {convertedValue} {currentUnit === "ng/dl" ? "nmol/L" : "ng/dL"}
                    </div>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Age Input */}
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient Age</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Age in years..."
                    min={18}
                    max={100}
                    {...field}
                    value={field.value || ""}
                    onFocus={(e) => {
                      if (field.value === 0) {
                        field.onChange("");
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                      field.onChange(value);
                    }}
                    data-testid="input-age"
                  />
                </FormControl>
                <FormDescription>Must be between 18-100 years</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ADAM Questionnaire */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-900">ADAM Questionnaire</h3>
                <span className="ml-2 text-medical-blue cursor-help" title="Androgen Deficiency in Aging Males questionnaire">
                  <i className="fas fa-question-circle"></i>
                </span>
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Score: {calculateAdamScore(adamResponses)}/10
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Instructions:</strong> Please answer each question by checking "Yes" if you experience this symptom. 
                A score of 3 or higher suggests possible testosterone deficiency.
              </p>
            </div>

            <div className="space-y-4">
              {ADAM_QUESTIONS.map((question, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Checkbox
                    id={`adam-${index}`}
                    checked={adamResponses[index]}
                    onCheckedChange={(checked) => handleAdamResponseChange(index, checked as boolean)}
                    data-testid={`checkbox-adam-${index}`}
                  />
                  <label 
                    htmlFor={`adam-${index}`} 
                    className="text-sm text-gray-700 leading-relaxed cursor-pointer flex-1"
                  >
                    <span className="font-medium text-medical-blue mr-2">{index + 1}.</span>
                    {question}
                  </label>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Current ADAM Score:</span>
                <span className={`text-lg font-bold ${
                  calculateAdamScore(adamResponses) >= 3 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {calculateAdamScore(adamResponses)}/10
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {calculateAdamScore(adamResponses) >= 3 
                  ? "Score ≥3 suggests possible testosterone deficiency symptoms" 
                  : "Score <3 suggests low likelihood of testosterone deficiency symptoms"
                }
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-medical-blue text-white hover:bg-blue-700"
            disabled={createAssessmentMutation.isPending}
            data-testid="button-analyze"
          >
            {createAssessmentMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Analyzing...
              </>
            ) : (
              "Analyze Results"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
