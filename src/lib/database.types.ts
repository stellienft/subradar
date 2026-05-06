export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          gmail_connected: boolean
          last_scan_at: string | null
          subscription_tier: 'free' | 'premium'
          subscription_status: 'active' | 'past_due' | 'canceled' | 'trialing'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_started_at: string | null
          subscription_ends_at: string | null
          max_accounts_allowed: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          gmail_connected?: boolean
          last_scan_at?: string | null
          subscription_tier?: 'free' | 'premium'
          subscription_status?: 'active' | 'past_due' | 'canceled' | 'trialing'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_started_at?: string | null
          subscription_ends_at?: string | null
          max_accounts_allowed?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          gmail_connected?: boolean
          last_scan_at?: string | null
          subscription_tier?: 'free' | 'premium'
          subscription_status?: 'active' | 'past_due' | 'canceled' | 'trialing'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_started_at?: string | null
          subscription_ends_at?: string | null
          max_accounts_allowed?: number
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          linked_account_id: string | null
          name: string
          domain: string | null
          category: string
          custom_category: string | null
          notes: string | null
          reminder_days_before: number
          amount: number
          currency: string
          billing_cycle: string
          next_payment_date: string | null
          status: string
          trial_ends_at: string | null
          first_detected_at: string
          last_cancelled_check_at: string | null
          email_address: string | null
          cancellation_url: string | null
          is_demo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          linked_account_id?: string | null
          name: string
          domain?: string | null
          category?: string
          custom_category?: string | null
          notes?: string | null
          reminder_days_before?: number
          amount: number
          currency?: string
          billing_cycle?: string
          next_payment_date?: string | null
          status?: string
          trial_ends_at?: string | null
          first_detected_at?: string
          last_cancelled_check_at?: string | null
          email_address?: string | null
          cancellation_url?: string | null
          is_demo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          linked_account_id?: string | null
          name?: string
          domain?: string | null
          category?: string
          custom_category?: string | null
          notes?: string | null
          reminder_days_before?: number
          amount?: number
          currency?: string
          billing_cycle?: string
          next_payment_date?: string | null
          status?: string
          trial_ends_at?: string | null
          first_detected_at?: string
          last_cancelled_check_at?: string | null
          email_address?: string | null
          cancellation_url?: string | null
          is_demo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payment_history: {
        Row: {
          id: string
          subscription_id: string
          amount: number
          currency: string
          payment_date: string
          email_message_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          subscription_id: string
          amount: number
          currency?: string
          payment_date: string
          email_message_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          subscription_id?: string
          amount?: number
          currency?: string
          payment_date?: string
          email_message_id?: string | null
          created_at?: string
        }
      }
      linked_accounts: {
        Row: {
          id: string
          user_id: string
          email_provider: string
          email_address: string
          access_token_encrypted: string | null
          refresh_token_encrypted: string | null
          is_primary: boolean
          last_scan_at: string | null
          connected_at: string
          status: 'connected' | 'expired' | 'scanning' | 'error'
          subscription_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_provider: string
          email_address: string
          access_token_encrypted?: string | null
          refresh_token_encrypted?: string | null
          is_primary?: boolean
          last_scan_at?: string | null
          connected_at?: string
          status?: 'connected' | 'expired' | 'scanning' | 'error'
          subscription_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_provider?: string
          email_address?: string
          access_token_encrypted?: string | null
          refresh_token_encrypted?: string | null
          is_primary?: boolean
          last_scan_at?: string | null
          connected_at?: string
          status?: 'connected' | 'expired' | 'scanning' | 'error'
          subscription_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          email_notifications: boolean
          weekly_reports_enabled: boolean
          payment_reminders: boolean
          currency_preference: string
          theme_preference: 'light' | 'dark' | 'system'
          notifications_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          email_notifications?: boolean
          weekly_reports_enabled?: boolean
          payment_reminders?: boolean
          currency_preference?: string
          theme_preference?: 'light' | 'dark' | 'system'
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          email_notifications?: boolean
          weekly_reports_enabled?: boolean
          payment_reminders?: boolean
          currency_preference?: string
          theme_preference?: 'light' | 'dark' | 'system'
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
