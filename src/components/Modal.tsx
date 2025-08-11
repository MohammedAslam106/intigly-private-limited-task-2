import { useEffect, useState, type FormEvent } from "react";

// Modal Component
export default function Modal({ isOpen, onClose, onSubmit, title, initialValues }:{isOpen:boolean; onClose:() => void; onSubmit:(data:{
    name:string,category:
'To Do' | 'In Progress' | 'Review' | 'Completed'
}) => void; title:string; initialValues?:{name:string,category:'To Do' | 'In Progress' | 'Review' | 'Completed'}}) {
    const [taskName, setTaskName] = useState(initialValues?.name || '');
            const [category, setCategory] = useState(initialValues?.category || 'To Do');
            
            useEffect(() => {
                if (isOpen) {
                    setTaskName(initialValues?.name || '');
                    setCategory(initialValues?.category || 'To Do');
                }
            }, [isOpen, initialValues]);
            
            if (!isOpen) return null;
            
            const handleSubmit = (e:FormEvent) => {
                e.preventDefault();
                if (taskName.trim()) {
                    onSubmit({ name: taskName, category });
                    setTaskName('');
                    setCategory('To Do');
                }
            };
            
            return (
                <div className="modal-overlay" onClick={onClose}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-4">{title}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Task Name</label>
                                <input
                                    type="text"
                                    value={taskName}
                                    onChange={(e) => setTaskName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter task name"
                                    autoFocus
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as 'To Do' | 'In Progress' | 'Review' | 'Completed')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Review">Review</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                >
                                    {initialValues ? 'Update' : 'Create'} Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            );
};