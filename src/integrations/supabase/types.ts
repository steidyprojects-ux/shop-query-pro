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
      codigos_asesor: {
        Row: {
          cc_completa: string | null
          codigo: string
          gv_division: string | null
          id: number
          nombre: string | null
          regional: string
          tipo: string
        }
        Insert: {
          cc_completa?: string | null
          codigo: string
          gv_division?: string | null
          id?: number
          nombre?: string | null
          regional: string
          tipo: string
        }
        Update: {
          cc_completa?: string | null
          codigo?: string
          gv_division?: string | null
          id?: number
          nombre?: string | null
          regional?: string
          tipo?: string
        }
        Relationships: []
      }
      distritos_calle: {
        Row: {
          distrito: string
          id: number
          region: string | null
          regional: string | null
          zona: string | null
        }
        Insert: {
          distrito: string
          id?: number
          region?: string | null
          regional?: string | null
          zona?: string | null
        }
        Update: {
          distrito?: string
          id?: number
          region?: string | null
          regional?: string | null
          zona?: string | null
        }
        Relationships: []
      }
      mobility_records: {
        Row: {
          cedula: string
          cedula_asesor: string | null
          ciudad: string
          created_at: string
          created_by: string | null
          direccion: string | null
          estado: string
          id: string
          nodo: string | null
          observaciones: string | null
          primer_apellido: string | null
          tipo_red: string | null
          updated_at: string
        }
        Insert: {
          cedula: string
          cedula_asesor?: string | null
          ciudad: string
          created_at?: string
          created_by?: string | null
          direccion?: string | null
          estado: string
          id?: string
          nodo?: string | null
          observaciones?: string | null
          primer_apellido?: string | null
          tipo_red?: string | null
          updated_at?: string
        }
        Update: {
          cedula?: string
          cedula_asesor?: string | null
          ciudad?: string
          created_at?: string
          created_by?: string | null
          direccion?: string | null
          estado?: string
          id?: string
          nodo?: string | null
          observaciones?: string | null
          primer_apellido?: string | null
          tipo_red?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      nodos: {
        Row: {
          area: string | null
          comunidad: string | null
          departamento: string | null
          distrito: string | null
          estado_nodo: string | null
          id: number
          id_nodo: string
          nombre_comunidad: string | null
          nombre_nodo: string | null
          red_por_nodo: string | null
          red_predominante: string | null
          region: string | null
          regional: string | null
        }
        Insert: {
          area?: string | null
          comunidad?: string | null
          departamento?: string | null
          distrito?: string | null
          estado_nodo?: string | null
          id?: number
          id_nodo: string
          nombre_comunidad?: string | null
          nombre_nodo?: string | null
          red_por_nodo?: string | null
          red_predominante?: string | null
          region?: string | null
          regional?: string | null
        }
        Update: {
          area?: string | null
          comunidad?: string | null
          departamento?: string | null
          distrito?: string | null
          estado_nodo?: string | null
          id?: number
          id_nodo?: string
          nombre_comunidad?: string | null
          nombre_nodo?: string | null
          red_por_nodo?: string | null
          red_predominante?: string | null
          region?: string | null
          regional?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activo: boolean
          cedula: string | null
          created_at: string
          distrito: string | null
          email: string
          full_name: string | null
          id: string
        }
        Insert: {
          activo?: boolean
          cedula?: string | null
          created_at?: string
          distrito?: string | null
          email: string
          full_name?: string | null
          id: string
        }
        Update: {
          activo?: boolean
          cedula?: string | null
          created_at?: string
          distrito?: string | null
          email?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      tarifas: {
        Row: {
          accesos: string | null
          campana: string | null
          categoria: string
          codigo_ftth: string | null
          codigo_hfc: string | null
          created_at: string
          decodificadores: string | null
          id: string
          instalacion: string | null
          orden: number
          ott: string | null
          renta: number
          servicio: string
          updated_at: string
          vigencia: string | null
        }
        Insert: {
          accesos?: string | null
          campana?: string | null
          categoria: string
          codigo_ftth?: string | null
          codigo_hfc?: string | null
          created_at?: string
          decodificadores?: string | null
          id?: string
          instalacion?: string | null
          orden?: number
          ott?: string | null
          renta: number
          servicio: string
          updated_at?: string
          vigencia?: string | null
        }
        Update: {
          accesos?: string | null
          campana?: string | null
          categoria?: string
          codigo_ftth?: string | null
          codigo_hfc?: string | null
          created_at?: string
          decodificadores?: string | null
          id?: string
          instalacion?: string | null
          orden?: number
          ott?: string | null
          renta?: number
          servicio?: string
          updated_at?: string
          vigencia?: string | null
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
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      ventas_siap: {
        Row: {
          cedula_cliente: string
          cedula_vendedor: string
          ciudad: string | null
          created_at: string
          created_by: string
          cuenta: string | null
          empresa: string | null
          id: string
          nombre_cliente: string
          observaciones: string | null
          orden_trabajo: string | null
          telefono: string | null
          tipo_acceso: string | null
          updated_at: string
        }
        Insert: {
          cedula_cliente: string
          cedula_vendedor: string
          ciudad?: string | null
          created_at?: string
          created_by: string
          cuenta?: string | null
          empresa?: string | null
          id?: string
          nombre_cliente: string
          observaciones?: string | null
          orden_trabajo?: string | null
          telefono?: string | null
          tipo_acceso?: string | null
          updated_at?: string
        }
        Update: {
          cedula_cliente?: string
          cedula_vendedor?: string
          ciudad?: string | null
          created_at?: string
          created_by?: string
          cuenta?: string | null
          empresa?: string | null
          id?: string
          nombre_cliente?: string
          observaciones?: string | null
          orden_trabajo?: string | null
          telefono?: string | null
          tipo_acceso?: string | null
          updated_at?: string
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
      app_role: "admin" | "consultor"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "consultor"],
    },
  },
} as const
