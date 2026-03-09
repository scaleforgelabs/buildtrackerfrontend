"use client";

import React from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/app/components/ui/table";
import { useAuth } from "@/libs/hooks/useAuth";
import { subscriptionsService } from "@/libs/api/services";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const BillingTab = () => {
    const { user, loading: authLoading } = useAuth();
    const [subscription, setSubscription] = React.useState<any>(null);
    const [invoices, setInvoices] = React.useState<any[]>([]);
    const [paymentMethods, setPaymentMethods] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isCancelling, setIsCancelling] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        const fetchBillingDetails = async () => {
            if (authLoading) return;

            if (!user?.id) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await subscriptionsService.getDetails(user.id);
                setSubscription(response.data.subscription);
                setPaymentMethods(response.data.payment_methods || []);
                setInvoices(response.data.invoices || []);
            } catch (error) {
                console.error("Failed to fetch billing details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBillingDetails();
    }, [user, authLoading]);

    const handleUpgrade = () => {
        router.push('/checkout/pro');
    };

    const handleCancel = async () => {
        if (!user?.id) return;
        if (!confirm("Are you sure you want to cancel your plan at the end of the billing period?")) return;
        setIsCancelling(true);
        try {
            await subscriptionsService.cancelSubscription(user.id);
            toast.success("Subscription cancelled successfully.");
            // Refresh details
            const response = await subscriptionsService.getDetails(user.id);
            if (response.data?.subscription) {
                setSubscription(response.data.subscription);
                setPaymentMethods(response.data.payment_methods || []);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to cancel subscription");
        } finally {
            setIsCancelling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-12">
                <section className="space-y-6">
                    <div className="h-8 w-48 bg-muted animate-pulse rounded-md"></div>
                    <div className="h-40 w-full rounded-2xl bg-muted animate-pulse"></div>
                </section>
                <section className="space-y-6">
                    <div className="h-8 w-48 bg-muted animate-pulse rounded-md"></div>
                    <div className="h-64 w-full rounded-2xl bg-muted animate-pulse"></div>
                </section>
            </div>
        );
    }
    return (
        <div className="space-y-12">
            {/* Plan Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-bold text-foreground">Plan</h3>
                            {subscription?.status === 'active' || subscription?.status === 'trialing' ? (
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-2 py-0 text-[10px] font-bold uppercase tracking-wider dark:text-emerald-400">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5 inline-block"></span>
                                    {subscription.status}
                                </Badge>
                            ) : subscription ? (
                                <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 px-2 py-0 text-[10px] font-bold uppercase tracking-wider dark:text-rose-400">
                                    <span className="w-1 h-1 rounded-full bg-rose-500 mr-1.5 inline-block"></span>
                                    {subscription.status}
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20 px-2 py-0 text-[10px] font-bold uppercase tracking-wider dark:text-gray-400">
                                    <span className="w-1 h-1 rounded-full bg-gray-500 mr-1.5 inline-block"></span>
                                    Free
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground font-normal">Information about your current plan on BuildTracker</p>
                    </div>
                </div>

                <div className="bg-muted/50 rounded-2xl p-8 border border-border flex items-center justify-between shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 flex-1">
                        <div className="space-y-2">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Your Plan</p>
                            <p className="font-bold text-foreground text-base capitalize">{subscription?.plan_type || 'Free'}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Total amount</p>
                            <p className="font-bold text-foreground text-base">
                                {subscription?.amount != null
                                    ? `₦${subscription.amount.toLocaleString()}`
                                    : subscription?.plan_type === 'pro'
                                        ? '₦6,000'
                                        : subscription?.plan_type === 'business'
                                            ? '₦18,000'
                                            : '₦0'}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Cycle</p>
                            <p className="font-bold text-foreground text-base capitalize">{subscription?.billing_cycle || 'Monthly'}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Next billing date</p>
                            <p className="font-bold text-foreground text-base">
                                {subscription?.next_billing_date ? format(new Date(subscription.next_billing_date), 'EEE, dd MMM yyyy') : 'N/A'}
                            </p>
                        </div>
                        <div className="space-y-2 text-left md:text-left">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Provider</p>
                            <p className="font-bold text-foreground text-base capitalize">{subscription?.payment_provider || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 ml-8">
                        <Button
                            onClick={handleUpgrade}
                            className="px-8 h-11 bg-primary hover:bg-primary/90 shadow-md font-bold rounded-xl whitespace-nowrap hidden sm:block"
                        >
                            Edit plan
                        </Button>
                        {subscription?.status === 'active' && !subscription?.cancel_at_period_end && (
                            <Button
                                onClick={handleCancel}
                                disabled={isCancelling}
                                variant="destructive"
                                className="px-6 h-11 font-bold rounded-xl whitespace-nowrap hidden sm:block shadow-sm"
                            >
                                {isCancelling ? "Cancelling..." : "Cancel plan"}
                            </Button>
                        )}
                        {subscription?.cancel_at_period_end && (
                            <div className="text-sm font-semibold text-destructive px-2 text-center whitespace-nowrap">
                                Cancels at period end
                            </div>
                        )}
                        {subscription?.next_plan_type && !subscription?.cancel_at_period_end && (
                            <div className="text-sm font-semibold text-amber-600 dark:text-amber-400 px-2 text-center whitespace-nowrap">
                                Switching to <span className="capitalize">{subscription.next_plan_type}</span> on {subscription?.end_date ? format(new Date(subscription.end_date), 'MMM dd') : 'period end'}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Payment Method Section */}
            <section className="space-y-6">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-foreground">Payment Method</h3>
                    <p className="text-sm text-muted-foreground font-normal">
                        Your bills will be sent from the default card shown below. <span className="text-foreground font-bold cursor-pointer hover:underline">Learn more.</span>
                    </p>
                </div>

                <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted border-b border-border">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="w-[50px] text-center"><Checkbox className="rounded-md border-border" /></TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Payment method</TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Ending</TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Status</TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Expiry</TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Status</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paymentMethods.length > 0 ? (
                                paymentMethods.map((pm: any, i: number) => (
                                    <TableRow key={i} className="hover:bg-muted/50 transition-colors border-border h-16 group">
                                        <TableCell className="text-center"><Checkbox className="rounded-md border-border" /></TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-7 rounded border border-border bg-background flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                                                    {pm.card_type?.includes('VISA') ? 'VISA' : pm.card_type?.includes('MASTER') ? 'MC' : pm.card_type?.slice(0, 4) || ''}
                                                </div>
                                                <span className="font-semibold text-foreground capitalize">{pm.provider}/{pm.card_type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-muted-foreground">**** {pm.last4}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-full px-2 py-0.5 text-[10px] lowercase font-bold dark:text-emerald-400">
                                                <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5 inline-block"></span>
                                                {pm.is_default ? 'Default' : 'Active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium text-muted-foreground">{pm.expiry || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-full px-2 py-0.5 text-[10px] lowercase font-bold dark:text-emerald-400">
                                                <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5 inline-block"></span>
                                                {pm.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="w-5 h-5 rounded border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No payment method on file. Make a card payment to save your payment method.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            {/* Invoices Section */}
            <section className="space-y-6">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-foreground">Invoices</h3>
                    <p className="text-sm text-muted-foreground font-normal">
                        Invoices are generated every 30 days and send to your default payment method. <span className="text-foreground font-bold cursor-pointer hover:underline">Learn more.</span>
                    </p>
                </div>

                <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted border-b border-border">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="w-[50px] text-center"><Checkbox className="rounded-md border-border" /></TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Description</TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Created on</TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Status</TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Amount</TableHead>
                                <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest h-11">Plan</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.length > 0 ? (
                                invoices.map((invoice) => (
                                    <TableRow key={invoice.id} className="hover:bg-muted/50 transition-colors border-border h-16 group">
                                        <TableCell className="text-center"><Checkbox className="rounded-md border-border" /></TableCell>
                                        <TableCell><span className="font-semibold text-foreground">Subscription purchase ({invoice.payment_provider})</span></TableCell>
                                        <TableCell className="font-medium text-muted-foreground">{format(new Date(invoice.transaction_date), 'MMMM dd, yyyy')}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[10px] lowercase font-bold ${invoice.status === 'successful' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' :
                                                invoice.status === 'failed' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400' :
                                                    'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
                                                }`}>
                                                <span className={`w-1 h-1 rounded-full mr-1.5 inline-block ${invoice.status === 'successful' ? 'bg-emerald-500' :
                                                    invoice.status === 'failed' ? 'bg-rose-500' :
                                                        'bg-amber-500'
                                                    }`}></span>
                                                {invoice.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium text-muted-foreground">{invoice.currency === 'usd' ? '$' : '₦'}{invoice.amount}</TableCell>
                                        <TableCell className="font-semibold text-foreground capitalize">BuildTracker {invoice.plan_type}</TableCell>
                                        <TableCell>
                                            <div className="w-5 h-5 rounded border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No invoices found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>
        </div>
    );
};
