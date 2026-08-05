-- Run after supabase/season2.sql.
-- Passwords are intentionally stored only as hashes here.

insert into season2_users (player_id, username, display_name, password_hash, is_admin)
values
  ('igor', 'BR7ZH', 'Ігор', 'scrypt$N_w-lcfCrJAHT9jzbaEKgw$UiShn3Taklvz1kqpnq78cnUU6aG0tBqpPhonPDHAzzCgSlrD8dy6ryckigvSK165EssW5_w5x8nsm2SN2OSmPg', true),
  ('sania', 'b2k_alex', 'Саня', 'scrypt$ccGNUNoeTX20QY30EmgIIw$QKS8f_xsChMSa-wVWJv91NH1tUM-4MM0ToIfyZxmuYKrlKotqkgmtnjaxwBRNnQslrE5O-0e2Khslsj-JU-ZHQ', false),
  ('zhenia', 'evgnp11', 'Женя', 'scrypt$7kQ43HhLsf-OElEWitMREg$SnyCC2KVEWz9hvJk7Kvyie9gAgtsQVhGkzVpIQ-78KooqnAyQEcHcsA6jOLpZAs8dY3lN2Xpi_s_7mBIX2XD5Q', false),
  ('posol', 'posolua', 'Сергій', 'scrypt$S-EUB-6QZAh0RmUJdAxb9g$-jCPfna2IobX09vphZAUTTkmCzaGzhuwqKobEd6rIGW11IshIIwsjgOYfq_OMX6CB-FyQjuVzojecStSKF0gPw', false),
  ('kiril', 'orid27', 'Кіріл', 'scrypt$Uw7ayLb2DJ7k9Vhfmsl2bg$6-56l7uSY6qNvfcjggJ6kPLB7rMajLXGXsUFm_ta4sDL6Jjwq5NsfYT0N-AFlbY76SZyPvSmk_PevGi-d_HKlg', false),
  ('mykola', 'Fixius777', 'Коля', 'scrypt$yBo61CDCQnaoDej3C4JBVQ$4LExzbe9UMqnl9Lum1BG7ILBKNBuKXwL8Npw_kZXZnt0qNqUzAPDPQKCEJzKDQKjHJyV7bqzQ5lz-vBGCbsbyg', false),
  ('vlad', 'd_Xyqenko', 'Влад', 'scrypt$X8zdQIxif_41AvOzuebKeA$JIhdLqoe5AxolnohvPpifHIw5Fd-RiaGuJi1VCncYwt0HPSpajpH_SE_ZuwXB7i_knkJ-gbPs7kTMno8RaERKg', false),
  ('pitch', 'Flugergehaimer__', 'Сергій', 'scrypt$MugbR0q9HZb-3i21UTpw4w$vESjv8-luOhKh5Zy1aBzZSNbx5ziyl_8G9SS9pjCim-9VNYw4RVh9oRC-dy-59cMI3_Ulrf6bj5dcNbC_F9i6w', false),
  ('misha', 'early_actor62', 'Майкл', 'scrypt$EDwpcqFM8S6cT91uR5IVEg$LIzk_9du6tEYRTroc7x5JOPiy0OTnnMJRhuoaZ_QL76tByTNhLjLiDVd7GTURWuucy52-W5DRTXsVyk3-gdBNQ', false),
  ('oleksii', 'Mer4iik', 'Олексій', 'scrypt$BgNHRwVuQRCJES4lW-OrEA$yUfH8KrsLKlA7KmqjMMPCImJeHZ_nlMMJaoD6xKz6tLQHVx-6D_qYBs0kAXykifFse0Si98WrnX9aAYtGaRj4g', false),
  ('andrii', 'Juced99', 'Андрій', 'scrypt$PVrAhkmzq0YKt1F4lD7Tng$6YfDWF5MdCoWrJaLpl8vyRJlGXGuUN-evY3rdMNnegbKUgNIssDVI8IddFPehJtvKms-Lxu0VOWxGJY2oU3CSw', false),
  ('zheka', 'katrik_89', 'Жека', 'scrypt$JMgwhQ60-a4wmF9tP-47xw$uDcjgBpfPjmsAluYIiYI4NbQSEBaXVru6MHSQCNj53OCEsEWR6RPZhteY4IqLkA0bQ1pcFeAEDNNAUXFuCib_g', false),
  ('dmytro', 'LusuyKrab', 'Дмитро', 'scrypt$FXTZfHlbpIqtNab9ANfdVw$SjoTNqL4diMrfBJkcbp_uHwAHKwO-8muYBo92DbFGc-s8fAqAcKpyHWzLOJ5IpfSwFKZshpeechONkYO6TNCwA', false),
  ('dimas', 'Viking240222', 'Дімас', 'scrypt$xf7nbx7abwr72zw3Jd4AHg$xAmsx2F74PN3lvoIKbGieJwy_yPJSWBMRGj1vgIkY78NTEmBFtOu6XQppfPoMdZ219nas_wtmXlDQV4PTtAWBg', false),
  ('artem', 'fen1kssss', 'Артем', 'scrypt$YNtkLq33ByB0cUVncW-3Fw$pDFJB7azPvAS1nhlFomwcOufpYIe9iWsduH_JlzsKOwOVJVijcbr5VGuYY4a0nQ_6Kp4PICdpW_LDXFUkTEwVg', false)
on conflict (player_id) do update set
  username = excluded.username,
  display_name = excluded.display_name,
  password_hash = excluded.password_hash,
  is_admin = excluded.is_admin;
