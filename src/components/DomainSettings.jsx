import React, { useState } from 'react';
import { Globe, CheckCircle2, ShieldCheck, Server, RefreshCw, Key } from 'lucide-react';

export default function DomainSettings() {
  const [domainName, setDomainName] = useState('mod.aegisguard.io');
  const [sslStatus, setSslStatus] = useState('ACTIVE');
  const [dnsVerified, setDnsVerified] = useState(true);

  return (
    <div className="tab-container">
      <div className="section-header">
        <div>
          <h2>Custom Domain & SSL Settings</h2>
          <p>Manage custom domain routing, SSL certificate deployment, and DNS record verification for enterprise deployment.</p>
        </div>
      </div>

      <div className="rules-config-grid">
        <div className="card form-card">
          <div className="card-title">
            <Globe size={20} className="icon-blue" />
            <span>Connected Custom Domain</span>
          </div>

          <div className="form-group">
            <label>Domain Name</label>
            <input 
              type="text" 
              className="input-field" 
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
            />
          </div>

          <div className="domain-status-box">
            <div className="status-row">
              <span>Domain Routing:</span>
              <span className="status-tag status-active"><CheckCircle2 size={14} /> Connected</span>
            </div>
            <div className="status-row">
              <span>SSL TLS 1.3 Certificate:</span>
              <span className="status-tag status-active"><ShieldCheck size={14} /> Issued & Valid</span>
            </div>
            <div className="status-row">
              <span>Target IP Address:</span>
              <code className="code-inline">76.76.21.21</code>
            </div>
          </div>
        </div>

        <div className="card form-card">
          <div className="card-title">
            <Server size={20} className="icon-blue" />
            <span>DNS Configuration Records</span>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Host / Name</th>
                  <th>Value / Target</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CNAME</td>
                  <td>mod</td>
                  <td>cname.aegisguard.io</td>
                  <td><span className="badge badge-green">Verified</span></td>
                </tr>
                <tr>
                  <td>TXT</td>
                  <td>_aegis-challenge</td>
                  <td>verification-token-994812</td>
                  <td><span className="badge badge-green">Verified</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
