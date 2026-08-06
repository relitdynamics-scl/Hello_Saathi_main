/*
  Strict schema validation for the enquiry forms.

  The rule is reject, not repair: a value that does not match its schema is
  refused and reported back to the field. Nothing is silently stripped or
  escaped into shape, so what reaches buildWhatsAppLink is always a value that
  already passed every check.

  Thresholds live in FIELD_RULES rather than inside the validators, so limits
  can be retuned in one place without touching validation logic.
*/

export const FIELD_RULES = {
  name: { min: 2, max: 60 },
  phone: { minDigits: 7, maxDigits: 15, max: 24 },
  email: { max: 254, maxLocal: 64 },
  message: { min: 4, max: 800 },
  note: { min: 4, max: 800 },
};

// C0/C1 control characters — never legitimate in a single-line form value and
// the usual vehicle for smuggling line breaks into a generated URL.
// eslint-disable-next-line no-control-regex -- matching them is exactly the point
const CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F]/;

// Deliberately not an alphabet restriction: names are written in many scripts
// and an [A-Za-z] filter would reject perfectly real ones.
const PHONE_SEPARATORS = /[\s\-().]/g;
const PHONE_SHAPE = /^\+?\d+$/;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

const isString = (v) => typeof v === 'string';

export const SCHEMAS = {
  name: {
    type: 'string',
    required: true,
    validate(raw) {
      const value = raw.trim();
      if (!value) return { error: 'Tell us your name' };
      if (CONTROL_CHARS.test(value)) return { error: 'That name contains characters we can’t accept' };
      if (value.length < FIELD_RULES.name.min) return { error: 'That name looks too short' };
      if (value.length > FIELD_RULES.name.max) {
        return { error: `Please keep the name under ${FIELD_RULES.name.max} characters` };
      }
      return { value };
    },
  },

  phone: {
    type: 'string',
    required: true,
    validate(raw) {
      const value = raw.trim();
      if (!value) return { error: 'Add a phone number so we can reply' };
      if (value.length > FIELD_RULES.phone.max) return { error: 'That number is too long' };
      const compact = value.replace(PHONE_SEPARATORS, '');
      if (!PHONE_SHAPE.test(compact)) {
        return { error: 'Use digits only, with an optional leading +' };
      }
      const digits = compact.replace('+', '');
      const { minDigits, maxDigits } = FIELD_RULES.phone;
      if (digits.length < minDigits || digits.length > maxDigits) {
        return { error: `A phone number should be ${minDigits}–${maxDigits} digits` };
      }
      return { value };
    },
  },

  email: {
    type: 'string',
    required: false,
    validate(raw) {
      const value = raw.trim();
      if (!value) return { value: '' }; // optional
      if (value.length > FIELD_RULES.email.max) return { error: 'That email is too long' };
      if (!EMAIL_SHAPE.test(value)) return { error: 'That email looks off' };
      if (value.split('@')[0].length > FIELD_RULES.email.maxLocal) {
        return { error: 'That email looks off' };
      }
      return { value };
    },
  },

  message: {
    type: 'string',
    required: true,
    validate(raw) {
      const value = raw.trim();
      if (!value) return { error: 'What are you looking for?' };
      if (value.length < FIELD_RULES.message.min) return { error: 'Tell us a little more' };
      if (value.length > FIELD_RULES.message.max) {
        return { error: `Please keep it under ${FIELD_RULES.message.max} characters` };
      }
      return { value };
    },
  },

  // Same content rules as "message", but optional — this is the field shared
  // across three different forms (the welcome popup, the contact page, and
  // the cart's own details modal) that don't all agree on whether a note is
  // required. Each form enforces its own "must not be empty" requirement
  // locally, if it wants one; the schema itself has to stay lenient so
  // CustomerContext.saveDetails never rejects a caller that omits it.
  note: {
    type: 'string',
    required: false,
    validate(raw) {
      const value = raw.trim();
      if (!value) return { value: '' };
      if (value.length < FIELD_RULES.note.min) return { error: 'Tell us a little more' };
      if (value.length > FIELD_RULES.note.max) {
        return { error: `Please keep it under ${FIELD_RULES.note.max} characters` };
      }
      return { value };
    },
  },
};

/*
  Validates `values` against the named fields. Returns the trimmed, accepted
  values only when every field passes; otherwise `ok` is false and `errors`
  carries one message per failing field.
*/
export function validateForm(values, fields) {
  const errors = {};
  const accepted = {};

  for (const field of fields) {
    const schema = SCHEMAS[field];
    if (!schema) continue;

    const raw = values[field];

    // type gate first — a non-string here means the form state was tampered
    // with or a field was renamed, not that the visitor typed something odd
    if (raw == null || !isString(raw)) {
      if (schema.required) errors[field] = 'This field is required';
      continue;
    }

    const result = schema.validate(raw);
    if (result.error) errors[field] = result.error;
    else accepted[field] = result.value;
  }

  return { ok: Object.keys(errors).length === 0, errors, value: accepted };
}
