import stripe
from app.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeService:
    @staticmethod
    def create_price_ids():
        """
        Create Stripe products and prices
        Run this once to set up your pricing
        """
        # Pro Monthly
        pro_product = stripe.Product.create(
            name="VoiceClone Pro",
            description="500 generations per month"
        )
        
        pro_price = stripe.Price.create(
            product=pro_product.id,
            unit_amount=900,  # $9.00
            currency="usd",
            recurring={"interval": "month"}
        )
        
        print(f"Pro Price ID: {pro_price.id}")
        return pro_price.id