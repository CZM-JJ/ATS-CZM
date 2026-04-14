<?php

namespace App\Notifications;

use App\Models\Applicant;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ApplicantSubmissionReceived extends Notification
{
    public function __construct(private readonly Applicant $applicant)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function shouldQueue(object $notifiable): bool
    {
        return false;
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Application Received - Czark Mak Corporation')
            ->greeting('Hi ' . $this->applicant->first_name . ',')
            ->line('Thank you for applying to Czark Mak Corporation.')
            ->line('We have received your application for the ' . $this->applicant->position_applied_for . ' position.')
            ->line('Our recruitment team will review your qualifications and contact you if your profile matches the role requirements.')
            ->line('Application details:')
            ->line('Position: ' . $this->applicant->position_applied_for)
            ->line('Submitted: ' . now()->format('F d, Y \a\t h:i A'))
            ->line('If you have questions, you may contact our HR team at hr@czarkmak.com.')
            ->salutation('Czark Mak Recruitment Team');
    }
}
