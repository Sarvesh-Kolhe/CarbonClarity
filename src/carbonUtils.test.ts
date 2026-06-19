import { describe, it, expect } from 'vitest';
import { calculateCarbonEmissions, EMISSION_FACTORS } from './carbonUtils';
import { CarbonFootprintInputs } from './types';

describe('Carbon Calculation Engine', () => {
  it('should correctly calculate emissions for zero inputs', () => {
    const zeroInputs: CarbonFootprintInputs = {
      transport: {
        petrolCar: 0,
        dieselCar: 0,
        electricVehicle: 0,
        bus: 0,
        trainMetro: 0,
        shortHaulFlights: 0,
        longHaulFlights: 0,
      },
      homeEnergy: {
        electricity: 0,
        naturalGas: 0,
        householdSize: 1,
      },
      dietLifestyle: {
        dietType: 'vegan',
        consumptionLevel: 'low',
      },
    };

    const result = calculateCarbonEmissions(zeroInputs);

    // Expected emissions = EMISSION_FACTORS.diet['vegan'] (600) + EMISSION_FACTORS.consumption['low'] (600) = 1200
    expect(result.transport).toBe(0);
    expect(result.homeEnergy).toBe(0);
    expect(result.dietLifestyle).toBe(1200);
    expect(result.total).toBe(1200);
  });

  it('should calculate correct transport emissions for fossil-fuel cars', () => {
    const transportInputs: CarbonFootprintInputs = {
      transport: {
        petrolCar: 1000, // 1000 * 0.17 = 170
        dieselCar: 1000,  // 1000 * 0.171 = 171
        electricVehicle: 0,
        bus: 0,
        trainMetro: 0,
        shortHaulFlights: 0,
        longHaulFlights: 0,
      },
      homeEnergy: {
        electricity: 0,
        naturalGas: 0,
        householdSize: 1,
      },
      dietLifestyle: {
        dietType: 'vegan',
        consumptionLevel: 'low',
      },
    };

    const result = calculateCarbonEmissions(transportInputs);
    expect(result.transport).toBe(341); // 170 + 171
  });

  it('should scale home energy emissions based on household size', () => {
    const inputs: CarbonFootprintInputs = {
      transport: {
        petrolCar: 0,
        dieselCar: 0,
        electricVehicle: 0,
        bus: 0,
        trainMetro: 0,
        shortHaulFlights: 0,
        longHaulFlights: 0,
      },
      homeEnergy: {
        electricity: 1000, // 1000 * 0.25 = 250
        naturalGas: 1000,   // 1000 * 0.185 = 185
        householdSize: 2,   // (250 + 185) / 2 = 217.5 -> 218
      },
      dietLifestyle: {
        dietType: 'vegan',
        consumptionLevel: 'low',
      },
    };

    const result = calculateCarbonEmissions(inputs);
    expect(result.homeEnergy).toBe(218);
  });

  it('should default household size to 1 if set to 0 or negative', () => {
    const inputs: CarbonFootprintInputs = {
      transport: {
        petrolCar: 0,
        dieselCar: 0,
        electricVehicle: 0,
        bus: 0,
        trainMetro: 0,
        shortHaulFlights: 0,
        longHaulFlights: 0,
      },
      homeEnergy: {
        electricity: 1000,
        naturalGas: 1000,
        householdSize: 0, // Should be treated as 1
      },
      dietLifestyle: {
        dietType: 'vegan',
        consumptionLevel: 'low',
      },
    };

    const result = calculateCarbonEmissions(inputs);
    const result2 = calculateCarbonEmissions({
      ...inputs,
      homeEnergy: { ...inputs.homeEnergy, householdSize: -5 }
    });

    const expectedSingleHouseholdValue = Math.round(1000 * EMISSION_FACTORS.electricity + 1000 * EMISSION_FACTORS.naturalGas);
    expect(result.homeEnergy).toBe(expectedSingleHouseholdValue);
    expect(result2.homeEnergy).toBe(expectedSingleHouseholdValue);
  });

  it('should fall back to defaults for missing lifestyle fields', () => {
    const inputs: CarbonFootprintInputs = {
      transport: {
        petrolCar: 0,
        dieselCar: 0,
        electricVehicle: 0,
        bus: 0,
        trainMetro: 0,
        shortHaulFlights: 0,
        longHaulFlights: 0,
      },
      homeEnergy: {
        electricity: 0,
        naturalGas: 0,
        householdSize: 1,
      },
      dietLifestyle: {
        // @ts-expect-error evaluating fallback behaviors for empty strings or invalid types
        dietType: '',
        // @ts-expect-error evaluating fallback behaviors for empty strings or invalid types
        consumptionLevel: '',
      },
    };

    const result = calculateCarbonEmissions(inputs);
    // falls back on meat-moderate (1700) and medium consumption (1500) = 3200
    expect(result.dietLifestyle).toBe(3200);
  });
});
