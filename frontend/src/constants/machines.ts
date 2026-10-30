import type { MachineMeta } from '../types/sentrygrid';

export const MACHINE_METADATA: Record<string, MachineMeta> = {
  'pump-02': {
    id: 'pump-02',
    name: 'Pump 02',
    type: 'Centrifugal Coolant Pump',
    location: 'Sector A - Primary Coolant Loop',
    rated_temp: 60.0,
    rated_vib: 1.0,
    rated_cur: 5.0,
    period: 90.0,
    phase: 0.0,
    description: 'High-pressure variable-flow centrifugal pump circulating coolant through primary heat exchangers.',
  },
  'motor-07': {
    id: 'motor-07',
    name: 'Motor 07',
    type: '3-Phase Induction Motor (45kW)',
    location: 'Sector B - Main Drive Train',
    rated_temp: 75.0,
    rated_vib: 1.4,
    rated_cur: 12.0,
    period: 120.0,
    phase: 1.3,
    description: 'Continuous-duty 45kW 3-phase induction drive motor powering primary conveyor systems.',
  },
  'valve-03': {
    id: 'valve-03',
    name: 'Valve 03',
    type: 'Electro-Pneumatic Control Valve',
    location: 'Sector C - Chemical Injection Line',
    rated_temp: 50.0,
    rated_vib: 0.6,
    rated_cur: 2.5,
    period: 75.0,
    phase: 2.1,
    description: 'Precision modulating valve regulating fluid dynamics and reactant feed line pressures.',
  },
};

export const MACHINE_LIST = Object.values(MACHINE_METADATA);
