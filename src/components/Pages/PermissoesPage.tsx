import { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  Check,
  Filter,
  Search,
  GraduationCap,
  BookOpen,
  FileText,
  ClipboardList,
  MessageSquare,
  MessageCircle,
  BarChart3,
  Database,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { useDataService } from '../../lib/dataService';

interface Permission {
  id: string;
  module: string;
  action: 'view' | 'create' | 'edit' | 'delete';
  label: string;
  description: string;
}

interface UserCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  permissions: string[];
  isCustom: boolean;
  userCount: number;
}

interface UserPermissionOverride {
  userId: string;
  categoryId: string;
  overrides: string[];
}

const availablePermissions: Permission[] = [
  // Usuários
  { id: 'users_view', module: 'Usuários', action: 'view', label: 'Visualizar usuários', description: 'Ver lista de usuários do sistema' },
  { id: 'users_create', module: 'Usuários', action: 'create', label: 'Criar usuários', description: 'Cadastrar novos usuários' },
  { id: 'users_edit', module: 'Usuários', action: 'edit', label: 'Editar usuários', description: 'Modificar dados de usuários' },
  { id: 'users_delete', module: 'Usuários', action: 'delete', label: 'Excluir usuários', description: 'Remover usuários do sistema' },
  
  // Alunos
  { id: 'students_view', module: 'Alunos', action: 'view', label: 'Visualizar alunos', description: 'Ver lista de alunos' },
  { id: 'students_create', module: 'Alunos', action: 'create', label: 'Criar alunos', description: 'Cadastrar novos alunos' },
  { id: 'students_edit', module: 'Alunos', action: 'edit', label: 'Editar alunos', description: 'Modificar dados de alunos' },
  { id: 'students_delete', module: 'Alunos', action: 'delete', label: 'Excluir alunos', description: 'Remover alunos do sistema' },
  
  // Turmas
  { id: 'classes_view', module: 'Turmas', action: 'view', label: 'Visualizar turmas', description: 'Ver lista de turmas' },
  { id: 'classes_create', module: 'Turmas', action: 'create', label: 'Criar turmas', description: 'Cadastrar novas turmas' },
  { id: 'classes_edit', module: 'Turmas', action: 'edit', label: 'Editar turmas', description: 'Modificar dados de turmas' },
  { id: 'classes_delete', module: 'Turmas', action: 'delete', label: 'Excluir turmas', description: 'Remover turmas do sistema' },
  
  // Disciplinas
  { id: 'subjects_view', module: 'Disciplinas', action: 'view', label: 'Visualizar disciplinas', description: 'Ver lista de disciplinas' },
  { id: 'subjects_create', module: 'Disciplinas', action: 'create', label: 'Criar disciplinas', description: 'Cadastrar novas disciplinas' },
  { id: 'subjects_edit', module: 'Disciplinas', action: 'edit', label: 'Editar disciplinas', description: 'Modificar dados de disciplinas' },
  { id: 'subjects_delete', module: 'Disciplinas', action: 'delete', label: 'Excluir disciplinas', description: 'Remover disciplinas do sistema' },
  
  // Notas
  { id: 'grades_view', module: 'Notas', action: 'view', label: 'Visualizar notas', description: 'Ver notas dos alunos' },
  { id: 'grades_create', module: 'Notas', action: 'create', label: 'Lançar notas', description: 'Cadastrar novas notas' },
  { id: 'grades_edit', module: 'Notas', action: 'edit', label: 'Editar notas', description: 'Modificar notas existentes' },
  { id: 'grades_delete', module: 'Notas', action: 'delete', label: 'Excluir notas', description: 'Remover notas do sistema' },
  
  // Presença
  { id: 'attendance_view', module: 'Presença', action: 'view', label: 'Visualizar presença', description: 'Ver registros de presença' },
  { id: 'attendance_create', module: 'Presença', action: 'create', label: 'Registrar presença', description: 'Fazer chamada dos alunos' },
  { id: 'attendance_edit', module: 'Presença', action: 'edit', label: 'Editar presença', description: 'Modificar registros de presença' },
  { id: 'attendance_delete', module: 'Presença', action: 'delete', label: 'Excluir presença', description: 'Remover registros de presença' },
  
  // Materiais
  { id: 'materials_view', module: 'Materiais', action: 'view', label: 'Visualizar materiais', description: 'Ver materiais didáticos' },
  { id: 'materials_create', module: 'Materiais', action: 'create', label: 'Criar materiais', description: 'Adicionar novos materiais' },
  { id: 'materials_edit', module: 'Materiais', action: 'edit', label: 'Editar materiais', description: 'Modificar materiais existentes' },
  { id: 'materials_delete', module: 'Materiais', action: 'delete', label: 'Excluir materiais', description: 'Remover materiais do sistema' },
  
  // Recados
  { id: 'messages_view', module: 'Recados', action: 'view', label: 'Visualizar recados', description: 'Ver recados e comunicados' },
  { id: 'messages_create', module: 'Recados', action: 'create', label: 'Criar recados', description: 'Enviar novos recados' },
  { id: 'messages_edit', module: 'Recados', action: 'edit', label: 'Editar recados', description: 'Modificar recados existentes' },
  { id: 'messages_delete', module: 'Recados', action: 'delete', label: 'Excluir recados', description: 'Remover recados do sistema' },
  
  // Relatórios
  { id: 'reports_view', module: 'Relatórios', action: 'view', label: 'Visualizar relatórios', description: 'Acessar relatórios do sistema' },
  { id: 'reports_create', module: 'Relatórios', action: 'create', label: 'Gerar relatórios', description: 'Criar novos relatórios' },
  { id: 'reports_edit', module: 'Relatórios', action: 'edit', label: 'Editar relatórios', description: 'Modificar relatórios existentes' },
  { id: 'reports_delete', module: 'Relatórios', action: 'delete', label: 'Excluir relatórios', description: 'Remover relatórios salvos' },
  
  // Configurações
  { id: 'settings_view', module: 'Configurações', action: 'view', label: 'Visualizar configurações', description: 'Acessar configurações do sistema' },
  { id: 'settings_create', module: 'Configurações', action: 'create', label: 'Criar configurações', description: 'Adicionar novas configurações' },
  { id: 'settings_edit', module: 'Configurações', action: 'edit', label: 'Editar configurações', description: 'Modificar configurações do sistema' },
  { id: 'settings_delete', module: 'Configurações', action: 'delete', label: 'Excluir configurações', description: 'Remover configurações' },
  
  // Auditoria
  { id: 'audit_view', module: 'Auditoria', action: 'view', label: 'Visualizar auditoria', description: 'Acessar logs de auditoria' },
  { id: 'audit_create', module: 'Auditoria', action: 'create', label: 'Criar logs', description: 'Gerar logs de auditoria' },
  { id: 'audit_edit', module: 'Auditoria', action: 'edit', label: 'Editar logs', description: 'Modificar logs de auditoria' },
  { id: 'audit_delete', module: 'Auditoria', action: 'delete', label: 'Excluir logs', description: 'Remover logs de auditoria' }
];

const defaultCategories: UserCategory[] = [
  {
    id: 'admin',
    name: 'Administrador',
    description: 'Acesso total ao sistema. Pode gerenciar todos os módulos e usuários.',
    icon: '👑',
    color: 'purple',
    permissions: availablePermissions.map(p => p.id),
    isCustom: false,
    userCount: 0
  },
  {
    id: 'professor',
    name: 'Professor',
    description: 'Acesso às suas turmas e alunos. Pode lançar notas e controlar presença.',
    icon: '👨‍🏫',
    color: 'green',
    permissions: [
      'students_view', 'classes_view', 'subjects_view',
      'grades_view', 'grades_create', 'grades_edit',
      'attendance_view', 'attendance_create', 'attendance_edit',
      'materials_view', 'materials_create', 'materials_edit',
      'messages_view', 'messages_create', 'messages_edit'
    ],
    isCustom: false,
    userCount: 0
  },
  {
    id: 'pai',
    name: 'Pai/Responsável',
    description: 'Acesso limitado aos dados dos filhos. Pode visualizar notas, agenda e recados.',
    icon: '👨‍👩‍👧‍👦',
    color: 'blue',
    permissions: [
      'students_view', 'classes_view', 'subjects_view',
      'grades_view', 'attendance_view',
      'materials_view', 'messages_view'
    ],
    isCustom: false,
    userCount: 0
  }
];

const availableIcons = ['👑', '👨‍🏫', '👨‍👩‍👧‍👦', '📋', '🏢', '📞', '📊', '🔧', '📚', '🎯', '⚙️', '🛡️'];
const availableColors = [
  { value: 'blue', label: 'Azul', class: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'green', label: 'Verde', class: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'purple', label: 'Roxo', class: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'yellow', label: 'Amarelo', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'red', label: 'Vermelho', class: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'indigo', label: 'Índigo', class: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-100 text-pink-800 border-pink-200' },
  { value: 'gray', label: 'Cinza', class: 'bg-gray-100 text-gray-800 border-gray-200' }
];

export function PermissoesPage() {
  const { user } = useAuth();
  const { isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  
  const [activeTab, setActiveTab] = useState<'categorias' | 'usuarios' | 'permissoes'>('categorias');
  const [categories, setCategories] = useState<UserCategory[]>(defaultCategories);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [userOverrides, setUserOverrides] = useState<UserPermissionOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Helper: construir link de WhatsApp a partir de um telefone brasileiro
  const buildWhatsappLink = (phone?: string, message?: string) => {
    if (!phone) return '';
    try {
      const digits = String(phone).replace(/\D/g, '');
      const withCC = digits.startsWith('55') ? digits : `55${digits}`;
      const text = message ? `?text=${encodeURIComponent(message)}` : '';
      return `https://wa.me/${withCC}${text}`;
    } catch {
      return '';
    }
  };
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<UserCategory | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '📋',
    color: 'blue',
    permissions: [] as string[],
    copyFromCategory: ''
  });
  
  const [filtros, setFiltros] = useState({
    busca: '',
    categoria: '',
    status: ''
  });

  useEffect(() => {
    fetchData();
    loadCategories();
    loadUserOverrides();
  }, []);

  useEffect(() => {
    // Escutar evento para abrir modal de nova categoria
    const handleOpenNewCategoryModal = () => {
      handleCreateCategory();
    };
    
    window.addEventListener('openNewCategoryModal', handleOpenNewCategoryModal);
    
    return () => {
      window.removeEventListener('openNewCategoryModal', handleOpenNewCategoryModal);
    };
  }, []);

  const fetchData = async () => {
    try {
      const usuariosData = await dataService.getUsuarios();
      setUsuarios(usuariosData);
      
      // Atualizar contadores de usuários nas categorias
      updateUserCounts(usuariosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = () => {
    const savedCategories = localStorage.getItem('userCategories');
    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories);
        setCategories([...defaultCategories, ...parsed.filter((c: UserCategory) => c.isCustom)]);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    }
  };

  const loadUserOverrides = () => {
    const savedOverrides = localStorage.getItem('userPermissionOverrides');
    if (savedOverrides) {
      try {
        setUserOverrides(JSON.parse(savedOverrides));
      } catch (error) {
        console.error('Erro ao carregar overrides:', error);
      }
    }
  };

  const saveCategories = () => {
    const customCategories = categories.filter(c => c.isCustom);
    localStorage.setItem('userCategories', JSON.stringify(customCategories));
  };


  const updateUserCounts = (usuariosData: any[]) => {
    setCategories(prev => prev.map(category => ({
      ...category,
      userCount: usuariosData.filter(u => u.tipo_usuario === category.id).length
    })));
  };

  const handleCreateCategory = () => {
    setCategoryForm({
      name: '',
      description: '',
      icon: '📋',
      color: 'blue',
      permissions: [],
      copyFromCategory: ''
    });
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: UserCategory) => {
    setCategoryForm({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      permissions: [...category.permissions],
      copyFromCategory: ''
    });
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) {
      setErrors({ categoryName: 'Nome da categoria é obrigatório' });
      return;
    }

    // Verificar se já existe categoria com esse nome
    const existingCategory = categories.find(c => 
      c.name.toLowerCase() === categoryForm.name.toLowerCase() && 
      c.id !== editingCategory?.id
    );
    
    if (existingCategory) {
      setErrors({ categoryName: 'Já existe uma categoria com este nome' });
      return;
    }

    if (editingCategory) {
      // Editar categoria existente
      setCategories(prev => prev.map(c => 
        c.id === editingCategory.id 
          ? {
              ...c,
              name: categoryForm.name,
              description: categoryForm.description,
              icon: categoryForm.icon,
              color: categoryForm.color,
              permissions: categoryForm.permissions
            }
          : c
      ));
    } else {
      // Criar nova categoria
      const newCategory: UserCategory = {
        id: `custom_${Date.now()}`,
        name: categoryForm.name,
        description: categoryForm.description,
        icon: categoryForm.icon,
        color: categoryForm.color,
        permissions: categoryForm.permissions,
        isCustom: true,
        userCount: 0
      };
      
      setCategories(prev => [...prev, newCategory]);
    }

    saveCategories();
    setShowCategoryModal(false);
    setErrors({});
    setSuccess(editingCategory ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    if (!category.isCustom) {
      alert('Não é possível excluir categorias padrão do sistema.');
      return;
    }

    if (category.userCount > 0) {
      alert(`Não é possível excluir a categoria "${category.name}" pois há ${category.userCount} usuário(s) vinculado(s).`);
      return;
    }

    if (confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      saveCategories();
      setSuccess('Categoria excluída com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const copyPermissionsFrom = (sourceCategoryId: string) => {
    const sourceCategory = categories.find(c => c.id === sourceCategoryId);
    if (sourceCategory) {
      setCategoryForm(prev => ({
        ...prev,
        permissions: [...sourceCategory.permissions]
      }));
    }
  };

  const togglePermission = (permissionId: string) => {
    setCategoryForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const toggleAllPermissions = (enable: boolean) => {
    setCategoryForm(prev => ({
      ...prev,
      permissions: enable ? availablePermissions.map(p => p.id) : []
    }));
  };

  const toggleModulePermissions = (module: string, enable: boolean) => {
    const modulePermissions = availablePermissions
      .filter(p => p.module === module)
      .map(p => p.id);
    
    setCategoryForm(prev => ({
      ...prev,
      permissions: enable
        ? [...prev.permissions.filter(p => !modulePermissions.includes(p)), ...modulePermissions]
        : prev.permissions.filter(p => !modulePermissions.includes(p))
    }));
  };

  const getModulePermissionCount = (module: string) => {
    const modulePermissions = availablePermissions.filter(p => p.module === module);
    const activePermissions = modulePermissions.filter(p => categoryForm.permissions.includes(p.id));
    return { active: activePermissions.length, total: modulePermissions.length };
  };

  const getColorClass = (color: string) => {
    const colorConfig = availableColors.find(c => c.value === color);
    return colorConfig?.class || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view': return <Eye className="h-3 w-3" />;
      case 'create': return <Plus className="h-3 w-3" />;
      case 'edit': return <Edit className="h-3 w-3" />;
      case 'delete': return <Trash2 className="h-3 w-3" />;
      default: return <Settings className="h-3 w-3" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'view': return 'text-blue-600';
      case 'create': return 'text-green-600';
      case 'edit': return 'text-yellow-600';
      case 'delete': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchBusca = !filtros.busca || 
      usuario.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      usuario.email.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchCategoria = !filtros.categoria || usuario.tipo_usuario === filtros.categoria;
    const matchStatus = !filtros.status || 
      (filtros.status === 'ativo' && usuario.ativo) ||
      (filtros.status === 'inativo' && !usuario.ativo);
    
    return matchBusca && matchCategoria && matchStatus;
  });

  const modules = [...new Set(availablePermissions.map(p => p.module))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              🔐 Gestão de Permissões
            </h1>
            <p className="text-gray-600 text-lg font-medium">Controle total de acesso ao sistema</p>
          </div>
        </div>
        <button
          onClick={handleCreateCategory}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-700">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'categorias', label: 'Categorias de Usuário', icon: Shield },
              { id: 'usuarios', label: 'Usuários', icon: Users },
              { id: 'permissoes', label: 'Todas as Permissões', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Aba Categorias */}
          {activeTab === 'categorias' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div 
                    key={category.id}
                    className={`border-2 rounded-xl p-6 transition-all hover:shadow-lg ${getColorClass(category.color)}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{category.icon}</div>
                        <div>
                          <h3 className="font-bold text-lg">{category.name}</h3>
                          <p className="text-sm opacity-75">{category.userCount} usuários</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {category.isCustom && (
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm opacity-90 mb-4 line-clamp-2">{category.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Permissões:</span>
                        <span className="text-sm font-bold">
                          {category.permissions.length}/{availablePermissions.length}
                        </span>
                      </div>
                      <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all"
                          style={{ 
                            width: `${(category.permissions.length / availablePermissions.length) * 100}%`,
                            backgroundColor: category.color === 'yellow' ? '#f59e0b' : 
                                           category.color === 'blue' ? '#3b82f6' :
                                           category.color === 'green' ? '#10b981' :
                                           category.color === 'purple' ? '#8b5cf6' :
                                           category.color === 'red' ? '#ef4444' : '#6b7280'
                          }}
                        ></div>
                      </div>
                    </div>

                    {!category.isCustom && (
                      <div className="mt-3 pt-3 border-t border-white border-opacity-30">
                        <span className="text-xs font-medium opacity-75">
                          🔒 Categoria padrão do sistema
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aba Usuários */}
          {activeTab === 'usuarios' && (
            <div className="space-y-6">
              {/* Filtros */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium text-gray-900">Filtros</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar usuários..."
                      value={filtros.busca}
                      onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filtros.categoria}
                    onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <select
                    value={filtros.status}
                    onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Todos os status</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              {/* Lista de Usuários */}
              <div className="space-y-4">
                {usuariosFiltrados.map((usuario) => {
                  const category = categories.find(c => c.id === usuario.tipo_usuario);
                  const hasOverrides = userOverrides.some(o => o.userId === usuario.id);
                  
                  return (
                    <div 
                      key={usuario.id}
                      className={`border-2 rounded-xl p-4 transition-all hover:shadow-md ${
                        hasOverrides 
                          ? 'border-yellow-300 bg-yellow-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {usuario.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{usuario.nome}</h3>
                            <p className="text-sm text-gray-500">{usuario.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              {category && (
                                <span className={`px-2 py-1 text-xs rounded-full border ${getColorClass(category.color)}`}>
                                  {category.icon} {category.name}
                                </span>
                              )}
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                usuario.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {usuario.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                              {hasOverrides && (
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                  ⚙️ Personalizado
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {usuario.telefone && (
                            <a
                              href={buildWhatsappLink(usuario.telefone, `Olá ${usuario.nome}`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Abrir WhatsApp"
                              className="flex items-center space-x-2 px-3 py-2 border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                            >
                              <MessageCircle className="h-4 w-4" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </a>
                          )}
                          {category && (
                            <div className="text-right mr-4">
                              <div className="text-sm font-medium text-gray-900">
                                {category.permissions.length} permissões
                              </div>
                              <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className={`h-2 rounded-full transition-all ${
                                    hasOverrides ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${(category.permissions.length / availablePermissions.length) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setEditingUser(usuario);
                              setShowUserModal(true);
                            }}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                            <span>Configurar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Aba Permissões */}
          {activeTab === 'permissoes' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                📋 Todas as Permissões do Sistema ({availablePermissions.length})
              </h3>
              
              {modules.map((module) => {
                const modulePermissions = availablePermissions.filter(p => p.module === module);
                
                return (
                  <div key={module} className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        {module === 'Usuários' && <Users className="h-5 w-5 text-blue-600" />}
                        {module === 'Alunos' && <GraduationCap className="h-5 w-5 text-blue-600" />}
                        {module === 'Turmas' && <Users className="h-5 w-5 text-blue-600" />}
                        {module === 'Disciplinas' && <BookOpen className="h-5 w-5 text-blue-600" />}
                        {module === 'Notas' && <FileText className="h-5 w-5 text-blue-600" />}
                        {module === 'Presença' && <ClipboardList className="h-5 w-5 text-blue-600" />}
                        {module === 'Materiais' && <FileText className="h-5 w-5 text-blue-600" />}
                        {module === 'Recados' && <MessageSquare className="h-5 w-5 text-blue-600" />}
                        {module === 'Relatórios' && <BarChart3 className="h-5 w-5 text-blue-600" />}
                        {module === 'Configurações' && <Settings className="h-5 w-5 text-blue-600" />}
                        {module === 'Auditoria' && <Database className="h-5 w-5 text-blue-600" />}
                      </div>
                      {module}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {modulePermissions.map((permission) => (
                        <div key={permission.id} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`p-1 rounded ${getActionColor(permission.action)}`}>
                              {getActionIcon(permission.action)}
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{permission.label}</h5>
                              <p className="text-xs text-gray-500">{permission.description}</p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {permission.id}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Categoria */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria de Usuário'}
              </h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setErrors({});
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Categoria *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.categoryName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Secretaria, Coordenação"
                  />
                  {errors.categoryName && (
                    <p className="text-red-600 text-xs mt-1">{errors.categoryName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Copiar Permissões de:
                  </label>
                  <select
                    value={categoryForm.copyFromCategory}
                    onChange={(e) => {
                      setCategoryForm({ ...categoryForm, copyFromCategory: e.target.value });
                      if (e.target.value) {
                        copyPermissionsFrom(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma categoria base</option>
                    {categories.filter(c => c.id !== editingCategory?.id).map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Descreva as responsabilidades e acesso desta categoria..."
                />
              </div>

              {/* Ícone e Cor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ícone
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {availableIcons.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setCategoryForm({ ...categoryForm, icon })}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          categoryForm.icon === icon 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <span className="text-xl">{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setCategoryForm({ ...categoryForm, color: color.value })}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          categoryForm.color === color.value 
                            ? `border-${color.value}-500 ${color.class}` 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <span className="text-sm font-medium">{color.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview da Categoria */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${getColorClass(categoryForm.color)}`}>
                  <span className="text-lg">{categoryForm.icon}</span>
                  <span className="font-medium">{categoryForm.name || 'Nome da Categoria'}</span>
                </div>
              </div>

              {/* Configuração de Permissões */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Configurar Permissões ({categoryForm.permissions.length}/{availablePermissions.length})
                  </h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleAllPermissions(true)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                      Todas
                    </button>
                    <button
                      onClick={() => toggleAllPermissions(false)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                    >
                      Nenhuma
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {modules.map((module) => {
                    const modulePermissions = availablePermissions.filter(p => p.module === module);
                    const { active, total } = getModulePermissionCount(module);
                    const allSelected = active === total;
                    const noneSelected = active === 0;
                    
                    return (
                      <div key={module} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {module === 'Usuários' && <Users className="h-4 w-4 text-blue-600" />}
                              {module === 'Alunos' && <GraduationCap className="h-4 w-4 text-blue-600" />}
                              {module === 'Turmas' && <Users className="h-4 w-4 text-blue-600" />}
                              {module === 'Disciplinas' && <BookOpen className="h-4 w-4 text-blue-600" />}
                              {module === 'Notas' && <FileText className="h-4 w-4 text-blue-600" />}
                              {module === 'Presença' && <ClipboardList className="h-4 w-4 text-blue-600" />}
                              {module === 'Materiais' && <FileText className="h-4 w-4 text-blue-600" />}
                              {module === 'Recados' && <MessageSquare className="h-4 w-4 text-blue-600" />}
                              {module === 'Relatórios' && <BarChart3 className="h-4 w-4 text-blue-600" />}
                              {module === 'Configurações' && <Settings className="h-4 w-4 text-blue-600" />}
                              {module === 'Auditoria' && <Database className="h-4 w-4 text-blue-600" />}
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{module}</h5>
                              <p className="text-sm text-gray-500">{active}/{total} permissões</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleModulePermissions(module, true)}
                              disabled={allSelected}
                              className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors disabled:opacity-50"
                            >
                              Todas
                            </button>
                            <button
                              onClick={() => toggleModulePermissions(module, false)}
                              disabled={noneSelected}
                              className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors disabled:opacity-50"
                            >
                              Nenhuma
                            </button>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${(active / total) * 100}%` }}
                          ></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {modulePermissions.map((permission) => (
                            <label 
                              key={permission.id}
                              className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={categoryForm.permissions.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <div className={`p-1 rounded ${getActionColor(permission.action)}`}>
                                {getActionIcon(permission.action)}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm">{permission.label}</div>
                                <div className="text-xs text-gray-500">{permission.description}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setErrors({});
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Usuário */}
      {showUserModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {editingUser.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Configurar Permissões - {editingUser.nome}
                  </h3>
                  <p className="text-sm text-gray-500">{editingUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Configuração Individual de Usuário</p>
                <p className="text-sm mt-2">Esta funcionalidade será implementada em breve</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}