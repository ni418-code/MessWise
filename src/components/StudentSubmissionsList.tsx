import React, { useState } from 'react';
import { FeedbackRating } from '../types';
import { Star, MessageSquare, Clock, Filter, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

interface StudentSubmissionsListProps {
  feedbacks: FeedbackRating[];
  currentStudentId?: string;
  onBackToForm: () => void;
}

export const StudentSubmissionsList: React.FC<StudentSubmissionsListProps> = ({
  feedbacks,
  currentStudentId = 'STU-2024-0418',
  onBackToForm,
}) => {
  const [filterMode, setFilterMode] = useState<'mine' | 'all'>('mine');
  const [selectedMeal, setSelectedMeal] = useState<string>('all');

  const filtered = feedbacks.filter((fb) => {
    if (filterMode === 'mine') {
      if (fb.studentId.toLowerCase() !== currentStudentId.toLowerCase()) return false;
    }
    if (selectedMeal !== 'all' && fb.meal !== selectedMeal) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-2xl p-6 border border-[#ded5cb] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eee9e3]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={onBackToForm}
                className="text-xs text-[#516b45] hover:text-[#2c3827] flex items-center gap-1 cursor-pointer font-semibold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Feedback Form
              </button>
            </div>
            <h2 className="text-xl font-bold text-[#2d241d] tracking-tight">
              My Submissions & Meal Feedback History
            </h2>
            <p className="text-xs text-[#7a6350] mt-0.5">
              Review your logged meal ratings and track actions taken by hostel mess authorities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterMode('mine')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filterMode === 'mine'
                  ? 'bg-[#516b45] text-white border-[#516b45]'
                  : 'bg-white text-[#42352b] border-[#ded5cb] hover:bg-[#f4f6f3]'
              }`}
            >
              My Feedback ({feedbacks.filter((f) => f.studentId.toLowerCase() === currentStudentId.toLowerCase()).length})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-[#42352b] text-white border-[#42352b]'
                  : 'bg-white text-[#42352b] border-[#ded5cb] hover:bg-[#f4f6f3]'
              }`}
            >
              All Campus Feedback ({feedbacks.length})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="pt-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-[#42352b]">
            <Filter className="w-3.5 h-3.5 text-[#ab9582]" />
            <span className="font-semibold">Filter Meal:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {['all', 'breakfast', 'lunch', 'snacks', 'dinner'].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMeal(m)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize cursor-pointer transition-colors ${
                    selectedMeal === m
                      ? 'bg-[#e5ece3] text-[#2c3827] font-bold border border-[#ccd8ca]'
                      : 'text-[#7a6350] hover:bg-[#f4f6f3]'
                  }`}
                >
                  {m === 'snacks' ? 'Snacks ☕' : m}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-[#7a6350]">
            Showing <span className="font-semibold text-[#2d241d]">{filtered.length}</span> entries
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#ded5cb]">
            <p className="text-sm font-semibold text-[#42352b]">No feedback records found</p>
            <p className="text-xs text-[#7a6350] mt-1 max-w-sm mx-auto">
              {filterMode === 'mine'
                ? `You have not submitted feedback for ${selectedMeal} yet.`
                : 'No feedback records available for this filter.'}
            </p>
            <button
              onClick={onBackToForm}
              className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#516b45] rounded-xl hover:bg-[#415538] transition-colors cursor-pointer"
            >
              Rate Meal Now
            </button>
          </div>
        ) : (
          filtered.map((item) => {
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl p-5 border border-[#ded5cb] hover:border-[#ab9582] transition-all shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eee9e3] pb-3 mb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-mono font-semibold text-[#415538] bg-[#f4f6f3] border border-[#ccd8ca] px-2 py-0.5 rounded">
                      {item.id}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2d241d]">
                      {item.meal === 'snacks' ? 'Evening Snacks' : item.meal}
                    </span>
                    <span className="text-xs text-[#ab9582]">·</span>
                    <span className="text-xs text-[#42352b] font-medium">{item.date}</span>
                    <span className="text-xs text-[#ab9582]">·</span>
                    <span className="text-xs font-semibold text-[#516b45] bg-[#f4f6f3] px-2 py-0.5 rounded">
                      {item.hostelBlock}
                    </span>
                    {item.roomNumber && (
                      <span className="text-xs text-[#7a6350]">Room {item.roomNumber}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs font-bold text-[#2d241d] bg-[#fef3c7] border border-[#fbbf24]/60 px-2.5 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" />
                      <span className="tabular-nums">{item.overallScore.toFixed(2)}</span>
                      <span className="text-[#92400e] text-[10px]">/ 5</span>
                    </div>

                    <div className="text-xs">
                      {item.status === 'resolved' && (
                        <span className="text-[#36442f] font-semibold flex items-center gap-1 bg-[#e5ece3] px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#516b45]" /> Resolved
                        </span>
                      )}
                      {item.status === 'action_taken' && (
                        <span className="text-[#516b45] font-semibold flex items-center gap-1 bg-[#f4f6f3] px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#516b45]" /> Action Taken
                        </span>
                      )}
                      {item.status === 'investigating' && (
                        <span className="text-[#b45309] font-semibold flex items-center gap-1 bg-[#fef3c7] px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#d97706]" /> Investigating
                        </span>
                      )}
                      {item.status === 'submitted' && (
                        <span className="text-[#7a6350] font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#ab9582]" /> Submitted
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Category breakdown row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#f4f6f3] border border-[#ccd8ca]/50">
                    <span className="text-[#7a6350] block text-[11px]">Taste & Spicing</span>
                    <span className="font-bold text-[#2d241d] tabular-nums">{item.taste} / 5</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#f4f6f3] border border-[#ccd8ca]/50">
                    <span className="text-[#7a6350] block text-[11px]">Food Quality</span>
                    <span className="font-bold text-[#2d241d] tabular-nums">{item.quality} / 5</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#f4f6f3] border border-[#ccd8ca]/50">
                    <span className="text-[#7a6350] block text-[11px]">Hygiene & Cleanliness</span>
                    <span className={`font-bold tabular-nums ${item.hygiene <= 2 ? 'text-rose-700' : 'text-[#2d241d]'}`}>
                      {item.hygiene} / 5
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#f4f6f3] border border-[#ccd8ca]/50">
                    <span className="text-[#7a6350] block text-[11px]">Portion Quantity</span>
                    <span className="font-bold text-[#2d241d] tabular-nums">{item.quantity} / 5</span>
                  </div>
                </div>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] px-2 py-0.5 rounded bg-[#eee9e3] text-[#42352b] font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Comment */}
                {item.comment && (
                  <div className="mt-3 text-xs text-[#2d241d] bg-[#f8f6f4] p-3 rounded-xl border border-[#ded5cb] flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-[#ab9582] shrink-0 mt-0.5" />
                    <p className="leading-relaxed italic">"{item.comment}"</p>
                  </div>
                )}

                {/* Authority note if present */}
                {item.authorityNote && (
                  <div className="mt-2.5 text-xs p-3 rounded-xl bg-[#f4f6f3] border border-[#a9be9f] text-[#2c3827] flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#516b45] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[11px] block text-[#415538]">Authority Action Taken:</span>
                      <span>{item.authorityNote}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
