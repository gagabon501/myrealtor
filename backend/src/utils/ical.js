/**
 * iCal (ICS) file generator for appointments
 * Generates RFC 5545 compliant iCalendar format
 */

const SERVICE_TYPE_LABELS = {
  APPRAISAL: "Property Appraisal",
  TITLING: "Land Titling / Title Transfer",
  CONSULTANCY: "Real Estate Consultancy",
  BROKERAGE_VIEWING: "Property Viewing",
};

/**
 * Format date to iCal format (YYYYMMDDTHHMMSSZ)
 */
function formatDateToICal(date) {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Escape special characters for iCal text fields
 */
function escapeICalText(text) {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Generate a unique UID for the event
 */
function generateUID(appointmentId) {
  return `${appointmentId}@goshenrealty.com`;
}

/**
 * Generate iCal (ICS) content for an appointment
 * @param {Object} appointment - The appointment document
 * @returns {string} - iCal formatted string
 */
export function generateICalEvent(appointment) {
  const startDate = appointment.confirmedStartAt || appointment.requestedStartAt;
  const endDate =
    appointment.confirmedEndAt ||
    appointment.requestedEndAt ||
    new Date(new Date(startDate).getTime() + 60 * 60 * 1000); // Default 1 hour duration

  const serviceLabel = SERVICE_TYPE_LABELS[appointment.serviceType] || appointment.serviceType;
  const summary = `${serviceLabel} - Goshen Realty`;
  const description = [
    `Service: ${serviceLabel}`,
    `Client: ${appointment.clientName}`,
    `Email: ${appointment.email}`,
    appointment.phone ? `Phone: ${appointment.phone}` : null,
    appointment.notes ? `Notes: ${appointment.notes}` : null,
    `Status: ${appointment.status}`,
  ]
    .filter(Boolean)
    .join("\\n");

  const now = new Date();
  const dtstamp = formatDateToICal(now);
  const dtstart = formatDateToICal(startDate);
  const dtend = formatDateToICal(endDate);
  const uid = generateUID(appointment._id.toString());

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Goshen Realty ABCD//Appointment System//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICalText(summary)}`,
    `DESCRIPTION:${escapeICalText(description)}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder",
    "TRIGGER:-PT1H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return icsContent;
}

/**
 * Generate Google Calendar URL for an appointment
 * @param {Object} appointment - The appointment document
 * @returns {string} - Google Calendar add event URL
 */
export function generateGoogleCalendarUrl(appointment) {
  const startDate = appointment.confirmedStartAt || appointment.requestedStartAt;
  const endDate =
    appointment.confirmedEndAt ||
    appointment.requestedEndAt ||
    new Date(new Date(startDate).getTime() + 60 * 60 * 1000);

  const serviceLabel = SERVICE_TYPE_LABELS[appointment.serviceType] || appointment.serviceType;
  const title = `${serviceLabel} - Goshen Realty`;
  const details = [
    `Service: ${serviceLabel}`,
    `Client: ${appointment.clientName}`,
    appointment.notes ? `Notes: ${appointment.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  // Format dates for Google Calendar (YYYYMMDDTHHMMSSZ)
  const formatForGoogle = (date) => {
    return new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  };

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatForGoogle(startDate)}/${formatForGoogle(endDate)}`,
    details: details,
    sf: "true",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default { generateICalEvent, generateGoogleCalendarUrl };
