import React from 'react';
import { MEAL_SCHEDULES } from '../data/seedData';
import { MealType } from '../types';
import { Clock, Utensils, ChefHat, Sparkles } from 'lucide-react';

interface DailyMenuBoardProps {
  onSelectMealForFeedback?: (meal: MealType) => void;
  isStudent?: boolean;
}

export const DailyMenuBoard: React.FC<DailyMenuBoardProps> = ({
  onSelectMealForFeedback,
  isStudent = false,
}) => {
  const mealOrder: MealType[] = ['breakfast', 'lunch', 'snacks', 'dinner'];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#ded5cb] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#516b45]">
              Campus Dining Services
            </span>
            <h2 className="text-xl font-bold text-[#2d241d] tracking-tight">
              Daily Mess Menu & Service Timings
            </h2>
            <p className="text-xs text-[#7a6350] mt-0.5">
              Scheduled meal offerings for Breakfast, Lunch, Evening Snacks, and Dinner.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#415538] bg-[#f4f6f3] border border-[#ccd8ca] px-3.5 py-1.5 rounded-xl w-fit">
            <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
            <span>4 Scheduled Daily Services</span>
          </div>
        </div>
      </div>

      {/* 4 Meals Cards: Breakfast, Lunch, Snacks, Dinner */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mealOrder.map((mealKey) => {
          const item = MEAL_SCHEDULES[mealKey];
          return (
            <div
              key={mealKey}
              className="bg-white rounded-2xl p-5 border border-[#ded5cb] hover:border-[#ab9582] transition-all shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#eee9e3] pb-3 mb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#516b45]">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-[#7a6350] mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#ab9582]" />
                      <span className="tabular-nums font-medium">{item.timeRange}</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#f4f6f3] text-[#516b45] border border-[#ccd8ca]">
                    <Utensils className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#42352b] block">Menu Specialties:</span>
                  <ul className="space-y-1.5 text-xs text-[#5d4b3d]">
                    {item.menuHighlights.map((menuItem, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#516b45] font-bold shrink-0">·</span>
                        <span>{menuItem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-[#eee9e3]">
                <div className="flex items-center gap-1.5 text-[11px] text-[#7a6350] mb-3">
                  <ChefHat className="w-3.5 h-3.5 text-[#ab9582]" />
                  <span className="truncate">{item.chefInCharge}</span>
                </div>

                {isStudent && onSelectMealForFeedback && (
                  <button
                    onClick={() => onSelectMealForFeedback(mealKey)}
                    className="w-full py-2 px-3 text-xs font-bold text-[#2d241d] bg-[#f4f6f3] hover:bg-[#516b45] hover:text-white rounded-xl transition-all cursor-pointer text-center border border-[#ccd8ca]"
                  >
                    Rate This {item.label} →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
