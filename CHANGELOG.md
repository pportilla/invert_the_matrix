# Changelog

All notable changes to Invert the Matrix will be recorded here.

## Android 1.0.1 - 2026-05-13

Version code: 3

- Daily Challenge can now be replayed as much as players want while Play Games
  leaderboards keep only the first try.
- The first counted Daily Challenge try hides Reset and Hint so the leaderboard
  attempt cannot use them.
- Exiting the first counted daily try now asks for confirmation and records `0`
  only when the player confirms.
- Existing Android daily results are treated as already-recorded leaderboard
  attempts so later replays cannot replace their leaderboard score.
