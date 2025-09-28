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
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      courts: {
        Row: {
          id: string
          name: string
          type: 'cricket' | 'basketball' | 'tennis' | 'badminton' | 'football'
          description: string | null
          images: Json | null
          amenities: Json | null
          is_active: boolean
          maintenance_mode: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'cricket' | 'basketball' | 'tennis' | 'badminton' | 'football'
          description?: string | null
          images?: Json | null
          amenities?: Json | null
          is_active?: boolean
          maintenance_mode?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'cricket' | 'basketball' | 'tennis' | 'badminton' | 'football'
          description?: string | null
          images?: Json | null
          amenities?: Json | null
          is_active?: boolean
          maintenance_mode?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pricing_rules: {
        Row: {
          id: string
          court_id: string
          duration_hours: number
          price: number
          is_peak_hour: boolean
          day_of_week: number | null
          start_time: string | null
          end_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          court_id: string
          duration_hours: number
          price: number
          is_peak_hour?: boolean
          day_of_week?: number | null
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          court_id?: string
          duration_hours?: number
          price?: number
          is_peak_hour?: boolean
          day_of_week?: number | null
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          court_id: string
          booking_date: string
          start_time: string
          duration_hours: number
          total_price: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          court_id: string
          booking_date: string
          start_time: string
          duration_hours: number
          total_price: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          court_id?: string
          booking_date?: string
          start_time?: string
          duration_hours?: number
          total_price?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          created_at?: string
          updated_at?: string
        }
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          message: string
          status: 'new' | 'read' | 'responded'
          admin_response: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          message: string
          status?: 'new' | 'read' | 'responded'
          admin_response?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          message?: string
          status?: 'new' | 'read' | 'responded'
          admin_response?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      blocked_slots: {
        Row: {
          id: string
          court_id: string
          blocked_date: string
          start_time: string
          end_time: string
          reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          court_id: string
          blocked_date: string
          start_time: string
          end_time: string
          reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          court_id?: string
          blocked_date?: string
          start_time?: string
          end_time?: string
          reason?: string | null
          created_at?: string
          updated_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
