import { toggleMusic } from './audio.js';


export function initControls(game) {
    const keyActions = {
        "ArrowLeft": () => game.movePiece(-1), // mover a la izquierda
        "ArrowRight": () => game.movePiece(1), // mover a la derecha
        "ArrowDown": () => game.dropPiece(), // bajar más rápido
        "ArrowUp": () => game.rotatePiece(), // rotar
        "KeyX": () => game.rotatePiece(), // alternativa rotar
        "KeyZ": () => game.rotatePiece(false), // rotar en sentido contrario
        "Space": () => game.hardDrop(), // caída instantánea (hard drop)
        "KeyC": () => game.holdPiece(), // hold piece
        "KeyP": () => game.togglePause(), // pausa
        "KeyR": () => game.resetGame(), // reiniciar
        "KeyM": () => toggleMusic() // encender/apagar música
    };

    document.addEventListener("keydown", (event) => {
        if (game.isGameOver) return;

        const action = keyActions[event.code];
        if (action) action(); // Ejecuta la acción asociada
    });


    // Escuchar el evento click del botón de música
    const musicBtn = document.getElementById("musicBtn");
    if (musicBtn) {
        musicBtn.addEventListener("click", toggleMusic);
    }

    const pauseBtn = document.getElementById("pauseBtn");
    if (pauseBtn) {
        pauseBtn.addEventListener("click", () => game.togglePause());
    }

}
