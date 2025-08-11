// Utility functions
        export const getDaysInMonth = (date) => {
            return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        };
        
        export const getFirstDayOfMonth = (date) => {
            return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        };
        
        export const getMonthName = (date) => {
            return date.toLocaleString('default', { month: 'long', year: 'numeric' });
        };
        
        export const isSameDay = (date1, date2) => {
            return date1.getDate() === date2.getDate() &&
                   date1.getMonth() === date2.getMonth() &&
                   date1.getFullYear() === date2.getFullYear();
        };
        
        export const isToday = (date) => {
            return isSameDay(date, new Date());
        };