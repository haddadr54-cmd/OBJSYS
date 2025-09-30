class e{constructor(){this.isInitialized=!1,this.init()}static getInstance(){return e.instance||(e.instance=new e),e.instance}init(){this.isInitialized||(this.applyAntiFlashCSS(),this.setupBodyClasses(),this.isInitialized=!0)}applyAntiFlashCSS(){const t=document.createElement("style");t.textContent=`
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
    `,document.head.insertBefore(t,document.head.firstChild)}setupBodyClasses(){document.body.classList.remove("loaded"),requestAnimationFrame(()=>{setTimeout(()=>{document.body.classList.add("app-loaded")},10)})}markContentReady(t){const i=t||document.body;i.classList.remove("loading-content"),i.classList.add("content-ready")}markContentLoading(t){const i=t||document.body;i.classList.add("loading-content"),i.classList.remove("content-ready")}}const n=e.getInstance();export{e as AntiFlash,n as antiFlash};
