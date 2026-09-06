import { ECONOMICS } from "../../data/joes";
import { GrowthPlanCard, PLAN_ROWS, type PlanReveal } from "../../primitives/GrowthPlan";
import { Mono } from "../../primitives/Type";
import { COLOR, FONT } from "../../tokens";
import { useTextWidths } from "../../typography/measure";

/**
 * The plan exactly as Hero 2 leaves it on the page: bare, one weight, the
 * two mint uprights bracketing 7–10 AM, Joe's rule beneath Approve. Act V
 * starts from this frame so the cut between the two is invisible.
 */
export const PLAN_X = 96;
export const PLAN_Y = 266;
export const ROW_PX = 40;
const ROW_FONT = `300 ${ROW_PX}px 'Geist Film'`;

export const planRowTop = (key: keyof typeof PLAN_ROWS) => PLAN_Y + PLAN_ROWS[key] + 14;
/** Where the word Approve sits: its optical centre, for a tap. */
export const APPROVE_AT = { x: PLAN_X + 66, y: planRowTop("approve") + ROW_PX * 0.45 };

export function PlanAtRest({
  press = 0,
  fill = 0,
  reveal = {},
  uprights = 1,
  rule = 1,
  header = 1,
  headerRight = "Thursday · 6:46 PM",
}: {
  press?: number;
  fill?: number;
  reveal?: PlanReveal;
  uprights?: number;
  rule?: number;
  header?: number;
  headerRight?: string;
}) {
  const rowW = useTextWidths(["Friday · ", "Friday · 7–10 AM"], ROW_FONT);
  if (!rowW) return null;
  return (
    <>
      <div style={{ position: "absolute", left: PLAN_X, top: 84, opacity: header }}>
        <Mono color={COLOR.inkFaint}>Joe's Fuel &amp; Go · 118 Main St</Mono>
      </div>
      <div style={{ position: "absolute", right: PLAN_X, top: 84, opacity: header, textAlign: "right" }}>
        <Mono color={COLOR.inkFaint}>{headerRight}</Mono>
      </div>
      <GrowthPlanCard x={PLAN_X} y={PLAN_Y} bare labels={false} rules={false} titleSize={88} rowSize={ROW_PX} approveStyle="plain" press={press} fill={fill} reveal={reveal} />
      {[rowW[0] - 6, rowW[1] + 6].map((dx, k) => (
        <div key={k} style={{ position: "absolute", left: PLAN_X + dx, top: planRowTop("window") - 2, width: 2, height: ROW_PX + 6, background: COLOR.mintDeep, opacity: uprights * (reveal.window ?? 1) }} />
      ))}
      <div style={{ position: "absolute", left: PLAN_X, top: PLAN_Y + PLAN_ROWS.approve + 74, opacity: rule, fontFamily: FONT.sans, fontWeight: 300, fontSize: 28, color: COLOR.amberDeep, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
        {ECONOMICS.fuelRule.replace(".", "")} — {ECONOMICS.fuelRuleTag.replace(".", "")}
      </div>
    </>
  );
}
