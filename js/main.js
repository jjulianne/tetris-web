import { randomPiece, HOLD_OFFSETS  } from "./pieces.js";
import { initControls } from "./controls.js";

// Constantes del Juego
const COLS = 10; // Número de columnas en el tablero de Tetris.
const ROWS = 20; // Número de filas en el tablero de Tetris.
const BLOCK_SIZE = 30; // Tamanio de cada bloque en píxeles.

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

// Configuramos las dimensiones del canvas basadas en las constantes.
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

/**
 * Esta clase gestiona todo el estado del juego: el tablero, las piezas, la puntuación, etc.
 */
class Game {
    constructor(ctx) {
        this.ctx = ctx; // El contexto de dibujo del canvas.
        this.grid = this.createGrid(); // El tablero de juego, una matriz de celdas.
        this.currentPiece = randomPiece(); // La pieza que el jugador controla actualmente.
        this.nextPiece = randomPiece(); // La próxima pieza que aparecerá.
        this.isGameOver = false; // Indica si el juego ha terminado.
        this.isPaused = false; // Indica si el juego está en pausa.
        this.dropCounter = 0; // Contador para controlar el tiempo entre cada caída de pieza.
        this.dropInterval = 1000; // El intervalo de tiempo (en ms) para que la pieza caiga.
        this.lastTime = 0; // Almacena el último tiempo del bucle de animación.
        this.score = 0; // La puntuación del jugador.
        this.lines = 0; // Las lineas del jugador.
        this.animate = this.animate.bind(this); // Asegura que `this` se refiera a la clase en el bucle.
        this.heldPiece = null; // La pieza que está en el área de hold.
        this.canHold = true; // Permite o no un nuevo hold.
        this.holdCtx = document.getElementById("hold-piece-canvas").getContext("2d");
        this.nextCtx = document.getElementById("next-piece-canvas").getContext("2d");
        this.showGhostPiece = true;
        this.scoreElement = document.getElementById('score');
        this.linesElement = document.getElementById('lines');
        this.pauseModal = document.getElementById('pause-modal');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.resumeBtn.addEventListener('click', () => this.togglePause());
        requestAnimationFrame(this.animate); // Inicia el bucle de animación del juego.
        document.addEventListener('visibilitychange', () => {
        // Si la página se oculta, pausamos el juego y mostramos el modal.
            if (document.hidden) {
                if (!this.isPaused) {
                    this.togglePause();
                }
            }
        });
    }

    /**
     * Crea una matriz (grid) de 20x10 llena de valores nulos para tener un tablero de juego vacío.
     */
    createGrid() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    }

    /**
     * Dibuja un solo bloque (celda) en el canvas en las coordenadas dadas.
     * Se le agrega un parámetro para indicar en qué contexto de canvas dibujar.
     * @param {number} x - La coordenada X del bloque.
     * @param {number} y - La coordenada Y del bloque.
     * @param {string} color - El color base del bloque.
     * @param {object} targetCtx - El contexto del canvas donde se dibujará.
     */
    drawCell(x, y, color, targetCtx = this.ctx) {
        // Calculamos las coordenadas exactas del bloque
        const pixelX = x * BLOCK_SIZE;
        const pixelY = y * BLOCK_SIZE;

        // Creamos un degradado lineal para el efecto 3D
        const gradient = targetCtx.createLinearGradient(pixelX, pixelY, pixelX + BLOCK_SIZE, pixelY + BLOCK_SIZE);

        const lightColor = this.shadeColor(color, 20); // 20% mas claro
        const darkColor = this.shadeColor(color, -20); // 20% mas oscuro

        gradient.addColorStop(0, lightColor); // Color mas claro en la esquina superior izquierda
        gradient.addColorStop(1, darkColor);  // Color mas oscuro en la esquina inferior derecha

        targetCtx.fillStyle = gradient;

        // Este es el cuerpo principal del bloque
        targetCtx.fillRect(pixelX, pixelY, BLOCK_SIZE, BLOCK_SIZE);

        // Se aniade un borde/sombra más suave
        targetCtx.strokeStyle = "rgba(0, 0, 0, 0.3)"; // Borde oscuro y semitransparente
        targetCtx.lineWidth = 2; // Un borde un poco más grueso
        targetCtx.strokeRect(pixelX, pixelY, BLOCK_SIZE, BLOCK_SIZE);

        // Se aniade un efecto de brillo en la parte superior
        // Esto le da un aspecto más "plástico" o "brillante"
        targetCtx.fillStyle = "rgba(255, 255, 255, 0.2)"; // Blanco semitransparente
        targetCtx.fillRect(pixelX + 2, pixelY + 2, BLOCK_SIZE - 4, BLOCK_SIZE / 4);
    }

    // Shade sacado de IA 
    /**
     * Aclara u oscurece un color hexadecimal.
     * @param {string} color - El color en formato hexadecimal (ej: '#FF5733').
     * @param {number} percent - El porcentaje a aclarar/oscurecer (ej: 20 para aclarar, -20 para oscurecer).
     * @returns {string} El nuevo color hexadecimal.
     */
    shadeColor(color, percent) {
        let f = parseInt(color.slice(1), 16),
            t = percent < 0 ? 0 : 255,
            p = percent < 0 ? percent * -1 : percent,
            R = f >> 16,
            G = (f >> 8) & 0x00ff,
            B = f & 0x0000ff;

        return (
            '#' +
            (
                0x1000000 +
                (Math.round((t - R) * p * 0.01) + R) * 0x10000 +
                (Math.round((t - G) * p * 0.01) + G) * 0x100 +
                (Math.round((t - B) * p * 0.01) + B)
            )
            .toString(16)
            .slice(1)
        );
    }


    /**
     * Dibuja una pieza en un canvas específico, con un desplazamiento.
     * @param {object} piece - El objeto de la pieza a dibujar.
     * @param {object} targetCtx - El contexto del canvas donde se dibujará la pieza.
     * @param {object} offset - Un objeto con las coordenadas de desplazamiento {x, y}.
     * @param {boolean} isGhost - Indica si la pieza es un fantasma.
     */
    drawPiece(piece, targetCtx = this.ctx, offset = { x: 0, y: 0 }, isGhost = false) {
        piece.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    const drawX = (targetCtx === this.ctx) ? (piece.x + dx) : dx;
                    const drawY = (targetCtx === this.ctx) ? (piece.y + dy) : dy;
                    
                    if (isGhost) {
                        // Dibujar solo el borde para la pieza fantasma
                        targetCtx.strokeStyle = "rgba(255, 255, 255, 0.4)";
                        targetCtx.lineWidth = 2;
                        targetCtx.strokeRect((drawX + offset.x) * BLOCK_SIZE, (drawY + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    } else {
                        // Dibujar la pieza normal con color
                        this.drawCell(drawX + offset.x, drawY + offset.y, piece.color, targetCtx);
                    }
                }
            });
        });
    }

    /**
     * Dibuja la pieza que saldrá en el próximo turno.
     * Borra el canvas de "Next" antes de dibujar la nueva pieza.
     */
    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCtx.canvas.width, this.nextCtx.canvas.height);
        if (this.nextPiece) {
            const offset = { x: 1, y: 1 };
            this.drawPiece(this.nextPiece, this.nextCtx, offset);
        }
    }


    /**
     * Dibuja la pieza que está guardada en el área de hold.
     * Se le pasa al método `drawPiece` el contexto del canvas de hold y un offset para centrarla.
     */
    drawHeldPiece() {
        // Borra el canvas de la pieza en hold antes de dibujar la nueva.
        this.holdCtx.clearRect(0, 0, this.holdCtx.canvas.width, this.holdCtx.canvas.height);
        if (this.heldPiece) {
            // Se usa el offset para centrar la pieza en el canvas de hold.
            // Los valores se ajustan para que la pieza se vea bien.
            const offset = HOLD_OFFSETS[this.heldPiece.type] || { x: 1, y: 1 };
            this.drawPiece(this.heldPiece, this.holdCtx, offset);
        }
    }


    /**
     * Dibuja todo el tablero de juego (el grid) con las piezas que ya han caído.
     * Itera sobre la matriz del tablero para dibujar cada celda que no sea nula.
     */
    drawGrid() {
        this.grid.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) { // Si la celda tiene un color, significa que hay un bloque.
                    this.drawCell(x, y, cell);
                }
            });
        });
    }

    /**
     * Calcula la posición de la pieza fantasma.
     * @returns {object} La pieza fantasma con su posición final.
     */
    getGhostPiece() {
        // Crear una copia de la pieza actual
        const ghostPiece = {
            ...this.currentPiece,
            y: this.currentPiece.y,
            x: this.currentPiece.x
        };

        // Mover la pieza fantasma hacia abajo hasta que colisione
        while (!this.collide(ghostPiece)) {
            ghostPiece.y++;
        }
        ghostPiece.y--; // Retroceder un paso para que no esté colisionando

        return ghostPiece;
    }

    /**
     * Comprueba si una pieza en su posición y forma actual colisiona con los bordes del tablero o con otras piezas ya fijadas.
     * @param {object} piece - La pieza a comprobar.
     * @returns {boolean} - `true` si hay colisión, `false` si no la hay.
     */
    collide(piece) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    let newX = piece.x + x;
                    let newY = piece.y + y;

                    // Comprueba colisión con los bordes del tablero.
                    if (newX < 0 || newX >= COLS || newY >= ROWS) {
                        return true;
                    }
                    // Comprueba colisión con otras piezas en el tablero (grid).
                    if (newY >= 0 && this.grid[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Fija la pieza actual en el tablero (grid) cuando esta ha colisionado.
     * Transfiere la forma y el color de la pieza a la matriz del tablero.
     * @param {object} piece - La pieza a fijar.
     */
    merge(piece) {
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.grid[piece.y + y][piece.x + x] = piece.color;
                }
            });
        });
    }

    /**
     * Revisa el tablero y elimina las líneas completas.
     * Luego, desplaza las líneas superiores hacia abajo.
     */
    clearLines() {
        let linesCleared = 0;
        for (let y = ROWS - 1; y >= 0; y--) {
            // `every()` comprueba si todas las celdas de una fila no son nulas.
            if (this.grid[y].every(cell => cell)) {
                this.grid.splice(y, 1); // Elimina la fila completa.
                this.grid.unshift(Array(COLS).fill(null)); // Agrega una nueva fila vacía arriba.
                linesCleared++; // Incrementa el contador de líneas completadas.
                y++; // Vuelve a revisar la misma fila, ya que ahora hay una nueva.
            }
        }
        // Llama a los métodos para actualizar el score y las líneas visualmente.
        if (linesCleared > 0) {
            this.updateScore(linesCleared * 100);
            this.updateLines(linesCleared);
        }
    }

    /**
     * Mueve la pieza actual horizontalmente (izquierda o derecha).
     * @param {number} dir - La dirección del movimiento (-1 para izquierda, 1 para derecha).
     */
    movePiece(dir) {
        this.currentPiece.x += dir;
        // Si hay una colisión después del movimiento, lo deshace.
        if (this.collide(this.currentPiece)) {
            this.currentPiece.x -= dir;
        }
    }

    /**
     * Mueve la pieza hacia abajo un bloque.
     * Si colisiona, la fija en el tablero, genera una nueva pieza y revisa si el juego ha terminado.
     */
    dropPiece() {
        this.currentPiece.y++;
        if (this.collide(this.currentPiece)) {
            this.currentPiece.y--; // Deshace la última caída.
            this.merge(this.currentPiece); // Fija la pieza en su lugar.
            this.clearLines(); // Revisa y elimina líneas completas.
            this.canHold = true; // Reinicia el "candado" del hold.
            this.currentPiece = this.nextPiece; // La próxima pieza se convierte en la actual.
            this.nextPiece = randomPiece(); // Genera una nueva pieza.
            // Si la nueva pieza colisiona al aparecer, el juego termina.
            if (this.collide(this.currentPiece)) {
                this.isGameOver = true;
                this.showGameOverModal(); // Muestra el modal en lugar del alert
            }
        }
    }

    /**
     * Mueve la pieza hacia abajo de manera instantánea hasta que colisiona.
     */
    hardDrop() {
        while (!this.collide(this.currentPiece)) {
            this.currentPiece.y++;
        }
        this.currentPiece.y--;
        this.merge(this.currentPiece);
        this.clearLines();
        // Agregamos esta línea para reiniciar la capacidad de hold después de un hard drop
        this.canHold = true;
        this.currentPiece = this.nextPiece;
        this.nextPiece = randomPiece();
        if (this.collide(this.currentPiece)) {
            this.isGameOver = true;
            this.showGameOverModal(); // Muestra el modal en lugar del alert
        }
    }

    /**
     * Rota la pieza actual 90 grados.
     * Implementa una rotación de matriz cuadrada.
     * @param {boolean} clockwise - `true` para rotar en sentido horario, `false` para antihorario.
     */
    rotatePiece(clockwise = true) {
        const shape = this.currentPiece.shape;
        const N = shape.length;
        const rotated = Array.from({ length: N }, () => Array(N).fill(0));

        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                // Algoritmo de rotación de matriz.
                rotated[y][x] = clockwise ? shape[N - x - 1][y] : shape[x][N - y - 1];
            }
        }

        const prevShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        // Si la rotación causa una colisión, la deshace.
        if (this.collide(this.currentPiece)) {
            this.currentPiece.shape = prevShape;
        }
    }

    /**
     * Guarda la pieza actual en el área de hold e intercambia con la pieza en hold, si existe.
     */
    holdPiece() {
        if (!this.canHold) return; // Evita el hold si ya se usó en este turno.

        if (this.heldPiece) {
            // Si ya hay una pieza en hold, intercambia la actual por la guardada.
            const temp = this.currentPiece;
            this.currentPiece = this.heldPiece;
            this.heldPiece = temp;

            // Restablece la posición de la nueva pieza para que aparezca arriba.
            this.currentPiece.x = 3;
            this.currentPiece.y = 0;
        } else {
            // Si no hay pieza en hold, guarda la actual y genera una nueva.
            this.heldPiece = this.currentPiece;
            this.currentPiece = this.nextPiece;
            this.nextPiece = randomPiece();
        }

        this.canHold = false; // Bloquea el hold hasta el próximo turno.

        // Si la nueva pieza colisiona al aparecer, el juego termina.
        if (this.collide(this.currentPiece)) {
            this.isGameOver = true;
            this.showGameOverModal(); // Muestra el modal en lugar del alert
        }
    }

    /**
     * Pausa o reanuda el juego.
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.pauseModal.style.display = 'flex'; // Muestra el modal
        } else {
            this.pauseModal.style.display = 'none'; // Oculta el modal
            requestAnimationFrame(this.animate); // Reanuda el bucle del juego
        }
    }

    /**
     * Alterna la visibilidad de la pieza fantasma.
     */
    toggleGhostPiece() {
        this.showGhostPiece = !this.showGhostPiece;
    }


    /**
     * Reinicia el estado del juego a los valores iniciales.
     */
    resetGame() {
        this.grid = this.createGrid();
        this.currentPiece = randomPiece();
        this.nextPiece = randomPiece();
        this.isGameOver = false;
        this.score = 0;
        this.lines = 0;
        this.heldPiece = null;
        this.canHold = true;
        
        // Vuelve a dibujar el canvas y actualiza el puntaje y las líneas.
        this.draw();
        this.updateScore(0);
        this.updateLines(0);
    }
    
    /**
     * Muestra la ventana modal de "Game Over" con el puntaje final.
     */
    showGameOverModal() {
        const modal = document.getElementById('game-over-modal');
        const finalScoreSpan = document.getElementById('final-score');
        finalScoreSpan.textContent = this.score;
        modal.style.display = 'flex'; // Muestra la ventana modal
    }

    /**
     * Actualiza el puntaje y lo muestra en la interfaz.
     * @param {number} points - Los puntos a sumar.
     */
    updateScore(points) {
        this.score = points; // Reemplazado por asignación directa para los reinicios
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score;
        }
    }

    /**
     * Actualiza el contador de líneas y lo muestra en la interfaz.
     * @param {number} count - El número de líneas completadas.
     */
    updateLines(count) {
        this.lines = count; // Reemplazado por asignación directa para los reinicios
        if (this.linesElement) {
            this.linesElement.textContent = this.lines;
        }
    }

    /**
     * Actualiza la lógica del juego en cada cuadro de animación.
     * @param {number} deltaTime - El tiempo transcurrido desde el último cuadro.
     */
    update(deltaTime) {
        if (this.isPaused) return; // Si el juego está en pausa, no hace nada.

        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.dropPiece(); // Hace que la pieza caiga.
            this.dropCounter = 0; // Reinicia el contador de caída.
        }
    }

    /**
     * Dibuja los elementos del juego en el canvas.
     */
    draw() {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height); // Borra el canvas.
        this.drawGrid(); // Dibuja las piezas fijadas.
        if (this.showGhostPiece) {
            const ghostPiece = this.getGhostPiece();
            this.drawPiece(ghostPiece, this.ctx, { x: 0, y: 0 }, true);
        }
        this.drawPiece(this.currentPiece); // Dibuja la pieza actual.
        this.drawHeldPiece(); // Llama a la nueva función de dibujo.
        this.drawNextPiece(); // Dibuja la siguiente pieza.
    }

    /**
     * El bucle principal del juego.
     * Se llama en cada cuadro para actualizar y dibujar el juego.
     * @param {number} time - El tiempo actual proporcionado por `requestAnimationFrame`.
     */
    animate(time = 0) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        if (!this.isGameOver) {
            this.update(deltaTime); // Actualiza la lógica.
            this.draw(); // Dibuja los elementos.
            requestAnimationFrame(this.animate); // Continúa el bucle.
        }
    }
}

// Inicialización del Juego 
const game = new Game(ctx); // Crea una nueva instancia del juego.
initControls(game); // Pasa la instancia del juego a la función de control para que pueda interactuar con él.
