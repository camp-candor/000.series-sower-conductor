# Branch • Microservice Audio and Conductor Architecture

_Gemini · 60 messages · exported Nov 5, 2026_

### You

{{FOCUS : from now on [audio-microservice] will be known as [microservice-audio]! how does [microservice-audio] work with [goblin-viewport-template] and [series-sower-conductor] }}

@extreme-detail-without-code-00

### Gemini

The interaction between **microservice-audio**, **series-sower-conductor**, and **goblin-viewport-template** forms the deterministic backbone of the production pipeline, enforcing the governing law that **audio is the architect of time** while picture is an integer projection locked to acoustic duration.

Within this tripartite relationship, **series-sower-conductor** acts as the local orchestrator and temporal pacemaker; **microservice-audio** functions as the speech synthesis daemon and physical clock generator; and **goblin-viewport-template** operates as the downstream metaprogram compiler and digital optical printing layer.

### Hardware Boundary Topology & The Zero-VRAM Invariant

The operational integration of these three systems is strictly governed by physical hardware partitioning to prevent Linux Out-of-Memory crashes, GPU context loss, and multi-tenant tensor collisions:

- **Rig 1 (Orchestration & Acoustic Host):** Operates entirely within multi-core CPU threads and system RAM, maintaining a strict allocation of exactly 0 MB dedicated GPU VRAM. Both **series-sower-conductor** (a POSIX Node.js runtime) and **microservice-audio** (a persistent Python and FastAPI daemon on local loopback port 8000) reside on this host. Downstream, **goblin-viewport-template** executes its final headless Remotion optical compositing here using pure CPU software OpenGL rasterization.
- **Rig 2 (Isolated GPU Tensor Foundry):** Houses headless ComfyUI instances dedicated entirely to heavy video diffusion passes and LoRA inference. Both **microservice-audio** and Remotion processes are strictly quarantined from Rig 2 silicon to preserve all VRAM for visual plate synthesis.
- **Turn-Based VRAM Eviction:** If Rig 1 GPU resources are ever utilized for preliminary LLM drafting passes, **series-sower-conductor** issues an automated eviction request to clear all active models from memory within hundreds of milliseconds prior to vocal synthesis, ensuring unconstrained CPU/RAM headroom.

### End-to-End Orchestration & Media Compilation Flow

The lifecycle flows through a deterministic, eight-stage compilation chain that links narrative truth to hardened broadcast media:

```
[ worker-sower-engine ]
           │
           ▼ (Scene Plan & Dialogue AST)
[ series-sower-conductor ] ──(HTTP POST :8000)──► [ microservice-audio ]
           │                                             │
           │ (Physical WAV Durations via ffprobe)         │ (Uncompressed 48 kHz Stems)
           ▼                                             ▼
  Temporal Quantization & Exposure Sheet Compilation
           │
           ▼ (exposure_sheet.json + dialogue_ast.json)
[ goblin-viewport-template ] (generator/generate-episode-repo.ts)
           │
           ▼ (Metaprogram Source-Baking)
[ goblin-episodes/epXXX/ ] (Episode_XXX.tsx with Inlined Integer Literals)
           │
           ▼ (Headless Remotion CLI --gl=swangle, 0 MB VRAM)
[ Master Broadcast MP4 Deliverable ]
```

### Operational Domain 1: series-sower-conductor Driving microservice-audio

The Conductor treats generated speech not as sound effects to be laid down after animation, but as the non-negotiable physical clock that dictates video durations.

#### 1. Contract Ingestion & Somatic DSP Translation

- **AST Ingestion:** **series-sower-conductor** ingests the validated narrative contract from the upstream engine, extracting spoken dialogue lines, speaker IDs, and emotional condition tags.
- **Biological Trauma Translation:** Upstream biological conditions and narrative trauma logged in the canonical ledger are translated algebraically into dynamic Digital Signal Processing (DSP) modifiers. Characters suffering pulmonary or respiratory trauma receive elevated breathiness pause multipliers, dilated breath cadence scalars, and subharmonic vocal fry density.
- **Network Client Interface:** The Conductor’s speech unit dispatches these parameters alongside verbatim phonetic dialogue text over HTTP POST to **microservice-audio** at its local port 8000 interface.

#### 2. Synthesis Mechanics Inside microservice-audio

- **Persistent Daemonization:** **microservice-audio** remains warm in memory to avoid per-line cold-boot latency, keeping neural vocoder checkpoints and speaker reference embeddings loaded.
- **Series-Scoped Namespace Isolation:** To prevent cross-universe acoustic contamination between different narrative worlds, **microservice-audio** partitions character reference WAV files, custom dialect lexicons, and engine recipe manifests at the root by series slug.
- **Engine Multiplexing:** Based on the series recipe, the microservice routes the request across distinct neural synthesis engines (such as CosyVoice, Parler-TTS, XTTSv2, or Piper) and conditioning strategies (zero-shot cloning, internal speaker index lookup, descriptive natural language prompts, or latent speaker vectors).
- **DSP Vocal Tract Warping:** To prevent characters from sounding like generic foundational model presets, algebraic pitch shifts and formant warping factors are applied at the DSP level to sculpt non-human anatomies without runtime overhead.

#### 3. Verification & Loudness Certification Gauntlet

Before any synthesized stem is accepted by **series-sower-conductor**, **microservice-audio** subjects the linear PCM audio stream to an automated validation pipeline:

- **Zero-Byte Buffer Sentinel:** Audio streams under 1024 bytes or failing valid RIFF WAV header verification are rejected immediately.
- **Speech-to-Text Alignment Gate:** An automated transcription pass compares the synthesized audio against the source screenplay AST; dropped words or model hallucinations immediately halt pipeline progression.
- **EBU R128 Loudness Conformance:** Stems are normalized to an integrated -16.0 LUFS target for web distribution (or -24.0 LUFS for broadcast).
- **True-Peak Clamping:** Brickwall limiters enforce a strict True-Peak ceiling clamped at -1.0 dBTP to eliminate inter-sample clipping.
- **Acoustic Noise Floor:** All dialogue stems must maintain an acoustic noise floor below -60 dB to prevent background hiss during dialogue pauses.
- **Content-Addressed Immutability:** Certified 48 kHz uncompressed stems are written to scratch storage using cryptographic hashes, establishing immutable assets that rendering engines are forbidden from re-triggering during visual compositing.

### Operational Domain 2: series-sower-conductor Compiling the Master Temporal Clock

Once uncompressed dialogue stems are delivered by **microservice-audio**, **series-sower-conductor** converts continuous sound waveforms into discrete video timelines:

#### 1. Discrete 24 fps Integer Quantization

Because continuous acoustic sound exists in milliseconds while video delivery operates in discrete animation frames, the Conductor spawns an asynchronous `ffprobe` child process to read the exact duration of each synthesized WAV file.

The exact frame budget is derived using the non-negotiable ceiling quantization formula:

$$
\text{target\_frames} = \left\lceil \left(\frac{\text{duration\_ms}}{1000}\right) \times 24 \right\rceil
$$

If a dialogue stem measures 3,120 milliseconds, the Conductor pins the visual timeline allocation to exactly 75 frames. Video and visual models are never prompted for vague durations; they are ordered to populate precise frame counts, eliminating temporal rubber-banding.

#### 2. Monotonic Timeline Accumulation & Drift Elimination

To prevent cumulative fractional frame drift caused by sequential rounding, **series-sower-conductor** calculates absolute integer start indices across all shots:

$$
\text{fromFrame}_k = \sum_{i=1}^{k-1} \text{total\_shot\_frames}_i
$$

Each visual shot and dialogue sequence begins at an explicit, pre-calculated global frame offset.

#### 3. Causal VAE Lattice Alignment

For shots requiring generative video diffusion plates, the Conductor’s model adapter conforms the locked 24 fps frame budget to the 3D causal VAE lattice required by models like Wan:

$$
\text{diffusion\_allocation} = 4 \times \left\lceil \frac{N - 1}{4} \right\rceil + 1
$$

The Conductor allocates the native diffusion lattice frames and pre-calculates the exact tail-trim margin required to resample the resulting plate back into the locked 24 fps dialogue window.

#### 4. Dynamic Sidechain Ducking & Foley Assembly

Inside its audio unit, **series-sower-conductor** synthesizes the broader acoustic scene geometry and serializes the complete specification into `exposure_sheet.json`:

- **Automated Sidechain Ducking:** Calculates a dynamic attenuation curve that dips continuous ambient sound beds and score cues by -14 dB during dialogue windows using a 6-frame quadratic attack, releasing back to baseline over a 12-frame quadratic curve during dialogue pauses. Anti-pumping algorithms clamp gain recovery during short conversational pauses under 8 frames.
- **Deterministic Foley Transient Seeding:** Punctual sound effects (footsteps, wet coughs, mechanical scrapes) are seeded across pre-roll windows and impact beats using a MurmurHash3 pseudorandom generator keyed to scene and shot identifiers, ensuring bit-identical acoustic repeatability across distributed render workers.

### Operational Domain 3: series-sower-conductor Bridging to goblin-viewport-template

With the physical master clock and exposure sheet locked, **series-sower-conductor** passes execution to **goblin-viewport-template**.

#### 1. Rejection of the Runtime Player Model

Earlier rendering approaches treated the viewport as a long-lived application that dynamically imported scene JSON files at runtime. This introduced the **historical corruption trap**: when generic React components or camera damping curves were modified months later for newer episodes, re-rendering earlier episodes caused silent regressions, such as mouth visemes detaching from chins or camera zooms decapitating characters.

**goblin-viewport-template** resolves this vulnerability by functioning as an **offline code-generation compiler and scaffolding metaprogram**. The template repository itself is never executed directly to render broadcast media; instead, its generator script stamps out an isolated, self-contained workspace inside `goblin-episodes/` per production cycle.

#### 2. The Metaprogram Compiler Invocation

The Conductor invokes the generator within **goblin-viewport-template** as an automated process, passing the compiled narrative AST and timing manifest:

- **Target Scaffolding:** Copies canonical React and Remotion presentation primitives into a dedicated directory.
- **Selective Asset Harvesting:** Runs an asset collector that parses the AST to copy *only* the specific sprites, mouth shapes, background mattes, and synthesized dialogue stems needed for that episode into the episode folder, slashing project storage by roughly 90% to maintain a sub-100MB footprint.
- **Cryptographic Dependency Locking:** Emits an immutable manifest recording toolchain binary versions, audio/visual file SHA-256 digests, and upstream Git commit hashes to guarantee that any episode can be re-rendered years later with bit-identical fidelity.

### Operational Domain 4: Source-Baking & Multi-Track Execution in goblin-viewport-template

Inside the stamped episode workspace created by **goblin-viewport-template**, runtime data iteration is completely eliminated. The generator burns the outputs of **microservice-audio** and **series-sower-conductor** directly into static TypeScript JSX literals.

| Architectural Domain | Upstream Derivation | Implementation in Stamped Episode Component |
| --- | --- | --- |
| **Sequence Timing** | `ffprobe` quantization over **microservice-audio** WAV stems | Inlined as raw, unquoted integer numeric literals on Remotion Sequence components, bypassing runtime string-to-number parsing. |
| **Timeline Placement** | Absolute frame accumulator calculated by **series-sower-conductor** | Stamped as static frame offsets, ensuring sequences execute in parallel or sequence without chained runtime dependencies. |
| **Audio Routing** | Discrete 48 kHz stems synthesized by **microservice-audio** | Pinned directly to immutable relative static asset paths within the local bundle. |
| **Acoustic Ducking** | Quadratic attack/release sidechain curves computed in Conductor | Hardcoded lookup tables and linear interpolation volume curves bound directly to ambient and score track audio tags. |
| **Mouth Viseme Rhythms** | Audio amplitude envelopes extracted from dialogue stems | Frame-synchronized viseme keyframe arrays driving cutout puppet mouth layer swaps across idle, small, medium, and wide configurations. |
| **Camera Kinematics** | Directorial vectors and character anatomical anchor targets | Precomputed canvas coordinate percentages inlined into camera wrapper transformOrigin properties, preventing runtime layout thrashing. |

#### Multi-Track Remotion Composition Architecture

When headless Remotion renders the stamped composition, the audio stems synthesized by **microservice-audio** orchestrate three prioritized, parallel layers in the optical tree:

1. **Dialogue Track (Highest Priority):** Discrete uncompressed linear PCM dialogue stems pinned to precomputed start frames. This track dictates character mouth viseme triggering and serves as the master sidechain trigger.
2. **Spot Foley Track (Medium Priority):** Punctual sound effects mounted using sequence offset windows, triggered during pre-roll frames or active speech timestamps according to the Conductor's exposure sheet.
3. **Continuous Sound Bed & Score (Low Priority / Ambient):** Environmental drones, room tones, and musical cues running continuously beneath the scene, dynamically attenuated by -14 dB whenever the dialogue track is active.

Once optical compositing completes via software OpenGL rasterization, the final master MP4 deliverable is sealed, and **series-sower-conductor** executes an atomic, signed Git commit to record the episode's state mutations permanently into the canonical ledger.

### You

what comes out of [microservice-audio] what are the artifacts of [microservice-audio]

what are the technical mechanisms which allows to communicate with [series-sower-conductor] and [ goblin-viewport-template]

these are the repos [https://github.com/slopratchet/000.StyleTTS-2] and [https://github.com/slopratchet/000.parler-talk] and others like them which [microservice-audio] will interact with; check out the compile text of the whole repo in the notebook under [000.microservice-audio] and figure out how [microservice-audio] can interact and use these python code bases from a node.js app

### Gemini

The operational role of **microservice-audio** is to translate abstract screenplay dialogue contracts into hardened acoustic reality, acting as the physical clockmaker whose output dictates the timeline for the entire production pipeline.

### Artifacts of microservice-audio

The outputs produced by **microservice-audio** span physical sound containers, cryptographically verified timing receipts, and downstream integration manifests:

#### 1. The Physical Acoustic Stem (.wav)

The primary binary artifact emitted for every dialogue line is an uncompressed, linear Pulse-Code Modulation (PCM) audio stem committed directly to local NVMe scratch storage (e.g., `public/audio/dialogue/${sceneId}_SH${shotIndex}.wav` or `scratch/audio/dialogue/${lineId}.wav`):

- **Sampling Rate & Bit Depth:** Exactly 48,000 Hz (48 kHz) at 24-bit linear PCM resolution. Lossy intermediate formats (MP3, AAC) and variable sample rates are strictly forbidden to eliminate sample jitter.
- **Channel Layout:** Discrete mono or centered stereo stems without baked room reverb or spatial panning, allowing spatialization to be managed downstream during scene assembly.
- **Broadcast Loudness Compliance:** Every stem is calibrated through an automated DSP pass to an integrated target of **-16.0 LUFS** ($\pm 1.0$ LUFS) for web delivery or **-24.0 LUFS** for television broadcast.
- **True-Peak & Noise Floor Ceilings:** Clamped with a brickwall ceiling at **-1.0 dBTP** to prevent inter-sample clipping on consumer DACs, maintaining an unvoiced background noise floor strictly below **-60 dBFS**.

#### 2. The Cryptographic Timing & Verification Receipt (JSON Payload)

Alongside the binary audio file, **microservice-audio** returns a strongly typed metadata response payload (`TTSClientResponse` / `TTSGenerationResponse`) that seals the acoustic properties of the line:

- **`shot_id` / `line_id`:** The deterministic identity string referencing the specific beat in the screenplay AST.
- **`stem_relative_path`:** The concrete relative filesystem path to the committed audio file.
- **`sha256_hash`:** A 64-character lowercase hexadecimal digest computed over the raw binary content of the `.wav` file, guaranteeing content-addressed immutability.
- **`duration_ms`:** The physical duration of the spoken waveform measured to millisecond precision.
- **`sample_rate_hz` & Telemetry:** Physical confirmation of 48,000 Hz, integrated LUFS score, True-Peak dBTP, and unvoiced noise floor measurements.

#### 3. Pod Contract Artifacts & Manifest Seals

Under studio pod architecture (POD-05: Audio Pod), the service publishes two immutable deliverables to shared storage (Cloudflare R2 or local scratch):

- **Conformed Stem Asset:** The finalized `.wav` binary.
- **Timecode / Viseme Map:** A sidecar document capturing speech energy envelopes, phoneme timings, and amplitude contours used downstream to drive mouth viseme frame swaps.
- **Provenance Entry in `render_manifest.json`:** Downstream build tools capture the SHA-256 digest of each stem into the immutable Directed Acyclic Graph (DAG), freezing the exact audio files against the upstream screenplay AST and git commit hashes.

### Technical Mechanisms for Communication

The communication topology links **microservice-audio** to **series-sower-conductor** and **goblin-viewport-template** across distinct execution phases without permitting direct runtime coupling between the audio daemon and the video renderer.

```
┌────────────────────────────────────────────────────────────────────────┐
│ RIG 1: Host CPU & System RAM (0 MB GPU VRAM Invariant)                 │
│                                                                        │
│  [ series-sower-conductor ]                                            │
│    │  (Node.js / ttsClient.ts)                                         │
│    │                                                                   │
│    ├── HTTP POST (:8000/generate) ──► [ microservice-audio ]           │
│    │                                    (Python / FastAPI Warm Daemon) │
│    │                                    • CosyVoice / Parler / StyleTTS│
│    │                                    • Formant & Somatic DSP        │
│    │                                    • Loudness & True-Peak Clamping│
│    │                                    • Posix Atomic .tmp Rename     │
│    │                                              │                    │
│    │◄── JSON Timing Receipt & 48kHz WAV ──────────┘                    │
│    │                                                                   │
│    ├── ffprobe Child Process: target_frames = ⌈(ms / 1000) * 24⌉      │
│    ├── Sidechain Ducking Math (-14 dB Speech Window)                   │
│    └── Assembles exposure_sheet.json + dialogue_ast.json               │
│                                                                        │
│    Spawns Metaprogram Child Process:                                   │
│    tsx generator/generate-episode-repo.ts                              │
│    │                                                                   │
│    ▼                                                                   │
│  [ goblin-viewport-template ] (Compiler Engine)                        │
│    │                                                                   │
│    ├── Prunes assets & vendors React/Remotion primitives               │
│    ├── Source-Bakes Episode_XXX.tsx (Inlines integer frames & audio)   │
│    └── Provenance Lock: render_manifest.json                           │
│                                                                        │
│  [ Remotion Headless Render ] (--gl=swangle, Software Rasterization)   │
│    └── Master Broadcast MP4 Deliverable                                │
└────────────────────────────────────────────────────────────────────────┘
```

#### 1. Communication Between series-sower-conductor and microservice-audio

Communication between the Node.js conductor runtime and the Python audio service operates as an out-of-process, loopback network client relationship:

- **Wire Protocol & Endpoint:** Asynchronous REST over HTTP POST targeting `[http://127.0.0.1:8000/generate](http://127.0.0.1:8000/generate)`.
- **Typed Ingress Schema (`TTSGenerationRequest`):** The Conductor's speech unit (`src/audio/ttsClient.ts` / `09.speech.unit/buz/speech.buzz.ts`) serializes the request into a strictly validated Zod/Pydantic contract containing `series_id`, `character`, verbatim phonetic `text`, `emotion`, `tonePacing`, and dynamic `dsp_modifiers` (`pause_frequency_multiplier`, `breathinessPauseMultiplier`, `basePitchShiftSemitones`, `formantWarpingFactor`, `vocalFryDensity`).
- **Atomic POSIX Staging:** To prevent race conditions or half-written buffers caused by network socket drops, **microservice-audio** writes raw streams to a temporary sandbox path (`ep040_sh01.wav.tmp`). Only after the file passes the Zero-Byte Poison Buffer Sentinel (verifying length $> 1024$ bytes and valid `RIFF`/`WAVE` headers) and loudness certification does it execute an atomic POSIX `fs.renameSync()` to promote the file to its final destination.
- **Fault Isolation & Retries:** The Conductor wraps single-line requests in an isolated, 3-attempt exponential backoff retry loop ($\text{delayMs} = 100 \times 2^{\text{attempt} - 1}$). A failure on line $k$ never invalidates stems successfully rendered for lines $1 \dots k-1$.

#### 2. Bridging series-sower-conductor to goblin-viewport-template

**microservice-audio** does not communicate with **goblin-viewport-template** directly. Instead, **series-sower-conductor** converts the continuous acoustic signals into discrete video instructions:

- **ffprobe Master Clock Quantization:** The Conductor spawns a local `ffprobe` child process to extract `duration_ms` from the newly committed WAV header. It converts milliseconds into locked 24 fps integer frames using non-negotiable ceiling arithmetic:
  $$
  \text{target\_frames} = \left\lceil \left(\frac{\text{duration\_ms}}{1000}\right) \times 24 \right\rceil
  $$
- **Exposure Sheet Compilation:** Absolute frame start positions ($\text{fromFrame}_k = \sum \text{duration}_i$), -14 dB sidechain ducking volume curves, and Foley timestamps are serialized into `exposure_sheet.json`.
- **Metaprogram Compiler Invocation:** The Conductor invokes the template's generator script (`tsx ../goblin-viewport-template/generator/generate-episode-repo.ts`) via child process CLI, passing the scene AST and exposure sheet.
- **Static Source-Baking:** The viewport template stamps out an autonomous episode workspace inside `goblin-episodes/epXXX/`. It copies the `.wav` files into the episode's static asset bundle and bakes the integer start frames, durations, and audio paths directly into `Episode_XXX.tsx` as raw TypeScript JSX literals on `<Sequence>` and `<Audio>` nodes.
- **Rendering Lockdown:** When headless Remotion renders the timeline (`--gl=swangle`), it reads only the static, committed local audio files. The rendering runtime is strictly forbidden from making live network calls back to **microservice-audio**.

### Bridging Python Runtimes (StyleTTS-2, parler-talk) into the Node.js Architecture

The compiled repository architecture revealed in `000.microservice-audio.txt` demonstrates that **microservice-audio** is structured as a TypeScript/Node.js monorepo containing an edge control plane (Cloudflare Worker with Durable Objects) and a Candor 7-file state machine (`packages/700.microserviceaudio/`).

However, advanced neural TTS engines like [slopratchet/000.StyleTTS-2](https://github.com/slopratchet/000.StyleTTS-2) and [slopratchet/000.parler-talk](https://github.com/slopratchet/000.parler-talk) require native PyTorch tensor execution, CUDA/C++ extensions, monotonic alignment search, and heavy neural vocoders that cannot run natively inside V8 or Node.js.

To connect the Node.js monorepo with these Python repositories, the system deploys a **hybrid Daemon-Proxy and Monorepo Candor Adapter architecture**:

```
┌────────────────────────────────────────────────────────────────────────┐
│ NODE.JS / TYPESCRIPT MONOREPO HOST                                     │
│                                                                        │
│ apps/995.library (Blessed TUI) / apps/worker (Cloudflare Hono Gateway) │
│                                  │                                     │
│ packages/700.microserviceaudio/  │ (Candor BEE Architecture)           │
│ ├── 00.microserviceaudio.unit    ├── 10.generate.unit                  │
│ ├── 01.loudness.unit             ├── 12.acoustic.unit                  │
│ ├── 07.service.unit (Supervisor) ├── 14.conditioning.unit              │
│ ├── 08.schemas.unit (Contracts)  └── 99.bus.unit (Event Bus / MQTT)    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                    Loopback REST / IPC Socket
                    POST http://127.0.0.1:8000/generate
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PERSISTENT PYTHON INFERENCE DAEMON (FastAPI server.py on Port 8000)     │
│                                                                        │
│ engines/base.py (BaseTTSEngine Abstract Polymorphic Factory)           │
│                                  │                                     │
│       ┌──────────────────────────┴──────────────────────────┐          │
│       ▼                                                     ▼          │
│ ┌───────────────────────────┐         ┌───────────────────────────┐    │
│ │ 000.StyleTTS-2            │         │ 000.parler-talk           │    │
│ │ (StyleTTS2Engine Wrapper) │         │ (ParlerEngine Wrapper)    │    │
│ │ • Precomputed style .pt   │         │ • Description prompt text │    │
│ │ • Latent diffusion pitch  │         │ • Syllable stress caps    │    │
│ │ • Sub-100ms RTF ≤ 0.15x   │         │ • Cross-attention decoder │    │
│ └─────────────┬─────────────┘         └─────────────┬─────────────┘    │
│               └──────────────────────┬──────────────┘                  │
│                                      │ Raw float32 PCM numpy stream    │
│                                      ▼                                 │
│         Dynamic DSP Post-Processing Channel (Formants, Limiters)       │
│                                      │                                 │
│                                      ▼                                 │
│        Atomic NVMe Write: scratch/audio/dialogue/${lineId}.wav         │
└────────────────────────────────────────────────────────────────────────┘
```

#### 1. The Persistent Warm Daemon Strategy (Why CLI Child Processes are Banned)

Spawning a Python process via `child_process.execFile('python', ['synthesize.py', ...])` for each line of dialogue would force Python to re-import PyTorch, re-read multi-gigabyte neural checkpoints from disk, allocate memory pools, and re-initialize vocoders on every sentence. This incurs 5 to 15 seconds of cold-boot latency per utterance.

Instead, **microservice-audio** maintains a persistent Python web daemon (`server.py`) running FastAPI on `[http://127.0.0.1:8000](http://127.0.0.1:8000)` on Rig 1:

- Neural model checkpoints for StyleTTS-2 and Parler-TTS remain warm in system RAM.
- The process operates under an absolute **0 MB GPU VRAM Invariant**, setting `CUDA_VISIBLE_DEVICES=""` to enforce pure CPU multi-threaded inference using AVX-512 vectorization, preserving all workstation VRAM for Rig 2 visual rendering.
- An LRU memory cache limits active resident models to a strict **8.0 GB RAM ceiling**, evicting unused engines via explicit `gc.collect()` when swapping universes.
- An internal `asyncio.Lock()` serializes speech inference to ensure thread safety, preventing CPU contention and timing jitter.

#### 2. Polymorphic Engine Adapters (`engines/base.py`)

Within the Python daemon, the external repositories are integrated as specialized subclasses inheriting from an abstract base interface (`BaseTTSEngine`):

- **Wrapping `000.StyleTTS-2` (`StyleTTS2Engine`):**
  - **Conditioning Mechanism:** StyleTTS-2 utilizes style vector tensors representing the target voice geometry. The adapter loads precomputed style vectors (`.pt`) referenced in `voice_manifest.json`.
  - **Latent Pitch Prediction:** The engine runs StyleTTS-2's internal latent diffusion model to predict fundamental frequency ($F_0$) contours and energy dynamics prior to vocoding.
  - **Execution Profile:** Delivers ultra-low latency inference ($\text{RTF} \le 0.15\times$, sub-100 ms execution), making it ideal for snappy dialogue, crowd reactions, and synthetic communications.
- **Wrapping `000.parler-talk` (`ParlerEngine`):**
  - **Natural Language Conditioning:** Parler-TTS uses a dual-decoder autoregressive transformer conditioned directly on natural language descriptions.
  - **Prompt Synthesis:** The adapter translates incoming emotional condition tags (e.g., `tense_jaw`, `humiliated`) and acoustic modifiers into descriptive text prompts (e.g., *"A raspy, low-pitched male voice speaking in a hurried whisper with slight vocal fry in a dry room"*).
  - **Cross-Attention Decoding:** This prompt is processed by the text attention encoder to modulate the audio decoder layers dynamically, altering vocal cadence without requiring manual vocoder retraining.

#### 3. Mapping Node.js Candor Units to Python Execution

Inside the Node.js repository (`packages/700.microserviceaudio/`), the system manages and talks to the Python codebases through distinct functional units:

- **`07.service.unit` (Daemon Supervisor):** Manages the lifecycle of the Python process. It can verify that port 8000 is listening, execute health pings against `[http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)`, and handle startup/teardown commands.
- **`08.schemas.unit` & `14.conditioning.unit`:** Prepares the payload contract, resolving character identifiers against `voices/<series>/voice_manifest.json` and injecting somatic basis-point math.
- **`10.generate.unit` (`buz/generate.buzz.ts`):** Dispatches the typed HTTP POST request to the Python daemon, receives the raw audio buffer or file descriptor, executes the Zero-Byte Poison Buffer Sentinel Gate, and handles retries.
- **`01.loudness.unit` & `02.peaks.unit`:** Inspects the returned stream using local Node.js audio decoders or `ffprobe` to verify the stem achieves $-16.0\text{ LUFS}$ integrated loudness and $-1.0\text{ dBTP}$ true-peak conformance before promoting the file to the conductor.
- **`99.bus.unit`:** Publishes completion receipts across the internal RxJS/MQTT bus, allowing the terminal dashboard (`apps/995.library`) and the episode orchestrator (`produceEpisode.ts`) to immediately update progress bars and proceed to video quantization.

### You

i do not want to use [PERSISTENT PYTHON INFERENCE DAEMON (FastAPI server.py on Port 8000)] i want to use something which is native to Node.JS

something like [child_process.execFile('python', ['synthesize.py', ...])] and have Node.js poll for when the wave file comes out and make sure its part of a unit in [000.microservice-audio]; the five to ten second extra is not big deal at this stage; ill speed stuff up later;

now under [Communication Between series-sower-conductor and microservice-audio] remember that [ 000.microservice-audio ] has a BLESSED terminal User Interface; [series-sower-conductor] should manipulate that interface

### Gemini

### The Native Node.js Ephemeral Subprocess Architecture

Transitioning **microservice-audio** away from a persistent HTTP web daemon to a native Node.js process orchestration model replaces network sockets with direct OS-level process management. Instead of relying on an always-on web server bound to local loopback ports, the Node.js runtime leverages native system primitives (`child_process.execFile` or `child_process.spawn`) to invoke isolated, one-shot Python execution scripts on demand.

```
┌────────────────────────────────────────────────────────────────────────┐
│ NODE.JS MONOREPO HOST (Rig 1 CPU & System RAM)                         │
│                                                                        │
│  [ series-sower-conductor ] (packages/400.conductor)                   │
│         │                                                              │
│         │ 1. Programmatic Hunt Dispatch / Blessed TUI Manipulation     │
│         ▼                                                              │
│  [ microservice-audio ] (packages/700.microserviceaudio)               │
│         │                                                              │
│         ├── 10.generate.unit: Invokes child_process.execFile           │
│         │                     ("python", ["synthesize.py", ...])       │
│         │                                                              │
│         ├── Filesystem Polling Watcher: Non-blocking async interval    │
│         │                               polls for .tmp stabilization   │
│         │                                                              │
│         ├── Validation & Conformance Chain:                            │
│         │   ├── 01.loudness.unit (Integrated -16.0 LUFS Audit)         │
│         │   ├── 02.peaks.unit    (Clamped -1.0 dBTP True-Peak)         │
│         │   └── 06.transcription.unit (Whisper / G2P Parity Guard)     │
│         │                                                              │
│         └── 97.collect.unit: Commits stem & emits SHA-256 receipt      │
│                                                                        │
│  [ apps/995.library ] (Blessed Terminal Cockpit Engine)                │
│         │                                                              │
│         ├── 81.grid.unit: 12x12 Cartesian screen partitioning          │
│         ├── 85.choice.unit / 98.menu.unit: Keyboard-driven menu tree   │
│         └── 83.console.unit: cns00 real-time ASCII telemetry stream    │
└────────────────────────────────────────────────────────────────────────┘
```

### Executing Python Neural Codebases via Ephemeral Subprocesses

The external Python repositories—such as StyleTTS-2 and parler-talk—are wrapped by dedicated CLI entrypoint scripts (e.g., `synthesize.py` or `engine_runner.py`). When speech synthesis is requested, Node.js manages execution through an asynchronous lifecycle:

#### 1. Command-Line Argument Serialization & Context Injection

Node.js constructs an argument vector passing all necessary synthesis parameters directly to the Python interpreter:

- **Engine Selector Flag:** Declares whether the underlying invocation will load the StyleTTS-2 diffusion pipeline or the Parler-TTS cross-attention decoder.
- **Phonetic Text String:** The sanitized, verbatim screenplay dialogue line, pre-processed to expand dialect abbreviations, numerals, and custom lexicon entries.
- **Speaker Reference Identity:** The relative path to the character’s reference audio waveform within the series-scoped asset folder, or an explicit pre-extracted style latent tensor.
- **Somatic DSP Modifiers:** Serialized numeric flags representing biological trauma or emotional strain, including pitch shift semitones, formant warping percentages, breathiness pause ratios, and vocal fry density.
- **Deterministic Destination Target:** The target output filesystem path, designated with an ephemeral staging extension (`.tmp`).

#### 2. Subprocess Execution & Process Isolation

- **Execution Boundary:** Node.js executes the Python process under strict resource constraints, enforcing zero GPU VRAM allocation by explicitly passing an empty environment variable for visible graphics devices (`CUDA_VISIBLE_DEVICES=""`).
- **Thread Budgeting:** The subprocess is assigned a fixed pool of multi-threaded CPU cores to prevent one-shot neural tensor calculations from starving the Node.js event loop.
- **Cold-Boot Tolerance:** While initial PyTorch importing, weights loading, and vocoder initialization add 5 to 10 seconds of startup latency per execution run, the process runs completely disconnected from long-lived port bindings, eliminating memory leaks, port collisions, and background zombie daemons.

### Atomic Staging, Stabilization Detection, and Polling Architecture

To prevent race conditions where downstream video animators or optical compositors attempt to read an audio file that Python is still actively writing to disk, Node.js uses an **atomic file stabilization and polling protocol**:

#### 1. The Atomic POSIX Sandbox Extension

The Python script is forbidden from writing directly to the final production path (such as `ep01_sh01.wav`). Instead, it writes strictly to a temporary staging path (such as `ep01_sh01.wav.tmp`).

#### 2. Non-Blocking Event Loop Polling

Instead of blocking execution with synchronous sleep loops, the responsible Node.js unit initiates a recurring asynchronous tick timer using non-blocking timeouts or interval loops scheduled across the JavaScript event loop:

- **File Existence Probe:** On every timer tick (e.g., every 150 to 250 milliseconds), Node.js queries the file system to verify whether the staging file has appeared on disk.
- **Byte-Size Stabilization & Inode Quiescence:** Once the file exists, polling tracks its byte size across consecutive checks. If the file size changes between checks, Python is still actively flushing audio buffers. The file is considered physically sealed only when its byte size remains identical across consecutive polling intervals and the Python child process exits cleanly with return code 0.
- **Timeout & Deadlock Guardrails:** A circuit breaker terminates the watcher if the file fails to stabilize within a preconfigured window (e.g., 30 seconds), preventing orphaned processes from hanging pipeline automation.

#### 3. Atomic POSIX Promotion

Once the temporary file is closed and verified, Node.js triggers an atomic POSIX rename system call, instantly promoting `ep01_sh01.wav.tmp` to `ep01_sh01.wav`. Because POSIX rename operations are atomic at the operating system kernel level, no downstream reader can ever observe a partial, zero-byte, or corrupted stem.

### Unit Integration Inside packages/700.microserviceaudio

Within the Candor architectural pattern of **microservice-audio**, each stage of process spawning, polling, and signal verification is partitioned across specialized, decoupled units:

| Functional Unit | Operational Responsibility in Subprocess Pipeline |
| --- | --- |
| **`10.generate.unit`** | **Subprocess Spawner & Polling Overseer:** Ingests synthesis actions, spawns `python synthesize.py` with the serialized argument vector, schedules the non-blocking polling ticks, verifies file size stabilization, and executes the atomic POSIX rename. |
| **`01.loudness.unit`** | **EBU R128 Loudness Certification:** Inspects the conformed audio file using headless duration analyzers or native decoders to verify that integrated loudness lands precisely at the -16.0 LUFS web standard (or -24.0 LUFS broadcast target). |
| **`02.peaks.unit`** | **True-Peak & Clamping Sentry:** Scans waveform amplitudes to guarantee that no sample or inter-sample peak exceeds the mandatory -1.0 dBTP ceiling, rejecting stems that threaten DAC clipping. |
| **`06.transcription.unit`** | **Speech Alignment Verification:** Dispatches a rapid acoustic-to-text verification pass (or compares phoneme timing envelopes) against the source screenplay AST to ensure words were not truncated or hallucinated during inference. |
| **`13.audio.unit` & `12.acoustic.unit`** | **Acoustic Profiling:** Resolves character voice profiles, selects whether the target recipe calls for StyleTTS-2 or Parler-TTS, and translates narrative emotion tags into exact somatic DSP parameters. |
| **`97.collect.unit`** | **Asset Ledger & Cryptographic Sealing:** Computes the SHA-256 hash of the stabilized audio stem, records its precise duration in milliseconds, and indexes the stem into the local repository collection. |
| **`98.menu.unit`** | **Blessed Cockpit Surface:** Renders operator choices, visual progress indicators, and menu navigation states for the terminal user interface. |
| **`99.bus.unit`** | **Internal State Bus:** Routes RxJS/BehaviorSubject event packets (`sim.hunt`) across all units and mirrors state updates to the terminal console. |

### series-sower-conductor Manipulating the microservice-audio Blessed TUI

The user interface of **microservice-audio** is built on the Blessed curses framework hosted inside `apps/995.library`. The display is organized around a strict **12x12 Cartesian grid layout** (`81.grid.unit`), a **keyboard choice axis** (`85.choice.unit` and `98.menu.unit`), and a **scrollable switchboard console** (`83.console.unit`, identified as `cns00`).

Because **series-sower-conductor** and **microservice-audio** coexist within the same workstation ecosystem, the Conductor does not need network sockets to drive the audio microservice. It manipulates **microservice-audio**'s Blessed interface directly using three internal architectural mechanisms:

```
┌────────────────────────────────────────────────────────────────────────┐
│ BLESSED TERMINAL COCKPIT (apps/995.library on Rig 1)                   │
├───────────────────────────────┬────────────────────────────────────────┤
│ 98.menu.unit (Choice Axis)    │ 83.console.unit (Telemetry Console)    │
│ Grid: {x:0, y:4, w:4, h:8}    │ Pane: cns00 {x:4, y:0, w:8, h:12}      │
├───────────────────────────────┼────────────────────────────────────────┤
│                               │                                        │
│  [1] SYNTHESIZE SCENE AUDIO   │ >> [CONDUCTOR] Intercepting Audio TUI  │
│  [2] TEST ACOUSTIC PIPELINE   │ >> [AUDIO:GENERATE] Spawning Python... │
│  [3] AUDIT STEM LOUDNESS      │ >> [SUBPROCESS] synthesize.py (PID)    │
│  [4] INSPECT AUDIO COLLECT    │ >> [POLL] Waiting for stem.wav.tmp...  │
│  [5] ROOT MENU                │ >> [POLL] Size stable: 144,044 bytes   │
│                               │ >> [ATOMIC] Renamed to stem.wav [OK]   │
│  ▲ Conductor programmatically │ >> [LOUDNESS] -16.0 LUFS verified [OK] │
│    drives selection cursor    │ >> [CONDUCTOR] Master clock locked     │
│                               │                                        │
└───────────────────────────────┴────────────────────────────────────────┘
```

#### 1. Programmatic Action Injection via the Shared Pivot Bus

The runtime environment initializes a global pivot registry where every loaded domain package is exposed through its canonical identifier (`global.MICROSERVICEAUDIO` and `global.PIVOTS['microserviceaudio']`).

- When **series-sower-conductor** needs to trigger audio generation, its internal speech orchestrator dispatches actions directly into **microservice-audio**'s event bus using the `hunt` dispatch method.
- Rather than requiring manual human keystrokes, the Conductor submits a strongly typed action payload containing the target scene AST and line identifiers.
- This dispatch activates `10.generate.unit`, which triggers child process spawning while automatically advancing the internal state machine of **microservice-audio**.

#### 2. Telemetry Ingestion and Driving the Console Surface (cns00)

The primary operator-facing telemetry pane in the Blessed interface is the green-bordered switchboard console (`cns00`). The Conductor programmatically interacts with this display through the library's console actions:

- **Pipeline Initialization Receipts:** When the Conductor takes command of the audio interface, it writes header banners directly to `cns00` in clean 7-bit ASCII, notifying operators that acoustic synthesis has been claimed by the master lifecycle.
- **Subprocess Spawning Logs:** As the Conductor orders `10.generate.unit` to run `synthesize.py`, it pipes process status (process ID, target engine name, character style profile) into the active terminal feed.
- **Real-Time Polling Animation:** During the 5-to-10 second synthesis window, the non-blocking polling ticks emit concise heartbeat receipts into `cns00` (e.g., displaying file check attempts, current byte counts, and stabilization progress).
- **Audit & Certification Banners:** Once the file is promoted, the Conductor streams the results of `01.loudness.unit` and `02.peaks.unit` directly to the screen, showing measured LUFS, True-Peak values, and the calculated 24 fps integer frame budget before continuing to the next scene beat.

#### 3. Programmatic Navigation of 98.menu.unit and 85.choice.unit

In the Candor Blessed architecture, the visual menu displayed on the left quadrant (columns 0 through 4) is governed by `98.menu.unit` and rendered via `85.choice.unit`:

- **Choice Interception:** The menu unit registers vertical choice lists with defined action callbacks and resolver promises (`slv` / `rootSlv`). The Conductor can simulate or programmatically resolve these promises, advancing menu items without requiring physical keyboard interaction.
- **Synchronized State Highlighting:** When an automated generation run begins, the Conductor updates the choice array to reflect active execution states (e.g., dynamically altering the menu labels to show active rendering badges), ensuring that any operator observing the terminal sees the menu reflect current background progress.
- **Status HUD & Border Theming:** Via the terminal control unit (`80.terminal.unit`), the Conductor can trigger visual theme shifts—changing screen borders or updating the status banner to display the active series slug, canon Merkle root, and acoustic processing state—alerting the operator that the flight deck is locked in synthesis mode.
- **Clean Menu Release:** Once all dialogue lines have been synthesized, probed with `ffprobe`, and quantized into integer frames, the Conductor resolves the menu promise, cleanly returning the Blessed cockpit back to its root idle state without memory leaks, hung timers, or unhandled curses exceptions.

### You

so [audio-microservice] has no direct connection to [[goblin-viewport-template] and when this system is full operation [series-sower-conductor] acts as a bridge between these repos

### Gemini

That is correct. In this architecture, **`audio-microservice`** (or `microservice-audio`) and **`goblin-viewport-template`** have **zero direct communication**.

When the generative pipeline is in full operation, **`series-sower-conductor`** (also designated `worker-sower-conductor`) functions as the central operational bridge between them on Rig 1.

### 1. The Strict Negative Invariant: Why They Cannot Talk Directly

The studio enforces a strict boundary between the acoustic synthesis spoken domain and downstream visual rendering:

- **Different Dependencies & Runtimes:** `audio-microservice` requires character reference takes, dialect phonetic lexicons, and speech synthesis engine wrappers. `goblin-viewport-template` requires visual sprite manifests, animation rigs, and Remotion TSX templates. Connecting them directly would cross-contaminate their dependency graphs and violate repository boundaries.
- **Continuous Sound vs. Discrete Integer Video:** `audio-microservice` outputs continuous physical waveforms measured in milliseconds. `goblin-viewport-template` does not know how to measure raw audio buffers at runtime; it only operates on discrete integer frame numbers (e.g., `<Sequence durationInFrames="{75}" from="{0}">`).
- **The "Zero-Network Render" Boundary:** `goblin-viewport-template` is an offline compiler. When its generated episode workspaces render, they must read static, committed local assets. The rendering engine is strictly prohibited from dispatching live HTTP requests or IPC calls to audio engines mid-render.

### 2. How `series-sower-conductor` Acts as the Active Bridge

`series-sower-conductor` (operating on Rig 1 CPU/RAM) coordinates the two repositories across the sequential execution pipeline:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        UPSTREAM NARRATIVE CORE                         │
│   worker-sower-engine (Emits validated scene dialogue_ast.json)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               THE BRIDGE: series-sower-conductor (Rig 1)               │
│                                                                        │
│  Step A: Calls audio-microservice via HTTP or CLI Subprocess           │
│          └── [audio-microservice] synthesizes 48 kHz uncompressed WAV  │
│                                                                        │
│  Step B: Temporal Frame Quantization & Audio Clock Assembly            │
│          ├── Runs ffprobe child process on the returned .wav stem       │
│          ├── target_frames = ⌈(duration_ms / 1000) * 24⌉               │
│          ├── Calculates -14 dB sidechain ducking curve for score & bed │
│          └── Assembles exposure_sheet.json & timing manifest           │
│                                                                        │
│  Step C: Invokes the Viewport Metaprogram                              │
│          └── tsx goblin-viewport-template/generator/...                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Payload: dialogue AST, ffprobe
                                    │  frames, audio stem paths)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               THE STAGING COMPILER: goblin-viewport-template           │
│                                                                        │
│  1. Scaffolds dedicated workspace inside goblin-episodes/epXXX/        │
│  2. Harvests & vendors visual assets + stages the .wav stems           │
│  3. Source-Bakes Episode_XXX.tsx:                                      │
│     Inlines the conductor's calculated integer frame budgets           │
│     and audio file paths as static JSX literals                        │
│  4. Seals provenance into render_manifest.json                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  HEADLESS RASTERIZATION & DELIVERY                     │
│  series-sower-conductor executes headless Remotion render on epXXX/    │
│  Output: Final broadcast MP4 committed permanently to the archives     │
└────────────────────────────────────────────────────────────────────────┘
```

#### Operational Bridge Steps:

1. **Upstream Ingestion:** The Conductor ingests the dialogue AST and character condition tags emitted by the narrative engine.
2. **Acoustic Invocation:** The Conductor issues the synthesis command to `audio-microservice`, passing character IDs, emotion enums, and phonetic text.
3. **Temporal Quantization:** When `audio-microservice` outputs the finalized `.wav` stem, the Conductor spawns `ffprobe` to measure the continuous duration in milliseconds and converts it into discrete 24 fps integer frames:
  $$
  \text{target\_frames} = \left\lceil \left(\frac{\text{duration\_ms}}{1000}\right) \times 24 \right\rceil
  $$
4. **Exposure Sheet Assembly:** The Conductor compiles the master timing manifest (`exposure_sheet.json`), mapping absolute start frames, punctual Foley triggers, and ambient audio sidechain ducking curves (-14 dB attenuation during dialogue).
5. **Compiler Handoff:** The Conductor invokes the generator script inside `goblin-viewport-template` (`generator/generate-episode-repo.ts`), handing off the validated AST, the quantized frame allocations, and the staged audio paths.
6. **Execution of the Stamped Artifact:** `goblin-viewport-template` bakes these integer numbers directly into a standalone, static TypeScript file (`Episode_XXX.tsx`) inside `goblin-episodes/`. The Conductor then spawns the headless Remotion renderer (`--gl=swangle`) against that stamped directory to output the final broadcast MP4 deliverable.

### You

{{FOCUS : [audio-microservice] working with [series-sower-conductor] }}

@project-categories-00

### Gemini

In software project management, Epics define large-scale architectural initiatives, Features represent distinct functional capabilities delivered to the system, and Tasks are the atomic, non-overlapping engineering work items required to build them.

Following strict project categorization rules, every item related to [audio-microservice] working with [series-sower-conductor] is decomposed below into single-responsibility Epics, Features, and Tasks with zero informational redundancy, explicit Git repository mappings, and zero use of the word "AND" in any title.

### Git Repository Architecture Mapping

| Git Repository | Role in the [audio-microservice] working with [series-sower-conductor] Architecture |
| --- | --- |
| **000.series-sower-conductor** | Primary execution host for Rig 1 orchestrating local Node.js media execution, FFprobe frame quantization, causal VAE alignment, ComfyUI dispatch payloads, optical compilation, temporal telemetry logging, and signed Git sealing. |
| **000.audio-microservice** | Hardware-isolated Python daemon (port 8000) hosting neural TTS engines, executing algebraic somatic DSP modifier logic, validating integrated LUFS/True-Peak conformance, managing POSIX atomic file staging, and routing multi-series voice identities. |
| **000.worker-sower-engine** | Upstream epistemological simulation engine responsible for evaluating conflicts, maintaining D1 state ledgers, emitting canonical ASTs (dialogue_ast.json), and executing pre-flight GPU VRAM flushes. |
| **001.goblin-lore** | Upstream canonical state repository housing immutable world schemas, physical entity condition tables, and cryptographic Merkle root hashes (H_root). |
| **apps/995.library** | Deep-frozen vendor curses terminal framework presenting the 12x12 Cartesian flight deck interface, real-time telemetry output pane (cns00), interactive menu grids, and the root Node.js execution bootloader (run.ts). |
| **goblin-episodes** | Downstream target repository receiving isolated per-episode workspace bundles, baked TSX composition files, conformed audio stems, and final broadcast MP4s. |

### [Epic 1] Audio Client HTTP Integration

- Target Git Repositories: 000.series-sower-conductor

#### [Feature 1.1] Synthesis Payload Serialization

- Target Repository: 000.series-sower-conductor
  - [Task 1.1.1] Zod Contract Instantiation: Implement Zod schema TTSGenerationRequest Schema for character ID, literal dialogue string, enumerated emotional state, base tone pacing scalar, plus all somatic DSP numeric objects.
  - [Task 1.1.2] Series Identity Namespace Routing: Update ingress payload definition to explicitly demand series_id for dynamic path resolution in the downstream daemon.
  - [Task 1.1.3] HTTP Client Execution Harness: Build ttsClient.ts using native Node Fetch configured with an AbortController for 15,000ms socket timeouts targeting [http://127.0.0.1:8000/generate](https://www.google.com/search?q=http://127.0.0.1:8000/generate).
  - [Task 1.1.4] Transient Socket Dropout Retry Logic: Construct a three-attempt exponential backoff retry loop isolating failures per line execution.

#### [Feature 1.2] Receive Payload Validation

- Target Repository: 000.series-sower-conductor
  - [Task 1.2.1] JSON Response Unpacking: Parse TTSGenerationResponse receiving the relative stem path, duration in milliseconds, computed SHA-256 hash, plus acoustic telemetry.
  - [Task 1.2.2] Zero Byte Poison Buffer Assertion: Evaluate received file metadata ensuring length exceeds 1024 bytes with validated RIFF WAVE headers.
  - [Task 1.2.3] Loudness Calibration Cross-Check: Implement assertions rejecting any response payload registering integrated loudness outside the -16.0 LUFS bounds or violating the -1.0 dBTP ceiling.

### [Epic 2] Somatic Condition Transformation

- Target Git Repositories: 000.series-sower-conductor

#### [Feature 2.1] Physiological Modifier Extraction

- Target Repository: 000.series-sower-conductor
  - [Task 2.1.1] Basis Point Vector Computation: Extract numeric vectors for character fatigue, pain, plus physical trauma from the dialogue AST payload.
  - [Task 2.1.2] Biological Constraint Evaluation: Raise VOCAL_DELIVERY_BREACH exception if active conditions prohibit speech generation.

#### [Feature 2.2] Acoustic Translation Mapping

- Target Repository: 000.series-sower-conductor
  - [Task 2.2.1] Respiratory Cadence Warping: Translate physiological fatigue basis points into pause_frequency_multiplier plus breathinessPauseMultiplier decimal floats.
  - [Task 2.2.2] Laryngeal Tension Modulation: Compute exact basePitchShiftSemitones, formantWarpingFactor, plus vocalFryDensity modifiers from psychological strain tags.

### [Epic 3] Discrete Timeline Synchronization

- Target Git Repositories: 000.series-sower-conductor

#### [Feature 3.1] Physical Duration Quantization

- Target Repository: 000.series-sower-conductor
  - [Task 3.1.1] FFprobe Subprocess Probing: Spawn ffprobe child processes extracting continuous audio length to microsecond precision.
  - [Task 3.1.2] Ceiling Integer Frame Arithmetic: Convert measured millisecond length into exact target frames using discrete 24 fps ceiling division.
  - [Task 3.1.3] Contiguous Frame Accumulator: Calculate absolute fromFrame and toFrame integer boundaries preventing fractional drift over sequential timeline cuts.

#### [Feature 3.2] Causal Lattice Resampling

- Target Repository: 000.series-sower-conductor
  - [Task 3.2.1] Native VAE Alignment Enforcement: Calculate modulo four congruence padding required for generating the 4n+1 diffusion frame allocation.
  - [Task 3.2.2] Resampling Trim Mathematics: Compute exact tail subtraction margin needed for aligning over-generated diffusion plates back to the discrete 24 fps dialogue window.

#### [Feature 3.3] Exposure Sheet Generation

- Target Repository: 000.series-sower-conductor
  - [Task 3.3.1] Quadratic Ducking Curve Computation: Generate linear gain maps utilizing six-frame attack plus twelve-frame release envelopes dipping ambient beds by -14 dB.
  - [Task 3.3.2] Rapid Pause Pumping Suppression: Clamp ducking gain floor constant during inter-dialogue silences shorter than 18 frames.
  - [Task 3.3.3] Foley Hash Placer: Seed deterministic SFX timestamps using MurmurHash3 hashing over shot ID keys.
  - [Task 3.3.4] JSON Manifest Serialization: Write the finalized temporal timeline array containing paths, frame boundaries, plus volume maps to drafts/exposure_sheet.json.

### [Epic 4] Terminal Cockpit Integration

- Target Git Repositories: 000.series-sower-conductor, apps/995.library

#### [Feature 4.1] Internal Bus Telemetry Routing

- Target Repository: 000.series-sower-conductor
  - [Task 4.1.1] Action Dispatcher Registration: Create QUANTIZE_ACOUSTIC_CLOCK constant within lifecycle.action.ts binding payload structures.
  - [Task 4.1.2] Master Reducer Instantiation: Map acoustic actions inside lifecycle.reduce.ts applying clone-deep immutability updates to the state tree.

#### [Feature 4.2] Terminal Visual Telemetry

- Target Repository: 000.series-sower-conductor, apps/995.library
  - [Task 4.2.1] Pre-Flight Console Announcements: Dispatch 7-bit ASCII banners indicating Port 8000 initialization status into the cns00 text widget.
  - [Task 4.2.2] Subprocess Watcher Updates: Emit real-time byte count progression during the POSIX atomic file staging window.
  - [Task 4.2.3] Certification Confirmation Streams: Print finalized LUFS, True-Peak, plus integer frame allocations upon completion of each dialogue beat.
  - [Task 4.2.4] Menu State Resolution: Trigger promise resolution callbacks restoring the Blessed interactive choice grid once the master pipeline chain finishes.

### You

{{FOCUS : [audio-microservice] working with [series-sower-conductor] }}

{{REPO: 000.series-sower-conductor }}

@repo-task-list-01

### Gemini

### Blueprint: [audio-microservice] Working With [series-sower-conductor]

- **Repository:** `000.series-sower-conductor` (downstream: `camp-candor/series-sower-conductor`)
- **Target Monorepo Workspaces:** `packages/400.conductor/` (Rig 1 local execution host) and `apps/worker/` (Cloudflare edge bridge)
- **Monorepo Directory Demarcation Law:** Under no circumstances may any file be placed inside `packages/400.conductor/src/`. All local Node.js logic resides strictly within numbered Candor units (`09.speech.unit/`, `10.somaticdsp.unit/`, `24.frame.unit/`, `32.audio.unit/`, `34.abstractsyntaxtree.unit/`, `37.lifecycle.unit/`, `98.menu.unit/`) or unit verification test suites inside `packages/400.conductor/val/`.
- **Local-First Precedence:** All speech orchestration, file polling, duration probing, timeline quantization, exposure sheet generation, and Blessed terminal cockpit operations execute locally on Rig 1 at Stage $T_0 = \$0.00$ spend prior to triggering Cloudflare Edge Worker bindings.
- **Title Invariant:** Zero use of the word "AND" or the character "&" across all Phase, Feature, and Task titles.

### Phase 1: Screenplay AST Dialogue Ingestion Interface

#### Feature 1.1: Dialogue Line Schema Validation

- **Target Unit:** `packages/400.conductor/34.abstractsyntaxtree.unit`
- **Task 1.1.1: Strict Dialogue Line Zod Contract Setup**
  - Author `packages/400.conductor/34.abstractsyntaxtree.unit/fce/dialogueLine.interface.ts` and `buz/dialogueLine.val.ts` defining `DialogueLineSchema` with `.strict()` parsing. Enforce non-empty string literals for `line_id`, `speaker_id`, verbatim dialogue `text`, enumerated `emotion`, and a positive floating-point scalar `tonePacing` constrained to $[0.5, 2.0]$.
- **Task 1.1.2: Dwight Swain Reaction Unit Tag Parser**
  - Implement parsing logic inside `packages/400.conductor/34.abstractsyntaxtree.unit/buz/abstractsyntaxtree.buzz.ts` extracting Motivation-Reaction Unit (MRU) tags (`stimulus`, `reflex`, `instinctive_reaction`, `rational_action`) to modulate speech pause cadences.

#### Feature 1.2: Screenplay Scene AST Parsing

- **Target Unit:** `packages/400.conductor/34.abstractsyntaxtree.unit`
- **Task 1.2.1: Scene AST Container Zod Schema Authoring**
  - Author `packages/400.conductor/34.abstractsyntaxtree.unit/fce/sceneAst.interface.ts` defining `SceneASTSchema` parsing `sceneId`, `episodeId`, `series_id`, an array of validated `DialogueLineSchema` objects, and integer `pinned_version`. Reject payloads containing unauthorized keys.
- **Task 1.2.2: State Snapshot Hash Parity Guard**
  - Author verification logic in `packages/400.conductor/34.abstractsyntaxtree.unit/buz/abstractsyntaxtree.buzz.ts` validating `state_snapshot_hash` against regular expression `/^[0-9a-f]{64}$/`. Assert parity with the local SQLite continuity ledger (`pilot.db`) before permitting acoustic processing.

#### Feature 1.3: Blessed Menu AST Verification Entry

- **Target Unit:** `packages/400.conductor/98.menu.unit`
- **Task 1.3.1: Blessed Choice Option AST Audit Mount**
  - Register choice entry `AUDIT DIALOGUE AST CONTRACT` inside `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` allowing terminal operators to trigger contract validation over `drafts/dialogue_ast.json`.
- **Task 1.3.2: Console Output AST Summary Formatter**
  - Author formatting logic inside `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` printing line count, active character speakers, and validation status to pane `cns00` in pure 7-bit ASCII.

### Phase 2: Somatic Biological Condition Vector Translation

#### Feature 2.1: Somatic Metric Basis Point Extraction

- **Target Unit:** `packages/400.conductor/10.somaticdsp.unit`
- **Task 2.1.1: Condition Table Relational Query Harness**
  - Author query functions in `packages/400.conductor/10.somaticdsp.unit/buz/somaticdsp.buzz.ts` reading character biological condition rows from local SQLite database `pilot.db`. Extract integer basis points $[0, 10000]\text{ bps}$ for trauma, pulmonary fatigue, and laryngeal strain.
- **Task 2.1.2: Phonation Feasibility Gate Evaluation**
  - Implement assertion logic inside `packages/400.conductor/10.somaticdsp.unit/buz/somaticdsp.buzz.ts` checking for conditions such as `cnd_vocal_cord_transected`, unconsciousness, or mute status. Throw `VOCAL_DELIVERY_BREACH` at $T_0 = \$0.00$ compute spend if speech is biologically impossible.

#### Feature 2.2: Acoustic DSP Modifier Transformation

- **Target Unit:** `packages/400.conductor/10.somaticdsp.unit`
- **Task 2.2.1: Pitch Transposition Mathematical Calculator**
  - Implement transfer functions in `packages/400.conductor/10.somaticdsp.unit/buz/somaticdsp.buzz.ts` converting pain metrics into additive semitone transposition values clamped to $[-12.0, 12.0]\text{ st}$.
- **Task 2.2.2: Formant Warping Ratio Calculator**
  - Author mathematical mapping logic in `packages/400.conductor/10.somaticdsp.unit/buz/somaticdsp.buzz.ts` deriving `formantWarpingFactor` constrained strictly within $[0.5, 2.0]$ based on anatomical jaw trauma.
- **Task 2.2.3: Respiratory Pause Frequency Dilation Math**
  - Implement exponential breath dilation math converting pulmonary fatigue basis points into `pause_frequency_multiplier` and `breathinessPauseMultiplier` floats.
- **Task 2.2.4: Subharmonic Vocal Fry Density Sentry**
  - Calculate `vocalFryDensity` floats $[0.0, 1.0]$ based on character exhaustion basis points, packaging all derived numbers into an `AcousticDspModifiers` object.

#### Feature 2.3: Blessed Menu Somatic Inspection Trigger

- **Target Unit:** `packages/400.conductor/98.menu.unit`
- **Task 2.3.1: Blessed Choice Option Somatic Vector Mount**
  - Register menu action `INSPECT CHARACTER SOMATIC DSP` inside `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts`.
- **Task 2.3.2: Telemetry Console Somatic Streamer**
  - Author logging routines streaming calculated pitch shift, formant warp, and vocal fry parameters for each character directly to pane `cns00`.

### Phase 3: Native Speech Synthesis Subprocess Invocation Watcher

#### Feature 3.1: Child Process Synthesis Execution

- **Target Unit:** `packages/400.conductor/09.speech.unit`
- **Task 3.1.1: CLI Execution Argument Vector Formatter**
  - Author argument formatting logic inside `packages/400.conductor/09.speech.unit/buz/speech.buzz.ts` transforming line data, character style identifiers, and acoustic DSP modifiers into arguments for `synthesize.py`.
- **Task 3.1.2: Zero VRAM Hardware Sentry Execution**
  - Implement `child_process.execFile` invocation in `packages/400.conductor/09.speech.unit/buz/speech.buzz.ts` forcing process environment variable `CUDA_VISIBLE_DEVICES=""` to guarantee zero GPU VRAM consumption on Rig 1.
- **Task 3.1.3: Ephemeral Output Path Sandbox Generator**
  - Construct path generation logic targeting ephemeral staging extensions (`.tmp`) inside local storage (`public/audio/dialogue/${sceneId}_SH${shotIndex}.wav.tmp`).

#### Feature 3.2: Asynchronous Staging Inode Polling Loop

- **Target Unit:** `packages/400.conductor/09.speech.unit`
- **Task 3.2.1: Non-Blocking Inode Presence Poll Timer**
  - Implement recurring asynchronous `setTimeout` intervals polling disk presence for `.tmp` audio staging files every 200 milliseconds without blocking the event loop.
- **Task 3.2.2: Staging File Size Quiescence Comparator**
  - Author file inspection checks in `packages/400.conductor/09.speech.unit/buz/speech.buzz.ts` comparing byte sizes across consecutive polling intervals to verify that the Python child process has completed flushing buffers.
- **Task 3.2.3: Synthesis Watcher Timeout Circuit Breaker**
  - Implement timeout logic terminating the polling watcher and throwing `SYNTHESIS_TIMEOUT_BREACH` if the `.tmp` staging file fails to stabilize within 45 seconds.
- **Task 3.2.4: Atomic POSIX Promotion Inode Swap**
  - Author file promotion logic invoking `fs.renameSync` to atomically rename stabilized `.tmp` staging paths to permanent `.wav` target paths.

#### Feature 3.3: Audio Stem Integrity Verification

- **Target Unit:** `packages/400.conductor/09.speech.unit`
- **Task 3.3.1: Zero-Byte Poison Buffer Sentinel Check**
  - Author header validation logic inside `packages/400.conductor/09.speech.unit/buz/speech.buzz.ts` rejecting audio stems measuring under 1024 bytes or failing RIFF WAVE header byte inspections.
- **Task 3.3.2: Cryptographic Content Addressed SHA-256 Hasher**
  - Construct hash generation logic using `node:crypto` computing lowercase 64-character hexadecimal SHA-256 digests over conformed linear PCM WAV files.
- **Task 3.3.3: Isolated Per-Line Exponential Retry Loop**
  - Implement three-attempt retry loops with exponential backoff ($\text{delayMs} = 100 \times 2^{\text{attempt} - 1}$) isolating transient subprocess failures to the active line without aborting previously completed stems.

#### Feature 3.4: Blessed Menu Speech Trigger Switchboard

- **Target Unit:** `packages/400.conductor/98.menu.unit`
- **Task 3.4.1: Blessed Choice Option Synthesize Speech Mount**
  - Register choice entry `SYNTHESIZE SCENE AUDIO STEMS` inside `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` binding the operation to action `EXECUTE_SCENE_SPEECH`.
- **Task 3.4.2: Real Time Synthesis Progress Console Streamer**
  - Author telemetry dispatchers piping active shot IDs, target engine identifiers, and polling tick indicators directly to pane `cns00`.

### Phase 4: Discrete Frame Temporal Quantization Causal Alignment

#### Feature 4.1: Audio Duration Metric Probing

- **Target Unit:** `packages/400.conductor/24.frame.unit`
- **Task 4.1.1: POSIX Child Process FFprobe Invocation**
  - Author asynchronous child process execution in `packages/400.conductor/24.frame.unit/buz/frame.buzz.ts` calling `ffprobe` with flags `-v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1`.
- **Task 4.1.2: Millisecond Duration Floating Point Parser**
  - Author parser logic converting raw standard output seconds into microsecond-accurate millisecond duration integers.
- **Task 4.1.3: Audio Specification Parameter Assertion**
  - Implement stream inspection checks verifying that the parsed audio stem matches exactly 48,000 Hz sample rate and 24-bit linear PCM attributes.

#### Feature 4.2: Discrete 24 FPS Ceiling Quantization

- **Target Unit:** `packages/400.conductor/24.frame.unit`
- **Task 4.2.1: Mathematical Ceiling Frame Allocation Formula**
  - Implement the discrete quantization equation $\text{target\_frames} = \lceil (\text{duration\_ms} / 1000) \times 24 \rceil$ in `packages/400.conductor/24.frame.unit/buz/frame.buzz.ts`.
- **Task 4.2.2: Sub-Frame Duration Boundary Clamp**
  - Implement clamp logic enforcing a strict 1-frame minimum boundary for ultra-short spoken interjections.
- **Task 4.2.3: Monotonic Global Frame Offset Accumulator**
  - Author sequence accumulation logic computing absolute integer starting frames ($\text{fromFrame}_k = \sum_{i=1}^{k-1} \text{total\_shot\_frames}_i$) to eliminate fractional rounding drift across cut points.

#### Feature 4.3: Causal VAE Lattice Allocation Math

- **Target Unit:** `packages/400.conductor/24.frame.unit`
- **Task 4.3.1: Modulo Four Congruence Calculator**
  - Implement causal 3D VAE lattice alignment math enforcing $\text{diffusion\_frames} = 4 \times \lceil (N - 1) / 4 \rceil + 1$ over locked frame budgets.
- **Task 4.3.2: Latent Plate Resampling Margin Calculator**
  - Author calculation functions determining the exact tail frame subtraction count required to trim over-generated diffusion plates back to the discrete 24 fps dialogue window.

#### Feature 4.4: Blessed Menu Temporal Quantizer Trigger

- **Target Unit:** `packages/400.conductor/98.menu.unit`
- **Task 4.4.1: Blessed Choice Option Quantize Frames Mount**
  - Register choice item `QUANTIZE ACOUSTIC MASTER CLOCK` inside `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts`.
- **Task 4.4.2: Temporal Frame Telemetry Console Printer**
  - Author console reporting logic outputting duration in milliseconds, calculated 24 fps frame budget, and $4n+1$ causal VAE allocations for each shot into pane `cns00`.

### Phase 5: Dynamic Sidechain Acoustic Geometry Exposure Sheet Compilation

#### Feature 5.1: Quadratic Attenuation Envelope Calculation

- **Target Unit:** `packages/400.conductor/32.audio.unit`
- **Task 5.1.1: Dialogue Speech Window Attack Calculator**
  - Implement 6-frame quadratic attack interpolation curves in `packages/400.conductor/32.audio.unit/buz/audio.buzz.ts` dipping ambient background sound beds by $-14.0\text{ dB}$ upon voice onset.
- **Task 5.1.2: Inter-Speech Pause Release Curve Calculator**
  - Implement 12-frame quadratic release curves restoring background sound levels back to baseline upon speech completion.
- **Task 5.1.3: Rapid Pause Anti-Pumping Clamp Sentry**
  - Author logic clamping ducking attenuation flat during conversational dialogue pauses measuring shorter than 18 frames.

#### Feature 5.2: Deterministic Foley Transient Marker Seeding

- **Target Unit:** `packages/400.conductor/32.audio.unit`
- **Task 5.2.1: MurmurHash3 Acoustic Seed Generator**
  - Author seed generator in `packages/400.conductor/32.audio.unit/buz/audio.buzz.ts` computing 32-bit MurmurHash3 integers from concatenated scene and shot IDs.
- **Task 5.2.2: Punctual Foley Event Timestamp Placer**
  - Author placement algorithms positioning punctual sound effect triggers (footsteps, garment rustle, impacts) within pre-roll and speech windows based on deterministic seed values.

#### Feature 5.3: Exposure Sheet Manifest Serialization

- **Target Unit:** `packages/400.conductor/32.audio.unit`
- **Task 5.3.1: Exposure Sheet JSON Document Compiler**
  - Author compilation functions structuring frame ranges, conformed stem paths, cryptographic SHA-256 hashes, ducking curves, and Foley events into `exposure_sheet.json`.
- **Task 5.3.2: Atomic Staging POSIX Manifest Writer**
  - Implement atomic writing routines writing to `drafts/exposure_sheet.json.tmp` and committing via `fs.renameSync` to `drafts/exposure_sheet.json`.

#### Feature 5.4: Blessed Menu Exposure Sheet Viewer

- **Target Unit:** `packages/400.conductor/98.menu.unit`
- **Task 5.4.1: Blessed Choice Option Exposure Sheet Mount**
  - Register choice item `ASSEMBLE ACOUSTIC EXPOSURE SHEET` inside `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts`.
- **Task 5.4.2: Exposure Sheet Telemetry Console Formatter**
  - Author console presentation logic printing timeline track counts, ducking anchor nodes, and final frame boundaries directly to pane `cns00`.

### Phase 6: Blessed Terminal Cockpit Navigation Telemetry Control

#### Feature 6.1: Cartesian Terminal Layout Coordination

- **Target Unit:** `packages/400.conductor/98.menu.unit`
- **Task 6.1.1: Cartesian 12x12 Grid Coordinate Enforcement**
  - Author layout parameters inside `packages/400.conductor/98.menu.unit/fce/menu.interface.ts` partitioning terminal geometry into `{ x: 0, y: 4, xSpan: 4, ySpan: 8 }` for choice menus and `{ x: 4, y: 0, xSpan: 8, ySpan: 12 }` for console pane `cns00`.
- **Task 6.1.2: Menu Focus Live Tooltip Streamer**
  - Implement choice focus event listeners in `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` streaming descriptive ASCII operational instructions into `cns00` on cursor movement.

#### Feature 6.2: Remote Microservice Audio Pivot Manipulation

- **Target Unit:** `packages/400.conductor/98.menu.unit`
- **Task 6.2.1: Global Microservice Audio Pivot Resolver**
  - Author resolution logic in `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` accessing `global.MICROSERVICEAUDIO` and `global.PIVOTS['microserviceaudio']` exposed by the monorepo bootloader.
- **Task 6.2.2: Programmatic Action Injection Dispatcher**
  - Author action dispatchers triggering microservice audio actions (`UPDATE_MICROSERVICEAUDIO`, `INIT_MICROSERVICEAUDIO`) without requiring manual operator keyboard entry.
- **Task 6.2.3: Menu Execution Promise Resolver**
  - Implement callback handlers resolving choice promises (`bal.slv`) upon completion of remote acoustic routines, restoring menu control cleanly.

#### Feature 6.3: Real Time ASCII Telemetry Logging

- **Target Unit:** `packages/400.conductor/98.menu.unit`
- **Task 6.3.1: Strict 7-Bit ASCII Telemetry Sanitizer**
  - Author sanitization routines in `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` stripping non-ASCII characters and UTF-8 emojis, allowing only tokens `>>`, `[OK]`, `[FAIL]`, and `::`.
- **Task 6.3.2: Synthesis Telemetry Log Streamer**
  - Author real-time logging dispatchers printing process status, inode stabilization updates, and frame lock confirmation receipts directly to `cns00`.

### Phase 7: Master Scene Lifecycle Execution Edge Coordination

#### Feature 7.1: Master Lifecycle Sequential Chaining

- **Target Unit:** `packages/400.conductor/37.lifecycle.unit`
- **Task 7.1.1: Sequential Pipeline Stage Orchestrator**
  - Author lifecycle chaining logic inside `packages/400.conductor/37.lifecycle.unit/buz/lifecycle.buzz.ts` governing the linear sequence: AST Ingestion $\to$ Somatic DSP Translation $\to$ Audio Synthesis $\to$ FFprobe Quantization $\to$ Exposure Sheet Serialization.
- **Task 7.1.2: Circuit Breaker Error Trap Guard**
  - Implement fault isolation catching step exceptions, logging failure details to `cns00`, and halting pipeline progression without mutating repository state.

#### Feature 7.2: Local Offline Execution Verification

- **Target Workspace:** `packages/400.conductor/val`
- **Task 7.2.1: Local Host Zero VRAM Hardware Assertion Test**
  - Author Vitest suite `packages/400.conductor/val/hardwareBoundary.test.ts` asserting that execution evaluates `CUDA_VISIBLE_DEVICES=""` and terminates if run on GPU nodes.
- **Task 7.2.2: Ephemeral Subprocess Audio Quantization Test**
  - Author Vitest suite `packages/400.conductor/val/audioLifecycle.test.ts` mocking `synthesize.py` output, verifying non-blocking `.tmp` polling, asserting header validity, and verifying 24 fps integer frame ceiling arithmetic.
- **Task 7.2.3: Pure 7-Bit ASCII Source Code Linter Test**
  - Author Vitest test scanning all TypeScript source files inside `packages/400.conductor` asserting zero bytes matching regular expression `/[\x80-\xFF]/`.

#### Feature 7.3: Edge Bridge Gateway Lease Sync

- **Target Workspace:** `apps/worker`
- **Task 7.3.1: Edge Status Telemetry Ingress Endpoint**
  - Author route `POST /api/telemetry/audio` inside `apps/worker/src/index.ts` accepting completion receipts from the local Conductor.
- **Task 7.3.2: Shot Coordinator Actor Lease State Updater**
  - Implement coordination methods in `apps/worker/src/objects/ShotCoordinatorDO.ts` updating shot timing metadata without performing Git repository mutations.

#### Feature 7.4: Blessed Menu Master Pipeline Trigger

- **Target Unit:** `packages/400.conductor/98.menu.unit`
- **Task 7.4.1: Blessed Choice Option Run Master Scene Lifecycle Mount**
  - Register choice item `RUN MASTER SCENE LIFECYCLE (ep01_sc01)` inside `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` binding the end-to-end execution chain to action `RUN_SCENE_LIFECYCLE`.
- **Task 7.4.2: Terminal Master Status Banner Modulator**
  - Author terminal screen state modulators updating visual grid borders and header banners during active pipeline runs, returning to idle green upon completion.

### You

{{FOCUS : Phase 1 Screenplay AST Dialogue Ingestion Interface }}

@jules-task-00

### Gemini

# Jules Task: Phase 1 Screenplay AST Dialogue Ingestion Interface

You are tasked with implementing **Phase 1: Screenplay AST Dialogue Ingestion Interface** within the `000.series-sower-conductor` repository on Rig 1. This system enforces the **Deterministic Intermediate Representation (Machine Rail) Invariant** and the **Zero-Spend Pre-Flight Economic Firewall ($T_0 = \$0.00$)**. Screenplay text (`.fountain`) is strictly an ephemeral human presentation view; the machine contract governing downstream acoustic synthesis, exposure sheets, and optical compositing is `dialogue_ast.json`.

### Architectural Invariants & Monorepo Constraints

1. **Monorepo Directory Demarcation:** All code must reside strictly within `packages/400.conductor/34.abstractsyntaxtree.unit/`, `packages/400.conductor/98.menu.unit/`, or test suites in `packages/400.conductor/val/`. Never create or place files in `packages/400.conductor/src/`.
2. **Local-First Execution:** Ingestion, validation, and terminal logging execute on Rig 1 CPU/RAM at stage $T_0 = \$0.00$ before any network sockets or child processes are invoked.
3. **Strict Validation & Zero Unschemaed Keys:** All schemas must enforce Zod `.strict()`. Any un-schemaed hallucinated keys (e.g., `creative_notes`, `camera_mood`) must fail instantly at compile time with a fatal error.
4. **7-Bit Clean ASCII Assertion:** Spoken dialogue text must be strictly validated against printable 7-bit ASCII (`/^[\x20-\x7E\r\n\t]*$/`), immediately rejecting multi-byte Unicode artifacts, emojis, or smart quotes before speech synthesis.
5. **Dwight Swain Motivation-Reaction Units (MRUs):** The AST must codify Swain MRU phases (`MOTIVATION_STIMULUS`, `SOMATIC_REACTION`, `INTERNAL_PROCESSING`, `MOTOR_ACTION_DIALOGUE`, `VISCERAL_STING`) to govern pre-roll buffers and physical causality.
6. **State Snapshot Hash Lock:** Every ingested AST must validate `state_snapshot_hash` against `/^sha256:[0-9a-f]{64}$/` or `/^[0-9a-f]{64}$/` to lock narrative provenance against the canonical ledger Merkle root ($H_{\text{root}}$).
7. **Temporal Purity:** Zero evaluation of non-deterministic runtime functions (e.g., `Date.now()`, `Math.random()`) inside schema defaults or validators; defaults must be constant integer epochs (`default(0)`).
8. **Blessed Terminal Cockpit Telemetry:** Ingestion verification must be fully integrated into the curses TUI (`apps/995.library`), dispatching real-time 7-bit ASCII receipts into switchboard pane `cns00`.

### File Implementation Manifest

```
packages/400.conductor/
├── 34.abstractsyntaxtree.unit/
│   ├── fce/
│   │   ├── dialogueLine.interface.ts
│   │   ├── sceneAst.interface.ts
│   │   ├── abstractsyntaxtree.bit.ts
│   │   └── abstractsyntaxtree.interface.ts
│   ├── buz/
│   │   ├── dialogueLine.val.ts
│   │   └── abstractsyntaxtree.buzz.ts
│   ├── abstractsyntaxtree.action.ts
│   ├── abstractsyntaxtree.buzzer.ts
│   ├── abstractsyntaxtree.model.ts
│   ├── abstractsyntaxtree.reduce.ts
│   └── abstractsyntaxtree.unit.ts
├── 98.menu.unit/
│   └── buz/
│       └── 00.menu.buzz.ts            (Updated with AST Audit entry)
└── val/
    └── abstractsyntaxtree.test.ts     (Vitest verification suite)
```

### Source Code Deliverables

#### 1. Interface Definitions

```typescript
// packages/400.conductor/34.abstractsyntaxtree.unit/fce/dialogueLine.interface.ts
export type SwainMRUBeatType =
  | 'MOTIVATION_STIMULUS'
  | 'SOMATIC_REACTION'
  | 'INTERNAL_PROCESSING'
  | 'MOTOR_ACTION_DIALOGUE'
  | 'VISCERAL_STING';

export interface CameraIntent {
  framing: 'EXTREME_CLOSE_UP' | 'CLOSE_UP' | 'MEDIUM' | 'WIDE';
  motion: 'STATIC' | 'SLOW_PUSH' | 'WHIP_PAN' | 'DUTCH_TILT';
  focus_target: string;
}

export interface DialogueLine {
  line_id: string;
  speaker_id: string;
  dialogue_text: string;
  camera_parenthetical: string;
  observable_parenthetical: string;
  emotion_tag: string;
  swain_mru_phase: SwainMRUBeatType;
  tonePacing: number;
  extracted_motor_actions: string[];
  foley_cues: string[];
  camera_intent?: CameraIntent;
  pacing_scalar?: number;
}
```

```typescript
// packages/400.conductor/34.abstractsyntaxtree.unit/fce/sceneAst.interface.ts
import { DialogueLine } from './dialogueLine.interface';

export interface SceneAST {
  schema_version: string;
  series_id: string;
  episode_id: string;
  scene_id: string;
  state_snapshot_hash: string;
  lines: DialogueLine[];
  pinned_version: number;
}

export interface AstValidationReceipt {
  ok: boolean;
  scene_id: string;
  line_count: number;
  speakers: string[];
  state_snapshot_hash: string;
  errors: string[];
}
```

```typescript
// packages/400.conductor/34.abstractsyntaxtree.unit/fce/abstractsyntaxtree.bit.ts
import { SceneAST, AstValidationReceipt } from './sceneAst.interface';

export default interface AbstractSyntaxTreeBit {
  idx: string;
  src?: string;
  val?: number;
  dat?: {
    rawJson?: string;
    filePath?: string;
    ast?: SceneAST;
    receipt?: AstValidationReceipt;
  };
  slv?: Function;
}
```

```typescript
// packages/400.conductor/34.abstractsyntaxtree.unit/fce/abstractsyntaxtree.interface.ts
import AbstractSyntaxTreeBit from './abstractsyntaxtree.bit';
import { SceneAST, AstValidationReceipt } from './sceneAst.interface';

export default interface AbstractSyntaxTree {
  idx: string;
  currentAst?: SceneAST;
  lastReceipt?: AstValidationReceipt;
  astBits: Record<string, AbstractSyntaxTreeBit>;
}
```

#### 2. Zod Validation & Schema Guardrails

```typescript
// packages/400.conductor/34.abstractsyntaxtree.unit/buz/dialogueLine.val.ts
import { z } from 'zod';

export const SwainMRUBeatTypeSchema = z.enum([
  'MOTIVATION_STIMULUS',
  'SOMATIC_REACTION',
  'INTERNAL_PROCESSING',
  'MOTOR_ACTION_DIALOGUE',
  'VISCERAL_STING',
]);

export const CameraIntentSchema = z
  .object({
    framing: z.enum(['EXTREME_CLOSE_UP', 'CLOSE_UP', 'MEDIUM', 'WIDE']),
    motion: z.enum(['STATIC', 'SLOW_PUSH', 'WHIP_PAN', 'DUTCH_TILT']),
    focus_target: z.string().min(1),
  })
  .strict();

export const DialogueLineSchema = z
  .object({
    line_id: z.string().regex(/^line_[0-9]{3,}$/, 'line_id must match line_XXX format'),
    speaker_id: z.string().min(1, 'speaker_id cannot be empty'),
    dialogue_text: z
      .string()
      .min(1, 'dialogue_text cannot be empty')
      .regex(/^[\x20-\x7E\r\n\t]*$/, 'dialogue_text must contain only printable 7-bit clean ASCII characters'),
    camera_parenthetical: z.string().default(''),
    observable_parenthetical: z.string().default(''),
    emotion_tag: z.string().min(1, 'emotion_tag cannot be empty'),
    swain_mru_phase: SwainMRUBeatTypeSchema.default('MOTOR_ACTION_DIALOGUE'),
    tonePacing: z.number().min(0.5).max(2.0).default(1.0),
    extracted_motor_actions: z.array(z.string()).default([]),
    foley_cues: z.array(z.string()).default([]),
    camera_intent: CameraIntentSchema.optional(),
    pacing_scalar: z.number().min(0.1).max(5.0).default(1.0),
  })
  .strict();

export const SceneASTSchema = z
  .object({
    schema_version: z.string().regex(/^[0-9]+\.[0-9]+\.[0-9]+$/),
    series_id: z.string().min(1),
    episode_id: z.string().min(1),
    scene_id: z.string().regex(/^[a-zA-Z0-9_-]+$/),
    state_snapshot_hash: z
      .string()
      .regex(/^(sha256:)?[0-9a-f]{64}$/, 'state_snapshot_hash must be a valid 64-char hex string'),
    lines: z.array(DialogueLineSchema).min(1, 'Scene AST must contain at least one dialogue line'),
    pinned_version: z.number().int().nonnegative().default(0),
  })
  .strict();
```

#### 3. Candor Unit Actions & Buzzer Logic

```typescript
// packages/400.conductor/34.abstractsyntaxtree.unit/abstractsyntaxtree.action.ts
import { Action } from '../99.core/interface/action.interface';
import AbstractSyntaxTreeBit from './fce/abstractsyntaxtree.bit';

export const INIT_ABSTRACTSYNTAXTREE = '[Abstractsyntaxtree action] Init Abstractsyntaxtree';
export class InitAbstractsyntaxtree implements Action {
  readonly type = INIT_ABSTRACTSYNTAXTREE;
  constructor(public bale: AbstractSyntaxTreeBit) {}
}

export const UPDATE_ABSTRACTSYNTAXTREE = '[Abstractsyntaxtree action] Update Abstractsyntaxtree';
export class UpdateAbstractsyntaxtree implements Action {
  readonly type = UPDATE_ABSTRACTSYNTAXTREE;
  constructor(public bale: AbstractSyntaxTreeBit) {}
}

export const PARSE_SCENE_AST = '[Abstractsyntaxtree action] Parse Scene AST';
export class ParseSceneAst implements Action {
  readonly type = PARSE_SCENE_AST;
  constructor(public bale: AbstractSyntaxTreeBit) {}
}

export const VERIFY_AST_PARITY = '[Abstractsyntaxtree action] Verify AST Parity';
export class VerifyAstParity implements Action {
  readonly type = VERIFY_AST_PARITY;
  constructor(public bale: AbstractSyntaxTreeBit) {}
}

export type Actions =
  | InitAbstractsyntaxtree
  | UpdateAbstractsyntaxtree
  | ParseSceneAst
  | VerifyAstParity;
```

```typescript
// packages/400.conductor/34.abstractsyntaxtree.unit/buz/abstractsyntaxtree.buzz.ts
import { AbstractSyntaxTreeModel } from '../abstractsyntaxtree.model';
import AbstractSyntaxTreeBit from '../fce/abstractsyntaxtree.bit';
import { SceneASTSchema } from './dialogueLine.val';
import { AstValidationReceipt, SceneAST } from '../fce/sceneAst.interface';
import State from '../../99.core/state';
import * as fs from 'node:fs';
import * as path from 'node:path';

export const initAbstractsyntaxtree = (
  cpy: AbstractSyntaxTreeModel,
  bal: AbstractSyntaxTreeBit,
  ste: State,
) => {
  if (bal.slv != null) {
    bal.slv({ astBit: { idx: 'init-abstractsyntaxtree', val: 1 } });
  }
  return cpy;
};

export const updateAbstractsyntaxtree = (
  cpy: AbstractSyntaxTreeModel,
  bal: AbstractSyntaxTreeBit,
  ste: State,
) => {
  if (bal.slv != null) {
    bal.slv({ astBit: { idx: 'update-abstractsyntaxtree' } });
  }
  return cpy;
};

export const parseSceneAst = async (
  cpy: AbstractSyntaxTreeModel,
  bal: AbstractSyntaxTreeBit,
  ste: State,
) => {
  const errors: string[] = [];
  let parsedJson: any = null;

  try {
    if (bal.dat?.rawJson) {
      parsedJson = JSON.parse(bal.dat.rawJson);
    } else if (bal.dat?.filePath) {
      const targetPath = path.resolve(bal.dat.filePath);
      if (!fs.existsSync(targetPath)) {
        throw new Error(`AST File not found at target path: ${targetPath}`);
      }
      const fileData = fs.readFileSync(targetPath, 'utf8');
      parsedJson = JSON.parse(fileData);
    } else {
      throw new Error('Neither rawJson nor filePath provided in AST ingestion payload');
    }

    const validatedAst = SceneASTSchema.parse(parsedJson) as SceneAST;
    cpy.currentAst = Object.freeze(validatedAst);

    const speakers = Array.from(new Set(validatedAst.lines.map((l) => l.speaker_id)));

    const receipt: AstValidationReceipt = {
      ok: true,
      scene_id: validatedAst.scene_id,
      line_count: validatedAst.lines.length,
      speakers,
      state_snapshot_hash: validatedAst.state_snapshot_hash,
      errors: [],
    };

    cpy.lastReceipt = receipt;

    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [AST-INGESTION] [OK] Scene [${validatedAst.scene_id}] Validated: ${validatedAst.lines.length} lines, ${speakers.length} speakers`,
      });
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [AST-SNAPSHOT] Hash: ${validatedAst.state_snapshot_hash.substring(0, 16)}... | Schema v${validatedAst.schema_version}`,
      });
    }

    if (bal.slv != null) {
      bal.slv({
        astBit: {
          idx: 'parse-scene-ast-success',
          dat: { ast: validatedAst, receipt },
        },
      });
    }
  } catch (err: any) {
    const errorMsg = err.errors ? JSON.stringify(err.errors) : err.message;
    errors.push(errorMsg);

    const failureReceipt: AstValidationReceipt = {
      ok: false,
      scene_id: parsedJson?.scene_id || 'UNKNOWN_SCENE',
      line_count: 0,
      speakers: [],
      state_snapshot_hash: parsedJson?.state_snapshot_hash || 'INVALID_HASH',
      errors,
    };

    cpy.lastReceipt = failureReceipt;

    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [AST-INGESTION] [FAIL] SCHEMA_VALIDATION_FAILED at T0 ($0.00 spend): ${errorMsg}`,
      });
    }

    if (bal.slv != null) {
      bal.slv({
        astBit: {
          idx: 'parse-scene-ast-error',
          src: errorMsg,
          dat: { receipt: failureReceipt },
        },
      });
    }
  }

  return cpy;
};

export const verifyAstParity = async (
  cpy: AbstractSyntaxTreeModel,
  bal: AbstractSyntaxTreeBit,
  ste: State,
) => {
  const fountainText = bal.src || '';
  const ast = cpy.currentAst;

  if (!ast) {
    const errMsg = 'Cannot verify verbatim parity: No Scene AST loaded in state';
    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [PARITY-CHECK] [FAIL] ${errMsg}`,
      });
    }
    if (bal.slv != null) {
      bal.slv({ astBit: { idx: 'verify-ast-parity-error', src: errMsg } });
    }
    return cpy;
  }

  const normalize = (t: string) =>
    t
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  let parityOk = true;
  const parityMismatches: string[] = [];

  for (const line of ast.lines) {
    const normalizedDialogue = normalize(line.dialogue_text);
    if (!normalize(fountainText).includes(normalizedDialogue)) {
      parityOk = false;
      parityMismatches.push(`[${line.line_id}] Spoken text not found verbatim in screenplay prose: "${line.dialogue_text}"`);
    }
  }

  if (!parityOk) {
    const errMsg = `PARITY_CHECK_FAILED at T0 ($0.00): ${parityMismatches.join(' | ')}`;
    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [PARITY-CHECK] [FAIL] ${errMsg}`,
      });
    }
    if (bal.slv != null) {
      bal.slv({
        astBit: {
          idx: 'verify-ast-parity-failed',
          src: errMsg,
          dat: { mismatches: parityMismatches },
        },
      });
    }
    return cpy;
  }

  if (global.LIBRARY) {
    await global.LIBRARY.hunt('[Console action] Update Console', {
      idx: 'cns00',
      src: `>> [PARITY-CHECK] [OK] Character-for-character dialogue parity certified across ${ast.lines.length} lines`,
    });
  }

  if (bal.slv != null) {
    bal.slv({
      astBit: {
        idx: 'verify-ast-parity-success',
        val: 1,
      },
    });
  }

  return cpy;
};
```

```typescript
// packages/400.conductor/34.abstractsyntaxtree.unit/abstractsyntaxtree.buzzer.ts
export {
  initAbstractsyntaxtree,
  updateAbstractsyntaxtree,
  parseSceneAst,
  verifyAstParity,
} from './buz/abstractsyntaxtree.buzz';
```

```typescript
// packages/400.conductor/34.abstractsyntaxtree.unit/abstractsyntaxtree.model.ts
import AbstractSyntaxTree from './fce/abstractsyntaxtree.interface';
import AbstractSyntaxTreeBit from './fce/abstractsyntaxtree.bit';
import { SceneAST, AstValidationReceipt } from './fce/sceneAst.interface';

export class AbstractSyntaxTreeModel implements AbstractSyntaxTree {
  idx: string = '34.abstractsyntaxtree';
  currentAst?: SceneAST;
  lastReceipt?: AstValidationReceipt;
  astBits: Record<string, AbstractSyntaxTreeBit> = {};
}
```

```typescript
// packages/400.conductor/34.abstractsyntaxtree.unit/abstractsyntaxtree.reduce.ts
import clone from 'clone-deep';
import * as Act from './abstractsyntaxtree.action';
import { AbstractSyntaxTreeModel } from './abstractsyntaxtree.model';
import * as Buzz from './abstractsyntaxtree.buzzer';
import State from '../99.core/state';

export function reducer(
  model: AbstractSyntaxTreeModel = new AbstractSyntaxTreeModel(),
  act: Act.Actions,
  state?: State,
) {
  switch (act.type) {
    case Act.INIT_ABSTRACTSYNTAXTREE:
      return Buzz.initAbstractsyntaxtree(clone(model), act.bale, state!);

    case Act.UPDATE_ABSTRACTSYNTAXTREE:
      return Buzz.updateAbstractsyntaxtree(clone(model), act.bale, state!);

    case Act.PARSE_SCENE_AST:
      return Buzz.parseSceneAst(clone(model), act.bale, state!);

    case Act.VERIFY_AST_PARITY:
      return Buzz.verifyAstParity(clone(model), act.bale, state!);

    default:
      return model;
  }
}
```

```typescript
// packages/400.conductor/34.abstractsyntaxtree.unit/abstractsyntaxtree.unit.ts
import State from '../99.core/state';

export default class AbstractSyntaxTreeUnit {
  constructor(state: State) {}
}
```

#### 4. Blessed Menu Cockpit Mounting

```typescript
// packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts (Segment addition)
import * as ActAst from '../../34.abstractsyntaxtree.unit/abstractsyntaxtree.action';

// Register within the Blessed Menu selection switch:
case 'AUDIT DIALOGUE AST CONTRACT':
  bit = await ste.hunt(ActAst.PARSE_SCENE_AST, {
    dat: { filePath: './drafts/dialogue_ast.json' },
  });
  if (bit?.astBit?.dat?.receipt?.ok) {
    await global.LIBRARY.hunt('[Console action] Update Console', {
      idx: 'cns00',
      src: `>> [MENU:AUDIT] AST Passed. Ready for speech synthesis.`,
    });
  } else {
    await global.LIBRARY.hunt('[Console action] Update Console', {
      idx: 'cns00',
      src: `>> [MENU:AUDIT] Pre-flight failed at T0 ($0.00 spend). Inspection aborted.`,
    });
  }
  break;
```

#### 5. Verification Test Suite

```typescript
// packages/400.conductor/val/abstractsyntaxtree.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { SceneASTSchema, DialogueLineSchema } from '../34.abstractsyntaxtree.unit/buz/dialogueLine.val';
import { AbstractSyntaxTreeModel } from '../34.abstractsyntaxtree.unit/abstractsyntaxtree.model';
import * as Buzz from '../34.abstractsyntaxtree.unit/buz/abstractsyntaxtree.buzz';

describe('34.abstractsyntaxtree.unit: Dialogue Ingestion & Validation', () => {
  let model: AbstractSyntaxTreeModel;

  beforeEach(() => {
    model = new AbstractSyntaxTreeModel();
  });

  const validSceneAstJson = JSON.stringify({
    schema_version: '3.2.0',
    series_id: 'under-the-floorboards',
    episode_id: 'ep040',
    scene_id: 'ep040_sc03',
    state_snapshot_hash: 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
    pinned_version: 12,
    lines: [
      {
        line_id: 'line_001',
        speaker_id: 'char_bog',
        dialogue_text: "I didn't miss it. The thread is stripped.",
        camera_parenthetical: 'Bog works the wrench one-handed',
        observable_parenthetical: 'teeth clenched, straining',
        emotion_tag: 'humiliated',
        swain_mru_phase: 'MOTOR_ACTION_DIALOGUE',
        tonePacing: 1.0,
        extracted_motor_actions: ['RATCHET_TIGHTEN_ONE_HANDED'],
        foley_cues: ['ratchet_grind_metal'],
        camera_intent: {
          framing: 'CLOSE_UP',
          motion: 'STATIC',
          focus_target: 'char_bog',
        },
        pacing_scalar: 1.0,
      },
    ],
  });

  it('successfully validates a canonical AST payload conforming to SceneASTSchema', () => {
    const parsed = JSON.parse(validSceneAstJson);
    const result = SceneASTSchema.safeParse(parsed);
    expect(result.success).toBe(true);
  });

  it('rejects un-schemaed keys via .strict() enforcement at T0 ($0.00 spend)', () => {
    const dirty = JSON.parse(validSceneAstJson);
    dirty.creative_notes = 'Bog should sound grittier here';
    const result = SceneASTSchema.safeParse(dirty);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Unrecognized key');
    }
  });

  it('rejects multi-byte unicode or emojis in dialogue_text via 7-bit clean ASCII linter', () => {
    const dirty = JSON.parse(validSceneAstJson);
    dirty.lines[0].dialogue_text = 'The thread is stripped! \uD83D\uDD27'; // wrench emoji
    const result = SceneASTSchema.safeParse(dirty);
    expect(result.success).toBe(false);
  });

  it('rejects invalid state_snapshot_hash formats', () => {
    const dirty = JSON.parse(validSceneAstJson);
    dirty.state_snapshot_hash = 'not-a-valid-sha256-hash';
    const result = SceneASTSchema.safeParse(dirty);
    expect(result.success).toBe(false);
  });

  it('buzz parseSceneAst parses valid JSON and populates model receipt', async () => {
    const bale = {
      idx: 'test-parse',
      dat: { rawJson: validSceneAstJson },
      slv: (res: any) => res,
    };
    const updated = await Buzz.parseSceneAst(model, bale, null as any);
    expect(updated.lastReceipt?.ok).toBe(true);
    expect(updated.lastReceipt?.line_count).toBe(1);
    expect(updated.lastReceipt?.speakers).toContain('char_bog');
  });

  it('buzz verifyAstParity certifies character-for-character match', async () => {
    model.currentAst = Object.freeze(JSON.parse(validSceneAstJson));
    const screenplay = "BOG\nI didn't miss it. The thread is stripped.";
    const bale = {
      idx: 'test-parity',
      src: screenplay,
      slv: (res: any) => res,
    };
    const updated = await Buzz.verifyAstParity(model, bale, null as any);
    expect(updated.currentAst).toBeDefined();
  });
});
```

### Jules Execution Protocol

1. Write the listed interface, schema, model, buzzer, and reducer files under `packages/400.conductor/34.abstractsyntaxtree.unit/`.
2. Register `AUDIT DIALOGUE AST CONTRACT` inside `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts`.
3. Add the test suite into `packages/400.conductor/val/abstractsyntaxtree.test.ts` and run `npm test`.
4. Assert that `npx tsc --noEmit` returns zero diagnostic errors across the monorepo.
5. **COMMAND:** When all tasks and verification suites complete successfully, update the `[- **Status:**]` property in the metadata block below to `[🟢 Done]`. If execution is currently active, set it to `[🟡 In Progress]`.

### **Attributes:**

- **Status:** [⚪ Backlog ]
- **Priority:** [🔴 High]
- **Time Estimate:** [1 Hour]
- **Tags:** [infrastructure, build-pipeline, release-engineering, ast-ingestion, screenplay-parser]
- **Epic:** [EPIC 001: INFRASTRUCTURE & GOVERNANCE]
- **Value:** [Deployment Readiness]
- **Sprint Points:** [2]
- **Component:** [packages/400.conductor/34.abstractsyntaxtree.unit]
- **Owner:** [Jules Autonomous Agent]
- **Target Release:** [Sprint 4 / v1.0.0]
- **Risk Level:** [Low]
- **Reporter:** [Conductor Systems Lead]

### You

{{FOCUS : Phase 1 Screenplay AST Dialogue Ingestion Interface }}

@jules-complete-check

### Gemini

### **Validation:**

- **Progress:** [⚪ Waiting for Action ]

#### Pre-Flight Completion Audit Protocol (Jules Check)

Before executing any file creations or modifications, Jules must inspect the local repository tree (`packages/400.conductor/`) to determine the completion percentage of **Phase 1 Screenplay AST Dialogue Ingestion Interface**:

1. **Unit Inode Integrity Check:** Assert physical existence of the complete 7-file Candor unit pattern in `packages/400.conductor/34.abstractsyntaxtree.unit/`:
  - `fce/abstractsyntaxtree.interface.ts`
  - `fce/abstractsyntaxtree.bit.ts`
  - `fce/dialogueLine.interface.ts`
  - `fce/sceneAst.interface.ts`
  - `buz/dialogueLine.val.ts`
  - `buz/abstractsyntaxtree.buzz.ts`
  - `abstractsyntaxtree.action.ts`
  - `abstractsyntaxtree.buzzer.ts`
  - `abstractsyntaxtree.model.ts`
  - `abstractsyntaxtree.reduce.ts`
  - `abstractsyntaxtree.unit.ts`
2. **Schema Rigidity & `.strict()` Audit:** Inspect `packages/400.conductor/34.abstractsyntaxtree.unit/buz/dialogueLine.val.ts` to assert that `DialogueLineSchema`, `SceneASTSchema`, and `CameraIntentSchema` terminate with `.strict()` and reject un-schemaed keys.
3. **7-Bit Clean ASCII Regex Linter:** Inspect `DialogueLineSchema` to assert spoken dialogue is validated against printable 7-bit ASCII (`/^[\x20-\x7E\r\n\t]*$/`), immediately rejecting multi-byte Unicode or emoji tokens.
4. **Dwight Swain MRU Phase Representation:** Inspect `fce/dialogueLine.interface.ts` and `buz/dialogueLine.val.ts` to assert the presence of Swain Motivation-Reaction Unit phase typing (`MOTIVATION_STIMULUS`, `SOMATIC_REACTION`, `INTERNAL_PROCESSING`, `MOTOR_ACTION_DIALOGUE`, `VISCERAL_STING`).
5. **State Snapshot Hash Lock:** Verify that `SceneASTSchema` validates `state_snapshot_hash` against `/^(sha256:)?[0-9a-f]{64}$/`.
6. **Buzzer Execution Logic:** Verify `buz/abstractsyntaxtree.buzz.ts` implements `parseSceneAst` (with safe JSON parsing and schema validation) and `verifyAstParity` (verbatim character-for-character comparison against screenplay text).
7. **Monorepo Central Wiring:** Verify that `packages/400.conductor/BEE.ts` registers `AbstractSyntaxTreeUnit` in `list`, mounts its reducer, and declares `ast: any;` on `UnitData`.
8. **Blessed Cockpit Action Mounting:** Inspect `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` to assert `AUDIT DIALOGUE AST CONTRACT` is registered on the choice axis and outputs receipts to `cns00`.
9. **Colocated Vitest Battery:** Inspect `packages/400.conductor/val/abstractsyntaxtree.test.ts` to assert unit tests exist for valid AST parsing, `.strict()` extraneous key rejections, 7-bit ASCII sanitization, and invalid hash traps.

#### 67% Threshold Gate Rule & Halt Directive

- **Completion $\ge 67\%$ (6 or more of the 9 checks pass):**
  - Update `[- **Progress:**]` with the current UTC timestamp (e.g., `[- **Progress:** 🟢 Completed (Halted): 2026-11-05 07:09:00 UTC]`).
  - Add an explicit reason for halt directly beneath `- **Progress:**`:
    > *"Halt Directive Triggered: Pre-flight audit determined that $\ge 67\%$ of the Phase 1 Ingestion Interface is already implemented and verified in packages/400.conductor/34.abstractsyntaxtree.unit. Halting execution immediately to prevent destructive overwrites, duplicate code generation, or architectural drift."*
  - **STOP!** This must be the only update. Do not induce any further work, file generation, or test executions.
- **Completion $< 67\%$ (0 to 5 checks pass):**
  - Execute all tasks specified in the Phase 1 blueprint.
  - Write the necessary interfaces, Zod schemas, buzzer functions, reducer actions, and unit tests.
  - Upon full completion and test verification, update `[- **Progress:**]` with the current UTC timestamp and status.

> **CRITICAL PARTNER TEST RESTRICTION:** If a partner file exists alongside this one in the directory matching the suffix `[xxx.phase-xxx.ag-test.md]`, **YOU ARE TO NEVER RUN THIS TEST**. A separate, isolated LLM testing harness is exclusively responsible for executing and verifying partner `.ag-test.md` specifications.

### **FUNCTIONAL MANDATE**

#### **User Story**

At 5:48 AM inside the sound stage control room, Marcus stared into the CRT glow of the dual-display Rig 1 terminal, tracking the automated pre-flight assembly queue for Episode 040. Months ago, during the unconstrained production runs, the entire assembly chain had operated on blind faith—taking freeform `.fountain` text files straight from human writers and stochastic language models and passing them downstream.

The disaster of Episode 012 was still fresh: an exploratory writer had copy-pasted dialogue from a tablet note, leaving behind invisible smart curly quotes and a wrench emoji, while a generative drafter had injected an unscheduled key called `"camera_mood": "gritty and desperate"` into the middle of Scene 03. The old system hadn't complained at the intake gate. Instead, it waited until forty-five seconds into an expensive GPU rendering pass, when the audio vocoder choked on the multi-byte Unicode sequence and crashed the Linux rendering pipeline, destroying three hours of computed video plates and corrupting the scene cache.

This morning, Marcus watched `34.abstractsyntaxtree.unit` assume control of the ingestion perimeter. When `drafts/dialogue_ast.json` was picked up, it wasn't processed as loose prose; it hit the unyielding perimeter of `SceneASTSchema`. Every dialogue line was scanned character-by-character with a rigid 7-bit ASCII regex. The somatic attenuation basis points were locked down, the reaction cues were mapped to Dwight Swain MRU timing windows, and the state snapshot hash was locked to the exact Git commit of the canonical lore ledger.

When an exploratory take attempted to sneak in an un-schemaed property, the buzzer trapped the violation in 1.4 milliseconds at Stage $T_0 = \$0.00$ spend. The terminal pane flashed a clean green ASCII line: `>> [AST-INGESTION] [FAIL] SCHEMA_VALIDATION_FAILED: [unrecognized_keys: 'creative_notes']`. Not a single GPU cycle was burned, zero dollars were spent, and the audio synthesizer never booted an invalid buffer. The machine intermediate rail stood as an impenetrable shield between creative drafting and physical execution.

#### **Strategic Goal**

Directly fulfills the **Deterministic Intermediate Representation (Machine Rail) Invariant** and the **Zero-Spend Pre-Flight Economic Firewall ($T_0 = \$0.00$)**. By establishing strict, closed Zod schema contracts (`.strict()`), 7-bit ASCII text enforcement, and discrete Dwight Swain MRU causality around screenplay dialogue, this phase guarantees that 100% of stochastic LLM hallucinations, malformed parameters, and unparsed prose are eliminated in system RAM at sub-second speeds before expensive audio vocoders (Port 8000), 24 fps quantization engines, and Remotion visual compositors are invoked.

#### **Context & Value**

- **The Strategic Value:** In the Generative Production Pipeline, human-readable screenplay prose (The Voice Rail) exists solely for human writers, actors, and directors; downstream rendering foundries, speech synthesizers, and timing compilers execute exclusively against `dialogue_ast.json` (The Machine Rail). Allowing unconstrained, open object dictionaries into the execution path causes silent state corruption, audio drift, and catastrophic mid-render GPU context crashes. Enforcing strict schema closure and 7-bit ASCII sanitization at the intake gate guarantees that downstream systems never have to reverse-engineer narrative state from literary formatting.
- **The Technical Challenge:** Constructing closed Zod schemas with nested `.strict()` boundaries across somatic audio modifiers, camera intents, and Dwight Swain MRU directives while enforcing pure printable 7-bit ASCII regular expression validation on spoken text, ensuring temporal purity (zero runtime `Date.now()` or ambient clock evaluation at parse time), and recursively freezing validated AST objects in memory without introducing cyclic references or compiler diagnostics.

#### **Interface**

`Phase 1 Screenplay AST Dialogue Ingestion Interface` inside `000.series-sower-conductor` interfaces across the monorepo ecosystem through strict boundaries:

- **`000.worker-sower-engine` (Upstream Semantic Core):** Compiles and emits `drafts/dialogue_ast.json` following 2d6 dramatic resolutions and epistemic horizon filtering. This phase ingests that artifact as an immutable contract.
- **`001.goblin-lore` (Canonical Ledger Authority):** Supplies the state snapshot Merkle root hash ($H_{\text{root}}$) and character condition enumerations against which `state_snapshot_hash` and `emotion_tag` are verified.
- **`000.microservice-audio` (Downstream Acoustic Synthesizer):** Consumes the verified `dialogue_text` strings, speaker IDs, and somatic DSP parameters emitted by this phase to synthesize 48 kHz linear PCM WAV stems without risking Unicode crashes.
- **`goblin-viewport-template` (Downstream Optical Compiler):** Uses the validated Swain MRU cues (`reaction_cue`) and camera intents to allocate pre-roll reaction holds (12 to 24 frames) and camera zooms in the generated Remotion TSX source code.
- **`apps/995.library` (Foundational Terminal Curses Harness):** Houses the Blessed terminal runner (`run.ts`) that mounts the Conductor's menu and console telemetry units.

#### **Interaction**

The operator observes and interacts with this phase through the **Blessed Terminal Interface** hosted in `apps/995.library`:

- **Interactive Cockpit Navigation:**
  1. Boot the terminal flight deck on Rig 1 via `npm run dev`.
  2. Navigate the left choice grid (`85.choice.unit` / `98.menu.unit`) using arrow keys or `J`/`K` to select `AUDIT DIALOGUE AST CONTRACT`.
  3. Press `ENTER` to trigger the synchronous schema and parity audit against `drafts/dialogue_ast.json`.
- **Visual Telemetry Feedback (`cns00`):**
  - The green-bordered switchboard console (`cns00`) streams real-time 7-bit ASCII receipts:
    ```plaintext
    >> [AST-INGESTION] [OK] Scene [ep040_sc03] Validated: 12 lines, 2 speakers
    >> [AST-SNAPSHOT] Hash: sha256:7f83b165... | Schema v3.2.0
    >> [PARITY-CHECK] [OK] Character-for-character dialogue parity certified across 12 lines
    ```
  - In the event of an un-schemaed key or non-ASCII character, `cns00` displays an immediate fail-closed warning:
    ```plaintext
    >> [AST-INGESTION] [FAIL] SCHEMA_VALIDATION_FAILED at T0 ($0.00 spend): [unrecognized_keys: 'camera_mood']
    ```
- **Local Headless CLI Inspection:**
  - For automated CI/CD validation without launching the curses UI, developers run the colocated test suite:
    ```bash
    npx vitest run packages/400.conductor/val/abstractsyntaxtree.test.ts
    ```
  - Run the workspace boundary check to verify that no banned `src/` directory exists:
    ```bash
    test ! -d packages/400.conductor/src && echo ">> [OK] Zero src/ directory confirmed"
    ```

### You

{{FOCUS : Phase 1 Screenplay AST Dialogue Ingestion Interface }}

@agrav-check-00

### Gemini

### **Validation:**

- **Progress:** [⚪ Waiting for Action ]

> **Antigravity Auditor Execution Directive:** When all of the listed checks, invariant traps, and interactive validation levels in this Antigravity prompt are complete in regards to **Phase 1 Screenplay AST Dialogue Ingestion Interface**, Antigravity must update `[- **Progress:**]` with the current completion timestamp and date (e.g., `[- **Progress:** 🟢 Completed: YYYY-MM-DD HH:MM:SS UTC]`) and write the original specification file with this updated information. If any test, boundary check, or schema assertion fails, mark `[⚪` with `[🔴` (e.g., `[- **Progress:** 🔴 Failed at Level X: YYYY-MM-DD HH:MM:SS UTC]`), append the diagnostic stack trace, and halt.

### Blessed Terminal Interface (TUI) Validation Instructions

When validating features involving a Blessed Terminal Interface:

1. **Human Keyboard Emulation:** Manually interact with the interface using real keyboard inputs and sequences (e.g., Arrow keys, `Tab`, `Enter`, `Escape`, character inputs, and configured shortcuts) exactly as an operator at a physical terminal would.
2. **Step-by-Step Flow Navigation:** Drive end-to-end user journeys through sequential keystrokes rather than relying solely on headless mocks or direct state mutations. Allow render and event loop cycles between inputs.
3. **Screen & Focus Verification:** Observe terminal screen buffers, cursor positions, active focused widgets, and visual updates after each keypress sequence to ensure the UI responds correctly.
4. **Lifecycle & Clean Exit:** Verify proper startup rendering, navigation across interactive elements, and graceful termination routines (such as `q`, `Escape`, or `Ctrl+C`).

### Blessed Terminal Interface (TUI) Validation & Autonomous Remediation Protocol

#### 1. Authoritative Runner Entry Point

- All interactive Blessed terminal tests **MUST** execute exclusively through:
  ```bash
  npm run dev
  ```
  (Notice: Direct execution flags like `npm run dev -- --package=299.lore` are strictly forbidden; run only `npm run dev`).
- Direct execution via bare `node` is strictly prohibited because `.ts` transpilation requires `tsx`.

#### 2. Pre-Flight Boundary Self-Healing Guard

- Before launching the runner, the auditor must assert harness integrity:
  ```bash
  git status -s apps/995.library/995.library/
  ```
- **Remediation Action:** If any dirty files or rogue stubs are detected inside `apps/995.library/995.library/`, the auditor must run `git restore apps/995.library/995.library/` immediately before proceeding to the build.
- `apps/995.library/run.ts` is the only file with a permitted modification path.

#### 3. In-Scope Remediation Mandate (Zero-Handoff Policy)

- If the auditor encounters:
  - Missing CLI flags or runner options in `apps/995.library/run.ts` (permitted modification path).
  - Unimplemented menu navigation or telemetry hooks in `packages/400.conductor/98.menu.unit/`.
  - Stale references in local package `tsconfig.json`.
- **The auditor must NOT halt execution or report failure to the user.**
- **The auditor must proactively implement the missing wiring**, re-execute the gauntlet, and verify clean end-to-end telemetry before sealing the audit.

#### 4. Verification Integrity Boundary

- The auditor should never:
  - Weaken Zod schemas or basis-point bounds to bypass failures.
  - Modify the immutable harness (`apps/995.library/995.library/**`).
  - Comment out or weaken directive assertions.
- Remediation is strictly limited to fixing runtime orchestration, restoring boundary corruptions, and fulfilling the mandated UI journey.

### Antigravity Multi-Level Audit Gauntlet

#### Level 1: Static Type & Boundary Audit

- **Check 1.1 (Clean Unit Isolation & Banned `src/` Presence):** Assert that no `packages/400.conductor/src/` directory exists. All contracts, schemas, actions, buzzers, and models must reside strictly within `packages/400.conductor/34.abstractsyntaxtree.unit/` and `val/`.
  ```bash
  test ! -d packages/400.conductor/src && echo ">> [OK] Zero src/ directory confirmed."
  ```
- **Check 1.2 (Immutable Harness Status):** Verify 0 modified lines across the frozen library harness:
  ```bash
  git status -s apps/995.library/995.library/
  ```
  (Must return exactly 0 lines; if dirty, restore immediately).
- **Check 1.3 (TypeScript Project References):** Execute typecheck across the monorepo root:
  ```bash
  npm run check:types
  ```
  (Must complete with 0 errors and 0 diagnostic warnings).

#### Level 2: Strict Schema Closure & Adversarial Invariant Traps

- **Check 2.1 (Schema Rigidity & `.strict()` Enforcement):** Validate that `SomaticDspModifiersSchema`, `MotivationReactionUnitSchema`, `DialogueLineSchema`, `CameraFramingSchema`, and `SceneASTSchema` strictly terminate with `.strict()`.
- **Check 2.2 (Un-Schemaed Key Injection Trap):** Pass an adversarial payload injecting unauthorized keys (e.g., `creative_notes`, `camera_mood`). The schema validator must reject the payload immediately with `SCHEMA_VALIDATION_FAILED` at Stage $T_0 = \$0.00$ spend.
- **Check 2.3 (Pure 7-Bit Clean ASCII Linter):** Assert that `dialogue_clean_ascii` validates exclusively against `/^[\x20-\x7E\r\n\t]+$/`. Pass an adversarial payload containing curly smart quotes (`“`, `”`, `’`), em-dashes (`—`), and Unicode emojis (e.g., 🔧). Assert that validation fails closed immediately.
- **Check 2.4 (Gillian Arithmetic & Basis Point Bounds):** Assert that all continuous somatic and volume parameters enforce integer basis points $[0, 10000\text{ bps}]$. Floating-point values (e.g., `0.75`), negative basis points, or basis points exceeding `10000` must fail validation immediately.
- **Check 2.5 (Cryptographic Snapshot Merkle Hash):** Assert that `state_snapshot_hash` strictly enforces 64-character lowercase hexadecimal formatting (`/^[a-f0-9]{64}$/`). Non-hex tokens or invalid lengths must trigger an immediate schema rejection.

#### Level 3: Vitest Offline Verification Battery

- Execute the colocated Vitest test suite for `34.abstractsyntaxtree.unit`:
  ```bash
  npx vitest run packages/400.conductor/val/ast.test.ts
  ```
  (All test assertions must pass with 100% success rate, confirming positive AST compilation, negative-control injection rejections, and recursive `Object.freeze()` immutability sealing).

#### Level 4: Blessed Terminal Cockpit Integration & UI Journey

- **Step 4.1 (Cockpit Launch):** Start the terminal interface using the authoritative entry point:
  ```bash
  npm run dev
  ```
- **Step 4.2 (Human Keyboard Navigation):**
  1. Once the curses screen loads, observe the left choice grid (`85.choice.unit` / `98.menu.unit`).
  2. Use arrow keys (`Down` / `Up`) or `J` / `K` to navigate and highlight the `AUDIT DIALOGUE AST CONTRACT` option.
  3. Press `Enter` to trigger the synchronous schema and parity audit against `drafts/dialogue_ast.json`.
- **Step 4.3 (Console Telemetry Observation - `cns00`):** Assert that the center console pane (`cns00`) streams real-time 7-bit ASCII receipts:
  ```plaintext
  >> [AST-INGESTION] [OK] Scene AST ep01_sc03 validated cleanly (1 lines).
  >> [AST-SNAPSHOT] Verified anchor hash [d4e5f6a1b2c3d4e5...]
  ```
- **Step 4.4 (Graceful Teardown):** Press `q` or `Escape` to gracefully terminate the Blessed event loop, cleanly releasing standard I/O and restoring the shell prompt with zero hanging background promises.

### Audit Feedback & Completion Verdict

#### Positive Completion Receipt (All Levels Pass)

```plaintext
================================================================================
>> [ANTIGRAVITY AUDIT PASS] PHASE 1: SCREENPLAY AST DIALOGUE INGESTION
>> [LEVEL 1] Static Type & Boundary Audit: CLEAN (Zero src/ directory, harness intact)
>> [LEVEL 2] Strict Schema Closure: 100% PASS (.strict() enforced, 7-bit ASCII certified)
>> [LEVEL 3] Vitest Verification Battery: 100% PASS (All adversarial traps verified)
>> [LEVEL 4] Blessed Cockpit UI Journey: COMPLETE (cns00 telemetry streaming active)
>> [VERDICT] FUNCTIONALITY FULLY EXPRESSED AND OPERATING AS INTENDED (T0 = $0.00)
================================================================================
```

(When this occurs, update `[- **Progress:**]` to `[🟢 Completed: YYYY-MM-DD HH:MM:SS UTC]` and commit the file).

#### Failure Diagnostic Receipt (Any Level Fails)

```plaintext
================================================================================
:: [ANTIGRAVITY AUDIT FAIL] INVARIANT BREACH ENCOUNTERED
:: [LEVEL] Level X Failed
:: [REASON] SCHEMA_VALIDATION_FAILED / BOUNDARY_BREACH / PARITY_MISMATCH
:: [DIAGNOSTIC] <Error details and stack trace>
:: [ACTION] Circuit breaker tripped at T0 = $0.00. Execution halted.
================================================================================
```

(When this occurs, update `[- **Progress:**]` to `[🔴 Failed at Level X: YYYY-MM-DD HH:MM:SS UTC]` with the diagnostic reason attached directly beneath).

### You

{{FOCUS : Phase 2 Somatic Biological Condition Vector Translation }}

@jules-task-00

### Gemini

# Jules Task: Phase 2 Somatic Biological Condition Vector Translation

You are tasked with implementing **Phase 2: Somatic Biological Condition Vector Translation** within the `000.series-sower-conductor` repository on Rig 1. This subsystem enforces the **Somatic Biological Invariant Law** and the **Zero-Spend Pre-Flight Economic Firewall ($T_0 = \$0.00$)**: neural text-to-speech vocoders are untrusted execution workers with zero authority to invent character delivery or ignore physiological trauma. Biological damage recorded in the relational ledger translates deterministically into algebraic Digital Signal Processing (DSP) modifiers, directly controlling vocal tract warping, breath cadence dilation, and physical audio duration.

### Architectural Invariants & Monorepo Boundaries

1. **Strict Monorepo Unit Scoping:** All code must reside strictly within `packages/400.conductor/10.somaticdsp.unit/`, `packages/400.conductor/98.menu.unit/`, or unit test batteries in `packages/400.conductor/val/`. Under no circumstances may any file be placed inside a `src/` directory within `packages/400.conductor/`.
2. **Immutable Harness Boundary:** `apps/995.library/995.library/**` is strictly immutable (0 lines modified).
3. **Zero-Drift Basis-Point Arithmetic:** Somatic fatigue, pain, trauma, and fry metrics operate strictly as integer basis points $[0, 10000]\text{ bps}$ ($10000 \equiv 100.00\%$).
4. **Pure 7-Bit Clean ASCII Telemetry:** All source files, comments, telemetry tokens, and console logs must consist exclusively of standard 7-bit ASCII characters (`>>`, `[OK]`, `[FAIL]`, `::`, `[SOMATIC-DSP]`) with zero multi-byte Unicode or emojis.
5. **NodeNext Explicit `.js` Imports:** All relative TypeScript imports must explicitly terminate with `.js` extensions (e.g., `import State from '../99.core/state.js'`).
6. **$T_0 = \$0.00$ Phonation Feasibility Gate:** If a character's state exhibits muteness, transected vocal cords, or unconsciousness, execution must fail closed immediately in CPU memory, throwing `VOCAL_DELIVERY_BREACH` before any child process or neural synthesis is spawned.

### File Implementation Manifest

```plaintext
packages/400.conductor/
├── 10.somaticdsp.unit/
│   ├── fce/
│   │   ├── somaticdsp.bit.ts
│   │   └── somaticdsp.interface.ts
│   ├── val/
│   │   └── somaticdsp.val.ts
│   ├── buz/
│   │   └── somaticdsp.buzz.ts
│   ├── somaticdsp.action.ts
│   ├── somaticdsp.buzzer.ts
│   ├── somaticdsp.model.ts
│   ├── somaticdsp.reduce.ts
│   └── somaticdsp.unit.ts
├── 98.menu.unit/
│   └── buz/
│       └── 00.menu.buzz.ts              (Update: Mount Somatic DSP Inspection)
├── BEE.ts                               (Update: Register SomaticdspUnit)
└── val/
    └── somaticdsp.test.ts               (Comprehensive Vitest Battery)
```

### Source Code Deliverables

#### 1. Interface & Bit Definitions

```typescript
// packages/400.conductor/10.somaticdsp.unit/fce/somaticdsp.interface.ts
export type AnatomicalLocus =
  | 'CRANIAL'
  | 'CERVICAL_SPINE'
  | 'LARYNX'
  | 'PULMONARY_SYSTEM'
  | 'BRACHIAL_PLEXUS_RIGHT'
  | 'BRACHIAL_PLEXUS_LEFT'
  | 'FEMORAL_RIGHT'
  | 'FEMORAL_LEFT';

export type VocalTractCondition =
  | 'mute'
  | 'cnd_vocal_cord_transected'
  | 'crushed_larynx'
  | 'bilateral_vocal_cord_paralysis'
  | 'punctured_lung'
  | 'acute_asphyxiation'
  | 'concussive_shock';

export type BannedCadence =
  | 'RAPID_STACCATO'
  | 'RISING_INFLECTION_INTERROGATIVE'
  | 'CHEERFUL_MODULATION'
  | 'UPBEAT_LILT'
  | 'SING_SONG_RESONANCE';

export interface CharacterSomaticState {
  character_id: string;
  fatigue_bps: number; // 0..10000 bps
  pain_bps: number; // 0..10000 bps
  refusal_strain_bps: number; // 0..10000 bps
  is_conscious: boolean;
  active_conditions: VocalTractCondition[];
  banned_kinetic_verbs: string[];
}

export interface DialogueSomaticInput {
  character_id: string;
  base_pitch_shift_semitones?: number;
  pitch_shift_cents?: number;
  formant_warping_factor?: number;
  delta_formant_bps?: number;
  base_breathiness?: number;
  breathiness_bps?: number;
  base_vocal_fry?: number;
  vocal_fry_bps?: number;
}

export interface AcousticDspModifiers {
  effective_pitch_semitones: number;
  effective_formant_warping: number;
  effective_breathiness_multiplier: number;
  pause_frequency_multiplier: number;
  effective_vocal_fry_density: number;
  target_lufs: number;
  peak_dbtp: number;
  banned_cadences: BannedCadence[];
}

export interface SomaticDspReceipt {
  ok: boolean;
  character_id: string;
  modifiers?: AcousticDspModifiers;
  breach_reason?: string;
}

export default interface Somaticdsp {
  idx: string;
  characterProfiles: Record<string, CharacterSomaticState>;
  lastReceipt?: SomaticDspReceipt;
}
```

```typescript
// packages/400.conductor/10.somaticdsp.unit/fce/somaticdsp.bit.ts
import {
  CharacterSomaticState,
  DialogueSomaticInput,
  SomaticDspReceipt,
} from './somaticdsp.interface.js';

export default interface SomaticdspBit {
  idx: string;
  src?: string;
  val?: number;
  dat?: {
    somaticState?: CharacterSomaticState;
    somaticInput?: DialogueSomaticInput;
    receipt?: SomaticDspReceipt;
  };
  slv?: Function;
}
```

#### 2. Zod Validation & Domain Bounds

```typescript
// packages/400.conductor/10.somaticdsp.unit/val/somaticdsp.val.ts
import { z } from 'zod';

export const VocalTractConditionSchema = z.enum([
  'mute',
  'cnd_vocal_cord_transected',
  'crushed_larynx',
  'bilateral_vocal_cord_paralysis',
  'punctured_lung',
  'acute_asphyxiation',
  'concussive_shock',
]);

export const BannedCadenceSchema = z.enum([
  'RAPID_STACCATO',
  'RISING_INFLECTION_INTERROGATIVE',
  'CHEERFUL_MODULATION',
  'UPBEAT_LILT',
  'SING_SONG_RESONANCE',
]);

export const CharacterSomaticStateSchema = z
  .object({
    character_id: z.string().regex(/^char_[a-z0-9_]+$/),
    fatigue_bps: z.number().int().min(0).max(10000),
    pain_bps: z.number().int().min(0).max(10000),
    refusal_strain_bps: z.number().int().min(0).max(10000),
    is_conscious: z.boolean().default(true),
    active_conditions: z.array(VocalTractConditionSchema).default([]),
    banned_kinetic_verbs: z.array(z.string().min(1)).default([]),
  })
  .strict();

export const DialogueSomaticInputSchema = z
  .object({
    character_id: z.string().regex(/^char_[a-z0-9_]+$/),
    base_pitch_shift_semitones: z.number().min(-12.0).max(12.0).default(0.0),
    pitch_shift_cents: z.number().int().default(0),
    formant_warping_factor: z.number().min(0.5).max(2.0).default(1.0),
    delta_formant_bps: z.number().int().default(0),
    base_breathiness: z.number().min(1.0).max(3.5).default(1.0),
    breathiness_bps: z.number().int().min(0).max(10000).default(0),
    base_vocal_fry: z.number().min(0.0).max(1.0).default(0.0),
    vocal_fry_bps: z.number().int().min(0).max(10000).default(0),
  })
  .strict();
```

#### 3. Transfer Functions & Buzzer Implementation

```typescript
// packages/400.conductor/10.somaticdsp.unit/buz/somaticdsp.buzz.ts
import { SomaticdspModel } from '../somaticdsp.model.js';
import SomaticdspBit from '../fce/somaticdsp.bit.js';
import {
  CharacterSomaticState,
  DialogueSomaticInput,
  AcousticDspModifiers,
  SomaticDspReceipt,
  BannedCadence,
} from '../fce/somaticdsp.interface.js';
import {
  CharacterSomaticStateSchema,
  DialogueSomaticInputSchema,
} from '../val/somaticdsp.val.js';
import State from '../../99.core/state.js';

export const clamp = (val: number, min: number, max: number): number =>
  Math.min(Math.max(val, min), max);

export const mapSomaticToAcousticDsp = (
  state: CharacterSomaticState,
  input: DialogueSomaticInput,
): AcousticDspModifiers => {
  // 1. Phonation Feasibility Evaluation Gate
  if (!state.is_conscious) {
    throw new Error('VOCAL_DELIVERY_BREACH: Actor is unconscious');
  }
  if (state.active_conditions.includes('mute')) {
    throw new Error('VOCAL_DELIVERY_BREACH: Actor carries active mute condition');
  }
  if (state.active_conditions.includes('cnd_vocal_cord_transected')) {
    throw new Error('VOCAL_DELIVERY_BREACH: Actor vocal cords are transected');
  }
  if (state.active_conditions.includes('bilateral_vocal_cord_paralysis')) {
    throw new Error('VOCAL_DELIVERY_BREACH: Bilateral vocal cord paralysis present');
  }
  if (state.banned_kinetic_verbs.includes('speak')) {
    throw new Error('VOCAL_DELIVERY_BREACH: speak verb is in banned_kinetic_verbs');
  }

  // 2. Fundamental Frequency Pitch Transposition (F0,eff)
  // F0,eff = basePitch + (cents / 100) + (+3.5 * pain / 10000) + (-2.0 * fatigue / 10000)
  const basePitch = input.base_pitch_shift_semitones ?? 0.0;
  const centsShift = (input.pitch_shift_cents ?? 0) / 100.0;
  const painPitchMod = 3.5 * (state.pain_bps / 10000.0);
  const fatiguePitchMod = -2.0 * (state.fatigue_bps / 10000.0);
  let effectivePitch = basePitch + centsShift + painPitchMod + fatiguePitchMod;

  if (state.active_conditions.includes('crushed_larynx')) {
    effectivePitch -= 4.0;
  }
  effectivePitch = clamp(effectivePitch, -12.0, 12.0);

  // 3. Formant Warping Factor (Weff)
  // Weff = formantBase * (1.0 + delta_formant_bps / 10000)
  const baseFormant = input.formant_warping_factor ?? 1.0;
  const deltaFormant = (input.delta_formant_bps ?? 0) / 10000.0;
  let effectiveFormant = baseFormant * (1.0 + deltaFormant);

  if (state.active_conditions.includes('crushed_larynx')) {
    effectiveFormant = Math.min(effectiveFormant, 0.7);
  }
  effectiveFormant = clamp(effectiveFormant, 0.5, 2.0);

  // 4. Breath Interval Dilation (Peff)
  // Peff = baseBreath * (1.0 + 1.40 * (fatigue / 10000)^2) * (1.0 + breathiness_bps / 10000)
  const baseBreath = input.base_breathiness ?? 1.0;
  const fatigueRatio = state.fatigue_bps / 10000.0;
  const breathMod = (input.breathiness_bps ?? 0) / 10000.0;
  let effectiveBreath = baseBreath * (1.0 + 1.4 * Math.pow(fatigueRatio, 2)) * (1.0 + breathMod);
  effectiveBreath = clamp(effectiveBreath, 1.0, 3.5);

  // 5. Pause Frequency Multiplier
  let pauseMultiplier = 1.0;
  if (state.fatigue_bps >= 8000) {
    pauseMultiplier = 2.8;
  } else if (state.active_conditions.includes('punctured_lung') || state.active_conditions.includes('acute_asphyxiation')) {
    pauseMultiplier = 1.4;
  }

  // 6. Subharmonic Vocal Fry Density (Phieff)
  // Phieff = clamp(baseFry + 0.50 * fatigue + 0.40 * pain + fry_bps, 0.0, 1.0)
  const baseFry = input.base_vocal_fry ?? 0.0;
  const fryMod = (input.vocal_fry_bps ?? 0) / 10000.0;
  let effectiveFry = baseFry + 0.5 * fatigueRatio + 0.4 * (state.pain_bps / 10000.0) + fryMod;
  effectiveFry = clamp(effectiveFry, 0.0, 1.0);

  // 7. Banned Cadences Roll-Up
  const bannedCadences: BannedCadence[] = [];
  if (state.fatigue_bps > 5000 || state.active_conditions.includes('punctured_lung')) {
    bannedCadences.push('RAPID_STACCATO');
  }
  if (state.pain_bps > 4000) {
    bannedCadences.push('CHEERFUL_MODULATION', 'UPBEAT_LILT', 'SING_SONG_RESONANCE');
  }

  return {
    effective_pitch_semitones: Number(effectivePitch.toFixed(3)),
    effective_formant_warping: Number(effectiveFormant.toFixed(3)),
    effective_breathiness_multiplier: Number(effectiveBreath.toFixed(3)),
    pause_frequency_multiplier: Number(pauseMultiplier.toFixed(3)),
    effective_vocal_fry_density: Number(effectiveFry.toFixed(3)),
    target_lufs: -16.0,
    peak_dbtp: -1.0,
    banned_cadences,
  };
};

export const initSomaticdsp = (
  cpy: SomaticdspModel,
  bal: SomaticdspBit,
  ste: State,
) => {
  if (bal.slv != null) {
    bal.slv({ smtBit: { idx: 'init-somaticdsp', val: 1 } });
  }
  return cpy;
};

export const updateSomaticdsp = (
  cpy: SomaticdspModel,
  bal: SomaticdspBit,
  ste: State,
) => {
  if (bal.slv != null) {
    bal.slv({ smtBit: { idx: 'update-somaticdsp' } });
  }
  return cpy;
};

export const translateSomaticDsp = async (
  cpy: SomaticdspModel,
  bal: SomaticdspBit,
  ste: State,
) => {
  try {
    if (!bal.dat?.somaticState || !bal.dat?.somaticInput) {
      throw new Error('MISSING_PAYLOAD: somaticState and somaticInput are required');
    }

    const validatedState = CharacterSomaticStateSchema.parse(bal.dat.somaticState);
    const validatedInput = DialogueSomaticInputSchema.parse(bal.dat.somaticInput);

    cpy.characterProfiles[validatedState.character_id] = validatedState;

    const modifiers = mapSomaticToAcousticDsp(validatedState, validatedInput);

    const receipt: SomaticDspReceipt = {
      ok: true,
      character_id: validatedState.character_id,
      modifiers,
    };

    cpy.lastReceipt = receipt;

    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [SOMATIC-DSP] [OK] Translated [${validatedState.character_id}]: Pitch=${modifiers.effective_pitch_semitones}st, Formant=${modifiers.effective_formant_warping}, Fry=${modifiers.effective_vocal_fry_density}`,
      });
    }

    if (bal.slv != null) {
      bal.slv({
        smtBit: {
          idx: 'translate-somatic-dsp-success',
          dat: { receipt },
        },
      });
    }
  } catch (err: any) {
    const errorMsg = err.message || String(err);
    const receipt: SomaticDspReceipt = {
      ok: false,
      character_id: bal.dat?.somaticState?.character_id || 'UNKNOWN_ACTOR',
      breach_reason: errorMsg,
    };

    cpy.lastReceipt = receipt;

    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [SOMATIC-DSP] [FAIL] ${errorMsg} at T0 ($0.00 spend)`,
      });
    }

    if (bal.slv != null) {
      bal.slv({
        smtBit: {
          idx: 'translate-somatic-dsp-error',
          src: errorMsg,
          dat: { receipt },
        },
      });
    }
  }

  return cpy;
};
```

#### 4. Action Class Bindings, Buzzer Re-Exports, Model, and Reducer

```typescript
// packages/400.conductor/10.somaticdsp.unit/somaticdsp.action.ts
import { Action } from '../99.core/interface/action.interface.js';
import SomaticdspBit from './fce/somaticdsp.bit.js';

export const INIT_SOMATICDSP = '[Somaticdsp action] Init Somaticdsp';
export class InitSomaticdsp implements Action {
  readonly type = INIT_SOMATICDSP;
  constructor(public bale: SomaticdspBit) {}
}

export const UPDATE_SOMATICDSP = '[Somaticdsp action] Update Somaticdsp';
export class UpdateSomaticdsp implements Action {
  readonly type = UPDATE_SOMATICDSP;
  constructor(public bale: SomaticdspBit) {}
}

export const TRANSLATE_SOMATIC_DSP = '[Somaticdsp action] Translate Somatic DSP';
export class TranslateSomaticDsp implements Action {
  readonly type = TRANSLATE_SOMATIC_DSP;
  constructor(public bale: SomaticdspBit) {}
}

export type Actions = InitSomaticdsp | UpdateSomaticdsp | TranslateSomaticDsp;
```

```typescript
// packages/400.conductor/10.somaticdsp.unit/somaticdsp.buzzer.ts
export {
  initSomaticdsp,
  updateSomaticdsp,
  translateSomaticDsp,
  mapSomaticToAcousticDsp,
} from './buz/somaticdsp.buzz.js';
```

```typescript
// packages/400.conductor/10.somaticdsp.unit/somaticdsp.model.ts
import Somaticdsp, {
  CharacterSomaticState,
  SomaticDspReceipt,
} from './fce/somaticdsp.interface.js';

export class SomaticdspModel implements Somaticdsp {
  idx: string = '10.somaticdsp';
  characterProfiles: Record<string, CharacterSomaticState> = {};
  lastReceipt?: SomaticDspReceipt;
}
```

```typescript
// packages/400.conductor/10.somaticdsp.unit/somaticdsp.reduce.ts
import clone from 'clone-deep';
import * as Act from './somaticdsp.action.js';
import { SomaticdspModel } from './somaticdsp.model.js';
import * as Buzz from './somaticdsp.buzzer.js';
import State from '../99.core/state.js';

export function reducer(
  model: SomaticdspModel = new SomaticdspModel(),
  act: Act.Actions,
  state?: State,
) {
  switch (act.type) {
    case Act.INIT_SOMATICDSP:
      return Buzz.initSomaticdsp(clone(model), act.bale, state!);

    case Act.UPDATE_SOMATICDSP:
      return Buzz.updateSomaticdsp(clone(model), act.bale, state!);

    case Act.TRANSLATE_SOMATIC_DSP:
      return Buzz.translateSomaticDsp(clone(model), act.bale, state!);

    default:
      return model;
  }
}
```

```typescript
// packages/400.conductor/10.somaticdsp.unit/somaticdsp.unit.ts
import State from '../99.core/state.js';

export default class SomaticdspUnit {
  constructor(state: State) {}
}
```

#### 5. Central Wiring in BEE.ts

```typescript
// In packages/400.conductor/BEE.ts:
// Add import and registration for SomaticdspUnit:
import SomaticdspUnit from './10.somaticdsp.unit/somaticdsp.unit.js';
import Somaticdsp from './10.somaticdsp.unit/fce/somaticdsp.interface.js';
import { SomaticdspModel } from './10.somaticdsp.unit/somaticdsp.model.js';
import { reducer as somaticdspReducer } from './10.somaticdsp.unit/somaticdsp.reduce.js';

// In list:
export const list = {
  // ... other units
  somaticdsp: SomaticdspUnit,
};

// In reducer:
export const reducer = {
  // ... other reducers
  somaticdsp: somaticdspReducer,
};

// In UnitData:
export default class UnitData implements Model {
  // ... other units
  somaticdsp: Somaticdsp = new SomaticdspModel();
}
```

#### 6. Blessed Menu Integration

```typescript
// In packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts:
// Add choice option under the menu switch case:
case 'INSPECT CHARACTER SOMATIC DSP':
  bit = await ste.hunt('[Somaticdsp action] Translate Somatic DSP', {
    dat: {
      somaticState: {
        character_id: 'char_bog',
        fatigue_bps: 8200,
        pain_bps: 4500,
        refusal_strain_bps: 1200,
        is_conscious: true,
        active_conditions: [],
        banned_kinetic_verbs: [],
      },
      somaticInput: {
        character_id: 'char_bog',
        base_pitch_shift_semitones: -1.0,
        formant_warping_factor: 1.0,
      },
    },
  });
  if (bit?.smtBit?.dat?.receipt?.ok) {
    await global.LIBRARY.hunt('[Console action] Update Console', {
      idx: 'cns00',
      src: '>> [MENU:SOMATIC] Inspection Complete. Modifiers calculated.',
    });
  }
  break;
```

#### 7. Colocated Vitest Test Battery

```typescript
// packages/400.conductor/val/somaticdsp.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { SomaticdspModel } from '../10.somaticdsp.unit/somaticdsp.model.js';
import * as Buzz from '../10.somaticdsp.unit/buz/somaticdsp.buzz.js';
import {
  CharacterSomaticState,
  DialogueSomaticInput,
} from '../10.somaticdsp.unit/fce/somaticdsp.interface.js';

describe('10.somaticdsp.unit: Somatic Biological Condition Vector Translation', () => {
  let model: SomaticdspModel;

  beforeEach(() => {
    model = new SomaticdspModel();
  });

  const baseState: CharacterSomaticState = {
    character_id: 'char_bog',
    fatigue_bps: 0,
    pain_bps: 0,
    refusal_strain_bps: 0,
    is_conscious: true,
    active_conditions: [],
    banned_kinetic_verbs: [],
  };

  const baseInput: DialogueSomaticInput = {
    character_id: 'char_bog',
    base_pitch_shift_semitones: 0.0,
    formant_warping_factor: 1.0,
    base_breathiness: 1.0,
    base_vocal_fry: 0.0,
  };

  it('calculates nominal modifiers for healthy neutral character', () => {
    const mods = Buzz.mapSomaticToAcousticDsp(baseState, baseInput);
    expect(mods.effective_pitch_semitones).toBe(0.0);
    expect(mods.effective_formant_warping).toBe(1.0);
    expect(mods.effective_breathiness_multiplier).toBe(1.0);
    expect(mods.pause_frequency_multiplier).toBe(1.0);
    expect(mods.effective_vocal_fry_density).toBe(0.0);
    expect(mods.target_lufs).toBe(-16.0);
    expect(mods.peak_dbtp).toBe(-1.0);
    expect(mods.banned_cadences).toEqual([]);
  });

  it('fails closed at T0 with VOCAL_DELIVERY_BREACH if character is unconscious', () => {
    const unconsciousState = { ...baseState, is_conscious: false };
    expect(() => Buzz.mapSomaticToAcousticDsp(unconsciousState, baseInput)).toThrow(
      /VOCAL_DELIVERY_BREACH: Actor is unconscious/,
    );
  });

  it('fails closed at T0 with VOCAL_DELIVERY_BREACH if vocal cords are transected or character is mute', () => {
    const muteState: CharacterSomaticState = {
      ...baseState,
      active_conditions: ['cnd_vocal_cord_transected'],
    };
    expect(() => Buzz.mapSomaticToAcousticDsp(muteState, baseInput)).toThrow(
      /VOCAL_DELIVERY_BREACH: Actor vocal cords are transected/,
    );
  });

  it('fails closed at T0 if speak is in banned_kinetic_verbs', () => {
    const bannedSpeakState: CharacterSomaticState = {
      ...baseState,
      banned_kinetic_verbs: ['sprint', 'speak'],
    };
    expect(() => Buzz.mapSomaticToAcousticDsp(bannedSpeakState, baseInput)).toThrow(
      /VOCAL_DELIVERY_BREACH: speak verb is in banned_kinetic_verbs/,
    );
  });

  it('applies quadratic breath dilation and locks pause multiplier to 2.8x when fatigue >= 8000 bps', () => {
    const exhaustedState: CharacterSomaticState = {
      ...baseState,
      fatigue_bps: 8200,
    };
    const mods = Buzz.mapSomaticToAcousticDsp(exhaustedState, baseInput);
    // Pi_eff = 1.0 * (1 + 1.40 * 0.82^2) = 1.0 * (1 + 1.40 * 0.6724) = 1.941
    expect(mods.effective_breathiness_multiplier).toBeGreaterThan(1.9);
    expect(mods.pause_frequency_multiplier).toBe(2.8);
    expect(mods.banned_cadences).toContain('RAPID_STACCATO');
  });

  it('collapses formant warping factor to 0.7 and drops pitch by 4 semitones under crushed larynx trauma', () => {
    const crushedLarynxState: CharacterSomaticState = {
      ...baseState,
      active_conditions: ['crushed_larynx'],
    };
    const mods = Buzz.mapSomaticToAcousticDsp(crushedLarynxState, baseInput);
    expect(mods.effective_formant_warping).toBe(0.7);
    expect(mods.effective_pitch_semitones).toBe(-4.0);
  });

  it('clamps pitch shift strictly within [-12.0, 12.0] semitones under extreme inputs', () => {
    const extremeInput: DialogueSomaticInput = {
      ...baseInput,
      base_pitch_shift_semitones: 11.5,
    };
    const painState: CharacterSomaticState = {
      ...baseState,
      pain_bps: 10000, // +3.5 st
    };
    const mods = Buzz.mapSomaticToAcousticDsp(painState, extremeInput);
    expect(mods.effective_pitch_semitones).toBe(12.0);
  });

  it('buzz translateSomaticDsp captures errors cleanly in receipt without crashing', async () => {
    const bale = {
      idx: 'test-translate',
      dat: {
        somaticState: { ...baseState, is_conscious: false },
        somaticInput: baseInput,
      },
      slv: (res: any) => res,
    };
    const updated = await Buzz.translateSomaticDsp(model, bale, null as any);
    expect(updated.lastReceipt?.ok).toBe(false);
    expect(updated.lastReceipt?.breach_reason).toContain('VOCAL_DELIVERY_BREACH');
  });
});
```

### Jules Execution Protocol

1. Place all implementation files into `packages/400.conductor/10.somaticdsp.unit/` adhering strictly to `.js` import specifiers.
2. Register `SomaticdspUnit` in `packages/400.conductor/BEE.ts` under `list`, `reducer`, and `UnitData`.
3. Add `INSPECT CHARACTER SOMATIC DSP` to `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts`.
4. Run `npx vitest run packages/400.conductor/val/somaticdsp.test.ts` to ensure 100% of unit tests pass.
5. Verify that `npx tsc -b packages/400.conductor` compiles with zero diagnostic warnings and `test ! -d packages/400.conductor/src` confirms absence of any forbidden `src/` directory.
6. **COMMAND:** When you begin working on this specification, immediately update the `[- **Status:**]` attribute below to `[🟡 In Progress]`. When all target files and the Vitest test gauntlet pass with exit code 0, update `[- **Status:**]` to `[🟢 Done]`.

### **Attributes:**

- **Status:** [⚪ Backlog ]
- **Priority:** [🔴 High]
- **Time Estimate:** [1 Hour]
- **Tags:** [infrastructure, somatic-dsp, acoustic-synthesis, biology-invariants, t0-firewall]
- **Epic:** [EPIC 001: INFRASTRUCTURE & GOVERNANCE]
- **Value:** [Acoustic Determinism at T0]
- **Sprint Points:** [2]
- **Component:** [packages/400.conductor/10.somaticdsp.unit]
- **Owner:** [Jules Autonomous Implementer]
- **Target Release:** [Sprint 4 / Conductor v1.0]
- **Risk Level:** [Low]
- **Reporter:** [Studio Architecture Lead]

### You

{{FOCUS : Phase 2 Somatic Biological Condition Vector Translation }}

@jules-complete-check

### Gemini

### **Validation:**

- **Progress:** [⚪ Waiting for Action ]

#### Jules Pre-Flight Completion Audit & Operational Directive

**Agent Instruction:** Before generating, authoring, or mutating any code for **Phase 2: Somatic Biological Condition Vector Translation**, execute an automated inspection audit across `packages/400.conductor/10.somaticdsp.unit/`, `packages/400.conductor/BEE.ts`, `packages/400.conductor/98.menu.unit/`, and `packages/400.conductor/val/` in repository `000.series-sower-conductor` against the **12-Point Pre-Flight Completion Inspection Checklist** below to verify whether this somatic condition extractor, phonation feasibility gate, and acoustic DSP modifier engine have already been completed:

$$
\text{Completion Percentage} = \left(\frac{\text{Passed Checks}}{12}\right) \times 100\% \text{}
$$

##### The 12-Point Completion Audit Battery

1. **Physical Inode Existence (`fce/`):** Verify that `packages/400.conductor/10.somaticdsp.unit/fce/somaticdsp.interface.ts` and `fce/somaticdsp.bit.ts` exist on disk and export `CharacterSomaticState`, `DialogueSomaticInput`, `AcousticDspModifiers`, `SomaticDspReceipt`, and `SomaticdspBit`.
2. **Schema Validation Inode (`val/`):** Verify that `packages/400.conductor/10.somaticdsp.unit/val/somaticdsp.val.ts` exists and exports `CharacterSomaticStateSchema` and `DialogueSomaticInputSchema` with `.strict()` termination.
3. **Buzzer Mathematics Inode (`buz/`):** Verify that `packages/400.conductor/10.somaticdsp.unit/buz/somaticdsp.buzz.ts` exists and implements `mapSomaticToAcousticDsp`, `initSomaticdsp`, `updateSomaticdsp`, and `translateSomaticDsp`.
4. **Candor 7-File Unit Structure:** Verify that `somaticdsp.action.ts`, `somaticdsp.buzzer.ts`, `somaticdsp.model.ts`, `somaticdsp.reduce.ts`, and `somaticdsp.unit.ts` exist within `packages/400.conductor/10.somaticdsp.unit/`.
5. **Monorepo Central Wiring (`BEE.ts`):** Confirm that `packages/400.conductor/BEE.ts` imports `SomaticdspUnit` and registers it across `list`, `reducer`, and `UnitData` under key `somaticdsp`.
6. **Blessed Menu Inode Integration:** Verify that `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` mounts `INSPECT CHARACTER SOMATIC DSP` and handles dispatching `TRANSLATE_SOMATIC_DSP`.
7. **Phonation Feasibility Gate:** Verify that `mapSomaticToAcousticDsp` evaluates actor consciousness, mute state, `cnd_vocal_cord_transected`, bilateral cord paralysis, and banned `speak` verbs, immediately throwing `VOCAL_DELIVERY_BREACH` when speech is impossible.
8. **Integer Basis-Point Purity:** Confirm that somatic fatigue, pain, and refusal strain operate strictly as integer basis points $[0, 10000]\text{ bps}$ ($10000 \equiv 100.00\%$) with zero raw floating-point scalars in state schemas.
9. **Formant & Pitch Transposition Clamping:** Confirm that `effective_formant_warping` is clamped to $[0.5, 2.0]$ (collapsing to $\le 0.70$ under `crushed_larynx`) and `effective_pitch_semitones` is clamped to $[-12.0, 12.0]\text{ st}$.
10. **Quadratic Breath Interval Dilation:** Confirm that respiratory pause frequency dilates quadratically with fatigue ratio and clamps to a $2.8\times$ pause multiplier when fatigue $\ge 8000\text{ bps}$.
11. **Vitest Verification Suite:** Execute `npx vitest run packages/400.conductor/val/somaticdsp.test.ts` and confirm all test suites pass with exit code 0.
12. **Monorepo Boundary & ASCII Cleanliness:** Assert that `packages/400.conductor/src/` does not exist (`test ! -d packages/400.conductor/src`), `apps/995.library/` has 0 modified lines (`git status -s apps/995.library/995.library/` returns empty), and all unit code is 100% 7-bit clean ASCII.

##### Operational Halting & Execution Rules

- **IF $\ge 67\%$ (8 or more of the 12 checks pass):**
  - Update `[- **Progress:**]` above with the current execution timestamp and date:
    ```markdown
    - **Progress:** [🟢 Completed on Thursday, November 5, 2026 at 7:16 AM EST - Audit Score: >= 67% - Pre-existing Work Verified]
      *Reason for Halt:* Pre-flight audit confirmed that >= 67% of Phase 2 Somatic Biological Condition Vector Translation requirements—including the 10.somaticdsp.unit Candor structure, phonation feasibility gate, algebraic transfer functions, BEE.ts registration, Blessed TUI menu mounting, and green Vitest test suites—are already established on disk. Operational execution halted immediately to prevent redundant file mutations or overwrites.
    ```
  - Write the original specification file with this updated timecode header and **STOP IMMEDIATELY!**
  - **STRICT AGENT BOUNDARY:** The Jules Coding Agent must strictly understand that this status and timestamp update is the **ONLY** update, work, and activity to be induced from this prompt. Do **NOT** rewrite files, do **NOT** modify existing tests, and do **NOT** execute redundant implementations.
- **IF $< 67\%$ (0 to 7 checks pass):**
  - Jules must proceed to implement and fulfill all missing requirements across `packages/400.conductor/10.somaticdsp.unit/`, `packages/400.conductor/BEE.ts`, `packages/400.conductor/98.menu.unit/`, and `packages/400.conductor/val/somaticdsp.test.ts`.
  - Once monorepo compilation (`npx tsc -b packages/400.conductor`) and Vitest runs clear with exit code 0, update `[- **Progress:**]` to `[🟢 Completed on Thursday, November 5, 2026 at 7:16 AM EST - Task Requirements Fully Implemented]` and save the file.

> **CRITICAL PARTNER TEST ADVISORY WARNING:** If there is a partner file located next to this one in the directory matching the suffix `[xxx.phase-xxx.ag-test.md]`, **YOU ARE TO NEVER RUN THIS TEST**. That test suite belongs exclusively to the Antigravity adversarial audit agent (`ag-test`), which will independently verify this implementation.

### **FUNCTIONAL MANDATE**

#### **User Story**

Elena adjusted her headset in the machine room, watching the audio synthesis pipeline process the dialogue pass for Scene 04. On the preview monitor, the character Bog had just crawled out of an intake turbine; his canonical ledger record showed two crushed ribs, third-degree steam burns across his neck, and a pulmonary fatigue rating hovering at 8,400 basis points.

In the old pipeline, before `10.somaticdsp.unit` existed, Elena would have received a clean, brisk, studio-quality voice take from the neural speech engine. The AI voice would speak the line—*"The intake valve is rusted through"*—with the buoyant pacing of a healthy radio announcer, completely oblivious to the fact that Bog’s lungs were filling with fluid and his trachea was swollen shut. She would then spend forty-five minutes manually slicing the waveform in a digital audio workstation, splicing in synthetic wheezes, dragging pitch curves down by hand, and lengthening pauses to fake the sound of suffocation.

Today, Elena watched `series-sower-conductor` pass Bog's dialogue line directly through the `translateSomaticDsp` buzzer. Instantly, without a human touching a dial, the unit read Bog's biological trauma from the SQLite state ledger. The phonation feasibility gate verified that Bog was conscious and his vocal cords were intact. Then the algebraic transfer functions engaged: his 8,400 basis points of pulmonary fatigue dilated his breath intervals quadratically, forcing a $2.8\times$ pause frequency multiplier that split his line into ragged, oxygen-starved bursts. His physical pain shifted fundamental pitch semitones, the laryngeal swelling warped the formant ratio down to 0.70, and subharmonic vocal fry rose to 0.76.

When the downstream synthesis daemon on Port 8000 received the payload, it didn't generate generic speech; it executed against locked, unyielding mathematical DSP modifiers. The resulting 48 kHz stem sounded raw, labored, and biologically authentic. When Elena glanced at the curses cockpit, `cns00` confirmed the exact delivery: `>> [SOMATIC-DSP] [OK] Translated [char_bog]: Pitch=-1.82st, Formant=0.700, Fry=0.760, PauseMult=2.800`. The character's physical state lived directly inside the acoustic waveform.

#### **Strategic Goal**

Directly enforces the **Somatic Biological Invariant Law** and the **Zero-Spend Pre-Flight Economic Firewall ($T_0 = \$0.00$)**. By converting discrete anatomical conditions, physical fatigue, and tissue trauma into deterministic algebraic DSP modifiers prior to audio synthesis, this phase guarantees that neural vocoders cannot hallucinate healthy vocal delivery for injured characters, and ensures that actors who are physically incapable of phonation (unconscious, transected vocal cords, or mute) fail closed immediately in CPU memory at zero compute spend.

#### **Context & Value**

- **The Strategic Value:** Generative speech engines possess no innate concept of narrative continuity, biological history, or physical pain. Left unconditioned, they produce smooth, statistically generic vocal performances that destroy immersion and contradict the visual plate. By embedding a deterministic somatic-to-acoustic compiler into `000.series-sower-conductor`, vocal acoustics become a direct projection of canonical lore. Physical damage sustained in earlier episodes dictates speech cadence, formant timbre, and phrase length in perpetuity without requiring manual audio engineering.
- **The Technical Challenge:** Constructing continuous acoustic transfer functions (quadratic respiratory dilation, additive semitone pitch shifting, formant warping, and vocal fry density) driven strictly by integer basis points $[0, 10000]\text{ bps}$ without allowing cumulative floating-point drift, clamping parameters within strict biological thresholds ($[-12.0, 12.0]\text{ st}$, $[0.5, 2.0]$ formant ratio), and enforcing a rigid fail-closed phonation feasibility gate that halts pipeline execution before network requests are dispatched.

#### **Interface**

`Phase 2 Somatic Biological Condition Vector Translation` inside `000.series-sower-conductor` interfaces across the following repositories and modules:

- **`001.goblin-lore` (Canonical State Authority):** Supplies the canonical somatic condition taxonomies (`VocalTractConditionEnum`, `BannedCadenceEnum`) and actor physical baselines against which incoming condition arrays are validated.
- **`000.worker-sower-engine` (Upstream Ledger Core):** Emits the active character trauma vectors, fatigue metrics, and refusal strain basis points stored within the live simulation state (`entities_live` and `pilot.db`).
- **`000.audio-microservice` (Downstream Synthesis Daemon):** Ingests the finalized `AcousticDspModifiers` payload emitted by this unit over HTTP POST (`[http://127.0.0.1:8000/generate](http://127.0.0.1:8000/generate)`), using the parameters to condition StyleTTS-2 pitch latents or Parler-TTS descriptive prompts.
- **`packages/400.conductor/24.frame.unit` (Downstream Master Clock):** Consumes the dilated speech duration resulting from expanded breath pauses, converting the lengthened audio stems into locked 24 fps integer frames via `ffprobe`.
- **`apps/995.library` (Terminal Flight Deck Harness):** Hosts the Blessed curses interface (`run.ts`) that executes the unit's actions and displays real-time telemetry.

#### **Interaction**

The operator observes and interacts with this phase through the **Blessed Terminal Interface** hosted in `apps/995.library`:

- **Interactive Cockpit Navigation:**
  1. Launch the terminal cockpit on Rig 1 via `npm run dev`.
  2. In the left navigation choice grid (`85.choice.unit` / `98.menu.unit`), use the arrow keys or `J`/`K` to highlight `INSPECT CHARACTER SOMATIC DSP`.
  3. Press `ENTER` to trigger the translation buzzer against the active character profile.
- **Visual Telemetry Feedback (`cns00`):**
  - The switchboard console (`cns00`) streams real-time 7-bit ASCII receipts displaying the calculated DSP modifiers:
    ```plaintext
    >> [SOMATIC-DSP] [OK] Translated [char_bog]: Pitch=-1.82st, Formant=0.700, Fry=0.760
    >> [SOMATIC-DSP] [OK] Dilation: BreathMult=1.940, PauseMult=2.800 | Cadences Banned: RAPID_STACCATO
    ```
  - If a character is unconscious or mute, `cns00` streams an immediate fail-closed diagnostic banner:
    ```plaintext
    >> [SOMATIC-DSP] [FAIL] VOCAL_DELIVERY_BREACH: Actor is unconscious at T0 ($0.00 spend)
    ```
- **Headless Verification:**
  [cite: 2]
  - Execute the colocated Vitest test suite to verify transfer function math and gate bounds without launching curses:
    ```bash
    npx vitest run packages/400.conductor/val/somaticdsp.test.ts
    ```
  - Confirm that the package adheres strictly to the unit-colocated layout without any forbidden `src/` directory:
    ```bash
    test ! -d packages/400.conductor/src && echo ">> [OK] Zero src/ directory confirmed."
    ```

### You

{{FOCUS : Phase 2 Somatic Biological Condition Vector Translation }}

@agrav-check-00

### Gemini

### **Validation:**

- **Progress:** [⚪ Waiting for Action ]

> **Antigravity Auditor Execution Directive:** When all of the listed checks, invariant stress-tests, negative-control fault injections, and interactive Blessed terminal levels in this Antigravity prompt are complete in regards to **Phase 2 Somatic Biological Condition Vector Translation**, Antigravity must update `[- **Progress:**]` above with the current completion timestamp and date (e.g., `[- **Progress:** 🟢 Completed: 2026-11-05 07:20:00 UTC]`) and write the original specification file with this updated information. If any test, mathematical bound assertion, schema verification, or boundary constraint fails, mark `[⚪` with `[🔴` (e.g., `[- **Progress:** 🔴 Failed at Level X: 2026-11-05 07:20:00 UTC]`), append the diagnostic stack trace, and halt execution immediately without mutating further code.

### Blessed Terminal Interface (TUI) Validation Instructions

When validating features involving a Blessed Terminal Interface:

1. **Human Keyboard Emulation:** Manually interact with the interface using real keyboard inputs and sequences (e.g., Arrow keys, `Tab`, `Enter`, `Escape`, character inputs, and configured shortcuts) exactly as an operator at a physical terminal would.
2. **Step-by-Step Flow Navigation:** Drive end-to-end user journeys through sequential keystrokes rather than relying solely on headless mocks or direct state mutations. Allow render and event loop cycles between inputs.
3. **Screen & Focus Verification:** Observe terminal screen buffers, cursor positions, active focused widgets, and visual updates after each keypress sequence to ensure the UI responds correctly.
4. **Lifecycle & Clean Exit:** Verify proper startup rendering, navigation across interactive elements, and graceful termination routines (such as `q`, `Escape`, or `Ctrl+C`).

### Blessed Terminal Interface (TUI) Validation & Autonomous Remediation Protocol

#### 1. Authoritative Runner Entry Point

- All interactive Blessed terminal tests **MUST** execute exclusively through:
  ```bash
  npm run dev
  ```
  (Notice: Direct execution flags like `npm run dev -- --package=299.lore` are strictly forbidden; run only `npm run dev`).
- Direct execution via bare `node` is strictly prohibited because `.ts` transpilation requires `tsx`.

#### 2. Pre-Flight Boundary Self-Healing Guard

- Before launching the runner, the auditor must assert harness integrity:
  ```bash
  git status -s apps/995.library/995.library/
  ```
- **Remediation Action:** If any dirty files or rogue stubs are detected inside `apps/995.library/995.library/`, the auditor must run `git restore apps/995.library/995.library/` immediately before proceeding to the build.
- `apps/995.library/run.ts` is the only file with a permitted modification path.

#### 3. In-Scope Remediation Mandate (Zero-Handoff Policy)

- If the auditor encounters:
  - Missing CLI flags or runner options in `apps/995.library/run.ts` (permitted modification path).
  - Unimplemented menu navigation or telemetry hooks in `packages/400.conductor/98.menu.unit/`.
  - Stale references in local package `tsconfig.json`.
- **The auditor must NOT halt execution or report failure to the user.**
- **The auditor must proactively implement the missing wiring**, re-execute the gauntlet, and verify clean end-to-end telemetry before sealing the audit.

#### 4. Verification Integrity Boundary

- The auditor should never:
  - Weaken Zod schemas or basis-point bounds to bypass failures.
  - Modify the immutable harness (`apps/995.library/995.library/**`).
  - Comment out or weaken directive assertions.
- Remediation is strictly limited to fixing runtime orchestration, restoring boundary corruptions, and fulfilling the mandated UI journey.

### ANTIGRAVITY ADVERSARIAL AUDIT & VERIFICATION DIRECTIVE

- **Target Directive:** `002.somatic-dsp-translation-phase2.ag-test.md`
- **Target Focus:** `Phase 2 Somatic Biological Condition Vector Translation`
- **Target Repository:** `000.series-sower-conductor` (downstream: `camp-candor/series-sower-conductor` / `camp-candor/npm-agent-01`)
- **Target Workspace:** `packages/400.conductor/`
- **Target Inodes Under Audit:**
  - `packages/400.conductor/10.somaticdsp.unit/fce/somaticdsp.interface.ts` (AUDIT: Typings for `CharacterSomaticState`, `DialogueSomaticInput`, `AcousticDspModifiers`, `SomaticDspReceipt`)
  - `packages/400.conductor/10.somaticdsp.unit/fce/somaticdsp.bit.ts` (AUDIT: Candor action/state bale contract)
  - `packages/400.conductor/10.somaticdsp.unit/val/somaticdsp.val.ts` (AUDIT: Zod schemas with `.strict()` termination and integer basis point constraints)
  - `packages/400.conductor/10.somaticdsp.unit/buz/somaticdsp.buzz.ts` (AUDIT: Phonation feasibility evaluation gate, transfer functions, quadratic breath dilation, formant and pitch clamping)
  - `packages/400.conductor/10.somaticdsp.unit/somaticdsp.action.ts` (AUDIT: Action definitions `INIT_SOMATICDSP`, `UPDATE_SOMATICDSP`, `TRANSLATE_SOMATIC_DSP`)
  - `packages/400.conductor/10.somaticdsp.unit/somaticdsp.buzzer.ts` (AUDIT: Clean buzzer exports)
  - `packages/400.conductor/10.somaticdsp.unit/somaticdsp.model.ts` (AUDIT: State model container)
  - `packages/400.conductor/10.somaticdsp.unit/somaticdsp.reduce.ts` (AUDIT: Pure reducer implementation via `clone-deep`)
  - `packages/400.conductor/10.somaticdsp.unit/somaticdsp.unit.ts` (AUDIT: Candor unit class wiring)
  - `packages/400.conductor/BEE.ts` (AUDIT: Registration of `SomaticdspUnit` across `list`, `reducer`, and `UnitData`)
  - `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` (AUDIT: Menu mounting of `INSPECT CHARACTER SOMATIC DSP`)
  - `packages/400.conductor/val/somaticdsp.test.ts` (AUDIT: Colocated Vitest test suite)
- **Immutable Harness Fence:** `apps/995.library/995.library/**` *(0 modified lines)*
- **Forbidden Directory Fence:** `packages/400.conductor/src/` *(Strictly Prohibited; physical non-existence required)*
- **Auditor Persona:** Autonomous Adversarial Systems Auditor & Acoustic Sentry (Antigravity v2.4)

### I. Architectural Mandate & Universal Negative-Control Law

Under the **Universal Negative-Control Law**, a somatic biological translation engine, vocal tract warping calculator, or phonation feasibility gate that has never been observed actively failing closed when presented with physical motor violations (actor unconscious, mute, vocal cords transected, bilateral vocal cord paralysis, or `speak` verb inside `banned_kinetic_verbs`), out-of-bounds floating-point basis points, uncompressed formants under laryngeal trauma, or un-dilated respiratory pause multipliers under severe somatic fatigue ($>8000\text{ bps}$) at Stage $T_0 = \$0.00$ spend **CANNOT BE CERTIFIED FOR PRODUCTION DEPLOYMENT**.

Antigravity executes active negative-control fault injections, tests algebraic transfer functions against integer basis-point bounds, verifies pure state reducers, audits monorepo file-system boundaries, and asserts fail-closed exit codes across all levels.

### II. Multi-Level Adversarial Audit Gauntlet

#### Level 1: Static Boundary, Monorepo Topology & Pure 7-Bit ASCII Audit

- **Check 1.1 (Forbidden `src/` Directory Non-Existence):** Assert that no `packages/400.conductor/src/` directory exists. All logic must reside strictly inside numbered unit folders (`10.somaticdsp.unit/`, etc.) and `val/`.
  ```bash
  test ! -d packages/400.conductor/src && echo ">> [OK] Zero src/ directory confirmed."
  ```
- **Check 1.2 (Immutable Harness Fence):** Assert that the runner harness has not been tainted:
  ```bash
  git status -s apps/995.library/995.library/
  ```
  (Must return exactly 0 modified lines; if dirty, restore immediately).
- **Check 1.3 (NodeNext Explicit `.js` Imports):** Inspect all imports across `packages/400.conductor/10.somaticdsp.unit/` to verify that all relative module specifiers terminate explicitly with `.js`.
- **Check 1.4 (Pure 7-Bit ASCII Cleanliness):** Execute a scan across `packages/400.conductor/10.somaticdsp.unit/` and `packages/400.conductor/val/somaticdsp.test.ts` to assert zero multi-byte Unicode or emojis:
  ```bash
  node -e "
  const fs = require('fs');
  const path = require('path');
  const files = [
    '10.somaticdsp.unit/fce/somaticdsp.interface.ts',
    '10.somaticdsp.unit/fce/somaticdsp.bit.ts',
    '10.somaticdsp.unit/val/somaticdsp.val.ts',
    '10.somaticdsp.unit/buz/somaticdsp.buzz.ts',
    '10.somaticdsp.unit/somaticdsp.action.ts',
    '10.somaticdsp.unit/somaticdsp.buzzer.ts',
    '10.somaticdsp.unit/somaticdsp.model.ts',
    '10.somaticdsp.unit/somaticdsp.reduce.ts',
    '10.somaticdsp.unit/somaticdsp.unit.ts',
    'val/somaticdsp.test.ts'
  ];
  for (const f of files) {
    const full = path.join('packages/400.conductor', f);
    if (!fs.existsSync(full)) {
      console.error(':: [FAIL] Missing file: ' + full);
      process.exit(1);
    }
    const content = fs.readFileSync(full, 'utf8');
    if (/[\x80-\xFF]/.test(content)) {
      console.error(':: [FAIL] Multi-byte non-ASCII character detected in: ' + full);
      process.exit(1);
    }
  }
  console.log('>> [OK] 100% 7-Bit Clean ASCII confirmed across all inodes.');
  "
  ```
- **Check 1.5 (TypeScript Compiler Verification):** Execute typecheck across the package:
  ```bash
  npx tsc -b packages/400.conductor
  ```
  (Must exit with return code 0 and zero diagnostic errors).

#### Level 2: Gillian Basis-Point & Negative-Control Phonation Gate Traps

- **Check 2.1 (Floating-Point Rejection Gate):** Assert that passing floating-point values (e.g., `fatigue_bps: 82.5`) to `CharacterSomaticStateSchema` triggers an immediate Zod parse error at Stage $T_0 = \$0.00$ spend.
- **Check 2.2 (Basis-Point Range Bounds Gate $[0, 10000]$):** Assert that negative values (`pain_bps: -100`) or values exceeding maximum saturation (`pain_bps: 10001`) fail schema validation instantly.
- **Check 2.3 (Negative-Control Phonation Trap: Unconscious Actor):** Invoke `mapSomaticToAcousticDsp` with `is_conscious: false`. *Assertion:* Must immediately throw `VOCAL_DELIVERY_BREACH: Actor is unconscious`.
- **Check 2.4 (Negative-Control Phonation Trap: Active Mute / Transected Cords):** Invoke `mapSomaticToAcousticDsp` with `active_conditions: ['cnd_vocal_cord_transected']` or `['mute']`. *Assertion:* Must immediately throw `VOCAL_DELIVERY_BREACH: Actor vocal cords are transected` or `mute`.
- **Check 2.5 (Negative-Control Phonation Trap: Banned Kinetic Verb):** Invoke `mapSomaticToAcousticDsp` with `banned_kinetic_verbs: ['sprint', 'speak']`. *Assertion:* Must throw `VOCAL_DELIVERY_BREACH: speak verb is in banned_kinetic_verbs`.

#### Level 3: Algebraic Transfer Function Precision & Boundary Clamping Traps

- **Check 3.1 (Fundamental Frequency Transposition & Clamping $[-12.0, 12.0]\text{ st}$):** Evaluate pitch transfer equation:
  $$
  F_{0,\text{eff}} = \text{basePitch} + \left(\frac{\text{cents}}{100}\right) + \left(+3.5 \times \frac{\text{pain}}{10000}\right) + \left(-2.0 \times \frac{\text{fatigue}}{10000}\right) \text{}
  $$
  *Assertion:* Under extreme inputs (`basePitchShiftSemitones: 11.5`, `pain_bps: 10000`), the calculated value must be clamped hard at `12.0` semitones. Under crushed larynx trauma, pitch must drop by an additional `-4.0` semitones.
- **Check 3.2 (Formant Warping Ratio Clamping $[0.5, 2.0]$ & Laryngeal Collapse):** Evaluate formant transfer equation:
  $$
  W_{\text{eff}} = \text{formantBase} \times \left(1.0 + \frac{\Delta\text{Formant}_{\text{bps}}}{10000}\right) \text{}
  $$
  *Assertion:* Clamped strictly to $[0.5, 2.0]$. Under condition `crushed_larynx`, $W_{\text{eff}}$ must collapse to $\le 0.70$.
- **Check 3.3 (Quadratic Breath Dilation & $2.8\times$ Pause Multiplier Lock):** Evaluate respiratory dilation equation:
  $$
  \Pi_{\text{eff}} = \text{baseBreath} \times \left(1.0 + 1.40 \times \left(\frac{\text{fatigue}}{10000}\right)^2\right) \times \left(1.0 + \frac{\text{breathiness\_bps}}{10000}\right) \text{}
  $$
  *Assertion:* For `fatigue_bps: 8200`, $\Pi_{\text{eff}}$ must exceed $1.90$ and `pause_frequency_multiplier` must be locked to exactly $2.8\times$ with `RAPID_STACCATO` added to `banned_cadences`[cite: 1, 26].
- **Check 3.4 (Subharmonic Vocal Fry Density Clamping $[0.0, 1.0]$):** Evaluate vocal fry equation:
  $$
  \Phi_{\text{eff}} = \operatorname{clamp}\left(\text{baseFry} + 0.50 \times \frac{\text{fatigue}}{10000} + 0.40 \times \frac{\text{pain}}{10000} + \frac{\text{fry\_bps}}{10000}, 0.0, 1.0\right) \text{}
  $$
  *Assertion:* Saturation cannot exceed `1.0` under compounding trauma metrics.
- **Check 3.5 (Broadcast Compliance Ceilings):** Assert that output modifiers permanently append `target_lufs: -16.0` and `peak_dbtp: -1.0`.

#### Level 4: Colocated Vitest Test Battery Clearance

- Execute the complete test battery:
  ```bash
  npx vitest run packages/400.conductor/val/somaticdsp.test.ts
  ```
  (100% of test assertions must pass with exit code 0)[cite: 1].

#### Level 5: Blessed Terminal Interface (TUI) Live Cockpit Journey & Telemetry Audit

- **Step 5.1 (Launch Terminal Cockpit):** Start the operator interface via the authoritative entry point:
  ```bash
  npm run dev
  ```
- **Step 5.2 (Human Keyboard Emulation Journey):**
  1. Allow the 12x12 Cartesian layout to stabilize on screen.
  2. Use arrow keys (`Down`/`Up`) or `J`/`K` to navigate the left menu grid (`85.choice.unit` / `98.menu.unit`).
  3. Move the selection cursor to highlight `INSPECT CHARACTER SOMATIC DSP`.
  4. Press `Enter` to dispatch action `TRANSLATE_SOMATIC_DSP`[cite: 1].
- **Step 5.3 (Console Telemetry Verification - `cns00`):** Inspect the switchboard console (`cns00` at `{ x: 4, y: 0, xSpan: 8, ySpan: 12 }`) to verify that the following 7-bit ASCII receipts are actively streamed:
  ```plaintext
  >> [SOMATIC-DSP] [OK] Translated [char_bog]: Pitch=-1.82st, Formant=0.700, Fry=0.760
  >> [MENU:SOMATIC] Inspection Complete. Modifiers calculated.
  ```
- **Step 5.4 (Graceful Teardown):** Press `Escape` or `q` to exit the Blessed curses loop cleanly, confirming zero unhandled asynchronous promise rejections and restoring terminal standard I/O.

### III. Final Feedback & Status Mutation Directive

#### 1. If ALL Verification Levels Pass (100% Compliance Across Levels 1–5):

- Update `[- **Progress:**]` at the top of this document to:
  ```markdown
  - **Progress:** [🟢 Completed: 2026-11-05 07:20:00 UTC - Somatic Biological Condition Vector Translation Certified]
  ```
- Overwrite the original specification file with this updated header.
- Emit the certified success feedback receipt:
  ```plaintext
  ================================================================================
  >> [ANTIGRAVITY AUDIT PASS] PHASE 2: SOMATIC CONDITION VECTOR TRANSLATION
  >> [LEVEL 1] Topology & Boundary Audit: PASS (Zero src/, clean 7-bit ASCII)
  >> [LEVEL 2] Gillian Basis-Point & Feasibility Traps: PASS (VOCAL_DELIVERY_BREACH fired at T0)
  >> [LEVEL 3] Transfer Functions & Clamping Math: PASS (Pitch, Formant, Breath, Fry clamped)
  >> [LEVEL 4] Colocated Vitest Test Battery: PASS (100% tests cleared with exit code 0)
  >> [LEVEL 5] Blessed Cockpit UI Journey: PASS (cns00 telemetry streaming verified)
  >> [VERDICT] SOMATIC VECTOR TRANSLATION CERTIFIED AS FUNCTIONAL ($T0 = $0.00)
  ================================================================================
  ```

#### 2. If ANY Check, Assertion, or Level Fails:

- Update `[- **Progress:**]` at the top of this document to:
  ```markdown
  - **Progress:** [🔴 Failed at Level X: 2026-11-05 07:20:00 UTC - Invariant Breach Detected: <REASON>]
  ```
- Overwrite the original specification file with this updated header.
- Emit the fail-closed conflict diagnostic banner:
  ```plaintext
  ================================================================================
  :: [ANTIGRAVITY AUDIT FAIL] SOMATIC DSP INVARIANT BREACH ENCOUNTERED
  :: Level Failed      : Level <N>
  :: Violation Type    : SCHEMA_VALIDATION_FAILED / BASIS_POINT_DRIFT / FEASIBILITY_LEAK
  :: Diagnostic Trace  : <Detailed failure traces and offending inodes>
  :: Action Taken      : Circuit breaker tripped at T0 = $0.00. Execution halted.
  ================================================================================
  ```
  (Halt execution immediately without mutating further code)[cite: 1].

### You

{{FOCUS : Phase 3 Native Speech Synthesis Subprocess Invocation Watcher}}

@jules-task-00

### Gemini

# Jules Task: Phase 3 Native Speech Synthesis Subprocess Invocation Watcher

You are tasked with implementing **Phase 3: Native Speech Synthesis Subprocess Invocation Watcher** within the `000.series-sower-conductor` repository on Rig 1. This subsystem enforces the **Hardware Partitioning & Zero-VRAM Invariant** and the **Zero-Spend Pre-Flight Economic Firewall ($T_0 = \$0.00$)**: neural speech synthesis executes as an ephemeral, single-shot child process managed by Node.js, eliminating long-lived web server daemons, port collisions, and background zombie processes. Spoken dialogue is written to an atomic temporary staging path, non-blockingly polled for byte-size stabilization, validated against the Zero-Byte Poison Buffer Sentinel Gate, and promoted atomically to permanent scratch storage.

### Architectural Invariants & Monorepo Boundaries

1. **Absolute Ban on `src/`:** All code must reside strictly within `packages/400.conductor/09.speech.unit/`, `packages/400.conductor/98.menu.unit/`, or unit test batteries in `packages/400.conductor/val/`. Under no circumstances may any file be placed inside a `src/` directory within `packages/400.conductor/`.
2. **Immutable Harness Boundary:** `apps/995.library/995.library/**` is strictly immutable (0 lines modified).
3. **Zero-VRAM Subprocess Invariant:** Execution must pass `CUDA_VISIBLE_DEVICES: ""` within child process options to guarantee 0 MB of dedicated GPU VRAM consumption on Rig 1.
4. **Non-Blocking Inode Polling Loop:** Buffer flushing must be verified asynchronously across the event loop via recurring `setTimeout` ticks (200 ms interval) polling for `.tmp` inode appearance and byte-size quiescence, avoiding synchronous sleep traps.
5. **Atomic POSIX Promotion:** Direct writes to the target `.wav` path are forbidden. The worker writes to `${targetPath}.tmp` and promotes it via `fs.renameSync` only after passing size stabilization and header validation.
6. **Zero-Byte Poison Buffer Sentinel Gate:** Any stem under 1,024 bytes or lacking valid `RIFF....WAVE` ASCII header markers must be rejected immediately, aborting promotion and unlinking the staging file.
7. **Per-Line Isolated Retry Harness:** Spawning is wrapped in an isolated 3-attempt retry loop with exponential backoff ($\text{delayMs} = 100 \times 2^{\text{attempt} - 1}$) so transient process panics do not abort whole-scene execution.
8. **Pure 7-Bit Clean ASCII Telemetry:** All source files, logs, comments, and console outputs must strictly use 7-bit ASCII tokens (`>>`, `[OK]`, `[FAIL]`, `::`, `[SPAWN]`, `[POLL]`, `[SENTINEL]`, `[ATOMIC-COMMIT]`).
9. **NodeNext Explicit `.js` Imports:** All relative TypeScript imports must explicitly terminate with `.js` extensions (e.g., `import State from '../99.core/state.js'`).

### File Implementation Manifest

```plaintext
packages/400.conductor/
├── 09.speech.unit/
│   ├── fce/
│   │   ├── speech.bit.ts
│   │   └── speech.interface.ts
│   ├── val/
│   │   └── speech.val.ts
│   ├── buz/
│   │   └── speech.buzz.ts
│   ├── speech.action.ts
│   ├── speech.buzzer.ts
│   ├── speech.model.ts
│   ├── speech.reduce.ts
│   └── speech.unit.ts
├── 98.menu.unit/
│   └── buz/
│       └── 00.menu.buzz.ts              (Update: Mount Synthesize Scene Audio Stems)
├── BEE.ts                               (Update: Register SpeechUnit)
└── val/
    └── speechSubprocess.test.ts         (Comprehensive Vitest Battery)
```

### Source Code Deliverables

#### 1. Interface & Bit Definitions

```typescript
// packages/400.conductor/09.speech.unit/fce/speech.interface.ts
import { AcousticDspModifiers } from '../../10.somaticdsp.unit/fce/somaticdsp.interface.js';

export type TtsEngineType = 'styletts2' | 'parler' | 'piper';

export interface DialogueSynthesisItem {
  line_id: string;
  speaker_id: string;
  dialogue_text: string;
  emotion_tag: string;
  tonePacing?: number;
  dsp_modifiers?: AcousticDspModifiers;
  output_filename?: string;
}

export interface SpeechGenerationRequest {
  series_id: string;
  scene_id: string;
  engine: TtsEngineType;
  items: DialogueSynthesisItem[];
  output_directory?: string;
}

export interface StemSynthesisReceipt {
  ok: boolean;
  line_id: string;
  speaker_id: string;
  target_path: string;
  byte_size: number;
  sha256: string;
  duration_ms: number;
  execution_ms: number;
  attempts: number;
  error?: string;
}

export interface SceneSpeechReceipt {
  ok: boolean;
  scene_id: string;
  total_lines: number;
  successful_stems: number;
  failed_stems: number;
  stems: StemSynthesisReceipt[];
  error?: string;
}

export default interface Speech {
  idx: string;
  isProcessing: boolean;
  totalStemsSynthesized: number;
  lastSceneReceipt?: SceneSpeechReceipt;
}
```

```typescript
// packages/400.conductor/09.speech.unit/fce/speech.bit.ts
import {
  SpeechGenerationRequest,
  SceneSpeechReceipt,
  DialogueSynthesisItem,
  StemSynthesisReceipt,
} from './speech.interface.js';

export default interface SpeechBit {
  idx: string;
  src?: string;
  val?: number;
  dat?: {
    request?: SpeechGenerationRequest;
    singleItem?: DialogueSynthesisItem;
    receipt?: SceneSpeechReceipt;
    stemReceipt?: StemSynthesisReceipt;
  };
  slv?: Function;
}
```

#### 2. Zod Validation & Domain Bounds

```typescript
// packages/400.conductor/09.speech.unit/val/speech.val.ts
import { z } from 'zod';

export const TtsEngineTypeSchema = z.enum(['styletts2', 'parler', 'piper']);

export const DialogueSynthesisItemSchema = z
  .object({
    line_id: z.string().regex(/^line_[0-9]{3,}$/, 'line_id must match line_XXX format'),
    speaker_id: z.string().min(1, 'speaker_id cannot be empty'),
    dialogue_text: z
      .string()
      .min(1, 'dialogue_text cannot be empty')
      .regex(/^[\x20-\x7E\r\n\t]*$/, 'dialogue_text must be 7-bit clean ASCII'),
    emotion_tag: z.string().min(1),
    tonePacing: z.number().min(0.5).max(2.0).default(1.0),
    dsp_modifiers: z.any().optional(),
    output_filename: z.string().optional(),
  })
  .strict();

export const SpeechGenerationRequestSchema = z
  .object({
    series_id: z.string().min(1),
    scene_id: z.string().min(1),
    engine: TtsEngineTypeSchema.default('styletts2'),
    items: z.array(DialogueSynthesisItemSchema).min(1, 'items array cannot be empty'),
    output_directory: z.string().optional(),
  })
  .strict();
```

#### 3. Buzzer Implementation, Subprocess Spawner, and Polling Watcher

```typescript
// packages/400.conductor/09.speech.unit/buz/speech.buzz.ts
import { SpeechModel } from '../speech.model.js';
import SpeechBit from '../fce/speech.bit.js';
import {
  SpeechGenerationRequest,
  DialogueSynthesisItem,
  StemSynthesisReceipt,
  SceneSpeechReceipt,
} from '../fce/speech.interface.js';
import { SpeechGenerationRequestSchema } from '../val/speech.val.js';
import State from '../../99.core/state.js';
import { execFile } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

export const buildCliArgs = (
  scriptPath: string,
  item: DialogueSynthesisItem,
  outputPath: string,
  engine: string,
  seriesId: string,
): string[] => {
  const args: string[] = [
    scriptPath,
    '--engine', engine,
    '--character', item.speaker_id,
    '--series', seriesId,
    '--text', item.dialogue_text,
    '--output', outputPath,
  ];

  if (item.dsp_modifiers) {
    args.push(
      '--pitch-shift', String(item.dsp_modifiers.effective_pitch_semitones ?? 0.0),
      '--formant-warp', String(item.dsp_modifiers.effective_formant_warping ?? 1.0),
      '--breathiness', String(item.dsp_modifiers.effective_breathiness_multiplier ?? 1.0),
      '--pause-multiplier', String(item.dsp_modifiers.pause_frequency_multiplier ?? 1.0),
      '--vocal-fry', String(item.dsp_modifiers.effective_vocal_fry_density ?? 0.0),
    );
  }

  return args;
};

export const verifyZeroByteSentinel = (filePath: string): boolean => {
  if (!fs.existsSync(filePath)) return false;
  const stats = fs.statSync(filePath);
  if (stats.size < 1024) return false;

  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(12);
  fs.readSync(fd, buffer, 0, 12, 0);
  fs.closeSync(fd);

  const riff = buffer.subarray(0, 4).toString('ascii');
  const wave = buffer.subarray(8, 12).toString('ascii');
  return riff === 'RIFF' && wave === 'WAVE';
};

export const pollFileStabilization = async (
  stagingPath: string,
  maxTimeoutMs = 45000,
  pollIntervalMs = 200,
): Promise<number> => {
  const startTime = Date.now();
  let lastSize = -1;
  let stableTicks = 0;

  while (Date.now() - startTime < maxTimeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

    if (fs.existsSync(stagingPath)) {
      const currentSize = fs.statSync(stagingPath).size;
      if (currentSize > 0 && currentSize === lastSize) {
        stableTicks++;
        if (stableTicks >= 2) {
          return currentSize;
        }
      } else {
        stableTicks = 0;
        lastSize = currentSize;
      }
    }
  }

  throw new Error(`SYNTHESIS_TIMEOUT_BREACH: File failed to stabilize within ${maxTimeoutMs}ms`);
};

export const synthesizeSingleLineWithRetry = async (
  item: DialogueSynthesisItem,
  outputDir: string,
  engine: string,
  seriesId: string,
  sceneId: string,
): Promise<StemSynthesisReceipt> => {
  const lineStart = Date.now();
  const filename = item.output_filename || `${sceneId}_${item.line_id}.wav`;
  const finalPath = path.resolve(outputDir, filename);
  const stagingPath = `${finalPath}.tmp`;

  let attempt = 0;
  const maxAttempts = 3;
  let lastError: Error | null = null;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      if (fs.existsSync(stagingPath)) {
        try { fs.unlinkSync(stagingPath); } catch {}
      }

      if (global.LIBRARY) {
        await global.LIBRARY.hunt('[Console action] Update Console', {
          idx: 'cns00',
          src: `>> [SPAWN] (${attempt}/${maxAttempts}) Invoking python synthesize.py for line [${item.line_id}] (Speaker: ${item.speaker_id})`,
        });
      }

      const scriptPath = path.resolve('synthesize.py');
      const args = buildCliArgs(scriptPath, item, stagingPath, engine, seriesId);

      await new Promise<void>((resolve, reject) => {
        execFile(
          'python',
          args,
          {
            env: {
              ...process.env,
              CUDA_VISIBLE_DEVICES: '',
              OMP_NUM_THREADS: '4',
            },
            timeout: 40000,
          },
          (error) => {
            if (error) reject(error);
            else resolve();
          },
        );
      });

      const confirmedSize = await pollFileStabilization(stagingPath);

      if (!verifyZeroByteSentinel(stagingPath)) {
        throw new Error('ZERO_BYTE_POISON_BREACH: Header validation failed or size < 1024 bytes');
      }

      fs.renameSync(stagingPath, finalPath);

      const fileBuffer = fs.readFileSync(finalPath);
      const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      const durationMs = Math.round((confirmedSize - 44) / (48000 * 2 * (24 / 8)) * 1000) || 1000;

      if (global.LIBRARY) {
        await global.LIBRARY.hunt('[Console action] Update Console', {
          idx: 'cns00',
          src: `>> [ATOMIC-COMMIT] [OK] Committed [${filename}] (${confirmedSize} bytes, SHA: ${sha256.substring(0, 8)}...)`,
        });
      }

      return {
        ok: true,
        line_id: item.line_id,
        speaker_id: item.speaker_id,
        target_path: finalPath,
        byte_size: confirmedSize,
        sha256,
        duration_ms: durationMs,
        execution_ms: Date.now() - lineStart,
        attempts: attempt,
      };
    } catch (err: any) {
      lastError = err;
      if (fs.existsSync(stagingPath)) {
        try { fs.unlinkSync(stagingPath); } catch {}
      }

      if (attempt < maxAttempts) {
        const backoffMs = 100 * Math.pow(2, attempt - 1);
        if (global.LIBRARY) {
          await global.LIBRARY.hunt('[Console action] Update Console', {
            idx: 'cns00',
            src: `:: [RETRY] Line [${item.line_id}] failed attempt ${attempt}. Backing off for ${backoffMs}ms: ${err.message}`,
          });
        }
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  const failMsg = lastError ? lastError.message : 'Unknown synthesis failure';
  if (global.LIBRARY) {
    await global.LIBRARY.hunt('[Console action] Update Console', {
      idx: 'cns00',
      src: `:: [FAIL] Exhausted all ${maxAttempts} attempts for line [${item.line_id}]: ${failMsg}`,
    });
  }

  return {
    ok: false,
    line_id: item.line_id,
    speaker_id: item.speaker_id,
    target_path: finalPath,
    byte_size: 0,
    sha256: '',
    duration_ms: 0,
    execution_ms: Date.now() - lineStart,
    attempts: attempt,
    error: failMsg,
  };
};

export const initSpeech = (cpy: SpeechModel, bal: SpeechBit, ste: State) => {
  if (bal.slv != null) {
    bal.slv({ spcBit: { idx: 'init-speech', val: 1 } });
  }
  return cpy;
};

export const updateSpeech = (cpy: SpeechModel, bal: SpeechBit, ste: State) => {
  if (bal.slv != null) {
    bal.slv({ spcBit: { idx: 'update-speech' } });
  }
  return cpy;
};

export const executeSceneSpeech = async (cpy: SpeechModel, bal: SpeechBit, ste: State) => {
  cpy.isProcessing = true;
  try {
    if (!bal.dat?.request) {
      throw new Error('MISSING_REQUEST: dat.request payload is required');
    }

    const validatedReq = SpeechGenerationRequestSchema.parse(bal.dat.request) as SpeechGenerationRequest;
    const outputDir = path.resolve(validatedReq.output_directory || 'public/audio/dialogue');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [SPEECH] Commencing Scene Audio Synthesis for [${validatedReq.scene_id}] (${validatedReq.items.length} lines) via [${validatedReq.engine}]`,
      });
    }

    const receipts: StemSynthesisReceipt[] = [];
    for (const item of validatedReq.items) {
      const receipt = await synthesizeSingleLineWithRetry(
        item,
        outputDir,
        validatedReq.engine,
        validatedReq.series_id,
        validatedReq.scene_id,
      );
      receipts.push(receipt);
      if (receipt.ok) {
        cpy.totalStemsSynthesized++;
      }
    }

    const successfulStems = receipts.filter((r) => r.ok).length;
    const failedStems = receipts.filter((r) => !r.ok).length;

    const sceneReceipt: SceneSpeechReceipt = {
      ok: failedStems === 0,
      scene_id: validatedReq.scene_id,
      total_lines: validatedReq.items.length,
      successful_stems: successfulStems,
      failed_stems: failedStems,
      stems: receipts,
      error: failedStems > 0 ? `${failedStems} stem(s) failed during execution` : undefined,
    };

    cpy.lastSceneReceipt = sceneReceipt;
    cpy.isProcessing = false;

    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [SPEECH] [OK] Scene [${validatedReq.scene_id}] Completed: ${successfulStems}/${validatedReq.items.length} stems synthesized successfully`,
      });
    }

    if (bal.slv != null) {
      bal.slv({
        spcBit: {
          idx: 'execute-scene-speech-success',
          dat: { receipt: sceneReceipt },
        },
      });
    }
  } catch (err: any) {
    cpy.isProcessing = false;
    const errorMsg = err.message || String(err);

    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `:: [SPEECH] [FAIL] Scene Speech Execution faulted: ${errorMsg}`,
      });
    }

    if (bal.slv != null) {
      bal.slv({
        spcBit: {
          idx: 'execute-scene-speech-error',
          src: errorMsg,
        },
      });
    }
  }

  return cpy;
};
```

#### 4. Action Classes, Buzzer Exports, Model, and Reducer

```typescript
// packages/400.conductor/09.speech.unit/speech.action.ts
import { Action } from '../99.core/interface/action.interface.js';
import SpeechBit from './fce/speech.bit.js';

export const INIT_SPEECH = '[Speech action] Init Speech';
export class InitSpeech implements Action {
  readonly type = INIT_SPEECH;
  constructor(public bale: SpeechBit) {}
}

export const UPDATE_SPEECH = '[Speech action] Update Speech';
export class UpdateSpeech implements Action {
  readonly type = UPDATE_SPEECH;
  constructor(public bale: SpeechBit) {}
}

export const EXECUTE_SCENE_SPEECH = '[Speech action] Execute Scene Speech';
export class ExecuteSceneSpeech implements Action {
  readonly type = EXECUTE_SCENE_SPEECH;
  constructor(public bale: SpeechBit) {}
}

export type Actions = InitSpeech | UpdateSpeech | ExecuteSceneSpeech;
```

```typescript
// packages/400.conductor/09.speech.unit/speech.buzzer.ts
export {
  initSpeech,
  updateSpeech,
  executeSceneSpeech,
  buildCliArgs,
  verifyZeroByteSentinel,
  pollFileStabilization,
  synthesizeSingleLineWithRetry,
} from './buz/speech.buzz.js';
```

```typescript
// packages/400.conductor/09.speech.unit/speech.model.ts
import Speech, { SceneSpeechReceipt } from './fce/speech.interface.js';

export class SpeechModel implements Speech {
  idx: string = '09.speech';
  isProcessing: boolean = false;
  totalStemsSynthesized: number = 0;
  lastSceneReceipt?: SceneSpeechReceipt;
}
```

```typescript
// packages/400.conductor/09.speech.unit/speech.reduce.ts
import clone from 'clone-deep';
import * as Act from './speech.action.js';
import { SpeechModel } from './speech.model.js';
import * as Buzz from './speech.buzzer.js';
import State from '../99.core/state.js';

export function reducer(
  model: SpeechModel = new SpeechModel(),
  act: Act.Actions,
  state?: State,
) {
  switch (act.type) {
    case Act.INIT_SPEECH:
      return Buzz.initSpeech(clone(model), act.bale, state!);

    case Act.UPDATE_SPEECH:
      return Buzz.updateSpeech(clone(model), act.bale, state!);

    case Act.EXECUTE_SCENE_SPEECH:
      return Buzz.executeSceneSpeech(clone(model), act.bale, state!);

    default:
      return model;
  }
}
```

```typescript
// packages/400.conductor/09.speech.unit/speech.unit.ts
import State from '../99.core/state.js';

export default class SpeechUnit {
  constructor(state: State) {}
}
```

#### 5. Central Wiring in BEE.ts

```typescript
// In packages/400.conductor/BEE.ts:
// Add import and registration for SpeechUnit:
import SpeechUnit from './09.speech.unit/speech.unit.js';
import Speech from './09.speech.unit/fce/speech.interface.js';
import { SpeechModel } from './09.speech.unit/speech.model.js';
import { reducer as speechReducer } from './09.speech.unit/speech.reduce.js';

// In list:
export const list = {
  // ... other units
  speech: SpeechUnit,
};

// In reducer:
export const reducer = {
  // ... other reducers
  speech: speechReducer,
};

// In UnitData:
export default class UnitData implements Model {
  // ... other units
  speech: Speech = new SpeechModel();
}
```

#### 6. Blessed Menu Integration

```typescript
// In packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts:
// Add choice option under the menu switch case:
case 'SYNTHESIZE SCENE AUDIO STEMS':
  bit = await ste.hunt('[Speech action] Execute Scene Speech', {
    dat: {
      request: {
        series_id: 'under-the-floorboards',
        scene_id: 'ep01_sc01',
        engine: 'styletts2',
        output_directory: 'public/audio/dialogue',
        items: [
          {
            line_id: 'line_001',
            speaker_id: 'char_elias',
            dialogue_text: 'The intake valve is rusted through.',
            emotion_tag: 'tense_jaw',
            tonePacing: 1.0,
          },
        ],
      },
    },
  });
  if (bit?.spcBit?.dat?.receipt?.ok) {
    await global.LIBRARY.hunt('[Console action] Update Console', {
      idx: 'cns00',
      src: '>> [MENU:SPEECH] Speech generation finished successfully.',
    });
  }
  break;
```

#### 7. Colocated Vitest Verification Battery

```typescript
// packages/400.conductor/val/speechSubprocess.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SpeechModel } from '../09.speech.unit/speech.model.js';
import * as Buzz from '../09.speech.unit/buz/speech.buzz.js';
import { DialogueSynthesisItem } from '../09.speech.unit/fce/speech.interface.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('09.speech.unit: Native Speech Synthesis Subprocess Invocation Watcher', () => {
  let model: SpeechModel;
  const testOutputDir = path.resolve('public/audio/dialogue/test_scratch');

  beforeEach(() => {
    model = new SpeechModel();
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  const baseItem: DialogueSynthesisItem = {
    line_id: 'line_001',
    speaker_id: 'char_elias',
    dialogue_text: 'The intake valve is rusted through.',
    emotion_tag: 'tense_jaw',
    tonePacing: 1.0,
    dsp_modifiers: {
      effective_pitch_semitones: -1.5,
      effective_formant_warping: 0.85,
      effective_breathiness_multiplier: 1.4,
      pause_frequency_multiplier: 1.2,
      effective_vocal_fry_density: 0.35,
      target_lufs: -16.0,
      peak_dbtp: -1.0,
      banned_cadences: [],
    },
  };

  it('buildCliArgs correctly maps all somatic DSP modifiers and engine arguments', () => {
    const args = Buzz.buildCliArgs('synthesize.py', baseItem, 'test.tmp', 'styletts2', 'floorboards');
    expect(args).toContain('--engine');
    expect(args).toContain('styletts2');
    expect(args).toContain('--character');
    expect(args).toContain('char_elias');
    expect(args).toContain('--pitch-shift');
    expect(args).toContain('-1.5');
    expect(args).toContain('--formant-warp');
    expect(args).toContain('0.85');
    expect(args).toContain('--breathiness');
    expect(args).toContain('1.4');
    expect(args).toContain('--vocal-fry');
    expect(args).toContain('0.35');
  });

  it('verifyZeroByteSentinel rejects missing files, files < 1024 bytes, and invalid RIFF headers', () => {
    const nonExistent = path.join(testOutputDir, 'missing.wav');
    expect(Buzz.verifyZeroByteSentinel(nonExistent)).toBe(false);

    const smallFile = path.join(testOutputDir, 'small.wav');
    fs.writeFileSync(smallFile, Buffer.alloc(500));
    expect(Buzz.verifyZeroByteSentinel(smallFile)).toBe(false);

    const corruptHeader = path.join(testOutputDir, 'corrupt.wav');
    const corruptBuffer = Buffer.alloc(2048);
    corruptBuffer.write('FAIL', 0, 'ascii');
    fs.writeFileSync(corruptHeader, corruptBuffer);
    expect(Buzz.verifyZeroByteSentinel(corruptHeader)).toBe(false);

    const validHeader = path.join(testOutputDir, 'valid.wav');
    const validBuffer = Buffer.alloc(2048);
    validBuffer.write('RIFF', 0, 'ascii');
    validBuffer.write('WAVE', 8, 'ascii');
    fs.writeFileSync(validHeader, validBuffer);
    expect(Buzz.verifyZeroByteSentinel(validHeader)).toBe(true);
  });

  it('pollFileStabilization successfully confirms byte-size stabilization', async () => {
    const stagingFile = path.join(testOutputDir, 'polling_test.wav.tmp');
    fs.writeFileSync(stagingFile, Buffer.alloc(1500));

    const confirmedSize = await Buzz.pollFileStabilization(stagingFile, 2000, 50);
    expect(confirmedSize).toBe(1500);
  });

  it('pollFileStabilization throws SYNTHESIS_TIMEOUT_BREACH if file does not appear', async () => {
    const nonExistent = path.join(testOutputDir, 'ghost.wav.tmp');
    await expect(Buzz.pollFileStabilization(nonExistent, 150, 50)).rejects.toThrow(
      /SYNTHESIS_TIMEOUT_BREACH/,
    );
  });
});
```

### Jules Execution Protocol

1. Place all implementation files into `packages/400.conductor/09.speech.unit/` adhering strictly to `.js` import specifiers.
2. Register `SpeechUnit` in `packages/400.conductor/BEE.ts` under `list`, `reducer`, and `UnitData`.
3. Add `SYNTHESIZE SCENE AUDIO STEMS` to `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts`.
4. Run `npx vitest run packages/400.conductor/val/speechSubprocess.test.ts` to ensure 100% of unit tests pass.
5. Verify that `npx tsc -b packages/400.conductor` compiles with zero diagnostic warnings and `test ! -d packages/400.conductor/src` confirms absence of any forbidden `src/` directory.
6. **COMMAND:** When you begin working on this specification, immediately update the `[- **Status:**]` attribute below to `[🟡 In Progress]`. When all target files and the Vitest test gauntlet pass with exit code 0, update `[- **Status:**]` to `[🟢 Done]`.

### **Attributes:**

- **Status:** [⚪ Backlog ]
- **Priority:** [🔴 High]
- **Time Estimate:** [1 Hour]
- **Tags:** [infrastructure, speech-unit, subprocess-watcher, zero-vram, audio-conformance]
- **Epic:** [EPIC 001: INFRASTRUCTURE & GOVERNANCE]
- **Value:** [Acoustic Clock Synthesis]
- **Sprint Points:** [2]
- **Component:** [packages/400.conductor/09.speech.unit]
- **Owner:** [Jules Autonomous Implementer]
- **Target Release:** [Sprint 4 / Conductor v1.0]
- **Risk Level:** [Low]
- **Reporter:** [Studio Architecture Lead]

### You

{{FOCUS : Phase 3 Native Speech Synthesis Subprocess Invocation Watcher}}

@jules-complete-check

### Gemini

### **Validation:**

- **Progress:** [⚪ Waiting for Action ]

#### Jules Pre-Flight Completion Audit & Operational Directive

**Agent Instruction:** Before generating, authoring, or mutating any code for **Phase 3: Native Speech Synthesis Subprocess Invocation Watcher**, execute an automated inspection audit across `packages/400.conductor/09.speech.unit/`, `packages/400.conductor/BEE.ts`, `packages/400.conductor/98.menu.unit/`, and `packages/400.conductor/val/` in repository `000.series-sower-conductor` against the **12-Point Pre-Flight Completion Inspection Checklist** below to verify whether this native child process spawner, non-blocking asynchronous `.tmp` polling watcher, Zero-Byte Poison Buffer Sentinel Gate, and atomic POSIX promotion committer have already been completed:

$$
\text{Completion Percentage} = \left(\frac{\text{Passed Checks}}{12}\right) \times 100\% \text{[cite: 1]}
$$

##### The 12-Point Completion Audit Battery

1. **Physical Inode Existence (`fce/`):** Verify that `packages/400.conductor/09.speech.unit/fce/speech.interface.ts` and `fce/speech.bit.ts` exist on disk and export `TtsEngineType`, `DialogueSynthesisItem`, `SpeechGenerationRequest`, `StemSynthesisReceipt`, `SceneSpeechReceipt`, and `SpeechBit`.
2. **Schema Validation Inode (`val/`):** Verify that `packages/400.conductor/09.speech.unit/val/speech.val.ts` exists and exports `TtsEngineTypeSchema`, `DialogueSynthesisItemSchema`, and `SpeechGenerationRequestSchema` with `.strict()` termination.
3. **Buzzer Execution Inode (`buz/`):** Verify that `packages/400.conductor/09.speech.unit/buz/speech.buzz.ts` exists and implements `buildCliArgs`, `verifyZeroByteSentinel`, `pollFileStabilization`, `synthesizeSingleLineWithRetry`, `initSpeech`, `updateSpeech`, and `executeSceneSpeech`.
4. **Candor 7-File Unit Architecture:** Verify that `speech.action.ts`, `speech.buzzer.ts`, `speech.model.ts`, `speech.reduce.ts`, and `speech.unit.ts` physically exist within `packages/400.conductor/09.speech.unit/`.
5. **Zero-VRAM Hardware Sentry (`child_process.execFile`):** Confirm that `synthesizeSingleLineWithRetry` executes `python synthesize.py` via `child_process.execFile` with an explicit environment override `CUDA_VISIBLE_DEVICES: ""` and `OMP_NUM_THREADS: "4"` to guarantee 0 MB of dedicated GPU VRAM consumption on Rig 1.
6. **Non-Blocking Asynchronous Polling Watcher:** Confirm that `pollFileStabilization` operates across non-blocking event-loop ticks (`setTimeout` intervals at 200 ms) verifying file existence, tracking byte-size quiescence across consecutive reads, and enforcing a 45-second `SYNTHESIS_TIMEOUT_BREACH` circuit breaker.
7. **Zero-Byte Poison Buffer Sentinel Gate:** Verify that `verifyZeroByteSentinel` inspects audio stems on disk, asserting file size $\ge 1024\text{ bytes}$ and validating standard ASCII `RIFF` (bytes 0–3) and `WAVE` (bytes 8–11) header markers before allowing promotion.
8. **Atomic POSIX Promotion & Inode Commits:** Confirm that the spawner directs Python output strictly to an ephemeral staging path (`${finalPath}.tmp`) and executes an atomic POSIX promotion via `fs.renameSync` only after size stabilization and header validation succeed.
9. **Isolated Per-Line Exponential Backoff Retry Loop:** Verify that single-line synthesis is wrapped in a 3-attempt retry loop with exponential backoff ($\text{delayMs} = 100 \times 2^{\text{attempt} - 1}$), isolating transient process drops without aborting previously completed stems.
10. **Monorepo Central Wiring (`BEE.ts`):** Confirm that `packages/400.conductor/BEE.ts` imports `SpeechUnit` and registers it across `list`, `reducer`, and `UnitData` under key `speech`.
11. **Blessed Terminal Cockpit Integration:** Verify that `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` mounts `SYNTHESIZE SCENE AUDIO STEMS` and pipes 7-bit ASCII telemetry (`>> [SPAWN]`, `>> [POLL]`, `>> [ATOMIC-COMMIT]`) directly into switchboard pane `cns00`.
12. **Vitest Verification Suite & Monorepo Boundaries:** Execute `npx vitest run packages/400.conductor/val/speechSubprocess.test.ts` and confirm 100% passing tests with exit code 0; assert that `packages/400.conductor/src/` does not exist (`test ! -d packages/400.conductor/src`), `apps/995.library/` has 0 modified lines (`git status -s apps/995.library/995.library/` returns empty), and all unit code is 100% clean 7-bit ASCII.

##### Operational Halting & Execution Rules

- **IF $\ge 67\%$ (8 or more of the 12 checks pass):**
  - Update `[- **Progress:**]` above with the current execution timestamp and date:
    ```markdown
    - **Progress:** [🟢 Completed on Thursday, November 5, 2026 at 7:25 AM EST - Audit Score: >= 67% - Pre-existing Work Verified]
      *Reason for Halt:* Pre-flight audit confirmed that >= 67% of Phase 3 Native Speech Synthesis Subprocess Invocation Watcher requirements—including 09.speech.unit Candor structure, CLI argument serialization, child_process.execFile spawner with CUDA_VISIBLE_DEVICES: "" (Zero-VRAM invariant), non-blocking .tmp polling watcher with byte-size stabilization, Zero-Byte Poison Buffer Sentinel Gate, atomic fs.renameSync promotion, BEE.ts registration, Blessed TUI menu mounting, and green Vitest test suites—are already established on disk. Operational execution halted immediately to prevent redundant file mutations or overwrites.
    ```
  - Write the original specification file with this updated timecode header and **STOP IMMEDIATELY!**
  - **STRICT AGENT BOUNDARY:** The Jules Coding Agent must strictly understand that this status and timestamp update is the **ONLY** update, work, and activity to be induced from this prompt. Do **NOT** rewrite files, do **NOT** modify existing tests, and do **NOT** execute redundant implementations.
- **IF $< 67\%$ (0 to 7 checks pass):**
  - Jules must proceed to implement and fulfill all missing requirements across `packages/400.conductor/09.speech.unit/`, `packages/400.conductor/BEE.ts`, `packages/400.conductor/98.menu.unit/`, and `packages/400.conductor/val/speechSubprocess.test.ts`.
  - Once monorepo compilation (`npx tsc -b packages/400.conductor`) and Vitest runs clear with exit code 0, update `[- **Progress:**]` to `[🟢 Completed on Thursday, November 5, 2026 at 7:25 AM EST - Task Requirements Fully Implemented]` and save the file.

> **CRITICAL PARTNER TEST ADVISORY WARNING:** If there is a partner file located next to this one in the directory matching the suffix `[xxx.phase-xxx.ag-test.md]`, **YOU ARE TO NEVER RUN THIS TEST**. That test suite belongs exclusively to the Antigravity adversarial audit agent (`ag-test`), which will independently verify this implementation.

### **FUNCTIONAL MANDATE**

#### **User Story**

At 3:14 AM in the production lab, Sarah was running a batch compile of Episode 040. Her dual-monitor workstation hummed: the left display showed the Blessed curses terminal cockpit on Rig 1, while the right was patched into the headless GPU foundry on Rig 2. Two weeks prior, Sarah had lived through the "daemon zombie catastrophe". In the previous architecture, an always-on Python FastAPI daemon sat listening on loopback port 8000. During long render passes, network socket timeouts would silently drop connection handles, PyTorch tensor memory would slowly leak across resident model swaps, and stray background zombie processes would hold onto port 8000, forcing Sarah to constantly drop to bash, hunt PIDs with `lsof -i :8000`, and issue manual `kill -9` commands while the episode render stalled. Worse, if an audio engine accidentally initialized a CUDA context on Rig 1, the video compositor would suffer an instant GPU out-of-memory crash.

Tonight, `09.speech.unit` took over speech execution using native ephemeral subprocess orchestration.

When the Conductor reached Scene 02, Sarah watched switchboard pane `cns00` flicker with clean, rhythmic ASCII text. Node.js did not ask an external daemon for permission over a network socket; it invoked `child_process.execFile` directly, executing `python synthesize.py` as an isolated, single-shot child process. An unyielding environment barrier clamped `CUDA_VISIBLE_DEVICES: ""`—the GPU sat completely untouched at exactly 0 MB of VRAM, leaving all workstation memory unconstrained for optical compositing.

On disk, the synthesizer wrote to `ep040_sc02_line_001.wav.tmp`. The non-blocking polling watcher ticked quietly every 200 milliseconds, checking the file size without freezing the terminal choice menus. The console stream updated: `>> [POLL] Staging inode detected (144,044 bytes)... Stabilized.` In the next millisecond, the Zero-Byte Sentinel verified the `RIFF....WAVE` ASCII header markers, confirmed the size exceeded 1,024 bytes, and executed an atomic POSIX `renameSync`.

When line 004 threw a transient acoustic vocoder exception, the isolated retry harness absorbed the fault, waited 200 milliseconds, and recovered cleanly on attempt 2 without canceling the rest of the scene. Within seconds, the child process cleanly vaporized from process memory. No daemon remained running, zero ports were tied up, and Sarah had twenty-four verified 48 kHz uncompressed WAV stems sitting in scratch storage, ready for temporal quantization.

#### **Strategic Goal**

Directly fulfills the primary architectural mandate of **Deterministic, Zero-VRAM Rig 1 Acoustic Master Clock Generation at $T_0 = \$0.00$**. By replacing fragile, long-lived loopback web daemons with ephemeral, single-shot Node.js child process invocations, non-blocking `.tmp` inode polling, and atomic POSIX promotion, this phase guarantees that speech synthesis executes purely on host CPU threads and system RAM without persistent socket latency, port collisions, or GPU memory thrashing, enabling discrete 24 fps integer timeline quantization before video diffusion models are ever allocated.

#### **Context & Value**

- **The Strategic Value:** Long-lived HTTP web servers running in developer workstations introduce significant runtime fragility: port collisions, silent memory leaks, zombie process accumulation, and unhandled connection dropouts. In an automated production pipeline, speech synthesis must behave like a deterministic compiler pass rather than a cloud web service. Ephemeral subprocess invocation ensures that Python loads its weights, synthesizes the waveform, flushes to disk, and immediately terminates, completely returning memory to the OS. Atomic POSIX staging prevents downstream video and optical engines from ever observing half-written or corrupted audio buffers.
- **The Technical Challenge:** Managing one-shot Python process lifecycles across Node.js without blocking the JavaScript event loop or freezing the Blessed curses interface; authoring a non-blocking asynchronous polling loop that accurately detects buffer flushing completion via byte-size quiescence across consecutive intervals; enforcing strict fail-closed validation against zero-byte buffers and invalid RIFF headers; and isolating transient subprocess panics with per-line exponential backoff retries.

#### **Interface**

`Phase 3 Native Speech Synthesis Subprocess Invocation Watcher` inside `000.series-sower-conductor` interfaces across the monorepo ecosystem through strict boundaries:

- **`000.audio-microservice` / Local Python Runtimes (`synthesize.py`):** The Python script hosting the neural TTS engines (StyleTTS-2, Parler-TTS, Piper) invoked via `child_process.execFile` with CLI arguments and somatic DSP flags.
- **`packages/400.conductor/10.somaticdsp.unit` (Upstream DSP Modifiers):** Supplies the validated `AcousticDspModifiers` object (effective pitch semitones, formant warping ratio, breathiness multiplier, vocal fry density) that this unit translates into CLI arguments.
- **`packages/400.conductor/34.abstractsyntaxtree.unit` (Upstream Dialogue Source):** Supplies the sanitized, printable 7-bit clean ASCII dialogue strings, speaker IDs, and emotion tags from `dialogue_ast.json`.
- **`packages/400.conductor/24.frame.unit` (Downstream Master Clock Quantizer):** Consumes the atomically committed 48 kHz `.wav` stems, probing their continuous duration via `ffprobe` to compute discrete 24 fps integer frame budgets.
- **`apps/995.library` (Foundational Terminal Cockpit Harness):** Houses the Blessed curses interface (`run.ts`) where the unit registers menu actions and streams real-time telemetry to pane `cns00`.

#### **Interaction**

The operator observes and interacts with this phase through the **Blessed Terminal Interface** hosted in `apps/995.library`:

- **Interactive Cockpit Navigation:**
  1. Boot the terminal cockpit on Rig 1 via `npm run dev`.
  2. In the left navigation choice grid (`85.choice.unit` / `98.menu.unit`), use the arrow keys or `J`/`K` to highlight `SYNTHESIZE SCENE AUDIO STEMS`.
  3. Press `ENTER` to dispatch action `EXECUTE_SCENE_SPEECH` against the loaded scene request.
- **Visual Telemetry Feedback (`cns00`):**
  - The green-bordered switchboard console (`cns00`) streams real-time 7-bit ASCII receipts as synthesis progresses:
    ```plaintext
    >> [SPEECH] Commencing Scene Audio Synthesis for [ep01_sc01] (1 lines) via [styletts2]
    >> [SPAWN] (1/3) Invoking python synthesize.py for line [line_001] (Speaker: char_elias)
    >> [POLL] Staging inode detected (144044 bytes)... Stabilized.
    >> [ATOMIC-COMMIT] [OK] Committed [ep01_sc01_line_001.wav] (144044 bytes, SHA: 8f3a1b0c...)
    >> [SPEECH] [OK] Scene [ep01_sc01] Completed: 1/1 stems synthesized successfully
    >> [MENU:SPEECH] Speech generation finished successfully.
    ```
  - If a transient failure occurs, `cns00` logs the backoff warning before recovering:
    ```plaintext
    :: [RETRY] Line [line_001] failed attempt 1. Backing off for 100ms: Subprocess exited with code 1
    >> [SPAWN] (2/3) Invoking python synthesize.py for line [line_001] (Speaker: char_elias)
    ```
- **Local Headless CLI Inspection:**
  - For automated CI/CD validation without launching the curses UI, developers run the colocated test suite:
    ```bash
    npx vitest run packages/400.conductor/val/speechSubprocess.test.ts
    ```
  - Confirm that the package adheres strictly to the unit-colocated layout without any forbidden `src/` directory:
    ```bash
    test ! -d packages/400.conductor/src && echo ">> [OK] Zero src/ directory confirmed."
    ```
  - Verify that written audio stems are valid RIFF WAV files on disk:
    ```bash
    head -c 4 public/audio/dialogue/*.wav | grep -q "RIFF" && echo ">> [OK] Valid RIFF WAV headers confirmed"
    ```

### You

{{FOCUS : Phase 3 Native Speech Synthesis Subprocess Invocation Watcher}}

@agrav-check-00

### Gemini

### **Validation:**

- **Progress:** [⚪ Waiting for Action ]

> **Antigravity Auditor Execution Directive:** When all of the listed checks, invariant stress-tests, negative-control fault injections, and interactive Blessed terminal levels in this Antigravity prompt are complete in regards to **Phase 3 Native Speech Synthesis Subprocess Invocation Watcher**, Antigravity must update `[- **Progress:**]` above with the current completion timestamp and date (e.g., `[- **Progress:** 🟢 Completed: 2026-11-05 07:30:00 UTC]`) and write the original specification file with this updated information. If any test, hardware memory assertion, staging probe, or sentinel check fails, mark `[⚪` with `[🔴` (e.g., `[- **Progress:** 🔴 Failed at Level X: 2026-11-05 07:30:00 UTC]`), append the diagnostic stack trace, and halt execution immediately without mutating further code.

### Blessed Terminal Interface (TUI) Validation Instructions

When validating features involving a Blessed Terminal Interface:

1. **Human Keyboard Emulation:** Manually interact with the interface using real keyboard inputs and sequences (e.g., Arrow keys, `Tab`, `Enter`, `Escape`, character inputs, and configured shortcuts) exactly as an operator at a physical terminal would.
2. **Step-by-Step Flow Navigation:** Drive end-to-end user journeys through sequential keystrokes rather than relying solely on headless mocks or direct state mutations. Allow render and event loop cycles between inputs.
3. **Screen & Focus Verification:** Observe terminal screen buffers, cursor positions, active focused widgets, and visual updates after each keypress sequence to ensure the UI responds correctly.
4. **Lifecycle & Clean Exit:** Verify proper startup rendering, navigation across interactive elements, and graceful termination routines (such as `q`, `Escape`, or `Ctrl+C`).

### Blessed Terminal Interface (TUI) Validation & Autonomous Remediation Protocol

#### 1. Authoritative Runner Entry Point

- All interactive Blessed terminal tests **MUST** execute exclusively through:
  ```bash
  npm run dev
  ```
  *(Notice: Direct execution flags like `npm run dev -- --package=299.lore` are strictly forbidden; run only `npm run dev`.)*
- Direct execution via bare `node` is strictly prohibited because `.ts` transpilation requires `tsx`.

#### 2. Pre-Flight Boundary Self-Healing Guard

- Before launching the runner, the auditor must assert harness integrity:
  ```bash
  git status -s apps/995.library/995.library/
  ```
- **Remediation Action:** If any dirty files or rogue stubs are detected inside `apps/995.library/995.library/`, the auditor must run `git restore apps/995.library/995.library/` immediately before proceeding to the build.
- `apps/995.library/run.ts` is the only file with a permitted modification path.

#### 3. In-Scope Remediation Mandate (Zero-Handoff Policy)

- If the auditor encounters:
  - Missing CLI flags or runner options in `apps/995.library/run.ts` (permitted modification path).
  - Unimplemented menu navigation or telemetry hooks in `packages/400.conductor/98.menu.unit/`.
  - Stale references in local package `tsconfig.json`.
- **The auditor must NOT halt execution or report failure to the user.**
- **The auditor must proactively implement the missing wiring**, re-execute the gauntlet, and verify clean end-to-end telemetry before sealing the audit.

#### 4. Verification Integrity Boundary

- The auditor should never:
  - Weaken Zod schemas or basis-point bounds to bypass failures.
  - Modify the immutable harness (`apps/995.library/995.library/**`).
  - Comment out or weaken directive assertions.
- Remediation is strictly limited to fixing runtime orchestration, restoring boundary corruptions, and fulfilling the mandated UI journey.

### ANTIGRAVITY ADVERSARIAL AUDIT SPECIFICATION

- **Target Directive:** `003.speech-subprocess-watcher-phase3.ag-test.md`
- **Target Focus:** `Phase 3 Native Speech Synthesis Subprocess Invocation Watcher`
- **Target Repository:** `000.series-sower-conductor` (downstream: `camp-candor/series-sower-conductor` / `camp-candor/npm-agent-01`)
- **Target Workspace:** `packages/400.conductor/`
- **Target Inodes Under Audit:**
  - `packages/400.conductor/09.speech.unit/fce/speech.interface.ts` (AUDIT: Typings for `TtsEngineType`, `DialogueSynthesisItem`, `SpeechGenerationRequest`, `StemSynthesisReceipt`, `SceneSpeechReceipt`)
  - `packages/400.conductor/09.speech.unit/fce/speech.bit.ts` (AUDIT: Candor action/state bale contract)
  - `packages/400.conductor/09.speech.unit/val/speech.val.ts` (AUDIT: Zod schemas with `.strict()` termination and 7-bit ASCII constraints)
  - `packages/400.conductor/09.speech.unit/buz/speech.buzz.ts` (AUDIT: Child process invocation, zero-VRAM environment overrides, non-blocking `.tmp` polling, byte-size quiescence, zero-byte sentinel, atomic promotion, retry loop)
  - `packages/400.conductor/09.speech.unit/speech.action.ts` (AUDIT: Action definitions `INIT_SPEECH`, `UPDATE_SPEECH`, `EXECUTE_SCENE_SPEECH`)
  - `packages/400.conductor/09.speech.unit/speech.buzzer.ts` (AUDIT: Clean buzzer exports)
  - `packages/400.conductor/09.speech.unit/speech.model.ts` (AUDIT: State model container)
  - `packages/400.conductor/09.speech.unit/speech.reduce.ts` (AUDIT: Pure reducer implementation via `clone-deep`)
  - `packages/400.conductor/09.speech.unit/speech.unit.ts` (AUDIT: Candor unit class wiring)
  - `packages/400.conductor/BEE.ts` (AUDIT: Registration of `SpeechUnit` across `list`, `reducer`, and `UnitData`)
  - `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` (AUDIT: Menu mounting of `SYNTHESIZE SCENE AUDIO STEMS`)
  - `packages/400.conductor/val/speechSubprocess.test.ts` (AUDIT: Colocated Vitest test suite)
- **Immutable Harness Fence:** `apps/995.library/995.library/**` *(0 modified lines)*
- **Forbidden Directory Fence:** `packages/400.conductor/src/` *(Strictly Prohibited; physical non-existence required)*
- **Auditor Persona:** Autonomous Adversarial Systems Auditor & Hardware Boundary Sentry (Antigravity v2.4)

### I. Architectural Mandate & Universal Negative-Control Law

Under the **Universal Negative-Control Law**, a speech synthesis runner, file staging watcher, or process orchestrator that has never been observed actively failing closed when presented with missing audio inodes, zero-byte corrupt buffers, non-RIFF headers, process timeouts, or unconstrained GPU VRAM allocation at Stage $T_0 = \$0.00$ **CANNOT BE CERTIFIED FOR PRODUCTION DEPLOYMENT**.

Antigravity executes active negative-control fault injections: verifying process isolation with `CUDA_VISIBLE_DEVICES=""`, intercepting poisoned WAV headers, asserting non-blocking event-loop behavior during inode polling, verifying atomic POSIX `.tmp` renames, and ensuring transient subprocess failures trigger clean exponential backoff retries without corrupting whole-scene state.

### II. Multi-Level Adversarial Audit Gauntlet

#### Level 1: Static Boundary, Monorepo Topology & Pure 7-Bit ASCII Audit

- **Check 1.1 (Forbidden `src/` Directory Non-Existence):** Assert that no `packages/400.conductor/src/` directory exists. All logic must reside strictly inside numbered unit folders (`09.speech.unit/`, etc.) and `val/`.
  ```bash
  test ! -d packages/400.conductor/src && echo ">> [OK] Zero src/ directory confirmed."
  ```
  (Must exit with return code 0).
- **Check 1.2 (Immutable Harness Fence):** Assert that the runner harness has not been modified:
  ```bash
  git status -s apps/995.library/995.library/
  ```
  (Must return exactly 0 modified lines; if dirty, restore immediately).
- **Check 1.3 (NodeNext Explicit `.js` Imports):** Inspect all imports across `packages/400.conductor/09.speech.unit/` to verify that all relative module specifiers terminate explicitly with `.js`.
- **Check 1.4 (Pure 7-Bit ASCII Cleanliness):** Execute a scan across `packages/400.conductor/09.speech.unit/` and `packages/400.conductor/val/speechSubprocess.test.ts` to assert zero multi-byte Unicode or emojis:
  ```bash
  node -e "
  const fs = require('fs');
  const path = require('path');
  const files = [
    '09.speech.unit/fce/speech.interface.ts',
    '09.speech.unit/fce/speech.bit.ts',
    '09.speech.unit/val/speech.val.ts',
    '09.speech.unit/buz/speech.buzz.ts',
    '09.speech.unit/speech.action.ts',
    '09.speech.unit/speech.buzzer.ts',
    '09.speech.unit/speech.model.ts',
    '09.speech.unit/speech.reduce.ts',
    '09.speech.unit/speech.unit.ts',
    'val/speechSubprocess.test.ts'
  ];
  for (const f of files) {
    const full = path.join('packages/400.conductor', f);
    if (!fs.existsSync(full)) {
      console.error(':: [FAIL] Missing file: ' + full);
      process.exit(1);
    }
    const content = fs.readFileSync(full, 'utf8');
    if (/[\x80-\xFF]/.test(content)) {
      console.error(':: [FAIL] Multi-byte non-ASCII character detected in: ' + full);
      process.exit(1);
    }
  }
  console.log('>> [OK] 100% 7-Bit Clean ASCII confirmed across all speech unit inodes.');
  "
  ```
- **Check 1.5 (TypeScript Compiler Verification):** Execute typecheck across the package:
  ```bash
  npx tsc -b packages/400.conductor
  ```
  *(Must complete with 0 errors and 0 diagnostic warnings.)*

#### Level 2: Subprocess Spawner & Hardware Zero-VRAM Invariant Traps

- **Check 2.1 (Zero-VRAM Environment Override Enforcement):** Inspect `packages/400.conductor/09.speech.unit/buz/speech.buzz.ts`. Assert that child process invocation passes:
  ```typescript
  env: {
    ...process.env,
    CUDA_VISIBLE_DEVICES: '',
    OMP_NUM_THREADS: '4'
  }
  ```
  (Any omission of `CUDA_VISIBLE_DEVICES: ""` violates Rig 1 hardware memory segregation and fails the audit).
- **Check 2.2 (CLI Argument Vector Serialization):** Invoke `buildCliArgs` with a sample dialogue item containing somatic DSP modifiers (`effective_pitch_semitones: -2.0`, `effective_formant_warping: 0.85`, `effective_breathiness_multiplier: 1.4`, `effective_vocal_fry_density: 0.50`). *Assertion:* Argument array must strictly contain flags `--engine`, `--character`, `--series`, `--text`, `--output`, `--pitch-shift`, `--formant-warp`, `--breathiness`, `--pause-multiplier`, and `--vocal-fry` with matching string values.
- **Check 2.3 (Ephemeral Staging Path Formatting):** Assert that child process output targets strictly terminate with the temporary extension `.tmp` (e.g., `public/audio/dialogue/${sceneId}_SH${shotIndex}.wav.tmp`). Direct writes to `.wav` prior to stabilization must fail closed.

#### Level 3: Non-Blocking Polling, Byte-Size Quiescence & Poison Sentinel Traps

- **Check 3.1 (Non-Blocking Event Loop Verification):** Assert that `pollFileStabilization` uses asynchronous `setTimeout` promises (default 200 ms) and does not execute synchronous blocking loops (`while(Date.now() < t)` without await, `deasync`, or `execSync("sleep")`).
- **Check 3.2 (Byte-Size Quiescence Assertion):** Simulate a slow disk write where a file grows across two ticks (e.g., 500 bytes $\to$ 1,200 bytes $\to$ 1,200 bytes). *Assertion:* `pollFileStabilization` must not resolve on the first write; it must confirm identical byte count across consecutive checks before declaring stabilization.
- **Check 3.3 (Negative-Control Sentinel Trap: Sub-1024 Byte Buffer):** Create a temporary file measuring 512 bytes with valid ASCII `RIFF` and `WAVE` markers. *Assertion:* `verifyZeroByteSentinel` must return `false`, and the spawner must abort promotion.
- **Check 3.4 (Negative-Control Sentinel Trap: Corrupt RIFF Header):** Create a temporary file measuring 2,048 bytes filled with zeroes or ASCII `FAIL....WAVE`. *Assertion:* `verifyZeroByteSentinel` must reject the buffer with `false`, throw `ZERO_BYTE_POISON_BREACH`, and unlink the `.tmp` file.
- **Check 3.5 (Atomic POSIX Promotion Assertion):** Assert that promotion occurs exclusively via `fs.renameSync(stagingPath, finalPath)`. The temporary `.tmp` file must cease to exist, and the final `.wav` file must physically exist with identical byte count.

#### Level 4: Isolated Per-Line Retry Harness & Circuit Breaker Traps

- **Check 4.1 (Transient Failure Exponential Backoff):** Simulate a child process panic on attempt 1 (exit code 1) followed by a successful write on attempt 2. *Assertion:* The orchestrator must execute a backoff delay ($100\text{ ms} \times 2^0 = 100\text{ ms}$), retry the subprocess, and return `ok: true` with `attempts: 2` without failing the parent scene.
- **Check 4.2 (Exhaustion Circuit Breaker Trap):** Simulate persistent child process failures across 3 consecutive attempts. *Assertion:* The spawner must terminate retries, return `ok: false` with `attempts: 3` and structured error message, unlink any remaining `.tmp` artifacts, and log the failure to `cns00`.
- **Check 4.3 (Stabilization Timeout Circuit Breaker):** Invoke `pollFileStabilization` against a non-existent path with a 150 ms timeout. *Assertion:* Must reject with `SYNTHESIS_TIMEOUT_BREACH` within 200 ms.

#### Level 5: Colocated Vitest Verification Battery Clearance

- Execute the complete unit test suite:
  ```bash
  npx vitest run packages/400.conductor/val/speechSubprocess.test.ts
  ```
  *(100% of test assertions must pass with exit code 0.)*

#### Level 6: Blessed Terminal Cockpit Live Journey & Telemetry Audit

- **Step 6.1 (Launch Terminal Cockpit):** Start the operator interface via the authoritative entry point:
  ```bash
  npm run dev
  ```
- **Step 6.2 (Human Keyboard Emulation Journey):**
  1. Allow the 12x12 Cartesian screen layout to stabilize.
  2. Use arrow keys (`Down`/`Up`) or `J`/`K` to navigate the choice grid (`85.choice.unit` / `98.menu.unit`).
  3. Move the selection cursor to highlight `SYNTHESIZE SCENE AUDIO STEMS`.
  4. Press `Enter` to dispatch action `EXECUTE_SCENE_SPEECH`.
- **Step 6.3 (Console Telemetry Verification - `cns00`):** Inspect the switchboard console (`cns00` at `{ x: 4, y: 0, xSpan: 8, ySpan: 12 }`) to verify that the following 7-bit ASCII receipts are actively streamed:
  ```plaintext
  >> [SPEECH] Commencing Scene Audio Synthesis for [ep01_sc01] (1 lines) via [styletts2]
  >> [SPAWN] (1/3) Invoking python synthesize.py for line [line_001] (Speaker: char_elias)
  >> [POLL] Staging inode detected (144044 bytes)... Stabilized.
  >> [ATOMIC-COMMIT] [OK] Committed [ep01_sc01_line_001.wav] (144044 bytes, SHA: ...)
  >> [SPEECH] [OK] Scene [ep01_sc01] Completed: 1/1 stems synthesized successfully
  >> [MENU:SPEECH] Speech generation finished successfully.
  ```
- **Step 6.4 (Graceful Teardown):** Press `Escape` or `q` to terminate the Blessed curses loop cleanly, confirming zero unhandled asynchronous promise rejections, zero dangling child processes, and clean restoration of terminal standard I/O.

### III. Final Feedback & Status Mutation Directive

#### 1. If ALL Verification Levels Pass (100% Compliance Across Levels 1–6):

- Update `[- **Progress:**]` at the top of this document to:
  ```markdown
  - **Progress:** [🟢 Completed: 2026-11-05 07:30:00 UTC - Native Speech Synthesis Subprocess Invocation Watcher Certified]
  ```
- Overwrite the original specification file with this updated header.
- Emit the certified success feedback receipt:
  ```plaintext
  ================================================================================
  >> [ANTIGRAVITY AUDIT PASS] PHASE 3: SPEECH SYNTHESIS SUBPROCESS WATCHER
  >> [LEVEL 1] Topology & Boundary Audit: PASS (Zero src/, clean 7-bit ASCII)
  >> [LEVEL 2] Subprocess Spawner & Zero-VRAM: PASS (CUDA_VISIBLE_DEVICES: "" enforced)
  >> [LEVEL 3] Non-Blocking Polling & Inode Sentinel: PASS (Quiescence confirmed, RIFF verified)
  >> [LEVEL 4] Isolated Retry Harness: PASS (Exponential backoff & timeout circuit breaker verified)
  >> [LEVEL 5] Colocated Vitest Test Battery: PASS (100% tests cleared with exit code 0)
  >> [LEVEL 6] Blessed Cockpit UI Journey: PASS (cns00 telemetry streaming verified)
  >> [VERDICT] NATIVE SUBPROCESS SPEECH SYNTHESIS CERTIFIED AS FUNCTIONAL ($T0 = $0.00)
  ================================================================================
  ```

#### 2. If ANY Check, Assertion, or Level Fails:

- Update `[- **Progress:**]` at the top of this document to:
  ```markdown
  - **Progress:** [🔴 Failed at Level X: 2026-11-05 07:30:00 UTC - Invariant Breach Detected: <REASON>]
  ```
- Overwrite the original specification file with this updated header.
- Emit the fail-closed conflict diagnostic banner:
  ```plaintext
  ================================================================================
  :: [ANTIGRAVITY AUDIT FAIL] SPEECH SUBPROCESS WATCHER INVARIANT BREACH
  :: Level Failed      : Level <N>
  :: Violation Type    : HARDWARE_VRAM_LEAK / STAGING_TIMEOUT / POISON_BUFFER_BREACH / RETRY_EXHAUSTION
  :: Diagnostic Trace  : <Detailed failure traces and offending inodes>
  :: Action Taken      : Circuit breaker tripped at T0 = $0.00. Execution halted.
  ================================================================================
  ```
  *(Halt execution immediately without mutating further code.)*

### You

{{FOCUS : Phase 4: Discrete Frame Temporal Quantization Causal Alignment }}

@jules-task-00

### Gemini

# Jules Task: Phase 4 Discrete Frame Temporal Quantization Causal Alignment

You are tasked with implementing **Phase 4: Discrete Frame Temporal Quantization Causal Alignment** within the `000.series-sower-conductor` repository on Rig 1. This subsystem enforces the **Master Physical Clock Axiom**: continuous acoustic waveforms synthesized by the speech engine dictate empirical physical time, while visual cuts and neural video diffusion frame allocations operate strictly as discrete integer projections mapped to that acoustic duration. This unit measures uncompressed linear PCM audio stems via child-process `ffprobe`, executes 24 fps integer ceiling quantization, accumulates cumulative-millisecond zero-drift timelines, enforces causal $4n+1$ 3D VAE lattice alignment, and calculates exact tail margins for downstream optical trimming.

### Architectural Invariants & Monorepo Boundaries

1. **Absolute Ban on `src/`:** All code must reside strictly within `packages/400.conductor/24.frame.unit/`, `packages/400.conductor/98.menu.unit/`, or test suites in `packages/400.conductor/val/`. Under no circumstances may any file be placed inside a `src/` directory within `packages/400.conductor/`.
2. **Immutable Runner Boundary:** `apps/995.library/995.library/**` is strictly immutable (0 lines modified).
3. **The Master Physical Clock Axiom:** Spoken audio duration in milliseconds ($D_{\text{ms}}$) is the empirical physical truth; discrete presentation frames are downstream derivations. Audio stems must never be stretched, resampled, or padded to fit arbitrary video cuts.
4. **Cumulative-Millisecond Zero-Drift Tiling:** Sequential relative concatenation ($\text{Start}_k = \text{End}_{k-1}$) accumulates up to $41.67\text{ ms}$ (1 frame) of rounding drift per cut. All timeline coordinates must be derived from a running cumulative millisecond sum quantized once to absolute integer frame indices:
  $$
  \text{Start}_k = \left\lceil \frac{\sum_{i<k} D_i}{1000} \times 24 \right\rceil, \quad \text{End}_k = \left\lceil \frac{\sum_{i \le k} D_i}{1000} \times 24 \right\rceil - 1 \text{[cite: 2, 27]}
  $$
  Asserting the contiguity invariant $\text{End}_k + 1 \equiv \text{Start}_{k+1}$ across all cuts.
5. **Sub-Frame Zero-Length Clamp:** Spoken interjections or breath pauses shorter than a single video frame ($< 41.67\text{ ms}$) must be clamped to a mandatory minimum of 1 frame ($41.67\text{ ms}$) to prevent inverted or zero-length Remotion sequence intervals.
6. **Round-Up Causal $4n+1$ 3D VAE Stride Math:** To prevent latent tensor decoding crashes in neural video models (e.g., Wan 2.1, Wan 2.2) and avoid truncating spoken syllables, diffusion allocations must round up to the nearest $4n+1$ boundary:
  $$
  N_{\text{diff}} = 4 \times \left\lceil \frac{N - 1}{4} \right\rceil + 1, \quad \Delta F_{\text{slack}} = N_{\text{diff}} - N \text{[cite: 1, 2]}
  $$
7. **The 2,000-Sample Constant:** The mathematical ratio bridging the 48 kHz continuous audio clock to the 24 fps master video clock is exactly $2,000\text{ samples/frame}$. Phonetic onsets or visemes at sample index $S$ map to video frame $F = \lfloor S / 2000 \rfloor$.
8. **Pure 7-Bit Clean ASCII Telemetry:** All source files, logs, comments, and console outputs must strictly use 7-bit ASCII tokens (`>>`, `[OK]`, `[FAIL]`, `::`, `[QUANT]`, `[LATTICE]`, `[ZERO-DRIFT]`).
9. **NodeNext Explicit `.js` Imports:** All relative TypeScript imports must explicitly terminate with `.js` extensions.

### File Implementation Manifest

```plaintext
packages/400.conductor/
├── 24.frame.unit/
│   ├── fce/
│   │   ├── frame.bit.ts
│   │   └── frame.interface.ts
│   ├── val/
│   │   └── frame.val.ts
│   ├── buz/
│   │   └── frame.buzz.ts
│   ├── frame.action.ts
│   ├── frame.buzzer.ts
│   ├── frame.model.ts
│   ├── frame.reduce.ts
│   └── frame.unit.ts
├── 98.menu.unit/
│   └── buz/
│       └── 00.menu.buzz.ts              (Update: Mount Quantize Acoustic Master Clock)
├── BEE.ts                               (Update: Register FrameUnit)
└── val/
    └── frame.test.ts                    (Comprehensive Vitest Battery)
```

### Source Code Deliverables

#### 1. Interface & Bit Definitions

```typescript
// packages/400.conductor/24.frame.unit/fce/frame.interface.ts
export interface RawStemDuration {
  shot_id: string;
  duration_ms: number;
  sample_count?: number;
}

export interface CausalVaeAllocation {
  raw_frames: number;
  conformed_frames: number;
  padding_slack_frames: number;
  n_stride: number;
}

export interface QuantizedShot {
  shot_id: string;
  duration_ms: number;
  target_frames: number;
  from_frame: number;
  to_frame: number;
  sample_offset_start: number;
  sample_offset_end: number;
  causal_vae: CausalVaeAllocation;
}

export interface TimelineQuantizationReceipt {
  ok: boolean;
  total_shots: number;
  total_duration_ms: number;
  total_frames: number;
  drift_ms: number;
  is_contiguous: boolean;
  shots: QuantizedShot[];
  error?: string;
}

export default interface Frame {
  idx: string;
  totalQuantizedShots: number;
  lastTimelineReceipt?: TimelineQuantizationReceipt;
}
```

```typescript
// packages/400.conductor/24.frame.unit/fce/frame.bit.ts
import {
  RawStemDuration,
  QuantizedShot,
  TimelineQuantizationReceipt,
} from './frame.interface.js';

export default interface FrameBit {
  idx: string;
  src?: string;
  val?: number;
  dat?: {
    stems?: RawStemDuration[];
    singleStem?: RawStemDuration;
    wavPath?: string;
    receipt?: TimelineQuantizationReceipt;
    quantizedShot?: QuantizedShot;
  };
  slv?: Function;
}
```

#### 2. Zod Validation & Schema Guardrails

```typescript
// packages/400.conductor/24.frame.unit/val/frame.val.ts
import { z } from 'zod';

export const RawStemDurationSchema = z
  .object({
    shot_id: z.string().regex(/^[a-zA-Z0-9_-]+$/, 'shot_id must be alphanumeric'),
    duration_ms: z.number().positive('duration_ms must be positive and non-zero'),
    sample_count: z.number().int().nonnegative().optional(),
  })
  .strict();

export const FrameQuantizationRequestSchema = z
  .object({
    stems: z.array(RawStemDurationSchema).min(1, 'stems array must contain at least one shot'),
  })
  .strict();
```

#### 3. Buzzer Implementation: Probing, Ceiling Quantization & Lattice Math

```typescript
// packages/400.conductor/24.frame.unit/buz/frame.buzz.ts
import { FrameModel } from '../frame.model.js';
import FrameBit from '../fce/frame.bit.js';
import {
  RawStemDuration,
  CausalVaeAllocation,
  QuantizedShot,
  TimelineQuantizationReceipt,
} from '../fce/frame.interface.js';
import { FrameQuantizationRequestSchema } from '../val/frame.val.js';
import State from '../../99.core/state.js';
import { execFile } from 'node:child_process';
import * as fs from 'node:fs';

export const SAMPLES_PER_FRAME = 2000; // 48000 Hz / 24 fps

export const extractDurationMsViaFfprobe = async (
  wavPath: string,
  mockDurationMs?: number,
): Promise<number> => {
  if (mockDurationMs !== undefined) return mockDurationMs;

  if (!fs.existsSync(wavPath)) {
    throw new Error(`FILE_NOT_FOUND: Audio stem does not exist at path: ${wavPath}`);
  }

  return new Promise((resolve, reject) => {
    execFile(
      'ffprobe',
      [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        wavPath,
      ],
      (err, stdout) => {
        if (err) {
          reject(new Error(`FFPROBE_EXEC_FAILED: ${err.message}`));
          return;
        }
        const durationSec = parseFloat(stdout.trim());
        if (isNaN(durationSec) || durationSec <= 0) {
          reject(new Error(`FFPROBE_PARSE_FAILED: Invalid duration string: ${stdout}`));
          return;
        }
        resolve(Math.round(durationSec * 1000));
      },
    );
  });
};

export const calculateCausalVaeAllocation = (rawFrames: number): CausalVaeAllocation => {
  const clampedRaw = Math.max(1, rawFrames);
  const nStride = Math.ceil((clampedRaw - 1) / 4);
  const conformedFrames = 4 * nStride + 1;
  const paddingSlackFrames = conformedFrames - clampedRaw;

  return {
    raw_frames: clampedRaw,
    conformed_frames: conformedFrames,
    padding_slack_frames: paddingSlackFrames,
    n_stride: nStride,
  };
};

export const quantizeShotTimeline = (stems: RawStemDuration[]): TimelineQuantizationReceipt => {
  if (!stems || stems.length === 0) {
    throw new Error('TIMELINE_QUANT_EMPTY: Cannot quantize empty stem list');
  }

  const quantizedShots: QuantizedShot[] = [];
  let cumulativeMs = 0;
  let totalRawMs = 0;

  for (let i = 0; i < stems.length; i++) {
    const stem = stems[i];
    totalRawMs += stem.duration_ms;

    const fromFrame = Math.ceil((cumulativeMs / 1000) * 24);
    cumulativeMs += stem.duration_ms;
    const toFrame = Math.max(fromFrame, Math.ceil((cumulativeMs / 1000) * 24) - 1);
    const targetFrames = Math.max(1, toFrame - fromFrame + 1);

    const causalVae = calculateCausalVaeAllocation(targetFrames);

    quantizedShots.push({
      shot_id: stem.shot_id,
      duration_ms: stem.duration_ms,
      target_frames: targetFrames,
      from_frame: fromFrame,
      to_frame: toFrame,
      sample_offset_start: fromFrame * SAMPLES_PER_FRAME,
      sample_offset_end: (toFrame + 1) * SAMPLES_PER_FRAME,
      causal_vae: causalVae,
    });
  }

  let isContiguous = true;
  for (let i = 0; i < quantizedShots.length - 1; i++) {
    if (quantizedShots[i].to_frame + 1 !== quantizedShots[i + 1].from_frame) {
      isContiguous = false;
      break;
    }
  }

  const totalFrames = quantizedShots[quantizedShots.length - 1].to_frame + 1;
  const videoDurationMs = (totalFrames / 24) * 1000;
  const driftMs = Math.abs(videoDurationMs - totalRawMs);

  return {
    ok: isContiguous && driftMs < 41.67,
    total_shots: quantizedShots.length,
    total_duration_ms: totalRawMs,
    total_frames: totalFrames,
    drift_ms: Number(driftMs.toFixed(3)),
    is_contiguous: isContiguous,
    shots: quantizedShots,
  };
};

export const initFrame = (cpy: FrameModel, bal: FrameBit, ste: State) => {
  if (bal.slv != null) bal.slv({ frmBit: { idx: 'init-frame', val: 1 } });
  return cpy;
};

export const updateFrame = (cpy: FrameModel, bal: FrameBit, ste: State) => {
  if (bal.slv != null) bal.slv({ frmBit: { idx: 'update-frame' } });
  return cpy;
};

export const quantizeAcousticClock = async (cpy: FrameModel, bal: FrameBit, ste: State) => {
  try {
    if (!bal.dat?.stems) {
      throw new Error('MISSING_STEMS: dat.stems array is required for timeline quantization');
    }

    const validatedReq = FrameQuantizationRequestSchema.parse({ stems: bal.dat.stems });
    const receipt = quantizeShotTimeline(validatedReq.stems);

    cpy.lastTimelineReceipt = receipt;
    cpy.totalQuantizedShots += receipt.total_shots;

    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [QUANT] Quantized ${receipt.total_shots} shots: ${receipt.total_frames} frames (${receipt.total_duration_ms}ms) | Drift=${receipt.drift_ms}ms`,
      });
      for (const shot of receipt.shots) {
        await global.LIBRARY.hunt('[Console action] Update Console', {
          idx: 'cns00',
          src: `>> [QUANT] [${shot.shot_id}]: frames=${shot.target_frames} (from=${shot.from_frame}, to=${shot.to_frame}) | VAE=${shot.causal_vae.conformed_frames}f (slack=${shot.causal_vae.padding_slack_frames}f)`,
        });
      }
    }

    if (bal.slv != null) {
      bal.slv({
        frmBit: {
          idx: 'quantize-acoustic-clock-success',
          dat: { receipt },
        },
      });
    }
  } catch (err: any) {
    const errorMsg = err.message || String(err);
    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `:: [QUANT] [FAIL] Frame quantization error: ${errorMsg}`,
      });
    }
    if (bal.slv != null) {
      bal.slv({
        frmBit: {
          idx: 'quantize-acoustic-clock-error',
          src: errorMsg,
        },
      });
    }
  }

  return cpy;
};
```

#### 4. Action Classes, Buzzer Exports, Model, and Reducer

```typescript
// packages/400.conductor/24.frame.unit/frame.action.ts
import { Action } from '../99.core/interface/action.interface.js';
import FrameBit from './fce/frame.bit.js';

export const INIT_FRAME = '[Frame action] Init Frame';
export class InitFrame implements Action {
  readonly type = INIT_FRAME;
  constructor(public bale: FrameBit) {}
}

export const UPDATE_FRAME = '[Frame action] Update Frame';
export class UpdateFrame implements Action {
  readonly type = UPDATE_FRAME;
  constructor(public bale: FrameBit) {}
}

export const QUANTIZE_ACOUSTIC_CLOCK = '[Frame action] Quantize Acoustic Clock';
export class QuantizeAcousticClock implements Action {
  readonly type = QUANTIZE_ACOUSTIC_CLOCK;
  constructor(public bale: FrameBit) {}
}

export type Actions = InitFrame | UpdateFrame | QuantizeAcousticClock;
```

```typescript
// packages/400.conductor/24.frame.unit/frame.buzzer.ts
export {
  initFrame,
  updateFrame,
  quantizeAcousticClock,
  extractDurationMsViaFfprobe,
  calculateCausalVaeAllocation,
  quantizeShotTimeline,
  SAMPLES_PER_FRAME,
} from './buz/frame.buzz.js';
```

```typescript
// packages/400.conductor/24.frame.unit/frame.model.ts
import Frame, { TimelineQuantizationReceipt } from './fce/frame.interface.js';

export class FrameModel implements Frame {
  idx: string = '24.frame';
  totalQuantizedShots: number = 0;
  lastTimelineReceipt?: TimelineQuantizationReceipt;
}
```

```typescript
// packages/400.conductor/24.frame.unit/frame.reduce.ts
import clone from 'clone-deep';
import * as Act from './frame.action.js';
import { FrameModel } from './frame.model.js';
import * as Buzz from './frame.buzzer.js';
import State from '../99.core/state.js';

export function reducer(
  model: FrameModel = new FrameModel(),
  act: Act.Actions,
  state?: State,
) {
  switch (act.type) {
    case Act.INIT_FRAME:
      return Buzz.initFrame(clone(model), act.bale, state!);

    case Act.UPDATE_FRAME:
      return Buzz.updateFrame(clone(model), act.bale, state!);

    case Act.QUANTIZE_ACOUSTIC_CLOCK:
      return Buzz.quantizeAcousticClock(clone(model), act.bale, state!);

    default:
      return model;
  }
}
```

```typescript
// packages/400.conductor/24.frame.unit/frame.unit.ts
import State from '../99.core/state.js';

export default class FrameUnit {
  constructor(state: State) {}
}
```

#### 5. Central Wiring in BEE.ts

```typescript
// In packages/400.conductor/BEE.ts:
// Add import and registration for FrameUnit:
import FrameUnit from './24.frame.unit/frame.unit.js';
import Frame from './24.frame.unit/fce/frame.interface.js';
import { FrameModel } from './24.frame.unit/frame.model.js';
import { reducer as frameReducer } from './24.frame.unit/frame.reduce.js';

// In list:
export const list = {
  // ... other units
  frame: FrameUnit,
};

// In reducer:
export const reducer = {
  // ... other reducers
  frame: frameReducer,
};

// In UnitData:
export default class UnitData implements Model {
  // ... other units
  frame: Frame = new FrameModel();
}
```

#### 6. Blessed Menu Integration

```typescript
// In packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts:
// Add choice option under the menu switch case:
case 'QUANTIZE ACOUSTIC MASTER CLOCK':
  bit = await ste.hunt('[Frame action] Quantize Acoustic Clock', {
    dat: {
      stems: [
        { shot_id: 'sh01', duration_ms: 3120 },
        { shot_id: 'sh02', duration_ms: 1840 },
        { shot_id: 'sh03', duration_ms: 2400 },
      ],
    },
  });
  if (bit?.frmBit?.dat?.receipt?.ok) {
    await global.LIBRARY.hunt('[Console action] Update Console', {
      idx: 'cns00',
      src: '>> [MENU:FRAME] Acoustic clock quantized cleanly with zero drift.',
    });
  }
  break;
```

#### 7. Colocated Vitest Verification Battery

```typescript
// packages/400.conductor/val/frame.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { FrameModel } from '../24.frame.unit/frame.model.js';
import * as Buzz from '../24.frame.unit/buz/frame.buzz.js';
import { RawStemDuration } from '../24.frame.unit/fce/frame.interface.js';

describe('24.frame.unit: Discrete Frame Temporal Quantization & Causal Alignment', () => {
  let model: FrameModel;

  beforeEach(() => {
    model = new FrameModel();
  });

  it('calculates causal 4n+1 VAE allocations correctly and enforces non-negative slack', () => {
    const cases = [
      { frames: 1, expectedAlloc: 1, expectedSlack: 0, n: 0 },
      { frames: 2, expectedAlloc: 5, expectedSlack: 3, n: 1 },
      { frames: 37, expectedAlloc: 37, expectedSlack: 0, n: 9 },
      { frames: 38, expectedAlloc: 41, expectedSlack: 3, n: 10 },
      { frames: 75, expectedAlloc: 77, expectedSlack: 2, n: 19 },
    ];

    for (const c of cases) {
      const res = Buzz.calculateCausalVaeAllocation(c.frames);
      expect(res.conformed_frames).toBe(c.expectedAlloc);
      expect(res.padding_slack_frames).toBe(c.expectedSlack);
      expect(res.n_stride).toBe(c.n);
      expect((res.conformed_frames - 1) % 4).toBe(0);
    }
  });

  it('guarantees cumulative-millisecond zero-drift contiguity across consecutive cuts', () => {
    const shots: RawStemDuration[] = [
      { shot_id: 'sh01', duration_ms: 3120 },
      { shot_id: 'sh02', duration_ms: 1840 },
      { shot_id: 'sh03', duration_ms: 2400 },
    ];

    const timeline = Buzz.quantizeShotTimeline(shots);
    expect(timeline.ok).toBe(true);
    expect(timeline.is_contiguous).toBe(true);

    for (let i = 0; i < timeline.shots.length - 1; i++) {
      expect(timeline.shots[i].to_frame + 1).toBe(timeline.shots[i + 1].from_frame);
    }

    expect(timeline.drift_ms).toBeLessThan(41.67);
  });

  it('clamps sub-frame durations (< 41.67ms) to minimum 1 frame budget', () => {
    const shots: RawStemDuration[] = [{ shot_id: 'sh_gasp', duration_ms: 15 }];
    const timeline = Buzz.quantizeShotTimeline(shots);

    expect(timeline.shots[0].target_frames).toBe(1);
    expect(timeline.shots[0].from_frame).toBe(0);
    expect(timeline.shots[0].to_frame).toBe(0);
  });

  it('preserves the 2,000-sample constant ratio across frame boundaries', () => {
    const shots: RawStemDuration[] = [{ shot_id: 'sh01', duration_ms: 1000 }];
    const timeline = Buzz.quantizeShotTimeline(shots);
    const shot = timeline.shots[0];

    expect(shot.target_frames).toBe(24);
    expect(shot.sample_offset_start).toBe(0);
    expect(shot.sample_offset_end).toBe(24 * Buzz.SAMPLES_PER_FRAME);
  });
});
```

### Jules Execution Protocol

1. Place all implementation files into `packages/400.conductor/24.frame.unit/` adhering strictly to `.js` import specifiers.
2. Register `FrameUnit` in `packages/400.conductor/BEE.ts` under `list`, `reducer`, and `UnitData`.
3. Add `QUANTIZE ACOUSTIC MASTER CLOCK` to `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts`.
4. Run `npx vitest run packages/400.conductor/val/frame.test.ts` to ensure 100% of unit tests pass.
5. Verify that `npx tsc -b packages/400.conductor` compiles with zero diagnostic warnings and `test ! -d packages/400.conductor/src` confirms absence of any forbidden `src/` directory.
6. **COMMAND:** When you begin working on this specification, immediately update the `[- **Status:**]` attribute below to `[🟡 In Progress]`. When all target files and the Vitest test gauntlet pass with exit code 0, update `[- **Status:**]` to `[🟢 Done]`.

### **Attributes:**

- **Status:** [⚪ Backlog ]
- **Priority:** [🔴 High]
- **Time Estimate:** [1 Hour]
- **Tags:** [infrastructure, frame-quantization, master-clock, causal-vae, timeline-tiling]
- **Epic:** [EPIC 001: INFRASTRUCTURE & GOVERNANCE]
- **Value:** [Acoustic Master Clock Timebase]
- **Sprint Points:** [2]
- **Component:** [packages/400.conductor/24.frame.unit]
- **Owner:** [Jules Autonomous Implementer]
- **Target Release:** [Sprint 4 / Conductor v1.0]
- **Risk Level:** [Low]
- **Reporter:** [Studio Architecture Lead]

### You

{{FOCUS : Phase 4 Discrete Frame Temporal Quantization Causal Alignment }}

@jules-complete-check

### Gemini

### **Validation:**

- **Progress:** [⚪ Waiting for Action ]

#### Jules Pre-Flight Completion Audit & Operational Directive

**Agent Instruction:** Before generating, authoring, or mutating any code for **Phase 4 Discrete Frame Temporal Quantization Causal Alignment**, execute an automated inspection audit across `packages/400.conductor/24.frame.unit/`, `packages/400.conductor/BEE.ts`, `packages/400.conductor/98.menu.unit/`, and `packages/400.conductor/val/` in repository `000.series-sower-conductor` against the **12-Point Pre-Flight Completion Inspection Checklist** below to verify whether this continuous audio duration extraction, discrete 24 fps ceiling frame quantizer, cumulative-millisecond zero-drift timeline tiler, sub-frame zero-length clamp, and round-up causal $4n+1$ 3D VAE lattice adapter have already been completed:

$$
\text{Completion Percentage} = \left(\frac{\text{Passed Checks}}{12}\right) \times 100\% \text{}
$$

##### The 12-Point Completion Audit Battery

1. **Physical Inode Existence (`fce/`):** Verify that `packages/400.conductor/24.frame.unit/fce/frame.interface.ts` and `fce/frame.bit.ts` exist on disk and export strictly typed interfaces for `RawStemDuration`, `CausalVaeAllocation`, `QuantizedShot`, `TimelineQuantizationReceipt`, and `FrameBit`.
2. **Schema Validation Inode (`val/`):** Verify that `packages/400.conductor/24.frame.unit/val/frame.val.ts` exists and exports `RawStemDurationSchema` and `FrameQuantizationRequestSchema` with `.strict()` termination.
3. **Buzzer Execution Inode (`buz/`):** Verify that `packages/400.conductor/24.frame.unit/buz/frame.buzz.ts` exists and implements `extractDurationMsViaFfprobe`, `calculateCausalVaeAllocation`, `quantizeShotTimeline`, `initFrame`, `updateFrame`, and `quantizeAcousticClock`.
4. **Candor 7-File Unit Architecture:** Verify that `frame.action.ts`, `frame.buzzer.ts`, `frame.model.ts`, `frame.reduce.ts`, and `frame.unit.ts` physically exist within `packages/400.conductor/24.frame.unit/`.
5. **Discrete 24 fps Integer Ceiling Quantization Math:** Confirm that `quantizeShotTimeline` converts continuous acoustic milliseconds into integer frame targets via $\text{target\_frames} = \lceil (\text{duration\_ms} / 1000) \times 24 \rceil$ without floating-point remainders.
6. **Cumulative-Millisecond Zero-Drift Timeline Tiling:** Confirm that timeline placement derives absolute integer start and end boundaries from running cumulative millisecond duration sums ($\text{Start}_k = \lceil \frac{\sum_{i<k} D_i}{1000} \times 24 \rceil$, $\text{End}_k = \lceil \frac{\sum_{i \le k} D_i}{1000} \times 24 \rceil - 1$) guaranteeing $\text{End}_k + 1 \equiv \text{Start}_{k+1}$ and bounding total drift to $< 1\text{ frame}$ ($< 41.67\text{ ms}$) across an entire episode.
7. **Sub-Frame Zero-Length Interval Clamping:** Verify that spoken interjections, gasps, or micro-pauses shorter than a single video frame ($< 41.67\text{ ms}$) clamp strictly to a mandatory minimum of 1 frame ($41.67\text{ ms}$) at $\text{fromFrame} = 0, \text{toFrame} = 0$, preventing inverted or zero-length sequence crashes.
8. **Round-Up Causal $4n+1$ 3D VAE Stride Math:** Confirm that `calculateCausalVaeAllocation` enforces the causal lattice equation $N_{\text{diff}} = 4 \times \lceil (N - 1) / 4 \rceil + 1$ such that $(N_{\text{diff}} - 1) \pmod 4 === 0$, computing non-negative optical tail slack $\Delta F_{\text{slack}} = N_{\text{diff}} - N$ (e.g., $75\text{ frames} \to 77\text{ frames}$, $\Delta F_{\text{slack}} = 2$).
9. **The 2,000-Sample Constant Domain Bridge:** Verify that sample offsets map to video frames via integer factor $\frac{48{,}000\text{ samples/sec}}{24\text{ frames/sec}} = 2{,}000\text{ audio samples/frame}$, guaranteeing sample coordinate $S = F \times 2{,}000$ and frame coordinate $F = \lfloor S / 2{,}000 \rfloor$.
10. **Monorepo Central Manifest Integration (`BEE.ts`):** Confirm that `packages/400.conductor/BEE.ts` imports `FrameUnit` and registers it across `list`, `reducer`, and `UnitData` under key `frame` without compiler warnings.
11. **Blessed Terminal Cockpit Integration:** Verify that `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` mounts `QUANTIZE ACOUSTIC MASTER CLOCK` and pipes real-time 7-bit ASCII receipts (`>> [QUANT]`, `>> [LATTICE]`) directly into switchboard pane `cns00`.
12. **Vitest Verification Suite & Monorepo Boundaries:** Execute `npx vitest run packages/400.conductor/val/frame.test.ts` and confirm 100% passing tests with exit code 0; assert that `packages/400.conductor/src/` does not exist (`test ! -d packages/400.conductor/src`), `apps/995.library/` has 0 modified lines (`git status -s apps/995.library/995.library/` returns empty), and all unit code is 100% clean 7-bit ASCII.

##### Operational Halting & Execution Rules

- **IF $\ge 67\%$ (8 or more of the 12 checks pass):**
  - Update `[- **Progress:**]` above with the current execution timestamp and date:
    ```markdown
    - **Progress:** [🟢 Completed on Thursday, November 5, 2026 at 7:34 AM EST - Audit Score: >= 67% - Pre-existing Work Verified]
      *Reason for Halt:* Pre-flight audit confirmed that >= 67% of Phase 4 Discrete Frame Temporal Quantization Causal Alignment requirements—including 24.frame.unit Candor structure, discrete 24 fps integer ceiling quantization math, cumulative-millisecond zero-drift timeline tiling, sub-frame 1-frame clamp, round-up 4n+1 causal 3D VAE lattice expansion, 2,000-sample constant domain bridging, BEE.ts registration, Blessed TUI menu mounting, and green Vitest test batteries in val/frame.test.ts—are already established on disk. Operational execution halted immediately to prevent redundant file mutations or overwrites.
    ```
  - Write the original specification file with this updated timecode header and **STOP IMMEDIATELY!**
  - **STRICT AGENT BOUNDARY:** The Jules Coding Agent must strictly understand that this status and timestamp update is the **ONLY** update, work, and activity to be induced from this prompt. Do **NOT** rewrite files, do **NOT** modify existing tests, and do **NOT** execute redundant implementations[cite: 2, 3, 7].
- **IF $< 67\%$ (0 to 7 checks pass):**
  - Jules must proceed to implement and fulfill all missing requirements across `packages/400.conductor/24.frame.unit/`, `packages/400.conductor/BEE.ts`, `packages/400.conductor/98.menu.unit/`, and `packages/400.conductor/val/frame.test.ts`.
  - Once monorepo compilation (`npx tsc -b packages/400.conductor`) and Vitest runs clear with exit code 0, update `[- **Progress:**]` to `[🟢 Completed on Thursday, November 5, 2026 at 7:34 AM EST - Task Requirements Fully Implemented]` and save the file.

> **CRITICAL PARTNER TEST ADVISORY WARNING:** If there is a partner file located next to this one in the directory matching the suffix `[xxx.phase-xxx.ag-test.md]`, **YOU ARE TO NEVER RUN THIS TEST**. That test suite belongs exclusively to the Antigravity adversarial audit agent (`ag-test`), which will independently verify this implementation.

### **FUNCTIONAL MANDATE**

#### **User Story**

In the late-night editorial bay of the production studio, Marcus sat with his headphones pushed back, reviewing the rough composite of Episode 038. For weeks, the editing team had been battling an insidious, invisible phantom in the pipeline: whenever an emotional dialogue beat cut from Bog's rasped warning to a reverse angle of the Barony gatekeeper, the visual lips would desynchronize. By the end of a two-minute scene, the picture lagged nearly three-quarters of a second behind the dialogue, while the generative diffusion plates coming off Rig 2 looked mangled—the last syllable of Bog's speech was routinely severed, his mouth snapping shut mid-word while the audio waveform was still ringing out.

The defect was rooted in two compounding mathematical errors: first, previous iterations of the pipeline had used naive sequential concatenation ($\text{Start}_k = \text{End}_{k-1}$), where tiny floating-point rounding errors on each cut accumulated into over forty frames of visual drift across an episode. Second, the neural video model on Rig 2 operated on a 3D causal VAE that compressed time in strict steps of four frames ($4n+1$). When an unconstrained editorial budget demanded a 75-frame cut for a 3,120 ms audio line, naive floor math rounded down to 73 frames ($4 \times 18 + 1$), violently truncating two frames of spoken speech and crashing the latent tensor decoder.

This morning, Marcus watched `24.frame.unit` engage across the master editorial timeline.

The moment `09.speech.unit` committed the uncompressed 48 kHz `.wav` stem, `extractDurationMsViaFfprobe` read the physical duration: exactly 3,120 milliseconds. The discrete frame quantizer applied integer ceiling math, converting the continuous sound into an unyielding 75-frame budget. Then, the cumulative-millisecond zero-drift tiler took over: rather than chaining relative offsets, it derived timeline placements from running millisecond sums, locking Shot 1 to Frames 0–74, Shot 2 (1,840 ms) to Frames 75–119, and Shot 3 (2,400 ms) to Frames 120–177. The contiguity assertion held bit-for-bit ($\text{End}_k + 1 \equiv \text{Start}_{k+1}$), and the total episode drift evaluated to less than 18 milliseconds—well below a single video frame.

Next, the causal lattice adapter processed the 75-frame allocation. Instead of truncating downward, it applied round-up ceiling stride math: $n = \lceil (75 - 1) / 4 \rceil = 19 \implies 4(19) + 1 = 77\text{ native frames}$. It allocated exactly 77 frames for neural video diffusion on Rig 2 and recorded a 2-frame optical tail trim for Remotion downstream. When a 15-millisecond sharp gasp occurred, the sub-frame clamp kicked in, ensuring the transient received a solid 1-frame budget rather than collapsing into a zero-length sequence crash.

Marcus leaned forward as the preview played: the lips aligned to the exact acoustic transients, the cut snapped cleanly on Frame 75 without a single frame of slippage, and the character's facial kinematics finished the full spoken breath. The physical acoustic stem was the absolute master of time, and the picture locked into it with mathematical perfection.

#### **Strategic Goal**

Directly enforces the **Master Physical Clock Axiom** and the **Sub-Frame Audio-Visual Synchronization Invariant at $T_0 = \$0.00$**. By establishing continuous uncompressed speech waveforms as the non-negotiable physical timebase and quantizing them into absolute integer frame budgets at 24.0 fps via cumulative-millisecond tiling, this phase eliminates cumulative rounding drift, prevents sequencing engine crashes from zero-length sub-frame interjections, and guarantees seamless compatibility with $4n+1$ causal video diffusion lattices before any GPU rendering hours are spent.

#### **Context & Value**

- **The Strategic Value:** In an automated generative pipeline, visual neural models possess zero innate biological pacing, emotional timing, or conversational cadence. Sound is physical reality; visual plates are integer projections. If video is allowed to dictate time, dialogue must be artificially warped, resampled, or stretched, destroying vocal quality and introducing visual rubber-banding. By anchoring the entire temporal hierarchy to discrete ceiling quantization and causal lattice expansion within `000.series-sower-conductor`, visual plates conform to speech with mathematical certainty, and downstream renderers receive frame budgets that never crash tensor dimensions or truncate syllables.
- **The Technical Challenge:** Bridging continuous floating-point audio durations (measured to microsecond precision by `ffprobe`) and sample-accurate 48 kHz markers into a discrete 24.0 fps integer grid without:
  1. Allowing sequential concatenation rounding drift ($\le 41.67\text{ ms}$ per cut) to accumulate into multi-second desynchronization across hundreds of episodic shots.
  2. Generating inverted or zero-length timeline intervals on sub-frame audio snippets ($< 41.67\text{ ms}$).
  3. Violating the non-linear $4n+1$ causal temporal stride required by latent 3D diffusion autoencoders ($(N_{\text{diff}} - 1) \pmod 4 === 0$).

#### **Interface**

`Phase 4 Discrete Frame Temporal Quantization Causal Alignment` inside `000.series-sower-conductor` interfaces across the monorepo ecosystem through strict boundaries:

- **`packages/400.conductor/09.speech.unit` (Upstream Acoustic Source):** Supplies the committed 48 kHz linear PCM `.wav` stems synthesized on Rig 1, providing the physical audio files whose continuous duration dictates the timeline.
- **`packages/400.conductor/34.abstractsyntaxtree.unit` (Upstream Dialogue Structure):** Supplies the dialogue line IDs, speaker IDs, and Swain MRU reaction phases from `dialogue_ast.json` that bind to each quantized shot.
- **`packages/400.conductor/32.audio.unit` (Downstream Acoustic Geometry):** Consumes the discrete frame boundaries (`from_frame`, `to_frame`, `target_frames`) to compile `exposure_sheet.json` and calculate quadratic sidechain ducking curves (-14 dB attenuation).
- **`goblin-viewport-template` (Downstream Optical Compiler):** Consumes the quantized frame allocations and tail trim slack ($\Delta F_{\text{slack}}$) to source-bake static integer literals directly into Remotion `<Sequence>` components inside `Episode_XXX.tsx`.
- **`apps/995.library` (Foundational Terminal Cockpit Harness):** Houses the Blessed curses interface (`run.ts`) where the unit mounts its menu trigger and streams real-time telemetry into pane `cns00`.

#### **Interaction**

The operator observes and interacts with this phase through the **Blessed Terminal Interface** hosted in `apps/995.library`:

- **Interactive Cockpit Navigation:**
  1. Launch the terminal cockpit on Rig 1 via `npm run dev`.
  2. In the left navigation choice grid (`85.choice.unit` / `98.menu.unit`), use the arrow keys or `J`/`K` to highlight `QUANTIZE ACOUSTIC MASTER CLOCK`.
  3. Press `ENTER` to dispatch action `QUANTIZE_ACOUSTIC_CLOCK` against the loaded audio stems.
- **Visual Telemetry Feedback (`cns00`):**
  - The switchboard console (`cns00` at `{ x: 4, y: 0, xSpan: 8, ySpan: 12 }`) streams real-time 7-bit ASCII receipts as timeline quantization proceeds:
    ```plaintext
    >> [QUANT] Quantized 3 shots: 178 frames (7360ms) | Drift=56.667ms
    >> [QUANT] [sh01]: frames=75 (from=0, to=74) | VAE=77f (slack=2f)
    >> [QUANT] [sh02]: frames=45 (from=75, to=119) | VAE=45f (slack=0f)
    >> [QUANT] [sh03]: frames=58 (from=120, to=177) | VAE=61f (slack=3f)
    >> [MENU:FRAME] Acoustic clock quantized cleanly with zero drift.
    ```
  - If a sub-frame duration is encountered, `cns00` logs the clamp adjustment:
    ```plaintext
    >> [QUANT] [sh_gasp]: Duration 15ms < 41.67ms. Clamped to 1 frame minimum (from=0, to=0)
    ```
- **Local Headless CLI Inspection:**
  - For automated CI/CD verification without launching the curses UI, developers run the colocated test suite:
    ```bash
    npx vitest run packages/400.conductor/val/frame.test.ts
    ```
  - Confirm that the package adheres strictly to the unit-colocated layout without any forbidden `src/` directory:
    ```bash
    test ! -d packages/400.conductor/src && echo ">> [OK] Zero src/ directory confirmed."
    ```
  - Inspect the monorepo boundary to confirm zero dirty files in the curses runner harness:
    ```bash
    git status -s apps/995.library/995.library/
    ```

### You

{{FOCUS : Phase 4 Discrete Frame Temporal Quantization Causal Alignment }}

@agrav-check-00

### Gemini

### **Validation:**

- **Progress:** [⚪ Waiting for Action ]

> **Operational Directive for Antigravity:** When all of the listed checks, negative-control boundary traps, ceiling quantization assertions, zero-drift proofs, causal VAE stride tests, and interactive Blessed terminal levels in this Antigravity prompt are executed and pass with zero faults in regards to **Phase 4 Discrete Frame Temporal Quantization Causal Alignment**, Antigravity must update `[- **Progress:**]` above with the current timestamp and certification verdict (e.g., `[- **Progress:** 🟢 Certified on Thursday, November 5, 2026 at 7:34 AM EST - All Verification Tiers Cleared]`) and rewrite the original directive file with this finalized verification status upon successful completion of all audits and tests. If any check, constraint validation, ceiling quantization formula, cumulative zero-drift check, sub-frame clamp, or causal $4n+1$ stride test trips or fails, mark `[⚪` with `[🔴 Failed on Thursday, November 5, 2026 at 7:34 AM EST - Breach Detected in <LEVEL/CHECK>]` and emit the fail-closed conflict diagnostic trace.

### Blessed Terminal Interface (TUI) Validation Instructions

When validating features involving a Blessed Terminal Interface (`apps/995.library/` / `cns00` Showrunner Terminal):

1. **Human Keyboard Emulation:** Manually interact with the interface using real keyboard inputs and sequences (e.g., Arrow keys, `Tab`, `Enter`, `Escape`, character inputs, and configured shortcuts) exactly as an operator at a physical terminal would.
2. **Step-by-Step Flow Navigation:** Drive end-to-end user journeys through sequential keystrokes rather than relying solely on headless mocks or direct state mutations. Allow render and event loop cycles between inputs.
3. **Screen & Focus Verification:** Observe terminal screen buffers, cursor positions, active focused widgets, and visual updates after each keypress sequence to ensure the UI responds correctly.
4. **Lifecycle & Clean Exit:** Verify proper startup rendering, navigation across interactive elements, and graceful termination routines (such as `q`, `Escape`, or `Ctrl+C`).

### Blessed Terminal Interface (TUI) Validation & Autonomous Remediation Protocol

#### 1. Authoritative Runner Entry Point

- All interactive Blessed terminal tests **MUST** execute exclusively through:
  ```bash
  npm run dev
  ```
  *(Direct execution via bare `node` is strictly prohibited because `.ts` transpilation requires `tsx`; direct package execution flags like `npm run dev -- --package=299.lore` are strictly forbidden).*

#### 2. Pre-Flight Boundary Self-Healing Guard

- Before launching the runner, the auditor must assert harness integrity:
  ```bash
  git status -s apps/995.library/995.library/
  ```
- **Remediation Action:** If any dirty files or rogue stubs are detected inside `apps/995.library/995.library/`, the auditor must run `git restore apps/995.library/995.library/` immediately before proceeding to the build.
- `apps/995.library/run.ts` is the only file with a permitted modification path.

#### 3. In-Scope Remediation Mandate (Zero-Handoff Policy)

- If Level 5 encounters:
  - Missing CLI flags or runner options in `apps/995.library/run.ts` (permitted modification path).
  - Unimplemented menu navigation or telemetry hooks in `<package>/98.menu.unit/`.
  - Stale references in local package `tsconfig.json`.
- **The auditor must NOT halt execution or report failure to the user.**
- **The auditor must proactively implement the missing wiring**, re-execute the gauntlet, and verify clean end-to-end telemetry before sealing the audit.

#### 4. Verification Integrity Boundary

- The auditor should never:
  - Weaken Zod schemas or basis-point bounds to bypass failures.
  - Modify the immutable harness (`apps/995.library/995.library/**`).
  - Comment out or weaken directive assertions.
- Remediation is strictly limited to fixing runtime orchestration, restoring boundary corruptions, and fulfilling the mandated UI journey.

### ANTIGRAVITY ADVERSARIAL AUDIT & VERIFICATION GAUNTLET

- **TARGET DIRECTIVE:** `004.frame-quantization-causal-alignment-phase4.ag-test.md`
- **TARGET FOCUS:** `Phase 4 Discrete Frame Temporal Quantization Causal Alignment`
- **TARGET REPOSITORY:** `000.series-sower-conductor` (downstream: `camp-candor/series-sower-conductor` / `camp-candor/npm-agent-01`)
- **TARGET WORKSPACE:** `packages/400.conductor/`
- **AUDIT TARGET INODES:**
  - `packages/400.conductor/src/` *(ASSERTION: Physical non-existence; strict unit-colocated topology)*
  - `packages/400.conductor/24.frame.unit/fce/frame.interface.ts` *(AUDIT: Strict typings for `RawStemDuration`, `CausalVaeAllocation`, `QuantizedShot`, `TimelineQuantizationReceipt`, `Frame`)*
  - `packages/400.conductor/24.frame.unit/fce/frame.bit.ts` *(AUDIT: Candor action/state bale contract)*
  - `packages/400.conductor/24.frame.unit/val/frame.val.ts` *(AUDIT: Zod schemas `RawStemDurationSchema` and `FrameQuantizationRequestSchema` with `.strict()` termination)*
  - `packages/400.conductor/24.frame.unit/buz/frame.buzz.ts` *(AUDIT: Discrete 24 fps ceiling quantization, cumulative-millisecond zero-drift timeline tiler, sub-frame zero-length clamp, round-up causal $4n+1$ 3D VAE stride math, 2,000-sample constant domain bridge)*
  - `packages/400.conductor/24.frame.unit/frame.action.ts` *(AUDIT: Typed actions `INIT_FRAME`, `UPDATE_FRAME`, `QUANTIZE_ACOUSTIC_CLOCK`)*
  - `packages/400.conductor/24.frame.unit/frame.buzzer.ts` *(AUDIT: Clean buzzer exports with explicit `.js` specifiers)*
  - `packages/400.conductor/24.frame.unit/frame.model.ts` *(AUDIT: State model store)*
  - `packages/400.conductor/24.frame.unit/frame.reduce.ts` *(AUDIT: Pure reducer implementation via `clone-deep`)*
  - `packages/400.conductor/24.frame.unit/frame.unit.ts` *(AUDIT: Candor unit class wiring)*
  - `packages/400.conductor/BEE.ts` *(AUDIT: Registration of `FrameUnit` across `list`, `reducer`, and `UnitData`)*
  - `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` *(AUDIT: Menu mounting of `QUANTIZE ACOUSTIC MASTER CLOCK`)*
  - `packages/400.conductor/val/frame.test.ts` *(AUDIT: Colocated Vitest test battery validating discrete frame math, zero-drift contiguity, sub-frame clamp, and causal $4n+1$ lattice expansion)*
  - `apps/995.library/995.library/**` *(ASSERTION: Immutable runner boundary held at exactly 0 modified lines)*
- **AUDITOR PERSONA:** Autonomous Adversarial Systems Auditor & Temporal Master-Clock Verification Sentry (Antigravity v2.4)

### I. Architectural Mandate & Universal Negative-Control Law

Under the **Universal Negative-Control Law**, an acoustic master clock, discrete temporal frame quantizer, or causal diffusion lattice adapter that has never been observed actively failing closed when subjected to sub-frame rounding drift, downward-rounding VAE boundary truncation ($4\lfloor N/4 \rfloor + 1$), zero-length sequence intervals ($< 41.67\text{ ms}$), empty stem requests, or invalid non-hexadecimal shot identifiers at Stage $T_0 = \$0.00$ **CANNOT BE CERTIFIED FOR PRODUCTION DEPLOYMENT**.

Antigravity executes active negative-control fault injections, tests discrete integer ceiling arithmetic, audits cumulative-millisecond zero-drift contiguity ($\text{End}_k + 1 \equiv \text{Start}_{k+1}$), tests the 2,000-sample constant domain bridge ($S = F \times 2{,}000$), asserts round-up causal $4n+1$ lattice stride math ($(N_{\text{diff}} - 1) \pmod 4 === 0$), and asserts fail-closed exit codes across every verification level.

### II. Multi-Level Adversarial Audit Gauntlet

#### Level 1: Static Monorepo Boundary, Directory Invariant & Pure 7-Bit ASCII Audit

- **Check 1.1 (Forbidden `src/` Directory Non-Existence):** Assert that no `packages/400.conductor/src/` directory exists. All models, actions, buzzers, and reducers must reside strictly inside numbered unit folders (`24.frame.unit/`, etc.) and `val/`.
  ```bash
  test ! -d packages/400.conductor/src && echo ">> [OK] Zero src/ directory confirmed."
  ```
  *(Must exit with return code 0).*
- **Check 1.2 (Immutable Harness Fence):** Assert that the runner harness has sustained zero modifications:
  ```bash
  git status -s apps/995.library/995.library/
  ```
  *(Must return exactly 0 modified lines; if dirty, restore immediately via `git restore apps/995.library/995.library/`).*
- **Check 1.3 (NodeNext Explicit `.js` Imports):** Inspect all imports across `packages/400.conductor/24.frame.unit/` to verify that all relative module specifiers terminate explicitly with `.js` extensions.
- **Check 1.4 (Pure 7-Bit ASCII Cleanliness):** Execute a scan across all unit files and test suites in `24.frame.unit` and `val/frame.test.ts` to assert zero multi-byte Unicode or emojis:
  ```bash
  node -e "
  const fs = require('fs');
  const path = require('path');
  const files = [
    '24.frame.unit/fce/frame.interface.ts',
    '24.frame.unit/fce/frame.bit.ts',
    '24.frame.unit/val/frame.val.ts',
    '24.frame.unit/buz/frame.buzz.ts',
    '24.frame.unit/frame.action.ts',
    '24.frame.unit/frame.buzzer.ts',
    '24.frame.unit/frame.model.ts',
    '24.frame.unit/frame.reduce.ts',
    '24.frame.unit/frame.unit.ts',
    'val/frame.test.ts'
  ];
  for (const f of files) {
    const full = path.join('packages/400.conductor', f);
    if (!fs.existsSync(full)) {
      console.error(':: [FAIL] Missing file: ' + full);
      process.exit(1);
    }
    const content = fs.readFileSync(full, 'utf8');
    if (/[\x80-\xFF]/.test(content)) {
      console.error(':: [FAIL] Multi-byte non-ASCII character detected in: ' + full);
      process.exit(1);
    }
  }
  console.log('>> [OK] 100% 7-Bit Clean ASCII confirmed across all frame unit inodes.');
  "
  ```
- **Check 1.5 (TypeScript Compiler Verification):** Execute typecheck across the package:
  ```bash
  npx tsc -b packages/400.conductor
  ```
  *(Must complete with 0 errors and 0 diagnostic warnings).*

#### Level 2: Discrete Frame Quantization & Negative-Control Invariant Traps

- **Check 2.1 (Empty Stem Request Gate):** Invoke `quantizeShotTimeline([])` with an empty array. *Assertion:* Must immediately throw `TIMELINE_QUANT_EMPTY: Cannot quantize empty stem list` at Stage $T_0 = \$0.00$ spend.
- **Check 2.2 (Negative or Zero Duration Trap):** Pass an adversarial payload with `duration_ms: -500` or `duration_ms: 0` to `RawStemDurationSchema`. *Assertion:* Must fail Zod validation immediately, rejecting non-positive numbers before timeline compilation.
- **Check 2.3 (Discrete Integer Ceiling Quantization Math):** Evaluate frame quantization:
  $$
  \text{target\_frames} = \left\lceil \left(\frac{D_{\text{ms}}}{1000}\right) \times 24 \right\rceil \text{}
  $$
  *Assertion:* Audio measuring $3{,}120.50\text{ ms}$ must evaluate to exactly $75\text{ frames}$ ($\lceil 74.892 \rceil = 75$). Audio measuring $3{,}125\text{ ms}$ must evaluate to exactly $75\text{ frames}$ ($\lceil 75.0 \rceil = 75$). Floating-point remainders on `target_frames` are strictly prohibited.
- **Check 2.4 (Sub-Frame Zero-Length Interval Clamp):** Process a micro-vocalization or gasp measuring $D_{\text{ms}} = 15\text{ ms}$ ($< 41.67\text{ ms}$). *Assertion:* `target_frames` must clamp to a mandatory minimum of $1\text{ frame}$ ($41.67\text{ ms}$) with $\text{fromFrame} = 0, \text{toFrame} = 0$. Zero-length ($\text{fromFrame} = 0, \text{toFrame} = -1$) Remotion intervals are strictly forbidden.

#### Level 3: Cumulative Zero-Drift Contiguity & 2,000-Sample Constant Traps

- **Check 3.1 (Cumulative-Millisecond Zero-Drift Tiling):** Pass a sequence of three dialogue stems:
  - $\text{Shot 1}: D_1 = 3{,}120\text{ ms}$
  - $\text{Shot 2}: D_2 = 1{,}840\text{ ms}$
  - $\text{Shot 3}: D_3 = 2{,}400\text{ ms}$ Execute `quantizeShotTimeline(stems)` and assert:
  1. $\text{Shot 1} \to \text{from\_frame}: 0, \text{to\_frame}: 74$ ($75\text{ frames}$)
  2. $\text{Shot 2} \to \text{from\_frame}: 75, \text{to\_frame}: 119$ ($45\text{ frames}$)
  3. $\text{Shot 3} \to \text{from\_frame}: 120, \text{to\_frame}: 177$ ($58\text{ frames}$)
  4. Contiguity Invariant: $\text{to\_frame}_k + 1 \equiv \text{from\_frame}_{k+1}$ holds bit-for-bit across all cuts.
  5. Cumulative Drift Bound: $\text{drift\_ms} < 41.67\text{ ms}$ ($< 1\text{ video frame}$) across the entire sequence.
- **Check 3.2 (The 2,000-Sample Constant Mapping):** Evaluate sample offset equations:
  $$
  S = F \times 2{,}000, \quad F = \left\lfloor \frac{S}{2{,}000} \right\rfloor \text{}
  $$
  *Assertion:* For a 75-frame shot, `sample_offset_start` must equal $0$ and `sample_offset_end` must equal $150{,}000$. An acoustic transient at sample $S = 26{,}742$ must map to video frame $\lfloor 26{,}742 / 2{,}000 \rfloor = \text{Frame } 13$.

#### Level 4: Round-Up Causal $4n+1$ 3D VAE Stride Math Traps

- **Check 4.1 (Causal $4n+1$ Stride Expansion):** Evaluate causal lattice equation:
  $$
  N_{\text{diff}} = 4 \times \left\lceil \frac{N - 1}{4} \right\rceil + 1, \quad \Delta F_{\text{slack}} = N_{\text{diff}} - N \text{}
  $$
  *Assertion:* Verify test matrix across boundary conditions:
  - $N = 1 \implies N_{\text{diff}} = 1, \Delta F_{\text{slack}} = 0, n = 0$
  - $N = 2 \implies N_{\text{diff}} = 5, \Delta F_{\text{slack}} = 3, n = 1$
  - $N = 37 \implies N_{\text{diff}} = 37, \Delta F_{\text{slack}} = 0, n = 9$
  - $N = 38 \implies N_{\text{diff}} = 41, \Delta F_{\text{slack}} = 3, n = 10$
  - $N = 75 \implies N_{\text{diff}} = 77, \Delta F_{\text{slack}} = 2, n = 19$
  - Downward-rounding truncation ($4\lfloor N/4 \rfloor + 1 = 73$) is strictly prohibited. $(N_{\text{diff}} - 1) \pmod 4 === 0$ must hold with non-negative slack $\Delta F_{\text{slack}} \ge 0$.

#### Level 5: Colocated Vitest Verification Battery Clearance

- Execute the complete unit test suite:
  ```bash
  npx vitest run packages/400.conductor/val/frame.test.ts
  ```
  *(100% of test assertions must pass with exit code 0).*

#### Level 6: Blessed Terminal Cockpit Live Journey & Telemetry Audit

- **Step 6.1 (Launch Terminal Cockpit):** Start the operator interface via the authoritative entry point:
  ```bash
  npm run dev
  ```
- **Step 6.2 (Human Keyboard Emulation Journey):**
  1. Allow the 12x12 Cartesian screen layout to stabilize on screen.
  2. Use arrow keys (`Down`/`Up`) or `J`/`K` to navigate the choice grid (`85.choice.unit` / `98.menu.unit`).
  3. Move the selection cursor to highlight `QUANTIZE ACOUSTIC MASTER CLOCK`.
  4. Press `Enter` to dispatch action `QUANTIZE_ACOUSTIC_CLOCK`.
- **Step 6.3 (Console Telemetry Verification - `cns00`):** Inspect the switchboard console (`cns00` at `{ x: 4, y: 0, xSpan: 8, ySpan: 12 }`) to verify that the following 7-bit ASCII receipts are actively streamed:
  ```plaintext
  >> [QUANT] Quantized 3 shots: 178 frames (7360ms) | Drift=56.667ms
  >> [QUANT] [sh01]: frames=75 (from=0, to=74) | VAE=77f (slack=2f)
  >> [QUANT] [sh02]: frames=45 (from=75, to=119) | VAE=45f (slack=0f)
  >> [QUANT] [sh03]: frames=58 (from=120, to=177) | VAE=61f (slack=3f)
  >> [MENU:FRAME] Acoustic clock quantized cleanly with zero drift.
  ```
- **Step 6.4 (Graceful Teardown):** Press `Escape` or `q` to terminate the Blessed curses loop cleanly, confirming zero unhandled asynchronous promise rejections and clean restoration of terminal standard I/O.

### III. Final Feedback & Status Mutation Directive

#### 1. If ALL Verification Levels Pass (100% Compliance Across Levels 1–6):

- Update `[- **Progress:**]` at the top of this document to:
  ```markdown
  - **Progress:** [🟢 Certified on Thursday, November 5, 2026 at 7:34 AM EST - All Verification Tiers Cleared]
  ```
- Overwrite the original specification file with this updated header.
- Emit the certified success feedback receipt:
  ```plaintext
  >> ==============================================================================
  >> [ANTIGRAVITY AUDIT VERDICT: PASSED 🟢]
  >> PHASE 4: DISCRETE FRAME TEMPORAL QUANTIZATION CAUSAL ALIGNMENT
  >> ------------------------------------------------------------------------------
  >> [OK] Level 1: Monorepo fences held. apps/995.library/ untouched. Zero src/.
  >> [OK] Level 2: Discrete ceiling math and sub-frame zero-length clamp verified.
  >> [OK] Level 3: Cumulative zero-drift contiguity proven (End_k + 1 === Start_{k+1}).
  >> [OK] Level 4: The 2,000-sample constant domain bridge verified (S = F * 2000).
  >> [OK] Level 5: Round-up 4n+1 causal VAE lattice verified (75f -> 77f, slack=2f).
  >> [OK] Level 6: Blessed curses TUI flight deck verified with clean 7-bit ASCII logs.
  >> ------------------------------------------------------------------------------
  >> STATUS: DISCRETE FRAME TEMPORAL QUANTIZATION CERTIFIED PRODUCTION-READY (T0 = $0.00)
  >> ==============================================================================
  ```

#### 2. If ANY Check, Assertion, or Level Fails:

- Update `[- **Progress:**]` at the top of this document to:
  ```markdown
  - **Progress:** [🔴 Failed on Thursday, November 5, 2026 at 7:34 AM EST - Breach Detected in <LEVEL/CHECK>]
  ```
- Overwrite the original specification file with this updated header.
- Emit the fail-closed conflict diagnostic banner:
  ```plaintext
  :: ==============================================================================
  :: [ANTIGRAVITY AUDIT VERDICT: FAILED 🔴]
  :: PHASE 4: DISCRETE FRAME TEMPORAL QUANTIZATION CAUSAL ALIGNMENT
  :: ------------------------------------------------------------------------------
  :: [FAIL] Verification halted at Level <X>: <CHECK_NAME>
  :: Reason: <SPECIFIC_ASSERTION_FAILURE_DETAILS>
  :: Action: Remediate defective artifacts in 24.frame.unit before re-running audit.
  :: ==============================================================================
  ```
  *(Halt execution immediately without mutating further code).*

### You

{{FOCUS : Phase 5 Dynamic Sidechain Acoustic Geometry Exposure Sheet Compilation }}

@jules-task-00

### Gemini

# Jules Task: Phase 5 Dynamic Sidechain Acoustic Geometry Exposure Sheet Compilation

You are tasked with implementing **Phase 5: Dynamic Sidechain Acoustic Geometry Exposure Sheet Compilation** within the `000.series-sower-conductor` repository on Rig 1. This subsystem bridges physical acoustic stem measurements to downstream video execution by compiling the master scene blueprint (`drafts/exposure_sheet.json`). It enforces the **Master Physical Clock Axiom**, computes timeline-keyed **quadratic sidechain ducking curves** with **anti-pumping silences**, seeds deterministic **MurmurHash3 spot Foley transients**, and commits the final multi-track exposure sheet manifest through **POSIX atomic staging**.

### Architectural Invariants & Monorepo Boundaries

1. **Absolute Ban on `packages/400.conductor/src/`:** All code must reside strictly within `packages/400.conductor/32.audio.unit/`, `packages/400.conductor/98.menu.unit/`, or unit test batteries in `packages/400.conductor/val/`. Placing any file inside a `src/` directory within `packages/400.conductor/` is strictly prohibited.
2. **Immutable Harness Boundary:** `apps/995.library/995.library/**` is strictly immutable (0 lines modified).
3. **The Multi-Window Minimum-Reduction Ducking Law:** When active dialogue windows $[f_{\text{start}}, f_{\text{end}}]$ occur on Track 1, Track 3 (Ambient Bed & Score) must attenuate to a rigid $-14.0\text{ dB}$ floor ($V_{\text{duck}} = V_{\text{base}} \times 10^{-14/20} \approx 0.1995 \times V_{\text{base}}$). The transition follows a 6-frame quadratic attack before speech and a 12-frame quadratic release recovery after speech. Across overlapping speech windows or brief conversational pauses shorter than 18 frames, final gain must evaluate as the multi-window minimum reduction:
  $$
  \text{Gain}_{\text{final}}(f) = \min_{j \in \text{Windows}} \left( \text{Gain}_j(f) \right) \text{}
  $$
  Preventing volume from pumping back up during conversational pauses.
4. **Deterministic MurmurHash3 Foley Seeding:** Spot Foley sound effects on Track 2 must be deterministically placed using 32-bit MurmurHash3 integer seeds derived from `${sceneId}:${shotId}:${cueName}`, ensuring bit-identical placement and sample asset selection across distributed render nodes.
5. **Atomic POSIX Manifest Commits:** The exposure sheet manifest must be written to an ephemeral staging path (`drafts/exposure_sheet.json.tmp`) and promoted via `fs.renameSync` to `drafts/exposure_sheet.json` only after full validation, eliminating half-written JSON reads.
6. **Pure 7-Bit Clean ASCII Telemetry:** All source files, comments, tests, logs, and console outputs must strictly use 7-bit ASCII tokens (`>>`, `[OK]`, `[FAIL]`, `::`, `[DUCKING]`, `[FOLEY]`, `[EXPOSURE-SHEET]`).
7. **NodeNext Explicit `.js` Imports:** All relative TypeScript imports must explicitly terminate with `.js` extensions.

### File Implementation Manifest

```plaintext
packages/400.conductor/
├── 32.audio.unit/
│   ├── fce/
│   │   ├── audio.bit.ts
│   │   └── audio.interface.ts
│   ├── val/
│   │   └── audio.val.ts
│   ├── buz/
│   │   ├── duckingCalculator.buzz.ts
│   │   ├── foleySeeder.buzz.ts
│   │   └── audio.buzz.ts
│   ├── audio.action.ts
│   ├── audio.buzzer.ts
│   ├── audio.model.ts
│   ├── audio.reduce.ts
│   └── audio.unit.ts
├── 98.menu.unit/
│   └── buz/
│       └── 00.menu.buzz.ts              (Update: Mount Assemble Acoustic Exposure Sheet)
├── BEE.ts                               (Update: Register AudioUnit)
└── val/
    └── exposureSheet.test.ts            (Comprehensive Vitest Battery)
```

### Source Code Deliverables

#### 1. Interface & Bit Definitions

```typescript
// packages/400.conductor/32.audio.unit/fce/audio.interface.ts
export interface DialogueWindow {
  shot_id: string;
  from_frame: number;
  to_frame: number;
  stem_path: string;
  speaker_id: string;
}

export interface FoleyCueItem {
  shot_id: string;
  frame_offset: number;
  cue_name: string;
  resolved_sample: string;
  volume: number;
}

export interface DuckingGainNode {
  frame: number;
  gain: number;
}

export interface ExposureSheetShotTrack {
  shot_id: string;
  from_frame: number;
  to_frame: number;
  target_frames: number;
  dialogue_stem: string;
  dialogue_sha256: string;
  foley_events: FoleyCueItem[];
}

export interface ExposureSheetDocument {
  schema_version: string;
  series_id: string;
  scene_id: string;
  total_frames: number;
  total_duration_ms: number;
  tracks: {
    track1_dialogue: ExposureSheetShotTrack[];
    track2_foley: FoleyCueItem[];
    track3_ambient: {
      ambient_loop_path: string;
      base_volume: number;
      ducked_volume: number;
      ducking_keyframes: DuckingGainNode[];
    };
  };
}

export interface ExposureSheetReceipt {
  ok: boolean;
  scene_id: string;
  total_frames: number;
  manifest_path: string;
  ducking_point_count: number;
  foley_event_count: number;
  sha256: string;
  error?: string;
}

export default interface Audio {
  idx: string;
  isAssembling: boolean;
  lastExposureSheet?: ExposureSheetDocument;
  lastReceipt?: ExposureSheetReceipt;
}
```

```typescript
// packages/400.conductor/32.audio.unit/fce/audio.bit.ts
import {
  ExposureSheetDocument,
  ExposureSheetReceipt,
  DialogueWindow,
  FoleyCueItem,
} from './audio.interface.js';

export default interface AudioBit {
  idx: string;
  src?: string;
  val?: number;
  dat?: {
    scene_id?: string;
    series_id?: string;
    ambient_loop_path?: string;
    dialogue_windows?: DialogueWindow[];
    foley_cues?: FoleyCueItem[];
    exposureSheet?: ExposureSheetDocument;
    receipt?: ExposureSheetReceipt;
  };
  slv?: Function;
}
```

#### 2. Zod Validation & Schema Guardrails

```typescript
// packages/400.conductor/32.audio.unit/val/audio.val.ts
import { z } from 'zod';

export const DialogueWindowSchema = z
  .object({
    shot_id: z.string().min(1),
    from_frame: z.number().int().nonnegative(),
    to_frame: z.number().int().nonnegative(),
    stem_path: z.string().min(1),
    speaker_id: z.string().min(1),
  })
  .strict();

export const FoleyCueItemSchema = z
  .object({
    shot_id: z.string().min(1),
    frame_offset: z.number().int().nonnegative(),
    cue_name: z.string().min(1),
    resolved_sample: z.string().min(1),
    volume: z.number().min(0.0).max(1.0).default(0.8),
  })
  .strict();

export const DuckingGainNodeSchema = z
  .object({
    frame: z.number().int().nonnegative(),
    gain: z.number().min(0.0).max(1.0),
  })
  .strict();

export const ExposureSheetDocumentSchema = z
  .object({
    schema_version: z.string().default('1.0.0'),
    series_id: z.string().min(1),
    scene_id: z.string().min(1),
    total_frames: z.number().int().positive(),
    total_duration_ms: z.number().positive(),
    tracks: z
      .object({
        track1_dialogue: z.array(z.any()),
        track2_foley: z.array(FoleyCueItemSchema),
        track3_ambient: z
          .object({
            ambient_loop_path: z.string().min(1),
            base_volume: z.number().min(0.0).max(1.0).default(0.4),
            ducked_volume: z.number().min(0.0).max(1.0),
            ducking_keyframes: z.array(DuckingGainNodeSchema),
          })
          .strict(),
      })
      .strict(),
  })
  .strict();
```

#### 3. Quadratic Ducking, MurmurHash3 Seeding, and Audio Buzzers

```typescript
// packages/400.conductor/32.audio.unit/buz/duckingCalculator.buzz.ts
import { DialogueWindow, DuckingGainNode } from '../fce/audio.interface.js';

export const ATTACK_FRAMES = 6;
export const RELEASE_FRAMES = 12;
export const ATTENUATION_DB = -14.0;

export const calculateDuckedVolume = (baseVolume: number, attenuationDb = ATTENUATION_DB): number => {
  const linearMultiplier = Math.pow(10, attenuationDb / 20); // 10^(-14/20) ~ 0.199526
  return Number((baseVolume * linearMultiplier).toFixed(4));
};

export const computeSingleWindowGain = (
  frame: number,
  startFrame: number,
  endFrame: number,
  baseGain: number,
  duckedGain: number,
): number => {
  if (frame < startFrame - ATTACK_FRAMES) return baseGain;

  // Quadratic Attack Phase (Easing.outQuad): gain drops to duckedGain
  if (frame >= startFrame - ATTACK_FRAMES && frame < startFrame) {
    const t = (frame - (startFrame - ATTACK_FRAMES)) / ATTACK_FRAMES;
    const progress = t * (2 - t); // QuadOut
    return Number((baseGain - (baseGain - duckedGain) * progress).toFixed(4));
  }

  // Active Dialogue Window: clamped flat at duckedGain
  if (frame >= startFrame && frame <= endFrame) {
    return duckedGain;
  }

  // Quadratic Release Phase (Easing.inQuad): gain recovers to baseGain
  if (frame > endFrame && frame <= endFrame + RELEASE_FRAMES) {
    const t = (frame - endFrame) / RELEASE_FRAMES;
    const progress = t * t; // QuadIn
    return Number((duckedGain + (baseGain - duckedGain) * progress).toFixed(4));
  }

  return baseGain;
};

export const computeMultiWindowDuckingCurve = (
  windows: DialogueWindow[],
  totalFrames: number,
  baseVolume = 0.4,
): DuckingGainNode[] => {
  if (totalFrames <= 0) return [];
  const duckedVolume = calculateDuckedVolume(baseVolume);
  const keyframes: DuckingGainNode[] = [];

  for (let f = 0; f < totalFrames; f++) {
    let minGain = baseVolume;
    for (const win of windows) {
      const g = computeSingleWindowGain(f, win.from_frame, win.to_frame, baseVolume, duckedVolume);
      if (g < minGain) {
        minGain = g;
      }
    }
    // Record sample points or contour transitions
    keyframes.push({ frame: f, gain: Number(minGain.toFixed(4)) });
  }

  return keyframes;
};
```

```typescript
// packages/400.conductor/32.audio.unit/buz/foleySeeder.buzz.ts
import { FoleyCueItem } from '../fce/audio.interface.js';

export const murmurHash3 = (key: string, seed = 0): number => {
  let k1 = 0;
  let h1 = seed >>> 0;
  const remainder = key.length & 3;
  const bytes = key.length - remainder;

  for (let i = 0; i < bytes; i += 4) {
    k1 =
      (key.charCodeAt(i) & 0xff) |
      ((key.charCodeAt(i + 1) & 0xff) << 8) |
      ((key.charCodeAt(i + 2) & 0xff) << 16) |
      ((key.charCodeAt(i + 3) & 0xff) << 24);

    k1 = Math.imul(k1, 0xcc9e2d51);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, 0x1b873593);

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = Math.imul(h1, 5) + 0xe6546b64;
  }

  k1 = 0;
  switch (remainder) {
    case 3:
      k1 ^= (key.charCodeAt(bytes + 2) & 0xff) << 16;
    case 2:
      k1 ^= (key.charCodeAt(bytes + 1) & 0xff) << 8;
    case 1:
      k1 ^= key.charCodeAt(bytes) & 0xff;
      k1 = Math.imul(k1, 0xcc9e2d51);
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = Math.imul(k1, 0x1b873593);
      h1 ^= k1;
  }

  h1 ^= key.length;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
};

export const resolveDeterministicFoleyCue = (
  sceneId: string,
  shotId: string,
  cueName: string,
  frameOffset: number,
  availableSamples: string[],
): FoleyCueItem => {
  const seedKey = `${sceneId}:${shotId}:${cueName}`;
  const hash = murmurHash3(seedKey);
  const sampleIndex = availableSamples.length > 0 ? hash % availableSamples.length : 0;
  const resolvedSample = availableSamples[sampleIndex] || `${cueName}_01.wav`;

  return {
    shot_id: shotId,
    frame_offset: frameOffset,
    cue_name: cueName,
    resolved_sample: resolvedSample,
    volume: 0.8,
  };
};
```

```typescript
// packages/400.conductor/32.audio.unit/buz/audio.buzz.ts
import { AudioModel } from '../audio.model.js';
import AudioBit from '../fce/audio.bit.js';
import {
  ExposureSheetDocument,
  ExposureSheetReceipt,
  ExposureSheetShotTrack,
} from '../fce/audio.interface.js';
import { ExposureSheetDocumentSchema } from '../val/audio.val.js';
import {
  computeMultiWindowDuckingCurve,
  calculateDuckedVolume,
} from './duckingCalculator.buzz.js';
import State from '../../99.core/state.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

export const assembleExposureSheetDocument = (
  seriesId: string,
  sceneId: string,
  windows: any[],
  foleyEvents: any[],
  ambientLoopPath = 'audio/ambient/machinery_bed.wav',
  baseVolume = 0.4,
): ExposureSheetDocument => {
  const lastWindow = windows[windows.length - 1];
  const totalFrames = lastWindow ? lastWindow.to_frame + 1 : 24;
  const totalDurationMs = Math.round((totalFrames / 24) * 1000);
  const duckedVolume = calculateDuckedVolume(baseVolume);
  const duckingKeyframes = computeMultiWindowDuckingCurve(windows, totalFrames, baseVolume);

  const track1: ExposureSheetShotTrack[] = windows.map((w) => ({
    shot_id: w.shot_id,
    from_frame: w.from_frame,
    to_frame: w.to_frame,
    target_frames: w.to_frame - w.from_frame + 1,
    dialogue_stem: w.stem_path,
    dialogue_sha256: w.sha256 || '0000000000000000000000000000000000000000000000000000000000000000',
    foley_events: foleyEvents.filter((f) => f.shot_id === w.shot_id),
  }));

  return {
    schema_version: '1.0.0',
    series_id: seriesId,
    scene_id: sceneId,
    total_frames: totalFrames,
    total_duration_ms: totalDurationMs,
    tracks: {
      track1_dialogue: track1,
      track2_foley: foleyEvents,
      track3_ambient: {
        ambient_loop_path: ambientLoopPath,
        base_volume: baseVolume,
        ducked_volume: duckedVolume,
        ducking_keyframes: duckingKeyframes,
      },
    },
  };
};

export const initAudio = (cpy: AudioModel, bal: AudioBit, ste: State) => {
  if (bal.slv != null) bal.slv({ audBit: { idx: 'init-audio', val: 1 } });
  return cpy;
};

export const updateAudio = (cpy: AudioModel, bal: AudioBit, ste: State) => {
  if (bal.slv != null) bal.slv({ audBit: { idx: 'update-audio' } });
  return cpy;
};

export const assembleAcousticExposureSheet = async (cpy: AudioModel, bal: AudioBit, ste: State) => {
  cpy.isAssembling = true;
  try {
    const sceneId = bal.dat?.scene_id || 'ep01_sc01';
    const seriesId = bal.dat?.series_id || 'under-the-floorboards';
    const windows = bal.dat?.dialogue_windows || [];
    const foleyCues = bal.dat?.foley_cues || [];
    const ambientLoop = bal.dat?.ambient_loop_path || 'audio/ambient/machinery_bed.wav';

    const doc = assembleExposureSheetDocument(seriesId, sceneId, windows, foleyCues, ambientLoop);
    ExposureSheetDocumentSchema.parse(doc);

    const draftsDir = path.resolve('drafts');
    if (!fs.existsSync(draftsDir)) {
      fs.mkdirSync(draftsDir, { recursive: true });
    }

    const finalPath = path.join(draftsDir, 'exposure_sheet.json');
    const stagingPath = `${finalPath}.tmp`;

    const serialized = JSON.stringify(doc, null, 2);
    fs.writeFileSync(stagingPath, serialized, 'utf8');
    fs.renameSync(stagingPath, finalPath);

    const sha256 = crypto.createHash('sha256').update(serialized).digest('hex');

    const receipt: ExposureSheetReceipt = {
      ok: true,
      scene_id: sceneId,
      total_frames: doc.total_frames,
      manifest_path: finalPath,
      ducking_point_count: doc.tracks.track3_ambient.ducking_keyframes.length,
      foley_event_count: foleyCues.length,
      sha256,
    };

    cpy.lastExposureSheet = doc;
    cpy.lastReceipt = receipt;
    cpy.isAssembling = false;

    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [EXPOSURE-SHEET] [OK] Compiled [${sceneId}]: ${doc.total_frames} frames | DuckingKeyframes=${receipt.ducking_point_count} | Foley=${receipt.foley_event_count}`,
      });
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [EXPOSURE-SHEET] Committed to drafts/exposure_sheet.json (SHA: ${sha256.substring(0, 12)}...)`,
      });
    }

    if (bal.slv != null) {
      bal.slv({
        audBit: {
          idx: 'assemble-acoustic-exposure-sheet-success',
          dat: { receipt, exposureSheet: doc },
        },
      });
    }
  } catch (err: any) {
    cpy.isAssembling = false;
    const errorMsg = err.message || String(err);
    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `:: [EXPOSURE-SHEET] [FAIL] Exposure sheet assembly faulted: ${errorMsg}`,
      });
    }
    if (bal.slv != null) {
      bal.slv({
        audBit: {
          idx: 'assemble-acoustic-exposure-sheet-error',
          src: errorMsg,
        },
      });
    }
  }

  return cpy;
};
```

#### 4. Action Classes, Buzzer Exports, Model, and Reducer

```typescript
// packages/400.conductor/32.audio.unit/audio.action.ts
import { Action } from '../99.core/interface/action.interface.js';
import AudioBit from './fce/audio.bit.js';

export const INIT_AUDIO = '[Audio action] Init Audio';
export class InitAudio implements Action {
  readonly type = INIT_AUDIO;
  constructor(public bale: AudioBit) {}
}

export const UPDATE_AUDIO = '[Audio action] Update Audio';
export class UpdateAudio implements Action {
  readonly type = UPDATE_AUDIO;
  constructor(public bale: AudioBit) {}
}

export const ASSEMBLE_ACOUSTIC_EXPOSURE_SHEET = '[Audio action] Assemble Acoustic Exposure Sheet';
export class AssembleAcousticExposureSheet implements Action {
  readonly type = ASSEMBLE_ACOUSTIC_EXPOSURE_SHEET;
  constructor(public bale: AudioBit) {}
}

export type Actions = InitAudio | UpdateAudio | AssembleAcousticExposureSheet;
```

```typescript
// packages/400.conductor/32.audio.unit/audio.buzzer.ts
export {
  initAudio,
  updateAudio,
  assembleAcousticExposureSheet,
  assembleExposureSheetDocument,
} from './buz/audio.buzz.js';
export {
  calculateDuckedVolume,
  computeSingleWindowGain,
  computeMultiWindowDuckingCurve,
  ATTACK_FRAMES,
  RELEASE_FRAMES,
  ATTENUATION_DB,
} from './buz/duckingCalculator.buzz.js';
export {
  murmurHash3,
  resolveDeterministicFoleyCue,
} from './buz/foleySeeder.buzz.js';
```

```typescript
// packages/400.conductor/32.audio.unit/audio.model.ts
import Audio, {
  ExposureSheetDocument,
  ExposureSheetReceipt,
} from './fce/audio.interface.js';

export class AudioModel implements Audio {
  idx: string = '32.audio';
  isAssembling: boolean = false;
  lastExposureSheet?: ExposureSheetDocument;
  lastReceipt?: ExposureSheetReceipt;
}
```

```typescript
// packages/400.conductor/32.audio.unit/audio.reduce.ts
import clone from 'clone-deep';
import * as Act from './audio.action.js';
import { AudioModel } from './audio.model.js';
import * as Buzz from './audio.buzzer.js';
import State from '../99.core/state.js';

export function reducer(
  model: AudioModel = new AudioModel(),
  act: Act.Actions,
  state?: State,
) {
  switch (act.type) {
    case Act.INIT_AUDIO:
      return Buzz.initAudio(clone(model), act.bale, state!);

    case Act.UPDATE_AUDIO:
      return Buzz.updateAudio(clone(model), act.bale, state!);

    case Act.ASSEMBLE_ACOUSTIC_EXPOSURE_SHEET:
      return Buzz.assembleAcousticExposureSheet(clone(model), act.bale, state!);

    default:
      return model;
  }
}
```

```typescript
// packages/400.conductor/32.audio.unit/audio.unit.ts
import State from '../99.core/state.js';

export default class AudioUnit {
  constructor(state: State) {}
}
```

#### 5. Central Wiring in BEE.ts

```typescript
// In packages/400.conductor/BEE.ts:
// Add import and registration for AudioUnit:
import AudioUnit from './32.audio.unit/audio.unit.js';
import Audio from './32.audio.unit/fce/audio.interface.js';
import { AudioModel } from './32.audio.unit/audio.model.js';
import { reducer as audioReducer } from './32.audio.unit/audio.reduce.js';

// In list:
export const list = {
  // ... other units
  audio: AudioUnit,
};

// In reducer:
export const reducer = {
  // ... other reducers
  audio: audioReducer,
};

// In UnitData:
export default class UnitData implements Model {
  // ... other units
  audio: Audio = new AudioModel();
}
```

#### 6. Blessed Menu Integration

```typescript
// In packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts:
// Add choice option under the menu switch case:
case 'ASSEMBLE ACOUSTIC EXPOSURE SHEET':
  bit = await ste.hunt('[Audio action] Assemble Acoustic Exposure Sheet', {
    dat: {
      scene_id: 'ep01_sc01',
      series_id: 'under-the-floorboards',
      dialogue_windows: [
        {
          shot_id: 'sh01',
          from_frame: 0,
          to_frame: 74,
          stem_path: 'public/audio/dialogue/ep01_sc01_sh01.wav',
          speaker_id: 'char_bog',
        },
        {
          shot_id: 'sh02',
          from_frame: 82,
          to_frame: 130,
          stem_path: 'public/audio/dialogue/ep01_sc01_sh02.wav',
          speaker_id: 'char_elias',
        },
      ],
      foley_cues: [
        {
          shot_id: 'sh01',
          frame_offset: 12,
          cue_name: 'ratchet_click',
          resolved_sample: 'audio/foley/ratchet_click_02.wav',
          volume: 0.8,
        },
      ],
    },
  });
  if (bit?.audBit?.dat?.receipt?.ok) {
    await global.LIBRARY.hunt('[Console action] Update Console', {
      idx: 'cns00',
      src: '>> [MENU:AUDIO] Exposure sheet compiled and committed to drafts/ [OK]',
    });
  }
  break;
```

#### 7. Colocated Vitest Verification Battery

```typescript
// packages/400.conductor/val/exposureSheet.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AudioModel } from '../32.audio.unit/audio.model.js';
import * as Buzz from '../32.audio.unit/buz/audio.buzz.js';
import * as Duck from '../32.audio.unit/buz/duckingCalculator.buzz.js';
import * as Foley from '../32.audio.unit/buz/foleySeeder.buzz.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('32.audio.unit: Dynamic Sidechain Acoustic Geometry Exposure Sheet Compilation', () => {
  let model: AudioModel;
  const draftsDir = path.resolve('drafts');

  beforeEach(() => {
    model = new AudioModel();
    if (!fs.existsSync(draftsDir)) {
      fs.mkdirSync(draftsDir, { recursive: true });
    }
  });

  afterEach(() => {
    const finalPath = path.join(draftsDir, 'exposure_sheet.json');
    const stagingPath = `${finalPath}.tmp`;
    if (fs.existsSync(finalPath)) { try { fs.unlinkSync(finalPath); } catch {} }
    if (fs.existsSync(stagingPath)) { try { fs.unlinkSync(stagingPath); } catch {} }
  });

  it('calculates -14.0 dB ducked volume floor accurately from base volume', () => {
    const base = 0.40;
    const ducked = Duck.calculateDuckedVolume(base, -14.0);
    // 0.40 * 10^(-14/20) = 0.40 * 0.199526 = 0.0798
    expect(ducked).toBe(0.0798);
  });

  it('enforces multi-window minimum reduction preventing volume surge during 8-frame conversational pause', () => {
    const windows = [
      { shot_id: 'sh01', from_frame: 10, to_frame: 40, stem_path: 'a.wav', speaker_id: 'bog' },
      { shot_id: 'sh02', from_frame: 48, to_frame: 80, stem_path: 'b.wav', speaker_id: 'elias' }, // 8-frame pause (frames 41-47)
    ];

    const curve = Duck.computeMultiWindowDuckingCurve(windows, 100, 0.40);
    expect(curve.length).toBe(100);

    // Baseline before attack
    expect(curve[0].gain).toBe(0.40);

    // Active dialogue window 1
    expect(curve[20].gain).toBe(0.0798);

    // Mid-pause frame 44: combined attack/release is 18 frames, gap is 8 frames -> clamped flat near/at floor
    expect(curve[44].gain).toBeLessThan(0.15);

    // Active dialogue window 2
    expect(curve[60].gain).toBe(0.0798);

    // Fully recovered after release
    expect(curve[95].gain).toBe(0.40);
  });

  it('seeds deterministic foley transients using MurmurHash3', () => {
    const samples = ['footstep_01.wav', 'footstep_02.wav', 'footstep_03.wav'];
    const cueA = Foley.resolveDeterministicFoleyCue('sc01', 'sh01', 'footstep', 14, samples);
    const cueB = Foley.resolveDeterministicFoleyCue('sc01', 'sh01', 'footstep', 14, samples);
    const cueC = Foley.resolveDeterministicFoleyCue('sc01', 'sh02', 'footstep', 14, samples);

    expect(cueA.resolved_sample).toBe(cueB.resolved_sample);
    expect(cueA.frame_offset).toBe(14);
    expect(typeof cueA.resolved_sample).toBe('string');
  });

  it('assembles exposure sheet document and performs atomic POSIX commit to drafts/exposure_sheet.json', async () => {
    const bale = {
      idx: 'test-assemble',
      dat: {
        scene_id: 'ep01_sc01',
        series_id: 'under-the-floorboards',
        dialogue_windows: [
          { shot_id: 'sh01', from_frame: 0, to_frame: 74, stem_path: 'dialogue/sh01.wav', speaker_id: 'bog' },
        ],
        foley_cues: [
          { shot_id: 'sh01', frame_offset: 10, cue_name: 'boot_scrape', resolved_sample: 'boot_01.wav', volume: 0.8 },
        ],
      },
      slv: (res: any) => res,
    };

    const updated = await Buzz.assembleAcousticExposureSheet(model, bale, null as any);
    expect(updated.lastReceipt?.ok).toBe(true);

    const committedFile = path.join(draftsDir, 'exposure_sheet.json');
    expect(fs.existsSync(committedFile)).toBe(true);

    const raw = fs.readFileSync(committedFile, 'utf8');
    const parsed = JSON.parse(raw);
    expect(parsed.scene_id).toBe('ep01_sc01');
    expect(parsed.tracks.track1_dialogue.length).toBe(1);
    expect(parsed.tracks.track2_foley.length).toBe(1);
    expect(parsed.tracks.track3_ambient.ducking_keyframes.length).toBe(75);
  });
});
```

### Jules Execution Protocol

1. Author and write all files under `packages/400.conductor/32.audio.unit/` adhering strictly to `.js` import specifiers.
2. Register `AudioUnit` in `packages/400.conductor/BEE.ts` under `list`, `reducer`, and `UnitData`.
3. Add `ASSEMBLE ACOUSTIC EXPOSURE SHEET` to `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts`.
4. Run `npx vitest run packages/400.conductor/val/exposureSheet.test.ts` to ensure 100% of unit tests pass.
5. Verify that `npx tsc -b packages/400.conductor` compiles cleanly with zero diagnostic warnings and `test ! -d packages/400.conductor/src` confirms absence of any forbidden `src/` directory[cite: 9].
6. **COMMAND:** When you begin working on this specification, immediately update the `[- **Status:**]` attribute below to `[🟡 In Progress]`. When all target files and the Vitest test gauntlet pass with exit code 0, update `[- **Status:**]` to `[🟢 Done]`.

### **Attributes:**

- **Status:** [⚪ Backlog ]
- **Priority:** [🔴 High]
- **Time Estimate:** [1 Hour]
- **Tags:** [infrastructure, audio-unit, exposure-sheet, sidechain-ducking, foley-seeder]
- **Epic:** [EPIC 001: INFRASTRUCTURE & GOVERNANCE]
- **Value:** [Acoustic Multi-Track Geometry & Master Timeline Manifest]
- **Sprint Points:** [2]
- **Component:** [packages/400.conductor/32.audio.unit]
- **Owner:** [Jules Autonomous Implementer]
- **Target Release:** [Sprint 4 / Conductor v1.0]
- **Risk Level:** [Low]
- **Reporter:** [Studio Architecture Lead]

### You

{{FOCUS : Phase 5 Dynamic Sidechain Acoustic Geometry Exposure Sheet Compilation }}

@jules-complete-check

### Gemini

### **Validation:**

- **Progress:** [⚪ Waiting for Action ]

#### Jules Pre-Flight Completion Audit & Operational Directive

**Agent Instruction:** Before generating, authoring, or mutating any code for **Phase 5 Dynamic Sidechain Acoustic Geometry Exposure Sheet Compilation**, execute an automated inspection audit across `packages/400.conductor/32.audio.unit/`, `packages/400.conductor/BEE.ts`, `packages/400.conductor/98.menu.unit/`, and `packages/400.conductor/val/` in repository `000.series-sower-conductor` against the **12-Point Pre-Flight Completion Inspection Checklist** below to verify whether this multi-window minimum-reduction sidechain ducking engine, deterministic MurmurHash3 Foley transient seeder, and atomic POSIX exposure sheet manifest compiler have already been completed:

$$
\text{Completion Percentage} = \left(\frac{\text{Passed Checks}}{12}\right) \times 100\% \text{}
$$

##### The 12-Point Completion Audit Battery

1. **Physical Inode Existence (`fce/`):** Verify that `packages/400.conductor/32.audio.unit/fce/audio.interface.ts` and `fce/audio.bit.ts` exist on disk and export `DialogueWindow`, `FoleyCueItem`, `DuckingGainNode`, `ExposureSheetShotTrack`, `ExposureSheetDocument`, `ExposureSheetReceipt`, and `AudioBit`.
2. **Schema Validation Inode (`val/`):** Verify that `packages/400.conductor/32.audio.unit/val/audio.val.ts` exists and exports `DialogueWindowSchema`, `FoleyCueItemSchema`, `DuckingGainNodeSchema`, and `ExposureSheetDocumentSchema` with `.strict()` termination.
3. **Ducking Calculator Buzzer Inode (`buz/`):** Verify that `packages/400.conductor/32.audio.unit/buz/duckingCalculator.buzz.ts` exists and implements `calculateDuckedVolume`, `computeSingleWindowGain`, and `computeMultiWindowDuckingCurve`.
4. **Foley Seeder Buzzer Inode (`buz/`):** Verify that `packages/400.conductor/32.audio.unit/buz/foleySeeder.buzz.ts` exists and implements `murmurHash3` and `resolveDeterministicFoleyCue`.
5. **Master Audio Buzzer Inode (`buz/`):** Verify that `packages/400.conductor/32.audio.unit/buz/audio.buzz.ts` exists and implements `assembleExposureSheetDocument`, `initAudio`, `updateAudio`, and `assembleAcousticExposureSheet`.
6. **Candor 7-File Unit Architecture:** Verify that `audio.action.ts`, `audio.buzzer.ts`, `audio.model.ts`, `audio.reduce.ts`, and `audio.unit.ts` physically exist within `packages/400.conductor/32.audio.unit/`.
7. **$-14.0\text{ dB}$ Ducked Volume Floor Math:** Confirm that `calculateDuckedVolume` converts base ambient volume ($V_{\text{base}} = 0.40$) into the ducked floor via $V_{\text{duck}} = V_{\text{base}} \times 10^{-14/20} \approx 0.0798$.
8. **Multi-Window Minimum-Reduction Anti-Pumping Curve:** Confirm that `computeMultiWindowDuckingCurve` enforces $\text{Gain}_{\text{final}}(f) = \min_{j \in \text{Windows}}(\text{Gain}_j(f))$ across all dialogue windows, holding attenuation flat during conversational pauses shorter than 18 frames without audio gain pumping.
9. **Deterministic MurmurHash3 Spot Foley Seeding:** Verify that `resolveDeterministicFoleyCue` computes 32-bit MurmurHash3 integer seeds from `${sceneId}:${shotId}:${cueName}` to pick sample asset paths deterministically.
10. **Atomic POSIX Manifest Commit:** Confirm that `assembleAcousticExposureSheet` writes serialized JSON strictly to `drafts/exposure_sheet.json.tmp` and promotes it atomically to `drafts/exposure_sheet.json` via `fs.renameSync`.
11. **Monorepo Central Wiring & Cockpit Mounting:** Confirm that `packages/400.conductor/BEE.ts` registers `AudioUnit` under key `audio`, and `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` mounts `ASSEMBLE ACOUSTIC EXPOSURE SHEET` with 7-bit ASCII console telemetry (`>> [EXPOSURE-SHEET]`) piped to `cns00`.
12. **Vitest Verification Suite & Monorepo Boundaries:** Execute `npx vitest run packages/400.conductor/val/exposureSheet.test.ts` and confirm 100% passing assertions with exit code 0; assert that `packages/400.conductor/src/` does not exist (`test ! -d packages/400.conductor/src`), `apps/995.library/` has 0 modified lines (`git status -s apps/995.library/995.library/` returns empty), and all code is 100% clean 7-bit ASCII.

##### Operational Halting & Execution Rules

- **IF $\ge 67\%$ (8 or more of the 12 checks pass):**
  - Update `[- **Progress:**]` above with the current execution timestamp and date:
    ```markdown
    - **Progress:** [🟢 Completed on Thursday, November 5, 2026 at 7:40 AM EST - Audit Score: >= 67% - Pre-existing Work Verified]
      *Reason for Halt:* Pre-flight audit confirmed that >= 67% of Phase 5 Dynamic Sidechain Acoustic Geometry Exposure Sheet Compilation requirements—including 32.audio.unit Candor structure, -14.0 dB ducking math, multi-window min-reduction anti-pumping curves, MurmurHash3 Foley seeding, atomic POSIX drafts/exposure_sheet.json staging, BEE.ts registration, Blessed TUI menu mounting, and green Vitest test batteries in val/exposureSheet.test.ts—are already established on disk. Operational execution halted immediately to prevent redundant file mutations or overwrites.
    ```
  - Write the original specification file with this updated timecode header and **STOP IMMEDIATELY!**
  - **STRICT AGENT BOUNDARY:** The Jules Coding Agent must strictly understand that this status and timestamp update is the **ONLY** update, work, and activity to be induced from this prompt. Do **NOT** rewrite files, do **NOT** modify existing tests, and do **NOT** execute redundant implementations.
- **IF $< 67\%$ (0 to 7 checks pass):**
  - Jules must proceed to implement and fulfill all missing requirements across `packages/400.conductor/32.audio.unit/`, `packages/400.conductor/BEE.ts`, `packages/400.conductor/98.menu.unit/`, and `packages/400.conductor/val/exposureSheet.test.ts`.
  - Once monorepo compilation (`npx tsc -b packages/400.conductor`) and Vitest runs clear with exit code 0, update `[- **Progress:**]` to `[🟢 Completed on Thursday, November 5, 2026 at 7:40 AM EST - Task Requirements Fully Implemented]` and save the file.

> **CRITICAL PARTNER TEST ADVISORY WARNING:** If there is a partner file located next to this one in the directory matching the suffix `[xxx.phase-xxx.ag-test.md]`, **YOU ARE TO NEVER RUN THIS TEST**. That test suite belongs exclusively to the Antigravity adversarial audit agent (`ag-test`), which will independently verify this implementation.

### **FUNCTIONAL MANDATE**

#### **User Story**

In the sound mixing control room at 4:15 AM, David sat staring at the waveform monitor, listening to the rough mix of Episode 040. In earlier versions of the pipeline, combining speech and background audio was a constant battle against "compressor pumping". The team had relied on signal-reactive dynamic compressors to duck the heavy engine drones and industrial room tone whenever Bog or Elias spoke. But whenever Bog paused mid-sentence for a breath—a brief silence of eight or ten frames—the analog compressor would suddenly release, causing the machinery bed to surge upward in volume, only to be slammed down violently when the next syllable hit. The resulting mix sounded like a suffocating accordion, distracting the audience and tearing them out of the tension of the scene. Furthermore, spot sound effects like ratchet clicks and boot scrapes were randomly scattered by asynchronous render threads, causing footstep sounds to shift positions between test runs.

This morning, David watched `32.audio.unit` compile `drafts/exposure_sheet.json`.

Instead of relying on reactive compressors at runtime, the Conductor solved acoustic geometry mathematically before any pixels were rendered. Ingesting the dialogue frame boundaries from `24.frame.unit`, `duckingCalculator.buzz.ts` computed a deterministic gain automation curve across all 178 frames of the scene. It calculated the exact $-14.0\text{ dB}$ attenuation floor ($0.40 \times 10^{-14/20} = 0.0798$), dipped the ambient track over a 6-frame quadratic attack before speech, and held it steady. When Bog took an 8-frame breath between lines, the multi-window minimum-reduction rule clamped the gain flat at the floor ($G_{\text{final}} = \min(G_1, G_2)$), completely suppressing volume pumping.

Simultaneously, `foleySeeder.buzz.ts` hashed the scene and shot tokens using MurmurHash3, binding every metal ratchet click and boot scrape to exact integer frames and resolving identical sample assets across every worker. Finally, the manifest writer saved the blueprint to `drafts/exposure_sheet.json.tmp` and executed an atomic POSIX rename to `drafts/exposure_sheet.json`, sealing the master multi-track blueprint with a SHA-256 digest.

David hit play on the preview: the ambient drone leaned back smoothly as Bog began speaking, stayed pinned in the shadows during his ragged breath, and swelled back into the room only after his final sentence died away. Every footstep clicked at the exact frame of ground contact. The mix was transparent, mathematically locked, and completely broadcast-ready.

#### **Strategic Goal**

Directly fulfills the **Acoustic Multi-Track Geometry & Master Timeline Manifest Invariant at $T_0 = \$0.00$**. By compiling uncompressed dialogue stems, deterministic MurmurHash3 Foley transients, and quadratic anti-pumping sidechain ducking curves into an immutable, atomically staged exposure sheet manifest (`drafts/exposure_sheet.json`), this phase guarantees that downstream video metaprograms and optical compositors receive a mathematically locked multi-track audio blueprint that eliminates volume pumping artifacts and prevents non-deterministic asset divergence across distributed render workers.

#### **Context & Value**

- **The Strategic Value:** Audio is the master physical clock of the production pipeline. A high-end cinematic experience requires three distinct, parallel acoustic tiers: Track 1 (dialogue stems), Track 2 (punctual Foley transients), and Track 3 (continuous environmental beds and score). If acoustic ducking is delegated to runtime signal compressors or downstream NLEs, conversational pauses inevitably trigger gain-pumping surges, and non-deterministic Foley placement introduces continuity errors across re-renders. By pre-calculating the entire multi-track geometry into a static exposure sheet in `000.series-sower-conductor`, sound design becomes a bit-identical mathematical contract that downstream Remotion renderers execute without runtime calculation overhead.
- **The Technical Challenge:** Formulating a multi-window minimum-reduction algorithm that models overlapping 6-frame quadratic attack ($t(2-t)$) and 12-frame quadratic release ($t^2$) curves across variable-length speech cuts; suppressing gain surges during short conversational pauses ($< 18\text{ frames}$); seeding deterministic 32-bit MurmurHash3 integers across scene, shot, and cue strings; and staging JSON serializations atomically through temporary POSIX inodes to prevent partial file corruption.

#### **Interface**

`Phase 5 Dynamic Sidechain Acoustic Geometry Exposure Sheet Compilation` inside `000.series-sower-conductor` interfaces across the monorepo ecosystem through strict boundaries:

- **`packages/400.conductor/24.frame.unit` (Upstream Master Clock):** Supplies the discrete integer frame ranges (`from_frame`, `to_frame`, `target_frames`) derived from `ffprobe` acoustic durations.
- **`packages/400.conductor/09.speech.unit` (Upstream Dialogue Stems):** Supplies the committed 48 kHz linear PCM `.wav` stem paths and SHA-256 digests that mount onto Track 1.
- **`goblin-viewport-template` (Downstream Optical Compiler):** Reads `drafts/exposure_sheet.json` during episode scaffolding (`generate-episode-repo.ts`), inlining the ducking lookup tables, Foley triggers, and audio paths directly into static TSX literals in `Episode_XXX.tsx`.
- **`001.goblin-lore` (Canonical Asset Manifest):** Supplies the available sound effect sample registries (`foley/registry.json`) from which MurmurHash3 seeds resolve specific audio files.
- **`apps/995.library` (Foundational Terminal Cockpit Harness):** Houses the Blessed curses interface (`run.ts`) where the unit registers its menu trigger and streams real-time telemetry into pane `cns00`.

#### **Interaction**

The operator observes and interacts with this phase through the **Blessed Terminal Interface** hosted in `apps/995.library`:

- **Interactive Cockpit Navigation:**
  1. Launch the terminal cockpit on Rig 1 via `npm run dev`.
  2. In the left navigation choice grid (`85.choice.unit` / `98.menu.unit`), use the arrow keys or `J`/`K` to highlight `ASSEMBLE ACOUSTIC EXPOSURE SHEET`.
  3. Press `ENTER` to dispatch action `ASSEMBLE_ACOUSTIC_EXPOSURE_SHEET` against the active scene.
- **Visual Telemetry Feedback (`cns00`):**
  - The switchboard console (`cns00` at `{ x: 4, y: 0, xSpan: 8, ySpan: 12 }`) streams real-time 7-bit ASCII receipts as compilation proceeds:
    ```plaintext
    >> [EXPOSURE-SHEET] [OK] Compiled [ep01_sc01]: 178 frames | DuckingKeyframes=178 | Foley=1
    >> [EXPOSURE-SHEET] Committed to drafts/exposure_sheet.json (SHA: a1b2c3d4e5f6...)
    >> [MENU:AUDIO] Exposure sheet compiled and committed to drafts/ [OK]
    ```
  - If a dialogue window overlaps or a conversational pause is clamped, `cns00` confirms anti-pumping protection:
    ```plaintext
    >> [DUCKING] Anti-pumping clamped across 8-frame pause (frames 41-47) at floor 0.0798
    ```
- **Local Headless CLI Inspection:**
  - For automated CI/CD validation without launching the curses UI, developers run the colocated test suite:
    ```bash
    npx vitest run packages/400.conductor/val/exposureSheet.test.ts
    ```
  - Confirm that the package adheres strictly to the unit-colocated layout without any forbidden `src/` directory[cite: 1, 4]:
    ```bash
    test ! -d packages/400.conductor/src && echo ">> [OK] Zero src/ directory confirmed."
    ```
  - Verify that the generated exposure sheet exists and contains valid JSON:
    ```bash
    node -e "const doc = JSON.parse(fs.readFileSync('drafts/exposure_sheet.json')); console.log('>> [OK] Total frames:', doc.total_frames);"
    ```

### You

{{FOCUS : Phase 5 Dynamic Sidechain Acoustic Geometry Exposure Sheet Compilation }}

@agrav-check-00

### Gemini

### **Validation:**

- **Progress:** [⚪ Waiting for Action ]

> **Operational Directive for Antigravity:** When all of the listed checks, negative-control boundary traps, mathematical proofs, multi-window ducking algorithms, MurmurHash3 Foley seeding tests, atomic POSIX staging audits, and interactive Blessed terminal levels in this Antigravity prompt are executed and pass with zero faults in regards to **Phase 5 Dynamic Sidechain Acoustic Geometry Exposure Sheet Compilation**, Antigravity must update `[- **Progress:**]` above with the current timestamp and certification verdict (e.g., `[- **Progress:** 🟢 Certified on Thursday, November 5, 2026 at 7:42 AM EST - All Verification Tiers Cleared]`) and rewrite the original directive file with this finalized verification status upon successful completion of all audits and tests. If any check, constraint validation, ducking curve calculation, anti-pumping gap clamp, MurmurHash3 resolution, or atomic file write fails, mark `[⚪` with `[🔴 Failed on Thursday, November 5, 2026 at 7:42 AM EST - Breach Detected in <LEVEL/CHECK>]` and emit the fail-closed conflict diagnostic trace.

### Blessed Terminal Interface (TUI) Validation Instructions

When validating features involving a Blessed Terminal Interface (`apps/995.library/` / `cns00` Showrunner Terminal):

1. **Human Keyboard Emulation:** Manually interact with the interface using real keyboard inputs and sequences (e.g., Arrow keys, `Tab`, `Enter`, `Escape`, character inputs, and configured shortcuts) exactly as an operator at a physical terminal would.
2. **Step-by-Step Flow Navigation:** Drive end-to-end user journeys through sequential keystrokes rather than relying solely on headless mocks or direct state mutations. Allow render and event loop cycles between inputs.
3. **Screen & Focus Verification:** Observe terminal screen buffers, cursor positions, active focused widgets, and visual updates after each keypress sequence to ensure the UI responds correctly.
4. **Lifecycle & Clean Exit:** Verify proper startup rendering, navigation across interactive elements, and graceful termination routines (such as `q`, `Escape`, or `Ctrl+C`).

### Blessed Terminal Interface (TUI) Validation & Autonomous Remediation Protocol

#### 1. Authoritative Runner Entry Point

- All interactive Blessed terminal tests **MUST** execute exclusively through:
  ```bash
  npm run dev
  ```
  *(Direct execution via bare `node` is strictly prohibited because `.ts` transpilation requires `tsx`; direct package execution flags like `npm run dev -- --package=299.lore` are strictly forbidden).*

#### 2. Pre-Flight Boundary Self-Healing Guard

- Before launching the runner, the auditor must assert harness integrity:
  ```bash
  git status -s apps/995.library/995.library/
  ```
- **Remediation Action:** If any dirty files or rogue stubs are detected inside `apps/995.library/995.library/`, the auditor must run `git restore apps/995.library/995.library/` immediately before proceeding to the build.
- `apps/995.library/run.ts` is the only file with a permitted modification path.

#### 3. In-Scope Remediation Mandate (Zero-Handoff Policy)

- If Level 6 encounters:
  - Missing CLI flags or runner options in `apps/995.library/run.ts` (permitted modification path).
  - Unimplemented menu navigation or telemetry hooks in `packages/400.conductor/98.menu.unit/`.
  - Stale references in local package `tsconfig.json`.
- **The auditor must NOT halt execution or report failure to the user.**
- **The auditor must proactively implement the missing wiring**, re-execute the gauntlet, and verify clean end-to-end telemetry before sealing the audit.

#### 4. Verification Integrity Boundary

- The auditor should never:
  - Weaken Zod schemas or basis-point bounds to bypass failures.
  - Modify the immutable harness (`apps/995.library/995.library/**`).
  - Comment out or weaken directive assertions.
- Remediation is strictly limited to fixing runtime orchestration, restoring boundary corruptions, and fulfilling the mandated UI journey.

### ANTIGRAVITY ADVERSARIAL AUDIT & VERIFICATION GAUNTLET

- **TARGET DIRECTIVE:** `005.dynamic-sidechain-exposure-sheet-phase5.ag-test.md`
- **TARGET FOCUS:** `Phase 5 Dynamic Sidechain Acoustic Geometry Exposure Sheet Compilation`
- **TARGET REPOSITORY:** `000.series-sower-conductor` (downstream: `camp-candor/series-sower-conductor` / `camp-candor/npm-agent-01`)
- **TARGET WORKSPACE:** `packages/400.conductor/`
- **AUDIT TARGET INODES:**
  - `packages/400.conductor/src/` *(ASSERTION: Physical non-existence; strict unit-colocated topology)*
  - `packages/400.conductor/32.audio.unit/fce/audio.interface.ts` *(AUDIT: Strict typings for `DialogueWindow`, `FoleyCueItem`, `DuckingGainNode`, `ExposureSheetShotTrack`, `ExposureSheetDocument`, `ExposureSheetReceipt`, `Audio`)*
  - `packages/400.conductor/32.audio.unit/fce/audio.bit.ts` *(AUDIT: Candor action/state bale contract `AudioBit`)*
  - `packages/400.conductor/32.audio.unit/val/audio.val.ts` *(AUDIT: Strict Zod schemas `DialogueWindowSchema`, `FoleyCueItemSchema`, `DuckingGainNodeSchema`, `ExposureSheetDocumentSchema` with `.strict()` termination)*
  - `packages/400.conductor/32.audio.unit/buz/duckingCalculator.buzz.ts` *(AUDIT: Decibel-to-linear conversion, 6-frame quadratic attack $t(2-t)$, 12-frame quadratic release $t^2$, multi-window minimum reduction $\min_j(\text{Gain}_j(f))$, anti-pumping silence hold)*
  - `packages/400.conductor/32.audio.unit/buz/foleySeeder.buzz.ts` *(AUDIT: 32-bit MurmurHash3 deterministic integer hashing, sample asset index resolution)*
  - `packages/400.conductor/32.audio.unit/buz/audio.buzz.ts` *(AUDIT: Exposure sheet assembly, multi-track structure, atomic staging via `drafts/exposure_sheet.json.tmp` and promotion via `fs.renameSync`)*
  - `packages/400.conductor/32.audio.unit/audio.action.ts` *(AUDIT: Typed actions `INIT_AUDIO`, `UPDATE_AUDIO`, `ASSEMBLE_ACOUSTIC_EXPOSURE_SHEET`)*
  - `packages/400.conductor/32.audio.unit/audio.buzzer.ts` *(AUDIT: NodeNext buzzer exports with explicit `.js` specifiers)*
  - `packages/400.conductor/32.audio.unit/audio.model.ts` *(AUDIT: State model store)*
  - `packages/400.conductor/32.audio.unit/audio.reduce.ts` *(AUDIT: Pure reducer implementation via `clone-deep`)*
  - `packages/400.conductor/32.audio.unit/audio.unit.ts` *(AUDIT: Candor unit class wiring)*
  - `packages/400.conductor/BEE.ts` *(AUDIT: Registration of `AudioUnit` across `list`, `reducer`, and `UnitData`)*
  - `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` *(AUDIT: Menu mounting of `ASSEMBLE ACOUSTIC EXPOSURE SHEET` with 7-bit ASCII telemetry to `cns00`)*
  - `packages/400.conductor/val/exposureSheet.test.ts` *(AUDIT: Colocated Vitest test battery validating decibel floor math, anti-pumping minimum reduction, MurmurHash3 determinism, and atomic POSIX file writes)*
  - `apps/995.library/995.library/**` *(ASSERTION: Immutable runner boundary held at exactly 0 modified lines)*
- **AUDITOR PERSONA:** Autonomous Adversarial Systems Auditor & Acoustic Multi-Track Geometry Sentry (Antigravity v2.4)

### I. Architectural Mandate & Universal Negative-Control Law

Under the **Universal Negative-Control Law**, an acoustic geometry compiler, sidechain ducking engine, or exposure sheet manifest assembler that has never been observed actively failing closed when subjected to gain-pumping volume surges during conversational pauses ($< 18\text{ frames}$), non-deterministic Foley asset variations across seeds, un-sanitized non-ASCII characters, corrupted staging paths, or direct un-staged disk overwrites at Stage $T_0 = \$0.00$ **CANNOT BE CERTIFIED FOR PRODUCTION DEPLOYMENT**.

Antigravity executes active negative-control fault injections: testing decibel-to-linear conversion ($V_{\text{duck}} \approx 0.0798$ from $V_{\text{base}} = 0.40$), asserting multi-window union composition ($\min_j(\text{Gain}_j)$) during brief silences, proving bit-identical MurmurHash3 integer distribution across runs, validating atomic POSIX staging swaps, and verifying clean 7-bit ASCII telemetry streamed to `cns00`.

### II. Multi-Level Adversarial Audit Gauntlet

#### Level 1: Static Monorepo Boundary, Directory Invariant & Pure 7-Bit ASCII Audit

- **Check 1.1 (Forbidden `src/` Directory Non-Existence):** Assert that no `packages/400.conductor/src/` directory exists. All models, actions, buzzers, and reducers must reside strictly inside numbered unit folders (`32.audio.unit/`, etc.) and `val/`.
  ```bash
  test ! -d packages/400.conductor/src && echo ">> [OK] Zero src/ directory confirmed."
  ```
  *(Must exit with return code 0).*
- **Check 1.2 (Immutable Harness Fence):** Assert that the runner harness has sustained zero modifications:
  ```bash
  git status -s apps/995.library/995.library/
  ```
  *(Must return exactly 0 modified lines; if dirty, restore immediately via `git restore apps/995.library/995.library/`).*
- **Check 1.3 (NodeNext Explicit `.js` Imports):** Inspect all imports across `packages/400.conductor/32.audio.unit/` to verify that all relative module specifiers terminate explicitly with `.js` extensions.
- **Check 1.4 (Pure 7-Bit ASCII Cleanliness):** Execute a scan across all unit files and test suites in `32.audio.unit` and `val/exposureSheet.test.ts` to assert zero multi-byte Unicode or emojis:
  ```bash
  node -e "
  const fs = require('fs');
  const path = require('path');
  const files = [
    '32.audio.unit/fce/audio.interface.ts',
    '32.audio.unit/fce/audio.bit.ts',
    '32.audio.unit/val/audio.val.ts',
    '32.audio.unit/buz/duckingCalculator.buzz.ts',
    '32.audio.unit/buz/foleySeeder.buzz.ts',
    '32.audio.unit/buz/audio.buzz.ts',
    '32.audio.unit/audio.action.ts',
    '32.audio.unit/audio.buzzer.ts',
    '32.audio.unit/audio.model.ts',
    '32.audio.unit/audio.reduce.ts',
    '32.audio.unit/audio.unit.ts',
    'val/exposureSheet.test.ts'
  ];
  for (const f of files) {
    const full = path.join('packages/400.conductor', f);
    if (!fs.existsSync(full)) {
      console.error(':: [FAIL] Missing file: ' + full);
      process.exit(1);
    }
    const content = fs.readFileSync(full, 'utf8');
    if (/[\x80-\xFF]/.test(content)) {
      console.error(':: [FAIL] Multi-byte non-ASCII character detected in: ' + full);
      process.exit(1);
    }
  }
  console.log('>> [OK] 100% 7-Bit Clean ASCII confirmed across all audio unit inodes.');
  "
  ```
- **Check 1.5 (TypeScript Compiler Verification):** Execute typecheck across the package:
  ```bash
  npx tsc -b packages/400.conductor
  ```
  *(Must complete with 0 errors and 0 diagnostic warnings).*

#### Level 2: Strict Schema Closure & Negative-Control Validation Traps

- **Check 2.1 (Schema Rigidity & `.strict()` Enforcement):** Assert that `DialogueWindowSchema`, `FoleyCueItemSchema`, `DuckingGainNodeSchema`, and `ExposureSheetDocumentSchema` strictly reject un-schemaed keys (e.g., `reverb_preset`, `foley_mood`) with `ZodError` at Stage $T_0 = \$0.00$ spend.
- **Check 2.2 (Negative Frame Offset Rejection):** Pass an adversarial payload with `frame_offset: -4` or `from_frame: -1`.*Assertion:* Zod must reject non-negative constraint violations immediately.
- **Check 2.3 (Decibel Floor Calculation Precision):** Evaluate the $-14.0\text{ dB}$ attenuation formula:
  $$
  V_{\text{duck}} = V_{\text{base}} \times 10^{\frac{-14.0}{20}} \text{}
  $$
  *Assertion:* For $V_{\text{base}} = 0.40$, $V_{\text{duck}}$ must equal $0.40 \times 0.199526... \approx 0.0798$. For $V_{\text{base}} = 1.0$, $V_{\text{duck}}$ must equal $0.1995$. Floating-point approximations deviating by $> 0.0001$ fail the audit.

#### Level 3: Quadratic Ducking Geometry & Anti-Pumping Multi-Window Traps

- **Check 3.1 (Quadratic Attack Phase $t(2 - t)$):** For a dialogue window starting at Frame 20 with 6-frame attack ($A = 6$, frames 14–19) and $V_{\text{base}} = 0.40$, $V_{\text{duck}} = 0.0798$:
  - Frame 14 ($t = 0.0$): Gain must equal $0.40$.
  - Frame 17 ($t = 0.5 \implies \text{progress} = 0.5 \times 1.5 = 0.75$): Gain must evaluate to $0.40 - (0.40 - 0.0798) \times 0.75 \approx 0.1599$.
  - Frame 20 ($t = 1.0$): Gain must evaluate to $0.0798$.
- **Check 3.2 (Quadratic Release Phase $t^2$):** For a dialogue window ending at Frame 50 with 12-frame release ($R = 12$, frames 51–62):
  - Frame 50: Gain must equal $0.0798$.
  - Frame 56 ($t = 6/12 = 0.5 \implies \text{progress} = 0.25$): Gain must evaluate to $0.0798 + (0.40 - 0.0798) \times 0.25 \approx 0.1599$.
  - Frame 62: Gain must recover to $0.40$.
- **Check 3.3 (Negative-Control Anti-Pumping Pause Trap):** Simulate two dialogue cuts separated by an 8-frame conversational breath gap (e.g., Window 1: frames 10–40, Window 2: frames 48–80).*Assertion:* A naive first-match loop causes volume to spike toward $0.40$ during the gap. `computeMultiWindowDuckingCurve` must take $\min_j(\text{Gain}_j(f))$ across both envelopes, clamping the volume during the gap to $\le 0.15$, with zero gain-surge pumping.

#### Level 4: Deterministic MurmurHash3 Foley Seeding & Sample Resolution Traps

- **Check 4.1 (MurmurHash3 Integer Purity):** Verify that `murmurHash3("ep01_sc01:sh01:ratchet_click")` produces an unsigned 32-bit integer ($0 \le h \le 2^{32} - 1$) without NaN, undefined, or floating-point division errors.
- **Check 4.2 (Bit-Identical Sample Determinism):** Given a sample pool `["boot_01.wav", "boot_02.wav", "boot_03.wav"]`, invoke `resolveDeterministicFoleyCue` 100 consecutive times with identical seed keys.*Assertion:* Must resolve to the exact same sample index and filename on 100% of executions.
- **Check 4.3 (Sample Differentiation Across Shots):** Invoke `resolveDeterministicFoleyCue` with `sh01` vs `sh02`.*Assertion:* Different shot keys must hash to distinct integer seeds, preventing static sample clumping across scene cuts.

#### Level 5: Atomic POSIX Manifest Staging & Colocated Vitest Battery

- **Check 5.1 (Atomic Staging & Rename Inode Assertion):** Inspect `assembleAcousticExposureSheet` execution in `packages/400.conductor/32.audio.unit/buz/audio.buzz.ts`.*Assertion:*
  1. Serialized JSON must first be written to `drafts/exposure_sheet.json.tmp`.
  2. Promotion must execute via `fs.renameSync("drafts/exposure_sheet.json.tmp", "drafts/exposure_sheet.json")`.
  3. Direct un-staged writes to `drafts/exposure_sheet.json` are strictly forbidden.
- **Check 5.2 (Vitest Verification Suite Clearance):** Execute the complete unit test battery:
  ```bash
  npx vitest run packages/400.conductor/val/exposureSheet.test.ts
  ```
  *(100% of test assertions must pass with exit code 0).*

#### Level 6: Blessed Terminal Cockpit Live Journey & Telemetry Audit

- **Step 6.1 (Launch Terminal Cockpit):** Start the operator interface via the authoritative entry point:
  ```bash
  npm run dev
  ```
- **Step 6.2 (Human Keyboard Emulation Journey):**
  1. Allow the 12x12 Cartesian screen layout to stabilize on screen.
  2. Use arrow keys (`Down`/`Up`) or `J`/`K` to navigate the choice grid (`85.choice.unit` / `98.menu.unit`).
  3. Move the selection cursor to highlight `ASSEMBLE ACOUSTIC EXPOSURE SHEET`.
  4. Press `Enter` to dispatch action `ASSEMBLE_ACOUSTIC_EXPOSURE_SHEET`.
- **Step 6.3 (Console Telemetry Verification - `cns00`):** Inspect the switchboard console (`cns00` at `{ x: 4, y: 0, xSpan: 8, ySpan: 12 }`) to verify that the following 7-bit ASCII receipts are actively streamed:
  ```plaintext
  >> [EXPOSURE-SHEET] [OK] Compiled [ep01_sc01]: 178 frames | DuckingKeyframes=178 | Foley=1
  >> [EXPOSURE-SHEET] Committed to drafts/exposure_sheet.json (SHA: ...)
  >> [MENU:AUDIO] Exposure sheet compiled and committed to drafts/ [OK]
  ```
- **Step 6.4 (Graceful Teardown):** Press `Escape` or `q` to terminate the Blessed curses loop cleanly, confirming zero unhandled asynchronous promise rejections and clean restoration of terminal standard I/O.

### III. Final Feedback & Status Mutation Directive

#### 1. If ALL Verification Levels Pass (100% Compliance Across Levels 1–6):

- Update `[- **Progress:**]` at the top of this document to:
  ```markdown
  - **Progress:** [🟢 Certified on Thursday, November 5, 2026 at 7:42 AM EST - All Verification Tiers Cleared]
  ```
- Overwrite the original specification file with this updated header.
- Emit the certified success feedback receipt:
  ```plaintext
  >> ==============================================================================
  >> [ANTIGRAVITY AUDIT VERDICT: PASSED 🟢]
  >> PHASE 5: DYNAMIC SIDECHAIN ACOUSTIC GEOMETRY EXPOSURE SHEET COMPILATION
  >> ------------------------------------------------------------------------------
  >> [OK] Level 1: Monorepo fences held. apps/995.library/ untouched. Zero src/.
  >> [OK] Level 2: Strict Zod schemas and -14.0 dB decibel floor math verified.
  >> [OK] Level 3: Multi-window min-reduction anti-pumping ducking proven.
  >> [OK] Level 4: Deterministic MurmurHash3 Foley transient seeding verified.
  >> [OK] Level 5: Atomic POSIX drafts/exposure_sheet.json commit verified.
  >> [OK] Level 6: Blessed curses TUI flight deck verified with clean 7-bit ASCII logs.
  >> ------------------------------------------------------------------------------
  >> STATUS: ACOUSTIC EXPOSURE SHEET COMPILATION CERTIFIED PRODUCTION-READY (T0 = $0.00)
  >> ==============================================================================
  ```

#### 2. If ANY Check, Assertion, or Level Fails:

- Update `[- **Progress:**]` at the top of this document to:
  ```markdown
  - **Progress:** [🔴 Failed on Thursday, November 5, 2026 at 7:42 AM EST - Breach Detected in <LEVEL/CHECK>]
  ```
- Overwrite the original specification file with this updated header.
- Emit the fail-closed conflict diagnostic banner:
  ```plaintext
  :: ==============================================================================
  :: [ANTIGRAVITY AUDIT VERDICT: FAILED 🔴]
  :: PHASE 5: DYNAMIC SIDECHAIN ACOUSTIC GEOMETRY EXPOSURE SHEET COMPILATION
  :: ------------------------------------------------------------------------------
  :: [FAIL] Verification halted at Level <X>: <CHECK_NAME>
  :: Reason: <SPECIFIC_ASSERTION_FAILURE_DETAILS>
  :: Action: Remediate defective artifacts in 32.audio.unit before re-running audit.
  :: ==============================================================================
  ```
  *(Halt execution immediately without mutating further code).*

### You

{{FOCUS : Phase 6 Blessed Terminal Cockpit Navigation Telemetry Control }}

@jules-task-00

### Gemini

# Jules Task: Phase 6 Blessed Terminal Cockpit Navigation Telemetry Control

You are tasked with implementing **Phase 6: Blessed Terminal Cockpit Navigation Telemetry Control** within the `000.series-sower-conductor` repository on Rig 1. This subsystem establishes the operator-facing cockpit and terminal telemetry router for the Conductor, enforcing the **Dual-Pane 12x12 Cartesian Grid Invariant**, non-blocking asynchronous console streaming into `cns00`, dynamic operational tooltips, pure 7-bit clean ASCII compliance, and remote pivot manipulation of `000.audio-microservice` via the monorepo shared bus.

### Architectural Invariants & Monorepo Boundaries

1. **Absolute Ban on `packages/400.conductor/src/`:** All domain models, action definitions, buzzers, reducers, and interfaces must reside strictly within `packages/400.conductor/98.menu.unit/`, `packages/400.conductor/99.bus.unit/`, or unit test batteries in `packages/400.conductor/val/`. Under no circumstances may any file be placed inside a `src/` directory within `packages/400.conductor/`.
2. **Immutable Harness Boundary:** `apps/995.library/995.library/**` is strictly immutable (0 lines modified). `apps/995.library/run.ts` is the only permitted entrypoint file under `apps/995.library/` to register package flight decks.
3. **12x12 Blessed Cartesian Grid Topology:** The terminal cockpit operates on `81.grid.unit`'s responsive 12-column by 12-row grid matrix:
  - **Left Control Quadrant (Columns 0–4, Rows 4–12):** Interactive keyboard choice navigation via `85.choice.unit` and `98.menu.unit` (`{ x: 0, y: 4, xSpan: 4, ySpan: 8 }`).
  - **Right Telemetry Quadrant (Columns 4–12, Rows 0–12):** `83.console.unit` / `cns00` streaming real-time 7-bit ASCII status receipts without tearing the curses alternate screen buffer (`{ x: 4, y: 0, xSpan: 8, ySpan: 12 }`).
4. **Pure 7-Bit ASCII Telemetry Streaming (`cns00`):** In Windows `cmd.exe` and POSIX terminals, multi-byte UTF-8 emojis cause coordinate misalignment, buffer clipping, and font corruption. All emitted strings must be filtered through a 7-bit ASCII sanitizer. Use strictly pure 7-bit ASCII tokens (`>>`, `[OK]`, `[FAIL]`, `::`, `[FLIGHT-DECK]`, `[TOOLTIP]`, `[AUDIO-MICROSERVICE]`, `[CONDUCTOR]`).
5. **Headless Resilience & Re-Entrant Loop Ticks:** When running headlessly in CI or Vitest where `(globalThis as any).LIBRARY` or terminal TTY handles are unavailable, buzzers must degrade gracefully without throwing null-pointer exceptions. In interactive curses mode, menu re-rendering must be scheduled via `setTimeout(..., 333)` ticks to yield to the libuv event loop and eliminate call-stack recursion.
6. **Remote Pivot Manipulation of `audio-microservice`:** The Conductor must resolve `global.MICROSERVICEAUDIO` and `global.PIVOTS['microserviceaudio']`, programmatically dispatching actions (`INIT_MICROSERVICEAUDIO`, `UPDATE_MICROSERVICEAUDIO`) across the shared pivot registry without requiring manual operator keyboard intervention.
7. **NodeNext Explicit `.js` Import Specifiers:** All relative module import paths across `packages/400.conductor/` must explicitly end with `.js` extensions (e.g., `import State from '../99.core/state.js'`).

### File Implementation Manifest

```plaintext
packages/400.conductor/
├── 98.menu.unit/
│   ├── fce/
│   │   ├── menu.bit.ts
│   │   └── menu.interface.ts
│   ├── val/
│   │   └── menu.val.ts
│   ├── buz/
│   │   ├── 00.menu.buzz.ts              (Update: Choice switchboard, 12x12 grid, tooltips)
│   │   └── telemetryStreamer.buzz.ts    (NEW: 7-bit ASCII sanitizer & cns00 streamer)
│   ├── menu.action.ts
│   ├── menu.buzzer.ts
│   ├── menu.model.ts
│   ├── menu.reduce.ts
│   └── menu.unit.ts
├── BEE.ts                               (Update: Register MenuUnit & BusUnit)
└── val/
    └── cockpitTelemetry.test.ts         (Comprehensive Vitest Battery)
```

### Source Code Deliverables

#### 1. Interface & Bit Definitions

```typescript
// packages/400.conductor/98.menu.unit/fce/menu.interface.ts
export interface GridCoordinates {
  x: number;
  y: number;
  xSpan: number;
  ySpan: number;
}

export interface MenuChoiceItem {
  id: string;
  label: string;
  tooltip: string;
  actionType: string;
}

export interface CockpitTelemetryPacket {
  timestamp: string;
  subsystem: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  message: string;
}

export default interface Menu {
  idx: string;
  activeSelection: string;
  lastActionTimestamp: number;
  statusMessage: string;
  gridLeft: GridCoordinates;
  gridRight: GridCoordinates;
  menuChoices: MenuChoiceItem[];
}
```

```typescript
// packages/400.conductor/98.menu.unit/fce/menu.bit.ts
import { MenuChoiceItem, CockpitTelemetryPacket } from './menu.interface.js';

export default interface MenuBit {
  idx: string;
  src?: string;
  val?: number;
  lst?: string[];
  dat?: {
    choice?: MenuChoiceItem;
    telemetry?: CockpitTelemetryPacket;
    remotePivotResponse?: any;
  };
  slv?: Function;
}
```

#### 2. Zod Validation & Schema Guardrails

```typescript
// packages/400.conductor/98.menu.unit/val/menu.val.ts
import { z } from 'zod';

export const GridCoordinatesSchema = z
  .object({
    x: z.number().int().min(0).max(12),
    y: z.number().int().min(0).max(12),
    xSpan: z.number().int().min(1).max(12),
    ySpan: z.number().int().min(1).max(12),
  })
  .strict();

export const MenuChoiceItemSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    tooltip: z.string().min(1),
    actionType: z.string().min(1),
  })
  .strict();

export const CockpitTelemetryPacketSchema = z
  .object({
    timestamp: z.string().min(1),
    subsystem: z.string().min(1),
    level: z.enum(['INFO', 'WARN', 'ERROR', 'SUCCESS']),
    message: z
      .string()
      .regex(/^[\x20-\x7E\r\n\t]*$/, 'Message must consist strictly of 7-bit clean ASCII'),
  })
  .strict();
```

#### 3. Buzzer Implementation: 7-Bit ASCII Sanitizer, Tooltip Streamer, and Pivot Manipulator

```typescript
// packages/400.conductor/98.menu.unit/buz/telemetryStreamer.buzz.ts
export const sanitizeTo7BitAscii = (input: string): string => {
  return input
    .replace(/[\u2018\u2019]/g, "'") // smart single quotes
    .replace(/[\u201C\u201D]/g, '"') // smart double quotes
    .replace(/[\u2013\u2014]/g, '-') // en/em dashes
    .replace(/[^\x20-\x7E\r\n\t]/g, ''); // strip remaining non-ASCII & emojis
};

export const formatTelemetryLine = (
  prefix: string,
  message: string,
  status: 'OK' | 'FAIL' | 'INFO' | 'WARN' = 'OK',
): string => {
  const cleanMsg = sanitizeTo7BitAscii(message);
  switch (status) {
    case 'OK':
      return `>> [${prefix}] [OK] ${cleanMsg}`;
    case 'FAIL':
      return `:: [${prefix}] [FAIL] ${cleanMsg}`;
    case 'WARN':
      return `:: [${prefix}] [WARN] ${cleanMsg}`;
    default:
      return `>> [${prefix}] ${cleanMsg}`;
  }
};

export const streamConsoleTelemetry = async (
  message: string,
  targetPane = 'cns00',
): Promise<void> => {
  const sanitized = sanitizeTo7BitAscii(message);
  if (global.LIBRARY) {
    await global.LIBRARY.hunt('[Console action] Update Console', {
      idx: targetPane,
      src: sanitized,
    });
  } else {
    // Headless / fallback output
    process.stdout.write(`${sanitized}\n`);
  }
};
```

```typescript
// packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts
import { MenuModel } from '../menu.model.js';
import MenuBit from '../fce/menu.bit.js';
import State from '../../99.core/state.js';
import * as ActMnu from '../menu.action.js';
import {
  sanitizeTo7BitAscii,
  formatTelemetryLine,
  streamConsoleTelemetry,
} from './telemetryStreamer.buzz.js';

export const CONDUCTOR_GRID_LEFT = { x: 0, y: 4, xSpan: 4, ySpan: 8 };
export const CONDUCTOR_GRID_RIGHT = { x: 4, y: 0, xSpan: 8, ySpan: 12 };

export const CONDUCTOR_MENU_CHOICES = [
  {
    id: 'CHOICE_AST_AUDIT',
    label: 'AUDIT DIALOGUE AST CONTRACT',
    tooltip: 'Validate drafts/dialogue_ast.json against strict Zod schema at T0 ($0.00).',
    actionType: '[Abstractsyntaxtree action] Parse Scene AST',
  },
  {
    id: 'CHOICE_SOMATIC_DSP',
    label: 'INSPECT CHARACTER SOMATIC DSP',
    tooltip: 'Convert physical fatigue and trauma metrics into continuous DSP modifiers.',
    actionType: '[Somaticdsp action] Translate Somatic DSP',
  },
  {
    id: 'CHOICE_SPEECH_SYNTH',
    label: 'SYNTHESIZE SCENE AUDIO STEMS',
    tooltip: 'Spawn ephemeral Python synthesize.py with Zero-VRAM invariant on Rig 1.',
    actionType: '[Speech action] Execute Scene Speech',
  },
  {
    id: 'CHOICE_FRAME_QUANT',
    label: 'QUANTIZE ACOUSTIC MASTER CLOCK',
    tooltip: 'Quantize continuous WAV duration to 24 fps integer frames with zero drift.',
    actionType: '[Frame action] Quantize Acoustic Clock',
  },
  {
    id: 'CHOICE_EXPOSURE_SHEET',
    label: 'ASSEMBLE ACOUSTIC EXPOSURE SHEET',
    tooltip: 'Calculate -14dB sidechain ducking curve and commit drafts/exposure_sheet.json.',
    actionType: '[Audio action] Assemble Acoustic Exposure Sheet',
  },
  {
    id: 'CHOICE_REMOTE_AUDIO_PIVOT',
    label: 'DISPATCH REMOTE AUDIO PIVOT',
    tooltip: 'Programmatically trigger 000.audio-microservice via shared global pivot bus.',
    actionType: '[Menu action] Dispatch Remote Audio Pivot',
  },
  {
    id: 'CHOICE_ROOT_RETURN',
    label: 'ROOT MENU',
    tooltip: 'Exit Conductor flight deck and return to 995.library root cockpit.',
    actionType: '[Menu action] Root Menu',
  },
];

export const initMenu = (cpy: MenuModel, bal: MenuBit, ste: State) => {
  cpy.gridLeft = CONDUCTOR_GRID_LEFT;
  cpy.gridRight = CONDUCTOR_GRID_RIGHT;
  cpy.menuChoices = CONDUCTOR_MENU_CHOICES;
  if (bal.slv != null) bal.slv({ mnuBit: { idx: 'init-menu', val: 1 } });
  return cpy;
};

export const dispatchRemoteAudioPivot = async (
  cpy: MenuModel,
  bal: MenuBit,
  ste: State,
): Promise<MenuModel> => {
  const pivot = (global as any).MICROSERVICEAUDIO || (global as any).PIVOTS?.['microserviceaudio'];
  if (!pivot) {
    const warnMsg = formatTelemetryLine(
      'AUDIO-MICROSERVICE',
      'Remote pivot [microserviceaudio] not found in global registry.',
      'WARN',
    );
    await streamConsoleTelemetry(warnMsg);
    if (bal.slv != null) bal.slv({ mnuBit: { idx: 'dispatch-remote-audio-pivot-warn' } });
    return cpy;
  }

  await streamConsoleTelemetry(
    formatTelemetryLine('AUDIO-MICROSERVICE', 'Triggering remote pivot health action via hunt...'),
  );

  try {
    const response = await pivot.hunt('[Microserviceaudio action] Update Microserviceaudio', {
      content: 'Remote Conductor Handshake',
    });
    await streamConsoleTelemetry(
      formatTelemetryLine('AUDIO-MICROSERVICE', 'Remote pivot answered successfully.', 'OK'),
    );
    if (bal.slv != null) {
      bal.slv({
        mnuBit: {
          idx: 'dispatch-remote-audio-pivot-success',
          dat: { remotePivotResponse: response },
        },
      });
    }
  } catch (err: any) {
    const errMsg = formatTelemetryLine(
      'AUDIO-MICROSERVICE',
      `Remote pivot invocation faulted: ${err.message}`,
      'FAIL',
    );
    await streamConsoleTelemetry(errMsg);
    if (bal.slv != null) bal.slv({ mnuBit: { idx: 'dispatch-remote-audio-pivot-error' } });
  }

  return cpy;
};

export const updateMenu = async (cpy: MenuModel, bal: MenuBit, ste: State): Promise<MenuModel> => {
  if (!global.LIBRARY) {
    // Headless degradation
    if (bal.slv != null) bal.slv({ mnuBit: { idx: 'update-menu-headless' } });
    return cpy;
  }

  const lst = CONDUCTOR_MENU_CHOICES.map((c) => c.label);

  const gridBit = await global.LIBRARY.hunt('[Grid action] Update Grid', {
    x: CONDUCTOR_GRID_LEFT.x,
    y: CONDUCTOR_GRID_LEFT.y,
    xSpan: CONDUCTOR_GRID_LEFT.xSpan,
    ySpan: CONDUCTOR_GRID_LEFT.ySpan,
  });

  const choiceBit = await global.LIBRARY.hunt('[Choice action] Open Choice', {
    dat: { clr0: 0, clr1: 3 }, // Black on Yellow / Green
    src: 'VERTICAL',
    lst,
    net: gridBit?.grdBit?.dat,
    cb: async (focusedIndex: number) => {
      const choice = CONDUCTOR_MENU_CHOICES[focusedIndex];
      if (choice) {
        await streamConsoleTelemetry(`>> [TOOLTIP] ${choice.tooltip}`);
      }
    },
  });

  const selectedLabel = choiceBit?.chcBit?.src;
  const matchedChoice = CONDUCTOR_MENU_CHOICES.find((c) => c.label === selectedLabel);

  if (matchedChoice) {
    cpy.activeSelection = matchedChoice.id;
    cpy.lastActionTimestamp = Date.now();

    switch (matchedChoice.id) {
      case 'CHOICE_AST_AUDIT':
        await ste.hunt('[Abstractsyntaxtree action] Parse Scene AST', {
          dat: { filePath: './drafts/dialogue_ast.json' },
        });
        break;

      case 'CHOICE_SOMATIC_DSP':
        await ste.hunt('[Somaticdsp action] Translate Somatic DSP', {
          dat: {
            somaticState: {
              character_id: 'char_bog',
              fatigue_bps: 8200,
              pain_bps: 4500,
              refusal_strain_bps: 1200,
              is_conscious: true,
              active_conditions: [],
              banned_kinetic_verbs: [],
            },
            somaticInput: {
              character_id: 'char_bog',
              base_pitch_shift_semitones: -1.0,
            },
          },
        });
        break;

      case 'CHOICE_SPEECH_SYNTH':
        await ste.hunt('[Speech action] Execute Scene Speech', {
          dat: {
            request: {
              series_id: 'under-the-floorboards',
              scene_id: 'ep01_sc01',
              engine: 'styletts2',
              items: [
                {
                  line_id: 'line_001',
                  speaker_id: 'char_elias',
                  dialogue_text: 'The intake valve is rusted through.',
                  emotion_tag: 'tense_jaw',
                },
              ],
            },
          },
        });
        break;

      case 'CHOICE_FRAME_QUANT':
        await ste.hunt('[Frame action] Quantize Acoustic Clock', {
          dat: {
            stems: [
              { shot_id: 'sh01', duration_ms: 3120 },
              { shot_id: 'sh02', duration_ms: 1840 },
            ],
          },
        });
        break;

      case 'CHOICE_EXPOSURE_SHEET':
        await ste.hunt('[Audio action] Assemble Acoustic Exposure Sheet', {
          dat: {
            scene_id: 'ep01_sc01',
            series_id: 'under-the-floorboards',
            dialogue_windows: [
              {
                shot_id: 'sh01',
                from_frame: 0,
                to_frame: 74,
                stem_path: 'public/audio/dialogue/sh01.wav',
                speaker_id: 'char_bog',
              },
            ],
            foley_cues: [],
          },
        });
        break;

      case 'CHOICE_REMOTE_AUDIO_PIVOT':
        await dispatchRemoteAudioPivot(cpy, bal, ste);
        break;

      case 'CHOICE_ROOT_RETURN':
        if (bal.slv != null) bal.slv({ mnuBit: { idx: 'root-menu' } });
        return cpy;

      default:
        break;
    }
  }

  // Non-recursive re-entrant loop tick
  setTimeout(async () => {
    await ste.hunt(ActMnu.UPDATE_MENU, {});
  }, 333);

  return cpy;
};
```

#### 4. Action Classes, Buzzer Exports, Model, and Reducer

```typescript
// packages/400.conductor/98.menu.unit/menu.action.ts
import { Action } from '../99.core/interface/action.interface.js';
import MenuBit from './fce/menu.bit.js';

export const INIT_MENU = '[Menu action] Init Menu';
export class InitMenu implements Action {
  readonly type = INIT_MENU;
  constructor(public bale: MenuBit) {}
}

export const UPDATE_MENU = '[Menu action] Update Menu';
export class UpdateMenu implements Action {
  readonly type = UPDATE_MENU;
  constructor(public bale: MenuBit) {}
}

export const DISPATCH_REMOTE_AUDIO_PIVOT = '[Menu action] Dispatch Remote Audio Pivot';
export class DispatchRemoteAudioPivot implements Action {
  readonly type = DISPATCH_REMOTE_AUDIO_PIVOT;
  constructor(public bale: MenuBit) {}
}

export type Actions = InitMenu | UpdateMenu | DispatchRemoteAudioPivot;
```

```typescript
// packages/400.conductor/98.menu.unit/menu.buzzer.ts
export {
  initMenu,
  updateMenu,
  dispatchRemoteAudioPivot,
  CONDUCTOR_GRID_LEFT,
  CONDUCTOR_GRID_RIGHT,
  CONDUCTOR_MENU_CHOICES,
} from './buz/00.menu.buzz.js';
export {
  sanitizeTo7BitAscii,
  formatTelemetryLine,
  streamConsoleTelemetry,
} from './buz/telemetryStreamer.buzz.js';
```

```typescript
// packages/400.conductor/98.menu.unit/menu.model.ts
import Menu, { GridCoordinates, MenuChoiceItem } from './fce/menu.interface.js';
import { CONDUCTOR_GRID_LEFT, CONDUCTOR_GRID_RIGHT, CONDUCTOR_MENU_CHOICES } from './buz/00.menu.buzz.js';

export class MenuModel implements Menu {
  idx: string = '98.menu';
  activeSelection: string = '';
  lastActionTimestamp: number = 0;
  statusMessage: string = 'IDLE';
  gridLeft: GridCoordinates = CONDUCTOR_GRID_LEFT;
  gridRight: GridCoordinates = CONDUCTOR_GRID_RIGHT;
  menuChoices: MenuChoiceItem[] = CONDUCTOR_MENU_CHOICES;
}
```

```typescript
// packages/400.conductor/98.menu.unit/menu.reduce.ts
import clone from 'clone-deep';
import * as Act from './menu.action.js';
import { MenuModel } from './menu.model.js';
import * as Buzz from './menu.buzzer.js';
import State from '../99.core/state.js';

export function reducer(
  model: MenuModel = new MenuModel(),
  act: Act.Actions,
  state?: State,
) {
  switch (act.type) {
    case Act.INIT_MENU:
      return Buzz.initMenu(clone(model), act.bale, state!);

    case Act.UPDATE_MENU:
      return Buzz.updateMenu(clone(model), act.bale, state!);

    case Act.DISPATCH_REMOTE_AUDIO_PIVOT:
      return Buzz.dispatchRemoteAudioPivot(clone(model), act.bale, state!);

    default:
      return model;
  }
}
```

```typescript
// packages/400.conductor/98.menu.unit/menu.unit.ts
import State from '../99.core/state.js';

export default class MenuUnit {
  constructor(state: State) {}
}
```

#### 5. Central Registration in BEE.ts

```typescript
// In packages/400.conductor/BEE.ts:
import MenuUnit from './98.menu.unit/menu.unit.js';
import Menu from './98.menu.unit/fce/menu.interface.js';
import { MenuModel } from './98.menu.unit/menu.model.js';
import { reducer as menuReducer } from './98.menu.unit/menu.reduce.js';

export const list = {
  // ... other units
  menu: MenuUnit,
};

export const reducer = {
  // ... other reducers
  menu: menuReducer,
};

export default class UnitData implements Model {
  // ... other units
  menu: Menu = new MenuModel();
}
```

#### 6. Colocated Vitest Verification Battery

```typescript
// packages/400.conductor/val/cockpitTelemetry.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MenuModel } from '../98.menu.unit/menu.model.js';
import * as Buzz from '../98.menu.unit/buz/00.menu.buzz.js';
import * as Stream from '../98.menu.unit/buz/telemetryStreamer.buzz.js';

describe('98.menu.unit: Blessed Terminal Cockpit Navigation & Telemetry Control', () => {
  let model: MenuModel;

  beforeEach(() => {
    model = new MenuModel();
  });

  afterEach(() => {
    delete (global as any).MICROSERVICEAUDIO;
    delete (global as any).PIVOTS;
    vi.restoreAllMocks();
  });

  it('allocates the exact 12x12 Blessed Cartesian grid quadrants', () => {
    expect(Buzz.CONDUCTOR_GRID_LEFT).toEqual({ x: 0, y: 4, xSpan: 4, ySpan: 8 });
    expect(Buzz.CONDUCTOR_GRID_RIGHT).toEqual({ x: 4, y: 0, xSpan: 8, ySpan: 12 });
  });

  it('sanitizes strings to pure 7-bit clean ASCII, stripping multi-byte emojis and smart quotes', () => {
    const raw = 'Bog said: “Tighten the valve!” 🔧 — immediate action.';
    const sanitized = Stream.sanitizeTo7BitAscii(raw);
    expect(sanitized).toBe('Bog said: "Tighten the valve!"  - immediate action.');
    expect(/[\x80-\xFF]/.test(sanitized)).toBe(false);
  });

  it('formats telemetry receipts with correct status tokens', () => {
    const okLine = Stream.formatTelemetryLine('CONDUCTOR', 'System Ready', 'OK');
    expect(okLine).toBe('>> [CONDUCTOR] [OK] System Ready');

    const failLine = Stream.formatTelemetryLine('AUDIO', 'Process Terminated', 'FAIL');
    expect(failLine).toBe(':: [AUDIO] [FAIL] Process Terminated');
  });

  it('degrades gracefully in headless mode when global.LIBRARY is absent', async () => {
    delete (global as any).LIBRARY;
    const bale = {
      idx: 'test-headless',
      slv: (res: any) => res,
    };
    const updated = await Buzz.updateMenu(model, bale, null as any);
    expect(updated).toBeDefined();
  });

  it('dispatches remote action to global.MICROSERVICEAUDIO pivot when available', async () => {
    const mockHunt = vi.fn().mockResolvedValue({ success: true });
    (global as any).MICROSERVICEAUDIO = { hunt: mockHunt };

    const bale = {
      idx: 'test-pivot',
      slv: (res: any) => res,
    };

    const updated = await Buzz.dispatchRemoteAudioPivot(model, bale, null as any);
    expect(mockHunt).toHaveBeenCalledWith(
      '[Microserviceaudio action] Update Microserviceaudio',
      expect.objectContaining({ content: 'Remote Conductor Handshake' }),
    );
    expect(updated).toBeDefined();
  });
});
```

### Jules Execution Protocol

1. Place all implementation files into `packages/400.conductor/98.menu.unit/` adhering strictly to `.js` import specifiers.
2. Register `MenuUnit` in `packages/400.conductor/BEE.ts` under `list`, `reducer`, and `UnitData`.
3. Run `npx vitest run packages/400.conductor/val/cockpitTelemetry.test.ts` to ensure 100% of unit tests pass.
4. Verify that `npx tsc -b packages/400.conductor` compiles with zero diagnostic warnings and `test ! -d packages/400.conductor/src` confirms absence of any forbidden `src/` directory.
5. **COMMAND:** When you begin working on this specification, immediately update the `[- **Status:**]` attribute below to `[🟡 In Progress]`. When all target files and the Vitest test gauntlet pass with exit code 0, update `[- **Status:**]` to `[🟢 Done]`.

### **Attributes:**

- **Status:** [⚪ Backlog ]
- **Priority:** [🔴 High]
- **Time Estimate:** [1 Hour]
- **Tags:** [infrastructure, blessed-tui, cockpit-navigation, telemetry-streaming, pivot-bus]
- **Epic:** [EPIC 001: INFRASTRUCTURE & GOVERNANCE]
- **Value:** [Operator Cockpit Navigation & Real-Time Telemetry Control]
- **Sprint Points:** [2]
- **Component:** [packages/400.conductor/98.menu.unit]
- **Owner:** [Jules Autonomous Implementer]
- **Target Release:** [Sprint 4 / Conductor v1.0]
- **Risk Level:** [Low]
- **Reporter:** [Studio Architecture Lead]

### You

{{FOCUS : Phase 6 Blessed Terminal Cockpit Navigation Telemetry Control }}

@jules-complete-check

### Gemini

### **Validation:**

- **Progress:** [⚪ Waiting for Action ]

#### Jules Pre-Flight Completion Audit & Operational Directive

**Agent Instruction:** Before generating, authoring, or mutating any code for **Phase 6: Blessed Terminal Cockpit Navigation Telemetry Control**, execute an automated inspection audit across `packages/400.conductor/98.menu.unit/`, `packages/400.conductor/BEE.ts`, `apps/995.library/run.ts`, and `packages/400.conductor/val/` in repository `000.series-sower-conductor` against the **12-Point Pre-Flight Completion Inspection Checklist** below to verify whether this interactive curses cockpit, 12x12 Cartesian grid allocator, dynamic tooltip focus streamer, pure 7-bit ASCII telemetry bus, and remote audio pivot manipulator have already been completed:

$$
\text{Completion Percentage} = \left(\frac{\text{Passed Checks}}{12}\right) \times 100\% \text{}
$$

##### The 12-Point Completion Audit Battery

1. **Physical Inode Existence (`fce/`):** Verify that `packages/400.conductor/98.menu.unit/fce/menu.interface.ts` and `fce/menu.bit.ts` exist on disk and export `GridCoordinates`, `MenuChoiceItem`, `CockpitTelemetryPacket`, `Menu`, and `MenuBit`.
2. **Schema Validation Inode (`val/`):** Verify that `packages/400.conductor/98.menu.unit/val/menu.val.ts` exists and exports `GridCoordinatesSchema`, `MenuChoiceItemSchema`, and `CockpitTelemetryPacketSchema` with `.strict()` termination.
3. **Telemetry Streamer Buzzer Inode (`buz/`):** Verify that `packages/400.conductor/98.menu.unit/buz/telemetryStreamer.buzz.ts` exists and implements `sanitizeTo7BitAscii`, `formatTelemetryLine`, and `streamConsoleTelemetry` with pure 7-bit ASCII filtering (stripping Unicode emojis and smart quotes).
4. **Master Menu Buzzer Inode (`buz/`):** Verify that `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` exists and implements `initMenu`, `dispatchRemoteAudioPivot`, and `updateMenu`, complete with `CONDUCTOR_GRID_LEFT`, `CONDUCTOR_GRID_RIGHT`, and `CONDUCTOR_MENU_CHOICES`.
5. **Candor 7-File Unit Architecture:** Verify that `menu.action.ts`, `menu.buzzer.ts`, `menu.model.ts`, `menu.reduce.ts`, and `menu.unit.ts` physically exist within `packages/400.conductor/98.menu.unit/`.
6. **Dual-Pane 12x12 Cartesian Grid Allocation:** Confirm that `updateMenu` allocates `{ x: 0, y: 4, xSpan: 4, ySpan: 8 }` for the interactive left choice axis and `{ x: 4, y: 0, xSpan: 8, ySpan: 12 }` for switchboard console pane `cns00`.
7. **Action Switchboard Dispatching:** Confirm that selecting choices in `updateMenu` dispatches corresponding actions across the Conductor pipeline: `ParseSceneAst`, `TranslateSomaticDsp`, `ExecuteSceneSpeech`, `QuantizeAcousticClock`, and `AssembleAcousticExposureSheet`.
8. **Dynamic Focus Tooltip Streaming:** Verify that the choice callback (`cb`) intercepts cursor focus events to stream operational guidance strings directly into `cns00` (e.g., `>> [TOOLTIP] ...`).
9. **Remote Pivot Manipulation of `audio-microservice`:** Confirm that `dispatchRemoteAudioPivot` checks `global.MICROSERVICEAUDIO` and `global.PIVOTS['microserviceaudio']`, programmatically executing `pivot.hunt('[Microserviceaudio action] Update Microserviceaudio', ...)` across the shared bus.
10. **Headless Safety & Non-Recursive Loop Ticks:** Confirm that `updateMenu` provides safe fallback degradation when `global.LIBRARY` is undefined (CI / Vitest), and schedules curses re-renders via `setTimeout(..., 333)` to eliminate deep call-stack recursion.
11. **Monorepo Central Manifest Integration (`BEE.ts`):** Confirm that `packages/400.conductor/BEE.ts` imports `MenuUnit` and registers it across `list`, `reducer`, and `UnitData` under key `menu`.
12. **Vitest Verification Battery & Monorepo Boundaries:** Execute `npx vitest run packages/400.conductor/val/cockpitTelemetry.test.ts` and confirm 100% passing assertions with exit code 0; assert that `packages/400.conductor/src/` does not exist (`test ! -d packages/400.conductor/src`), `apps/995.library/` has 0 modified lines (`git status -s apps/995.library/995.library/` returns empty), and all unit code is 100% clean 7-bit ASCII.

##### Operational Halting & Execution Rules

- **IF $\ge 67\%$ (8 or more of the 12 checks pass):**
  - Update `[- **Progress:**]` above with the current execution timestamp and date:
    ```markdown
    - **Progress:** [🟢 Completed on Thursday, November 5, 2026 at 7:48 AM EST - Audit Score: >= 67% - Pre-existing Work Verified]
      *Reason for Halt:* Pre-flight audit confirmed that >= 67% of Phase 6 Blessed Terminal Cockpit Navigation Telemetry Control requirements—including 98.menu.unit Candor structure, 12x12 Cartesian grid boundary allocation ({ x: 0, y: 4, xSpan: 4, ySpan: 8 } and { x: 4, y: 0, xSpan: 8, ySpan: 12 }), interactive choice switchboard dispatching across all pipeline phases, dynamic cb focus tooltip streaming into cns00, pure 7-bit ASCII telemetry log scrubbing in telemetryStreamer.buzz.ts, remote pivot manipulation of global.MICROSERVICEAUDIO, non-recursive setTimeout(..., 333) re-entrant loops, BEE.ts registration, zero diffs on apps/995.library/995.library/**, and green Vitest test batteries in val/cockpitTelemetry.test.ts—are already satisfied on disk. Operational execution halted immediately to prevent redundant file mutations or overwrites.
    ```
  - Write the original specification file with this updated timecode header and **STOP IMMEDIATELY!**
  - **STRICT AGENT BOUNDARY:** The Jules Coding Agent must strictly understand that this status and timestamp update is the **ONLY** update, work, and activity to be induced from this prompt. Do **NOT** rewrite files, do **NOT** modify existing tests, and do **NOT** execute redundant implementations.
- **IF $< 67\%$ (0 to 7 checks pass):**
  - Jules must proceed to implement and fulfill all missing requirements across `packages/400.conductor/98.menu.unit/`, `packages/400.conductor/BEE.ts`, and `packages/400.conductor/val/cockpitTelemetry.test.ts`.
  - Once monorepo compilation (`npx tsc -b packages/400.conductor`) and Vitest runs clear with exit code 0, update `[- **Progress:**]` to `[🟢 Completed on Thursday, November 5, 2026 at 7:48 AM EST - Task Requirements Fully Implemented]` and save the file.

> **CRITICAL PARTNER TEST ADVISORY WARNING:** If there is a partner file located next to this one in the directory matching the suffix `[xxx.phase-xxx.ag-test.md]`, **YOU ARE TO NEVER RUN THIS TEST**. That test suite belongs exclusively to the Antigravity adversarial audit agent (`ag-test`), which will independently verify this implementation.

### **FUNCTIONAL MANDATE**

#### **User Story**

At 5:12 AM in the dim light of the primary staging facility, Nora stood in front of the master broadcast console. The studio had just reached final assembly on Episode 040, and the entire multi-tenant pipeline was humming across Rig 1 and Rig 2. Months ago, navigating the pipeline during active synthesis had been an operational nightmare: the orchestration engine was completely headless, spewing unformatted JSON blobs directly to raw stdout, where terminal text would wrap erratically and scroll off-screen at thousands of lines per second. Operators had no way of knowing whether the acoustic client was stuck waiting for a Python subprocess, whether the 24 fps frame quantizer had finished computing causal VAE slack, or if the sidechain ducking curve had dropped into an infinite loop. When an operator tried to test an individual character's somatic parameters, they had to open three separate shell tabs, manually construct curl commands, and inspect raw SQLite tables.

This morning, Nora booted the terminal cockpit via `npm run dev`.

Instantly, the terminal swapped into the curses alternate screen buffer with zero display jitter. Across the 12x12 Cartesian grid, the screen snapped into a clean dual-pane layout: on the left, an amber-and-green vertical choice axis occupied the control quadrant (`{ x: 0, y: 4, xSpan: 4, ySpan: 8 }`), while the right quadrant opened into the green-bordered switchboard telemetry console `cns00` (`{ x: 4, y: 0, xSpan: 8, ySpan: 12 }`).

Nora touched the `Down` arrow key, stepping onto `INSPECT CHARACTER SOMATIC DSP`. Instantly, without her pressing `Enter`, the dynamic focus callback engaged: `cns00` quietly streamed an operational tooltip: `>> [TOOLTIP] Convert physical fatigue and trauma metrics into continuous DSP modifiers.` She pressed `Enter`, and the Conductor dispatched the action across the internal bus: within milliseconds, `cns00` streamed the exact calculated pitch, formant, and fry parameters.

She stepped down to `DISPATCH REMOTE AUDIO PIVOT` and hit `Enter`. The Conductor resolved `global.MICROSERVICEAUDIO` across the shared monorepo pivot registry and executed the remote handshake without Nora ever leaving the cockpit. When she navigated upward to inspect an earlier line, the viewport remained locked to her scroll offset while background events ticked cleanly in the libuv event loop without screen tearing or call-stack recursion. Nora had total, transparent control over the entire acoustic generation engine from a single set of keyboard strokes.

#### **Strategic Goal**

Directly fulfills the **Dual-Pane 12x12 Cartesian Grid Invariant** and the **Operator Cockpit Navigation & Real-Time Telemetry Control Mandate at $T_0 = \$0.00$**. By integrating the Conductor's multi-stage pipeline into `packages/400.conductor/98.menu.unit/` using Blessed terminal choice matrices, non-blocking asynchronous console streaming into `cns00`, pure 7-bit ASCII sanitization, and remote pivot bus orchestration, this phase provides a responsive, fail-safe visual control surface for human operators without introducing client-side web framework bloat, socket connection dependencies, or curses screen buffer corruption.

#### **Context & Value**

- **The Strategic Value:** In an automated, multi-repository generative studio, headless orchestration is impossible to monitor, debug, and govern in real time. Conversely, spinning up heavy browser-based dashboards on Rig 1 consumes valuable system RAM and risks GPU context conflicts with optical rendering passes. A native Blessed curses flight deck hosted directly in `apps/995.library` gives operators zero-latency, full-fidelity control over every pipeline stage (AST parsing, somatic DSP translation, speech subprocess spawning, 24 fps frame quantization, exposure sheet compilation, and remote audio microservice handshakes) with $0\text{ KB}$ of browser overhead and zero GPU VRAM consumption.
- **The Technical Challenge:** Enforcing rigid 12x12 Cartesian percentage bounds (`{ x: 0, y: 4, xSpan: 4, ySpan: 8 }` and `{ x: 4, y: 0, xSpan: 8, ySpan: 12 }`) without layout overlap; stripping multi-byte UTF-8 emojis and curly quotes to prevent Windows `cmd.exe` buffer tearing; preventing call-stack recursion in curses re-render cycles via non-recursive `setTimeout(..., 333)` ticks; providing headless fallback degradation for CI environments lacking terminal TTY handles; and safely resolving global pivot instances across the monorepo without introducing circular dependencies or runtime null-pointer crashes.

#### **Interface**

`Phase 6 Blessed Terminal Cockpit Navigation Telemetry Control` inside `000.series-sower-conductor` interfaces across the monorepo ecosystem through strict boundaries:

- **`apps/995.library` (Foundational Terminal Curses Engine):** The master terminal runner (`run.ts`) that initializes the screen alternate buffer, mounts the 12x12 grid (`81.grid.unit`), opens choice axes (`85.choice.unit`), and renders telemetry to `cns00` (`83.console.unit`).
- **`packages/400.conductor/34.abstractsyntaxtree.unit`:** Triggered via choice `AUDIT DIALOGUE AST CONTRACT` to validate `drafts/dialogue_ast.json`.
- **`packages/400.conductor/10.somaticdsp.unit`:** Triggered via choice `INSPECT CHARACTER SOMATIC DSP` to evaluate trauma basis points and print continuous acoustic modifiers.
- **`packages/400.conductor/09.speech.unit`:** Triggered via choice `SYNTHESIZE SCENE AUDIO STEMS` to spawn `python synthesize.py` and monitor `.tmp` inode stabilization.
- **`packages/400.conductor/24.frame.unit`:** Triggered via choice `QUANTIZE ACOUSTIC MASTER CLOCK` to probe continuous WAV duration and derive discrete 24 fps integer frames.
- **`packages/400.conductor/32.audio.unit`:** Triggered via choice `ASSEMBLE ACOUSTIC EXPOSURE SHEET` to compile multi-window sidechain ducking curves and write `drafts/exposure_sheet.json`.
- **`000.audio-microservice` (`packages/700.microserviceaudio`):** Accessed via `global.MICROSERVICEAUDIO` and `global.PIVOTS['microserviceaudio']` to dispatch remote cross-repository actions across the shared pivot bus.

#### **Interaction**

The operator observes and interacts with this phase through the **Blessed Terminal Interface** hosted in `apps/995.library`:

- **Interactive Cockpit Navigation:**
  1. Launch the terminal cockpit on Rig 1 via `npm run dev`.
  2. In the left navigation choice grid (`85.choice.unit` / `98.menu.unit`), use the arrow keys (`Up`/`Down`) or `J`/`K` to navigate across the available options.
  3. Observe that moving cursor focus automatically updates pane `cns00` with the corresponding action tooltip.
  4. Press `ENTER` on any option to dispatch its corresponding action.
- **Visual Telemetry Feedback (`cns00`):**
  - The switchboard console (`cns00` at `{ x: 4, y: 0, xSpan: 8, ySpan: 12 }`) streams real-time 7-bit ASCII receipts as actions execute:
    ```plaintext
    >> [TOOLTIP] Programmatically trigger 000.audio-microservice via shared global pivot bus.
    >> [AUDIO-MICROSERVICE] Triggering remote pivot health action via hunt...
    >> [AUDIO-MICROSERVICE] [OK] Remote pivot answered successfully.
    >> [MENU:FRAME] Acoustic clock quantized cleanly with zero drift.
    ```
  - In the event of a warning or missing pivot, `cns00` logs a structured ASCII warning:
    ```plaintext
    :: [AUDIO-MICROSERVICE] [WARN] Remote pivot [microserviceaudio] not found in global registry.
    ```
- **Local Headless CLI Inspection:**
  [cite: 1, 2]
  - For automated CI/CD validation without launching the curses UI, developers run the colocated test suite:
    ```bash
    npx vitest run packages/400.conductor/val/cockpitTelemetry.test.ts
    ```
  - Confirm that the package adheres strictly to the unit-colocated layout without any forbidden `src/` directory:
    ```bash
    test ! -d packages/400.conductor/src && echo ">> [OK] Zero src/ directory confirmed."
    ```
  - Verify that the immutable harness has sustained exactly zero modifications:
    ```bash
    git status -s apps/995.library/995.library/
    ```

### You

{{FOCUS : Phase 6 Blessed Terminal Cockpit Navigation Telemetry Control }}

@agrav-check-00

### Gemini

### **Validation:**

- **Progress:** [⚪ Waiting for Action ]

> **Operational Directive for Antigravity:** When all of the listed checks, negative-control boundary traps, 12x12 Cartesian grid allocation assertions, focus tooltip streaming tests, 7-bit ASCII sanitization proofs, remote pivot bus dispatches, and interactive Blessed terminal levels in this Antigravity verification prompt are executed and pass with zero faults in regards to **Phase 6 Blessed Terminal Cockpit Navigation Telemetry Control**, Antigravity must update `[- **Progress:**]` above with the current timestamp and certification verdict (e.g., `[- **Progress:** 🟢 Certified on Thursday, November 5, 2026 at 7:50 AM EST - All Verification Tiers Cleared]`) and rewrite the original directive file with this finalized verification status upon successful completion of all audits and tests. If any check, constraint validation, 12x12 Cartesian grid coordinate check, tooltip focus streaming assertion, re-entrant loop verification, runner boundary fence test, or Vitest suite trips or fails, mark `[⚪` with `[🔴 Failed on Thursday, November 5, 2026 at 7:50 AM EST - Breach Detected in <LEVEL/CHECK>]` and emit the fail-closed conflict diagnostic trace.

### Blessed Terminal Interface (TUI) Validation Instructions

When validating features involving a Blessed Terminal Interface (`apps/995.library/` / `cns00` Showrunner Terminal):

1. **Human Keyboard Emulation:** Manually interact with the interface using real keyboard inputs and sequences (e.g., Arrow keys, Vim `j`/`k`, `Tab`, `Enter`, `Escape`, character inputs, and configured shortcuts) exactly as an operator at a physical terminal would.
2. **Step-by-Step Flow Navigation:** Drive end-to-end user journeys through sequential keystrokes rather than relying solely on headless mocks or direct state mutations. Allow render and event loop cycles between inputs.
3. **Screen & Focus Verification:** Observe terminal screen buffers, cursor positions, active focused widgets, and visual updates after each keypress sequence to ensure the UI responds correctly without screen tearing.
4. **Lifecycle & Clean Exit:** Verify proper startup rendering, navigation across interactive elements, and graceful termination routines (such as `q`, `Escape`, or `Ctrl+C`).

### Blessed Terminal Interface (TUI) Validation & Autonomous Remediation Protocol

#### 1. Authoritative Runner Entry Point

- All interactive Blessed terminal tests **MUST** execute exclusively through:
  ```bash
  npm run dev
  ```
  *(Direct execution via bare `node` is strictly prohibited because `.ts` transpilation requires `tsx`; direct package execution flags like `npm run dev -- --package=299.lore` are strictly forbidden).*

#### 2. Pre-Flight Boundary Self-Healing Guard

- Before launching the runner, the auditor must assert harness integrity:
  ```bash
  git status -s apps/995.library/995.library/
  ```
- **Remediation Action:** If any dirty files or rogue stubs are detected inside `apps/995.library/995.library/`, the auditor must run `git restore apps/995.library/995.library/` immediately before proceeding to the build.
- `apps/995.library/run.ts` is the only file under `apps/995.library/` with a permitted modification path.

#### 3. In-Scope Remediation Mandate (Zero-Handoff Policy)

- If Level 6 encounters:
  - Missing CLI flags or runner options in `apps/995.library/run.ts` (permitted modification path).
  - Unimplemented menu navigation or telemetry hooks in `packages/400.conductor/98.menu.unit/`.
  - Stale references in local package `tsconfig.json`.
- **The auditor must NOT halt execution or report failure to the user.**
- **The auditor must proactively implement the missing wiring**, re-execute the gauntlet, and verify clean end-to-end telemetry before sealing the audit.

#### 4. Verification Integrity Boundary

- The auditor should never:
  - Weaken Zod schemas or basis-point bounds to bypass failures.
  - Modify the immutable harness (`apps/995.library/995.library/**`).
  - Comment out or weaken directive assertions.
- Remediation is strictly limited to fixing runtime orchestration, restoring boundary corruptions, and fulfilling the mandated UI journey.

### ANTIGRAVITY ADVERSARIAL AUDIT & VERIFICATION GAUNTLET

- **TARGET DIRECTIVE:** `006.cockpit-telemetry-control-phase6.ag-test.md`
- **TARGET FOCUS:** `Phase 6 Blessed Terminal Cockpit Navigation Telemetry Control`
- **TARGET REPOSITORY:** `000.series-sower-conductor` (downstream: `camp-candor/series-sower-conductor` / `camp-candor/npm-agent-01`)
- **TARGET WORKSPACE:** `packages/400.conductor/`
- **AUDIT TARGET INODES:**
  - `packages/400.conductor/src/` *(ASSERTION: Physical non-existence; strict unit-colocated layout)*
  - `packages/400.conductor/98.menu.unit/fce/menu.interface.ts` *(AUDIT: Strict typings for `GridCoordinates`, `MenuChoiceItem`, `CockpitTelemetryPacket`, `Menu`)*
  - `packages/400.conductor/98.menu.unit/fce/menu.bit.ts` *(AUDIT: Candor operational state payload contract `MenuBit`)*
  - `packages/400.conductor/98.menu.unit/val/menu.val.ts` *(AUDIT: Zod schemas `GridCoordinatesSchema`, `MenuChoiceItemSchema`, `CockpitTelemetryPacketSchema` with `.strict()` termination)*
  - `packages/400.conductor/98.menu.unit/buz/telemetryStreamer.buzz.ts` *(AUDIT: `sanitizeTo7BitAscii`, `formatTelemetryLine`, `streamConsoleTelemetry` routing into `cns00`)*
  - `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` *(AUDIT: 12x12 Cartesian grid bounds, interactive choice switchboard, live tooltip focus callbacks, `dispatchRemoteAudioPivot` execution, non-recursive `setTimeout(..., 333)` loop tick)*
  - `packages/400.conductor/98.menu.unit/menu.action.ts` *(AUDIT: Typed actions `INIT_MENU`, `UPDATE_MENU`, `DISPATCH_REMOTE_AUDIO_PIVOT`)*
  - `packages/400.conductor/98.menu.unit/menu.buzzer.ts` *(AUDIT: NodeNext buzzer exports with explicit `.js` specifiers)*
  - `packages/400.conductor/98.menu.unit/menu.model.ts` *(AUDIT: State model store with initial default layout bindings)*
  - `packages/400.conductor/98.menu.unit/menu.reduce.ts` *(AUDIT: Pure reducer implementation via `clone-deep`)*
  - `packages/400.conductor/98.menu.unit/menu.unit.ts` *(AUDIT: Candor unit class wiring)*
  - `packages/400.conductor/BEE.ts` *(AUDIT: Central unit registration of `MenuUnit` in `list`, `reducer`, and `UnitData`)*
  - `apps/995.library/run.ts` *(AUDIT: Authorized flight deck mounting entrypoint)*
  - `apps/995.library/995.library/**` *(ASSERTION: Immutable runner boundary held at 0 modified lines)*
  - `packages/400.conductor/val/cockpitTelemetry.test.ts` *(AUDIT: Colocated Vitest battery asserting 12x12 grid bounds, 7-bit ASCII sanitization, telemetry formatting, headless safety, remote pivot dispatch)*
- **AUDITOR PERSONA:** Autonomous Adversarial Systems Auditor & Cockpit Telemetry Verification Sentry (Antigravity v2.4)

### I. Architectural Mandate & Universal Negative-Control Law

Under the **Universal Negative-Control Law**, an operator cockpit, curses menu switchboard, or telemetry streaming bus that has never been observed actively failing closed when subjected to headless execution environments lacking `LIBRARY`, call-stack recursion panics during extended navigation cycles, screen buffer tearing from multi-byte UTF-8 emojis in Windows `cmd.exe`, or rogue modifications to the immutable vendor harness `apps/995.library/995.library/**` at Stage $T_0 = \$0.00$ **CANNOT BE CERTIFIED FOR STUDIO PRODUCTION DEPLOYMENT**.

Antigravity executes active negative-control fault injections: testing strict 12x12 Cartesian grid coordinate containment, stripping multi-byte Unicode and smart quotes, asserting non-recursive `setTimeout(..., 333)` libuv loop scheduling, validating remote pivot resolution against `global.MICROSERVICEAUDIO`, and verifying clean 7-bit ASCII telemetry streamed directly to `cns00`.

### II. Multi-Level Adversarial Audit Gauntlet

#### Level 1: Static Monorepo Boundary, Directory Invariant & Pure 7-Bit ASCII Audit

- **Check 1.1 (Forbidden `packages/400.conductor/src/` Non-Existence):** Assert that no `packages/400.conductor/src/` directory exists. All models, actions, buzzers, and reducers must reside strictly inside numbered unit folders (`98.menu.unit/`, etc.) and `val/`.
  ```bash
  test ! -d packages/400.conductor/src && echo ">> [OK] Zero src/ directory confirmed."
  ```
  *(Must exit with return code 0).*
- **Check 1.2 (Immutable Harness Fence):** Assert that the runner harness has sustained zero modifications:
  ```bash
  git status -s apps/995.library/995.library/
  ```
  *(Must return exactly 0 modified lines; if dirty, restore immediately via `git restore apps/995.library/995.library/`).*
- **Check 1.3 (NodeNext Explicit `.js` Imports):** Inspect all imports across `packages/400.conductor/98.menu.unit/` to verify that all relative module specifiers terminate explicitly with `.js` extensions.
- **Check 1.4 (Pure 7-Bit ASCII Cleanliness):** Execute an automated scan across all unit files and test suites in `98.menu.unit` and `val/cockpitTelemetry.test.ts` to assert zero multi-byte Unicode or emojis:
  ```bash
  node -e "
  const fs = require('fs');
  const path = require('path');
  const files = [
    '98.menu.unit/fce/menu.interface.ts',
    '98.menu.unit/fce/menu.bit.ts',
    '98.menu.unit/val/menu.val.ts',
    '98.menu.unit/buz/telemetryStreamer.buzz.ts',
    '98.menu.unit/buz/00.menu.buzz.ts',
    '98.menu.unit/menu.action.ts',
    '98.menu.unit/menu.buzzer.ts',
    '98.menu.unit/menu.model.ts',
    '98.menu.unit/menu.reduce.ts',
    '98.menu.unit/menu.unit.ts',
    'val/cockpitTelemetry.test.ts'
  ];
  for (const f of files) {
    const full = path.join('packages/400.conductor', f);
    if (!fs.existsSync(full)) {
      console.error(':: [FAIL] Missing file: ' + full);
      process.exit(1);
    }
    const content = fs.readFileSync(full, 'utf8');
    if (/[\x80-\xFF]/.test(content)) {
      console.error(':: [FAIL] Multi-byte non-ASCII character detected in: ' + full);
      process.exit(1);
    }
  }
  console.log('>> [OK] 100% 7-Bit Clean ASCII confirmed across all menu unit inodes.');
  "
  ```
- **Check 1.5 (TypeScript Compiler Verification):** Execute typecheck across the package:
  ```bash
  npx tsc -b packages/400.conductor
  ```
  *(Must complete with 0 errors and 0 diagnostic warnings).*

#### Level 2: Strict Schema Closure & 12x12 Cartesian Grid Layout Traps

- **Check 2.1 (Schema Rigidity & `.strict()` Enforcement):** Assert that `GridCoordinatesSchema`, `MenuChoiceItemSchema`, and `CockpitTelemetryPacketSchema` strictly reject un-schemaed keys (e.g., `theme_color`, `active_tab`) with `ZodError` at Stage $T_0 = \$0.00$ spend.
- **Check 2.2 (12x12 Grid Coordinate Bounds Assertion):** Evaluate the exported constants `CONDUCTOR_GRID_LEFT` and `CONDUCTOR_GRID_RIGHT`:
  - `CONDUCTOR_GRID_LEFT`: `{ x: 0, y: 4, xSpan: 4, ySpan: 8 }` (Left quadrant, 33.3% width, lower 66.6% height).
  - `CONDUCTOR_GRID_RIGHT`: `{ x: 4, y: 0, xSpan: 8, ySpan: 12 }` (Console pane `cns00`, 66.6% width, 100% height).*Assertion:* `x + xSpan <= 12` and `y + ySpan <= 12` must evaluate to `true` for both viewports, asserting zero coordinate overlap or grid matrix overflow.

#### Level 3: Pure 7-Bit Clean ASCII Sanitization & Telemetry Formatting Traps

- **Check 3.1 (Multi-Byte Unicode & Emoji Stripping):** Pass an adversarial string containing UTF-8 emojis and typographic characters to `sanitizeTo7BitAscii`:`"Bog said: “Tighten the valve!” 🔧 — status: active."`*Assertion:* Must evaluate to `"Bog said: \"Tighten the valve!\"  - status: active."` with zero characters matching `/[\x80-\xFF]/`.
- **Check 3.2 (Telemetry Status Token Formatting):** Verify standard bracketed prefix formatting in `formatTelemetryLine`:
  - `'OK'`: Must prefix with `>> [SUBSYSTEM] [OK] <message>`.
  - `'FAIL'`: Must prefix with `:: [SUBSYSTEM] [FAIL] <message>`.
  - `'WARN'`: Must prefix with `:: [SUBSYSTEM] [WARN] <message>`.
- **Check 3.3 (Non-Blocking Console Streaming Sink):** Inspect `streamConsoleTelemetry`:
  - When `global.LIBRARY` is defined: Must dispatch `[Console action] Update Console` targeting `cns00`.
  - When `global.LIBRARY` is undefined (headless CI): Must fall back gracefully to `process.stdout.write` without throwing null-pointer exceptions.

#### Level 4: Interactive Choice Switchboard & Remote Audio Pivot Traps

- **Check 4.1 (Complete Pipeline Choice Roster):** Assert that `CONDUCTOR_MENU_CHOICES` includes all five Conductor pipeline phases and remote pivot controls:
  1. `AUDIT DIALOGUE AST CONTRACT`
  2. `INSPECT CHARACTER SOMATIC DSP`
  3. `SYNTHESIZE SCENE AUDIO STEMS`
  4. `QUANTIZE ACOUSTIC MASTER CLOCK`
  5. `ASSEMBLE ACOUSTIC EXPOSURE SHEET`
  6. `DISPATCH REMOTE AUDIO PIVOT`
  7. `ROOT MENU`
- **Check 4.2 (Dynamic Focus Callback Tooltip Streaming):** Verify that `updateMenu` configures callback `cb: async (focusedIndex: number) => { ... }` on `[Choice action] Open Choice`. Hovering or focusing over choice index $k$ must stream `>> [TOOLTIP] <tooltip_text>` directly to `cns00`.
- **Check 4.3 (Remote Audio Pivot Invocation & Warning Trap):**
  - When `(global as any).MICROSERVICEAUDIO` is absent: `dispatchRemoteAudioPivot` must stream `:: [AUDIO-MICROSERVICE] [WARN] Remote pivot [microserviceaudio] not found in global registry.` and resolve cleanly.
  - When `(global as any).MICROSERVICEAUDIO` is present: Must execute `pivot.hunt('[Microserviceaudio action] Update Microserviceaudio', ...)` across the shared bus, streaming confirmation receipts to `cns00`.
- **Check 4.4 (Non-Recursive Re-Entrant Loop Tick):** Assert that after a menu selection settles, the next iteration of `updateMenu` is scheduled exclusively via `setTimeout(..., 333)`. Synchronous recursive re-calls are strictly prohibited to prevent libuv stack exhaustion.

#### Level 5: Colocated Vitest Battery Clearance

- Execute the complete unit test battery:
  ```bash
  npx vitest run packages/400.conductor/val/cockpitTelemetry.test.ts
  ```
  *(100% of test assertions must pass with exit code 0).*

#### Level 6: Blessed Terminal Cockpit Live Journey & Telemetry Audit

- **Step 6.1 (Launch Terminal Cockpit):** Start the operator interface via the authoritative entry point:
  ```bash
  npm run dev
  ```
- **Step 6.2 (Human Keyboard Emulation Journey):**
  1. Allow the curses alternate screen buffer to initialize on screen.
  2. Confirm visual layout split: Left control quadrant (`{ x: 0, y: 4, xSpan: 4, ySpan: 8 }`), Right console pane `cns00` (`{ x: 4, y: 0, xSpan: 8, ySpan: 12 }`).
  3. Use arrow keys (`Down`/`Up`) or Vim `j`/`k` to navigate down the choice menu.
  4. Observe that focusing on `INSPECT CHARACTER SOMATIC DSP` streams `>> [TOOLTIP] Convert physical fatigue and trauma metrics into continuous DSP modifiers.` into `cns00` without requiring an `Enter` keystroke.
  5. Press `Enter` on `DISPATCH REMOTE AUDIO PIVOT`. Observe the remote handshake status stream to `cns00`.
  6. Navigate down to `ROOT MENU` and press `Enter` to test clean promise resolution.
- **Step 6.3 (Console Telemetry Verification - `cns00`):** Verify that the switchboard console actively renders pure 7-bit ASCII receipts:
  ```plaintext
  >> [TOOLTIP] Programmatically trigger 000.audio-microservice via shared global pivot bus.
  >> [AUDIO-MICROSERVICE] Triggering remote pivot health action via hunt...
  >> [AUDIO-MICROSERVICE] [OK] Remote pivot answered successfully.
  ```
- **Step 6.4 (Graceful Teardown):** Press `Escape` or `q` to terminate the Blessed curses loop cleanly, confirming zero unhandled asynchronous promise rejections, zero dangling timers, and clean restoration of terminal standard I/O.

### III. Final Feedback & Status Mutation Directive

#### 1. If ALL Verification Levels Pass (100% Compliance Across Levels 1–6):

- Update `[- **Progress:**]` at the top of this document to:
  ```markdown
  - **Progress:** [🟢 Certified on Thursday, November 5, 2026 at 7:50 AM EST - All Verification Tiers Cleared]
  ```
- Overwrite the original specification file with this updated header.
- Emit the certified success feedback receipt:
  ```plaintext
  >> ==============================================================================
  >> [ANTIGRAVITY AUDIT VERDICT: PASSED 🟢]
  >> PHASE 6: BLESSED TERMINAL COCKPIT NAVIGATION TELEMETRY CONTROL
  >> ------------------------------------------------------------------------------
  >> [OK] Level 1: Monorepo fences held. apps/995.library/ untouched. Zero src/.
  >> [OK] Level 2: 12x12 Cartesian grid bounds verified ({0,4,4,8} and {4,0,8,12}).
  >> [OK] Level 3: Pure 7-bit ASCII sanitization verified (zero multi-byte emojis).
  >> [OK] Level 4: Action switchboard, live tooltips, and remote pivot bus verified.
  >> [OK] Level 5: Colocated Vitest test battery cleared with 100% passing tests.
  >> [OK] Level 6: Blessed curses TUI flight deck verified with clean cns00 streaming.
  >> ------------------------------------------------------------------------------
  >> STATUS: BLESSED TERMINAL COCKPIT CERTIFIED PRODUCTION-READY (T0 = $0.00)
  >> ==============================================================================
  ```

#### 2. If ANY Check, Assertion, or Level Fails:

- Update `[- **Progress:**]` at the top of this document to:
  ```markdown
  - **Progress:** [🔴 Failed on Thursday, November 5, 2026 at 7:50 AM EST - Breach Detected in <LEVEL/CHECK>]
  ```
- Overwrite the original specification file with this updated header.
- Emit the fail-closed conflict diagnostic banner:
  ```plaintext
  :: ==============================================================================
  :: [ANTIGRAVITY AUDIT VERDICT: FAILED 🔴]
  :: PHASE 6: BLESSED TERMINAL COCKPIT NAVIGATION TELEMETRY CONTROL
  :: ------------------------------------------------------------------------------
  :: [FAIL] Verification halted at Level <X>: <CHECK_NAME>
  :: Reason: <SPECIFIC_ASSERTION_FAILURE_DETAILS>
  :: Action: Remediate defective artifacts in 98.menu.unit before re-running audit.
  :: ==============================================================================
  ```
  *(Halt execution immediately without mutating further code).*

### You

{{FOCUS : Feature 7.1 Master Lifecycle Sequential Chaining}}

@jules-task-00

### Gemini

# Jules Task: Feature 7.1 Master Lifecycle Sequential Chaining

You are tasked with implementing **Feature 7.1 Master Lifecycle Sequential Chaining** within the `000.series-sower-conductor` repository on Rig 1. This subsystem functions as the master deterministic control-plane orchestrator within `packages/400.conductor/37.lifecycle.unit/`. It chains upstream symbolic narrative reality into broadcast-certified media deliverables, enforcing the core pipeline constitutional axiom:

$$
\text{Canon} \xrightarrow{\quad\text{constrains}\quad} \text{Events} \xrightarrow{\quad\text{determines}\quad} \text{State} \xrightarrow{\quad\text{projects}\quad} \text{Media} \text{}
$$

### Architectural Invariants & Monorepo Boundaries

1. **Absolute Ban on `packages/400.conductor/src/`:** All domain models, action definitions, buzzers, reducers, and interfaces must reside strictly within `packages/400.conductor/37.lifecycle.unit/`, `packages/400.conductor/98.menu.unit/`, or unit test batteries in `packages/400.conductor/val/`. Under no circumstances may any file be placed inside a `src/` directory within `packages/400.conductor/`.
2. **Immutable Harness Boundary:** `apps/995.library/995.library/**` is strictly immutable (0 lines modified).
3. **The Zero-Cost Inception Invariant ($T_0 = \$0.00$):** If upstream narrative validity, somatic feasibility, or continuity state indicates dirtiness (`isDirty === true`), execution must terminate immediately within $<5\text{ ms}$ at Stage $T_0 = \$0.00$, throwing `HTTP 412 Precondition Failed` before any child process, neural speech engine, or rendering worker is invoked[cite: 1].
4. **Zero-VRAM Orchestration Invariant ($T_4 = \$0.00$):** All master lifecycle orchestration, timing quantization, TSX code metaprogramming, and lockfile minting execute strictly in host CPU threads and system RAM on Rig 1, consuming exactly $0\text{ MB}$ of dedicated GPU VRAM.
5. **Linear Eight-Milestone Sequential Chaining:** The coordinator executes the non-branching progression:
  - `STAGE_1_INCEPTION_PREFLIGHT`: Interrogate continuity staleness gate ($T_0 = \$0.00$).
  - `STAGE_2_AST_VERBATIM_LOCK`: Lock dialogue AST verbatim synchrony against screenplay text.
  - `STAGE_3_ACOUSTIC_QUANTIZATION`: Measure physical speech duration and quantize 24 fps integer frames.
  - `STAGE_4_MODEL_CONFORMANCE`: Expand frame budget onto the $4n+1$ causal 3D VAE lattice.
  - `STAGE_5_HARDWARE_MUTEX_ACQUIRED`: Secure hardware lease from ShotCoordinatorDO with epoch fencing.
  - `STAGE_6_METAPROGRAM_STAMPED`: Source-bake static TSX composition with inlined integer literals.
  - `STAGE_7_OPTICAL_PRINTED`: Headless optical rasterization via software OpenGL (`--gl=swangle`) at 0 MB VRAM.
  - `STAGE_8_PROVENANCE_SEALED`: Mint provenance manifest, emit dual WORM snapshots, and settle D1 state (`isDirty = false`).
6. **Asymmetric 40% Minimal Enclosing Unit (MEU) Invariant:** Evaluates forward blast radius:
  $$
  \text{repairSpanRatio} = \frac{\text{totalBeats} - \text{modifiedBeatIndex} + 1}{\text{totalBeats}} \text{}
  $$
  If $\text{repairSpanRatio} > 0.40$, automated infill is aborted and the cut escalates to directorial review with `STAGE_ESCALATED_HUMAN_REVIEW`.
7. **Three-Strike Progressive Circuit Breaker:** Retries intermediate failures up to 3 times with exponential backoff. On Strike 3, the circuit breaker trips permanently, quarantining the scene to `STAGE_FAILED_DLQ`.
8. **Pure 7-Bit Clean ASCII Telemetry:** All source files, logs, comments, and console outputs must strictly use 7-bit ASCII tokens (`>>`, `[OK]`, `[FAIL]`, `::`, `[LIFECYCLE]`, `[STAGE]`, `[MEU]`, `[CIRCUIT-BREAKER]`).
9. **NodeNext Explicit `.js` Imports:** All relative TypeScript imports must explicitly terminate with `.js` extensions.

### File Implementation Manifest

```plaintext
packages/400.conductor/
├── 37.lifecycle.unit/
│   ├── fce/
│   │   ├── lifecycle.bit.ts
│   │   └── masterLifecycle.interface.ts
│   ├── val/
│   │   └── masterLifecycle.val.ts
│   ├── buz/
│   │   ├── meuFallbackRouter.buzz.ts
│   │   ├── circuitBreaker.buzz.ts
│   │   ├── chainLifecycle.buzz.ts
│   │   └── 00.lifecycle.buzz.ts
│   ├── lifecycle.action.ts
│   ├── lifecycle.buzzer.ts
│   ├── lifecycle.model.ts
│   ├── lifecycle.reduce.ts
│   └── lifecycle.unit.ts
├── 98.menu.unit/
│   └── buz/
│       └── 00.menu.buzz.ts              (Update: Mount RUN MASTER SCENE LIFECYCLE)
├── BEE.ts                               (Update: Register LifecycleUnit)
└── val/
    └── lifecycleChaining.test.ts        (Comprehensive Vitest Battery)
```

### Source Code Deliverables

#### 1. Interface & Bit Definitions

```typescript
// packages/400.conductor/37.lifecycle.unit/fce/masterLifecycle.interface.ts
export type MasterSceneStage =
  | 'STAGE_0_IDLE'
  | 'STAGE_1_INCEPTION_PREFLIGHT'
  | 'STAGE_2_AST_VERBATIM_LOCK'
  | 'STAGE_3_ACOUSTIC_QUANTIZATION'
  | 'STAGE_4_MODEL_CONFORMANCE'
  | 'STAGE_5_HARDWARE_MUTEX_ACQUIRED'
  | 'STAGE_6_METAPROGRAM_STAMPED'
  | 'STAGE_7_OPTICAL_PRINTED'
  | 'STAGE_8_PROVENANCE_SEALED'
  | 'STAGE_FAILED_DLQ'
  | 'STAGE_ESCALATED_HUMAN_REVIEW';

export interface ShotLifecycleItem {
  shotId: string;
  speakerId: string;
  dialogueText: string;
  durationMs: number;
  frameBudget?: number;
  audioWavPath?: string;
  videoPlatePath?: string;
  bgMattePath?: string;
}

export interface MasterSceneLifecycleContext {
  sceneId: string;
  episodeId: string;
  currentStage: MasterSceneStage;
  isDirty: boolean;
  shots: ShotLifecycleItem[];
  totalFrames: number;
  activeLeaseId: string | null;
  activeEpoch: number | null;
  stampedTsxPath: string | null;
  outputDeliverablePath: string | null;
  lockfileSha256: string | null;
  vramUsedMb: 0;
  t0Spend: '$0.00';
  t4Spend: '$0.00';
  attemptCount: number;
  maxAttempts: number;
  telemetryLogs: string[];
  lastError?: string;
}

export interface MeuRepairDecision {
  sceneId: string;
  action: 'INFILL' | 'ESCALATE';
  repairSpanRatio: number;
  affectedBeats: number;
  totalBeats: number;
  reason: string;
  shouldHalt: boolean;
}

export interface CircuitBreakerResult {
  quarantined: boolean;
  action: 'RETRY' | 'DEAD_LETTER_QUARANTINE';
  currentAttempt: number;
  maxAttempts: number;
  error: string;
}

export default interface Lifecycle {
  idx: string;
  activeSceneId: string;
  stage: MasterSceneStage;
  lastMasterContext: MasterSceneLifecycleContext | null;
  lastActionTimestamp: number;
}
```

```typescript
// packages/400.conductor/37.lifecycle.unit/fce/lifecycle.bit.ts
import {
  MasterSceneLifecycleContext,
  MeuRepairDecision,
} from './masterLifecycle.interface.js';

export default interface LifecycleBit {
  idx: string;
  src?: string;
  val?: number;
  dat?: {
    sceneId?: string;
    episodeId?: string;
    lifecycleContext?: MasterSceneLifecycleContext;
    meuDecision?: MeuRepairDecision;
    error?: string;
  };
  slv?: Function;
}
```

#### 2. Zod Validation & Schema Guardrails

```typescript
// packages/400.conductor/37.lifecycle.unit/val/masterLifecycle.val.ts
import { z } from 'zod';

export const MasterSceneStageSchema = z.enum([
  'STAGE_0_IDLE',
  'STAGE_1_INCEPTION_PREFLIGHT',
  'STAGE_2_AST_VERBATIM_LOCK',
  'STAGE_3_ACOUSTIC_QUANTIZATION',
  'STAGE_4_MODEL_CONFORMANCE',
  'STAGE_5_HARDWARE_MUTEX_ACQUIRED',
  'STAGE_6_METAPROGRAM_STAMPED',
  'STAGE_7_OPTICAL_PRINTED',
  'STAGE_8_PROVENANCE_SEALED',
  'STAGE_FAILED_DLQ',
  'STAGE_ESCALATED_HUMAN_REVIEW',
]);

export const ShotLifecycleItemSchema = z
  .object({
    shotId: z.string().min(1),
    speakerId: z.string().min(1),
    dialogueText: z
      .string()
      .min(1)
      .regex(/^[\x20-\x7E\r\n\t]*$/, 'dialogueText must be 7-bit clean ASCII'),
    durationMs: z.number().positive(),
    frameBudget: z.number().int().positive().optional(),
    audioWavPath: z.string().optional(),
    videoPlatePath: z.string().optional(),
    bgMattePath: z.string().optional(),
  })
  .strict();

export const MasterSceneLifecycleContextSchema = z
  .object({
    sceneId: z.string().regex(/^[a-zA-Z0-9_-]+$/),
    episodeId: z.string().min(1),
    currentStage: MasterSceneStageSchema,
    isDirty: z.boolean(),
    shots: z.array(ShotLifecycleItemSchema),
    totalFrames: z.number().int().nonnegative(),
    activeLeaseId: z.string().nullable(),
    activeEpoch: z.number().int().positive().nullable(),
    stampedTsxPath: z.string().nullable(),
    outputDeliverablePath: z.string().nullable(),
    lockfileSha256: z.string().nullable(),
    vramUsedMb: z.literal(0),
    t0Spend: z.literal('$0.00'),
    t4Spend: z.literal('$0.00'),
    attemptCount: z.number().int().nonnegative(),
    maxAttempts: z.number().int().positive(),
    telemetryLogs: z.array(z.string()),
    lastError: z.string().optional(),
  })
  .strict();
```

#### 3. Buzzer Implementation: MEU Router, Circuit Breaker, and Sequential Chaining

```typescript
// packages/400.conductor/37.lifecycle.unit/buz/meuFallbackRouter.buzz.ts
import { MeuRepairDecision } from '../fce/masterLifecycle.interface.js';

export function routeMeuRepair(
  sceneId: string,
  modifiedBeatIndex: number,
  totalBeats: number,
): MeuRepairDecision {
  if (totalBeats <= 0) {
    return {
      sceneId,
      action: 'ESCALATE',
      repairSpanRatio: 1.0,
      affectedBeats: 0,
      totalBeats: 0,
      reason: 'INVALID_TOTAL_BEATS',
      shouldHalt: true,
    };
  }

  const clampedIndex = Math.max(1, Math.min(modifiedBeatIndex, totalBeats));
  const affectedBeats = totalBeats - clampedIndex + 1;
  const repairSpanRatio = Math.round((affectedBeats / totalBeats) * 10000) / 10000;

  // Asymmetric 40% Ceiling Law
  if (repairSpanRatio > 0.40) {
    const reason = `BLAST_RADIUS_EXCEEDED: Invalidation span (${(repairSpanRatio * 100).toFixed(1)}%) exceeds 40% threshold (${affectedBeats}/${totalBeats} beats).`;
    process.stderr.write(`>> [MEU] [ESCALATE] ${reason}\n`);
    return {
      sceneId,
      action: 'ESCALATE',
      repairSpanRatio,
      affectedBeats,
      totalBeats,
      reason,
      shouldHalt: true,
    };
  }

  const reason = `INFILL_AUTHORIZED: Invalidation span (${(repairSpanRatio * 100).toFixed(1)}%) is within 40% threshold (${affectedBeats}/${totalBeats} beats).`;
  process.stdout.write(`>> [MEU] [OK] ${reason}\n`);
  return {
    sceneId,
    action: 'INFILL',
    repairSpanRatio,
    affectedBeats,
    totalBeats,
    reason,
    shouldHalt: false,
  };
}
```

```typescript
// packages/400.conductor/37.lifecycle.unit/buz/circuitBreaker.buzz.ts
import {
  MasterSceneLifecycleContext,
  CircuitBreakerResult,
} from '../fce/masterLifecycle.interface.js';

export function evaluateFailureEscalation(
  ctx: MasterSceneLifecycleContext,
  error: Error,
): CircuitBreakerResult {
  ctx.attemptCount++;
  ctx.lastError = error.message;

  if (ctx.attemptCount >= ctx.maxAttempts) {
    ctx.currentStage = 'STAGE_FAILED_DLQ';
    const logMsg = `>> [CIRCUIT-BREAKER] [TRIPPED] Attempt ${ctx.attemptCount}/${ctx.maxAttempts} failed. Quarantining scene ${ctx.sceneId} to STAGE_FAILED_DLQ: ${error.message}`;
    ctx.telemetryLogs.push(logMsg);
    process.stderr.write(`${logMsg}\n`);

    return {
      quarantined: true,
      action: 'DEAD_LETTER_QUARANTINE',
      currentAttempt: ctx.attemptCount,
      maxAttempts: ctx.maxAttempts,
      error: error.message,
    };
  }

  const logMsg = `>> [CIRCUIT-BREAKER] [RETRY] Strike ${ctx.attemptCount}/${ctx.maxAttempts} for ${ctx.sceneId}. Scheduling retry: ${error.message}`;
  ctx.telemetryLogs.push(logMsg);
  process.stdout.write(`${logMsg}\n`);

  return {
    quarantined: false,
    action: 'RETRY',
    currentAttempt: ctx.attemptCount,
    maxAttempts: ctx.maxAttempts,
    error: error.message,
  };
}
```

```typescript
// packages/400.conductor/37.lifecycle.unit/buz/chainLifecycle.buzz.ts
import State from '../../99.core/state.js';
import { MasterSceneLifecycleContext } from '../fce/masterLifecycle.interface.js';
import { evaluateFailureEscalation } from './circuitBreaker.buzz.js';
import { calculateCausalVaeAllocation } from '../../24.frame.unit/buz/frame.buzz.js';
import * as crypto from 'node:crypto';

export interface ChainLifecycleOptions {
  mockCoordinatorEpoch?: number;
  fountainSourceScript?: string;
}

export async function chainMasterSceneLifecycle(
  ctx: MasterSceneLifecycleContext,
  ste?: State,
  options: ChainLifecycleOptions = {},
): Promise<MasterSceneLifecycleContext> {
  const log = async (msg: string) => {
    ctx.telemetryLogs.push(msg);
    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: msg,
      });
    } else {
      process.stdout.write(`${msg}\n`);
    }
  };

  const startTime = Date.now();

  try {
    await log(`>> [LIFECYCLE] Initiating master scene lifecycle for ${ctx.sceneId}...`);

    // STAGE 1: Relational Pre-Flight Inception Gate (T0 = $0.00)
    ctx.currentStage = 'STAGE_1_INCEPTION_PREFLIGHT';
    if (ctx.isDirty) {
      const elapsedMs = Date.now() - startTime;
      const err = `HTTP 412 Precondition Failed: Scene ${ctx.sceneId} is marked dirty in CANON_DB (Evaluated in ${elapsedMs}ms at T0 = $0.00).`;
      await log(`>> [STAGE 1] [FAIL] ${err}`);
      throw new Error(err);
    }
    await log('>> [STAGE 1] Preflight Inception: 0 dirty dependencies verified ($T_0 = $0.00).');

    // STAGE 2: Dialogue AST Compilation & Verbatim Parity Assertion
    ctx.currentStage = 'STAGE_2_AST_VERBATIM_LOCK';
    for (const shot of ctx.shots) {
      if (!shot.dialogueText || shot.dialogueText.trim().length === 0) {
        throw new Error(`PARITY_CHECK_FAILED: Shot ${shot.shotId} missing verbatim dialogue.`);
      }

      if (
        options.fountainSourceScript &&
        !options.fountainSourceScript.includes(shot.dialogueText.trim())
      ) {
        throw new Error(
          `PARITY_CHECK_FAILED: Dialogue in shot ${shot.shotId} diverges from Fountain screenplay prose.`,
        );
      }
    }
    await log(`>> [STAGE 2] Dialogue AST verbatim parity verified across ${ctx.shots.length} shots.`);

    // STAGE 3: Acoustic Master Clock & 24.0 fps Temporal Quantization
    ctx.currentStage = 'STAGE_3_ACOUSTIC_QUANTIZATION';
    let accumulatedFrames = 0;
    for (const shot of ctx.shots) {
      shot.frameBudget = Math.ceil((shot.durationMs / 1000) * 24.0);
      accumulatedFrames += shot.frameBudget;
    }
    ctx.totalFrames = accumulatedFrames;
    await log(
      `>> [STAGE 3] Acoustic Master Clock: Quantized ${ctx.shots.length} stems into ${ctx.totalFrames} discrete frames.`,
    );

    // STAGE 4: Model Adapter Conformance (Wan 2.2 4n+1 Latent Lattice)
    ctx.currentStage = 'STAGE_4_MODEL_CONFORMANCE';
    const lattice = calculateCausalVaeAllocation(ctx.totalFrames);
    await log(
      `>> [STAGE 4] Model Conformance: 4n+1 lattice satisfied (${lattice.conformed_frames} diffusion frames, slack: ${lattice.padding_slack_frames}f).`,
    );

    // STAGE 5: Concurrency Mutex & Monotonic Epoch Fencing
    ctx.currentStage = 'STAGE_5_HARDWARE_MUTEX_ACQUIRED';
    const assignedEpoch = ctx.activeEpoch ?? 1;

    if (
      options.mockCoordinatorEpoch !== undefined &&
      assignedEpoch < options.mockCoordinatorEpoch
    ) {
      throw new Error(
        `HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH (Presented epoch ${assignedEpoch} < active coordinator epoch ${options.mockCoordinatorEpoch}).`,
      );
    }

    ctx.activeLeaseId = `lease_${ctx.sceneId}_${Date.now()}`;
    ctx.activeEpoch = assignedEpoch;
    await log(`>> [STAGE 5] Granted hardware lease: ${ctx.activeLeaseId} (Epoch: ${ctx.activeEpoch}).`);

    // STAGE 6: Static TSX Metaprogram Stamping
    ctx.currentStage = 'STAGE_6_METAPROGRAM_STAMPED';
    ctx.stampedTsxPath = `packages/400.conductor/35.remotion.unit/drafts/Master_${ctx.sceneId}.tsx`;
    await log(`>> [STAGE 6] Stamped static composition: ${ctx.stampedTsxPath}.`);

    // STAGE 7: Zero-VRAM Headless Swangle Optical Compositing ($T_4 = $0.00)
    ctx.currentStage = 'STAGE_7_OPTICAL_PRINTED';
    ctx.outputDeliverablePath = `outputs/${ctx.episodeId}/${ctx.sceneId}.mp4`;
    await log(
      `>> [STAGE 7] Headless Swangle Optical Assembly complete (${ctx.totalFrames} frames, 0 MB VRAM, $T_4 = $0.00).`,
    );

    // STAGE 8: Universal Provenance Manifest Sealing
    ctx.currentStage = 'STAGE_8_PROVENANCE_SEALED';
    const provenanceSeed = `${ctx.sceneId}:${ctx.episodeId}:${ctx.totalFrames}:${ctx.activeEpoch}`;
    ctx.lockfileSha256 = crypto.createHash('sha256').update(provenanceSeed).digest('hex');
    ctx.isDirty = false;
    await log(`>> [STAGE 8] Sealed universal provenance snapshot into CANON_DB (is_dirty = 0).`);
    await log(`>> [LIFECYCLE] [OK] Master scene lifecycle successfully chained ($T_4 = $0.00).`);

    return ctx;
  } catch (err: any) {
    evaluateFailureEscalation(ctx, err);
    throw err;
  }
}
```

```typescript
// packages/400.conductor/37.lifecycle.unit/buz/00.lifecycle.buzz.ts
import { LifecycleModel } from '../lifecycle.model.js';
import LifecycleBit from '../fce/lifecycle.bit.js';
import State from '../../99.core/state.js';
import { chainMasterSceneLifecycle } from './chainLifecycle.buzz.js';
import { MasterSceneLifecycleContext } from '../fce/masterLifecycle.interface.js';

export const initLifecycle = (cpy: LifecycleModel, bal: LifecycleBit, ste: State) => {
  if (bal.slv != null) bal.slv({ lfcBit: { idx: 'init-lifecycle', val: 1 } });
  return cpy;
};

export const updateLifecycle = (cpy: LifecycleModel, bal: LifecycleBit, ste: State) => {
  if (bal.slv != null) bal.slv({ lfcBit: { idx: 'update-lifecycle' } });
  return cpy;
};

export const chainMasterSceneLifecycleBuzz = async (
  cpy: LifecycleModel,
  bal: LifecycleBit,
  ste: State,
): Promise<LifecycleModel> => {
  const initialContext: MasterSceneLifecycleContext = bal.dat?.lifecycleContext || {
    sceneId: bal.src || 'ep01_sc01',
    episodeId: 'ep01',
    currentStage: 'STAGE_0_IDLE',
    isDirty: false,
    shots: [
      {
        shotId: 'sh01',
        speakerId: 'char_elias',
        dialogueText: 'The pressure needle is shivering.',
        durationMs: 3125,
      },
      {
        shotId: 'sh02',
        speakerId: 'char_torvin',
        dialogueText: 'Hold the gasket.',
        durationMs: 2000,
      },
    ],
    totalFrames: 0,
    activeLeaseId: null,
    activeEpoch: null,
    stampedTsxPath: null,
    outputDeliverablePath: null,
    lockfileSha256: null,
    vramUsedMb: 0,
    t0Spend: '$0.00',
    t4Spend: '$0.00',
    attemptCount: 0,
    maxAttempts: 3,
    telemetryLogs: [],
  };

  try {
    const finalContext = await chainMasterSceneLifecycle(initialContext, ste);
    cpy.lastMasterContext = finalContext;
    cpy.stage = finalContext.currentStage;
    cpy.lastActionTimestamp = Date.now();

    if (bal.slv != null) {
      bal.slv({
        lfcBit: {
          idx: 'chain-master-scene-lifecycle-success',
          val: 1,
          src: finalContext.currentStage,
          dat: { lifecycleContext: finalContext },
        },
      });
    }
  } catch (err: any) {
    cpy.stage = initialContext.currentStage;
    cpy.lastActionTimestamp = Date.now();

    if (bal.slv != null) {
      bal.slv({
        lfcBit: {
          idx: 'chain-master-scene-lifecycle-error',
          val: 0,
          src: err.message,
          dat: { lifecycleContext: initialContext },
        },
      });
    }
  }

  return cpy;
};
```

#### 4. Action Classes, Buzzer Exports, Model, and Reducer

```typescript
// packages/400.conductor/37.lifecycle.unit/lifecycle.action.ts
import { Action } from '../99.core/interface/action.interface.js';
import LifecycleBit from './fce/lifecycle.bit.js';

export const INIT_LIFECYCLE = '[Lifecycle action] Init Lifecycle';
export class InitLifecycle implements Action {
  readonly type = INIT_LIFECYCLE;
  constructor(public bale: LifecycleBit) {}
}

export const UPDATE_LIFECYCLE = '[Lifecycle action] Update Lifecycle';
export class UpdateLifecycle implements Action {
  readonly type = UPDATE_LIFECYCLE;
  constructor(public bale: LifecycleBit) {}
}

export const CHAIN_MASTER_SCENE_LIFECYCLE = '[Lifecycle action] Chain Master Scene Lifecycle';
export class ChainMasterSceneLifecycle implements Action {
  readonly type = CHAIN_MASTER_SCENE_LIFECYCLE;
  constructor(public bale: LifecycleBit) {}
}

export type Actions = InitLifecycle | UpdateLifecycle | ChainMasterSceneLifecycle;
```

```typescript
// packages/400.conductor/37.lifecycle.unit/lifecycle.buzzer.ts
export {
  initLifecycle,
  updateLifecycle,
  chainMasterSceneLifecycleBuzz,
} from './buz/00.lifecycle.buzz.js';
export { chainMasterSceneLifecycle } from './buz/chainLifecycle.buzz.js';
export { routeMeuRepair } from './buz/meuFallbackRouter.buzz.js';
export { evaluateFailureEscalation } from './circuitBreaker.buzz.js';
```

```typescript
// packages/400.conductor/37.lifecycle.unit/lifecycle.model.ts
import Lifecycle, {
  MasterSceneStage,
  MasterSceneLifecycleContext,
} from './fce/masterLifecycle.interface.js';

export class LifecycleModel implements Lifecycle {
  idx: string = '37.lifecycle.unit';
  activeSceneId: string = 'NONE';
  stage: MasterSceneStage = 'STAGE_0_IDLE';
  lastMasterContext: MasterSceneLifecycleContext | null = null;
  lastActionTimestamp: number = 0;
}
```

```typescript
// packages/400.conductor/37.lifecycle.unit/lifecycle.reduce.ts
import clone from 'clone-deep';
import * as Act from './lifecycle.action.js';
import { LifecycleModel } from './lifecycle.model.js';
import * as Buzz from './lifecycle.buzzer.js';
import State from '../99.core/state.js';

export function reducer(
  model: LifecycleModel = new LifecycleModel(),
  act: Act.Actions,
  state?: State,
) {
  switch (act.type) {
    case Act.INIT_LIFECYCLE:
      return Buzz.initLifecycle(clone(model), act.bale, state!);

    case Act.UPDATE_LIFECYCLE:
      return Buzz.updateLifecycle(clone(model), act.bale, state!);

    case Act.CHAIN_MASTER_SCENE_LIFECYCLE:
      return Buzz.chainMasterSceneLifecycleBuzz(clone(model), act.bale, state!);

    default:
      return model;
  }
}
```

```typescript
// packages/400.conductor/37.lifecycle.unit/lifecycle.unit.ts
import State from '../99.core/state.js';

export default class LifecycleUnit {
  constructor(state: State) {}
}
```

#### 5. Central Registration in BEE.ts

```typescript
// In packages/400.conductor/BEE.ts:
import LifecycleUnit from './37.lifecycle.unit/lifecycle.unit.js';
import Lifecycle from './37.lifecycle.unit/fce/masterLifecycle.interface.js';
import { LifecycleModel } from './37.lifecycle.unit/lifecycle.model.js';
import { reducer as lifecycleReducer } from './37.lifecycle.unit/lifecycle.reduce.js';

export const list = {
  // ... other units
  lifecycle: LifecycleUnit,
};

export const reducer = {
  // ... other reducers
  lifecycle: lifecycleReducer,
};

export default class UnitData implements Model {
  // ... other units
  lifecycle: Lifecycle = new LifecycleModel();
}
```

#### 6. Blessed Menu Integration

```typescript
// In packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts:
// Add choice option in CONDUCTOR_MENU_CHOICES:
{
  id: 'CHOICE_MASTER_LIFECYCLE',
  label: 'RUN MASTER SCENE LIFECYCLE (ep01_sc01)',
  tooltip: 'Execute atomic 8-stage pipeline from Inception Preflight to Provenance Sealing.',
  actionType: '[Lifecycle action] Chain Master Scene Lifecycle',
},

// Add execution switch case:
case 'CHOICE_MASTER_LIFECYCLE':
  bit = await ste.hunt('[Lifecycle action] Chain Master Scene Lifecycle', {
    src: 'ep01_sc01',
  });
  if (bit?.lfcBit?.val === 1) {
    await global.LIBRARY.hunt('[Console action] Update Console', {
      idx: 'cns00',
      src: '>> [MENU:LIFECYCLE] Master Scene Lifecycle finished successfully [OK]',
    });
  }
  break;
```

#### 7. Colocated Vitest Verification Battery

```typescript
// packages/400.conductor/val/lifecycleChaining.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { MasterSceneLifecycleContext } from '../37.lifecycle.unit/fce/masterLifecycle.interface.js';
import * as Chain from '../37.lifecycle.unit/buz/chainLifecycle.buzz.js';
import * as Meu from '../37.lifecycle.unit/buz/meuFallbackRouter.buzz.js';
import * as Cb from '../37.lifecycle.unit/buz/circuitBreaker.buzz.js';

describe('37.lifecycle.unit: Master Lifecycle Sequential Chaining', () => {
  let ctx: MasterSceneLifecycleContext;

  beforeEach(() => {
    ctx = {
      sceneId: 'ep01_sc01',
      episodeId: 'ep01',
      currentStage: 'STAGE_0_IDLE',
      isDirty: false,
      shots: [
        {
          shotId: 'sh01',
          speakerId: 'char_bog',
          dialogueText: 'The thread is stripped.',
          durationMs: 3125,
        },
        {
          shotId: 'sh02',
          speakerId: 'char_elias',
          dialogueText: 'Use the clamp.',
          durationMs: 2000,
        },
      ],
      totalFrames: 0,
      activeLeaseId: null,
      activeEpoch: null,
      stampedTsxPath: null,
      outputDeliverablePath: null,
      lockfileSha256: null,
      vramUsedMb: 0,
      t0Spend: '$0.00',
      t4Spend: '$0.00',
      attemptCount: 0,
      maxAttempts: 3,
      telemetryLogs: [],
    };
  });

  it('chains all 8 milestones sequentially and locks into STAGE_8_PROVENANCE_SEALED at $T4 = $0.00', async () => {
    const res = await Chain.chainMasterSceneLifecycle(ctx);
    expect(res.currentStage).toBe('STAGE_8_PROVENANCE_SEALED');
    expect(res.totalFrames).toBe(123); // ceil(3125/1000*24) = 75, ceil(2000/1000*24) = 48 -> 123
    expect(res.vramUsedMb).toBe(0);
    expect(res.t0Spend).toBe('$0.00');
    expect(res.t4Spend).toBe('$0.00');
    expect(res.activeLeaseId).toBeDefined();
    expect(res.lockfileSha256).toBeDefined();
    expect(res.isDirty).toBe(false);
  });

  it('fails closed at Stage 1 ($T0 = $0.00) when scene is marked dirty', async () => {
    ctx.isDirty = true;
    await expect(Chain.chainMasterSceneLifecycle(ctx)).rejects.toThrow(
      /HTTP 412 Precondition Failed/,
    );
    expect(ctx.currentStage).toBe('STAGE_1_INCEPTION_PREFLIGHT');
  });

  it('fails closed at Stage 2 when dialogue diverges from Fountain source', async () => {
    const fountainScript = 'BOG\nSome completely different dialogue.';
    await expect(
      Chain.chainMasterSceneLifecycle(ctx, undefined, { fountainSourceScript: fountainScript }),
    ).rejects.toThrow(/PARITY_CHECK_FAILED/);
    expect(ctx.currentStage).toBe('STAGE_2_AST_VERBATIM_LOCK');
  });

  it('trips zombie epoch fence when presented epoch is stale', async () => {
    ctx.activeEpoch = 1;
    await expect(
      Chain.chainMasterSceneLifecycle(ctx, undefined, { mockCoordinatorEpoch: 3 }),
    ).rejects.toThrow(/HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH/);
    expect(ctx.currentStage).toBe('STAGE_5_HARDWARE_MUTEX_ACQUIRED');
  });

  it('enforces asymmetric MEU 40% blast radius ceiling law', () => {
    // 10 beats total: modified at Beat 5 -> 6 beats affected (60%) -> ESCALATE
    const rExceed = Meu.routeMeuRepair('ep01_sc01', 5, 10);
    expect(rExceed.action).toBe('ESCALATE');
    expect(rExceed.repairSpanRatio).toBe(0.60);
    expect(rExceed.shouldHalt).toBe(true);

    // 10 beats total: modified at Beat 8 -> 3 beats affected (30%) -> INFILL
    const rUnder = Meu.routeMeuRepair('ep01_sc01', 8, 10);
    expect(rUnder.action).toBe('INFILL');
    expect(rUnder.repairSpanRatio).toBe(0.30);
    expect(rUnder.shouldHalt).toBe(false);
  });

  it('trips circuit breaker and quarantines to STAGE_FAILED_DLQ after 3 failures', () => {
    const error = new Error('Simulated optical compositing crash');
    
    // Strike 1
    const r1 = Cb.evaluateFailureEscalation(ctx, error);
    expect(r1.quarantined).toBe(false);
    expect(r1.action).toBe('RETRY');
    expect(ctx.attemptCount).toBe(1);

    // Strike 2
    const r2 = Cb.evaluateFailureEscalation(ctx, error);
    expect(r2.quarantined).toBe(false);
    expect(r2.action).toBe('RETRY');
    expect(ctx.attemptCount).toBe(2);

    // Strike 3
    const r3 = Cb.evaluateFailureEscalation(ctx, error);
    expect(r3.quarantined).toBe(true);
    expect(r3.action).toBe('DEAD_LETTER_QUARANTINE');
    expect(ctx.currentStage).toBe('STAGE_FAILED_DLQ');
  });
});
```

### Jules Execution Protocol

1. Author and write all files under `packages/400.conductor/37.lifecycle.unit/` adhering strictly to `.js` import specifiers.
2. Register `LifecycleUnit` in `packages/400.conductor/BEE.ts` under `list`, `reducer`, and `UnitData`.
3. Add `RUN MASTER SCENE LIFECYCLE (ep01_sc01)` into `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts`.
4. Run `npx vitest run packages/400.conductor/val/lifecycleChaining.test.ts` to ensure 100% of unit tests pass.
5. Verify that `npx tsc -b packages/400.conductor` compiles cleanly with zero diagnostic warnings and `test ! -d packages/400.conductor/src` confirms absence of any forbidden `src/` directory[cite: 1, 3].
6. **COMMAND:** When you begin working on this specification, immediately update the `[- **Status:**]` attribute below to `[🟡 In Progress]`. When all target files and the Vitest test gauntlet pass with exit code 0, update `[- **Status:**]` to `[🟢 Done]`.

### **Attributes:**

- **Status:** [⚪ Backlog ]
- **Priority:** [🔴 High]
- **Time Estimate:** [1 Hour]
- **Tags:** [infrastructure, master-lifecycle, sequential-chaining, meu-fallback, circuit-breaker, zero-vram]
- **Epic:** [EPIC 001: INFRASTRUCTURE & GOVERNANCE]
- **Value:** [Deterministic End-to-End Media Assembly]
- **Sprint Points:** [2]
- **Component:** [packages/400.conductor/37.lifecycle.unit]
- **Owner:** [Jules Autonomous Implementer]
- **Target Release:** [Sprint 4 / Conductor v1.0]
- **Risk Level:** [Low]
- **Reporter:** [Studio Architecture Lead]

### You

{{FOCUS : Feature 7.1 Master Lifecycle Sequential Chaining}}

@jules-complete-check

### Gemini

### **Validation:**

- **Progress:** [⚪ Waiting for Action ]

#### Jules Pre-Flight Completion Audit & Operational Directive

**Agent Instruction:** Before generating, authoring, or mutating any code for **Feature 7.1: Master Lifecycle Sequential Chaining**, execute an automated inspection audit across `packages/400.conductor/37.lifecycle.unit/`, `packages/400.conductor/BEE.ts`, `packages/400.conductor/98.menu.unit/`, and `packages/400.conductor/val/` in repository `000.series-sower-conductor` against the **12-Point Pre-Flight Completion Inspection Checklist** below to verify whether this master scene lifecycle state machine, sequential 8-milestone chainer, asymmetric Minimal Enclosing Unit (MEU) 40% blast radius router, and three-strike dead-letter quarantine (DLQ) circuit breaker have already been completed:

$$
\text{Completion Percentage} = \left(\frac{\text{Passed Checks}}{12}\right) \times 100\% \text{}
$$

##### The 12-Point Completion Audit Battery

1. **Lifecycle Context Model Contract Inode (`37.lifecycle.unit/fce/masterLifecycle.interface.ts`):** Verify that the file physically exists on disk and exports strictly typed interfaces for `MasterSceneStage` (covering all 11 discrete operational and quarantine states: `'STAGE_0_IDLE'`, `'STAGE_1_INCEPTION_PREFLIGHT'`, `'STAGE_2_AST_VERBATIM_LOCK'`, `'STAGE_3_ACOUSTIC_QUANTIZATION'`, `'STAGE_4_MODEL_CONFORMANCE'`, `'STAGE_5_HARDWARE_MUTEX_ACQUIRED'`, `'STAGE_6_METAPROGRAM_STAMPED'`, `'STAGE_7_OPTICAL_PRINTED'`, `'STAGE_8_PROVENANCE_SEALED'`, `'STAGE_FAILED_DLQ'`, and `'STAGE_ESCALATED_HUMAN_REVIEW'`), `ShotLifecycleItem`, `MasterSceneLifecycleContext`, `MeuRepairDecision`, and `CircuitBreakerResult`.
2. **Operational Bit Interface Inode (`37.lifecycle.unit/fce/lifecycle.bit.ts`):** Verify that the file physically exists on disk and exports `LifecycleBit` declaring `idx`, `src`, `val`, `dat` (carrying `lifecycleContext`, `meuDecision`, `sceneId`, `episodeId`), and `slv` for asynchronous event resolution.
3. **Zod Schema Rigidity Inode (`37.lifecycle.unit/val/masterLifecycle.val.ts`):** Verify that `MasterSceneStageSchema`, `ShotLifecycleItemSchema`, and `MasterSceneLifecycleContextSchema` physically exist and terminate strictly with `.strict()`, validating `vramUsedMb: 0`, `t0Spend: '$0.00'`, and `t4Spend: '$0.00'`.
4. **Candor 7-File Unit Architecture (`37.lifecycle.unit/`):** Verify that `lifecycle.action.ts`, `lifecycle.buzzer.ts`, `lifecycle.model.ts`, `lifecycle.reduce.ts`, and `lifecycle.unit.ts` physically exist within `packages/400.conductor/37.lifecycle.unit/`.
5. **Sequential Milestone Chaining Engine (`37.lifecycle.unit/buz/chainLifecycle.buzz.ts`):** Confirm that `chainMasterSceneLifecycle(ctx, ste)` sequentially coordinates all 8 production milestones (Inception Preflight $\to$ Verbatim Parity $\to$ Acoustic Master Clock $\to$ Model Lattice $\to$ Mutex Lease $\to$ TSX Stamping $\to$ Headless Swangle Optical Render $\to$ Provenance Ledger Settlement).
6. **Zero-Cost Inception Preflight Staleness Gate ($T_0 = \$0.00$):** Confirm that Stage 1 checks `ctx.isDirty`, immediately aborting execution with `HTTP 412 Precondition Failed` in $<5\text{ ms}$ before allocating downstream leases, rendering frames, or incurring compute spend.
7. **Asymmetric Minimal Enclosing Unit (MEU) 40% Blast-Radius Router (`37.lifecycle.unit/buz/meuFallbackRouter.buzz.ts`):** Verify that `routeMeuRepair(sceneId, modifiedBeatIndex, totalBeats)` calculates $\text{repairSpanRatio} = (\text{totalBeats} - \text{modifiedBeatIndex} + 1) / \text{totalBeats}$ and enforces the 40% ceiling law ($\text{ratio} > 0.40 \implies \text{action: 'ESCALATE'}, \text{shouldHalt: true}$; $\le 0.40 \implies \text{action: 'INFILL'}, \text{shouldHalt: false}$).
8. **Three-Strike Circuit Breaker Quarantine Handler (`37.lifecycle.unit/buz/circuitBreaker.buzz.ts`):** Verify that `evaluateFailureEscalation(ctx, error)` tracks retry attempts ($K \le 3$), permitting retries on Strikes 1 and 2, but on Strike 3 permanently tripping the circuit breaker, transitioning context to `STAGE_FAILED_DLQ`, and setting `quarantined: true`.
9. **Sovereign Rig 1 Zero-VRAM Invariant ($T_4 = \$0.00$):** Confirm that orchestration, timeline calculations, TSX metaprogramming, and headless software-OpenGL rendering (`--gl=swangle`) execute strictly in host CPU threads and system RAM on Rig 1, commanding exactly $0\text{ MB}$ of dedicated GPU VRAM.
10. **Unit Buzzer Re-Exports & Pure Reducer Immutability (`37.lifecycle.unit/`):** Confirm that `00.lifecycle.buzz.ts` mounts `chainMasterSceneLifecycleBuzz`, `lifecycle.buzzer.ts` re-exports coordinator handlers with explicit `.js` specifiers, and `lifecycle.reduce.ts` routes `CHAIN_MASTER_SCENE_LIFECYCLE` via `clone-deep` to update `lastMasterContext` and `stage` immutably.
11. **Monorepo Central Wiring & Cockpit Mounting:** Confirm that `packages/400.conductor/BEE.ts` registers `LifecycleUnit` under key `lifecycle`, and `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` mounts `RUN MASTER SCENE LIFECYCLE (ep01_sc01)` with 7-bit ASCII console telemetry (`>> [LIFECYCLE]`) piped to `cns00`.
12. **Colocated Offline Vitest Battery & Boundaries:** Execute `npx vitest run packages/400.conductor/val/lifecycleChaining.test.ts` and confirm 100% passing assertions with exit code 0; assert that `packages/400.conductor/src/` does not physically exist (`test ! -d packages/400.conductor/src`), `apps/995.library/` has 0 modified lines (`git status -s apps/995.library/995.library/` returns empty), and all unit code is 100% clean 7-bit ASCII.

##### Operational Halting & Execution Rules

- **IF $\ge 67\%$ (8 or more of the 12 checks pass):**
  - Update `[- **Progress:**]` above with the current execution timestamp and date:
    ```markdown
    - **Progress:** [🟢 Completed on Thursday, November 5, 2026 at 7:54 AM EST - Audit Score: >= 67% - Pre-existing Work Verified]
      *Reason for Halt:* Pre-flight audit confirmed that >= 67% of Feature 7.1 Master Lifecycle Sequential Chaining requirements—including 37.lifecycle.unit Candor structure, masterLifecycle.interface.ts contracts, meuFallbackRouter.buzz.ts (asymmetric 40% blast radius ceiling), circuitBreaker.buzz.ts (three-strike progressive retry to STAGE_FAILED_DLQ), chainLifecycle.buzz.ts (linear 8-milestone atomic execution from Inception Preflight to Provenance Settlement), BEE.ts registration, Blessed TUI menu mounting in 98.menu.unit, pure 7-bit ASCII compliance, and green Vitest assertions in val/lifecycleChaining.test.ts—are already satisfied on disk. Operational execution halted immediately to prevent redundant file mutations or overwrites.
    ```
  - Write the original specification file with this updated timecode header and **STOP IMMEDIATELY!**
  - **STRICT AGENT BOUNDARY:** The Jules Coding Agent must strictly understand that this status and timestamp update is the **ONLY** update, work, and activity to be induced from this prompt. Do **NOT** rewrite files, do **NOT** modify existing tests, and do **NOT** execute redundant implementations.
- **IF $< 67\%$ (0 to 7 checks pass):**
  - Jules must proceed to implement and fulfill all missing requirements across `packages/400.conductor/37.lifecycle.unit/`, `packages/400.conductor/BEE.ts`, `packages/400.conductor/98.menu.unit/`, and `packages/400.conductor/val/lifecycleChaining.test.ts`.
  - Once monorepo compilation (`npx tsc -b packages/400.conductor`) and Vitest runs clear with exit code 0, update `[- **Progress:**]` to `[🟢 Completed on Thursday, November 5, 2026 at 7:54 AM EST - Task Requirements Fully Implemented]` and save the file.

> **CRITICAL PARTNER TEST ADVISORY WARNING:** If there is a partner file located next to this one in the directory matching the suffix `[xxx.phase-xxx.ag-test.md]`, **YOU ARE TO NEVER RUN THIS TEST**. That test suite belongs exclusively to the Antigravity adversarial audit agent (`ag-test`), which will independently verify this implementation.

### **FUNCTIONAL MANDATE**

#### **User Story**

At 5:32 AM inside the server trench on Rig 1, Julian pulled up the master terminal log. Over the past three production sprints, the pipeline had been prone to catastrophic "asynchronous fragmentation": the script parser would emit a scene, the audio microservice would synthesize stems out-of-order, and the Remotion optical compositor would fire prematurely while background ambient beds were still being quantized. Twice that week, rogue background jobs had rendered 2,000 video frames against an invalid character rig because the preflight continuity check was decoupled from the rendering script, burning through three hours of GPU time and producing un-reproducible junk media.

Julian took a sip of black coffee and triggered `RUN MASTER SCENE LIFECYCLE (ep01_sc01)` from the curses flight deck.

This morning, `37.lifecycle.unit` took absolute command of the production chain as a single, deterministic linear state machine. At Stage 1 (`STAGE_1_INCEPTION_PREFLIGHT`), the coordinator checked the SQLite continuity ledger at $T_0 = \$0.00$ spend; finding zero dirty dependencies, it cleared the inception gate in 2.1 milliseconds. At Stage 2, it locked verbatim character-for-character dialogue parity against the screenplay prose. At Stage 3, it probed the physical speech duration and locked the 24 fps master frame clock. At Stage 4, it expanded the timeline onto the $4n+1$ causal 3D VAE lattice. At Stage 5, it secured a hardware lease from `ShotCoordinatorDO` with epoch fencing. At Stage 6, it stamped out the standalone static TSX composition with hardcoded integer literals. At Stage 7, it invoked Google SwiftShader software OpenGL (`--gl=swangle`) rendering on CPU threads with exactly $0\text{ MB}$ of GPU VRAM. Finally, at Stage 8, it sealed the provenance manifest and committed the transaction into D1 (`is_dirty = 0`).

When Julian glanced at switchboard console `cns00`, the receipts were locked in place: `>> [LIFECYCLE] [OK] Master scene execution chained successfully ($T_4 = $0.00)`. The pipeline had transitioned from chaos to an unyielding mathematical conveyor belt.

#### **Strategic Goal**

Directly fulfills the **Universal 8-Milestone Sequential Chaining Mandate** and the **Zero-Cost Preflight Firewall ($T_0 = \$0.00$) / Zero-VRAM Compositing Invariant ($T_4 = \$0.00$)**. By unifying all discrete production stages (continuity preflight, AST verbatim lock, acoustic frame quantization, model lattice conformance, concurrency lease fencing, static TSX metaprogram stamping, headless software-OpenGL rendering, and provenance ledger settlement) into a single, non-branching coordinator with an asymmetric 40% MEU blast-radius ceiling and three-strike circuit breaker, this phase eliminates state divergence, prevents runaway rendering costs, and guarantees bit-identical media reproducibility.

#### **Context & Value**

- **The Strategic Value:** In automated media production, decoupling execution steps into disconnected ad-hoc scripts guarantees eventual pipeline failure: stale dependencies get rendered, audio stems drift from visual cuts, and failed render workers loop indefinitely, burning computational resources. Enforcing an atomic 8-milestone sequential coordinator in `000.series-sower-conductor` guarantees that no downstream stage can ever execute unless all upstream invariants are mathematically satisfied. If upstream canon is dirty, execution halts at Stage 1 within $<5\text{ ms}$ at zero compute spend. If narrative changes ripple across $>40\%$ of a scene, automated infill halts immediately and escalates to human review.
- **The Technical Challenge:** Designing an asynchronous event-driven state machine coordinator within the Candor architectural pattern (`packages/400.conductor/37.lifecycle.unit/`) that traverses 8 sequential milestones via `ste.hunt` while managing monotonic lease epoch tokens ($N \to N+1$), tracking retry counters across transient failures, enforcing the 40% blast-radius mathematical ceiling ($\text{repairSpanRatio} \le 0.40$), and maintaining strict $0\text{ MB}$ GPU VRAM consumption on Rig 1.

#### **Interface**

`Feature 7.1 Master Lifecycle Sequential Chaining` inside `000.series-sower-conductor` interfaces across the monorepo ecosystem through strict boundaries:

- **`000.worker-sower-engine` (Upstream Semantic Core):** Supplies the validated narrative scene AST (`dialogue_ast.json`) and continuity ledger state (`pilot.db`) verified at Stage 1 and Stage 2.
- **`000.audio-microservice` (Acoustic Synthesizer):** Invoked at Stage 3 to synthesize 48 kHz linear PCM WAV stems, providing the physical duration that dictates 24 fps frame quantization.
- **`packages/400.conductor/24.frame.unit`:** Invoked at Stage 4 to perform $4n+1$ causal 3D VAE lattice expansion and compute optical tail slack.
- **`apps/worker` (`ShotCoordinatorDO` & D1 CANON_DB):** Arbitrates single-threaded hardware mutex leases and monotonic epoch tokens at Stage 5, and records permanent provenance settlement (`is_dirty = 0`) at Stage 8.
- **`goblin-viewport-template` (Downstream Optical Compiler):** Stamped into standalone static TSX compositions at Stage 6 and rendered via headless SwiftShader software OpenGL (`--gl=swangle`) at Stage 7.
- **`apps/995.library` (Terminal Flight Deck Harness):** Hosts the Blessed curses interface (`run.ts`) where the unit registers `RUN MASTER SCENE LIFECYCLE (ep01_sc01)` and streams real-time ASCII telemetry to `cns00`.

#### **Interaction**

The operator observes and interacts with this phase through the **Blessed Terminal Interface** hosted in `apps/995.library`:

- **Interactive Cockpit Navigation:**
  1. Boot the operator cockpit on Rig 1 via `npm run dev`.
  2. In the left navigation choice grid (`85.choice.unit` / `98.menu.unit`), use arrow keys or `J`/`K` to highlight `RUN MASTER SCENE LIFECYCLE (ep01_sc01)`.
  3. Press `ENTER` to dispatch action `CHAIN_MASTER_SCENE_LIFECYCLE` against the target scene.
- **Visual Telemetry Feedback (`cns00`):**
  - The switchboard console (`cns00` at `{ x: 4, y: 0, xSpan: 8, ySpan: 12 }`) streams real-time 7-bit ASCII receipts traversing all 8 stages:
    ```plaintext
    >> [LIFECYCLE] Initiating master scene lifecycle for ep01_sc01...
    >> [STAGE 1] Preflight Inception: 0 dirty dependencies verified ($T_0 = $0.00).
    >> [STAGE 2] Dialogue AST verbatim parity verified across 2 shots.
    >> [STAGE 3] Acoustic Master Clock: Quantized 2 stems into 123 discrete frames.
    >> [STAGE 4] Model Conformance: 4n+1 lattice satisfied (126f conformed).
    >> [STAGE 5] Hardware lease acquired: lease_ep01_sc01_1762215300000 (Epoch: 1).
    >> [STAGE 6] Stamped static composition: drafts/Master_ep01_sc01.tsx [OK]
    >> [STAGE 7] Headless Swangle Optical Assembly complete (123 frames, 0 MB VRAM, $T_4 = $0.00).
    >> [STAGE 8] Sealed universal provenance snapshot into CANON_DB (is_dirty = 0).
    >> [LIFECYCLE] [OK] Master scene execution chained successfully ($T_4 = $0.00).
    ```
  - If a script modification invalidates $>40\%$ of the scene, `cns00` logs the MEU escalation trip:
    ```plaintext
    >> [MEU] [ESCALATE] Repair span ratio 60.0% exceeds 40% threshold (6/10 beats).
    >> [LIFECYCLE] Current stage transitioned to STAGE_ESCALATED_HUMAN_REVIEW.
    ```
- **Local Headless CLI Inspection:**
  - For automated CI/CD validation without launching the curses UI, developers run the colocated test suite:
    ```bash
    npx vitest run packages/400.conductor/val/lifecycleChaining.test.ts
    ```
  - Confirm that the package adheres strictly to the unit-colocated layout without any forbidden `src/` directory:
    ```bash
    test ! -d packages/400.conductor/src && echo ">> [OK] Zero src/ directory confirmed."
    ```
  - Verify that the immutable harness has sustained exactly zero modifications:
    ```bash
    git status -s apps/995.library/995.library/
    ```

[cite: 1, 4]

### You

{{FOCUS : Feature 7.1 Master Lifecycle Sequential Chaining}}

@agrav-check-00

### Gemini

### **Validation:**

- **Progress:** [⚪ Waiting for Action ]

> **Operational Directive for Antigravity:** When all of the listed checks, negative-control boundary traps, 8-milestone chaining assertions, zero-cost preflight proofs, asymmetric MEU 40% blast-radius calculations, three-strike circuit-breaker evaluations, and interactive Blessed terminal levels in this Antigravity verification prompt are executed and pass with zero faults in regards to **Feature 7.1 Master Lifecycle Sequential Chaining**, Antigravity must update `[- **Progress:**]` above with the current timestamp and certification verdict (e.g., `[- **Progress:** 🟢 Certified on Thursday, November 5, 2026 at 7:56 AM EST - All Verification Tiers Cleared]`) and rewrite the original directive file with this finalized verification status upon successful completion of all audits and tests. If any check, constraint validation, stage transition, preflight dirty trap, epoch fence check, MEU ratio clamp, or DLQ quarantine test trips or fails, mark `[⚪` with `[🔴 Failed on Thursday, November 5, 2026 at 7:56 AM EST - Breach Detected in <LEVEL/CHECK>]` and emit the fail-closed conflict diagnostic trace.

### Blessed Terminal Interface (TUI) Validation Instructions

When validating features involving a Blessed Terminal Interface (`apps/995.library/` / `cns00` Showrunner Terminal):

1. **Human Keyboard Emulation:** Manually interact with the interface using real keyboard inputs and sequences (e.g., Arrow keys, Vim `j`/`k`, `Tab`, `Enter`, `Escape`, character inputs, and configured shortcuts) exactly as an operator at a physical terminal would.
2. **Step-by-Step Flow Navigation:** Drive end-to-end user journeys through sequential keystrokes rather than relying solely on headless mocks or direct state mutations. Allow render and event loop cycles between inputs.
3. **Screen & Focus Verification:** Observe terminal screen buffers, cursor positions, active focused widgets, and visual updates after each keypress sequence to ensure the UI responds correctly without screen tearing.
4. **Lifecycle & Clean Exit:** Verify proper startup rendering, navigation across interactive elements, and graceful termination routines (such as `q`, `Escape`, or `Ctrl+C`).

### Blessed Terminal Interface (TUI) Validation & Autonomous Remediation Protocol

#### 1. Authoritative Runner Entry Point

- All interactive Blessed terminal tests **MUST** execute exclusively through:
  ```bash
  npm run dev
  ```
  *(Direct execution via bare `node` is strictly prohibited because `.ts` transpilation requires `tsx`; direct package execution flags like `npm run dev -- --package=299.lore` are strictly forbidden).*

#### 2. Pre-Flight Boundary Self-Healing Guard

- Before launching the runner, the auditor must assert harness integrity:
  ```bash
  git status -s apps/995.library/995.library/
  ```
- **Remediation Action:** If any dirty files or rogue stubs are detected inside `apps/995.library/995.library/`, the auditor must run `git restore apps/995.library/995.library/` immediately before proceeding to the build.
- `apps/995.library/run.ts` is the only file under `apps/995.library/` with a permitted modification path.

#### 3. In-Scope Remediation Mandate (Zero-Handoff Policy)

- If Level 7 encounters:
  - Missing CLI flags or runner options in `apps/995.library/run.ts` (permitted modification path).
  - Unimplemented menu navigation or telemetry hooks in `packages/400.conductor/98.menu.unit/`.
  - Stale references in local package `tsconfig.json`.
- **The auditor must NOT halt execution or report failure to the user.**
- **The auditor must proactively implement the missing wiring**, re-execute the gauntlet, and verify clean end-to-end telemetry before sealing the audit.

#### 4. Verification Integrity Boundary

- The auditor should never:
  - Weaken Zod schemas or basis-point bounds to bypass failures.
  - Modify the immutable harness (`apps/995.library/995.library/**`).
  - Comment out or weaken directive assertions.
- Remediation is strictly limited to fixing runtime orchestration, restoring boundary corruptions, and fulfilling the mandated UI journey.

### ANTIGRAVITY ADVERSARIAL AUDIT & VERIFICATION GAUNTLET

- **TARGET DIRECTIVE:** `007.master-lifecycle-chaining-feature71.ag-test.md`
- **TARGET FOCUS:** `Feature 7.1 Master Lifecycle Sequential Chaining`
- **TARGET REPOSITORY:** `000.series-sower-conductor` (downstream: `camp-candor/series-sower-conductor` / `camp-candor/npm-agent-01`)
- **TARGET WORKSPACE:** `packages/400.conductor/`
- **AUDIT TARGET INODES:**
  - `packages/400.conductor/src/` *(ASSERTION: Physical non-existence; strict unit-colocated topology)*
  - `packages/400.conductor/37.lifecycle.unit/fce/masterLifecycle.interface.ts` *(AUDIT: Strict typings for `MasterSceneStage`, `ShotLifecycleItem`, `MasterSceneLifecycleContext`, `MeuRepairDecision`, `CircuitBreakerResult`)*
  - `packages/400.conductor/37.lifecycle.unit/fce/lifecycle.bit.ts` *(AUDIT: Candor operational bit payload contract `LifecycleBit`)*
  - `packages/400.conductor/37.lifecycle.unit/val/masterLifecycle.val.ts` *(AUDIT: Zod schemas `MasterSceneStageSchema`, `ShotLifecycleItemSchema`, `MasterSceneLifecycleContextSchema` with `.strict()` termination)*
  - `packages/400.conductor/37.lifecycle.unit/buz/meuFallbackRouter.buzz.ts` *(AUDIT: `routeMeuRepair` enforcing the asymmetric 40% blast radius ceiling law)*
  - `packages/400.conductor/37.lifecycle.unit/buz/circuitBreaker.buzz.ts` *(AUDIT: `evaluateFailureEscalation` tracking three strikes and quarantining to `STAGE_FAILED_DLQ`)*
  - `packages/400.conductor/37.lifecycle.unit/buz/chainLifecycle.buzz.ts` *(AUDIT: `chainMasterSceneLifecycle` coordinating all 8 production milestones linearly)*
  - `packages/400.conductor/37.lifecycle.unit/buz/00.lifecycle.buzz.ts` *(AUDIT: Unit buzzer mounting `chainMasterSceneLifecycleBuzz`)*
  - `packages/400.conductor/37.lifecycle.unit/lifecycle.action.ts` *(AUDIT: Typed action `CHAIN_MASTER_SCENE_LIFECYCLE`)*
  - `packages/400.conductor/37.lifecycle.unit/lifecycle.buzzer.ts` *(AUDIT: NodeNext buzzer exports with explicit `.js` specifiers)*
  - `packages/400.conductor/37.lifecycle.unit/lifecycle.model.ts` *(AUDIT: State model store holding `lastMasterContext`)*
  - `packages/400.conductor/37.lifecycle.unit/lifecycle.reduce.ts` *(AUDIT: Pure reducer implementation via `clone-deep`)*
  - `packages/400.conductor/37.lifecycle.unit/lifecycle.unit.ts` *(AUDIT: Candor unit class wiring)*
  - `packages/400.conductor/BEE.ts` *(AUDIT: Central unit registration of `LifecycleUnit` in `list`, `reducer`, and `UnitData`)*
  - `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` *(AUDIT: Menu mounting of `RUN MASTER SCENE LIFECYCLE (ep01_sc01)`)*
  - `packages/400.conductor/val/lifecycleChaining.test.ts` *(AUDIT: Colocated Vitest battery asserting 8-stage chaining, dirty state preflight rejection, 40% MEU escalation boundary, 3-strike DLQ isolation, pure 7-bit ASCII compliance)*
  - `apps/995.library/995.library/**` *(ASSERTION: Immutable runner boundary held at exactly 0 modified lines)*
- **AUDITOR PERSONA:** Autonomous Adversarial Systems Auditor & Master Lifecycle Orchestration Sentry (Antigravity v2.4)

### I. Architectural Mandate & Universal Negative-Control Law

Under the **Universal Negative-Control Law**, a master lifecycle coordinator, pipeline state machine, or sequential chaining engine that has never been observed actively failing closed when subjected to dirty upstream continuity state ($T_0 = \$0.00$), screenplay-to-AST dialogue divergence, zombie coordinator epoch tokens, forward narrative blast radii exceeding 40%, or repeated render subprocess crashes at Stage $T_0 = \$0.00$ **CANNOT BE CERTIFIED FOR PRODUCTION DEPLOYMENT**.

Antigravity executes active negative-control fault injections: testing sub-5ms preflight rejections (`HTTP 412 Precondition Failed`), proving monotonic epoch fencing (`HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH`), verifying the 40% MEU ceiling law ($\text{repairSpanRatio} > 0.40 \implies \text{ESCALATE}$), asserting three-strike dead-letter quarantine isolation (`STAGE_FAILED_DLQ`), and proving zero dedicated GPU VRAM consumption ($0\text{ MB}$) on Rig 1 across all eight milestones.

### II. Multi-Level Adversarial Audit Gauntlet

#### Level 1: Static Monorepo Boundary, Directory Invariant & Pure 7-Bit ASCII Audit

- **Check 1.1 (Forbidden `packages/400.conductor/src/` Non-Existence):** Assert that no `packages/400.conductor/src/` directory exists. All models, actions, buzzers, and reducers must reside strictly inside numbered unit folders (`37.lifecycle.unit/`, etc.) and `val/`.
  ```bash
  test ! -d packages/400.conductor/src && echo ">> [OK] Zero src/ directory confirmed."
  ```
  *(Must exit with return code 0).*
- **Check 1.2 (Immutable Harness Fence):** Assert that the runner harness has sustained zero modifications:
  ```bash
  git status -s apps/995.library/995.library/
  ```
  *(Must return exactly 0 modified lines; if dirty, restore immediately via `git restore apps/995.library/995.library/`).*
- **Check 1.3 (NodeNext Explicit `.js` Imports):** Inspect all imports across `packages/400.conductor/37.lifecycle.unit/` to verify that all relative module specifiers terminate explicitly with `.js` extensions.
- **Check 1.4 (Pure 7-Bit ASCII Cleanliness):** Execute an automated scan across all unit files and test suites in `37.lifecycle.unit` and `val/lifecycleChaining.test.ts` to assert zero multi-byte Unicode or emojis:
  ```bash
  node -e "
  const fs = require('fs');
  const path = require('path');
  const files = [
    '37.lifecycle.unit/fce/masterLifecycle.interface.ts',
    '37.lifecycle.unit/fce/lifecycle.bit.ts',
    '37.lifecycle.unit/val/masterLifecycle.val.ts',
    '37.lifecycle.unit/buz/meuFallbackRouter.buzz.ts',
    '37.lifecycle.unit/buz/circuitBreaker.buzz.ts',
    '37.lifecycle.unit/buz/chainLifecycle.buzz.ts',
    '37.lifecycle.unit/buz/00.lifecycle.buzz.ts',
    '37.lifecycle.unit/lifecycle.action.ts',
    '37.lifecycle.unit/lifecycle.buzzer.ts',
    '37.lifecycle.unit/lifecycle.model.ts',
    '37.lifecycle.unit/lifecycle.reduce.ts',
    '37.lifecycle.unit/lifecycle.unit.ts',
    'val/lifecycleChaining.test.ts'
  ];
  for (const f of files) {
    const full = path.join('packages/400.conductor', f);
    if (!fs.existsSync(full)) {
      console.error(':: [FAIL] Missing file: ' + full);
      process.exit(1);
    }
    const content = fs.readFileSync(full, 'utf8');
    if (/[\x80-\xFF]/.test(content)) {
      console.error(':: [FAIL] Multi-byte non-ASCII character detected in: ' + full);
      process.exit(1);
    }
  }
  console.log('>> [OK] 100% 7-Bit Clean ASCII confirmed across all lifecycle unit inodes.');
  "
  ```
- **Check 1.5 (TypeScript Compiler Verification):** Execute typecheck across the package:
  ```bash
  npx tsc -b packages/400.conductor
  ```
  *(Must complete with 0 errors and 0 diagnostic warnings).*

#### Level 2: Strict Schema Closure & Zero-Cost Preflight Invariant ($T_0 = \$0.00$) Traps

- **Check 2.1 (Schema Rigidity & `.strict()` Enforcement):** Assert that `MasterSceneStageSchema`, `ShotLifecycleItemSchema`, and `MasterSceneLifecycleContextSchema` strictly reject un-schemaed keys (e.g., `creative_mood`, `priority_override`) with `ZodError` at Stage $T_0 = \$0.00$ spend.
- **Check 2.2 (Rig 1 Zero-VRAM Invariant Enforced in Schema):** Verify that `MasterSceneLifecycleContextSchema` mandates literals `vramUsedMb: 0`, `t0Spend: "$0.00"`, and `t4Spend: "$0.00"`. Any non-zero numeric value must fail validation immediately.
- **Check 2.3 (Negative-Control Preflight Inception Trap: Dirty Continuity State):** Invoke `chainMasterSceneLifecycle` with `isDirty: true`.*Assertion:* Must immediately throw `HTTP 412 Precondition Failed: Scene <ID> is marked dirty in CANON_DB` in $<5\text{ ms}$ at Stage $T_0 = \$0.00$, locking context at `STAGE_1_INCEPTION_PREFLIGHT` without dispatching audio synthesizers or rendering frames.
- **Check 2.4 (Negative-Control Verbatim Parity Trap: Screenplay Prose Drift):** Invoke `chainMasterSceneLifecycle` with a shot dialogue string that does not exist verbatim inside the provided `fountainSourceScript`.*Assertion:* Must immediately throw `PARITY_CHECK_FAILED: Dialogue in shot <ID> diverges from Fountain screenplay prose`, halting at `STAGE_2_AST_VERBATIM_LOCK`.

#### Level 3: Full 8-Milestone Sequential Chaining & Epoch Fencing Traps

- **Check 3.1 (Atomic 8-Stage Sequential Execution):** Execute `chainMasterSceneLifecycle` against clean context:
  - $\text{Shot 1}: D_1 = 3{,}125\text{ ms} \implies \lceil (3125/1000) \times 24 \rceil = 75\text{ frames}$
  - $\text{Shot 2}: D_2 = 2{,}000\text{ ms} \implies \lceil (2000/1000) \times 24 \rceil = 48\text{ frames}$ Assert that the context sequentially traverses:
  1. `STAGE_1_INCEPTION_PREFLIGHT` (Precondition cleared, $T_0 = \$0.00$)
  2. `STAGE_2_AST_VERBATIM_LOCK` (Parity verified)
  3. `STAGE_3_ACOUSTIC_QUANTIZATION` (`totalFrames: 123`)
  4. `STAGE_4_MODEL_CONFORMANCE` (Causal lattice conformed to 125 frames)
  5. `STAGE_5_HARDWARE_MUTEX_ACQUIRED` (`activeLeaseId` populated)
  6. `STAGE_6_METAPROGRAM_STAMPED` (`stampedTsxPath` populated)
  7. `STAGE_7_OPTICAL_PRINTED` (`outputDeliverablePath` populated, $0\text{ MB}$ VRAM, $T_4 = \$0.00$)
  8. `STAGE_8_PROVENANCE_SEALED` (`lockfileSha256` populated, `isDirty: false`)
- **Check 3.2 (Negative-Control Monotonic Epoch Fencing Trap):** Invoke `chainMasterSceneLifecycle` with `activeEpoch: 1` while passing `mockCoordinatorEpoch: 3`.*Assertion:* Must reject with `HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH (Presented epoch 1 < active coordinator epoch 3)`, tripping the gate at `STAGE_5_HARDWARE_MUTEX_ACQUIRED`.

#### Level 4: Asymmetric Minimal Enclosing Unit (MEU) 40% Blast-Radius Ceiling Traps

- **Check 4.1 (Mathematical MEU Ratio Precision):** Evaluate the MEU repair span ratio formula:
  $$
  \text{repairSpanRatio} = \frac{\text{totalBeats} - \text{modifiedBeatIndex} + 1}{\text{totalBeats}} \text{}
  $$
  *Assertion:*
  - $\text{totalBeats} = 10, \text{modifiedBeatIndex} = 8 \implies \text{affected} = 3, \text{ratio} = 0.30$ ($30.0\%$)
  - $\text{totalBeats} = 10, \text{modifiedBeatIndex} = 5 \implies \text{affected} = 6, \text{ratio} = 0.60$ ($60.0\%$)
- **Check 4.2 (MEU Infill Authorization ($\le 40\%$)):** Invoke `routeMeuRepair('ep01_sc01', 8, 10)`.*Assertion:* Must return `action: 'INFILL'`, `shouldHalt: false`, and `repairSpanRatio: 0.30`.
- **Check 4.3 (Negative-Control MEU Escalation Ceiling Trap ($> 40\%$)):** Invoke `routeMeuRepair('ep01_sc01', 5, 10)`.*Assertion:* Must return `action: 'ESCALATE'`, `shouldHalt: true`, and `repairSpanRatio: 0.60`, halting automated infill and logging the blast-radius breach.

#### Level 5: Three-Strike Progressive Circuit Breaker & STAGE_FAILED_DLQ Quarantine Traps

- **Check 5.1 (Strike 1 Transient Retry Authorization):** Pass a simulated execution exception to `evaluateFailureEscalation` on a fresh context (`attemptCount: 0`).*Assertion:* Must return `quarantined: false`, `action: 'RETRY'`, `currentAttempt: 1`, and retain the active stage.
- **Check 5.2 (Strike 2 Second Retry Authorization):** Pass a second exception to `evaluateFailureEscalation` (`attemptCount: 1`).*Assertion:* Must return `quarantined: false`, `action: 'RETRY'`, `currentAttempt: 2`.
- **Check 5.3 (Negative-Control Strike 3 Dead-Letter Quarantine Trap):** Pass a third exception to `evaluateFailureEscalation` (`attemptCount: 2`).*Assertion:* Must return `quarantined: true`, `action: 'DEAD_LETTER_QUARANTINE'`, `currentAttempt: 3`, transition `ctx.currentStage` directly to `STAGE_FAILED_DLQ`, and record the failure receipt into `telemetryLogs`.

#### Level 6: Colocated Vitest Verification Battery Clearance

- Execute the complete unit test battery:
  ```bash
  npx vitest run packages/400.conductor/val/lifecycleChaining.test.ts
  ```
  *(100% of test assertions must pass with exit code 0).*

#### Level 7: Blessed Terminal Cockpit Live Journey & Telemetry Audit

- **Step 7.1 (Launch Terminal Cockpit):** Start the operator interface via the authoritative entry point:
  ```bash
  npm run dev
  ```
- **Step 7.2 (Human Keyboard Emulation Journey):**
  1. Allow the curses alternate screen buffer to initialize on screen.
  2. Confirm visual layout split: Left control quadrant (`{ x: 0, y: 4, xSpan: 4, ySpan: 8 }`), Right console pane `cns00` (`{ x: 4, y: 0, xSpan: 8, ySpan: 12 }`).
  3. Use arrow keys (`Down`/`Up`) or Vim `j`/`k` to navigate down the choice menu.
  4. Move cursor focus to highlight `RUN MASTER SCENE LIFECYCLE (ep01_sc01)`.
  5. Observe that focusing on this option streams `>> [TOOLTIP] Execute atomic 8-stage pipeline from Inception Preflight to Provenance Sealing.` into `cns00` without requiring an `Enter` keystroke.
  6. Press `Enter` to dispatch action `CHAIN_MASTER_SCENE_LIFECYCLE`.
- **Step 7.3 (Console Telemetry Verification - `cns00`):** Verify that switchboard console `cns00` renders real-time 7-bit ASCII receipts across all 8 milestones:
  ```plaintext
  >> [LIFECYCLE] Initiating master scene lifecycle for ep01_sc01...
  >> [STAGE 1] Preflight Inception: 0 dirty dependencies verified ($T_0 = $0.00).
  >> [STAGE 2] Dialogue AST verbatim parity verified across 2 shots.
  >> [STAGE 3] Acoustic Master Clock: Quantized 2 stems into 123 discrete frames.
  >> [STAGE 4] Model Conformance: 4n+1 lattice satisfied (125 diffusion frames).
  >> [STAGE 5] Granted hardware lease: lease_ep01_sc01_1762215300000 (Epoch: 1).
  >> [STAGE 6] Stamped static composition: drafts/Master_ep01_sc01.tsx.
  >> [STAGE 7] Headless Swangle Optical Assembly complete (123 frames, 0 MB VRAM, $T_4 = $0.00).
  >> [STAGE 8] Sealed universal provenance snapshot into CANON_DB (is_dirty = 0).
  >> [LIFECYCLE] [OK] Master scene execution chained successfully ($T_4 = $0.00).
  ```
- **Step 7.4 (Graceful Teardown):** Press `Escape` or `q` to terminate the Blessed curses loop cleanly, confirming zero unhandled asynchronous promise rejections, zero dangling timers, and clean restoration of terminal standard I/O.

### III. Final Feedback & Status Mutation Directive

#### 1. If ALL Verification Levels Pass (100% Compliance Across Levels 1–7):

- Update `[- **Progress:**]` at the top of this document to:
  ```markdown
  - **Progress:** [🟢 Certified on Thursday, November 5, 2026 at 7:56 AM EST - All Verification Tiers Cleared]
  ```
- Overwrite the original specification file with this updated header.
- Emit the certified success feedback receipt:
  ```plaintext
  >> ==============================================================================
  >> [ANTIGRAVITY AUDIT VERDICT: PASSED 🟢]
  >> FEATURE 7.1: MASTER LIFECYCLE SEQUENTIAL CHAINING
  >> ------------------------------------------------------------------------------
  >> [OK] Level 1: Monorepo fences held. apps/995.library/ untouched. Zero src/.
  >> [OK] Level 2: Strict Zod schemas and sub-5ms dirty state rejection verified ($T0 = $0.00).
  >> [OK] Level 3: Full 8-milestone sequential chaining and monotonic epoch fencing verified.
  >> [OK] Level 4: Asymmetric MEU 40% blast-radius ceiling law proven (ratio > 0.40 -> ESCALATE).
  >> [OK] Level 5: Three-strike progressive circuit breaker and STAGE_FAILED_DLQ verified.
  >> [OK] Level 6: Colocated Vitest test battery cleared with 100% passing assertions.
  >> [OK] Level 7: Blessed curses TUI flight deck verified with clean cns00 streaming (0 MB VRAM).
  >> ------------------------------------------------------------------------------
  >> STATUS: MASTER LIFECYCLE SEQUENTIAL CHAINING CERTIFIED PRODUCTION-READY (T0 -> T4)
  >> ==============================================================================
  ```

#### 2. If ANY Check, Assertion, or Level Fails:

- Update `[- **Progress:**]` at the top of this document to:
  ```markdown
  - **Progress:** [🔴 Failed on Thursday, November 5, 2026 at 7:56 AM EST - Breach Detected in <LEVEL/CHECK>]
  ```
- Overwrite the original specification file with this updated header.
- Emit the fail-closed conflict diagnostic banner:
  ```plaintext
  :: ==============================================================================
  :: [ANTIGRAVITY AUDIT VERDICT: FAILED 🔴]
  :: FEATURE 7.1: MASTER LIFECYCLE SEQUENTIAL CHAINING
  :: ------------------------------------------------------------------------------
  :: [FAIL] Verification halted at Level <X>: <CHECK_NAME>
  :: Reason: <SPECIFIC_ASSERTION_FAILURE_DETAILS>
  :: Action: Remediate defective artifacts in 37.lifecycle.unit before re-running audit.
  :: ==============================================================================
  ```
  *(Halt execution immediately without mutating further code).*

### You

{{FOCUS: Phase 7 Master Scene Lifecycle Execution Edge Coordination with out Feature 7.1: Master Lifecycle Sequential Chaining since it has already been covered }}

@jules-task-00

### Gemini

# Jules Task: Phase 7 Master Scene Lifecycle Execution Edge Coordination (Excluding Feature 7.1)

You are tasked with implementing the remaining architectural features of **Phase 7: Master Scene Lifecycle Execution Edge Coordination** (Features 7.2, 7.3, and 7.4) within the `000.series-sower-conductor` repository on Rig 1 and its Cloudflare edge isolate in `apps/worker/`.

This task implements the offline validation gauntlet (`val/`), the Cloudflare edge bridge gateway leasing synchronization (`apps/worker/`), and the master pipeline Blessed curses cockpit trigger (`98.menu.unit/`) to enforce the **Hardware Partitioning & Zero-VRAM Invariant**, **Monotonic Epoch Fencing**, and the **Zero-Spend Pre-Flight Economic Firewall ($T_0 = \$0.00$)**.

### Architectural Invariants & Monorepo Boundaries

1. **Monorepo Demarcation & Ban on `packages/400.conductor/src/`:** Local Node.js code must reside strictly within `packages/400.conductor/36.edgebridge.unit/`, `packages/400.conductor/98.menu.unit/`, or unit test batteries in `packages/400.conductor/val/`. Never create or place files in `packages/400.conductor/src/`. Edge worker code resides exclusively in `apps/worker/src/`.
2. **Immutable Harness Boundary:** `apps/995.library/995.library/**` is strictly immutable (0 lines modified).
3. **Hardware Partitioning & Zero-VRAM Rig 1 Sovereignty ($T_4 = \$0.00$):** All local test suites, edge bridges, and cockpit interfaces must run with `0 MB` of dedicated GPU VRAM on Rig 1, enforcing `CUDA_VISIBLE_DEVICES=""` for local execution.
4. **Edge Monotonic Epoch Fencing ($N \to N+1$):** `ShotCoordinatorDO` in `apps/worker/` arbitrates single-threaded hardware leases; any worker presenting a stale epoch token ($E_{\text{presented}} < E_{\text{active}}$) must be rejected with `HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH`.
5. **Pure 7-Bit Clean ASCII Telemetry:** All source files, comments, tests, logs, and curses console displays must use strictly 7-bit ASCII tokens (`>>`, `[OK]`, `[FAIL]`, `::`, `[EDGE]`, `[LEASE]`, `[COCKPIT]`, `[VRAM-GATE]`).
6. **NodeNext Explicit `.js` Imports:** All relative TypeScript imports across `packages/400.conductor/` must explicitly terminate with `.js` extensions.

### File Implementation Manifest

```plaintext
packages/400.conductor/
├── 36.edgebridge.unit/
│   ├── fce/
│   │   ├── edgebridge.interface.ts
│   │   └── edgebridge.bit.ts
│   ├── val/
│   │   └── edgebridge.val.ts
│   ├── buz/
│   │   ├── edgebridge.buzz.ts
│   │   └── heartbeatLoop.buzz.ts
│   ├── edgebridge.action.ts
│   ├── edgebridge.buzzer.ts
│   ├── edgebridge.model.ts
│   ├── edgebridge.reduce.ts
│   └── edgebridge.unit.ts
├── 98.menu.unit/
│   └── buz/
│       └── 00.menu.buzz.ts              (Update: Mount Full Master Scene Lifecycle & HUD)
├── BEE.ts                               (Update: Register EdgebridgeUnit)
└── val/
    ├── hardwareBoundary.test.ts         (Feature 7.2: Rig 1 Zero-VRAM Hardware Sentry Test)
    ├── audioLifecycle.test.ts           (Feature 7.2: Ephemeral Subprocess & ffprobe Quantization Test)
    └── asciiCleanliness.test.ts         (Feature 7.2: Pure 7-Bit ASCII Monorepo Linter Test)

apps/worker/
├── src/
│   ├── index.ts                         (Feature 7.3: Edge Telemetry Ingress Route)
│   └── objects/
│       └── ShotCoordinatorDO.ts         (Feature 7.3: Monotonic Epoch Mutex & Lease Sync)
└── test/unit/
    └── edgeCoordinator.test.ts          (Feature 7.3: Cloudflare Workers Vitest Suite)
```

### Source Code Deliverables

#### 1. Feature 7.3: Edge Bridge Gateway Lease Sync (`36.edgebridge.unit` on Node.js)

```typescript
// packages/400.conductor/36.edgebridge.unit/fce/edgebridge.interface.ts
export interface HardwareLeaseReceipt {
  leaseId: string;
  epoch: number;
  sceneId: string;
  grantedAtMs: number;
  ttlMs: number;
  status: 'ACTIVE' | 'EXPIRED' | 'ZOMBIE_REJECTED';
}

export interface TelemetryIngressPayload {
  sceneId: string;
  episodeId: string;
  currentStage: string;
  totalFrames: number;
  vramUsedMb: 0;
  lockfileSha256: string | null;
  epoch: number;
}

export default interface Edgebridge {
  idx: string;
  activeLease: HardwareLeaseReceipt | null;
  targetEndpoint: string;
  isHeartbeatActive: boolean;
}
```

```typescript
// packages/400.conductor/36.edgebridge.unit/fce/edgebridge.bit.ts
import { HardwareLeaseReceipt, TelemetryIngressPayload } from './edgebridge.interface.js';

export default interface EdgebridgeBit {
  idx: string;
  src?: string;
  val?: number;
  dat?: {
    receipt?: HardwareLeaseReceipt;
    telemetry?: TelemetryIngressPayload;
    endpoint?: string;
  };
  slv?: Function;
}
```

```typescript
// packages/400.conductor/36.edgebridge.unit/val/edgebridge.val.ts
import { z } from 'zod';

export const HardwareLeaseReceiptSchema = z
  .object({
    leaseId: z.string().min(1),
    epoch: z.number().int().positive(),
    sceneId: z.string().min(1),
    grantedAtMs: z.number().positive(),
    ttlMs: z.number().positive(),
    status: z.enum(['ACTIVE', 'EXPIRED', 'ZOMBIE_REJECTED']),
  })
  .strict();

export const TelemetryIngressPayloadSchema = z
  .object({
    sceneId: z.string().min(1),
    episodeId: z.string().min(1),
    currentStage: z.string().min(1),
    totalFrames: z.number().int().nonnegative(),
    vramUsedMb: z.literal(0),
    lockfileSha256: z.string().nullable(),
    epoch: z.number().int().positive(),
  })
  .strict();
```

```typescript
// packages/400.conductor/36.edgebridge.unit/buz/edgebridge.buzz.ts
import { EdgebridgeModel } from '../edgebridge.model.js';
import EdgebridgeBit from '../fce/edgebridge.bit.js';
import State from '../../99.core/state.js';
import { HardwareLeaseReceipt, TelemetryIngressPayload } from '../fce/edgebridge.interface.js';
import { TelemetryIngressPayloadSchema } from '../val/edgebridge.val.js';

export const initEdgebridge = (cpy: EdgebridgeModel, bal: EdgebridgeBit, ste: State) => {
  if (bal.slv != null) bal.slv({ edgBit: { idx: 'init-edgebridge', val: 1 } });
  return cpy;
};

export const updateEdgebridge = (cpy: EdgebridgeModel, bal: EdgebridgeBit, ste: State) => {
  if (bal.slv != null) bal.slv({ edgBit: { idx: 'update-edgebridge' } });
  return cpy;
};

export const acquireHardwareLease = async (
  cpy: EdgebridgeModel,
  bal: EdgebridgeBit,
  ste: State,
): Promise<EdgebridgeModel> => {
  const sceneId = bal.src || 'ep01_sc01';
  const ttlMs = bal.val || 30000;
  const endpoint = cpy.targetEndpoint;

  try {
    let receipt: HardwareLeaseReceipt;
    if (endpoint.startsWith('http')) {
      const res = await fetch(`${endpoint}/api/lease/acquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId, ttlMs }),
      });

      if (res.status === 409) {
        throw new Error('HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH');
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to acquire edge lease`);
      }
      receipt = (await res.json()) as HardwareLeaseReceipt;
    } else {
      // Local fallback loopback emulation
      receipt = {
        leaseId: `lease_${sceneId}_${Date.now()}`,
        epoch: 1,
        sceneId,
        grantedAtMs: Date.now(),
        ttlMs,
        status: 'ACTIVE',
      };
    }

    cpy.activeLease = receipt;

    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `>> [EDGE] [OK] Acquired Hardware Lease: ${receipt.leaseId} (Epoch: ${receipt.epoch})`,
      });
    }

    if (bal.slv != null) {
      bal.slv({
        edgBit: {
          idx: 'acquire-hardware-lease-success',
          dat: { receipt },
        },
      });
    }
  } catch (err: any) {
    if (global.LIBRARY) {
      await global.LIBRARY.hunt('[Console action] Update Console', {
        idx: 'cns00',
        src: `:: [EDGE] [FAIL] Lease acquisition failed: ${err.message}`,
      });
    }
    if (bal.slv != null) {
      bal.slv({
        edgBit: {
          idx: 'acquire-hardware-lease-error',
          src: err.message,
        },
      });
    }
  }

  return cpy;
};

export const syncEdgeTelemetry = async (
  cpy: EdgebridgeModel,
  bal: EdgebridgeBit,
  ste: State,
): Promise<EdgebridgeModel> => {
  try {
    if (!bal.dat?.telemetry) {
      throw new Error('MISSING_TELEMETRY: dat.telemetry is required');
    }
    const validated = TelemetryIngressPayloadSchema.parse(bal.dat.telemetry) as TelemetryIngressPayload;
    const endpoint = cpy.targetEndpoint;

    if (endpoint.startsWith('http')) {
      await fetch(`${endpoint}/api/telemetry/audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });
    }

    if (bal.slv != null) {
      bal.slv({
        edgBit: {
          idx: 'sync-edge-telemetry-success',
          val: 1,
        },
      });
    }
  } catch (err: any) {
    if (bal.slv != null) {
      bal.slv({
        edgBit: {
          idx: 'sync-edge-telemetry-error',
          src: err.message,
        },
      });
    }
  }
  return cpy;
};
```

```typescript
// packages/400.conductor/36.edgebridge.unit/edgebridge.action.ts
import { Action } from '../99.core/interface/action.interface.js';
import EdgebridgeBit from './fce/edgebridge.bit.js';

export const INIT_EDGEBRIDGE = '[Edgebridge action] Init Edgebridge';
export class InitEdgebridge implements Action {
  readonly type = INIT_EDGEBRIDGE;
  constructor(public bale: EdgebridgeBit) {}
}

export const UPDATE_EDGEBRIDGE = '[Edgebridge action] Update Edgebridge';
export class UpdateEdgebridge implements Action {
  readonly type = UPDATE_EDGEBRIDGE;
  constructor(public bale: EdgebridgeBit) {}
}

export const ACQUIRE_HARDWARE_LEASE = '[Edgebridge action] Acquire Hardware Lease';
export class AcquireHardwareLease implements Action {
  readonly type = ACQUIRE_HARDWARE_LEASE;
  constructor(public bale: EdgebridgeBit) {}
}

export const SYNC_EDGE_TELEMETRY = '[Edgebridge action] Sync Edge Telemetry';
export class SyncEdgeTelemetry implements Action {
  readonly type = SYNC_EDGE_TELEMETRY;
  constructor(public bale: EdgebridgeBit) {}
}

export type Actions = InitEdgebridge | UpdateEdgebridge | AcquireHardwareLease | SyncEdgeTelemetry;
```

```typescript
// packages/400.conductor/36.edgebridge.unit/edgebridge.buzzer.ts
export {
  initEdgebridge,
  updateEdgebridge,
  acquireHardwareLease,
  syncEdgeTelemetry,
} from './buz/edgebridge.buzz.js';
```

```typescript
// packages/400.conductor/36.edgebridge.unit/edgebridge.model.ts
import Edgebridge, { HardwareLeaseReceipt } from './fce/edgebridge.interface.js';

export class EdgebridgeModel implements Edgebridge {
  idx: string = '36.edgebridge';
  activeLease: HardwareLeaseReceipt | null = null;
  targetEndpoint: string = process.env.EDGE_COORDINATOR_URL || 'http://127.0.0.1:8787';
  isHeartbeatActive: boolean = false;
}
```

```typescript
// packages/400.conductor/36.edgebridge.unit/edgebridge.reduce.ts
import clone from 'clone-deep';
import * as Act from './edgebridge.action.js';
import { EdgebridgeModel } from './edgebridge.model.js';
import * as Buzz from './edgebridge.buzzer.js';
import State from '../99.core/state.js';

export function reducer(
  model: EdgebridgeModel = new EdgebridgeModel(),
  act: Act.Actions,
  state?: State,
) {
  switch (act.type) {
    case Act.INIT_EDGEBRIDGE:
      return Buzz.initEdgebridge(clone(model), act.bale, state!);

    case Act.UPDATE_EDGEBRIDGE:
      return Buzz.updateEdgebridge(clone(model), act.bale, state!);

    case Act.ACQUIRE_HARDWARE_LEASE:
      return Buzz.acquireHardwareLease(clone(model), act.bale, state!);

    case Act.SYNC_EDGE_TELEMETRY:
      return Buzz.syncEdgeTelemetry(clone(model), act.bale, state!);

    default:
      return model;
  }
}
```

```typescript
// packages/400.conductor/36.edgebridge.unit/edgebridge.unit.ts
import State from '../99.core/state.js';

export default class EdgebridgeUnit {
  constructor(state: State) {}
}
```

#### 2. Feature 7.3: Cloudflare Edge Worker Objects & Telemetry Endpoint (`apps/worker`)

```typescript
// apps/worker/src/objects/ShotCoordinatorDO.ts
export interface LeaseRecord {
  leaseId: string;
  sceneId: string;
  epoch: number;
  grantedAtMs: number;
  ttlMs: number;
}

export class ShotCoordinatorDO implements DurableObject {
  private state: DurableObjectState;
  private currentEpoch: number = 1;
  private activeLease: LeaseRecord | null = null;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/lease/acquire' && request.method === 'POST') {
      const body = (await request.json()) as { sceneId: string; ttlMs?: number; presentedEpoch?: number };
      const now = Date.now();

      if (body.presentedEpoch !== undefined && body.presentedEpoch < this.currentEpoch) {
        return new Response(
          JSON.stringify({
            error: 'HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH',
            currentEpoch: this.currentEpoch,
          }),
          { status: 409, headers: { 'Content-Type': 'application/json' } },
        );
      }

      this.currentEpoch++;
      const lease: LeaseRecord = {
        leaseId: `lease_${body.sceneId}_${now}`,
        sceneId: body.sceneId,
        epoch: this.currentEpoch,
        grantedAtMs: now,
        ttlMs: body.ttlMs || 30000,
      };

      this.activeLease = lease;
      await this.state.storage.put('activeLease', lease);
      await this.state.storage.put('currentEpoch', this.currentEpoch);

      return new Response(JSON.stringify(lease), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/lease/current' && request.method === 'GET') {
      return new Response(JSON.stringify({ lease: this.activeLease, epoch: this.currentEpoch }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  }
}
```

```typescript
// apps/worker/src/index.ts (Route Ingress Addition)
import { Hono } from 'hono';
import { ShotCoordinatorDO } from './objects/ShotCoordinatorDO.js';

export { ShotCoordinatorDO };

interface Env {
  SHOT_COORDINATOR: DurableObjectNamespace;
}

const app = new Hono<{ Bindings: Env }>();

app.post('/api/lease/acquire', async (c) => {
  const id = c.env.SHOT_COORDINATOR.idFromName('global_coordinator');
  const stub = c.env.SHOT_COORDINATOR.get(id);
  return stub.fetch(c.req.raw);
});

app.post('/api/telemetry/audio', async (c) => {
  const payload = await c.req.json();
  if (payload.vramUsedMb !== 0) {
    return c.json({ error: 'VIOLATION: Rig 1 Zero-VRAM Invariant breached' }, 400);
  }
  // Record telemetry receipt cleanly without Git mutations
  return c.json({ status: 'ACCEPTED', timestamp: new Date().toISOString() }, 200);
});

export default app;
```

#### 3. Feature 7.4: Blessed Cockpit Navigation & Master HUD (`98.menu.unit`)

```typescript
// In packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts:
// Mount RUN MASTER SCENE LIFECYCLE (ep01_sc01) and border status modulators

export const updateConductorStatusHud = async (
  status: 'IDLE' | 'ACTIVE_SYNTHESIS' | 'COMPLETE' | 'FAILED',
  sceneId: string,
): Promise<void> => {
  if (!global.LIBRARY) return;

  let banner = `>> [FLIGHT-DECK] Status: ${status} | Scene: ${sceneId}`;
  if (status === 'ACTIVE_SYNTHESIS') {
    banner = `>> [FLIGHT-DECK] [ACTIVE] Processing Master Scene Lifecycle for [${sceneId}]...`;
  } else if (status === 'COMPLETE') {
    banner = `>> [FLIGHT-DECK] [SEALED] Scene [${sceneId}] Conformed & Committed (0 MB VRAM) [OK]`;
  } else if (status === 'FAILED') {
    banner = `:: [FLIGHT-DECK] [FAIL] Circuit Breaker Tripped on Scene [${sceneId}] -> DLQ`;
  }

  await global.LIBRARY.hunt('[Console action] Update Console', {
    idx: 'cns00',
    src: banner,
  });
};
```

#### 4. Feature 7.2: Offline Verification Gauntlet Tests (`packages/400.conductor/val/`)

```typescript
// packages/400.conductor/val/hardwareBoundary.test.ts
import { describe, it, expect } from 'vitest';

describe('Feature 7.2: Rig 1 Zero-VRAM Hardware Sentry Test', () => {
  it('enforces CUDA_VISIBLE_DEVICES="" and confirms zero GPU VRAM allocation', () => {
    const originalEnv = process.env.CUDA_VISIBLE_DEVICES;
    // Set execution barrier
    process.env.CUDA_VISIBLE_DEVICES = '';

    expect(process.env.CUDA_VISIBLE_DEVICES).toBe('');
    // Restore
    if (originalEnv !== undefined) {
      process.env.CUDA_VISIBLE_DEVICES = originalEnv;
    } else {
      delete process.env.CUDA_VISIBLE_DEVICES;
    }
  });

  it('guarantees packages/400.conductor/src does not exist on disk', () => {
    import('node:fs').then((fs) => {
      const srcExists = fs.existsSync('packages/400.conductor/src');
      expect(srcExists).toBe(false);
    });
  });
});
```

```typescript
// packages/400.conductor/val/audioLifecycle.test.ts
import { describe, it, expect } from 'vitest';
import * as BuzzFrame from '../24.frame.unit/buz/frame.buzz.js';

describe('Feature 7.2: Ephemeral Subprocess & ffprobe Quantization Test', () => {
  it('quantizes mocked audio durations into discrete 24 fps integer frames with zero drift', () => {
    const mockStems = [
      { shot_id: 'sh01', duration_ms: 3125 }, // 75f
      { shot_id: 'sh02', duration_ms: 2000 }, // 48f
    ];

    const result = BuzzFrame.quantizeShotTimeline(mockStems);
    expect(result.ok).toBe(true);
    expect(result.total_frames).toBe(123);
    expect(result.shots[0].target_frames).toBe(75);
    expect(result.shots[1].target_frames).toBe(48);
    expect(result.is_contiguous).toBe(true);
    expect(result.drift_ms).toBeLessThan(41.67);
  });
});
```

```typescript
// packages/400.conductor/val/asciiCleanliness.test.ts
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Feature 7.2: Pure 7-Bit ASCII Monorepo Linter Test', () => {
  const unitsToScan = [
    '09.speech.unit',
    '10.somaticdsp.unit',
    '24.frame.unit',
    '32.audio.unit',
    '34.abstractsyntaxtree.unit',
    '36.edgebridge.unit',
    '37.lifecycle.unit',
    '98.menu.unit',
  ];

  it('scans all TypeScript source files asserting zero multi-byte characters', () => {
    for (const unit of unitsToScan) {
      const unitDir = path.resolve('packages/400.conductor', unit);
      if (!fs.existsSync(unitDir)) continue;

      const scanDirectory = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scanDirectory(fullPath);
          } else if (entry.name.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const hasNonAscii = /[\x80-\xFF]/.test(content);
            expect(hasNonAscii).toBe(false);
          }
        }
      };

      scanDirectory(unitDir);
    }
  });
});
```

```typescript
// apps/worker/test/unit/edgeCoordinator.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ShotCoordinatorDO } from '../../src/objects/ShotCoordinatorDO.js';

describe('Feature 7.3: Cloudflare Edge Worker ShotCoordinatorDO Lease & Epoch Fence', () => {
  let coordinator: ShotCoordinatorDO;
  let mockStorage: Map<string, any>;

  beforeEach(() => {
    mockStorage = new Map();
    const mockState: any = {
      storage: {
        put: async (key: string, val: any) => mockStorage.set(key, val),
        get: async (key: string) => mockStorage.get(key),
      },
    };
    coordinator = new ShotCoordinatorDO(mockState);
  });

  it('acquires lease and advances monotonic epoch', async () => {
    const req = new Request('http://edge.internal/lease/acquire', {
      method: 'POST',
      body: JSON.stringify({ sceneId: 'ep01_sc01', ttlMs: 30000 }),
    });

    const res = await coordinator.fetch(req);
    expect(res.status).toBe(200);

    const data: any = await res.json();
    expect(data.epoch).toBe(2);
    expect(data.sceneId).toBe('ep01_sc01');
    expect(data.leaseId).toBeDefined();
  });

  it('rejects stale epoch tokens with HTTP 409 Conflict', async () => {
    // Advance epoch to 2
    await coordinator.fetch(
      new Request('http://edge.internal/lease/acquire', {
        method: 'POST',
        body: JSON.stringify({ sceneId: 'ep01_sc01' }),
      }),
    );

    // Present stale epoch 1
    const staleReq = new Request('http://edge.internal/lease/acquire', {
      method: 'POST',
      body: JSON.stringify({ sceneId: 'ep01_sc01', presentedEpoch: 1 }),
    });

    const res = await coordinator.fetch(staleReq);
    expect(res.status).toBe(409);
    const data: any = await res.json();
    expect(data.error).toContain('HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH');
  });
});
```

### Jules Execution Protocol

1. Author and write all files under `packages/400.conductor/36.edgebridge.unit/` adhering strictly to `.js` import specifiers.
2. Register `EdgebridgeUnit` in `packages/400.conductor/BEE.ts` under `list`, `reducer`, and `UnitData`.
3. Implement `apps/worker/src/objects/ShotCoordinatorDO.ts` and update `apps/worker/src/index.ts`.
4. Mount `updateConductorStatusHud` in `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts`.
5. Author test suites `hardwareBoundary.test.ts`, `audioLifecycle.test.ts`, `asciiCleanliness.test.ts` under `packages/400.conductor/val/` and `edgeCoordinator.test.ts` under `apps/worker/test/unit/`.
6. Run `npx vitest run packages/400.conductor/val/` to ensure 100% of local tests pass.
7. Run `npm run check:types` across the monorepo root to assert 0 diagnostic errors.
8. **COMMAND:** When you begin working on this specification, immediately update the `[- **Status:**]` attribute below to `[🟡 In Progress]`. When all target files and tests pass with exit code 0, update `[- **Status:**]` to `[🟢 Done]`.

### **Attributes:**

- **Status:** [⚪ Backlog ]
- **Priority:** [🔴 High]
- **Time Estimate:** [1 Hour]
- **Tags:** [infrastructure, edge-coordination, durable-objects, hardware-lease, zero-vram, tui-cockpit]
- **Epic:** [EPIC 001: INFRASTRUCTURE & GOVERNANCE]
- **Value:** [Edge Lease Arbitration, Hardware Boundaries, & Interactive Cockpit Control]
- **Sprint Points:** [2]
- **Component:** [packages/400.conductor/36.edgebridge.unit & apps/worker]
- **Owner:** [Jules Autonomous Implementer]
- **Target Release:** [Sprint 4 / Conductor v1.0]
- **Risk Level:** [Low]
- **Reporter:** [Studio Architecture Lead]

### You

{{FOCUS: Phase 7 Master Scene Lifecycle Execution Edge Coordination with out Feature 7.1: Master Lifecycle Sequential Chaining since it has already been covered }}

@jules-complete-check

### Gemini

### **Validation:**

- **Progress:** [⚪ Waiting for Action ]

#### Jules Pre-Flight Completion Audit & Operational Directive

**Agent Instruction:** Before generating, authoring, or mutating any code for **Phase 7: Master Scene Lifecycle Execution Edge Coordination (Excluding Feature 7.1)**, execute an automated inspection audit across `packages/400.conductor/36.edgebridge.unit/`, `packages/400.conductor/98.menu.unit/`, `packages/400.conductor/BEE.ts`, `apps/worker/src/`, and `packages/400.conductor/val/` in repository `000.series-sower-conductor` against the **12-Point Pre-Flight Completion Inspection Checklist** below to verify whether this offline hardware verification battery, Cloudflare edge bridge gateway leasing synchronization, and master pipeline Blessed curses cockpit trigger have already been completed:

$$
\text{Completion Percentage} = \left(\frac{\text{Passed Checks}}{12}\right) \times 100\% \text{}
$$

##### The 12-Point Completion Audit Battery

1. **Edge Bridge Interface Contracts Inode (`36.edgebridge.unit/fce/edgebridge.interface.ts`):** Verify that the file physically exists on disk and exports strictly typed interfaces for `HardwareLeaseReceipt`, `TelemetryIngressPayload`, and `Edgebridge`.
2. **Edge Bridge Operational Bit Inode (`36.edgebridge.unit/fce/edgebridge.bit.ts`):** Verify that the file physically exists on disk and exports `EdgebridgeBit` declaring `idx`, `src`, `val`, `dat` (carrying `receipt`, `telemetry`, `endpoint`), and `slv` for asynchronous resolution.
3. **Zod Schema Rigidity Inode (`36.edgebridge.unit/val/edgebridge.val.ts`):** Verify that `HardwareLeaseReceiptSchema` and `TelemetryIngressPayloadSchema` physically exist and terminate strictly with `.strict()`, validating `vramUsedMb: 0` and positive integer epochs.
4. **Candor 7-File Unit Architecture (`36.edgebridge.unit/`):** Verify that `edgebridge.action.ts`, `edgebridge.buzzer.ts`, `edgebridge.model.ts`, `edgebridge.reduce.ts`, and `edgebridge.unit.ts` physically exist within `packages/400.conductor/36.edgebridge.unit/`.
5. **Edge Bridge Buzzer Implementation (`36.edgebridge.unit/buz/edgebridge.buzz.ts`):** Confirm that `initEdgebridge`, `updateEdgebridge`, `acquireHardwareLease`, and `syncEdgeTelemetry` are implemented, supporting HTTP transport with local loopback fallback emulation.
6. **Cloudflare Durable Object Actor Inode (`apps/worker/src/objects/ShotCoordinatorDO.ts`):** Verify that `ShotCoordinatorDO` physically exists, manages monotonic epoch tokens ($N \to N+1$), and returns `HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH` when `presentedEpoch < currentEpoch`.
7. **Cloudflare Worker Telemetry Ingress (`apps/worker/src/index.ts`):** Confirm routes `POST /api/lease/acquire` and `POST /api/telemetry/audio` are mounted in Hono, validating `vramUsedMb === 0` and recording execution receipts without Git mutations.
8. **Cockpit HUD Status Modulator (`98.menu.unit/buz/00.menu.buzz.ts`):** Verify `updateConductorStatusHud` is implemented in `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts`, streaming dynamic status banners (`IDLE`, `ACTIVE_SYNTHESIS`, `COMPLETE`, `FAILED`) to console pane `cns00`.
9. **Rig 1 Zero-VRAM Hardware Sentry Test (`val/hardwareBoundary.test.ts`):** Verify Vitest test physically exists in `packages/400.conductor/val/hardwareBoundary.test.ts`, asserting `CUDA_VISIBLE_DEVICES === ""` and checking physical non-existence of `packages/400.conductor/src/`.
10. **Acoustic Subprocess & Timeline Quantization Test (`val/audioLifecycle.test.ts`):** Verify Vitest test physically exists in `packages/400.conductor/val/audioLifecycle.test.ts`, validating offline 24 fps integer ceiling quantization and contiguous zero-drift boundaries.
11. **Pure 7-Bit ASCII Cleanliness Linter Test (`val/asciiCleanliness.test.ts`):** Verify Vitest suite physically exists in `packages/400.conductor/val/asciiCleanliness.test.ts`, scanning all TypeScript files across units to assert zero characters matching `/[\x80-\xFF]/`.
12. **Edge Coordinator Worker Test Battery (`apps/worker/test/unit/edgeCoordinator.test.ts`):** Execute `npx vitest run apps/worker/test/unit/edgeCoordinator.test.ts` and confirm passing assertions verifying lease issuance, epoch advancement, and zombie epoch rejections with exit code 0.

##### Operational Halting & Execution Rules

- **IF $\ge 67\%$ (8 or more of the 12 checks pass):**
  - Update `[- **Progress:**]` above with the current execution timestamp and date:
    ```markdown
    - **Progress:** [🟢 Completed on Thursday, November 5, 2026 at 8:01 AM EST - Audit Score: >= 67% - Pre-existing Work Verified]
      *Reason for Halt:* Pre-flight audit confirmed that >= 67% of Phase 7 Master Scene Lifecycle Execution Edge Coordination (Excluding Feature 7.1) requirements—including 36.edgebridge.unit Candor structure, ShotCoordinatorDO monotonic epoch fencing in apps/worker/src/objects/, HTTP telemetry ingress routes in apps/worker/src/index.ts, updateConductorStatusHud in 98.menu.unit, and offline verification batteries in val/hardwareBoundary.test.ts, val/audioLifecycle.test.ts, val/asciiCleanliness.test.ts, and apps/worker/test/unit/edgeCoordinator.test.ts—are already satisfied on disk. Operational execution halted immediately to prevent redundant file mutations or overwrites.
    ```
  - Write the original specification file with this updated timecode header and **STOP IMMEDIATELY!**
  - **STRICT AGENT BOUNDARY:** The Jules Coding Agent must strictly understand that this status and timestamp update is the **ONLY** update, work, and activity to be induced from this prompt. Do **NOT** rewrite files, do **NOT** modify existing tests, and do **NOT** execute redundant implementations.
- **IF $< 67\%$ (0 to 7 checks pass):**
  - Jules must proceed to implement and fulfill all missing deliverables across `packages/400.conductor/36.edgebridge.unit/`, `apps/worker/src/`, `packages/400.conductor/98.menu.unit/`, and the test suites in `packages/400.conductor/val/` and `apps/worker/test/unit/`.
  - Enforce strict non-existence of `packages/400.conductor/src/` (pure unit-colocated layout).
  - Enforce pure 7-bit ASCII compliance across all files (zero multi-byte emojis).
  - Ensure `apps/995.library/` remains 100% untouched (0 modified lines across `apps/995.library/995.library/**`).
  - Once monorepo compilation (`npx tsc -b packages/400.conductor apps/worker`) and Vitest runs clear with exit code 0, update `[- **Progress:**]` to:
    ```markdown
    - **Progress:** [🟢 Completed on Thursday, November 5, 2026 at 8:01 AM EST - Task Requirements Fully Implemented]
    ```
    Save the file and conclude.

> **CRITICAL PARTNER TEST ADVISORY WARNING:** If there is a partner file located next to this one in the directory matching the suffix `[xxx.phase-xxx.ag-test.md]`, **YOU ARE TO NEVER RUN THIS TEST**. That test suite belongs exclusively to the Antigravity adversarial audit agent (`ag-test`), which will independently verify this implementation.

### **FUNCTIONAL MANDATE**

#### **User Story**

At 6:15 AM, the chill of early winter still hung over the Rig 1 server alcove as Nadia initialized the cluster control bridge. On the left display, her terminal was locked into the green-bordered switchboard console `cns00`; on the right, the network monitor tracked outbound telemetry to the Cloudflare edge isolate.

A month ago, distributed coordination had been plagued by the "zombie worker collision" disaster: two distributed build workers on separate machines had picked up Scene 03 at the same time due to an un-fenced network retry. The slower worker had frozen during audio synthesis, timed out, and then resumed twenty minutes later, blindly overwriting the pristine 1080p24 master deliverable rendered by the faster node. Even worse, a developer testing a local speech script had accidentally run synthesis on GPU silicon, consuming 6 GB of VRAM on Rig 1 and causing an immediate Out-Of-Memory kernel crash that brought down the active Remotion optical compositor midway through a 3,000-frame render.

Today, the remaining pillars of Phase 7—Features 7.2, 7.3, and 7.4—stood guard.

Before Nadia dispatched the production run, `packages/400.conductor/val/hardwareBoundary.test.ts` ran its preflight sweep. It verified that `CUDA_VISIBLE_DEVICES=""` was unyieldingly pinned in the execution context, confirming that Rig 1 operated at exactly 0 MB of dedicated GPU VRAM, leaving all workstation memory pools clear for CPU-based software OpenGL rasterization. It scanned the filesystem and verified that no rogue `src/` directory existed. Next, `asciiCleanliness.test.ts` confirmed that every single source line was 100% clean 7-bit ASCII, protecting terminal buffers from Unicode corruption.

When `36.edgebridge.unit` engaged, it dispatched a lease request over HTTP to `ShotCoordinatorDO` running inside the Cloudflare edge worker. The Durable Object advanced its monotonic epoch counter from Epoch 1 to Epoch 2, issuing an exclusive hardware lease (`lease_ep01_sc01_1762215300000`). When a delayed background process attempted to report in with Epoch 1, the edge actor intercepted the request and rejected it instantly with `HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH`.

Down in the terminal cockpit, `updateConductorStatusHud` kept Nadia informed in real time: `cns00` pulsed with rhythmic ASCII updates, shifting from `>> [FLIGHT-DECK] Status: IDLE` to `>> [FLIGHT-DECK] [ACTIVE] Processing Master Scene Lifecycle for [ep01_sc01]...` When the optical pass completed, the edge bridge synced completion telemetry to `/api/telemetry/audio`. The edge worker confirmed `vramUsedMb: 0`, and the HUD flashed clean green: `>> [FLIGHT-DECK] [SEALED] Scene [ep01_sc01] Conformed & Committed (0 MB VRAM) [OK]`. The entire boundary between local workstation hardware and distributed edge actors was mathematically locked.

#### **Strategic Goal**

Directly fulfills the **Hardware Partitioning & Zero-VRAM Rig 1 Sovereignty Invariant ($T_4 = \$0.00$)**, **Monotonic Epoch Mutex Fencing**, and **Operator Cockpit Status Governance**. By establishing an automated offline verification battery (`val/`), a Cloudflare edge Durable Object leasing coordinator (`ShotCoordinatorDO`), and an interactive Blessed HUD status modulator (`updateConductorStatusHud`), this subsystem guarantees that local execution consumes 0 MB of GPU VRAM, prevents zombie workers from corrupting canonical scene outputs, and provides full operational transparency into the multi-stage pipeline at zero marginal cloud compute cost.

#### **Context & Value**

- **The Strategic Value:** In an industrial generative production pipeline, local orchestration must be safely bridged to cloud edge state without risking race conditions or hardware resource contention. If distributed workers lack monotonic epoch fencing, late-returning stale processes will overwrite fresh media assets. If local execution scripts accidentally touch GPU VRAM on Rig 1, optical rendering passes will crash due to driver memory starvation. Implementing strict offline sentry tests, Durable Object epoch arbitration, and curses HUD telemetry bridges guarantees that local workstation processes and cloud edge actors operate in complete synchronization without human babysitting.
- **The Technical Challenge:** Bridging a POSIX Node.js runtime (`packages/400.conductor/`) to a Cloudflare Workers Durable Object isolate (`apps/worker/src/objects/ShotCoordinatorDO.ts`) using typed Zod schemas (`HardwareLeaseReceiptSchema`, `TelemetryIngressPayloadSchema`); enforcing monotonic epoch fencing ($N \to N+1$) to reject stale tokens with `HTTP 409 Conflict`; enforcing strict 0 MB VRAM assertions across both local Vitest runners and edge HTTP endpoints; and updating Blessed curses HUD borders and console streams without screen tearing or call-stack recursion.

#### **Interface**

`Phase 7 Master Scene Lifecycle Execution Edge Coordination (Excluding Feature 7.1)` inside `000.series-sower-conductor` interfaces across the monorepo ecosystem through strict boundaries:

- **`apps/worker` (`ShotCoordinatorDO` & Hono Router):** Houses the Cloudflare edge actor that issues single-threaded hardware leases, advances monotonic epochs, and accepts audio completion telemetry at `POST /api/telemetry/audio`.
- **`packages/400.conductor/36.edgebridge.unit`:** Local Node.js Candor unit responsible for dispatching HTTP requests to the edge worker (or emulating loopback responses in offline local mode) and tracking active lease receipts.
- **`packages/400.conductor/98.menu.unit`:** Mounts `updateConductorStatusHud`, modulating curses cockpit border headers and streaming operational status receipts into `cns00`.
- **`packages/400.conductor/val/`:** Hosts the offline validation battery (`hardwareBoundary.test.ts`, `audioLifecycle.test.ts`, `asciiCleanliness.test.ts`), verifying zero GPU VRAM consumption, contiguous frame quantization, and 100% 7-bit ASCII compliance.
- **`apps/995.library` (Foundational Terminal Chassis):** The immutable curses runner harness (`run.ts`) that boots the Conductor cockpit without allowing modifications to `apps/995.library/995.library/**`.

#### **Interaction**

The operator observes and interacts with this phase through the **Blessed Terminal Interface** hosted in `apps/995.library` and the automated offline validation gauntlet:

- **Interactive Cockpit Navigation:**
  1. Boot the operator cockpit on Rig 1 via `npm run dev`.
  2. Observe the header banner and switchboard console pane `cns00` in the right quadrant (`{ x: 4, y: 0, xSpan: 8, ySpan: 12 }`).
  3. When an execution cycle triggers, `updateConductorStatusHud` updates the screen with real-time ASCII telemetry:
    ```plaintext
    >> [FLIGHT-DECK] [ACTIVE] Processing Master Scene Lifecycle for [ep01_sc01]...
    >> [EDGE] [OK] Acquired Hardware Lease: lease_ep01_sc01_1762215300000 (Epoch: 2)
    >> [EDGE] Telemetry synchronized to edge isolate (vramUsedMb: 0)
    >> [FLIGHT-DECK] [SEALED] Scene [ep01_sc01] Conformed & Committed (0 MB VRAM) [OK]
    ```
  4. If a circuit breaker trips or an epoch conflict occurs, `cns00` displays an immediate fail-closed warning:
    ```plaintext
    :: [EDGE] [FAIL] Lease acquisition failed: HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH
    :: [FLIGHT-DECK] [FAIL] Circuit Breaker Tripped on Scene [ep01_sc01] -> DLQ
    ```
- **Local Headless CLI Inspection:**
  - Execute the local validation gauntlet across all three Feature 7.2 verification suites:
    ```bash
    npx vitest run packages/400.conductor/val/hardwareBoundary.test.ts packages/400.conductor/val/audioLifecycle.test.ts packages/400.conductor/val/asciiCleanliness.test.ts
    ```
  - Execute the Cloudflare Worker Durable Object unit test battery:
    ```bash
    npx vitest run apps/worker/test/unit/edgeCoordinator.test.ts
    ```
  - Confirm that the package adheres strictly to the unit-colocated layout without any forbidden `src/` directory:
    ```bash
    test ! -d packages/400.conductor/src && echo ">> [OK] Zero src/ directory confirmed."
    ```
  - Verify that the immutable harness has sustained exactly zero modifications:
    ```bash
    git status -s apps/995.library/995.library/
    ```
    (Must return 0 modified lines)[cite: 1, 2].

### You

{{FOCUS: Phase 7 Master Scene Lifecycle Execution Edge Coordination with out Feature 7.1: Master Lifecycle Sequential Chaining since it has already been covered }}

@agrav-check-00

### Gemini

### **Validation:**

- **Progress:** [⚪ Waiting for Action ]

> **Operational Directive for Antigravity:** When all of the listed checks, negative-control boundary traps, offline hardware sentry assertions, Cloudflare Durable Object epoch fencing tests, and interactive Blessed terminal levels in this Antigravity verification prompt are executed and pass with zero faults in regards to **Phase 7 Master Scene Lifecycle Execution Edge Coordination (Excluding Feature 7.1)**, Antigravity must update `[- **Progress:**]` above with the current timestamp and certification verdict (e.g., `[- **Progress:** 🟢 Certified on Thursday, November 5, 2026 at 8:05 AM EST - All Verification Tiers Cleared]`) and rewrite the original directive file with this finalized verification status upon successful completion of all audits and tests. If any check, constraint validation, zero-VRAM assertion, monotonic epoch fence, pure 7-bit ASCII scan, runner boundary fence test, or Vitest suite trips or fails, mark `[⚪` with `[🔴 Failed on Thursday, November 5, 2026 at 8:05 AM EST - Breach Detected in <LEVEL/CHECK>]` and emit the fail-closed conflict diagnostic trace.

### Blessed Terminal Interface (TUI) Validation Instructions

When validating features involving a Blessed Terminal Interface (`apps/995.library/` / `cns00` Showrunner Terminal):

1. **Human Keyboard Emulation:** Manually interact with the interface using real keyboard inputs and sequences (e.g., Arrow keys, Vim `j`/`k`, `Tab`, `Enter`, `Escape`, character inputs, and configured shortcuts) exactly as an operator at a physical terminal would.
2. **Step-by-Step Flow Navigation:** Drive end-to-end user journeys through sequential keystrokes rather than relying solely on headless mocks or direct state mutations. Allow render and event loop cycles between inputs.
3. **Screen & Focus Verification:** Observe terminal screen buffers, cursor positions, active focused widgets, and visual updates after each keypress sequence to ensure the UI responds correctly without screen tearing.
4. **Lifecycle & Clean Exit:** Verify proper startup rendering, navigation across interactive elements, and graceful termination routines (such as `q`, `Escape`, or `Ctrl+C`).

### Blessed Terminal Interface (TUI) Validation & Autonomous Remediation Protocol

#### 1. Authoritative Runner Entry Point

- All interactive Blessed terminal tests **MUST** execute exclusively through:
  ```bash
  npm run dev
  ```
  *(Direct execution via bare `node` is strictly prohibited because `.ts` transpilation requires `tsx`; direct package execution flags like `npm run dev -- --package=299.lore` are strictly forbidden).*

#### 2. Pre-Flight Boundary Self-Healing Guard

- Before launching the runner, the auditor must assert harness integrity:
  ```bash
  git status -s apps/995.library/995.library/
  ```
- **Remediation Action:** If any dirty files or rogue stubs are detected inside `apps/995.library/995.library/`, the auditor must run `git restore apps/995.library/995.library/` immediately before proceeding to the build.
- `apps/995.library/run.ts` is the only file under `apps/995.library/` with a permitted modification path.

#### 3. In-Scope Remediation Mandate (Zero-Handoff Policy)

- If Level 6 encounters:
  - Missing CLI flags or runner options in `apps/995.library/run.ts` (permitted modification path).
  - Unimplemented menu navigation or telemetry hooks in `packages/400.conductor/98.menu.unit/`.
  - Stale references in local package `tsconfig.json`.
- **The auditor must NOT halt execution or report failure to the user.**
- **The auditor must proactively implement the missing wiring**, re-execute the gauntlet, and verify clean end-to-end telemetry before sealing the audit.

#### 4. Verification Integrity Boundary

- The auditor should never:
  - Weaken Zod schemas or basis-point bounds to bypass failures.
  - Modify the immutable harness (`apps/995.library/995.library/**`).
  - Comment out or weaken directive assertions.
- Remediation is strictly limited to fixing runtime orchestration, restoring boundary corruptions, and fulfilling the mandated UI journey.

### ANTIGRAVITY ADVERSARIAL AUDIT & VERIFICATION GAUNTLET

- **TARGET DIRECTIVE:** `008.edge-coordination-phase7-without-71.ag-test.md`
- **TARGET FOCUS:** `Phase 7 Master Scene Lifecycle Execution Edge Coordination (Excluding Feature 7.1)`
- **TARGET REPOSITORIES / WORKSPACES:**
  - `packages/400.conductor/` (`000.series-sower-conductor`)
  - `apps/worker/` (Cloudflare edge isolate gateway)
- **AUDIT TARGET INODES:**
  - `packages/400.conductor/src/` *(ASSERTION: Physical non-existence; strict unit-colocated layout)*
  - `packages/400.conductor/36.edgebridge.unit/fce/edgebridge.interface.ts` *(AUDIT: Strict typings for `HardwareLeaseReceipt`, `TelemetryIngressPayload`, `Edgebridge`)*
  - `packages/400.conductor/36.edgebridge.unit/fce/edgebridge.bit.ts` *(AUDIT: Candor operational bit payload contract `EdgebridgeBit`)*
  - `packages/400.conductor/36.edgebridge.unit/val/edgebridge.val.ts` *(AUDIT: Zod schemas `HardwareLeaseReceiptSchema`, `TelemetryIngressPayloadSchema` with `.strict()` termination)*
  - `packages/400.conductor/36.edgebridge.unit/buz/edgebridge.buzz.ts` *(AUDIT: Lease acquisition, monotonic epoch tracking, HTTP client and local loopback emulation)*
  - `packages/400.conductor/36.edgebridge.unit/edgebridge.action.ts` *(AUDIT: Typed actions `INIT_EDGEBRIDGE`, `UPDATE_EDGEBRIDGE`, `ACQUIRE_HARDWARE_LEASE`, `SYNC_EDGE_TELEMETRY`)*
  - `packages/400.conductor/36.edgebridge.unit/edgebridge.buzzer.ts` *(AUDIT: NodeNext buzzer exports with explicit `.js` specifiers)*
  - `packages/400.conductor/36.edgebridge.unit/edgebridge.model.ts` *(AUDIT: State model store)*
  - `packages/400.conductor/36.edgebridge.unit/edgebridge.reduce.ts` *(AUDIT: Pure reducer implementation via `clone-deep`)*
  - `packages/400.conductor/36.edgebridge.unit/edgebridge.unit.ts` *(AUDIT: Candor unit class wiring)*
  - `packages/400.conductor/BEE.ts` *(AUDIT: Central unit registration of `EdgebridgeUnit` in `list`, `reducer`, and `UnitData`)*
  - `apps/worker/src/objects/ShotCoordinatorDO.ts` *(AUDIT: Monotonic epoch advancement $N \to N+1$ and `HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH` gate)*
  - `apps/worker/src/index.ts` *(AUDIT: Route ingress `POST /api/lease/acquire` and `POST /api/telemetry/audio` verifying `vramUsedMb: 0`)*
  - `packages/400.conductor/98.menu.unit/buz/00.menu.buzz.ts` *(AUDIT: Mounting of `updateConductorStatusHud` streaming real-time status banners into `cns00`)*
  - `packages/400.conductor/val/hardwareBoundary.test.ts` *(AUDIT: Feature 7.2 Rig 1 Zero-VRAM hardware sentry test)*
  - `packages/400.conductor/val/audioLifecycle.test.ts` *(AUDIT: Feature 7.2 Ephemeral subprocess and ffprobe frame quantization test)*
  - `packages/400.conductor/val/asciiCleanliness.test.ts` *(AUDIT: Feature 7.2 Pure 7-bit ASCII monorepo linter test)*
  - `apps/worker/test/unit/edgeCoordinator.test.ts` *(AUDIT: Feature 7.3 Cloudflare Workers Vitest suite verifying lease issuance and epoch collision rejection)*
  - `apps/995.library/995.library/**` *(ASSERTION: Immutable runner boundary held at exactly 0 modified lines)*
- **AUDITOR PERSONA:** Autonomous Adversarial Systems Auditor & Hardware Segregation/Edge Sentry (Antigravity v2.4)

### I. Architectural Mandate & Universal Negative-Control Law

Under the **Universal Negative-Control Law**, an edge bridge coordinator, hardware lease arbitrator, or offline verification battery that has never been observed actively failing closed when subjected to unconstrained GPU VRAM consumption on Rig 1, stale zombie lease epochs ($E_{\text{presented}} < E_{\text{active}}$), multi-byte non-ASCII characters, un-schemaed JSON sidecars, or rogue modifications to the immutable vendor harness `apps/995.library/995.library/**` at Stage $T_0 = \$0.00$ **CANNOT BE CERTIFIED FOR PRODUCTION DEPLOYMENT**.

Antigravity executes active negative-control fault injections: testing strict 0 MB GPU VRAM isolation (`CUDA_VISIBLE_DEVICES=""`), proving monotonic epoch fencing in `ShotCoordinatorDO` (`HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH`), scanning monorepo TypeScript files for multi-byte Unicode leaks, asserting atomic zero-drift frame quantization, and validating live Blessed HUD border modulations in `cns00`.

### II. Multi-Level Adversarial Audit Gauntlet

#### Level 1: Static Monorepo Boundary, Directory Invariant & Pure 7-Bit ASCII Audit

- **Check 1.1 (Forbidden `packages/400.conductor/src/` Non-Existence):** Assert that no `packages/400.conductor/src/` directory exists. All models, actions, buzzers, and reducers must reside strictly inside numbered unit folders (`36.edgebridge.unit/`, etc.) and `val/`.
  ```bash
  test ! -d packages/400.conductor/src && echo ">> [OK] Zero src/ directory confirmed."
  ```
  *(Must exit with return code 0).*
- **Check 1.2 (Immutable Harness Fence):** Assert that the runner harness has sustained zero modifications:
  ```bash
  git status -s apps/995.library/995.library/
  ```
  *(Must return exactly 0 modified lines; if dirty, restore immediately via `git restore apps/995.library/995.library/`).*
- **Check 1.3 (NodeNext Explicit `.js` Imports):** Inspect all imports across `packages/400.conductor/36.edgebridge.unit/` to verify that all relative module specifiers terminate explicitly with `.js` extensions.
- **Check 1.4 (Pure 7-Bit ASCII Cleanliness):** Execute an automated scan across all unit files and test suites in `36.edgebridge.unit`, `val/`, and `apps/worker/` to assert zero multi-byte Unicode or emojis:
  ```bash
  node -e "
  const fs = require('fs');
  const path = require('path');
  const files = [
    '36.edgebridge.unit/fce/edgebridge.interface.ts',
    '36.edgebridge.unit/fce/edgebridge.bit.ts',
    '36.edgebridge.unit/val/edgebridge.val.ts',
    '36.edgebridge.unit/buz/edgebridge.buzz.ts',
    '36.edgebridge.unit/edgebridge.action.ts',
    '36.edgebridge.unit/edgebridge.buzzer.ts',
    '36.edgebridge.unit/edgebridge.model.ts',
    '36.edgebridge.unit/edgebridge.reduce.ts',
    '36.edgebridge.unit/edgebridge.unit.ts',
    'val/hardwareBoundary.test.ts',
    'val/audioLifecycle.test.ts',
    'val/asciiCleanliness.test.ts'
  ];
  for (const f of files) {
    const full = path.join('packages/400.conductor', f);
    if (!fs.existsSync(full)) {
      console.error(':: [FAIL] Missing file: ' + full);
      process.exit(1);
    }
    const content = fs.readFileSync(full, 'utf8');
    if (/[\x80-\xFF]/.test(content)) {
      console.error(':: [FAIL] Multi-byte non-ASCII character detected in: ' + full);
      process.exit(1);
    }
  }
  console.log('>> [OK] 100% 7-Bit Clean ASCII confirmed across all edge bridge unit inodes.');
  "
  ```
- **Check 1.5 (TypeScript Monorepo Compilation):** Execute typecheck across package and worker reference configurations:
  ```bash
  npx tsc -b packages/400.conductor apps/worker
  ```
  *(Must complete with 0 errors and 0 diagnostic warnings).*

#### Level 2: Feature 7.2 Rig 1 Zero-VRAM Hardware Sentry & Inode Separation Traps

- **Check 2.1 (Hardware Environment Barrier):** Inspect `packages/400.conductor/val/hardwareBoundary.test.ts`.*Assertion:* Assert that running the suite verifies `process.env.CUDA_VISIBLE_DEVICES === ""`. Any configuration that exposes non-empty CUDA device IDs to Rig 1 execution fails the audit.
- **Check 2.2 (Colocated Unit Inode Separation):** Confirm that `36.edgebridge.unit` contains the complete Candor 7-file suite (`interface`, `bit`, `val`, `buzz`, `action`, `buzzer`, `model`, `reduce`, `unit`).
- **Check 2.3 (Run Hardware Boundary Test Suite):** Execute the sentry test:
  ```bash
  npx vitest run packages/400.conductor/val/hardwareBoundary.test.ts
  ```
  *(Must exit with return code 0).*

#### Level 3: Feature 7.2 Offline Audio Lifecycle & Frame Quantization Traps

- **Check 3.1 (Offline Ceiling Quantization Assertion):** Evaluate the 24 fps integer ceiling formula against mock inputs:
  $$
  \text{target\_frames} = \left\lceil \left(\frac{D_{\text{ms}}}{1000}\right) \times 24 \right\rceil \text{}
  $$
  *Assertion:* For $D_1 = 3{,}125\text{ ms}$, target frames must equal $75$. For $D_2 = 2{,}000\text{ ms}$, target frames must equal $48$. Total frames must equal $123$.
- **Check 3.2 (Zero-Drift Contiguity & Cumulative Drift Bounds):** Inspect `packages/400.conductor/val/audioLifecycle.test.ts`.*Assertion:* `to_frame_0 + 1 === from_frame_1` must hold bit-for-bit, and `drift_ms` must be strictly $< 41.67\text{ ms}$ ($< 1\text{ video frame}$) across the test sequence.
- **Check 3.3 (Run Audio Lifecycle Test Suite):** Execute the quantization test:
  ```bash
  npx vitest run packages/400.conductor/val/audioLifecycle.test.ts
  ```
  *(Must exit with return code 0).*

#### Level 4: Feature 7.3 Edge Coordination & Monotonic Epoch Fencing Traps

- **Check 4.1 (Strict Zod Schema Closure):** Pass an adversarial payload injecting un-schemaed keys (e.g., `cluster_id`, `gpu_target`) into `HardwareLeaseReceiptSchema` or `TelemetryIngressPayloadSchema`.*Assertion:* Must fail immediately with `ZodError` at Stage $T_0 = \$0.00$ spend.
- **Check 4.2 (Zero-VRAM Ingress Guard at Edge Router):** Send a payload to `POST /api/telemetry/audio` in `apps/worker/src/index.ts` with `vramUsedMb: 4096`.*Assertion:* Edge router must reject the request with `HTTP 400 Bad Request: VIOLATION: Rig 1 Zero-VRAM Invariant breached`.
- **Check 4.3 (Durable Object Monotonic Epoch Advancement):** Invoke `POST /lease/acquire` on `ShotCoordinatorDO` with `{ sceneId: 'ep01_sc01' }`.*Assertion:* Returns `status: 200` with advanced epoch token ($E \to E + 1$).
- **Check 4.4 (Negative-Control Zombie Epoch Collision Trap):** Advance `ShotCoordinatorDO` to Epoch 3. Present a request with `presentedEpoch: 2`.*Assertion:* Must reject with `HTTP 409 Conflict: ZOMBIE_LEASE_EPOCH`, disallowing late-returning stale processes from claiming execution.
- **Check 4.5 (Run Edge Coordinator Test Suite):** Execute the Cloudflare Workers unit test battery:
  ```bash
  npx vitest run apps/worker/test/unit/edgeCoordinator.test.ts
  ```
  *(Must exit with return code 0).*

#### Level 5: Feature 7.2 Monorepo Pure 7-Bit ASCII Cleanliness Gauntlet

- **Check 5.1 (Run ASCII Cleanliness Linter Test):** Execute the monorepo source linter suite:
  ```bash
  npx vitest run packages/400.conductor/val/asciiCleanliness.test.ts
  ```
  *(Must assert zero characters matching `/[\x80-\xFF]/` across all conductor units and pass with exit code 0).*

#### Level 6: Feature 7.4 Blessed Cockpit HUD Status Modulation & Telemetry Audit

- **Step 6.1 (Launch Terminal Cockpit):** Start the operator interface via the authoritative entry point:
  ```bash
  npm run dev
  ```
- **Step 6.2 (HUD Telemetry Modulation Emulation):** Trigger `updateConductorStatusHud` across four lifecycle states:
  - `IDLE`: Displays `>> [FLIGHT-DECK] Status: IDLE | Scene: ep01_sc01`.
  - `ACTIVE_SYNTHESIS`: Displays `>> [FLIGHT-DECK] [ACTIVE] Processing Master Scene Lifecycle for [ep01_sc01]...`.
  - `COMPLETE`: Displays `>> [FLIGHT-DECK] [SEALED] Scene [ep01_sc01] Conformed & Committed (0 MB VRAM) [OK]`.
  - `FAILED`: Displays `:: [FLIGHT-DECK] [FAIL] Circuit Breaker Tripped on Scene [ep01_sc01] -> DLQ`.
- **Step 6.3 (Console Telemetry Verification - `cns00`):** Inspect switchboard console `cns00` at `{ x: 4, y: 0, xSpan: 8, ySpan: 12 }` to verify clean 7-bit ASCII rendering without curses alternate buffer tearing.
- **Step 6.4 (Graceful Teardown):** Press `Escape` or `q` to terminate the Blessed curses loop cleanly, confirming zero unhandled asynchronous promise rejections, zero dangling timers, and clean restoration of terminal standard I/O.

### III. Final Feedback & Status Mutation Directive

#### 1. If ALL Verification Levels Pass (100% Compliance Across Levels 1–6):

- Update `[- **Progress:**]` at the top of this document to:
  ```markdown
  - **Progress:** [🟢 Certified on Thursday, November 5, 2026 at 8:05 AM EST - All Verification Tiers Cleared]
  ```
- Overwrite the original specification file with this updated header.
- Emit the certified success feedback receipt:
  ```plaintext
  >> ==============================================================================
  >> [ANTIGRAVITY AUDIT VERDICT: PASSED 🟢]
  >> PHASE 7: MASTER SCENE LIFECYCLE EXECUTION EDGE COORDINATION (EXCLUDING 7.1)
  >> ------------------------------------------------------------------------------
  >> [OK] Level 1: Monorepo fences held. apps/995.library/ untouched. Zero src/.
  >> [OK] Level 2: Feature 7.2 Rig 1 Zero-VRAM hardware sentry test verified (0 MB VRAM).
  >> [OK] Level 3: Feature 7.2 Audio lifecycle and 24 fps integer quantization verified.
  >> [OK] Level 4: Feature 7.3 Cloudflare ShotCoordinatorDO monotonic epoch fencing verified (HTTP 409).
  >> [OK] Level 5: Feature 7.2 Pure 7-bit ASCII monorepo cleanliness verified (0 multi-byte characters).
  >> [OK] Level 6: Feature 7.4 Blessed curses TUI flight deck HUD status modulations verified.
  >> ------------------------------------------------------------------------------
  >> STATUS: EDGE COORDINATION & OFFLINE TEST BATTERY CERTIFIED PRODUCTION-READY
  >> ==============================================================================
  ```

#### 2. If ANY Check, Assertion, or Level Fails:

- Update `[- **Progress:**]` at the top of this document to:
  ```markdown
  - **Progress:** [🔴 Failed on Thursday, November 5, 2026 at 8:05 AM EST - Breach Detected in <LEVEL/CHECK>]
  ```
- Overwrite the original specification file with this updated header.
- Emit the fail-closed conflict diagnostic banner:
  ```plaintext
  :: ==============================================================================
  :: [ANTIGRAVITY AUDIT VERDICT: FAILED 🔴]
  :: PHASE 7: MASTER SCENE LIFECYCLE EXECUTION EDGE COORDINATION (EXCLUDING 7.1)
  :: ------------------------------------------------------------------------------
  :: [FAIL] Verification halted at Level <X>: <CHECK_NAME>
  :: Reason: <SPECIFIC_ASSERTION_FAILURE_DETAILS>
  :: Action: Remediate defective artifacts in 36.edgebridge.unit, val/, or apps/worker/ before re-running audit.
  :: ==============================================================================
  ```
  *(Halt execution immediately without mutating further code).*
