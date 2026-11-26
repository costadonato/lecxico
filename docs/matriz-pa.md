# Matriz de protección de acceso (PA)

Matriz definida por el equipo a partir de la propuesta V6.1, sección 6.3. Cada escenario SQL de acceso indebido lleva su código.

| ID | Escenario de acceso indebido |
| --- | --- |
| PA-01 | Usuario sin sesión |
| PA-02 | Cuenta de niño que intenta ver datos de otro niño |
| PA-03a | Sesión abierta que intenta aceptar una invitación sin la contraseña o llamando directamente a las funciones |
| PA-03b | Ídem, dar de baja un vínculo |
| PA-03c | Ídem, modificar la etapa escolar |
| PA-03d | Ídem, pedir el informe (S17) |
| PA-03e | Ídem, eliminar la cuenta |
| PA-04 | Acceso al enlace del informe sin sesión, con otra cuenta o vencido (S17) |
| PA-05 | Profesional sin vínculo que intenta leer datos del niño |
| PA-06 | Profesional con la invitación pendiente |
| PA-07 | Profesional con el vínculo dado de baja, incluidas las evaluaciones que tomó |
| PA-08 | Profesional que intenta ver lo registrado por otro sin que el tutor lo haya compartido |
| PA-09 | Cuenta de niño que intenta modificar resultados ya registrados |
| PA-10 | Cuenta de niño que intenta asignarse un grado sin cumplir la regla de desbloqueo |
| PA-11 | Profesional sin vínculo activo que intenta crear tareas o evaluaciones |
| PA-12 | Cuenta de niño que intenta leer sus propias evaluaciones o partidas (definición del 14/10) |
| PA-13 | Escrituras indebidas sobre el perfil (compromiso, rol, práctica registrada por un profesional) |
| PA-14 | Uso indebido de las invitaciones |
| PA-15 | Profesional que intenta modificar o borrar una evaluación o una partida registrada |
