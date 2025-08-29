/**
 * Font Test Component
 * This component demonstrates all Clash Grotesk font weights
 * Remove this file after confirming fonts work correctly
 */
import React from 'react';

export function FontTest() {
    return (
        <div className="p-8 space-y-4 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">Clash Grotesk Font Test</h1>

            <div className="space-y-4">
                <div className="p-4 border rounded">
                    <p className="font-extralight text-lg">
                        <span className="font-semibold">Extralight (200):</span> The quick brown fox jumps over the lazy dog
                    </p>
                </div>

                <div className="p-4 border rounded">
                    <p className="font-light text-lg">
                        <span className="font-semibold">Light (300):</span> The quick brown fox jumps over the lazy dog
                    </p>
                </div>

                <div className="p-4 border rounded">
                    <p className="font-normal text-lg">
                        <span className="font-semibold">Regular (400):</span> The quick brown fox jumps over the lazy dog
                    </p>
                </div>

                <div className="p-4 border rounded">
                    <p className="font-medium text-lg">
                        <span className="font-semibold">Medium (500):</span> The quick brown fox jumps over the lazy dog
                    </p>
                </div>

                <div className="p-4 border rounded">
                    <p className="font-semibold text-lg">
                        <span className="font-semibold">Semibold (600):</span> The quick brown fox jumps over the lazy dog
                    </p>
                </div>

                <div className="p-4 border rounded">
                    <p className="font-bold text-lg">
                        <span className="font-semibold">Bold (700):</span> The quick brown fox jumps over the lazy dog
                    </p>
                </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Font Status:</h3>
                <p className="text-sm text-blue-700">
                    If you can see distinct font weights above (from thin to bold), Clash Grotesk fonts are working correctly!
                    <br />
                    <br />
                    <strong>Expected:</strong> Each line should have a noticeably different font weight.
                    <br />
                    <strong>Troubleshooting:</strong> If all text looks the same, check browser developer tools for font loading errors.
                </p>
            </div>
        </div>
    );
}
