<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'user_name',
        'action',
        'entity',
        'entity_id',
        'entity_label',
        'description',
        'ip_address',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Record an audit entry. Automatically reads auth user and IP when not provided.
     */
    public static function log(
        string  $action,
        string  $entity,
        ?int    $entityId,
        ?string $entityLabel,
        string  $description,
        ?int    $userId   = null,
        ?string $userName = null
    ): void {
        $authUser = auth()->user();

        static::create([
            'user_id'      => $userId   ?? $authUser?->id,
            'user_name'    => $userName ?? $authUser?->name ?? 'System',
            'action'       => $action,
            'entity'       => $entity,
            'entity_id'    => $entityId,
            'entity_label' => $entityLabel,
            'description'  => $description,
            'ip_address'   => request()->ip(),
        ]);
    }
}
