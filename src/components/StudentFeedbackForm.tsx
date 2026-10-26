import React, { useState } from 'react';
import { MealType, FeedbackRating, StudentProfile, HostelBlock } from '../types';
import { MEAL_SCHEDULES, COMMON_ISSUE_TAGS, HOSTEL_BLOCK_OPTIONS } from '../data/seedData';
import { Star, CheckCircle, AlertCircle, Clock, Utensils, Sparkles, User, Coffee, ShieldCheck } from 'lucide-react';

interface StudentFeedbackFormProps {
  currentStudent: StudentProfile;
  feedbacks: FeedbackRating[];
  onAddFeedback: (feedback: Omit<FeedbackRating, 'id' | 'createdAt' | 'status' | 'overallScore'>) => void;
  onNavigateToHistory: () => void;
}

export const StudentFeedbackForm: React.FC<StudentFeedbackFormProps> = ({
  currentStudent,
  feedbacks,
  onAddFeedback,
  onNavigateToHistory,
}) => {
  // Current meal suggestion based on local time
  const currentHour = new Date().getHours();
  const defaultMeal: MealType =
    currentHour < 11 ? 'breakfast' : currentHour < 15 ? 'lunch' : currentHour < 19 ? 'snacks' : 'dinner';

  const [studentId, setStudentId] = useState(currentStudent.studentId);
  const [studentName, setStudentName] = useState(currentStudent.name || '');
  const [hostelBlock, setHostelBlock] = useState<HostelBlock>(currentStudent.hostelBlock);
  const [roomNumber, setRoomNumber] = useState(currentStudent.roomNumber || '');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(defaultMeal);

  // 4 ratings
  const [taste, setTaste] = useState<number>(0);
  const [quality, setQuality] = useState<number>(0);
  const [hygiene, setHygiene] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);

  // Tags & comment
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState<FeedbackRating | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Duplicate check: One submission per student per meal per date
  const isDuplicate = feedbacks.some(
    (f) =>
      f.studentId.trim().toLowerCase() === studentId.trim().toLowerCase() &&
      f.meal === selectedMeal &&
      f.date === selectedDate
  );

  const existingFeedback = isDuplicate
    ? feedbacks.find(
        (f) =>
          f.studentId.trim().toLowerCase() === studentId.trim().toLowerCase() &&
          f.meal === selectedMeal &&
          f.date === selectedDate
      )
    : null;

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const ratingLabels: Record<number, { text: string; color: string }> = {
    1: { text: 'Very Poor', color: 'text-rose-700' },
    2: { text: 'Needs Work', color: 'text-amber-700' },
    3: { text: 'Average', color: 'text-[#5d4b3d]' },
    4: { text: 'Good', color: 'text-[#516b45]' },
    5: { text: 'Excellent', color: 'text-[#36442f]' },
  };

  const renderRatingGroup = (
    title: string,
    description: string,
    value: number,
    onChange: (val: number) => void
  ) => {
    return (
      <div className="p-4 rounded-xl bg-[#f4f6f3] border border-[#ccd8ca]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
          <div>
            <h4 className="font-semibold text-[#2d241d] text-xs sm:text-sm">{title}</h4>
            <p className="text-[11px] text-[#7a6350]">{description}</p>
          </div>
          <div className="text-right">
            {value > 0 ? (
              <span className={`text-xs font-semibold ${ratingLabels[value].color}`}>
                {value} / 5 · {ratingLabels[value].text}
              </span>
            ) : (
              <span className="text-xs text-[#ab9582]">Rate 1–5</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const isSelected = value === star;
            return (
              <button
                type="button"
                key={star}
                onClick={() => onChange(star)}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-lg border transition-all text-xs font-medium cursor-pointer ${
                  isSelected
                    ? 'bg-[#42352b] text-white border-[#42352b] shadow-xs'
                    : 'bg-white text-[#2d241d] border-[#ded5cb] hover:border-[#ab9582] hover:bg-[#eee9e3]'
                }`}
                aria-label={`Rate ${title} ${star} out of 5`}
              >
                <Star
                  className={`w-4 h-4 mb-1 ${
                    isSelected
                      ? 'fill-[#f59e0b] text-[#f59e0b]'
                      : value >= star
                      ? 'text-[#f59e0b] fill-[#f59e0b]/40'
                      : 'text-[#ded5cb]'
                  }`}
                />
                <span className="tabular-nums font-semibold">{star}</span>
                <span className="text-[10px] opacity-75 hidden sm:inline">
                  {star === 1 ? 'Poor' : star === 5 ? 'Top' : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!studentId.trim()) {
      setValidationError('Please provide your Student ID or Roll Number.');
      return;
    }

    if (isDuplicate) {
      setValidationError(
        `You have already submitted feedback for ${selectedMeal.toUpperCase()} on ${selectedDate}.`
      );
      return;
    }

    if (!taste || !quality || !hygiene || !quantity) {
      setValidationError('Please provide ratings for all 4 categories (Taste, Quality, Hygiene, and Quantity).');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const overall = Number(((taste + quality + hygiene + quantity) / 4).toFixed(2));
      const newRecord: FeedbackRating = {
        id: `fb-${Date.now().toString().slice(-5)}`,
        studentId: studentId.trim().toUpperCase(),
        studentName: studentName.trim() || undefined,
        hostelBlock,
        roomNumber: roomNumber.trim() || undefined,
        date: selectedDate,
        meal: selectedMeal,
        taste,
        quality,
        hygiene,
        quantity,
        overallScore: overall,
        tags: selectedTags,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
        status: 'submitted',
      };

      onAddFeedback(newRecord);
      setSubmittedFeedback(newRecord);
      setIsSubmitting(false);

      // Reset ratings
      setTaste(0);
      setQuality(0);
      setHygiene(0);
      setQuantity(0);
      setSelectedTags([]);
      setComment('');
    }, 350);
  };

  const mealSchedule = MEAL_SCHEDULES[selectedMeal] || MEAL_SCHEDULES.lunch;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Introduction banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#ded5cb] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eee9e3] pb-4 mb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#516b45]">
              Daily Dining Feedback
            </span>
            <h2 className="text-xl font-bold text-[#2d241d] tracking-tight">
              Hostel Mess Meal Feedback
            </h2>
            <p className="text-xs text-[#7a6350] mt-0.5">
              Review Breakfast, Lunch, Snacks, or Dinner in under 60 seconds.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#415538] bg-[#f4f6f3] border border-[#ccd8ca] py-1.5 px-3 rounded-xl w-fit">
            <ShieldCheck className="w-4 h-4 text-[#516b45] shrink-0" />
            <span>Authenticated as {currentStudent.studentId} ({currentStudent.hostelBlock})</span>
          </div>
        </div>

        {/* Success Modal / Banner */}
        {submittedFeedback && (
          <div className="mb-6 p-5 rounded-xl bg-[#f4f6f3] border border-[#a9be9f] animate-in fade-in">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#516b45] shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#2c3827] text-xs sm:text-sm">
                    Feedback Submitted Successfully!
                  </h4>
                  <span className="text-xs font-mono text-[#415538] bg-[#e5ece3] px-2 py-0.5 rounded">
                    ID: {submittedFeedback.id}
                  </span>
                </div>
                <p className="text-xs text-[#415538] mt-1">
                  Your evaluation for {submittedFeedback.meal.toUpperCase()} on {submittedFeedback.date} has been recorded. Mess authorities review low ratings daily.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => setSubmittedFeedback(null)}
                    className="text-xs font-semibold text-[#2d241d] bg-white border border-[#ccd8ca] px-3 py-1.5 rounded-lg hover:bg-[#e5ece3] transition-colors cursor-pointer"
                  >
                    Submit Another Meal
                  </button>
                  <button
                    onClick={onNavigateToHistory}
                    className="text-xs font-semibold text-[#516b45] hover:text-[#2c3827] underline underline-offset-2 cursor-pointer"
                  >
                    View My History →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Student Profile Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#42352b]">
              <User className="w-4 h-4 text-[#7a6350]" />
              <span>Student Details & Hostel Block</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#5d4b3d] mb-1">
                  Student ID *
                </label>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. STU-2024-0418"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#ccd8ca] bg-[#fdfdfc] text-[#2d241d] focus:outline-none focus:ring-2 focus:ring-[#516b45] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5d4b3d] mb-1">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Nikhil Saxena"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#ccd8ca] bg-[#fdfdfc] text-[#2d241d] focus:outline-none focus:ring-2 focus:ring-[#516b45]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5d4b3d] mb-1">
                  Hostel Block *
                </label>
                <select
                  value={hostelBlock}
                  onChange={(e) => setHostelBlock(e.target.value as HostelBlock)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#ccd8ca] bg-white text-[#2d241d] font-semibold focus:outline-none focus:ring-2 focus:ring-[#516b45]"
                >
                  {HOSTEL_BLOCK_OPTIONS.map((blk) => (
                    <option key={blk} value={blk}>
                      {blk}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5d4b3d] mb-1">
                  Room No. (Optional)
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. B-309"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#ccd8ca] bg-[#fdfdfc] text-[#2d241d] focus:outline-none focus:ring-2 focus:ring-[#516b45]"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Date & Meal Selection (Including Snacks!) */}
          <div className="space-y-3 pt-2 border-t border-[#eee9e3]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#42352b]">
                <Utensils className="w-4 h-4 text-[#7a6350]" />
                <span>Select Meal & Date</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#7a6350]">
                <Clock className="w-3.5 h-3.5 text-[#ab9582]" />
                <span>{mealSchedule.timeRange}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-[#5d4b3d] mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#ccd8ca] bg-white text-[#2d241d] focus:outline-none focus:ring-2 focus:ring-[#516b45]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-[#5d4b3d] mb-1">Meal Service *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['breakfast', 'lunch', 'snacks', 'dinner'] as MealType[]).map((mealKey) => {
                    const isSelected = selectedMeal === mealKey;
                    return (
                      <button
                        type="button"
                        key={mealKey}
                        onClick={() => setSelectedMeal(mealKey)}
                        className={`py-2 px-2.5 text-xs font-semibold rounded-xl border transition-all capitalize cursor-pointer text-center ${
                          isSelected
                            ? 'bg-[#42352b] text-white border-[#42352b] shadow-xs'
                            : 'bg-white text-[#42352b] border-[#ded5cb] hover:border-[#ab9582] hover:bg-[#f4f6f3]'
                        }`}
                      >
                        {mealKey === 'snacks' ? '☕ Snacks' : mealKey}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Menu Highlights Banner for context */}
            <div className="text-xs p-3 rounded-xl bg-[#fef3c7] border border-[#fbbf24]/50 text-[#92400e] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
                <span>Today's {mealSchedule.label} Highlights:</span>
                <span className="font-normal text-[#78350f]">
                  {mealSchedule.menuHighlights.join(' · ')}
                </span>
              </div>
              <span className="text-[11px] text-[#b45309] shrink-0">Chef: {mealSchedule.chefInCharge}</span>
            </div>

            {/* Duplicate submission warning */}
            {isDuplicate && (
              <div className="p-3.5 rounded-xl bg-[#fef3c7] border border-[#fbbf24] flex items-start gap-2.5 text-xs text-[#92400e]">
                <AlertCircle className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Already Submitted:</span> You have already evaluated {selectedMeal.toUpperCase()} on {selectedDate} (Rating: {existingFeedback?.overallScore.toFixed(1)}/5). You can review it in your history or select another meal.
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Four Core Rating Categories */}
          <div className="space-y-3 pt-2 border-t border-[#eee9e3]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#42352b]">
                <Star className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
                <span>Rate Food Quality Categories (1 to 5 Stars) *</span>
              </div>
              <span className="text-[11px] text-[#7a6350]">1: Very Poor → 5: Excellent</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {renderRatingGroup(
                '1. Taste & Spicing',
                'Flavour balance, salt, seasoning, appetizing aroma',
                taste,
                setTaste
              )}
              {renderRatingGroup(
                '2. Food Quality & Freshness',
                'Ingredient quality, freshness, temperature, oiliness',
                quality,
                setQuality
              )}
              {renderRatingGroup(
                '3. Hygiene & Cleanliness',
                'Cleanliness of dining hall, trays, cups, serving spoons',
                hygiene,
                setHygiene
              )}
              {renderRatingGroup(
                '4. Serving Quantity & Portions',
                'Portion adequacy, timely replenishment during rush',
                quantity,
                setQuantity
              )}
            </div>
          </div>

          {/* Step 4: Quick Tags */}
          <div className="space-y-2 pt-2 border-t border-[#eee9e3]">
            <label className="block text-xs font-semibold text-[#42352b]">
              Quick Highlights & Specific Concerns (Optional)
            </label>
            <p className="text-xs text-[#7a6350] mb-2">
              Select one or more tags to help mess authorities categorize concerns instantly:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_ISSUE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                const isPositive = tag.includes('Fresh') || tag.includes('Great') || tag.includes('Quick');
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer font-medium ${
                      isSelected
                        ? isPositive
                          ? 'bg-[#516b45] text-white border-[#516b45] shadow-xs'
                          : 'bg-[#991b1b] text-white border-[#991b1b] shadow-xs'
                        : 'bg-white text-[#42352b] border-[#ded5cb] hover:border-[#ab9582] hover:bg-[#f4f6f3]'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 5: Written Comment */}
          <div className="space-y-2 pt-2 border-t border-[#eee9e3]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#42352b]">
                Written Comments or Constructive Suggestions (Optional)
              </label>
              <span className="text-[11px] text-[#ab9582]">{comment.length} / 400</span>
            </div>
            <textarea
              rows={3}
              maxLength={400}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Cutlets and samosas were tasty but served cold. Dal had excess salt today. Water cooler near MH counter was refilled promptly."
              className="w-full text-xs p-3 rounded-xl border border-[#ccd8ca] bg-[#fdfdfc] text-[#2d241d] focus:outline-none focus:ring-2 focus:ring-[#516b45]"
            />
          </div>

          {/* Validation Error Message */}
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onNavigateToHistory}
              className="text-xs text-[#516b45] hover:text-[#2c3827] font-semibold transition-colors cursor-pointer"
            >
              View My Previous Submissions →
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isDuplicate}
              className={`w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl text-white transition-all cursor-pointer shadow-xs ${
                isDuplicate
                  ? 'bg-[#ab9582] cursor-not-allowed'
                  : 'bg-[#516b45] hover:bg-[#415538] active:scale-[0.99]'
              }`}
            >
              {isSubmitting ? 'Recording Feedback...' : isDuplicate ? 'Already Evaluated this Meal' : 'Submit Meal Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
