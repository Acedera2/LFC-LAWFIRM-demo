-- LFC Legal Appointment System MySQL schema snapshot.
CREATE DATABASE IF NOT EXISTS `legal_field_consultancy`;
USE `legal_field_consultancy`;

CREATE TABLE roles (
  id VARCHAR(32) PRIMARY KEY,
  slug VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL,
  description VARCHAR(255),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE users (
  id VARCHAR(32) PRIMARY KEY,
  roleId VARCHAR(32) NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(40),
  passwordHash VARCHAR(255) NOT NULL,
  status ENUM('ACTIVE','INVITED','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  INDEX users_roleId_idx (roleId),
  INDEX users_status_idx (status),
  CONSTRAINT users_roleId_fkey FOREIGN KEY (roleId) REFERENCES roles(id)
);

CREATE TABLE lawyers (
  id VARCHAR(32) PRIMARY KEY,
  userId VARCHAR(32) NOT NULL UNIQUE,
  barNumber VARCHAR(80) NOT NULL UNIQUE,
  specialization VARCHAR(160) NOT NULL,
  bio TEXT,
  yearsExperience INT NOT NULL DEFAULT 0,
  hourlyRate DECIMAL(10, 2),
  maxDailyConsultations INT NOT NULL DEFAULT 8,
  status ENUM('ACTIVE','ON_LEAVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  INDEX lawyers_status_idx (status),
  CONSTRAINT lawyers_userId_fkey FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE appointments (
  id VARCHAR(32) PRIMARY KEY,
  clientId VARCHAR(32) NOT NULL,
  lawyerId VARCHAR(32),
  assignedById VARCHAR(32),
  consultationType VARCHAR(120) NOT NULL,
  subject VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('HIGH','MEDIUM','REGULAR') NOT NULL DEFAULT 'REGULAR',
  requestedPriority ENUM('HIGH','MEDIUM','REGULAR'),
  priorityReason VARCHAR(255),
  status ENUM('PENDING','RESCHEDULE_REQUESTED','SCHEDULED','APPROVED','REJECTED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  preferredStart DATETIME NOT NULL,
  preferredEnd DATETIME NOT NULL,
  scheduledStart DATETIME,
  scheduledEnd DATETIME,
  locationMode ENUM('IN_PERSON','PHONE','FIELD') NOT NULL DEFAULT 'IN_PERSON',
  conflictStatus ENUM('PENDING_ASSIGNMENT','CLEAR','WARNING','CONFLICT') NOT NULL DEFAULT 'PENDING_ASSIGNMENT',
  cancellationReason VARCHAR(500),
  rescheduleReason VARCHAR(500),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  INDEX appointments_clientId_idx (clientId),
  INDEX appointments_lawyerId_idx (lawyerId),
  INDEX appointments_assignedById_idx (assignedById),
  INDEX appointments_status_idx (status),
  INDEX appointments_priority_idx (priority),
  INDEX appointments_scheduledStart_idx (scheduledStart),
  INDEX appointments_conflictStatus_idx (conflictStatus),
  INDEX appointments_clientId_preferredStart_idx (clientId, preferredStart),
  CONSTRAINT appointments_clientId_fkey FOREIGN KEY (clientId) REFERENCES users(id),
  CONSTRAINT appointments_lawyerId_fkey FOREIGN KEY (lawyerId) REFERENCES lawyers(id),
  CONSTRAINT appointments_assignedById_fkey FOREIGN KEY (assignedById) REFERENCES users(id)
);

CREATE TABLE schedules (
  id VARCHAR(32) PRIMARY KEY,
  lawyerId VARCHAR(32) NOT NULL,
  dayOfWeek INT NOT NULL,
  startTime VARCHAR(5) NOT NULL,
  endTime VARCHAR(5) NOT NULL,
  isAvailable BOOLEAN NOT NULL DEFAULT TRUE,
  maxAppointments INT NOT NULL DEFAULT 8,
  effectiveFrom DATETIME,
  effectiveTo DATETIME,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  UNIQUE KEY schedules_lawyer_day_start_unique (lawyerId, dayOfWeek, startTime),
  INDEX schedules_lawyerId_idx (lawyerId),
  CONSTRAINT schedules_lawyerId_fkey FOREIGN KEY (lawyerId) REFERENCES lawyers(id)
);

CREATE TABLE availability (
  id VARCHAR(32) PRIMARY KEY,
  lawyerId VARCHAR(32) NOT NULL,
  type ENUM('AVAILABLE','UNAVAILABLE','RESERVED') NOT NULL DEFAULT 'AVAILABLE',
  startsAt DATETIME NOT NULL,
  endsAt DATETIME NOT NULL,
  reason VARCHAR(255),
  maxAppointments INT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  INDEX availability_lawyerId_idx (lawyerId),
  INDEX availability_startsAt_endsAt_idx (startsAt, endsAt),
  CONSTRAINT availability_lawyerId_fkey FOREIGN KEY (lawyerId) REFERENCES lawyers(id)
);

CREATE TABLE notifications (
  id VARCHAR(32) PRIMARY KEY,
  userId VARCHAR(32) NOT NULL,
  title VARCHAR(160) NOT NULL,
  message VARCHAR(500) NOT NULL,
  type VARCHAR(60) NOT NULL,
  actionUrl VARCHAR(255),
  metadata JSON,
  readAt DATETIME,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  INDEX notifications_userId_idx (userId),
  INDEX notifications_readAt_idx (readAt),
  CONSTRAINT notifications_userId_fkey FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE uploaded_documents (
  id VARCHAR(32) PRIMARY KEY,
  appointmentId VARCHAR(32) NOT NULL,
  uploadedById VARCHAR(32) NOT NULL,
  fileName VARCHAR(255) NOT NULL,
  filePath VARCHAR(500) NOT NULL,
  mimeType VARCHAR(120) NOT NULL,
  size INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX uploaded_documents_appointmentId_idx (appointmentId),
  INDEX uploaded_documents_uploadedById_idx (uploadedById),
  CONSTRAINT uploaded_documents_appointmentId_fkey FOREIGN KEY (appointmentId) REFERENCES appointments(id),
  CONSTRAINT uploaded_documents_uploadedById_fkey FOREIGN KEY (uploadedById) REFERENCES users(id)
);

CREATE TABLE appointment_history (
  id VARCHAR(32) PRIMARY KEY,
  appointmentId VARCHAR(32) NOT NULL,
  actorId VARCHAR(32),
  action VARCHAR(80) NOT NULL,
  note VARCHAR(500),
  metadata JSON,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX appointment_history_appointmentId_idx (appointmentId),
  INDEX appointment_history_actorId_idx (actorId),
  CONSTRAINT appointment_history_appointmentId_fkey FOREIGN KEY (appointmentId) REFERENCES appointments(id),
  CONSTRAINT appointment_history_actorId_fkey FOREIGN KEY (actorId) REFERENCES users(id)
);

CREATE TABLE analytics (
  id VARCHAR(32) PRIMARY KEY,
  metric VARCHAR(100) NOT NULL,
  value DECIMAL(12, 2) NOT NULL,
  dimension JSON,
  capturedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX analytics_metric_idx (metric),
  INDEX analytics_capturedAt_idx (capturedAt)
);

CREATE TABLE audit_logs (
  id VARCHAR(32) PRIMARY KEY,
  userId VARCHAR(32),
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entityId VARCHAR(80),
  metadata JSON,
  ipAddress VARCHAR(80),
  userAgent VARCHAR(255),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX audit_logs_userId_idx (userId),
  INDEX audit_logs_entity_idx (entity),
  INDEX audit_logs_createdAt_idx (createdAt),
  CONSTRAINT audit_logs_userId_fkey FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE activity_logs (
  id VARCHAR(32) PRIMARY KEY,
  userId VARCHAR(32),
  action VARCHAR(100) NOT NULL,
  summary VARCHAR(255) NOT NULL,
  metadata JSON,
  ipAddress VARCHAR(80),
  userAgent VARCHAR(255),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX activity_logs_userId_idx (userId),
  INDEX activity_logs_action_idx (action),
  INDEX activity_logs_createdAt_idx (createdAt),
  CONSTRAINT activity_logs_userId_fkey FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE refresh_tokens (
  id VARCHAR(32) PRIMARY KEY,
  userId VARCHAR(32) NOT NULL,
  tokenHash VARCHAR(128) NOT NULL UNIQUE,
  familyId VARCHAR(64) NOT NULL,
  expiresAt DATETIME NOT NULL,
  revokedAt DATETIME,
  replacedBy VARCHAR(128),
  ipAddress VARCHAR(80),
  userAgent VARCHAR(255),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  INDEX refresh_tokens_userId_idx (userId),
  INDEX refresh_tokens_familyId_idx (familyId),
  INDEX refresh_tokens_expiresAt_idx (expiresAt),
  CONSTRAINT refresh_tokens_userId_fkey FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE login_attempts (
  id VARCHAR(32) PRIMARY KEY,
  userId VARCHAR(32),
  email VARCHAR(160) NOT NULL,
  success BOOLEAN NOT NULL,
  reason VARCHAR(160),
  ipAddress VARCHAR(80),
  userAgent VARCHAR(255),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX login_attempts_email_idx (email),
  INDEX login_attempts_ipAddress_idx (ipAddress),
  INDEX login_attempts_createdAt_idx (createdAt),
  CONSTRAINT login_attempts_userId_fkey FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE system_settings (
  id VARCHAR(32) PRIMARY KEY,
  `key` VARCHAR(80) NOT NULL UNIQUE,
  value JSON NOT NULL,
  updatedById VARCHAR(32),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  INDEX system_settings_updatedById_idx (updatedById),
  CONSTRAINT system_settings_updatedById_fkey FOREIGN KEY (updatedById) REFERENCES users(id)
);
