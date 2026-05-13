# Metrics

## North Star Metric
**Audits completed per week**

Why: An audit completed means a user saw the full value of SpendLens —
they inputted their stack and received a personalized recommendation.
This is the moment value is delivered, and it directly predicts 
lead volume for Credex. DAU is wrong for a tool people use once a 
quarter. Revenue is a lagging indicator at this stage.

## 3 Input Metrics

1. **Homepage → Audit completion rate**
   Measures whether the form is clear and trustworthy enough to complete.
   Target: >40%. Below 25% triggers a form redesign.

2. **Audit → Email capture rate**
   Measures whether the results page delivers enough value to earn an email.
   Target: >20%. Below 10% means the savings numbers aren't compelling 
   or credible.

3. **Email → Credex consultation booked rate**
   Measures lead quality and Credex offer relevance.
   Target: >5% of all leads, >15% of high-savings (>$500/mo) leads.

## What to Instrument First
- Mixpanel or Posthog events: form_started, form_completed, 
  audit_viewed, email_submitted, consultation_clicked
- Log savings bucket on each audit (0-100, 100-500, 500+)
- Track share button clicks as a virality signal

## Pivot Trigger
If after 500 audits: email capture rate < 8% AND 
consultation booked rate < 2%, the value proposition 
isn't landing. Pivot: simplify to a single-question 
entry ("What's your monthly AI bill?") and show 
benchmark data instead of personalized audit.
