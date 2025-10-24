import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAIRouting } from '@/hooks/useAIRouting';
import { Skeleton } from '@/components/ui/skeleton';

interface AIRoutePanelProps {
  start: [number, number];
  end: [number, number];
  currentTraffic: any[];
}

const AIRoutePanel = ({ start, end, currentTraffic }: AIRoutePanelProps) => {
  const { getAIRouteOptimization, isLoading, aiRecommendations } = useAIRouting();

  const handleOptimize = async () => {
    const now = new Date();
    const timeOfDay = now.toLocaleTimeString();
    
    await getAIRouteOptimization({
      start,
      end,
      currentTraffic,
      timeOfDay,
      weatherConditions: 'Clear',
      historicalData: {
        averageSpeed: 45,
        peakHours: ['08:00-10:00', '17:00-19:00'],
        incidentRate: 0.15
      }
    });
  };

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Route Intelligence</CardTitle>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Smart
          </Badge>
        </div>
        <CardDescription>
          AI-powered traffic prediction and route optimization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleOptimize}
          disabled={isLoading}
          className="w-full gap-2"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4" />
              Get AI Recommendations
            </>
          )}
        </Button>

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}

        {aiRecommendations && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">AI Analysis Results:</h4>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {aiRecommendations}
                </div>
              </div>
            </div>
          </div>
        )}

        {!aiRecommendations && !isLoading && (
          <div className="text-center text-sm text-muted-foreground py-4">
            Click the button above to get AI-powered route recommendations
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRoutePanel;
