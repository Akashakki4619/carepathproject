import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { start, end, currentTraffic, historicalData, timeOfDay, weatherConditions } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("AI Route Optimizer - Processing request:", { start, end, timeOfDay });

      const systemPrompt = `You are an AI routing expert for emergency ambulance services. Provide ultra-concise analysis with specific numbers.`;

      const userPrompt = `Emergency Route Analysis:
Start: [${start[0]}, ${start[1]}] | End: [${end[0]}, ${end[1]}]
Time: ${timeOfDay} | Weather: ${weatherConditions}
Traffic: ${JSON.stringify(currentTraffic)}
Historical: ${JSON.stringify(historicalData)}

Provide 3 points, each on a new line, each with 2-3 specific numbers:
1. Traffic Status: [congestion level %] + [expected delay in minutes]
2. Recommendation: [specific action] + [time savings in minutes]
3. ETA Impact: [base time] + [delay] = [total ETA]

Format each point on its own line.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiRecommendations = data.choices[0].message.content;

    console.log("AI recommendations generated successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        recommendations: aiRecommendations,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    console.error("Error in ai-route-optimizer:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
