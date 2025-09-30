-- ===================================================================
-- DADOS INICIAIS - SISTEMA OBJETIVO EDUCACIONAL
-- Executer APÓS o schema.sql
-- ===================================================================

-- ===================================================================
-- 1. INSERIR USUÁRIOS INICIAIS
-- ===================================================================

-- Administrador
INSERT INTO usuarios (id, nome, email, senha, tipo_usuario, telefone, ativo) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Administrador Sistema', 'admin@objetivo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '(11) 99999-0001', true);

-- Professores
INSERT INTO usuarios (id, nome, email, senha, tipo_usuario, telefone, ativo) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Prof. Maria Silva', 'professor@objetivo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'professor', '(11) 99999-0002', true),
('550e8400-e29b-41d4-a716-446655440003', 'Prof. João Santos', 'joao.professor@objetivo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'professor', '(11) 99999-0003', true),
('550e8400-e29b-41d4-a716-446655440004', 'Prof. Ana Costa', 'ana.professor@objetivo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'professor', '(11) 99999-0004', true);

-- Pais/Responsáveis
INSERT INTO usuarios (id, nome, email, senha, tipo_usuario, telefone, ativo) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'Carlos Oliveira', 'pai@objetivo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pai', '(11) 99999-0005', true),
('550e8400-e29b-41d4-a716-446655440006', 'Marina Souza', 'marina.pai@objetivo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pai', '(11) 99999-0006', true),
('550e8400-e29b-41d4-a716-446655440007', 'Roberto Lima', 'roberto.pai@objetivo.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pai', '(11) 99999-0007', true);

-- ===================================================================
-- 2. CRIAR PERÍODO LETIVO ATIVO
-- ===================================================================
INSERT INTO periodos_letivos (id, nome, tipo, data_inicio, data_fim, ano_letivo, ativo) VALUES
('650e8400-e29b-41d4-a716-446655440001', '1º Bimestre 2025', 'bimestre', '2025-02-01', '2025-04-15', 2025, true),
('650e8400-e29b-41d4-a716-446655440002', '2º Bimestre 2025', 'bimestre', '2025-04-16', '2025-06-30', 2025, false),
('650e8400-e29b-41d4-a716-446655440003', '3º Bimestre 2025', 'bimestre', '2025-08-01', '2025-10-15', 2025, false),
('650e8400-e29b-41d4-a716-446655440004', '4º Bimestre 2025', 'bimestre', '2025-10-16', '2025-12-20', 2025, false);

-- ===================================================================
-- 3. CRIAR TURMAS
-- ===================================================================
INSERT INTO turmas (id, nome, serie, turno, ano_letivo, capacidade, descricao, ativa) VALUES
('750e8400-e29b-41d4-a716-446655440001', '6º Ano A', '6º Ano', 'Manhã', '2025', 30, 'Turma do 6º ano do ensino fundamental - Manhã', true),
('750e8400-e29b-41d4-a716-446655440002', '6º Ano B', '6º Ano', 'Tarde', '2025', 28, 'Turma do 6º ano do ensino fundamental - Tarde', true),
('750e8400-e29b-41d4-a716-446655440003', '7º Ano A', '7º Ano', 'Manhã', '2025', 32, 'Turma do 7º ano do ensino fundamental - Manhã', true),
('750e8400-e29b-41d4-a716-446655440004', '8º Ano A', '8º Ano', 'Tarde', '2025', 25, 'Turma do 8º ano do ensino fundamental - Tarde', true);

-- ===================================================================
-- 4. CRIAR DISCIPLINAS
-- ===================================================================
INSERT INTO disciplinas (id, nome, codigo, cor, turma_id, professor_id, ativa) VALUES
-- 6º Ano A
('850e8400-e29b-41d4-a716-446655440001', 'Matemática', 'MAT6A', '#ef4444', '750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', true),
('850e8400-e29b-41d4-a716-446655440002', 'Português', 'POR6A', '#3b82f6', '750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', true),
('850e8400-e29b-41d4-a716-446655440003', 'História', 'HIS6A', '#10b981', '750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', true),
('850e8400-e29b-41d4-a716-446655440004', 'Geografia', 'GEO6A', '#f59e0b', '750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', true),

-- 6º Ano B
('850e8400-e29b-41d4-a716-446655440005', 'Matemática', 'MAT6B', '#ef4444', '750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', true),
('850e8400-e29b-41d4-a716-446655440006', 'Português', 'POR6B', '#3b82f6', '750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', true),

-- 7º Ano A
('850e8400-e29b-41d4-a716-446655440007', 'Matemática', 'MAT7A', '#ef4444', '750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', true),
('850e8400-e29b-41d4-a716-446655440008', 'Português', 'POR7A', '#3b82f6', '750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', true);

-- ===================================================================
-- 5. CRIAR ALUNOS
-- ===================================================================
INSERT INTO alunos (id, nome, data_nascimento, matricula, turma_id, endereco, ativo) VALUES
-- 6º Ano A
('950e8400-e29b-41d4-a716-446655440001', 'Ana Beatriz Silva', '2013-03-15', '2025001', '750e8400-e29b-41d4-a716-446655440001', 'Rua das Flores, 123', true),
('950e8400-e29b-41d4-a716-446655440002', 'Carlos Eduardo Santos', '2013-07-22', '2025002', '750e8400-e29b-41d4-a716-446655440001', 'Av. Principal, 456', true),
('950e8400-e29b-41d4-a716-446655440003', 'Maria Fernanda Costa', '2013-01-10', '2025003', '750e8400-e29b-41d4-a716-446655440001', 'Rua do Sol, 789', true),

-- 6º Ano B
('950e8400-e29b-41d4-a716-446655440004', 'Pedro Henrique Lima', '2013-05-08', '2025004', '750e8400-e29b-41d4-a716-446655440002', 'Rua Nova, 321', true),
('950e8400-e29b-41d4-a716-446655440005', 'Julia Santos Oliveira', '2013-09-12', '2025005', '750e8400-e29b-41d4-a716-446655440002', 'Av. Central, 654', true),

-- 7º Ano A
('950e8400-e29b-41d4-a716-446655440006', 'Rafael Souza Lima', '2012-04-18', '2025006', '750e8400-e29b-41d4-a716-446655440003', 'Rua Verde, 987', true),
('950e8400-e29b-41d4-a716-446655440007', 'Isabela Costa Santos', '2012-11-25', '2025007', '750e8400-e29b-41d4-a716-446655440003', 'Av. Brasil, 147', true);

-- ===================================================================
-- 6. VINCULAR RESPONSÁVEIS AOS ALUNOS
-- ===================================================================
INSERT INTO responsaveis (aluno_id, usuario_id, parentesco, principal) VALUES
-- Carlos Oliveira (pai@objetivo.com) responsável por Ana e Carlos Eduardo
('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'Pai', true),
('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'Pai', true),

-- Marina Souza responsável por Maria Fernanda e Pedro Henrique
('950e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', 'Mãe', true),
('950e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440006', 'Mãe', true),

-- Roberto Lima responsável por Julia, Rafael e Isabela
('950e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440007', 'Pai', true),
('950e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440007', 'Pai', true),
('950e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', 'Pai', true);

-- ===================================================================
-- 7. INSERIR ALGUMAS NOTAS DE EXEMPLO
-- ===================================================================
INSERT INTO notas (aluno_id, disciplina_id, trimestre, nota, comentario, professor_id, data_lancamento) VALUES
-- Ana Beatriz - 6º A
('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 1, 8.5, 'Excelente desempenho em matemática', '550e8400-e29b-41d4-a716-446655440002', '2025-03-15'),
('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', 1, 9.0, 'Ótima participação em português', '550e8400-e29b-41d4-a716-446655440003', '2025-03-20'),

-- Carlos Eduardo - 6º A
('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', 1, 7.0, 'Precisa melhorar na resolução de problemas', '550e8400-e29b-41d4-a716-446655440002', '2025-03-15'),
('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440002', 1, 8.0, 'Bom desenvolvimento na leitura', '550e8400-e29b-41d4-a716-446655440003', '2025-03-20'),

-- Maria Fernanda - 6º A
('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', 1, 6.5, 'Necessita reforço em matemática', '550e8400-e29b-41d4-a716-446655440002', '2025-03-15'),
('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440003', 1, 8.5, 'Excelente interesse em história', '550e8400-e29b-41d4-a716-446655440004', '2025-03-25');

-- ===================================================================
-- 8. INSERIR PRESENÇAS DE EXEMPLO
-- ===================================================================
INSERT INTO presencas (aluno_id, disciplina_id, data_aula, presente, professor_id) VALUES
-- Semana 1 - Março 2025
('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '2025-03-10', true, '550e8400-e29b-41d4-a716-446655440002'),
('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', '2025-03-11', true, '550e8400-e29b-41d4-a716-446655440003'),
('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', '2025-03-10', false, '550e8400-e29b-41d4-a716-446655440002'),
('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440002', '2025-03-11', true, '550e8400-e29b-41d4-a716-446655440003');

-- ===================================================================
-- 9. INSERIR RECADOS DE EXEMPLO
-- ===================================================================
INSERT INTO recados (id, titulo, conteudo, tipo, prioridade, destinatario_tipo, remetente_id, data_expiracao) VALUES
('a50e8400-e29b-41d4-a716-446655440001', 'Bem-vindos ao Sistema Objetivo!', 'Prezados pais e responsáveis, seja bem-vindos ao nosso sistema educacional online! Aqui vocês poderão acompanhar o desenvolvimento dos seus filhos em tempo real.', 'geral', 'alta', 'todos', '550e8400-e29b-41d4-a716-446655440001', '2025-12-31'),
('a50e8400-e29b-41d4-a716-446655440002', 'Reunião de Pais - 6º Ano', 'Convocamos todos os pais do 6º ano para reunião no dia 15/10/2025 às 19h. Assunto: Planejamento do 4º bimestre.', 'reuniao', 'normal', 'pais', '550e8400-e29b-41d4-a716-446655440002', '2025-10-15'),
('a50e8400-e29b-41d4-a716-446655440003', 'Feriado Prolongado', 'Informamos que nos dias 12 e 15 de outubro não haverá aulas devido ao feriado prolongado. Retornaremos normalmente dia 16/10.', 'comunicado', 'normal', 'todos', '550e8400-e29b-41d4-a716-446655440001', '2025-10-16');

-- ===================================================================
-- 10. INSERIR MATERIAIS DE EXEMPLO
-- ===================================================================
INSERT INTO materiais (titulo, descricao, tipo, disciplina_id, professor_id, publico) VALUES
('Lista de Exercícios - Frações', 'Exercícios complementares sobre frações para fixação do conteúdo', 'exercicio', '850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', true),
('Livro de Leitura - Setembro', 'Livro escolhido para leitura obrigatória do mês de setembro', 'livro', '850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', true),
('Apresentação - Brasil Colônia', 'Slides utilizados na aula sobre o período colonial brasileiro', 'apresentacao', '850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', true);

-- ===================================================================
-- 11. INSERIR PROVAS E TAREFAS
-- ===================================================================
INSERT INTO provas_tarefas (titulo, descricao, tipo, disciplina_id, data_realizacao, valor_maximo) VALUES
('Prova Bimestral - Matemática', 'Avaliação do 1º bimestre contemplando frações, decimais e porcentagem', 'prova', '850e8400-e29b-41d4-a716-446655440001', '2025-04-10', 10.0),
('Redação - Meio Ambiente', 'Produção textual sobre preservação ambiental', 'trabalho', '850e8400-e29b-41d4-a716-446655440002', '2025-04-08', 8.0),
('Seminário - Região Nordeste', 'Apresentação em grupo sobre características da região nordeste', 'seminario', '850e8400-e29b-41d4-a716-446655440004', '2025-04-12', 10.0);

-- ===================================================================
-- DADOS INICIAIS INSERIDOS COM SUCESSO!
-- ===================================================================

-- Verificar dados inseridos
SELECT 'Usuários' as tabela, count(*) as total FROM usuarios
UNION ALL
SELECT 'Alunos' as tabela, count(*) as total FROM alunos
UNION ALL
SELECT 'Turmas' as tabela, count(*) as total FROM turmas
UNION ALL
SELECT 'Disciplinas' as tabela, count(*) as total FROM disciplinas
UNION ALL
SELECT 'Notas' as tabela, count(*) as total FROM notas
UNION ALL
SELECT 'Presenças' as tabela, count(*) as total FROM presencas
UNION ALL
SELECT 'Recados' as tabela, count(*) as total FROM recados
UNION ALL
SELECT 'Materiais' as tabela, count(*) as total FROM materiais
UNION ALL
SELECT 'Provas/Tarefas' as tabela, count(*) as total FROM provas_tarefas;

-- Mostrar dados de login
SELECT 
    'DADOS DE LOGIN' as info,
    '' as email,
    '' as senha,
    '' as tipo
UNION ALL
SELECT 
    '=================' as info,
    '' as email,
    '' as senha,
    '' as tipo
UNION ALL
SELECT 
    'Admin' as info,
    'admin@objetivo.com' as email,
    'admin123' as senha,
    'admin' as tipo
UNION ALL
SELECT 
    'Professor' as info,
    'professor@objetivo.com' as email,
    'prof123' as senha,
    'professor' as tipo
UNION ALL
SELECT 
    'Pai/Responsável' as info,
    'pai@objetivo.com' as email,
    'pai123' as senha,
    'pai' as tipo;