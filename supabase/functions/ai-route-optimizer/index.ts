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

    const systemPrompt = `You are an AI traffic and routing expert for emergency medical services. 
Your role is to analyze traffic patterns, predict congestion, and recommend optimal routes for ambulances.
Consider factors like:
- Current traffic conditions
- Historical traffic patterns
- Time of day
- Weather conditions
- Emergency vehicle priority routes
- Hospital proximity and capacity

Provide actionable insights and route recommendations that can save critical minutes in emergency situations.`;

    const userPrompt = `Analyze the following emergency route scenario and provide intelligent routing recommendations:

**Route Details:**
- Start: ${JSON.stringify(start)}
- Destination: ${JSON.stringify(end)}
- Time: ${timeOfDay || 'Current time'}
- Weather: ${weatherConditions || 'Normal'}

**Current Traffic:**
${JSON.stringify(currentTraffic, null, 2)}

**Historical Patterns:**
${historicalData ? JSON.stringify(historicalData, null, 2) : 'Not available'}

Please provide:
1. Traffic prediction for the next 30 minutes
2. Recommended route adjustments based on patterns
3. Alternative routes if primary route shows high congestion risk
4. Estimated time savings with AI optimization
5. Critical alerts or warnings

Format your response as actionable recommendations.`;

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
