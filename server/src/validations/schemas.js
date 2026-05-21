import { z } from "zod";

const id = z.string().min(8);
const dateString = z.string().datetime().or(z.string().min(10));
const priority = z.enum(["HIGH", "MEDIUM", "REGULAR", "URGENT", "MODERATE"]).transform((value) => {
  if (value === "URGENT") return "HIGH";
  if (value === "MODERATE") return "MEDIUM";
  return value;
});
const appointmentWindow = z
  .object({
    preferredStart: dateString,
    preferredEnd: dateString
  })
  .refine((data) => new Date(data.preferredEnd) > new Date(data.preferredStart), {
    message: "Preferred end time must be after preferred start time",
    path: ["preferredEnd"]
  });

export const authSchemas = {
  register: z.object({
    body: z.object({
      name: z.string().min(2).max(120),
      email: z.string().email().max(160),
      phone: z.string().max(40).optional().nullable(),
      password: z
        .string()
        .min(8)
        .max(128)
        .regex(/[A-Z]/, "Password must include an uppercase letter")
        .regex(/[a-z]/, "Password must include a lowercase letter")
        .regex(/[0-9]/, "Password must include a number")
        .regex(/[^A-Za-z0-9]/, "Password must include a symbol"),
      confirmPassword: z.string().min(8)
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"]
    })
  }),
  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(1)
    })
  })
};

export const appointmentSchemas = {
  list: z.object({
    query: z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
      search: z.string().optional(),
      status: z.string().optional(),
      priority: z.string().optional(),
      lawyerId: z.string().optional(),
      clientId: z.string().optional(),
      sortBy: z.enum(["createdAt", "preferredStart", "scheduledStart", "priority"]).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional()
    })
  }),
  create: z.object({
    body: z.object({
      clientId: id.optional(),
      lawyerId: id.optional().nullable(),
      consultationType: z.string().min(3).max(120),
      subject: z.string().min(3).max(180),
      description: z.string().min(5).max(4000),
      priority: priority.optional(),
      preferredStart: dateString,
      preferredEnd: dateString,
      locationMode: z.enum(["IN_PERSON", "PHONE", "FIELD"]).optional()
    }).and(appointmentWindow)
  }),
  conflictCheck: z.object({
    body: z.object({
      clientId: id.optional(),
      lawyerId: id,
      consultationType: z.string().min(3).max(120),
      preferredStart: dateString,
      preferredEnd: dateString
    }).and(appointmentWindow)
  }),
  updateStatus: z.object({
    params: z.object({ id }),
    body: z.object({
      status: z.enum(["PENDING", "SCHEDULED", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"]),
      reason: z.string().max(500).optional(),
      scheduledStart: dateString.optional(),
      scheduledEnd: dateString.optional(),
      lawyerId: id.optional()
    }).refine((data) => !data.scheduledStart || !data.scheduledEnd || new Date(data.scheduledEnd) > new Date(data.scheduledStart), {
      message: "Scheduled end time must be after scheduled start time",
      path: ["scheduledEnd"]
    })
  }),
  reschedule: z.object({
    params: z.object({ id }),
    body: z.object({
      preferredStart: dateString,
      preferredEnd: dateString,
      reason: z.string().max(500).optional()
    })
  }),
  cancel: z.object({
    params: z.object({ id }),
    body: z.object({
      reason: z.string().max(500).optional()
    })
  })
};

export const scheduleSchemas = {
  upsert: z.object({
    body: z.object({
      lawyerId: id.optional(),
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      isAvailable: z.boolean().default(true),
      maxAppointments: z.number().int().min(1).max(24).default(8)
    })
  }),
  availability: z.object({
    body: z.object({
      lawyerId: id.optional(),
      type: z.enum(["AVAILABLE", "UNAVAILABLE", "RESERVED"]),
      startsAt: dateString,
      endsAt: dateString,
      reason: z.string().max(255).optional(),
      maxAppointments: z.number().int().min(1).max(24).optional()
    }).refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
      message: "Availability end time must be after start time",
      path: ["endsAt"]
    })
  })
};

export const userSchemas = {
  list: z.object({
    query: z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
      search: z.string().optional(),
      role: z.string().optional(),
      status: z.string().optional()
    })
  }),
  updateRole: z.object({
    params: z.object({ id }),
    body: z.object({
      roleSlug: z.enum(["client", "lawyer", "staff", "admin"]),
      status: z.enum(["ACTIVE", "INVITED", "SUSPENDED"]).optional()
    })
  })
};

export const settingsSchemas = {
  update: z.object({
    body: z.object({
      key: z.string().min(2).max(80),
      value: z.unknown()
    })
  })
};
