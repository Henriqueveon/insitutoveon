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
    const { email, tipo = 'verificacao', nome = '' }: OTPRequest = await req.json();

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

    // Gerar código de 6 dígitos como STRING
    const codigoNumero = Math.floor(100000 + Math.random() * 900000);
    const codigo = String(codigoNumero);
    const emailLower = email.toLowerCase().trim();

    console.log('=== SEND OTP DEBUG ===');
    console.log('Email:', emailLower);
    console.log('Código gerado:', codigo);
    console.log('Código tipo:', typeof codigo);

    // NÃO invalidar OTPs anteriores - deixar que expirem naturalmente
    // Isso evita race conditions e problemas de timing

    // Criar novo OTP (expira em 30 minutos)
    const expiraEm = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    console.log('Expira em:', expiraEm);

    const { data: insertedOtp, error: otpError } = await supabase
      .from('email_otps')
      .insert({
        email: emailLower,
        codigo: codigo, // Garantir que é string
        tipo,
        expira_em: expiraEm,
        tentativas: 0,
        max_tentativas: 5,
        verificado: false,
      })
      .select()
      .single();

    if (otpError) {
      console.error('Erro ao criar OTP:', otpError);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao gerar código de verificação: ' + otpError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('OTP criado com sucesso:', {
      id: insertedOtp?.id,
      codigo: insertedOtp?.codigo,
      email: insertedOtp?.email
    });

    // Enviar email via Resend com domínio verificado
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Veon Recrutamento <noreply@assessoriaveon.com>',
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
                      <td style="background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Veon Recrutamento</h1>
                        <p style="color: #93C5FD; margin: 10px 0 0 0; font-size: 14px;">Plataforma de Recrutamento Inteligente</p>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="color: #1E3A8A; margin: 0 0 20px 0; font-size: 22px;">Código de Verificação</h2>

                        ${nome ? `<p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Olá, <strong>${nome}</strong>!</p>` : '<p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Olá!</p>'}

                        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                          Use o código abaixo para verificar seu email e continuar seu acesso à plataforma.
                        </p>

                        <!-- OTP Code Box -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td align="center">
                              <div style="background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%); border-radius: 12px; padding: 30px 40px; display: inline-block;">
                                <span style="font-size: 42px; font-weight: bold; color: #1E3A8A; letter-spacing: 8px; font-family: 'Courier New', monospace;">${codigo}</span>
                              </div>
                            </td>
                          </tr>
                        </table>

                        <p style="color: #6B7280; font-size: 14px; margin: 30px 0 0 0; text-align: center;">
                          Este código expira em <strong>30 minutos</strong>
                        </p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

                        <p style="color: #999; font-size: 13px; line-height: 1.5; margin: 0;">
                          Se você não solicitou este código, por favor ignore este email. Sua conta permanece segura.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #F9FAFB; padding: 25px 40px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #E5E7EB;">
                        <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                          © ${new Date().getFullYear()} Instituto Veon. Todos os direitos reservados.
                        </p>
                        <p style="color: #9CA3AF; font-size: 11px; margin: 10px 0 0 0;">
                          Cascavel, PR - Brasil
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
    console.log('Email enviado com sucesso:', emailResult);

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
