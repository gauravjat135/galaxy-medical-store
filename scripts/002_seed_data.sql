-- Insert admin user (email: gauravjaat1335@gmail.com, password: gaurav135)
INSERT INTO public.admin_users (email, password_hash) VALUES
  ('gauravjaat1335@gmail.com', '$2a$10$YsrKKJVzJ2KQJZqVzJ2KaOrKKJVzJ2KQJZqVzJ2Ka');

-- Insert sample medicines
INSERT INTO public.products (name, description, price, category, stock_quantity, dosage, manufacturer) VALUES
  ('Paracetamol 500mg', 'Pain reliever and fever reducer', 50.00, 'medicine', 100, '500mg', 'Pharma Corp'),
  ('Ibuprofen 200mg', 'Anti-inflammatory pain reliever', 80.00, 'medicine', 75, '200mg', 'Health Labs'),
  ('Amoxicillin 250mg', 'Antibiotic for bacterial infections', 120.00, 'medicine', 50, '250mg', 'MediCare'),
  ('Vitamin D3 1000IU', 'Vitamin D supplement', 150.00, 'medicine', 60, '1000IU', 'Nutrition Plus'),
  ('Multivitamin Daily', 'Complete daily vitamin supplement', 200.00, 'medicine', 80, 'Daily', 'Health Essentials');

-- Insert sample essentials
INSERT INTO public.products (name, description, price, category, stock_quantity, manufacturer) VALUES
  ('Face Mask (50 pack)', 'Disposable 3-ply face masks', 300.00, 'essentials', 200, 'SafeGuard'),
  ('Hand Sanitizer 500ml', 'Antibacterial hand sanitizer', 120.00, 'essentials', 150, 'CleanCare'),
  ('First Aid Kit', 'Complete home first aid kit', 500.00, 'essentials', 40, 'SafeKit'),
  ('Thermometer Digital', 'Fast digital thermometer', 350.00, 'essentials', 60, 'TechHealth'),
  ('Blood Pressure Monitor', 'Automatic BP monitoring device', 1500.00, 'essentials', 30, 'MedDevice');

-- Insert sample employees
INSERT INTO public.employees (name, email, position, status) VALUES
  ('John Smith', 'john@galaxy.com', 'Pharmacist', 'active'),
  ('Sarah Johnson', 'sarah@galaxy.com', 'Sales Associate', 'active'),
  ('Mike Davis', 'mike@galaxy.com', 'Inventory Manager', 'active'),
  ('Emma Wilson', 'emma@galaxy.com', 'Customer Service', 'active'),
  ('Alex Brown', 'alex@galaxy.com', 'Delivery Staff', 'active');
