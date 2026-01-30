-- Fix PUBLIC_DATA_EXPOSURE: Restrict campaigns and proposal_history RLS policies
-- Users should only access data for proposals they own (or if admin/gerente)

-- Drop existing permissive policies on campaigns
DROP POLICY IF EXISTS "View campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Create campaigns" ON public.campaigns;

-- Users can only view campaigns for proposals they created or if admin/gerente
CREATE POLICY "Users can view own proposal campaigns"
ON public.campaigns
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'gerente'::app_role) OR
  proposal_id IN (
    SELECT id FROM public.proposals WHERE created_by = auth.uid()
  )
);

-- Users can only create campaigns for their own proposals
CREATE POLICY "Users can create campaigns for own proposals"
ON public.campaigns
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'gerente'::app_role) OR
  proposal_id IN (
    SELECT id FROM public.proposals WHERE created_by = auth.uid()
  )
);

-- Drop existing permissive policies on proposal_history
DROP POLICY IF EXISTS "View proposal history" ON public.proposal_history;
DROP POLICY IF EXISTS "Create proposal history" ON public.proposal_history;

-- Users can only view history for proposals they created or if admin/gerente
CREATE POLICY "Users can view own proposal history"
ON public.proposal_history
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'gerente'::app_role) OR
  proposal_id IN (
    SELECT id FROM public.proposals WHERE created_by = auth.uid()
  )
);

-- Users can only create history entries for their own proposals
CREATE POLICY "Users can create history for own proposals"
ON public.proposal_history
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'gerente'::app_role) OR
  proposal_id IN (
    SELECT id FROM public.proposals WHERE created_by = auth.uid()
  )
);