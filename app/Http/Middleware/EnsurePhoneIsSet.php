<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePhoneIsSet
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Check if user is logged in, has role 'buyer' and phone is null or empty
        if ($user && $user->role === 'buyer' && empty($user->phone)) {
            // Avoid infinite redirect loop for phone-entry route, logout route, and API/webhook requests
            if (!$request->is('enter-phone') && 
                !$request->is('logout') && 
                !$request->routeIs('logout') && 
                !$request->is('api/*')) {
                
                // Store the intended URL for redirection after phone entry is completed
                if ($request->isMethod('get') && !$request->ajax()) {
                    session()->put('url.intended', $request->fullUrl());
                }
                
                return redirect()->route('phone.entry');
            }
        }

        return $next($request);
    }
}
