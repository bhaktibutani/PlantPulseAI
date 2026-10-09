-- ====================================================================
-- PlantPulse AI — MySQL Database Schema for XAMPP
-- ====================================================================
-- Host: localhost:3306
-- Database: plantpulse_ai
-- Compatible with XAMPP (Apache + MariaDB/MySQL + phpMyAdmin)
-- ====================================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS `plantpulse_ai`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `plantpulse_ai`;

-- --------------------------------------------------------------------
-- 2. Table: users
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('farmer', 'urban_planner') NOT NULL DEFAULT 'farmer',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 3. Table: activity_history
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `activity_type` VARCHAR(50) NOT NULL, -- 'plant_scan', 'doctor_chat', 'treatment_plan', 'account_created', 'care_task'
  `title` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NULL,              -- JSON or formatted text
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_history_user_created` (`user_id`, `created_at`),
  INDEX `idx_history_type` (`activity_type`),
  CONSTRAINT `fk_activity_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 4. Table: plants (Phase 3: Plant Care & Ledger)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `plants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `species` VARCHAR(255) NOT NULL,
  `location_type` VARCHAR(100) NOT NULL DEFAULT 'balcony', -- 'balcony', 'terrace', 'indoor', 'kitchen_garden', 'backyard', 'field'
  `sunlight` VARCHAR(100) NOT NULL DEFAULT 'full_sun',     -- 'full_sun', 'partial_shade', 'indirect', 'shade'
  `watering_frequency` VARCHAR(100) NOT NULL DEFAULT 'daily', -- 'daily', 'every_2_days', 'twice_weekly', 'weekly'
  `health_status` VARCHAR(50) NOT NULL DEFAULT 'Healthy',
  `health_score` INT NOT NULL DEFAULT 85,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_plants_user` (`user_id`),
  CONSTRAINT `fk_plants_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 5. Table: plant_care_tasks (Phase 3: Care Reminders & Tasks)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `plant_care_tasks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `plant_id` INT NULL,
  `task_type` VARCHAR(50) NOT NULL, -- 'watering', 'fertilizing', 'inspection', 'treatment', 'pruning', 'harvesting'
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `due_date` VARCHAR(50) NOT NULL DEFAULT 'Today',
  `completed` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_tasks_user_completed` (`user_id`, `completed`),
  CONSTRAINT `fk_tasks_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_tasks_plant`
    FOREIGN KEY (`plant_id`)
    REFERENCES `plants` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
