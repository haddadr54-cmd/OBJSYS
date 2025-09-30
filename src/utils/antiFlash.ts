/**
 * Utilitários para prevenir flash de carregamento (FOUC - Flash of Unstyled Content)
 */

export class AntiFlash {
  private static instance: AntiFlash;
  private isInitialized = false;

  private constructor() {
    this.init();
  }

  public static getInstance(): AntiFlash {
    if (!AntiFlash.instance) {
      AntiFlash.instance = new AntiFlash();
    }
    return AntiFlash.instance;
  }

  private init(): void {
    if (this.isInitialized) return;
    
    // Aplicar CSS anti-flash imediatamente
    this.applyAntiFlashCSS();
    
    // Configurar body para evitar flash
    this.setupBodyClasses();
    
    this.isInitialized = true;
  }

  private applyAntiFlashCSS(): void {
    const style = document.createElement('style');
    style.textContent = `
      /* Anti-Flash Critical CSS */
      body:not(.app-loaded) {
        visibility: hidden !important;
      }
      
      body.app-loaded {
        visibility: visible !important;
        opacity: 1 !important;
        transition: opacity 0.1s ease-in-out;
      }
      
      /* Previne flash em elementos carregados dinamicamente */
      .loading-content {
        opacity: 0;
        transition: opacity 0.15s ease-in-out;
      }
      
      .content-ready {
        opacity: 1;
      }
    `;
    document.head.insertBefore(style, document.head.firstChild);
  }

  private setupBodyClasses(): void {
    // Remove classe loaded antiga se existir
    document.body.classList.remove('loaded');
    
    // Adiciona nova classe app-loaded após breve delay
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.body.classList.add('app-loaded');
      }, 10);
    });
  }

  public markContentReady(element?: HTMLElement): void {
    const target = element || document.body;
    target.classList.remove('loading-content');
    target.classList.add('content-ready');
  }

  public markContentLoading(element?: HTMLElement): void {
    const target = element || document.body;
    target.classList.add('loading-content');
    target.classList.remove('content-ready');
  }
}

// Singleton instance
export const antiFlash = AntiFlash.getInstance();