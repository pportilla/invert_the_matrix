// @ts-nocheck
/*
 * TypeScript source for the static web app.
 * Run `npm run build` from `web-app/` to regenerate `app.js`.
 */
(function () {
    "use strict";
    var STORAGE_KEY = "resonance-grid-progress-v1";
    var APP_VERSION = "1.0.17";
    var CAMPAIGN_DATA_URL = "campaign-levels.json";
    var MATHJAX_URL = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
    var CHANGELOG_ENTRIES = [
        {
            version: "1.0.17",
            date: "2026-11-12",
            text: "You can now play in Korean. We also rewrote How to Play and the math guide, from your first tap to the equations behind a solution."
        },
        {
            version: "1.0.16",
            date: "2026-10-24",
            text: "Improved Android 16 compatibility, system Back navigation, and screen layout around system bars. The Android app now requires Android 7 or later."
        },
        {
            version: "1.0.15",
            date: "2026-09-01",
            text: "Updated AndroidX Activity and Fragment dependencies to current supported releases for Play compatibility."
        },
        {
            version: "1.0.14",
            date: "2026-09-01",
            text: "Android now targets Android 16, keeps system Back navigation reliable, and makes the all-white goal clear with tap-effect help available on demand."
        },
        {
            version: "1.0.13",
            date: "2026-05-30",
            text: "The main menu now includes Achievements, the animated board is larger, and Android opens Play Games achievement status while the web app shows campaign achievement progress."
        },
        {
            version: "1.0.12",
            date: "2026-05-30",
            text: "First production release with campaign levels, daily challenges, custom puzzles, Playground boards, hints, stars, and Play Games achievements."
        },
        {
            version: "1.0.11",
            date: "2026-05-30",
            text: "Added a separate setting for Playground tile numbers, keeping Playground boards number-free unless it is turned on."
        },
        {
            version: "1.0.10",
            date: "2026-05-30",
            text: "The Android release is prepared with version code 12, native debug symbols for Play Console crash reports, and refreshed changelog notes for the latest Play Store build."
        },
        {
            version: "1.0.9",
            date: "2026-05-28",
            text: "Playground adds shareable puzzle codes, campaign now uses a 5x5 group map, and the Playground logo is now a tile-colored basketball. Menu headers, locks, and text-size controls were polished across web and Android."
        },
        {
            version: "1.0.8",
            date: "2026-05-16",
            text: "Daily challenges now separate puzzle cards from leaderboards, custom setup uses visual pattern chips with unique generation always on, and game/result screens are clearer."
        },
        {
            version: "1.0.7",
            date: "2026-05-14",
            text: "Settings now hide platform-specific controls, animation and colorblind-symbol toggles were removed, and About shows version history with the GitHub link."
        },
        {
            version: "1.0.6",
            date: "2026-05-13",
            text: "Release builds keep native debug symbols for Play Console crash reports."
        },
        {
            version: "1.0.5",
            date: "2026-05-13",
            text: "The Math guide explains solution uniqueness and matrix invertibility."
        }
    ];
    var LANGUAGE_OPTIONS = [
        { key: "en", label: "English" },
        { key: "es", label: "Español" },
        { key: "fr", label: "Français" },
        { key: "ko", label: "한국어" }
    ];
    var TEXT_TRANSLATIONS = {
        ko: {
            "Mixed patterns": "혼합 패턴",
            "Options": "옵션",
            "Edit tool": "편집 도구",
            "pportilla on GitHub": "pportilla의 GitHub 프로필",
            "{n} states": "상태 {n}개",
            "{n} star": "별 {n}개",
            "{n} stars": "별 {n}개",
            "{n} out of 3 stars": "별 3개 중 {n}개",
            "{n} tap": "{n}회",
            "{n} taps": "{n}회",
            "{n}+ taps": "{n}회 이상",
            "Row {row}, column {column}": "{row}행 {column}열",
            "Paint color {n}": "{n}번 색으로 칠하기",
            "A modular tile puzzle": "칸마다 색이 순환하는 퍼즐",
            "Main menu": "메인 메뉴",
            "Campaign": "캠페인",
            "Custom Level": "맞춤 레벨",
            "Playground": "실험실",
            "Daily Challenge": "일일 도전",
            "Daily Challenges": "일일 도전",
            "Leaderboards": "순위표",
            "Leaderboard": "순위표",
            "Achievements": "업적",
            "Campaign achievements": "캠페인 업적",
            "Clear": "그룹 완료",
            "Master": "별 수집가",
            "Unlocked": "달성",
            "Locked": "미달성",
            "Complete every level in this group.": "이 그룹의 모든 레벨을 완료하세요.",
            "Earn every star in this group.": "이 그룹의 별을 모두 모으세요.",
            "Global": "종합",
            "All daily tiers": "일일 도전 전체 난이도",
            "How to Play": "게임 방법",
            "The Math": "퍼즐 속 수학",
            "Settings": "설정",
            "Back": "뒤로",
            "Campaign chapters": "캠페인 챕터",
            "Campaign groups": "캠페인 그룹",
            "Group": "그룹",
            "Earn 15 stars in a nearby group.": "이웃한 그룹에서 별 15개를 모으세요.",
            "Custom Puzzle": "맞춤 퍼즐",
            "Playground setup": "실험실 설정",
            "Playground controls": "실험실 도구",
            "Playground board": "실험실 퍼즐판",
            "Custom level setup": "맞춤 레벨 설정",
            "Grid Size": "격자 크기",
            "Grid size": "격자 크기",
            "Width": "가로",
            "Height": "세로",
            "States": "상태 수",
            "Number of states": "상태 수",
            "Tap Pattern": "누르기 패턴",
            "Tap pattern": "누르기 패턴",
            "Difficulty": "난이도",
            "Edit Tool": "편집 도구",
            "Tap Tiles": "칸 누르기",
            "Paint White": "흰색으로 칠하기",
            "Paint Color": "색칠하기",
            "Paint States": "상태 칠하기",
            "Lock Tiles": "칸 잠그기",
            "Place Holes": "빈자리 만들기",
            "Starting Board": "시작 퍼즐판",
            "Playground board editor": "실험실 퍼즐판 편집기",
            "Puzzle Code": "퍼즐 코드",
            "Puzzle code": "퍼즐 코드",
            "Share": "공유",
            "Load Code": "코드 불러오기",
            "Copy Code": "코드 복사",
            "Clear Board": "퍼즐판 비우기",
            "Play": "시작",
            "Sandbox": "자유 실험",
            "No goal": "목표 없음",
            "Puzzle code copied.": "퍼즐 코드를 복사했어요.",
            "Puzzle code loaded.": "퍼즐 코드를 불러왔어요.",
            "Puzzle code not recognized.": "퍼즐 코드를 확인해 주세요.",
            "Keep at least one tile.": "적어도 한 칸은 남겨 주세요.",
            "Hints are off in Playground.": "실험실에서는 힌트를 사용할 수 없어요.",
            "Tiles with lock icons": "잠긴 칸",
            "Irregular board": "불규칙한 퍼즐판",
            "Extras": "추가 옵션",
            "Unique solution preferred": "풀이가 하나인 퍼즐 우선",
            "Create Puzzle": "퍼즐 만들기",
            "Daily": "일일 도전",
            "Daily puzzle tiers": "일일 도전 난이도",
            "Puzzle status": "퍼즐 진행 상황",
            "Taps": "누른 횟수",
            "Star ranking": "별 획득 기준",
            "Time": "시간",
            "Puzzle details": "퍼즐 정보",
            "Pattern": "패턴",
            "Tap pattern info": "누르기 패턴 설명",
            "Personal Best": "개인 최고 기록",
            "Board actions": "퍼즐 도구",
            "Undo": "되돌리기",
            "Reset": "처음부터",
            "Hint": "힌트",
            "Puzzle board": "퍼즐판",
            "Guide": "안내",
            "Text size": "글자 크기",
            "Small text": "작은 글자",
            "Medium text": "보통 글자",
            "Large text": "큰 글자",
            "Play overview": "게임 방법 개요",
            "Turn every tile white. A single tap can change several tiles at once.": "모든 칸을 흰색으로 바꿔 보세요. 한 칸만 눌러도 여러 칸의 색이 함께 바뀔 수 있어요.",
            "Before you tap, hold a tile to see where its pattern reaches.": "칸을 누르기 전에 길게 눌러 보세요. 어느 칸까지 영향을 받는지 볼 수 있어요.",
            "Rules": "게임 규칙",
            "1. Read the colors": "1. 색깔 살펴보기",
            "White is the color you want every tile to reach.": "마지막에는 모든 칸이 흰색이어야 해요.",
            "A white tile can still change color if another tap reaches it.": "이미 흰색인 칸도 다른 칸을 누르면 다시 색이 바뀔 수 있어요.",
            "You solve the puzzle when all the tiles are white at once.": "모든 칸이 동시에 흰색이 되면 퍼즐이 풀려요.",
            "2. Follow the color cycle": "2. 색이 바뀌는 순서",
            "Tap an unlocked tile. Its pattern tells you which tiles will change.": "잠기지 않은 칸을 눌러 보세요. 어느 칸의 색이 바뀔지는 누른 칸의 패턴에 따라 달라요.",
            "Each tile in the pattern moves on to its next color.": "패턴에 포함된 칸은 저마다 다음 색으로 넘어가요.",
            "After the last color comes white again.": "마지막 색 다음에는 다시 흰색이 돼요.",
            "3. Check the pattern": "3. 패턴 확인하기",
            "Look for crosses, diagonals, squares, rows, columns and even chess knight moves. Some boards mix several patterns.": "십자, 대각선, 정사각형, 가로줄, 세로줄, 체스의 나이트처럼 뛰는 패턴이 있어요. 한 퍼즐판에 여러 패턴이 섞이기도 해요.",
            "Hold a tile to preview its pattern. Lift your finger when you’re done looking.": "칸을 길게 누르면 패턴을 미리 볼 수 있어요. 다 봤으면 손을 떼세요.",
            "4. Locks and holes": "4. 잠긴 칸과 빈자리",
            "A locked tile still has to turn white.": "잠긴 칸도 흰색으로 바꿔야 해요.",
            "To change it, tap another tile whose pattern reaches it.": "잠긴 칸은 직접 누를 수 없어요. 패턴이 그 칸까지 닿는 다른 칸을 눌러 보세요.",
            "A hole is just a gap in the board. Tap patterns skip it.": "빈자리에는 칸이 없어서 패턴이 그대로 건너뛰어요.",
            "Modes": "게임 모드",
            "Choose your puzzle": "퍼즐 고르기",
            "Campaign:": "캠페인:",
            "Solve fixed levels in order. Each solve opens the next level.": "정해진 순서대로 레벨을 풀어 보세요. 한 레벨을 풀면 다음 레벨이 열려요.",
            "Pick a group on the 5 × 5 map. Earn 15 stars there to unlock the groups directly beside it, above it and below it.": "5 × 5 지도에서 그룹을 고르세요. 그 그룹에서 별 15개를 모으면 상하좌우로 바로 붙어 있는 그룹이 열려요.",
            "Custom Level:": "맞춤 레벨:",
            "Choose the board size, number of colors, pattern and difficulty. You can add locks and holes. The game looks for a puzzle with a unique solution when it can.": "퍼즐판 크기, 색의 개수, 패턴, 난이도를 고르세요. 잠긴 칸과 빈자리도 넣을 수 있어요. 게임은 가능한 한 해가 하나인 퍼즐을 찾아요.",
            "Playground:": "실험실:",
            "Build your own board and share it with a puzzle code. You can keep experimenting even after every tile turns white.": "직접 만든 퍼즐판을 퍼즐 코드로 공유하세요. 모든 칸을 흰색으로 바꾼 뒤에도 계속 눌러 볼 수 있어요.",
            "Daily Challenge:": "일일 도전:",
            "Everyone gets the same three puzzles each day. Each one keeps its own best score.": "매일 모두에게 같은 퍼즐 세 개가 주어져요. 최고 기록은 퍼즐마다 따로 저장돼요.",
            "Tools and options": "도구 및 설정",
            "Taps, stars, and hints": "누른 횟수, 별, 힌트",
            "Previewing a pattern is free. Your tap counts when the tiles change.": "미리 보기만 하면 횟수에 들어가지 않아요. 칸의 색이 바뀔 때 한 번으로 세요.",
            "For three stars, solve the puzzle in as few taps as the game’s best known solution, or fewer.": "게임이 찾은 가장 짧은 풀이와 같은 횟수로 풀거나 더 적게 누르면 별 세 개를 받아요.",
            "The one- and two-star targets leave room for extra taps.": "조금 더 눌러도 기준 횟수 안에 풀면 별 한두 개를 받을 수 있어요.",
            "Undo takes back your last tap. Reset puts the board back the way it started.": "‘되돌리기’를 누르면 방금 둔 수를 되돌려요. ‘처음부터’를 누르면 퍼즐판이 처음 상태로 돌아가요.",
            "A hint plays one tap for you. You can still finish that attempt, but it earns no stars.": "힌트를 쓰면 게임이 한 수를 대신 둬요. 그 시도에서는 끝까지 풀어도 별을 받을 수 없어요.",
            "Look for the red outlines to see which tiles the hint changed.": "힌트로 바뀐 칸에는 빨간 테두리가 생겨요.",
            "When you tap a tile, this pattern is centered on that tile. Every tile inside the pattern changes state.": "누른 칸을 중심으로 패턴이 펼쳐져요. 패턴에 닿는 칸은 모두 다음 상태로 바뀌어요.",
            "The green outline matches the preview you see when you hold a tile.": "칸을 길게 누르면 같은 범위에 초록색 테두리가 나타나요.",
            "Turn sound effects on or off in Settings.": "설정에서 효과음을 켜거나 끌 수 있어요.",
            "If you prefer numbers, turn them on to see each tile’s state alongside its color.": "색과 함께 상태를 숫자로 보고 싶다면 칸에 숫자를 표시하는 옵션을 켜세요.",
            "On Android, you can also turn vibration on or off.": "안드로이드에서는 진동도 켜거나 끌 수 있어요.",
            "Math overview": "퍼즐 속 수학 개요",
            "What happens when you add up the taps?": "여러 번 누른 효과를 더하면 어떻게 될까요?",
            "Take a board with just two colors. Tap the center of a cross and every tile in the cross switches between white and blue. Tap the same spot again and you’re back where you started. The same rule works with other patterns. With more colors, it takes more taps to go all the way around the cycle.": "흰색과 파란색만 있는 퍼즐판을 떠올려 보세요. 십자 패턴의 가운데를 누르면 그 안의 칸들이 흰색에서 파란색으로, 파란색에서 흰색으로 바뀌어요. 같은 자리를 한 번 더 누르면 처음 상태로 돌아와요. 패턴이 달라져도 원리는 같아요. 색이 많아지면 한 바퀴를 도는 데 더 많이 눌러야 해요.",
            "Modeling the game": "게임의 수학적 모형",
            "The board in one equation": "방정식 하나로 나타낸 퍼즐판",
            "Give white the number \\(0\\) and count up through the colors. On a board with \\(n\\) colors, the next step after \\(n-1\\) is \\(0\\) again. This is arithmetic modulo \\(n\\), written in the ring \\(R=\\mathbb Z/n\\mathbb Z\\).": "흰색을 \\(0\\)으로 놓고 나머지 색에 차례로 번호를 붙여요. 색이 \\(n\\)개라면 \\(n-1\\) 다음은 다시 \\(0\\)이에요. 이렇게 \\(n\\)으로 나눈 나머지로 계산하는 수 체계가 나머지환 \\(R=\\mathbb Z/n\\mathbb Z\\)예요.",
            "Now read the tiles in a fixed order. Their numbers form the board vector \\(s\\). Put the effect of each possible tap in a column of a matrix \\(A\\). If \\(x\\) records how often you tap each unlocked tile, \\(Ax\\) gives the total change. You win when \\(s+Ax=0\\).": "칸을 일정한 순서로 읽으면 상태를 나타내는 퍼즐판 벡터 \\(s\\)를 얻어요. 누를 수 있는 각 칸을 한 번 눌렀을 때 생기는 변화를 행렬 \\(A\\)의 열로 적어요. 각 칸을 누른 횟수를 \\(x\\)로 나타내면 전체 변화는 \\(Ax\\)이고, \\(s+Ax=0\\)이 되면 퍼즐이 풀려요.",
            "With \\(2\\), \\(3\\) or \\(5\\) states, \\(R\\) is a field. Every nonzero element has a multiplicative inverse, so you can divide by it. With four states, even a simple division by \\(2\\) can go wrong. We’ll see why below.": "상태가 \\(2\\), \\(3\\), \\(5\\)개일 때 \\(R\\)은 체예요. 0이 아닌 모든 원소에 곱셈의 역원이 있으므로 그 원소로 나눌 수 있어요. 상태가 네 개일 때는 왜 \\(2\\)로 나눌 수 없는지도 아래에서 살펴봐요.",
            "Lights Out generalization": "라이트 아웃에서 확장한 퍼즐",
            "From Lights Out": "라이트 아웃에서 출발한 퍼즐",
            "From two states to many": "두 가지 상태에서 여러 상태로",
            "In the classic Lights Out puzzle, a tap flips the chosen tile and its neighbors above, below, left and right. Each flip adds \\(1\\) modulo \\(2\\). Two taps in the same spot cancel because \\(1+1=0\\) modulo \\(2\\).": "고전 퍼즐 라이트 아웃에서는 한 칸을 누르면 그 칸과 상하좌우의 이웃 칸이 뒤집혀요. 한 번 뒤집는 건 \\(2\\)를 법으로 \\(1\\)을 더하는 것과 같아요. \\(2\\)를 법으로 하면 \\(1+1=0\\)이므로 같은 곳을 두 번 누른 효과는 서로 상쇄돼요.",
            "Invert the Matrix adds more states and patterns, but tap effects still add together. Skip holes when you list the tiles. Include locked tiles, since a tap on another tile can change them.": "이 게임에는 상태와 패턴이 더 많지만 누른 효과를 더하는 원리는 같아요. 칸을 셀 때 빈자리는 빼고, 잠긴 칸은 포함해요. 다른 칸을 누르면 잠긴 칸도 바뀔 수 있으니까요.",
            "Can you combine the available taps to cancel the starting board? The change you need is \\(-s\\).": "누를 수 있는 칸을 조합해 처음 상태를 상쇄할 수 있을까요? 필요한 변화는 \\(-s\\)예요.",
            "1. The board is a vector": "1. 퍼즐판을 벡터로 나타내기",
            "Number the \\(m\\) tiles \\(p_1,\\ldots,p_m\\) in any fixed order. Write their states in that same order to get \\(s=(s_1,\\ldots,s_m)\\in R^m\\). Each entry \\(s_i\\) is the color of tile \\(p_i\\). An all-white board is the zero vector.": "칸 \\(m\\)개에 순서를 정해 \\(p_1,\\ldots,p_m\\)이라고 이름을 붙여요. 그 순서대로 상태를 적으면 \\(s=(s_1,\\ldots,s_m)\\in R^m\\)이 돼요. 성분 \\(s_i\\)는 칸 \\(p_i\\)의 색을 나타내요. 모든 칸이 흰 퍼즐판은 영벡터예요.",
            "2. Each tap contributes a column": "2. 누를 수 있는 칸마다 열 하나",
            "Label the \\(r\\) tiles you can tap \\(q_1,\\ldots,q_r\\). Tap \\(q_j\\) once and record a \\(1\\) for each tile that changes and a \\(0\\) for each tile that stays the same. The result is its effect vector \\(v_j\\), column \\(j\\) of \\(A\\).": "누를 수 있는 칸 \\(r\\)개를 \\(q_1,\\ldots,q_r\\)이라고 해요. 칸 \\(q_j\\)를 한 번 눌렀을 때 바뀌는 칸에 \\(1\\), 그대로인 칸에 \\(0\\)을 적어요. 이렇게 얻은 효과 벡터 \\(v_j\\)가 행렬 \\(A\\)의 \\(j\\)번째 열이에요.",
            "Read across a row to see which taps affect one tile. Read down a column to see which tiles one tap affects. A locked tile has a row of its own, but you can’t tap it, so it has no column.": "한 행을 가로로 읽으면 어떤 칸을 눌러야 그 칸이 바뀌는지 알 수 있어요. 한 열을 세로로 읽으면 한 번 눌러서 어떤 칸이 바뀌는지 알 수 있어요. 잠긴 칸에는 행은 있지만 직접 누를 수 없어서 열은 없어요.",
            "Solving equation": "퍼즐을 푸는 방정식",
            "Goal": "목표",
            "How many times should you tap each tile?": "각 칸을 몇 번씩 눌러야 할까요?",
            "The tap-count vector \\(x=(x_1,\\ldots,x_r)\\) records how often you tap each unlocked tile, modulo \\(n\\). Each tap on \\(q_j\\) adds the same \\(v_j\\), so together the taps add \\(Ax=\\sum_j x_jv_j\\). You can play them in any order.": "누름 횟수 벡터 \\(x=(x_1,\\ldots,x_r)\\)는 잠기지 않은 각 칸을 누른 횟수를 \\(n\\)으로 나눈 나머지로 기록해요. \\(q_j\\)를 누를 때마다 같은 \\(v_j\\)가 더해지므로 전체 변화는 \\(Ax=\\sum_j x_jv_j\\)예요. 누르는 순서는 자유로워요.",
            "The final board is \\(s+Ax\\). To make it all white, look for a vector \\(x\\) that solves \\(Ax=-s\\) in \\(R\\).": "다 누른 뒤의 퍼즐판은 \\(s+Ax\\)예요. 퍼즐판을 흰색으로 만들려면 \\(R\\)에서 \\(Ax=-s\\)를 만족하는 벡터 \\(x\\)를 찾아야 해요.",
            "When does a solution exist?": "해는 언제 존재할까요?",
            "Every tap-count vector produces a change \\(Ax\\). All those changes together form the image of \\(A\\), written \\(\\operatorname{Im}(A)\\). A board has a solution exactly when \\(-s\\) belongs to this image.": "누름 횟수 벡터 하나가 퍼즐판에 만드는 변화는 \\(Ax\\)예요. 이렇게 만들 수 있는 모든 변화의 집합을 \\(A\\)의 상이라고 하고 \\(\\operatorname{Im}(A)\\)로 써요. \\(-s\\)가 이 상에 속하면 퍼즐을 풀 수 있고, 속하지 않으면 풀 수 없어요.",
            "When \\(n\\) is prime, you can check by row reducing the augmented matrix \\([A\\mid -s]\\) to echelon form. A row saying \\(0=c\\) with \\(c\\ne0\\) rules out a solution. If no such row appears, you can read off at least one solution by back substitution.": "\\(n\\)이 소수라면 첨가행렬 \\([A\\mid -s]\\)에 기본 행 연산을 적용해 사다리꼴로 만들어요. \\(c\\ne0\\)인데 \\(0=c\\)라는 행이 나오면 해가 없어요. 그런 행이 없으면 마지막 식부터 거꾸로 대입해 해를 하나 구할 수 있어요.",
            "What changes with four states?": "상태가 네 개면 무엇이 달라질까요?",
            "When \\(n\\) is composite, \\(R\\) is still a ring, but some nonzero elements have no multiplicative inverse. For example, modulo \\(4\\), twice any number is even, so \\(2a\\) can never equal \\(1\\). You can’t divide a row by \\(2\\) here.": "\\(n\\)이 합성수일 때도 \\(R\\)은 환이지만, 0이 아닌 원소 중에도 곱셈의 역원이 없는 것이 있어요. 예를 들어 \\(4\\)를 법으로 할 때 어떤 수를 두 배 해도 짝수이므로 \\(2a\\)는 \\(1\\)이 될 수 없어요. 따라서 행을 \\(2\\)로 나눌 수 없어요.",
            "The test for a solution is still \\(-s\\in\\operatorname{Im}(A)\\). Use row operations valid in the ring. If \\(n\\) factors into coprime prime powers, you can also solve modulo each of those powers and combine the results.": "해가 존재할 조건은 여전히 \\(-s\\in\\operatorname{Im}(A)\\)예요. 다만 이 환에서 허용되는 행 연산을 써야 해요. \\(n\\)이 서로 다른 소수의 거듭제곱들의 곱이라면 각 거듭제곱을 법으로 따로 푼 뒤 결과를 합칠 수도 있어요.",
            "When is the solution unique?": "해가 하나뿐인 경우는 언제일까요?",
            "Suppose \\(x_0\\) solves the board. If a tap-count vector \\(z\\) leaves the board unchanged, then \\(Az=0\\) and \\(x_0+z\\) also solves it. These vectors \\(z\\) form the kernel of \\(A\\), written \\(\\ker(A)\\). Adding each of them to \\(x_0\\) gives all the solutions.": "\\(x_0\\)가 해라고 해 볼게요. 퍼즐판을 그대로 두는 누름 횟수 벡터 \\(z\\)는 \\(Az=0\\)을 만족하므로 \\(x_0+z\\)도 해예요. 이런 \\(z\\)의 집합을 \\(A\\)의 핵이라고 하고 \\(\\ker(A)\\)로 써요. 핵의 각 원소를 \\(x_0\\)에 더하면 모든 해를 얻어요.",
            "Remember that counts are taken modulo \\(n\\). Tapping one tile \\(n\\) extra times takes its whole pattern around the color cycle. It leaves both the board and the tap-count vector unchanged.": "누른 횟수는 \\(n\\)으로 나눈 나머지로 세요. 한 칸을 \\(n\\)번 더 누르면 패턴 안의 모든 칸이 색의 순환을 한 바퀴 돌아요. 퍼즐판도 누름 횟수 벡터도 그대로예요.",
            "So a solvable board has exactly one tap-count vector when \\(\\ker(A)=\\{0\\}\\). Over a field, this means the columns of \\(A\\) are linearly independent. The kernel test also works in the four-state ring.": "따라서 풀 수 있는 퍼즐판의 누름 횟수 벡터가 하나뿐일 필요충분조건은 \\(\\ker(A)=\\{0\\}\\)이에요. 체에서는 \\(A\\)의 열들이 선형 독립이라는 뜻이에요. 핵을 보는 이 판정법은 상태가 네 개인 환에서도 통해요.",
            "When is \\(A\\) invertible?": "\\(A\\)에 역행렬이 있는 경우는 언제일까요?",
            "If you can tap every tile, \\(A\\) has one row and one column per tile, so it is square. Holes leave that count balanced. A lock removes a column and keeps the row. When a square \\(A\\) is invertible, every starting board has exactly one tap-count solution.": "모든 칸을 누를 수 있다면 칸마다 행과 열이 하나씩 있어서 \\(A\\)는 정사각행렬이에요. 빈자리는 행과 열의 수를 똑같이 줄이지만, 칸을 잠그면 행은 남고 열만 빠져요. 정사각행렬 \\(A\\)에 역행렬이 있으면 어떤 퍼즐판에서 시작하든 누름 횟수 벡터로 나타낸 해가 하나뿐이에요.",
            "A square \\(A\\) is invertible exactly when its determinant has a multiplicative inverse in \\(R\\). For prime \\(n\\), the determinant must be nonzero modulo \\(n\\). For \\(n=4\\), it must be odd. If this test fails, some starting boards have no solution and others have several. For a rectangular matrix, use the image to test existence and the kernel to test uniqueness.": "정사각행렬 \\(A\\)에 역행렬이 있을 필요충분조건은 그 행렬식이 \\(R\\)에서 곱셈의 역원을 갖는 거예요. \\(n\\)이 소수이면 행렬식이 \\(n\\)을 법으로 0이 아니어야 하고, \\(n=4\\)이면 홀수여야 해요. 조건을 만족하지 않으면 어떤 퍼즐판은 해가 없고 어떤 퍼즐판은 여러 개예요. 직사각행렬에서는 상으로 해의 존재 여부를, 핵으로 해의 유일성을 확인해요.",
            "Counting the taps in a solution": "풀이에 필요한 횟수 세기",
            "To play a solution, take each count \\(x_j\\) as a number from \\(0\\) to \\(n-1\\). Call that number \\(t_j\\). Add these numbers as ordinary integers to get the number of taps, \\(\\ell(x)\\). The shortest solution the game has found sets the three-star target.": "풀이를 실제로 따라갈 때는 각 성분 \\(x_j\\)를 \\(0\\)부터 \\(n-1\\)까지의 수로 나타내요. 이 수를 \\(t_j\\)라고 해요. 이 값들을 보통 정수처럼 더한 \\(\\ell(x)\\)가 실제로 눌러야 하는 횟수예요. 게임이 찾은 가장 짧은 풀이가 별 세 개의 기준이 돼요.",
            "How the game finds a short solution": "게임이 짧은 풀이를 찾는 방법",
            "If the board has few enough possible states, the game searches all positions one tap away, then two taps away, and so on. The first time it reaches an all-white board, it has found the fewest taps possible.": "가능한 퍼즐판 상태가 충분히 적으면 한 번 눌러 갈 수 있는 상태부터 살펴보고, 이어서 두 번, 세 번 누른 상태를 살펴봐요. 처음으로 흰 퍼즐판에 도달한 횟수가 가능한 최솟값이에요.",
            "For larger boards with a prime number of states per tile, the game row reduces \\(Ax=-s\\). If there are few enough solutions to try, it compares them all and keeps one with the fewest taps. When an exact search is too large, including on large four-state boards, it uses a known solution whose length may be above the minimum.": "퍼즐판이 크고 칸마다 상태의 개수가 소수이면 \\(Ax=-s\\)를 행 연산으로 풀어요. 해를 모두 비교할 수 있을 만큼 수가 적으면 가장 적게 누르는 해를 하나 골라요. 네 가지 상태를 쓰는 큰 퍼즐판처럼 정확한 탐색이 너무 크면 이미 알고 있는 풀이를 써요. 그 풀이가 최단이라는 보장은 없어요.",
            "Different tap-count vectors can tie for the minimum, and you can play the same vector in different orders. When the game proves a minimum, it always picks the same plan among those tied for shortest. It doesn’t tell you whether another plan ties with it.": "서로 다른 누름 횟수 벡터가 같은 최소 횟수를 낼 수 있고, 같은 벡터도 여러 순서로 누를 수 있어요. 최솟값을 확인한 경우 게임은 최단 풀이 중에서 늘 같은 하나를 골라요. 똑같이 짧은 다른 풀이가 있는지는 표시하지 않아요.",
            "Locked tiles and holes in the matrix": "잠긴 칸과 빈자리를 행렬로 나타내기",
            "To model a hole, leave that position out entirely. To model a lock, keep the tile’s entry in \\(s\\) and its row in \\(A\\), since it still has to turn white. Leave out its column. The remaining columns tell you which other taps can change it.": "빈자리는 모형에서 아예 빼요. 잠긴 칸은 흰색으로 바꿔야 하므로 \\(s\\)의 성분과 \\(A\\)의 행을 남겨 두고 열만 빼요. 나머지 열을 보면 어떤 칸을 눌러야 잠긴 칸이 바뀌는지 알 수 있어요.",
            "How puzzles are made": "퍼즐을 만드는 방법",
            "The generator starts with a white board and scrambles it with allowed taps. It keeps track of how to undo their combined effect, so the starting board comes with a solution. When it can, the solver finds a shortest plan for the star targets. A hint plays one tap toward a solution and outlines the tiles it changed in red.": "퍼즐을 만들 때는 흰 퍼즐판에서 시작해 누를 수 있는 칸을 눌러 색을 섞어요. 그 변화를 되돌리는 방법을 기록해 두므로 처음 퍼즐판에는 이미 풀이가 있어요. 가능하면 최단 풀이를 찾아 별의 기준을 정해요. 힌트는 풀이를 따라 한 수를 대신 두고, 바뀐 칸에 빨간 테두리를 표시해요.",
            "What the symbols mean": "기호의 뜻",
            "The number of states per tile. It can be \\(2\\), \\(3\\), \\(4\\) or \\(5\\) and is the modulus for this board.": "칸 하나가 가질 수 있는 상태의 개수. \\(2\\), \\(3\\), \\(4\\), \\(5\\) 중 하나이며, 이 퍼즐판에서 나머지를 계산할 때의 법이에요.",
            "The board vector. Each entry is the state of one tile.": "퍼즐판 벡터. 각 성분은 한 칸의 상태를 나타내요.",
            "The tap matrix. Column \\(j\\) shows what changes when you tap \\(q_j\\).": "효과 행렬. \\(j\\)번째 열은 \\(q_j\\)를 누를 때 무엇이 바뀌는지 나타내요.",
            "The tap-count vector. Entry \\(x_j\\) counts taps on \\(q_j\\) modulo \\(n\\).": "누름 횟수 벡터. 성분 \\(x_j\\)는 \\(q_j\\)를 누른 횟수를 \\(n\\)으로 나눈 나머지예요.",
            "The image of \\(A\\). It contains every board change you can make with taps.": "\\(A\\)의 상. 칸을 눌러 만들 수 있는 모든 변화의 집합이에요.",
            "The kernel of \\(A\\). It contains every tap-count vector whose combined effect is zero.": "\\(A\\)의 핵. 전체 효과가 0인 누름 횟수 벡터들의 집합이에요.",
            "Language": "언어",
            "Sound": "효과음",
            "Show numbers on tiles": "칸에 숫자 표시",
            "Show numbers in Playground": "실험실에서 숫자 표시",
            "About": "게임 정보",
            "About Invert the Matrix": "Invert the Matrix 게임 정보",
            "Changelog": "업데이트 내역",
            "Complete": "완료",
            "Level Complete": "레벨 완료",
            "Daily Complete": "일일 도전 완료",
            "Stars earned": "획득한 별",
            "Taps Used": "누른 횟수",
            "Minimum": "최소 횟수",
            "Best Taps": "최고 기록",
            "Star thresholds": "별 획득 기준",
            "Next Level": "다음 레벨",
            "Replay": "다시 하기",
            "Menu": "메뉴",
            "New Puzzle": "새 퍼즐",
            "Version": "버전",
            "Best": "최고 기록",
            "Chapter": "챕터",
            "Inversion": "뒤집기",
            "You can now play in Korean. We also rewrote How to Play and the math guide, from your first tap to the equations behind a solution.": "이제 한국어로 플레이할 수 있어요. 첫 칸을 누르는 법부터 풀이에 쓰이는 방정식까지, 게임 방법과 퍼즐 속 수학의 설명을 다듬었어요.",
            "Improved Android 16 compatibility, system Back navigation, and screen layout around system bars. The Android app now requires Android 7 or later.": "Android 16 호환성을 높이고 시스템 뒤로 가기와 상태 표시줄 및 탐색 메뉴 주변의 화면 배치를 개선했어요. 이제 Android 7 이상에서 플레이할 수 있어요.",
            "Updated AndroidX Activity and Fragment dependencies to current supported releases for Play compatibility.": "Google Play와 호환되도록 AndroidX의 Activity와 Fragment 라이브러리를 업데이트했어요.",
            "Android now targets Android 16, keeps system Back navigation reliable, and makes the all-white goal clear with tap-effect help available on demand.": "Android 16에 맞춰 시스템 뒤로 가기를 개선했어요. 모든 칸을 흰색으로 만드는 목표를 더 쉽게 확인할 수 있고, 필요할 때 누르기 패턴 설명을 열어 볼 수 있어요.",
            "The main menu now includes Achievements, the animated board is larger, and Android opens Play Games achievement status while the web app shows campaign achievement progress.": "메인 메뉴에 업적을 추가하고 움직이는 퍼즐판을 키웠어요. Android에서는 Play 게임즈 업적을, 웹에서는 캠페인 업적 달성 현황을 볼 수 있어요.",
            "First production release with campaign levels, daily challenges, custom puzzles, Playground boards, hints, stars, and Play Games achievements.": "첫 정식 버전이에요. 캠페인과 일일 도전, 맞춤 퍼즐, 실험실을 즐기고 힌트를 쓰거나 별과 Play 게임즈 업적을 모을 수 있어요.",
            "Added a separate setting for Playground tile numbers, keeping Playground boards number-free unless it is turned on.": "실험실의 숫자 표시를 따로 설정할 수 있어요. 설정에서 켜면 칸에 숫자가 나타나요.",
            "The Android release is prepared with version code 12, native debug symbols for Play Console crash reports, and refreshed changelog notes for the latest Play Store build.": "Android 버전 코드를 12로 올렸어요. Play Console에서 비정상 종료의 원인을 파악할 수 있도록 디버그 기호를 포함하고 최신 Play 스토어 버전의 업데이트 내역을 정리했어요.",
            "Playground adds shareable puzzle codes, campaign now uses a 5x5 group map, and the Playground logo is now a tile-colored basketball. Menu headers, locks, and text-size controls were polished across web and Android.": "실험실 퍼즐을 코드로 공유할 수 있어요. 캠페인의 그룹을 5×5 지도에 배치하고 실험실 아이콘을 칸 색깔로 꾸민 농구공으로 바꿨어요. 웹과 Android의 메뉴 제목, 자물쇠, 글자 크기 버튼도 다듬었어요.",
            "Daily challenges now separate puzzle cards from leaderboards, custom setup uses visual pattern chips with unique generation always on, and game/result screens are clearer.": "일일 도전에서 퍼즐과 순위표를 나눴어요. 맞춤 레벨에서는 그림으로 패턴을 고를 수 있고 풀이가 하나인 퍼즐을 우선해서 만들어요. 퍼즐 화면과 결과 화면도 읽기 쉽게 바꿨어요.",
            "Settings now hide platform-specific controls, animation and colorblind-symbol toggles were removed, and About shows version history with the GitHub link.": "설정에는 기기에서 쓸 수 있는 옵션만 보여요. 애니메이션과 색 구분용 기호 설정을 없애고 게임 정보에 버전 기록과 GitHub 링크를 추가했어요.",
            "Release builds keep native debug symbols for Play Console crash reports.": "Play Console에서 비정상 종료의 원인을 파악할 수 있도록 배포 버전에 네이티브 디버그 기호를 포함했어요.",
            "The Math guide explains solution uniqueness and matrix invertibility.": "퍼즐 속 수학에서 해가 유일할 조건과 행렬이 가역일 조건을 설명해요.",
            "Cross": "십자",
            "Diagonal": "대각선",
            "Square": "정사각형",
            "Horizontal line": "가로줄",
            "Vertical line": "세로줄",
            "Self only": "누른 칸만",
            "Knight": "나이트",
            "Random mixed": "무작위 조합",
            "Mixed": "혼합",
            "Easy": "쉬움",
            "Medium": "보통",
            "Hard": "어려움",
            "Expert": "전문가",
            "Custom": "직접 입력",
            "Loading campaign": "캠페인 불러오는 중",
            "Preparing the level list.": "레벨 목록을 준비하고 있어요.",
            "Loading the fixed campaign levels from the bundled JSON.": "캠페인 레벨을 불러오고 있어요.",
            "Campaign data unavailable": "캠페인을 불러올 수 없어요",
            "The bundled campaign asset could not be loaded. Reload the app or check that campaign-levels.json is included.": "캠페인 데이터를 읽을 수 없어요. 게임을 다시 열어 주세요.",
            "No campaign levels found": "캠페인 레벨이 없어요",
            "The campaign could not be prepared. Reload the app to rebuild the level list.": "캠페인을 준비하지 못했어요. 게임을 다시 열어 레벨 목록을 불러와 주세요.",
            "The fixed campaign data is missing. Reload the app or check the bundled asset.": "캠페인 데이터가 없어요. 게임을 다시 열어 주세요.",
            "No daily puzzles available": "일일 도전을 불러올 수 없어요",
            "Daily puzzles are generated from the current date. Reload the app to try again.": "일일 도전은 날짜에 맞춰 만들어요. 게임을 다시 열어 주세요.",
            "Lock icons on": "잠긴 칸 사용",
            "Lock icons off": "잠긴 칸 사용 안 함",
            "Empty hole": "빈자리",
            "Empty holes on": "빈자리 사용",
            "Empty holes off": "빈자리 사용 안 함",
            "Not played today": "오늘 기록 없음",
            "not completed today": "오늘 미완료",
            "First try counts": "첫 시도만 기록",
            "Replays open": "다시 도전 가능",
            "daily challenge": "일일 도전",
            "state": "상태",
            "states": "상태",
            "tap": "회",
            "taps": "회",
            "star": "별",
            "stars": "별",
            "out of 3 stars": "별 3개 중",
            "current best": "현재 최고 기록",
            "Level": "레벨",
            "locked": "잠김",
            "complete": "완료",
            "earned": "획득",
            "hint used": "힌트 사용",
            "not complete": "미완료",
            "Row": "행",
            "column": "열",
            "pattern": "패턴",
            "Previewing this tap.": "누르면 바뀌는 칸을 미리 보고 있어요.",
            "No useful tap is available.": "적용할 수 있는 힌트가 없어요.",
            "Hint applied. Red tiles changed. This try is worth 0 stars.": "힌트로 바뀐 칸에 빨간 테두리가 생겼어요. 이번에는 별을 얻을 수 없어요.",
            "Binary Beginnings": "두 가지 색의 시작",
            "Fourfold Flips": "네 줄 뒤집기",
            "Fourfold Focus": "네 줄에 집중",
            "Fourfold Mastery": "네 줄의 달인",
            "Lights With Lock Icons": "잠긴 불빛",
            "Lockstep Squares": "나란히 놓인 네모",
            "First Empty Holes": "첫 빈자리",
            "Binary Breakaways": "두 가지 색의 탈출",
            "Fivefold Binary": "다섯 줄, 두 가지 색",
            "Three-Color Start": "세 가지 색의 시작",
            "Triple Grid": "세 가지 색의 격자",
            "Three Lock-Icon Tiles": "세 가지 색과 자물쇠",
            "Three Empty Holes": "세 가지 색과 빈자리",
            "Triple Combine": "세 가지 색의 조합",
            "Pattern Primer": "패턴 첫걸음",
            "Patterns With Lock Icons": "패턴과 자물쇠",
            "Color Gauntlet": "색깔 도전",
            "Four-State Start": "네 가지 상태의 시작",
            "Four-State Grid": "네 가지 상태의 격자",
            "Four-State Lock-Icon Tiles": "네 가지 상태와 자물쇠",
            "Four-State Empty Holes": "네 가지 상태와 빈자리",
            "Four-State Patterns": "네 가지 상태의 패턴",
            "Four-State Matrix": "네 가지 상태의 행렬",
            "Five-State Start": "다섯 가지 상태의 시작",
            "Five-State Grid": "다섯 가지 상태의 격자",
            "Five-State Matrix": "다섯 가지 상태의 행렬",
            "Five-State Lock-Icon Tiles": "다섯 가지 상태와 자물쇠",
            "Five-State Empty Holes": "다섯 가지 상태와 빈자리",
            "Five-State Patterns": "다섯 가지 상태의 패턴",
            "Dense Dimensions": "빽빽한 격자",
            "Prime Pressure": "소수의 도전",
            "Modular Maze": "나머지의 미로",
            "Wide Matrix": "넓은 행렬",
            "Endgame Circuit": "마지막 회로",
            "Final Inversion": "마지막 뒤집기"
        },
        es: {
            "Mixed patterns": "Patrones mixtos",
            "Options": "Opciones",
            "Edit tool": "Herramienta de edición",
            "pportilla on GitHub": "pportilla en GitHub",
            "{n} states": "{n} estados",
            "{n} star": "{n} estrella",
            "{n} stars": "{n} estrellas",
            "{n} out of 3 stars": "{n} de 3 estrellas",
            "{n} tap": "{n} toque",
            "{n} taps": "{n} toques",
            "{n}+ taps": "{n} toques o más",
            "Row {row}, column {column}": "Fila {row}, columna {column}",
            "Paint color {n}": "Pintar con el color {n}",
            "A modular tile puzzle": "Un rompecabezas modular",
            "Main menu": "Menú principal",
            "Campaign": "Campaña",
            "Custom Level": "Nivel personalizado",
            "Playground": "Zona de pruebas",
            "Daily Challenge": "Reto diario",
            "Daily Challenges": "Retos diarios",
            "Leaderboards": "Clasificaciones",
            "Leaderboard": "Clasificación",
            "Achievements": "Logros",
            "Campaign achievements": "Logros de campaña",
            "Clear": "Completar",
            "Master": "Maestría",
            "Unlocked": "Desbloqueado",
            "Locked": "Bloqueado",
            "Complete every level in this group.": "Completa todos los niveles de este grupo.",
            "Earn every star in this group.": "Gana todas las estrellas de este grupo.",
            "Global": "Global",
            "All daily tiers": "Todos los niveles diarios",
            "How to Play": "Cómo jugar",
            "The Math": "Las matemáticas",
            "Settings": "Ajustes",
            "Back": "Volver",
            "Campaign chapters": "Capítulos de la campaña",
            "Campaign groups": "Grupos de campaña",
            "Group": "Grupo",
            "Earn 15 stars in a nearby group.": "Gana 15 estrellas en un grupo adyacente.",
            "Custom Puzzle": "Rompecabezas personalizado",
            "Playground setup": "Configuración de zona de pruebas",
            "Playground controls": "Controles de zona de pruebas",
            "Playground board": "Tablero de zona de pruebas",
            "Custom level setup": "Configuración de nivel personalizado",
            "Grid Size": "Tamaño de cuadrícula",
            "Grid size": "Tamaño de cuadrícula",
            "Width": "Anchura",
            "Height": "Altura",
            "States": "Estados",
            "Number of states": "Número de estados",
            "Tap Pattern": "Patrón de toque",
            "Tap pattern": "Patrón de toque",
            "Difficulty": "Dificultad",
            "Edit Tool": "Herramienta de edición",
            "Tap Tiles": "Tocar casillas",
            "Paint White": "Pintar blanco",
            "Paint Color": "Pintar color",
            "Paint States": "Pintar estados",
            "Lock Tiles": "Poner candados",
            "Place Holes": "Poner huecos",
            "Starting Board": "Tablero inicial",
            "Playground board editor": "Editor de tablero de zona de pruebas",
            "Puzzle Code": "Código de rompecabezas",
            "Puzzle code": "Código de rompecabezas",
            "Share": "Compartir",
            "Load Code": "Cargar código",
            "Copy Code": "Copiar código",
            "Clear Board": "Borrar tablero",
            "Play": "Jugar",
            "Sandbox": "Zona libre",
            "No goal": "Sin objetivo",
            "Puzzle code copied.": "Código copiado.",
            "Puzzle code loaded.": "Código cargado.",
            "Puzzle code not recognized.": "Código no reconocido.",
            "Keep at least one tile.": "Mantén al menos una casilla.",
            "Hints are off in Playground.": "Las pistas están desactivadas en Zona de pruebas.",
            "Tiles with lock icons": "Casillas con candado",
            "Irregular board": "Tablero irregular",
            "Extras": "Extras",
            "Unique solution preferred": "Preferir solución única",
            "Create Puzzle": "Crear rompecabezas",
            "Daily": "Diario",
            "Daily puzzle tiers": "Niveles del reto diario",
            "Puzzle status": "Estado del rompecabezas",
            "Taps": "Toques",
            "Star ranking": "Clasificación de estrellas",
            "Time": "Tiempo",
            "Puzzle details": "Detalles del rompecabezas",
            "Pattern": "Patrón",
            "Tap pattern info": "Información del patrón de toque",
            "Personal Best": "Mejor marca",
            "Board actions": "Acciones del tablero",
            "Undo": "Deshacer",
            "Reset": "Reiniciar",
            "Hint": "Pista",
            "Puzzle board": "Tablero del rompecabezas",
            "Guide": "Guía",
            "Text size": "Tamaño del texto",
            "Small text": "Texto pequeño",
            "Medium text": "Texto mediano",
            "Large text": "Texto grande",
            "Play overview": "Resumen del juego",
            "Turn every tile white. A single tap can change several tiles at once.": "Deja todo el tablero en blanco. Con un solo toque puedes cambiar varias casillas a la vez.",
            "Before you tap, hold a tile to see where its pattern reaches.": "Antes de tocar una casilla, mantenla pulsada para ver hasta dónde llega su patrón.",
            "Rules": "Reglas",
            "1. Read the colors": "1. Fíjate en los colores",
            "White is the color you want every tile to reach.": "El blanco es el color al que deben llegar todas las casillas.",
            "A white tile can still change color if another tap reaches it.": "Una casilla blanca puede volver a cambiar de color si la alcanza otro toque.",
            "You solve the puzzle when all the tiles are white at once.": "Resuelves el nivel cuando todas las casillas están blancas a la vez.",
            "2. Follow the color cycle": "2. Sigue el ciclo de colores",
            "Tap an unlocked tile. Its pattern tells you which tiles will change.": "Toca una casilla sin candado. Su patrón indica qué casillas cambiarán.",
            "Each tile in the pattern moves on to its next color.": "Cada casilla que alcanza el patrón pasa al siguiente color.",
            "After the last color comes white again.": "Después del último color vuelve el blanco.",
            "3. Check the pattern": "3. Comprueba el patrón",
            "Look for crosses, diagonals, squares, rows, columns and even chess knight moves. Some boards mix several patterns.": "Hay cruces, diagonales, cuadrados, filas, columnas y hasta saltos de caballo de ajedrez. Algunos tableros combinan varios patrones.",
            "Hold a tile to preview its pattern. Lift your finger when you’re done looking.": "Mantén pulsada una casilla para ver su patrón. Cuando termines de mirarlo, levanta el dedo.",
            "4. Locks and holes": "4. Candados y huecos",
            "A locked tile still has to turn white.": "Las casillas con candado también tienen que quedar blancas.",
            "To change it, tap another tile whose pattern reaches it.": "Para cambiar una casilla con candado, toca otra cuyo patrón la alcance.",
            "A hole is just a gap in the board. Tap patterns skip it.": "Donde hay un hueco no hay casilla. Los patrones de toque se lo saltan.",
            "Modes": "Modos",
            "Choose your puzzle": "Elige tu rompecabezas",
            "Campaign:": "Campaña:",
            "Solve fixed levels in order. Each solve opens the next level.": "Resuelve niveles fijos en orden. Cada victoria abre el siguiente nivel.",
            "Pick a group on the 5 × 5 map. Earn 15 stars there to unlock the groups directly beside it, above it and below it.": "Elige un grupo en el mapa de 5 × 5. Consigue 15 estrellas en él para desbloquear los grupos que tenga a la izquierda, a la derecha, arriba y abajo.",
            "Custom Level:": "Nivel personalizado:",
            "Choose the board size, number of colors, pattern and difficulty. You can add locks and holes. The game looks for a puzzle with a unique solution when it can.": "Elige el tamaño del tablero, el número de colores, el patrón y la dificultad. Puedes añadir candados y huecos. El juego procura crear un rompecabezas con una única solución.",
            "Playground:": "Zona de pruebas:",
            "Build your own board and share it with a puzzle code. You can keep experimenting even after every tile turns white.": "Crea tu propio tablero y comparte su código. Puedes seguir probando toques incluso cuando todo el tablero esté en blanco.",
            "Daily Challenge:": "Reto diario:",
            "Everyone gets the same three puzzles each day. Each one keeps its own best score.": "Cada día hay tres rompecabezas iguales para todos. Tu mejor resultado se guarda por separado en cada uno.",
            "Tools and options": "Herramientas y opciones",
            "Taps, stars, and hints": "Toques, estrellas y pistas",
            "Previewing a pattern is free. Your tap counts when the tiles change.": "Ver el patrón no cuesta ningún toque. El toque cuenta cuando cambian las casillas.",
            "For three stars, solve the puzzle in as few taps as the game’s best known solution, or fewer.": "Para ganar tres estrellas, iguala o mejora el número de toques de la mejor solución que ha encontrado el juego.",
            "The one- and two-star targets leave room for extra taps.": "Los objetivos de una y dos estrellas dejan margen para más toques.",
            "Undo takes back your last tap. Reset puts the board back the way it started.": "Deshacer anula tu último toque. Reiniciar te devuelve al tablero inicial.",
            "A hint plays one tap for you. You can still finish that attempt, but it earns no stars.": "Una pista da un toque por ti. Puedes terminar ese intento, aunque no ganarás estrellas.",
            "Look for the red outlines to see which tiles the hint changed.": "El borde rojo señala las casillas que ha cambiado la pista.",
            "When you tap a tile, this pattern is centered on that tile. Every tile inside the pattern changes state.": "Al tocar una casilla, este patrón se centra en esa casilla. Cada casilla dentro del patrón cambia de estado.",
            "The green outline matches the preview you see when you hold a tile.": "El borde verde coincide con la vista previa que ves al mantener presionada una casilla.",
            "Turn sound effects on or off in Settings.": "En Ajustes puedes activar o desactivar los efectos de sonido.",
            "If you prefer numbers, turn them on to see each tile’s state alongside its color.": "Si prefieres guiarte por números, actívalos para ver el estado de cada casilla además de su color.",
            "On Android, you can also turn vibration on or off.": "En Android también puedes activar o desactivar la vibración.",
            "Math overview": "Resumen matemático",
            "What happens when you add up the taps?": "¿Qué pasa cuando sumas los efectos de los toques?",
            "Take a board with just two colors. Tap the center of a cross and every tile in the cross switches between white and blue. Tap the same spot again and you’re back where you started. The same rule works with other patterns. With more colors, it takes more taps to go all the way around the cycle.": "Imagina un tablero de dos colores. Toca el centro de una cruz y todas sus casillas pasan de blanco a azul o de azul a blanco. Toca el mismo sitio otra vez y vuelves al punto de partida. La idea también funciona con otros patrones y con más colores. Si hay más colores, harán falta más toques para recorrer el ciclo.",
            "Modeling the game": "El modelo matemático",
            "The board in one equation": "El tablero en una ecuación",
            "Give white the number \\(0\\) and count up through the colors. On a board with \\(n\\) colors, the next step after \\(n-1\\) is \\(0\\) again. This is arithmetic modulo \\(n\\), written in the ring \\(R=\\mathbb Z/n\\mathbb Z\\).": "Asigna el \\(0\\) al blanco y numera los demás colores en orden. Si hay \\(n\\) colores, después de \\(n-1\\) vuelves al \\(0\\). Así funciona la aritmética módulo \\(n\\) en el anillo \\(R=\\mathbb Z/n\\mathbb Z\\).",
            "Now read the tiles in a fixed order. Their numbers form the board vector \\(s\\). Put the effect of each possible tap in a column of a matrix \\(A\\). If \\(x\\) records how often you tap each unlocked tile, \\(Ax\\) gives the total change. You win when \\(s+Ax=0\\).": "Lee las casillas siempre en el mismo orden. Sus números forman el vector del tablero \\(s\\). Escribe el efecto de cada toque posible en una columna de la matriz \\(A\\). Si \\(x\\) recoge el número de toques que das en cada casilla, \\(Ax\\) es el cambio total. Ganas cuando \\(s+Ax=0\\).",
            "With \\(2\\), \\(3\\) or \\(5\\) states, \\(R\\) is a field. Every nonzero element has a multiplicative inverse, so you can divide by it. With four states, even a simple division by \\(2\\) can go wrong. We’ll see why below.": "Con \\(2\\), \\(3\\) o \\(5\\) estados, \\(R\\) es un cuerpo. Cada elemento distinto de cero tiene inverso multiplicativo, así que puedes dividir por él. Con cuatro estados, hasta una división por \\(2\\) puede dar problemas. Más abajo veremos por qué.",
            "Lights Out generalization": "Generalización de Lights Out",
            "From Lights Out": "Del juego Lights Out",
            "From two states to many": "De dos estados a varios",
            "In the classic Lights Out puzzle, a tap flips the chosen tile and its neighbors above, below, left and right. Each flip adds \\(1\\) modulo \\(2\\). Two taps in the same spot cancel because \\(1+1=0\\) modulo \\(2\\).": "En el clásico Lights Out, un toque cambia la casilla elegida y sus vecinas de arriba, abajo, izquierda y derecha. Cada cambio suma \\(1\\) módulo \\(2\\). Dos toques en el mismo sitio se anulan porque \\(1+1=0\\) módulo \\(2\\).",
            "Invert the Matrix adds more states and patterns, but tap effects still add together. Skip holes when you list the tiles. Include locked tiles, since a tap on another tile can change them.": "Invert the Matrix añade más estados y patrones, pero los efectos de los toques se siguen sumando. Al enumerar las casillas, omite los huecos e incluye las casillas con candado, que pueden cambiar con un toque en otra casilla.",
            "Can you combine the available taps to cancel the starting board? The change you need is \\(-s\\).": "¿Puedes combinar los toques disponibles para anular el tablero inicial? El cambio que buscas es \\(-s\\).",
            "1. The board is a vector": "1. El tablero es un vector",
            "Number the \\(m\\) tiles \\(p_1,\\ldots,p_m\\) in any fixed order. Write their states in that same order to get \\(s=(s_1,\\ldots,s_m)\\in R^m\\). Each entry \\(s_i\\) is the color of tile \\(p_i\\). An all-white board is the zero vector.": "Numera las \\(m\\) casillas como \\(p_1,\\ldots,p_m\\) en el orden que prefieras. Escribe sus estados en ese mismo orden para obtener \\(s=(s_1,\\ldots,s_m)\\in R^m\\). Cada componente \\(s_i\\) indica el color de la casilla \\(p_i\\). Un tablero en blanco es el vector cero.",
            "2. Each tap contributes a column": "2. Cada toque aporta una columna",
            "Label the \\(r\\) tiles you can tap \\(q_1,\\ldots,q_r\\). Tap \\(q_j\\) once and record a \\(1\\) for each tile that changes and a \\(0\\) for each tile that stays the same. The result is its effect vector \\(v_j\\), column \\(j\\) of \\(A\\).": "Llama \\(q_1,\\ldots,q_r\\) a las \\(r\\) casillas que puedes tocar. Toca \\(q_j\\) una vez y anota un \\(1\\) por cada casilla que cambie y un \\(0\\) por cada una que quede igual. Así obtienes su vector de efecto \\(v_j\\), la columna \\(j\\) de \\(A\\).",
            "Read across a row to see which taps affect one tile. Read down a column to see which tiles one tap affects. A locked tile has a row of its own, but you can’t tap it, so it has no column.": "Lee una fila para ver qué toques afectan a una casilla. Lee una columna para ver qué casillas cambia un toque. Una casilla con candado tiene su propia fila, pero como no puedes tocarla, no tiene columna.",
            "Solving equation": "Ecuación de resolución",
            "Goal": "Objetivo",
            "How many times should you tap each tile?": "¿Cuántas veces hay que tocar cada casilla?",
            "The tap-count vector \\(x=(x_1,\\ldots,x_r)\\) records how often you tap each unlocked tile, modulo \\(n\\). Each tap on \\(q_j\\) adds the same \\(v_j\\), so together the taps add \\(Ax=\\sum_j x_jv_j\\). You can play them in any order.": "El vector de toques \\(x=(x_1,\\ldots,x_r)\\) recoge cuántas veces tocas cada casilla sin candado, módulo \\(n\\). Cada toque en \\(q_j\\) suma el mismo vector \\(v_j\\), así que el cambio total es \\(Ax=\\sum_j x_jv_j\\). Puedes dar los toques en el orden que quieras.",
            "The final board is \\(s+Ax\\). To make it all white, look for a vector \\(x\\) that solves \\(Ax=-s\\) in \\(R\\).": "El tablero final es \\(s+Ax\\). Para dejarlo en blanco, busca un vector \\(x\\) que resuelva \\(Ax=-s\\) en \\(R\\).",
            "When does a solution exist?": "¿Cuándo existe una solución?",
            "Every tap-count vector produces a change \\(Ax\\). All those changes together form the image of \\(A\\), written \\(\\operatorname{Im}(A)\\). A board has a solution exactly when \\(-s\\) belongs to this image.": "Cada vector de toques produce un cambio \\(Ax\\). El conjunto de todos esos cambios es la imagen de \\(A\\), que se escribe \\(\\operatorname{Im}(A)\\). Un tablero tiene solución si y solo si \\(-s\\) pertenece a esa imagen.",
            "When \\(n\\) is prime, you can check by row reducing the augmented matrix \\([A\\mid -s]\\) to echelon form. A row saying \\(0=c\\) with \\(c\\ne0\\) rules out a solution. If no such row appears, you can read off at least one solution by back substitution.": "Si \\(n\\) es primo, puedes escalonar la matriz ampliada \\([A\\mid -s]\\) mediante operaciones por filas. Una fila que diga \\(0=c\\) con \\(c\\ne0\\) descarta toda solución. Si no aparece ninguna, puedes obtener una solución por sustitución hacia atrás.",
            "What changes with four states?": "¿Qué cambia con cuatro estados?",
            "When \\(n\\) is composite, \\(R\\) is still a ring, but some nonzero elements have no multiplicative inverse. For example, modulo \\(4\\), twice any number is even, so \\(2a\\) can never equal \\(1\\). You can’t divide a row by \\(2\\) here.": "Si \\(n\\) es compuesto, \\(R\\) sigue siendo un anillo, pero algunos elementos distintos de cero carecen de inverso multiplicativo. Por ejemplo, módulo \\(4\\), el doble de cualquier número es par, así que \\(2a\\) nunca puede valer \\(1\\). Aquí no puedes dividir una fila por \\(2\\).",
            "The test for a solution is still \\(-s\\in\\operatorname{Im}(A)\\). Use row operations valid in the ring. If \\(n\\) factors into coprime prime powers, you can also solve modulo each of those powers and combine the results.": "El criterio sigue siendo \\(-s\\in\\operatorname{Im}(A)\\). Usa operaciones por filas válidas en el anillo. Si \\(n\\) se descompone en potencias de primos distintos, también puedes resolver el sistema módulo cada potencia y combinar los resultados.",
            "When is the solution unique?": "¿Cuándo es única la solución?",
            "Suppose \\(x_0\\) solves the board. If a tap-count vector \\(z\\) leaves the board unchanged, then \\(Az=0\\) and \\(x_0+z\\) also solves it. These vectors \\(z\\) form the kernel of \\(A\\), written \\(\\ker(A)\\). Adding each of them to \\(x_0\\) gives all the solutions.": "Supón que \\(x_0\\) resuelve el tablero. Si un vector de toques \\(z\\) deja el tablero igual, entonces \\(Az=0\\) y \\(x_0+z\\) también es solución. Estos vectores \\(z\\) forman el núcleo de \\(A\\), que se escribe \\(\\ker(A)\\). Al sumar cada uno a \\(x_0\\) obtienes todas las soluciones.",
            "Remember that counts are taken modulo \\(n\\). Tapping one tile \\(n\\) extra times takes its whole pattern around the color cycle. It leaves both the board and the tap-count vector unchanged.": "Recuerda que los toques se cuentan módulo \\(n\\). Si tocas una casilla \\(n\\) veces más, todas las casillas de su patrón completan el ciclo de colores. Tanto el tablero como el vector de toques quedan igual.",
            "So a solvable board has exactly one tap-count vector when \\(\\ker(A)=\\{0\\}\\). Over a field, this means the columns of \\(A\\) are linearly independent. The kernel test also works in the four-state ring.": "Así, un tablero con solución tiene un único vector de toques si y solo si \\(\\ker(A)=\\{0\\}\\). Sobre un cuerpo, esto significa que las columnas de \\(A\\) son linealmente independientes. El criterio del núcleo también vale en el anillo de cuatro estados.",
            "When is \\(A\\) invertible?": "¿Cuándo es invertible \\(A\\)?",
            "If you can tap every tile, \\(A\\) has one row and one column per tile, so it is square. Holes leave that count balanced. A lock removes a column and keeps the row. When a square \\(A\\) is invertible, every starting board has exactly one tap-count solution.": "Si puedes tocar todas las casillas, \\(A\\) tiene una fila y una columna por casilla, así que es cuadrada. Los huecos no alteran esa igualdad. Un candado elimina una columna y conserva la fila. Si la matriz cuadrada \\(A\\) es invertible, cada tablero inicial tiene un único vector de toques que lo resuelve.",
            "A square \\(A\\) is invertible exactly when its determinant has a multiplicative inverse in \\(R\\). For prime \\(n\\), the determinant must be nonzero modulo \\(n\\). For \\(n=4\\), it must be odd. If this test fails, some starting boards have no solution and others have several. For a rectangular matrix, use the image to test existence and the kernel to test uniqueness.": "Una matriz cuadrada \\(A\\) es invertible si y solo si su determinante tiene inverso multiplicativo en \\(R\\). Para \\(n\\) primo, el determinante debe ser distinto de cero módulo \\(n\\). Para \\(n=4\\), debe ser impar. Si falla este criterio, hay tableros sin solución y otros con varias. Para una matriz rectangular, la imagen indica si hay solución y el núcleo si es única.",
            "Counting the taps in a solution": "Cómo contar los toques de una solución",
            "To play a solution, take each count \\(x_j\\) as a number from \\(0\\) to \\(n-1\\). Call that number \\(t_j\\). Add these numbers as ordinary integers to get the number of taps, \\(\\ell(x)\\). The shortest solution the game has found sets the three-star target.": "Para jugar una solución, representa cada componente \\(x_j\\) con un número entre \\(0\\) y \\(n-1\\), que llamaremos \\(t_j\\). Suma esos números como enteros para obtener el total de toques, \\(\\ell(x)\\). La solución más corta que ha encontrado el juego fija el objetivo de tres estrellas.",
            "How the game finds a short solution": "Cómo busca el juego una solución corta",
            "If the board has few enough possible states, the game searches all positions one tap away, then two taps away, and so on. The first time it reaches an all-white board, it has found the fewest taps possible.": "Si el tablero tiene pocas configuraciones posibles, el juego explora primero las que están a un toque, luego las que están a dos y así sucesivamente. La primera vez que llega a un tablero en blanco, ha encontrado el mínimo de toques.",
            "For larger boards with a prime number of states per tile, the game row reduces \\(Ax=-s\\). If there are few enough solutions to try, it compares them all and keeps one with the fewest taps. When an exact search is too large, including on large four-state boards, it uses a known solution whose length may be above the minimum.": "En tableros más grandes con un número primo de estados por casilla, el juego reduce el sistema \\(Ax=-s\\) por filas. Si hay pocas soluciones, las compara todas y guarda una de las que requieren menos toques. Cuando la búsqueda exacta resulta demasiado grande, como en los tableros grandes de cuatro estados, usa una solución conocida que puede superar el mínimo.",
            "Different tap-count vectors can tie for the minimum, and you can play the same vector in different orders. When the game proves a minimum, it always picks the same plan among those tied for shortest. It doesn’t tell you whether another plan ties with it.": "Distintos vectores de toques pueden empatar en el mínimo, y puedes jugar un mismo vector en órdenes distintos. Cuando el juego comprueba el mínimo, elige siempre el mismo plan entre los más cortos. No indica si hay otro igual de corto.",
            "Locked tiles and holes in the matrix": "Candados y huecos en la matriz",
            "To model a hole, leave that position out entirely. To model a lock, keep the tile’s entry in \\(s\\) and its row in \\(A\\), since it still has to turn white. Leave out its column. The remaining columns tell you which other taps can change it.": "Para representar un hueco, omite esa posición por completo. Para un candado, conserva la componente de la casilla en \\(s\\) y su fila en \\(A\\), porque también debe quedar blanca. Omite su columna. Las demás columnas indican qué otros toques pueden cambiarla.",
            "How puzzles are made": "Cómo se crean los rompecabezas",
            "The generator starts with a white board and scrambles it with allowed taps. It keeps track of how to undo their combined effect, so the starting board comes with a solution. When it can, the solver finds a shortest plan for the star targets. A hint plays one tap toward a solution and outlines the tiles it changed in red.": "El generador empieza con un tablero en blanco y lo mezcla con toques permitidos. Guarda cómo anular el efecto conjunto de esos toques, así que el tablero inicial ya tiene solución. Cuando es posible, busca un plan de longitud mínima para fijar los objetivos de estrellas. Cada pista da un toque hacia la solución y marca en rojo las casillas que cambia.",
            "What the symbols mean": "Qué significan los símbolos",
            "The number of states per tile. It can be \\(2\\), \\(3\\), \\(4\\) or \\(5\\) and is the modulus for this board.": "El número de estados por casilla. Puede ser \\(2\\), \\(3\\), \\(4\\) o \\(5\\) y es el módulo del tablero.",
            "The board vector. Each entry is the state of one tile.": "El vector del tablero. Cada componente indica el estado de una casilla.",
            "The tap matrix. Column \\(j\\) shows what changes when you tap \\(q_j\\).": "La matriz de toques. La columna \\(j\\) muestra qué cambia al tocar \\(q_j\\).",
            "The tap-count vector. Entry \\(x_j\\) counts taps on \\(q_j\\) modulo \\(n\\).": "El vector de toques. La componente \\(x_j\\) cuenta los toques en \\(q_j\\) módulo \\(n\\).",
            "The image of \\(A\\). It contains every board change you can make with taps.": "La imagen de \\(A\\). Contiene todos los cambios que puedes producir con toques.",
            "The kernel of \\(A\\). It contains every tap-count vector whose combined effect is zero.": "El núcleo de \\(A\\). Contiene todos los vectores de toques cuyo efecto total es cero.",
            "Language": "Idioma",
            "Sound": "Sonido",
            "Show numbers on tiles": "Mostrar números en las casillas",
            "Show numbers in Playground": "Mostrar números en Zona de pruebas",
            "About": "Acerca de",
            "About Invert the Matrix": "Acerca de Invert the Matrix",
            "Changelog": "Historial de cambios",
            "Complete": "Completado",
            "Level Complete": "Nivel completado",
            "Daily Complete": "Diario completado",
            "Stars earned": "Estrellas ganadas",
            "Taps Used": "Toques usados",
            "Minimum": "Mínimo",
            "Best Taps": "Mejor marca",
            "Star thresholds": "Umbrales de estrellas",
            "Next Level": "Siguiente nivel",
            "Replay": "Repetir",
            "Menu": "Menú",
            "New Puzzle": "Nuevo rompecabezas",
            "Version": "Versión",
            "Best": "Mejor",
            "Chapter": "Capítulo",
            "Inversion": "Inversión",
            "You can now play in Korean. We also rewrote How to Play and the math guide, from your first tap to the equations behind a solution.": "Ya puedes jugar en coreano. Hemos revisado las instrucciones y la guía de matemáticas, desde tu primer toque hasta las ecuaciones que explican cómo resolver un tablero.",
            "Improved Android 16 compatibility, system Back navigation, and screen layout around system bars. The Android app now requires Android 7 or later.": "Se mejoraron la compatibilidad con Android 16, la navegación Atrás del sistema y la distribución de la pantalla junto a las barras del sistema. La aplicación de Android requiere ahora Android 7 o posterior.",
            "Updated AndroidX Activity and Fragment dependencies to current supported releases for Play compatibility.": "Se actualizaron las dependencias AndroidX Activity y Fragment a versiones compatibles actuales para Google Play.",
            "Android now targets Android 16, keeps system Back navigation reliable, and makes the all-white goal clear with tap-effect help available on demand.": "La app ahora está orientada a Android 16, mantiene fiable la navegación Atrás del sistema y deja claro el objetivo de poner todas las casillas en blanco, con ayuda del efecto de toque disponible cuando se necesite.",
            "The main menu now includes Achievements, the animated board is larger, and Android opens Play Games achievement status while the web app shows campaign achievement progress.": "El menú principal ahora incluye Logros, el tablero animado es más grande y Android abre el estado de logros de Play Games mientras la app web muestra el progreso de logros de campaña.",
            "First production release with campaign levels, daily challenges, custom puzzles, Playground boards, hints, stars, and Play Games achievements.": "Primera versión de producción con niveles de campaña, retos diarios, rompecabezas personalizados, tableros de Zona de pruebas, pistas, estrellas y logros de Play Games.",
            "Added a separate setting for Playground tile numbers, keeping Playground boards number-free unless it is turned on.": "Se añadió un ajuste separado para los números en casillas de Zona de pruebas, para que sus tableros no muestren números salvo que esté activado.",
            "The Android release is prepared with version code 12, native debug symbols for Play Console crash reports, and refreshed changelog notes for the latest Play Store build.": "La versión de Android está preparada con código de versión 12, símbolos nativos de depuración para los informes de fallos de Play Console y notas actualizadas del historial de cambios para la última compilación de Play Store.",
            "Playground adds shareable puzzle codes, campaign now uses a 5x5 group map, and the Playground logo is now a tile-colored basketball. Menu headers, locks, and text-size controls were polished across web and Android.": "Zona de pruebas añade códigos de rompecabezas para compartir, la campaña usa un mapa de grupos 5x5, y el logo de Zona de pruebas ahora es un balón de baloncesto con colores de casillas. Las cabeceras de menú, candados y controles de tamaño de texto se pulieron en web y Android.",
            "Daily challenges now separate puzzle cards from leaderboards, custom setup uses visual pattern chips with unique generation always on, and game/result screens are clearer.": "Los retos diarios ahora separan las tarjetas de rompecabezas de las clasificaciones, la configuración personalizada usa opciones visuales de patrón con generación única siempre activa y las pantallas de juego y resultado son más claras.",
            "Settings now hide platform-specific controls, animation and colorblind-symbol toggles were removed, and About shows version history with the GitHub link.": "Los ajustes ahora ocultan controles específicos de plataforma, se eliminaron los interruptores de animación y símbolos daltónicos, y Acerca de muestra el historial de versiones con el enlace de GitHub.",
            "Release builds keep native debug symbols for Play Console crash reports.": "Las compilaciones de lanzamiento conservan símbolos nativos de depuración para los informes de fallos de Play Console.",
            "The Math guide explains solution uniqueness and matrix invertibility.": "La guía de matemáticas explica cuándo una solución es única y cuándo la matriz es invertible.",
            "Cross": "Cruz",
            "Diagonal": "Diagonal",
            "Square": "Cuadrado",
            "Horizontal line": "Línea horizontal",
            "Vertical line": "Línea vertical",
            "Self only": "Solo propia",
            "Knight": "Caballo",
            "Random mixed": "Mixto aleatorio",
            "Mixed": "Mixto",
            "Easy": "Fácil",
            "Medium": "Medio",
            "Hard": "Difícil",
            "Expert": "Experto",
            "Custom": "Personalizado",
            "Loading campaign": "Cargando campaña",
            "Preparing the level list.": "Preparando la lista de niveles.",
            "Loading the fixed campaign levels from the bundled JSON.": "Cargando los niveles fijos de la campaña desde el JSON incluido.",
            "Campaign data unavailable": "Datos de campaña no disponibles",
            "The bundled campaign asset could not be loaded. Reload the app or check that campaign-levels.json is included.": "No se pudo cargar el recurso incluido de la campaña. Recarga la app o comprueba que campaign-levels.json esté incluido.",
            "No campaign levels found": "No se encontraron niveles de campaña",
            "The campaign could not be prepared. Reload the app to rebuild the level list.": "No se pudo preparar la campaña. Recarga la app para reconstruir la lista de niveles.",
            "The fixed campaign data is missing. Reload the app or check the bundled asset.": "Faltan los datos fijos de la campaña. Recarga la app o comprueba el recurso incluido.",
            "No daily puzzles available": "No hay rompecabezas diarios disponibles",
            "Daily puzzles are generated from the current date. Reload the app to try again.": "Los rompecabezas diarios se generan a partir de la fecha actual. Recarga la app para intentarlo de nuevo.",
            "Lock icons on": "Casillas con candado activas",
            "Lock icons off": "Casillas con candado inactivas",
            "Empty hole": "Hueco vacío",
            "Empty holes on": "Huecos vacíos activos",
            "Empty holes off": "Huecos vacíos inactivos",
            "Not played today": "No jugado hoy",
            "not completed today": "no completado hoy",
            "First try counts": "El primer intento cuenta",
            "Replays open": "Repeticiones abiertas",
            "daily challenge": "reto diario",
            "state": "estado",
            "states": "estados",
            "tap": "toque",
            "taps": "toques",
            "star": "estrella",
            "stars": "estrellas",
            "out of 3 stars": "de 3 estrellas",
            "current best": "mejor marca actual",
            "Level": "Nivel",
            "locked": "con candado",
            "complete": "completado",
            "earned": "ganadas",
            "hint used": "pista usada",
            "not complete": "no completado",
            "Row": "Fila",
            "column": "columna",
            "pattern": "patrón",
            "Previewing this tap.": "Vista previa de este toque.",
            "No useful tap is available.": "No hay ningún toque útil disponible.",
            "Hint applied. Red tiles changed. This try is worth 0 stars.": "Pista aplicada. Las casillas rojas cambiaron. Este intento vale 0 estrellas.",
            "Binary Beginnings": "Comienzos binarios",
            "Fourfold Flips": "Giros cuádruples",
            "Fourfold Focus": "Enfoque cuádruple",
            "Fourfold Mastery": "Maestría cuádruple",
            "Lights With Lock Icons": "Luces con candado",
            "Lockstep Squares": "Cuadrados sincronizados",
            "First Empty Holes": "Primeros huecos vacíos",
            "Binary Breakaways": "Escapes binarios",
            "Fivefold Binary": "Binario quíntuple",
            "Three-Color Start": "Inicio tricolor",
            "Triple Grid": "Cuadrícula triple",
            "Three Lock-Icon Tiles": "Tres casillas con candado",
            "Three Empty Holes": "Tres huecos vacíos",
            "Triple Combine": "Combinación triple",
            "Pattern Primer": "Primeros patrones",
            "Patterns With Lock Icons": "Patrones con casillas con candado",
            "Color Gauntlet": "Desafío de colores",
            "Four-State Start": "Inicio de cuatro estados",
            "Four-State Grid": "Cuadrícula de cuatro estados",
            "Four-State Lock-Icon Tiles": "Casillas con candado de cuatro estados",
            "Four-State Empty Holes": "Huecos vacíos de cuatro estados",
            "Four-State Patterns": "Patrones de cuatro estados",
            "Four-State Matrix": "Matriz de cuatro estados",
            "Five-State Start": "Inicio de cinco estados",
            "Five-State Grid": "Cuadrícula de cinco estados",
            "Five-State Matrix": "Matriz de cinco estados",
            "Five-State Lock-Icon Tiles": "Casillas con candado de cinco estados",
            "Five-State Empty Holes": "Huecos vacíos de cinco estados",
            "Five-State Patterns": "Patrones de cinco estados",
            "Dense Dimensions": "Dimensiones densas",
            "Prime Pressure": "Presión prima",
            "Modular Maze": "Laberinto modular",
            "Wide Matrix": "Matriz amplia",
            "Endgame Circuit": "Circuito final",
            "Final Inversion": "Inversión final"
        },
        fr: {
            "Mixed patterns": "Motifs mixtes",
            "Options": "Options",
            "Edit tool": "Outil de modification",
            "pportilla on GitHub": "pportilla sur GitHub",
            "{n} states": "{n} états",
            "{n} star": "{n} étoile",
            "{n} stars": "{n} étoiles",
            "{n} out of 3 stars": "{n} sur 3 étoiles",
            "{n} tap": "{n} appui",
            "{n} taps": "{n} appuis",
            "{n}+ taps": "{n} appuis ou plus",
            "Row {row}, column {column}": "Ligne {row}, colonne {column}",
            "Paint color {n}": "Peindre avec la couleur {n}",
            "A modular tile puzzle": "Un casse-tête de tuiles modulaires",
            "Main menu": "Menu principal",
            "Campaign": "Campagne",
            "Custom Level": "Niveau personnalisé",
            "Playground": "Bac à sable",
            "Daily Challenge": "Défi quotidien",
            "Daily Challenges": "Défis quotidiens",
            "Leaderboards": "Classements",
            "Leaderboard": "Classement",
            "Achievements": "Succès",
            "Campaign achievements": "Succès de campagne",
            "Clear": "Terminer",
            "Master": "Maîtrise",
            "Unlocked": "Déverrouillé",
            "Locked": "Verrouillé",
            "Complete every level in this group.": "Termine tous les niveaux de ce groupe.",
            "Earn every star in this group.": "Obtiens toutes les étoiles de ce groupe.",
            "Global": "Global",
            "All daily tiers": "Tous les niveaux quotidiens",
            "How to Play": "Comment jouer",
            "The Math": "Les maths",
            "Settings": "Paramètres",
            "Back": "Retour",
            "Campaign chapters": "Chapitres de campagne",
            "Campaign groups": "Groupes de campagne",
            "Group": "Groupe",
            "Earn 15 stars in a nearby group.": "Gagne 15 étoiles dans un groupe adjacent.",
            "Custom Puzzle": "Casse-tête personnalisé",
            "Playground setup": "Configuration du bac à sable",
            "Playground controls": "Commandes du bac à sable",
            "Playground board": "Plateau du bac à sable",
            "Custom level setup": "Configuration du niveau personnalisé",
            "Grid Size": "Taille de la grille",
            "Grid size": "Taille de la grille",
            "Width": "Largeur",
            "Height": "Hauteur",
            "States": "États",
            "Number of states": "Nombre d'états",
            "Tap Pattern": "Motif de toucher",
            "Tap pattern": "Motif de toucher",
            "Difficulty": "Difficulté",
            "Edit Tool": "Outil d'édition",
            "Tap Tiles": "Toucher les tuiles",
            "Paint White": "Peindre en blanc",
            "Paint Color": "Peindre une couleur",
            "Paint States": "Peindre les états",
            "Lock Tiles": "Verrouiller les tuiles",
            "Place Holes": "Placer des trous",
            "Starting Board": "Plateau initial",
            "Playground board editor": "Éditeur de plateau du bac à sable",
            "Puzzle Code": "Code de casse-tête",
            "Puzzle code": "Code de casse-tête",
            "Share": "Partager",
            "Load Code": "Charger le code",
            "Copy Code": "Copier le code",
            "Clear Board": "Effacer le plateau",
            "Play": "Jouer",
            "Sandbox": "Bac libre",
            "No goal": "Sans objectif",
            "Puzzle code copied.": "Code copié.",
            "Puzzle code loaded.": "Code chargé.",
            "Puzzle code not recognized.": "Code non reconnu.",
            "Keep at least one tile.": "Garde au moins une tuile.",
            "Hints are off in Playground.": "Les indices sont désactivés dans le bac à sable.",
            "Tiles with lock icons": "Tuiles avec cadenas",
            "Irregular board": "Grille irrégulière",
            "Extras": "Extras",
            "Unique solution preferred": "Solution unique préférée",
            "Create Puzzle": "Créer un casse-tête",
            "Daily": "Quotidien",
            "Daily puzzle tiers": "Niveaux du défi quotidien",
            "Puzzle status": "État du casse-tête",
            "Taps": "Touchers",
            "Star ranking": "Classement d'étoiles",
            "Time": "Temps",
            "Puzzle details": "Détails du casse-tête",
            "Pattern": "Motif",
            "Tap pattern info": "Info sur le motif de toucher",
            "Personal Best": "Meilleur score",
            "Board actions": "Actions du plateau",
            "Undo": "Annuler",
            "Reset": "Réinitialiser",
            "Hint": "Indice",
            "Puzzle board": "Plateau du casse-tête",
            "Guide": "Guide",
            "Text size": "Taille du texte",
            "Small text": "Petit texte",
            "Medium text": "Texte moyen",
            "Large text": "Grand texte",
            "Play overview": "Aperçu du jeu",
            "Turn every tile white. A single tap can change several tiles at once.": "Le but est de rendre toutes les tuiles blanches. Un seul appui peut en changer plusieurs à la fois.",
            "Before you tap, hold a tile to see where its pattern reaches.": "Avant de jouer, garde le doigt sur une tuile pour voir quelles tuiles son motif atteint.",
            "Rules": "Règles",
            "1. Read the colors": "1. Repère les couleurs",
            "White is the color you want every tile to reach.": "Chaque tuile doit finir sur le blanc.",
            "A white tile can still change color if another tap reaches it.": "Une tuile déjà blanche peut reprendre une couleur si un autre appui l’atteint.",
            "You solve the puzzle when all the tiles are white at once.": "Tu as gagné quand toutes les tuiles sont blanches en même temps.",
            "2. Follow the color cycle": "2. Suis le cycle des couleurs",
            "Tap an unlocked tile. Its pattern tells you which tiles will change.": "Appuie sur une tuile sans cadenas. Son motif indique quelles tuiles vont changer.",
            "Each tile in the pattern moves on to its next color.": "Chaque tuile touchée par le motif passe à la couleur suivante.",
            "After the last color comes white again.": "Après la dernière couleur, on revient au blanc.",
            "3. Check the pattern": "3. Regarde le motif",
            "Look for crosses, diagonals, squares, rows, columns and even chess knight moves. Some boards mix several patterns.": "Tu trouveras des croix, des diagonales, des carrés, des lignes, des colonnes et même des sauts de cavalier comme aux échecs. Certains plateaux combinent plusieurs motifs.",
            "Hold a tile to preview its pattern. Lift your finger when you’re done looking.": "Garde le doigt sur une tuile pour voir son motif, puis relève-le quand tu as fini de regarder.",
            "4. Locks and holes": "4. Cadenas et trous",
            "A locked tile still has to turn white.": "Les tuiles avec un cadenas doivent elles aussi devenir blanches.",
            "To change it, tap another tile whose pattern reaches it.": "Pour changer une tuile verrouillée, appuie sur une autre tuile dont le motif l’atteint.",
            "A hole is just a gap in the board. Tap patterns skip it.": "Un trou est une place vide sur le plateau. Les motifs passent par-dessus.",
            "Modes": "Modes",
            "Choose your puzzle": "Choisis ton casse-tête",
            "Campaign:": "Campagne :",
            "Solve fixed levels in order. Each solve opens the next level.": "Résous les niveaux fixes dans l'ordre. Chaque résolution ouvre le niveau suivant.",
            "Pick a group on the 5 × 5 map. Earn 15 stars there to unlock the groups directly beside it, above it and below it.": "Choisis un groupe sur la carte de 5 × 5. Gagne 15 étoiles dans ce groupe pour débloquer ses voisins de gauche, de droite, du haut et du bas.",
            "Custom Level:": "Niveau personnalisé :",
            "Choose the board size, number of colors, pattern and difficulty. You can add locks and holes. The game looks for a puzzle with a unique solution when it can.": "Choisis la taille du plateau, le nombre de couleurs, le motif et la difficulté. Tu peux ajouter des cadenas et des trous. Le jeu essaie de te proposer un casse-tête à solution unique.",
            "Playground:": "Bac à sable :",
            "Build your own board and share it with a puzzle code. You can keep experimenting even after every tile turns white.": "Crée ton propre plateau et partage-le grâce à son code. Tu peux continuer à essayer des coups même quand tout le plateau est blanc.",
            "Daily Challenge:": "Défi quotidien :",
            "Everyone gets the same three puzzles each day. Each one keeps its own best score.": "Chaque jour, tout le monde reçoit les trois mêmes casse-têtes. Ton meilleur score est enregistré pour chacun.",
            "Tools and options": "Outils et options",
            "Taps, stars, and hints": "Coups, étoiles et indices",
            "Previewing a pattern is free. Your tap counts when the tiles change.": "Tu peux regarder un motif sans dépenser de coup. Le coup compte quand les tuiles changent.",
            "For three stars, solve the puzzle in as few taps as the game’s best known solution, or fewer.": "Pour gagner trois étoiles, termine en autant de coups que la meilleure solution trouvée par le jeu, ou en moins.",
            "The one- and two-star targets leave room for extra taps.": "Les objectifs à une et deux étoiles te laissent quelques coups de plus.",
            "Undo takes back your last tap. Reset puts the board back the way it started.": "Annuler retire ton dernier coup. Réinitialiser remet le plateau dans son état de départ.",
            "A hint plays one tap for you. You can still finish that attempt, but it earns no stars.": "Un indice joue un coup pour toi. Tu peux terminer cet essai, mais tu n’y gagneras pas d’étoiles.",
            "Look for the red outlines to see which tiles the hint changed.": "Un contour rouge indique les tuiles que l’indice a changées.",
            "When you tap a tile, this pattern is centered on that tile. Every tile inside the pattern changes state.": "Quand tu touches une tuile, ce motif se centre sur cette tuile. Chaque tuile dans le motif change d'état.",
            "The green outline matches the preview you see when you hold a tile.": "Le contour vert correspond à l'aperçu visible quand tu gardes une tuile appuyée.",
            "Turn sound effects on or off in Settings.": "Dans les paramètres, tu peux activer ou couper les sons du jeu.",
            "If you prefer numbers, turn them on to see each tile’s state alongside its color.": "Si tu préfères les chiffres, affiche-les pour lire l’état des tuiles en plus de leur couleur.",
            "On Android, you can also turn vibration on or off.": "Sur Android, tu peux aussi activer ou couper les vibrations.",
            "Math overview": "Aperçu mathématique",
            "What happens when you add up the taps?": "Que se passe-t-il quand on additionne les effets des coups ?",
            "Take a board with just two colors. Tap the center of a cross and every tile in the cross switches between white and blue. Tap the same spot again and you’re back where you started. The same rule works with other patterns. With more colors, it takes more taps to go all the way around the cycle.": "Imagine un plateau à deux couleurs. Appuie au centre d’une croix et chacune de ses tuiles passe du blanc au bleu ou du bleu au blanc. Appuie une seconde fois au même endroit et tu retrouves le plateau de départ. Le principe vaut aussi pour d’autres motifs ou d’autres couleurs. Avec plus de couleurs, le cycle est simplement plus long.",
            "Modeling the game": "Le modèle mathématique",
            "The board in one equation": "Le plateau en une équation",
            "Give white the number \\(0\\) and count up through the colors. On a board with \\(n\\) colors, the next step after \\(n-1\\) is \\(0\\) again. This is arithmetic modulo \\(n\\), written in the ring \\(R=\\mathbb Z/n\\mathbb Z\\).": "Associe le nombre \\(0\\) au blanc, puis numérote les autres couleurs dans l’ordre. Avec \\(n\\) couleurs, après \\(n-1\\) on revient à \\(0\\). C’est l’arithmétique modulo \\(n\\), dans l’anneau \\(R=\\mathbb Z/n\\mathbb Z\\).",
            "Now read the tiles in a fixed order. Their numbers form the board vector \\(s\\). Put the effect of each possible tap in a column of a matrix \\(A\\). If \\(x\\) records how often you tap each unlocked tile, \\(Ax\\) gives the total change. You win when \\(s+Ax=0\\).": "Lis les tuiles dans un ordre fixe. Leurs valeurs forment le vecteur du plateau \\(s\\). Place l’effet de chaque appui possible dans une colonne d’une matrice \\(A\\). Si \\(x\\) compte les appuis sur chaque tuile, \\(Ax\\) donne le changement total. Tu gagnes quand \\(s+Ax=0\\).",
            "With \\(2\\), \\(3\\) or \\(5\\) states, \\(R\\) is a field. Every nonzero element has a multiplicative inverse, so you can divide by it. With four states, even a simple division by \\(2\\) can go wrong. We’ll see why below.": "Avec \\(2\\), \\(3\\) ou \\(5\\) états, \\(R\\) est un corps. Tout élément non nul a un inverse pour la multiplication, ce qui permet de diviser par cet élément. Avec quatre états, même une division par \\(2\\) pose problème. On verra pourquoi un peu plus loin.",
            "Lights Out generalization": "Généralisation de Lights Out",
            "From Lights Out": "Aux origines du jeu",
            "From two states to many": "De deux états à plusieurs",
            "In the classic Lights Out puzzle, a tap flips the chosen tile and its neighbors above, below, left and right. Each flip adds \\(1\\) modulo \\(2\\). Two taps in the same spot cancel because \\(1+1=0\\) modulo \\(2\\).": "Dans le jeu Lights Out, un appui inverse la tuile choisie et ses voisines du haut, du bas, de gauche et de droite. Chaque changement ajoute \\(1\\) modulo \\(2\\). Deux appuis au même endroit s’annulent, car \\(1+1=0\\) modulo \\(2\\).",
            "Invert the Matrix adds more states and patterns, but tap effects still add together. Skip holes when you list the tiles. Include locked tiles, since a tap on another tile can change them.": "Invert the Matrix ajoute des états et des motifs, mais les effets des appuis s’additionnent toujours. Dans la liste des tuiles, laisse de côté les trous et garde les tuiles verrouillées, puisqu’un appui ailleurs peut les changer.",
            "Can you combine the available taps to cancel the starting board? The change you need is \\(-s\\).": "Peux-tu combiner les appuis possibles pour annuler le plateau de départ ? Le changement à obtenir est \\(-s\\).",
            "1. The board is a vector": "1. Le plateau est un vecteur",
            "Number the \\(m\\) tiles \\(p_1,\\ldots,p_m\\) in any fixed order. Write their states in that same order to get \\(s=(s_1,\\ldots,s_m)\\in R^m\\). Each entry \\(s_i\\) is the color of tile \\(p_i\\). An all-white board is the zero vector.": "Numérote les \\(m\\) tuiles \\(p_1,\\ldots,p_m\\) dans l’ordre de ton choix. Écris leurs états dans ce même ordre pour obtenir \\(s=(s_1,\\ldots,s_m)\\in R^m\\). La composante \\(s_i\\) indique la couleur de la tuile \\(p_i\\). Un plateau tout blanc correspond au vecteur nul.",
            "2. Each tap contributes a column": "2. Une colonne par appui possible",
            "Label the \\(r\\) tiles you can tap \\(q_1,\\ldots,q_r\\). Tap \\(q_j\\) once and record a \\(1\\) for each tile that changes and a \\(0\\) for each tile that stays the same. The result is its effect vector \\(v_j\\), column \\(j\\) of \\(A\\).": "Appelle \\(q_1,\\ldots,q_r\\) les \\(r\\) tuiles sur lesquelles tu peux appuyer. Appuie une fois sur \\(q_j\\), puis note \\(1\\) pour chaque tuile qui change et \\(0\\) pour celles qui restent en place. Tu obtiens son vecteur d’effet \\(v_j\\), la colonne \\(j\\) de \\(A\\).",
            "Read across a row to see which taps affect one tile. Read down a column to see which tiles one tap affects. A locked tile has a row of its own, but you can’t tap it, so it has no column.": "Une ligne indique quels appuis font changer une tuile. Une colonne indique quelles tuiles changent sous l’effet d’un appui. Une tuile verrouillée a sa ligne, mais comme tu ne peux pas appuyer dessus, elle n’a pas de colonne.",
            "Solving equation": "Équation de résolution",
            "Goal": "Objectif",
            "How many times should you tap each tile?": "Combien de fois appuyer sur chaque tuile ?",
            "The tap-count vector \\(x=(x_1,\\ldots,x_r)\\) records how often you tap each unlocked tile, modulo \\(n\\). Each tap on \\(q_j\\) adds the same \\(v_j\\), so together the taps add \\(Ax=\\sum_j x_jv_j\\). You can play them in any order.": "Le vecteur des appuis \\(x=(x_1,\\ldots,x_r)\\) compte les appuis sur chaque tuile déverrouillée, modulo \\(n\\). Chaque appui sur \\(q_j\\) ajoute le même vecteur \\(v_j\\). Le changement total vaut donc \\(Ax=\\sum_j x_jv_j\\), quel que soit l’ordre des appuis.",
            "The final board is \\(s+Ax\\). To make it all white, look for a vector \\(x\\) that solves \\(Ax=-s\\) in \\(R\\).": "Le plateau final est \\(s+Ax\\). Pour le rendre tout blanc, cherche un vecteur \\(x\\) qui vérifie \\(Ax=-s\\) dans \\(R\\).",
            "When does a solution exist?": "Quand existe-t-il une solution ?",
            "Every tap-count vector produces a change \\(Ax\\). All those changes together form the image of \\(A\\), written \\(\\operatorname{Im}(A)\\). A board has a solution exactly when \\(-s\\) belongs to this image.": "Chaque vecteur des appuis produit un changement \\(Ax\\). L’ensemble de ces changements est l’image de \\(A\\), notée \\(\\operatorname{Im}(A)\\). Le plateau admet une solution si et seulement si \\(-s\\) appartient à cette image.",
            "When \\(n\\) is prime, you can check by row reducing the augmented matrix \\([A\\mid -s]\\) to echelon form. A row saying \\(0=c\\) with \\(c\\ne0\\) rules out a solution. If no such row appears, you can read off at least one solution by back substitution.": "Si \\(n\\) est premier, mets la matrice augmentée \\([A\\mid -s]\\) sous forme échelonnée par des opérations sur les lignes. Une ligne qui dit \\(0=c\\) avec \\(c\\ne0\\) exclut toute solution. Sinon, tu peux trouver une solution en remontant le système.",
            "What changes with four states?": "Qu’est-ce qui change avec quatre états ?",
            "When \\(n\\) is composite, \\(R\\) is still a ring, but some nonzero elements have no multiplicative inverse. For example, modulo \\(4\\), twice any number is even, so \\(2a\\) can never equal \\(1\\). You can’t divide a row by \\(2\\) here.": "Si \\(n\\) est composé, \\(R\\) reste un anneau, mais certains éléments non nuls n’ont pas d’inverse pour la multiplication. Par exemple, modulo \\(4\\), un double est toujours pair. Ainsi \\(2a\\) ne vaut jamais \\(1\\), et on ne peut pas diviser une ligne par \\(2\\).",
            "The test for a solution is still \\(-s\\in\\operatorname{Im}(A)\\). Use row operations valid in the ring. If \\(n\\) factors into coprime prime powers, you can also solve modulo each of those powers and combine the results.": "Le critère reste \\(-s\\in\\operatorname{Im}(A)\\). Utilise des opérations sur les lignes valables dans cet anneau. Si \\(n\\) est un produit de puissances de nombres premiers distincts, on peut aussi résoudre le système modulo chacune de ces puissances, puis combiner les résultats.",
            "When is the solution unique?": "Quand la solution est-elle unique ?",
            "Suppose \\(x_0\\) solves the board. If a tap-count vector \\(z\\) leaves the board unchanged, then \\(Az=0\\) and \\(x_0+z\\) also solves it. These vectors \\(z\\) form the kernel of \\(A\\), written \\(\\ker(A)\\). Adding each of them to \\(x_0\\) gives all the solutions.": "Suppose que \\(x_0\\) soit une solution. Si un vecteur des appuis \\(z\\) laisse le plateau inchangé, alors \\(Az=0\\) et \\(x_0+z\\) est aussi une solution. Ces vecteurs \\(z\\) forment le noyau de \\(A\\), noté \\(\\ker(A)\\). En ajoutant chacun d’eux à \\(x_0\\), on obtient toutes les solutions.",
            "Remember that counts are taken modulo \\(n\\). Tapping one tile \\(n\\) extra times takes its whole pattern around the color cycle. It leaves both the board and the tap-count vector unchanged.": "On compte les appuis modulo \\(n\\). Si tu appuies \\(n\\) fois de plus sur une tuile, toutes les tuiles de son motif font un tour complet du cycle. Le plateau et le vecteur des appuis restent les mêmes.",
            "So a solvable board has exactly one tap-count vector when \\(\\ker(A)=\\{0\\}\\). Over a field, this means the columns of \\(A\\) are linearly independent. The kernel test also works in the four-state ring.": "Un plateau résoluble admet donc un unique vecteur des appuis si et seulement si \\(\\ker(A)=\\{0\\}\\). Sur un corps, cela signifie que les colonnes de \\(A\\) sont linéairement indépendantes. Le critère du noyau vaut aussi dans l’anneau à quatre états.",
            "When is \\(A\\) invertible?": "Quand \\(A\\) est-elle inversible ?",
            "If you can tap every tile, \\(A\\) has one row and one column per tile, so it is square. Holes leave that count balanced. A lock removes a column and keeps the row. When a square \\(A\\) is invertible, every starting board has exactly one tap-count solution.": "Si tu peux appuyer sur chaque tuile, \\(A\\) a autant de lignes que de colonnes et elle est carrée. Les trous préservent cette égalité. Un cadenas supprime une colonne et conserve la ligne. Si la matrice carrée \\(A\\) est inversible, chaque plateau de départ admet un unique vecteur des appuis qui le résout.",
            "A square \\(A\\) is invertible exactly when its determinant has a multiplicative inverse in \\(R\\). For prime \\(n\\), the determinant must be nonzero modulo \\(n\\). For \\(n=4\\), it must be odd. If this test fails, some starting boards have no solution and others have several. For a rectangular matrix, use the image to test existence and the kernel to test uniqueness.": "Une matrice carrée \\(A\\) est inversible si et seulement si son déterminant est inversible dans \\(R\\). Pour \\(n\\) premier, il doit être non nul modulo \\(n\\). Pour \\(n=4\\), il doit être impair. Si ce critère échoue, certains plateaux n’ont aucune solution et d’autres en ont plusieurs. Pour une matrice rectangulaire, l’image permet de tester l’existence d’une solution et le noyau son unicité.",
            "Counting the taps in a solution": "Compter les coups d’une solution",
            "To play a solution, take each count \\(x_j\\) as a number from \\(0\\) to \\(n-1\\). Call that number \\(t_j\\). Add these numbers as ordinary integers to get the number of taps, \\(\\ell(x)\\). The shortest solution the game has found sets the three-star target.": "Pour jouer une solution, représente chaque composante \\(x_j\\) par un nombre de \\(0\\) à \\(n-1\\), noté \\(t_j\\). Additionne ces nombres comme des entiers pour obtenir le nombre de coups, \\(\\ell(x)\\). La solution la plus courte trouvée par le jeu fixe l’objectif des trois étoiles.",
            "How the game finds a short solution": "Comment le jeu cherche une solution courte",
            "If the board has few enough possible states, the game searches all positions one tap away, then two taps away, and so on. The first time it reaches an all-white board, it has found the fewest taps possible.": "Quand le plateau a assez peu de configurations possibles, le jeu explore d’abord celles à un coup, puis celles à deux coups, et ainsi de suite. La première fois qu’il atteint un plateau tout blanc, il a trouvé le minimum de coups.",
            "For larger boards with a prime number of states per tile, the game row reduces \\(Ax=-s\\). If there are few enough solutions to try, it compares them all and keeps one with the fewest taps. When an exact search is too large, including on large four-state boards, it uses a known solution whose length may be above the minimum.": "Pour les grands plateaux où le nombre d’états par tuile est premier, le jeu réduit le système \\(Ax=-s\\) par opérations sur les lignes. Si les solutions sont assez peu nombreuses, il les compare toutes et en garde une qui demande le moins de coups. Quand la recherche exacte est trop longue, notamment sur les grands plateaux à quatre états, il utilise une solution connue qui peut dépasser le minimum.",
            "Different tap-count vectors can tie for the minimum, and you can play the same vector in different orders. When the game proves a minimum, it always picks the same plan among those tied for shortest. It doesn’t tell you whether another plan ties with it.": "Plusieurs vecteurs des appuis peuvent atteindre le même minimum, et tu peux jouer un même vecteur dans des ordres différents. Quand le jeu établit le minimum, il choisit toujours le même plan parmi les plus courts. Il n’indique pas si un autre fait aussi bien.",
            "Locked tiles and holes in the matrix": "Les cadenas et les trous dans la matrice",
            "To model a hole, leave that position out entirely. To model a lock, keep the tile’s entry in \\(s\\) and its row in \\(A\\), since it still has to turn white. Leave out its column. The remaining columns tell you which other taps can change it.": "Pour représenter un trou, laisse cette position de côté. Pour un cadenas, garde la composante de la tuile dans \\(s\\) et sa ligne dans \\(A\\), car elle doit devenir blanche. Supprime sa colonne. Les autres colonnes indiquent quels appuis peuvent encore la changer.",
            "How puzzles are made": "Comment les casse-têtes sont créés",
            "The generator starts with a white board and scrambles it with allowed taps. It keeps track of how to undo their combined effect, so the starting board comes with a solution. When it can, the solver finds a shortest plan for the star targets. A hint plays one tap toward a solution and outlines the tiles it changed in red.": "Le jeu part d’un plateau blanc et le mélange avec des appuis autorisés. Il garde de quoi annuler leur effet cumulé. Le plateau obtenu a donc déjà une solution. Quand il le peut, le jeu trouve un plan de longueur minimale pour fixer les objectifs d’étoiles. Un indice joue un coup vers la solution et entoure en rouge les tuiles modifiées.",
            "What the symbols mean": "Que signifient les symboles ?",
            "The number of states per tile. It can be \\(2\\), \\(3\\), \\(4\\) or \\(5\\) and is the modulus for this board.": "Le nombre d’états par tuile. Il vaut \\(2\\), \\(3\\), \\(4\\) ou \\(5\\) et sert de module pour ce plateau.",
            "The board vector. Each entry is the state of one tile.": "Le vecteur du plateau. Chaque composante donne l’état d’une tuile.",
            "The tap matrix. Column \\(j\\) shows what changes when you tap \\(q_j\\).": "La matrice des appuis. La colonne \\(j\\) indique ce qui change quand tu appuies sur \\(q_j\\).",
            "The tap-count vector. Entry \\(x_j\\) counts taps on \\(q_j\\) modulo \\(n\\).": "Le vecteur des appuis. La composante \\(x_j\\) compte les appuis sur \\(q_j\\) modulo \\(n\\).",
            "The image of \\(A\\). It contains every board change you can make with taps.": "L’image de \\(A\\). Elle contient tous les changements que les appuis permettent de produire.",
            "The kernel of \\(A\\). It contains every tap-count vector whose combined effect is zero.": "Le noyau de \\(A\\). Il contient tous les vecteurs des appuis dont l’effet total est nul.",
            "Language": "Langue",
            "Sound": "Son",
            "Show numbers on tiles": "Afficher les nombres sur les tuiles",
            "Show numbers in Playground": "Afficher les nombres dans le bac à sable",
            "About": "À propos",
            "About Invert the Matrix": "À propos d'Invert the Matrix",
            "Changelog": "Journal des changements",
            "Complete": "Terminé",
            "Level Complete": "Niveau terminé",
            "Daily Complete": "Quotidien terminé",
            "Stars earned": "Étoiles gagnées",
            "Taps Used": "Touchers utilisés",
            "Minimum": "Minimum",
            "Best Taps": "Meilleur score",
            "Star thresholds": "Seuils d'étoiles",
            "Next Level": "Niveau suivant",
            "Replay": "Rejouer",
            "Menu": "Menu",
            "New Puzzle": "Nouveau casse-tête",
            "Version": "Version",
            "Best": "Meilleur",
            "Chapter": "Chapitre",
            "Inversion": "Inversion",
            "You can now play in Korean. We also rewrote How to Play and the math guide, from your first tap to the equations behind a solution.": "Tu peux désormais jouer en coréen. Nous avons retravaillé les règles du jeu et le guide de mathématiques, du premier geste aux équations qui permettent de résoudre un plateau.",
            "Improved Android 16 compatibility, system Back navigation, and screen layout around system bars. The Android app now requires Android 7 or later.": "Amélioration de la compatibilité avec Android 16, du retour système et de la disposition de l'écran autour des barres système. L'application Android nécessite désormais Android 7 ou une version ultérieure.",
            "Updated AndroidX Activity and Fragment dependencies to current supported releases for Play compatibility.": "Mise à jour des dépendances AndroidX Activity et Fragment vers les versions prises en charge actuelles pour Google Play.",
            "Android now targets Android 16, keeps system Back navigation reliable, and makes the all-white goal clear with tap-effect help available on demand.": "L’application cible désormais Android 16, maintient un retour système fiable et clarifie l’objectif de rendre toutes les tuiles blanches, avec une aide sur l’effet de toucher disponible à la demande.",
            "The main menu now includes Achievements, the animated board is larger, and Android opens Play Games achievement status while the web app shows campaign achievement progress.": "Le menu principal inclut maintenant Succès, le plateau animé est plus grand, et Android ouvre l'état des succès Play Games tandis que la version web affiche la progression des succès de campagne.",
            "First production release with campaign levels, daily challenges, custom puzzles, Playground boards, hints, stars, and Play Games achievements.": "Première version de production avec niveaux de campagne, défis quotidiens, casse-têtes personnalisés, plateaux de bac à sable, indices, étoiles et succès Play Games.",
            "Added a separate setting for Playground tile numbers, keeping Playground boards number-free unless it is turned on.": "Ajout d'un réglage séparé pour les nombres des tuiles du bac à sable, afin que les plateaux du bac à sable restent sans nombres sauf si ce réglage est activé.",
            "The Android release is prepared with version code 12, native debug symbols for Play Console crash reports, and refreshed changelog notes for the latest Play Store build.": "La version Android est préparée avec le code de version 12, les symboles de débogage natifs pour les rapports de plantage Play Console et des notes d'historique mises à jour pour la dernière compilation Play Store.",
            "Playground adds shareable puzzle codes, campaign now uses a 5x5 group map, and the Playground logo is now a tile-colored basketball. Menu headers, locks, and text-size controls were polished across web and Android.": "Le bac à sable ajoute des codes de casse-tête à partager, la campagne utilise une carte de groupes 5x5, et le logo du bac à sable est maintenant un ballon de basket aux couleurs des tuiles. Les en-têtes de menu, cadenas et contrôles de taille du texte ont été améliorés sur web et Android.",
            "Daily challenges now separate puzzle cards from leaderboards, custom setup uses visual pattern chips with unique generation always on, and game/result screens are clearer.": "Les défis quotidiens séparent désormais les cartes de casse-têtes des classements, la configuration personnalisée utilise des puces visuelles de motif avec génération unique toujours active, et les écrans de jeu et de résultat sont plus clairs.",
            "Settings now hide platform-specific controls, animation and colorblind-symbol toggles were removed, and About shows version history with the GitHub link.": "Les paramètres masquent désormais les contrôles propres à chaque plateforme, les options d'animation et de symboles daltoniens ont été retirées, et À propos affiche l'historique des versions avec le lien GitHub.",
            "Release builds keep native debug symbols for Play Console crash reports.": "Les builds de publication conservent les symboles de débogage natifs pour les rapports de plantage Play Console.",
            "The Math guide explains solution uniqueness and matrix invertibility.": "Le guide des maths explique quand une solution est unique et quand la matrice est inversible.",
            "Cross": "Croix",
            "Diagonal": "Diagonale",
            "Square": "Carré",
            "Horizontal line": "Ligne horizontale",
            "Vertical line": "Ligne verticale",
            "Self only": "Tuile seule",
            "Knight": "Cavalier",
            "Random mixed": "Mélange aléatoire",
            "Mixed": "Mixte",
            "Easy": "Facile",
            "Medium": "Moyen",
            "Hard": "Difficile",
            "Expert": "Expert",
            "Custom": "Personnalisé",
            "Loading campaign": "Chargement de la campagne",
            "Preparing the level list.": "Préparation de la liste des niveaux.",
            "Loading the fixed campaign levels from the bundled JSON.": "Chargement des niveaux fixes de la campagne depuis le JSON inclus.",
            "Campaign data unavailable": "Données de campagne indisponibles",
            "The bundled campaign asset could not be loaded. Reload the app or check that campaign-levels.json is included.": "La ressource de campagne incluse n'a pas pu être chargée. Recharge l'app ou vérifie que campaign-levels.json est inclus.",
            "No campaign levels found": "Aucun niveau de campagne trouvé",
            "The campaign could not be prepared. Reload the app to rebuild the level list.": "La campagne n'a pas pu être préparée. Recharge l'app pour reconstruire la liste des niveaux.",
            "The fixed campaign data is missing. Reload the app or check the bundled asset.": "Les données fixes de campagne sont manquantes. Recharge l'app ou vérifie la ressource incluse.",
            "No daily puzzles available": "Aucun casse-tête quotidien disponible",
            "Daily puzzles are generated from the current date. Reload the app to try again.": "Les casse-têtes quotidiens sont générés à partir de la date actuelle. Recharge l'app pour réessayer.",
            "Lock icons on": "Tuiles avec cadenas activées",
            "Lock icons off": "Tuiles avec cadenas désactivées",
            "Empty hole": "Trou vide",
            "Empty holes on": "Trous vides activés",
            "Empty holes off": "Trous vides désactivés",
            "Not played today": "Pas joué aujourd'hui",
            "not completed today": "pas terminé aujourd'hui",
            "First try counts": "Le premier essai compte",
            "Replays open": "Reprises ouvertes",
            "daily challenge": "défi quotidien",
            "state": "état",
            "states": "états",
            "tap": "toucher",
            "taps": "touchers",
            "star": "étoile",
            "stars": "étoiles",
            "out of 3 stars": "sur 3 étoiles",
            "current best": "meilleur score actuel",
            "Level": "Niveau",
            "locked": "avec cadenas",
            "complete": "terminé",
            "earned": "gagnées",
            "hint used": "indice utilisé",
            "not complete": "non terminé",
            "Row": "Ligne",
            "column": "colonne",
            "pattern": "motif",
            "Previewing this tap.": "Aperçu de ce toucher.",
            "No useful tap is available.": "Aucun toucher utile disponible.",
            "Hint applied. Red tiles changed. This try is worth 0 stars.": "Indice appliqué. Les tuiles rouges ont changé. Cet essai vaut 0 étoile.",
            "Binary Beginnings": "Débuts binaires",
            "Fourfold Flips": "Basculements quadruples",
            "Fourfold Focus": "Concentration quadruple",
            "Fourfold Mastery": "Maîtrise quadruple",
            "Lights With Lock Icons": "Lumières avec cadenas",
            "Lockstep Squares": "Carrés synchronisés",
            "First Empty Holes": "Premiers trous vides",
            "Binary Breakaways": "Échappées binaires",
            "Fivefold Binary": "Binaire quintuple",
            "Three-Color Start": "Départ tricolore",
            "Triple Grid": "Grille triple",
            "Three Lock-Icon Tiles": "Trois tuiles avec cadenas",
            "Three Empty Holes": "Trois trous vides",
            "Triple Combine": "Combinaison triple",
            "Pattern Primer": "Premiers motifs",
            "Patterns With Lock Icons": "Motifs avec tuiles à cadenas",
            "Color Gauntlet": "Défi des couleurs",
            "Four-State Start": "Départ à quatre états",
            "Four-State Grid": "Grille à quatre états",
            "Four-State Lock-Icon Tiles": "Tuiles avec cadenas à quatre états",
            "Four-State Empty Holes": "Trous vides à quatre états",
            "Four-State Patterns": "Motifs à quatre états",
            "Four-State Matrix": "Matrice à quatre états",
            "Five-State Start": "Départ à cinq états",
            "Five-State Grid": "Grille à cinq états",
            "Five-State Matrix": "Matrice à cinq états",
            "Five-State Lock-Icon Tiles": "Tuiles avec cadenas à cinq états",
            "Five-State Empty Holes": "Trous vides à cinq états",
            "Five-State Patterns": "Motifs à cinq états",
            "Dense Dimensions": "Dimensions denses",
            "Prime Pressure": "Pression première",
            "Modular Maze": "Labyrinthe modulaire",
            "Wide Matrix": "Matrice large",
            "Endgame Circuit": "Circuit final",
            "Final Inversion": "Inversion finale"
        }
    };
    var originalTextNodes = new WeakMap();
    var originalAttributes = new WeakMap();
    var guideScreenHtml = {};
    var TERM_HIGHLIGHTS = {
        ko: {
            howto: [
                { color: "green", terms: ["칸"] },
                { color: "blue", terms: ["누르기", "누르면", "눌러", "누른"] },
                { color: "purple", terms: ["상태"] },
                { color: "orange", terms: ["패턴"] },
                { color: "purple", terms: ["자물쇠", "잠긴 칸"] },
                { color: "orange", terms: ["빈자리"] },
                { color: "green", terms: ["힌트"] }
            ],
            math: [
                { color: "green", terms: ["칸"] },
                { color: "orange", terms: ["상태"] },
                { color: "blue", terms: ["누르기", "누르면", "눌러", "누른"] },
                { color: "green", terms: ["효과 벡터"] },
                { color: "green", terms: ["누름 횟수 벡터"] },
                { color: "green", terms: ["퍼즐판 벡터"] },
                { color: "green", terms: ["영벡터"] },
                { color: "orange", terms: ["행렬"] },
                { color: "purple", terms: ["나머지"] },
                { color: "green", terms: ["유한체", "체"] },
                { color: "purple", terms: ["나머지환", "환"] },
                { color: "green", terms: ["상"] },
                { color: "blue", terms: ["핵"] },
                { color: "orange", terms: ["가역", "가역행렬"] }
            ]
        },
        en: {
            howto: [
                { color: "green", terms: ["tile", "tiles"] },
                { color: "blue", terms: ["Tapping", "Tap", "tap", "taps"] },
                { color: "purple", terms: ["state", "states", "States"] },
                { color: "orange", terms: ["pattern", "patterns"] },
                { color: "purple", terms: ["locked", "lock", "locks"] },
                { color: "orange", terms: ["hole", "holes"] },
                { color: "green", terms: ["hints", "hint", "Hint"] }
            ],
            math: [
                { color: "purple", terms: ["modular"] },
                { color: "green", terms: ["tile", "tiles"] },
                { color: "orange", terms: ["state", "states"] },
                { color: "blue", terms: ["Tapping", "tap", "taps"] },
                { color: "green", terms: ["effect vector", "effect vectors"] },
                { color: "green", terms: ["tap-count vector", "tap-count vectors"] },
                { color: "green", terms: ["board vector"] },
                { color: "green", terms: ["zero vector"] },
                { color: "orange", terms: ["matrix", "Matrix"] },
                { color: "purple", terms: ["modulo"] },
                { color: "green", terms: ["field", "fields"] },
                { color: "purple", terms: ["ring", "rings"] },
                { color: "green", terms: ["image"] },
                { color: "blue", terms: ["kernel"] },
                { color: "orange", terms: ["invertible"] }
            ]
        },
        es: {
            howto: [
                { color: "green", terms: ["casilla", "casillas"] },
                { color: "blue", terms: ["toque", "toques"] },
                { color: "purple", terms: ["estado", "estados"] },
                { color: "orange", terms: ["patrón", "patrones"] },
                { color: "purple", terms: ["candado", "casillas con candado"] },
                { color: "orange", terms: ["hueco", "huecos"] },
                { color: "green", terms: ["pista", "pistas"] }
            ],
            math: [
                { color: "purple", terms: ["modular"] },
                { color: "green", terms: ["casilla", "casillas"] },
                { color: "orange", terms: ["estado", "estados"] },
                { color: "blue", terms: ["toque", "toques"] },
                { color: "green", terms: ["vector de efecto", "vectores de efecto"] },
                { color: "green", terms: ["vector de toques", "vectores de toques"] },
                { color: "green", terms: ["vector del tablero"] },
                { color: "green", terms: ["vector cero"] },
                { color: "orange", terms: ["matriz"] },
                { color: "purple", terms: ["módulo"] },
                { color: "green", terms: ["cuerpo", "cuerpos"] },
                { color: "purple", terms: ["anillo", "anillos"] },
                { color: "green", terms: ["imagen"] },
                { color: "blue", terms: ["núcleo"] },
                { color: "orange", terms: ["invertible"] }
            ]
        },
        fr: {
            howto: [
                { color: "green", terms: ["tuile", "tuiles"] },
                { color: "blue", terms: ["appui", "appuis"] },
                { color: "purple", terms: ["état", "états"] },
                { color: "orange", terms: ["motif", "motifs"] },
                { color: "purple", terms: ["cadenas", "tuiles avec cadenas"] },
                { color: "orange", terms: ["trou", "trous"] },
                { color: "green", terms: ["indice", "indices"] }
            ],
            math: [
                { color: "purple", terms: ["modulaire"] },
                { color: "green", terms: ["tuile", "tuiles"] },
                { color: "orange", terms: ["état", "états"] },
                { color: "blue", terms: ["Toucher", "appui", "appuis"] },
                { color: "green", terms: ["vecteur d’effet", "vecteurs d’effet"] },
                { color: "green", terms: ["vecteur des appuis", "vecteurs des appuis"] },
                { color: "green", terms: ["vecteur du plateau"] },
                { color: "green", terms: ["vecteur zéro", "vecteur nul"] },
                { color: "orange", terms: ["matrice"] },
                { color: "purple", terms: ["modulo"] },
                { color: "green", terms: ["corps"] },
                { color: "purple", terms: ["anneau", "anneaux"] },
                { color: "green", terms: ["image"] },
                { color: "blue", terms: ["noyau"] },
                { color: "orange", terms: ["inversible", "inversibilité"] }
            ]
        }
    };
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
    var PLAYGROUND_PATTERNS = ["cross", "diagonal", "square", "horizontal", "vertical", "self", "knight"];
    var PLAYGROUND_TOOL_TAP = "tap";
    var PLAYGROUND_TOOL_LOCK = "lock";
    var PLAYGROUND_TOOL_HOLE = "hole";
    var PLAYGROUND_SEED_PREFIX = "ITM1";
    var PLAYGROUND_COMPACT_PREFIX = "ITM2";
    var PLAYGROUND_LEGACY_COMPACT_PREFIX = "P";
    var PLAYGROUND_COMPACT_VERSION = 1;
    var PLAYGROUND_COMPACT_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    var PLAYGROUND_COMPACT_MAX_CODE_LENGTH = 96;
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
    var PATTERN_BADGES = {
        cross: "+",
        diagonal: "D",
        square: "S",
        horizontal: "H",
        vertical: "V",
        self: "1",
        knight: "K"
    };
    var KOREAN_PATTERN_BADGES = { cross: "+", diagonal: "대", square: "네", horizontal: "가", vertical: "세", self: "1", knight: "나" };
    var CHAPTER_TITLES = [
        "Binary Beginnings", "Fourfold Flips", "Lights With Lock Icons", "Lockstep Squares", "First Empty Holes",
        "Binary Breakaways", "Fivefold Binary", "Three-Color Start", "Triple Grid", "Three Lock-Icon Tiles",
        "Three Empty Holes", "Triple Combine", "Pattern Primer", "Patterns With Lock Icons", "Color Gauntlet",
        "Four-State Start", "Four-State Lock-Icon Tiles", "Four-State Empty Holes", "Four-State Patterns", "Four-State Matrix",
        "Five-State Start", "Five-State Lock-Icon Tiles", "Five-State Empty Holes", "Five-State Patterns", "Dense Dimensions",
        "Prime Pressure", "Modular Maze", "Wide Matrix", "Endgame Circuit", "Final Inversion"
    ];
    var CAMPAIGN_MAP_SIZE = 5;
    var CAMPAIGN_GROUP_COUNT = CAMPAIGN_MAP_SIZE * CAMPAIGN_MAP_SIZE;
    var CAMPAIGN_LEVELS_PER_GROUP = 9;
    var CAMPAIGN_LEVEL_COUNT = CAMPAIGN_GROUP_COUNT * CAMPAIGN_LEVELS_PER_GROUP;
    var CAMPAIGN_GROUP_STAR_TARGET = 15;
    var CAMPAIGN_GROUP_STAR_MAX = CAMPAIGN_LEVELS_PER_GROUP * 3;
    var CAMPAIGN_VERSION = 5;
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
            hideNumbers: true,
            showPlaygroundNumbers: false,
            guideTextSize: "small",
            language: preferredLanguage()
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
        },
        playgroundPrefs: {
            width: 5,
            height: 5,
            states: 3,
            pattern: "cross",
            tool: "tap",
            board: [],
            locked: [],
            disabled: []
        }
    };
    var app = {
        progress: loadProgress(),
        campaignLevels: [],
        campaignLoadState: "idle",
        campaignLoadError: "",
        campaignLoadPromise: null,
        screens: {},
        activeScreen: "main",
        returnScreen: "main",
        currentGame: null,
        timerId: null,
        pressTimer: null,
        pressInfo: null,
        lastCampaignIndex: 0,
        selectedCampaignGroup: 0,
        audio: null,
        hintMarkTimer: null,
        hintCooldownUntil: 0,
        hintCooldownTimer: null,
        mathJaxPromise: null,
        splashTimer: null,
        splashTiles: [],
        splashState: [],
        splashLastTap: -1
    };
    var els = {};
    document.addEventListener("DOMContentLoaded", init);
    function init() {
        app.audio = createAudioManager();
        cacheElements();
        cacheGuideScreenHtml();
        bindEvents();
        renderFreeplayControls();
        renderPlaygroundControls();
        renderDaily();
        renderAchievements();
        renderAbout();
        syncSettingsUI();
        applySettings();
        showScreen("main");
        ensureCampaignLevels();
    }
    function cacheElements() {
        document.querySelectorAll(".screen").forEach(function (screen) {
            app.screens[screen.id.replace("screen-", "")] = screen;
        });
        els.campaignList = document.getElementById("campaign-list");
        els.dailyList = document.getElementById("daily-list");
        els.achievementsList = document.getElementById("achievements-list");
        els.brandMark = document.querySelector(".brand-mark");
        els.sizeOptions = document.getElementById("size-options");
        els.stateOptions = document.getElementById("state-options");
        els.difficultyOptions = document.getElementById("difficulty-options");
        els.customSize = document.getElementById("custom-size");
        els.customWidth = document.getElementById("custom-width");
        els.customHeight = document.getElementById("custom-height");
        els.patternOptions = document.getElementById("pattern-options");
        els.lockedToggle = document.getElementById("locked-toggle");
        els.irregularToggle = document.getElementById("irregular-toggle");
        els.playgroundWidth = document.getElementById("playground-width");
        els.playgroundHeight = document.getElementById("playground-height");
        els.playgroundStateSummary = document.getElementById("playground-state-summary");
        els.playgroundPatternSummary = document.getElementById("playground-pattern-summary");
        els.playgroundSizeSummary = document.getElementById("playground-size-summary");
        els.playgroundCodeSummary = document.getElementById("playground-code-summary");
        els.playgroundStateOptions = document.getElementById("playground-state-options");
        els.playgroundPatternOptions = document.getElementById("playground-pattern-options");
        els.playgroundToolOptions = document.getElementById("playground-tool-options");
        els.playgroundEditorBoard = document.getElementById("playground-editor-board");
        els.playgroundSeed = document.getElementById("playground-seed");
        els.playgroundSeedStatus = document.getElementById("playground-seed-status");
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
        els.patternInfoModal = document.getElementById("pattern-info-modal");
        els.nextLevelButton = document.querySelector('[data-action="next-level"]');
        els.levelSelectButton = document.querySelector('[data-action="level-select"]');
        els.settingSound = document.getElementById("setting-sound");
        els.settingNumbers = document.getElementById("setting-numbers");
        els.settingPlaygroundNumbers = document.getElementById("setting-playground-numbers");
        els.settingLanguage = document.getElementById("setting-language");
        els.aboutVersion = document.getElementById("about-version");
        els.aboutChangelog = document.getElementById("about-changelog");
    }
    function bindEvents() {
        document.addEventListener("click", function (event) {
            var actionButton = event.target.closest("[data-action]");
            if (!actionButton)
                return;
            var action = actionButton.getAttribute("data-action");
            handleAction(action, actionButton);
        });
        els.campaignList.addEventListener("click", function (event) {
            var group = event.target.closest("[data-campaign-group]");
            if (group && !group.disabled) {
                app.selectedCampaignGroup = Number(group.getAttribute("data-campaign-group")) || 0;
                playSound("ui");
                renderCampaign();
                return;
            }
            var node = event.target.closest("[data-level-id]");
            if (!node || node.disabled)
                return;
            playSound("start");
            startCampaignLevel(node.getAttribute("data-level-id"));
        });
        els.sizeOptions.addEventListener("click", function (event) {
            var chip = event.target.closest("[data-size]");
            if (!chip)
                return;
            playSound("ui");
            app.progress.freePrefs.size = chip.getAttribute("data-size");
            saveProgress();
            renderFreeplayControls();
        });
        els.stateOptions.addEventListener("click", function (event) {
            var chip = event.target.closest("[data-states]");
            if (!chip)
                return;
            playSound("ui");
            app.progress.freePrefs.states = Number(chip.getAttribute("data-states"));
            saveProgress();
            renderFreeplayControls();
        });
        els.difficultyOptions.addEventListener("click", function (event) {
            var chip = event.target.closest("[data-difficulty]");
            if (!chip)
                return;
            playSound("ui");
            app.progress.freePrefs.difficulty = chip.getAttribute("data-difficulty");
            saveProgress();
            renderFreeplayControls();
        });
        els.patternOptions.addEventListener("click", function (event) {
            var chip = event.target.closest("[data-pattern]");
            if (!chip)
                return;
            playSound("ui");
            app.progress.freePrefs.pattern = chip.getAttribute("data-pattern");
            saveProgress();
            renderFreeplayControls();
        });
        [els.customWidth, els.customHeight].forEach(function (input) {
            input.addEventListener("change", updateCustomSize);
            input.addEventListener("input", updateCustomSize);
        });
        [els.lockedToggle, els.irregularToggle].forEach(function (input) {
            input.addEventListener("change", function () {
                playSound("ui");
                app.progress.freePrefs.locked = els.lockedToggle.checked;
                app.progress.freePrefs.irregular = els.irregularToggle.checked;
                app.progress.freePrefs.unique = true;
                saveProgress();
            });
        });
        [els.playgroundWidth, els.playgroundHeight].forEach(function (input) {
            input.addEventListener("change", updatePlaygroundSize);
            input.addEventListener("input", updatePlaygroundSize);
        });
        els.playgroundStateOptions.addEventListener("click", function (event) {
            var chip = event.target.closest("[data-playground-states]");
            if (!chip)
                return;
            playSound("ui");
            var prefs = normalizePlaygroundPrefs();
            prefs.states = Number(chip.getAttribute("data-playground-states"));
            prefs.board = prefs.board.map(function (value) {
                return mod(value, prefs.states);
            });
            saveProgress();
            renderPlaygroundControls();
        });
        els.playgroundPatternOptions.addEventListener("click", function (event) {
            var chip = event.target.closest("[data-playground-pattern]");
            if (!chip)
                return;
            playSound("ui");
            var prefs = normalizePlaygroundPrefs();
            prefs.pattern = chip.getAttribute("data-playground-pattern");
            saveProgress();
            renderPlaygroundControls();
        });
        els.playgroundToolOptions.addEventListener("click", function (event) {
            var chip = event.target.closest("[data-playground-tool]");
            if (!chip)
                return;
            playSound("ui");
            var prefs = normalizePlaygroundPrefs();
            prefs.tool = chip.getAttribute("data-playground-tool");
            saveProgress();
            renderPlaygroundControls();
        });
        els.playgroundEditorBoard.addEventListener("click", function (event) {
            var tile = event.target.closest("[data-playground-index]");
            if (!tile)
                return;
            editPlaygroundTile(Number(tile.getAttribute("data-playground-index")));
        });
        [els.settingSound, els.settingNumbers, els.settingPlaygroundNumbers, els.settingLanguage].forEach(function (input) {
            if (!input)
                return;
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
        if (els.patternInfoModal) {
            els.patternInfoModal.addEventListener("click", function (event) {
                if (event.target === els.patternInfoModal)
                    closePatternInfo();
            });
        }
    }
    function handleAction(action, button) {
        if (action !== "hint" && action !== "undo" && action !== "reset") {
            playSound("ui");
        }
        if (action === "show-main")
            showScreen("main");
        if (action === "show-campaign") {
            renderCampaign();
            showScreen("campaign");
            ensureCampaignLevels().then(renderCampaign);
        }
        if (action === "show-freeplay") {
            renderFreeplayControls();
            showScreen("freeplay");
        }
        if (action === "show-playground") {
            normalizePlaygroundPrefs().tool = PLAYGROUND_TOOL_TAP;
            saveProgress();
            renderPlaygroundControls();
            showScreen("playground");
        }
        if (action === "show-daily") {
            renderDaily();
            showScreen("daily");
        }
        if (action === "show-achievements") {
            renderAchievements();
            showScreen("achievements");
            ensureCampaignLevels().then(renderAchievements);
        }
        if (action === "show-howto") {
            showScreen("howto");
            typesetMath();
        }
        if (action === "show-math") {
            showScreen("math");
            typesetMath();
        }
        if (action === "guide-size")
            setGuideTextSize(button.getAttribute("data-guide-size"));
        if (action === "show-settings")
            openSettings();
        if (action === "close-settings")
            closeSettings();
        if (action === "show-about")
            openAbout();
        if (action === "close-about")
            showScreen("settings");
        if (action === "show-pattern-info")
            openPatternInfo();
        if (action === "close-pattern-info")
            closePatternInfo();
        if (action === "generate-freeplay")
            startFreeplay();
        if (action === "start-playground")
            startPlayground();
        if (action === "clear-playground")
            clearPlaygroundBoard();
        if (action === "copy-playground-seed")
            copyPlaygroundSeed();
        if (action === "load-playground-seed")
            loadPlaygroundSeedFromInput();
        if (action === "start-daily")
            startDaily(button.getAttribute("data-daily-tier"));
        if (action === "exit-game")
            exitGame();
        if (action === "undo")
            undoMove();
        if (action === "reset")
            resetGame();
        if (action === "hint")
            showHint();
        if (action === "next-level")
            startNextLevel(button);
        if (action === "replay")
            replayGame();
        if (action === "level-select")
            leaveCompletionModal();
    }
    function showScreen(name) {
        Object.keys(app.screens).forEach(function (key) {
            app.screens[key].classList.toggle("is-active", key === name);
        });
        app.activeScreen = name;
    }
    function typesetMath() {
        loadMathJax().then(function () {
            if (!window.MathJax || !window.MathJax.typesetPromise)
                return;
            var targets = [];
            if (app.screens.howto)
                targets.push(app.screens.howto);
            if (app.screens.math)
                targets.push(app.screens.math);
            if (!targets.length)
                return;
            window.MathJax.typesetPromise(targets).catch(function () { });
        }).catch(function () { });
    }
    function loadMathJax() {
        if (window.MathJax && window.MathJax.typesetPromise)
            return Promise.resolve();
        if (app.mathJaxPromise)
            return app.mathJaxPromise;
        window.MathJax = {
            tex: {
                inlineMath: [["\\(", "\\)"]],
                displayMath: [["\\[", "\\]"]]
            },
            svg: {
                fontCache: "global"
            }
        };
        app.mathJaxPromise = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = MATHJAX_URL;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return app.mathJaxPromise;
    }
    function openSettings() {
        if (app.activeScreen !== "settings" && app.activeScreen !== "about") {
            app.returnScreen = app.activeScreen || "main";
        }
        syncSettingsUI();
        showScreen("settings");
    }
    function closeSettings() {
        var target = app.returnScreen || "main";
        if (target === "settings" || target === "about")
            target = "main";
        showScreen(target);
    }
    function openAbout() {
        renderAbout();
        showScreen("about");
    }
    function openPatternInfo() {
        if (!els.patternInfoModal)
            return;
        cancelPress();
        els.patternInfoModal.hidden = false;
    }
    function closePatternInfo() {
        if (!els.patternInfoModal)
            return;
        els.patternInfoModal.hidden = true;
    }
    function loadProgress() {
        var stored = null;
        try {
            stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
        }
        catch (error) {
            stored = null;
        }
        var storedCampaignVersion = stored && stored.campaignVersion;
        var progress = deepMerge(clone(DEFAULT_PROGRESS), stored || {});
        if (storedCampaignVersion !== CAMPAIGN_VERSION)
            resetCampaignProgress(progress);
        progress.freePrefs.unique = true;
        normalizePlaygroundPrefs(progress);
        return progress;
    }
    function saveProgress() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(app.progress));
    }
    function resetCampaignProgress(progress) {
        ["stars", "completed", "hintUsed", "bestMoves"].forEach(function (bucket) {
            Object.keys(progress[bucket] || {}).forEach(function (key) {
                if (/^c\d+-\d+$/.test(key))
                    delete progress[bucket][key];
            });
        });
        progress.campaignVersion = CAMPAIGN_VERSION;
    }
    function deepMerge(target, source) {
        Object.keys(source).forEach(function (key) {
            if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
                if (!target[key])
                    target[key] = {};
                deepMerge(target[key], source[key]);
            }
            else {
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
        renderLanguageOptions();
        els.settingSound.checked = settings.sound;
        els.settingNumbers.checked = !Boolean(settings.hideNumbers);
        if (els.settingPlaygroundNumbers)
            els.settingPlaygroundNumbers.checked = Boolean(settings.showPlaygroundNumbers);
        if (els.settingLanguage)
            els.settingLanguage.value = currentLanguage();
    }
    function updateSettingsFromUI() {
        var soundWasOff = !app.progress.settings.sound;
        var previousLanguage = currentLanguage();
        app.progress.settings.sound = els.settingSound.checked;
        app.progress.settings.hideNumbers = !els.settingNumbers.checked;
        if (els.settingPlaygroundNumbers)
            app.progress.settings.showPlaygroundNumbers = els.settingPlaygroundNumbers.checked;
        if (els.settingLanguage)
            app.progress.settings.language = normalizeLanguage(els.settingLanguage.value);
        saveProgress();
        applySettings();
        renderBoard();
        if (soundWasOff && app.progress.settings.sound)
            playSound("ui");
        if (previousLanguage !== currentLanguage())
            playSound("ui");
    }
    function applySettings() {
        var guideSize = normalizeGuideTextSize(app.progress.settings.guideTextSize);
        app.progress.settings.language = currentLanguage();
        document.body.classList.toggle("hide-numbers", Boolean(app.progress.settings.hideNumbers));
        document.body.classList.toggle("show-playground-numbers", Boolean(app.progress.settings.showPlaygroundNumbers));
        document.body.classList.toggle("guide-size-medium", guideSize === "medium");
        document.body.classList.toggle("guide-size-large", guideSize === "large");
        syncGuideSizeControls();
        startSplashBoard();
        applyLanguage();
    }
    function preferredLanguage() {
        if (typeof navigator === "undefined")
            return "en";
        var locales = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
        for (var locale of locales) {
            var language = String(locale || "").toLowerCase().split("-")[0];
            if (LANGUAGE_OPTIONS.some(function (option) { return option.key === language; }))
                return language;
        }
        return "en";
    }
    function normalizeLanguage(language) {
        return LANGUAGE_OPTIONS.some(function (option) { return option.key === language; }) ? language : "en";
    }
    function currentLanguage() {
        return normalizeLanguage(app.progress && app.progress.settings ? app.progress.settings.language : "en");
    }
    function t(text, values) {
        var table = TEXT_TRANSLATIONS[currentLanguage()];
        var translated = (table && table[text]) || text;
        if (!values)
            return translated;
        return translated.replace(/\{(\w+)\}/g, function (placeholder, key) {
            return Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : placeholder;
        });
    }
    function renderLanguageOptions() {
        if (!els.settingLanguage)
            return;
        els.settingLanguage.innerHTML = LANGUAGE_OPTIONS.map(function (option) {
            return '<option value="' + option.key + '">' + option.label + '</option>';
        }).join("");
    }
    function applyLanguage() {
        var language = currentLanguage();
        document.documentElement.lang = language;
        translateStaticDom();
        renderFreeplayControls();
        renderPlaygroundControls();
        renderDaily();
        renderAchievements();
        renderAbout();
        if (app.activeScreen === "campaign")
            renderCampaign();
        if (app.currentGame) {
            els.modeLabel.textContent = modeLabel(app.currentGame.mode);
            els.titleLabel.textContent = gameDisplayName(app.currentGame);
            renderPatternIndicator(app.currentGame);
            renderBoard();
            updateCounters();
        }
        syncGuideSizeControls();
        if (app.activeScreen === "howto" || app.activeScreen === "math")
            typesetMath();
    }
    function setTranslatedText(element, message) {
        element.textContent = t(message);
        if (element.firstChild)
            originalTextNodes.set(element.firstChild, message);
    }
    function translateStaticDom() {
        restoreGuideScreenHtml();
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                var parent = node.parentElement;
                if (!parent || parent.closest("script, style"))
                    return NodeFilter.FILTER_REJECT;
                return node.nodeValue && node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            }
        });
        var textNode;
        while ((textNode = walker.nextNode())) {
            var source = originalTextNodes.get(textNode);
            if (source === undefined) {
                source = textNode.nodeValue;
                originalTextNodes.set(textNode, source);
            }
            var trimmed = source.trim();
            if (!trimmed)
                continue;
            textNode.nodeValue = source.replace(trimmed, function () { return t(trimmed); });
        }
        document.querySelectorAll("[aria-label]").forEach(function (node) {
            var source = originalAttributes.get(node);
            if (source === undefined) {
                source = node.getAttribute("aria-label") || "";
                originalAttributes.set(node, source);
            }
            if (source)
                node.setAttribute("aria-label", t(source));
        });
        highlightGuideTerms();
    }
    function cacheGuideScreenHtml() {
        ["howto", "math"].forEach(function (key) {
            if (app.screens[key] && guideScreenHtml[key] === undefined) {
                guideScreenHtml[key] = app.screens[key].innerHTML;
            }
        });
    }
    function restoreGuideScreenHtml() {
        ["howto", "math"].forEach(function (key) {
            if (app.screens[key] && guideScreenHtml[key] !== undefined) {
                app.screens[key].innerHTML = guideScreenHtml[key];
            }
        });
    }
    function highlightGuideTerms() {
        var language = currentLanguage();
        var groups = TERM_HIGHLIGHTS[language] || TERM_HIGHLIGHTS.en;
        ["howto", "math"].forEach(function (screen) {
            var root = app.screens[screen];
            var rules = groups[screen] || [];
            rules.forEach(function (rule) {
                highlightFirstTerm(root, rule, language);
            });
        });
    }
    function highlightFirstTerm(root, rule, language) {
        if (!root || !rule || !rule.terms || !rule.terms.length)
            return;
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                var parent = node.parentElement;
                if (!parent || parent.closest("script, style, svg, mjx-container, .formula-card, .guide-size-control, .guide-term")) {
                    return NodeFilter.FILTER_REJECT;
                }
                return node.nodeValue && node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            }
        });
        var textNode;
        while ((textNode = walker.nextNode())) {
            var match = findTermMatch(textNode.nodeValue || "", rule.terms, language);
            if (!match)
                continue;
            wrapTextRange(textNode, match.index, match.length, rule.color);
            return;
        }
    }
    function findTermMatch(text, terms, language) {
        var lowerText = text.toLocaleLowerCase(language);
        var best = null;
        terms.forEach(function (term) {
            var lowerTerm = term.toLocaleLowerCase(language);
            var from = 0;
            while (from <= lowerText.length) {
                var index = lowerText.indexOf(lowerTerm, from);
                if (index < 0)
                    break;
                var end = index + lowerTerm.length;
                // Korean noun particles attach without a space and stay outside the highlighted term.
                var endsWithParticle = language === "ko" && /^(?:은|는|이|가|을|를|에|의|과|와|도|로|으로|에서|에는|에도|마다|처럼|만|부터|까지)(?![\p{L}\p{N}_])/u.test(text.slice(end));
                if (isTermBoundary(text, index - 1) && (isTermBoundary(text, end) || endsWithParticle)) {
                    if (!best || index < best.index || (index === best.index && lowerTerm.length > best.length)) {
                        best = { index: index, length: lowerTerm.length };
                    }
                    break;
                }
                from = index + 1;
            }
        });
        return best;
    }
    function isTermBoundary(text, index) {
        if (index < 0 || index >= text.length)
            return true;
        return !/[\p{L}\p{N}_]/u.test(text.charAt(index));
    }
    function wrapTextRange(textNode, index, length, color) {
        var selected = textNode.splitText(index);
        selected.splitText(length);
        var marker = document.createElement("strong");
        marker.className = "guide-term guide-term-" + color;
        marker.textContent = selected.nodeValue;
        selected.parentNode.replaceChild(marker, selected);
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
        if (!els.brandMark)
            return;
        app.splashTiles = Array.prototype.slice.call(els.brandMark.querySelectorAll("span"));
        if (!app.splashTiles.length)
            return;
        app.splashState = app.splashTiles.map(function () {
            return 0;
        });
        app.splashLastTap = -1;
        for (var i = 0; i < 7; i += 1) {
            applySplashMove(randomSplashTap(rng));
        }
        renderSplashBoard([], -1);
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
            tile.classList.remove("splash-state-0", "splash-state-1", "splash-state-2", "splash-state-3", "is-splash-pulse", "is-splash-tap");
            tile.classList.add("splash-state-" + app.splashState[index]);
        });
        if (!changed.size)
            return;
        void app.splashTiles[changedIndexes[0]].offsetWidth;
        changed.forEach(function (index) {
            app.splashTiles[index].classList.add("is-splash-pulse");
        });
        if (tapIndex >= 0 && app.splashTiles[tapIndex]) {
            app.splashTiles[tapIndex].classList.add("is-splash-tap");
        }
    }
    function renderAbout() {
        if (els.aboutVersion) {
            els.aboutVersion.textContent = t("Version") + " " + APP_VERSION;
        }
        if (!els.aboutChangelog)
            return;
        els.aboutChangelog.innerHTML = CHANGELOG_ENTRIES.map(function (entry) {
            return "<li><strong>" + entry.version + "</strong> - " + entry.date + ": " + t(entry.text) + "</li>";
        }).join("");
    }
    function renderFreeplayControls() {
        var prefs = app.progress.freePrefs;
        prefs.unique = true;
        els.sizeOptions.innerHTML = SIZE_OPTIONS.map(function (size) {
            return chipHtml(size === "Custom" ? t("Custom") : size, "data-size", size, prefs.size === size);
        }).join("");
        els.customSize.hidden = prefs.size !== "Custom";
        els.customWidth.value = prefs.customWidth;
        els.customHeight.value = prefs.customHeight;
        els.stateOptions.innerHTML = STATE_OPTIONS.map(function (stateCount) {
            return chipHtml(t("{n} states", { n: stateCount }), "data-states", stateCount, prefs.states === stateCount);
        }).join("");
        els.difficultyOptions.innerHTML = DIFFICULTIES.map(function (difficulty) {
            return chipHtml(difficultyDisplayName(difficulty), "data-difficulty", difficulty, prefs.difficulty === difficulty);
        }).join("");
        els.patternOptions.innerHTML = FREE_PATTERNS.map(function (key) {
            return patternChipHtml(key, prefs.pattern === key);
        }).join("");
        els.lockedToggle.checked = prefs.locked;
        els.irregularToggle.checked = prefs.irregular;
    }
    function normalizePlaygroundPrefs(progress) {
        var root = progress || app.progress;
        if (!root.playgroundPrefs)
            root.playgroundPrefs = clone(DEFAULT_PROGRESS.playgroundPrefs);
        var prefs = root.playgroundPrefs;
        prefs.width = clamp(Number(prefs.width) || 5, 3, 9);
        prefs.height = clamp(Number(prefs.height) || 5, 3, 9);
        prefs.states = STATE_OPTIONS.indexOf(Number(prefs.states)) === -1 ? 3 : Number(prefs.states);
        if (PLAYGROUND_PATTERNS.indexOf(prefs.pattern) === -1)
            prefs.pattern = "cross";
        if (!isValidPlaygroundTool(prefs.tool, prefs.states))
            prefs.tool = PLAYGROUND_TOOL_TAP;
        var total = prefs.width * prefs.height;
        var board = Array.isArray(prefs.board) ? prefs.board.slice(0, total) : [];
        while (board.length < total)
            board.push(0);
        prefs.board = board.map(function (value) {
            return mod(Number(value) || 0, prefs.states);
        });
        prefs.disabled = cleanPlaygroundIndexes(prefs.disabled, total);
        prefs.locked = cleanPlaygroundIndexes(prefs.locked, total).filter(function (idx) {
            return prefs.disabled.indexOf(idx) === -1;
        });
        prefs.disabled.forEach(function (idx) {
            prefs.board[idx] = 0;
        });
        if (prefs.disabled.length >= total) {
            prefs.disabled = prefs.disabled.slice(0, Math.max(0, total - 1));
        }
        return prefs;
    }
    function playgroundPaintTool(state) {
        return "paint-" + state;
    }
    function playgroundPaintState(tool) {
        var match = String(tool || "").match(/^paint-([0-4])$/);
        return match ? Number(match[1]) : null;
    }
    function isValidPlaygroundTool(tool, states) {
        if (tool === PLAYGROUND_TOOL_TAP || tool === PLAYGROUND_TOOL_LOCK || tool === PLAYGROUND_TOOL_HOLE)
            return true;
        var paintState = playgroundPaintState(tool);
        return paintState !== null && paintState >= 0 && paintState < states;
    }
    function cleanPlaygroundIndexes(items, total) {
        var seen = new Set();
        var cleaned = [];
        (Array.isArray(items) ? items : []).forEach(function (item) {
            var idx = Number(item);
            if (!Number.isFinite(idx) || idx < 0 || idx >= total || seen.has(idx))
                return;
            seen.add(idx);
            cleaned.push(idx);
        });
        return cleaned.sort(function (a, b) {
            return a - b;
        });
    }
    function renderPlaygroundControls() {
        if (!els.playgroundEditorBoard)
            return;
        var prefs = normalizePlaygroundPrefs();
        els.playgroundWidth.value = prefs.width;
        els.playgroundHeight.value = prefs.height;
        if (els.playgroundStateSummary)
            els.playgroundStateSummary.textContent = t("{n} states", { n: prefs.states });
        if (els.playgroundPatternSummary)
            els.playgroundPatternSummary.textContent = patternDisplayName(prefs.pattern);
        if (els.playgroundSizeSummary)
            els.playgroundSizeSummary.textContent = prefs.width + "x" + prefs.height;
        if (els.playgroundCodeSummary)
            els.playgroundCodeSummary.textContent = t("Share");
        els.playgroundStateOptions.innerHTML = STATE_OPTIONS.map(function (stateCount) {
            return chipHtml(t("{n} states", { n: stateCount }), "data-playground-states", stateCount, prefs.states === stateCount);
        }).join("");
        els.playgroundPatternOptions.innerHTML = PLAYGROUND_PATTERNS.map(function (key) {
            return playgroundPatternChipHtml(key, prefs.pattern === key);
        }).join("");
        els.playgroundToolOptions.innerHTML = playgroundToolButtonsHtml(prefs);
        renderPlaygroundEditorBoard();
        if (els.playgroundSeed && document.activeElement !== els.playgroundSeed) {
            els.playgroundSeed.value = encodePlaygroundSeed(prefs);
        }
    }
    function playgroundToolButtonsHtml(prefs) {
        var buttons = [
            playgroundToolButtonHtml(PLAYGROUND_TOOL_TAP, prefs.tool, t("Tap Tiles"), '<svg class="playground-tool-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3v11l3-2 2.4 5.3 2.7-1.2-2.4-5.3 3.3-.5Z"></path></svg>', "")
        ];
        for (var state = 0; state < prefs.states; state += 1) {
            var label = state === 0 ? t("Paint White") : t("Paint color {n}", { n: state });
            buttons.push(playgroundToolButtonHtml(playgroundPaintTool(state), prefs.tool, label, '<span class="playground-swatch state-' + state + '" aria-hidden="true"></span>', " swatch-tool"));
        }
        buttons.push(playgroundToolButtonHtml(PLAYGROUND_TOOL_LOCK, prefs.tool, t("Lock Tiles"), '<svg class="playground-tool-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.25 10.25V8.1a4.75 4.75 0 0 1 9.5 0v2.15"></path><rect x="5.25" y="10.25" width="13.5" height="10" rx="2.6"></rect><path d="M12 14.2v2.45"></path></svg>', ""));
        buttons.push(playgroundToolButtonHtml(PLAYGROUND_TOOL_HOLE, prefs.tool, t("Place Holes"), '<svg class="playground-tool-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14"></path><path d="M19 5L5 19"></path></svg>', ""));
        return buttons.join("");
    }
    function playgroundToolButtonHtml(tool, selectedTool, label, icon, extraClass) {
        return '<button class="playground-tool-button' + (extraClass || "") + (selectedTool === tool ? " is-selected" : "") + '" data-playground-tool="' + tool + '" role="radio" aria-checked="' + (selectedTool === tool ? "true" : "false") + '" aria-label="' + escapeAttribute(label) + '" title="' + escapeAttribute(label) + '">' + icon + '</button>';
    }
    function playgroundPatternChipHtml(key, selected) {
        var label = patternDisplayName(key);
        return '<button class="chip pattern-chip' + (selected ? " is-selected" : "") + '" data-playground-pattern="' + key + '" role="radio" aria-checked="' + (selected ? "true" : "false") + '" aria-label="' + escapeAttribute(label) + '">' +
            renderPatternChoiceIcon(key) +
            '<span class="pattern-chip-label">' + escapeAttribute(label) + '</span>' +
            '</button>';
    }
    function renderPlaygroundEditorBoard(pulsedIndexes) {
        var prefs = normalizePlaygroundPrefs();
        var locked = new Set(prefs.locked);
        var disabled = new Set(prefs.disabled);
        var pulseSet = new Set(pulsedIndexes || []);
        els.playgroundEditorBoard.style.gridTemplateColumns = "repeat(" + prefs.width + ", minmax(0, 1fr))";
        els.playgroundEditorBoard.style.setProperty("--board-ratio", prefs.width + " / " + prefs.height);
        els.playgroundEditorBoard.style.setProperty("--board-ratio-number", String(prefs.width / prefs.height));
        var html = [];
        for (var y = 0; y < prefs.height; y += 1) {
            for (var x = 0; x < prefs.width; x += 1) {
                var idx = indexFor(x, y, prefs.width);
                if (disabled.has(idx)) {
                    html.push('<button class="hole playground-hole' + (pulseSet.has(idx) ? " pulsed" : "") + '" data-playground-index="' + idx + '" aria-label="' + escapeAttribute(t("Row {row}, column {column}", { row: y + 1, column: x + 1 }) + ", " + t("Empty hole")) + '"></button>');
                    continue;
                }
                var state = prefs.board[idx] || 0;
                var classes = ["tile", "playground-tile", "state-" + state];
                if (locked.has(idx))
                    classes.push("locked");
                if (pulseSet.has(idx))
                    classes.push("pulsed");
                var lockMark = locked.has(idx) ? '<span class="lock-badge" aria-hidden="true"><svg class="lock-mark" viewBox="0 0 24 24"><path class="lock-shackle" d="M7.25 10.25V8.1a4.75 4.75 0 0 1 9.5 0v2.15"></path><rect class="lock-body" x="5.25" y="10.25" width="13.5" height="10" rx="2.6"></rect><path class="lock-key" d="M12 14.2v2.45"></path></svg></span>' : "";
                html.push('<button class="' + classes.join(" ") + '" data-playground-index="' + idx + '" data-number="' + STATE_NUMBERS[state] + '" aria-label="' + escapeAttribute(t("Row {row}, column {column}", { row: y + 1, column: x + 1 }) + ", " + t("state") + " " + state + (locked.has(idx) ? ", " + t("locked") : "")) + '">' +
                    lockMark +
                    '</button>');
            }
        }
        els.playgroundEditorBoard.innerHTML = html.join("");
    }
    function editPlaygroundTile(index) {
        var prefs = normalizePlaygroundPrefs();
        var total = prefs.width * prefs.height;
        if (index < 0 || index >= total)
            return;
        var locked = new Set(prefs.locked);
        var disabled = new Set(prefs.disabled);
        if (prefs.tool === PLAYGROUND_TOOL_TAP) {
            tapPlaygroundTile(index);
            return;
        }
        var paintState = playgroundPaintState(prefs.tool);
        if (prefs.tool === PLAYGROUND_TOOL_HOLE) {
            if (disabled.has(index)) {
                disabled.delete(index);
            }
            else if (disabled.size >= total - 1) {
                setPlaygroundStatus("Keep at least one tile.");
                playSound("invalid");
                return;
            }
            else {
                disabled.add(index);
                locked.delete(index);
                prefs.board[index] = 0;
            }
        }
        else if (prefs.tool === PLAYGROUND_TOOL_LOCK) {
            if (disabled.has(index))
                disabled.delete(index);
            if (locked.has(index))
                locked.delete(index);
            else
                locked.add(index);
        }
        else if (paintState !== null) {
            if (disabled.has(index)) {
                disabled.delete(index);
            }
            prefs.board[index] = mod(paintState, prefs.states);
        }
        prefs.locked = Array.from(locked).filter(function (idx) {
            return !disabled.has(idx);
        }).sort(function (a, b) {
            return a - b;
        });
        prefs.disabled = Array.from(disabled).sort(function (a, b) {
            return a - b;
        });
        saveProgress();
        setPlaygroundStatus("");
        renderPlaygroundControls();
        playSound("ui");
    }
    function playgroundGameFromPrefs(prefs) {
        return {
            width: prefs.width,
            height: prefs.height,
            states: prefs.states,
            defaultPattern: prefs.pattern,
            locked: new Set(prefs.locked),
            disabled: new Set(prefs.disabled),
            tilePatterns: {}
        };
    }
    function tapPlaygroundTile(index) {
        var prefs = normalizePlaygroundPrefs();
        var game = playgroundGameFromPrefs(prefs);
        if (!isTappable(game, index)) {
            playSound("invalid");
            return;
        }
        var affected = getAffectedIndexes(game, index);
        applyPulse(game, prefs.board, index);
        saveProgress();
        setPlaygroundStatus("");
        renderPlaygroundControls();
        renderPlaygroundEditorBoard(affected);
        playSound("pulse", { state: prefs.board[index] || 0, states: prefs.states, affected: affected.length });
    }
    function updatePlaygroundSize() {
        var prefs = normalizePlaygroundPrefs();
        var oldWidth = prefs.width;
        var oldHeight = prefs.height;
        var oldBoard = prefs.board.slice();
        var oldLocked = new Set(prefs.locked);
        var oldDisabled = new Set(prefs.disabled);
        prefs.width = clamp(Number(els.playgroundWidth.value) || 5, 3, 9);
        prefs.height = clamp(Number(els.playgroundHeight.value) || 5, 3, 9);
        var total = prefs.width * prefs.height;
        var nextBoard = new Array(total).fill(0);
        var nextLocked = [];
        var nextDisabled = [];
        for (var y = 0; y < Math.min(oldHeight, prefs.height); y += 1) {
            for (var x = 0; x < Math.min(oldWidth, prefs.width); x += 1) {
                var oldIdx = indexFor(x, y, oldWidth);
                var nextIdx = indexFor(x, y, prefs.width);
                nextBoard[nextIdx] = oldBoard[oldIdx] || 0;
                if (oldLocked.has(oldIdx))
                    nextLocked.push(nextIdx);
                if (oldDisabled.has(oldIdx))
                    nextDisabled.push(nextIdx);
            }
        }
        prefs.board = nextBoard;
        prefs.locked = nextLocked;
        prefs.disabled = nextDisabled;
        normalizePlaygroundPrefs();
        saveProgress();
        renderPlaygroundControls();
    }
    function clearPlaygroundBoard() {
        var prefs = normalizePlaygroundPrefs();
        prefs.board = new Array(prefs.width * prefs.height).fill(0);
        prefs.locked = [];
        prefs.disabled = [];
        saveProgress();
        setPlaygroundStatus("");
        renderPlaygroundControls();
    }
    function setPlaygroundStatus(message) {
        if (els.playgroundSeedStatus)
            setTranslatedText(els.playgroundSeedStatus, message);
    }
    function encodePlaygroundSeed(prefs) {
        return encodePlaygroundCompactSeed(prefs);
    }
    function normalizedPlaygroundSeedPrefs(prefs) {
        prefs = prefs || normalizePlaygroundPrefs();
        var width = clamp(Number(prefs.width) || 5, 3, 9);
        var height = clamp(Number(prefs.height) || 5, 3, 9);
        var states = STATE_OPTIONS.indexOf(Number(prefs.states)) === -1 ? 3 : Number(prefs.states);
        var pattern = PLAYGROUND_PATTERNS.indexOf(prefs.pattern) === -1 ? "cross" : prefs.pattern;
        var total = width * height;
        var board = Array.isArray(prefs.board) ? prefs.board.slice(0, total) : [];
        while (board.length < total)
            board.push(0);
        board = board.map(function (value) {
            return mod(Number(value) || 0, states);
        });
        var disabled = cleanPlaygroundIndexes(prefs.disabled, total);
        if (disabled.length >= total)
            disabled = disabled.slice(0, Math.max(0, total - 1));
        var disabledSet = new Set(disabled);
        var locked = cleanPlaygroundIndexes(prefs.locked, total).filter(function (idx) {
            return !disabledSet.has(idx);
        });
        disabled.forEach(function (idx) {
            board[idx] = 0;
        });
        return {
            width: width,
            height: height,
            states: states,
            pattern: pattern,
            board: board,
            locked: locked,
            disabled: disabled
        };
    }
    function compactBitsForStates(states) {
        var bits = 1;
        var capacity = 2;
        while (capacity < states) {
            bits += 1;
            capacity *= 2;
        }
        return bits;
    }
    function writeCompactBits(bits, value, count) {
        for (var shift = count - 1; shift >= 0; shift -= 1) {
            bits.push((value >> shift) & 1);
        }
    }
    function compactCodeChecksum(body) {
        var hash = 913;
        for (var i = 0; i < body.length; i += 1) {
            hash = ((hash * 33) ^ body.charCodeAt(i)) & 1023;
        }
        return hash;
    }
    function compactChecksumText(body) {
        var checksum = compactCodeChecksum(body);
        return PLAYGROUND_COMPACT_ALPHABET[Math.floor(checksum / 32)] + PLAYGROUND_COMPACT_ALPHABET[checksum % 32];
    }
    function encodePlaygroundCompactSeed(prefs) {
        var config = normalizedPlaygroundSeedPrefs(prefs);
        var total = config.width * config.height;
        var lockedSet = new Set(config.locked);
        var disabledSet = new Set(config.disabled);
        var stateBits = compactBitsForStates(config.states);
        var bits = [];
        writeCompactBits(bits, PLAYGROUND_COMPACT_VERSION, 4);
        writeCompactBits(bits, config.width - 3, 3);
        writeCompactBits(bits, config.height - 3, 3);
        writeCompactBits(bits, STATE_OPTIONS.indexOf(config.states), 2);
        writeCompactBits(bits, PLAYGROUND_PATTERNS.indexOf(config.pattern), 3);
        for (var idx = 0; idx < total; idx += 1) {
            var disabled = disabledSet.has(idx);
            writeCompactBits(bits, disabled ? 1 : 0, 1);
            if (!disabled) {
                writeCompactBits(bits, lockedSet.has(idx) ? 1 : 0, 1);
                writeCompactBits(bits, mod(config.board[idx], config.states), stateBits);
            }
        }
        var body = "";
        for (var bit = 0; bit < bits.length; bit += 5) {
            var value = 0;
            for (var offset = 0; offset < 5; offset += 1) {
                value = (value << 1) | (bits[bit + offset] || 0);
            }
            body += PLAYGROUND_COMPACT_ALPHABET[value];
        }
        return PLAYGROUND_COMPACT_PREFIX + body + compactChecksumText(body);
    }
    function decodePlaygroundSeed(seed) {
        return decodePlaygroundCompactSeed(seed) || decodePlaygroundLegacySeed(seed);
    }
    function compactAlphabetIndex(ch) {
        return PLAYGROUND_COMPACT_ALPHABET.indexOf(ch);
    }
    function decodePlaygroundCompactSeed(seed) {
        var code = String(seed || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        var prefixes = [PLAYGROUND_COMPACT_PREFIX, PLAYGROUND_LEGACY_COMPACT_PREFIX];
        for (var prefixIndex = 0; prefixIndex < prefixes.length; prefixIndex += 1) {
            var prefix = prefixes[prefixIndex];
            for (var start = 0; start <= code.length - prefix.length - 3; start += 1) {
                if (code.slice(start, start + prefix.length) !== prefix)
                    continue;
                var maxEnd = Math.min(code.length, start + PLAYGROUND_COMPACT_MAX_CODE_LENGTH);
                for (var end = start + prefix.length + 3; end <= maxEnd; end += 1) {
                    var decoded = decodePlaygroundCompactCode(code.slice(start, end), prefix);
                    if (decoded)
                        return decoded;
                }
            }
        }
        return null;
    }
    function decodePlaygroundCompactCode(code, prefix) {
        if (!code || code.slice(0, prefix.length) !== prefix || code.length < prefix.length + 3)
            return null;
        var body = code.slice(prefix.length, -2);
        var checksum = code.slice(-2);
        if (!body || checksum.length !== 2 || compactChecksumText(body) !== checksum)
            return null;
        var bits = [];
        for (var i = 0; i < body.length; i += 1) {
            var value = compactAlphabetIndex(body[i]);
            if (value < 0)
                return null;
            writeCompactBits(bits, value, 5);
        }
        if (compactAlphabetIndex(checksum[0]) < 0 || compactAlphabetIndex(checksum[1]) < 0)
            return null;
        var position = 0;
        var failed = false;
        function readBits(count) {
            if (position + count > bits.length) {
                failed = true;
                return 0;
            }
            var value = 0;
            for (var offset = 0; offset < count; offset += 1) {
                value = (value << 1) | bits[position + offset];
            }
            position += count;
            return value;
        }
        var version = readBits(4);
        var width = readBits(3) + 3;
        var height = readBits(3) + 3;
        var stateIndex = readBits(2);
        var patternIndex = readBits(3);
        if (failed || version !== PLAYGROUND_COMPACT_VERSION)
            return null;
        var states = STATE_OPTIONS[stateIndex];
        var pattern = PLAYGROUND_PATTERNS[patternIndex];
        if (!states || !pattern)
            return null;
        var total = width * height;
        var stateBits = compactBitsForStates(states);
        var board = [];
        var locked = [];
        var disabled = [];
        for (var idx = 0; idx < total; idx += 1) {
            var isDisabled = readBits(1) === 1;
            if (isDisabled) {
                disabled.push(idx);
                board.push(0);
            }
            else {
                var isLocked = readBits(1) === 1;
                var state = readBits(stateBits);
                if (state >= states)
                    return null;
                board.push(state);
                if (isLocked)
                    locked.push(idx);
            }
        }
        if (failed || disabled.length >= total)
            return null;
        if (Math.ceil(position / 5) !== body.length)
            return null;
        for (; position < bits.length; position += 1) {
            if (bits[position])
                return null;
        }
        return {
            width: width,
            height: height,
            states: states,
            pattern: pattern,
            tool: PLAYGROUND_TOOL_TAP,
            board: board,
            locked: locked,
            disabled: disabled
        };
    }
    function decodePlaygroundLegacySeed(seed) {
        var text = String(seed || "").trim();
        var match = text.match(/ITM1:[^\s]+/);
        if (match)
            text = match[0];
        var parts = text.split(":");
        if (parts.length < 7 || parts[0] !== PLAYGROUND_SEED_PREFIX)
            return null;
        var dims = parts[1].split("x").map(Number);
        var width = clamp(dims[0] || 0, 3, 9);
        var height = clamp(dims[1] || 0, 3, 9);
        if (!dims[0] || !dims[1])
            return null;
        var states = Number(parts[2]);
        if (STATE_OPTIONS.indexOf(states) === -1)
            return null;
        var pattern = parts[3];
        if (PLAYGROUND_PATTERNS.indexOf(pattern) === -1)
            return null;
        var total = width * height;
        var boardText = parts[4] || "";
        if (boardText.length !== total || /[^0-4]/.test(boardText))
            return null;
        var board = boardText.split("").map(function (digit) {
            return mod(Number(digit) || 0, states);
        });
        var disabled = decodePlaygroundIndexList(parts[6], total);
        if (!disabled || disabled.length >= total)
            return null;
        var disabledSet = new Set(disabled);
        var locked = decodePlaygroundIndexList(parts[5], total);
        if (!locked)
            return null;
        locked = locked.filter(function (idx) {
            return !disabledSet.has(idx);
        });
        disabled.forEach(function (idx) {
            board[idx] = 0;
        });
        return {
            width: width,
            height: height,
            states: states,
            pattern: pattern,
            tool: PLAYGROUND_TOOL_TAP,
            board: board,
            locked: locked,
            disabled: disabled
        };
    }
    function decodePlaygroundIndexList(text, total) {
        if (!text)
            return [];
        var seen = new Set();
        var out = [];
        var parts = String(text).split(".");
        for (var i = 0; i < parts.length; i += 1) {
            if (!parts[i])
                continue;
            if (!/^[0-9a-z]+$/i.test(parts[i]))
                return null;
            var idx = parseInt(parts[i], 36);
            if (!Number.isFinite(idx) || idx < 0 || idx >= total)
                return null;
            if (!seen.has(idx)) {
                seen.add(idx);
                out.push(idx);
            }
        }
        return out.sort(function (a, b) {
            return a - b;
        });
    }
    function loadPlaygroundSeedFromInput() {
        var decoded = decodePlaygroundSeed(els.playgroundSeed.value);
        if (!decoded) {
            setPlaygroundStatus("Puzzle code not recognized.");
            playSound("invalid");
            return;
        }
        app.progress.playgroundPrefs = decoded;
        saveProgress();
        renderPlaygroundControls();
        setPlaygroundStatus("Puzzle code loaded.");
        playSound("ui");
    }
    function copyPlaygroundSeed() {
        var seed = encodePlaygroundSeed(normalizePlaygroundPrefs());
        if (els.playgroundSeed)
            els.playgroundSeed.value = seed;
        var copied = false;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(seed).then(function () {
                setPlaygroundStatus("Puzzle code copied.");
            }).catch(function () {
                setPlaygroundStatus("Puzzle code copied.");
            });
            copied = true;
        }
        else if (els.playgroundSeed) {
            els.playgroundSeed.focus();
            els.playgroundSeed.select();
            try {
                copied = document.execCommand("copy");
            }
            catch (error) {
                copied = false;
            }
        }
        setPlaygroundStatus(copied ? "Puzzle code copied." : "Puzzle code copied.");
    }
    function chipHtml(label, attr, value, selected) {
        return '<button class="chip' + (selected ? " is-selected" : "") + '" ' + attr + '="' + value + '" role="radio" aria-checked="' + (selected ? "true" : "false") + '">' + label + '</button>';
    }
    function patternChipHtml(key, selected) {
        var label = patternDisplayName(key);
        return '<button class="chip pattern-chip' + (selected ? " is-selected" : "") + '" data-pattern="' + key + '" role="radio" aria-checked="' + (selected ? "true" : "false") + '" aria-label="' + escapeAttribute(label) + '">' +
            renderPatternChoiceIcon(key) +
            '<span class="pattern-chip-label">' + escapeAttribute(label) + '</span>' +
            '</button>';
    }
    function renderPatternChoiceIcon(key) {
        var size = 5;
        var center = 2;
        var active = patternChoiceCells(key);
        var cells = [];
        for (var y = 0; y < size; y += 1) {
            for (var x = 0; x < size; x += 1) {
                var coord = x + "," + y;
                var classes = ["pattern-choice-cell"];
                if (active.has(coord)) {
                    classes.push("is-active");
                    if (key === "randomMixed" && !(x === center && y === center)) {
                        classes.push((x + y) % 3 === 0 ? "is-mixed-a" : ((x + y) % 3 === 1 ? "is-mixed-b" : "is-mixed-c"));
                    }
                }
                if (x === center && y === center)
                    classes.push("is-center");
                cells.push('<span class="' + classes.join(" ") + '"></span>');
            }
        }
        return '<span class="pattern-choice-icon" aria-hidden="true"><span class="pattern-choice-grid">' + cells.join("") + '</span></span>';
    }
    function patternChoiceCells(key) {
        var center = 2;
        if (key === "randomMixed") {
            return new Set(["2,2", "1,1", "3,3", "0,2", "4,2", "1,4", "3,0"]);
        }
        var pattern = PATTERNS[key] || PATTERNS.cross;
        return new Set(pattern.offsets.map(function (offset) {
            return (center + offset[0]) + "," + (center + offset[1]);
        }).filter(function (coord) {
            var parts = coord.split(",").map(Number);
            return parts[0] >= 0 && parts[0] < 5 && parts[1] >= 0 && parts[1] < 5;
        }));
    }
    function patternBadge(key) {
        var badges = currentLanguage() === "ko" ? KOREAN_PATTERN_BADGES : PATTERN_BADGES;
        return badges[key] || "?";
    }
    function patternDisplayName(key) {
        return t(key === "randomMixed" ? "Random mixed" : (PATTERNS[key] ? PATTERNS[key].label : "Cross"));
    }
    function difficultyDisplayName(difficulty) {
        return t(difficulty || "Medium");
    }
    function dailyTierDisplayName(tierKey) {
        var tier = dailyTierByKey(tierKey);
        return t(tier.label);
    }
    function chapterTitle(chapter) {
        return t(CHAPTER_TITLES[chapter - 1] || "Inversion");
    }
    function gameDisplayName(game) {
        if (!game)
            return "";
        if (game.mode === "campaign" && game.campaignIndex >= 0) {
            var chapter = campaignGroupIndexForLevel(game.campaignIndex) + 1;
            var level = campaignLevelNumberInGroup(game.campaignIndex);
            return chapterTitle(chapter) + " " + level;
        }
        if (game.mode === "daily" && game.dailyTier) {
            var dateKey = game.dailyKey ? game.dailyKey.slice(0, 10) : getDailyDateKey();
            return t("Daily") + " " + dailyTierDisplayName(game.dailyTier) + " " + formatDailyDate(dateKey);
        }
        if (game.mode === "freeplay") {
            var difficulty = DIFFICULTIES.find(function (item) {
                return game.name && game.name.indexOf(item) === 0;
            }) || "Medium";
            return difficultyDisplayName(difficulty) + " " + t("Custom Level");
        }
        if (game.mode === "playground")
            return t("Playground");
        return game.name;
    }
    function updateCustomSize() {
        app.progress.freePrefs.customWidth = clamp(Number(els.customWidth.value) || 5, 3, 9);
        app.progress.freePrefs.customHeight = clamp(Number(els.customHeight.value) || 5, 3, 9);
        els.customWidth.value = app.progress.freePrefs.customWidth;
        els.customHeight.value = app.progress.freePrefs.customHeight;
        saveProgress();
    }
    function ensureCampaignLevels() {
        if (app.campaignLevels.length)
            return Promise.resolve(app.campaignLevels);
        if (app.campaignLoadPromise)
            return app.campaignLoadPromise;
        if (!window.fetch) {
            app.campaignLoadState = "error";
            app.campaignLoadError = "Campaign data could not be loaded.";
            return Promise.resolve([]);
        }
        app.campaignLoadState = "loading";
        app.campaignLoadError = "";
        app.campaignLoadPromise = fetch(CAMPAIGN_DATA_URL + "?v=" + CAMPAIGN_VERSION)
            .then(function (response) {
            if (!response.ok)
                throw new Error("Campaign data request failed with " + response.status);
            return response.json();
        })
            .then(function (data) {
            app.campaignLevels = campaignLevelsFromData(data);
            app.campaignLoadState = "ready";
            app.campaignLoadPromise = null;
            if (app.activeScreen === "campaign")
                renderCampaign();
            return app.campaignLevels;
        })
            .catch(function (error) {
            app.campaignLoadState = "error";
            app.campaignLoadError = error && error.message ? error.message : "Campaign data could not be loaded.";
            app.campaignLoadPromise = null;
            return [];
        });
        return app.campaignLoadPromise;
    }
    function campaignLevelsFromData(data) {
        if (!data || data.campaignVersion !== CAMPAIGN_VERSION || !Array.isArray(data.levels)) {
            throw new Error("Campaign data version mismatch.");
        }
        var levels = data.levels.map(campaignLevelFromData);
        if (levels.length !== CAMPAIGN_LEVEL_COUNT)
            throw new Error("Campaign data is incomplete.");
        return levels;
    }
    function campaignLevelFromData(raw) {
        var width = Number(raw.width) || 5;
        var height = Number(raw.height) || 5;
        var states = Number(raw.states) || 2;
        var initial = Array.isArray(raw.initialState) ? raw.initialState.map(function (value) {
            return mod(Number(value) || 0, states);
        }) : [];
        while (initial.length < width * height)
            initial.push(0);
        return {
            width: width,
            height: height,
            states: states,
            defaultPattern: raw.defaultPattern || "cross",
            locked: new Set(numberArray(raw.locked)),
            disabled: new Set(numberArray(raw.disabled)),
            tilePatterns: stringMap(raw.tilePatterns),
            levelId: String(raw.levelId || ""),
            campaignIndex: Number(raw.campaignIndex) || 0,
            chapter: Number(raw.chapter) || campaignGroupIndexForLevel(Number(raw.campaignIndex) || 0) + 1,
            name: String(raw.name || "Level"),
            initialState: initial.slice(0, width * height),
            knownSolution: normalizeSolution(numberMap(raw.knownSolution), states),
            minimumMoves: Math.max(1, Number(raw.minimumMoves) || 1),
            targetMoves: Math.max(1, Number(raw.targetMoves) || 1),
            difficultyRating: raw.difficultyRating || "Easy"
        };
    }
    function campaignLevelsToData(levels) {
        return {
            schemaVersion: 1,
            campaignVersion: CAMPAIGN_VERSION,
            levelCount: levels.length,
            levels: levels.map(campaignLevelToData)
        };
    }
    function campaignLevelToData(level) {
        return {
            levelId: level.levelId,
            name: level.name,
            campaignIndex: level.campaignIndex,
            chapter: level.chapter,
            width: level.width,
            height: level.height,
            states: level.states,
            defaultPattern: level.defaultPattern,
            locked: sortedNumberArray(level.locked),
            disabled: sortedNumberArray(level.disabled),
            tilePatterns: sortedStringMap(level.tilePatterns),
            initialState: level.initialState.slice(),
            knownSolution: sortedNumberMap(level.knownSolution),
            minimumMoves: level.minimumMoves,
            targetMoves: level.targetMoves,
            difficultyRating: level.difficultyRating
        };
    }
    function numberArray(value) {
        return Array.isArray(value) ? value.map(function (item) {
            return Number(item);
        }).filter(function (item) {
            return Number.isFinite(item);
        }) : [];
    }
    function numberMap(value) {
        var out = {};
        Object.keys(value || {}).forEach(function (key) {
            var idx = Number(key);
            var item = Number(value[key]);
            if (Number.isFinite(idx) && Number.isFinite(item) && item)
                out[idx] = item;
        });
        return out;
    }
    function stringMap(value) {
        var out = {};
        Object.keys(value || {}).forEach(function (key) {
            var idx = Number(key);
            var item = String(value[key] || "");
            if (Number.isFinite(idx) && item)
                out[idx] = item;
        });
        return out;
    }
    function sortedNumberArray(value) {
        return Array.from(value || []).map(Number).sort(function (a, b) {
            return a - b;
        });
    }
    function sortedNumberMap(value) {
        var out = {};
        Object.keys(value || {}).map(Number).sort(function (a, b) {
            return a - b;
        }).forEach(function (key) {
            out[key] = Number(value[key]) || 0;
        });
        return out;
    }
    function sortedStringMap(value) {
        var out = {};
        Object.keys(value || {}).map(Number).sort(function (a, b) {
            return a - b;
        }).forEach(function (key) {
            out[key] = String(value[key]);
        });
        return out;
    }
    function createCampaignLevels() {
        var levels = [];
        for (var chapter = 1; chapter <= CAMPAIGN_GROUP_COUNT; chapter += 1) {
            for (var levelInChapter = 1; levelInChapter <= CAMPAIGN_LEVELS_PER_GROUP; levelInChapter += 1) {
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
            if (!tappable.length)
                continue;
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
            if (isSolved(puzzle, board) || knownMoves < config.minimumKnownMoves)
                continue;
            if (!solutionSolves(puzzle, board, solutionCounts))
                continue;
            fallback = makeCampaignLevelFromPuzzle(puzzle, board, solutionCounts, config, chapter, levelInChapter, index);
            if (knownMoves >= config.preferredKnownMoves)
                return fallback;
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
        }
        else if (chapter === 2) {
            sizes = [4];
        }
        else if (chapter === 3) {
            sizes = [3];
            locked = true;
        }
        else if (chapter === 4) {
            sizes = [4];
            locked = true;
            difficulty = "Medium";
        }
        else if (chapter === 5) {
            sizes = [3, 4];
            irregular = true;
            difficulty = "Medium";
        }
        else if (chapter === 6) {
            sizes = [3, 4];
            locked = true;
            irregular = true;
            difficulty = "Medium";
        }
        else if (chapter === 7) {
            sizes = [5];
            locked = true;
            irregular = true;
            difficulty = "Hard";
        }
        else if (chapter === 8) {
            sizes = [3];
            states = 3;
        }
        else if (chapter === 9) {
            sizes = [4];
            states = 3;
            difficulty = "Medium";
        }
        else if (chapter === 10) {
            sizes = [3];
            states = 3;
            locked = true;
            difficulty = "Medium";
        }
        else if (chapter === 11) {
            sizes = [3, 4];
            states = 3;
            irregular = true;
            difficulty = "Medium";
        }
        else if (chapter === 12) {
            sizes = [3, 4];
            states = 3;
            locked = true;
            irregular = true;
            difficulty = "Hard";
        }
        else if (chapter === 13) {
            sizes = [4];
            states = 3;
            difficulty = "Hard";
        }
        else if (chapter === 14) {
            sizes = [4, 5];
            states = 3;
            locked = true;
            difficulty = "Hard";
        }
        else if (chapter === 15) {
            sizes = [5, 6];
            states = 3;
            locked = true;
            irregular = true;
            difficulty = "Hard";
        }
        else if (chapter === 16) {
            sizes = [3];
            states = 4;
            difficulty = "Medium";
        }
        else if (chapter === 17) {
            sizes = [4];
            states = 4;
            locked = true;
            difficulty = "Hard";
        }
        else if (chapter === 18) {
            sizes = [4, 5];
            states = 4;
            locked = true;
            irregular = true;
            difficulty = "Hard";
        }
        else if (chapter === 19) {
            sizes = [5];
            states = 4;
            difficulty = "Hard";
        }
        else if (chapter === 20) {
            sizes = [5, 6];
            states = 4;
            locked = true;
            irregular = true;
            difficulty = "Expert";
        }
        else if (chapter === 21) {
            sizes = [3];
            states = 5;
            difficulty = "Hard";
        }
        else if (chapter === 22) {
            sizes = [4];
            states = 5;
            locked = true;
            difficulty = "Hard";
        }
        else if (chapter === 23) {
            sizes = [4, 5];
            states = 5;
            locked = true;
            irregular = true;
            difficulty = "Expert";
        }
        else if (chapter === 24) {
            sizes = [5, 6];
            states = 5;
            locked = true;
            irregular = true;
            difficulty = "Expert";
        }
        else if (chapter === 25) {
            sizes = [6, 7];
            states = 3;
            locked = true;
            irregular = true;
            difficulty = "Expert";
        }
        else if (chapter === 26) {
            sizes = [6, 7];
            states = 4;
            locked = true;
            irregular = true;
            difficulty = "Expert";
        }
        else if (chapter === 27) {
            sizes = [5, 6, 7];
            states = 5;
            locked = true;
            irregular = true;
            difficulty = "Expert";
        }
        else if (chapter === 28) {
            sizes = [7, 8];
            states = campaignOptionAt([3, 4, 5, 3, 4, 5, 4, 5, 3, 5], levelInChapter);
            locked = true;
            irregular = true;
            difficulty = "Expert";
        }
        else if (chapter === 29) {
            sizes = [8, 9];
            states = campaignOptionAt([4, 5, 3, 4, 5, 3, 5, 4, 5, 5], levelInChapter);
            locked = true;
            irregular = true;
            difficulty = "Expert";
        }
        else {
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
        if (chapter <= 12)
            return "cross";
        if (chapter === 13)
            return campaignOptionAt(["diagonal", "horizontal", "vertical"], levelInChapter);
        if (chapter === 14)
            return levelInChapter % 4 === 0 ? "square" : (levelInChapter % 2 ? "diagonal" : "cross");
        if (chapter === 15)
            return levelInChapter % 3 === 0 ? "randomMixed" : campaignOptionAt(["cross", "diagonal", "square", "horizontal", "vertical"], levelInChapter);
        if (chapter <= 18)
            return "cross";
        if (chapter === 19)
            return campaignOptionAt(["horizontal", "vertical", "square", "diagonal"], levelInChapter);
        if (chapter === 20)
            return levelInChapter % 2 ? "randomMixed" : campaignOptionAt(["cross", "diagonal", "square"], levelInChapter);
        if (chapter <= 23)
            return "cross";
        if (chapter === 24)
            return levelInChapter % 2 ? "randomMixed" : campaignOptionAt(["diagonal", "horizontal", "vertical", "square"], levelInChapter);
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
        if (width >= 5)
            spread += 1;
        if (locked && irregular)
            spread += 1;
        if (states >= 4)
            spread += 1;
        if (pattern === "randomMixed")
            spread += 1;
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
            if (!isTappable(puzzle, tapIndex))
                return;
            applyPulse(puzzle, board, tapIndex);
            solutionCounts[tapIndex] = mod((solutionCounts[tapIndex] || 0) - 1, puzzle.states);
        });
        var solve = solvePuzzle(puzzle, board);
        var knownMoves = sumObjectValues(solutionCounts);
        var minimumMoves = solve && solve.exists && solve.exactMinimum ? solve.moveCount : knownMoves;
        if (!minimumMoves)
            minimumMoves = Math.max(1, Math.ceil(activeIndexes(puzzle).length * 0.25));
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
            if (!disabledSet.has(idx))
                tilePatterns[idx] = special.pattern;
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
        if (app.campaignLoadState === "loading" || app.campaignLoadState === "idle") {
            els.campaignList.innerHTML = '<section class="loading-state"><h3>' + t("Loading campaign") + '</h3><p>' + t("Loading the fixed campaign levels from the bundled JSON.") + '</p></section>';
            return;
        }
        if (app.campaignLoadState === "error") {
            els.campaignList.innerHTML = '<section class="empty-state"><h3>' + t("Campaign data unavailable") + '</h3><p>' + t("The bundled campaign asset could not be loaded. Reload the app or check that campaign-levels.json is included.") + '</p></section>';
            return;
        }
        if (!app.campaignLevels.length) {
            els.campaignList.innerHTML = '<section class="empty-state"><h3>' + t("No campaign levels found") + '</h3><p>' + t("The fixed campaign data is missing. Reload the app or check the bundled asset.") + '</p></section>';
            return;
        }
        var selectedGroup = normalizeSelectedCampaignGroup();
        els.campaignList.innerHTML =
            '<section class="campaign-map-section">' +
                '<div class="campaign-map-grid">' +
                range(CAMPAIGN_GROUP_COUNT).map(function (_, groupIndex) {
                    return renderCampaignGroupTile(groupIndex, selectedGroup);
                }).join("") +
                '</div>' +
                '</section>' +
                renderCampaignGroupDetail(selectedGroup);
    }
    function renderDaily() {
        if (!els.dailyList)
            return;
        if (!DAILY_TIERS.length) {
            els.dailyList.innerHTML = '<section class="empty-state"><h3>' + t("No daily puzzles available") + '</h3><p>' + t("Daily puzzles are generated from the current date. Reload the app to try again.") + '</p></section>';
            return;
        }
        var dateKey = getDailyDateKey();
        els.dailyList.innerHTML =
            '<section class="daily-section">' +
                '<div class="daily-challenge-list">' +
                DAILY_TIERS.map(function (tier) {
                    return renderDailyCard(tier, dateKey);
                }).join("") +
                '</div>' +
                '</section>' +
                '<section class="daily-section">' +
                '<h3>' + t("Leaderboards") + '</h3>' +
                '<div class="daily-leaderboard-list">' + renderDailyLeaderboardRows() + '</div>' +
                '</section>';
    }
    function renderAchievements() {
        if (!els.achievementsList)
            return;
        if (app.campaignLoadState === "loading" || app.campaignLoadState === "idle") {
            els.achievementsList.innerHTML = '<section class="loading-state"><h3>' + t("Loading campaign") + '</h3><p>' + t("Loading the fixed campaign levels from the bundled JSON.") + '</p></section>';
            return;
        }
        if (app.campaignLoadState === "error" || !app.campaignLevels.length) {
            els.achievementsList.innerHTML = '<section class="empty-state"><h3>' + t("Campaign data unavailable") + '</h3><p>' + t("The bundled campaign asset could not be loaded. Reload the app or check that campaign-levels.json is included.") + '</p></section>';
            return;
        }
        var unlocked = range(CAMPAIGN_GROUP_COUNT).reduce(function (total, _, groupIndex) {
            return total + (achievementUnlocked(groupIndex, "clear") ? 1 : 0) + (achievementUnlocked(groupIndex, "master") ? 1 : 0);
        }, 0);
        els.achievementsList.innerHTML =
            '<section class="achievement-summary">' +
                '<h3>' + t("Campaign achievements") + '</h3>' +
                '<strong>' + unlocked + '/50</strong>' +
                '</section>' +
                '<section class="achievement-grid">' +
                range(CAMPAIGN_GROUP_COUNT).map(function (_, groupIndex) {
                    return renderAchievementGroup(groupIndex);
                }).join("") +
                '</section>';
    }
    function renderAchievementGroup(groupIndex) {
        var title = t("Group") + " " + (groupIndex + 1) + ": " + chapterTitle(groupIndex + 1);
        return '<article class="achievement-card">' +
            '<div class="achievement-card-heading">' +
            '<span>' + escapeAttribute(t("Group") + " " + (groupIndex + 1)) + '</span>' +
            '<strong>' + escapeAttribute(chapterTitle(groupIndex + 1)) + '</strong>' +
            '</div>' +
            '<div class="achievement-badge-row">' +
            renderAchievementBadge(groupIndex, "clear", t("Clear"), t("Complete every level in this group."), title) +
            renderAchievementBadge(groupIndex, "master", t("Master"), t("Earn every star in this group."), title) +
            '</div>' +
            '</article>';
    }
    function renderAchievementBadge(groupIndex, kind, label, detail, title) {
        var unlocked = achievementUnlocked(groupIndex, kind);
        var status = unlocked ? t("Unlocked") : t("Locked");
        return '<div class="achievement-badge' + (unlocked ? " is-unlocked" : " is-locked") + '" aria-label="' + escapeAttribute(title + ", " + label + ", " + status) + '">' +
            '<span class="achievement-badge-icon" aria-hidden="true">' + (unlocked ? renderCheckIcon() : "") + '</span>' +
            '<span class="achievement-badge-copy">' +
            '<strong>' + escapeAttribute(label) + '</strong>' +
            '<small>' + escapeAttribute(detail) + '</small>' +
            '</span>' +
            '<span class="achievement-badge-status">' + escapeAttribute(status) + '</span>' +
            '</div>';
    }
    function achievementUnlocked(groupIndex, kind) {
        if (kind === "master")
            return campaignGroupStars(groupIndex) >= CAMPAIGN_GROUP_STAR_MAX;
        return campaignGroupCompletedCount(groupIndex) >= CAMPAIGN_LEVELS_PER_GROUP;
    }
    function renderDailyCard(tier, dateKey) {
        var record = dailyRecordFor(dateKey, tier.key);
        var completed = Boolean(record && record.completed);
        var tierLabel = dailyTierDisplayName(tier.key);
        var bestLine = completed ? t("Best") + ": " + formatMoveThreshold(record.moves, false) : t("Not played today");
        var aria = tierLabel + " " + t("daily challenge") + ", " + bestLine;
        return '<button class="daily-card daily-card-' + tier.key + (completed ? " is-complete" : "") + '" data-action="start-daily" data-daily-tier="' + tier.key + '" aria-label="' + escapeAttribute(aria) + '">' +
            '<span class="daily-tier-grid" aria-hidden="true">' + renderDailyGridIcon(tier.key) + '</span>' +
            '<span class="daily-card-top">' +
            '<strong class="daily-tier-label">' + escapeAttribute(tierLabel) + '</strong>' +
            '</span>' +
            '<span class="daily-card-record' + (completed ? "" : " is-empty") + '"><strong>' + escapeAttribute(bestLine) + '</strong></span>' +
            '</button>';
    }
    function renderDailyLeaderboardRows() {
        var rows = DAILY_TIERS.map(function (tier) {
            return {
                key: tier.key,
                label: dailyTierDisplayName(tier.key),
                grid: renderDailyGridIcon(tier.key)
            };
        });
        rows.push({
            key: "global",
            label: t("Global"),
            grid: renderDailyGridCells(3, ["0", "0", "0", "0", "0", "0", "0", "0", "0"])
        });
        return rows.map(function (row) {
            return '<div class="daily-leaderboard-row daily-leaderboard-' + row.key + '">' +
                '<span class="daily-leaderboard-icon" aria-hidden="true">' +
                renderCrownIcon() +
                '<span class="daily-tier-grid daily-tier-grid-small">' + row.grid + '</span>' +
                '</span>' +
                '<span class="daily-leaderboard-text"><strong>' + escapeAttribute(row.label) + '</strong></span>' +
                '</div>';
        }).join("");
    }
    function renderCrownIcon() {
        return '<svg class="daily-crown-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">' +
            '<path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>' +
            '</svg>';
    }
    function renderDailyGridIcon(tierKey) {
        if (tierKey === "easy") {
            return renderDailyGridCells(3, ["a", "0", "0", "a", "a", "0", "0", "a", "0"]);
        }
        if (tierKey === "medium") {
            return renderDailyGridCells(4, ["a", "0", "a", "0", "0", "a", "0", "a", "a", "0", "a", "0", "0", "a", "0", "a"]);
        }
        return renderDailyGridCells(5, ["a", "b", "0", "a", "b", "0", "a", "b", "0", "a", "a", "0", "b", "a", "0", "b", "a", "0", "b", "a", "0", "a", "b", "0", "a"]);
    }
    function renderDailyGridCells(size, cells) {
        return '<span class="daily-tier-grid-inner daily-grid-size-' + size + '">' + cells.map(function (cell) {
            return '<span class="daily-grid-cell daily-grid-cell-' + cell + '"></span>';
        }).join("") + '</span>';
    }
    function dailyRecordFor(dateKey, tierKey) {
        if (!app.progress.daily)
            return null;
        var current = app.progress.daily[dailyChallengeKey(dateKey, tierKey)];
        if (current)
            return current;
        return tierKey === "medium" ? app.progress.daily[dateKey] : null;
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
            '<span class="level-number">' + campaignLevelNumberInGroup(level.campaignIndex) + '</span>' +
            '<span class="level-stars" aria-hidden="true">' + renderStarIcons(stars) + '</span>' +
            '</button>';
    }
    function renderCampaignGroupTile(groupIndex, selectedGroup) {
        var unlocked = isCampaignGroupUnlocked(groupIndex);
        var stars = campaignGroupStars(groupIndex);
        var completed = campaignGroupCompletedCount(groupIndex);
        var classes = ["campaign-group-tile"];
        if (unlocked)
            classes.push("is-unlocked");
        else
            classes.push("is-locked");
        if (groupIndex === selectedGroup)
            classes.push("is-selected");
        if (stars >= CAMPAIGN_GROUP_STAR_TARGET)
            classes.push("is-open");
        return '<button class="' + classes.join(" ") + '" data-campaign-group="' + groupIndex + '"' + (unlocked ? "" : " disabled") +
            ' aria-label="' + campaignGroupAriaLabel(groupIndex, stars, completed, unlocked) + '">' +
            '<span class="campaign-group-number">' + (groupIndex + 1) + '</span>' +
            '<span class="campaign-group-mini-grid" aria-hidden="true">' + renderCampaignGroupMiniGrid(groupIndex) + '</span>' +
            '<span class="campaign-group-progress" aria-hidden="true"><strong>' + stars + '</strong><span>/' + CAMPAIGN_GROUP_STAR_MAX + '</span></span>' +
            (unlocked ? "" : '<span class="campaign-group-lock" aria-hidden="true"><svg class="lock-mark" viewBox="0 0 24 24"><path class="lock-shackle" d="M7.25 10.25V8.1a4.75 4.75 0 0 1 9.5 0v2.15"></path><rect class="lock-body" x="5.25" y="10.25" width="13.5" height="10" rx="2.6"></rect><path class="lock-key" d="M12 14.2v2.45"></path></svg></span>') +
            '</button>';
    }
    function renderCampaignGroupMiniGrid(groupIndex) {
        return campaignLevelsForGroup(groupIndex).map(function (level) {
            var stars = clamp(Number(app.progress.stars[level.levelId]) || 0, 0, 3);
            var completed = isCampaignLevelCompleted(level.levelId);
            var classes = ["campaign-mini-level", "stars-" + stars];
            if (completed)
                classes.push("is-complete");
            if (isCampaignHintMarked(level.levelId))
                classes.push("is-hinted");
            return '<span class="' + classes.join(" ") + '"></span>';
        }).join("");
    }
    function renderCampaignGroupDetail(groupIndex) {
        var levels = campaignLevelsForGroup(groupIndex);
        var title = t("Group") + " " + (groupIndex + 1) + ": " + chapterTitle(groupIndex + 1);
        return '<section class="campaign-group-detail">' +
            '<div class="campaign-group-detail-heading">' +
            '<h3>' + escapeAttribute(title) + '</h3>' +
            '</div>' +
            '<div class="campaign-level-grid">' + levels.map(renderLevelNode).join("") + '</div>' +
            '</section>';
    }
    function normalizeSelectedCampaignGroup() {
        var groupIndex = clamp(Number(app.selectedCampaignGroup) || 0, 0, CAMPAIGN_GROUP_COUNT - 1);
        if (!isCampaignGroupUnlocked(groupIndex)) {
            var lastGroup = campaignGroupIndexForLevel(app.lastCampaignIndex || 0);
            groupIndex = isCampaignGroupUnlocked(lastGroup) ? lastGroup : firstUnlockedCampaignGroup();
        }
        app.selectedCampaignGroup = groupIndex;
        return groupIndex;
    }
    function firstUnlockedCampaignGroup() {
        for (var group = 0; group < CAMPAIGN_GROUP_COUNT; group += 1) {
            if (isCampaignGroupUnlocked(group))
                return group;
        }
        return 0;
    }
    function campaignLevelsForGroup(groupIndex) {
        var start = groupIndex * CAMPAIGN_LEVELS_PER_GROUP;
        return app.campaignLevels.slice(start, start + CAMPAIGN_LEVELS_PER_GROUP);
    }
    function campaignGroupIndexForLevel(index) {
        return Math.floor(clamp(Number(index) || 0, 0, CAMPAIGN_LEVEL_COUNT - 1) / CAMPAIGN_LEVELS_PER_GROUP);
    }
    function campaignLevelNumberInGroup(index) {
        return (clamp(Number(index) || 0, 0, CAMPAIGN_LEVEL_COUNT - 1) % CAMPAIGN_LEVELS_PER_GROUP) + 1;
    }
    function campaignAdjacentGroups(groupIndex) {
        var x = groupIndex % CAMPAIGN_MAP_SIZE;
        var y = Math.floor(groupIndex / CAMPAIGN_MAP_SIZE);
        var groups = [];
        if (x > 0)
            groups.push(groupIndex - 1);
        if (x < CAMPAIGN_MAP_SIZE - 1)
            groups.push(groupIndex + 1);
        if (y > 0)
            groups.push(groupIndex - CAMPAIGN_MAP_SIZE);
        if (y < CAMPAIGN_MAP_SIZE - 1)
            groups.push(groupIndex + CAMPAIGN_MAP_SIZE);
        return groups;
    }
    function campaignGroupStars(groupIndex) {
        return campaignLevelsForGroup(groupIndex).reduce(function (total, level) {
            return total + clamp(Number(app.progress.stars[level.levelId]) || 0, 0, 3);
        }, 0);
    }
    function campaignGroupCompletedCount(groupIndex) {
        return campaignLevelsForGroup(groupIndex).filter(function (level) {
            return isCampaignLevelCompleted(level.levelId);
        }).length;
    }
    function isCampaignGroupUnlocked(groupIndex) {
        if (groupIndex === 0)
            return true;
        if (campaignGroupStars(groupIndex) > 0)
            return true;
        return campaignAdjacentGroups(groupIndex).some(function (neighbor) {
            return campaignGroupStars(neighbor) >= CAMPAIGN_GROUP_STAR_TARGET;
        });
    }
    function campaignGroupAriaLabel(groupIndex, stars, completed, unlocked) {
        var label = t("Group") + " " + (groupIndex + 1) + ", " + chapterTitle(groupIndex + 1) + ", " + t(stars === 1 ? "{n} star" : "{n} stars", { n: stars }) + ", " + completed + "/" + CAMPAIGN_LEVELS_PER_GROUP + " " + t("complete");
        if (!unlocked)
            label += ", " + t("locked") + ", " + t("Earn 15 stars in a nearby group.");
        return escapeAttribute(label);
    }
    function isCampaignLevelUnlocked(index) {
        return isCampaignGroupUnlocked(campaignGroupIndexForLevel(index));
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
        if (!level)
            return;
        if (!isCampaignLevelUnlocked(level.campaignIndex))
            return;
        app.lastCampaignIndex = level.campaignIndex;
        app.selectedCampaignGroup = campaignGroupIndexForLevel(level.campaignIndex);
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
            unique: true,
            seed: seed,
            name: prefs.difficulty + " Custom Level"
        });
        startGame(levelToGeneratedGame(level, "freeplay"));
    }
    function startPlayground() {
        var prefs = normalizePlaygroundPrefs();
        playSound("start");
        var seed = encodePlaygroundSeed(prefs);
        var game = {
            mode: "playground",
            levelId: "playground-" + hashString(seed),
            name: "Playground",
            width: prefs.width,
            height: prefs.height,
            states: prefs.states,
            defaultPattern: prefs.pattern,
            locked: new Set(prefs.locked),
            disabled: new Set(prefs.disabled),
            tilePatterns: {},
            initialState: prefs.board.slice(),
            board: prefs.board.slice(),
            knownSolution: {},
            remainingSolution: {},
            minimumMoves: 0,
            targetMoves: 0,
            difficultyRating: "Playground",
            moves: 0,
            history: [],
            hintLevel: 0,
            hint: null,
            usedHint: false,
            completed: false,
            hintCompletionPending: false,
            startedAt: Date.now(),
            elapsedSeconds: 0,
            playgroundSeed: seed
        };
        startGame(game);
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
            if (!tappable.length)
                continue;
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
            if (isSolved(puzzle, board))
                continue;
            if (!solutionSolves(puzzle, board, solutionCounts))
                continue;
            var solve = solvePuzzle(puzzle, board);
            var knownMoves = sumObjectValues(solutionCounts);
            var minimumMoves = solve && solve.exists && solve.exactMinimum ? solve.moveCount : knownMoves;
            if (config.difficulty !== "Easy" && minimumMoves < 3)
                continue;
            if (config.unique && solve && solve.exists && !solve.unique && attempt < attempts - 3)
                continue;
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
        if (best)
            return best;
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
        closePatternInfo();
        els.modeLabel.textContent = modeLabel(game.mode);
        els.titleLabel.textContent = gameDisplayName(game);
        els.hintLine.textContent = "";
        showScreen("game");
        renderPatternIndicator(game);
        renderBoard();
        updateCounters();
        startTimer();
    }
    function modeLabel(mode) {
        if (mode === "campaign")
            return t("Campaign");
        if (mode === "daily")
            return t("Daily");
        if (mode === "playground")
            return t("Playground");
        return t("Custom Level");
    }
    function startTimer() {
        if (!app.currentGame)
            return;
        app.currentGame.startedAt = Date.now();
        app.currentGame.elapsedSeconds = 0;
        updateCounters();
        app.timerId = window.setInterval(function () {
            if (!app.currentGame || app.currentGame.completed)
                return;
            app.currentGame.elapsedSeconds = Math.floor((Date.now() - app.currentGame.startedAt) / 1000);
            updateCounters();
        }, 1000);
    }
    function stopTimer() {
        if (app.timerId)
            window.clearInterval(app.timerId);
        app.timerId = null;
    }
    function updateCounters() {
        if (!app.currentGame)
            return;
        els.moveCounter.textContent = String(app.currentGame.moves);
        els.starRanking.innerHTML = renderStatusStarRanking(app.currentGame);
        els.timeCounter.textContent = formatSeconds(app.currentGame.elapsedSeconds || 0);
        if (els.personalBest)
            els.personalBest.textContent = personalBestText(app.currentGame);
        var hintCompletionPending = Boolean(app.currentGame.hintCompletionPending);
        var undoButton = document.querySelector('[data-action="undo"]');
        if (undoButton)
            undoButton.disabled = hintCompletionPending || !app.currentGame.history.length;
        var resetButton = document.querySelector('[data-action="reset"]');
        if (resetButton)
            resetButton.disabled = hintCompletionPending || app.currentGame.completed;
        var hintButton = document.querySelector('[data-action="hint"]');
        if (hintButton)
            hintButton.disabled = app.currentGame.mode === "playground" || hintCompletionPending || app.currentGame.completed || Date.now() < app.hintCooldownUntil;
    }
    function renderPatternIndicator(game) {
        if (!els.patternLabel || !els.patternMini)
            return;
        var defaultKey = game.defaultPattern || "cross";
        var pattern = PATTERNS[defaultKey] || PATTERNS.cross;
        var specialCount = Object.keys(game.tilePatterns || {}).length;
        els.patternLabel.textContent = specialCount ? t("Mixed patterns") : patternDisplayName(defaultKey);
        els.patternMini.classList.toggle("has-mixed-patterns", Boolean(specialCount));
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
            if (active.has(x + "," + y))
                classes.push("is-active");
            if (x === center && y === center)
                classes.push("is-center");
            return '<span class="' + classes.join(" ") + '"></span>';
        }).join("");
        els.patternMini.innerHTML = miniHtml;
    }
    function patternLegendHtml(game) {
        var keys = [game.defaultPattern || "cross"].concat(Object.keys(game.tilePatterns || {}).map(function (idx) {
            return game.tilePatterns[idx];
        }));
        var unique = [];
        keys.forEach(function (key) {
            if (unique.indexOf(key) === -1)
                unique.push(key);
        });
        return unique.map(function (key) {
            var pattern = PATTERNS[key] || PATTERNS.cross;
            return '<span><b>' + patternBadge(key) + '</b>' + patternDisplayName(key) + '</span>';
        }).join("");
    }
    function renderBoard(pulsedIndexes) {
        var game = app.currentGame;
        if (!game || !els.board)
            return;
        els.board.classList.toggle("is-playground-board", game.mode === "playground");
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
        var showPatternBadges = Object.keys(game.tilePatterns || {}).length > 0;
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
                if (game.locked.has(idx))
                    classes.push("locked");
                if (previewSet.has(idx))
                    classes.push("preview");
                if (hintSet.has(idx))
                    classes.push("hint");
                if (hintAffectedSet.has(idx))
                    classes.push("hint-affected");
                if (suggestedIndex === idx)
                    classes.push("hint-suggested");
                if (changedSet.has(idx))
                    classes.push("hint-changed");
                if (pulseSet.has(idx))
                    classes.push("pulsed");
                if (showSolution)
                    classes.push("solution");
                var patternKey = game.tilePatterns[idx] || game.defaultPattern || "cross";
                var patternMark = showPatternBadges ? '<span class="pattern-badge" aria-hidden="true">' + patternBadge(patternKey) + '</span>' : "";
                var solutionValue = showSolution ? (game.hint.solution[idx] || 0) : "";
                var lockMark = game.locked.has(idx) ? '<span class="lock-badge" aria-hidden="true"><svg class="lock-mark" viewBox="0 0 24 24"><path class="lock-shackle" d="M7.25 10.25V8.1a4.75 4.75 0 0 1 9.5 0v2.15"></path><rect class="lock-body" x="5.25" y="10.25" width="13.5" height="10" rx="2.6"></rect><path class="lock-key" d="M12 14.2v2.45"></path></svg></span>' : "";
                var ariaLabel = t("Row {row}, column {column}", { row: y + 1, column: x + 1 }) + ", " + t("state") + " " + state + ", " + patternDisplayName(patternKey) + " " + t("pattern") + (game.locked.has(idx) ? ", " + t("locked") : "");
                html.push('<button class="' + classes.join(" ") + '" data-index="' + idx + '" data-number="' + STATE_NUMBERS[state] + '" data-solution="' + solutionValue + '" aria-label="' + ariaLabel + '"' + (game.locked.has(idx) ? ' aria-disabled="true"' : "") + '>' +
                    patternMark +
                    lockMark +
                    '</button>');
            }
        }
        els.board.innerHTML = html.join("");
    }
    function handlePointerDown(event) {
        var tile = event.target.closest(".tile");
        if (!tile || !app.currentGame || app.currentGame.hintCompletionPending)
            return;
        var index = Number(tile.getAttribute("data-index"));
        if (els.board.setPointerCapture && event.pointerId !== undefined) {
            try {
                els.board.setPointerCapture(event.pointerId);
            }
            catch (error) {
                // Some browsers refuse capture for synthetic pointer events.
            }
        }
        app.pressInfo = { index: index, longPress: false };
        window.clearTimeout(app.pressTimer);
        app.pressTimer = window.setTimeout(function () {
            if (!app.pressInfo || app.pressInfo.index !== index)
                return;
            app.pressInfo.longPress = true;
            previewPulse(index);
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
            }
            catch (error) {
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
        if (event.detail !== 0)
            return;
        if (app.currentGame && app.currentGame.hintCompletionPending)
            return;
        var tile = event.target.closest(".tile");
        if (!tile)
            return;
        tapTile(Number(tile.getAttribute("data-index")));
    }
    function cancelPress(clear) {
        window.clearTimeout(app.pressTimer);
        app.pressTimer = null;
        if (clear !== false)
            clearPreview();
        app.pressInfo = null;
    }
    function previewPulse(index) {
        var game = app.currentGame;
        if (!game || game.hintCompletionPending || !isTappable(game, index)) {
            playSound("invalid");
            return;
        }
        game.hint = { preview: getAffectedIndexes(game, index), highlight: [index] };
        setTranslatedText(els.hintLine, "Previewing this tap.");
        renderBoard();
        playSound("preview");
    }
    function clearPreview() {
        var game = app.currentGame;
        if (!game)
            return;
        if (game.hint && !game.hint.solution && !game.hint.fromHint) {
            game.hint = null;
            els.hintLine.textContent = "";
            renderBoard();
        }
    }
    function tapTile(index) {
        var game = app.currentGame;
        if (!game || game.completed || game.hintCompletionPending)
            return;
        var clearedMark = clearHintMark(false);
        if (!isTappable(game, index)) {
            if (clearedMark)
                renderBoard();
            playSound("invalid");
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
        if (game.mode !== "playground" && isSolved(game, game.board)) {
            window.setTimeout(completeGame, 360);
        }
    }
    function undoMove() {
        var game = app.currentGame;
        if (!game || game.completed || game.hintCompletionPending)
            return;
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
        if (!game || game.completed || game.hintCompletionPending)
            return;
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
        if (!game || game.completed || game.hintCompletionPending)
            return;
        if (game.mode === "playground") {
            playSound("invalid");
            setTranslatedText(els.hintLine, "Hints are off in Playground.");
            return;
        }
        if (Date.now() < app.hintCooldownUntil)
            return;
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
            setTranslatedText(els.hintLine, "No useful tap is available.");
            return;
        }
        applyHintMove(tapIndex);
    }
    function applyHintMove(tapIndex) {
        var game = app.currentGame;
        if (!game || game.completed)
            return;
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
        if (solvedByHint)
            game.hintCompletionPending = true;
        setTranslatedText(els.hintLine, "Hint applied. Red tiles changed. This try is worth 0 stars.");
        renderBoard(affected);
        updateCounters();
        playSound("hint");
        scheduleHintMarkClear(game);
        if (solvedByHint) {
            window.setTimeout(function () {
                if (app.currentGame !== game)
                    return;
                game.hintCompletionPending = false;
                if (isSolved(game, game.board))
                    completeGame();
                else
                    updateCounters();
            }, HINT_COMPLETION_DELAY_MS);
        }
    }
    function beginHintCooldown() {
        app.hintCooldownUntil = Date.now() + HINT_COOLDOWN_MS;
        if (app.hintCooldownTimer)
            window.clearTimeout(app.hintCooldownTimer);
        app.hintCooldownTimer = window.setTimeout(function () {
            app.hintCooldownTimer = null;
            updateCounters();
        }, HINT_COOLDOWN_MS);
        updateCounters();
    }
    function clearHintCooldown() {
        if (app.hintCooldownTimer)
            window.clearTimeout(app.hintCooldownTimer);
        app.hintCooldownTimer = null;
        app.hintCooldownUntil = 0;
    }
    function scheduleHintMarkClear(game) {
        if (app.hintMarkTimer)
            window.clearTimeout(app.hintMarkTimer);
        app.hintMarkTimer = window.setTimeout(function () {
            if (app.currentGame !== game || !game.changedByHint)
                return;
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
        if (!game || !game.changedByHint)
            return false;
        game.changedByHint = null;
        if (shouldRender)
            renderBoard();
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
            if (count)
                normalized[key] = count;
        });
        return normalized;
    }
    function decrementRemainingSolution(game, tapIndex) {
        if (!game.remainingSolution)
            game.remainingSolution = {};
        var next = mod((game.remainingSolution[tapIndex] || 0) - 1, game.states);
        if (next) {
            game.remainingSolution[tapIndex] = next;
        }
        else {
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
        if (active.length)
            return active[0];
        var tappable = tappableIndexes(game);
        return tappable.length ? tappable[0] : null;
    }
    function completeGame() {
        var game = app.currentGame;
        if (!game || game.completed)
            return;
        if (game.mode === "playground")
            return;
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
            if (!usedHint && (oldBest === undefined || game.moves < oldBest))
                app.progress.bestMoves[game.levelId] = game.moves;
            if (stars > oldStars && !usedHint) {
                app.progress.hintUsed[game.levelId] = false;
            }
            else if (oldStars <= 0 && stars <= 0) {
                app.progress.hintUsed[game.levelId] = usedHint;
            }
            best = app.progress.bestMoves[game.levelId];
            if (best === undefined)
                best = usedHint ? "-" : game.moves;
            saveProgress();
            renderCampaign();
        }
        if (game.mode === "freeplay") {
            var freeBest = app.progress.bestMoves[game.levelId];
            if (!usedHint && (freeBest === undefined || game.moves < freeBest)) {
                app.progress.bestMoves[game.levelId] = game.moves;
            }
            best = app.progress.bestMoves[game.levelId];
            if (best === undefined)
                best = usedHint ? "-" : game.moves;
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
        closePatternInfo();
        els.modalTitle.textContent = game.mode === "daily" ? t("Daily Complete") : t("Level Complete");
        els.modalStars.setAttribute("aria-label", t("{n} out of 3 stars", { n: stars }) + " " + t("earned"));
        els.modalStars.innerHTML = '<span class="star-icons modal-star-icons" aria-hidden="true">' + renderStarIcons(stars) + '</span>';
        els.resultMoves.textContent = String(game.moves);
        els.resultMinimum.textContent = String(game.minimumMoves || "-");
        els.resultBest.textContent = String(best);
        els.resultTime.textContent = formatSeconds(game.elapsedSeconds);
        els.resultStarBreakdown.innerHTML = renderStarThresholds(game, false, stars);
        var primaryActionLabel = completionPrimaryActionLabel(game);
        els.nextLevelButton.hidden = game.mode === "daily";
        els.nextLevelButton.disabled = game.mode === "daily";
        els.nextLevelButton.textContent = primaryActionLabel;
        els.nextLevelButton.setAttribute("aria-label", primaryActionLabel);
        els.nextLevelButton.title = primaryActionLabel;
        els.levelSelectButton.textContent = game.mode === "campaign" ? t("Campaign") : (game.mode === "daily" ? t("Daily") : t("Menu"));
        els.modal.hidden = false;
        playSound("win", { stars: stars });
    }
    function completionPrimaryActionLabel(game) {
        if (!game || game.mode === "daily")
            return "";
        if (game.mode === "campaign") {
            var next = app.campaignLevels[game.campaignIndex + 1];
            return next && isCampaignLevelUnlocked(next.campaignIndex) ? t("Next Level") : t("Campaign");
        }
        return game.mode === "freeplay" ? t("New Puzzle") : t("Next Level");
    }
    function calculateStars(game) {
        if (game.usedHint)
            return 0;
        var thresholds = starThresholds(game);
        if (game.moves <= thresholds[0].max)
            return 3;
        if (game.moves <= thresholds[1].max)
            return 2;
        if (game.moves <= thresholds[2].max)
            return 1;
        return 0;
    }
    function isBetterDailyRecord(candidate, previous) {
        if (!previous)
            return true;
        if (candidate.hintUsed && !previous.hintUsed)
            return false;
        if (!candidate.hintUsed && previous.hintUsed)
            return true;
        if ((candidate.stars || 0) !== (previous.stars || 0))
            return (candidate.stars || 0) > (previous.stars || 0);
        if (candidate.moves !== previous.moves)
            return candidate.moves < previous.moves;
        return candidate.time < previous.time;
    }
    function startNextLevel(button) {
        if (button && button.disabled)
            return;
        var game = app.currentGame;
        els.modal.hidden = true;
        if (!game)
            return;
        if (game.mode === "campaign") {
            var next = app.campaignLevels[game.campaignIndex + 1];
            if (next && isCampaignLevelUnlocked(next.campaignIndex)) {
                startCampaignLevel(next.levelId);
            }
            else {
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
        if (!game)
            return;
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
        }
        else if (app.currentGame.mode === "daily") {
            renderDaily();
            showScreen("daily");
        }
        else {
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
        }
        else if (mode === "daily") {
            renderDaily();
            showScreen("daily");
        }
        else {
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
        if (tapIndex === null || tapIndex === undefined || puzzle.disabled.has(tapIndex))
            return [];
        var pos = positionFor(tapIndex, puzzle.width);
        var patternKey = puzzle.tilePatterns[tapIndex] || puzzle.defaultPattern || "cross";
        var pattern = PATTERNS[patternKey] || PATTERNS.cross;
        var affected = [];
        pattern.offsets.forEach(function (offset) {
            var x = pos.x + offset[0];
            var y = pos.y + offset[1];
            if (!isInside(puzzle, x, y))
                return;
            var idx = indexFor(x, y, puzzle.width);
            if (!puzzle.disabled.has(idx))
                affected.push(idx);
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
            if (total > limit)
                return 0;
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
            if (found === -1)
                continue;
            var tmp = matrix[pivotRow];
            matrix[pivotRow] = matrix[found];
            matrix[found] = tmp;
            var inv = modularInverse(matrix[pivotRow][colIndex], k);
            for (var normalizeCol = colIndex; normalizeCol <= tappable.length; normalizeCol += 1) {
                matrix[pivotRow][normalizeCol] = mod(matrix[pivotRow][normalizeCol] * inv, k);
            }
            for (var eliminateRow = 0; eliminateRow < active.length; eliminateRow += 1) {
                if (eliminateRow === pivotRow)
                    continue;
                var factor = matrix[eliminateRow][colIndex];
                if (factor === 0)
                    continue;
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
            if (pivotColumns.indexOf(free) === -1)
                freeColumns.push(free);
        }
        var exactMinimum = freeColumns.length === 0;
        if (freeColumns.length > 0) {
            var combinations = 1;
            for (var comboSize = 0; comboSize < freeColumns.length; comboSize += 1) {
                combinations *= k;
                if (combinations > EXACT_NULLSPACE_LIMIT)
                    break;
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
                        if (!coefficient)
                            continue;
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
            if (count)
                tapCounts[tappable[vectorIndex]] = count;
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
                if (seen.has(encoded))
                    continue;
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
            if (mod(normalized * i, modulus) === 1)
                return i;
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
        if (score < 17)
            return "Easy";
        if (score < 30)
            return "Medium";
        if (score < 45)
            return "Hard";
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
            return '<span class="' + (highlighted ? "is-highlighted" : "") + '" aria-label="' + escapeAttribute(t("{n} out of 3 stars", { n: threshold.stars }) + ": " + formatMoveRange(threshold.min, threshold.max, false)) + '">' + stars + '<em>' + moveLabel + '</em></span>';
        }).join("");
    }
    function renderStatusStarRanking(item) {
        if (item && item.mode === "playground") {
            return '<span class="star-ranking-row playground-ranking-row"><strong>' + t("Sandbox") + '</strong><em>' + t("No goal") + '</em></span>';
        }
        var highlightedStars = storedStarsForGame(item);
        return starThresholds(item).map(function (threshold) {
            var label = t(threshold.stars === 1 ? "{n} star" : "{n} stars", { n: threshold.stars }) + ": " + formatMoveRange(threshold.min, threshold.max, false);
            var highlighted = highlightedStars !== null && threshold.stars === highlightedStars;
            return '<span class="star-ranking-row' + (highlighted ? " is-highlighted" : "") + '" aria-label="' + escapeAttribute(label + (highlighted ? ", " + t("current best") : "")) + '">' +
                '<span class="star-icons" aria-hidden="true">' + renderStarIcons(threshold.stars) + '</span>' +
                '<em>' + formatMoveRange(threshold.min, threshold.max, true) + '</em>' +
                '</span>';
        }).join("");
    }
    function personalBestText(game) {
        if (!game)
            return "-";
        if (game.mode === "playground")
            return t("No goal");
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
        if (!game)
            return null;
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
        var label = t("Group") + " " + (campaignGroupIndexForLevel(level.campaignIndex) + 1) + ", " + t("Level") + " " + campaignLevelNumberInGroup(level.campaignIndex);
        if (!unlocked)
            label += ", " + t("locked");
        if (completed) {
            label += ", " + t("complete") + ", " + t(stars === 1 ? "{n} star" : "{n} stars", { n: stars }) + " " + t("earned");
            if (hintUsed)
                label += ", " + t("hint used");
        }
        else {
            label += ", " + t("not complete");
        }
        return escapeAttribute(label);
    }
    function formatMoveRange(minimum, maximum, compact) {
        if (maximum === null) {
            return compact ? minimum + "+" : t("{n}+ taps", { n: minimum });
        }
        if (minimum === maximum)
            return formatMoveThreshold(minimum, compact);
        return compact ? minimum + "-" + maximum : t("{n} taps", { n: minimum + "-" + maximum });
    }
    function formatMoveThreshold(value, compact) {
        var moves = Math.max(0, Number(value) || 0);
        if (compact)
            return String(moves);
        return t(moves === 1 ? "{n} tap" : "{n} taps", { n: moves });
    }
    function escapeAttribute(value) {
        return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    function renderStars(stars) {
        if (!stars)
            return "0/3";
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
        return date.toLocaleDateString(currentLanguage(), { month: "short", day: "numeric", timeZone: "UTC" });
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
        if (!app.progress.settings.sound || !app.audio)
            return;
        app.audio.play(name, options || {});
    }
    function createAudioManager() {
        var AudioCtor = window.AudioContext || window.webkitAudioContext;
        var context = null;
        var master = null;
        var echo = null;
        var echoGain = null;
        function setup() {
            if (!AudioCtor || !app.progress.settings.sound)
                return null;
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
            if (!ctx)
                return;
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
            if (opts.echo)
                out.connect(echo);
            oscillator.start(start);
            oscillator.stop(start + duration + 0.03);
        }
        function play(name, options) {
            var ctx = setup();
            if (!ctx)
                return;
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
    window.ResonanceGridDebug = {
        patterns: PATTERNS,
        solvePuzzle: solvePuzzle,
        generatePuzzle: generatePuzzle,
        generateCampaignLevels: createCampaignLevels,
        campaignLevelsToData: campaignLevelsToData,
        getCampaignLevels: function () {
            return app.campaignLevels.slice();
        }
    };
})();
//# sourceMappingURL=app.js.map