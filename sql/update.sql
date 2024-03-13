CREATE TABLE `trender`.`basic_info` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `nick_name` VARCHAR(64) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC) VISIBLE);

CREATE TABLE `note` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `user_id` int NOT NULL,
  `content` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
