export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: number
          organization_id: string | null
          payload: Json
          project_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: never
          organization_id?: string | null
          payload?: Json
          project_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: never
          organization_id?: string | null
          payload?: Json
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          organization_id: string
          scope: Json
          slug: string
          system_prompt: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          scope?: Json
          slug: string
          system_prompt: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          scope?: Json
          slug?: string
          system_prompt?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_jobs: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          id: string
          input: Json
          job_type: string
          last_error: string | null
          organization_id: string | null
          output: Json
          project_id: string | null
          provider: string | null
          source_entity_id: string | null
          source_entity_type: string | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          input?: Json
          job_type: string
          last_error?: string | null
          organization_id?: string | null
          output?: Json
          project_id?: string | null
          provider?: string | null
          source_entity_id?: string | null
          source_entity_type?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          input?: Json
          job_type?: string
          last_error?: string | null
          organization_id?: string | null
          output?: Json
          project_id?: string | null
          provider?: string | null
          source_entity_id?: string | null
          source_entity_type?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      app_runtime_chunks: {
        Row: {
          chunk_no: number
          created_at: string
          payload: string
          version: string
        }
        Insert: {
          chunk_no: number
          created_at?: string
          payload: string
          version: string
        }
        Update: {
          chunk_no?: number
          created_at?: string
          payload?: string
          version?: string
        }
        Relationships: []
      }
      app_runtime_files: {
        Row: {
          chunk_no: number
          created_at: string
          file_name: string
          payload: string
          version: string
        }
        Insert: {
          chunk_no: number
          created_at?: string
          file_name: string
          payload: string
          version: string
        }
        Update: {
          chunk_no?: number
          created_at?: string
          file_name?: string
          payload?: string
          version?: string
        }
        Relationships: []
      }
      app_users: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          city: string | null
          company_name: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          last_seen_at: string | null
          onboarding_complete: boolean
          phone: string | null
          phone_normalized: string | null
          phone_verified: boolean
          role: string
          role_verified: boolean
          status: string
          telegram_user_id: number | null
          telegram_username: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_seen_at?: string | null
          onboarding_complete?: boolean
          phone?: string | null
          phone_normalized?: string | null
          phone_verified?: boolean
          role?: string
          role_verified?: boolean
          status?: string
          telegram_user_id?: number | null
          telegram_username?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_seen_at?: string | null
          onboarding_complete?: boolean
          phone?: string | null
          phone_normalized?: string | null
          phone_verified?: boolean
          role?: string
          role_verified?: boolean
          status?: string
          telegram_user_id?: number | null
          telegram_username?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      assemblies: {
        Row: {
          build_days: number
          description: string | null
          id: number
          instruction_pdf: string | null
          instruction_video: string | null
          is_active: boolean
          kind: string
          name: string
          photos: string[] | null
          price_out: number
        }
        Insert: {
          build_days?: number
          description?: string | null
          id?: never
          instruction_pdf?: string | null
          instruction_video?: string | null
          is_active?: boolean
          kind: string
          name: string
          photos?: string[] | null
          price_out: number
        }
        Update: {
          build_days?: number
          description?: string | null
          id?: never
          instruction_pdf?: string | null
          instruction_video?: string | null
          is_active?: boolean
          kind?: string
          name?: string
          photos?: string[] | null
          price_out?: number
        }
        Relationships: []
      }
      assembly_items: {
        Row: {
          assembly_id: number
          product_id: number
          qty: number
        }
        Insert: {
          assembly_id: number
          product_id: number
          qty: number
        }
        Update: {
          assembly_id?: number
          product_id?: number
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "assembly_items_assembly_id_fkey"
            columns: ["assembly_id"]
            isOneToOne: false
            referencedRelation: "assemblies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assembly_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      bom_need_rules: {
        Row: {
          active: boolean
          need_code: string
          need_name: string
          need_unit: string
          notes: string | null
          operation_id: string
          quantity_factor: number
          selection_query: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          need_code: string
          need_name: string
          need_unit: string
          notes?: string | null
          operation_id: string
          quantity_factor?: number
          selection_query?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          need_code?: string
          need_name?: string
          need_unit?: string
          notes?: string | null
          operation_id?: string
          quantity_factor?: number
          selection_query?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bom_operation_policies: {
        Row: {
          active: boolean
          mode: string
          notes: string | null
          operation_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          mode: string
          notes?: string | null
          operation_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          mode?: string
          notes?: string | null
          operation_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      bot_menu_items: {
        Row: {
          action_target: string
          action_type: string
          created_at: string
          id: string
          is_active: boolean
          key: string
          label: string
          metadata: Json
          organization_id: string
          registration_required: boolean
          section: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          action_target: string
          action_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          key: string
          label: string
          metadata?: Json
          organization_id: string
          registration_required?: boolean
          section?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          action_target?: string
          action_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          metadata?: Json
          organization_id?: string
          registration_required?: boolean
          section?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_menu_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_sessions: {
        Row: {
          answers: Json
          current_question_id: string | null
          expires_at: string
          flow: string | null
          history: Json
          started_at: string
          step_key: string | null
          telegram_user_id: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          answers?: Json
          current_question_id?: string | null
          expires_at?: string
          flow?: string | null
          history?: Json
          started_at?: string
          step_key?: string | null
          telegram_user_id: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          answers?: Json
          current_question_id?: string | null
          expires_at?: string
          flow?: string | null
          history?: Json
          started_at?: string
          step_key?: string | null
          telegram_user_id?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bot_sessions_current_question_id_fkey"
            columns: ["current_question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bot_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_settings: {
        Row: {
          ai_agent_slug: string
          brand_name: string
          config: Json
          created_at: string
          miniapp_url: string | null
          organization_id: string
          registration_message: string
          support_phone: string | null
          updated_at: string
          welcome_message: string
        }
        Insert: {
          ai_agent_slug?: string
          brand_name?: string
          config?: Json
          created_at?: string
          miniapp_url?: string | null
          organization_id: string
          registration_message: string
          support_phone?: string | null
          updated_at?: string
          welcome_message: string
        }
        Update: {
          ai_agent_slug?: string
          brand_name?: string
          config?: Json
          created_at?: string
          miniapp_url?: string | null
          organization_id?: string
          registration_message?: string
          support_phone?: string | null
          updated_at?: string
          welcome_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calculator_benchmark_lines: {
        Row: {
          applied_rate: number | null
          confidence: string | null
          formula_context: Json
          id: number
          line_total: number | null
          operation_id: string
          project_id: string
          quantity: number
          section: string | null
          unit: string | null
        }
        Insert: {
          applied_rate?: number | null
          confidence?: string | null
          formula_context?: Json
          id?: never
          line_total?: number | null
          operation_id: string
          project_id: string
          quantity: number
          section?: string | null
          unit?: string | null
        }
        Update: {
          applied_rate?: number | null
          confidence?: string | null
          formula_context?: Json
          id?: never
          line_total?: number | null
          operation_id?: string
          project_id?: string
          quantity?: number
          section?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calculator_benchmark_lines_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "work_rates_v2"
            referencedColumns: ["operation_id"]
          },
          {
            foreignKeyName: "calculator_benchmark_lines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "calculator_benchmark_projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      calculator_benchmark_projects: {
        Row: {
          active: boolean
          calculated_area_m2: number | null
          heat_loss_w: number | null
          imported_at: string
          location: string | null
          notes: string | null
          pricing_mode: string | null
          project_id: string
          region_multiplier: number
          source_file: string | null
          title_area_m2: number | null
        }
        Insert: {
          active?: boolean
          calculated_area_m2?: number | null
          heat_loss_w?: number | null
          imported_at?: string
          location?: string | null
          notes?: string | null
          pricing_mode?: string | null
          project_id: string
          region_multiplier?: number
          source_file?: string | null
          title_area_m2?: number | null
        }
        Update: {
          active?: boolean
          calculated_area_m2?: number | null
          heat_loss_w?: number | null
          imported_at?: string
          location?: string | null
          notes?: string | null
          pricing_mode?: string | null
          project_id?: string
          region_multiplier?: number
          source_file?: string | null
          title_area_m2?: number | null
        }
        Relationships: []
      }
      catalog_import_chunks: {
        Row: {
          created_at: string
          data: string
          import_id: string
          seq: number
        }
        Insert: {
          created_at?: string
          data: string
          import_id: string
          seq: number
        }
        Update: {
          created_at?: string
          data?: string
          import_id?: string
          seq?: number
        }
        Relationships: []
      }
      catalog_import_jobs: {
        Row: {
          created_at: string
          expected_rows: number | null
          finished_at: string | null
          import_id: string
          result: Json
          status: string
          token_hash: string
        }
        Insert: {
          created_at?: string
          expected_rows?: number | null
          finished_at?: string | null
          import_id: string
          result?: Json
          status?: string
          token_hash: string
        }
        Update: {
          created_at?: string
          expected_rows?: number | null
          finished_at?: string | null
          import_id?: string
          result?: Json
          status?: string
          token_hash?: string
        }
        Relationships: []
      }
      catalog_products_v2: {
        Row: {
          active: boolean
          article: string | null
          brand: string | null
          calc_eligible: boolean
          category: string | null
          currency: string
          current_price: number | null
          item_id: string
          name: string
          pack_qty: number | null
          pack_unit: string | null
          price_status: string | null
          size: string | null
          source_sheet: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          article?: string | null
          brand?: string | null
          calc_eligible?: boolean
          category?: string | null
          currency?: string
          current_price?: number | null
          item_id: string
          name: string
          pack_qty?: number | null
          pack_unit?: string | null
          price_status?: string | null
          size?: string | null
          source_sheet?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          article?: string | null
          brand?: string | null
          calc_eligible?: boolean
          category?: string | null
          currency?: string
          current_price?: number | null
          item_id?: string
          name?: string
          pack_qty?: number | null
          pack_unit?: string | null
          price_status?: string | null
          size?: string | null
          source_sheet?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: number
          name: string
          parent_id: number | null
          slug: string
          sort: number
        }
        Insert: {
          id?: never
          name: string
          parent_id?: number | null
          slug: string
          sort?: number
        }
        Update: {
          id?: never
          name?: string
          parent_id?: number | null
          slug?: string
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_events: {
        Row: {
          actor_user_id: string | null
          correlation_id: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          organization_id: string
          payload: Json
          project_id: string | null
          source_channel: string
        }
        Insert: {
          actor_user_id?: string | null
          correlation_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          organization_id: string
          payload?: Json
          project_id?: string | null
          source_channel: string
        }
        Update: {
          actor_user_id?: string | null
          correlation_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          organization_id?: string
          payload?: Json
          project_id?: string | null
          source_channel?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_events_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      client_approvals: {
        Row: {
          amount: number | null
          approval_type: string
          created_at: string
          decided_at: string | null
          decision_by: string | null
          decision_comment: string | null
          description: string | null
          document_id: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json
          organization_id: string | null
          project_id: string
          requested_by: string | null
          status: string
          title: string
        }
        Insert: {
          amount?: number | null
          approval_type: string
          created_at?: string
          decided_at?: string | null
          decision_by?: string | null
          decision_comment?: string | null
          description?: string | null
          document_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          organization_id?: string | null
          project_id: string
          requested_by?: string | null
          status?: string
          title: string
        }
        Update: {
          amount?: number | null
          approval_type?: string
          created_at?: string
          decided_at?: string | null
          decision_by?: string | null
          decision_comment?: string | null
          description?: string | null
          document_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          organization_id?: string | null
          project_id?: string
          requested_by?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_approvals_decision_by_fkey"
            columns: ["decision_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_approvals_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_approvals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_approvals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_approvals_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          last_used_at: string | null
          metadata: Json
          organization_id: string
          revoked_at: string | null
          token_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          last_used_at?: string | null
          metadata?: Json
          organization_id: string
          revoked_at?: string | null
          token_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          last_used_at?: string | null
          metadata?: Json
          organization_id?: string
          revoked_at?: string | null
          token_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_project_access: {
        Row: {
          access_role: string
          can_approve: boolean
          can_request_service: boolean
          can_view_documents: boolean
          can_view_internal_costs: boolean
          can_view_media: boolean
          can_view_payments: boolean
          can_view_progress: boolean
          created_at: string
          organization_id: string
          project_id: string
          revoked_at: string | null
          user_id: string
        }
        Insert: {
          access_role?: string
          can_approve?: boolean
          can_request_service?: boolean
          can_view_documents?: boolean
          can_view_internal_costs?: boolean
          can_view_media?: boolean
          can_view_payments?: boolean
          can_view_progress?: boolean
          created_at?: string
          organization_id: string
          project_id: string
          revoked_at?: string | null
          user_id: string
        }
        Update: {
          access_role?: string
          can_approve?: boolean
          can_request_service?: boolean
          can_view_documents?: boolean
          can_view_internal_costs?: boolean
          can_view_media?: boolean
          can_view_payments?: boolean
          can_view_progress?: boolean
          created_at?: string
          organization_id?: string
          project_id?: string
          revoked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_project_access_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_project_access_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_project_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          app_user_id: string | null
          company_name: string | null
          created_at: string
          display_name: string
          email: string | null
          id: string
          metadata: Json
          organization_id: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          app_user_id?: string | null
          company_name?: string | null
          created_at?: string
          display_name: string
          email?: string | null
          id?: string
          metadata?: Json
          organization_id: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          app_user_id?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          metadata?: Json
          organization_id?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_proposals: {
        Row: {
          client_user_id: string | null
          created_at: string
          created_by: string | null
          decided_at: string | null
          discount_total: number
          document_id: string | null
          estimate_id: number | null
          id: string
          issued_at: string | null
          metadata: Json
          project_id: string
          snapshot: Json
          status: string
          subtotal: number
          title: string
          total: number
          updated_at: string
          valid_until: string | null
          version: number
        }
        Insert: {
          client_user_id?: string | null
          created_at?: string
          created_by?: string | null
          decided_at?: string | null
          discount_total?: number
          document_id?: string | null
          estimate_id?: number | null
          id?: string
          issued_at?: string | null
          metadata?: Json
          project_id: string
          snapshot?: Json
          status?: string
          subtotal?: number
          title: string
          total?: number
          updated_at?: string
          valid_until?: string | null
          version?: number
        }
        Update: {
          client_user_id?: string | null
          created_at?: string
          created_by?: string | null
          decided_at?: string | null
          discount_total?: number
          document_id?: string | null
          estimate_id?: number | null
          id?: string
          issued_at?: string | null
          metadata?: Json
          project_id?: string
          snapshot?: Json
          status?: string
          subtotal?: number
          title?: string
          total?: number
          updated_at?: string
          valid_until?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "commercial_proposals_client_user_id_fkey"
            columns: ["client_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_proposals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_proposals_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_proposals_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_proposals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          document_type: string
          external_url: string | null
          id: string
          metadata: Json
          node_id: string | null
          organization_id: string | null
          owner_user_id: string | null
          project_id: string | null
          stage_id: string | null
          status: string
          storage_path: string | null
          system_id: string | null
          title: string
          updated_at: string
          version: number
          visibility: string
          work_id: string | null
          zone_id: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          external_url?: string | null
          id?: string
          metadata?: Json
          node_id?: string | null
          organization_id?: string | null
          owner_user_id?: string | null
          project_id?: string | null
          stage_id?: string | null
          status?: string
          storage_path?: string | null
          system_id?: string | null
          title: string
          updated_at?: string
          version?: number
          visibility?: string
          work_id?: string | null
          zone_id?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          external_url?: string | null
          id?: string
          metadata?: Json
          node_id?: string | null
          organization_id?: string | null
          owner_user_id?: string | null
          project_id?: string | null
          stage_id?: string | null
          status?: string
          storage_path?: string | null
          system_id?: string | null
          title?: string
          updated_at?: string
          version?: number
          visibility?: string
          work_id?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_items: {
        Row: {
          assembly_id: number | null
          catalog_item_id: string | null
          estimate_id: number | null
          id: number
          kind: string
          metadata: Json
          name_snap: string
          price: number
          product_id: number | null
          project_material_id: string | null
          qty: number
          source_ref: string | null
          total: number | null
          unit: string
          work_id: string | null
          work_type_id: number | null
        }
        Insert: {
          assembly_id?: number | null
          catalog_item_id?: string | null
          estimate_id?: number | null
          id?: never
          kind: string
          metadata?: Json
          name_snap: string
          price: number
          product_id?: number | null
          project_material_id?: string | null
          qty: number
          source_ref?: string | null
          total?: number | null
          unit: string
          work_id?: string | null
          work_type_id?: number | null
        }
        Update: {
          assembly_id?: number | null
          catalog_item_id?: string | null
          estimate_id?: number | null
          id?: never
          kind?: string
          metadata?: Json
          name_snap?: string
          price?: number
          product_id?: number | null
          project_material_id?: string | null
          qty?: number
          source_ref?: string | null
          total?: number | null
          unit?: string
          work_id?: string | null
          work_type_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estimate_items_assembly_id_fkey"
            columns: ["assembly_id"]
            isOneToOne: false
            referencedRelation: "assemblies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_items_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_products_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "estimate_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_items_project_material_id_fkey"
            columns: ["project_material_id"]
            isOneToOne: false
            referencedRelation: "project_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_items_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_items_work_type_id_fkey"
            columns: ["work_type_id"]
            isOneToOne: false
            referencedRelation: "work_types"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          ai_source: Json | null
          created_at: string
          created_by_user_id: string | null
          discount_total: number
          equipment_total: number
          id: number
          installer_id: string | null
          labor_total: number | null
          lead_id: number | null
          mat_total: number | null
          metadata: Json
          object_addr: string | null
          object_area: number | null
          organization_id: string | null
          pdf_document_id: string | null
          project_id: string | null
          stage_id: string | null
          status: string
          title: string
          updated_at: string
          version: number
          visibility: string
        }
        Insert: {
          ai_source?: Json | null
          created_at?: string
          created_by_user_id?: string | null
          discount_total?: number
          equipment_total?: number
          id?: never
          installer_id?: string | null
          labor_total?: number | null
          lead_id?: number | null
          mat_total?: number | null
          metadata?: Json
          object_addr?: string | null
          object_area?: number | null
          organization_id?: string | null
          pdf_document_id?: string | null
          project_id?: string | null
          stage_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          version?: number
          visibility?: string
        }
        Update: {
          ai_source?: Json | null
          created_at?: string
          created_by_user_id?: string | null
          discount_total?: number
          equipment_total?: number
          id?: never
          installer_id?: string | null
          labor_total?: number | null
          lead_id?: number | null
          mat_total?: number | null
          metadata?: Json
          object_addr?: string | null
          object_area?: number | null
          organization_id?: string | null
          pdf_document_id?: string | null
          project_id?: string | null
          stage_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          version?: number
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimates_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "installers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_pdf_document_id_fkey"
            columns: ["pdf_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          expense_date: string
          id: string
          note: string | null
          organization_id: string | null
          project_id: string
          receipt_document_id: string | null
          receipt_media_id: string | null
          supplier: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by?: string | null
          expense_date?: string
          id?: string
          note?: string | null
          organization_id?: string | null
          project_id: string
          receipt_document_id?: string | null
          receipt_media_id?: string | null
          supplier?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          expense_date?: string
          id?: string
          note?: string | null
          organization_id?: string | null
          project_id?: string
          receipt_document_id?: string | null
          receipt_media_id?: string | null
          supplier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_receipt_document_id_fkey"
            columns: ["receipt_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_receipt_media_id_fkey"
            columns: ["receipt_media_id"]
            isOneToOne: false
            referencedRelation: "project_media"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_link_codes: {
        Row: {
          code_hash: string
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          purpose: string
          user_id: string
        }
        Insert: {
          code_hash: string
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          purpose?: string
          user_id: string
        }
        Update: {
          code_hash?: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          purpose?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_link_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      installers: {
        Row: {
          app_user_id: string | null
          city: string | null
          created_at: string
          discount_pct: number
          gmv_total: number
          id: string
          is_active: boolean
          level: string
          name: string | null
          phone: string | null
          rating: number | null
          specialties: string[] | null
        }
        Insert: {
          app_user_id?: string | null
          city?: string | null
          created_at?: string
          discount_pct?: number
          gmv_total?: number
          id?: string
          is_active?: boolean
          level?: string
          name?: string | null
          phone?: string | null
          rating?: number | null
          specialties?: string[] | null
        }
        Update: {
          app_user_id?: string | null
          city?: string | null
          created_at?: string
          discount_pct?: number
          gmv_total?: number
          id?: string
          is_active?: boolean
          level?: string
          name?: string | null
          phone?: string | null
          rating?: number | null
          specialties?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "installers_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notifications: {
        Row: {
          created_at: string
          last_error: string | null
          lead_id: number
          notified_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          last_error?: string | null
          lead_id: number
          notified_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          last_error?: string | null
          lead_id?: number
          notified_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notifications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          admin_notes: string | null
          app_user_id: string | null
          city: string | null
          comment: string | null
          created_at: string
          estimated_value: number | null
          id: number
          last_contact_at: string | null
          lost_reason: string | null
          name: string | null
          next_action_at: string | null
          organization_id: string | null
          payload: Json
          phone: string | null
          pipeline_stage: string
          project_id: string | null
          quiz_type: string | null
          source: string | null
          status: string
          telegram_user_id: number | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          app_user_id?: string | null
          city?: string | null
          comment?: string | null
          created_at?: string
          estimated_value?: number | null
          id?: never
          last_contact_at?: string | null
          lost_reason?: string | null
          name?: string | null
          next_action_at?: string | null
          organization_id?: string | null
          payload?: Json
          phone?: string | null
          pipeline_stage?: string
          project_id?: string | null
          quiz_type?: string | null
          source?: string | null
          status?: string
          telegram_user_id?: number | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          app_user_id?: string | null
          city?: string | null
          comment?: string | null
          created_at?: string
          estimated_value?: number | null
          id?: never
          last_contact_at?: string | null
          lost_reason?: string | null
          name?: string | null
          next_action_at?: string | null
          organization_id?: string | null
          payload?: Json
          phone?: string | null
          pipeline_stage?: string
          project_id?: string | null
          quiz_type?: string | null
          source?: string | null
          status?: string
          telegram_user_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_app_user_id_fkey"
            columns: ["app_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      material_request_items: {
        Row: {
          catalog_item_id: string | null
          created_at: string
          currency: string | null
          delivered_quantity: number
          estimated_price: number | null
          id: string
          metadata: Json
          name_snap: string
          note: string | null
          ordered_quantity: number
          price_snapshot: number | null
          product_id: number | null
          quantity: number
          request_id: string
          unit: string
        }
        Insert: {
          catalog_item_id?: string | null
          created_at?: string
          currency?: string | null
          delivered_quantity?: number
          estimated_price?: number | null
          id?: string
          metadata?: Json
          name_snap: string
          note?: string | null
          ordered_quantity?: number
          price_snapshot?: number | null
          product_id?: number | null
          quantity: number
          request_id: string
          unit?: string
        }
        Update: {
          catalog_item_id?: string | null
          created_at?: string
          currency?: string | null
          delivered_quantity?: number
          estimated_price?: number | null
          id?: string
          metadata?: Json
          name_snap?: string
          note?: string | null
          ordered_quantity?: number
          price_snapshot?: number | null
          product_id?: number | null
          quantity?: number
          request_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_request_items_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_products_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "material_request_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "material_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      material_requests: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          needed_by: string | null
          organization_id: string | null
          priority: string
          project_id: string
          requested_by: string
          source_estimate_id: number | null
          source_estimate_version: number | null
          status: string
          task_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          needed_by?: string | null
          organization_id?: string | null
          priority?: string
          project_id: string
          requested_by: string
          source_estimate_id?: number | null
          source_estimate_version?: number | null
          status?: string
          task_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          needed_by?: string | null
          organization_id?: string | null
          priority?: string
          project_id?: string
          requested_by?: string
          source_estimate_id?: number | null
          source_estimate_version?: number | null
          status?: string
          task_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_requests_source_estimate_id_fkey"
            columns: ["source_estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_requests_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      material_usage: {
        Row: {
          catalog_item_id: string | null
          created_at: string
          id: string
          metadata: Json
          movement_type: string
          name_snap: string
          note: string | null
          product_id: number | null
          project_id: string
          quantity: number
          source_request_id: string | null
          task_id: string | null
          unit: string
          unit_price: number | null
          user_id: string | null
        }
        Insert: {
          catalog_item_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          movement_type?: string
          name_snap: string
          note?: string | null
          product_id?: number | null
          project_id: string
          quantity: number
          source_request_id?: string | null
          task_id?: string | null
          unit?: string
          unit_price?: number | null
          user_id?: string | null
        }
        Update: {
          catalog_item_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          movement_type?: string
          name_snap?: string
          note?: string | null
          product_id?: number | null
          project_id?: string
          quantity?: number
          source_request_id?: string | null
          task_id?: string | null
          unit?: string
          unit_price?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "material_usage_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_products_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "material_usage_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_usage_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_usage_source_request_id_fkey"
            columns: ["source_request_id"]
            isOneToOne: false
            referencedRelation: "material_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_usage_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          channel: string
          created_at: string
          direction: string
          id: string
          metadata: Json
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          body?: string | null
          channel?: string
          created_at?: string
          direction: string
          id?: string
          metadata?: Json
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string | null
          channel?: string
          created_at?: string
          direction?: string
          id?: string
          metadata?: Json
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      miniapp_access_requests: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          organization_id: string
          phone: string | null
          requested_at: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by_telegram_user_id: number | null
          status: string
          telegram_user_id: number
          telegram_username: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id: string
          phone?: string | null
          requested_at?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by_telegram_user_id?: number | null
          status?: string
          telegram_user_id: number
          telegram_username?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id?: string
          phone?: string | null
          requested_at?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by_telegram_user_id?: number | null
          status?: string
          telegram_user_id?: number
          telegram_username?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "miniapp_access_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miniapp_access_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      nodes: {
        Row: {
          code: string | null
          commissioned_at: string | null
          created_at: string
          id: string
          installed_at: string | null
          manufacturer: string | null
          metadata: Json
          model: string | null
          name: string
          node_type: string
          organization_id: string
          parent_node_id: string | null
          project_id: string
          serial_number: string | null
          status: string
          system_id: string
          updated_at: string
          zone_id: string | null
        }
        Insert: {
          code?: string | null
          commissioned_at?: string | null
          created_at?: string
          id?: string
          installed_at?: string | null
          manufacturer?: string | null
          metadata?: Json
          model?: string | null
          name: string
          node_type?: string
          organization_id: string
          parent_node_id?: string | null
          project_id: string
          serial_number?: string | null
          status?: string
          system_id: string
          updated_at?: string
          zone_id?: string | null
        }
        Update: {
          code?: string | null
          commissioned_at?: string | null
          created_at?: string
          id?: string
          installed_at?: string | null
          manufacturer?: string | null
          metadata?: Json
          model?: string | null
          name?: string
          node_type?: string
          organization_id?: string
          parent_node_id?: string | null
          project_id?: string
          serial_number?: string | null
          status?: string
          system_id?: string
          updated_at?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nodes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nodes_parent_node_id_fkey"
            columns: ["parent_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nodes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nodes_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nodes_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action: Json
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          organization_id: string | null
          project_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action?: Json
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          organization_id?: string | null
          project_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action?: Json
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          organization_id?: string | null
          project_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events: {
        Row: {
          created_at: string
          id: number
          note: string | null
          order_id: number | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: never
          note?: string | null
          order_id?: number | null
          status: string
        }
        Update: {
          created_at?: string
          id?: never
          note?: string | null
          order_id?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          assembly_id: number | null
          id: number
          name_snap: string
          order_id: number | null
          price: number
          product_id: number | null
          qty: number
          total: number | null
        }
        Insert: {
          assembly_id?: number | null
          id?: never
          name_snap: string
          order_id?: number | null
          price: number
          product_id?: number | null
          qty: number
          total?: number | null
        }
        Update: {
          assembly_id?: number | null
          id?: never
          name_snap?: string
          order_id?: number | null
          price?: number
          product_id?: number | null
          qty?: number
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_assembly_id_fkey"
            columns: ["assembly_id"]
            isOneToOne: false
            referencedRelation: "assemblies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          comment: string | null
          created_at: string
          delivery: string
          discount_pct: number | null
          estimate_id: number | null
          grand_total: number | null
          id: number
          installer_id: string | null
          mat_total: number | null
          status: string
        }
        Insert: {
          address?: string | null
          comment?: string | null
          created_at?: string
          delivery?: string
          discount_pct?: number | null
          estimate_id?: number | null
          grand_total?: number | null
          id?: never
          installer_id?: string | null
          mat_total?: number | null
          status?: string
        }
        Update: {
          address?: string | null
          comment?: string | null
          created_at?: string
          delivery?: string
          discount_pct?: number | null
          estimate_id?: number | null
          grand_total?: number | null
          id?: never
          installer_id?: string | null
          mat_total?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "installers"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_catalog_defaults: {
        Row: {
          active: boolean
          catalog_item_id: string
          metadata: Json
          need_code: string
          need_per_catalog_unit: number
          organization_id: string
          round_mode: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          catalog_item_id: string
          metadata?: Json
          need_code: string
          need_per_catalog_unit?: number
          organization_id: string
          round_mode?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          catalog_item_id?: string
          metadata?: Json
          need_code?: string
          need_per_catalog_unit?: number
          organization_id?: string
          round_mode?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_catalog_defaults_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_products_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "organization_catalog_defaults_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string | null
          expires_at: string | null
          id: string
          invited_by: string | null
          organization_id: string
          phone: string | null
          role: string
          status: string
          telegram_username: string | null
          token_hash: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          organization_id: string
          phone?: string | null
          role?: string
          status?: string
          telegram_username?: string | null
          token_hash?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          organization_id?: string
          phone?: string | null
          role?: string
          status?: string
          telegram_username?: string | null
          token_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          joined_at: string
          organization_id: string
          permissions: Json
          role: string
          status: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          organization_id: string
          permissions?: Json
          role: string
          status?: string
          user_id: string
        }
        Update: {
          joined_at?: string
          organization_id?: string
          permissions?: Json
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_mode: string
          created_at: string
          id: string
          metadata: Json
          name: string
          organization_type: string
          owner_user_id: string | null
          plan_code: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          billing_mode?: string
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          organization_type?: string
          owner_user_id?: string | null
          plan_code?: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          billing_mode?: string
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          organization_type?: string
          owner_user_id?: string | null
          plan_code?: string
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          document_id: string | null
          due_date: string | null
          id: string
          note: string | null
          organization_id: string | null
          paid_at: string | null
          payment_type: string
          project_id: string
          stage_id: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          document_id?: string | null
          due_date?: string | null
          id?: string
          note?: string | null
          organization_id?: string | null
          paid_at?: string | null
          payment_type?: string
          project_id: string
          stage_id?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          document_id?: string | null
          due_date?: string | null
          id?: string
          note?: string | null
          organization_id?: string | null
          paid_at?: string | null
          payment_type?: string
          project_id?: string
          stage_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_active: boolean
          permissions: Json
          telegram_user_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          permissions?: Json
          telegram_user_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          permissions?: Json
          telegram_user_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string | null
          category_id: number | null
          created_at: string
          id: number
          is_active: boolean
          name: string
          price_in: number
          price_out: number
          search_tsv: unknown
          sku: string | null
          stock_qty: number | null
          supplier_id: number | null
          unit: string
        }
        Insert: {
          brand?: string | null
          category_id?: number | null
          created_at?: string
          id?: never
          is_active?: boolean
          name: string
          price_in: number
          price_out: number
          search_tsv?: unknown
          sku?: string | null
          stock_qty?: number | null
          supplier_id?: number | null
          unit?: string
        }
        Update: {
          brand?: string | null
          category_id?: number | null
          created_at?: string
          id?: never
          is_active?: boolean
          name?: string
          price_in?: number
          price_out?: number
          search_tsv?: unknown
          sku?: string | null
          stock_qty?: number | null
          supplier_id?: number | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      products_raw: {
        Row: {
          brand: string | null
          category: string | null
          name: string | null
          price_in: number | null
          price_out: number | null
          sku: string | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          name?: string | null
          price_in?: number | null
          price_out?: number | null
          sku?: string | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          name?: string | null
          price_in?: number | null
          price_out?: number | null
          sku?: string | null
        }
        Relationships: []
      }
      project_ai_insights: {
        Row: {
          body: string
          confidence: number | null
          created_at: string
          created_by_job_id: string | null
          id: string
          kind: string
          metadata: Json
          project_id: string
          title: string | null
        }
        Insert: {
          body: string
          confidence?: number | null
          created_at?: string
          created_by_job_id?: string | null
          id?: string
          kind: string
          metadata?: Json
          project_id: string
          title?: string | null
        }
        Update: {
          body?: string
          confidence?: number | null
          created_at?: string
          created_by_job_id?: string | null
          id?: string
          kind?: string
          metadata?: Json
          project_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_ai_insights_created_by_job_id_fkey"
            columns: ["created_by_job_id"]
            isOneToOne: false
            referencedRelation: "ai_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_ai_insights_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          invite_role: string
          invite_token: string
          metadata: Json
          phone: string | null
          project_id: string
          revoked_at: string | null
          telegram_user_id: number | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          invite_role: string
          invite_token: string
          metadata?: Json
          phone?: string | null
          project_id: string
          revoked_at?: string | null
          telegram_user_id?: number | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          invite_role?: string
          invite_token?: string
          metadata?: Json
          phone?: string | null
          project_id?: string
          revoked_at?: string | null
          telegram_user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_invites_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_materials: {
        Row: {
          catalog_item_id: string | null
          created_at: string
          delivered_quantity: number
          id: string
          installed_quantity: number
          metadata: Json
          name_snap: string
          node_id: string | null
          ordered_quantity: number
          organization_id: string
          project_id: string
          required_quantity: number
          reserved_quantity: number
          status: string
          system_id: string | null
          unit: string
          updated_at: string
          work_id: string | null
          zone_id: string | null
        }
        Insert: {
          catalog_item_id?: string | null
          created_at?: string
          delivered_quantity?: number
          id?: string
          installed_quantity?: number
          metadata?: Json
          name_snap: string
          node_id?: string | null
          ordered_quantity?: number
          organization_id: string
          project_id: string
          required_quantity?: number
          reserved_quantity?: number
          status?: string
          system_id?: string | null
          unit?: string
          updated_at?: string
          work_id?: string | null
          zone_id?: string | null
        }
        Update: {
          catalog_item_id?: string | null
          created_at?: string
          delivered_quantity?: number
          id?: string
          installed_quantity?: number
          metadata?: Json
          name_snap?: string
          node_id?: string | null
          ordered_quantity?: number
          organization_id?: string
          project_id?: string
          required_quantity?: number
          reserved_quantity?: number
          status?: string
          system_id?: string | null
          unit?: string
          updated_at?: string
          work_id?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_materials_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_products_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "project_materials_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_materials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_materials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_materials_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_materials_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_materials_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      project_media: {
        Row: {
          caption: string | null
          created_at: string
          file_name: string | null
          id: string
          media_type: string
          metadata: Json
          mime_type: string | null
          node_id: string | null
          organization_id: string | null
          project_id: string
          stage: string | null
          stage_id: string | null
          storage_path: string
          uploaded_by: string | null
          visibility: string
          work_id: string | null
          zone_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          file_name?: string | null
          id?: string
          media_type: string
          metadata?: Json
          mime_type?: string | null
          node_id?: string | null
          organization_id?: string | null
          project_id: string
          stage?: string | null
          stage_id?: string | null
          storage_path: string
          uploaded_by?: string | null
          visibility?: string
          work_id?: string | null
          zone_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          file_name?: string | null
          id?: string
          media_type?: string
          metadata?: Json
          mime_type?: string | null
          node_id?: string | null
          organization_id?: string | null
          project_id?: string
          stage?: string | null
          stage_id?: string | null
          storage_path?: string
          uploaded_by?: string | null
          visibility?: string
          work_id?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_media_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_media_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_media_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_media_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_media_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_media_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string
          is_primary: boolean
          member_role: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          is_primary?: boolean
          member_role: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          is_primary?: boolean
          member_role?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_stages: {
        Row: {
          actual_finish: string | null
          actual_start: string | null
          budget_amount: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string | null
          planned_finish: string | null
          planned_start: string | null
          progress_percent: number
          project_id: string
          sort_order: number
          status: string
          system: string | null
          updated_at: string
          visibility: string
        }
        Insert: {
          actual_finish?: string | null
          actual_start?: string | null
          budget_amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          planned_finish?: string | null
          planned_start?: string | null
          progress_percent?: number
          project_id: string
          sort_order?: number
          status?: string
          system?: string | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          actual_finish?: string | null
          actual_start?: string | null
          budget_amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          planned_finish?: string | null
          planned_start?: string | null
          progress_percent?: number
          project_id?: string
          sort_order?: number
          status?: string
          system?: string | null
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_stages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_updates: {
        Row: {
          author_user_id: string | null
          body: string | null
          created_at: string
          id: string
          metadata: Json
          organization_id: string | null
          progress_percent: number | null
          project_id: string
          stage: string | null
          stage_id: string | null
          title: string | null
          update_type: string
        }
        Insert: {
          author_user_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          organization_id?: string | null
          progress_percent?: number | null
          project_id: string
          stage?: string | null
          stage_id?: string | null
          title?: string | null
          update_type?: string
        }
        Update: {
          author_user_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          organization_id?: string | null
          progress_percent?: number | null
          project_id?: string
          stage?: string | null
          stage_id?: string | null
          title?: string | null
          update_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          area_m2: number | null
          bathrooms: number | null
          budget_estimate: number | null
          city: string | null
          client_id: string | null
          client_phone_normalized: string | null
          client_user_id: string | null
          created_at: string
          created_by: string | null
          current_stage: string | null
          floors: number | null
          id: string
          notes: string | null
          organization_id: string | null
          paid_amount: number
          planned_finish: string | null
          planned_start: string | null
          progress_percent: number
          responsible_user_id: string | null
          source_data: Json
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          area_m2?: number | null
          bathrooms?: number | null
          budget_estimate?: number | null
          city?: string | null
          client_id?: string | null
          client_phone_normalized?: string | null
          client_user_id?: string | null
          created_at?: string
          created_by?: string | null
          current_stage?: string | null
          floors?: number | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          paid_amount?: number
          planned_finish?: string | null
          planned_start?: string | null
          progress_percent?: number
          responsible_user_id?: string | null
          source_data?: Json
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          area_m2?: number | null
          bathrooms?: number | null
          budget_estimate?: number | null
          city?: string | null
          client_id?: string | null
          client_phone_normalized?: string | null
          client_user_id?: string | null
          created_at?: string
          created_by?: string | null
          current_stage?: string | null
          floors?: number | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          paid_amount?: number
          planned_finish?: string | null
          planned_start?: string | null
          progress_percent?: number
          responsible_user_id?: string | null
          source_data?: Json
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_client_user_id_fkey"
            columns: ["client_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_responsible_user_id_fkey"
            columns: ["responsible_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_items: {
        Row: {
          catalog_item_id: string | null
          created_at: string
          delivered_quantity: number
          id: string
          material_request_item_id: string | null
          metadata: Json
          name_snap: string
          project_material_id: string | null
          purchase_order_id: string
          quantity: number
          total: number | null
          unit: string
          unit_price: number
        }
        Insert: {
          catalog_item_id?: string | null
          created_at?: string
          delivered_quantity?: number
          id?: string
          material_request_item_id?: string | null
          metadata?: Json
          name_snap: string
          project_material_id?: string | null
          purchase_order_id: string
          quantity: number
          total?: number | null
          unit?: string
          unit_price?: number
        }
        Update: {
          catalog_item_id?: string | null
          created_at?: string
          delivered_quantity?: number
          id?: string
          material_request_item_id?: string | null
          metadata?: Json
          name_snap?: string
          project_material_id?: string | null
          purchase_order_id?: string
          quantity?: number
          total?: number | null
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_products_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "purchase_items_material_request_item_id_fkey"
            columns: ["material_request_item_id"]
            isOneToOne: false
            referencedRelation: "material_request_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_project_material_id_fkey"
            columns: ["project_material_id"]
            isOneToOne: false
            referencedRelation: "project_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          delivered_at: string | null
          delivery_cost: number
          expected_at: string | null
          id: string
          material_request_id: string | null
          metadata: Json
          order_number: string | null
          ordered_at: string | null
          organization_id: string
          project_id: string
          status: string
          subtotal: number
          supplier_id: number | null
          supplier_name: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          delivered_at?: string | null
          delivery_cost?: number
          expected_at?: string | null
          id?: string
          material_request_id?: string | null
          metadata?: Json
          order_number?: string | null
          ordered_at?: string | null
          organization_id: string
          project_id: string
          status?: string
          subtotal?: number
          supplier_id?: number | null
          supplier_name?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          delivered_at?: string | null
          delivery_cost?: number
          expected_at?: string | null
          id?: string
          material_request_id?: string | null
          metadata?: Json
          order_number?: string | null
          ordered_at?: string | null
          organization_id?: string
          project_id?: string
          status?: string
          subtotal?: number
          supplier_id?: number | null
          supplier_name?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_material_request_id_fkey"
            columns: ["material_request_id"]
            isOneToOne: false
            referencedRelation: "material_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_definitions: {
        Row: {
          completion_message: string | null
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          metadata: Json
          organization_id: string
          result_config: Json
          slug: string
          sort_order: number
          start_message: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completion_message?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          organization_id: string
          result_config?: Json
          slug: string
          sort_order?: number
          start_message?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completion_message?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          organization_id?: string
          result_config?: Json
          slug?: string
          sort_order?: number
          start_message?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_definitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_options: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          key: string
          label: string
          metadata: Json
          question_id: string
          sort_order: number
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          key: string
          label: string
          metadata?: Json
          question_id: string
          sort_order?: number
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          metadata?: Json
          question_id?: string
          sort_order?: number
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string
          help_text: string | null
          id: string
          input_type: string
          is_active: boolean
          key: string
          max_value: number | null
          metadata: Json
          min_value: number | null
          placeholder: string | null
          prompt: string
          quiz_id: string
          required: boolean
          sort_order: number
          unit: string | null
          updated_at: string
          visibility_rule: Json
        }
        Insert: {
          created_at?: string
          help_text?: string | null
          id?: string
          input_type: string
          is_active?: boolean
          key: string
          max_value?: number | null
          metadata?: Json
          min_value?: number | null
          placeholder?: string | null
          prompt: string
          quiz_id: string
          required?: boolean
          sort_order?: number
          unit?: string | null
          updated_at?: string
          visibility_rule?: Json
        }
        Update: {
          created_at?: string
          help_text?: string | null
          id?: string
          input_type?: string
          is_active?: boolean
          key?: string
          max_value?: number | null
          metadata?: Json
          min_value?: number | null
          placeholder?: string | null
          prompt?: string
          quiz_id?: string
          required?: boolean
          sort_order?: number
          unit?: string | null
          updated_at?: string
          visibility_rule?: Json
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_submissions: {
        Row: {
          answers: Json
          city: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          lead_id: number | null
          organization_id: string | null
          preferred_channel: string | null
          project_id: string | null
          quiz_type: string
          source: string
          status: string
          telegram_user_id: number | null
          user_id: string | null
        }
        Insert: {
          answers?: Json
          city?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          lead_id?: number | null
          organization_id?: string | null
          preferred_channel?: string | null
          project_id?: string | null
          quiz_type: string
          source?: string
          status?: string
          telegram_user_id?: number | null
          user_id?: string | null
        }
        Update: {
          answers?: Json
          city?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          lead_id?: number | null
          organization_id?: string | null
          preferred_channel?: string | null
          project_id?: string | null
          quiz_type?: string
          source?: string
          status?: string
          telegram_user_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_submissions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_submissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          metadata: Json
          organization_id: string | null
          priority: string
          project_id: string | null
          resolved_at: string | null
          scheduled_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          metadata?: Json
          organization_id?: string | null
          priority?: string
          project_id?: string | null
          resolved_at?: string | null
          scheduled_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          metadata?: Json
          organization_id?: string | null
          priority?: string
          project_id?: string | null
          resolved_at?: string | null
          scheduled_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_runtime_chunks: {
        Row: {
          created_at: string
          data: string
          release_id: string
          seq: number
        }
        Insert: {
          created_at?: string
          data: string
          release_id: string
          seq: number
        }
        Update: {
          created_at?: string
          data?: string
          release_id?: string
          seq?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_mode: string
          commission_rate: number
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          metadata: Json
          monthly_amount: number
          organization_id: string
          plan_code: string
          status: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          billing_mode: string
          commission_rate?: number
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json
          monthly_amount?: number
          organization_id: string
          plan_code: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          billing_mode?: string
          commission_rate?: number
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json
          monthly_amount?: number
          organization_id?: string
          plan_code?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          city: string | null
          contact: Json | null
          delivery_days: number | null
          id: number
          is_active: boolean
          name: string
        }
        Insert: {
          city?: string | null
          contact?: Json | null
          delivery_days?: number | null
          id?: never
          is_active?: boolean
          name: string
        }
        Update: {
          city?: string | null
          contact?: Json | null
          delivery_days?: number | null
          id?: never
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      systems: {
        Row: {
          code: string | null
          created_at: string
          id: string
          metadata: Json
          name: string
          organization_id: string
          parent_system_id: string | null
          project_id: string
          status: string
          system_type: string
          updated_at: string
          zone_id: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          organization_id: string
          parent_system_id?: string | null
          project_id: string
          status?: string
          system_type: string
          updated_at?: string
          zone_id?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          organization_id?: string
          parent_system_id?: string | null
          project_id?: string
          status?: string
          system_type?: string
          updated_at?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "systems_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "systems_parent_system_id_fkey"
            columns: ["parent_system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "systems_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "systems_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      task_checklist_items: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          id: string
          is_done: boolean
          sort_order: number
          task_id: string
          title: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          is_done?: boolean
          sort_order?: number
          task_id: string
          title: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          is_done?: boolean
          sort_order?: number
          task_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_checklist_items_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_checklist_items_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          id: string
          node_id: string | null
          organization_id: string | null
          priority: string
          project_id: string
          stage: string | null
          status: string
          system_id: string | null
          title: string
          updated_at: string
          work_id: string | null
          zone_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          node_id?: string | null
          organization_id?: string | null
          priority?: string
          project_id: string
          stage?: string | null
          status?: string
          system_id?: string | null
          title: string
          updated_at?: string
          work_id?: string | null
          zone_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          node_id?: string | null
          organization_id?: string | null
          priority?: string
          project_id?: string
          stage?: string | null
          status?: string
          system_id?: string | null
          title?: string
          updated_at?: string
          work_id?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_links: {
        Row: {
          created_at: string
          id: string
          last_seen_at: string | null
          link_status: string
          metadata: Json
          miniapp_enabled: boolean
          notifications_enabled: boolean
          organization_id: string | null
          telegram_chat_id: number | null
          telegram_user_id: number
          telegram_username: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen_at?: string | null
          link_status?: string
          metadata?: Json
          miniapp_enabled?: boolean
          notifications_enabled?: boolean
          organization_id?: string | null
          telegram_chat_id?: number | null
          telegram_user_id: number
          telegram_username?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen_at?: string | null
          link_status?: string
          metadata?: Json
          miniapp_enabled?: boolean
          notifications_enabled?: boolean
          organization_id?: string | null
          telegram_chat_id?: number | null
          telegram_user_id?: number
          telegram_username?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_links_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      work_norms: {
        Row: {
          product_id: number
          qty_per_unit: number
          work_type_id: number
        }
        Insert: {
          product_id: number
          qty_per_unit: number
          work_type_id: number
        }
        Update: {
          product_id?: number
          qty_per_unit?: number
          work_type_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "work_norms_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_norms_work_type_id_fkey"
            columns: ["work_type_id"]
            isOneToOne: false
            referencedRelation: "work_types"
            referencedColumns: ["id"]
          },
        ]
      }
      work_rates_v2: {
        Row: {
          active: boolean
          commercial_rate: number
          confidence: string | null
          formula_text: string | null
          notes: string | null
          operation_id: string
          operation_name: string
          parameters: Json
          pricing_method: string | null
          section: string
          target_rate: number
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          commercial_rate?: number
          confidence?: string | null
          formula_text?: string | null
          notes?: string | null
          operation_id: string
          operation_name: string
          parameters?: Json
          pricing_method?: string | null
          section: string
          target_rate?: number
          unit: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          commercial_rate?: number
          confidence?: string | null
          formula_text?: string | null
          notes?: string | null
          operation_id?: string
          operation_name?: string
          parameters?: Json
          pricing_method?: string | null
          section?: string
          target_rate?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      work_sessions: {
        Row: {
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          hourly_cost_snapshot: number
          id: string
          labor_cost: number | null
          metadata: Json
          note: string | null
          project_id: string
          started_at: string
          status: string
          task_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          hourly_cost_snapshot?: number
          id?: string
          labor_cost?: number | null
          metadata?: Json
          note?: string | null
          project_id: string
          started_at?: string
          status?: string
          task_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          hourly_cost_snapshot?: number
          id?: string
          labor_cost?: number | null
          metadata?: Json
          note?: string | null
          project_id?: string
          started_at?: string
          status?: string
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      work_types: {
        Row: {
          id: number
          labor_price: number
          name: string
          price_max: number | null
          price_min: number | null
          sort: number | null
          system: string
          unit: string
        }
        Insert: {
          id?: never
          labor_price: number
          name: string
          price_max?: number | null
          price_min?: number | null
          sort?: number | null
          system: string
          unit?: string
        }
        Update: {
          id?: never
          labor_price?: number
          name?: string
          price_max?: number | null
          price_min?: number | null
          sort?: number | null
          system?: string
          unit?: string
        }
        Relationships: []
      }
      worker_cost_rates: {
        Row: {
          created_at: string
          created_by: string | null
          effective_from: string
          hourly_cost: number
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          effective_from?: string
          hourly_cost: number
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          effective_from?: string
          hourly_cost?: number
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_cost_rates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_cost_rates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_reports: {
        Row: {
          body: string | null
          created_at: string
          id: string
          metadata: Json
          project_id: string
          report_type: string
          status: string
          transcript: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          project_id: string
          report_type?: string
          status?: string
          transcript?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          project_id?: string
          report_type?: string
          status?: string
          transcript?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      works: {
        Row: {
          actual_finish: string | null
          actual_start: string | null
          completed_quantity: number
          created_at: string
          description: string | null
          id: string
          metadata: Json
          node_id: string | null
          organization_id: string
          parent_work_id: string | null
          planned_finish: string | null
          planned_quantity: number | null
          planned_start: string | null
          project_id: string
          sort_order: number
          stage_id: string | null
          status: string
          system_id: string | null
          title: string
          unit: string | null
          updated_at: string
          zone_id: string | null
        }
        Insert: {
          actual_finish?: string | null
          actual_start?: string | null
          completed_quantity?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          node_id?: string | null
          organization_id: string
          parent_work_id?: string | null
          planned_finish?: string | null
          planned_quantity?: number | null
          planned_start?: string | null
          project_id: string
          sort_order?: number
          stage_id?: string | null
          status?: string
          system_id?: string | null
          title: string
          unit?: string | null
          updated_at?: string
          zone_id?: string | null
        }
        Update: {
          actual_finish?: string | null
          actual_start?: string | null
          completed_quantity?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          node_id?: string | null
          organization_id?: string
          parent_work_id?: string | null
          planned_finish?: string | null
          planned_quantity?: number | null
          planned_start?: string | null
          project_id?: string
          sort_order?: number
          stage_id?: string | null
          status?: string
          system_id?: string | null
          title?: string
          unit?: string | null
          updated_at?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "works_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "works_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "works_parent_work_id_fkey"
            columns: ["parent_work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "works_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "works_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "works_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "works_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          code: string | null
          created_at: string
          id: string
          metadata: Json
          name: string
          organization_id: string
          parent_zone_id: string | null
          project_id: string
          sort_order: number
          updated_at: string
          zone_type: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          organization_id: string
          parent_zone_id?: string | null
          project_id: string
          sort_order?: number
          updated_at?: string
          zone_type?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          organization_id?: string
          parent_zone_id?: string | null
          project_id?: string
          sort_order?: number
          updated_at?: string
          zone_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "zones_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zones_parent_zone_id_fkey"
            columns: ["parent_zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_catalog_item_to_estimate_for_actor: {
        Args: {
          p_actor_user_id: string
          p_estimate_id: number
          p_item_id: string
          p_kind?: string
          p_qty: number
        }
        Returns: Json
      }
      add_my_catalog_item_to_estimate: {
        Args: {
          p_estimate_id: number
          p_item_id: string
          p_kind?: string
          p_qty: number
        }
        Returns: Json
      }
      apply_bom_to_estimate_for_actor: {
        Args: { p_actor_user_id: string; p_estimate_id: number; p_lines: Json }
        Returns: Json
      }
      calculate_bom_v1_for_actor: {
        Args: {
          p_actor_user_id: string
          p_lines: Json
          p_organization_id?: string
        }
        Returns: Json
      }
      calculate_labor_quote_v2_for_actor: {
        Args: { p_actor_user_id: string; p_lines: Json }
        Returns: Json
      }
      calculate_my_labor_quote_v2: { Args: { p_lines: Json }; Returns: Json }
      catalog_search_v2: {
        Args: { result_limit?: number; search_query: string }
        Returns: {
          article: string
          brand: string
          calc_eligible: boolean
          category: string
          currency: string
          current_price: number
          item_id: string
          name: string
          price_status: string
          size: string
          unit: string
        }[]
      }
      client_portal_payload_for_actor: {
        Args: {
          p_actor_user_id: string
          p_allow_org_preview?: boolean
          p_project_id: string
        }
        Returns: Json
      }
      consume_telegram_link_code: {
        Args: {
          p_code: string
          p_first_name?: string
          p_last_name?: string
          p_telegram_user_id: number
          p_telegram_username?: string
        }
        Returns: string
      }
      create_estimate_for_actor: {
        Args: {
          p_actor_user_id: string
          p_project_id: string
          p_title?: string
        }
        Returns: Json
      }
      create_my_estimate: {
        Args: { p_project_id: string; p_title?: string }
        Returns: Json
      }
      create_my_organization: {
        Args: { p_name: string; p_type?: string }
        Returns: string
      }
      create_my_service_request: {
        Args: {
          p_category: string
          p_description?: string
          p_priority?: string
          p_project_id: string
          p_title: string
        }
        Returns: string
      }
      create_my_task: {
        Args: {
          p_assigned_to?: string
          p_description?: string
          p_due_at?: string
          p_priority?: string
          p_project_id: string
          p_stage?: string
          p_title: string
        }
        Returns: string
      }
      create_telegram_link_code: { Args: never; Returns: string }
      current_app_user_id: { Args: never; Returns: string }
      decide_my_client_approval: {
        Args: { p_approval_id: string; p_comment?: string; p_decision: string }
        Returns: Json
      }
      estimate_to_material_request_for_actor: {
        Args: {
          p_actor_user_id: string
          p_estimate_id: number
          p_priority?: string
        }
        Returns: Json
      }
      estimate_to_my_material_request: {
        Args: { p_estimate_id: number; p_priority?: string }
        Returns: Json
      }
      get_estimate_for_actor: {
        Args: { p_actor_user_id: string; p_estimate_id: number }
        Returns: Json
      }
      get_my_client_portal: { Args: { p_project_id: string }; Returns: Json }
      get_my_context: { Args: never; Returns: Json }
      get_my_estimate: { Args: { p_estimate_id: number }; Returns: Json }
      get_my_organization_members: {
        Args: { p_organization_id: string }
        Returns: {
          first_name: string
          last_name: string
          member_role: string
          role_verified: boolean
          status: string
          telegram_username: string
          user_id: string
        }[]
      }
      get_my_projects: {
        Args: { p_organization_id?: string }
        Returns: {
          access_mode: string
          address: string
          area_m2: number
          bathrooms: number
          budget_estimate: number
          city: string
          current_stage: string
          floors: number
          id: string
          organization_id: string
          paid_amount: number
          planned_finish: string
          planned_start: string
          progress_percent: number
          responsible_user_id: string
          status: string
          title: string
        }[]
      }
      get_my_proposal_snapshot: {
        Args: { p_estimate_id: number }
        Returns: Json
      }
      get_my_tasks: {
        Args: { p_organization_id?: string }
        Returns: {
          assigned_to: string
          completed_at: string
          created_at: string
          description: string
          due_at: string
          id: string
          organization_id: string
          priority: string
          project_id: string
          stage: string
          status: string
          title: string
          updated_at: string
        }[]
      }
      get_my_work_rates_v2: {
        Args: never
        Returns: {
          commercial_rate: number
          confidence: string
          formula_text: string
          operation_id: string
          operation_name: string
          parameters: Json
          pricing_method: string
          section: string
          unit: string
        }[]
      }
      is_professional_actor: { Args: { p_user_id: string }; Returns: boolean }
      list_bom_defaults_for_actor: {
        Args: { p_actor_user_id: string; p_organization_id?: string }
        Returns: {
          article: string
          brand: string
          catalog_item_id: string
          catalog_unit: string
          currency: string
          current_price: number
          need_code: string
          need_per_catalog_unit: number
          organization_id: string
          product_name: string
          round_mode: string
          source_sheet: string
          updated_at: string
        }[]
      }
      list_estimates_for_actor: {
        Args: { p_actor_user_id: string; p_project_id?: string }
        Returns: {
          equipment_total: number
          grand_total: number
          id: number
          labor_total: number
          mat_total: number
          project_id: string
          status: string
          title: string
          updated_at: string
          version: number
        }[]
      }
      list_my_estimates: {
        Args: { p_project_id?: string }
        Returns: {
          equipment_total: number
          grand_total: number
          id: number
          labor_total: number
          mat_total: number
          project_id: string
          status: string
          title: string
          updated_at: string
          version: number
        }[]
      }
      normalize_phone: { Args: { p_phone: string }; Returns: string }
      platform_context_for_user: { Args: { p_user_id: string }; Returns: Json }
      preliminary_benchmark_quote_v1: {
        Args: { p_area_m2: number; p_systems: string[] }
        Returns: Json
      }
      proposal_snapshot_for_actor: {
        Args: { p_actor_user_id: string; p_estimate_id: number }
        Returns: Json
      }
      recalc_estimate_totals_v2: {
        Args: { p_estimate_id: number }
        Returns: undefined
      }
      remove_bom_default_for_actor: {
        Args: {
          p_actor_user_id: string
          p_need_code: string
          p_organization_id: string
        }
        Returns: Json
      }
      remove_estimate_item_for_actor: {
        Args: { p_actor_user_id: string; p_item_line_id: number }
        Returns: Json
      }
      remove_my_estimate_item: {
        Args: { p_item_line_id: number }
        Returns: Json
      }
      rpc_estimate_to_order: {
        Args: { p_address?: string; p_delivery?: string; p_estimate_id: number }
        Returns: number
      }
      save_labor_quote_v2_for_actor: {
        Args: {
          p_actor_user_id: string
          p_lines: Json
          p_project_id: string
          p_title?: string
        }
        Returns: Json
      }
      save_my_labor_quote_v2: {
        Args: { p_lines: Json; p_project_id: string; p_title?: string }
        Returns: Json
      }
      search_catalog_v2_for_actor: {
        Args: {
          p_actor_user_id: string
          p_brand?: string
          p_calc_only?: boolean
          p_category?: string
          p_limit?: number
          p_query?: string
        }
        Returns: {
          article: string
          brand: string
          calc_eligible: boolean
          category: string
          currency: string
          current_price: number
          item_id: string
          name: string
          pack_qty: number
          pack_unit: string
          size: string
          source_sheet: string
          unit: string
        }[]
      }
      search_my_catalog_v2: {
        Args: {
          p_brand?: string
          p_calc_only?: boolean
          p_category?: string
          p_limit?: number
          p_query?: string
        }
        Returns: {
          article: string
          brand: string
          calc_eligible: boolean
          category: string
          currency: string
          current_price: number
          item_id: string
          name: string
          pack_qty: number
          pack_unit: string
          size: string
          source_sheet: string
          unit: string
        }[]
      }
      set_bom_default_for_actor: {
        Args: {
          p_actor_user_id: string
          p_catalog_item_id: string
          p_need_code: string
          p_need_per_catalog_unit?: number
          p_organization_id: string
          p_round_mode?: string
        }
        Returns: Json
      }
      set_my_task_status: {
        Args: { p_status: string; p_task_id: string }
        Returns: Json
      }
      stage_exact_catalog_payload: {
        Args: { p_data: string; p_key: string }
        Returns: Json
      }
      update_catalog_estimate_item_for_actor: {
        Args: { p_actor_user_id: string; p_item_line_id: number; p_qty: number }
        Returns: Json
      }
      update_my_catalog_estimate_item: {
        Args: { p_item_line_id: number; p_qty: number }
        Returns: Json
      }
      user_has_org_access: {
        Args: { p_organization_id: string }
        Returns: boolean
      }
      user_has_project_access: {
        Args: { p_project_id: string }
        Returns: boolean
      }
      user_is_org_member_for_project: {
        Args: { p_project_id: string }
        Returns: boolean
      }
      work_rates_v2_for_actor: {
        Args: { p_actor_user_id: string }
        Returns: {
          commercial_rate: number
          confidence: string
          formula_text: string
          operation_id: string
          operation_name: string
          parameters: Json
          pricing_method: string
          section: string
          unit: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const


