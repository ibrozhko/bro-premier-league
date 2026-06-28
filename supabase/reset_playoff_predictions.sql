delete from predict_predictions
where match_id in (
  select id
  from predict_matches
  where stage <> 'group'
);

select predict_recalculate_user_totals();
