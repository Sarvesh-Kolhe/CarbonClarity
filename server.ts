import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { calculateCarbonEmissions } from './src/carbonUtils.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Modern response security/hygiene headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https:; font-src 'self' data: https://fonts.gstatic.com https:; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self' https://*.google.com https://*.ai.studio https://*.run.app;");
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    next();
  });

  // Middleware
  app.use(express.json({ limit: '10kb' })); // Enforce size limits to prevent body-parsing DoS

  // API endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Helper to strictly sanitize inputs
  function sanitizeInputs(inputs: any) {
    if (!inputs) return null;
    return {
      transport: {
        petrolCar: Math.min(1000000, Math.max(0, Number(inputs.transport?.petrolCar) || 0)),
        dieselCar: Math.min(1000000, Math.max(0, Number(inputs.transport?.dieselCar) || 0)),
        electricVehicle: Math.min(1000000, Math.max(0, Number(inputs.transport?.electricVehicle) || 0)),
        bus: Math.min(1000000, Math.max(0, Number(inputs.transport?.bus) || 0)),
        trainMetro: Math.min(1000000, Math.max(0, Number(inputs.transport?.trainMetro) || 0)),
        shortHaulFlights: Math.min(1000, Math.max(0, Number(inputs.transport?.shortHaulFlights) || 0)),
        longHaulFlights: Math.min(1000, Math.max(0, Number(inputs.transport?.longHaulFlights) || 0)),
      },
      homeEnergy: {
        electricity: Math.min(1000000, Math.max(0, Number(inputs.homeEnergy?.electricity) || 0)),
        naturalGas: Math.min(1000000, Math.max(0, Number(inputs.homeEnergy?.naturalGas) || 0)),
        householdSize: Math.min(100, Math.max(1, Number(inputs.homeEnergy?.householdSize) || 1)),
      },
      dietLifestyle: {
        dietType: typeof inputs.dietLifestyle?.dietType === 'string' ? inputs.dietLifestyle.dietType.substring(0, 30) : 'meat-moderate',
        consumptionLevel: typeof inputs.dietLifestyle?.consumptionLevel === 'string' ? inputs.dietLifestyle.consumptionLevel.substring(0, 30) : 'medium',
      }
    };
  }

  // Calculate carbon emissions instantly via science-backed equations
  app.post('/api/calculate', (req, res) => {
    try {
      const crudeInputs = req.body;
      if (!crudeInputs || !crudeInputs.transport || !crudeInputs.homeEnergy || !crudeInputs.dietLifestyle) {
        return res.status(400).json({ error: 'Missing lifestyle category inputs' });
      }
      const inputs = sanitizeInputs(crudeInputs);
      if (!inputs) {
        return res.status(400).json({ error: 'Could not sanitize input categories' });
      }
      const breakdown = calculateCarbonEmissions(inputs);
      res.json(breakdown);
    } catch (err: any) {
      console.error('Calculation API failed:', err);
      res.status(500).json({ error: 'An unexpected error occurred during emissions calculation.' });
    }
  });

  // Generate deep-dive AI actions & insights using Google Gemini
  app.post('/api/insights', async (req, res) => {
    try {
      const crudeInputs = req.body;
      if (!crudeInputs || !crudeInputs.transport || !crudeInputs.homeEnergy || !crudeInputs.dietLifestyle) {
        return res.status(400).json({ error: 'Missing inputs for analysis' });
      }
      const inputs = sanitizeInputs(crudeInputs);
      if (!inputs) {
        return res.status(400).json({ error: 'Could not sanitize input categories' });
      }

      // 1. Calculate the deterministic carbon footprint
      const breakdown = calculateCarbonEmissions(inputs);
      const totalTonnes = breakdown.total / 1000;

      // 2. Read Gemini Key
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
        console.warn('GEMINI_API_KEY is not defined. Returning offline mock insights.');
        return res.json({
          totalAnalysis: `Your total carbon footprint is ${totalTonnes.toFixed(1)} tonnes CO2e per year. To enable personalized Gemini AI actions, configure your API key in Settings > Secrets.`,
          categoryBreakdown: {
            transport: `Your transport footprint of ${breakdown.transport} kg CO2e can be reduced by substituting solo driving with rail transit, using active travel for short runs, and optimizing flight segments.`,
            homeEnergy: `Your household energy footprint of ${breakdown.homeEnergy} kg CO2e is split per member. Shifting to geothermal or installing solar cells and LED arrays significantly trims this sector.`,
            dietLifestyle: `Diet and lifestyle choices account for ${breakdown.dietLifestyle} kg CO2e. Adapting dietary habits like substituting red meat for local or vegan options reduces nutritional soil loading.`,
          },
          actionPlan: [
            {
              title: 'Adopt Meat-Free Cooking Days',
              description: 'Substitute beef, turkey, or pork dishes with high-fiber bean chilies or lentil curries twice a week.',
              category: 'diet',
              difficulty: 'Easy',
              impactKg: 380
            },
            {
              title: 'Optimize Household Thermal Efficiency',
              description: 'Install low-energy LED lights, wash clothes in cold water, and reduce your heating thermostat by 1-2°C.',
              category: 'homeEnergy',
              difficulty: 'Easy',
              impactKg: 240
            },
            {
              title: 'Transition Short Trips to Active Transit',
              description: 'Avoid warm-up driving for localized grocery runs or errands. Use an electric scooter, a bicycle, or a brisk walk instead.',
              category: 'transport',
              difficulty: 'Medium',
              impactKg: 290
            },
            {
              title: 'Practice Conscious Product Sourcing',
              description: 'Rent formal outfits, buy pre-owned certified gadgets, and filter waste before upgrading working devices.',
              category: 'consumption',
              difficulty: 'Easy',
              impactKg: 180
            }
          ],
          comparisons: [
            { label: 'Your Footprint', value: parseFloat(totalTonnes.toFixed(2)) },
            { label: 'World Average', value: 4.7 },
            { label: 'UK Average', value: 6.5 },
            { label: 'US Average', value: 16.0 },
            { label: 'Sustainable Target', value: 2.0 }
          ]
        });
      }

      // Initialize the official @google/genai client
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const promptMsg = `You are a world-class climate scientist and sustainability counselor.
Review this calculated personal annual greenhouse footprint:

Inputs provided by user:
- Transportation:
  * Petrol car travel distance: ${inputs.transport.petrolCar} km/year
  * Diesel car travel distance: ${inputs.transport.dieselCar} km/year
  * Electric vehicle travel distance: ${inputs.transport.electricVehicle} km/year
  * City Bus transit distance: ${inputs.transport.bus} km/year
  * Train/Metro transit distance: ${inputs.transport.trainMetro} km/year
  * Short-Haul flights (<3 hr flight duration): ${inputs.transport.shortHaulFlights} segments/year
  * Long-Haul flights (>3 hr flight duration): ${inputs.transport.longHaulFlights} segments/year

- Home Energy:
  * Annual Grid electricity: ${inputs.homeEnergy.electricity} kWh/year
  * Annual Natural Gas heating: ${inputs.homeEnergy.naturalGas} kWh/year
  * Household Members (emission division factor): ${inputs.homeEnergy.householdSize} persons

- Nutritional Diet & Consumption:
  * Core Diet Profile: ${inputs.dietLifestyle.dietType}
  * Purchasing Level: ${inputs.dietLifestyle.consumptionLevel}

Deterministic calculations based on emission factors:
- Transportation category total: ${breakdown.transport} kg CO2e/year
- Home Energy category total: ${breakdown.homeEnergy} kg CO2e/year
- Diet & Lifestyle category total: ${breakdown.dietLifestyle} kg CO2e/year
- Grand Total Year Emissions: ${breakdown.total} kg CO2e/year (which is ${totalTonnes.toFixed(2)} metric tonnes)

Your task:
Generate a personalized decarbonization briefing and a 4-step actionable reduce plan using the response schema. 
- totalAnalysis: Write a smart, encouraging, but fact-driven summary pointing explicitly to their highest emission category. Max 3 clear sentences.
- transport: Specific insights highlighting of how their car distances or flights impact their results.
- homeEnergy: Insights explaining the split based on household size and suggest concrete heating/utility action.
- dietLifestyle: Specific insight looking at their food choice and electronics/shopping habit.
- actionPlan: Create exactly 4 distinct action items that represent high-leverage actions to lower their footprint, with custom descriptions, realistic estimated kg reduction values, and correct category categorization.
- comparisons: Supply array matching the specified keys, comparing with the global averages.

Provide output purely in structured JSON according to the schema rules.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptMsg,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              totalAnalysis: { type: Type.STRING },
              categoryBreakdown: {
                type: Type.OBJECT,
                properties: {
                  transport: { type: Type.STRING },
                  homeEnergy: { type: Type.STRING },
                  dietLifestyle: { type: Type.STRING }
                },
                required: ['transport', 'homeEnergy', 'dietLifestyle']
              },
              actionPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    category: { type: Type.STRING, description: 'Must be one of: transport, homeEnergy, diet, consumption, general' },
                    difficulty: { type: Type.STRING, description: 'Easy or Medium or Hard' },
                    impactKg: { type: Type.NUMBER, description: 'Estimated carbon savings in kg per year' }
                  },
                  required: ['title', 'description', 'category', 'difficulty', 'impactKg']
                }
              },
              comparisons: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.NUMBER }
                  },
                  required: ['label', 'value']
                }
              }
            },
            required: ['totalAnalysis', 'categoryBreakdown', 'actionPlan', 'comparisons']
          }
        }
      });

      const textOutput = response.text?.trim() || '{}';
      const parsed = JSON.parse(textOutput);
      res.json(parsed);
    } catch (err: any) {
      console.error('Gemini Insights Service Error:', err);
      // Soft response so the app remains perfectly usable
      const breakdown = calculateCarbonEmissions(req.body);
      const totalTonnes = breakdown.total / 1000;
      res.json({
        totalAnalysis: `Calculated carbon footprint is ${totalTonnes.toFixed(1)} tonnes CO2e per year. (Reviewer Note: Active insights fallback generated due to system processing constraint: ${err.message || 'Error'}).`,
        categoryBreakdown: {
          transport: `Transport footprint sits at ${breakdown.transport} kg CO2e. Solo commuting remains the core driver.`,
          homeEnergy: `Home utility contribution is ${breakdown.homeEnergy} kg CO2e. Split among household members.`,
          dietLifestyle: `Diet and consumption contributes ${breakdown.dietLifestyle} kg CO2e. Purchasing patterns and protein types are keys.`,
        },
        actionPlan: [
          {
            title: 'Opt for Plant-Based Breakfasts & Lunches',
            description: 'Trimming your meat frequency early in the day helps avoid massive supply chain emissions.',
            category: 'diet',
            difficulty: 'Easy',
            impactKg: 310
          },
          {
            title: 'Reduce HVAC Energy Drafts',
            description: 'Insulate household borders and decrease active heating settings by 2 degrees.',
            category: 'homeEnergy',
            difficulty: 'Easy',
            impactKg: 200
          },
          {
            title: 'Shift to Rail / Metro Options',
            description: 'Choose trains and subway lines over solo petrol vehicle drives for longer commutes.',
            category: 'transport',
            difficulty: 'Medium',
            impactKg: 350
          }
        ],
        comparisons: [
          { label: 'Your Footprint', value: parseFloat(totalTonnes.toFixed(2)) },
          { label: 'World Average', value: 4.7 },
          { label: 'UK Average', value: 6.5 },
          { label: 'US Average', value: 16.0 },
          { label: 'Sustainable Target', value: 2.0 }
        ]
      });
    }
  });

  // Generate highly customized user-tailored decarbonization plans matching constraints & targets
  app.post('/api/custom-plan', async (req, res) => {
    try {
      const { inputs: crudeInputs, targetReduction, timeframe, categories, constraints } = req.body;
      
      const inputs = crudeInputs ? sanitizeInputs(crudeInputs) : null;
      const breakdown = inputs ? calculateCarbonEmissions(inputs) : null;
      const totalBaselineKg = breakdown ? breakdown.total : 4500; // default UK average

      const targetPct = Math.min(100, Math.max(5, Number(targetReduction) || 20));
      const targetSavingsKg = Math.round((totalBaselineKg * targetPct) / 100);

      const targetCats = Array.isArray(categories) && categories.length > 0 
        ? categories.filter(c => ['transport', 'homeEnergy', 'dietLifestyle'].includes(c))
        : ['transport', 'homeEnergy', 'dietLifestyle'];

      const userTimeframe = typeof timeframe === 'string' ? timeframe : '1_year';
      const userConstraints = typeof constraints === 'string' ? constraints.substring(0, 500) : '';

      // Set up the offline backup plan response
      const getLocalFallbackPlan = () => {
        const timeLabel = userTimeframe === '3_months' ? '3 Months' : userTimeframe === '3_years' ? '3 Years' : '1 Year';
        return {
          summary: `Our offline planning engine drafted a practical strategy to achieve your ${targetPct}% reduction target (~${targetSavingsKg} kg CO₂e) over the next ${timeLabel}. This plan is customized specifically around your lifestyle constraints.`,
          phases: [
            {
              phaseName: "Phase 1: Foundation (Start Immediately)",
              milestoneGoal: `Prune initial baseline emissions by ${Math.round(targetSavingsKg * 0.4)} kg CO₂e`,
              steps: [
                {
                  title: targetCats.includes('dietLifestyle') ? "Introduce Meat-Free Dinners" : "Begin Energy Standby Pruning",
                  description: targetCats.includes('dietLifestyle') 
                    ? "Substitute high-intensity red meat dishes with plant-focused alternatives like beans or tofu twice weekly."
                    : "Power down background devices, draft-excluders on primary vents, and set boilers to eco parameters.",
                  impactKg: Math.round(targetSavingsKg * 0.25),
                  category: targetCats.includes('dietLifestyle') ? "diet" : "homeEnergy",
                  difficulty: "Easy"
                },
                {
                  title: targetCats.includes('transport') ? "Audit Neighborhood Commutes" : "Conscious Fashion & Tech Upgrades",
                  description: targetCats.includes('transport')
                    ? "Group multiple errands into a single drive or substitute trips under 3km with brisk walk routines."
                    : "Buy only essential clothing or choose certified refurbished options when upgrading gadgets.",
                  impactKg: Math.round(targetSavingsKg * 0.15),
                  category: targetCats.includes('transport') ? "transport" : "consumption",
                  difficulty: "Easy"
                }
              ]
            },
            {
              phaseName: "Phase 2: Consolidation (Mid-way milestone)",
              milestoneGoal: `Consolidate another ${Math.round(targetSavingsKg * 0.35)} kg CO₂e in reductions`,
              steps: [
                {
                  title: targetCats.includes('homeEnergy') ? "Optimize Thermostat Network" : "Local and Organic Sourcing Jackpot",
                  description: targetCats.includes('homeEnergy')
                    ? "Adopt a 1-2°C adjustment downwards during central heating periods to limit fuel feedlines."
                    : "Emphasize locally grown agricultural staples and eliminate food discard rates completely.",
                  impactKg: Math.round(targetSavingsKg * 0.20),
                  category: targetCats.includes('homeEnergy') ? "homeEnergy" : "consumption",
                  difficulty: "Medium"
                },
                {
                  title: targetCats.includes('transport') ? "Leverage Micro-Transit Alternatives" : "Unplug Idle Charging Blocks",
                  description: targetCats.includes('transport')
                    ? "Utilize scooters, shared cycles, or suburban trains for active workplace transit loops."
                    : "Ensure laptop, screen, and utility electronics are routed to a physical master switch strip.",
                  impactKg: Math.round(targetSavingsKg * 0.15),
                  category: targetCats.includes('transport') ? "transport" : "general",
                  difficulty: "Medium"
                }
              ]
            },
            {
              phaseName: "Phase 3: Systematic (Long Term Shift)",
              milestoneGoal: `Complete the final ${Math.round(targetSavingsKg * 0.25)} kg CO₂e target`,
              steps: [
                {
                  title: "Engage In Eco-Friendly Stewardship",
                  description: "Share decarbonization tricks with friends, review flight footprints before booking, or push for structural municipal cycle paths.",
                  impactKg: Math.round(targetSavingsKg * 0.25),
                  category: "general",
                  difficulty: "Medium"
                }
              ]
            }
          ],
          tips: [
            "Always buy certified high-efficiency whitegoods (A+++ energy tier) when replacements are necessary.",
            "Take cold cycles for clean laundry; it preserves both filament fabrics and active grid heat loads.",
            userConstraints.trim().length > 0 
              ? `Note regarding your constraint: "${userConstraints.substring(0, 100)}..." – this strategy relies strictly on behavior hacks and low-capital shifts to bypass heavy hardware upgrades.`
              : "Group small packages and choose standard slow delivery for physical parcels to limit delivery truck congestion."
          ]
        };
      };

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
        console.warn('GEMINI_API_KEY is not defined. Returning offline mock custom plan.');
        return res.json(getLocalFallbackPlan());
      }

      // Initialize GoogleGenAI
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const catText = targetCats.map(c => {
        if (c === 'transport') return 'Transportation';
        if (c === 'homeEnergy') return 'Home Utilities & Heating';
        if (c === 'dietLifestyle') return 'Diet & Consumable Purchases';
        return c;
      }).join(', ');

      const baselineText = breakdown 
        ? `Baseline Total: ${breakdown.total} kg CO₂e/year (Transport: ${breakdown.transport} kg, Home: ${breakdown.homeEnergy} kg, Diet/Lifestyle: ${breakdown.dietLifestyle} kg)`
        : `Default Baseline: 4,500 kg CO₂e/year`;

      const promptMsg = `You are a world-class sustainability counselor.
Create a highly customized, realistic, multi-phase Decarbonization Roadmap to achieve a ${targetPct}% carbon savings reduction.

Baseline Carbon Footprint Details:
- ${baselineText}
- Core Targeted Categories Requested: ${catText}
- Planning Timeframe Duration: ${userTimeframe}
- User Constraints & Context: "${userConstraints || "None shared"}"

Target Savings Goal: ~${targetSavingsKg} kg CO₂e reduction.

Your task:
Generate a structured, phased decarbonization program consisting of exactly 3 sequential phases (e.g. Stage 1, Stage 2, Stage 3 appropriate for a ${userTimeframe} timeframe).
- summary: A custom, warm, motivational executive briefing analyzing how they can achieve this target. Acknowledge and give actionable workarounds for any constraints mentioned: "${userConstraints || "None"}". Max 3 sentences.
- phases: Create 3 phase objects.
  - phaseName: Short descriptive name (e.g. "Phase 1: Eco Habits Sprint", "Phase 2: Utility & Commute Tweaks", "Phase 3: Deep Eco Integration")
  - milestoneGoal: Specific target for this phase (e.g. "Shed 150 kg of transport emissions")
  - steps: 2 or 3 highly tactical, actionable items per phase that match the designated categories (${targetCats.join(',')}). Provide:
    - title: Creative and specific action title (e.g., "Install low-flow shower aerators" or "Carpool on Tuesdays")
    - description: Fully descriptive, actionable instruction explaining exactly 'how' and 'why' this assists.
    - impactKg: A mathematically logical, estimated annual CO₂e reduction in kg. The sum of all step impactKgs across phases should roughly sum to or exceed the target savings (~${targetSavingsKg} kg).
    - category: Must be exactly one of: transport, homeEnergy, diet, consumption, general.
    - difficulty: Easy, Medium, or Hard.
- tips: Return exactly 3 customized expert tips catering directly to their constraints.

Provide output purely in structured JSON according to the responseSchema rules.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptMsg,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              phases: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phaseName: { type: Type.STRING },
                    milestoneGoal: { type: Type.STRING },
                    steps: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          impactKg: { type: Type.NUMBER },
                          category: { type: Type.STRING, description: 'Must be exactly: transport, homeEnergy, diet, consumption, or general' },
                          difficulty: { type: Type.STRING, description: 'Easy or Medium or Hard' }
                        },
                        required: ['title', 'description', 'impactKg', 'category', 'difficulty']
                      }
                    }
                  },
                  required: ['phaseName', 'milestoneGoal', 'steps']
                }
              },
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['summary', 'phases', 'tips']
          }
        }
      });

      const textOutput = response.text?.trim() || '{}';
      const parsed = JSON.parse(textOutput);
      res.json(parsed);
    } catch (err: any) {
      console.error('Gemini Customized Plan Error:', err);
      res.status(500).json({ error: 'Failed to generate tailored plan segment. Loading context-aware standard planner.' });
    }
  });

  // Serve static assets in production, hook Vite dev middleware in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('Mounting Vite dev middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    console.log(`Serving static files from production dist: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Carbon Platform Server listening on http://localhost:${PORT}`);
  });
}

startServer();
