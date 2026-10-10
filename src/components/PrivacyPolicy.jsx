import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="tab-container">
      <div className="section-header">
        <div>
          <h2>Privacy Policy</h2>
          <p>Effective Date: October 10, 2026</p>
        </div>
      </div>

      <div className="card form-card legal-document">
        <h3>1. Information Collection</h3>
        <p>
          AegisGuard collects user-submitted text and metadata strictly for content moderation analysis, safety policy enforcement, and model inference. Submissions processed via Google Gemini API are handled in accordance with Google Enterprise Privacy Standards.
        </p>

        <h3>2. Data Usage and Security</h3>
        <p>
          Data submitted to the automated moderation pipeline is evaluated in real time. We do not sell user data or personal identification information to third parties. All API transactions are encrypted via TLS 1.3.
        </p>

        <h3>3. Data Retention</h3>
        <p>
          Flagged queue items and user appeals are retained for moderation audit logs and model fine-tuning verification. Unflagged clean content is processed statelessly and discarded immediately after prediction scoring.
        </p>

        <h3>4. User Rights and Appeals</h3>
        <p>
          Users have the right to request access to moderation decision records regarding their accounts and submit dispute appeals through our User Appeals & Disputes Center.
        </p>
      </div>
    </div>
  );
}
