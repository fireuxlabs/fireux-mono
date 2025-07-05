# Stripe Integration Endpoints

This directory contains Stripe-related API endpoints for handling payments and subscriptions in the FireUX system.

## 📁 Files Overview

### `create-product.post.ts`

**Purpose**: Creates subscription products/plans in Stripe that customers can subscribe to.

**What it creates**:

- ✅ Stripe Product (e.g., "FireUX App - Pro Plan")
- ✅ Stripe Prices (monthly/yearly pricing)
- ✅ Firestore sync via `/api/firestore/update-document`

**Use case**: Setting up subscription plans for an app (Pro, Enterprise, etc.)

**Example**:

```javascript
// Creates a "Pro Plan" product with monthly/yearly prices
POST /api/stripe/create-product
{
  "name": "MyApp - Pro Plan",
  "appId": "my-app",
  "slug": "my-app-pro",
  "creator_id": "user123",
  "product_type": "subscription",
  "prices": [
    { "currency": "eur", "unit_amount": 999, "type": "recurring", "interval": "month" },
    { "currency": "eur", "unit_amount": 9999, "type": "recurring", "interval": "year" }
  ]
}
```

### `create-subscription.post.ts`

**Purpose**: Creates actual customer subscriptions in Stripe (customer pays for a product).

**What it creates**:

- ✅ Stripe Subscription (customer's active payment)
- ✅ Firestore sync via `/api/firestore/update-document`

**Use case**: When a customer subscribes to an existing product/plan

**Example**:

```javascript
// Customer subscribes to the Pro Plan
POST /api/stripe/create-subscription
{
  "customerId": "cus_stripe123",
  "priceId": "price_stripe456", // From the product created above
  "appId": "my-app",
  "userId": "user789",
  "trial_period_days": 7
}
```

## 🔄 Typical Flow

1. **Setup Phase** (`create-product`):

   ```
   App Creation → create-product (Pro Plan) → Firestore
                → create-product (Enterprise Plan) → Firestore
   ```

2. **Customer Subscription** (`create-subscription`):
   ```
   Customer Checkout → create-subscription → Firestore
   ```

## 🎯 Key Differences

| Aspect             | create-product                      | create-subscription                                 |
| ------------------ | ----------------------------------- | --------------------------------------------------- |
| **Purpose**        | Setup subscription plans            | Customer subscribes                                 |
| **Timing**         | App initialization                  | Customer action                                     |
| **Creates**        | Products + Prices                   | Customer subscription                               |
| **Stripe Objects** | Product, Price                      | Subscription                                        |
| **Firestore Path** | `apps/{appId}/products/{productId}` | `apps/{appId}/users/{userId}/subscriptions/{subId}` |

## 🏗️ Integration with Other Endpoints

- **`/api/app/ensure-app`**: Calls `create-product` to setup default Pro/Enterprise plans
- **`/api/firestore/update-document`**: Used by both endpoints for data persistence
- **Frontend checkout**: Would call `create-subscription` when customer pays

## 📝 Notes

- Products are created once per app (during setup)
- Subscriptions are created per customer (during checkout)
- Both endpoints automatically sync data to Firestore
- Use `ping/pong` for testing and debugging
- All endpoints use Stripe API version `2025-06-30.basil`
