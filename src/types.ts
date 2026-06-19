/**
 * Carbon Footprint Data types
 */

export interface TransportData {
  petrolCar: number; // km/year
  dieselCar: number; // km/year
  electricVehicle: number; // km/year
  bus: number; // km/year
  trainMetro: number; // km/year
  shortHaulFlights: number; // flights/year
  longHaulFlights: number; // flights/year
}

export interface HomeEnergyData {
  electricity: number; // kWh/year
  naturalGas: number; // kWh/year
  householdSize: number; // people sharing home
}

export type DietType = 'meat-heavy' | 'meat-moderate' | 'vegetarian' | 'vegan';
export type ConsumptionLevel = 'low' | 'medium' | 'high';

export interface DietLifestyleData {
  dietType: DietType;
  consumptionLevel: ConsumptionLevel;
}

export interface CarbonFootprintInputs {
  transport: TransportData;
  homeEnergy: HomeEnergyData;
  dietLifestyle: DietLifestyleData;
}

export interface EmissionBreakdown {
  transport: number; // kg CO2e / year
  homeEnergy: number; // kg CO2e / year
  dietLifestyle: number; // kg CO2e / year
  total: number; // kg CO2e / year
}

export interface ActionItem {
  title: string;
  description: string;
  category: 'transport' | 'homeEnergy' | 'diet' | 'consumption' | 'general';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  impactKg: number; // annual reduction in kg CO2e
}

export interface AIInsightsResponse {
  totalAnalysis: string;
  categoryBreakdown: {
    transport: string;
    homeEnergy: string;
    dietLifestyle: string;
  };
  actionPlan: ActionItem[];
  comparisons: {
    label: string;
    value: number; // tonnes CO2e
  }[];
}

// History log item
export interface FootprintHistoryLog {
  id: string;
  date: string;
  inputs: CarbonFootprintInputs;
  breakdown: EmissionBreakdown;
  insights?: AIInsightsResponse;
}

// Sustainable pledge
export interface CarbonPledge {
  id: string;
  actionTitle: string;
  category: 'transport' | 'homeEnergy' | 'diet' | 'consumption' | 'general';
  impactKg: number;
  status: 'pledged' | 'completed';
  datePledged: string;
}
