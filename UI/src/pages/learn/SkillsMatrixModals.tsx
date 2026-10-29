import React from 'react';
import { X } from 'lucide-react';
import { SkillsMatrixResponse, SkillLevel } from '../../services/types';
import styles from './SkillsMatrixPage.module.css';

interface SkillsMatrixModalsProps {
  isAddSkillOpen: boolean;
  setIsAddSkillOpen: (open: boolean) => void;
  skillName: string;
  setSkillName: (v: string) => void;
  skillCategory: string;
  setSkillCategory: (v: string) => void;
  skillDesc: string;
  setSkillDesc: (v: string) => void;
  handleSaveSkill: (e: React.FormEvent) => Promise<void>;

  isRateModalOpen: boolean;
  setIsRateModalOpen: (open: boolean) => void;
  selectedEmpCode: string;
  setSelectedEmpCode: (v: string) => void;
  selectedSkillId: string;
  setSelectedSkillId: (v: string) => void;
  ratingLevel: SkillLevel;
  setRatingLevel: (v: SkillLevel) => void;
  isVerified: boolean;
  setIsVerified: (v: boolean) => void;
  handleSaveRating: (e: React.FormEvent) => Promise<void>;

  data: SkillsMatrixResponse | null;
  isSubmitting: boolean;
}

export const SkillsMatrixModals: React.FC<SkillsMatrixModalsProps> = ({
  isAddSkillOpen,
  setIsAddSkillOpen,
  skillName,
  setSkillName,
  skillCategory,
  setSkillCategory,
  skillDesc,
  setSkillDesc,
  handleSaveSkill,

  isRateModalOpen,
  setIsRateModalOpen,
  selectedEmpCode,
  setSelectedEmpCode,
  selectedSkillId,
  setSelectedSkillId,
  ratingLevel,
  setRatingLevel,
  isVerified,
  setIsVerified,
  handleSaveRating,

  data,
  isSubmitting,
}) => {
  React.useEffect(() => {
    if (isRateModalOpen && data) {
      if (!selectedEmpCode && data.employees.length > 0) {
        setSelectedEmpCode(data.employees[0].employee_code);
      }
      if (!selectedSkillId && data.skills.length > 0) {
        setSelectedSkillId(data.skills[0].id);
      }
    }
  }, [isRateModalOpen, data, selectedEmpCode, selectedSkillId, setSelectedEmpCode, setSelectedSkillId]);

  return (
    <>
      {/* Add Skill Modal */}
      {isAddSkillOpen && (
        <div className={styles.modalOverlay} onClick={() => !isSubmitting && setIsAddSkillOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>Add Skill Competency</h2>
              <button
                className={styles.closeBtn}
                disabled={isSubmitting}
                onClick={() => setIsAddSkillOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveSkill}>
              <div className={styles.modalBody}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Skill Name *</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Distributed Systems"
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Competency Domain *</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Engineering, Compliance, Leadership"
                    value={skillCategory}
                    onChange={(e) => setSkillCategory(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Proficiency expectations and learning outcomes..."
                    value={skillDesc}
                    onChange={(e) => setSkillDesc(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  disabled={isSubmitting}
                  onClick={() => setIsAddSkillOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rate Skill Modal */}
      {isRateModalOpen && (
        <div className={styles.modalOverlay} onClick={() => !isSubmitting && setIsRateModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>Rate Employee Proficiency</h2>
              <button
                className={styles.closeBtn}
                disabled={isSubmitting}
                onClick={() => setIsRateModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveRating}>
              <div className={styles.modalBody}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Employee *</label>
                  <select
                    className={styles.selectField}
                    value={selectedEmpCode}
                    onChange={(e) => setSelectedEmpCode(e.target.value)}
                    required
                  >
                    {data?.employees.map((emp) => (
                      <option key={emp.employee_code} value={emp.employee_code}>
                        {emp.full_name} ({emp.employee_code} - {emp.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Skill Competency *</label>
                  <select
                    className={styles.selectField}
                    value={selectedSkillId}
                    onChange={(e) => setSelectedSkillId(e.target.value)}
                    required
                  >
                    {data?.skills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Proficiency Level *</label>
                  <select
                    className={styles.selectField}
                    value={ratingLevel}
                    onChange={(e) => setRatingLevel(e.target.value as SkillLevel)}
                    required
                  >
                    <option value="Beginner">Beginner (Foundational knowledge)</option>
                    <option value="Intermediate">Intermediate (Practical capability)</option>
                    <option value="Advanced">Advanced (Autonomous / complex projects)</option>
                    <option value="Expert">Expert (Subject matter authority / mentor)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <input
                    type="checkbox"
                    id="verifiedCheck"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                  />
                  <label htmlFor="verifiedCheck" style={{ fontSize: 13.5, cursor: 'pointer' }}>
                    Mark as Manager/Admin Verified Rating
                  </label>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  disabled={isSubmitting}
                  onClick={() => setIsRateModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
