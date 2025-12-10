import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NOTION_API_KEY = Deno.env.get('NOTION_API_KEY');
const NOTION_DATABASE_ID = Deno.env.get('NOTION_DATABASE_ID');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    console.log(`Notion sync action: ${action}`, data);

    if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
      console.error('Missing Notion credentials');
      return new Response(
        JSON.stringify({ success: false, error: 'Notion credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'create_candidate') {
      // Create a new page in Notion with candidate data
      const { nomeCompleto, telefoneWhatsApp, cargoAtual, instagram, candidatoId } = data;
      
      const uniqueId = `DISC-${candidatoId.substring(0, 8).toUpperCase()}`;
      const today = new Date().toISOString().split('T')[0];

      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          parent: { database_id: NOTION_DATABASE_ID },
          properties: {
            'ID': {
              title: [{ text: { content: uniqueId } }],
            },
            'Nome Completo': {
              rich_text: [{ text: { content: nomeCompleto } }],
            },
            'Telefone / WhatsApp': {
              phone_number: telefoneWhatsApp,
            },
            'Cargo Atual': {
              rich_text: [{ text: { content: cargoAtual } }],
            },
            'Instagram': {
              rich_text: [{ text: { content: instagram } }],
            },
            'Data': {
              date: { start: today },
            },
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Notion API error:', result);
        return new Response(
          JSON.stringify({ success: false, error: result.message || 'Notion API error' }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Created Notion page:', result.id);
      return new Response(
        JSON.stringify({ success: true, notionPageId: result.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update_profile') {
      // Update an existing Notion page with DISC profile results
      const { notionPageId, perfilResultado } = data;

      const response = await fetch(`https://api.notion.com/v1/pages/${notionPageId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          properties: {
            'PERFIL': {
              rich_text: [{ text: { content: perfilResultado } }],
            },
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Notion API error:', result);
        return new Response(
          JSON.stringify({ success: false, error: result.message || 'Notion API error' }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Updated Notion page with profile:', result.id);
      return new Response(
        JSON.stringify({ success: true, notionPageId: result.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in notion-sync function:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
