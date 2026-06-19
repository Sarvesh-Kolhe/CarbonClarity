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

  // 1. Calculate Transport Emissions
  const transportEmissions = 
    ((Number(transport.petrolCar) || 0) * EMISSION_FACTORS.petrolCar) +
    ((Number(transport.dieselCar) || 0) * EMISSION_FACTORS.dieselCar) +
    ((Number(transport.electricVehicle) || 0) * EMISSION_FACTORS.electricVehicle) +
    ((Number(transport.bus) || 0) * EMISSION_FACTORS.bus) +
    ((Number(transport.trainMetro) || 0) * EMISSION_FACTORS.trainMetro) +
    ((Number(transport.shortHaulFlights) || 0) * EMISSION_FACTORS.shortHaulFlight) +
    ((Number(transport.longHaulFlights) || 0) * EMISSION_FACTORS.longHaulFlight);

  // 2. Calculate Home Energy Emissions (Split by household size)
  const householdSize = Math.max(1, Number(homeEnergy.householdSize) || 1);
  const homeElectricityEmissions = ((Number(homeEnergy.electricity) || 0) * EMISSION_FACTORS.electricity);
  const homeGasEmissions = ((Number(homeEnergy.naturalGas) || 0) * EMISSION_FACTORS.naturalGas);
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
