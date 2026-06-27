-- Thêm role STUDENT (chạy một lần trên PostgreSQL)
INSERT INTO role (id, name, "isDisabled", is_active, create_at, update_at)
SELECT gen_random_uuid(), 'STUDENT', false, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM role WHERE name = 'STUDENT');
