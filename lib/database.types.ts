export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          user_id: string
          is_public: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          user_id: string
          is_public?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          user_id?: string
          is_public?: boolean
        }
      }
      photos: {
        Row: {
          id: string
          created_at: string
          event_id: string
          storage_path: string
          taken_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          event_id: string
          storage_path: string
          taken_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          event_id?: string
          storage_path?: string
          taken_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

