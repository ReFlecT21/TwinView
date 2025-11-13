import { prisma } from '../prisma';
import { formatDistanceToNow } from 'date-fns';

/**
 * Email digest service for sending news updates to users
 *
 * To use this service, you'll need to:
 * 1. Install an email service (e.g., Resend, SendGrid, Nodemailer)
 * 2. Set up environment variables for the email service
 * 3. Uncomment and configure the sendEmail function below
 *
 * For now, this is a template that logs the email content
 */

export interface DigestEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Send an email using your preferred email service
 *
 * Example implementations:
 *
 * // Using Resend (recommended for modern apps)
 * import { Resend } from 'resend';
 * const resend = new Resend(process.env.RESEND_API_KEY);
 * await resend.emails.send({
 *   from: 'news@yourdomain.com',
 *   to: email.to,
 *   subject: email.subject,
 *   html: email.html,
 * });
 *
 * // Using SendGrid
 * import sgMail from '@sendgrid/mail';
 * sgMail.setApiKey(process.env.SENDGRID_API_KEY);
 * await sgMail.send({
 *   to: email.to,
 *   from: 'news@yourdomain.com',
 *   subject: email.subject,
 *   html: email.html,
 * });
 */
async function sendEmail(email: DigestEmail): Promise<void> {
  // TODO: Implement actual email sending
  console.log('Email digest to send:', {
    to: email.to,
    subject: email.subject,
    textPreview: email.text.substring(0, 100) + '...',
  });

  // For now, just log to console
  // Replace this with actual email sending logic
}

/**
 * Generate HTML email template for news digest
 */
function generateEmailHTML(
  userName: string,
  matches: Array<{
    newsArticle: {
      title: string;
      summary: string | null;
      url: string;
      sourceName: string;
      publishedAt: Date;
      sourceType: string;
    };
    company: {
      name: string;
      industry: string;
    };
    relevanceScore: number;
    matchReason: string | null;
  }>
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Digital Twin News Digest</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Digital Twin News Digest</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your daily update on digital twin industry news</p>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${userName},</p>

    <p style="margin: 0 0 20px 0; color: #666;">
      We found <strong>${matches.length}</strong> new article${matches.length !== 1 ? 's' : ''} related to your tracked companies in the digital twin space.
    </p>

    ${matches
      .map(
        (match) => `
      <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 20px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #1f2937;">
          <a href="${match.newsArticle.url}" style="color: #1f2937; text-decoration: none;">${match.newsArticle.title}</a>
        </h2>

        <div style="margin-bottom: 12px;">
          <span style="display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-right: 8px;">
            ${match.newsArticle.sourceType}
          </span>
          <span style="display: inline-block; background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
            ${match.company.name}
          </span>
        </div>

        ${
          match.newsArticle.summary
            ? `<p style="margin: 0 0 12px 0; color: #666; font-size: 14px; line-height: 1.6;">${match.newsArticle.summary}</p>`
            : ''
        }

        <div style="font-size: 13px; color: #999; margin-bottom: 12px;">
          <strong>${match.newsArticle.sourceName}</strong> ·
          ${formatDistanceToNow(new Date(match.newsArticle.publishedAt), { addSuffix: true })}
        </div>

        ${
          match.matchReason
            ? `<div style="font-size: 12px; color: #666; font-style: italic; margin-bottom: 12px;">
            ${match.matchReason}
          </div>`
            : ''
        }

        <a href="${match.newsArticle.url}" style="display: inline-block; background: #667eea; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">
          Read Full Article →
        </a>
      </div>
    `
      )
      .join('')}

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <a href="${baseUrl}/news" style="display: inline-block; background: #1f2937; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-bottom: 15px;">
        View All News in Dashboard
      </a>

      <p style="font-size: 13px; color: #999; margin: 15px 0 0 0;">
        <a href="${baseUrl}/settings/notifications" style="color: #667eea; text-decoration: none;">Manage your notification preferences</a>
      </p>
    </div>
  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>Dell Partner Intel - Digital Twin Dashboard</p>
    <p>This email was sent because you're subscribed to daily news digests.</p>
  </div>

</body>
</html>
  `;
}

/**
 * Generate plain text version of email
 */
function generateEmailText(
  userName: string,
  matches: Array<{
    newsArticle: {
      title: string;
      summary: string | null;
      url: string;
      sourceName: string;
      publishedAt: Date;
    };
    company: {
      name: string;
    };
    matchReason: string | null;
  }>
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  let text = `Digital Twin News Digest\n\n`;
  text += `Hi ${userName},\n\n`;
  text += `We found ${matches.length} new article${matches.length !== 1 ? 's' : ''} related to your tracked companies:\n\n`;

  matches.forEach((match, index) => {
    text += `${index + 1}. ${match.newsArticle.title}\n`;
    text += `   Company: ${match.company.name}\n`;
    text += `   Source: ${match.newsArticle.sourceName}\n`;
    text += `   Published: ${formatDistanceToNow(new Date(match.newsArticle.publishedAt), { addSuffix: true })}\n`;
    if (match.matchReason) {
      text += `   Match: ${match.matchReason}\n`;
    }
    if (match.newsArticle.summary) {
      text += `   ${match.newsArticle.summary}\n`;
    }
    text += `   Read: ${match.newsArticle.url}\n\n`;
  });

  text += `View all news: ${baseUrl}/news\n`;
  text += `Manage preferences: ${baseUrl}/settings/notifications\n\n`;
  text += `---\n`;
  text += `Dell Partner Intel - Digital Twin Dashboard\n`;

  return text;
}

/**
 * Send news digest to a single user
 */
export async function sendDigestToUser(userId: string, userName: string, userEmail: string) {
  // Get user's preferences
  const preferences = await prisma.userNotificationPreferences.findUnique({
    where: { id: userId },
  });

  // Check if email is enabled
  if (!preferences?.emailEnabled || preferences.digestFrequency === 'DISABLED') {
    console.log(`Skipping digest for ${userEmail} - disabled or not configured`);
    return;
  }

  // Check if it's time to send based on frequency
  const now = new Date();
  if (preferences.lastDigestSent) {
    const hoursSinceLastSent =
      (now.getTime() - new Date(preferences.lastDigestSent).getTime()) / (1000 * 60 * 60);

    if (preferences.digestFrequency === 'DAILY' && hoursSinceLastSent < 24) {
      console.log(`Skipping daily digest for ${userEmail} - sent ${hoursSinceLastSent.toFixed(1)}h ago`);
      return;
    }

    if (preferences.digestFrequency === 'WEEKLY' && hoursSinceLastSent < 168) {
      console.log(`Skipping weekly digest for ${userEmail} - sent ${hoursSinceLastSent.toFixed(1)}h ago`);
      return;
    }
  }

  // Get unread news matches from the last period
  const cutoffDate = new Date();
  if (preferences.digestFrequency === 'DAILY') {
    cutoffDate.setDate(cutoffDate.getDate() - 1);
  } else if (preferences.digestFrequency === 'WEEKLY') {
    cutoffDate.setDate(cutoffDate.getDate() - 7);
  }

  const matches = await prisma.newsCompanyMatch.findMany({
    where: {
      createdAt: {
        gte: cutoffDate,
      },
    },
    include: {
      newsArticle: true,
      company: {
        select: {
          name: true,
          industry: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20, // Max 20 articles per digest
  });

  if (matches.length === 0) {
    console.log(`No new matches for ${userEmail} - skipping digest`);
    return;
  }

  // Generate email
  const html = generateEmailHTML(userName, matches);
  const text = generateEmailText(userName, matches);

  const email: DigestEmail = {
    to: userEmail,
    subject: `📰 ${matches.length} New Digital Twin ${matches.length === 1 ? 'Article' : 'Articles'} - Your Daily Digest`,
    html,
    text,
  };

  // Send email
  await sendEmail(email);

  // Update last sent timestamp
  await prisma.userNotificationPreferences.update({
    where: { id: userId },
    data: {
      lastDigestSent: now,
    },
  });

  console.log(`Sent digest to ${userEmail} with ${matches.length} articles`);
}

/**
 * Send news digests to all users
 */
export async function sendDigestsToAllUsers() {
  // Get all team members
  const teamMembers = await prisma.teamMember.findMany();

  console.log(`Sending digests to ${teamMembers.length} users...`);

  let sentCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const member of teamMembers) {
    try {
      await sendDigestToUser(member.id, member.name, member.email);
      sentCount++;
    } catch (error) {
      console.error(`Error sending digest to ${member.email}:`, error);
      errorCount++;
    }
  }

  console.log(`Digest summary: ${sentCount} sent, ${skippedCount} skipped, ${errorCount} errors`);

  return { sentCount, skippedCount, errorCount };
}
