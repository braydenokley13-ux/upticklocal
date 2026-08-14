"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";

const LOCATION_TYPES = [
  "Restaurant / Café",
  "Convenience / Gas",
  "Gym / Fitness",
  "Salon / Barbershop",
  "Family / Kids",
  "Health / Wellness",
  "Automotive",
  "Other",
];

export default function HostApplicationForm() {
  const [sent, setSent] = useState(false);

  // Swap for a POST to the host-application endpoint when the backend exists.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="apply" className="formband">
      <div className="formband__grid">
        <Reveal>
          <div className="kicker">HOST APPLICATION</div>
          <h2 className="formband__title">See if your location is a fit.</h2>
          <p className="formband__lead">
            Two minutes. We&#8217;ll review foot traffic and coverage in your area, then reach out
            about installation.
          </p>
        </Reveal>

        {sent ? (
          <div className="sent">
            <span className="sent__mark" aria-hidden="true" />
            <h3 className="sent__title">Application received.</h3>
            <p className="sent__body">
              We review new locations weekly. Expect a note from the Uptick team within a few days.
            </p>
          </div>
        ) : (
          <Reveal as="form" className="form" onSubmit={onSubmit}>
            <div className="form__pair">
              <label className="field">
                BUSINESS NAME
                <input required name="business" placeholder="Riverside Deli &amp; Market" />
              </label>
              <label className="field">
                YOUR NAME
                <input required name="name" placeholder="Sam Ortiz" />
              </label>
            </div>
            <div className="form__pair">
              <label className="field">
                CITY / ZIP
                <input required name="area" placeholder="Queens, 11375" />
              </label>
              <label className="field">
                LOCATION TYPE
                <select name="type" defaultValue={LOCATION_TYPES[0]}>
                  {LOCATION_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              EMAIL
              <input required type="email" name="email" placeholder="sam@riversidedeli.com" />
            </label>
            <button type="submit" className="btn btn--amber btn--block">
              Submit Application<span aria-hidden="true">&#8594;</span>
            </button>
          </Reveal>
        )}
      </div>
    </section>
  );
}
