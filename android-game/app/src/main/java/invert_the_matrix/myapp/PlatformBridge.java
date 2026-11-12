package invert_the_matrix.myapp;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.Application;
import android.app.NativeActivity;
import android.graphics.Insets;
import android.os.Build;
import android.os.Bundle;
import android.view.DisplayCutout;
import android.view.View;
import android.view.WindowInsets;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;

/** Platform events are queued for the native game thread, never handled on the UI thread. */
public final class PlatformBridge implements Application.ActivityLifecycleCallbacks {
    static {
        System.loadLibrary("invertmatrix");
    }

    private static PlatformBridge instance;
    private Activity activity;
    private BackRegistration backRegistration;
    private boolean internalBackEnabled;
    private boolean resumed;

    static void install(Application application) {
        instance = new PlatformBridge();
        application.registerActivityLifecycleCallbacks(instance);
    }

    // Called from the native game thread after navigation changes.
    public static void setInternalBackEnabled(Activity activity, boolean enabled) {
        activity.runOnUiThread(() -> {
            PlatformBridge bridge = instance;
            if (bridge == null || bridge.activity != activity) return;
            bridge.internalBackEnabled = enabled;
            bridge.updateBackRegistration();
        });
    }

    // A second rapid Back can already be queued when native navigation reaches
    // the root and unregisters its callback. Complete that event as Back-to-home.
    public static void onNativeBackAtRoot(Activity activity) {
        activity.runOnUiThread(() -> {
            PlatformBridge bridge = instance;
            if (bridge != null && bridge.activity == activity && bridge.resumed) {
                activity.moveTaskToBack(true);
            }
        });
    }

    private void updateBackRegistration() {
        if (backRegistration != null) {
            backRegistration.setEnabled(resumed && internalBackEnabled);
        }
    }

    @Override
    public void onActivityCreated(Activity created, Bundle savedInstanceState) {
        if (!(created instanceof NativeActivity)) return;
        activity = created;
        if (Build.VERSION.SDK_INT >= 33) backRegistration = new Api33Back(created);
        View decor = created.getWindow().getDecorView();
        decor.setOnApplyWindowInsetsListener((view, insets) -> {
            if (activity == created) sendInsets(insets);
            return view.onApplyWindowInsets(insets);
        });
        decor.requestApplyInsets();
    }

    @SuppressWarnings("deprecation")
    private static void sendInsets(WindowInsets insets) {
        int left;
        int top;
        int right;
        int bottom;
        if (Build.VERSION.SDK_INT >= 30) {
            Insets safe = insets.getInsets(WindowInsets.Type.systemBars()
                    | WindowInsets.Type.displayCutout());
            left = safe.left;
            top = safe.top;
            right = safe.right;
            bottom = safe.bottom;
        } else {
            left = insets.getSystemWindowInsetLeft();
            top = insets.getSystemWindowInsetTop();
            right = insets.getSystemWindowInsetRight();
            bottom = insets.getSystemWindowInsetBottom();
            if (Build.VERSION.SDK_INT >= 28) {
                DisplayCutout cutout = insets.getDisplayCutout();
                if (cutout != null) {
                    left = Math.max(left, cutout.getSafeInsetLeft());
                    top = Math.max(top, cutout.getSafeInsetTop());
                    right = Math.max(right, cutout.getSafeInsetRight());
                    bottom = Math.max(bottom, cutout.getSafeInsetBottom());
                }
            }
        }
        nativeUpdateInsets(left, top, right, bottom);
    }

    @Override
    public void onActivityResumed(Activity resumedActivity) {
        if (activity != resumedActivity) return;
        resumed = true;
        updateBackRegistration();
        activity.getWindow().getDecorView().requestApplyInsets();
    }

    @Override
    public void onActivityPaused(Activity pausedActivity) {
        if (activity != pausedActivity) return;
        resumed = false;
        updateBackRegistration();
    }

    @Override
    public void onActivityDestroyed(Activity destroyed) {
        if (activity != destroyed) return;
        if (backRegistration != null) backRegistration.setEnabled(false);
        destroyed.getWindow().getDecorView().setOnApplyWindowInsetsListener(null);
        backRegistration = null;
        activity = null;
        internalBackEnabled = false;
        resumed = false;
    }

    @Override public void onActivityStarted(Activity activity) {}
    @Override public void onActivityStopped(Activity activity) {}
    @Override public void onActivitySaveInstanceState(Activity activity, Bundle state) {}

    private interface BackRegistration {
        void setEnabled(boolean enabled);
    }

    @TargetApi(33)
    private static final class Api33Back implements BackRegistration {
        private final OnBackInvokedDispatcher dispatcher;
        private final OnBackInvokedCallback callback = PlatformBridge::nativeRequestBack;
        private boolean registered;

        Api33Back(Activity activity) {
            dispatcher = activity.getOnBackInvokedDispatcher();
        }

        @Override
        public void setEnabled(boolean enabled) {
            if (registered == enabled) return;
            if (enabled) {
                dispatcher.registerOnBackInvokedCallback(
                        OnBackInvokedDispatcher.PRIORITY_DEFAULT, callback);
            } else {
                dispatcher.unregisterOnBackInvokedCallback(callback);
            }
            registered = enabled;
        }
    }

    private static native void nativeRequestBack();
    private static native void nativeUpdateInsets(int left, int top, int right, int bottom);
}
