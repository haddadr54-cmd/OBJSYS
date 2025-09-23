-- Migration: create permission categories and user permission overrides
-- Created by automated assistant on 2025-09-22

create table if not exists permission_categories (
  id text primary key,
  name text not null,
  description text,
  icon text,
  color text,
  permissions jsonb not null default '[]'::jsonb,
  is_custom boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists user_permission_overrides (
  user_id uuid primary key,
  overrides jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- Insert default categories if not exists
insert into permission_categories (id, name, description, icon, color, permissions, is_custom)
select 'admin', 'Administrador', 'Acesso total ao sistema', '👑', 'purple', jsonb_build_array(
  'users_view','users_create','users_edit','users_delete',
  'students_view','students_create','students_edit','students_delete',
  'classes_view','classes_create','classes_edit','classes_delete',
  'subjects_view','subjects_create','subjects_edit','subjects_delete',
  'grades_view','grades_create','grades_edit','grades_delete',
  'attendance_view','attendance_create','attendance_edit','attendance_delete',
  'materials_view','materials_create','materials_edit','materials_delete',
  'messages_view','messages_create','messages_edit','messages_delete',
  'reports_view','reports_create','reports_edit','reports_delete',
  'settings_view','settings_create','settings_edit','settings_delete',
  'audit_view','audit_create','audit_edit','audit_delete'
)::jsonb, false
where not exists (select 1 from permission_categories where id = 'admin');

insert into permission_categories (id, name, description, icon, color, permissions, is_custom)
select 'professor', 'Professor', 'Acesso às suas turmas e alunos', '👨‍🏫', 'green', jsonb_build_array(
  'students_view','classes_view','subjects_view',
  'grades_view','grades_create','grades_edit',
  'attendance_view','attendance_create','attendance_edit',
  'materials_view','materials_create','materials_edit',
  'messages_view','messages_create','messages_edit'
)::jsonb, false
where not exists (select 1 from permission_categories where id = 'professor');

insert into permission_categories (id, name, description, icon, color, permissions, is_custom)
select 'pai', 'Pai/Responsável', 'Acesso limitado aos dados dos filhos', '👨‍👩‍👧‍👦', 'blue', jsonb_build_array(
  'students_view','classes_view','subjects_view','grades_view','attendance_view','materials_view','messages_view'
)::jsonb, false
where not exists (select 1 from permission_categories where id = 'pai');
