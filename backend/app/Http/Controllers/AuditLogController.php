<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::query()->orderByDesc('created_at');

        if ($request->filled('action')) {
            $query->where('action', $request->input('action'));
        }

        if ($request->filled('entity')) {
            $query->where('entity', $request->input('entity'));
        }

        if ($request->filled('user_name')) {
            $query->where('user_name', 'like', '%' . $request->input('user_name') . '%');
        }

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->date('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->date('end_date'));
        }

        return $query->paginate($request->integer('per_page', 30));
    }
}
