import * as functions from 'firebase-functions'
import SparkPost from 'sparkpost'
import { z } from 'zod'
import cors from 'cors'

// Contact form validation schema
const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

// Initialize SparkPost client
const sparkpostApiKey = functions.config().sparkpost?.api_key || process.env.SPARKPOST_API_KEY
const client = sparkpostApiKey ? new SparkPost(sparkpostApiKey) : null

// Configure CORS
const corsHandler = cors({ origin: true })

export const sendContactForm = functions.https.onRequest(async (req, res) => {
  // Handle CORS preflight
  corsHandler(req, res, async () => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed')
      return
    }

    try {
      const data = req.body

      // Validate input data
      const validationResult = contactFormSchema.safeParse(data)
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Invalid form data',
          details: validationResult.error.errors
        })
        return
      }

      const { name, email, subject, message } = validationResult.data

      // Check if SparkPost is configured
      if (!client) {
        res.status(500).json({
          error: 'Email service not configured'
        })
        return
      }

      // Send email via SparkPost
      await client.transmissions.send({
        content: {
          from: 'noreply@mail.naknick.com',
          subject: `Contact Form - QuizBooth: ${subject}`,
          html: `
            <html>
              <body>
                <h2>New Contact Form Submission</h2>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><small>Sent from QuizBooth contact form</small></p>
              </body>
            </html>
          `,
          text: `
            New Contact Form Submission
            
            Subject: ${subject}
            Name: ${name}
            Email: ${email}
            Message: ${message}
            
            Sent from QuizBooth contact form
          `,
        },
        recipients: [{ address: 'max@naknick.com' }],
      })

      // Log successful submission
      functions.logger.info('Contact form submitted successfully', {
        email,
        subject,
        timestamp: new Date().toISOString(),
      })

      res.status(200).json({ status: 'success', message: 'Message sent successfully' })
    } catch (error) {
      functions.logger.error('Failed to send contact form email', error)
      res.status(500).json({
        error: 'Failed to send message. Please try again later.'
      })
    }
  })
})
