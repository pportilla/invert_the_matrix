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
#include <unordered_map>
#include <utility>
#include <vector>

#define STB_TRUETYPE_IMPLEMENTATION
#include "third_party/stb_truetype.h"

#include "generated/math_assets.h"

#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, "InvertMatrixCpp", __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, "InvertMatrixCpp", __VA_ARGS__)

namespace {

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

const Color BG = rgba(11, 13, 19);
const Color PANEL = rgba(22, 26, 35, 0.94f);
const Color PANEL_2 = rgba(31, 39, 52, 0.96f);
const Color TEXT = rgba(255, 248, 239);
const Color MUTED = rgba(170, 179, 192);
const Color BLUE = rgba(69, 194, 244);
const Color ORANGE = rgba(255, 180, 90);
const Color PURPLE = rgba(181, 140, 255);
const Color GREEN = rgba(95, 225, 170);
const Color DANGER = rgba(255, 111, 130);

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
    bool fontReady = false;
    static constexpr int FONT_ATLAS = 2048;
    static constexpr float FONT_BAKE_SIZE = 128.0f;
    static constexpr int MATH_GLYPH_COUNT = 8;
    stbtt_bakedchar baked[96]{};
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
        eglQuerySurface(display, surface, EGL_WIDTH, &width);
        eglQuerySurface(display, surface, EGL_HEIGHT, &height);
        initGl();
        initSkia();
        glViewport(0, 0, width, height);
        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        return true;
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
        auto target = GrBackendRenderTargets::MakeGL(width, height, 0, 8, fbInfo);
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
        if (fontData.empty()) {
            LOGE("No system font found, falling back to pixel text");
            fontReady = false;
            return;
        }

        std::vector<unsigned char> bitmap(FONT_ATLAS * FONT_ATLAS);
        int result = stbtt_BakeFontBitmap(fontData.data(), 0, FONT_BAKE_SIZE,
                                          bitmap.data(), FONT_ATLAS, FONT_ATLAS,
                                          32, 96, baked);
        if (result <= 0) {
            LOGE("Font bake failed");
            fontReady = false;
            return;
        }

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
        std::vector<unsigned char> fontData;
        if (app && app->activity && app->activity->assetManager) {
            AAsset *asset = AAssetManager_open(app->activity->assetManager,
                                               "fonts/NotoSansMath-Regular.ttf",
                                               AASSET_MODE_BUFFER);
            if (asset) {
                off_t size = AAsset_getLength(asset);
                if (size > 0) {
                    fontData.resize(static_cast<size_t>(size));
                    int total = 0;
                    while (total < size) {
                        int read = AAsset_read(asset, fontData.data() + total, static_cast<size_t>(size - total));
                        if (read <= 0) break;
                        total += read;
                    }
                    if (total != size) fontData.clear();
                }
                AAsset_close(asset);
            }
        }
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
            LOGE("No math font found; falling back to drawn formula symbols");
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
    }

    void begin() {
        vertices.clear();
        ensureSkiaSurface();
        if (skiaReady()) {
            skCanvas->clear(skColor(BG));
        } else {
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
            for (unsigned char c : text) {
                if (c == '\n') break;
                if (c < 32 || c >= 128) c = '?';
                widthPx += baked[c - 32].xadvance * factor;
            }
            return widthPx;
        }
        return static_cast<float>(text.size()) * 6.0f * scale;
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
            for (unsigned char c : s) {
                if (c == '\n') {
                    baseX = 0.0f;
                    lineY += heightPx * 1.18f;
                    continue;
                }
                if (c < 32 || c >= 128) c = '?';
                stbtt_aligned_quad q{};
                stbtt_GetBakedQuad(baked, FONT_ATLAS, FONT_ATLAS, c - 32, &baseX, &baseY, &q, 1);
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
    if (key == "horizontal") return {"horizontal", "Horizontal", "H", {{-1, 0}, {0, 0}, {1, 0}}};
    if (key == "vertical") return {"vertical", "Vertical", "V", {{0, -1}, {0, 0}, {0, 1}}};
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

int indexFor(int x, int y, int w) { return y * w + x; }
int xFor(int i, int w) { return i % w; }
int yFor(int i, int w) { return i / w; }

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
    float score = activeIndexes(p).size() * 0.4f + p.states * 2.0f + p.locked.size() * 1.5f + specials.size() * 2.0f + minMoves * 1.2f;
    if (score < 18) return 0;
    if (score < 30) return 1;
    if (score < 45) return 2;
    return 3;
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
    int jitter = randomInt(0, std::max(2, static_cast<int>(std::floor(activeCount * 0.18f))), rng);
    return std::max(2, static_cast<int>(std::floor(activeCount * base)) + states - 1 + jitter);
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
    int known = std::max(1, sumCounts(p.solution));
    p.minimumMoves = known;
    p.targetMoves = known + std::max(2, static_cast<int>(std::ceil(activeIndexes(p).size() * 0.16f)));
    p.difficultyRating = rateDifficulty(p, known);
    p.levelId = id;
    p.name = name;
    p.campaignIndex = campaignIndex;
    p.chapter = chapter;
    if (solved(p, p.initial) || !solutionSolves(p, p.initial, p.solution)) {
        if (!taps.empty()) {
            applyPulse(p, p.initial, taps[0]);
            p.solution[taps[0]] = mod(p.solution[taps[0]] + p.states - 1, p.states);
            p.solution = normalized(p.solution, p.states);
            p.minimumMoves = std::max(1, sumCounts(p.solution));
        }
    }
    return p;
}

std::array<std::string, 30> chapterTitles = {
        "Spark Switches", "Bit Flip Boulevard", "Color Pop Lab", "Triple-Tap Tango", "Corner Carnival",
        "Five by Fun", "Diagonal Disco", "Tiny Tangles", "Line Dance", "Square Wave Rave",
        "Lockstep Launch", "Mind the Gaps", "Circuit Jam", "Color Cascade", "Knight Shift",
        "Zigzag Frames", "Six-Sided Shuffle", "Amber Afterburners", "Purple Pulse Party", "Four-State Frenzy",
        "Dense Detours", "Glyph Mix-Up", "Locked and Loaded", "Wide Awake", "Prime Time",
        "Lock Labyrinth", "Gap Galaxy", "Modular Mayhem", "Ninefold Knockout", "Final Flip"
};

Config campaignConfig(int chapter, int level) {
    Config c;
    int size = 5;
    if (chapter == 1) size = 3;
    else if (chapter == 2) size = 4;
    else if (chapter == 3) size = 3;
    else if (chapter == 4) size = 4;
    else if (chapter <= 6) size = 5;
    else if (chapter <= 8) size = level <= 5 ? 4 : 5;
    else if (chapter <= 10) size = 5;
    else if (chapter <= 18) size = 6;
    else if (chapter <= 25) size = 7;
    else if (chapter <= 28) size = 8;
    else size = 9;
    c.width = size;
    c.height = size;
    if (chapter >= 9 && level % 5 == 0 && c.width < 9) c.width++;
    if (chapter >= 13 && level % 7 == 0 && c.height < 9) c.height++;

    if (chapter <= 2) c.states = 2;
    else if (chapter <= 4) c.states = 3;
    else if (chapter == 5) c.states = 2;
    else if (chapter <= 15) c.states = 3;
    else if (chapter <= 20) c.states = level % 3 == 0 ? 4 : 3;
    else if (chapter <= 24) c.states = level % 2 == 0 ? 5 : 3;
    else if (chapter <= 26) c.states = level % 3 == 0 ? 4 : 5;
    else c.states = level % 4 == 0 ? 4 : 5;

    c.pattern = "cross";
    if (chapter >= 7 && chapter <= 8) c.pattern = level % 2 ? "diagonal" : "cross";
    if (chapter >= 9 && chapter <= 10) c.pattern = level % 2 ? "horizontal" : "vertical";
    if (chapter >= 11 && chapter <= 13) c.pattern = level % 3 == 0 ? "square" : "cross";
    if (chapter >= 14 && chapter <= 16) c.pattern = level % 4 == 0 ? "knight" : "diagonal";
    if (chapter >= 17) {
        std::vector<std::string> keys = {"cross", "diagonal", "square", "horizontal", "vertical", "knight"};
        c.pattern = level % 3 == 0 ? "randomMixed" : keys[level % keys.size()];
    }
    if (chapter >= 22) c.pattern = level % 2 ? "randomMixed" : c.pattern;
    c.difficulty = chapter <= 6 ? "Easy" : chapter <= 14 ? "Medium" : chapter <= 23 ? "Hard" : "Expert";
    c.locked = chapter >= 11 && level % 2 == 0;
    c.irregular = chapter >= 12 && level % 3 == 0;
    c.unique = false;
    float sizePressure = static_cast<float>(c.width * c.height - 9) * 0.035f;
    float statePressure = static_cast<float>(c.states - 2) * 0.65f;
    c.minimumKnownMoves = std::max(2, static_cast<int>(std::floor(1.4f + chapter * 0.22f + level * 0.16f + sizePressure + statePressure)));
    c.preferredKnownMoves = c.minimumKnownMoves + chapter / 6 + (level > 6 ? 1 : 0) + (c.states > 3 ? 1 : 0);
    return c;
}

Puzzle createCampaignLevel(int index) {
    int chapter = index / 10 + 1;
    int level = index % 10 + 1;
    Config c = campaignConfig(chapter, level);
    for (int attempt = 0; attempt < 48; ++attempt) {
        Rng rng("campaign-" + std::to_string(chapter) + "-" + std::to_string(level) + "-" + std::to_string(attempt));
        Puzzle shell = generatedShell(c, rng);
        int active = static_cast<int>(activeIndexes(shell).size());
        float ratio = 0.18f + chapter * 0.018f;
        int base = static_cast<int>(std::floor(active * std::min(0.78f, ratio)));
        int scramble = std::max(c.preferredKnownMoves, base + c.states - 1 + static_cast<int>(std::floor(level * 0.7f)) + randomInt(0, std::max(1, static_cast<int>(std::floor(active * 0.08f))), rng));
        Puzzle p = makePuzzleFromShell(shell, c, "c" + std::to_string(chapter) + "-" + std::to_string(level), chapterTitles[chapter - 1] + " " + std::to_string(level), index, chapter, rng, scramble);
        if (!solved(p, p.initial) && p.minimumMoves >= c.minimumKnownMoves) return p;
    }
    Rng rng("campaign-fallback-" + std::to_string(chapter) + "-" + std::to_string(level));
    Puzzle shell = generatedShell(c, rng);
    return makePuzzleFromShell(shell, c, "c" + std::to_string(chapter) + "-" + std::to_string(level), chapterTitles[chapter - 1] + " " + std::to_string(level), index, chapter, rng, c.preferredKnownMoves);
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
        c.states = 3;
        c.pattern = "cross";
        c.difficulty = "Medium";
        c.locked = true;
    } else {
        c.width = 6;
        c.height = 6;
        c.states = 4;
        c.pattern = "randomMixed";
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

    bool unlocked(int campaignIndex) {
        if (campaignIndex == 0) return true;
        if (completed("c" + std::to_string(campaignIndex / 10 + 1) + "-" + std::to_string(campaignIndex % 10 + 1))) return true;
        int prev = campaignIndex - 1;
        return completed("c" + std::to_string(prev / 10 + 1) + "-" + std::to_string(prev % 10 + 1));
    }
};

constexpr int CAMPAIGN_PROGRESS_VERSION = 2;

void migrateCampaignProgress(Progress &progress) {
    if (progress.getInt("campaign_version", 0) == CAMPAIGN_PROGRESS_VERSION) return;
    progress.clearCampaignProgress();
    progress.setInt("campaign_version", CAMPAIGN_PROGRESS_VERSION);
}

enum class Screen { Main, Campaign, Freeplay, Daily, HowTo, Math, Settings, Game };
enum class Action {
    Main, BackReturn, Campaign, Freeplay, Daily, HowTo, Math, Settings, StartCampaign, Generate,
    DailyChallenge, Leaderboard,
    Size, States, Pattern, Difficulty, ToggleLocked, ToggleIrregular, ToggleUnique,
    WidthMinus, WidthPlus, HeightMinus, HeightPlus, ExitGame, Undo, Reset, Hint,
    ConfirmDailyExit, CancelDailyExit, GuideSize, ToggleSetting, Next, Replay, Dismiss
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
    Renderer renderer;
    SoundEngine audio;
    Progress progress;
    Screen screen = Screen::Main;
    Screen returnScreen = Screen::Main;
    std::vector<Button> buttons;
    std::map<std::string, MathImageAsset> mathImages;
    Session session;
    bool hasSession = false;
    bool completion = false;
    int completionStars = 0;
    int completionMark = 0;
    bool dailyExitConfirm = false;
    int lastCampaign = 0;
    float density = 1.0f;
    float scroll = 0.0f;
    float contentHeight = 0.0f;
    float downX = 0.0f;
    float downY = 0.0f;
    float startScroll = 0.0f;
    bool dragging = false;
    int64_t downTime = 0;

    std::string freeSize = "5x5";
    int customW = 5;
    int customH = 5;
    int freeStates = 3;
    std::string freePattern = "cross";
    std::string freeDifficulty = "Medium";
    bool freeLocked = false;
    bool freeIrregular = false;
    bool freeUnique = true;
    bool sound = true;
    bool vibration = true;
    bool animations = true;
    bool hideNumbers = true;
    bool colorblind = false;
    int guideTextSize = 0;
    std::string hintLine;
    int pressTile = -1;
    bool longPreviewShown = false;
    int previewTile = -1;
    int64_t previewClearAt = 0;
    std::vector<int> hintChanged;
    int64_t hintChangedUntil = 0;
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

float dp(AppState *s, float v) { return v * s->density; }
float safeTop(AppState *s) { return dp(s, 70); }
float safeBottom(AppState *s) { return dp(s, 30); }

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

Color stateColor(int state);
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
    s->progress.setInt("free_unique", s->freeUnique ? 1 : 0);
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
    s->freeUnique = s->progress.getBool("free_unique", true);
    s->sound = s->progress.getBool("setting_sound", true);
    s->vibration = s->progress.getBool("setting_vibration", true);
    s->animations = s->progress.getBool("setting_animations", true);
    s->hideNumbers = s->progress.getBool("setting_hide_numbers", true);
    s->colorblind = s->progress.getBool("setting_colorblind", false);
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

void playGamesShowLeaderboard(AppState *s, int leaderboard) {
    callPlayGamesVoid(s, "showLeaderboard", "(Landroid/app/Activity;I)V", leaderboard);
}

void go(AppState *s, Screen screen) {
    s->screen = screen;
    s->scroll = 0.0f;
    s->completion = false;
    s->dailyExitConfirm = false;
}

void startGame(AppState *s, const Puzzle &p, const std::string &mode) {
    s->session = Session{};
    s->session.puzzle = p;
    s->session.mode = mode;
    s->session.reset();
    s->hasSession = true;
    s->completionStars = 0;
    s->completionMark = 0;
    s->hintLine.clear();
    s->pressTile = -1;
    s->longPreviewShown = false;
    s->previewTile = -1;
    s->previewClearAt = 0;
    s->hintChanged.clear();
    s->hintChangedUntil = 0;
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
    if (session.usedHint) return 0;
    int extraMoves = std::max(0, session.moves - session.puzzle.minimumMoves);
    int movePenalty = extraMoves * 800 + session.moves * 25;
    int timePenalty = session.elapsed * 3;
    return clampInt(10000 - movePenalty - timePenalty, 0, 10000);
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

void leaveCurrentGame(AppState *s) {
    if (s->hasSession && s->session.mode == "campaign") {
        go(s, Screen::Campaign);
    } else if (s->hasSession && s->session.mode == "daily") {
        go(s, Screen::Daily);
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
        if (on) r.softAura(cx, cy, size * 0.62f, rgba(255, 180, 90, 0.18f * alpha), 4);
        r.star(cx, cy, size * 0.48f, size * 0.22f,
               on ? rgba(255, 180, 90, 0.96f * alpha) : rgba(255, 180, 90, 0.080f * alpha),
               on ? rgba(255, 225, 176, 0.42f * alpha) : rgba(255, 180, 90, 0.34f * alpha),
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
    r.softAura(cx, cy, size * 0.95f, withAlpha(color, 0.16f), 4);
    r.line(cx - size * 0.58f, cy, cx - size * 0.24f, cy - size * 0.26f, stroke, color);
    r.line(cx - size * 0.24f, cy - size * 0.26f, cx + size * 0.24f, cy - size * 0.26f, stroke, color);
    r.line(cx + size * 0.24f, cy - size * 0.26f, cx + size * 0.58f, cy, stroke, color);
    r.line(cx - size * 0.58f, cy, cx - size * 0.24f, cy + size * 0.26f, stroke, color);
    r.line(cx - size * 0.24f, cy + size * 0.26f, cx + size * 0.24f, cy + size * 0.26f, stroke, color);
    r.line(cx + size * 0.24f, cy + size * 0.26f, cx + size * 0.58f, cy, stroke, color);
    r.circle(cx, cy, size * 0.17f, color, 16);
}

void addButton(AppState *s, Rect r, Action action, int value, bool enabled = true) {
    s->buttons.push_back({r, action, value, enabled});
}

void drawPanel(Renderer &r, Rect rect, Color fill = PANEL) {
    float radius = std::min(rect.h * 0.18f, 18.0f);
    r.glow(rect, radius * 0.9f, rgba(69, 194, 244, 0.08f), 6);
    r.roundedRect(rect.x, rect.y, rect.w, rect.h, radius, rgba(229, 236, 245, 0.16f));
    r.roundedRect(rect.x + 1.0f, rect.y + 1.0f, rect.w - 2.0f, rect.h - 2.0f, std::max(0.0f, radius - 1.0f), fill);
    r.rect(rect.x + 2.0f, rect.y + 2.0f, rect.w - 4.0f, std::max(1.0f, rect.h * 0.018f), rgba(255, 255, 255, 0.12f));
}

void drawGlassPanel(AppState *s, Rect rect, Color fill = PANEL, Color accent = rgba(69, 194, 244, 0.0f)) {
    Renderer &r = s->renderer;
    float radius = std::min(dp(s, 8), rect.h * 0.22f);
    r.roundedRect(rect.x + 0.8f, rect.y + dp(s, 1.0f), rect.w, rect.h, radius, rgba(0, 0, 0, 0.12f));
    r.roundedRect(rect.x, rect.y, rect.w, rect.h, radius, rgba(229, 236, 245, 0.17f));
    r.roundedRect(rect.x + 1.0f, rect.y + 1.0f, rect.w - 2.0f, rect.h - 2.0f,
                  std::max(1.0f, radius - 1.0f), fill);
    r.roundedRectGradient(rect.x + 1.0f, rect.y + 1.0f, rect.w - 2.0f, rect.h - 2.0f,
                          std::max(1.0f, radius - 1.0f),
                          rgba(255, 255, 255, 0.045f),
                          rgba(255, 255, 255, 0.006f));
    r.rect(rect.x + radius * 0.72f, rect.y + 1.5f,
           std::max(1.0f, rect.w - radius * 1.44f), 1.0f, rgba(255, 255, 255, 0.085f));
    if (accent.a > 0.0f) {
        r.rectGradient(rect.x + 1.0f, rect.y + 1.0f, rect.w - 2.0f, rect.h * 0.50f,
                       accent, rgba(accent.r, accent.g, accent.b, 0.0f));
    }
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

std::vector<std::string> wrapTextLines(AppState *s, const std::vector<std::string> &text, float scale, float maxWidth) {
    std::vector<std::string> lines;
    for (const std::string &line : text) {
        std::vector<std::string> wrapped = wrapTextLines(s, line, scale, maxWidth);
        lines.insert(lines.end(), wrapped.begin(), wrapped.end());
    }
    return lines;
}

void drawButton(AppState *s, Rect rect, const std::string &label, Action action, int value = 0, bool primary = false, bool selected = false, bool enabled = true, float textScaleBoost = 1.0f) {
    Renderer &r = s->renderer;
    float radius = std::min(dp(s, 8), rect.h * 0.5f);
    Color border = selected ? GREEN : rgba(229, 236, 245, enabled ? 0.24f : 0.08f);
    Color fill = primary ? rgba(28, 92, 74, enabled ? 0.98f : 0.45f) : rgba(24, 31, 43, enabled ? 0.96f : 0.42f);
    if (selected) fill = rgba(35, 74, 96, 0.98f);
    if (primary || selected) r.glow(rect, radius * 1.1f, primary ? rgba(95, 225, 170, 0.18f) : rgba(69, 194, 244, 0.16f), 8);
    r.roundedRect(rect.x, rect.y, rect.w, rect.h, radius, border);
    r.roundedRect(rect.x + 1.5f, rect.y + 1.5f, rect.w - 3.0f, rect.h - 3.0f, std::max(0.0f, radius - 1.5f), fill);
    r.rect(rect.x + radius * 0.65f, rect.y + 2.0f, std::max(1.0f, rect.w - radius * 1.3f), 1.5f, rgba(255, 255, 255, enabled ? 0.13f : 0.04f));
    float scale = std::max(2.0f, rect.h / 18.0f) * textScaleBoost;
    while (r.textWidth(label, scale) > rect.w - dp(s, 14) && scale > 1.35f) {
        scale *= 0.92f;
    }
    r.textHeavy(label, rect.x + rect.w * 0.5f, rect.y + rect.h * 0.5f - 4.0f * scale, scale, enabled ? TEXT : withAlpha(MUTED, 0.45f), 1, 0.9f);
    addButton(s, rect, action, value, enabled);
}

void drawIconShell(AppState *s, Rect rect, Action action, int value = 0, bool enabled = true) {
    Renderer &r = s->renderer;
    float radius = std::min(rect.h * 0.22f, 14.0f);
    r.roundedRect(rect.x, rect.y, rect.w, rect.h, radius, rgba(229, 236, 245, enabled ? 0.18f : 0.07f));
    r.roundedRect(rect.x + 1.2f, rect.y + 1.2f, rect.w - 2.4f, rect.h - 2.4f, std::max(0.0f, radius - 1.2f), rgba(21, 27, 38, enabled ? 0.86f : 0.42f));
    r.rect(rect.x + radius * 0.55f, rect.y + 2.0f, std::max(1.0f, rect.w - radius * 1.1f), 1.25f, rgba(255, 255, 255, enabled ? 0.11f : 0.04f));
    addButton(s, rect, action, value, enabled);
}

void drawToolIconShell(AppState *s, Rect rect, Action action, bool enabled = true,
                       Color accent = rgba(69, 194, 244, 0.0f)) {
    Renderer &r = s->renderer;
    float radius = std::min(dp(s, 8), rect.h * 0.24f);
    bool hasAccent = accent.a > 0.0f;
    Color border = hasAccent ? withAlpha(accent, enabled ? 0.42f : 0.14f) : rgba(229, 236, 245, enabled ? 0.22f : 0.07f);
    Color fill = hasAccent ? rgba(42, 21, 30, enabled ? 0.90f : 0.36f) : rgba(24, 31, 43, enabled ? 0.94f : 0.38f);
    if (hasAccent && enabled) r.glow(rect, radius * 1.0f, withAlpha(accent, 0.10f), 6);
    r.roundedRect(rect.x, rect.y, rect.w, rect.h, radius, border);
    r.roundedRect(rect.x + 1.2f, rect.y + 1.2f, rect.w - 2.4f, rect.h - 2.4f,
                  std::max(0.0f, radius - 1.2f), fill);
    r.rect(rect.x + radius * 0.65f, rect.y + 2.0f,
           std::max(1.0f, rect.w - radius * 1.3f), 1.2f,
           rgba(255, 255, 255, enabled ? 0.12f : 0.04f));
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

void drawHintToolButton(AppState *s, Rect rect) {
    drawToolIconShell(s, rect, Action::Hint, true, DANGER);
    drawHintEye(s, rect.x + rect.w * 0.5f, rect.y + rect.h * 0.5f, std::min(rect.w, rect.h) * 0.36f, DANGER);
}

void drawPixelLabel(AppState *s, const std::string &label, float cx, float cy, float unit, Color color) {
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

void drawResetToolButton(AppState *s, Rect rect) {
    drawToolIconShell(s, rect, Action::Reset, true);
    drawPixelLabel(s, "Reset", rect.x + rect.w * 0.5f, rect.y + rect.h * 0.5f, dp(s, 2.45f), TEXT);
}

void drawBackIcon(AppState *s, Rect rect, Action action) {
    drawIconShell(s, rect, action);
    drawMaterialChevronLeftIcon(s, rect, TEXT);
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
    r.circle(cx, cy, outer * 0.78f, rgba(255, 248, 239, 0.95f), 28);
    r.circle(cx, cy, outer * 0.36f, rgba(21, 27, 38, 0.94f), 24);
}

void drawBackground(AppState *s) {
    Renderer &r = s->renderer;
    float w = static_cast<float>(r.width), h = static_cast<float>(r.height);
    r.rectGradient(0, 0, w, h, rgba(8, 10, 16), rgba(18, 15, 24));
    r.rectGradient(0, 0, w, h * 0.48f, rgba(69, 194, 244, 0.09f), rgba(69, 194, 244, 0.0f));
    r.rectGradient(0, h * 0.44f, w, h * 0.56f, rgba(255, 180, 90, 0.0f), rgba(255, 180, 90, 0.075f));
    float gap = dp(s, 42);
    float time = s->animations ? static_cast<float>(nowMs()) : 0.0f;
    float bandGap = dp(s, 240);
    float bandPhase = s->animations ? std::fmod(time * 0.008f, bandGap) : 0.0f;
    for (float x = -h - bandGap + bandPhase; x < w + bandGap; x += bandGap) {
        r.line(x, h, x + h, 0, dp(s, 7.0f), rgba(69, 194, 244, 0.042f));
        r.line(x + dp(s, 18), h, x + h + dp(s, 18), 0, dp(s, 2.4f), rgba(95, 225, 170, 0.050f));
        r.line(x - dp(s, 8), h, x + h - dp(s, 8), 0, dp(s, 1.2f), rgba(255, 248, 239, 0.034f));
    }
    for (float x = -h - bandGap - bandPhase * 0.7f; x < w + bandGap; x += bandGap * 0.92f) {
        r.line(x, 0, x + h, h, dp(s, 3.4f), rgba(255, 248, 239, 0.030f));
        r.line(x + dp(s, 30), 0, x + h + dp(s, 30), h, dp(s, 2.0f), rgba(95, 225, 170, 0.036f));
    }
    for (float x = std::fmod(time * 0.006f, gap) - gap; x < w; x += gap) {
        r.rect(x, 0, 1, h, rgba(229, 236, 245, 0.052f));
    }
    for (float y = 0; y < h; y += gap) {
        r.rect(0, y, w, 1, rgba(229, 236, 245, 0.052f));
    }
    int row = 0;
    for (float y = gap * 0.5f; y < h; y += gap, ++row) {
        int col = 0;
        for (float x = gap * 0.5f; x < w; x += gap, ++col) {
            float hash = std::fmod(std::sin((col + 1) * 12.9898f + (row + 1) * 78.233f) * 43758.5453f, 1.0f);
            if (hash < 0.0f) hash += 1.0f;
            float twinkle = s->animations ? 0.65f + 0.35f * std::sin(time * 0.0016f + hash * 6.2831853f) : 0.82f;
            float alpha = (0.08f + hash * 0.08f) * twinkle;
            float radius = dp(s, 0.75f + hash * 0.65f);
            Color starColor = hash > 0.82f ? rgba(255, 248, 239, alpha * 0.78f) : rgba(95, 225, 170, alpha);
            if (hash > 0.86f) {
                r.softAura(x, y, radius * 4.0f, withAlpha(starColor, starColor.a * 0.52f), 4);
            }
            r.circle(x, y, radius, starColor, 12);
        }
    }
    float sweep = std::fmod(time * 0.025f, h + dp(s, 260)) - dp(s, 260);
    r.rect(0, sweep, w, dp(s, 2), rgba(95, 225, 170, 0.12f));
    r.rect(0, sweep + dp(s, 16), w, dp(s, 1), rgba(69, 194, 244, 0.11f));
}

void drawHeader(AppState *s, const std::string &kicker, const std::string &title, Action backAction = Action::Main) {
    Renderer &r = s->renderer;
    float top = safeTop(s) + dp(s, 8);
    drawBackIcon(s, {dp(s, 18), top, dp(s, 50), dp(s, 44)}, backAction);
    r.text(kicker, dp(s, 84), top + dp(s, 2), dp(s, 2.25f), GREEN);
    r.text(title, dp(s, 84), top + dp(s, 24), dp(s, 3.65f), TEXT);
}

float guideTextScale(AppState *s) {
    if (s->guideTextSize == 1) return 1.30f;
    if (s->guideTextSize == 2) return 1.64f;
    return 1.0f;
}

float guideContentTop(AppState *s) {
    return safeTop(s) + dp(s, 120);
}

void drawGuideSizeControl(AppState *s) {
    Renderer &r = s->renderer;
    float button = dp(s, 38);
    float gap = dp(s, 5);
    float pad = dp(s, 4);
    float w = button * 3.0f + gap * 2.0f + pad * 2.0f;
    Rect rail{r.width - dp(s, 18) - w, safeTop(s) + dp(s, 60), w, button + pad * 2.0f};
    drawGlassPanel(s, rail, rgba(10, 13, 19, 0.55f), rgba(95, 225, 170, 0.024f));

    std::array<float, 3> textScale{{dp(s, 1.62f), dp(s, 2.52f), dp(s, 3.42f)}};
    for (int i = 0; i < 3; ++i) {
        Rect b{rail.x + pad + static_cast<float>(i) * (button + gap), rail.y + pad, button, button};
        bool selected = s->guideTextSize == i;
        float radius = dp(s, 7);
        if (selected) r.glow(b, dp(s, 7), rgba(69, 194, 244, 0.12f), 5);
        r.roundedRect(b.x, b.y, b.w, b.h, radius, selected ? rgba(95, 225, 170, 0.42f) : rgba(229, 236, 245, 0.08f));
        r.roundedRect(b.x + 1.0f, b.y + 1.0f, b.w - 2.0f, b.h - 2.0f, radius - 1.0f,
                      selected ? rgba(35, 74, 96, 0.92f) : rgba(21, 27, 38, 0.70f));
        r.textHeavy("A", b.x + b.w * 0.5f, b.y + b.h * 0.5f - textScale[static_cast<size_t>(i)] * 3.8f,
                    textScale[static_cast<size_t>(i)], selected ? TEXT : MUTED, 1, 0.92f);
        addButton(s, b, Action::GuideSize, i, true);
    }
}

void drawGuideHeaderChrome(AppState *s) {
    Renderer &r = s->renderer;
    float solidBottom = guideContentTop(s) - dp(s, 8);
    float fadeH = dp(s, 20);
    r.rectGradient(0, 0, r.width, solidBottom,
                   rgba(11, 13, 19, 1.0f),
                   rgba(14, 19, 27, 1.0f));
    r.rectGradient(0, solidBottom, r.width, fadeH,
                   rgba(14, 19, 27, 1.0f),
                   rgba(14, 19, 27, 0.0f));
    r.rect(0, solidBottom, r.width, std::max(1.0f, dp(s, 0.8f)), rgba(229, 236, 245, 0.14f));
    addButton(s, {0.0f, 0.0f, static_cast<float>(r.width), solidBottom + fadeH}, Action::Main, 0, false);
}

void drawScreenHeaderChrome(AppState *s, float contentTop) {
    Renderer &r = s->renderer;
    float solidBottom = contentTop - dp(s, 8);
    float fadeH = dp(s, 20);
    r.rectGradient(0, 0, r.width, solidBottom,
                   rgba(11, 13, 19, 1.0f),
                   rgba(14, 19, 27, 1.0f));
    r.rectGradient(0, solidBottom, r.width, fadeH,
                   rgba(14, 19, 27, 1.0f),
                   rgba(14, 19, 27, 0.0f));
    r.rect(0, solidBottom, r.width, std::max(1.0f, dp(s, 0.8f)), rgba(229, 236, 245, 0.14f));
    addButton(s, {0.0f, 0.0f, static_cast<float>(r.width), solidBottom + fadeH}, Action::Main, 0, false);
}

void drawStickyScreenHeader(AppState *s, const std::string &kicker, const std::string &title,
                            Action backAction, float contentTop) {
    drawScreenHeaderChrome(s, contentTop);
    drawHeader(s, kicker, title, backAction);
}

void drawGuideHeader(AppState *s, const std::string &title) {
    drawGuideHeaderChrome(s);
    drawHeader(s, "Guide", title);
    drawGuideSizeControl(s);
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
    if (!s->animations) return;
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
            r.glow(tile, std::min(dp(s, 13), tile.w * 0.13f), withAlpha(stateColor(state), 0.22f), 6);
        } else {
            r.glow(tile, std::min(dp(s, 10), tile.w * 0.10f), rgba(255, 248, 239, 0.11f), 5);
        }
    }
    r.roundedRect(tile.x + dp(s, 0.8f), tile.y + dp(s, 1.5f), tile.w, tile.h, radius, rgba(0, 0, 0, state ? 0.17f : 0.12f));
    r.roundedRect(tile.x, tile.y, tile.w, tile.h, radius, stateBorderColor(state));
    r.roundedRectGradient(tile.x + 1.0f, tile.y + 1.0f, tile.w - 2.0f, tile.h - 2.0f,
                          std::max(1.0f, radius - 1.0f), stateTopColor(state), stateBottomColor(state));
    r.roundedStroke({tile.x + 1.2f, tile.y + 1.2f, tile.w - 2.4f, tile.h - 2.4f},
                    std::max(1.0f, radius - 1.2f), 1.0f,
                    rgba(255, 255, 255, state ? 0.045f : 0.22f));
    if (state) {
        r.softAura(tile.x + tile.w * 0.5f, tile.y + tile.h * 0.5f,
                   tile.w * 0.40f, rgba(255, 255, 255, 0.095f), 7);
    }
}

void drawLogo(AppState *s, float cx, float y, float size) {
    Renderer &r = s->renderer;
    updateSplashBoard(s);
    float left = cx - size * 0.5f;
    Rect logo{left, y, size, size};
    r.glow(logo, size * 0.16f, rgba(69, 194, 244, 0.12f), 6);
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
                                radius + 2.0f, std::max(1.0f, tile * 0.07f), rgba(255, 248, 239, 0.84f));
            }
        }
    }
}

float beginScrollContent(AppState *s, float top) {
    return top - s->scroll;
}

void finishScrollContent(AppState *s, float y) {
    s->contentHeight = y + s->scroll;
    float maxScroll = std::max(0.0f, s->contentHeight - s->renderer.height + safeBottom(s));
    s->scroll = std::max(0.0f, std::min(maxScroll, s->scroll));
}

void drawMain(AppState *s) {
    Renderer &r = s->renderer;
    float w = r.width;
    float logoSize = std::min(dp(s, 162), w - dp(s, 72));
    float brandPad = std::min(r.height * 0.042f, dp(s, 36));
    float buttonH = dp(s, 50);
    float buttonGap = dp(s, 10);
    float titleScale = dp(s, 8.35f);
    bool twoLineTitle = w < dp(s, 560) || r.textWidth("Invert the Matrix", titleScale) > w - dp(s, 70);
    float titleBlockH = twoLineTitle ? dp(s, 116) : dp(s, 58);
    float menuStackH = buttonH * 6.0f + buttonGap * 5.0f;
    float contentH = brandPad + logoSize + dp(s, 14) + dp(s, 18) + dp(s, 20) + titleBlockH + dp(s, 28) + menuStackH;
    float containerTop = (r.height - contentH - safeBottom(s) * 0.5f) * 0.5f + safeTop(s) * 0.35f;
    containerTop = std::max(safeTop(s) + dp(s, 2), containerTop);
    float top = containerTop + brandPad;

    drawLogo(s, w * 0.5f, top, logoSize);
    drawFittedText(s, "Modular Linear Algebra is Fun", w * 0.5f, top + logoSize + dp(s, 14),
                   w - dp(s, 56), dp(s, 2.20f), GREEN, 1, true, 1.45f);
    float titleY = top + logoSize + dp(s, 48);
    if (twoLineTitle) {
        r.textHeavy("Invert the", w * 0.5f, titleY, titleScale, TEXT, 1, 1.0f);
        r.textHeavy("Matrix", w * 0.5f, titleY + dp(s, 58), titleScale, TEXT, 1, 1.0f);
    } else {
        r.textHeavy("Invert the Matrix", w * 0.5f, titleY, titleScale, TEXT, 1, 1.0f);
    }

    float bw = std::min(w - dp(s, 36), dp(s, 420));
    float x = (w - bw) * 0.5f;
    float y = titleY + titleBlockH + dp(s, 28);
    auto drawMenuButton = [&](const std::string &label, Action action) {
        drawButton(s, {x, y, bw, buttonH}, label, action, 0, false, false, true, 1.32f);
        y += buttonH + buttonGap;
    };
    drawMenuButton("Campaign", Action::Campaign);
    drawMenuButton("Custom Level", Action::Freeplay);
    drawMenuButton("Daily Challenge", Action::Daily);
    drawMenuButton("How to Play", Action::HowTo);
    drawMenuButton("The Math", Action::Math);
    drawButton(s, {x, y, bw, buttonH}, "Settings", Action::Settings, 0, false, false, true, 1.32f);
}

void drawLevelNode(AppState *s, Rect rect, int index, int stars, bool completed, bool hintUsed, bool enabled) {
    Renderer &r = s->renderer;
    float radius = dp(s, 8);
    Color border = completed ? rgba(95, 225, 170, enabled ? 0.44f : 0.18f) : rgba(229, 236, 245, enabled ? 0.17f : 0.08f);
    Color fill = completed ? rgba(25, 39, 42, enabled ? 0.92f : 0.42f) : rgba(25, 31, 43, enabled ? 0.90f : 0.36f);
    if (enabled && completed) r.glow(rect, dp(s, 7), rgba(95, 225, 170, 0.10f), 5);
    r.roundedRect(rect.x, rect.y, rect.w, rect.h, radius, border);
    r.roundedRect(rect.x + 1.0f, rect.y + 1.0f, rect.w - 2.0f, rect.h - 2.0f, radius - 1.0f, fill);
    r.rect(rect.x + radius * 0.7f, rect.y + 2.0f, std::max(1.0f, rect.w - radius * 1.4f), 1.0f, rgba(255, 255, 255, enabled ? 0.11f : 0.035f));

    Color numberColor = enabled ? TEXT : rgba(210, 218, 230, 0.88f);
    r.textHeavy(std::to_string(index + 1), rect.x + rect.w * 0.5f, rect.y + rect.h * 0.24f, dp(s, 3.35f), numberColor, 1, 0.82f);
    drawStars(s, rect.x + rect.w * 0.5f, rect.y + rect.h * 0.62f, dp(s, 10.5f), enabled ? stars : 0, 3, 1, enabled ? 1.0f : 0.62f);

    if (completed) {
        float badge = dp(s, 15);
        float cx = rect.x + rect.w - badge * 0.70f;
        float cy = rect.y + badge * 0.72f;
        r.softAura(cx, cy, badge * 0.86f, rgba(95, 225, 170, 0.12f), 4);
        drawCheckMark(s, cx, cy, badge * 0.62f, rgba(95, 225, 170, enabled ? 0.96f : 0.42f));
        if (hintUsed) {
            drawHintEye(s, rect.x + dp(s, 13), rect.y + dp(s, 13), dp(s, 12), rgba(255, 111, 130, enabled ? 0.98f : 0.42f));
        }
    } else if (!enabled) {
        float cx = rect.x + rect.w - dp(s, 12);
        float cy = rect.y + dp(s, 12);
        float lock = dp(s, 10);
        r.line(cx - lock * 0.34f, cy, cx - lock * 0.34f, cy - lock * 0.28f, dp(s, 1.4f), rgba(255, 248, 239, 0.28f));
        r.line(cx + lock * 0.34f, cy, cx + lock * 0.34f, cy - lock * 0.28f, dp(s, 1.4f), rgba(255, 248, 239, 0.28f));
        r.line(cx - lock * 0.34f, cy - lock * 0.28f, cx, cy - lock * 0.52f, dp(s, 1.4f), rgba(255, 248, 239, 0.28f));
        r.line(cx, cy - lock * 0.52f, cx + lock * 0.34f, cy - lock * 0.28f, dp(s, 1.4f), rgba(255, 248, 239, 0.28f));
        r.roundedRect(cx - lock * 0.48f, cy - lock * 0.04f, lock * 0.96f, lock * 0.64f, lock * 0.14f, rgba(255, 248, 239, 0.26f));
    }

    if (enabled) addButton(s, rect, Action::StartCampaign, index, true);
}

void drawCampaign(AppState *s) {
    Renderer &r = s->renderer;
    float contentTop = safeTop(s) + dp(s, 88);
    float y = beginScrollContent(s, contentTop);
    float margin = dp(s, 18);
    float chapterGap = dp(s, 20);
    float panelPad = dp(s, 16);
    float gridGap = dp(s, 10);
    float cellH = dp(s, 74);
    float panelW = r.width - margin * 2.0f;
    float cell = (panelW - panelPad * 2.0f - gridGap * 3.0f) / 4.0f;
    float titleH = dp(s, 28);
    float panelH = panelPad + titleH + dp(s, 14) + cellH * 3.0f + gridGap * 2.0f + panelPad;
    for (int chapter = 1; chapter <= 30; ++chapter) {
        Rect panel{margin, y, panelW, panelH};
        bool visible = panel.y < r.height + dp(s, 48) && panel.y + panel.h > -dp(s, 48);
        if (visible) {
            r.glow(panel, dp(s, 10), rgba(0, 0, 0, 0.10f), 5);
            r.roundedRect(panel.x, panel.y, panel.w, panel.h, dp(s, 8), rgba(229, 236, 245, 0.16f));
            r.roundedRect(panel.x + 1.0f, panel.y + 1.0f, panel.w - 2.0f, panel.h - 2.0f, dp(s, 7), rgba(22, 26, 35, 0.90f));
            r.rectGradient(panel.x + 2.0f, panel.y + 2.0f, panel.w - 4.0f, panel.h * 0.24f, rgba(255, 255, 255, 0.04f), rgba(255, 255, 255, 0.0f));
            r.text("Chapter " + std::to_string(chapter) + ": " + chapterTitles[chapter - 1],
                   panel.x + panelPad, panel.y + panelPad * 0.85f, dp(s, 2.55f), TEXT);
            float gridY = panel.y + panelPad + titleH + dp(s, 14);
            for (int level = 0; level < 10; ++level) {
                int index = (chapter - 1) * 10 + level;
                int col = level % 4;
                int row = level / 4;
                Rect rect{panel.x + panelPad + col * (cell + gridGap), gridY + row * (cellH + gridGap), cell, cellH};
                std::string id = "c" + std::to_string(chapter) + "-" + std::to_string(level + 1);
                int stars = s->progress.stars(id);
                bool completed = s->progress.completed(id);
                bool hintUsed = s->progress.hintUsed(id);
                bool enabled = s->progress.unlocked(index);
                drawLevelNode(s, rect, index, stars, completed, hintUsed, enabled);
            }
        }
        y += panelH + chapterGap;
    }
    finishScrollContent(s, y);
    drawStickyScreenHeader(s, "Campaign", "Campaign Select", Action::Main, contentTop);
}

void drawDaily(AppState *s) {
    Renderer &r = s->renderer;
    std::string date = dailyKey();
    float contentTop = safeTop(s) + dp(s, 108);
    float y = beginScrollContent(s, contentTop);
    float margin = dp(s, 18);
    float gap = dp(s, 10);
    float cardW = r.width - margin * 2.0f;

    for (int tier = 0; tier < 3; ++tier) {
        std::string key = dailyChallengeKey(date, tier);
        int mark = s->progress.getInt("daily_mark_" + key, -1);
        int moves = s->progress.getInt("daily_moves_" + key, -1);
        bool firstTryRecorded = dailyLeaderboardRecorded(s, key);
        int firstTryMark = dailyLeaderboardMark(s, key);
        Config cfg = dailyConfig(tier, date);
        Rect card{margin, y, cardW, dp(s, 116)};
        Color accent = tier == 0 ? GREEN : tier == 1 ? BLUE : ORANGE;
        drawGlassPanel(s, card, mark >= 0 ? rgba(21, 33, 36, 0.88f) : rgba(22, 27, 38, 0.82f),
                       tier == 0 ? rgba(95, 225, 170, 0.026f) : tier == 1 ? rgba(69, 194, 244, 0.026f) : rgba(255, 180, 90, 0.028f));
        r.roundedRect(card.x + dp(s, 1.4f), card.y + dp(s, 6), dp(s, 4), card.h - dp(s, 12), dp(s, 2), withAlpha(accent, 0.86f));
        r.text(dailyTierLabel(tier), card.x + dp(s, 14), card.y + dp(s, 13), dp(s, 3.02f), TEXT);
        Rect status{card.x + card.w - dp(s, 92), card.y + dp(s, 12), dp(s, 76), dp(s, 32)};
        r.roundedRect(status.x, status.y, status.w, status.h, dp(s, 7), mark >= 0 ? rgba(95, 225, 170, 0.24f) : rgba(229, 236, 245, 0.11f));
        r.roundedRect(status.x + 1.0f, status.y + 1.0f, status.w - 2.0f, status.h - 2.0f, dp(s, 6),
                      mark >= 0 ? rgba(22, 54, 45, 0.88f) : rgba(10, 13, 19, 0.44f));
        std::string statusText = mark >= 0 ? "Done" : (firstTryRecorded ? "Open" : "New");
        r.text(statusText, status.x + status.w * 0.5f, status.y + dp(s, 8), dp(s, 1.72f), mark >= 0 ? GREEN : MUTED, 1);
        std::string configText = std::to_string(cfg.width) + "x" + std::to_string(cfg.height) +
                                 " / " + std::to_string(cfg.states) + " states / " + patternLabel(cfg.pattern);
        drawFittedText(s, configText, card.x + dp(s, 14), card.y + dp(s, 50), card.w - dp(s, 72), dp(s, 1.96f), TEXT);
        std::string detail = std::string("Locks: ") + (cfg.locked ? "on" : "off") +
                             " / Gaps: " + (cfg.irregular ? "on" : "off");
        drawFittedText(s, detail, card.x + dp(s, 14), card.y + dp(s, 75), card.w - dp(s, 72), dp(s, 1.82f), MUTED);
        std::string stats = mark >= 0
                            ? ("Best: " + std::to_string(moves) + " moves / Mark " + formatMark(mark))
                            : (firstTryRecorded ? ("First try: " + formatMark(firstTryMark) + " / Replays open") : "First try counts");
        drawFittedText(s, stats, card.x + dp(s, 14), card.y + dp(s, 99), card.w - dp(s, 72), dp(s, 1.82f), mark >= 0 ? GREEN : MUTED);
        float cx = card.x + card.w - dp(s, 24);
        float cy = card.y + card.h * 0.62f;
        r.line(cx - dp(s, 4), cy - dp(s, 7), cx + dp(s, 3), cy, dp(s, 1.9f), withAlpha(TEXT, 0.72f));
        r.line(cx + dp(s, 3), cy, cx - dp(s, 4), cy + dp(s, 7), dp(s, 1.9f), withAlpha(TEXT, 0.72f));
        addButton(s, card, Action::DailyChallenge, tier, true);
        y += card.h + gap;
    }

    y += dp(s, 6);
    Rect board{margin, y, cardW, dp(s, 156)};
    drawGlassPanel(s, board, rgba(22, 27, 38, 0.82f), rgba(69, 194, 244, 0.022f));
    r.text("Leaderboards", board.x + dp(s, 12), board.y + dp(s, 14), dp(s, 2.65f), TEXT);
    drawFittedText(s, "Compare today's marks by tier or as one combined daily score.",
                   board.x + dp(s, 12), board.y + dp(s, 47), board.w - dp(s, 24), dp(s, 1.55f), MUTED);
    float buttonW = (board.w - dp(s, 34)) * 0.5f;
    float by = board.y + dp(s, 75);
    drawButton(s, {board.x + dp(s, 12), by, buttonW, dp(s, 34)}, "Easy", Action::Leaderboard, 0);
    drawButton(s, {board.x + dp(s, 22) + buttonW, by, buttonW, dp(s, 34)}, "Medium", Action::Leaderboard, 1);
    by += dp(s, 42);
    drawButton(s, {board.x + dp(s, 12), by, buttonW, dp(s, 34)}, "Hard", Action::Leaderboard, 2);
    drawButton(s, {board.x + dp(s, 22) + buttonW, by, buttonW, dp(s, 34)}, "Global", Action::Leaderboard, 3);
    y += board.h + dp(s, 18);
    finishScrollContent(s, y);
    drawStickyScreenHeader(s, "Daily", "Daily Challenge", Action::Main, contentTop);
}

void drawChips(AppState *s, float &y, const std::vector<std::string> &labels, const std::string &selected, Action action, int columns = 3) {
    float margin = dp(s, 18), gap = dp(s, 8);
    float cell = (s->renderer.width - margin * 2 - gap * (columns - 1)) / columns;
    for (int i = 0; i < static_cast<int>(labels.size()); ++i) {
        int col = i % columns;
        int row = i / columns;
        Rect rect{margin + col * (cell + gap), y + row * (dp(s, 46) + gap), cell, dp(s, 46)};
        drawButton(s, rect, labels[i], action, i, false, labels[i] == selected);
    }
    y += (static_cast<int>((labels.size() + columns - 1) / columns)) * (dp(s, 46) + gap) + dp(s, 10);
}

void drawFreeplay(AppState *s) {
    Renderer &r = s->renderer;
    float contentTop = safeTop(s) + dp(s, 90);
    float y = beginScrollContent(s, contentTop);
    r.text("Grid Size", dp(s, 18), y, dp(s, 3.0f), TEXT); y += dp(s, 28);
    drawChips(s, y, {"3x3", "4x4", "5x5", "6x6", "7x7", "Custom"}, s->freeSize, Action::Size, 3);
    if (s->freeSize == "Custom") {
        drawButton(s, {dp(s, 18), y, dp(s, 70), dp(s, 44)}, "W-", Action::WidthMinus);
        r.text("Width " + std::to_string(s->customW), r.width * 0.5f, y + dp(s, 12), dp(s, 2.8f), TEXT, 1);
        drawButton(s, {r.width - dp(s, 88), y, dp(s, 70), dp(s, 44)}, "W+", Action::WidthPlus);
        y += dp(s, 54);
        drawButton(s, {dp(s, 18), y, dp(s, 70), dp(s, 44)}, "H-", Action::HeightMinus);
        r.text("Height " + std::to_string(s->customH), r.width * 0.5f, y + dp(s, 12), dp(s, 2.8f), TEXT, 1);
        drawButton(s, {r.width - dp(s, 88), y, dp(s, 70), dp(s, 44)}, "H+", Action::HeightPlus);
        y += dp(s, 62);
    }
    r.text("States", dp(s, 18), y, dp(s, 3.0f), TEXT); y += dp(s, 28);
    drawChips(s, y, {"2", "3", "4", "5"}, std::to_string(s->freeStates), Action::States, 4);
    r.text("Pulse Pattern", dp(s, 18), y, dp(s, 3.0f), TEXT); y += dp(s, 28);
    drawChips(s, y, {"Cross", "Diagonal", "Square", "Horizontal", "Vertical", "Knight", "Random mixed"}, patternLabel(s->freePattern), Action::Pattern, 2);
    r.text("Difficulty", dp(s, 18), y, dp(s, 3.0f), TEXT); y += dp(s, 28);
    drawChips(s, y, {"Easy", "Medium", "Hard", "Expert"}, s->freeDifficulty, Action::Difficulty, 2);
    drawButton(s, {dp(s, 18), y, r.width - dp(s, 36), dp(s, 46)}, std::string("Locked tiles ") + (s->freeLocked ? "ON" : "OFF"), Action::ToggleLocked, 0, false, s->freeLocked); y += dp(s, 56);
    drawButton(s, {dp(s, 18), y, r.width - dp(s, 36), dp(s, 46)}, std::string("Irregular board ") + (s->freeIrregular ? "ON" : "OFF"), Action::ToggleIrregular, 0, false, s->freeIrregular); y += dp(s, 56);
    drawButton(s, {dp(s, 18), y, r.width - dp(s, 36), dp(s, 46)}, std::string("Unique preferred ") + (s->freeUnique ? "ON" : "OFF"), Action::ToggleUnique, 0, false, s->freeUnique); y += dp(s, 66);
    drawButton(s, {dp(s, 18), y, r.width - dp(s, 36), dp(s, 56)}, "Generate Puzzle", Action::Generate, 0, true); y += dp(s, 80);
    finishScrollContent(s, y);
    drawStickyScreenHeader(s, "Custom Level", "Build a Puzzle", Action::Main, contentTop);
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
    r.roundedRect(panel.x + dp(s, 0.8f), panel.y + dp(s, 1.6f), panel.w, panel.h, radius, rgba(0, 0, 0, 0.16f));
    r.roundedRect(panel.x, panel.y, panel.w, panel.h, radius, rgba(229, 236, 245, 0.16f));
    r.roundedRect(panel.x + 1.0f, panel.y + 1.0f, panel.w - 2.0f, panel.h - 2.0f, radius - 1.0f, rgba(12, 17, 25, 0.94f));
    r.rectGradient(panel.x + 1.0f, panel.y + 1.0f, panel.w - 2.0f, panel.h * 0.42f,
                   withAlpha(accent, 0.060f), rgba(accent.r, accent.g, accent.b, 0.0f));
    r.rect(panel.x + radius * 0.80f, panel.y + 1.5f,
           panel.w - radius * 1.60f, 1.0f, rgba(255, 255, 255, 0.070f));
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
    r.roundedRect(card.x, card.y, card.w, card.h, radius, withAlpha(accent, 0.22f));
    r.roundedRect(card.x + 1.0f, card.y + 1.0f, card.w - 2.0f, card.h - 2.0f,
                  radius - 1.0f, rgba(7, 10, 14, 0.88f));
    r.rectGradient(card.x + 1.0f, card.y + 1.0f, card.w - 2.0f, card.h * 0.62f,
                   withAlpha(accent, 0.075f), rgba(accent.r, accent.g, accent.b, 0.0f));
    r.rect(card.x + radius * 0.80f, card.y + 1.5f, card.w - radius * 1.60f, 1.0f, rgba(255, 255, 255, 0.075f));
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
        drawFittedText(s, "if tap j changes tile i", braceX + dp(s, 45), rowTop + dp(s, 1),
                       card.x + card.w - braceX - dp(s, 56), scale * 0.52f, TEXT, 0, false, 0.82f);
        r.textHeavy("0", braceX + dp(s, 19), rowTop + rowGap, scale * 0.62f, MUTED, 0, 0.35f);
        drawFittedText(s, "otherwise", braceX + dp(s, 45), rowTop + rowGap + dp(s, 1),
                       card.x + card.w - braceX - dp(s, 56), scale * 0.52f, MUTED, 0, false, 0.82f);
    } else if (kind == FormulaKind::Plan) {
        x = drawFormulaVar(s, "x", "j", x, y, scale, TEXT, 5.0f);
        x = drawFormulaToken(s, "=", x, y, scale, MUTED, false, 6.0f);
        drawFittedText(s, "number of taps on tile j", x, y + scale * 0.18f,
                       card.x + card.w - x - dp(s, 10), scale * 0.62f, TEXT, 0, false, 0.88f);
    } else if (kind == FormulaKind::Image) {
        float rowScale = std::min(scale * 0.92f, dp(s, 2.80f));
        drawFittedText(s, "solution exists iff", card.x + dp(s, 13), card.y + dp(s, 12),
                       card.w - dp(s, 26), rowScale * 0.62f, MUTED, 0, false, 0.88f);
        float rowY = card.y + card.h - dp(s, 19) - rowScale * 4.6f;
        x = card.x + dp(s, 13);
        x = drawFormulaToken(s, "-s", x, rowY, rowScale, TEXT, true, 7.0f);
        x = drawFormulaSymbol(s, 0x2208, "in", x, rowY, rowScale * 0.88f, MUTED, 6.0f);
        drawFormulaToken(s, "Im(A)", x, rowY, rowScale, TEXT, true, 0.0f);
    } else if (kind == FormulaKind::Kernel) {
        float rowScale = std::min(scale * 0.88f, dp(s, 2.62f));
        float rowY = y + dp(s, 1);
        x = drawFormulaToken(s, "solutions", x, rowY, rowScale * 0.70f, MUTED, false, 4.0f);
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
        drawFittedText(s, "is a field", x, y + rowScale * 0.24f,
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
                {"n", "number of tile states"},
                {"s", "current board vector"},
                {"A", "pulse matrix"},
                {"x", "tap-count vector"},
                {"Im(A)", "all boards reachable by moves"},
                {"ker(A)", "move plans that change nothing"},
                {"mod n", "wraps after n - 1"}
        }};
        for (auto &row : rows) {
            r.textHeavy(row.first, card.x + dp(s, 12), rowY, dp(s, 1.82f), TEXT, 0, 0.45f);
            drawFittedText(s, row.second, card.x + dp(s, 76), rowY + dp(s, 1),
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
                r.roundedStroke(cell, radius, std::max(1.0f, dp(s, 1.2f)), rgba(229, 236, 245, 0.20f));
                continue;
            }
            if (spec.locked) {
                r.roundedRect(cell.x + dp(s, 0.8f), cell.y + dp(s, 1.5f), cell.w, cell.h, radius, rgba(0, 0, 0, 0.18f));
                r.roundedRect(cell.x, cell.y, cell.w, cell.h, radius, rgba(229, 236, 245, 0.28f));
                r.roundedRectGradient(cell.x + 1.0f, cell.y + 1.0f, cell.w - 2.0f, cell.h - 2.0f,
                                      std::max(1.0f, radius - 1.0f), rgba(79, 87, 99, 0.80f), rgba(35, 42, 53, 0.88f));
                r.line(cell.x + cell.w * 0.26f, cell.y + cell.h * 0.50f,
                       cell.x + cell.w * 0.74f, cell.y + cell.h * 0.50f, std::max(1.2f, tile * 0.08f), rgba(255, 248, 239, 0.58f));
            } else {
                drawMatrixTileSurface(s, cell, spec.state, radius, true);
            }
            if (spec.preview) {
                r.roundedStroke(cell, radius, std::max(2.0f, tile * 0.10f), rgba(95, 225, 170, 0.82f));
            }
            if (spec.hinted) {
                r.roundedStroke({cell.x + dp(s, 1.2f), cell.y + dp(s, 1.2f),
                                 cell.w - dp(s, 2.4f), cell.h - dp(s, 2.4f)},
                                std::max(1.0f, radius - dp(s, 1.0f)), std::max(2.0f, tile * 0.10f), rgba(255, 111, 130, 0.82f));
            }
            if (!spec.label.empty()) {
                float labelScale = std::min(dp(s, 2.15f), tile * 0.075f);
                r.textHeavy(spec.label, cell.x + cell.w * 0.5f, cell.y + cell.h * 0.5f - labelScale * 4.0f,
                            labelScale, rgba(7, 17, 15, 0.92f), 1, 0.9f);
            }
        }
    }
}

void drawGuideBlock(AppState *s, float &y, const std::string &title, const std::vector<std::string> &lines,
                    Color accent = GREEN, GuideDiagramKind diagram = GuideDiagramKind::None) {
    Renderer &r = s->renderer;
    float scale = guideTextScale(s);
    float pad = dp(s, 14);
    float titleH = dp(s, 31) * scale;
    float lineH = dp(s, 20) * scale;
    float panelW = r.width - dp(s, 36);
    float maxTextW = panelW - pad * 2.0f;
    float bodyScale = dp(s, 1.72f) * scale;
    std::vector<std::string> wrappedLines = wrapTextLines(s, lines, bodyScale, maxTextW);
    float diagramH = diagram == GuideDiagramKind::None ? 0.0f : dp(s, 92) * std::min(1.22f, scale);
    float diagramGap = diagram == GuideDiagramKind::None ? 0.0f : dp(s, 12) * std::min(1.12f, scale);
    float panelH = pad * 2.0f + titleH + diagramH + diagramGap +
                   lineH * static_cast<float>(wrappedLines.size()) + dp(s, 4);
    Rect panel{dp(s, 18), y, panelW, panelH};
    drawMathPanel(s, panel, accent);
    drawFittedText(s, title, panel.x + pad, panel.y + pad, panel.w - pad * 2.0f, dp(s, 2.48f) * scale, TEXT);
    float ly = panel.y + pad + titleH;
    if (diagram != GuideDiagramKind::None) {
        float diagramW = std::min(maxTextW, dp(s, 116) * std::min(1.24f, scale));
        drawGuideDiagram(s, {panel.x + pad, ly, diagramW, diagramH}, diagram, accent);
        ly += diagramH + diagramGap;
    }
    for (const std::string &line : wrappedLines) {
        drawFittedText(s, line, panel.x + pad, ly, maxTextW, bodyScale, MUTED);
        ly += lineH;
    }
    y += panel.h + dp(s, 14);
}

void drawHowToIntro(AppState *s, float &y) {
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
    std::vector<std::string> titleLines = wrapTextLines(s, "Clear the board", titleScale, maxTextW);
    std::vector<std::string> bodyLines = wrapTextLines(s, std::vector<std::string>{
        "Clear the board by making every tile return to calm zero.",
        "Each tap sends a pulse through a pattern, and every touched tile advances by one state."
    }, bodyScale, maxTextW);
    Rect panel{dp(s, 18), y, panelW,
               pad * 2.0f + titleLineH * static_cast<float>(titleLines.size()) + dp(s, 12) +
                   diagramH + diagramGap +
                   bodyLineH * static_cast<float>(bodyLines.size())};
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
    for (const std::string &line : bodyLines) {
        drawFittedText(s, line, panel.x + pad, ly, maxTextW, bodyScale, MUTED);
        ly += bodyLineH;
    }
    y += panel.h + dp(s, 14);
}

void drawHowTo(AppState *s) {
    float y = beginScrollContent(s, guideContentTop(s));
    drawHowToIntro(s, y);
    drawGuideBlock(s, y, "1. Read the tiles",
                   {"A pale tile is solved.",
                    "Colored tiles show values 1, 2, 3, ..., depending on the number of states in the level."},
                   GREEN, GuideDiagramKind::Read);
    drawGuideBlock(s, y, "2. Tap and wrap",
                   {"Tap a tile to add 1 to every tile in its pulse pattern.",
                    "After the last color, the next tap wraps that tile back to zero."},
                   BLUE, GuideDiagramKind::Tap);
    drawGuideBlock(s, y, "3. Watch the pattern",
                   {"Different levels use cross, diagonal, square, horizontal, vertical, knight, or mixed pulse patterns.",
                    "Hold or hover a tile to preview its affected tiles."},
                   ORANGE, GuideDiagramKind::Pattern);
    drawGuideBlock(s, y, "4. Respect special tiles",
                   {"Locked tiles can be changed by nearby pulses, but you cannot tap them directly.",
                    "Empty holes are outside the board and do not store a value."},
                   PURPLE, GuideDiagramKind::Special);
    drawGuideBlock(s, y, "Modes: Choose your puzzle",
                   {"Campaign is a long curated path. Levels unlock in order, and each level has fixed star targets.",
                    "Custom Level lets you choose board size, number of states, pulse pattern, difficulty, locks, gaps, and whether the generator should prefer a unique solution.",
                    "Daily Challenge gives everyone the same three generated puzzles for the date. You can replay them, but leaderboards keep only the first try."},
                   GREEN, GuideDiagramKind::Modes);
    drawGuideBlock(s, y, "Moves, stars, and hints",
                   {"The move counter counts every tap.",
                    "Three stars means matching the generator's minimum found move count; two, one, and zero star bands allow progressively more extra moves.",
                    "Undo rewinds one move, Reset restores the starting board, and Hint applies the next move from a solver plan.",
                    "A hint makes that try worth zero stars, but the puzzle still counts as complete.",
                    "Tiles changed by a hint are marked in red."},
                   BLUE, GuideDiagramKind::Moves);
    drawGuideBlock(s, y, "Settings",
                   {"Sound controls audio effects. Vibration controls haptic feedback. Animations can be turned off.",
                    "Colorblind-friendly symbols add shape labels, and Show numbers on tiles can be enabled when you want numeric values."},
                   ORANGE, GuideDiagramKind::Options);
    finishScrollContent(s, y);
    drawGuideHeader(s, "How to Play");
}

void drawMathIntro(AppState *s, float &y) {
    Renderer &r = s->renderer;
    float scale = guideTextScale(s);
    float pad = dp(s, 14);
    float panelW = r.width - dp(s, 36);
    float maxTextW = panelW - pad * 2.0f;
    float titleScale = dp(s, 2.75f) * scale;
    float bodyScale = dp(s, 1.78f) * scale;
    float titleLineH = dp(s, 31) * scale;
    float lineH = dp(s, 22) * scale;
    float formulaH = dp(s, 52) * std::min(1.16f, scale);
    std::vector<std::string> titleLines = wrapTextLines(s, "A spin on classical Lights Out", titleScale, maxTextW);
    std::vector<std::string> bodyLines = wrapTextLines(s, std::vector<std::string>{
        "Think of the board as a list of numbers, not only as a picture.",
        "A tap adds one fixed move vector to that list.",
        "The puzzle asks whether some sum of move vectors cancels the starting board.",
        "All arithmetic is modulo n, so values wrap after the final state."
    }, bodyScale, maxTextW);
    Rect panel{dp(s, 18), y, panelW,
               pad * 2.0f + titleLineH * static_cast<float>(titleLines.size()) + dp(s, 10) +
                   lineH * static_cast<float>(bodyLines.size()) + formulaH + dp(s, 14)};
    drawMathPanel(s, panel, BLUE);
    float ly = panel.y + pad;
    for (const std::string &line : titleLines) {
        drawFittedText(s, line, panel.x + pad, ly, maxTextW, titleScale, TEXT);
        ly += titleLineH;
    }
    ly += dp(s, 10);
    for (const std::string &line : bodyLines) {
        drawFittedText(s, line, panel.x + pad, ly, maxTextW, bodyScale, MUTED);
        ly += lineH;
    }
    drawFormulaCard(s, {panel.x + dp(s, 12), panel.y + panel.h - formulaH - dp(s, 12), panel.w - dp(s, 24), formulaH},
                    FormulaKind::Hero, BLUE);
    y += panel.h + dp(s, 14);
}

void drawMathBlock(AppState *s, float &y, const std::string &title, const std::vector<std::string> &lines,
                   FormulaKind kind, Color accent = GREEN, float formulaHeightDp = 64.0f) {
    Renderer &r = s->renderer;
    float scale = guideTextScale(s);
    float lineH = dp(s, 20) * scale;
    float formulaH = dp(s, formulaHeightDp) * std::min(1.16f, scale);
    float pad = dp(s, 14);
    float titleH = dp(s, 30) * scale;
    float panelW = r.width - dp(s, 36);
    float maxTextW = panelW - pad * 2.0f;
    float bodyScale = dp(s, 1.72f) * scale;
    std::vector<std::string> wrappedLines = wrapTextLines(s, lines, bodyScale, maxTextW);
    float panelH = pad * 2.0f + titleH + lineH * static_cast<float>(wrappedLines.size()) + formulaH + dp(s, 10);
    Rect panel{dp(s, 18), y, panelW, panelH};
    drawMathPanel(s, panel, accent);
    drawFittedText(s, title, panel.x + pad, panel.y + pad, panel.w - pad * 2.0f, dp(s, 2.48f) * scale, TEXT);
    float ly = panel.y + pad + titleH;
    for (const std::string &line : wrappedLines) {
        drawFittedText(s, line, panel.x + pad, ly, maxTextW, bodyScale, MUTED);
        ly += lineH;
    }
    drawFormulaCard(s, {panel.x + dp(s, 12), panel.y + panel.h - formulaH - dp(s, 12), panel.w - dp(s, 24), formulaH},
                    kind, accent);
    y += panel.h + dp(s, 14);
}

void drawMath(AppState *s) {
    float y = beginScrollContent(s, guideContentTop(s));
    drawMathIntro(s, y);
    drawGuideBlock(s, y, "From Lights Out",
                   {"Classical Lights Out is the n = 2 case: tiles are off or on.",
                    "Pressing a tile toggles a fixed neighborhood, which means adding 1 modulo 2.",
                    "Pressing the same tile twice gives no net change.",
                    "Invert the Matrix keeps this column-span problem, but allows more states and richer boards."},
                   BLUE);
    drawMathBlock(s, y, "1. The Board Is A Vector",
                  {"Ignore gaps and list the active tiles in a fixed order.",
                   "Their current values form a vector s in (Z/nZ)^m.",
                   "The number m is the number of active board positions.",
                   "Solving means reaching the zero vector, where every active tile is pale."},
                  FormulaKind::Remainder, GREEN, 70.0f);
    drawMathBlock(s, y, "2. Each Tap Is A Column",
                  {"For each legal tap j, record which tiles it changes.",
                   "That record is column j of the move matrix A.",
                   "Entry Aij is one when tap j changes tile i, and zero otherwise.",
                   "Locked tiles can be rows, because they must be solved, but they are not tap columns."},
                  FormulaKind::Column, ORANGE, 78.0f);
    drawMathBlock(s, y, "3. A Plan Is A Vector",
                  {"The vector x records tap counts, not tap order.",
                   "Because the moves add together, only how many times each tap is used matters.",
                   "All coordinates are counted modulo n.",
                   "Tapping a tile n times is algebraically the same as not tapping it."},
                  FormulaKind::Plan, PURPLE, 60.0f);
    drawMathBlock(s, y, "Goal: Find A Tap Vector",
                  {"After using plan x, the board is s plus A x.",
                   "The target is the zero board.",
                   "So the solver is looking for A x equal to -s modulo n.",
                   "This is a system of linear congruences."},
                  FormulaKind::Goal, BLUE, 60.0f);
    drawMathBlock(s, y, "When Does A Solution Exist?",
                  {"The columns of A describe all board changes reachable by legal moves.",
                   "There is a solution exactly when the target -s is in that column span.",
                   "That column span is called the image of A.",
                   "Over prime n, row-reduce the augmented system [A | -s].",
                   "A row that says 0 = nonzero means impossible; otherwise the system is consistent."},
                  FormulaKind::Image, GREEN, 70.0f);
    drawMathBlock(s, y, "Prime n: Fields",
                  {"For n = 2, 3, or 5, Z/nZ is a field.",
                   "Every nonzero value has an inverse, so division by a pivot is legal.",
                   "Gaussian elimination works like ordinary linear algebra, only with modular arithmetic.",
                   "Free variables correspond to different solving plans."},
                  FormulaKind::Prime, GREEN, 54.0f);
    drawMathBlock(s, y, "Composite n: Rings",
                  {"For composite n, Z/nZ is usually a ring rather than a field.",
                   "For n = 4, the number 2 is nonzero but has no inverse.",
                   "So naive division by 2 can give false conclusions.",
                   "The criterion is unchanged: -s must lie in Im(A) over Z/nZ.",
                   "Verification must use ring-valid operations, or compatible prime-power checks."},
                  FormulaKind::Four, PURPLE, 54.0f);
    drawMathBlock(s, y, "When Is It Unique?",
                  {"If x0 solves the puzzle, every other solution is x0 plus a silent plan.",
                   "A silent plan lives in ker(A), because it changes no tile.",
                   "Thus the full solution set is x0 + ker(A).",
                   "The solution is unique exactly when ker(A) has only the zero vector.",
                   "If the kernel is larger, there are several algebraic ways to solve the same board."},
                  FormulaKind::Kernel, BLUE, 58.0f);
    drawMathBlock(s, y, "Why The Minimum Matters",
                  {"Linear algebra may give many valid plans.",
                   "For play, the app cares about the shortest physical plan.",
                   "Using representatives 0 through n - 1, the length is the total number of taps.",
                   "The three-star target is the smallest length the solver found for that board."},
                  FormulaKind::Minimum, ORANGE, 64.0f);
    drawGuideBlock(s, y, "Locked Tiles And Gaps",
                   {"Locked tiles remain rows because their values must become zero.",
                    "They are not columns, because they cannot be tapped directly.",
                    "Gaps are outside the board, so they are neither rows nor columns."},
                   PURPLE);
    drawGuideBlock(s, y, "How The Generator Uses This",
                   {"The generator builds A from the board shape, locks, gaps, and pulse pattern.",
                    "It chooses or checks a starting board s and verifies the equation is solvable.",
                    "For curated levels it stores star thresholds based on the shortest plan found.",
                    "Hints follow a stored solving plan one move at a time.",
                    "The red outline marks exactly the tiles changed by that hint move."},
                   GREEN);
    drawMathBlock(s, y, "What The Symbols Mean",
                  {"These are the compact labels used by the equations and solver."},
                  FormulaKind::Symbols, BLUE, 166.0f);
    finishScrollContent(s, y);
    drawGuideHeader(s, "The Math");
}

void drawSettings(AppState *s) {
    float contentTop = safeTop(s) + dp(s, 98);
    float y = beginScrollContent(s, contentTop);
    drawButton(s, {dp(s, 18), y, s->renderer.width - dp(s, 36), dp(s, 52)}, std::string("Sound ") + (s->sound ? "ON" : "OFF"), Action::ToggleSetting, 0, false, s->sound); y += dp(s, 64);
    drawButton(s, {dp(s, 18), y, s->renderer.width - dp(s, 36), dp(s, 52)}, std::string("Vibration ") + (s->vibration ? "ON" : "OFF"), Action::ToggleSetting, 1, false, s->vibration); y += dp(s, 64);
    drawButton(s, {dp(s, 18), y, s->renderer.width - dp(s, 36), dp(s, 52)}, std::string("Animations ") + (s->animations ? "ON" : "OFF"), Action::ToggleSetting, 2, false, s->animations); y += dp(s, 64);
    drawButton(s, {dp(s, 18), y, s->renderer.width - dp(s, 36), dp(s, 52)}, std::string("Colorblind-friendly symbols ") + (s->colorblind ? "ON" : "OFF"), Action::ToggleSetting, 3, false, s->colorblind); y += dp(s, 64);
    drawButton(s, {dp(s, 18), y, s->renderer.width - dp(s, 36), dp(s, 52)}, std::string("Show numbers on tiles ") + (!s->hideNumbers ? "ON" : "OFF"), Action::ToggleSetting, 4, false, !s->hideNumbers); y += dp(s, 64);
    finishScrollContent(s, y);
    drawStickyScreenHeader(s, "Options", "Settings", Action::BackReturn, contentTop);
}

std::string formatTime(int total) {
    char buf[32];
    std::snprintf(buf, sizeof(buf), "%d:%02d", total / 60, total % 60);
    return buf;
}

Color stateColor(int state) {
    if (state == 1) return BLUE;
    if (state == 2) return ORANGE;
    if (state == 3) return PURPLE;
    if (state == 4) return GREEN;
    return rgba(245, 245, 239);
}

Color stateTopColor(int state) {
    if (state == 1) return rgba(69, 194, 244, 0.98f);
    if (state == 2) return rgba(255, 180, 90, 0.98f);
    if (state == 3) return rgba(181, 140, 255, 0.98f);
    if (state == 4) return rgba(95, 225, 170, 0.98f);
    return rgba(255, 253, 245, 1.0f);
}

Color stateBottomColor(int state) {
    if (state == 1) return rgba(28, 91, 132, 0.92f);
    if (state == 2) return rgba(144, 76, 37, 0.92f);
    if (state == 3) return rgba(78, 54, 137, 0.92f);
    if (state == 4) return rgba(36, 112, 88, 0.92f);
    return rgba(223, 232, 240, 1.0f);
}

Color stateBorderColor(int state) {
    if (state == 1) return rgba(238, 240, 235, 0.18f);
    if (state == 2) return rgba(238, 240, 235, 0.18f);
    if (state == 3) return rgba(238, 240, 235, 0.18f);
    if (state == 4) return rgba(238, 240, 235, 0.18f);
    return rgba(255, 255, 255, 0.78f);
}

bool containsIndex(const std::vector<int> &items, int value) {
    return std::find(items.begin(), items.end(), value) != items.end();
}

Rect currentBoardRect(AppState *s) {
    Renderer &r = s->renderer;
    float top = safeTop(s) + dp(s, 276);
    float bottom = safeBottom(s) + dp(s, 34);
    float maxW = r.width - dp(s, 42);
    float maxH = r.height - top - bottom;
    float cell = std::min(maxW / s->session.puzzle.width, maxH / s->session.puzzle.height);
    float bw = cell * s->session.puzzle.width;
    float bh = cell * s->session.puzzle.height;
    return {(r.width - bw) * 0.5f, top + (maxH - bh) * 0.5f, bw, bh};
}

void drawPatternMini(AppState *s, Rect rect, const Puzzle &p) {
    Renderer &r = s->renderer;
    drawPanel(r, rect, rgba(7, 10, 14, 0.42f));
    std::string key = p.defaultPattern;
    Pattern pat = patternFor(key);
    int maxDist = 1;
    for (auto &off : pat.offsets) {
        maxDist = std::max(maxDist, std::max(std::abs(off.first), std::abs(off.second)));
    }
    int size = std::max(3, maxDist * 2 + 1);
    float pad = dp(s, 5);
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
            r.roundedRect(d.x, d.y, d.w, d.h, std::max(1.0f, dot * 0.25f), on ? GREEN : rgba(255, 255, 255, 0.09f));
            if (on) r.softAura(d.x + d.w * 0.5f, d.y + d.h * 0.5f, dot * 1.4f, rgba(95, 225, 170, 0.22f), 4);
            if (x == center && y == center) r.stroke(d, 1.0f, rgba(255, 248, 239, 0.5f));
        }
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
    int best = s->progress.getInt("best_" + s->session.puzzle.levelId, -1);
    return best < 0 ? "-" : std::to_string(best);
}

int oneStarMax(const Puzzle &p) {
    return p.targetMoves + std::max(1, p.targetMoves - p.minimumMoves);
}

int storedStarsForSession(AppState *s) {
    if (!s || !s->hasSession) return -1;
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

void drawStarRankingCard(AppState *s, Rect card, const Puzzle &p, int highlightedStars = -1) {
    Renderer &r = s->renderer;
    drawGlassPanel(s, card, rgba(22, 27, 38, 0.82f), rgba(255, 180, 90, 0.030f));
    int oneMax = oneStarMax(p);
    std::array<std::pair<int, std::string>, 4> rows = {{
            {3, moveRangeText(p.minimumMoves, p.minimumMoves)},
            {2, moveRangeText(p.minimumMoves + 1, p.targetMoves)},
            {1, moveRangeText(p.targetMoves + 1, oneMax)},
            {0, moveRangeText(oneMax + 1, -1)}
    }};
    float rowH = card.h / 4.0f;
    for (int i = 0; i < 4; ++i) {
        int stars = rows[static_cast<size_t>(i)].first;
        float cy = card.y + rowH * i + rowH * 0.5f;
        bool highlighted = stars == highlightedStars;
        if (highlighted) {
            Rect row{card.x + dp(s, 4), card.y + rowH * i + dp(s, 1.0f), card.w - dp(s, 8), rowH - dp(s, 2.0f)};
            r.roundedRect(row.x, row.y, row.w, row.h, dp(s, 4), rgba(255, 180, 90, 0.12f));
            r.roundedStroke(row, dp(s, 4), 1.0f, rgba(255, 180, 90, 0.20f));
        }
        Color valueColor = highlighted ? TEXT : (i == 0 ? TEXT : (i == 1 ? rgba(255, 248, 239, 0.88f) : rgba(210, 218, 230, 0.74f)));
        drawStars(s, card.x + dp(s, 8), cy - dp(s, 4.4f), dp(s, 8.2f), stars, 3, 0, highlighted ? 1.0f : (i == 0 ? 1.0f : 0.90f));
        Rect valueBadge{card.x + card.w - dp(s, 58), cy - dp(s, 9.4f), dp(s, 50), dp(s, 18.0f)};
        r.roundedRect(valueBadge.x, valueBadge.y, valueBadge.w, valueBadge.h, dp(s, 4), rgba(7, 10, 14, 0.24f));
        drawFittedText(s, rows[static_cast<size_t>(i)].second,
                       valueBadge.x + valueBadge.w * 0.5f, cy - dp(s, 6.9f),
                       valueBadge.w - dp(s, 4), dp(s, 1.82f), valueColor, 1, true, 1.05f);
    }
}

void drawPadlockBadge(AppState *s, Rect badge) {
    Renderer &r = s->renderer;
    float radius = std::max(3.0f, badge.h * 0.28f);
    r.softAura(badge.x + badge.w * 0.5f, badge.y + badge.h * 0.5f, badge.w * 0.64f, rgba(255, 248, 239, 0.10f), 4);
    r.roundedRect(badge.x, badge.y, badge.w, badge.h, radius, rgba(238, 240, 235, 0.24f));
    r.roundedRect(badge.x + 1.0f, badge.y + 1.0f, badge.w - 2.0f, badge.h - 2.0f, std::max(1.0f, radius - 1.0f), rgba(7, 10, 14, 0.70f));
    r.rect(badge.x + badge.w * 0.22f, badge.y + 1.5f, badge.w * 0.56f, 1.0f, rgba(255, 255, 255, 0.13f));

    float cx = badge.x + badge.w * 0.5f;
    float bodyW = badge.w * 0.48f;
    float bodyH = badge.h * 0.36f;
    float bodyX = cx - bodyW * 0.5f;
    float bodyY = badge.y + badge.h * 0.52f;
    float stroke = std::max(1.2f, badge.w * 0.07f);
    float rx = bodyW * 0.38f;
    float ry = badge.h * 0.20f;
    float arcCy = bodyY + bodyH * 0.05f;

    float prevX = cx - rx;
    float prevY = arcCy;
    for (int i = 1; i <= 8; ++i) {
        float a = 3.14159265f - static_cast<float>(i) / 8.0f * 3.14159265f;
        float x = cx + std::cos(a) * rx;
        float y = arcCy - std::sin(a) * ry;
        r.line(prevX, prevY, x, y, stroke, rgba(255, 248, 239, 0.96f));
        prevX = x;
        prevY = y;
    }
    r.line(cx - rx, arcCy, cx - rx, bodyY + bodyH * 0.22f, stroke, rgba(255, 248, 239, 0.96f));
    r.line(cx + rx, arcCy, cx + rx, bodyY + bodyH * 0.22f, stroke, rgba(255, 248, 239, 0.96f));

    r.roundedRect(bodyX, bodyY, bodyW, bodyH, bodyH * 0.24f, rgba(255, 248, 239, 0.98f));
    r.rect(bodyX + bodyW * 0.16f, bodyY + 1.0f, bodyW * 0.68f, 1.0f, rgba(255, 255, 255, 0.42f));
    r.circle(cx, bodyY + bodyH * 0.45f, std::max(1.0f, bodyW * 0.07f), rgba(7, 10, 14, 0.76f), 14);
    r.line(cx, bodyY + bodyH * 0.48f, cx, bodyY + bodyH * 0.70f, std::max(1.0f, bodyW * 0.055f), rgba(7, 10, 14, 0.76f));
}

void drawBoard(AppState *s) {
    Renderer &r = s->renderer;
    Puzzle &p = s->session.puzzle;
    Rect board = currentBoardRect(s);
    float cell = board.w / p.width;
    float framePad = std::max(8.0f, std::min(dp(s, 10), cell * 0.12f));
    Rect frame{board.x - framePad, board.y - framePad, board.w + framePad * 2.0f, board.h + framePad * 2.0f};
    r.glow(frame, dp(s, 5), rgba(69, 194, 244, 0.055f), 5);
    r.roundedRect(frame.x, frame.y, frame.w, frame.h, dp(s, 8), rgba(229, 236, 245, 0.30f));
    r.roundedRect(frame.x + 1.0f, frame.y + 1.0f, frame.w - 2.0f, frame.h - 2.0f, dp(s, 7), rgba(10, 13, 19, 0.84f));
    r.rectGradient(frame.x + 2.0f, frame.y + 2.0f, frame.w - 4.0f, frame.h * 0.30f, rgba(69, 194, 244, 0.055f), rgba(69, 194, 244, 0.0f));
    r.rectGradient(frame.x + 2.0f, frame.y + frame.h * 0.60f, frame.w - 4.0f, frame.h * 0.34f, rgba(255, 180, 90, 0.0f), rgba(255, 180, 90, 0.040f));

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
                r.roundedRect(tile.x, tile.y, tile.w, tile.h, disabledRadius, rgba(229, 236, 245, 0.12f));
                r.roundedRect(tile.x + 1, tile.y + 1, tile.w - 2, tile.h - 2, std::max(1.0f, disabledRadius - 1.0f), rgba(0, 0, 0, 0.62f));
                r.rect(tile.x + tile.w * 0.16f, tile.y + tile.h * 0.16f, tile.w * 0.18f, 1.0f, rgba(229, 236, 245, 0.12f));
                r.rect(tile.x + tile.w * 0.66f, tile.y + tile.h * 0.82f, tile.w * 0.18f, 1.0f, rgba(229, 236, 245, 0.10f));
                continue;
            }
            int state = s->session.board[idx];
            float radius = std::min(10.0f, std::max(6.0f, tile.w * 0.055f));
            bool previewAffected = containsIndex(preview, idx);
            bool previewOrigin = s->previewTile == idx && !preview.empty();
            bool changedByHint = showHintChanged && containsIndex(s->hintChanged, idx);
            bool pulsed = showPulse && containsIndex(s->pulseTiles, idx);
            if (changedByHint) {
                r.glow(tile, std::min(dp(s, 14), tile.w * 0.14f), rgba(210, 91, 100, 0.24f), 6);
            }
            if (pulsed) {
                r.glow(tile, std::min(dp(s, 12), tile.w * (0.10f + pulsePhase * 0.04f)), rgba(255, 248, 239, 0.13f), 4);
            }
            drawMatrixTileSurface(s, tile, state, radius, true);
            if (previewAffected) {
                r.roundedRect(tile.x + 2.0f, tile.y + 2.0f, tile.w - 4.0f, tile.h - 4.0f, radius - 2.0f, rgba(2, 7, 12, previewOrigin ? 0.30f : 0.22f));
                r.roundedStroke(tile, radius, previewOrigin ? dp(s, 3.0f) : dp(s, 2.0f), rgba(95, 225, 170, previewOrigin ? 0.92f : 0.68f));
            }
            if (changedByHint) {
                r.roundedStroke({tile.x + dp(s, 1.6f), tile.y + dp(s, 1.6f), tile.w - dp(s, 3.2f), tile.h - dp(s, 3.2f)},
                                std::max(1.0f, radius - dp(s, 1.6f)), dp(s, 3.0f), rgba(255, 111, 130, 1.0f));
                r.roundedStroke({tile.x + dp(s, 5.0f), tile.y + dp(s, 5.0f), tile.w - dp(s, 10.0f), tile.h - dp(s, 10.0f)},
                                std::max(1.0f, radius - dp(s, 5.0f)), dp(s, 1.2f), rgba(255, 180, 90, 0.18f));
            } else if (pulsed) {
                r.roundedStroke(tile, radius, dp(s, 2.0f), rgba(255, 248, 239, 0.34f * (1.0f - pulsePhase)));
            }
            if (p.locked.count(idx)) {
                float badgeSize = std::max(dp(s, 17), std::min(dp(s, 27), tile.w * 0.30f));
                Rect badge{tile.x + tile.w - badgeSize - dp(s, 4), tile.y + dp(s, 4), badgeSize, badgeSize};
                drawPadlockBadge(s, badge);
            }
            if (p.tilePatterns.count(idx)) {
                Pattern pat = patternFor(p.tilePatterns[idx]);
                Rect badge{tile.x + tile.w * 0.07f, tile.y + tile.h * 0.07f, tile.w * 0.25f, tile.h * 0.24f};
                r.roundedRect(badge.x, badge.y, badge.w, badge.h, badge.h * 0.5f, rgba(9, 11, 18, 0.72f));
                r.text(pat.badge, badge.x + badge.w * 0.5f, badge.y + badge.h * 0.08f, std::max(1.7f, tile.w / 40.0f), TEXT, 1);
            }
            std::string label;
            if (state > 0) {
                if (s->hideNumbers && s->colorblind) label = std::string(1, "*+^#"[state - 1]);
                else if (!s->hideNumbers) label = std::to_string(state);
            }
            if (!label.empty()) {
                r.text(label, tile.x + tile.w * 0.5f, tile.y + tile.h * 0.5f - tile.w * 0.13f, std::max(2.0f, tile.w / 24.0f), state ? TEXT : rgba(24, 32, 43), 1);
            }
        }
    }
}

void drawGame(AppState *s) {
    Renderer &r = s->renderer;
    Session &g = s->session;
    if (!g.completed) g.elapsed = static_cast<int>((nowMs() - g.started) / 1000);
    float top = safeTop(s) + dp(s, 8);
    drawBackIcon(s, {dp(s, 14), top, dp(s, 50), dp(s, 44)}, Action::ExitGame);
    drawGearIcon(s, {r.width - dp(s, 64), top, dp(s, 50), dp(s, 44)}, Action::Settings);
    r.text(g.mode == "campaign" ? "Campaign" : g.mode == "daily" ? "Daily" : "Custom Level", dp(s, 84), top + dp(s, 1), dp(s, 2.14f), GREEN);
    drawFittedText(s, g.puzzle.name, dp(s, 84), top + dp(s, 27), r.width - dp(s, 164), dp(s, 3.08f), TEXT);
    float y = top + dp(s, 68);
    float gap = dp(s, 9);
    float cell = (r.width - dp(s, 28) - gap * 2) / 3.0f;
    drawGlassPanel(s, {dp(s, 14), y, cell, dp(s, 66)}, rgba(22, 27, 38, 0.82f));
    r.text("Moves", dp(s, 14) + cell * 0.5f, y + dp(s, 10), dp(s, 1.94f), MUTED, 1);
    r.text(std::to_string(g.moves), dp(s, 14) + cell * 0.5f, y + dp(s, 36), dp(s, 3.08f), TEXT, 1);
    drawStarRankingCard(s, {dp(s, 14) + cell + gap, y, cell, dp(s, 66)}, g.puzzle, storedStarsForSession(s));
    drawGlassPanel(s, {dp(s, 14) + (cell + gap) * 2, y, cell, dp(s, 66)}, rgba(22, 27, 38, 0.82f));
    r.text("Time", dp(s, 14) + cell * 2.5f + gap * 2, y + dp(s, 10), dp(s, 1.94f), MUTED, 1);
    r.text(formatTime(g.elapsed), dp(s, 14) + cell * 2.5f + gap * 2, y + dp(s, 37), dp(s, 2.62f), TEXT, 1);
    y += dp(s, 74);
    float miniW = dp(s, 50);
    float bestW = dp(s, 116);
    float patternW = r.width - dp(s, 28) - bestW - gap;
    Rect patternStrip{dp(s, 14), y, patternW, dp(s, 52)};
    drawGlassPanel(s, patternStrip, rgba(22, 27, 38, 0.82f), rgba(95, 225, 170, 0.026f));
    Rect mini{patternStrip.x + patternStrip.w - miniW - dp(s, 6), y + dp(s, 5), miniW, dp(s, 42)};
    std::string pat = g.puzzle.tilePatterns.empty() ? patternFor(g.puzzle.defaultPattern).label : "Mixed patterns";
    r.text("Pattern", patternStrip.x + dp(s, 9), y + dp(s, 8), dp(s, 1.70f), MUTED);
    drawFittedText(s, pat,
                   patternStrip.x + dp(s, 9), y + dp(s, 29),
                   patternStrip.w - miniW - dp(s, 26), dp(s, 2.02f), TEXT);
    drawPatternMini(s, mini, g.puzzle);
    Rect bestCard{patternStrip.x + patternStrip.w + gap, y, bestW, dp(s, 52)};
    drawGlassPanel(s, bestCard, rgba(22, 27, 38, 0.82f), rgba(69, 194, 244, 0.025f));
    r.text("Personal Best", bestCard.x + dp(s, 8), y + dp(s, 8), dp(s, 1.55f), MUTED);
    drawFittedText(s, bestMovesText(s), bestCard.x + dp(s, 8), y + dp(s, 29),
                   bestCard.w - dp(s, 16), dp(s, 2.16f), GREEN);
    y += dp(s, 60);
    float iconW = dp(s, 70);
    float resetW = r.width - dp(s, 28) - iconW * 2.0f - gap * 2.0f;
    bool leaderboardAttempt = g.mode == "daily" && g.leaderboardAttempt && !g.completed;
    drawUndoToolButton(s, {dp(s, 14), y, iconW, dp(s, 52)}, !g.history.empty());
    if (leaderboardAttempt) {
        Rect notice{dp(s, 14) + iconW + gap, y, r.width - dp(s, 28) - iconW - gap, dp(s, 52)};
        drawGlassPanel(s, notice, rgba(22, 27, 38, 0.82f), rgba(255, 180, 90, 0.030f));
        r.text("Leaderboard try", notice.x + dp(s, 10), notice.y + dp(s, 8), dp(s, 1.55f), ORANGE);
        drawFittedText(s, "No reset or hints", notice.x + dp(s, 10), notice.y + dp(s, 31),
                       notice.w - dp(s, 20), dp(s, 2.05f), TEXT);
    } else {
        drawResetToolButton(s, {dp(s, 14) + iconW + gap, y, resetW, dp(s, 52)});
        drawHintToolButton(s, {r.width - dp(s, 14) - iconW, y, iconW, dp(s, 52)});
    }
    drawBoard(s);
    if (!s->hintLine.empty()) {
        r.text(s->hintLine, r.width * 0.5f, r.height - safeBottom(s) - dp(s, 24), dp(s, 1.9f), MUTED, 1);
    }

    if (s->completion) {
        r.rect(0, 0, r.width, r.height, rgba(0, 0, 0, 0.64f));
        float modalH = std::min(dp(s, 502), r.height - safeTop(s) - safeBottom(s) - dp(s, 42));
        Rect modal{dp(s, 18), r.height - safeBottom(s) - modalH - dp(s, 18), r.width - dp(s, 36), modalH};
        modal.y = std::max(safeTop(s) + dp(s, 16), modal.y);
        r.glow(modal, dp(s, 20), rgba(69, 194, 244, 0.09f), 9);
        r.roundedRect(modal.x, modal.y, modal.w, modal.h, dp(s, 8), rgba(229, 236, 245, 0.30f));
        r.roundedRect(modal.x + 1.2f, modal.y + 1.2f, modal.w - 2.4f, modal.h - 2.4f, dp(s, 7), rgba(22, 26, 35, 0.98f));
        r.rectGradient(modal.x + 2.0f, modal.y + 2.0f, modal.w - 4.0f, modal.h * 0.26f, rgba(69, 194, 244, 0.055f), rgba(69, 194, 244, 0.0f));
        r.text("Complete", modal.x + dp(s, 18), modal.y + dp(s, 18), dp(s, 1.9f), GREEN);
        std::string completeTitle = g.mode == "daily"
                                    ? "Daily " + dailyTierLabel(dailyTierIndex(g.dailyTier)) + " Complete"
                                    : "Level Complete";
        r.text(completeTitle, modal.x + dp(s, 18), modal.y + dp(s, 48), dp(s, 3.25f), TEXT);
        drawStars(s, modal.x + dp(s, 18), modal.y + dp(s, 88), dp(s, 26), s->completionStars, 3, 0, 1.0f);

        auto resultCard = [&](Rect card, const std::string &label, const std::string &value) {
            r.roundedRect(card.x, card.y, card.w, card.h, dp(s, 8), rgba(229, 236, 245, 0.16f));
            r.roundedRect(card.x + 1.0f, card.y + 1.0f, card.w - 2.0f, card.h - 2.0f, dp(s, 7), rgba(10, 13, 19, 0.76f));
            r.text(label, card.x + dp(s, 8), card.y + dp(s, 9), dp(s, 1.55f), MUTED);
            r.text(value, card.x + dp(s, 8), card.y + dp(s, 31), dp(s, 2.45f), TEXT);
        };

        float cardGap = dp(s, 8);
        float cardW = (modal.w - dp(s, 36) - cardGap) * 0.5f;
        float cx = modal.x + dp(s, 18);
        float cy = modal.y + dp(s, 132);
        resultCard({cx, cy, cardW, dp(s, 60)}, "Moves Used", std::to_string(g.moves));
        resultCard({cx + cardW + cardGap, cy, cardW, dp(s, 60)}, "Minimum", std::to_string(g.puzzle.minimumMoves));
        cy += dp(s, 70);
        resultCard({cx, cy, cardW, dp(s, 60)}, g.mode == "daily" ? "Mark" : "Best Moves",
                   g.mode == "daily" ? formatMark(s->completionMark) : bestMovesText(s));
        resultCard({cx + cardW + cardGap, cy, cardW, dp(s, 60)}, "Time", formatTime(g.elapsed));

        float by = cy + dp(s, 76);
        float starW = (modal.w - dp(s, 36) - cardGap * 3.0f) / 4.0f;
        int oneMax = oneStarMax(g.puzzle);
        std::array<std::pair<int, std::string>, 4> breakdown = {{
                {3, moveRangeText(g.puzzle.minimumMoves, g.puzzle.minimumMoves)},
                {2, moveRangeText(g.puzzle.minimumMoves + 1, g.puzzle.targetMoves)},
                {1, moveRangeText(g.puzzle.targetMoves + 1, oneMax)},
                {0, moveRangeText(oneMax + 1, -1)}
        }};
        for (int i = 0; i < 4; ++i) {
            Rect card{modal.x + dp(s, 18) + i * (starW + cardGap), by, starW, dp(s, 50)};
            bool highlighted = breakdown[i].first == s->completionStars;
            r.roundedRect(card.x, card.y, card.w, card.h, dp(s, 8), highlighted ? rgba(255, 180, 90, 0.34f) : rgba(229, 236, 245, 0.16f));
            r.roundedRect(card.x + 1.0f, card.y + 1.0f, card.w - 2.0f, card.h - 2.0f, dp(s, 7),
                          highlighted ? rgba(62, 45, 28, 0.70f) : rgba(10, 13, 19, 0.58f));
            drawStars(s, card.x + dp(s, 7), card.y + dp(s, 8), dp(s, 7.2f), breakdown[i].first, 3, 0, 0.95f);
            r.text(breakdown[i].second, card.x + dp(s, 7), card.y + dp(s, 28), dp(s, 1.55f), TEXT);
        }
        by += dp(s, 66);
        if (g.mode != "daily") {
            drawButton(s, {modal.x + dp(s, 18), by, modal.w - dp(s, 36), dp(s, 44)}, g.mode == "campaign" ? "Next Level" : "New Puzzle", Action::Next, 0, true);
            by += dp(s, 54);
        } else {
            drawButton(s, {modal.x + dp(s, 18), by, modal.w - dp(s, 36), dp(s, 44)}, "Leaderboard", Action::Leaderboard, dailyTierIndex(g.dailyTier), true);
            by += dp(s, 54);
        }
        drawButton(s, {modal.x + dp(s, 18), by, modal.w - dp(s, 36), dp(s, 44)}, "Replay", Action::Replay);
        by += dp(s, 54);
        std::string dismissLabel = g.mode == "campaign" ? "Campaign" : (g.mode == "daily" ? "Daily" : "Menu");
        drawButton(s, {modal.x + dp(s, 18), by, modal.w - dp(s, 36), dp(s, 44)}, dismissLabel, Action::Dismiss);
    }

    if (s->dailyExitConfirm) {
        r.rect(0, 0, r.width, r.height, rgba(0, 0, 0, 0.68f));
        addButton(s, {0.0f, 0.0f, static_cast<float>(r.width), static_cast<float>(r.height)}, Action::CancelDailyExit, 0, true);
        float modalW = r.width - dp(s, 36);
        float modalH = dp(s, 276);
        Rect modal{dp(s, 18), (r.height - modalH) * 0.5f, modalW, modalH};
        modal.y = std::max(safeTop(s) + dp(s, 18), std::min(modal.y, r.height - safeBottom(s) - modalH - dp(s, 18)));
        r.glow(modal, dp(s, 18), rgba(255, 180, 90, 0.12f), 8);
        r.roundedRect(modal.x, modal.y, modal.w, modal.h, dp(s, 8), rgba(255, 180, 90, 0.32f));
        r.roundedRect(modal.x + 1.2f, modal.y + 1.2f, modal.w - 2.4f, modal.h - 2.4f, dp(s, 7), rgba(22, 26, 35, 0.98f));
        r.rectGradient(modal.x + 2.0f, modal.y + 2.0f, modal.w - 4.0f, modal.h * 0.32f, rgba(255, 180, 90, 0.075f), rgba(255, 180, 90, 0.0f));
        r.text("Exit daily challenge?", modal.x + dp(s, 18), modal.y + dp(s, 24), dp(s, 3.05f), TEXT);
        std::vector<std::string> lines = wrapTextLines(
                s,
                "This is your first try. Exiting now records 0 for this daily leaderboard. You can replay afterward, but only this try counts.",
                dp(s, 1.90f),
                modal.w - dp(s, 36));
        float textY = modal.y + dp(s, 68);
        for (const std::string &line : lines) {
            r.text(line, modal.x + dp(s, 18), textY, dp(s, 1.90f), MUTED);
            textY += dp(s, 24);
        }
        float buttonY = modal.y + modal.h - dp(s, 110);
        drawButton(s, {modal.x + dp(s, 18), buttonY, modal.w - dp(s, 36), dp(s, 44)}, "Keep Playing", Action::CancelDailyExit, 0, true);
        drawButton(s, {modal.x + dp(s, 18), buttonY + dp(s, 54), modal.w - dp(s, 36), dp(s, 44)}, "Exit for 0", Action::ConfirmDailyExit);
    }
}

void updateInteractionState(AppState *s) {
    int64_t t = nowMs();
    if (s->previewTile >= 0 && s->previewClearAt > 0 && t >= s->previewClearAt) {
        s->previewTile = -1;
        s->previewClearAt = 0;
        if (s->hintLine == "Previewing this pulse.") s->hintLine.clear();
    }
    if (!s->hintChanged.empty() && t >= s->hintChangedUntil) {
        s->hintChanged.clear();
        s->hintChangedUntil = 0;
    }
    if (!s->pulseTiles.empty() && t >= s->pulseUntil) {
        s->pulseTiles.clear();
        s->pulseUntil = 0;
    }
    if (s->screen == Screen::Game && s->hasSession && s->pressTile >= 0 && !s->longPreviewShown &&
        t - s->downTime >= 380 && isTappable(s->session.puzzle, s->pressTile)) {
        s->previewTile = s->pressTile;
        s->previewClearAt = 0;
        s->longPreviewShown = true;
        s->hintLine = "Previewing this pulse.";
        playSound(s, SoundCue::Preview);
        vibrate(s, 8);
    }
}

void render(AppState *s) {
    if (!s->renderer.ready()) return;
    updateInteractionState(s);
    s->buttons.clear();
    s->renderer.begin();
    drawBackground(s);
    switch (s->screen) {
        case Screen::Main: drawMain(s); break;
        case Screen::Campaign: drawCampaign(s); break;
        case Screen::Freeplay: drawFreeplay(s); break;
        case Screen::Daily: drawDaily(s); break;
        case Screen::HowTo: drawHowTo(s); break;
        case Screen::Math: drawMath(s); break;
        case Screen::Settings: drawSettings(s); break;
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
    c.unique = s->freeUnique;
    c.seed = "free-" + std::to_string(nowMs());
    c.name = c.difficulty + " Custom Level";
    saveFreePrefs(s);
    startGame(s, generatePuzzle(c), "freeplay");
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
        case Action::BackReturn: playSound(s, SoundCue::Ui); go(s, s->returnScreen); break;
        case Action::Campaign: playSound(s, SoundCue::Ui); go(s, Screen::Campaign); break;
        case Action::Freeplay: playSound(s, SoundCue::Ui); go(s, Screen::Freeplay); break;
        case Action::Daily: playSound(s, SoundCue::Ui); go(s, Screen::Daily); break;
        case Action::HowTo: playSound(s, SoundCue::Ui); go(s, Screen::HowTo); break;
        case Action::Math: playSound(s, SoundCue::Ui); go(s, Screen::Math); break;
        case Action::Settings:
            playSound(s, SoundCue::Ui);
            s->returnScreen = s->screen;
            go(s, Screen::Settings);
            break;
        case Action::DailyChallenge:
            playSound(s, SoundCue::Start);
            startDailyChallenge(s, b.value);
            break;
        case Action::Leaderboard:
            playSound(s, SoundCue::Ui);
            playGamesShowLeaderboard(s, clampInt(b.value, 0, 3));
            break;
        case Action::StartCampaign:
            playSound(s, SoundCue::Start);
            s->lastCampaign = b.value;
            startGame(s, createCampaignLevel(b.value), "campaign");
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
        case Action::GuideSize:
            playSound(s, SoundCue::Ui);
            s->guideTextSize = clampInt(b.value, 0, 2);
            s->progress.setInt("setting_guide_text_size", s->guideTextSize);
            break;
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
                s->animations = !s->animations;
                s->progress.setInt("setting_animations", s->animations ? 1 : 0);
            } else if (b.value == 3) {
                playSound(s, SoundCue::Ui);
                s->colorblind = !s->colorblind;
                s->progress.setInt("setting_colorblind", s->colorblind ? 1 : 0);
            } else if (b.value == 4) {
                playSound(s, SoundCue::Ui);
                s->hideNumbers = !s->hideNumbers;
                s->progress.setInt("setting_hide_numbers", s->hideNumbers ? 1 : 0);
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
            if (s->hasSession && !s->session.history.empty() && !s->session.completed) {
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
            if (s->hasSession && !(s->session.mode == "daily" && s->session.leaderboardAttempt)) {
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
            if (s->hasSession && !s->session.completed && !(s->session.mode == "daily" && s->session.leaderboardAttempt)) {
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
                    s->hintChangedUntil = nowMs() + 2600;
                    s->pulseTiles = affected;
                    s->pulseUntil = nowMs() + 280;
                    s->hintLine = "Hint applied. This try is worth 0 stars.";
                    playSound(s, SoundCue::Hint);
                    if (solved(s->session.puzzle, s->session.board)) completeGame(s);
                } else {
                    playSound(s, SoundCue::Invalid);
                    s->hintLine = "No useful move is available.";
                }
            }
            break;
        case Action::Next:
            if (!s->hasSession) break;
            playSound(s, SoundCue::Start);
            if (s->session.mode == "campaign") {
                int next = std::min(299, s->lastCampaign + 1);
                s->lastCampaign = next;
                startGame(s, createCampaignLevel(next), "campaign");
            } else {
                startFreeplay(s);
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
    if (!s->hasSession || s->screen != Screen::Game || s->completion || s->dailyExitConfirm) return -1;
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
    if (!s->hasSession || s->session.completed || s->dailyExitConfirm) return;
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
    if (solved(s->session.puzzle, s->session.board)) completeGame(s);
}

bool scrollable(Screen screen) {
    return screen == Screen::Campaign || screen == Screen::Freeplay || screen == Screen::HowTo ||
           screen == Screen::Daily || screen == Screen::Math || screen == Screen::Settings;
}

void back(AppState *s) {
    if (s->dailyExitConfirm) {
        s->dailyExitConfirm = false;
        return;
    }
    if (s->screen == Screen::Game) {
        requestExitGame(s);
    } else if (s->screen == Screen::Settings) {
        go(s, s->returnScreen);
    } else if (s->screen != Screen::Main) {
        go(s, Screen::Main);
    }
}

int32_t handleInput(android_app *app, AInputEvent *event) {
    AppState *s = static_cast<AppState *>(app->userData);
    if (AInputEvent_getType(event) == AINPUT_EVENT_TYPE_KEY) {
        int key = AKeyEvent_getKeyCode(event);
        int action = AKeyEvent_getAction(event);
        if (key == AKEYCODE_BACK && action == AKEY_EVENT_ACTION_UP) {
            back(s);
            return 1;
        }
        return 0;
    }
    if (AInputEvent_getType(event) != AINPUT_EVENT_TYPE_MOTION) return 0;
    int action = AMotionEvent_getAction(event) & AMOTION_EVENT_ACTION_MASK;
    float x = AMotionEvent_getX(event, 0);
    float y = AMotionEvent_getY(event, 0);
    if (action == AMOTION_EVENT_ACTION_DOWN) {
        s->downX = x;
        s->downY = y;
        s->startScroll = s->scroll;
        s->downTime = nowMs();
        s->dragging = false;
        s->pressTile = tileAt(s, x, y);
        s->longPreviewShown = false;
        if (s->pressTile >= 0 && s->hintLine == "Previewing this pulse.") s->hintLine.clear();
        return 1;
    }
    if (action == AMOTION_EVENT_ACTION_MOVE) {
        float dy = y - s->downY;
        if (std::fabs(dy) > dp(s, 6) && scrollable(s->screen)) {
            s->dragging = true;
            float maxScroll = std::max(0.0f, s->contentHeight - s->renderer.height + safeBottom(s));
            s->scroll = std::max(0.0f, std::min(maxScroll, s->startScroll - dy));
        }
        if (s->pressTile >= 0 && std::hypot(x - s->downX, y - s->downY) > dp(s, 18)) {
            s->pressTile = -1;
            s->longPreviewShown = false;
            if (s->previewClearAt == 0) {
                s->previewTile = -1;
                if (s->hintLine == "Previewing this pulse.") s->hintLine.clear();
            }
        }
        return 1;
    }
    if (action == AMOTION_EVENT_ACTION_UP) {
        if (!s->dragging && std::hypot(x - s->downX, y - s->downY) < dp(s, 12)) {
            for (int i = static_cast<int>(s->buttons.size()) - 1; i >= 0; --i) {
                if (s->buttons[i].rect.contains(x, y)) {
                    s->pressTile = -1;
                    s->longPreviewShown = false;
                    handleAction(s, s->buttons[i]);
                    return 1;
                }
            }
            if (s->longPreviewShown) {
                s->previewClearAt = nowMs() + 220;
                s->pressTile = -1;
                s->longPreviewShown = false;
                return 1;
            }
            int idx = tileAt(s, x, y);
            if (idx >= 0) tapTile(s, idx);
        }
        s->pressTile = -1;
        s->longPreviewShown = false;
        return 1;
    }
    return 0;
}

void handleCmd(android_app *app, int32_t cmd) {
    AppState *s = static_cast<AppState *>(app->userData);
    switch (cmd) {
        case APP_CMD_INIT_WINDOW:
            if (app->window != nullptr) s->renderer.init(app);
            break;
        case APP_CMD_TERM_WINDOW:
            s->renderer.shutdown();
            break;
        case APP_CMD_GAINED_FOCUS:
            break;
        default:
            break;
    }
}

} // namespace

extern "C" void android_main(android_app *app) {
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
    loadPrefs(&state);
    app->userData = &state;
    app->onAppCmd = handleCmd;
    app->onInputEvent = handleInput;
    playGamesSignIn(&state);

    while (true) {
        int events = 0;
        android_poll_source *source = nullptr;
        int timeout = state.renderer.ready() ? 16 : -1;
        while (ALooper_pollOnce(timeout, nullptr, &events, reinterpret_cast<void **>(&source)) >= 0) {
            if (source) source->process(app, source);
            if (app->destroyRequested) {
                state.renderer.shutdown();
                state.audio.shutdown();
                return;
            }
            timeout = 0;
        }
        render(&state);
    }
}
