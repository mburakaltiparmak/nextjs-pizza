'use client';

import React from 'react';
import ErrorBoundary from './ErrorBoundary';

// Specialized ErrorBoundary for Checkout flows
// Inherits logic from main ErrorBoundary but could be customized further
class CheckoutErrorBoundary extends ErrorBoundary {
    // We can override specific methods if needed, 
    // currently reusing the logic is sufficient as the base one handles checkout context detection.
}

export default CheckoutErrorBoundary;
