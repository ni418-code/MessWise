import React, { useState, useMemo } from 'react';
import { FeedbackRating, AdministrativeAction, MealType, FeedbackCategory, ActionStatus } from '../types';
import {
  computeOverallSummary,
  computeMealBreakdown,
  computeDailyTrends,
  detectIssuePatterns,
  exportFeedbackToCSV,
} from '../utils/analytics';
import {
  Download,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Search,
  Filter,
  Utensils,
  ShieldAlert,
  Calendar,
  FileSpreadsheet,
  PlusCircle,
  Clock,
  AlertCircle,
  Check,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

interface AuthorityDashboardProps {
  feedbacks: FeedbackRating[];
  actions: AdministrativeAction[];
  onUpdateFeedbackStatus: (id: string, status: FeedbackRating['status'], note?: string) => void;
  onAddAction: (action: Omit<AdministrativeAction, 'id'>) => void;
  onUpdateActionStatus: (id: string, status: ActionStatus, outcome?: string) => void;
}

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  feedbacks,
  actions,
  onUpdateFeedbackStatus,
  onAddAction,
  onUpdateActionStatus,
}) => {
  // Navigation inside authority view: Analytics & Actions vs Records
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'actions' | 'records'>('analytics');

  // Filters & State
  const [selectedMealFilter, setSelectedMealFilter] = useState<'all' | MealType>('all');
  const [selectedScoreTier, setSelectedScoreTier] = useState<'all' | 'critical' | 'low' | 'high'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionStatusFilter, setActionStatusFilter] = useState<'all' | ActionStatus>('all');

  // Modal inspection
  const [selectedItemForInspect, setSelectedItemForInspect] = useState<FeedbackRating | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionCategory, setNewActionCategory] = useState<FeedbackCategory | 'general'>('taste');
  const [newActionMeal, setNewActionMeal] = useState<MealType | 'all'>('lunch');
  const [newActionDesc, setNewActionDesc] = useState('');
  const [newActionRole, setNewActionRole] = useState('Mess Warden (Dr. A. Verma)');
  const [newActionInitialStatus, setNewActionInitialStatus] = useState<ActionStatus>('in_progress');

  // Authority note input in inspect drawer
  const [inspectNote, setInspectNote] = useState('');

  // Analytics computations
  const summary = useMemo(() => computeOverallSummary(feedbacks), [feedbacks]);
  const mealBreakdown = useMemo(() => computeMealBreakdown(feedbacks), [feedbacks]);
  const dailyTrends = useMemo(() => computeDailyTrends(feedbacks), [feedbacks]);
  const issuePatterns = useMemo(() => detectIssuePatterns(feedbacks), [feedbacks]);

  // Actions count
  const notResolvedActions = useMemo(
    () => actions.filter((a) => a.status === 'not_resolved'),
    [actions]
  );
  const inProgressActions = useMemo(
    () => actions.filter((a) => a.status === 'in_progress'),
    [actions]
  );
  const completedActions = useMemo(
    () => actions.filter((a) => a.status === 'completed'),
    [actions]
  );

  // Filtered feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks
      .filter((item) => {
        if (selectedMealFilter !== 'all' && item.meal !== selectedMealFilter) return false;
        if (selectedScoreTier === 'critical' && item.overallScore > 2.5) return false;
        if (selectedScoreTier === 'low' && item.overallScore > 3.0) return false;
        if (selectedScoreTier === 'high' && item.overallScore < 4.0) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = item.id.toLowerCase().includes(q);
          const matchStudent = item.studentId.toLowerCase().includes(q);
          const matchHostel = item.hostelBlock.toLowerCase().includes(q);
          const matchComment = item.comment.toLowerCase().includes(q);
          const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchId && !matchStudent && !matchHostel && !matchComment && !matchTags) return false;
        }
        return true;
      })
      .sort((a, b) => (a.date + a.createdAt < b.date + b.createdAt ? 1 : -1));
  }, [feedbacks, selectedMealFilter, selectedScoreTier, searchQuery]);

  const handleExportCSV = () => {
    exportFeedbackToCSV(filteredFeedbacks);
  };

  const handleOpenActionModalForPattern = (pattern: (typeof issuePatterns)[0]) => {
    setNewActionMeal(pattern.meal);
    setNewActionCategory(pattern.category);
    setNewActionTitle(pattern.headline);
    setNewActionDesc(pattern.suggestedAction);
    setNewActionInitialStatus('in_progress');
    setActionModalOpen(true);
  };

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim() || !newActionDesc.trim()) return;

    onAddAction({
      date: new Date().toISOString().split('T')[0],
      meal: newActionMeal,
      category: newActionCategory,
      title: newActionTitle.trim(),
      description: newActionDesc.trim(),
      authorityRole: newActionRole,
      status: newActionInitialStatus,
    });

    setActionModalOpen(false);
    setNewActionTitle('');
    setNewActionDesc('');
  };

  const handleSaveInspectNote = () => {
    if (!selectedItemForInspect) return;
    onUpdateFeedbackStatus(
      selectedItemForInspect.id,
      selectedItemForInspect.status === 'submitted' ? 'action_taken' : selectedItemForInspect.status,
      inspectNote
    );
    setSelectedItemForInspect({
      ...selectedItemForInspect,
      authorityNote: inspectNote,
      status: selectedItemForInspect.status === 'submitted' ? 'action_taken' : selectedItemForInspect.status,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Operational Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#ded5cb] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#7a6350] mb-1">
              <span className="font-semibold text-[#516b45]">Hostel Central Mess Authority</span>
              <span>/</span>
              <span>Quality Analytics & Integrated Action Tracker</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2d241d]">
              Mess Authority Analytics & Unified Actions Hub
            </h1>
            <p className="text-xs text-[#7a6350] mt-1 max-w-2xl">
              Monitor food quality trends across Breakfast, Lunch, Snacks, and Dinner. Track actions
              that are Completed, In Progress, and Not Resolved in one place.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                setNewActionTitle('');
                setNewActionDesc('');
                setActionModalOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-bold text-[#42352b] bg-[#f4f6f3] border border-[#ccd8ca] rounded-xl hover:bg-[#e5ece3] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#516b45]" />
              <span>Log Action</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 text-xs font-bold text-white bg-[#42352b] hover:bg-[#2d241d] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV ({filteredFeedbacks.length})</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-6 mt-6 border-t border-[#eee9e3]">
          <div className="p-4 rounded-xl bg-[#f4f6f3] border border-[#ccd8ca]">
            <span className="text-xs text-[#7a6350] block mb-1">Total Submissions</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#2d241d] tabular-nums">
                {summary.totalSubmissions}
              </span>
              <span className="text-xs text-[#516b45] font-semibold">4 Meals Tracked</span>
            </div>
            <span className="text-[11px] text-[#7a6350] mt-1 block">Past 7 active mess days</span>
          </div>

          <div className="p-4 rounded-xl bg-[#f4f6f3] border border-[#ccd8ca]">
            <span className="text-xs text-[#7a6350] block mb-1">Overall Satisfaction</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#2d241d] tabular-nums">
                {summary.averageRating.toFixed(2)}
              </span>
              <span className="text-xs text-[#7a6350] font-normal">/ 5.0</span>
              <span className="text-xs text-[#516b45] ml-auto font-bold">
                {summary.satisfactionPercentage}% Positive
              </span>
            </div>
            <div className="w-full bg-[#ded5cb] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#516b45] h-full rounded-full transition-all"
                style={{ width: `${(summary.averageRating / 5) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#f4f6f3] border border-[#ccd8ca]">
            <span className="text-xs text-[#7a6350] block mb-1">Lowest Rated Meal</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold capitalize text-rose-800">
                {summary.lowestRatedMeal}
              </span>
              <span className="text-xs text-[#7a6350]">needs priority</span>
            </div>
            <p className="text-[11px] text-[#7a6350] mt-1">
              Top rated: <span className="capitalize font-semibold text-[#516b45]">{summary.highestRatedMeal}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#f4f6f3] border border-[#ccd8ca]">
            <span className="text-xs text-[#7a6350] block mb-1">Active Actions Status</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-[#b45309] tabular-nums">
                {inProgressActions.length} In Progress
              </span>
            </div>
            <p className="text-[11px] text-[#7a6350] mt-1">
              {completedActions.length} Completed · {notResolvedActions.length} Not Resolved
            </p>
          </div>
        </div>
      </div>

      {/* Sub-tab navigation for quick access within Authority View */}
      <div className="flex items-center gap-2 border-b border-[#ded5cb] pb-2">
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'analytics'
              ? 'bg-[#516b45] text-white shadow-xs'
              : 'bg-white text-[#7a6350] border border-[#ded5cb] hover:bg-[#f4f6f3]'
          }`}
        >
          Food Quality Analytics & Patterns
        </button>

        <button
          onClick={() => setActiveSubTab('actions')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'actions'
              ? 'bg-[#42352b] text-white shadow-xs'
              : 'bg-white text-[#7a6350] border border-[#ded5cb] hover:bg-[#f4f6f3]'
          }`}
        >
          <span>Unified Actions Tracker</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#f59e0b] text-[#2d241d] font-bold">
            {actions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('records')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'records'
              ? 'bg-[#42352b] text-white shadow-xs'
              : 'bg-white text-[#7a6350] border border-[#ded5cb] hover:bg-[#f4f6f3]'
          }`}
        >
          <span>Feedback Audit Records</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#eee9e3] text-[#42352b] font-bold">
            {filteredFeedbacks.length}
          </span>
        </button>
      </div>

      {/* SECTION 1: FOOD QUALITY ANALYTICS & PATTERNS */}
      {(activeSubTab === 'analytics' || activeSubTab === 'records') && (
        <>
          {/* Automated Issue Detection & Action Guidance */}
          {issuePatterns.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-[#ded5cb] shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#eee9e3]">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#d97706]" />
                  <h3 className="text-base font-bold text-[#2d241d] tracking-tight">
                    Automated Problem Signals & Recommended Interventions
                  </h3>
                </div>
                <span className="text-xs text-[#7a6350]">
                  {issuePatterns.length} operational patterns flagged
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-4">
                {issuePatterns.map((pat) => (
                  <div
                    key={pat.id}
                    className="p-4 rounded-xl bg-[#f4f6f3] border border-[#ccd8ca] flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#415538]">
                          {pat.meal === 'snacks' ? 'Evening Snacks' : pat.meal} · {pat.category}
                        </span>
                        <span className="text-[11px] text-[#b45309] font-bold bg-[#fef3c7] border border-[#fbbf24]/50 px-2 py-0.5 rounded">
                          {pat.frequencyText}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#2d241d] mt-1">{pat.headline}</h4>
                      <p className="text-xs text-[#5d4b3d] mt-1.5 leading-relaxed bg-white p-2.5 rounded-lg border border-[#ded5cb]">
                        <span className="font-bold text-[#2d241d]">Recommended Action: </span>
                        {pat.suggestedAction}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[#ccd8ca]/60">
                      <span className="text-[11px] text-[#7a6350]">
                        Based on {pat.relatedSubmissionCount} student submissions
                      </span>
                      <button
                        onClick={() => handleOpenActionModalForPattern(pat)}
                        className="text-xs font-bold text-[#516b45] hover:text-[#2c3827] underline underline-offset-2 cursor-pointer"
                      >
                        Convert into Corrective Action →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4-Meal Comparison Matrix & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: 4 Meal Comparison Matrix */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#ded5cb] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#eee9e3]">
                  <div>
                    <h3 className="text-base font-bold text-[#2d241d] tracking-tight">
                      Meal-Wise Quality Comparison (4 Daily Services)
                    </h3>
                    <p className="text-xs text-[#7a6350] mt-0.5">
                      Breakfast vs. Lunch vs. Evening Snacks vs. Dinner
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#7a6350]">
                    <Utensils className="w-3.5 h-3.5 text-[#516b45]" />
                    <span>All 4 Meals</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  {mealBreakdown.map((mb) => {
                    const isLowest = mb.meal === summary.lowestRatedMeal;
                    return (
                      <div
                        key={mb.meal}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isLowest
                            ? 'bg-[#fef3c7]/60 border-[#fbbf24]'
                            : 'bg-[#f4f6f3] border-[#ccd8ca]'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#2d241d] capitalize">
                              {mb.label}
                            </span>
                            <span className="text-xs text-[#7a6350]">
                              ({mb.totalSubmissions} feedbacks)
                            </span>
                            {isLowest && (
                              <span className="text-[10px] font-bold text-[#b45309] bg-[#fef3c7] border border-[#fbbf24] px-2 py-0.5 rounded">
                                Priority Focus
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#7a6350]">Average:</span>
                            <span className="text-base font-bold text-[#2d241d] tabular-nums">
                              {mb.overallAverage.toFixed(2)}
                            </span>
                            <span className="text-xs text-[#ab9582]">/ 5.0</span>
                            <span className="text-xs text-[#516b45] font-semibold ml-1">
                              ({mb.satisfactionRate}% Sat.)
                            </span>
                          </div>
                        </div>

                        {/* Category ratings */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="p-2 rounded-lg bg-white border border-[#ded5cb]">
                            <span className="text-[11px] text-[#7a6350] block">Taste</span>
                            <span className="font-bold text-[#2d241d] tabular-nums">
                              {mb.tasteAverage.toFixed(1)} / 5
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-white border border-[#ded5cb]">
                            <span className="text-[11px] text-[#7a6350] block">Quality</span>
                            <span className="font-bold text-[#2d241d] tabular-nums">
                              {mb.qualityAverage.toFixed(1)} / 5
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-white border border-[#ded5cb]">
                            <span className="text-[11px] text-[#7a6350] block">Hygiene</span>
                            <span className={`font-bold tabular-nums ${mb.hygieneAverage < 3.2 ? 'text-rose-700' : 'text-[#2d241d]'}`}>
                              {mb.hygieneAverage.toFixed(1)} / 5
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-white border border-[#ded5cb]">
                            <span className="text-[11px] text-[#7a6350] block">Quantity</span>
                            <span className="font-bold text-[#2d241d] tabular-nums">
                              {mb.quantityAverage.toFixed(1)} / 5
                            </span>
                          </div>
                        </div>

                        {mb.primaryConcern && (
                          <p className="text-[11px] text-[#b45309] font-medium mt-2">
                            ⚠️ Low score detected: {mb.primaryConcern}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#eee9e3] text-xs text-[#7a6350] flex items-center justify-between">
                <span>Minimum satisfactory score benchmark is 3.50 / 5.0</span>
                <button
                  onClick={() => {
                    setSelectedMealFilter('lunch');
                    setActiveSubTab('records');
                  }}
                  className="text-[#516b45] hover:text-[#2c3827] font-semibold underline underline-offset-2 cursor-pointer"
                >
                  View Lunch Records →
                </button>
              </div>
            </div>

            {/* Right: Category Distribution & 7-Day Trend */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#ded5cb] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#eee9e3]">
                  <div>
                    <h3 className="text-base font-bold text-[#2d241d] tracking-tight">
                      Category Performance
                    </h3>
                    <p className="text-xs text-[#7a6350] mt-0.5">Aggregated across all meals</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-[#516b45]" />
                </div>

                <div className="space-y-3.5 pt-4">
                  {[
                    { label: 'Taste & Spicing', score: summary.tasteAverage },
                    { label: 'Food Quality & Freshness', score: summary.qualityAverage },
                    { label: 'Hygiene & Cleanliness', score: summary.hygieneAverage },
                    { label: 'Portion Quantity', score: summary.quantityAverage },
                  ].map((cat) => (
                    <div key={cat.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[#42352b]">{cat.label}</span>
                        <span className="font-bold text-[#2d241d] tabular-nums">
                          {cat.score.toFixed(2)} / 5.0
                        </span>
                      </div>
                      <div className="w-full bg-[#eee9e3] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            cat.score < 3.0
                              ? 'bg-[#b45309]'
                              : cat.score < 3.8
                              ? 'bg-[#f59e0b]'
                              : 'bg-[#516b45]'
                          }`}
                          style={{ width: `${(cat.score / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Daily Trend Overview */}
                <div className="pt-6 mt-6 border-t border-[#eee9e3]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#2d241d]">7-Day Quality Score Trend</span>
                    <span className="text-[11px] text-[#7a6350]">Overall Daily Avg</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 items-end h-28 pt-2">
                    {dailyTrends.slice(-7).map((d) => {
                      const pct = Math.max(15, Math.min(100, (d.overall / 5) * 100));
                      const isLow = d.overall < 3.0;
                      return (
                        <div key={d.date} className="flex flex-col items-center gap-1.5 h-full justify-end">
                          <span className="text-[10px] font-mono text-[#42352b] tabular-nums font-bold">
                            {d.overall.toFixed(1)}
                          </span>
                          <div className="w-full bg-[#f4f6f3] rounded-t-sm h-16 flex items-end">
                            <div
                              className={`w-full rounded-t-sm transition-all ${
                                isLow ? 'bg-[#b45309]' : 'bg-[#516b45]'
                              }`}
                              style={{ height: `${pct}%` }}
                              title={`${d.displayDate}: ${d.overall} avg (${d.submissionCount} submissions)`}
                            />
                          </div>
                          <span className="text-[10px] text-[#7a6350] whitespace-nowrap">
                            {d.displayDate}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#eee9e3] text-[11px] text-[#7a6350]">
                Amber bars denote days with low average satisfaction (&lt;3.0).
              </div>
            </div>
          </div>
        </>
      )}

      {/* SECTION 2: UNIFIED ACTIONS SECTION (COMPLETED, IN PROGRESS, NOT RESOLVED ALL IN ONE) */}
      {(activeSubTab === 'actions' || activeSubTab === 'analytics') && (
        <div className="bg-white rounded-2xl p-6 border border-[#ded5cb] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#eee9e3]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#516b45]">
                  Action Management
                </span>
              </div>
              <h3 className="text-base font-bold text-[#2d241d] tracking-tight">
                Unified Authority Action Tracker: Completed, In Progress & Not Resolved
              </h3>
              <p className="text-xs text-[#7a6350] mt-0.5">
                Every action taken by wardens and committee members to resolve student food complaints is monitored here.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setNewActionTitle('');
                  setNewActionDesc('');
                  setActionModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#516b45] hover:bg-[#415538] rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Action</span>
              </button>
            </div>
          </div>

          {/* 3 Status Columns / Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Column 1: NOT RESOLVED / PENDING */}
            <div className="bg-[#fdfaf7] rounded-xl p-4 border border-[#ded5cb] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#eee9e3]">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#92400e]">
                  <AlertCircle className="w-4 h-4 text-[#d97706]" />
                  <span>Not Resolved / Planned</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e]">
                  {notResolvedActions.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {notResolvedActions.length === 0 ? (
                  <p className="text-xs text-[#7a6350] italic py-4 text-center">
                    No pending unresolved items.
                  </p>
                ) : (
                  notResolvedActions.map((act) => (
                    <div
                      key={act.id}
                      className="bg-white p-3 rounded-lg border border-[#ded5cb] hover:border-[#ab9582] transition-all shadow-2xs space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-[#7a6350] font-semibold">{act.id}</span>
                        <span className="font-bold uppercase text-[#92400e]">
                          {act.meal === 'snacks' ? 'Snacks' : act.meal}
                        </span>
                      </div>
                      <h4 className="font-bold text-[#2d241d] leading-snug">{act.title}</h4>
                      <p className="text-[#5d4b3d] text-[11px] line-clamp-2">{act.description}</p>
                      <div className="pt-2 border-t border-[#eee9e3] flex items-center justify-between">
                        <span className="text-[10px] text-[#7a6350]">{act.date}</span>
                        <button
                          onClick={() => onUpdateActionStatus(act.id, 'in_progress')}
                          className="text-[11px] font-bold text-[#516b45] hover:underline cursor-pointer"
                        >
                          Start Action →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 2: IN PROGRESS */}
            <div className="bg-[#fefaf0] rounded-xl p-4 border border-[#f59e0b]/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#fbbf24]/30">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#b45309]">
                  <Clock className="w-4 h-4 text-[#f59e0b]" />
                  <span>In Progress</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#b45309]">
                  {inProgressActions.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {inProgressActions.length === 0 ? (
                  <p className="text-xs text-[#7a6350] italic py-4 text-center">
                    No actions currently in progress.
                  </p>
                ) : (
                  inProgressActions.map((act) => (
                    <div
                      key={act.id}
                      className="bg-white p-3 rounded-lg border border-[#fcd34d] hover:border-[#f59e0b] transition-all shadow-2xs space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-[#7a6350] font-semibold">{act.id}</span>
                        <span className="font-bold uppercase text-[#b45309]">
                          {act.meal === 'snacks' ? 'Snacks' : act.meal}
                        </span>
                      </div>
                      <h4 className="font-bold text-[#2d241d] leading-snug">{act.title}</h4>
                      <p className="text-[#5d4b3d] text-[11px] line-clamp-2">{act.description}</p>
                      <div className="pt-2 border-t border-[#eee9e3] flex items-center justify-between">
                        <span className="text-[10px] text-[#7a6350]">{act.authorityRole}</span>
                        <button
                          onClick={() =>
                            onUpdateActionStatus(
                              act.id,
                              'completed',
                              'Verified resolved. Positive rating improvement recorded in latest meal feedbacks.'
                            )
                          }
                          className="text-[11px] font-bold text-[#516b45] hover:underline cursor-pointer"
                        >
                          Mark Completed ✓
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 3: COMPLETED */}
            <div className="bg-[#f4f6f3] rounded-xl p-4 border border-[#ccd8ca] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#ccd8ca]">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#36442f]">
                  <CheckCircle2 className="w-4 h-4 text-[#516b45]" />
                  <span>Completed & Resolved</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#e5ece3] text-[#36442f]">
                  {completedActions.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {completedActions.length === 0 ? (
                  <p className="text-xs text-[#7a6350] italic py-4 text-center">
                    No completed actions yet.
                  </p>
                ) : (
                  completedActions.map((act) => (
                    <div
                      key={act.id}
                      className="bg-white p-3 rounded-lg border border-[#ccd8ca] transition-all shadow-2xs space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-[#7a6350] font-semibold">{act.id}</span>
                        <span className="font-bold uppercase text-[#516b45]">
                          {act.meal === 'snacks' ? 'Snacks' : act.meal}
                        </span>
                      </div>
                      <h4 className="font-bold text-[#2d241d] leading-snug">{act.title}</h4>
                      {act.outcome && (
                        <p className="text-[#36442f] text-[11px] bg-[#f4f6f3] p-1.5 rounded border border-[#ccd8ca]/60">
                          <span className="font-semibold">Result: </span>
                          {act.outcome}
                        </p>
                      )}
                      <div className="pt-1.5 border-t border-[#eee9e3] flex items-center justify-between text-[10px] text-[#7a6350]">
                        <span>{act.date}</span>
                        <span className="text-[#516b45] font-semibold">Status: Resolved</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: AUDIT RECORDS & SEARCH */}
      {(activeSubTab === 'records' || activeSubTab === 'analytics') && (
        <div className="bg-white rounded-2xl p-6 border border-[#ded5cb] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eee9e3]">
            <div>
              <h3 className="text-base font-bold text-[#2d241d] tracking-tight">
                Feedback Audit Records & Student Details
              </h3>
              <p className="text-xs text-[#7a6350] mt-0.5">
                Review student feedback by meal (Breakfast, Lunch, Snacks, Dinner) and hostel block (LH-1 to LH-3, MH-1 to MH-4)
              </p>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Meal Filter */}
              <div className="flex items-center bg-[#f4f6f3] border border-[#ccd8ca] p-1 rounded-xl">
                {(['all', 'breakfast', 'lunch', 'snacks', 'dinner'] as const).map((meal) => (
                  <button
                    key={meal}
                    onClick={() => setSelectedMealFilter(meal)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                      selectedMealFilter === meal
                        ? 'bg-white text-[#2d241d] shadow-2xs font-bold'
                        : 'text-[#7a6350] hover:text-[#2d241d]'
                    }`}
                  >
                    {meal === 'snacks' ? 'Snacks' : meal}
                  </button>
                ))}
              </div>

              {/* Score Tier Filter */}
              <select
                value={selectedScoreTier}
                onChange={(e) => setSelectedScoreTier(e.target.value as any)}
                className="text-xs px-2.5 py-1.5 rounded-xl border border-[#ded5cb] bg-white text-[#2d241d] focus:outline-none"
              >
                <option value="all">All Ratings</option>
                <option value="critical">Critical (&le; 2.5)</option>
                <option value="low">Needs Work (&le; 3.0)</option>
                <option value="high">High (&ge; 4.0)</option>
              </select>
            </div>
          </div>

          {/* Search bar and counter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#ab9582] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student ID, hostel block (e.g. 'LH-1', 'MH-2'), or complaint..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#ccd8ca] focus:outline-none focus:ring-2 focus:ring-[#516b45] bg-[#fdfdfc]"
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-[#7a6350]">
              <span>
                Showing <span className="font-bold text-[#2d241d] tabular-nums">{filteredFeedbacks.length}</span> of{' '}
                <span className="tabular-nums">{feedbacks.length}</span> submissions
              </span>
              <button
                onClick={handleExportCSV}
                className="text-[#516b45] hover:text-[#2c3827] underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Download CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-[#ded5cb] rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f4f6f3] border-b border-[#ded5cb] text-[#42352b] font-bold">
                  <th className="py-2.5 px-3">Date / Meal</th>
                  <th className="py-2.5 px-3">Student & Block</th>
                  <th className="py-2.5 px-3 text-center">Taste</th>
                  <th className="py-2.5 px-3 text-center">Quality</th>
                  <th className="py-2.5 px-3 text-center">Hygiene</th>
                  <th className="py-2.5 px-3 text-center">Quantity</th>
                  <th className="py-2.5 px-3 text-center">Overall</th>
                  <th className="py-2.5 px-3">Comment & Tags</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eee9e3]">
                {filteredFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-[#ab9582]">
                      No feedback records match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredFeedbacks.map((fb) => {
                    const isCritical = fb.overallScore <= 2.5;
                    return (
                      <tr
                        key={fb.id}
                        className={`hover:bg-[#f4f6f3]/60 transition-colors ${
                          isCritical ? 'bg-rose-50/20' : ''
                        }`}
                      >
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-bold text-[#2d241d]">{fb.date}</div>
                          <span className="text-[10px] uppercase font-bold text-[#516b45]">
                            {fb.meal === 'snacks' ? 'Snacks' : fb.meal}
                          </span>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-mono font-bold text-[#2d241d]">{fb.studentId}</div>
                          <div className="text-[11px] text-[#7a6350] font-medium">
                            {fb.hostelBlock} {fb.roomNumber ? `· Rm ${fb.roomNumber}` : ''}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center tabular-nums font-semibold">
                          <span className={fb.taste <= 2 ? 'text-rose-700 font-bold' : 'text-[#2d241d]'}>
                            {fb.taste}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center tabular-nums font-semibold">
                          <span className={fb.quality <= 2 ? 'text-rose-700 font-bold' : 'text-[#2d241d]'}>
                            {fb.quality}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center tabular-nums font-semibold">
                          <span className={fb.hygiene <= 2 ? 'text-rose-700 font-bold' : 'text-[#2d241d]'}>
                            {fb.hygiene}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center tabular-nums font-semibold">
                          <span className={fb.quantity <= 2 ? 'text-rose-700 font-bold' : 'text-[#2d241d]'}>
                            {fb.quantity}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-bold tabular-nums px-2 py-0.5 rounded text-xs ${
                              isCritical
                                ? 'bg-rose-100 text-rose-800'
                                : fb.overallScore >= 4.0
                                ? 'bg-[#e5ece3] text-[#36442f]'
                                : 'bg-[#eee9e3] text-[#42352b]'
                            }`}
                          >
                            {fb.overallScore.toFixed(2)}
                          </span>
                        </td>

                        <td className="py-3 px-3 max-w-xs">
                          {fb.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {fb.tags.map((t) => (
                                <span
                                  key={t}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-[#eee9e3] text-[#42352b]"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-[11px] text-[#5d4b3d] truncate" title={fb.comment}>
                            {fb.comment || <span className="text-[#ab9582] italic">No comment</span>}
                          </p>
                        </td>

                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <select
                            value={fb.status}
                            onChange={(e) =>
                              onUpdateFeedbackStatus(fb.id, e.target.value as FeedbackRating['status'])
                            }
                            className="text-[11px] px-2 py-1 rounded-lg border border-[#ccd8ca] bg-white text-[#2d241d] font-semibold focus:outline-none cursor-pointer"
                          >
                            <option value="submitted">Submitted</option>
                            <option value="investigating">Investigating</option>
                            <option value="action_taken">Action Taken</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedItemForInspect(fb);
                              setInspectNote(fb.authorityNote || '');
                            }}
                            className="text-xs font-bold text-[#516b45] hover:text-[#2c3827] bg-[#f4f6f3] hover:bg-[#e5ece3] px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-[#ccd8ca]"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Feedback Drawer / Modal */}
      {selectedItemForInspect && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#ded5cb] shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee9e3]">
              <div>
                <span className="text-xs font-mono text-[#7a6350]">ID: {selectedItemForInspect.id}</span>
                <h3 className="text-base font-bold text-[#2d241d]">
                  Feedback Inspection & Resolution
                </h3>
              </div>
              <button
                onClick={() => setSelectedItemForInspect(null)}
                className="text-[#ab9582] hover:text-[#2d241d] text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-[#f4f6f3] p-3 rounded-xl border border-[#ccd8ca]">
                <div>
                  <span className="text-[#7a6350] block">Student ID:</span>
                  <span className="font-bold text-[#2d241d] font-mono">
                    {selectedItemForInspect.studentId}
                  </span>
                  {selectedItemForInspect.studentName && (
                    <span className="text-[#5d4b3d] block text-[11px]">
                      ({selectedItemForInspect.studentName})
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[#7a6350] block">Hostel Block & Room:</span>
                  <span className="font-bold text-[#2d241d]">
                    {selectedItemForInspect.hostelBlock} {selectedItemForInspect.roomNumber ? `· Rm ${selectedItemForInspect.roomNumber}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[#7a6350] block">Meal & Date:</span>
                  <span className="font-bold text-[#2d241d] capitalize">
                    {selectedItemForInspect.meal === 'snacks' ? 'Evening Snacks' : selectedItemForInspect.meal} ({selectedItemForInspect.date})
                  </span>
                </div>
                <div>
                  <span className="text-[#7a6350] block">Overall Score:</span>
                  <span className="font-bold text-[#2d241d] tabular-nums">
                    {selectedItemForInspect.overallScore.toFixed(2)} / 5.0
                  </span>
                </div>
              </div>

              {/* 4 Ratings */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-[#f4f6f3] border border-[#ccd8ca]">
                  <span className="text-[10px] text-[#7a6350] block">Taste</span>
                  <span className="font-bold text-[#2d241d] tabular-nums">{selectedItemForInspect.taste} / 5</span>
                </div>
                <div className="p-2 rounded-lg bg-[#f4f6f3] border border-[#ccd8ca]">
                  <span className="text-[10px] text-[#7a6350] block">Quality</span>
                  <span className="font-bold text-[#2d241d] tabular-nums">{selectedItemForInspect.quality} / 5</span>
                </div>
                <div className="p-2 rounded-lg bg-[#f4f6f3] border border-[#ccd8ca]">
                  <span className="text-[10px] text-[#7a6350] block">Hygiene</span>
                  <span className="font-bold text-[#2d241d] tabular-nums">{selectedItemForInspect.hygiene} / 5</span>
                </div>
                <div className="p-2 rounded-lg bg-[#f4f6f3] border border-[#ccd8ca]">
                  <span className="text-[10px] text-[#7a6350] block">Quantity</span>
                  <span className="font-bold text-[#2d241d] tabular-nums">{selectedItemForInspect.quantity} / 5</span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <span className="font-bold text-[#42352b] block mb-1">Student's Comment:</span>
                <p className="bg-[#f8f6f4] p-3 rounded-lg border border-[#ded5cb] text-[#2d241d] leading-relaxed italic">
                  {selectedItemForInspect.comment || 'No written comment provided.'}
                </p>
              </div>

              {/* Authority Resolution Note */}
              <div className="pt-2 border-t border-[#eee9e3]">
                <label className="font-bold text-[#42352b] block mb-1">
                  Authority Follow-up & Resolution Note:
                </label>
                <textarea
                  rows={3}
                  value={inspectNote}
                  onChange={(e) => setInspectNote(e.target.value)}
                  placeholder="e.g. Discussed with Chef Suresh. Replaced snack warming trays and recalibrated spices."
                  className="w-full text-xs p-2.5 rounded-lg border border-[#ccd8ca] focus:outline-none focus:ring-2 focus:ring-[#516b45] bg-[#fdfdfc]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#eee9e3]">
              <button
                onClick={() => setSelectedItemForInspect(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#7a6350] hover:text-[#2d241d] cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleSaveInspectNote}
                className="px-4 py-2 text-xs font-bold text-white bg-[#516b45] rounded-xl hover:bg-[#415538] transition-colors cursor-pointer shadow-xs"
              >
                Save Authority Note & Mark Action Taken
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Log Corrective Action */}
      {actionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#ded5cb] shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee9e3]">
              <div>
                <h3 className="text-base font-bold text-[#2d241d]">
                  Log Mess Corrective Action
                </h3>
                <p className="text-xs text-[#7a6350]">
                  Record official intervention to resolve food quality, temperature, or hygiene concerns
                </p>
              </div>
              <button
                onClick={() => setActionModalOpen(false)}
                className="text-[#ab9582] hover:text-[#2d241d] text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAction} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#42352b] mb-1">Action Title *</label>
                <input
                  type="text"
                  required
                  value={newActionTitle}
                  onChange={(e) => setNewActionTitle(e.target.value)}
                  placeholder="e.g. Calibrated salt spoons and recipe check for Lunch Dal"
                  className="w-full px-3 py-2 rounded-lg border border-[#ccd8ca] bg-[#fdfdfc] focus:outline-none focus:ring-2 focus:ring-[#516b45]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#42352b] mb-1">Meal Service</label>
                  <select
                    value={newActionMeal}
                    onChange={(e) => setNewActionMeal(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-[#ccd8ca] bg-white focus:outline-none focus:ring-2 focus:ring-[#516b45]"
                  >
                    <option value="all">All Meals</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Evening Snacks</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#42352b] mb-1">Category</label>
                  <select
                    value={newActionCategory}
                    onChange={(e) => setNewActionCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-[#ccd8ca] bg-white focus:outline-none focus:ring-2 focus:ring-[#516b45]"
                  >
                    <option value="taste">Taste & Spicing</option>
                    <option value="quality">Food Quality</option>
                    <option value="hygiene">Hygiene & Cleanliness</option>
                    <option value="quantity">Portion Quantity</option>
                    <option value="general">General Operations</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#42352b] mb-1">Initial Status</label>
                  <select
                    value={newActionInitialStatus}
                    onChange={(e) => setNewActionInitialStatus(e.target.value as ActionStatus)}
                    className="w-full px-3 py-2 rounded-lg border border-[#ccd8ca] bg-white focus:outline-none focus:ring-2 focus:ring-[#516b45]"
                  >
                    <option value="not_resolved">Not Resolved / Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#42352b] mb-1">Authority In Charge</label>
                  <select
                    value={newActionRole}
                    onChange={(e) => setNewActionRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#ccd8ca] bg-white focus:outline-none focus:ring-2 focus:ring-[#516b45]"
                  >
                    <option value="Mess Warden (Dr. A. Verma)">Mess Warden (Dr. A. Verma)</option>
                    <option value="Student Mess Committee">Student Mess Committee</option>
                    <option value="Catering Supervisor (M. Ansari)">Catering Supervisor (M. Ansari)</option>
                    <option value="Hostel Administrator">Hostel Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#42352b] mb-1">Action Description & Protocol *</label>
                <textarea
                  rows={3}
                  required
                  value={newActionDesc}
                  onChange={(e) => setNewActionDesc(e.target.value)}
                  placeholder="Detail the operational steps taken..."
                  className="w-full p-2.5 rounded-lg border border-[#ccd8ca] bg-[#fdfdfc] focus:outline-none focus:ring-2 focus:ring-[#516b45]"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#eee9e3]">
                <button
                  type="button"
                  onClick={() => setActionModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#7a6350] hover:text-[#2d241d] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#516b45] rounded-xl hover:bg-[#415538] transition-colors cursor-pointer shadow-xs"
                >
                  Publish Corrective Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
