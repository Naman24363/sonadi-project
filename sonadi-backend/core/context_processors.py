# ==============================================
# SITE CONFIGURATION CONTEXT PROCESSOR
# ==============================================
# This module provides site-wide configuration variables
# to all templates without hardcoding sensitive information.
# All values are loaded from environment variables via settings.

from django.conf import settings


def site_config(request):
    """
    Inject site configuration into all template contexts.
    This allows templates to access organization info, contact details,
    social links, and bank details from environment variables.
    """
    return {
        # Organization Info
        'org_name': settings.ORG_NAME,
        'org_phone': settings.ORG_PHONE,
        'org_email': settings.ORG_EMAIL,
        'org_whatsapp': settings.ORG_WHATSAPP,
        
        # Address
        'org_address_line1': settings.ORG_ADDRESS_LINE1,
        'org_address_line2': settings.ORG_ADDRESS_LINE2,
        'org_pincode': settings.ORG_PINCODE,
        
        # Google Maps
        'org_google_maps_url': settings.ORG_GOOGLE_MAPS_URL,
        'org_google_maps_embed': settings.ORG_GOOGLE_MAPS_EMBED,
        
        # Social Media
        'social_facebook': settings.SOCIAL_FACEBOOK,
        'social_instagram': settings.SOCIAL_INSTAGRAM,
        
        # Bank Details
        'bank_name': settings.BANK_NAME,
        'bank_branch': settings.BANK_BRANCH,
        'bank_address': settings.BANK_ADDRESS,
        'bank_account_holder': settings.BANK_ACCOUNT_HOLDER,
        'bank_account_number': settings.BANK_ACCOUNT_NUMBER,
        'bank_ifsc_code': settings.BANK_IFSC_CODE,
        'bank_cbs_code': settings.BANK_CBS_CODE,
        
        # Ambulance Service
        'ambulance_phone': settings.AMBULANCE_PHONE,
        
        # Admin/Contact Email
        'admin_email': settings.ADMIN_EMAIL,
    }
