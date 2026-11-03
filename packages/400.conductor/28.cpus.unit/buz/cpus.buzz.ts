import { execSync } from 'node:child_process'
import os from 'node:os'
import { CpusModel } from '../cpus.model.js'
import CpusBit from '../fce/cpus.bit.js'
import State from '../../99.core/state.js'

export const checkIsolateEnvironment = (): void => {
    const nav = (
        globalThis as unknown as { navigator?: { userAgent?: string } }
    ).navigator
    if (nav?.userAgent && nav.userAgent.includes('Cloudflare-Workers')) {
        process.stderr.write(
            '>> [PRE-FLIGHT] [FAIL] Cloudflare Worker isolate detected. Rig 1 requires local POSIX execution.\n',
        )
        throw new Error('ISOLATE_ENVIRONMENT_DETECTED')
    }
}

export const checkComputeResources = (
    minCores = 4,
    minMemBytes = 7 * 1024 * 1024 * 1024,
): { cores: number; mem: number } => {
    const cpus = os.cpus()
    const totalMem = os.totalmem()

    if (cpus.length < minCores || totalMem < minMemBytes) {
        const memGb = Math.round(totalMem / (1024 * 1024 * 1024))
        process.stderr.write(
            `>> [PRE-FLIGHT] [FAIL] Insufficient Host Compute. Required: >= ${minCores} cores, >= 8GB RAM. Found: ${cpus.length} cores, ${memGb}GB RAM.\n`,
        )
        throw new Error('INSUFFICIENT_HARDWARE_RESOURCES')
    }

    return { cores: cpus.length, mem: totalMem }
}

export const checkRequiredBinaries = (): {
    ffprobeVersion: string
    gitVersion: string
} => {
    let ffprobeVersion = ''
    let gitVersion = ''

    try {
        ffprobeVersion =
            execSync('ffprobe -version', {
                stdio: ['ignore', 'pipe', 'ignore'],
            })
                .toString('ascii')
                .split('\n')[0]
                ?.trim() || 'UNKNOWN'
    } catch (_e) {
        process.stderr.write(
            '>> [PRE-FLIGHT] [FAIL] ffprobe binary missing from $PATH. Aborting.\n',
        )
        throw new Error('FFPROBE_BINARY_MISSING')
    }

    try {
        gitVersion = execSync('git --version', {
            stdio: ['ignore', 'pipe', 'ignore'],
        })
            .toString('ascii')
            .trim()
    } catch (_e) {
        process.stderr.write(
            '>> [PRE-FLIGHT] [FAIL] git binary missing from $PATH. Aborting.\n',
        )
        throw new Error('GIT_BINARY_MISSING')
    }

    return { ffprobeVersion, gitVersion }
}

export const initCpus = (cpy: CpusModel, bal: CpusBit, _ste: State) => {
    if (bal.slv) bal.slv({ cpusBit: { idx: 'init-cpus', val: 1 } })
    return cpy
}

export const verifyHardwarePreflight = (
    cpy: CpusModel,
    bal: CpusBit,
    _ste: State,
) => {
    const cns = '>> [PRE-FLIGHT]'

    try {
        checkIsolateEnvironment()
        const { cores, mem } = checkComputeResources()
        const { ffprobeVersion, gitVersion } = checkRequiredBinaries()

        cpy.cores = cores
        cpy.totalMemoryBytes = mem
        cpy.ffprobeVersion = ffprobeVersion
        cpy.gitVersion = gitVersion
        cpy.verified = true

        process.stdout.write(
            `${cns} [OK] Rig 1 Host Verified. Cores: ${cores} | RAM: ${Math.round(mem / (1024 * 1024 * 1024))}GB | ffprobe: ${ffprobeVersion} | git: ${gitVersion}\n`,
        )

        if (bal.slv) {
            bal.slv({
                cpusBit: {
                    idx: 'verify-hardware-preflight',
                    val: 1,
                    dat: {
                        cores,
                        totalMemoryBytes: mem,
                        ffprobeVersion,
                        gitVersion,
                    },
                },
            })
        }
    } catch (err: any) {
        if (bal.slv) {
            bal.slv({
                cpusBit: {
                    idx: 'verify-hardware-preflight-error',
                    val: 0,
                    src: err.message,
                },
            })
        } else {
            process.exit(1)
        }
    }

    return cpy
}
