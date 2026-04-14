<?php

namespace App\Notifications;

use App\Models\Applicant;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ApplicantStatusUpdated extends Notification
{
    public function __construct(private readonly Applicant $applicant)
    {
    }

    public function via(object $notifiable): array
    {
        return [];
    }

    public function shouldQueue(object $notifiable): bool
    {
        return false;
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Application status updated');
    }
}
