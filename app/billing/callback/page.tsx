'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { subscriptionsService } from '@/libs/api/services';
import { toast } from 'sonner';

export default function BillingCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('Verifying your payment...');
    const hasVerified = useRef(false);

    useEffect(() => {
        const verifyTransaction = async () => {
            if (hasVerified.current) return;
            hasVerified.current = true;

            const fwTxRef = searchParams.get('tx_ref');
            const fwTransactionId = searchParams.get('transaction_id');
            const fwStatus = searchParams.get('status');

            const psReference = searchParams.get('reference');

            let provider = '';
            let reference = '';
            let transactionId = undefined;

            if (fwTxRef) {
                provider = 'flutterwave';
                reference = fwTxRef;
                transactionId = fwTransactionId || undefined;
                if (fwStatus !== 'successful' && fwStatus !== 'completed') {
                    toast.error('Payment was not successful.');
                    router.push('/settings');
                    return;
                }
            } else if (psReference) {
                provider = 'paystack';
                reference = psReference;
            } else {
                toast.error('Invalid callback parameters');
                router.push('/settings');
                return;
            }

            try {
                await subscriptionsService.verifyPayment({
                    reference,
                    provider: provider as any,
                    transaction_id: transactionId,
                });
                toast.success('Payment verified successfully! Your plan is now active.');
                router.push('/settings');
            } catch (error: any) {
                setStatus('Payment verification failed.');
                toast.error(error.response?.data?.error || 'Verification failed. Please contact support if you were charged.');
                setTimeout(() => {
                    router.push('/settings');
                }, 3000);
            }
        };

        verifyTransaction();
    }, [searchParams, router]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-background rounded-2xl w-full">
            <div className="text-center space-y-4 flex flex-col justify-center items-center">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-lg font-medium text-foreground">{status}</p>
                <p className="text-muted-foreground text-sm max-w-sm">Please do not close this window while we securely confirm your subscription with the payment gateway.</p>
            </div>
        </div>
    );
}
