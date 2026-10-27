import { Astronomy as A } from '../ephemeris.js';
const NAMES = ['New', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full', 'Waning gibbous', 'Last quarter', 'Waning crescent'];
export function moonInfo(t) { const phase = A.MoonPhase(t), ill = A.Illumination(A.Body.Moon, t).phase_fraction; return { phase, illumination: ill, name: NAMES[Math.round(phase / 45) % 8] }; }
