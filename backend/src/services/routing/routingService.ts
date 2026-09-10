import { Problem, ProblemCategory, ProblemCluster } from '../../models/types';
import { getDatabase, saveDatabase, cosineSimilarity } from '../../config/db';

const CATEGORY_DEPARTMENT_MAP: Record<ProblemCategory, string[]> = {
  'Water & Sanitation': ['Civil & Environmental Engineering', 'Chemical Engineering', 'Biotechnology'],
  'Healthcare & Nutrition': ['Biomedical Engineering', 'Public Health & Nutrition Sciences', 'Community Medicine'],
  'Education & Skill Development': ['Educational Technology', 'Computer Science & ICT', 'Social Sciences & Pedagogy'],
  'Roads & Infrastructure': ['Civil Engineering & Transportation', 'Structural Engineering', 'Geotechnical Engineering'],
  'Agriculture & Irrigation': ['Agricultural & Food Engineering', 'Water Resource Management', 'Agronomy & Biosystems'],
  'Waste & Environment': ['Environmental Science & Sustainable Engineering', 'Chemical Engineering', 'Bioprocess Engineering'],
  'Clean Energy': ['Electrical & Renewable Energy Engineering', 'Energy Studies', 'Power Systems & Electronics'],
  'Disaster & Safety': ['Disaster Management & Geomatics', 'Earthquake & Structural Dynamics', 'Civil Engineering']
};

export function matchUniversityDepartment(category: ProblemCategory): string {
  const depts = CATEGORY_DEPARTMENT_MAP[category];
  return depts && depts.length > 0 ? depts[0] : 'Interdisciplinary Innovation Cell';
}

export function deduplicateAndCluster(newProblem: Problem): {
  clusterId?: string;
  similarCount: number;
  routingRationale: string;
} {
  const db = getDatabase();
  const SIMILARITY_THRESHOLD = 0.76; // Vector cosine similarity cutoff

  const sameDistrictProblems = db.problems.filter(
    p => p.id !== newProblem.id && p.district.toLowerCase() === newProblem.district.toLowerCase()
  );

  let highestSim = 0;
  let matchedClusterId: string | undefined = undefined;
  let similarReports = 0;

  if (newProblem.embedding_vector) {
    for (const existing of sameDistrictProblems) {
      if (existing.embedding_vector) {
        const sim = cosineSimilarity(newProblem.embedding_vector, existing.embedding_vector);
        if (sim > highestSim) {
          highestSim = sim;
        }
        if (sim >= SIMILARITY_THRESHOLD) {
          similarReports++;
          if (existing.cluster_id) {
            matchedClusterId = existing.cluster_id;
          }
        }
      }
    }
  }

  // If matched or multiple reports in same ward with high similarity
  if (similarReports > 0) {
    if (!matchedClusterId) {
      // Create new cluster
      const newCluster: ProblemCluster = {
        id: 'cluster_' + Math.random().toString(36).substring(2, 9),
        category: newProblem.category,
        district: newProblem.district,
        ward: newProblem.ward,
        report_count: similarReports + 1,
        representative_problem_id: newProblem.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.clusters.push(newCluster);
      matchedClusterId = newCluster.id;
    } else {
      const existingCluster = db.clusters.find(c => c.id === matchedClusterId);
      if (existingCluster) {
        existingCluster.report_count += 1;
        existingCluster.updated_at = new Date().toISOString();
      }
    }
  }

  const rationale = generateExplainabilityRationale(newProblem, similarReports, highestSim);

  saveDatabase();

  return {
    clusterId: matchedClusterId,
    similarCount: similarReports,
    routingRationale: rationale
  };
}

export function generateExplainabilityRationale(
  problem: Problem,
  similarReports: number,
  highestSim: number
): string {
  const categoryTerms: Record<ProblemCategory, string> = {
    'Water & Sanitation': 'water quality, contamination indicators, and hydraulic infrastructure keywords',
    'Healthcare & Nutrition': 'community clinical symptoms, primary healthcare access indicators, and nutrition data',
    'Education & Skill Development': 'school infrastructure, learning resource deficits, and digital literacy gaps',
    'Roads & Infrastructure': 'pavement failure conditions, road transport bottleneck, and culvert structural data',
    'Agriculture & Irrigation': 'crop stress indices, irrigation pipeline constraints, and farm livelihood factors',
    'Waste & Environment': 'solid waste density, municipal dump spillage, and environmental contamination risks',
    'Clean Energy': 'grid outage frequency, rural transformer load stress, and renewable energy feasibility',
    'Disaster & Safety': 'monsoon inundation hazard, soil erosion risk, and vulnerability zoning'
  };

  const domainReason = categoryTerms[problem.category] || 'societal challenge semantic indicators';

  if (similarReports > 0) {
    return `${domainReason} matched with ${(problem.ai_confidence * 100).toFixed(0)}% confidence; detected ${similarReports} related reports in ${problem.district} (Ward ${problem.ward}) creating high report-cluster density.`;
  } else {
    return `${domainReason} matched; high localized impact detected across ${problem.district} requiring immediate institutional domain intervention.`;
  }
}
