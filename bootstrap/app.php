<?php

use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\EnsurePhoneIsSet;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            EnsurePhoneIsSet::class,
        ]);

        // Kecualikan Midtrans & Ginee webhook dari CSRF verification
        $middleware->validateCsrfTokens(except: [
            'api/webhooks/midtrans',
            'api/webhooks/ginee',
        ]);

        $middleware->alias([
            'admin' => AdminMiddleware::class,
        ]);

        $middleware->redirectGuestsTo(function (Request $request) {
            if ($request->is('admin') || $request->is('admin/*')) {
                return route('admin.login');
            }

            return route('login');
        });

        $middleware->redirectUsersTo(function (Request $request) {
            if ($request->user() && $request->user()->role === 'admin') {
                return route('admin.dashboard');
            }

            return route('storefront.home');
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
