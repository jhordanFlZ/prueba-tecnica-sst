-- SuperApp SST - schema inicial para MariaDB
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('HRBP', 'LEADER', 'MEDICAL', 'ADMIN_SST') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `User_email_key` (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Employee` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `hireDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `Employee_code_key` (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Absence` (
    `id` VARCHAR(191) NOT NULL,
    `recordCode` VARCHAR(191) NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `days` INTEGER NOT NULL,
    `diagnosis` VARCHAR(191) NOT NULL,
    `cie10` VARCHAR(191) NULL,
    `healthCategory` VARCHAR(191) NULL,
    `issuer` VARCHAR(191) NULL,
    PRIMARY KEY (`id`),
    INDEX `Absence_employeeId_startDate_idx` (`employeeId`, `startDate`),
    CONSTRAINT `Absence_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `SymptomReport` (
    `id` VARCHAR(191) NOT NULL,
    `responseCode` VARCHAR(191) NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `reportedAt` DATETIME(3) NOT NULL,
    `symptoms` VARCHAR(191) NOT NULL,
    `hazard` VARCHAR(191) NULL,
    `painLevel` INTEGER NOT NULL,
    `hazardExposure` BOOLEAN NOT NULL,
    `requiresMedical` BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (`id`),
    INDEX `SymptomReport_employeeId_reportedAt_idx` (`employeeId`, `reportedAt`),
    CONSTRAINT `SymptomReport_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `MedicalCase` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
    `risk` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'LOW',
    `notes` TEXT NOT NULL,
    `openedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `closedAt` DATETIME(3) NULL,
    PRIMARY KEY (`id`),
    INDEX `MedicalCase_status_risk_idx` (`status`, `risk`),
    CONSTRAINT `MedicalCase_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Alert` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `risk` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    `resolved` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `Alert_resolved_createdAt_idx` (`resolved`, `createdAt`),
    CONSTRAINT `Alert_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
