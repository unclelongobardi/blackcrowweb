-- Remove all demo/fake content. Safe to run multiple times.

delete from post_votes;
delete from posts;
delete from operation_joins;
delete from operations;
delete from cabal_members;
delete from cabals;
delete from bounties;
delete from notifications where profile_id in (
  select id from profiles where privy_did like 'seed:%'
);
delete from profiles where privy_did like 'seed:%';
