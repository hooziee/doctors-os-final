import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, getDoc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { Target, DollarSign, BrainCircuit, Shield, BookOpen, Edit, Trash2, Plus, MoreVertical, X, Check, Save, FileDown, Play, Pause, RotateCcw, TrendingUp, Menu, Settings } from 'lucide-react';

// --- Firebase Configuration ---
// This configuration will be replaced by the environment's provided config.
const firebaseConfig = {
  apiKey: "AIzaSyCycH-7M8-gVS3frGL_NRyU74nFkQ8tnjw",
  authDomain: "polymath-os-app.firebaseapp.com",
  projectId: "polymath-os-app",
  storageBucket: "polymath-os-app.firebasestorage.app",
  messagingSenderId: "630169596916",
  appId: "1:630169596916:web:e6cb20d7dfef1f95693fa1"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- App ID ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-life-os';

// --- Main App Component ---
export default function App() {
    const [view, setView] = useState('dashboard');
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                        await signInWithCustomToken(auth, __initial_auth_token);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Authentication Error:", error);
                }
            }
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    const renderView = () => {
        if (!isAuthReady || !userId) {
            return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div></div>;
        }

        switch (view) {
            case 'dashboard': return <Dashboard userId={userId} />;
            case 'goals': return <Goals userId={userId} />;
            case 'habits': return <HabitTracker userId={userId} />;
            case 'journal': return <Journal userId={userId} />;
            case 'knowledge': return <KnowledgeVault userId={userId} />;
            case 'pomodoro': return <PomodoroTimer />;
            case 'settings': return <SettingsView userId={userId} />;
            default: return <Dashboard userId={userId} />;
        }
    };
    
    const NavLink = ({ viewName, icon: Icon, label }) => (
        <button
            onClick={() => { setView(viewName); setIsMobileMenuOpen(false); }}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${view === viewName ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        >
            <Icon className="w-5 h-5 mr-3" />
            {label}
        </button>
    );

    return (
        <div className="bg-gray-900 text-white font-sans flex flex-col md:flex-row min-h-screen">
             {/* Sidebar Navigation */}
            <aside className={`fixed top-0 left-0 h-full bg-gray-800 border-r border-gray-700 w-64 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30`}>
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-700">
                        <h1 className="text-xl font-bold text-white">Doctor's Life OS</h1>
                    </div>
                    <nav className="flex-grow p-4 space-y-2">
                        <NavLink viewName="dashboard" icon={Target} label="Dashboard" />
                        <NavLink viewName="goals" icon={TrendingUp} label="Goals & Milestones" />
                        <NavLink viewName="habits" icon={Check} label="Habit Tracker" />
                        <NavLink viewName="journal" icon={BookOpen} label="Journal" />
                        <NavLink viewName="knowledge" icon={BrainCircuit} label="Knowledge Vault" />
                        <NavLink viewName="pomodoro" icon={Play} label="Pomodoro Timer" />
                        <NavLink viewName="settings" icon={Settings} label="Settings" />
                    </nav>
                    <footer className="p-4 mt-auto border-t border-gray-700 text-center text-xs text-gray-500">
                        <p>Made by Doctor Huseyin Turacli</p>
                    </footer>
                </div>
            </aside>
            
            {/* Mobile Header */}
            <header className="md:hidden sticky top-0 bg-gray-800 p-4 z-20 flex justify-between items-center border-b border-gray-700">
                <h1 className="text-lg font-bold">Doctor's Life OS</h1>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                {renderView()}
            </main>
        </div>
    );
}

// --- Sound Effect ---
const useSound = (src) => {
    const soundRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && src) {
            soundRef.current = new Audio(src);
            soundRef.current.volume = 0.5;
        }
    }, [src]);

    const play = useCallback(() => {
        if (soundRef.current) {
            soundRef.current.currentTime = 0;
            soundRef.current.play().catch(e => console.error("Sound play failed:", e));
        }
    }, []);

    return play;
};

// --- Helper: Modal Component ---
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-auto">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

// --- 1. Dashboard Component ---
function Dashboard({ userId }) {
    const SHIFT_PATTERNS = [
        { id: 'normalDay', label: 'Normal Day' },
        { id: 'longDay', label: 'Long Day' },
        { id: 'nightShift', label: 'Night Shift' },
        { id: 'weekendShift', label: 'Weekend Shift' },
        { id: 'zeroDay', label: 'Zero Day' },
    ];
    const TASK_CADENCES = ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly'];

    const [shift, setShift] = useState(SHIFT_PATTERNS[0].id);
    const [tasks, setTasks] = useState([]);
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskCadence, setNewTaskCadence] = useState('Daily');
    
    const playPing = useSound("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVhvT18AAAAAA//u/eL0Pj9/AEEDDAcMDw8QDw8PDgQODxAFDg8QDAwMDAcDDgcABg4MAA0ODQ8CDQ4PDwINDA8ACA0MDwQLDA8PDgINAw8DBQ0PDgYLDQ8PDgIMDg8CDQ0PDgMMDg8QDw8PDQ8PDg8ODQ4NDg0ODQ4NDg0ODQ4NDg0ODQ4NDg0ODQ4NDg0ODQ4NDg0ODQ4NDg0ODQ4NDg0PDQ8ODQ4NDg0ODQ4NDg0ODQ4PDg8ODQ4ODg4PDg8ODg4PDg8PDg4PDg4PDg4ODg4ODg4ODg4ODg4ODg4ODg4PDg8ODg4ODg4PDg8ODg4PDg4PDg4ODg4PDg8ODg4PDg4PDg4ODg4PDg8ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4-");

    const tasksCollection = collection(db, 'artifacts', appId, 'users', userId, 'tasks');

    useEffect(() => {
       if (!userId) return;

        // Function to reset tasks based on their cadence
        const resetTasks = async () => {
            const now = new Date();
            const dayOfWeek = now.getDay(); // Sunday - 0, Monday - 1
            const date = now.getDate();
            const nowTime = now.getTime();

            const allTasksQuery = query(collection(db, 'artifacts', appId, 'users', userId, 'tasks'));
            const querySnapshot = await getDocs(allTasksQuery);
            
            const batch = writeBatch(db);
            let needsUpdate = false;

            querySnapshot.forEach(docSnap => {
                const task = docSnap.data();
                const lastReset = task.lastReset ? task.lastReset.toDate() : new Date(0);
                let shouldReset = false;
                
                // Set time to beginning of the day for accurate date comparison
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                const lastResetStart = new Date(lastReset.getFullYear(), lastReset.getMonth(), lastReset.getDate()).getTime();


                switch (task.cadence) {
                    case 'Daily':
                        if (todayStart > lastResetStart) {
                           shouldReset = true;
                        }
                        break;
                    case 'Weekly':
                         // Reset on Mondays
                        if (dayOfWeek === 1 && todayStart > lastResetStart) {
                           shouldReset = true;
                        }
                        break;
                     case 'Bi-Weekly':
                        const diffTime = Math.abs(nowTime - lastReset.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (dayOfWeek === 1 && diffDays >= 14) {
                             shouldReset = true;
                        }
                        break;
                    case 'Monthly':
                         if (date === 1 && todayStart > lastResetStart) {
                             shouldReset = true;
                        }
                        break;
                    default:
                        break;
                }

                if (shouldReset && task.completed) {
                    const taskRef = doc(db, 'artifacts', appId, 'users', userId, 'tasks', docSnap.id);
                    batch.update(taskRef, { completed: false, lastReset: new Date() });
                    needsUpdate = true;
                }
            });

            if (needsUpdate) {
                await batch.commit();
                console.log("Tasks have been reset.");
            }
        };
        
        resetTasks();

        // Set up the listener for tasks
        const q = query(tasksCollection);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTasks(fetchedTasks);
        });

        return () => unsubscribe();
    }, [userId]);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (newTaskText.trim() === '') return;
        try {
            await addDoc(tasksCollection, {
                text: newTaskText,
                cadence: newTaskCadence,
                shiftPattern: shift,
                completed: false,
                createdAt: new Date(),
                lastReset: new Date(),
            });
            setNewTaskText('');
        } catch (error) {
            console.error("Error adding task: ", error);
        }
    };

    const handleToggleTask = async (task) => {
        playPing();
        const taskRef = doc(db, 'artifacts', appId, 'users', userId, 'tasks', task.id);
        try {
            await updateDoc(taskRef, { completed: !task.completed });
        } catch (error) {
            console.error("Error updating task: ", error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        const taskRef = doc(db, 'artifacts', appId, 'users', userId, 'tasks', taskId);
        try {
            await deleteDoc(taskRef);
        } catch (error) {
            console.error("Error deleting task: ", error);
        }
    };

    const filteredTasks = tasks.filter(task => task.shiftPattern === shift);

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">Dashboard</h2>
            <div className="mb-6">
                <label htmlFor="shift-select" className="block text-sm font-medium text-gray-400 mb-2">Select Shift Pattern</label>
                <select 
                    id="shift-select" 
                    value={shift} 
                    onChange={(e) => setShift(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    {SHIFT_PATTERNS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
            </div>

            <form onSubmit={handleAddTask} className="mb-8 p-4 bg-gray-800 rounded-lg flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-grow bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                 <select 
                    value={newTaskCadence} 
                    onChange={(e) => setNewTaskCadence(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    {TASK_CADENCES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Plus size={18}/> Add Task
                </button>
            </form>

            {TASK_CADENCES.map(cadence => {
                const cadenceTasks = filteredTasks.filter(t => t.cadence === cadence);
                if (cadenceTasks.length === 0) return null;
                return (
                    <div key={cadence} className="mb-8">
                        <h3 className="text-xl font-semibold text-red-400 mb-4 border-b-2 border-gray-700 pb-2">{cadence}</h3>
                        <ul className="space-y-3">
                            {cadenceTasks.map(task => (
                                <li key={task.id} className={`flex items-center bg-gray-800 p-3 rounded-lg shadow transition-all duration-300 ${task.completed ? 'opacity-50' : ''}`}>
                                    <button onClick={() => handleToggleTask(task)} className="flex-shrink-0">
                                        <div className={`w-6 h-6 rounded-full border-2 ${task.completed ? 'border-red-500 bg-red-500' : 'border-gray-500'} flex items-center justify-center mr-4 transition-all`}>
                                            {task.completed && <Check size={16} className="text-white"/>}
                                        </div>
                                    </button>
                                    <span className={`flex-grow ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>{task.text}</span>
                                    <button onClick={() => handleDeleteTask(task.id)} className="ml-4 text-gray-500 hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            })}
             {filteredTasks.length === 0 && (
                <div className="text-center py-10 px-4 bg-gray-800 rounded-lg">
                    <p className="text-gray-400">No tasks for this shift pattern.</p>
                    <p className="text-gray-500 text-sm mt-2">Add a task above to get started.</p>
                </div>
            )}
        </div>
    );
}


// --- 2. Goals & Milestones Component ---
function Goals({ userId }) {
    const [goals, setGoals] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGoal, setCurrentGoal] = useState(null); // for editing goal title
    
    const goalsCollection = collection(db, 'artifacts', appId, 'users', userId, 'goals');
    
    const initialGoals = [
        { id: 'career', title: 'Career: Become a T&O Surgeon', milestones: [] },
        { id: 'financial', title: 'Financial: Become a Millionaire', milestones: [] },
        { id: 'spiritual', title: 'Spiritual: Become a Hafiz', milestones: [] },
        { id: 'personal', title: 'Personal: Master Self-Defence', milestones: [] },
    ];

    // Initialize goals if they don't exist
    useEffect(() => {
        if (!userId) return;
        const initGoals = async () => {
            for (const goal of initialGoals) {
                const goalRef = doc(db, 'artifacts', appId, 'users', userId, 'goals', goal.id);
                const docSnap = await getDoc(goalRef);
                if (!docSnap.exists()) {
                    await setDoc(goalRef, { title: goal.title, milestones: goal.milestones });
                }
            }
        };
        initGoals();

        const unsubscribe = onSnapshot(goalsCollection, (snapshot) => {
            const fetchedGoals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Ensure order
            const orderedGoals = initialGoals.map(ig => fetchedGoals.find(fg => fg.id === ig.id) || { ...ig, title: fetchedGoals.find(f=>f.id === ig.id)?.title || ig.title });
            setGoals(orderedGoals);
        });

        return () => unsubscribe();
    }, [userId]);

    const handleAddMilestone = async (goalId, text) => {
        if (text.trim() === '') return;
        const goalRef = doc(db, 'artifacts', appId, 'users', userId, 'goals', goalId);
        const goal = goals.find(g => g.id === goalId);
        const newMilestone = { text, status: 'Not Started', id: crypto.randomUUID() };
        await updateDoc(goalRef, { milestones: [...(goal.milestones || []), newMilestone] });
    };

    const handleUpdateMilestoneStatus = async (goalId, milestoneId, newStatus) => {
        const goalRef = doc(db, 'artifacts', appId, 'users', userId, 'goals', goalId);
        const goal = goals.find(g => g.id === goalId);
        const updatedMilestones = goal.milestones.map(m => m.id === milestoneId ? { ...m, status: newStatus } : m);
        await updateDoc(goalRef, { milestones: updatedMilestones });
    };

    const handleDeleteMilestone = async (goalId, milestoneId) => {
        const goalRef = doc(db, 'artifacts', appId, 'users', userId, 'goals', goalId);
        const goal = goals.find(g => g.id === goalId);
        const updatedMilestones = goal.milestones.filter(m => m.id !== milestoneId);
        await updateDoc(goalRef, { milestones: updatedMilestones });
    };
    
    const handleUpdateGoalTitle = async (e) => {
        e.preventDefault();
        if (!currentGoal || currentGoal.title.trim() === '') return;
        const goalRef = doc(db, 'artifacts', appId, 'users', userId, 'goals', currentGoal.id);
        await updateDoc(goalRef, { title: currentGoal.title });
        setIsModalOpen(false);
        setCurrentGoal(null);
    };

    const openEditModal = (goal) => {
        setCurrentGoal({ ...goal });
        setIsModalOpen(true);
    };
    
    const MilestoneItem = ({ goalId, milestone }) => {
        const statuses = ['Not Started', 'In Progress', 'Completed'];
        const statusColors = {
            'Not Started': 'bg-gray-600',
            'In Progress': 'bg-yellow-500',
            'Completed': 'bg-green-500',
        };

        return (
            <li className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                <span className="text-gray-300">{milestone.text}</span>
                <div className="flex items-center gap-2">
                    <select
                        value={milestone.status}
                        onChange={(e) => handleUpdateMilestoneStatus(goalId, milestone.id, e.target.value)}
                        className={`text-xs text-white rounded px-2 py-1 border-none outline-none ${statusColors[milestone.status]}`}
                    >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => handleDeleteMilestone(goalId, milestone.id)} className="text-gray-500 hover:text-red-500">
                        <Trash2 size={16}/>
                    </button>
                </div>
            </li>
        );
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">Goals & Milestones</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {goals.map((goal) => {
                    const milestones = goal.milestones || [];
                    const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
                    const totalMilestones = milestones.length;
                    const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
                    return (
                        <div key={goal.id} className="bg-gray-800 rounded-lg p-5 shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                               <h3 className="text-xl font-semibold text-red-400 w-5/6">{goal.title}</h3>
                                <button onClick={() => openEditModal(goal)} className="text-gray-400 hover:text-white"><Edit size={18} /></button>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                                <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p className="text-sm text-gray-400 mb-4">{completedMilestones} of {totalMilestones} milestones completed.</p>
                            <ul className="space-y-2 mb-4">
                                {milestones.map(m => <MilestoneItem key={m.id} goalId={goal.id} milestone={m}/>)}
                            </ul>
                            <form onSubmit={(e) => { e.preventDefault(); handleAddMilestone(goal.id, e.target.elements.milestone.value); e.target.elements.milestone.value = ''; }} className="flex gap-2">
                                <input name="milestone" type="text" placeholder="New milestone..." className="flex-grow bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"/>
                                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold p-2 rounded-lg flex items-center justify-center transition-colors"><Plus size={20}/></button>
                            </form>
                        </div>
                    )
                })}
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Goal Title">
                {currentGoal && (
                    <form onSubmit={handleUpdateGoalTitle}>
                        <input
                            type="text"
                            value={currentGoal.title}
                            onChange={(e) => setCurrentGoal({ ...currentGoal, title: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 mb-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <div className="flex justify-end">
                            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"><Save size={18}/> Save</button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}


// --- 3. Habit Tracker Component ---
function HabitTracker({ userId }) {
    const [habits, setHabits] = useState([]);
    const [newHabitText, setNewHabitText] = useState('');
    const habitsCollection = collection(db, 'artifacts', appId, 'users', userId, 'habits');

    useEffect(() => {
        if (!userId) return;
        const unsubscribe = onSnapshot(habitsCollection, (snapshot) => {
            const fetchedHabits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setHabits(fetchedHabits);
        });
        return () => unsubscribe();
    }, [userId]);

    const handleAddHabit = async (e) => {
        e.preventDefault();
        if (newHabitText.trim() === '') return;
        await addDoc(habitsCollection, {
            text: newHabitText,
            streak: 0,
            lastCompleted: null,
            createdAt: new Date(),
        });
        setNewHabitText('');
    };

    const handleToggleHabit = async (habit) => {
        const today = new Date().toISOString().split('T')[0];
        const habitRef = doc(db, 'artifacts', appId, 'users', userId, 'habits', habit.id);
        
        // Don't allow un-checking for today once checked
        if (habit.lastCompleted === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        let newStreak = 1;
        if (habit.lastCompleted === yesterdayStr) {
            newStreak = habit.streak + 1;
        }

        await updateDoc(habitRef, {
            lastCompleted: today,
            streak: newStreak,
        });
    };
    
    const handleDeleteHabit = async (habitId) => {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'habits', habitId));
    };
    
    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">Habit Tracker</h2>
            <form onSubmit={handleAddHabit} className="mb-8 p-4 bg-gray-800 rounded-lg flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    value={newHabitText}
                    onChange={(e) => setNewHabitText(e.target.value)}
                    placeholder="Add a new habit to track..."
                    className="flex-grow bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Plus size={18}/> Add Habit
                </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {habits.map(habit => {
                    const today = new Date().toISOString().split('T')[0];
                    const isCompletedToday = habit.lastCompleted === today;
                    return (
                        <div key={habit.id} className="bg-gray-800 p-4 rounded-lg flex flex-col justify-between items-center shadow-lg">
                             <button onClick={() => handleDeleteHabit(habit.id)} className="self-end text-gray-500 hover:text-red-500 transition-colors">
                                <Trash2 size={16} />
                            </button>
                            <p className="text-center text-gray-300 mb-4 h-14">{habit.text}</p>
                            <button onClick={() => handleToggleHabit(habit)} disabled={isCompletedToday} className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all ${isCompletedToday ? 'bg-green-500 border-green-400 cursor-not-allowed' : 'bg-gray-700 border-gray-600 hover:border-red-500'}`}>
                                {isCompletedToday ? <Check size={32} /> : <div className="w-4 h-4 rounded-full bg-gray-500"></div>}
                            </button>
                            <div className="mt-4 text-center">
                                <p className="text-2xl font-bold text-red-400">{habit.streak}</p>
                                <p className="text-sm text-gray-400">Day Streak</p>
                            </div>
                        </div>
                    );
                })}
                 {habits.length === 0 && (
                    <div className="col-span-full text-center py-10 px-4 bg-gray-800 rounded-lg">
                        <p className="text-gray-400">No habits yet.</p>
                        <p className="text-gray-500 text-sm mt-2">Add a habit above to start building streaks.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- 4. Journal Component ---
function Journal({ userId }) {
    const defaultQuestions = [
        "What was my biggest win today?",
        "What did I learn?",
        "How could I have made today better?",
        "What am I grateful for?"
    ];

    const [questions, setQuestions] = useState(defaultQuestions);
    const [entry, setEntry] = useState(null);
    const [responses, setResponses] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [allEntries, setAllEntries] = useState([]);

    const journalSettingsRef = doc(db, 'artifacts', appId, 'users', userId, 'journalSettings', 'questions');
    const entriesCollection = collection(db, 'artifacts', appId, 'users', userId, 'journalEntries');

    useEffect(() => {
        if (!userId) return;
        
        // Fetch questions
        const unsubQuestions = onSnapshot(journalSettingsRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().questions) {
                setQuestions(docSnap.data().questions);
            } else {
                setDoc(journalSettingsRef, { questions: defaultQuestions });
            }
        });

        // Fetch all entries for export
        const unsubAllEntries = onSnapshot(entriesCollection, (snapshot) => {
            const fetchedEntries = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
            setAllEntries(fetchedEntries.sort((a, b) => new Date(b.date) - new Date(a.date)));
        });

        return () => {
            unsubQuestions();
            unsubAllEntries();
        };
    }, [userId]);

    useEffect(() => {
         if (!userId) return;
        const entryRef = doc(db, 'artifacts', appId, 'users', userId, 'journalEntries', selectedDate);
        const unsubscribe = onSnapshot(entryRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setEntry(data);
                setResponses(data.responses || {});
            } else {
                setEntry(null);
                const initialResponses = {};
                questions.forEach(q => initialResponses[q] = '');
                setResponses(initialResponses);
            }
        });
        return () => unsubscribe();
    }, [userId, selectedDate, questions]);
    
    const handleResponseChange = (question, answer) => {
        setResponses(prev => ({ ...prev, [question]: answer }));
    };

    const handleSaveEntry = async () => {
        const entryRef = doc(db, 'artifacts', appId, 'users', userId, 'journalEntries', selectedDate);
        await setDoc(entryRef, {
            date: selectedDate,
            responses: responses
        }, { merge: true });
    };

    const exportToCSV = () => {
        if(allEntries.length === 0) return;

        const allQuestions = [...new Set(allEntries.flatMap(entry => Object.keys(entry.responses || {})))];
        const headers = ['date', ...allQuestions];
        const csvRows = [headers.join(',')];

        allEntries.forEach(entry => {
            const values = [entry.date];
            allQuestions.forEach(header => {
                const response = entry.responses[header] || '';
                values.push(`"${response.replace(/"/g, '""')}"`);
            });
            csvRows.push(values.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'journal_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-white">Journal</h2>
                <div className="flex items-center gap-4">
                    <input 
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                     <button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                        <FileDown size={18}/> Export All (CSV)
                    </button>
                </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-200">Entry for {new Date(selectedDate + 'T00:00:00').toLocaleDateString()}</h3>
                <div className="space-y-6">
                    {questions.map((q, index) => (
                        <div key={index}>
                            <label className="block text-md font-medium text-red-400 mb-2">{q}</label>
                            <textarea
                                value={responses[q] || ''}
                                onChange={(e) => handleResponseChange(q, e.target.value)}
                                rows="4"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                            ></textarea>
                        </div>
                    ))}
                </div>
                <div className="mt-6 text-right">
                    <button onClick={handleSaveEntry} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors float-right">
                        <Save size={18}/> Save Entry
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- 5. Knowledge Vault Component ---
function KnowledgeVault({ userId }) {
    const [notes, setNotes] = useState([]);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [newNoteTags, setNewNoteTags] = useState('');
    const [filterTag, setFilterTag] = useState('');
    
    const notesCollection = collection(db, 'artifacts', appId, 'users', userId, 'notes');
    
    useEffect(() => {
        if (!userId) return;
        let q = query(notesCollection);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let fetchedNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            if (filterTag) {
                fetchedNotes = fetchedNotes.filter(note => note.tags && note.tags.includes(filterTag));
            }

            setNotes(fetchedNotes.sort((a,b) => b.createdAt.toDate() - a.createdAt.toDate()));
        });
        return () => unsubscribe();
    }, [userId, filterTag]);

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (newNoteContent.trim() === '') return;
        const tagsArray = newNoteTags.split(',').map(t => t.trim().replace(/#/g, '')).filter(Boolean);
        await addDoc(notesCollection, {
            content: newNoteContent,
            tags: tagsArray,
            createdAt: new Date(),
        });
        setNewNoteContent('');
        setNewNoteTags('');
    };

    const handleDeleteNote = async (noteId) => {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'notes', noteId));
    };

    const allTags = [...new Set(notes.flatMap(n => n.tags || []))];

    const exportToCSV = () => {
        if(notes.length === 0) return;
        const headers = ['content', 'tags', 'createdAt'];
        const csvRows = [headers.join(',')];
        
        notes.forEach(note => {
            const values = [
                `"${note.content.replace(/"/g, '""')}"`,
                `"${(note.tags || []).join(', ')}"`,
                note.createdAt.toDate().toISOString()
            ];
            csvRows.push(values.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'knowledge_vault_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">Knowledge Vault</h2>
            <div className="bg-gray-800 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-semibold text-red-400 mb-4">Add a New Note</h3>
                <form onSubmit={handleAddNote} className="space-y-4">
                     <textarea
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder="Capture an idea or information..."
                        rows="4"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    ></textarea>
                     <input
                        type="text"
                        value={newNoteTags}
                        onChange={(e) => setNewNoteTags(e.target.value)}
                        placeholder="Tags (comma-separated, e.g., Surgery, Business)"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                        <Save size={18}/> Add Note
                    </button>
                </form>
            </div>
             <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="tag-filter" className="text-gray-400">Filter by Tag:</label>
                    <select id="tag-filter" value={filterTag} onChange={e => setFilterTag(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg py-1 px-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="">All</option>
                        {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                    </select>
                </div>
                <button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <FileDown size={18}/> Export All (CSV)
                </button>
            </div>
            <div className="space-y-4">
                {notes.map(note => (
                    <div key={note.id} className="bg-gray-800 p-4 rounded-lg shadow">
                        <p className="text-gray-300 mb-3 whitespace-pre-wrap">{note.content}</p>
                        <div className="flex justify-between items-end">
                            <div className="flex flex-wrap gap-2">
                                {(note.tags || []).map(tag => <span key={tag} className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded-full">{tag}</span>)}
                            </div>
                            <button onClick={() => handleDeleteNote(note.id)} className="text-gray-500 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
                {notes.length === 0 && (
                    <div className="text-center py-10 px-4 bg-gray-800 rounded-lg">
                        <p className="text-gray-400">{filterTag ? `No notes with the tag "${filterTag}".` : 'Your vault is empty.'}</p>
                         <p className="text-gray-500 text-sm mt-2">Add a note above to start building your second brain.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- 6. Pomodoro Timer Component ---
function PomodoroTimer() {
    const [workMinutes, setWorkMinutes] = useState(25);
    const [breakMinutes, setBreakMinutes] = useState(5);
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);

    const alarmSound = useSound("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVhvT18AAAAAA//u/eL0Pj9/AEEDDAcMDw8QDw8PDgQODxAFDg8QDAwMDAcDDgcABg4MAA0ODQ8CDQ4PDwINDA8ACA0MDwQLDA8PDgINAw8DBQ0PDgYLDQ8PDgIMDg8CDQ0PDgMMDg8QDw8PDQ8PDg8ODQ4NDg0ODQ4NDg0ODQ4NDg0ODQ4NDg0ODQ4NDg0ODQ4NDg0ODQ4NDg0ODQ4NDg0PDQ8ODQ4NDg0ODQ4NDg0ODQ4PDg8ODQ4ODg4PDg8ODg4PDg8PDg4PDg4PDg4ODg4ODg4ODg4ODg4ODg4ODg4PDg8ODg4ODg4PDg8ODg4PDg4PDg4ODg4PDg8ODg4PDg4PDg4ODg4PDg8ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4-");

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                if (seconds > 0) {
                    setSeconds(seconds - 1);
                } else if (minutes > 0) {
                    setMinutes(minutes - 1);
                    setSeconds(59);
                } else {
                    alarmSound();
                    setIsActive(false);
                    if (isBreak) {
                        // end of break
                        setIsBreak(false);
                        setMinutes(workMinutes);
                    } else {
                        // end of work
                        setIsBreak(true);
                        setMinutes(breakMinutes);
                    }
                    setSeconds(0);
                }
            }, 1000);
        } else if (!isActive && (seconds !== 0 || minutes !== (isBreak ? breakMinutes : workMinutes) ) ) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds, minutes, isBreak, workMinutes, breakMinutes, alarmSound]);
    
    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setIsBreak(false);
        setMinutes(workMinutes);
        setSeconds(0);
    };

    const handleWorkTimeChange = (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) setWorkMinutes(val);
        if(!isActive && !isBreak) setMinutes(val);
    }
     const handleBreakTimeChange = (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) setBreakMinutes(val);
        if(!isActive && isBreak) setMinutes(val);
    }

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-3xl font-bold text-white mb-4">Pomodoro Timer</h2>
            <div className={`w-64 h-64 sm:w-80 sm:h-80 rounded-full flex items-center justify-center border-8 ${isBreak ? 'border-blue-500' : 'border-red-500'} bg-gray-800 shadow-2xl`}>
                <div className="text-center">
                    <p className="text-6xl sm:text-7xl font-mono font-bold tracking-widest">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</p>
                    <p className="text-lg text-gray-400">{isBreak ? "Break Time" : "Work Session"}</p>
                </div>
            </div>
            <div className="flex gap-4 mt-8">
                <button onClick={toggleTimer} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors text-xl">
                    {isActive ? <Pause size={24}/> : <Play size={24}/>}
                    {isActive ? 'Pause' : 'Start'}
                </button>
                <button onClick={resetTimer} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors text-xl">
                    <RotateCcw size={24}/> Reset
                </button>
            </div>
            <div className="mt-8 flex gap-8">
                <div className="text-center">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Work (min)</label>
                    <input type="number" value={workMinutes} onChange={handleWorkTimeChange} className="w-20 bg-gray-700 border border-gray-600 rounded-lg py-1 px-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-red-500"/>
                </div>
                 <div className="text-center">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Break (min)</label>
                    <input type="number" value={breakMinutes} onChange={handleBreakTimeChange} className="w-20 bg-gray-700 border border-gray-600 rounded-lg py-1 px-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-red-500"/>
                </div>
            </div>
        </div>
    );
}

// --- 7. Settings View ---
function SettingsView({ userId }) {
    const defaultQuestions = [
        "What was my biggest win today?",
        "What did I learn?",
        "How could I have made today better?",
        "What am I grateful for?"
    ];

    const [questions, setQuestions] = useState([]);
    const journalSettingsRef = doc(db, 'artifacts', appId, 'users', userId, 'journalSettings', 'questions');

    useEffect(() => {
        if (!userId) return;
        const unsub = onSnapshot(journalSettingsRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().questions) {
                setQuestions(docSnap.data().questions);
            } else {
                setQuestions(defaultQuestions);
            }
        });
        return () => unsub();
    }, [userId]);
    
    const handleQuestionChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index] = value;
        setQuestions(newQuestions);
    };

    const handleAddQuestion = () => {
        setQuestions([...questions, '']);
    };

_handleRemoveQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const handleSaveChanges = async () => {
        const questionsToSave = questions.filter(q => q && q.trim() !== '');
        if (questionsToSave.length > 0) {
            await setDoc(journalSettingsRef, { questions: questionsToSave });
        }
    };

    return (
         <div>
            <h2 className="text-3xl font-bold text-white mb-6">Settings</h2>
            <div className="bg-gray-800 p-6 rounded-lg">
                 <h3 className="text-xl font-semibold text-red-400 mb-4">Customize Journal Questions</h3>
                 <div className="space-y-4">
                     {questions.map((q, index) => (
                         <div key={index} className="flex items-center gap-2">
                             <input 
                                 type="text"
                                 value={q}
                                 onChange={(e) => handleQuestionChange(index, e.target.value)}
                                 className="flex-grow bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                             />
                              <button onClick={() => handleRemoveQuestion(index)} className="text-gray-500 hover:text-red-500 p-2">
                                <Trash2 size={18} />
                            </button>
                         </div>
                     ))}
                 </div>
                 <div className="mt-6 flex justify-between">
                     <button onClick={handleAddQuestion} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                        <Plus size={18}/> Add Question
                    </button>
                     <button onClick={handleSaveChanges} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                        <Save size={18}/> Save Changes
                    </button>
                 </div>
            </div>
             <div className="bg-gray-800 p-6 rounded-lg mt-8">
                 <h3 className="text-xl font-semibold text-red-400 mb-4">User Info</h3>
                 <p className="text-gray-400">Your User ID (for support or data migration):</p>
                 <p className="text-sm text-gray-500 bg-gray-700 p-2 rounded-md font-mono select-all">{userId}</p>
             </div>
        </div>
    );
}
