-- Initial schema for Morphic (Drizzle SQL migrations)

-- Chats
CREATE TABLE "chats" (
  "id" varchar(191) PRIMARY KEY NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "title" text NOT NULL,
  "user_id" varchar(255) NOT NULL,
  "visibility" varchar(256) DEFAULT 'private' NOT NULL
);

-- Messages
CREATE TABLE "messages" (
  "id" varchar(191) PRIMARY KEY NOT NULL,
  "chat_id" varchar(191) NOT NULL,
  "role" varchar(256) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp,
  "metadata" jsonb
);
ALTER TABLE "messages"
  ADD CONSTRAINT "messages_chat_id_chats_id_fk"
  FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id")
  ON DELETE cascade ON UPDATE no action;

-- Parts
CREATE TABLE "parts" (
  "id" varchar(191) PRIMARY KEY NOT NULL,
  "message_id" varchar(191) NOT NULL,
  "order" integer NOT NULL,
  "type" varchar(256) NOT NULL,

  -- Text
  "text_text" text,
  -- Reasoning
  "reasoning_text" text,
  -- File
  "file_media_type" varchar(256),
  "file_filename" varchar(1024),
  "file_url" text,

  -- Source URL
  "source_url_source_id" varchar(256),
  "source_url_url" text,
  "source_url_title" text,

  -- Source document
  "source_document_source_id" varchar(256),
  "source_document_media_type" varchar(256),
  "source_document_title" text,
  "source_document_filename" varchar(1024),
  "source_document_url" text,
  "source_document_snippet" text,

  -- Tool base
  "tool_tool_call_id" varchar(256),
  "tool_state" varchar(256),
  "tool_error_text" text,
  -- Tool specific
  "tool_search_input" json,
  "tool_search_output" json,
  "tool_fetch_input" json,
  "tool_fetch_output" json,
  "tool_question_input" json,
  "tool_question_output" json,
  "tool_todoWrite_input" json,
  "tool_todoWrite_output" json,
  "tool_todoRead_input" json,
  "tool_todoRead_output" json,
  "tool_dynamic_input" json,
  "tool_dynamic_output" json,
  "tool_dynamic_name" varchar(256),
  "tool_dynamic_type" varchar(256),

  -- Data generic
  "data_prefix" varchar(256),
  "data_content" json,
  "data_id" varchar(256),

  -- Provider metadata
  "provider_metadata" json,

  "created_at" timestamp DEFAULT now() NOT NULL,

  CONSTRAINT "text_text_required" CHECK ((type != 'text' OR text_text IS NOT NULL)),
  CONSTRAINT "reasoning_text_required" CHECK ((type != 'reasoning' OR reasoning_text IS NOT NULL)),
  CONSTRAINT "file_fields_required" CHECK ((type != 'file' OR (file_media_type IS NOT NULL AND file_filename IS NOT NULL AND file_url IS NOT NULL))),
  CONSTRAINT "tool_state_valid" CHECK ((tool_state IS NULL OR tool_state IN ('input-streaming', 'input-available', 'output-available', 'output-error'))),
  CONSTRAINT "tool_fields_required" CHECK ((type NOT LIKE 'tool-%' OR (tool_tool_call_id IS NOT NULL AND tool_state IS NOT NULL)))
);
ALTER TABLE "parts"
  ADD CONSTRAINT "parts_message_id_messages_id_fk"
  FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id")
  ON DELETE cascade ON UPDATE no action;

-- Feedback
CREATE TABLE "feedback" (
  "id" varchar(191) PRIMARY KEY NOT NULL,
  "user_id" varchar(255),
  "sentiment" varchar(256) NOT NULL,
  "message" text NOT NULL,
  "page_url" text NOT NULL,
  "user_agent" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX "messages_chat_id_idx" ON "messages" USING btree ("chat_id");
CREATE INDEX "messages_chat_id_created_at_idx" ON "messages" USING btree ("chat_id","created_at");
CREATE INDEX "parts_message_id_idx" ON "parts" USING btree ("message_id");
CREATE INDEX "parts_message_id_order_idx" ON "parts" USING btree ("message_id","order");
CREATE INDEX "feedback_user_id_idx" ON "feedback" USING btree ("user_id");
CREATE INDEX "feedback_created_at_idx" ON "feedback" USING btree ("created_at");
CREATE INDEX "chats_user_id_idx" ON "chats" USING btree ("user_id");
CREATE INDEX "chats_user_id_created_at_idx" ON "chats" USING btree ("user_id","created_at" DESC NULLS LAST);
CREATE INDEX "chats_created_at_idx" ON "chats" USING btree ("created_at" DESC NULLS LAST);
CREATE INDEX "chats_id_user_id_idx" ON "chats" USING btree ("id","user_id");

-- RLS
ALTER TABLE "chats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "parts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "feedback" ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "users_manage_own_chats" ON "chats" AS PERMISSIVE FOR ALL TO public USING (user_id = current_setting('app.current_user_id', true)) WITH CHECK (user_id = current_setting('app.current_user_id', true));
CREATE POLICY "public_chats_readable" ON "chats" AS PERMISSIVE FOR SELECT TO public USING (visibility = 'public');

CREATE POLICY "users_manage_chat_messages" ON "messages" AS PERMISSIVE FOR ALL TO public USING (EXISTS (
  SELECT 1 FROM "chats"
  WHERE "chats".id = chat_id
  AND "chats".user_id = current_setting('app.current_user_id', true)
)) WITH CHECK (EXISTS (
  SELECT 1 FROM "chats"
  WHERE "chats".id = chat_id
  AND "chats".user_id = current_setting('app.current_user_id', true)
));
CREATE POLICY "public_chat_messages_readable" ON "messages" AS PERMISSIVE FOR SELECT TO public USING (EXISTS (
  SELECT 1 FROM "chats"
  WHERE "chats".id = chat_id
  AND "chats".visibility = 'public'
));

CREATE POLICY "users_manage_message_parts" ON "parts" AS PERMISSIVE FOR ALL TO public USING (EXISTS (
  SELECT 1 FROM "messages"
  INNER JOIN "chats" ON "chats".id = "messages".chat_id
  WHERE "messages".id = message_id
  AND "chats".user_id = current_setting('app.current_user_id', true)
)) WITH CHECK (EXISTS (
  SELECT 1 FROM "messages"
  INNER JOIN "chats" ON "chats".id = "messages".chat_id
  WHERE "messages".id = message_id
  AND "chats".user_id = current_setting('app.current_user_id', true)
));
CREATE POLICY "public_chat_parts_readable" ON "parts" AS PERMISSIVE FOR SELECT TO public USING (EXISTS (
  SELECT 1 FROM "messages"
  INNER JOIN "chats" ON "chats".id = "messages".chat_id
  WHERE "messages".id = message_id
  AND "chats".visibility = 'public'
));

-- Feedback policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'feedback' AND policyname = 'feedback_select_policy'
  ) THEN
    CREATE POLICY "feedback_select_policy" ON "feedback" AS PERMISSIVE FOR SELECT TO public USING (true);
  END IF;
END $$;
CREATE POLICY "anyone_can_insert_feedback" ON "feedback" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);

