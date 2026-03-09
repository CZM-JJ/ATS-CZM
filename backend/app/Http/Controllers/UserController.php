<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        return User::select('id', 'name', 'email', 'role', 'created_at')
            ->orderBy('name')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role'     => ['required', Rule::in(['admin', 'hr_manager', 'hr_supervisor', 'recruiter'])],
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => $data['role'],
        ]);

        AuditLog::log('create', 'user', $user->id, $user->email,
            "Created user '{$user->name}' with role '{$user->role}'");

        return response()->json(
            $user->only('id', 'name', 'email', 'role', 'created_at'),
            201
        );
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'     => ['sometimes', 'string', 'max:255'],
            'email'    => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['sometimes', 'nullable', 'string', 'min:8'],
            'role'     => ['sometimes', Rule::in(['admin', 'hr_manager', 'hr_supervisor', 'recruiter'])],
        ]);

        if (isset($data['password']) && $data['password']) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        AuditLog::log('update', 'user', $user->id, $user->email,
            "Updated user '{$user->name}'");

        return $user->only('id', 'name', 'email', 'role', 'created_at');
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $name = $user->name;
        $email = $user->email;
        $userId = $user->id;

        $user->tokens()->delete();
        $user->delete();

        AuditLog::log('delete', 'user', $userId, $email,
            "Deleted user '{$name}'");

        return response()->noContent();
    }
}
