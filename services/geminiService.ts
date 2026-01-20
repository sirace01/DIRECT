
import { GoogleGenAI, Type } from "@google/genai";
import { Notification } from "../types";

// Fix: Correctly initialize GoogleGenAI with API_KEY from process.env as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const analyzeNotifications = async (items: any[], tasks: any[]): Promise<Notification[]> => {
  const now = new Date();
  const alerts: Notification[] = [];

  // Logic-based notification engine (Standard triggers)
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

  // Fix: Enhance with Gemini AI analysis for smarter notifications when API key is available
  if (process.env.API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze these school lab items and tasks for potential conflicts or shortages:
        Inventory: ${JSON.stringify(items.map(i => ({ name: i.name, qty: i.quantity, unit: i.unit })))}
        Pending Tasks: ${JSON.stringify(tasks.filter(t => t.status === 'Pending').map(t => t.title))}`,
        config: {
          systemInstruction: "You are an AI assistant for a school lab. Identify critical supply issues or scheduling risks. Be concise and professional.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                message: { type: Type.STRING },
                severity: { type: Type.STRING, description: "low, medium, or high" }
              },
              required: ["message", "severity"]
            }
          }
        }
      });

      // Fix: Directly access .text property from response
      const aiResponse = response.text;
      if (aiResponse) {
        const smartAlerts = JSON.parse(aiResponse);
        smartAlerts.forEach((alert: any, index: number) => {
          alerts.push({
            id: `ai-alert-${index}`,
            type: 'SYSTEM',
            message: `[Smart Alert] ${alert.message}`,
            date: now.toISOString(),
            severity: (alert.severity?.toLowerCase() as any) || 'low'
          });
        });
      }
    } catch (err) {
      console.warn("Gemini analysis failed, falling back to basic logic.", err);
    }
  }

  return alerts;
};
