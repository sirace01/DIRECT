
import { Notification } from "../types";

export const analyzeNotifications = async (items: any[], tasks: any[]): Promise<Notification[]> => {
  // Use a safe check for the API key to prevent boot-time ReferenceErrors
  const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || "";
  
  // Return early if no key is provided to avoid crashing the whole dashboard
  if (!apiKey) {
    console.warn("Gemini API key not found. Smart notifications will use logic-only fallback.");
  }

  const now = new Date();
  const alerts: Notification[] = [];

  // Logic-based notification engine (Fallback for when AI is unavailable)
  items.forEach(item => {
    if (!item.expiryDate) return;
    const expiry = new Date(item.expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 30 && diffDays > 0) {
      alerts.push({
        id: `exp-${item.id}`,
        type: 'EXPIRY',
        message: `${item.name} is expiring in ${diffDays} days.`,
        date: now.toISOString(),
        severity: diffDays < 7 ? 'high' : 'medium'
      });
    }
  });

  tasks.forEach(task => {
    if (task.status === 'Pending' && task.deadline) {
      const deadline = new Date(task.deadline);
      const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 3 && diffDays >= 0) {
        alerts.push({
          id: `task-${task.id}`,
          type: 'DEADLINE',
          message: `Task "${task.title}" is due in ${diffDays} days.`,
          date: now.toISOString(),
          severity: diffDays === 0 ? 'high' : 'medium'
        });
      }
    }
  });

  return alerts;
};
