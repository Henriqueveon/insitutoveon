import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyOTPRequest {
  email: string;
  codigo: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, codigo }: VerifyOTPRequest = await req.json();

    if (!email || !codigo) {
      return new Response(
        JSON.stringify({ success: false, valid: false, error: 'Email e código são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    const emailLower = email.toLowerCase();

    // Buscar OTP válido (não verificado, não expirado)
    const { data: otp, error: selectError } = await supabase
      .from('email_otps')
      .select('*')
      .eq('email', emailLower)
      .eq('codigo', codigo)
      .eq('verificado', false)
      .gt('expira_em', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (selectError || !otp) {
      // Incrementar tentativas no OTP mais recente (se existir)
      const { data: lastOtp } = await supabase
        .from('email_otps')
        .select('id, tentativas, max_tentativas')
        .eq('email', emailLower)
        .eq('verificado', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastOtp) {
        await supabase
          .from('email_otps')
          .update({ tentativas: (lastOtp.tentativas || 0) + 1 })
          .eq('id', lastOtp.id);

        // Verificar se excedeu tentativas
        if ((lastOtp.tentativas || 0) + 1 >= (lastOtp.max_tentativas || 3)) {
          return new Response(
            JSON.stringify({
              success: false,
              valid: false,
              error: 'Muitas tentativas incorretas. Solicite um novo código.'
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({
          success: false,
          valid: false,
          error: 'Código inválido ou expirado'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar max tentativas
    if ((otp.tentativas || 0) >= (otp.max_tentativas || 3)) {
      return new Response(
        JSON.stringify({
          success: false,
          valid: false,
          error: 'Muitas tentativas. Solicite um novo código.'
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Marcar como verificado
    await supabase
      .from('email_otps')
      .update({
        verificado: true,
        verificado_em: new Date().toISOString()
      })
      .eq('id', otp.id);

    // Verificar se usuário já existe no auth
    let userExists = false;
    try {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      userExists = existingUsers?.users?.some(
        u => u.email?.toLowerCase() === emailLower
      ) || false;
    } catch (e) {
      console.error('Erro ao verificar usuário existente:', e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        valid: true,
        message: 'Código verificado com sucesso!',
        email: emailLower,
        user_exists: userExists
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro inesperado:', error);
    return new Response(
      JSON.stringify({ success: false, valid: false, error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
