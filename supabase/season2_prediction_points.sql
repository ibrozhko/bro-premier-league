alter table season2_predictions
  add column if not exists points int not null default 0;
