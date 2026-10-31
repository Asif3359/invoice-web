import type { Metadata } from "next";
import {
  PolicyList,
  PolicyPage,
  PolicySection,
} from "@/components/legal/PolicyPage";

export const metadata: Metadata = {
  title: "Return & Refund Policy | Invoice SaaS",
  description:
    "Billing, renewal, cancellation, and refund terms for Invoice SaaS subscriptions paid online through SSLCommerz.",
};

const UPDATED_AT = "October 31, 2026";

export default function ReturnRefundPolicyPage() {
  return (
    <PolicyPage
      title="Return & Refund Policy"
      description="This policy explains how subscription payments, renewals, cancellations, and refunds work for Invoice SaaS. It applies to subscriptions purchased directly from us through our website or sales channels."
      updatedAt={UPDATED_AT}
    >
      <PolicySection title="1. Overview">
        <p>
          Invoice SaaS is a subscription-based software service. You pay for
          access to the platform for a defined period. Because the service is
          delivered digitally and access is made available immediately after
          activation, there is no physical product to return. This policy
          therefore deals with cancellations, renewals, and refunds rather than
          returns of goods.
        </p>
        <p>
          The general rule is that fees are non-refundable once a billing period
          has started and the service has been made available, except in the
          situations described below or where required by law.
        </p>
      </PolicySection>

      <PolicySection title="2. Plan and Pricing">
        <PolicyList
          items={[
            "Invoice SaaS Premium is currently offered as a single plan at ৳499 per month, payable in Bangladeshi Taka (BDT).",
            "The price, included features, and billing period are shown on our pricing page and are confirmed with you before payment.",
            "Subscription periods are prepaid. Access is granted for the period you paid for, not for an indefinite time.",
            "We may change prices or plan features in the future. Changes apply to future subscription periods and do not reduce access you have already paid for.",
          ]}
        />
      </PolicySection>

      <PolicySection title="3. Free Trial">
        <p>
          New business accounts may be eligible for a free trial. The trial
          starts when your email address is verified, and its length is shown
          when you register. When the trial ends, access to business features may
          be limited until you purchase a subscription. No refund is due for
          unused trial days, and creating multiple accounts to obtain additional
          trials is not permitted.
        </p>
      </PolicySection>

      <PolicySection title="4. Payment Method and Activation">
        <p>
          Subscriptions are paid online through our payment gateway partner,
          SSLCommerz. To pay, sign in to your business account, open the
          Subscription page, choose a plan, and complete the secure checkout
          page. SSLCommerz accepts bKash, Nagad, cards, and bank payments.
        </p>
        <PolicyList
          items={[
            "Your subscription is activated automatically once the gateway confirms the payment. You do not need to send us a transaction ID or contact us to activate it.",
            "The amount charged is the plan price shown on the checkout page. A payment is only applied when the amount and currency match the plan you selected.",
            "Payments that the gateway flags as risky may be held for review. In that case we will contact you before activation, or return the payment if it cannot be completed.",
            "Subscriptions purchased through our mobile application use the same online payment flow and the same terms.",
          ]}
        />
        <p>
          We never ask for your bKash PIN, one-time password (OTP), card
          password, or account password. Payment credentials are entered only on
          the SSLCommerz checkout page, never in a message, email, or phone call.
          If anyone asks you for those details while claiming to represent us, do
          not share them and report it to us.
        </p>
      </PolicySection>

      <PolicySection title="5. Renewals">
        <PolicyList
          items={[
            "Subscriptions do not renew automatically and we do not store your payment credentials. You must make a new payment before your current period ends to keep access without interruption.",
            "Your paid access continues until the end date recorded on your account, even if you choose not to renew.",
            "We may send reminders before your subscription expires, but you remain responsible for renewing on time.",
            "If your subscription expires, your account may still be accessible for viewing, but business features and data synchronisation may be restricted until you renew.",
          ]}
        />
      </PolicySection>

      <PolicySection title="6. Refund Eligibility">
        <p>We may approve a refund in the following circumstances:</p>
        <PolicyList
          items={[
            "Duplicate payment: you sent more than one payment for the same subscription period and the extra amount was not applied to a future period.",
            "Incorrect amount: you paid an amount different from the plan price confirmed to you, and the difference was not adjusted on your subscription.",
            "Payment not activated: the payment was confirmed by the gateway but your subscription was not extended, and we were unable to resolve the problem within a reasonable time.",
            "Service discontinuation: we discontinue the service or your plan and you have prepaid for a period that will not be delivered.",
            "Unauthorised transaction: you believe a payment was made from your bKash account without your authorisation. Contact your payment provider and us immediately.",
            "Statutory rights: where applicable consumer protection law gives you a right to a refund that cannot be excluded.",
          ]}
        />
        <p>
          Refund requests should normally be made within seven (7) days of the
          payment. Requests made later will be reviewed on their merits.
        </p>
      </PolicySection>

      <PolicySection title="7. Non-Refundable Items">
        <p>
          Except where required by law or expressly approved by us, we do not
          refund:
        </p>
        <PolicyList
          items={[
            "A subscription period that has already started, where the service was available and used.",
            "Unused time remaining after you decide to stop using the service or choose not to renew.",
            "Add-ons, setup, data migration, or professional services that have already been delivered.",
            "Third-party costs, including gateway or mobile-wallet charges, and services purchased separately.",
            "Payments sent to the wrong number, or losses caused by sharing your credentials or paying an unverified account.",
            "Accounts suspended or terminated for breach of our terms, misuse, or non-payment.",
          ]}
        />
      </PolicySection>

      <PolicySection title="8. Cancellation">
        <p>
          You can cancel by emailing support or contacting us through the
          channels listed on our website. Cancellation stops any further renewal
          and removes any reminder messages. Because subscriptions are prepaid
          and do not renew automatically, you will continue to have access until
          the end of the period you already paid for, and we do not pro-rate or
          refund that remaining time unless a refund is approved under this
          policy.
        </p>
      </PolicySection>

      <PolicySection title="9. Plan Changes">
        <p>
          If we introduce additional plans in the future, upgrades may take
          effect immediately with any price difference charged for the remaining
          period where supported, and downgrades normally take effect at the
          start of the next subscription period. Changing plans does not create a
          refund for the unused portion of the previous plan unless we expressly
          agree.
        </p>
      </PolicySection>

      <PolicySection title="10. How to Request a Refund">
        <p>
          Email{" "}
          <a
            href="mailto:support@inventomanager.com"
            className="text-emerald-400 hover:text-emerald-300"
          >
            support@inventomanager.com
          </a>{" "}
          with the subject line &quot;Refund Request&quot;, or message us on
          our support channels, and include:
        </p>
        <PolicyList
          items={[
            "The email address associated with your account.",
            "The transaction ID shown on your payment confirmation or in your billing history.",
            "The date, amount, and the payment method used at checkout.",
            "A short explanation of why you are requesting a refund, including any screenshots of the payment confirmation.",
          ]}
        />
        <p>
          We may ask for additional information to verify the account or the
          transaction.
        </p>
      </PolicySection>

      <PolicySection title="11. Processing Time">
        <p>
          We aim to review refund requests within five (5) business days. If a
          refund is approved, we process it through SSLCommerz back to the
          original payment method used at checkout, unless we agree on another
          method. Depending on your payment provider or bank, the refund may take
          five to ten (5–10) business days or longer to appear.
        </p>
      </PolicySection>

      <PolicySection title="12. Disputes and Chargebacks">
        <p>
          If you believe a payment is wrong, please contact us first so we can
          investigate and, where appropriate, refund it directly. If you raise a
          dispute with your payment provider or bank instead, we will cooperate
          with the provider and SSLCommerz and provide the relevant transaction
          records. While a dispute is under review we may temporarily restrict
          the affected subscription, and we will restore it if the payment is
          confirmed as valid.
        </p>
      </PolicySection>

      <PolicySection title="13. Service Termination by Us">
        <p>
          If we discontinue a plan or the service and you have prepaid for a
          period that will not be delivered, we will provide a pro-rated refund
          for the affected unused period, unless a suitable replacement or
          alternative arrangement is agreed with you.
        </p>
      </PolicySection>

      <PolicySection title="14. Contact Us">
        <p>
          For billing questions or refund requests, email{" "}
          <a
            href="mailto:support@inventomanager.com"
            className="text-emerald-400 hover:text-emerald-300"
          >
            support@inventomanager.com
          </a>{" "}
          or contact us through the support channels listed on our website.
          Include your account email and transaction reference so we can help
          you faster.
        </p>
      </PolicySection>

      <PolicySection title="15. Changes to This Policy">
        <p>
          We may update this policy from time to time. The revised version will
          be posted on this page with a new effective date. Changes apply to
          future purchases and renewal periods and do not affect rights that
          have already arisen.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
