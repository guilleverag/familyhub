-- Base de Datos D1 para FamilyHub
-- Tabla de Miembros
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  textColor TEXT NOT NULL,
  isSpecial INTEGER NOT NULL DEFAULT 0
);

-- Tabla de Actividades
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slot TEXT NOT NULL,
  sortOrder INTEGER NOT NULL
);

-- Tabla de Programación (Asignaciones de Horario)
CREATE TABLE IF NOT EXISTS schedule (
  activityId TEXT NOT NULL,
  dayOfWeek TEXT NOT NULL,
  memberId TEXT NOT NULL,
  PRIMARY KEY (activityId, dayOfWeek),
  FOREIGN KEY (activityId) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE
);

-- Tabla de Registro de Completados por Fecha ISO (Sincronización multi-dispositivo)
CREATE TABLE IF NOT EXISTS completions (
  dateISO TEXT NOT NULL,
  activityId TEXT NOT NULL,
  dayOfWeek TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 1,
  completedBy TEXT NOT NULL,
  completedAt TEXT,
  notes TEXT,
  PRIMARY KEY (dateISO, activityId),
  FOREIGN KEY (activityId) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (completedBy) REFERENCES members(id) ON DELETE CASCADE
);
