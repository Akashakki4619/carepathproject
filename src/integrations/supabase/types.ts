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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ambulance_coordination: {
        Row: {
          coordination_type: string
          created_at: string | null
          id: string
          notes: string | null
          primary_ambulance_id: string
          status: string | null
          supporting_ambulance_ids: string[] | null
          updated_at: string | null
        }
        Insert: {
          coordination_type: string
          created_at?: string | null
          id?: string
          notes?: string | null
          primary_ambulance_id: string
          status?: string | null
          supporting_ambulance_ids?: string[] | null
          updated_at?: string | null
        }
        Update: {
          coordination_type?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          primary_ambulance_id?: string
          status?: string | null
          supporting_ambulance_ids?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      arrival_notifications: {
        Row: {
          actual_arrival: string | null
          ambulance_id: string
          created_at: string | null
          estimated_arrival: string
          hospital_id: string
          id: string
          notification_sent_at: string | null
          notification_status: string | null
          trip_id: string
        }
        Insert: {
          actual_arrival?: string | null
          ambulance_id: string
          created_at?: string | null
          estimated_arrival: string
          hospital_id: string
          id?: string
          notification_sent_at?: string | null
          notification_status?: string | null
          trip_id: string
        }
        Update: {
          actual_arrival?: string | null
          ambulance_id?: string
          created_at?: string | null
          estimated_arrival?: string
          hospital_id?: string
          id?: string
          notification_sent_at?: string | null
          notification_status?: string | null
          trip_id?: string
        }
        Relationships: []
      }
      broadcasts: {
        Row: {
          broadcast_type: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          message: string
          sender_id: string
          target_audience: string[] | null
          title: string
        }
        Insert: {
          broadcast_type: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          sender_id: string
          target_audience?: string[] | null
          title: string
        }
        Update: {
          broadcast_type?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          sender_id?: string
          target_audience?: string[] | null
          title?: string
        }
        Relationships: []
      }
      capacity_trends: {
        Row: {
          avg_wait_time_minutes: number | null
          created_at: string | null
          date: string
          hospital_id: string
          hour_of_day: number | null
          id: string
          incoming_ambulances: number | null
          occupied_beds: number
          total_capacity: number
        }
        Insert: {
          avg_wait_time_minutes?: number | null
          created_at?: string | null
          date: string
          hospital_id: string
          hour_of_day?: number | null
          id?: string
          incoming_ambulances?: number | null
          occupied_beds: number
          total_capacity: number
        }
        Update: {
          avg_wait_time_minutes?: number | null
          created_at?: string | null
          date?: string
          hospital_id?: string
          hour_of_day?: number | null
          id?: string
          incoming_ambulances?: number | null
          occupied_beds?: number
          total_capacity?: number
        }
        Relationships: []
      }
      driver_shifts: {
        Row: {
          ambulance_id: string | null
          break_times: Json | null
          created_at: string | null
          driver_id: string
          id: string
          notes: string | null
          shift_end: string
          shift_start: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          ambulance_id?: string | null
          break_times?: Json | null
          created_at?: string | null
          driver_id: string
          id?: string
          notes?: string | null
          shift_end: string
          shift_start: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          ambulance_id?: string | null
          break_times?: Json | null
          created_at?: string | null
          driver_id?: string
          id?: string
          notes?: string | null
          shift_end?: string
          shift_start?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          patient_id: string | null
          phone_number: string
          relationship: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          patient_id?: string | null
          phone_number: string
          relationship: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          patient_id?: string | null
          phone_number?: string
          relationship?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_staff_management: {
        Row: {
          availability_status: string | null
          certifications: string[] | null
          created_at: string | null
          department: string
          hospital_id: string
          id: string
          last_activity: string | null
          position: string
          shift_pattern: string | null
          staff_id: string
          updated_at: string | null
        }
        Insert: {
          availability_status?: string | null
          certifications?: string[] | null
          created_at?: string | null
          department: string
          hospital_id: string
          id?: string
          last_activity?: string | null
          position: string
          shift_pattern?: string | null
          staff_id: string
          updated_at?: string | null
        }
        Update: {
          availability_status?: string | null
          certifications?: string[] | null
          created_at?: string | null
          department?: string
          hospital_id?: string
          id?: string
          last_activity?: string | null
          position?: string
          shift_pattern?: string | null
          staff_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      medical_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          description: string
          id: string
          is_active: boolean | null
          patient_id: string | null
          severity: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          patient_id?: string | null
          severity: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          patient_id?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_history: {
        Row: {
          allergies: string[] | null
          condition_name: string
          created_at: string | null
          diagnosed_date: string | null
          id: string
          is_active: boolean | null
          medications: string[] | null
          notes: string | null
          patient_id: string | null
          updated_at: string | null
        }
        Insert: {
          allergies?: string[] | null
          condition_name: string
          created_at?: string | null
          diagnosed_date?: string | null
          id?: string
          is_active?: boolean | null
          medications?: string[] | null
          notes?: string | null
          patient_id?: string | null
          updated_at?: string | null
        }
        Update: {
          allergies?: string[] | null
          condition_name?: string
          created_at?: string | null
          diagnosed_date?: string | null
          id?: string
          is_active?: boolean | null
          medications?: string[] | null
          notes?: string | null
          patient_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          ambulance_id: string | null
          created_at: string | null
          hospital_id: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          recipient_id: string
          recipient_type: string
          title: string
          trip_id: string | null
        }
        Insert: {
          ambulance_id?: string | null
          created_at?: string | null
          hospital_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          recipient_id: string
          recipient_type: string
          title: string
          trip_id?: string | null
        }
        Update: {
          ambulance_id?: string | null
          created_at?: string | null
          hospital_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          recipient_id?: string
          recipient_type?: string
          title?: string
          trip_id?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          blood_type: string | null
          created_at: string | null
          date_of_birth: string
          first_name: string
          gender: string | null
          id: string
          insurance_number: string | null
          last_name: string
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          blood_type?: string | null
          created_at?: string | null
          date_of_birth: string
          first_name: string
          gender?: string | null
          id?: string
          insurance_number?: string | null
          last_name: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          blood_type?: string | null
          created_at?: string | null
          date_of_birth?: string
          first_name?: string
          gender?: string | null
          id?: string
          insurance_number?: string | null
          last_name?: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          actions: string[]
          created_at: string | null
          id: string
          resource: string
          role: string
        }
        Insert: {
          actions: string[]
          created_at?: string | null
          id?: string
          resource: string
          role: string
        }
        Update: {
          actions?: string[]
          created_at?: string | null
          id?: string
          resource?: string
          role?: string
        }
        Relationships: []
      }
      qos_analytics: {
        Row: {
          avg_latency_ms: number | null
          avg_throughput_kbps: number | null
          created_at: string
          dropped_packets: number
          id: string
          packet_loss_rate: number
          priority_level: string
          successful_packets: number
          timestamp: string
          total_packets: number
        }
        Insert: {
          avg_latency_ms?: number | null
          avg_throughput_kbps?: number | null
          created_at?: string
          dropped_packets?: number
          id?: string
          packet_loss_rate?: number
          priority_level: string
          successful_packets?: number
          timestamp?: string
          total_packets?: number
        }
        Update: {
          avg_latency_ms?: number | null
          avg_throughput_kbps?: number | null
          created_at?: string
          dropped_packets?: number
          id?: string
          packet_loss_rate?: number
          priority_level?: string
          successful_packets?: number
          timestamp?: string
          total_packets?: number
        }
        Relationships: []
      }
      qos_link_metrics: {
        Row: {
          capacity_kbps: number
          current_utilization: number
          id: string
          is_active: boolean
          jitter_ms: number
          last_updated: string
          link_id: string
          packet_loss_rate: number
          receiver_location: Json | null
          sender_location: Json
        }
        Insert: {
          capacity_kbps?: number
          current_utilization?: number
          id?: string
          is_active?: boolean
          jitter_ms?: number
          last_updated?: string
          link_id: string
          packet_loss_rate?: number
          receiver_location?: Json | null
          sender_location: Json
        }
        Update: {
          capacity_kbps?: number
          current_utilization?: number
          id?: string
          is_active?: boolean
          jitter_ms?: number
          last_updated?: string
          link_id?: string
          packet_loss_rate?: number
          receiver_location?: Json | null
          sender_location?: Json
        }
        Relationships: []
      }
      qos_transmissions: {
        Row: {
          ack_received: string | null
          created_at: string
          id: string
          latency_ms: number | null
          max_retries: number
          packet_id: string
          packet_type: string
          payload: Json
          priority: string
          queue_time: string
          receiver_id: string | null
          retry_count: number
          sender_id: string
          status: string
          transmission_end: string | null
          transmission_start: string | null
        }
        Insert: {
          ack_received?: string | null
          created_at?: string
          id?: string
          latency_ms?: number | null
          max_retries?: number
          packet_id?: string
          packet_type: string
          payload: Json
          priority: string
          queue_time?: string
          receiver_id?: string | null
          retry_count?: number
          sender_id: string
          status?: string
          transmission_end?: string | null
          transmission_start?: string | null
        }
        Update: {
          ack_received?: string | null
          created_at?: string
          id?: string
          latency_ms?: number | null
          max_retries?: number
          packet_id?: string
          packet_type?: string
          payload?: Json
          priority?: string
          queue_time?: string
          receiver_id?: string | null
          retry_count?: number
          sender_id?: string
          status?: string
          transmission_end?: string | null
          transmission_start?: string | null
        }
        Relationships: []
      }
      response_analytics: {
        Row: {
          ambulance_id: string
          arrival_time: string | null
          completion_time: string | null
          created_at: string | null
          dispatch_time: string
          distance_km: number | null
          efficiency_score: number | null
          hospital_id: string
          id: string
          patient_outcome: string | null
          response_time_minutes: number | null
          trip_id: string
        }
        Insert: {
          ambulance_id: string
          arrival_time?: string | null
          completion_time?: string | null
          created_at?: string | null
          dispatch_time: string
          distance_km?: number | null
          efficiency_score?: number | null
          hospital_id: string
          id?: string
          patient_outcome?: string | null
          response_time_minutes?: number | null
          trip_id: string
        }
        Update: {
          ambulance_id?: string
          arrival_time?: string | null
          completion_time?: string | null
          created_at?: string | null
          dispatch_time?: string
          distance_km?: number | null
          efficiency_score?: number | null
          hospital_id?: string
          id?: string
          patient_outcome?: string | null
          response_time_minutes?: number | null
          trip_id?: string
        }
        Relationships: []
      }
      route_efficiency: {
        Row: {
          actual_time_minutes: number | null
          created_at: string | null
          date_recorded: string | null
          distance_km: number
          efficiency_rating: number | null
          end_location: Json
          estimated_time_minutes: number
          id: string
          route_id: string
          start_location: Json
          traffic_conditions: string[] | null
        }
        Insert: {
          actual_time_minutes?: number | null
          created_at?: string | null
          date_recorded?: string | null
          distance_km: number
          efficiency_rating?: number | null
          end_location: Json
          estimated_time_minutes: number
          id?: string
          route_id: string
          start_location: Json
          traffic_conditions?: string[] | null
        }
        Update: {
          actual_time_minutes?: number | null
          created_at?: string | null
          date_recorded?: string | null
          distance_km?: number
          efficiency_rating?: number | null
          end_location?: Json
          estimated_time_minutes?: number
          id?: string
          route_id?: string
          start_location?: Json
          traffic_conditions?: string[] | null
        }
        Relationships: []
      }
      status_messages: {
        Row: {
          created_at: string | null
          id: string
          location: Json | null
          message: string
          sender_id: string
          status_type: string
          trip_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          location?: Json | null
          message: string
          sender_id: string
          status_type: string
          trip_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: Json | null
          message?: string
          sender_id?: string
          status_type?: string
          trip_id?: string | null
        }
        Relationships: []
      }
      traffic_data: {
        Row: {
          average_speed_kmh: number | null
          coordinates: Json
          delay_minutes: number | null
          id: string
          incident_type: string | null
          is_active: boolean | null
          last_updated: string | null
          road_segment_id: string
          traffic_level: string
        }
        Insert: {
          average_speed_kmh?: number | null
          coordinates: Json
          delay_minutes?: number | null
          id?: string
          incident_type?: string | null
          is_active?: boolean | null
          last_updated?: string | null
          road_segment_id: string
          traffic_level: string
        }
        Update: {
          average_speed_kmh?: number | null
          coordinates?: Json
          delay_minutes?: number | null
          id?: string
          incident_type?: string | null
          is_active?: boolean | null
          last_updated?: string | null
          road_segment_id?: string
          traffic_level?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          emergency_contact: string | null
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          license_number: string | null
          phone_number: string | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          emergency_contact?: string | null
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          license_number?: string | null
          phone_number?: string | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          emergency_contact?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          license_number?: string | null
          phone_number?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
