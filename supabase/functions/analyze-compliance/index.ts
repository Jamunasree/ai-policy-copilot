import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SOC2_CONTROLS = [
  'Access Control',
  'Data Encryption',
  'Incident Response',
  'Logging and Monitoring',
  'Employee Security Training',
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentText } = await req.json();

    if (!documentText || documentText.length < 50) {
      return new Response(
        JSON.stringify({ error: 'Document text is required and must be at least 50 characters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a SOC2 compliance expert. Analyze the provided policy document and evaluate its coverage of the following SOC2 security controls:

${SOC2_CONTROLS.map((c, i) => `${i + 1}. ${c}`).join('\n')}

For each control, determine if the document adequately addresses it. A control is "covered" if the document contains specific policies, procedures, or requirements that address that control area. A control is "missing" if there is no mention or insufficient coverage.

You must respond with a valid JSON object in this exact format:
{
  "covered": ["list of covered control names"],
  "missing": ["list of missing control names"],
  "reasoning": {
    "Control Name": "Brief explanation of why it's covered or missing"
  }
}

Be strict in your assessment. Only mark a control as covered if there is clear, specific policy language addressing it.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please analyze the following policy document for SOC2 compliance:\n\n${documentText.substring(0, 30000)}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('Failed to analyze document with AI');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI model');
    }

    // Parse the JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate the response structure
    if (!result.covered || !result.missing || !result.reasoning) {
      throw new Error('Invalid response structure from AI');
    }

    console.log('Analysis complete:', { 
      covered: result.covered.length, 
      missing: result.missing.length 
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in analyze-compliance:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
