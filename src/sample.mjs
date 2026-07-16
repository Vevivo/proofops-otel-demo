export const sampleOtlpRequest = {
  resourceLogs: [{
    resource: {
      attributes: [
        { key: 'service.name', value: { stringValue: 'claims-ai' } },
        { key: 'service.version', value: { stringValue: '2.4.1' } },
        { key: 'deployment.environment.name', value: { stringValue: 'production' } },
        { key: 'cloud.region', value: { stringValue: 'eu-west-1' } },
        { key: 'host.id', value: { stringValue: 'secret-host-771' } }
      ]
    },
    scopeLogs: [{
      scope: { name: 'proofops.demo', version: '0.1.0' },
      logRecords: [{
        timeUnixNano: '1784217600000000000',
        observedTimeUnixNano: '1784217600100000000',
        severityText: 'INFO',
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        spanId: '00f067aa0ba902b7',
        body: { stringValue: 'Claim 49382 approved for customer alice@example.com' },
        attributes: [
          { key: 'event.name', value: { stringValue: 'claim.decision' } },
          { key: 'gen_ai.system', value: { stringValue: 'openai' } },
          { key: 'gen_ai.request.model', value: { stringValue: 'risk-model-v7' } },
          { key: 'customer.email', value: { stringValue: 'alice@example.com' } },
          { key: 'auth.token', value: { stringValue: 'must-not-leak' } }
        ]
      }, {
        timeUnixNano: '1784217601000000000',
        observedTimeUnixNano: '1784217601050000000',
        severityText: 'WARN',
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        spanId: 'b7ad6b7169203331',
        body: { stringValue: 'Human review requested for claim 49383' },
        attributes: [
          { key: 'event.name', value: { stringValue: 'claim.review' } },
          { key: 'error.type', value: { stringValue: 'confidence_threshold' } },
          { key: 'internal.case_owner', value: { stringValue: 'employee-118' } }
        ]
      }]
    }]
  }]
};
