import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIRouteRequest {
  start: [number, number];
  end: [number, number];
  currentTraffic: any[];
  historicalData?: any;
  timeOfDay?: string;
  weatherConditions?: string;
}

interface AIRouteResponse {
  success: boolean;
  recommendations: string;
  timestamp: string;
  error?: string;
}

export const useAIRouting = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string | null>(null);
  const { toast } = useToast();

  const getAIRouteOptimization = async (request: AIRouteRequest): Promise<AIRouteResponse | null> => {
    setIsLoading(true);
    setAiRecommendations(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-route-optimizer', {
        body: request
      });

      if (error) {
        console.error('AI routing error:', error);
        toast({
          title: "AI Optimization Failed",
          description: error.message || "Unable to get AI route recommendations",
          variant: "destructive",
        });
        return null;
      }

      if (data.success) {
        setAiRecommendations(data.recommendations);
        toast({
          title: "AI Route Analysis Complete",
          description: "Smart routing recommendations generated",
        });
        return data;
      }

      return null;

    } catch (error) {
      console.error('Error calling AI route optimizer:', error);
      toast({
        title: "Error",
        description: "Failed to connect to AI routing service",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getAIRouteOptimization,
    isLoading,
    aiRecommendations,
  };
};
