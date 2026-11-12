-- ==============================================================================
-- ESPAÑOL CON SABOR - POLÍTICA Y FUNCIÓN RPC DE CONSULTA DE MEMBRESÍAS
-- Ejecuta este script en el SQL Editor de Supabase (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. Política de Lectura Pública Segura para Suscripciones Activas
DROP POLICY IF EXISTS "Public can check active subscriptions" ON public.subscriptions;
CREATE POLICY "Public can check active subscriptions" 
ON public.subscriptions FOR SELECT 
USING (true);

-- 2. Función RPC Segura para Consultar Membresía del Estudiante por Email
CREATE OR REPLACE FUNCTION check_student_subscription(p_email TEXT)
RETURNS JSON AS $$
DECLARE
    v_sub RECORD;
BEGIN
    -- 1. Buscar suscripción activa con período vigente
    SELECT id, student_name, student_email, plan_name, credits_remaining, credits_per_cycle, current_period_end, status
    INTO v_sub
    FROM public.subscriptions
    WHERE lower(student_email) = lower(trim(p_email))
      AND status = 'active'
      AND current_period_end >= now()
    ORDER BY current_period_end DESC
    LIMIT 1;

    IF FOUND THEN
        RETURN json_build_object(
            'found', true,
            'success', true,
            'is_valid', true,
            'subscription_id', v_sub.id,
            'student_name', v_sub.student_name,
            'student_email', v_sub.student_email,
            'plan_name', v_sub.plan_name,
            'credits_remaining', v_sub.credits_remaining,
            'credits_per_cycle', v_sub.credits_per_cycle,
            'current_period_end', v_sub.current_period_end,
            'status', v_sub.status
        );
    ELSE
        -- 2. Si no hay activa vigente, verificar si existe una vencida, pausada o declinada
        SELECT id, student_name, student_email, plan_name, credits_remaining, current_period_end, status
        INTO v_sub
        FROM public.subscriptions
        WHERE lower(student_email) = lower(trim(p_email))
        ORDER BY updated_at DESC
        LIMIT 1;

        IF FOUND THEN
            RETURN json_build_object(
                'found', true,
                'success', false,
                'is_valid', false,
                'subscription_id', v_sub.id,
                'student_name', v_sub.student_name,
                'student_email', v_sub.student_email,
                'plan_name', v_sub.plan_name,
                'status', v_sub.status,
                'current_period_end', v_sub.current_period_end,
                'error', 'Subscription is ' || v_sub.status
            );
        ELSE
            RETURN json_build_object(
                'found', false,
                'success', false,
                'is_valid', false,
                'status', 'not_found',
                'error', 'No subscription found for this email'
            );
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
