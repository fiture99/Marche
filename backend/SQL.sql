select * from users

ALTER TABLE vendors
ALTER COLUMN address DROP NOT NULL;

-- Categories
INSERT INTO categories (name, description, icon, is_active)
VALUES
('Beauty & Health', 'Cosmetics, skincare, and health products', '💄', TRUE),
('Books', 'Books, magazines, and educational materials', '📚', TRUE),
('Clothing', 'Apparel, fashion, and accessories', '👕', TRUE),
('Electronics', 'Devices, gadgets, and consumer electronics', '📱', TRUE),
('Food & Beverages', 'Groceries, snacks, and drinks', '🍎', TRUE),
('Home & Garden', 'Furniture, decor, and gardening supplies', '🏠', TRUE),
('Other', 'Miscellaneous products', '🛒', TRUE),
('Sports & Outdoors', 'Sports equipment and outdoor gear', '⚽', TRUE);
