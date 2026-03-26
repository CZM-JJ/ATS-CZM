<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            $data = $request->validate([
                'email'    => ['required', 'email'],
                'password' => ['required', 'string'],
            ]);

            $user = User::where('email', $data['email'])->first();

            if (!$user || !Hash::check($data['password'], $user->password)) {
                return response()->json(['message' => 'Invalid credentials'], 401);
            }

            // Revoke any existing tokens for this user-agent to avoid token accumulation
            $user->tokens()->where('name', $request->userAgent() ?? 'api')->delete();

            $token = $user->createToken(
                $request->userAgent() ?? 'api',
                ['*'],
                now()->addHours(8)   // token expires in 8 hours
            )->plainTextToken;

            AuditLog::log('login', 'session', null, $user->email,
                "User '{$user->name}' logged in",
                $user->id, $user->name);

            return response()->json([
                'token' => $token,
                'user'  => $user,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An unexpected error occurred.',
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        AuditLog::log('logout', 'session', null, $user->email,
            "User '{$user->name}' logged out",
            $user->id, $user->name);

        $user->currentAccessToken()?->delete();

        return response()->noContent();
    }

    public function me(Request $request)
    {
        return $request->user();
    }

    public function forgotPassword(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = Password::sendResetLink($data);

        if ($status !== Password::RESET_LINK_SENT) {
            return response()->json(['message' => __($status)], 422);
        }

        return response()->json(['message' => __($status)]);
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $status = Password::reset(
            $data,
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();

                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)], 422);
        }

        return response()->json(['message' => __($status)]);
    }
}
