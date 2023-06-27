import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRETE_KEY, {
  apiVersion: '2022-11-15'
  appInfo: {
    name: 'Gr shop'
  }
})