# Verificación funcional

Casos definidos por el equipo a partir de los requerimientos funcionales del capítulo de proceso. Se corren a mano en el entorno de prueba (https://lecxico-three.vercel.app) con cuentas de prueba y datos ficticios. Cada pasada registra la fecha, quién la corrió y el resultado (PASA o FALLA, con una observación si falla). Pasadas previstas: la primera antes del 30/11/2026 y la segunda al cierre del desarrollo (04/12), sumando S15 a S17.

Cuentas: P1 y P2, profesionales; N1, niño de sala de 5 (pre-lector); N2, niño de 2.º grado (primeros lectores). El tutor usa la cuenta del niño. Antes de VF-12, N2 tiene que estar vinculado con P1 (invitación aceptada como en VF-08).

| ID | RF | Cuenta | Pasos | Resultado esperado | Fecha | Quién | Resultado | Observaciones |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VF-01 | RF-01 | P1 | Registrarse con correo y contraseña sin marcar el compromiso; después, marcándolo | Sin el compromiso no deja continuar; con él se crea la cuenta y pide confirmar el correo | | | | |
| VF-02 | RF-01 | P2 | Registrarse con Google | Antes de entrar pide completar el perfil y aceptar el compromiso | | | | |
| VF-03 | RF-02 | N1 | Crear la cuenta del niño con el correo del tutor, contraseña y etapa escolar, primero sin aceptar los Términos y Condiciones y la Política de Privacidad (el consentimiento) y después aceptándolos | Sin aceptarlos no se crea; aceptándolos, se crea | | | | |
| VF-04 | RF-03 | P1 | Iniciar sesión con la contraseña correcta y con una incorrecta | Con la correcta entra al inicio de su rol; con la incorrecta muestra un error | | | | |
| VF-05 | RF-03 | P1 | Pedir la recuperación de contraseña, seguir el enlace del correo y fijar una nueva | Llega el correo, el enlace abre la página para restablecer y la nueva contraseña funciona | | | | |
| VF-06 | RF-04 | Nueva | Registrar una cuenta con un nombre de usuario ya usado | El formulario avisa que ese nombre de usuario ya está en uso | | | | |
| VF-07 | RF-07 | P1, N1 | P1 invita a N1 por su nombre de usuario exacto; después intenta con una parte del nombre | Con el nombre exacto queda una invitación pendiente; con una parte no encuentra a nadie | | | | |
| VF-08 | RF-08 | N1 | Ver la invitación de P1 y aceptarla con la contraseña del tutor, eligiendo no compartir lo registrado por otros profesionales | La invitación muestra quién invita y qué verá; el vínculo queda activo y P1 ve a N1 en su lista | | | | |
| VF-09 | RF-08 | P2, N2 | P2 invita a N2; N2 la rechaza con la contraseña del tutor | P2 no ve a N2 | | | | |
| VF-10 | RF-09 | P2, N1 | P2 invita a N1 y cancela la invitación antes de que la acepte | N1 deja de ver la invitación | | | | |
| VF-11 | RF-05 | N1 | En el perfil, cambiar la etapa escolar con una contraseña incorrecta y después con la correcta | Con la incorrecta no cambia nada; con la correcta se aplica | | | | |
| VF-12 | RF-10 | P1 | Tomar la evaluación a N1 (sala de 5) y a un niño de 2.º grado vinculado | A N1 le corresponde el nivel inicial y al de 2.º grado el primario; un niño sin vínculo activo no aparece para evaluar | | | | |
| VF-13 | RF-11 | P1, N1 | Completar la evaluación de N1 | Cinco bloques en orden, con denominación rápida al final | | | | |
| VF-14 | RF-12 | P1 | Completar la evaluación de un niño de primeros lectores | Nueve bloques en orden, con denominación rápida al final | | | | |
| VF-15 | RF-13 | P1 | Abrir el detalle de la evaluación de VF-13 | Cada bloque muestra aciertos sobre total, que coinciden con lo respondido | | | | |
| VF-16 | RF-14 | P1 | En denominación rápida, completar la serie y cargar errores | Se mide el tiempo y se guardan los errores; el bloque no entra en el porcentaje general | | | | |
| VF-17 | RF-15 | P1 | Abrir el entrenamiento en consulta de N1 y después el de N2 | Cada bloque del nivel de cada niño tiene al menos un juego, y cada juego tiene tres grados | | | | |
| VF-18 | RF-16 | N1 | Jugar el grado 1 de un juego con menos de 80 % de aciertos y después con 80 % o más | Con menos de 80 % el grado 2 sigue bloqueado; con 80 % o más se habilita | | | | |
| VF-19 | RF-17 | N1 | Desde la cuenta del niño, jugar un juego en la práctica en casa | La partida se registra como práctica; el niño no ve resultados de evaluaciones | | | | |
| VF-20 | RF-18 | P1 | Abrir el entrenamiento de N1 en modo en consulta y jugar una partida | La partida se registra como consulta | | | | |
| VF-21 | RF-20 | P1 | Ver el historial de partidas de N1 | Aparecen las partidas de VF-19 y VF-20, cada una con su origen | | | | |
| VF-22 | RF-21 | N1 | En un juego, responder una vez bien y una vez mal | Lex y Lumo responden a cada intento | | | | |
| VF-23 | RF-22 | P1 | Abrir la última evaluación de un niño de primeros lectores | Cada bloque muestra su franja o "Sin franja de referencia" | | | | |
| VF-24 | RF-23 | P1 | Abrir el detalle de N2, sección "Franjas y recomendación" | Aparecen los bloques en "intermedio" y "a observar", en el orden del test, con sus juegos | | | | |
| VF-25 | RF-24 | P1 | Abrir el detalle de N1 | Muestra el historial de evaluaciones y de entrenamientos | | | | |
| VF-26 | RF-28 | N1 | Abrir el perfil desde la cuenta del niño | No muestra resultados de evaluaciones ni progreso del entrenamiento | | | | |
| VF-27 | RF-30 | P2, N1 | P2 invita a N1 y el tutor acepta sin compartir lo registrado por otros profesionales; después el tutor da de baja ese vínculo, P2 invita de nuevo y el tutor acepta compartiendo | Sin compartir, P2 no ve las evaluaciones que tomó P1; compartiendo, sí | | | | |
| VF-28 | RF-09, RF-29 | N1, P1 | El tutor da de baja el vínculo con P1, con su contraseña | P1 deja de ver a N1 y no accede a su detalle ni a las evaluaciones que tomó | | | | |
| VF-29 | RF-06 | Niño de prueba | El tutor elimina la cuenta con su contraseña | La cuenta no puede iniciar sesión y el niño desaparece de la lista de sus profesionales | | | | |
| VF-30 | RNF-07 | P1 | Repetir VF-13 y VF-20 en una pantalla de 375 px de ancho | Se completan sin elementos cortados ni desplazamiento horizontal | | | | |
