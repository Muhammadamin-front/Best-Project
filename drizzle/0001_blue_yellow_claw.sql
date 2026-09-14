CREATE UNIQUE INDEX `mosque_referral_unique` ON `mosque_referrals` (`mosque_id`,`prayer_request_id`);--> statement-breakpoint
CREATE INDEX `mosque_referral_status_idx` ON `mosque_referrals` (`mosque_id`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `notifications_user_read_idx` ON `notifications` (`user_id`,`read_at`,`created_at`);--> statement-breakpoint
CREATE INDEX `prayer_requests_status_created_idx` ON `prayer_requests` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `prayer_requests_city_idx` ON `prayer_requests` (`city`);--> statement-breakpoint
CREATE INDEX `prayer_requests_author_idx` ON `prayer_requests` (`author_id`);--> statement-breakpoint
CREATE INDEX `reports_status_priority_idx` ON `reports` (`status`,`priority`,`created_at`);--> statement-breakpoint
INSERT OR IGNORE INTO `profiles` (`id`, `email`, `display_name`, `city`, `country`, `preferred_language`, `role`, `status`) VALUES
  ('seed_health', 'health@seed.duodosh.local', 'Duodosh a’zosi', 'Samarqand', 'O‘zbekiston', 'uz', 'user', 'active'),
  ('seed_work', 'work@seed.duodosh.local', 'Muhammadali', 'Toshkent', 'O‘zbekiston', 'uz', 'user', 'active'),
  ('seed_family', 'family@seed.duodosh.local', 'Duodosh a’zosi', 'Buxoro', 'O‘zbekiston', 'uz', 'user', 'active'),
  ('seed_study', 'study@seed.duodosh.local', 'Zarnigor', 'Farg‘ona', 'O‘zbekiston', 'uz', 'user', 'active');--> statement-breakpoint
INSERT OR IGNORE INTO `prayer_requests` (`id`, `author_id`, `title`, `body`, `category`, `language`, `country`, `city`, `is_anonymous`, `visibility`, `mosque_referral_consent`, `is_emergency`, `status`) VALUES
  ('demo-1', 'seed_health', 'Onamning operatsiyasi uchun duo qiling', 'Ertaga onamning yurak operatsiyasi bor. Shifokorlar yaxshi umid berishdi, lekin oilamiz juda hayajonda. Iltimos, onamning sog‘ligi va shifokorlarning qo‘li yengil bo‘lishi uchun duo qiling.', 'health', 'uz', 'O‘zbekiston', 'Samarqand', 1, 'public', 0, 0, 'published'),
  ('demo-2', 'seed_work', 'Yangi ish izlayapman', 'Uch oydan beri ish qidiryapman. Oilam oldidagi mas’uliyatimni halol ado etishim va yaxshi jamoaga qo‘shilishim uchun duolaringizda eslab qo‘ying.', 'work', 'uz', 'O‘zbekiston', 'Toshkent', 0, 'public', 0, 0, 'published'),
  ('demo-3', 'seed_family', 'Oilamizga xotirjamlik so‘rayman', 'Uyimizda so‘nggi payt tushunmovchiliklar ko‘paydi. Bir-birimizni yana mehr bilan eshitishimiz va to‘g‘ri yo‘l topishimiz uchun duo qiling.', 'family', 'uz', 'O‘zbekiston', 'Buxoro', 1, 'public', 0, 0, 'published'),
  ('demo-4', 'seed_study', 'Imtihonim uchun duo qiling', 'Bir yil tayyorlangan imtihonim shu hafta. Bilganlarimni eslab, xotirjam va halol natija olishimni duoda eslang.', 'work', 'uz', 'O‘zbekiston', 'Farg‘ona', 0, 'public', 0, 0, 'published');--> statement-breakpoint
INSERT OR IGNORE INTO `mosques` (`id`, `name`, `description`, `address`, `city`, `country`, `status`) VALUES
  ('mosque-minor', 'Minor masjidi', 'Toshkentdagi tasdiqlangan hamjamiyat hamkori.', 'Kichik halqa yo‘li', 'Toshkent', 'O‘zbekiston', 'verified'),
  ('mosque-bukhari', 'Imom Buxoriy majmuasi', 'Samarqanddagi tasdiqlangan hamjamiyat hamkori.', 'Payariq tumani', 'Samarqand', 'O‘zbekiston', 'verified');--> statement-breakpoint
INSERT OR IGNORE INTO `platform_settings` (`key`, `value`) VALUES
  ('contribution_required_count', '3'),
  ('contribution_window_hours', '24'),
  ('emergency_requires_moderation', 'true');
