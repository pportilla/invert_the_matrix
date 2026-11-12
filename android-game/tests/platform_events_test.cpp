#include "../app/src/main/cpp/platform_events.h"

#include <atomic>
#include <cassert>
#include <thread>
#include <vector>

int main() {
    // Insets may arrive before the game thread attaches its looper.
    platform::EventQueue startupQueue;
    startupQueue.updateInsets({48, 0, 0, 24});
    unsigned startupWakes = 0;
    startupQueue.setWake([&startupWakes]() { ++startupWakes; });
    assert(startupWakes == 1);
    auto startupEvents = startupQueue.take();
    assert(startupEvents.insetsChanged && startupEvents.insets.left == 48);

    platform::EventQueue queue;
    std::atomic<unsigned> wakes{0};
    queue.setWake([&wakes]() { ++wakes; });

    // Concurrent UI notifications are delivered exactly once on the game thread.
    constexpr unsigned producers = 4;
    constexpr unsigned eventsPerProducer = 1000;
    std::vector<std::thread> threads;
    for (unsigned i = 0; i < producers; ++i) {
        threads.emplace_back([&queue]() {
            for (unsigned j = 0; j < eventsPerProducer; ++j) queue.requestBack();
        });
    }
    for (auto &thread : threads) thread.join();
    assert(queue.take().backRequests == producers * eventsPerProducer);
    assert(queue.take().backRequests == 0);
    assert(wakes == producers * eventsPerProducer);

    // Rotation/inset changes coalesce to the newest safe bounds without losing Back.
    queue.updateInsets({48, 0, 0, 24});
    queue.requestBack();
    queue.updateInsets({0, 36, 64, 48});
    auto events = queue.take();
    assert(events.backRequests == 1);
    assert(events.insetsChanged);
    assert(events.insets.left == 0 && events.insets.top == 36);
    assert(events.insets.right == 64 && events.insets.bottom == 48);
    assert(platform::contentWidth(960, events.insets) == 896);
    assert(!queue.take().insetsChanged);

    queue.updateInsets({-1, -2, -3, -4});
    events = queue.take();
    assert(events.insets.left == 0 && events.insets.top == 0);
    assert(events.insets.right == 0 && events.insets.bottom == 0);
    assert(platform::contentWidth(10, {20, 0, 20, 0}) == 1);

    // Releasing the looper disables wakeups while leaving the mailbox safe to use.
    queue.setWake({});
    unsigned beforeDetach = wakes;
    queue.requestBack();
    assert(wakes == beforeDetach);
    assert(queue.take().backRequests == 1);

    assert(platform::shouldRender(true, true));
    assert(!platform::shouldRender(false, true));
    assert(!platform::shouldRender(true, false));
    assert(!platform::shouldRender(false, false));
}
