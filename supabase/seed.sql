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
    
    -- Insert sample products with images
    INSERT INTO products (tenant_id, category_id, name, name_ar, name_fr, price, stock_quantity, unit, weight, image_url, sale_price, is_featured) VALUES
    -- Dairy & Eggs
    (tenant_uuid, (SELECT id FROM categories WHERE slug = 'dairy-eggs' AND tenant_id = tenant_uuid),
     'Fresh Milk 1L', 'حليب طازج 1 لتر', 'Lait frais 1L', 120.00, 50, 'bottle', 1.0, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop', NULL, true),
    (tenant_uuid, (SELECT id FROM categories WHERE slug = 'dairy-eggs' AND tenant_id = tenant_uuid),
     'Greek Yogurt', 'زبادي يوناني', 'Yaourt grec', 180.00, 25, 'cup', 0.2, 'https://images.unsplash.com/photo-1571212515416-d3db8c83f948?w=400&h=400&fit=crop', 150.00, false),
    (tenant_uuid, (SELECT id FROM categories WHERE slug = 'dairy-eggs' AND tenant_id = tenant_uuid),
     'Fresh Eggs (12 pcs)', 'بيض طازج (12 حبة)', 'Œufs frais (12 pcs)', 300.00, 40, 'dozen', 0.7, 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=400&h=400&fit=crop', NULL, false),

    -- Fruits & Vegetables
    (tenant_uuid, (SELECT id FROM categories WHERE slug = 'fruits-vegetables' AND tenant_id = tenant_uuid),
     'Bananas', 'موز', 'Bananes', 200.00, 30, 'kg', 1.0, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop', NULL, true),
    (tenant_uuid, (SELECT id FROM categories WHERE slug = 'fruits-vegetables' AND tenant_id = tenant_uuid),
     'Red Apples', 'تفاح أحمر', 'Pommes rouges', 250.00, 45, 'kg', 1.0, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop', 220.00, false),
    (tenant_uuid, (SELECT id FROM categories WHERE slug = 'fruits-vegetables' AND tenant_id = tenant_uuid),
     'Fresh Tomatoes', 'طماطم طازجة', 'Tomates fraîches', 180.00, 35, 'kg', 1.0, 'https://images.unsplash.com/photo-1546470427-5e6e572c4c50?w=400&h=400&fit=crop', NULL, false),
    (tenant_uuid, (SELECT id FROM categories WHERE slug = 'fruits-vegetables' AND tenant_id = tenant_uuid),
     'Green Lettuce', 'خس أخضر', 'Laitue verte', 80.00, 20, 'head', 0.3, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop', NULL, false),

    -- Meat & Poultry
    (tenant_uuid, (SELECT id FROM categories WHERE slug = 'meat-poultry' AND tenant_id = tenant_uuid),
     'Chicken Breast', 'صدر دجاج', 'Blanc de poulet', 800.00, 15, 'kg', 1.0, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop', 750.00, true),
    (tenant_uuid, (SELECT id FROM categories WHERE slug = 'meat-poultry' AND tenant_id = tenant_uuid),
     'Ground Beef', 'لحم مفروم', 'Bœuf haché', 1200.00, 10, 'kg', 1.0, 'https://images.unsplash.com/photo-1588347818377-b4d9ecf91e11?w=400&h=400&fit=crop', NULL, false),

    -- Beverages
    (tenant_uuid, (SELECT id FROM categories WHERE slug = 'beverages' AND tenant_id = tenant_uuid),
     'Mineral Water 1.5L', 'مياه معدنية 1.5 لتر', 'Eau minérale 1.5L', 50.00, 100, 'bottle', 1.5, 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop', NULL, false),
    (tenant_uuid, (SELECT id FROM categories WHERE slug = 'beverages' AND tenant_id = tenant_uuid),
     'Orange Juice 1L', 'عصير برتقال 1 لتر', 'Jus d''orange 1L', 150.00, 25, 'bottle', 1.0, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop', 130.00, true),
    (tenant_uuid, (SELECT id FROM categories WHERE slug = 'beverages' AND tenant_id = tenant_uuid),
     'Green Tea', 'شاي أخضر', 'Thé vert', 320.00, 60, 'pack', 0.1, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop', NULL, false);
END $$;

