-- Add contract_cost column to projects table
ALTER TABLE public.projects 
ADD COLUMN contract_cost DECIMAL(15, 2);

-- Comment on column
COMMENT ON COLUMN public.projects.contract_cost IS 'The contract cost of the project';
