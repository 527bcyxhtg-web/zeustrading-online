export function auditLogEntry(eventType, payload = {}) {
  return {
    id: crypto.randomUUID(),
    eventType,
    payload,
    createdAt: new Date().toISOString(),
  };
}
