import * as functions from 'firebase-functions'
import SparkPost from 'sparkpost'
import { z } from 'zod'

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

export const sendContactForm = functions.https.onCall(async (data: unknown, context) => {
  // Validate input data
  const validationResult = contactFormSchema.safeParse(data)
  if (!validationResult.success) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid form data',
      validationResult.error.errors
    )
  }

  const { name, email, subject, message } = validationResult.data

  // Check if SparkPost is configured
  if (!client) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Email service not configured'
    )
  }

  try {
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

    // Log successful submission (optional: store in Firestore for analytics)
    functions.logger.info('Contact form submitted successfully', {
      email,
      subject,
      timestamp: new Date().toISOString(),
    })

    return { status: 'success', message: 'Message sent successfully' }
  } catch (error) {
    functions.logger.error('Failed to send contact form email', error)
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send message. Please try again later.'
    )
  }
})
