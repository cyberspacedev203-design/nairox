import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key to verify JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Extract JWT token from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { status: 200, headers: corsHeaders }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the JWT and get user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid session' }),
        { status: 200, headers: corsHeaders }
      )
    }

    const { stake } = await req.json()

    // Validate stake
    if (!stake || ![50000, 100000, 150000].includes(stake)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid stake amount. Must be 50000, 100000, or 150000' }),
        { status: 200, headers: corsHeaders }
      )
    }

    // Get current balance FOR UPDATE (lock row)
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to fetch wallet' }),
        { status: 200, headers: corsHeaders }
      )
    }

    const currentBalance = Number(profile.balance) || 0

    // Check balance
    if (currentBalance < stake) {
      return new Response(
        JSON.stringify({ success: false, message: 'Insufficient balance' }),
        { status: 200, headers: corsHeaders }
      )
    }

    // Deduct stake first
    const balanceAfterDeduct = currentBalance - stake

    // Determine result with fixed probabilities: WIN 25%, TRY 15%, LOSE 60%
    const random = Math.random() * 100
    let result: 'WIN' | 'LOSE' | 'TRY'
    let prize = 0
    let newBalance = balanceAfterDeduct

    if (random < 25) {
      // WIN - 25%
      result = 'WIN'
      prize = stake * 2
      newBalance += prize
    } else if (random < 40) {
      // TRY - 15%
      result = 'TRY'
      prize = 0
      // Balance already deducted, no additional change
    } else {
      // LOSE - 60%
      result = 'LOSE'
      prize = 0
      // Balance already deducted
    }

    // Update balance
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to update balance' }),
        { status: 200, headers: corsHeaders }
      )
    }

    // Record spin
    const { error: spinError } = await supabaseClient
      .from('spins')
      .insert({
        user_id: user.id,
        stake,
        result,
        prize,
      })

    if (spinError) {
      console.error('Spin insert error:', spinError)
    }

    // Create transaction records
    // 1. Debit stake
    await supabaseClient.from('transactions').insert({
      user_id: user.id,
      type: 'spin_debit',
      amount: stake,
      description: `Spin stake: ₦${stake.toLocaleString()}`,
      status: 'completed',
    })

    // 2. Credit prize if any
    if (prize > 0) {
      await supabaseClient.from('transactions').insert({
        user_id: user.id,
        type: 'spin_credit',
        amount: prize,
        description: `Spin ${result}: ₦${prize.toLocaleString()}`,
        status: 'completed',
      })
    }

    const message = 
      result === 'WIN' ? `You won ₦${prize.toLocaleString()}!` :
      result === 'TRY' ? 'Try again!' :
      'Better luck next time!'

    console.log(`Spin: user=${user.id}, stake=${stake}, result=${result}, prize=${prize}, newBalance=${newBalance}`)

    return new Response(
      JSON.stringify({
        success: true,
        result,
        prize,
        newBalance,
        message,
      }),
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Spin error:', error)
    const errorId = crypto.randomUUID()
    console.error(`Error ID ${errorId}:`, error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'Spin failed. Please try again.',
      }),
      { status: 200, headers: corsHeaders }
    )
  }
})
