
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Invoice } from "../types";

// Always use a named parameter for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (transactions: Transaction[], currentBalance: number) => {
  const prompt = `
    Analyze the following list of transactions and provide professional financial advice. 
    Current total balance is Rs. ${currentBalance.toFixed(2)}.
    
    Transactions:
    ${transactions.map(t => `${t.date}: ${t.type === 'income' ? '+' : '-'}Rs. ${t.amount} (${t.category} - ${t.description})`).join('\n')}
    
    Provide your response in JSON format including:
    1. A summary of spending habits.
    2. Three actionable tips to save more.
    3. A predicted end-of-month balance.
    4. Categorical analysis (where most money goes).
  `;

  try {
    // Fix: Using gemini-3-pro-preview for complex reasoning task as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            predictedBalance: { type: Type.NUMBER },
            topCategories: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  category: { type: Type.STRING }, 
                  percentage: { type: Type.NUMBER } 
                } 
              } 
            }
          }
        }
      }
    });

    // Fix: Directly access the .text property from GenerateContentResponse as per guidelines
    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const generateInvoiceEmail = async (invoice: Partial<Invoice>) => {
  const itemsList = invoice.items?.map(i => `- ${i.description}: ${i.quantity} x Rs. ${i.price}`).join('\n');
  const prompt = `
    Draft a professional, friendly, and concise email for an invoice.
    
    Customer: ${invoice.customerName}
    Total Amount: Rs. ${invoice.total}
    Due Date: ${invoice.dueDate}
    Items:
    ${itemsList}
    
    The email should be professional but modern. Include a subject line.
    Return only the email body text.
  `;

  try {
    // Basic text generation task
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Fix: Directly access the .text property (not a method)
    return response.text;
  } catch (error) {
    console.error("Email Draft Error:", error);
    return `Dear ${invoice.customerName},\n\nPlease find the attached invoice for Rs. ${invoice.total} due on ${invoice.dueDate}.\n\nBest regards.`;
  }
};
