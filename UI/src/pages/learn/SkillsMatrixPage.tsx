import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Award, CheckCircle2 } from 'lucide-react';
import {
  SkillsMatrixResponse,
  SkillLevel,
} from '../../services/types';
import {
  getSkillsMatrix,
  createSkill,
  rateSkill,
} from '../../services/api';
import { Toast } from '../../components/kit/Toast';
import { SkillsMatrixModals } from './SkillsMatrixModals';
import styles from './SkillsMatrixPage.module.css';

export const SkillsMatrixPage: React.FC = () => {
  const [data, setData] = useState<SkillsMatrixResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Add Skill Modal
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('Core Competency');
  const [skillDesc, setSkillDesc] = useState('');

  // Rate Skill Modal
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [selectedEmpCode, setSelectedEmpCode] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [ratingLevel, setRatingLevel] = useState<SkillLevel>('Intermediate');
  const [isVerified, setIsVerified] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; text: string }>>([]);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToasts(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, type, text }]);
  };

  const loadMatrix = async () => {
    try {
      setIsLoading(true);
      const res = await getSkillsMatrix();
      setData(res);
    } catch {
      showToast('error', 'Failed to load skills matrix.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatrix();
  }, []);

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim() || !skillCategory.trim()) return;

    try {
      setIsSubmitting(true);
      const created = await createSkill({
        name: skillName.trim(),
        category: skillCategory.trim(),
        description: skillDesc.trim() || undefined,
      });

      setData(prev => {
        if (!prev) return prev;
        const skills = prev.skills.some(s => s.id === created.id || s.name.toLowerCase() === created.name.toLowerCase())
          ? prev.skills
          : [...prev.skills, created];
        const categories = prev.categories.includes(created.category)
          ? prev.categories
          : [...prev.categories, created.category];
        return { ...prev, skills, categories };
      });

      showToast('success', `Created skill: ${skillName}`);
      setIsAddSkillOpen(false);
      setSkillName('');
      setSkillDesc('');
      await loadMatrix();
    } catch {
      showToast('error', 'Failed to create skill competency.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpCode || !selectedSkillId) return;

    const skillObj = data?.skills.find(s => s.id === selectedSkillId || s.name === selectedSkillId);
    const skillName = skillObj?.name;

    try {
      setIsSubmitting(true);
      await rateSkill(
        {
          employee_id: selectedEmpCode,
          skill_id: selectedSkillId,
          level: ratingLevel,
          verified: isVerified,
        },
        skillName
      );

      setData(prev => {
        if (!prev) return prev;
        const newRating = {
          level: ratingLevel,
          verified: isVerified,
          updated_at: new Date().toISOString(),
        };
        const employees = prev.employees.map(emp => {
          if (emp.employee_code === selectedEmpCode) {
            const empSkills = { ...emp.skills, [selectedSkillId]: newRating };
            if (skillName) empSkills[skillName] = newRating;
            return { ...emp, skills: empSkills };
          }
          return emp;
        });
        return { ...prev, employees };
      });

      showToast('success', 'Skill rating updated successfully.');
      setIsRateModalOpen(false);
      await loadMatrix();
    } catch {
      showToast('error', 'Failed to save skill rating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRate = (empCode: string, skillId: string, currentLevel?: SkillLevel) => {
    setSelectedEmpCode(empCode || data?.employees[0]?.employee_code || '');
    setSelectedSkillId(skillId || data?.skills[0]?.id || '');
    setRatingLevel(currentLevel || 'Intermediate');
    setIsVerified(true);
    setIsRateModalOpen(true);
  };

  const departments = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.employees.map((e) => e.department))).sort();
  }, [data]);

  const filteredSkills = useMemo(() => {
    if (!data) return [];
    if (selectedCategory === 'All') return data.skills;
    return data.skills.filter((s) => s.category === selectedCategory);
  }, [data, selectedCategory]);

  const filteredEmployees = useMemo(() => {
    if (!data) return [];
    return data.employees.filter((emp) => {
      const matchesSearch =
        emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [data, searchQuery, selectedDept]);

  const getBadgeClass = (level: string) => {
    switch (level) {
      case 'Expert':
        return styles.badgeExpert;
      case 'Advanced':
        return styles.badgeAdvanced;
      case 'Intermediate':
        return styles.badgeIntermediate;
      default:
        return styles.badgeBeginner;
    }
  };

  if (isLoading && !data) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading Skills Matrix...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            <Award size={14} className={styles.eyebrowIcon} />
            Workforce Competencies
          </span>
          <h1 className={styles.title}>Organizational Skills Matrix</h1>
          <p className={styles.subtitle}>
            Audit capability distribution, verify technical proficiency, and identify talent gaps.
          </p>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.primaryBtn}
            onClick={() => {
              const defaultEmp = data?.employees[0]?.employee_code || '';
              const defaultSkill = data?.skills[0]?.id || '';
              handleOpenRate(defaultEmp, defaultSkill);
            }}
          >
            Rate Proficiency
          </button>
          <button className={styles.secondaryBtn} onClick={() => setIsAddSkillOpen(true)}>
            <Plus size={16} />
            Add Skill
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search employee, ID, or job role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Department:</span>
            <select
              className={styles.select}
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Domain:</span>
            <select
              className={styles.select}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Domains</option>
              {data?.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className={styles.matrixCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.stickyCol}>Employee</th>
                <th className={styles.stickyCol2}>Department & Role</th>
                {filteredSkills.map((s) => (
                  <th key={s.id} className={styles.skillHeader} title={s.description || s.name}>
                    <div className={styles.skillHeaderInner}>
                      <span className={styles.skillCategoryTag}>{s.category}</span>
                      <span className={styles.skillTitle}>{s.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={filteredSkills.length + 2} className={styles.empty}>
                    No employees matching current filter.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.employee_code}>
                    <td className={styles.stickyCell}>
                      <div className={styles.empInfo}>
                        <div className={styles.empAvatar}>
                          {emp.full_name
                            .split(' ')
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          <div className={styles.empName}>{emp.full_name}</div>
                          <div className={styles.empCode}>{emp.employee_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.stickyCell2}>
                      <div className={styles.empDept}>{emp.department}</div>
                      <div className={styles.empRole}>{emp.role}</div>
                    </td>

                    {filteredSkills.map((s) => {
                      const rating = emp.skills[s.id] || (s.name ? emp.skills[s.name] : undefined);
                      return (
                        <td key={s.id} className={styles.cell}>
                          {rating ? (
                            <span
                              className={`${styles.levelBadge} ${getBadgeClass(rating.level)}`}
                              title={`Verified by ${rating.verified_by || 'HR'} on ${new Date(rating.updated_at).toLocaleDateString()}`}
                              onClick={() => handleOpenRate(emp.employee_code, s.id, rating.level as SkillLevel)}
                            >
                              {rating.verified && <CheckCircle2 size={11} />}
                              {rating.level}
                            </span>
                          ) : (
                            <span
                              className={styles.levelNone}
                              title="Click to rate"
                              onClick={() => handleOpenRate(emp.employee_code, s.id)}
                            >
                              + Add
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SkillsMatrixModals
        isAddSkillOpen={isAddSkillOpen}
        setIsAddSkillOpen={setIsAddSkillOpen}
        skillName={skillName}
        setSkillName={setSkillName}
        skillCategory={skillCategory}
        setSkillCategory={setSkillCategory}
        skillDesc={skillDesc}
        setSkillDesc={setSkillDesc}
        handleSaveSkill={handleSaveSkill}

        isRateModalOpen={isRateModalOpen}
        setIsRateModalOpen={setIsRateModalOpen}
        selectedEmpCode={selectedEmpCode}
        setSelectedEmpCode={setSelectedEmpCode}
        selectedSkillId={selectedSkillId}
        setSelectedSkillId={setSelectedSkillId}
        ratingLevel={ratingLevel}
        setRatingLevel={setRatingLevel}
        isVerified={isVerified}
        setIsVerified={setIsVerified}
        handleSaveRating={handleSaveRating}

        data={data}
        isSubmitting={isSubmitting}
      />

      <Toast toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
};

export default SkillsMatrixPage;
