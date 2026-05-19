-- Initial migration for LFC Legal Appointment System.

CREATE TABLE `roles` (
  `id` VARCHAR(32) NOT NULL,
  `slug` VARCHAR(40) NOT NULL,
  `name` VARCHAR(80) NOT NULL,
  `description` VARCHAR(255) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `roles_slug_key`(`slug`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `id` VARCHAR(32) NOT NULL,
  `roleId` VARCHAR(32) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(160) NOT NULL,
  `phone` VARCHAR(40) NULL,
  `passwordHash` VARCHAR(255) NOT NULL,
  `status` ENUM('ACTIVE','INVITED','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `users_email_key`(`email`),
  INDEX `users_roleId_idx`(`roleId`),
  INDEX `users_status_idx`(`status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `lawyers` (
  `id` VARCHAR(32) NOT NULL,
  `userId` VARCHAR(32) NOT NULL,
  `barNumber` VARCHAR(80) NOT NULL,
  `specialization` VARCHAR(160) NOT NULL,
  `bio` TEXT NULL,
  `yearsExperience` INTEGER NOT NULL DEFAULT 0,
  `hourlyRate` DECIMAL(10, 2) NULL,
  `maxDailyConsultations` INTEGER NOT NULL DEFAULT 8,
  `status` ENUM('ACTIVE','ON_LEAVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `lawyers_userId_key`(`userId`),
  UNIQUE INDEX `lawyers_barNumber_key`(`barNumber`),
  INDEX `lawyers_status_idx`(`status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `appointments` (
  `id` VARCHAR(32) NOT NULL,
  `clientId` VARCHAR(32) NOT NULL,
  `lawyerId` VARCHAR(32) NULL,
  `assignedById` VARCHAR(32) NULL,
  `consultationType` VARCHAR(120) NOT NULL,
  `subject` VARCHAR(180) NOT NULL,
  `description` TEXT NOT NULL,
  `priority` ENUM('HIGH','MEDIUM','REGULAR') NOT NULL DEFAULT 'REGULAR',
  `requestedPriority` ENUM('HIGH','MEDIUM','REGULAR') NULL,
  `priorityReason` VARCHAR(255) NULL,
  `status` ENUM('PENDING','RESCHEDULE_REQUESTED','SCHEDULED','APPROVED','REJECTED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `preferredStart` DATETIME(3) NOT NULL,
  `preferredEnd` DATETIME(3) NOT NULL,
  `scheduledStart` DATETIME(3) NULL,
  `scheduledEnd` DATETIME(3) NULL,
  `locationMode` ENUM('IN_PERSON','PHONE','FIELD') NOT NULL DEFAULT 'IN_PERSON',
  `conflictStatus` ENUM('PENDING_ASSIGNMENT','CLEAR','WARNING','CONFLICT') NOT NULL DEFAULT 'PENDING_ASSIGNMENT',
  `cancellationReason` VARCHAR(500) NULL,
  `rescheduleReason` VARCHAR(500) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `appointments_clientId_idx`(`clientId`),
  INDEX `appointments_lawyerId_idx`(`lawyerId`),
  INDEX `appointments_assignedById_idx`(`assignedById`),
  INDEX `appointments_status_idx`(`status`),
  INDEX `appointments_priority_idx`(`priority`),
  INDEX `appointments_scheduledStart_idx`(`scheduledStart`),
  INDEX `appointments_conflictStatus_idx`(`conflictStatus`),
  INDEX `appointments_clientId_preferredStart_idx`(`clientId`, `preferredStart`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `schedules` (
  `id` VARCHAR(32) NOT NULL,
  `lawyerId` VARCHAR(32) NOT NULL,
  `dayOfWeek` INTEGER NOT NULL,
  `startTime` VARCHAR(5) NOT NULL,
  `endTime` VARCHAR(5) NOT NULL,
  `isAvailable` BOOLEAN NOT NULL DEFAULT true,
  `maxAppointments` INTEGER NOT NULL DEFAULT 8,
  `effectiveFrom` DATETIME(3) NULL,
  `effectiveTo` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `schedules_lawyerId_dayOfWeek_startTime_key`(`lawyerId`, `dayOfWeek`, `startTime`),
  INDEX `schedules_lawyerId_idx`(`lawyerId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `availability` (
  `id` VARCHAR(32) NOT NULL,
  `lawyerId` VARCHAR(32) NOT NULL,
  `type` ENUM('AVAILABLE','UNAVAILABLE','RESERVED') NOT NULL DEFAULT 'AVAILABLE',
  `startsAt` DATETIME(3) NOT NULL,
  `endsAt` DATETIME(3) NOT NULL,
  `reason` VARCHAR(255) NULL,
  `maxAppointments` INTEGER NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `availability_lawyerId_idx`(`lawyerId`),
  INDEX `availability_startsAt_endsAt_idx`(`startsAt`, `endsAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `notifications` (
  `id` VARCHAR(32) NOT NULL,
  `userId` VARCHAR(32) NOT NULL,
  `title` VARCHAR(160) NOT NULL,
  `message` VARCHAR(500) NOT NULL,
  `type` VARCHAR(60) NOT NULL,
  `actionUrl` VARCHAR(255) NULL,
  `metadata` JSON NULL,
  `readAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `notifications_userId_idx`(`userId`),
  INDEX `notifications_readAt_idx`(`readAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `uploaded_documents` (
  `id` VARCHAR(32) NOT NULL,
  `appointmentId` VARCHAR(32) NOT NULL,
  `uploadedById` VARCHAR(32) NOT NULL,
  `fileName` VARCHAR(255) NOT NULL,
  `filePath` VARCHAR(500) NOT NULL,
  `mimeType` VARCHAR(120) NOT NULL,
  `size` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `uploaded_documents_appointmentId_idx`(`appointmentId`),
  INDEX `uploaded_documents_uploadedById_idx`(`uploadedById`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `appointment_history` (
  `id` VARCHAR(32) NOT NULL,
  `appointmentId` VARCHAR(32) NOT NULL,
  `actorId` VARCHAR(32) NULL,
  `action` VARCHAR(80) NOT NULL,
  `note` VARCHAR(500) NULL,
  `metadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `appointment_history_appointmentId_idx`(`appointmentId`),
  INDEX `appointment_history_actorId_idx`(`actorId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `analytics` (
  `id` VARCHAR(32) NOT NULL,
  `metric` VARCHAR(100) NOT NULL,
  `value` DECIMAL(12, 2) NOT NULL,
  `dimension` JSON NULL,
  `capturedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `analytics_metric_idx`(`metric`),
  INDEX `analytics_capturedAt_idx`(`capturedAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `audit_logs` (
  `id` VARCHAR(32) NOT NULL,
  `userId` VARCHAR(32) NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity` VARCHAR(100) NOT NULL,
  `entityId` VARCHAR(80) NULL,
  `metadata` JSON NULL,
  `ipAddress` VARCHAR(80) NULL,
  `userAgent` VARCHAR(255) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `audit_logs_userId_idx`(`userId`),
  INDEX `audit_logs_entity_idx`(`entity`),
  INDEX `audit_logs_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `activity_logs` (
  `id` VARCHAR(32) NOT NULL,
  `userId` VARCHAR(32) NULL,
  `action` VARCHAR(100) NOT NULL,
  `summary` VARCHAR(255) NOT NULL,
  `metadata` JSON NULL,
  `ipAddress` VARCHAR(80) NULL,
  `userAgent` VARCHAR(255) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `activity_logs_userId_idx`(`userId`),
  INDEX `activity_logs_action_idx`(`action`),
  INDEX `activity_logs_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `refresh_tokens` (
  `id` VARCHAR(32) NOT NULL,
  `userId` VARCHAR(32) NOT NULL,
  `tokenHash` VARCHAR(128) NOT NULL,
  `familyId` VARCHAR(64) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `revokedAt` DATETIME(3) NULL,
  `replacedBy` VARCHAR(128) NULL,
  `ipAddress` VARCHAR(80) NULL,
  `userAgent` VARCHAR(255) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `refresh_tokens_tokenHash_key`(`tokenHash`),
  INDEX `refresh_tokens_userId_idx`(`userId`),
  INDEX `refresh_tokens_familyId_idx`(`familyId`),
  INDEX `refresh_tokens_expiresAt_idx`(`expiresAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `login_attempts` (
  `id` VARCHAR(32) NOT NULL,
  `userId` VARCHAR(32) NULL,
  `email` VARCHAR(160) NOT NULL,
  `success` BOOLEAN NOT NULL,
  `reason` VARCHAR(160) NULL,
  `ipAddress` VARCHAR(80) NULL,
  `userAgent` VARCHAR(255) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `login_attempts_email_idx`(`email`),
  INDEX `login_attempts_ipAddress_idx`(`ipAddress`),
  INDEX `login_attempts_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `system_settings` (
  `id` VARCHAR(32) NOT NULL,
  `key` VARCHAR(80) NOT NULL,
  `value` JSON NOT NULL,
  `updatedById` VARCHAR(32) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `system_settings_key_key`(`key`),
  INDEX `system_settings_updatedById_idx`(`updatedById`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `users` ADD CONSTRAINT `users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `lawyers` ADD CONSTRAINT `lawyers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_lawyerId_fkey` FOREIGN KEY (`lawyerId`) REFERENCES `lawyers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_assignedById_fkey` FOREIGN KEY (`assignedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_lawyerId_fkey` FOREIGN KEY (`lawyerId`) REFERENCES `lawyers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `availability` ADD CONSTRAINT `availability_lawyerId_fkey` FOREIGN KEY (`lawyerId`) REFERENCES `lawyers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `uploaded_documents` ADD CONSTRAINT `uploaded_documents_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `uploaded_documents` ADD CONSTRAINT `uploaded_documents_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `appointment_history` ADD CONSTRAINT `appointment_history_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `appointment_history` ADD CONSTRAINT `appointment_history_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `login_attempts` ADD CONSTRAINT `login_attempts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `system_settings` ADD CONSTRAINT `system_settings_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
