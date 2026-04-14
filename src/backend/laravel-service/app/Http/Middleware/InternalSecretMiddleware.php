<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InternalSecretMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $secret = config('app.internal_secret');

        if (empty($secret) || $request->header('X-Internal-Secret') !== $secret) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}
