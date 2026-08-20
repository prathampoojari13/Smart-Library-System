-- ==============================================================================
-- SMART LIBRARY MANAGEMENT SYSTEM - DATABASE INITIALIZATION SCRIPT
-- Target: MySQL 8.0+
-- Character Set: utf8mb4 / Collation: utf8mb4_unicode_ci
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `smart_library`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `smart_library`;

-- Disable foreign key checks during schema creation / seeding
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. Table: users
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'student',
  INDEX `ix_users_user_id` (`user_id`),
  INDEX `ix_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table: books
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `books`;
CREATE TABLE `books` (
  `book_id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `author` VARCHAR(100) DEFAULT NULL,
  `category` VARCHAR(50) DEFAULT NULL,
  `rack_location` VARCHAR(50) DEFAULT NULL,
  `total_quantity` INT NOT NULL DEFAULT 1,
  `available_quantity` INT NOT NULL DEFAULT 1,
  INDEX `ix_books_book_id` (`book_id`),
  INDEX `ix_books_title` (`title`),
  INDEX `ix_books_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table: borrow
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `borrow`;
CREATE TABLE `borrow` (
  `borrow_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `book_id` INT NOT NULL,
  `issue_date` DATE NOT NULL,
  `due_date` DATE DEFAULT NULL,
  `return_date` DATE DEFAULT NULL,
  `returned` BOOLEAN NOT NULL DEFAULT FALSE,
  INDEX `ix_borrow_borrow_id` (`borrow_id`),
  INDEX `ix_borrow_user_id` (`user_id`),
  INDEX `ix_borrow_book_id` (`book_id`),
  CONSTRAINT `fk_borrow_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_borrow_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Table: reservations
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `reservations`;
CREATE TABLE `reservations` (
  `reservation_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `book_id` INT NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'reserved',
  INDEX `ix_reservations_reservation_id` (`reservation_id`),
  INDEX `ix_reservations_user_id` (`user_id`),
  INDEX `ix_reservations_book_id` (`book_id`),
  CONSTRAINT `fk_reservations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reservations_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Table: fines
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `fines`;
CREATE TABLE `fines` (
  `fine_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `amount` FLOAT NOT NULL DEFAULT 0.0,
  `paid` BOOLEAN NOT NULL DEFAULT FALSE,
  INDEX `ix_fines_fine_id` (`fine_id`),
  INDEX `ix_fines_user_id` (`user_id`),
  CONSTRAINT `fk_fines_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- DEMO SEED DATA
-- Default Passwords:
--   admin@library.com   => admin123
--   student@library.com => student123
-- ==============================================================================

-- 1. Seed Users
INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `role`) VALUES
(1, 'System Administrator', 'admin@library.com', '$2b$12$G3IyobU8.ij71dKMtYqT1u9DiihUX1v9U4rTKYT84qZqWl9n9HuCK', 'admin'),
(2, 'Alex Johnson', 'student@library.com', '$2b$12$Pg7OJX1lnXH8xyUcv3/HY.uTFQoVj15FehYko0Y7/Qjmae2o0.HKm', 'student'),
(3, 'Sophia Patel', 'sophia@student.edu', '$2b$12$Pg7OJX1lnXH8xyUcv3/HY.uTFQoVj15FehYko0Y7/Qjmae2o0.HKm', 'student');

-- 2. Seed Books Catalog
INSERT INTO `books` (`book_id`, `title`, `author`, `category`, `rack_location`, `total_quantity`, `available_quantity`) VALUES
(1, 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', 'Software Engineering', 'Shelf A-1', 5, 4),
(2, 'Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', 'Computer Science', 'Shelf A-2', 3, 3),
(3, 'Introduction to Algorithms (4th Edition)', 'Thomas H. Cormen, Charles E. Leiserson', 'Computer Science', 'Shelf A-3', 4, 3),
(4, 'The Pragmatic Programmer: Your Journey to Mastery', 'David Thomas, Andrew Hunt', 'Software Engineering', 'Shelf B-1', 4, 4),
(5, 'Designing Data-Intensive Applications', 'Martin Kleppmann', 'Database Systems', 'Shelf B-2', 3, 2),
(6, 'Artificial Intelligence: A Modern Approach', 'Stuart Russell, Peter Norvig', 'Artificial Intelligence', 'Shelf C-1', 2, 0),
(7, 'Deep Learning with Python', 'François Chollet', 'Artificial Intelligence', 'Shelf C-2', 3, 3),
(8, 'To Kill a Mockingbird', 'Harper Lee', 'Fiction', 'Shelf D-1', 6, 6),
(9, 'Thinking, Fast and Slow', 'Daniel Kahneman', 'Psychology', 'Shelf E-1', 4, 4),
(10, 'Zero to One: Notes on Startups', 'Peter Thiel, Blake Masters', 'Business', 'Shelf F-1', 3, 3);

-- 3. Seed Sample Circulation (Borrow)
INSERT INTO `borrow` (`borrow_id`, `user_id`, `book_id`, `issue_date`, `due_date`, `return_date`, `returned`) VALUES
(1, 2, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), NULL, FALSE),
(2, 3, 5, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), NULL, FALSE),
(3, 2, 3, DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 6 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY), TRUE);

-- 4. Seed Sample Reservation (Hold for out-of-stock book)
INSERT INTO `reservations` (`reservation_id`, `user_id`, `book_id`, `status`) VALUES
(1, 2, 6, 'reserved');

-- 5. Seed Sample Fine (e.g. from overdue return)
INSERT INTO `fines` (`fine_id`, `user_id`, `amount`, `paid`) VALUES
(1, 2, 20.0, FALSE);
