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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      courses: {
        Row: {
          category: string | null
          created_at: string
          duration: string | null
          id: string
          is_active: boolean | null
          is_free: boolean | null
          lessons: number | null
          provider: string | null
          rating: number | null
          reviews_count: number | null
          skills_covered: string[] | null
          title: string
          url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          lessons?: number | null
          provider?: string | null
          rating?: number | null
          reviews_count?: number | null
          skills_covered?: string[] | null
          title: string
          url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          lessons?: number | null
          provider?: string | null
          rating?: number | null
          reviews_count?: number | null
          skills_covered?: string[] | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          likes_count: number | null
          replies_count: number | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          replies_count?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          replies_count?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          likes_count: number | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes_count?: number | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          accessibility_tags: string[] | null
          company: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          job_type: string | null
          location: string | null
          salary_range: string | null
          skills_required: string[] | null
          title: string
        }
        Insert: {
          accessibility_tags?: string[] | null
          company: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          job_type?: string | null
          location?: string | null
          salary_range?: string | null
          skills_required?: string[] | null
          title: string
        }
        Update: {
          accessibility_tags?: string[] | null
          company?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          job_type?: string | null
          location?: string | null
          salary_range?: string | null
          skills_required?: string[] | null
          title?: string
        }
        Relationships: []
      }
      mentor_profiles: {
        Row: {
          availability: string | null
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          expertise: string[] | null
          id: string
          is_active: boolean | null
          name: string
          rating: number | null
          role: string | null
          sessions_count: number | null
          user_id: string
        }
        Insert: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          expertise?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          rating?: number | null
          role?: string | null
          sessions_count?: number | null
          user_id: string
        }
        Update: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          expertise?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          rating?: number | null
          role?: string | null
          sessions_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      mentor_requests: {
        Row: {
          career_goal: string | null
          created_at: string
          id: string
          mentee_id: string
          mentor_id: string
          message: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          career_goal?: string | null
          created_at?: string
          id?: string
          mentee_id: string
          mentor_id: string
          message?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          career_goal?: string | null
          created_at?: string
          id?: string
          mentee_id?: string
          mentor_id?: string
          message?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_requests_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          assistive_tech: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          disability_certificate_url: string | null
          disability_percentage: number | null
          disability_type: string | null
          education_level: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          gender: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          income: number | null
          languages: string[] | null
          linkedin_url: string | null
          marital_status: string | null
          phone: string | null
          pincode: string | null
          preferred_job_type: string | null
          preferred_locations: string[] | null
          resume_url: string | null
          skills: string[] | null
          state: string | null
          udid_number: string | null
          updated_at: string
          user_id: string
          work_experience_years: number | null
        }
        Insert: {
          age?: number | null
          assistive_tech?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          disability_certificate_url?: string | null
          disability_percentage?: number | null
          disability_type?: string | null
          education_level?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          income?: number | null
          languages?: string[] | null
          linkedin_url?: string | null
          marital_status?: string | null
          phone?: string | null
          pincode?: string | null
          preferred_job_type?: string | null
          preferred_locations?: string[] | null
          resume_url?: string | null
          skills?: string[] | null
          state?: string | null
          udid_number?: string | null
          updated_at?: string
          user_id: string
          work_experience_years?: number | null
        }
        Update: {
          age?: number | null
          assistive_tech?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          disability_certificate_url?: string | null
          disability_percentage?: number | null
          disability_type?: string | null
          education_level?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          income?: number | null
          languages?: string[] | null
          linkedin_url?: string | null
          marital_status?: string | null
          phone?: string | null
          pincode?: string | null
          preferred_job_type?: string | null
          preferred_locations?: string[] | null
          resume_url?: string | null
          skills?: string[] | null
          state?: string | null
          udid_number?: string | null
          updated_at?: string
          user_id?: string
          work_experience_years?: number | null
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      schemes: {
        Row: {
          benefits: string | null
          category: string | null
          created_at: string
          deadline: string | null
          description: string | null
          disability_types: string[] | null
          education_required: string | null
          eligibility_criteria: Json | null
          id: string
          is_active: boolean | null
          max_income: number | null
          ministry: string | null
          name: string
        }
        Insert: {
          benefits?: string | null
          category?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          disability_types?: string[] | null
          education_required?: string | null
          eligibility_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          max_income?: number | null
          ministry?: string | null
          name: string
        }
        Update: {
          benefits?: string | null
          category?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          disability_types?: string[] | null
          education_required?: string | null
          eligibility_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          max_income?: number | null
          ministry?: string | null
          name?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          description: string | null
          earned_at: string
          icon: string | null
          id: string
          points: number | null
          user_id: string
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          points?: number | null
          user_id: string
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          points?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          created_at: string
          id: string
          last_activity: string | null
          level: number | null
          streak_days: number | null
          total_points: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_activity?: string | null
          level?: number | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_activity?: string | null
          level?: number | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
