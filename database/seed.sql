-- ==============================================================================
-- Smart Library Management System (Nexus) - Reference Seed SQL Script
-- ==============================================================================

INSERT OR IGNORE INTO system_settings (key, value, description) VALUES
('library_name', 'Nexus Smart Library', 'University library identity'),
('fine_per_day', '1.50', 'Overdue penalty fine rate per day'),
('borrow_duration_days', '14', 'Standard lending term in days'),
('max_borrow_limit', '3', 'Max active books per student');

INSERT OR IGNORE INTO categories (id, name, description, color_code) VALUES
(1, 'Computer Science', 'Algorithms, Systems, and Architecture', '#2563EB'),
(2, 'Artificial Intelligence', 'Machine Learning, Deep Learning, and Vision', '#7C3AED'),
(3, 'Software Engineering', 'Clean Code, Design Patterns, and Testing', '#0284C7'),
(4, 'Business & Economics', 'Finance, Entrepreneurship, and Startups', '#059669'),
(5, 'Psychology & Mindset', 'Cognition, Habits, and Behavioral Science', '#D97706'),
(6, 'Classic Literature', 'Timeless Literary Masterpieces', '#DC2626');
