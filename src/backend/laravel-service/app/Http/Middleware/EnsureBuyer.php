<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBuyer
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->role !== 'comprador') {
            return response()->json(['message' => 'El rol admin no pot realitzar compres'], 403);
        }

        return $next($request);
    }
}
