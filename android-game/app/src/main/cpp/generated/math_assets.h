#pragma once

struct MathAssetSpec {
    const char *id;
    const char *file;
    int width;
    int height;
};

static constexpr MathAssetSpec kMathAssets[] = {
    {"hero", "math/hero.rgba", 501, 91},
    {"remainder", "math/remainder.rgba", 781, 91},
    {"wrap", "math/wrap.rgba", 553, 91},
    {"column", "math/column.rgba", 968, 93},
    {"plan", "math/plan.rgba", 362, 183},
    {"goal", "math/goal.rgba", 592, 161},
    {"image", "math/image.rgba", 943, 91},
    {"kernel", "math/kernel.rgba", 735, 91},
    {"minimum", "math/minimum.rgba", 961, 155},
    {"prime", "math/prime.rgba", 699, 91},
    {"four", "math/four.rgba", 438, 91},
};
