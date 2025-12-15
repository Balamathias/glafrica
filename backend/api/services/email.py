"""
Email notification services for Green Livestock Africa.
"""
import logging
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

logger = logging.getLogger(__name__)


def send_contact_notification_email(inquiry):
    """
    Send email notification to admin when a new contact form is submitted.

    Args:
        inquiry: ContactInquiry model instance
    """
    subject = f"[Green Livestock] New {inquiry.get_subject_display()} Inquiry from {inquiry.name}"

    # Plain text message
    message = f"""
New contact form submission received:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: {inquiry.name}
Email: {inquiry.email}
Phone: {inquiry.phone or 'Not provided'}
Subject: {inquiry.get_subject_display()}
Submitted: {inquiry.created_at.strftime('%B %d, %Y at %I:%M %p')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MESSAGE:

{inquiry.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply directly to this email to respond to {inquiry.name}, or view in admin dashboard.

---
Green Livestock Africa
https://greenlivestockafrica.com
    """

    # Get admin email from settings, with fallback
    admin_email = getattr(settings, 'ADMIN_EMAIL', None)
    if not admin_email:
        logger.warning("ADMIN_EMAIL not configured. Contact notification not sent.")
        return False

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@greenlivestockafrica.com')

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[admin_email],
            fail_silently=False,
            # Set reply-to as the inquiry sender's email
            headers={'Reply-To': inquiry.email}
        )
        logger.info(f"Contact notification email sent for inquiry {inquiry.id}")
        return True
    except Exception as e:
        # Log error but don't fail the request - the inquiry is saved anyway
        logger.error(f"Failed to send contact notification email for inquiry {inquiry.id}: {e}")
        return False


def send_inquiry_reply_email(inquiry, reply_message, sender_name=None):
    """
    Send reply email to the person who submitted the contact inquiry.

    Args:
        inquiry: ContactInquiry model instance
        reply_message: The reply message content
        sender_name: Name of the person replying (optional)
    """
    sender_name = sender_name or "Green Livestock Africa Team"
    subject = f"Re: Your {inquiry.get_subject_display()} Inquiry - Green Livestock Africa"

    message = f"""
Dear {inquiry.name},

Thank you for reaching out to Green Livestock Africa.

{reply_message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your original message:
{inquiry.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Best regards,
{sender_name}

---
Green Livestock Africa
https://greenlivestockafrica.com
Phone: +234 XXX XXX XXXX
    """

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@greenlivestockafrica.com')
    admin_email = getattr(settings, 'ADMIN_EMAIL', from_email)

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[inquiry.email],
            fail_silently=False,
            headers={'Reply-To': admin_email}
        )
        logger.info(f"Reply email sent for inquiry {inquiry.id} to {inquiry.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send reply email for inquiry {inquiry.id}: {e}")
        return False
