SET NAMES utf8mb4;

DROP TABLE IF EXISTS `Program`;

CREATE TABLE `Program` (
  `programId` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `unitSlug` varchar(50) COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT '',
  `programDate` date NOT NULL,
  `programJson` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`programId`),
  UNIQUE KEY `UQ_unitSlug_programDate` (`unitSlug`,`programDate`),
  CONSTRAINT `FK_Program_unitSlug` FOREIGN KEY (`unitSlug`) REFERENCES `Unit` (`unitSlug`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;


DROP TABLE IF EXISTS `Unit`;

CREATE TABLE `Unit` (
  `unitId` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `unitSlug` varchar(50) COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT '',
  `unitPassphrase` varchar(50) COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT '',
  `unitName` varchar(50) COLLATE utf8mb4_unicode_520_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`unitId`),
  UNIQUE KEY `UQ_unitSlug` (`unitSlug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
