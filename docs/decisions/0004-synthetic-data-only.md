# 0004 Synthetic data only
Status: accepted
Date: 2026-10-03

Context: ExaCare's product handles clinical referral packets (PHI). The POC must not touch real patient data and must not imply access to ExaCare's internals.
Decision: The POC uses invented data only, labeled as synthetic everywhere it appears. No claims about ExaCare's internal product beyond what they've published; ideas are framed as hypotheses from public material.
Alternatives: Real or realistic de-identified packets (rejected: no source and avoidable risk).
Consequences: The POC cannot connect to EHRs or real referral data, so it demonstrates a workflow on fake packets.
