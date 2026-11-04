import { Link } from "react-router-dom";

const sections = [
  {
    title: "Information we handle",
    content: (
      <>
        <p>
          Depending on how you use VehicleTrack Pro, we may handle account and contact details,
          customer and vehicle information you enter (such as registration details and insurance,
          road tax or PUC dates), subscription and payment-status information, and messages you send
          to our support team.
        </p>
        <p>
          We also receive basic technical information needed to operate and protect the service,
          such as browser/device details, log and diagnostic data, and session information.
        </p>
      </>
    ),
  },
  {
    title: "How we use information",
    content: (
      <ul>
        <li>
          To create and manage accounts, provide the service and its features, and support users.
        </li>
        <li>
          To organize vehicle records, show expiry information and help prepare follow-up reminders.
        </li>
        <li>To administer subscriptions, respond to enquiries, and communicate service updates.</li>
        <li>To maintain security, troubleshoot issues, prevent misuse and improve reliability.</li>
        <li>
          To meet legal obligations and protect the rights and safety of users and the service.
        </li>
      </ul>
    ),
  },
  {
    title: "Customer and vehicle records",
    content: (
      <>
        <p>
          Users are responsible for ensuring they have permission to enter and manage information
          about their customers and vehicles. Use that information only for legitimate service
          purposes and follow the privacy obligations that apply to you.
        </p>
        <p>
          VehicleTrack Pro does not send WhatsApp reminders automatically. The reminder feature may
          prepare a message and open WhatsApp; you decide whether to send it, and WhatsApp then
          processes that communication under its own terms and privacy policy.
        </p>
      </>
    ),
  },
  {
    title: "When information may be shared",
    content: (
      <>
        <p>
          We do not sell personal information. We may share information with service providers that
          help us host, operate, secure or support VehicleTrack Pro, and with payment or messaging
          providers when those services are used. They may process information only as needed for
          their services and subject to their own terms.
        </p>
        <p>
          We may also disclose information when required by law, to address security or fraud, or to
          protect users, the public or our legal rights. If the service is reorganized or
          transferred, information may be handled as part of that transaction with appropriate
          safeguards.
        </p>
      </>
    ),
  },
  {
    title: "Retention and security",
    content: (
      <p>
        We keep information for as long as needed to provide the service, maintain records, resolve
        disputes and meet legal requirements. Retention can vary by data type and account status. We
        use reasonable safeguards designed to protect information, but no online service or storage
        method can be guaranteed completely secure.
      </p>
    ),
  },
  {
    title: "Your choices and requests",
    content: (
      <p>
        You can review and update information through your account where those controls are
        available. To ask about access, correction or deletion, or to close an account, contact us
        through our <Link to="/contact">Contact page</Link>. We may need to retain some information
        where the law requires it or where it is needed for legitimate operational purposes.
      </p>
    ),
  },
  {
    title: "Third-party services and children",
    content: (
      <>
        <p>
          The service may link to or work with third-party services. Their handling of information
          is governed by their own privacy notices, not this policy. VehicleTrack Pro is intended
          for business users and is not designed for children.
        </p>
      </>
    ),
  },
  {
    title: "Changes and contact",
    content: (
      <p>
        We may update this policy as the service changes. We will post the current version on this
        page and update the date below. For questions or privacy requests, please use our{" "}
        <Link to="/contact">Contact page</Link>.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 rounded-3xl bg-[#091525] px-6 py-10 text-white sm:px-10 sm:py-14">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-300">Legal</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            This policy explains how VehicleTrack Pro handles information when you use our vehicle
            document management service.
          </p>
          <p className="mt-5 text-sm text-slate-400">Last updated: November 4, 2026</p>
        </header>

        <div className="space-y-5">
          {sections.map(({ title, content }, index) => (
            <section
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <h2 className="text-xl font-bold text-slate-900">
                {index + 1}. {title}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600 [&_a]:font-semibold [&_a]:text-cyan-800 [&_a]:underline [&_li]:ml-5 [&_li]:list-disc">
                {content}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
