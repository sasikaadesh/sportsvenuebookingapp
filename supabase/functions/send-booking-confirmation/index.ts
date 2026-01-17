import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BookingConfirmationData {
  bookingId: string
  userEmail: string
  userName: string
  courtName: string
  courtType: string
  bookingDate: string
  startTime: string
  duration: number
  totalPrice: number
  location: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { bookingData }: { bookingData: BookingConfirmationData } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation - SportVenue</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #22c55e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-row:last-child { border-bottom: none; }
          .total { font-weight: bold; font-size: 18px; color: #3b82f6; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎾 Booking Confirmed!</h1>
            <p>Your sports venue reservation is confirmed</p>
          </div>
          
          <div class="content">
            <h2>Hello ${bookingData.userName}!</h2>
            <p>Great news! Your booking has been confirmed. Here are the details:</p>
            
            <div class="booking-details">
              <h3>Booking Details</h3>
              <div class="detail-row">
                <span>Booking ID:</span>
                <span><strong>#${bookingData.bookingId}</strong></span>
              </div>
              <div class="detail-row">
                <span>Court:</span>
                <span><strong>${bookingData.courtName}</strong></span>
              </div>
              <div class="detail-row">
                <span>Sport:</span>
                <span><strong>${bookingData.courtType.charAt(0).toUpperCase() + bookingData.courtType.slice(1)}</strong></span>
              </div>
              <div class="detail-row">
                <span>Date:</span>
                <span><strong>${new Date(bookingData.bookingDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</strong></span>
              </div>
              <div class="detail-row">
                <span>Time:</span>
                <span><strong>${bookingData.startTime}</strong></span>
              </div>
              <div class="detail-row">
                <span>Duration:</span>
                <span><strong>${bookingData.duration} hour${bookingData.duration > 1 ? 's' : ''}</strong></span>
              </div>
              <div class="detail-row">
                <span>Location:</span>
                <span><strong>${bookingData.location}</strong></span>
              </div>
              <div class="detail-row total">
                <span>Total Amount:</span>
                <span>LKR ${bookingData.totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <h3>Important Information:</h3>
            <ul>
              <li>Please arrive 10 minutes before your booking time</li>
              <li>Bring proper sports attire and non-marking shoes</li>
              <li>Equipment rental is available on-site if needed</li>
              <li>Free cancellation up to 24 hours before your booking</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${Deno.env.get('NEXT_PUBLIC_APP_URL')}/dashboard" class="button">
                View My Bookings
              </a>
            </div>
            
            <p>If you have any questions or need to make changes to your booking, please contact us at <a href="mailto:support@sportvenue.com">support@sportvenue.com</a> or call us at +1 (555) 123-4567.</p>
            
            <div class="footer">
              <p>Thank you for choosing SportVenue!</p>
              <p>© 2024 SportVenue. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email using your preferred email service
    // This example uses a generic approach - replace with your email service
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SportVenue <bookings@sportvenue.com>',
        to: [bookingData.userEmail],
        subject: `Booking Confirmed - ${bookingData.courtName} on ${new Date(bookingData.bookingDate).toLocaleDateString()}`,
        html: emailHtml,
      }),
    })

    if (!emailResponse.ok) {
      throw new Error(`Email service error: ${emailResponse.statusText}`)
    }

    const emailResult = await emailResponse.json()

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Booking confirmation email sent successfully',
        emailId: emailResult.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error sending booking confirmation:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
