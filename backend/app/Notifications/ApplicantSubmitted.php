<?php

namespace App\Notifications;

use App\Models\Applicant;
use Illuminate\Notifications\Notification;

class ApplicantSubmitted extends Notification
{
    public function __construct(private readonly Applicant $applicant)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function shouldQueue(object $notifiable): bool
    {
        return false;
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'kind' => 'applicant_submitted',
            'applicant_id' => $this->applicant->id,
            'name' => trim($this->applicant->first_name . ' ' . $this->applicant->last_name),
            'position' => $this->applicant->position_applied_for,
            'email' => $this->applicant->email_address,
            'contact' => $this->applicant->contact_number,
            'status' => $this->applicant->status,
        ];
    }
}
