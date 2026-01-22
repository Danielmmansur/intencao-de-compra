-- Enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'gerente', 'corretor');

-- Enum for proposal status
CREATE TYPE public.proposal_status AS ENUM ('rascunho', 'enviada', 'aprovada', 'cancelada');

-- Enum for campaign status
CREATE TYPE public.campaign_status AS ENUM ('pendente', 'aprovada', 'rejeitada');

-- Profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'corretor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Real estate agencies
CREATE TABLE public.imobiliarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Brokers/Agents
CREATE TABLE public.corretores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  imobiliaria_id UUID REFERENCES public.imobiliarias(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  creci TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Real estate developments
CREATE TABLE public.empreendimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- System settings
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  max_income_commitment DECIMAL(5,2) DEFAULT 30.00 NOT NULL,
  default_construction_rate DECIMAL(5,4) DEFAULT 0.0090 NOT NULL,
  default_pdf_text TEXT,
  default_phases JSONB DEFAULT '[
    {"name": "Fundação", "percentage": 15, "duration_months": 3},
    {"name": "Estrutura", "percentage": 40, "duration_months": 6},
    {"name": "Acabamento", "percentage": 75, "duration_months": 8},
    {"name": "Conclusão", "percentage": 100, "duration_months": 3}
  ]'::jsonb NOT NULL,
  default_entry_bands JSONB DEFAULT '[
    {"parcels": 10, "percentage": 40},
    {"parcels": 10, "percentage": 25},
    {"parcels": 20, "percentage": 20},
    {"parcels": 20, "percentage": 15}
  ]'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Clients/Proponents
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  birth_date DATE,
  phone TEXT,
  email TEXT,
  address TEXT,
  monthly_income DECIMAL(12,2) DEFAULT 0 NOT NULL,
  family_composition TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Main proposals/simulations
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status proposal_status DEFAULT 'rascunho' NOT NULL,
  
  -- Imóvel data
  empreendimento_id UUID REFERENCES public.empreendimentos(id) ON DELETE SET NULL,
  property_block TEXT,
  property_unit TEXT,
  sale_value DECIMAL(12,2),
  appraisal_value DECIMAL(12,2),
  
  -- Carta de aprovação
  approved_value DECIMAL(12,2),
  subsidy DECIMAL(12,2) DEFAULT 0,
  fgts DECIMAL(12,2) DEFAULT 0,
  entry_value DECIMAL(12,2),
  financed_value DECIMAL(12,2),
  first_installment DECIMAL(12,2),
  bank TEXT DEFAULT 'Caixa',
  amortization_system TEXT DEFAULT 'SAC',
  
  -- Parâmetros
  entry_term_months INTEGER DEFAULT 60,
  simulation_start_date DATE DEFAULT CURRENT_DATE,
  construction_months INTEGER DEFAULT 20,
  habite_se_date DATE,
  construction_rate DECIMAL(5,4) DEFAULT 0.0090,
  entry_bands JSONB,
  construction_phases JSONB,
  apply_annual_adjustment BOOLEAN DEFAULT false,
  
  -- Intermediadores
  imobiliaria_id UUID REFERENCES public.imobiliarias(id) ON DELETE SET NULL,
  corretor_id UUID REFERENCES public.corretores(id) ON DELETE SET NULL,
  coordinator_name TEXT,
  manager_name TEXT,
  
  -- Metadata
  notes TEXT,
  pdf_url TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Link table for proposal clients (multiple proponents)
CREATE TABLE public.proposal_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  is_main_proponent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (proposal_id, client_id)
);

-- Campaigns and special conditions
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('fixed', 'percentage')),
  discount_value DECIMAL(12,2),
  bonus_description TEXT,
  bonus_value DECIMAL(12,2),
  special_conditions TEXT,
  status campaign_status DEFAULT 'pendente' NOT NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Proposal history
CREATE TABLE public.proposal_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imobiliarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corretores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empreendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for imobiliarias (authenticated users can read)
CREATE POLICY "Authenticated users can view imobiliarias" ON public.imobiliarias
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage imobiliarias" ON public.imobiliarias
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for corretores
CREATE POLICY "Authenticated users can view corretores" ON public.corretores
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage corretores" ON public.corretores
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for empreendimentos
CREATE POLICY "Authenticated users can view empreendimentos" ON public.empreendimentos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage empreendimentos" ON public.empreendimentos
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for system_settings
CREATE POLICY "Authenticated users can view settings" ON public.system_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage settings" ON public.system_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for clients
CREATE POLICY "Authenticated users can view clients" ON public.clients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create clients" ON public.clients
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients" ON public.clients
  FOR UPDATE TO authenticated USING (true);

-- RLS Policies for proposals
CREATE POLICY "Users can view own proposals" ON public.proposals
  FOR SELECT TO authenticated USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'gerente') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create proposals" ON public.proposals
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own proposals" ON public.proposals
  FOR UPDATE TO authenticated USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'gerente') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own proposals" ON public.proposals
  FOR DELETE TO authenticated USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for proposal_clients
CREATE POLICY "View proposal clients" ON public.proposal_clients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Manage proposal clients" ON public.proposal_clients
  FOR ALL TO authenticated USING (true);

-- RLS Policies for campaigns
CREATE POLICY "View campaigns" ON public.campaigns
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Create campaigns" ON public.campaigns
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Managers can approve campaigns" ON public.campaigns
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'gerente') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for proposal_history
CREATE POLICY "View proposal history" ON public.proposal_history
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Create proposal history" ON public.proposal_history
  FOR INSERT TO authenticated WITH CHECK (true);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'corretor');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default system settings
INSERT INTO public.system_settings (id) VALUES (gen_random_uuid());