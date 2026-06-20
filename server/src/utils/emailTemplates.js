const STATUS_LABELS = {
  REPORTED: 'Reported',
  TRIAGED: 'Triaged',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  PENDING_REVIEW: 'Pending Review',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const ticketStatusTemplate = (ticket, newStatus) => {
  const label = STATUS_LABELS[newStatus] || newStatus;
  const subject = `Ticket #${ticket._id} - ${label}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">Ticket Status Update</h2>
      <p>Your ticket <strong>${ticket.title}</strong> has been updated to <strong>${label}</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0; color: #666;">Ticket</td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${ticket.title}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0; color: #666;">Status</td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>${label}</strong></td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0; color: #666;">Category</td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${ticket.category}</td></tr>
        <tr><td style="padding: 8px; color: #666;">Priority</td><td style="padding: 8px;">${ticket.priority}</td></tr>
      </table>
      <p style="margin-top: 16px; color: #666; font-size: 12px;">Fixra - Rental Property Maintenance</p>
    </div>`;

  return { subject, html };
};

const estimateSubmittedTemplate = (job, ticket) => {
  const subject = `Estimate Submitted for Ticket #${ticket._id}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">Estimate Submitted</h2>
      <p>A contractor has submitted an estimate for ticket <strong>${ticket.title}</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0; color: #666;">Ticket</td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${ticket.title}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0; color: #666;">Estimated Cost</td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>$${job.estimatedCost?.toFixed(2)}</strong></td></tr>
        <tr><td style="padding: 8px; color: #666;">Status</td><td style="padding: 8px;">Pending Approval</td></tr>
      </table>
      <p style="margin-top: 16px; color: #666; font-size: 12px;">Fixra - Rental Property Maintenance</p>
    </div>`;

  return { subject, html };
};

const estimateApprovedTemplate = (job, ticket) => {
  const subject = `Estimate Approved for Ticket #${ticket._id}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">Estimate Approved</h2>
      <p>The estimate for ticket <strong>${ticket.title}</strong> has been approved.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0; color: #666;">Ticket</td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${ticket.title}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0; color: #666;">Approved Cost</td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>$${job.estimatedCost?.toFixed(2)}</strong></td></tr>
        <tr><td style="padding: 8px; color: #666;">Status</td><td style="padding: 8px;">Payment Processed</td></tr>
      </table>
      <p style="margin-top: 16px; color: #666; font-size: 12px;">Fixra - Rental Property Maintenance</p>
    </div>`;

  return { subject, html };
};

export { ticketStatusTemplate, estimateSubmittedTemplate, estimateApprovedTemplate };
