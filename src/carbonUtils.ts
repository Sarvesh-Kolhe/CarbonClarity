import { CarbonFootprintInputs, EmissionBreakdown } from './types.js';

// Science-backed factors in kg CO2e
export const EMISSION_FACTORS = {
  // Transport: kg CO2e per km
  petrolCar: 0.17,
  dieselCar: 0.171,
  electricVehicle: 0.047,
  bus: 0.035,
  trainMetro: 0.021,
  // Flight: kg CO2e per flight (average duration scaled to kg CO2e multiplier)
  shortHaulFlight: 150, // flights < 3 hours
  longHaulFlight: 650,  // flights > 3 hours

  // Home Energy: kg CO2e per kWh
  electricity: 0.25,
  naturalGas: 0.185,

  // Diet Type (per year kg CO2e)
  diet: {
    'meat-heavy': 2500,
    'meat-moderate': 1700,
    'vegetarian': 1200,
    'vegan': 600
  },

  // Consumption level (per year kg CO2e)
  consumption: {
    'low': 600,
    'medium': 1500,
    'high': 3200
  }
};

/**
 * Calculates current carbon emissions from lifestyle inputs
 */
export function calculateCarbonEmissions(inputs: CarbonFootprintInputs): EmissionBreakdown {
  // Ensure we have protective defaults if inputs are undefined
  const transport = (inputs?.transport || {}) as Partial<CarbonFootprintInputs['transport']>;
  const homeEnergy = (inputs?.homeEnergy || {}) as Partial<CarbonFootprintInputs['homeEnergy']>;
  const dietLifestyle = (inputs?.dietLifestyle || {}) as Partial<CarbonFootprintInputs['dietLifestyle']>;

  // Helper to ensure numeric non-negative values
  const clampNum = (val: any) => Math.max(0, Number(val) || 0);

  // 1. Calculate Transport Emissions
  const transportEmissions = 
    (clampNum(transport.petrolCar) * EMISSION_FACTORS.petrolCar) +
    (clampNum(transport.dieselCar) * EMISSION_FACTORS.dieselCar) +
    (clampNum(transport.electricVehicle) * EMISSION_FACTORS.electricVehicle) +
    (clampNum(clampNum(transport.bus)) * EMISSION_FACTORS.bus) +
    (clampNum(transport.trainMetro) * EMISSION_FACTORS.trainMetro) +
    (clampNum(transport.shortHaulFlights) * EMISSION_FACTORS.shortHaulFlight) +
    (clampNum(transport.longHaulFlights) * EMISSION_FACTORS.longHaulFlight);

  // 2. Calculate Home Energy Emissions (Split by household size)
  const householdSize = Math.max(1, clampNum(homeEnergy.householdSize) || 1);
  const homeElectricityEmissions = (clampNum(homeEnergy.electricity) * EMISSION_FACTORS.electricity);
  const homeGasEmissions = (clampNum(homeEnergy.naturalGas) * EMISSION_FACTORS.naturalGas);
  const homeEnergyEmissions = (homeElectricityEmissions + homeGasEmissions) / householdSize;

  // 3. Diet and Lifestyle Emissions
  const dietEmissions = EMISSION_FACTORS.diet[dietLifestyle.dietType as keyof typeof EMISSION_FACTORS.diet] || EMISSION_FACTORS.diet['meat-moderate'];
  const consumptionEmissions = EMISSION_FACTORS.consumption[dietLifestyle.consumptionLevel as keyof typeof EMISSION_FACTORS.consumption] || EMISSION_FACTORS.consumption['medium'];
  const dietLifestyleEmissions = dietEmissions + consumptionEmissions;

  const total = transportEmissions + homeEnergyEmissions + dietLifestyleEmissions;

  return {
    transport: Math.round(transportEmissions),
    homeEnergy: Math.round(homeEnergyEmissions),
    dietLifestyle: Math.round(dietLifestyleEmissions),
    total: Math.round(total)
  };
}

// Global comparisons (in tonnes per year)
export const GLOBAL_BENCHMARKS = [
  { label: 'Your Footprint', value: 0 }, // Filled dynamically
  { label: 'World Average', value: 4.7 },
  { label: 'UK Average', value: 6.5 },
  { label: 'US Average', value: 16.0 },
  { label: 'Sustainable Target (by 2030)', value: 2.0 }
];
