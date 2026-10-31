import type { Metadata } from "next";
import {
  PolicyList,
  PolicyPage,
  PolicySection,
} from "@/components/legal/PolicyPage";

export const metadata: Metadata = {
  title: "Data Security Policy | Invoice SaaS",
  description:
    "How Invoice SaaS collects, stores, protects, and retains business and personal data.",
};

const UPDATED_AT = "October 31, 2026";

export default function DataSecurityPolicyPage() {
  return (
    <PolicyPage
      title="Data Security Policy"
      description="This policy explains how Invoice SaaS handles the information you entrust to us, the security controls we use to protect it, and the choices available to you. It applies to our website, web dashboard, any official mobile application we make available, and related services."
      updatedAt={UPDATED_AT}
    >
      <PolicySection title="1. Overview">
        <p>
          Invoice SaaS provides invoicing, payment tracking, expense management,
          inventory, reporting, and team access tools for small and growing
          businesses, with a focus on customers in Bangladesh. Protecting your
          business records is central to that service. We aim to apply
          appropriate technical and organisational safeguards to keep your data
          confidential, accurate, and available.
        </p>
        <p>
          This policy should be read together with the agreement you accepted
          when creating an account and with our Return &amp; Refund Policy.
        </p>
      </PolicySection>

      <PolicySection title="2. Scope">
        <p>This policy covers data processed through:</p>
        <PolicyList
          items={[
            "Our public website and marketing pages.",
            "The Invoice SaaS web dashboard and business workspace.",
            "Any official mobile application we make available and any connected integrations.",
            "Support, billing, and account administration channels, including email and WhatsApp.",
          ]}
        />
      </PolicySection>

      <PolicySection title="3. Information We Collect">
        <p>We collect the information needed to provide and secure the service:</p>
        <PolicyList
          items={[
            "Account information such as your name, email address, phone number, business name, and login credentials.",
            "Business and transaction data that you enter, including invoices, payments, expenses, products, customers, suppliers, and inventory records.",
            "Team information for sub-users you add, such as name, email address, and the permissions you assign to them.",
            "Technical information such as IP address, browser type, device information, session identifiers, and security logs.",
            "Subscription information, including your plan, activation and expiry dates, and transaction references for your payments.",
            "Communications you send to our support team, including messages and attachments you choose to share.",
          ]}
        />
      </PolicySection>

      <PolicySection title="4. Payment Information">
        <p>
          Subscription payments are processed online by our payment gateway
          partner, SSLCommerz. We receive the plan selected, the amount and
          currency charged, the payment status, and a transaction reference. That
          information is used only to activate or extend your subscription, to
          keep your billing history, and to handle refunds and disputes.
        </p>
        <PolicyList
          items={[
            "We never ask for your bKash PIN, one-time password (OTP), card password, or the password to your payment account. Anyone who asks you for those is not us.",
            "Card numbers, mobile-wallet credentials, and bank login details are entered only on the SSLCommerz hosted checkout page and are handled by SSLCommerz and the relevant bank or wallet. We do not receive or store them.",
            "We do not store your full card number or wallet credentials in our systems. Only a gateway transaction reference and the payment result are kept.",
            "Payment references are retained as part of your billing history for accounting, tax, refund, and dispute-resolution purposes.",
          ]}
        />
      </PolicySection>

      <PolicySection title="5. How We Protect Your Data">
        <p>
          We use a combination of preventive, detective, and recovery controls.
          No system can be guaranteed completely secure, but we work to reduce
          risk on an ongoing basis.
        </p>
        <PolicyList
          items={[
            "Encryption in transit: data sent between your browser or app and our servers is protected using TLS/HTTPS.",
            "Password protection: passwords are stored only as one-way bcrypt hashes and are never stored or displayed in readable form.",
            "Email verification: new accounts are verified with a time-limited six-digit code before the account becomes usable.",
            "Authentication: business accounts use signed access and refresh tokens. Each session is recorded with its device and IP address, expires automatically, and can be revoked on logout, password reset, or deactivation.",
            "Administrator protection: system administrators must complete an additional one-time password (OTP) step, sent to their email and valid for a short period, after entering their password.",
            "Access control: role-based permissions and the principle of least privilege limit access to business data and administrative functions. Sub-users can only reach data belonging to the business that invited them.",
            "Abuse prevention: rate limits on login, verification, and password-reset attempts help prevent password guessing and automated abuse.",
            "Monitoring and logging: we record security-relevant events, including login activity and administrative actions, so that unusual activity can be investigated.",
            "Backups and recovery: we maintain backup and recovery processes designed to protect against accidental loss or service disruption.",
            "Secure development: dependencies and application changes are reviewed and updated to address known vulnerabilities, and production credentials are kept out of source code.",
          ]}
        />
      </PolicySection>

      <PolicySection title="6. Data Retention">
        <p>
          We retain account and business data for as long as your account is
          active and for a reasonable period afterwards where needed to comply
          with legal, tax, accounting, or dispute-resolution obligations. When
          data is no longer required, we delete it or anonymise it using
          reasonable technical measures.
        </p>
        <p>
          Some records, such as invoices, payment history, and subscription
          activation records, may need to be retained for statutory periods even
          after you close your account.
        </p>
      </PolicySection>

      <PolicySection title="7. Data Sharing and Third Parties">
        <p>
          We do not sell your personal or business data. We share information
          only where necessary to operate the service, including with:
        </p>
        <PolicyList
          items={[
            "Hosting, database, and infrastructure providers that store and process data on our behalf.",
            "Email and notification providers used for account verification, security codes, password resets, and service messages.",
            "Payment channels and providers used to confirm subscription payments and, where applicable, process online payments.",
            "Professional advisers, auditors, or authorities where required by law or necessary to protect our legal rights.",
          ]}
        />
        <p>
          Service providers are expected to protect data and to use it only for
          the purposes for which it was shared.
        </p>
      </PolicySection>

      <PolicySection title="8. International Data Transfers">
        <p>
          Our providers may process data in countries other than your own. Where
          this happens, we take reasonable steps to ensure that appropriate
          safeguards are in place and that data remains protected in line with
          this policy.
        </p>
      </PolicySection>

      <PolicySection title="9. Your Responsibilities">
        <p>
          You play an important role in keeping your account secure. Please:
        </p>
        <PolicyList
          items={[
            "Use a strong, unique password and keep it confidential. We require at least eight characters with upper-case, lower-case, and numeric characters.",
            "Limit access to authorised staff and assign only the permissions they need.",
            "Remove access promptly when a staff member leaves your organisation.",
            "Keep your contact email address up to date so you can receive verification codes, security notices, and subscription reminders.",
            "Never share your password, verification codes, card details, payment PIN, or one-time password with anyone, including someone claiming to represent us.",
            "Start subscription payments only from the checkout page inside your account, and report suspected fraud or unauthorised access to us without delay.",
          ]}
        />
      </PolicySection>

      <PolicySection title="10. Your Rights">
        <p>
          Depending on applicable law, you may have the right to access,
          correct, export, restrict, or delete your personal information. You may
          also object to certain processing. To make a request, contact us using
          the details below. We may need to verify your identity before acting
          on a request.
        </p>
        <p>
          If you are a sub-user, some requests may need to be made through the
          business owner who manages your account.
        </p>
      </PolicySection>

      <PolicySection title="11. Incident Response">
        <p>
          We maintain procedures for detecting, investigating, and responding to
          security incidents. If an incident is likely to result in a risk to
          your rights or data, we will notify affected customers and relevant
          authorities where required by law, and we will take reasonable steps
          to contain and remediate the issue.
        </p>
      </PolicySection>

      <PolicySection title="12. Contact Us">
        <p>
          Questions about this policy or our security practices can be sent to{" "}
          <a
            href="mailto:support@inventomanager.com"
            className="text-emerald-400 hover:text-emerald-300"
          >
            support@inventomanager.com
          </a>
          . Please include enough detail for us to understand your request.
        </p>
      </PolicySection>

      <PolicySection title="13. Changes to This Policy">
        <p>
          We may update this policy as the service or legal requirements change.
          The updated version will be posted on this page with a new effective
          date. Where changes are material, we will take reasonable steps to
          notify account holders.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
