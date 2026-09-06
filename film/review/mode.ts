/**
 * REVIEW MODE vs FILM MODE.
 *
 * While a shot is being judged it helps to see where and when it is: the street,
 * the clock, which plan is live. None of that belongs in a film a prospective
 * customer watches — it is the crew's handwriting on the edge of the frame, and
 * at 3840 wide there is a lot of it.
 *
 * So everything that is scaffolding rather than story is wrapped in <Meta>,
 * which renders nothing while REVIEW is false. Flip it to true to get the
 * annotated cut back for a critic pass; the film itself ships with it off.
 *
 * What is NOT metadata, and is therefore never wrapped: anything a merchant or
 * a customer would actually see inside the product. A plan's title, an offer's
 * terms, the rows on a phone, the channel ledger, the numbers on a chart. Those
 * are the product, and the product has to land.
 */
export const REVIEW = false;
