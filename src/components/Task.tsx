import { useRef, useState } from "react";

        // Task Component
        // eslint-disable-next-line
        export default function Task  ({ task, onDragStart, onDragEnd, onResize, calendarRef, currentMonth }: {
            task: {id:number, name: string; category: string; startDay: number; endDay: number };
            onDragStart?: (taskId: number) => void;
            onDragEnd: (taskId: number, dayNum: number) => void;
            onResize: (taskId: number, startDay: number, endDay: number) => void;
            calendarRef: React.RefObject<HTMLDivElement | null>;
            currentMonth: Date;

        }) {
            const [isDragging, setIsDragging] = useState(false);
            // eslint-disable-next-line
            const [isResizing, setIsResizing] = useState(false);
            const taskRef = useRef<HTMLDivElement | null>(null);
            
            const getCategoryClass = () => {
                switch(task.category) {
                    case 'To Do': return 'category-todo';
                    case 'In Progress': return 'category-progress';
                    case 'Review': return 'category-review';
                    case 'Completed': return 'category-completed';
                    default: return 'category-todo';
                }
            };
            
            const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>
            ) => {
                if (e.currentTarget.classList.contains('resize-handle')) return;
                
                e.preventDefault();
                setIsDragging(true);
                
                const startX = e.clientX;
                const startY = e.clientY;
                
                const handleMouseMove = (e:MouseEvent) => {
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;
                    
                    if (taskRef.current) {
                        taskRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                        taskRef.current.style.zIndex = '1000';
                    }
                };
                
                const handleMouseUp = (e:MouseEvent) => {
                    setIsDragging(false);
                    
                    if (taskRef.current) {
                        taskRef.current.style.transform = '';
                        taskRef.current.style.zIndex = '';
                    }
                    
                    // Find which day tile we're over
                    const tiles = calendarRef.current?.querySelectorAll('.day-tile');
                    const mouseX = e.clientX;
                    const mouseY = e.clientY;
                    if (!tiles) return;
                    for (const tile of [...tiles]) {
                        const rect = tile.getBoundingClientRect();
                        if (mouseX >= rect.left && mouseX <= rect.right &&
                            mouseY >= rect.top && mouseY <= rect.bottom) {
                            const dayNum = parseInt((tile as HTMLDivElement).dataset?.day || '');
                            if (dayNum) {
                                onDragEnd(task.id, dayNum);
                            }
                            break;
                        }
                    }
                    
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            };
            
            const handleResize = (e:React.MouseEvent<HTMLDivElement, MouseEvent>, direction:'left' | 'right') => {
                e.stopPropagation();
                e.preventDefault();
                setIsResizing(true);

                if(!calendarRef.current) return;
                // eslint-disable-next-line
                const startX = e.clientX;
                const tiles = calendarRef.current.querySelectorAll('.day-tile');
                
                const handleMouseMove = (e:MouseEvent) => {
                    const mouseX = e.clientX;
                    
                    for (const tile of tiles) {
                        const rect = tile.getBoundingClientRect();
                        if (mouseX >= rect.left && mouseX <= rect.right) {
                            const dayNum = parseInt((tile as HTMLElement).dataset?.day || '');
                            if (dayNum) {
                                if (direction === 'left') {
                                    if (dayNum <= task.endDay) {
                                        onResize(task.id, dayNum, task.endDay);
                                    }
                                } else {
                                    if (dayNum >= task.startDay) {
                                        onResize(task.id, task.startDay, dayNum);
                                    }
                                }
                            }
                            break;
                        }
                    }
                };
                
                const handleMouseUp = () => {
                    setIsResizing(false);
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            };
            
            return (
                <div
                    ref={taskRef}
                    className={`task-bar ${getCategoryClass()} ${isDragging ? 'dragging' : ''}`}
                    onMouseDown={handleMouseDown}
                    style={{
                        left: '4px',
                        right: '4px',
                        width: 'calc(100% - 8px)',
                    }}
                >
                    <div 
                        className="resize-handle resize-handle-left"
                        onMouseDown={(e) => handleResize(e, 'left')}
                    />
                    <span className="truncate flex-1 text-center">{task.name}</span>
                    <div 
                        className="resize-handle resize-handle-right"
                        onMouseDown={(e) => handleResize(e, 'right')}
                    />
                </div>
            );
        };