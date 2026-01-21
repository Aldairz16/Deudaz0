import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');

        // Use Gemini 2.5 Flash (Standard for 2026)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are an expert financial assistant. Analyze this image (which could be a bank statement screenshot, a mobile banking app screenshot like Yape/Plin, or a receipt).
        
        Extract all financial transactions visible.
        For each transaction, determine:
        1. Description:
           - For Yape/Plin screenshots: Identify the NAME of the person/business sent to/received from. If it says "Yapeaste a Juan Perez", description is "Juan Perez". If "Te yapeó Maria", description is "Maria".
           - For Bank Statements: The merchant or transfer concept. Clean up codes like "OPS 123456".
           - For Receipts: The business name (e.g. "Starbucks", "Uber").
        2. Amount (Absolute positive number)
        3. Type: 'EXPENSE' or 'INCOME'. 
           - Negative signs (-), Red colors, or "Sent/Enviaste" = EXPENSE.
           - Positive signs (+), Green colors, or "Received/Recibiste" = INCOME.
        4. Date (YYYY-MM-DD format). If year is missing, assume current year (${new Date().getFullYear()}).
        
        Return ONLY a raw JSON array of objects.
        Example:
        [
            {"description": "Juan Perez", "amount": 15.00, "type": "EXPENSE", "date": "2024-05-20"},
            {"description": "Starbucks", "amount": 12.50, "type": "EXPENSE", "date": "2024-05-20"}
        ]
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: file.type || 'image/jpeg',
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up markdown if present (just in case)
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let transactions = [];
        try {
            transactions = JSON.parse(cleanedText);
        } catch (e) {
            console.error('Failed to parse AI response:', text);
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
        }

        return NextResponse.json({ transactions });

    } catch (error: any) {
        console.error('Scan Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
