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
import { convertTestosteroneUnits } from "@/lib/medical-utils";

interface AssessmentFormProps {
  onAssessmentComplete: (assessment: TestosteroneAssessment) => void;
  onAssessmentStart: () => void;
}

export default function AssessmentForm({ onAssessmentComplete, onAssessmentStart }: AssessmentFormProps) {
  const { toast } = useToast();
  const [currentUnit, setCurrentUnit] = useState<"ng/dl" | "nmol/l">("ng/dl");

  const form = useForm<InsertTestosteroneAssessment>({
    resolver: zodResolver(insertTestosteroneAssessmentSchema),
    defaultValues: {
      testosteroneLevel: 0,
      testosteroneUnit: "ng/dl",
      age: 0,
      adamScore: 0,
    },
  });

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
  const convertedValue = testosteroneValue > 0 
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
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
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
                  {testosteroneValue > 0 && (
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
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
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

          {/* ADAM Score Input */}
          <FormField
            control={form.control}
            name="adamScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  ADAM Score
                  <span className="ml-1 text-medical-blue cursor-help" title="Androgen Deficiency in Aging Males questionnaire score">
                    <i className="fas fa-question-circle"></i>
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Score (0-10)..."
                    min={0}
                    max={10}
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      field.onChange(value);
                    }}
                    data-testid="input-adam-score"
                  />
                </FormControl>
                <FormDescription>Score ≥3 suggests possible hypogonadism</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
