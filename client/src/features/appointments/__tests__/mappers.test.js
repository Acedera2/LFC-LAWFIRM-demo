import { describe, test, expect } from 'vitest';
import { mapAppointment, toDateTimeInput } from '../mappers';

describe('appointments mappers', () => {
  test('toDateTimeInput returns empty for falsy', () => {
    expect(toDateTimeInput(null)).toBe('');
    expect(toDateTimeInput('')).toBe('');
  });

  test('toDateTimeInput formats ISO to datetime-local', () => {
    const iso = '2026-05-22T08:30:00.000Z';
    const out = toDateTimeInput(iso);
    // expect pattern YYYY-MM-DDTHH:MM
    expect(out).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  test('mapAppointment builds display fields', () => {
    const appt = {
      id: 'a1',
      status: 'PENDING',
      priority: 'URGENT',
      lawyer: { user: { name: 'Atty Example' } },
      client: { name: 'Client Name' },
      scheduledStart: null,
      preferredStart: '2026-05-22T09:00:00.000Z',
      consultationType: 'General consultation'
    };
    const mapped = mapAppointment(appt);
    expect(mapped).toBeTruthy();
    expect(mapped.displayStatus).toBeDefined();
    expect(mapped.displayPriority).toBeDefined();
    expect(mapped.lawyerName).toBe('Atty Example');
    expect(mapped.clientName).toBe('Client Name');
    expect(mapped.startAt).toBe(appt.preferredStart);
  });
});
