import React, { useState } from 'react';
import { HostelBlock, StudentProfile, AuthorityProfile } from '../types';
import { HOSTEL_BLOCK_OPTIONS } from '../data/seedData';
import { User, Shield, ArrowRight, Lock, CheckCircle2, Coffee, Building2 } from 'lucide-react';

interface LoginPageProps {
  onStudentLogin: (student: StudentProfile) => void;
  onAuthorityLogin: (authority: AuthorityProfile) => void;
  defaultMode?: 'student' | 'authority';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onStudentLogin,
  onAuthorityLogin,
  defaultMode = 'student',
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'authority'>(defaultMode);

  // Student form state
  const [studentId, setStudentId] = useState('STU-2024-0418');
  const [studentName, setStudentName] = useState('Nikhil Saxena');
  const [hostelBlock, setHostelBlock] = useState<HostelBlock>('MH-1');
  const [roomNumber, setRoomNumber] = useState('B-309');

  // Authority form state
  const [authorityRole, setAuthorityRole] = useState('Mess Warden (Dr. A. Verma)');
  const [authorityUsername, setAuthorityUsername] = useState('warden.mess');
  const [authorityPin, setAuthorityPin] = useState('mess2026');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;

    onStudentLogin({
      studentId: studentId.trim().toUpperCase(),
      name: studentName.trim() || undefined,
      hostelBlock,
      roomNumber: roomNumber.trim() || undefined,
    });
  };

  const handleAuthoritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Simple validation for prototype / production demo
    if (!authorityUsername.trim()) {
      setAuthError('Please enter Authority Username or Staff ID.');
      return;
    }

    onAuthorityLogin({
      username: authorityUsername.trim(),
      role: authorityRole,
      title: authorityRole,
    });
  };

  const fillQuickStudent = (id: string, name: string, block: HostelBlock, room: string) => {
    setStudentId(id);
    setStudentName(name);
    setHostelBlock(block);
    setRoomNumber(room);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex flex-col items-center justify-center p-4 selection:bg-[#516b45] selection:text-white">
      {/* Brand Header */}
      <div className="max-w-md w-full text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#516b45] text-white shadow-md mb-3">
          <img
            src="/assets/aistudio/favicon_9450694d.svg"
            alt="Messwise Icon"
            className="w-8 h-8 object-contain"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2d241d]">
          Messwise
        </h1>
        <p className="text-xs sm:text-sm text-[#7a6350] mt-1">
          Hostel Mess Feedback, Daily Menu & Authority Analytics
        </p>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#ded5cb] shadow-sm overflow-hidden">
        {/* Dual Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-[#f4f6f3] border-b border-[#ded5cb]">
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`py-2.5 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'student'
                ? 'bg-white text-[#2d241d] shadow-xs border border-[#ccd8ca]'
                : 'text-[#7a6350] hover:text-[#2d241d]'
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#516b45]" />
            <span>Student Login</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('authority')}
            className={`py-2.5 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'authority'
                ? 'bg-white text-[#2d241d] shadow-xs border border-[#ccd8ca]'
                : 'text-[#7a6350] hover:text-[#2d241d]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#d97706]" />
            <span>Authority Login</span>
          </button>
        </div>

        <div className="p-6">
          {/* STUDENT LOGIN FORM */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#42352b] mb-1">
                  Student ID / Roll No. *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#ab9582] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. STU-2024-0418"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#ccd8ca] bg-[#fdfdfc] text-[#2d241d] focus:outline-none focus:ring-2 focus:ring-[#516b45] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#42352b] mb-1">
                  Student Name <span className="text-[#ab9582] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Nikhil Saxena"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#ccd8ca] bg-[#fdfdfc] text-[#2d241d] focus:outline-none focus:ring-2 focus:ring-[#516b45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#42352b] mb-1">
                  Hostel Block * <span className="text-[#7a6350] font-normal">(Select your block)</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#ab9582] absolute left-3 top-2.5 pointer-events-none" />
                  <select
                    value={hostelBlock}
                    onChange={(e) => setHostelBlock(e.target.value as HostelBlock)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#ccd8ca] bg-white text-[#2d241d] font-semibold focus:outline-none focus:ring-2 focus:ring-[#516b45]"
                  >
                    {HOSTEL_BLOCK_OPTIONS.map((blk) => (
                      <option key={blk} value={blk}>
                        Hostel {blk}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-[#7a6350] mt-1">
                  Available blocks: LH-1, LH-2, LH-3, MH-1, MH-2, MH-3, MH-4
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#42352b] mb-1">
                  Room No. <span className="text-[#ab9582] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. B-309 or 214"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#ccd8ca] bg-[#fdfdfc] text-[#2d241d] focus:outline-none focus:ring-2 focus:ring-[#516b45]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#516b45] hover:bg-[#415538] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-2"
              >
                <span>Enter Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo quick accounts */}
              <div className="pt-3 border-t border-[#eee9e3]">
                <span className="text-[11px] font-semibold text-[#7a6350] block mb-1.5">
                  Quick Demo Student Switcher:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillQuickStudent('STU-2024-0418', 'Nikhil Saxena', 'MH-1', 'B-309')}
                    className="text-[11px] px-2 py-1 rounded-lg bg-[#f4f6f3] hover:bg-[#e5ece3] text-[#415538] border border-[#ccd8ca] cursor-pointer"
                  >
                    Nikhil (MH-1)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickStudent('STU-2024-0382', 'Ananya Sharma', 'LH-1', 'A-108')}
                    className="text-[11px] px-2 py-1 rounded-lg bg-[#f4f6f3] hover:bg-[#e5ece3] text-[#415538] border border-[#ccd8ca] cursor-pointer"
                  >
                    Ananya (LH-1)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickStudent('STU-2024-0891', 'Devansh Roy', 'MH-3', 'C-311')}
                    className="text-[11px] px-2 py-1 rounded-lg bg-[#f4f6f3] hover:bg-[#e5ece3] text-[#415538] border border-[#ccd8ca] cursor-pointer"
                  >
                    Devansh (MH-3)
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* AUTHORITY LOGIN FORM */}
          {activeTab === 'authority' && (
            <form onSubmit={handleAuthoritySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#42352b] mb-1">
                  Designation / Authority Role *
                </label>
                <select
                  value={authorityRole}
                  onChange={(e) => setAuthorityRole(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#ccd8ca] bg-white text-[#2d241d] font-medium focus:outline-none focus:ring-2 focus:ring-[#7a6350]"
                >
                  <option value="Mess Warden (Dr. A. Verma)">Mess Warden (Dr. A. Verma)</option>
                  <option value="Hostel Administrator">Hostel Administrator</option>
                  <option value="Catering Supervisor (M. Ansari)">Catering Supervisor (M. Ansari)</option>
                  <option value="Student Mess Committee Representative">Student Mess Committee Representative</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#42352b] mb-1">
                  Authority Username / Staff ID *
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-[#ab9582] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={authorityUsername}
                    onChange={(e) => setAuthorityUsername(e.target.value)}
                    placeholder="e.g. warden.verma"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#ccd8ca] bg-[#fdfdfc] text-[#2d241d] focus:outline-none focus:ring-2 focus:ring-[#7a6350]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#42352b] mb-1">
                  Access Passcode / PIN *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#ab9582] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={authorityPin}
                    onChange={(e) => setAuthorityPin(e.target.value)}
                    placeholder="Enter PIN"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#ccd8ca] bg-[#fdfdfc] text-[#2d241d] focus:outline-none focus:ring-2 focus:ring-[#7a6350]"
                  />
                </div>
                <span className="text-[11px] text-[#7a6350] mt-1 block">
                  Default demonstration passcode: <code className="bg-[#eee9e3] px-1 rounded font-mono">mess2026</code>
                </span>
              </div>

              {authError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#42352b] hover:bg-[#2d241d] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-2"
              >
                <span>Access Authority Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3 rounded-xl bg-[#fef3c7] border border-[#fbbf24]/50 text-[#92400e] text-[11px] leading-relaxed">
                <span className="font-semibold block mb-0.5">Authority Access Includes:</span>
                • Food Quality & Ratings Analytics<br />
                • Unified Actions Tracking (Completed, In Progress, Not Resolved)<br />
                • Full CSV Export & Daily Menus
              </div>
            </form>
          )}
        </div>
      </div>

      <p className="text-[11px] text-[#7a6350] mt-6">
        Hostel Mess Feedback & Food Quality Monitoring System · Sage & Walnut Theme
      </p>
    </div>
  );
};
