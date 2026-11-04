import { Link } from "react-router-dom";

const sections = [
  {
    title: "Using the service",
    paragraphs: [
      <>
        VehicleTrack Pro provides tools to organize customer and vehicle records, track insurance,
        road tax and PUC dates, and prepare renewal follow-ups. You must use the service lawfully,
        provide accurate account information and keep your sign-in credentials secure.
      </>,
      <>
        You are responsible for activity under your account and for limiting access to people you
        authorize. Tell us promptly if you believe your account has been accessed without
        permission.
      </>,
    ],
  },
  {
    title: "Your records and responsibilities",
    paragraphs: [
      <>
        You retain responsibility for the customer and vehicle information you add. You confirm that
        you have the rights and permissions needed to use that information in the service, and that
        you will protect it and handle it in accordance with applicable privacy and confidentiality
        requirements.
      </>,
      <>
        You are responsible for checking document details and expiry dates and for taking any
        required action. VehicleTrack Pro is an organizational and reminder aid; it does not renew
        policies or permits, guarantee delivery of a reminder, or replace official records,
        professional advice or applicable legal requirements.
      </>,
    ],
  },
  {
    title: "Acceptable use",
    paragraphs: [
      <>
        Do not use the service to break the law, infringe another person&apos;s rights, upload
        harmful or unauthorized content, interfere with service security or availability, or attempt
        to access another user&apos;s account or data. Do not copy, resell or misuse the service
        except as permitted by law or with our written permission.
      </>,
      <>
        You must also comply with the terms of any third-party service you choose to use, including
        WhatsApp. Reminders are not sent automatically; you control whether a prepared message is
        sent through that service.
      </>,
    ],
  },
  {
    title: "Plans, payments and access",
    paragraphs: [
      <>
        Some features require a paid subscription. Applicable plan details, prices, duration and
        payment instructions are shown on the <Link to="/pricing">Pricing page</Link> or during
        renewal. Access to paid features may depend on successful renewal and account status.
      </>,
      <>
        You are responsible for reviewing the plan and payment details before purchase. Contact us
        through the <Link to="/contact">Contact page</Link> for questions about a subscription,
        payment or account. Any cancellation, refund or renewal terms presented at purchase or
        required by law will apply.
      </>,
    ],
  },
  {
    title: "Service availability and changes",
    paragraphs: [
      <>
        We work to keep VehicleTrack Pro available and reliable, but uninterrupted or error-free
        operation cannot be guaranteed. We may maintain, update, suspend or change parts of the
        service for operational, security or legal reasons.
      </>,
      <>
        We may restrict or suspend access if reasonably necessary to protect users, address misuse,
        comply with law or resolve a serious security issue. Where practical, we will provide notice
        and an opportunity to resolve the issue.
      </>,
    ],
  },
  {
    title: "Privacy",
    paragraphs: [
      <>
        Our <Link to="/privacy-policy">Privacy Policy</Link> describes how information is handled
        when you use the service. By using VehicleTrack Pro, you acknowledge that policy.
      </>,
    ],
  },
  {
    title: "Disclaimers and liability",
    paragraphs: [
      <>
        To the extent permitted by applicable law, the service is provided on an &quot;as
        available&quot; basis. We do not warrant that it will be uninterrupted or that every record,
        date or reminder will be error-free. You should maintain appropriate copies of important
        records and independently verify time-sensitive information.
      </>,
      <>
        To the extent permitted by law, VehicleTrack Pro will not be liable for indirect or
        consequential losses arising from use of the service, including a missed renewal or
        reminder. Nothing in these terms limits liability that cannot lawfully be limited.
      </>,
    ],
  },
  {
    title: "Updates and contact",
    paragraphs: [
      <>
        We may update these terms as our service or legal requirements change. The latest version
        will appear here with its updated date. Continued use after an update takes effect means you
        accept the revised terms, to the extent allowed by law.
      </>,
      <>
        Questions about these terms? Please contact us through our{" "}
        <Link to="/contact">Contact page</Link>.
      </>,
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 rounded-3xl bg-[#091525] px-6 py-10 text-white sm:px-10 sm:py-14">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-300">Legal</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            These terms describe the basic rules for using VehicleTrack Pro.
          </p>
          <p className="mt-5 text-sm text-slate-400">Last updated: November 4, 2026</p>
        </header>

        <div className="space-y-5">
          {sections.map(({ title, paragraphs }, index) => (
            <section
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <h2 className="text-xl font-bold text-slate-900">
                {index + 1}. {title}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600 [&_a]:font-semibold [&_a]:text-cyan-800 [&_a]:underline">
                {paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
