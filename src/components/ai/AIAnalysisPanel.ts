import { AnalysisType } from '../../api/ai-service';
import './ai-analysis-panel.css';

export class AIAnalysisPanel {
  private container: HTMLDivElement;
  private analysisContentDom: HTMLDivElement;
  private analyzeCallback: (text: string, analysisType: AnalysisType) => Promise<void>;
  private isVisible = false;
  
  constructor(
    containerSelector: string,
    analyzeCallback: (text: string, analysisType: AnalysisType) => Promise<void>
  ) {
    this.container = document.querySelector<HTMLDivElement>(containerSelector)!;
    this.analyzeCallback = analyzeCallback;
    this.init();
  }
  
  private init() {
    // Create panel HTML structure
    this.container.innerHTML = `
      <div class="ai-analysis-panel">
        <div class="ai-analysis-panel__header">
          <div class="ai-analysis-panel__title">AI Analysis</div>
          <div class="ai-analysis-panel__controls">
            <button class="ai-analysis-panel__analyze-btn" data-type="${AnalysisType.SUMMARY}">Summary</button>
            <button class="ai-analysis-panel__analyze-btn" data-type="${AnalysisType.FEEDBACK}">Feedback</button>
            <button class="ai-analysis-panel__analyze-btn" data-type="${AnalysisType.GRAMMAR}">Grammar</button>
            <button class="ai-analysis-panel__analyze-btn" data-type="${AnalysisType.STYLE}">Style</button>
          </div>
          <i class="ai-analysis-panel__close"></i>
        </div>
        <div class="ai-analysis-panel__content">
          <div class="ai-analysis-panel__placeholder">
            Select text and click an analysis type above to analyze your content
          </div>
          <div class="ai-analysis-panel__result" style="display: none;">
            <div class="ai-analysis-panel__loading" style="display: none;">
              Analyzing your text...
            </div>
            <div class="ai-analysis-panel__analysis"></div>
            <div class="ai-analysis-panel__suggestions"></div>
          </div>
        </div>
      </div>
    `;
    
    // Store references to important elements
    this.analysisContentDom = this.container.querySelector('.ai-analysis-panel__result')!;
    
    // Add event listeners
    this.container.querySelector('.ai-analysis-panel__close')!.addEventListener('click', () => {
      this.toggle(false);
    });
    
    // Add click handlers for analysis buttons
    const analyzeButtons = this.container.querySelectorAll<HTMLButtonElement>('.ai-analysis-panel__analyze-btn');
    analyzeButtons.forEach(button => {
      button.addEventListener('click', async () => {
        const analysisType = button.dataset.type as AnalysisType;
        this.showLoading(true);
        
        try {
          await this.analyzeCallback('', analysisType);
        } catch (error) {
          this.showError(error.message || 'Failed to analyze text');
        } finally {
          this.showLoading(false);
        }
      });
    });
  }
  
  public toggle(show?: boolean) {
    this.isVisible = show !== undefined ? show : !this.isVisible;
    this.container.style.display = this.isVisible ? 'block' : 'none';
    
    // Reset the content when hiding
    if (!this.isVisible) {
      this.reset();
    }
    
    return this.isVisible;
  }
  
  public reset() {
    const placeholderDom = this.container.querySelector<HTMLDivElement>('.ai-analysis-panel__placeholder')!;
    placeholderDom.style.display = 'block';
    this.analysisContentDom.style.display = 'none';
  }
  
  public showLoading(isLoading: boolean) {
    const loadingDom = this.container.querySelector<HTMLDivElement>('.ai-analysis-panel__loading')!;
    loadingDom.style.display = isLoading ? 'block' : 'none';
    
    // Hide the placeholder when loading
    const placeholderDom = this.container.querySelector<HTMLDivElement>('.ai-analysis-panel__placeholder')!;
    placeholderDom.style.display = isLoading ? 'none' : 'none';
    
    // Show the result container when loading
    this.analysisContentDom.style.display = isLoading ? 'block' : 'block';
  }
  
  public showError(message: string) {
    const analysisDom = this.container.querySelector<HTMLDivElement>('.ai-analysis-panel__analysis')!;
    analysisDom.innerHTML = `<div class="ai-analysis-panel__error">${message}</div>`;
    
    const suggestionsDom = this.container.querySelector<HTMLDivElement>('.ai-analysis-panel__suggestions')!;
    suggestionsDom.innerHTML = '';
  }
  
  public updateResults(analysis: string, suggestions?: string[]) {
    // Hide placeholder, show results
    const placeholderDom = this.container.querySelector<HTMLDivElement>('.ai-analysis-panel__placeholder')!;
    placeholderDom.style.display = 'none';
    this.analysisContentDom.style.display = 'block';
    
    // Update analysis text
    const analysisDom = this.container.querySelector<HTMLDivElement>('.ai-analysis-panel__analysis')!;
    analysisDom.innerHTML = analysis;
    
    // Update suggestions if provided
    const suggestionsDom = this.container.querySelector<HTMLDivElement>('.ai-analysis-panel__suggestions')!;
    if (suggestions && suggestions.length) {
      let suggestionsHtml = '<h4>Suggestions:</h4><ul>';
      suggestions.forEach(suggestion => {
        suggestionsHtml += `<li>${suggestion}</li>`;
      });
      suggestionsHtml += '</ul>';
      suggestionsDom.innerHTML = suggestionsHtml;
    } else {
      suggestionsDom.innerHTML = '';
    }
  }
}