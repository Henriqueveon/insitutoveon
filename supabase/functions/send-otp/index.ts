import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface OTPRequest {
  email: string;
  tipo?: string;
  nome?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, tipo = 'cadastro_empresa', nome = '' }: OTPRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se RESEND_API_KEY está configurada
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY não configurada');
      return new Response(
        JSON.stringify({ success: false, error: 'Serviço de email não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Criar OTP no banco
    const { data: otpResult, error: otpError } = await supabase.rpc('criar_otp', {
      p_email: email,
      p_tipo: tipo,
    });

    if (otpError || !otpResult?.success) {
      console.error('Erro ao criar OTP:', otpError || otpResult?.error);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao gerar código de verificação' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const codigo = otpResult.codigo;

    // Enviar email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // TEMPORÁRIO: Usando email de teste do Resend
        // Quando tiver domínio próprio verificado, alterar para: 'Instituto Veon <noreply@institutoveon.com.br>'
        from: 'Instituto Veon <onboarding@resend.dev>',
        to: [email],
        subject: `Seu código de verificação: ${codigo}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Instituto Veon</h1>
                        <p style="color: #a0c4e8; margin: 10px 0 0 0; font-size: 14px;">Plataforma de Recrutamento</p>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="color: #1e3a5f; margin: 0 0 20px 0; font-size: 22px;">Verificação de Email</h2>

                        ${nome ? `<p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Olá, <strong>${nome}</strong>!</p>` : ''}

                        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                          Use o código abaixo para verificar seu email e completar seu cadastro na plataforma de recrutamento do Instituto Veon.
                        </p>

                        <!-- OTP Code Box -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td align="center">
                              <div style="background-color: #f8f9fa; border: 2px dashed #1e3a5f; border-radius: 8px; padding: 25px 40px; display: inline-block;">
                                <span style="font-size: 36px; font-weight: bold; color: #1e3a5f; letter-spacing: 8px; font-family: 'Courier New', monospace;">${codigo}</span>
                              </div>
                            </td>
                          </tr>
                        </table>

                        <p style="color: #888; font-size: 14px; margin: 30px 0 0 0; text-align: center;">
                          ⏱️ Este código expira em <strong>10 minutos</strong>
                        </p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

                        <p style="color: #999; font-size: 13px; line-height: 1.5; margin: 0;">
                          Se você não solicitou este código, por favor ignore este email. Sua conta permanece segura.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8f9fa; padding: 25px 40px; text-align: center; border-radius: 0 0 12px 12px;">
                        <p style="color: #888; font-size: 12px; margin: 0;">
                          © ${new Date().getFullYear()} Instituto Veon. Todos os direitos reservados.
                        </p>
                        <p style="color: #aaa; font-size: 11px; margin: 10px 0 0 0;">
                          Este é um email automático. Por favor, não responda.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('Erro Resend:', errorData);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao enviar email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailResult = await emailResponse.json();
    console.log('Email enviado:', emailResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Código enviado para o email',
        email_masked: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro inesperado:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
