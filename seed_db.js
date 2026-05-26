const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.foguzyzetaakkbihhwbq:tanvir483469@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to database for seeding...");

    // 1. Hash passwords
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);

    // 2. Insert Users
    console.log("Seeding default users...");
    const users = [
      { name: 'Super Admin', email: 'admin@edusaas.com', role: 'admin' },
      { name: 'Manager Staff', email: 'manager@edusaas.com', role: 'manager' },
      { name: 'Support Agent', email: 'support@edusaas.com', role: 'support' },
      { name: 'Client Owner', email: 'client@edusaas.com', role: 'client' }
    ];

    for (const u of users) {
      await client.query(
        `INSERT INTO saas_users (name, email, password, role, is_verified)
         VALUES ($1, $2, $3, $4, TRUE)
         ON CONFLICT (email) DO NOTHING`,
         [u.name, u.email, hashedPassword, u.role]
      );
    }
    console.log("Users seeded successfully!");

    // Get client user id
    const userRes = await client.query("SELECT id FROM saas_users WHERE email = 'client@edusaas.com'");
    const clientId = userRes.rows[0].id;

    // 3. Insert Subscription Plans (check first — no UNIQUE index on name)
    console.log("Seeding default subscription plans...");
    const plans = [
      { name: 'Starter',    price: 1499.00, billing_cycle: 'monthly', max_students: 200,    max_teachers: 10,     features: JSON.stringify({ sms: false, customDomain: false }) },
      { name: 'Pro',        price: 2999.00, billing_cycle: 'monthly', max_students: 1000,   max_teachers: 50,     features: JSON.stringify({ sms: true,  customDomain: true  }) },
      { name: 'Enterprise', price: 5999.00, billing_cycle: 'monthly', max_students: 999999, max_teachers: 999999, features: JSON.stringify({ sms: true,  customDomain: true,  dedicatedSupport: true }) }
    ];

    for (const p of plans) {
      const exists = await client.query(`SELECT id FROM subscription_plans WHERE name = $1`, [p.name]);
      if (exists.rows.length === 0) {
        await client.query(
          `INSERT INTO subscription_plans (name, price, billing_cycle, max_students, max_teachers, features)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [p.name, p.price, p.billing_cycle, p.max_students, p.max_teachers, p.features]
        );
      }
    }
    console.log("Subscription plans seeded successfully!");

    // Get plans
    const plansRes = await client.query("SELECT id, name, price FROM subscription_plans");
    const planMap = {};
    plansRes.rows.forEach(r => { planMap[r.name] = r; });

    // 4. Insert Tenants
    console.log("Seeding tenants...");
    const tenants = [
      { name: "Dhaka Model School", type: "school", email: "admin@dms.edu.bd", phone: "01711123456", country: "Bangladesh", status: "active" },
      { name: "Chittagong College", type: "college", email: "info@cc.edu.bd", phone: "01822234567", country: "Bangladesh", status: "active" },
      { name: "Sylhet Madrasah", type: "madrasah", email: "contact@sm.edu.bd", phone: "01933345678", country: "Bangladesh", status: "pending" }
    ];

    const tenantIds = [];
    for (const t of tenants) {
      const existing = await client.query(
        `SELECT id, institution_name FROM tenants WHERE institution_name = $1`,
        [t.name]
      );
      if (existing.rows.length > 0) {
        tenantIds.push({ id: existing.rows[0].id, name: existing.rows[0].institution_name });
      } else {
        const res = await client.query(
          `INSERT INTO tenants (owner_user_id, institution_name, institution_type, email, phone, country, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, institution_name`,
          [clientId, t.name, t.type, t.email, t.phone, t.country, t.status]
        );
        if (res.rows.length > 0) {
          tenantIds.push({ id: res.rows[0].id, name: res.rows[0].institution_name });
        }
      }
    }

    // tenantIds is already populated above

    if (tenantIds.length > 0) {
      console.log("Targeting tenants:", tenantIds.map(t => t.name).join(", "));
      
      const dms = tenantIds.find(t => t.name === "Dhaka Model School");
      const cc = tenantIds.find(t => t.name === "Chittagong College");

      // 5. Seed Subscriptions
      console.log("Seeding subscriptions...");
      const subs = [];
      if (dms && planMap["Pro"]) {
        const existingSub = await client.query("SELECT id FROM subscriptions WHERE tenant_id = $1 AND status = 'active'", [dms.id]);
        if (existingSub.rows.length > 0) {
          subs.push({ name: "dms", id: existingSub.rows[0].id, tenantId: dms.id });
        } else {
          const subRes = await client.query(
            `INSERT INTO subscriptions (tenant_id, plan_id, start_date, end_date, status, auto_renew)
             VALUES ($1, $2, '2025-01-01', '2026-01-01', 'active', TRUE) RETURNING id`,
            [dms.id, planMap["Pro"].id]
          );
          if (subRes.rows.length > 0) subs.push({ name: "dms", id: subRes.rows[0].id, tenantId: dms.id });
        }
      }
      if (cc && planMap["Starter"]) {
        const existingSub = await client.query("SELECT id FROM subscriptions WHERE tenant_id = $1 AND status = 'active'", [cc.id]);
        if (existingSub.rows.length > 0) {
          subs.push({ name: "cc", id: existingSub.rows[0].id, tenantId: cc.id });
        } else {
          const subRes = await client.query(
            `INSERT INTO subscriptions (tenant_id, plan_id, start_date, end_date, status, auto_renew)
             VALUES ($1, $2, '2025-03-01', '2026-03-01', 'active', TRUE) RETURNING id`,
            [cc.id, planMap["Starter"].id]
          );
          if (subRes.rows.length > 0) subs.push({ name: "cc", id: subRes.rows[0].id, tenantId: cc.id });
        }
      }

      // 6. Seed Payments
      console.log("Seeding payments...");
      const dmsSub = subs.find(s => s.name === "dms");
      const ccSub = subs.find(s => s.name === "cc");

      const paymentRecords = [];

      if (dmsSub) {
        const amt = planMap["Pro"].price;
        paymentRecords.push(
          { tenant_id: dmsSub.tenantId, subscription_id: dmsSub.id, amount: amt, method: "bkash", tx: "TXNDMSJAN", status: "success", date: "2026-01-15 10:00:00" },
          { tenant_id: dmsSub.tenantId, subscription_id: dmsSub.id, amount: amt, method: "nagad", tx: "TXNDMSFEB", status: "success", date: "2026-02-15 10:00:00" },
          { tenant_id: dmsSub.tenantId, subscription_id: dmsSub.id, amount: amt, method: "card", tx: "TXNDMSMAR", status: "success", date: "2026-03-15 10:00:00" },
          { tenant_id: dmsSub.tenantId, subscription_id: dmsSub.id, amount: amt, method: "bkash", tx: "TXNDMSAPR", status: "success", date: "2026-04-15 10:00:00" },
          { tenant_id: dmsSub.tenantId, subscription_id: dmsSub.id, amount: amt, method: "stripe", tx: "TXNDMSMAY", status: "success", date: "2026-05-15 10:00:00" }
        );
      }

      if (ccSub) {
        const amt = planMap["Starter"].price;
        paymentRecords.push(
          { tenant_id: ccSub.tenantId, subscription_id: ccSub.id, amount: amt, method: "bank_transfer", tx: "TXNCCMAR", status: "success", date: "2026-03-20 11:00:00" },
          { tenant_id: ccSub.tenantId, subscription_id: ccSub.id, amount: amt, method: "nagad", tx: "TXNCCAPR", status: "success", date: "2026-04-20 11:00:00" },
          { tenant_id: ccSub.tenantId, subscription_id: ccSub.id, amount: amt, method: "card", tx: "TXNCCMAY", status: "success", date: "2026-05-20 11:00:00" }
        );
      }

      if (dmsSub) {
        paymentRecords.push(
          { tenant_id: dmsSub.tenantId, subscription_id: dmsSub.id, amount: 2999, method: "bkash", tx: "TXNDMSFAIL", status: "failed", date: "2026-05-22 14:00:00" },
          { tenant_id: dmsSub.tenantId, subscription_id: dmsSub.id, amount: 2999, method: "nagad", tx: "TXNDMSPEND", status: "pending", date: "2026-05-26 09:00:00" }
        );
      }

      for (const p of paymentRecords) {
        await client.query(
          `INSERT INTO payments (tenant_id, subscription_id, amount, payment_method, transaction_id, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (transaction_id) DO NOTHING`,
          [p.tenant_id, p.subscription_id, p.amount, p.method, p.tx, p.status, p.date]
        );
      }
      console.log("Payments seeded successfully!");
    } else {
      console.log("No tenants configured. Skipping subscriptions and payments seeding.");
    }

    await client.end();
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

main();
