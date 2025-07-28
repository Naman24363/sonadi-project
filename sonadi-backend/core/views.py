from django.shortcuts import render, redirect
from django.contrib import messages
from django.core.mail import EmailMessage
from django.conf import settings
from django.urls import reverse
from django.utils import timezone

import razorpay

from .forms import (
    ContactForm, TestimonialForm, VolunteerForm, AdoptionForm
)
from .models import (
    Testimonial, HomepageStats, CoreValue, AboutStats, ActivityInfo
)

# Home Page View
def home(request):
    stats = HomepageStats.objects.first()
    values = CoreValue.objects.filter(show_on_homepage=True)
    return render(request, 'home.html', {'stats': stats, 'values': values})

# About Page View
def about(request):
    stats = AboutStats.objects.first()
    return render(request, 'about.html', {'about_stats': stats})

# Contact Page View
def contact(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()

            # Prepare email
            name = form.cleaned_data['name']
            email = form.cleaned_data['email']
            phone = form.cleaned_data['phone']
            message = form.cleaned_data['message']

            full_message = f"""
New Contact Form Submission:

Name: {name}
Email: {email}
Phone: {phone}

Message:
{message}
"""

            email_msg = EmailMessage(
                subject=f"New message from {name}",
                body=full_message,
                from_email='sonadicharitytrust@gmail.com',
                to=['sonadicharitytrust@gmail.com'],
                reply_to=[email],
            )
            email_msg.send(fail_silently=False)

            messages.success(request, "Your message has been sent successfully!")
            return redirect('contact')
    else:
        form = ContactForm()

    return render(request, 'contact.html', {'form': form})

# Donate (Landing Page)
def donate(request):
    return render(request, 'donate.html')

# Donate Razorpay Integration View
def donate_payment(request):
    if request.method == 'POST':
        # Get donation details from form
        amount = request.POST.get('amount')
        donor_name = request.POST.get('donor_name', '')
        donor_email = request.POST.get('donor_email', '')
        donor_phone = request.POST.get('donor_phone', '')
        donor_message = request.POST.get('donor_message', '')
        purpose = request.POST.get('purpose', 'general')
        
        # Validate amount
        try:
            amount_float = float(amount)
            if amount_float < 50:
                messages.error(request, "Minimum donation amount is ₹50")
                return redirect('donate')
            
            # Convert to paise for Razorpay
            amount_paise = int(amount_float * 100)
            
        except (ValueError, TypeError):
            messages.error(request, "Invalid donation amount")
            return redirect('donate')
        
        # Create Razorpay order
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        try:
            order = client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "payment_capture": '1',
                "notes": {
                    "donor_name": donor_name,
                    "donor_email": donor_email,
                    "donor_phone": donor_phone,
                    "purpose": purpose,
                    "message": donor_message
                }
            })
            
            context = {
                "razorpay_key": settings.RAZORPAY_KEY_ID,
                "order_id": order["id"],
                "amount": amount_paise,
                "amount_display": amount_float,
                "donor_name": donor_name,
                "donor_email": donor_email,
                "purpose": purpose
            }
            
            return render(request, "donate_payment.html", context)
            
        except Exception as e:
            messages.error(request, f"Payment gateway error: {str(e)}")
            return redirect('donate')
    
    else:
        # If accessed directly without POST, redirect to donate page
        messages.info(request, "Please select a donation amount first")
        return redirect('donate')

# Payment Success Handler
def donate_success(request):
    payment_id = request.GET.get('razorpay_payment_id')
    order_id = request.GET.get('razorpay_order_id')
    signature = request.GET.get('razorpay_signature')
    
    if payment_id and order_id:
        # Verify payment signature for security
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        try:
            # Verify the payment signature
            params_dict = {
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            }
            client.utility.verify_payment_signature(params_dict)
            
            # Get payment details
            payment = client.payment.fetch(payment_id)
            
            # Send confirmation email if donor email is available
            if payment.get('notes', {}).get('donor_email'):
                send_donation_receipt(payment)
            
            context = {
                'payment_id': payment_id,
                'order_id': order_id,
                'amount': payment['amount'] / 100,  # Convert from paise
                'donor_name': payment.get('notes', {}).get('donor_name', ''),
                'purpose': payment.get('notes', {}).get('purpose', ''),
                'payment_date': timezone.now()
            }
            
            return render(request, 'donate_success.html', context)
            
        except Exception as e:
            messages.error(request, f"Payment verification failed: {str(e)}")
            return redirect('donate_failure')
    
    return redirect('donate_failure')

# Payment Failure Handler  
def donate_failure(request):
    error_description = request.GET.get('error_description', 'Payment was unsuccessful')
    payment_id = request.GET.get('razorpay_payment_id')
    
    context = {
        'error_description': error_description,
        'payment_id': payment_id
    }
    
    return render(request, 'donate_failure.html', context)

# Send donation receipt email
def send_donation_receipt(payment_data):
    try:
        notes = payment_data.get('notes', {})
        donor_email = notes.get('donor_email')
        donor_name = notes.get('donor_name', 'Valued Donor')
        amount = payment_data['amount'] / 100
        payment_id = payment_data['id']
        
        if donor_email:
            email_subject = "Donation Receipt - Sonadi Charitable Trust"
            email_body = f"""
Dear {donor_name},

Thank you for your generous donation to Sonadi Charitable Trust!

Donation Details:
- Amount: ₹{amount:,.0f}
- Payment ID: {payment_id}
- Date: {timezone.now().strftime('%d %B %Y, %I:%M %p')}
- Purpose: {notes.get('purpose', 'General Animal Welfare').title()}

Your contribution helps us continue our mission of animal welfare and community service. 
We are grateful for your support in making a difference in the lives of animals in need.

For any queries regarding your donation, please contact us at sonadicharitytrust@gmail.com.

With heartfelt gratitude,
Sonadi Charitable Trust Team

---
This is an automated receipt. Please save this email for your records.
"""
            
            email_msg = EmailMessage(
                subject=email_subject,
                body=email_body,
                from_email='sonadicharitytrust@gmail.com',
                to=[donor_email],
                reply_to=['sonadicharitytrust@gmail.com']
            )
            email_msg.send(fail_silently=True)
            
    except Exception as e:
        print(f"Failed to send donation receipt: {e}")

# Testimonial Page View
def testimonial(request):
    testimonials = Testimonial.objects.filter(approved=True)

    if request.method == 'POST':
        form = TestimonialForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()

            try:
                title = form.cleaned_data['title']
                message = form.cleaned_data['message']
                name = form.cleaned_data['name']
                animal_name = form.cleaned_data['animal_name']
                email = form.cleaned_data['email']
                phone = form.cleaned_data['phone']

                full_message = f"""
New Testimonial Submitted:

Title: {title}
Name: {name}
Animal Name: {animal_name}
Email: {email}
Phone: {phone}

Message:
{message}
"""

                email_msg = EmailMessage(
                    subject=f"New Testimonial from {name}",
                    body=full_message,
                    from_email='sonadicharitytrust@gmail.com',
                    to=['sonadicharitytrust@gmail.com'],
                    reply_to=[email]
                )
                email_msg.send(fail_silently=False)

                messages.success(request, "Thanks for your testimonial! It will appear once approved.")
                return redirect('testimonial')

            except Exception as e:
                messages.error(request, f"Submission saved, but email failed: {e}")
        else:
            print("Form is invalid")
            print(form.errors)
    else:
        form = TestimonialForm()

    return render(request, 'testimonial.html', {'form': form, 'testimonials': testimonials})

# Volunteer Page View
def volunteer(request):
    if request.method == 'POST':
        form = VolunteerForm(request.POST)
        if form.is_valid():
            form.save()

            name = form.cleaned_data['name']
            email = form.cleaned_data['email']
            phone = form.cleaned_data['phone']
            message = form.cleaned_data['message']

            email_content = f"""
New Volunteer Submission:

Name: {name}
Email: {email}
Phone: {phone}

Message:
{message}
"""

            email_msg = EmailMessage(
                subject=f"New Volunteer Request from {name}",
                body=email_content,
                from_email='sonadicharitytrust@gmail.com',
                to=['sonadicharitytrust@gmail.com'],
                reply_to=[email]
            )
            email_msg.send(fail_silently=False)

            messages.success(request, "Thank you for volunteering with us!")
            return redirect('volunteer')
    else:
        form = VolunteerForm()

    return render(request, 'volunteer.html', {'form': form})

# Adoption Page View
def adopt_a_dog(request):
    if request.method == 'POST':
        form = AdoptionForm(request.POST)
        if form.is_valid():
            form.save()

            name = form.cleaned_data['name']
            email = form.cleaned_data['email']
            phone = form.cleaned_data['phone']
            reason = form.cleaned_data['reason']
            animal_name = form.cleaned_data['animal_name']
            animal_age = form.cleaned_data['animal_age']
            animal_gender = form.cleaned_data['animal_gender']
            animal_breed = form.cleaned_data['animal_breed']
            animal_personality = form.cleaned_data['animal_personality']

            message = f"""
New Adoption Request:

Full Name: {name}
Email: {email}
Phone: {phone}
Reason for Adoption: {reason}

Animal Details:
Name: {animal_name}
Age: {animal_age}
Gender: {animal_gender}
Breed: {animal_breed}
Personality: {animal_personality}
"""

            email_msg = EmailMessage(
                subject=f"Adoption Form Submission from {name}",
                body=message,
                from_email='sonadicharitytrust@gmail.com',
                to=['sonadicharitytrust@gmail.com'],
                reply_to=[email]
            )
            email_msg.send(fail_silently=False)

            messages.success(request, "Your adoption request has been submitted!")
            return redirect(reverse('adopt_a_dog') + '#thanks')
    else:
        form = AdoptionForm()

    return render(request, 'adopt-a-dog.html', {'form': form})

# Activities Page View
def activities(request):
    activity_info = ActivityInfo.objects.first()
    return render(request, 'activities.html', {'activity_info': activity_info})

# Static Page Views
def gallery(request):
    return render(request, 'gallery.html')

def founders(request):
    return render(request, 'founders.html')

def team(request):
    return render(request, 'team.html')

def photos(request):
    return render(request, 'photos.html')
