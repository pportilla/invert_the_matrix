package invert_the_matrix.myapp;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.leaderboard.LeaderboardVariant;

import java.util.Locale;

public final class PlayGamesBridge {
    public static final int BOARD_DAILY_EASY = 0;
    public static final int BOARD_DAILY_MEDIUM = 1;
    public static final int BOARD_DAILY_HARD = 2;
    public static final int BOARD_DAILY_GLOBAL = 3;

    private static final int RC_LEADERBOARD_UI = 9004;
    private static final String TAG = "InvertPlayGames";

    private PlayGamesBridge() {
    }

    public static void signIn(Activity activity) {
        if (activity == null) return;
        activity.runOnUiThread(() -> PlayGames.getGamesSignInClient(activity)
                .isAuthenticated()
                .addOnCompleteListener(task -> {
                    boolean authenticated = task.isSuccessful()
                            && task.getResult() != null
                            && task.getResult().isAuthenticated();
                    if (!authenticated) {
                        PlayGames.getGamesSignInClient(activity)
                                .signIn()
                                .addOnFailureListener(error -> Log.w(TAG, "Play Games sign-in failed", error));
                    }
                })
                .addOnFailureListener(error -> Log.w(TAG, "Play Games auth check failed", error)));
    }

    public static void submitScore(Activity activity, int leaderboard, long score) {
        if (activity == null || score < 0) return;
        int resId = leaderboardResId(leaderboard);
        if (resId == 0) return;
        activity.runOnUiThread(() -> PlayGames.getLeaderboardsClient(activity)
                .submitScore(activity.getString(resId), score));
    }

    public static void showLeaderboard(Activity activity, int leaderboard) {
        if (activity == null) return;
        int resId = leaderboardResId(leaderboard);
        if (resId == 0) return;
        activity.runOnUiThread(() -> PlayGames.getLeaderboardsClient(activity)
                .getLeaderboardIntent(activity.getString(resId), LeaderboardVariant.TIME_SPAN_DAILY)
                .addOnSuccessListener((Intent intent) -> activity.startActivityForResult(intent, RC_LEADERBOARD_UI))
                .addOnFailureListener(error -> {
                    Log.w(TAG, "Opening leaderboard failed; requesting Play Games sign-in", error);
                    PlayGames.getGamesSignInClient(activity).signIn();
                }));
    }

    public static void unlockAchievement(Activity activity, int achievement) {
        if (activity == null) return;
        int resId = achievementResId(activity, achievement);
        if (resId == 0) return;
        activity.runOnUiThread(() -> PlayGames.getAchievementsClient(activity)
                .unlock(activity.getString(resId)));
    }

    private static int leaderboardResId(int leaderboard) {
        switch (leaderboard) {
            case BOARD_DAILY_EASY:
                return R.string.leaderboard_daily_easy;
            case BOARD_DAILY_MEDIUM:
                return R.string.leaderboard_daily_medium;
            case BOARD_DAILY_HARD:
                return R.string.leaderboard_daily_hard;
            case BOARD_DAILY_GLOBAL:
                return R.string.leaderboard_daily_global;
            default:
                return 0;
        }
    }

    private static int achievementResId(Activity activity, int achievement) {
        if (achievement < 0) return 0;
        int group = achievement / 2 + 1;
        if (group < 1 || group > 25) return 0;
        String suffix = achievement % 2 == 0 ? "clear" : "master";
        String name = String.format(Locale.US, "achievement_chapter_%02d_%s", group, suffix);
        return activity.getResources().getIdentifier(name, "string", activity.getPackageName());
    }
}
