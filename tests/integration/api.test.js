import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../../server/src/app.js';
import { env } from '../../server/src/config/env.js';
import { EventEmitter } from 'node:events';

/**
 * In-memory test dispatcher for Express without opening TCP sockets
 */
function request(app) {
  return {
    get: (url, headers = {}) => makeRequest(app, 'GET', url, null, headers),
    post: (url, body = null, headers = {}) => makeRequest(app, 'POST', url, body, headers),
    patch: (url, body = null, headers = {}) => makeRequest(app, 'PATCH', url, body, headers),
    delete: (url, headers = {}) => makeRequest(app, 'DELETE', url, null, headers)
  };
}

function makeRequest(app, method, url, body = null, headers = {}) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url, 'http://localhost');
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.path = parsedUrl.pathname;
    req.headers = {
      host: 'localhost',
      'content-type': 'application/json',
      ...headers
    };
    req.get = (header) => req.headers[header.toLowerCase()];
    req.query = Object.fromEntries(parsedUrl.searchParams);

    let responseBody = '';
    const res = new EventEmitter();
    res.statusCode = 200;
    res.headers = {};

    res.setHeader = (key, value) => { res.headers[key.toLowerCase()] = value; };
    res.getHeader = (key) => res.headers[key.toLowerCase()];
    res.removeHeader = (key) => { delete res.headers[key.toLowerCase()]; };
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => {
      res.body = data;
      resolve({ status: res.statusCode, body: data });
    };
    res.send = (text) => {
      try {
        res.body = JSON.parse(text);
      } catch {
        res.body = text;
      }
      resolve({ status: res.statusCode, body: res.body });
    };
    res.end = (chunk) => {
      if (chunk) responseBody += chunk;
      try {
        res.body = JSON.parse(responseBody);
      } catch {
        res.body = responseBody;
      }
      resolve({ status: res.statusCode, body: res.body });
    };

    if (body) {
      req.body = body;
    }

    app.handle(req, res);
  });
}

describe('REST API Endpoint Integration Suite', () => {
  const req = request(app);

  test('GET /health returns healthy status', async () => {
    const res = await req.get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
  });

  test('GET /api/v1/health returns subsystem statuses', async () => {
    const res = await req.get('/api/v1/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
    assert.equal(res.body.services.api, 'UP');
  });

  test('GET /api/v1/jobs returns paginated jobs list', async () => {
    const res = await req.get('/api/v1/jobs');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.jobs));
    assert.ok(res.body.data.jobs.length > 0);
  });

  test('GET /api/v1/jobs?country=India&sortBy=closingSoon returns jobs sorted by earliest deadline ascending', async () => {
    const res = await req.get('/api/v1/jobs?country=India&sortBy=closingSoon');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const jobs = res.body.data.jobs;
    assert.ok(jobs.length >= 2);
    for (const job of jobs) {
      assert.equal(job.country, 'India');
    }
    const times = jobs.map(j => new Date(j.expiresAt || j.applicationDeadline).getTime());
    for (let i = 0; i < times.length - 1; i++) {
      assert.ok(times[i] <= times[i + 1], `Job ${i} (${times[i]}) should be <= Job ${i+1} (${times[i+1]})`);
    }
  });

  test('GET /api/v1/jobs/recommended returns top AI match jobs', async () => {
    const res = await req.get('/api/v1/jobs/recommended');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    for (const job of res.body.data) {
      assert.equal(job.eligibilityStatus, 'ELIGIBLE');
    }
  });

  test('GET /api/v1/jobs/:id returns single job detail', async () => {
    const res = await req.get('/api/v1/jobs/job-seed-1');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.id, 'job-seed-1');
  });

  test('GET /api/v1/countries returns configured countries', async () => {
    const res = await req.get('/api/v1/countries');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.some(c => c.code === 'US'));
  });

  test('GET /api/v1/agent/status returns operational status', async () => {
    const res = await req.get('/api/v1/agent/status');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.isActive !== undefined);
  });

  test('POST /api/v1/saved-jobs and GET /api/v1/saved-jobs works with auth', async () => {
    // Generate valid jwt token for test
    const jwt = (await import('jsonwebtoken')).default;
    const token = jwt.sign({ id: 'usr_default', email: 'developer@jobhunter.ai' }, env.JWT_SECRET);

    const saveRes = await req.post('/api/v1/saved-jobs', { jobId: 'job-seed-2' }, {
      authorization: `Bearer ${token}`
    });
    assert.equal(saveRes.status, 201);

    const getRes = await req.get('/api/v1/saved-jobs', {
      authorization: `Bearer ${token}`
    });
    assert.equal(getRes.status, 200);
    assert.ok(getRes.body.data.some(j => j.id === 'job-seed-2'));
  });

  test('PATCH /api/v1/applications tracks manual application status', async () => {
    const jwt = (await import('jsonwebtoken')).default;
    const token = jwt.sign({ id: 'usr_default', email: 'developer@jobhunter.ai' }, env.JWT_SECRET);

    const res = await req.post('/api/v1/applications', {
      jobId: 'job-seed-1',
      status: 'INTERVIEW',
      notes: 'Technical screen scheduled for Thursday'
    }, {
      authorization: `Bearer ${token}`
    });

    assert.ok(res.status === 200 || res.status === 201);
    assert.equal(res.body.data.status, 'INTERVIEW');
  });

  test('GET /api/v1/notifications/gmail/status returns Gmail integration state', async () => {
    const jwt = (await import('jsonwebtoken')).default;
    const token = jwt.sign({ id: 'usr_default', email: 'developer@jobhunter.ai' }, env.JWT_SECRET);

    const res = await req.get('/api/v1/notifications/gmail/status', {
      authorization: `Bearer ${token}`
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(typeof res.body.data.isConnected, 'boolean');
  });

  test('POST /api/v1/agent/scan enqueues background scan without blocking', async () => {
    const jwt = (await import('jsonwebtoken')).default;
    const token = jwt.sign({ id: 'usr_default', email: 'developer@jobhunter.ai' }, env.JWT_SECRET);

    const res = await req.post('/api/v1/agent/scan', null, {
      authorization: `Bearer ${token}`
    });
    assert.equal(res.status, 202);
    assert.equal(res.body.success, true);
    assert.ok(res.body.runId);
  });
});
