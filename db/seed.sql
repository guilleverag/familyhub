-- Datos iniciales para la base de datos D1 de FamilyHub

-- 1. Insertar Miembros
INSERT OR IGNORE INTO members (id, name, color, textColor, isSpecial) VALUES
('mem-dani', 'DANI', '#4ade80', '#052e16', 0),
('mem-guille', 'GUILLE', '#60a5fa', '#1e3a8a', 0),
('mem-santiago', 'SANTIAGO', '#f87171', '#450a0a', 0),
('mem-mathias', 'MATHIAS', '#c084fc', '#3b0764', 0),
('mem-mixto', 'MIXTO', '#facc15', '#422006', 1),
('mem-solos', 'SOLOS', '#fb923c', '#431407', 1),
('mem-familia', 'FAMILIA', '#f472b6', '#500724', 1);

-- 2. Insertar Actividades
INSERT OR IGNORE INTO activities (id, name, slot, sortOrder) VALUES
-- MAÑANA
('act-1', 'COLEGIO SANTIAGO (ENTRADA)', 'MAÑANA', 1),
('act-2', 'COLEGIO MATHIAS (ENTRADA)', 'MAÑANA', 2),
('act-3', 'TENDER CAMAS', 'MAÑANA', 3),
('act-4', 'SACAR MAX MAÑANA', 'MAÑANA', 4),
('act-5', 'COCINAR DESAYUNO', 'MAÑANA', 5),
('act-6', 'LAVAR PLATOS DESAYUNO', 'MAÑANA', 6),
('act-7', 'GUARDAR PLATOS DESAYUNO', 'MAÑANA', 7),
('act-8', 'LIMPIAR MESA', 'MAÑANA', 8),

-- TARDE
('act-9', 'COMIDA MAX SOPA', 'TARDE', 9),
('act-10', 'COCINAR ALMUERZO', 'TARDE', 10),
('act-11', 'LAVAR PLATOS ALMUERZO', 'TARDE', 11),
('act-12', 'GUARDAR PLATOS ALMUERZO', 'TARDE', 12),
('act-13', 'LIMPIAR COCINA GAS', 'TARDE', 13),
('act-14', 'LIMPIAR MESA', 'TARDE', 14),
('act-15', 'COLEGIO MATHIAS (SALIDA)', 'TARDE', 15),
('act-16', 'BAÑAR BEBE', 'TARDE', 16),
('act-17', 'TAREAS SANTI', 'TARDE', 17),
('act-18', 'TIEMPO CALIDAD MATHI', 'TARDE', 18),
('act-19', 'TIEMPO CALIDAD SANTI', 'TARDE', 19),

-- NOCHE
('act-20', 'COCINAR CENA', 'NOCHE', 20),
('act-21', 'LAVAR PLATOS CENA', 'NOCHE', 21),
('act-22', 'GUARDAR PLATOS CENA', 'NOCHE', 22),
('act-23', 'SACAR MAX NOCHE', 'NOCHE', 23),
('act-24', 'DORMIR BEBE', 'NOCHE', 24),
('act-25', 'ORDENAR SALA', 'NOCHE', 25),
('act-26', 'LIMPIAR BAÑOS', 'NOCHE', 26),
('act-27', 'LIMPIAR DUCHAS', 'NOCHE', 27),
('act-28', 'BARRER LA CASA', 'NOCHE', 28),
('act-29', 'COLETO LA CASA', 'NOCHE', 29),
('act-30', 'BOTAR BASURA', 'NOCHE', 30),
('act-31', 'LAVAR ROPA', 'NOCHE', 31),
('act-32', 'TENDER ROPA', 'NOCHE', 32),
('act-33', 'GUARDAR ROPA', 'NOCHE', 33);

-- 3. Insertar Programación Fija
INSERT OR IGNORE INTO schedule (activityId, dayOfWeek, memberId) VALUES
('act-1', 'LUNES', 'mem-dani'), ('act-1', 'MARTES', 'mem-dani'), ('act-1', 'MIERCOLES', 'mem-guille'), ('act-1', 'JUEVES', 'mem-guille'), ('act-1', 'VIERNES', 'mem-dani'),
('act-2', 'LUNES', 'mem-dani'), ('act-2', 'MARTES', 'mem-guille'), ('act-2', 'MIERCOLES', 'mem-guille'), ('act-2', 'JUEVES', 'mem-guille'), ('act-2', 'VIERNES', 'mem-dani'),
('act-3', 'LUNES', 'mem-dani'), ('act-3', 'MARTES', 'mem-dani'), ('act-3', 'MIERCOLES', 'mem-dani'), ('act-3', 'JUEVES', 'mem-dani'), ('act-3', 'VIERNES', 'mem-dani'), ('act-3', 'SABADO', 'mem-mixto'), ('act-3', 'DOMINGO', 'mem-mixto'),
('act-4', 'LUNES', 'mem-dani'), ('act-4', 'MARTES', 'mem-dani'), ('act-4', 'MIERCOLES', 'mem-guille'), ('act-4', 'JUEVES', 'mem-guille'), ('act-4', 'VIERNES', 'mem-dani'), ('act-4', 'SABADO', 'mem-guille'), ('act-4', 'DOMINGO', 'mem-guille'),
('act-5', 'LUNES', 'mem-guille'), ('act-5', 'MARTES', 'mem-dani'), ('act-5', 'MIERCOLES', 'mem-guille'), ('act-5', 'JUEVES', 'mem-dani'), ('act-5', 'VIERNES', 'mem-guille'),
('act-6', 'LUNES', 'mem-guille'), ('act-6', 'MARTES', 'mem-dani'), ('act-6', 'MIERCOLES', 'mem-guille'), ('act-6', 'JUEVES', 'mem-dani'), ('act-6', 'VIERNES', 'mem-guille'),
('act-7', 'LUNES', 'mem-guille'), ('act-7', 'MARTES', 'mem-dani'), ('act-7', 'MIERCOLES', 'mem-guille'), ('act-7', 'JUEVES', 'mem-dani'), ('act-7', 'VIERNES', 'mem-guille'),
('act-8', 'LUNES', 'mem-guille'), ('act-8', 'MARTES', 'mem-dani'), ('act-8', 'MIERCOLES', 'mem-guille'), ('act-8', 'JUEVES', 'mem-dani'), ('act-8', 'VIERNES', 'mem-guille'), ('act-8', 'SABADO', 'mem-santiago'), ('act-8', 'DOMINGO', 'mem-santiago'),

('act-10', 'LUNES', 'mem-dani'), ('act-10', 'MARTES', 'mem-guille'), ('act-10', 'MIERCOLES', 'mem-dani'), ('act-10', 'JUEVES', 'mem-guille'), ('act-10', 'VIERNES', 'mem-dani'),
('act-11', 'LUNES', 'mem-dani'), ('act-11', 'MARTES', 'mem-guille'), ('act-11', 'MIERCOLES', 'mem-dani'), ('act-11', 'JUEVES', 'mem-guille'), ('act-11', 'VIERNES', 'mem-dani'),
('act-12', 'LUNES', 'mem-dani'), ('act-12', 'MARTES', 'mem-guille'), ('act-12', 'MIERCOLES', 'mem-dani'), ('act-12', 'JUEVES', 'mem-guille'), ('act-12', 'VIERNES', 'mem-dani'),
('act-13', 'LUNES', 'mem-dani'), ('act-13', 'MARTES', 'mem-guille'), ('act-13', 'MIERCOLES', 'mem-dani'), ('act-13', 'JUEVES', 'mem-guille'), ('act-13', 'VIERNES', 'mem-dani'),
('act-14', 'LUNES', 'mem-santiago'), ('act-14', 'MARTES', 'mem-santiago'), ('act-14', 'MIERCOLES', 'mem-santiago'), ('act-14', 'JUEVES', 'mem-santiago'), ('act-14', 'VIERNES', 'mem-santiago'), ('act-14', 'SABADO', 'mem-santiago'), ('act-14', 'DOMINGO', 'mem-santiago'),
('act-15', 'LUNES', 'mem-guille'), ('act-15', 'MARTES', 'mem-dani'), ('act-15', 'MIERCOLES', 'mem-dani'), ('act-15', 'JUEVES', 'mem-dani'), ('act-15', 'VIERNES', 'mem-guille'),
('act-16', 'LUNES', 'mem-guille'), ('act-16', 'MARTES', 'mem-dani'), ('act-16', 'MIERCOLES', 'mem-dani'), ('act-16', 'JUEVES', 'mem-guille'),
('act-17', 'LUNES', 'mem-guille'), ('act-17', 'MARTES', 'mem-dani'), ('act-17', 'MIERCOLES', 'mem-guille'), ('act-17', 'JUEVES', 'mem-dani'),
('act-18', 'LUNES', 'mem-solos'), ('act-18', 'MARTES', 'mem-dani'), ('act-18', 'MIERCOLES', 'mem-guille'), ('act-18', 'JUEVES', 'mem-solos'), ('act-18', 'VIERNES', 'mem-familia'), ('act-18', 'SABADO', 'mem-solos'), ('act-18', 'DOMINGO', 'mem-familia'),
('act-19', 'LUNES', 'mem-solos'), ('act-19', 'MARTES', 'mem-dani'), ('act-19', 'MIERCOLES', 'mem-guille'), ('act-19', 'JUEVES', 'mem-solos'), ('act-19', 'VIERNES', 'mem-familia'), ('act-19', 'SABADO', 'mem-solos'), ('act-19', 'DOMINGO', 'mem-familia'),

('act-20', 'LUNES', 'mem-guille'), ('act-20', 'MARTES', 'mem-dani'), ('act-20', 'MIERCOLES', 'mem-guille'), ('act-20', 'JUEVES', 'mem-dani'), ('act-20', 'VIERNES', 'mem-guille'),
('act-21', 'LUNES', 'mem-guille'), ('act-21', 'MARTES', 'mem-dani'), ('act-21', 'MIERCOLES', 'mem-guille'), ('act-21', 'JUEVES', 'mem-dani'), ('act-21', 'VIERNES', 'mem-guille'),
('act-22', 'LUNES', 'mem-guille'), ('act-22', 'MARTES', 'mem-dani'), ('act-22', 'MIERCOLES', 'mem-guille'), ('act-22', 'JUEVES', 'mem-dani'), ('act-22', 'VIERNES', 'mem-guille'),
('act-23', 'LUNES', 'mem-guille'), ('act-23', 'MARTES', 'mem-guille'), ('act-23', 'MIERCOLES', 'mem-dani'), ('act-23', 'JUEVES', 'mem-dani'), ('act-23', 'VIERNES', 'mem-guille'), ('act-23', 'SABADO', 'mem-dani'), ('act-23', 'DOMINGO', 'mem-dani'),
('act-24', 'LUNES', 'mem-dani'), ('act-24', 'MARTES', 'mem-dani'), ('act-24', 'MIERCOLES', 'mem-guille'), ('act-24', 'JUEVES', 'mem-guille'), ('act-24', 'VIERNES', 'mem-dani'), ('act-24', 'DOMINGO', 'mem-guille'),
('act-25', 'LUNES', 'mem-mathias'), ('act-25', 'MARTES', 'mem-mathias'), ('act-25', 'MIERCOLES', 'mem-mathias'), ('act-25', 'JUEVES', 'mem-mathias'), ('act-25', 'VIERNES', 'mem-mathias'), ('act-25', 'SABADO', 'mem-mathias'), ('act-25', 'DOMINGO', 'mem-mathias'),
('act-26', 'DOMINGO', 'mem-guille'),
('act-27', 'LUNES', 'mem-dani'),
('act-28', 'LUNES', 'mem-dani'), ('act-28', 'SABADO', 'mem-dani'),
('act-29', 'LUNES', 'mem-dani'), ('act-29', 'SABADO', 'mem-dani'),
('act-30', 'MARTES', 'mem-guille'), ('act-30', 'VIERNES', 'mem-guille'),
('act-31', 'MARTES', 'mem-guille'), ('act-31', 'JUEVES', 'mem-guille'), ('act-31', 'SABADO', 'mem-guille'),
('act-32', 'MARTES', 'mem-dani'), ('act-32', 'JUEVES', 'mem-dani'), ('act-32', 'SABADO', 'mem-dani'),
('act-33', 'MIERCOLES', 'mem-dani'), ('act-33', 'VIERNES', 'mem-dani'), ('act-33', 'DOMINGO', 'mem-dani');
