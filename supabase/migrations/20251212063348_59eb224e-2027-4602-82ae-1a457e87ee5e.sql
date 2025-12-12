-- Deletar usuário existente e recriar corretamente
DELETE FROM public.user_roles WHERE user_id = '06a75ffe-4dfb-4b7a-9517-02d985129071';
DELETE FROM public.profiles WHERE id = '06a75ffe-4dfb-4b7a-9517-02d985129071';
DELETE FROM auth.users WHERE id = '06a75ffe-4dfb-4b7a-9517-02d985129071';