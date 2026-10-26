import { FeedbackRating, IssuePattern, DailyTrendPoint, MealType, FeedbackCategory } from '../types';

export interface CategoryAverage {
  category: FeedbackCategory;
  label: string;
  average: number;
  satisfactionPct: number;
  lowRatingCount: number;
}

export interface MealAverage {
  meal: MealType;
  label: string;
  totalSubmissions: number;
  overallAverage: number;
  tasteAverage: number;
  qualityAverage: number;
  hygieneAverage: number;
  quantityAverage: number;
  satisfactionRate: number;
  primaryConcern?: string;
}

export interface OverallSummary {
  totalSubmissions: number;
  averageRating: number;
  tasteAverage: number;
  qualityAverage: number;
  hygieneAverage: number;
  quantityAverage: number;
  satisfactionPercentage: number;
  criticalIssuesCount: number;
  lowestRatedMeal: MealType;
  highestRatedMeal: MealType;
  lowestRatedCategory: FeedbackCategory;
}

export function computeOverallSummary(feedbacks: FeedbackRating[]): OverallSummary {
  if (feedbacks.length === 0) {
    return {
      totalSubmissions: 0,
      averageRating: 0,
      tasteAverage: 0,
      qualityAverage: 0,
      hygieneAverage: 0,
      quantityAverage: 0,
      satisfactionPercentage: 0,
      criticalIssuesCount: 0,
      lowestRatedMeal: 'lunch',
      highestRatedMeal: 'breakfast',
      lowestRatedCategory: 'taste',
    };
  }

  const total = feedbacks.length;
  let sumTaste = 0;
  let sumQuality = 0;
  let sumHygiene = 0;
  let sumQuantity = 0;
  let sumOverall = 0;
  let satisfiedCount = 0;
  let criticalCount = 0;

  const mealTotals: Record<MealType, { sum: number; count: number }> = {
    breakfast: { sum: 0, count: 0 },
    lunch: { sum: 0, count: 0 },
    snacks: { sum: 0, count: 0 },
    dinner: { sum: 0, count: 0 },
  };

  feedbacks.forEach((fb) => {
    sumTaste += fb.taste;
    sumQuality += fb.quality;
    sumHygiene += fb.hygiene;
    sumQuantity += fb.quantity;
    sumOverall += fb.overallScore;

    if (fb.overallScore >= 3.5) satisfiedCount++;
    if (fb.overallScore <= 2.5 || fb.hygiene <= 2) criticalCount++;

    if (mealTotals[fb.meal]) {
      mealTotals[fb.meal].sum += fb.overallScore;
      mealTotals[fb.meal].count += 1;
    }
  });

  const tasteAvg = sumTaste / total;
  const qualityAvg = sumQuality / total;
  const hygieneAvg = sumHygiene / total;
  const quantityAvg = sumQuantity / total;

  const categoryScores: { cat: FeedbackCategory; score: number }[] = [
    { cat: 'taste', score: tasteAvg },
    { cat: 'quality', score: qualityAvg },
    { cat: 'hygiene', score: hygieneAvg },
    { cat: 'quantity', score: quantityAvg },
  ];
  categoryScores.sort((a, b) => a.score - b.score);

  const mealAverages = (['breakfast', 'lunch', 'snacks', 'dinner'] as MealType[])
    .map((meal) => ({
      meal,
      avg: mealTotals[meal].count > 0 ? mealTotals[meal].sum / mealTotals[meal].count : 0,
      count: mealTotals[meal].count,
    }))
    .filter((m) => m.count > 0);

  mealAverages.sort((a, b) => a.avg - b.avg);

  return {
    totalSubmissions: total,
    averageRating: Number((sumOverall / total).toFixed(2)),
    tasteAverage: Number(tasteAvg.toFixed(2)),
    qualityAverage: Number(qualityAvg.toFixed(2)),
    hygieneAverage: Number(hygieneAvg.toFixed(2)),
    quantityAverage: Number(quantityAvg.toFixed(2)),
    satisfactionPercentage: Math.round((satisfiedCount / total) * 100),
    criticalIssuesCount: criticalCount,
    lowestRatedMeal: mealAverages.length > 0 ? mealAverages[0].meal : 'lunch',
    highestRatedMeal: mealAverages.length > 0 ? mealAverages[mealAverages.length - 1].meal : 'breakfast',
    lowestRatedCategory: categoryScores[0].cat,
  };
}

export function computeMealBreakdown(feedbacks: FeedbackRating[]): MealAverage[] {
  const meals: { meal: MealType; label: string }[] = [
    { meal: 'breakfast', label: 'Breakfast' },
    { meal: 'lunch', label: 'Lunch' },
    { meal: 'snacks', label: 'Evening Snacks' },
    { meal: 'dinner', label: 'Dinner' },
  ];

  return meals.map(({ meal, label }) => {
    const list = feedbacks.filter((f) => f.meal === meal);
    if (list.length === 0) {
      return {
        meal,
        label,
        totalSubmissions: 0,
        overallAverage: 0,
        tasteAverage: 0,
        qualityAverage: 0,
        hygieneAverage: 0,
        quantityAverage: 0,
        satisfactionRate: 0,
      };
    }

    const count = list.length;
    const taste = list.reduce((acc, c) => acc + c.taste, 0) / count;
    const quality = list.reduce((acc, c) => acc + c.quality, 0) / count;
    const hygiene = list.reduce((acc, c) => acc + c.hygiene, 0) / count;
    const quantity = list.reduce((acc, c) => acc + c.quantity, 0) / count;
    const overall = list.reduce((acc, c) => acc + c.overallScore, 0) / count;
    const satisfied = list.filter((c) => c.overallScore >= 3.5).length;

    const catMap: { cat: string; score: number }[] = [
      { cat: 'Taste & Spicing', score: taste },
      { cat: 'Food Quality', score: quality },
      { cat: 'Cleanliness & Hygiene', score: hygiene },
      { cat: 'Portion Quantity', score: quantity },
    ];
    catMap.sort((a, b) => a.score - b.score);

    return {
      meal,
      label,
      totalSubmissions: count,
      overallAverage: Number(overall.toFixed(2)),
      tasteAverage: Number(taste.toFixed(2)),
      qualityAverage: Number(quality.toFixed(2)),
      hygieneAverage: Number(hygiene.toFixed(2)),
      quantityAverage: Number(quantity.toFixed(2)),
      satisfactionRate: Math.round((satisfied / count) * 100),
      primaryConcern: catMap[0].score < 3.2 ? catMap[0].cat : undefined,
    };
  });
}

export function computeDailyTrends(feedbacks: FeedbackRating[]): DailyTrendPoint[] {
  const dateMap: Record<string, FeedbackRating[]> = {};

  feedbacks.forEach((fb) => {
    if (!dateMap[fb.date]) dateMap[fb.date] = [];
    dateMap[fb.date].push(fb);
  });

  const sortedDates = Object.keys(dateMap).sort();

  return sortedDates.map((dateStr) => {
    const list = dateMap[dateStr];
    const bList = list.filter((f) => f.meal === 'breakfast');
    const lList = list.filter((f) => f.meal === 'lunch');
    const sList = list.filter((f) => f.meal === 'snacks');
    const dList = list.filter((f) => f.meal === 'dinner');

    const calcAvg = (arr: FeedbackRating[]) =>
      arr.length ? Number((arr.reduce((s, i) => s + i.overallScore, 0) / arr.length).toFixed(2)) : 0;

    const bAvg = calcAvg(bList);
    const lAvg = calcAvg(lList);
    const sAvg = calcAvg(sList);
    const dAvg = calcAvg(dList);
    const overall = Number((list.reduce((s, i) => s + i.overallScore, 0) / list.length).toFixed(2));

    const parsed = new Date(dateStr + 'T00:00:00');
    const displayDate = parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      date: dateStr,
      displayDate,
      breakfast: bAvg,
      lunch: lAvg,
      snacks: sAvg,
      dinner: dAvg,
      overall,
      submissionCount: list.length,
    };
  });
}

export function detectIssuePatterns(feedbacks: FeedbackRating[]): IssuePattern[] {
  const patterns: IssuePattern[] = [];

  // Check 1: Lunch taste complaints (saltiness / spices)
  const lunchList = feedbacks.filter((f) => f.meal === 'lunch');
  const saltyCount = lunchList.filter((f) => f.tags.includes('Too Salty') || f.taste <= 2).length;
  if (saltyCount >= 2) {
    patterns.push({
      id: 'pat-taste-lunch',
      severity: 'critical',
      meal: 'lunch',
      category: 'taste',
      headline: 'Recurring excessive salt & seasoning complaints in Lunch',
      frequencyText: `${saltyCount} students reported high salt or poor taste during recent lunches`,
      suggestedAction: 'Review lunch gravy standard recipes with head chef; mandate calibrated measuring spoons for salt and spices.',
      relatedSubmissionCount: saltyCount,
    });
  }

  // Check 2: Dinner hygiene / plate cleanliness
  const dinnerList = feedbacks.filter((f) => f.meal === 'dinner');
  const hygieneIssues = dinnerList.filter(
    (f) => f.hygiene <= 2 || f.tags.includes('Unclean Plates / Trays')
  ).length;
  if (hygieneIssues >= 2) {
    patterns.push({
      id: 'pat-hygiene-dinner',
      severity: 'critical',
      meal: 'dinner',
      category: 'hygiene',
      headline: 'Unclean trays and oily residues reported during Dinner',
      frequencyText: `${hygieneIssues} complaints regarding greasy plates or dining table cleanliness`,
      suggestedAction: 'Inspect dishwashing wash cycle and verify water temp reaches 65°C+; replace worn dish sponges.',
      relatedSubmissionCount: hygieneIssues,
    });
  }

  // Check 3: Snacks temperature / warmth
  const snacksList = feedbacks.filter((f) => f.meal === 'snacks');
  const coldSnacks = snacksList.filter((f) => f.tags.includes('Served Cold') || f.tags.includes('Cold Tea / Samosas')).length;
  if (coldSnacks >= 1) {
    patterns.push({
      id: 'pat-snacks-temp',
      severity: 'warning',
      meal: 'snacks',
      category: 'quality',
      headline: 'Evening snacks served cold between 5:45 PM – 6:15 PM',
      frequencyText: `${coldSnacks} students reported lukewarm cutlets/samosas during snacks`,
      suggestedAction: 'Deploy insulated warmers and keep electric tea samovars on active heating during snack service.',
      relatedSubmissionCount: coldSnacks,
    });
  }

  // Check 4: Quantity shortages
  const quantityIssues = lunchList.filter(
    (f) => f.quantity <= 2 || f.tags.includes('Insufficient Quantity')
  ).length;
  if (quantityIssues >= 2) {
    patterns.push({
      id: 'pat-qty-lunch',
      severity: 'warning',
      meal: 'lunch',
      category: 'quantity',
      headline: 'Peak hour food depletion between 1:15 PM – 1:45 PM',
      frequencyText: `${quantityIssues} reports of running out of rice/curry with queue delays`,
      suggestedAction: 'Deploy secondary heated buffer vessels at serving counters 2 and 3 before 1:00 PM.',
      relatedSubmissionCount: quantityIssues,
    });
  }

  return patterns;
}

export function exportFeedbackToCSV(feedbacks: FeedbackRating[]): void {
  const headers = [
    'Feedback ID',
    'Date',
    'Meal',
    'Student ID',
    'Student Name',
    'Hostel Block',
    'Room',
    'Taste (1-5)',
    'Food Quality (1-5)',
    'Hygiene (1-5)',
    'Quantity (1-5)',
    'Overall Rating',
    'Issue Tags',
    'Student Comment',
    'Status',
    'Authority Note',
    'Created At',
  ];

  const escapeCSV = (value: string | number | undefined | null) => {
    if (value === undefined || value === null) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = feedbacks.map((fb) => [
    escapeCSV(fb.id),
    escapeCSV(fb.date),
    escapeCSV(fb.meal.toUpperCase()),
    escapeCSV(fb.studentId),
    escapeCSV(fb.studentName || 'Anonymous'),
    escapeCSV(fb.hostelBlock),
    escapeCSV(fb.roomNumber || '-'),
    escapeCSV(fb.taste),
    escapeCSV(fb.quality),
    escapeCSV(fb.hygiene),
    escapeCSV(fb.quantity),
    escapeCSV(fb.overallScore.toFixed(2)),
    escapeCSV(fb.tags.join('; ')),
    escapeCSV(fb.comment),
    escapeCSV(fb.status),
    escapeCSV(fb.authorityNote || ''),
    escapeCSV(fb.createdAt),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `messwise_feedback_report_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
