export const Input = {
    keys: {},
    // Zmienne do myszki (o ile przesunęła się od ostatniej klatki)
    mouseDeltaX: 0,
    mouseDeltaY: 0,
    init() {
        // KLAWIATURA
        window.addEventListener("keydown", (e) => {
            this.keys[e.code] = true;
        });
        window.addEventListener("keyup", (e) => {
            this.keys[e.code] = false;
        });
        // MYSZKA (Pointer Lock API)
        const canvas = document.getElementById("c");
        // Przeglądarka pozwala zablokować kursor tylko, gdy user sam kliknie w ekran (bezpieczeństwo)
        canvas.addEventListener("click", () => {
            canvas.requestPointerLock();
        });
        // Nasłuchujemy ruchu myszką TYLKO wtedy, gdy kursor jest zablokowany
        document.addEventListener("mousemove", (e) => {
            if (document.pointerLockElement === canvas) {
                // e.movementX/Y to różnica w pikselach od ostatniej klatki
                this.mouseDeltaX += e.movementX;
                this.mouseDeltaY += e.movementY;
            }
        });
    },
    // Nasza funkcja w stylu C++ GetAsyncKeyState
    getKey(code) {
        return this.keys[code] || false;
    },
    handleRotation(cameraRotation, lookSpeed) {
        // 1. Dodajemy ruch myszki do kątów kamery.
        // Zauważ krzyżowanie osi: ruch myszki lewo/prawo (X) zmienia rotację Yaw (oś Y)!
        // Ruch myszki góra/dół (Y) zmienia rotację Pitch (oś X)!
        cameraRotation.yaw += Input.mouseDeltaX * lookSpeed;
        cameraRotation.pitch += Input.mouseDeltaY * lookSpeed;
        // 2. BARDZO WAŻNE: Resetujemy wartości z powrotem do zera!
        // Inaczej kamera będzie wariować i kręcić się w nieskończoność.
        Input.mouseDeltaX = 0;
        Input.mouseDeltaY = 0;
        // 3. Ograniczenie patrzenia góra/dół (Zapobiega łamaniu karku i wybuchom matematyki)
        // Math.PI / 2 to równe 90 stopni (patrzenie idealnie w górę/dół)
        // Dajemy 89.9 stopni, żeby upewnić się, że wektor 'Up' (0,1,0) nie będzie
        // idealnie równoległy do 'Forward', co popsułoby Cross Product!
        const MAX_PITCH = Math.PI / 2 - 0.01;
        if (cameraRotation.pitch > MAX_PITCH)
            cameraRotation.pitch = MAX_PITCH;
        if (cameraRotation.pitch < -MAX_PITCH)
            cameraRotation.pitch = -MAX_PITCH;
    },
    handleMovement(cameraPosition, forwardVector, rightVector, moveSpeed) {
        if (Input.getKey("KeyW")) {
            // Idź do przodu wzdłuż wektora Forward
            cameraPosition.x += forwardVector.x * moveSpeed;
            cameraPosition.y += forwardVector.y * moveSpeed;
            cameraPosition.z += forwardVector.z * moveSpeed;
        }
        if (Input.getKey("KeyS")) {
            // Idź do tyłu (minus Forward)
            cameraPosition.x -= forwardVector.x * moveSpeed;
            cameraPosition.y -= forwardVector.y * moveSpeed;
            cameraPosition.z -= forwardVector.z * moveSpeed;
        }
        if (Input.getKey("KeyA")) {
            // Idź w lewo (minus Right)
            cameraPosition.x -= rightVector.x * moveSpeed;
            cameraPosition.y -= rightVector.y * moveSpeed;
            cameraPosition.z -= rightVector.z * moveSpeed;
        }
        if (Input.getKey("KeyD")) {
            // Idź w prawo (wzdłuż wektora Right)
            cameraPosition.x += rightVector.x * moveSpeed;
            cameraPosition.y += rightVector.y * moveSpeed;
            cameraPosition.z += rightVector.z * moveSpeed;
        }
        if (Input.getKey("Space")) {
            // Idź w górę (Zwykła oś Y)
            cameraPosition.y += moveSpeed;
        }
        if (Input.getKey("ShiftLeft")) {
            // Idź w górę (Zwykła oś Y)
            cameraPosition.y -= moveSpeed;
        }
    },
};
