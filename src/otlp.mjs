import { hashJson, sha256Hex } from './canonical.mjs';

const SAFE_RESOURCE_KEYS = new Set([
  'service.name',
  'service.version',
  'deployment.environment.name',
  'cloud.region',
]);

const SAFE_EVENT_KEYS = new Set([
  'event.name',
  'http.request.method',
  'http.response.status_code',
  'error.type',
  'gen_ai.operation.name',
  'gen_ai.system',
  'gen_ai.request.model',
]);

function anyValue(value = {}) {
  const known = [
    'stringValue', 'boolValue', 'intValue', 'doubleValue', 'bytesValue',
  ];
  for (const key of known) if (key in value) return value[key];
  if (Array.isArray(value.arrayValue?.values)) return value.arrayValue.values.map(anyValue);
  if (Array.isArray(value.kvlistValue?.values)) return Object.fromEntries(
    value.kvlistValue.values.map((item) => [item.key, anyValue(item.value)]),
  );
  return null;
}

function attributes(items = []) {
  return Object.fromEntries(items.map((item) => [item.key, anyValue(item.value)]));
}

function safeSubset(source, allowed) {
  return Object.fromEntries(Object.entries(source).filter(([key]) => allowed.has(key)));
}

export function extractOtlpLogRecords(request) {
  if (!request || !Array.isArray(request.resourceLogs)) {
    throw new TypeError('Expected an OTLP ExportLogsServiceRequest with resourceLogs[]');
  }

  const output = [];
  for (const resourceLog of request.resourceLogs) {
    const resource = attributes(resourceLog.resource?.attributes);
    for (const scopeLog of resourceLog.scopeLogs ?? []) {
      for (const logRecord of scopeLog.logRecords ?? []) {
        const eventAttributes = attributes(logRecord.attributes);
        const sourceEvent = {
          resource,
          scope: scopeLog.scope ?? {},
          log_record: logRecord,
        };
        const body = anyValue(logRecord.body);
        output.push({
          spec_version: 'proofops.otel.event/v1',
          observed_at_unix_nano: String(logRecord.observedTimeUnixNano ?? logRecord.timeUnixNano ?? ''),
          event_at_unix_nano: String(logRecord.timeUnixNano ?? ''),
          severity: logRecord.severityText ?? null,
          trace_id: logRecord.traceId ?? null,
          span_id: logRecord.spanId ?? null,
          resource: safeSubset(resource, SAFE_RESOURCE_KEYS),
          attributes: safeSubset(eventAttributes, SAFE_EVENT_KEYS),
          body_sha256: sha256Hex(typeof body === 'string' ? body : JSON.stringify(body)),
          source_event_sha256: hashJson(sourceEvent),
          privacy: {
            raw_body_disclosed: false,
            arbitrary_attributes_disclosed: false,
            commitment_warning: 'Unsalted hashes may reveal equality or permit guessing of low-entropy values.',
          },
        });
      }
    }
  }

  if (!output.length) throw new TypeError('No OTLP log records found');
  return output;
}
