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

    console.log('Verificando OTP para:', email);

    if (!email || !codigo) {
      // SEMPRE retornar 200 para evitar erro no supabase.functions.invoke
      return new Response(
        JSON.stringify({ success: false, valid: false, error: 'Email e código são obrigatórios' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    const emailLower = email.toLowerCase().trim();
    const agora = new Date().toISOString();

    console.log('Hora atual (ISO):', agora);

    // Primeiro, buscar TODOS os OTPs deste email para debug
    const { data: todosOtps } = await supabase
      .from('email_otps')
      .select('id, codigo, verificado, expira_em, created_at')
      .eq('email', emailLower)
      .order('created_at', { ascending: false })
      .limit(5);

    console.log('OTPs encontrados para este email:', JSON.stringify(todosOtps, null, 2));

    // Buscar OTP pelo código (sem filtro de expiração primeiro)
    const { data: otpPorCodigo } = await supabase
      .from('email_otps')
      .select('*')
      .eq('email', emailLower)
      .eq('codigo', codigo)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    console.log('OTP com este código:', otpPorCodigo ? {
      id: otpPorCodigo.id,
      verificado: otpPorCodigo.verificado,
      expira_em: otpPorCodigo.expira_em,
      agora: agora,
      expirado: otpPorCodigo.expira_em < agora
    } : 'não encontrado');

    // Buscar OTP válido (não verificado, não expirado)
    const { data: otp, error: selectError } = await supabase
      .from('email_otps')
      .select('*')
      .eq('email', emailLower)
      .eq('codigo', codigo)
      .eq('verificado', false)
      .gt('expira_em', agora)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    console.log('Busca OTP válido resultado:', { otp: !!otp, error: selectError?.message });

    if (selectError || !otp) {
      // Determinar motivo específico do erro
      let motivoErro = 'Código inválido ou expirado';

      if (otpPorCodigo) {
        if (otpPorCodigo.verificado) {
          motivoErro = 'Este código já foi utilizado. Solicite um novo.';
        } else if (otpPorCodigo.expira_em < agora) {
          motivoErro = 'Código expirado. Solicite um novo.';
        }
      } else {
        motivoErro = 'Código incorreto. Verifique e tente novamente.';
      }

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
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({
          success: false,
          valid: false,
          error: motivoErro
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Marcar como verificado
    const { error: updateError } = await supabase
      .from('email_otps')
      .update({
        verificado: true,
        verificado_em: new Date().toISOString()
      })
      .eq('id', otp.id);

    if (updateError) {
      console.error('Erro ao marcar OTP como verificado:', updateError);
    }

    // Verificar se usuário já existe no auth (busca específica)
    let userExists = false;
    try {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(emailLower);
      userExists = !userError && !!userData?.user;
    } catch (e) {
      console.log('Usuário não encontrado no auth (normal para novos cadastros)');
    }

    console.log('OTP verificado com sucesso para:', emailLower);

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
    // SEMPRE retornar 200 para evitar erro no supabase.functions.invoke
    return new Response(
      JSON.stringify({ success: false, valid: false, error: 'Erro interno do servidor: ' + String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
