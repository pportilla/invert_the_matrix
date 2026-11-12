#pragma once

#include <algorithm>
#include <functional>
#include <mutex>
#include <utility>

namespace platform {

struct Insets {
    int left = 0;
    int top = 0;
    int right = 0;
    int bottom = 0;
};

struct Events {
    unsigned backRequests = 0;
    bool insetsChanged = false;
    Insets insets;
};

// UI callbacks never access game state. The game thread consumes this mailbox.
// Calling wake under the lock lets its owner safely detach and release a looper.
class EventQueue {
public:
    void setWake(std::function<void()> wake) {
        std::lock_guard<std::mutex> lock(mutex_);
        wake_ = std::move(wake);
        if (wake_ && (events_.backRequests != 0 || events_.insetsChanged)) wake_();
    }

    void requestBack() {
        std::lock_guard<std::mutex> lock(mutex_);
        ++events_.backRequests;
        if (wake_) wake_();
    }

    void updateInsets(Insets insets) {
        std::lock_guard<std::mutex> lock(mutex_);
        events_.insets = {std::max(0, insets.left), std::max(0, insets.top),
                          std::max(0, insets.right), std::max(0, insets.bottom)};
        events_.insetsChanged = true;
        if (wake_) wake_();
    }

    Events take() {
        std::lock_guard<std::mutex> lock(mutex_);
        Events events = events_;
        events_ = {};
        return events;
    }

private:
    std::mutex mutex_;
    Events events_;
    std::function<void()> wake_;
};

inline int contentWidth(int surfaceWidth, Insets insets) {
    return std::max(1, surfaceWidth - insets.left - insets.right);
}

inline bool shouldRender(bool resumed, bool surfaceReady) {
    return resumed && surfaceReady;
}

} // namespace platform
