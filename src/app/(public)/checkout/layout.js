import CheckoutErrorBoundary from '@/components/errors/CheckoutErrorBoundary';

export default function CheckoutLayout({ children }) {
    return (
        <CheckoutErrorBoundary>
            {children}
        </CheckoutErrorBoundary>
    );
}
