export function extractTenantFromEmail(email) {
  const domainPart = email.split("@")[1]; // e.g., admin.app or kimaru.sch
  return domainPart.split(".")[0]; // e.g., "admin" or "kimaru"
}
