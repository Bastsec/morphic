-- Billing and payments tables

CREATE TABLE "user_billing" (
  "user_id" varchar(255) PRIMARY KEY NOT NULL,
  "status" varchar(256) DEFAULT 'free' NOT NULL,
  "provider" varchar(256),
  "plan_code" varchar(256),
  "subscription_code" varchar(256),
  "customer_code" varchar(256),
  "current_period_end" timestamp,
  "updated_at" timestamp DEFAULT now(),
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX "user_billing_status_idx" ON "user_billing" USING btree ("status");
ALTER TABLE "user_billing" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_own_billing" ON "user_billing" AS PERMISSIVE FOR ALL TO public USING (user_id = current_setting('app.current_user_id', true)) WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE TABLE "payments" (
  "id" varchar(191) PRIMARY KEY NOT NULL,
  "user_id" varchar(255),
  "reference" varchar(256) NOT NULL,
  "amount" integer NOT NULL,
  "currency" varchar(10) NOT NULL,
  "status" varchar(256) NOT NULL,
  "channel" varchar(256),
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX "payments_user_id_idx" ON "payments" USING btree ("user_id");
CREATE INDEX "payments_reference_idx" ON "payments" USING btree ("reference");
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_read_own_payments" ON "payments" AS PERMISSIVE FOR SELECT TO public USING (user_id = current_setting('app.current_user_id', true));
CREATE POLICY "users_insert_own_payments" ON "payments" AS PERMISSIVE FOR INSERT TO public WITH CHECK (user_id = current_setting('app.current_user_id', true));

