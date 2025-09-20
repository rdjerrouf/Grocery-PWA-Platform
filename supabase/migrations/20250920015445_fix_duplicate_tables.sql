-- This migration handles the duplicate tables issue
-- The categories and products tables already exist from the initial schema
-- This migration will only add what's missing

-- Drop the problematic migration file content and recreate properly
-- Check if columns exist before adding them

-- Add missing columns to categories if they don't exist
DO $$
BEGIN
    -- Add name_ar if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='name_ar') THEN
        ALTER TABLE categories ADD COLUMN name_ar VARCHAR(255);
    END IF;

    -- Add name_fr if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='name_fr') THEN
        ALTER TABLE categories ADD COLUMN name_fr VARCHAR(255);
    END IF;

    -- Add sort_order if it doesn't exist (display_order exists, but let's add sort_order too)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='sort_order') THEN
        ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add missing columns to products if they don't exist
DO $$
BEGIN
    -- Add name_ar if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='name_ar') THEN
        ALTER TABLE products ADD COLUMN name_ar VARCHAR(255);
    END IF;

    -- Add name_fr if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='name_fr') THEN
        ALTER TABLE products ADD COLUMN name_fr VARCHAR(255);
    END IF;

    -- Add other missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='cost_price') THEN
        ALTER TABLE products ADD COLUMN cost_price DECIMAL(10,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='min_stock_level') THEN
        ALTER TABLE products ADD COLUMN min_stock_level INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='max_stock_level') THEN
        ALTER TABLE products ADD COLUMN max_stock_level INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='track_inventory') THEN
        ALTER TABLE products ADD COLUMN track_inventory BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='allow_backorder') THEN
        ALTER TABLE products ADD COLUMN allow_backorder BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='requires_shipping') THEN
        ALTER TABLE products ADD COLUMN requires_shipping BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_digital') THEN
        ALTER TABLE products ADD COLUMN is_digital BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='meta_title') THEN
        ALTER TABLE products ADD COLUMN meta_title VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='meta_description') THEN
        ALTER TABLE products ADD COLUMN meta_description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='images') THEN
        ALTER TABLE products ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='tags') THEN
        ALTER TABLE products ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='nutritional_info') THEN
        ALTER TABLE products ADD COLUMN nutritional_info JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='allergens') THEN
        ALTER TABLE products ADD COLUMN allergens JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='origin_country') THEN
        ALTER TABLE products ADD COLUMN origin_country VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='sort_order') THEN
        ALTER TABLE products ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(tenant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(to_tsvector('arabic', COALESCE(name_ar, '') || ' ' || COALESCE(description_ar, '')));
CREATE INDEX IF NOT EXISTS idx_products_search_fr ON products USING GIN(to_tsvector('french', COALESCE(name_fr, '') || ' ' || COALESCE(description_fr, '')));
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

-- Create unique constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'idx_products_sku_tenant') THEN
        CREATE UNIQUE INDEX idx_products_sku_tenant ON products(tenant_id, sku) WHERE sku IS NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'idx_products_barcode_tenant') THEN
        CREATE UNIQUE INDEX idx_products_barcode_tenant ON products(tenant_id, barcode) WHERE barcode IS NOT NULL;
    END IF;
END $$;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
        CREATE TRIGGER update_categories_updated_at
            BEFORE UPDATE ON categories
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
        CREATE TRIGGER update_products_updated_at
            BEFORE UPDATE ON products
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create view if it doesn't exist
DROP VIEW IF EXISTS active_products_with_category;
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