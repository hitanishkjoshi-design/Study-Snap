
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Camera, 
  Database, 
  Youtube, 
  BookOpen, 
  LogOut,
  Search,
  Menu,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  User as UserIcon,
  Sun,
  Moon,
  School,
  Edit2,
  Check,
  MessageSquare,
  X,
  Users
} from 'lucide-react';
import { AppRoute } from './types';
import { Scanner } from './components/Scanner';
import { VideoNotes } from './components/VideoNotes';
import { Vault } from './components/Vault';
import { QuestionBank } from './components/QuestionBank';
import { Button } from './components/Button';
import { askQuickTutor } from './services/geminiService';

interface UserData {
  name: string;
  email: string;
  picture: string;
  university: string;
  gender: string;
  given_name?: string;
}

interface VaultDoc {
  id: string;
  name: string;
  type: string;
  size: string;
}

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(() => {
    const saved = localStorage.getItem('studysnap_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [mockName, setMockName] = useState('');
  const [mockUni, setMockUni] = useState('');
  const [mockGender, setMockGender] = useState('Prefer not to say');
  
  const [isEditingUni, setIsEditingUni] = useState(false);
  const [tempUni, setTempUni] = useState('');
  const [showUniPrompt, setShowUniPrompt] = useState(false);

  // Quick Tutor State
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorResponse, setTutorResponse] = useState<string | null>(null);
  const [isTutorLoading, setIsTutorLoading] = useState(false);

  // Shared Vault State
  const [vaultDocs, setVaultDocs] = useState<VaultDoc[]>([
    { id: '1', name: 'Course_Guide_ADS_2024.pdf', type: 'Policy', size: '1.2 MB' },
    { id: '2', name: 'Exam_Maths_II_2023.pdf', type: 'Exam', size: '0.8 MB' },
    { id: '3', name: 'DBMS_Unit_1_Notes.pdf', type: 'Notes', size: '2.1 MB' },
  ]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('studysnap_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('studysnap_user');
    }
  }, [user]);

  const vaultContext = useMemo(() => {
    return vaultDocs.map(d => d.name).join(", ");
  }, [vaultDocs]);

  const handleAskTutor = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tutorQuery.trim() || !user) return;
    
    setIsTutorLoading(true);
    try {
      const resp = await askQuickTutor(tutorQuery, user.university);
      setTutorResponse(resp || "I couldn't find an answer for that right now.");
    } catch (err) {
      setTutorResponse("Sorry, there was an error reaching the AI tutor.");
    } finally {
      setIsTutorLoading(false);
    }
  };

  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>();
    (vaultDocs || []).forEach(doc => {
      const name = (doc.name || "").toUpperCase();
      if (/ADS|ALGO|DATA STRUCTURE/i.test(name)) subjects.add('ADS');
      if (/MATH|CALCULUS|MATHEMATICS/i.test(name)) subjects.add('Maths II');
      if (/DBMS|DATABASE/i.test(name)) subjects.add('DBMS');
      if (/NETWORK/i.test(name)) subjects.add('Computer Networks');
      if (/OS|OPERATING/i.test(name)) subjects.add('Operating Systems');
      if (/SE|SOFTWARE/i.test(name)) subjects.add('Software Engineering');
    });
    return Array.from(subjects);
  }, [vaultDocs]);
  
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleMockLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockName.trim() || !mockUni.trim()) return;
    const first = mockName.split(' ')[0];
    setUser({
      name: mockName,
      email: `${first.toLowerCase()}@${mockUni.toLowerCase().replace(/\s+/g, '')}.edu`,
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${first}`,
      university: mockUni,
      gender: mockGender,
      given_name: first
    });
  };

  const handleUniPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      setUser({ 
        ...user, 
        university: mockUni || user.university, 
        gender: mockGender || user.gender 
      });
      setShowUniPrompt(false);
      setMockUni('');
      setMockGender('Prefer not to say');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setMockName('');
    setMockUni('');
    setMockGender('Prefer not to say');
    setIsEditingUni(false);
    setCurrentRoute(AppRoute.DASHBOARD);
  };

  const startEditingUni = () => {
    if (user) {
      setTempUni(user.university);
      setIsEditingUni(true);
    }
  };

  const saveUni = () => {
    if (user && tempUni.trim()) {
      setUser({ ...user, university: tempUni });
      setIsEditingUni(false);
    }
  };

  const NavItem: React.FC<{ route: AppRoute; icon: React.ReactNode; label: string }> = ({ route, icon, label }) => (
    <button
      onClick={() => {
        setCurrentRoute(route);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        currentRoute === route 
        ? 'bg-nirma-blue text-white shadow-lg' 
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-nirma-blue dark:hover:text-nirma-blue'
      }`}
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </button>
  );

  const renderContent = () => {
    switch (currentRoute) {
      case AppRoute.SCANNER: return <Scanner vaultContext={vaultContext} />;
      case AppRoute.VIDEO_NOTES: return <VideoNotes />;
      case AppRoute.VAULT: return <Vault docs={vaultDocs} setDocs={setVaultDocs} />;
      case AppRoute.QUESTIONS: return <QuestionBank availableSubjects={availableSubjects} />;
      case AppRoute.DASHBOARD:
      default:
        return (
          <div className="p-8 max-w-6xl mx-auto text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Welcome, {user?.given_name || user?.name.split(' ')[0]}!</h1>
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 italic">
                  <Sparkles size={16} className="text-nirma-orange" />
                  Your academic assistant for {user?.university || 'your university'} is ready.
                </p>
              </div>
              <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <img src={user?.picture} alt={user?.name} className="w-12 h-12 rounded-xl" />
                <div className="pr-4">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{user?.name}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-tight">{user?.gender} • {user?.university || 'Unset University'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { route: AppRoute.SCANNER, icon: Camera, color: 'blue', label: 'Scan-to-Score', desc: 'AI grading for handwritten exam answers.' },
                { route: AppRoute.VIDEO_NOTES, icon: Youtube, color: 'red', label: 'Video-to-Notes', desc: 'Structured study guides from lectures.' },
                { route: AppRoute.VAULT, icon: Database, color: 'orange', label: 'Study Vault', desc: 'Central storage for your textbooks & papers.' },
                { route: AppRoute.QUESTIONS, icon: BookOpen, color: 'green', label: 'Question Bank', desc: 'High-probability questions and solutions.' }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => setCurrentRoute(item.route)} 
                  className="cursor-pointer group bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl dark:hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
                    item.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-nirma-blue' :
                    item.color === 'red' ? 'bg-red-50 dark:bg-red-900/30 text-red-500' :
                    item.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/30 text-nirma-orange' :
                    'bg-green-50 dark:bg-green-900/30 text-green-500'
                  }`}>
                    <item.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 dark:text-white">{item.label}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{item.desc}</p>
                  <ArrowRight size={20} className="text-gray-300 dark:text-slate-600 group-hover:translate-x-2 transition-all" />
                </div>
              ))}
            </div>

            {/* AI Tutor Assistant Section */}
            <div className="mt-12 bg-nirma-blue rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="text-nirma-orange" />
                      AI Tutor Assistant
                    </h2>
                    <p className="text-blue-100 mb-6">Ask about your {user?.university || 'curriculum'} or get help with difficult concepts.</p>
                    <form onSubmit={handleAskTutor} className="flex gap-2">
                      <input 
                        value={tutorQuery}
                        onChange={(e) => setTutorQuery(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none w-full placeholder:text-blue-200 focus:bg-white/20 transition-all"
                        placeholder="Explain quantum physics like I'm five..."
                      />
                      <Button variant="accent" type="submit" isLoading={isTutorLoading}>
                        Ask Tutor
                      </Button>
                    </form>
                    
                    {tutorResponse && (
                      <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 relative animate-in fade-in slide-in-from-top-4 duration-300">
                        <button 
                          onClick={() => setTutorResponse(null)}
                          className="absolute top-2 right-2 text-white/50 hover:text-white"
                        >
                          <X size={16} />
                        </button>
                        <div className="flex gap-3">
                          <MessageSquare className="text-nirma-orange shrink-0" size={20} />
                          <p className="text-sm leading-relaxed">{tutorResponse}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-4 bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20 hidden md:flex">
                    <ShieldCheck size={40} className="text-nirma-orange" />
                    <div className="text-center">
                      <p className="font-bold">Privacy Guaranteed</p>
                      <p className="text-xs text-blue-100">Your study material is yours alone</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        );
    }
  };

  if (!user || showUniPrompt) {
    return (
      <div className="min-h-screen bg-nirma-bg dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-10 border border-gray-100 dark:border-slate-800 text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">StudySnap <span className="text-nirma-orange">AI</span></h1>
            <p className="text-gray-500 dark:text-gray-400">Your Intelligent Campus Companion</p>
          </div>
          
          <div className="space-y-6">
            {showUniPrompt ? (
              <form onSubmit={handleUniPromptSubmit} className="w-full space-y-4 text-left">
                <div className="mb-4">
                  <h2 className="text-lg font-bold dark:text-white mb-1">Welcome, {user?.name}!</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Please complete your profile to customize your experience.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-1 ml-1">University Name</label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={mockUni}
                      onChange={(e) => setMockUni(e.target.value)}
                      placeholder="e.g. Nirma University"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-nirma-blue outline-none transition-all"
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-1 ml-1">Gender</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                      value={mockGender}
                      onChange={(e) => setMockGender(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-nirma-blue outline-none transition-all appearance-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <Button fullWidth type="submit">Complete Setup</Button>
              </form>
            ) : (
              <form onSubmit={handleMockLoginSubmit} className="w-full space-y-4 text-left">
                <div className="mb-4 text-center">
                  <h2 className="text-lg font-bold dark:text-white mb-1">Create Your Account</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Enter your details to access your workspace.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-1 ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={mockName}
                      onChange={(e) => setMockName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-nirma-blue outline-none transition-all"
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-1 ml-1">University Name</label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={mockUni}
                      onChange={(e) => setMockUni(e.target.value)}
                      placeholder="Nirma University"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-nirma-blue outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-1 ml-1">Gender</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                      value={mockGender}
                      onChange={(e) => setMockGender(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-nirma-blue outline-none transition-all appearance-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <Button fullWidth type="submit">Enter Workspace</Button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-nirma-bg dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-300">
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700"
      >
        <Menu size={24} className="dark:text-white" />
      </button>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 p-6 transition-transform duration-300 transform
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 mb-10 px-2 text-left">
          <span className="text-xl font-bold tracking-tight dark:text-white text-gray-900">StudySnap <span className="text-nirma-orange">AI</span></span>
        </div>

        <nav className="space-y-2 flex-grow">
          <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest px-4 mb-2 text-left">Main Menu</p>
          <NavItem route={AppRoute.DASHBOARD} icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem route={AppRoute.SCANNER} icon={<Camera size={20} />} label="Scan-to-Score" />
          <NavItem route={AppRoute.VIDEO_NOTES} icon={<Youtube size={20} />} label="Video-to-Notes" />
          <NavItem route={AppRoute.VAULT} icon={<Database size={20} />} label="Study Vault" />
          <NavItem route={AppRoute.QUESTIONS} icon={<BookOpen size={20} />} label="Question Bank" />
        </nav>

        <div className="mt-auto pt-6 text-left">
          <div className="mb-4 px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 group relative">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase">My University</p>
              {!isEditingUni ? (
                <button onClick={startEditingUni} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-nirma-blue">
                  <Edit2 size={12} />
                </button>
              ) : (
                <button onClick={saveUni} className="text-green-500 hover:text-green-600">
                  <Check size={14} />
                </button>
              )}
            </div>
            {isEditingUni ? (
              <input 
                value={tempUni}
                onChange={(e) => setTempUni(e.target.value)}
                onBlur={saveUni}
                onKeyDown={(e) => e.key === 'Enter' && saveUni()}
                className="bg-white dark:bg-slate-700 w-full text-xs font-bold text-gray-700 dark:text-gray-200 outline-none p-1 rounded"
                autoFocus
              />
            ) : (
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">{user.university}</p>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-grow overflow-y-auto bg-nirma-bg dark:bg-slate-950 relative">
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <div className="sticky top-0 z-20 bg-nirma-bg/80 dark:bg-slate-950/80 backdrop-blur-md px-8 py-4 flex flex-row items-center justify-between">
          <div className="relative max-w-md w-full hidden lg:block text-left">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
            <input 
              placeholder="Search in Vault..." 
              className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-900 dark:text-white rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm focus:ring-2 focus:ring-nirma-blue outline-none transition-all"
            />
          </div>

          <div className="lg:hidden flex-grow text-left pl-10 md:pl-0 font-bold text-gray-400 text-sm truncate max-w-[150px]">
            {user.university}
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm text-gray-600 dark:text-gray-300 hover:text-nirma-blue transition-colors flex items-center justify-center"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{user.name}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">{user.gender}</span>
              </div>
              <img src={user.picture} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-md" alt="" />
            </div>
          </div>
        </div>

        <div className="pb-12">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
