// @ts-nocheck
/*
 * TypeScript source for the static web app.
 * Run `npm run build` from `web-app/` to regenerate `app.js`.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "resonance-grid-progress-v1";
  var APP_VERSION = "1.0.7";
  var CAMPAIGN_DATA_URL = "campaign-levels.json";
  var MATHJAX_URL = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
  var CHANGELOG_ENTRIES = [
    {
      version: "1.0.7",
      date: "2026-05-14",
      text: "Settings now hide platform-specific controls, animation and colorblind-symbol toggles were removed, and About shows credits and version history."
    },
    {
      version: "1.0.6",
      date: "2026-05-13",
      text: "Release builds keep native debug symbols for Play Console crash reports."
    },
    {
      version: "1.0.5",
      date: "2026-05-13",
      text: "The Math guide explains uniqueness, silent plans, and cross-pattern invertibility."
    }
  ];
  var LANGUAGE_OPTIONS = [
    { key: "en", label: "English" },
    { key: "es", label: "Español" },
    { key: "fr", label: "Français" }
  ];
  var TEXT_TRANSLATIONS = {
    es: {
      "A modular tile puzzle": "Un rompecabezas modular de fichas",
      "Main menu": "Menú principal",
      "Campaign": "Campaña",
      "Custom Level": "Nivel personalizado",
      "Daily Challenge": "Reto diario",
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
      "Pulse Pattern": "Patrón de pulso",
      "Pulse pattern": "Patrón de pulso",
      "Difficulty": "Dificultad",
      "Locked tiles": "Fichas bloqueadas",
      "Irregular board": "Tablero irregular",
      "Unique solution preferred": "Preferir solución única",
      "Create Puzzle": "Crear rompecabezas",
      "Daily": "Diario",
      "Daily puzzle tiers": "Niveles del reto diario",
      "Puzzle status": "Estado del rompecabezas",
      "Moves": "Movimientos",
      "Star ranking": "Clasificación de estrellas",
      "Time": "Tiempo",
      "Puzzle details": "Detalles del rompecabezas",
      "Pattern": "Patrón",
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
      "Solve the puzzle by turning every active tile white. Tap tiles to send pulses across the board; every tile reached by a pulse advances to its next state.": "Resuelve el rompecabezas dejando blancas todas las fichas activas. Toca fichas para enviar pulsos por el tablero; cada ficha alcanzada por un pulso avanza a su siguiente estado.",
      "Rules": "Reglas",
      "1. Make every tile white": "1. Deja todas las fichas blancas",
      "A white tile is solved.": "Una ficha blanca está resuelta.",
      "Colored tiles still need more pulses before the board is complete.": "Las fichas de color aún necesitan más pulsos antes de completar el tablero.",
      "The puzzle is solved only when every active tile is white.": "El rompecabezas solo se resuelve cuando todas las fichas activas son blancas.",
      "2. Tap and cycle": "2. Toca y avanza ciclos",
      "Tap an available tile to send its pulse pattern.": "Toca una ficha disponible para enviar su patrón de pulso.",
      "Every tile in that pattern advances one state.": "Cada ficha de ese patrón avanza un estado.",
      "After the last colored state, the next advance turns that tile white.": "Después del último estado de color, el siguiente avance vuelve blanca esa ficha.",
      "3. Use the pattern preview": "3. Usa la vista previa del patrón",
      "Levels can use cross, diagonal, square, horizontal, vertical, knight, or mixed patterns.": "Los niveles pueden usar patrones de cruz, diagonal, cuadrado, horizontal, vertical, caballo o mixtos.",
      "Hold or hover a tile to preview the tiles that will change.": "Mantén pulsada o pasa el cursor sobre una ficha para ver qué fichas cambiarán.",
      "4. Handle special tiles": "4. Maneja fichas especiales",
      "Locked tiles can change when nearby pulses reach them.": "Las fichas bloqueadas pueden cambiar cuando les llegan pulsos cercanos.",
      "You cannot tap locked tiles directly.": "No puedes tocar fichas bloqueadas directamente.",
      "Empty holes are not part of the board.": "Los huecos vacíos no forman parte del tablero.",
      "Modes": "Modos",
      "Choose your puzzle": "Elige tu rompecabezas",
      "Campaign:": "Campaña:",
      "Complete fixed levels in order; the next level opens after each solve.": "Completa niveles fijos en orden; el siguiente nivel se abre después de cada solución.",
      "Custom Level:": "Nivel personalizado:",
      "Choose board size, states, pattern, difficulty, locks, gaps, and whether the generator should prefer a unique solution.": "Elige tamaño del tablero, estados, patrón, dificultad, bloqueos, huecos y si el generador debe preferir una solución única.",
      "Daily Challenge:": "Reto diario:",
      "Play the same three generated puzzles as everyone else for the date; each puzzle keeps its own saved best score.": "Juega los mismos tres rompecabezas generados que todos los demás en esa fecha; cada uno guarda su mejor puntuación.",
      "Tools and options": "Herramientas y opciones",
      "Moves, stars, and hints": "Movimientos, estrellas y pistas",
      "The move counter counts every tap.": "El contador de movimientos cuenta cada toque.",
      "Three stars means you matched the generator's minimum found move count.": "Tres estrellas significa que igualaste el mínimo de movimientos encontrado por el generador.",
      "Two-star and one-star targets allow extra moves.": "Los objetivos de dos y una estrella permiten movimientos extra.",
      "Undo rewinds one move. Reset restores the starting board.": "Deshacer retrocede un movimiento. Reiniciar restaura el tablero inicial.",
      "Hint applies the next move from a solver plan. Using a hint removes stars for that try, but the puzzle still counts as complete.": "Pista aplica el siguiente movimiento de un plan de resolución. Usar una pista elimina las estrellas de ese intento, pero el rompecabezas cuenta como completado.",
      "Tiles changed by a hint are marked in red.": "Las fichas cambiadas por una pista se marcan en rojo.",
      "Sound toggles audio effects.": "Sonido activa o desactiva los efectos de audio.",
      "Show numbers on tiles displays state values when you want them.": "Mostrar números en las fichas enseña los valores de estado cuando los quieras.",
      "Android also includes haptic feedback controls.": "Android también incluye controles de respuesta háptica.",
      "Math overview": "Resumen matemático",
      "Invert the Matrix is a modular linear-algebra puzzle. Fix an order for the active tiles. A displayed board is then a vector in \\(R^m\\), where \\(R=\\mathbb Z/n\\mathbb Z\\) and \\(m\\) is the number of active board positions. Each legal tap pulse is assigned a pulse vector in the same module, and the puzzle asks for a linear combination of those pulse vectors that cancels the starting board.": "Invert the Matrix es un rompecabezas de álgebra lineal modular. Fija un orden para las fichas activas. Un tablero mostrado es entonces un vector en \\(R^m\\), donde \\(R=\\mathbb Z/n\\mathbb Z\\) y \\(m\\) es el número de posiciones activas. A cada toque legal se le asigna un vector de pulso en el mismo módulo, y el rompecabezas pide una combinación lineal de esos vectores que cancele el tablero inicial.",
      "All arithmetic is performed modulo the number \\(n\\) of tile states, so the value after \\(n-1\\) is \\(0\\). Prime moduli such as \\(2,3,\\) and \\(5\\) give finite fields. The four-state mode uses the ring \\(\\mathbb Z/4\\mathbb Z\\); addition and multiplication are still well defined, but only units can be divided by.": "Toda la aritmética se realiza módulo el número \\(n\\) de estados de ficha, así que el valor posterior a \\(n-1\\) es \\(0\\). Los módulos primos como \\(2,3,\\) y \\(5\\) dan campos finitos. El modo de cuatro estados usa el anillo \\(\\mathbb Z/4\\mathbb Z\\); la suma y la multiplicación siguen bien definidas, pero solo se puede dividir por unidades.",
      "Lights Out generalization": "Generalización de Lights Out",
      "From Lights Out": "Desde Lights Out",
      "A modular version of the same question": "Una versión modular de la misma pregunta",
      "In ordinary Lights Out, every tile is either \\(0\\) or \\(1\\), and pressing a tile toggles a fixed neighborhood. Toggling is addition by \\(1\\) modulo \\(2\\), so pressing the same tile twice gives no net change. This is linear algebra over \\(\\mathbb F_2\\).": "En Lights Out clásico, cada ficha es \\(0\\) o \\(1\\), y pulsar una ficha alterna una vecindad fija. Alternar es sumar \\(1\\) módulo \\(2\\), así que pulsar la misma ficha dos veces no produce cambio neto. Esto es álgebra lineal sobre \\(\\mathbb F_2\\).",
      "This game keeps the same linear structure while changing the coefficient ring. A level with \\(n\\) states works over \\(R=\\mathbb Z/n\\mathbb Z\\). Gaps change the board module; locks and pulse patterns change the allowed pulse vectors. The mathematical question remains: is the negative starting board in the submodule generated by the legal pulse vectors?": "Este juego mantiene la misma estructura lineal mientras cambia el anillo de coeficientes. Un nivel con \\(n\\) estados trabaja sobre \\(R=\\mathbb Z/n\\mathbb Z\\). Los huecos cambian el módulo del tablero; los bloqueos y patrones de pulso cambian los vectores de pulso permitidos. La pregunta matemática sigue siendo: ¿está el negativo del tablero inicial en el submódulo generado por los vectores de pulso legales?",
      "1. The board is a vector": "1. El tablero es un vector",
      "Let \\(P=\\{p_1,\\ldots,p_m\\}\\) be the active board positions, listed in a fixed order. A board configuration is the vector \\(s=(s_1,\\ldots,s_m)\\in R^m\\), where \\(s_i\\) is the residue shown on tile \\(p_i\\). The solved board is the zero vector \\(0\\in R^m\\).": "Sea \\(P=\\{p_1,\\ldots,p_m\\}\\) el conjunto de posiciones activas del tablero, listadas en un orden fijo. Una configuración del tablero es el vector \\(s=(s_1,\\ldots,s_m)\\in R^m\\), donde \\(s_i\\) es el residuo mostrado en la ficha \\(p_i\\). El tablero resuelto es el vector cero \\(0\\in R^m\\).",
      "2. Every legal tap has a pulse vector": "2. Cada toque legal tiene un vector de pulso",
      "Let \\(q_1,\\ldots,q_r\\) be the legal tap positions. The pulse at \\(q_j\\) defines a vector \\(v_j\\in R^m\\): its \\(i\\)-th coordinate is \\(1\\) when that pulse advances tile \\(p_i\\), and \\(0\\) when it does not. The move matrix is \\(A=[v_1\\ \\cdots\\ v_r]\\), so \\(A_{ij}=(v_j)_i\\).": "Sean \\(q_1,\\ldots,q_r\\) las posiciones de toque legales. El pulso en \\(q_j\\) define un vector \\(v_j\\in R^m\\): su coordenada \\(i\\)-ésima es \\(1\\) cuando ese pulso avanza la ficha \\(p_i\\), y \\(0\\) cuando no lo hace. La matriz de movimientos es \\(A=[v_1\\ \\cdots\\ v_r]\\), así que \\(A_{ij}=(v_j)_i\\).",
      "Locked tiles still appear as rows because their values must become zero, and nearby pulses may change them. They do not appear as columns because they cannot be tapped directly.": "Las fichas bloqueadas siguen apareciendo como filas porque sus valores deben llegar a cero y los pulsos cercanos pueden cambiarlas. No aparecen como columnas porque no se pueden tocar directamente.",
      "Solving equation": "Ecuación de resolución",
      "Goal": "Objetivo",
      "Find a tap-count vector": "Encuentra un vector de conteo de toques",
      "A tap plan is a vector \\(x=(x_1,\\ldots,x_r)\\in R^r\\), where \\(x_j\\) is the number of times the legal tap \\(q_j\\) is used, counted modulo \\(n\\). Executing \\(x\\) adds \\(\\sum_j x_jv_j=Ax\\) to the board. Thus tap order is irrelevant to the algebra; only the residue class of each tap count matters.": "Un plan de toques es un vector \\(x=(x_1,\\ldots,x_r)\\in R^r\\), donde \\(x_j\\) es el número de veces que se usa el toque legal \\(q_j\\), contado módulo \\(n\\). Ejecutar \\(x\\) suma \\(\\sum_j x_jv_j=Ax\\) al tablero. Por tanto, el orden de los toques no importa para el álgebra; solo importa la clase residual de cada conteo.",
      "After applying the plan, the board is \\(s+Ax\\). Solving the puzzle means making this vector equal to the zero vector, equivalently solving \\(Ax\\equiv -s\\pmod n\\).": "Después de aplicar el plan, el tablero es \\(s+Ax\\). Resolver el rompecabezas significa hacer que este vector sea el vector cero, equivalentemente resolver \\(Ax\\equiv -s\\pmod n\\).",
      "When does a solution exist?": "¿Cuándo existe una solución?",
      "The columns of \\(A\\) generate the set of all board changes obtainable by legal taps. In algebraic terms, a solution exists exactly when the target vector \\(-s\\) belongs to the image of \\(A\\), meaning \\(\\operatorname{Im}(A)=\\{Ax:x\\in R^r\\}\\).": "Las columnas de \\(A\\) generan el conjunto de todos los cambios de tablero obtenibles con toques legales. En términos algebraicos, existe una solución exactamente cuando el vector objetivo \\(-s\\) pertenece a la imagen de \\(A\\), es decir, \\(\\operatorname{Im}(A)=\\{Ax:x\\in R^r\\}\\).",
      "Over a field, such as \\(\\mathbb F_2,\\mathbb F_3,\\mathbb F_5\\), this can be checked by row-reducing the augmented system \\([A\\mid -s]\\). A row of the form \\([0\\ \\cdots\\ 0\\mid c]\\) with \\(c\\ne0\\) proves inconsistency. If no such row appears, back-substitution gives at least one tap plan.": "Sobre un campo, como \\(\\mathbb F_2,\\mathbb F_3,\\mathbb F_5\\), esto se comprueba reduciendo por filas el sistema aumentado \\([A\\mid -s]\\). Una fila de la forma \\([0\\ \\cdots\\ 0\\mid c]\\) con \\(c\\ne0\\) prueba inconsistencia. Si no aparece una fila así, la sustitución hacia atrás da al menos un plan de toques.",
      "What changes for non-prime \\(n\\)?": "¿Qué cambia para \\(n\\) no primo?",
      "For composite \\(n\\), \\(\\mathbb Z/n\\mathbb Z\\) is a ring but not a field. You may add and multiply as usual, but division is valid only by units. For \\(n=4\\), the residue \\(2\\) is nonzero and has no inverse: no value \\(a\\) satisfies \\(2a\\equiv 1\\pmod 4\\).": "Para \\(n\\) compuesto, \\(\\mathbb Z/n\\mathbb Z\\) es un anillo pero no un campo. Se puede sumar y multiplicar como siempre, pero la división solo es válida por unidades. Para \\(n=4\\), el residuo \\(2\\) no es cero y no tiene inverso: ningún valor \\(a\\) satisface \\(2a\\equiv 1\\pmod 4\\).",
      "The criterion does not change: there is still a solution exactly when \\(-s\\in\\operatorname{Im}(A)\\), but the verification must respect ring arithmetic. Row operations that divide by non-units are not valid. For general composite \\(n\\), one may also check the compatible prime-power systems given by the Chinese remainder theorem.": "El criterio no cambia: sigue habiendo solución exactamente cuando \\(-s\\in\\operatorname{Im}(A)\\), pero la verificación debe respetar la aritmética del anillo. Las operaciones de fila que dividen por no unidades no son válidas. Para \\(n\\) compuesto general, también se pueden comprobar los sistemas de potencias primas compatibles dados por el teorema chino del resto.",
      "When is the solution unique?": "¿Cuándo es única la solución?",
      "If \\(x_0\\) is one solution, then every other solution is \\(x_0+z\\), where \\(z\\in R^r\\) is a tap-count vector with \\(Az=0\\). These silent plans form the kernel of the move matrix.": "Si \\(x_0\\) es una solución, cualquier otra solución es \\(x_0+z\\), donde \\(z\\in R^r\\) es un vector de conteo de toques con \\(Az=0\\). Estos planes silenciosos forman el núcleo de la matriz de movimientos.",
      "Tap counts already live modulo \\(n\\), so pressing one tile \\(n\\) additional times adds \\(n e_j=0\\), the zero vector in the tap-count module \\(R^r\\). That is not a new algebraic solution.": "Los conteos de toques ya viven módulo \\(n\\), así que pulsar una ficha \\(n\\) veces adicionales suma \\(n e_j=0\\), el vector cero en el módulo de conteos \\(R^r\\). Eso no es una nueva solución algebraica.",
      "The obstruction to uniqueness is a nonzero silent plan \\(z\\ne 0\\) with \\(Az=0\\). If such a \\(z\\) exists, then \\(x_0\\) and \\(x_0+z\\) are distinct tap-count vectors that solve the same board. Thus the algebraic solution is unique precisely when \\(\\ker(A)=\\{0\\}\\). Over fields this is equivalent to linear independence of the legal pulse vectors. Over rings, the same kernel condition is the correct statement, interpreted in the module over \\(\\mathbb Z/n\\mathbb Z\\).": "El obstáculo a la unicidad es un plan silencioso no nulo \\(z\\ne 0\\) con \\(Az=0\\). Si existe tal \\(z\\), entonces \\(x_0\\) y \\(x_0+z\\) son vectores de conteo distintos que resuelven el mismo tablero. Así, la solución algebraica es única precisamente cuando \\(\\ker(A)=\\{0\\}\\). Sobre campos esto equivale a la independencia lineal de los vectores de pulso legales. Sobre anillos, la misma condición de núcleo es la afirmación correcta, interpretada en el módulo sobre \\(\\mathbb Z/n\\mathbb Z\\).",
      "When does cross \\(A\\) have an inverse?": "¿Cuándo tiene inversa la \\(A\\) de cruz?",
      "On a plain \\(w\\times h\\) board with no locks and no gaps, the cross pattern has exactly one legal tap for each tile. Hence \\(A\\) is a square \\(wh\\times wh\\) matrix, defining an endomorphism of \\(R^{wh}\\). It is invertible exactly when every starting board has a unique tap-count solution.": "En un tablero simple de \\(w\\times h\\), sin bloqueos ni huecos, el patrón de cruz tiene exactamente un toque legal por cada ficha. Por tanto \\(A\\) es una matriz cuadrada \\(wh\\times wh\\), que define un endomorfismo de \\(R^{wh}\\). Es invertible exactamente cuando todo tablero inicial tiene una solución única de conteo de toques.",
      "Equivalently, \\(\\det A\\) must be a unit modulo \\(n\\). For prime state counts \\(n=2,3,5\\), this means \\(\\det A\\not\\equiv0\\pmod n\\), or rank \\(wh\\). For \\(n=4\\), it means \\(\\det A\\) is odd. If this fails in the plain square case, some board vectors are unreachable and nonzero silent tap-count vectors exist. With locks or gaps \\(A\\) may be rectangular, so image and kernel are the appropriate objects instead of a two-sided inverse.": "Equivalentemente, \\(\\det A\\) debe ser una unidad módulo \\(n\\). Para recuentos de estados primos \\(n=2,3,5\\), esto significa \\(\\det A\\not\\equiv0\\pmod n\\), o rango \\(wh\\). Para \\(n=4\\), significa que \\(\\det A\\) es impar. Si esto falla en el caso cuadrado simple, algunos vectores de tablero son inalcanzables y existen vectores silenciosos no nulos. Con bloqueos o huecos, \\(A\\) puede ser rectangular, así que la imagen y el núcleo son los objetos adecuados en vez de una inversa bilateral.",
      "Why the minimum matters": "Por qué importa el mínimo",
      "If there are several algebraic solutions, the game can still ask for the most efficient one. For each residue \\(x_j\\in R\\), choose its representative \\(\\tilde{x}_j\\in\\{0,\\ldots,n-1\\}\\). The physical length of a plan is \\(\\ell(x)=\\sum_j\\tilde{x}_j\\), and the star target is based on a solution with minimal length among the solutions found.": "Si hay varias soluciones algebraicas, el juego aún puede pedir la más eficiente. Para cada residuo \\(x_j\\in R\\), elige su representante \\(\\tilde{x}_j\\in\\{0,\\ldots,n-1\\}\\). La longitud física de un plan es \\(\\ell(x)=\\sum_j\\tilde{x}_j\\), y el objetivo de estrellas se basa en una solución de longitud mínima entre las soluciones encontradas.",
      "How the shortest solver works": "Cómo funciona el solucionador más corto",
      "For small boards the app runs a breadth-first search through board states. Each edge is one legal tap, so the first time the zero board is reached, the path length is the true minimum number of physical taps.": "Para tableros pequeños, la app ejecuta una búsqueda en anchura por los estados del tablero. Cada arista es un toque legal, así que la primera vez que se alcanza el tablero cero, la longitud del camino es el verdadero mínimo de toques físicos.",
      "For larger boards with prime state counts \\(n=2,3,5\\), it row-reduces \\(Ax=-s\\). If free variables remain, the solutions are \\(x_0+\\ker(A)\\); when the nullspace search is small enough, the app enumerates those vectors and chooses the one minimizing \\(\\ell(x)\\). If that exact search is too large, or \\(n\\) is composite and the board is too large for BFS, the game falls back to a known solving plan instead of claiming a proof of minimality.": "Para tableros más grandes con recuentos de estados primos \\(n=2,3,5\\), reduce por filas \\(Ax=-s\\). Si quedan variables libres, las soluciones son \\(x_0+\\ker(A)\\); cuando la búsqueda en el espacio nulo es lo bastante pequeña, la app enumera esos vectores y elige el que minimiza \\(\\ell(x)\\). Si esa búsqueda exacta es demasiado grande, o \\(n\\) es compuesto y el tablero es demasiado grande para BFS, el juego usa un plan de resolución conocido en lugar de afirmar una prueba de minimalidad.",
      "The shortest tap-count vector is not necessarily unique. Distinct solutions can tie for the same \\(\\ell(x)\\), and a single vector can be played in many tap orders. The app keeps one deterministic shortest plan when it can certify the minimum; it does not currently mark whether all shortest plans are unique.": "El vector de conteo de toques más corto no necesariamente es único. Soluciones distintas pueden empatar para la misma \\(\\ell(x)\\), y un solo vector se puede jugar en muchos órdenes de toque. La app conserva un plan más corto determinista cuando puede certificar el mínimo; actualmente no marca si todos los planes más cortos son únicos.",
      "Locked tiles and gaps": "Fichas bloqueadas y huecos",
      "Locked tiles still appear as rows because their values must become zero, and nearby pulses may change them. They do not appear as tap columns. Gaps are removed from the ordered set \\(P\\), so they are neither rows nor columns. This is how the same equation adapts to irregular boards without changing the underlying map \\(A:R^r\\to R^m\\).": "Las fichas bloqueadas siguen apareciendo como filas porque sus valores deben llegar a cero y los pulsos cercanos pueden cambiarlas. No aparecen como columnas de toque. Los huecos se eliminan del conjunto ordenado \\(P\\), así que no son filas ni columnas. Así es como la misma ecuación se adapta a tableros irregulares sin cambiar la aplicación subyacente \\(A:R^r\\to R^m\\).",
      "How the generator uses this": "Cómo usa esto el generador",
      "The generator uses the same objects: it determines the legal pulse vectors from the board shape, locks, gaps, and pulse pattern. It chooses or certifies a starting vector \\(s\\) together with a tap-count vector \\(x\\) satisfying \\(s+Ax=0\\). When the exact solver is available, it searches the solution set for a short representative so the star thresholds have a mathematical basis. Hints use a stored plan one step at a time.": "El generador usa los mismos objetos: determina los vectores de pulso legales a partir de la forma del tablero, los bloqueos, los huecos y el patrón de pulso. Elige o certifica un vector inicial \\(s\\) junto con un vector de conteo \\(x\\) que satisface \\(s+Ax=0\\). Cuando el solucionador exacto está disponible, busca en el conjunto de soluciones un representante corto para que los umbrales de estrellas tengan una base matemática. Las pistas usan un plan almacenado paso a paso.",
      "What the symbols mean": "Qué significan los símbolos",
      "The number of tile states and the modulus used by the level; the app uses \\(2,3,4,\\) or \\(5\\) states.": "El número de estados de las fichas y el módulo usado por el nivel; la app usa \\(2,3,4,\\) o \\(5\\) estados.",
      "The current board configuration as a vector in \\(R^m\\).": "La configuración actual del tablero como vector en \\(R^m\\).",
      "The move matrix whose column \\(v_j\\) is the pulse vector for legal tap \\(q_j\\).": "La matriz de movimientos cuya columna \\(v_j\\) es el vector de pulso del toque legal \\(q_j\\).",
      "The tap-count vector in \\(R^r\\) whose coordinate \\(x_j\\) counts tap \\(q_j\\).": "El vector de conteo de toques en \\(R^r\\) cuya coordenada \\(x_j\\) cuenta el toque \\(q_j\\).",
      "All board-change vectors obtainable by legal taps.": "Todos los vectores de cambio del tablero obtenibles con toques legales.",
      "Tap-count vectors that produce zero board change.": "Vectores de conteo de toques que producen cambio cero en el tablero.",
      "Language": "Idioma",
      "Sound": "Sonido",
      "Show numbers on tiles": "Mostrar números en las fichas",
      "About": "Acerca de",
      "About Invert the Matrix": "Acerca de Invert the Matrix",
      "Changelog": "Historial de cambios",
      "Complete": "Completado",
      "Level Complete": "Nivel completado",
      "Daily Complete": "Diario completado",
      "Stars earned": "Estrellas ganadas",
      "Moves Used": "Movimientos usados",
      "Minimum": "Mínimo",
      "Best Moves": "Mejor marca",
      "Star thresholds": "Umbrales de estrellas",
      "Next Level": "Siguiente nivel",
      "Replay": "Repetir",
      "Menu": "Menú",
      "New Puzzle": "Nuevo rompecabezas",
      "Version": "Versión",
      "Best": "Mejor",
      "Chapter": "Capítulo",
      "Inversion": "Inversión",
      "Settings now hide platform-specific controls, animation and colorblind-symbol toggles were removed, and About shows credits and version history.": "Los ajustes ahora ocultan controles específicos de plataforma, se eliminaron los interruptores de animación y símbolos daltónicos, y Acerca de muestra créditos e historial de versiones.",
      "Release builds keep native debug symbols for Play Console crash reports.": "Las compilaciones de lanzamiento conservan símbolos nativos de depuración para los informes de fallos de Play Console.",
      "The Math guide explains uniqueness, silent plans, and cross-pattern invertibility.": "La guía de matemáticas explica la unicidad, los planes silenciosos y la invertibilidad del patrón de cruz.",
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
      "Preparing campaign": "Preparando campaña",
      "Building fallback levels for this session.": "Construyendo niveles alternativos para esta sesión.",
      "Loading the fixed campaign levels from the bundled JSON.": "Cargando los niveles fijos de la campaña desde el JSON incluido.",
      "Campaign data unavailable": "Datos de campaña no disponibles",
      "Reload the app, or try again to build fallback levels.": "Recarga la app o vuelve a intentar construir niveles alternativos.",
      "The bundled campaign asset could not be loaded. Reload the app or check that campaign-levels.json is included.": "No se pudo cargar el recurso incluido de la campaña. Recarga la app o comprueba que campaign-levels.json esté incluido.",
      "No campaign levels found": "No se encontraron niveles de campaña",
      "The campaign could not be prepared. Reload the app to rebuild the level list.": "No se pudo preparar la campaña. Recarga la app para reconstruir la lista de niveles.",
      "The fixed campaign data is missing. Reload the app or check the bundled asset.": "Faltan los datos fijos de la campaña. Recarga la app o comprueba el recurso incluido.",
      "No daily puzzles available": "No hay rompecabezas diarios disponibles",
      "Daily puzzles are generated from the current date. Reload the app to try again.": "Los rompecabezas diarios se generan a partir de la fecha actual. Recarga la app para intentarlo de nuevo.",
      "Locks on": "Bloqueos activos",
      "Locks off": "Bloqueos inactivos",
      "Holes on": "Huecos activos",
      "Holes off": "Huecos inactivos",
      "Not played today": "No jugado hoy",
      "not completed today": "no completado hoy",
      "daily challenge": "reto diario",
      "state": "estado",
      "states": "estados",
      "move": "movimiento",
      "moves": "movimientos",
      "star": "estrella",
      "stars": "estrellas",
      "out of 3 stars": "de 3 estrellas",
      "current best": "mejor marca actual",
      "Level": "Nivel",
      "locked": "bloqueado",
      "complete": "completado",
      "earned": "ganadas",
      "hint used": "pista usada",
      "not complete": "no completado",
      "Row": "Fila",
      "column": "columna",
      "pattern": "patrón",
      "Previewing this pulse.": "Vista previa de este pulso.",
      "No useful move is available.": "No hay ningún movimiento útil disponible.",
      "Hint applied. Red tiles changed. This try is worth 0 stars.": "Pista aplicada. Las fichas rojas cambiaron. Este intento vale 0 estrellas.",
      "Binary Beginnings": "Comienzos binarios",
      "Fourfold Flips": "Giros cuádruples",
      "Fourfold Focus": "Enfoque cuádruple",
      "Fourfold Mastery": "Maestría cuádruple",
      "Locked Lights": "Luces bloqueadas",
      "Lockstep Squares": "Cuadrados sincronizados",
      "First Holes": "Primeros huecos",
      "Binary Breakaways": "Escapes binarios",
      "Fivefold Binary": "Binario quíntuple",
      "Three-Color Start": "Inicio tricolor",
      "Triple Grid": "Cuadrícula triple",
      "Triple Locks": "Bloqueos triples",
      "Triple Holes": "Huecos triples",
      "Triple Combine": "Combinación triple",
      "Pattern Primer": "Primeros patrones",
      "Pattern Locks": "Bloqueos de patrón",
      "Color Gauntlet": "Desafío de colores",
      "Four-State Start": "Inicio de cuatro estados",
      "Four-State Grid": "Cuadrícula de cuatro estados",
      "Four-State Locks": "Bloqueos de cuatro estados",
      "Four-State Gaps": "Huecos de cuatro estados",
      "Four-State Patterns": "Patrones de cuatro estados",
      "Four-State Matrix": "Matriz de cuatro estados",
      "Five-State Start": "Inicio de cinco estados",
      "Five-State Grid": "Cuadrícula de cinco estados",
      "Five-State Matrix": "Matriz de cinco estados",
      "Five-State Locks": "Bloqueos de cinco estados",
      "Five-State Gaps": "Huecos de cinco estados",
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
      "Pulse Pattern": "Motif de pulsation",
      "Pulse pattern": "Motif de pulsation",
      "Difficulty": "Difficulté",
      "Locked tiles": "Tuiles verrouillées",
      "Irregular board": "Grille irrégulière",
      "Unique solution preferred": "Solution unique préférée",
      "Create Puzzle": "Créer un casse-tête",
      "Daily": "Quotidien",
      "Daily puzzle tiers": "Niveaux du défi quotidien",
      "Puzzle status": "État du casse-tête",
      "Moves": "Coups",
      "Star ranking": "Classement d'étoiles",
      "Time": "Temps",
      "Puzzle details": "Détails du casse-tête",
      "Pattern": "Motif",
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
      "Solve the puzzle by turning every active tile white. Tap tiles to send pulses across the board; every tile reached by a pulse advances to its next state.": "Résous le casse-tête en rendant blanches toutes les tuiles actives. Touche des tuiles pour envoyer des pulsations sur le plateau; chaque tuile atteinte par une pulsation avance à son état suivant.",
      "Rules": "Règles",
      "1. Make every tile white": "1. Rends toutes les tuiles blanches",
      "A white tile is solved.": "Une tuile blanche est résolue.",
      "Colored tiles still need more pulses before the board is complete.": "Les tuiles colorées ont encore besoin de pulsations avant que le plateau soit terminé.",
      "The puzzle is solved only when every active tile is white.": "Le casse-tête est résolu seulement quand toutes les tuiles actives sont blanches.",
      "2. Tap and cycle": "2. Touche et fais cycler",
      "Tap an available tile to send its pulse pattern.": "Touche une tuile disponible pour envoyer son motif de pulsation.",
      "Every tile in that pattern advances one state.": "Chaque tuile dans ce motif avance d'un état.",
      "After the last colored state, the next advance turns that tile white.": "Après le dernier état coloré, l'avancée suivante rend cette tuile blanche.",
      "3. Use the pattern preview": "3. Utilise l'aperçu du motif",
      "Levels can use cross, diagonal, square, horizontal, vertical, knight, or mixed patterns.": "Les niveaux peuvent utiliser des motifs croix, diagonale, carré, horizontal, vertical, cavalier ou mixtes.",
      "Hold or hover a tile to preview the tiles that will change.": "Maintiens ou survole une tuile pour voir les tuiles qui changeront.",
      "4. Handle special tiles": "4. Gère les tuiles spéciales",
      "Locked tiles can change when nearby pulses reach them.": "Les tuiles verrouillées peuvent changer quand des pulsations voisines les atteignent.",
      "You cannot tap locked tiles directly.": "Tu ne peux pas toucher directement les tuiles verrouillées.",
      "Empty holes are not part of the board.": "Les trous vides ne font pas partie du plateau.",
      "Modes": "Modes",
      "Choose your puzzle": "Choisis ton casse-tête",
      "Campaign:": "Campagne :",
      "Complete fixed levels in order; the next level opens after each solve.": "Termine les niveaux fixes dans l'ordre; le niveau suivant s'ouvre après chaque résolution.",
      "Custom Level:": "Niveau personnalisé :",
      "Choose board size, states, pattern, difficulty, locks, gaps, and whether the generator should prefer a unique solution.": "Choisis la taille du plateau, les états, le motif, la difficulté, les verrous, les trous et si le générateur doit préférer une solution unique.",
      "Daily Challenge:": "Défi quotidien :",
      "Play the same three generated puzzles as everyone else for the date; each puzzle keeps its own saved best score.": "Joue les mêmes trois casse-têtes générés que tout le monde pour la date; chaque casse-tête garde son meilleur score.",
      "Tools and options": "Outils et options",
      "Moves, stars, and hints": "Coups, étoiles et indices",
      "The move counter counts every tap.": "Le compteur de coups compte chaque toucher.",
      "Three stars means you matched the generator's minimum found move count.": "Trois étoiles signifient que tu as égalé le minimum de coups trouvé par le générateur.",
      "Two-star and one-star targets allow extra moves.": "Les objectifs à deux et une étoile autorisent des coups en plus.",
      "Undo rewinds one move. Reset restores the starting board.": "Annuler revient d'un coup. Réinitialiser restaure le plateau de départ.",
      "Hint applies the next move from a solver plan. Using a hint removes stars for that try, but the puzzle still counts as complete.": "Indice applique le coup suivant d'un plan de résolution. Utiliser un indice retire les étoiles de cet essai, mais le casse-tête compte quand même comme terminé.",
      "Tiles changed by a hint are marked in red.": "Les tuiles changées par un indice sont marquées en rouge.",
      "Sound toggles audio effects.": "Son active ou désactive les effets audio.",
      "Show numbers on tiles displays state values when you want them.": "Afficher les nombres sur les tuiles montre les valeurs d'état quand tu les veux.",
      "Android also includes haptic feedback controls.": "Android inclut aussi des contrôles de retour haptique.",
      "Math overview": "Aperçu mathématique",
      "Invert the Matrix is a modular linear-algebra puzzle. Fix an order for the active tiles. A displayed board is then a vector in \\(R^m\\), where \\(R=\\mathbb Z/n\\mathbb Z\\) and \\(m\\) is the number of active board positions. Each legal tap pulse is assigned a pulse vector in the same module, and the puzzle asks for a linear combination of those pulse vectors that cancels the starting board.": "Invert the Matrix est un casse-tête d'algèbre linéaire modulaire. Fixe un ordre pour les tuiles actives. Un plateau affiché est alors un vecteur dans \\(R^m\\), où \\(R=\\mathbb Z/n\\mathbb Z\\) et \\(m\\) est le nombre de positions actives. Chaque pulsation légale reçoit un vecteur de pulsation dans le même module, et le casse-tête demande une combinaison linéaire de ces vecteurs qui annule le plateau de départ.",
      "All arithmetic is performed modulo the number \\(n\\) of tile states, so the value after \\(n-1\\) is \\(0\\). Prime moduli such as \\(2,3,\\) and \\(5\\) give finite fields. The four-state mode uses the ring \\(\\mathbb Z/4\\mathbb Z\\); addition and multiplication are still well defined, but only units can be divided by.": "Toute l'arithmétique se fait modulo le nombre \\(n\\) d'états de tuile, donc la valeur après \\(n-1\\) est \\(0\\). Les modules premiers comme \\(2,3,\\) et \\(5\\) donnent des corps finis. Le mode à quatre états utilise l'anneau \\(\\mathbb Z/4\\mathbb Z\\); l'addition et la multiplication restent bien définies, mais seules les unités permettent de diviser.",
      "Lights Out generalization": "Généralisation de Lights Out",
      "From Lights Out": "Depuis Lights Out",
      "A modular version of the same question": "Une version modulaire de la même question",
      "In ordinary Lights Out, every tile is either \\(0\\) or \\(1\\), and pressing a tile toggles a fixed neighborhood. Toggling is addition by \\(1\\) modulo \\(2\\), so pressing the same tile twice gives no net change. This is linear algebra over \\(\\mathbb F_2\\).": "Dans Lights Out classique, chaque tuile vaut \\(0\\) ou \\(1\\), et appuyer sur une tuile inverse un voisinage fixe. Inverser revient à ajouter \\(1\\) modulo \\(2\\), donc appuyer deux fois sur la même tuile ne produit aucun changement net. C'est de l'algèbre linéaire sur \\(\\mathbb F_2\\).",
      "This game keeps the same linear structure while changing the coefficient ring. A level with \\(n\\) states works over \\(R=\\mathbb Z/n\\mathbb Z\\). Gaps change the board module; locks and pulse patterns change the allowed pulse vectors. The mathematical question remains: is the negative starting board in the submodule generated by the legal pulse vectors?": "Ce jeu garde la même structure linéaire tout en changeant l'anneau des coefficients. Un niveau avec \\(n\\) états travaille sur \\(R=\\mathbb Z/n\\mathbb Z\\). Les trous changent le module du plateau; les verrous et les motifs de pulsation changent les vecteurs de pulsation autorisés. La question mathématique reste: le négatif du plateau de départ appartient-il au sous-module engendré par les vecteurs de pulsation légaux?",
      "1. The board is a vector": "1. Le plateau est un vecteur",
      "Let \\(P=\\{p_1,\\ldots,p_m\\}\\) be the active board positions, listed in a fixed order. A board configuration is the vector \\(s=(s_1,\\ldots,s_m)\\in R^m\\), where \\(s_i\\) is the residue shown on tile \\(p_i\\). The solved board is the zero vector \\(0\\in R^m\\).": "Soit \\(P=\\{p_1,\\ldots,p_m\\}\\) les positions actives du plateau, listées dans un ordre fixe. Une configuration du plateau est le vecteur \\(s=(s_1,\\ldots,s_m)\\in R^m\\), où \\(s_i\\) est le résidu affiché sur la tuile \\(p_i\\). Le plateau résolu est le vecteur zéro \\(0\\in R^m\\).",
      "2. Every legal tap has a pulse vector": "2. Chaque toucher légal a un vecteur de pulsation",
      "Let \\(q_1,\\ldots,q_r\\) be the legal tap positions. The pulse at \\(q_j\\) defines a vector \\(v_j\\in R^m\\): its \\(i\\)-th coordinate is \\(1\\) when that pulse advances tile \\(p_i\\), and \\(0\\) when it does not. The move matrix is \\(A=[v_1\\ \\cdots\\ v_r]\\), so \\(A_{ij}=(v_j)_i\\).": "Soient \\(q_1,\\ldots,q_r\\) les positions de toucher légales. La pulsation en \\(q_j\\) définit un vecteur \\(v_j\\in R^m\\): sa coordonnée \\(i\\)-ième vaut \\(1\\) quand cette pulsation avance la tuile \\(p_i\\), et \\(0\\) sinon. La matrice des coups est \\(A=[v_1\\ \\cdots\\ v_r]\\), donc \\(A_{ij}=(v_j)_i\\).",
      "Locked tiles still appear as rows because their values must become zero, and nearby pulses may change them. They do not appear as columns because they cannot be tapped directly.": "Les tuiles verrouillées apparaissent toujours comme lignes parce que leurs valeurs doivent devenir zéro et que des pulsations voisines peuvent les changer. Elles n'apparaissent pas comme colonnes parce qu'on ne peut pas les toucher directement.",
      "Solving equation": "Équation de résolution",
      "Goal": "Objectif",
      "Find a tap-count vector": "Trouver un vecteur de comptage des touchers",
      "A tap plan is a vector \\(x=(x_1,\\ldots,x_r)\\in R^r\\), where \\(x_j\\) is the number of times the legal tap \\(q_j\\) is used, counted modulo \\(n\\). Executing \\(x\\) adds \\(\\sum_j x_jv_j=Ax\\) to the board. Thus tap order is irrelevant to the algebra; only the residue class of each tap count matters.": "Un plan de touchers est un vecteur \\(x=(x_1,\\ldots,x_r)\\in R^r\\), où \\(x_j\\) est le nombre de fois où le toucher légal \\(q_j\\) est utilisé, compté modulo \\(n\\). Exécuter \\(x\\) ajoute \\(\\sum_j x_jv_j=Ax\\) au plateau. L'ordre des touchers est donc sans importance pour l'algèbre; seule la classe résiduelle de chaque compte compte.",
      "After applying the plan, the board is \\(s+Ax\\). Solving the puzzle means making this vector equal to the zero vector, equivalently solving \\(Ax\\equiv -s\\pmod n\\).": "Après application du plan, le plateau est \\(s+Ax\\). Résoudre le casse-tête signifie rendre ce vecteur égal au vecteur zéro, c'est-à-dire résoudre \\(Ax\\equiv -s\\pmod n\\).",
      "When does a solution exist?": "Quand une solution existe-t-elle ?",
      "The columns of \\(A\\) generate the set of all board changes obtainable by legal taps. In algebraic terms, a solution exists exactly when the target vector \\(-s\\) belongs to the image of \\(A\\), meaning \\(\\operatorname{Im}(A)=\\{Ax:x\\in R^r\\}\\).": "Les colonnes de \\(A\\) engendrent l'ensemble de tous les changements du plateau obtenables par touchers légaux. En termes algébriques, une solution existe exactement quand le vecteur cible \\(-s\\) appartient à l'image de \\(A\\), c'est-à-dire \\(\\operatorname{Im}(A)=\\{Ax:x\\in R^r\\}\\).",
      "Over a field, such as \\(\\mathbb F_2,\\mathbb F_3,\\mathbb F_5\\), this can be checked by row-reducing the augmented system \\([A\\mid -s]\\). A row of the form \\([0\\ \\cdots\\ 0\\mid c]\\) with \\(c\\ne0\\) proves inconsistency. If no such row appears, back-substitution gives at least one tap plan.": "Sur un corps, comme \\(\\mathbb F_2,\\mathbb F_3,\\mathbb F_5\\), on peut le vérifier en réduisant par lignes le système augmenté \\([A\\mid -s]\\). Une ligne de la forme \\([0\\ \\cdots\\ 0\\mid c]\\) avec \\(c\\ne0\\) prouve l'incohérence. Si aucune ligne de ce type n'apparaît, la substitution arrière donne au moins un plan de touchers.",
      "What changes for non-prime \\(n\\)?": "Qu'est-ce qui change pour \\(n\\) non premier ?",
      "For composite \\(n\\), \\(\\mathbb Z/n\\mathbb Z\\) is a ring but not a field. You may add and multiply as usual, but division is valid only by units. For \\(n=4\\), the residue \\(2\\) is nonzero and has no inverse: no value \\(a\\) satisfies \\(2a\\equiv 1\\pmod 4\\).": "Pour \\(n\\) composé, \\(\\mathbb Z/n\\mathbb Z\\) est un anneau mais pas un corps. On peut additionner et multiplier normalement, mais la division n'est valide que par des unités. Pour \\(n=4\\), le résidu \\(2\\) est non nul et n'a pas d'inverse: aucune valeur \\(a\\) ne satisfait \\(2a\\equiv 1\\pmod 4\\).",
      "The criterion does not change: there is still a solution exactly when \\(-s\\in\\operatorname{Im}(A)\\), but the verification must respect ring arithmetic. Row operations that divide by non-units are not valid. For general composite \\(n\\), one may also check the compatible prime-power systems given by the Chinese remainder theorem.": "Le critère ne change pas: il existe toujours une solution exactement quand \\(-s\\in\\operatorname{Im}(A)\\), mais la vérification doit respecter l'arithmétique de l'anneau. Les opérations de ligne qui divisent par des non-unités ne sont pas valides. Pour \\(n\\) composé général, on peut aussi vérifier les systèmes compatibles de puissances premières donnés par le théorème des restes chinois.",
      "When is the solution unique?": "Quand la solution est-elle unique ?",
      "If \\(x_0\\) is one solution, then every other solution is \\(x_0+z\\), where \\(z\\in R^r\\) is a tap-count vector with \\(Az=0\\). These silent plans form the kernel of the move matrix.": "Si \\(x_0\\) est une solution, toute autre solution est \\(x_0+z\\), où \\(z\\in R^r\\) est un vecteur de comptage des touchers avec \\(Az=0\\). Ces plans silencieux forment le noyau de la matrice des coups.",
      "Tap counts already live modulo \\(n\\), so pressing one tile \\(n\\) additional times adds \\(n e_j=0\\), the zero vector in the tap-count module \\(R^r\\). That is not a new algebraic solution.": "Les comptes de touchers vivent déjà modulo \\(n\\), donc appuyer \\(n\\) fois de plus sur une tuile ajoute \\(n e_j=0\\), le vecteur zéro dans le module de comptes \\(R^r\\). Ce n'est pas une nouvelle solution algébrique.",
      "The obstruction to uniqueness is a nonzero silent plan \\(z\\ne 0\\) with \\(Az=0\\). If such a \\(z\\) exists, then \\(x_0\\) and \\(x_0+z\\) are distinct tap-count vectors that solve the same board. Thus the algebraic solution is unique precisely when \\(\\ker(A)=\\{0\\}\\). Over fields this is equivalent to linear independence of the legal pulse vectors. Over rings, the same kernel condition is the correct statement, interpreted in the module over \\(\\mathbb Z/n\\mathbb Z\\).": "L'obstruction à l'unicité est un plan silencieux non nul \\(z\\ne 0\\) avec \\(Az=0\\). Si un tel \\(z\\) existe, alors \\(x_0\\) et \\(x_0+z\\) sont des vecteurs de comptes distincts qui résolvent le même plateau. La solution algébrique est donc unique précisément quand \\(\\ker(A)=\\{0\\}\\). Sur les corps, cela équivaut à l'indépendance linéaire des vecteurs de pulsation légaux. Sur les anneaux, la même condition de noyau est l'énoncé correct, interprété dans le module sur \\(\\mathbb Z/n\\mathbb Z\\).",
      "When does cross \\(A\\) have an inverse?": "Quand la \\(A\\) en croix a-t-elle un inverse ?",
      "On a plain \\(w\\times h\\) board with no locks and no gaps, the cross pattern has exactly one legal tap for each tile. Hence \\(A\\) is a square \\(wh\\times wh\\) matrix, defining an endomorphism of \\(R^{wh}\\). It is invertible exactly when every starting board has a unique tap-count solution.": "Sur un plateau simple \\(w\\times h\\) sans verrous ni trous, le motif en croix a exactement un toucher légal par tuile. Donc \\(A\\) est une matrice carrée \\(wh\\times wh\\), qui définit un endomorphisme de \\(R^{wh}\\). Elle est inversible exactement quand tout plateau de départ a une solution unique en comptes de touchers.",
      "Equivalently, \\(\\det A\\) must be a unit modulo \\(n\\). For prime state counts \\(n=2,3,5\\), this means \\(\\det A\\not\\equiv0\\pmod n\\), or rank \\(wh\\). For \\(n=4\\), it means \\(\\det A\\) is odd. If this fails in the plain square case, some board vectors are unreachable and nonzero silent tap-count vectors exist. With locks or gaps \\(A\\) may be rectangular, so image and kernel are the appropriate objects instead of a two-sided inverse.": "De façon équivalente, \\(\\det A\\) doit être une unité modulo \\(n\\). Pour les nombres d'états premiers \\(n=2,3,5\\), cela signifie \\(\\det A\\not\\equiv0\\pmod n\\), ou rang \\(wh\\). Pour \\(n=4\\), cela signifie que \\(\\det A\\) est impair. Si cela échoue dans le cas carré simple, certains vecteurs de plateau sont inatteignables et des vecteurs silencieux non nuls existent. Avec des verrous ou des trous, \\(A\\) peut être rectangulaire, donc l'image et le noyau sont les bons objets au lieu d'un inverse bilatéral.",
      "Why the minimum matters": "Pourquoi le minimum compte",
      "If there are several algebraic solutions, the game can still ask for the most efficient one. For each residue \\(x_j\\in R\\), choose its representative \\(\\tilde{x}_j\\in\\{0,\\ldots,n-1\\}\\). The physical length of a plan is \\(\\ell(x)=\\sum_j\\tilde{x}_j\\), and the star target is based on a solution with minimal length among the solutions found.": "S'il existe plusieurs solutions algébriques, le jeu peut quand même demander la plus efficace. Pour chaque résidu \\(x_j\\in R\\), choisis son représentant \\(\\tilde{x}_j\\in\\{0,\\ldots,n-1\\}\\). La longueur physique d'un plan est \\(\\ell(x)=\\sum_j\\tilde{x}_j\\), et l'objectif d'étoiles se base sur une solution de longueur minimale parmi celles trouvées.",
      "How the shortest solver works": "Comment fonctionne le solveur le plus court",
      "For small boards the app runs a breadth-first search through board states. Each edge is one legal tap, so the first time the zero board is reached, the path length is the true minimum number of physical taps.": "Pour les petits plateaux, l'app lance une recherche en largeur dans les états du plateau. Chaque arête est un toucher légal, donc la première fois que le plateau zéro est atteint, la longueur du chemin est le vrai minimum de touchers physiques.",
      "For larger boards with prime state counts \\(n=2,3,5\\), it row-reduces \\(Ax=-s\\). If free variables remain, the solutions are \\(x_0+\\ker(A)\\); when the nullspace search is small enough, the app enumerates those vectors and chooses the one minimizing \\(\\ell(x)\\). If that exact search is too large, or \\(n\\) is composite and the board is too large for BFS, the game falls back to a known solving plan instead of claiming a proof of minimality.": "Pour les plateaux plus grands avec des nombres d'états premiers \\(n=2,3,5\\), elle réduit par lignes \\(Ax=-s\\). S'il reste des variables libres, les solutions sont \\(x_0+\\ker(A)\\); quand la recherche dans le noyau est assez petite, l'app énumère ces vecteurs et choisit celui qui minimise \\(\\ell(x)\\). Si cette recherche exacte est trop grande, ou si \\(n\\) est composé et le plateau trop grand pour BFS, le jeu utilise un plan de résolution connu au lieu d'affirmer une preuve de minimalité.",
      "The shortest tap-count vector is not necessarily unique. Distinct solutions can tie for the same \\(\\ell(x)\\), and a single vector can be played in many tap orders. The app keeps one deterministic shortest plan when it can certify the minimum; it does not currently mark whether all shortest plans are unique.": "Le vecteur de comptes de touchers le plus court n'est pas forcément unique. Des solutions distinctes peuvent être à égalité pour la même \\(\\ell(x)\\), et un seul vecteur peut être joué dans de nombreux ordres. L'app garde un plan le plus court déterministe quand elle peut certifier le minimum; elle n'indique pas actuellement si tous les plans les plus courts sont uniques.",
      "Locked tiles and gaps": "Tuiles verrouillées et trous",
      "Locked tiles still appear as rows because their values must become zero, and nearby pulses may change them. They do not appear as tap columns. Gaps are removed from the ordered set \\(P\\), so they are neither rows nor columns. This is how the same equation adapts to irregular boards without changing the underlying map \\(A:R^r\\to R^m\\).": "Les tuiles verrouillées apparaissent toujours comme lignes parce que leurs valeurs doivent devenir zéro et que des pulsations voisines peuvent les changer. Elles n'apparaissent pas comme colonnes de toucher. Les trous sont retirés de l'ensemble ordonné \\(P\\), donc ils ne sont ni lignes ni colonnes. C'est ainsi que la même équation s'adapte aux plateaux irréguliers sans changer l'application sous-jacente \\(A:R^r\\to R^m\\).",
      "How the generator uses this": "Comment le générateur utilise cela",
      "The generator uses the same objects: it determines the legal pulse vectors from the board shape, locks, gaps, and pulse pattern. It chooses or certifies a starting vector \\(s\\) together with a tap-count vector \\(x\\) satisfying \\(s+Ax=0\\). When the exact solver is available, it searches the solution set for a short representative so the star thresholds have a mathematical basis. Hints use a stored plan one step at a time.": "Le générateur utilise les mêmes objets: il détermine les vecteurs de pulsation légaux à partir de la forme du plateau, des verrous, des trous et du motif de pulsation. Il choisit ou certifie un vecteur de départ \\(s\\) avec un vecteur de comptes \\(x\\) satisfaisant \\(s+Ax=0\\). Quand le solveur exact est disponible, il cherche dans l'ensemble des solutions un représentant court pour donner une base mathématique aux seuils d'étoiles. Les indices utilisent un plan stocké, étape par étape.",
      "What the symbols mean": "Signification des symboles",
      "The number of tile states and the modulus used by the level; the app uses \\(2,3,4,\\) or \\(5\\) states.": "Le nombre d'états des tuiles et le module utilisé par le niveau; l'app utilise \\(2,3,4,\\) ou \\(5\\) états.",
      "The current board configuration as a vector in \\(R^m\\).": "La configuration actuelle du plateau comme vecteur dans \\(R^m\\).",
      "The move matrix whose column \\(v_j\\) is the pulse vector for legal tap \\(q_j\\).": "La matrice des coups dont la colonne \\(v_j\\) est le vecteur de pulsation du toucher légal \\(q_j\\).",
      "The tap-count vector in \\(R^r\\) whose coordinate \\(x_j\\) counts tap \\(q_j\\).": "Le vecteur de comptes de touchers dans \\(R^r\\) dont la coordonnée \\(x_j\\) compte le toucher \\(q_j\\).",
      "All board-change vectors obtainable by legal taps.": "Tous les vecteurs de changement du plateau obtenables par touchers légaux.",
      "Tap-count vectors that produce zero board change.": "Les vecteurs de comptes de touchers qui produisent un changement nul du plateau.",
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
      "Moves Used": "Coups utilisés",
      "Minimum": "Minimum",
      "Best Moves": "Meilleur score",
      "Star thresholds": "Seuils d'étoiles",
      "Next Level": "Niveau suivant",
      "Replay": "Rejouer",
      "Menu": "Menu",
      "New Puzzle": "Nouveau casse-tête",
      "Version": "Version",
      "Best": "Meilleur",
      "Chapter": "Chapitre",
      "Inversion": "Inversion",
      "Settings now hide platform-specific controls, animation and colorblind-symbol toggles were removed, and About shows credits and version history.": "Les paramètres masquent désormais les contrôles propres à chaque plateforme, les options d'animation et de symboles daltoniens ont été retirées, et À propos affiche les crédits et l'historique des versions.",
      "Release builds keep native debug symbols for Play Console crash reports.": "Les builds de publication conservent les symboles de débogage natifs pour les rapports de plantage Play Console.",
      "The Math guide explains uniqueness, silent plans, and cross-pattern invertibility.": "Le guide des maths explique l'unicité, les plans silencieux et l'inversibilité du motif en croix.",
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
      "Preparing campaign": "Préparation de la campagne",
      "Building fallback levels for this session.": "Création de niveaux de secours pour cette session.",
      "Loading the fixed campaign levels from the bundled JSON.": "Chargement des niveaux fixes de la campagne depuis le JSON inclus.",
      "Campaign data unavailable": "Données de campagne indisponibles",
      "Reload the app, or try again to build fallback levels.": "Recharge l'app ou réessaie de créer des niveaux de secours.",
      "The bundled campaign asset could not be loaded. Reload the app or check that campaign-levels.json is included.": "L'asset de campagne inclus n'a pas pu être chargé. Recharge l'app ou vérifie que campaign-levels.json est inclus.",
      "No campaign levels found": "Aucun niveau de campagne trouvé",
      "The campaign could not be prepared. Reload the app to rebuild the level list.": "La campagne n'a pas pu être préparée. Recharge l'app pour reconstruire la liste des niveaux.",
      "The fixed campaign data is missing. Reload the app or check the bundled asset.": "Les données fixes de campagne sont manquantes. Recharge l'app ou vérifie l'asset inclus.",
      "No daily puzzles available": "Aucun casse-tête quotidien disponible",
      "Daily puzzles are generated from the current date. Reload the app to try again.": "Les casse-têtes quotidiens sont générés à partir de la date actuelle. Recharge l'app pour réessayer.",
      "Locks on": "Verrous activés",
      "Locks off": "Verrous désactivés",
      "Holes on": "Trous activés",
      "Holes off": "Trous désactivés",
      "Not played today": "Pas joué aujourd'hui",
      "not completed today": "pas terminé aujourd'hui",
      "daily challenge": "défi quotidien",
      "state": "état",
      "states": "états",
      "move": "coup",
      "moves": "coups",
      "star": "étoile",
      "stars": "étoiles",
      "out of 3 stars": "sur 3 étoiles",
      "current best": "meilleur score actuel",
      "Level": "Niveau",
      "locked": "verrouillé",
      "complete": "terminé",
      "earned": "gagnées",
      "hint used": "indice utilisé",
      "not complete": "non terminé",
      "Row": "Ligne",
      "column": "colonne",
      "pattern": "motif",
      "Previewing this pulse.": "Aperçu de cette pulsation.",
      "No useful move is available.": "Aucun coup utile disponible.",
      "Hint applied. Red tiles changed. This try is worth 0 stars.": "Indice appliqué. Les tuiles rouges ont changé. Cet essai vaut 0 étoile.",
      "Binary Beginnings": "Débuts binaires",
      "Fourfold Flips": "Basculements quadruples",
      "Fourfold Focus": "Concentration quadruple",
      "Fourfold Mastery": "Maîtrise quadruple",
      "Locked Lights": "Lumières verrouillées",
      "Lockstep Squares": "Carrés synchronisés",
      "First Holes": "Premiers trous",
      "Binary Breakaways": "Échappées binaires",
      "Fivefold Binary": "Binaire quintuple",
      "Three-Color Start": "Départ tricolore",
      "Triple Grid": "Grille triple",
      "Triple Locks": "Verrous triples",
      "Triple Holes": "Trous triples",
      "Triple Combine": "Combinaison triple",
      "Pattern Primer": "Premiers motifs",
      "Pattern Locks": "Verrous de motif",
      "Color Gauntlet": "Défi des couleurs",
      "Four-State Start": "Départ à quatre états",
      "Four-State Grid": "Grille à quatre états",
      "Four-State Locks": "Verrous à quatre états",
      "Four-State Gaps": "Trous à quatre états",
      "Four-State Patterns": "Motifs à quatre états",
      "Four-State Matrix": "Matrice à quatre états",
      "Five-State Start": "Départ à cinq états",
      "Five-State Grid": "Grille à cinq états",
      "Five-State Matrix": "Matrice à cinq états",
      "Five-State Locks": "Verrous à cinq états",
      "Five-State Gaps": "Trous à cinq états",
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
    bindEvents();
    renderFreeplayControls();
    renderDaily();
    renderAbout();
    syncSettingsUI();
    applySettings();
    showScreen("main");
    ensureCampaignLevels({ allowGeneratedFallback: false });
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
  }

  function handleAction(action, button) {
    if (action !== "hint" && action !== "undo" && action !== "reset") {
      playSound("ui");
    }
    if (action === "show-main") showScreen("main");
    if (action === "show-campaign") {
      renderCampaign();
      showScreen("campaign");
      ensureCampaignLevels({ allowGeneratedFallback: true }).then(renderCampaign);
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
    if (action === "show-about") openAbout();
    if (action === "close-about") showScreen("settings");
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
    app.returnScreen = app.activeScreen;
    syncSettingsUI();
    showScreen("settings");
  }

  function openAbout() {
    renderAbout();
    showScreen("about");
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

  function ensureCampaignLevels(options) {
    var opts = options || {};
    if (app.campaignLevels.length) return Promise.resolve(app.campaignLevels);
    if (app.campaignLoadState === "error" && opts.allowGeneratedFallback) {
      return generateCampaignLevelsFallback();
    }
    if (app.campaignLoadPromise) return app.campaignLoadPromise;
    if (!window.fetch) {
      return opts.allowGeneratedFallback ? generateCampaignLevelsFallback() : Promise.resolve([]);
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
        if (opts.allowGeneratedFallback) return generateCampaignLevelsFallback();
        return [];
      });
    return app.campaignLoadPromise;
  }

  function generateCampaignLevelsFallback() {
    app.campaignLoadState = "generating";
    app.campaignLoadError = "";
    if (app.activeScreen === "campaign") renderCampaign();
    return new Promise(function (resolve) {
      window.setTimeout(function () {
        app.campaignLevels = createCampaignLevels();
        app.campaignLoadState = "ready";
        if (app.activeScreen === "campaign") renderCampaign();
        resolve(app.campaignLevels);
      }, 0);
    });
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
      els.campaignList.innerHTML = '<section class="loading-state"><h3>' + t("Loading campaign") + '</h3><p>' + t("Preparing the level list.") + '</p></section>';
      return;
    }
    if (app.campaignLoadState === "generating") {
      els.campaignList.innerHTML = '<section class="loading-state"><h3>' + t("Preparing campaign") + '</h3><p>' + t("Building fallback levels for this session.") + '</p></section>';
      return;
    }
    if (app.campaignLoadState === "error") {
      els.campaignList.innerHTML = '<section class="empty-state"><h3>' + t("Campaign data unavailable") + '</h3><p>' + t("Reload the app, or try again to build fallback levels.") + '</p></section>';
      return;
    }
    if (!app.campaignLevels.length) {
      els.campaignList.innerHTML = '<section class="empty-state"><h3>' + t("No campaign levels found") + '</h3><p>' + t("The campaign could not be prepared. Reload the app to rebuild the level list.") + '</p></section>';
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
    els.dailyList.innerHTML = DAILY_TIERS.map(function (tier) {
      return renderDailyCard(tier, dateKey);
    }).join("");
  }

  function renderDailyCard(tier, dateKey) {
    var record = dailyRecordFor(dateKey, tier.key);
    var completed = Boolean(record && record.completed);
    var stars = completed ? clamp(Number(record.stars) || 0, 0, 3) : 0;
    var configLine = tier.width + "x" + tier.height + " | " + tier.states + " " + t("states") + " | " + patternDisplayName(tier.pattern);
    var detailLine = [
      tier.locked ? t("Locks on") : t("Locks off"),
      tier.irregular ? t("Holes on") : t("Holes off")
    ].join(" / ");
    var recordLine = completed
      ? t("Best") + " " + record.moves + " " + t("moves") + " | " + formatSeconds(record.time || 0)
      : t("Not played today");
    var tierLabel = dailyTierDisplayName(tier.key);
    var aria = tierLabel + " " + t("daily challenge") + ", " + configLine + ", " + detailLine + ", " + (completed ? recordLine : t("not completed today"));
    return '<button class="daily-card daily-card-' + tier.key + (completed ? " is-complete" : "") + '" data-action="start-daily" data-daily-tier="' + tier.key + '" aria-label="' + escapeAttribute(aria) + '">' +
      '<span class="daily-card-top">' +
        '<strong class="daily-tier-label">' + escapeAttribute(tierLabel) + '</strong>' +
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
    els.patternLabel.textContent = specialCount ? t("Mixed") : patternDisplayName(defaultKey);

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
    els.hintLine.textContent = t("Previewing this pulse.");
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
      els.hintLine.textContent = t("No useful move is available.");
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

    els.modalTitle.textContent = game.mode === "daily" ? t("Daily Complete") : t("Level Complete");
    els.modalStars.setAttribute("aria-label", stars + " " + t("out of 3 stars") + " " + t("earned"));
    els.modalStars.innerHTML = '<span class="star-icons modal-star-icons" aria-hidden="true">' + renderStarIcons(stars) + '</span>';
    els.resultMoves.textContent = String(game.moves);
    els.resultMinimum.textContent = String(game.minimumMoves || "-");
    els.resultBest.textContent = String(best);
    els.resultTime.textContent = formatSeconds(game.elapsedSeconds);
    els.resultStarBreakdown.innerHTML = renderStarThresholds(game, false, stars);
    els.nextLevelButton.hidden = game.mode === "daily";
    els.nextLevelButton.disabled = game.mode === "daily";
    els.nextLevelButton.textContent = game.mode === "freeplay" ? t("New Puzzle") : t("Next Level");
    els.levelSelectButton.textContent = game.mode === "campaign" ? t("Campaign") : (game.mode === "daily" ? t("Daily") : t("Menu"));
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
      return compact ? minimum + "+" : minimum + "+ " + t("moves");
    }
    if (minimum === maximum) return formatMoveThreshold(minimum, compact);
    return compact ? minimum + "-" + maximum : minimum + "-" + maximum + " " + t("moves");
  }

  function formatMoveThreshold(value, compact) {
    var moves = Math.max(0, Number(value) || 0);
    if (compact) return String(moves);
    return moves + " " + (moves === 1 ? t("move") : t("moves"));
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
