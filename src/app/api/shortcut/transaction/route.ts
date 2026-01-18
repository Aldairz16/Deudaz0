import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase Admin Client
// We need SERVICE_ROLE_KEY to bypass RLS since the shortcut request won't have a user session cookie.
// The user MUST add SUPABASE_SERVICE_ROLE_KEY to their environment variables.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    // Fallback to ANON KEY but it might fail if RLS is strict. 
    // Ideally user provided SERVICE_ROLE_KEY.
);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, description, type, category, secret, email, wallet_name } = body;

        // Debug Logs
        console.log('--- Shortcut API Request ---');
        console.log('Received Body:', JSON.stringify(body));
        const validSecret = process.env.SHORTCUT_API_SECRET;

        console.log(`Server Secret: "${validSecret}" (Length: ${validSecret?.length})`);
        console.log(`Received Secret: "${secret}" (Length: ${secret?.length})`);

        if (!validSecret) {
            console.error('Server Error: SHORTCUT_API_SECRET missing in env');
            return NextResponse.json({ error: 'Server misconfiguration: SHORTCUT_API_SECRET not set' }, { status: 500 });
        }

        // Trim comparison to avoid whitespace issues
        if (!secret || secret.trim() !== validSecret.trim()) {
            console.error('Auth Error: Secret comparison failed.');
            return NextResponse.json({ error: 'Unauthorized: Invalid Secret' }, { status: 401 });
        }

        if (!email) {
            return NextResponse.json({ error: 'Email required to identify user' }, { status: 400 });
        }

        // 2. Find User by Email (to get user_id)
        // Since we are admin, we can query the users table or just trust the email if using public tables with user_id.
        // But 'users' table is usually in auth schema, not accessible directly via simple client usually unless configured.
        // BETTER APPROACH: Query a table that has user_id, like 'wallets', filtering by a known property if possible?
        // OR: Just ask the user to provide their USER_ID in the shortcut? No, hard for them.
        // Let's try to query 'wallets' of that user to get the ID.
        // Wait, 'wallets' stores user_id. We don't have the user's ID yet.
        // If we use Service Role, we can use `supabaseAdmin.auth.admin.listUsers()` but that is heavy.

        // Simpler: The user inputs their UUID in the shortcut? Hard.
        // Let's assume the user sends 'email' and we try to find a wallet owned by a user with that email... 
        // We can't query auth.users easily.

        // WORKAROUND: For this version, let's ask the user to provide their 'user_id' OR 
        // if they are the ONLY user (personal app), just pick the first user found in DB? No, bad.

        // Let's TRY to resolve email -> user_id via Admin Auth API
        // This requires SERVICE_ROLE_KEY.
        let userId = null;

        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            // Admin way
            // There isn't a direct "get user by email" in simple SDK without listing. 
            // Actually `admin.listUsers()` works.
            // But for scale, this is bad. For personal app, acceptable.
            // OR: Just use the `user_id` passed in body if known.
            if (body.user_id) {
                userId = body.user_id;
            }
        }

        // If we still don't have userId, fallback or error.
        // Let's prioritize `user_id` in body. Getting UUID is easy from the app (we can show it in settings).
        // If not provided, fail for now to keep it robust.
        if (!userId) {
            return NextResponse.json({ error: 'user_id is required. Please check your Shortcut settings.' }, { status: 400 });
        }


        // 3. Find Target Wallet
        let walletId = null;
        if (wallet_name) {
            // Try to find wallet by name case insensitive
            const { data: wallets } = await supabaseAdmin
                .from('wallets')
                .select('id, name')
                .eq('user_id', userId)
                .ilike('name', wallet_name)
                .limit(1);

            if (wallets && wallets.length > 0) {
                walletId = wallets[0].id;
            }
        }

        // If no wallet found by name (or not provided), try to find a default one (e.g. 'Efectivo') or just the first created.
        if (!walletId) {
            const { data: wallets } = await supabaseAdmin
                .from('wallets')
                .select('id')
                .eq('user_id', userId)
                .order('created_at', { ascending: true })
                .limit(1);

            if (wallets && wallets.length > 0) {
                walletId = wallets[0].id;
            }
        }

        if (!walletId) {
            return NextResponse.json({ error: 'No wallet found for this user.' }, { status: 404 });
        }

        // Normalize Transaction Type
        // DB expects lowercase 'expense' or 'income'
        let rawType = (type || 'expense').toString();
        let normalizedType = rawType.toLowerCase().trim();

        // Map common Spanish terms
        if (normalizedType.includes('gasto') || normalizedType.includes('egreso')) normalizedType = 'expense';
        if (normalizedType.includes('ingreso')) normalizedType = 'income';

        // STRICT VALIDATION FALLBACK
        if (normalizedType !== 'income' && normalizedType !== 'expense') {
            console.warn(`Unknown type "${rawType}", defaulting to expense`);
            normalizedType = 'expense';
        }

        // 4. Create Transaction
        const { data: transaction, error } = await supabaseAdmin
            .from('transactions')
            .insert({
                user_id: userId,
                wallet_id: walletId,
                amount: parseFloat(amount),
                description: description || 'Movimiento rápido',
                type: normalizedType,
                category: category || 'General',
                date: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('DB Insert Error:', error);
            throw error;
        }

        // 5. Update Wallet Balance
        const { data: wallet } = await supabaseAdmin.from('wallets').select('balance').eq('id', walletId).single();
        if (wallet) {
            const delta = normalizedType === 'income' ? parseFloat(amount) : -parseFloat(amount);
            const newBalance = wallet.balance + delta;
            await supabaseAdmin.from('wallets').update({ balance: newBalance }).eq('id', walletId);
        }

        return NextResponse.json({ success: true, transaction });

    } catch (error: any) {
        console.error('Shortcut API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
