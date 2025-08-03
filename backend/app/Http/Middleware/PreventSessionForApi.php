<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PreventSessionForApi
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Disable session for API routes
        if ($request->is('api/*')) {
            // Force array session driver
            config(['session.driver' => 'array']);
            
            // Clear any existing session
            $request->setLaravelSession(null);
            
            // Disable session middleware for this request
            $request->attributes->set('session.disabled', true);
            
            // Remove any session cookies from the request
            $request->cookies->remove('laravel_session');
        }

        $response = $next($request);

        // Add CORS headers for API routes
        if ($request->is('api/*')) {
            $response->headers->set('Access-Control-Allow-Origin', $request->header('Origin'));
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            $response->headers->set('Access-Control-Max-Age', '86400');
        }

        return $response;
    }
}