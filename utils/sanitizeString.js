// Helper function to sanitize table names
export const sanitizeStringVariables = (name) => {
    if (typeof name !== 'string') {
      name = String(name)
    }
    // return name.trim().replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
    return name.trim().replace(/[^a-zA-Z0-9_]/g, '_')
  }