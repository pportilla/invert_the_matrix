// @ts-nocheck
/*
 * TypeScript source for the static web app.
 * Run `npm run build` from `web-app/` to regenerate `app.js`.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "resonance-grid-progress-v1";

  var PATTERNS = {
    cross: {
      label: "Cross",
      offsets: [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]]
    },
    diagonal: {
      label: "Diagonal",
      offsets: [[0, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]]
    },
    square: {
      label: "Square",
      offsets: [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]
    },
    horizontal: {
      label: "Horizontal line",
      offsets: [[-1, 0], [0, 0], [1, 0]]
    },
    vertical: {
      label: "Vertical line",
      offsets: [[0, -1], [0, 0], [0, 1]]
    },
    self: {
      label: "Self only",
      offsets: [[0, 0]]
    },
    knight: {
      label: "Knight",
      offsets: [[0, 0], [1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]
    }
  };

  var FREE_PATTERNS = ["cross", "diagonal", "square", "horizontal", "vertical", "knight", "randomMixed"];
  var DAILY_TIERS = [
    { key: "easy", label: "Easy", width: 4, height: 4, states: 2, pattern: "cross", difficulty: "Easy", locked: false, irregular: false, unique: true },
    { key: "medium", label: "Medium", width: 5, height: 5, states: 2, pattern: "cross", difficulty: "Medium", locked: true, irregular: true, unique: true },
    { key: "hard", label: "Hard", width: 4, height: 4, states: 3, pattern: "cross", difficulty: "Hard", locked: true, irregular: true, unique: true }
  ];
  var SIZE_OPTIONS = ["3x3", "4x4", "5x5", "6x6", "7x7", "Custom"];
  var STATE_OPTIONS = [2, 3, 4, 5];
  var DIFFICULTIES = ["Easy", "Medium", "Hard", "Expert"];
  var PRIME_STATES = [2, 3, 5];
  var STATE_NUMBERS = ["0", "1", "2", "3", "4"];
  var STATE_SYMBOLS = ["", "*", "+", "^", "#"];
  var PATTERN_BADGES = {
    cross: "+",
    diagonal: "D",
    square: "S",
    horizontal: "H",
    vertical: "V",
    self: "1",
    knight: "K"
  };
  var CHAPTER_TITLES = [
    "Binary Beginnings", "Fourfold Flips", "Locked Lights", "Lockstep Squares", "First Holes",
    "Binary Breakaways", "Fivefold Binary", "Three-Color Start", "Triple Grid", "Triple Locks",
    "Triple Holes", "Triple Combine", "Pattern Primer", "Pattern Locks", "Color Gauntlet",
    "Four-State Start", "Four-State Locks", "Four-State Gaps", "Four-State Patterns", "Four-State Matrix",
    "Five-State Start", "Five-State Locks", "Five-State Gaps", "Five-State Patterns", "Dense Dimensions",
    "Prime Pressure", "Modular Maze", "Wide Matrix", "Endgame Circuit", "Final Inversion"
  ];
  var CAMPAIGN_VERSION = 4;
  var EXACT_BFS_STATE_LIMIT = 500000;
  var EXACT_NULLSPACE_LIMIT = 500000;
  var HINT_COOLDOWN_MS = 500;
  var HINT_COMPLETION_DELAY_MS = 500;

  var DEFAULT_PROGRESS = {
    campaignVersion: CAMPAIGN_VERSION,
    stars: {},
    completed: {},
    hintUsed: {},
    bestMoves: {},
    daily: {},
    settings: {
      sound: true,
      vibration: true,
      animations: true,
      colorblind: false,
      hideNumbers: true,
      guideTextSize: "small"
    },
    freePrefs: {
      size: "5x5",
      customWidth: 5,
      customHeight: 5,
      states: 3,
      pattern: "cross",
      difficulty: "Medium",
      locked: false,
      irregular: false,
      unique: true
    }
  };

  var app = {
    progress: loadProgress(),
    campaignLevels: [],
    screens: {},
    activeScreen: "main",
    returnScreen: "main",
    currentGame: null,
    timerId: null,
    pressTimer: null,
    pressInfo: null,
    lastCampaignIndex: 0,
    audio: null,
    hintMarkTimer: null,
    hintCooldownUntil: 0,
    hintCooldownTimer: null,
    splashTimer: null,
    splashTiles: [],
    splashState: [],
    splashLastTap: -1
  };

  var els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    app.audio = createAudioManager();
    app.campaignLevels = createCampaignLevels();
    cacheElements();
    bindEvents();
    renderFreeplayControls();
    renderCampaign();
    renderDaily();
    syncSettingsUI();
    applySettings();
    showScreen("main");
  }

  function cacheElements() {
    document.querySelectorAll(".screen").forEach(function (screen) {
      app.screens[screen.id.replace("screen-", "")] = screen;
    });

    els.campaignList = document.getElementById("campaign-list");
    els.dailyList = document.getElementById("daily-list");
    els.brandMark = document.querySelector(".brand-mark");
    els.sizeOptions = document.getElementById("size-options");
    els.stateOptions = document.getElementById("state-options");
    els.difficultyOptions = document.getElementById("difficulty-options");
    els.customSize = document.getElementById("custom-size");
    els.customWidth = document.getElementById("custom-width");
    els.customHeight = document.getElementById("custom-height");
    els.patternSelect = document.getElementById("pattern-select");
    els.lockedToggle = document.getElementById("locked-toggle");
    els.irregularToggle = document.getElementById("irregular-toggle");
    els.uniqueToggle = document.getElementById("unique-toggle");
    els.board = document.getElementById("board");
    els.moveCounter = document.getElementById("move-counter");
    els.starRanking = document.getElementById("star-ranking");
    els.timeCounter = document.getElementById("time-counter");
    els.modeLabel = document.getElementById("game-mode-label");
    els.titleLabel = document.getElementById("game-title-label");
    els.patternLabel = document.getElementById("pattern-label");
    els.patternMini = document.getElementById("pattern-mini");
    els.personalBest = document.getElementById("personal-best");
    els.hintLine = document.getElementById("hint-line");
    els.modal = document.getElementById("modal");
    els.modalTitle = document.getElementById("modal-title");
    els.modalStars = document.getElementById("modal-stars");
    els.resultMoves = document.getElementById("result-moves");
    els.resultMinimum = document.getElementById("result-minimum");
    els.resultBest = document.getElementById("result-best");
    els.resultTime = document.getElementById("result-time");
    els.resultStarBreakdown = document.getElementById("result-star-breakdown");
    els.nextLevelButton = document.querySelector('[data-action="next-level"]');
    els.levelSelectButton = document.querySelector('[data-action="level-select"]');
    els.settingSound = document.getElementById("setting-sound");
    els.settingVibration = document.getElementById("setting-vibration");
    els.settingAnimations = document.getElementById("setting-animations");
    els.settingColorblind = document.getElementById("setting-colorblind");
    els.settingNumbers = document.getElementById("setting-numbers");
  }

  function bindEvents() {
    document.addEventListener("pointerdown", function (event) {
      var button = event.target.closest("button");
      if (!button || button.disabled || button.classList.contains("tile")) return;
      vibrate(button.classList.contains("primary-action") ? 10 : 8);
    });

    document.addEventListener("click", function (event) {
      var actionButton = event.target.closest("[data-action]");
      if (!actionButton) return;
      var action = actionButton.getAttribute("data-action");
      handleAction(action, actionButton);
    });

    els.campaignList.addEventListener("click", function (event) {
      var node = event.target.closest("[data-level-id]");
      if (!node || node.disabled) return;
      playSound("start");
      startCampaignLevel(node.getAttribute("data-level-id"));
    });

    els.sizeOptions.addEventListener("click", function (event) {
      var chip = event.target.closest("[data-size]");
      if (!chip) return;
      playSound("ui");
      app.progress.freePrefs.size = chip.getAttribute("data-size");
      saveProgress();
      renderFreeplayControls();
    });

    els.stateOptions.addEventListener("click", function (event) {
      var chip = event.target.closest("[data-states]");
      if (!chip) return;
      playSound("ui");
      app.progress.freePrefs.states = Number(chip.getAttribute("data-states"));
      saveProgress();
      renderFreeplayControls();
    });

    els.difficultyOptions.addEventListener("click", function (event) {
      var chip = event.target.closest("[data-difficulty]");
      if (!chip) return;
      playSound("ui");
      app.progress.freePrefs.difficulty = chip.getAttribute("data-difficulty");
      saveProgress();
      renderFreeplayControls();
    });

    els.patternSelect.addEventListener("change", function () {
      playSound("ui");
      app.progress.freePrefs.pattern = els.patternSelect.value;
      saveProgress();
    });

    [els.customWidth, els.customHeight].forEach(function (input) {
      input.addEventListener("change", updateCustomSize);
      input.addEventListener("input", updateCustomSize);
    });

    [els.lockedToggle, els.irregularToggle, els.uniqueToggle].forEach(function (input) {
      input.addEventListener("change", function () {
        playSound("ui");
        app.progress.freePrefs.locked = els.lockedToggle.checked;
        app.progress.freePrefs.irregular = els.irregularToggle.checked;
        app.progress.freePrefs.unique = els.uniqueToggle.checked;
        saveProgress();
      });
    });

    [els.settingSound, els.settingVibration, els.settingAnimations, els.settingColorblind, els.settingNumbers].forEach(function (input) {
      input.addEventListener("change", updateSettingsFromUI);
    });

    els.board.addEventListener("pointerdown", handlePointerDown);
    els.board.addEventListener("pointerup", handlePointerUp);
    els.board.addEventListener("pointerleave", cancelPress);
    els.board.addEventListener("pointercancel", cancelPress);
    els.board.addEventListener("click", handleBoardClick);
    els.board.addEventListener("contextmenu", function (event) {
      event.preventDefault();
    });
  }

  function handleAction(action, button) {
    if (action !== "hint" && action !== "undo" && action !== "reset") {
      playSound("ui");
    }
    if (action === "show-main") showScreen("main");
    if (action === "show-campaign") {
      renderCampaign();
      showScreen("campaign");
    }
    if (action === "show-freeplay") {
      renderFreeplayControls();
      showScreen("freeplay");
    }
    if (action === "show-daily") {
      renderDaily();
      showScreen("daily");
    }
    if (action === "show-howto") {
      showScreen("howto");
      typesetMath();
    }
    if (action === "show-math") {
      showScreen("math");
      typesetMath();
    }
    if (action === "guide-size") setGuideTextSize(button.getAttribute("data-guide-size"));
    if (action === "show-settings") openSettings();
    if (action === "close-settings") showScreen(app.returnScreen || "main");
    if (action === "generate-freeplay") startFreeplay();
    if (action === "start-daily") startDaily(button.getAttribute("data-daily-tier"));
    if (action === "exit-game") exitGame();
    if (action === "undo") undoMove();
    if (action === "reset") resetGame();
    if (action === "hint") showHint();
    if (action === "next-level") startNextLevel(button);
    if (action === "replay") replayGame();
    if (action === "level-select") leaveCompletionModal();
  }

  function showScreen(name) {
    Object.keys(app.screens).forEach(function (key) {
      app.screens[key].classList.toggle("is-active", key === name);
    });
    app.activeScreen = name;
  }

  function typesetMath() {
    if (!window.MathJax || !window.MathJax.typesetPromise) return;
    var targets = [];
    if (app.screens.howto) targets.push(app.screens.howto);
    if (app.screens.math) targets.push(app.screens.math);
    if (!targets.length) return;
    window.MathJax.typesetPromise(targets).catch(function () {});
  }

  function openSettings() {
    app.returnScreen = app.activeScreen;
    syncSettingsUI();
    showScreen("settings");
  }

  function loadProgress() {
    var stored = null;
    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (error) {
      stored = null;
    }
    var storedCampaignVersion = stored && stored.campaignVersion;
    var progress = deepMerge(clone(DEFAULT_PROGRESS), stored || {});
    if (storedCampaignVersion !== CAMPAIGN_VERSION) resetCampaignProgress(progress);
    return progress;
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(app.progress));
  }

  function resetCampaignProgress(progress) {
    ["stars", "completed", "hintUsed", "bestMoves"].forEach(function (bucket) {
      Object.keys(progress[bucket] || {}).forEach(function (key) {
        if (/^c\d+-\d+$/.test(key)) delete progress[bucket][key];
      });
    });
    progress.campaignVersion = CAMPAIGN_VERSION;
  }

  function deepMerge(target, source) {
    Object.keys(source).forEach(function (key) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    });
    return target;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function syncSettingsUI() {
    var settings = app.progress.settings;
    els.settingSound.checked = settings.sound;
    els.settingVibration.checked = settings.vibration;
    els.settingAnimations.checked = settings.animations;
    els.settingColorblind.checked = settings.colorblind;
    els.settingNumbers.checked = !Boolean(settings.hideNumbers);
  }

  function updateSettingsFromUI() {
    var soundWasOff = !app.progress.settings.sound;
    var vibrationWasOff = !app.progress.settings.vibration;
    app.progress.settings.sound = els.settingSound.checked;
    app.progress.settings.vibration = els.settingVibration.checked;
    app.progress.settings.animations = els.settingAnimations.checked;
    app.progress.settings.colorblind = els.settingColorblind.checked;
    app.progress.settings.hideNumbers = !els.settingNumbers.checked;
    saveProgress();
    applySettings();
    renderBoard();
    if (soundWasOff && app.progress.settings.sound) playSound("ui");
    if (vibrationWasOff && app.progress.settings.vibration) vibrate(10);
  }

  function applySettings() {
    var guideSize = normalizeGuideTextSize(app.progress.settings.guideTextSize);
    document.body.classList.toggle("hide-numbers", Boolean(app.progress.settings.hideNumbers));
    document.body.classList.toggle("colorblind", app.progress.settings.colorblind);
    document.body.classList.toggle("reduced-motion", !app.progress.settings.animations);
    document.body.classList.toggle("guide-size-medium", guideSize === "medium");
    document.body.classList.toggle("guide-size-large", guideSize === "large");
    syncGuideSizeControls();
    startSplashBoard();
  }

  function normalizeGuideTextSize(size) {
    return size === "medium" || size === "large" ? size : "small";
  }

  function setGuideTextSize(size) {
    app.progress.settings.guideTextSize = normalizeGuideTextSize(size);
    saveProgress();
    applySettings();
    typesetMath();
  }

  function syncGuideSizeControls() {
    var size = normalizeGuideTextSize(app.progress.settings.guideTextSize);
    document.querySelectorAll('[data-action="guide-size"]').forEach(function (button) {
      var selected = button.getAttribute("data-guide-size") === size;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function startSplashBoard() {
    var rng = makeRng("splash-" + Date.now());
    if (app.splashTimer) {
      window.clearInterval(app.splashTimer);
      app.splashTimer = null;
    }
    if (!els.brandMark) return;

    app.splashTiles = Array.prototype.slice.call(els.brandMark.querySelectorAll("span"));
    if (!app.splashTiles.length) return;

    app.splashState = app.splashTiles.map(function () {
      return 0;
    });
    app.splashLastTap = -1;

    for (var i = 0; i < 7; i += 1) {
      applySplashMove(randomSplashTap(rng));
    }
    renderSplashBoard([], -1);

    if (!app.progress.settings.animations) return;

    app.splashTimer = window.setInterval(function () {
      var tapIndex = randomSplashTap(rng);
      var affected = applySplashMove(tapIndex);
      renderSplashBoard(affected, tapIndex);
    }, 620);
  }

  function randomSplashTap(rng) {
    var tapIndex = randomInt(0, 24, rng);
    if (tapIndex === app.splashLastTap) {
      tapIndex = (tapIndex + randomInt(1, 24, rng)) % 25;
    }
    app.splashLastTap = tapIndex;
    return tapIndex;
  }

  function applySplashMove(tapIndex) {
    var affected = getSplashAffectedIndexes(tapIndex);
    affected.forEach(function (index) {
      app.splashState[index] = (app.splashState[index] + 1) % 4;
    });
    return affected;
  }

  function getSplashAffectedIndexes(tapIndex) {
    var width = 5;
    var row = Math.floor(tapIndex / width);
    var col = tapIndex % width;
    return PATTERNS.cross.offsets.reduce(function (affected, offset) {
      var nextCol = col + offset[0];
      var nextRow = row + offset[1];
      if (nextCol >= 0 && nextCol < width && nextRow >= 0 && nextRow < width) {
        affected.push(nextRow * width + nextCol);
      }
      return affected;
    }, []);
  }

  function renderSplashBoard(changedIndexes, tapIndex) {
    var changed = new Set(changedIndexes || []);
    app.splashTiles.forEach(function (tile, index) {
      tile.classList.remove(
        "splash-state-0",
        "splash-state-1",
        "splash-state-2",
        "splash-state-3",
        "is-splash-pulse",
        "is-splash-tap"
      );
      tile.classList.add("splash-state-" + app.splashState[index]);
    });

    if (!changed.size || !app.progress.settings.animations) return;

    void app.splashTiles[changedIndexes[0]].offsetWidth;
    changed.forEach(function (index) {
      app.splashTiles[index].classList.add("is-splash-pulse");
    });
    if (tapIndex >= 0 && app.splashTiles[tapIndex]) {
      app.splashTiles[tapIndex].classList.add("is-splash-tap");
    }
  }

  function renderFreeplayControls() {
    var prefs = app.progress.freePrefs;

    els.sizeOptions.innerHTML = SIZE_OPTIONS.map(function (size) {
      return chipHtml(size, "data-size", size, prefs.size === size);
    }).join("");
    els.customSize.hidden = prefs.size !== "Custom";
    els.customWidth.value = prefs.customWidth;
    els.customHeight.value = prefs.customHeight;

    els.stateOptions.innerHTML = STATE_OPTIONS.map(function (stateCount) {
      return chipHtml(stateCount + " states", "data-states", stateCount, prefs.states === stateCount);
    }).join("");

    els.difficultyOptions.innerHTML = DIFFICULTIES.map(function (difficulty) {
      return chipHtml(difficulty, "data-difficulty", difficulty, prefs.difficulty === difficulty);
    }).join("");

    els.patternSelect.innerHTML = FREE_PATTERNS.map(function (key) {
      var label = patternDisplayName(key);
      return '<option value="' + key + '">' + label + '</option>';
    }).join("");
    els.patternSelect.value = prefs.pattern;
    els.lockedToggle.checked = prefs.locked;
    els.irregularToggle.checked = prefs.irregular;
    els.uniqueToggle.checked = prefs.unique;
  }

  function chipHtml(label, attr, value, selected) {
    return '<button class="chip' + (selected ? " is-selected" : "") + '" ' + attr + '="' + value + '" role="radio" aria-checked="' + (selected ? "true" : "false") + '">' + label + '</button>';
  }

  function patternDisplayName(key) {
    return key === "randomMixed" ? "Random mixed" : (PATTERNS[key] ? PATTERNS[key].label : "Cross");
  }

  function updateCustomSize() {
    app.progress.freePrefs.customWidth = clamp(Number(els.customWidth.value) || 5, 3, 9);
    app.progress.freePrefs.customHeight = clamp(Number(els.customHeight.value) || 5, 3, 9);
    els.customWidth.value = app.progress.freePrefs.customWidth;
    els.customHeight.value = app.progress.freePrefs.customHeight;
    saveProgress();
  }

  function createCampaignLevels() {
    var levels = [];
    for (var chapter = 1; chapter <= 30; chapter += 1) {
      for (var levelInChapter = 1; levelInChapter <= 10; levelInChapter += 1) {
        levels.push(generateCampaignLevel(chapter, levelInChapter, levels.length));
      }
    }
    return levels;
  }

  function generateCampaignLevel(chapter, levelInChapter, index) {
    var config = campaignLevelConfig(chapter, levelInChapter);
    var fallback = null;

    for (var attempt = 0; attempt < 48; attempt += 1) {
      var rng = makeRng("campaign-" + chapter + "-" + levelInChapter + "-" + attempt);
      var puzzle = createGeneratedShell(config, rng);
      var board = blankBoard(puzzle);
      var tappable = tappableIndexes(puzzle);
      if (!tappable.length) continue;

      var scrambleLength = campaignScrambleMoveCount(config, chapter, levelInChapter, activeIndexes(puzzle).length, rng);
      var solutionCounts = {};
      var previousTap = -1;

      for (var move = 0; move < scrambleLength; move += 1) {
        var tap = randomItem(tappable, rng);
        var guard = 0;
        while (tap === previousTap && tappable.length > 1 && guard < 8) {
          tap = randomItem(tappable, rng);
          guard += 1;
        }
        previousTap = tap;
        applyPulse(puzzle, board, tap);
        solutionCounts[tap] = mod((solutionCounts[tap] || 0) - 1, puzzle.states);
      }

      var knownMoves = sumObjectValues(solutionCounts);
      if (isSolved(puzzle, board) || knownMoves < config.minimumKnownMoves) continue;
      if (!solutionSolves(puzzle, board, solutionCounts)) continue;

      fallback = makeCampaignLevelFromPuzzle(puzzle, board, solutionCounts, config, chapter, levelInChapter, index);
      if (knownMoves >= config.preferredKnownMoves) return fallback;
    }

    return fallback || generateSimpleCampaignFallback(chapter, levelInChapter, index);
  }

  function campaignLevelConfig(chapter, levelInChapter) {
    var sizes = [5];
    var states = 2;
    var difficulty = "Easy";
    var locked = false;
    var irregular = false;

    if (chapter === 1) {
      sizes = [3];
    } else if (chapter === 2) {
      sizes = [4];
    } else if (chapter === 3) {
      sizes = [3];
      locked = true;
    } else if (chapter === 4) {
      sizes = [4];
      locked = true;
      difficulty = "Medium";
    } else if (chapter === 5) {
      sizes = [3, 4];
      irregular = true;
      difficulty = "Medium";
    } else if (chapter === 6) {
      sizes = [3, 4];
      locked = true;
      irregular = true;
      difficulty = "Medium";
    } else if (chapter === 7) {
      sizes = [5];
      locked = true;
      irregular = true;
      difficulty = "Hard";
    } else if (chapter === 8) {
      sizes = [3];
      states = 3;
    } else if (chapter === 9) {
      sizes = [4];
      states = 3;
      difficulty = "Medium";
    } else if (chapter === 10) {
      sizes = [3];
      states = 3;
      locked = true;
      difficulty = "Medium";
    } else if (chapter === 11) {
      sizes = [3, 4];
      states = 3;
      irregular = true;
      difficulty = "Medium";
    } else if (chapter === 12) {
      sizes = [3, 4];
      states = 3;
      locked = true;
      irregular = true;
      difficulty = "Hard";
    } else if (chapter === 13) {
      sizes = [4];
      states = 3;
      difficulty = "Hard";
    } else if (chapter === 14) {
      sizes = [4, 5];
      states = 3;
      locked = true;
      difficulty = "Hard";
    } else if (chapter === 15) {
      sizes = [5, 6];
      states = 3;
      locked = true;
      irregular = true;
      difficulty = "Hard";
    } else if (chapter === 16) {
      sizes = [3];
      states = 4;
      difficulty = "Medium";
    } else if (chapter === 17) {
      sizes = [4];
      states = 4;
      locked = true;
      difficulty = "Hard";
    } else if (chapter === 18) {
      sizes = [4, 5];
      states = 4;
      locked = true;
      irregular = true;
      difficulty = "Hard";
    } else if (chapter === 19) {
      sizes = [5];
      states = 4;
      difficulty = "Hard";
    } else if (chapter === 20) {
      sizes = [5, 6];
      states = 4;
      locked = true;
      irregular = true;
      difficulty = "Expert";
    } else if (chapter === 21) {
      sizes = [3];
      states = 5;
      difficulty = "Hard";
    } else if (chapter === 22) {
      sizes = [4];
      states = 5;
      locked = true;
      difficulty = "Hard";
    } else if (chapter === 23) {
      sizes = [4, 5];
      states = 5;
      locked = true;
      irregular = true;
      difficulty = "Expert";
    } else if (chapter === 24) {
      sizes = [5, 6];
      states = 5;
      locked = true;
      irregular = true;
      difficulty = "Expert";
    } else if (chapter === 25) {
      sizes = [6, 7];
      states = 3;
      locked = true;
      irregular = true;
      difficulty = "Expert";
    } else if (chapter === 26) {
      sizes = [6, 7];
      states = 4;
      locked = true;
      irregular = true;
      difficulty = "Expert";
    } else if (chapter === 27) {
      sizes = [5, 6, 7];
      states = 5;
      locked = true;
      irregular = true;
      difficulty = "Expert";
    } else if (chapter === 28) {
      sizes = [7, 8];
      states = campaignOptionAt([3, 4, 5, 3, 4, 5, 4, 5, 3, 5], levelInChapter);
      locked = true;
      irregular = true;
      difficulty = "Expert";
    } else if (chapter === 29) {
      sizes = [8, 9];
      states = campaignOptionAt([4, 5, 3, 4, 5, 3, 5, 4, 5, 5], levelInChapter);
      locked = true;
      irregular = true;
      difficulty = "Expert";
    } else {
      sizes = [9];
      states = campaignOptionAt([3, 4, 5, 4, 5, 5, 4, 5, 5, 5], levelInChapter);
      locked = true;
      irregular = true;
      difficulty = "Expert";
    }

    var size = campaignOptionAt(sizes, levelInChapter);
    var width = size;
    var height = size;
    var pattern = campaignPatternForChapter(chapter, levelInChapter);
    var minimumKnownMoves = campaignMinimumKnownMoves(width, height, states, locked, irregular, pattern, difficulty, chapter, levelInChapter);
    var preferredKnownMoves = campaignPreferredKnownMoves(minimumKnownMoves, width, states, locked, irregular, pattern, levelInChapter);

    return {
      width: width,
      height: height,
      states: states,
      pattern: pattern,
      difficulty: difficulty,
      locked: locked,
      irregular: irregular,
      unique: false,
      minimumKnownMoves: minimumKnownMoves,
      preferredKnownMoves: preferredKnownMoves
    };
  }

  function campaignOptionAt(options, levelInChapter) {
    return options[(levelInChapter - 1) % options.length];
  }

  function campaignPatternForChapter(chapter, levelInChapter) {
    if (chapter <= 12) return "cross";
    if (chapter === 13) return campaignOptionAt(["diagonal", "horizontal", "vertical"], levelInChapter);
    if (chapter === 14) return levelInChapter % 4 === 0 ? "square" : (levelInChapter % 2 ? "diagonal" : "cross");
    if (chapter === 15) return levelInChapter % 3 === 0 ? "randomMixed" : campaignOptionAt(["cross", "diagonal", "square", "horizontal", "vertical"], levelInChapter);
    if (chapter <= 18) return "cross";
    if (chapter === 19) return campaignOptionAt(["horizontal", "vertical", "square", "diagonal"], levelInChapter);
    if (chapter === 20) return levelInChapter % 2 ? "randomMixed" : campaignOptionAt(["cross", "diagonal", "square"], levelInChapter);
    if (chapter <= 23) return "cross";
    if (chapter === 24) return levelInChapter % 2 ? "randomMixed" : campaignOptionAt(["diagonal", "horizontal", "vertical", "square"], levelInChapter);
    return levelInChapter % 3 === 0 ? "randomMixed" : campaignOptionAt(["cross", "diagonal", "square", "horizontal", "vertical", "knight"], levelInChapter);
  }

  function campaignMinimumKnownMoves(width, height, states, locked, irregular, pattern, difficulty, chapter, levelInChapter) {
    var featurePressure = (locked ? 0.45 : 0) + (irregular ? 0.65 : 0) + (pattern !== "cross" ? 0.45 : 0) + (pattern === "randomMixed" ? 0.7 : 0);
    var statePressure = Math.max(0, states - 2) * 0.75 + (states >= 5 ? 0.4 : 0);
    var sizePressure = (width * height - 9) * 0.025;
    var chapterPressure = Math.max(0, chapter - 1) * 0.055;
    var levelPressure = (levelInChapter - 1) * 0.13;
    var floorByDifficulty = difficulty === "Expert" ? 5 : difficulty === "Hard" ? 4 : difficulty === "Medium" ? 3 : 2;
    return Math.max(floorByDifficulty, Math.min(12, Math.floor(1.55 + featurePressure + statePressure + sizePressure + chapterPressure + levelPressure)));
  }

  function campaignPreferredKnownMoves(minimumKnownMoves, width, states, locked, irregular, pattern, levelInChapter) {
    var spread = 1 + Math.floor((levelInChapter - 1) / 3);
    if (width >= 5) spread += 1;
    if (locked && irregular) spread += 1;
    if (states >= 4) spread += 1;
    if (pattern === "randomMixed") spread += 1;
    return Math.min(18, minimumKnownMoves + spread);
  }

  function campaignScrambleMoveCount(config, chapter, levelInChapter, activeCount, rng) {
    var ratio = clamp(0.16 + chapter * 0.012 - Math.max(0, config.states - 2) * 0.018, 0.14, 0.64);
    var base = Math.floor(activeCount * ratio);
    var featureBonus = (config.locked ? 1 : 0) + (config.irregular ? 1 : 0) + (config.pattern !== "cross" ? 1 : 0) + (config.pattern === "randomMixed" ? 1 : 0);
    var stateBonus = config.states === 2 ? 1 : 0;
    var jitter = randomInt(0, Math.max(1, Math.floor(activeCount * 0.06)), rng);
    return Math.max(config.preferredKnownMoves, base + stateBonus + featureBonus + Math.floor(levelInChapter * 0.38) + jitter);
  }

  function makeCampaignLevelFromPuzzle(puzzle, board, solutionCounts, config, chapter, levelInChapter, index) {
    var title = CHAPTER_TITLES[chapter - 1] || "Inversion";
    var solverPlan = exactSolverPlan(puzzle, board, solutionCounts);
    var minimumMoves = Math.max(1, solverPlan.moveCount);
    return Object.assign(puzzle, {
      levelId: "c" + chapter + "-" + levelInChapter,
      campaignIndex: index,
      chapter: chapter,
      name: title + " " + levelInChapter,
      initialState: board,
      knownSolution: normalizeSolution(solverPlan.tapCounts, puzzle.states),
      minimumMoves: minimumMoves,
      targetMoves: minimumMoves + Math.max(2, Math.ceil(activeIndexes(puzzle).length * 0.16)),
      difficultyRating: rateDifficulty(puzzle, minimumMoves)
    });
  }

  function generateSimpleCampaignFallback(chapter, levelInChapter, index) {
    var config = Object.assign({}, campaignLevelConfig(chapter, levelInChapter));
    var rng = makeRng("campaign-fallback-" + chapter + "-" + levelInChapter);
    var puzzle = createGeneratedShell(config, rng);
    var board = blankBoard(puzzle);
    var tappable = tappableIndexes(puzzle);
    var solutionCounts = {};
    var previousTap = -1;
    for (var move = 0; move < config.preferredKnownMoves && tappable.length; move += 1) {
      var tap = randomItem(tappable, rng);
      var guard = 0;
      while (tap === previousTap && tappable.length > 1 && guard < 8) {
        tap = randomItem(tappable, rng);
        guard += 1;
      }
      previousTap = tap;
      applyPulse(puzzle, board, tap);
      solutionCounts[tap] = mod((solutionCounts[tap] || 0) - 1, puzzle.states);
    }
    if ((isSolved(puzzle, board) || !solutionSolves(puzzle, board, solutionCounts)) && tappable.length) {
      applyPulse(puzzle, board, tappable[0]);
      solutionCounts[tappable[0]] = mod((solutionCounts[tappable[0]] || 0) - 1, puzzle.states);
    }
    return makeCampaignLevelFromPuzzle(puzzle, board, solutionCounts, config, chapter, levelInChapter, index);
  }

  function buildLevel(spec, index) {
    var puzzle = createPuzzleShell({
      width: spec.w,
      height: spec.h,
      states: spec.states,
      defaultPattern: spec.defaultPattern || "cross",
      locked: coordsToIndexes(spec.locked || [], spec.w),
      disabled: coordsToIndexes(spec.disabled || [], spec.w),
      specials: spec.specials || []
    });
    var board = blankBoard(puzzle);
    var solutionCounts = {};

    (spec.scramble || []).forEach(function (coord) {
      var tapIndex = indexFor(coord[0], coord[1], puzzle.width);
      if (!isTappable(puzzle, tapIndex)) return;
      applyPulse(puzzle, board, tapIndex);
      solutionCounts[tapIndex] = mod((solutionCounts[tapIndex] || 0) - 1, puzzle.states);
    });

    var solve = solvePuzzle(puzzle, board);
    var knownMoves = sumObjectValues(solutionCounts);
    var minimumMoves = solve && solve.exists && solve.exactMinimum ? solve.moveCount : knownMoves;
    if (!minimumMoves) minimumMoves = Math.max(1, Math.ceil(activeIndexes(puzzle).length * 0.25));

    var level = Object.assign(puzzle, {
      levelId: spec.id,
      campaignIndex: index,
      chapter: spec.chapter,
      name: spec.name,
      initialState: board,
      knownSolution: solve && solve.exists && solve.exactMinimum ? solve.tapCounts : solutionCounts,
      minimumMoves: minimumMoves,
      targetMoves: minimumMoves + Math.max(1, Math.ceil(activeIndexes(puzzle).length * 0.18)),
      difficultyRating: rateDifficulty(puzzle, minimumMoves)
    });
    return level;
  }

  function createPuzzleShell(config) {
    var width = config.width;
    var height = config.height;
    var disabledSet = new Set(config.disabled || []);
    var lockedSet = new Set(config.locked || []);
    var tilePatterns = {};

    (config.specials || []).forEach(function (special) {
      var idx = Array.isArray(special.at) ? indexFor(special.at[0], special.at[1], width) : special.at;
      if (!disabledSet.has(idx)) tilePatterns[idx] = special.pattern;
    });

    return {
      width: width,
      height: height,
      states: config.states,
      defaultPattern: config.defaultPattern || "cross",
      locked: lockedSet,
      disabled: disabledSet,
      tilePatterns: tilePatterns
    };
  }

  function renderCampaign() {
    if (!app.campaignLevels.length) {
      els.campaignList.innerHTML = '<section class="empty-state"><h3>No campaign levels found</h3><p>The campaign could not be prepared. Reload the app to rebuild the level list.</p></section>';
      return;
    }

    var chapters = range(30).map(function (_, index) {
      return campaignChapterMeta(index + 1);
    });

    els.campaignList.innerHTML = chapters.map(function (chapter) {
      var levels = app.campaignLevels.filter(function (level) {
        return level.chapter === chapter.id;
      });
      return '<section class="chapter"><h3>' + chapter.title + '</h3><div class="level-grid">' +
        levels.map(renderLevelNode).join("") +
        '</div></section>';
    }).join("");
  }

  function renderDaily() {
    if (!els.dailyList) return;
    if (!DAILY_TIERS.length) {
      els.dailyList.innerHTML = '<section class="empty-state"><h3>No daily puzzles available</h3><p>Daily puzzles are generated from the current date. Reload the app to try again.</p></section>';
      return;
    }
    var dateKey = getDailyDateKey();
    els.dailyList.innerHTML = DAILY_TIERS.map(function (tier) {
      return renderDailyCard(tier, dateKey);
    }).join("");
  }

  function renderDailyCard(tier, dateKey) {
    var record = dailyRecordFor(dateKey, tier.key);
    var completed = Boolean(record && record.completed);
    var stars = completed ? clamp(Number(record.stars) || 0, 0, 3) : 0;
    var configLine = tier.width + "x" + tier.height + " | " + tier.states + " states | " + patternDisplayName(tier.pattern);
    var detailLine = [
      tier.locked ? "Locks on" : "Locks off",
      tier.irregular ? "Holes on" : "Holes off"
    ].join(" / ");
    var recordLine = completed
      ? "Best " + record.moves + " moves | " + formatSeconds(record.time || 0)
      : "Not played today";
    var aria = tier.label + " daily challenge, " + configLine + ", " + detailLine + ", " + (completed ? recordLine : "not completed today");
    return '<button class="daily-card daily-card-' + tier.key + (completed ? " is-complete" : "") + '" data-action="start-daily" data-daily-tier="' + tier.key + '" aria-label="' + escapeAttribute(aria) + '">' +
      '<span class="daily-card-top">' +
        '<strong class="daily-tier-label">' + escapeAttribute(tier.label) + '</strong>' +
      '</span>' +
      '<span class="daily-card-meta">' +
        '<span>' + escapeAttribute(configLine) + '</span>' +
        '<span>' + escapeAttribute(detailLine) + '</span>' +
      '</span>' +
      '<span class="daily-card-record"><span class="level-stars" aria-hidden="true">' + renderStarIcons(stars) + '</span><span>' + escapeAttribute(recordLine) + '</span></span>' +
    '</button>';
  }

  function dailyRecordFor(dateKey, tierKey) {
    if (!app.progress.daily) return null;
    var current = app.progress.daily[dailyChallengeKey(dateKey, tierKey)];
    if (current) return current;
    return tierKey === "medium" ? app.progress.daily[dateKey] : null;
  }

  function campaignChapterMeta(chapter) {
    var title = CHAPTER_TITLES[chapter - 1] || "Inversion";
    return {
      id: chapter,
      title: "Chapter " + chapter + ": " + title
    };
  }

  function renderLevelNode(level) {
    var unlocked = isCampaignLevelUnlocked(level.campaignIndex);
    var stars = app.progress.stars[level.levelId] || 0;
    var completed = isCampaignLevelCompleted(level.levelId);
    var hintUsed = isCampaignHintMarked(level.levelId);
    return '<button class="level-node" data-level-id="' + level.levelId + '"' + (unlocked ? "" : " disabled") +
      ' aria-label="' + levelSelectAriaLabel(level, stars, completed, unlocked, hintUsed) + '">' +
      (completed ? '<span class="level-check" aria-hidden="true">' + renderCheckIcon() + '</span>' : "") +
      (completed && hintUsed ? '<span class="level-hint-eye" aria-hidden="true">' + renderEyeIcon() + '</span>' : "") +
      '<span class="level-number">' + (level.campaignIndex + 1) + '</span>' +
      '<span class="level-stars" aria-hidden="true">' + renderStarIcons(stars) + '</span>' +
      '</button>';
  }

  function isCampaignLevelUnlocked(index) {
    if (index === 0) return true;
    var level = app.campaignLevels[index];
    if (level && isCampaignLevelCompleted(level.levelId)) return true;
    return Boolean(app.campaignLevels[index - 1] && isCampaignLevelCompleted(app.campaignLevels[index - 1].levelId));
  }

  function isCampaignLevelCompleted(levelId) {
    return Boolean((app.progress.completed && app.progress.completed[levelId]) || (app.progress.stars && app.progress.stars[levelId] > 0));
  }

  function isCampaignHintMarked(levelId) {
    return Boolean(app.progress.hintUsed && app.progress.hintUsed[levelId]);
  }

  function startCampaignLevel(levelId) {
    var level = app.campaignLevels.find(function (item) {
      return item.levelId === levelId;
    });
    if (!level) return;
    app.lastCampaignIndex = level.campaignIndex;
    startGame(levelToGame(level, "campaign"));
  }

  function levelToGame(level, mode) {
    return {
      mode: mode,
      levelId: level.levelId,
      campaignIndex: level.campaignIndex,
      name: level.name,
      width: level.width,
      height: level.height,
      states: level.states,
      defaultPattern: level.defaultPattern,
      locked: new Set(Array.from(level.locked)),
      disabled: new Set(Array.from(level.disabled)),
      tilePatterns: Object.assign({}, level.tilePatterns),
      initialState: level.initialState.slice(),
      board: level.initialState.slice(),
      knownSolution: Object.assign({}, level.knownSolution || {}),
      remainingSolution: normalizeSolution(level.knownSolution || {}, level.states),
      minimumMoves: level.minimumMoves,
      targetMoves: level.targetMoves,
      difficultyRating: level.difficultyRating,
      moves: 0,
      history: [],
      hintLevel: 0,
      hint: null,
      usedHint: false,
      completed: false,
      hintCompletionPending: false,
      startedAt: Date.now(),
      elapsedSeconds: 0
    };
  }

  function startFreeplay() {
    updateCustomSize();
    playSound("start");
    var prefs = app.progress.freePrefs;
    var dims = parseSizePreference(prefs);
    var seed = "free-" + Date.now() + "-" + Math.random();
    var level = generatePuzzle({
      width: dims.width,
      height: dims.height,
      states: prefs.states,
      pattern: prefs.pattern,
      difficulty: prefs.difficulty,
      locked: prefs.locked,
      irregular: prefs.irregular,
      unique: prefs.unique,
      seed: seed,
      name: prefs.difficulty + " Custom Level"
    });
    startGame(levelToGeneratedGame(level, "freeplay"));
  }

  function startDaily(tierKey) {
    playSound("start");
    var tier = dailyTierByKey(tierKey);
    var dateKey = getDailyDateKey();
    var level = generatePuzzle({
      width: tier.width,
      height: tier.height,
      states: tier.states,
      pattern: tier.pattern,
      difficulty: tier.difficulty,
      locked: tier.locked,
      irregular: tier.irregular,
      unique: tier.unique,
      seed: "daily-" + dateKey + "-" + tier.key,
      name: "Daily " + tier.label + " " + formatDailyDate(dateKey),
      dailyKey: dailyChallengeKey(dateKey, tier.key)
    });
    var game = levelToGeneratedGame(level, "daily");
    game.dailyKey = dailyChallengeKey(dateKey, tier.key);
    game.dailyTier = tier.key;
    startGame(game);
  }

  function dailyTierByKey(tierKey) {
    return DAILY_TIERS.find(function (tier) {
      return tier.key === tierKey;
    }) || DAILY_TIERS[1];
  }

  function levelToGeneratedGame(level, mode) {
    return {
      mode: mode,
      levelId: level.levelId,
      name: level.name,
      width: level.width,
      height: level.height,
      states: level.states,
      defaultPattern: level.defaultPattern,
      locked: new Set(Array.from(level.locked)),
      disabled: new Set(Array.from(level.disabled)),
      tilePatterns: Object.assign({}, level.tilePatterns),
      initialState: level.initialState.slice(),
      board: level.initialState.slice(),
      knownSolution: Object.assign({}, level.knownSolution || {}),
      remainingSolution: normalizeSolution(level.knownSolution || {}, level.states),
      minimumMoves: level.minimumMoves,
      targetMoves: level.targetMoves,
      difficultyRating: level.difficultyRating,
      moves: 0,
      history: [],
      hintLevel: 0,
      hint: null,
      usedHint: false,
      completed: false,
      hintCompletionPending: false,
      startedAt: Date.now(),
      elapsedSeconds: 0
    };
  }

  function parseSizePreference(prefs) {
    if (prefs.size === "Custom") {
      return {
        width: clamp(Number(prefs.customWidth) || 5, 3, 9),
        height: clamp(Number(prefs.customHeight) || 5, 3, 9)
      };
    }
    var parts = prefs.size.split("x").map(Number);
    return { width: parts[0], height: parts[1] };
  }

  function generatePuzzle(config) {
    var rng = makeRng(config.seed || "resonance");
    var best = null;
    var attempts = config.unique && PRIME_STATES.indexOf(config.states) !== -1 ? 18 : 8;

    for (var attempt = 0; attempt < attempts; attempt += 1) {
      var puzzle = createGeneratedShell(config, rng);
      var board = blankBoard(puzzle);
      var tappable = tappableIndexes(puzzle);
      if (!tappable.length) continue;

      var scrambleLength = scrambleMoveCount(config.difficulty, activeIndexes(puzzle).length, config.states, rng);
      var solutionCounts = {};
      var previousTap = -1;

      for (var move = 0; move < scrambleLength; move += 1) {
        var tap = randomItem(tappable, rng);
        var guard = 0;
        while (tap === previousTap && tappable.length > 1 && guard < 8) {
          tap = randomItem(tappable, rng);
          guard += 1;
        }
        previousTap = tap;
        applyPulse(puzzle, board, tap);
        solutionCounts[tap] = mod((solutionCounts[tap] || 0) - 1, puzzle.states);
      }

      if (isSolved(puzzle, board)) continue;
      if (!solutionSolves(puzzle, board, solutionCounts)) continue;

      var solve = solvePuzzle(puzzle, board);
      var knownMoves = sumObjectValues(solutionCounts);
      var minimumMoves = solve && solve.exists && solve.exactMinimum ? solve.moveCount : knownMoves;
      if (config.difficulty !== "Easy" && minimumMoves < 3) continue;
      if (config.unique && solve && solve.exists && !solve.unique && attempt < attempts - 3) continue;

      best = Object.assign(puzzle, {
        levelId: "generated-" + (config.seed || Date.now()),
        name: config.name || "Custom Level",
        initialState: board,
        knownSolution: solve && solve.exists && solve.exactMinimum ? solve.tapCounts : solutionCounts,
        minimumMoves: minimumMoves || Math.max(1, knownMoves),
        targetMoves: (minimumMoves || knownMoves) + Math.max(2, Math.ceil(activeIndexes(puzzle).length * 0.16)),
        difficultyRating: rateDifficulty(puzzle, minimumMoves || knownMoves)
      });
      break;
    }

    if (best) return best;

    return generatePuzzle(Object.assign({}, config, {
      unique: false,
      locked: false,
      irregular: false,
      seed: (config.seed || "fallback") + "-fallback"
    }));
  }

  function createGeneratedShell(config, rng) {
    var width = config.width;
    var height = config.height;
    var total = width * height;
    var disabled = [];
    var locked = [];
    var specials = [];
    var defaultPattern = config.pattern === "randomMixed" ? "cross" : config.pattern;

    if (config.irregular) {
      var maxHoles = Math.max(1, Math.floor(total * difficultyRatio(config.difficulty) * 0.16));
      var holeCount = randomInt(1, maxHoles, rng);
      var candidates = range(total).filter(function (idx) {
        var pos = positionFor(idx, width);
        return !(pos.x === Math.floor(width / 2) && pos.y === Math.floor(height / 2));
      });
      shuffle(candidates, rng);
      disabled = candidates.slice(0, Math.min(holeCount, total - 6));
    }

    var active = range(total).filter(function (idx) {
      return disabled.indexOf(idx) === -1;
    });

    if (config.locked) {
      var maxLocked = Math.max(1, Math.floor(active.length * difficultyRatio(config.difficulty) * 0.18));
      var lockedCount = randomInt(1, maxLocked, rng);
      var lockedCandidates = active.slice();
      shuffle(lockedCandidates, rng);
      locked = lockedCandidates.slice(0, Math.min(lockedCount, active.length - 3));
    }

    if (config.pattern === "randomMixed") {
      var patternKeys = ["cross", "diagonal", "horizontal", "vertical", "square", "knight"];
      var specialCount = Math.max(2, Math.floor(active.length * difficultyRatio(config.difficulty) * 0.35));
      var specialCandidates = active.filter(function (idx) {
        return locked.indexOf(idx) === -1;
      });
      shuffle(specialCandidates, rng);
      specialCandidates.slice(0, specialCount).forEach(function (idx) {
        specials.push({ at: idx, pattern: randomItem(patternKeys, rng) });
      });
    }

    return createPuzzleShell({
      width: width,
      height: height,
      states: config.states,
      defaultPattern: defaultPattern,
      disabled: disabled,
      locked: locked,
      specials: specials
    });
  }

  function scrambleMoveCount(difficulty, activeCount, states, rng) {
    var base = {
      Easy: 0.32,
      Medium: 0.58,
      Hard: 0.88,
      Expert: 1.18
    }[difficulty] || 0.58;
    base = Math.max(0.22, base - Math.max(0, states - 2) * 0.06);
    var jitter = randomInt(0, Math.max(2, Math.floor(activeCount * 0.18)), rng);
    return Math.max(2, Math.floor(activeCount * base) + (states === 2 ? 1 : 0) + jitter);
  }

  function difficultyRatio(difficulty) {
    return {
      Easy: 0.45,
      Medium: 0.7,
      Hard: 0.9,
      Expert: 1
    }[difficulty] || 0.7;
  }

  function startGame(game) {
    stopTimer();
    clearHintMark(false);
    clearHintCooldown();
    app.currentGame = game;
    els.modal.hidden = true;
    els.modeLabel.textContent = modeLabel(game.mode);
    els.titleLabel.textContent = game.name;
    els.hintLine.textContent = "";
    showScreen("game");
    renderPatternIndicator(game);
    renderBoard();
    updateCounters();
    startTimer();
  }

  function modeLabel(mode) {
    if (mode === "campaign") return "Campaign";
    if (mode === "daily") return "Daily";
    return "Custom Level";
  }

  function startTimer() {
    if (!app.currentGame) return;
    app.currentGame.startedAt = Date.now();
    app.currentGame.elapsedSeconds = 0;
    updateCounters();
    app.timerId = window.setInterval(function () {
      if (!app.currentGame || app.currentGame.completed) return;
      app.currentGame.elapsedSeconds = Math.floor((Date.now() - app.currentGame.startedAt) / 1000);
      updateCounters();
    }, 1000);
  }

  function stopTimer() {
    if (app.timerId) window.clearInterval(app.timerId);
    app.timerId = null;
  }

  function updateCounters() {
    if (!app.currentGame) return;
    els.moveCounter.textContent = String(app.currentGame.moves);
    els.starRanking.innerHTML = renderStatusStarRanking(app.currentGame);
    els.timeCounter.textContent = formatSeconds(app.currentGame.elapsedSeconds || 0);
    if (els.personalBest) els.personalBest.textContent = personalBestText(app.currentGame);
    var hintCompletionPending = Boolean(app.currentGame.hintCompletionPending);
    var undoButton = document.querySelector('[data-action="undo"]');
    if (undoButton) undoButton.disabled = hintCompletionPending || !app.currentGame.history.length;
    var resetButton = document.querySelector('[data-action="reset"]');
    if (resetButton) resetButton.disabled = hintCompletionPending || app.currentGame.completed;
    var hintButton = document.querySelector('[data-action="hint"]');
    if (hintButton) hintButton.disabled = hintCompletionPending || app.currentGame.completed || Date.now() < app.hintCooldownUntil;
  }

  function renderPatternIndicator(game) {
    if (!els.patternLabel || !els.patternMini) return;
    var defaultKey = game.defaultPattern || "cross";
    var pattern = PATTERNS[defaultKey] || PATTERNS.cross;
    var specialCount = Object.keys(game.tilePatterns || {}).length;
    els.patternLabel.textContent = specialCount ? "Mixed" : pattern.label;

    var maxDistance = pattern.offsets.reduce(function (max, offset) {
      return Math.max(max, Math.abs(offset[0]), Math.abs(offset[1]));
    }, 1);
    var size = Math.max(3, maxDistance * 2 + 1);
    var center = Math.floor(size / 2);
    var active = new Set(pattern.offsets.map(function (offset) {
      return (center + offset[0]) + "," + (center + offset[1]);
    }));

    els.patternMini.style.gridTemplateColumns = "repeat(" + size + ", minmax(0, 1fr))";
    var miniHtml = range(size * size).map(function (_, index) {
      var x = index % size;
      var y = Math.floor(index / size);
      var classes = ["pattern-dot"];
      if (active.has(x + "," + y)) classes.push("is-active");
      if (x === center && y === center) classes.push("is-center");
      return '<span class="' + classes.join(" ") + '"></span>';
    }).join("");

    if (specialCount) {
      miniHtml += '<div class="pattern-legend">' + patternLegendHtml(game) + '</div>';
    }
    els.patternMini.innerHTML = miniHtml;
  }

  function patternLegendHtml(game) {
    var keys = [game.defaultPattern || "cross"].concat(Object.keys(game.tilePatterns || {}).map(function (idx) {
      return game.tilePatterns[idx];
    }));
    var unique = [];
    keys.forEach(function (key) {
      if (unique.indexOf(key) === -1) unique.push(key);
    });
    return unique.map(function (key) {
      var pattern = PATTERNS[key] || PATTERNS.cross;
      return '<span><b>' + (PATTERN_BADGES[key] || "?") + '</b>' + pattern.label + '</span>';
    }).join("");
  }

  function renderBoard(pulsedIndexes) {
    var game = app.currentGame;
    if (!game || !els.board) return;

    els.board.style.gridTemplateColumns = "repeat(" + game.width + ", minmax(0, 1fr))";
    els.board.style.setProperty("--board-ratio", game.width + " / " + game.height);
    els.board.style.setProperty("--board-ratio-number", String(game.width / game.height));

    var previewSet = new Set(game.hint && game.hint.preview ? game.hint.preview : []);
    var hintSet = new Set(game.hint && game.hint.highlight ? game.hint.highlight : []);
    var hintAffectedSet = new Set(game.hint && game.hint.affected ? game.hint.affected : []);
    var suggestedIndex = game.hint && game.hint.suggested;
    var changedSet = new Set(game.changedByHint || []);
    var pulseSet = new Set(pulsedIndexes || []);
    var showSolution = game.hint && game.hint.solution;

    var html = [];
    for (var y = 0; y < game.height; y += 1) {
      for (var x = 0; x < game.width; x += 1) {
        var idx = indexFor(x, y, game.width);
        if (game.disabled.has(idx)) {
          html.push('<div class="hole" aria-hidden="true"></div>');
          continue;
        }
        var state = game.board[idx] || 0;
        var classes = ["tile", "state-" + state];
        if (game.locked.has(idx)) classes.push("locked");
        if (previewSet.has(idx)) classes.push("preview");
        if (hintSet.has(idx)) classes.push("hint");
        if (hintAffectedSet.has(idx)) classes.push("hint-affected");
        if (suggestedIndex === idx) classes.push("hint-suggested");
        if (changedSet.has(idx)) classes.push("hint-changed");
        if (pulseSet.has(idx)) classes.push("pulsed");
        if (showSolution) classes.push("solution");

        var patternKey = game.tilePatterns[idx] || game.defaultPattern || "cross";
        var pattern = PATTERNS[patternKey] || PATTERNS.cross;
        var patternBadge = PATTERN_BADGES[patternKey] || "?";
        var patternMark = game.tilePatterns[idx] ? '<span class="pattern-badge" aria-hidden="true">' + patternBadge + '</span>' : "";
        var solutionValue = showSolution ? (game.hint.solution[idx] || 0) : "";
        var lockMark = game.locked.has(idx) ? '<span class="lock-badge" aria-hidden="true"><svg class="lock-mark" viewBox="0 0 24 24"><path class="lock-shackle" d="M7.25 10.25V8.1a4.75 4.75 0 0 1 9.5 0v2.15"></path><rect class="lock-body" x="5.25" y="10.25" width="13.5" height="10" rx="2.6"></rect><path class="lock-key" d="M12 14.2v2.45"></path></svg></span>' : "";
        var ariaLabel = "Row " + (y + 1) + ", column " + (x + 1) + ", state " + state + ", " + pattern.label + " pattern" + (game.locked.has(idx) ? ", locked" : "");
        html.push(
          '<button class="' + classes.join(" ") + '" data-index="' + idx + '" data-number="' + STATE_NUMBERS[state] + '" data-symbol="' + STATE_SYMBOLS[state] + '" data-solution="' + solutionValue + '" aria-label="' + ariaLabel + '"' + (game.locked.has(idx) ? ' aria-disabled="true"' : "") + '>' +
          patternMark +
          lockMark +
          '</button>'
        );
      }
    }
    els.board.innerHTML = html.join("");
  }

  function handlePointerDown(event) {
    var tile = event.target.closest(".tile");
    if (!tile || !app.currentGame || app.currentGame.hintCompletionPending) return;
    var index = Number(tile.getAttribute("data-index"));
    if (els.board.setPointerCapture && event.pointerId !== undefined) {
      try {
        els.board.setPointerCapture(event.pointerId);
      } catch (error) {
        // Some browsers refuse capture for synthetic pointer events.
      }
    }
    app.pressInfo = { index: index, longPress: false };
    window.clearTimeout(app.pressTimer);
    app.pressTimer = window.setTimeout(function () {
      if (!app.pressInfo || app.pressInfo.index !== index) return;
      app.pressInfo.longPress = true;
      previewPulse(index);
      vibrate(8);
    }, 380);
  }

  function handlePointerUp(event) {
    var tile = event.target.closest(".tile");
    if (!app.pressInfo) {
      cancelPress();
      return;
    }
    var index = tile ? Number(tile.getAttribute("data-index")) : app.pressInfo.index;
    var pressIndex = app.pressInfo.index;
    var wasLongPress = app.pressInfo.longPress;
    if (els.board.releasePointerCapture && event.pointerId !== undefined) {
      try {
        els.board.releasePointerCapture(event.pointerId);
      } catch (error) {
        // Capture may already be released if the pointer was cancelled.
      }
    }
    cancelPress(false);
    if (index !== pressIndex) {
      clearPreview();
      return;
    }
    if (wasLongPress) {
      window.setTimeout(clearPreview, 220);
      return;
    }
    tapTile(index);
  }

  function handleBoardClick(event) {
    if (event.detail !== 0) return;
    if (app.currentGame && app.currentGame.hintCompletionPending) return;
    var tile = event.target.closest(".tile");
    if (!tile) return;
    tapTile(Number(tile.getAttribute("data-index")));
  }

  function cancelPress(clear) {
    window.clearTimeout(app.pressTimer);
    app.pressTimer = null;
    if (clear !== false) clearPreview();
    app.pressInfo = null;
  }

  function previewPulse(index) {
    var game = app.currentGame;
    if (!game || game.hintCompletionPending || !isTappable(game, index)) {
      playSound("invalid");
      return;
    }
    game.hint = { preview: getAffectedIndexes(game, index), highlight: [index] };
    els.hintLine.textContent = "Previewing this pulse.";
    renderBoard();
    playSound("preview");
  }

  function clearPreview() {
    var game = app.currentGame;
    if (!game) return;
    if (game.hint && !game.hint.solution && !game.hint.fromHint) {
      game.hint = null;
      els.hintLine.textContent = "";
      renderBoard();
    }
  }

  function tapTile(index) {
    var game = app.currentGame;
    if (!game || game.completed || game.hintCompletionPending) return;
    var clearedMark = clearHintMark(false);
    if (!isTappable(game, index)) {
      if (clearedMark) renderBoard();
      playSound("invalid");
      vibrate(16);
      return;
    }
    var affected = getAffectedIndexes(game, index);
    game.history.push(snapshotGameState(game));
    applyPulse(game, game.board, index);
    decrementRemainingSolution(game, index);
    game.moves += 1;
    game.hintLevel = 0;
    game.hint = null;
    els.hintLine.textContent = "";
    renderBoard(affected);
    updateCounters();
    playSound("pulse", { state: game.board[index] || 0, states: game.states, affected: affected.length });
    vibrate(6);
    if (isSolved(game, game.board)) {
      window.setTimeout(completeGame, app.progress.settings.animations ? 360 : 20);
    }
  }

  function undoMove() {
    var game = app.currentGame;
    if (!game || game.completed || game.hintCompletionPending) return;
    clearHintMark(false);
    if (!game.history.length) {
      playSound("invalid");
      return;
    }
    var previous = game.history.pop();
    restoreGameState(game, previous);
    game.moves = Math.max(0, game.moves - 1);
    game.hintLevel = 0;
    game.hint = null;
    els.hintLine.textContent = "";
    renderBoard();
    updateCounters();
    playSound("undo");
  }

  function resetGame() {
    var game = app.currentGame;
    if (!game || game.completed || game.hintCompletionPending) return;
    clearHintMark(false);
    game.hintCompletionPending = false;
    game.board = game.initialState.slice();
    game.remainingSolution = normalizeSolution(game.knownSolution || {}, game.states);
    game.moves = 0;
    game.history = [];
    game.hintLevel = 0;
    game.hint = null;
    game.startedAt = Date.now();
    game.elapsedSeconds = 0;
    els.hintLine.textContent = "";
    renderBoard();
    updateCounters();
    playSound("reset");
  }

  function showHint() {
    var game = app.currentGame;
    if (!game || game.completed || game.hintCompletionPending) return;
    if (Date.now() < app.hintCooldownUntil) return;
    beginHintCooldown();
    clearHintMark(false);
    var solve = solvePuzzle(game, game.board);
    var tapIndex = nextTapFromKnownSolution(game);

    if ((tapIndex === null || tapIndex === undefined) && solve && solve.exists) {
      tapIndex = Object.keys(solve.tapCounts).map(Number).find(function (idx) {
        return solve.tapCounts[idx] > 0 && isTappable(game, idx);
      });
    }

    if (tapIndex === null || tapIndex === undefined) {
      tapIndex = firstActiveTile(game);
    }

    if (tapIndex === null || tapIndex === undefined || !isTappable(game, tapIndex)) {
      playSound("invalid");
      els.hintLine.textContent = "No useful move is available.";
      return;
    }

    applyHintMove(tapIndex);
  }

  function applyHintMove(tapIndex) {
    var game = app.currentGame;
    if (!game || game.completed) return;
    var affected = getAffectedIndexes(game, tapIndex);
    game.history.push(snapshotGameState(game));
    applyPulse(game, game.board, tapIndex);
    decrementRemainingSolution(game, tapIndex);
    game.moves += 1;
    game.usedHint = true;
    game.hintLevel = 0;
    game.hint = null;
    game.changedByHint = affected;
    var solvedByHint = isSolved(game, game.board);
    if (solvedByHint) game.hintCompletionPending = true;
    els.hintLine.textContent = "Hint applied. Red tiles changed. This try is worth 0 stars.";
    renderBoard(affected);
    updateCounters();
    playSound("hint");
    vibrate(10);
    scheduleHintMarkClear(game);
    if (solvedByHint) {
      window.setTimeout(function () {
        if (app.currentGame !== game) return;
        game.hintCompletionPending = false;
        if (isSolved(game, game.board)) completeGame();
        else updateCounters();
      }, HINT_COMPLETION_DELAY_MS);
    }
  }

  function beginHintCooldown() {
    app.hintCooldownUntil = Date.now() + HINT_COOLDOWN_MS;
    if (app.hintCooldownTimer) window.clearTimeout(app.hintCooldownTimer);
    app.hintCooldownTimer = window.setTimeout(function () {
      app.hintCooldownTimer = null;
      updateCounters();
    }, HINT_COOLDOWN_MS);
    updateCounters();
  }

  function clearHintCooldown() {
    if (app.hintCooldownTimer) window.clearTimeout(app.hintCooldownTimer);
    app.hintCooldownTimer = null;
    app.hintCooldownUntil = 0;
  }

  function scheduleHintMarkClear(game) {
    if (app.hintMarkTimer) window.clearTimeout(app.hintMarkTimer);
    app.hintMarkTimer = window.setTimeout(function () {
      if (app.currentGame !== game || !game.changedByHint) return;
      game.changedByHint = null;
      app.hintMarkTimer = null;
      renderBoard();
    }, 1000);
  }

  function clearHintMark(shouldRender) {
    if (app.hintMarkTimer) {
      window.clearTimeout(app.hintMarkTimer);
      app.hintMarkTimer = null;
    }
    var game = app.currentGame;
    if (!game || !game.changedByHint) return false;
    game.changedByHint = null;
    if (shouldRender) renderBoard();
    return true;
  }

  function snapshotGameState(game) {
    return {
      board: game.board.slice(),
      remainingSolution: Object.assign({}, game.remainingSolution || {})
    };
  }

  function restoreGameState(game, snapshot) {
    if (Array.isArray(snapshot)) {
      game.board = snapshot;
      game.remainingSolution = normalizeSolution(game.knownSolution || {}, game.states);
      return;
    }
    game.board = snapshot.board.slice();
    game.remainingSolution = Object.assign({}, snapshot.remainingSolution || {});
  }

  function normalizeSolution(solution, states) {
    var normalized = {};
    Object.keys(solution || {}).forEach(function (key) {
      var count = mod(Number(solution[key]) || 0, states);
      if (count) normalized[key] = count;
    });
    return normalized;
  }

  function decrementRemainingSolution(game, tapIndex) {
    if (!game.remainingSolution) game.remainingSolution = {};
    var next = mod((game.remainingSolution[tapIndex] || 0) - 1, game.states);
    if (next) {
      game.remainingSolution[tapIndex] = next;
    } else {
      delete game.remainingSolution[tapIndex];
    }
  }

  function nextTapFromKnownSolution(game) {
    var solution = game.remainingSolution || {};
    return Object.keys(solution).map(Number).find(function (idx) {
      return solution[idx] > 0 && isTappable(game, idx);
    });
  }

  function usefulRegion(game, tapIndex) {
    if (tapIndex === null || tapIndex === undefined) {
      return activeIndexes(game).filter(function (idx) {
        return game.board[idx] !== 0;
      }).slice(0, 4);
    }
    return getAffectedIndexes(game, tapIndex).filter(function (idx) {
      return game.board[idx] !== 0 || idx === tapIndex;
    }).slice(0, 5);
  }

  function firstActiveTile(game) {
    var active = activeIndexes(game).filter(function (idx) {
      return game.board[idx] !== 0 && isTappable(game, idx);
    });
    if (active.length) return active[0];
    var tappable = tappableIndexes(game);
    return tappable.length ? tappable[0] : null;
  }

  function completeGame() {
    var game = app.currentGame;
    if (!game || game.completed) return;
    game.hintCompletionPending = false;
    game.completed = true;
    game.elapsedSeconds = Math.floor((Date.now() - game.startedAt) / 1000);
    stopTimer();

    var stars = calculateStars(game);
    var best = game.moves;
    var usedHint = Boolean(game.usedHint);

    if (game.mode === "campaign") {
      var oldStars = app.progress.stars[game.levelId] || 0;
      var oldBest = app.progress.bestMoves[game.levelId];
      app.progress.completed[game.levelId] = true;
      app.progress.stars[game.levelId] = Math.max(oldStars, stars);
      if (!usedHint && (oldBest === undefined || game.moves < oldBest)) app.progress.bestMoves[game.levelId] = game.moves;
      if (stars > oldStars && !usedHint) {
        app.progress.hintUsed[game.levelId] = false;
      } else if (oldStars <= 0 && stars <= 0) {
        app.progress.hintUsed[game.levelId] = usedHint;
      }
      best = app.progress.bestMoves[game.levelId];
      if (best === undefined) best = usedHint ? "-" : game.moves;
      saveProgress();
      renderCampaign();
    }

    if (game.mode === "freeplay") {
      var freeBest = app.progress.bestMoves[game.levelId];
      if (!usedHint && (freeBest === undefined || game.moves < freeBest)) {
        app.progress.bestMoves[game.levelId] = game.moves;
      }
      best = app.progress.bestMoves[game.levelId];
      if (best === undefined) best = usedHint ? "-" : game.moves;
      saveProgress();
    }

    if (game.mode === "daily") {
      var previous = app.progress.daily[game.dailyKey];
      var dailyRecord = {
        completed: true,
        moves: game.moves,
        time: game.elapsedSeconds,
        stars: stars,
        hintUsed: usedHint
      };
      if (isBetterDailyRecord(dailyRecord, previous)) {
        app.progress.daily[game.dailyKey] = dailyRecord;
      }
      best = app.progress.daily[game.dailyKey].moves;
      saveProgress();
      renderDaily();
    }

    updateCounters();

    els.modalTitle.textContent = game.mode === "daily" ? "Daily Complete" : "Level Complete";
    els.modalStars.setAttribute("aria-label", stars + " out of 3 stars earned");
    els.modalStars.innerHTML = '<span class="star-icons modal-star-icons" aria-hidden="true">' + renderStarIcons(stars) + '</span>';
    els.resultMoves.textContent = String(game.moves);
    els.resultMinimum.textContent = String(game.minimumMoves || "-");
    els.resultBest.textContent = String(best);
    els.resultTime.textContent = formatSeconds(game.elapsedSeconds);
    els.resultStarBreakdown.innerHTML = renderStarThresholds(game, false, stars);
    els.nextLevelButton.hidden = game.mode === "daily";
    els.nextLevelButton.disabled = game.mode === "daily";
    els.nextLevelButton.textContent = game.mode === "freeplay" ? "New Puzzle" : "Next Level";
    els.levelSelectButton.textContent = game.mode === "campaign" ? "Campaign" : (game.mode === "daily" ? "Daily" : "Menu");
    els.modal.hidden = false;
    playSound("win", { stars: stars });
  }

  function calculateStars(game) {
    if (game.usedHint) return 0;
    var thresholds = starThresholds(game);
    if (game.moves <= thresholds[0].max) return 3;
    if (game.moves <= thresholds[1].max) return 2;
    if (game.moves <= thresholds[2].max) return 1;
    return 0;
  }

  function isBetterDailyRecord(candidate, previous) {
    if (!previous) return true;
    if (candidate.hintUsed && !previous.hintUsed) return false;
    if (!candidate.hintUsed && previous.hintUsed) return true;
    if ((candidate.stars || 0) !== (previous.stars || 0)) return (candidate.stars || 0) > (previous.stars || 0);
    if (candidate.moves !== previous.moves) return candidate.moves < previous.moves;
    return candidate.time < previous.time;
  }

  function startNextLevel(button) {
    if (button && button.disabled) return;
    var game = app.currentGame;
    els.modal.hidden = true;
    if (!game) return;
    if (game.mode === "campaign") {
      var next = app.campaignLevels[game.campaignIndex + 1];
      if (next && isCampaignLevelUnlocked(next.campaignIndex)) {
        startCampaignLevel(next.levelId);
      } else {
        showScreen("campaign");
      }
      return;
    }
    if (game.mode === "freeplay") {
      startFreeplay();
    }
  }

  function replayGame() {
    var game = app.currentGame;
    if (!game) return;
    els.modal.hidden = true;
    game.board = game.initialState.slice();
    game.moves = 0;
    game.history = [];
    game.hintLevel = 0;
    game.hint = null;
    game.remainingSolution = normalizeSolution(game.knownSolution || {}, game.states);
    game.usedHint = false;
    game.completed = false;
    game.hintCompletionPending = false;
    game.startedAt = Date.now();
    game.elapsedSeconds = 0;
    startGame(game);
  }

  function leaveCompletionModal() {
    els.modal.hidden = true;
    if (!app.currentGame) {
      showScreen("main");
      return;
    }
    if (app.currentGame.mode === "campaign") {
      showScreen("campaign");
    } else if (app.currentGame.mode === "daily") {
      renderDaily();
      showScreen("daily");
    } else {
      showScreen("main");
    }
  }

  function exitGame() {
    stopTimer();
    clearHintMark(false);
    clearHintCooldown();
    els.modal.hidden = true;
    var mode = app.currentGame && app.currentGame.mode;
    app.currentGame = null;
    if (mode === "campaign") {
      renderCampaign();
      showScreen("campaign");
    } else if (mode === "daily") {
      renderDaily();
      showScreen("daily");
    } else {
      showScreen("main");
    }
  }

  function coordsToIndexes(coords, width) {
    return coords.map(function (coord) {
      return Array.isArray(coord) ? indexFor(coord[0], coord[1], width) : coord;
    });
  }

  function blankBoard(puzzle) {
    return range(puzzle.width * puzzle.height).map(function (idx) {
      return puzzle.disabled.has(idx) ? 0 : 0;
    });
  }

  function indexFor(x, y, width) {
    return y * width + x;
  }

  function positionFor(index, width) {
    return {
      x: index % width,
      y: Math.floor(index / width)
    };
  }

  function isInside(puzzle, x, y) {
    return x >= 0 && y >= 0 && x < puzzle.width && y < puzzle.height;
  }

  function isTappable(puzzle, index) {
    return index !== null && index !== undefined && !puzzle.disabled.has(index) && !puzzle.locked.has(index);
  }

  function activeIndexes(puzzle) {
    return range(puzzle.width * puzzle.height).filter(function (idx) {
      return !puzzle.disabled.has(idx);
    });
  }

  function tappableIndexes(puzzle) {
    return activeIndexes(puzzle).filter(function (idx) {
      return !puzzle.locked.has(idx);
    });
  }

  function getAffectedIndexes(puzzle, tapIndex) {
    if (tapIndex === null || tapIndex === undefined || puzzle.disabled.has(tapIndex)) return [];
    var pos = positionFor(tapIndex, puzzle.width);
    var patternKey = puzzle.tilePatterns[tapIndex] || puzzle.defaultPattern || "cross";
    var pattern = PATTERNS[patternKey] || PATTERNS.cross;
    var affected = [];

    pattern.offsets.forEach(function (offset) {
      var x = pos.x + offset[0];
      var y = pos.y + offset[1];
      if (!isInside(puzzle, x, y)) return;
      var idx = indexFor(x, y, puzzle.width);
      if (!puzzle.disabled.has(idx)) affected.push(idx);
    });

    return affected;
  }

  function applyPulse(puzzle, board, tapIndex) {
    getAffectedIndexes(puzzle, tapIndex).forEach(function (idx) {
      board[idx] = mod((board[idx] || 0) + 1, puzzle.states);
    });
  }

  function solutionSolves(puzzle, board, solutionCounts) {
    var testBoard = board.slice();
    Object.keys(solutionCounts || {}).forEach(function (key) {
      var tapIndex = Number(key);
      var count = mod(Number(solutionCounts[key]) || 0, puzzle.states);
      for (var step = 0; step < count; step += 1) {
        applyPulse(puzzle, testBoard, tapIndex);
      }
    });
    return isSolved(puzzle, testBoard);
  }

  function isSolved(puzzle, board) {
    return activeIndexes(puzzle).every(function (idx) {
      return board[idx] === 0;
    });
  }

  function solvePuzzle(puzzle, board) {
    var exactStateSpace = boardStateSpace(puzzle, EXACT_BFS_STATE_LIMIT);
    if (exactStateSpace > 0) {
      return solveByBreadthFirstSearch(puzzle, board, exactStateSpace);
    }
    if (PRIME_STATES.indexOf(puzzle.states) === -1) {
      return { exists: false, exactMinimum: false };
    }
    return solveByGaussianElimination(puzzle, board);
  }

  function exactSolverPlan(puzzle, board, fallbackCounts) {
    var solve = solvePuzzle(puzzle, board);
    if (solve && solve.exists && solve.exactMinimum) {
      return { tapCounts: solve.tapCounts, moveCount: solve.moveCount };
    }
    return { tapCounts: fallbackCounts, moveCount: sumObjectValues(fallbackCounts) };
  }

  function boardStateSpace(puzzle, limit) {
    var total = 1;
    var active = activeIndexes(puzzle).length;
    for (var i = 0; i < active; i += 1) {
      total *= puzzle.states;
      if (total > limit) return 0;
    }
    return total;
  }

  function solveByGaussianElimination(puzzle, board) {
    var k = puzzle.states;
    var active = activeIndexes(puzzle);
    var tappable = tappableIndexes(puzzle);
    var rowForIndex = {};
    active.forEach(function (idx, row) {
      rowForIndex[idx] = row;
    });

    var matrix = active.map(function (idx) {
      var row = new Array(tappable.length + 1).fill(0);
      row[tappable.length] = mod(-board[idx], k);
      return row;
    });

    tappable.forEach(function (tapIndex, col) {
      getAffectedIndexes(puzzle, tapIndex).forEach(function (affectedIndex) {
        var row = rowForIndex[affectedIndex];
        if (row !== undefined) {
          matrix[row][col] = mod(matrix[row][col] + 1, k);
        }
      });
    });

    var pivotColumns = [];
    var pivotRow = 0;

    for (var colIndex = 0; colIndex < tappable.length && pivotRow < active.length; colIndex += 1) {
      var found = -1;
      for (var searchRow = pivotRow; searchRow < active.length; searchRow += 1) {
        if (mod(matrix[searchRow][colIndex], k) !== 0) {
          found = searchRow;
          break;
        }
      }
      if (found === -1) continue;

      var tmp = matrix[pivotRow];
      matrix[pivotRow] = matrix[found];
      matrix[found] = tmp;

      var inv = modularInverse(matrix[pivotRow][colIndex], k);
      for (var normalizeCol = colIndex; normalizeCol <= tappable.length; normalizeCol += 1) {
        matrix[pivotRow][normalizeCol] = mod(matrix[pivotRow][normalizeCol] * inv, k);
      }

      for (var eliminateRow = 0; eliminateRow < active.length; eliminateRow += 1) {
        if (eliminateRow === pivotRow) continue;
        var factor = matrix[eliminateRow][colIndex];
        if (factor === 0) continue;
        for (var eliminateCol = colIndex; eliminateCol <= tappable.length; eliminateCol += 1) {
          matrix[eliminateRow][eliminateCol] = mod(matrix[eliminateRow][eliminateCol] - factor * matrix[pivotRow][eliminateCol], k);
        }
      }

      pivotColumns[pivotRow] = colIndex;
      pivotRow += 1;
    }

    for (var row = pivotRow; row < active.length; row += 1) {
      var allZero = true;
      for (var c = 0; c < tappable.length; c += 1) {
        if (matrix[row][c] !== 0) {
          allZero = false;
          break;
        }
      }
      if (allZero && matrix[row][tappable.length] !== 0) {
        return { exists: false };
      }
    }

    var vector = new Array(tappable.length).fill(0);
    for (var pivot = 0; pivot < pivotColumns.length; pivot += 1) {
      vector[pivotColumns[pivot]] = matrix[pivot][tappable.length];
    }

    var freeColumns = [];
    for (var free = 0; free < tappable.length; free += 1) {
      if (pivotColumns.indexOf(free) === -1) freeColumns.push(free);
    }

    var exactMinimum = freeColumns.length === 0;
    if (freeColumns.length > 0) {
      var combinations = 1;
      for (var comboSize = 0; comboSize < freeColumns.length; comboSize += 1) {
        combinations *= k;
        if (combinations > EXACT_NULLSPACE_LIMIT) break;
      }
      if (combinations <= EXACT_NULLSPACE_LIMIT) {
        exactMinimum = true;
        var basis = freeColumns.map(function (freeCol) {
          var basisVector = new Array(tappable.length).fill(0);
          basisVector[freeCol] = 1;
          for (var rowIndex = 0; rowIndex < pivotColumns.length; rowIndex += 1) {
            basisVector[pivotColumns[rowIndex]] = mod(-matrix[rowIndex][freeCol], k);
          }
          return basisVector;
        });
        var bestVector = vector.slice();
        var bestMoves = sumArrayValues(bestVector);
        for (var combo = 1; combo < combinations; combo += 1) {
          var cursor = combo;
          var candidate = vector.slice();
          for (var basisIndex = 0; basisIndex < basis.length; basisIndex += 1) {
            var coefficient = cursor % k;
            cursor = Math.floor(cursor / k);
            if (!coefficient) continue;
            for (var vectorColumn = 0; vectorColumn < candidate.length; vectorColumn += 1) {
              candidate[vectorColumn] = mod(candidate[vectorColumn] + coefficient * basis[basisIndex][vectorColumn], k);
            }
          }
          var moves = sumArrayValues(candidate);
          if (moves < bestMoves) {
            bestMoves = moves;
            bestVector = candidate;
          }
        }
        vector = bestVector;
      }
    }

    var tapCounts = {};
    vector.forEach(function (count, vectorIndex) {
      if (count) tapCounts[tappable[vectorIndex]] = count;
    });

    return {
      exists: true,
      vector: vector,
      tapCounts: tapCounts,
      moveCount: sumArrayValues(vector),
      rank: pivotRow,
      unique: pivotRow === tappable.length,
      exactMinimum: exactMinimum
    };
  }

  function solveByBreadthFirstSearch(puzzle, board, maxVisited) {
    var active = activeIndexes(puzzle);
    var tappable = tappableIndexes(puzzle);
    var start = encodeBoard(board, active);
    var goal = active.map(function () { return "0"; }).join("");
    if (start === goal) {
      return { exists: true, tapCounts: {}, moveCount: 0, unique: true, exactMinimum: true };
    }

    var queue = [{ board: board.slice(), counts: {}, depth: 0 }];
    var seen = new Set([start]);

    for (var head = 0; head < queue.length && seen.size < maxVisited; head += 1) {
      var item = queue[head];
      for (var i = 0; i < tappable.length; i += 1) {
        var tap = tappable[i];
        var nextBoard = item.board.slice();
        applyPulse(puzzle, nextBoard, tap);
        var encoded = encodeBoard(nextBoard, active);
        if (seen.has(encoded)) continue;
        var nextCounts = Object.assign({}, item.counts);
        nextCounts[tap] = (nextCounts[tap] || 0) + 1;
        if (encoded === goal) {
          return {
            exists: true,
            tapCounts: nextCounts,
            moveCount: sumObjectValues(nextCounts),
            unique: false,
            exactMinimum: true
          };
        }
        seen.add(encoded);
        queue.push({ board: nextBoard, counts: nextCounts, depth: item.depth + 1 });
      }
    }

    return { exists: false, exactMinimum: seen.size >= maxVisited };
  }

  function sumArrayValues(items) {
    return items.reduce(function (sum, value) {
      return sum + Number(value || 0);
    }, 0);
  }

  function encodeBoard(board, active) {
    return active.map(function (idx) {
      return String(board[idx] || 0);
    }).join("");
  }

  function modularInverse(value, modulus) {
    var normalized = mod(value, modulus);
    for (var i = 1; i < modulus; i += 1) {
      if (mod(normalized * i, modulus) === 1) return i;
    }
    return 1;
  }

  function rateDifficulty(puzzle, minimumMoves) {
    var activeCount = activeIndexes(puzzle).length;
    var lockedCount = puzzle.locked.size;
    var holeCount = puzzle.disabled.size;
    var specialTypes = new Set(Object.keys(puzzle.tilePatterns).map(function (idx) {
      return puzzle.tilePatterns[idx];
    })).size;
    var stateWeight = puzzle.states <= 2 ? 0 : puzzle.states === 3 ? 12 : puzzle.states === 4 ? 16 : 21;
    var score = activeCount * 0.34 + stateWeight + lockedCount * 1.4 + holeCount * 1.2 + specialTypes * 2.2 + (minimumMoves || 0) * 1.15;
    if (score < 17) return "Easy";
    if (score < 30) return "Medium";
    if (score < 45) return "Hard";
    return "Expert";
  }

  function starThresholds(item) {
    var minimum = Math.max(0, Number(item.minimumMoves) || 0);
    var target = Math.max(minimum + 1, Number(item.targetMoves) || minimum + 1);
    var oneStarMax = target + Math.max(1, target - minimum);
    return [
      { stars: 3, min: minimum, max: minimum },
      { stars: 2, min: minimum + 1, max: target },
      { stars: 1, min: target + 1, max: oneStarMax },
      { stars: 0, min: oneStarMax + 1, max: null }
    ];
  }

  function renderStarThresholds(item, compact, highlightedStars) {
    return starThresholds(item).map(function (threshold) {
      var moveLabel = formatMoveRange(threshold.min, threshold.max, compact);
      var stars = '<span class="star-icons" aria-hidden="true">' + renderStarIcons(threshold.stars) + '</span>';
      var highlighted = highlightedStars !== undefined && highlightedStars !== null && threshold.stars === highlightedStars;
      if (compact) {
        return '<span class="' + (highlighted ? "is-highlighted" : "") + '">' + stars + ' ' + moveLabel + '</span>';
      }
      return '<span class="' + (highlighted ? "is-highlighted" : "") + '" aria-label="' + escapeAttribute(threshold.stars + " out of 3 stars: " + formatMoveRange(threshold.min, threshold.max, false)) + '">' + stars + '<em>' + moveLabel + '</em></span>';
    }).join("");
  }

  function renderStatusStarRanking(item) {
    var highlightedStars = storedStarsForGame(item);
    return starThresholds(item).map(function (threshold) {
      var label = threshold.stars + " " + (threshold.stars === 1 ? "star" : "stars") + ": " + formatMoveRange(threshold.min, threshold.max, false);
      var highlighted = highlightedStars !== null && threshold.stars === highlightedStars;
      return '<span class="star-ranking-row' + (highlighted ? " is-highlighted" : "") + '" aria-label="' + escapeAttribute(label + (highlighted ? ", current best" : "")) + '">' +
        '<span class="star-icons" aria-hidden="true">' + renderStarIcons(threshold.stars) + '</span>' +
        '<em>' + formatMoveRange(threshold.min, threshold.max, true) + '</em>' +
        '</span>';
    }).join("");
  }

  function personalBestText(game) {
    if (!game) return "-";
    if (game.mode === "daily") {
      var daily = app.progress.daily && app.progress.daily[game.dailyKey];
      return daily && daily.completed && daily.moves !== undefined ? String(daily.moves) : "-";
    }
    var best = app.progress.bestMoves && app.progress.bestMoves[game.levelId];
    return best !== undefined ? String(best) : "-";
  }

  function renderStarIcons(count) {
    var filled = clamp(Number(count) || 0, 0, 3);
    var icons = "";
    for (var i = 0; i < 3; i += 1) {
      icons += '<svg class="star-icon ' + (i < filled ? "is-filled" : "is-empty") + '" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.9l2.75 5.57 6.15.9-4.45 4.33 1.05 6.13L12 16.94l-5.5 2.89 1.05-6.13L3.1 9.37l6.15-.9L12 2.9Z"></path></svg>';
    }
    return icons;
  }

  function storedStarsForGame(game) {
    if (!game) return null;
    if (game.mode === "campaign" && isCampaignLevelCompleted(game.levelId)) {
      return clamp(Number(app.progress.stars[game.levelId]) || 0, 0, 3);
    }
    if (game.mode === "daily" && app.progress.daily[game.dailyKey] && app.progress.daily[game.dailyKey].completed) {
      return clamp(Number(app.progress.daily[game.dailyKey].stars) || 0, 0, 3);
    }
    return null;
  }

  function renderCheckIcon() {
    return '<svg class="check-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.4 4.4L19 7.3"></path></svg>';
  }

  function renderEyeIcon() {
    return '<svg class="eye-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-5.5 9.5-5.5S21.5 12 21.5 12s-3.5 5.5-9.5 5.5S2.5 12 2.5 12Z"></path><circle cx="12" cy="12" r="2.8"></circle></svg>';
  }

  function levelSelectAriaLabel(level, stars, completed, unlocked, hintUsed) {
    var label = "Level " + (level.campaignIndex + 1);
    if (!unlocked) label += ", locked";
    if (completed) {
      label += ", complete, " + stars + " " + (stars === 1 ? "star" : "stars") + " earned";
      if (hintUsed) label += ", hint used";
    } else {
      label += ", not complete";
    }
    return escapeAttribute(label);
  }

  function formatMoveRange(minimum, maximum, compact) {
    if (maximum === null) {
      return compact ? minimum + "+" : minimum + "+ moves";
    }
    if (minimum === maximum) return formatMoveThreshold(minimum, compact);
    return compact ? minimum + "-" + maximum : minimum + "-" + maximum + " moves";
  }

  function formatMoveThreshold(value, compact) {
    var moves = Math.max(0, Number(value) || 0);
    if (compact) return String(moves);
    return moves + " " + (moves === 1 ? "move" : "moves");
  }

  function escapeAttribute(value) {
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderStars(stars) {
    if (!stars) return "0/3";
    return new Array(stars + 1).join("*");
  }

  function sumObjectValues(object) {
    return Object.keys(object || {}).reduce(function (sum, key) {
      return sum + Number(object[key] || 0);
    }, 0);
  }

  function formatSeconds(totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return minutes + ":" + String(seconds).padStart(2, "0");
  }

  function getDailyDateKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function dailyChallengeKey(dateKey, tierKey) {
    return dateKey + "-" + tierKey;
  }

  function formatDailyDate(dateKey) {
    var parts = dateKey.split("-").map(Number);
    var date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function makeRng(seedText) {
    var seed = hashString(seedText);
    return function () {
      seed += 0x6D2B79F5;
      var t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashString(text) {
    var h = 1779033703 ^ text.length;
    for (var i = 0; i < text.length; i += 1) {
      h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  }

  function randomItem(items, rng) {
    return items[Math.floor(rng() * items.length)];
  }

  function randomInt(min, max, rng) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  function shuffle(items, rng) {
    for (var i = items.length - 1; i > 0; i -= 1) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = items[i];
      items[i] = items[j];
      items[j] = tmp;
    }
    return items;
  }

  function range(length) {
    return Array.from({ length: length }, function (_, index) {
      return index;
    });
  }

  function mod(value, modulus) {
    return ((value % modulus) + modulus) % modulus;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function playSound(name, options) {
    if (!app.progress.settings.sound || !app.audio) return;
    app.audio.play(name, options || {});
  }

  function createAudioManager() {
    var AudioCtor = window.AudioContext || window.webkitAudioContext;
    var context = null;
    var master = null;
    var echo = null;
    var echoGain = null;

    function setup() {
      if (!AudioCtor || !app.progress.settings.sound) return null;
      if (!context) {
        context = new AudioCtor();
        master = context.createGain();
        master.gain.value = 0.58;
        master.connect(context.destination);

        echo = context.createDelay(0.24);
        echo.delayTime.value = 0.085;
        echoGain = context.createGain();
        echoGain.gain.value = 0.1;
        echo.connect(echoGain);
        echoGain.connect(master);
      }
      if (context.state === "suspended") {
        context.resume();
      }
      return context;
    }

    function tone(freq, start, duration, type, gain, options) {
      var ctx = setup();
      if (!ctx) return;
      var opts = options || {};
      var oscillator = ctx.createOscillator();
      var amp = ctx.createGain();
      var filter = ctx.createBiquadFilter();
      var out = amp;

      oscillator.type = type || "sine";
      oscillator.frequency.setValueAtTime(freq, start);
      if (opts.to) {
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, opts.to), start + duration);
      }

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(opts.cutoff || 4200, start);
      filter.Q.value = opts.q || 0.8;

      amp.gain.setValueAtTime(0.0001, start);
      amp.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.018, duration * 0.34));
      amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      oscillator.connect(filter);
      filter.connect(amp);

      if (ctx.createStereoPanner && opts.pan !== undefined) {
        var panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(opts.pan, start);
        amp.connect(panner);
        out = panner;
      }

      out.connect(master);
      if (opts.echo) out.connect(echo);

      oscillator.start(start);
      oscillator.stop(start + duration + 0.03);
    }

    function play(name, options) {
      var ctx = setup();
      if (!ctx) return;
      var t = ctx.currentTime + 0.006;
      var opts = options || {};

      if (name === "ui") {
        tone(520, t, 0.055, "triangle", 0.035, { cutoff: 3600 });
        tone(780, t + 0.025, 0.045, "sine", 0.018, { cutoff: 4200 });
        return;
      }

      if (name === "start") {
        tone(392, t, 0.085, "triangle", 0.04, { echo: true });
        tone(523.25, t + 0.055, 0.09, "triangle", 0.038, { echo: true });
        tone(659.25, t + 0.115, 0.12, "sine", 0.03, { echo: true });
        return;
      }

      if (name === "pulse") {
        var tones = [246.94, 329.63, 415.3, 493.88, 587.33];
        var state = clamp(Number(opts.state) || 0, 0, tones.length - 1);
        var base = tones[state] || 329.63;
        var sizeGain = Math.min(0.065, 0.036 + (Number(opts.affected) || 1) * 0.004);
        tone(base, t, 0.12, "triangle", sizeGain, { cutoff: 4800, echo: true, pan: -0.08 });
        tone(base * 1.5, t + 0.018, 0.1, "sine", sizeGain * 0.52, { cutoff: 5200, echo: true, pan: 0.1 });
        return;
      }

      if (name === "preview") {
        tone(880, t, 0.065, "sine", 0.025, { cutoff: 5200, echo: true });
        tone(1174.66, t + 0.035, 0.06, "sine", 0.018, { cutoff: 5400, echo: true });
        return;
      }

      if (name === "invalid") {
        tone(130, t, 0.11, "sawtooth", 0.026, { to: 82, cutoff: 900 });
        return;
      }

      if (name === "undo") {
        tone(659.25, t, 0.075, "triangle", 0.034, { cutoff: 3600 });
        tone(440, t + 0.05, 0.09, "triangle", 0.026, { cutoff: 3200 });
        return;
      }

      if (name === "reset") {
        tone(740, t, 0.13, "triangle", 0.034, { to: 370, cutoff: 4200 });
        tone(277.18, t + 0.115, 0.08, "sine", 0.022, { cutoff: 2600 });
        return;
      }

      if (name === "hint") {
        tone(987.77, t, 0.07, "sine", 0.024, { cutoff: 5400, echo: true, pan: -0.18 });
        tone(1318.51, t + 0.055, 0.085, "sine", 0.022, { cutoff: 5600, echo: true, pan: 0.18 });
        tone(1760, t + 0.12, 0.095, "triangle", 0.018, { cutoff: 5800, echo: true });
        return;
      }

      if (name === "win") {
        var starBonus = clamp(Number(opts.stars) || 0, 0, 3);
        var notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
        notes.slice(0, 2 + starBonus).forEach(function (note, index) {
          tone(note, t + index * 0.075, 0.16, index % 2 ? "sine" : "triangle", 0.042 - index * 0.004, { cutoff: 6200, echo: true });
          tone(note * 2, t + index * 0.075 + 0.018, 0.11, "sine", 0.012, { cutoff: 6800, echo: true });
        });
      }
    }

    return {
      play: play
    };
  }

  function vibrate(ms) {
    if (app.progress.settings.vibration && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  }

  window.ResonanceGridDebug = {
    patterns: PATTERNS,
    solvePuzzle: solvePuzzle,
    generatePuzzle: generatePuzzle,
    getCampaignLevels: function () {
      return app.campaignLevels.slice();
    }
  };
})();
