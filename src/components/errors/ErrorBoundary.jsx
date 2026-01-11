'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log to console (in real production, this would go to Sentry)
        console.error('ErrorBoundary caught:', error, errorInfo);

        this.setState(prevState => ({
            error,
            errorInfo,
            errorCount: prevState.errorCount + 1
        }));

        // Emergency Cart Backup
        if (typeof window !== 'undefined') {
            try {
                const cart = localStorage.getItem('cart');
                if (cart) {
                    localStorage.setItem('cart_backup', cart);
                    console.log('🛡️ Cart backed up before crash');
                }
            } catch (e) {
                console.error('Failed to backup cart during error', e);
            }
        }
    }

    handleReset = () => {
        // Restore Cart
        if (typeof window !== 'undefined') {
            try {
                const cartBackup = localStorage.getItem('cart_backup');
                if (cartBackup) {
                    localStorage.setItem('cart', cartBackup);
                    console.log('🔄 Cart restored from backup');
                }
            } catch (e) {
                console.error('Failed to restore cart recovery', e);
            }
        }

        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // If errors persist (looping), show minimal UI to avoid infinite render loops
            if (this.state.errorCount > 3) {
                return (
                    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                        <div className="text-center">
                            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold mb-2">Ciddi Bir Hata Oluştu</h1>
                            <p className="text-gray-600 mb-6">
                                Lütfen sayfayı yenileyerek tekrar deneyin.
                            </p>
                            <Button onClick={() => window.location.reload()}>
                                Sayfayı Yenile
                            </Button>
                        </div>
                    </div>
                );
            }

            // Check context
            const isCheckout = typeof window !== 'undefined' && window.location.pathname.includes('checkout');
            const isPayment = typeof window !== 'undefined' && window.location.pathname.includes('payment');

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                        <div className="text-center">
                            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold mb-2">Bir Şeyler Ters Gitti</h1>

                            {(isCheckout || isPayment) && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-blue-800">
                                        ✅ Sepetiniz güvende! Verileriniz kaydedilmedi.
                                    </p>
                                </div>
                            )}

                            <p className="text-gray-600 mb-6">
                                {isCheckout
                                    ? "Ödeme işleminiz sırasında bir hata oluştu. Sepetiniz kayıtlı, lütfen tekrar deneyin."
                                    : "Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin."}
                            </p>

                            {process.env.NODE_ENV === 'development' && (
                                <details className="text-left mb-6 bg-gray-100 p-4 rounded text-xs max-h-40 overflow-auto">
                                    <summary className="cursor-pointer font-semibold mb-2">
                                        Hata Detayları (Development)
                                    </summary>
                                    <pre className="whitespace-pre-wrap">
                                        {this.state.error?.toString()}
                                        {'\n\n'}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    onClick={this.handleReset}
                                    className="flex-1"
                                    variant="default"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Tekrar Dene
                                </Button>
                                <Button
                                    onClick={this.handleGoHome}
                                    className="flex-1"
                                    variant="outline"
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Ana Sayfa
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
