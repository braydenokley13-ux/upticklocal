"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";

const AUDIENCES = ["Family & Parent", "Health & Wellness", "Commuter & Driver", "Not sure yet"];
const BUDGETS = ["Under $500", "$500 – $1,500", "$1,500 – $5,000", "$5,000+"];

export default function CampaignInquiryForm() {
  const [sent, setSent] = useState(false);

  // Swap for a POST to the campaign-inquiry endpoint when the backend exists.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="inquiry" className="formband formband--ruled">
      <div className="formband__grid">
        <Reveal>
          <div className="kicker">CAMPAIGN INQUIRY</div>
          <h2 className="formband__title">Tell us who and where.</h2>
          <p className="formband__lead">
            We&#8217;ll come back with available screens, reach, and a plan &mdash; usually within two
            business days.
          </p>
        </Reveal>

        {sent ? (
          <div className="sent">
            <span className="sent__mark" aria-hidden="true" />
            <h3 className="sent__title">Inquiry received.</h3>
            <p className="sent__body">
              A campaign planner will reply with availability in your area.
            </p>
          </div>
        ) : (
          <Reveal as="form" className="form" onSubmit={onSubmit}>
            <div className="form__pair">
              <label className="field">
                BUSINESS
                <input required name="business" placeholder="Northside Orthodontics" />
              </label>
              <label className="field">
                AUDIENCE
                <select name="audience" defaultValue={AUDIENCES[0]}>
                  {AUDIENCES.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form__pair">
              <label className="field">
                GEOGRAPHY
                <input required name="geography" placeholder="ZIPs, radius, or neighborhoods" />
              </label>
              <label className="field">
                MONTHLY BUDGET
                <select name="budget" defaultValue={BUDGETS[0]}>
                  {BUDGETS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              EMAIL
              <input required type="email" name="email" placeholder="you@business.com" />
            </label>
            <button type="submit" className="btn btn--amber btn--block">
              Send Inquiry<span aria-hidden="true">&#8594;</span>
            </button>
          </Reveal>
        )}
      </div>
    </section>
  );
}
