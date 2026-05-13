package invert_the_matrix.myapp;

import android.app.Application;

import com.google.android.gms.games.PlayGamesSdk;

public final class InvertMatrixApp extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        PlayGamesSdk.initialize(this);
    }
}
