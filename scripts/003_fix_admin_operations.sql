-- Remove RLS policies on products, employees, medicine_requirements, and sales_reports
-- to allow admin operations through the client

-- Disable RLS on products table if not already disabled (admin needs to manage products)
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Disable RLS on employees table (admin needs to manage employees)
ALTER TABLE public.employees DISABLE ROW LEVEL SECURITY;

-- Disable RLS on medicine_requirements table
ALTER TABLE public.medicine_requirements DISABLE ROW LEVEL SECURITY;

-- Disable RLS on sales_reports table
ALTER TABLE public.sales_reports DISABLE ROW LEVEL SECURITY;

-- Create a trigger to auto-update medicine_requirements when stock changes
CREATE OR REPLACE FUNCTION update_medicine_requirement_on_product_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE medicine_requirements
  SET current_stock = NEW.stock_quantity,
      updated_at = NOW()
  WHERE product_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS medicine_requirement_update_trigger ON products;
CREATE TRIGGER medicine_requirement_update_trigger
AFTER UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_medicine_requirement_on_product_change();
