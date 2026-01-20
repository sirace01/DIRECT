
import { GoogleGenAI } from "@google/genai";
import { Notification } from "../types";

export const analyzeNotifications = async (items: any[], tasks: any[]): Promise<Notification[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Simulated processing for demo - in a real app, this would use a proper prompt
  const now = new Date();
  const alerts: Notification[] = [];

  items.forEach(item => {
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
    if (task.status === 'Pending') {
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
