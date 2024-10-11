"use server";

import { client } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
	typescript: true,
	apiVersion: "2024-04-10",
});

const MINIMUM_AMOUNT = 50; // Minimum amount in cents (for USD)

export const onCreateCustomerPaymentIntentSecret = async (
	amount: number,
	stripeId: string
) => {
	if (amount < MINIMUM_AMOUNT) {
		throw new Error(`Amount must be at least $0.50 (50 cents).`);
	}

	try {
		const paymentIntent = await stripe.paymentIntents.create(
			{
				currency: "usd",
				amount: amount * 100, // Convert to cents
				automatic_payment_methods: {
					enabled: true,
				},
			},
			{ stripeAccount: stripeId }
		);

		if (paymentIntent) {
			return { secret: paymentIntent.client_secret };
		}
	} catch (error) {
		console.log(error);
	}
};

export const onUpdateSubscription = async (
	plan: "STANDARD" | "PRO" | "ULTIMATE"
) => {
	try {
		const user = await currentUser();
		if (!user) return;
		const update = await client.user.update({
			where: {
				clerkId: user.id,
			},
			data: {
				subscription: {
					update: {
						data: {
							plan,
							credits:
								plan == "PRO"
									? 50
									: plan == "ULTIMATE"
									? 500
									: 10,
						},
					},
				},
			},
			select: {
				subscription: {
					select: {
						plan: true,
					},
				},
			},
		});
		if (update) {
			return {
				status: 200,
				message: "subscription updated",
				plan: update.subscription?.plan,
			};
		}
	} catch (error) {
		console.log(error);
	}
};

const setPlanAmount = (item: "STANDARD" | "PRO" | "ULTIMATE") => {
	if (item == "PRO") {
		return 1500;
	}
	if (item == "ULTIMATE") {
		return 3500;
	}
	return 0;
};

export const onGetStripeClientSecret = async (
	item: "STANDARD" | "PRO" | "ULTIMATE"
) => {
	const amount = setPlanAmount(item);

	console.log(`Calculated amount for ${item}: ${amount}`); // Log the amount

	if (amount < MINIMUM_AMOUNT) {
		// Handle free plan differently
		if (item === "STANDARD") {
			return { secret: null }; // Or handle as needed for free plans
		}
		throw new Error(`Amount must be at least $0.50 (50 cents).`);
	}

	try {
		const paymentIntent = await stripe.paymentIntents.create({
			currency: "usd",
			amount: amount, // Ensure this is in cents
			automatic_payment_methods: {
				enabled: true,
			},
		});

		if (paymentIntent) {
			return { secret: paymentIntent.client_secret };
		}
	} catch (error) {
		console.log(error);
	}
};
