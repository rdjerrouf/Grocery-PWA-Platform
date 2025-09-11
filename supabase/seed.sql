-- Insert a test grocery store
INSERT INTO tenants (slug, name, name_ar, name_fr, contact_phone, address) VALUES
('ahmed-grocery', 'Ahmed Grocery Store', 'بقالة أحمد', 'Épicerie Ahmed', '0555123456', '123 Rue de la Liberté, Alger');

-- Get the tenant ID for reference
DO $$
DECLARE
    tenant_uuid UUID;
BEGIN
    SELECT id INTO tenant_uuid FROM tenants WHERE slug = 'ahmed-grocery';
    
    -- Insert grocery categories
    INSERT INTO categories (tenant_id, name, name_ar, name_fr, slug) VALUES
    (tenant_uuid, 'Dairy & Eggs', 'ألبان وبيض', 'Produits laitiers et œufs', 'dairy-eggs'),
    (tenant_uuid, 'Fruits & Vegetables', 'فواكه وخضروات', 'Fruits et légumes', 'fruits-vegetables'),
    (tenant_uuid, 'Meat & Poultry', 'لحوم ودواجن', 'Viande et volaille', 'meat-poultry'),
    (tenant_uuid, 'Beverages', 'مشروبات', 'Boissons', 'beverages');
    
    -- Insert sample products
    INSERT INTO products (tenant_id, category_id, name, name_ar, name_fr, price, stock_quantity, unit, weight) VALUES
    (tenant_uuid, (SELECT id FROM categories WHERE slug = 'dairy-eggs' AND tenant_id = tenant_uuid), 
     'Fresh Milk 1L', 'حليب طازج 1 لتر', 'Lait frais 1L', 120.00, 50, 'bottle', 1.0),
    (tenant_uuid, (SELECT id FROM categories WHERE slug = 'fruits-vegetables' AND tenant_id = tenant_uuid),
     'Bananas', 'موز', 'Bananes', 200.00, 30, 'kg', 1.0),
    (tenant_uuid, (SELECT id FROM categories WHERE slug = 'beverages' AND tenant_id = tenant_uuid),
     'Mineral Water 1.5L', 'مياه معدنية 1.5 لتر', 'Eau minérale 1.5L', 50.00, 100, 'bottle', 1.5);
END $$;

