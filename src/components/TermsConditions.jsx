import React from 'react';
import { Scale, FileText } from 'lucide-react';

export default function TermsConditions() {
  return (
    <div className="tab-container">
      <div className="section-header">
        <div>
          <h2>Terms and Conditions</h2>
          <p>Effective Date: October 10, 2026</p>
        </div>
      </div>

      <div className="card form-card legal-document">
        <h3>1. Acceptance of Terms</h3>
        <p>
          By accessing or using the AegisGuard Content Moderation Platform, you agree to be bound by these Terms and Conditions.
        </p>

        <h3>2. Acceptable Use Policy</h3>
        <p>
          Users must not utilize this platform to generate malicious spam, hate speech, illegal material, or financial scams. Automated API rate limits are enforced to maintain service stability.
        </p>

        <h3>3. Moderation Enforcement and Appeals</h3>
        <p>
          Content flagged with confidence scores exceeding system thresholds may be subjected to automated blocking or human review queue routing. Users retain the right to submit contextual dispute appeals.
        </p>

        <h3>4. Limitation of Liability</h3>
        <p>
          AegisGuard provides automated content evaluation assistance. Platform operators remain responsible for final administrative actions in accordance with local laws.
        </p>
      </div>
    </div>
  );
}
