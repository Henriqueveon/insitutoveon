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
    const body = await req.json();
    const email = body.email;
    // IMPORTANTE: Normalizar o código - remover espaços e garantir que é string
    const codigo = String(body.codigo || '').trim().replace(/\s/g, '');

    console.log('=== VERIFY OTP DEBUG ===');
    console.log('Email recebido:', email);
    console.log('Código recebido (normalizado):', codigo);
    console.log('Código length:', codigo.length);

    if (!email || !codigo) {
      return new Response(
        JSON.stringify({ success: false, valid: false, error: 'Email e código são obrigatórios' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (codigo.length !== 6) {
      return new Response(
        JSON.stringify({ success: false, valid: false, error: 'O código deve ter 6 dígitos' }),
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
    const agora = new Date();
    const agoraISO = agora.toISOString();

    console.log('Email normalizado:', emailLower);
    console.log('Hora atual (ISO):', agoraISO);

    // Buscar TODOS os OTPs deste email (para debug e para encontrar o correto)
    const { data: todosOtps, error: fetchError } = await supabase
      .from('email_otps')
      .select('*')
      .eq('email', emailLower)
      .order('created_at', { ascending: false })
      .limit(10);

    console.log('Fetch error:', fetchError?.message || 'nenhum');
    console.log('Total OTPs encontrados:', todosOtps?.length || 0);

    if (fetchError) {
      console.error('Erro ao buscar OTPs:', fetchError);
      return new Response(
        JSON.stringify({ success: false, valid: false, error: 'Erro ao verificar código. Tente novamente.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!todosOtps || todosOtps.length === 0) {
      console.log('Nenhum OTP encontrado para este email');
      return new Response(
        JSON.stringify({ success: false, valid: false, error: 'Nenhum código encontrado. Solicite um novo.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log de todos os OTPs para debug
    console.log('=== TODOS OS OTPs ===');
    todosOtps.forEach((otp, i) => {
      const codigoBanco = String(otp.codigo).trim();
      const match = codigoBanco === codigo;
      const expiraEmDate = new Date(otp.expira_em);
      const expirado = expiraEmDate < agora;

      console.log(`OTP ${i + 1}:`, {
        id: otp.id,
        codigo_banco: codigoBanco,
        codigo_digitado: codigo,
        match: match,
        verificado: otp.verificado,
        expira_em: otp.expira_em,
        expirado: expirado,
        tentativas: otp.tentativas
      });
    });

    // Encontrar OTP que corresponde ao código digitado
    const otpEncontrado = todosOtps.find(otp => {
      const codigoBanco = String(otp.codigo).trim();
      return codigoBanco === codigo;
    });

    console.log('OTP encontrado com código correspondente:', otpEncontrado ? 'SIM' : 'NAO');

    if (!otpEncontrado) {
      // Código incorreto - incrementar tentativas no OTP mais recente não verificado
      const otpMaisRecente = todosOtps.find(otp => !otp.verificado);
      if (otpMaisRecente) {
        const novasTentativas = (otpMaisRecente.tentativas || 0) + 1;
        await supabase
          .from('email_otps')
          .update({ tentativas: novasTentativas })
          .eq('id', otpMaisRecente.id);

        if (novasTentativas >= 5) {
          return new Response(
            JSON.stringify({ success: false, valid: false, error: 'Muitas tentativas incorretas. Solicite um novo código.' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({ success: false, valid: false, error: 'Código incorreto. Verifique e tente novamente.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se já foi usado
    if (otpEncontrado.verificado) {
      console.log('OTP já foi verificado anteriormente');
      return new Response(
        JSON.stringify({ success: false, valid: false, error: 'Este código já foi utilizado. Solicite um novo.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar expiração
    const expiraEmDate = new Date(otpEncontrado.expira_em);
    if (expiraEmDate < agora) {
      console.log('OTP expirado. Expira em:', expiraEmDate.toISOString(), 'Agora:', agoraISO);
      return new Response(
        JSON.stringify({ success: false, valid: false, error: 'Código expirado. Solicite um novo.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar tentativas
    if ((otpEncontrado.tentativas || 0) >= 5) {
      return new Response(
        JSON.stringify({ success: false, valid: false, error: 'Muitas tentativas. Solicite um novo código.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SUCESSO! Marcar como verificado
    console.log('Marcando OTP como verificado:', otpEncontrado.id);

    const { error: updateError } = await supabase
      .from('email_otps')
      .update({
        verificado: true,
        verificado_em: agoraISO
      })
      .eq('id', otpEncontrado.id);

    if (updateError) {
      console.error('Erro ao marcar OTP como verificado:', updateError);
      // Mesmo com erro no update, consideramos válido pois o código estava correto
    }

    console.log('=== OTP VERIFICADO COM SUCESSO ===');
    console.log('Email:', emailLower);

    return new Response(
      JSON.stringify({
        success: true,
        valid: true,
        message: 'Código verificado com sucesso!',
        email: emailLower
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro inesperado:', error);
    return new Response(
      JSON.stringify({ success: false, valid: false, error: 'Erro interno do servidor: ' + String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
