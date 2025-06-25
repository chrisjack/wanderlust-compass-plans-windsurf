
-- Create function to insert agent invitations
CREATE OR REPLACE FUNCTION public.insert_agent_invitation(agent_email TEXT, inviter_id UUID)
RETURNS SETOF agent_invitations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_invitation public.agent_invitations;
BEGIN
    INSERT INTO public.agent_invitations (email, invited_by)
    VALUES (agent_email, inviter_id)
    RETURNING * INTO new_invitation;
    
    RETURN NEXT new_invitation;
END;
$$;
