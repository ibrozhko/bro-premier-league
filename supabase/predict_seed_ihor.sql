insert into predict_users (
  username,
  display_name,
  password_hash,
  invite_code,
  invites_remaining,
  is_admin,
  favorite_team
) values (
  'ihor',
  'Ігор',
  'scrypt$Zma0mhm7LAYiWluAKPQTXA$Ven3qH-_oz-lBul5iKGdne_nFAKmF9vTcVKGiiKC6M90UtqY8_F1oLFDZ0cAb2L8OTC___kQI0kyuPu_6YJh9Q',
  'BPL-IHOR',
  99,
  true,
  'Ukraine'
)
on conflict (username) do update set
  display_name = excluded.display_name,
  password_hash = excluded.password_hash,
  invite_code = excluded.invite_code,
  invites_remaining = excluded.invites_remaining,
  is_admin = excluded.is_admin,
  favorite_team = excluded.favorite_team;

insert into predict_tournament_predictions (
  user_id,
  champion,
  finalist,
  top_scorer,
  dark_horse
)
select
  id,
  'Argentina',
  'France',
  'Kylian Mbappe',
  'Ukraine'
from predict_users
where username = 'ihor'
on conflict (user_id) do nothing;
