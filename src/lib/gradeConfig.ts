/**
 * Configurações relacionadas ao sistema de notas e avaliações
 * 
 * Este arquivo centraliza todas as configurações de notas para facilitar
 * a manutenção e garantir consistência em todo o sistema.
 */

// ================================
// CONFIGURAÇÕES DE MÉDIA E APROVAÇÃO
// ================================

/**
 * Média mínima para aprovação
 * Valor padrão: 7.0 (sete vírgula zero)
 */
export const MEDIA_MINIMA_APROVACAO = 7.0;

/**
 * Média mínima para recuperação
 * Alunos entre esta nota e a média de aprovação ficam em recuperação
 * Valor padrão: 5.0 (cinco vírgula zero)
 */
export const MEDIA_MINIMA_RECUPERACAO = 5.0;

/**
 * Valor máximo de uma nota
 * Valor padrão: 10.0 (dez vírgula zero)
 */
export const NOTA_MAXIMA = 10.0;

/**
 * Valor mínimo de uma nota
 * Valor padrão: 0.0 (zero vírgula zero)
 */
export const NOTA_MINIMA = 0.0;

// ================================
// FUNÇÕES AUXILIARES
// ================================

/**
 * Determina a situação acadêmica do aluno baseada na média
 * @param media - Média do aluno
 * @returns Objeto com status, cor e ícone
 */
export const getSituacaoAcademica = (media: number) => {
  if (media >= MEDIA_MINIMA_APROVACAO) {
    return {
      status: 'Aprovado',
      color: 'green',
      icon: '✅',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      gradientFrom: 'from-green-400',
      gradientTo: 'to-green-600'
    };
  } else if (media >= MEDIA_MINIMA_RECUPERACAO) {
    return {
      status: 'Recuperação',
      color: 'yellow',
      icon: '⚠️',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      gradientFrom: 'from-yellow-400',
      gradientTo: 'to-yellow-600'
    };
  } else {
    return {
      status: 'Reprovado',
      color: 'red',
      icon: '❌',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      gradientFrom: 'from-red-400',
      gradientTo: 'to-red-600'
    };
  }
};

/**
 * Determina a classe CSS para cor do texto baseada na nota
 * @param nota - Valor da nota
 * @returns String com a classe CSS
 */
export const getNotaTextColor = (nota: number): string => {
  if (nota >= MEDIA_MINIMA_APROVACAO) return 'text-green-600';
  if (nota >= MEDIA_MINIMA_RECUPERACAO) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * Determina a classe CSS para cor de fundo baseada na nota
 * @param nota - Valor da nota
 * @returns String com a classe CSS
 */
export const getNotaBgColor = (nota: number): string => {
  if (nota >= MEDIA_MINIMA_APROVACAO) return 'bg-green-500';
  if (nota >= MEDIA_MINIMA_RECUPERACAO) return 'bg-yellow-500';
  return 'bg-red-500';
};

/**
 * Determina classes CSS para gradiente baseado na média
 * @param media - Valor da média
 * @returns String com classes CSS de gradiente
 */
export const getMediaGradientClasses = (media: number): string => {
  if (media >= MEDIA_MINIMA_APROVACAO) {
    return 'bg-gradient-to-r from-green-400 to-green-600 text-white';
  }
  if (media >= MEDIA_MINIMA_RECUPERACAO) {
    return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
  }
  return 'bg-gradient-to-r from-red-400 to-red-600 text-white';
};

/**
 * Determina classes CSS para texto baseado na média
 * @param media - Valor da média
 * @returns String com classes CSS de cor de texto
 */
export const getMediaTextColorClasses = (media: number): string => {
  if (media >= MEDIA_MINIMA_APROVACAO) return 'text-green-700';
  if (media >= MEDIA_MINIMA_RECUPERACAO) return 'text-yellow-700';
  return 'text-red-700';
};

/**
 * Determina classes CSS para border e background baseado na nota
 * @param nota - Valor da nota
 * @returns String com classes CSS
 */
export const getNotaBorderBgClasses = (nota: number): string => {
  if (nota >= MEDIA_MINIMA_APROVACAO) {
    return 'border-green-200 bg-green-50';
  }
  if (nota >= MEDIA_MINIMA_RECUPERACAO) {
    return 'border-yellow-200 bg-yellow-50';
  }
  return 'border-red-200 bg-red-50';
};

/**
 * Verifica se um aluno foi aprovado
 * @param media - Média do aluno
 * @returns Boolean indicando aprovação
 */
export const isAprovado = (media: number): boolean => {
  return media >= MEDIA_MINIMA_APROVACAO;
};

/**
 * Verifica se um aluno está em recuperação
 * @param media - Média do aluno
 * @returns Boolean indicando recuperação
 */
export const isRecuperacao = (media: number): boolean => {
  return media >= MEDIA_MINIMA_RECUPERACAO && media < MEDIA_MINIMA_APROVACAO;
};

/**
 * Verifica se um aluno foi reprovado
 * @param media - Média do aluno
 * @returns Boolean indicando reprovação
 */
export const isReprovado = (media: number): boolean => {
  return media < MEDIA_MINIMA_RECUPERACAO;
};

/**
 * Valida se uma nota está dentro do intervalo permitido
 * @param nota - Valor da nota a ser validada
 * @returns Boolean indicando se a nota é válida
 */
export const isNotaValida = (nota: number): boolean => {
  return nota >= NOTA_MINIMA && nota <= NOTA_MAXIMA;
};

/**
 * Formata uma nota para exibição (1 casa decimal)
 * @param nota - Valor da nota
 * @returns String formatada
 */
export const formatarNota = (nota: number): string => {
  return nota.toFixed(1);
};

// ================================
// CONFIGURAÇÕES DE EXIBIÇÃO
// ================================

/**
 * Configurações para mensagens do sistema
 */
export const MENSAGENS_SISTEMA = {
  aprovacao: {
    titulo: 'Parabéns! 🎉',
    descricao: 'Aluno aprovado com média igual ou superior a 7,0'
  },
  recuperacao: {
    titulo: 'Atenção ⚠️',
    descricao: 'Aluno em recuperação (média entre 5,0 e 6,9)'
  },
  reprovacao: {
    titulo: 'Necessita Atenção ❌',
    descricao: 'Aluno com média abaixo de 5,0'
  }
};

/**
 * Configurações para tooltips explicativos
 */
export const TOOLTIPS = {
  mediaAprovacao: `Média mínima para aprovação: ${MEDIA_MINIMA_APROVACAO}`,
  mediaRecuperacao: `Média para recuperação: ${MEDIA_MINIMA_RECUPERACAO} a ${(MEDIA_MINIMA_APROVACAO - 0.1).toFixed(1)}`,
  mediaReprovacao: `Média de reprovação: Abaixo de ${MEDIA_MINIMA_RECUPERACAO}`
};

// Validação de período letivo
export const isWithinAcademicPeriod = (date: Date, periodStart: Date, periodEnd: Date): boolean => {
  return date >= periodStart && date <= periodEnd;
};

// Obter período letivo atual
export const getCurrentAcademicPeriod = (periodos: any[]): any | null => {
  const today = new Date();
  return periodos.find(periodo => {
    const start = new Date(periodo.data_inicio);
    const end = new Date(periodo.data_fim);
    return periodo.ativo && isWithinAcademicPeriod(today, start, end);
  }) || null;
};

// Validar se uma nota pode ser lançada no período atual
export const canSubmitGradeInPeriod = (periodos: any[], gradeDate: Date = new Date()): {
  canSubmit: boolean;
  period: any | null;
  message: string;
} => {
  const currentPeriod = getCurrentAcademicPeriod(periodos);
  
  if (!currentPeriod) {
    return {
      canSubmit: false,
      period: null,
      message: 'Nenhum período letivo ativo no momento. Configure um período para lançar notas.'
    };
  }

  const periodStart = new Date(currentPeriod.data_inicio);
  const periodEnd = new Date(currentPeriod.data_fim);
  
  if (!isWithinAcademicPeriod(gradeDate, periodStart, periodEnd)) {
    return {
      canSubmit: false,
      period: currentPeriod,
      message: `As notas só podem ser lançadas dentro do período ${currentPeriod.nome} (${formatDateBR(periodStart)} - ${formatDateBR(periodEnd)}).`
    };
  }

  return {
    canSubmit: true,
    period: currentPeriod,
    message: `Período ativo: ${currentPeriod.nome}`
  };
};

// Formatar data para exibição em português brasileiro
const formatDateBR = (date: Date): string => {
  return date.toLocaleDateString('pt-BR');
};

export default {
  MEDIA_MINIMA_APROVACAO,
  MEDIA_MINIMA_RECUPERACAO,
  NOTA_MAXIMA,
  NOTA_MINIMA,
  getSituacaoAcademica,
  getNotaTextColor,
  getNotaBgColor,
  getMediaGradientClasses,
  getMediaTextColorClasses,
  getNotaBorderBgClasses,
  isAprovado,
  isRecuperacao,
  isReprovado,
  isNotaValida,
  formatarNota,
  isWithinAcademicPeriod,
  getCurrentAcademicPeriod,
  canSubmitGradeInPeriod,
  MENSAGENS_SISTEMA,
  TOOLTIPS
};