// @lifecycle: generated
// @checksum: 3eb2143bdeb571adaf6c6c161d17b2eb93bb35c2a0b4693038cf5a4c6e6bd362
// @upstream_ast: sha256:0000000000000000000000000000000000000000000000000000000000000000

import React from 'react'
import { Composition, Sequence, Audio, staticFile } from 'remotion'

export const Master_ep01_sc01: React.FC = () => {
    return (
        <Composition
            id="ep01_sc01"
            durationInFrames={1690}
            fps={24}
            width={1920}
            height={1080}
            component={() => (
                <>
                    {/* Track 3: Ambient Bed with Automatic Speech Ducking (-14.0 dB) */}
                    <Audio
                        src={staticFile('music/ambient/amb_diner_rain_hum.wav')}
                        volume={(f) =>
                            (f >= 10 && f <= 39) ||
                            (f >= 60 && f <= 89) ||
                            (f >= 110 && f <= 139) ||
                            (f >= 160 && f <= 189) ||
                            (f >= 210 && f <= 239) ||
                            (f >= 260 && f <= 289) ||
                            (f >= 310 && f <= 339) ||
                            (f >= 360 && f <= 389) ||
                            (f >= 410 && f <= 439) ||
                            (f >= 460 && f <= 489) ||
                            (f >= 510 && f <= 539) ||
                            (f >= 560 && f <= 589) ||
                            (f >= 610 && f <= 639) ||
                            (f >= 660 && f <= 689) ||
                            (f >= 710 && f <= 739) ||
                            (f >= 760 && f <= 789) ||
                            (f >= 810 && f <= 839) ||
                            (f >= 860 && f <= 889) ||
                            (f >= 910 && f <= 939) ||
                            (f >= 960 && f <= 989) ||
                            (f >= 1010 && f <= 1039) ||
                            (f >= 1060 && f <= 1089) ||
                            (f >= 1110 && f <= 1139) ||
                            (f >= 1160 && f <= 1189) ||
                            (f >= 1210 && f <= 1239) ||
                            (f >= 1260 && f <= 1289) ||
                            (f >= 1310 && f <= 1339) ||
                            (f >= 1360 && f <= 1389) ||
                            (f >= 1410 && f <= 1439) ||
                            (f >= 1460 && f <= 1489) ||
                            (f >= 1510 && f <= 1539) ||
                            (f >= 1560 && f <= 1589) ||
                            (f >= 1610 && f <= 1639) ||
                            (f >= 1660 && f <= 1689)
                                ? 0.2
                                : 1.0
                        }
                        loop
                    />

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={10} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_001.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={60} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_002.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={110} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_003.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={160} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_004.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={210} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_005.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={260} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_006.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={310} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_007.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={360} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_008.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={410} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_009.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={460} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_010.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={510} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_011.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={560} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_012.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={610} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_013.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={660} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_014.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={710} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_015.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={760} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_016.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={810} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_017.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={860} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_018.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={910} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_019.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={960} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_020.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={1010} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_021.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={1060} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_022.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={1110} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_023.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={1160} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_024.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={1210} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_025.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={1260} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_026.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={1310} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_027.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={1360} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_028.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={1410} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_029.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={1460} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_030.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={1510} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_031.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={1560} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_032.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={1610} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_033.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 1: Dialogue Sequence */}
                    <Sequence from={1660} durationInFrames={30}>
                        <Audio
                            src={staticFile(
                                'outputs/ep01_sc01/stems/line_034.wav',
                            )}
                        />
                    </Sequence>

                    {/* Track 2: Foley Sequence (foley_rain_squall_1) */}
                    <Sequence from={0} durationInFrames={24}>
                        <Audio
                            src={staticFile('foley/rain_squall/squall_v3.wav')}
                            volume={0.8}
                        />
                    </Sequence>

                    {/* Track 2: Foley Sequence (foley_diesel_idle_2) */}
                    <Sequence from={150} durationInFrames={24}>
                        <Audio
                            src={staticFile('foley/diesel_idle/idle_v3.wav')}
                            volume={0.8}
                        />
                    </Sequence>

                    {/* Track 2: Foley Sequence (foley_door_hiss_3) */}
                    <Sequence from={300} durationInFrames={24}>
                        <Audio
                            src={staticFile('foley/door_hiss/hiss_v3.wav')}
                            volume={0.8}
                        />
                    </Sequence>

                    {/* Track 2: Foley Sequence (foley_booth_creak_4) */}
                    <Sequence from={450} durationInFrames={24}>
                        <Audio
                            src={staticFile('foley/booth_creak/creak_v2.wav')}
                            volume={0.8}
                        />
                    </Sequence>

                    {/* Track 2: Foley Sequence (foley_menu_drop_5) */}
                    <Sequence from={600} durationInFrames={24}>
                        <Audio
                            src={staticFile('foley/menu_drop/drop_v3.wav')}
                            volume={0.8}
                        />
                    </Sequence>

                    {/* Track 2: Foley Sequence (foley_coffee_pour_6) */}
                    <Sequence from={750} durationInFrames={24}>
                        <Audio
                            src={staticFile('foley/coffee_pour/pour_v2.wav')}
                            volume={0.8}
                        />
                    </Sequence>

                    {/* Track 2: Foley Sequence (foley_wipe_tear_7) */}
                    <Sequence from={900} durationInFrames={24}>
                        <Audio
                            src={staticFile('foley/wipe_tear/tear_v2.wav')}
                            volume={0.8}
                        />
                    </Sequence>

                    {/* Track 2: Foley Sequence (foley_lens_click_8) */}
                    <Sequence from={1050} durationInFrames={24}>
                        <Audio
                            src={staticFile('foley/lens_click/click_v1.wav')}
                            volume={0.8}
                        />
                    </Sequence>

                    {/* Track 2: Foley Sequence (foley_semi_pass_9) */}
                    <Sequence from={1200} durationInFrames={24}>
                        <Audio
                            src={staticFile('foley/semi_pass/pass_v3.wav')}
                            volume={0.8}
                        />
                    </Sequence>
                </>
            )}
        />
    )
}
