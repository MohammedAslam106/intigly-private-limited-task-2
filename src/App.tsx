
import { useState, useEffect, useRef, useMemo } from 'react'
import { getDaysInMonth, getFirstDayOfMonth, getMonthName, isToday } from './lib/utility';
import Modal from './components/Modal';
import Task from './components/Task';

// Main App Component
const App = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [tasks, setTasks] = useState<{id:number; name: string; category: 'To Do' | 'In Progress' | 'Review' | 'Completed', startDay: number, endDay: number }[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState<number | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [pendingTaskDays, setPendingTaskDays] = useState<{start:number, end:number} | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilters, setCategoryFilters] = useState({
        'To Do': true,
        'In Progress': true,
        'Review': true,
        'Completed': true
    });
    const [timeFilter, setTimeFilter] = useState<string | null>(null);

    const calendarRef = useRef(null);

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const monthName = getMonthName(currentMonth);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const days = [];
        const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

        for (let i = 0; i < totalCells; i++) {
            if (i < firstDayOfMonth || i >= firstDayOfMonth + daysInMonth) {
                days.push(null);
            } else {
                days.push(i - firstDayOfMonth + 1);
            }
        }

        return days;
    }, [firstDayOfMonth, daysInMonth]);

    // Filter tasks
    const filteredTasks = useMemo(() => {
        let filtered = tasks;

        // Category filter
        filtered = filtered.filter(task => categoryFilters[task.category]);

        // Time filter
        if (timeFilter) {
            const today = new Date().getDate();
            const weeksAhead = parseInt(timeFilter);
            const daysAhead = weeksAhead * 7;

            filtered = filtered.filter(task => {
                return task.startDay <= today + daysAhead;
            });
        }

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(task =>
                task.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [tasks, categoryFilters, timeFilter, searchQuery]);

    // Handle selection
    const handleMouseDown = (day:number|null) => {
        if (!day) return;
        setIsSelecting(true);
        setSelectionStart(day);
        setSelectionEnd(day);
    };

    const handleMouseEnter = (day:number | null) => {
        if (!isSelecting || !day) return;
        setSelectionEnd(day);
    };

    const handleMouseUp = () => {
        if (isSelecting && selectionStart && selectionEnd) {
            const start = Math.min(selectionStart, selectionEnd);
            const end = Math.max(selectionStart, selectionEnd);
            setPendingTaskDays({ start, end });
            setModalOpen(true);
        }
        setIsSelecting(false);
        setSelectionStart(null);
        setSelectionEnd(null);
    };

    // Create task
    const handleCreateTask = ({ name, category }:{name:string,category:
'To Do' | 'In Progress' | 'Review' | 'Completed'}) => {
        if (pendingTaskDays) {
            const newTask = {
                id: Date.now(),
                name,
                category,
                startDay: pendingTaskDays.start,
                endDay: pendingTaskDays.end
            };
            setTasks([...tasks, newTask]);
            setPendingTaskDays(null);
        }
        setModalOpen(false);
    };

    // Move task
    const handleTaskDragEnd = (taskId:number, newStartDay:number) => {
        setTasks(tasks.map(task => {
            if (task.id === taskId) {
                const duration = task.endDay - task.startDay;
                return {
                    ...task,
                    startDay: newStartDay,
                    endDay: newStartDay + duration
                };
            }
            return task;
        }));
    };

    // Resize task
    const handleTaskResize = (taskId:number, newStartDay:number, newEndDay:number) => {
        setTasks(tasks.map(task => {
            if (task.id === taskId) {
                return {
                    ...task,
                    startDay: newStartDay,
                    endDay: newEndDay
                };
            }
            return task;
        }));
    };

    // Get tasks for a specific day range
    const getTasksForDay = (day:number | null) => {
        if (!day) return [];
        return filteredTasks.filter(task =>
            day >= task.startDay && day <= task.endDay
        );
    };

    // Check if day is in selection
    const isDayInSelection = (day:number | null) => {
        if (!day || !selectionStart || !selectionEnd) return false;
        const start = Math.min(selectionStart, selectionEnd);
        const end = Math.max(selectionStart, selectionEnd);
        return day >= start && day <= end;
    };

    // Navigate months
    const navigateMonth = (direction:number) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + direction);
        setCurrentMonth(newMonth);
    };

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, [isSelecting, selectionStart, selectionEnd]);

    // Load tasks from localStorage
    useEffect(() => {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            setTasks(JSON.parse(savedTasks));
        }
    }, []);

    // Save tasks to localStorage
    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm mb-4 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-800">Task Planner</h1>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigateMonth(-1)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h2 className="text-lg font-semibold px-4">{monthName}</h2>
                            <button
                                onClick={() => navigateMonth(1)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="border-t pt-4">
                        <div className="flex flex-wrap gap-4">
                            {/* Search */}
                            <div className="flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Category Filters */}
                            <div className="flex gap-3">
                                {Object.keys(categoryFilters).map((category) => (
                                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={categoryFilters[category as 'To Do' | 'In Progress' | 'Review' | 'Completed']}
                                            onChange={(e) => setCategoryFilters({
                                                ...categoryFilters,
                                                [category]: e.target.checked
                                            })}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm">{category}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Time Filter */}
                            <select
                                value={timeFilter || ''}
                                onChange={(e) => setTimeFilter(e.target.value || null)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All dates</option>
                                <option value="1">Within 1 week</option>
                                <option value="2">Within 2 weeks</option>
                                <option value="3">Within 3 weeks</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Calendar */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="grid grid-cols-7 gap-px bg-gray-200" ref={calendarRef}>
                        {/* Day headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="bg-gray-50 p-2 text-center text-sm font-semibold text-gray-700">
                                {day}
                            </div>
                        ))}

                        {/* Calendar days */}
                        {calendarDays.map((day, index) => {
                            const dayTasks = getTasksForDay(day);
                            const isInSelection = isDayInSelection(day);
                            const dateObj = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null;
                            const isTodayDate = dateObj ? isToday(dateObj) : false;

                            return (
                                <div
                                    key={index}
                                    data-day={day}
                                    className={`
                                        day-tile
                                        ${isInSelection ? 'selecting' : ''}
                                        ${isTodayDate ? 'today' : ''}
                                        ${!day ? 'bg-gray-50' : ''}
                                    `}
                                    onMouseDown={() => handleMouseDown(day)}
                                    onMouseEnter={() => handleMouseEnter(day)}
                                >
                                    {day && (
                                        <>
                                            <div className="p-2 text-sm font-medium text-gray-700">
                                                {day}
                                            </div>
                                            <div className="relative" style={{ minHeight: '40px' }}>
                                                {dayTasks.map((task, taskIndex) => {
                                                    // Only render the task on its start day
                                                    if (task.startDay === day) {
                                                        const spanDays = task.endDay - task.startDay + 1;
                                                        const width = `calc(${spanDays * 100}% + ${(spanDays - 1) * 1}px)`;

                                                        return (
                                                            <div
                                                                key={task.id}
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: `${taskIndex * 32}px`,
                                                                    width: width,
                                                                    zIndex: 10 - taskIndex
                                                                }}
                                                            >
                                                                <Task
                                                                    task={task}
                                                                    onDragEnd={handleTaskDragEnd}
                                                                    onResize={handleTaskResize}
                                                                    calendarRef={calendarRef}
                                                                    currentMonth={currentMonth}
                                                                    onDragStart={() => { }}
                                                                />
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Task count */}
                <div className="mt-4 text-center text-sm text-gray-600">
                    Showing {filteredTasks.length} of {tasks.length} tasks
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setPendingTaskDays(null);
                }}
                onSubmit={handleCreateTask}
                title="Create New Task"
            />
        </div>
    );
};

export default App
