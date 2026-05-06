export interface Template {
  template_id: number;
  name: string;
  content_type_id: number | null;
  orientation: 'vertical' | 'horizontal';
  width: number;
  height: number;
  preview_url: string | null;
  is_active: boolean;
  content_type_name?: string;
  categories?: Category[];
}

export interface Category {
  category_id: number;
  name: string;
}

export interface ContentType {
  content_type_id: number;
  name: string;
}

export interface Project {
  project_id: number;
  user_id: number;
  name: string;
  template_id: number | null;
  orientation: 'vertical' | 'horizontal' | null;
  background_id: number | null;
  background_color: string | null;
  status: string;
  updated_at: string;
  template_name?: string;
  background_url?: string;
  objects?: ProjectObject[];
  texts?: ProjectText[];
}

export interface ProjectObject {
  po_id: number;
  project_id: number;
  object_id: number | null;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  rotation_angle: number;
  z_index: number;
  opacity: number;
  object_url?: string;
  object_name?: string;
}

export interface ProjectText {
  pt_id: number;
  project_id: number;
  content: string;
  font_id: number | null;
  font_size: number;
  font_color: string;
  is_bold: boolean;
  is_italic: boolean;
  pos_x: number;
  pos_y: number;
  rotation_angle: number;
  z_index: number;
  font_name?: string;
  font_url?: string;
}

export interface AppObject {
  object_id: number;
  name: string | null;
  file_url: string;
  is_public: boolean;
  created_by: number | null;
}

export interface Background {
  background_id: number;
  file_url: string;
  is_public: boolean;
  created_by: number | null;
}

export interface Font {
  font_id: number;
  name: string;
  file_url: string;
}

export interface Recipient {
  recipient_id: number;
  user_id: number;
  full_name: string;
  email: string;
  company_name: string | null;
}

export interface RecipientGroup {
  group_id: number;
  user_id: number;
  name: string;
  members?: Recipient[];
}

export interface Export {
  export_id: number;
  project_id: number;
  format: 'png' | 'jpg' | 'jpeg';
  file_url: string;
  created_at: string;
}

export interface User {
  user_id: number;
  email: string;
  password_hash: string;
  full_name: string | null;
  position: string | null;
  department: string | null;
  signature_url: string | null;
  created_at: string;
}
