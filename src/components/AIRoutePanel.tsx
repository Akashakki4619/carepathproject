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
    <Card className="border-primary/20 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Route Intelligence</CardTitle>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Smart
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Real-time AI analysis for optimal routing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={handleOptimize}
          disabled={isLoading}
          className="w-full sm:w-auto gap-2"
          size="sm"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4" />
              Get AI Analysis
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
          <div className="rounded-lg border border-primary/30 bg-card p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs uppercase tracking-wide text-primary mb-2">AI Analysis</h4>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {aiRecommendations}
                </div>
              </div>
            </div>
          </div>
        )}

        {!aiRecommendations && !isLoading && (
          <div className="text-center text-xs text-muted-foreground py-2">
            Click button to get AI route analysis
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRoutePanel;
