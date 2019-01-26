DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE IF NOT EXISTS bamazon;
USE bamazon;

CREATE TABLE IF NOT EXISTS products(
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    price DECIMAL(7,2) NOT NULL,
    stock_quantity INT NOT NULL,
    PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity) 
VALUES 
    ('Paper Towels', 'Home Goods', 4.49, 24),
    ('Aviator Sunglasses', 'Accessories', 29.89, 2),
    ('Scalpel (5 per pack)', 'Medical', 2.10, 43),
    ('Apron', 'Kitchen', 17.05, 32),
    ('Rubber Gloves (20 per pack)', 'Home Goods', 5.35, 15),
    ('"Sounds of the Supermarket" Cassette', 'Music', 0.03, 200),
    ('Human Soul (Good Condition)', 'Groceries', 60600.60, 13),
    ('17 Herbs and Spices Face Mask', 'Cosmetics', 28.30, 51),
    ('Leather Jacket', 'Clothing', 89.99, 3),
    ('"The Recovery Delusion" by Bartholomew Alvarez, Paperback', 'Books', 23.22, 11);
