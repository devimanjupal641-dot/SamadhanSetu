import bcrypt from 'bcryptjs';
import { getDatabase, saveDatabase } from '../config/db';
import { User, Problem, ProblemCategory, UniversityAdoption, IndustrySupport, MoUAgreement } from '../models/types';
import { generateEmbedding, classifyProblem } from '../services/classification/classificationService';
import { matchUniversityDepartment, deduplicateAndCluster } from '../services/routing/routingService';

export async function runDatabaseSeed() {
  console.log('[Seed Engine] Seeding 50+ realistic Indian societal problems, 4 distinct roles, pilot universities, and industry partners...');
  const db = getDatabase();

  // 1. Seed Core Role Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const demoUsers: User[] = [
    {
      id: 'usr_citizen_ramesh',
      name: 'Ramesh Kumar Murmu',
      email: 'citizen@samadhansetu.gov.in',
      password_hash: passwordHash,
      role: 'citizen',
      district: 'Ranchi',
      state: 'Jharkhand',
      language_pref: 'hi',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString()
    },
    {
      id: 'usr_univ_iitb',
      name: 'Dr. Shalini Deshmukh',
      email: 'university@samadhansetu.gov.in',
      password_hash: passwordHash,
      role: 'university',
      organization_name: 'IIT Bombay — Rural Technology Action Group (RuTAG)',
      department: 'Civil & Environmental Engineering',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      language_pref: 'en',
      created_at: new Date(Date.now() - 86400000 * 20).toISOString()
    },
    {
      id: 'usr_univ_bitm',
      name: 'Prof. Anirudh Sen',
      email: 'bitmesra@samadhansetu.gov.in',
      password_hash: passwordHash,
      role: 'university',
      organization_name: 'BIT Mesra Ranchi — Dept of Water & Environment',
      department: 'Chemical Engineering',
      district: 'Ranchi',
      state: 'Jharkhand',
      language_pref: 'en',
      created_at: new Date(Date.now() - 86400000 * 25).toISOString()
    },
    {
      id: 'usr_ind_tata',
      name: 'Vikramaditya Singhania',
      email: 'industry@samadhansetu.gov.in',
      password_hash: passwordHash,
      role: 'industry',
      organization_name: 'Tata Trusts & Sustainability Initiatives',
      department: 'CSR & Municipal Infrastructure',
      district: 'Mumbai',
      state: 'Maharashtra',
      language_pref: 'en',
      created_at: new Date(Date.now() - 86400000 * 30).toISOString()
    },
    {
      id: 'usr_admin_niti',
      name: 'Suresh Chandra IAS',
      email: 'admin@samadhansetu.gov.in',
      password_hash: passwordHash,
      role: 'admin',
      organization_name: 'Ministry of Jal Shakti & NITI Aayog Civic Cell',
      department: 'State Municipal Monitoring Bureau',
      district: 'Ranchi',
      state: 'Jharkhand',
      language_pref: 'en',
      created_at: new Date(Date.now() - 86400000 * 60).toISOString()
    }
  ];

  db.users = demoUsers;

  // 2. Real Seed Problems dataset (55 realistic civic challenges across Indian districts with clusters)
  const rawSeedProblems = [
    {
      title: 'Severe Arsenic and Fluoride Contamination in Ground Well Drinking Water',
      description: 'Handpumps and tube wells across Ward 6 and Ward 7 are pumping water with fluoride levels exceeding 3.8 mg/L. Multiple school children and elders are exhibiting dental and skeletal fluorosis symptoms.',
      category: 'Water & Sanitation' as ProblemCategory,
      district: 'Ranchi',
      ward: 'Ward 6',
      state: 'Jharkhand',
      lat: 23.3441,
      lng: 85.3096,
      affected: 185,
      status: 'Adopted'
    },
    {
      title: 'Heavy Microbial & Coliform Contamination in Tap Pipeline Network',
      description: 'Sewage drain breach directly adjacent to main municipal water distribution line in Ward 6. Water smells strongly of sulfur and contains fecal coliform, causing acute diarrhea outbreak.',
      category: 'Water & Sanitation' as ProblemCategory,
      district: 'Ranchi',
      ward: 'Ward 6',
      state: 'Jharkhand',
      lat: 23.3452,
      lng: 85.3112,
      affected: 240,
      status: 'Solution Proposed'
    },
    {
      title: 'Borewell Salinity and Iron Turbidity Damaging Filtration Systems',
      description: 'Red sediment and extreme iron toxicity above safe drinking limits in community tanks across Ward 6 residential colonies.',
      category: 'Water & Sanitation' as ProblemCategory,
      district: 'Ranchi',
      ward: 'Ward 6',
      state: 'Jharkhand',
      lat: 23.3465,
      lng: 85.3088,
      affected: 95,
      status: 'Clustered'
    },
    {
      title: 'Collapsed Concrete Culvert Causing Total Monsoon Inundation of Primary Health Center',
      description: 'Heavy rains washed out the single bridge connecting 4 tribal hamlets to the Community Health Center (CHC). Ambulances cannot pass.',
      category: 'Roads & Infrastructure' as ProblemCategory,
      district: 'Ranchi',
      ward: 'Ward 12',
      state: 'Jharkhand',
      lat: 23.3510,
      lng: 85.3210,
      affected: 420,
      status: 'Classified'
    },
    {
      title: 'Persistent Stunting and Iron Deficiency Anemia in Anganwadi Centers',
      description: 'Baseline clinical assessment revealed severe micronutrient deficiencies among children aged 1-5 years. Lack of affordable fortified indigenous nutritional supplements.',
      category: 'Healthcare & Nutrition' as ProblemCategory,
      district: 'Ranchi',
      ward: 'Ward 3',
      state: 'Jharkhand',
      lat: 23.3390,
      lng: 85.2950,
      affected: 160,
      status: 'Industry Supported'
    },
    {
      title: 'Solar Microgrid Inverter Failure Plunging Primary Health Center into Darkness',
      description: 'Vaccine cold storage refrigerators are failing repeatedly due to unstable off-grid power supply. Needs intelligent low-cost hybrid power backup.',
      category: 'Clean Energy' as ProblemCategory,
      district: 'Ranchi',
      ward: 'Ward 15',
      state: 'Jharkhand',
      lat: 23.3580,
      lng: 85.3340,
      affected: 310,
      status: 'Adopted'
    },
    {
      title: 'Lack of Cold Chain Storage for Perishable Litchi and Guava Produce',
      description: 'Smallholder farmers are losing over 45% of their seasonal harvest within 48 hours of picking due to zero evaporative cooling or decentralized cold storage facilities.',
      category: 'Agriculture & Irrigation' as ProblemCategory,
      district: 'Ranchi',
      ward: 'Ward 22',
      state: 'Jharkhand',
      lat: 23.3280,
      lng: 85.2810,
      affected: 280,
      status: 'Piloted'
    },
    {
      title: 'Hazardous Unsegregated Biomedical Waste Dumped Near River Subarnarekha',
      description: 'Untreated clinic and hospital syringes, plastic drip bags, and medical refuse accumulating on riverbanks, causing leachate leakage into downstream farm irrigation.',
      category: 'Waste & Environment' as ProblemCategory,
      district: 'Ranchi',
      ward: 'Ward 9',
      state: 'Jharkhand',
      lat: 23.3620,
      lng: 85.3410,
      affected: 520,
      status: 'Classified'
    },
    {
      title: 'Digital Divide: Rural Secondary School Lacks Affordable Offline Interactive Science Kits',
      description: 'Over 350 high school students have no science laboratory equipment or digital tools to study Physics, Chemistry, and Math experiments.',
      category: 'Education & Skill Development' as ProblemCategory,
      district: 'Ranchi',
      ward: 'Ward 14',
      state: 'Jharkhand',
      lat: 23.3480,
      lng: 85.3180,
      affected: 350,
      status: 'Adopted'
    },
    {
      title: 'Pest Infestation of Fall Armyworm Ravaging Maize Fields in Palamu',
      description: 'Over 600 acres of small-scale corn crops devastated by invasive caterpillars within two weeks. Farmers lack biological pest management methods.',
      category: 'Agriculture & Irrigation' as ProblemCategory,
      district: 'Palamu',
      ward: 'Daltonganj Block',
      state: 'Jharkhand',
      lat: 24.0410,
      lng: 84.0720,
      affected: 390,
      status: 'Classified'
    },
    {
      title: 'Severe Groundwater Depletion and Saline Water Encroachment in Marathwada',
      description: 'Borewells running dry at 800 feet depth. Farming community desperately requires low-cost check dam models and continuous IoT soil moisture telemetry.',
      category: 'Agriculture & Irrigation' as ProblemCategory,
      district: 'Aurangabad',
      ward: 'Chhatrapati Sambhajinagar Ward 4',
      state: 'Maharashtra',
      lat: 19.8762,
      lng: 75.3433,
      affected: 680,
      status: 'Solution Proposed'
    },
    {
      title: 'Textile Dyeing Effluent Discharged into Noyyal River Basin',
      description: 'Untreated chemical azo dyes and high TDS discharge into surface water channels, poisoning ground water in agricultural fields across 8 villages.',
      category: 'Waste & Environment' as ProblemCategory,
      district: 'Tiruppur',
      ward: 'Industrial Sector 2',
      state: 'Tamil Nadu',
      lat: 11.1085,
      lng: 77.3411,
      affected: 890,
      status: 'Industry Supported'
    },
    {
      title: 'High Maternal Mortality Linked to Delayed Blood Transfusions in Remote Tribal Belts',
      description: 'No drone logistics or active refrigerated transit for life-saving O-negative blood units between District Hospital and Primary Health Centers.',
      category: 'Healthcare & Nutrition' as ProblemCategory,
      district: 'Gadchiroli',
      ward: 'Bhamragad Block',
      state: 'Maharashtra',
      lat: 19.0020,
      lng: 80.3520,
      affected: 450,
      status: 'Adopted'
    },
    {
      title: 'Frequent Landslides Severing Rural Hill Transport Corridor on NH-108',
      description: 'Unstable shale slopes collapse during every pre-monsoon shower, trapping milk vans and school buses. Slope stabilization bio-engineering urgently needed.',
      category: 'Disaster & Safety' as ProblemCategory,
      district: 'Uttarkashi',
      ward: 'Bhatwari Sector',
      state: 'Uttarakhand',
      lat: 30.7268,
      lng: 78.4354,
      affected: 520,
      status: 'Classified'
    },
    {
      title: 'Extreme Rice Crop Stubble Burning Generating Severe Smog in Western UP',
      description: 'Over 12,000 hectares of paddy fields set on fire due to lack of accessible mechanical in-situ mulching or microbial decomposers.',
      category: 'Waste & Environment' as ProblemCategory,
      district: 'Meerut',
      ward: 'Rural Mawana Block',
      state: 'Uttar Pradesh',
      lat: 29.0090,
      lng: 77.7280,
      affected: 1200,
      status: 'Solution Proposed'
    },
    {
      title: 'Heavy Metal Lead Poisoning in Children Near Informal Battery Recycling Units',
      description: 'Informal open-air smelting of lead-acid vehicle batteries in urban slums resulting in dangerously elevated blood lead levels in toddlers.',
      category: 'Healthcare & Nutrition' as ProblemCategory,
      district: 'Patna',
      ward: 'Ward 18',
      state: 'Bihar',
      lat: 25.5941,
      lng: 85.1376,
      affected: 340,
      status: 'Clustered'
    }
  ];

  // Generate additional structured civic records to exceed 50+ challenges across all 8 sectors
  const additionalDistricts = [
    { district: 'Dhanbad', state: 'Jharkhand', lat: 23.7957, lng: 86.4304 },
    { district: 'Jamshedpur', state: 'Jharkhand', lat: 22.8046, lng: 86.2029 },
    { district: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
    { district: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
    { district: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
    { district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558 },
    { district: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lng: 81.6296 },
    { district: 'Mysuru', state: 'Karnataka', lat: 12.2958, lng: 76.6394 }
  ];

  const templateProblems = [
    {
      cat: 'Clean Energy' as ProblemCategory,
      title: 'Frequent 11kV Feeder Tripping Causing Milk Chilling Plant Spoilage in',
      desc: 'Frequent voltage surges and brownouts cause community milk cooling vats to shut down during summer months.'
    },
    {
      cat: 'Water & Sanitation' as ProblemCategory,
      title: 'Bacteriological Contamination of Community Borewells in Semi-Arid Slums of',
      desc: 'High nitrates from unlined soak pits leaching into shallow aquifer providing drinking water to 500 households.'
    },
    {
      cat: 'Roads & Infrastructure' as ProblemCategory,
      title: 'Deep Bituminous Potholes & Inadequate Stormwater Drainage on Link Road in',
      desc: 'Heavy commercial tractor traffic has degraded link road into a mud slush pit during monsoon, blocking school buses.'
    },
    {
      cat: 'Education & Skill Development' as ProblemCategory,
      title: 'Lack of Adaptive Braille and Audio Learning Aids in Inclusive Schools of',
      desc: 'Visually challenged rural students lack affordable tactile reading materials and low-cost refreshable Braille displays.'
    },
    {
      cat: 'Agriculture & Irrigation' as ProblemCategory,
      title: 'Severe Post-Harvest Onion Rotting Due to Moisture Trapping in Storage of',
      desc: 'Traditional bamboo godowns lack automated ventilation and relative humidity control, spoiling 30% of stored red onions.'
    }
  ];

  const seedProblems: Problem[] = [];

  // Seed base 16 problems
  for (let i = 0; i < rawSeedProblems.length; i++) {
    const raw = rawSeedProblems[i];
    const embedding = generateEmbedding(`${raw.title} ${raw.description} ${raw.category} ${raw.district}`);
    const classification = classifyProblem(raw.title, raw.description);

    seedProblems.push({
      id: `prob_seed_${i + 1}`,
      citizen_id: 'usr_citizen_ramesh',
      citizen_name: 'Ramesh Kumar Murmu',
      title: raw.title,
      description: raw.description,
      category: raw.category,
      ai_confidence: classification.confidence,
      embedding_vector: embedding,
      district: raw.district,
      ward: raw.ward,
      state: raw.state,
      latitude: raw.lat,
      longitude: raw.lng,
      status: raw.status as any,
      severity_score: classification.severityScore,
      affected_citizens_count: raw.affected,
      recommended_department: matchUniversityDepartment(raw.category),
      routing_rationale: `${raw.category} keywords detected with ${(classification.confidence * 100).toFixed(0)}% confidence; high civic vulnerability in ${raw.district}.`,
      language: 'en',
      created_at: new Date(Date.now() - (i + 1) * 3600000 * 8).toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // Generate remaining to make 52 total problems
  let counter = rawSeedProblems.length + 1;
  for (const d of additionalDistricts) {
    for (const t of templateProblems) {
      if (counter > 54) break;
      const title = `${t.title} ${d.district}`;
      const desc = `${t.desc} Immediate technological and institutional intervention requested by civic ward committee of ${d.district}.`;
      const embedding = generateEmbedding(`${title} ${desc} ${t.cat} ${d.district}`);
      const classification = classifyProblem(title, desc);

      seedProblems.push({
        id: `prob_seed_${counter}`,
        citizen_id: 'usr_citizen_ramesh',
        citizen_name: 'Gram Panchayat Citizen Forum',
        title,
        description: desc,
        category: t.cat,
        ai_confidence: classification.confidence,
        embedding_vector: embedding,
        district: d.district,
        ward: `Ward ${Math.floor(Math.random() * 15) + 1}`,
        state: d.state,
        latitude: d.lat + (Math.random() - 0.5) * 0.05,
        longitude: d.lng + (Math.random() - 0.5) * 0.05,
        status: counter % 3 === 0 ? 'Solution Proposed' : counter % 2 === 0 ? 'Adopted' : 'Classified',
        severity_score: classification.severityScore,
        affected_citizens_count: Math.floor(Math.random() * 300) + 50,
        recommended_department: matchUniversityDepartment(t.cat),
        routing_rationale: `${t.cat} indicators identified; localized density across ${d.district} mapped for university R&D intake.`,
        language: 'en',
        created_at: new Date(Date.now() - counter * 3600000 * 6).toISOString(),
        updated_at: new Date().toISOString()
      });
      counter++;
    }
  }

  db.problems = seedProblems;

  // 3. Cluster deduplication
  for (const prob of db.problems) {
    deduplicateAndCluster(prob);
  }

  // 4. Seed Adoptions for demo
  const demoAdoptions: UniversityAdoption[] = [
    {
      id: 'adopt_seed_1',
      problem_id: 'prob_seed_1',
      university_user_id: 'usr_univ_bitm',
      university_name: 'BIT Mesra Ranchi',
      department: 'Chemical Engineering & Water Tech',
      proposal_title: 'Nanofiltration & Graphene-Adsorbent Point-of-Use Community Fluoride Removal Unit',
      proposal_text: 'Deployment of low-cost activated alumina and modified biochar filtration columns capable of treating 2000L/day with continuous fluoride sensor telemetry.',
      estimated_timeline: '4 Months (Pilot + Testing)',
      budget_estimate: 420000,
      status: 'Proposal Submitted',
      adopted_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      proposal_submitted_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'adopt_seed_2',
      problem_id: 'prob_seed_2',
      university_user_id: 'usr_univ_iitb',
      university_name: 'IIT Bombay (RuTAG)',
      department: 'Civil & Environmental Engineering',
      proposal_title: 'Rapid Ultraviolet & Electrolytic Chlorine Dosing In-Line Disinfection System',
      proposal_text: 'Solar-powered compact disinfection manifold fitted onto the municipal pipeline intake with IoT water purity probes.',
      estimated_timeline: '3 Months',
      budget_estimate: 350000,
      status: 'Proposal Submitted',
      adopted_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      proposal_submitted_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'adopt_seed_5',
      problem_id: 'prob_seed_5',
      university_user_id: 'usr_univ_bitm',
      university_name: 'BIT Mesra Ranchi',
      department: 'Biotechnology & Food Sciences',
      proposal_title: 'Indigenous Millets & Moringa-Enriched Therapeutic Food Paste for Anganwadis',
      proposal_text: 'Standardized decentralized manufacturing of high-protein, micronutrient-dense ready-to-use therapeutic food formulated from local Jharkhand farm crops.',
      estimated_timeline: '6 Months Field Trial',
      budget_estimate: 600000,
      status: 'In Pilot',
      adopted_at: new Date(Date.now() - 86400000 * 8).toISOString(),
      proposal_submitted_at: new Date(Date.now() - 86400000 * 6).toISOString()
    }
  ];
  db.adoptions = demoAdoptions;

  // 5. Seed Industry Support & MoU
  const demoSupport: IndustrySupport[] = [
    {
      id: 'ind_sup_1',
      adoption_id: 'adopt_seed_1',
      problem_id: 'prob_seed_1',
      industry_user_id: 'usr_ind_tata',
      industry_name: 'Tata Trusts & Sustainability Initiatives',
      support_type: 'funding',
      commitment_stage: 'Funded',
      amount_inr: 500000,
      notes: 'Sanctioned under Eastern India Clean Drinking Water CSR Grant 2026.',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'ind_sup_5',
      adoption_id: 'adopt_seed_5',
      problem_id: 'prob_seed_5',
      industry_user_id: 'usr_ind_tata',
      industry_name: 'Tata Trusts & Sustainability Initiatives',
      support_type: 'implementation',
      commitment_stage: 'Committed',
      amount_inr: 650000,
      notes: 'Supply chain distribution partnership with 40 Anganwadis.',
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  db.industry_supports = demoSupport;

  const demoMoU: MoUAgreement = {
    id: 'mou_seed_1',
    adoption_id: 'adopt_seed_1',
    problem_id: 'prob_seed_1',
    industry_id: 'usr_ind_tata',
    industry_name: 'Tata Trusts & Sustainability Initiatives',
    university_id: 'usr_univ_bitm',
    university_name: 'BIT Mesra Ranchi',
    template_type: 'Standard Joint IP',
    template_title: 'Collaborative Civic Innovation & IP Co-Ownership Agreement (SIH-Standard)',
    terms_summary: 'Joint patent rights on municipal water filter technology. University retains academic publishing rights. Tata Trusts deploys across 50 eastern Indian villages royalty-free. Citizen public good usage guaranteed.',
    university_acknowledged: true,
    university_acknowledged_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    industry_acknowledged: true,
    industry_acknowledged_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'Active & Executed',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  };
  db.mou_agreements = [demoMoU];

  saveDatabase();
  console.log(`[Seed Engine Complete] Seeded ${db.users.length} users, ${db.problems.length} problems, ${db.clusters.length} clusters, and active MoU agreements.`);
}
