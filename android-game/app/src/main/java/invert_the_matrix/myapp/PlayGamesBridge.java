package invert_the_matrix.myapp;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.leaderboard.LeaderboardVariant;

import java.util.LinkedHashSet;
import java.util.Set;

public final class PlayGamesBridge {
    public static final int BOARD_DAILY_EASY = 0;
    public static final int BOARD_DAILY_MEDIUM = 1;
    public static final int BOARD_DAILY_HARD = 2;
    public static final int BOARD_DAILY_GLOBAL = 3;

    private static final int RC_LEADERBOARD_UI = 9004;
    private static final String TAG = "InvertPlayGames";
    private static final int[] ACHIEVEMENT_RES_IDS = {
            R.string.achievement_chapter_01_clear,
            R.string.achievement_chapter_01_master,
            R.string.achievement_chapter_02_clear,
            R.string.achievement_chapter_02_master,
            R.string.achievement_chapter_03_clear,
            R.string.achievement_chapter_03_master,
            R.string.achievement_chapter_04_clear,
            R.string.achievement_chapter_04_master,
            R.string.achievement_chapter_05_clear,
            R.string.achievement_chapter_05_master,
            R.string.achievement_chapter_06_clear,
            R.string.achievement_chapter_06_master,
            R.string.achievement_chapter_07_clear,
            R.string.achievement_chapter_07_master,
            R.string.achievement_chapter_08_clear,
            R.string.achievement_chapter_08_master,
            R.string.achievement_chapter_09_clear,
            R.string.achievement_chapter_09_master,
            R.string.achievement_chapter_10_clear,
            R.string.achievement_chapter_10_master,
            R.string.achievement_chapter_11_clear,
            R.string.achievement_chapter_11_master,
            R.string.achievement_chapter_12_clear,
            R.string.achievement_chapter_12_master,
            R.string.achievement_chapter_13_clear,
            R.string.achievement_chapter_13_master,
            R.string.achievement_chapter_14_clear,
            R.string.achievement_chapter_14_master,
            R.string.achievement_chapter_15_clear,
            R.string.achievement_chapter_15_master,
            R.string.achievement_chapter_16_clear,
            R.string.achievement_chapter_16_master,
            R.string.achievement_chapter_17_clear,
            R.string.achievement_chapter_17_master,
            R.string.achievement_chapter_18_clear,
            R.string.achievement_chapter_18_master,
            R.string.achievement_chapter_19_clear,
            R.string.achievement_chapter_19_master,
            R.string.achievement_chapter_20_clear,
            R.string.achievement_chapter_20_master,
            R.string.achievement_chapter_21_clear,
            R.string.achievement_chapter_21_master,
            R.string.achievement_chapter_22_clear,
            R.string.achievement_chapter_22_master,
            R.string.achievement_chapter_23_clear,
            R.string.achievement_chapter_23_master,
            R.string.achievement_chapter_24_clear,
            R.string.achievement_chapter_24_master,
            R.string.achievement_chapter_25_clear,
            R.string.achievement_chapter_25_master
    };
    private static final Set<Integer> pendingAchievementResIds = new LinkedHashSet<>();
    private static boolean achievementAuthCheckInFlight = false;
    private static boolean achievementSignInInFlight = false;

    private PlayGamesBridge() {
    }

    public static void signIn(Activity activity) {
        if (activity == null) return;
        activity.runOnUiThread(() -> checkAchievementAuth(activity, true));
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
        int resId = achievementResId(achievement);
        if (resId == 0) {
            Log.w(TAG, "Unknown achievement index: " + achievement);
            return;
        }
        activity.runOnUiThread(() -> {
            pendingAchievementResIds.add(resId);
            checkAchievementAuth(activity, false);
        });
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

    private static int achievementResId(int achievement) {
        if (achievement < 0 || achievement >= ACHIEVEMENT_RES_IDS.length) return 0;
        return ACHIEVEMENT_RES_IDS[achievement];
    }

    private static void checkAchievementAuth(Activity activity, boolean requestSignInWhenEmpty) {
        if (activity == null || achievementAuthCheckInFlight || achievementSignInInFlight) return;
        if (pendingAchievementResIds.isEmpty() && !requestSignInWhenEmpty) return;
        achievementAuthCheckInFlight = true;
        PlayGames.getGamesSignInClient(activity)
                .isAuthenticated()
                .addOnCompleteListener(task -> {
                    achievementAuthCheckInFlight = false;
                    boolean authenticated = task.isSuccessful()
                            && task.getResult() != null
                            && task.getResult().isAuthenticated();
                    if (authenticated) {
                        flushPendingAchievements(activity);
                        return;
                    }
                    if (!task.isSuccessful()) {
                        Log.w(TAG, "Play Games auth check failed", task.getException());
                    }
                    requestAchievementSignIn(activity);
                });
    }

    private static void requestAchievementSignIn(Activity activity) {
        if (activity == null || achievementSignInInFlight) return;
        achievementSignInInFlight = true;
        PlayGames.getGamesSignInClient(activity)
                .signIn()
                .addOnCompleteListener(task -> {
                    achievementSignInInFlight = false;
                    boolean authenticated = task.isSuccessful()
                            && task.getResult() != null
                            && task.getResult().isAuthenticated();
                    if (authenticated) {
                        flushPendingAchievements(activity);
                        return;
                    }
                    Log.w(TAG, "Play Games sign-in failed", task.getException());
                });
    }

    private static void flushPendingAchievements(Activity activity) {
        if (activity == null || pendingAchievementResIds.isEmpty()) return;
        int[] resIds = new int[pendingAchievementResIds.size()];
        int index = 0;
        for (Integer resId : pendingAchievementResIds) {
            resIds[index] = resId;
            index++;
        }
        pendingAchievementResIds.clear();
        for (int resId : resIds) {
            PlayGames.getAchievementsClient(activity)
                    .unlockImmediate(activity.getString(resId))
                    .addOnFailureListener(error -> {
                        Log.w(TAG, "Achievement unlock failed", error);
                        pendingAchievementResIds.add(resId);
                    });
        }
    }
}
