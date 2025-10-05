from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
import stripe

from app.config import settings
from app.services.supabase_service import supabase_client
from app.routers.voice import get_current_user

router = APIRouter()
stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateCheckoutRequest(BaseModel):
    price_id: str
    success_url: str
    cancel_url: str

@router.post("/create-checkout")
async def create_checkout_session(
    request: CreateCheckoutRequest,
    user: dict = Depends(get_current_user)
):
    """Create Stripe checkout session"""
    try:
        checkout_session = stripe.checkout.Session.create(
            customer_email=user.email,
            client_reference_id=user.id,
            line_items=[{
                "price": request.price_id,
                "quantity": 1,
            }],
            mode="subscription",
            success_url=request.success_url,
            cancel_url=request.cancel_url,
        )
        
        return {"checkout_url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Handle checkout.session.completed
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["client_reference_id"]
        
        # Upgrade user to Pro
        supabase_client.table("profiles")\
            .update({
                "tier": "pro",
                "generations_limit": 500,
                "stripe_customer_id": session["customer"],
                "stripe_subscription_id": session["subscription"]
            })\
            .eq("user_id", user_id)\
            .execute()
    
    # Handle subscription deleted/cancelled
    elif event["type"] in ["customer.subscription.deleted", "customer.subscription.updated"]:
        subscription = event["data"]["object"]
        
        if subscription["status"] != "active":
            # Downgrade to free
            supabase_client.table("profiles")\
                .update({
                    "tier": "free",
                    "generations_limit": 10
                })\
                .eq("stripe_subscription_id", subscription["id"])\
                .execute()
    
    return {"status": "success"}

@router.get("/subscription")
async def get_subscription(user: dict = Depends(get_current_user)):
    """Get current subscription info"""
    try:
        profile = supabase_client.table("profiles")\
            .select("*")\
            .eq("user_id", user.id)\
            .single()\
            .execute()
        
        subscription_info = {
            "tier": profile.data["tier"],
            "status": "active" if profile.data["tier"] == "pro" else "free"
        }
        
        # Get Stripe subscription if pro
        if profile.data.get("stripe_subscription_id"):
            try:
                subscription = stripe.Subscription.retrieve(
                    profile.data["stripe_subscription_id"]
                )
                subscription_info["next_billing_date"] = subscription["current_period_end"]
                subscription_info["cancel_at_period_end"] = subscription["cancel_at_period_end"]
            except:
                pass
        
        return subscription_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))