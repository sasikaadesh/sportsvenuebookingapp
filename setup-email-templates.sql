-- SETUP PROFESSIONAL EMAIL TEMPLATES FOR SPORTSVENUEBOOKINGS APP
-- Run this in Supabase SQL Editor to customize email templates

-- Note: This script shows the template structure. 
-- You'll need to apply these templates in your Supabase Dashboard > Authentication > Email Templates

/*
=== CONFIRMATION EMAIL TEMPLATE ===

Go to: Supabase Dashboard > Authentication > Email Templates > Confirm signup

Subject: Welcome to SportsVenueBookings - Confirm Your Account

HTML Template:
*/

-- Copy this HTML template to Supabase Dashboard:
/*
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your Account - SportsVenueBookings</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #3b82f6, #22c55e);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .welcome-message {
            font-size: 18px;
            margin-bottom: 25px;
            color: #374151;
        }
        .confirm-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .confirm-button:hover {
            transform: translateY(-2px);
        }
        .features {
            background-color: #f8fafc;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .features h3 {
            color: #1f2937;
            margin-top: 0;
            margin-bottom: 15px;
        }
        .features ul {
            margin: 0;
            padding-left: 20px;
        }
        .features li {
            margin-bottom: 8px;
            color: #4b5563;
        }
        .footer {
            background-color: #f9fafb;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 5px 0;
            color: #6b7280;
            font-size: 14px;
        }
        .security-note {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .security-note p {
            margin: 0;
            color: #92400e;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏟️ SportsVenueBookings</h1>
            <p>Welcome to the premier sports facility booking platform</p>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                <strong>Welcome to SportsVenueBookings!</strong>
            </div>
            
            <p>Thank you for creating an account with us. You're just one step away from booking amazing sports facilities!</p>
            
            <p>To complete your registration and start booking courts, please confirm your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .ConfirmationURL }}" class="confirm-button">
                    ✅ Confirm My Account
                </a>
            </div>
            
            <div class="features">
                <h3>🎯 What you can do once confirmed:</h3>
                <ul>
                    <li>🏀 Book basketball courts</li>
                    <li>🎾 Reserve tennis courts</li>
                    <li>🏏 Schedule cricket grounds</li>
                    <li>⚽ Book football fields</li>
                    <li>🏸 Reserve badminton courts</li>
                    <li>📅 Manage your bookings</li>
                    <li>💳 Secure online payments</li>
                </ul>
            </div>
            
            <div class="security-note">
                <p><strong>🔒 Security Note:</strong> This confirmation link will expire in 24 hours. If you didn't create this account, please ignore this email.</p>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6; font-size: 14px;">{{ .ConfirmationURL }}</p>
            
            <p>Need help? Contact our support team at <a href="mailto:support@sportsvenue.com" style="color: #3b82f6;">support@sportsvenue.com</a></p>
        </div>
        
        <div class="footer">
            <p><strong>SportsVenueBookings</strong></p>
            <p>Your premier destination for sports facility bookings</p>
            <p>📧 support@sportsvenue.com | 📞 (555) 123-4567</p>
            <p style="margin-top: 15px; font-size: 12px;">
                This is an automated email. Please do not reply to this message.
            </p>
        </div>
    </div>
</body>
</html>
*/

-- Instructions:
-- 1. Go to Supabase Dashboard > Authentication > Email Templates
-- 2. Select "Confirm signup" template
-- 3. Replace the subject with: "Welcome to SportsVenueBookings - Confirm Your Account"
-- 4. Replace the HTML content with the template above
-- 5. Save the changes

-- You can also customize other email templates:
-- - "Invite user" template
-- - "Magic link" template  
-- - "Change email address" template
-- - "Reset password" template
