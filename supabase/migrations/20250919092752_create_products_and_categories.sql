-- Create categories table for multi-tenant product organization
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    name_fr VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    description_fr TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table for multi-tenant grocery items
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sku VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    name_fr VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    description_fr TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    sale_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'DZD',
    unit VARCHAR(50) DEFAULT 'piece', -- piece, kg, liter, etc.
    weight DECIMAL(8,3), -- in grams
    dimensions JSONB, -- {length: 0, width: 0, height: 0}
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    track_inventory BOOLEAN DEFAULT true,
    allow_backorder BOOLEAN DEFAULT false,
    requires_shipping BOOLEAN DEFAULT true,
    is_digital BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    meta_title VARCHAR(255),
    meta_description TEXT,
    images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
    tags JSONB DEFAULT '[]'::jsonb, -- Array of tags for search
    nutritional_info JSONB, -- For grocery items
    allergens JSONB DEFAULT '[]'::jsonb, -- Array of allergen info
    origin_country VARCHAR(100),
    barcode VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_categories_tenant_id ON categories(tenant_id);
CREATE INDEX idx_categories_active ON categories(tenant_id, is_active);
CREATE INDEX idx_categories_sort ON categories(tenant_id, sort_order);

CREATE INDEX idx_products_tenant_id ON products(tenant_id);
CREATE INDEX idx_products_category ON products(tenant_id, category_id);
CREATE INDEX idx_products_active ON products(tenant_id, is_active);
CREATE INDEX idx_products_featured ON products(tenant_id, is_featured, is_active);
CREATE INDEX idx_products_stock ON products(tenant_id, stock_quantity);
CREATE INDEX idx_products_price ON products(tenant_id, price);
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('arabic', COALESCE(name_ar, '') || ' ' || COALESCE(description_ar, '')));
CREATE INDEX idx_products_search_fr ON products USING GIN(to_tsvector('french', COALESCE(name_fr, '') || ' ' || COALESCE(description_fr, '')));
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;

-- Create unique constraints
CREATE UNIQUE INDEX idx_products_sku_tenant ON products(tenant_id, sku) WHERE sku IS NOT NULL;
CREATE UNIQUE INDEX idx_products_barcode_tenant ON products(tenant_id, barcode) WHERE barcode IS NOT NULL;

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Categories are viewable by tenant users" ON categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
        )
    );

CREATE POLICY "Categories are insertable by authenticated users" ON categories
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Categories are updatable by authenticated users" ON categories
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Categories are deletable by authenticated users" ON categories
    FOR DELETE USING (
        auth.uid() IS NOT NULL
    );

-- RLS Policies for products
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Products are insertable by authenticated users" ON products
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Products are updatable by authenticated users" ON products
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Products are deletable by authenticated users" ON products
    FOR DELETE USING (
        auth.uid() IS NOT NULL
    );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for active products with category info
CREATE VIEW active_products_with_category AS
SELECT
    p.*,
    c.name as category_name,
    c.name_ar as category_name_ar,
    c.name_fr as category_name_fr
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true AND (c.is_active = true OR c.id IS NULL);

-- Grant permissions
GRANT SELECT ON active_products_with_category TO anon, authenticated;