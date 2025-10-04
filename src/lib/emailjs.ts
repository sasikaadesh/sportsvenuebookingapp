import emailjs from '@emailjs/browser'

// EmailJS configuration - add these to your .env.local file
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'your_service_id'
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'your_template_id'
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'your_public_key'

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY)

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  inquiryType: string
}

export async function sendContactEmails(formData: ContactFormData) {
  try {
    console.log('Sending emails via EmailJS...')

    // Send confirmation email to user
    const userEmailParams = {
      user_name: formData.name,
      user_email: formData.email,
      from_name: 'Sports Venue Team',
      reply_to: 'noreply@sportsvenue.com',
      subject: 'Thank you for contacting us!',
      message: `Dear ${formData.name},

Thank you for your message! We've received your inquiry and will get back to you within 24 hours.

Your Message Details:
- Subject: ${formData.subject}
- Inquiry Type: ${formData.inquiryType}
- Message: ${formData.message}

If you need immediate assistance, please call us at (555) 123-4567.

Best regards,
The SportsVenueBookings Team

---
This is an automated confirmation email.`
    }

    // Send notification email to admin
    const adminEmailParams = {
      user_name: 'Admin',
      user_email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@sportsvenuebookings.com',
      from_name: 'SportsVenueBookings Contact Form',
      reply_to: formData.email,
      subject: `New Contact: ${formData.subject}`,
      message: `New contact form submission:

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Subject: ${formData.subject}
Inquiry Type: ${formData.inquiryType}

Message:
${formData.message}

---
Please respond within 24 hours.`
    }

    console.log('EmailJS parameters for user:', userEmailParams)
    console.log('EmailJS parameters for admin:', adminEmailParams)
    console.log('EmailJS config:', {
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID,
      publicKey: EMAILJS_PUBLIC_KEY?.substring(0, 10) + '...'
    })

    // Send both emails
    const [userResult, adminResult] = await Promise.all([
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, userEmailParams),
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, adminEmailParams)
    ])

    console.log('Emails sent successfully:', { userResult, adminResult })
    return { success: true, userResult, adminResult }

  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}

export function isEmailJSConfigured(): boolean {
  return EMAILJS_SERVICE_ID !== 'your_service_id' && 
         EMAILJS_TEMPLATE_ID !== 'your_template_id' && 
         EMAILJS_PUBLIC_KEY !== 'your_public_key'
}
