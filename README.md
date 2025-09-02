# Tetris Web

Este es un proyecto web propio, desarrollado como un clásico juego de Tetris. La aplicación se construye completamente con **HTML, CSS y JavaScript nativo**, centrándose en la manipulación del DOM y el uso del elemento `<canvas>` para renderizar la interfaz y el tablero de juego.

---

## Estado del proyecto

Este proyecto está en **desarrollo activo**. Las características principales del juego, como la manipulación de piezas, la detección de colisiones y la puntuación, están implementadas y son completamente funcionales. Actualmente, el proyecto se encuentra en una fase de **mejora y expansión**, con planes de agregar nuevas funcionalidades para enriquecer la experiencia de juego.

---

## Características Implementadas

* **Lógica de juego**: Se implementa la lógica completa del Tetris, incluyendo la caída de piezas, rotaciones, movimientos laterales y detección de colisiones.
* **Controles intuitivos**: El juego es totalmente controlable con el teclado, permitiendo movimientos precisos, rotaciones, caída rápida y caída instantánea (`hard drop`).
* **Sistema de puntuación**: El puntaje y el contador de líneas completadas se actualizan dinámicamente en la interfaz.
* **Sistema de `hold`**: El jugador puede guardar y alternar una pieza para usarla más adelante.
* **Manejo de estados**: El juego puede pausarse y reanudarse, con un modal visual que notifica al jugador. Además, se pausa automáticamente al cambiar de pestaña o de aplicación.
* **Efectos visuales**: El proyecto utiliza un diseño de "glassmorphism" en el CSS para una interfaz moderna y atractiva.

---

## Tecnologías Utilizadas

### 📌 Estructura base del stack tecnológico

* **Lenguaje**: JavaScript
* **Marcado**: HTML5
* **Estilos**: CSS3
* **Renderizado**: HTML `<canvas>` API
* **Manejo del DOM**: JavaScript nativo

---

## Estructura del directorio

    /tetris-web/
    └── css/
    │   └──  styles.css/      # Estilos visuales de la aplicación
    ├── js/
    │   ├── audio.js          # Control de la música del juego
    │   ├── controls.js       # Manejo de los eventos del teclado y los botones
    │   ├── main.js           # Lógica principal del juego (motor, bucle, estado)
    │   └── pieces.js         # Definición de las formas y propiedades de las piezas
    └──index.html             # La página principal del juego

---

## Cómo Empezar

Para jugar a este Tetris, solo necesitas un navegador web moderno (como Chrome, Firefox, Edge o Safari).

1.  **Clona el repositorio**
    ```bash
    git clone https://github.com/jjulianne/tetris-web.git)
    ```

2.  **Abrir el proyecto**
    * Navega a la carpeta del proyecto.
    * Abre el archivo `index.html` en tu navegador web preferido.
