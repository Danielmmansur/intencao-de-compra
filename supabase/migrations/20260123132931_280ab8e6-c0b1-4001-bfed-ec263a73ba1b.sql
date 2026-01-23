-- Fix RLS policies for clients table
-- Users should only see/modify clients associated with their own proposals

-- Drop existing permissive policies on clients
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can create clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON public.clients;

-- Create secure policies for clients table
-- Users can view clients that are linked to their proposals (or if they are admin/gerente)
CREATE POLICY "Users can view own proposal clients"
ON public.clients
FOR SELECT
USING (
  -- User is admin or gerente (can see all)
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'gerente'::app_role) OR
  -- Client is linked to one of user's proposals
  id IN (
    SELECT pc.client_id 
    FROM public.proposal_clients pc
    JOIN public.proposals p ON pc.proposal_id = p.id
    WHERE p.created_by = auth.uid()
  )
);

-- Users can create clients (will be linked to their proposal)
CREATE POLICY "Users can create clients"
ON public.clients
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update clients linked to their proposals
CREATE POLICY "Users can update own proposal clients"
ON public.clients
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'gerente'::app_role) OR
  id IN (
    SELECT pc.client_id 
    FROM public.proposal_clients pc
    JOIN public.proposals p ON pc.proposal_id = p.id
    WHERE p.created_by = auth.uid()
  )
);

-- Fix RLS policies for proposal_clients table
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Manage proposal clients" ON public.proposal_clients;
DROP POLICY IF EXISTS "View proposal clients" ON public.proposal_clients;

-- Users can view proposal_clients for their own proposals
CREATE POLICY "Users can view own proposal_clients"
ON public.proposal_clients
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'gerente'::app_role) OR
  proposal_id IN (
    SELECT id FROM public.proposals WHERE created_by = auth.uid()
  )
);

-- Users can insert proposal_clients for their own proposals
CREATE POLICY "Users can create own proposal_clients"
ON public.proposal_clients
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'gerente'::app_role) OR
  proposal_id IN (
    SELECT id FROM public.proposals WHERE created_by = auth.uid()
  )
);

-- Users can update proposal_clients for their own proposals
CREATE POLICY "Users can update own proposal_clients"
ON public.proposal_clients
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'gerente'::app_role) OR
  proposal_id IN (
    SELECT id FROM public.proposals WHERE created_by = auth.uid()
  )
);

-- Users can delete proposal_clients for their own proposals
CREATE POLICY "Users can delete own proposal_clients"
ON public.proposal_clients
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'gerente'::app_role) OR
  proposal_id IN (
    SELECT id FROM public.proposals WHERE created_by = auth.uid()
  )
);