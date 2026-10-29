import { execFileSync } from 'child_process';

function runSql(sql) {
  const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';
  const out = execFileSync(psqlPath, [
    '-U', 'postgres',
    '-d', 'brightcone_hr_portal',
    '-h', '127.0.0.1',
    '-t', '-A',
    '-c', sql
  ], {
    env: { ...process.env, PGPASSWORD: 'manager' },
    encoding: 'utf8'
  });
  return out.trim();
}

function queryJson(sql) {
  try {
    const raw = runSql(`SELECT coalesce(json_agg(t), '[]'::json) FROM (${sql}) t;`);
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('SQL query error:', e.message);
    return [];
  }
}

function insertJson(sql) {
  try {
    // The INSERT statements passed in end with a trailing semicolon (e.g. "RETURNING id;").
    // Wrapping them in a CTE as-is produces a syntax error, so the insert silently failed
    // and the caller fell back to a fake id. Strip the trailing semicolon before wrapping.
    const cleaned = String(sql).trim().replace(/;+\s*$/, '');
    const raw = runSql(`WITH t AS (${cleaned}) SELECT coalesce(json_agg(t), '[]'::json) FROM t;`);
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('SQL insert error:', e.message);
    return [];
  }
}

function executeSql(sql) {
  try {
    runSql(sql);
    return true;
  } catch (e) {
    console.error('SQL execute error:', e.message);
    return false;
  }
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
  });
  res.end(JSON.stringify(data));
}

export function timeDbMiddleware() {
  return {
    name: 'brightcone-time-db-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        const method = req.method || 'GET';

        if (method === 'OPTIONS') {
          res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': '*',
          });
          return res.end();
        }

        if (!url.startsWith('/api/v1/time/')) {
          return next();
        }

        const path = url.split('?')[0].replace('/api/v1/time/', '');

        try {
          // 1. SWAP REQUESTS
          if (path === 'swaps' || path.startsWith('swaps/')) {
            if (method === 'GET') {
              const rows = queryJson('SELECT id, requester_id, requester_name, requester_code, target_employee_id, target_employee_name, original_date, original_shift, target_shift, reason, status, created_at, updated_at FROM time_shift_swaps ORDER BY id DESC');
              return sendJson(res, rows);
            }
            if (method === 'POST') {
              const b = await parseBody(req);
              const rName = (b.requester_name || 'Rahul Varma').replace(/'/g, "''");
              const tName = (b.target_employee_name || 'Ananya Rao').replace(/'/g, "''");
              const rCode = (b.requester_code || 'BC-1038').replace(/'/g, "''");
              const origDate = (b.original_date || b.request_date || new Date().toISOString().slice(0, 10)).replace(/'/g, "''");
              const origShift = (b.original_shift || b.source_shift_code || 'General Shift (09:30 - 18:30)').replace(/'/g, "''");
              const tgtShift = (b.target_shift || b.target_shift_code || 'Morning Shift (06:00 - 15:00)').replace(/'/g, "''");
              const reason = (b.reason || 'Shift adjustment').replace(/'/g, "''");
              const sql = `INSERT INTO time_shift_swaps (requester_id, requester_name, requester_code, target_employee_id, target_employee_name, original_date, original_shift, target_shift, reason, status) VALUES (${Number(b.requester_id) || 7}, '${rName}', '${rCode}', ${Number(b.target_employee_id) || 2}, '${tName}', '${origDate}', '${origShift}', '${tgtShift}', '${reason}', 'PENDING') RETURNING id;`;
              const created = insertJson(sql);
              const newId = created[0]?.id || Date.now();
              return sendJson(res, { id: newId, status: 'PENDING', ...b });
            }
            if (method === 'PATCH' || (method === 'POST' && path.includes('/status'))) {
              const id = path.split('/')[1];
              const b = await parseBody(req);
              const st = (b.status || 'APPROVED').toUpperCase().includes('APPROV') ? 'APPROVED' : 'REJECTED';
              executeSql(`UPDATE time_shift_swaps SET status = '${st}', updated_at = NOW() WHERE id = ${Number(id) || 0};`);
              return sendJson(res, { success: true, id: Number(id), status: st });
            }
            if (method === 'DELETE') {
              const id = path.split('/')[1];
              executeSql(`DELETE FROM time_shift_swaps WHERE id = ${Number(id) || 0};`);
              return sendJson(res, { success: true, id: Number(id) });
            }
          }

          // 2. WORK FROM HOME
          if (path === 'wfh' || path.startsWith('wfh/')) {
            if (method === 'GET') {
              const rows = queryJson('SELECT id, employee_id, employee_name, dates, reason, status, created_at FROM time_wfh_requests ORDER BY created_at DESC');
              return sendJson(res, rows);
            }
            if (method === 'POST') {
              const b = await parseBody(req);
              const id = 'WFH-' + Date.now();
              const empId = String(b.employee_id || 'BC-1038').replace(/'/g, "''");
              const empName = (b.employee_name || 'Rahul Varma').replace(/'/g, "''");
              const dates = (b.dates || b.from_date || new Date().toISOString().slice(0, 10)).replace(/'/g, "''");
              const reason = (b.reason || 'Remote working day').replace(/'/g, "''");
              executeSql(`INSERT INTO time_wfh_requests (id, employee_id, employee_name, dates, reason, status) VALUES ('${id}', '${empId}', '${empName}', '${dates}', '${reason}', 'PENDING');`);
              return sendJson(res, { id, employee_id: empId, employee_name: empName, dates, reason, status: 'PENDING' });
            }
            if (method === 'PATCH' || (method === 'POST' && path.includes('/status'))) {
              const id = path.split('/')[1].replace(/'/g, "''");
              const b = await parseBody(req);
              const st = (b.status || 'APPROVED').toUpperCase().includes('APPROV') ? 'APPROVED' : 'REJECTED';
              executeSql(`UPDATE time_wfh_requests SET status = '${st}' WHERE id = '${id}';`);
              return sendJson(res, { success: true, id, status: st });
            }
          }

          // 3. COMP-OFF TRACKER
          if (path === 'compoff' || path.startsWith('compoff/')) {
            if (method === 'GET') {
              const rows = queryJson('SELECT id, employee_id, employee_name, worked_date, comp_off_date, reason, status, created_at FROM time_compoff_requests ORDER BY created_at DESC');
              return sendJson(res, rows);
            }
            if (method === 'POST') {
              const b = await parseBody(req);
              const id = 'CO-' + Date.now();
              const empId = String(b.employee_id || 'BC-1038').replace(/'/g, "''");
              const empName = (b.employee_name || 'Rahul Varma').replace(/'/g, "''");
              const worked = (b.worked_date || b.start_date || new Date().toISOString().slice(0, 10)).replace(/'/g, "''");
              const compDate = (b.comp_off_date || b.end_date || new Date().toISOString().slice(0, 10)).replace(/'/g, "''");
              const reason = (b.reason || 'Weekend project overtime').replace(/'/g, "''");
              executeSql(`INSERT INTO time_compoff_requests (id, employee_id, employee_name, worked_date, comp_off_date, reason, status) VALUES ('${id}', '${empId}', '${empName}', '${worked}', '${compDate}', '${reason}', 'PENDING');`);
              return sendJson(res, { id, employee_id: empId, employee_name: empName, worked_date: worked, comp_off_date: compDate, reason, status: 'PENDING' });
            }
            if (method === 'PATCH' || (method === 'POST' && path.includes('/status'))) {
              const id = path.split('/')[1].replace(/'/g, "''");
              const b = await parseBody(req);
              const st = (b.status || 'APPROVED').toUpperCase().includes('APPROV') ? 'APPROVED' : 'REJECTED';
              executeSql(`UPDATE time_compoff_requests SET status = '${st}' WHERE id = '${id}';`);
              return sendJson(res, { success: true, id, status: st });
            }
          }

          // 4. LEAVE TYPES
          if (path === 'leave-types' || path.startsWith('leave-types/')) {
            if (method === 'GET') {
              const rows = queryJson('SELECT id, code, name, category, days_allowed, carry_forward_max, is_encashable, is_active FROM leave_types ORDER BY id ASC');
              return sendJson(res, rows);
            }
            if (method === 'POST') {
              const b = await parseBody(req);
              const code = (b.code || 'LV').replace(/'/g, "''");
              const name = (b.name || 'Leave Type').replace(/'/g, "''");
              const cat = (b.category || 'Paid').replace(/'/g, "''");
              const days = Number(b.days_allowed || b.entitled_days || 12);
              const cf = Number(b.carry_forward_max || 0);
              const enc = Boolean(b.is_encashable);
              const act = b.is_active !== false;
              const sql = `INSERT INTO leave_types (code, name, category, days_allowed, carry_forward_max, is_encashable, is_active) VALUES ('${code}', '${name}', '${cat}', ${days}, ${cf}, ${enc}, ${act}) RETURNING id;`;
              const inserted = insertJson(sql);
              const newId = inserted[0]?.id || Date.now();
              return sendJson(res, { id: newId, code, name, category: cat, days_allowed: days, carry_forward_max: cf, is_encashable: enc, is_active: act });
            }
            if (method === 'PUT') {
              const id = Number(path.split('/')[1]) || 0;
              const b = await parseBody(req);
              const name = (b.name || '').replace(/'/g, "''");
              const days = Number(b.days_allowed || 12);
              executeSql(`UPDATE leave_types SET name = '${name}', days_allowed = ${days}, updated_at = NOW() WHERE id = ${id};`);
              return sendJson(res, { success: true, id, ...b });
            }
            if (method === 'DELETE') {
              const id = Number(path.split('/')[1]) || 0;
              executeSql(`DELETE FROM leave_types WHERE id = ${id};`);
              return sendJson(res, { success: true, id });
            }
          }

          // 5. LEAVE QUOTAS
          if (path === 'leave-quotas' || path.startsWith('leave-quotas/')) {
            if (method === 'GET') {
              const rows = queryJson('SELECT id, employee_id, employee_name, employee_code, leave_type_code, allocated, used, pending, balance, year FROM leave_quotas ORDER BY id ASC');
              return sendJson(res, rows);
            }
            if (method === 'POST') {
              const b = await parseBody(req);
              const empId = Number(b.employee_id) || 1;
              const empName = (b.employee_name || 'Rahul Varma').replace(/'/g, "''");
              const empCode = (b.employee_code || 'BC-1038').replace(/'/g, "''");
              const ltCode = (b.leave_type_code || 'CL').replace(/'/g, "''");
              const alloc = Number(b.allocated || 12);
              const used = Number(b.used || 0);
              const pend = Number(b.pending || 0);
              const bal = alloc - used - pend;
              const yr = Number(b.year) || 2026;
              const sql = `INSERT INTO leave_quotas (employee_id, employee_name, employee_code, leave_type_code, allocated, used, pending, balance, year) VALUES (${empId}, '${empName}', '${empCode}', '${ltCode}', ${alloc}, ${used}, ${pend}, ${bal}, ${yr}) RETURNING id;`;
              const inserted = insertJson(sql);
              const newId = inserted[0]?.id || Date.now();
              return sendJson(res, { id: newId, employee_id: empId, employee_name: empName, employee_code: empCode, leave_type_code: ltCode, allocated: alloc, used, pending: pend, balance: bal, year: yr });
            }
            if (method === 'PUT') {
              const id = Number(path.split('/')[1]) || 0;
              const b = await parseBody(req);
              const alloc = Number(b.allocated || 12);
              const used = Number(b.used || 0);
              const bal = alloc - used;
              executeSql(`UPDATE leave_quotas SET allocated = ${alloc}, used = ${used}, balance = ${bal}, updated_at = NOW() WHERE id = ${id};`);
              return sendJson(res, { success: true, id, ...b });
            }
            if (method === 'DELETE') {
              const id = Number(path.split('/')[1]) || 0;
              executeSql(`DELETE FROM leave_quotas WHERE id = ${id};`);
              return sendJson(res, { success: true, id });
            }
          }

          // 6. LEAVE CALCULATOR
          if (path === 'leave-calculator' || path === 'calculate') {
            const b = await parseBody(req);
            const s = new Date(b.start_date || b.fromDate);
            const e = new Date(b.end_date || b.toDate);
            let totalDays = 0;
            let workingDays = 0;
            let weekendDays = 0;

            const cur = new Date(s);
            while (cur <= e) {
              totalDays++;
              const d = cur.getDay();
              if (d === 0 || d === 6) {
                weekendDays++;
              } else {
                workingDays++;
              }
              cur.setDate(cur.getDate() + 1);
            }

            const chargeable = b.is_half_day ? 0.5 : workingDays;
            const empName = (b.employee_name || 'Rahul Varma').replace(/'/g, "''");
            const lt = (b.leave_type_code || b.leave_type || 'Casual Leave').replace(/'/g, "''");
            const fromD = (b.start_date || b.fromDate || '').replace(/'/g, "''");
            const toD = (b.end_date || b.toDate || '').replace(/'/g, "''");

            executeSql(`INSERT INTO leave_calculations (employee_name, leave_type, from_date, to_date, days_count) VALUES ('${empName}', '${lt}', '${fromD}', '${toD}', ${chargeable});`);

            return sendJson(res, {
              start_date: b.start_date,
              end_date: b.end_date,
              total_calendar_days: totalDays,
              chargeable_days: chargeable,
              weekend_days_count: weekendDays,
              weekend_days: weekendDays,
              holidays_count: 0,
              holiday_days: 0,
              working_days: workingDays,
              policy_applied: 'Standard Company Leave Policy (Indian Calendar)',
              leave_type_code: lt,
              breakdown: [],
            });
          }

          next();
        } catch (err) {
          console.error('Time DB handler error:', err);
          sendJson(res, { error: err.message }, 500);
        }
      });
    }
  };
}
