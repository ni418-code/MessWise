/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FeedbackRating,
  AdministrativeAction,
  StudentProfile,
  AuthorityProfile,
  ActionStatus,
} from './types';
import { INITIAL_FEEDBACK, INITIAL_ACTIONS } from './data/seedData';
import { LoginPage } from './components/LoginPage';
import { StudentFeedbackForm } from './components/StudentFeedbackForm';
import { StudentSubmissionsList } from './components/StudentSubmissionsList';
import { AuthorityDashboard } from './components/AuthorityDashboard';
import { DailyMenuBoard } from './components/DailyMenuBoard';
import { LogOut, User, Shield, CheckCircle2, RefreshCw } from 'lucide-react';

type UserSession =
  | { type: 'logged_out' }
  | { type: 'student'; profile: StudentProfile }
  | { type: 'authority'; profile: AuthorityProfile };

export default function App() {
  // Feedbacks state with localStorage persistence
  const [feedbacks, setFeedbacks] = useState<FeedbackRating[]>(() => {
    try {
      const saved = localStorage.getItem('messwise_feedbacks_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_FEEDBACK;
  });

  // Actions state with localStorage persistence
  const [actions, setActions] = useState<AdministrativeAction[]>(() => {
    try {
      const saved = localStorage.getItem('messwise_actions_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_ACTIONS;
  });

  // Auth session: starts on login page at start
  const [session, setSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem('messwise_session_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return { type: 'logged_out' };
  });

  // Active view inside student or authority portals
  const [studentView, setStudentView] = useState<'form' | 'history' | 'menu'>('form');
  const [authorityView, setAuthorityView] = useState<'dashboard' | 'menu'>('dashboard');
  const [notification, setNotification] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('messwise_feedbacks_v2', JSON.stringify(feedbacks));
    } catch {
      // ignore
    }
  }, [feedbacks]);

  useEffect(() => {
    try {
      localStorage.setItem('messwise_actions_v2', JSON.stringify(actions));
    } catch {
      // ignore
    }
  }, [actions]);

  useEffect(() => {
    try {
      localStorage.setItem('messwise_session_v2', JSON.stringify(session));
    } catch {
      // ignore
    }
  }, [session]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const handleStudentLogin = (profile: StudentProfile) => {
    setSession({ type: 'student', profile });
    setStudentView('form');
    showNotification(`Welcome, ${profile.name || profile.studentId} (${profile.hostelBlock})!`);
  };

  const handleAuthorityLogin = (profile: AuthorityProfile) => {
    setSession({ type: 'authority', profile });
    setAuthorityView('dashboard');
    showNotification(`Logged in as ${profile.role}.`);
  };

  const handleSignOut = () => {
    setSession({ type: 'logged_out' });
    showNotification('Signed out successfully.');
  };

  const handleAddFeedback = (
    newFeedback: Omit<FeedbackRating, 'id' | 'createdAt' | 'status' | 'overallScore'>
  ) => {
    const overallScore = Number(
      ((newFeedback.taste + newFeedback.quality + newFeedback.hygiene + newFeedback.quantity) / 4).toFixed(2)
    );
    const item: FeedbackRating = {
      ...newFeedback,
      id: `fb-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      status: 'submitted',
      overallScore,
    };
    setFeedbacks((prev) => [item, ...prev]);
    showNotification(`Feedback logged for ${item.meal.toUpperCase()} (ID: ${item.id}).`);
  };

  const handleUpdateFeedbackStatus = (
    id: string,
    status: FeedbackRating['status'],
    note?: string
  ) => {
    setFeedbacks((prev) =>
      prev.map((fb) =>
        fb.id === id
          ? {
              ...fb,
              status,
              authorityNote: note !== undefined ? note : fb.authorityNote,
            }
          : fb
      )
    );
    showNotification(`Feedback #${id} marked as ${status}.`);
  };

  const handleAddAction = (actionData: Omit<AdministrativeAction, 'id'>) => {
    const newAct: AdministrativeAction = {
      ...actionData,
      id: `act-${Date.now().toString().slice(-3)}`,
    };
    setActions((prev) => [newAct, ...prev]);
    showNotification(`Action #${newAct.id} recorded.`);
  };

  const handleUpdateActionStatus = (
    id: string,
    status: ActionStatus,
    outcome?: string
  ) => {
    setActions((prev) =>
      prev.map((act) => (act.id === id ? { ...act, status, outcome: outcome || act.outcome } : act))
    );
    showNotification(`Action #${id} status updated to ${status}.`);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all feedback and actions to default demo data?')) {
      setFeedbacks(INITIAL_FEEDBACK);
      setActions(INITIAL_ACTIONS);
      localStorage.removeItem('messwise_feedbacks_v2');
      localStorage.removeItem('messwise_actions_v2');
      showNotification('Demo data reset to factory seed.');
    }
  };

  // If user is logged out, render separate login page
  if (session.type === 'logged_out') {
    return (
      <LoginPage
        onStudentLogin={handleStudentLogin}
        onAuthorityLogin={handleAuthorityLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex flex-col font-sans text-[#2d241d] selection:bg-[#516b45] selection:text-white">
      {/* Top Bar with Sage Green + Walnut Brown Palette */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#ded5cb]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-4 sm:px-6 py-3.5">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-[#516b45] flex items-center justify-center shadow-xs">
              <img
                src="/assets/aistudio/favicon_9450694d.svg"
                alt="Messwise Icon"
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-[#2d241d] whitespace-nowrap">
              Messwise
            </span>
          </div>

          {/* Zone 2: Navigation Links depending on user type */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-[#7a6350]">
            {session.type === 'student' && (
              <>
                <button
                  onClick={() => setStudentView('form')}
                  className={`hover:text-[#2d241d] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    studentView === 'form'
                      ? 'text-[#516b45] font-bold border-b-2 border-[#516b45] pb-0.5'
                      : ''
                  }`}
                >
                  Rate Meal
                </button>
                <button
                  onClick={() => setStudentView('history')}
                  className={`hover:text-[#2d241d] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    studentView === 'history'
                      ? 'text-[#516b45] font-bold border-b-2 border-[#516b45] pb-0.5'
                      : ''
                  }`}
                >
                  My Submissions
                </button>
                <button
                  onClick={() => setStudentView('menu')}
                  className={`hover:text-[#2d241d] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    studentView === 'menu'
                      ? 'text-[#516b45] font-bold border-b-2 border-[#516b45] pb-0.5'
                      : ''
                  }`}
                >
                  Daily Menu
                </button>
              </>
            )}

            {session.type === 'authority' && (
              <>
                <button
                  onClick={() => setAuthorityView('dashboard')}
                  className={`hover:text-[#2d241d] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    authorityView === 'dashboard'
                      ? 'text-[#516b45] font-bold border-b-2 border-[#516b45] pb-0.5'
                      : ''
                  }`}
                >
                  Authority Analytics & Actions
                </button>
                <button
                  onClick={() => setAuthorityView('menu')}
                  className={`hover:text-[#2d241d] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    authorityView === 'menu'
                      ? 'text-[#516b45] font-bold border-b-2 border-[#516b45] pb-0.5'
                      : ''
                  }`}
                >
                  Daily Menu
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Logged-in Profile Badge & Sign Out Button */}
          <div className="flex items-center gap-3 shrink-0">
            {session.type === 'student' && (
              <div className="hidden sm:flex items-center gap-2 text-xs bg-[#f4f6f3] border border-[#ccd8ca] px-2.5 py-1 rounded-xl">
                <User className="w-3.5 h-3.5 text-[#516b45]" />
                <span className="font-mono font-bold text-[#2d241d]">{session.profile.studentId}</span>
                <span className="text-[#ab9582]">·</span>
                <span className="font-semibold text-[#516b45]">{session.profile.hostelBlock}</span>
              </div>
            )}

            {session.type === 'authority' && (
              <div className="hidden sm:flex items-center gap-2 text-xs bg-[#fef3c7] border border-[#fbbf24]/50 px-2.5 py-1 rounded-xl">
                <Shield className="w-3.5 h-3.5 text-[#d97706]" />
                <span className="font-bold text-[#92400e] truncate max-w-[160px]">
                  {session.profile.role}
                </span>
              </div>
            )}

            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 text-xs font-bold text-[#42352b] bg-[#f4f6f3] hover:bg-[#e5ece3] border border-[#ccd8ca] rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Sign out to return to login screen"
            >
              <LogOut className="w-3.5 h-3.5 text-[#7a6350]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation */}
        <div className="md:hidden flex items-center gap-2 px-4 py-2 border-t border-[#eee9e3] bg-[#f4f6f3] overflow-x-auto">
          {session.type === 'student' && (
            <>
              <button
                onClick={() => setStudentView('form')}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap cursor-pointer ${
                  studentView === 'form' ? 'bg-[#516b45] text-white' : 'text-[#7a6350]'
                }`}
              >
                Rate Meal
              </button>
              <button
                onClick={() => setStudentView('history')}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap cursor-pointer ${
                  studentView === 'history' ? 'bg-[#516b45] text-white' : 'text-[#7a6350]'
                }`}
              >
                My Submissions
              </button>
              <button
                onClick={() => setStudentView('menu')}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap cursor-pointer ${
                  studentView === 'menu' ? 'bg-[#516b45] text-white' : 'text-[#7a6350]'
                }`}
              >
                Daily Menu
              </button>
            </>
          )}

          {session.type === 'authority' && (
            <>
              <button
                onClick={() => setAuthorityView('dashboard')}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap cursor-pointer ${
                  authorityView === 'dashboard' ? 'bg-[#42352b] text-white' : 'text-[#7a6350]'
                }`}
              >
                Analytics & Actions
              </button>
              <button
                onClick={() => setAuthorityView('menu')}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap cursor-pointer ${
                  authorityView === 'menu' ? 'bg-[#42352b] text-white' : 'text-[#7a6350]'
                }`}
              >
                Daily Menu
              </button>
            </>
          )}
        </div>
      </header>

      {/* Global Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#2d241d] text-white text-xs px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-[#7a6350] animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#a9be9f] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {session.type === 'student' && (
          <>
            {studentView === 'form' && (
              <StudentFeedbackForm
                currentStudent={session.profile}
                feedbacks={feedbacks}
                onAddFeedback={handleAddFeedback}
                onNavigateToHistory={() => setStudentView('history')}
              />
            )}

            {studentView === 'history' && (
              <StudentSubmissionsList
                feedbacks={feedbacks}
                currentStudentId={session.profile.studentId}
                onBackToForm={() => setStudentView('form')}
              />
            )}

            {studentView === 'menu' && (
              <DailyMenuBoard
                onSelectMealForFeedback={(meal) => {
                  setStudentView('form');
                }}
                isStudent={true}
              />
            )}
          </>
        )}

        {session.type === 'authority' && (
          <>
            {authorityView === 'dashboard' && (
              <AuthorityDashboard
                feedbacks={feedbacks}
                actions={actions}
                onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
                onAddAction={handleAddAction}
                onUpdateActionStatus={handleUpdateActionStatus}
              />
            )}

            {authorityView === 'menu' && <DailyMenuBoard isStudent={false} />}
          </>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-[#ded5cb] mt-auto py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7a6350]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#2d241d]">Messwise</span>
            <span>·</span>
            <span>Hostel Mess Feedback & Food Quality Monitoring</span>
            <span>·</span>
            <span className="font-medium text-[#516b45]">Sage & Walnut System</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetData}
              className="text-[#7a6350] hover:text-[#991b1b] transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset sample feedback data"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Demo Seed Data</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
