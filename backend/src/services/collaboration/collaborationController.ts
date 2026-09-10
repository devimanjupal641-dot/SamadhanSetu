import { Response } from 'express';
import { getDatabase, saveDatabase } from '../../config/db';
import { UniversityAdoption, IndustrySupport, MoUAgreement, StatusLog, Problem } from '../../models/types';
import { AuthenticatedRequest } from '../../middleware/auth';
import { dispatchNotification } from '../notification/notificationService';

// 1. University Adopts a Challenge
export function adoptProblem(req: AuthenticatedRequest, res: Response) {
  try {
    const { problemId, department } = req.body;
    const user = req.user!;

    const db = getDatabase();
    const problem = db.problems.find(p => p.id === problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    const existingAdoption = db.adoptions.find(a => a.problem_id === problemId);
    if (existingAdoption) {
      return res.status(400).json({ error: 'Problem has already been adopted by another institution.' });
    }

    const adoption: UniversityAdoption = {
      id: 'adopt_' + Math.random().toString(36).substring(2, 9),
      problem_id: problemId,
      university_user_id: user.id,
      university_name: user.organization_name || user.name,
      department: department || user.department || 'Innovation Lab',
      status: 'Adopted',
      adopted_at: new Date().toISOString()
    };

    db.adoptions.push(adoption);
    problem.status = 'Adopted';
    problem.updated_at = new Date().toISOString();

    db.status_logs.push({
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      problem_id: problemId,
      old_status: 'Classified',
      new_status: 'Adopted',
      changed_by_user_id: user.id,
      changed_by_name: user.name,
      role: 'university',
      notes: `Adopted by ${adoption.university_name} (${adoption.department}) for research and solution prototyping.`,
      created_at: new Date().toISOString()
    });

    dispatchNotification({
      userId: problem.citizen_id,
      title: 'Challenge Adopted by University',
      message: `Great news! ${adoption.university_name} has officially adopted your challenge "${problem.title}" to engineer a working solution.`,
      channels: ['in-app', 'sms', 'whatsapp']
    });

    saveDatabase();
    return res.json({ success: true, adoption, problem });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to adopt challenge.' });
  }
}

// 2. University Submits Solution Proposal
export function submitProposal(req: AuthenticatedRequest, res: Response) {
  try {
    const { problemId, proposalTitle, proposalText, estimatedTimeline, budgetEstimate } = req.body;
    const user = req.user!;

    const db = getDatabase();
    const adoption = db.adoptions.find(a => a.problem_id === problemId);
    if (!adoption) {
      return res.status(400).json({ error: 'Challenge must be adopted first.' });
    }

    adoption.proposal_title = proposalTitle;
    adoption.proposal_text = proposalText;
    adoption.estimated_timeline = estimatedTimeline || '4-6 Months Pilot';
    adoption.budget_estimate = budgetEstimate ? Number(budgetEstimate) : 350000;
    adoption.status = 'Proposal Submitted';
    adoption.proposal_submitted_at = new Date().toISOString();

    const problem = db.problems.find(p => p.id === problemId);
    if (problem) {
      problem.status = 'Solution Proposed';
      problem.updated_at = new Date().toISOString();
    }

    db.status_logs.push({
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      problem_id: problemId,
      old_status: 'Adopted',
      new_status: 'Solution Proposed',
      changed_by_user_id: user.id,
      changed_by_name: user.name,
      role: 'university',
      notes: `Solution proposal "${proposalTitle}" submitted with budget of ₹${(adoption.budget_estimate || 0).toLocaleString('en-IN')}.`,
      created_at: new Date().toISOString()
    });

    // Notify citizen & broadcast to industry network
    if (problem) {
      dispatchNotification({
        userId: problem.citizen_id,
        title: 'Solution Proposal Uploaded',
        message: `${adoption.university_name} uploaded a comprehensive solution proposal for "${problem.title}". Now seeking Industry CSR & implementation funding.`,
        channels: ['in-app', 'sms']
      });
    }

    saveDatabase();
    return res.json({ success: true, adoption });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit proposal.' });
  }
}

// 3. Industry Expresses Interest / Commits / Funds
export function updateIndustrySupport(req: AuthenticatedRequest, res: Response) {
  try {
    const { problemId, supportType, commitmentStage, amountInr, notes } = req.body;
    const user = req.user!;

    const db = getDatabase();
    const problem = db.problems.find(p => p.id === problemId);
    const adoption = db.adoptions.find(a => a.problem_id === problemId);

    if (!problem || !adoption) {
      return res.status(404).json({ error: 'Problem or Adoption record not found.' });
    }

    let support = db.industry_supports.find(
      s => s.problem_id === problemId && s.industry_user_id === user.id
    );

    const isNew = !support;
    if (!support) {
      support = {
        id: 'ind_sup_' + Math.random().toString(36).substring(2, 9),
        adoption_id: adoption.id,
        problem_id: problemId,
        industry_user_id: user.id,
        industry_name: user.organization_name || user.name,
        support_type: supportType || 'funding',
        commitment_stage: commitmentStage || 'Interested',
        amount_inr: amountInr ? Number(amountInr) : 500000,
        notes: notes || 'Strategic CSR alignment with municipal impact goals.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.industry_supports.push(support);
    } else {
      support.commitment_stage = commitmentStage;
      if (amountInr) support.amount_inr = Number(amountInr);
      if (supportType) support.support_type = supportType;
      support.updated_at = new Date().toISOString();
    }

    // Auto-create MoU agreement template if not already present
    let mou = db.mou_agreements.find(m => m.problem_id === problemId);
    if (!mou) {
      mou = {
        id: 'mou_' + Math.random().toString(36).substring(2, 9),
        adoption_id: adoption.id,
        problem_id: problemId,
        industry_id: user.id,
        industry_name: user.organization_name || user.name,
        university_id: adoption.university_user_id,
        university_name: adoption.university_name,
        template_type: 'Standard Joint IP',
        template_title: 'Collaborative Civic Innovation & IP Co-Ownership Agreement (SIH-Standard)',
        terms_summary: '50-50 Joint patent rights on municipal implementation. University retains academic publishing rights. Industry gets non-exclusive commercial deployment rights. Citizen benefit clauses are immutable.',
        university_acknowledged: false,
        industry_acknowledged: commitmentStage === 'Funded',
        industry_acknowledged_at: commitmentStage === 'Funded' ? new Date().toISOString() : undefined,
        status: commitmentStage === 'Funded' ? 'Partially Acknowledged' : 'Draft',
        created_at: new Date().toISOString()
      };
      db.mou_agreements.push(mou);
    } else if (commitmentStage === 'Funded') {
      mou.industry_acknowledged = true;
      mou.industry_acknowledged_at = new Date().toISOString();
      if (mou.university_acknowledged) {
        mou.status = 'Active & Executed';
      } else {
        mou.status = 'Partially Acknowledged';
      }
    }

    // Update Problem Status
    const oldStatus = problem.status;
    if (commitmentStage === 'Funded') {
      problem.status = 'Industry Supported';
    }
    problem.updated_at = new Date().toISOString();

    db.status_logs.push({
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      problem_id: problemId,
      old_status: oldStatus,
      new_status: problem.status,
      changed_by_user_id: user.id,
      changed_by_name: user.organization_name || user.name,
      role: 'industry',
      notes: `Industry commitment elevated to "${commitmentStage}" with ₹${(support.amount_inr || 0).toLocaleString('en-IN')} CSR funding allocated.`,
      created_at: new Date().toISOString()
    });

    dispatchNotification({
      userId: problem.citizen_id,
      title: 'Industry Funding Secured!',
      message: `${support.industry_name} has committed support (${commitmentStage}) with ₹${(support.amount_inr || 0).toLocaleString('en-IN')} allocated to solve "${problem.title}".`,
      channels: ['in-app', 'sms', 'whatsapp']
    });

    saveDatabase();
    return res.json({ success: true, support, mou, problem });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update industry support.' });
  }
}

// 4. MoU / IP Framework Acknowledgment
export function acknowledgeMoU(req: AuthenticatedRequest, res: Response) {
  try {
    const { mouId } = req.body;
    const user = req.user!;

    const db = getDatabase();
    const mou = db.mou_agreements.find(m => m.id === mouId);
    if (!mou) {
      return res.status(404).json({ error: 'MoU agreement not found.' });
    }

    if (user.role === 'university') {
      mou.university_acknowledged = true;
      mou.university_acknowledged_at = new Date().toISOString();
    } else if (user.role === 'industry') {
      mou.industry_acknowledged = true;
      mou.industry_acknowledged_at = new Date().toISOString();
    }

    if (mou.university_acknowledged && mou.industry_acknowledged) {
      mou.status = 'Active & Executed';
      const problem = db.problems.find(p => p.id === mou.problem_id);
      if (problem) {
        problem.status = 'Piloted';
        db.status_logs.push({
          id: 'log_' + Math.random().toString(36).substring(2, 9),
          problem_id: problem.id,
          old_status: 'Industry Supported',
          new_status: 'Piloted',
          changed_by_user_id: user.id,
          changed_by_name: user.name,
          role: user.role,
          notes: 'MoU mutually signed and executed. Pilot deployment authorized.',
          created_at: new Date().toISOString()
        });
      }
    } else {
      mou.status = 'Partially Acknowledged';
    }

    saveDatabase();
    return res.json({ success: true, mou });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to acknowledge MoU.' });
  }
}
