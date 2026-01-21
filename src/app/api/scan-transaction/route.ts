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

        // Use Gemini 1.5 Flash (using latest alias to avoid 404)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const prompt = `
        You are an expert financial assistant. Analyze this image (which could be a bank statement screenshot, a mobile banking app screenshot, or a receipt).
        
        Extract all financial transactions visible.
        For each transaction, determine:
        1. Description (Payee, Merchant, or Concept)
        2. Amount (Absolute positive number)
        3. Type: 'EXPENSE' or 'INCOME'. 
           - If the amount has a negative sign (e.g. -25.00) or is red, it is likely an EXPENSE.
           - If it is positive or green, it is likely an INCOME.
           - Transfers sent are expenses. Transfers received are incomes.
        4. Date (YYYY-MM-DD format). If the year is missing, assume the current year (${new Date().getFullYear()}).
        
        Return ONLY a raw JSON array of objects. Do not include markdown formatting like \`\`\`json.
        Example format:
        [
            {"description": "Netflix", "amount": 15.99, "type": "EXPENSE", "date": "2024-05-20"},
            {"description": "Salary", "amount": 1200.00, "type": "INCOME", "date": "2024-05-30"}
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
