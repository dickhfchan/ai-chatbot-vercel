# Stripe Integration Setup

This document explains how to set up Stripe integration for the pricing page.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..." # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY="pk_test_..." # Your Stripe publishable key (optional for this implementation)
STRIPE_WEBHOOK_SECRET="whsec_..." # Webhook endpoint secret
NEXT_PUBLIC_STRIPE_PRICE_ID="price_..." # The price ID for your $9.90/month subscription
```

## Stripe Dashboard Setup

1. **Create a Product and Price:**
   - Go to your Stripe Dashboard
   - Navigate to Products
   - Create a new product called "Pro Plan"
   - Set the price to $9.90 USD, recurring monthly
   - Copy the price ID (starts with `price_`) and add it to `NEXT_PUBLIC_STRIPE_PRICE_ID`

2. **Set up Webhooks:**
   - Go to Webhooks in your Stripe Dashboard
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the webhook secret and add it to `STRIPE_WEBHOOK_SECRET`

## Testing

For testing, use Stripe's test mode:
- Use test API keys (starting with `sk_test_` and `pk_test_`)
- Use test card numbers like `4242 4242 4242 4242`
- Any future date for expiry, any 3-digit CVC

## Production Deployment

1. Switch to live mode in Stripe Dashboard
2. Update environment variables with live keys
3. Update webhook endpoint URL to your production domain
4. Test the complete flow in production

## Features Implemented

- ✅ Pricing page with $9.90/month subscription plan
- ✅ Stripe Checkout integration
- ✅ Success/cancel page handling
- ✅ Webhook handling for subscription events
- ✅ Navigation link in sidebar
- ✅ Responsive design

## Next Steps

To complete the integration, you may want to:
- Add subscription status to user database schema
- Implement subscription management (cancel, upgrade, etc.)
- Add usage limits based on subscription status
- Implement billing history page
