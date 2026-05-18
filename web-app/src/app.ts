// @ts-nocheck
/*
 * TypeScript source for the static web app.
 * Run `npm run build` from `web-app/` to regenerate `app.js`.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "resonance-grid-progress-v1";
  var APP_VERSION = "1.0.8";
  var CAMPAIGN_DATA_URL = "campaign-levels.json";
  var MATHJAX_URL = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
  var CHANGELOG_ENTRIES = [
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
    { key: "fr", label: "Français" }
  ];
  var TEXT_TRANSLATIONS = {
    es: {
      "A modular tile puzzle": "Un rompecabezas modular",
      "Main menu": "Menú principal",
      "Campaign": "Campaña",
      "Custom Level": "Nivel personalizado",
      "Daily Challenge": "Reto diario",
      "Daily Challenges": "Retos diarios",
      "Today's Puzzles": "Rompecabezas de hoy",
      "Leaderboards": "Clasificaciones",
      "Leaderboard": "Clasificación",
      "Global": "Global",
      "All daily tiers": "Todos los niveles diarios",
      "How to Play": "Cómo jugar",
      "The Math": "Las matemáticas",
      "Settings": "Ajustes",
      "Back": "Volver",
      "Campaign chapters": "Capítulos de la campaña",
      "Custom Puzzle": "Rompecabezas personalizado",
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
      "Guide text size": "Tamaño del texto de la guía",
      "Small guide text": "Texto pequeño de la guía",
      "Medium guide text": "Texto mediano de la guía",
      "Large guide text": "Texto grande de la guía",
      "Play overview": "Resumen del juego",
      "Clear every active tile by turning it white. Tapping a tile applies its tap pattern to the board, and every tile reached by that tap advances by one state.": "Deja en blanco todas las casillas activas. Un toque en una casilla aplica su patrón de toque al tablero, y cada casilla alcanzada avanza un estado.",
      "Use previews and level clues to plan calmly: colored tiles still need to advance, tiles with lock icons can be changed by nearby taps, and empty holes are outside the board.": "Mira la vista previa y las pistas del nivel para jugar con calma: las casillas de color todavía tienen que avanzar, las casillas con candado pueden cambiar con toques cercanos y los huecos vacíos quedan fuera del tablero.",
      "Rules": "Reglas",
      "1. Make every tile white": "1. Deja todas las casillas en blanco",
      "A white tile is solved.": "Una casilla blanca ya está resuelta.",
      "Colored tiles are not wrong. They just need to keep advancing until they return to white.": "Las casillas de color no están mal. Solo tienen que seguir avanzando hasta volver al blanco.",
      "The puzzle ends only when every active tile is white at the same time.": "El nivel se completa cuando todas las casillas activas están blancas al mismo tiempo.",
      "2. Tap and cycle": "2. Toca y haz avanzar",
      "Tap an available tile to apply the level's tap pattern.": "Toca una casilla disponible para aplicar el patrón de toque del nivel.",
      "Every tile reached by the pattern advances one state.": "Cada casilla alcanzada por el patrón avanza un estado.",
      "States cycle: after the last colored state, the next advance returns that tile to white.": "Los estados van en ciclo: después del último color, el siguiente avance devuelve la casilla al blanco.",
      "3. Use the pattern preview": "3. Usa la vista previa del patrón",
      "A level can use a cross, diagonal, square, horizontal, vertical, knight, or mixed pattern.": "Un nivel puede usar patrón de cruz, diagonal, cuadrado, horizontal, vertical, caballo o mixto.",
      "Hold or hover a tile to see exactly which tiles will change before you tap.": "Mantén presionada una casilla, o pasa el cursor por encima, para ver exactamente cuáles cambiarán antes de tocar.",
      "4. Handle special tiles": "4. Ten en cuenta las casillas especiales",
      "A tile with a lock icon still needs to become white and can change when a nearby tap reaches it.": "Una casilla con candado también debe quedar blanca y puede cambiar cuando la alcanza un toque cercano.",
      "You cannot tap a tile with a lock icon directly.": "No puedes tocar directamente una casilla con candado.",
      "An empty hole is outside the board. Tap patterns skip empty holes.": "Un hueco vacío está fuera del tablero. Los patrones de toque saltan los huecos vacíos.",
      "Modes": "Modos",
      "Choose your puzzle": "Elige partida",
      "Campaign:": "Campaña:",
      "Solve fixed levels in order. Each solve opens the next level.": "Resuelve niveles fijos en orden. Cada victoria abre el siguiente nivel.",
      "Custom Level:": "Nivel personalizado:",
      "Choose board size, states, pattern, difficulty, tiles with lock icons, and empty holes. The generator always prefers a unique solution.": "Elige tamaño, estados, patrón, dificultad, casillas con candado y huecos vacíos. El generador siempre intenta crear una solución única.",
      "Daily Challenge:": "Reto diario:",
      "Play the same three generated puzzles as everyone else for the date. Each puzzle keeps its own saved best score.": "Juega los mismos tres niveles generados que el resto para la fecha de hoy. Cada uno guarda su mejor resultado.",
      "Tools and options": "Herramientas y opciones",
      "Taps, stars, and hints": "Toques, estrellas y pistas",
      "The tap counter counts every tap you commit.": "El contador suma cada toque que haces.",
      "Three stars mean you matched the generator's minimum found tap count.": "Consigues tres estrellas si igualas el mínimo de toques encontrado por el generador.",
      "Two-star and one-star targets allow extra taps.": "Los objetivos de dos y una estrella admiten algunos toques extra.",
      "Undo rewinds one tap, and Reset restores the starting board.": "Deshacer vuelve un toque atrás, y Reiniciar recupera el tablero inicial.",
      "Hint applies the next tap from a solver plan. A hinted try can still complete the puzzle, but it no longer earns stars.": "La pista aplica el siguiente toque de un plan de resolución. Puedes completar el nivel con pistas, pero ese intento ya no gana estrellas.",
      "Tiles changed by a hint are outlined in red.": "Las casillas cambiadas por una pista aparecen con borde rojo.",
      "When you tap a tile, this pattern is centered on that tile. Every tile inside the pattern changes state.": "Al tocar una casilla, este patrón se centra en esa casilla. Cada casilla dentro del patrón cambia de estado.",
      "The green outline matches the preview you see when you hold a tile.": "El borde verde coincide con la vista previa que ves al mantener presionada una casilla.",
      "Sound toggles audio effects.": "Sonido activa o desactiva los efectos.",
      "Show numbers on tiles displays state values when you want a more exact view.": "Mostrar números en las casillas enseña los valores cuando quieres ver el estado exacto.",
      "Android also includes haptic feedback controls.": "En Android también hay controles de vibración.",
      "Math overview": "Resumen matemático",
      "Invert the Matrix is a modular linear-algebra puzzle.": "Invert the Matrix es un rompecabezas de álgebra lineal modular.",
      "To play, think of each active tile as having a state, shown by its color. A tap on a tile does not change only that tile, but every tile in a pattern centered on the chosen tile. After the last state, or color, a tile returns to white. The goal is to find a sequence of taps that makes all active tiles white at the same time. Some boards have only two possible states: white and blue, and only one pattern: a cross centered on the tile you tap. But later on, everything gets much more complicated.": "Para jugar, piensa que cada casilla activa tiene un estado, mostrado por su color. Un toque a una casilla no cambia solo la casilla que tocas, sino que cambia todas las casillas que se encuentran en un patrón centrado en la casilla elegida. Después del último estado (color), una casilla vuelve al blanco. El objetivo es encontrar una secuencia de toques para que todas las casillas terminen siendo blancas al mismo tiempo. Algunos tableros tienen solo dos estados posibles: blanco y azul, y solo un patrón: una cruz centrada en la casilla que tocas. ¡Pero más adelante todo se complica mucho más!",
      "Modeling the game": "Modelo del juego",
      "Turn the board into one equation": "Convertir el tablero en una ecuación",
      "To model a level, first list the active board positions in a fixed order. Once that list is fixed, a displayed board becomes a vector \\(s\\in R^m\\). Here \\(R=\\mathbb Z/n\\mathbb Z\\) means values are read modulo \\(n\\), \\(n\\) is the number of tile states, and \\(m\\) is the number of active positions.": "Para modelar un nivel, primero enumeramos las casillas en un orden fijo. Cuando esa lista queda fijada, el tablero mostrado pasa a ser un vector \\(s\\in R^m\\). Aquí \\(R=\\mathbb Z/n\\mathbb Z\\) significa que los valores se leen módulo \\(n\\), \\(n\\) es el número de estados de una casilla y \\(m\\) es el número de casillas.",
      "Each allowed tap has an effect vector in \\(R^m\\). For a tappable position \\(q_j\\), the vector \\(v_j\\) has value \\(1\\) exactly at the active positions advanced by that tap, and \\(0\\) elsewhere. The matrix \\(A\\) is built by placing these effect vectors as its columns. A tap-count vector \\(x\\in R^r\\) records how many times each allowed tap is used, modulo \\(n\\), and solving means choosing \\(x\\) with \\(s+Ax=0\\).": "Cada toque permitido tiene un vector de efecto en \\(R^m\\). Para una casilla que se puede tocar, \\(q_j\\), el vector \\(v_j\\) tiene valor \\(1\\) exactamente en las casillas que ese toque hace avanzar, y \\(0\\) en las demás. La matriz \\(A\\) se construye colocando esos vectores de efecto como columnas. Un vector de toques \\(x\\in R^r\\) cuenta cuántas veces se usa cada toque permitido, módulo \\(n\\). Resolver el nivel consiste en elegir \\(x\\) con \\(s+Ax=0\\).",
      "All arithmetic is performed modulo \\(n\\), so the value after \\(n-1\\) is \\(0\\). Prime state counts such as \\(2,3,\\) and \\(5\\) give finite fields, where every value different from \\(0\\) has a multiplicative inverse. The four-state mode uses the ring \\(\\mathbb Z/4\\mathbb Z\\), where some values different from \\(0\\) cannot be used for division.": "Toda la aritmética se hace módulo \\(n\\), así que después de \\(n-1\\) viene \\(0\\). Los números de estados primos como \\(2,3,\\) y \\(5\\) dan cuerpos finitos, donde todo valor distinto de \\(0\\) tiene inverso multiplicativo. El modo de cuatro estados usa el anillo \\(\\mathbb Z/4\\mathbb Z\\), donde algunos valores distintos de \\(0\\) no se pueden usar para dividir.",
      "Lights Out generalization": "Generalización de Lights Out",
      "From Lights Out": "Desde Lights Out",
      "The same question, in modular form": "La misma pregunta, en versión modular",
      "In ordinary Lights Out, every tile is either \\(0\\) or \\(1\\). Tapping a tile changes the same shape of tiles around it every time, usually the tapped tile plus the tiles directly above, below, left, and right. Changing a tile is adding \\(1\\) modulo \\(2\\), so tapping the same tile twice gives no net change. This is the simplest version of adding tap effects together.": "En el Lights Out clásico, cada casilla vale \\(0\\) o \\(1\\). Tocar una casilla cambia siempre el mismo grupo de casillas alrededor, normalmente la casilla tocada y las casillas de arriba, abajo, izquierda y derecha. Cambiar una casilla equivale a sumar \\(1\\) módulo \\(2\\), por eso tocar la misma casilla dos veces no cambia nada en total. Esta es la versión más simple de sumar los efectos de los toques.",
      "This game keeps that add-the-effects rule while allowing \\(n\\) states, so values are read in \\(R=\\mathbb Z/n\\mathbb Z\\). Empty holes are not included in the board vector. Tiles with lock icons stay in the board vector because they must become white, but they do not get tap choices. Tap patterns determine the columns of \\(A\\).": "Este juego conserva esa regla de sumar efectos, pero permite \\(n\\) estados, así que los valores se leen en \\(R=\\mathbb Z/n\\mathbb Z\\). Un hueco no es una casilla. Las casillas con candado permanecen en el vector del tablero porque deben quedar blancas, pero no tienen opción propia de toque. Los patrones de toque determinan las columnas de \\(A\\).",
      "The mathematical question is precise: can the allowed taps add up to the target change \\(-s\\)?": "La pregunta matemática es precisa: ¿pueden los toques permitidos sumar el cambio objetivo \\(-s\\)?",
      "1. The board is a vector": "1. El tablero es un vector",
      "Let \\(P=\\{p_1,\\ldots,p_m\\}\\) be the list of active board positions, in a fixed order. A configuration is the vector \\(s=(s_1,\\ldots,s_m)\\in R^m\\), where \\(s_i\\) is the state value shown on tile \\(p_i\\), read modulo \\(n\\). The solved board is the zero vector \\(0\\in R^m\\).": "Sea \\(P=\\{p_1,\\ldots,p_m\\}\\) la lista de casillas, en un orden fijo. Una configuración es el vector \\(s=(s_1,\\ldots,s_m)\\in R^m\\), donde \\(s_i\\) es el valor de estado que muestra la casilla \\(p_i\\), leído módulo \\(n\\). El tablero resuelto es el vector cero \\(0\\in R^m\\).",
      "2. Every allowed tap has an effect vector": "2. Cada toque permitido tiene un vector de efecto",
      "Let \\(q_1,\\ldots,q_r\\) be the positions that can be tapped. The effect vector of the tap at \\(q_j\\) is \\(v_j\\in R^m\\). Its \\(i\\)-th value is \\(1\\) when that tap advances tile \\(p_i\\), and \\(0\\) otherwise. The tap matrix is \\(A=[v_1\\ \\cdots\\ v_r]\\), so the \\(j\\)-th column of \\(A\\) is \\(v_j\\).": "Sean \\(q_1,\\ldots,q_r\\) las casillas que se pueden tocar. El vector de efecto del toque en \\(q_j\\) es \\(v_j\\in R^m\\). Su valor \\(i\\)-ésimo es \\(1\\) si ese toque hace avanzar la casilla \\(p_i\\), y \\(0\\) en caso contrario. La matriz de toques es \\(A=[v_1\\ \\cdots\\ v_r]\\), así que la columna \\(j\\)-ésima de \\(A\\) es \\(v_j\\).",
      "In the matrix, a row tracks a board position and a column tracks an allowed tap. A tile with a lock icon still gets a row because its value must become zero, and nearby taps may change it. It does not get a column because it cannot be tapped directly.": "En la matriz, una fila sigue una casilla y una columna sigue un toque permitido. Una casilla con candado sigue teniendo una fila porque su valor debe llegar a cero, y los toques cercanos pueden cambiarla. No tiene columna porque no se puede tocar directamente.",
      "Solving equation": "Ecuación de resolución",
      "Goal": "Objetivo",
      "Find a tap-count vector": "Encontrar el vector de toques",
      "A tap-count vector is an element \\(x=(x_1,\\ldots,x_r)\\in R^r\\). Its coordinate \\(x_j\\) counts how many times the tap at \\(q_j\\) is used, modulo \\(n\\). Executing \\(x\\) adds \\(\\sum_j x_jv_j=Ax\\) to the board. Thus tap order is irrelevant to the algebra. Only each tap count modulo \\(n\\) matters.": "Un vector de toques es un elemento \\(x=(x_1,\\ldots,x_r)\\in R^r\\). Su coordenada \\(x_j\\) cuenta cuántas veces se usa el toque en \\(q_j\\), módulo \\(n\\). Al ejecutar \\(x\\), se suma \\(\\sum_j x_jv_j=Ax\\) al tablero. Por eso el orden de los toques no importa para el álgebra. Solo importa cada número de toques módulo \\(n\\).",
      "After applying the plan, the board is \\(s+Ax\\). Solving the puzzle means making this vector equal to the zero vector, equivalently solving \\(Ax\\equiv -s\\pmod n\\).": "Después de aplicar el plan, el tablero es \\(s+Ax\\). Resolver el nivel significa hacer que ese vector sea el vector cero, lo que equivale a resolver \\(Ax\\equiv -s\\pmod n\\).",
      "When does a solution exist?": "¿Cuándo existe una solución?",
      "The columns of \\(A\\) generate the set of all board changes obtainable by allowed taps. Call this set the image of \\(A\\), written \\(\\operatorname{Im}(A)=\\{Ax:x\\in R^r\\}\\). A solution exists exactly when the target vector \\(-s\\) is in that set.": "Las columnas de \\(A\\) generan todos los cambios de tablero que se pueden conseguir con los toques permitidos. Llamamos a este conjunto la imagen de \\(A\\), escrita \\(\\operatorname{Im}(A)=\\{Ax:x\\in R^r\\}\\). Existe una solución exactamente cuando el vector objetivo \\(-s\\) está en ese conjunto.",
      "Over a field, such as \\(\\mathbb F_2,\\mathbb F_3,\\mathbb F_5\\), this can be checked by simplifying the rows of the system \\([A\\mid -s]\\). A row of the form \\([0\\ \\cdots\\ 0\\mid c]\\), where \\(c\\) is not \\(0\\), proves that no solution exists. If no such row appears, the simplified system gives at least one tap plan.": "Sobre un cuerpo, como \\(\\mathbb F_2,\\mathbb F_3,\\mathbb F_5\\), esto se comprueba simplificando las filas del sistema \\([A\\mid -s]\\). Una fila de la forma \\([0\\ \\cdots\\ 0\\mid c]\\), donde \\(c\\) no es \\(0\\), demuestra que no existe solución. Si no aparece una fila así, el sistema simplificado da al menos un plan de toques.",
      "What changes for non-prime \\(n\\)?": "¿Qué cambia para \\(n\\) no primo?",
      "For composite \\(n\\), \\(\\mathbb Z/n\\mathbb Z\\) is a ring but not a field. You may add and multiply as usual, but division is valid only by values with a multiplicative inverse. For \\(n=4\\), the value \\(2\\) is different from \\(0\\) and has no inverse: no value \\(a\\) satisfies \\(2a\\equiv 1\\pmod 4\\).": "Para \\(n\\) compuesto, \\(\\mathbb Z/n\\mathbb Z\\) es un anillo pero no un cuerpo. Se puede sumar y multiplicar como siempre, pero la división solo es válida por valores con inverso multiplicativo. Para \\(n=4\\), el valor \\(2\\) es distinto de \\(0\\) y no tiene inverso: ningún valor \\(a\\) satisface \\(2a\\equiv 1\\pmod 4\\).",
      "The rule does not change: there is still a solution exactly when \\(-s\\) is in \\(\\operatorname{Im}(A)\\), but the check must respect ring arithmetic. Row operations that divide by values with no inverse are not valid. For larger composite \\(n\\), the check can be split into smaller modulo checks that must all agree.": "La regla no cambia: hay solución exactamente cuando \\(-s\\) está en \\(\\operatorname{Im}(A)\\), pero la comprobación debe respetar la aritmética del anillo. Las operaciones de fila que dividen por valores sin inverso no son válidas. Para \\(n\\) compuesto más grande, la comprobación puede dividirse en comprobaciones módulo más pequeñas que deben ser compatibles entre sí.",
      "When is the solution unique?": "¿Cuándo es única la solución?",
      "If \\(x_0\\) is one solution, then every other solution is \\(x_0+z\\), where \\(z\\in R^r\\) is a tap-count vector with \\(Az=0\\). The equation \\(Az=0\\) means that using the taps in \\(z\\) causes no net change on the board. The set of all such \\(z\\) is the kernel of the tap matrix, written \\(\\ker(A)\\).": "Si \\(x_0\\) es una solución, cualquier otra solución tiene la forma \\(x_0+z\\), donde \\(z\\in R^r\\) es un vector de toques con \\(Az=0\\). La ecuación \\(Az=0\\) significa que usar los toques de \\(z\\) no produce ningún cambio neto en el tablero. El conjunto de todos esos \\(z\\) es el núcleo de la matriz de toques y se escribe \\(\\ker(A)\\).",
      "Tap counts already live modulo \\(n\\), so tapping one tile \\(n\\) additional times adds \\(n e_j=0\\), the zero vector in \\(R^r\\). That represents the same tap-count vector, not a new tap-count solution.": "Los números de toques ya se toman módulo \\(n\\), así que tocar una casilla \\(n\\) veces más suma \\(n e_j=0\\), el vector cero en \\(R^r\\). Eso representa el mismo vector de toques, no una solución nueva como vector de toques.",
      "Uniqueness fails exactly when there is a tap-count vector \\(z\\ne 0\\), meaning \\(z\\) is not the zero vector, with \\(Az=0\\). In that case \\(x_0\\) and \\(x_0+z\\) are distinct tap-count vectors that solve the same board. Thus the solution as a tap-count vector is unique precisely when \\(\\ker(A)=\\{0\\}\\). Over fields this is equivalent to saying that no combination using at least one allowed tap adds the effect vectors to zero. Over rings, the same kernel condition is the correct statement over \\(\\mathbb Z/n\\mathbb Z\\).": "La unicidad falla exactamente cuando existe un vector de toques \\(z\\ne 0\\), es decir, cuando \\(z\\) no es el vector cero, con \\(Az=0\\). En ese caso, \\(x_0\\) y \\(x_0+z\\) son vectores de toques distintos que resuelven el mismo tablero. Por tanto, la solución como vector de toques es única exactamente cuando \\(\\ker(A)=\\{0\\}\\). Sobre cuerpos esto equivale a decir que ninguna combinación que use al menos un toque permitido suma los vectores de efecto hasta cero. Sobre anillos, la misma condición del núcleo es la formulación correcta sobre \\(\\mathbb Z/n\\mathbb Z\\).",
      "When is \\(A\\) invertible?": "¿Cuándo es invertible \\(A\\)?",
      "A true inverse matrix can exist only when \\(A\\) is square, meaning it has the same number of rows and columns. This happens on a \\(w\\times h\\) board with no tiles with lock icons and no empty holes, when there is exactly one allowed tap for each active tile. In that case \\(A\\) sends vectors in \\(R^{wh}\\) to vectors in \\(R^{wh}\\), and invertibility means every starting board has one unique tap-count solution.": "Una matriz inversa de verdad solo puede existir cuando \\(A\\) es cuadrada, es decir, cuando tiene el mismo número de filas y columnas. Esto ocurre en un tablero de \\(w\\times h\\) sin casillas con candado ni huecos vacíos, cuando hay exactamente un toque permitido por cada casilla activa. En ese caso \\(A\\) transforma vectores de \\(R^{wh}\\) en vectores de \\(R^{wh}\\), y que sea invertible significa que todo tablero inicial tiene una única solución como vector de toques.",
      "Equivalently, \\(\\det A\\) must have a multiplicative inverse modulo \\(n\\). For prime state counts \\(n=2,3,5\\), this means \\(\\det A\\not\\equiv0\\pmod n\\). Equivalently, simplifying rows can choose a value different from \\(0\\) in every column. For \\(n=4\\), it means \\(\\det A\\) is odd. If this fails in the square case, some board vectors are unreachable and some tap-count vectors different from zero lie in \\(\\ker(A)\\). With tiles with lock icons or empty holes, \\(A\\) may have different numbers of rows and columns. Then the useful tests are whether the target change is reachable and whether \\(\\ker(A)\\) contains tap-count vectors different from zero.": "De forma equivalente, \\(\\det A\\) debe tener inverso multiplicativo módulo \\(n\\). Para números de estados primos \\(n=2,3,5\\), esto significa \\(\\det A\\not\\equiv0\\pmod n\\). De forma equivalente, simplificar filas puede elegir un valor distinto de \\(0\\) en cada columna. Para \\(n=4\\), significa que \\(\\det A\\) es impar. Si esto falla en el caso cuadrado, algunos vectores de tablero no se pueden alcanzar y hay vectores de toques distintos de cero en \\(\\ker(A)\\). Con casillas con candado o huecos vacíos, \\(A\\) puede tener distinto número de filas y columnas. Entonces las pruebas útiles son si el cambio objetivo se puede alcanzar y si \\(\\ker(A)\\) contiene vectores de toques distintos de cero.",
      "Why the minimum matters": "Por qué importa el mínimo",
      "If there are several tap-count solutions, the game can still ask for the most efficient one. For each tap count \\(x_j\\in R\\), choose the number \\(\\tilde{x}_j\\in\\{0,\\ldots,n-1\\}\\) that represents it. The physical length of a plan is \\(\\ell(x)=\\sum_j\\tilde{x}_j\\), and the star target is based on a solution with minimal length among the solutions found.": "Si hay varias soluciones como vectores de toques, el juego aún puede pedir la más eficiente. Para cada número de toques \\(x_j\\in R\\), elige el número \\(\\tilde{x}_j\\in\\{0,\\ldots,n-1\\}\\) que lo representa. La longitud física de un plan es \\(\\ell(x)=\\sum_j\\tilde{x}_j\\), y el objetivo de estrellas se basa en una solución de longitud mínima entre las soluciones encontradas.",
      "How the shortest solver works": "Cómo funciona el solucionador más corto",
      "For small boards the app searches by tap count: first boards one tap away, then two taps away, and so on. The first time it reaches the zero board, that number is the true minimum number of physical taps.": "En tableros pequeños, el juego busca por número de toques: primero los tableros a un toque, luego los tableros a dos toques, y así sucesivamente. La primera vez que llega al tablero cero, ese número es el mínimo real de toques físicos.",
      "For larger boards with prime state counts \\(n=2,3,5\\), it simplifies the rows of \\(Ax=-s\\). If the simplified system leaves choices that are not forced, the solutions are \\(x_0+\\ker(A)\\). When the search over those extra tap-count vectors is small enough, the app enumerates them and chooses the one minimizing \\(\\ell(x)\\). If that exact search is too large, or \\(n\\) is composite and the board is too large for that search, the game falls back to a known solving plan instead of claiming a proof of minimality.": "En tableros más grandes con \\(n=2,3,5\\), el juego simplifica las filas de \\(Ax=-s\\). Si el sistema simplificado deja elecciones que no están forzadas, las soluciones son \\(x_0+\\ker(A)\\). Cuando la búsqueda entre esos vectores de toques extra es lo bastante pequeña, el juego los enumera y elige el que minimiza \\(\\ell(x)\\). Si esa búsqueda exacta es demasiado grande, o si \\(n\\) es compuesto y el tablero es demasiado grande para esa búsqueda, el juego usa un plan de resolución conocido en lugar de afirmar que tiene una prueba del mínimo.",
      "The shortest tap-count vector is not necessarily unique. Distinct solutions can tie for the same \\(\\ell(x)\\), and a single vector can be played in many tap orders. The app keeps the same shortest plan every time when it can prove the minimum. It does not currently mark whether all shortest plans are unique.": "El vector de toques más corto no tiene por qué ser único. Varias soluciones pueden empatar con la misma \\(\\ell(x)\\), y un solo vector puede jugarse en muchos órdenes. El juego guarda el mismo plan más corto cada vez cuando puede probar el mínimo. Actualmente no indica si todos los planes más cortos son únicos.",
      "Tiles with lock icons and empty holes": "Casillas con candado y huecos vacíos",
      "A tile with a lock icon stays in the board vector because its value must become zero, and nearby taps may still change it. It does not get its own tap choice in \\(x\\) because it cannot be tapped directly. An empty hole is left out of the ordered list \\(P\\), so the equation only tracks active board positions. This is how the same equation adapts to irregular boards.": "Una casilla con candado permanece en el vector del tablero porque su valor debe llegar a cero, y los toques cercanos todavía pueden cambiarla. No tiene su propia opción de toque en \\(x\\) porque no se puede tocar directamente. Un hueco no es una casilla, así que se queda fuera de la lista ordenada \\(P\\). La ecuación solo sigue las casillas. Así se adapta la misma ecuación a tableros irregulares.",
      "How the generator uses this": "Cómo usa esto el generador",
      "The generator uses the same ingredients: board shape, tiles with lock icons, empty holes, tap pattern, and effect vectors. It chooses or verifies a starting vector \\(s\\) together with a tap-count vector \\(x\\) satisfying \\(s+Ax=0\\). When the exact solver is available, it searches the solution set for a short tap-count vector so the star thresholds have a mathematical basis. Hints use a stored plan one tap at a time.": "El generador usa los mismos ingredientes: forma del tablero, casillas con candado, huecos vacíos, patrón de toque y vectores de efecto. Elige o comprueba un vector inicial \\(s\\) junto con un vector de toques \\(x\\) que satisface \\(s+Ax=0\\). Cuando el solucionador exacto está disponible, busca en el conjunto de soluciones un vector de toques corto para que los umbrales de estrellas tengan una base matemática. Las pistas siguen un plan guardado, toque a toque.",
      "What the symbols mean": "Qué significan los símbolos",
      "The number of tile states and the modulus used by the level. The app uses \\(2,3,4,\\) or \\(5\\) states.": "El número de estados de las casillas y el módulo usado por el nivel. El juego usa \\(2,3,4,\\) o \\(5\\) estados.",
      "The current board configuration as a vector in \\(R^m\\).": "La configuración actual del tablero como vector en \\(R^m\\).",
      "The tap matrix. Its \\(j\\)-th column is the effect vector \\(v_j\\) of the allowed tap at \\(q_j\\).": "La matriz de toques. Su columna \\(j\\)-ésima es el vector de efecto \\(v_j\\) del toque permitido en \\(q_j\\).",
      "The tap-count vector in \\(R^r\\). Its coordinate \\(x_j\\) counts how many times the tap at \\(q_j\\) is used modulo \\(n\\).": "El vector de toques en \\(R^r\\). Su coordenada \\(x_j\\) cuenta cuántas veces se usa el toque en \\(q_j\\), módulo \\(n\\).",
      "All board-change vectors obtainable by allowed taps.": "Todos los vectores de cambio del tablero que se pueden conseguir con toques permitidos.",
      "Tap-count vectors that produce zero board change.": "Vectores de toques que no producen ningún cambio en el tablero.",
      "Language": "Idioma",
      "Sound": "Sonido",
      "Show numbers on tiles": "Mostrar números en las casillas",
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
      "A modular tile puzzle": "Un casse-tête de tuiles modulaires",
      "Main menu": "Menu principal",
      "Campaign": "Campagne",
      "Custom Level": "Niveau personnalisé",
      "Daily Challenge": "Défi quotidien",
      "Daily Challenges": "Défis quotidiens",
      "Today's Puzzles": "Casse-têtes du jour",
      "Leaderboards": "Classements",
      "Leaderboard": "Classement",
      "Global": "Global",
      "All daily tiers": "Tous les niveaux quotidiens",
      "How to Play": "Comment jouer",
      "The Math": "Les maths",
      "Settings": "Paramètres",
      "Back": "Retour",
      "Campaign chapters": "Chapitres de campagne",
      "Custom Puzzle": "Casse-tête personnalisé",
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
      "Guide text size": "Taille du texte du guide",
      "Small guide text": "Petit texte du guide",
      "Medium guide text": "Texte moyen du guide",
      "Large guide text": "Grand texte du guide",
      "Play overview": "Aperçu du jeu",
      "Clear every active tile by turning it white. Tapping a tile applies its tap pattern to the board, and every tile reached by that tap advances by one state.": "Vide chaque tuile active en la rendant blanche. Un toucher sur une tuile applique son motif de toucher au plateau, et chaque tuile atteinte avance d'un état.",
      "Use previews and level clues to plan calmly: colored tiles still need to advance, tiles with lock icons can be changed by nearby taps, and empty holes are outside the board.": "Utilise les aperçus et les indices du niveau pour planifier calmement : les tuiles colorées doivent encore avancer, les tuiles avec cadenas peuvent changer avec des touchers voisins et les trous vides sont hors du plateau.",
      "Rules": "Règles",
      "1. Make every tile white": "1. Rends toutes les tuiles blanches",
      "A white tile is solved.": "Une tuile blanche est résolue.",
      "Colored tiles are not wrong. They just need to keep advancing until they return to white.": "Les tuiles colorées ne sont pas fausses. Elles doivent simplement continuer à avancer jusqu'à revenir au blanc.",
      "The puzzle ends only when every active tile is white at the same time.": "Le casse-tête se termine seulement quand toutes les tuiles actives sont blanches en même temps.",
      "2. Tap and cycle": "2. Touche et fais cycler",
      "Tap an available tile to apply the level's tap pattern.": "Touche une tuile disponible pour appliquer le motif de toucher du niveau.",
      "Every tile reached by the pattern advances one state.": "Chaque tuile atteinte par le motif avance d'un état.",
      "States cycle: after the last colored state, the next advance returns that tile to white.": "Les états forment un cycle: après le dernier état coloré, l'avancée suivante ramène cette tuile au blanc.",
      "3. Use the pattern preview": "3. Utilise l'aperçu du motif",
      "A level can use a cross, diagonal, square, horizontal, vertical, knight, or mixed pattern.": "Un niveau peut utiliser un motif croix, diagonale, carré, horizontal, vertical, cavalier ou mixte.",
      "Hold or hover a tile to see exactly which tiles will change before you tap.": "Maintiens ou survole une tuile pour voir exactement lesquelles changeront avant de toucher.",
      "4. Handle special tiles": "4. Gère les tuiles spéciales",
      "A tile with a lock icon still needs to become white and can change when a nearby tap reaches it.": "Une tuile avec cadenas doit aussi devenir blanche et peut changer quand un toucher voisin l'atteint.",
      "You cannot tap a tile with a lock icon directly.": "Tu ne peux pas toucher directement une tuile avec cadenas.",
      "An empty hole is outside the board. Tap patterns skip empty holes.": "Un trou vide est hors du plateau. Les motifs de toucher ignorent les trous vides.",
      "Modes": "Modes",
      "Choose your puzzle": "Choisis ton casse-tête",
      "Campaign:": "Campagne :",
      "Solve fixed levels in order. Each solve opens the next level.": "Résous les niveaux fixes dans l'ordre. Chaque résolution ouvre le niveau suivant.",
      "Custom Level:": "Niveau personnalisé :",
      "Choose board size, states, pattern, difficulty, tiles with lock icons, and empty holes. The generator always prefers a unique solution.": "Choisis la taille du plateau, les états, le motif, la difficulté, les tuiles avec cadenas et les trous vides. Le générateur préfère toujours une solution unique.",
      "Daily Challenge:": "Défi quotidien :",
      "Play the same three generated puzzles as everyone else for the date. Each puzzle keeps its own saved best score.": "Joue les mêmes trois casse-têtes générés que tout le monde pour la date. Chaque casse-tête garde son meilleur score.",
      "Tools and options": "Outils et options",
      "Taps, stars, and hints": "Touchers, étoiles et indices",
      "The tap counter counts every tap you commit.": "Le compteur de touchers compte chaque toucher que tu valides.",
      "Three stars mean you matched the generator's minimum found tap count.": "Trois étoiles signifient que tu as égalé le minimum de touchers trouvé par le générateur.",
      "Two-star and one-star targets allow extra taps.": "Les objectifs à deux et une étoile autorisent quelques touchers en plus.",
      "Undo rewinds one tap, and Reset restores the starting board.": "Annuler revient d'un toucher, et Réinitialiser restaure le plateau de départ.",
      "Hint applies the next tap from a solver plan. A hinted try can still complete the puzzle, but it no longer earns stars.": "Indice applique le toucher suivant d'un plan de résolution. Un essai avec indice peut quand même terminer le casse-tête, mais il ne gagne plus d'étoiles.",
      "Tiles changed by a hint are outlined in red.": "Les tuiles changées par un indice sont entourées en rouge.",
      "When you tap a tile, this pattern is centered on that tile. Every tile inside the pattern changes state.": "Quand tu touches une tuile, ce motif se centre sur cette tuile. Chaque tuile dans le motif change d'état.",
      "The green outline matches the preview you see when you hold a tile.": "Le contour vert correspond à l'aperçu visible quand tu gardes une tuile appuyée.",
      "Sound toggles audio effects.": "Son active ou désactive les effets audio.",
      "Show numbers on tiles displays state values when you want a more exact view.": "Afficher les nombres sur les tuiles montre les valeurs d'état quand tu veux une vue plus exacte.",
      "Android also includes haptic feedback controls.": "Android inclut aussi des contrôles de retour haptique.",
      "Math overview": "Aperçu mathématique",
      "Invert the Matrix is a modular linear-algebra puzzle.": "Invert the Matrix est un casse-tête d'algèbre linéaire modulaire.",
      "To play, think of each active tile as having a state, shown by its color. A tap on a tile does not change only that tile, but every tile in a pattern centered on the chosen tile. After the last state, or color, a tile returns to white. The goal is to find a sequence of taps that makes all active tiles white at the same time. Some boards have only two possible states: white and blue, and only one pattern: a cross centered on the tile you tap. But later on, everything gets much more complicated.": "Pour jouer, imagine que chaque tuile active possède un état, indiqué par sa couleur. Un toucher sur une tuile ne change pas seulement cette tuile, mais toutes les tuiles qui se trouvent dans un motif centré sur la tuile choisie. Après le dernier état, ou couleur, une tuile revient au blanc. Le but est de trouver une suite de touchers pour que toutes les tuiles actives soient blanches en même temps. Certains plateaux n'ont que deux états possibles : blanc et bleu, et un seul motif : une croix centrée sur la tuile que tu touches. Mais plus tard, tout se complique beaucoup plus.",
      "Modeling the game": "Modéliser le jeu",
      "Turn the board into one equation": "Transformer le plateau en une équation",
      "To model a level, first list the active board positions in a fixed order. Once that list is fixed, a displayed board becomes a vector \\(s\\in R^m\\). Here \\(R=\\mathbb Z/n\\mathbb Z\\) means values are read modulo \\(n\\), \\(n\\) is the number of tile states, and \\(m\\) is the number of active positions.": "Pour modéliser un niveau, liste d'abord les positions actives du plateau dans un ordre fixe. Une fois cette liste fixée, un plateau affiché devient un vecteur \\(s\\in R^m\\). Ici, \\(R=\\mathbb Z/n\\mathbb Z\\) signifie que les valeurs sont lues modulo \\(n\\), \\(n\\) est le nombre d'états d'une tuile et \\(m\\) le nombre de positions actives.",
      "Each allowed tap has an effect vector in \\(R^m\\). For a tappable position \\(q_j\\), the vector \\(v_j\\) has value \\(1\\) exactly at the active positions advanced by that tap, and \\(0\\) elsewhere. The matrix \\(A\\) is built by placing these effect vectors as its columns. A tap-count vector \\(x\\in R^r\\) records how many times each allowed tap is used, modulo \\(n\\), and solving means choosing \\(x\\) with \\(s+Ax=0\\).": "Chaque toucher autorisé a un vecteur d'effet dans \\(R^m\\). Pour une position que l'on peut toucher, \\(q_j\\), le vecteur \\(v_j\\) vaut \\(1\\) exactement aux positions actives avancées par ce toucher, et \\(0\\) ailleurs. La matrice \\(A\\) se construit en plaçant ces vecteurs d'effet comme colonnes. Un vecteur de touchers \\(x\\in R^r\\) indique combien de fois chaque toucher autorisé est utilisé, modulo \\(n\\). Résoudre le casse-tête revient à choisir \\(x\\) avec \\(s+Ax=0\\).",
      "All arithmetic is performed modulo \\(n\\), so the value after \\(n-1\\) is \\(0\\). Prime state counts such as \\(2,3,\\) and \\(5\\) give finite fields, where every value different from \\(0\\) has a multiplicative inverse. The four-state mode uses the ring \\(\\mathbb Z/4\\mathbb Z\\), where some values different from \\(0\\) cannot be used for division.": "Toute l'arithmétique se fait modulo \\(n\\), donc la valeur après \\(n-1\\) est \\(0\\). Les nombres d'états premiers comme \\(2,3,\\) et \\(5\\) donnent des corps finis, où toute valeur différente de \\(0\\) a un inverse multiplicatif. Le mode à quatre états utilise l'anneau \\(\\mathbb Z/4\\mathbb Z\\), où certaines valeurs différentes de \\(0\\) ne permettent pas de diviser.",
      "Lights Out generalization": "Généralisation de Lights Out",
      "From Lights Out": "Depuis Lights Out",
      "The same question, in modular form": "La même question, en version modulaire",
      "In ordinary Lights Out, every tile is either \\(0\\) or \\(1\\). Tapping a tile changes the same shape of tiles around it every time, usually the tapped tile plus the tiles directly above, below, left, and right. Changing a tile is adding \\(1\\) modulo \\(2\\), so tapping the same tile twice gives no net change. This is the simplest version of adding tap effects together.": "Dans Lights Out classique, chaque tuile vaut \\(0\\) ou \\(1\\). Toucher une tuile change toujours le même groupe de tuiles autour d'elle, en général la tuile touchée plus les tuiles directement au-dessus, en dessous, à gauche et à droite. Changer une tuile revient à ajouter \\(1\\) modulo \\(2\\), donc toucher deux fois la même tuile ne produit aucun changement net. C'est la version la plus simple de l'addition des effets de toucher.",
      "This game keeps that add-the-effects rule while allowing \\(n\\) states, so values are read in \\(R=\\mathbb Z/n\\mathbb Z\\). Empty holes are not included in the board vector. Tiles with lock icons stay in the board vector because they must become white, but they do not get tap choices. Tap patterns determine the columns of \\(A\\).": "Ce jeu conserve cette règle d'addition des effets, mais permet \\(n\\) états, donc les valeurs sont lues dans \\(R=\\mathbb Z/n\\mathbb Z\\). Les trous vides ne sont pas inclus dans le vecteur du plateau. Les tuiles avec cadenas restent dans le vecteur du plateau parce qu'elles doivent devenir blanches, mais elles n'ont pas leur propre choix de toucher. Les motifs de toucher déterminent les colonnes de \\(A\\).",
      "The mathematical question is precise: can the allowed taps add up to the target change \\(-s\\)?": "La question mathématique est précise : les touchers autorisés peuvent-ils produire le changement cible \\(-s\\) ?",
      "1. The board is a vector": "1. Le plateau est un vecteur",
      "Let \\(P=\\{p_1,\\ldots,p_m\\}\\) be the list of active board positions, in a fixed order. A configuration is the vector \\(s=(s_1,\\ldots,s_m)\\in R^m\\), where \\(s_i\\) is the state value shown on tile \\(p_i\\), read modulo \\(n\\). The solved board is the zero vector \\(0\\in R^m\\).": "Soit \\(P=\\{p_1,\\ldots,p_m\\}\\) la liste des positions actives du plateau, dans un ordre fixé. Une configuration est le vecteur \\(s=(s_1,\\ldots,s_m)\\in R^m\\), où \\(s_i\\) est la valeur d'état affichée sur la tuile \\(p_i\\), lue modulo \\(n\\). Le plateau résolu est le vecteur zéro \\(0\\in R^m\\).",
      "2. Every allowed tap has an effect vector": "2. Chaque toucher autorisé a un vecteur d'effet",
      "Let \\(q_1,\\ldots,q_r\\) be the positions that can be tapped. The effect vector of the tap at \\(q_j\\) is \\(v_j\\in R^m\\). Its \\(i\\)-th value is \\(1\\) when that tap advances tile \\(p_i\\), and \\(0\\) otherwise. The tap matrix is \\(A=[v_1\\ \\cdots\\ v_r]\\), so the \\(j\\)-th column of \\(A\\) is \\(v_j\\).": "Soient \\(q_1,\\ldots,q_r\\) les positions que l'on peut toucher. Le vecteur d'effet du toucher en \\(q_j\\) est \\(v_j\\in R^m\\). Sa valeur \\(i\\)-ième est \\(1\\) quand ce toucher avance la tuile \\(p_i\\), et \\(0\\) sinon. La matrice des touchers est \\(A=[v_1\\ \\cdots\\ v_r]\\), donc la colonne \\(j\\)-ième de \\(A\\) est \\(v_j\\).",
      "In the matrix, a row tracks a board position and a column tracks an allowed tap. A tile with a lock icon still gets a row because its value must become zero, and nearby taps may change it. It does not get a column because it cannot be tapped directly.": "Dans la matrice, une ligne suit une position du plateau et une colonne suit un toucher autorisé. Une tuile avec cadenas garde une ligne parce que sa valeur doit devenir zéro, et des touchers voisins peuvent la changer. Elle n'a pas de colonne parce qu'on ne peut pas la toucher directement.",
      "Solving equation": "Équation de résolution",
      "Goal": "Objectif",
      "Find a tap-count vector": "Trouver le vecteur de touchers",
      "A tap-count vector is an element \\(x=(x_1,\\ldots,x_r)\\in R^r\\). Its coordinate \\(x_j\\) counts how many times the tap at \\(q_j\\) is used, modulo \\(n\\). Executing \\(x\\) adds \\(\\sum_j x_jv_j=Ax\\) to the board. Thus tap order is irrelevant to the algebra. Only each tap count modulo \\(n\\) matters.": "Un vecteur de touchers est un élément \\(x=(x_1,\\ldots,x_r)\\in R^r\\). Sa coordonnée \\(x_j\\) compte combien de fois le toucher en \\(q_j\\) est utilisé, modulo \\(n\\). Exécuter \\(x\\) ajoute \\(\\sum_j x_jv_j=Ax\\) au plateau. L'ordre des touchers est donc sans importance pour l'algèbre. Seul chaque nombre de touchers modulo \\(n\\) compte.",
      "After applying the plan, the board is \\(s+Ax\\). Solving the puzzle means making this vector equal to the zero vector, equivalently solving \\(Ax\\equiv -s\\pmod n\\).": "Après application du plan, le plateau est \\(s+Ax\\). Résoudre le casse-tête signifie rendre ce vecteur égal au vecteur zéro, c'est-à-dire résoudre \\(Ax\\equiv -s\\pmod n\\).",
      "When does a solution exist?": "Quand une solution existe-t-elle ?",
      "The columns of \\(A\\) generate the set of all board changes obtainable by allowed taps. Call this set the image of \\(A\\), written \\(\\operatorname{Im}(A)=\\{Ax:x\\in R^r\\}\\). A solution exists exactly when the target vector \\(-s\\) is in that set.": "Les colonnes de \\(A\\) engendrent l'ensemble de tous les changements du plateau obtenables par touchers autorisés. On appelle cet ensemble l'image de \\(A\\), écrite \\(\\operatorname{Im}(A)=\\{Ax:x\\in R^r\\}\\). Une solution existe exactement quand le vecteur cible \\(-s\\) est dans cet ensemble.",
      "Over a field, such as \\(\\mathbb F_2,\\mathbb F_3,\\mathbb F_5\\), this can be checked by simplifying the rows of the system \\([A\\mid -s]\\). A row of the form \\([0\\ \\cdots\\ 0\\mid c]\\), where \\(c\\) is not \\(0\\), proves that no solution exists. If no such row appears, the simplified system gives at least one tap plan.": "Sur un corps, comme \\(\\mathbb F_2,\\mathbb F_3,\\mathbb F_5\\), on peut le vérifier en simplifiant les lignes du système \\([A\\mid -s]\\). Une ligne de la forme \\([0\\ \\cdots\\ 0\\mid c]\\), où \\(c\\) n'est pas \\(0\\), prouve qu'il n'existe pas de solution. Si aucune ligne de ce type n'apparaît, le système simplifié donne au moins un plan de touchers.",
      "What changes for non-prime \\(n\\)?": "Qu'est-ce qui change pour \\(n\\) non premier ?",
      "For composite \\(n\\), \\(\\mathbb Z/n\\mathbb Z\\) is a ring but not a field. You may add and multiply as usual, but division is valid only by values with a multiplicative inverse. For \\(n=4\\), the value \\(2\\) is different from \\(0\\) and has no inverse: no value \\(a\\) satisfies \\(2a\\equiv 1\\pmod 4\\).": "Pour \\(n\\) composé, \\(\\mathbb Z/n\\mathbb Z\\) est un anneau mais pas un corps. On peut additionner et multiplier normalement, mais la division n'est valide que par des valeurs avec un inverse multiplicatif. Pour \\(n=4\\), la valeur \\(2\\) est différente de \\(0\\) et n'a pas d'inverse : aucune valeur \\(a\\) ne satisfait \\(2a\\equiv 1\\pmod 4\\).",
      "The rule does not change: there is still a solution exactly when \\(-s\\) is in \\(\\operatorname{Im}(A)\\), but the check must respect ring arithmetic. Row operations that divide by values with no inverse are not valid. For larger composite \\(n\\), the check can be split into smaller modulo checks that must all agree.": "La règle ne change pas : il existe toujours une solution exactement quand \\(-s\\) est dans \\(\\operatorname{Im}(A)\\), mais la vérification doit respecter l'arithmétique de l'anneau. Les opérations de ligne qui divisent par des valeurs sans inverse ne sont pas valides. Pour \\(n\\) composé plus grand, la vérification peut être divisée en contrôles modulo plus petits qui doivent être compatibles entre eux.",
      "When is the solution unique?": "Quand la solution est-elle unique ?",
      "If \\(x_0\\) is one solution, then every other solution is \\(x_0+z\\), where \\(z\\in R^r\\) is a tap-count vector with \\(Az=0\\). The equation \\(Az=0\\) means that using the taps in \\(z\\) causes no net change on the board. The set of all such \\(z\\) is the kernel of the tap matrix, written \\(\\ker(A)\\).": "Si \\(x_0\\) est une solution, toute autre solution est \\(x_0+z\\), où \\(z\\in R^r\\) est un vecteur de touchers avec \\(Az=0\\). L'équation \\(Az=0\\) signifie qu'utiliser les touchers de \\(z\\) ne produit aucun changement net sur le plateau. L'ensemble de tous ces \\(z\\) est le noyau de la matrice des touchers et s'écrit \\(\\ker(A)\\).",
      "Tap counts already live modulo \\(n\\), so tapping one tile \\(n\\) additional times adds \\(n e_j=0\\), the zero vector in \\(R^r\\). That represents the same tap-count vector, not a new tap-count solution.": "Les nombres de touchers vivent déjà modulo \\(n\\), donc toucher une tuile \\(n\\) fois de plus ajoute \\(n e_j=0\\), le vecteur zéro dans \\(R^r\\). Cela représente le même vecteur de touchers, pas une nouvelle solution comme vecteur de touchers.",
      "Uniqueness fails exactly when there is a tap-count vector \\(z\\ne 0\\), meaning \\(z\\) is not the zero vector, with \\(Az=0\\). In that case \\(x_0\\) and \\(x_0+z\\) are distinct tap-count vectors that solve the same board. Thus the solution as a tap-count vector is unique precisely when \\(\\ker(A)=\\{0\\}\\). Over fields this is equivalent to saying that no combination using at least one allowed tap adds the effect vectors to zero. Over rings, the same kernel condition is the correct statement over \\(\\mathbb Z/n\\mathbb Z\\).": "L'unicité échoue exactement lorsqu'il existe un vecteur de touchers \\(z\\ne 0\\), c'est-à-dire lorsque \\(z\\) n'est pas le vecteur zéro, avec \\(Az=0\\). Dans ce cas, \\(x_0\\) et \\(x_0+z\\) sont des vecteurs de touchers distincts qui résolvent le même plateau. La solution comme vecteur de touchers est donc unique précisément quand \\(\\ker(A)=\\{0\\}\\). Sur les corps, cela équivaut à dire qu'aucune combinaison utilisant au moins un toucher autorisé n'ajoute les vecteurs d'effet jusqu'à zéro. Sur les anneaux, la même condition de noyau est l'énoncé correct sur \\(\\mathbb Z/n\\mathbb Z\\).",
      "When is \\(A\\) invertible?": "Quand \\(A\\) est-elle inversible ?",
      "A true inverse matrix can exist only when \\(A\\) is square, meaning it has the same number of rows and columns. This happens on a \\(w\\times h\\) board with no tiles with lock icons and no empty holes, when there is exactly one allowed tap for each active tile. In that case \\(A\\) sends vectors in \\(R^{wh}\\) to vectors in \\(R^{wh}\\), and invertibility means every starting board has one unique tap-count solution.": "Une vraie matrice inverse ne peut exister que si \\(A\\) est carrée, c'est-à-dire si elle a le même nombre de lignes et de colonnes. Cela arrive sur un plateau \\(w\\times h\\) sans tuiles avec cadenas et sans trous vides, quand il existe exactement un toucher autorisé pour chaque tuile active. Dans ce cas, \\(A\\) transforme des vecteurs de \\(R^{wh}\\) en vecteurs de \\(R^{wh}\\), et son inversibilité signifie que tout plateau de départ a une solution unique comme vecteur de touchers.",
      "Equivalently, \\(\\det A\\) must have a multiplicative inverse modulo \\(n\\). For prime state counts \\(n=2,3,5\\), this means \\(\\det A\\not\\equiv0\\pmod n\\). Equivalently, simplifying rows can choose a value different from \\(0\\) in every column. For \\(n=4\\), it means \\(\\det A\\) is odd. If this fails in the square case, some board vectors are unreachable and some tap-count vectors different from zero lie in \\(\\ker(A)\\). With tiles with lock icons or empty holes, \\(A\\) may have different numbers of rows and columns. Then the useful tests are whether the target change is reachable and whether \\(\\ker(A)\\) contains tap-count vectors different from zero.": "De façon équivalente, \\(\\det A\\) doit avoir un inverse multiplicatif modulo \\(n\\). Pour les nombres d'états premiers \\(n=2,3,5\\), cela signifie \\(\\det A\\not\\equiv0\\pmod n\\). De façon équivalente, simplifier les lignes peut choisir une valeur différente de \\(0\\) dans chaque colonne. Pour \\(n=4\\), cela signifie que \\(\\det A\\) est impair. Si cela échoue dans le cas carré, certains vecteurs de plateau sont inatteignables et des vecteurs de touchers différents de zéro appartiennent à \\(\\ker(A)\\). Avec des tuiles avec cadenas ou des trous vides, \\(A\\) peut avoir des nombres de lignes et de colonnes différents. Les tests utiles sont alors de savoir si le changement cible est atteignable et si \\(\\ker(A)\\) contient des vecteurs de touchers différents de zéro.",
      "Why the minimum matters": "Pourquoi le minimum compte",
      "If there are several tap-count solutions, the game can still ask for the most efficient one. For each tap count \\(x_j\\in R\\), choose the number \\(\\tilde{x}_j\\in\\{0,\\ldots,n-1\\}\\) that represents it. The physical length of a plan is \\(\\ell(x)=\\sum_j\\tilde{x}_j\\), and the star target is based on a solution with minimal length among the solutions found.": "S'il existe plusieurs solutions comme vecteurs de touchers, le jeu peut quand même demander la plus efficace. Pour chaque nombre de touchers \\(x_j\\in R\\), choisis le nombre \\(\\tilde{x}_j\\in\\{0,\\ldots,n-1\\}\\) qui le représente. La longueur physique d'un plan est \\(\\ell(x)=\\sum_j\\tilde{x}_j\\), et l'objectif d'étoiles se base sur une solution de longueur minimale parmi celles trouvées.",
      "How the shortest solver works": "Comment fonctionne le solveur le plus court",
      "For small boards the app searches by tap count: first boards one tap away, then two taps away, and so on. The first time it reaches the zero board, that number is the true minimum number of physical taps.": "Pour les petits plateaux, le jeu cherche par nombre de touchers : d'abord les plateaux à un toucher, puis les plateaux à deux touchers, et ainsi de suite. La première fois qu'il atteint le plateau zéro, ce nombre est le vrai minimum de touchers physiques.",
      "For larger boards with prime state counts \\(n=2,3,5\\), it simplifies the rows of \\(Ax=-s\\). If the simplified system leaves choices that are not forced, the solutions are \\(x_0+\\ker(A)\\). When the search over those extra tap-count vectors is small enough, the app enumerates them and chooses the one minimizing \\(\\ell(x)\\). If that exact search is too large, or \\(n\\) is composite and the board is too large for that search, the game falls back to a known solving plan instead of claiming a proof of minimality.": "Pour les plateaux plus grands avec des nombres d'états premiers \\(n=2,3,5\\), le jeu simplifie les lignes de \\(Ax=-s\\). Si le système simplifié laisse des choix qui ne sont pas forcés, les solutions sont \\(x_0+\\ker(A)\\). Quand la recherche parmi ces vecteurs de touchers supplémentaires est assez petite, le jeu les énumère et choisit celui qui minimise \\(\\ell(x)\\). Si cette recherche exacte est trop grande, ou si \\(n\\) est composé et le plateau trop grand pour cette recherche, le jeu utilise un plan de résolution connu au lieu d'affirmer une preuve de minimalité.",
      "The shortest tap-count vector is not necessarily unique. Distinct solutions can tie for the same \\(\\ell(x)\\), and a single vector can be played in many tap orders. The app keeps the same shortest plan every time when it can prove the minimum. It does not currently mark whether all shortest plans are unique.": "Le vecteur de touchers le plus court n'est pas forcément unique. Des solutions distinctes peuvent être à égalité pour la même \\(\\ell(x)\\), et un seul vecteur peut être joué dans de nombreux ordres. Le jeu garde le même plan le plus court chaque fois qu'il peut prouver le minimum. Il n'indique pas actuellement si tous les plans les plus courts sont uniques.",
      "Tiles with lock icons and empty holes": "Tuiles avec cadenas et trous vides",
      "A tile with a lock icon stays in the board vector because its value must become zero, and nearby taps may still change it. It does not get its own tap choice in \\(x\\) because it cannot be tapped directly. An empty hole is left out of the ordered list \\(P\\), so the equation only tracks active board positions. This is how the same equation adapts to irregular boards.": "Une tuile avec cadenas reste dans le vecteur du plateau parce que sa valeur doit devenir zéro, et des touchers voisins peuvent encore la changer. Elle n'a pas son propre choix de toucher dans \\(x\\) parce qu'on ne peut pas la toucher directement. Un trou vide est laissé hors de la liste ordonnée \\(P\\), donc l'équation ne suit que les positions actives du plateau. C'est ainsi que la même équation s'adapte aux plateaux irréguliers.",
      "How the generator uses this": "Comment le générateur utilise cela",
      "The generator uses the same ingredients: board shape, tiles with lock icons, empty holes, tap pattern, and effect vectors. It chooses or verifies a starting vector \\(s\\) together with a tap-count vector \\(x\\) satisfying \\(s+Ax=0\\). When the exact solver is available, it searches the solution set for a short tap-count vector so the star thresholds have a mathematical basis. Hints use a stored plan one tap at a time.": "Le générateur utilise les mêmes ingrédients : forme du plateau, tuiles avec cadenas, trous vides, motif de toucher et vecteurs d'effet. Il choisit ou vérifie un vecteur de départ \\(s\\) avec un vecteur de touchers \\(x\\) satisfaisant \\(s+Ax=0\\). Quand le solveur exact est disponible, il cherche dans l'ensemble des solutions un vecteur de touchers court pour donner une base mathématique aux seuils d'étoiles. Les indices suivent un plan stocké, toucher par toucher.",
      "What the symbols mean": "Signification des symboles",
      "The number of tile states and the modulus used by the level. The app uses \\(2,3,4,\\) or \\(5\\) states.": "Le nombre d'états des tuiles et le module utilisé par le niveau. Le jeu utilise \\(2,3,4,\\) ou \\(5\\) états.",
      "The current board configuration as a vector in \\(R^m\\).": "La configuration actuelle du plateau comme vecteur dans \\(R^m\\).",
      "The tap matrix. Its \\(j\\)-th column is the effect vector \\(v_j\\) of the allowed tap at \\(q_j\\).": "La matrice des touchers. Sa colonne \\(j\\)-ième est le vecteur d'effet \\(v_j\\) du toucher autorisé en \\(q_j\\).",
      "The tap-count vector in \\(R^r\\). Its coordinate \\(x_j\\) counts how many times the tap at \\(q_j\\) is used modulo \\(n\\).": "Le vecteur de touchers dans \\(R^r\\). Sa coordonnée \\(x_j\\) compte combien de fois le toucher en \\(q_j\\) est utilisé, modulo \\(n\\).",
      "All board-change vectors obtainable by allowed taps.": "Tous les vecteurs de changement du plateau obtenables par touchers autorisés.",
      "Tap-count vectors that produce zero board change.": "Les vecteurs de touchers qui produisent un changement nul du plateau.",
      "Language": "Langue",
      "Sound": "Son",
      "Show numbers on tiles": "Afficher les nombres sur les tuiles",
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
    en: {
      howto: [
        { color: "green", terms: ["tile", "tiles"] },
        { color: "blue", terms: ["Tapping", "Tap", "tap", "taps"] },
        { color: "purple", terms: ["state", "states", "States"] },
        { color: "orange", terms: ["pattern", "patterns"] },
        { color: "purple", terms: ["lock icon", "lock icons"] },
        { color: "orange", terms: ["empty hole", "empty holes"] },
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
        { color: "orange", terms: ["hueco vacío", "huecos vacíos"] },
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
        { color: "blue", terms: ["toucher", "touchers"] },
        { color: "purple", terms: ["état", "états"] },
        { color: "orange", terms: ["motif", "motifs"] },
        { color: "purple", terms: ["cadenas", "tuiles avec cadenas"] },
        { color: "orange", terms: ["trou vide", "trous vides"] },
        { color: "green", terms: ["indice", "indices"] }
      ],
      math: [
        { color: "purple", terms: ["modulaire"] },
        { color: "green", terms: ["tuile", "tuiles"] },
        { color: "orange", terms: ["état", "états"] },
        { color: "blue", terms: ["Toucher", "toucher", "touchers"] },
        { color: "green", terms: ["vecteur d'effet", "vecteurs d'effet"] },
        { color: "green", terms: ["vecteur de touchers", "vecteurs de touchers"] },
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
  var CHAPTER_TITLES = [
    "Binary Beginnings", "Fourfold Flips", "Lights With Lock Icons", "Lockstep Squares", "First Empty Holes",
    "Binary Breakaways", "Fivefold Binary", "Three-Color Start", "Triple Grid", "Three Lock-Icon Tiles",
    "Three Empty Holes", "Triple Combine", "Pattern Primer", "Patterns With Lock Icons", "Color Gauntlet",
    "Four-State Start", "Four-State Lock-Icon Tiles", "Four-State Empty Holes", "Four-State Patterns", "Four-State Matrix",
    "Five-State Start", "Five-State Lock-Icon Tiles", "Five-State Empty Holes", "Five-State Patterns", "Dense Dimensions",
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
      hideNumbers: true,
      guideTextSize: "small",
      language: "en"
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
    renderDaily();
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
    els.settingLanguage = document.getElementById("setting-language");
    els.aboutVersion = document.getElementById("about-version");
    els.aboutChangelog = document.getElementById("about-changelog");
  }

  function bindEvents() {
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

    els.patternOptions.addEventListener("click", function (event) {
      var chip = event.target.closest("[data-pattern]");
      if (!chip) return;
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

    [els.settingSound, els.settingNumbers, els.settingLanguage].forEach(function (input) {
      if (!input) return;
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
        if (event.target === els.patternInfoModal) closePatternInfo();
      });
    }
  }

  function handleAction(action, button) {
    if (action !== "hint" && action !== "undo" && action !== "reset") {
      playSound("ui");
    }
    if (action === "show-main") showScreen("main");
    if (action === "show-campaign") {
      renderCampaign();
      showScreen("campaign");
      ensureCampaignLevels().then(renderCampaign);
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
    if (action === "close-settings") closeSettings();
    if (action === "show-about") openAbout();
    if (action === "close-about") showScreen("settings");
    if (action === "show-pattern-info") openPatternInfo();
    if (action === "close-pattern-info") closePatternInfo();
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
    loadMathJax().then(function () {
      if (!window.MathJax || !window.MathJax.typesetPromise) return;
      var targets = [];
      if (app.screens.howto) targets.push(app.screens.howto);
      if (app.screens.math) targets.push(app.screens.math);
      if (!targets.length) return;
      window.MathJax.typesetPromise(targets).catch(function () {});
    }).catch(function () {});
  }

  function loadMathJax() {
    if (window.MathJax && window.MathJax.typesetPromise) return Promise.resolve();
    if (app.mathJaxPromise) return app.mathJaxPromise;
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
    if (target === "settings" || target === "about") target = "main";
    showScreen(target);
  }

  function openAbout() {
    renderAbout();
    showScreen("about");
  }

  function openPatternInfo() {
    if (!els.patternInfoModal) return;
    cancelPress();
    els.patternInfoModal.hidden = false;
  }

  function closePatternInfo() {
    if (!els.patternInfoModal) return;
    els.patternInfoModal.hidden = true;
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
    progress.freePrefs.unique = true;
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
    renderLanguageOptions();
    els.settingSound.checked = settings.sound;
    els.settingNumbers.checked = !Boolean(settings.hideNumbers);
    if (els.settingLanguage) els.settingLanguage.value = currentLanguage();
  }

  function updateSettingsFromUI() {
    var soundWasOff = !app.progress.settings.sound;
    var previousLanguage = currentLanguage();
    app.progress.settings.sound = els.settingSound.checked;
    app.progress.settings.hideNumbers = !els.settingNumbers.checked;
    if (els.settingLanguage) app.progress.settings.language = normalizeLanguage(els.settingLanguage.value);
    saveProgress();
    applySettings();
    renderBoard();
    if (soundWasOff && app.progress.settings.sound) playSound("ui");
    if (previousLanguage !== currentLanguage()) playSound("ui");
  }

  function applySettings() {
    var guideSize = normalizeGuideTextSize(app.progress.settings.guideTextSize);
    app.progress.settings.language = currentLanguage();
    document.body.classList.toggle("hide-numbers", Boolean(app.progress.settings.hideNumbers));
    document.body.classList.toggle("guide-size-medium", guideSize === "medium");
    document.body.classList.toggle("guide-size-large", guideSize === "large");
    syncGuideSizeControls();
    startSplashBoard();
    applyLanguage();
  }

  function normalizeLanguage(language) {
    return LANGUAGE_OPTIONS.some(function (option) { return option.key === language; }) ? language : "en";
  }

  function currentLanguage() {
    return normalizeLanguage(app.progress && app.progress.settings ? app.progress.settings.language : "en");
  }

  function t(text) {
    var language = currentLanguage();
    if (language === "en") return text;
    var table = TEXT_TRANSLATIONS[language] || {};
    return table[text] || text;
  }

  function renderLanguageOptions() {
    if (!els.settingLanguage) return;
    els.settingLanguage.innerHTML = LANGUAGE_OPTIONS.map(function (option) {
      return '<option value="' + option.key + '">' + option.label + '</option>';
    }).join("");
  }

  function applyLanguage() {
    var language = currentLanguage();
    document.documentElement.lang = language;
    translateStaticDom();
    renderFreeplayControls();
    renderDaily();
    renderAbout();
    if (app.activeScreen === "campaign") renderCampaign();
    if (app.currentGame) {
      els.modeLabel.textContent = modeLabel(app.currentGame.mode);
      els.titleLabel.textContent = gameDisplayName(app.currentGame);
      renderPatternIndicator(app.currentGame);
      renderBoard();
      updateCounters();
    }
    syncGuideSizeControls();
    if (app.activeScreen === "howto" || app.activeScreen === "math") typesetMath();
  }

  function translateStaticDom() {
    restoreGuideScreenHtml();
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentElement;
        if (!parent || parent.closest("script, style")) return NodeFilter.FILTER_REJECT;
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
      if (!trimmed) continue;
      textNode.nodeValue = source.replace(trimmed, t(trimmed));
    }

    document.querySelectorAll("[aria-label]").forEach(function (node) {
      var source = originalAttributes.get(node);
      if (source === undefined) {
        source = node.getAttribute("aria-label") || "";
        originalAttributes.set(node, source);
      }
      if (source) node.setAttribute("aria-label", t(source));
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
    if (!root || !rule || !rule.terms || !rule.terms.length) return;
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
      if (!match) continue;
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
        if (index < 0) break;
        var end = index + lowerTerm.length;
        if (isTermBoundary(text, index - 1) && isTermBoundary(text, end)) {
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
    if (index < 0 || index >= text.length) return true;
    return !/[0-9A-Za-zÀ-ÖØ-öø-ÿ_]/.test(text.charAt(index));
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

    if (!changed.size) return;

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
    if (!els.aboutChangelog) return;
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
      return chipHtml(stateCount + " " + t("states"), "data-states", stateCount, prefs.states === stateCount);
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
        if (x === center && y === center) classes.push("is-center");
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
    if (!game) return "";
    if (game.mode === "campaign" && game.campaignIndex >= 0) {
      var chapter = Math.floor(game.campaignIndex / 10) + 1;
      var level = game.campaignIndex % 10 + 1;
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
    if (app.campaignLevels.length) return Promise.resolve(app.campaignLevels);
    if (app.campaignLoadPromise) return app.campaignLoadPromise;
    if (!window.fetch) {
      app.campaignLoadState = "error";
      app.campaignLoadError = "Campaign data could not be loaded.";
      return Promise.resolve([]);
    }

    app.campaignLoadState = "loading";
    app.campaignLoadError = "";
    app.campaignLoadPromise = fetch(CAMPAIGN_DATA_URL + "?v=" + CAMPAIGN_VERSION)
      .then(function (response) {
        if (!response.ok) throw new Error("Campaign data request failed with " + response.status);
        return response.json();
      })
      .then(function (data) {
        app.campaignLevels = campaignLevelsFromData(data);
        app.campaignLoadState = "ready";
        app.campaignLoadPromise = null;
        if (app.activeScreen === "campaign") renderCampaign();
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
    if (levels.length !== 300) throw new Error("Campaign data is incomplete.");
    return levels;
  }

  function campaignLevelFromData(raw) {
    var width = Number(raw.width) || 5;
    var height = Number(raw.height) || 5;
    var states = Number(raw.states) || 2;
    var initial = Array.isArray(raw.initialState) ? raw.initialState.map(function (value) {
      return mod(Number(value) || 0, states);
    }) : [];
    while (initial.length < width * height) initial.push(0);

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
      chapter: Number(raw.chapter) || 1,
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
      if (Number.isFinite(idx) && Number.isFinite(item) && item) out[idx] = item;
    });
    return out;
  }

  function stringMap(value) {
    var out = {};
    Object.keys(value || {}).forEach(function (key) {
      var idx = Number(key);
      var item = String(value[key] || "");
      if (Number.isFinite(idx) && item) out[idx] = item;
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
      els.dailyList.innerHTML = '<section class="empty-state"><h3>' + t("No daily puzzles available") + '</h3><p>' + t("Daily puzzles are generated from the current date. Reload the app to try again.") + '</p></section>';
      return;
    }
    var dateKey = getDailyDateKey();
    els.dailyList.innerHTML =
      '<section class="daily-section">' +
        '<h3>' + t("Today's Puzzles") + '</h3>' +
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

  function renderDailyCard(tier, dateKey) {
    var record = dailyRecordFor(dateKey, tier.key);
    var completed = Boolean(record && record.completed);
    var tierLabel = dailyTierDisplayName(tier.key);
    var bestLine = completed ? t("Best") + ": " + record.moves + " " + (record.moves === 1 ? t("tap") : t("taps")) : t("Not played today");
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
    if (!app.progress.daily) return null;
    var current = app.progress.daily[dailyChallengeKey(dateKey, tierKey)];
    if (current) return current;
    return tierKey === "medium" ? app.progress.daily[dateKey] : null;
  }

  function campaignChapterMeta(chapter) {
    return {
      id: chapter,
      title: t("Chapter") + " " + chapter + ": " + chapterTitle(chapter)
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
      unique: true,
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
    if (mode === "campaign") return t("Campaign");
    if (mode === "daily") return t("Daily");
    return t("Custom Level");
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
      if (active.has(x + "," + y)) classes.push("is-active");
      if (x === center && y === center) classes.push("is-center");
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
      if (unique.indexOf(key) === -1) unique.push(key);
    });
    return unique.map(function (key) {
      var pattern = PATTERNS[key] || PATTERNS.cross;
      return '<span><b>' + (PATTERN_BADGES[key] || "?") + '</b>' + patternDisplayName(key) + '</span>';
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
        if (game.locked.has(idx)) classes.push("locked");
        if (previewSet.has(idx)) classes.push("preview");
        if (hintSet.has(idx)) classes.push("hint");
        if (hintAffectedSet.has(idx)) classes.push("hint-affected");
        if (suggestedIndex === idx) classes.push("hint-suggested");
        if (changedSet.has(idx)) classes.push("hint-changed");
        if (pulseSet.has(idx)) classes.push("pulsed");
        if (showSolution) classes.push("solution");

        var patternKey = game.tilePatterns[idx] || game.defaultPattern || "cross";
        var patternBadge = PATTERN_BADGES[patternKey] || "?";
        var patternMark = showPatternBadges ? '<span class="pattern-badge" aria-hidden="true">' + patternBadge + '</span>' : "";
        var solutionValue = showSolution ? (game.hint.solution[idx] || 0) : "";
        var lockMark = game.locked.has(idx) ? '<span class="lock-badge" aria-hidden="true"><svg class="lock-mark" viewBox="0 0 24 24"><path class="lock-shackle" d="M7.25 10.25V8.1a4.75 4.75 0 0 1 9.5 0v2.15"></path><rect class="lock-body" x="5.25" y="10.25" width="13.5" height="10" rx="2.6"></rect><path class="lock-key" d="M12 14.2v2.45"></path></svg></span>' : "";
        var ariaLabel = t("Row") + " " + (y + 1) + ", " + t("column") + " " + (x + 1) + ", " + t("state") + " " + state + ", " + patternDisplayName(patternKey) + " " + t("pattern") + (game.locked.has(idx) ? ", " + t("locked") : "");
        html.push(
          '<button class="' + classes.join(" ") + '" data-index="' + idx + '" data-number="' + STATE_NUMBERS[state] + '" data-solution="' + solutionValue + '" aria-label="' + ariaLabel + '"' + (game.locked.has(idx) ? ' aria-disabled="true"' : "") + '>' +
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
    els.hintLine.textContent = t("Previewing this tap.");
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
    if (isSolved(game, game.board)) {
      window.setTimeout(completeGame, 360);
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
      els.hintLine.textContent = t("No useful tap is available.");
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
    els.hintLine.textContent = t("Hint applied. Red tiles changed. This try is worth 0 stars.");
    renderBoard(affected);
    updateCounters();
    playSound("hint");
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
    closePatternInfo();

    els.modalTitle.textContent = game.mode === "daily" ? t("Daily Complete") : t("Level Complete");
    els.modalStars.setAttribute("aria-label", stars + " " + t("out of 3 stars") + " " + t("earned"));
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
    if (!game || game.mode === "daily") return "";
    return game.mode === "freeplay" ? t("New Puzzle") : t("Next Level");
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
      return '<span class="' + (highlighted ? "is-highlighted" : "") + '" aria-label="' + escapeAttribute(threshold.stars + " " + t("out of 3 stars") + ": " + formatMoveRange(threshold.min, threshold.max, false)) + '">' + stars + '<em>' + moveLabel + '</em></span>';
    }).join("");
  }

  function renderStatusStarRanking(item) {
    var highlightedStars = storedStarsForGame(item);
    return starThresholds(item).map(function (threshold) {
      var label = threshold.stars + " " + (threshold.stars === 1 ? t("star") : t("stars")) + ": " + formatMoveRange(threshold.min, threshold.max, false);
      var highlighted = highlightedStars !== null && threshold.stars === highlightedStars;
      return '<span class="star-ranking-row' + (highlighted ? " is-highlighted" : "") + '" aria-label="' + escapeAttribute(label + (highlighted ? ", " + t("current best") : "")) + '">' +
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
    var label = t("Level") + " " + (level.campaignIndex + 1);
    if (!unlocked) label += ", " + t("locked");
    if (completed) {
      label += ", " + t("complete") + ", " + stars + " " + (stars === 1 ? t("star") : t("stars")) + " " + t("earned");
      if (hintUsed) label += ", " + t("hint used");
    } else {
      label += ", " + t("not complete");
    }
    return escapeAttribute(label);
  }

  function formatMoveRange(minimum, maximum, compact) {
    if (maximum === null) {
      return compact ? minimum + "+" : minimum + "+ " + t("taps");
    }
    if (minimum === maximum) return formatMoveThreshold(minimum, compact);
    return compact ? minimum + "-" + maximum : minimum + "-" + maximum + " " + t("taps");
  }

  function formatMoveThreshold(value, compact) {
    var moves = Math.max(0, Number(value) || 0);
    if (compact) return String(moves);
    return moves + " " + (moves === 1 ? t("tap") : t("taps"));
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
