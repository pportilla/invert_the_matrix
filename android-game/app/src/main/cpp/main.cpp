#include <android/configuration.h>
#include <android/asset_manager.h>
#include <android/input.h>
#include <android/log.h>
#include <android_native_app_glue.h>
#include <EGL/egl.h>
#include <GLES2/gl2.h>
#include <SLES/OpenSLES.h>
#include <SLES/OpenSLES_Android.h>
#include <jni.h>

#include <optional>

#include "include/core/SkCanvas.h"
#include "include/core/SkBlurTypes.h"
#include "include/core/SkColor.h"
#include "include/core/SkImage.h"
#include "include/core/SkImageInfo.h"
#include "include/core/SkMaskFilter.h"
#include "include/core/SkPaint.h"
#include "include/core/SkPath.h"
#include "include/core/SkPathBuilder.h"
#include "include/core/SkPixmap.h"
#include "include/core/SkRRect.h"
#include "include/core/SkRect.h"
#include "include/core/SkRefCnt.h"
#include "include/core/SkSamplingOptions.h"
#include "include/core/SkShader.h"
#include "include/core/SkSurface.h"
#include "include/effects/SkGradient.h"
#include "include/gpu/ganesh/GrBackendSurface.h"
#include "include/gpu/ganesh/GrDirectContext.h"
#include "include/gpu/ganesh/SkSurfaceGanesh.h"
#include "include/gpu/ganesh/gl/GrGLBackendSurface.h"
#include "include/gpu/ganesh/gl/GrGLDirectContext.h"
#include "include/gpu/ganesh/gl/GrGLInterface.h"
#include "include/gpu/ganesh/gl/egl/GrGLMakeEGLInterface.h"
#include "include/utils/SkParsePath.h"
#include "src/gpu/ganesh/gl/GrGLDefines.h"

#include <algorithm>
#include <array>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <cctype>
#include <cstring>
#include <cstdio>
#include <cstdlib>
#include <ctime>
#include <fstream>
#include <map>
#include <set>
#include <sstream>
#include <string>
#include <stdexcept>
#include <unordered_map>
#include <unordered_set>
#include <tuple>
#include <utility>
#include <vector>

#define STB_TRUETYPE_IMPLEMENTATION
#include "third_party/stb_truetype.h"

#include "generated/math_assets.h"
#include "platform_events.h"

#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, "InvertMatrixCpp", __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, "InvertMatrixCpp", __VA_ARGS__)

namespace {

platform::EventQueue platformEvents;

struct Color {
    float r;
    float g;
    float b;
    float a;
};

struct Rect {
    float x;
    float y;
    float w;
    float h;

    bool contains(float px, float py) const {
        return px >= x && px <= x + w && py >= y && py <= y + h;
    }
};

struct Vertex {
    float x;
    float y;
    float r;
    float g;
    float b;
    float a;
};

struct TextVertex {
    float x;
    float y;
    float u;
    float v;
    float r;
    float g;
    float b;
    float a;
};

Color rgba(int r, int g, int b, float a = 1.0f) {
    return {r / 255.0f, g / 255.0f, b / 255.0f, a};
}

Color withAlpha(Color c, float a) {
    c.a = a;
    return c;
}

const Color BG = rgba(12, 17, 24);
const Color PANEL = rgba(21, 27, 36, 0.96f);
const Color PANEL_2 = rgba(27, 35, 48, 0.96f);
const Color LINE = rgba(190, 203, 220, 0.18f);
const Color LINE_STRONG = rgba(190, 203, 220, 0.32f);
const Color TEXT = rgba(244, 247, 251);
const Color MUTED = rgba(162, 173, 186);
const Color MUTED_STRONG = rgba(192, 202, 214);
const Color BLUE = rgba(88, 184, 232);
const Color ORANGE = rgba(220, 164, 88);
const Color PURPLE = rgba(165, 140, 229);
const Color GREEN = rgba(99, 212, 157);
const Color DANGER = rgba(229, 111, 126);
constexpr int64_t HINT_COOLDOWN_MS = 500;
constexpr int64_t HINT_COMPLETION_DELAY_MS = 500;
constexpr int EXACT_BFS_STATE_LIMIT = 500000;
constexpr int EXACT_NULLSPACE_LIMIT = 500000;
constexpr const char *APP_VERSION_NAME = "1.0.17";
constexpr const char *GITHUB_PROFILE_URL = "https://github.com/pportilla";
constexpr const char *GITHUB_MARK_SVG_PATH =
        "M8 0 C3.58 0 0 3.58 0 8 "
        "c0 3.54 2.29 6.53 5.47 7.59 "
        "c0.4 0.07 0.55 -0.17 0.55 -0.38 "
        "c0 -0.19 -0.01 -0.82 -0.01 -1.49 "
        "c-2.01 0.37 -2.53 -0.49 -2.69 -0.94 "
        "c-0.09 -0.23 -0.48 -0.94 -0.82 -1.13 "
        "c-0.28 -0.15 -0.68 -0.52 -0.01 -0.53 "
        "c0.63 -0.01 1.08 0.58 1.23 0.82 "
        "c0.72 1.21 1.87 0.87 2.33 0.66 "
        "c0.07 -0.52 0.28 -0.87 0.51 -1.07 "
        "c-1.78 -0.2 -3.64 -0.89 -3.64 -3.95 "
        "c0 -0.87 0.31 -1.59 0.82 -2.15 "
        "c-0.08 -0.2 -0.36 -1.02 0.08 -2.12 "
        "c0 0 0.67 -0.21 2.2 0.82 "
        "A7.52 7.52 0 0 1 8 3.86 "
        "c0.68 0 1.36 0.09 2 0.27 "
        "c1.53 -1.04 2.2 -0.82 2.2 -0.82 "
        "c0.44 1.1 0.16 1.92 0.08 2.12 "
        "c0.51 0.56 0.82 1.27 0.82 2.15 "
        "c0 3.07 -1.87 3.75 -3.65 3.95 "
        "c0.29 0.25 0.54 0.73 0.54 1.48 "
        "c0 1.07 -0.01 1.93 -0.01 2.2 "
        "c0 0.21 0.15 0.46 0.55 0.38 "
        "A8.01 8.01 0 0 0 16 8 "
        "c0 -4.42 -3.58 -8 -8 -8 Z";

int64_t nowMs() {
    using namespace std::chrono;
    return duration_cast<milliseconds>(steady_clock::now().time_since_epoch()).count();
}

int mod(int value, int m) {
    return ((value % m) + m) % m;
}

int clampInt(int value, int minValue, int maxValue) {
    return std::max(minValue, std::min(maxValue, value));
}

float clampFloat(float value, float minValue, float maxValue) {
    return std::max(minValue, std::min(maxValue, value));
}

const std::unordered_map<std::string, std::string> &translationTable(const std::string &language);
struct LanguageOption { const char *code; const char *name; };
constexpr LanguageOption languages[] = {{"en", "English"}, {"es", "Español"}, {"fr", "Français"}, {"ko", "한국어"}};

struct Renderer {
    android_app *app = nullptr;
    EGLDisplay display = EGL_NO_DISPLAY;
    EGLSurface surface = EGL_NO_SURFACE;
    EGLContext context = EGL_NO_CONTEXT;
    GLuint program = 0;
    GLuint textProgram = 0;
    GLuint vbo = 0;
    GLuint textVbo = 0;
    GLuint fontTexture = 0;
    sk_sp<GrDirectContext> skContext;
    sk_sp<SkSurface> skSurface;
    SkCanvas *skCanvas = nullptr;
    GLint posLoc = -1;
    GLint colorLoc = -1;
    GLint textPosLoc = -1;
    GLint textUvLoc = -1;
    GLint textColorLoc = -1;
    GLint textSamplerLoc = -1;
    int width = 0;
    int height = 0;
    int surfaceWidth = 0;
    platform::Insets safeInsets;
    bool fontReady = false;
    std::vector<unsigned char> vectorFontData;
    stbtt_fontinfo vectorFontInfo{};
    bool vectorFontReady = false;
    static constexpr int FONT_ATLAS = 2048;
    static constexpr float FONT_BAKE_SIZE = 128.0f;
    static constexpr int FONT_FIRST_CHAR = 32;
    static constexpr int FONT_CHAR_COUNT = 224;
    static constexpr int MATH_GLYPH_COUNT = 8;
    stbtt_bakedchar baked[FONT_CHAR_COUNT]{};
    std::unordered_map<int, stbtt_packedchar> supplementalGlyphs;
    stbtt_packedchar mathBaked[MATH_GLYPH_COUNT]{};
    GLuint mathTexture = 0;
    bool mathReady = false;
    std::array<int, MATH_GLYPH_COUNT> mathCodepoints = {{
            0x2208, // element of
            0x2124, // double-struck Z
            0x2261, // congruent
            0x2190, // left arrow
            0x21D2, // right double arrow
            0x2211, // summation
            0x2225, // parallel, used as norm bars
            0x2262  // not congruent
    }};
    std::vector<Vertex> vertices;

    bool ready() const {
        return display != EGL_NO_DISPLAY && width > 0 && height > 0;
    }

    static SkColor skColor(Color color) {
        auto channel = [](float v) {
            return static_cast<U8CPU>(std::max(0.0f, std::min(1.0f, v)) * 255.0f + 0.5f);
        };
        return SkColorSetARGB(channel(color.a), channel(color.r), channel(color.g), channel(color.b));
    }

    bool skiaReady() const {
        return skContext != nullptr && skCanvas != nullptr;
    }

    bool init(android_app *nativeApp) {
        app = nativeApp;
        const EGLint attrs[] = {
                EGL_RENDERABLE_TYPE, EGL_OPENGL_ES2_BIT,
                EGL_SURFACE_TYPE, EGL_WINDOW_BIT,
                EGL_BLUE_SIZE, 8,
                EGL_GREEN_SIZE, 8,
                EGL_RED_SIZE, 8,
                EGL_ALPHA_SIZE, 8,
                EGL_DEPTH_SIZE, 0,
                EGL_NONE
        };
        EGLint format = 0;
        EGLint configs = 0;
        EGLConfig config = nullptr;
        display = eglGetDisplay(EGL_DEFAULT_DISPLAY);
        eglInitialize(display, nullptr, nullptr);
        eglChooseConfig(display, attrs, &config, 1, &configs);
        eglGetConfigAttrib(display, config, EGL_NATIVE_VISUAL_ID, &format);
        ANativeWindow_setBuffersGeometry(app->window, 0, 0, format);

        const EGLint contextAttrs[] = {EGL_CONTEXT_CLIENT_VERSION, 2, EGL_NONE};
        surface = eglCreateWindowSurface(display, config, app->window, nullptr);
        context = eglCreateContext(display, config, EGL_NO_CONTEXT, contextAttrs);
        if (eglMakeCurrent(display, surface, surface, context) == EGL_FALSE) {
            LOGE("Unable to eglMakeCurrent");
            return false;
        }
        eglSwapInterval(display, 1);
        eglQuerySurface(display, surface, EGL_WIDTH, &surfaceWidth);
        eglQuerySurface(display, surface, EGL_HEIGHT, &height);
        width = platform::contentWidth(surfaceWidth, safeInsets);
        initGl();
        initSkia();
        applyViewport();
        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        return true;
    }

    bool updateSurfaceSize(bool forceViewport = false) {
        if (display == EGL_NO_DISPLAY || surface == EGL_NO_SURFACE) return false;
        EGLint nextWidth = 0;
        EGLint nextHeight = 0;
        if (eglQuerySurface(display, surface, EGL_WIDTH, &nextWidth) == EGL_FALSE ||
            eglQuerySurface(display, surface, EGL_HEIGHT, &nextHeight) == EGL_FALSE ||
            nextWidth <= 0 || nextHeight <= 0) {
            return false;
        }
        bool changed = nextWidth != surfaceWidth || nextHeight != height;
        surfaceWidth = nextWidth;
        width = platform::contentWidth(surfaceWidth, safeInsets);
        height = nextHeight;
        if (changed) {
            skCanvas = nullptr;
            skSurface.reset();
        }
        if (changed || forceViewport) {
            applyViewport();
        }
        return changed;
    }

    void applyViewport() const {
        glViewport(safeInsets.left, 0, width, height);
        // Skia can leave a narrower scissor active after submitting a shape.
        // Restore our content clip before every direct OpenGL draw.
        glEnable(GL_SCISSOR_TEST);
        glScissor(safeInsets.left, 0, width, height);
        if (skContext) skContext->resetContext();
    }

    void setSafeInsets(platform::Insets insets) {
        safeInsets = insets;
        if (surfaceWidth > 0) width = platform::contentWidth(surfaceWidth, safeInsets);
        if (ready()) applyViewport();
    }

    void initSkia() {
        auto interface = GrGLInterfaces::MakeEGL();
        if (!interface) {
            LOGE("Unable to create Skia EGL GL interface");
            return;
        }
        skContext = GrDirectContexts::MakeGL(interface);
        if (!skContext) {
            LOGE("Unable to create Skia DirectContext");
        }
    }

    void ensureSkiaSurface() {
        skCanvas = nullptr;
        if (!skContext || width <= 0 || height <= 0) return;
        GLint framebuffer = 0;
        glGetIntegerv(GL_FRAMEBUFFER_BINDING, &framebuffer);
        GrGLFramebufferInfo fbInfo;
        fbInfo.fFBOID = static_cast<GrGLuint>(framebuffer);
        fbInfo.fFormat = GR_GL_RGBA8;
        auto target = GrBackendRenderTargets::MakeGL(surfaceWidth, height, 0, 8, fbInfo);
        skSurface = SkSurfaces::WrapBackendRenderTarget(skContext.get(),
                                                        target,
                                                        kBottomLeft_GrSurfaceOrigin,
                                                        kRGBA_8888_SkColorType,
                                                        nullptr,
                                                        nullptr);
        if (!skSurface) {
            LOGE("Unable to wrap default framebuffer in Skia surface");
            return;
        }
        skCanvas = skSurface->getCanvas();
    }

    void initGl() {
        const char *vs =
                "attribute vec2 aPos;"
                "attribute vec4 aColor;"
                "varying vec4 vColor;"
                "void main(){vColor=aColor;gl_Position=vec4(aPos,0.0,1.0);}";
        const char *fs =
                "precision mediump float;"
                "varying vec4 vColor;"
                "void main(){gl_FragColor=vColor;}";
        const char *textVs =
                "attribute vec2 aPos;"
                "attribute vec2 aUv;"
                "attribute vec4 aColor;"
                "varying vec2 vUv;"
                "varying vec4 vColor;"
                "void main(){vUv=aUv;vColor=aColor;gl_Position=vec4(aPos,0.0,1.0);}";
        const char *textFs =
                "precision mediump float;"
                "uniform sampler2D uTex;"
                "varying vec2 vUv;"
                "varying vec4 vColor;"
                "void main(){float a=texture2D(uTex,vUv).r;gl_FragColor=vec4(vColor.rgb,vColor.a*a);}";
        GLuint v = glCreateShader(GL_VERTEX_SHADER);
        GLuint f = glCreateShader(GL_FRAGMENT_SHADER);
        glShaderSource(v, 1, &vs, nullptr);
        glShaderSource(f, 1, &fs, nullptr);
        glCompileShader(v);
        glCompileShader(f);
        program = glCreateProgram();
        glAttachShader(program, v);
        glAttachShader(program, f);
        glLinkProgram(program);
        glDeleteShader(v);
        glDeleteShader(f);
        posLoc = glGetAttribLocation(program, "aPos");
        colorLoc = glGetAttribLocation(program, "aColor");
        glGenBuffers(1, &vbo);

        GLuint tv = glCreateShader(GL_VERTEX_SHADER);
        GLuint tf = glCreateShader(GL_FRAGMENT_SHADER);
        glShaderSource(tv, 1, &textVs, nullptr);
        glShaderSource(tf, 1, &textFs, nullptr);
        glCompileShader(tv);
        glCompileShader(tf);
        textProgram = glCreateProgram();
        glAttachShader(textProgram, tv);
        glAttachShader(textProgram, tf);
        glLinkProgram(textProgram);
        glDeleteShader(tv);
        glDeleteShader(tf);
        textPosLoc = glGetAttribLocation(textProgram, "aPos");
        textUvLoc = glGetAttribLocation(textProgram, "aUv");
        textColorLoc = glGetAttribLocation(textProgram, "aColor");
        textSamplerLoc = glGetUniformLocation(textProgram, "uTex");
        glGenBuffers(1, &textVbo);
        loadFont();
        loadMathFont();
    }

    std::vector<unsigned char> readFontAsset(const char *path) const {
        if (!app || !app->activity || !app->activity->assetManager) return {};
        AAsset *asset = AAssetManager_open(app->activity->assetManager, path, AASSET_MODE_BUFFER);
        if (!asset) return {};
        const auto *bytes = static_cast<const unsigned char *>(AAsset_getBuffer(asset));
        std::vector<unsigned char> data;
        if (bytes) data.assign(bytes, bytes + AAsset_getLength(asset));
        AAsset_close(asset);
        return data;
    }

    void packSupplementalGlyphs(const std::vector<unsigned char> &font, std::vector<unsigned char> &bitmap, int firstRow) {
        supplementalGlyphs.clear();
        if (font.empty() || firstRow >= FONT_ATLAS) return;
        std::set<int> needed;
        auto collect = [&](const std::string &text) {
            for (int cp : utf8Codepoints(text)) {
                if (cp >= FONT_FIRST_CHAR + FONT_CHAR_COUNT) needed.insert(cp);
            }
        };
        for (const auto &language : languages) {
            collect(language.name);
            for (const auto &entry : translationTable(language.code)) {
                collect(entry.first);
                collect(entry.second);
            }
        }
        std::vector<int> codepoints(needed.begin(), needed.end());
        std::vector<stbtt_packedchar> glyphs(codepoints.size());
        // Reuse the space below the Latin alphabet in the same GL texture.
        // Use a smaller bake size if a future translation introduces more glyphs.
        for (int size : {80, 64, 48, 32, 24}) {
            stbtt_pack_context pack{};
            if (!stbtt_PackBegin(&pack, bitmap.data() + firstRow * FONT_ATLAS, FONT_ATLAS,
                                 FONT_ATLAS - firstRow, 0, 1, nullptr)) break;
            stbtt_pack_range range{};
            range.font_size = static_cast<float>(size);
            range.array_of_unicode_codepoints = codepoints.data();
            range.num_chars = static_cast<int>(codepoints.size());
            range.chardata_for_range = glyphs.data();
            int packed = stbtt_PackFontRanges(&pack, font.data(), 0, &range, 1);
            stbtt_PackEnd(&pack);
            if (!packed) continue;
            for (size_t i = 0; i < glyphs.size(); ++i) {
                auto glyph = glyphs[i];
                glyph.y0 += firstRow;
                glyph.y1 += firstRow;
                float factor = FONT_BAKE_SIZE / size;
                glyph.xadvance *= factor;
                glyph.xoff *= factor;
                glyph.yoff *= factor;
                glyph.xoff2 *= factor;
                glyph.yoff2 *= factor;
                supplementalGlyphs.emplace(codepoints[i], glyph);
            }
            return;
        }
        LOGE("Supplemental font glyphs did not fit the atlas");
    }

    void loadFont() {
        const char *paths[] = {
                "/system/fonts/Roboto-Regular.ttf",
                "/system/fonts/RobotoFlex-Regular.ttf",
                "/system/fonts/NotoSans-Regular.ttf",
                "/system/fonts/DroidSans.ttf"
        };
        std::vector<unsigned char> fontData;
        for (const char *path : paths) {
            std::ifstream in(path, std::ios::binary);
            if (!in) continue;
            in.seekg(0, std::ios::end);
            std::streamoff size = in.tellg();
            in.seekg(0, std::ios::beg);
            if (size <= 0) continue;
            fontData.resize(static_cast<size_t>(size));
            in.read(reinterpret_cast<char *>(fontData.data()), size);
            if (in) break;
            fontData.clear();
        }
        auto fallbackFont = readFontAsset("fonts/DroidSansFallback-subset.ttf");
        if (fontData.empty()) fontData = fallbackFont;
        if (fontData.empty()) {
            LOGE("No system font found, falling back to pixel text");
            fontReady = false;
            vectorFontReady = false;
            return;
        }

        vectorFontData = fontData;
        int vectorFontOffset = stbtt_GetFontOffsetForIndex(vectorFontData.data(), 0);
        vectorFontReady = vectorFontOffset >= 0 &&
                          stbtt_InitFont(&vectorFontInfo, vectorFontData.data(), vectorFontOffset) != 0;

        std::vector<unsigned char> bitmap(FONT_ATLAS * FONT_ATLAS);
        int result = stbtt_BakeFontBitmap(fontData.data(), 0, FONT_BAKE_SIZE,
                                          bitmap.data(), FONT_ATLAS, FONT_ATLAS,
                                          FONT_FIRST_CHAR, FONT_CHAR_COUNT, baked);
        if (result <= 0) {
            LOGE("Font bake failed");
            fontReady = false;
            return;
        }

        packSupplementalGlyphs(fallbackFont, bitmap, result);
        glGenTextures(1, &fontTexture);
        glBindTexture(GL_TEXTURE_2D, fontTexture);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
        glTexImage2D(GL_TEXTURE_2D, 0, GL_LUMINANCE, FONT_ATLAS, FONT_ATLAS, 0,
                     GL_LUMINANCE, GL_UNSIGNED_BYTE, bitmap.data());
        fontReady = true;
    }

    void loadMathFont() {
        mathReady = false;
        auto fontData = readFontAsset("fonts/NotoSansMath-Regular.ttf");
        if (fontData.empty()) {
            const char *paths[] = {
                    "/system/fonts/NotoSansMath-Regular.ttf",
                    "/system/fonts/NotoSansSymbols-Regular-Subsetted2.ttf",
                    "/system/fonts/NotoSansSymbols-Regular-Subsetted.ttf",
                    "/system/fonts/NotoSerif-Regular.ttf"
            };
            for (const char *path : paths) {
                std::ifstream in(path, std::ios::binary);
                if (!in) continue;
                in.seekg(0, std::ios::end);
                std::streamoff size = in.tellg();
                in.seekg(0, std::ios::beg);
                if (size <= 0) continue;
                fontData.resize(static_cast<size_t>(size));
                in.read(reinterpret_cast<char *>(fontData.data()), size);
                if (in) break;
                fontData.clear();
            }
        }
        if (fontData.empty()) {
            LOGE("No math font found. Falling back to drawn formula symbols");
            return;
        }

        std::vector<unsigned char> bitmap(FONT_ATLAS * FONT_ATLAS);
        stbtt_pack_context pack{};
        if (!stbtt_PackBegin(&pack, bitmap.data(), FONT_ATLAS, FONT_ATLAS, 0, 1, nullptr)) {
            LOGE("Math font pack begin failed");
            return;
        }
        stbtt_PackSetOversampling(&pack, 2, 2);
        stbtt_pack_range range{};
        range.font_size = FONT_BAKE_SIZE;
        range.array_of_unicode_codepoints = mathCodepoints.data();
        range.num_chars = MATH_GLYPH_COUNT;
        range.chardata_for_range = mathBaked;
        int packed = stbtt_PackFontRanges(&pack, fontData.data(), 0, &range, 1);
        stbtt_PackEnd(&pack);
        if (!packed) {
            LOGE("Math font pack failed");
            return;
        }

        if (!mathTexture) glGenTextures(1, &mathTexture);
        glBindTexture(GL_TEXTURE_2D, mathTexture);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
        glTexImage2D(GL_TEXTURE_2D, 0, GL_LUMINANCE, FONT_ATLAS, FONT_ATLAS, 0,
                     GL_LUMINANCE, GL_UNSIGNED_BYTE, bitmap.data());
        mathReady = true;
    }

    void shutdown() {
        skCanvas = nullptr;
        skSurface.reset();
        if (skContext) {
            skContext->abandonContext();
            skContext.reset();
        }
        if (display != EGL_NO_DISPLAY) {
            eglMakeCurrent(display, EGL_NO_SURFACE, EGL_NO_SURFACE, EGL_NO_CONTEXT);
            if (context != EGL_NO_CONTEXT) eglDestroyContext(display, context);
            if (surface != EGL_NO_SURFACE) eglDestroySurface(display, surface);
            eglTerminate(display);
        }
        display = EGL_NO_DISPLAY;
        context = EGL_NO_CONTEXT;
        surface = EGL_NO_SURFACE;
        width = 0;
        height = 0;
        surfaceWidth = 0;
        if (vbo) glDeleteBuffers(1, &vbo);
        if (textVbo) glDeleteBuffers(1, &textVbo);
        if (fontTexture) glDeleteTextures(1, &fontTexture);
        if (mathTexture) glDeleteTextures(1, &mathTexture);
        if (program) glDeleteProgram(program);
        if (textProgram) glDeleteProgram(textProgram);
        vbo = 0;
        textVbo = 0;
        fontTexture = 0;
        mathTexture = 0;
        program = 0;
        textProgram = 0;
        fontReady = false;
        mathReady = false;
        vectorFontReady = false;
        vectorFontData.clear();
    }

    void begin() {
        updateSurfaceSize();
        vertices.clear();
        ensureSkiaSurface();
        if (skiaReady()) {
            skCanvas->clear(skColor(BG));
            skCanvas->translate(static_cast<float>(safeInsets.left), 0.0f);
            skCanvas->clipRect(SkRect::MakeWH(static_cast<float>(width), static_cast<float>(height)));
        } else {
            glDisable(GL_SCISSOR_TEST);
            glClearColor(BG.r, BG.g, BG.b, 1.0f);
            glClear(GL_COLOR_BUFFER_BIT);
        }
    }

    Vertex vertex(float px, float py, Color color) {
        return {
                px / width * 2.0f - 1.0f,
                1.0f - py / height * 2.0f,
                color.r, color.g, color.b, color.a
        };
    }

    void tri(float ax, float ay, float bx, float by, float cx, float cy, Color color) {
        if (color.a <= 0) return;
        vertices.push_back(vertex(ax, ay, color));
        vertices.push_back(vertex(bx, by, color));
        vertices.push_back(vertex(cx, cy, color));
    }

    void rect(float x, float y, float w, float h, Color color) {
        if (w <= 0 || h <= 0 || color.a <= 0) return;
        if (skiaReady()) {
            SkPaint paint;
            paint.setAntiAlias(true);
            paint.setColor(skColor(color));
            skCanvas->drawRect(SkRect::MakeXYWH(x, y, w, h), paint);
            return;
        }
        float x1 = x / width * 2.0f - 1.0f;
        float x2 = (x + w) / width * 2.0f - 1.0f;
        float y1 = 1.0f - y / height * 2.0f;
        float y2 = 1.0f - (y + h) / height * 2.0f;
        Vertex a{x1, y1, color.r, color.g, color.b, color.a};
        Vertex b{x2, y1, color.r, color.g, color.b, color.a};
        Vertex c{x2, y2, color.r, color.g, color.b, color.a};
        Vertex d{x1, y2, color.r, color.g, color.b, color.a};
        vertices.insert(vertices.end(), {a, b, c, a, c, d});
    }

    void rectGradient(float x, float y, float w, float h, Color top, Color bottom) {
        if (w <= 0 || h <= 0) return;
        if (skiaReady()) {
            SkPoint pts[] = {{x, y}, {x, y + h}};
            SkColor4f colors[] = {{top.r, top.g, top.b, top.a}, {bottom.r, bottom.g, bottom.b, bottom.a}};
            SkPaint paint;
            paint.setAntiAlias(true);
            paint.setShader(SkShaders::LinearGradient(pts, {{colors, {}, SkTileMode::kClamp}, {}}));
            skCanvas->drawRect(SkRect::MakeXYWH(x, y, w, h), paint);
            return;
        }
        float x1 = x / width * 2.0f - 1.0f;
        float x2 = (x + w) / width * 2.0f - 1.0f;
        float y1 = 1.0f - y / height * 2.0f;
        float y2 = 1.0f - (y + h) / height * 2.0f;
        Vertex a{x1, y1, top.r, top.g, top.b, top.a};
        Vertex b{x2, y1, top.r, top.g, top.b, top.a};
        Vertex c{x2, y2, bottom.r, bottom.g, bottom.b, bottom.a};
        Vertex d{x1, y2, bottom.r, bottom.g, bottom.b, bottom.a};
        vertices.insert(vertices.end(), {a, b, c, a, c, d});
    }

    void roundedRectGradient(float x, float y, float w, float h, float radius, Color top, Color bottom) {
        if (w <= 0 || h <= 0) return;
        radius = std::max(0.0f, std::min(radius, std::min(w, h) * 0.5f));
        if (skiaReady()) {
            SkPoint pts[] = {{x, y}, {x, y + h}};
            SkColor4f colors[] = {{top.r, top.g, top.b, top.a}, {bottom.r, bottom.g, bottom.b, bottom.a}};
            SkPaint paint;
            paint.setAntiAlias(true);
            paint.setShader(SkShaders::LinearGradient(pts, {{colors, {}, SkTileMode::kClamp}, {}}));
            skCanvas->drawRoundRect(SkRect::MakeXYWH(x, y, w, h), radius, radius, paint);
            return;
        }
        roundedRect(x, y, w, h, radius, bottom);
        roundedRect(x, y, w, h * 0.58f, radius, top);
    }

    void circle(float cx, float cy, float radius, Color color, int segments = 32) {
        if (radius <= 0 || color.a <= 0) return;
        if (skiaReady()) {
            SkPaint paint;
            paint.setAntiAlias(true);
            paint.setColor(skColor(color));
            skCanvas->drawCircle(cx, cy, radius, paint);
            return;
        }
        float prevX = cx + radius;
        float prevY = cy;
        for (int i = 1; i <= segments; ++i) {
            float a = static_cast<float>(i) / segments * 6.28318530718f;
            float x = cx + std::cos(a) * radius;
            float y = cy + std::sin(a) * radius;
            tri(cx, cy, prevX, prevY, x, y, color);
            prevX = x;
            prevY = y;
        }
    }

    void line(float ax, float ay, float bx, float by, float thickness, Color color) {
        float dx = bx - ax;
        float dy = by - ay;
        float len = std::sqrt(dx * dx + dy * dy);
        if (len <= 0.001f || thickness <= 0.0f || color.a <= 0.0f) return;
        if (skiaReady()) {
            SkPaint paint;
            paint.setAntiAlias(true);
            paint.setColor(skColor(color));
            paint.setStrokeWidth(thickness);
            paint.setStrokeCap(SkPaint::kRound_Cap);
            paint.setStyle(SkPaint::kStroke_Style);
            skCanvas->drawLine(ax, ay, bx, by, paint);
            return;
        }
        float nx = -dy / len * thickness * 0.5f;
        float ny = dx / len * thickness * 0.5f;
        tri(ax + nx, ay + ny, bx + nx, by + ny, bx - nx, by - ny, color);
        tri(ax + nx, ay + ny, bx - nx, by - ny, ax - nx, ay - ny, color);
    }

    void roundedRect(float x, float y, float w, float h, float radius, Color color) {
        radius = std::max(0.0f, std::min(radius, std::min(w, h) * 0.5f));
        if (skiaReady()) {
            SkPaint paint;
            paint.setAntiAlias(true);
            paint.setColor(skColor(color));
            skCanvas->drawRoundRect(SkRect::MakeXYWH(x, y, w, h), radius, radius, paint);
            return;
        }
        if (radius <= 1.0f) {
            rect(x, y, w, h, color);
            return;
        }
        rect(x + radius, y, w - radius * 2.0f, h, color);
        rect(x, y + radius, w, h - radius * 2.0f, color);
        circle(x + radius, y + radius, radius, color, 20);
        circle(x + w - radius, y + radius, radius, color, 20);
        circle(x + radius, y + h - radius, radius, color, 20);
        circle(x + w - radius, y + h - radius, radius, color, 20);
    }

    void glow(Rect r, float radius, Color color, int layers = 5) {
        if (skiaReady()) {
            SkPaint paint;
            paint.setAntiAlias(true);
            paint.setColor(skColor(color));
            paint.setMaskFilter(SkMaskFilter::MakeBlur(kNormal_SkBlurStyle, std::max(1.0f, radius * 0.52f)));
            SkRect rect = SkRect::MakeXYWH(r.x - radius * 0.35f, r.y - radius * 0.35f,
                                           r.w + radius * 0.7f, r.h + radius * 0.7f);
            float rr = std::min(rect.width(), rect.height()) * 0.22f;
            skCanvas->drawRoundRect(rect, rr, rr, paint);
            return;
        }
        for (int i = layers; i >= 1; --i) {
            float t = static_cast<float>(i) / layers;
            float expand = radius * 1.55f * t;
            float falloff = 1.0f - t;
            Color c = withAlpha(color, color.a * (0.015f + 0.20f * falloff * falloff));
            roundedRect(r.x - expand, r.y - expand, r.w + expand * 2.0f, r.h + expand * 2.0f,
                        radius + expand, c);
        }
    }

    void softAura(float cx, float cy, float radius, Color color, int layers = 8) {
        if (skiaReady()) {
            SkColor4f colors[] = {
                    {color.r, color.g, color.b, color.a},
                    {color.r, color.g, color.b, 0.0f}
            };
            SkScalar pos[] = {0.0f, 1.0f};
            SkPaint paint;
            paint.setAntiAlias(true);
            paint.setShader(SkShaders::RadialGradient({cx, cy}, radius, {{colors, pos, SkTileMode::kClamp}, {}}));
            skCanvas->drawCircle(cx, cy, radius, paint);
            return;
        }
        for (int i = layers; i >= 1; --i) {
            float t = static_cast<float>(i) / layers;
            float a = color.a * 0.16f * (1.0f - t) * (1.0f - t);
            circle(cx, cy, radius * (0.2f + t), withAlpha(color, a), 36);
        }
    }

    void star(float cx, float cy, float outerRadius, float innerRadius, Color fill, Color strokeColor = rgba(0, 0, 0, 0.0f), float strokeWidth = 0.0f) {
        if (outerRadius <= 0.0f || fill.a <= 0.0f) return;
        constexpr float PI = 3.14159265358979323846f;
        if (skiaReady()) {
            SkPathBuilder builder;
            for (int i = 0; i < 10; ++i) {
                float radius = (i % 2 == 0) ? outerRadius : innerRadius;
                float angle = -PI * 0.5f + static_cast<float>(i) * PI / 5.0f;
                float x = cx + std::cos(angle) * radius;
                float y = cy + std::sin(angle) * radius;
                if (i == 0) builder.moveTo(x, y); else builder.lineTo(x, y);
            }
            SkPath path = builder.close().detach();
            SkPaint paint;
            paint.setAntiAlias(true);
            paint.setColor(skColor(fill));
            paint.setStyle(SkPaint::kFill_Style);
            skCanvas->drawPath(path, paint);
            if (strokeWidth > 0.0f && strokeColor.a > 0.0f) {
                paint.setColor(skColor(strokeColor));
                paint.setStyle(SkPaint::kStroke_Style);
                paint.setStrokeWidth(strokeWidth);
                paint.setStrokeJoin(SkPaint::kRound_Join);
                skCanvas->drawPath(path, paint);
            }
            return;
        }

        std::array<std::pair<float, float>, 10> pts{};
        for (int i = 0; i < 10; ++i) {
            float radius = (i % 2 == 0) ? outerRadius : innerRadius;
            float angle = -PI * 0.5f + static_cast<float>(i) * PI / 5.0f;
            pts[i] = {cx + std::cos(angle) * radius, cy + std::sin(angle) * radius};
        }
        for (int i = 1; i < 9; ++i) {
            tri(cx, cy, pts[i].first, pts[i].second, pts[i + 1].first, pts[i + 1].second, fill);
        }
        tri(cx, cy, pts[9].first, pts[9].second, pts[0].first, pts[0].second, fill);
        if (strokeWidth > 0.0f && strokeColor.a > 0.0f) {
            for (int i = 0; i < 10; ++i) {
                auto a = pts[i];
                auto b = pts[(i + 1) % 10];
                line(a.first, a.second, b.first, b.second, strokeWidth, strokeColor);
            }
        }
    }

    void stroke(Rect r, float s, Color color) {
        if (skiaReady()) {
            SkPaint paint;
            paint.setAntiAlias(true);
            paint.setColor(skColor(color));
            paint.setStrokeWidth(s);
            paint.setStyle(SkPaint::kStroke_Style);
            skCanvas->drawRect(SkRect::MakeXYWH(r.x + s * 0.5f, r.y + s * 0.5f, r.w - s, r.h - s), paint);
            return;
        }
        rect(r.x, r.y, r.w, s, color);
        rect(r.x, r.y + r.h - s, r.w, s, color);
        rect(r.x, r.y, s, r.h, color);
        rect(r.x + r.w - s, r.y, s, r.h, color);
    }

    void roundedStroke(Rect r, float radius, float thickness, Color color) {
        if (r.w <= 0.0f || r.h <= 0.0f || thickness <= 0.0f || color.a <= 0.0f) return;
        radius = std::max(0.0f, std::min(radius, std::min(r.w, r.h) * 0.5f));
        if (skiaReady()) {
            SkPaint paint;
            paint.setAntiAlias(true);
            paint.setColor(skColor(color));
            paint.setStrokeWidth(thickness);
            paint.setStyle(SkPaint::kStroke_Style);
            skCanvas->drawRoundRect(SkRect::MakeXYWH(r.x + thickness * 0.5f, r.y + thickness * 0.5f,
                                                     r.w - thickness, r.h - thickness),
                                    radius, radius, paint);
            return;
        }
        if (radius <= thickness) {
            stroke(r, thickness, color);
            return;
        }
        float left = r.x;
        float right = r.x + r.w;
        float top = r.y;
        float bottom = r.y + r.h;
        line(left + radius, top, right - radius, top, thickness, color);
        line(left + radius, bottom, right - radius, bottom, thickness, color);
        line(left, top + radius, left, bottom - radius, thickness, color);
        line(right, top + radius, right, bottom - radius, thickness, color);

        auto arc = [&](float cx, float cy, float start, float end) {
            float px = cx + std::cos(start) * radius;
            float py = cy + std::sin(start) * radius;
            for (int i = 1; i <= 10; ++i) {
                float a = start + (end - start) * static_cast<float>(i) / 10.0f;
                float x = cx + std::cos(a) * radius;
                float y = cy + std::sin(a) * radius;
                line(px, py, x, y, thickness, color);
                px = x;
                py = y;
            }
        };
        arc(left + radius, top + radius, 3.14159265f, 4.71238898f);
        arc(right - radius, top + radius, 4.71238898f, 6.28318531f);
        arc(right - radius, bottom - radius, 0.0f, 1.57079633f);
        arc(left + radius, bottom - radius, 1.57079633f, 3.14159265f);
    }

    void flushColor() {
        if (skSurface && skContext) {
            skContext->flushAndSubmit(skSurface.get());
        }
        if (vertices.empty()) {
            return;
        }
        applyViewport();
        glUseProgram(program);
        glBindBuffer(GL_ARRAY_BUFFER, vbo);
        glBufferData(GL_ARRAY_BUFFER, vertices.size() * sizeof(Vertex), vertices.data(), GL_DYNAMIC_DRAW);
        glEnableVertexAttribArray(posLoc);
        glVertexAttribPointer(posLoc, 2, GL_FLOAT, GL_FALSE, sizeof(Vertex), reinterpret_cast<void *>(0));
        glEnableVertexAttribArray(colorLoc);
        glVertexAttribPointer(colorLoc, 4, GL_FLOAT, GL_FALSE, sizeof(Vertex), reinterpret_cast<void *>(sizeof(float) * 2));
        glDrawArrays(GL_TRIANGLES, 0, static_cast<GLsizei>(vertices.size()));
        glDisableVertexAttribArray(posLoc);
        glDisableVertexAttribArray(colorLoc);
        vertices.clear();
        if (skContext) skContext->resetContext();
    }

    void flush() {
        flushColor();
        if (skSurface && skContext) {
            skContext->flushAndSubmit(skSurface.get());
        }
        eglSwapBuffers(display, surface);
        skCanvas = nullptr;
        skSurface.reset();
    }

    std::array<uint8_t, 7> glyph(char c) {
        switch (c) {
            case 'A': return {14, 17, 17, 31, 17, 17, 17};
            case 'B': return {30, 17, 17, 30, 17, 17, 30};
            case 'C': return {14, 17, 16, 16, 16, 17, 14};
            case 'D': return {30, 17, 17, 17, 17, 17, 30};
            case 'E': return {31, 16, 16, 30, 16, 16, 31};
            case 'F': return {31, 16, 16, 30, 16, 16, 16};
            case 'G': return {14, 17, 16, 23, 17, 17, 15};
            case 'H': return {17, 17, 17, 31, 17, 17, 17};
            case 'I': return {14, 4, 4, 4, 4, 4, 14};
            case 'J': return {7, 2, 2, 2, 18, 18, 12};
            case 'K': return {17, 18, 20, 24, 20, 18, 17};
            case 'L': return {16, 16, 16, 16, 16, 16, 31};
            case 'M': return {17, 27, 21, 21, 17, 17, 17};
            case 'N': return {17, 25, 21, 19, 17, 17, 17};
            case 'O': return {14, 17, 17, 17, 17, 17, 14};
            case 'P': return {30, 17, 17, 30, 16, 16, 16};
            case 'Q': return {14, 17, 17, 17, 21, 18, 13};
            case 'R': return {30, 17, 17, 30, 20, 18, 17};
            case 'S': return {15, 16, 16, 14, 1, 1, 30};
            case 'T': return {31, 4, 4, 4, 4, 4, 4};
            case 'U': return {17, 17, 17, 17, 17, 17, 14};
            case 'V': return {17, 17, 17, 17, 17, 10, 4};
            case 'W': return {17, 17, 17, 21, 21, 21, 10};
            case 'X': return {17, 17, 10, 4, 10, 17, 17};
            case 'Y': return {17, 17, 10, 4, 4, 4, 4};
            case 'Z': return {31, 1, 2, 4, 8, 16, 31};
            case '0': return {14, 17, 19, 21, 25, 17, 14};
            case '1': return {4, 12, 4, 4, 4, 4, 14};
            case '2': return {14, 17, 1, 2, 4, 8, 31};
            case '3': return {30, 1, 1, 14, 1, 1, 30};
            case '4': return {2, 6, 10, 18, 31, 2, 2};
            case '5': return {31, 16, 16, 30, 1, 1, 30};
            case '6': return {6, 8, 16, 30, 17, 17, 14};
            case '7': return {31, 1, 2, 4, 8, 8, 8};
            case '8': return {14, 17, 17, 14, 17, 17, 14};
            case '9': return {14, 17, 17, 15, 1, 2, 12};
            case '*': return {0, 21, 14, 31, 14, 21, 0};
            case '+': return {0, 4, 4, 31, 4, 4, 0};
            case '-': return {0, 0, 0, 31, 0, 0, 0};
            case ':': return {0, 4, 4, 0, 4, 4, 0};
            case '.': return {0, 0, 0, 0, 0, 12, 12};
            case ',': return {0, 0, 0, 0, 0, 4, 8};
            case '/': return {1, 1, 2, 4, 8, 16, 16};
            case '|': return {4, 4, 4, 4, 4, 4, 4};
            case '?': return {14, 17, 1, 2, 4, 0, 4};
            case '!': return {4, 4, 4, 4, 4, 0, 4};
            case '(': return {2, 4, 8, 8, 8, 4, 2};
            case ')': return {8, 4, 2, 2, 2, 4, 8};
            default: return {0, 0, 0, 0, 0, 0, 0};
        }
    }

    float textWidth(const std::string &text, float scale) {
        if (fontReady) {
            float heightPx = std::max(8.0f, scale * 6.2f);
            float factor = heightPx / FONT_BAKE_SIZE;
            float widthPx = 0.0f;
            for (int codepoint : utf8Codepoints(text)) {
                if (codepoint == '\n') break;
                auto glyph = supplementalGlyphs.find(codepoint);
                float advance = glyph != supplementalGlyphs.end() ? glyph->second.xadvance : baked[fontGlyphIndex(codepoint)].xadvance;
                widthPx += advance * factor;
            }
            return widthPx;
        }
        return static_cast<float>(utf8Codepoints(text).size()) * 6.0f * scale;
    }

    std::vector<int> utf8Codepoints(const std::string &text) const {
        std::vector<int> out;
        for (size_t i = 0; i < text.size();) {
            unsigned char c = static_cast<unsigned char>(text[i]);
            if (c < 0x80) {
                out.push_back(c);
                ++i;
            } else if ((c & 0xE0) == 0xC0 && i + 1 < text.size()) {
                unsigned char c1 = static_cast<unsigned char>(text[i + 1]);
                out.push_back(((c & 0x1F) << 6) | (c1 & 0x3F));
                i += 2;
            } else if ((c & 0xF0) == 0xE0 && i + 2 < text.size()) {
                unsigned char c1 = static_cast<unsigned char>(text[i + 1]);
                unsigned char c2 = static_cast<unsigned char>(text[i + 2]);
                out.push_back(((c & 0x0F) << 12) | ((c1 & 0x3F) << 6) | (c2 & 0x3F));
                i += 3;
            } else {
                out.push_back('?');
                ++i;
            }
        }
        return out;
    }

    int fontGlyphIndex(int codepoint) const {
        if (codepoint < FONT_FIRST_CHAR || codepoint >= FONT_FIRST_CHAR + FONT_CHAR_COUNT) codepoint = '?';
        return codepoint - FONT_FIRST_CHAR;
    }

    int mathIndex(int codepoint) const {
        for (int i = 0; i < MATH_GLYPH_COUNT; ++i) {
            if (mathCodepoints[static_cast<size_t>(i)] == codepoint) return i;
        }
        return -1;
    }

    float mathWidth(int codepoint, float scale) const {
        int idx = mathIndex(codepoint);
        if (!mathReady || idx < 0) return 0.0f;
        float heightPx = std::max(8.0f, scale * 6.2f);
        float factor = heightPx / FONT_BAKE_SIZE;
        return mathBaked[idx].xadvance * factor;
    }

    float mathGlyph(int codepoint, float x, float y, float scale, Color color, int align = 0) {
        int idx = mathIndex(codepoint);
        if (!mathReady || idx < 0 || color.a <= 0.0f) return 0.0f;
        flushColor();
        float heightPx = std::max(8.0f, scale * 6.2f);
        float factor = heightPx / FONT_BAKE_SIZE;
        float widthPx = mathWidth(codepoint, scale);
        if (align == 1) x -= widthPx * 0.5f;
        if (align == 2) x -= widthPx;

        float baseX = 0.0f;
        float baseY = FONT_BAKE_SIZE * 0.82f;
        stbtt_aligned_quad q{};
        stbtt_GetPackedQuad(mathBaked, FONT_ATLAS, FONT_ATLAS, idx, &baseX, &baseY, &q, 1);
        float x0 = x + q.x0 * factor;
        float x1 = x + q.x1 * factor;
        float y0 = y + q.y0 * factor;
        float y1 = y + q.y1 * factor;
        std::array<TextVertex, 6> tv = {{
                {x0 / width * 2.0f - 1.0f, 1.0f - y0 / height * 2.0f, q.s0, q.t0, color.r, color.g, color.b, color.a},
                {x1 / width * 2.0f - 1.0f, 1.0f - y0 / height * 2.0f, q.s1, q.t0, color.r, color.g, color.b, color.a},
                {x1 / width * 2.0f - 1.0f, 1.0f - y1 / height * 2.0f, q.s1, q.t1, color.r, color.g, color.b, color.a},
                {x0 / width * 2.0f - 1.0f, 1.0f - y0 / height * 2.0f, q.s0, q.t0, color.r, color.g, color.b, color.a},
                {x1 / width * 2.0f - 1.0f, 1.0f - y1 / height * 2.0f, q.s1, q.t1, color.r, color.g, color.b, color.a},
                {x0 / width * 2.0f - 1.0f, 1.0f - y1 / height * 2.0f, q.s0, q.t1, color.r, color.g, color.b, color.a}
        }};
        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        applyViewport();
        glUseProgram(textProgram);
        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, mathTexture);
        glUniform1i(textSamplerLoc, 0);
        glBindBuffer(GL_ARRAY_BUFFER, textVbo);
        glBufferData(GL_ARRAY_BUFFER, tv.size() * sizeof(TextVertex), tv.data(), GL_DYNAMIC_DRAW);
        glEnableVertexAttribArray(textPosLoc);
        glVertexAttribPointer(textPosLoc, 2, GL_FLOAT, GL_FALSE, sizeof(TextVertex), reinterpret_cast<void *>(0));
        glEnableVertexAttribArray(textUvLoc);
        glVertexAttribPointer(textUvLoc, 2, GL_FLOAT, GL_FALSE, sizeof(TextVertex), reinterpret_cast<void *>(sizeof(float) * 2));
        glEnableVertexAttribArray(textColorLoc);
        glVertexAttribPointer(textColorLoc, 4, GL_FLOAT, GL_FALSE, sizeof(TextVertex), reinterpret_cast<void *>(sizeof(float) * 4));
        glDrawArrays(GL_TRIANGLES, 0, static_cast<GLsizei>(tv.size()));
        glDisableVertexAttribArray(textPosLoc);
        glDisableVertexAttribArray(textUvLoc);
        glDisableVertexAttribArray(textColorLoc);
        if (skContext) skContext->resetContext();
        return widthPx;
    }

    void text(std::string s, float x, float y, float scale, Color color, int align = 0) {
        if (fontReady) {
            flushColor();
            float heightPx = std::max(8.0f, scale * 6.2f);
            float factor = heightPx / FONT_BAKE_SIZE;
            if (align == 1) x -= textWidth(s, scale) * 0.5f;
            if (align == 2) x -= textWidth(s, scale);

            float baseX = 0.0f;
            float baseY = FONT_BAKE_SIZE * 0.82f;
            float lineY = y;
            std::vector<TextVertex> tv;
            for (int codepoint : utf8Codepoints(s)) {
                if (codepoint == '\n') {
                    baseX = 0.0f;
                    lineY += heightPx * 1.18f;
                    continue;
                }
                stbtt_aligned_quad q{};
                auto glyph = supplementalGlyphs.find(codepoint);
                if (glyph != supplementalGlyphs.end()) {
                    stbtt_GetPackedQuad(&glyph->second, FONT_ATLAS, FONT_ATLAS, 0, &baseX, &baseY, &q, 1);
                } else {
                    stbtt_GetBakedQuad(baked, FONT_ATLAS, FONT_ATLAS, fontGlyphIndex(codepoint), &baseX, &baseY, &q, 1);
                }
                float x0 = x + q.x0 * factor;
                float x1 = x + q.x1 * factor;
                float y0 = lineY + q.y0 * factor;
                float y1 = lineY + q.y1 * factor;
                TextVertex a{x0 / width * 2.0f - 1.0f, 1.0f - y0 / height * 2.0f, q.s0, q.t0, color.r, color.g, color.b, color.a};
                TextVertex b{x1 / width * 2.0f - 1.0f, 1.0f - y0 / height * 2.0f, q.s1, q.t0, color.r, color.g, color.b, color.a};
                TextVertex c1{x1 / width * 2.0f - 1.0f, 1.0f - y1 / height * 2.0f, q.s1, q.t1, color.r, color.g, color.b, color.a};
                TextVertex d{x0 / width * 2.0f - 1.0f, 1.0f - y1 / height * 2.0f, q.s0, q.t1, color.r, color.g, color.b, color.a};
                tv.insert(tv.end(), {a, b, c1, a, c1, d});
            }
            if (!tv.empty()) {
                glEnable(GL_BLEND);
                glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
                applyViewport();
                glUseProgram(textProgram);
                glActiveTexture(GL_TEXTURE0);
                glBindTexture(GL_TEXTURE_2D, fontTexture);
                glUniform1i(textSamplerLoc, 0);
                glBindBuffer(GL_ARRAY_BUFFER, textVbo);
                glBufferData(GL_ARRAY_BUFFER, tv.size() * sizeof(TextVertex), tv.data(), GL_DYNAMIC_DRAW);
                glEnableVertexAttribArray(textPosLoc);
                glVertexAttribPointer(textPosLoc, 2, GL_FLOAT, GL_FALSE, sizeof(TextVertex), reinterpret_cast<void *>(0));
                glEnableVertexAttribArray(textUvLoc);
                glVertexAttribPointer(textUvLoc, 2, GL_FLOAT, GL_FALSE, sizeof(TextVertex), reinterpret_cast<void *>(sizeof(float) * 2));
                glEnableVertexAttribArray(textColorLoc);
                glVertexAttribPointer(textColorLoc, 4, GL_FLOAT, GL_FALSE, sizeof(TextVertex), reinterpret_cast<void *>(sizeof(float) * 4));
                glDrawArrays(GL_TRIANGLES, 0, static_cast<GLsizei>(tv.size()));
                glDisableVertexAttribArray(textPosLoc);
                glDisableVertexAttribArray(textUvLoc);
                glDisableVertexAttribArray(textColorLoc);
            }
            if (skContext) skContext->resetContext();
            return;
        }

        std::transform(s.begin(), s.end(), s.begin(), [](unsigned char c) {
            return static_cast<char>(std::toupper(c));
        });
        if (align == 1) x -= textWidth(s, scale) * 0.5f;
        if (align == 2) x -= textWidth(s, scale);
        float cursor = x;
        for (char c : s) {
            if (c == ' ') {
                cursor += 6.0f * scale;
                continue;
            }
            auto g = glyph(c);
            for (int row = 0; row < 7; ++row) {
                for (int col = 0; col < 5; ++col) {
                    if (g[row] & (1 << (4 - col))) {
                        rect(cursor + col * scale, y + row * scale, scale, scale, color);
                    }
                }
            }
            cursor += 6.0f * scale;
        }
        if (skContext) skContext->resetContext();
    }

    void textHeavy(const std::string &s, float x, float y, float scale, Color color, int align = 0, float weight = 0.75f) {
        text(s, x, y, scale, color, align);
        float offset = std::max(0.45f, scale * 0.085f) * weight;
        text(s, x - offset * 0.42f, y, scale, color, align);
        text(s, x + offset * 0.42f, y, scale, color, align);
    }
};

struct Rng {
    uint32_t seed;
    explicit Rng(const std::string &text) : seed(hash(text)) {}

    static uint32_t hash(const std::string &text) {
        uint32_t h = 1779033703u ^ static_cast<uint32_t>(text.size());
        for (unsigned char c : text) {
            h = (h ^ c) * 3432918353u;
            h = (h << 13u) | (h >> 19u);
        }
        return h;
    }

    float next() {
        seed += 0x6D2B79F5u;
        uint32_t t = seed;
        t = (t ^ (t >> 15u)) * (t | 1u);
        t ^= t + (t ^ (t >> 7u)) * (t | 61u);
        return static_cast<float>((t ^ (t >> 14u))) / 4294967296.0f;
    }
};

struct Pattern {
    std::string key;
    std::string label;
    std::string badge;
    std::vector<std::pair<int, int>> offsets;
};

Pattern patternFor(const std::string &key) {
    if (key == "diagonal") return {"diagonal", "Diagonal", "D", {{0, 0}, {-1, -1}, {1, -1}, {-1, 1}, {1, 1}}};
    if (key == "square") return {"square", "Square", "S", {{-1, -1}, {0, -1}, {1, -1}, {-1, 0}, {0, 0}, {1, 0}, {-1, 1}, {0, 1}, {1, 1}}};
    if (key == "horizontal") return {"horizontal", "Horizontal line", "H", {{-1, 0}, {0, 0}, {1, 0}}};
    if (key == "vertical") return {"vertical", "Vertical line", "V", {{0, -1}, {0, 0}, {0, 1}}};
    if (key == "self") return {"self", "Self only", "1", {{0, 0}}};
    if (key == "knight") return {"knight", "Knight", "K", {{0, 0}, {1, 2}, {2, 1}, {2, -1}, {1, -2}, {-1, -2}, {-2, -1}, {-2, 1}, {-1, 2}}};
    return {"cross", "Cross", "+", {{0, 0}, {0, -1}, {1, 0}, {0, 1}, {-1, 0}}};
}

std::string patternLabel(const std::string &key) {
    return key == "randomMixed" ? "Random mixed" : patternFor(key).label;
}

struct Puzzle {
    int width = 5;
    int height = 5;
    int states = 3;
    std::string defaultPattern = "cross";
    std::set<int> locked;
    std::set<int> disabled;
    std::map<int, std::string> tilePatterns;
    std::string levelId;
    std::string name;
    int campaignIndex = -1;
    int chapter = -1;
    std::vector<int> initial;
    std::map<int, int> solution;
    int minimumMoves = 1;
    int targetMoves = 3;
    int difficultyRating = 0;
    int scrambleMoves = 0;
};

struct Config {
    int width = 5;
    int height = 5;
    int states = 3;
    std::string pattern = "cross";
    std::string difficulty = "Medium";
    bool locked = false;
    bool irregular = false;
    bool unique = true;
    std::string seed = "seed";
    std::string name = "Custom Level";
    int minimumKnownMoves = 2;
    int preferredKnownMoves = 3;
};

struct PlaygroundConfig {
    int width = 5;
    int height = 5;
    int states = 3;
    std::string pattern = "cross";
    std::vector<int> board;
    std::set<int> locked;
    std::set<int> disabled;
};

const std::string PLAYGROUND_SEED_PREFIX = "ITM1";
const std::string PLAYGROUND_COMPACT_PREFIX = "ITM2";
const std::string PLAYGROUND_LEGACY_COMPACT_PREFIX = "P";
const std::string PLAYGROUND_COMPACT_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
constexpr int PLAYGROUND_COMPACT_VERSION = 1;
constexpr int PLAYGROUND_COMPACT_MAX_CODE_LENGTH = 96;
const std::vector<std::string> PLAYGROUND_PATTERNS = {"cross", "diagonal", "square", "horizontal", "vertical", "self", "knight"};
const std::vector<int> PLAYGROUND_STATE_OPTIONS = {2, 3, 4, 5};
constexpr int PLAYGROUND_TOOL_TAP = 0;
constexpr int PLAYGROUND_TOOL_PAINT_BASE = 1;
constexpr int PLAYGROUND_TOOL_LOCK = 6;
constexpr int PLAYGROUND_TOOL_HOLE = 7;

int indexFor(int x, int y, int w) { return y * w + x; }
int xFor(int i, int w) { return i % w; }
int yFor(int i, int w) { return i / w; }

std::vector<std::string> splitKeepingEmpty(const std::string &text, char delimiter) {
    std::vector<std::string> parts;
    std::string current;
    for (char ch : text) {
        if (ch == delimiter) {
            parts.push_back(current);
            current.clear();
        } else {
            current.push_back(ch);
        }
    }
    parts.push_back(current);
    return parts;
}

std::string trimText(const std::string &text) {
    size_t start = 0;
    while (start < text.size() && std::isspace(static_cast<unsigned char>(text[start]))) ++start;
    size_t end = text.size();
    while (end > start && std::isspace(static_cast<unsigned char>(text[end - 1]))) --end;
    return text.substr(start, end - start);
}

bool playgroundPatternAllowed(const std::string &pattern) {
    return std::find(PLAYGROUND_PATTERNS.begin(), PLAYGROUND_PATTERNS.end(), pattern) != PLAYGROUND_PATTERNS.end();
}

bool playgroundStatesAllowed(int states) {
    return std::find(PLAYGROUND_STATE_OPTIONS.begin(), PLAYGROUND_STATE_OPTIONS.end(), states) != PLAYGROUND_STATE_OPTIONS.end();
}

int playgroundPaintTool(int state) {
    return PLAYGROUND_TOOL_PAINT_BASE + state;
}

int playgroundPaintStateForTool(int tool) {
    int state = tool - PLAYGROUND_TOOL_PAINT_BASE;
    return state >= 0 && state <= 4 ? state : -1;
}

bool playgroundToolAllowed(int tool, int states) {
    if (tool == PLAYGROUND_TOOL_TAP || tool == PLAYGROUND_TOOL_LOCK || tool == PLAYGROUND_TOOL_HOLE) return true;
    int paintState = playgroundPaintStateForTool(tool);
    return paintState >= 0 && paintState < states;
}

int playgroundStateOptionIndex(int states) {
    for (int i = 0; i < static_cast<int>(PLAYGROUND_STATE_OPTIONS.size()); ++i) {
        if (PLAYGROUND_STATE_OPTIONS[static_cast<size_t>(i)] == states) return i;
    }
    return -1;
}

int playgroundPatternIndex(const std::string &pattern) {
    for (int i = 0; i < static_cast<int>(PLAYGROUND_PATTERNS.size()); ++i) {
        if (PLAYGROUND_PATTERNS[static_cast<size_t>(i)] == pattern) return i;
    }
    return -1;
}

int compactBitsForStates(int states) {
    int bits = 1;
    int capacity = 2;
    while (capacity < states) {
        bits += 1;
        capacity *= 2;
    }
    return bits;
}

void writeCompactBits(std::vector<int> *bits, int value, int count) {
    if (!bits) return;
    for (int shift = count - 1; shift >= 0; --shift) {
        bits->push_back((value >> shift) & 1);
    }
}

int compactAlphabetIndex(char ch) {
    size_t found = PLAYGROUND_COMPACT_ALPHABET.find(ch);
    return found == std::string::npos ? -1 : static_cast<int>(found);
}

int compactCodeChecksum(const std::string &body) {
    int hash = 913;
    for (unsigned char ch : body) {
        hash = ((hash * 33) ^ static_cast<int>(ch)) & 1023;
    }
    return hash;
}

std::string compactChecksumText(const std::string &body) {
    int checksum = compactCodeChecksum(body);
    std::string out;
    out.push_back(PLAYGROUND_COMPACT_ALPHABET[static_cast<size_t>(checksum / 32)]);
    out.push_back(PLAYGROUND_COMPACT_ALPHABET[static_cast<size_t>(checksum % 32)]);
    return out;
}

struct CompactBitReader {
    const std::vector<int> &bits;
    size_t position = 0;
    bool failed = false;

    explicit CompactBitReader(const std::vector<int> &input) : bits(input) {}

    int read(int count) {
        if (position + static_cast<size_t>(count) > bits.size()) {
            failed = true;
            return 0;
        }
        int value = 0;
        for (int i = 0; i < count; ++i) {
            value = (value << 1) | bits[position + static_cast<size_t>(i)];
        }
        position += static_cast<size_t>(count);
        return value;
    }
};

bool parseBase36(const std::string &text, int *out) {
    if (text.empty()) return false;
    int value = 0;
    for (char ch : text) {
        int digit = -1;
        if (ch >= '0' && ch <= '9') digit = ch - '0';
        else if (ch >= 'a' && ch <= 'z') digit = ch - 'a' + 10;
        else if (ch >= 'A' && ch <= 'Z') digit = ch - 'A' + 10;
        else return false;
        value = value * 36 + digit;
    }
    if (out) *out = value;
    return true;
}

bool decodePlaygroundIndexList(const std::string &text, int total, std::set<int> *out) {
    if (!out) return false;
    out->clear();
    if (text.empty()) return true;
    std::vector<std::string> parts = splitKeepingEmpty(text, '.');
    for (const std::string &part : parts) {
        if (part.empty()) continue;
        int idx = -1;
        if (!parseBase36(part, &idx) || idx < 0 || idx >= total) return false;
        out->insert(idx);
    }
    return true;
}

void normalizePlaygroundConfig(PlaygroundConfig *config) {
    if (!config) return;
    config->width = clampInt(config->width, 3, 9);
    config->height = clampInt(config->height, 3, 9);
    if (!playgroundStatesAllowed(config->states)) config->states = 3;
    if (!playgroundPatternAllowed(config->pattern)) config->pattern = "cross";
    int total = config->width * config->height;
    config->board.resize(static_cast<size_t>(total), 0);
    for (int &value : config->board) value = mod(value, config->states);
    for (auto it = config->disabled.begin(); it != config->disabled.end();) {
        if (*it < 0 || *it >= total) it = config->disabled.erase(it);
        else ++it;
    }
    if (static_cast<int>(config->disabled.size()) >= total) {
        auto it = config->disabled.end();
        if (it != config->disabled.begin()) {
            --it;
            config->disabled.erase(it);
        }
    }
    for (auto it = config->locked.begin(); it != config->locked.end();) {
        if (*it < 0 || *it >= total || config->disabled.count(*it)) it = config->locked.erase(it);
        else ++it;
    }
    for (int idx : config->disabled) config->board[static_cast<size_t>(idx)] = 0;
}

std::string encodePlaygroundCompactSeed(PlaygroundConfig config) {
    normalizePlaygroundConfig(&config);
    int total = config.width * config.height;
    int stateBits = compactBitsForStates(config.states);
    std::vector<int> bits;
    writeCompactBits(&bits, PLAYGROUND_COMPACT_VERSION, 4);
    writeCompactBits(&bits, config.width - 3, 3);
    writeCompactBits(&bits, config.height - 3, 3);
    writeCompactBits(&bits, playgroundStateOptionIndex(config.states), 2);
    writeCompactBits(&bits, playgroundPatternIndex(config.pattern), 3);
    for (int idx = 0; idx < total; ++idx) {
        bool disabled = config.disabled.count(idx) > 0;
        writeCompactBits(&bits, disabled ? 1 : 0, 1);
        if (!disabled) {
            writeCompactBits(&bits, config.locked.count(idx) ? 1 : 0, 1);
            writeCompactBits(&bits, mod(config.board[static_cast<size_t>(idx)], config.states), stateBits);
        }
    }
    std::string body;
    for (size_t bit = 0; bit < bits.size(); bit += 5) {
        int value = 0;
        for (size_t offset = 0; offset < 5; ++offset) {
            value = (value << 1) | (bit + offset < bits.size() ? bits[bit + offset] : 0);
        }
        body.push_back(PLAYGROUND_COMPACT_ALPHABET[static_cast<size_t>(value)]);
    }
    return PLAYGROUND_COMPACT_PREFIX + body + compactChecksumText(body);
}

std::string encodePlaygroundSeed(PlaygroundConfig config) {
    return encodePlaygroundCompactSeed(config);
}

bool decodePlaygroundCompactCode(const std::string &code, const std::string &prefix, PlaygroundConfig *out) {
    if (code.size() < prefix.size() + 3 || code.substr(0, prefix.size()) != prefix) return false;
    std::string body = code.substr(prefix.size(), code.size() - prefix.size() - 2);
    std::string checksum = code.substr(code.size() - 2);
    if (body.empty() || checksum.size() != 2 || compactChecksumText(body) != checksum) return false;
    if (compactAlphabetIndex(checksum[0]) < 0 || compactAlphabetIndex(checksum[1]) < 0) return false;
    std::vector<int> bits;
    for (char ch : body) {
        int value = compactAlphabetIndex(ch);
        if (value < 0) return false;
        writeCompactBits(&bits, value, 5);
    }

    CompactBitReader reader(bits);
    int version = reader.read(4);
    int width = reader.read(3) + 3;
    int height = reader.read(3) + 3;
    int stateIndex = reader.read(2);
    int patternIndex = reader.read(3);
    if (reader.failed || version != PLAYGROUND_COMPACT_VERSION) return false;
    if (stateIndex < 0 || stateIndex >= static_cast<int>(PLAYGROUND_STATE_OPTIONS.size())) return false;
    if (patternIndex < 0 || patternIndex >= static_cast<int>(PLAYGROUND_PATTERNS.size())) return false;

    PlaygroundConfig config;
    config.width = width;
    config.height = height;
    config.states = PLAYGROUND_STATE_OPTIONS[static_cast<size_t>(stateIndex)];
    config.pattern = PLAYGROUND_PATTERNS[static_cast<size_t>(patternIndex)];
    int total = width * height;
    int stateBits = compactBitsForStates(config.states);
    config.board.reserve(static_cast<size_t>(total));
    for (int idx = 0; idx < total; ++idx) {
        bool disabled = reader.read(1) == 1;
        if (disabled) {
            config.disabled.insert(idx);
            config.board.push_back(0);
        } else {
            bool locked = reader.read(1) == 1;
            int state = reader.read(stateBits);
            if (state >= config.states) return false;
            config.board.push_back(state);
            if (locked) config.locked.insert(idx);
        }
    }
    if (reader.failed || static_cast<int>(config.disabled.size()) >= total) return false;
    if ((reader.position + 4) / 5 != body.size()) return false;
    for (; reader.position < bits.size(); ++reader.position) {
        if (bits[reader.position]) return false;
    }
    normalizePlaygroundConfig(&config);
    if (out) *out = config;
    return true;
}

bool decodePlaygroundCompactSeed(const std::string &seed, PlaygroundConfig *out) {
    std::string code;
    for (char raw : seed) {
        unsigned char ch = static_cast<unsigned char>(raw);
        if (std::isalnum(ch)) code.push_back(static_cast<char>(std::toupper(ch)));
    }
    const std::vector<std::string> prefixes = {PLAYGROUND_COMPACT_PREFIX, PLAYGROUND_LEGACY_COMPACT_PREFIX};
    for (const std::string &prefix : prefixes) {
        if (code.size() < prefix.size() + 3) continue;
        for (size_t start = 0; start + prefix.size() + 3 <= code.size(); ++start) {
            if (code.compare(start, prefix.size(), prefix) != 0) continue;
            size_t maxEnd = std::min(code.size(), start + static_cast<size_t>(PLAYGROUND_COMPACT_MAX_CODE_LENGTH));
            for (size_t end = start + prefix.size() + 3; end <= maxEnd; ++end) {
                PlaygroundConfig config;
                if (decodePlaygroundCompactCode(code.substr(start, end - start), prefix, &config)) {
                    if (out) *out = config;
                    return true;
                }
            }
        }
    }
    return false;
}

bool decodePlaygroundLegacySeed(const std::string &seed, PlaygroundConfig *out) {
    std::string text = trimText(seed);
    size_t start = text.find(PLAYGROUND_SEED_PREFIX + ":");
    if (start != std::string::npos) {
        text = text.substr(start);
        size_t end = text.find_first_of(" \t\r\n");
        if (end != std::string::npos) text = text.substr(0, end);
    }
    std::vector<std::string> parts = splitKeepingEmpty(text, ':');
    if (parts.size() < 7 || parts[0] != PLAYGROUND_SEED_PREFIX) return false;
    std::vector<std::string> dims = splitKeepingEmpty(parts[1], 'x');
    if (dims.size() != 2) return false;
    int width = std::atoi(dims[0].c_str());
    int height = std::atoi(dims[1].c_str());
    if (width < 3 || width > 9 || height < 3 || height > 9) return false;
    int states = std::atoi(parts[2].c_str());
    if (!playgroundStatesAllowed(states) || !playgroundPatternAllowed(parts[3])) return false;
    int total = width * height;
    if (static_cast<int>(parts[4].size()) != total) return false;
    PlaygroundConfig config;
    config.width = width;
    config.height = height;
    config.states = states;
    config.pattern = parts[3];
    config.board.assign(static_cast<size_t>(total), 0);
    for (int i = 0; i < total; ++i) {
        char ch = parts[4][static_cast<size_t>(i)];
        if (ch < '0' || ch > '4') return false;
        config.board[static_cast<size_t>(i)] = mod(ch - '0', states);
    }
    if (!decodePlaygroundIndexList(parts[5], total, &config.locked)) return false;
    if (!decodePlaygroundIndexList(parts[6], total, &config.disabled)) return false;
    if (static_cast<int>(config.disabled.size()) >= total) return false;
    normalizePlaygroundConfig(&config);
    if (out) *out = config;
    return true;
}

bool decodePlaygroundSeed(const std::string &seed, PlaygroundConfig *out) {
    return decodePlaygroundCompactSeed(seed, out) || decodePlaygroundLegacySeed(seed, out);
}

std::vector<int> activeIndexes(const Puzzle &p) {
    std::vector<int> out;
    for (int i = 0; i < p.width * p.height; ++i) {
        if (!p.disabled.count(i)) out.push_back(i);
    }
    return out;
}

std::vector<int> tappableIndexes(const Puzzle &p) {
    std::vector<int> out;
    for (int i : activeIndexes(p)) {
        if (!p.locked.count(i)) out.push_back(i);
    }
    return out;
}

bool isTappable(const Puzzle &p, int i) {
    return i >= 0 && i < p.width * p.height && !p.disabled.count(i) && !p.locked.count(i);
}

std::vector<int> affectedIndexes(const Puzzle &p, int tap) {
    std::vector<int> out;
    if (tap < 0 || p.disabled.count(tap)) return out;
    int tx = xFor(tap, p.width);
    int ty = yFor(tap, p.width);
    auto it = p.tilePatterns.find(tap);
    Pattern pattern = patternFor(it == p.tilePatterns.end() ? p.defaultPattern : it->second);
    for (auto offset : pattern.offsets) {
        int x = tx + offset.first;
        int y = ty + offset.second;
        if (x < 0 || y < 0 || x >= p.width || y >= p.height) continue;
        int idx = indexFor(x, y, p.width);
        if (!p.disabled.count(idx)) out.push_back(idx);
    }
    return out;
}

void applyPulse(const Puzzle &p, std::vector<int> &board, int tap) {
    for (int i : affectedIndexes(p, tap)) board[i] = mod(board[i] + 1, p.states);
}

bool solved(const Puzzle &p, const std::vector<int> &board) {
    for (int i : activeIndexes(p)) {
        if (board[i] != 0) return false;
    }
    return true;
}

int sumCounts(const std::map<int, int> &counts) {
    int sum = 0;
    for (auto &entry : counts) sum += entry.second;
    return sum;
}

std::map<int, int> normalized(const std::map<int, int> &counts, int states) {
    std::map<int, int> out;
    for (auto &entry : counts) {
        int v = mod(entry.second, states);
        if (v) out[entry.first] = v;
    }
    return out;
}

bool solutionSolves(const Puzzle &p, const std::vector<int> &board, const std::map<int, int> &counts) {
    std::vector<int> test = board;
    for (auto &entry : counts) {
        for (int i = 0; i < mod(entry.second, p.states); ++i) applyPulse(p, test, entry.first);
    }
    return solved(p, test);
}

int randomInt(int minValue, int maxValue, Rng &rng) {
    return static_cast<int>(std::floor(rng.next() * (maxValue - minValue + 1))) + minValue;
}

template<typename T>
void shuffle(std::vector<T> &items, Rng &rng) {
    for (int i = static_cast<int>(items.size()) - 1; i > 0; --i) {
        int j = static_cast<int>(std::floor(rng.next() * (i + 1)));
        std::swap(items[i], items[j]);
    }
}

float difficultyRatio(const std::string &difficulty) {
    if (difficulty == "Easy") return 0.45f;
    if (difficulty == "Hard") return 0.9f;
    if (difficulty == "Expert") return 1.0f;
    return 0.7f;
}

int rateDifficulty(const Puzzle &p, int minMoves) {
    std::set<std::string> specials;
    for (auto &entry : p.tilePatterns) specials.insert(entry.second);
    float stateWeight = p.states <= 2 ? 0.0f : p.states == 3 ? 12.0f : p.states == 4 ? 16.0f : 21.0f;
    float score = activeIndexes(p).size() * 0.34f + stateWeight + p.locked.size() * 1.4f +
                  p.disabled.size() * 1.2f + specials.size() * 2.2f + minMoves * 1.15f;
    if (score < 17) return 0;
    if (score < 30) return 1;
    if (score < 45) return 2;
    return 3;
}

struct SolveResult {
    bool exists = false;
    bool exactMinimum = false;
    bool unique = false;
    int moveCount = 0;
    int rank = 0;
    std::map<int, int> tapCounts;
    std::vector<int> vector;
};

int sumVectorValues(const std::vector<int> &items) {
    int sum = 0;
    for (int value : items) sum += value;
    return sum;
}

std::map<int, int> countsFromVector(const std::vector<int> &tappable, const std::vector<int> &vector) {
    std::map<int, int> out;
    for (size_t i = 0; i < tappable.size() && i < vector.size(); ++i) {
        if (vector[i]) out[tappable[i]] = vector[i];
    }
    return out;
}

int modularInverse(int value, int modulus) {
    int normalizedValue = mod(value, modulus);
    for (int i = 1; i < modulus; ++i) {
        if (mod(normalizedValue * i, modulus) == 1) return i;
    }
    return 1;
}

bool primeStates(int states) {
    return states == 2 || states == 3 || states == 5;
}

int boardStateSpace(const Puzzle &p, int limit) {
    int64_t total = 1;
    for (int i : activeIndexes(p)) {
        (void) i;
        total *= p.states;
        if (total > limit) return 0;
    }
    return static_cast<int>(total);
}

std::string encodeBoard(const std::vector<int> &board, const std::vector<int> &active) {
    std::string encoded;
    encoded.reserve(active.size());
    for (int idx : active) encoded.push_back(static_cast<char>('0' + board[idx]));
    return encoded;
}

SolveResult solveByBreadthFirstSearch(const Puzzle &p, const std::vector<int> &board, int maxVisited) {
    SolveResult result;
    std::vector<int> active = activeIndexes(p);
    std::vector<int> tappable = tappableIndexes(p);
    std::string start = encodeBoard(board, active);
    std::string goal(active.size(), '0');
    if (start == goal) {
        result.exists = true;
        result.exactMinimum = true;
        result.unique = true;
        return result;
    }

    struct Node {
        std::vector<int> board;
        std::map<int, int> counts;
    };

    std::vector<Node> queue;
    queue.reserve(std::min(maxVisited, 65536));
    queue.push_back({board, {}});
    std::unordered_set<std::string> seen;
    seen.reserve(std::min(maxVisited, 65536));
    seen.insert(start);

    for (size_t head = 0; head < queue.size() && static_cast<int>(seen.size()) < maxVisited; ++head) {
        const Node item = queue[head];
        for (int tap : tappable) {
            std::vector<int> nextBoard = item.board;
            applyPulse(p, nextBoard, tap);
            std::string encoded = encodeBoard(nextBoard, active);
            if (seen.count(encoded)) continue;

            std::map<int, int> nextCounts = item.counts;
            nextCounts[tap] += 1;
            if (encoded == goal) {
                result.exists = true;
                result.exactMinimum = true;
                result.tapCounts = nextCounts;
                result.moveCount = sumCounts(nextCounts);
                return result;
            }

            seen.insert(encoded);
            queue.push_back({nextBoard, nextCounts});
        }
    }

    result.exactMinimum = static_cast<int>(seen.size()) >= maxVisited;
    return result;
}

SolveResult solveByGaussianElimination(const Puzzle &p, const std::vector<int> &board) {
    SolveResult result;
    int k = p.states;
    std::vector<int> active = activeIndexes(p);
    std::vector<int> tappable = tappableIndexes(p);
    std::map<int, int> rowForIndex;
    for (size_t row = 0; row < active.size(); ++row) rowForIndex[active[row]] = static_cast<int>(row);

    std::vector<std::vector<int>> matrix(active.size(), std::vector<int>(tappable.size() + 1, 0));
    for (size_t row = 0; row < active.size(); ++row) {
        matrix[row][tappable.size()] = mod(-board[active[row]], k);
    }

    for (size_t col = 0; col < tappable.size(); ++col) {
        for (int affected : affectedIndexes(p, tappable[col])) {
            auto rowIt = rowForIndex.find(affected);
            if (rowIt != rowForIndex.end()) {
                matrix[rowIt->second][col] = mod(matrix[rowIt->second][col] + 1, k);
            }
        }
    }

    std::vector<int> pivotColumns;
    int pivotRow = 0;

    for (size_t col = 0; col < tappable.size() && pivotRow < static_cast<int>(active.size()); ++col) {
        int found = -1;
        for (int searchRow = pivotRow; searchRow < static_cast<int>(active.size()); ++searchRow) {
            if (mod(matrix[searchRow][col], k) != 0) {
                found = searchRow;
                break;
            }
        }
        if (found == -1) continue;

        std::swap(matrix[pivotRow], matrix[found]);
        int inv = modularInverse(matrix[pivotRow][col], k);
        for (size_t normalizeCol = col; normalizeCol <= tappable.size(); ++normalizeCol) {
            matrix[pivotRow][normalizeCol] = mod(matrix[pivotRow][normalizeCol] * inv, k);
        }

        for (int eliminateRow = 0; eliminateRow < static_cast<int>(active.size()); ++eliminateRow) {
            if (eliminateRow == pivotRow) continue;
            int factor = matrix[eliminateRow][col];
            if (factor == 0) continue;
            for (size_t eliminateCol = col; eliminateCol <= tappable.size(); ++eliminateCol) {
                matrix[eliminateRow][eliminateCol] = mod(matrix[eliminateRow][eliminateCol] - factor * matrix[pivotRow][eliminateCol], k);
            }
        }

        pivotColumns.push_back(static_cast<int>(col));
        ++pivotRow;
    }

    for (int row = pivotRow; row < static_cast<int>(active.size()); ++row) {
        bool allZero = true;
        for (size_t col = 0; col < tappable.size(); ++col) {
            if (matrix[row][col] != 0) {
                allZero = false;
                break;
            }
        }
        if (allZero && matrix[row][tappable.size()] != 0) return result;
    }

    std::vector<int> vector(tappable.size(), 0);
    for (size_t pivot = 0; pivot < pivotColumns.size(); ++pivot) {
        vector[pivotColumns[pivot]] = matrix[pivot][tappable.size()];
    }

    std::vector<int> freeColumns;
    for (size_t freeCol = 0; freeCol < tappable.size(); ++freeCol) {
        if (std::find(pivotColumns.begin(), pivotColumns.end(), static_cast<int>(freeCol)) == pivotColumns.end()) {
            freeColumns.push_back(static_cast<int>(freeCol));
        }
    }

    bool exactMinimum = freeColumns.empty();
    if (!freeColumns.empty()) {
        int64_t combinations = 1;
        for (size_t i = 0; i < freeColumns.size(); ++i) {
            combinations *= k;
            if (combinations > EXACT_NULLSPACE_LIMIT) break;
        }
        if (combinations <= EXACT_NULLSPACE_LIMIT) {
            exactMinimum = true;
            std::vector<std::vector<int>> basis;
            basis.reserve(freeColumns.size());
            for (int freeCol : freeColumns) {
                std::vector<int> basisVector(tappable.size(), 0);
                basisVector[freeCol] = 1;
                for (size_t row = 0; row < pivotColumns.size(); ++row) {
                    basisVector[pivotColumns[row]] = mod(-matrix[row][freeCol], k);
                }
                basis.push_back(basisVector);
            }

            std::vector<int> bestVector = vector;
            int bestMoves = sumVectorValues(bestVector);
            for (int64_t combo = 1; combo < combinations; ++combo) {
                int64_t cursor = combo;
                std::vector<int> candidate = vector;
                for (size_t basisIndex = 0; basisIndex < basis.size(); ++basisIndex) {
                    int coefficient = static_cast<int>(cursor % k);
                    cursor /= k;
                    if (!coefficient) continue;
                    for (size_t col = 0; col < candidate.size(); ++col) {
                        candidate[col] = mod(candidate[col] + coefficient * basis[basisIndex][col], k);
                    }
                }
                int moves = sumVectorValues(candidate);
                if (moves < bestMoves) {
                    bestMoves = moves;
                    bestVector = candidate;
                }
            }
            vector = bestVector;
        }
    }

    result.exists = true;
    result.vector = vector;
    result.tapCounts = countsFromVector(tappable, vector);
    result.moveCount = sumVectorValues(vector);
    result.rank = pivotRow;
    result.unique = pivotRow == static_cast<int>(tappable.size());
    result.exactMinimum = exactMinimum;
    return result;
}

SolveResult solvePuzzle(const Puzzle &p, const std::vector<int> &board) {
    int exactStateSpace = boardStateSpace(p, EXACT_BFS_STATE_LIMIT);
    if (exactStateSpace > 0) return solveByBreadthFirstSearch(p, board, exactStateSpace);
    if (!primeStates(p.states)) return {};
    return solveByGaussianElimination(p, board);
}

SolveResult exactSolverPlan(const Puzzle &p, const std::vector<int> &board, const std::map<int, int> &fallbackCounts) {
    SolveResult solvedPlan = solvePuzzle(p, board);
    if (solvedPlan.exists && solvedPlan.exactMinimum) return solvedPlan;

    SolveResult fallback;
    fallback.exists = solutionSolves(p, board, fallbackCounts);
    fallback.tapCounts = normalized(fallbackCounts, p.states);
    fallback.moveCount = sumCounts(fallback.tapCounts);
    return fallback;
}

Puzzle generatedShell(const Config &config, Rng &rng) {
    Puzzle p;
    p.width = config.width;
    p.height = config.height;
    p.states = config.states;
    p.defaultPattern = config.pattern == "randomMixed" ? "cross" : config.pattern;
    int total = p.width * p.height;

    if (config.irregular) {
        int maxHoles = std::max(1, static_cast<int>(std::floor(total * difficultyRatio(config.difficulty) * 0.16f)));
        int holes = randomInt(1, maxHoles, rng);
        std::vector<int> candidates;
        for (int i = 0; i < total; ++i) {
            if (!(xFor(i, p.width) == p.width / 2 && yFor(i, p.width) == p.height / 2)) candidates.push_back(i);
        }
        shuffle(candidates, rng);
        for (int i = 0; i < std::min(holes, total - 6); ++i) p.disabled.insert(candidates[i]);
    }

    std::vector<int> active = activeIndexes(p);
    if (config.locked) {
        int maxLocked = std::max(1, static_cast<int>(std::floor(active.size() * difficultyRatio(config.difficulty) * 0.18f)));
        int count = randomInt(1, maxLocked, rng);
        shuffle(active, rng);
        for (int i = 0; i < std::min(count, static_cast<int>(active.size()) - 3); ++i) p.locked.insert(active[i]);
    }

    if (config.pattern == "randomMixed") {
        std::vector<std::string> keys = {"cross", "diagonal", "horizontal", "vertical", "square", "knight"};
        std::vector<int> candidates;
        for (int i : activeIndexes(p)) if (!p.locked.count(i)) candidates.push_back(i);
        shuffle(candidates, rng);
        int count = std::max(2, static_cast<int>(std::floor(candidates.size() * difficultyRatio(config.difficulty) * 0.35f)));
        for (int i = 0; i < std::min(count, static_cast<int>(candidates.size())); ++i) {
            p.tilePatterns[candidates[i]] = keys[randomInt(0, static_cast<int>(keys.size()) - 1, rng)];
        }
    }

    p.initial.assign(total, 0);
    return p;
}

int scrambleCount(const std::string &difficulty, int activeCount, int states, Rng &rng) {
    float base = 0.58f;
    if (difficulty == "Easy") base = 0.32f;
    if (difficulty == "Hard") base = 0.88f;
    if (difficulty == "Expert") base = 1.18f;
    base = std::max(0.22f, base - static_cast<float>(std::max(0, states - 2)) * 0.06f);
    int jitter = randomInt(0, std::max(2, static_cast<int>(std::floor(activeCount * 0.18f))), rng);
    return std::max(2, static_cast<int>(std::floor(activeCount * base)) + (states == 2 ? 1 : 0) + jitter);
}

Puzzle makePuzzleFromShell(Puzzle p, const Config &config, const std::string &id, const std::string &name, int campaignIndex, int chapter, Rng &rng, int scrambleLength) {
    std::vector<int> taps = tappableIndexes(p);
    std::map<int, int> solution;
    int previous = -1;
    for (int move = 0; move < scrambleLength && !taps.empty(); ++move) {
        int tap = taps[randomInt(0, static_cast<int>(taps.size()) - 1, rng)];
        int guard = 0;
        while (tap == previous && taps.size() > 1 && guard < 8) {
            tap = taps[randomInt(0, static_cast<int>(taps.size()) - 1, rng)];
            ++guard;
        }
        previous = tap;
        applyPulse(p, p.initial, tap);
        solution[tap] = mod(solution[tap] - 1, p.states);
    }
    p.solution = normalized(solution, p.states);
    p.scrambleMoves = std::max(1, sumCounts(p.solution));
    p.levelId = id;
    p.name = name;
    p.campaignIndex = campaignIndex;
    p.chapter = chapter;
    if (solved(p, p.initial) || !solutionSolves(p, p.initial, p.solution)) {
        if (!taps.empty()) {
            applyPulse(p, p.initial, taps[0]);
            p.solution[taps[0]] = mod(p.solution[taps[0]] + p.states - 1, p.states);
            p.solution = normalized(p.solution, p.states);
            p.scrambleMoves = std::max(1, sumCounts(p.solution));
        }
    }
    // Android 1.0.4: display and hint from the shortest provable plan, not merely the scramble length.
    SolveResult solverPlan = exactSolverPlan(p, p.initial, p.solution);
    p.solution = normalized(solverPlan.tapCounts, p.states);
    int known = std::max(1, solverPlan.moveCount);
    p.minimumMoves = known;
    p.targetMoves = known + std::max(2, static_cast<int>(std::ceil(activeIndexes(p).size() * 0.16f)));
    p.difficultyRating = rateDifficulty(p, known);
    return p;
}

std::array<std::string, 30> chapterTitles = {
        "Binary Beginnings", "Fourfold Flips", "Lights With Lock Icons", "Lockstep Squares", "First Empty Holes",
        "Binary Breakaways", "Fivefold Binary", "Three-Color Start", "Triple Grid", "Three Lock-Icon Tiles",
        "Three Empty Holes", "Triple Combine", "Pattern Primer", "Patterns With Lock Icons", "Color Gauntlet",
        "Four-State Start", "Four-State Lock-Icon Tiles", "Four-State Empty Holes", "Four-State Patterns", "Four-State Matrix",
        "Five-State Start", "Five-State Lock-Icon Tiles", "Five-State Empty Holes", "Five-State Patterns", "Dense Dimensions",
        "Prime Pressure", "Modular Maze", "Wide Matrix", "Endgame Circuit", "Final Inversion"
};

constexpr int CAMPAIGN_MAP_SIZE = 5;
constexpr int CAMPAIGN_GROUP_COUNT = CAMPAIGN_MAP_SIZE * CAMPAIGN_MAP_SIZE;
constexpr int CAMPAIGN_LEVELS_PER_GROUP = 9;
constexpr int CAMPAIGN_LEVEL_COUNT = CAMPAIGN_GROUP_COUNT * CAMPAIGN_LEVELS_PER_GROUP;
constexpr int CAMPAIGN_GROUP_STAR_TARGET = 15;
constexpr int CAMPAIGN_GROUP_STAR_MAX = CAMPAIGN_LEVELS_PER_GROUP * 3;

int campaignGroupForLevel(int campaignIndex) {
    return clampInt(campaignIndex, 0, CAMPAIGN_LEVEL_COUNT - 1) / CAMPAIGN_LEVELS_PER_GROUP;
}

int campaignLevelNumberInGroup(int campaignIndex) {
    return clampInt(campaignIndex, 0, CAMPAIGN_LEVEL_COUNT - 1) % CAMPAIGN_LEVELS_PER_GROUP + 1;
}

std::string campaignLevelIdFor(int group, int levelInGroup) {
    return "c" + std::to_string(group + 1) + "-" + std::to_string(levelInGroup + 1);
}

std::vector<int> campaignAdjacentGroups(int group) {
    int x = group % CAMPAIGN_MAP_SIZE;
    int y = group / CAMPAIGN_MAP_SIZE;
    std::vector<int> out;
    if (x > 0) out.push_back(group - 1);
    if (x < CAMPAIGN_MAP_SIZE - 1) out.push_back(group + 1);
    if (y > 0) out.push_back(group - CAMPAIGN_MAP_SIZE);
    if (y < CAMPAIGN_MAP_SIZE - 1) out.push_back(group + CAMPAIGN_MAP_SIZE);
    return out;
}

std::string dailyTierKey(int tier);
std::string dailyTierLabel(int tier);

Puzzle generatePuzzle(Config c) {
    for (int attempt = 0; attempt < 12; ++attempt) {
        Rng rng(c.seed + "-" + std::to_string(attempt));
        Puzzle shell = generatedShell(c, rng);
        int scramble = scrambleCount(c.difficulty, static_cast<int>(activeIndexes(shell).size()), c.states, rng);
        Puzzle p = makePuzzleFromShell(shell, c, "generated-" + c.seed, c.name, -1, -1, rng, scramble);
        if (!solved(p, p.initial) && solutionSolves(p, p.initial, p.solution)) return p;
    }
    c.locked = false;
    c.irregular = false;
    c.pattern = c.pattern == "randomMixed" ? "cross" : c.pattern;
    Rng rng(c.seed + "-fallback");
    return makePuzzleFromShell(generatedShell(c, rng), c, "generated-" + c.seed, c.name, -1, -1, rng, 5);
}

Config dailyConfig(int tier, const std::string &date) {
    Config c;
    c.seed = "daily-" + date + "-" + dailyTierKey(tier);
    c.name = "Daily " + dailyTierLabel(tier);
    c.unique = true;
    if (tier == 0) {
        c.width = 4;
        c.height = 4;
        c.states = 2;
        c.pattern = "cross";
        c.difficulty = "Easy";
    } else if (tier == 1) {
        c.width = 5;
        c.height = 5;
        c.states = 2;
        c.pattern = "cross";
        c.difficulty = "Medium";
        c.locked = true;
        c.irregular = true;
    } else {
        c.width = 4;
        c.height = 4;
        c.states = 3;
        c.pattern = "cross";
        c.difficulty = "Hard";
        c.locked = true;
        c.irregular = true;
    }
    return c;
}

struct Snapshot {
    std::vector<int> board;
    std::map<int, int> remaining;
};

struct Session {
    Puzzle puzzle;
    std::string mode;
    std::vector<int> board;
    std::map<int, int> remaining;
    std::vector<Snapshot> history;
    int moves = 0;
    bool usedHint = false;
    bool completed = false;
    bool leaderboardAttempt = false;
    int64_t started = nowMs();
    int elapsed = 0;
    std::string dailyKey;
    std::string dailyTier;

    void reset() {
        board = puzzle.initial;
        remaining = puzzle.solution;
        history.clear();
        moves = 0;
        usedHint = false;
        completed = false;
        started = nowMs();
        elapsed = 0;
    }
};

struct Progress {
    std::string path;
    std::map<std::string, std::string> kv;

    void load(const char *dataPath) {
        path = std::string(dataPath ? dataPath : ".") + "/progress.properties";
        kv.clear();
        std::ifstream in(path);
        std::string line;
        while (std::getline(in, line)) {
            size_t eq = line.find('=');
            if (eq != std::string::npos) kv[line.substr(0, eq)] = line.substr(eq + 1);
        }
    }

    void save() {
        std::ofstream out(path, std::ios::trunc);
        for (auto &entry : kv) out << entry.first << "=" << entry.second << "\n";
    }

    int getInt(const std::string &key, int fallback) {
        auto it = kv.find(key);
        if (it == kv.end()) return fallback;
        return std::atoi(it->second.c_str());
    }

    bool getBool(const std::string &key, bool fallback) {
        return getInt(key, fallback ? 1 : 0) != 0;
    }

    std::string getString(const std::string &key, const std::string &fallback) {
        auto it = kv.find(key);
        return it == kv.end() ? fallback : it->second;
    }

    void setInt(const std::string &key, int value) {
        kv[key] = std::to_string(value);
        save();
    }

    void setString(const std::string &key, const std::string &value) {
        kv[key] = value;
        save();
    }

    void clearCampaignProgress() {
        std::vector<std::string> prefixes = {"stars_c", "completed_c", "best_c", "hint_c"};
        for (auto it = kv.begin(); it != kv.end();) {
            bool remove = false;
            for (const std::string &prefix : prefixes) {
                if (it->first.rfind(prefix, 0) == 0) {
                    remove = true;
                    break;
                }
            }
            if (remove) {
                it = kv.erase(it);
            } else {
                ++it;
            }
        }
        save();
    }

    int stars(const std::string &id) { return getInt("stars_" + id, 0); }

    bool completed(const std::string &id) {
        return getBool("completed_" + id, false) || stars(id) > 0;
    }

    bool hintUsed(const std::string &id) {
        return getBool("hint_" + id, false);
    }

    int groupStars(int group) {
        int total = 0;
        for (int level = 0; level < CAMPAIGN_LEVELS_PER_GROUP; ++level) {
            total += clampInt(stars(campaignLevelIdFor(group, level)), 0, 3);
        }
        return total;
    }

    int groupCompleted(int group) {
        int total = 0;
        for (int level = 0; level < CAMPAIGN_LEVELS_PER_GROUP; ++level) {
            if (completed(campaignLevelIdFor(group, level))) ++total;
        }
        return total;
    }

    bool groupUnlocked(int group) {
        group = clampInt(group, 0, CAMPAIGN_GROUP_COUNT - 1);
        if (group == 0) return true;
        if (groupStars(group) > 0) return true;
        for (int neighbor : campaignAdjacentGroups(group)) {
            if (groupStars(neighbor) >= CAMPAIGN_GROUP_STAR_TARGET) return true;
        }
        return false;
    }

    bool unlocked(int campaignIndex) {
        return groupUnlocked(campaignGroupForLevel(campaignIndex));
    }
};

constexpr int CAMPAIGN_PROGRESS_VERSION = 5;

void migrateCampaignProgress(Progress &progress) {
    if (progress.getInt("campaign_version", 0) == CAMPAIGN_PROGRESS_VERSION) return;
    progress.clearCampaignProgress();
    progress.setInt("campaign_version", CAMPAIGN_PROGRESS_VERSION);
}

enum class Screen { Main, Campaign, Freeplay, Playground, Daily, HowTo, Math, Settings, About, Game };
enum class Action {
    Main, BackReturn, CloseAbout, Campaign, Freeplay, Playground, Daily, Achievements, HowTo, Math, Settings, About, OpenGithub, CampaignGroup, StartCampaign, Generate,
    DailyChallenge, Leaderboard,
    Size, States, Pattern, PatternInfo, ClosePatternInfo, PatternInfoBlocker, Difficulty, ToggleLocked, ToggleIrregular, ToggleUnique,
    PlaygroundStates, PlaygroundPattern, PlaygroundTool, PlaygroundTile, PlaygroundSection, PlaygroundWidthMinus, PlaygroundWidthPlus,
    PlaygroundHeightMinus, PlaygroundHeightPlus, PlaygroundClear, PlaygroundCopy, PlaygroundPaste, PlaygroundPlay,
    WidthMinus, WidthPlus, HeightMinus, HeightPlus, ExitGame, Undo, Reset, Hint,
    ConfirmDailyExit, CancelDailyExit, GuideSize, ToggleSetting, Language, Next, Replay, Dismiss
};

enum class SoundCue {
    Ui,
    Start,
    Pulse,
    Preview,
    Invalid,
    Undo,
    Reset,
    Hint,
    Win
};

struct SoundEngine {
    SLObjectItf engineObject = nullptr;
    SLEngineItf engine = nullptr;
    SLObjectItf outputMixObject = nullptr;
    SLObjectItf playerObject = nullptr;
    SLPlayItf playItf = nullptr;
    SLAndroidSimpleBufferQueueItf queueItf = nullptr;
    std::vector<int16_t> buffer;
    bool ready = false;
    static constexpr int sampleRate = 44100;

    bool init() {
        if (ready) return true;
        SLresult result = slCreateEngine(&engineObject, 0, nullptr, 0, nullptr, nullptr);
        if (result != SL_RESULT_SUCCESS || !engineObject) return false;
        result = (*engineObject)->Realize(engineObject, SL_BOOLEAN_FALSE);
        if (result != SL_RESULT_SUCCESS) return false;
        result = (*engineObject)->GetInterface(engineObject, SL_IID_ENGINE, &engine);
        if (result != SL_RESULT_SUCCESS || !engine) return false;

        result = (*engine)->CreateOutputMix(engine, &outputMixObject, 0, nullptr, nullptr);
        if (result != SL_RESULT_SUCCESS || !outputMixObject) return false;
        result = (*outputMixObject)->Realize(outputMixObject, SL_BOOLEAN_FALSE);
        if (result != SL_RESULT_SUCCESS) return false;

        SLDataLocator_AndroidSimpleBufferQueue queueLocator{SL_DATALOCATOR_ANDROIDSIMPLEBUFFERQUEUE, 1};
        SLDataFormat_PCM pcmFormat{
                SL_DATAFORMAT_PCM,
                1,
                SL_SAMPLINGRATE_44_1,
                SL_PCMSAMPLEFORMAT_FIXED_16,
                SL_PCMSAMPLEFORMAT_FIXED_16,
                SL_SPEAKER_FRONT_CENTER,
                SL_BYTEORDER_LITTLEENDIAN
        };
        SLDataSource source{&queueLocator, &pcmFormat};
        SLDataLocator_OutputMix outputLocator{SL_DATALOCATOR_OUTPUTMIX, outputMixObject};
        SLDataSink sink{&outputLocator, nullptr};
        const SLInterfaceID ids[] = {SL_IID_ANDROIDSIMPLEBUFFERQUEUE};
        const SLboolean req[] = {SL_BOOLEAN_TRUE};
        result = (*engine)->CreateAudioPlayer(engine, &playerObject, &source, &sink, 1, ids, req);
        if (result != SL_RESULT_SUCCESS || !playerObject) return false;
        result = (*playerObject)->Realize(playerObject, SL_BOOLEAN_FALSE);
        if (result != SL_RESULT_SUCCESS) return false;
        result = (*playerObject)->GetInterface(playerObject, SL_IID_PLAY, &playItf);
        if (result != SL_RESULT_SUCCESS || !playItf) return false;
        result = (*playerObject)->GetInterface(playerObject, SL_IID_ANDROIDSIMPLEBUFFERQUEUE, &queueItf);
        if (result != SL_RESULT_SUCCESS || !queueItf) return false;
        (*playItf)->SetPlayState(playItf, SL_PLAYSTATE_PLAYING);
        ready = true;
        return true;
    }

    void shutdown() {
        ready = false;
        buffer.clear();
        if (playerObject) {
            (*playerObject)->Destroy(playerObject);
            playerObject = nullptr;
            playItf = nullptr;
            queueItf = nullptr;
        }
        if (outputMixObject) {
            (*outputMixObject)->Destroy(outputMixObject);
            outputMixObject = nullptr;
        }
        if (engineObject) {
            (*engineObject)->Destroy(engineObject);
            engineObject = nullptr;
            engine = nullptr;
        }
    }

    static float waveValue(int wave, float phase) {
        constexpr float PI = 3.14159265358979323846f;
        float sine = std::sin(phase * 2.0f * PI);
        if (wave == 1) return 2.0f * std::fabs(2.0f * (phase - std::floor(phase + 0.5f))) - 1.0f;
        if (wave == 2) return 2.0f * (phase - std::floor(phase + 0.5f));
        return sine;
    }

    static void mixTone(std::vector<float> &mix, float frequency, float start, float duration, int wave, float gain, float toFrequency = 0.0f, bool echo = false) {
        int startSample = std::max(0, static_cast<int>(start * sampleRate));
        int count = std::max(1, static_cast<int>(duration * sampleRate));
        int end = startSample + count;
        if (static_cast<int>(mix.size()) < end + (echo ? static_cast<int>(0.11f * sampleRate) : 0)) {
            mix.resize(end + (echo ? static_cast<int>(0.11f * sampleRate) : 0), 0.0f);
        }
        float phase = 0.0f;
        for (int i = 0; i < count; ++i) {
            float u = static_cast<float>(i) / std::max(1, count - 1);
            float freq = toFrequency > 0.0f ? frequency * std::pow(toFrequency / frequency, u) : frequency;
            phase += freq / sampleRate;
            phase -= std::floor(phase);
            float attack = std::min(1.0f, u / 0.16f);
            float release = std::min(1.0f, (1.0f - u) / 0.56f);
            float env = std::max(0.0f, std::min(attack, release));
            float sample = waveValue(wave, phase) * gain * env;
            mix[startSample + i] += sample;
            if (echo) {
                int delayed = startSample + i + static_cast<int>(0.085f * sampleRate);
                if (delayed < static_cast<int>(mix.size())) mix[delayed] += sample * 0.18f;
            }
        }
    }

    void play(SoundCue cue, int argument = 0) {
        if (!ready && !init()) return;
        std::vector<float> mix(static_cast<size_t>(sampleRate * 0.65f), 0.0f);
        auto tone = [&](float f, float start, float duration, int wave, float gain, float to = 0.0f, bool echo = false) {
            mixTone(mix, f, start, duration, wave, gain, to, echo);
        };

        switch (cue) {
            case SoundCue::Ui:
                tone(520.0f, 0.006f, 0.055f, 1, 0.12f);
                tone(780.0f, 0.031f, 0.045f, 0, 0.06f);
                break;
            case SoundCue::Start:
                tone(392.0f, 0.006f, 0.085f, 1, 0.13f, 0.0f, true);
                tone(523.25f, 0.061f, 0.090f, 1, 0.12f, 0.0f, true);
                tone(659.25f, 0.121f, 0.120f, 0, 0.10f, 0.0f, true);
                break;
            case SoundCue::Pulse: {
                std::array<float, 5> tones = {246.94f, 329.63f, 415.30f, 493.88f, 587.33f};
                int state = clampInt(argument & 0xff, 0, 4);
                int affected = clampInt((argument >> 8) & 0xff, 1, 12);
                float gain = std::min(0.19f, 0.10f + affected * 0.011f);
                float base = tones[static_cast<size_t>(state)];
                tone(base, 0.006f, 0.120f, 1, gain, 0.0f, true);
                tone(base * 1.5f, 0.024f, 0.100f, 0, gain * 0.52f, 0.0f, true);
                break;
            }
            case SoundCue::Preview:
                tone(880.0f, 0.006f, 0.065f, 0, 0.085f, 0.0f, true);
                tone(1174.66f, 0.041f, 0.060f, 0, 0.058f, 0.0f, true);
                break;
            case SoundCue::Invalid:
                tone(130.0f, 0.006f, 0.110f, 2, 0.075f, 82.0f);
                break;
            case SoundCue::Undo:
                tone(659.25f, 0.006f, 0.075f, 1, 0.11f);
                tone(440.0f, 0.056f, 0.090f, 1, 0.085f);
                break;
            case SoundCue::Reset:
                tone(740.0f, 0.006f, 0.130f, 1, 0.105f, 370.0f);
                tone(277.18f, 0.121f, 0.080f, 0, 0.070f);
                break;
            case SoundCue::Hint:
                tone(987.77f, 0.006f, 0.070f, 0, 0.078f, 0.0f, true);
                tone(1318.51f, 0.061f, 0.085f, 0, 0.072f, 0.0f, true);
                tone(1760.0f, 0.126f, 0.095f, 1, 0.060f, 0.0f, true);
                break;
            case SoundCue::Win: {
                int stars = clampInt(argument, 0, 3);
                std::array<float, 5> notes = {523.25f, 659.25f, 783.99f, 1046.5f, 1318.51f};
                for (int i = 0; i < 2 + stars; ++i) {
                    float t = 0.006f + i * 0.075f;
                    tone(notes[static_cast<size_t>(i)], t, 0.160f, i % 2 ? 0 : 1, 0.13f - i * 0.012f, 0.0f, true);
                    tone(notes[static_cast<size_t>(i)] * 2.0f, t + 0.018f, 0.110f, 0, 0.040f, 0.0f, true);
                }
                break;
            }
        }

        while (!mix.empty() && std::fabs(mix.back()) < 0.0001f) mix.pop_back();
        if (mix.empty()) return;
        buffer.resize(mix.size());
        for (size_t i = 0; i < mix.size(); ++i) {
            float v = std::max(-0.92f, std::min(0.92f, mix[i] * 0.58f));
            buffer[i] = static_cast<int16_t>(v * 32767.0f);
        }
        (*queueItf)->Clear(queueItf);
        (*queueItf)->Enqueue(queueItf, buffer.data(), static_cast<SLuint32>(buffer.size() * sizeof(int16_t)));
    }
};

struct Button {
    Rect rect;
    Action action;
    int value = 0;
    bool enabled = true;
};

struct MathImageAsset {
    int width = 0;
    int height = 0;
    bool attempted = false;
    std::vector<unsigned char> pixels;
    sk_sp<SkImage> image;
};

struct AppState {
    android_app *native = nullptr;
    bool resumed = false;
    int platformBackEnabled = -1;
    Renderer renderer;
    SoundEngine audio;
    Progress progress;
    std::vector<Puzzle> campaignLevels;
    bool campaignLevelsLoaded = false;
    Screen screen = Screen::Main;
    Screen returnScreen = Screen::Main;
    std::vector<Button> buttons;
    std::map<std::string, MathImageAsset> mathImages;
    std::map<std::string, MathImageAsset> menuImages;
    Session session;
    bool hasSession = false;
    bool completion = false;
    int completionStars = 0;
    int completionMark = 0;
    bool dailyExitConfirm = false;
    bool patternInfoOpen = false;
    int64_t patternInfoOpenedAt = 0;
    int lastCampaign = 0;
    int selectedCampaignGroup = 0;
    float density = 1.0f;
    float scroll = 0.0f;
    float contentHeight = 0.0f;
    float downX = 0.0f;
    float downY = 0.0f;
    float startScroll = 0.0f;
    float lastTouchY = 0.0f;
    float scrollVelocity = 0.0f;
    bool dragging = false;
    int64_t downTime = 0;
    int64_t lastTouchTime = 0;
    int64_t lastScrollFrameTime = 0;
    Rect pressedButtonRect{};
    Action pressedButtonAction = Action::Main;
    int pressedButtonValue = 0;
    bool hasPressedButton = false;
    int64_t pressedButtonUntil = 0;

    std::string freeSize = "5x5";
    int customW = 5;
    int customH = 5;
    int freeStates = 3;
    std::string freePattern = "cross";
    std::string freeDifficulty = "Medium";
    bool freeLocked = false;
    bool freeIrregular = false;
    bool freeUnique = true;
    int playgroundW = 5;
    int playgroundH = 5;
    int playgroundStates = 3;
    std::string playgroundPattern = "cross";
    int playgroundTool = 0;
    std::vector<int> playgroundBoard;
    std::set<int> playgroundLocked;
    std::set<int> playgroundDisabled;
    std::string playgroundStatus;
    int64_t playgroundStatusUntil = 0;
    bool playgroundStatesOpen = false;
    bool playgroundPatternOpen = false;
    bool playgroundSizeOpen = false;
    bool playgroundCodeOpen = false;
    bool sound = true;
    bool vibration = true;
    bool hideNumbers = true;
    bool showPlaygroundNumbers = false;
    std::string language = "en";
    int guideTextSize = 0;
    std::string hintLine;
    int pressTile = -1;
    bool longPreviewShown = false;
    int previewTile = -1;
    int64_t previewClearAt = 0;
    std::vector<int> hintChanged;
    int64_t hintChangedUntil = 0;
    int64_t hintCooldownUntil = 0;
    int64_t hintCompletionDueAt = 0;
    std::vector<int> pulseTiles;
    int64_t pulseUntil = 0;
    std::array<int, 25> splashState{};
    std::vector<int> splashChanged;
    bool splashReady = false;
    int splashLastTap = -1;
    int splashTap = -1;
    int64_t splashNextAt = 0;
    int64_t splashPulseUntil = 0;
    Rng splashRng{"native-splash"};
};

const std::unordered_map<std::string, std::string> &translationTable(const std::string &language) {
    static const std::unordered_map<std::string, std::string> es = {
            {"A modular tile puzzle", "Un rompecabezas modular"},
            {"Campaign", "Campaña"},
            {"Custom Level", "Nivel personalizado"},
            {"Custom Puzzle", "Rompecabezas personalizado"},
            {"Playground", "Zona de pruebas"},
            {"Playground setup", "Configuración de zona de pruebas"},
            {"Playground controls", "Controles de zona de pruebas"},
            {"Playground board", "Tablero de zona de pruebas"},
            {"Daily Challenge", "Reto diario"},
            {"Daily Challenges", "Retos diarios"},
            {"Achievements", "Logros"},
            {"How to Play", "Cómo jugar"},
            {"The Math", "Las matemáticas"},
            {"Settings", "Ajustes"},
            {"Chapter", "Capítulo"},
            {"Campaign groups", "Grupos de campaña"},
            {"Group", "Grupo"},
            {"Earn 15 stars in a nearby group.", "Gana 15 estrellas en un grupo adyacente."},
            {"Campaign data unavailable", "Datos de campaña no disponibles"},
            {"The bundled campaign asset could not be loaded. Reload the app or check that campaign-levels.json is included.", "No se pudo cargar el recurso incluido de la campaña. Recarga la app o comprueba que campaign-levels.json esté incluido."},
            {"Daily", "Diario"},
            {"Easy", "Fácil"},
            {"Medium", "Medio"},
            {"Hard", "Difícil"},
            {"Expert", "Experto"},
            {"Global", "Global"},
            {"Leaderboards", "Clasificaciones"},
            {"Compare today's marks by tier or as one combined daily score.", "Compara las marcas de hoy por nivel o como una puntuación diaria combinada."},
            {"All daily tiers", "Todos los niveles diarios"},
            {"Grid Size", "Tamaño de cuadrícula"},
            {"Custom", "Personalizado"},
            {"Width", "Anchura"},
            {"Height", "Altura"},
            {"States", "Estados"},
            {"states", "estados"},
            {"Tap Pattern", "Patrón de toque"},
            {"Difficulty", "Dificultad"},
            {"Cross", "Cruz"},
            {"Diagonal", "Diagonal"},
            {"Square", "Cuadrado"},
            {"Horizontal line", "Línea horizontal"},
            {"Vertical line", "Línea vertical"},
            {"Self only", "Solo propia"},
            {"Knight", "Caballo"},
            {"Random mixed", "Mixto aleatorio"},
            {"Mixed patterns", "Patrones mixtos"},
            {"Edit Tool", "Herramienta de edición"},
            {"Tap Tiles", "Tocar casillas"},
            {"Paint White", "Pintar blanco"},
            {"Paint Color", "Pintar color"},
            {"Paint States", "Pintar estados"},
            {"Lock Tiles", "Poner candados"},
            {"Place Holes", "Poner huecos"},
            {"Starting Board", "Tablero inicial"},
            {"Puzzle Code", "Código de rompecabezas"},
            {"Share", "Compartir"},
            {"Load Code", "Cargar código"},
            {"Copy Code", "Copiar código"},
            {"Paste Code", "Pegar código"},
            {"Clear Board", "Borrar tablero"},
            {"Play", "Jugar"},
            {"Sandbox", "Zona libre"},
            {"No goal", "Sin objetivo"},
            {"Puzzle code copied.", "Código copiado."},
            {"Puzzle code loaded.", "Código cargado."},
            {"Puzzle code not recognized.", "Código no reconocido."},
            {"Clipboard has no puzzle code.", "El portapapeles no tiene código de rompecabezas."},
            {"Keep at least one tile.", "Mantén al menos una casilla."},
            {"Hints are off in Playground.", "Las pistas están desactivadas en Zona de pruebas."},
            {"Tiles with lock icons", "Casillas con candado"},
            {"Irregular board", "Tablero irregular"},
            {"Extras", "Extras"},
            {"Unique preferred", "Preferir solución única"},
            {"Create Puzzle", "Crear rompecabezas"},
            {"ON", "SÍ"},
            {"OFF", "NO"},
            {"on", "sí"},
            {"off", "no"},
            {"Lock icons", "Candados"},
            {"Empty holes", "Huecos vacíos"},
            {"Sound", "Sonido"},
            {"Vibration", "Vibración"},
            {"Show numbers on tiles", "Mostrar números en las casillas"},
            {"Show numbers in Playground", "Mostrar números en Zona de pruebas"},
            {"Language", "Idioma"},
            {"About", "Acerca de"},
            {"Options", "Opciones"},
            {"Version", "Versión"},
            {"Changelog", "Historial de cambios"},
            {"Complete", "Completado"},
            {"Level Complete", "Nivel completado"},
            {"Taps Used", "Toques usados"},
            {"Minimum", "Mínimo"},
            {"Mark", "Marca"},
            {"Best Taps", "Mejor marca"},
            {"Time", "Tiempo"},
            {"Next Level", "Siguiente nivel"},
            {"New Puzzle", "Nuevo rompecabezas"},
            {"Leaderboard", "Clasificación"},
            {"Replay", "Repetir"},
            {"Reset", "Reiniciar"},
            {"Menu", "Menú"},
            {"Taps", "Toques"},
            {"Pattern", "Patrón"},
            {"Goal", "Objetivo"},
            {"All tiles white", "Todas en blanco"},
            {"Tap effect", "Efecto del toque"},
            {"View", "Ver"},
            {"Tap effect (not the goal)", "Efecto del toque (no es el objetivo)"},
            {"Mixed tap effects", "Efectos de toque mixtos"},
            {"This preview shows which tiles one tap changes.", "Esta vista previa muestra qué casillas cambia un toque."},
            {"Goal: make every tile white.", "Objetivo: dejar todas las casillas en blanco."},
            {"Playground has no completion goal.", "En la Zona de pruebas no hay objetivo final."},
            {"On mixed boards, match each tappable tile's symbol to an effect above.", "En los tableros mixtos, relaciona el símbolo de cada casilla que se puede tocar con uno de los efectos de arriba."},
            {"Hold a tile to preview the exact effect before tapping.", "Mantén pulsada una casilla para ver el efecto exacto antes de tocarla."},
            {"Tap pattern info", "Información del patrón de toque"},
            {"When you tap a tile, this pattern is centered on that tile. Every tile inside the pattern changes state.", "Al tocar una casilla, este patrón se centra en esa casilla. Cada casilla dentro del patrón cambia de estado."},
            {"The green outline matches the preview you see when you hold a tile.", "El borde verde coincide con la vista previa que ves al mantener presionada una casilla."},
            {"Personal Best", "Mejor marca"},
            {"Leaderboard try", "Intento de clasificación"},
            {"No reset or hints", "Sin reinicio ni pistas"},
            {"Exit daily challenge?", "¿Salir del reto diario?"},
            {"This is your first try. Exiting now records 0 for this daily leaderboard. You can replay afterward, but only this try counts.", "Este es tu primer intento. Si sales ahora, se registra 0 en esta clasificación diaria. Podrás repetir después, pero solo cuenta este intento."},
            {"Keep Playing", "Seguir jugando"},
            {"Exit for 0", "Salir con 0"},
            {"Best:", "Mejor:"},
            {"Not played today", "No jugado hoy"},
            {"taps", "toques"},
            {"First try:", "Primer intento:"},
            {"Replays open", "Repeticiones abiertas"},
            {"First try counts", "El primer intento cuenta"},
            {"Previewing this tap.", "Vista previa de este toque."},
            {"Hint applied. Red tiles changed. This try is worth 0 stars.", "Pista aplicada. Las casillas rojas cambiaron. Este intento vale 0 estrellas."},
            {"No useful tap is available.", "No hay ningún toque útil disponible."},
            {"Binary Beginnings", "Comienzos binarios"},
            {"Fourfold Flips", "Giros cuádruples"},
            {"Lights With Lock Icons", "Luces con candado"},
            {"Lockstep Squares", "Cuadrados sincronizados"},
            {"First Empty Holes", "Primeros huecos vacíos"},
            {"Binary Breakaways", "Escapes binarios"},
            {"Fivefold Binary", "Binario quíntuple"},
            {"Three-Color Start", "Inicio tricolor"},
            {"Triple Grid", "Cuadrícula triple"},
            {"Three Lock-Icon Tiles", "Tres casillas con candado"},
            {"Three Empty Holes", "Tres huecos vacíos"},
            {"Triple Combine", "Combinación triple"},
            {"Pattern Primer", "Primeros patrones"},
            {"Patterns With Lock Icons", "Patrones con casillas con candado"},
            {"Color Gauntlet", "Desafío de colores"},
            {"Four-State Start", "Inicio de cuatro estados"},
            {"Four-State Lock-Icon Tiles", "Casillas con candado de cuatro estados"},
            {"Four-State Empty Holes", "Huecos vacíos de cuatro estados"},
            {"Four-State Patterns", "Patrones de cuatro estados"},
            {"Four-State Matrix", "Matriz de cuatro estados"},
            {"Five-State Start", "Inicio de cinco estados"},
            {"Five-State Lock-Icon Tiles", "Casillas con candado de cinco estados"},
            {"Five-State Empty Holes", "Huecos vacíos de cinco estados"},
            {"Five-State Patterns", "Patrones de cinco estados"},
            {"Dense Dimensions", "Dimensiones densas"},
            {"Prime Pressure", "Presión prima"},
            {"Modular Maze", "Laberinto modular"},
            {"Wide Matrix", "Matriz amplia"},
            {"Endgame Circuit", "Circuito final"},
            {"Final Inversion", "Inversión final"},
            {"Clear the board", "Deja el tablero en blanco"},
            {"Turn every tile white. A single tap can change several tiles at once.", "Deja todo el tablero en blanco. Con un solo toque puedes cambiar varias casillas a la vez."},
            {"Before you tap, hold a tile to see where its pattern reaches.", "Antes de tocar una casilla, mantenla pulsada para ver hasta dónde llega su patrón."},
            {"1. Read the colors", "1. Fíjate en los colores"},
            {"White is the color you want every tile to reach.", "El blanco es el color al que deben llegar todas las casillas."},
            {"A white tile can still change color if another tap reaches it.", "Una casilla blanca puede volver a cambiar de color si la alcanza otro toque."},
            {"You solve the puzzle when all the tiles are white at once.", "Resuelves el nivel cuando todas las casillas están blancas a la vez."},
            {"2. Follow the color cycle", "2. Sigue el ciclo de colores"},
            {"Tap an unlocked tile. Its pattern tells you which tiles will change.", "Toca una casilla sin candado. Su patrón indica qué casillas cambiarán."},
            {"Each tile in the pattern moves on to its next color.", "Cada casilla que alcanza el patrón pasa al siguiente color."},
            {"After the last color comes white again.", "Después del último color vuelve el blanco."},
            {"3. Check the pattern", "3. Comprueba el patrón"},
            {"Look for crosses, diagonals, squares, rows, columns and even chess knight moves. Some boards mix several patterns.", "Hay cruces, diagonales, cuadrados, filas, columnas y hasta saltos de caballo de ajedrez. Algunos tableros combinan varios patrones."},
            {"Hold a tile to preview its pattern. Lift your finger when you’re done looking.", "Mantén pulsada una casilla para ver su patrón. Cuando termines de mirarlo, levanta el dedo."},
            {"4. Locks and holes", "4. Candados y huecos"},
            {"A locked tile still has to turn white.", "Las casillas con candado también tienen que quedar blancas."},
            {"To change it, tap another tile whose pattern reaches it.", "Para cambiar una casilla con candado, toca otra cuyo patrón la alcance."},
            {"A hole is just a gap in the board. Tap patterns skip it.", "Donde hay un hueco no hay casilla. Los patrones de toque se lo saltan."},
            {"Choose your puzzle", "Elige tu rompecabezas"},
            {"Campaign: Pick a group on the 5 × 5 map. Earn 15 stars there to unlock the groups directly beside it, above it and below it.", "Campaña: Elige un grupo en el mapa de 5 × 5. Consigue 15 estrellas en él para desbloquear los grupos que tenga a la izquierda, a la derecha, arriba y abajo."},
            {"Custom Level: Choose the board size, number of colors, pattern and difficulty. You can add locks and holes. The game looks for a puzzle with a unique solution when it can.", "Nivel personalizado: Elige el tamaño del tablero, el número de colores, el patrón y la dificultad. Puedes añadir candados y huecos. El juego procura crear un rompecabezas con una única solución."},
            {"Playground: Build your own board and share it with a puzzle code. You can keep experimenting even after every tile turns white.", "Zona de pruebas: Crea tu propio tablero y comparte su código. Puedes seguir probando toques incluso cuando todo el tablero esté en blanco."},
            {"Daily Challenge: Everyone gets the same three puzzles each day. Each one keeps its own best score.", "Reto diario: Cada día hay tres rompecabezas iguales para todos. Tu mejor resultado se guarda por separado en cada uno."},
            {"Taps, stars, and hints", "Toques, estrellas y pistas"},
            {"Previewing a pattern is free. Your tap counts when the tiles change.", "Ver el patrón no cuesta ningún toque. El toque cuenta cuando cambian las casillas."},
            {"For three stars, solve the puzzle in as few taps as the game’s best known solution, or fewer.", "Para ganar tres estrellas, iguala o mejora el número de toques de la mejor solución que ha encontrado el juego."},
            {"The one- and two-star targets leave room for extra taps.", "Los objetivos de una y dos estrellas dejan margen para más toques."},
            {"Undo takes back your last tap. Reset puts the board back the way it started.", "Deshacer anula tu último toque. Reiniciar te devuelve al tablero inicial."},
            {"A hint plays one tap for you. You can still finish that attempt, but it earns no stars.", "Una pista da un toque por ti. Puedes terminar ese intento, aunque no ganarás estrellas."},
            {"Look for the red outlines to see which tiles the hint changed.", "El borde rojo señala las casillas que ha cambiado la pista."},
            {"Turn sound effects on or off in Settings.", "En Ajustes puedes activar o desactivar los efectos de sonido."},
            {"If you prefer numbers, turn them on to see each tile’s state alongside its color.", "Si prefieres guiarte por números, actívalos para ver el estado de cada casilla además de su color."},
            {"On Android, you can also turn vibration on or off.", "En Android también puedes activar o desactivar la vibración."},
            {"What happens when you add up the taps?", "¿Qué pasa cuando sumas los efectos de los toques?"},
            {"Take a board with just two colors. Tap the center of a cross and every tile in the cross switches between white and blue. Tap the same spot again and you’re back where you started. The same rule works with other patterns. With more colors, it takes more taps to go all the way around the cycle.", "Imagina un tablero de dos colores. Toca el centro de una cruz y todas sus casillas pasan de blanco a azul o de azul a blanco. Toca el mismo sitio otra vez y vuelves al punto de partida. La idea también funciona con otros patrones y con más colores. Si hay más colores, harán falta más toques para recorrer el ciclo."},
            {"The board in one equation", "El tablero en una ecuación"},
            {"Give white the number 0 and count up through the colors. On a board with n colors, the next step after n-1 is 0 again. This is arithmetic modulo n, written in the ring R=Z/nZ.", "Asigna el 0 al blanco y numera los demás colores en orden. Si hay n colores, después de n-1 vuelves al 0. Así funciona la aritmética módulo n en el anillo R=Z/nZ."},
            {"Now read the tiles in a fixed order. Their numbers form the board vector s. Put the effect of each possible tap in a column of a matrix A. If x records how often you tap each unlocked tile, Ax gives the total change. You win when s+Ax=0.", "Lee las casillas siempre en el mismo orden. Sus números forman el vector del tablero s. Escribe el efecto de cada toque posible en una columna de la matriz A. Si x recoge el número de toques que das en cada casilla, Ax es el cambio total. Ganas cuando s+Ax=0."},
            {"From two states to many", "De dos estados a varios"},
            {"In the classic Lights Out puzzle, a tap flips the chosen tile and its neighbors above, below, left and right. Each flip adds 1 modulo 2. Two taps in the same spot cancel because 1+1=0 modulo 2.", "En el clásico Lights Out, un toque cambia la casilla elegida y sus vecinas de arriba, abajo, izquierda y derecha. Cada cambio suma 1 módulo 2. Dos toques en el mismo sitio se anulan porque 1+1=0 módulo 2."},
            {"Invert the Matrix adds more states and patterns, but tap effects still add together. Skip holes when you list the tiles. Include locked tiles, since a tap on another tile can change them.", "Invert the Matrix añade más estados y patrones, pero los efectos de los toques se siguen sumando. Al enumerar las casillas, omite los huecos e incluye las casillas con candado, que pueden cambiar con un toque en otra casilla."},
            {"Can you combine the available taps to cancel the starting board? The change you need is -s.", "¿Puedes combinar los toques disponibles para anular el tablero inicial? El cambio que buscas es -s."},
            {"1. The board is a vector", "1. El tablero es un vector"},
            {"Number the m tiles p_1,…,p_m in any fixed order. Write their states in that same order to get s=(s_1,…,s_m) ∈ R^m. Each entry s_i is the color of tile p_i. An all-white board is the zero vector.", "Numera las m casillas como p_1,…,p_m en el orden que prefieras. Escribe sus estados en ese mismo orden para obtener s=(s_1,…,s_m) ∈ R^m. Cada componente s_i indica el color de la casilla p_i. Un tablero en blanco es el vector cero."},
            {"2. Each tap contributes a column", "2. Cada toque aporta una columna"},
            {"Label the r tiles you can tap q_1,…,q_r. Tap q_j once and record a 1 for each tile that changes and a 0 for each tile that stays the same. The result is its effect vector v_j, column j of A.", "Llama q_1,…,q_r a las r casillas que puedes tocar. Toca q_j una vez y anota un 1 por cada casilla que cambie y un 0 por cada una que quede igual. Así obtienes su vector de efecto v_j, la columna j de A."},
            {"Read across a row to see which taps affect one tile. Read down a column to see which tiles one tap affects. A locked tile has a row of its own, but you can’t tap it, so it has no column.", "Lee una fila para ver qué toques afectan a una casilla. Lee una columna para ver qué casillas cambia un toque. Una casilla con candado tiene su propia fila, pero como no puedes tocarla, no tiene columna."},
            {"How many times should you tap each tile?", "¿Cuántas veces hay que tocar cada casilla?"},
            {"The tap-count vector x=(x_1,…,x_r) records how often you tap each unlocked tile, modulo n. Each tap on q_j adds the same v_j, so together the taps add Ax=∑_j x_jv_j. You can play them in any order.", "El vector de toques x=(x_1,…,x_r) recoge cuántas veces tocas cada casilla sin candado, módulo n. Cada toque en q_j suma el mismo vector v_j, así que el cambio total es Ax=∑_j x_jv_j. Puedes dar los toques en el orden que quieras."},
            {"The final board is s+Ax. To make it all white, look for a vector x that solves Ax=-s in R.", "El tablero final es s+Ax. Para dejarlo en blanco, busca un vector x que resuelva Ax=-s en R."},
            {"When does a solution exist?", "¿Cuándo existe una solución?"},
            {"Every tap-count vector produces a change Ax. All those changes together form the image of A, written Im(A). A board has a solution exactly when -s belongs to this image.", "Cada vector de toques produce un cambio Ax. El conjunto de todos esos cambios es la imagen de A, que se escribe Im(A). Un tablero tiene solución si y solo si -s pertenece a esa imagen."},
            {"When n is prime, you can check by row reducing the augmented matrix [A | -s] to echelon form. A row saying 0=c with c ≠ 0 rules out a solution. If no such row appears, you can read off at least one solution by back substitution.", "Si n es primo, puedes escalonar la matriz ampliada [A | -s] mediante operaciones por filas. Una fila que diga 0=c con c ≠ 0 descarta toda solución. Si no aparece ninguna, puedes obtener una solución por sustitución hacia atrás."},
            {"Prime numbers and fields", "Números primos y cuerpos"},
            {"With 2, 3 or 5 states, R is a field. Every nonzero element has a multiplicative inverse, so you can divide by it. With four states, even a simple division by 2 can go wrong. We’ll see why below.", "Con 2, 3 o 5 estados, R es un cuerpo. Cada elemento distinto de cero tiene inverso multiplicativo, así que puedes dividir por él. Con cuatro estados, hasta una división por 2 puede dar problemas. Más abajo veremos por qué."},
            {"What changes with four states?", "¿Qué cambia con cuatro estados?"},
            {"When n is composite, R is still a ring, but some nonzero elements have no multiplicative inverse. For example, modulo 4, twice any number is even, so 2a can never equal 1. You can’t divide a row by 2 here.", "Si n es compuesto, R sigue siendo un anillo, pero algunos elementos distintos de cero carecen de inverso multiplicativo. Por ejemplo, módulo 4, el doble de cualquier número es par, así que 2a nunca puede valer 1. Aquí no puedes dividir una fila por 2."},
            {"The test for a solution is still -s ∈ Im(A). Use row operations valid in the ring. If n factors into coprime prime powers, you can also solve modulo each of those powers and combine the results.", "El criterio sigue siendo -s ∈ Im(A). Usa operaciones por filas válidas en el anillo. Si n se descompone en potencias de primos distintos, también puedes resolver el sistema módulo cada potencia y combinar los resultados."},
            {"When is the solution unique?", "¿Cuándo es única la solución?"},
            {"Suppose x_0 solves the board. If a tap-count vector z leaves the board unchanged, then Az=0 and x_0+z also solves it. These vectors z form the kernel of A, written ker(A). Adding each of them to x_0 gives all the solutions.", "Supón que x_0 resuelve el tablero. Si un vector de toques z deja el tablero igual, entonces Az=0 y x_0+z también es solución. Estos vectores z forman el núcleo de A, que se escribe ker(A). Al sumar cada uno a x_0 obtienes todas las soluciones."},
            {"Remember that counts are taken modulo n. Tapping one tile n extra times takes its whole pattern around the color cycle. It leaves both the board and the tap-count vector unchanged.", "Recuerda que los toques se cuentan módulo n. Si tocas una casilla n veces más, todas las casillas de su patrón completan el ciclo de colores. Tanto el tablero como el vector de toques quedan igual."},
            {"So a solvable board has exactly one tap-count vector when ker(A)={0}. Over a field, this means the columns of A are linearly independent. The kernel test also works in the four-state ring.", "Así, un tablero con solución tiene un único vector de toques si y solo si ker(A)={0}. Sobre un cuerpo, esto significa que las columnas de A son linealmente independientes. El criterio del núcleo también vale en el anillo de cuatro estados."},
            {"When is A invertible?", "¿Cuándo es invertible A?"},
            {"If you can tap every tile, A has one row and one column per tile, so it is square. Holes leave that count balanced. A lock removes a column and keeps the row. When a square A is invertible, every starting board has exactly one tap-count solution.", "Si puedes tocar todas las casillas, A tiene una fila y una columna por casilla, así que es cuadrada. Los huecos no alteran esa igualdad. Un candado elimina una columna y conserva la fila. Si la matriz cuadrada A es invertible, cada tablero inicial tiene un único vector de toques que lo resuelve."},
            {"A square A is invertible exactly when its determinant has a multiplicative inverse in R. For prime n, the determinant must be nonzero modulo n. For n=4, it must be odd. If this test fails, some starting boards have no solution and others have several. For a rectangular matrix, use the image to test existence and the kernel to test uniqueness.", "Una matriz cuadrada A es invertible si y solo si su determinante tiene inverso multiplicativo en R. Para n primo, el determinante debe ser distinto de cero módulo n. Para n=4, debe ser impar. Si falla este criterio, hay tableros sin solución y otros con varias. Para una matriz rectangular, la imagen indica si hay solución y el núcleo si es única."},
            {"Counting the taps in a solution", "Cómo contar los toques de una solución"},
            {"To play a solution, take each count x_j as a number from 0 to n-1. Call that number t_j. Add these numbers as ordinary integers to get the number of taps, ℓ(x). The shortest solution the game has found sets the three-star target.", "Para jugar una solución, representa cada componente x_j con un número entre 0 y n-1, que llamaremos t_j. Suma esos números como enteros para obtener el total de toques, ℓ(x). La solución más corta que ha encontrado el juego fija el objetivo de tres estrellas."},
            {"How the game finds a short solution", "Cómo busca el juego una solución corta"},
            {"If the board has few enough possible states, the game searches all positions one tap away, then two taps away, and so on. The first time it reaches an all-white board, it has found the fewest taps possible.", "Si el tablero tiene pocas configuraciones posibles, el juego explora primero las que están a un toque, luego las que están a dos y así sucesivamente. La primera vez que llega a un tablero en blanco, ha encontrado el mínimo de toques."},
            {"For larger boards with a prime number of states per tile, the game row reduces Ax=-s. If there are few enough solutions to try, it compares them all and keeps one with the fewest taps. When an exact search is too large, including on large four-state boards, it uses a known solution whose length may be above the minimum.", "En tableros más grandes con un número primo de estados por casilla, el juego reduce el sistema Ax=-s por filas. Si hay pocas soluciones, las compara todas y guarda una de las que requieren menos toques. Cuando la búsqueda exacta resulta demasiado grande, como en los tableros grandes de cuatro estados, usa una solución conocida que puede superar el mínimo."},
            {"Different tap-count vectors can tie for the minimum, and you can play the same vector in different orders. When the game proves a minimum, it always picks the same plan among those tied for shortest. It doesn’t tell you whether another plan ties with it.", "Distintos vectores de toques pueden empatar en el mínimo, y puedes jugar un mismo vector en órdenes distintos. Cuando el juego comprueba el mínimo, elige siempre el mismo plan entre los más cortos. No indica si hay otro igual de corto."},
            {"Locked tiles and holes in the matrix", "Candados y huecos en la matriz"},
            {"To model a hole, leave that position out entirely. To model a lock, keep the tile’s entry in s and its row in A, since it still has to turn white. Leave out its column. The remaining columns tell you which other taps can change it.", "Para representar un hueco, omite esa posición por completo. Para un candado, conserva la componente de la casilla en s y su fila en A, porque también debe quedar blanca. Omite su columna. Las demás columnas indican qué otros toques pueden cambiarla."},
            {"How puzzles are made", "Cómo se crean los rompecabezas"},
            {"The generator starts with a white board and scrambles it with allowed taps. It keeps track of how to undo their combined effect, so the starting board comes with a solution. When it can, the solver finds a shortest plan for the star targets. A hint plays one tap toward a solution and outlines the tiles it changed in red.", "El generador empieza con un tablero en blanco y lo mezcla con toques permitidos. Guarda cómo anular el efecto conjunto de esos toques, así que el tablero inicial ya tiene solución. Cuando es posible, busca un plan de longitud mínima para fijar los objetivos de estrellas. Cada pista da un toque hacia la solución y marca en rojo las casillas que cambia."},
            {"What the symbols mean", "Qué significan los símbolos"},
            {"modulus / tile states", "módulo / estados de casilla"},
            {"board vector in (Z/nZ)^m", "vector del tablero en (Z/nZ)^m"},
            {"columns are effect vectors", "columnas de vectores de efecto"},
            {"tap-count vector in (Z/nZ)^r", "vector de toques en (Z/nZ)^r"},
            {"reachable board changes", "cambios de tablero que se pueden conseguir"},
            {"tap-count vectors with A x = 0", "vectores de toques con A x = 0"},
            {"values wrap after n - 1", "los valores vuelven a 0 tras n - 1"},
            {"if tap j changes tile i", "si el toque j cambia la casilla i"},
            {"otherwise", "en caso contrario"},
            {"number of taps on tile j", "número de toques en la casilla j"},
            {"solution exists iff", "hay solución si y solo si"},
            {"solutions", "soluciones"},
            {"is a field", "es un cuerpo"},
            {"You can now play in Korean. We also rewrote How to Play and the math guide, from your first tap to the equations behind a solution.", "Ya puedes jugar en coreano. Hemos revisado las instrucciones y la guía de matemáticas, desde tu primer toque hasta las ecuaciones que explican cómo resolver un tablero."},
            {"Improved Android 16 compatibility, system Back navigation, and screen layout around system bars. The Android app now requires Android 7 or later.", "Se mejoraron la compatibilidad con Android 16, la navegación Atrás del sistema y la distribución de la pantalla junto a las barras del sistema. La aplicación de Android requiere ahora Android 7 o posterior."},
            {"Updated AndroidX Activity and Fragment dependencies to current supported releases for Play compatibility.", "Se actualizaron las dependencias AndroidX Activity y Fragment a versiones compatibles actuales para Google Play."},
            {"Android now targets Android 16, keeps system Back navigation reliable, and makes the all-white goal clear with tap-effect help available on demand.", "La app ahora está orientada a Android 16, mantiene fiable la navegación Atrás del sistema y deja claro el objetivo de poner todas las casillas en blanco, con ayuda del efecto de toque disponible cuando se necesite."},
            {"The main menu now includes Achievements, the animated board is larger, and Android opens Play Games achievement status while the web app shows campaign achievement progress.", "El menú principal ahora incluye Logros, el tablero animado es más grande y Android abre el estado de logros de Play Games mientras la app web muestra el progreso de logros de campaña."},
            {"First production release with campaign levels, daily challenges, custom puzzles, Playground boards, hints, stars, and Play Games achievements.", "Primera versión de producción con niveles de campaña, retos diarios, rompecabezas personalizados, tableros de Zona de pruebas, pistas, estrellas y logros de Play Games."},
            {"Added a separate setting for Playground tile numbers, keeping Playground boards number-free unless it is turned on.", "Se añadió un ajuste separado para los números en casillas de Zona de pruebas, para que sus tableros no muestren números salvo que esté activado."},
            {"The Android release is prepared with version code 12, native debug symbols for Play Console crash reports, and refreshed changelog notes for the latest Play Store build.", "La versión de Android está preparada con código de versión 12, símbolos nativos de depuración para los informes de fallos de Play Console y notas actualizadas del historial de cambios para la última compilación de Play Store."},
            {"Playground adds shareable puzzle codes, campaign now uses a 5x5 group map, and the Playground logo is now a tile-colored basketball. Menu headers, locks, and text-size controls were polished across web and Android.", "Zona de pruebas añade códigos de rompecabezas para compartir, la campaña usa un mapa de grupos 5x5, y el logo de Zona de pruebas ahora es un balón de baloncesto con colores de casillas. Las cabeceras de menú, candados y controles de tamaño de texto se pulieron en web y Android."},
            {"Daily challenges now separate puzzle cards from leaderboards, custom setup uses visual pattern chips with unique generation always on, and game/result screens are clearer.", "Los retos diarios ahora separan las tarjetas de rompecabezas de las clasificaciones, la configuración personalizada usa opciones visuales de patrón con generación única siempre activa y las pantallas de juego y resultado son más claras."},
            {"Settings now hide platform-specific controls, animation and colorblind-symbol toggles were removed, and About shows version history with the GitHub link.", "Los ajustes ahora ocultan controles específicos de plataforma, se eliminaron los interruptores de animación y símbolos daltónicos, y Acerca de muestra el historial de versiones con el enlace de GitHub."},
            {"Release builds keep native debug symbols for Play Console crash reports.", "Las compilaciones de lanzamiento conservan símbolos nativos de depuración para los informes de fallos de Play Console."},
            {"The Math guide explains solution uniqueness and matrix invertibility.", "La guía de matemáticas explica cuándo una solución es única y cuándo la matriz es invertible."}
    };
    static const std::unordered_map<std::string, std::string> fr = {
            {"A modular tile puzzle", "Un casse-tête de tuiles modulaires"},
            {"Campaign", "Campagne"},
            {"Custom Level", "Niveau personnalisé"},
            {"Custom Puzzle", "Casse-tête personnalisé"},
            {"Playground", "Bac à sable"},
            {"Playground setup", "Configuration du bac à sable"},
            {"Playground controls", "Commandes du bac à sable"},
            {"Playground board", "Plateau du bac à sable"},
            {"Daily Challenge", "Défi quotidien"},
            {"Daily Challenges", "Défis quotidiens"},
            {"Achievements", "Succès"},
            {"How to Play", "Comment jouer"},
            {"The Math", "Les maths"},
            {"Settings", "Paramètres"},
            {"Chapter", "Chapitre"},
            {"Campaign groups", "Groupes de campagne"},
            {"Group", "Groupe"},
            {"Earn 15 stars in a nearby group.", "Gagne 15 étoiles dans un groupe adjacent."},
            {"Campaign data unavailable", "Données de campagne indisponibles"},
            {"The bundled campaign asset could not be loaded. Reload the app or check that campaign-levels.json is included.", "La ressource de campagne incluse n'a pas pu être chargée. Recharge l'app ou vérifie que campaign-levels.json est inclus."},
            {"Daily", "Quotidien"},
            {"Easy", "Facile"},
            {"Medium", "Moyen"},
            {"Hard", "Difficile"},
            {"Expert", "Expert"},
            {"Global", "Global"},
            {"Leaderboards", "Classements"},
            {"Compare today's marks by tier or as one combined daily score.", "Compare les marques d'aujourd'hui par niveau ou comme un score quotidien combiné."},
            {"All daily tiers", "Tous les niveaux quotidiens"},
            {"Grid Size", "Taille de la grille"},
            {"Custom", "Personnalisé"},
            {"Width", "Largeur"},
            {"Height", "Hauteur"},
            {"States", "États"},
            {"states", "états"},
            {"Tap Pattern", "Motif de toucher"},
            {"Difficulty", "Difficulté"},
            {"Cross", "Croix"},
            {"Diagonal", "Diagonale"},
            {"Square", "Carré"},
            {"Horizontal line", "Ligne horizontale"},
            {"Vertical line", "Ligne verticale"},
            {"Self only", "Soi seulement"},
            {"Knight", "Cavalier"},
            {"Random mixed", "Mélange aléatoire"},
            {"Mixed patterns", "Motifs mixtes"},
            {"Edit Tool", "Outil d'édition"},
            {"Tap Tiles", "Toucher les tuiles"},
            {"Paint White", "Peindre en blanc"},
            {"Paint Color", "Peindre une couleur"},
            {"Paint States", "Peindre les états"},
            {"Lock Tiles", "Verrouiller les tuiles"},
            {"Place Holes", "Placer des trous"},
            {"Starting Board", "Plateau initial"},
            {"Puzzle Code", "Code de casse-tête"},
            {"Share", "Partager"},
            {"Load Code", "Charger le code"},
            {"Copy Code", "Copier le code"},
            {"Paste Code", "Coller le code"},
            {"Clear Board", "Effacer le plateau"},
            {"Play", "Jouer"},
            {"Sandbox", "Bac libre"},
            {"No goal", "Sans objectif"},
            {"Puzzle code copied.", "Code copié."},
            {"Puzzle code loaded.", "Code chargé."},
            {"Puzzle code not recognized.", "Code non reconnu."},
            {"Clipboard has no puzzle code.", "Le presse-papiers n'a pas de code de casse-tête."},
            {"Keep at least one tile.", "Garde au moins une tuile."},
            {"Hints are off in Playground.", "Les indices sont désactivés dans le bac à sable."},
            {"Tiles with lock icons", "Tuiles avec cadenas"},
            {"Irregular board", "Grille irrégulière"},
            {"Extras", "Extras"},
            {"Unique preferred", "Solution unique préférée"},
            {"Create Puzzle", "Créer un casse-tête"},
            {"ON", "OUI"},
            {"OFF", "NON"},
            {"on", "oui"},
            {"off", "non"},
            {"Lock icons", "Cadenas"},
            {"Empty holes", "Trous vides"},
            {"Sound", "Son"},
            {"Vibration", "Vibration"},
            {"Show numbers on tiles", "Afficher les nombres sur les tuiles"},
            {"Show numbers in Playground", "Afficher les nombres dans le bac à sable"},
            {"Language", "Langue"},
            {"About", "À propos"},
            {"Options", "Options"},
            {"Version", "Version"},
            {"Changelog", "Journal des changements"},
            {"Complete", "Terminé"},
            {"Level Complete", "Niveau terminé"},
            {"Taps Used", "Touchers utilisés"},
            {"Minimum", "Minimum"},
            {"Mark", "Marque"},
            {"Best Taps", "Meilleur score"},
            {"Time", "Temps"},
            {"Next Level", "Niveau suivant"},
            {"New Puzzle", "Nouveau casse-tête"},
            {"Leaderboard", "Classement"},
            {"Replay", "Rejouer"},
            {"Reset", "Réinitialiser"},
            {"Menu", "Menu"},
            {"Taps", "Touchers"},
            {"Pattern", "Motif"},
            {"Goal", "Objectif"},
            {"All tiles white", "Toutes blanches"},
            {"Tap effect", "Effet du toucher"},
            {"View", "Voir"},
            {"Tap effect (not the goal)", "Effet du toucher (pas l’objectif)"},
            {"Mixed tap effects", "Effets de toucher mixtes"},
            {"This preview shows which tiles one tap changes.", "Cet aperçu montre quelles tuiles sont modifiées par un toucher."},
            {"Goal: make every tile white.", "Objectif : rendre toutes les tuiles blanches."},
            {"Playground has no completion goal.", "Le bac à sable n’a pas d’objectif de fin."},
            {"On mixed boards, match each tappable tile's symbol to an effect above.", "Sur les plateaux mixtes, associe le symbole de chaque tuile touchable à l’un des effets ci-dessus."},
            {"Hold a tile to preview the exact effect before tapping.", "Maintiens une tuile appuyée pour voir l’effet exact avant de la toucher."},
            {"Tap pattern info", "Info sur le motif de toucher"},
            {"When you tap a tile, this pattern is centered on that tile. Every tile inside the pattern changes state.", "Quand tu touches une tuile, ce motif se centre sur cette tuile. Chaque tuile dans le motif change d'état."},
            {"The green outline matches the preview you see when you hold a tile.", "Le contour vert correspond à l'aperçu visible quand tu gardes une tuile appuyée."},
            {"Personal Best", "Meilleur score"},
            {"Leaderboard try", "Essai de classement"},
            {"No reset or hints", "Pas de réinitialisation ni d'indices"},
            {"Exit daily challenge?", "Quitter le défi quotidien ?"},
            {"This is your first try. Exiting now records 0 for this daily leaderboard. You can replay afterward, but only this try counts.", "C'est ton premier essai. Quitter maintenant inscrit 0 dans ce classement quotidien. Tu pourras rejouer ensuite, mais seul cet essai compte."},
            {"Keep Playing", "Continuer"},
            {"Exit for 0", "Quitter pour 0"},
            {"Best:", "Meilleur :"},
            {"Not played today", "Pas joué aujourd'hui"},
            {"taps", "touchers"},
            {"First try:", "Premier essai :"},
            {"Replays open", "Reprises ouvertes"},
            {"First try counts", "Le premier essai compte"},
            {"Previewing this tap.", "Aperçu de ce toucher."},
            {"Hint applied. Red tiles changed. This try is worth 0 stars.", "Indice appliqué. Les tuiles rouges ont changé. Cet essai vaut 0 étoile."},
            {"No useful tap is available.", "Aucun toucher utile disponible."},
            {"Binary Beginnings", "Débuts binaires"},
            {"Fourfold Flips", "Basculements quadruples"},
            {"Lights With Lock Icons", "Lumières avec cadenas"},
            {"Lockstep Squares", "Carrés synchronisés"},
            {"First Empty Holes", "Premiers trous vides"},
            {"Binary Breakaways", "Échappées binaires"},
            {"Fivefold Binary", "Binaire quintuple"},
            {"Three-Color Start", "Départ tricolore"},
            {"Triple Grid", "Grille triple"},
            {"Three Lock-Icon Tiles", "Trois tuiles avec cadenas"},
            {"Three Empty Holes", "Trois trous vides"},
            {"Triple Combine", "Combinaison triple"},
            {"Pattern Primer", "Premiers motifs"},
            {"Patterns With Lock Icons", "Motifs avec tuiles à cadenas"},
            {"Color Gauntlet", "Défi des couleurs"},
            {"Four-State Start", "Départ à quatre états"},
            {"Four-State Lock-Icon Tiles", "Tuiles avec cadenas à quatre états"},
            {"Four-State Empty Holes", "Trous vides à quatre états"},
            {"Four-State Patterns", "Motifs à quatre états"},
            {"Four-State Matrix", "Matrice à quatre états"},
            {"Five-State Start", "Départ à cinq états"},
            {"Five-State Lock-Icon Tiles", "Tuiles avec cadenas à cinq états"},
            {"Five-State Empty Holes", "Trous vides à cinq états"},
            {"Five-State Patterns", "Motifs à cinq états"},
            {"Dense Dimensions", "Dimensions denses"},
            {"Prime Pressure", "Pression première"},
            {"Modular Maze", "Labyrinthe modulaire"},
            {"Wide Matrix", "Matrice large"},
            {"Endgame Circuit", "Circuit final"},
            {"Final Inversion", "Inversion finale"},
            {"Clear the board", "Vide le plateau"},
            {"Turn every tile white. A single tap can change several tiles at once.", "Le but est de rendre toutes les tuiles blanches. Un seul appui peut en changer plusieurs à la fois."},
            {"Before you tap, hold a tile to see where its pattern reaches.", "Avant de jouer, garde le doigt sur une tuile pour voir quelles tuiles son motif atteint."},
            {"1. Read the colors", "1. Repère les couleurs"},
            {"White is the color you want every tile to reach.", "Chaque tuile doit finir sur le blanc."},
            {"A white tile can still change color if another tap reaches it.", "Une tuile déjà blanche peut reprendre une couleur si un autre appui l’atteint."},
            {"You solve the puzzle when all the tiles are white at once.", "Tu as gagné quand toutes les tuiles sont blanches en même temps."},
            {"2. Follow the color cycle", "2. Suis le cycle des couleurs"},
            {"Tap an unlocked tile. Its pattern tells you which tiles will change.", "Appuie sur une tuile sans cadenas. Son motif indique quelles tuiles vont changer."},
            {"Each tile in the pattern moves on to its next color.", "Chaque tuile touchée par le motif passe à la couleur suivante."},
            {"After the last color comes white again.", "Après la dernière couleur, on revient au blanc."},
            {"3. Check the pattern", "3. Regarde le motif"},
            {"Look for crosses, diagonals, squares, rows, columns and even chess knight moves. Some boards mix several patterns.", "Tu trouveras des croix, des diagonales, des carrés, des lignes, des colonnes et même des sauts de cavalier comme aux échecs. Certains plateaux combinent plusieurs motifs."},
            {"Hold a tile to preview its pattern. Lift your finger when you’re done looking.", "Garde le doigt sur une tuile pour voir son motif, puis relève-le quand tu as fini de regarder."},
            {"4. Locks and holes", "4. Cadenas et trous"},
            {"A locked tile still has to turn white.", "Les tuiles avec un cadenas doivent elles aussi devenir blanches."},
            {"To change it, tap another tile whose pattern reaches it.", "Pour changer une tuile verrouillée, appuie sur une autre tuile dont le motif l’atteint."},
            {"A hole is just a gap in the board. Tap patterns skip it.", "Un trou est une place vide sur le plateau. Les motifs passent par-dessus."},
            {"Choose your puzzle", "Choisis ton casse-tête"},
            {"Campaign: Pick a group on the 5 × 5 map. Earn 15 stars there to unlock the groups directly beside it, above it and below it.", "Campagne : Choisis un groupe sur la carte de 5 × 5. Gagne 15 étoiles dans ce groupe pour débloquer ses voisins de gauche, de droite, du haut et du bas."},
            {"Custom Level: Choose the board size, number of colors, pattern and difficulty. You can add locks and holes. The game looks for a puzzle with a unique solution when it can.", "Niveau personnalisé : Choisis la taille du plateau, le nombre de couleurs, le motif et la difficulté. Tu peux ajouter des cadenas et des trous. Le jeu essaie de te proposer un casse-tête à solution unique."},
            {"Playground: Build your own board and share it with a puzzle code. You can keep experimenting even after every tile turns white.", "Bac à sable : Crée ton propre plateau et partage-le grâce à son code. Tu peux continuer à essayer des coups même quand tout le plateau est blanc."},
            {"Daily Challenge: Everyone gets the same three puzzles each day. Each one keeps its own best score.", "Défi quotidien : Chaque jour, tout le monde reçoit les trois mêmes casse-têtes. Ton meilleur score est enregistré pour chacun."},
            {"Taps, stars, and hints", "Coups, étoiles et indices"},
            {"Previewing a pattern is free. Your tap counts when the tiles change.", "Tu peux regarder un motif sans dépenser de coup. Le coup compte quand les tuiles changent."},
            {"For three stars, solve the puzzle in as few taps as the game’s best known solution, or fewer.", "Pour gagner trois étoiles, termine en autant de coups que la meilleure solution trouvée par le jeu, ou en moins."},
            {"The one- and two-star targets leave room for extra taps.", "Les objectifs à une et deux étoiles te laissent quelques coups de plus."},
            {"Undo takes back your last tap. Reset puts the board back the way it started.", "Annuler retire ton dernier coup. Réinitialiser remet le plateau dans son état de départ."},
            {"A hint plays one tap for you. You can still finish that attempt, but it earns no stars.", "Un indice joue un coup pour toi. Tu peux terminer cet essai, mais tu n’y gagneras pas d’étoiles."},
            {"Look for the red outlines to see which tiles the hint changed.", "Un contour rouge indique les tuiles que l’indice a changées."},
            {"Turn sound effects on or off in Settings.", "Dans les paramètres, tu peux activer ou couper les sons du jeu."},
            {"If you prefer numbers, turn them on to see each tile’s state alongside its color.", "Si tu préfères les chiffres, affiche-les pour lire l’état des tuiles en plus de leur couleur."},
            {"On Android, you can also turn vibration on or off.", "Sur Android, tu peux aussi activer ou couper les vibrations."},
            {"What happens when you add up the taps?", "Que se passe-t-il quand on additionne les effets des coups ?"},
            {"Take a board with just two colors. Tap the center of a cross and every tile in the cross switches between white and blue. Tap the same spot again and you’re back where you started. The same rule works with other patterns. With more colors, it takes more taps to go all the way around the cycle.", "Imagine un plateau à deux couleurs. Appuie au centre d’une croix et chacune de ses tuiles passe du blanc au bleu ou du bleu au blanc. Appuie une seconde fois au même endroit et tu retrouves le plateau de départ. Le principe vaut aussi pour d’autres motifs ou d’autres couleurs. Avec plus de couleurs, le cycle est simplement plus long."},
            {"The board in one equation", "Le plateau en une équation"},
            {"Give white the number 0 and count up through the colors. On a board with n colors, the next step after n-1 is 0 again. This is arithmetic modulo n, written in the ring R=Z/nZ.", "Associe le nombre 0 au blanc, puis numérote les autres couleurs dans l’ordre. Avec n couleurs, après n-1 on revient à 0. C’est l’arithmétique modulo n, dans l’anneau R=Z/nZ."},
            {"Now read the tiles in a fixed order. Their numbers form the board vector s. Put the effect of each possible tap in a column of a matrix A. If x records how often you tap each unlocked tile, Ax gives the total change. You win when s+Ax=0.", "Lis les tuiles dans un ordre fixe. Leurs valeurs forment le vecteur du plateau s. Place l’effet de chaque appui possible dans une colonne d’une matrice A. Si x compte les appuis sur chaque tuile, Ax donne le changement total. Tu gagnes quand s+Ax=0."},
            {"From two states to many", "De deux états à plusieurs"},
            {"In the classic Lights Out puzzle, a tap flips the chosen tile and its neighbors above, below, left and right. Each flip adds 1 modulo 2. Two taps in the same spot cancel because 1+1=0 modulo 2.", "Dans le jeu Lights Out, un appui inverse la tuile choisie et ses voisines du haut, du bas, de gauche et de droite. Chaque changement ajoute 1 modulo 2. Deux appuis au même endroit s’annulent, car 1+1=0 modulo 2."},
            {"Invert the Matrix adds more states and patterns, but tap effects still add together. Skip holes when you list the tiles. Include locked tiles, since a tap on another tile can change them.", "Invert the Matrix ajoute des états et des motifs, mais les effets des appuis s’additionnent toujours. Dans la liste des tuiles, laisse de côté les trous et garde les tuiles verrouillées, puisqu’un appui ailleurs peut les changer."},
            {"Can you combine the available taps to cancel the starting board? The change you need is -s.", "Peux-tu combiner les appuis possibles pour annuler le plateau de départ ? Le changement à obtenir est -s."},
            {"1. The board is a vector", "1. Le plateau est un vecteur"},
            {"Number the m tiles p_1,…,p_m in any fixed order. Write their states in that same order to get s=(s_1,…,s_m) ∈ R^m. Each entry s_i is the color of tile p_i. An all-white board is the zero vector.", "Numérote les m tuiles p_1,…,p_m dans l’ordre de ton choix. Écris leurs états dans ce même ordre pour obtenir s=(s_1,…,s_m) ∈ R^m. La composante s_i indique la couleur de la tuile p_i. Un plateau tout blanc correspond au vecteur nul."},
            {"2. Each tap contributes a column", "2. Une colonne par appui possible"},
            {"Label the r tiles you can tap q_1,…,q_r. Tap q_j once and record a 1 for each tile that changes and a 0 for each tile that stays the same. The result is its effect vector v_j, column j of A.", "Appelle q_1,…,q_r les r tuiles sur lesquelles tu peux appuyer. Appuie une fois sur q_j, puis note 1 pour chaque tuile qui change et 0 pour celles qui restent en place. Tu obtiens son vecteur d’effet v_j, la colonne j de A."},
            {"Read across a row to see which taps affect one tile. Read down a column to see which tiles one tap affects. A locked tile has a row of its own, but you can’t tap it, so it has no column.", "Une ligne indique quels appuis font changer une tuile. Une colonne indique quelles tuiles changent sous l’effet d’un appui. Une tuile verrouillée a sa ligne, mais comme tu ne peux pas appuyer dessus, elle n’a pas de colonne."},
            {"How many times should you tap each tile?", "Combien de fois appuyer sur chaque tuile ?"},
            {"The tap-count vector x=(x_1,…,x_r) records how often you tap each unlocked tile, modulo n. Each tap on q_j adds the same v_j, so together the taps add Ax=∑_j x_jv_j. You can play them in any order.", "Le vecteur des appuis x=(x_1,…,x_r) compte les appuis sur chaque tuile déverrouillée, modulo n. Chaque appui sur q_j ajoute le même vecteur v_j. Le changement total vaut donc Ax=∑_j x_jv_j, quel que soit l’ordre des appuis."},
            {"The final board is s+Ax. To make it all white, look for a vector x that solves Ax=-s in R.", "Le plateau final est s+Ax. Pour le rendre tout blanc, cherche un vecteur x qui vérifie Ax=-s dans R."},
            {"When does a solution exist?", "Quand existe-t-il une solution ?"},
            {"Every tap-count vector produces a change Ax. All those changes together form the image of A, written Im(A). A board has a solution exactly when -s belongs to this image.", "Chaque vecteur des appuis produit un changement Ax. L’ensemble de ces changements est l’image de A, notée Im(A). Le plateau admet une solution si et seulement si -s appartient à cette image."},
            {"When n is prime, you can check by row reducing the augmented matrix [A | -s] to echelon form. A row saying 0=c with c ≠ 0 rules out a solution. If no such row appears, you can read off at least one solution by back substitution.", "Si n est premier, mets la matrice augmentée [A | -s] sous forme échelonnée par des opérations sur les lignes. Une ligne qui dit 0=c avec c ≠ 0 exclut toute solution. Sinon, tu peux trouver une solution en remontant le système."},
            {"Prime numbers and fields", "Nombres premiers et corps"},
            {"With 2, 3 or 5 states, R is a field. Every nonzero element has a multiplicative inverse, so you can divide by it. With four states, even a simple division by 2 can go wrong. We’ll see why below.", "Avec 2, 3 ou 5 états, R est un corps. Tout élément non nul a un inverse pour la multiplication, ce qui permet de diviser par cet élément. Avec quatre états, même une division par 2 pose problème. On verra pourquoi un peu plus loin."},
            {"What changes with four states?", "Qu’est-ce qui change avec quatre états ?"},
            {"When n is composite, R is still a ring, but some nonzero elements have no multiplicative inverse. For example, modulo 4, twice any number is even, so 2a can never equal 1. You can’t divide a row by 2 here.", "Si n est composé, R reste un anneau, mais certains éléments non nuls n’ont pas d’inverse pour la multiplication. Par exemple, modulo 4, un double est toujours pair. Ainsi 2a ne vaut jamais 1, et on ne peut pas diviser une ligne par 2."},
            {"The test for a solution is still -s ∈ Im(A). Use row operations valid in the ring. If n factors into coprime prime powers, you can also solve modulo each of those powers and combine the results.", "Le critère reste -s ∈ Im(A). Utilise des opérations sur les lignes valables dans cet anneau. Si n est un produit de puissances de nombres premiers distincts, on peut aussi résoudre le système modulo chacune de ces puissances, puis combiner les résultats."},
            {"When is the solution unique?", "Quand la solution est-elle unique ?"},
            {"Suppose x_0 solves the board. If a tap-count vector z leaves the board unchanged, then Az=0 and x_0+z also solves it. These vectors z form the kernel of A, written ker(A). Adding each of them to x_0 gives all the solutions.", "Suppose que x_0 soit une solution. Si un vecteur des appuis z laisse le plateau inchangé, alors Az=0 et x_0+z est aussi une solution. Ces vecteurs z forment le noyau de A, noté ker(A). En ajoutant chacun d’eux à x_0, on obtient toutes les solutions."},
            {"Remember that counts are taken modulo n. Tapping one tile n extra times takes its whole pattern around the color cycle. It leaves both the board and the tap-count vector unchanged.", "On compte les appuis modulo n. Si tu appuies n fois de plus sur une tuile, toutes les tuiles de son motif font un tour complet du cycle. Le plateau et le vecteur des appuis restent les mêmes."},
            {"So a solvable board has exactly one tap-count vector when ker(A)={0}. Over a field, this means the columns of A are linearly independent. The kernel test also works in the four-state ring.", "Un plateau résoluble admet donc un unique vecteur des appuis si et seulement si ker(A)={0}. Sur un corps, cela signifie que les colonnes de A sont linéairement indépendantes. Le critère du noyau vaut aussi dans l’anneau à quatre états."},
            {"When is A invertible?", "Quand A est-elle inversible ?"},
            {"If you can tap every tile, A has one row and one column per tile, so it is square. Holes leave that count balanced. A lock removes a column and keeps the row. When a square A is invertible, every starting board has exactly one tap-count solution.", "Si tu peux appuyer sur chaque tuile, A a autant de lignes que de colonnes et elle est carrée. Les trous préservent cette égalité. Un cadenas supprime une colonne et conserve la ligne. Si la matrice carrée A est inversible, chaque plateau de départ admet un unique vecteur des appuis qui le résout."},
            {"A square A is invertible exactly when its determinant has a multiplicative inverse in R. For prime n, the determinant must be nonzero modulo n. For n=4, it must be odd. If this test fails, some starting boards have no solution and others have several. For a rectangular matrix, use the image to test existence and the kernel to test uniqueness.", "Une matrice carrée A est inversible si et seulement si son déterminant est inversible dans R. Pour n premier, il doit être non nul modulo n. Pour n=4, il doit être impair. Si ce critère échoue, certains plateaux n’ont aucune solution et d’autres en ont plusieurs. Pour une matrice rectangulaire, l’image permet de tester l’existence d’une solution et le noyau son unicité."},
            {"Counting the taps in a solution", "Compter les coups d’une solution"},
            {"To play a solution, take each count x_j as a number from 0 to n-1. Call that number t_j. Add these numbers as ordinary integers to get the number of taps, ℓ(x). The shortest solution the game has found sets the three-star target.", "Pour jouer une solution, représente chaque composante x_j par un nombre de 0 à n-1, noté t_j. Additionne ces nombres comme des entiers pour obtenir le nombre de coups, ℓ(x). La solution la plus courte trouvée par le jeu fixe l’objectif des trois étoiles."},
            {"How the game finds a short solution", "Comment le jeu cherche une solution courte"},
            {"If the board has few enough possible states, the game searches all positions one tap away, then two taps away, and so on. The first time it reaches an all-white board, it has found the fewest taps possible.", "Quand le plateau a assez peu de configurations possibles, le jeu explore d’abord celles à un coup, puis celles à deux coups, et ainsi de suite. La première fois qu’il atteint un plateau tout blanc, il a trouvé le minimum de coups."},
            {"For larger boards with a prime number of states per tile, the game row reduces Ax=-s. If there are few enough solutions to try, it compares them all and keeps one with the fewest taps. When an exact search is too large, including on large four-state boards, it uses a known solution whose length may be above the minimum.", "Pour les grands plateaux où le nombre d’états par tuile est premier, le jeu réduit le système Ax=-s par opérations sur les lignes. Si les solutions sont assez peu nombreuses, il les compare toutes et en garde une qui demande le moins de coups. Quand la recherche exacte est trop longue, notamment sur les grands plateaux à quatre états, il utilise une solution connue qui peut dépasser le minimum."},
            {"Different tap-count vectors can tie for the minimum, and you can play the same vector in different orders. When the game proves a minimum, it always picks the same plan among those tied for shortest. It doesn’t tell you whether another plan ties with it.", "Plusieurs vecteurs des appuis peuvent atteindre le même minimum, et tu peux jouer un même vecteur dans des ordres différents. Quand le jeu établit le minimum, il choisit toujours le même plan parmi les plus courts. Il n’indique pas si un autre fait aussi bien."},
            {"Locked tiles and holes in the matrix", "Les cadenas et les trous dans la matrice"},
            {"To model a hole, leave that position out entirely. To model a lock, keep the tile’s entry in s and its row in A, since it still has to turn white. Leave out its column. The remaining columns tell you which other taps can change it.", "Pour représenter un trou, laisse cette position de côté. Pour un cadenas, garde la composante de la tuile dans s et sa ligne dans A, car elle doit devenir blanche. Supprime sa colonne. Les autres colonnes indiquent quels appuis peuvent encore la changer."},
            {"How puzzles are made", "Comment les casse-têtes sont créés"},
            {"The generator starts with a white board and scrambles it with allowed taps. It keeps track of how to undo their combined effect, so the starting board comes with a solution. When it can, the solver finds a shortest plan for the star targets. A hint plays one tap toward a solution and outlines the tiles it changed in red.", "Le jeu part d’un plateau blanc et le mélange avec des appuis autorisés. Il garde de quoi annuler leur effet cumulé. Le plateau obtenu a donc déjà une solution. Quand il le peut, le jeu trouve un plan de longueur minimale pour fixer les objectifs d’étoiles. Un indice joue un coup vers la solution et entoure en rouge les tuiles modifiées."},
            {"What the symbols mean", "Que signifient les symboles ?"},
            {"modulus / tile states", "module / états des tuiles"},
            {"board vector in (Z/nZ)^m", "vecteur du plateau dans (Z/nZ)^m"},
            {"columns are effect vectors", "colonnes de vecteurs d'effet"},
            {"tap-count vector in (Z/nZ)^r", "vecteur de touchers dans (Z/nZ)^r"},
            {"reachable board changes", "changements de plateau atteignables"},
            {"tap-count vectors with A x = 0", "vecteurs de touchers avec A x = 0"},
            {"values wrap after n - 1", "les valeurs reviennent après n - 1"},
            {"if tap j changes tile i", "si le toucher j change la tuile i"},
            {"otherwise", "sinon"},
            {"number of taps on tile j", "nombre de touchers sur la tuile j"},
            {"solution exists iff", "solution existe ssi"},
            {"solutions", "solutions"},
            {"is a field", "est un corps"},
            {"You can now play in Korean. We also rewrote How to Play and the math guide, from your first tap to the equations behind a solution.", "Tu peux désormais jouer en coréen. Nous avons retravaillé les règles du jeu et le guide de mathématiques, du premier geste aux équations qui permettent de résoudre un plateau."},
            {"Improved Android 16 compatibility, system Back navigation, and screen layout around system bars. The Android app now requires Android 7 or later.", "Amélioration de la compatibilité avec Android 16, du retour système et de la disposition de l'écran autour des barres système. L'application Android nécessite désormais Android 7 ou une version ultérieure."},
            {"Updated AndroidX Activity and Fragment dependencies to current supported releases for Play compatibility.", "Mise à jour des dépendances AndroidX Activity et Fragment vers les versions prises en charge actuelles pour Google Play."},
            {"Android now targets Android 16, keeps system Back navigation reliable, and makes the all-white goal clear with tap-effect help available on demand.", "L’application cible désormais Android 16, maintient un retour système fiable et clarifie l’objectif de rendre toutes les tuiles blanches, avec une aide sur l’effet de toucher disponible à la demande."},
            {"The main menu now includes Achievements, the animated board is larger, and Android opens Play Games achievement status while the web app shows campaign achievement progress.", "Le menu principal inclut maintenant Succès, le plateau animé est plus grand, et Android ouvre l'état des succès Play Games tandis que la version web affiche la progression des succès de campagne."},
            {"First production release with campaign levels, daily challenges, custom puzzles, Playground boards, hints, stars, and Play Games achievements.", "Première version de production avec niveaux de campagne, défis quotidiens, casse-têtes personnalisés, plateaux de bac à sable, indices, étoiles et succès Play Games."},
            {"Added a separate setting for Playground tile numbers, keeping Playground boards number-free unless it is turned on.", "Ajout d'un réglage séparé pour les nombres des tuiles du bac à sable, afin que les plateaux du bac à sable restent sans nombres sauf si ce réglage est activé."},
            {"The Android release is prepared with version code 12, native debug symbols for Play Console crash reports, and refreshed changelog notes for the latest Play Store build.", "La version Android est préparée avec le code de version 12, les symboles de débogage natifs pour les rapports de plantage Play Console et des notes d'historique mises à jour pour la dernière compilation Play Store."},
            {"Playground adds shareable puzzle codes, campaign now uses a 5x5 group map, and the Playground logo is now a tile-colored basketball. Menu headers, locks, and text-size controls were polished across web and Android.", "Le bac à sable ajoute des codes de casse-tête à partager, la campagne utilise une carte de groupes 5x5, et le logo du bac à sable est maintenant un ballon de basket aux couleurs des tuiles. Les en-têtes de menu, cadenas et contrôles de taille du texte ont été améliorés sur web et Android."},
            {"Daily challenges now separate puzzle cards from leaderboards, custom setup uses visual pattern chips with unique generation always on, and game/result screens are clearer.", "Les défis quotidiens séparent désormais les cartes de casse-têtes des classements, la configuration personnalisée utilise des puces visuelles de motif avec génération unique toujours active, et les écrans de jeu et de résultat sont plus clairs."},
            {"Settings now hide platform-specific controls, animation and colorblind-symbol toggles were removed, and About shows version history with the GitHub link.", "Les paramètres masquent désormais les contrôles propres à chaque plateforme, les options d'animation et de symboles daltoniens ont été retirées, et À propos affiche l'historique avec le lien GitHub."},
            {"Release builds keep native debug symbols for Play Console crash reports.", "Les builds de publication conservent les symboles de débogage natifs pour les rapports de plantage Play Console."},
            {"The Math guide explains solution uniqueness and matrix invertibility.", "Le guide des maths explique quand une solution est unique et quand la matrice est inversible."}
    };
    static const std::unordered_map<std::string, std::string> ko = {
#include "korean_ui.inc"
#include "korean_guide.inc"
    };
    if (language == "ko") return ko;
    if (language == "es") return es;
    if (language == "fr") return fr;
    static const std::unordered_map<std::string, std::string> empty;
    return empty;
}

std::string tr(AppState *s, const std::string &text) {
    if (!s || s->language == "en") return text;
    const auto &table = translationTable(s->language);
    auto it = table.find(text);
    return it == table.end() ? text : it->second;
}

std::string onOff(AppState *s, bool value) {
    return tr(s, value ? "ON" : "OFF");
}

int languageIndex(const std::string &code) {
    for (int i = 0; i < static_cast<int>(std::size(languages)); ++i) {
        if (code == languages[i].code) return i;
    }
    return 0;
}

std::string localizedPatternLabel(AppState *s, const std::string &key) {
    return tr(s, patternLabel(key));
}

std::string localizedPatternBadge(AppState *s, const Pattern &pattern) {
    return tr(s, pattern.badge);
}

std::string localizedDifficulty(AppState *s, const std::string &difficulty) {
    return tr(s, difficulty);
}

std::string dailyTierLabel(int tier);

std::string localizedDailyTierLabel(AppState *s, int tier) {
    return tr(s, dailyTierLabel(tier));
}

float dp(AppState *s, float v) { return v * s->density; }
float safeTop(AppState *s) { return std::max(dp(s, 70), static_cast<float>(s->renderer.safeInsets.top)); }
float safeBottom(AppState *s) { return std::max(dp(s, 30), static_cast<float>(s->renderer.safeInsets.bottom)); }

bool scrollable(Screen screen) {
    return screen == Screen::Main || screen == Screen::Campaign || screen == Screen::Freeplay ||
           screen == Screen::Playground ||
           screen == Screen::HowTo || screen == Screen::Daily || screen == Screen::Math ||
           screen == Screen::Settings || screen == Screen::About;
}

float maxScrollOffset(AppState *s) {
    return std::max(0.0f, s->contentHeight - s->renderer.height + safeBottom(s));
}

float clampScrollOffset(AppState *s, float value) {
    float maxScroll = maxScrollOffset(s);
    return std::max(0.0f, std::min(maxScroll, value));
}

void stopScrollMomentum(AppState *s) {
    s->scrollVelocity = 0.0f;
    s->lastScrollFrameTime = 0;
}

bool nearViewport(AppState *s, Rect rect, float marginDp = 72.0f) {
    float margin = dp(s, marginDp);
    return rect.y < s->renderer.height + margin && rect.y + rect.h > -margin;
}

bool readAssetBytes(AppState *s, const char *path, std::vector<unsigned char> &out) {
    if (!s || !s->native || !s->native->activity || !s->native->activity->assetManager) return false;
    AAsset *asset = AAssetManager_open(s->native->activity->assetManager, path, AASSET_MODE_BUFFER);
    if (!asset) return false;
    off_t size = AAsset_getLength(asset);
    if (size <= 0) {
        AAsset_close(asset);
        return false;
    }
    out.resize(static_cast<size_t>(size));
    size_t total = 0;
    while (total < out.size()) {
        int read = AAsset_read(asset, out.data() + total, out.size() - total);
        if (read <= 0) break;
        total += static_cast<size_t>(read);
    }
    AAsset_close(asset);
    if (total != out.size()) {
        out.clear();
        return false;
    }
    return true;
}

struct JsonValue {
    enum class Type { Null, Bool, Number, String, Array, Object };
    Type type = Type::Null;
    bool boolean = false;
    double number = 0.0;
    std::string text;
    std::vector<JsonValue> array;
    std::map<std::string, JsonValue> object;
};

struct JsonParser {
    const std::string &src;
    size_t pos = 0;

    explicit JsonParser(const std::string &input) : src(input) {}

    JsonValue parse() {
        JsonValue value = parseValue();
        skipWhitespace();
        if (pos != src.size()) fail("Unexpected trailing data");
        return value;
    }

    void fail(const char *message) const {
        throw std::runtime_error(message);
    }

    void skipWhitespace() {
        while (pos < src.size() && std::isspace(static_cast<unsigned char>(src[pos]))) ++pos;
    }

    bool consume(char expected) {
        skipWhitespace();
        if (pos < src.size() && src[pos] == expected) {
            ++pos;
            return true;
        }
        return false;
    }

    bool consumeLiteral(const char *literal) {
        skipWhitespace();
        size_t len = std::strlen(literal);
        if (src.compare(pos, len, literal) == 0) {
            pos += len;
            return true;
        }
        return false;
    }

    JsonValue parseValue() {
        skipWhitespace();
        if (pos >= src.size()) fail("Unexpected end of JSON");
        char c = src[pos];
        if (c == '{') return parseObject();
        if (c == '[') return parseArray();
        if (c == '"') {
            JsonValue value;
            value.type = JsonValue::Type::String;
            value.text = parseString();
            return value;
        }
        if (c == '-' || (c >= '0' && c <= '9')) return parseNumber();
        if (consumeLiteral("true")) {
            JsonValue value;
            value.type = JsonValue::Type::Bool;
            value.boolean = true;
            return value;
        }
        if (consumeLiteral("false")) {
            JsonValue value;
            value.type = JsonValue::Type::Bool;
            value.boolean = false;
            return value;
        }
        if (consumeLiteral("null")) return {};
        fail("Invalid JSON value");
        return {};
    }

    JsonValue parseObject() {
        JsonValue value;
        value.type = JsonValue::Type::Object;
        if (!consume('{')) fail("Expected object");
        if (consume('}')) return value;
        while (true) {
            skipWhitespace();
            if (pos >= src.size() || src[pos] != '"') fail("Expected object key");
            std::string key = parseString();
            if (!consume(':')) fail("Expected ':' after object key");
            value.object[key] = parseValue();
            if (consume('}')) break;
            if (!consume(',')) fail("Expected ',' in object");
        }
        return value;
    }

    JsonValue parseArray() {
        JsonValue value;
        value.type = JsonValue::Type::Array;
        if (!consume('[')) fail("Expected array");
        if (consume(']')) return value;
        while (true) {
            value.array.push_back(parseValue());
            if (consume(']')) break;
            if (!consume(',')) fail("Expected ',' in array");
        }
        return value;
    }

    std::string parseString() {
        if (pos >= src.size() || src[pos] != '"') fail("Expected string");
        ++pos;
        std::string out;
        while (pos < src.size()) {
            char c = src[pos++];
            if (c == '"') return out;
            if (c != '\\') {
                out.push_back(c);
                continue;
            }
            if (pos >= src.size()) fail("Invalid string escape");
            char escaped = src[pos++];
            if (escaped == '"' || escaped == '\\' || escaped == '/') out.push_back(escaped);
            else if (escaped == 'b') out.push_back('\b');
            else if (escaped == 'f') out.push_back('\f');
            else if (escaped == 'n') out.push_back('\n');
            else if (escaped == 'r') out.push_back('\r');
            else if (escaped == 't') out.push_back('\t');
            else if (escaped == 'u') {
                if (pos + 4 > src.size()) fail("Invalid unicode escape");
                pos += 4;
                out.push_back('?');
            } else {
                fail("Invalid string escape");
            }
        }
        fail("Unterminated string");
        return out;
    }

    JsonValue parseNumber() {
        size_t start = pos;
        if (src[pos] == '-') ++pos;
        while (pos < src.size() && std::isdigit(static_cast<unsigned char>(src[pos]))) ++pos;
        if (pos < src.size() && src[pos] == '.') {
            ++pos;
            while (pos < src.size() && std::isdigit(static_cast<unsigned char>(src[pos]))) ++pos;
        }
        if (pos < src.size() && (src[pos] == 'e' || src[pos] == 'E')) {
            ++pos;
            if (pos < src.size() && (src[pos] == '+' || src[pos] == '-')) ++pos;
            while (pos < src.size() && std::isdigit(static_cast<unsigned char>(src[pos]))) ++pos;
        }
        JsonValue value;
        value.type = JsonValue::Type::Number;
        value.number = std::strtod(src.c_str() + start, nullptr);
        return value;
    }
};

const JsonValue *jsonField(const JsonValue &value, const std::string &key) {
    if (value.type != JsonValue::Type::Object) return nullptr;
    auto it = value.object.find(key);
    return it == value.object.end() ? nullptr : &it->second;
}

int jsonInt(const JsonValue &value, int fallback = 0) {
    if (value.type == JsonValue::Type::Number) return static_cast<int>(std::lround(value.number));
    if (value.type == JsonValue::Type::String) return std::atoi(value.text.c_str());
    if (value.type == JsonValue::Type::Bool) return value.boolean ? 1 : 0;
    return fallback;
}

int jsonIntField(const JsonValue &value, const std::string &key, int fallback = 0) {
    const JsonValue *field = jsonField(value, key);
    return field ? jsonInt(*field, fallback) : fallback;
}

std::string jsonString(const JsonValue &value, const std::string &fallback = "") {
    if (value.type == JsonValue::Type::String) return value.text;
    return fallback;
}

std::string jsonStringField(const JsonValue &value, const std::string &key, const std::string &fallback = "") {
    const JsonValue *field = jsonField(value, key);
    return field ? jsonString(*field, fallback) : fallback;
}

std::vector<int> jsonIntArrayField(const JsonValue &value, const std::string &key) {
    std::vector<int> out;
    const JsonValue *field = jsonField(value, key);
    if (!field || field->type != JsonValue::Type::Array) return out;
    out.reserve(field->array.size());
    for (const JsonValue &item : field->array) out.push_back(jsonInt(item, 0));
    return out;
}

std::map<int, int> jsonIntMapField(const JsonValue &value, const std::string &key) {
    std::map<int, int> out;
    const JsonValue *field = jsonField(value, key);
    if (!field || field->type != JsonValue::Type::Object) return out;
    for (const auto &entry : field->object) {
        int idx = std::atoi(entry.first.c_str());
        int amount = jsonInt(entry.second, 0);
        if (amount) out[idx] = amount;
    }
    return out;
}

std::map<int, std::string> jsonStringMapField(const JsonValue &value, const std::string &key) {
    std::map<int, std::string> out;
    const JsonValue *field = jsonField(value, key);
    if (!field || field->type != JsonValue::Type::Object) return out;
    for (const auto &entry : field->object) {
        int idx = std::atoi(entry.first.c_str());
        std::string item = jsonString(entry.second);
        if (!item.empty()) out[idx] = item;
    }
    return out;
}

int campaignDifficultyRating(const JsonValue &level) {
    const JsonValue *field = jsonField(level, "difficultyRating");
    if (!field) return 0;
    if (field->type == JsonValue::Type::Number) return clampInt(jsonInt(*field, 0), 0, 3);
    std::string label = jsonString(*field);
    if (label == "Medium") return 1;
    if (label == "Hard") return 2;
    if (label == "Expert") return 3;
    return 0;
}

Puzzle campaignLevelFromJson(const JsonValue &level) {
    Puzzle p;
    p.levelId = jsonStringField(level, "levelId");
    p.name = jsonStringField(level, "name", "Level");
    p.campaignIndex = jsonIntField(level, "campaignIndex", 0);
    p.chapter = jsonIntField(level, "chapter", campaignGroupForLevel(p.campaignIndex) + 1);
    p.width = jsonIntField(level, "width", 5);
    p.height = jsonIntField(level, "height", 5);
    p.states = jsonIntField(level, "states", 2);
    p.defaultPattern = jsonStringField(level, "defaultPattern", "cross");

    for (int idx : jsonIntArrayField(level, "locked")) p.locked.insert(idx);
    for (int idx : jsonIntArrayField(level, "disabled")) p.disabled.insert(idx);
    p.tilePatterns = jsonStringMapField(level, "tilePatterns");

    int total = std::max(0, p.width * p.height);
    p.initial.assign(static_cast<size_t>(total), 0);
    const JsonValue *initial = jsonField(level, "initialState");
    if (initial && initial->type == JsonValue::Type::Array) {
        for (size_t i = 0; i < initial->array.size() && i < p.initial.size(); ++i) {
            p.initial[i] = mod(jsonInt(initial->array[i], 0), p.states);
        }
    }

    p.solution = normalized(jsonIntMapField(level, "knownSolution"), p.states);
    p.minimumMoves = std::max(1, jsonIntField(level, "minimumMoves", 1));
    p.targetMoves = std::max(1, jsonIntField(level, "targetMoves", p.minimumMoves + 2));
    p.difficultyRating = campaignDifficultyRating(level);
    p.scrambleMoves = std::max(1, sumCounts(p.solution));
    return p;
}

bool loadCampaignLevels(AppState *s) {
    std::vector<unsigned char> bytes;
    if (!readAssetBytes(s, "campaign-levels.json", bytes)) {
        LOGE("Unable to load campaign-levels.json. Campaign is unavailable until the bundled asset is restored.");
        return false;
    }
    try {
        std::string text(bytes.begin(), bytes.end());
        JsonParser parser(text);
        JsonValue root = parser.parse();
        if (jsonIntField(root, "campaignVersion", 0) != CAMPAIGN_PROGRESS_VERSION) {
            throw std::runtime_error("Campaign version mismatch");
        }
        const JsonValue *levels = jsonField(root, "levels");
        if (!levels || levels->type != JsonValue::Type::Array || levels->array.size() != CAMPAIGN_LEVEL_COUNT) {
            throw std::runtime_error("Campaign level count mismatch");
        }
        std::vector<Puzzle> parsed;
        parsed.reserve(levels->array.size());
        for (const JsonValue &level : levels->array) parsed.push_back(campaignLevelFromJson(level));
        s->campaignLevels = parsed;
        s->campaignLevelsLoaded = true;
        LOGI("Loaded %zu precomputed campaign levels.", s->campaignLevels.size());
        return true;
    } catch (const std::exception &error) {
        LOGE("Unable to parse campaign-levels.json: %s", error.what());
        s->campaignLevels.clear();
        s->campaignLevelsLoaded = false;
        return false;
    }
}

bool campaignLevelsReady(const AppState *s) {
    return s && s->campaignLevelsLoaded && s->campaignLevels.size() == CAMPAIGN_LEVEL_COUNT;
}

Puzzle campaignLevel(AppState *s, int index) {
    int clamped = clampInt(index, 0, CAMPAIGN_LEVEL_COUNT - 1);
    if (campaignLevelsReady(s) && clamped < static_cast<int>(s->campaignLevels.size())) {
        return s->campaignLevels[static_cast<size_t>(clamped)];
    }
    LOGE("Campaign level requested before campaign-levels.json was loaded.");
    return Puzzle{};
}

Color stateTopColor(int state);
Color stateBottomColor(int state);
Color stateBorderColor(int state);

std::string dailyKey() {
    char buf[32];
    std::time_t t = std::time(nullptr);
    std::tm local{};
    localtime_r(&t, &local);
    std::strftime(buf, sizeof(buf), "%Y-%m-%d", &local);
    return buf;
}

std::string dailyTierKey(int tier) {
    if (tier == 0) return "easy";
    if (tier == 1) return "medium";
    return "hard";
}

std::string dailyTierLabel(int tier) {
    if (tier == 0) return "Easy";
    if (tier == 1) return "Medium";
    return "Hard";
}

int dailyTierIndex(const std::string &tier) {
    if (tier == "easy") return 0;
    if (tier == "medium") return 1;
    return 2;
}

std::string dailyChallengeKey(const std::string &date, int tier) {
    return date + "-" + dailyTierKey(tier);
}

void saveFreePrefs(AppState *s) {
    s->progress.setString("free_size", s->freeSize);
    s->progress.setInt("free_custom_width", s->customW);
    s->progress.setInt("free_custom_height", s->customH);
    s->progress.setInt("free_states", s->freeStates);
    s->progress.setString("free_pattern", s->freePattern);
    s->progress.setString("free_difficulty", s->freeDifficulty);
    s->progress.setInt("free_locked", s->freeLocked ? 1 : 0);
    s->progress.setInt("free_irregular", s->freeIrregular ? 1 : 0);
    s->freeUnique = true;
    s->progress.setInt("free_unique", 1);
}

PlaygroundConfig playgroundConfigFromState(AppState *s) {
    PlaygroundConfig config;
    config.width = s->playgroundW;
    config.height = s->playgroundH;
    config.states = s->playgroundStates;
    config.pattern = s->playgroundPattern;
    config.board = s->playgroundBoard;
    config.locked = s->playgroundLocked;
    config.disabled = s->playgroundDisabled;
    normalizePlaygroundConfig(&config);
    return config;
}

void applyPlaygroundConfig(AppState *s, PlaygroundConfig config) {
    normalizePlaygroundConfig(&config);
    s->playgroundW = config.width;
    s->playgroundH = config.height;
    s->playgroundStates = config.states;
    s->playgroundPattern = config.pattern;
    s->playgroundBoard = config.board;
    s->playgroundLocked = config.locked;
    s->playgroundDisabled = config.disabled;
    if (!playgroundToolAllowed(s->playgroundTool, s->playgroundStates)) s->playgroundTool = PLAYGROUND_TOOL_TAP;
}

void savePlaygroundPrefs(AppState *s) {
    s->progress.setString("playground_seed", encodePlaygroundSeed(playgroundConfigFromState(s)));
}

void setPlaygroundStatus(AppState *s, const std::string &message) {
    s->playgroundStatus = message;
    s->playgroundStatusUntil = message.empty() ? 0 : nowMs() + 3200;
}

std::string preferredSystemLanguage(AppState *s) {
    // LocaleList (API 24+) preserves the user's order, including secondary languages.
    JavaVM *vm = s->native->activity->vm;
    JNIEnv *env = nullptr;
    bool detach = vm->GetEnv(reinterpret_cast<void **>(&env), JNI_VERSION_1_6) != JNI_OK;
    if (detach && vm->AttachCurrentThread(&env, nullptr) != JNI_OK) return "en";
    jclass listClass = env->FindClass("android/os/LocaleList");
    jmethodID getDefault = listClass ? env->GetStaticMethodID(listClass, "getDefault", "()Landroid/os/LocaleList;") : nullptr;
    jmethodID toTags = getDefault ? env->GetMethodID(listClass, "toLanguageTags", "()Ljava/lang/String;") : nullptr;
    jobject list = toTags ? env->CallStaticObjectMethod(listClass, getDefault) : nullptr;
    auto tags = list ? static_cast<jstring>(env->CallObjectMethod(list, toTags)) : nullptr;
    const char *rawTags = tags ? env->GetStringUTFChars(tags, nullptr) : nullptr;
    std::string preferred = rawTags ? rawTags : "";
    if (rawTags) env->ReleaseStringUTFChars(tags, rawTags);
    env->DeleteLocalRef(tags);
    env->DeleteLocalRef(list);
    env->DeleteLocalRef(listClass);
    if (env->ExceptionCheck()) env->ExceptionClear();
    if (detach) vm->DetachCurrentThread();

    std::istringstream choices(preferred);
    std::string tag;
    while (std::getline(choices, tag, ',')) {
        std::string base = tag.substr(0, tag.find('-'));
        for (const auto &language : languages) {
            if (base == language.code) return base;
        }
    }
    return "en";
}

void loadPrefs(AppState *s) {
    s->freeSize = s->progress.getString("free_size", "5x5");
    s->customW = s->progress.getInt("free_custom_width", 5);
    s->customH = s->progress.getInt("free_custom_height", 5);
    s->freeStates = s->progress.getInt("free_states", 3);
    s->freePattern = s->progress.getString("free_pattern", "cross");
    s->freeDifficulty = s->progress.getString("free_difficulty", "Medium");
    s->freeLocked = s->progress.getBool("free_locked", false);
    s->freeIrregular = s->progress.getBool("free_irregular", false);
    s->freeUnique = true;
    PlaygroundConfig playground;
    std::string playgroundSeed = s->progress.getString("playground_seed", "");
    if (!decodePlaygroundSeed(playgroundSeed, &playground)) normalizePlaygroundConfig(&playground);
    applyPlaygroundConfig(s, playground);
    s->sound = s->progress.getBool("setting_sound", true);
    s->vibration = s->progress.getBool("setting_vibration", true);
    s->hideNumbers = s->progress.getBool("setting_hide_numbers", true);
    s->showPlaygroundNumbers = s->progress.getBool("setting_show_playground_numbers", false);
    std::string savedLanguage = s->progress.getString("setting_language", "");
    s->language = savedLanguage.empty() ? preferredSystemLanguage(s) : languages[languageIndex(savedLanguage)].code;
    s->guideTextSize = clampInt(s->progress.getInt("setting_guide_text_size", 0), 0, 2);
}

void playSound(AppState *s, SoundCue cue, int argument = 0) {
    if (s && s->sound) s->audio.play(cue, argument);
}

void vibrate(AppState *s, int milliseconds) {
    if (!s || !s->vibration || milliseconds <= 0 || !s->native || !s->native->activity) return;
    JavaVM *vm = s->native->activity->vm;
    jobject activity = s->native->activity->clazz;
    if (!vm || !activity) return;

    JNIEnv *env = nullptr;
    bool detach = false;
    if (vm->GetEnv(reinterpret_cast<void **>(&env), JNI_VERSION_1_6) != JNI_OK) {
        if (vm->AttachCurrentThread(&env, nullptr) != JNI_OK) return;
        detach = true;
    }

    jclass activityClass = env->GetObjectClass(activity);
    jmethodID getSystemService = env->GetMethodID(activityClass, "getSystemService", "(Ljava/lang/String;)Ljava/lang/Object;");
    jstring serviceName = env->NewStringUTF("vibrator");
    jobject vibrator = getSystemService ? env->CallObjectMethod(activity, getSystemService, serviceName) : nullptr;
    if (env->ExceptionCheck()) env->ExceptionClear();

    if (vibrator) {
        jclass vibratorClass = env->GetObjectClass(vibrator);
        jmethodID vibrateLong = env->GetMethodID(vibratorClass, "vibrate", "(J)V");
        if (vibrateLong) env->CallVoidMethod(vibrator, vibrateLong, static_cast<jlong>(milliseconds));
        if (env->ExceptionCheck()) env->ExceptionClear();
        env->DeleteLocalRef(vibratorClass);
        env->DeleteLocalRef(vibrator);
    }

    env->DeleteLocalRef(serviceName);
    env->DeleteLocalRef(activityClass);
    if (detach) vm->DetachCurrentThread();
}

void callPlayGamesVoid(AppState *s, const char *method, const char *signature, int arg = 0, long long score = 0) {
    if (!s || !s->native || !s->native->activity) return;
    JavaVM *vm = s->native->activity->vm;
    jobject activity = s->native->activity->clazz;
    if (!vm || !activity) return;

    JNIEnv *env = nullptr;
    bool detach = false;
    if (vm->GetEnv(reinterpret_cast<void **>(&env), JNI_VERSION_1_6) != JNI_OK) {
        if (vm->AttachCurrentThread(&env, nullptr) != JNI_OK) return;
        detach = true;
    }

    jclass activityClass = env->GetObjectClass(activity);
    jmethodID getClassLoader = activityClass ? env->GetMethodID(activityClass, "getClassLoader", "()Ljava/lang/ClassLoader;") : nullptr;
    jobject classLoader = getClassLoader ? env->CallObjectMethod(activity, getClassLoader) : nullptr;
    jclass classLoaderClass = classLoader ? env->FindClass("java/lang/ClassLoader") : nullptr;
    jmethodID loadClass = classLoaderClass ? env->GetMethodID(classLoaderClass, "loadClass", "(Ljava/lang/String;)Ljava/lang/Class;") : nullptr;
    jstring bridgeName = env->NewStringUTF("invert_the_matrix.myapp.PlayGamesBridge");
    jclass bridge = loadClass && bridgeName ? static_cast<jclass>(env->CallObjectMethod(classLoader, loadClass, bridgeName)) : nullptr;
    if (!bridge || env->ExceptionCheck()) {
        if (env->ExceptionCheck()) env->ExceptionClear();
        if (bridgeName) env->DeleteLocalRef(bridgeName);
        if (classLoaderClass) env->DeleteLocalRef(classLoaderClass);
        if (classLoader) env->DeleteLocalRef(classLoader);
        if (activityClass) env->DeleteLocalRef(activityClass);
        if (detach) vm->DetachCurrentThread();
        return;
    }
    jmethodID id = env->GetStaticMethodID(bridge, method, signature);
    if (id && !env->ExceptionCheck()) {
        if (std::strcmp(signature, "(Landroid/app/Activity;)V") == 0) {
            env->CallStaticVoidMethod(bridge, id, activity);
        } else if (std::strcmp(signature, "(Landroid/app/Activity;I)V") == 0) {
            env->CallStaticVoidMethod(bridge, id, activity, static_cast<jint>(arg));
        } else {
            env->CallStaticVoidMethod(bridge, id, activity, static_cast<jint>(arg), static_cast<jlong>(score));
        }
        if (env->ExceptionCheck()) env->ExceptionClear();
    } else if (env->ExceptionCheck()) {
        env->ExceptionClear();
    }
    env->DeleteLocalRef(bridge);
    if (bridgeName) env->DeleteLocalRef(bridgeName);
    if (classLoaderClass) env->DeleteLocalRef(classLoaderClass);
    if (classLoader) env->DeleteLocalRef(classLoader);
    if (activityClass) env->DeleteLocalRef(activityClass);
    if (detach) vm->DetachCurrentThread();
}

void playGamesSignIn(AppState *s) {
    callPlayGamesVoid(s, "signIn", "(Landroid/app/Activity;)V");
}

void playGamesSubmitScore(AppState *s, int leaderboard, int score) {
    callPlayGamesVoid(s, "submitScore", "(Landroid/app/Activity;IJ)V", leaderboard, score);
}

void playGamesUnlockAchievement(AppState *s, int achievement) {
    callPlayGamesVoid(s, "unlockAchievement", "(Landroid/app/Activity;I)V", achievement);
}

void playGamesShowLeaderboard(AppState *s, int leaderboard) {
    callPlayGamesVoid(s, "showLeaderboard", "(Landroid/app/Activity;I)V", leaderboard);
}

void playGamesShowAchievements(AppState *s) {
    callPlayGamesVoid(s, "showAchievements", "(Landroid/app/Activity;)V");
}

void openUrl(AppState *s, const char *url) {
    if (!s || !url || !s->native || !s->native->activity) return;
    JavaVM *vm = s->native->activity->vm;
    jobject activity = s->native->activity->clazz;
    if (!vm || !activity) return;

    JNIEnv *env = nullptr;
    bool detach = false;
    if (vm->GetEnv(reinterpret_cast<void **>(&env), JNI_VERSION_1_6) != JNI_OK) {
        if (vm->AttachCurrentThread(&env, nullptr) != JNI_OK) return;
        detach = true;
    }

    jclass uriClass = env->FindClass("android/net/Uri");
    jmethodID parse = uriClass ? env->GetStaticMethodID(uriClass, "parse", "(Ljava/lang/String;)Landroid/net/Uri;") : nullptr;
    jstring urlString = env->NewStringUTF(url);
    jobject uri = parse && urlString ? env->CallStaticObjectMethod(uriClass, parse, urlString) : nullptr;
    if (env->ExceptionCheck()) env->ExceptionClear();

    jclass intentClass = env->FindClass("android/content/Intent");
    jstring actionString = env->NewStringUTF("android.intent.action.VIEW");
    jmethodID intentCtor = intentClass ? env->GetMethodID(intentClass, "<init>", "(Ljava/lang/String;Landroid/net/Uri;)V") : nullptr;
    jobject intent = intentCtor && actionString && uri ? env->NewObject(intentClass, intentCtor, actionString, uri) : nullptr;
    if (env->ExceptionCheck()) env->ExceptionClear();

    jclass activityClass = env->GetObjectClass(activity);
    jmethodID startActivity = activityClass ? env->GetMethodID(activityClass, "startActivity", "(Landroid/content/Intent;)V") : nullptr;
    if (startActivity && intent) {
        env->CallVoidMethod(activity, startActivity, intent);
        if (env->ExceptionCheck()) env->ExceptionClear();
    }

    if (intent) env->DeleteLocalRef(intent);
    if (actionString) env->DeleteLocalRef(actionString);
    if (intentClass) env->DeleteLocalRef(intentClass);
    if (uri) env->DeleteLocalRef(uri);
    if (urlString) env->DeleteLocalRef(urlString);
    if (uriClass) env->DeleteLocalRef(uriClass);
    if (activityClass) env->DeleteLocalRef(activityClass);
    if (detach) vm->DetachCurrentThread();
}

bool setClipboardText(AppState *s, const std::string &text) {
    if (!s || !s->native || !s->native->activity) return false;
    JavaVM *vm = s->native->activity->vm;
    jobject activity = s->native->activity->clazz;
    if (!vm || !activity) return false;

    JNIEnv *env = nullptr;
    bool detach = false;
    if (vm->GetEnv(reinterpret_cast<void **>(&env), JNI_VERSION_1_6) != JNI_OK) {
        if (vm->AttachCurrentThread(&env, nullptr) != JNI_OK) return false;
        detach = true;
    }

    bool ok = false;
    jclass activityClass = env->GetObjectClass(activity);
    jmethodID getSystemService = activityClass ? env->GetMethodID(activityClass, "getSystemService", "(Ljava/lang/String;)Ljava/lang/Object;") : nullptr;
    jstring serviceName = env->NewStringUTF("clipboard");
    jobject clipboard = getSystemService && serviceName ? env->CallObjectMethod(activity, getSystemService, serviceName) : nullptr;
    if (env->ExceptionCheck()) env->ExceptionClear();

    jclass clipDataClass = env->FindClass("android/content/ClipData");
    jmethodID newPlainText = clipDataClass ? env->GetStaticMethodID(clipDataClass, "newPlainText", "(Ljava/lang/CharSequence;Ljava/lang/CharSequence;)Landroid/content/ClipData;") : nullptr;
    jstring label = env->NewStringUTF("Invert the Matrix");
    jstring value = env->NewStringUTF(text.c_str());
    jobject clip = newPlainText && label && value ? env->CallStaticObjectMethod(clipDataClass, newPlainText, label, value) : nullptr;
    if (env->ExceptionCheck()) env->ExceptionClear();

    if (clipboard && clip) {
        jclass clipboardClass = env->GetObjectClass(clipboard);
        jmethodID setPrimaryClip = clipboardClass ? env->GetMethodID(clipboardClass, "setPrimaryClip", "(Landroid/content/ClipData;)V") : nullptr;
        if (setPrimaryClip) {
            env->CallVoidMethod(clipboard, setPrimaryClip, clip);
            ok = !env->ExceptionCheck();
            if (env->ExceptionCheck()) env->ExceptionClear();
        }
        if (clipboardClass) env->DeleteLocalRef(clipboardClass);
    }

    if (clip) env->DeleteLocalRef(clip);
    if (value) env->DeleteLocalRef(value);
    if (label) env->DeleteLocalRef(label);
    if (clipDataClass) env->DeleteLocalRef(clipDataClass);
    if (clipboard) env->DeleteLocalRef(clipboard);
    if (serviceName) env->DeleteLocalRef(serviceName);
    if (activityClass) env->DeleteLocalRef(activityClass);
    if (detach) vm->DetachCurrentThread();
    return ok;
}

std::string getClipboardText(AppState *s) {
    if (!s || !s->native || !s->native->activity) return "";
    JavaVM *vm = s->native->activity->vm;
    jobject activity = s->native->activity->clazz;
    if (!vm || !activity) return "";

    JNIEnv *env = nullptr;
    bool detach = false;
    if (vm->GetEnv(reinterpret_cast<void **>(&env), JNI_VERSION_1_6) != JNI_OK) {
        if (vm->AttachCurrentThread(&env, nullptr) != JNI_OK) return "";
        detach = true;
    }

    std::string out;
    jclass activityClass = env->GetObjectClass(activity);
    jmethodID getSystemService = activityClass ? env->GetMethodID(activityClass, "getSystemService", "(Ljava/lang/String;)Ljava/lang/Object;") : nullptr;
    jstring serviceName = env->NewStringUTF("clipboard");
    jobject clipboard = getSystemService && serviceName ? env->CallObjectMethod(activity, getSystemService, serviceName) : nullptr;
    if (env->ExceptionCheck()) env->ExceptionClear();
    if (clipboard) {
        jclass clipboardClass = env->GetObjectClass(clipboard);
        jmethodID getPrimaryClip = clipboardClass ? env->GetMethodID(clipboardClass, "getPrimaryClip", "()Landroid/content/ClipData;") : nullptr;
        jobject clip = getPrimaryClip ? env->CallObjectMethod(clipboard, getPrimaryClip) : nullptr;
        if (env->ExceptionCheck()) env->ExceptionClear();
        if (clip) {
            jclass clipDataClass = env->GetObjectClass(clip);
            jmethodID getItemAt = clipDataClass ? env->GetMethodID(clipDataClass, "getItemAt", "(I)Landroid/content/ClipData$Item;") : nullptr;
            jobject item = getItemAt ? env->CallObjectMethod(clip, getItemAt, 0) : nullptr;
            if (env->ExceptionCheck()) env->ExceptionClear();
            if (item) {
                jclass itemClass = env->GetObjectClass(item);
                jmethodID getText = itemClass ? env->GetMethodID(itemClass, "getText", "()Ljava/lang/CharSequence;") : nullptr;
                jobject chars = getText ? env->CallObjectMethod(item, getText) : nullptr;
                if (env->ExceptionCheck()) env->ExceptionClear();
                if (chars) {
                    jclass charsClass = env->GetObjectClass(chars);
                    jmethodID toString = charsClass ? env->GetMethodID(charsClass, "toString", "()Ljava/lang/String;") : nullptr;
                    jstring value = toString ? static_cast<jstring>(env->CallObjectMethod(chars, toString)) : nullptr;
                    if (env->ExceptionCheck()) env->ExceptionClear();
                    if (value) {
                        const char *raw = env->GetStringUTFChars(value, nullptr);
                        if (raw) {
                            out = raw;
                            env->ReleaseStringUTFChars(value, raw);
                        }
                        env->DeleteLocalRef(value);
                    }
                    if (charsClass) env->DeleteLocalRef(charsClass);
                    env->DeleteLocalRef(chars);
                }
                if (itemClass) env->DeleteLocalRef(itemClass);
                env->DeleteLocalRef(item);
            }
            if (clipDataClass) env->DeleteLocalRef(clipDataClass);
            env->DeleteLocalRef(clip);
        }
        if (clipboardClass) env->DeleteLocalRef(clipboardClass);
        env->DeleteLocalRef(clipboard);
    }
    if (serviceName) env->DeleteLocalRef(serviceName);
    if (activityClass) env->DeleteLocalRef(activityClass);
    if (detach) vm->DetachCurrentThread();
    return out;
}

void go(AppState *s, Screen screen) {
    s->screen = screen;
    s->scroll = 0.0f;
    s->contentHeight = 0.0f;
    stopScrollMomentum(s);
    s->completion = false;
    s->dailyExitConfirm = false;
    s->patternInfoOpen = false;
    s->patternInfoOpenedAt = 0;
    s->hintCompletionDueAt = 0;
    s->hasPressedButton = false;
    s->pressedButtonUntil = 0;
}

Screen settingsReturnScreen(AppState *s) {
    if (!s) return Screen::Main;
    if (s->returnScreen == Screen::Settings || s->returnScreen == Screen::About) return Screen::Main;
    if (s->returnScreen == Screen::Game && !s->hasSession) return Screen::Main;
    return s->returnScreen;
}

void closeSettings(AppState *s) {
    go(s, settingsReturnScreen(s));
}

void startGame(AppState *s, const Puzzle &p, const std::string &mode) {
    s->session = Session{};
    s->session.puzzle = p;
    s->session.mode = mode;
    s->session.reset();
    s->hasSession = true;
    s->completionStars = 0;
    s->completionMark = 0;
    s->patternInfoOpen = false;
    s->patternInfoOpenedAt = 0;
    s->hintLine.clear();
    s->pressTile = -1;
    s->longPreviewShown = false;
    s->previewTile = -1;
    s->previewClearAt = 0;
    s->hintChanged.clear();
    s->hintChangedUntil = 0;
    s->hintCooldownUntil = 0;
    s->hintCompletionDueAt = 0;
    s->pulseTiles.clear();
    s->pulseUntil = 0;
    go(s, Screen::Game);
}

int calculateStars(const Session &session) {
    if (session.usedHint) return 0;
    if (session.moves <= session.puzzle.minimumMoves) return 3;
    if (session.moves <= session.puzzle.targetMoves) return 2;
    int oneStarMax = session.puzzle.targetMoves + std::max(1, session.puzzle.targetMoves - session.puzzle.minimumMoves);
    if (session.moves <= oneStarMax) return 1;
    return 0;
}

int dailyMark(const Session &session) {
    constexpr int minSolvedMark = 1000;
    constexpr int maxMark = 10000;
    constexpr int timeTieMax = 19;
    constexpr int moveStep = timeTieMax + 1;

    if (session.usedHint) return minSolvedMark;
    int extraMoves = std::max(0, session.moves - session.puzzle.minimumMoves);
    int timeTie = std::max(0, timeTieMax - std::max(0, session.elapsed) / 15);
    int mark = maxMark - extraMoves * moveStep - timeTieMax + timeTie;
    return clampInt(mark, minSolvedMark, maxMark);
}

std::string formatMark(int mark) {
    return std::to_string(clampInt(mark, 0, 10000));
}

std::string dailyLeaderboardRecordedKey(const std::string &key) {
    return "daily_lb_recorded_" + key;
}

std::string dailyLeaderboardMarkKey(const std::string &key) {
    return "daily_lb_mark_" + key;
}

// Changelog note: Android daily leaderboards lock to the first try, while later replays stay local-only.
void migrateDailyLeaderboardRecord(AppState *s, const std::string &key) {
    if (!s || key.empty() || s->progress.getBool(dailyLeaderboardRecordedKey(key), false)) return;
    int legacyMark = s->progress.getInt("daily_mark_" + key, -1);
    if (legacyMark < 0) return;
    s->progress.setInt(dailyLeaderboardRecordedKey(key), 1);
    if (s->progress.getInt(dailyLeaderboardMarkKey(key), -1) < 0) {
        s->progress.setInt(dailyLeaderboardMarkKey(key), clampInt(legacyMark, 0, 10000));
    }
}

bool dailyLeaderboardRecorded(AppState *s, const std::string &key) {
    migrateDailyLeaderboardRecord(s, key);
    return s->progress.getBool(dailyLeaderboardRecordedKey(key), false);
}

int dailyLeaderboardMark(AppState *s, const std::string &key) {
    migrateDailyLeaderboardRecord(s, key);
    int mark = s->progress.getInt(dailyLeaderboardMarkKey(key), -1);
    if (mark >= 0) return mark;
    if (s->progress.getBool(dailyLeaderboardRecordedKey(key), false)) return 0;
    return s->progress.getInt("daily_mark_" + key, 0);
}

int dailyGlobalLeaderboardMark(AppState *s, const std::string &date) {
    int total = 0;
    for (int tier = 0; tier < 3; ++tier) {
        total += dailyLeaderboardMark(s, dailyChallengeKey(date, tier));
    }
    return total;
}

void recordDailyLeaderboardAttempt(AppState *s, const std::string &key, int tier, int mark) {
    if (!s || key.empty() || dailyLeaderboardRecorded(s, key)) return;
    mark = clampInt(mark, 0, 10000);
    s->progress.setInt(dailyLeaderboardRecordedKey(key), 1);
    s->progress.setInt(dailyLeaderboardMarkKey(key), mark);
    tier = clampInt(tier, 0, 2);
    playGamesSubmitScore(s, tier, mark);
    std::string date = key.substr(0, std::min<size_t>(10, key.size()));
    playGamesSubmitScore(s, 3, dailyGlobalLeaderboardMark(s, date));
}

int campaignAchievementIndex(int group, bool master) {
    if (group < 0 || group >= CAMPAIGN_GROUP_COUNT) return -1;
    return group * 2 + (master ? 1 : 0);
}

void syncCampaignGroupAchievements(AppState *s, int group) {
    if (!s || group < 0 || group >= CAMPAIGN_GROUP_COUNT) return;
    if (s->progress.groupCompleted(group) >= CAMPAIGN_LEVELS_PER_GROUP) {
        playGamesUnlockAchievement(s, campaignAchievementIndex(group, false));
    }
    if (s->progress.groupStars(group) >= CAMPAIGN_GROUP_STAR_MAX) {
        playGamesUnlockAchievement(s, campaignAchievementIndex(group, true));
    }
}

void syncEarnedCampaignAchievements(AppState *s) {
    if (!s) return;
    for (int group = 0; group < CAMPAIGN_GROUP_COUNT; ++group) {
        syncCampaignGroupAchievements(s, group);
    }
}

void leaveCurrentGame(AppState *s) {
    if (s->hasSession && s->session.mode == "campaign") {
        go(s, Screen::Campaign);
    } else if (s->hasSession && s->session.mode == "daily") {
        go(s, Screen::Daily);
    } else if (s->hasSession && s->session.mode == "playground") {
        go(s, Screen::Playground);
    } else {
        go(s, Screen::Main);
    }
}

bool shouldConfirmDailyExit(AppState *s) {
    return s && s->hasSession && s->screen == Screen::Game && s->session.mode == "daily" &&
           s->session.leaderboardAttempt && !s->session.completed;
}

void requestExitGame(AppState *s) {
    if (shouldConfirmDailyExit(s)) {
        s->dailyExitConfirm = true;
        s->previewTile = -1;
        s->pressTile = -1;
        s->longPreviewShown = false;
        s->hintLine.clear();
        s->hintChanged.clear();
        s->pulseTiles.clear();
        return;
    }
    leaveCurrentGame(s);
}

void confirmDailyExitForZero(AppState *s) {
    if (shouldConfirmDailyExit(s)) {
        s->session.elapsed = static_cast<int>((nowMs() - s->session.started) / 1000);
        recordDailyLeaderboardAttempt(s, s->session.dailyKey, dailyTierIndex(s->session.dailyTier), 0);
        s->session.leaderboardAttempt = false;
    }
    leaveCurrentGame(s);
}

void completeGame(AppState *s) {
    if (!s->hasSession || s->session.completed) return;
    if (s->session.mode == "playground") return;
    s->patternInfoOpen = false;
    s->patternInfoOpenedAt = 0;
    s->session.completed = true;
    s->session.elapsed = static_cast<int>((nowMs() - s->session.started) / 1000);
    s->completionStars = calculateStars(s->session);
    if (s->session.mode == "campaign") {
        int oldStars = s->progress.stars(s->session.puzzle.levelId);
        s->progress.setInt("completed_" + s->session.puzzle.levelId, 1);
        if (s->completionStars > oldStars) s->progress.setInt("stars_" + s->session.puzzle.levelId, s->completionStars);
        int oldBest = s->progress.getInt("best_" + s->session.puzzle.levelId, -1);
        if (!s->session.usedHint && (oldBest < 0 || s->session.moves < oldBest)) s->progress.setInt("best_" + s->session.puzzle.levelId, s->session.moves);
        if (s->completionStars > oldStars && !s->session.usedHint) {
            s->progress.setInt("hint_" + s->session.puzzle.levelId, 0);
        } else if (oldStars <= 0 && s->completionStars <= 0) {
            s->progress.setInt("hint_" + s->session.puzzle.levelId, s->session.usedHint ? 1 : 0);
        }
        syncCampaignGroupAchievements(s, campaignGroupForLevel(s->session.puzzle.campaignIndex));
    }
    if (s->session.mode == "daily") {
        std::string key = s->session.dailyKey;
        s->completionMark = dailyMark(s->session);
        if (s->session.leaderboardAttempt) {
            recordDailyLeaderboardAttempt(s, key, dailyTierIndex(s->session.dailyTier), s->completionMark);
            s->session.leaderboardAttempt = false;
        }
        int oldMark = s->progress.getInt("daily_mark_" + key, -1);
        int oldMoves = s->progress.getInt("daily_moves_" + key, -1);
        bool better = oldMark < 0 ||
                      s->completionMark > oldMark ||
                      (s->completionMark == oldMark && (oldMoves < 0 || s->session.moves < oldMoves));
        if (better) {
            s->progress.setInt("daily_moves_" + key, s->session.moves);
            s->progress.setInt("daily_stars_" + key, s->completionStars);
            s->progress.setInt("daily_time_" + key, s->session.elapsed);
            s->progress.setInt("daily_mark_" + key, s->completionMark);
            s->progress.setInt("daily_hint_" + key, s->session.usedHint ? 1 : 0);
        }
    }
    if (s->session.mode == "freeplay") {
        int oldBest = s->progress.getInt("best_" + s->session.puzzle.levelId, -1);
        if (!s->session.usedHint && (oldBest < 0 || s->session.moves < oldBest)) {
            s->progress.setInt("best_" + s->session.puzzle.levelId, s->session.moves);
        }
    }
    s->completion = true;
    playSound(s, SoundCue::Win, s->completionStars);
}

void drawStars(AppState *s, float x, float y, float size, int filled, int total = 3, int align = 0, float alpha = 1.0f) {
    Renderer &r = s->renderer;
    float step = size * 1.18f;
    float totalW = step * (total - 1) + size;
    if (align == 1) x -= totalW * 0.5f;
    if (align == 2) x -= totalW;
    for (int i = 0; i < total; ++i) {
        float cx = x + size * 0.5f + i * step;
        float cy = y + size * 0.5f;
        bool on = i < filled;
        r.star(cx, cy, size * 0.48f, size * 0.22f,
               on ? withAlpha(ORANGE, 0.96f * alpha) : withAlpha(ORANGE, 0.080f * alpha),
               on ? rgba(248, 205, 137, 0.42f * alpha) : withAlpha(ORANGE, 0.34f * alpha),
               std::max(1.0f, size * 0.055f));
    }
}

void drawCheckMark(AppState *s, float cx, float cy, float size, Color color = GREEN) {
    Renderer &r = s->renderer;
    float stroke = std::max(1.6f, size * 0.16f);
    r.line(cx - size * 0.38f, cy - size * 0.02f, cx - size * 0.10f, cy + size * 0.30f, stroke, color);
    r.line(cx - size * 0.10f, cy + size * 0.30f, cx + size * 0.42f, cy - size * 0.34f, stroke, color);
}

void drawHintEye(AppState *s, float cx, float cy, float size, Color color = DANGER) {
    Renderer &r = s->renderer;
    float stroke = std::max(1.1f, size * 0.12f);
    r.line(cx - size * 0.58f, cy, cx - size * 0.24f, cy - size * 0.26f, stroke, color);
    r.line(cx - size * 0.24f, cy - size * 0.26f, cx + size * 0.24f, cy - size * 0.26f, stroke, color);
    r.line(cx + size * 0.24f, cy - size * 0.26f, cx + size * 0.58f, cy, stroke, color);
    r.line(cx - size * 0.58f, cy, cx - size * 0.24f, cy + size * 0.26f, stroke, color);
    r.line(cx - size * 0.24f, cy + size * 0.26f, cx + size * 0.24f, cy + size * 0.26f, stroke, color);
    r.line(cx + size * 0.24f, cy + size * 0.26f, cx + size * 0.58f, cy, stroke, color);
    r.circle(cx, cy, size * 0.17f, color, 16);
}

Color dailyTierAccent(int tier) {
    if (tier == 0) return GREEN;
    if (tier == 1) return BLUE;
    if (tier == 2) return ORANGE;
    return TEXT;
}

void drawDailyGridIcon(AppState *s, Rect rect, int tier, Color accent) {
    Renderer &r = s->renderer;
    float radius = std::min(dp(s, 8), rect.h * 0.24f);
    r.roundedRect(rect.x, rect.y, rect.w, rect.h, radius, rgba(229, 236, 245, 0.16f));
    r.roundedRect(rect.x + 1.0f, rect.y + 1.0f, rect.w - 2.0f, rect.h - 2.0f,
                  std::max(1.0f, radius - 1.0f), rgba(7, 10, 14, 0.24f));

    int grid = tier == 0 ? 3 : (tier == 1 ? 4 : (tier == 2 ? 5 : 3));
    float pad = std::max(2.0f, rect.w * 0.10f);
    float gap = std::max(1.0f, rect.w * 0.045f);
    float side = std::min(rect.w, rect.h) - pad * 2.0f;
    float tile = (side - gap * static_cast<float>(grid - 1)) / static_cast<float>(grid);
    float left = rect.x + (rect.w - (tile * grid + gap * (grid - 1))) * 0.5f;
    float top = rect.y + (rect.h - (tile * grid + gap * (grid - 1))) * 0.5f;
    for (int y = 0; y < grid; ++y) {
        for (int x = 0; x < grid; ++x) {
            int state = 0;
            if (tier == 0) {
                state = ((x + y) % 3 == 0 || (x == 1 && y == 1)) ? 1 : 0;
            } else if (tier == 1) {
                state = ((x == y) || ((x * 2 + y) % 3 == 0)) ? 1 : 0;
            } else if (tier == 2) {
                state = ((x + y) % 4 == 0) ? 2 : (((x * 2 + y) % 3 == 0) ? 1 : 0);
            } else {
                state = (x + y) % 2 == 0 ? 1 : 0;
            }
            Color fill = state == 0 ? rgba(244, 247, 251, 0.88f) : withAlpha(accent, 0.92f);
            if (state == 2) fill = BLUE;
            Rect cell{left + x * (tile + gap), top + y * (tile + gap), tile, tile};
            r.roundedRect(cell.x, cell.y, cell.w, cell.h, std::max(1.0f, tile * 0.20f), fill);
        }
    }
}

void drawCrownIcon(AppState *s, Rect rect, Color color) {
    Renderer &r = s->renderer;
    float side = std::min(rect.w, rect.h);
    float scale = side / 24.0f;
    float ox = rect.x + rect.w * 0.5f - 12.0f * scale;
    float oy = rect.y + rect.h * 0.5f - 12.0f * scale;
    float stroke = std::max(dp(s, 1.15f), side * 0.092f);
    auto x = [&](float v) { return ox + v * scale; };
    auto y = [&](float v) { return oy + v * scale; };
    auto line = [&](float ax, float ay, float bx, float by) {
        r.line(x(ax), y(ay), x(bx), y(by), stroke, color);
    };

    // Shape adapted from Lucide's crown icon.
    line(2.0f, 4.0f, 5.0f, 16.0f);
    line(5.0f, 16.0f, 19.0f, 16.0f);
    line(19.0f, 16.0f, 22.0f, 4.0f);
    line(22.0f, 4.0f, 16.0f, 11.0f);
    line(16.0f, 11.0f, 12.0f, 4.0f);
    line(12.0f, 4.0f, 8.0f, 11.0f);
    line(8.0f, 11.0f, 2.0f, 4.0f);
    line(5.0f, 20.0f, 19.0f, 20.0f);
    if (r.skSurface && r.skContext) r.skContext->flushAndSubmit(r.skSurface.get());
    if (r.skContext) r.skContext->resetContext();
}

void drawDailyLeaderboardIcon(AppState *s, Rect iconRect, int tier, Color accent) {
    float crownW = std::min(iconRect.w * 0.56f, dp(s, 26));
    float crownH = crownW * 0.72f;
    float gap = dp(s, 1);
    float boardSize = std::min(iconRect.w, std::max(dp(s, 20), iconRect.h - crownH - gap));
    Rect boardRect{iconRect.x + (iconRect.w - boardSize) * 0.5f,
                   iconRect.y + iconRect.h - boardSize,
                   boardSize, boardSize};
    Rect crown{iconRect.x + (iconRect.w - crownW) * 0.5f,
               boardRect.y - gap - crownH,
               crownW, crownH};
    drawCrownIcon(s, crown, withAlpha(ORANGE, 0.98f));
    drawDailyGridIcon(s, boardRect, tier, accent);
}

struct MenuIconSpec {
    Action action;
    const char *id;
    const char *file;
};

constexpr int MENU_ICON_SIZE = 256;
static constexpr std::array<MenuIconSpec, 8> MAIN_MENU_ICON_SPECS = {{
        {Action::Campaign, "campaign", "menu-icons/campaign.rgba"},
        {Action::Freeplay, "custom", "menu-icons/custom.rgba"},
        {Action::Playground, "playground", "menu-icons/playground.rgba"},
        {Action::Daily, "daily", "menu-icons/daily.rgba"},
        {Action::Achievements, "achievements", "menu-icons/achievements.rgba"},
        {Action::HowTo, "howto", "menu-icons/howto.rgba"},
        {Action::Math, "math", "menu-icons/math.rgba"},
        {Action::Settings, "settings", "menu-icons/settings.rgba"},
}};

const MenuIconSpec *findMainMenuIconSpec(Action action) {
    for (const MenuIconSpec &spec : MAIN_MENU_ICON_SPECS) {
        if (spec.action == action) return &spec;
    }
    return nullptr;
}

Color mainMenuIconAccent(Action action) {
    if (action == Action::Freeplay || action == Action::Math) return BLUE;
    if (action == Action::Playground) return PURPLE;
    if (action == Action::Daily || action == Action::Achievements) return ORANGE;
    if (action == Action::Settings) return MUTED_STRONG;
    return GREEN;
}

void drawFallbackMainMenuIcon(AppState *s, Rect rect, Action action) {
    Renderer &r = s->renderer;
    float side = std::min(rect.w, rect.h);
    float scale = side / 24.0f;
    float ox = rect.x + rect.w * 0.5f - 12.0f * scale;
    float oy = rect.y + rect.h * 0.5f - 12.0f * scale;
    float stroke = std::max(dp(s, 1.15f), side * 0.072f);
    Color base = withAlpha(MUTED_STRONG, 0.86f);
    Color faint = withAlpha(MUTED_STRONG, 0.48f);
    Color accent = withAlpha(mainMenuIconAccent(action), 0.98f);
    auto x = [&](float v) { return ox + v * scale; };
    auto y = [&](float v) { return oy + v * scale; };
    auto line = [&](float ax, float ay, float bx, float by, Color color) {
        r.line(x(ax), y(ay), x(bx), y(by), stroke, color);
    };
    auto curve = [&](float ax, float ay, float bx, float by, float cx, float cy,
                     float dx, float dy, Color color, float strokeScale) {
        float px = ax;
        float py = ay;
        for (int i = 1; i <= 16; ++i) {
            float t = static_cast<float>(i) / 16.0f;
            float u = 1.0f - t;
            float qx = u * u * u * ax + 3.0f * u * u * t * bx + 3.0f * u * t * t * cx + t * t * t * dx;
            float qy = u * u * u * ay + 3.0f * u * u * t * by + 3.0f * u * t * t * cy + t * t * t * dy;
            r.line(x(px), y(py), x(qx), y(qy), std::max(1.0f, stroke * strokeScale), color);
            px = qx;
            py = qy;
        }
    };
    auto box = [&](float px, float py, float w, float h, float radius, Color color) {
        r.roundedStroke({x(px), y(py), w * scale, h * scale}, radius * scale, stroke, color);
    };
    auto dot = [&](float cx, float cy, float radius, Color color) {
        r.circle(x(cx), y(cy), radius * scale, color, 24);
    };
    auto ring = [&](float cx, float cy, float radius, Color color) {
        float outer = radius * scale;
        r.circle(x(cx), y(cy), outer, color, 28);
        r.circle(x(cx), y(cy), std::max(1.0f, outer - stroke), PANEL_2, 28);
    };

    if (action == Action::Campaign) {
        box(4.5f, 4.5f, 15.0f, 15.0f, 3.0f, base);
        line(9.0f, 4.8f, 9.0f, 19.2f, faint);
        line(15.0f, 4.8f, 15.0f, 19.2f, faint);
        line(4.8f, 9.0f, 19.2f, 9.0f, faint);
        line(4.8f, 15.0f, 19.2f, 15.0f, faint);
        line(7.5f, 16.2f, 10.2f, 12.0f, accent);
        line(10.2f, 12.0f, 13.4f, 9.5f, accent);
        line(13.4f, 9.5f, 16.5f, 8.0f, accent);
    } else if (action == Action::Freeplay) {
        box(4.5f, 4.5f, 15.0f, 15.0f, 3.0f, base);
        line(9.0f, 4.8f, 9.0f, 19.2f, faint);
        line(15.0f, 4.8f, 15.0f, 19.2f, faint);
        line(4.8f, 9.0f, 19.2f, 9.0f, faint);
        line(4.8f, 15.0f, 19.2f, 15.0f, faint);
        line(12.0f, 8.0f, 12.0f, 16.0f, accent);
        line(8.0f, 12.0f, 16.0f, 12.0f, accent);
    } else if (action == Action::Playground) {
        dot(12.0f, 12.0f, 8.45f, withAlpha(ORANGE, 0.98f));
        curve(12.15f, 3.8f, 12.0f, 7.4f, 12.0f, 16.6f, 12.05f, 20.2f, PANEL_2, 0.84f);
        curve(3.9f, 12.25f, 8.2f, 11.8f, 15.8f, 12.6f, 20.1f, 12.15f, PANEL_2, 0.84f);
        curve(7.0f, 4.9f, 3.9f, 8.2f, 3.9f, 15.9f, 7.15f, 19.1f, PANEL_2, 0.78f);
        curve(17.0f, 4.9f, 20.1f, 8.2f, 20.1f, 15.9f, 16.85f, 19.1f, PANEL_2, 0.78f);
    } else if (action == Action::Daily) {
        box(4.5f, 5.5f, 15.0f, 14.0f, 2.5f, base);
        line(8.0f, 4.0f, 8.0f, 8.0f, base);
        line(16.0f, 4.0f, 16.0f, 8.0f, base);
        line(4.8f, 10.0f, 19.2f, 10.0f, faint);
        dot(12.0f, 15.0f, 2.35f, accent);
    } else if (action == Action::Achievements) {
        box(6.0f, 5.5f, 12.0f, 8.4f, 2.0f, accent);
        curve(6.1f, 8.0f, 3.2f, 7.5f, 3.0f, 12.2f, 7.0f, 11.8f, base, 0.85f);
        curve(17.9f, 8.0f, 20.8f, 7.5f, 21.0f, 12.2f, 17.0f, 11.8f, base, 0.85f);
        line(10.0f, 14.0f, 10.0f, 17.0f, base);
        line(14.0f, 14.0f, 14.0f, 17.0f, base);
        box(7.2f, 17.0f, 9.6f, 2.4f, 1.0f, base);
        dot(10.0f, 9.0f, 1.0f, TEXT);
        dot(12.0f, 9.0f, 1.0f, BLUE);
        dot(14.0f, 9.0f, 1.0f, GREEN);
        dot(11.0f, 11.0f, 1.0f, PURPLE);
        dot(13.0f, 11.0f, 1.0f, TEXT);
    } else if (action == Action::HowTo) {
        line(5.0f, 6.4f, 5.0f, 17.6f, base);
        line(5.0f, 6.4f, 8.4f, 5.7f, base);
        line(8.4f, 5.7f, 12.0f, 7.2f, base);
        line(12.0f, 7.2f, 12.0f, 18.4f, base);
        line(5.0f, 17.6f, 8.4f, 16.9f, base);
        line(8.4f, 16.9f, 12.0f, 18.4f, base);
        line(12.0f, 7.2f, 15.6f, 5.7f, base);
        line(15.6f, 5.7f, 19.0f, 6.4f, base);
        line(19.0f, 6.4f, 19.0f, 17.6f, base);
        line(12.0f, 18.4f, 15.6f, 16.9f, base);
        line(15.6f, 16.9f, 19.0f, 17.6f, base);
        line(11.2f, 9.2f, 11.9f, 8.7f, accent);
        line(11.9f, 8.7f, 13.0f, 9.0f, accent);
        line(13.0f, 9.0f, 13.3f, 10.0f, accent);
        line(13.3f, 10.0f, 12.2f, 11.4f, accent);
        line(12.2f, 11.4f, 12.0f, 12.8f, accent);
        dot(12.0f, 15.8f, 0.75f, accent);
    } else if (action == Action::Math) {
        line(7.5f, 5.5f, 5.0f, 5.5f, base);
        line(5.0f, 5.5f, 5.0f, 18.5f, base);
        line(5.0f, 18.5f, 7.5f, 18.5f, base);
        line(16.5f, 5.5f, 19.0f, 5.5f, base);
        line(19.0f, 5.5f, 19.0f, 18.5f, base);
        line(19.0f, 18.5f, 16.5f, 18.5f, base);
        line(9.5f, 8.2f, 14.5f, 8.2f, faint);
        line(9.5f, 12.0f, 14.5f, 12.0f, faint);
        line(9.5f, 15.8f, 14.5f, 15.8f, faint);
        line(9.0f, 16.0f, 15.0f, 8.0f, accent);
    } else if (action == Action::Settings) {
        for (int i = 0; i < 8; ++i) {
            float a = static_cast<float>(i) * 0.785398163f;
            float x1 = 12.0f + std::cos(a) * 5.2f;
            float y1 = 12.0f + std::sin(a) * 5.2f;
            float x2 = 12.0f + std::cos(a) * 7.7f;
            float y2 = 12.0f + std::sin(a) * 7.7f;
            line(x1, y1, x2, y2, base);
        }
        ring(12.0f, 12.0f, 4.2f, base);
        dot(12.0f, 12.0f, 1.55f, accent);
    }
    if (r.skContext) r.skContext->resetContext();
}

bool drawMainMenuImageIcon(AppState *s, Rect rect, Action action) {
    Renderer &r = s->renderer;
    if (!r.skiaReady()) return false;
    const MenuIconSpec *spec = findMainMenuIconSpec(action);
    if (!spec) return false;

    MathImageAsset &asset = s->menuImages[spec->id];
    if (!asset.image && !asset.attempted) {
        asset.attempted = true;
        asset.width = MENU_ICON_SIZE;
        asset.height = MENU_ICON_SIZE;
        if (readAssetBytes(s, spec->file, asset.pixels) &&
            asset.pixels.size() == static_cast<size_t>(MENU_ICON_SIZE * MENU_ICON_SIZE * 4)) {
            SkImageInfo info = SkImageInfo::Make(MENU_ICON_SIZE, MENU_ICON_SIZE,
                                                 kRGBA_8888_SkColorType, kUnpremul_SkAlphaType);
            SkPixmap pixmap(info, asset.pixels.data(), static_cast<size_t>(MENU_ICON_SIZE * 4));
            asset.image = SkImages::RasterFromPixmapCopy(pixmap);
        }
        if (!asset.image) {
            LOGE("Unable to load generated menu icon asset %s", spec->file);
            asset.pixels.clear();
        }
    }
    if (!asset.image) return false;

    SkRect dst = SkRect::MakeXYWH(rect.x, rect.y, rect.w, rect.h);
    SkPaint paint;
    paint.setAntiAlias(true);
    r.skCanvas->drawImageRect(asset.image, dst, SkSamplingOptions(SkFilterMode::kLinear), &paint);
    if (r.skContext) r.skContext->resetContext();
    return true;
}

void drawMainMenuIcon(AppState *s, Rect rect, Action action) {
    if (drawMainMenuImageIcon(s, rect, action)) return;
    drawFallbackMainMenuIcon(s, rect, action);
}

void addButton(AppState *s, Rect r, Action action, int value, bool enabled = true) {
    s->buttons.push_back({r, action, value, enabled});
}

bool sameRect(Rect a, Rect b) {
    return std::fabs(a.x - b.x) < 1.0f &&
           std::fabs(a.y - b.y) < 1.0f &&
           std::fabs(a.w - b.w) < 1.0f &&
           std::fabs(a.h - b.h) < 1.0f;
}

bool pressedButtonActive(AppState *s) {
    return s && s->hasPressedButton &&
           (s->pressedButtonUntil <= 0 || nowMs() < s->pressedButtonUntil);
}

bool isPressedButton(AppState *s, Rect rect, Action action, int value = 0) {
    return pressedButtonActive(s) &&
           s->pressedButtonAction == action &&
           s->pressedButtonValue == value &&
           sameRect(s->pressedButtonRect, rect);
}

void rememberPressedButton(AppState *s, const Button &button, int64_t until = 0) {
    if (!s || !button.enabled) return;
    s->pressedButtonRect = button.rect;
    s->pressedButtonAction = button.action;
    s->pressedButtonValue = button.value;
    s->hasPressedButton = true;
    s->pressedButtonUntil = until;
}

void clearPressedButton(AppState *s) {
    if (!s) return;
    s->hasPressedButton = false;
    s->pressedButtonUntil = 0;
}

void drawPressedButtonFeedback(AppState *s, Rect rect, float radius, bool primary = false) {
    Renderer &r = s->renderer;
    float inset = dp(s, 2.0f);
    Color overlay = primary ? rgba(7, 19, 15, 0.075f) : rgba(244, 247, 251, 0.060f);
    Color stroke = primary ? rgba(7, 19, 15, 0.18f) : withAlpha(BLUE, 0.24f);
    r.roundedRect(rect.x + inset, rect.y + inset, rect.w - inset * 2.0f, rect.h - inset * 2.0f,
                  std::max(1.0f, radius - inset), overlay);
    r.roundedStroke({rect.x + 1.0f, rect.y + 1.0f, rect.w - 2.0f, rect.h - 2.0f},
                    std::max(1.0f, radius - 1.0f), std::max(1.0f, dp(s, 1.1f)), stroke);
}

bool findButtonAt(AppState *s, float x, float y, Button *out = nullptr) {
    if (!s) return false;
    for (int i = static_cast<int>(s->buttons.size()) - 1; i >= 0; --i) {
        const Button &button = s->buttons[static_cast<size_t>(i)];
        if (button.enabled && button.rect.contains(x, y)) {
            if (out) *out = button;
            return true;
        }
    }
    return false;
}

void drawPanel(Renderer &r, Rect rect, Color fill = PANEL) {
    float radius = std::min(rect.h * 0.16f, 8.0f);
    r.roundedRect(rect.x, rect.y, rect.w, rect.h, radius, LINE);
    r.roundedRect(rect.x + 1.0f, rect.y + 1.0f, rect.w - 2.0f, rect.h - 2.0f,
                  std::max(0.0f, radius - 1.0f), fill);
}

void drawGlassPanel(AppState *s, Rect rect, Color fill = PANEL, Color accent = rgba(88, 184, 232, 0.0f)) {
    Renderer &r = s->renderer;
    float radius = std::min(dp(s, 8), rect.h * 0.18f);
    r.roundedRect(rect.x, rect.y + dp(s, 0.8f), rect.w, rect.h, radius, rgba(0, 0, 0, 0.10f));
    r.roundedRect(rect.x, rect.y, rect.w, rect.h, radius, LINE);
    r.roundedRect(rect.x + 1.0f, rect.y + 1.0f, rect.w - 2.0f, rect.h - 2.0f,
                  std::max(1.0f, radius - 1.0f), fill);
}

void drawFittedText(AppState *s, const std::string &text, float x, float y, float maxWidth,
                    float scale, Color color, int align = 0, bool heavy = false, float minScale = 1.15f) {
    Renderer &r = s->renderer;
    while (r.textWidth(text, scale) > maxWidth && scale > dp(s, minScale)) {
        scale *= 0.94f;
    }
    if (heavy) r.textHeavy(text, x, y, scale, color, align);
    else r.text(text, x, y, scale, color, align);
}

std::vector<std::string> wrapTextLines(AppState *s, const std::string &text, float scale, float maxWidth) {
    Renderer &r = s->renderer;
    std::vector<std::string> lines;
    std::istringstream stream(text);
    std::string word;
    std::string current;
    while (stream >> word) {
        std::string candidate = current.empty() ? word : current + " " + word;
        if (!current.empty() && r.textWidth(candidate, scale) > maxWidth) {
            lines.push_back(current);
            current = word;
        } else {
            current = candidate;
        }
    }
    if (!current.empty()) lines.push_back(current);
    if (lines.empty()) lines.push_back(text);
    return lines;
}

[[maybe_unused]] std::vector<std::string> wrapTextLines(AppState *s, const std::vector<std::string> &text, float scale, float maxWidth) {
    std::vector<std::string> lines;
    for (const std::string &line : text) {
        std::vector<std::string> wrapped = wrapTextLines(s, tr(s, line), scale, maxWidth);
        lines.insert(lines.end(), wrapped.begin(), wrapped.end());
    }
    return lines;
}

struct WrappedGuideLine {
    std::string text;
    bool bullet;
    bool indent;
    struct HighlightSpan {
        size_t start;
        size_t len;
        Color color;
    };
    std::vector<HighlightSpan> highlights;
};

struct HighlightRule {
    std::vector<std::string> terms;
    Color color;
    bool used = false;
    bool allowKoreanParticle = false;
};

bool isHighlightWordByte(unsigned char c) {
    return std::isalnum(c) || c == '_' || c >= 128;
}

bool isHighlightBoundary(const std::string &text, size_t index) {
    return index >= text.size() || !isHighlightWordByte(static_cast<unsigned char>(text[index]));
}

// Korean particles attach to nouns without a space. Keep the particle outside the highlight.
bool endsWithKoreanParticle(const std::string &text, size_t offset) {
    static const char *particles[] = {"은", "는", "이", "가", "을", "를", "에", "의", "과", "와", "도",
                                      "로", "으로", "에서", "에는", "에도", "마다", "처럼", "만", "부터", "까지"};
    for (const char *particle : particles) {
        size_t length = std::strlen(particle);
        if (text.compare(offset, length, particle) == 0 && isHighlightBoundary(text, offset + length)) return true;
    }
    return false;
}

void applyGuideHighlights(std::string const &line, std::vector<HighlightRule> *rules,
                          std::vector<WrappedGuideLine::HighlightSpan> &spans) {
    if (!rules) return;
    size_t searchFrom = 0;
    while (searchFrom < line.size()) {
        int bestRule = -1;
        size_t bestStart = std::string::npos;
        size_t bestLen = 0;
        for (size_t i = 0; i < rules->size(); ++i) {
            HighlightRule &rule = (*rules)[i];
            if (rule.used) continue;
            for (const std::string &term : rule.terms) {
                if (term.empty()) continue;
                size_t from = searchFrom;
                while (from < line.size()) {
                    size_t found = line.find(term, from);
                    if (found == std::string::npos) break;
                    size_t end = found + term.size();
                    bool startsClean = found == 0 || isHighlightBoundary(line, found - 1);
                    bool endsClean = isHighlightBoundary(line, end) ||
                                     (rule.allowKoreanParticle && endsWithKoreanParticle(line, end));
                    if (!startsClean || !endsClean) {
                        from = end;
                        continue;
                    }
                    if (bestRule < 0 || found < bestStart || (found == bestStart && term.size() > bestLen)) {
                        bestRule = static_cast<int>(i);
                        bestStart = found;
                        bestLen = term.size();
                    }
                    break;
                }
            }
        }
        if (bestRule < 0) break;
        HighlightRule &rule = (*rules)[static_cast<size_t>(bestRule)];
        spans.push_back({bestStart, bestLen, rule.color});
        rule.used = true;
        searchFrom = bestStart + bestLen;
    }
}

std::vector<HighlightRule> guideHighlightRules(AppState *s, bool math) {
    if (s && s->language == "ko") {
        auto rules = math
            ? std::vector<HighlightRule>{
                  {{"칸"}, GREEN}, {{"상태"}, ORANGE}, {{"누르기", "누르면", "눌러", "누른"}, BLUE}, {{"효과 벡터"}, GREEN},
                  {{"누름 횟수 벡터"}, GREEN}, {{"퍼즐판 벡터"}, GREEN}, {{"영벡터"}, GREEN},
                  {{"행렬"}, ORANGE}, {{"나머지"}, PURPLE}, {{"유한체", "체"}, GREEN}, {{"나머지환", "환"}, PURPLE},
                  {{"상"}, GREEN}, {{"핵"}, BLUE}, {{"가역", "가역행렬"}, ORANGE}}
            : std::vector<HighlightRule>{
                  {{"칸"}, GREEN}, {{"누르기", "누르면", "눌러", "누른"}, BLUE}, {{"상태"}, PURPLE}, {{"패턴"}, ORANGE},
                  {{"잠긴 칸", "자물쇠"}, PURPLE}, {{"빈자리"}, ORANGE}, {{"힌트"}, GREEN}};
        for (auto &rule : rules) rule.allowKoreanParticle = true;
        return rules;
    }
    if (!s || s->language == "es") {
        return math
            ? std::vector<HighlightRule>{
                  {{"modular"}, PURPLE}, {{"casilla", "casillas"}, GREEN}, {{"estado", "estados"}, ORANGE},
                  {{"toque", "toques"}, BLUE},
                  {{"vector de efecto", "vectores de efecto"}, GREEN},
                  {{"vector de toques", "vectores de toques"}, GREEN},
                  {{"vector del tablero"}, GREEN},
                  {{"vector cero"}, GREEN},
                  {{"matriz"}, ORANGE},
                  {{"módulo"}, PURPLE}, {{"cuerpo", "cuerpos"}, GREEN}, {{"anillo", "anillos"}, PURPLE},
                  {{"imagen"}, GREEN}, {{"núcleo"}, BLUE}, {{"invertible"}, ORANGE}}
            : std::vector<HighlightRule>{
                  {{"casilla", "casillas"}, GREEN}, {{"toque", "toques"}, BLUE}, {{"estado", "estados"}, PURPLE},
                  {{"patrón", "patrones"}, ORANGE}, {{"candado", "casillas con candado"}, PURPLE},
                  {{"hueco", "huecos"}, ORANGE}, {{"pista", "pistas"}, GREEN}};
    }
    if (s->language == "fr") {
        return math
            ? std::vector<HighlightRule>{
                  {{"modulaire"}, PURPLE}, {{"tuile", "tuiles"}, GREEN}, {{"état", "états"}, ORANGE},
                  {{"Toucher", "appui", "appuis"}, BLUE},
                  {{"vecteur d’effet", "vecteurs d’effet"}, GREEN},
                  {{"vecteur des appuis", "vecteurs des appuis"}, GREEN},
                  {{"vecteur du plateau"}, GREEN},
                  {{"vecteur zéro", "vecteur nul"}, GREEN},
                  {{"matrice"}, ORANGE},
                  {{"modulo"}, PURPLE}, {{"corps"}, GREEN}, {{"anneau", "anneaux"}, PURPLE},
                  {{"image"}, GREEN}, {{"noyau"}, BLUE}, {{"inversible", "inversibilité"}, ORANGE}}
            : std::vector<HighlightRule>{
                  {{"tuile", "tuiles"}, GREEN}, {{"appui", "appuis"}, BLUE}, {{"état", "états"}, PURPLE},
                  {{"motif", "motifs"}, ORANGE}, {{"cadenas", "tuiles avec cadenas"}, PURPLE},
                  {{"trou", "trous"}, ORANGE}, {{"indice", "indices"}, GREEN}};
    }
    return math
        ? std::vector<HighlightRule>{
              {{"modular"}, PURPLE}, {{"tile", "tiles"}, GREEN}, {{"state", "states"}, ORANGE},
              {{"Tapping", "tap", "taps"}, BLUE},
              {{"effect vector", "effect vectors"}, GREEN},
              {{"tap-count vector", "tap-count vectors"}, GREEN},
              {{"board vector"}, GREEN},
              {{"zero vector"}, GREEN},
              {{"matrix", "Matrix"}, ORANGE},
              {{"modulo"}, PURPLE}, {{"field", "fields"}, GREEN}, {{"ring", "rings"}, PURPLE},
              {{"image"}, GREEN}, {{"kernel"}, BLUE}, {{"invertible"}, ORANGE}}
        : std::vector<HighlightRule>{
              {{"tile", "tiles"}, GREEN}, {{"Tapping", "Tap", "tap", "taps"}, BLUE}, {{"state", "states", "States"}, PURPLE},
              {{"pattern", "patterns"}, ORANGE}, {{"locked", "lock", "locks"}, PURPLE},
              {{"hole", "holes"}, ORANGE}, {{"hints", "hint", "Hint"}, GREEN}};
}

std::vector<WrappedGuideLine> wrapGuideLines(AppState *s, const std::vector<std::string> &text,
                                             float scale, float maxWidth, float bulletIndent,
                                             std::vector<HighlightRule> *highlights = nullptr) {
    std::vector<WrappedGuideLine> lines;
    for (const std::string &line : text) {
        bool bullet = line.rfind("- ", 0) == 0;
        std::string copy = tr(s, bullet ? line.substr(2) : line);
        float textW = bullet ? std::max(1.0f, maxWidth - bulletIndent) : maxWidth;
        std::vector<std::string> wrapped = wrapTextLines(s, copy, scale, textW);
        for (size_t i = 0; i < wrapped.size(); ++i) {
            WrappedGuideLine wrappedLine{wrapped[i], bullet && i == 0, bullet, {}};
            applyGuideHighlights(wrappedLine.text, highlights, wrappedLine.highlights);
            lines.push_back(wrappedLine);
        }
    }
    return lines;
}

void drawButton(AppState *s, Rect rect, const std::string &label, Action action, int value = 0, bool primary = false, bool selected = false, bool enabled = true, float textScaleBoost = 1.0f) {
    Renderer &r = s->renderer;
    float radius = std::min(dp(s, 8), rect.h * 0.22f);
    Color border = selected ? withAlpha(BLUE, enabled ? 0.68f : 0.18f) : (enabled ? LINE : rgba(190, 203, 220, 0.08f));
    Color fill = primary ? (enabled ? GREEN : rgba(50, 84, 67, 0.48f)) : (enabled ? PANEL_2 : rgba(21, 27, 36, 0.42f));
    if (selected) fill = rgba(34, 66, 86, enabled ? 0.82f : 0.36f);
    r.roundedRect(rect.x, rect.y, rect.w, rect.h, radius, border);
    r.roundedRect(rect.x + 1.5f, rect.y + 1.5f, rect.w - 3.0f, rect.h - 3.0f, std::max(0.0f, radius - 1.5f), fill);
    if (enabled && isPressedButton(s, rect, action, value)) drawPressedButtonFeedback(s, rect, radius, primary);
    float scale = std::max(2.0f, rect.h / 18.0f) * textScaleBoost;
    while (r.textWidth(label, scale) > rect.w - dp(s, 14) && scale > 1.35f) {
        scale *= 0.92f;
    }
    Color text = primary ? rgba(7, 19, 15, enabled ? 1.0f : 0.50f) : (enabled ? TEXT : withAlpha(MUTED, 0.45f));
    r.textHeavy(label, rect.x + rect.w * 0.5f, rect.y + rect.h * 0.5f - 4.0f * scale, scale, text, 1, 0.9f);
    addButton(s, rect, action, value, enabled);
}

void drawIconShell(AppState *s, Rect rect, Action action, int value = 0, bool enabled = true) {
    Renderer &r = s->renderer;
    float radius = std::min(rect.h * 0.20f, dp(s, 8));
    r.roundedRect(rect.x, rect.y, rect.w, rect.h, radius, enabled ? LINE : rgba(190, 203, 220, 0.07f));
    r.roundedRect(rect.x + 1.2f, rect.y + 1.2f, rect.w - 2.4f, rect.h - 2.4f,
                  std::max(0.0f, radius - 1.2f), rgba(21, 27, 36, enabled ? 0.96f : 0.42f));
    if (enabled && isPressedButton(s, rect, action, value)) drawPressedButtonFeedback(s, rect, radius);
    addButton(s, rect, action, value, enabled);
}

void drawToolIconShell(AppState *s, Rect rect, Action action, bool enabled = true,
                       Color accent = rgba(88, 184, 232, 0.0f)) {
    Renderer &r = s->renderer;
    float radius = std::min(dp(s, 8), rect.h * 0.22f);
    bool hasAccent = accent.a > 0.0f;
    Color border = hasAccent ? withAlpha(accent, enabled ? 0.38f : 0.14f) : (enabled ? LINE : rgba(190, 203, 220, 0.07f));
    Color fill = hasAccent ? rgba(45, 26, 34, enabled ? 0.82f : 0.34f) : rgba(21, 27, 36, enabled ? 0.96f : 0.38f);
    r.roundedRect(rect.x, rect.y, rect.w, rect.h, radius, border);
    r.roundedRect(rect.x + 1.2f, rect.y + 1.2f, rect.w - 2.4f, rect.h - 2.4f,
                  std::max(0.0f, radius - 1.2f), fill);
    if (enabled && isPressedButton(s, rect, action, 0)) drawPressedButtonFeedback(s, rect, radius);
    addButton(s, rect, action, 0, enabled);
}

// SVG paths from Google Material Icons (Apache 2.0): keyboard_arrow_left and undo.
void drawMaterialChevronLeftIcon(AppState *s, Rect rect, Color color) {
    Renderer &r = s->renderer;
    if (!r.skiaReady()) {
        float cx = rect.x + rect.w * 0.52f;
        float cy = rect.y + rect.h * 0.5f;
        float size = std::min(rect.w, rect.h) * 0.28f;
        r.line(cx + size * 0.55f, cy - size, cx - size * 0.45f, cy, dp(s, 2.4f), color);
        r.line(cx - size * 0.45f, cy, cx + size * 0.55f, cy + size, dp(s, 2.4f), color);
        return;
    }

    float side = std::min(rect.w, rect.h) * 1.18f;
    float scale = side / 24.0f;
    float ox = rect.x + rect.w * 0.5f - 12.0f * scale;
    float oy = rect.y + rect.h * 0.5f - 12.0f * scale;
    auto sx = [&](float v) { return ox + v * scale; };
    auto sy = [&](float v) { return oy + v * scale; };

    SkPathBuilder builder;
    builder.moveTo(sx(15.41f), sy(16.59f));
    builder.lineTo(sx(10.83f), sy(12.0f));
    builder.lineTo(sx(15.41f), sy(7.41f));
    builder.lineTo(sx(14.0f), sy(6.0f));
    builder.lineTo(sx(8.0f), sy(12.0f));
    builder.lineTo(sx(14.0f), sy(18.0f));
    SkPath path = builder.close().detach();

    SkPaint paint;
    paint.setAntiAlias(true);
    paint.setColor(Renderer::skColor(color));
    paint.setStyle(SkPaint::kFill_Style);
    r.skCanvas->drawPath(path, paint);
    if (r.skContext) r.skContext->resetContext();
}

void drawMaterialArrowBackIcon(AppState *s, Rect rect, Color color) {
    Renderer &r = s->renderer;
    float cx = rect.x + rect.w * 0.5f;
    float cy = rect.y + rect.h * 0.5f;
    float side = std::min(rect.w, rect.h);
    float stroke = std::max(1.0f, dp(s, 2.05f));
    float left = cx - side * 0.31f;
    float right = cx + side * 0.32f;
    float head = side * 0.26f;
    r.line(right, cy, left, cy, stroke, color);
    r.line(left, cy, left + head, cy - head, stroke, color);
    r.line(left, cy, left + head, cy + head, stroke, color);
}

void drawMaterialUndoIcon(AppState *s, Rect rect, Color color) {
    Renderer &r = s->renderer;
    if (!r.skiaReady()) {
        float cx = rect.x + rect.w * 0.50f;
        float cy = rect.y + rect.h * 0.52f;
        float size = std::min(rect.w, rect.h) * 0.43f;
        float stroke = dp(s, 2.55f);
        float rx = size * 0.66f;
        float ry = size * 0.56f;
        float start = -0.10f * 3.14159265f;
        float end = -1.18f * 3.14159265f;
        float prevX = cx + std::cos(start) * rx;
        float prevY = cy + std::sin(start) * ry;
        for (int i = 1; i <= 22; ++i) {
            float t = static_cast<float>(i) / 22.0f;
            float a = start + (end - start) * t;
            float x = cx + std::cos(a) * rx;
            float y = cy + std::sin(a) * ry;
            r.line(prevX, prevY, x, y, stroke, color);
            prevX = x;
            prevY = y;
        }
        r.line(prevX, prevY, prevX + size * 0.44f, prevY - size * 0.16f, stroke, color);
        r.line(prevX, prevY, prevX + size * 0.18f, prevY + size * 0.43f, stroke, color);
        return;
    }

    float side = std::min(rect.w, rect.h) * 0.92f;
    float scale = side / 24.0f;
    float ox = rect.x + rect.w * 0.5f - 12.0f * scale;
    float oy = rect.y + rect.h * 0.5f - 12.0f * scale;
    auto sx = [&](float v) { return ox + v * scale; };
    auto sy = [&](float v) { return oy + v * scale; };

    SkPathBuilder builder;
    builder.moveTo(sx(12.5f), sy(8.0f));
    builder.cubicTo(sx(9.85f), sy(8.0f), sx(7.45f), sy(8.99f), sx(5.6f), sy(10.6f));
    builder.lineTo(sx(2.0f), sy(7.0f));
    builder.lineTo(sx(2.0f), sy(16.0f));
    builder.lineTo(sx(11.0f), sy(16.0f));
    builder.lineTo(sx(7.38f), sy(12.38f));
    builder.cubicTo(sx(8.77f), sy(11.22f), sx(10.54f), sy(10.5f), sx(12.5f), sy(10.5f));
    builder.cubicTo(sx(16.04f), sy(10.5f), sx(19.05f), sy(12.81f), sx(20.1f), sy(16.0f));
    builder.lineTo(sx(22.47f), sy(15.22f));
    builder.cubicTo(sx(21.08f), sy(11.03f), sx(17.15f), sy(8.0f), sx(12.5f), sy(8.0f));
    SkPath path = builder.close().detach();

    SkPaint paint;
    paint.setAntiAlias(true);
    paint.setColor(Renderer::skColor(color));
    paint.setStyle(SkPaint::kFill_Style);
    r.skCanvas->drawPath(path, paint);
}

void drawUndoToolButton(AppState *s, Rect rect, bool enabled) {
    drawToolIconShell(s, rect, Action::Undo, enabled);
    Color color = enabled ? TEXT : withAlpha(MUTED, 0.45f);
    drawMaterialUndoIcon(s, rect, color);
}

void drawHintToolButton(AppState *s, Rect rect, bool enabled = true) {
    drawToolIconShell(s, rect, Action::Hint, enabled, DANGER);
    drawHintEye(s, rect.x + rect.w * 0.5f, rect.y + rect.h * 0.5f, std::min(rect.w, rect.h) * 0.36f,
                enabled ? DANGER : withAlpha(MUTED, 0.45f));
}

[[maybe_unused]] void drawPixelLabel(AppState *s, const std::string &label, float cx, float cy, float unit, Color color) {
    Renderer &r = s->renderer;
    std::string text = label;
    std::transform(text.begin(), text.end(), text.begin(), [](unsigned char c) {
        return static_cast<char>(std::toupper(c));
    });
    float width = static_cast<float>(text.size()) * unit * 6.0f - unit;
    float x = cx - width * 0.5f;
    float y = cy - unit * 3.5f;
    float cursor = x;
    for (char c : text) {
        if (c == ' ') {
            cursor += unit * 6.0f;
            continue;
        }
        auto glyph = r.glyph(c);
        for (int row = 0; row < 7; ++row) {
            for (int col = 0; col < 5; ++col) {
                if (glyph[row] & (1 << (4 - col))) {
                    r.rect(cursor + static_cast<float>(col) * unit, y + static_cast<float>(row) * unit,
                           unit, unit, color);
                }
            }
        }
        cursor += unit * 6.0f;
    }
}

void drawResetToolButton(AppState *s, Rect rect, bool enabled = true) {
    drawToolIconShell(s, rect, Action::Reset, enabled);
    drawFittedText(s, tr(s, "Reset"), rect.x + rect.w * 0.5f, rect.y + rect.h * 0.5f - dp(s, 8.0f),
                   rect.w - dp(s, 12), dp(s, 2.86f), enabled ? TEXT : withAlpha(MUTED, 0.45f), 1, true, 1.22f);
}

void drawBackIcon(AppState *s, Rect rect, Action action) {
    drawIconShell(s, rect, action);
    drawMaterialChevronLeftIcon(s, rect, TEXT);
}

void drawHeaderBackIcon(AppState *s, Rect rect, Action action) {
    float radius = std::min(rect.h * 0.22f, dp(s, 8));
    if (isPressedButton(s, rect, action, 0)) {
        drawPressedButtonFeedback(s, rect, radius);
    }
    float side = std::min(rect.w, rect.h) * 0.76f;
    Rect mark{rect.x + (rect.w - side) * 0.5f, rect.y + (rect.h - side) * 0.5f, side, side};
    drawMaterialArrowBackIcon(s, mark, withAlpha(TEXT, 0.64f));
    addButton(s, rect, action, 0, true);
}

void drawGearIcon(AppState *s, Rect rect, Action action) {
    drawIconShell(s, rect, action);
    Renderer &r = s->renderer;
    float cx = rect.x + rect.w * 0.5f;
    float cy = rect.y + rect.h * 0.5f;
    float outer = std::min(rect.w, rect.h) * 0.25f;
    for (int i = 0; i < 8; ++i) {
        float a = static_cast<float>(i) * 0.785398163f;
        float x1 = cx + std::cos(a) * outer * 0.78f;
        float y1 = cy + std::sin(a) * outer * 0.78f;
        float x2 = cx + std::cos(a) * outer * 1.15f;
        float y2 = cy + std::sin(a) * outer * 1.15f;
        r.line(x1, y1, x2, y2, dp(s, 2.0f), TEXT);
    }
    r.circle(cx, cy, outer * 0.78f, withAlpha(TEXT, 0.95f), 28);
    r.circle(cx, cy, outer * 0.36f, PANEL, 24);
}

void drawBackground(AppState *s) {
    Renderer &r = s->renderer;
    float w = static_cast<float>(r.width), h = static_cast<float>(r.height);
    r.rectGradient(0, 0, w, h, BG, rgba(10, 14, 21));
    float gap = dp(s, 42);
    float gridLine = std::max(1.0f, dp(s, 0.55f));
    Color gridColor = rgba(190, 203, 220, 0.046f);
    for (float x = 0; x < w; x += gap) {
        r.rect(x, 0, gridLine, h, gridColor);
    }
    for (float y = 0; y < h; y += gap) {
        r.rect(0, y, w, gridLine, gridColor);
    }
}

float guideSizeControlWidth(AppState *s);
void drawGuideSizeControl(AppState *s);

float sectionContentTop(AppState *s) {
    return safeTop(s) + dp(s, 102);
}

Action sectionHeaderIconAction(const std::string &title) {
    if (title == "Campaign") return Action::Campaign;
    if (title == "Custom Level") return Action::Freeplay;
    if (title == "Playground") return Action::Playground;
    if (title == "Daily Challenges") return Action::Daily;
    if (title == "How to Play") return Action::HowTo;
    if (title == "The Math") return Action::Math;
    if (title == "Settings" || title == "About") return Action::Settings;
    return Action::Campaign;
}

float menuTextScale(AppState *s) {
    if (s->guideTextSize == 1) return 1.12f;
    if (s->guideTextSize == 2) return 1.24f;
    return 1.0f;
}

float menuHeaderTextScale(AppState *s) {
    return 1.0f + (menuTextScale(s) - 1.0f) * 0.66f;
}

void drawHeader(AppState *s, const std::string &, const std::string &title, Action backAction = Action::Main) {
    Renderer &r = s->renderer;
    float top = safeTop(s) + dp(s, 8);
    float controlW = guideSizeControlWidth(s);
    Rect back{dp(s, 18), top + dp(s, 9), dp(s, 38), dp(s, 36)};
    Rect icon{dp(s, 74), top + dp(s, 3), dp(s, 52), dp(s, 52)};
    float titleX = icon.x + icon.w + dp(s, 12);
    float titleRight = r.width - dp(s, 18) - controlW - dp(s, 12);
    float titleW = std::max(dp(s, 72), titleRight - titleX);
    drawHeaderBackIcon(s, back, backAction);
    drawMainMenuIcon(s, icon, sectionHeaderIconAction(title));
    drawFittedText(s, tr(s, title), titleX, top + dp(s, 21),
                   titleW, dp(s, 3.16f * menuHeaderTextScale(s)), TEXT, 0, false, 1.55f);
    drawGuideSizeControl(s);
}

float guideTextScale(AppState *s) {
    if (s->guideTextSize == 1) return 1.30f;
    if (s->guideTextSize == 2) return 1.64f;
    return 1.0f;
}

float guideContentTop(AppState *s) {
    return sectionContentTop(s);
}

void drawGuideSizeControl(AppState *s) {
    Renderer &r = s->renderer;
    float button = dp(s, 26);
    float gap = dp(s, 3);
    float pad = dp(s, 3);
    float w = button * 3.0f + gap * 2.0f + pad * 2.0f;
    Rect rail{r.width - dp(s, 18) - w, safeTop(s) + dp(s, 60), w, button + pad * 2.0f};
    drawGlassPanel(s, rail, rgba(10, 13, 19, 0.42f));

    auto drawSizeGlyph = [&](Rect b, float scale, Color color, bool selected) {
        float cx = b.x + b.w * 0.5f;
        float glyphY = b.y + b.h * 0.5f - scale * 4.0f - dp(s, 0.6f);
        const char *sample = s->language == "ko" ? "가" : "A";
        r.textHeavy(sample, cx, glyphY, scale, color, 1, selected ? 0.98f : 0.76f);
        float underlineW = std::min(b.w * 0.48f, std::max(dp(s, 10), r.textWidth(sample, scale) * 0.78f));
        float underlineH = std::max(1.0f, dp(s, 1.15f));
        r.roundedRect(cx - underlineW * 0.5f, b.y + b.h - dp(s, 6), underlineW, underlineH, underlineH * 0.5f,
                      withAlpha(color, selected ? 0.58f : 0.36f));
    };

    std::array<float, 3> glyphScale{{dp(s, 1.42f), dp(s, 1.82f), dp(s, 2.24f)}};
    for (int i = 0; i < 3; ++i) {
        Rect b{rail.x + pad + static_cast<float>(i) * (button + gap), rail.y + pad, button, button};
        bool selected = s->guideTextSize == i;
        float radius = dp(s, 7);
        r.roundedRect(b.x, b.y, b.w, b.h, radius, selected ? withAlpha(BLUE, 0.42f) : withAlpha(LINE, 0.58f));
        r.roundedRect(b.x + 1.0f, b.y + 1.0f, b.w - 2.0f, b.h - 2.0f, radius - 1.0f,
                      selected ? rgba(26, 50, 66, 0.72f) : rgba(21, 27, 36, 0.56f));
        if (isPressedButton(s, b, Action::GuideSize, i)) drawPressedButtonFeedback(s, b, radius);
        drawSizeGlyph(b, glyphScale[static_cast<size_t>(i)], selected ? withAlpha(TEXT, 0.88f) : withAlpha(MUTED, 0.72f), selected);
        addButton(s, b, Action::GuideSize, i, true);
    }
}

float guideSizeControlWidth(AppState *s) {
    float button = dp(s, 26);
    float gap = dp(s, 3);
    float pad = dp(s, 3);
    return button * 3.0f + gap * 2.0f + pad * 2.0f;
}

void drawGuideHeaderChrome(AppState *s) {
    Renderer &r = s->renderer;
    float solidBottom = guideContentTop(s) - dp(s, 8);
    float fadeH = dp(s, 20);
    r.rectGradient(0, 0, r.width, solidBottom,
                   BG,
                   BG);
    r.rectGradient(0, solidBottom, r.width, fadeH,
                   BG,
                   withAlpha(BG, 0.0f));
    r.rect(0, solidBottom, r.width, std::max(1.0f, dp(s, 0.8f)), LINE);
    addButton(s, {0.0f, 0.0f, static_cast<float>(r.width), solidBottom + fadeH}, Action::Main, 0, false);
}

void drawScreenHeaderChrome(AppState *s, float contentTop, float fadeDp = 20.0f) {
    Renderer &r = s->renderer;
    float solidBottom = contentTop - dp(s, 8);
    float fadeH = dp(s, fadeDp);
    r.rectGradient(0, 0, r.width, solidBottom,
                   BG,
                   BG);
    r.rectGradient(0, solidBottom, r.width, fadeH,
                   BG,
                   withAlpha(BG, 0.0f));
    r.rect(0, solidBottom, r.width, std::max(1.0f, dp(s, 0.8f)), LINE);
    addButton(s, {0.0f, 0.0f, static_cast<float>(r.width), solidBottom + fadeH}, Action::Main, 0, false);
}

void drawStickyScreenHeader(AppState *s, const std::string &kicker, const std::string &title,
                            Action backAction, float contentTop) {
    drawScreenHeaderChrome(s, contentTop);
    drawHeader(s, kicker, title, backAction);
}

void drawGuideHeader(AppState *s, const std::string &title) {
    drawGuideHeaderChrome(s);
    drawHeader(s, "", title, Action::Main);
}

std::vector<int> splashAffected(int tapIndex) {
    std::vector<int> affected;
    int row = tapIndex / 5;
    int col = tapIndex % 5;
    for (auto &off : patternFor("cross").offsets) {
        int nx = col + off.first;
        int ny = row + off.second;
        if (nx >= 0 && nx < 5 && ny >= 0 && ny < 5) affected.push_back(ny * 5 + nx);
    }
    return affected;
}

int randomSplashTap(AppState *s) {
    int tap = randomInt(0, 24, s->splashRng);
    if (tap == s->splashLastTap) tap = (tap + randomInt(1, 24, s->splashRng)) % 25;
    s->splashLastTap = tap;
    return tap;
}

void applySplashMove(AppState *s, int tap, bool animated) {
    s->splashTap = tap;
    s->splashChanged = splashAffected(tap);
    for (int idx : s->splashChanged) {
        s->splashState[static_cast<size_t>(idx)] = (s->splashState[static_cast<size_t>(idx)] + 1) % 4;
    }
    s->splashPulseUntil = animated ? nowMs() + 360 : 0;
}

void initSplashBoard(AppState *s) {
    if (s->splashReady) return;
    s->splashReady = true;
    s->splashState.fill(0);
    s->splashChanged.clear();
    s->splashLastTap = -1;
    s->splashTap = -1;
    s->splashRng = Rng("splash-" + std::to_string(nowMs()));
    for (int i = 0; i < 7; ++i) applySplashMove(s, randomSplashTap(s), false);
    s->splashChanged.clear();
    s->splashNextAt = nowMs() + 620;
    s->splashPulseUntil = 0;
}

void updateSplashBoard(AppState *s) {
    initSplashBoard(s);
    int64_t t = nowMs();
    if (t >= s->splashNextAt) {
        applySplashMove(s, randomSplashTap(s), true);
        s->splashNextAt = t + 620;
    }
    if (s->splashPulseUntil > 0 && t >= s->splashPulseUntil) {
        s->splashChanged.clear();
        s->splashTap = -1;
        s->splashPulseUntil = 0;
    }
}

void drawMatrixTileSurface(AppState *s, Rect tile, int state, float radius, bool glow = true) {
    Renderer &r = s->renderer;
    if (glow) {
        if (state) {
            r.roundedRect(tile.x, tile.y + dp(s, 0.9f), tile.w, tile.h, radius, rgba(0, 0, 0, 0.12f));
        } else {
            r.roundedRect(tile.x, tile.y + dp(s, 0.9f), tile.w, tile.h, radius, rgba(0, 0, 0, 0.08f));
        }
    }
    r.roundedRect(tile.x, tile.y, tile.w, tile.h, radius, stateBorderColor(state));
    r.roundedRectGradient(tile.x + 1.0f, tile.y + 1.0f, tile.w - 2.0f, tile.h - 2.0f,
                          std::max(1.0f, radius - 1.0f), stateTopColor(state), stateBottomColor(state));
    r.roundedStroke({tile.x + 1.2f, tile.y + 1.2f, tile.w - 2.4f, tile.h - 2.4f},
                    std::max(1.0f, radius - 1.2f), 1.0f,
                    rgba(255, 255, 255, state ? 0.035f : 0.18f));
}

void drawLogo(AppState *s, float cx, float y, float size) {
    Renderer &r = s->renderer;
    updateSplashBoard(s);
    float left = cx - size * 0.5f;
    Rect logo{left, y, size, size};
    drawPanel(r, logo, rgba(17, 22, 31, 0.92f));
    float gap = size * 0.04f;
    float tile = (size - gap * 6) / 5.0f;
    int64_t t = nowMs();
    float pulse = s->splashPulseUntil > t ? 1.0f - static_cast<float>(s->splashPulseUntil - t) / 360.0f : 1.0f;
    float pulseScale = pulse < 0.65f ? 0.90f + pulse / 0.65f * 0.18f : 1.08f - (pulse - 0.65f) / 0.35f * 0.08f;
    for (int row = 0; row < 5; ++row) {
        for (int col = 0; col < 5; ++col) {
            int idx = row * 5 + col;
            int v = s->splashState[static_cast<size_t>(idx)];
            bool changed = std::find(s->splashChanged.begin(), s->splashChanged.end(), idx) != s->splashChanged.end() && s->splashPulseUntil > t;
            float scale = changed ? pulseScale : 1.0f;
            float extra = tile * (scale - 1.0f) * 0.5f;
            Rect tileRect{left + gap + col * (tile + gap) - extra, y + gap + row * (tile + gap) - extra, tile + extra * 2.0f, tile + extra * 2.0f};
            float radius = std::min(10.0f, std::max(3.0f, tileRect.w * 0.055f));
            drawMatrixTileSurface(s, tileRect, v, radius, true);
            if (idx == s->splashTap && changed) {
                r.roundedStroke({tileRect.x - 2.0f, tileRect.y - 2.0f, tileRect.w + 4.0f, tileRect.h + 4.0f},
                                radius + 2.0f, std::max(1.0f, tile * 0.07f), withAlpha(TEXT, 0.84f));
            }
        }
    }
}

float beginScrollContent(AppState *s, float top) {
    return top - s->scroll;
}

void finishScrollContent(AppState *s, float y) {
    s->contentHeight = y + s->scroll;
    float clamped = clampScrollOffset(s, s->scroll);
    if (clamped != s->scroll) {
        s->scroll = clamped;
        stopScrollMomentum(s);
    }
}

void drawMain(AppState *s) {
    Renderer &r = s->renderer;
    float w = r.width;
    float textScale = menuTextScale(s);
    float availableH = std::max(dp(s, 180), r.height - safeTop(s) - safeBottom(s) - dp(s, 24));
    float logoLimit = std::max(dp(s, 64), w - dp(s, 96));
    float baseLogoSize = std::min(dp(s, 168), logoLimit);
    float baseBrandPad = std::min(r.height * 0.042f, dp(s, 36));
    float baseButtonH = dp(s, 48.0f + (textScale - 1.0f) * 12.0f);
    float baseButtonGap = dp(s, 9);
    float baseTitleScale = dp(s, 5.85f);
    bool baseTwoLineTitle = w < dp(s, 560) || r.textWidth("Invert the Matrix", baseTitleScale) > w - dp(s, 70);
    float baseTitleBlockH = baseTwoLineTitle ? dp(s, 82) : dp(s, 46);
    float baseMenuStackH = baseButtonH * 8.0f + baseButtonGap * 7.0f;
    float baseContentH = baseBrandPad + baseLogoSize + dp(s, 48) + baseTitleBlockH + dp(s, 28) + baseMenuStackH;
    float fit = clampFloat(availableH / std::max(1.0f, baseContentH), 0.72f, 1.0f);

    float minLogoSize = std::min(dp(s, 106), logoLimit);
    float logoSize = std::max(minLogoSize, baseLogoSize * fit);
    float brandPad = std::max(0.0f, baseBrandPad * fit);
    float buttonH = std::max(dp(s, 40), baseButtonH * fit);
    float buttonGap = std::max(dp(s, 5), baseButtonGap * fit);
    float titleScale = std::max(dp(s, 4.45f), baseTitleScale * fit);
    float titleOffset = std::max(dp(s, 34), dp(s, 48) * fit);
    float titleMenuGap = std::max(dp(s, 14), dp(s, 28) * fit);
    float titleLineGap = std::max(dp(s, 30), dp(s, 40) * fit);
    bool twoLineTitle = w < dp(s, 560) || r.textWidth("Invert the Matrix", titleScale) > w - dp(s, 70);
    float titleBlockH = twoLineTitle ? std::max(dp(s, 60), dp(s, 82) * fit) : std::max(dp(s, 38), dp(s, 46) * fit);
    float menuStackH = buttonH * 8.0f + buttonGap * 7.0f;
    float contentH = brandPad + logoSize + titleOffset + titleBlockH + titleMenuGap + menuStackH;
    float containerTop = (r.height - contentH - safeBottom(s) * 0.5f) * 0.5f + safeTop(s) * 0.35f;
    float minTop = safeTop(s) + dp(s, 2);
    float maxTop = std::max(minTop, r.height - safeBottom(s) - contentH - dp(s, 8));
    containerTop = contentH <= availableH ? clampFloat(containerTop, minTop, maxTop) : minTop;
    containerTop = beginScrollContent(s, containerTop);
    float top = containerTop + brandPad;

    drawLogo(s, w * 0.5f, top, logoSize);
    drawFittedText(s, tr(s, "A modular tile puzzle"), w * 0.5f, top + logoSize + std::max(dp(s, 9), dp(s, 14) * fit),
                   w - dp(s, 56), dp(s, 2.20f), GREEN, 1, true, 1.45f);
    float titleY = top + logoSize + titleOffset;
    if (twoLineTitle) {
        r.textHeavy("Invert the", w * 0.5f, titleY, titleScale, TEXT, 1, 1.0f);
        r.textHeavy("Matrix", w * 0.5f, titleY + titleLineGap, titleScale, TEXT, 1, 1.0f);
    } else {
        r.textHeavy("Invert the Matrix", w * 0.5f, titleY, titleScale, TEXT, 1, 1.0f);
    }

    float bw = std::min(w - dp(s, 36), dp(s, 420));
    float x = (w - bw) * 0.5f;
    float y = titleY + titleBlockH + titleMenuGap;
    std::vector<std::pair<Rect, std::string>> menuLabels;
    auto drawMenuButton = [&](const std::string &label, Action action) {
        Rect rect{x, y, bw, buttonH};
        float radius = dp(s, 8);
        r.roundedRect(rect.x, rect.y, rect.w, rect.h, radius, LINE);
        r.roundedRect(rect.x + 1.2f, rect.y + 1.2f, rect.w - 2.4f, rect.h - 2.4f,
                      std::max(1.0f, radius - 1.2f), PANEL_2);
        if (isPressedButton(s, rect, action, 0)) drawPressedButtonFeedback(s, rect, radius);
        float iconSize = std::min(dp(s, 27), rect.h * 0.62f);
        Rect icon{rect.x + rect.w - dp(s, 18) - iconSize, rect.y + (rect.h - iconSize) * 0.5f, iconSize, iconSize};
        drawMainMenuIcon(s, icon, action);
        menuLabels.push_back({rect, label});
        addButton(s, rect, action, 0, true);
        y += buttonH + buttonGap;
    };
    drawMenuButton(tr(s, "Campaign"), Action::Campaign);
    drawMenuButton(tr(s, "Custom Level"), Action::Freeplay);
    drawMenuButton(tr(s, "Playground"), Action::Playground);
    drawMenuButton(tr(s, "Daily Challenge"), Action::Daily);
    drawMenuButton(tr(s, "Achievements"), Action::Achievements);
    drawMenuButton(tr(s, "How to Play"), Action::HowTo);
    drawMenuButton(tr(s, "The Math"), Action::Math);
    drawMenuButton(tr(s, "Settings"), Action::Settings);
    for (const auto &item : menuLabels) {
        Rect rect = item.first;
        float scale = dp(s, 2.90f * textScale);
        drawFittedText(s, item.second, rect.x + dp(s, 16), rect.y + rect.h * 0.5f - scale * 4.0f,
                       rect.w - dp(s, 72), scale, TEXT, 0, true, 1.5f);
    }
    finishScrollContent(s, y - buttonGap + dp(s, 18));
}

void drawWebPadlockMark(AppState *s, Rect icon, Color shackleColor, Color bodyColor, Color keyColor);

void drawLevelNode(AppState *s, Rect rect, int index, int displayNumber, int stars, bool completed, bool hintUsed, bool enabled) {
    Renderer &r = s->renderer;
    float textScale = menuTextScale(s);
    float radius = dp(s, 8);
    Color border = completed ? rgba(99, 212, 157, enabled ? 0.34f : 0.16f) : (enabled ? LINE : rgba(190, 203, 220, 0.08f));
    Color fill = completed ? rgba(21, 35, 31, enabled ? 0.96f : 0.42f) : rgba(27, 35, 48, enabled ? 0.96f : 0.36f);
    r.roundedRect(rect.x, rect.y, rect.w, rect.h, radius, border);
    r.roundedRect(rect.x + 1.0f, rect.y + 1.0f, rect.w - 2.0f, rect.h - 2.0f, radius - 1.0f, fill);
    if (enabled && isPressedButton(s, rect, Action::StartCampaign, index)) drawPressedButtonFeedback(s, rect, radius);

    Color numberColor = enabled ? TEXT : rgba(210, 218, 230, 0.88f);
    r.textHeavy(std::to_string(displayNumber), rect.x + rect.w * 0.5f, rect.y + rect.h * 0.24f,
                dp(s, 3.35f * textScale), numberColor, 1, 0.82f);
    drawStars(s, rect.x + rect.w * 0.5f, rect.y + rect.h * 0.62f, dp(s, 10.5f), enabled ? stars : 0, 3, 1, enabled ? 1.0f : 0.62f);

    if (completed) {
        float badge = dp(s, 15);
        float cx = rect.x + rect.w - badge * 0.70f;
        float cy = rect.y + badge * 0.72f;
        drawCheckMark(s, cx, cy, badge * 0.62f, withAlpha(GREEN, enabled ? 0.96f : 0.42f));
        if (hintUsed) {
            drawHintEye(s, rect.x + dp(s, 13), rect.y + dp(s, 13), dp(s, 12), withAlpha(DANGER, enabled ? 0.98f : 0.42f));
        }
    } else if (!enabled) {
        Color lockColor = rgba(210, 218, 230, 0.46f);
        float lock = dp(s, 15);
        Rect icon{rect.x + rect.w - lock - dp(s, 5), rect.y + dp(s, 5), lock, lock};
        drawWebPadlockMark(s, icon, lockColor, withAlpha(lockColor, lockColor.a * 0.72f), lockColor);
    }

    if (enabled) addButton(s, rect, Action::StartCampaign, index, true);
}

int firstUnlockedCampaignGroup(AppState *s) {
    for (int group = 0; group < CAMPAIGN_GROUP_COUNT; ++group) {
        if (s->progress.groupUnlocked(group)) return group;
    }
    return 0;
}

int normalizeSelectedCampaignGroup(AppState *s) {
    int group = clampInt(s->selectedCampaignGroup, 0, CAMPAIGN_GROUP_COUNT - 1);
    if (!s->progress.groupUnlocked(group)) {
        int lastGroup = campaignGroupForLevel(s->lastCampaign);
        group = s->progress.groupUnlocked(lastGroup) ? lastGroup : firstUnlockedCampaignGroup(s);
    }
    s->selectedCampaignGroup = group;
    return group;
}

Color campaignMiniLevelColor(int stars, bool enabled) {
    if (!enabled) return rgba(244, 247, 251, 0.07f);
    if (stars >= 3) return rgba(99, 212, 157, 0.80f);
    if (stars == 2) return rgba(220, 164, 88, 0.76f);
    if (stars == 1) return rgba(88, 184, 232, 0.68f);
    return rgba(244, 247, 251, 0.10f);
}

void drawWebPadlockMark(AppState *s, Rect icon, Color shackleColor, Color bodyColor, Color keyColor) {
    Renderer &r = s->renderer;
    float side = std::min(icon.w, icon.h);
    float scale = side / 24.0f;
    float ox = icon.x + icon.w * 0.5f - 12.0f * scale;
    float oy = icon.y + icon.h * 0.5f - 12.0f * scale;
    auto sx = [&](float v) { return ox + v * scale; };
    auto sy = [&](float v) { return oy + v * scale; };

    if (r.skiaReady()) {
        SkPaint paint;
        paint.setAntiAlias(true);
        paint.setStrokeCap(SkPaint::kRound_Cap);
        paint.setStrokeJoin(SkPaint::kRound_Join);

        SkPathBuilder shackle;
        shackle.moveTo(sx(7.25f), sy(10.25f));
        shackle.lineTo(sx(7.25f), sy(8.10f));
        shackle.cubicTo(sx(7.25f), sy(5.48f), sx(9.38f), sy(3.35f), sx(12.0f), sy(3.35f));
        shackle.cubicTo(sx(14.62f), sy(3.35f), sx(16.75f), sy(5.48f), sx(16.75f), sy(8.10f));
        shackle.lineTo(sx(16.75f), sy(10.25f));
        paint.setStyle(SkPaint::kStroke_Style);
        paint.setStrokeWidth(std::max(1.0f, 2.15f * scale));
        paint.setColor(Renderer::skColor(shackleColor));
        r.skCanvas->drawPath(shackle.detach(), paint);

        paint.setStyle(SkPaint::kFill_Style);
        paint.setColor(Renderer::skColor(bodyColor));
        r.skCanvas->drawRoundRect(SkRect::MakeXYWH(sx(5.25f), sy(10.25f), 13.5f * scale, 10.0f * scale),
                                  2.6f * scale, 2.6f * scale, paint);

        paint.setStyle(SkPaint::kStroke_Style);
        paint.setStrokeWidth(std::max(1.0f, 2.15f * scale));
        paint.setColor(Renderer::skColor(keyColor));
        r.skCanvas->drawLine(sx(12.0f), sy(14.20f), sx(12.0f), sy(16.65f), paint);
        if (r.skContext) r.skContext->resetContext();
        return;
    }

    float stroke = std::max(1.0f, 2.15f * scale);
    float cx = sx(12.0f);
    float rx = 4.75f * scale;
    float ry = 4.75f * scale;
    float arcCy = sy(8.10f);
    r.line(sx(7.25f), sy(10.25f), sx(7.25f), sy(8.10f), stroke, shackleColor);
    float prevX = sx(7.25f);
    float prevY = sy(8.10f);
    for (int i = 1; i <= 12; ++i) {
        float a = 3.14159265f - static_cast<float>(i) / 12.0f * 3.14159265f;
        float x = cx + std::cos(a) * rx;
        float y = arcCy - std::sin(a) * ry;
        r.line(prevX, prevY, x, y, stroke, shackleColor);
        prevX = x;
        prevY = y;
    }
    r.line(sx(16.75f), sy(8.10f), sx(16.75f), sy(10.25f), stroke, shackleColor);
    r.roundedRect(sx(5.25f), sy(10.25f), 13.5f * scale, 10.0f * scale, 2.6f * scale, bodyColor);
    r.line(sx(12.0f), sy(14.20f), sx(12.0f), sy(16.65f), stroke, keyColor);
}

void drawCampaignGroupTile(AppState *s, Rect rect, int group, bool selected) {
    Renderer &r = s->renderer;
    float textScale = menuTextScale(s);
    bool enabled = s->progress.groupUnlocked(group);
    int stars = s->progress.groupStars(group);
    bool completed = stars >= CAMPAIGN_GROUP_STAR_TARGET;
    float radius = dp(s, 8);
    float borderInset = std::max(1.0f, dp(s, 1.15f));
    Color border = enabled ? rgba(244, 247, 251, selected ? 0.94f : 0.86f) : rgba(190, 203, 220, 0.08f);
    Color fill = enabled ? rgba(27, 35, 48, 0.96f) : rgba(21, 27, 36, 0.56f);
    if (enabled && selected) r.glow(rect, dp(s, 6), rgba(139, 212, 255, 0.10f), 3);
    r.roundedRect(rect.x, rect.y, rect.w, rect.h, radius, border);
    r.roundedRect(rect.x + borderInset, rect.y + borderInset, rect.w - borderInset * 2.0f, rect.h - borderInset * 2.0f,
                  std::max(1.0f, radius - borderInset), fill);
    if (enabled && completed) {
        r.roundedStroke({rect.x + borderInset, rect.y + borderInset, rect.w - borderInset * 2.0f, rect.h - borderInset * 2.0f},
                        std::max(1.0f, radius - borderInset), std::max(1.0f, dp(s, 1.0f)), rgba(99, 212, 157, 0.28f));
    }
    if (enabled && selected) {
        r.roundedStroke({rect.x + borderInset, rect.y + borderInset, rect.w - borderInset * 2.0f, rect.h - borderInset * 2.0f},
                        std::max(1.0f, radius - borderInset), std::max(1.0f, dp(s, 1.05f)), rgba(139, 212, 255, 0.32f));
    }
    if (enabled && isPressedButton(s, rect, Action::CampaignGroup, group)) drawPressedButtonFeedback(s, rect, radius);

    float badge = std::min(dp(s, 22), rect.w * 0.34f);
    r.roundedRect(rect.x + dp(s, 6), rect.y + dp(s, 6), badge, badge, badge * 0.5f, rgba(190, 203, 220, enabled ? 0.22f : 0.10f));
    r.textHeavy(std::to_string(group + 1), rect.x + dp(s, 6) + badge * 0.5f, rect.y + dp(s, 6) + badge * 0.27f,
                std::min(dp(s, 2.05f * textScale), badge * 0.16f), enabled ? MUTED_STRONG : rgba(210, 218, 230, 0.48f), 1, 0.78f);

    float mini = std::min(rect.w - dp(s, 16), rect.h * 0.43f);
    float gap = std::max(dp(s, 1.5f), mini * 0.055f);
    float cell = (mini - gap * 2.0f) / 3.0f;
    float gridX = rect.x + (rect.w - mini) * 0.5f;
    float gridY = rect.y + rect.h * 0.37f - mini * 0.5f;
    for (int level = 0; level < CAMPAIGN_LEVELS_PER_GROUP; ++level) {
        int col = level % 3;
        int row = level / 3;
        std::string id = campaignLevelIdFor(group, level);
        int levelStars = clampInt(s->progress.stars(id), 0, 3);
        Rect cellRect{gridX + col * (cell + gap), gridY + row * (cell + gap), cell, cell};
        r.roundedRect(cellRect.x, cellRect.y, cellRect.w, cellRect.h, dp(s, 2.5f), rgba(190, 203, 220, enabled ? 0.16f : 0.06f));
        r.roundedRect(cellRect.x + 1.0f, cellRect.y + 1.0f, cellRect.w - 2.0f, cellRect.h - 2.0f, dp(s, 2.0f), campaignMiniLevelColor(levelStars, enabled));
        if (s->progress.hintUsed(id)) {
            r.roundedRect(cellRect.x + 1.5f, cellRect.y + 1.5f, cellRect.w - 3.0f, cellRect.h - 3.0f, dp(s, 2.0f), rgba(229, 111, 126, 0.42f));
        }
    }

    drawFittedText(s, std::to_string(stars) + "/" + std::to_string(CAMPAIGN_GROUP_STAR_MAX),
                   rect.x + rect.w * 0.5f, rect.y + rect.h - dp(s, 18), rect.w - dp(s, 10), dp(s, 1.86f * textScale),
                   enabled ? TEXT : rgba(210, 218, 230, 0.52f), 1, true, 1.05f);

    if (!enabled) {
        Color lockColor = rgba(210, 218, 230, 0.52f);
        float lock = dp(s, 18);
        Rect icon{rect.x + rect.w - lock - dp(s, 6), rect.y + dp(s, 5), lock, lock};
        drawWebPadlockMark(s, icon, lockColor, withAlpha(lockColor, lockColor.a * 0.72f), lockColor);
    }

    if (enabled) addButton(s, rect, Action::CampaignGroup, group, true);
}

void drawCampaign(AppState *s) {
    Renderer &r = s->renderer;
    float textScale = menuTextScale(s);
    float contentTop = sectionContentTop(s);
    float y = beginScrollContent(s, contentTop);
    float margin = dp(s, 18);
    float panelW = r.width - margin * 2.0f;
    if (!campaignLevelsReady(s)) {
        Rect panel{margin, y, panelW, dp(s, 156)};
        drawGlassPanel(s, panel, PANEL);
        float pad = dp(s, 16);
        float titleScale = dp(s, 2.65f * textScale);
        float bodyScale = dp(s, 1.86f * textScale);
        r.textHeavy(tr(s, "Campaign data unavailable"), panel.x + pad, panel.y + pad + dp(s, 8), titleScale, TEXT);
        std::vector<std::string> lines = wrapTextLines(s,
                                                       tr(s, "The bundled campaign asset could not be loaded. Reload the app or check that campaign-levels.json is included."),
                                                       bodyScale,
                                                       panel.w - pad * 2.0f);
        float ly = panel.y + pad + std::max(dp(s, 46), titleScale * 12.0f);
        for (const std::string &line : lines) {
            drawFittedText(s, line, panel.x + pad, ly, panel.w - pad * 2.0f, bodyScale, MUTED);
            ly += std::max(dp(s, 23), bodyScale * 12.0f);
        }
        y += panel.h + dp(s, 24);
        finishScrollContent(s, y);
        drawStickyScreenHeader(s, "Campaign", "Campaign", Action::Main, contentTop);
        return;
    }

    int selectedGroup = normalizeSelectedCampaignGroup(s);

    float mapGap = dp(s, 8);
    float mapCell = (panelW - mapGap * (CAMPAIGN_MAP_SIZE - 1)) / CAMPAIGN_MAP_SIZE;
    float mapH = mapCell * CAMPAIGN_MAP_SIZE + mapGap * (CAMPAIGN_MAP_SIZE - 1);
    for (int group = 0; group < CAMPAIGN_GROUP_COUNT; ++group) {
        int col = group % CAMPAIGN_MAP_SIZE;
        int row = group / CAMPAIGN_MAP_SIZE;
        Rect rect{margin + col * (mapCell + mapGap), y + row * (mapCell + mapGap), mapCell, mapCell};
        bool visible = rect.y < r.height + dp(s, 48) && rect.y + rect.h > -dp(s, 48);
        if (visible) drawCampaignGroupTile(s, rect, group, group == selectedGroup);
    }
    y += mapH + dp(s, 24);

    std::string groupTitle = tr(s, "Group") + " " + std::to_string(selectedGroup + 1) + ": " + tr(s, chapterTitles[static_cast<size_t>(selectedGroup)]);
    float groupTitleScale = dp(s, 2.45f * textScale);
    drawFittedText(s, groupTitle, margin, y, panelW, groupTitleScale, TEXT);
    y += std::max(dp(s, 42), groupTitleScale * 12.0f);

    float gridGap = dp(s, 10);
    float levelH = dp(s, 74.0f + (textScale - 1.0f) * 16.0f);
    float levelCell = (panelW - gridGap * 2.0f) / 3.0f;
    for (int level = 0; level < CAMPAIGN_LEVELS_PER_GROUP; ++level) {
        int index = selectedGroup * CAMPAIGN_LEVELS_PER_GROUP + level;
        int col = level % 3;
        int row = level / 3;
        Rect rect{margin + col * (levelCell + gridGap), y + row * (levelH + gridGap), levelCell, levelH};
        std::string id = campaignLevelIdFor(selectedGroup, level);
        int stars = s->progress.stars(id);
        bool completed = s->progress.completed(id);
        bool hintUsed = s->progress.hintUsed(id);
        bool enabled = s->progress.unlocked(index);
        drawLevelNode(s, rect, index, level + 1, stars, completed, hintUsed, enabled);
    }
    y += levelH * 3.0f + gridGap * 2.0f + dp(s, 18);
    finishScrollContent(s, y);
    drawStickyScreenHeader(s, "Campaign", "Campaign", Action::Main, contentTop);
}

std::string dailyChallengeBestText(AppState *s, int tier, const std::string &date) {
    int moves = s->progress.getInt("daily_moves_" + dailyChallengeKey(date, tier), -1);
    return moves < 0 ? tr(s, "Not played today") : tr(s, "Best:") + " " + std::to_string(moves);
}

std::string dailyLeaderboardName(AppState *s, int index) {
    if (index < 3) return localizedDailyTierLabel(s, index);
    return tr(s, "Global");
}

float vectorLabelWidth(Renderer &r, const std::string &text, float textScale) {
    if (!r.vectorFontReady) return r.textWidth(text, textScale);
    float pixelHeight = std::max(8.0f, textScale * 6.2f);
    float scale = stbtt_ScaleForPixelHeight(&r.vectorFontInfo, pixelHeight);
    float width = 0.0f;
    int previous = 0;
    for (int codepoint : r.utf8Codepoints(text)) {
        if (previous) width += stbtt_GetCodepointKernAdvance(&r.vectorFontInfo, previous, codepoint) * scale;
        int advance = 0;
        int leftBearing = 0;
        stbtt_GetCodepointHMetrics(&r.vectorFontInfo, codepoint, &advance, &leftBearing);
        width += advance * scale;
        previous = codepoint;
    }
    return width;
}

void drawVectorFittedText(AppState *s, const std::string &text, float x, float centerY, float maxWidth,
                          float textScale, Color color, int align = 0) {
    Renderer &r = s->renderer;
    if (s->language == "ko") {
        drawFittedText(s, text, x, centerY - textScale * 3.1f, maxWidth, textScale, color, align, true, 1.18f);
        return;
    }
    while (vectorLabelWidth(r, text, textScale) > maxWidth && textScale > dp(s, 1.18f)) {
        textScale *= 0.94f;
    }
    if (!r.skiaReady() || !r.vectorFontReady) {
        drawFittedText(s, text, x, centerY - textScale * 3.1f, maxWidth, textScale, color, align, true, 1.18f);
        return;
    }

    float width = vectorLabelWidth(r, text, textScale);
    if (align == 1) x -= width * 0.5f;
    if (align == 2) x -= width;

    float pixelHeight = std::max(8.0f, textScale * 6.2f);
    float scale = stbtt_ScaleForPixelHeight(&r.vectorFontInfo, pixelHeight);
    int ascent = 0;
    int descent = 0;
    stbtt_GetFontVMetrics(&r.vectorFontInfo, &ascent, &descent, nullptr);
    float baseline = centerY + (ascent + descent) * scale * 0.5f;
    float cursor = x;
    int previous = 0;
    SkPathBuilder textBuilder;
    for (int codepoint : r.utf8Codepoints(text)) {
        if (previous) cursor += stbtt_GetCodepointKernAdvance(&r.vectorFontInfo, previous, codepoint) * scale;
        stbtt_vertex *vertices = nullptr;
        int vertexCount = stbtt_GetCodepointShape(&r.vectorFontInfo, codepoint, &vertices);
        bool open = false;
        for (int i = 0; i < vertexCount; ++i) {
            const stbtt_vertex &v = vertices[i];
            float px = cursor + v.x * scale;
            float py = baseline - v.y * scale;
            if (v.type == STBTT_vmove) {
                if (open) textBuilder.close();
                textBuilder.moveTo(px, py);
                open = true;
            } else if (v.type == STBTT_vline) {
                textBuilder.lineTo(px, py);
            } else if (v.type == STBTT_vcurve) {
                textBuilder.quadTo(cursor + v.cx * scale, baseline - v.cy * scale, px, py);
            } else if (v.type == STBTT_vcubic) {
                textBuilder.cubicTo(cursor + v.cx * scale, baseline - v.cy * scale,
                                    cursor + v.cx1 * scale, baseline - v.cy1 * scale, px, py);
            }
        }
        if (open) textBuilder.close();
        if (vertices) stbtt_FreeShape(&r.vectorFontInfo, vertices);
        int advance = 0;
        int leftBearing = 0;
        stbtt_GetCodepointHMetrics(&r.vectorFontInfo, codepoint, &advance, &leftBearing);
        cursor += advance * scale;
        previous = codepoint;
    }

    SkPaint paint;
    paint.setAntiAlias(true);
    paint.setColor(Renderer::skColor(color));
    paint.setStyle(SkPaint::kFill_Style);
    r.skCanvas->drawPath(textBuilder.detach(), paint);
}

void drawDaily(AppState *s) {
    Renderer &r = s->renderer;
    float textScale = menuTextScale(s);
    float contentTop = sectionContentTop(s);
    float y = beginScrollContent(s, contentTop);
    float margin = dp(s, 18);
    float gap = dp(s, 12);
    float cardW = r.width - margin * 2.0f;
    std::string date = dailyKey();

    for (int tier = 0; tier < 3; ++tier) {
        Rect card{margin, y, cardW, dp(s, 78.0f + (textScale - 1.0f) * 16.0f)};
        Color accent = dailyTierAccent(tier);
        drawGlassPanel(s, card, PANEL);
        float radius = std::min(dp(s, 8), card.h * 0.18f);
        if (isPressedButton(s, card, Action::DailyChallenge, tier)) drawPressedButtonFeedback(s, card, radius);

        float iconSize = dp(s, 48);
        float iconX = card.x + dp(s, 14);
        drawDailyGridIcon(s, {iconX, card.y + (card.h - iconSize) * 0.5f, iconSize, iconSize}, tier, accent);

        float recordW = std::min(dp(s, 160), card.w * 0.40f);
        float recordX = card.x + card.w - dp(s, 14) - recordW;
        float textX = iconX + iconSize + dp(s, 14);
        float textW = std::max(dp(s, 96), recordX - textX - dp(s, 12));
        bool hasPlayedToday = s->progress.getInt("daily_moves_" + dailyChallengeKey(date, tier), -1) >= 0;
        float tierTextScale = dp(s, 3.18f * textScale);
        drawFittedText(s, localizedDailyTierLabel(s, tier),
                       textX, card.y + card.h * 0.5f - tierTextScale * 4.0f,
                       textW, tierTextScale, accent, 0, true, 2.05f);
        float recordTextScale = dp(s, (hasPlayedToday ? 1.88f : 1.72f) * textScale);
        drawFittedText(s, dailyChallengeBestText(s, tier, date),
                       recordX + recordW, card.y + card.h * 0.5f - recordTextScale * 4.0f,
                       recordW, recordTextScale,
                       hasPlayedToday ? TEXT : MUTED, 2, hasPlayedToday, 1.20f);
        addButton(s, card, Action::DailyChallenge, tier, true);
        y += card.h + gap;
    }

    y += dp(s, 14);
    r.text(tr(s, "Leaderboards"), margin, y, dp(s, 2.55f * textScale), TEXT);
    y += dp(s, 32.0f + (textScale - 1.0f) * 12.0f);

    float leaderboardGap = dp(s, 8);
    float leaderboardSmallW = (cardW - leaderboardGap * 2.0f) / 3.0f;
    float leaderboardSmallH = dp(s, 76.0f + (textScale - 1.0f) * 12.0f);
    for (int i = 0; i < 3; ++i) {
        Rect row{margin + static_cast<float>(i) * (leaderboardSmallW + leaderboardGap), y,
                 leaderboardSmallW, leaderboardSmallH};
        Color accent = dailyTierAccent(i);
        drawGlassPanel(s, row, PANEL_2);
        float radius = std::min(dp(s, 8), row.h * 0.18f);
        if (isPressedButton(s, row, Action::Leaderboard, i)) drawPressedButtonFeedback(s, row, radius);

        float iconW = std::min(dp(s, 48), row.w * 0.44f);
        float iconH = row.h - dp(s, 10);
        Rect icon{row.x + dp(s, 7), row.y + (row.h - iconH) * 0.5f, iconW, iconH};
        drawDailyLeaderboardIcon(s, icon, i, accent);
        float labelX = icon.x + icon.w + dp(s, 5);
        float labelW = std::max(dp(s, 24), row.x + row.w - dp(s, 7) - labelX);
        drawVectorFittedText(s, dailyLeaderboardName(s, i),
                             labelX, row.y + row.h * 0.5f,
                             labelW, dp(s, 1.94f * textScale), TEXT, 0);
        addButton(s, row, Action::Leaderboard, i, true);
    }

    y += leaderboardSmallH + dp(s, 28);
    float globalW = std::min(cardW * 0.72f, dp(s, 300));
    Rect global{margin + (cardW - globalW) * 0.5f, y, globalW, dp(s, 82.0f + (textScale - 1.0f) * 14.0f)};
    drawGlassPanel(s, global, PANEL_2);
    float globalRadius = std::min(dp(s, 8), global.h * 0.18f);
    if (isPressedButton(s, global, Action::Leaderboard, 3)) drawPressedButtonFeedback(s, global, globalRadius);
    float globalIconW = dp(s, 62);
    float globalIconH = global.h - dp(s, 12);
    Rect globalIcon{global.x + dp(s, 16), global.y + (global.h - globalIconH) * 0.5f,
                    globalIconW, globalIconH};
    drawDailyLeaderboardIcon(s, globalIcon, 3, withAlpha(TEXT, 0.88f));
    float globalLabelX = globalIcon.x + globalIcon.w + dp(s, 12);
    drawVectorFittedText(s, dailyLeaderboardName(s, 3),
                         globalLabelX, global.y + global.h * 0.5f,
                         global.x + global.w - dp(s, 16) - globalLabelX, dp(s, 2.60f * textScale), TEXT, 0);
    addButton(s, global, Action::Leaderboard, 3, true);
    y += global.h;

    y += dp(s, 10);
    finishScrollContent(s, y);
    drawStickyScreenHeader(s, "Daily", "Daily Challenges", Action::Main, contentTop);
}

void drawChips(AppState *s, float &y, const std::vector<std::string> &labels, const std::string &selected,
               Action action, int columns = 3, int selectedIndex = -1, float textScaleBoost = 1.0f) {
    float margin = dp(s, 18), gap = dp(s, 8);
    float textScale = menuTextScale(s);
    float chipH = dp(s, 46.0f + (textScale - 1.0f) * 10.0f);
    float cell = (s->renderer.width - margin * 2 - gap * (columns - 1)) / columns;
    for (int i = 0; i < static_cast<int>(labels.size()); ++i) {
        int col = i % columns;
        int row = i / columns;
        Rect rect{margin + col * (cell + gap), y + row * (chipH + gap), cell, chipH};
        bool isSelected = selectedIndex >= 0 ? i == selectedIndex : labels[i] == selected;
        drawButton(s, rect, labels[i], action, i, false, isSelected, true, textScaleBoost * textScale);
    }
    y += (static_cast<int>((labels.size() + columns - 1) / columns)) * (chipH + gap) + dp(s, 10);
}

std::set<std::pair<int, int>> patternChoiceCells(const std::string &key) {
    if (key == "randomMixed") {
        return {{2, 2}, {1, 1}, {3, 3}, {0, 2}, {4, 2}, {1, 4}, {3, 0}};
    }
    std::set<std::pair<int, int>> active;
    Pattern pattern = patternFor(key);
    int center = 2;
    for (auto &offset : pattern.offsets) {
        int x = center + offset.first;
        int y = center + offset.second;
        if (x >= 0 && x < 5 && y >= 0 && y < 5) active.insert({x, y});
    }
    return active;
}

Color patternChoiceActiveColor(const std::string &key, int x, int y) {
    if (x == 2 && y == 2) return GREEN;
    if (key != "randomMixed") return BLUE;
    int shade = (x + y) % 3;
    if (shade == 0) return ORANGE;
    if (shade == 1) return PURPLE;
    return BLUE;
}

void drawPatternChoiceIcon(AppState *s, Rect rect, const std::string &key) {
    Renderer &r = s->renderer;
    float radius = std::min(dp(s, 6), rect.h * 0.20f);
    r.roundedRect(rect.x, rect.y, rect.w, rect.h, radius, rgba(190, 203, 220, 0.20f));
    r.roundedRect(rect.x + 1.0f, rect.y + 1.0f, rect.w - 2.0f, rect.h - 2.0f,
                  std::max(1.0f, radius - 1.0f), rgba(7, 10, 14, 0.30f));

    std::set<std::pair<int, int>> active = patternChoiceCells(key);
    int grid = 5;
    float pad = std::max(2.0f, rect.w * 0.12f);
    float gap = std::max(1.0f, rect.w * 0.045f);
    float side = std::min(rect.w, rect.h) - pad * 2.0f;
    float tile = (side - gap * static_cast<float>(grid - 1)) / static_cast<float>(grid);
    float left = rect.x + (rect.w - (tile * grid + gap * (grid - 1))) * 0.5f;
    float top = rect.y + (rect.h - (tile * grid + gap * (grid - 1))) * 0.5f;

    for (int y = 0; y < grid; ++y) {
        for (int x = 0; x < grid; ++x) {
            bool on = active.count({x, y}) > 0;
            Rect cell{left + x * (tile + gap), top + y * (tile + gap), tile, tile};
            Color fill = on ? patternChoiceActiveColor(key, x, y) : rgba(244, 247, 251, 0.14f);
            r.roundedRect(cell.x, cell.y, cell.w, cell.h, std::max(1.0f, tile * 0.22f), fill);
            if (x == 2 && y == 2) {
                r.roundedStroke(cell, std::max(1.0f, tile * 0.22f), 1.0f, rgba(7, 19, 15, on ? 0.42f : 0.0f));
            }
        }
    }
}

void drawPatternChips(AppState *s, float &y, const std::vector<std::string> &patternKeys, int selectedIndex, Action action = Action::Pattern) {
    Renderer &r = s->renderer;
    float textScale = menuTextScale(s);
    float margin = dp(s, 18);
    float gap = dp(s, 8);
    int columns = 2;
    float cellW = (r.width - margin * 2 - gap * static_cast<float>(columns - 1)) / static_cast<float>(columns);
    float cellH = dp(s, 62.0f + (textScale - 1.0f) * 12.0f);
    for (int i = 0; i < static_cast<int>(patternKeys.size()); ++i) {
        int col = i % columns;
        int row = i / columns;
        Rect card{margin + col * (cellW + gap), y + row * (cellH + gap), cellW, cellH};
        bool selected = i == selectedIndex;
        float radius = std::min(dp(s, 8), card.h * 0.20f);
        Color border = selected ? withAlpha(BLUE, 0.68f) : LINE;
        Color fill = selected ? rgba(34, 66, 86, 0.82f) : PANEL_2;
        r.roundedRect(card.x, card.y, card.w, card.h, radius, border);
        r.roundedRect(card.x + 1.5f, card.y + 1.5f, card.w - 3.0f, card.h - 3.0f,
                      std::max(0.0f, radius - 1.5f), fill);
        if (isPressedButton(s, card, action, i)) drawPressedButtonFeedback(s, card, radius);

        Rect icon{card.x + dp(s, 8), card.y + (card.h - dp(s, 42)) * 0.5f, dp(s, 42), dp(s, 42)};
        drawPatternChoiceIcon(s, icon, patternKeys[static_cast<size_t>(i)]);
        float textX = icon.x + icon.w + dp(s, 8);
        float labelScale = dp(s, 2.34f * textScale);
        drawFittedText(s, localizedPatternLabel(s, patternKeys[static_cast<size_t>(i)]),
                       textX, card.y + card.h * 0.5f - labelScale * 4.0f,
                       card.x + card.w - textX - dp(s, 8), labelScale,
                       selected ? TEXT : MUTED_STRONG, 0, true, 1.18f);
        addButton(s, card, action, i, true);
    }
    int rows = static_cast<int>((patternKeys.size() + columns - 1) / columns);
    y += rows * (cellH + gap) + dp(s, 10);
}

void drawFreeplay(AppState *s) {
    Renderer &r = s->renderer;
    float textScale = menuTextScale(s);
    float headingScale = dp(s, 3.28f * textScale);
    float headingH = dp(s, 31.0f + (textScale - 1.0f) * 13.0f);
    float contentTop = sectionContentTop(s);
    float y = beginScrollContent(s, contentTop);
    std::vector<std::string> sizes = {"3x3", "4x4", "5x5", "6x6", "7x7", tr(s, "Custom")};
    int sizeIndex = s->freeSize == "Custom" ? 5 : s->freeSize == "7x7" ? 4 : s->freeSize == "6x6" ? 3 : s->freeSize == "5x5" ? 2 : s->freeSize == "4x4" ? 1 : 0;
    r.text(tr(s, "Grid Size"), dp(s, 18), y, headingScale, TEXT); y += headingH;
    drawChips(s, y, sizes, "", Action::Size, 3, sizeIndex, 1.10f);
    if (s->freeSize == "Custom") {
        float controlH = dp(s, 44.0f + (textScale - 1.0f) * 8.0f);
        float labelScale = dp(s, 3.05f * textScale);
        drawButton(s, {dp(s, 18), y, dp(s, 70), controlH}, "-", Action::WidthMinus, 0, false, false, true, textScale);
        r.text(tr(s, "Width") + " " + std::to_string(s->customW), r.width * 0.5f, y + controlH * 0.5f - labelScale * 4.0f, labelScale, TEXT, 1);
        drawButton(s, {r.width - dp(s, 88), y, dp(s, 70), controlH}, "+", Action::WidthPlus, 0, false, false, true, textScale);
        y += controlH + dp(s, 10);
        drawButton(s, {dp(s, 18), y, dp(s, 70), controlH}, "-", Action::HeightMinus, 0, false, false, true, textScale);
        r.text(tr(s, "Height") + " " + std::to_string(s->customH), r.width * 0.5f, y + controlH * 0.5f - labelScale * 4.0f, labelScale, TEXT, 1);
        drawButton(s, {r.width - dp(s, 88), y, dp(s, 70), controlH}, "+", Action::HeightPlus, 0, false, false, true, textScale);
        y += controlH + dp(s, 18);
    }
    r.text(tr(s, "States"), dp(s, 18), y, headingScale, TEXT); y += headingH;
    drawChips(s, y, {"2", "3", "4", "5"}, std::to_string(s->freeStates), Action::States, 4, -1, 1.10f);
    r.text(tr(s, "Tap Pattern"), dp(s, 18), y, headingScale, TEXT); y += headingH;
    std::vector<std::string> patternKeys = {"cross", "diagonal", "square", "horizontal", "vertical", "knight", "randomMixed"};
    int patternIndex = 0;
    for (int i = 0; i < static_cast<int>(patternKeys.size()); ++i) {
        if (patternKeys[static_cast<size_t>(i)] == s->freePattern) patternIndex = i;
    }
    drawPatternChips(s, y, patternKeys, patternIndex);
    r.text(tr(s, "Difficulty"), dp(s, 18), y, headingScale, TEXT); y += headingH;
    std::vector<std::string> difficulties = {"Easy", "Medium", "Hard", "Expert"};
    std::vector<std::string> difficultyLabels;
    int difficultyIndex = 1;
    for (int i = 0; i < static_cast<int>(difficulties.size()); ++i) {
        if (difficulties[static_cast<size_t>(i)] == s->freeDifficulty) difficultyIndex = i;
        difficultyLabels.push_back(localizedDifficulty(s, difficulties[static_cast<size_t>(i)]));
    }
    drawChips(s, y, difficultyLabels, "", Action::Difficulty, 2, difficultyIndex, 1.10f);
    r.text(tr(s, "Extras"), dp(s, 18), y, headingScale, TEXT); y += headingH;
    float toggleH = dp(s, 46.0f + (textScale - 1.0f) * 10.0f);
    drawButton(s, {dp(s, 18), y, r.width - dp(s, 36), toggleH}, tr(s, "Tiles with lock icons") + " " + onOff(s, s->freeLocked), Action::ToggleLocked, 0, false, s->freeLocked, true, 1.10f * textScale); y += toggleH + dp(s, 10);
    drawButton(s, {dp(s, 18), y, r.width - dp(s, 36), toggleH}, tr(s, "Irregular board") + " " + onOff(s, s->freeIrregular), Action::ToggleIrregular, 0, false, s->freeIrregular, true, 1.10f * textScale); y += toggleH + dp(s, 10);
    s->freeUnique = true;
    y += dp(s, 10);
    float createH = dp(s, 56.0f + (textScale - 1.0f) * 10.0f);
    drawButton(s, {dp(s, 18), y, r.width - dp(s, 36), createH}, tr(s, "Create Puzzle"), Action::Generate, 0, true, false, true, textScale); y += createH + dp(s, 24);
    finishScrollContent(s, y);
    drawStickyScreenHeader(s, "Custom Level", "Custom Level", Action::Main, contentTop);
}

void drawPadlockBadge(AppState *s, Rect badge);

Rect drawPlaygroundEditorBoard(AppState *s, float &y) {
    Renderer &r = s->renderer;
    PlaygroundConfig config = playgroundConfigFromState(s);
    float margin = dp(s, 18);
    float maxW = r.width - margin * 2.0f;
    float maxH = dp(s, 330);
    float cell = std::min(maxW / static_cast<float>(config.width), maxH / static_cast<float>(config.height));
    float boardW = cell * static_cast<float>(config.width);
    float boardH = cell * static_cast<float>(config.height);
    Rect board{(r.width - boardW) * 0.5f, y, boardW, boardH};
    float framePad = std::max(dp(s, 7), std::min(dp(s, 10), cell * 0.12f));
    Rect frame{board.x - framePad, board.y - framePad, board.w + framePad * 2.0f, board.h + framePad * 2.0f};
    r.roundedRect(frame.x, frame.y, frame.w, frame.h, dp(s, 8), LINE_STRONG);
    r.roundedRect(frame.x + 1.0f, frame.y + 1.0f, frame.w - 2.0f, frame.h - 2.0f, dp(s, 7), rgba(10, 13, 19, 0.84f));
    float gap = std::max(dp(s, 4), std::min(dp(s, 7), cell * 0.075f));
    for (int row = 0; row < config.height; ++row) {
        for (int col = 0; col < config.width; ++col) {
            int idx = indexFor(col, row, config.width);
            Rect tile{board.x + col * cell + gap * 0.5f, board.y + row * cell + gap * 0.5f, cell - gap, cell - gap};
            if (config.disabled.count(idx)) {
                float radius = std::min(dp(s, 9), tile.w * 0.10f);
                r.roundedRect(tile.x, tile.y, tile.w, tile.h, radius, rgba(190, 203, 220, 0.12f));
                r.roundedRect(tile.x + 1, tile.y + 1, tile.w - 2, tile.h - 2, std::max(1.0f, radius - 1.0f), rgba(0, 0, 0, 0.62f));
                r.roundedStroke(tile, radius, 1.0f, rgba(229, 236, 245, 0.16f));
                addButton(s, tile, Action::PlaygroundTile, idx, true);
                continue;
            }
            int state = config.board[static_cast<size_t>(idx)];
            float radius = std::min(dp(s, 10), std::max(dp(s, 6), tile.w * 0.055f));
            drawMatrixTileSurface(s, tile, state, radius, true);
            if (config.locked.count(idx)) {
                float badgeSize = std::max(dp(s, 16), std::min(dp(s, 25), tile.w * 0.30f));
                drawPadlockBadge(s, {tile.x + tile.w - badgeSize - dp(s, 4), tile.y + dp(s, 4), badgeSize, badgeSize});
            }
            if (s->showPlaygroundNumbers) {
                std::string label = std::to_string(state);
                r.text(label, tile.x + tile.w * 0.5f, tile.y + tile.h * 0.5f - tile.w * 0.13f,
                       std::max(2.0f, tile.w / 24.0f), state ? TEXT : rgba(24, 32, 43), 1);
            }
            addButton(s, tile, Action::PlaygroundTile, idx, true);
        }
    }
    y += boardH + framePad + dp(s, 22);
    return board;
}

void drawPlaygroundCursorIcon(AppState *s, Rect rect, Color color, bool selected) {
    Renderer &r = s->renderer;
    float side = std::min(rect.w, rect.h) * 0.66f;
    float scale = side / 24.0f;
    float ox = rect.x + rect.w * 0.5f - 12.0f * scale;
    float oy = rect.y + rect.h * 0.5f - 12.0f * scale;
    auto sx = [&](float v) { return ox + v * scale; };
    auto sy = [&](float v) { return oy + v * scale; };

    if (r.skiaReady()) {
        auto buildPath = [&](float dx, float dy) {
            SkPathBuilder builder;
            builder.moveTo(sx(8.0f) + dx, sy(3.0f) + dy);
            builder.lineTo(sx(8.0f) + dx, sy(14.0f) + dy);
            builder.lineTo(sx(11.0f) + dx, sy(12.0f) + dy);
            builder.lineTo(sx(13.4f) + dx, sy(17.3f) + dy);
            builder.lineTo(sx(16.1f) + dx, sy(16.1f) + dy);
            builder.lineTo(sx(13.7f) + dx, sy(10.8f) + dy);
            builder.lineTo(sx(17.0f) + dx, sy(10.3f) + dy);
            return builder.close().detach();
        };

        SkPaint paint;
        paint.setAntiAlias(true);
        paint.setStyle(SkPaint::kFill_Style);
        paint.setColor(Renderer::skColor(rgba(0, 0, 0, selected ? 0.24f : 0.18f)));
        r.skCanvas->drawPath(buildPath(scale * 0.70f, scale * 0.80f), paint);

        SkPath path = buildPath(0.0f, 0.0f);
        paint.setStyle(SkPaint::kStroke_Style);
        paint.setStrokeWidth(std::max(1.0f, scale * 1.28f));
        paint.setStrokeJoin(SkPaint::kRound_Join);
        paint.setStrokeCap(SkPaint::kRound_Cap);
        paint.setColor(Renderer::skColor(rgba(7, 10, 14, selected ? 0.42f : 0.48f)));
        r.skCanvas->drawPath(path, paint);

        paint.setStyle(SkPaint::kFill_Style);
        paint.setColor(Renderer::skColor(color));
        r.skCanvas->drawPath(path, paint);
        if (r.skContext) r.skContext->resetContext();
        return;
    }

    auto px = [&](float v) { return sx(v); };
    auto py = [&](float v) { return sy(v); };
    auto drawCursor = [&](float dx, float dy, Color c) {
        float x0 = px(8.0f) + dx, y0 = py(3.0f) + dy;
        float x1 = px(8.0f) + dx, y1 = py(14.0f) + dy;
        float x2 = px(11.0f) + dx, y2 = py(12.0f) + dy;
        float x3 = px(13.4f) + dx, y3 = py(17.3f) + dy;
        float x4 = px(16.1f) + dx, y4 = py(16.1f) + dy;
        float x5 = px(13.7f) + dx, y5 = py(10.8f) + dy;
        float x6 = px(17.0f) + dx, y6 = py(10.3f) + dy;
        r.tri(x0, y0, x1, y1, x2, y2, c);
        r.tri(x0, y0, x2, y2, x5, y5, c);
        r.tri(x0, y0, x5, y5, x6, y6, c);
        r.tri(x2, y2, x3, y3, x4, y4, c);
        r.tri(x2, y2, x4, y4, x5, y5, c);
    };
    drawCursor(scale * 0.70f, scale * 0.80f, rgba(0, 0, 0, selected ? 0.24f : 0.18f));
    drawCursor(0.0f, 0.0f, color);
}

void drawPlaygroundHoleIcon(AppState *s, Rect rect, Color color, bool selected) {
    Renderer &r = s->renderer;
    float cx = rect.x + rect.w * 0.5f;
    float cy = rect.y + rect.h * 0.5f;
    float arm = std::min(rect.w, rect.h) * 0.23f;
    float stroke = std::max(dp(s, 3.0f), std::min(rect.w, rect.h) * 0.085f);
    Color shadow = rgba(7, 10, 14, selected ? 0.48f : 0.34f);
    r.line(cx - arm, cy - arm, cx + arm, cy + arm, stroke * 1.86f, shadow);
    r.line(cx + arm, cy - arm, cx - arm, cy + arm, stroke * 1.86f, shadow);
    r.line(cx - arm, cy - arm, cx + arm, cy + arm, stroke, color);
    r.line(cx + arm, cy - arm, cx - arm, cy + arm, stroke, color);
}

void drawPlaygroundToolButton(AppState *s, Rect rect, int tool) {
    Renderer &r = s->renderer;
    bool selected = s->playgroundTool == tool;
    float radius = std::min(dp(s, 8), rect.h * 0.22f);
    Color border = selected ? withAlpha(BLUE, 0.72f) : LINE;
    Color fill = selected ? rgba(42, 91, 115, 0.82f) : PANEL_2;
    r.roundedRect(rect.x, rect.y, rect.w, rect.h, radius, border);
    r.roundedRect(rect.x + 1.2f, rect.y + 1.2f, rect.w - 2.4f, rect.h - 2.4f,
                  std::max(0.0f, radius - 1.2f), fill);
    if (isPressedButton(s, rect, Action::PlaygroundTool, tool)) drawPressedButtonFeedback(s, rect, radius);

    int paintState = playgroundPaintStateForTool(tool);
    if (paintState >= 0) {
        float swatch = std::min(rect.w, rect.h) * 0.54f;
        Rect tile{rect.x + (rect.w - swatch) * 0.5f, rect.y + (rect.h - swatch) * 0.5f, swatch, swatch};
        drawMatrixTileSurface(s, tile, paintState, std::min(dp(s, 7), swatch * 0.20f), true);
        if (paintState == 0) r.roundedStroke(tile, std::min(dp(s, 7), swatch * 0.20f), dp(s, 1.2f), rgba(7, 10, 14, 0.30f));
    } else if (tool == PLAYGROUND_TOOL_LOCK) {
        float size = std::min(rect.w, rect.h) * 0.52f;
        drawPadlockBadge(s, {rect.x + (rect.w - size) * 0.5f, rect.y + (rect.h - size) * 0.5f, size, size});
    } else if (tool == PLAYGROUND_TOOL_HOLE) {
        drawPlaygroundHoleIcon(s, rect, selected ? TEXT : MUTED_STRONG, selected);
    } else {
        drawPlaygroundCursorIcon(s, rect, selected ? TEXT : MUTED_STRONG, selected);
    }
    addButton(s, rect, Action::PlaygroundTool, tool, true);
}

void drawPlaygroundToolbelt(AppState *s, float &y) {
    float margin = dp(s, 18);
    float gap = dp(s, 8);
    int columns = 4;
    float cell = (s->renderer.width - margin * 2.0f - gap * static_cast<float>(columns - 1)) / static_cast<float>(columns);
    std::vector<int> tools = {PLAYGROUND_TOOL_TAP};
    for (int state = 0; state < s->playgroundStates; ++state) tools.push_back(playgroundPaintTool(state));
    tools.push_back(PLAYGROUND_TOOL_LOCK);
    tools.push_back(PLAYGROUND_TOOL_HOLE);
    float h = dp(s, 46);
    for (int i = 0; i < static_cast<int>(tools.size()); ++i) {
        int col = i % columns;
        int row = i / columns;
        drawPlaygroundToolButton(s, {margin + col * (cell + gap), y + row * (h + gap), cell, h}, tools[static_cast<size_t>(i)]);
    }
    int rows = static_cast<int>((tools.size() + columns - 1) / columns);
    y += rows * (h + gap) + dp(s, 10);
}

void drawPlaygroundSectionHeaderText(AppState *s, Rect rect, const std::string &label, const std::string &value) {
    float textScale = menuTextScale(s);
    std::string left = tr(s, label);
    if (left.empty()) left = label;
    std::string right = value.empty() ? "-" : value;
    float leftScale = dp(s, 2.22f * textScale);
    float rightScale = dp(s, 2.12f * textScale);
    float centerY = rect.y + rect.h * 0.5f;
    drawFittedText(s, left, rect.x + dp(s, 12), centerY - leftScale * 4.0f, rect.w * 0.48f, leftScale, MUTED_STRONG, 0, true, 1.0f);
    drawFittedText(s, right, rect.x + rect.w * 0.52f, centerY - rightScale * 4.0f, rect.w * 0.36f, rightScale, TEXT, 0, true, 1.0f);
}

Rect drawPlaygroundSectionHeader(AppState *s, float &y, const std::string &label, const std::string &value, int section, bool open, bool drawText = true) {
    Renderer &r = s->renderer;
    float textScale = menuTextScale(s);
    Rect rect{dp(s, 18), y, r.width - dp(s, 36), dp(s, 44.0f + (textScale - 1.0f) * 10.0f)};
    float radius = std::min(dp(s, 8), rect.h * 0.22f);
    r.roundedRect(rect.x, rect.y, rect.w, rect.h, radius, open ? withAlpha(BLUE, 0.42f) : LINE);
    r.roundedRect(rect.x + 1.2f, rect.y + 1.2f, rect.w - 2.4f, rect.h - 2.4f,
                  std::max(0.0f, radius - 1.2f), open ? rgba(34, 66, 86, 0.72f) : PANEL_2);
    if (isPressedButton(s, rect, Action::PlaygroundSection, section)) drawPressedButtonFeedback(s, rect, radius);
    if (drawText) drawPlaygroundSectionHeaderText(s, rect, label, value);
    float cx = rect.x + rect.w - dp(s, 22);
    float cy = rect.y + rect.h * 0.5f;
    if (open) {
        r.line(cx - dp(s, 6), cy + dp(s, 3), cx, cy - dp(s, 3), dp(s, 2.2f), MUTED_STRONG);
        r.line(cx, cy - dp(s, 3), cx + dp(s, 6), cy + dp(s, 3), dp(s, 2.2f), MUTED_STRONG);
    } else {
        r.line(cx - dp(s, 6), cy - dp(s, 3), cx, cy + dp(s, 3), dp(s, 2.2f), MUTED_STRONG);
        r.line(cx, cy + dp(s, 3), cx + dp(s, 6), cy - dp(s, 3), dp(s, 2.2f), MUTED_STRONG);
    }
    addButton(s, rect, Action::PlaygroundSection, section, true);
    y += rect.h + dp(s, 8);
    return rect;
}

void drawPlayground(AppState *s) {
    Renderer &r = s->renderer;
    float textScale = menuTextScale(s);
    PlaygroundConfig config = playgroundConfigFromState(s);
    float contentTop = sectionContentTop(s);
    float y = beginScrollContent(s, contentTop);
    drawPlaygroundToolbelt(s, y);
    std::vector<std::tuple<Rect, std::string, std::string>> sectionLabels;

    std::string statesValue = s->language == "ko" ? "상태 " + std::to_string(config.states) + "개" :
                              std::to_string(config.states) + " " + tr(s, "states");
    sectionLabels.push_back({drawPlaygroundSectionHeader(s, y, "States", statesValue, 0, s->playgroundStatesOpen, false),
                             "States", statesValue});
    if (s->playgroundStatesOpen) {
        drawChips(s, y, {"2", "3", "4", "5"}, std::to_string(config.states), Action::PlaygroundStates, 4, -1, 1.10f);
    }

    int patternIndex = 0;
    for (int i = 0; i < static_cast<int>(PLAYGROUND_PATTERNS.size()); ++i) {
        if (PLAYGROUND_PATTERNS[static_cast<size_t>(i)] == config.pattern) patternIndex = i;
    }
    std::string patternValue = localizedPatternLabel(s, config.pattern);
    sectionLabels.push_back({drawPlaygroundSectionHeader(s, y, "Tap Pattern", patternValue, 1, s->playgroundPatternOpen, false),
                             "Tap Pattern", patternValue});
    if (s->playgroundPatternOpen) {
        drawPatternChips(s, y, PLAYGROUND_PATTERNS, patternIndex, Action::PlaygroundPattern);
    }

    std::string sizeValue = std::to_string(config.width) + "x" + std::to_string(config.height);
    sectionLabels.push_back({drawPlaygroundSectionHeader(s, y, "Grid Size", sizeValue, 2, s->playgroundSizeOpen, false),
                             "Grid Size", sizeValue});
    if (s->playgroundSizeOpen) {
        float controlH = dp(s, 44.0f + (textScale - 1.0f) * 8.0f);
        float labelScale = dp(s, 3.05f * textScale);
        drawButton(s, {dp(s, 18), y, dp(s, 70), controlH}, "-", Action::PlaygroundWidthMinus, 0, false, false, true, textScale);
        r.text(tr(s, "Width") + " " + std::to_string(config.width), r.width * 0.5f, y + controlH * 0.5f - labelScale * 4.0f, labelScale, TEXT, 1);
        drawButton(s, {r.width - dp(s, 88), y, dp(s, 70), controlH}, "+", Action::PlaygroundWidthPlus, 0, false, false, true, textScale);
        y += controlH + dp(s, 10);
        drawButton(s, {dp(s, 18), y, dp(s, 70), controlH}, "-", Action::PlaygroundHeightMinus, 0, false, false, true, textScale);
        r.text(tr(s, "Height") + " " + std::to_string(config.height), r.width * 0.5f, y + controlH * 0.5f - labelScale * 4.0f, labelScale, TEXT, 1);
        drawButton(s, {r.width - dp(s, 88), y, dp(s, 70), controlH}, "+", Action::PlaygroundHeightPlus, 0, false, false, true, textScale);
        y += controlH + dp(s, 18);
    }

    std::string code = encodePlaygroundSeed(config);
    std::string codeValue = tr(s, "Share");
    sectionLabels.push_back({drawPlaygroundSectionHeader(s, y, "Puzzle Code", codeValue, 3, s->playgroundCodeOpen, false),
                             "Puzzle Code", codeValue});
    if (s->playgroundCodeOpen) {
        Rect codeCard{dp(s, 18), y, r.width - dp(s, 36), dp(s, 52.0f + (textScale - 1.0f) * 8.0f)};
        drawGlassPanel(s, codeCard, PANEL);
        float codeScale = dp(s, 1.80f * textScale);
        drawFittedText(s, code, codeCard.x + dp(s, 10), codeCard.y + codeCard.h * 0.5f - codeScale * 4.0f, codeCard.w - dp(s, 20), codeScale, MUTED_STRONG, 0, false, 0.74f);
        y += codeCard.h + dp(s, 12);
        float gap = dp(s, 10);
        float half = (r.width - dp(s, 36) - gap) * 0.5f;
        float codeButtonH = dp(s, 46.0f + (textScale - 1.0f) * 8.0f);
        drawButton(s, {dp(s, 18), y, half, codeButtonH}, tr(s, "Copy Code"), Action::PlaygroundCopy, 0, true, false, true, 0.96f * textScale);
        drawButton(s, {dp(s, 18) + half + gap, y, half, codeButtonH}, tr(s, "Paste Code"), Action::PlaygroundPaste, 0, true, false, true, 0.96f * textScale);
        y += codeButtonH + dp(s, 12);
    }
    for (const auto &label : sectionLabels) {
        drawPlaygroundSectionHeaderText(s, std::get<0>(label), std::get<1>(label), std::get<2>(label));
    }

    drawPlaygroundEditorBoard(s, y);

    float clearH = dp(s, 50.0f + (textScale - 1.0f) * 8.0f);
    drawButton(s, {dp(s, 18), y, r.width - dp(s, 36), clearH}, tr(s, "Clear Board"), Action::PlaygroundClear, 0, false, false, true, 0.98f * textScale);
    y += clearH + dp(s, 12);
    if (!s->playgroundStatus.empty()) {
        float statusScale = dp(s, 2.10f * textScale);
        drawFittedText(s, tr(s, s->playgroundStatus), dp(s, 18), y, r.width - dp(s, 36), statusScale, MUTED_STRONG);
        y += statusScale * 12.0f;
    }
    finishScrollContent(s, y + dp(s, 16));
    drawStickyScreenHeader(s, "Playground", "Playground", Action::Main, contentTop);
}

enum class FormulaKind {
    Hero,
    Remainder,
    Wrap,
    Column,
    Plan,
    Goal,
    Image,
    Kernel,
    Minimum,
    Prime,
    Four,
    Symbols
};

const char *formulaAssetId(FormulaKind kind) {
    switch (kind) {
        case FormulaKind::Hero: return "hero";
        case FormulaKind::Remainder: return "remainder";
        case FormulaKind::Wrap: return "wrap";
        case FormulaKind::Column: return "column";
        case FormulaKind::Plan: return "plan";
        case FormulaKind::Goal: return "goal";
        case FormulaKind::Image: return "image";
        case FormulaKind::Kernel: return "kernel";
        case FormulaKind::Minimum: return "minimum";
        case FormulaKind::Prime: return "prime";
        case FormulaKind::Four: return "four";
        case FormulaKind::Symbols: return nullptr;
    }
    return nullptr;
}

const MathAssetSpec *findMathAsset(const char *id) {
    if (!id) return nullptr;
    for (const MathAssetSpec &spec : kMathAssets) {
        if (std::strcmp(spec.id, id) == 0) return &spec;
    }
    return nullptr;
}

void drawMathPanel(AppState *s, Rect panel, Color accent) {
    Renderer &r = s->renderer;
    float radius = dp(s, 8);
    r.roundedRect(panel.x, panel.y + dp(s, 0.8f), panel.w, panel.h, radius, rgba(0, 0, 0, 0.10f));
    r.roundedRect(panel.x, panel.y, panel.w, panel.h, radius, LINE);
    r.roundedRect(panel.x + 1.0f, panel.y + 1.0f, panel.w - 2.0f, panel.h - 2.0f, radius - 1.0f, PANEL);
}

float drawFormulaToken(AppState *s, const std::string &text, float x, float y, float scale,
                       Color color, bool heavy = false, float gapDp = 5.0f) {
    Renderer &r = s->renderer;
    if (heavy) r.textHeavy(text, x, y, scale, color);
    else r.text(text, x, y, scale, color);
    return x + r.textWidth(text, scale) + dp(s, gapDp);
}

float drawFormulaVar(AppState *s, const std::string &main, const std::string &sub, float x, float y,
                     float scale, Color color = TEXT, float gapDp = 5.0f) {
    Renderer &r = s->renderer;
    r.textHeavy(main, x, y, scale, color, 0, 0.50f);
    float w = r.textWidth(main, scale);
    if (!sub.empty()) {
        float subScale = scale * 0.52f;
        r.text(sub, x + w + dp(s, 0.6f), y + scale * 2.65f, subScale, MUTED);
        w += r.textWidth(sub, subScale) + dp(s, 1.0f);
    }
    return x + w + dp(s, gapDp);
}

float drawFormulaSymbol(AppState *s, int codepoint, const std::string &fallback, float x, float y,
                        float scale, Color color, float gapDp = 5.0f) {
    Renderer &r = s->renderer;
    if (r.mathReady && r.mathIndex(codepoint) >= 0) {
        r.mathGlyph(codepoint, x, y, scale, color);
        return x + r.mathWidth(codepoint, scale) + dp(s, gapDp);
    }
    return drawFormulaToken(s, fallback, x, y, scale * 0.78f, color, false, gapDp);
}

float drawFormulaMathVar(AppState *s, int codepoint, const std::string &fallback,
                         const std::string &sub, float x, float y, float scale,
                         Color color = TEXT, float gapDp = 5.0f) {
    Renderer &r = s->renderer;
    float w = 0.0f;
    if (r.mathReady && r.mathIndex(codepoint) >= 0) {
        r.mathGlyph(codepoint, x, y, scale, color);
        w = r.mathWidth(codepoint, scale);
    } else {
        r.textHeavy(fallback, x, y, scale, color, 0, 0.50f);
        w = r.textWidth(fallback, scale);
    }
    if (!sub.empty()) {
        float subScale = scale * 0.52f;
        r.text(sub, x + w + dp(s, 0.6f), y + scale * 2.65f, subScale, MUTED);
        w += r.textWidth(sub, subScale) + dp(s, 1.0f);
    }
    return x + w + dp(s, gapDp);
}

float drawCongruentSymbol(AppState *s, float x, float y, float scale, Color color, bool slash = false) {
    Renderer &r = s->renderer;
    int codepoint = slash ? 0x2262 : 0x2261;
    if (r.mathReady && r.mathIndex(codepoint) >= 0) {
        float symbolScale = scale * 1.02f;
        r.mathGlyph(codepoint, x, y + scale * 0.03f, symbolScale, color);
        return x + r.mathWidth(codepoint, symbolScale) + dp(s, 6);
    }
    float w = scale * 1.70f;
    float top = y + scale * 2.30f;
    float gap = scale * 0.43f;
    float th = std::max(1.2f, scale * 0.14f);
    r.line(x, top, x + w, top, th, color);
    r.line(x, top + gap, x + w, top + gap, th, color);
    r.line(x, top + gap * 2.0f, x + w, top + gap * 2.0f, th, color);
    if (slash) {
        r.line(x + w * 0.20f, top + gap * 2.40f, x + w * 0.82f, top - gap * 0.45f,
               std::max(1.15f, scale * 0.11f), color);
    }
    return x + w + dp(s, 6);
}

float drawLeftArrowSymbol(AppState *s, float x, float y, float scale, Color color) {
    Renderer &r = s->renderer;
    if (r.mathReady && r.mathIndex(0x2190) >= 0) {
        float symbolScale = scale * 1.02f;
        r.mathGlyph(0x2190, x, y + scale * 0.03f, symbolScale, color);
        return x + r.mathWidth(0x2190, symbolScale) + dp(s, 6);
    }
    float w = scale * 2.05f;
    float cy = y + scale * 3.08f;
    float th = std::max(1.4f, scale * 0.13f);
    r.line(x + w, cy, x, cy, th, color);
    r.line(x, cy, x + scale * 0.58f, cy - scale * 0.48f, th, color);
    r.line(x, cy, x + scale * 0.58f, cy + scale * 0.48f, th, color);
    return x + w + dp(s, 6);
}

float drawImplicationSymbol(AppState *s, float x, float y, float scale, Color color) {
    Renderer &r = s->renderer;
    if (r.mathReady && r.mathIndex(0x21D2) >= 0) {
        float symbolScale = scale * 1.02f;
        r.mathGlyph(0x21D2, x, y + scale * 0.03f, symbolScale, color);
        return x + r.mathWidth(0x21D2, symbolScale) + dp(s, 7);
    }
    float w = scale * 2.0f;
    float cy = y + scale * 3.02f;
    float th = std::max(1.3f, scale * 0.12f);
    r.line(x, cy, x + w, cy, th, color);
    r.line(x + w, cy, x + w - scale * 0.58f, cy - scale * 0.48f, th, color);
    r.line(x + w, cy, x + w - scale * 0.58f, cy + scale * 0.48f, th, color);
    return x + w + dp(s, 7);
}

float drawFormulaNorm(AppState *s, float x, float y, float scale, Color color) {
    Renderer &r = s->renderer;
    if (r.mathReady && r.mathIndex(0x2225) >= 0) {
        r.mathGlyph(0x2225, x, y + scale * 0.03f, scale, color);
        x += r.mathWidth(0x2225, scale) + dp(s, 1.0f);
    } else {
        x = drawFormulaToken(s, "||", x, y, scale, color, true, 1.0f);
    }
    x = drawFormulaToken(s, "x", x, y, scale, color, true, 1.0f);
    if (r.mathReady && r.mathIndex(0x2225) >= 0) {
        r.mathGlyph(0x2225, x, y + scale * 0.03f, scale, color);
        x += r.mathWidth(0x2225, scale) + dp(s, 1.0f);
    } else {
        x = drawFormulaToken(s, "||", x, y, scale, color, true, 1.0f);
    }
    r.text("1", x + dp(s, 0.4f), y + scale * 2.65f, scale * 0.52f, MUTED);
    return x + r.textWidth("1", scale * 0.52f) + dp(s, 6);
}

void drawCaseBrace(AppState *s, float x, float top, float bottom, Color color) {
    Renderer &r = s->renderer;
    float hook = dp(s, 8);
    float mid = (top + bottom) * 0.5f;
    float th = dp(s, 1.45f);
    r.line(x + hook, top, x, top + hook, th, color);
    r.line(x, top + hook, x, mid - hook * 0.25f, th, color);
    r.line(x, mid - hook * 0.25f, x + hook * 0.42f, mid, th, color);
    r.line(x + hook * 0.42f, mid, x, mid + hook * 0.25f, th, color);
    r.line(x, mid + hook * 0.25f, x, bottom - hook, th, color);
    r.line(x, bottom - hook, x + hook, bottom, th, color);
}

void drawFormulaShell(AppState *s, Rect card, Color accent) {
    Renderer &r = s->renderer;
    float radius = dp(s, 8);
    r.roundedRect(card.x, card.y, card.w, card.h, radius, LINE);
    r.roundedRect(card.x + 1.0f, card.y + 1.0f, card.w - 2.0f, card.h - 2.0f,
                  radius - 1.0f, rgba(7, 10, 14, 0.88f));
}

void drawGoalFormula(AppState *s, float x, float y, float scale) {
    x = drawFormulaToken(s, "A", x, y, scale, TEXT, true);
    x = drawFormulaToken(s, "x", x - dp(s, 2), y, scale, TEXT, true);
    x = drawCongruentSymbol(s, x + dp(s, 2), y, scale, MUTED);
    x = drawFormulaToken(s, "-", x, y, scale, TEXT, true);
    x = drawFormulaToken(s, "s", x - dp(s, 4), y, scale, TEXT, true);
    drawFormulaToken(s, "(mod n)", x + dp(s, 4), y + scale * 0.18f, scale * 0.74f, MUTED);
}

bool drawGeneratedFormula(AppState *s, Rect card, FormulaKind kind) {
    Renderer &r = s->renderer;
    if (!r.skiaReady()) return false;
    const MathAssetSpec *spec = findMathAsset(formulaAssetId(kind));
    if (!spec) return false;

    MathImageAsset &asset = s->mathImages[spec->id];
    if (!asset.image && !asset.attempted) {
        asset.attempted = true;
        asset.width = spec->width;
        asset.height = spec->height;
        if (readAssetBytes(s, spec->file, asset.pixels) &&
            asset.pixels.size() == static_cast<size_t>(spec->width * spec->height * 4)) {
            SkImageInfo info = SkImageInfo::Make(spec->width, spec->height,
                                                 kRGBA_8888_SkColorType, kUnpremul_SkAlphaType);
            SkPixmap pixmap(info, asset.pixels.data(), static_cast<size_t>(spec->width * 4));
            asset.image = SkImages::RasterFromPixmapCopy(pixmap);
        }
        if (!asset.image) {
            LOGE("Unable to load generated math asset %s", spec->file);
            asset.pixels.clear();
        }
    }
    if (!asset.image) return false;

    float pad = dp(s, 8);
    float maxW = std::max(1.0f, card.w - pad * 2.0f);
    float maxH = std::max(1.0f, card.h - pad * 2.0f);
    float scale = std::min(maxW / static_cast<float>(spec->width), maxH / static_cast<float>(spec->height));
    float drawW = spec->width * scale;
    float drawH = spec->height * scale;
    SkRect dst = SkRect::MakeXYWH(card.x + (card.w - drawW) * 0.5f,
                                  card.y + (card.h - drawH) * 0.5f,
                                  drawW, drawH);
    SkPaint paint;
    paint.setAntiAlias(true);
    r.skCanvas->drawImageRect(asset.image, dst, SkSamplingOptions(SkFilterMode::kLinear), &paint);
    return true;
}

void drawFormulaCard(AppState *s, Rect card, FormulaKind kind, Color accent = GREEN) {
    Renderer &r = s->renderer;
    drawFormulaShell(s, card, accent);
    if (drawGeneratedFormula(s, card, kind)) return;
    float x = card.x + dp(s, 13);
    float scale = std::min(dp(s, 3.45f), card.h * 0.145f);
    float y = card.y + card.h * 0.5f - scale * 3.06f;

    if (kind == FormulaKind::Hero) {
        drawGoalFormula(s, x + dp(s, 4), y, scale);
    } else if (kind == FormulaKind::Goal) {
        float rowScale = std::min(dp(s, 3.0f), card.h * 0.105f);
        float row1 = card.y + dp(s, 13);
        float row2 = card.y + card.h - dp(s, 13) - rowScale * 6.2f;
        float gx = x;
        gx = drawFormulaToken(s, "s", gx, row1, rowScale, TEXT, true, 2.0f);
        gx = drawFormulaToken(s, "+", gx, row1, rowScale, MUTED, false, 2.0f);
        gx = drawFormulaToken(s, "A", gx, row1, rowScale, TEXT, true, 2.0f);
        gx = drawFormulaToken(s, "x", gx, row1, rowScale, TEXT, true, 5.0f);
        gx = drawCongruentSymbol(s, gx, row1, rowScale, MUTED);
        gx = drawFormulaToken(s, "0", gx, row1, rowScale, TEXT, true, 6.0f);
        drawFormulaToken(s, "(mod n)", gx, row1 + rowScale * 0.18f, rowScale * 0.72f, MUTED);
        drawGoalFormula(s, x + dp(s, 1), row2, rowScale);
    } else if (kind == FormulaKind::Remainder) {
        x = drawFormulaVar(s, "s", "i", x, y - dp(s, 4), scale, TEXT, 6.0f);
        x = drawFormulaSymbol(s, 0x2208, "in", x, y - dp(s, 4), scale * 0.90f, MUTED, 7.0f);
        x = drawFormulaMathVar(s, 0x2124, "Z", "n", x, y - dp(s, 4), scale, TEXT, 2.0f);
        r.text("{0, 1, ..., n - 1}", card.x + dp(s, 13), card.y + card.h - dp(s, 25), scale * 0.62f, MUTED);
    } else if (kind == FormulaKind::Wrap) {
        float base = card.x + dp(s, 22);
        float second = base + std::min(dp(s, 118), card.w * 0.30f);
        drawFormulaVar(s, "s", "i", base, y, scale, TEXT, 0.0f);
        drawLeftArrowSymbol(s, base + std::min(dp(s, 60), card.w * 0.16f), y, scale, MUTED);
        x = drawFormulaVar(s, "s", "i", second, y, scale, TEXT, 2.0f);
        x = drawFormulaToken(s, "+", x, y, scale, MUTED, false, 2.0f);
        x = drawFormulaToken(s, "1", x, y, scale, TEXT, true, 7.0f);
        drawFormulaToken(s, "(mod n)", x, y + scale * 0.18f, scale * 0.72f, MUTED);
    } else if (kind == FormulaKind::Column) {
        float rowTop = card.y + dp(s, 15);
        float rowGap = dp(s, 29);
        float lhsScale = scale * 0.86f;
        float base = card.x + dp(s, 17);
        float braceX = card.x + std::min(dp(s, 112), card.w * 0.34f);
        drawCaseBrace(s, braceX, card.y + dp(s, 14), card.y + card.h - dp(s, 13), MUTED);
        drawFormulaVar(s, "A", "ij", base, rowTop + dp(s, 2), lhsScale, TEXT, 2.0f);
        drawFormulaToken(s, "=", braceX - dp(s, 34), rowTop + dp(s, 2), lhsScale, MUTED, false, 0.0f);
        r.textHeavy("1", braceX + dp(s, 19), rowTop, scale * 0.62f, TEXT, 0, 0.40f);
        drawFittedText(s, tr(s, "if tap j changes tile i"), braceX + dp(s, 45), rowTop + dp(s, 1),
                       card.x + card.w - braceX - dp(s, 56), scale * 0.52f, TEXT, 0, false, 0.82f);
        r.textHeavy("0", braceX + dp(s, 19), rowTop + rowGap, scale * 0.62f, MUTED, 0, 0.35f);
        drawFittedText(s, tr(s, "otherwise"), braceX + dp(s, 45), rowTop + rowGap + dp(s, 1),
                       card.x + card.w - braceX - dp(s, 56), scale * 0.52f, MUTED, 0, false, 0.82f);
    } else if (kind == FormulaKind::Plan) {
        x = drawFormulaVar(s, "x", "j", x, y, scale, TEXT, 5.0f);
        x = drawFormulaToken(s, "=", x, y, scale, MUTED, false, 6.0f);
        drawFittedText(s, tr(s, "number of taps on tile j"), x, y + scale * 0.18f,
                       card.x + card.w - x - dp(s, 10), scale * 0.62f, TEXT, 0, false, 0.88f);
    } else if (kind == FormulaKind::Image) {
        float rowScale = std::min(scale * 0.92f, dp(s, 2.80f));
        drawFittedText(s, tr(s, "solution exists iff"), card.x + dp(s, 13), card.y + dp(s, 12),
                       card.w - dp(s, 26), rowScale * 0.62f, MUTED, 0, false, 0.88f);
        float rowY = card.y + card.h - dp(s, 19) - rowScale * 4.6f;
        x = card.x + dp(s, 13);
        x = drawFormulaToken(s, "-s", x, rowY, rowScale, TEXT, true, 7.0f);
        x = drawFormulaSymbol(s, 0x2208, "in", x, rowY, rowScale * 0.88f, MUTED, 6.0f);
        drawFormulaToken(s, "Im(A)", x, rowY, rowScale, TEXT, true, 0.0f);
    } else if (kind == FormulaKind::Kernel) {
        float rowScale = std::min(scale * 0.88f, dp(s, 2.62f));
        float rowY = y + dp(s, 1);
        x = drawFormulaToken(s, tr(s, "solutions"), x, rowY, rowScale * 0.70f, MUTED, false, 4.0f);
        x = drawFormulaToken(s, "=", x, rowY, rowScale, MUTED, false, 4.0f);
        x = drawFormulaVar(s, "x", "0", x, rowY, rowScale, TEXT, 3.0f);
        x = drawFormulaToken(s, "+", x, rowY, rowScale, MUTED, false, 4.0f);
        drawFormulaToken(s, "ker(A)", x, rowY, rowScale, TEXT, true, 0.0f);
    } else if (kind == FormulaKind::Minimum) {
        x = drawFormulaToken(s, "min", x, y + scale * 0.18f, scale * 0.68f, MUTED);
        x = drawFormulaNorm(s, x + dp(s, 1), y, scale, TEXT);
        x = drawFormulaToken(s, "=", x + dp(s, 5), y, scale, MUTED);
        x = drawFormulaToken(s, "min", x, y + scale * 0.18f, scale * 0.68f, MUTED);
        x = drawFormulaSymbol(s, 0x2211, "sum", x + dp(s, 1), y + scale * 0.02f, scale * 0.92f, TEXT, 2.0f);
        r.text("j", x - dp(s, 5), y + scale * 3.25f, scale * 0.48f, MUTED);
        drawFormulaVar(s, "x", "j", x + dp(s, 1), y, scale, TEXT);
    } else if (kind == FormulaKind::Prime) {
        float rowScale = std::min(scale * 0.88f, dp(s, 2.7f));
        x = drawFormulaToken(s, "n", x, y, rowScale, TEXT, true, 5.0f);
        x = drawFormulaSymbol(s, 0x2208, "in", x, y, rowScale * 0.82f, MUTED, 5.0f);
        x = drawFormulaToken(s, "{2, 3, 5}", x, y, rowScale, TEXT, true, 7.0f);
        x = drawImplicationSymbol(s, x, y, rowScale, MUTED);
        x = drawFormulaMathVar(s, 0x2124, "Z", "n", x, y, rowScale, TEXT, 3.0f);
        drawFittedText(s, tr(s, "is a field"), x, y + rowScale * 0.24f,
                       card.x + card.w - x - dp(s, 10), rowScale * 0.62f, TEXT, 0, false, 0.82f);
    } else if (kind == FormulaKind::Four) {
        float rowScale = scale * 0.92f;
        x = drawFormulaToken(s, "2a", x, y, rowScale, TEXT, true, 7.0f);
        x = drawCongruentSymbol(s, x, y, rowScale, MUTED, true);
        x = drawFormulaToken(s, "1", x, y, rowScale, TEXT, true, 7.0f);
        drawFormulaToken(s, "(mod 4)", x, y + rowScale * 0.14f, rowScale * 0.66f, MUTED);
    } else if (kind == FormulaKind::Symbols) {
        float rowY = card.y + dp(s, 13);
        std::array<std::pair<std::string, std::string>, 7> rows = {{
                {"n", "modulus / tile states"},
                {"s", "board vector in (Z/nZ)^m"},
                {"A", "columns are effect vectors"},
                {"x", "tap-count vector in (Z/nZ)^r"},
                {"Im(A)", "reachable board changes"},
                {"ker(A)", "tap-count vectors with A x = 0"},
                {"mod n", "values wrap after n - 1"}
        }};
        for (auto &row : rows) {
            r.textHeavy(row.first, card.x + dp(s, 12), rowY, dp(s, 1.82f), TEXT, 0, 0.45f);
            drawFittedText(s, tr(s, row.second), card.x + dp(s, 76), rowY + dp(s, 1),
                           card.w - dp(s, 88), dp(s, 1.62f), MUTED, 0, false, 0.90f);
            rowY += dp(s, 19.5f);
        }
    }
}

enum class GuideDiagramKind {
    None,
    Goal,
    Read,
    Tap,
    Pattern,
    Special,
    Modes,
    Moves,
    Options
};

struct GuideDiagramTile {
    int state = 0;
    bool preview = false;
    bool locked = false;
    bool gap = false;
    bool hinted = false;
    std::string label;
};

GuideDiagramTile guideTile(int state, bool preview = false, bool locked = false,
                           bool gap = false, bool hinted = false, const std::string &label = "") {
    return {state, preview, locked, gap, hinted, label};
}

std::array<GuideDiagramTile, 9> guideDiagramTiles(GuideDiagramKind kind) {
    std::array<GuideDiagramTile, 9> tiles{};
    switch (kind) {
        case GuideDiagramKind::Goal:
            tiles = {{
                    guideTile(1), guideTile(2), guideTile(0),
                    guideTile(3), guideTile(0, true), guideTile(1),
                    guideTile(0), guideTile(2), guideTile(0)
            }};
            break;
        case GuideDiagramKind::Read:
            tiles = {{
                    guideTile(0), guideTile(1), guideTile(0),
                    guideTile(1), guideTile(2), guideTile(1),
                    guideTile(0), guideTile(3), guideTile(0)
            }};
            break;
        case GuideDiagramKind::Tap:
            tiles = {{
                    guideTile(0), guideTile(0, true), guideTile(0),
                    guideTile(0, true), guideTile(3, true), guideTile(0, true),
                    guideTile(0), guideTile(0, true), guideTile(0)
            }};
            break;
        case GuideDiagramKind::Pattern:
            tiles = {{
                    guideTile(0, true), guideTile(0), guideTile(0, true),
                    guideTile(0), guideTile(1, true), guideTile(0),
                    guideTile(0, true), guideTile(0), guideTile(0, true)
            }};
            break;
        case GuideDiagramKind::Special:
            tiles = {{
                    guideTile(0), guideTile(0, false, true), guideTile(0),
                    guideTile(2), guideTile(0, false, false, true), guideTile(2),
                    guideTile(0), guideTile(0), guideTile(0)
            }};
            break;
        case GuideDiagramKind::Modes:
            tiles = {{
                    guideTile(4), guideTile(4), guideTile(4),
                    guideTile(2), guideTile(0, false, true), guideTile(0, false, false, true),
                    guideTile(1), guideTile(0), guideTile(3)
            }};
            break;
        case GuideDiagramKind::Moves:
            tiles = {{
                    guideTile(1, false, false, false, true), guideTile(2, false, false, false, true), guideTile(0),
                    guideTile(0), guideTile(3, false, false, false, true, "3"), guideTile(0),
                    guideTile(0), guideTile(0), guideTile(1)
            }};
            break;
        case GuideDiagramKind::Options:
            tiles = {{
                    guideTile(1, false, false, false, false, "1"), guideTile(2, false, false, false, false, "2"), guideTile(0),
                    guideTile(3, false, false, false, false, "3"), guideTile(0, false, false, false, false, "0"), guideTile(1, false, false, false, false, "1"),
                    guideTile(0), guideTile(2, false, false, false, false, "2"), guideTile(3, false, false, false, false, "3")
            }};
            break;
        case GuideDiagramKind::None:
            break;
    }
    return tiles;
}

void drawGuideDiagram(AppState *s, Rect area, GuideDiagramKind kind, Color accent) {
    if (kind == GuideDiagramKind::None || area.w <= 0.0f || area.h <= 0.0f) return;
    Renderer &r = s->renderer;
    drawGlassPanel(s, area, rgba(7, 10, 14, 0.36f), withAlpha(accent, 0.028f));
    float pad = dp(s, 8);
    float gap = dp(s, 5);
    float board = std::min(area.w - pad * 2.0f, area.h - pad * 2.0f);
    float tile = (board - gap * 2.0f) / 3.0f;
    float left = area.x + (area.w - board) * 0.5f;
    float top = area.y + (area.h - board) * 0.5f;
    float radius = std::max(3.0f, std::min(dp(s, 7), tile * 0.18f));
    auto tiles = guideDiagramTiles(kind);
    for (int row = 0; row < 3; ++row) {
        for (int col = 0; col < 3; ++col) {
            const GuideDiagramTile &spec = tiles[static_cast<size_t>(row * 3 + col)];
            Rect cell{left + col * (tile + gap), top + row * (tile + gap), tile, tile};
            if (spec.gap) {
                r.roundedRect(cell.x, cell.y, cell.w, cell.h, radius, rgba(0, 0, 0, 0.46f));
                r.roundedStroke(cell, radius, std::max(1.0f, dp(s, 1.2f)), LINE);
                continue;
            }
            if (spec.locked) {
                r.roundedRect(cell.x + dp(s, 0.8f), cell.y + dp(s, 1.5f), cell.w, cell.h, radius, rgba(0, 0, 0, 0.18f));
                r.roundedRect(cell.x, cell.y, cell.w, cell.h, radius, LINE_STRONG);
                r.roundedRectGradient(cell.x + 1.0f, cell.y + 1.0f, cell.w - 2.0f, cell.h - 2.0f,
                                      std::max(1.0f, radius - 1.0f), rgba(79, 87, 99, 0.80f), rgba(35, 42, 53, 0.88f));
                float badgeSize = std::max(dp(s, 12), std::min(dp(s, 19), tile * 0.42f));
                drawPadlockBadge(s, {cell.x + cell.w - badgeSize - dp(s, 3), cell.y + dp(s, 3), badgeSize, badgeSize});
            } else {
                drawMatrixTileSurface(s, cell, spec.state, radius, true);
            }
            if (spec.preview) {
                r.roundedStroke(cell, radius, std::max(2.0f, tile * 0.10f), withAlpha(GREEN, 0.82f));
            }
            if (spec.hinted) {
                r.roundedStroke({cell.x + dp(s, 1.2f), cell.y + dp(s, 1.2f),
                                 cell.w - dp(s, 2.4f), cell.h - dp(s, 2.4f)},
                                std::max(1.0f, radius - dp(s, 1.0f)), std::max(2.0f, tile * 0.10f), withAlpha(DANGER, 0.82f));
            }
            if (!spec.label.empty()) {
                float labelScale = std::min(dp(s, 2.15f), tile * 0.075f);
                r.textHeavy(spec.label, cell.x + cell.w * 0.5f, cell.y + cell.h * 0.5f - labelScale * 4.0f,
                            labelScale, rgba(7, 17, 15, 0.92f), 1, 0.9f);
            }
        }
    }
}

void drawHighlightedGuideLine(AppState *s, const WrappedGuideLine &line, float x, float y, float maxWidth,
                              float scale, Color baseColor) {
    if (line.highlights.empty()) {
        drawFittedText(s, line.text, x, y, maxWidth, scale, baseColor);
        return;
    }
    Renderer &r = s->renderer;
    float cursor = x;
    size_t offset = 0;
    for (const auto &span : line.highlights) {
        if (span.start > offset) {
            std::string before = line.text.substr(offset, span.start - offset);
            r.text(before, cursor, y, scale, baseColor);
            cursor += r.textWidth(before, scale);
        }
        std::string marked = line.text.substr(span.start, span.len);
        r.textHeavy(marked, cursor, y, scale, span.color, 0, 0.85f);
        cursor += r.textWidth(marked, scale);
        offset = span.start + span.len;
    }
    if (offset < line.text.size()) {
        r.text(line.text.substr(offset), cursor, y, scale, baseColor);
    }
}

void drawGuideBlock(AppState *s, float &y, const std::string &title, const std::vector<std::string> &lines,
                    Color accent = GREEN, GuideDiagramKind diagram = GuideDiagramKind::None,
                    std::vector<HighlightRule> *highlights = nullptr) {
    Renderer &r = s->renderer;
    float scale = guideTextScale(s);
    float pad = dp(s, 14);
    float titleH = dp(s, 31) * scale;
    float lineH = dp(s, 20) * scale;
    float panelW = r.width - dp(s, 36);
    float maxTextW = panelW - pad * 2.0f;
    float bodyScale = dp(s, 1.72f) * scale;
    float bulletIndent = dp(s, 12) * std::min(1.30f, scale);
    std::vector<WrappedGuideLine> wrappedLines = wrapGuideLines(s, lines, bodyScale, maxTextW, bulletIndent, highlights);
    float diagramH = diagram == GuideDiagramKind::None ? 0.0f : dp(s, 92) * std::min(1.22f, scale);
    float diagramGap = diagram == GuideDiagramKind::None ? 0.0f : dp(s, 12) * std::min(1.12f, scale);
    float panelH = pad * 2.0f + titleH + diagramH + diagramGap +
                   lineH * static_cast<float>(wrappedLines.size()) + dp(s, 4);
    Rect panel{dp(s, 18), y, panelW, panelH};
    if (!nearViewport(s, panel)) {
        y += panel.h + dp(s, 14);
        return;
    }
    drawMathPanel(s, panel, accent);
    drawFittedText(s, tr(s, title), panel.x + pad, panel.y + pad, panel.w - pad * 2.0f, dp(s, 2.48f) * scale, TEXT);
    float ly = panel.y + pad + titleH;
    if (diagram != GuideDiagramKind::None) {
        float diagramW = std::min(maxTextW, dp(s, 116) * std::min(1.24f, scale));
        drawGuideDiagram(s, {panel.x + pad, ly, diagramW, diagramH}, diagram, accent);
        ly += diagramH + diagramGap;
    }
    for (const WrappedGuideLine &line : wrappedLines) {
        if (line.bullet) {
            drawFittedText(s, "-", panel.x + pad, ly, bulletIndent, bodyScale, TEXT);
        }
        float tx = panel.x + pad + (line.indent ? bulletIndent : 0.0f);
        float tw = maxTextW - (line.indent ? bulletIndent : 0.0f);
        drawHighlightedGuideLine(s, line, tx, ly, tw, bodyScale, MUTED);
        ly += lineH;
    }
    y += panel.h + dp(s, 14);
}

void drawHowToIntro(AppState *s, float &y, std::vector<HighlightRule> *highlights = nullptr) {
    Renderer &r = s->renderer;
    float scale = guideTextScale(s);
    float pad = dp(s, 14);
    float panelW = r.width - dp(s, 36);
    float maxTextW = panelW - pad * 2.0f;
    float titleScale = dp(s, 2.72f) * scale;
    float bodyScale = dp(s, 1.72f) * scale;
    float titleLineH = dp(s, 30) * scale;
    float bodyLineH = dp(s, 21) * scale;
    float diagramH = dp(s, 94) * std::min(1.22f, scale);
    float diagramGap = dp(s, 12) * std::min(1.12f, scale);
    std::vector<std::string> titleLines = wrapTextLines(s, tr(s, "Clear the board"), titleScale, maxTextW);
    std::vector<WrappedGuideLine> bodyLines = wrapGuideLines(s, std::vector<std::string>{
        "Turn every tile white. A single tap can change several tiles at once.",
        "Before you tap, hold a tile to see where its pattern reaches."
    }, bodyScale, maxTextW, 0.0f, highlights);
    Rect panel{dp(s, 18), y, panelW,
               pad * 2.0f + titleLineH * static_cast<float>(titleLines.size()) + dp(s, 12) +
                   diagramH + diagramGap +
                   bodyLineH * static_cast<float>(bodyLines.size())};
    if (!nearViewport(s, panel)) {
        y += panel.h + dp(s, 14);
        return;
    }
    drawMathPanel(s, panel, GREEN);
    float ly = panel.y + pad;
    for (const std::string &line : titleLines) {
        drawFittedText(s, line, panel.x + pad, ly, maxTextW, titleScale, TEXT);
        ly += titleLineH;
    }
    ly += dp(s, 12);
    drawGuideDiagram(s, {panel.x + pad, ly, std::min(maxTextW, dp(s, 118) * std::min(1.24f, scale)), diagramH},
                     GuideDiagramKind::Goal, GREEN);
    ly += diagramH + diagramGap;
    for (const WrappedGuideLine &line : bodyLines) {
        drawHighlightedGuideLine(s, line, panel.x + pad, ly, maxTextW, bodyScale, MUTED);
        ly += bodyLineH;
    }
    y += panel.h + dp(s, 14);
}

void drawHowTo(AppState *s) {
    float y = beginScrollContent(s, guideContentTop(s));
    std::vector<HighlightRule> highlights = guideHighlightRules(s, false);
    drawHowToIntro(s, y, &highlights);
    drawGuideBlock(s, y, "1. Read the colors",
                   {"- White is the color you want every tile to reach.",
                    "- A white tile can still change color if another tap reaches it.",
                    "- You solve the puzzle when all the tiles are white at once."},
                   GREEN, GuideDiagramKind::Read, &highlights);
    drawGuideBlock(s, y, "2. Follow the color cycle",
                   {"- Tap an unlocked tile. Its pattern tells you which tiles will change.",
                    "- Each tile in the pattern moves on to its next color.",
                    "- After the last color comes white again."},
                   BLUE, GuideDiagramKind::Tap, &highlights);
    drawGuideBlock(s, y, "3. Check the pattern",
                   {"- Look for crosses, diagonals, squares, rows, columns and even chess knight moves. Some boards mix several patterns.",
                    "- Hold a tile to preview its pattern. Lift your finger when you’re done looking."},
                   ORANGE, GuideDiagramKind::Pattern, &highlights);
    drawGuideBlock(s, y, "4. Locks and holes",
                   {"- A locked tile still has to turn white.",
                    "- To change it, tap another tile whose pattern reaches it.",
                    "- A hole is just a gap in the board. Tap patterns skip it."},
                   PURPLE, GuideDiagramKind::Special, &highlights);
    drawGuideBlock(s, y, "Choose your puzzle",
                   {"- Campaign: Pick a group on the 5 × 5 map. Earn 15 stars there to unlock the groups directly beside it, above it and below it.",
                    "- Custom Level: Choose the board size, number of colors, pattern and difficulty. You can add locks and holes. The game looks for a puzzle with a unique solution when it can.",
                    "- Playground: Build your own board and share it with a puzzle code. You can keep experimenting even after every tile turns white.",
                    "- Daily Challenge: Everyone gets the same three puzzles each day. Each one keeps its own best score."},
                   GREEN, GuideDiagramKind::Modes, &highlights);
    drawGuideBlock(s, y, "Taps, stars, and hints",
                   {"- Previewing a pattern is free. Your tap counts when the tiles change.",
                    "- For three stars, solve the puzzle in as few taps as the game’s best known solution, or fewer.",
                    "- The one- and two-star targets leave room for extra taps.",
                    "- Undo takes back your last tap. Reset puts the board back the way it started.",
                    "- A hint plays one tap for you. You can still finish that attempt, but it earns no stars.",
                    "- Look for the red outlines to see which tiles the hint changed."},
                   BLUE, GuideDiagramKind::Moves, &highlights);
    drawGuideBlock(s, y, "Settings",
                   {"- Turn sound effects on or off in Settings.",
                    "- If you prefer numbers, turn them on to see each tile’s state alongside its color.",
                    "- On Android, you can also turn vibration on or off."},
                   ORANGE, GuideDiagramKind::Options, &highlights);
    finishScrollContent(s, y);
    drawGuideHeader(s, "How to Play");
}

void drawMathPulseDemo(AppState *s, Rect area, bool showPatternBorders = false) {
    if (area.w <= 0.0f || area.h <= 0.0f) return;
    Renderer &r = s->renderer;
    drawGlassPanel(s, area, rgba(7, 10, 14, 0.36f), withAlpha(BLUE, 0.028f));
    float pad = dp(s, 9);
    float gap = dp(s, 5);
    float board = std::min(area.w - pad * 2.0f, area.h - pad * 2.0f);
    if (board <= gap * 3.0f) return;
    float tile = (board - gap * 3.0f) / 4.0f;
    float left = area.x + (area.w - board) * 0.5f;
    float top = area.y + (area.h - board) * 0.5f;
    float radius = std::max(3.0f, std::min(dp(s, 7), tile * 0.18f));
    int64_t elapsed = nowMs() % 2400;
    float phase = static_cast<float>(elapsed) / 2400.0f;
    bool changed = phase >= 0.34f && phase < 0.76f;
    bool pulsing = phase >= 0.18f && phase <= 0.54f;
    bool ringVisible = phase >= 0.20f && phase < 0.62f;
    bool patternBorderVisible = showPatternBorders && phase >= 0.14f && phase < 0.38f;
    float patternBorderAlpha = 0.0f;
    if (patternBorderVisible) {
        if (phase < 0.20f) {
            patternBorderAlpha = (phase - 0.14f) / 0.06f;
        } else if (phase > 0.30f) {
            patternBorderAlpha = (0.38f - phase) / 0.08f;
        } else {
            patternBorderAlpha = 1.0f;
        }
        patternBorderAlpha = clampFloat(patternBorderAlpha, 0.0f, 1.0f);
    }
    float pulseScale = 1.0f;
    if (pulsing) {
        float pulse = (phase - 0.18f) / 0.36f;
        if (pulse < 0.65f) {
            pulseScale = 0.90f + pulse / 0.65f * 0.18f;
        } else {
            pulseScale = 1.08f - (pulse - 0.65f) / 0.35f * 0.08f;
        }
    }
    for (int row = 0; row < 4; ++row) {
        for (int col = 0; col < 4; ++col) {
            int idx = row * 4 + col;
            bool affected = idx == 1 || idx == 4 || idx == 5 || idx == 6 || idx == 9;
            float scale = affected && pulsing ? pulseScale : 1.0f;
            float extra = tile * (scale - 1.0f) * 0.5f;
            Rect cell{left + col * (tile + gap) - extra, top + row * (tile + gap) - extra,
                      tile + extra * 2.0f, tile + extra * 2.0f};
            drawMatrixTileSurface(s, cell, affected && changed ? 1 : 0, radius, true);
            if (affected && patternBorderAlpha > 0.0f) {
                r.roundedStroke({cell.x - dp(s, 2), cell.y - dp(s, 2), cell.w + dp(s, 4), cell.h + dp(s, 4)},
                                radius + dp(s, 2), std::max(1.0f, tile * 0.070f),
                                withAlpha(GREEN, 0.95f * patternBorderAlpha));
            }
            if (idx == 5 && ringVisible) {
                float fade = phase < 0.50f ? 0.84f : std::max(0.18f, (0.62f - phase) / 0.12f * 0.84f);
                r.roundedStroke({cell.x - dp(s, 2), cell.y - dp(s, 2), cell.w + dp(s, 4), cell.h + dp(s, 4)},
                                radius + dp(s, 2), std::max(1.0f, tile * 0.07f), withAlpha(TEXT, fade));
            }
        }
    }
}

void drawMathIntro(AppState *s, float &y, std::vector<HighlightRule> *highlights = nullptr) {
    Renderer &r = s->renderer;
    float scale = guideTextScale(s);
    float pad = dp(s, 14);
    float panelW = r.width - dp(s, 36);
    float maxTextW = panelW - pad * 2.0f;
    float titleScale = dp(s, 2.75f) * scale;
    float bodyScale = dp(s, 1.78f) * scale;
    float titleLineH = dp(s, 31) * scale;
    float lineH = dp(s, 22) * scale;
    float demoH = dp(s, 108) * std::min(1.16f, scale);
    std::vector<std::string> titleLines = wrapTextLines(s, tr(s, "What happens when you add up the taps?"), titleScale, maxTextW);
    std::vector<WrappedGuideLine> bodyLines = wrapGuideLines(s, std::vector<std::string>{
        "Take a board with just two colors. Tap the center of a cross and every tile in the cross switches between white and blue. Tap the same spot again and you’re back where you started. The same rule works with other patterns. With more colors, it takes more taps to go all the way around the cycle."
    }, bodyScale, maxTextW, 0.0f, highlights);
    Rect panel{dp(s, 18), y, panelW,
               pad * 2.0f + titleLineH * static_cast<float>(titleLines.size()) + dp(s, 10) +
                   lineH * static_cast<float>(bodyLines.size()) + demoH + dp(s, 14)};
    if (!nearViewport(s, panel)) {
        y += panel.h + dp(s, 14);
        return;
    }
    drawMathPanel(s, panel, BLUE);
    float ly = panel.y + pad;
    for (const std::string &line : titleLines) {
        drawFittedText(s, line, panel.x + pad, ly, maxTextW, titleScale, TEXT);
        ly += titleLineH;
    }
    ly += dp(s, 10);
    for (const WrappedGuideLine &line : bodyLines) {
        drawHighlightedGuideLine(s, line, panel.x + pad, ly, maxTextW, bodyScale, MUTED);
        ly += lineH;
    }
    drawMathPulseDemo(s, {panel.x + dp(s, 12), panel.y + panel.h - demoH - dp(s, 12), panel.w - dp(s, 24), demoH});
    y += panel.h + dp(s, 14);
}

void drawMathBlock(AppState *s, float &y, const std::string &title, const std::vector<std::string> &lines,
                   FormulaKind kind, Color accent = GREEN, float formulaHeightDp = 64.0f,
                   std::vector<HighlightRule> *highlights = nullptr) {
    Renderer &r = s->renderer;
    float scale = guideTextScale(s);
    float lineH = dp(s, 20) * scale;
    float formulaH = dp(s, formulaHeightDp) * std::min(1.16f, scale);
    float pad = dp(s, 14);
    float titleH = dp(s, 30) * scale;
    float panelW = r.width - dp(s, 36);
    float maxTextW = panelW - pad * 2.0f;
    float bodyScale = dp(s, 1.72f) * scale;
    std::vector<WrappedGuideLine> wrappedLines = wrapGuideLines(s, lines, bodyScale, maxTextW, 0.0f, highlights);
    float panelH = pad * 2.0f + titleH + lineH * static_cast<float>(wrappedLines.size()) + formulaH + dp(s, 10);
    Rect panel{dp(s, 18), y, panelW, panelH};
    if (!nearViewport(s, panel)) {
        y += panel.h + dp(s, 14);
        return;
    }
    drawMathPanel(s, panel, accent);
    drawFittedText(s, tr(s, title), panel.x + pad, panel.y + pad, panel.w - pad * 2.0f, dp(s, 2.48f) * scale, TEXT);
    float ly = panel.y + pad + titleH;
    for (const WrappedGuideLine &line : wrappedLines) {
        drawHighlightedGuideLine(s, line, panel.x + pad, ly, maxTextW, bodyScale, MUTED);
        ly += lineH;
    }
    drawFormulaCard(s, {panel.x + dp(s, 12), panel.y + panel.h - formulaH - dp(s, 12), panel.w - dp(s, 24), formulaH},
                    kind, accent);
    y += panel.h + dp(s, 14);
}

void drawMath(AppState *s) {
    float y = beginScrollContent(s, guideContentTop(s));
    std::vector<HighlightRule> highlights = guideHighlightRules(s, true);
    drawMathIntro(s, y, &highlights);
    drawGuideBlock(s, y, "The board in one equation",
                   {"Give white the number 0 and count up through the colors. On a board with n colors, the next step after n-1 is 0 again. This is arithmetic modulo n, written in the ring R=Z/nZ.",
                    "Now read the tiles in a fixed order. Their numbers form the board vector s. Put the effect of each possible tap in a column of a matrix A. If x records how often you tap each unlocked tile, Ax gives the total change. You win when s+Ax=0."},
                   GREEN, GuideDiagramKind::None, &highlights);
    drawGuideBlock(s, y, "From two states to many",
                   {"In the classic Lights Out puzzle, a tap flips the chosen tile and its neighbors above, below, left and right. Each flip adds 1 modulo 2. Two taps in the same spot cancel because 1+1=0 modulo 2.",
                    "Invert the Matrix adds more states and patterns, but tap effects still add together. Skip holes when you list the tiles. Include locked tiles, since a tap on another tile can change them.",
                    "Can you combine the available taps to cancel the starting board? The change you need is -s."},
                   BLUE, GuideDiagramKind::None, &highlights);
    drawMathBlock(s, y, "1. The board is a vector",
                   {"Number the m tiles p_1,…,p_m in any fixed order. Write their states in that same order to get s=(s_1,…,s_m) ∈ R^m. Each entry s_i is the color of tile p_i. An all-white board is the zero vector."},
                   FormulaKind::Remainder, GREEN, 70.0f, &highlights);
    drawMathBlock(s, y, "2. Each tap contributes a column",
                   {"Label the r tiles you can tap q_1,…,q_r. Tap q_j once and record a 1 for each tile that changes and a 0 for each tile that stays the same. The result is its effect vector v_j, column j of A.",
                    "Read across a row to see which taps affect one tile. Read down a column to see which tiles one tap affects. A locked tile has a row of its own, but you can’t tap it, so it has no column."},
                   FormulaKind::Column, ORANGE, 78.0f, &highlights);
    drawMathBlock(s, y, "How many times should you tap each tile?",
                   {"The tap-count vector x=(x_1,…,x_r) records how often you tap each unlocked tile, modulo n. Each tap on q_j adds the same v_j, so together the taps add Ax=∑_j x_jv_j. You can play them in any order."},
                   FormulaKind::Plan, PURPLE, 60.0f, &highlights);
    drawMathBlock(s, y, "Goal",
                   {"The final board is s+Ax. To make it all white, look for a vector x that solves Ax=-s in R."},
                   FormulaKind::Goal, BLUE, 60.0f, &highlights);
    drawMathBlock(s, y, "When does a solution exist?",
                   {"Every tap-count vector produces a change Ax. All those changes together form the image of A, written Im(A). A board has a solution exactly when -s belongs to this image.",
                    "When n is prime, you can check by row reducing the augmented matrix [A | -s] to echelon form. A row saying 0=c with c ≠ 0 rules out a solution. If no such row appears, you can read off at least one solution by back substitution."},
                   FormulaKind::Image, GREEN, 70.0f, &highlights);
    drawMathBlock(s, y, "Prime numbers and fields",
                   {"With 2, 3 or 5 states, R is a field. Every nonzero element has a multiplicative inverse, so you can divide by it. With four states, even a simple division by 2 can go wrong. We’ll see why below."},
                   FormulaKind::Prime, GREEN, 54.0f, &highlights);
    drawMathBlock(s, y, "What changes with four states?",
                   {"When n is composite, R is still a ring, but some nonzero elements have no multiplicative inverse. For example, modulo 4, twice any number is even, so 2a can never equal 1. You can’t divide a row by 2 here.",
                    "The test for a solution is still -s ∈ Im(A). Use row operations valid in the ring. If n factors into coprime prime powers, you can also solve modulo each of those powers and combine the results."},
                   FormulaKind::Four, PURPLE, 54.0f, &highlights);
    drawMathBlock(s, y, "When is the solution unique?",
                   {"Suppose x_0 solves the board. If a tap-count vector z leaves the board unchanged, then Az=0 and x_0+z also solves it. These vectors z form the kernel of A, written ker(A). Adding each of them to x_0 gives all the solutions.",
                    "Remember that counts are taken modulo n. Tapping one tile n extra times takes its whole pattern around the color cycle. It leaves both the board and the tap-count vector unchanged.",
                    "So a solvable board has exactly one tap-count vector when ker(A)={0}. Over a field, this means the columns of A are linearly independent. The kernel test also works in the four-state ring."},
                   FormulaKind::Kernel, BLUE, 58.0f, &highlights);
    drawGuideBlock(s, y, "When is A invertible?",
                   {"If you can tap every tile, A has one row and one column per tile, so it is square. Holes leave that count balanced. A lock removes a column and keeps the row. When a square A is invertible, every starting board has exactly one tap-count solution.",
                    "A square A is invertible exactly when its determinant has a multiplicative inverse in R. For prime n, the determinant must be nonzero modulo n. For n=4, it must be odd. If this test fails, some starting boards have no solution and others have several. For a rectangular matrix, use the image to test existence and the kernel to test uniqueness."},
                   GREEN, GuideDiagramKind::None, &highlights);
    drawMathBlock(s, y, "Counting the taps in a solution",
                   {"To play a solution, take each count x_j as a number from 0 to n-1. Call that number t_j. Add these numbers as ordinary integers to get the number of taps, ℓ(x). The shortest solution the game has found sets the three-star target."},
                   FormulaKind::Minimum, ORANGE, 64.0f, &highlights);
    drawGuideBlock(s, y, "How the game finds a short solution",
                   {"If the board has few enough possible states, the game searches all positions one tap away, then two taps away, and so on. The first time it reaches an all-white board, it has found the fewest taps possible.",
                    "For larger boards with a prime number of states per tile, the game row reduces Ax=-s. If there are few enough solutions to try, it compares them all and keeps one with the fewest taps. When an exact search is too large, including on large four-state boards, it uses a known solution whose length may be above the minimum.",
                    "Different tap-count vectors can tie for the minimum, and you can play the same vector in different orders. When the game proves a minimum, it always picks the same plan among those tied for shortest. It doesn’t tell you whether another plan ties with it."},
                   ORANGE, GuideDiagramKind::None, &highlights);
    drawGuideBlock(s, y, "Locked tiles and holes in the matrix",
                   {"To model a hole, leave that position out entirely. To model a lock, keep the tile’s entry in s and its row in A, since it still has to turn white. Leave out its column. The remaining columns tell you which other taps can change it."},
                   PURPLE, GuideDiagramKind::Special, &highlights);
    drawGuideBlock(s, y, "How puzzles are made",
                   {"The generator starts with a white board and scrambles it with allowed taps. It keeps track of how to undo their combined effect, so the starting board comes with a solution. When it can, the solver finds a shortest plan for the star targets. A hint plays one tap toward a solution and outlines the tiles it changed in red."},
                   GREEN, GuideDiagramKind::None, &highlights);
    drawMathBlock(s, y, "What the symbols mean",
                   {},
                   FormulaKind::Symbols, BLUE, 166.0f, &highlights);
    finishScrollContent(s, y);
    drawGuideHeader(s, "The Math");
}

void drawSettings(AppState *s) {
    Renderer &r = s->renderer;
    float textScale = menuTextScale(s);
    float headerContentTop = sectionContentTop(s);
    float buttonH = dp(s, 52.0f + (textScale - 1.0f) * 10.0f);
    float gap = dp(s, 12);
    float labelH = dp(s, 28.0f + (textScale - 1.0f) * 12.0f);
    float languageChipsH = dp(s, 64.0f + (textScale - 1.0f) * 10.0f);
    float stackH = labelH + languageChipsH + gap + buttonH * 5.0f + gap * 5.0f;
    float minTop = headerContentTop + dp(s, 20);
    float maxTop = std::max(minTop, static_cast<float>(r.height) - safeBottom(s) - stackH - dp(s, 18));
    // Changelog note: Android settings controls are vertically centered instead of hugging the header.
    float contentTop = std::min(std::max((static_cast<float>(r.height) - stackH) * 0.5f, minTop), maxTop);
    float y = beginScrollContent(s, contentTop);
    r.text(tr(s, "Language"), dp(s, 18), y, dp(s, 3.0f * textScale), TEXT); y += labelH;
    std::vector<std::string> names;
    for (const auto &language : languages) names.emplace_back(language.name);
    drawChips(s, y, names, "", Action::Language, static_cast<int>(names.size()), languageIndex(s->language));
    y += gap;
    drawButton(s, {dp(s, 18), y, r.width - dp(s, 36), buttonH}, tr(s, "Sound") + " " + onOff(s, s->sound), Action::ToggleSetting, 0, false, s->sound, true, textScale); y += buttonH + gap;
    drawButton(s, {dp(s, 18), y, r.width - dp(s, 36), buttonH}, tr(s, "Vibration") + " " + onOff(s, s->vibration), Action::ToggleSetting, 1, false, s->vibration, true, textScale); y += buttonH + gap;
    drawButton(s, {dp(s, 18), y, r.width - dp(s, 36), buttonH}, tr(s, "Show numbers on tiles") + " " + onOff(s, !s->hideNumbers), Action::ToggleSetting, 2, false, !s->hideNumbers, true, textScale); y += buttonH + gap;
    drawButton(s, {dp(s, 18), y, r.width - dp(s, 36), buttonH}, tr(s, "Show numbers in Playground") + " " + onOff(s, s->showPlaygroundNumbers), Action::ToggleSetting, 3, false, s->showPlaygroundNumbers, true, textScale); y += buttonH + gap;
    drawButton(s, {dp(s, 18), y, r.width - dp(s, 36), buttonH}, tr(s, "About"), Action::About, 0, false, false, true, textScale); y += buttonH;
    finishScrollContent(s, y);
    drawStickyScreenHeader(s, "Options", "Settings", Action::BackReturn, headerContentTop);
}

void drawGithubLogo(AppState *s, float cx, float cy, float size, bool finishSkiaLayer = false) {
    Renderer &r = s->renderer;
    if (r.skiaReady()) {
        static SkPath markPath;
        static bool markPathReady = false;
        if (!markPathReady) {
            if (auto parsed = SkParsePath::FromSVGString(GITHUB_MARK_SVG_PATH)) {
                markPath = *parsed;
                markPathReady = true;
            }
        }
        if (markPathReady) {
            SkPaint paint;
            paint.setAntiAlias(true);
            paint.setColor(Renderer::skColor(TEXT));
            paint.setStyle(SkPaint::kFill_Style);
            r.skCanvas->save();
            r.skCanvas->translate(cx - size * 0.5f, cy - size * 0.5f);
            r.skCanvas->scale(size / 16.0f, size / 16.0f);
            r.skCanvas->drawPath(markPath, paint);
            r.skCanvas->restore();
            if (finishSkiaLayer) {
                if (r.skSurface && r.skContext) r.skContext->flushAndSubmit(r.skSurface.get());
                if (r.skContext) r.skContext->resetContext();
                r.skCanvas = nullptr;
                r.skSurface.reset();
                glBindFramebuffer(GL_FRAMEBUFFER, 0);
                r.applyViewport();
            }
            return;
        }
    }

    r.tri(cx - size * 0.23f, cy - size * 0.18f, cx - size * 0.30f, cy - size * 0.39f,
          cx - size * 0.08f, cy - size * 0.30f, TEXT);
    r.tri(cx + size * 0.23f, cy - size * 0.18f, cx + size * 0.30f, cy - size * 0.39f,
          cx + size * 0.08f, cy - size * 0.30f, TEXT);
    r.circle(cx, cy - size * 0.06f, size * 0.31f, TEXT, 32);
    r.roundedRect(cx - size * 0.09f, cy + size * 0.18f, size * 0.18f, size * 0.22f, size * 0.04f, TEXT);
}

float githubLabelPixelHeight(float textScale) {
    return std::max(8.0f, textScale * 6.2f);
}

std::array<uint8_t, 7> githubLabelGlyph(char c) {
    switch (c) {
        case 'a': return {0, 0, 14, 1, 15, 17, 15};
        case 'i': return {4, 0, 12, 4, 4, 4, 14};
        case 'l': return {12, 4, 4, 4, 4, 4, 14};
        case 'o': return {0, 0, 14, 17, 17, 17, 14};
        case 'p': return {0, 0, 30, 17, 30, 16, 16};
        case 'r': return {0, 0, 22, 25, 16, 16, 16};
        case 't': return {4, 4, 31, 4, 4, 4, 3};
        default: return {0, 0, 0, 0, 0, 0, 0};
    }
}

float githubPixelLabelWidth(const std::string &text, float scale) {
    return static_cast<float>(text.size()) * 6.0f * scale;
}

void drawGithubPixelLabel(AppState *s, const std::string &text, float x, float centerY, float textScale) {
    Renderer &r = s->renderer;
    float scale = githubLabelPixelHeight(textScale) / 7.0f;
    float y = centerY - scale * 3.5f;
    float cursor = x;
    for (char c : text) {
        auto glyph = githubLabelGlyph(c);
        for (int row = 0; row < 7; ++row) {
            for (int col = 0; col < 5; ++col) {
                if (glyph[row] & (1 << (4 - col))) {
                    r.roundedRect(cursor + col * scale, y + row * scale,
                                  scale * 0.92f, scale * 0.92f,
                                  std::max(1.0f, scale * 0.18f), TEXT);
                }
            }
        }
        cursor += 6.0f * scale;
    }
}

float githubSkiaLabelWidth(Renderer &r, const std::string &text, float textScale) {
    if (!r.vectorFontReady) return githubPixelLabelWidth(text, githubLabelPixelHeight(textScale) / 7.0f);
    float scale = stbtt_ScaleForPixelHeight(&r.vectorFontInfo, githubLabelPixelHeight(textScale));
    float width = 0.0f;
    int previous = 0;
    for (int codepoint : r.utf8Codepoints(text)) {
        if (previous) width += stbtt_GetCodepointKernAdvance(&r.vectorFontInfo, previous, codepoint) * scale;
        int advance = 0;
        int leftBearing = 0;
        stbtt_GetCodepointHMetrics(&r.vectorFontInfo, codepoint, &advance, &leftBearing);
        width += advance * scale;
        previous = codepoint;
    }
    return width;
}

void drawGithubLabelSkia(AppState *s, const std::string &text, float x, float centerY, float textScale) {
    Renderer &r = s->renderer;
    if (!r.skiaReady()) return;
    if (!r.vectorFontReady) {
        drawGithubPixelLabel(s, text, x, centerY, textScale);
        return;
    }
    float scale = stbtt_ScaleForPixelHeight(&r.vectorFontInfo, githubLabelPixelHeight(textScale));
    int ascent = 0;
    int descent = 0;
    stbtt_GetFontVMetrics(&r.vectorFontInfo, &ascent, &descent, nullptr);
    float baseline = centerY + (ascent + descent) * scale * 0.5f;
    float cursor = x;
    int previous = 0;
    SkPathBuilder textBuilder;
    for (int codepoint : r.utf8Codepoints(text)) {
        if (previous) cursor += stbtt_GetCodepointKernAdvance(&r.vectorFontInfo, previous, codepoint) * scale;
        stbtt_vertex *vertices = nullptr;
        int vertexCount = stbtt_GetCodepointShape(&r.vectorFontInfo, codepoint, &vertices);
        bool open = false;
        for (int i = 0; i < vertexCount; ++i) {
            const stbtt_vertex &v = vertices[i];
            float px = cursor + v.x * scale;
            float py = baseline - v.y * scale;
            if (v.type == STBTT_vmove) {
                if (open) textBuilder.close();
                textBuilder.moveTo(px, py);
                open = true;
            } else if (v.type == STBTT_vline) {
                textBuilder.lineTo(px, py);
            } else if (v.type == STBTT_vcurve) {
                textBuilder.quadTo(cursor + v.cx * scale, baseline - v.cy * scale, px, py);
            } else if (v.type == STBTT_vcubic) {
                textBuilder.cubicTo(cursor + v.cx * scale, baseline - v.cy * scale,
                                    cursor + v.cx1 * scale, baseline - v.cy1 * scale, px, py);
            }
        }
        if (open) textBuilder.close();
        if (vertices) stbtt_FreeShape(&r.vectorFontInfo, vertices);
        int advance = 0;
        int leftBearing = 0;
        stbtt_GetCodepointHMetrics(&r.vectorFontInfo, codepoint, &advance, &leftBearing);
        cursor += advance * scale;
        previous = codepoint;
    }
    SkPaint paint;
    paint.setAntiAlias(true);
    paint.setColor(Renderer::skColor(TEXT));
    paint.setStyle(SkPaint::kFill_Style);
    SkPath textPath = textBuilder.detach();
    r.skCanvas->drawPath(textPath, paint);
}

void drawAbout(AppState *s) {
    Renderer &r = s->renderer;
    float textScale = menuTextScale(s);
    float contentTop = sectionContentTop(s);
    float y = beginScrollContent(s, contentTop);
    float x = dp(s, 18);
    float w = r.width - dp(s, 36);
    float gap = dp(s, 14);

    Rect version{x, y, w, dp(s, 76.0f + (textScale - 1.0f) * 14.0f)};
    drawGlassPanel(s, version, PANEL);
    float versionScale = dp(s, 3.15f * textScale);
    drawFittedText(s, tr(s, "Version") + " " + APP_VERSION_NAME,
                   version.x + version.w * 0.5f,
                   version.y + version.h * 0.5f - versionScale * 4.0f,
                   version.w - dp(s, 32), versionScale, TEXT, 1, true, 1.6f);
    y += version.h + gap;

    drawGuideBlock(s, y, "Changelog",
                   {"- 1.0.17 - 2026-11-12: " + tr(s, "You can now play in Korean. We also rewrote How to Play and the math guide, from your first tap to the equations behind a solution."),
                    "- 1.0.16 - 2026-10-24: " + tr(s, "Improved Android 16 compatibility, system Back navigation, and screen layout around system bars. The Android app now requires Android 7 or later."),
                    "- 1.0.15 - 2026-09-01: " + tr(s, "Updated AndroidX Activity and Fragment dependencies to current supported releases for Play compatibility."),
                    "- 1.0.14 - 2026-09-01: " + tr(s, "Android now targets Android 16, keeps system Back navigation reliable, and makes the all-white goal clear with tap-effect help available on demand."),
                    "- 1.0.13 - 2026-05-30: " + tr(s, "The main menu now includes Achievements, the animated board is larger, and Android opens Play Games achievement status while the web app shows campaign achievement progress."),
                    "- 1.0.12 - 2026-05-30: " + tr(s, "First production release with campaign levels, daily challenges, custom puzzles, Playground boards, hints, stars, and Play Games achievements."),
                    "- 1.0.11 - 2026-05-30: " + tr(s, "Added a separate setting for Playground tile numbers, keeping Playground boards number-free unless it is turned on."),
                    "- 1.0.10 - 2026-05-30: " + tr(s, "The Android release is prepared with version code 12, native debug symbols for Play Console crash reports, and refreshed changelog notes for the latest Play Store build."),
                    "- 1.0.9 - 2026-05-28: " + tr(s, "Playground adds shareable puzzle codes, campaign now uses a 5x5 group map, and the Playground logo is now a tile-colored basketball. Menu headers, locks, and text-size controls were polished across web and Android."),
                    "- 1.0.8 - 2026-05-16: " + tr(s, "Daily challenges now separate puzzle cards from leaderboards, custom setup uses visual pattern chips with unique generation always on, and game/result screens are clearer."),
                    "- 1.0.7 - 2026-05-14: " + tr(s, "Settings now hide platform-specific controls, animation and colorblind-symbol toggles were removed, and About shows version history with the GitHub link."),
                    "- 1.0.6 - 2026-05-13: " + tr(s, "Release builds keep native debug symbols for Play Console crash reports."),
                    "- 1.0.5 - 2026-05-13: " + tr(s, "The Math guide explains solution uniqueness and matrix invertibility.")},
                   BLUE);
    y += dp(s, 84);
    finishScrollContent(s, y);
    drawStickyScreenHeader(s, "About", "About", Action::CloseAbout, contentTop);

    float barH = dp(s, 54.0f + (textScale - 1.0f) * 8.0f);
    float barW = std::min(r.width - dp(s, 36), dp(s, 420));
    Rect credit{(r.width - barW) * 0.5f, r.height - safeBottom(s) - dp(s, 16) - barH, barW, barH};
    drawGlassPanel(s, credit, PANEL_2);
    if (isPressedButton(s, credit, Action::OpenGithub, 0)) drawPressedButtonFeedback(s, credit, dp(s, 8));
    const std::string githubLabel = "pportilla";
    float logo = dp(s, 24);
    float labelGap = dp(s, 10);
    float creditTextScale = dp(s, 2.55f * textScale);
    float maxGroupW = credit.w - dp(s, 36);
    auto labelWidth = [&]() {
        return r.skiaReady() ? githubSkiaLabelWidth(r, githubLabel, creditTextScale) : r.textWidth(githubLabel, creditTextScale);
    };
    while (logo + labelGap + labelWidth() > maxGroupW && creditTextScale > dp(s, 1.85f)) {
        creditTextScale *= 0.94f;
    }
    float textW = labelWidth();
    float groupW = logo + labelGap + textW;
    float startX = credit.x + (credit.w - groupW) * 0.5f;
    if (r.skiaReady()) {
        drawGithubLogo(s, startX + logo * 0.5f, credit.y + credit.h * 0.5f, logo);
        drawGithubLabelSkia(s, githubLabel, startX + logo + labelGap, credit.y + credit.h * 0.5f, creditTextScale);
    } else {
        drawGithubLogo(s, startX + logo * 0.5f, credit.y + credit.h * 0.5f, logo);
        r.textHeavy(githubLabel, startX + logo + labelGap, credit.y + credit.h * 0.5f - creditTextScale * 4.0f,
                    creditTextScale, TEXT, 0, 0.9f);
    }
    addButton(s, credit, Action::OpenGithub, 0, true);
}

std::string formatTime(int total) {
    char buf[32];
    std::snprintf(buf, sizeof(buf), "%d:%02d", total / 60, total % 60);
    return buf;
}

Color stateTopColor(int state) {
    if (state == 1) return rgba(101, 197, 239, 0.98f);
    if (state == 2) return rgba(231, 183, 111, 0.98f);
    if (state == 3) return rgba(183, 162, 236, 0.98f);
    if (state == 4) return rgba(119, 221, 176, 0.98f);
    return rgba(248, 250, 252, 1.0f);
}

Color stateBottomColor(int state) {
    if (state == 1) return rgba(52, 142, 196, 0.94f);
    if (state == 2) return rgba(182, 117, 49, 0.94f);
    if (state == 3) return rgba(116, 89, 189, 0.94f);
    if (state == 4) return rgba(60, 159, 116, 0.94f);
    return rgba(221, 229, 238, 1.0f);
}

Color stateBorderColor(int state) {
    if (state == 1) return rgba(139, 212, 255, 0.46f);
    if (state == 2) return rgba(248, 205, 137, 0.48f);
    if (state == 3) return rgba(210, 195, 255, 0.48f);
    if (state == 4) return rgba(142, 234, 188, 0.48f);
    return rgba(255, 255, 255, 0.66f);
}

bool containsIndex(const std::vector<int> &items, int value) {
    return std::find(items.begin(), items.end(), value) != items.end();
}

bool useWideGameLayout(AppState *s) {
    Renderer &r = s->renderer;
    return r.width > r.height * 1.08f;
}

float wideGamePanelWidth(AppState *s) {
    Renderer &r = s->renderer;
    return std::min(dp(s, 380.0f), std::max(dp(s, 286.0f), r.width * 0.34f));
}

Rect currentBoardRect(AppState *s) {
    Renderer &r = s->renderer;
    if (useWideGameLayout(s)) {
        float margin = dp(s, 18);
        float panelW = wideGamePanelWidth(s);
        float boardAreaX = panelW + margin;
        float top = safeTop(s) + dp(s, 18);
        float bottom = safeBottom(s) + dp(s, 18);
        float maxW = std::max(dp(s, 72.0f), r.width - boardAreaX - margin);
        float maxH = std::max(dp(s, 72.0f), r.height - top - bottom);
        float cell = std::max(1.0f, std::min(maxW / s->session.puzzle.width, maxH / s->session.puzzle.height));
        float bw = cell * s->session.puzzle.width;
        float bh = cell * s->session.puzzle.height;
        return {boardAreaX + (maxW - bw) * 0.5f, top + (maxH - bh) * 0.5f, bw, bh};
    }
    float top = safeTop(s) + dp(s, 288);
    float bottom = safeBottom(s) + dp(s, 34);
    float maxW = std::max(dp(s, 72.0f), r.width - dp(s, 42));
    float maxH = std::max(dp(s, 72.0f), r.height - top - bottom);
    float cell = std::min(maxW / s->session.puzzle.width, maxH / s->session.puzzle.height);
    float bw = cell * s->session.puzzle.width;
    float bh = cell * s->session.puzzle.height;
    return {(r.width - bw) * 0.5f, top + (maxH - bh) * 0.5f, bw, bh};
}

void drawPatternPreviewGrid(AppState *s, Rect rect, const Pattern &pat) {
    Renderer &r = s->renderer;
    float frameRadius = std::min(dp(s, 8), rect.h * 0.18f);
    r.roundedRect(rect.x, rect.y, rect.w, rect.h, frameRadius, rgba(229, 236, 245, 0.46f));
    r.roundedRect(rect.x + 1.0f, rect.y + 1.0f, rect.w - 2.0f, rect.h - 2.0f,
                  std::max(1.0f, frameRadius - 1.0f), rgba(5, 7, 11, 0.98f));
    int maxDist = 1;
    for (auto &off : pat.offsets) {
        maxDist = std::max(maxDist, std::max(std::abs(off.first), std::abs(off.second)));
    }
    int size = std::max(3, maxDist * 2 + 1);
    float pad = dp(s, 4.5f);
    float dotGap = dp(s, 2);
    float dot = std::min((rect.w - pad * 2 - dotGap * (size - 1)) / size,
                         (rect.h - pad * 2 - dotGap * (size - 1)) / size);
    float left = rect.x + (rect.w - (dot * size + dotGap * (size - 1))) * 0.5f;
    float top = rect.y + (rect.h - (dot * size + dotGap * (size - 1))) * 0.5f;
    std::set<std::pair<int, int>> active;
    int center = size / 2;
    for (auto &off : pat.offsets) active.insert({center + off.first, center + off.second});
    for (int y = 0; y < size; ++y) {
        for (int x = 0; x < size; ++x) {
            bool on = active.count({x, y}) > 0;
            Rect d{left + x * (dot + dotGap), top + y * (dot + dotGap), dot, dot};
            float radius = std::max(1.0f, dot * 0.22f);
            drawMatrixTileSurface(s, d, 0, radius, true);
            if (on) {
                float thickness = (x == center && y == center) ? std::max(1.4f, dot * 0.22f) : std::max(1.1f, dot * 0.17f);
                r.roundedStroke(d, radius, thickness, withAlpha(GREEN, x == center && y == center ? 0.92f : 0.76f));
            }
        }
    }
}

void addOutsideDismissButtons(AppState *s, Rect modal, Action action) {
    Renderer &r = s->renderer;
    float w = static_cast<float>(r.width);
    float h = static_cast<float>(r.height);
    if (modal.y > 0.0f) addButton(s, {0.0f, 0.0f, w, modal.y}, action, 0, true);
    float bottomY = modal.y + modal.h;
    if (bottomY < h) addButton(s, {0.0f, bottomY, w, h - bottomY}, action, 0, true);
    if (modal.x > 0.0f) addButton(s, {0.0f, modal.y, modal.x, modal.h}, action, 0, true);
    float rightX = modal.x + modal.w;
    if (rightX < w) addButton(s, {rightX, modal.y, w - rightX, modal.h}, action, 0, true);
}

std::vector<std::string> tapPatternKeysForPuzzle(const Puzzle &p) {
    std::vector<std::string> keys;
    std::set<std::string> seen;
    for (int tile : tappableIndexes(p)) {
        auto patternIt = p.tilePatterns.find(tile);
        std::string key = patternIt == p.tilePatterns.end() ? p.defaultPattern : patternIt->second;
        if (seen.insert(key).second) keys.push_back(key);
    }
    if (keys.empty()) keys.push_back(p.defaultPattern);
    return keys;
}

void drawPatternInfoPreview(AppState *s, Rect area, const std::vector<std::string> &keys, float reveal) {
    if (keys.empty() || area.w <= 0.0f || area.h <= 0.0f) return;
    int count = static_cast<int>(keys.size());
    int columns = count == 1 ? 1 : std::min(3, count);
    int rows = (count + columns - 1) / columns;
    float gap = dp(s, count == 1 ? 0.0f : 7.0f);
    float slotW = (area.w - gap * static_cast<float>(columns - 1)) / static_cast<float>(columns);
    float slotH = (area.h - gap * static_cast<float>(rows - 1)) / static_cast<float>(rows);
    float scale = 0.78f + 0.22f * reveal;
    float side = std::max(1.0f, std::min(slotW, slotH) * scale);

    for (int i = 0; i < count; ++i) {
        int row = i / columns;
        int col = i % columns;
        int rowCount = std::min(columns, count - row * columns);
        float rowWidth = side * static_cast<float>(rowCount) + gap * static_cast<float>(rowCount - 1);
        float x = area.x + (area.w - rowWidth) * 0.5f + static_cast<float>(col) * (side + gap);
        float rowBlockH = side * static_cast<float>(rows) + gap * static_cast<float>(rows - 1);
        float y = area.y + (area.h - rowBlockH) * 0.5f + static_cast<float>(row) * (side + gap);
        Pattern pattern = patternFor(keys[static_cast<size_t>(i)]);
        drawPatternPreviewGrid(s, {x, y, side, side}, pattern);
        if (count > 1 && side >= dp(s, 18.0f)) {
            float badgeH = std::min(dp(s, 18.0f), side * 0.30f);
            float badgeW = std::max(badgeH, std::min(dp(s, 24.0f), side * 0.38f));
            Rect badge{x + side - badgeW - dp(s, 2.5f), y + dp(s, 2.5f), badgeW, badgeH};
            s->renderer.roundedRect(badge.x, badge.y, badge.w, badge.h, badge.h * 0.5f,
                                    rgba(9, 11, 18, 0.88f));
            s->renderer.text(localizedPatternBadge(s, pattern), badge.x + badge.w * 0.5f, badge.y + badge.h * 0.08f,
                             std::max(dp(s, 1.35f), badgeH / 7.2f), TEXT, 1);
        }
    }
}

void drawPatternInfoPopup(AppState *s) {
    if (!s->patternInfoOpen) return;
    Renderer &r = s->renderer;
    int64_t elapsed = s->patternInfoOpenedAt > 0 ? std::max<int64_t>(0, nowMs() - s->patternInfoOpenedAt) : 260;
    float opening = clampFloat(static_cast<float>(elapsed) / 240.0f, 0.0f, 1.0f);
    float eased = 1.0f - std::pow(1.0f - opening, 3.0f);
    float patternReveal = clampFloat((static_cast<float>(elapsed) - 45.0f) / 215.0f, 0.0f, 1.0f);
    patternReveal = 1.0f - std::pow(1.0f - patternReveal, 3.0f);
    r.rect(0, 0, r.width, r.height, rgba(0, 0, 0, 0.68f * eased));

    float maxH = r.height - safeTop(s) - safeBottom(s) - dp(s, 28);
    bool compact = maxH < dp(s, 470);
    float modalW = std::min(r.width - dp(s, 36), dp(s, 520));
    float pad = dp(s, compact ? 14.0f : 18.0f);
    float textW = modalW - pad * 2.0f;
    float titleH = dp(s, compact ? 62.0f : 76.0f);
    float demoH = dp(s, compact ? 78.0f : 118.0f);
    float bodyScale = dp(s, compact ? 1.82f : 2.18f);
    float bodyLineH = dp(s, compact ? 22.0f : 27.0f);
    float bodyGap = dp(s, compact ? 10.0f : 15.0f);
    bool playground = s->session.mode == "playground";
    std::vector<std::string> patternKeys = tapPatternKeysForPuzzle(s->session.puzzle);
    bool mixed = patternKeys.size() > 1;
    std::vector<std::string> paragraphs{
            "This preview shows which tiles one tap changes.",
            playground ? "Playground has no completion goal." : "Goal: make every tile white."
    };
    if (mixed) paragraphs.push_back("On mixed boards, match each tappable tile's symbol to an effect above.");
    paragraphs.push_back("Hold a tile to preview the exact effect before tapping.");
    std::vector<std::string> visibleParagraphs = paragraphs;
    std::vector<std::string> lines = wrapTextLines(s, visibleParagraphs, bodyScale, textW);
    float minDemoH = dp(s, compact ? 42.0f : 52.0f);
    auto fixedContentHeight = [&]() {
        return pad * 2.0f + titleH + bodyGap + bodyLineH * static_cast<float>(lines.size());
    };
    float fixedH = fixedContentHeight();
    for (int attempt = 0; attempt < 7 && fixedH + minDemoH > maxH; ++attempt) {
        bodyScale *= 0.90f;
        bodyLineH *= 0.90f;
        lines = wrapTextLines(s, visibleParagraphs, bodyScale, textW);
        fixedH = fixedContentHeight();
    }
    while (visibleParagraphs.size() > 2 && fixedH + minDemoH > maxH) {
        visibleParagraphs.pop_back();
        lines = wrapTextLines(s, visibleParagraphs, bodyScale, textW);
        fixedH = fixedContentHeight();
    }
    if (!lines.empty() && fixedH + minDemoH > maxH) {
        float nonBodyH = pad * 2.0f + titleH + bodyGap;
        float availableLineH = (maxH - nonBodyH - minDemoH) / static_cast<float>(lines.size());
        bodyLineH = std::max(1.0f, std::min(bodyLineH, availableLineH));
        fixedH = fixedContentHeight();
    }
    demoH = std::max(1.0f, std::min(demoH, maxH - fixedH));
    float modalH = fixedH + demoH;
    float baseY = (r.height - modalH) * 0.5f;
    baseY = std::max(safeTop(s) + dp(s, 14),
                     std::min(baseY, r.height - safeBottom(s) - modalH - dp(s, 14)));
    Rect modal{(r.width - modalW) * 0.5f, baseY + (1.0f - eased) * dp(s, 10), modalW, modalH};
    addOutsideDismissButtons(s, modal, Action::ClosePatternInfo);
    addButton(s, modal, Action::PatternInfoBlocker, 0, true);

    r.roundedRect(modal.x, modal.y, modal.w, modal.h, dp(s, 8), LINE_STRONG);
    r.roundedRect(modal.x + 1.2f, modal.y + 1.2f, modal.w - 2.4f, modal.h - 2.4f, dp(s, 7), PANEL_2);
    drawBackIcon(s, {modal.x + dp(s, 10), modal.y + dp(s, 10), dp(s, 42), dp(s, 38)}, Action::ClosePatternInfo);
    float demoY = modal.y + pad + titleH;
    float demoW = mixed ? textW : std::min(textW, demoH);
    drawPatternInfoPreview(s, {modal.x + (modal.w - demoW) * 0.5f, demoY, demoW, demoH},
                           patternKeys, patternReveal);

    drawFittedText(s, tr(s, "Tap effect (not the goal)"), modal.x + dp(s, 64), modal.y + dp(s, compact ? 11.0f : 14.0f),
                   modal.w - dp(s, 86), dp(s, 2.08f), GREEN, 0, true, 1.18f);
    std::string patternName = mixed ? tr(s, "Mixed tap effects") : localizedPatternLabel(s, patternKeys.front());
    drawFittedText(s, patternName, modal.x + dp(s, 64), modal.y + dp(s, compact ? 36.0f : 43.0f),
                   modal.w - dp(s, 82), dp(s, compact ? 2.80f : 3.44f), TEXT, 0, true, 1.50f);

    float textY = demoY + demoH + bodyGap;
    for (const std::string &line : lines) {
        drawFittedText(s, line, modal.x + pad, textY, textW, bodyScale, MUTED, 0, false, 1.0f);
        textY += bodyLineH;
    }
}

std::string bestMovesText(AppState *s) {
    if (!s->hasSession) return "-";
    if (s->session.mode == "campaign") {
        int best = s->progress.getInt("best_" + s->session.puzzle.levelId, -1);
        if (best < 0) return "-";
        return std::to_string(best);
    }
    if (s->session.mode == "daily") {
        int best = s->progress.getInt("daily_moves_" + s->session.dailyKey, -1);
        if (best < 0) return "-";
        return std::to_string(best);
    }
    if (s->session.mode == "playground") return tr(s, "No goal");
    int best = s->progress.getInt("best_" + s->session.puzzle.levelId, -1);
    return best < 0 ? "-" : std::to_string(best);
}

std::string puzzleDisplayName(AppState *s, const Session &g) {
    if (g.mode == "campaign" && g.puzzle.campaignIndex >= 0) {
        int chapter = campaignGroupForLevel(g.puzzle.campaignIndex) + 1;
        int level = campaignLevelNumberInGroup(g.puzzle.campaignIndex);
        if (chapter >= 1 && chapter <= static_cast<int>(chapterTitles.size())) {
            return tr(s, chapterTitles[static_cast<size_t>(chapter - 1)]) + " " + std::to_string(level);
        }
    }
    if (g.mode == "daily") {
        return tr(s, "Daily") + " " + localizedDailyTierLabel(s, dailyTierIndex(g.dailyTier));
    }
    if (g.mode == "freeplay") {
        return localizedDifficulty(s, g.puzzle.name.rfind("Easy", 0) == 0 ? "Easy" :
                                      g.puzzle.name.rfind("Hard", 0) == 0 ? "Hard" :
                                      g.puzzle.name.rfind("Expert", 0) == 0 ? "Expert" : "Medium") +
               " " + tr(s, "Custom Level");
    }
    if (g.mode == "playground") return tr(s, "Playground");
    return tr(s, g.puzzle.name);
}

std::string sessionModeLabel(AppState *s, const Session &g) {
    if (g.mode == "campaign") return tr(s, "Campaign");
    if (g.mode == "daily") return tr(s, "Daily");
    if (g.mode == "playground") return tr(s, "Playground");
    return tr(s, "Custom Level");
}

std::string completionPrimaryActionLabel(AppState *s, const Session &g) {
    if (g.mode == "daily") return tr(s, "Leaderboard");
    if (g.mode == "freeplay") return tr(s, "New Puzzle");
    if (g.mode == "playground") return tr(s, "Playground");
    if (g.mode == "campaign") {
        int next = g.puzzle.campaignIndex + 1;
        return next < CAMPAIGN_LEVEL_COUNT && s->progress.unlocked(next) ? tr(s, "Next Level") : tr(s, "Campaign");
    }
    return tr(s, "Next Level");
}

int oneStarMax(const Puzzle &p) {
    return p.targetMoves + std::max(1, p.targetMoves - p.minimumMoves);
}

int storedStarsForSession(AppState *s) {
    if (!s || !s->hasSession) return -1;
    if (s->session.mode == "playground") return -1;
    if (s->session.mode == "campaign" && s->progress.completed(s->session.puzzle.levelId)) {
        return clampInt(s->progress.stars(s->session.puzzle.levelId), 0, 3);
    }
    if (s->session.mode == "daily") {
        int moves = s->progress.getInt("daily_moves_" + s->session.dailyKey, -1);
        if (moves >= 0) return clampInt(s->progress.getInt("daily_stars_" + s->session.dailyKey, 0), 0, 3);
    }
    return -1;
}

std::string moveRangeText(int minimum, int maximum) {
    if (maximum < 0) return std::to_string(minimum) + "+";
    if (minimum == maximum) return std::to_string(minimum);
    return std::to_string(minimum) + "-" + std::to_string(maximum);
}

std::array<std::pair<int, std::string>, 4> starRankingRows(const Puzzle &p) {
    int oneMax = oneStarMax(p);
    return {{
            {3, moveRangeText(p.minimumMoves, p.minimumMoves)},
            {2, moveRangeText(p.minimumMoves + 1, p.targetMoves)},
            {1, moveRangeText(p.targetMoves + 1, oneMax)},
            {0, moveRangeText(oneMax + 1, -1)}
    }};
}

struct StarRankingLayout {
    float rowH;
    float starSize;
    float valueW;
    float valueX;
    float starX;
};

StarRankingLayout starRankingLayout(AppState *s, Rect card) {
    float padX = dp(s, 6.0f);
    float columnGap = dp(s, 4.0f);
    auto starTotalWidth = [](float size) {
        return size * 1.18f * 2.0f + size;
    };
    float starSize = dp(s, 8.2f);
    float available = std::max(dp(s, 34.0f), card.w - padX * 2.0f - columnGap);
    float minValueW = std::min(dp(s, 34.0f), available * 0.58f);
    if (starTotalWidth(starSize) + minValueW > available) {
        starSize = std::max(dp(s, 5.2f), (available - minValueW) / 3.36f);
    }
    float starsW = starTotalWidth(starSize);
    float valueW = std::min(dp(s, 50.0f), std::max(minValueW, available - starsW));
    return {card.h / 4.0f, starSize, valueW, card.x + card.w - padX - valueW, card.x + padX};
}

void drawStarRankingCard(AppState *s, Rect card, const Puzzle &p, int highlightedStars = -1) {
    Renderer &r = s->renderer;
    drawGlassPanel(s, card, PANEL);
    auto rows = starRankingRows(p);
    StarRankingLayout layout = starRankingLayout(s, card);
    for (int i = 0; i < 4; ++i) {
        int stars = rows[static_cast<size_t>(i)].first;
        float cy = card.y + layout.rowH * i + layout.rowH * 0.5f;
        bool highlighted = stars == highlightedStars;
        if (highlighted) {
            Rect row{card.x + dp(s, 4), card.y + layout.rowH * i + dp(s, 1.0f), card.w - dp(s, 8), layout.rowH - dp(s, 2.0f)};
            r.roundedRect(row.x, row.y, row.w, row.h, dp(s, 4), rgba(220, 164, 88, 0.13f));
            r.roundedStroke(row, dp(s, 4), 1.0f, rgba(220, 164, 88, 0.24f));
        }
        Rect valueBadge{layout.valueX, cy - dp(s, 9.4f), layout.valueW, dp(s, 18.0f)};
        r.roundedRect(valueBadge.x, valueBadge.y, valueBadge.w, valueBadge.h, dp(s, 4), rgba(7, 10, 14, 0.24f));
    }
    for (int i = 0; i < 4; ++i) {
        int stars = rows[static_cast<size_t>(i)].first;
        float cy = card.y + layout.rowH * i + layout.rowH * 0.5f;
        bool highlighted = stars == highlightedStars;
        drawStars(s, layout.starX, cy - layout.starSize * 0.54f, layout.starSize, stars, 3, 0, highlighted ? 1.0f : (i == 0 ? 1.0f : 0.90f));
    }
}

void drawStarRankingCardMoveLabels(AppState *s, Rect card, const Puzzle &p, int highlightedStars = -1) {
    auto rows = starRankingRows(p);
    StarRankingLayout layout = starRankingLayout(s, card);
    for (int i = 0; i < 4; ++i) {
        int stars = rows[static_cast<size_t>(i)].first;
        float cy = card.y + layout.rowH * i + layout.rowH * 0.5f;
        bool highlighted = stars == highlightedStars;
        Color valueColor = highlighted ? TEXT : (i == 0 ? TEXT : (i == 1 ? MUTED_STRONG : withAlpha(MUTED_STRONG, 0.74f)));
        Rect valueBadge{layout.valueX, cy - dp(s, 9.4f), layout.valueW, dp(s, 18.0f)};
        drawFittedText(s, rows[static_cast<size_t>(i)].second,
                       valueBadge.x + valueBadge.w * 0.5f, cy - dp(s, 6.9f),
                       valueBadge.w - dp(s, 4), dp(s, 1.82f), valueColor, 1, true, 1.05f);
    }
}

void drawPadlockBadge(AppState *s, Rect badge) {
    Renderer &r = s->renderer;
    float radius = std::max(3.0f, badge.h / 3.0f);
    r.roundedRect(badge.x, badge.y, badge.w, badge.h, radius, rgba(238, 240, 235, 0.22f));
    r.roundedRect(badge.x + 1.0f, badge.y + 1.0f, badge.w - 2.0f, badge.h - 2.0f,
                  std::max(1.0f, radius - 1.0f), rgba(7, 10, 14, 0.58f));

    float iconSide = badge.h * 0.67f;
    Rect icon{badge.x + (badge.w - iconSide) * 0.5f, badge.y + (badge.h - iconSide) * 0.5f, iconSide, iconSide};
    drawWebPadlockMark(s, icon, rgba(255, 248, 239, 0.95f), rgba(255, 248, 239, 0.94f), rgba(7, 10, 14, 0.72f));
}

void drawBoard(AppState *s) {
    Renderer &r = s->renderer;
    Puzzle &p = s->session.puzzle;
    Rect board = currentBoardRect(s);
    bool showPatternBadges = !p.tilePatterns.empty();
    float cell = board.w / p.width;
    float framePad = std::max(8.0f, std::min(dp(s, 10), cell * 0.12f));
    Rect frame{board.x - framePad, board.y - framePad, board.w + framePad * 2.0f, board.h + framePad * 2.0f};
    r.roundedRect(frame.x, frame.y, frame.w, frame.h, dp(s, 8), LINE_STRONG);
    r.roundedRect(frame.x + 1.0f, frame.y + 1.0f, frame.w - 2.0f, frame.h - 2.0f, dp(s, 7), rgba(10, 13, 19, 0.84f));

    int64_t t = nowMs();
    std::vector<int> preview;
    if (s->previewTile >= 0 && (s->previewClearAt == 0 || t < s->previewClearAt) && isTappable(p, s->previewTile)) {
        preview = affectedIndexes(p, s->previewTile);
    }
    bool showHintChanged = !s->hintChanged.empty() && t < s->hintChangedUntil;
    bool showPulse = !s->pulseTiles.empty() && t < s->pulseUntil;
    float pulsePhase = showPulse ? std::max(0.0f, 1.0f - static_cast<float>(s->pulseUntil - t) / 280.0f) : 1.0f;
    float gap = std::max(6.0f, std::min(dp(s, 7.0f), cell * 0.075f));
    for (int y = 0; y < p.height; ++y) {
        for (int x = 0; x < p.width; ++x) {
            int idx = indexFor(x, y, p.width);
            Rect tile{board.x + x * cell + gap * 0.5f, board.y + y * cell + gap * 0.5f, cell - gap, cell - gap};
            if (p.disabled.count(idx)) {
                float disabledRadius = std::min(10.0f, tile.w * 0.10f);
                r.roundedRect(tile.x + dp(s, 0.7f), tile.y + dp(s, 1.2f), tile.w, tile.h, disabledRadius, rgba(0, 0, 0, 0.13f));
                r.roundedRect(tile.x, tile.y, tile.w, tile.h, disabledRadius, rgba(190, 203, 220, 0.12f));
                r.roundedRect(tile.x + 1, tile.y + 1, tile.w - 2, tile.h - 2, std::max(1.0f, disabledRadius - 1.0f), rgba(0, 0, 0, 0.62f));
                r.rect(tile.x + tile.w * 0.16f, tile.y + tile.h * 0.16f, tile.w * 0.18f, 1.0f, rgba(190, 203, 220, 0.12f));
                r.rect(tile.x + tile.w * 0.66f, tile.y + tile.h * 0.82f, tile.w * 0.18f, 1.0f, rgba(190, 203, 220, 0.10f));
                continue;
            }
            int state = s->session.board[idx];
            float radius = std::min(10.0f, std::max(6.0f, tile.w * 0.055f));
            bool previewAffected = containsIndex(preview, idx);
            bool previewOrigin = s->previewTile == idx && !preview.empty();
            bool changedByHint = showHintChanged && containsIndex(s->hintChanged, idx);
            bool pulsed = showPulse && containsIndex(s->pulseTiles, idx);
            if (changedByHint) {
                r.glow(tile, std::min(dp(s, 14), tile.w * 0.14f), withAlpha(DANGER, 0.20f), 5);
            }
            if (pulsed) {
                r.glow(tile, std::min(dp(s, 12), tile.w * (0.10f + pulsePhase * 0.04f)), withAlpha(TEXT, 0.12f), 4);
            }
            drawMatrixTileSurface(s, tile, state, radius, true);
            if (previewAffected) {
                r.roundedRect(tile.x + 2.0f, tile.y + 2.0f, tile.w - 4.0f, tile.h - 4.0f, radius - 2.0f, rgba(2, 7, 12, previewOrigin ? 0.30f : 0.22f));
                r.roundedStroke(tile, radius, previewOrigin ? dp(s, 3.0f) : dp(s, 2.0f), withAlpha(GREEN, previewOrigin ? 0.92f : 0.68f));
            }
            if (changedByHint) {
                r.roundedStroke({tile.x + dp(s, 1.6f), tile.y + dp(s, 1.6f), tile.w - dp(s, 3.2f), tile.h - dp(s, 3.2f)},
                                std::max(1.0f, radius - dp(s, 1.6f)), dp(s, 3.0f), DANGER);
                r.roundedStroke({tile.x + dp(s, 5.0f), tile.y + dp(s, 5.0f), tile.w - dp(s, 10.0f), tile.h - dp(s, 10.0f)},
                                std::max(1.0f, radius - dp(s, 5.0f)), dp(s, 1.2f), withAlpha(ORANGE, 0.18f));
            } else if (pulsed) {
                r.roundedStroke(tile, radius, dp(s, 2.0f), withAlpha(TEXT, 0.34f * (1.0f - pulsePhase)));
            }
            if (p.locked.count(idx)) {
                float badgeSize = std::max(dp(s, 17), std::min(dp(s, 27), tile.w * 0.30f));
                Rect badge{tile.x + tile.w - badgeSize - dp(s, 4), tile.y + dp(s, 4), badgeSize, badgeSize};
                drawPadlockBadge(s, badge);
            }
            if (showPatternBadges) {
                auto patternIt = p.tilePatterns.find(idx);
                Pattern pat = patternFor(patternIt == p.tilePatterns.end() ? p.defaultPattern : patternIt->second);
                Rect badge{tile.x + tile.w * 0.07f, tile.y + tile.h * 0.07f, tile.w * 0.25f, tile.h * 0.24f};
                r.roundedRect(badge.x, badge.y, badge.w, badge.h, badge.h * 0.5f, rgba(9, 11, 18, 0.72f));
                r.text(localizedPatternBadge(s, pat), badge.x + badge.w * 0.5f, badge.y + badge.h * 0.08f, std::max(1.7f, tile.w / 40.0f), TEXT, 1);
            }
            std::string label;
            bool showNumbers = s->session.mode == "playground" ? s->showPlaygroundNumbers : !s->hideNumbers;
            if (state > 0) {
                if (showNumbers) label = std::to_string(state);
            }
            if (!label.empty()) {
                r.text(label, tile.x + tile.w * 0.5f, tile.y + tile.h * 0.5f - tile.w * 0.13f, std::max(2.0f, tile.w / 24.0f), state ? TEXT : rgba(24, 32, 43), 1);
            }
        }
    }
}

bool hintCompletionPending(AppState *s) {
    return s && s->hintCompletionDueAt > 0;
}

void drawGame(AppState *s) {
    Renderer &r = s->renderer;
    Session &g = s->session;
    bool playground = g.mode == "playground";
    int64_t t = nowMs();
    if (!g.completed) g.elapsed = static_cast<int>((t - g.started) / 1000);
    bool wide = useWideGameLayout(s);
    float top = safeTop(s) + dp(s, 8);
    float margin = dp(s, wide ? 16.0f : 14.0f);
    float gap = dp(s, wide ? 8.0f : 9.0f);
    float controlX = margin;
    float controlW = wide ? std::max(dp(s, 220.0f), wideGamePanelWidth(s) - margin * 2.0f)
                          : r.width - margin * 2.0f;
    drawBackIcon(s, {wide ? controlX : dp(s, 14), top, dp(s, 50), dp(s, 44)}, Action::ExitGame);
    drawGearIcon(s, {wide ? controlX + controlW - dp(s, 50) : r.width - dp(s, 64), top, dp(s, 50), dp(s, 44)}, Action::Settings);
    float titleX = wide ? controlX + dp(s, 60) : dp(s, 84);
    float titleW = wide ? controlW - dp(s, 120) : r.width - dp(s, 164);
    r.text(sessionModeLabel(s, g), titleX, top + dp(s, 1), dp(s, 2.32f), GREEN);
    drawFittedText(s, puzzleDisplayName(s, g), titleX, top + dp(s, 27), titleW, dp(s, 3.28f), TEXT);
    float y = top + dp(s, wide ? 58.0f : 68.0f);
    float cell = (controlW - gap * 2.0f) / 3.0f;
    float metricH = dp(s, wide ? 60.0f : 68.0f);
    Rect movesCard{controlX, y, cell, metricH};
    Rect rankingCard{controlX + cell + gap, y, cell, metricH};
    Rect timeCard{controlX + (cell + gap) * 2.0f, y, cell, metricH};
    drawGlassPanel(s, movesCard, PANEL);
    drawFittedText(s, tr(s, "Taps"), movesCard.x + movesCard.w * 0.5f, y + dp(s, 11),
                   movesCard.w - dp(s, 16), dp(s, 2.24f), MUTED, 1, true, 1.32f);
    drawFittedText(s, std::to_string(g.moves), movesCard.x + movesCard.w * 0.5f, y + dp(s, 38),
                   movesCard.w - dp(s, 14), dp(s, 3.58f), TEXT, 1, true, 1.78f);
    int rankingHighlight = storedStarsForSession(s);
    if (playground) {
        drawGlassPanel(s, rankingCard, PANEL);
        drawFittedText(s, tr(s, "Sandbox"), rankingCard.x + rankingCard.w * 0.5f, y + dp(s, 17),
                       rankingCard.w - dp(s, 14), dp(s, 2.12f), MUTED, 1, true, 1.20f);
        drawFittedText(s, tr(s, "No goal"), rankingCard.x + rankingCard.w * 0.5f, y + dp(s, 42),
                       rankingCard.w - dp(s, 14), dp(s, 2.46f), TEXT, 1, true, 1.22f);
    } else {
        drawStarRankingCard(s, rankingCard, g.puzzle, rankingHighlight);
    }
    drawGlassPanel(s, timeCard, PANEL);
    drawFittedText(s, tr(s, "Time"), timeCard.x + timeCard.w * 0.5f, y + dp(s, 11),
                   timeCard.w - dp(s, 16), dp(s, 2.24f), MUTED, 1, true, 1.32f);
    drawFittedText(s, formatTime(g.elapsed), timeCard.x + timeCard.w * 0.5f, y + dp(s, 39),
                   timeCard.w - dp(s, 14), dp(s, 3.26f), TEXT, 1, true, 1.62f);
    y += metricH + dp(s, 9);
    float detailH = dp(s, wide ? 56.0f : 60.0f);
    Rect goalCard{controlX, y, cell, detailH};
    if (!playground) {
        drawGlassPanel(s, goalCard, PANEL);
        drawFittedText(s, tr(s, "Goal"), goalCard.x + dp(s, 10), goalCard.y + dp(s, 10),
                       goalCard.w - dp(s, 20), dp(s, 1.96f), GREEN, 0, true, 1.18f);
        drawFittedText(s, tr(s, "All tiles white"), goalCard.x + dp(s, 10), goalCard.y + dp(s, 34),
                       goalCard.w - dp(s, 20), dp(s, 2.36f), TEXT, 0, true, 1.24f);
    }

    Rect patternCard{playground ? controlX : controlX + cell + gap,
                     y,
                     playground ? cell * 2.0f + gap : cell,
                     detailH};
    drawGlassPanel(s, patternCard, PANEL);
    bool patternCardPressed = isPressedButton(s, patternCard, Action::PatternInfo, 0);
    if (patternCardPressed) {
        drawPressedButtonFeedback(s, patternCard, std::min(dp(s, 8), patternCard.h * 0.18f));
    }
    float chevronSpace = dp(s, 24);
    drawFittedText(s, tr(s, "Tap effect"), patternCard.x + dp(s, 10), patternCard.y + dp(s, 10),
                   patternCard.w - dp(s, 20) - chevronSpace, dp(s, 1.96f), MUTED, 0, true, 1.18f);
    drawFittedText(s, tr(s, "View"), patternCard.x + dp(s, 10), patternCard.y + dp(s, 34),
                   patternCard.w - dp(s, 20) - chevronSpace, dp(s, 2.48f), TEXT, 0, true, 1.28f);
    float chevronX = patternCard.x + patternCard.w - dp(s, 14);
    float chevronY = patternCard.y + patternCard.h * 0.5f + dp(s, 5);
    Color chevronColor = patternCardPressed ? GREEN : MUTED_STRONG;
    r.line(chevronX - dp(s, 4), chevronY - dp(s, 6), chevronX + dp(s, 2), chevronY,
           dp(s, 2.0f), chevronColor);
    r.line(chevronX + dp(s, 2), chevronY, chevronX - dp(s, 4), chevronY + dp(s, 6),
           dp(s, 2.0f), chevronColor);
    addButton(s, patternCard, Action::PatternInfo, 0, true);
    Rect bestCard{controlX + (cell + gap) * 2.0f, y, cell, detailH};
    drawGlassPanel(s, bestCard, PANEL);
    drawFittedText(s, tr(s, "Personal Best"), bestCard.x + dp(s, 10), y + dp(s, 10),
                   bestCard.w - dp(s, 20), dp(s, 1.96f), MUTED, 0, true, 1.18f);
    drawFittedText(s, bestMovesText(s), bestCard.x + dp(s, 10), y + dp(s, 34),
                   bestCard.w - dp(s, 20), dp(s, 2.64f), GREEN, 0, true, 1.36f);
    y += detailH + dp(s, 9);
    float toolH = dp(s, wide ? 52.0f : 58.0f);
    bool leaderboardAttempt = g.mode == "daily" && g.leaderboardAttempt && !g.completed;
    bool waitingForHintCompletion = hintCompletionPending(s);
    Rect undoButton{controlX, y, cell, toolH};
    Rect resetButton{controlX + cell + gap, y, cell, toolH};
    Rect hintButton{controlX + (cell + gap) * 2.0f, y, cell, toolH};
    Rect notice{resetButton.x, y, cell * 2.0f + gap, toolH};
    drawUndoToolButton(s, undoButton, !waitingForHintCompletion && !g.history.empty());
    if (leaderboardAttempt) {
        drawGlassPanel(s, notice, PANEL);
        drawFittedText(s, tr(s, "Leaderboard try"), notice.x + dp(s, 10), notice.y + dp(s, 9),
                       notice.w - dp(s, 20), dp(s, 1.96f), ORANGE, 0, true, 1.18f);
        drawFittedText(s, tr(s, "No reset or hints"), notice.x + dp(s, 10), notice.y + dp(s, 31),
                       notice.w - dp(s, 20), dp(s, 2.44f), TEXT, 0, true, 1.26f);
    } else {
        drawResetToolButton(s, resetButton, !waitingForHintCompletion);
        drawHintToolButton(s, hintButton, !playground && !waitingForHintCompletion && t >= s->hintCooldownUntil);
    }
    drawBoard(s);
    if (!playground) drawStarRankingCardMoveLabels(s, rankingCard, g.puzzle, rankingHighlight);
    drawFittedText(s, tr(s, "Time"), timeCard.x + timeCard.w * 0.5f, timeCard.y + dp(s, 11),
                   timeCard.w - dp(s, 16), dp(s, 2.24f), MUTED, 1, true, 1.32f);
    drawFittedText(s, formatTime(g.elapsed), timeCard.x + timeCard.w * 0.5f, timeCard.y + dp(s, 39),
                   timeCard.w - dp(s, 14), dp(s, 3.26f), TEXT, 1, true, 1.62f);
    if (leaderboardAttempt) {
        drawFittedText(s, tr(s, "Leaderboard try"), notice.x + dp(s, 10), notice.y + dp(s, 9),
                       notice.w - dp(s, 20), dp(s, 1.96f), ORANGE, 0, true, 1.18f);
        drawFittedText(s, tr(s, "No reset or hints"), notice.x + dp(s, 10), notice.y + dp(s, 31),
                       notice.w - dp(s, 20), dp(s, 2.44f), TEXT, 0, true, 1.26f);
    } else {
        drawFittedText(s, tr(s, "Reset"), resetButton.x + resetButton.w * 0.5f,
                       resetButton.y + resetButton.h * 0.5f - dp(s, 8.0f),
                       resetButton.w - dp(s, 12), dp(s, 2.86f),
                       !waitingForHintCompletion ? TEXT : withAlpha(MUTED, 0.45f), 1, true, 1.22f);
    }
    if (!s->hintLine.empty()) {
        if (wide) {
            float hintY = std::min(r.height - safeBottom(s) - dp(s, 24), y + toolH + dp(s, 22));
            drawFittedText(s, tr(s, s->hintLine), controlX, hintY, controlW, dp(s, 2.08f), MUTED, 0, false, 1.0f);
        } else {
            r.text(tr(s, s->hintLine), r.width * 0.5f, r.height - safeBottom(s) - dp(s, 24), dp(s, 2.08f), MUTED, 1);
        }
    }

    if (s->completion) {
        r.rect(0, 0, r.width, r.height, rgba(0, 0, 0, 0.64f));
        float modalH = std::min(dp(s, 502), r.height - safeTop(s) - safeBottom(s) - dp(s, 42));
        Rect modal{dp(s, 18), r.height - safeBottom(s) - modalH - dp(s, 18), r.width - dp(s, 36), modalH};
        modal.y = std::max(safeTop(s) + dp(s, 16), modal.y);
        r.roundedRect(modal.x, modal.y, modal.w, modal.h, dp(s, 8), LINE_STRONG);
        r.roundedRect(modal.x + 1.2f, modal.y + 1.2f, modal.w - 2.4f, modal.h - 2.4f, dp(s, 7), PANEL_2);
        r.text(tr(s, "Complete"), modal.x + dp(s, 18), modal.y + dp(s, 18), dp(s, 1.9f), GREEN);
        std::string completeTitle = g.mode == "daily"
                                    ? tr(s, "Daily") + " " + localizedDailyTierLabel(s, dailyTierIndex(g.dailyTier)) + " " + tr(s, "Complete")
                                    : tr(s, "Level Complete");
        r.text(completeTitle, modal.x + dp(s, 18), modal.y + dp(s, 48), dp(s, 3.25f), TEXT);
        drawStars(s, modal.x + modal.w * 0.5f, modal.y + dp(s, 88), dp(s, 26), s->completionStars, 3, 1, 1.0f);

        auto resultCard = [&](Rect card, const std::string &label, const std::string &value) {
            r.roundedRect(card.x, card.y, card.w, card.h, dp(s, 8), LINE);
            r.roundedRect(card.x + 1.0f, card.y + 1.0f, card.w - 2.0f, card.h - 2.0f, dp(s, 7), rgba(10, 13, 19, 0.76f));
            r.text(label, card.x + dp(s, 8), card.y + dp(s, 9), dp(s, 1.55f), MUTED);
            r.text(value, card.x + dp(s, 8), card.y + dp(s, 31), dp(s, 2.45f), TEXT);
        };

        float cardGap = dp(s, 8);
        float cardW = (modal.w - dp(s, 36) - cardGap) * 0.5f;
        float cx = modal.x + dp(s, 18);
        float cy = modal.y + dp(s, 132);
        resultCard({cx, cy, cardW, dp(s, 60)}, tr(s, "Taps Used"), std::to_string(g.moves));
        resultCard({cx + cardW + cardGap, cy, cardW, dp(s, 60)}, tr(s, "Minimum"), std::to_string(g.puzzle.minimumMoves));
        cy += dp(s, 70);
        resultCard({cx, cy, cardW, dp(s, 60)}, g.mode == "daily" ? tr(s, "Mark") : tr(s, "Best Taps"),
                   g.mode == "daily" ? formatMark(s->completionMark) : bestMovesText(s));
        resultCard({cx + cardW + cardGap, cy, cardW, dp(s, 60)}, tr(s, "Time"), formatTime(g.elapsed));

        float buttonH = dp(s, 44);
        float buttonGap = dp(s, 10);
        float dismissY = modal.y + modal.h - dp(s, 18) - buttonH;
        float replayY = dismissY - buttonGap - buttonH;
        float primaryY = replayY - buttonGap - buttonH;

        float by = cy + dp(s, 76);
        float starW = (modal.w - dp(s, 36) - cardGap * 3.0f) / 4.0f;
        float starCardH = dp(s, 50);
        float minStarY = cy + dp(s, 68);
        float maxStarY = primaryY - dp(s, 16) - starCardH;
        bool showStarBreakdown = maxStarY >= minStarY;
        if (showStarBreakdown) by = std::min(by, maxStarY);
        int oneMax = oneStarMax(g.puzzle);
        std::array<std::pair<int, std::string>, 4> breakdown = {{
                {3, moveRangeText(g.puzzle.minimumMoves, g.puzzle.minimumMoves)},
                {2, moveRangeText(g.puzzle.minimumMoves + 1, g.puzzle.targetMoves)},
                {1, moveRangeText(g.puzzle.targetMoves + 1, oneMax)},
                {0, moveRangeText(oneMax + 1, -1)}
        }};
        std::array<Rect, 4> starCards{};
        if (showStarBreakdown) {
            for (int i = 0; i < 4; ++i) {
                Rect card{modal.x + dp(s, 18) + i * (starW + cardGap), by, starW, starCardH};
                starCards[static_cast<size_t>(i)] = card;
                bool highlighted = breakdown[i].first == s->completionStars;
                r.roundedRect(card.x, card.y, card.w, card.h, dp(s, 8), highlighted ? rgba(220, 164, 88, 0.34f) : LINE);
                r.roundedRect(card.x + 1.0f, card.y + 1.0f, card.w - 2.0f, card.h - 2.0f, dp(s, 7),
                              highlighted ? rgba(62, 45, 28, 0.70f) : rgba(10, 13, 19, 0.58f));
            }
            for (int i = 0; i < 4; ++i) {
                Rect card = starCards[static_cast<size_t>(i)];
                drawStars(s, card.x + dp(s, 7), card.y + dp(s, 8), dp(s, 7.2f), breakdown[i].first, 3, 0, 0.95f);
            }
        }
        std::string primaryLabel = completionPrimaryActionLabel(s, g);
        if (g.mode != "daily") {
            drawButton(s, {modal.x + dp(s, 18), primaryY, modal.w - dp(s, 36), buttonH}, primaryLabel, Action::Next, 0, true);
        } else {
            drawButton(s, {modal.x + dp(s, 18), primaryY, modal.w - dp(s, 36), buttonH}, primaryLabel, Action::Leaderboard, dailyTierIndex(g.dailyTier), true);
        }
        drawButton(s, {modal.x + dp(s, 18), replayY, modal.w - dp(s, 36), buttonH}, tr(s, "Replay"), Action::Replay);
        std::string dismissLabel = g.mode == "campaign" ? tr(s, "Campaign") : (g.mode == "daily" ? tr(s, "Daily") : tr(s, "Menu"));
        drawButton(s, {modal.x + dp(s, 18), dismissY, modal.w - dp(s, 36), buttonH}, dismissLabel, Action::Dismiss);
        if (showStarBreakdown) {
            for (int i = 0; i < 4; ++i) {
                Rect card = starCards[static_cast<size_t>(i)];
                drawFittedText(s, breakdown[i].second, card.x + dp(s, 7), card.y + dp(s, 28),
                               card.w - dp(s, 14), dp(s, 1.55f), TEXT, 0, false, 1.0f);
            }
        }
    }

    if (s->dailyExitConfirm) {
        r.rect(0, 0, r.width, r.height, rgba(0, 0, 0, 0.68f));
        addButton(s, {0.0f, 0.0f, static_cast<float>(r.width), static_cast<float>(r.height)}, Action::CancelDailyExit, 0, true);
        float modalW = r.width - dp(s, 36);
        float modalH = dp(s, 276);
        Rect modal{dp(s, 18), (r.height - modalH) * 0.5f, modalW, modalH};
        modal.y = std::max(safeTop(s) + dp(s, 18), std::min(modal.y, r.height - safeBottom(s) - modalH - dp(s, 18)));
        r.roundedRect(modal.x, modal.y, modal.w, modal.h, dp(s, 8), rgba(220, 164, 88, 0.34f));
        r.roundedRect(modal.x + 1.2f, modal.y + 1.2f, modal.w - 2.4f, modal.h - 2.4f, dp(s, 7), PANEL_2);
        r.text(tr(s, "Exit daily challenge?"), modal.x + dp(s, 18), modal.y + dp(s, 24), dp(s, 3.05f), TEXT);
        std::vector<std::string> lines = wrapTextLines(
                s,
                tr(s, "This is your first try. Exiting now records 0 for this daily leaderboard. You can replay afterward, but only this try counts."),
                dp(s, 1.90f),
                modal.w - dp(s, 36));
        float textY = modal.y + dp(s, 68);
        for (const std::string &line : lines) {
            r.text(line, modal.x + dp(s, 18), textY, dp(s, 1.90f), MUTED);
            textY += dp(s, 24);
        }
        float buttonY = modal.y + modal.h - dp(s, 110);
        drawButton(s, {modal.x + dp(s, 18), buttonY, modal.w - dp(s, 36), dp(s, 44)}, tr(s, "Keep Playing"), Action::CancelDailyExit, 0, true);
        drawButton(s, {modal.x + dp(s, 18), buttonY + dp(s, 54), modal.w - dp(s, 36), dp(s, 44)}, tr(s, "Exit for 0"), Action::ConfirmDailyExit);
    }

    drawPatternInfoPopup(s);
}

void updateScrollMomentum(AppState *s, int64_t t) {
    if (!scrollable(s->screen) || s->dragging) {
        s->lastScrollFrameTime = t;
        if (!scrollable(s->screen)) stopScrollMomentum(s);
        return;
    }
    if (std::fabs(s->scrollVelocity) < dp(s, 3.5f)) {
        stopScrollMomentum(s);
        return;
    }
    if (s->lastScrollFrameTime == 0) {
        s->lastScrollFrameTime = t;
        return;
    }
    float dt = static_cast<float>(std::max<int64_t>(0, t - s->lastScrollFrameTime)) / 1000.0f;
    s->lastScrollFrameTime = t;
    if (dt <= 0.0f) return;
    dt = std::min(dt, 0.064f);

    float next = clampScrollOffset(s, s->scroll + s->scrollVelocity * dt);
    if (next == s->scroll && (next <= 0.0f || next >= maxScrollOffset(s))) {
        s->scroll = next;
        stopScrollMomentum(s);
        return;
    }
    s->scroll = next;
    s->scrollVelocity *= std::exp(-2.85f * dt);
}

void updateInteractionState(AppState *s) {
    int64_t t = nowMs();
    updateScrollMomentum(s, t);
    if (s->hasPressedButton && s->pressedButtonUntil > 0 && t >= s->pressedButtonUntil) {
        clearPressedButton(s);
    }
    if (s->hintCompletionDueAt > 0 && t >= s->hintCompletionDueAt) {
        s->hintCompletionDueAt = 0;
        if (s->hasSession && s->screen == Screen::Game && s->session.mode != "playground" && !s->session.completed &&
            solved(s->session.puzzle, s->session.board)) {
            completeGame(s);
        }
    }
    if (!s->playgroundStatus.empty() && s->playgroundStatusUntil > 0 && t >= s->playgroundStatusUntil) {
        s->playgroundStatus.clear();
        s->playgroundStatusUntil = 0;
    }
    if (s->previewTile >= 0 && s->previewClearAt > 0 && t >= s->previewClearAt) {
        s->previewTile = -1;
        s->previewClearAt = 0;
        if (s->hintLine == "Previewing this tap.") s->hintLine.clear();
    }
    if (!s->hintChanged.empty() && t >= s->hintChangedUntil) {
        s->hintChanged.clear();
        s->hintChangedUntil = 0;
    }
    if (!s->pulseTiles.empty() && t >= s->pulseUntil) {
        s->pulseTiles.clear();
        s->pulseUntil = 0;
    }
    if (!s->patternInfoOpen && s->screen == Screen::Game && s->hasSession && s->pressTile >= 0 && !s->longPreviewShown &&
        t - s->downTime >= 380 && isTappable(s->session.puzzle, s->pressTile)) {
        s->previewTile = s->pressTile;
        s->previewClearAt = 0;
        s->longPreviewShown = true;
        s->hintLine = "Previewing this tap.";
        playSound(s, SoundCue::Preview);
        vibrate(s, 8);
    }
}

void render(AppState *s) {
    if (!platform::shouldRender(s->resumed, s->renderer.ready())) return;
    updateInteractionState(s);
    s->buttons.clear();
    s->renderer.begin();
    drawBackground(s);
    switch (s->screen) {
        case Screen::Main: drawMain(s); break;
        case Screen::Campaign: drawCampaign(s); break;
        case Screen::Freeplay: drawFreeplay(s); break;
        case Screen::Playground: drawPlayground(s); break;
        case Screen::Daily: drawDaily(s); break;
        case Screen::HowTo: drawHowTo(s); break;
        case Screen::Math: drawMath(s); break;
        case Screen::Settings: drawSettings(s); break;
        case Screen::About: drawAbout(s); break;
        case Screen::Game: drawGame(s); break;
    }
    s->renderer.flush();
}

void startFreeplay(AppState *s) {
    Config c;
    if (s->freeSize == "Custom") {
        c.width = s->customW;
        c.height = s->customH;
    } else {
        c.width = c.height = std::atoi(s->freeSize.substr(0, 1).c_str());
    }
    c.states = s->freeStates;
    c.pattern = s->freePattern;
    c.difficulty = s->freeDifficulty;
    c.locked = s->freeLocked;
    c.irregular = s->freeIrregular;
    s->freeUnique = true;
    c.unique = true;
    c.seed = "free-" + std::to_string(nowMs());
    c.name = c.difficulty + " Custom Level";
    saveFreePrefs(s);
    startGame(s, generatePuzzle(c), "freeplay");
}

void resizePlayground(AppState *s, int width, int height) {
    PlaygroundConfig old = playgroundConfigFromState(s);
    PlaygroundConfig next = old;
    next.width = clampInt(width, 3, 9);
    next.height = clampInt(height, 3, 9);
    int total = next.width * next.height;
    next.board.assign(static_cast<size_t>(total), 0);
    next.locked.clear();
    next.disabled.clear();
    int copyW = std::min(old.width, next.width);
    int copyH = std::min(old.height, next.height);
    for (int y = 0; y < copyH; ++y) {
        for (int x = 0; x < copyW; ++x) {
            int oldIdx = indexFor(x, y, old.width);
            int nextIdx = indexFor(x, y, next.width);
            next.board[static_cast<size_t>(nextIdx)] = old.board[static_cast<size_t>(oldIdx)];
            if (old.locked.count(oldIdx)) next.locked.insert(nextIdx);
            if (old.disabled.count(oldIdx)) next.disabled.insert(nextIdx);
        }
    }
    applyPlaygroundConfig(s, next);
    savePlaygroundPrefs(s);
}

Puzzle playgroundPuzzleFromState(AppState *s);

void tapPlaygroundTile(AppState *s, int idx) {
    PlaygroundConfig config = playgroundConfigFromState(s);
    Puzzle p = playgroundPuzzleFromState(s);
    if (!isTappable(p, idx)) {
        playSound(s, SoundCue::Invalid);
        vibrate(s, 16);
        return;
    }
    std::vector<int> affected = affectedIndexes(p, idx);
    applyPulse(p, config.board, idx);
    applyPlaygroundConfig(s, config);
    savePlaygroundPrefs(s);
    setPlaygroundStatus(s, "");
    int stateAfterTap = config.board[static_cast<size_t>(idx)];
    playSound(s, SoundCue::Pulse, (static_cast<int>(affected.size()) << 8) | stateAfterTap);
    vibrate(s, 6);
}

void editPlaygroundTile(AppState *s, int idx) {
    PlaygroundConfig config = playgroundConfigFromState(s);
    int total = config.width * config.height;
    if (idx < 0 || idx >= total) return;
    if (s->playgroundTool == PLAYGROUND_TOOL_TAP) {
        tapPlaygroundTile(s, idx);
        return;
    }
    int paintState = playgroundPaintStateForTool(s->playgroundTool);
    if (s->playgroundTool == PLAYGROUND_TOOL_HOLE) {
        if (config.disabled.count(idx)) {
            config.disabled.erase(idx);
        } else if (static_cast<int>(config.disabled.size()) >= total - 1) {
            setPlaygroundStatus(s, "Keep at least one tile.");
            playSound(s, SoundCue::Invalid);
            return;
        } else {
            config.disabled.insert(idx);
            config.locked.erase(idx);
            config.board[static_cast<size_t>(idx)] = 0;
        }
    } else if (s->playgroundTool == PLAYGROUND_TOOL_LOCK) {
        config.disabled.erase(idx);
        if (config.locked.count(idx)) config.locked.erase(idx);
        else config.locked.insert(idx);
    } else if (paintState >= 0) {
        if (config.disabled.count(idx)) {
            config.disabled.erase(idx);
        }
        config.board[static_cast<size_t>(idx)] = mod(paintState, config.states);
    }
    applyPlaygroundConfig(s, config);
    savePlaygroundPrefs(s);
    setPlaygroundStatus(s, "");
    playSound(s, SoundCue::Ui);
}

Puzzle playgroundPuzzleFromState(AppState *s) {
    PlaygroundConfig config = playgroundConfigFromState(s);
    Puzzle p;
    p.width = config.width;
    p.height = config.height;
    p.states = config.states;
    p.defaultPattern = config.pattern;
    p.locked = config.locked;
    p.disabled = config.disabled;
    p.tilePatterns.clear();
    p.levelId = "playground-" + std::to_string(Rng::hash(encodePlaygroundSeed(config)));
    p.name = "Playground";
    p.initial = config.board;
    p.solution.clear();
    p.minimumMoves = 0;
    p.targetMoves = 0;
    p.difficultyRating = 0;
    p.scrambleMoves = 0;
    return p;
}

void startPlayground(AppState *s) {
    savePlaygroundPrefs(s);
    startGame(s, playgroundPuzzleFromState(s), "playground");
}

void startDailyChallenge(AppState *s, int tier) {
    tier = clampInt(tier, 0, 2);
    std::string date = dailyKey();
    Config c = dailyConfig(tier, date);
    startGame(s, generatePuzzle(c), "daily");
    s->session.dailyKey = dailyChallengeKey(date, tier);
    s->session.dailyTier = dailyTierKey(tier);
    s->session.leaderboardAttempt = !dailyLeaderboardRecorded(s, s->session.dailyKey);
}

void handleAction(AppState *s, const Button &b) {
    if (!b.enabled) return;
    switch (b.action) {
        case Action::Main: playSound(s, SoundCue::Ui); go(s, Screen::Main); break;
        case Action::BackReturn: playSound(s, SoundCue::Ui); closeSettings(s); break;
        case Action::CloseAbout: playSound(s, SoundCue::Ui); go(s, Screen::Settings); break;
        case Action::Campaign: playSound(s, SoundCue::Ui); go(s, Screen::Campaign); break;
        case Action::Freeplay: playSound(s, SoundCue::Ui); go(s, Screen::Freeplay); break;
        case Action::Playground:
            playSound(s, SoundCue::Ui);
            s->playgroundTool = PLAYGROUND_TOOL_TAP;
            go(s, Screen::Playground);
            break;
        case Action::Daily: playSound(s, SoundCue::Ui); go(s, Screen::Daily); break;
        case Action::Achievements:
            playSound(s, SoundCue::Ui);
            syncEarnedCampaignAchievements(s);
            playGamesShowAchievements(s);
            break;
        case Action::HowTo: playSound(s, SoundCue::Ui); go(s, Screen::HowTo); break;
        case Action::Math: playSound(s, SoundCue::Ui); go(s, Screen::Math); break;
        case Action::Settings:
            playSound(s, SoundCue::Ui);
            if (s->screen != Screen::Settings && s->screen != Screen::About) s->returnScreen = s->screen;
            go(s, Screen::Settings);
            break;
        case Action::About:
            playSound(s, SoundCue::Ui);
            go(s, Screen::About);
            break;
        case Action::OpenGithub:
            playSound(s, SoundCue::Ui);
            openUrl(s, GITHUB_PROFILE_URL);
            break;
        case Action::DailyChallenge:
            playSound(s, SoundCue::Start);
            startDailyChallenge(s, b.value);
            break;
        case Action::Leaderboard:
            playSound(s, SoundCue::Ui);
            playGamesShowLeaderboard(s, clampInt(b.value, 0, 3));
            break;
        case Action::CampaignGroup:
            if (s->progress.groupUnlocked(b.value)) {
                playSound(s, SoundCue::Ui);
                s->selectedCampaignGroup = clampInt(b.value, 0, CAMPAIGN_GROUP_COUNT - 1);
            } else {
                playSound(s, SoundCue::Invalid);
            }
            break;
        case Action::StartCampaign:
            if (!campaignLevelsReady(s)) break;
            if (!s->progress.unlocked(b.value)) {
                playSound(s, SoundCue::Invalid);
                break;
            }
            playSound(s, SoundCue::Start);
            s->lastCampaign = b.value;
            s->selectedCampaignGroup = campaignGroupForLevel(b.value);
            startGame(s, campaignLevel(s, b.value), "campaign");
            break;
        case Action::Size: {
            playSound(s, SoundCue::Ui);
            std::vector<std::string> values = {"3x3", "4x4", "5x5", "6x6", "7x7", "Custom"};
            s->freeSize = values[b.value];
            saveFreePrefs(s);
            break;
        }
        case Action::States: {
            playSound(s, SoundCue::Ui);
            std::vector<int> values = {2, 3, 4, 5};
            s->freeStates = values[b.value];
            saveFreePrefs(s);
            break;
        }
        case Action::Pattern: {
            playSound(s, SoundCue::Ui);
            std::vector<std::string> values = {"cross", "diagonal", "square", "horizontal", "vertical", "knight", "randomMixed"};
            s->freePattern = values[b.value];
            saveFreePrefs(s);
            break;
        }
        case Action::PatternInfo:
            if (!s->hasSession || s->screen != Screen::Game || s->completion ||
                s->dailyExitConfirm || s->session.completed) {
                break;
            }
            playSound(s, SoundCue::Ui);
            s->patternInfoOpen = true;
            s->patternInfoOpenedAt = nowMs();
            s->pressTile = -1;
            s->longPreviewShown = false;
            s->previewTile = -1;
            s->previewClearAt = 0;
            if (s->hintLine == "Previewing this tap.") s->hintLine.clear();
            break;
        case Action::ClosePatternInfo:
            playSound(s, SoundCue::Ui);
            s->patternInfoOpen = false;
            s->patternInfoOpenedAt = 0;
            break;
        case Action::PatternInfoBlocker:
            break;
        case Action::Difficulty: {
            playSound(s, SoundCue::Ui);
            std::vector<std::string> values = {"Easy", "Medium", "Hard", "Expert"};
            s->freeDifficulty = values[b.value];
            saveFreePrefs(s);
            break;
        }
        case Action::ToggleLocked: playSound(s, SoundCue::Ui); s->freeLocked = !s->freeLocked; saveFreePrefs(s); break;
        case Action::ToggleIrregular: playSound(s, SoundCue::Ui); s->freeIrregular = !s->freeIrregular; saveFreePrefs(s); break;
        case Action::ToggleUnique:
            playSound(s, SoundCue::Ui);
            s->freeUnique = !s->freeUnique;
            saveFreePrefs(s);
            break;
        case Action::PlaygroundStates: {
            playSound(s, SoundCue::Ui);
            std::vector<int> values = {2, 3, 4, 5};
            PlaygroundConfig config = playgroundConfigFromState(s);
            config.states = values[static_cast<size_t>(clampInt(b.value, 0, 3))];
            for (int &value : config.board) value = mod(value, config.states);
            applyPlaygroundConfig(s, config);
            savePlaygroundPrefs(s);
            break;
        }
        case Action::PlaygroundPattern: {
            playSound(s, SoundCue::Ui);
            PlaygroundConfig config = playgroundConfigFromState(s);
            config.pattern = PLAYGROUND_PATTERNS[static_cast<size_t>(clampInt(b.value, 0, static_cast<int>(PLAYGROUND_PATTERNS.size()) - 1))];
            applyPlaygroundConfig(s, config);
            savePlaygroundPrefs(s);
            break;
        }
        case Action::PlaygroundTool:
            playSound(s, SoundCue::Ui);
            s->playgroundTool = playgroundToolAllowed(b.value, s->playgroundStates) ? b.value : PLAYGROUND_TOOL_TAP;
            break;
        case Action::PlaygroundTile:
            editPlaygroundTile(s, b.value);
            break;
        case Action::PlaygroundSection:
            playSound(s, SoundCue::Ui);
            if (b.value == 0) s->playgroundStatesOpen = !s->playgroundStatesOpen;
            else if (b.value == 1) s->playgroundPatternOpen = !s->playgroundPatternOpen;
            else if (b.value == 2) s->playgroundSizeOpen = !s->playgroundSizeOpen;
            else if (b.value == 3) s->playgroundCodeOpen = !s->playgroundCodeOpen;
            break;
        case Action::PlaygroundWidthMinus: playSound(s, SoundCue::Ui); resizePlayground(s, s->playgroundW - 1, s->playgroundH); break;
        case Action::PlaygroundWidthPlus: playSound(s, SoundCue::Ui); resizePlayground(s, s->playgroundW + 1, s->playgroundH); break;
        case Action::PlaygroundHeightMinus: playSound(s, SoundCue::Ui); resizePlayground(s, s->playgroundW, s->playgroundH - 1); break;
        case Action::PlaygroundHeightPlus: playSound(s, SoundCue::Ui); resizePlayground(s, s->playgroundW, s->playgroundH + 1); break;
        case Action::PlaygroundClear: {
            playSound(s, SoundCue::Reset);
            PlaygroundConfig config = playgroundConfigFromState(s);
            config.board.assign(static_cast<size_t>(config.width * config.height), 0);
            config.locked.clear();
            config.disabled.clear();
            applyPlaygroundConfig(s, config);
            savePlaygroundPrefs(s);
            setPlaygroundStatus(s, "");
            break;
        }
        case Action::PlaygroundCopy:
            playSound(s, SoundCue::Ui);
            setClipboardText(s, encodePlaygroundSeed(playgroundConfigFromState(s)));
            setPlaygroundStatus(s, "Puzzle code copied.");
            break;
        case Action::PlaygroundPaste: {
            playSound(s, SoundCue::Ui);
            PlaygroundConfig config;
            std::string text = getClipboardText(s);
            if (text.empty()) {
                setPlaygroundStatus(s, "Clipboard has no puzzle code.");
                playSound(s, SoundCue::Invalid);
            } else if (decodePlaygroundSeed(text, &config)) {
                applyPlaygroundConfig(s, config);
                savePlaygroundPrefs(s);
                setPlaygroundStatus(s, "Puzzle code loaded.");
            } else {
                setPlaygroundStatus(s, "Puzzle code not recognized.");
                playSound(s, SoundCue::Invalid);
            }
            break;
        }
        case Action::PlaygroundPlay:
            playSound(s, SoundCue::Start);
            startPlayground(s);
            break;
        case Action::GuideSize:
            playSound(s, SoundCue::Ui);
            s->guideTextSize = clampInt(b.value, 0, 2);
            s->progress.setInt("setting_guide_text_size", s->guideTextSize);
            break;
        case Action::Language: {
            playSound(s, SoundCue::Ui);
            s->language = languages[clampInt(b.value, 0, static_cast<int>(std::size(languages)) - 1)].code;
            s->progress.setString("setting_language", s->language);
            break;
        }
        case Action::ToggleSetting:
            if (b.value == 0) {
                s->sound = !s->sound;
                s->progress.setInt("setting_sound", s->sound ? 1 : 0);
                if (s->sound) s->audio.play(SoundCue::Ui);
            } else if (b.value == 1) {
                playSound(s, SoundCue::Ui);
                s->vibration = !s->vibration;
                s->progress.setInt("setting_vibration", s->vibration ? 1 : 0);
                if (s->vibration) vibrate(s, 10);
            } else if (b.value == 2) {
                playSound(s, SoundCue::Ui);
                s->hideNumbers = !s->hideNumbers;
                s->progress.setInt("setting_hide_numbers", s->hideNumbers ? 1 : 0);
            } else if (b.value == 3) {
                playSound(s, SoundCue::Ui);
                s->showPlaygroundNumbers = !s->showPlaygroundNumbers;
                s->progress.setInt("setting_show_playground_numbers", s->showPlaygroundNumbers ? 1 : 0);
            }
            break;
        case Action::WidthMinus: playSound(s, SoundCue::Ui); s->customW = clampInt(s->customW - 1, 3, 9); saveFreePrefs(s); break;
        case Action::WidthPlus: playSound(s, SoundCue::Ui); s->customW = clampInt(s->customW + 1, 3, 9); saveFreePrefs(s); break;
        case Action::HeightMinus: playSound(s, SoundCue::Ui); s->customH = clampInt(s->customH - 1, 3, 9); saveFreePrefs(s); break;
        case Action::HeightPlus: playSound(s, SoundCue::Ui); s->customH = clampInt(s->customH + 1, 3, 9); saveFreePrefs(s); break;
        case Action::Generate: playSound(s, SoundCue::Start); startFreeplay(s); break;
        case Action::ExitGame:
            playSound(s, SoundCue::Ui);
            requestExitGame(s);
            break;
        case Action::ConfirmDailyExit:
            playSound(s, SoundCue::Ui);
            confirmDailyExitForZero(s);
            break;
        case Action::CancelDailyExit:
            playSound(s, SoundCue::Ui);
            s->dailyExitConfirm = false;
            break;
        case Action::Undo:
            if (s->hasSession && !s->session.history.empty() && !s->session.completed && !hintCompletionPending(s)) {
                playSound(s, SoundCue::Undo);
                Snapshot snap = s->session.history.back();
                s->session.history.pop_back();
                s->session.board = snap.board;
                s->session.remaining = snap.remaining;
                s->session.moves = std::max(0, s->session.moves - 1);
                s->hintLine.clear();
                s->previewTile = -1;
                s->hintChanged.clear();
                s->pulseTiles.clear();
            }
            break;
        case Action::Reset:
            if (s->hasSession && !hintCompletionPending(s) &&
                !(s->session.mode == "daily" && s->session.leaderboardAttempt)) {
                playSound(s, SoundCue::Reset);
                bool usedHint = s->session.usedHint;
                s->session.reset();
                s->session.usedHint = usedHint;
                s->session.leaderboardAttempt = false;
                s->hintLine.clear();
                s->previewTile = -1;
                s->hintChanged.clear();
                s->pulseTiles.clear();
            }
            break;
        case Action::Hint:
            if (s->hasSession && s->session.mode == "playground") {
                playSound(s, SoundCue::Invalid);
                s->hintLine = "Hints are off in Playground.";
                break;
            }
            if (s->hasSession && !s->session.completed && !hintCompletionPending(s) &&
                !(s->session.mode == "daily" && s->session.leaderboardAttempt)) {
                int64_t t = nowMs();
                if (t < s->hintCooldownUntil) break;
                // Changelog note: Hints throttle rapid taps and delay the result modal after a final hint tap.
                s->hintCooldownUntil = t + HINT_COOLDOWN_MS;
                s->previewTile = -1;
                s->hintChanged.clear();
                int tap = -1;
                for (auto &entry : s->session.remaining) {
                    if (entry.second > 0 && isTappable(s->session.puzzle, entry.first)) { tap = entry.first; break; }
                }
                if (tap < 0) {
                    for (int i : tappableIndexes(s->session.puzzle)) {
                        if (s->session.board[i] != 0) { tap = i; break; }
                    }
                }
                if (tap >= 0) {
                    std::vector<int> affected = affectedIndexes(s->session.puzzle, tap);
                    s->session.history.push_back({s->session.board, s->session.remaining});
                    applyPulse(s->session.puzzle, s->session.board, tap);
                    int next = mod(s->session.remaining[tap] - 1, s->session.puzzle.states);
                    if (next) s->session.remaining[tap] = next; else s->session.remaining.erase(tap);
                    s->session.moves++;
                    s->session.usedHint = true;
                    s->hintChanged = affected;
                    s->hintChangedUntil = t + 2600;
                    s->pulseTiles = affected;
                    s->pulseUntil = t + 280;
                    s->hintLine = "Hint applied. Red tiles changed. This try is worth 0 stars.";
                    playSound(s, SoundCue::Hint);
                    if (solved(s->session.puzzle, s->session.board)) {
                        s->hintCompletionDueAt = t + HINT_COMPLETION_DELAY_MS;
                    }
                } else {
                    playSound(s, SoundCue::Invalid);
                    s->hintLine = "No useful tap is available.";
                }
            }
            break;
        case Action::Next:
            if (!s->hasSession) break;
            playSound(s, SoundCue::Start);
            if (s->session.mode == "campaign") {
                int next = s->lastCampaign + 1;
                if (next < CAMPAIGN_LEVEL_COUNT && s->progress.unlocked(next)) {
                    s->lastCampaign = next;
                    s->selectedCampaignGroup = campaignGroupForLevel(next);
                    startGame(s, campaignLevel(s, next), "campaign");
                } else {
                    go(s, Screen::Campaign);
                }
            } else if (s->session.mode == "freeplay") {
                startFreeplay(s);
            } else if (s->session.mode == "playground") {
                go(s, Screen::Playground);
            }
            break;
        case Action::Replay:
            if (s->hasSession) {
                playSound(s, SoundCue::Start);
                Puzzle p = s->session.puzzle;
                std::string mode = s->session.mode;
                std::string key = s->session.dailyKey;
                std::string tier = s->session.dailyTier;
                startGame(s, p, mode);
                s->session.dailyKey = key;
                s->session.dailyTier = tier;
                s->session.leaderboardAttempt = false;
            }
            break;
        case Action::Dismiss:
            playSound(s, SoundCue::Ui);
            leaveCurrentGame(s);
            break;
    }
}

int tileAt(AppState *s, float x, float y) {
    if (!s->hasSession || s->screen != Screen::Game || s->completion || s->dailyExitConfirm ||
        hintCompletionPending(s)) return -1;
    Rect board = currentBoardRect(s);
    if (!board.contains(x, y)) return -1;
    Puzzle &p = s->session.puzzle;
    float cell = board.w / p.width;
    int col = static_cast<int>((x - board.x) / cell);
    int row = static_cast<int>((y - board.y) / cell);
    if (col < 0 || row < 0 || col >= p.width || row >= p.height) return -1;
    int idx = indexFor(col, row, p.width);
    return p.disabled.count(idx) ? -1 : idx;
}

void tapTile(AppState *s, int idx) {
    if (!s->hasSession || s->session.completed || s->dailyExitConfirm || hintCompletionPending(s)) return;
    if (!isTappable(s->session.puzzle, idx)) {
        playSound(s, SoundCue::Invalid);
        vibrate(s, 16);
        return;
    }
    std::vector<int> affected = affectedIndexes(s->session.puzzle, idx);
    s->session.history.push_back({s->session.board, s->session.remaining});
    applyPulse(s->session.puzzle, s->session.board, idx);
    int next = mod(s->session.remaining[idx] - 1, s->session.puzzle.states);
    if (next) s->session.remaining[idx] = next; else s->session.remaining.erase(idx);
    s->session.moves++;
    s->hintLine.clear();
    s->previewTile = -1;
    s->previewClearAt = 0;
    s->hintChanged.clear();
    s->pulseTiles = affected;
    s->pulseUntil = nowMs() + 280;
    int stateAfterTap = s->session.board[idx];
    playSound(s, SoundCue::Pulse, (static_cast<int>(affected.size()) << 8) | stateAfterTap);
    vibrate(s, 6);
    if (s->session.mode != "playground" && solved(s->session.puzzle, s->session.board)) completeGame(s);
}

void back(AppState *s) {
    if (s->patternInfoOpen) {
        s->patternInfoOpen = false;
        s->patternInfoOpenedAt = 0;
        return;
    }
    if (s->dailyExitConfirm) {
        s->dailyExitConfirm = false;
        return;
    }
    if (s->screen == Screen::Game) {
        requestExitGame(s);
    } else if (s->screen == Screen::Settings) {
        closeSettings(s);
    } else if (s->screen == Screen::About) {
        go(s, Screen::Settings);
    } else if (s->screen != Screen::Main) {
        go(s, Screen::Main);
    }
}

bool callPlatformBridge(AppState *s, const char *methodName, const char *signature, bool enabled = false) {
    JavaVM *vm = s->native->activity->vm;
    JNIEnv *env = nullptr;
    bool detach = vm->GetEnv(reinterpret_cast<void **>(&env), JNI_VERSION_1_6) != JNI_OK;
    if (detach && vm->AttachCurrentThread(&env, nullptr) != JNI_OK) return false;
    bool success = false;

    jobject activity = s->native->activity->clazz;
    jclass activityClass = env->GetObjectClass(activity);
    jmethodID getClassLoader = env->GetMethodID(activityClass, "getClassLoader", "()Ljava/lang/ClassLoader;");
    jobject loader = getClassLoader ? env->CallObjectMethod(activity, getClassLoader) : nullptr;
    jclass loaderClass = env->FindClass("java/lang/ClassLoader");
    jmethodID loadClass = loaderClass ? env->GetMethodID(loaderClass, "loadClass", "(Ljava/lang/String;)Ljava/lang/Class;") : nullptr;
    jstring name = env->NewStringUTF("invert_the_matrix.myapp.PlatformBridge");
    jclass bridge = loader && loadClass ? static_cast<jclass>(env->CallObjectMethod(loader, loadClass, name)) : nullptr;
    if (bridge && !env->ExceptionCheck()) {
        jmethodID method = env->GetStaticMethodID(bridge, methodName, signature);
        if (method) {
            if (std::strcmp(signature, "(Landroid/app/Activity;Z)V") == 0) {
                env->CallStaticVoidMethod(bridge, method, activity, static_cast<jboolean>(enabled));
            } else {
                env->CallStaticVoidMethod(bridge, method, activity);
            }
            success = !env->ExceptionCheck();
        }
    }
    if (env->ExceptionCheck()) {
        LOGE("Unable to call platform bridge method %s", methodName);
        env->ExceptionClear();
    }
    if (bridge) env->DeleteLocalRef(bridge);
    if (name) env->DeleteLocalRef(name);
    if (loaderClass) env->DeleteLocalRef(loaderClass);
    if (loader) env->DeleteLocalRef(loader);
    env->DeleteLocalRef(activityClass);
    if (detach) vm->DetachCurrentThread();
    return success;
}

void syncPlatformBackRegistration(AppState *s) {
    bool enabled = s->screen != Screen::Main || s->patternInfoOpen || s->dailyExitConfirm;
    if (s->platformBackEnabled == static_cast<int>(enabled)) return;
    if (callPlatformBridge(s, "setInternalBackEnabled", "(Landroid/app/Activity;Z)V", enabled)) {
        s->platformBackEnabled = enabled;
    }
}

int64_t motionEventTimeMs(const AInputEvent *event) {
    return AMotionEvent_getEventTime(event) / 1000000LL;
}

int64_t historicalMotionEventTimeMs(const AInputEvent *event, size_t historyIndex) {
    return AMotionEvent_getHistoricalEventTime(event, historyIndex) / 1000000LL;
}

void clearPressStateForScroll(AppState *s) {
    s->pressTile = -1;
    s->longPreviewShown = false;
    clearPressedButton(s);
    if (s->previewClearAt == 0) {
        s->previewTile = -1;
        if (s->hintLine == "Previewing this tap.") s->hintLine.clear();
    }
}

bool refreshDensity(AppState *s) {
    if (!s || !s->native || !s->native->config) return false;
    int density = AConfiguration_getDensity(s->native->config);
    if (density <= 0) return false;
    float nextDensity = density / 160.0f;
    if (std::fabs(nextDensity - s->density) <= 0.001f) return false;
    s->density = nextDensity;
    return true;
}

void handleWindowMetricsChanged(AppState *s, bool forceViewport = false) {
    if (!s) return;
    bool sizeChanged = s->renderer.updateSurfaceSize(forceViewport);
    bool densityChanged = refreshDensity(s);
    if (!sizeChanged && !densityChanged) return;
    s->scroll = clampScrollOffset(s, s->scroll);
    s->dragging = false;
    stopScrollMomentum(s);
    clearPressStateForScroll(s);
}

void beginScrollDrag(AppState *s, float y, int64_t eventTimeMs) {
    float dy = y - s->downY;
    float slop = dp(s, 5.0f);
    s->dragging = true;
    clearPressStateForScroll(s);
    s->scrollVelocity = 0.0f;
    s->lastTouchY = s->downY + (dy > 0.0f ? slop : -slop);
    s->lastTouchTime = eventTimeMs;
    s->lastScrollFrameTime = 0;
}

void updateScrollDragSample(AppState *s, float y, int64_t eventTimeMs) {
    if (!scrollable(s->screen) || maxScrollOffset(s) <= 0.0f) return;
    if (!s->dragging) {
        if (std::fabs(y - s->downY) <= dp(s, 5.0f)) return;
        beginScrollDrag(s, y, eventTimeMs);
    }

    float oldScroll = s->scroll;
    float nextScroll = clampScrollOffset(s, oldScroll - (y - s->lastTouchY));
    s->scroll = nextScroll;

    int64_t dtMs = eventTimeMs - s->lastTouchTime;
    if (dtMs > 0) {
        float sampleVelocity = (nextScroll - oldScroll) / (static_cast<float>(dtMs) / 1000.0f);
        if (std::fabs(sampleVelocity) < dp(s, 1.5f)) {
            if (nextScroll == oldScroll) s->scrollVelocity *= 0.82f;
        } else if (std::fabs(s->scrollVelocity) < dp(s, 1.0f)) {
            s->scrollVelocity = sampleVelocity;
        } else {
            float blend = s->scrollVelocity * sampleVelocity < 0.0f ? 0.66f : 0.52f;
            s->scrollVelocity = s->scrollVelocity * (1.0f - blend) + sampleVelocity * blend;
        }
        float velocityCap = dp(s, 9600.0f);
        s->scrollVelocity = std::max(-velocityCap, std::min(velocityCap, s->scrollVelocity));
    }

    s->lastTouchY = y;
    s->lastTouchTime = eventTimeMs;
}

void finishScrollDrag(AppState *s) {
    s->dragging = false;
    clearPressStateForScroll(s);
    if (std::fabs(s->scrollVelocity) < dp(s, 32.0f) ||
        s->scroll <= 0.0f || s->scroll >= maxScrollOffset(s)) {
        stopScrollMomentum(s);
        return;
    }
    float velocityCap = dp(s, 9600.0f);
    s->scrollVelocity = std::max(-velocityCap, std::min(velocityCap, s->scrollVelocity * 1.06f));
    s->lastScrollFrameTime = nowMs();
}

int32_t handleInput(android_app *app, AInputEvent *event) {
    AppState *s = static_cast<AppState *>(app->userData);
    if (AInputEvent_getType(event) == AINPUT_EVENT_TYPE_KEY) {
        int key = AKeyEvent_getKeyCode(event);
        int action = AKeyEvent_getAction(event);
        // Android 12 and older still deliver key events. At the root, let the
        // system handle back-to-home, just as the Android 13+ dispatcher does.
        if (app->activity->sdkVersion < 33 && key == AKEYCODE_BACK &&
            (s->screen != Screen::Main || s->patternInfoOpen || s->dailyExitConfirm)) {
            if (action == AKEY_EVENT_ACTION_UP) back(s);
            return 1;
        }
        return 0;
    }
    if (AInputEvent_getType(event) != AINPUT_EVENT_TYPE_MOTION) return 0;
    int action = AMotionEvent_getAction(event) & AMOTION_EVENT_ACTION_MASK;
    float x = AMotionEvent_getX(event, 0) - s->renderer.safeInsets.left;
    float y = AMotionEvent_getY(event, 0);
    int64_t eventTimeMs = motionEventTimeMs(event);
    if (action == AMOTION_EVENT_ACTION_DOWN) {
        s->downX = x;
        s->downY = y;
        s->startScroll = s->scroll;
        s->lastTouchY = y;
        s->lastTouchTime = eventTimeMs;
        s->downTime = nowMs();
        s->dragging = false;
        stopScrollMomentum(s);
        clearPressedButton(s);
        Button pressed{};
        if (findButtonAt(s, x, y, &pressed)) {
            rememberPressedButton(s, pressed);
            if (pressed.action != Action::PatternInfoBlocker) vibrate(s, 8);
            s->pressTile = -1;
        } else if (s->patternInfoOpen) {
            s->pressTile = -1;
        } else {
            s->pressTile = tileAt(s, x, y);
        }
        s->longPreviewShown = false;
        if (s->pressTile >= 0 && s->hintLine == "Previewing this tap.") s->hintLine.clear();
        return 1;
    }
    if (action == AMOTION_EVENT_ACTION_MOVE) {
        size_t historySize = AMotionEvent_getHistorySize(event);
        for (size_t i = 0; i < historySize; ++i) {
            updateScrollDragSample(s, AMotionEvent_getHistoricalY(event, 0, i),
                                   historicalMotionEventTimeMs(event, i));
        }
        updateScrollDragSample(s, y, eventTimeMs);
        if (s->hasPressedButton &&
            (!s->pressedButtonRect.contains(x, y) || std::hypot(x - s->downX, y - s->downY) > dp(s, 18))) {
            clearPressedButton(s);
        }
        if (s->pressTile >= 0 && std::hypot(x - s->downX, y - s->downY) > dp(s, 18)) {
            clearPressStateForScroll(s);
        }
        return 1;
    }
    if (action == AMOTION_EVENT_ACTION_UP) {
        if (s->dragging) {
            updateScrollDragSample(s, y, eventTimeMs);
            finishScrollDrag(s);
            return 1;
        }
        if (!s->dragging && std::hypot(x - s->downX, y - s->downY) < dp(s, 12)) {
            Button tapped{};
            if (findButtonAt(s, x, y, &tapped)) {
                rememberPressedButton(s, tapped, nowMs() + 140);
                s->pressTile = -1;
                s->longPreviewShown = false;
                handleAction(s, tapped);
                return 1;
            }
            if (s->patternInfoOpen) {
                s->pressTile = -1;
                s->longPreviewShown = false;
                clearPressedButton(s);
                return 1;
            }
            if (s->longPreviewShown) {
                s->previewClearAt = nowMs() + 220;
                s->pressTile = -1;
                s->longPreviewShown = false;
                clearPressedButton(s);
                return 1;
            }
            int idx = tileAt(s, x, y);
            if (idx >= 0) tapTile(s, idx);
        }
        s->pressTile = -1;
        s->longPreviewShown = false;
        clearPressedButton(s);
        return 1;
    }
    if (action == AMOTION_EVENT_ACTION_CANCEL) {
        s->dragging = false;
        clearPressStateForScroll(s);
        stopScrollMomentum(s);
        return 1;
    }
    return 0;
}

void handleCmd(android_app *app, int32_t cmd) {
    AppState *s = static_cast<AppState *>(app->userData);
    switch (cmd) {
        case APP_CMD_INIT_WINDOW:
            if (app->window != nullptr) {
                if (!s->renderer.ready()) s->renderer.init(app);
                handleWindowMetricsChanged(s, true);
            }
            break;
        case APP_CMD_WINDOW_RESIZED:
        case APP_CMD_WINDOW_REDRAW_NEEDED:
        case APP_CMD_CONTENT_RECT_CHANGED:
        case APP_CMD_CONFIG_CHANGED:
            handleWindowMetricsChanged(s, true);
            break;
        case APP_CMD_TERM_WINDOW:
            s->renderer.shutdown();
            break;
        case APP_CMD_RESUME:
            s->resumed = true;
            handleWindowMetricsChanged(s, true);
            break;
        case APP_CMD_PAUSE:
        case APP_CMD_STOP:
            s->resumed = false;
            s->dragging = false;
            stopScrollMomentum(s);
            clearPressStateForScroll(s);
            break;
        case APP_CMD_LOST_FOCUS:
            s->dragging = false;
            stopScrollMomentum(s);
            clearPressStateForScroll(s);
            break;
        case APP_CMD_GAINED_FOCUS:
            break;
        default:
            break;
    }
}

} // namespace

extern "C" JNIEXPORT void JNICALL
Java_invert_1the_1matrix_myapp_PlatformBridge_nativeRequestBack(JNIEnv *, jclass) {
    platformEvents.requestBack();
}

extern "C" JNIEXPORT void JNICALL
Java_invert_1the_1matrix_myapp_PlatformBridge_nativeUpdateInsets(
        JNIEnv *, jclass, jint left, jint top, jint right, jint bottom) {
    platformEvents.updateInsets({left, top, right, bottom});
}

extern "C" void android_main(android_app *app) {
    ALooper_acquire(app->looper);
    platformEvents.setWake([looper = app->looper]() { ALooper_wake(looper); });
    AppState state;
    state.native = app;
    state.renderer.app = app;
    state.density = 1.0f;
    if (app->config) {
        int density = AConfiguration_getDensity(app->config);
        if (density > 0) state.density = density / 160.0f;
    }
    state.progress.load(app->activity->internalDataPath);
    migrateCampaignProgress(state.progress);
    loadCampaignLevels(&state);
    loadPrefs(&state);
    app->userData = &state;
    app->onAppCmd = handleCmd;
    app->onInputEvent = handleInput;
    playGamesSignIn(&state);
    syncEarnedCampaignAchievements(&state);

    while (true) {
        int events = 0;
        android_poll_source *source = nullptr;
        int timeout = platform::shouldRender(state.resumed, state.renderer.ready()) ? 0 : -1;
        while (ALooper_pollOnce(timeout, nullptr, &events, reinterpret_cast<void **>(&source)) >= 0) {
            if (source) source->process(app, source);
            if (app->destroyRequested) {
                platformEvents.setWake({});
                platformEvents.take();
                ALooper_release(app->looper);
                state.renderer.shutdown();
                state.audio.shutdown();
                return;
            }
            timeout = 0;
        }
        platform::Events pending = platformEvents.take();
        if (pending.insetsChanged) {
            state.renderer.setSafeInsets(pending.insets);
            state.scroll = clampScrollOffset(&state, state.scroll);
            state.dragging = false;
            stopScrollMomentum(&state);
            clearPressStateForScroll(&state);
        }
        if (state.resumed) {
            for (unsigned i = 0; i < pending.backRequests; ++i) {
                if (state.screen == Screen::Main && !state.patternInfoOpen && !state.dailyExitConfirm) {
                    callPlatformBridge(&state, "onNativeBackAtRoot", "(Landroid/app/Activity;)V");
                } else {
                    back(&state);
                }
            }
        }
        syncPlatformBackRegistration(&state);
        render(&state);
    }
}
