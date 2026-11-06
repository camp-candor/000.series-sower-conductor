export const sanitizeTo7BitAscii = (input: string): string => {
    return input
        .replace(/[\u2018\u2019]/g, "'") // smart single quotes
        .replace(/[\u201C\u201D]/g, '"') // smart double quotes
        .replace(/[\u2013\u2014]/g, '-') // en/em dashes
        .replace(/[^\x20-\x7E\r\n\t]/g, '') // strip remaining non-ASCII & emojis
}

export const formatTelemetryLine = (
    prefix: string,
    message: string,
    status: 'OK' | 'FAIL' | 'INFO' | 'WARN' = 'OK',
): string => {
    const cleanMsg = sanitizeTo7BitAscii(message)
    switch (status) {
        case 'OK':
            return `>> [${prefix}] [OK] ${cleanMsg}`
        case 'FAIL':
            return `:: [${prefix}] [FAIL] ${cleanMsg}`
        case 'WARN':
            return `:: [${prefix}] [WARN] ${cleanMsg}`
        default:
            return `>> [${prefix}] ${cleanMsg}`
    }
}

export const streamConsoleTelemetry = async (
    message: string,
    targetPane = 'cns00',
): Promise<void> => {
    const sanitized = sanitizeTo7BitAscii(message)
    if (global.LIBRARY) {
        await global.LIBRARY.hunt('[Console action] Update Console', {
            idx: targetPane,
            src: sanitized,
        })
    } else {
        // Headless / fallback output
        process.stdout.write(`${sanitized}\n`)
    }
}
