export function logLaunchInfo(event: string, data: Record<string, unknown>) {
  console.info(`[launch] ${event}`, data);
}

export function logLaunchWarn(event: string, data: Record<string, unknown>) {
  console.warn(`[launch] ${event}`, data);
}

export function logLaunchError(event: string, data: Record<string, unknown>) {
  console.error(`[launch] ${event}`, data);
}
