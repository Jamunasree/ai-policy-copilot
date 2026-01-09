import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { control, documentText } = await req.json();

    if (!control) {
      return new Response(
        JSON.stringify({ error: 'Control name is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a SOC2 compliance expert and technical writer. Generate a comprehensive, enterprise-grade security policy for the specified control area.

The policy should:
1. Be professional and suitable for a corporate environment
2. Follow SOC2 Type II requirements
3. Include clear sections: Purpose, Scope, Policy Statement, Procedures, Responsibilities, and Compliance
4. Be specific and actionable, not vague
5. Reference industry standards where appropriate (NIST, ISO 27001, etc.)
6. Be ready for immediate adoption by an organization

Format the policy in a clean, readable structure with clear headings and bullet points where appropriate.`;

    const userPrompt = documentText 
      ? `Generate a comprehensive SOC2-compliant policy for "${control}". 
         
Here is the organization's existing policy document for context (use this to match their tone and terminology):
${documentText.substring(0, 5000)}

Create a policy that would complement their existing documentation.`
      : `Generate a comprehensive SOC2-compliant policy for "${control}". 
         
Create a professional, enterprise-grade policy that an organization could adopt immediately.`;

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
          { role: 'user', content: userPrompt }
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
      
      throw new Error('Failed to generate policy with AI');
    }

    const data = await response.json();
    const policy = data.choices?.[0]?.message?.content;

    if (!policy) {
      throw new Error('No response from AI model');
    }

    console.log('Policy generated for:', control);

    return new Response(
      JSON.stringify({ policy }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in generate-policy:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
